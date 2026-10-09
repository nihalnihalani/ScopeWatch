import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from '../../../src/server/http/app.js';
import type { Services } from '../../../src/server/services/context.js';
import { HOST, ORIGIN, SECRET, FakeGuildPort, seedCase, services, testConfig } from './support.js';
import type { ActionRecord, CaseDetail } from '../../../src/shared/contracts.js';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type Body = any;

interface Ctx {
  app: FastifyInstance;
  svc: Services;
  cookie: string;
  csrf: string;
  post: (url: string, payload: unknown, over?: Record<string, string>) => Promise<{ status: number; body: Body }>;
  get: (url: string) => Promise<{ status: number; body: Body }>;
}

async function setup(mode: 'replay' | 'contract_test', guild: FakeGuildPort | null = null): Promise<Ctx> {
  const svc = services(mode, guild);
  const app = await buildApp(testConfig(mode), svc);
  const login = await app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: ORIGIN }, payload: { secret: SECRET } });
  expect(login.statusCode).toBe(200);
  const cookie = (login.cookies[0] as { name: string; value: string }).name + '=' + (login.cookies[0] as { value: string }).value;
  const csrf = login.json().csrfToken as string;
  const ctx: Ctx = {
    app, svc, cookie, csrf,
    post: async (url, payload, over = {}) => {
      const r = await app.inject({ method: 'POST', url, payload: payload as object, headers: { host: HOST, origin: ORIGIN, cookie, 'x-csrf-token': csrf, ...over } });
      return { status: r.statusCode, body: r.json() };
    },
    get: async (url) => {
      const r = await app.inject({ method: 'GET', url, headers: { host: HOST, cookie } });
      return { status: r.statusCode, body: r.json() };
    },
  };
  return ctx;
}

let ctx: Ctx;
afterEach(async () => {
  await ctx?.app.close();
});

