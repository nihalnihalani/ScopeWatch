/**
 * Finite-snapshot collector: exhausts a session's events and tasks using documented
 * offset/limit/has_more/total_count pagination. Failed pages never produce 'complete' coverage.
 * Only `security` events become RawObservations; everything else is counted and ignored.
 */
import type { CollectedSession, RegisteredSession, TaskNode } from '../../shared/ports.js';
import type { CoverageState, Decision, Provenance, RawObservation, SessionCoverage } from '../../shared/contracts.js';
import type { GuildHttp } from './http.js';
import { canonicalJson, isRecord, nowUtcText, parseUtcNano, sha256Hex, str } from './util.js';

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

export function isSecurityEvent(e: unknown): e is Record<string, unknown> {
  return isRecord(e) && typeof e.type === 'string' && e.type.toLowerCase() === 'security';
}

function decisionOf(v: unknown): Decision | null {
  return v === 'ALLOW' || v === 'DENY' || v === 'ERROR' ? v : null;
}

/** Stable native fields only; no page/observation envelope; updated_at is delivery metadata and excluded. */
export function semanticOf(e: Record<string, unknown>): Record<string, unknown> {
  return {
    id: e.id ?? null,
    task_id: e.task_id ?? null,
    credentials_id: e.credentials_id ?? null,
    operation: e.operation ?? null,
    decision: e.decision ?? null,
    reason_code: e.reason_code ?? null,
    capability: e.capability ?? null,
    created_at: e.created_at ?? null,
    acting_user_id: e.acting_user_id ?? null,
    details: e.details ?? null,
  };
}

export function normalizeSecurityEvent(e: Record<string, unknown>, c: NormalizeCtx): RawObservation {
  const eventId = str(e.id);
  const created = parseUtcNano(e.created_at);
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
    nativeTaskId: str(e.task_id),
    credentialId: str(e.credentials_id),
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
    parentTaskId: str(t.parent_task_id),
    kind: isTool ? 'tool' : isAgent ? 'agent' : 'unknown',
    agentRef: isAgent ? agentRefOf(t) : null,
    versionId: isTool ? null : str(t.version_id),
    toolName: str(t.tool_name),
    toolCallId: str(t.tool_call_id),
    status: str(t.status),
    httpStatus: typeof t.http_status_code === 'number' ? t.http_status_code : null,
    responseData: parseResponseData(t.response_data),
    rawJson: canonicalJson(t),
  };
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
  let gaps = 0;
  let ignored = 0;
  ev.pageItems.forEach((items, pi) => {
    const pageRef = ev.pageRefs[pi] as string;
    items.forEach((e, index) => {
      if (!isSecurityEvent(e)) {
        ignored += 1;
        return;
      }
      const o = normalizeSecurityEvent(e, { provenance: p.provenance, generationId, workspaceId: reg.workspaceId, sessionId, pageRef, index, domain, observedAt });
      if (!o.nativeIdentityKey || !o.credentialId || !o.createdAtNs || !o.operation || !o.decision || !o.nativeTaskId) gaps += 1;
      observations.push(o);
    });
  });
  if (ignored > 0) notes.push(`${ignored} non-security events ignored`);

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
