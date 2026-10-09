// Read path against the sanitized native capture of 2026-10-09 (account charliegillet, workspace
// charliegillet~scopewatch): fixtures/native-2026-10-09-charliegillet. The raw pages are served through the real
// GuildHttp + collectSessionSnapshot via a fake fetch (no network), so pagination and coverage run too.
// Provenance stays 'contract_test': replayed captured shapes, not a live read.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { bindEvents } from '../../../src/integrations/guild/binding.js';
import { collectSessionSnapshot } from '../../../src/integrations/guild/collector.js';
import { GuildHttp } from '../../../src/integrations/guild/http.js';
import { inspectMarker } from '../../../src/integrations/guild/verifier.js';
import type { CollectedSession, LaunchProfile, RegisteredSession } from '../../../src/shared/ports.js';

const DIR = join(__dirname, 'fixtures', 'native-2026-10-09-charliegillet');
const load = (name: string): Record<string, unknown> => JSON.parse(readFileSync(join(DIR, name), 'utf8')) as Record<string, unknown>;
type Items = Array<Record<string, unknown>>;

const WS = '01a1226d-8f2d-3bb9-0000-8cd6bac376ac';
const CRED = '01a122b4-50dc-c369-0000-8e61c35f6839';
const TARGET_DEF = '01a1226d-b40c-726e-0000-c52bb1bbe8a7'; // charliegillet~scopewatch-ticketassist
const CONTROL_DEF = '01a1226f-93bc-726e-0000-647311bcfc16'; // charliegillet~scopewatch-releasereview
const MAP = { [TARGET_DEF]: TARGET_DEF, [CONTROL_DEF]: CONTROL_DEF };

interface Fx {
  profile: LaunchProfile;
  sessionId: string;
  def: string;
  eventId: string;
  toolTaskId: string;
  rootTaskId: string;
  createdAtNs: string;
  session: Record<string, unknown>;
  events: Items;
  tasks: Items;
}

const fx = (profile: 'target' | 'control', o: Omit<Fx, 'profile' | 'session' | 'events' | 'tasks'>): Fx => ({
  profile,
  ...o,
  session: load(`${profile}-session.json`),
  events: load(`${profile}-events.json`).items as Items,
  tasks: load(`${profile}-tasks.json`).items as Items,
});

const TARGET = fx('target', {
  sessionId: '01a122bc-1ef2-f9c4-0000-bcb0253909a1', def: TARGET_DEF, eventId: '01a122bc-3af2-e1d1-0000-63b8a590d2c1',
  toolTaskId: '01a122bc-38b8-bce2-0000-203dabe0fc30', rootTaskId: '01a122bc-1ef9-4aa6-0000-c03de051454d', createdAtNs: '1791584123634925000',
});
const CONTROL = fx('control', {
  sessionId: '01a122bc-20c5-f9c4-0000-7d43acfdda01', def: CONTROL_DEF, eventId: '01a122bc-854f-e1d1-0000-8e201d79fa7d',
  toolTaskId: '01a122bc-8385-bce2-0000-967881490beb', rootTaskId: '01a122bc-20cb-4aa6-0000-b137f842d3fa', createdAtNs: '1791584142671666000',
});

/** Serves the captured pages with offset/limit/has_more/total_count, honouring sort_by=id like the native API. */
function fakeHttp(f: Fx, mutateEvents: (items: Items) => Items = (x) => x): GuildHttp {
  const fetchImpl = (async (input: string | URL | Request) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    const m = /^\/v1\/sessions\/([^/]+)(?:\/(events|tasks))?$/.exec(url.pathname);
    if (!m || m[1] !== f.sessionId) return new Response(JSON.stringify({ error: 'NotFound' }), { status: 404 });
    if (!m[2]) return new Response(JSON.stringify(f.session), { status: 200 });
    let items = m[2] === 'events' ? mutateEvents(structuredClone(f.events)) : structuredClone(f.tasks);
    if (url.searchParams.get('sort_by') === 'id') items = [...items].sort((a, b) => String(a.id).localeCompare(String(b.id)));
    const offset = Number(url.searchParams.get('offset') ?? 0);
    const limit = Number(url.searchParams.get('limit') ?? 100);
    const page = items.slice(offset, offset + limit);
    const pagination = { offset, limit, total_count: items.length, has_more: offset + page.length < items.length };
    return new Response(JSON.stringify({ items: page, pagination }), { status: 200 });
  }) as typeof fetch;
  return new GuildHttp({ baseUrl: 'https://guild.invalid', getRetries: 0, fetchImpl });
}

