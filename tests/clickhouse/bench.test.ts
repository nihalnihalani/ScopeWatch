import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { generatePopulation, nearestRank, runBench } from '../../tools/bench.js';
import { CH_URL, chSkipReason } from './helpers.js';

const skip = await chSkipReason();
if (skip) console.warn(`[tests/clickhouse/bench] SKIPPED: ${skip}`);
const d = skip ? describe.skip : describe;

describe('bench helpers (no ClickHouse needed)', () => {
  it('nearest-rank percentiles use rank ceil(q*n)', () => {
    const v = Array.from({ length: 20 }, (_, i) => 20 - i);
    expect(nearestRank(v, 0.5)).toBe(10);
    expect(nearestRank(v, 0.95)).toBe(19);
    expect(nearestRank([], 0.5)).toBeNull();
  });

  it('population is seeded, deterministic and has redeliveries without cloned identities', () => {
    const p = { generationId: 'g', seed: 7, units: 2000, anchorsPerGroup: 6, redeliveryFrac: 0.12, conflicts: 0, policyVersion: 'v' };
    const a = generatePopulation(p);
    const b = generatePopulation(p);
    expect(a.observations.length).toBe(b.observations.length);
    expect(a.observations.length).toBeGreaterThan(2000);
    expect(new Set(a.observations.map((o) => o.nativeIdentityKey)).size).toBe(2000);
    expect(a.groups.reduce((s, g) => s + g.cands.length, 0)).toBe(50);
  });
});

d('bench at tiny scale: SQL equals the declared independent oracle (real executed SQL, local server)', () => {
  it('runs every measurement class, reconciles query_log and finds zero correctness failures', async () => {
    const res = await runBench({
      db: `sw_bench_t_${randomBytes(3).toString('hex')}`,
      url: CH_URL,
      adminUser: process.env['SCOPEWATCH_CH_ADMIN_USER'] ?? 'sw_admin',
      adminPassword: process.env['SCOPEWATCH_CH_ADMIN_PASSWORD'] ?? 'local-dev-admin',
      units: 3000,
      conflictUnits: 1500,
      anchorsPerGroup: 6,
      conflicts: 4,
      seed: 11,
      samples: 4,
      warmups: 1,
      procedureRepeats: 1,
      oracleExtractRepeats: 1,
      dropAtEnd: true,
      outDir: null,
      log: () => undefined,
    });
    expect(res.correctness.failures).toEqual([]);
    expect(res.correctness.checks).toBeGreaterThan(30);
    const ql = res.queryLog as { missingFromLog: number; issuedQueryIds: number; applicationErrorsCaught: number };
    expect(ql.missingFromLog).toBe(0);
    expect(ql.applicationErrorsCaught).toBe(0);
    expect(ql.issuedQueryIds).toBeGreaterThan(50);
    for (const cls of ['conflict_check', 'anchor_list', 'anchor_all_candidates', 'procedure', 'oracle_extract', 'oracle_sweep']) {
      expect(Object.keys(res.classes), cls).toContain(cls);
    }
    const pop = res.population as { main: { storedRawRows: number; distinctCanonicalKeys: number } };
    expect(pop.main.storedRawRows).toBeGreaterThan(pop.main.distinctCanonicalKeys);
  }, 240_000);
});
