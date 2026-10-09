/**
 * Awaited publication of a SEALED generation + exact readback. No distributed transaction is assumed:
 * INSERT acknowledgement is not admission; only a full readback match (ids, per-row semantics, row multiplicity,
 * bindings, coverage, manifest/context) lets the journal advance to readback_confirmed.
 */
import { randomUUID } from 'node:crypto';
import type {
  EventBinding,
  GenerationReceipt,
  PinnedManifest,
  RawObservation,
  ReadbackResult,
  SessionCoverage,
} from '../../shared/contracts.js';
import {
  allowanceProjection,
  bindingDigest,
  bindingProjection,
  canonicalize,
  coverageDigest,
  coverageProjection,
  manifestDigest,
  semanticDigest,
} from '../../core/canonicalize.js';
import { canonicalJson, cmp } from '../../core/hash.js';
import { fromClickHouseDateTime64, nowUtcNano, parseUtcNano, toClickHouseDateTime64, formatUtcNano } from '../../core/time.js';
import type { ChServices } from './client.js';

export class GenerationAlreadyPublishedError extends Error {}

export interface PublishBundle {
  generation: GenerationReceipt;
  manifest: PinnedManifest;
  observations: RawObservation[];
  bindings: EventBinding[];
  coverage: SessionCoverage[];
}

const chTs = (t: string | null): string | null => (t === null ? null : toClickHouseDateTime64(parseUtcNano(t)));
const chNs = (ns: string | null): string | null => (ns === null ? null : toClickHouseDateTime64(BigInt(ns)));

export function observationRow(generationId: string, o: RawObservation): Record<string, unknown> {
  return {
    generation_id: generationId,
    fetch_record_id: o.fetchRecordId,
    observation_id: o.observationId,
    identity_domain: o.identityDomain,
    native_identity_key: o.nativeIdentityKey,
    workspace_id: o.workspaceId,
    session_id: o.sessionId,
    native_event_id: o.nativeEventId,
    native_task_id: o.nativeTaskId,
    credential_id: o.credentialId,
    operation: o.operation,
    decision: o.decision,
    reason_code: o.reasonCode,
    created_at_raw: o.createdAtRaw,
    created_at: chNs(o.createdAtNs),
    unit_mapping_version: o.unitMappingVersion,
    semantic_json: o.semanticJson,
    observed_at: chTs(o.observedAt),
    source_ref: o.pageRef,
    content_sha256: o.contentSha256,
  };
}

function allowanceRows(m: PinnedManifest): Array<Record<string, unknown>> {
  const d = m.document;
  return d.allowances.map((a) => ({
    manifest_hash: m.sha256,
    manifest_ref: m.immutableRef,
    policy_version: d.policyVersion,
    workspace_id: d.workspaceId,
    credential_id: d.credentialId,
    operation: d.operation,
    policy_subject_id: a.policySubjectId,
    max_unique_allow_decisions: a.maxUniqueAllowDecisions,
    window_seconds: d.windowSeconds,
    effective_from: chTs(d.effectiveFrom),
    effective_until: chTs(d.effectiveUntil),
    approval_ref: a.approvalRef,
  }));
}

export class Publisher {
  constructor(
    private readonly ch: ChServices,
    private readonly provenance: GenerationReceipt['provenance'],
  ) {}

  private async count(table: string, where: string, params: Record<string, string>): Promise<number> {
    const rs = await this.ch.collector.query({ query: `SELECT toString(count()) AS n FROM ${table} WHERE ${where}`, query_params: params, format: 'JSONEachRow' });
    const rows = await rs.json<{ n: string }>();
    return Number(rows[0]?.n ?? '0');
  }

  /** Insert all rows of a sealed generation. Refuses ids that already have rows (retry = fresh generation). */
  async insert(b: PublishBundle): Promise<string> {
    const g = b.generation;
    if (g.state !== 'sealed') throw new Error(`generation ${g.generationId} must be sealed before publication (is ${g.state})`);
    if (await this.count('native_event_versions', 'generation_id = {g:String}', { g: g.generationId })) {
      throw new GenerationAlreadyPublishedError(`generation ${g.generationId} already has rows in ClickHouse; retry with a fresh generation id`);
    }
    await this.insertRaw(b);
    return nowUtcNano();
  }

