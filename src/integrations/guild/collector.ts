/**
 * Finite-snapshot collector: exhausts a session's events and tasks using documented
 * offset/limit/has_more/total_count pagination. Failed pages never produce 'complete' coverage.
 * Only `security` events become RawObservations. `runtime_done` events on TOOL tasks carry the native tool
 * result and are attached to that TaskNode's responseData; everything else is counted and ignored.
 */
import type { CollectedSession, RegisteredSession, TaskNode } from '../../shared/ports.js';
import type { CoverageState, Decision, Provenance, RawObservation, SessionCoverage } from '../../shared/contracts.js';
import type { GuildHttp } from './http.js';
import { agree, type Agreed, canonicalJson, isRecord, nowUtcText, parseUtcNano, sha256Hex, str } from './util.js';

export const UNIT_MAPPING_VERSION = 'guild-security-event/v1';
export const PAGE_LIMIT = 1000;
const MAX_PAGES = 200;
const TERMINAL = new Set(['DONE', 'ERROR', 'INTERRUPTED']);

/** 'unverified' keeps the workspace-shaped key but labels the observation so the backend blocks native admission. */
export type IdentityDomain = 'workspace' | 'session' | 'unverified';

/** Canonical JSON tuple per declared identity domain; null if any component is missing. */
export function identityKey(domain: IdentityDomain, workspaceId: string, sessionId: string, eventId: string | null): string | null {
  if (!eventId || !workspaceId) return null;
  if (domain === 'session') return canonicalJson([workspaceId, sessionId, eventId]);
  return canonicalJson([workspaceId, eventId]);
}

export interface NormalizeCtx {
  provenance: Provenance;
  generationId: string;
  workspaceId: string;
  /** Session the page was fetched FOR (never taken from payload). */
  sessionId: string;
  pageRef: string;
  index: number;
  domain: IdentityDomain;
  observedAt: string;
}

/**
 * Native observation 2026-10-09 (account nihal.nihalani): the events endpoint's valid type list names
 * `security_event`; the documented schema said `security`. Both are accepted.
 */
export function isSecurityEvent(e: unknown): e is Record<string, unknown> {
  if (!isRecord(e) || typeof e.type !== 'string') return false;
  const t = e.type.toLowerCase();
  return t === 'security_event' || t === 'security';
}

/** Decision/reference fields that must agree when present both on the envelope and in a nested block. */
const AGREED_FIELDS = ['task_id', 'credentials_id', 'agent_id', 'session_id', 'workspace_id', 'operation', 'decision', 'reason_code', 'capability'] as const;

/**
 * Marker key carrying the fields securityFields() nulled because envelope and nested copies disagreed. It travels
 * with the merged record into semanticJson so binding, re-deriving refs after readback, still sees the conflict
 * (otherwise a nulled envelope field would be silently refilled from `task.id`/`details.*`).
 */
export const FIELD_CONFLICTS_KEY = 'field_conflicts';

function nestedBlock(e: Record<string, unknown>): Record<string, unknown> | null {
  return isRecord(e.security) ? e.security : isRecord(e.content) ? e.content : null;
}

/** Decision/reference fields whose envelope and nested (`security`/`content`) values disagree. */
export function securityFieldConflicts(e: Record<string, unknown>): string[] {
  const nested = nestedBlock(e);
  if (!nested) return [];
  return AGREED_FIELDS.filter((k) => {
    const a = e[k];
    const b = nested[k];
    return a !== undefined && a !== null && b !== undefined && b !== null && canonicalJson(a) !== canonicalJson(b);
  });
}

/**
 * Security fields may be top-level (documented EventSecurity; the only layout observed natively on 2026-10-09)
 * or nested under `security`/`content` (not observed). Nested values are flattened under the envelope; envelope
 * id/type/created_at win. A decision/reference field present in both places with different values is not
 * resolved by precedence: it becomes null (a gap), so a nested copy can neither override nor be overridden.
 */
export function securityFields(e: Record<string, unknown>): Record<string, unknown> {
  const nested = nestedBlock(e);
  if (!nested) return e;
  const merged: Record<string, unknown> = { ...nested, ...Object.fromEntries(Object.entries(e).filter(([k, v]) => v !== undefined && v !== null && k !== 'security' && k !== 'content')) };
  const conflicts = securityFieldConflicts(e);
  for (const k of conflicts) merged[k] = null;
  if (conflicts.length > 0) merged[FIELD_CONFLICTS_KEY] = conflicts;
  return merged;
}

