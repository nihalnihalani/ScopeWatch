// TEST DATA ONLY: representative DTO objects built for component tests. Not evidence, not API output.
import type { ActionRecord, CandidateResult, CaseDetail, Provenance, StatusReport, SessionInfo } from '../../../src/shared/contracts.js';

const T0 = '2026-10-09T18:00:00.000000000Z';

export function candidate(over: Partial<CandidateResult> & Pick<CandidateResult, 'policySubjectId' | 'displayLabel'>): CandidateResult {
  return {
    workspaceId: 'ws-test',
    credentialId: 'cred-test',
    operation: 'repo.read',
    allowance: '40',
    currentCount: '0',
    peakCount: '0',
    peakWitness: null,
    firstCrossing: null,
    breached: false,
    readiness: 'ready',
    ...over,
  };
}

export function makeDetail(over: Partial<CaseDetail> = {}, provenance: Provenance = 'native'): CaseDetail {
  const breached = candidate({
    policySubjectId: 'subj-breach',
    displayLabel: 'Fixture Workload Alpha',
    allowance: '40',
    currentCount: '0',
    peakCount: '62',
    breached: true,
    firstCrossing: { anchor: '2026-10-09T18:03:10.000000000Z', anchorNs: '1', count: '41', allowance: '40', identityKeys: ['ik-1', 'ik-2'], sessions: [{ sessionId: 'sess-a', count: '25' }, { sessionId: 'sess-b', count: '16' }], queryId: 'q-w' },
    peakWitness: { anchor: '2026-10-09T18:05:00.000000000Z', anchorNs: '2', count: '62', allowance: '40', identityKeys: ['ik-1'], sessions: [{ sessionId: 'sess-a', count: '40' }, { sessionId: 'sess-b', count: '22' }], queryId: 'q-w2' },
  });
  const control = candidate({ policySubjectId: 'subj-control', displayLabel: 'Fixture Workload Beta', allowance: '120', currentCount: '90', peakCount: '95' });
  const primaryKey = { workspaceId: 'ws-test', policySubjectId: 'subj-breach', credentialId: 'cred-test', operation: 'repo.read' };
  const scope = { workspaceId: 'ws-test', policySubjectId: 'subj-breach', credentialId: 'cred-test', operation: 'repo.read', resourceSelector: null, decision: 'DENY' as const, residualCapability: ['Other operations on cred-test'] };
  return {
    caseId: 'case-test-1',
    revision: 3,
    provenance,
    evidenceState: 'review_ready',
    actionState: 'review_ready',
    primary: primaryKey,
    primaryLabel: 'Fixture Workload Alpha',
    createdAt: T0,
    updatedAt: T0,
    generation: { generationId: 'gen-test-1', provenance, state: 'evaluated', manifestId: 'm1', manifestSha256: 'a'.repeat(64), captureCutoff: T0, rawCount: 10, canonicalKeyCount: 10, semanticDigest: 'b'.repeat(64), bindingDigest: 'c'.repeat(64), coverageDigest: 'd'.repeat(64), manifestDigest: 'e'.repeat(64), sealedAt: T0, insertAckAt: T0, readback: null, parentGenerationId: null },
    readiness: { generationId: 'gen-test-1', ready: true, gaps: [], cohortSessions: 2, completeSessions: 2, canonicalKeys: 10, conflictKeys: 0 },
    manifest: {} as CaseDetail['manifest'],
    evaluation: {
      evaluationId: 'ev1', generationId: 'gen-test-1', manifestSha256: 'a'.repeat(64), provenance, anchors: [], captureCutoff: T0, candidates: [breached, control], breachedKeys: [primaryKey], primary: primaryKey, oracleAgrees: true, oracleMismatches: [],
      queries: [{ queryId: 'q-test-1', queryClass: 'anchor_all_candidates', sqlSha256: 'f'.repeat(64), sqlVersion: 'v1', params: { windowSeconds: '600' }, rowCount: 2, outputSha256: '1'.repeat(64), clientMs: 12, serverMs: 4, executedAt: T0, target: 'clickhouse_local', database: 'scopewatch', serverVersion: '25.0.0' }],
      evaluatedAt: T0,
    },
    candidates: [breached, control],
    uncertainty: [],
    investigation: null,
    proposedScope: scope,
    proposedScopeDigestInput: { provenance, caseId: 'case-test-1', caseRevision: 3, manifestSha256: 'a'.repeat(64), workspaceId: 'ws-test', policySubjectId: 'subj-breach', credentialId: 'cred-test', operation: 'repo.read', resourceSelector: null, intendedMutation: 'add_deny_rule' },
    proposedScopeDigest: '7'.repeat(64),
    sessions: [{ sessionId: 'sess-a', workspaceId: 'ws-test', coverageState: 'complete', policySubjectId: 'subj-breach', bindingStates: { verified: 25, unresolved: 0, conflict: 0 }, mappingMethods: ['task_graph:fixture'], proofRefs: ['proof-1'], identityKeys: ['ik-1', 'ik-2'], identityKeyTotal: 2, pageRefs: ['page-1'], completionRef: 'done-1' }],
    actions: [],
    timeline: [{ at: '2026-10-09T18:03:10.000000000Z', kind: 'first_crossing', title: 'Allowance crossed', detail: '41 of 40', provenance, ref: null }, { at: '2026-10-09T18:01:00.000000000Z', kind: 'session', title: 'Session sess-a completed', detail: 'bound via fixture task graph', provenance, ref: 'sess-a' }],
    actionBlockedReason: null,
    ...over,
  };
}

export function makeAction(over: Partial<ActionRecord> = {}): ActionRecord {
  return { actionId: 'act-1', caseId: 'case-test-1', provenance: 'native', kind: 'restriction', version: 2, state: 'approved', caseRevision: 3, manifestSha256: 'a'.repeat(64), scope: makeDetail().proposedScope!, scopeDigest: '9'.repeat(64), approvedBy: 'maya', approvedAt: T0, rejectionReason: null, nativeReceipt: null, verifications: [], reversesActionId: null, history: [], ...over };
}

export function makeStatus(over: Partial<StatusReport> = {}): StatusReport {
  return { mode: 'native', modeLabel: 'native', serverTime: '2026-10-09T18:10:00.000000000Z', clickhouse: { status: 'ok', target: 'local', version: '25.0.0', detail: 'ok' }, guild: { status: 'ok', baseUrl: null, detail: 'ok', missing: [] }, journal: { status: 'ok', path: '/x', detail: 'ok' }, lastCaptureAt: null, lastEvaluationAt: null, nativeGates: [], ...over };
}

export function makeSession(over: Partial<SessionInfo> = {}): SessionInfo {
  return { authenticated: true, operator: 'maya', csrfToken: 'csrf-test', mode: 'native', ...over };
}
