import { describe, expect, it } from 'vitest';
import { existsSync } from 'node:fs';
import { applyTransition } from '../../../src/core/actions.js';
import { buildApp } from '../../../src/server/http/app.js';
import { recordNativeReceipt, reviewCase, sweepInterruptedVerifications, verifyAction } from '../../../src/server/services/actions.js';
import { processGeneration } from '../../../src/server/services/pipeline.js';
import { buildCaseDetail } from '../../../src/server/services/cases.js';
import type { ActionRecord } from '../../../src/shared/contracts.js';
import type { LaunchReceipt } from '../../../src/shared/ports.js';
import { T0, build, run } from '../../unit/core/fixtures.js';
import { FakeGuildPort, HOST, seedCase, services, testConfig } from './support.js';

const sel = { credentialId: 'cred-test', operation: 'issues_get', policySubjectId: 'subj-a', workspaceId: 'ws-test', decision: 'DENY', resources: null };

function observed(svc: ReturnType<typeof services>) {
  const { caseId, revision } = seedCase(svc);
  reviewCase(svc, caseId, { expectedRevision: revision, decision: 'approve', reason: 'ok' }, 'op');
  const a = svc.journal.listActions(caseId)[0] as ActionRecord;
  recordNativeReceipt(svc, a.actionId, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: 'r', observedSelectors: sel, appliedAt: new Date().toISOString(), evidenceNote: '' }, 'op');
  return { caseId, actionId: a.actionId };
}

/** Simulates a crash after the verification_pending CAS and the recorded probe intents. */
function interrupt(svc: ReturnType<typeof services>, actionId: string) {
  const a = svc.journal.getAction(actionId) as ActionRecord;
  svc.journal.casAction(applyTransition(a, 'verification_pending', 'op', 'launching', a.version), a.version);
  svc.journal.createIntent({ idempotencyRef: `probe-${actionId}-target`, kind: 'probe_launch', relatedId: actionId, detail: 't' }, 'contract_test');
  svc.journal.createIntent({ idempotencyRef: `probe-${actionId}-control`, kind: 'probe_launch', relatedId: actionId, detail: 'c' }, 'contract_test');
  return svc.journal.getAction(actionId) as ActionRecord;
}

describe('interrupted verification', () => {
  it('verify from verification_pending reconciles recorded intents, never relaunches, and lands in verification_unknown', async () => {
    const guild = new FakeGuildPort();
    const found = { nativeSessionId: 'sess-x' } as LaunchReceipt;
    guild.reconcileLaunch = async (ref: string) => (ref.endsWith('-target') ? found : null);
    const svc = services('contract_test', guild);
    const { actionId } = observed(svc);
    const pending = interrupt(svc, actionId);
    const r = await verifyAction(svc, actionId, pending.version, 'op');
    expect(r.state).toBe('verification_unknown');
    expect(r.history.at(-1)?.note).toMatch(/interrupted verification/);
    expect(guild.probeCalls).toHaveLength(0);
    const outcomes = Object.fromEntries(svc.journal.listIntents(actionId).map((i) => [i.idempotencyRef.split('-').pop(), i.outcome]));
    expect(outcomes).toEqual({ target: 'reconciled', control: 'unknown' });
    // a deliberate new verify then launches fresh probes
    const again = await verifyAction(svc, actionId, r.version, 'op');
    expect(guild.probeCalls).toHaveLength(2);
    expect(again.state).toBe('simulated_restriction_observed');
  });

  it('a stale version cannot reconcile; startup sweep marks interrupted verifications unknown without network calls', async () => {
    const guild = new FakeGuildPort();
    const svc = services('contract_test', guild);
    const { actionId } = observed(svc);
    const pending = interrupt(svc, actionId);
    await expect(verifyAction(svc, actionId, pending.version - 1, 'op')).rejects.toMatchObject({ status: 409 });
    expect(await sweepInterruptedVerifications(svc)).toBe(1);
    expect(svc.journal.getAction(actionId)!.state).toBe('verification_unknown');
    expect(svc.journal.listIntents(actionId).every((i) => i.outcome === 'unknown')).toBe(true);
    expect(await sweepInterruptedVerifications(svc)).toBe(0);
  });
});