/**
 * Native observation 2026-10-09 (account charliegillet): `runtime_done` events carry a task's result at `content`;
 * for TOOL tasks this is the only place the tool's response appears (the tasks listing has no response_data).
 */
export function isRuntimeDone(e: unknown): e is Record<string, unknown> {
  return isRecord(e) && typeof e.type === 'string' && e.type.toLowerCase() === 'runtime_done';
}

export interface EventRefs {
  taskId: string | null;
  credentialsId: string | null;
  /** Native agent ref the event claims (`details.agent_id` = agent DEFINITION id natively). Corroboration only. */
  agentRef: string | null;
  /** Session the payload names; the fetch session stays authoritative, a mismatch is a conflict. */
  sessionRef: string | null;
  /** Workspace the payload names (`details.workspace_id` natively); a mismatch with the collection workspace is a conflict. */
  workspaceRef: string | null;
  /** Fields whose candidate locations disagree; each such field resolves to null (a gap), never to one side. */
  conflicts: string[];
}

/** Fields already marked as envelope/nested conflicts: computed from a raw nested block or carried by the marker. */
function markedConflicts(e: Record<string, unknown>): string[] {
  const carried = Array.isArray(e[FIELD_CONFLICTS_KEY]) ? (e[FIELD_CONFLICTS_KEY] as unknown[]).filter((k): k is string => typeof k === 'string') : [];
  return [...new Set([...securityFieldConflicts(e), ...carried])];
}

/**
 * Reference fields across the documented (top-level `task_id`/`credentials_id`) and native 2026-10-09 shapes
 * (`task` object; `credentials_id`/`agent_id`/`session_id`/`workspace_id` under `details`). Works on a raw event,
 * on its securityFields() merge or on its semanticOf() projection, so binding can re-derive the refs from
 * persisted semanticJson. A field marked as an envelope/nested conflict stays null even when another location
 * (`task.id`, `details.*`) still carries one of the disagreeing values: the contradiction is never refilled.
 */
export function eventRefs(e: Record<string, unknown>): EventRefs {
  const d = isRecord(e.details) ? e.details : {};
  const marked = markedConflicts(e);
  const fields: Record<string, Agreed> = {
    task_id: agree(e.task_id, isRecord(e.task) ? e.task.id : null, d.task_id),
    credentials_id: agree(e.credentials_id, d.credentials_id),
    agent_id: agree(e.agent_id, d.agent_id),
    session_id: agree(e.session_id, d.session_id),
    workspace_id: agree(e.workspace_id, d.workspace_id),
  };
  for (const k of marked) if (k in fields) fields[k] = { value: null, conflict: true };
  const conflicts = Object.entries(fields).filter(([, a]) => a.conflict).map(([k]) => k);
  return {
    taskId: fields.task_id!.value,
    credentialsId: fields.credentials_id!.value,
    agentRef: fields.agent_id!.value,
    sessionRef: fields.session_id!.value,
    workspaceRef: fields.workspace_id!.value,
    conflicts: [...new Set([...conflicts, ...marked])],
  };
}

function decisionOf(v: unknown): Decision | null {
  return v === 'ALLOW' || v === 'DENY' || v === 'ERROR' ? v : null;
}

/**
 * Stable native fields only; no page/observation envelope; updated_at is delivery metadata and excluded.
 * Raw locations are kept side by side (not pre-resolved) so a top-level/nested disagreement stays visible;
 * keys absent from the payload are dropped by canonicalJson, keeping documented-shape semanticJson unchanged.
 * `acting_user` is recorded by id only (natively the trigger creator) and is never authority.
 */
export function semanticOf(e: Record<string, unknown>): Record<string, unknown> {
  return {
    id: e.id ?? null,
    task_id: e.task_id ?? null,
    task: isRecord(e.task) ? { id: e.task.id ?? null } : undefined,
    credentials_id: e.credentials_id ?? null,
    agent_id: e.agent_id ?? undefined,
    session_id: e.session_id ?? undefined,
    workspace_id: e.workspace_id ?? undefined,
    operation: e.operation ?? null,
    decision: e.decision ?? null,
    reason_code: e.reason_code ?? null,
    capability: e.capability ?? null,
    created_at: e.created_at ?? null,
    acting_user_id: e.acting_user_id ?? null,
    acting_user: isRecord(e.acting_user) ? { id: e.acting_user.id ?? null } : undefined,
    details: e.details ?? null,
    [FIELD_CONFLICTS_KEY]: e[FIELD_CONFLICTS_KEY] ?? undefined,
  };
}

