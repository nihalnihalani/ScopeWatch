/**
 * Conflict-first canonicalization (CLICKHOUSE_CONTRACTS "Native identity"). ALL versions of each
 * identity in the frozen generation are compared over SEMANTIC_FIELDS BEFORE any decision/actor/op/time filter.
 */
import { SEMANTIC_FIELDS, type EventBinding, type RawObservation, type SemanticField, type SessionCoverage } from '../shared/contracts.js';
import type { ManifestDocument } from '../shared/contracts.js';
import { canonicalJson, cmp, sha256Hex } from './hash.js';

export function semanticSignature(o: RawObservation): string {
  const picked: Record<string, unknown> = {};
  for (const f of SEMANTIC_FIELDS) picked[f] = o[f] ?? null;
  return canonicalJson(picked);
}

export interface CanonicalFact {
  nativeIdentityKey: string;
  obs: RawObservation;
  /** Number of exact-redelivery copies folded into this fact (>=1). */
  copies: number;
  signature: string;
}

export interface KeyConflict {
  nativeIdentityKey: string;
  variantCount: number;
  differingFields: SemanticField[];
}

export interface CanonicalizationResult {
  facts: CanonicalFact[];
  conflicts: KeyConflict[];
  nullKeyObservations: RawObservation[];
}

export function canonicalize(observations: RawObservation[]): CanonicalizationResult {
  const nullKey: RawObservation[] = [];
  const groups = new Map<string, RawObservation[]>();
  for (const o of observations) {
    if (o.nativeIdentityKey === null || o.nativeIdentityKey === '') {
      nullKey.push(o);
      continue;
    }
    const g = groups.get(o.nativeIdentityKey);
    if (g) g.push(o);
    else groups.set(o.nativeIdentityKey, [o]);
  }
  const facts: CanonicalFact[] = [];
  const conflicts: KeyConflict[] = [];
  for (const key of [...groups.keys()].sort(cmp)) {
    const copies = groups.get(key) as RawObservation[];
    const sigs = new Map<string, RawObservation>();
    for (const c of copies) {
      const s = semanticSignature(c);
      if (!sigs.has(s)) sigs.set(s, c);
    }
    if (sigs.size === 1) {
      const [signature, obs] = [...sigs.entries()][0] as [string, RawObservation];
      facts.push({ nativeIdentityKey: key, obs, copies: copies.length, signature });
    } else {
      const reps = [...sigs.values()];
      const differing = SEMANTIC_FIELDS.filter((f) => new Set(reps.map((r) => JSON.stringify(r[f] ?? null))).size > 1);
      conflicts.push({ nativeIdentityKey: key, variantCount: sigs.size, differingFields: differing });
    }
  }
  return { facts, conflicts, nullKeyObservations: nullKey };
}

// ---- Digests (journal side and readback side use these same pure functions over normalized rows) ----

export function semanticDigest(facts: CanonicalFact[]): string {
  const pairs = facts.map((f) => [f.nativeIdentityKey, f.signature] as const).sort((a, b) => cmp(a[0], b[0]));
  return sha256Hex(canonicalJson(pairs));
}

export function bindingProjection(b: EventBinding): unknown[] {
  return [b.nativeIdentityKey, b.policySubjectId, b.bindingState, b.nativeActingTaskId, b.mappingMethod, b.proofRef];
}

export function bindingDigest(bindings: EventBinding[]): string {
  const rows = bindings.map((b) => canonicalJson(bindingProjection(b))).sort(cmp);
  return sha256Hex(canonicalJson(rows));
}

export function coverageProjection(c: SessionCoverage): unknown[] {
  return [c.workspaceId, c.sessionId, c.launchSubjectId, c.coverageState, c.expectedPages, c.fetchedPages, c.rawRecords, c.requiredFieldGaps, c.completionRef];
}

export function coverageDigest(coverage: SessionCoverage[]): string {
  const rows = coverage.map((c) => canonicalJson(coverageProjection(c))).sort(cmp);
  return sha256Hex(canonicalJson(rows));
}

export function allowanceProjection(manifestSha: string, d: ManifestDocument): unknown[][] {
  return d.allowances
    .map((a) => [manifestSha, d.workspaceId, d.credentialId, d.operation, a.policySubjectId, a.maxUniqueAllowDecisions, d.windowSeconds, d.effectiveFrom, d.effectiveUntil, d.policyVersion, a.approvalRef])
    .sort((x, y) => cmp(canonicalJson(x), canonicalJson(y)));
}

export function manifestDigest(manifestSha: string, d: ManifestDocument): string {
  return sha256Hex(canonicalJson(allowanceProjection(manifestSha, d)));
}
