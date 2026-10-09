/**
 * ScopeWatch shared contracts (lead-owned).
 *
 * These are ScopeWatch application contracts, NOT Guild or ClickHouse vendor payloads.
 * Rules (docs/build/BUILD_PLAN.md "Contract shapes"):
 *  - Opaque IDs are strings. Counts that may exceed 2^53 travel as decimal strings ("exact integer").
 *  - Timestamps travel as validated UTC RFC3339 text with up to 9 fractional digits (`UtcNanoText`)
 *    plus, where arithmetic is needed, an epoch-nanosecond decimal string (`EpochNsText`).
 *    Never round through JS Date before counting.
 *  - Provenance is explicit on every fact-bearing record. Replay and contract-test data can never
 *    become native facts or native-action eligible.
 */

// ---------------------------------------------------------------------------
// Primitive aliases
// ---------------------------------------------------------------------------

/** Exact non-negative integer serialized as a decimal string (parse with BigInt). */
export type ExactInt = string;
/** UTC timestamp text, e.g. "2026-10-09T18:42:01.123456789Z". Original precision preserved. */
export type UtcNanoText = string;
/** Epoch nanoseconds as a decimal string. */
export type EpochNsText = string;
/** Lower-case hex SHA-256 digest of exact bytes. */
export type Sha256Hex = string;

// ---------------------------------------------------------------------------
// Provenance and modes
// ---------------------------------------------------------------------------

/**
 * native        – collected from a real Guild account by the trusted collector.
 * replay        – separately namespaced synthetic dataset; never action eligible.
 * contract_test – produced through the real adapter against a LOOPBACK MOCK Guild API built from the
 *                 documented schema. Exercises code paths only; never evidence of account behavior.
 */
export type Provenance = 'native' | 'replay' | 'contract_test';

/** Server run mode; fixed at startup. Native mode never silently falls back to replay. */
export type RunMode = 'native' | 'replay' | 'contract_test';

/**
 * Action eligibility is decided from the ROW's provenance, never the process mode (devil P0-2).
 * Only native-provenance cases may be approved as native policy actions.
 */
export function isNativeActionEligible(p: Provenance): boolean {
  return p === 'native';
}

export const WINDOW_SECONDS = 600 as const;
export const WINDOW_NS = 600_000_000_000n;

// ---------------------------------------------------------------------------
// Manifest (operator-owned allowances)
// ---------------------------------------------------------------------------

export interface ManifestAllowance {
  /** Verified native policy-subject ID (domain recorded in manifest.subjectIdDomain). */
  policySubjectId: string;
  /** Human label for display only. Never authority. */
  displayLabel: string;
  /** Max unique native ALLOW decisions within the window. */
  maxUniqueAllowDecisions: ExactInt;
  approvalRef: string;
}

/** Parsed content of the operator manifest document. Its own hash is NOT inside it. */
export interface ManifestDocument {
  schema: 'scopewatch.manifest/v1';
  policyVersion: string;
  workspaceId: string;
  credentialId: string;
  operation: string;
  /** e.g. "native_allow_security_event_id" – the calibrated counted unit. */
  unit: string;
  /** e.g. "guild.security_event.created_at" – the verified clock. */
  clock: string;
  /** Domain of policySubjectId values, e.g. "guild_policy_agent_id" (must be verified natively). */
  subjectIdDomain: string;
  /** Native identity domain of event IDs, e.g. "workspace" | "session". */
  identityDomain: 'workspace' | 'session';
  windowSeconds: typeof WINDOW_SECONDS;
  effectiveFrom: UtcNanoText;
  effectiveUntil: UtcNanoText | null;
  allowances: ManifestAllowance[];
}

/** External wrapper: hash + immutable ref live OUTSIDE the hashed bytes. */
export interface PinnedManifest {
  manifestId: string;
  provenance: Provenance;
  /** Immutable reference, e.g. "git:<commit>:<path>" or "replay:<seed>". */
  immutableRef: string;
  sha256: Sha256Hex;
  byteLength: number;
  document: ManifestDocument;
  pinnedAt: UtcNanoText;
  approvedBy: string;
}