export function normalizeSecurityEvent(envelope: Record<string, unknown>, c: NormalizeCtx): RawObservation {
  const e = securityFields(envelope);
  const eventId = str(e.id);
  const created = parseUtcNano(e.created_at);
  const refs = eventRefs(e);
  const semanticJson = canonicalJson(semanticOf(e));
  return {
    observationId: `obs_${sha256Hex(`${c.generationId}|${c.pageRef}|${c.index}|${eventId ?? 'noid'}`).slice(0, 32)}`,
    provenance: c.provenance,
    generationId: c.generationId,
    fetchRecordId: `fr_${sha256Hex(`${c.pageRef}|${c.index}`).slice(0, 32)}`,
    pageRef: c.pageRef,
    nativeIdentityKey: identityKey(c.domain, c.workspaceId, c.sessionId, eventId),
    identityDomain: c.domain,
    workspaceId: c.workspaceId,
    sessionId: c.sessionId,
    nativeEventId: eventId,
    nativeTaskId: refs.taskId,
    credentialId: refs.credentialsId,
    operation: str(e.operation),
    decision: decisionOf(e.decision),
    reasonCode: str(e.reason_code),
    createdAtRaw: typeof e.created_at === 'string' ? e.created_at : null,
    createdAt: created?.text ?? null,
    createdAtNs: created?.ns ?? null,
    unitMappingVersion: UNIT_MAPPING_VERSION,
    semanticJson,
    observedAt: c.observedAt,
    contentSha256: sha256Hex(canonicalJson(e)),
  };
}

function parseResponseData(v: unknown): unknown {
  if (typeof v !== 'string') return v ?? null;
  try {
    return JSON.parse(v);
  } catch {
    return v;
  }
}

/** Agent ref candidates; the schema leaves the expanded `agent` object undocumented, so all are tried in order. */
function agentRefOf(t: Record<string, unknown>): string | null {
  const a = t.agent;
  if (isRecord(a)) {
    const id = str(a.id) ?? str(a.agent_id) ?? str(a.workspace_agent_id);
    if (id) return id;
  }
  return str(t.agent_id) ?? str(t.workspace_agent_id);
}

export function normalizeTask(t: Record<string, unknown>, sessionId: string): TaskNode | null {
  const id = str(t.id);
  if (!id) return null;
  const isTool = typeof t.tool_name === 'string' || (typeof t.entity_type === 'string' && /Tool/i.test(t.entity_type));
  // Native gate: a node is an AGENT task only when entity_type says so. Presence of `agent`, `version_id`
  // or a null parent is not enough; without entity_type the node stays 'unknown' and binding is unresolved.
  const isAgent = !isTool && typeof t.entity_type === 'string' && /Agent/i.test(t.entity_type);
  return {
    taskId: id,
    sessionId: str(t.session_id) ?? sessionId,
    // Native observation: tool tasks carry `parent_task` (object), agent tasks `parent_task_id`.
    parentTaskId: str(t.parent_task_id) ?? (isRecord(t.parent_task) ? str(t.parent_task.id) : null),
    kind: isTool ? 'tool' : isAgent ? 'agent' : 'unknown',
    agentRef: isAgent ? agentRefOf(t) : null,
    // Native observation: agent tasks carry `version` (object with id), not `version_id`.
    versionId: isTool ? null : str(t.version_id) ?? (isRecord(t.version) ? str(t.version.id) : null),
    toolName: str(t.tool_name),
    toolCallId: str(t.tool_call_id),
    status: str(t.status),
    httpStatus: typeof t.http_status_code === 'number' ? t.http_status_code : null,
    responseData: parseResponseData(t.response_data),
    rawJson: canonicalJson(t),
  };
}

interface RuntimeResult {
  eventId: string | null;
  taskId: string | null;
  content: unknown;
}

/**
 * Attaches `runtime_done` content to TOOL task nodes whose native response_data is absent (native response_data,
 * if ever present, wins). One result -> its content as-is (object; `content.body` stays reachable for marker
 * inspection). Several distinct results for one tool task -> array of contents in ascending event-id order
 * (UUIDv7 time order), all kept. Identical redeliveries collapse; one event id delivered with different content
 * is contradictory, so nothing is attached for that task (no data rather than a possibly wrong marker match).
 * runtime_done on agent tasks (turn summaries) or unlisted tasks is counted, never attached.
 */
