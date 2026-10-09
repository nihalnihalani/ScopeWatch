/**
 * REPLAY / synthetic benchmark against LOCAL ClickHouse (docker). Not Cloud, not native evidence, not containment latency.
 *
 * Population: a declared, seeded, diverse synthetic generation (several workspace/credential/operation groups, ~50
 * candidates, redeliveries, DENY/ERROR, unbound/partial/out-of-scope traffic, ties, boundary instants) plus a small
 * separate conflict generation. Expected answers are computed by the independent oracle (src/core/oracle.ts) from the
 * in-memory population BEFORE any query is issued; their digest is recorded first.
 *
 * Timed classes (application's own fixed SQL from queries.ts, typed params, runNamed receipts):
 *   (a) conflict_check            raw conflict/canonical extraction over the whole generation
 *       anchor_list               canonical selected-ALLOW anchor extraction for one manifest
 *   (b) anchor_all_candidates     ONE all-candidate anchor aggregate
 *   (c) procedure                 evaluateGeneration(): complete authoritative historical procedure over all anchors
 *                                 of one manifest (includes the in-process oracle equality check it performs)
 *   (d) oracle_extract/oracle_sweep  independent extraction from ClickHouse + runOracle two-pointer sweep
 */
import { createHash, randomBytes } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { adminClient, dropNamespace, provisionNamespace, randomPassword, type NamespaceUsers } from '../src/integrations/clickhouse/admin.js';
import { connectClickHouse, type ChServices } from '../src/integrations/clickhouse/client.js';
import { evaluateGeneration, type EvaluationInput } from '../src/integrations/clickhouse/evaluator.js';
import { observationRow } from '../src/integrations/clickhouse/publisher.js';
import { runNamed, type AnchorRow, type QueryContext } from '../src/integrations/clickhouse/queries.js';
import { runOracle, type OracleResult } from '../src/core/oracle.js';
import { pinManifest } from '../src/core/manifest.js';
import { sha256Hex } from '../src/core/hash.js';
import { formatUtcNano, parseUtcNano, toClickHouseDateTime64 } from '../src/core/time.js';
import type { ClickHouseConfig } from '../src/server/config.js';
import type { EventBinding, ManifestDocument, PinnedManifest, RawObservation, SessionCoverage } from '../src/shared/contracts.js';

const SEC = 1_000_000_000n;
const WINDOW = 600n * SEC;

// ---------------------------------------------------------------------------
// seeded PRNG
// ---------------------------------------------------------------------------
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------------------------------------------------------------------------
// population
// ---------------------------------------------------------------------------
export interface PopParams {
  generationId: string;
  seed: number;
  units: number;
  anchorsPerGroup: number;
  /** fraction of units that receive extra exact redelivery copies */
  redeliveryFrac: number;
  /** same-ID conflicting variants to inject (separate conflict generation only) */
  conflicts: number;
  policyVersion: string;
}

type Profile = 'steady' | 'early' | 'late' | 'burst' | 'quiet' | 'zero';
const PROFILES: Profile[] = ['steady', 'early', 'late', 'burst', 'quiet', 'steady', 'zero'];
const FACTORS = [0.6, 1.0, 1.04, 0.9, 1.5, 0.75, 2.0];

interface Cand {
  subject: string;
  profile: Profile;
  weight: number;
  lo: number;
  hi: number;
  times: bigint[];
  allowance: bigint;
}

interface Group {
  ws: string;
  cred: string;
  op: string;
  weight: number;
  cands: Cand[];
  instants: bigint[];
  doc: ManifestDocument;
  manifest: PinnedManifest;
}

export interface Population {
  params: PopParams;
  observations: RawObservation[];
  bindings: EventBinding[];
  coverage: SessionCoverage[];
  groups: Group[];
  effectiveFromNs: bigint;
  cutoffNs: bigint;
  conflictKeys: string[];
  stats: Record<string, unknown>;
}

const WSS = ['ws-alpha', 'ws-beta'];
const CREDS = ['cred-1', 'cred-2'];
const OPS = ['read_file', 'list_repos'];
const BASE = parseUtcNano('2026-10-09T06:00:00Z');
const EFFECTIVE = parseUtcNano('2026-10-09T06:30:00Z');
const CUTOFF = parseUtcNano('2026-10-09T12:00:00Z');
const END_AFTER = parseUtcNano('2026-10-09T12:30:00Z');
const SESSIONS_PER_WS = 120;
const PARTIAL_PER_WS = 6;

