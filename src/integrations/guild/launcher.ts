/**
 * Session launcher. Documented route: POST /v1/workspaces/{owner}/{name}/sessions with
 * {session_type:"api_trigger", agent_input, agent_id}. Authenticated with the TRIGGER key only.
 * agent_id comes ONLY from the server allowlist (config launch agent refs: agent DEFINITION id or
 * owner~name); callers pass a profile name. Installed (workspace_agent) ids are never sent: native
 * rejected one on 2026-10-09 with 400 InvalidInputError "Agent '<id>' not found", a definite failure.
 * A POST is never retried: timeouts and 5xx yield outcome 'unknown' until reconciled.
 *
 * Reconciliation (documented routes only): GET /v1/workspaces/{ws}/sessions (list) then
 * GET /v1/sessions/{id}/events?types=trigger_message to find the idempotency ref that every launch
 * embeds in its input text ("scopewatch-ref: <ref>"). If nothing can be proven, we return null and the
 * launch stays 'unknown'; we never invent a route.
 */
import type { AppConfig } from '../../server/config.js';
import type { LaunchProfile, LaunchReceipt } from '../../shared/ports.js';
import type { Provenance } from '../../shared/contracts.js';
import type { GuildHttp } from './http.js';
import { isRecord, nowUtcText, parseUtcNano, sha256Hex, sleep, str } from './util.js';

const TERMINAL = new Set(['DONE', 'ERROR', 'INTERRUPTED']);
const REF_PREFIX = 'scopewatch-ref: ';

export interface LauncherDeps {
  config: AppConfig;
  provenance: Provenance;
  http: GuildHttp;
  now: () => Date;
  pollMs: number;
}

/** Allowlisted launch agent ref (definition id or owner~name) for a profile: the only value sent as agent_id. */
export function launchAgentFor(config: AppConfig, profile: LaunchProfile): string | null {
  const g = config.guild;
  return profile === 'target' ? g.targetAgentId : profile === 'control' ? g.controlAgentId : g.investigatorAgentId;
}

/** Informational installed-agent id for a profile. Never sent as agent_id and never identity. */
export function installedAgentFor(config: AppConfig, profile: LaunchProfile): string | null {
  const g = config.guild;
  return profile === 'target' ? g.targetInstalledAgentId : profile === 'control' ? g.controlInstalledAgentId : g.investigatorInstalledAgentId;
}

/**
 * Native 400 for an agent_id that is not an agent definition (e.g. an installed id). `detail` is the raw
 * vendor body or the (redacted) HttpResult message that embeds the vendor message.
 */
export function isAgentNotFoundRejection(status: number | null, detail: unknown): boolean {
  if (status !== 400) return false;
  const msg = isRecord(detail) ? str(detail.message) : str(detail);
  return msg !== null && /Agent '[^']*' not found/.test(msg);
}

export class Launcher {
  private readonly receipts = new Map<string, LaunchReceipt>();
  private readonly profiles = new Map<string, LaunchProfile>();
  private readonly sessionOwner = new Map<string, string>();

  constructor(private readonly d: LauncherDeps) {}

  private workspaceRef(): string | null {
    const g = this.d.config.guild;
    return g.workspaceId ?? (g.workspaceName ? g.workspaceName : null);
  }

  private base(profile: LaunchProfile, ref: string, agentRef: string, started: string): LaunchReceipt {
    return {
      launchId: `launch_${sha256Hex(ref).slice(0, 24)}`,
      provenance: this.d.provenance,
      profile,
      requestedInstalledAgentId: installedAgentFor(this.d.config, profile) ?? '',
      requestedAgentRef: agentRef,
      route: 'api_trigger',
      nativeSessionId: null,
      nativeRootTaskId: null,
      workspaceId: null,
      returnedAgentRef: null,
      returnedVersionId: null,
      sessionType: null,
      startedAt: started,
      nativeCreatedAt: null,
      idempotencyRef: ref,
      outcome: 'failed',
      error: null,
    };
  }

  private fromSession(rcpt: LaunchReceipt, s: Record<string, unknown>): LaunchReceipt {
    const ws = isRecord(s.workspace) ? str(s.workspace.id) : null;
    const root = isRecord(s.root_task) ? str(s.root_task.id) : null;
    // Native 2026-10-09: session.trigger.agent / trigger.workspace_agent are the TRIGGER's configured default
    // agent, not the agent that ran (a control session showed TicketAssist there while its root task ran
    // ReleaseReview). Only an agent named on the root task itself is recorded; the launch response's
    // root_task carries none, so these stay null and identity comes from the collected task graph.
    const rootAgent = isRecord(s.root_task) && isRecord(s.root_task.agent) ? s.root_task.agent : null;
    const created = parseUtcNano(s.created_at);
    return {
      ...rcpt,
      nativeSessionId: str(s.id),
      nativeRootTaskId: root,
      workspaceId: ws ?? this.d.config.guild.workspaceId,
      returnedAgentRef: rootAgent ? str(rootAgent.id) : null,
      returnedVersionId: rootAgent ? str(rootAgent.version_id) : null,
      sessionType: str(s.session_type),
      nativeCreatedAt: created?.text ?? null,
      outcome: str(s.id) ? 'created' : 'unknown',
      error: str(s.id) ? null : 'response had no session id',
    };
  }

