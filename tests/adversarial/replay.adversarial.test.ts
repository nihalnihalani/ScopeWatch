import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HOST, ORIGIN, chRowCounts, startStack, type Stack } from './support.js';

let s: Stack;
let caseId: string;
let nativeBefore: Record<string, number>;
let replayBefore: Record<string, number>;

beforeAll(async () => {
  nativeBefore = await chRowCounts('scopewatch');
  replayBefore = await chRowCounts('scopewatch_replay');
  s = await startStack('replay');
  const r = await s.post('/api/replay/run', {});
  expect(r.status, r.text).toBe(200);
  caseId = r.body.caseId;
  expect(caseId).toBeTruthy();
});
afterAll(async () => {
  await s?.close();
});

describe('session, CSRF, Origin and Host enforcement (replay stack)', () => {
  it('missing session cookie -> 401 on reads and mutations', async () => {
    for (const [m, url] of [['GET', '/api/cases'], ['GET', `/api/cases/${caseId}`], ['GET', `/api/export/${caseId}`], ['GET', '/api/status'], ['GET', '/api/generations']] as const) {
      const r = await s.app.inject({ method: m, url, headers: { host: HOST } });
      expect(r.statusCode, url).toBe(401);
    }
    const p = await s.app.inject({ method: 'POST', url: `/api/cases/${caseId}/review`, headers: { host: HOST, origin: ORIGIN }, payload: { expectedRevision: 1, decision: 'approve', reason: 'no session at all' } });
    expect(p.statusCode).toBe(401);
  });

  it('garbage/forged session cookie -> 401', async () => {
    const r = await s.app.inject({ method: 'GET', url: '/api/cases', headers: { host: HOST, cookie: 'sw_session=forged-value-not-in-journal' } });
    expect(r.statusCode).toBe(401);
  });

  it('wrong or missing CSRF token -> 403 and no state change', async () => {
    const before = JSON.stringify((await s.get(`/api/cases/${caseId}`)).body);
    for (const over of [{ 'x-csrf-token': 'wrong-token' }, { 'x-csrf-token': undefined }, { 'x-csrf-token': s.csrf + 'x' }]) {
      const r = await s.post('/api/replay/run', {}, over);
      expect(r.status, JSON.stringify(over)).toBe(403);
      const r2 = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: 1, decision: 'approve', reason: 'csrf negative test' }, over);
      expect(r2.status).toBe(403);
    }
    expect(JSON.stringify((await s.get(`/api/cases/${caseId}`)).body)).toBe(before);
  });

  it('foreign or missing Origin on POST -> 403', async () => {
    for (const origin of ['http://evil.example', 'http://127.0.0.1:9999', 'http://localhost:4317.evil.example', 'null', undefined]) {
      const r = await s.post('/api/replay/run', {}, { origin });
      expect(r.status, String(origin)).toBe(403);
    }
  });

  it('foreign Host header (DNS rebinding) -> 403 even for GET with a valid session', async () => {
    for (const host of ['evil.example', 'evil.example:4317', '127.0.0.1:9999', 'localhost.evil.example']) {
      const r = await s.get('/api/cases', { host });
      expect(r.status, host).toBe(403);
    }
  });

  it('login with a wrong secret -> 401 and no cookie', async () => {
    const r = await s.app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: ORIGIN }, payload: { secret: 'wrong-wrong-wrong-wrong-wrong' } });
    expect(r.statusCode).toBe(401);
    expect(r.cookies.length).toBe(0);
  });
});

