/** Case recording and CaseDetail assembly from stored journal facts. */
import type {
  ActionRecord,
  BindingState,
  ScopeDigestInput,
  SessionEvidence,
  CandidateKey,
  CandidateResult,
  CaseDetail,
  CaseSummary,
  EvaluationReceipt,
  GenerationReceipt,
  PinnedManifest,
  ProposedScope,
  Provenance,
  TimelineEntry,
} from '../../shared/contracts.js';
import { cmp, sha256Hex } from '../../core/hash.js';
import { canonicalize } from '../../core/canonicalize.js';
import { scopeDigestInput } from '../../shared/contracts.js';
import { parseUtcNano } from '../../core/time.js';
import type { CaseRow, GenerationRow, Journal } from '../../storage/journal.js';
import { ACTIVE_RESTRICTION } from '../../core/actions.js';
import { notFound } from './errors.js';

export const RESIDUAL_CAPABILITY = [
  'Other operations on the same credential remain permitted.',
  'Other credentials and integrations of the same subject remain permitted.',
  'Calls already permitted and in-flight work before the native rule applies are not undone.',
  'Stop/archive/pause/global revoke are different controls and are not selective-DENY substitutes.',
];

export function caseIdFor(provenance: Provenance, manifestSha: string, primary: CandidateKey | null): string {
  const k = primary ? [primary.workspaceId, primary.policySubjectId, primary.credentialId, primary.operation].join('\u0000') : 'no-breach';
  return `case-${sha256Hex(`${provenance}|${manifestSha}|${k}`).slice(0, 12)}`;
}

export function proposedScopeFor(primary: CandidateKey | null): ProposedScope | null {
  if (!primary) return null;
  return {
    workspaceId: primary.workspaceId,
    policySubjectId: primary.policySubjectId,
    credentialId: primary.credentialId,
    operation: primary.operation,
    resourceSelector: null,
    decision: 'DENY',
    residualCapability: RESIDUAL_CAPABILITY,
  };
}

function uncertaintyFor(provenance: Provenance, gen: GenerationRow, manifest: PinnedManifest, ev: EvaluationReceipt, cohortSessions: number): string[] {
  const out: string[] = [];
  if (provenance === 'replay') out.push('SYNTHETIC REPLAY FIXTURE: facts were declared by a seed file, not collected from Guild. This is not native evidence and is not action eligible.');
  if (provenance === 'contract_test') out.push('CONTRACT TEST: facts came through the adapter against a loopback mock Guild API built from the documented schema. Not evidence of any account behavior.');
  out.push(`Counts cover the registered finite cohort of ${cohortSessions} sessions captured at ${ev.captureCutoff}. Native finality is not proved: later delivery creates a new generation.`);
  if (gen.identityDomainStatus === 'declared_fixture') out.push('The native identity domain is a fixture declaration, not native proof.');
  if (gen.identityDomainStatus === 'verified') out.push('Identity domain is operator-declared (no native proof reference recorded); it is not independently verified by this application.');
  out.push(`Counted unit: ${manifest.document.unit}; clock: ${manifest.document.clock}. Window is (T-600s, T] truncated at the manifest effective start.`);
  const primary = ev.candidates.find((c) => ev.primary && c.policySubjectId === ev.primary.policySubjectId);
  if (primary?.firstCrossing && BigInt(primary.currentCount) <= BigInt(primary.allowance)) {
    out.push(`Current-window count (${primary.currentCount}) is not above the allowance, but the historical crossing at ${primary.firstCrossing.anchor} is preserved. Falling counts never authorize release.`);
  }
  if (ev.breachedKeys.length > 1) out.push(`${ev.breachedKeys.length} candidates crossed; the primary is chosen by first crossing, then excess, then ids (a convention, not a severity score).`);
  out.push('Proposed scope covers the credential+operation for the verified subject. A resource/method selector is not verified, so none is proposed and the whole operation is included.');
  return out;
}

/** Create the case or append a revision for a freshly evaluated generation. */
export function recordCase(journal: Journal, gen: GenerationRow, manifest: PinnedManifest, ev: EvaluationReceipt, cohortSessions: number): { caseId: string; revision: number } {
  const caseId = caseIdFor(gen.provenance, manifest.sha256, ev.primary);
  const cur = journal.getCase(caseId);
  const primaryCand = ev.primary ? ev.candidates.find((c) => c.policySubjectId === ev.primary?.policySubjectId) : undefined;
  const revision = journal.saveCaseRevision({
    caseId,
    provenance: gen.provenance,
    expectedRevision: cur?.revision ?? 0,
    generationId: gen.generationId,
    evaluationId: ev.evaluationId,
    manifestSha256: manifest.sha256,
    evidenceState: ev.primary ? 'review_ready' : 'no_breach',
    primary: ev.primary,
    primaryLabel: primaryCand?.displayLabel ?? null,
    uncertainty: uncertaintyFor(gen.provenance, gen, manifest, ev, cohortSessions),
  });
  return { caseId, revision };
}

