import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { chRowCounts, startStack, type Body, type Stack } from './support.js';

let s: Stack;
let caseId: string;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const iso = () => new Date().toISOString();
const receipt = (scope: Body, version: number, over: Partial<Body> = {}) => ({
  expectedVersion: version, method: 'guild_ui' as const, nativeRuleId: 'mock-rule-1',
  observedSelectors: { credentialId: scope.credentialId, operation: scope.operation, policySubjectId: scope.policySubjectId, workspaceId: scope.workspaceId, decision: scope.decision, resources: null },
  appliedAt: iso(), evidenceNote: 'adversarial: operator observation recorded', ...over,
});
const action = async (kind = 'restriction') => ((await s.get(`/api/cases/${caseId}`)).body.actions as Body[]).filter((a) => a.kind === kind).at(-1);

beforeAll(async () => {
  s = await startStack('contract_test');
  const r = await s.post('/api/pipeline/run', {});
  expect(r.status, r.text).toBe(200);
  caseId = r.body.caseId;
  expect(caseId, r.text).toBeTruthy();
});
afterAll(async () => {
  await s?.close();
});

describe('contract_test revision/state guards', () => {
  it('stale expectedRevision -> 409 stale_revision and nothing recorded', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    for (const rev of [d.revision + 1, d.revision + 50, 0]) {
      const r = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: rev, decision: 'approve', reason: 'stale revision probe' });
      expect(r.status, `rev ${rev}`).toBe(409);
    }
    expect((await s.get(`/api/cases/${caseId}`)).body.actions).toHaveLength(0);
  });

  it('unknown case/action ids -> 404 (no stack trace)', async () => {
    for (const [m, u, b] of [['get', '/api/cases/nope', null], ['post', '/api/actions/nope/verify', { expectedVersion: 1 }], ['post', '/api/cases/nope/review', { expectedRevision: 1, decision: 'approve', reason: 'unknown case probe' }]] as const) {
      const r = m === 'get' ? await s.get(u) : await s.post(u, b);
      expect(r.status, u).toBe(404);
      expect(r.text).not.toMatch(/at .*\.(ts|js):\d+/);
    }
  });

  it('reject, then native-receipt / verify from a non-accepting state -> 409', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    const rej = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: d.revision, decision: 'reject', reason: 'reject to probe state machine' });
    expect(rej.status, rej.text).toBe(200);
    const a = await action();
    expect(a.state).toBe('rejected');
    const r1 = await s.post(`/api/actions/${a.actionId}/native-receipt`, receipt(d.proposedScope, a.version));
    expect(r1.status, r1.text).toBe(409);
    const r2 = await s.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: a.version });
    expect(r2.status, r2.text).toBe(409);
    const r3 = await s.post(`/api/actions/${a.actionId}/removal-receipt`, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: null, removedAt: iso(), evidenceNote: 'probe' });
    expect([404, 409], r3.text).toContain(r3.status);
    expect((await action()).state).toBe('rejected');
  });

  it('approve with the stale scope after a rejected review is bound to the current revision; approve then receipt guards version', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    const ok = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: d.revision, decision: 'approve', reason: 'approve exact scope after reject' });
    expect(ok.status, ok.text).toBe(200);
    const a = await action();
    expect(['approved', 'native_application_pending']).toContain(a.state);
    expect(a.scopeDigest).toBe(d.proposedScopeDigest);
    // stale action version on receipt
    const stale = await s.post(`/api/actions/${a.actionId}/native-receipt`, receipt(d.proposedScope, a.version + 7));
    expect(stale.status, stale.text).toBe(409);
    // verify from approved (no receipt yet) must not run probes
    const calls = s.mock!.control.postCount();
    const early = await s.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: a.version });
    expect(early.status, early.text).toBe(409);
    expect(s.mock!.control.postCount()).toBe(calls);
  });

  it('a duplicate approve while an action is open is refused (no second action)', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    const n = d.actions.filter((a: Body) => a.kind === 'restriction').length;
    const r = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: d.revision, decision: 'approve', reason: 'duplicate approve attempt' });
    expect(r.status, r.text).toBe(409);
    expect(((await s.get(`/api/cases/${caseId}`)).body.actions as Body[]).filter((a) => a.kind === 'restriction').length).toBe(n);
  });
});

