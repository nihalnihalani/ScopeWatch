/**
 * Lead-owned integration ports. The backend (src/server/services, src/core) depends ONLY on these
 * interfaces; the native engineer implements GuildPort in src/integrations/guild. The mock Guild API
 * for contract tests lives in tests/support/mock-guild and is never importable from src/**.
 */
import type {
  BindingState,
  Decision,
  EventBinding,
  InvestigationReceipt,
  ProbeResult,
  Provenance,
  ProposedScope,
  RawObservation,
  SessionCoverage,
  UtcNanoText,
} from './contracts.js';

export type LaunchProfile = 'target' | 'control' | 'investigator';

export interface LaunchReceipt {
  launchId: string;
  provenance: Provenance;
  profile: LaunchProfile;
  /**
   * Configured workspace installed-agent id for the profile, informational only ('' when not configured).
   * Never sent as agent_id and never binding authority.
   */
  requestedInstalledAgentId: string;
  /**
   * The allowlisted launch agent ref actually sent as agent_id (definition id or owner~name). Intent only,
   * never binding authority: identity comes from the root agent task and security events. '' when no
   * launch ref is configured for the profile (the launch then fails without a network call).
   */
  requestedAgentRef: string;
  route: 'api_trigger' | 'chat';
  nativeSessionId: string | null;
  nativeRootTaskId: string | null;
  workspaceId: string | null;
  /**
   * Agent/version that actually ran, ONLY when the returned record names the root task's agent. Never taken
   * from session.trigger.agent / trigger.workspace_agent: natively those are the trigger's configured
   * default agent, not the agent that ran (observed 2026-10-09). Usually null at launch time.
   */
  returnedAgentRef: string | null;
  returnedVersionId: string | null;
  sessionType: string | null;
  /**
   * CONTROLLER clock, captured immediately before the launch request is sent. Freshness checks
   * (probe started strictly after the native receipt time) compare controller clock to controller
   * clock only — never Guild `created_at` to server time (acceptance P2-2).
   */
  startedAt: UtcNanoText;
  /** Native session/record creation time as returned by Guild (vendor clock), if present. */
  nativeCreatedAt: UtcNanoText | null;
  idempotencyRef: string;
  /** 'unknown' when the HTTP outcome was ambiguous (timeout); reconcile before retry. */
  outcome: 'created' | 'failed' | 'unknown';
  error: string | null;
}

/** Native task node as returned by the tasks endpoint (normalized, raw preserved). */
export interface TaskNode {
  taskId: string;
  sessionId: string;
  parentTaskId: string | null;
  kind: 'agent' | 'tool' | 'unknown';
  /** For agent tasks: native agent/version refs as present (nullable). */
  agentRef: string | null;
  versionId: string | null;
  /** For tool tasks. */
  toolName: string | null;
  toolCallId: string | null;
  status: string | null;
  httpStatus: number | null;
  /** Projected response data when present (may be absent by size); inspected for control marker. */
  responseData: unknown;
  rawJson: string;
}

export interface CollectedSession {
  provenance: Provenance;
  workspaceId: string;
  sessionId: string;
  /** Native session completion state at capture time. */
  sessionStatus: string | null;
  complete: boolean;
  observations: RawObservation[];
  tasks: TaskNode[];
  coverage: SessionCoverage;
  pageRefs: string[];
  errors: string[];
}

/** Server-side launch registry row: the finite cohort is declared from these, not from collection (devil P1-7). */
export interface RegisteredSession {
  workspaceId: string;
  sessionId: string;
  launchId: string;
  profile: LaunchProfile;
  /** Verified policy subject expected for this launch profile (from config/manifest, server-side). */
  expectedPolicySubjectId: string;
  /** Informational installed-agent id ('' when not configured). Never identity: binding uses the task graph. */
  installedAgentId: string;
}

export interface BindingInput {
  generationId: string;
  observations: RawObservation[];
  tasks: TaskNode[];
  registry: RegisteredSession[];
  /** Maps native agent refs (as seen in agent tasks) to verified policy-subject IDs. */
  subjectDomainMap: Record<string, string>;
}

export interface BindingResult {
  bindings: EventBinding[];
  diagnostics: Array<{ nativeIdentityKey: string; state: BindingState; reason: string }>;
}

export interface InvestigationContext {
  caseId: string;
  caseRevision: number;
  contextSha256: string;
  /** Compact immutable facts only: counts, allowances, witness IDs, unknowns, manifest ref/hash. */
  facts: Record<string, unknown>;
  manifestRef: string;
  ownedRepo: string;
  idempotencyRef: string;
}

export interface ProbeRequest {
  role: 'target' | 'control';
  /**
   * restriction: target must be refused; control must return its server-held marker.
   * recovery: BOTH must return their server-held expected markers (ALLOW alone is not success; devil P1-B).
   */
  purpose: 'restriction' | 'recovery';
  scope: ProposedScope;
  /** Probes must start strictly after this time (native receipt time). */
  notBefore: UtcNanoText;
  idempotencyRef: string;
}

export interface GuildPort {
  readonly provenance: Provenance;
  /** Presence/permission check; never returns secret values. */
  health(): Promise<{ ok: boolean; detail: string; missing: string[] }>;
  launch(profile: LaunchProfile, agentInput: string, idempotencyRef: string): Promise<LaunchReceipt>;
  /** Bounded wait for turn completion; returns final status or null on timeout. */
  awaitCompletion(sessionId: string, timeoutMs: number): Promise<string | null>;
  /** Exhaust event AND task pages for one registered session (finite snapshot). */
  collectSession(reg: RegisteredSession, generationId: string): Promise<CollectedSession>;
  /** Per-event acting-subject binding via task graph; root/requested label is never a fallback. */
  bindEvents(input: BindingInput): BindingResult;
  /** Launch hosted investigator with pinned context; reads/creates incident; returns receipt. */
  runInvestigation(ctx: InvestigationContext): Promise<InvestigationReceipt>;
  /** Fresh probe in a NEW session; inspects decision + control content against server-held marker. */
  runProbe(req: ProbeRequest): Promise<ProbeResult>;
  /** Reconciliation read for an ambiguous launch (by idempotency ref). */
  reconcileLaunch(idempotencyRef: string): Promise<LaunchReceipt | null>;
}

export type { Decision };
