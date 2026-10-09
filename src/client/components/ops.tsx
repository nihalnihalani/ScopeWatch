import { useCallback, useState, type ReactNode } from 'react';
import type { ActionRecord, CaseDetail } from '../../shared/contracts.js';
import type { ActionReviewBody, NativeReceiptBody, RecoveryCreateBody, RemovalReceiptBody, ReviewBody, VerifyBody } from '../../shared/api.js';
import { ApiClientError } from '../http-client.js';
import { Notice } from './common.js';

/** Mutations the case workstation can request. All throw ApiClientError; callers show it with <ErrorNotice>. */
export interface Ops {
  investigate(caseId: string, expectedRevision: number): Promise<CaseDetail>;
  review(caseId: string, body: ReviewBody): Promise<CaseDetail>;
  nativeReceipt(actionId: string, body: NativeReceiptBody): Promise<ActionRecord>;
  verify(actionId: string, body: VerifyBody): Promise<ActionRecord>;
  createRecovery(actionId: string, body: RecoveryCreateBody): Promise<ActionRecord>;
  actionReview(actionId: string, body: ActionReviewBody): Promise<ActionRecord>;
  removalReceipt(actionId: string, body: RemovalReceiptBody): Promise<ActionRecord>;
  /** Reload the case after a mutation (and announce). */
  reload(note?: string): Promise<void>;
}

export function useOp(ops: Ops) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ApiClientError | null>(null);
  const run = useCallback(
    async (fn: () => Promise<unknown>, note: string): Promise<boolean> => {
      setBusy(true);
      setError(null);
      try {
        await fn();
        await ops.reload(note);
        return true;
      } catch (e) {
        setError(e instanceof ApiClientError ? e : new ApiClientError(0, 'internal', e instanceof Error ? e.message : 'Unexpected error'));
        return false;
      } finally {
        setBusy(false);
      }
    },
    [ops],
  );
  return { busy, error, run, clear: () => setError(null) };
}

export function errorCopy(e: ApiClientError): { title: string; body: string; stale: boolean; login: boolean } {
  switch (e.code) {
    case 'stale_revision':
      return { title: 'Stale: the case or action changed', body: 'Your approval or receipt was NOT applied because it targeted an older revision. Reload, re-read the current evidence, then decide again.', stale: true, login: false };
    case 'conflict':
      return { title: 'Conflict with current state', body: e.message, stale: e.status === 409, login: false };
    case 'not_eligible':
      return { title: 'Not eligible', body: e.message, stale: false, login: false };
    case 'unauthenticated':
      return { title: 'Login required', body: 'Your operator session ended. Sign in again; nothing was changed.', stale: false, login: true };
    case 'csrf':
    case 'origin':
      return { title: 'Request rejected by origin or CSRF check', body: 'Reload the page to obtain a fresh session token. Nothing was changed.', stale: false, login: false };
    case 'dependency_unavailable':
      return { title: 'A dependency is unavailable', body: e.message, stale: false, login: false };
    case 'network':
      return { title: 'Server unreachable', body: 'The ScopeWatch server did not respond. Whether the request took effect is unknown; reload before retrying.', stale: false, login: false };
    case 'not_found':
      return { title: 'Not found', body: e.message, stale: false, login: false };
    case 'invalid':
      return { title: 'Invalid request', body: e.message, stale: false, login: false };
    default:
      return { title: 'Server error', body: e.message, stale: false, login: false };
  }
}

export function ErrorNotice({ error, onReload, actions }: { error: ApiClientError; onReload?: () => void; actions?: ReactNode }) {
  const c = errorCopy(error);
  return (
    <Notice
      tone={c.stale ? 'warn' : 'bad'}
      title={c.title}
      role="alert"
      actions={
        <>
          {onReload && (c.stale || error.code === 'network' || error.code === 'csrf') ? (
            <button type="button" className="btn" onClick={onReload}>Reload current state</button>
          ) : null}
          {actions}
        </>
      }
    >
      <p data-testid="error-body">{c.body}</p>
      {error.detail ? <p className="small mono" style={{ overflowWrap: 'anywhere' }}>{error.detail}</p> : null}
      <p className="small muted">HTTP {error.status || 'n/a'} · code {error.code}</p>
    </Notice>
  );
}