function attachRuntimeResults(tasks: TaskNode[], results: RuntimeResult[]): string[] {
  const notes: string[] = [];
  const byTask = new Map<string, Map<string, unknown>>();
  const contradicted = new Set<string>();
  let unattached = 0;
  let attachedEvents = 0;
  const toolIds = new Set(tasks.filter((t) => t.kind === 'tool').map((t) => t.taskId));
  for (const r of results) {
    if (!r.taskId || !r.eventId || r.content === undefined || r.content === null || !toolIds.has(r.taskId)) {
      unattached += 1;
      continue;
    }
    const m = byTask.get(r.taskId) ?? new Map<string, unknown>();
    const prev = m.get(r.eventId);
    if (prev !== undefined && canonicalJson(prev) !== canonicalJson(r.content)) contradicted.add(r.taskId);
    m.set(r.eventId, r.content);
    byTask.set(r.taskId, m);
  }
  for (let i = 0; i < tasks.length; i++) {
    const t = tasks[i] as TaskNode;
    const m = byTask.get(t.taskId);
    if (!m || t.responseData !== null) continue;
    if (contradicted.has(t.taskId)) {
      notes.push(`runtime_done for tool task ${t.taskId} redelivered with conflicting content; result not attached`);
      continue;
    }
    const ordered = [...m.entries()].sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)).map(([, c]) => parseResponseData(c));
    tasks[i] = { ...t, responseData: ordered.length === 1 ? ordered[0] : ordered };
    attachedEvents += ordered.length;
  }
  if (attachedEvents > 0) notes.push(`${attachedEvents} runtime_done results attached to tool tasks`);
  if (unattached > 0) notes.push(`${unattached} runtime_done events not attached (agent-task turn results or no listed tool task)`);
  return notes;
}

interface Exhausted {
  items: Array<Record<string, unknown>>;
  pageRefs: string[];
  expectedPages: number;
  fetchedPages: number;
  totalCount: number | null;
  errors: string[];
  ok: boolean;
  pageItems: Array<Array<Record<string, unknown>>>;
}

async function exhaust(http: GuildHttp, key: string | null, kind: 'events' | 'tasks', sessionId: string, pageLimit: number): Promise<Exhausted> {
  const out: Exhausted = { items: [], pageRefs: [], expectedPages: 0, fetchedPages: 0, totalCount: null, errors: [], ok: true, pageItems: [] };
  let offset = 0;
  for (let page = 0; page < MAX_PAGES; page++) {
    const pageRef = `${kind}:${sessionId}:offset=${offset}:limit=${pageLimit}`;
    const query: Record<string, string | number> = { limit: pageLimit, offset };
    if (kind === 'events') query.sort_by = 'id'; // ascending (UUIDv7 time order); default is newest-first
    const r = await http.get(`/sessions/${encodeURIComponent(sessionId)}/${kind}`, { key, query });
    if (!r.ok || !isRecord(r.body) || !Array.isArray(r.body.items)) {
      out.ok = false;
      out.errors.push(`${pageRef}: ${r.ok ? 'malformed page (no items array)' : r.message}`);
      return out;
    }
    const items = r.body.items.filter(isRecord);
    out.items.push(...items);
    out.pageItems.push(items);
    out.pageRefs.push(pageRef);
    out.fetchedPages += 1;
    const pg = isRecord(r.body.pagination) ? r.body.pagination : {};
    if (typeof pg.total_count === 'number') {
      out.totalCount = pg.total_count;
      out.expectedPages = Math.max(1, Math.ceil(pg.total_count / pageLimit));
    } else {
      out.expectedPages = Math.max(out.expectedPages, out.fetchedPages);
    }
    if (pg.has_more !== true) {
      if (out.totalCount !== null && out.items.length !== out.totalCount) {
        out.ok = false;
        out.errors.push(`${kind}: fetched ${out.items.length} of total_count ${out.totalCount}`);
      }
      return out;
    }
    if (items.length === 0) {
      out.ok = false;
      out.errors.push(`${pageRef}: has_more true but empty page`);
      return out;
    }
    offset += items.length;
    out.expectedPages = Math.max(out.expectedPages, out.fetchedPages + 1);
  }
  out.ok = false;
  out.errors.push(`${kind}: exceeded ${MAX_PAGES} pages`);
  return out;
}