export function generatePopulation(p: PopParams): Population {
  const rng = mulberry32(p.seed);
  const ri = (n: number) => Math.floor(rng() * n);
  const randNs = (lo: bigint, hi: bigint): bigint => lo + BigInt(Math.floor(rng() * Number((hi - lo) / SEC))) * SEC + BigInt(ri(1_000_000_000));

  // --- groups and candidates (50 candidates: groups 0,1 have 7, the others 6) ---
  const groups: Group[] = [];
  let gi = 0;
  let subjectCounter = 0;
  for (const ws of WSS)
    for (const cred of CREDS)
      for (const op of OPS) {
        const nc = gi < 2 ? 7 : 6;
        const cands: Cand[] = [];
        for (let c = 0; c < nc; c++) {
          const profile = PROFILES[c] as Profile;
          cands.push({ subject: `agent-${String(100 + subjectCounter++)}`, profile, weight: profile === 'quiet' ? 0.04 : profile === 'zero' ? 0 : 0.7 + rng() * 0.8, lo: 0, hi: 0, times: [], allowance: 1n });
        }
        // instants: 60% uniform, 40% clustered; plus boundary triples, effective-from, cutoff
        const set = new Set<bigint>();
        const K = p.anchorsPerGroup;
        const lo = EFFECTIVE + SEC;
        while (set.size < K) {
          if (rng() < 0.6 || set.size === 0) set.add(randNs(lo, CUTOFF - SEC));
          else {
            const arr = [...set];
            const centre = arr[ri(arr.length)] as bigint;
            const t = centre + BigInt(ri(900)) * SEC + BigInt(ri(1_000_000_000));
            if (t > lo && t < CUTOFF - SEC) set.add(t);
          }
        }
        const arr = [...set].sort((a, b) => (a < b ? -1 : 1));
        // boundary triple at the base point arr[1]: t, t+600s (lower bound excluded), t+600s-1ns (inside)
        const b0 = arr[1] ?? arr[0] as bigint;
        for (const t of [b0, b0 + WINDOW, b0 + WINDOW - 1n, EFFECTIVE, CUTOFF]) set.add(t);
        const instants = [...set].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
        const n = instants.length;
        for (const c of cands) {
          [c.lo, c.hi] =
            c.profile === 'early' ? [0, Math.max(1, Math.floor(n * 0.35))]
              : c.profile === 'late' ? [Math.floor(n * 0.65), n]
                : c.profile === 'burst' ? [Math.floor(n * 0.4), Math.max(Math.floor(n * 0.4) + 1, Math.floor(n * 0.5))]
                  : [0, n];
        }
        groups.push({ ws, cred, op, weight: 0.5 + rng(), cands, instants, doc: null as unknown as ManifestDocument, manifest: null as unknown as PinnedManifest });
        gi++;
      }

  // --- sessions ---
  const coverage: SessionCoverage[] = [];
  const completePool = new Map<string, string[]>();
  const partialPool = new Map<string, string[]>();
  const sessionRaw = new Map<string, number>();
  for (const ws of WSS) {
    const comp: string[] = [];
    const part: string[] = [];
    for (let s = 0; s < SESSIONS_PER_WS; s++) {
      const id = `sess-${ws.slice(3)}-${String(s).padStart(3, '0')}`;
      (s < PARTIAL_PER_WS ? part : comp).push(id);
      coverage.push({ generationId: p.generationId, workspaceId: ws, sessionId: id, launchSubjectId: null, coverageState: s < PARTIAL_PER_WS ? 'incomplete' : 'complete', expectedPages: 1, fetchedPages: 1, rawRecords: 0, requiredFieldGaps: 0, completionRef: `done-${id}`, notes: [] });
    }
    completePool.set(ws, comp);
    partialPool.set(ws, part);
  }

  // --- units ---
  const kinds: Array<[string, number]> = [
    ['sel_allow', 0.36], ['sel_deny', 0.2], ['sel_error', 0.05], ['wrong_scope_allow', 0.09], ['other_subject_allow', 0.15],
    ['partial_session', 0.04], ['unbound', 0.03], ['pre_effective', 0.04], ['post_cutoff', 0.04],
  ];
  const cumKinds: Array<[string, number]> = [];
  let acc = 0;
  for (const [k, w] of kinds) cumKinds.push([k, (acc += w)]);
  const groupCum: number[] = [];
  let ga = 0;
  for (const g of groups) groupCum.push((ga += g.weight));
  const pickGroup = (): Group => {
    const r = rng() * ga;
    return groups[groupCum.findIndex((c) => r < c)] as Group;
  };
  const pickCand = (g: Group): Cand => {
    const tot = g.cands.reduce((s, c) => s + c.weight, 0);
    let r = rng() * tot;
    for (const c of g.cands) {
      if ((r -= c.weight) < 0 && c.weight > 0) return c;
    }
    return g.cands.find((c) => c.weight > 0) as Cand;
  };

  const observations: RawObservation[] = [];
  const bindings: EventBinding[] = [];
  const kindUnits: Record<string, number> = {};
  const decisionUnits: Record<string, number> = { ALLOW: 0, DENY: 0, ERROR: 0 };
  const selectedKeys: Array<{ key: string; obsIdx: number }> = [];
  let extraCopies = 0;

  for (let i = 0; i < p.units; i++) {
    const r = rng();
    const kind = (cumKinds.find(([, c]) => r < c) ?? cumKinds[cumKinds.length - 1]) as [string, number];
    const k = kind[0];
    kindUnits[k] = (kindUnits[k] ?? 0) + 1;
    const g = pickGroup();
    let cred = g.cred;
    let op = g.op;
    let decision: 'ALLOW' | 'DENY' | 'ERROR' = 'ALLOW';
    let session: string;
    let subject: string | null;
    let state: 'verified' | 'unresolved' = 'verified';
    let at: bigint;
    const comp = completePool.get(g.ws) as string[];
    session = comp[ri(comp.length)] as string;
    const cand = pickCand(g);
    subject = cand.subject;
    switch (k) {
      case 'sel_allow':
        at = g.instants[cand.lo + ri(cand.hi - cand.lo)] as bigint;
        cand.times.push(at);
        break;
      case 'sel_deny':
        decision = rng() < 0.8 ? 'DENY' : 'ERROR';
        at = randNs(BASE, CUTOFF);
        break;
      case 'sel_error':
        decision = 'ERROR';
        at = randNs(BASE, CUTOFF);
        break;
      case 'wrong_scope_allow':
        if (rng() < 0.5) op = 'op-other';
        else cred = 'cred-other';
        at = randNs(EFFECTIVE, CUTOFF);
        break;
      case 'other_subject_allow':
        subject = `agent-x${ri(40)}`;
        at = randNs(EFFECTIVE, CUTOFF);
        break;
      case 'partial_session':
        session = (partialPool.get(g.ws) as string[])[ri(PARTIAL_PER_WS)] as string;
        at = g.instants[cand.lo + ri(cand.hi - cand.lo)] as bigint;
        break;
      case 'unbound':
        subject = null;
        state = 'unresolved';
        at = g.instants[ri(g.instants.length)] as bigint;
        break;
      case 'pre_effective':
        at = randNs(BASE, EFFECTIVE - 1n);
        break;
      default:
        at = randNs(CUTOFF + 1n, END_AFTER);
    }
    decisionUnits[decision] = (decisionUnits[decision] ?? 0) + 1;
    const id = `ev-${i.toString(36)}`;
    const key = JSON.stringify([g.ws, id]);
    const text = formatUtcNano(at);
    const semantic = JSON.stringify({ at: text, decision, id, session });
    const copies = 1 + (rng() < p.redeliveryFrac ? (rng() < 0.2 ? 2 : 1) : 0);
    extraCopies += copies - 1;
    for (let c = 1; c <= copies; c++) {
      if (k === 'sel_allow' && c === 1) selectedKeys.push({ key, obsIdx: observations.length });
      observations.push({
        observationId: `obs-${p.generationId}-${i.toString(36)}-c${c}`, provenance: 'replay', generationId: p.generationId, fetchRecordId: `fetch-${session}-${c}`, pageRef: `page-${c}`,
        nativeIdentityKey: key, identityDomain: 'workspace', workspaceId: g.ws, sessionId: session, nativeEventId: id, nativeTaskId: `task-${id}`,
        credentialId: cred, operation: op, decision, reasonCode: null, createdAtRaw: text, createdAt: text, createdAtNs: at.toString(),
        unitMappingVersion: 'u1', semanticJson: semantic, observedAt: formatUtcNano(at + BigInt(c) * SEC), contentSha256: createHash('sha256').update(`${key}#${c}`).digest('hex'),
      });
    }
    sessionRaw.set(session, (sessionRaw.get(session) ?? 0) + copies);
    bindings.push({ generationId: p.generationId, nativeIdentityKey: key, policySubjectId: subject, bindingState: state, nativeActingTaskId: `task-${id}`, mappingMethod: 'bench', proofRef: `proof-${id}` });
  }
  for (const c of coverage) c.rawRecords = sessionRaw.get(c.sessionId) ?? 0;

  // --- conflict injection (conflict generation only): same identity, different semantic content ---
  const conflictKeys: string[] = [];
  const step = Math.max(1, Math.floor(selectedKeys.length / Math.max(1, p.conflicts)));
  for (let n = 0; n < p.conflicts && n * step < selectedKeys.length; n++) {
    const { key, obsIdx } = selectedKeys[n * step] as { key: string; obsIdx: number };
    const src = observations[obsIdx] as RawObservation;
    const v: RawObservation = { ...src, observationId: `${src.observationId}-conflict`, fetchRecordId: `${src.fetchRecordId}-conflict` };
    switch (n % 4) {
      case 0: { // timestamp differs by one second
        const ns = BigInt(src.createdAtNs as string) + SEC;
        v.createdAtNs = ns.toString(); v.createdAt = formatUtcNano(ns); v.createdAtRaw = v.createdAt;
        break;
      }
      case 1: v.decision = 'DENY'; break;
      case 2: v.sessionId = (completePool.get(src.workspaceId) as string[]).find((s) => s !== src.sessionId) as string; break;
      default: v.credentialId = 'cred-other';
    }
    observations.push(v);
    conflictKeys.push(key);
  }
  conflictKeys.sort();

  // --- allowances chosen from realized peaks (parameter selection only; correctness is judged by the oracle) ---
  const peakOf = (times: bigint[]): number => {
    const t = [...times].sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));
    let lo = 0;
    let hi = 0;
    let peak = 0;
    for (let x = 0; x < t.length; x++) {
      const at = t[x] as bigint;
      if (x + 1 < t.length && t[x + 1] === at) continue;
      hi = x + 1;
      while ((t[lo] as bigint) <= at - WINDOW) lo++;
      peak = Math.max(peak, hi - lo);
    }
    return peak;
  };
  let candIdx = 0;
  for (const g of groups) {
    for (const c of g.cands) {
      const peak = peakOf(c.times);
      c.allowance = c.profile === 'zero' ? BigInt(10 + candIdx) : BigInt(Math.max(1, Math.floor(peak * (FACTORS[candIdx % FACTORS.length] as number)) + (candIdx % 3)));
      candIdx++;
    }
    g.doc = {
      schema: 'scopewatch.manifest/v1', policyVersion: `${p.policyVersion}-${g.ws}-${g.cred}-${g.op}`, workspaceId: g.ws, credentialId: g.cred, operation: g.op,
      unit: 'native_allow_security_event_id', clock: 'bench.created_at', subjectIdDomain: 'bench_subject', identityDomain: 'workspace', windowSeconds: 600,
      effectiveFrom: formatUtcNano(EFFECTIVE), effectiveUntil: null,
      allowances: g.cands.map((c) => ({ policySubjectId: c.subject, displayLabel: `${c.profile}:${c.subject}`, maxUniqueAllowDecisions: c.allowance.toString(), approvalRef: `bench-approval-${c.subject}` })),
    };
    g.manifest = pinManifest({ bytes: Buffer.from(JSON.stringify(g.doc, null, 2)), manifestId: `bench-${p.generationId}-${g.ws}-${g.cred}-${g.op}`, provenance: 'replay', immutableRef: `bench:${p.generationId}`, approvedBy: 'bench' });
  }

  // tie statistics over selected ALLOW events per (candidate, instant)
  let tieMax = 0;
  const tieHist: Record<string, number> = {};
  for (const g of groups)
    for (const c of g.cands) {
      const m = new Map<bigint, number>();
      for (const t of c.times) m.set(t, (m.get(t) ?? 0) + 1);
      for (const n of m.values()) {
        tieMax = Math.max(tieMax, n);
        const b = n === 1 ? '1' : n <= 10 ? '2-10' : n <= 100 ? '11-100' : '>100';
        tieHist[b] = (tieHist[b] ?? 0) + 1;
      }
    }
  const stats = {
    seed: p.seed,
    storedRawRows: observations.length,
    distinctIdentityKeys: p.units,
    exactRedeliveryExtraRows: extraCopies,
    injectedConflictVariants: conflictKeys.length,
    unitsByKind: kindUnits,
    decisionUnits,
    groups: groups.length,
    candidates: groups.reduce((s, g) => s + g.cands.length, 0),
    zeroEventCandidates: groups.reduce((s, g) => s + g.cands.filter((c) => c.times.length === 0).length, 0),
    distinctAllowanceValues: new Set(groups.flatMap((g) => g.cands.map((c) => c.allowance.toString()))).size,
    allowanceMin: groups.flatMap((g) => g.cands.map((c) => c.allowance)).reduce((a, b) => (a < b ? a : b)).toString(),
    allowanceMax: groups.flatMap((g) => g.cands.map((c) => c.allowance)).reduce((a, b) => (a > b ? a : b)).toString(),
    selectedAllowUnits: kindUnits['sel_allow'] ?? 0,
    instantsPerGroup: groups.map((g) => g.instants.length),
    tieGroupHistogramPerCandidateInstant: tieHist,
    tieGroupMax: tieMax,
    timeSpanHours: Number(CUTOFF - BASE) / 3.6e12,
    sessions: coverage.length,
    incompleteSessions: coverage.filter((c) => c.coverageState !== 'complete').length,
  };
  return { params: p, observations, bindings, coverage, groups, effectiveFromNs: EFFECTIVE, cutoffNs: CUTOFF, conflictKeys, stats };
}

