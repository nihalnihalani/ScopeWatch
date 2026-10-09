import type {
  ActionRecord,
  ActionState,
  CandidateKey,
  CandidateResult,
  CaseDetail,
  EvidenceState,
  Provenance,
  RecoveryState,
} from '../shared/contracts.js';

export type Tone = 'neutral' | 'ok' | 'warn' | 'bad' | 'info' | 'sim';

export function big(s: string): bigint {
  try {
    return BigInt(s);
  } catch {
    return 0n;
  }
}

export function sameKey(a: CandidateKey | null, b: CandidateKey | null): boolean {
  return !!a && !!b && a.workspaceId === b.workspaceId && a.policySubjectId === b.policySubjectId && a.credentialId === b.credentialId && a.operation === b.operation;
}

export const PROVENANCE_TEXT: Record<Provenance, { short: string; long: string }> = {
  native: { short: 'NATIVE', long: 'Native: collected from a real Guild account by the trusted collector.' },
  replay: { short: 'REPLAY', long: 'Replay: synthetic fixture dataset. Not account evidence and never action eligible.' },
  contract_test: { short: 'SANDBOX', long: 'Sandbox Guild workspace — separate from the native account, not native evidence' },
};

export function actionEligibilityReason(c: CaseDetail): string | null {
  if (c.provenance === 'replay') {
    return 'Replay provenance is not action eligible. Only native cases can be approved for a native restriction.';
  }
  if (c.evidenceState !== 'review_ready') return `Evidence state is ${labelOf(c.evidenceState)}; review needs a ready case.`;
  if (!c.readiness.ready) return 'Readiness gaps remain; required evidence is unknown, not assumed.';
  if (!c.proposedScope) return 'The server has not proposed a restriction scope for this case.';
  if (c.actionBlockedReason) return c.actionBlockedReason;
  return null;
}

const LABELS: Record<string, string> = {
  evidence_pending: 'Evidence pending',
  evidence_incomplete: 'Evidence incomplete',
  evidence_disputed: 'Evidence disputed',
  no_breach: 'No breach found',
  review_ready: 'Ready for review',
  none: 'No action yet',
  rejected: 'Review rejected',
  approved: 'Approved, awaiting native step',
  stale: 'Stale approval',
  native_application_pending: 'Native application pending',
  native_application_unknown: 'Native application unknown',
  native_application_observed: 'Native rule recorded, unverified',
  verification_pending: 'Verification pending',
  verification_failed: 'Verification failed',
  verification_unknown: 'Verification unknown',
  restriction_verified: 'Restriction verified',
  simulated_restriction_observed: 'Restriction observed (sandbox)',
  scope_mismatch: 'Scope mismatch',
  disputed_stale_application: 'Disputed: stale application',
  disputed: 'Disputed',
  removal_observed: 'Removal recorded, unverified',
  recovery_failed: 'Recovery failed',
  recovery_unknown: 'Recovery unknown',
  recovered: 'Recovered',
  simulated_recovered: 'Recovery observed (sandbox)',
};

export function labelOf(s: string): string {
  return LABELS[s] ?? s.replace(/_/g, ' ');
}

export function toneOf(s: ActionState | RecoveryState | EvidenceState): Tone {
  switch (s) {
    case 'restriction_verified':
    case 'recovered':
      return 'ok';
    case 'verification_failed':
    case 'recovery_failed':
    case 'scope_mismatch':
    case 'disputed_stale_application':
    case 'disputed':
    case 'evidence_disputed':
    case 'stale':
      return 'bad';
    case 'native_application_unknown':
    case 'verification_unknown':
    case 'recovery_unknown':
    case 'evidence_incomplete':
    case 'evidence_pending':
    case 'rejected':
      return 'warn';
    case 'simulated_restriction_observed':
    case 'simulated_recovered':
      return 'sim';
    default:
      return 'neutral';
  }
}

/** Replay evidence is never "ready for review": it can never be approved (lead fix, demo finding). */
export function evidenceLabel(state: string, provenance: string): string {
  if (state === 'review_ready' && provenance === 'replay') return 'Breach evidence complete (replay, not reviewable)';
  return labelOf(state);
}

export const SIMULATED_LABEL = 'Sandbox run — separate from the native Guild account';

export const GLYPH: Record<Tone, string> = { neutral: '○', ok: '✓', warn: '!', bad: '✕', info: 'i', sim: '~' };

export function breachedHistorically(c: CandidateResult): boolean {
  return c.breached || big(c.peakCount) > big(c.allowance);
}

/** Restriction actions are those of kind 'restriction'; latest by array order. */
export function latestAction(c: CaseDetail, kind: 'restriction' | 'recovery'): ActionRecord | null {
  const a = c.actions.filter((x) => x.kind === kind);
  return a.length ? (a[a.length - 1] ?? null) : null;
}

export function ageText(fromIso: string | null, toIso: string | null): string | null {
  if (!fromIso || !toIso) return null;
  const ms = Date.parse(toIso) - Date.parse(fromIso);
  if (!Number.isFinite(ms)) return null;
  const s = Math.round(Math.abs(ms) / 1000);
  const t = s < 90 ? `${s}s` : s < 5400 ? `${Math.round(s / 60)}m` : s < 172800 ? `${Math.round(s / 3600)}h` : `${Math.round(s / 86400)}d`;
  return ms >= 0 ? `${t} ago` : `${t} in the future`;
}

export function shortId(s: string, n = 14): string {
  return s.length > n ? `${s.slice(0, n - 1)}…` : s;
}
