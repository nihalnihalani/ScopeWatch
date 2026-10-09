/**
 * Readiness / admission (ARCH §6, CLICKHOUSE_CONTRACTS "Readiness gates"). Structured gaps, not hidden WHERE conditions.
 * Coverage is computed from the REGISTERED cohort (launch registry / seed declaration), never from collected sessions.
 * Conflicts are a different class from missing-only gaps.
 */
import type {
  EventBinding,
  GapKind,
  IdentityDomainStatus,
  ManifestDocument,
  RawObservation,
  ReadinessGap,
  ReadinessReport,
  SessionCoverage,
} from '../shared/contracts.js';
import type { RegisteredSession } from '../shared/ports.js';
import { canonicalize } from './canonicalize.js';
import { canonicalJson, cmp } from './hash.js';
import { parseUtcNano, tryParseUtcNano } from './time.js';

export interface AdmissionInput {
  generationId: string;
  manifest: ManifestDocument;
  identityDomainStatus: IdentityDomainStatus;
  registry: RegisteredSession[];
  observations: RawObservation[];
  bindings: EventBinding[];
  coverage: SessionCoverage[];
  captureCutoff: string;
}

const CONFLICT_KINDS: GapKind[] = ['identity_conflict', 'binding_conflict', 'allowance_conflict'];
export const isConflictGap = (k: GapKind): boolean => CONFLICT_KINDS.includes(k);

