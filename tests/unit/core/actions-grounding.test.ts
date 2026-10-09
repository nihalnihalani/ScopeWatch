import { describe, expect, it } from 'vitest';
import type { ActionRecord, ProbeResult } from '../../../src/shared/contracts.js';
import {
  IllegalTransitionError, StaleVersionError, applyTransition, canTransition, recoveryVerdict, restrictionVerdict,
} from '../../../src/core/actions.js';
import { checkNarrative, type GroundingFacts } from '../../../src/core/grounding.js';

const probe = (role: 'target' | 'control', outcome: ProbeResult['outcome'], extra: Partial<ProbeResult> = {}): ProbeResult => ({
  role, provenance: 'native', launchId: 'l', nativeSessionId: 's', nativeEventIds: [], decision: outcome === 'refused_policy' ? 'DENY' : 'ALLOW',
  reasonCode: null, boundSubjectId: role === 'target' ? 'subj-t' : 'subj-c', credentialId: 'cred', inspection: 'test', outcome,
  startedAt: '2026-10-09T12:00:00Z', completedAt: null, ...extra,
});
const exp = { targetSubjectId: 'subj-t', controlSubjectId: 'subj-c' };

describe('restriction verdict matrix', () => {
  it('genuine target refusal + inspected control content => restriction_verified ONLY for native provenance', () => {
    expect(restrictionVerdict('native', probe('target', 'refused_policy'), probe('control', 'succeeded_expected'), exp).verdict).toBe('restriction_verified');
    expect(restrictionVerdict('contract_test', probe('target', 'refused_policy'), probe('control', 'succeeded_expected'), exp).verdict).toBe('simulated_restriction_observed');
    expect(restrictionVerdict('replay', probe('target', 'refused_policy'), probe('control', 'succeeded_expected'), exp).verdict).toBe('simulated_restriction_observed');
  });
  it('target success (including allowed) => restriction_failed regardless of control', () => {
    for (const o of ['succeeded_expected', 'succeeded_unexpected_content', 'allowed'] as const) {
      expect(restrictionVerdict('native', probe('target', o), probe('control', 'succeeded_expected'), exp).verdict, o).toBe('restriction_failed');
      expect(restrictionVerdict('native', probe('target', o), probe('control', 'failed'), exp).verdict, o).toBe('restriction_failed');
    }
  });
  it('both fail => continuity_failed; control without inspected content is a control failure', () => {
    expect(restrictionVerdict('native', probe('target', 'refused_policy'), probe('control', 'failed'), exp).verdict).toBe('continuity_failed');
    expect(restrictionVerdict('native', probe('target', 'refused_policy'), probe('control', 'succeeded_unexpected_content'), exp).verdict).toBe('continuity_failed');
    expect(restrictionVerdict('native', probe('target', 'failed'), probe('control', 'refused_other'), exp).verdict).toBe('continuity_failed');
  });
  it('target refused for another reason => policy_refusal_unproved', () => {
    expect(restrictionVerdict('native', probe('target', 'refused_other'), probe('control', 'succeeded_expected'), exp).verdict).toBe('policy_refusal_unproved');
    expect(restrictionVerdict('native', probe('target', 'failed'), probe('control', 'succeeded_expected'), exp).verdict).toBe('policy_refusal_unproved');
  });
  it('any missing probe => unknown (missing is neither success nor failure)', () => {
    expect(restrictionVerdict('native', null, probe('control', 'succeeded_expected'), exp).verdict).toBe('unknown');
    expect(restrictionVerdict('native', probe('target', 'refused_policy'), probe('control', 'missing'), exp).verdict).toBe('unknown');
    expect(restrictionVerdict('native', probe('target', 'missing'), probe('control', 'missing'), exp).verdict).toBe('unknown');
  });
  it('a refusal not bound to the approved subject, or lacking a DENY decision, is unknown', () => {
    expect(restrictionVerdict('native', probe('target', 'refused_policy', { boundSubjectId: 'other' }), probe('control', 'succeeded_expected'), exp).verdict).toBe('unknown');
    expect(restrictionVerdict('native', probe('target', 'refused_policy', { decision: null }), probe('control', 'succeeded_expected'), exp).verdict).toBe('unknown');
    expect(restrictionVerdict('native', probe('target', 'refused_policy'), probe('control', 'succeeded_expected', { boundSubjectId: 'wrong' }), exp).verdict).toBe('unknown');
  });
});