describe('untrusted fields are rejected, never routed', () => {
  const injected = {
    policySubjectId: 'subj-evil', credentialId: 'cred-evil', workspaceId: 'ws-evil', operation: 'delete_everything',
    sql: "SELECT 1; DROP DATABASE scopewatch", command: 'rm -rf /', scope: { policySubjectId: 'x' }, selector: 'x',
  };
  it('review body with injected subject/credential/sql/command fields -> 4xx, nothing recorded', async () => {
    const cases = Object.entries(injected).map(([k, v]) => ({ expectedRevision: 1, decision: 'approve', reason: 'injection probe reason', [k]: v }));
    for (const body of cases) {
      const r = await s.post(`/api/cases/${caseId}/review`, body);
      expect([409, 422], JSON.stringify(Object.keys(body))).toContain(r.status);
      expect(r.text).not.toMatch(/at .*\.(ts|js):\d+/); // no stack traces
    }
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    expect(d.actions).toHaveLength(0);
  });
  it('replay run body with sql/seed path traversal -> 4xx, no file read', async () => {
    for (const body of [{ sql: 'DROP TABLE x' }, { seed: '../../etc/passwd' }, { seed: '/etc/passwd' }, { seed: 'harbordesk-v1/../../package' }, { seed: { $ne: 1 } }]) {
      const r = await s.post('/api/replay/run', body);
      expect([404, 409, 422, 400], JSON.stringify(body)).toContain(r.status);
      expect(r.text).not.toContain('root:');
      expect(r.text).not.toMatch(/at .*\.(ts|js):\d+/);
    }
  });
  it('native-receipt/verify/recovery bodies with extra fields are rejected before touching an action', async () => {
    for (const [url, body] of [
      ['/api/actions/act-nope/native-receipt', { expectedVersion: 1, method: 'guild_ui', nativeRuleId: null, observedSelectors: { credentialId: 'c', operation: 'o', policySubjectId: 'p', workspaceId: 'w', decision: 'DENY', resources: null }, appliedAt: '2026-10-09T12:00:00Z', evidenceNote: 'note', command: 'guild policy apply' }],
      ['/api/actions/act-nope/verify', { expectedVersion: 1, subject: 'subj-evil' }],
      ['/api/actions/act-nope/recovery', { expectedVersion: 1, reason: 'long enough reason', sql: 'x' }],
    ] as const) {
      const r = await s.post(url, body);
      expect([404, 422], url).toContain(r.status);
    }
  });
  it('wrong types on revision -> 4xx', async () => {
    for (const rev of ['1', 1.5, -1, null, {}]) {
      const r = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: rev, decision: 'approve', reason: 'type probe reason' });
      expect([409, 422]).toContain(r.status);
    }
  });
});

describe('replay is never actionable and never touches the native database', () => {
  it('approve on a replay case -> 409 not_eligible; no action rows created', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    const r = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: d.revision, decision: 'approve', reason: 'attempt to approve replay case' });
    expect(r.status).toBe(409);
    expect(r.body.code).toBe('not_eligible');
    const r2 = await s.post(`/api/cases/${caseId}/review`, { expectedRevision: d.revision, decision: 'reject', reason: 'attempt to reject replay case' });
    expect(r2.status).toBe(409);
    const d2 = (await s.get(`/api/cases/${caseId}`)).body;
    expect(d2.actions).toHaveLength(0);
    expect(d2.actionState).toBe('none');
  });

  it('investigation on replay yields no model text', async () => {
    const d = (await s.get(`/api/cases/${caseId}`)).body;
    const r = await s.post(`/api/cases/${caseId}/investigate`, { expectedRevision: d.revision });
    if (r.status === 200) expect(r.body.investigation?.narrative ?? null).toBeNull();
    else expect([409, 422, 503]).toContain(r.status);
  });

  it('a second replay run + all of the above leave the NATIVE database (scopewatch) untouched; replay DB gained rows', async () => {
    const r = await s.post('/api/replay/run', {});
    expect(r.status, r.text).toBe(200);
    const nativeAfter = await chRowCounts('scopewatch');
    const replayAfter = await chRowCounts('scopewatch_replay');
    expect(nativeAfter).toEqual(nativeBefore);
    const grew = Object.keys(replayAfter).some((t) => replayAfter[t]! > (replayBefore[t] ?? 0));
    expect(grew, `replay DB rows before ${JSON.stringify(replayBefore)} after ${JSON.stringify(replayAfter)}`).toBe(true);
  });

  it('every evaluation query receipt of a replay case names the replay database, never the native one', async () => {
    const q = (await s.get(`/api/cases/${caseId}/queries`)).body as Array<{ database: string; target: string }>;
    expect(q.length).toBeGreaterThan(1);
    for (const x of q) expect(x.database).toBe('scopewatch_replay');
  });
});

describe('export sanitization (replay)', () => {
  it('contains no configured secret/password value and states non-evidence limits', async () => {
    const r = await s.get(`/api/export/${caseId}`);
    expect(r.status).toBe(200);
    for (const secret of s.secrets) if (secret) expect(r.text.includes(secret), 'export leaked a configured secret').toBe(false);
    expect(r.text).not.toMatch(/password|api[_-]?key|authorization|bearer\s+[a-z0-9]/i);
    expect(r.body.limits.join(' ')).toContain('NOT NATIVE EVIDENCE');
    expect(r.body.provenance).toBe('replay');
  });
  it('status and case payloads do not leak secrets either', async () => {
    for (const u of ['/api/status', `/api/cases/${caseId}`, '/api/cases', '/api/generations']) {
      const r = await s.get(u);
      for (const secret of s.secrets) if (secret) expect(r.text.includes(secret), `${u} leaked a secret`).toBe(false);
    }
  });
});
