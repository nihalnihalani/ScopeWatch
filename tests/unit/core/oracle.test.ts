import { describe, expect, it } from 'vitest';
import { runOracle } from '../../../src/core/oracle.js';
import { parseUtcNano } from '../../../src/core/time.js';
import { SEC, T0, WS, build, manifestDoc, mkObs, run, type EvSpec } from './fixtures.js';

const G = 'g';
const CUTOFF = parseUtcNano('2026-10-09T12:30:00Z');

function oracle(evs: EvSpec[], allow: Array<[string, string, string]>, sessions: string[], extra: { cutoff?: bigint; effectiveFrom?: string } = {}) {
  const b = build(G, evs, sessions);
  return runOracle({ ...b, manifest: manifestDoc(allow, extra.effectiveFrom), cutoffNs: extra.cutoff ?? CUTOFF });
}
const cand = (r: ReturnType<typeof oracle>, s: string) => r.candidates.find((c) => c.policySubjectId === s)!;

describe('oracle window semantics (T-600s, T]', () => {
  it('an event EXACTLY 600s old is excluded from the window; 1ns younger is included', () => {
    const excl = oracle([{ id: 'a', session: 's', subject: 'x', at: T0 }, { id: 'b', session: 's', subject: 'x', at: T0 + 600n * SEC }], [['x', 'X', '1']], ['s']);
    expect(cand(excl, 'x').firstCrossing).toBeNull();
    expect(cand(excl, 'x').counts).toEqual([1n, 1n]);
    const incl = oracle([{ id: 'a', session: 's', subject: 'x', at: T0 }, { id: 'b', session: 's', subject: 'x', at: T0 + 600n * SEC - 1n }], [['x', 'X', '1']], ['s']);
    expect(cand(incl, 'x').firstCrossing?.count).toBe(2n);
  });

  it('the anchor itself is included (upper bound inclusive) and the comparison is strict >', () => {
    const r = oracle(run('e', 'x', ['s'], 3, T0, 10), [['x', 'X', '3']], ['s']);
    expect(cand(r, 'x').peak?.count).toBe(3n);
    expect(cand(r, 'x').firstCrossing).toBeNull(); // 3 is not > 3
    const r2 = oracle(run('e', 'x', ['s'], 3, T0, 10), [['x', 'X', '2']], ['s']);
    expect(cand(r2, 'x').firstCrossing?.count).toBe(3n);
  });

  it('manifest effective start is inclusive; one nanosecond earlier is excluded', () => {
    const r = oracle([{ id: 'in', session: 's', subject: 'x', at: T0 }, { id: 'pre', session: 's', subject: 'x', at: T0 - 1n }], [['x', 'X', '5']], ['s']);
    expect(r.anchors).toEqual([T0]);
    expect(cand(r, 'x').peak?.identityKeys).toEqual([JSON.stringify([WS, 'in'])]);
  });

  it('a 10-event tie group takes the count 20 -> 30 at once; the witness holds all 30, not an arbitrary 21st', () => {
    const evs = [...run('a', 'x', ['s1', 's2'], 20, T0, 10), ...Array.from({ length: 10 }, (_, i) => ({ id: `t-${i}`, session: i % 2 ? 's1' : 's2', subject: 'x', at: T0 + 300n * SEC }))];
    const r = oracle(evs, [['x', 'X', '20']], ['s1', 's2']);
    const c = cand(r, 'x');
    expect(c.firstCrossing?.count).toBe(30n);
    expect(c.firstCrossing?.anchorNs).toBe(T0 + 300n * SEC);
    expect(c.firstCrossing?.identityKeys).toHaveLength(30);
    expect(c.firstCrossing?.sessions.map((s) => s.count).reduce((a, b) => a + b, 0n)).toBe(30n);
  });

  it('late historical breach survives while the count at the cutoff is 0', () => {
    const r = oracle(run('a', 'x', ['s'], 25, T0, 5), [['x', 'X', '20']], ['s'], { cutoff: T0 + 3n * 3600n * SEC });
    const c = cand(r, 'x');
    expect(c.firstCrossing?.count).toBe(21n);
    expect(c.peak?.count).toBe(25n);
    expect(c.currentCount).toBe(0n);
  });

  it('a candidate with a complete session but no events is an explicit zero; peak is null', () => {
    const r = oracle(run('a', 'x', ['s'], 3, T0, 10), [['x', 'X', '1'], ['zero', 'Z', '5']], ['s']);
    const z = cand(r, 'zero');
    expect(z.counts.every((n) => n === 0n)).toBe(true);
    expect(z.peak).toBeNull();
    expect(z.currentCount).toBe(0n);
  });

  it('only ALLOW decisions count; DENY events never contribute', () => {
    const r = oracle([...run('a', 'x', ['s'], 3, T0, 10), { id: 'd1', session: 's', subject: 'x', at: T0 + 5n * SEC, decision: 'DENY' }], [['x', 'X', '2']], ['s']);
    expect(cand(r, 'x').peak?.count).toBe(3n);
  });

  it('ties are per distinct timestamp; per-event subject binding attributes a nested call to its own actor', () => {
    const evs: EvSpec[] = [
      { id: 'p1', session: 'root', subject: 'A', at: T0 },
      { id: 'p2', session: 'root', subject: 'B', at: T0 }, // delegated call inside A's session belongs to B
      { id: 'p3', session: 'root', subject: 'B', at: T0 + SEC },
    ];
    const r = oracle(evs, [['A', 'A', '5'], ['B', 'B', '5']], ['root']);
    expect(cand(r, 'A').peak?.count).toBe(1n);
    expect(cand(r, 'B').peak?.count).toBe(2n);
  });

  it('a changed-copy conflict removes the identity from canonical facts and is reported', () => {
    const b = build(G, run('a', 'x', ['s'], 3, T0, 10), ['s']);
    const changed = mkObs(G, { id: 'a-002', session: 's', at: T0 + 10n * SEC, decision: 'DENY', copy: 2 });
    const r = runOracle({ ...b, observations: [...b.observations, changed], manifest: manifestDoc([['x', 'X', '1']]), cutoffNs: CUTOFF });
    expect(r.conflictKeys).toEqual([JSON.stringify([WS, 'a-002'])]);
    expect(r.candidates[0]?.peak?.count).toBe(2n);
  });

  it('sessions that are not complete do not contribute', () => {
    const b = build(G, run('a', 'x', ['s1', 's2'], 4, T0, 10), ['s1', 's2']);
    const coverage = b.coverage.map((c) => (c.sessionId === 's2' ? { ...c, coverageState: 'open' as const } : c));
    const r = runOracle({ ...b, coverage, manifest: manifestDoc([['x', 'X', '1']]), cutoffNs: CUTOFF });
    expect(r.candidates[0]?.peak?.count).toBe(2n);
  });

  it('matches a brute-force count at every anchor on 150 randomized timestamp sets (ties and boundaries included)', () => {
    let seed = 12345 >>> 0;
    const rnd = (m: number) => {
      // mulberry32
      seed = (seed + 0x6d2b79f5) >>> 0;
      let t = seed;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return Math.floor((((t ^ (t >>> 14)) >>> 0) / 4294967296) * m);
    };
    for (let round = 0; round < 150; round++) {
      const n = 1 + rnd(40);
      const evs: EvSpec[] = Array.from({ length: n }, (_, i) => ({
        id: `r${round}-${i}`, session: `s${rnd(3)}`, subject: rnd(2) ? 'x' : 'y',
        // coarse grid around multiples of 600s forces ties and exact-boundary pairs
        at: T0 + BigInt(rnd(5) * 300 + rnd(3)) * SEC + BigInt(rnd(2)),
      }));
      const allow = 1 + rnd(8);
      const o = oracle(evs, [['x', 'X', String(allow)], ['y', 'Y', String(allow)]], ['s0', 's1', 's2'], { cutoff: T0 + 3000n * SEC });
      for (const subject of ['x', 'y']) {
        const times = evs.filter((e) => e.subject === subject).map((e) => e.at as bigint);
        o.anchors.forEach((t, i) => {
          const brute = BigInt(times.filter((x) => x > t - 600n * SEC && x <= t).length);
          expect(cand(o, subject).counts[i], `round ${round} ${subject} anchor ${t}`).toBe(brute);
        });
      }
    }
  });
});
