/**
 * Authoritative evaluation: EVERY distinct canonical selected-ALLOW anchor plus the capture cutoff is evaluated in
 * ClickHouse with the fixed all-candidate SQL. First crossing, peak and current count are stored separately, then
 * compared with the independent oracle. Any disagreement is an evaluation ERROR (no case), never a silent pick.
 */
import { randomBytes } from 'node:crypto';
import type {
  CandidateResult,
  EvaluationReceipt,
  EventBinding,
  ManifestDocument,
  PinnedManifest,
  Provenance,
  QueryReceipt,
  RawObservation,
  SessionCoverage,
  Witness,
} from '../../shared/contracts.js';
import { runOracle, type OracleResult, type OracleWitness } from '../../core/oracle.js';
import { rankBreaches } from '../../core/selection.js';
import { cmp } from '../../core/hash.js';
import { formatUtcNano, nowUtcNano, parseUtcNano, toClickHouseDateTime64 } from '../../core/time.js';
import type { ChServices } from './client.js';
import { runNamed, type AnchorRow, type QueryContext, type WitnessRow } from './queries.js';

export class GenerationNotAdmissibleError extends Error {}
export class OracleMismatchError extends Error {
  constructor(
    message: string,
    public readonly mismatches: string[],
  ) {
    super(message);
  }
}

export interface EvaluationInput {
  generationId: string;
  provenance: Provenance;
  manifest: PinnedManifest;
  captureCutoff: string;
  /** Journal facts for the independent oracle. */
  observations: RawObservation[];
  bindings: EventBinding[];
  coverage: SessionCoverage[];
}

interface SqlCandidate {
  key: string;
  workspaceId: string;
  policySubjectId: string;
  credentialId: string;
  operation: string;
  allowance: bigint;
  counts: bigint[];
  current: bigint;
}

const keyOf = (r: { workspace_id: string; policy_subject_id: string; credential_id: string; operation: string }) =>
  JSON.stringify([r.workspace_id, r.policy_subject_id, r.credential_id, r.operation]);

