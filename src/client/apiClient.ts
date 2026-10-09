import type {
  ActionRecord,
  ApiError,
  CaseDetail,
  CaseSummary,
  SanitizedExport,
  SessionInfo,
  StatusReport,
} from '../shared/contracts.js';
import type {
  ActionReviewBody,
  NativeReceiptBody,
  PipelineRunResult,
  RecoveryCreateBody,
  RemovalReceiptBody,
  ReviewBody,
  VerifyBody,
} from '../shared/api.js';

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: ApiError['code'] | 'network' | 'bad_response';
  readonly detail: string | undefined;
  constructor(status: number, code: ApiClientError['code'], message: string, detail?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
    this.detail = detail;
  }
}

export interface ApiClient {
  session(): Promise<SessionInfo>;
  login(secret: string): Promise<SessionInfo>;
  logout(): Promise<SessionInfo>;
  status(): Promise<StatusReport>;
  cases(): Promise<CaseSummary[]>;
  caseDetail(id: string): Promise<CaseDetail>;
  runReplay(): Promise<PipelineRunResult>;
  runPipeline(): Promise<PipelineRunResult>;
  investigate(caseId: string, expectedRevision: number): Promise<CaseDetail>;
  review(caseId: string, body: ReviewBody): Promise<CaseDetail>;
  nativeReceipt(actionId: string, body: NativeReceiptBody): Promise<ActionRecord>;
  verify(actionId: string, body: VerifyBody): Promise<ActionRecord>;
  createRecovery(actionId: string, body: RecoveryCreateBody): Promise<ActionRecord>;
  actionReview(actionId: string, body: ActionReviewBody): Promise<ActionRecord>;
  removalReceipt(actionId: string, body: RemovalReceiptBody): Promise<ActionRecord>;
  exportBundle(caseId: string): Promise<SanitizedExport>;
}

const enc = encodeURIComponent;

/** Typed fetch client. CSRF token is supplied by the caller each time via the getter. */
export function createApiClient(getCsrf: () => string | null, base = ''): ApiClient {
  async function call<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
    const headers: Record<string, string> = { accept: 'application/json' };
    if (method === 'POST') {
      headers['content-type'] = 'application/json';
      const t = getCsrf();
      if (t) headers['x-csrf-token'] = t;
    }
    let res: Response;
    try {
      res = await fetch(base + path, {
        method,
        credentials: 'same-origin',
        headers,
        body: method === 'POST' ? JSON.stringify(body ?? {}) : undefined,
      });
    } catch (e) {
      throw new ApiClientError(0, 'network', 'The ScopeWatch server could not be reached.', e instanceof Error ? e.message : undefined);
    }
    let parsed: unknown = null;
    const text = await res.text();
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        if (res.ok) throw new ApiClientError(res.status, 'bad_response', 'The server returned a non-JSON response.');
      }
    }
    if (!res.ok) {
      const e = (parsed ?? {}) as Partial<ApiError>;
      throw new ApiClientError(
        res.status,
        e.code ?? (res.status === 401 ? 'unauthenticated' : res.status === 503 ? 'dependency_unavailable' : 'internal'),
        e.error ?? `Request failed (${res.status}).`,
        e.detail,
      );
    }
    return parsed as T;
  }
  return {
    session: () => call('GET', '/api/session'),
    login: (secret) => call('POST', '/api/login', { secret }),
    logout: () => call('POST', '/api/logout', {}),
    status: () => call('GET', '/api/status'),
    cases: () => call('GET', '/api/cases'),
    caseDetail: (id) => call('GET', `/api/cases/${enc(id)}`),
    runReplay: () => call('POST', '/api/replay/run', {}),
    runPipeline: () => call('POST', '/api/pipeline/run', {}),
    investigate: (id, expectedRevision) => call('POST', `/api/cases/${enc(id)}/investigate`, { expectedRevision }),
    review: (id, body) => call('POST', `/api/cases/${enc(id)}/review`, body),
    nativeReceipt: (id, body) => call('POST', `/api/actions/${enc(id)}/native-receipt`, body),
    verify: (id, body) => call('POST', `/api/actions/${enc(id)}/verify`, body),
    createRecovery: (id, body) => call('POST', `/api/actions/${enc(id)}/recovery`, body),
    actionReview: (id, body) => call('POST', `/api/actions/${enc(id)}/review`, body),
    removalReceipt: (id, body) => call('POST', `/api/actions/${enc(id)}/removal-receipt`, body),
    exportBundle: (id) => call('GET', `/api/export/${enc(id)}`),
  };
}