describe('contract_test verdicts are never native', () => {

  it('receipt with wrong scope -> scope_mismatch; mismatch cannot be verified', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    const a = await action();
    const bad = await s.post(`/api/actions/${a.actionId}/native-receipt`, receipt(d.proposedScope, a.version, { observedSelectors: { ...receipt(d.proposedScope, 1).observedSelectors, decision: 'ALLOW' } }));
    expect(bad.status, bad.text).toBe(200);
    expect(bad.body.state).toBe('scope_mismatch');
    const v = await s.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: bad.body.version });
    expect(v.status, v.text).toBe(409);
  });

  it('without a mock policy: verification fails/unknown; with HUMAN-simulated mock policy: simulated_* only', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    let a = await action();
    await sleep(30);
    const ok = await s.post(`/api/actions/${a.actionId}/native-receipt`, receipt(d.proposedScope, a.version));
    expect(ok.status, ok.text).toBe(200);
    expect(ok.body.state).toBe('native_application_observed');
    await sleep(30);
    const fail = await s.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: ok.body.version });
    expect(fail.status, fail.text).toBe(200);
    expect(['verification_failed', 'verification_unknown']).toContain(fail.body.state);
    const fv = fail.body.verifications.at(-1);
    if (process.env.ADV_DEBUG) console.log('RECEIPT recordedAt', ok.body.nativeReceipt.recordedAt, 'appliedAt', ok.body.nativeReceipt.appliedAt, 'target startedAt', fv.target.startedAt, 'inspection', fv.target.inspection);
    expect(fv.target.outcome, JSON.stringify(fv.target.inspection)).toBe('allowed');
    expect(fail.body.state).toBe('verification_failed');
    expect(fv.verdict).not.toMatch(/verified|observed|recovered/);
    // human applies the policy in the MOCK (not through the app)
    await fetch(`${s.mock!.url}/__mock/deny`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    await sleep(30);
    const good = await s.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: fail.body.version });
    expect(good.status, good.text).toBe(200);
    if (process.env.ADV_DEBUG) console.log(JSON.stringify(good.body.verifications.at(-1), null, 1), JSON.stringify(fv.explanation));
    expect(good.body.state).toBe('simulated_restriction_observed');
    expect(good.body.verifications.at(-1).verdict).toMatch(/^simulated_/);
    a = await action();
    const full = JSON.stringify((await s.get(`/api/cases/${caseId}`)).body);
    expect(full).not.toContain('"restriction_verified"');
    expect(full).not.toContain('"state":"recovered"');
    const exp = (await s.get(`/api/export/${caseId}`)).text;
    expect(exp).not.toContain('"restriction_verified"');
    expect(exp).not.toContain('"verdict":"recovered"');
  });

  it('recovery needs removal + successful target AND control; a falling count / bare receipt never releases', async () => {
    const r = await action();
    const rec = await s.post(`/api/actions/${r.actionId}/recovery`, { expectedVersion: r.version, reason: 'adversarial recovery review' });
    expect(rec.status, rec.text).toBe(200);
    expect(rec.body.state).toBe('review_ready');
    // restriction action is untouched by merely starting a recovery
    expect((await action()).state).toBe('simulated_restriction_observed');
    const appr = await s.post(`/api/actions/${rec.body.actionId}/review`, { expectedVersion: rec.body.version, decision: 'approve', reason: 'approve recovery scope' });
    expect(appr.status, appr.text).toBe(200);
    // verify before a removal receipt must be refused
    const early = await s.post(`/api/actions/${rec.body.actionId}/verify`, { expectedVersion: appr.body.version });
    expect(early.status, early.text).toBe(409);
    await sleep(30);
    const rem = await s.post(`/api/actions/${rec.body.actionId}/removal-receipt`, { expectedVersion: appr.body.version, method: 'guild_ui', nativeRuleId: 'mock-rule-1', removedAt: iso(), evidenceNote: 'operator says removed; mock deny still applied' });
    expect(rem.status, rem.text).toBe(200);
    await sleep(30);
    const v1 = await s.post(`/api/actions/${rec.body.actionId}/verify`, { expectedVersion: rem.body.version });
    expect(v1.status, v1.text).toBe(200);
    expect(['recovery_failed', 'recovery_unknown']).toContain(v1.body.state);
    await fetch(`${s.mock!.url}/__mock/undeny`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
    await sleep(30);
    const v2 = await s.post(`/api/actions/${rec.body.actionId}/verify`, { expectedVersion: v1.body.version });
    expect(v2.status, v2.text).toBe(200);
    expect(v2.body.state).toBe('simulated_recovered');
  });

  it('contract_test export has no secrets, is marked non-evidence and bound to the contract DB', async () => {
    const r = await s.get(`/api/export/${caseId}`);
    expect(r.status).toBe(200);
    for (const secret of s.secrets) if (secret) expect(r.text.includes(secret), 'export leaked a configured secret').toBe(false);
    expect(r.body.limits.join(' ')).toMatch(/NOT NATIVE EVIDENCE/);
    const q = (await s.get(`/api/cases/${caseId}/queries`)).body as Array<{ database: string }>;
    for (const x of q) expect(x.database).toBe('scopewatch_contract');
  });
});

describe('readback failure blocks the case (fault injected at the ClickHouse client seam)', () => {
  it('dropping rows from the published insert yields readback_failed, no case, readiness/generation visible', async () => {
    const before = (await s.get('/api/cases')).body.length;
    const ch = s.svc.ch!;
    const orig = ch.collector.insert.bind(ch.collector);
    let tampered = 0;
    (ch.collector as Body).insert = async (params: Body) => {
      if (/native_event_versions/.test(String(params.table)) && Array.isArray(params.values) && params.values.length > 1 && tampered === 0) {
        tampered++;
        return orig({ ...params, values: params.values.slice(1) });
      }
      return orig(params);
    };
    try {
      const nativeBefore = await chRowCounts('scopewatch');
      const r = await s.post('/api/pipeline/run', {});
      expect(tampered, 'fault injection did not hit an event insert; adjust seam').toBeGreaterThan(0);
      expect(r.status, r.text).toBe(200);
      expect(r.body.state).not.toBe('evaluated');
      expect(r.body.caseId).toBeNull();
      expect((await s.get('/api/cases')).body.length).toBe(before);
      const gens = (await s.get('/api/generations')).body as Body[];
      const g = gens.find((x) => x.generation.generationId === r.body.generationId);
      expect(g.generation.state).toBe('readback_failed');
      expect(g.caseId).toBeNull();
      expect(await chRowCounts('scopewatch')).toEqual(nativeBefore);
    } finally {
      (ch.collector as Body).insert = orig;
    }
  });
});