  /** Unguarded insert (used by insert() and by tests that inject faults). */
  async insertRaw(b: PublishBundle): Promise<void> {
    const g = b.generation;
    const c = this.ch.collector;
    const settings = { date_time_input_format: 'best_effort' as const };
    const ins = async (table: string, values: Array<Record<string, unknown>>) => {
      if (values.length === 0) return;
      await c.insert({ table, values, format: 'JSONEachRow', clickhouse_settings: settings });
    };
    await ins('native_event_versions', b.observations.map((o) => observationRow(g.generationId, o)));
    await ins('session_snapshots', b.coverage.map((s) => ({
      generation_id: g.generationId, workspace_id: s.workspaceId, session_id: s.sessionId, launch_subject_id: s.launchSubjectId,
      coverage_state: s.coverageState, expected_pages: s.expectedPages, fetched_pages: s.fetchedPages, raw_records: s.rawRecords,
      required_field_gaps: s.requiredFieldGaps, completion_ref: s.completionRef,
    })));
    await ins('event_bindings', b.bindings.map((e) => ({
      generation_id: g.generationId, native_identity_key: e.nativeIdentityKey, policy_subject_id: e.policySubjectId,
      binding_state: e.bindingState, native_acting_task_id: e.nativeActingTaskId, mapping_method: e.mappingMethod, binding_ref: e.proofRef,
    })));
    // allowance rows are keyed by manifest hash and shared across generations: insert once, readback verifies multiplicity
    if ((await this.count('allowance_versions', 'manifest_hash = {h:String}', { h: b.manifest.sha256 })) === 0) {
      await ins('allowance_versions', allowanceRows(b.manifest));
    }
    await ins('generation_context', [{
      generation_id: g.generationId, provenance: this.provenance, manifest_hash: g.manifestSha256, capture_cutoff: chTs(g.captureCutoff),
      raw_count: g.rawCount, canonical_key_count: g.canonicalKeyCount, semantic_digest: g.semanticDigest, binding_digest: g.bindingDigest,
      coverage_digest: g.coverageDigest, manifest_digest: g.manifestDigest,
    }]);
  }

  private async rows<T>(sql: string, params: Record<string, string>, ids: string[]): Promise<T[]> {
    const queryId = `sw-rb-${randomUUID()}`;
    ids.push(queryId);
    const rs = await this.ch.collector.query({ query: sql, query_params: params, query_id: queryId, format: 'JSONEachRow' });
    return rs.json<T>();
  }