describe('HTTP security envelope', () => {
  beforeEach(async () => {
    ctx = await setup('contract_test', new FakeGuildPort());
  });

  it('requires a session for reads and mutations (401 envelope)', async () => {
    const r = await ctx.app.inject({ method: 'GET', url: '/api/cases', headers: { host: HOST } });
    expect(r.statusCode).toBe(401);
    expect(r.json()).toMatchObject({ code: 'unauthenticated' });
    const p = await ctx.app.inject({ method: 'POST', url: '/api/cases/x/review', headers: { host: HOST, origin: ORIGIN }, payload: {} });
    expect(p.statusCode).toBe(401);
  });

  it('login uses a timing-safe compare, sets HttpOnly SameSite=Strict, and a wrong secret yields 401', async () => {
    const bad = await ctx.app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: ORIGIN }, payload: { secret: 'wrong-wrong-wrong-wrong' } });
    expect(bad.statusCode).toBe(401);
    const ok = await ctx.app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: ORIGIN }, payload: { secret: SECRET } });
    const sc = String(ok.headers['set-cookie']);
    expect(sc).toMatch(/HttpOnly/i);
    expect(sc).toMatch(/SameSite=Strict/i);
  });

  it('rejects missing or wrong CSRF with 403 csrf', async () => {
    const body = { expectedRevision: 1, decision: 'reject', reason: 'x' };
    const none = await ctx.post('/api/cases/c/review', body, { 'x-csrf-token': '' });
    expect(none).toMatchObject({ status: 403, body: { code: 'csrf' } });
    const wrong = await ctx.post('/api/cases/c/review', body, { 'x-csrf-token': 'not-the-token' });
    expect(wrong).toMatchObject({ status: 403, body: { code: 'csrf' } });
  });

  it('rejects bad or missing Origin and bad Host with 403 origin (every POST, and Host on GET too)', async () => {
    const body = { expectedRevision: 1, decision: 'reject', reason: 'x' };
    expect((await ctx.post('/api/cases/c/review', body, { origin: 'http://evil.example' })).body.code).toBe('origin');
    expect((await ctx.post('/api/cases/c/review', body, { origin: 'http://127.0.0.1:9999' })).status).toBe(403);
    const noOrigin = await ctx.app.inject({ method: 'POST', url: '/api/cases/c/review', payload: body, headers: { host: HOST, cookie: ctx.cookie, 'x-csrf-token': ctx.csrf } });
    expect(noOrigin.statusCode).toBe(403);
    const badHost = await ctx.app.inject({ method: 'GET', url: '/api/cases', headers: { host: 'evil.example', cookie: ctx.cookie } });
    expect(badHost.statusCode).toBe(403);
    const rebinding = await ctx.app.inject({ method: 'GET', url: '/api/health', headers: { host: 'attacker.test:4317' } });
    expect(rebinding.statusCode).toBe(403);
  });

  it('rejects unknown body fields: the browser can never pass subject, credential, session, SQL or command', async () => {
    const { caseId } = seedCase(ctx.svc);
    const bad = [
      { expectedRevision: 1, decision: 'approve', reason: 'ok', policySubjectId: 'subj-evil' },
      { expectedRevision: 1, decision: 'approve', reason: 'ok', scope: { credentialId: 'x' } },
      { expectedRevision: 1, decision: 'approve', reason: 'ok', sql: 'DROP TABLE x' },
      { expectedRevision: 1, decision: 'approve', reason: 'ok', command: 'guild policy add' },
      { expectedRevision: '1', decision: 'approve', reason: 'ok' },
      { expectedRevision: 1, decision: 'maybe', reason: 'ok' },
      { expectedRevision: 1, decision: 'approve' },
    ];
    for (const b of bad) {
      const r = await ctx.post(`/api/cases/${caseId}/review`, b);
      expect(r.status, JSON.stringify(b)).toBe(422);
      expect(r.body.code).toBe('invalid');
    }
    expect(ctx.svc.journal.listActions(caseId)).toEqual([]);
    expect((await ctx.post('/api/pipeline/run', { sessionIds: ['s1'] })).status).toBe(422);
    expect((await ctx.post('/api/actions/a/native-receipt', { expectedVersion: 1, method: 'guild_ui', nativeRuleId: null, observedSelectors: { credentialId: 'c', operation: 'o', policySubjectId: 's', workspaceId: 'w', decision: 'DENY', resources: null, extra: 1 }, appliedAt: 'x', evidenceNote: '' })).status).toBe(422);
  });

  it('health is public; status reports honest dependency state', async () => {
    const h = await ctx.app.inject({ method: 'GET', url: '/api/health', headers: { host: HOST } });
    expect(h.json()).toEqual({ ok: true });
    const s = await ctx.get('/api/status');
    expect(s.body.mode).toBe('contract_test');
    expect(s.body.modeLabel).toMatch(/not native evidence/);
    expect(s.body.clickhouse.status).toBe('unconfigured');
  });
});

describe('replay cannot become action eligible', () => {
  it('approving or rejecting a replay case is 409 not_eligible and records nothing', async () => {
    ctx = await setup('replay');
    const { caseId, revision } = seedCase(ctx.svc);
    for (const decision of ['approve', 'reject']) {
      const r = await ctx.post(`/api/cases/${caseId}/review`, { expectedRevision: revision, decision, reason: 'try' });
      expect(r).toMatchObject({ status: 409, body: { code: 'not_eligible' } });
    }
    expect(ctx.svc.journal.listActions(caseId)).toEqual([]);
    const d = (await ctx.get(`/api/cases/${caseId}`)).body as CaseDetail;
    expect(d.actionBlockedReason).toMatch(/not action eligible/);
    expect(d.actionState).toBe('none');
    expect(d.provenance).toBe('replay');
  });

  it('replay investigation is explicitly unavailable, not model output; run endpoints respect the mode', async () => {
    ctx = await setup('replay');
    const { caseId, revision } = seedCase(ctx.svc);
    const r = await ctx.post(`/api/cases/${caseId}/investigate`, { expectedRevision: revision });
    expect(r.status).toBe(200);
    expect(r.body.investigation).toMatchObject({ state: 'unavailable', narrative: null });
    expect(r.body.investigation.unavailableReason).toMatch(/not model output/);
    expect((await ctx.post('/api/pipeline/run', {})).status).toBe(409);
  });

  it('replay/run is refused outside replay mode', async () => {
    ctx = await setup('contract_test', new FakeGuildPort());
    expect((await ctx.post('/api/replay/run', {})).status).toBe(409);
  });
});

