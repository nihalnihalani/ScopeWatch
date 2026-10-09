/**
 * CONTRACT-TEST MOCK Guild API. Built from the DOCUMENTED public schema (references/architecture-guild),
 * NOT from observed account behavior. Loopback only. Never imported from src/**.
 * Every response carries `x-scopewatch-mock: contract-test-mock-not-observed-account`.
 *
 * Scenario control lives under /__mock/* (and the returned `control` object). The "apply DENY policy"
 * control simulates a HUMAN applying a policy in the Guild UI; the application never calls it.
 */
import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';

export const MOCK_LABEL = 'CONTRACT-TEST MOCK built from documented schema, not observed account';

export interface MockOptions {
  port?: number;
  triggerKey?: string;
  collectorKey?: string;
  workspace?: { id: string; owner: string; name: string };
  /** installed agent ids (what the task graph reports as agent ref) */
  installed?: { target: string; control: string; investigator: string };
  /** policy subject for each installed agent (a DIFFERENT id domain on purpose) */
  subjects?: { target: string; control: string };
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
  installed: { target: 'inst-target-0001', control: 'inst-control-0002', investigator: 'inst-investigator-0003' },
  subjects: { target: 'subject-target-A', control: 'subject-control-B' },
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
  missingCredentialsId: boolean;
  missingClock: boolean;
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
  installed: string;
  input: string;
  tasks: Array<Record<string, unknown>>;
  events: Array<Record<string, unknown>>;
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
    installed: opts.installed ?? MOCK_DEFAULTS.installed,
    subjects: opts.subjects ?? MOCK_DEFAULTS.subjects,
    credentialId: opts.credentialId ?? MOCK_DEFAULTS.credentialId,
    operation: opts.operation ?? MOCK_DEFAULTS.operation,
    ownedRepo: opts.ownedRepo ?? MOCK_DEFAULTS.ownedRepo,
    controlMarker: opts.controlMarker ?? MOCK_DEFAULTS.controlMarker,
    targetMarker: opts.targetMarker ?? MOCK_DEFAULTS.targetMarker,
  };
  let scenario = defaultScenario();
  let sessions = new Map<string, Sess>();
  let denies: Array<{ subject: string; credentialId: string; operation: string }> = [];
  let inputs: string[] = [];
  let counter = 0;
  let clock = BigInt(Date.parse('2026-10-09T12:00:00Z')) * 1_000_000n + 123_456_789n;
  let posts = 0;
  const requestLog: MockControl['requestLog'] = [];
  const nextId = () => `00000000-0000-7000-8000-${(++counter).toString(16).padStart(12, '0')}`;
  const stamp = () => {
    clock += 1_000_037n; // ~1ms + 37ns: sub-millisecond precision is exercised
    return ns2text(clock);
  };

  const decide = (subject: string): { decision: 'ALLOW' | 'DENY' | 'ERROR'; reason: string } => {
    if (denies.some((d) => d.subject === subject && d.credentialId === o.credentialId && d.operation === o.operation)) return { decision: 'DENY', reason: 'POLICY_DENIED' };
    if (scenario.credentialError && subject === o.subjects.target) return { decision: 'ERROR', reason: 'CREDENTIAL_UNAVAILABLE' };
    return { decision: 'ALLOW', reason: 'ACCESS_ALLOWED' };
  };

  function runAgent(s: Sess, installed: string, input: string): void {
    const root = {
      id: s.rootTaskId, entity_type: 'EntTaskAgent', created_at: stamp(), updated_at: stamp(), session_id: s.id,
      status: scenario.keepRunning ? 'RUNNING' : 'DONE', parent_task_id: null, version_id: `ver-${installed}`, agent: { id: installed, name: 'display-name-is-not-authority' },
    };
    s.tasks.push(root);
    s.events.push({ id: nextId(), type: 'trigger_message', created_at: stamp(), updated_at: stamp(), task_id: root.id, content: { text: input } });
    s.events.push({ id: nextId(), type: 'container_log', created_at: stamp(), updated_at: stamp(), task_id: root.id, message: 'noise', timestamp: stamp() });
    const toolCall = (parentId: string, subject: string, tool: string, content: Record<string, unknown>, status: 'ok' | 'deny'): string => {
      const t = {
        id: nextId(), entity_type: 'EntTaskTool', created_at: stamp(), updated_at: stamp(), parent_task_id: parentId, session_id: s.id,
        status: 'DONE', tool_call_id: `call_${counter}`, tool_name: tool, http_status_code: status === 'ok' ? 200 : 403,
        response_data: scenario.omitResponseData ? null : JSON.stringify(status === 'ok' ? content : { error: 'denied' }),
      };
      s.tasks.push(t);
      return t.id;
    };
    const security = (taskId: string, decision: string, reason: string): Record<string, unknown> => {
      const ev: Record<string, unknown> = {
        id: nextId(), type: 'security', updated_at: stamp(), task_id: taskId, decision, operation: o.operation, reason_code: reason,
        capability: 'read', acting_user_id: null, details: { note: 'mock', agent_label: 'spoofed-label-in-payload' },
        credentials_id: scenario.missingCredentialsId ? null : o.credentialId,
      };
      if (!scenario.missingClock) ev.created_at = stamp();
      s.events.push(ev);
      return ev;
    };
    if (installed === o.installed.investigator) {
      if (scenario.investigatorMode !== 'no_issue') {
        const n = scenario.investigatorMode === 'duplicate' ? 2 : 1;
        for (let i = 0; i < n; i++) {
          toolCall(root.id, 'inv', 'issues_create', scenario.investigatorMode === 'no_html_url' ? { number: 7 } : { html_url: `https://github.com/${o.ownedRepo}/issues/${7 + i}`, number: 7 + i }, 'ok');
        }
      }
      s.events.push({ id: nextId(), type: 'runtime_done', created_at: stamp(), updated_at: stamp(), task_id: root.id, content: { text: 'Filed the incident issue as requested. (untrusted model narrative)' } });
      return;
    }
    const isControl = installed === o.installed.control;
    const subject = isControl ? o.subjects.control : o.subjects.target;
    const calls = isControl ? scenario.controlCalls : scenario.targetCalls;
    let nested: string | null = null;
    let first: Record<string, unknown> | null = null;
    for (let i = 0; i < calls; i++) {
      let parent = root.id;
      let actor = subject;
      if (!isControl && i < scenario.nestedCalls) {
        if (!nested) {
          nested = nextId();
          s.tasks.push({ id: nested, entity_type: 'EntTaskAgent', created_at: stamp(), updated_at: stamp(), session_id: s.id, status: 'DONE', parent_task_id: root.id, version_id: `ver-${o.installed.control}`, agent: { id: o.installed.control } });
        }
        parent = nested;
        actor = o.subjects.control;
      }
      const d = decide(actor);
      const content = isControl && !scenario.controlWrongContent ? { title: 'Synthetic control ticket', body: `fixture ${o.controlMarker}` } : { title: `Synthetic ticket ${i + 1}`, body: scenario.targetWrongContent ? 'harmless fixture' : `fixture ${o.targetMarker}` };
      const tid = toolCall(parent, actor, o.operation, content, d.decision === 'ALLOW' ? 'ok' : 'deny');
      const ev = security(tid, d.decision, d.reason);
      first ??= ev;
    }
    if (scenario.conflictingRedelivery && first) s.events.push({ ...first, decision: first.decision === 'ALLOW' ? 'DENY' : 'ALLOW', reason_code: 'POLICY_DENIED', updated_at: stamp() });
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

  const page = (items: Array<Record<string, unknown>>, q: URLSearchParams) => {
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
        const agentId = body.agent_id;
        if (!agentId || !Object.values(o.installed).includes(agentId)) return send(res, 400, { error: 'unknown agent_id' });
        const text = body.agent_input?.text ?? '';
        inputs.push(text);
        if (scenario.launchNoEffect) {
          await new Promise((r) => setTimeout(r, scenario.launchDelayMs));
          return send(res, 201, { id: 'never-seen' });
        }
        const s: Sess = { id: nextId(), createdAt: stamp(), rootTaskId: nextId(), status: 'DONE', installed: agentId, input: text, tasks: [], events: [] };
        runAgent(s, agentId, text);
        sessions.set(s.id, s);
        if (scenario.launchDelayMs > 0) await new Promise((r) => setTimeout(r, scenario.launchDelayMs));
        return send(res, 201, sessionJson(s));
      }
      if (lane !== 'collector') return send(res, 403, { error: 'forbidden', message: 'collector key required for reads' });
      if (req.method === 'GET' && (m = /^\/v1\/workspaces\/([^/]+)$/.exec(path))) {
        if (scenario.hide404) return send(res, 404, { error: 'not found' });
        return send(res, 200, { id: o.workspace.id, name: o.workspace.name, mock: MOCK_LABEL });
      }
      if (req.method === 'GET' && (m = /^\/v1\/workspaces\/([^/]+)\/sessions$/.exec(path))) {
        if (scenario.hide404) return send(res, 404, { error: 'not found' });
        const items = [...sessions.values()].reverse().map(sessionJson);
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

  function sessionJson(s: Sess): Record<string, unknown> {
    return {
      id: s.id, entity_type: 'EntSessionTriggerApi', created_at: s.createdAt, updated_at: s.createdAt, session_type: 'api',
      workspace: { id: o.workspace.id, name: o.workspace.name, full_name: `${o.workspace.owner}/${o.workspace.name}` },
      trigger: { id: 'trig-1', type: 'api', agent: { id: s.installed, version_id: `ver-${s.installed}` } },
      root_task: { id: s.rootTaskId, entity_type: 'EntTaskAgent', status: scenario.keepRunning ? 'RUNNING' : 'DONE' },
      token_usage: null,
    };
  }

  async function handleControl(req: IncomingMessage, res: ServerResponse, path: string): Promise<void> {
    const body = req.method === 'POST' ? (JSON.parse((await readBody(req)) || '{}') as Record<string, unknown>) : {};
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
    reset() { scenario = defaultScenario(); denies = []; sessions = new Map(); inputs = []; posts = 0; requestLog.length = 0; },
    get inputs() { return inputs; },
    get sessions() { return sessions; },
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