const reg = (f: Fx): RegisteredSession => ({
  workspaceId: WS, sessionId: f.sessionId, launchId: `launch-${f.profile}`, profile: f.profile, expectedPolicySubjectId: f.def, installedAgentId: 'informational-only',
});

const collect = (f: Fx, mutateEvents?: (items: Items) => Items, pageLimit = 2): Promise<CollectedSession> =>
  collectSessionSnapshot({ http: fakeHttp(f, mutateEvents), key: 'k-id:k-secret', provenance: 'contract_test', pageLimit, now: () => new Date('2026-10-09T23:00:00Z') }, reg(f), 'g-cal');

const bind = (f: Fx, col: CollectedSession) =>
  bindEvents({ generationId: 'g-cal', observations: col.observations, tasks: col.tasks, registry: [reg(f)], subjectDomainMap: MAP });

const securityEvent = (items: Items): Record<string, unknown> => items.find((e) => e.type === 'security_event') as Record<string, unknown>;

describe.each([TARGET, CONTROL])('native calibration capture: $profile session', (f) => {
  it('the captured shape is the native one (no top-level task_id/credentials_id, no task response_data)', () => {
    const e = securityEvent(f.events);
    expect(e).not.toHaveProperty('task_id');
    expect(e).not.toHaveProperty('credentials_id');
    expect(f.tasks.some((t) => 'response_data' in t)).toBe(false);
  });

  it('collects exactly one security observation with no required-field gaps, over complete paginated coverage', async () => {
    const col = await collect(f);
    expect(col.errors).toEqual([]);
    expect(col.coverage.coverageState).toBe('complete');
    expect(col.sessionStatus).toBe('DONE');
    expect(col.coverage.fetchedPages).toBe(Math.ceil(f.events.length / 2) + Math.ceil(f.tasks.length / 2));
    expect(col.coverage.fetchedPages).toBe(col.coverage.expectedPages);
    expect(col.coverage.requiredFieldGaps).toBe(0);
    expect(col.observations).toHaveLength(1);
    expect(col.observations[0]).toMatchObject({
      nativeEventId: f.eventId,
      nativeIdentityKey: JSON.stringify([WS, f.eventId]),
      sessionId: f.sessionId,
      nativeTaskId: f.toolTaskId,
      credentialId: CRED,
      operation: 'issues_get',
      decision: 'ALLOW',
      reasonCode: 'ACCESS_ALLOWED',
      createdAtNs: f.createdAtNs,
    });
    expect(col.coverage.notes.some((n) => /runtime_done results attached/.test(n))).toBe(true);
    expect(col.coverage.notes.some((n) => /other non-security events ignored/.test(n))).toBe(true);
  });

  it('binds the event to the agent that actually ran (root task definition id), not the trigger default', async () => {
    const col = await collect(f);
    const r = bind(f, col);
    expect(r.bindings).toHaveLength(1);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'verified', policySubjectId: f.def, nativeActingTaskId: f.rootTaskId });
    expect(r.bindings[0]!.proofRef).toBe(`task_graph:${f.sessionId}:${f.toolTaskId}>${f.rootTaskId}`);
    expect(r.diagnostics).toEqual([]);
  });

  it('attaches the runtime_done tool result (content.body) to the tool task; agent-task results stay unattached', async () => {
    const col = await collect(f);
    const tool = col.tasks.find((t) => t.taskId === f.toolTaskId)!;
    expect(tool.kind).toBe('tool');
    expect((tool.responseData as { body: string }).body).toContain('SW-CONTROL-MARKER-FIXTURE');
    expect(inspectMarker(tool, 'SW-CONTROL-MARKER-FIXTURE')).toBe('present');
    expect(inspectMarker(tool, 'SW-NOT-THE-MARKER')).toBe('absent');
    const root = col.tasks.find((t) => t.taskId === f.rootTaskId)!;
    expect(root.kind).toBe('agent');
    expect(root.responseData).toBeNull();
    expect(col.tasks.find((t) => t.toolName === 'console_log')!.responseData).toEqual({ result: 'ok' });
  });

  it('a tampered details.agent_id that disagrees with the acting agent task is not verified', async () => {
    const other = f.def === TARGET_DEF ? CONTROL_DEF : TARGET_DEF;
    const col = await collect(f, (items) => {
      (securityEvent(items).details as Record<string, unknown>).agent_id = other;
      return items;
    });
    const r = bind(f, col);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
    expect(r.bindings[0]!.reason).toContain(`event agent ${other} disagrees`);
  });

  it('a top-level credentials_id contradicting details.credentials_id is a gap and a binding conflict', async () => {
    const col = await collect(f, (items) => {
      securityEvent(items).credentials_id = 'cred-other';
      return items;
    });
    expect(col.observations[0]!.credentialId).toBeNull();
    expect(col.coverage.requiredFieldGaps).toBe(1);
    expect(col.coverage.notes.some((n) => n.includes('credentials_id disagree'))).toBe(true);
    expect(bind(f, col).bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
  });

  it('a top-level task_id equal to task.id is accepted; a different one is a gap', async () => {
    const same = await collect(f, (items) => {
      securityEvent(items).task_id = f.toolTaskId;
      return items;
    });
    expect(same.observations[0]!.nativeTaskId).toBe(f.toolTaskId);
    expect(bind(f, same).bindings[0]!.bindingState).toBe('verified');
    const diff = await collect(f, (items) => {
      securityEvent(items).task_id = f.rootTaskId;
      return items;
    });
    expect(diff.observations[0]!.nativeTaskId).toBeNull();
    expect(diff.coverage.requiredFieldGaps).toBe(1);
    expect(bind(f, diff).bindings[0]!.bindingState).toBe('conflict');
  });

  // Envelope vs nested `security` block (documented shape, not observed natively): a disagreement must not be
  // refilled from task.id / details.*, neither in the collector nor after semanticJson readback in binding.
  it('a top-level task_id contradicted by a nested security.task_id stays a gap even though task.id agrees with one side', async () => {
    const col = await collect(f, (items) => {
      const e = securityEvent(items);
      e.task_id = f.rootTaskId;
      e.security = { task_id: f.toolTaskId };
      return items;
    });
    expect(col.observations[0]!.nativeTaskId).toBeNull();
    expect(col.coverage.requiredFieldGaps).toBe(1);
    expect(col.coverage.notes.some((n) => n.includes('task_id disagree'))).toBe(true);
    expect(JSON.parse(col.observations[0]!.semanticJson).field_conflicts).toEqual(['task_id']);
    const r = bind(f, col);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
    expect(r.bindings[0]!.reason).toContain('task_id');
  });

  it('a top-level credentials_id contradicted by a nested security.credentials_id stays a gap even though details agrees with one side', async () => {
    const col = await collect(f, (items) => {
      const e = securityEvent(items);
      e.credentials_id = 'cred-envelope';
      e.security = { credentials_id: CRED };
      return items;
    });
    expect(col.observations[0]!.credentialId).toBeNull();
    expect(col.coverage.requiredFieldGaps).toBe(1);
    expect(bind(f, col).bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
  });

  it('a nested agent_id/session_id contradiction is counted as a gap and blocks binding', async () => {
    const col = await collect(f, (items) => {
      const e = securityEvent(items);
      e.agent_id = f.def;
      e.session_id = f.sessionId;
      e.security = { agent_id: 'def-other', session_id: 'sess-other' };
      return items;
    });
    expect(col.observations[0]!.nativeTaskId).toBe(f.toolTaskId);
    expect(col.coverage.requiredFieldGaps).toBe(1);
    expect(bind(f, col).bindings[0]!.bindingState).toBe('conflict');
  });

  it('details.workspace_id is corroborated against the collection workspace', async () => {
    expect((securityEvent(f.events).details as Record<string, unknown>).workspace_id).toBe(WS);
    const col = await collect(f, (items) => {
      (securityEvent(items).details as Record<string, unknown>).workspace_id = 'ws-other';
      return items;
    });
    const r = bind(f, col);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
    expect(r.bindings[0]!.reason).toContain('workspace ws-other');
  });
});

