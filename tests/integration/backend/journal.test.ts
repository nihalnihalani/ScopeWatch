import { describe, expect, it } from 'vitest';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Journal, JournalError, StaleCaseRevisionError } from '../../../src/storage/journal.js';
import { StaleVersionError, applyTransition } from '../../../src/core/actions.js';
import type { ActionRecord } from '../../../src/shared/contracts.js';
import { T0, build, manifestDoc, pinned, run } from '../../unit/core/fixtures.js';
import { seedCase, services } from './support.js';

const act = (caseId: string): ActionRecord => ({
  actionId: 'act-1', caseId, provenance: 'contract_test', kind: 'restriction', version: 1, state: 'approved', caseRevision: 1, manifestSha256: 'm',
  scope: { workspaceId: 'w', policySubjectId: 's', credentialId: 'c', operation: 'o', resourceSelector: null, decision: 'DENY', residualCapability: [] },
  scopeDigest: 'd', approvedBy: 'op', approvedAt: '2026-10-09T12:00:00Z', rejectionReason: null, nativeReceipt: null, verifications: [], reversesActionId: null, history: [],
});

describe('journal authority', () => {
  it('action CAS: a second writer holding a stale version is rejected and nothing is overwritten', () => {
    const svc = services('contract_test');
    const { caseId } = seedCase(svc);
    const j = svc.journal;
    j.createAction(act(caseId));
    const a = j.getAction('act-1')!;
    const first = applyTransition(a, 'native_application_observed', 'op1', 'first', 1);
    j.casAction(first, 1);
    const second = applyTransition(a, 'scope_mismatch', 'op2', 'second', 1); // built from the same stale read
    expect(() => j.casAction(second, 1)).toThrow(StaleVersionError);
    const cur = j.getAction('act-1')!;
    expect(cur.state).toBe('native_application_observed');
    expect(cur.version).toBe(2);
  });

  it('case revision CAS: appending with a wrong expected revision fails', () => {
    const svc = services('contract_test');
    const { caseId, generationId } = seedCase(svc);
    const g = svc.journal.getGeneration(generationId)!;
    expect(() =>
      svc.journal.saveCaseRevision({ caseId, provenance: 'contract_test', expectedRevision: 5, generationId, evaluationId: `eval-${generationId}`, manifestSha256: g.manifestSha256, evidenceState: 'review_ready', primary: null, primaryLabel: null, uncertainty: [] }),
    ).toThrow(StaleCaseRevisionError);
  });

  it('a new case revision marks pre-effect approvals stale but does not touch applied effects', () => {
    const svc = services('contract_test');
    const { caseId } = seedCase(svc);
    const j = svc.journal;
    j.createAction(act(caseId));
    expect(seedCase(svc).revision).toBe(2);
    expect(j.getAction('act-1')!.state).toBe('stale');

    const svc2 = services('contract_test');
    const c2 = seedCase(svc2);
    svc2.journal.createAction({ ...act(c2.caseId), state: 'native_application_observed' });
    seedCase(svc2);
    expect(svc2.journal.getAction('act-1')!.state).toBe('native_application_observed'); // effect receipts are preserved
  });

  it('a late conflict disputes applied effects without removing them', () => {
    const svc = services('contract_test');
    const { caseId, generationId } = seedCase(svc);
    const j = svc.journal;
    const sha = j.getGeneration(generationId)!.manifestSha256;
    j.createAction({ ...act(caseId), state: 'restriction_verified', manifestSha256: sha });
    expect(j.markEffectActionsDisputed(sha, 'late conflict')).toEqual(['act-1']);
    expect(j.getAction('act-1')!.state).toBe('disputed');
    expect(j.getCase(caseId)!.evidenceState).toBe('evidence_disputed');
  });

  it('refuses rows whose provenance differs from the journal mode, and refuses opening a file as another mode', () => {
    const j = new Journal(':memory:', 'replay');
    expect(() => j.saveManifest(pinned(manifestDoc([['a', 'A', '1']]), 'native'))).toThrow(JournalError);
    const dir = mkdtempSync(join(tmpdir(), 'sw-j-'));
    const p = join(dir, 'x.sqlite');
    new Journal(p, 'replay').close();
    expect(() => new Journal(p, 'native')).toThrow(/belongs to mode replay/);
  });

  it('a sealed generation accepts no more rows and generation states only move forward', () => {
    const svc = services('replay');
    const { generationId } = seedCase(svc);
    const j = svc.journal;
    const extra = build(generationId, run('late', 'subj-a', ['s1'], 1, T0, 1), ['s1']);
    expect(() => j.addObservations(generationId, extra.observations)).toThrow(/expected collecting/);
    expect(() => j.advanceGeneration(generationId, 'evaluated', 'sealed')).toThrow(JournalError);
    expect(() => j.advanceGeneration(generationId, 'sealed', 'evaluated')).toThrow(JournalError);
  });

  it('external intents are recorded with a unique idempotency reference before any call', () => {
    const j = new Journal(':memory:', 'contract_test');
    const i = j.createIntent({ idempotencyRef: 'ref-1', kind: 'probe_launch', relatedId: 'x', detail: '' }, 'contract_test');
    expect(i.outcome).toBe('pending');
    expect(() => j.createIntent({ idempotencyRef: 'ref-1', kind: 'probe_launch', relatedId: 'x', detail: '' }, 'contract_test')).toThrow();
    j.resolveIntent(i.intentId, 'unknown', 'timeout');
    expect(j.getIntentByRef('ref-1')!.outcome).toBe('unknown');
  });

  it('operator sessions expire', () => {
    const j = new Journal(':memory:', 'replay');
    const s = j.createOperatorSession('op', -1000);
    expect(j.getOperatorSession(s.sessionId)).toBeNull();
    const live = j.createOperatorSession('op');
    expect(j.getOperatorSession(live.sessionId)?.csrf).toBe(live.csrf);
  });
});
