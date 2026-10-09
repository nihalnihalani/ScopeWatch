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
  /** Requested installed agent (intent only, never binding authority). */
  requestedInstalledAgentId: string;
  route: 'api_trigger' | 'chat';
  nativeSessionId: string | null;
  nativeRootTaskId: string | null;
  workspaceId: string | null;
  /** Corroborated subject/version from the RETURNED native record, if present. */
  returnedAgentRef: string | null;
  returnedVersionId: string | null;
  sessionType: string | null;
  startedAt: UtcNanoText;
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
