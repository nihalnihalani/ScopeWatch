import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GenerationNotAdmissibleError, evaluateGeneration } from '../../src/integrations/clickhouse/evaluator.js';
import { Publisher } from '../../src/integrations/clickhouse/publisher.js';
import { runNamed } from '../../src/integrations/clickhouse/queries.js';
import { chSkipReason, makeNamespace, mkBundle, type FixtureOpts, type Namespace } from './helpers.js';
import { SEC, T0, WS, mkObs, run, type EvSpec } from '../unit/core/fixtures.js';
import { toClickHouseDateTime64 } from '../../src/core/time.js';

const skip = await chSkipReason();
if (skip) console.warn(`[tests/clickhouse] SKIPPED: ${skip}`);
const d = skip ? describe.skip : describe;

d('all-anchor ClickHouse SQL equals the independent oracle (real executed SQL, local server)', () => {
  let ns: Namespace;
  let pub: Publisher;
  let n = 0;
  beforeAll(async () => {
    ns = await makeNamespace();
    pub = new Publisher(ns.ch, 'replay');
  });
  afterAll(async () => {
    await ns?.drop();
  });

  /** publish + readback + evaluate; evaluateGeneration throws OracleMismatchError if SQL and oracle disagree. */
  async function go(evs: EvSpec[], sessions: string[], allow: Array<[string, string, string]>, opts: FixtureOpts = {}) {
    const { bundle, input } = mkBundle(`g-${++n}`, evs, sessions, allow, opts);
    await pub.insert(bundle);
    const rb = await pub.readback(bundle);
    expect(rb.ok, rb.mismatches.join(';')).toBe(true);
    const ev = await evaluateGeneration(ns.ch, input);
    expect(ev.oracleAgrees).toBe(true);
    const by = (s: string) => ev.candidates.find((c) => c.policySubjectId === s)!;
    return { ev, by, bundle };
  }

  it('an event exactly 600s old is excluded (strict lower bound); the anchor itself is included', async () => {
    const { by } = await go([{ id: 'a', session: 's', subject: 'x', at: T0 }, { id: 'b', session: 's', subject: 'x', at: T0 + 600n * SEC }], ['s'], [['x', 'X', '1']]);
    expect(by('x').firstCrossing).toBeNull();
    expect(by('x').peakCount).toBe('1');
    expect(by('x').breached).toBe(false);
  });

  it('one nanosecond inside the window crosses (count 2 > allowance 1)', async () => {
    const { by } = await go([{ id: 'a', session: 's', subject: 'x', at: T0 }, { id: 'b', session: 's', subject: 'x', at: T0 + 600n * SEC - 1n }], ['s'], [['x', 'X', '1']]);
    expect(by('x').firstCrossing).toMatchObject({ count: '2', anchorNs: (T0 + 600n * SEC - 1n).toString() });
  });

  it('a 10-event tie group takes the count 20 -> 30 in one step; witness holds all 30 identities and session split', async () => {
    const evs: EvSpec[] = [...run('a', 'x', ['s1', 's2'], 20, T0, 10), ...Array.from({ length: 10 }, (_, i) => ({ id: `t-${String(i).padStart(2, '0')}`, session: i < 6 ? 's1' : 's2', subject: 'x', at: T0 + 300n * SEC }))];
    const { by, ev } = await go(evs, ['s1', 's2'], [['x', 'X', '20']]);
    expect(by('x').firstCrossing).toMatchObject({ count: '30', allowance: '20', anchorNs: (T0 + 300n * SEC).toString() });
    expect(by('x').firstCrossing!.identityKeys).toHaveLength(30);
    expect(by('x').firstCrossing!.sessions.reduce((a, s) => a + BigInt(s.count), 0n)).toBe(30n);
    expect(ev.primary?.policySubjectId).toBe('x');
    expect(by('x').firstCrossing!.queryId).toMatch(/^sw-/);
  });

  it('manifest effective start is inclusive; the nanosecond before is excluded', async () => {
    const { by, ev } = await go([{ id: 'in', session: 's', subject: 'x', at: T0 }, { id: 'pre', session: 's', subject: 'x', at: T0 - 1n }], ['s'], [['x', 'X', '5']]);
    expect(by('x').peakCount).toBe('1');
    expect(ev.anchors).toEqual(['2026-10-09T12:00:00Z']);
  });

  it('late historical breach: first crossing and peak survive while the count at the cutoff is 0', async () => {
    const { by } = await go(run('a', 'x', ['s'], 25, T0, 5), ['s'], [['x', 'X', '20']], { cutoff: '2026-10-09T18:00:00Z' });
    expect(by('x')).toMatchObject({ currentCount: '0', peakCount: '25', breached: true });
    expect(by('x').firstCrossing?.count).toBe('21');
  });

  it('zero-event candidate is reported (explicit zero), DENY events and exact redeliveries are not double counted', async () => {
    const evs: EvSpec[] = [...run('a', 'x', ['s'], 3, T0, 10), { id: 'dup', session: 's', subject: 'x', at: T0 + 100n * SEC, copies: 3 }, { id: 'den', session: 's', subject: 'x', at: T0 + 101n * SEC, decision: 'DENY' }];
    const { by, ev } = await go(evs, ['s'], [['x', 'X', '3'], ['zero', 'Z', '2']]);
    expect(by('zero')).toMatchObject({ peakCount: '0', currentCount: '0', breached: false, peakWitness: null });
    expect(by('x').peakCount).toBe('4');
    expect(by('x').breached).toBe(true);
    expect(ev.candidates).toHaveLength(2);
  });

  it('per-event acting subject: a delegated call inside another subject\'s session is counted for the actual actor', async () => {
    const { by } = await go([
      { id: 'p1', session: 'root', subject: 'A', at: T0 }, { id: 'p2', session: 'root', subject: 'B', at: T0 }, { id: 'p3', session: 'root', subject: 'B', at: T0 + SEC },
    ], ['root'], [['A', 'A', '5'], ['B', 'B', '1']]);
    expect(by('A').peakCount).toBe('1');
    expect(by('B')).toMatchObject({ peakCount: '2', breached: true });
  });

  it('a session without complete coverage contributes nothing in SQL, exactly like the oracle', async () => {
    const { by } = await go(run('a', 'x', ['s1', 's2'], 6, T0, 10), ['s1', 's2'], [['x', 'X', '2']], {
      mutateBuilt: (b) => ({ ...b, coverage: b.coverage.map((c) => (c.sessionId === 's2' ? { ...c, coverageState: 'open' as const } : c)) }),
    });
    expect(by('x').peakCount).toBe('3');
  });

  it('several candidates cross: all are returned and the primary follows first-crossing, excess, ids ordering', async () => {
    const evs: EvSpec[] = [...run('a', 'A', ['s'], 4, T0, 10), ...run('b', 'B', ['s'], 4, T0 + 5n * SEC, 10)];
    const { ev } = await go(evs, ['s'], [['A', 'A', '2'], ['B', 'B', '1']]);
    // A crosses (3 > 2) at T0+20s, B crosses (2 > 1) at T0+15s => B first
    expect(ev.breachedKeys.map((k) => k.policySubjectId)).toEqual(['B', 'A']);
    expect(ev.primary?.policySubjectId).toBe('B');
  });

  it('every distinct anchor is evaluated in SQL: receipts hold one all-candidate query per anchor plus the cutoff', async () => {
    const { ev } = await go(run('a', 'x', ['s'], 7, T0, 10), ['s'], [['x', 'X', '3']]);
    expect(ev.queries.filter((q) => q.queryClass === 'anchor_all_candidates')).toHaveLength(7);
    expect(ev.queries.filter((q) => q.queryClass === 'current')).toHaveLength(1);
    expect(ev.queries.every((q) => q.serverVersion === ns.ch.serverVersion && q.target === 'clickhouse_local' && q.sqlSha256.length === 64 && q.queryId.startsWith('sw-'))).toBe(true);
    expect(ev.queries.find((q) => q.queryClass === 'anchor_all_candidates')!.params).toMatchObject({ manifest_hash: expect.any(String), window_anchor: expect.stringMatching(/^2026-10-09 12:00:\d\d\.\d{9}$/) });
  });

  it('matches the oracle on 25 randomized fixtures (ties, exact-600s pairs, DENYs, redeliveries, two candidates)', async () => {
    let seed = 987654321 >>> 0;
    const rnd = (m: number) => {
      // mulberry32
      seed = (seed + 0x6d2b79f5) >>> 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * m);
    };
    for (let round = 0; round < 25; round++) {
      const count = 1 + rnd(30);
      const evs: EvSpec[] = Array.from({ length: count }, (_, i) => ({
        id: `r${round}-${i}`, session: `s${rnd(3)}`, subject: rnd(2) ? 'x' : 'y', at: T0 + BigInt(rnd(4) * 300 + rnd(2)) * SEC + BigInt(rnd(3)),
        decision: rnd(6) === 0 ? ('DENY' as const) : ('ALLOW' as const), copies: rnd(5) === 0 ? 2 : 1,
      }));
      const a = 1 + rnd(6);
      await go(evs, ['s0', 's1', 's2'], [['x', 'X', String(a)], ['y', 'Y', String(a + 1)]], { cutoff: '2026-10-09T13:00:00Z' });
    }
  });
});