  /** Read the exact expected generation back and compare every component. */
  async readback(b: PublishBundle): Promise<ReadbackResult> {
    const g = b.generation;
    const queryIds: string[] = [];
    const mismatches: string[] = [];
    const p = { g: g.generationId };

    const obs = await this.rows<Record<string, string | null>>(
      `SELECT observation_id, fetch_record_id, identity_domain, native_identity_key, workspace_id, session_id, native_event_id, native_task_id,
              credential_id, operation, decision, reason_code, created_at_raw,
              if(created_at IS NULL, NULL, toString(toUnixTimestamp64Nano(created_at))) AS created_at_ns,
              unit_mapping_version, semantic_json, toString(toUnixTimestamp64Nano(observed_at)) AS observed_at_ns, source_ref, content_sha256
       FROM native_event_versions WHERE generation_id = {g:String} ORDER BY observation_id`, p, queryIds);
    const bind = await this.rows<Record<string, string | null>>(
      `SELECT native_identity_key, policy_subject_id, binding_state, native_acting_task_id, mapping_method, binding_ref
       FROM event_bindings WHERE generation_id = {g:String} ORDER BY native_identity_key`, p, queryIds);
    const cov = await this.rows<Record<string, string | number | null>>(
      `SELECT workspace_id, session_id, launch_subject_id, coverage_state, expected_pages, fetched_pages, toString(raw_records) AS raw_records,
              required_field_gaps, completion_ref FROM session_snapshots WHERE generation_id = {g:String} ORDER BY workspace_id, session_id`, p, queryIds);
    const allow = await this.rows<Record<string, string | number | null>>(
      `SELECT manifest_hash, workspace_id, credential_id, operation, policy_subject_id, toString(max_unique_allow_decisions) AS max_allow,
              window_seconds, toString(toUnixTimestamp64Nano(effective_from)) AS effective_from_ns,
              if(effective_until IS NULL, NULL, toString(toUnixTimestamp64Nano(effective_until))) AS effective_until_ns,
              policy_version, approval_ref
       FROM allowance_versions WHERE manifest_hash = {h:String}`, { h: g.manifestSha256 }, queryIds);
    const ctx = await this.rows<Record<string, string>>(
      `SELECT generation_id, manifest_hash, toString(raw_count) AS raw_count, toString(canonical_key_count) AS canonical_key_count,
              semantic_digest, binding_digest, coverage_digest, manifest_digest
       FROM generation_context WHERE generation_id = {g:String}`, p, queryIds);

    // --- raw ids with multiplicity
    const expIds = b.observations.map((o) => o.observationId).sort(cmp);
    const gotIds = obs.map((r) => r['observation_id'] as string).sort(cmp);
    const rawIds = canonicalJson(expIds) === canonicalJson(gotIds);
    if (!rawIds) mismatches.push(`raw ids/multiplicity differ: expected ${expIds.length} rows, ClickHouse has ${gotIds.length}`);

    // --- per-row full semantic + delivery projection, and canonical digest round trip
    const nsOrNull = (t: string | null) => (t === null ? null : String(parseUtcNano(t)));
    const exp = b.observations.map((o) => canonicalJson([
      o.observationId, o.fetchRecordId, o.identityDomain, o.nativeIdentityKey, o.workspaceId, o.sessionId, o.nativeEventId, o.nativeTaskId,
      o.credentialId, o.operation, o.decision, o.reasonCode, o.createdAtRaw, o.createdAtNs, o.unitMappingVersion, o.semanticJson,
      nsOrNull(o.observedAt), o.pageRef, o.contentSha256,
    ])).sort(cmp);
    const got = obs.map((r) => canonicalJson([
      r['observation_id'], r['fetch_record_id'], r['identity_domain'], r['native_identity_key'], r['workspace_id'], r['session_id'],
      r['native_event_id'], r['native_task_id'], r['credential_id'], r['operation'], r['decision'], r['reason_code'], r['created_at_raw'],
      r['created_at_ns'], r['unit_mapping_version'], r['semantic_json'], r['observed_at_ns'], r['source_ref'], r['content_sha256'],
    ])).sort(cmp);
    let semantics = canonicalJson(exp) === canonicalJson(got);
    if (!semantics) mismatches.push('per-row semantic content differs between journal and ClickHouse');
    const back: RawObservation[] = obs.map((r) => ({
      observationId: r['observation_id'] as string, provenance: this.provenance, generationId: g.generationId, fetchRecordId: r['fetch_record_id'] as string,
      pageRef: r['source_ref'] as string, nativeIdentityKey: r['native_identity_key'] ?? null, identityDomain: r['identity_domain'] ?? null,
      workspaceId: r['workspace_id'] as string, sessionId: r['session_id'] as string, nativeEventId: r['native_event_id'] ?? null,
      nativeTaskId: r['native_task_id'] ?? null, credentialId: r['credential_id'] ?? null, operation: r['operation'] ?? null,
      decision: (r['decision'] ?? null) as RawObservation['decision'], reasonCode: r['reason_code'] ?? null, createdAtRaw: r['created_at_raw'] ?? null,
      createdAt: r['created_at_ns'] ? formatUtcNano(BigInt(r['created_at_ns'])) : null, createdAtNs: r['created_at_ns'] ?? null,
      unitMappingVersion: r['unit_mapping_version'] as string, semanticJson: r['semantic_json'] as string,
      observedAt: formatUtcNano(BigInt(r['observed_at_ns'] as string)), contentSha256: r['content_sha256'] as string,
    }));
    const canonBack = canonicalize(back);
    if (semanticDigest(canonBack.facts) !== g.semanticDigest) {
      semantics = false;
      mismatches.push('semantic digest recomputed from ClickHouse rows differs from the sealed generation');
    }

    // --- bindings (multiset + digest)
    const expB = b.bindings.map((x) => canonicalJson(bindingProjection(x))).sort(cmp);
    const backBindings: EventBinding[] = bind.map((r) => ({
      generationId: g.generationId, nativeIdentityKey: r['native_identity_key'] as string, policySubjectId: r['policy_subject_id'] ?? null,
      bindingState: r['binding_state'] as EventBinding['bindingState'], nativeActingTaskId: r['native_acting_task_id'] ?? null,
      mappingMethod: r['mapping_method'] as string, proofRef: r['binding_ref'] as string,
    }));
    const gotB = backBindings.map((x) => canonicalJson(bindingProjection(x))).sort(cmp);
    const bindings = canonicalJson(expB) === canonicalJson(gotB) && bindingDigest(backBindings) === g.bindingDigest;
    if (!bindings) mismatches.push('event bindings differ (subject/state/method/proof or multiplicity)');

    // --- coverage
    const backCov: SessionCoverage[] = cov.map((r) => ({
      generationId: g.generationId, workspaceId: r['workspace_id'] as string, sessionId: r['session_id'] as string,
      launchSubjectId: (r['launch_subject_id'] as string | null) ?? null, coverageState: r['coverage_state'] as SessionCoverage['coverageState'],
      expectedPages: Number(r['expected_pages']), fetchedPages: Number(r['fetched_pages']), rawRecords: Number(r['raw_records']),
      requiredFieldGaps: Number(r['required_field_gaps']), completionRef: r['completion_ref'] as string, notes: [],
    }));
    const expC = b.coverage.map((x) => canonicalJson(coverageProjection(x))).sort(cmp);
    const gotC = backCov.map((x) => canonicalJson(coverageProjection(x))).sort(cmp);
    const coverage = canonicalJson(expC) === canonicalJson(gotC) && coverageDigest(backCov) === g.coverageDigest;
    if (!coverage) mismatches.push('session coverage snapshots differ');

    // --- manifest projection and generation context
    const d = b.manifest.document;
    const expA = allowanceProjection(b.manifest.sha256, d).map((r) => canonicalJson(r)).sort(cmp);
    const gotA = allow.map((r) => canonicalJson([
      r['manifest_hash'], r['workspace_id'], r['credential_id'], r['operation'], r['policy_subject_id'], r['max_allow'], Number(r['window_seconds']),
      formatUtcNano(BigInt(r['effective_from_ns'] as string)), r['effective_until_ns'] ? formatUtcNano(BigInt(r['effective_until_ns'] as string)) : null,
      r['policy_version'], r['approval_ref'],
    ])).sort(cmp);
    // effective_from text in the manifest may carry a different (but equal) spelling; compare by exact instant
    const normExp = allowanceProjection(b.manifest.sha256, d).map((r) => {
      const x = [...r];
      x[7] = formatUtcNano(parseUtcNano(x[7] as string));
      x[8] = x[8] === null ? null : formatUtcNano(parseUtcNano(x[8] as string));
      return canonicalJson(x);
    }).sort(cmp);
    const c0 = ctx[0];
    const ctxOk =
      ctx.length === 1 && c0 !== undefined && c0['manifest_hash'] === g.manifestSha256 && c0['raw_count'] === String(g.rawCount) &&
      c0['canonical_key_count'] === String(g.canonicalKeyCount) && c0['semantic_digest'] === g.semanticDigest &&
      c0['binding_digest'] === g.bindingDigest && c0['coverage_digest'] === g.coverageDigest && c0['manifest_digest'] === g.manifestDigest;
    const manifest = canonicalJson(normExp) === canonicalJson(gotA) && ctxOk && manifestDigest(b.manifest.sha256, d) === g.manifestDigest;
    void expA;
    if (!manifest) mismatches.push('manifest allowance rows or generation context differ (or are duplicated)');

    return {
      checkedAt: nowUtcNano(),
      ok: rawIds && semantics && bindings && coverage && manifest,
      components: { rawIds, semantics, bindings, coverage, manifest },
      mismatches,
      queryIds,
    };
  }
}

export { fromClickHouseDateTime64 };