// ---------------------------------------------------------------------------
// Source evidence
// ---------------------------------------------------------------------------

export type Decision = 'ALLOW' | 'DENY' | 'ERROR';

/**
 * Closed list of STABLE SEMANTIC fields compared across copies of one identity (devil P1-6).
 * Any difference among these (including NULL→value) is an integrity conflict.
 * Delivery-only fields (observationId, fetchRecordId, pageRef, observedAt, contentSha256 of the
 * envelope) are provenance and are NOT compared.
 * Session is compared as payload because the identity domain may be workspace-wide.
 */
export const SEMANTIC_FIELDS = [
  'identityDomain',
  'workspaceId',
  'sessionId',
  'nativeEventId',
  'nativeTaskId',
  'credentialId',
  'operation',
  'decision',
  'reasonCode',
  'createdAtRaw',
  'createdAtNs',
  'unitMappingVersion',
  'semanticJson',
] as const;
export type SemanticField = (typeof SEMANTIC_FIELDS)[number];

/**
 * Identity domain must be VERIFIED (native proof or fixture declaration) before admission.
 * 'unverified' blocks native admission.
 */
export type IdentityDomainStatus = 'verified' | 'declared_fixture' | 'unverified';

/** One fetched copy of a native security event (immutable; redeliveries kept). */
export interface RawObservation {
  observationId: string;
  provenance: Provenance;
  generationId: string;
  fetchRecordId: string;
  pageRef: string;
  /** Injective encoding of the verified identity domain tuple; null when identity missing. */
  nativeIdentityKey: string | null;
  identityDomain: string | null;
  workspaceId: string;
  sessionId: string;
  nativeEventId: string | null;
  nativeTaskId: string | null;
  /** Vendor field `credentials_id` (plural) preserved; normalized below. */
  credentialId: string | null;
  operation: string | null;
  decision: Decision | null;
  reasonCode: string | null;
  createdAtRaw: string | null;
  createdAt: UtcNanoText | null;
  createdAtNs: EpochNsText | null;
  unitMappingVersion: string;
  /** Canonical JSON of stable native semantic content (no observation/page envelope fields). */
  semanticJson: string;
  observedAt: UtcNanoText;
  contentSha256: Sha256Hex;
}

export type BindingState = 'verified' | 'unresolved' | 'conflict';

export interface EventBinding {
  generationId: string;
  nativeIdentityKey: string;
  policySubjectId: string | null;
  bindingState: BindingState;
  nativeActingTaskId: string | null;
  /** e.g. "task_graph:security.task_id→agent_task→launch_registry" */
  mappingMethod: string;
  /** Reference to authenticated proof (task page refs, launch receipt). */
  proofRef: string;
  reason?: string;
}

export type CoverageState = 'complete' | 'incomplete' | 'open' | 'missing' | 'failed';

export interface SessionCoverage {
  generationId: string;
  workspaceId: string;
  sessionId: string;
  launchSubjectId: string | null;
  coverageState: CoverageState;
  expectedPages: number;
  fetchedPages: number;
  rawRecords: number;
  requiredFieldGaps: number;
  completionRef: string;
  notes: string[];
}

// ---------------------------------------------------------------------------
// Generations and readiness
// ---------------------------------------------------------------------------

export type GenerationState =
  | 'collecting'
  | 'sealed'
  | 'inserted'
  | 'readback_confirmed'
  | 'readback_failed'
  | 'evaluated';