export function toSummary(c: CaseRow): CaseSummary {
  return {
    caseId: c.caseId, revision: c.revision, provenance: c.provenance, evidenceState: c.evidenceState, actionState: c.actionState,
    primary: c.primary, primaryLabel: c.primaryLabel, createdAt: c.createdAt, updatedAt: c.updatedAt,
  };
}

export function listSummaries(journal: Journal): CaseSummary[] {
  return journal.listCases().map(toSummary);
}

export function scopeDigestOf(
  provenance: Provenance,
  caseId: string,
  caseRevision: number,
  manifestSha256: string,
  scope: ProposedScope,
  intendedMutation: ScopeDigestInput['intendedMutation'],
): { input: ScopeDigestInput; digest: string } {
  const input = scopeDigestInput({
    provenance, caseId, caseRevision, manifestSha256, workspaceId: scope.workspaceId, policySubjectId: scope.policySubjectId,
    credentialId: scope.credentialId, operation: scope.operation, resourceSelector: scope.resourceSelector, intendedMutation,
  });
  return { input, digest: sha256Hex(JSON.stringify(input)) };
}

const SESSION_KEY_CAP = 50;

export function buildSessionEvidence(journal: Journal, gen: GenerationRow, manifest: PinnedManifest): SessionEvidence[] {
  const canon = canonicalize(journal.getObservations(gen.generationId));
  const bindings = journal.getBindings(gen.generationId);
  const subjects = new Set(manifest.document.allowances.map((a) => a.policySubjectId));
  const bindByKey = new Map(bindings.map((b) => [b.nativeIdentityKey, b]));
  const obs = journal.getObservations(gen.generationId);
  return journal.getCoverage(gen.generationId).map((c) => {
    const facts = canon.facts.filter((f) => f.obs.sessionId === c.sessionId && f.obs.workspaceId === c.workspaceId);
    const states: Record<BindingState, number> = { verified: 0, unresolved: 0, conflict: 0 };
    const methods = new Set<string>();
    const proofs: string[] = [];
    const keys: string[] = [];
    for (const f of facts) {
      const b = bindByKey.get(f.nativeIdentityKey);
      if (!b) continue;
      states[b.bindingState]++;
      methods.add(b.mappingMethod);
      if (proofs.length < 5) proofs.push(b.proofRef);
      if (f.obs.decision === 'ALLOW' && b.bindingState === 'verified' && b.policySubjectId !== null && subjects.has(b.policySubjectId)) keys.push(f.nativeIdentityKey);
    }
    keys.sort(cmp);
    return {
      sessionId: c.sessionId, workspaceId: c.workspaceId, coverageState: c.coverageState, policySubjectId: c.launchSubjectId,
      bindingStates: states, mappingMethods: [...methods].sort(cmp), proofRefs: proofs, identityKeys: keys.slice(0, SESSION_KEY_CAP),
      identityKeyTotal: keys.length, pageRefs: [...new Set(obs.filter((o) => o.sessionId === c.sessionId).map((o) => o.pageRef))].sort(cmp).slice(0, 10),
      completionRef: c.completionRef,
    };
  });
}

function receiptOf(g: GenerationRow): GenerationReceipt {
  const { scenarioId: _s, identityDomainStatus: _i, createdAt: _c, ...r } = g;
  return r;
}

export function actionBlockedReason(journal: Journal, c: CaseRow, gen: GenerationRow): string | null {
  if (c.provenance === 'replay') return 'Replay cases are synthetic fixtures and are not action eligible; no native action can be approved from a replay case.';
  if (c.evidenceState === 'evidence_disputed') return 'Evidence is disputed by a later integrity conflict; resolve it before any further action.';
  const sup = journal.supersededBy(c.caseId);
  if (sup) return `Superseded: newer generation ${sup.generationId} (${sup.state}) exists for this manifest; this case no longer reflects the latest evidence. Re-run and review the newest result.`;
  if (!c.primary) return 'No candidate crossed its allowance; there is nothing to restrict.';
  if (gen.state !== 'evaluated') return `Generation is ${gen.state}, not evaluated.`;
  const active = journal.listActions(c.caseId).find((a) => a.kind === 'restriction' && a.caseRevision === c.revision && ACTIVE_RESTRICTION.includes(a.state as never));
  if (active) return `An action is already ${active.state.replaceAll('_', ' ')} for this revision.`;
  return null;
}

