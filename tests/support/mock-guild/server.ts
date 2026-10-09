/**
 * CONTRACT-TEST MOCK Guild API. Loopback only. Never imported from src/**.
 * Every response carries `x-scopewatch-mock: contract-test-mock-not-observed-account`.
 *
 * Response SHAPES follow the sanitized native calibration capture of 2026-10-09
 * (tests/unit/guild/fixtures/native-2026-10-09-charliegillet/): launch takes the agent DEFINITION id (or
 * owner~name) and rejects installed ids; session.trigger.agent is the trigger's DEFAULT agent, not the agent
 * that ran; security_event carries operation/decision/reason_code top-level and credentials_id/agent_id/
 * session_id under `details`, with the tool task as the `task` object; tool result content lives in the tool
 * task's `runtime_done` event (`content.body`), and the tasks listing has no response_data.
 * Behaviour (policy decisions, timing, failures) is SIMULATED and is not native evidence. Shapes not covered by
 * the capture (DENY/ERROR events, denied tool content, nested sub-agents, issue-create results) are mock guesses.
 *
 * Scenario control lives under /__mock/* (and the returned `control` object). The "apply DENY policy"
 * control simulates a HUMAN applying a policy in the Guild UI; the application never calls it.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

export const MOCK_LABEL = 'CONTRACT-TEST MOCK shaped like the 2026-10-09 native capture; behaviour simulated, not observed account';

type Profile = 'target' | 'control' | 'investigator';
type Rec = Record<string, unknown>;

export interface MockOptions {
  port?: number;
  triggerKey?: string;
  collectorKey?: string;
  workspace?: { id: string; owner: string; name: string };
  /** agent DEFINITION ids (EntAgent.id): what launch accepts as agent_id and what agent tasks report as agent.id */
  agents?: { target: string; control: string; investigator: string };
  /** agent slugs; launch also accepts `${workspace.owner}~${name}` */
  agentNames?: { target: string; control: string; investigator: string };
  /** workspace INSTALLED-agent ids (EntWorkspaceAgent.id): launch rejects these, as native does */
  installed?: { target: string; control: string; investigator: string };
  /** policy subject for each agent (a DIFFERENT id domain on purpose) */
  subjects?: { target: string; control: string };
  /** the API trigger's configured default agent; reported in session.trigger regardless of which agent ran */
  triggerDefault?: Profile;
  triggerId?: string;
  /** trigger creator: reported as acting_user / run_as_user_id (record only, never authority) */
  actingUser?: { id: string; name: string };
  credentialId?: string;
  operation?: string;
  ownedRepo?: string;
  controlMarker?: string;
  targetMarker?: string;
}

export const MOCK_DEFAULTS = {
  triggerKey: 'trig-id:trig-secret-value',
  collectorKey: 'coll-id:coll-secret-value',
  workspace: { id: '11111111-1111-4111-8111-111111111111', owner: 'acme', name: 'harbordesk' },
  agents: { target: 'agentdef-target-1001', control: 'agentdef-control-1002', investigator: 'agentdef-investigator-1003' },
  agentNames: { target: 'harbordesk-ticketassist', control: 'harbordesk-releasereview', investigator: 'harbordesk-investigator' },
  installed: { target: 'inst-target-0001', control: 'inst-control-0002', investigator: 'inst-investigator-0003' },
  subjects: { target: 'subject-target-A', control: 'subject-control-B' },
  triggerDefault: 'target' as Profile,
  triggerId: '33333333-3333-4333-8333-333333333333',
  actingUser: { id: '44444444-4444-4444-8444-444444444444', name: 'trigger-creator' },
  credentialId: '22222222-2222-4222-8222-222222222222',
  operation: 'issues_get',
  ownedRepo: 'acme/harbordesk-synthetic',
  controlMarker: 'CONTROL-MARKER-7f3a9c',
  targetMarker: 'TARGET-MARKER-51d2e8',
};