// ---------------------------------------------------------------------------
// expectations (independent oracle, computed before any query)
// ---------------------------------------------------------------------------
interface ExpectedGroup {
  anchors: string[];
  conflictKeys: string[];
  cands: Array<{
    subject: string;
    allowance: string;
    counts: string[];
    current: string;
    peak: { anchorNs: string; count: string } | null;
    first: { anchorNs: string; count: string } | null;
  }>;
}

function expectFrom(o: OracleResult): ExpectedGroup {
  return {
    anchors: o.anchors.map(String),
    conflictKeys: o.conflictKeys,
    cands: o.candidates.map((c) => ({
      subject: c.policySubjectId, allowance: c.allowance.toString(), counts: c.counts.map(String), current: c.currentCount.toString(),
      peak: c.peak ? { anchorNs: c.peak.anchorNs.toString(), count: c.peak.count.toString() } : null,
      first: c.firstCrossing ? { anchorNs: c.firstCrossing.anchorNs.toString(), count: c.firstCrossing.count.toString() } : null,
    })),
  };
}

function oracleFor(pop: { observations: RawObservation[]; bindings: EventBinding[]; coverage: SessionCoverage[]; cutoffNs: bigint }, g: Group): OracleResult {
  return runOracle({ observations: pop.observations, bindings: pop.bindings, coverage: pop.coverage, manifest: g.doc, cutoffNs: pop.cutoffNs });
}

// ---------------------------------------------------------------------------
// statistics
// ---------------------------------------------------------------------------
export function nearestRank(values: number[], q: number): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  return s[Math.max(1, Math.ceil(q * s.length)) - 1] as number;
}

const round = (x: number | null, d = 3): number | null => (x === null ? null : Math.round(x * 10 ** d) / 10 ** d);

// ---------------------------------------------------------------------------
// run
// ---------------------------------------------------------------------------
export interface BenchOptions {
  db: string;
  url: string;
  adminUser: string;
  adminPassword: string;
  units: number;
  conflictUnits: number;
  anchorsPerGroup: number;
  conflicts: number;
  seed: number;
  samples: number;
  warmups: number;
  procedureRepeats: number;
  oracleExtractRepeats: number;
  dropAtEnd: boolean;
  outDir: string | null;
  log: (s: string) => void;
}

interface Sample {
  cls: string;
  phase: 'cold' | 'warmup' | 'sample' | 'member';
  index: number;
  generationId: string;
  group: string;
  queryId: string | null;
  clientMs: number;
  headerServerMs: number | null;
  correct: boolean;
  note: string;
  rowCount: number;
  anchors?: number;
}

export interface BenchResults {
  label: string;
  startedAt: string;
  finishedAt: string;
  environment: Record<string, unknown>;
  declaration: Record<string, unknown>;
  population: Record<string, unknown>;
  expectedDigest: { sha256: string; computedBeforeQueries: string };
  classes: Record<string, unknown>;
  correctness: { checks: number; failures: string[] };
  queryLog: Record<string, unknown>;
  samples: Sample[];
  limitations: string[];
}

function sha(s: string): string {
  return sha256Hex(s);
}

function dockerInfo(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    const t = execFileSync('docker', ['info', '--format', '{{.MemTotal}} {{.NCPU}} {{.ServerVersion}} {{.OperatingSystem}}'], { encoding: 'utf8', timeout: 15000 }).trim().split(' ');
    out['dockerMemTotalBytes'] = Number(t[0]);
    out['dockerNcpu'] = Number(t[1]);
    out['dockerServerVersion'] = t[2];
    out['dockerOs'] = t.slice(3).join(' ');
  } catch (e) {
    out['dockerInfoError'] = (e as Error).message.slice(0, 120);
  }
  return out;
}

