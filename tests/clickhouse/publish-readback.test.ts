import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { GenerationAlreadyPublishedError, Publisher } from '../../src/integrations/clickhouse/publisher.js';
import { chSkipReason, makeNamespace, mkBundle, type Namespace } from './helpers.js';
import { SEC, T0, run } from '../unit/core/fixtures.js';

const skip = await chSkipReason();
if (skip) console.warn(`[tests/clickhouse] SKIPPED: ${skip}`);
const d = skip ? describe.skip : describe;

d('publish + exact readback against a real local ClickHouse server', () => {
  let ns: Namespace;
  let pub: Publisher;
  const evs = [...run('a', 'subj-a', ['s1', 's2'], 6, T0, 10), { id: 'a-001', session: 's1', subject: 'subj-a', at: T0, copies: 2 }].slice(0, 6);
  const mk = (gen: string, mutate?: Parameters<typeof mkBundle>[4]) => mkBundle(gen, evs, ['s1', 's2'], [['subj-a', 'A', '3'], ['subj-b', 'B', '9']], mutate);

  beforeAll(async () => {
    ns = await makeNamespace();
    pub = new Publisher(ns.ch, 'replay');
  });
  afterAll(async () => {
    await ns?.drop();
  });

  it('exposes the executing server version (receipt material)', () => {
    expect(ns.ch.serverVersion).toMatch(/^\d+\.\d+/);
    expect(ns.config.target).toBe('clickhouse_local');
  });

  it('publish then readback matches every component, with real query ids', async () => {
    const { bundle } = mk('g-ok');
    await pub.insert(bundle);
    const rb = await pub.readback(bundle);
    expect(rb).toMatchObject({ ok: true, components: { rawIds: true, semantics: true, bindings: true, coverage: true, manifest: true }, mismatches: [] });
    expect(rb.queryIds.length).toBeGreaterThanOrEqual(5);
    await ns.admin.command({ query: 'SYSTEM FLUSH LOGS' });
    const rs = await ns.admin.query({ query: `SELECT count() AS n FROM system.query_log WHERE type = 'QueryFinish' AND query_id IN {ids:Array(String)}`, query_params: { ids: rb.queryIds }, format: 'JSONEachRow' });
    expect(Number(((await rs.json<{ n: string }>())[0] as { n: string }).n)).toBe(rb.queryIds.length);
  });

  it('a second blind publish of the same generation id is refused', async () => {
    await expect(pub.insert(mk('g-ok').bundle)).rejects.toBeInstanceOf(GenerationAlreadyPublishedError);
  });

  it('a double insert (e.g. retry after an unknown ACK) fails readback on row multiplicity; no admission', async () => {
    const { bundle } = mk('g-double');
    await pub.insert(bundle);
    await pub.insertRaw(bundle); // simulates the blind re-insert
    const rb = await pub.readback(bundle);
    expect(rb.ok).toBe(false);
    expect(rb.components.rawIds).toBe(false);
    expect(rb.components.bindings).toBe(false);
    expect(rb.components.coverage).toBe(false);
    expect(rb.mismatches.join(' ')).toMatch(/multiplicity|expected \d+ rows/);
  });

  it('same native IDs but altered acting-subject bindings => readback_failed on bindings only', async () => {
    const { bundle } = mk('g-bind');
    const altered = { ...bundle, bindings: bundle.bindings.map((b, i) => (i === 0 ? { ...b, policySubjectId: 'subj-b' } : b)) };
    await pub.insertRaw(altered);
    const rb = await pub.readback(bundle);
    expect(rb.ok).toBe(false);
    expect(rb.components).toMatchObject({ rawIds: true, semantics: true, bindings: false, coverage: true });
  });

  it('altered decision with the same IDs => semantics mismatch', async () => {
    const { bundle } = mk('g-sem');
    const altered = { ...bundle, observations: bundle.observations.map((o, i) => (i === 0 ? { ...o, decision: 'DENY' as const } : o)) };
    await pub.insertRaw(altered);
    const rb = await pub.readback(bundle);
    expect(rb.components).toMatchObject({ rawIds: true, semantics: false });
    expect(rb.ok).toBe(false);
  });

  it('a partial insert (cohort only partly present) fails readback', async () => {
    const { bundle } = mk('g-part');
    await pub.insertRaw({ ...bundle, observations: bundle.observations.slice(0, 2) });
    const rb = await pub.readback(bundle);
    expect(rb.components.rawIds).toBe(false);
    expect(rb.ok).toBe(false);
  });

  it('altered coverage state or manifest allowance rows fail their own components', async () => {
    const { bundle } = mk('g-cov');
    await pub.insertRaw({ ...bundle, coverage: bundle.coverage.map((c, i) => (i === 0 ? { ...c, coverageState: 'open' as const } : c)) });
    const rb = await pub.readback(bundle);
    expect(rb.components.coverage).toBe(false);

    // own manifest hash so the tampering cannot leak into other tests of this namespace
    const m = mkBundle('g-man', evs, ['s1', 's2'], [['subj-a', 'A', '4'], ['subj-b', 'B', '9']]);
    await pub.insert(m.bundle);
    expect((await pub.readback(m.bundle)).components.manifest).toBe(true);
    // a second, contradictory allowance row for the same manifest hash (duplicate / changed row)
    await ns.ch.collector.insert({
      table: 'allowance_versions', format: 'JSONEachRow', clickhouse_settings: { date_time_input_format: 'best_effort' },
      values: [{ manifest_hash: m.bundle.manifest.sha256, manifest_ref: 'x', policy_version: 'test-v1', workspace_id: 'ws-test', credential_id: 'cred-test', operation: 'issues_get', policy_subject_id: 'subj-a', max_unique_allow_decisions: '999', window_seconds: 600, effective_from: '2026-10-09 12:00:00.000000000', effective_until: null, approval_ref: 'x' }],
    });
    const rb2 = await pub.readback(m.bundle);
    expect(rb2.components.manifest).toBe(false);
  });

  it('retry with a FRESH generation id publishes and reads back cleanly', async () => {
    const { bundle } = mk('g-retry-2');
    await pub.insert(bundle);
    expect((await pub.readback(bundle)).ok).toBe(true);
  });

  it('privilege lanes: the evaluator cannot INSERT; the collector cannot run DDL or mutate', async () => {
    await expect(ns.ch.evaluator.insert({ table: 'generation_context', values: [{ generation_id: 'x' }], format: 'JSONEachRow' })).rejects.toThrow();
    await expect(ns.ch.collector.command({ query: 'DROP TABLE generation_context' })).rejects.toThrow();
    await expect(ns.ch.collector.command({ query: "ALTER TABLE event_bindings DELETE WHERE generation_id = 'g-ok'" })).rejects.toThrow();
    await expect(ns.ch.collector.command({ query: 'CREATE TABLE evil (x UInt8) ENGINE = Memory' })).rejects.toThrow();
  });

  it('exact nanosecond text survives the round trip (no JS Date rounding)', async () => {
    const { bundle } = mkBundle('g-ns', [{ id: 'n1', session: 's1', subject: 'subj-a', at: T0 + 123_456_789n }, { id: 'n2', session: 's1', subject: 'subj-a', at: T0 + SEC + 1n }], ['s1'], [['subj-a', 'A', '1']]);
    await pub.insert(bundle);
    const rs = await ns.admin.query({ query: `SELECT toString(toUnixTimestamp64Nano(created_at)) AS n FROM ${ns.db}.native_event_versions WHERE generation_id = 'g-ns' ORDER BY created_at`, format: 'JSONEachRow' });
    expect((await rs.json<{ n: string }>()).map((r) => r.n)).toEqual([(T0 + 123_456_789n).toString(), (T0 + SEC + 1n).toString()]);
    expect((await pub.readback(bundle)).ok).toBe(true);
  });
});