export async function evaluateGeneration(ch: ChServices, input: EvaluationInput): Promise<EvaluationReceipt> {
  const ctx: QueryContext = { client: ch.evaluator, database: ch.config.database, target: ch.config.target, serverVersion: ch.serverVersion };
  const queries: QueryReceipt[] = [];
  const gen = { generation_id: input.generationId };
  const mh = input.manifest.sha256;
  const cutoffNs = parseUtcNano(input.captureCutoff);

  // 1. conflict-first: any variant_count != 1 (or NULL key rows) blocks admission
  const conflicts = await runNamed<{ native_identity_key: string; variant_count: string }>(ctx, 'conflictCheck', 'conflict_check', gen);
  queries.push(conflicts.receipt);
  const nulls = await runNamed<{ null_key_rows: string }>(ctx, 'nullKeyCount', 'conflict_check', gen);
  queries.push(nulls.receipt);
  if (conflicts.rows.length > 0 || BigInt(nulls.rows[0]?.null_key_rows ?? '0') > 0n) {
    throw new GenerationNotAdmissibleError(
      `generation ${input.generationId} is not admissible: ${conflicts.rows.length} conflicting identities, ${nulls.rows[0]?.null_key_rows ?? '0'} NULL-key rows`,
    );
  }

  const cutoffParam = toClickHouseDateTime64(cutoffNs);
  const base = { ...gen, manifest_hash: mh };

  // 2. anchors (canonical, bound, complete-coverage, selected ALLOW facts up to cutoff)
  const anchorList = await runNamed<{ anchor_ns: string }>(ctx, 'anchorList', 'anchor_list', { ...base, window_anchor: cutoffParam });
  queries.push(anchorList.receipt);
  const anchors = anchorList.rows.map((r) => BigInt(r.anchor_ns)).sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  // 3. all-candidate counts at every anchor, then at the cutoff
  const cands = new Map<string, SqlCandidate>();
  const ingest = (rows: AnchorRow[], assign: (c: SqlCandidate, n: bigint) => void) => {
    for (const r of rows) {
      const k = keyOf(r);
      let c = cands.get(k);
      if (!c) {
        c = { key: k, workspaceId: r.workspace_id, policySubjectId: r.policy_subject_id, credentialId: r.credential_id, operation: r.operation, allowance: BigInt(r.max_unique_allow_decisions), counts: [], current: 0n };
        cands.set(k, c);
      }
      assign(c, BigInt(r.anchor_count));
    }
  };
  for (const a of anchors) {
    const run = await runNamed<AnchorRow>(ctx, 'anchorAllCandidates', 'anchor_all_candidates', { ...base, window_anchor: toClickHouseDateTime64(a) });
    queries.push(run.receipt);
    ingest(run.rows, (c, n) => c.counts.push(n));
  }
  const cur = await runNamed<AnchorRow>(ctx, 'anchorAllCandidates', 'current', { ...base, window_anchor: cutoffParam });
  queries.push(cur.receipt);
  ingest(cur.rows, (c, n) => (c.current = n));
  if (cands.size === 0) throw new GenerationNotAdmissibleError('manifest produced no candidate rows in ClickHouse (allowance projection missing)');

  // 4. derive first crossing / peak per candidate from the SQL counts
  const witnessCache = new Map<string, WitnessRow[]>();
  const witnessReceipt = new Map<string, string>();
  const witnessFor = async (anchor: bigint, c: SqlCandidate, count: bigint): Promise<Witness> => {
    const ck = anchor.toString();
    if (!witnessCache.has(ck)) {
      const w = await runNamed<WitnessRow>(ctx, 'witness', 'witness', { ...base, window_anchor: toClickHouseDateTime64(anchor) });
      queries.push(w.receipt);
      witnessCache.set(ck, w.rows);
      witnessReceipt.set(ck, w.receipt.queryId);
    }
    const mine = (witnessCache.get(ck) as WitnessRow[]).filter((r) => keyOf(r) === c.key);
    const keys = mine.flatMap((r) => r.identity_keys).sort(cmp);
    return {
      anchor: formatUtcNano(anchor),
      anchorNs: anchor.toString(),
      count: count.toString(),
      allowance: c.allowance.toString(),
      identityKeys: keys,
      sessions: mine.map((r) => ({ sessionId: r.session_id, count: r.session_count })).sort((a, b) => cmp(a.sessionId, b.sessionId)),
      queryId: witnessReceipt.get(ck) ?? null,
    };
  };

  const label = new Map(input.manifest.document.allowances.map((a) => [a.policySubjectId, a.displayLabel]));
  const results: CandidateResult[] = [];
  const ranks: Array<{ key: CandidateResult; firstNs: bigint; excess: bigint }> = [];
  for (const c of [...cands.values()].sort((a, b) => cmp(a.key, b.key))) {
    let first: { a: bigint; n: bigint } | null = null;
    let peak: { a: bigint; n: bigint } | null = null;
    c.counts.forEach((n, i) => {
      const a = anchors[i] as bigint;
      if (n > c.allowance && first === null) first = { a, n };
      if (n > 0n && (peak === null || n > peak.n)) peak = { a, n };
    });
    const fc = first as { a: bigint; n: bigint } | null;
    const pk = peak as { a: bigint; n: bigint } | null;
    const res: CandidateResult = {
      workspaceId: c.workspaceId,
      policySubjectId: c.policySubjectId,
      credentialId: c.credentialId,
      operation: c.operation,
      displayLabel: label.get(c.policySubjectId) ?? c.policySubjectId,
      allowance: c.allowance.toString(),
      currentCount: c.current.toString(),
      peakCount: (pk?.n ?? 0n).toString(),
      peakWitness: pk ? await witnessFor(pk.a, c, pk.n) : null,
      firstCrossing: fc ? await witnessFor(fc.a, c, fc.n) : null,
      breached: fc !== null,
      readiness: 'ready',
    };
    results.push(res);
    if (fc) ranks.push({ key: res, firstNs: fc.a, excess: fc.n - c.allowance });
  }

  // 5. independent oracle equality
  const oracle = runOracle({ observations: input.observations, bindings: input.bindings, coverage: input.coverage, manifest: input.manifest.document, cutoffNs });
  const mismatches = compareWithOracle(oracle, anchors, cands, results, input.manifest.document);

  const ordered = rankBreaches(ranks.map((r) => ({ key: { workspaceId: r.key.workspaceId, policySubjectId: r.key.policySubjectId, credentialId: r.key.credentialId, operation: r.key.operation }, firstCrossingNs: r.firstNs, excess: r.excess })));
  const breachedKeys = ordered.map((o) => o.key);
  const receipt: EvaluationReceipt = {
    evaluationId: `eval-${randomBytes(6).toString('hex')}`,
    generationId: input.generationId,
    manifestSha256: mh,
    provenance: input.provenance,
    anchors: anchors.map(formatUtcNano),
    captureCutoff: input.captureCutoff,
    candidates: results,
    breachedKeys,
    primary: breachedKeys[0] ?? null,
    oracleAgrees: mismatches.length === 0,
    oracleMismatches: mismatches,
    queries,
    evaluatedAt: nowUtcNano(),
  };
  if (mismatches.length) throw new OracleMismatchError(`ClickHouse and oracle disagree (${mismatches.length} mismatches): ${mismatches.slice(0, 3).join(' | ')}`, mismatches);
  return receipt;
}

