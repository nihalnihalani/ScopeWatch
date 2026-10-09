/**
 * Independent equality oracle. Deliberately does NOT import canonicalize.ts or share any SQL-path code:
 * it re-derives canonical facts from journal rows with its own grouping, then runs a two-pointer sweep.
 * Window is (T-W, T] (lower bound excluded), full timestamp tie groups, effective start inclusive.
 */
import { parseUtcNano } from './time.js';
import type { EventBinding, ManifestDocument, RawObservation, SessionCoverage } from '../shared/contracts.js';

export interface OracleWitness {
  anchorNs: bigint;
  count: bigint;
  identityKeys: string[];
  sessions: Array<{ sessionId: string; count: bigint }>;
}

export interface OracleCandidate {
  workspaceId: string;
  policySubjectId: string;
  credentialId: string;
  operation: string;
  allowance: bigint;
  /** Count at each oracle anchor, aligned with OracleResult.anchors. */
  counts: bigint[];
  firstCrossing: OracleWitness | null;
  peak: OracleWitness | null;
  currentCount: bigint;
}

export interface OracleResult {
  anchors: bigint[];
  candidates: OracleCandidate[];
  conflictKeys: string[];
}

interface Ev {
  key: string;
  ns: bigint;
  session: string;
}

function variantId(o: RawObservation): string {
  // explicit field order, independent of SEMANTIC_FIELDS
  return JSON.stringify([
    o.identityDomain ?? null, o.workspaceId, o.sessionId, o.nativeEventId ?? null, o.nativeTaskId ?? null,
    o.credentialId ?? null, o.operation ?? null, o.decision ?? null, o.reasonCode ?? null,
    o.createdAtRaw ?? null, o.createdAtNs ?? null, o.unitMappingVersion, o.semanticJson,
  ]);
}

export function runOracle(args: {
  observations: RawObservation[];
  bindings: EventBinding[];
  coverage: SessionCoverage[];
  manifest: ManifestDocument;
  cutoffNs: bigint;
}): OracleResult {
  const { manifest, cutoffNs } = args;
  const W = BigInt(manifest.windowSeconds) * 1_000_000_000n;
  const effFrom = parseUtcNano(manifest.effectiveFrom);

  // 1. canonicalize: every copy of every key, before any filter
  const variants = new Map<string, Map<string, RawObservation>>();
  for (const o of args.observations) {
    if (!o.nativeIdentityKey) continue;
    let m = variants.get(o.nativeIdentityKey);
    if (!m) variants.set(o.nativeIdentityKey, (m = new Map()));
    m.set(variantId(o), o);
  }
  const conflictKeys: string[] = [];
  const canon = new Map<string, RawObservation>();
  for (const [k, m] of variants) {
    if (m.size === 1) canon.set(k, [...m.values()][0] as RawObservation);
    else conflictKeys.push(k);
  }
  conflictKeys.sort();

  // 2. cohort sessions with complete coverage
  const completeSessions = new Set(args.coverage.filter((c) => c.coverageState === 'complete').map((c) => `${c.workspaceId}\u0000${c.sessionId}`));
  const subjectsByKey = new Map<string, Set<string>>();
  for (const b of args.bindings) {
    if (b.bindingState !== 'verified' || b.policySubjectId === null) continue;
    const s = subjectsByKey.get(b.nativeIdentityKey) ?? new Set<string>();
    s.add(b.policySubjectId);
    subjectsByKey.set(b.nativeIdentityKey, s);
  }

  // 3. per-candidate event lists
  const perCand: Array<{ subject: string; allowance: bigint; evs: Ev[] }> = manifest.allowances.map((a) => ({
    subject: a.policySubjectId,
    allowance: BigInt(a.maxUniqueAllowDecisions),
    evs: [],
  }));
  const anchorSet = new Set<bigint>();
  for (const [key, o] of canon) {
    if (o.decision !== 'ALLOW') continue;
    if (o.workspaceId !== manifest.workspaceId || o.credentialId !== manifest.credentialId || o.operation !== manifest.operation) continue;
    if (!completeSessions.has(`${o.workspaceId}\u0000${o.sessionId}`)) continue;
    if (o.createdAtNs === null) continue;
    const ns = BigInt(o.createdAtNs);
    if (ns < effFrom || ns > cutoffNs) continue;
    const subs = subjectsByKey.get(key);
    if (!subs) continue;
    let counted = false;
    for (const c of perCand) {
      if (subs.has(c.subject)) {
        c.evs.push({ key, ns, session: o.sessionId });
        counted = true;
      }
    }
    if (counted) anchorSet.add(ns);
  }
  const anchors = [...anchorSet].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  // 4. two-pointer sweep per candidate over the shared anchor list
  const candidates: OracleCandidate[] = perCand.map((c) => {
    const evs = [...c.evs].sort((a, b) => (a.ns < b.ns ? -1 : a.ns > b.ns ? 1 : a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    const counts: bigint[] = [];
    let lo = 0;
    let hi = 0;
    let first: OracleWitness | null = null;
    let peak: OracleWitness | null = null;
    const witnessAt = (t: bigint, l: number, h: number, n: bigint): OracleWitness => {
      const slice = evs.slice(l, h);
      const bySession = new Map<string, bigint>();
      for (const e of slice) bySession.set(e.session, (bySession.get(e.session) ?? 0n) + 1n);
      return {
        anchorNs: t,
        count: n,
        identityKeys: slice.map((e) => e.key).sort(),
        sessions: [...bySession.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([sessionId, count]) => ({ sessionId, count })),
      };
    };
    for (const t of anchors) {
      while (hi < evs.length && (evs[hi] as Ev).ns <= t) hi++;
      while (lo < hi && (evs[lo] as Ev).ns <= t - W) lo++;
      const n = BigInt(hi - lo);
      counts.push(n);
      if (n > c.allowance && first === null) first = witnessAt(t, lo, hi, n);
      if (n > 0n && (peak === null || n > peak.count)) peak = witnessAt(t, lo, hi, n);
    }
    // current count at cutoff
    let cur = 0n;
    for (const e of evs) if (e.ns > cutoffNs - W && e.ns <= cutoffNs) cur++;
    return {
      workspaceId: manifest.workspaceId,
      policySubjectId: c.subject,
      credentialId: manifest.credentialId,
      operation: manifest.operation,
      allowance: c.allowance,
      counts,
      firstCrossing: first,
      peak,
      currentCount: cur,
    };
  });
  return { anchors, candidates, conflictKeys };
}
