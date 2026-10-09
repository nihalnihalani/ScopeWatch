/** Real Guild adapter over HTTP against the loopback CONTRACT-TEST MOCK (documented schema, not observed account). */
import { afterEach, describe, expect, it } from 'vitest';
import { createGuildPort, GuildAdapter } from '../../../src/integrations/guild/index.js';
import { makeConfig, regFor, setup, SUBJECT_MAP, type Mock } from '../../support/mock-guild/testkit.js';
import { startMockGuild } from '../../support/mock-guild/server.js';
import type { ProbeRequest } from '../../../src/shared/ports.js';

let closers: Array<() => Promise<void>> = [];
afterEach(async () => {
  await Promise.all(closers.map((c) => c()));
  closers = [];
});
async function env(...args: Parameters<typeof setup>) {
  const e = await setup(...args);
  closers.push(e.mock.close);
  return e;
}

const probeReq = (mock: Mock, role: 'target' | 'control', ref: string, notBefore = '2026-10-09T11:00:00Z'): ProbeRequest => ({
  role,
  notBefore,
  idempotencyRef: ref,
  scope: {
    workspaceId: mock.options.workspace.id,
    policySubjectId: mock.options.subjects.target,
    credentialId: mock.options.credentialId,
    operation: mock.options.operation,
    resourceSelector: null,
    decision: 'DENY',
    residualCapability: [],
  },
});

describe('launch + collection', () => {
  it('launches via the documented trigger route and traverses multiple event/task pages', async () => {
    const { mock, adapter, config } = await env({}, { pageLimit: 3 });
    mock.control.setScenario({ targetCalls: 7 });
    const rcpt = await adapter.launch('target', 'read tickets', 'ref-1');
    expect(rcpt).toMatchObject({ outcome: 'created', route: 'api_trigger', sessionType: 'api', provenance: 'contract_test', requestedInstalledAgentId: mock.options.installed.target });
    expect(rcpt.nativeSessionId && rcpt.nativeRootTaskId && rcpt.workspaceId).toBeTruthy();
    expect(mock.control.requestLog.find((r) => r.method === 'POST')).toMatchObject({ path: `/v1/workspaces/acme/harbordesk/sessions`, auth: 'trigger' });
    expect(mock.control.requestLog.filter((r) => r.method === 'GET').every((r) => r.auth === 'collector')).toBe(true);

    expect(await adapter.awaitCompletion(rcpt.nativeSessionId!, 2000)).toBe('DONE');
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'gen-1');
    expect(col.complete).toBe(true);
    expect(col.coverage.coverageState).toBe('complete');
    expect(col.observations).toHaveLength(7);
    expect(col.coverage.fetchedPages).toBe(col.coverage.expectedPages);
    expect(col.coverage.fetchedPages).toBeGreaterThan(2);
    expect(col.pageRefs.some((p) => p.includes('offset=3'))).toBe(true);
    expect(col.observations.every((o) => o.credentialId === mock.options.credentialId && o.createdAtNs !== null && o.provenance === 'contract_test')).toBe(true);
    expect(col.coverage.requiredFieldGaps).toBe(0);
    // bind through the same adapter
    const b = adapter.bindEvents({ generationId: 'gen-1', observations: col.observations, tasks: col.tasks, registry: [regFor(mock, rcpt.nativeSessionId!)], subjectDomainMap: SUBJECT_MAP(mock) });
    expect(b.bindings).toHaveLength(7);
    expect(b.bindings.every((x) => x.bindingState === 'verified' && x.policySubjectId === mock.options.subjects.target)).toBe(true);
    expect(JSON.stringify(config)).toBeTruthy();
  });

  it('a failed second page yields incomplete coverage, never complete', async () => {
    const { mock, adapter } = await env({}, { pageLimit: 3, getRetries: 1 });
    mock.control.setScenario({ targetCalls: 7, failPageAfterFirst: true });
    const rcpt = await adapter.launch('target', 'x', 'ref-fp');
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'g');
    expect(col.complete).toBe(false);
    expect(['incomplete', 'failed']).toContain(col.coverage.coverageState);
    expect(col.errors.length).toBeGreaterThan(0);
    expect(col.coverage.fetchedPages).toBeLessThan(col.coverage.expectedPages);
  });

  it('hidden/restricted 404 is a failed coverage (access problem), not an empty complete session', async () => {
    const { mock, adapter } = await env();
    const rcpt = await adapter.launch('target', 'x', 'ref-404');
    mock.control.setScenario({ hide404: true });
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'g');
    expect(col.coverage.coverageState).toBe('failed');
    expect(col.observations).toHaveLength(0);
    expect(col.errors[0]).toContain('ACCESS problem');
  });

  it('500 (missing agents:read) is reported with the documented hint, not treated as empty', async () => {
    const { mock, adapter } = await env({}, { getRetries: 0 });
    const rcpt = await adapter.launch('target', 'x', 'ref-500');
    mock.control.setScenario({ eventsServerError: true });
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'g');
    expect(col.complete).toBe(false);
    expect(col.errors.join(' ')).toContain('agents:read');
  });

  it('open (non-terminal) sessions are coverage open, missing credentials_id/clock are gaps', async () => {
    const { mock, adapter } = await env();
    mock.control.setScenario({ keepRunning: true, missingCredentialsId: true, missingClock: true });
    const rcpt = await adapter.launch('target', 'x', 'ref-open');
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'g');
    expect(col.coverage.coverageState).toBe('open');
    expect(col.coverage.requiredFieldGaps).toBe(col.observations.length);
    expect(col.observations.every((o) => o.credentialId === null && o.createdAtNs === null)).toBe(true);
  });

  it('conflicting redelivery is preserved as two observations with differing semantic JSON', async () => {
    const { mock, adapter } = await env();
    mock.control.setScenario({ conflictingRedelivery: true });
    const rcpt = await adapter.launch('target', 'x', 'ref-cr');
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'g');
    const byKey = new Map<string, Set<string>>();
    for (const o of col.observations) byKey.set(o.nativeIdentityKey!, (byKey.get(o.nativeIdentityKey!) ?? new Set()).add(o.semanticJson));
    expect([...byKey.values()].some((s) => s.size === 2)).toBe(true);
    expect(col.observations).toHaveLength(4);
  });

  it('nested sub-agent events bind to B only through the task graph', async () => {
    const { mock, adapter } = await env();
    mock.control.setScenario({ targetCalls: 4, nestedCalls: 2 });
    const rcpt = await adapter.launch('target', 'x', 'ref-nest');
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'g');
    const b = adapter.bindEvents({ generationId: 'g', observations: col.observations, tasks: col.tasks, registry: [regFor(mock, rcpt.nativeSessionId!)], subjectDomainMap: {} });
    const subjects = b.bindings.map((x) => x.policySubjectId).sort();
    expect(subjects).toEqual([mock.options.subjects.control, mock.options.subjects.control, mock.options.subjects.target, mock.options.subjects.target].sort());
  });
});

