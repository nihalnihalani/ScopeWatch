/**
 * Guild adapter entry point. `createGuildPort(config)` returns null for replay mode (no Guild access);
 * native and contract_test build the real adapter (contract_test is pointed at a loopback mock by config).
 */
import type { AppConfig } from '../../server/config.js';
import type {
  BindingInput,
  BindingResult,
  CollectedSession,
  GuildPort,
  InvestigationContext,
  LaunchProfile,
  LaunchReceipt,
  ProbeRequest,
  RegisteredSession,
} from '../../shared/ports.js';
import type { InvestigationReceipt, ProbeResult, Provenance } from '../../shared/contracts.js';
import { bindEvents } from './binding.js';
import { collectSessionSnapshot, type IdentityDomain } from './collector.js';
import type { AdapterContext } from './context.js';
import { GuildHttp } from './http.js';
import { runInvestigation } from './investigator.js';
import { Launcher } from './launcher.js';
import { makeRedactor } from './util.js';
import { runProbe } from './verifier.js';

export interface GuildAdapterOptions {
  fetchImpl?: typeof fetch;
  now?: () => Date;
  pollMs?: number;
  completionTimeoutMs?: number;
  requestTimeoutMs?: number;
  getRetries?: number;
  backoffMs?: number;
  pageLimit?: number;
  identityDomain?: IdentityDomain;
  probeTicketNumber?: number;
}

export function missingSettings(config: AppConfig): string[] {
  const g = config.guild;
  const checks: Array<[unknown, string]> = [
    [g.triggerKey, 'GUILD_TRIGGER_ID/GUILD_TRIGGER_SECRET'],
    [g.collectorKey, 'GUILD_COLLECTOR_KEY_ID/GUILD_COLLECTOR_KEY_SECRET'],
    [g.workspaceId, 'GUILD_WORKSPACE_ID'],
    [g.workspaceOwner, 'GUILD_WORKSPACE_OWNER'],
    [g.workspaceName, 'GUILD_WORKSPACE_NAME'],
    [g.targetAgentId, 'GUILD_TARGET_AGENT_ID'],
    [g.controlAgentId, 'GUILD_CONTROL_AGENT_ID'],
    [g.investigatorAgentId, 'GUILD_INVESTIGATOR_AGENT_ID'],
    [g.verifiedTargetPolicySubjectId, 'GUILD_VERIFIED_TARGET_POLICY_SUBJECT_ID'],
    [g.verifiedControlPolicySubjectId, 'GUILD_VERIFIED_CONTROL_POLICY_SUBJECT_ID'],
    [g.verifiedCredentialId, 'GUILD_VERIFIED_CREDENTIAL_ID'],
    [g.verifiedOperation, 'GUILD_VERIFIED_OPERATION'],
  ];
  return checks.filter(([v]) => !v).map(([, n]) => n);
}

export class GuildAdapter implements GuildPort {
  readonly provenance: Provenance;
  private readonly http: GuildHttp;
  private readonly launcher: Launcher;
  private readonly ctx: AdapterContext;
  private readonly o: GuildAdapterOptions;

  constructor(private readonly config: AppConfig, o: GuildAdapterOptions = {}) {
    this.o = o;
    this.provenance = config.mode === 'native' ? 'native' : 'contract_test';
    const g = config.guild;
    this.http = new GuildHttp({
      baseUrl: g.baseUrl,
      timeoutMs: o.requestTimeoutMs,
      getRetries: o.getRetries,
      backoffMs: o.backoffMs,
      secrets: [g.triggerKey, g.collectorKey, g.controlExpectedMarker],
      fetchImpl: o.fetchImpl,
    });
    const now = o.now ?? (() => new Date());
    this.launcher = new Launcher({ config, provenance: this.provenance, http: this.http, now, pollMs: o.pollMs ?? 1500 });
    this.ctx = {
      config,
      provenance: this.provenance,
      http: this.http,
      launcher: this.launcher,
      now,
      collect: (reg, gen) => this.collectSession(reg, gen),
      completionTimeoutMs: o.completionTimeoutMs ?? 180_000,
    };
  }

  async health(): Promise<{ ok: boolean; detail: string; missing: string[] }> {
    const missing = missingSettings(this.config);
    if (missing.length > 0) return { ok: false, detail: `not configured: ${missing.length} setting(s) missing`, missing };
    const g = this.config.guild;
    const r = await this.http.get(`/workspaces/${encodeURIComponent(g.workspaceId as string)}`, { key: g.collectorKey, timeoutMs: 5000 });
    if (!r.ok) return { ok: false, detail: `workspace read failed: ${r.message}`, missing: [] };
    return { ok: true, detail: `workspace readable via collector key (${this.provenance})`, missing: [] };
  }

  launch(profile: LaunchProfile, agentInput: string, idempotencyRef: string): Promise<LaunchReceipt> {
    return this.launcher.launch(profile, agentInput, idempotencyRef);
  }

  awaitCompletion(sessionId: string, timeoutMs: number): Promise<string | null> {
    return this.launcher.awaitCompletion(sessionId, timeoutMs);
  }

  collectSession(reg: RegisteredSession, generationId: string): Promise<CollectedSession> {
    return collectSessionSnapshot(
      { http: this.http, key: this.config.guild.collectorKey, provenance: this.provenance, domain: this.o.identityDomain ?? this.config.guild.identityDomain, pageLimit: this.o.pageLimit, now: this.o.now },
      reg,
      generationId,
    );
  }

  bindEvents(input: BindingInput): BindingResult {
    return bindEvents({ ...input, subjectDomainMap: { ...(this.config.guild.agentSubjectMap ?? {}), ...input.subjectDomainMap } });
  }

  runInvestigation(ctx: InvestigationContext): Promise<InvestigationReceipt> {
    return runInvestigation(this.ctx, ctx);
  }

  runProbe(req: ProbeRequest): Promise<ProbeResult> {
    return runProbe(this.ctx, req, { ticketNumber: this.o.probeTicketNumber ?? this.config.guild.probeTicketNumber ?? 1 });
  }

  reconcileLaunch(idempotencyRef: string): Promise<LaunchReceipt | null> {
    return this.launcher.reconcileLaunch(idempotencyRef);
  }
}

export function createGuildPort(config: AppConfig, o: GuildAdapterOptions = {}): GuildPort | null {
  if (config.mode === 'replay') return null;
  return new GuildAdapter(config, o);
}

export { bindEvents } from './binding.js';
export { makeRedactor };