describe('recovery verdict (distinct predicate)', () => {
  it('requires BOTH target and control success; a refused target is not recovery', () => {
    expect(recoveryVerdict('native', probe('target', 'succeeded_expected'), probe('control', 'succeeded_expected'), exp).verdict).toBe('recovered');
    expect(recoveryVerdict('contract_test', probe('target', 'succeeded_expected'), probe('control', 'succeeded_expected'), exp).verdict).toBe('simulated_recovered');
    expect(recoveryVerdict('native', probe('target', 'refused_policy'), probe('control', 'succeeded_expected'), exp).verdict).toBe('recovery_failed');
    expect(recoveryVerdict('native', probe('target', 'succeeded_expected'), probe('control', 'failed'), exp).verdict).toBe('recovery_failed');
    expect(recoveryVerdict('native', probe('target', 'succeeded_expected'), probe('control', 'missing'), exp).verdict).toBe('unknown');
  });
});

const base: ActionRecord = {
  actionId: 'a1', caseId: 'c1', provenance: 'native', kind: 'restriction', version: 1, state: 'approved', caseRevision: 1, manifestSha256: 'x',
  scope: { workspaceId: 'w', policySubjectId: 's', credentialId: 'c', operation: 'o', resourceSelector: null, decision: 'DENY', residualCapability: [] },
  scopeDigest: 'd', approvedBy: 'op', approvedAt: '2026-10-09T12:00:00Z', rejectionReason: null, nativeReceipt: null, verifications: [], reversesActionId: null, history: [],
};

describe('action state machine and CAS', () => {
  it('bumps version, appends history, and does not mutate the input', () => {
    const next = applyTransition(base, 'native_application_observed', 'op', 'n', 1);
    expect(next.version).toBe(2);
    expect(next.history).toHaveLength(1);
    expect(base.version).toBe(1);
    expect(base.state).toBe('approved');
  });
  it('rejects a stale expected version', () => {
    expect(() => applyTransition({ ...base, version: 3 }, 'native_application_observed', 'op', 'n', 1)).toThrow(StaleVersionError);
  });
  it('rejects illegal jumps (approval cannot be verified without a native receipt; no auto-release)', () => {
    expect(() => applyTransition(base, 'restriction_verified', 'op', 'n', 1)).toThrow(IllegalTransitionError);
    expect(canTransition('restriction', 'approved', 'verification_pending')).toBe(false);
    expect(canTransition('restriction', 'native_application_observed', 'verification_pending')).toBe(true);
    expect(canTransition('restriction', 'restriction_verified', 'recovered' as never)).toBe(false);
    expect(canTransition('recovery', 'review_ready', 'removal_observed')).toBe(false);
    expect(canTransition('recovery', 'removal_observed', 'verification_pending')).toBe(true);
  });
  it('stale approvals only move on to disputed_stale_application when a receipt arrives', () => {
    expect(canTransition('restriction', 'stale', 'native_application_observed')).toBe(false);
    expect(canTransition('restriction', 'stale', 'disputed_stale_application')).toBe(true);
  });
  it('failed/unknown verification can be retried with fresh probes; verified cannot silently revert', () => {
    expect(canTransition('restriction', 'verification_failed', 'verification_pending')).toBe(true);
    expect(canTransition('restriction', 'verification_unknown', 'verification_pending')).toBe(true);
    expect(canTransition('restriction', 'restriction_verified', 'approved')).toBe(false);
    expect(canTransition('restriction', 'restriction_verified', 'disputed')).toBe(true);
  });
});

describe('grounding', () => {
  const facts: GroundingFacts = {
    numbers: new Set(['21', '20', '30', '1', '5', '600']), ids: new Set(['subj-ticketassist', 'ts-1', 'ws-harbordesk']), primaryCount: '21',
    primaryAllowance: '20', primarySubjectId: 'subj-ticketassist',
  };
  it('accepts a narrative whose quantities and identifiers all match stored facts', () => {
    const r = checkNarrative('subj-ticketassist made 21 unique ALLOW decisions across 5 sessions, above its allowance of 20. Session ts-1 contributed.', facts);
    expect(r.checks.filter((c) => !c.ok)).toEqual([]);
    expect(r.grounded).toBe(true);
  });
  it('flags invented quantities and identifiers', () => {
    const r = checkNarrative('subj-ticketassist made 21 approvals but also stole 99 records via session ts-77 and agent ghost-agent-9.', facts);
    expect(r.grounded).toBe(false);
    expect(r.checks.filter((c) => !c.ok).map((c) => c.claim).join('|')).toMatch(/99/);
    expect(r.checks.some((c) => !c.ok && c.claim.includes('ts-77'))).toBe(true);
  });
  it('a narrative that never states the stored count or subject is not grounded', () => {
    expect(checkNarrative('Looks suspicious.', facts).grounded).toBe(false);
  });
});