describe('launch ambiguity', () => {
  it('timeout with an effect is unknown, then reconciled through documented list+events routes without a second POST', async () => {
    const { mock, adapter } = await env({}, { requestTimeoutMs: 150, getRetries: 0 });
    mock.control.setScenario({ launchDelayMs: 600 });
    const r1 = await adapter.launch('target', 'x', 'ref-to');
    expect(r1.outcome).toBe('unknown');
    expect(mock.control.postCount()).toBe(1);
    mock.control.setScenario({ launchDelayMs: 0 });
    const rec = await adapter.reconcileLaunch('ref-to');
    expect(rec?.outcome).toBe('created');
    expect(rec?.nativeSessionId).toBeTruthy();
    const again = await adapter.launch('target', 'x', 'ref-to');
    expect(again.nativeSessionId).toBe(rec!.nativeSessionId);
    expect(mock.control.postCount()).toBe(1);
  });

  it('timeout with no effect: reconcile finds nothing and a retry is then allowed', async () => {
    const { mock, adapter } = await env({}, { requestTimeoutMs: 100, getRetries: 0 });
    mock.control.setScenario({ launchDelayMs: 400, launchNoEffect: true });
    const r1 = await adapter.launch('target', 'x', 'ref-ne');
    expect(r1.outcome).toBe('unknown');
    expect(await adapter.reconcileLaunch('ref-ne')).toBeNull();
    mock.control.setScenario({ launchDelayMs: 0, launchNoEffect: false });
    const r2 = await adapter.launch('target', 'x', 'ref-ne');
    expect(r2.outcome).toBe('created');
    expect(mock.control.postCount()).toBe(2);
  });

  it('unknown stays unknown when reconciliation itself cannot be performed (no blind retry)', async () => {
    const { mock, adapter } = await env({}, { requestTimeoutMs: 100, getRetries: 0 });
    mock.control.setScenario({ launchDelayMs: 400, launchNoEffect: true });
    await adapter.launch('target', 'x', 'ref-nb');
    mock.control.setScenario({ eventsServerError: false, hide404: true });
    const r2 = await adapter.launch('target', 'x', 'ref-nb');
    expect(r2.outcome).toBe('unknown');
    expect(mock.control.postCount()).toBe(1);
  });

  it('only allowlisted installed agents can be launched; unconfigured profile never calls the network', async () => {
    const { mock, adapter } = await env({}, {}, { investigatorInstalledAgentId: null });
    const r = await adapter.launch('investigator', 'x', 'ref-un');
    expect(r.outcome).toBe('failed');
    expect(mock.control.postCount()).toBe(0);
    const t = await adapter.launch('target', 'x', 'ref-ok');
    expect(JSON.stringify(mock.control.inputs)).not.toContain('agent_id');
    expect(t.requestedInstalledAgentId).toBe(mock.options.installed.target);
  });
});