export interface GenerationReceipt {
  generationId: string;
  provenance: Provenance;
  state: GenerationState;
  manifestId: string;
  manifestSha256: Sha256Hex;
  captureCutoff: UtcNanoText;
  rawCount: number;
  canonicalKeyCount: number;
  /** sha256 over sorted canonical (identity, semanticJson) pairs. */
  semanticDigest: Sha256Hex;
  bindingDigest: Sha256Hex;
  coverageDigest: Sha256Hex;
  manifestDigest: Sha256Hex;
  sealedAt: UtcNanoText | null;
  insertAckAt: UtcNanoText | null;
  readback: ReadbackResult | null;
  /** Previous generation this one carries forward (late data / reconciliation). */
  parentGenerationId: string | null;
}

export interface ReadbackResult {
  checkedAt: UtcNanoText;
  ok: boolean;
  /** Per-component equality; any false → readback_failed. */
  components: {
    rawIds: boolean;
    semantics: boolean;
    bindings: boolean;
    coverage: boolean;
    manifest: boolean;
  };
  mismatches: string[];
  queryIds: string[];
}

export type GapKind =
  | 'identity_missing'
  | 'identity_conflict'
  | 'binding_unresolved'
  | 'binding_conflict'
  | 'binding_missing'
  | 'coverage_incomplete'
  | 'required_field_missing'
  | 'allowance_missing'
  | 'allowance_conflict'
  | 'manifest_epoch'
  | 'clock_invalid';

export interface ReadinessGap {
  kind: GapKind;
  detail: string;
  nativeIdentityKey?: string;
  sessionId?: string;
  policySubjectId?: string;
}

export interface ReadinessReport {
  generationId: string;
  ready: boolean;
  gaps: ReadinessGap[];
  cohortSessions: number;
  completeSessions: number;
  canonicalKeys: number;
  conflictKeys: number;
}

// ---------------------------------------------------------------------------
// Evaluation
// ---------------------------------------------------------------------------

export interface CandidateKey {
  workspaceId: string;
  policySubjectId: string;
  credentialId: string;
  operation: string;
}

export interface AnchorCount extends CandidateKey {
  anchor: UtcNanoText;
  anchorNs: EpochNsText;
  count: ExactInt;
  allowance: ExactInt;
  breached: boolean;
}

export interface Witness {
  anchor: UtcNanoText;
  anchorNs: EpochNsText;
  count: ExactInt;
  allowance: ExactInt;
  identityKeys: string[];
  sessions: Array<{ sessionId: string; count: ExactInt }>;
  queryId: string | null;
}

export interface CandidateResult extends CandidateKey {
  displayLabel: string;
  allowance: ExactInt;
  currentCount: ExactInt;
  peakCount: ExactInt;
  peakWitness: Witness | null;
  firstCrossing: Witness | null;
  breached: boolean;
  /** "ready" or reason it is not definitive. */
  readiness: 'ready' | 'incomplete';
}

export interface QueryReceipt {
  queryId: string;
  queryClass: 'conflict_check' | 'anchor_list' | 'anchor_all_candidates' | 'witness' | 'readback' | 'current';
  sqlSha256: Sha256Hex;
  sqlVersion: string;
  params: Record<string, string>;
  rowCount: number;
  outputSha256: Sha256Hex;
  clientMs: number;
  serverMs: number | null;
  executedAt: UtcNanoText;
  target: 'clickhouse_local' | 'clickhouse_cloud';
  database: string;
  serverVersion: string;
}

export interface EvaluationReceipt {
  evaluationId: string;
  generationId: string;
  manifestSha256: Sha256Hex;
  provenance: Provenance;
  anchors: UtcNanoText[];
  captureCutoff: UtcNanoText;
  candidates: CandidateResult[];
  /** Ordered: first crossing ASC, excess DESC, ids ASC. */
  breachedKeys: CandidateKey[];
  primary: CandidateKey | null;
  oracleAgrees: boolean;
  oracleMismatches: string[];
  queries: QueryReceipt[];
  evaluatedAt: UtcNanoText;
}

// ---------------------------------------------------------------------------
// Case, investigation, action, verification
// ---------------------------------------------------------------------------