export interface Scenario {
  /** number of issues_get calls the target agent makes per session */
  targetCalls: number;
  controlCalls: number;
  /** fail GET events/tasks pages with offset > 0 */
  failPageAfterFirst: boolean;
  /** server creates the session but replies only after this many ms */
  launchDelayMs: number;
  /** do not create anything and reply after launchDelayMs (timeout with NO effect) */
  launchNoEffect: boolean;
  /** first N target calls are executed by nested sub-agent B (control agent) inside root A */
  nestedCalls: number;
  conflictingRedelivery: boolean;
  /** security_event details.credentials_id is null */
  missingCredentialsId: boolean;
  /** security_event has no created_at */
  missingClock: boolean;
  /** tool tasks get NO runtime_done event, so tool result content is not inspectable (tasks never carry response_data) */
  omitResponseData: boolean;
  controlWrongContent: boolean;
  targetWrongContent: boolean;
  /** target decision becomes ERROR/CREDENTIAL_UNAVAILABLE when no policy applies */
  credentialError: boolean;
  investigatorMode: 'ok' | 'no_issue' | 'duplicate' | 'no_html_url';
  /** sessions stay non-terminal (RUNNING) */
  keepRunning: boolean;
  /** events 500 without agents:read semantics */
  eventsServerError: boolean;
  hide404: boolean;
}

const defaultScenario = (): Scenario => ({
  targetCalls: 3,
  controlCalls: 2,
  failPageAfterFirst: false,
  launchDelayMs: 0,
  launchNoEffect: false,
  nestedCalls: 0,
  conflictingRedelivery: false,
  missingCredentialsId: false,
  missingClock: false,
  omitResponseData: false,
  controlWrongContent: false,
  targetWrongContent: false,
  credentialError: false,
  investigatorMode: 'ok',
  keepRunning: false,
  eventsServerError: false,
  hide404: false,
});

interface Sess {
  id: string;
  createdAt: string;
  rootTaskId: string;
  status: string;
  /** profile of the agent that actually ran (never reported through session.trigger) */
  profile: Profile;
  input: string;
  tasks: Rec[];
  events: Rec[];
}

export interface MockControl {
  scenario: Scenario;
  setScenario(patch: Partial<Scenario>): void;
  /** Simulates the HUMAN applying a DENY rule in the Guild UI. */
  applyDeny(rule?: { subject?: string; credentialId?: string; operation?: string }): void;
  removeDeny(): void;
  reset(): void;
  readonly inputs: string[];
  readonly sessions: Map<string, Sess>;
  requestLog: Array<{ method: string; path: string; auth: 'trigger' | 'collector' | 'none' | 'bad' }>;
  /** agent_id values of every launch POST, accepted or rejected */
  readonly launchAgentIds: string[];
  postCount(): number;
  tick(ms?: number): void;
}

function ns2text(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  const rem = ns % 1_000_000n;
  const base = new Date(ms).toISOString().replace('Z', '');
  return `${base}${rem.toString().padStart(6, '0')}Z`;
}