describe('review, native receipt, verification and recovery (contract_test provenance, FAKE Guild)', () => {
  let guild: FakeGuildPort;
  let caseId: string;
  let revision: number;
  beforeEach(async () => {
    guild = new FakeGuildPort();
    ctx = await setup('contract_test', guild);
    ({ caseId, revision } = seedCase(ctx.svc));
  });

  const selectors = (over: Record<string, unknown> = {}) => ({ credentialId: 'cred-test', operation: 'issues_get', policySubjectId: 'subj-a', workspaceId: 'ws-test', decision: 'DENY', resources: null, ...over });
  const receipt = (v: number, over: Record<string, unknown> = {}, sel: Record<string, unknown> = {}) => ({ expectedVersion: v, method: 'guild_ui', nativeRuleId: 'rule-1', observedSelectors: selectors(sel), appliedAt: new Date().toISOString(), evidenceNote: 'seen in UI', ...over });
  async function approve(): Promise<ActionRecord> {
    const r = await ctx.post(`/api/cases/${caseId}/review`, { expectedRevision: revision, decision: 'approve', reason: 'reviewed evidence' });
    expect(r.status).toBe(200);
    return (r.body as CaseDetail).actions[0]!;
  }

  it('approval binds the server-resolved scope digest and the case revision; a stale revision is 409', async () => {
    const detail0 = (await ctx.get(`/api/cases/${caseId}`)).body as CaseDetail;
    expect(detail0.proposedScope).toMatchObject({ policySubjectId: 'subj-a', credentialId: 'cred-test', operation: 'issues_get', decision: 'DENY', resourceSelector: null });
    const stale = await ctx.post(`/api/cases/${caseId}/review`, { expectedRevision: revision + 1, decision: 'approve', reason: 'x' });
    expect(stale).toMatchObject({ status: 409, body: { code: 'stale_revision' } });
    const a = await approve();
    expect(a.scopeDigest).toBe(detail0.proposedScopeDigest);
    expect(a).toMatchObject({ state: 'approved', caseRevision: revision, provenance: 'contract_test', version: 1 });
    const dup = await ctx.post(`/api/cases/${caseId}/review`, { expectedRevision: revision, decision: 'approve', reason: 'again' });
    expect(dup.status).toBe(409);
    expect(ctx.svc.journal.listActions(caseId)).toHaveLength(1);
  });

  it('a matching native receipt moves to native_application_observed and is not itself a verified effect', async () => {
    const a = await approve();
    const r = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    expect(r.status).toBe(200);
    expect(r.body).toMatchObject({ state: 'native_application_observed', version: 2 });
    expect(r.body.nativeReceipt).toMatchObject({ matchesApprovedScope: true, mismatches: [] });
    expect(r.body.verifications).toEqual([]);
  });

  it('observed selectors that differ from the approved scope are scope_mismatch and keep the receipt', async () => {
    const a = await approve();
    const r = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version, {}, { policySubjectId: 'subj-other', resources: 'repos=*;methods=*' }));
    expect(r.body.state).toBe('scope_mismatch');
    expect(r.body.nativeReceipt.mismatches.join(' ')).toMatch(/subject/);
    expect(r.body.nativeReceipt.mismatches.join(' ')).toMatch(/resource selector/);
    const v = await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: r.body.version });
    expect(v.status).toBe(409); // verification of an unapproved rule is refused
    expect(guild.probeCalls).toHaveLength(0);
    // a corrected observation is accepted from scope_mismatch
    const fixed = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(r.body.version));
    expect(fixed.body.state).toBe('native_application_observed');
  });

  it('a receipt after the case advanced is disputed_stale_application (old copied scope applied out of band)', async () => {
    const a = await approve();
    const adv = seedCase(ctx.svc);
    expect(adv.revision).toBe(revision + 1);
    expect(ctx.svc.journal.getAction(a.actionId)!.state).toBe('stale');
    const cur = ctx.svc.journal.getAction(a.actionId)!;
    const r = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(cur.version));
    expect(r.body.state).toBe('disputed_stale_application');
    expect(r.body.nativeReceipt.matchesApprovedScope).toBe(false);
    expect(r.body.nativeReceipt.mismatches.join(' ')).toMatch(/revision/);
    expect((await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: r.body.version })).status).toBe(409);
  });

  it('a receipt claiming application before approval is disputed', async () => {
    const a = await approve();
    const r = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version, { appliedAt: '2001-01-01T00:00:00Z' }));
    expect(r.body.state).toBe('disputed_stale_application');
  });

  it('stale action version is 409, and receipts are rejected in the wrong state', async () => {
    const a = await approve();
    expect((await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(99))).status).toBe(409);
    expect((await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version, { appliedAt: 'not-a-time' }))).status).toBe(422);
    const ok = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const again = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(ok.body.version));
    expect(again.status).toBe(409);
  });

  it('verify launches NEW target+control probes after the receipt time; contract_test success is only simulated_*', async () => {
    const a = await approve();
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const v = await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: rc.body.version });
    expect(v.status).toBe(200);
    expect(v.body.state).toBe('simulated_restriction_observed');
    expect(v.body.verifications[0]).toMatchObject({ verdict: 'simulated_restriction_observed', provenance: 'contract_test' });
    expect(guild.probeCalls.map((p) => p.role).sort()).toEqual(['control', 'target']);
    for (const p of guild.probeCalls) {
      expect(p.notBefore).toBe(rc.body.nativeReceipt.recordedAt);
      expect(p.scope.policySubjectId).toBe('subj-a');
    }
    const intents = ctx.svc.journal.listIntents(a.actionId);
    expect(intents.map((i) => i.kind)).toEqual(['probe_launch', 'probe_launch']);
    expect(intents.every((i) => i.outcome === 'succeeded')).toBe(true);
    // the same stale version cannot trigger another verification
    expect((await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: rc.body.version })).status).toBe(409);
  });

  it('target succeeding after the supposed restriction => verification_failed (restriction_failed), never verified', async () => {
    guild.probeScript = { target: { outcome: 'allowed', decision: 'ALLOW', reasonCode: null } };
    const a = await approve();
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const v = await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: rc.body.version });
    expect(v.body.state).toBe('verification_failed');
    expect(v.body.verifications[0].verdict).toBe('restriction_failed');
  });

  it('a probe call that times out leaves an unknown intent and verification_unknown (not failure, not success)', async () => {
    guild.probeScript = { control: { throwError: true } };
    const a = await approve();
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const v = await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: rc.body.version });
    expect(v.body.state).toBe('verification_unknown');
    expect(ctx.svc.journal.listIntents(a.actionId).map((i) => i.outcome).sort()).toEqual(['succeeded', 'unknown']);
  });

  it('a probe that did not start strictly after the receipt time is discarded as stale => unknown', async () => {
    guild.probeScript = { target: { startedAt: '2001-01-01T00:00:00Z' } };
    const a = await approve();
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const v = await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: rc.body.version });
    expect(v.body.state).toBe('verification_unknown');
    expect(v.body.verifications[0].target.outcome).toBe('missing');
  });

  it('without a Guild adapter verification is unavailable (503), nothing is faked and the state is unchanged', async () => {
    await ctx.app.close();
    ctx = await setup('contract_test', null);
    ({ caseId, revision } = seedCase(ctx.svc));
    const a = await approve();
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const v = await ctx.post(`/api/actions/${a.actionId}/verify`, { expectedVersion: rc.body.version });
    expect(v.status).toBe(503);
    expect(ctx.svc.journal.getAction(a.actionId)!.state).toBe('native_application_observed');
  });

  it('recovery is a separate reviewed action: needs an applied effect, approval, removal receipt, then BOTH probes succeeding', async () => {
    const a = await approve();
    expect((await ctx.post(`/api/actions/${a.actionId}/recovery`, { expectedVersion: a.version, reason: 'count fell' })).status).toBe(409); // nothing applied yet
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const rec = await ctx.post(`/api/actions/${a.actionId}/recovery`, { expectedVersion: rc.body.version, reason: 'incident resolved' });
    expect(rec.status).toBe(200);
    expect(rec.body).toMatchObject({ kind: 'recovery', state: 'review_ready', reversesActionId: a.actionId });
    expect((await ctx.post(`/api/actions/${a.actionId}/recovery`, { expectedVersion: rc.body.version, reason: 'dup' })).status).toBe(409);
    // verify before approval/removal is refused
    expect((await ctx.post(`/api/actions/${rec.body.actionId}/verify`, { expectedVersion: 1 })).status).toBe(409);
    const ap = await ctx.post(`/api/actions/${rec.body.actionId}/review`, { expectedVersion: 1, decision: 'approve', reason: 'ok' });
    expect(ap.body.state).toBe('approved');
    const rm = await ctx.post(`/api/actions/${rec.body.actionId}/removal-receipt`, { expectedVersion: ap.body.version, method: 'guild_ui', nativeRuleId: 'rule-1', removedAt: new Date().toISOString(), observedSelectors: selectors({ decision: 'REMOVED' }), evidenceNote: 'removed' });
    expect(rm.body.state).toBe('removal_observed');
    guild.probeScript = { target: { outcome: 'succeeded_expected', decision: 'ALLOW', boundSubjectId: 'subj-a' } };
    const ok = await ctx.post(`/api/actions/${rec.body.actionId}/verify`, { expectedVersion: rm.body.version });
    expect(ok.body.state).toBe('simulated_recovered');
    expect(ok.body.verifications[0].verdict).toBe('simulated_recovered');
  });

  it('recovery with the target still refused is recovery_failed (the count falling never releases)', async () => {
    const a = await approve();
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const rec = await ctx.post(`/api/actions/${a.actionId}/recovery`, { expectedVersion: rc.body.version, reason: 'try' });
    const ap = await ctx.post(`/api/actions/${rec.body.actionId}/review`, { expectedVersion: 1, decision: 'approve', reason: 'ok' });
    const rm = await ctx.post(`/api/actions/${rec.body.actionId}/removal-receipt`, { expectedVersion: ap.body.version, method: 'guild_ui', nativeRuleId: null, removedAt: new Date().toISOString(), observedSelectors: selectors({ decision: 'REMOVED' }), evidenceNote: '' });
    const v = await ctx.post(`/api/actions/${rec.body.actionId}/verify`, { expectedVersion: rm.body.version }); // fake target stays refused
    expect(v.body.state).toBe('recovery_failed');
  });

  it('a recovery drafted for an older case revision cannot be approved after the case advances', async () => {
    const a = await approve();
    const rc = await ctx.post(`/api/actions/${a.actionId}/native-receipt`, receipt(a.version));
    const rec = await ctx.post(`/api/actions/${a.actionId}/recovery`, { expectedVersion: rc.body.version, reason: 'try' });
    seedCase(ctx.svc);
    const ap = await ctx.post(`/api/actions/${rec.body.actionId}/review`, { expectedVersion: 1, decision: 'approve', reason: 'ok' });
    expect(ap).toMatchObject({ status: 409, body: { code: 'stale_revision' } });
  });

  it('investigation: narrative is untrusted; invented quantities fail grounding and the check list says why', async () => {
    const r = await ctx.post(`/api/cases/${caseId}/investigate`, { expectedRevision: revision });
    expect(r.status).toBe(200);
    expect(r.body.investigation.state).toBe('created');
    expect(r.body.investigation.grounded).toBe(false);
    expect(r.body.investigation.checks.some((c: { ok: boolean; claim: string }) => !c.ok && c.claim.includes('999'))).toBe(true);
    expect(ctx.svc.journal.listIntents(caseId).map((i) => i.kind)).toEqual(['investigation_launch']);
  });
});