export type EvidenceState =
  | 'evidence_pending'
  | 'evidence_incomplete'
  | 'evidence_disputed'
  | 'no_breach'
  | 'review_ready';

export type ActionState =
  | 'none'
  | 'review_ready'
  | 'rejected'
  | 'approved'
  | 'stale'
  | 'native_application_pending'
  | 'native_application_unknown'
  | 'native_application_observed'
  | 'verification_pending'
  | 'verification_failed'
  | 'verification_unknown'
  | 'restriction_verified'
  | 'simulated_restriction_observed'
  | 'scope_mismatch'
  | 'disputed_stale_application'
  | 'disputed';

export type RecoveryState =
  | 'none'
  | 'review_ready'
  | 'approved'
  | 'removal_observed'
  | 'verification_pending'
  | 'recovery_failed'
  | 'recovery_unknown'
  | 'recovered'
  | 'simulated_recovered';

export interface ProposedScope {
  workspaceId: string;
  policySubjectId: string;
  credentialId: string;
  operation: string;
  /** Only if the native matcher was verified; otherwise null (unrestricted dimension disclosed). */
  resourceSelector: { repos: string[]; methods: string[] } | null;
  decision: 'DENY';
  residualCapability: string[];
}

export interface InvestigationClaimCheck {
  claim: string;
  expected: string;
  found: string | null;
  ok: boolean;
}

export type InvestigationState =
  | 'not_started'
  | 'unavailable'
  | 'running'
  | 'created'
  | 'create_unknown'
  | 'failed';

export interface InvestigationReceipt {
  investigationId: string;
  caseId: string;
  caseRevision: number;
  provenance: Provenance;
  state: InvestigationState;
  contextSha256: Sha256Hex;
  nativeSessionId: string | null;
  nativeTaskId: string | null;
  contextReadRef: string | null;
  incidentUrl: string | null;
  /** Untrusted model text; rendered escaped; never authority. */
  narrative: string | null;
  grounded: boolean | null;
  checks: InvestigationClaimCheck[];
  unavailableReason: string | null;
  updatedAt: UtcNanoText;
}

export interface NativeApplicationReceipt {
  recordedBy: string;
  recordedAt: UtcNanoText;
  method: 'guild_ui' | 'guild_cli_verified';
  /** Operator-entered observed native rule fields (as shown by native UI/CLI). */
  nativeRuleId: string | null;
  observedSelectors: {
    credentialId: string;
    operation: string;
    policySubjectId: string;
    workspaceId: string;
    decision: string;
    resources: string | null;
  };
  appliedAt: UtcNanoText;
  evidenceNote: string;
  /** Server computed: do observed selectors equal the approved scope? */
  matchesApprovedScope: boolean;
  mismatches: string[];
}

export type ProbeOutcome =
  /** Target operation was ALLOWED (for a target probe after restriction: restriction failed). */
  | 'allowed'
  | 'refused_policy'
  | 'refused_other'
  | 'succeeded_expected'
  | 'succeeded_unexpected_content'
  | 'failed'
  | 'missing';

/** Probes are always NEW sessions launched server-side after the native receipt time (devil P1-3). */
export interface ProbeResult {
  role: 'target' | 'control';
  provenance: Provenance;
  launchId: string;
  nativeSessionId: string | null;
  nativeEventIds: string[];
  decision: Decision | null;
  reasonCode: string | null;
  boundSubjectId: string | null;
  credentialId: string | null;
  /** How expected content was inspected (never via model claim). */
  inspection: string;
  outcome: ProbeOutcome;
  startedAt: UtcNanoText;
  completedAt: UtcNanoText | null;
}

/**
 * Positive verdicts on non-native provenance are ALWAYS the simulated_* variants (devil P0-2/P1-1);
 * `restriction_verified` / `recovered` exist only for native provenance.
 */