function composeImage(): string {
  try {
    return /image:\s*(\S+)/.exec(readFileSync('docker/clickhouse/compose.yaml', 'utf8'))?.[1] ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

const DDL_ISSUED = `CREATE TABLE IF NOT EXISTS bench_issued (query_id String, query_class String, phase String) ENGINE = MergeTree ORDER BY query_id`;

export async function runBench(o: BenchOptions): Promise<BenchResults> {
  const startedAt = new Date().toISOString();
  const failures: string[] = [];
  let checks = 0;
  const check = (ok: boolean, msg: string) => {
    checks++;
    if (!ok) failures.push(msg);
    return ok;
  };
  const samples: Sample[] = [];

  // ---------------- 1. population + declared expectations (before any query) ----------------
  o.log(`generating main population units=${o.units} anchors/group=${o.anchorsPerGroup} seed=${o.seed}`);
  const t0 = performance.now();
  let main = generatePopulation({ generationId: 'bench-main', seed: o.seed, units: o.units, anchorsPerGroup: o.anchorsPerGroup, redeliveryFrac: 0.12, conflicts: 0, policyVersion: 'bench-main-v1' });
  const conf = generatePopulation({ generationId: 'bench-conflict', seed: o.seed + 1, units: o.conflictUnits, anchorsPerGroup: Math.max(4, Math.floor(o.anchorsPerGroup / 2)), redeliveryFrac: 0.12, conflicts: o.conflicts, policyVersion: 'bench-conflict-v1' });
  o.log(`  generated ${main.observations.length} raw rows in ${Math.round(performance.now() - t0)} ms; computing declared oracle expectations`);
  const expMain = main.groups.map((g) => expectFrom(oracleFor(main, g)));
  const expConf = conf.groups.map((g) => expectFrom(oracleFor(conf, g)));
  const expectedSha = sha(JSON.stringify({ main: expMain, conflict: expConf }));
  const expectedAt = new Date().toISOString();
  o.log(`  expectations sha256=${expectedSha.slice(0, 16)} recorded at ${expectedAt} (before any query)`);
  check(expMain.every((e) => e.conflictKeys.length === 0), 'main population must have zero oracle conflicts');
  check(JSON.stringify([...new Set(expConf.flatMap((e) => e.conflictKeys))].sort()) === JSON.stringify(conf.conflictKeys), 'oracle conflict keys must equal injected conflict keys');

  // ---------------- 2. namespace ----------------
  const admin = adminClient(o.url, o.adminUser, o.adminPassword);
  const users: NamespaceUsers = {
    ingest: { username: `${o.db}_i`.slice(0, 60), password: randomPassword() },
    query: { username: `${o.db}_q`.slice(0, 60), password: randomPassword() },
  };
  if (/^scopewatch(_replay|_contract)?$/.test(o.db) || !/^[A-Za-z_][A-Za-z0-9_]*$/.test(o.db)) throw new Error(`refusing database name ${o.db}`);
  await dropNamespace(admin, o.db, users);
  await provisionNamespace(admin, o.db, users);
  await admin.command({ query: DDL_ISSUED.replace('bench_issued', `${o.db}.bench_issued`) });
  const config: ClickHouseConfig = { url: o.url, target: 'clickhouse_local', database: o.db, collector: users.ingest, evaluator: users.query };
  const ch: ChServices = await connectClickHouse(config);
  const serverVersion = ch.serverVersion;
  const ctx: QueryContext = { client: ch.evaluator, database: o.db, target: 'clickhouse_local', serverVersion };

  try {
    // ---------------- 3. insert ----------------
    const insertGen = async (pop: Population) => {
      const gid = pop.params.generationId;
      const tI = performance.now();
      const BATCH = 50_000;
      for (let i = 0; i < pop.observations.length; i += BATCH) {
        await ch.collector.insert({ table: 'native_event_versions', values: pop.observations.slice(i, i + BATCH).map((x) => observationRow(gid, x)), format: 'JSONEachRow', clickhouse_settings: { date_time_input_format: 'best_effort' } });
      }
      for (let i = 0; i < pop.bindings.length; i += BATCH) {
        await ch.collector.insert({
          table: 'event_bindings', format: 'JSONEachRow',
          values: pop.bindings.slice(i, i + BATCH).map((e) => ({ generation_id: gid, native_identity_key: e.nativeIdentityKey, policy_subject_id: e.policySubjectId, binding_state: e.bindingState, native_acting_task_id: e.nativeActingTaskId, mapping_method: e.mappingMethod, binding_ref: e.proofRef })),
        });
      }
      await ch.collector.insert({
        table: 'session_snapshots', format: 'JSONEachRow',
        values: pop.coverage.map((s) => ({ generation_id: gid, workspace_id: s.workspaceId, session_id: s.sessionId, launch_subject_id: s.launchSubjectId, coverage_state: s.coverageState, expected_pages: s.expectedPages, fetched_pages: s.fetchedPages, raw_records: s.rawRecords, required_field_gaps: s.requiredFieldGaps, completion_ref: s.completionRef })),
      });
      const allow = pop.groups.flatMap((g) =>
        g.doc.allowances.map((a) => ({
          manifest_hash: g.manifest.sha256, manifest_ref: g.manifest.immutableRef, policy_version: g.doc.policyVersion, workspace_id: g.ws, credential_id: g.cred, operation: g.op,
          policy_subject_id: a.policySubjectId, max_unique_allow_decisions: a.maxUniqueAllowDecisions, window_seconds: 600, effective_from: toClickHouseDateTime64(EFFECTIVE), effective_until: null, approval_ref: a.approvalRef,
        })),
      );
      await ch.collector.insert({ table: 'allowance_versions', values: allow, format: 'JSONEachRow', clickhouse_settings: { date_time_input_format: 'best_effort' } });
      await ch.collector.insert({
        table: 'generation_context', format: 'JSONEachRow', clickhouse_settings: { date_time_input_format: 'best_effort' },
        values: [{ generation_id: gid, provenance: 'replay', manifest_hash: 'bench-multi', capture_cutoff: toClickHouseDateTime64(CUTOFF), raw_count: pop.observations.length, canonical_key_count: pop.params.units, semantic_digest: '', binding_digest: '', coverage_digest: '', manifest_digest: '' }],
      });
      o.log(`  inserted ${gid}: ${pop.observations.length} raw rows in ${Math.round(performance.now() - tI)} ms`);
    };
    await insertGen(main);
    await insertGen(conf);

    // stored vs distinct (admin lane, not timed)
    const one = async <T>(q: string): Promise<T> => (await (await admin.query({ query: q, format: 'JSONEachRow' })).json<T>())[0] as T;
    const storedMain = await one<{ rows: string; keys: string; variants: string; sessions: string; bindings: string }>(
      `SELECT toString(count()) AS rows, toString(uniqExact(native_identity_key)) AS keys, toString((SELECT count() FROM (SELECT DISTINCT native_identity_key, identity_domain, workspace_id, session_id, native_event_id, native_task_id, credential_id, operation, decision, reason_code, created_at_raw, created_at, unit_mapping_version, semantic_json FROM ${o.db}.native_event_versions WHERE generation_id='bench-main'))) AS variants, toString((SELECT count() FROM ${o.db}.session_snapshots WHERE generation_id='bench-main')) AS sessions, toString((SELECT count() FROM ${o.db}.event_bindings WHERE generation_id='bench-main')) AS bindings FROM ${o.db}.native_event_versions WHERE generation_id='bench-main'`,
    );
    const storedConf = await one<{ rows: string; keys: string }>(`SELECT toString(count()) AS rows, toString(uniqExact(native_identity_key)) AS keys FROM ${o.db}.native_event_versions WHERE generation_id='bench-conflict'`);
    check(Number(storedMain.rows) === main.observations.length, `stored main rows ${storedMain.rows} != generated ${main.observations.length}`);
    check(Number(storedMain.keys) === o.units, `distinct canonical keys ${storedMain.keys} != units ${o.units}`);
    check(storedMain.variants === storedMain.keys, `main: distinct semantic variants (${storedMain.variants}) must equal distinct keys (${storedMain.keys}) (no conflicts)`);
    check(Number(storedConf.rows) === conf.observations.length, 'stored conflict rows match generated');

    // ---------------- 4. measurements ----------------
    const issued: Array<{ queryId: string; cls: string; phase: string }> = [];
    let errors = 0;
    const errorNotes: string[] = [];
    const note = (cls: string, phase: Sample['phase'], index: number, gid: string, group: string, run: { receipt: { queryId: string; clientMs: number; serverMs: number | null; rowCount: number } }, correct: boolean, why: string) => {
      issued.push({ queryId: run.receipt.queryId, cls, phase });
      samples.push({ cls, phase, index, generationId: gid, group, queryId: run.receipt.queryId, clientMs: run.receipt.clientMs, headerServerMs: run.receipt.serverMs, correct, note: why, rowCount: run.receipt.rowCount });
      if (!correct) failures.push(`${cls}#${index}: ${why}`);
      checks++;
    };
    const gname = (g: Group) => `${g.ws}/${g.cred}/${g.op}`;
    const total = o.warmups + o.samples;
    const phaseOf = (j: number): Sample['phase'] => (j < o.warmups ? 'warmup' : 'sample');

    // (a) conflict_check, whole main generation: expect no conflict row
    o.log('(a) conflict_check');
    for (let j = -1; j < total; j++) {
      try {
        const r = await runNamed<{ native_identity_key: string }>(ctx, 'conflictCheck', 'conflict_check', { generation_id: 'bench-main' });
        note('conflict_check', j < 0 ? 'cold' : phaseOf(j), j, 'bench-main', 'all', r, r.rows.length === 0, r.rows.length === 0 ? 'no conflicts (declared 0)' : `unexpected ${r.rows.length} conflict rows`);
      } catch (e) {
        errors++;
        errorNotes.push(`conflict_check#${j}: ${(e as Error).message.slice(0, 160)}`);
      }
    }

    // conflict generation: declared conflict keys must be returned exactly
    o.log('(a) conflict_check on conflict generation (declared keys)');
    {
      const r = await runNamed<{ native_identity_key: string; variant_count_text: string }>(ctx, 'conflictCheck', 'conflict_check', { generation_id: 'bench-conflict' });
      const got = r.rows.map((x) => x.native_identity_key).sort();
      note('conflict_check_conflict_generation', 'sample', 0, 'bench-conflict', 'all', r, JSON.stringify(got) === JSON.stringify(conf.conflictKeys) && r.rows.every((x) => x.variant_count_text === '2'), `returned ${got.length} keys, declared ${conf.conflictKeys.length}`);
      // conflicts are excluded from canonical facts: compare one anchor aggregate per group with the oracle (which drops conflict keys)
      for (let gI = 0; gI < conf.groups.length; gI++) {
        const g = conf.groups[gI] as Group;
        const e = expConf[gI] as ExpectedGroup;
        if (e.anchors.length === 0) continue;
        const idx = Math.floor(e.anchors.length / 2);
        const a = await runNamed<AnchorRow>(ctx, 'anchorAllCandidates', 'anchor_all_candidates', { generation_id: 'bench-conflict', manifest_hash: g.manifest.sha256, window_anchor: toClickHouseDateTime64(BigInt(e.anchors[idx] as string)) });
        const ok = a.rows.length === e.cands.length && e.cands.every((c) => a.rows.find((x) => x.policy_subject_id === c.subject)?.anchor_count === c.counts[idx]);
        note('anchor_all_candidates_conflict_generation', 'sample', gI, 'bench-conflict', gname(g), a, ok, ok ? 'counts equal oracle with conflict keys excluded' : 'count mismatch vs oracle on conflict generation');
      }
    }

    // anchor_list per manifest
    o.log('(a) anchor_list');
    for (let j = -1; j < total; j++) {
      const gI = (j + 1) % main.groups.length;
      const g = main.groups[gI] as Group;
      const e = expMain[gI] as ExpectedGroup;
      try {
        const r = await runNamed<{ anchor_ns: string }>(ctx, 'anchorList', 'anchor_list', { generation_id: 'bench-main', manifest_hash: g.manifest.sha256, window_anchor: toClickHouseDateTime64(CUTOFF) });
        const ok = JSON.stringify(r.rows.map((x) => x.anchor_ns)) === JSON.stringify(e.anchors);
        note('anchor_list', j < 0 ? 'cold' : phaseOf(j), j, 'bench-main', gname(g), r, ok, ok ? `${e.anchors.length} anchors equal oracle` : `anchors differ (sql ${r.rows.length}, oracle ${e.anchors.length})`);
      } catch (e2) {
        errors++;
        errorNotes.push(`anchor_list#${j}: ${(e2 as Error).message.slice(0, 160)}`);
      }
    }

    // (b) one all-candidate anchor aggregate at distinct stratified anchors, rotating over groups
    o.log('(b) anchor_all_candidates');
    for (let j = -1; j < total; j++) {
      const gI = (j + 1) % main.groups.length;
      const g = main.groups[gI] as Group;
      const e = expMain[gI] as ExpectedGroup;
      const idx = ((j + 2) * 7919) % e.anchors.length;
      try {
        const r = await runNamed<AnchorRow>(ctx, 'anchorAllCandidates', 'anchor_all_candidates', { generation_id: 'bench-main', manifest_hash: g.manifest.sha256, window_anchor: toClickHouseDateTime64(BigInt(e.anchors[idx] as string)) });
        const bad = e.cands.filter((c) => r.rows.find((x) => x.policy_subject_id === c.subject)?.anchor_count !== c.counts[idx]).map((c) => c.subject);
        const ok = r.rows.length === e.cands.length && bad.length === 0;
        note('anchor_all_candidates', j < 0 ? 'cold' : phaseOf(j), j, 'bench-main', gname(g), r, ok, ok ? `${e.cands.length} candidate counts equal oracle at anchor index ${idx}` : `mismatch at anchor ${idx}: ${bad.join(',')} rows ${r.rows.length}/${e.cands.length}`);
      } catch (e2) {
        errors++;
        errorNotes.push(`anchor_all_candidates#${j}: ${(e2 as Error).message.slice(0, 160)}`);
      }
    }

    // (d1) independent extraction from ClickHouse (bench's own SELECT, query user lane) ; keep the last extraction for (c)/(d2)
    o.log('(d1) oracle_extract');
    // free the generator copies: the remaining runs use rows read back from ClickHouse
    const mainStats = main.stats;
    const mainGroups = main.groups;
    const cutoffNs = main.cutoffNs;
    const mainRaw = main.observations.length;
    main = { ...main, observations: [], bindings: [], coverage: [] };
    let extracted: { observations: RawObservation[]; bindings: EventBinding[]; coverage: SessionCoverage[] } | null = null;
    const extractOnce = async (index: number, phase: Sample['phase']) => {
      extracted = null;
      const tx = performance.now();
      const queryId = `swb-x-${randomBytes(8).toString('hex')}`;
      const rs = await ch.evaluator.query({
        query: `SELECT identity_domain, native_identity_key, workspace_id, session_id, native_event_id, native_task_id, credential_id, operation, decision, reason_code, created_at_raw,
 toString(toUnixTimestamp64Nano(created_at)) AS created_at_ns, unit_mapping_version, semantic_json FROM native_event_versions WHERE generation_id = {generation_id:String}`,
        query_params: { generation_id: 'bench-main' }, query_id: queryId, format: 'JSONEachRow',
      });
      const raw = await rs.json<Record<string, string | null>>();
      const obs: RawObservation[] = raw.map((x, i) => ({
        observationId: `x${i}`, provenance: 'replay', generationId: 'bench-main', fetchRecordId: '', pageRef: '', nativeIdentityKey: x['native_identity_key'] ?? null, identityDomain: x['identity_domain'] ?? null,
        workspaceId: x['workspace_id'] as string, sessionId: x['session_id'] as string, nativeEventId: x['native_event_id'] ?? null, nativeTaskId: x['native_task_id'] ?? null, credentialId: x['credential_id'] ?? null,
        operation: x['operation'] ?? null, decision: (x['decision'] ?? null) as RawObservation['decision'], reasonCode: x['reason_code'] ?? null, createdAtRaw: x['created_at_raw'] ?? null, createdAt: x['created_at_raw'] ?? null,
        createdAtNs: x['created_at_ns'] ?? null, unitMappingVersion: x['unit_mapping_version'] as string, semanticJson: x['semantic_json'] as string, observedAt: '', contentSha256: '',
      }));
      const rb = await (await ch.evaluator.query({ query: `SELECT native_identity_key, policy_subject_id, binding_state, native_acting_task_id FROM event_bindings WHERE generation_id = {g:String}`, query_params: { g: 'bench-main' }, query_id: `${queryId}-b`, format: 'JSONEachRow' })).json<Record<string, string | null>>();
      const bnd: EventBinding[] = rb.map((x) => ({ generationId: 'bench-main', nativeIdentityKey: x['native_identity_key'] as string, policySubjectId: x['policy_subject_id'] ?? null, bindingState: x['binding_state'] as EventBinding['bindingState'], nativeActingTaskId: x['native_acting_task_id'] ?? null, mappingMethod: '', proofRef: '' }));
      const rc = await (await ch.evaluator.query({ query: `SELECT workspace_id, session_id, coverage_state FROM session_snapshots WHERE generation_id = {g:String}`, query_params: { g: 'bench-main' }, query_id: `${queryId}-c`, format: 'JSONEachRow' })).json<Record<string, string>>();
      const cov: SessionCoverage[] = rc.map((x) => ({ generationId: 'bench-main', workspaceId: x['workspace_id'] as string, sessionId: x['session_id'] as string, launchSubjectId: null, coverageState: x['coverage_state'] as SessionCoverage['coverageState'], expectedPages: 0, fetchedPages: 0, rawRecords: 0, requiredFieldGaps: 0, completionRef: '', notes: [] }));
      const ms = Math.round((performance.now() - tx) * 1000) / 1000;
      for (const suffix of ['', '-b', '-c']) issued.push({ queryId: `${queryId}${suffix}`, cls: 'oracle_extract', phase });
      const ok = obs.length === mainRaw && bnd.length === o.units && cov.length === 2 * SESSIONS_PER_WS;
      samples.push({ cls: 'oracle_extract', phase, index, generationId: 'bench-main', group: 'all', queryId, clientMs: ms, headerServerMs: null, correct: ok, note: `extracted ${obs.length} raw rows + ${bnd.length} bindings + ${cov.length} sessions (3 SELECTs)`, rowCount: obs.length });
      checks++;
      if (!ok) failures.push(`oracle_extract#${index}: extracted ${obs.length}/${mainRaw} raw ${bnd.length}/${o.units} bindings`);
      extracted = { observations: obs, bindings: bnd, coverage: cov };
    };
    for (let j = 0; j < o.oracleExtractRepeats; j++) await extractOnce(j, 'sample');
    const ex = extracted as unknown as { observations: RawObservation[]; bindings: EventBinding[]; coverage: SessionCoverage[] };

    // (c) complete authoritative historical procedure per manifest group (the application's evaluateGeneration)
    o.log('(c) procedure (evaluateGeneration) per group');
    const procRows: Array<{ group: string; wallMs: number; anchors: number; queries: number; anchorQueries: number; ok: boolean }> = [];
    for (let rep = 0; rep < o.procedureRepeats; rep++) {
      for (let gI = 0; gI < mainGroups.length; gI++) {
        const g = mainGroups[gI] as Group;
        const e = expMain[gI] as ExpectedGroup;
        const input: EvaluationInput = { generationId: 'bench-main', provenance: 'replay', manifest: g.manifest, captureCutoff: formatUtcNano(cutoffNs), observations: ex.observations, bindings: ex.bindings, coverage: ex.coverage };
        const tp = performance.now();
        try {
          const ev = await evaluateGeneration(ch, input);
          const wallMs = Math.round((performance.now() - tp) * 1000) / 1000;
          const anchorQ = ev.queries.filter((q) => q.queryClass === 'anchor_all_candidates' || q.queryClass === 'current').length;
          // compare with declared expectations
          const problems: string[] = [];
          if (JSON.stringify(ev.anchors.map((a) => parseUtcNano(a).toString())) !== JSON.stringify(e.anchors)) problems.push('anchor set');
          for (const ec of e.cands) {
            const rc = ev.candidates.find((c) => c.policySubjectId === ec.subject);
            if (!rc) { problems.push(`${ec.subject} missing`); continue; }
            if (rc.allowance !== ec.allowance) problems.push(`${ec.subject} allowance`);
            if (rc.currentCount !== ec.current) problems.push(`${ec.subject} current ${rc.currentCount}!=${ec.current}`);
            if ((rc.peakWitness?.count ?? '0') !== (ec.peak?.count ?? '0') || rc.peakWitness?.anchorNs !== ec.peak?.anchorNs) problems.push(`${ec.subject} peak`);
            if (rc.breached !== (ec.first !== null) || (rc.firstCrossing?.anchorNs ?? null) !== (ec.first?.anchorNs ?? null) || (rc.firstCrossing?.count ?? null) !== (ec.first?.count ?? null)) problems.push(`${ec.subject} first crossing`);
          }
          if (!ev.oracleAgrees) problems.push('internal oracle disagreement');
          const ok = problems.length === 0;
          procRows.push({ group: gname(g), wallMs, anchors: ev.anchors.length, queries: ev.queries.length, anchorQueries: anchorQ, ok });
          samples.push({ cls: 'procedure', phase: 'sample', index: rep * mainGroups.length + gI, generationId: 'bench-main', group: gname(g), queryId: null, clientMs: wallMs, headerServerMs: null, correct: ok, note: ok ? `${ev.anchors.length} anchors, ${ev.queries.length} queries, ${ev.candidates.filter((c) => c.breached).length} breached candidates equal declared oracle` : problems.slice(0, 4).join('; '), rowCount: ev.queries.length, anchors: ev.anchors.length });
          checks++;
          if (!ok) failures.push(`procedure ${gname(g)}: ${problems.slice(0, 4).join('; ')}`);
          for (const q of ev.queries) {
            issued.push({ queryId: q.queryId, cls: `procedure_member:${q.queryClass}`, phase: 'member' });
            samples.push({ cls: `procedure_member:${q.queryClass}`, phase: 'member', index: samples.length, generationId: 'bench-main', group: gname(g), queryId: q.queryId, clientMs: q.clientMs, headerServerMs: q.serverMs, correct: true, note: 'member of procedure (equality asserted at procedure level)', rowCount: q.rowCount });
          }
        } catch (err) {
          errors++;
          errorNotes.push(`procedure ${gname(g)}: ${(err as Error).message.slice(0, 200)}`);
        }
      }
    }

    // (d2) independent oracle sweep per group over rows extracted from ClickHouse
    o.log('(d2) oracle_sweep per group');
    for (let rep = 0; rep < o.procedureRepeats; rep++) {
      for (let gI = 0; gI < mainGroups.length; gI++) {
        const g = mainGroups[gI] as Group;
        const e = expMain[gI] as ExpectedGroup;
        const ts = performance.now();
        const res = expectFrom(runOracle({ observations: ex.observations, bindings: ex.bindings, coverage: ex.coverage, manifest: g.doc, cutoffNs }));
        const ms = Math.round((performance.now() - ts) * 1000) / 1000;
        const ok = JSON.stringify(res) === JSON.stringify(e);
        samples.push({ cls: 'oracle_sweep', phase: 'sample', index: rep * mainGroups.length + gI, generationId: 'bench-main', group: gname(g), queryId: null, clientMs: ms, headerServerMs: null, correct: ok, note: ok ? 'extracted-row oracle equals declared expectations (incl. all counts at all anchors)' : 'oracle on extracted rows differs from declared expectations', rowCount: e.anchors.length, anchors: e.anchors.length });
        checks++;
        if (!ok) failures.push(`oracle_sweep ${gname(g)} differs from declared expectations`);
      }
    }

    // ---------------- 5. reconcile with system.query_log ----------------
    o.log('reconciling with system.query_log');
    await admin.insert({ table: `${o.db}.bench_issued`, values: issued.map((x) => ({ query_id: x.queryId, query_class: x.cls, phase: x.phase })), format: 'JSONEachRow' });
    await admin.command({ query: 'SYSTEM FLUSH LOGS' });
    const logRows = await (
      await admin.query({
        query: `SELECT query_id, type, is_initial_query, query_duration_ms, read_rows, read_bytes, result_rows, memory_usage, exception_code,
 dateDiff('microsecond', query_start_time_microseconds, event_time_microseconds) AS duration_us
 FROM system.query_log WHERE event_date >= today() - 1 AND query_id IN (SELECT query_id FROM ${o.db}.bench_issued) AND type != 'QueryStart'`,
        format: 'JSONEachRow',
      })
    ).json<{ query_id: string; type: string; is_initial_query: number; query_duration_ms: string; read_rows: string; read_bytes: string; result_rows: string; memory_usage: string; exception_code: number; duration_us: string }>();
    const finishById = new Map<string, (typeof logRows)[number][]>();
    for (const r of logRows.filter((x) => x.type === 'QueryFinish')) finishById.set(r.query_id, [...(finishById.get(r.query_id) ?? []), r]);
    const exceptionRows = logRows.filter((x) => x.type !== 'QueryFinish');
    const duplicates = [...finishById.values()].filter((v) => v.length > 1).length;
    const missing = issued.filter((x) => !finishById.has(x.queryId)).length;
    const classes: Record<string, unknown> = {};
    const csv: string[] = ['run_id,dataset_kind,query_class,generation_id,query_id,sample_index,rows_stored,distinct_events,candidates,rows_read,server_duration_ms,client_round_trip_ms,service_version,region,warm_or_cold,correctness_result'];
    const runId = `bench-${startedAt.slice(0, 10)}-${randomBytes(3).toString('hex')}`;
    const candCount = mainGroups.reduce((s, g) => s + g.cands.length, 0);
    const enrich = (s: Sample) => {
      const f = s.queryId ? finishById.get(s.queryId)?.[0] : undefined;
      return f ? { serverMs: Number(f.query_duration_ms), serverUs: Number(f.duration_us), readRows: Number(f.read_rows), readBytes: Number(f.read_bytes), resultRows: Number(f.result_rows), memory: Number(f.memory_usage) } : null;
    };
    const classNames = [...new Set(samples.map((s) => s.cls))];
    for (const cn of classNames) {
      const all = samples.filter((s) => s.cls === cn);
      const timed = all.filter((s) => s.phase === 'sample' || s.phase === 'member');
      const cold = all.filter((s) => s.phase === 'cold');
      const en = timed.map(enrich);
      const serverMs = en.filter((x): x is NonNullable<typeof x> => x !== null).map((x) => x.serverMs);
      const serverUs = en.filter((x): x is NonNullable<typeof x> => x !== null).map((x) => x.serverUs / 1000);
      const clientMs = timed.map((s) => s.clientMs);
      const nz = (f: (x: NonNullable<ReturnType<typeof enrich>>) => number) => en.filter((x): x is NonNullable<typeof x> => x !== null).map(f);
      const isQuery = timed.some((s) => s.queryId !== null);
      classes[cn] = {
        declaredSamplesN: timed.length,
        warmups: all.filter((s) => s.phase === 'warmup').length,
        coldRuns: cold.length,
        coldClientMs: cold.map((s) => round(s.clientMs)),
        clientWallMs: { p50: round(nearestRank(clientMs, 0.5)), p95: round(nearestRank(clientMs, 0.95)), min: round(Math.min(...clientMs)), max: round(Math.max(...clientMs)) },
        serverQueryLog: isQuery
          ? { n: serverMs.length, queryDurationMs: { p50: nearestRank(serverMs, 0.5), p95: nearestRank(serverMs, 0.95) }, microsecondDurationMs: { p50: round(nearestRank(serverUs, 0.5)), p95: round(nearestRank(serverUs, 0.95)) }, readRows: { p50: nearestRank(nz((x) => x.readRows), 0.5), p95: nearestRank(nz((x) => x.readRows), 0.95) }, memoryBytes: { p50: nearestRank(nz((x) => x.memory), 0.5), p95: nearestRank(nz((x) => x.memory), 0.95), max: Math.max(...nz((x) => x.memory), 0) }, resultRows: { p50: nearestRank(nz((x) => x.resultRows), 0.5), max: Math.max(...nz((x) => x.resultRows), 0) } }
          : 'not a single ClickHouse query (in-process or multi-query); see procedure_member classes for server time',
        correctnessFailures: all.filter((s) => !s.correct).length,
      };
      for (const s of all) {
        const e2 = enrich(s);
        const distinct = cn.includes('conflict_generation') ? conf.params.units : o.units;
        csv.push([runId, 'replay_synthetic_local', cn, s.generationId, s.queryId ?? '', s.index, s.generationId === 'bench-conflict' ? conf.observations.length : mainRaw, distinct, s.group === 'all' ? candCount : (mainGroups.find((g) => gname(g) === s.group)?.cands.length ?? ''), e2?.readRows ?? '', e2?.serverMs ?? '', s.clientMs, serverVersion, 'local-docker-laptop', s.phase, s.correct ? 'pass' : 'FAIL'].join(','));
      }
    }
    // procedure summary: anchor evaluations
    const procSamples = procRows;
    (classes['procedure'] as Record<string, unknown>)['perRun'] = procSamples;
    (classes['procedure'] as Record<string, unknown>)['anchorEvaluationsPerRun'] = { total: procSamples.reduce((s, r) => s + r.anchorQueries, 0), definition: 'anchor_all_candidates queries incl. the capture-cutoff evaluation, per manifest, summed over the runs listed in perRun' };
    (classes['procedure'] as Record<string, unknown>)['note'] = 'wall time of evaluateGeneration() includes its in-process independent-oracle equality check (class oracle_sweep) and sequential queries';
    const issuedCount = issued.length;
    const queryLog = {
      issuedQueryIds: issuedCount,
      queryFinishFound: finishById.size,
      missingFromLog: missing,
      duplicateInitialFinishes: duplicates,
      exceptionRowsForIssuedIds: exceptionRows.length,
      applicationErrorsCaught: errors,
      errorNotes: errorNotes.slice(0, 10),
      successCount: issuedCount - missing,
      nonInitialFinishRows: logRows.filter((x) => x.type === 'QueryFinish' && !x.is_initial_query).length,
      note: 'Failed queries have no issued id returned by runNamed; they are counted via applicationErrorsCaught only.',
    };
    check(missing === 0, `${missing} issued query ids missing from system.query_log`);
    check(duplicates === 0, `${duplicates} duplicate QueryFinish rows`);
    check(errors === 0, `${errors} application errors: ${errorNotes.join(' | ')}`);

    const finishedAt = new Date().toISOString();
    const results: BenchResults = {
      label: 'REPLAY synthetic population on LOCAL ClickHouse in docker (laptop). Not ClickHouse Cloud, not native Guild evidence, not containment latency, not a production SLA.',
      startedAt,
      finishedAt,
      environment: {
        clickhouseVersion: serverVersion,
        image: composeImage(),
        target: 'clickhouse_local',
        database: o.db,
        host: { platform: os.platform(), arch: os.arch(), cpuModel: os.cpus()[0]?.model, logicalCpus: os.cpus().length, totalMemBytes: os.totalmem(), node: process.version },
        docker: dockerInfo(),
        concurrency: 1,
        note: 'Queries issued sequentially from one Node process; OS page cache and ClickHouse mark/uncompressed caches were NOT dropped between runs, so warm samples are cache-warm repeated-shape workloads.',
      },
      declaration: {
        samplesPerQueryClass: o.samples, warmups: o.warmups, coldRunsPerClass: 'one run before warmups (first execution of the class after population insert; caches not dropped)',
        percentileEstimator: 'nearest-rank, rank = ceil(q*n)', procedureRepeatsPerGroup: o.procedureRepeats, oracleExtractRepeats: o.oracleExtractRepeats,
        classes: { a: 'conflict_check (whole-generation conflict/canonical extraction) and anchor_list (canonical selected-ALLOW anchors per manifest)', b: 'anchor_all_candidates (one anchor, all candidates of one manifest)', c: 'procedure = application evaluateGeneration over all anchors of one manifest; sample unit = one manifest (8 distinct manifests)', d: 'oracle_extract (3 SELECTs reading raw rows/bindings/sessions back) and oracle_sweep (runOracle per manifest)' },
        anchorSelectionForB: 'stratified deterministic: group = j mod 8, anchor index = ((j+2)*7919) mod anchors(group); all distinct from repeated cutoff queries',
        serverTimeSource: 'system.query_log QueryFinish filtered by exact issued query_ids (joined through bench_issued) after SYSTEM FLUSH LOGS; query_duration_ms is integer milliseconds, microsecond duration derived from query_start/event_time_microseconds',
      },
      population: {
        main: { ...mainStats, storedRawRows: Number(storedMain.rows), distinctCanonicalKeys: Number(storedMain.keys), distinctSemanticVariants: Number(storedMain.variants), bindingRows: Number(storedMain.bindings), sessionRows: Number(storedMain.sessions) },
        conflict: { storedRawRows: Number(storedConf.rows), distinctKeys: Number(storedConf.keys), declaredConflictKeys: conf.conflictKeys.length, units: conf.params.units },
        selection: 'selected candidates = all declared candidates of the 8 manifests; unit of count = distinct native identity of a verified-bound ALLOW in a complete session within (T-600s,T] and effective_from <= t <= cutoff',
        antiInflation: 'no cloned identical rows beyond declared exact redeliveries (same identity & content, new observation id); stored rows vs distinct canonical units reported above',
        perGroupAnchors: expMain.map((e, i) => ({ group: gname(mainGroups[i] as Group), anchors: e.anchors.length, candidates: e.cands.length, breached: e.cands.filter((c) => c.first).length, currentNonZero: e.cands.filter((c) => c.current !== '0').length, lateBreachWithZeroCurrent: e.cands.filter((c) => c.first && c.current === '0').length })),
      },
      expectedDigest: { sha256: expectedSha, computedBeforeQueries: expectedAt },
      classes,
      correctness: { checks, failures },
      queryLog,
      samples,
      limitations: [
        'Synthetic seeded replay population; no real fleet, customer events, attack accuracy or containment performance follows from it.',
        'Local ClickHouse 25.8 in docker with limited container resources on a laptop; not Cloud, not multi-node, no replication.',
        'Caches are not dropped; "cold" is only the first execution of a class after insertion and is not a true cold-cache measurement.',
        'n is small (declared per class); p95 at n=20 is the 19th sorted value and has little tail precision; p95 at n=8 equals the maximum.',
        'Sequential single-client execution; no concurrency or throughput claim.',
        'The procedure wall time includes the in-process oracle equality check and the oracle runs on rows extracted from ClickHouse.',
        'Allowances were chosen from realized peaks (parameter selection); expected answers come from the independent oracle, not from those peaks.',
      ],
    };

    if (o.outDir) {
      mkdirSync(o.outDir, { recursive: true });
      writeFileSync(path.join(o.outDir, 'results.json'), JSON.stringify(results, null, 2) + '\n');
      writeFileSync(path.join(o.outDir, 'results.csv'), csv.join('\n') + '\n');
    }
    return results;
  } finally {
    await ch.close();
    if (o.dropAtEnd) await dropNamespace(admin, o.db, users).catch(() => undefined);
    await admin.close();
  }
}

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------
function arg(name: string, def: number): number {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? Number(process.argv[i + 1]) : def;
}

async function main(): Promise<void> {
  const date = new Date().toISOString().slice(0, 10);
  const keep = process.argv.includes('--keep');
  const outArg = process.argv.indexOf('--out');
  const r = await runBench({
    db: 'scopewatch_bench',
    url: process.env['CLICKHOUSE_URL'] ?? 'http://127.0.0.1:18123',
    adminUser: process.env['SCOPEWATCH_CH_ADMIN_USER'] ?? 'sw_admin',
    adminPassword: process.env['SCOPEWATCH_CH_ADMIN_PASSWORD'] ?? 'local-dev-admin',
    units: arg('units', 900_000),
    conflictUnits: arg('conflict-units', 30_000),
    anchorsPerGroup: arg('anchors', 60),
    conflicts: arg('conflicts', 8),
    seed: arg('seed', 20261009),
    samples: arg('n', 20),
    warmups: arg('warmups', 2),
    procedureRepeats: arg('proc-repeats', 1),
    oracleExtractRepeats: arg('extract-repeats', 3),
    dropAtEnd: !keep,
    outDir: outArg >= 0 ? (process.argv[outArg + 1] as string) : `evidence/sanitized/bench-local-${date}`,
    log: (s) => console.log(s),
  });
  console.log(`\ncorrectness: ${r.correctness.checks} checks, ${r.correctness.failures.length} failures`);
  for (const f of r.correctness.failures.slice(0, 20)) console.log(`  FAIL ${f}`);
  console.log(JSON.stringify(r.classes, null, 1));
  console.log(JSON.stringify(r.queryLog, null, 1));
  if (r.correctness.failures.length) process.exitCode = 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((e) => {
    console.error(`bench failed: ${(e as Error).stack ?? e}`);
    process.exit(1);
  });
}