export async function startMockGuild(opts: MockOptions = {}): Promise<{ url: string; close: () => Promise<void>; control: MockControl; options: Required<Omit<MockOptions, 'port'>> }> {
  const o = {
    triggerKey: opts.triggerKey ?? MOCK_DEFAULTS.triggerKey,
    collectorKey: opts.collectorKey ?? MOCK_DEFAULTS.collectorKey,
    workspace: opts.workspace ?? MOCK_DEFAULTS.workspace,
    agents: opts.agents ?? MOCK_DEFAULTS.agents,
    agentNames: opts.agentNames ?? MOCK_DEFAULTS.agentNames,
    installed: opts.installed ?? MOCK_DEFAULTS.installed,
    subjects: opts.subjects ?? MOCK_DEFAULTS.subjects,
    triggerDefault: opts.triggerDefault ?? MOCK_DEFAULTS.triggerDefault,
    triggerId: opts.triggerId ?? MOCK_DEFAULTS.triggerId,
    actingUser: opts.actingUser ?? MOCK_DEFAULTS.actingUser,
    credentialId: opts.credentialId ?? MOCK_DEFAULTS.credentialId,
    operation: opts.operation ?? MOCK_DEFAULTS.operation,
    ownedRepo: opts.ownedRepo ?? MOCK_DEFAULTS.ownedRepo,
    controlMarker: opts.controlMarker ?? MOCK_DEFAULTS.controlMarker,
    targetMarker: opts.targetMarker ?? MOCK_DEFAULTS.targetMarker,
  };
  const PROFILES: Profile[] = ['target', 'control', 'investigator'];
  let scenario = defaultScenario();
  let sessions = new Map<string, Sess>();
  let denies: Array<{ subject: string; credentialId: string; operation: string }> = [];
  let inputs: string[] = [];
  let launchAgentIds: string[] = [];
  let counter = 0;
  let clock = BigInt(Date.parse('2026-10-09T12:00:00Z')) * 1_000_000n + 123_456_789n;
  let posts = 0;
  const requestLog: MockControl['requestLog'] = [];
  const nextId = () => `00000000-0000-7000-8000-${(++counter).toString(16).padStart(12, '0')}`;
  const stamp = () => {
    clock += 1_000_037n; // ~1ms + 37ns: sub-millisecond precision is exercised
    return ns2text(clock);
  };

  const ownerUser = { id: '55555555-5555-4555-8555-555555555555', entity_type: 'EntPersonalUser', type: 'user', name: o.workspace.owner, full_name: 'Mock Owner' };
  const actingUserJson = { id: o.actingUser.id, entity_type: 'EntPersonalUser', type: 'user', name: o.actingUser.name, full_name: 'Mock Trigger Creator' };
  const workspaceJson = (): Rec => ({ id: o.workspace.id, entity_type: 'EntWorkspace', name: o.workspace.name, full_name: `${o.workspace.owner}~${o.workspace.name}`, owner: ownerUser });
  const versionOf = (p: Profile) => `ver-${o.agents[p]}`;
  /** EntAgent as embedded in tasks/events/trigger: `id` is the DEFINITION id. */
  const agentJson = (p: Profile): Rec => ({
    id: o.agents[p], entity_type: 'EntAgent', type: 'agent', agent_type: 'GUILD_TYPESCRIPT', status: 'READY',
    name: o.agentNames[p], full_name: `${o.workspace.owner}~${o.agentNames[p]}`, owner: ownerUser,
  });
  const versionJson = (p: Profile): Rec => ({ id: versionOf(p), entity_type: 'EntAgentVersionCommitted', status: 'PUBLISHED', version_number: '1.0.0' });
  /** Launch accepts a definition id or owner~name; anything else (including installed ids) is "not found". */
  const profileForAgentId = (agentId: string): Profile | null =>
    PROFILES.find((p) => agentId === o.agents[p] || agentId === `${o.workspace.owner}~${o.agentNames[p]}`) ?? null;

  const decide = (subject: string): { decision: 'ALLOW' | 'DENY' | 'ERROR'; reason: string } => {
    if (denies.some((d) => d.subject === subject && d.credentialId === o.credentialId && d.operation === o.operation)) return { decision: 'DENY', reason: 'POLICY_DENIED' };
    if (scenario.credentialError && subject === o.subjects.target) return { decision: 'ERROR', reason: 'CREDENTIAL_UNAVAILABLE' };
    return { decision: 'ALLOW', reason: 'ACCESS_ALLOWED' };
  };

  function runAgent(s: Sess, profile: Profile, input: string): void {
    const rootStatus = scenario.keepRunning ? 'RUNNING' : 'DONE';
    // Native agent task: agent{id = definition id}, version{id}, parent_task_id null. No session_id field.
    const root: Rec = {
      id: s.rootTaskId, entity_type: 'EntTaskAgent', created_at: stamp(), updated_at: stamp(), status: rootStatus,
      parent_task_id: null, agent: agentJson(profile), version: versionJson(profile),
    };
    s.tasks.push(root);
    const ev = (type: string, entity: string, task: Rec, extra: Rec): void => {
      const at = stamp();
      s.events.push({ id: nextId(), type, entity_type: entity, created_at: at, updated_at: at, task, ...extra });
    };
    ev('trigger_message', 'EntEventTriggerMessage', root, {
      content: { type: 'text', data: `Triggering agent ${o.workspace.owner}~${o.agentNames[profile]} in trigger ${o.triggerId} from API with the following input:\n\`\`\`json\n${JSON.stringify({ text: input }, null, 2)}\n\`\`\`` },
    });
    ev('runtime_start', 'EntEventRuntimeStart', root, { content: { text: `* The current Guild workspace is named \`${o.workspace.name}\`.\n\n${input}` } });
    ev('agent_console', 'EntEventAgentConsole', root, { level: 'INFO', content: 'noise' });

    /** Native tool task: parent_task{...}, tool_name, http_status_code; the listing carries NO response_data. */
    const toolCall = (parent: Rec, tool: string, args: Rec, httpStatus: number | null): Rec => {
      const t: Rec = {
        id: nextId(), entity_type: 'EntTaskTool', created_at: stamp(), updated_at: stamp(), status: 'DONE',
        parent_task: { id: parent.id, entity_type: parent.entity_type, status: parent.status, parent_task_id: parent.parent_task_id ?? null, agent: parent.agent, version: parent.version },
        tool_call_id: `${tool}-call${counter}`, tool_name: tool, http_status_code: httpStatus, request_bytes: 0, response_bytes: null, token_usage: null,
      };
      s.tasks.push(t);
      ev('runtime_start', 'EntEventRuntimeStart', t, { content: args });
      return t;
    };
    /** Tool result content: the tool task's runtime_done event, content is an object (native: the GitHub issue). */
    const toolDone = (t: Rec, content: Rec): void => {
      if (scenario.omitResponseData) return;
      ev('runtime_done', 'EntEventRuntimeDone', t, { content });
    };
    const security = (t: Rec, actingProfile: Profile, decision: string, reason: string): Rec => {
      const e: Rec = {
        id: nextId(), type: 'security_event', entity_type: 'EntEventSecurity', updated_at: stamp(),
        operation: o.operation, decision, reason_code: reason, capability: null,
        message: decision === 'ALLOW' ? `Access to '${o.operation}' permitted.` : `Access to '${o.operation}' ${decision === 'DENY' ? 'denied' : 'failed'}.`,
        task: t, acting_user: actingUserJson, credentials: null, integration: null,
        details: {
          actor_type: 'HUMAN', agent_id: o.agents[actingProfile], credential_scope: 'Account default',
          credentials_id: scenario.missingCredentialsId ? null : o.credentialId, http_method: 'GET',
          resources: { repos: o.ownedRepo }, run_as_user_id: o.actingUser.id, service_principal_id: o.triggerId,
          session_id: s.id, task_entity_type: 'EntTaskTool', task_status: 'STARTED',
          trigger_entity_type: 'EntWorkspaceTriggerApi', trigger_id: o.triggerId, via: 'rest', workspace_id: o.workspace.id,
        },
      };
      if (!scenario.missingClock) e.created_at = stamp();
      s.events.push(e);
      return e;
    };
    const [repoOwner, repoName] = o.ownedRepo.split('/') as [string, string];
    const finish = (content: Rec): void => ev('runtime_done', 'EntEventRuntimeDone', root, { content });

    if (profile === 'investigator') {
      if (scenario.investigatorMode !== 'no_issue') {
        const n = scenario.investigatorMode === 'duplicate' ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const t = toolCall(root, 'github_issues_create', { owner: repoOwner, repo: repoName, title: 'ScopeWatch incident' }, 201);
          toolDone(t, scenario.investigatorMode === 'no_html_url' ? { number: 7 } : { html_url: `https://github.com/${o.ownedRepo}/issues/${7 + i}`, number: 7 + i });
        }
      }
      // Last runtime_done (highest id) is the root task's: untrusted model narrative.
      finish({ text: 'Filed the incident issue as requested. (untrusted model narrative)' });
      return;
    }
    const isControl = profile === 'control';
    const subject = isControl ? o.subjects.control : o.subjects.target;
    const calls = isControl ? scenario.controlCalls : scenario.targetCalls;
    let nested: Rec | null = null;
    let first: Rec | null = null;
    const read: Rec[] = [];
    const failed: number[] = [];
    for (let i = 0; i < calls; i++) {
      let parent = root;
      let actor = subject;
      let actingProfile: Profile = profile;
      if (!isControl && i < scenario.nestedCalls) {
        if (!nested) {
          // Nested sub-agent shape is NOT covered by the native capture (mock guess): agent task with parent_task_id.
          nested = { id: nextId(), entity_type: 'EntTaskAgent', created_at: stamp(), updated_at: stamp(), status: 'DONE', parent_task_id: root.id, agent: agentJson('control'), version: versionJson('control') };
          s.tasks.push(nested);
        }
        parent = nested;
        actor = o.subjects.control;
        actingProfile = 'control';
      }
      const d = decide(actor);
      const number = i + 1;
      const t = toolCall(parent, `github_${o.operation}`, { issue_number: number, owner: repoOwner, repo: repoName }, d.decision === 'ALLOW' ? 200 : 403);
      const e = security(t, actingProfile, d.decision, d.reason);
      first ??= e;
      if (d.decision === 'ALLOW') {
        const title = isControl ? 'Synthetic control ticket' : `Synthetic ticket ${number}`;
        const body = isControl
          ? (scenario.controlWrongContent ? 'harmless fixture' : `Synthetic fixture ticket.\n\nControl content marker: ${o.controlMarker}`)
          : (scenario.targetWrongContent ? 'harmless fixture' : `Synthetic fixture ticket.\n\nTarget content marker: ${o.targetMarker}`);
        t.response_bytes = body.length;
        toolDone(t, { number, title, body, state: 'open', html_url: `https://github.com/${o.ownedRepo}/issues/${number}`, author_association: 'OWNER' });
        read.push({ number, title });
      } else {
        // Denied/error tool content is a mock guess (not captured natively); it never carries a marker.
        toolDone(t, { error: e.message, status: 403 });
        failed.push(number);
      }
    }
    if (scenario.conflictingRedelivery && first) s.events.push({ ...first, decision: first.decision === 'ALLOW' ? 'DENY' : 'ALLOW', reason_code: 'POLICY_DENIED', updated_at: stamp() });
    finish({ requested: Array.from({ length: calls }, (_, i) => i + 1), read, failed });
  }

  function send(res: ServerResponse, status: number, body: unknown): void {
    const text = JSON.stringify(body);
    res.writeHead(status, { 'content-type': 'application/json', 'x-scopewatch-mock': 'contract-test-mock-not-observed-account' });
    res.end(text);
  }

  async function readBody(req: IncomingMessage): Promise<string> {
    const chunks: Buffer[] = [];
    for await (const c of req) chunks.push(c as Buffer);
    return Buffer.concat(chunks).toString('utf8');
  }

  const authLane = (req: IncomingMessage): 'trigger' | 'collector' | 'none' | 'bad' => {
    const h = req.headers.authorization;
    if (!h) return 'none';
    const m = /^Basic (.+)$/.exec(h);
    if (!m) return 'bad';
    const k = Buffer.from(m[1] as string, 'base64').toString('utf8');
    return k === o.triggerKey ? 'trigger' : k === o.collectorKey ? 'collector' : 'bad';
  };

  const page = (items: Rec[], q: URLSearchParams) => {
    const limit = Math.min(Number(q.get('limit') ?? 20), 1000);
    const offset = Number(q.get('offset') ?? 0);
    const slice = items.slice(offset, offset + limit);
    return { items: slice, pagination: { total_count: items.length, limit, offset, has_more: offset + slice.length < items.length } };
  };

  const server: Server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url ?? '/', 'http://127.0.0.1');
      const path = url.pathname;
      const lane = authLane(req);
      if (path.startsWith('/__mock/')) return await handleControl(req, res, path);
      requestLog.push({ method: req.method ?? '', path: path + url.search, auth: lane });
      if (lane === 'none' || lane === 'bad') return send(res, 401, { error: 'unauthorized' });
      let m: RegExpExecArray | null;
      if (req.method === 'POST' && (m = /^\/v1\/workspaces\/([^/]+)\/([^/]+)\/sessions$/.exec(path))) {
        posts += 1;
        if (lane !== 'trigger') return send(res, 403, { error: 'forbidden', message: 'trigger key required' });
        if (m[1] !== o.workspace.owner || m[2] !== o.workspace.name) return send(res, 404, { error: 'not found' });
        const body = JSON.parse((await readBody(req)) || '{}') as { session_type?: string; agent_id?: string; agent_input?: { text?: string } };
        if (body.session_type !== 'api_trigger') return send(res, 400, { error: 'session_type must be api_trigger' });
        const agentId = typeof body.agent_id === 'string' ? body.agent_id : '';
        launchAgentIds.push(agentId);
        const profile = profileForAgentId(agentId);
        // Native 2026-10-09: an installed (workspace_agent) id is rejected exactly like an unknown id.
        if (!profile) return send(res, 400, { error: 'InvalidInputError', message: `Agent '${agentId}' not found` });
        const text = body.agent_input?.text ?? '';
        inputs.push(text);
        if (scenario.launchNoEffect) {
          await new Promise((r) => setTimeout(r, scenario.launchDelayMs));
          return send(res, 201, { id: 'never-seen' });
        }
        const s: Sess = { id: nextId(), createdAt: stamp(), rootTaskId: nextId(), status: 'DONE', profile, input: text, tasks: [], events: [] };
        runAgent(s, profile, text);
        sessions.set(s.id, s);
        if (scenario.launchDelayMs > 0) await new Promise((r) => setTimeout(r, scenario.launchDelayMs));
        // Native launch response: root_task is DISPATCHED (work happens after the response).
        return send(res, 201, sessionJson(s, 'DISPATCHED'));
      }
      if (lane !== 'collector') return send(res, 403, { error: 'forbidden', message: 'collector key required for reads' });
      if (req.method === 'GET' && (m = /^\/v1\/workspaces\/([^/]+)$/.exec(path))) {
        if (scenario.hide404) return send(res, 404, { error: 'not found' });
        return send(res, 200, { ...workspaceJson(), mock: MOCK_LABEL });
      }
      if (req.method === 'GET' && (m = /^\/v1\/workspaces\/([^/]+)\/sessions$/.exec(path))) {
        if (scenario.hide404) return send(res, 404, { error: 'not found' });
        const items = [...sessions.values()].reverse().map((s) => sessionJson(s));
        return send(res, 200, page(items, url.searchParams));
      }
      if (req.method === 'GET' && (m = /^\/v1\/sessions\/([^/]+)(\/events|\/tasks)?$/.exec(path))) {
        const s = sessions.get(m[1] as string);
        if (!s || scenario.hide404) return send(res, 404, { error: 'not found' });
        if (!m[2]) return send(res, 200, sessionJson(s));
        const offset = Number(url.searchParams.get('offset') ?? 0);
        if (scenario.eventsServerError) return send(res, 500, { error: 'internal' });
        if (scenario.failPageAfterFirst && offset > 0) return send(res, 500, { error: 'internal' });
        if (m[2] === '/tasks') return send(res, 200, page(s.tasks, url.searchParams));
        let evs = [...s.events];
        const types = url.searchParams.get('types');
        if (types) evs = evs.filter((e) => types.split(',').includes(String(e.type)));
        const sort = url.searchParams.get('sort_by');
        evs.sort((a, b) => String(a.id).localeCompare(String(b.id)) * (sort === 'id' ? 1 : -1));
        return send(res, 200, page(evs, url.searchParams));
      }
      return send(res, 404, { error: 'no such mock route' });
    } catch (e) {
      send(res, 500, { error: 'mock failure', message: e instanceof Error ? e.message : String(e) });
    }
  });

  /**
   * Native session shape. trigger.agent / trigger.workspace_agent describe the trigger's configured DEFAULT agent,
   * whatever agent actually ran (observed 2026-10-09); identity must come from the task graph / security events.
   */
  function sessionJson(s: Sess, rootStatusOverride?: string): Rec {
    const dp = o.triggerDefault;
    return {
      id: s.id, entity_type: 'EntSessionTriggerApi', context_id: '66666666-6666-4666-8666-666666666666', created_at: s.createdAt, updated_at: s.createdAt, last_activity_at: s.createdAt,
      interrupted_at: null, interrupted_by: null, session_type: 'api', session_url: `https://app.guild.invalid/sessions/${s.id}`,
      workspace: workspaceJson(),
      trigger: {
        id: o.triggerId, entity_type: 'EntWorkspaceTriggerApi', name: 'scopewatch-api', type: 'api', deactivated_at: null, disabled_reason: null,
        created_at: '2026-10-09T00:00:00.000000Z', updated_at: '2026-10-09T00:00:00.000000Z',
        agent: agentJson(dp), workspace: workspaceJson(),
        workspace_agent: { id: o.installed[dp], entity_type: 'EntWorkspaceAgent', agent: agentJson(dp), agent_version: versionJson(dp), workspace: workspaceJson() },
      },
      root_task: { id: s.rootTaskId, entity_type: 'EntTaskAgent', status: rootStatusOverride ?? (scenario.keepRunning ? 'RUNNING' : 'DONE'), created_at: s.createdAt, updated_at: s.createdAt },
      token_usage: null,
      workspace_url: `https://app.guild.invalid/users/${o.workspace.owner}/workspaces/${o.workspace.name}`,
    };
  }

  async function handleControl(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
    const body = req.method === 'POST' ? (JSON.parse((await readBody(req)) || '{}') as Rec) : {};
    if (path === '/__mock/scenario') { control.setScenario(body as Partial<Scenario>); return send(res, 200, { label: MOCK_LABEL, scenario }); }
    if (path === '/__mock/deny') { control.applyDeny(body as { subject?: string }); return send(res, 200, { label: MOCK_LABEL, denies }); }
    if (path === '/__mock/undeny') { control.removeDeny(); return send(res, 200, { label: MOCK_LABEL, denies }); }
    if (path === '/__mock/reset') { control.reset(); return send(res, 200, { label: MOCK_LABEL }); }
    if (path === '/__mock/state') return send(res, 200, { label: MOCK_LABEL, scenario, denies, sessions: sessions.size, posts });
    send(res, 404, { error: 'no such control route' });
  }

  const control: MockControl = {
    get scenario() { return scenario; },
    setScenario(patch) { scenario = { ...scenario, ...patch }; },
    applyDeny(rule = {}) { denies.push({ subject: rule.subject ?? o.subjects.target, credentialId: rule.credentialId ?? o.credentialId, operation: rule.operation ?? o.operation }); },
    removeDeny() { denies = []; },
    reset() { scenario = defaultScenario(); denies = []; sessions = new Map(); inputs = []; launchAgentIds = []; posts = 0; requestLog.length = 0; },
    get inputs() { return inputs; },
    get sessions() { return sessions; },
    get launchAgentIds() { return launchAgentIds; },
    requestLog,
    postCount: () => posts,
    tick(ms = 1000) { clock += BigInt(ms) * 1_000_000n; },
  } as MockControl;

  await new Promise<void>((resolve) => server.listen(opts.port ?? 0, '127.0.0.1', resolve));
  const addr = server.address() as AddressInfo;
  return {
    url: `http://127.0.0.1:${addr.port}`,
    options: o,
    control,
    close: () => new Promise<void>((resolve) => { server.closeAllConnections(); server.close(() => resolve()); }),
  };
}