export type VerificationVerdict =
  | 'simulated_restriction_observed'
  | 'simulated_recovered'
  | 'restriction_verified'
  | 'restriction_failed'
  | 'continuity_failed'
  | 'policy_refusal_unproved'
  | 'unknown'
  | 'recovered'
  | 'recovery_failed';

export interface VerificationReceipt {
  verificationId: string;
  provenance: Provenance;
  actionId: string;
  kind: 'restriction' | 'recovery';
  target: ProbeResult;
  control: ProbeResult;
  verdict: VerificationVerdict;
  explanation: string;
  residualScope: string[];
  verifiedAt: UtcNanoText;
}

/**
 * Canonical scope-digest input (devil P2-1). Digest = sha256 of JSON.stringify of this object with
 * keys in EXACTLY this order (use `scopeDigestInput()` to build it). UI preview shows the same bytes.
 */
export interface ScopeDigestInput {
  provenance: Provenance;
  caseId: string;
  caseRevision: number;
  manifestSha256: Sha256Hex;
  workspaceId: string;
  policySubjectId: string;
  credentialId: string;
  operation: string;
  resourceSelector: { repos: string[]; methods: string[] } | null;
  intendedMutation: 'add_deny_rule' | 'remove_deny_rule';
}

export function scopeDigestInput(x: ScopeDigestInput): ScopeDigestInput {
  return {
    provenance: x.provenance,
    caseId: x.caseId,
    caseRevision: x.caseRevision,
    manifestSha256: x.manifestSha256,
    workspaceId: x.workspaceId,
    policySubjectId: x.policySubjectId,
    credentialId: x.credentialId,
    operation: x.operation,
    resourceSelector: x.resourceSelector
      ? { repos: [...x.resourceSelector.repos].sort(), methods: [...x.resourceSelector.methods].sort() }
      : null,
    intendedMutation: x.intendedMutation,
  };
}

/**
 * Intent rows recorded BEFORE any external call (devil P1-4). A timeout leaves outcome 'unknown';
 * retry only after a reconciliation read finds no prior effect.
 */
export interface ExternalIntent {
  intentId: string;
  idempotencyRef: string;
  kind: 'investigation_launch' | 'probe_launch' | 'issue_create';
  relatedId: string;
  outcome: 'pending' | 'succeeded' | 'failed' | 'unknown' | 'reconciled';
  createdAt: UtcNanoText;
  resolvedAt: UtcNanoText | null;
  detail: string;
}

export interface ActionRecord {
  actionId: string;
  caseId: string;
  provenance: Provenance;
  kind: 'restriction' | 'recovery';
  /** Optimistic-concurrency version of this action row. */
  version: number;
  state: ActionState | RecoveryState;
  caseRevision: number;
  manifestSha256: Sha256Hex;
  scope: ProposedScope;
  scopeDigest: Sha256Hex;
  approvedBy: string | null;
  approvedAt: UtcNanoText | null;
  rejectionReason: string | null;
  nativeReceipt: NativeApplicationReceipt | null;
  verifications: VerificationReceipt[];
  /** Restriction action this recovery reverses. */
  reversesActionId: string | null;
  history: Array<{ at: UtcNanoText; from: string; to: string; by: string; note: string }>;
}

export interface TimelineEntry {
  at: UtcNanoText;
  kind:
    | 'session'
    | 'first_crossing'
    | 'peak'
    | 'query'
    | 'investigation'
    | 'review'
    | 'native_application'
    | 'verification'
    | 'recovery'
    | 'dispute';
  title: string;
  detail: string;
  provenance: Provenance;
  ref: string | null;
}

export interface CaseSummary {
  caseId: string;
  revision: number;
  provenance: Provenance;
  evidenceState: EvidenceState;
  actionState: ActionState;
  primary: CandidateKey | null;
  primaryLabel: string | null;
  createdAt: UtcNanoText;
  updatedAt: UtcNanoText;
}