/** Adds a later generation (same manifest/cohort) that contains a changed copy of an existing identity. */
async function conflictingGeneration(svc: ReturnType<typeof services>, firstGen: string) {
  const j = svc.journal;
  const g0 = j.getGeneration(firstGen)!;
  const gen = 'g-late-conflict';
  j.createGeneration({ generationId: gen, provenance: j.mode, manifestId: g0.manifestId, manifestSha256: g0.manifestSha256, captureCutoff: g0.captureCutoff, identityDomainStatus: 'declared_fixture', scenarioId: g0.scenarioId, parentGenerationId: firstGen });
  const b = build(gen, run('a', 'subj-a', ['s1', 's2'], 8, T0, 10), ['s1', 's2'], { provenance: j.mode });
  const rogue = { ...b.observations[0]!, observationId: 'rogue', decision: 'DENY' as const };
  j.addObservations(gen, [...b.observations, rogue]);
  j.addBindings(gen, b.bindings);
  j.addCoverage(gen, b.coverage);
  return processGeneration(svc, gen);
}

describe('late integrity conflict on an existing case', () => {
  it('case gets a new evidence_disputed revision; an un-applied approval becomes stale', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    const { caseId, revision, generationId } = seedCase(svc);
    reviewCase(svc, caseId, { expectedRevision: revision, decision: 'approve', reason: 'ok' }, 'op');
    const r = await conflictingGeneration(svc, generationId);
    expect(r).toMatchObject({ state: 'sealed', caseId: null });
    const c = svc.journal.getCase(caseId)!;
    expect(c).toMatchObject({ revision: revision + 1, evidenceState: 'evidence_disputed' });
    expect(svc.journal.getCaseRevision(caseId, revision + 1)!.uncertainty[0]).toMatch(/^DISPUTED/);
    expect(svc.journal.listActions(caseId)[0]!.state).toBe('stale');
    const d = buildCaseDetail(svc.journal, caseId);
    expect(d.actionBlockedReason).toMatch(/disputed/i);
    expect(svc.journal.getCaseRevision(caseId, revision)!.evidenceState).toBe('review_ready'); // old revision preserved
  });

  it('an already-observed restriction keeps its receipt, becomes disputed, and nothing is auto-released', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    const first = seedCase(svc);
    reviewCase(svc, first.caseId, { expectedRevision: first.revision, decision: 'approve', reason: 'ok' }, 'op');
    const a = svc.journal.listActions(first.caseId)[0]!;
    recordNativeReceipt(svc, a.actionId, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: 'r', observedSelectors: sel, appliedAt: new Date().toISOString(), evidenceNote: 'x' }, 'op');
    await conflictingGeneration(svc, first.generationId);
    const after = svc.journal.getAction(a.actionId)!;
    expect(after.state).toBe('disputed');
    expect(after.nativeReceipt).toMatchObject({ nativeRuleId: 'r', matchesApprovedScope: true });
    expect(svc.journal.listActions(first.caseId).filter((x) => x.kind === 'recovery')).toEqual([]);
    expect(svc.journal.getCase(first.caseId)!.evidenceState).toBe('evidence_disputed');
  });
});

describe('route shapes and static client', () => {
  it('GET /api/generations conforms to GenerationSummary[] (no extra fields, caseId linked, not-ready included)', async () => {
    const svc = services('replay');
    const { generationId, caseId } = seedCase(svc);
    const app = await buildApp(testConfig('replay'), svc);
    const login = await app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: 'http://127.0.0.1:4317' }, payload: { secret: 'test-operator-secret-0123456789' } });
    const cookie = `${login.cookies[0]!.name}=${login.cookies[0]!.value}`;
    const r = await app.inject({ method: 'GET', url: '/api/generations', headers: { host: HOST, cookie } });
    const list = r.json() as Array<Record<string, unknown>>;
    expect(Object.keys(list[0]!).sort()).toEqual(['caseId', 'generation', 'readiness']);
    expect(list[0]).toMatchObject({ caseId, generation: { generationId, state: 'evaluated' } });
    expect(Object.keys(list[0]!['generation'] as object)).not.toContain('scenarioId');
    await app.close();
  });

  const built = existsSync('dist/client/index.html');
  (built ? it : it.skip)('serves index.html at / and on SPA routes; /api/unknown is a JSON 404 (needs npm run build)', async () => {
    const svc = services('replay');
    const app = await buildApp(testConfig('replay'), svc);
    for (const url of ['/', '/cases/case-123', '/some/route']) {
      const r = await app.inject({ method: 'GET', url, headers: { host: HOST } });
      expect(r.statusCode, url).toBe(200);
      expect(r.headers['content-type']).toMatch(/text\/html/);
      expect(r.body).toMatch(/<div id="root"|<!doctype html/i);
    }
    const un = await app.inject({ method: 'GET', url: '/api/unknown', headers: { host: HOST } });
    expect(un.statusCode).toBe(401); // unauthenticated: JSON envelope, never the SPA shell
    expect(un.headers['content-type']).toMatch(/json/);
    const login = await app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: 'http://127.0.0.1:4317' }, payload: { secret: 'test-operator-secret-0123456789' } });
    const cookie = `${login.cookies[0]!.name}=${login.cookies[0]!.value}`;
    const nf = await app.inject({ method: 'GET', url: '/api/unknown', headers: { host: HOST, cookie } });
    expect(nf.statusCode).toBe(404);
    expect(nf.headers['content-type']).toMatch(/json/);
    expect(nf.json()).toMatchObject({ code: 'not_found' });
    await app.close();
  });
});

