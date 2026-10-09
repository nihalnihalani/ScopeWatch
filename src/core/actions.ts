/**
 * Pure action state machine and verification verdict matrix (ARCH §8-9).
 * No I/O. The journal applies transitions with a SQL compare-and-set on `version`.
 */
import type {
  ActionRecord,
  ActionState,
  ProbeResult,
  Provenance,
  RecoveryState,
  VerificationVerdict,
} from '../shared/contracts.js';
import { isNativeActionEligible } from '../shared/contracts.js';
import { nowUtcNano } from './time.js';

export class StaleVersionError extends Error {
  constructor(
    public readonly expected: number,
    public readonly actual: number,
  ) {
    super(`stale action version: expected ${expected}, current ${actual}`);
  }
}
export class IllegalTransitionError extends Error {}

type AnyState = ActionState | RecoveryState;

const RESTRICTION_TRANSITIONS: Partial<Record<ActionState, ActionState[]>> = {
  review_ready: ['approved', 'rejected', 'stale'],
  stale: ['disputed_stale_application'],
  approved: ['native_application_pending', 'native_application_observed', 'native_application_unknown', 'scope_mismatch', 'disputed_stale_application', 'stale', 'rejected'],
  native_application_pending: ['native_application_observed', 'native_application_unknown', 'scope_mismatch', 'disputed_stale_application', 'stale'],
  native_application_unknown: ['native_application_observed', 'scope_mismatch', 'disputed_stale_application'],
  native_application_observed: ['verification_pending', 'disputed'],
  verification_pending: ['restriction_verified', 'simulated_restriction_observed', 'verification_failed', 'verification_unknown', 'disputed'],
  verification_failed: ['verification_pending', 'disputed'],
  verification_unknown: ['verification_pending', 'disputed'],
  restriction_verified: ['disputed'],
  simulated_restriction_observed: ['disputed'],
  scope_mismatch: ['native_application_observed', 'scope_mismatch', 'disputed_stale_application', 'disputed'],
  disputed_stale_application: ['disputed'],
};

const RECOVERY_TRANSITIONS: Partial<Record<RecoveryState, RecoveryState[]>> = {
  review_ready: ['approved'],
  approved: ['removal_observed'],
  removal_observed: ['verification_pending'],
  verification_pending: ['recovered', 'simulated_recovered', 'recovery_failed', 'recovery_unknown'],
  recovery_failed: ['verification_pending'],
  recovery_unknown: ['verification_pending'],
};

/** Recovery rejection reuses ActionState 'rejected' (distinct from recovery states). */
export function canTransition(kind: 'restriction' | 'recovery', from: AnyState, to: AnyState): boolean {
  if (kind === 'restriction') return (RESTRICTION_TRANSITIONS[from as ActionState] ?? []).includes(to as ActionState);
  if (to === ('rejected' as AnyState)) return from === 'review_ready';
  // a removal receipt whose observed selectors differ from the restriction scope is a mismatch (blocks recovery verify)
  if (to === ('scope_mismatch' as AnyState)) return from === 'approved' || from === 'scope_mismatch';
  if (from === ('scope_mismatch' as AnyState)) return to === ('removal_observed' as AnyState);
  return (RECOVERY_TRANSITIONS[from as RecoveryState] ?? []).includes(to as RecoveryState);
}

export const TERMINAL_RESTRICTION: ActionState[] = ['rejected', 'stale', 'scope_mismatch', 'disputed_stale_application', 'disputed', 'restriction_verified', 'simulated_restriction_observed'];

/** Apply a transition with optimistic concurrency. Returns a NEW record (version+1) with a history entry. */
export function applyTransition(
  action: ActionRecord,
  to: AnyState,
  by: string,
  note: string,
  expectedVersion: number,
  patch: Partial<ActionRecord> = {},
): ActionRecord {
  if (action.version !== expectedVersion) throw new StaleVersionError(expectedVersion, action.version);
  if (!canTransition(action.kind, action.state, to)) {
    throw new IllegalTransitionError(`${action.kind} action cannot move ${action.state} -> ${to}`);
  }
  return {
    ...action,
    ...patch,
    state: to,
    version: action.version + 1,
    history: [...action.history, { at: nowUtcNano(), from: action.state, to, by, note }],
  };
}