/** Bounded per-session source evidence for the timeline inspector (no raw payloads). */
export interface SessionEvidence {
  sessionId: string;
  workspaceId: string;
  coverageState: CoverageState;
  policySubjectId: string | null;
  bindingStates: Record<BindingState, number>;
  mappingMethods: string[];
  proofRefs: string[];
  /** Canonical selected ALLOW identity keys from this session (bounded; total given separately). */
  identityKeys: string[];
  identityKeyTotal: number;
  pageRefs: string[];
  completionRef: string;
}

/**
 * Native-receipt POST is accepted only from these action states (lead decision D8).
 * scope_mismatch allows recording a corrected native rule observation.
 * stale is accepted ONLY to preserve an out-of-band application of an old scope: it is recorded as
 * disputed_stale_application, never as an observed current-case action (ARCHITECTURE §8).
 */
export const RECEIPT_ACCEPTING_STATES: ActionState[] = [
  'approved',
  'native_application_pending',
  'native_application_unknown',
  'scope_mismatch',
  'stale',
];

export interface CaseDetail extends CaseSummary {
  generation: GenerationReceipt;
  readiness: ReadinessReport;
  manifest: PinnedManifest;
  evaluation: EvaluationReceipt;
  /** The authorized control(s) shown beside the primary; all candidates included. */
  candidates: CandidateResult[];
  uncertainty: string[];
  investigation: InvestigationReceipt | null;
  proposedScope: ProposedScope | null;
  /** Exact digest input + digest the server will bind on approval (same bytes; preview for review). */
  proposedScopeDigestInput: ScopeDigestInput | null;
  proposedScopeDigest: Sha256Hex | null;
  sessions: SessionEvidence[];
  actions: ActionRecord[];
  timeline: TimelineEntry[];
  /** Why the action CTA is disabled, if it is. */
  actionBlockedReason: string | null;
}

// ---------------------------------------------------------------------------
// Status / API envelope
// ---------------------------------------------------------------------------

export type DependencyStatus = 'ok' | 'unconfigured' | 'unavailable' | 'error';

export interface StatusReport {
  mode: RunMode;
  modeLabel: string;
  serverTime: UtcNanoText;
  clickhouse: { status: DependencyStatus; target: string | null; version: string | null; detail: string };
  guild: { status: DependencyStatus; baseUrl: string | null; detail: string; missing: string[] };
  journal: { status: DependencyStatus; path: string; detail: string };
  lastCaptureAt: UtcNanoText | null;
  lastEvaluationAt: UtcNanoText | null;
  /**
   * Configuration presence checks (NOT native proof). In contract_test status is 'simulated'.
   */
  configChecks: Array<{ check: string; status: 'present' | 'missing' | 'simulated' | 'not_applicable'; detail: string }>;
  /**
   * Native proof gates G1/G1b/G2 (devil P1-D). 'passed' ONLY with a sanitized native receipt reference;
   * never derived from env presence. Non-native modes report 'not_applicable'.
   */
  nativeGates: Array<{ gate: 'G1' | 'G1b' | 'G2'; status: 'passed' | 'failed' | 'pending' | 'not_applicable'; detail: string; receiptRef: string | null }>;
}

export interface SessionInfo {
  authenticated: boolean;
  operator: string | null;
  csrfToken: string | null;
  mode: RunMode;
}

export interface ApiError {
  error: string;
  code:
    | 'unauthenticated'
    | 'csrf'
    | 'origin'
    | 'not_found'
    | 'stale_revision'
    | 'not_eligible'
    | 'invalid'
    | 'dependency_unavailable'
    | 'conflict'
    | 'internal';
  detail?: string;
}

export interface SanitizedExport {
  schema: 'scopewatch.export/v1';
  exportedAt: UtcNanoText;
  provenance: Provenance;
  /** Plain-language limits on what this bundle proves. */
  limits: string[];
  case: Omit<CaseDetail, 'actions'> & { actions: Array<Omit<ActionRecord, 'history'>> };
  sourceClasses: Record<string, Provenance | 'operator_recorded' | 'application'>;
}