function sameWitness(label: string, sql: Witness | null, o: OracleWitness | null, out: string[]): void {
  if (!sql || !o) {
    if (sql !== o && (sql === null) !== (o === null)) out.push(`${label}: presence differs (sql=${sql ? 'yes' : 'no'}, oracle=${o ? 'yes' : 'no'})`);
    return;
  }
  if (sql.anchorNs !== o.anchorNs.toString()) out.push(`${label}: anchor ${sql.anchorNs} != oracle ${o.anchorNs}`);
  if (sql.count !== o.count.toString()) out.push(`${label}: count ${sql.count} != oracle ${o.count}`);
  if (JSON.stringify(sql.identityKeys) !== JSON.stringify(o.identityKeys)) out.push(`${label}: witness identity keys differ`);
  if (JSON.stringify(sql.sessions.map((s) => [s.sessionId, s.count])) !== JSON.stringify(o.sessions.map((s) => [s.sessionId, s.count.toString()]))) out.push(`${label}: per-session contributions differ`);
}

function compareWithOracle(
  o: OracleResult,
  anchors: bigint[],
  cands: Map<string, SqlCandidate>,
  results: CandidateResult[],
  doc: ManifestDocument,
): string[] {
  const out: string[] = [];
  if (o.conflictKeys.length) out.push(`oracle found ${o.conflictKeys.length} conflicting identities`);
  if (JSON.stringify(anchors.map(String)) !== JSON.stringify(o.anchors.map(String))) out.push(`anchor sets differ (sql ${anchors.length}, oracle ${o.anchors.length})`);
  if (cands.size !== o.candidates.length) out.push(`candidate counts differ (sql ${cands.size}, oracle ${o.candidates.length})`);
  for (const oc of o.candidates) {
    const k = JSON.stringify([oc.workspaceId, oc.policySubjectId, oc.credentialId, oc.operation]);
    const sc = cands.get(k);
    const res = results.find((r) => JSON.stringify([r.workspaceId, r.policySubjectId, r.credentialId, r.operation]) === k);
    if (!sc || !res) {
      out.push(`candidate ${oc.policySubjectId} missing from SQL output`);
      continue;
    }
    if (sc.allowance !== oc.allowance) out.push(`${oc.policySubjectId}: allowance ${sc.allowance} != ${oc.allowance}`);
    if (sc.counts.length === oc.counts.length) {
      sc.counts.forEach((n, i) => {
        if (n !== oc.counts[i]) out.push(`${oc.policySubjectId}: count at anchor ${String(anchors[i])} sql=${n} oracle=${String(oc.counts[i])}`);
      });
    } else out.push(`${oc.policySubjectId}: anchor count vector length differs`);
    if (sc.current !== oc.currentCount) out.push(`${oc.policySubjectId}: current count sql=${sc.current} oracle=${oc.currentCount}`);
    sameWitness(`${oc.policySubjectId} first crossing`, res.firstCrossing, oc.firstCrossing, out);
    sameWitness(`${oc.policySubjectId} peak`, res.peakWitness, oc.peak, out);
  }
  void doc;
  return out;
}