describe('native calibration capture: identity sources', () => {
  it('the control session trigger names TicketAssist, yet the control event binds to ReleaseReview', async () => {
    const trig = CONTROL.session.trigger as Record<string, Record<string, unknown>>;
    expect(trig.agent!.id).toBe(TARGET_DEF);
    expect((trig.workspace_agent!.agent as Record<string, unknown>).id).toBe(TARGET_DEF);
    const r = bind(CONTROL, await collect(CONTROL));
    expect(r.bindings[0]).toMatchObject({ bindingState: 'verified', policySubjectId: CONTROL_DEF });
  });

  it('the trigger default agent cannot stand in for the registered control subject', async () => {
    // Registering the control session under the trigger-default (TicketAssist) subject must not verify.
    const col = await collect(CONTROL);
    const r = bindEvents({ generationId: 'g-cal', observations: col.observations, tasks: col.tasks, registry: [{ ...reg(CONTROL), expectedPolicySubjectId: TARGET_DEF }], subjectDomainMap: MAP });
    expect(r.bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
  });

  it('acting_user (trigger creator, actor_type HUMAN) is recorded in semanticJson but is not identity', async () => {
    const col = await collect(TARGET);
    const sem = JSON.parse(col.observations[0]!.semanticJson) as Record<string, unknown>;
    expect(sem.acting_user).toEqual({ id: '019ebd7d-476a-0175-0000-a81c61cfd337' });
    expect((sem.details as Record<string, unknown>).actor_type).toBe('HUMAN');
    // Unmapped definition ids never fall back to the acting user or the registered subject.
    const r = bindEvents({ generationId: 'g', observations: col.observations, tasks: col.tasks, registry: [reg(TARGET)], subjectDomainMap: { '019ebd7d-476a-0175-0000-a81c61cfd337': TARGET_DEF } });
    expect(r.bindings[0]!.bindingState).toBe('unresolved');
  });

  it('one runtime_done event id redelivered with different content attaches nothing for that tool task', async () => {
    const col = await collect(CONTROL, (items) => {
      const done = items.find((e) => e.type === 'runtime_done' && (e.task as Record<string, unknown>).id === CONTROL.toolTaskId)!;
      return [...items, { ...done, content: { body: 'forged SW-CONTROL-MARKER-FIXTURE' } }];
    });
    expect(col.tasks.find((t) => t.taskId === CONTROL.toolTaskId)!.responseData).toBeNull();
    expect(col.coverage.notes.some((n) => n.includes('conflicting content'))).toBe(true);
  });

  it('several distinct runtime_done results for one tool task are all kept in event-id order', async () => {
    const col = await collect(CONTROL, (items) => {
      const done = items.find((e) => e.type === 'runtime_done' && (e.task as Record<string, unknown>).id === CONTROL.toolTaskId)!;
      return [...items, { ...done, id: 'ffffffff-later', content: { body: 'second' } }];
    });
    const rd = col.tasks.find((t) => t.taskId === CONTROL.toolTaskId)!.responseData as Array<{ body: string }>;
    expect(Array.isArray(rd)).toBe(true);
    expect(rd).toHaveLength(2);
    expect(rd[0]!.body).toContain('SW-CONTROL-MARKER-FIXTURE');
    expect(rd[1]!.body).toBe('second');
  });
});