/** Verdict matrix. `expectedSubjectId` guards against probes bound to a different subject than approved. */
export function restrictionVerdict(
  provenance: Provenance,
  target: ProbeResult | null,
  control: ProbeResult | null,
  expect: { targetSubjectId: string; controlSubjectId?: string | null },
): { verdict: VerificationVerdict; explanation: string } {
  if (!target || !control || target.outcome === 'missing' || control.outcome === 'missing') {
    return { verdict: 'unknown', explanation: 'a probe result is missing; a missing result is neither success nor failure' };
  }
  if (target.outcome === 'allowed' || target.outcome === 'succeeded_expected' || target.outcome === 'succeeded_unexpected_content') {
    return { verdict: 'restriction_failed', explanation: 'the fresh target request succeeded; the restriction is not in effect' };
  }
  if (control.outcome !== 'succeeded_expected') {
    return { verdict: 'continuity_failed', explanation: `the approved control did not return inspected expected content (${control.outcome}); continuity is not preserved` };
  }
  if (target.outcome === 'refused_policy') {
    if (target.decision !== 'DENY' || target.boundSubjectId !== expect.targetSubjectId) {
      return { verdict: 'unknown', explanation: 'target refusal could not be bound to the approved subject with a native DENY decision' };
    }
    if (expect.controlSubjectId && control.boundSubjectId !== expect.controlSubjectId) {
      return { verdict: 'unknown', explanation: 'control result is not bound to the approved control subject' };
    }
    return isNativeActionEligible(provenance)
      ? { verdict: 'restriction_verified', explanation: 'fresh target refused by native policy DENY for the bound subject; fresh control returned inspected expected content' }
      : { verdict: 'simulated_restriction_observed', explanation: 'SIMULATED/NON-NATIVE: target refusal and control content observed through a non-native source; not evidence of account behavior' };
  }
  return { verdict: 'policy_refusal_unproved', explanation: 'target failed or was refused for a reason not proved to be the policy DENY; control succeeded' };
}

/** Recovery predicate is DIFFERENT: BOTH restored target and control must succeed with expected content. */
export function recoveryVerdict(
  provenance: Provenance,
  target: ProbeResult | null,
  control: ProbeResult | null,
  expect: { targetSubjectId: string; controlSubjectId?: string | null },
): { verdict: VerificationVerdict; explanation: string } {
  if (!target || !control || target.outcome === 'missing' || control.outcome === 'missing') {
    return { verdict: 'unknown', explanation: 'a probe result is missing; recovery is unknown' };
  }
  if (target.outcome === 'succeeded_expected' && control.outcome === 'succeeded_expected') {
    if (target.boundSubjectId !== expect.targetSubjectId) {
      return { verdict: 'unknown', explanation: 'target success is not bound to the approved subject' };
    }
    if (expect.controlSubjectId && control.boundSubjectId !== expect.controlSubjectId) {
      return { verdict: 'unknown', explanation: 'control success is not bound to the approved control subject' };
    }
    return isNativeActionEligible(provenance)
      ? { verdict: 'recovered', explanation: 'restored target and control both returned inspected expected content' }
      : { verdict: 'simulated_recovered', explanation: 'SIMULATED/NON-NATIVE: both probes succeeded through a non-native source' };
  }
  return { verdict: 'recovery_failed', explanation: `recovery requires both target and control to succeed with expected content (target ${target.outcome}, control ${control.outcome}); a falling count never authorizes release` };
}

export function restrictionStateFor(v: VerificationVerdict): ActionState {
  switch (v) {
    case 'restriction_verified':
      return 'restriction_verified';
    case 'simulated_restriction_observed':
      return 'simulated_restriction_observed';
    case 'unknown':
      return 'verification_unknown';
    default:
      return 'verification_failed';
  }
}

export function recoveryStateFor(v: VerificationVerdict): RecoveryState {
  switch (v) {
    case 'recovered':
      return 'recovered';
    case 'simulated_recovered':
      return 'simulated_recovered';
    case 'unknown':
      return 'recovery_unknown';
    default:
      return 'recovery_failed';
  }
}

/** States in which a restriction effect may exist on the native side (recovery may be proposed). */
export const EFFECT_POSSIBLE: ActionState[] = [
  'native_application_observed', 'verification_pending', 'verification_failed', 'verification_unknown',
  'restriction_verified', 'simulated_restriction_observed',
];

export const ACTIVE_RESTRICTION: ActionState[] = [
  'review_ready', 'approved', 'native_application_pending', 'native_application_unknown', 'native_application_observed',
  'verification_pending', 'verification_failed', 'verification_unknown',
];