describe('probes', () => {
  it('target DENY/POLICY_DENIED for the bound subject is refused_policy; control still returns the marker', async () => {
    const { mock, adapter } = await env();
    mock.control.applyDeny(); // simulates the HUMAN applying a DENY in the Guild UI
    const t = await adapter.runProbe(probeReq(mock, 'target', 'p-t1'));
    expect(t).toMatchObject({ outcome: 'refused_policy', decision: 'DENY', reasonCode: 'POLICY_DENIED', boundSubjectId: mock.options.subjects.target, credentialId: mock.options.credentialId });
    expect(t.nativeEventIds.length).toBeGreaterThan(0);
    const c = await adapter.runProbe(probeReq(mock, 'control', 'p-c1'));
    expect(c.outcome).toBe('succeeded_expected');
    expect(c.inspection).toContain('response_data');
    expect(c.inspection).not.toContain(mock.options.controlMarker);
    // the marker is held server side only
    expect(mock.control.inputs.join('\n')).not.toContain(mock.options.controlMarker);
  });

  it('credential error is refused_other, not a policy refusal', async () => {
    const { mock, adapter } = await env();
    mock.control.setScenario({ credentialError: true });
    const t = await adapter.runProbe(probeReq(mock, 'target', 'p-ce'));
    expect(t.outcome).toBe('refused_other');
    expect(t.reasonCode).toBe('CREDENTIAL_UNAVAILABLE');
  });

  it('target without a policy is allowed (restriction not in effect)', async () => {
    const { mock, adapter } = await env();
    const t = await adapter.runProbe(probeReq(mock, 'target', 'p-allow'));
    expect(t.outcome).toBe('allowed');
    expect(t.decision).toBe('ALLOW');
  });

  it('control with wrong content or without inspectable response_data is not a success', async () => {
    const a = await env();
    a.mock.control.setScenario({ controlWrongContent: true });
    expect((await a.adapter.runProbe(probeReq(a.mock, 'control', 'p-wc'))).outcome).toBe('succeeded_unexpected_content');
    const b = await env();
    b.mock.control.setScenario({ omitResponseData: true });
    const r = await b.adapter.runProbe(probeReq(b.mock, 'control', 'p-nd'));
    expect(r.outcome).toBe('missing');
    expect(r.inspection).toContain('not inspectable');
  });

  it('events from a nested sub-agent are not attributed to the probed target subject', async () => {
    const { mock, adapter } = await env();
    mock.control.setScenario({ targetCalls: 2, nestedCalls: 2 });
    mock.control.applyDeny({ subject: mock.options.subjects.control });
    const t = await adapter.runProbe(probeReq(mock, 'target', 'p-nest'));
    expect(t.outcome).toBe('missing');
  });

  it('a probe is not fresh unless started strictly after notBefore', async () => {
    const { mock, adapter } = await env();
    const t = await adapter.runProbe(probeReq(mock, 'target', 'p-old', '2099-01-01T00:00:00Z'));
    expect(t.outcome).toBe('missing');
    expect(t.inspection).toContain('strictly after notBefore');
  });

  it('scope that differs from the verified credential/operation is refused before any launch', async () => {
    const { mock, adapter } = await env();
    const req = probeReq(mock, 'target', 'p-bad');
    req.scope.operation = 'issues_create';
    expect((await adapter.runProbe(req)).outcome).toBe('missing');
    expect(mock.control.postCount()).toBe(0);
  });
});