export function buildTimeline(detail: Pick<CaseDetail, 'evaluation' | 'investigation' | 'actions' | 'provenance'>, history: ReturnType<Journal['listHistory']>): TimelineEntry[] {
  const out: TimelineEntry[] = [];
  const prov = detail.provenance;
  const ev = detail.evaluation;
  const primary = ev.candidates.find((c) => ev.primary && c.policySubjectId === ev.primary.policySubjectId);
  if (primary?.firstCrossing) {
    out.push({ at: primary.firstCrossing.anchor, kind: 'first_crossing', title: `First crossing: ${primary.displayLabel} reached ${primary.firstCrossing.count} (allowance ${primary.allowance})`, detail: `${primary.firstCrossing.sessions.length} sessions contributed; window (T-600s, T].`, provenance: prov, ref: primary.firstCrossing.queryId });
    for (const s of primary.firstCrossing.sessions) out.push({ at: primary.firstCrossing.anchor, kind: 'session', title: `Session ${s.sessionId}: ${s.count} counted ALLOW identities`, detail: '', provenance: prov, ref: s.sessionId });
  }
  if (primary?.peakWitness) out.push({ at: primary.peakWitness.anchor, kind: 'peak', title: `Peak: ${primary.peakCount} within one window`, detail: `current count at cutoff: ${primary.currentCount}`, provenance: prov, ref: primary.peakWitness.queryId });
  out.push({ at: ev.evaluatedAt, kind: 'query', title: `${ev.queries.length} ClickHouse queries executed`, detail: `oracle agrees: ${ev.oracleAgrees}; anchors evaluated: ${ev.anchors.length}`, provenance: prov, ref: ev.evaluationId });
  if (detail.investigation) out.push({ at: detail.investigation.updatedAt, kind: 'investigation', title: `Investigation ${detail.investigation.state}`, detail: detail.investigation.unavailableReason ?? '', provenance: prov, ref: detail.investigation.investigationId });
  for (const a of detail.actions) {
    for (const h of a.history) out.push({ at: h.at, kind: a.kind === 'recovery' ? 'recovery' : h.to.includes('disputed') ? 'dispute' : 'review', title: `${a.kind} action ${h.from} -> ${h.to}`, detail: `${h.by}: ${h.note}`, provenance: prov, ref: a.actionId });
    if (a.nativeReceipt) out.push({ at: a.nativeReceipt.recordedAt, kind: 'native_application', title: `Operator recorded native application (${a.nativeReceipt.method})`, detail: a.nativeReceipt.matchesApprovedScope ? 'matches approved scope' : `mismatch: ${a.nativeReceipt.mismatches.join('; ')}`, provenance: prov, ref: a.actionId });
    for (const v of a.verifications) out.push({ at: v.verifiedAt, kind: 'verification', title: `Verification verdict: ${v.verdict}`, detail: v.explanation, provenance: prov, ref: v.verificationId });
  }
  for (const h of history) out.push({ at: h.at, kind: 'review', title: `${h.entity}: ${h.from} -> ${h.to}`, detail: `${h.by}: ${h.note}`, provenance: prov, ref: null });
  return out.sort((a, b) => {
    const x = parseUtcNano(a.at);
    const y = parseUtcNano(b.at);
    return x < y ? -1 : x > y ? 1 : 0;
  });
}

export function buildCaseDetail(journal: Journal, caseId: string): CaseDetail {
  const c = journal.getCase(caseId);
  if (!c) throw notFound('case');
  const rev = journal.getCaseRevision(caseId, c.revision);
  const gen = journal.getGeneration(c.generationId);
  const ev = journal.getEvaluation(c.evaluationId);
  const readiness = journal.getReadiness(c.generationId);
  const manifest = gen ? journal.getManifest(gen.manifestId) : null;
  if (!rev || !gen || !ev || !readiness || !manifest) throw new Error(`case ${caseId} references missing journal rows`);
  const actions: ActionRecord[] = journal.listActions(caseId);
  const investigation = journal.latestInvestigation(caseId);
  const base = { provenance: c.provenance, evaluation: ev, investigation, actions };
  const scope = proposedScopeFor(c.primary);
  const dg = scope ? scopeDigestOf(c.provenance, c.caseId, c.revision, manifest.sha256, scope, 'add_deny_rule') : null;
  return {
    ...toSummary(c),
    generation: receiptOf(gen),
    readiness,
    manifest,
    evaluation: ev,
    candidates: ev.candidates as CandidateResult[],
    uncertainty: rev.uncertainty,
    investigation,
    proposedScope: scope,
    proposedScopeDigestInput: dg?.input ?? null,
    proposedScopeDigest: dg?.digest ?? null,
    sessions: buildSessionEvidence(journal, gen, manifest),
    actions,
    timeline: buildTimeline(base, journal.listHistory(caseId)),
    actionBlockedReason: actionBlockedReason(journal, c, gen),
  };
}