describe('receipt precision and routing fixes', () => {
  const rc = (v: number, appliedAt: string) => ({ expectedVersion: v, method: 'guild_ui' as const, nativeRuleId: 'r', observedSelectors: sel, appliedAt, evidenceNote: '' });
  function approved() {
    const svc = services('contract_test', new FakeGuildPort());
    const { caseId, revision } = seedCase(svc);
    reviewCase(svc, caseId, { expectedRevision: revision, decision: 'approve', reason: 'ok' }, 'op');
    return { svc, a: svc.journal.listActions(caseId)[0] as ActionRecord };
  }
  it('appliedAt at second precision within the approval second is NOT stale; strictly earlier second is', () => {
    const { svc, a } = approved();
    const sec = a.approvedAt!.replace(/\.\d+Z$/, 'Z');
    expect(recordNativeReceipt(svc, a.actionId, rc(a.version, sec), 'op').state).toBe('native_application_observed');
    const b = approved();
    const earlier = new Date(Date.parse(b.a.approvedAt!) - 2000).toISOString().replace(/\.\d+Z$/, 'Z');
    expect(recordNativeReceipt(b.svc, b.a.actionId, rc(b.a.version, earlier), 'op').state).toBe('disputed_stale_application');
    // millisecond precision stays exact: one ms before approval is out of band
    const c = approved();
    const oneMs = new Date(Date.parse(c.a.approvedAt!) - 1).toISOString();
    expect(recordNativeReceipt(c.svc, c.a.actionId, rc(c.a.version, oneMs), 'op').state).toBe('disputed_stale_application');
  });
  it('removal-receipt on a restriction action is 409 conflict, unknown id is 404', async () => {
    const { svc, a } = approved();
    const app = await buildApp(testConfig('contract_test'), svc);
    const login = await app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: 'http://127.0.0.1:4317' }, payload: { secret: 'test-operator-secret-0123456789' } });
    const headers = { host: HOST, origin: 'http://127.0.0.1:4317', cookie: `${login.cookies[0]!.name}=${login.cookies[0]!.value}`, 'x-csrf-token': login.json().csrfToken };
    const body = { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: null, removedAt: new Date().toISOString(), observedSelectors: { ...sel, decision: 'REMOVED' }, evidenceNote: '' };
    expect((await app.inject({ method: 'POST', url: `/api/actions/${a.actionId}/removal-receipt`, headers, payload: body })).statusCode).toBe(409);
    expect((await app.inject({ method: 'POST', url: '/api/actions/nope/removal-receipt', headers, payload: body })).statusCode).toBe(404);
    await app.close();
  });
  it('session cookie name is instance-scoped by port and old unscoped cookies are ignored', async () => {
    const svc = services('replay');
    const app = await buildApp(testConfig('replay'), svc);
    const login = await app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: 'http://127.0.0.1:4317' }, payload: { secret: 'test-operator-secret-0123456789' } });
    const c = login.cookies[0]!;
    expect(c.name).toBe('sw_session_4317');
    const bare = await app.inject({ method: 'GET', url: '/api/cases', headers: { host: HOST, cookie: `sw_session=${c.value}` } });
    expect(bare.statusCode).toBe(401);
    await app.close();
  });
});