  async launch(profile: LaunchProfile, agentInput: string, ref: string): Promise<LaunchReceipt> {
    const prior = this.receipts.get(ref);
    if (prior?.outcome === 'created') return prior;
    if (prior?.outcome === 'unknown') {
      const r = await this.reconcileInternal(ref);
      if (r.receipt) return r.receipt;
      if (!r.checked) return { ...prior, error: `${prior.error ?? 'ambiguous'}; reconciliation could not prove absence, not retrying` };
    }
    const g = this.d.config.guild;
    const agentRef = launchAgentFor(this.d.config, profile);
    const ws = this.workspaceRef();
    // Controller clock, captured immediately before the POST (never Guild's clock).
    const rcpt = this.base(profile, ref, agentRef ?? '', nowUtcText(this.d.now));
    if (!agentRef) return this.keep({ ...rcpt, error: `no allowlisted launch agent ref (definition id or owner~name) configured for profile ${profile}` });
    if (!g.workspaceOwner || !g.workspaceName || !g.triggerKey || !ws) return this.keep({ ...rcpt, error: 'trigger launch settings are not configured' });
    this.profiles.set(ref, profile);

    const path = `/workspaces/${encodeURIComponent(g.workspaceOwner)}/${encodeURIComponent(g.workspaceName)}/sessions`;
    const res = await this.d.http.post(path, {
      key: g.triggerKey,
      body: { session_type: 'api_trigger', agent_id: agentRef, agent_input: { text: `${REF_PREFIX}${ref}\n${agentInput}` } },
    });
    if (res.ok && isRecord(res.body)) return this.keep(this.fromSession(rcpt, res.body));
    if (isAgentNotFoundRejection(res.status, res.body) || isAgentNotFoundRejection(res.status, res.message)) {
      return this.keep({ ...rcpt, outcome: 'failed', error: `launch rejected: ${res.message} (agent_id must be the agent DEFINITION id or owner~name, not an installed id)` });
    }
    const ambiguous = res.failure === 'timeout' || res.failure === 'network' || res.failure === 'server_error' || res.failure === 'bad_json' || res.ok;
    return this.keep({ ...rcpt, outcome: ambiguous ? 'unknown' : 'failed', error: res.ok ? 'malformed launch response' : res.message });
  }

  private keep(r: LaunchReceipt): LaunchReceipt {
    this.receipts.set(r.idempotencyRef, r);
    if (r.nativeSessionId && !this.sessionOwner.has(r.nativeSessionId)) this.sessionOwner.set(r.nativeSessionId, r.idempotencyRef);
    return r;
  }

  /** A probe session is fresh only if no other launch reference already produced this session ID. */
  isFreshSession(sessionId: string, ref: string): boolean {
    const owner = this.sessionOwner.get(sessionId);
    return owner === undefined || owner === ref;
  }

  async reconcileLaunch(ref: string): Promise<LaunchReceipt | null> {
    return (await this.reconcileInternal(ref)).receipt;
  }

  private async reconcileInternal(ref: string): Promise<{ receipt: LaunchReceipt | null; checked: boolean }> {
    const known = this.receipts.get(ref);
    if (known?.outcome === 'created') return { receipt: known, checked: true };
    const g = this.d.config.guild;
    const ws = this.workspaceRef();
    if (!ws || !g.collectorKey) return { receipt: null, checked: false };
    const list = await this.d.http.get(`/workspaces/${encodeURIComponent(ws)}/sessions`, { key: g.collectorKey, query: { limit: 50 } });
    if (!list.ok || !isRecord(list.body) || !Array.isArray(list.body.items)) return { receipt: null, checked: false };
    const items = list.body.items.filter(isRecord).slice(0, 50);
    for (const s of items) {
      const sid = str(s.id);
      if (!sid) continue;
      const ev = await this.d.http.get(`/sessions/${encodeURIComponent(sid)}/events`, { key: g.collectorKey, query: { types: 'trigger_message', limit: 20 } });
      if (!ev.ok) return { receipt: null, checked: false };
      if (JSON.stringify(ev.body).includes(`${REF_PREFIX}${ref}`)) {
        const profile = this.profiles.get(ref) ?? known?.profile ?? 'target';
        const agentRef = known?.requestedAgentRef ?? launchAgentFor(this.d.config, profile) ?? '';
        const rcpt = this.fromSession(this.base(profile, ref, agentRef, known?.startedAt ?? nowUtcText(this.d.now)), s);
        return { receipt: this.keep(rcpt), checked: true };
      }
    }
    return { receipt: null, checked: true };
  }

  /** Poll the session until its root task is terminal; null on timeout or when status cannot be read. */
  async awaitCompletion(sessionId: string, timeoutMs: number): Promise<string | null> {
    const key = this.d.config.guild.collectorKey;
    const deadline = Date.now() + timeoutMs;
    for (;;) {
      const r = await this.d.http.get(`/sessions/${encodeURIComponent(sessionId)}`, { key });
      if (r.ok && isRecord(r.body) && isRecord(r.body.root_task)) {
        const st = str(r.body.root_task.status);
        if (st && TERMINAL.has(st)) return st;
      } else if (r.accessProblem) return null;
      if (Date.now() + this.d.pollMs > deadline) return null;
      await sleep(this.d.pollMs);
    }
  }
}