export interface CollectParams {
  http: GuildHttp;
  key: string | null;
  provenance: Provenance;
  domain?: IdentityDomain;
  pageLimit?: number;
  now?: () => Date;
}

export async function collectSessionSnapshot(p: CollectParams, reg: RegisteredSession, generationId: string): Promise<CollectedSession> {
  const domain = p.domain ?? 'workspace';
  const limit = p.pageLimit ?? PAGE_LIMIT;
  const observedAt = nowUtcText(p.now);
  const sessionId = reg.sessionId;
  const notes: string[] = [];

  const sess = await p.http.get(`/sessions/${encodeURIComponent(sessionId)}`, { key: p.key });
  let sessionStatus: string | null = null;
  if (sess.ok && isRecord(sess.body) && isRecord(sess.body.root_task)) sessionStatus = str(sess.body.root_task.status);
  if (!sess.ok) notes.push(`session read failed: ${sess.message}`);

  const [ev, tk] = [await exhaust(p.http, p.key, 'events', sessionId, limit), await exhaust(p.http, p.key, 'tasks', sessionId, limit)];

  const tasks: TaskNode[] = [];
  for (const raw of tk.items) {
    const n = normalizeTask(raw, sessionId);
    if (n) tasks.push(n);
    else notes.push('task without id ignored');
  }
  if (sessionStatus === null) {
    const root = tasks.find((t) => t.kind === 'agent' && t.parentTaskId === null);
    sessionStatus = root?.status ?? null;
  }

  const observations: RawObservation[] = [];
  const results: RuntimeResult[] = [];
  let gaps = 0;
  let ignored = 0;
  ev.pageItems.forEach((items, pi) => {
    const pageRef = ev.pageRefs[pi] as string;
    items.forEach((e, index) => {
      if (isRuntimeDone(e)) {
        results.push({ eventId: str(e.id), taskId: agree(e.task_id, isRecord(e.task) ? e.task.id : null).value, content: e.content });
        return;
      }
      if (!isSecurityEvent(e)) {
        ignored += 1;
        return;
      }
      const o = normalizeSecurityEvent(e, { provenance: p.provenance, generationId, workspaceId: reg.workspaceId, sessionId, pageRef, index, domain, observedAt });
      // Any location conflict is a required-field gap, even on a field (agent/session/workspace) that is not itself required.
      const conflicts = eventRefs(securityFields(e)).conflicts;
      if (!o.nativeIdentityKey || !o.credentialId || !o.createdAtNs || !o.operation || !o.decision || !o.nativeTaskId || conflicts.length > 0) gaps += 1;
      if (conflicts.length > 0) notes.push(`security event ${o.nativeEventId ?? 'noid'}: ${conflicts.join(', ')} disagree across top-level/nested locations (gap)`);
      observations.push(o);
    });
  });
  notes.push(...attachRuntimeResults(tasks, results));
  if (ignored > 0) notes.push(`${ignored} other non-security events ignored`);

  const errors = [...ev.errors, ...tk.errors];
  const fetchedAny = ev.fetchedPages + tk.fetchedPages > 0;
  let coverageState: CoverageState;
  if (errors.length > 0) coverageState = fetchedAny && ev.fetchedPages > 0 && tk.fetchedPages > 0 ? 'incomplete' : 'failed';
  else if (sessionStatus === null) {
    coverageState = 'incomplete';
    notes.push('session completion state unknown');
  } else if (!TERMINAL.has(sessionStatus)) {
    coverageState = 'open';
    notes.push(`session not terminal (${sessionStatus}); events persist when a turn completes`);
  } else coverageState = 'complete';

  const coverage: SessionCoverage = {
    generationId,
    workspaceId: reg.workspaceId,
    sessionId,
    launchSubjectId: reg.expectedPolicySubjectId,
    coverageState,
    expectedPages: ev.expectedPages + tk.expectedPages,
    fetchedPages: ev.fetchedPages + tk.fetchedPages,
    rawRecords: observations.length,
    requiredFieldGaps: gaps,
    completionRef: `session:${sessionId}:status=${sessionStatus ?? 'unknown'}`,
    notes: [...notes, ...errors],
  };

  return {
    provenance: p.provenance,
    workspaceId: reg.workspaceId,
    sessionId,
    sessionStatus,
    complete: coverageState === 'complete',
    observations,
    tasks,
    coverage,
    pageRefs: [...ev.pageRefs, ...tk.pageRefs],
    errors,
  };
}
