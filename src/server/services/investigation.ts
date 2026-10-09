/**
 * Hosted investigation via GuildPort. The investigator receives compact pinned facts only (no controller/admin keys).
 * Narrative is untrusted text, checked against stored facts; it is never authority for scope.
 */
import { randomBytes } from 'node:crypto';
import type { CaseDetail, InvestigationReceipt } from '../../shared/contracts.js';
import type { InvestigationContext } from '../../shared/ports.js';
import { canonicalJson, sha256Hex } from '../../core/hash.js';
import { checkNarrative, type GroundingFacts } from '../../core/grounding.js';
import { nowUtcNano } from '../../core/time.js';
import { buildCaseDetail } from './cases.js';
import type { Services } from './context.js';
import { notFound, staleRevision } from './errors.js';

export function groundingFactsOf(d: CaseDetail): { facts: Record<string, unknown>; grounding: GroundingFacts } | null {
  const primary = d.candidates.find((c) => d.primary && c.policySubjectId === d.primary.policySubjectId);
  if (!primary) return null;
  const numbers = new Set<string>(['600']);
  const ids = new Set<string>([d.primary?.workspaceId ?? '', primary.policySubjectId, primary.credentialId, primary.operation, d.caseId, d.manifest.sha256]);
  for (const c of d.candidates) {
    for (const n of [c.allowance, c.currentCount, c.peakCount]) numbers.add(n);
    ids.add(c.policySubjectId);
    ids.add(c.displayLabel);
    for (const w of [c.firstCrossing, c.peakWitness]) {
      if (!w) continue;
      numbers.add(w.count);
      numbers.add((BigInt(w.count) - BigInt(w.allowance)).toString());
      w.identityKeys.forEach((k) => ids.add(k));
      w.sessions.forEach((s) => {
        ids.add(s.sessionId);
        numbers.add(s.count);
      });
      numbers.add(String(w.sessions.length));
    }
  }
  numbers.add(String(d.readiness.cohortSessions));
  const facts = {
    caseId: d.caseId,
    caseRevision: d.revision,
    provenance: d.provenance,
    manifestSha256: d.manifest.sha256,
    window: '(T-600s, T] truncated at manifest effective start',
    primary: {
      policySubjectId: primary.policySubjectId, label: primary.displayLabel, credentialId: primary.credentialId, operation: primary.operation,
      allowance: primary.allowance, firstCrossing: primary.firstCrossing, peakCount: primary.peakCount, currentCount: primary.currentCount,
    },
    otherCandidates: d.candidates.filter((c) => c !== primary).map((c) => ({ policySubjectId: c.policySubjectId, label: c.displayLabel, allowance: c.allowance, peakCount: c.peakCount, currentCount: c.currentCount, breached: c.breached })),
    uncertainty: d.uncertainty,
  };
  return { facts, grounding: { numbers, ids, primaryCount: primary.firstCrossing?.count ?? primary.peakCount, primaryAllowance: primary.allowance, primarySubjectId: primary.policySubjectId } };
}

export async function investigateCase(svc: Services, caseId: string, expectedRevision: number): Promise<CaseDetail> {
  const j = svc.journal;
  const c = j.getCase(caseId);
  if (!c) throw notFound('case');
  if (c.revision !== expectedRevision) throw staleRevision(`case is at revision ${c.revision}, request was for ${expectedRevision}`);
  const detail = buildCaseDetail(j, caseId);
  const base = { investigationId: `inv-${randomBytes(6).toString('hex')}`, caseId, caseRevision: c.revision, provenance: c.provenance };
  const mk = (r: Partial<InvestigationReceipt>): InvestigationReceipt => ({
    ...base, state: 'not_started', contextSha256: '', nativeSessionId: null, nativeTaskId: null, contextReadRef: null, incidentUrl: null, narrative: null,
    grounded: null, checks: [], unavailableReason: null, updatedAt: nowUtcNano(), ...r,
  });
  const gf = groundingFactsOf(detail);

  if (c.provenance === 'replay' || !svc.guild || !gf) {
    const reason = c.provenance === 'replay'
      ? 'Replay mode has no hosted investigator: no model was run and no narrative exists. This is not model output.'
      : !svc.guild ? 'Guild adapter is not configured; the hosted investigator is unavailable (never faked).' : 'No primary candidate to investigate.';
    j.saveInvestigation(mk({ state: 'unavailable', unavailableReason: reason }));
    return buildCaseDetail(j, caseId);
  }

  const ref = `inv-${caseId}-r${c.revision}`;
  const prior = j.getIntentByRef(ref);
  let useRef = ref;
  if (prior) {
    if (prior.outcome === 'succeeded') return detail;
    if (prior.outcome === 'pending' || prior.outcome === 'unknown') {
      // reconcile before any retry: never create a second incident blindly
      const found = await svc.guild.reconcileLaunch(ref).catch(() => null);
      if (found) {
        j.resolveIntent(prior.intentId, 'reconciled', `prior launch found as session ${found.nativeSessionId ?? 'unknown'}`);
        j.saveInvestigation(mk({ state: 'create_unknown', nativeSessionId: found.nativeSessionId, unavailableReason: 'A prior launch exists natively; its outcome could not be read. Inspect it in Guild before retrying.' }));
        return buildCaseDetail(j, caseId);
      }
      j.resolveIntent(prior.intentId, 'reconciled', 'reconciliation found no prior launch; retrying with a new reference');
      useRef = `${ref}-retry${Date.now().toString(36)}`;
    } else useRef = `${ref}-retry${Date.now().toString(36)}`;
  }
  const ctx: InvestigationContext = {
    caseId, caseRevision: c.revision, contextSha256: sha256Hex(canonicalJson(gf.facts)), facts: gf.facts, manifestRef: detail.manifest.immutableRef,
    ownedRepo: svc.config.guild.ownedRepo ?? '', idempotencyRef: useRef,
  };
  const intent = j.createIntent({ idempotencyRef: useRef, kind: 'investigation_launch', relatedId: caseId, detail: `case ${caseId} revision ${c.revision}` }, c.provenance);
  let rec: InvestigationReceipt;
  try {
    const r = await svc.guild.runInvestigation(ctx);
    const check = r.narrative ? checkNarrative(r.narrative, gf.grounding) : { grounded: false, checks: [] };
    rec = { ...r, investigationId: base.investigationId, caseId, caseRevision: c.revision, provenance: c.provenance, contextSha256: ctx.contextSha256, grounded: r.narrative ? check.grounded : null, checks: check.checks, updatedAt: nowUtcNano() };
    j.resolveIntent(intent.intentId, r.state === 'created' ? 'succeeded' : r.state === 'create_unknown' ? 'unknown' : 'failed', `investigation ${r.state}`);
  } catch (e) {
    j.resolveIntent(intent.intentId, 'unknown', `call failed or timed out: ${(e as Error).message.slice(0, 200)}`);
    rec = mk({ state: 'create_unknown', contextSha256: ctx.contextSha256, unavailableReason: `investigation call outcome unknown: ${(e as Error).message.slice(0, 200)}` });
  }
  j.saveInvestigation(rec);
  return buildCaseDetail(j, caseId);
}
