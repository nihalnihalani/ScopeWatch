/**
 * Lead-owned HTTP route contract between src/client and src/server/http.
 * These are ScopeWatch application routes, NOT Guild endpoints.
 *
 * Auth: POST /api/login sets an HttpOnly SameSite=Strict session cookie and returns a CSRF token.
 * Every mutation (POST) requires: valid session cookie, header `X-CSRF-Token` equal to the session's
 * synchronizer token, and exact Origin (or Referer origin) + Host in the configured allowlist.
 * Bodies carry stored IDs + expected revision/version only; the server resolves scope from the journal.
 * Errors use ApiError { error, code, detail? } with 401/403/404/409/422/503 statuses.
 */
import type {
  ActionRecord,
  CaseDetail,
  CaseSummary,
  GenerationReceipt,
  QueryReceipt,
  ReadinessReport,
  SanitizedExport,
  SessionInfo,
  StatusReport,
} from './contracts.js';

export interface LoginBody { secret: string }
export interface ReviewBody {
  /** Case revision the operator reviewed. Mismatch → 409 stale_revision. */
  expectedRevision: number;
  decision: 'approve' | 'reject';
  reason: string;
}
export interface NativeReceiptBody {
  expectedVersion: number;
  method: 'guild_ui' | 'guild_cli_verified';
  nativeRuleId: string | null;
  observedSelectors: {
    credentialId: string;
    operation: string;
    policySubjectId: string;
    workspaceId: string;
    decision: string;
    resources: string | null;
  };
  /** UTC text the operator observed the rule applied in native UI/CLI. */
  appliedAt: string;
  evidenceNote: string;
}
export interface VerifyBody { expectedVersion: number }
export interface RecoveryCreateBody { expectedVersion: number; reason: string }
export interface ActionReviewBody { expectedVersion: number; decision: 'approve' | 'reject'; reason: string }
export interface RemovalReceiptBody {
  expectedVersion: number;
  method: 'guild_ui' | 'guild_cli_verified';
  nativeRuleId: string | null;
  /** What the operator OBSERVED was removed in native UI/CLI (devil P1-C); compared to the restriction's scope. */
  observedSelectors: NativeReceiptBody['observedSelectors'];
  removedAt: string;
  evidenceNote: string;
}

export interface PipelineRunResult {
  generationId: string;
  state: string;
  caseId: string | null;
  readinessGaps: number;
  detail: string;
}

/** Route table (method, path, request body, response). */
export interface Routes {
  'GET /api/health': { res: { ok: true } };
  'GET /api/session': { res: SessionInfo };
  'POST /api/login': { body: LoginBody; res: SessionInfo };
  'POST /api/logout': { body: Record<string, never>; res: SessionInfo };
  'GET /api/status': { res: StatusReport };
  'GET /api/cases': { res: CaseSummary[] };
  'GET /api/cases/:id': { res: CaseDetail };
  'GET /api/cases/:id/queries': { res: QueryReceipt[] };
  /** All generations incl. NOT-READY ones (gaps/conflicts) that produced no case. */
  'GET /api/generations': { res: GenerationSummary[] };
  /** Replay mode: run the full replay pipeline for the declared seed. 409 in other modes. */
  'POST /api/replay/run': { body: { seed?: string }; res: PipelineRunResult };
  /**
   * Native / contract_test: collect the server-side REGISTERED cohort (launch registry written by
   * `npm run scenario` / tools/run-scenario.ts) → seal → publish → readback → evaluate. Body carries no IDs.
   */
  'POST /api/pipeline/run': { body: Record<string, never>; res: PipelineRunResult };
  'POST /api/cases/:id/investigate': { body: { expectedRevision: number }; res: CaseDetail };
  'POST /api/cases/:id/review': { body: ReviewBody; res: CaseDetail };
  'POST /api/actions/:id/native-receipt': { body: NativeReceiptBody; res: ActionRecord };
  'POST /api/actions/:id/verify': { body: VerifyBody; res: ActionRecord };
  'POST /api/actions/:id/recovery': { body: RecoveryCreateBody; res: ActionRecord };
  'POST /api/actions/:id/review': { body: ActionReviewBody; res: ActionRecord };
  'POST /api/actions/:id/removal-receipt': { body: RemovalReceiptBody; res: ActionRecord };
  /** Sanitized read-only bundle. Non-native provenance bundles are marked non-evidence in `limits`. */
  'GET /api/export/:caseId': { res: SanitizedExport };
}

export interface GenerationSummary {
  generation: GenerationReceipt;
  readiness: ReadinessReport | null;
  caseId: string | null;
}

export const CSRF_HEADER = 'x-csrf-token';
export const SESSION_COOKIE = 'sw_session';