d('conflict-first blocking in SQL', () => {
  let ns: Namespace;
  let pub: Publisher;
  beforeAll(async () => {
    ns = await makeNamespace();
    pub = new Publisher(ns.ch, 'replay');
  });
  afterAll(async () => {
    await ns?.drop();
  });

  async function conflictCase(gen: string, changed: Parameters<typeof mkObs>[1]) {
    const { bundle, input } = mkBundle(gen, run('a', 'x', ['s'], 3, T0, 10), ['s'], [['x', 'X', '1']]);
    // a second, changed copy of a-002 (e.g. an out-of-window DENY that a filter-first design would drop)
    const rogue = mkObs(gen, { ...changed, copy: 2 });
    const tampered = { ...bundle, observations: [...bundle.observations, rogue] };
    await pub.insertRaw(tampered); // bypasses journal readiness on purpose: SQL must block independently
    return { tampered, input: { ...input, observations: tampered.observations } };
  }

  it.each([
    ['decision flipped to DENY', { id: 'a-002', session: 's', at: T0 + 10n * SEC, decision: 'DENY' as const }],
    ['timestamp moved far outside the window', { id: 'a-002', session: 's', at: T0 + 5000n * SEC }],
    ['session changed', { id: 'a-002', session: 'other', at: T0 + 10n * SEC }],
  ])('%s: the generation is not admissible and no count is produced', async (_n, changed) => {
    const gen = `gc-${_n.length}-${Math.random().toString(36).slice(2, 6)}`;
    const { input } = await conflictCase(gen, changed);
    await expect(evaluateGeneration(ns.ch, input)).rejects.toBeInstanceOf(GenerationNotAdmissibleError);
    const q = await runNamed<{ native_identity_key: string; variant_count_text: string }>(
      { client: ns.ch.evaluator, database: ns.db, target: 'clickhouse_local', serverVersion: ns.ch.serverVersion }, 'conflictCheck', 'conflict_check', { generation_id: gen });
    expect(q.rows).toEqual([{ native_identity_key: JSON.stringify([WS, 'a-002']), variant_count_text: '2' }]);
  });

  it('exact redelivery is NOT a conflict in SQL (delivery-only fields are not compared)', async () => {
    const { bundle, input } = mkBundle('g-redeliver', [{ id: 'e', session: 's', subject: 'x', at: T0, copies: 3 }], ['s'], [['x', 'X', '1']]);
    await pub.insert(bundle);
    const ev = await evaluateGeneration(ns.ch, input);
    expect(ev.candidates[0]!.peakCount).toBe('1');
  });

  it('DateTime64 anchor parameters bind exactly (typed parameter, nanosecond text)', async () => {
    const { bundle } = mkBundle('g-param', [{ id: 'e', session: 's', subject: 'x', at: T0 + 7n }], ['s'], [['x', 'X', '1']]);
    await pub.insert(bundle);
    const ctx = { client: ns.ch.evaluator, database: ns.db, target: 'clickhouse_local' as const, serverVersion: ns.ch.serverVersion };
    const base = { generation_id: 'g-param', manifest_hash: bundle.manifest.sha256 };
    const before = await runNamed<{ anchor_count: string }>(ctx, 'anchorAllCandidates', 'anchor_all_candidates', { ...base, window_anchor: toClickHouseDateTime64(T0 + 6n) });
    const at = await runNamed<{ anchor_count: string }>(ctx, 'anchorAllCandidates', 'anchor_all_candidates', { ...base, window_anchor: toClickHouseDateTime64(T0 + 7n) });
    expect(before.rows[0]!.anchor_count).toBe('0');
    expect(at.rows[0]!.anchor_count).toBe('1');
  });
});