describe('investigator', () => {
  it('returns the issue URL and narrative; input has no keys or control marker', async () => {
    const { mock, adapter, config } = await env();
    const r = await adapter.runInvestigation({ caseId: 'case-1', caseRevision: 2, contextSha256: 'ab'.repeat(32), facts: { primary: 'subject-target-A', count: '41' }, manifestRef: 'git:abc:manifest.json', ownedRepo: mock.options.ownedRepo, idempotencyRef: 'inv-1' });
    expect(r.state).toBe('created');
    expect(r.incidentUrl).toBe(`https://github.com/${mock.options.ownedRepo}/issues/7`);
    expect(r.narrative).toContain('untrusted');
    expect(r.nativeSessionId && r.nativeTaskId).toBeTruthy();
    expect(r.grounded).toBeNull();
    expect(r.checks).toEqual([]);
    const sent = mock.control.inputs.join('\n');
    expect(sent).toContain('case-1');
    expect(sent).not.toContain(config.guild.triggerKey!);
    expect(sent).not.toContain(config.guild.collectorKey!);
    expect(sent).not.toContain(mock.options.controlMarker);
  });

  it('duplicate create, missing issue and missing html_url are not reported as created', async () => {
    const mk = { caseId: 'c', caseRevision: 1, contextSha256: 'ab'.repeat(32), facts: {}, manifestRef: 'm', ownedRepo: 'acme/harbordesk-synthetic' };
    const a = await env();
    a.mock.control.setScenario({ investigatorMode: 'duplicate' });
    expect((await a.adapter.runInvestigation({ ...mk, idempotencyRef: 'i-d' })).state).toBe('create_unknown');
    const b = await env();
    b.mock.control.setScenario({ investigatorMode: 'no_issue' });
    expect((await b.adapter.runInvestigation({ ...mk, idempotencyRef: 'i-n' })).state).toBe('failed');
    const c = await env();
    c.mock.control.setScenario({ investigatorMode: 'no_html_url' });
    const rc = await c.adapter.runInvestigation({ ...mk, idempotencyRef: 'i-h' });
    expect(rc.state).toBe('create_unknown');
    expect(rc.incidentUrl).toBeNull();
  });

  it('launch timeout is create_unknown', async () => {
    const { mock, adapter } = await env({}, { requestTimeoutMs: 100, getRetries: 0 });
    mock.control.setScenario({ launchDelayMs: 400 });
    const r = await adapter.runInvestigation({ caseId: 'c', caseRevision: 1, contextSha256: 'ab'.repeat(32), facts: {}, manifestRef: 'm', ownedRepo: mock.options.ownedRepo, idempotencyRef: 'i-t' });
    expect(r.state).toBe('create_unknown');
  });
});

describe('adapter surface', () => {
  it('health reports missing settings by NAME only and never values', async () => {
    const mock = await startMockGuild();
    closers.push(mock.close);
    const cfg = makeConfig(mock, { triggerKey: null, ownedRepo: null });
    const h = await new GuildAdapter(cfg).health();
    expect(h.ok).toBe(false);
    expect(h.missing).toContain('GUILD_TRIGGER_ID/GUILD_TRIGGER_SECRET');
    expect(JSON.stringify(h)).not.toContain(mock.options.collectorKey);
    const ok = await new GuildAdapter(makeConfig(mock)).health();
    expect(ok).toMatchObject({ ok: true, missing: [] });
  });

  it('createGuildPort is null for replay and provenance follows the mode', async () => {
    const mock = await startMockGuild();
    closers.push(mock.close);
    const base = makeConfig(mock);
    expect(createGuildPort({ ...base, mode: 'replay' })).toBeNull();
    expect(createGuildPort(base)!.provenance).toBe('contract_test');
    expect(createGuildPort({ ...base, mode: 'native' })!.provenance).toBe('native');
  });

  it('wrong collector key yields redacted access errors', async () => {
    const mock = await startMockGuild();
    closers.push(mock.close);
    const bad = 'wrong-id:wrongsecretvalue99';
    const a = new GuildAdapter(makeConfig(mock, { collectorKey: bad }), { getRetries: 0 });
    const col = await a.collectSession(regFor(mock, 'does-not-matter'), 'g');
    expect(col.complete).toBe(false);
    expect(JSON.stringify(col)).not.toContain('wrongsecretvalue99');
  });
});

describe('config-driven mapping', () => {
  it('uses config.agentSubjectMap; empty map leaves refs unresolved; unverified domain is labelled', async () => {
    const { mock, adapter } = await env();
    const rcpt = await adapter.launch('target', 'x', 'ref-map');
    const col = await adapter.collectSession(regFor(mock, rcpt.nativeSessionId!), 'g');
    const input = { generationId: 'g', observations: col.observations, tasks: col.tasks, registry: [regFor(mock, rcpt.nativeSessionId!)], subjectDomainMap: {} };
    expect(adapter.bindEvents(input).bindings.every((b) => b.bindingState === 'verified')).toBe(true);
    const e2 = await env({}, {}, { agentSubjectMap: {}, identityDomain: 'unverified' });
    const r2 = await e2.adapter.launch('target', 'x', 'ref-map2');
    const c2 = await e2.adapter.collectSession(regFor(e2.mock, r2.nativeSessionId!), 'g');
    expect(c2.observations.every((o) => o.identityDomain === 'unverified')).toBe(true);
    const b2 = e2.adapter.bindEvents({ ...input, observations: c2.observations, tasks: c2.tasks, registry: [regFor(e2.mock, r2.nativeSessionId!)] });
    expect(b2.bindings.every((b) => b.bindingState === 'unresolved')).toBe(true);
  });
});