export function assessReadiness(input: AdmissionInput): ReadinessReport {
  const gaps: ReadinessGap[] = [];
  const add = (g: ReadinessGap) => gaps.push(g);
  const { manifest } = input;

  // identity domain gate
  if (input.identityDomainStatus === 'unverified') {
    add({ kind: 'identity_missing', detail: 'native identity domain is unverified; admission blocked' });
  }
  for (const dom of new Set(input.observations.map((o) => o.identityDomain))) {
    if (dom !== null && dom !== manifest.identityDomain) {
      add({ kind: 'identity_missing', detail: `observation identity domain ${dom} differs from manifest identityDomain ${manifest.identityDomain}` });
    }
  }

  // manifest
  const subj = new Map<string, number>();
  for (const a of manifest.allowances) subj.set(a.policySubjectId, (subj.get(a.policySubjectId) ?? 0) + 1);
  for (const [s, n] of subj) if (n > 1) add({ kind: 'allowance_conflict', detail: `${n} allowance rows for subject ${s}`, policySubjectId: s });
  if (manifest.allowances.length === 0) add({ kind: 'allowance_missing', detail: 'manifest has no allowances' });
  const cutoffNs = tryParseUtcNano(input.captureCutoff);
  if (cutoffNs === null) add({ kind: 'clock_invalid', detail: `capture cutoff is not strict UTC text: ${input.captureCutoff}` });
  if (manifest.effectiveUntil !== null && cutoffNs !== null && parseUtcNano(manifest.effectiveUntil) < cutoffNs) {
    add({ kind: 'manifest_epoch', detail: 'manifest effectiveUntil is before capture cutoff; simple frozen-epoch path does not apply' });
  }

  // cohort coverage from the REGISTRY
  const covBySession = new Map<string, SessionCoverage[]>();
  for (const c of input.coverage) {
    const k = canonicalJson([c.workspaceId, c.sessionId]);
    covBySession.set(k, [...(covBySession.get(k) ?? []), c]);
  }
  const registeredKeys = new Set<string>();
  let complete = 0;
  for (const r of input.registry) {
    const k = canonicalJson([r.workspaceId, r.sessionId]);
    registeredKeys.add(k);
    const rows = covBySession.get(k) ?? [];
    if (rows.length === 0) {
      add({ kind: 'coverage_incomplete', detail: `registered session ${r.sessionId} has no coverage snapshot (missing, not zero)`, sessionId: r.sessionId });
      continue;
    }
    if (rows.length > 1) {
      add({ kind: 'coverage_incomplete', detail: `registered session ${r.sessionId} has ${rows.length} coverage snapshots`, sessionId: r.sessionId });
      continue;
    }
    const c = rows[0] as SessionCoverage;
    if (c.coverageState !== 'complete') {
      add({ kind: 'coverage_incomplete', detail: `session ${r.sessionId} coverage is ${c.coverageState}`, sessionId: r.sessionId });
      continue;
    }
    if (c.fetchedPages < c.expectedPages) {
      add({ kind: 'coverage_incomplete', detail: `session ${r.sessionId} fetched ${c.fetchedPages}/${c.expectedPages} pages`, sessionId: r.sessionId });
      continue;
    }
    if (c.requiredFieldGaps > 0) {
      add({ kind: 'required_field_missing', detail: `session ${r.sessionId} reports ${c.requiredFieldGaps} required-field gaps`, sessionId: r.sessionId });
      continue;
    }
    complete++;
  }
  // coverage rows for sessions outside the registered cohort, and observations from unregistered sessions, are anomalies
  for (const c of input.coverage) {
    if (!registeredKeys.has(canonicalJson([c.workspaceId, c.sessionId]))) {
      add({ kind: 'coverage_incomplete', detail: `coverage snapshot for unregistered session ${c.sessionId}`, sessionId: c.sessionId });
    }
  }
  for (const sid of new Set(input.observations.filter((o) => !registeredKeys.has(canonicalJson([o.workspaceId, o.sessionId]))).map((o) => o.sessionId))) {
    add({ kind: 'coverage_incomplete', detail: `observations from unregistered session ${sid}`, sessionId: sid });
  }

  // identities
  const canon = canonicalize(input.observations);
  for (const o of canon.nullKeyObservations) {
    add({ kind: 'identity_missing', detail: `observation ${o.observationId} has no native identity key`, sessionId: o.sessionId });
  }
  for (const c of canon.conflicts) {
    add({ kind: 'identity_conflict', detail: `${c.variantCount} stable-content variants differ in ${c.differingFields.join(',')}`, nativeIdentityKey: c.nativeIdentityKey });
  }

  // required fields and clock on each canonical fact
  for (const f of canon.facts) {
    const o = f.obs;
    const missing: string[] = [];
    if (o.nativeEventId === null) missing.push('nativeEventId');
    if (o.decision === null) missing.push('decision');
    if (o.credentialId === null) missing.push('credentialId');
    if (o.operation === null) missing.push('operation');
    if (o.createdAtNs === null || o.createdAt === null) missing.push('createdAt');
    if (missing.length) add({ kind: 'required_field_missing', detail: `missing ${missing.join(',')}`, nativeIdentityKey: f.nativeIdentityKey, sessionId: o.sessionId });
    else {
      const parsed = tryParseUtcNano(o.createdAt);
      if (parsed === null || String(parsed) !== o.createdAtNs) {
        add({ kind: 'clock_invalid', detail: `createdAt ${String(o.createdAt)} does not match createdAtNs ${String(o.createdAtNs)}`, nativeIdentityKey: f.nativeIdentityKey });
      }
    }
  }

  // bindings: exactly one verified binding per canonical identity
  const byKey = new Map<string, EventBinding[]>();
  for (const b of input.bindings) byKey.set(b.nativeIdentityKey, [...(byKey.get(b.nativeIdentityKey) ?? []), b]);
  const allowed = new Set(manifest.allowances.map((a) => a.policySubjectId));
  for (const f of canon.facts) {
    const rows = byKey.get(f.nativeIdentityKey) ?? [];
    if (rows.length === 0) {
      add({ kind: 'binding_missing', detail: 'no acting-subject binding for canonical identity', nativeIdentityKey: f.nativeIdentityKey, sessionId: f.obs.sessionId });
      continue;
    }
    if (rows.length > 1) {
      const distinct = new Set(rows.map((r) => canonicalJson([r.policySubjectId, r.bindingState, r.nativeActingTaskId, r.mappingMethod, r.proofRef])));
      add({
        kind: 'binding_conflict',
        detail: distinct.size > 1 ? `${rows.length} bindings disagree on subject/method/proof` : `${rows.length} duplicate identical binding rows (exactly one required)`,
        nativeIdentityKey: f.nativeIdentityKey,
      });
      continue;
    }
    const b = rows[0] as EventBinding;
    if (b.bindingState === 'conflict') add({ kind: 'binding_conflict', detail: b.reason ?? 'binding marked conflict', nativeIdentityKey: f.nativeIdentityKey });
    else if (b.bindingState === 'unresolved' || b.policySubjectId === null) {
      add({ kind: 'binding_unresolved', detail: b.reason ?? 'acting subject not established from task graph', nativeIdentityKey: f.nativeIdentityKey, sessionId: f.obs.sessionId });
    } else if (
      f.obs.workspaceId === manifest.workspaceId &&
      f.obs.credentialId === manifest.credentialId &&
      f.obs.operation === manifest.operation &&
      !allowed.has(b.policySubjectId)
    ) {
      add({ kind: 'allowance_missing', detail: `verified acting subject ${b.policySubjectId} has no manifest allowance`, nativeIdentityKey: f.nativeIdentityKey, policySubjectId: b.policySubjectId });
    }
  }
  const factKeys = new Set(canon.facts.map((f) => f.nativeIdentityKey));
  for (const k of byKey.keys()) {
    if (!factKeys.has(k) && !canon.conflicts.some((c) => c.nativeIdentityKey === k)) {
      add({ kind: 'binding_conflict', detail: 'binding references an identity absent from the generation', nativeIdentityKey: k });
    }
  }

  gaps.sort((a, b) => cmp(a.kind, b.kind) || cmp(a.nativeIdentityKey ?? a.sessionId ?? a.detail, b.nativeIdentityKey ?? b.sessionId ?? b.detail));
  return {
    generationId: input.generationId,
    ready: gaps.length === 0,
    gaps,
    cohortSessions: input.registry.length,
    completeSessions: complete,
    canonicalKeys: canon.facts.length,
    conflictKeys: canon.conflicts.length,
  };
}
