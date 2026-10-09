/**
 * Review, native-application receipt, verification and recovery. Local CAS never claims to stop external admins:
 * a receipt re-checks the CURRENT case revision and the observed selectors against the approved scope, and keeps
 * disputed / unknown effects instead of normalizing them.
 */
import { randomBytes } from 'node:crypto';
import type {
  ActionRecord,
  CaseDetail,
  NativeApplicationReceipt,
  ProbeResult,
  ProposedScope,
  VerificationReceipt,
} from '../../shared/contracts.js';
import { RECEIPT_ACCEPTING_STATES } from '../../shared/contracts.js';
import type { NativeReceiptBody, RemovalReceiptBody, ReviewBody } from '../../shared/api.js';
import {
  ACTIVE_RESTRICTION,
  EFFECT_POSSIBLE,
  IllegalTransitionError,
  StaleVersionError,
  applyTransition,
  recoveryStateFor,
  recoveryVerdict,
  restrictionStateFor,
  restrictionVerdict,
} from '../../core/actions.js';
import { nowUtcNano, tryParseUtcNano } from '../../core/time.js';
import { actionBlockedReason, buildCaseDetail, proposedScopeFor, scopeDigestOf } from './cases.js';
import type { Services } from './context.js';
import { HttpError, conflict, invalid, notEligible, notFound, staleRevision, unavailable } from './errors.js';

const newActionId = () => `act-${randomBytes(6).toString('hex')}`;

function wrapStale<T>(fn: () => T): T {
  try {
    return fn();
  } catch (e) {
    if (e instanceof StaleVersionError) throw staleRevision(`${e.message}; reload the action before retrying`);
    if (e instanceof IllegalTransitionError) throw conflict(e.message);
    throw e;
  }
}

export function selectorText(s: ProposedScope['resourceSelector']): string | null {
  return s === null ? null : `repos=${[...s.repos].sort().join(',')};methods=${[...s.methods].sort().join(',')}`;
}

/** Operator approves/rejects a case revision. Scope is resolved from stored facts only; browser supplies no scope. */
export function reviewCase(svc: Services, caseId: string, body: ReviewBody, operator: string): CaseDetail {
  const j = svc.journal;
  return j.tx(() => {
    const c = j.getCase(caseId);
    if (!c) throw notFound('case');
    if (c.provenance === 'replay') {
      throw notEligible('Replay cases are synthetic fixtures and are not action eligible. Nothing was recorded.');
    }
    if (body.expectedRevision !== c.revision) throw staleRevision(`case is at revision ${c.revision}, review was for ${body.expectedRevision}`);
    const gen = j.getGeneration(c.generationId);
    if (!gen) throw new Error('generation missing');
    const manifest = j.getManifest(gen.manifestId);
    if (!manifest) throw new Error('manifest missing');
    const blocked = actionBlockedReason(j, c, gen);
    if (blocked) throw notEligible(blocked);
    const ev = j.getEvaluation(c.evaluationId);
    if (!ev || !ev.oracleAgrees || !c.primary) throw notEligible('case has no oracle-confirmed primary candidate');
    const scope = proposedScopeFor(c.primary) as ProposedScope;
    const { digest } = scopeDigestOf(c.provenance, c.caseId, c.revision, manifest.sha256, scope, 'add_deny_rule');
    const now = nowUtcNano();
    const approve = body.decision === 'approve';
    const rec: ActionRecord = {
      actionId: newActionId(), caseId, provenance: c.provenance, kind: 'restriction', version: 1,
      state: approve ? 'approved' : 'rejected', caseRevision: c.revision, manifestSha256: manifest.sha256, scope, scopeDigest: digest,
      approvedBy: approve ? operator : null, approvedAt: approve ? now : null, rejectionReason: approve ? null : body.reason,
      nativeReceipt: null, verifications: [], reversesActionId: null,
      history: [{ at: now, from: 'review_ready', to: approve ? 'approved' : 'rejected', by: operator, note: body.reason }],
    };
    j.createAction(rec);
    return buildCaseDetail(j, caseId);
  });
}

function compareSelectors(a: ActionRecord, obs: NativeReceiptBody['observedSelectors']): string[] {
  const s = a.scope;
  const out: string[] = [];
  if (obs.workspaceId !== s.workspaceId) out.push(`workspace ${obs.workspaceId} != approved ${s.workspaceId}`);
  if (obs.policySubjectId !== s.policySubjectId) out.push(`subject ${obs.policySubjectId} != approved ${s.policySubjectId}`);
  if (obs.credentialId !== s.credentialId) out.push(`credential ${obs.credentialId} != approved ${s.credentialId}`);
  if (obs.operation !== s.operation) out.push(`operation ${obs.operation} != approved ${s.operation}`);
  if (obs.decision.toUpperCase() !== 'DENY') out.push(`decision ${obs.decision} != DENY`);
  const want = selectorText(s.resourceSelector);
  const got = obs.resources === null || obs.resources === '' ? null : obs.resources;
  if (want !== got) out.push(`resource selector ${got ?? '(unrestricted)'} != approved ${want ?? '(unrestricted)'}`);
  return out;
}

/** Operator records what they applied natively. The app never mutates native policy. */
export function recordNativeReceipt(svc: Services, actionId: string, body: NativeReceiptBody, operator: string): ActionRecord {
  const j = svc.journal;
  return wrapStale(() =>
    j.tx(() => {
      const a = j.getAction(actionId);
      if (!a || a.kind !== 'restriction') throw notFound('restriction action');
      if (a.provenance === 'replay') throw notEligible('replay actions do not exist');
      if (a.version !== body.expectedVersion) throw new StaleVersionError(body.expectedVersion, a.version);
      if (![...RECEIPT_ACCEPTING_STATES, 'stale'].includes(a.state as never)) throw conflict(`action is ${a.state}; a native receipt is not accepted in this state`);
      const appliedNs = tryParseUtcNano(body.appliedAt);
      if (appliedNs === null) throw invalid('appliedAt must be strict UTC RFC3339 text');
      const c = j.getCase(a.caseId);
      if (!c) throw notFound('case');
      const mismatches = compareSelectors(a, body.observedSelectors);
      const approvedNs = tryParseUtcNano(a.approvedAt);
      // compare at the precision the operator supplied: truncate approvedAt to appliedAt's fractional digits
      const digits = (/\.(\d+)Z$/.exec(body.appliedAt)?.[1] ?? '').length;
      const unit = 10n ** BigInt(9 - digits);
      const outOfBand = approvedNs !== null && appliedNs < (approvedNs / unit) * unit;
      const staleCase = a.state === 'stale' || c.revision !== a.caseRevision;
      if (outOfBand) mismatches.push('rule application time precedes approval (out-of-band application)');
      if (staleCase) mismatches.push(`approval was for case revision ${a.caseRevision}; case is now revision ${c.revision}`);
      const receipt: NativeApplicationReceipt = {
        recordedBy: operator, recordedAt: nowUtcNano(), method: body.method, nativeRuleId: body.nativeRuleId, observedSelectors: body.observedSelectors,
        appliedAt: body.appliedAt, evidenceNote: body.evidenceNote, matchesApprovedScope: mismatches.length === 0, mismatches,
      };
      const to = staleCase || outOfBand ? 'disputed_stale_application' : mismatches.length ? 'scope_mismatch' : 'native_application_observed';
      const next = applyTransition(a, to, operator, `native receipt recorded via ${body.method}${mismatches.length ? `; ${mismatches.join('; ')}` : ''}`, body.expectedVersion, { nativeReceipt: receipt });
      j.casAction(next, body.expectedVersion);
      return j.getAction(actionId) as ActionRecord;
    }),
  );
}

async function probeSafely(svc: Services, role: 'target' | 'control', a: ActionRecord, notBefore: string, ref: string): Promise<ProbeResult> {
  const j = svc.journal;
  const intent = j.createIntent({ idempotencyRef: ref, kind: 'probe_launch', relatedId: a.actionId, detail: `${role} probe for action ${a.actionId}` }, a.provenance);
  const missing = (why: string): ProbeResult => ({
    role, provenance: a.provenance, launchId: intent.intentId, nativeSessionId: null, nativeEventIds: [], decision: null, reasonCode: null,
    boundSubjectId: null, credentialId: null, inspection: why, outcome: 'missing', startedAt: nowUtcNano(), completedAt: null,
  });
  try {
    const r = await (svc.guild as NonNullable<Services['guild']>).runProbe({ role, scope: a.scope, notBefore, idempotencyRef: ref });
    const started = tryParseUtcNano(r.startedAt);
    const floor = tryParseUtcNano(notBefore);
    if (started === null || floor === null || started <= floor) {
      j.resolveIntent(intent.intentId, 'succeeded', 'probe returned but was not fresh (started at or before the receipt time); discarded');
      return missing('probe was not strictly after the native receipt time; discarded as stale');
    }
    j.resolveIntent(intent.intentId, 'succeeded', `outcome ${r.outcome}`);
    return r;
  } catch (e) {
    j.resolveIntent(intent.intentId, 'unknown', `probe call failed or timed out: ${(e as Error).message.slice(0, 200)}`);
    return missing(`probe call failed: ${(e as Error).message.slice(0, 200)}`);
  }
}

const inFlight = new Set<string>();

/**
 * A verification stuck in verification_pending (process died between the CAS and the final transition) is never
 * relaunched blindly: recorded probe intents are reconciled (when `reconcile`) and the action moves to the
 * *_unknown state with the reason. A new verify from that state launches fresh probes deliberately.
 */
export async function reconcileInterruptedVerification(svc: Services, actionId: string, expectedVersion: number | null, reconcile: boolean, by: string): Promise<ActionRecord> {
  const j = svc.journal;
  const a = j.getAction(actionId);
  if (!a) throw notFound('action');
  if (a.state !== 'verification_pending') throw conflict(`action is ${a.state}, not an interrupted verification`);
  if (inFlight.has(actionId)) throw conflict('a verification for this action is still running in this process');
  if (expectedVersion !== null && a.version !== expectedVersion) throw staleRevision(`action is at version ${a.version}, request was for ${expectedVersion}`);
  const notes: string[] = [];
  for (const i of j.listIntents(actionId).filter((x) => x.outcome === 'pending' || x.outcome === 'unknown')) {
    const found = reconcile && svc.guild ? await svc.guild.reconcileLaunch(i.idempotencyRef).catch(() => null) : null;
    if (found) {
      j.resolveIntent(i.intentId, 'reconciled', `probe launch exists natively (session ${found.nativeSessionId ?? 'unknown'}) but its result was not recorded; not relaunched`);
      notes.push(`${i.idempotencyRef}: launch exists, result unrecorded`);
    } else {
      j.resolveIntent(i.intentId, 'unknown', reconcile ? 'reconciliation could not prove whether a probe launched' : 'process restarted before the probe outcome was recorded');
      notes.push(`${i.idempotencyRef}: outcome unknown`);
    }
  }
  const to = a.kind === 'restriction' ? 'verification_unknown' : 'recovery_unknown';
  return wrapStale(() => {
    const cur = j.getAction(actionId) as ActionRecord;
    const next = applyTransition(cur, to, by, `interrupted verification; ${notes.join('; ') || 'no probe intents recorded'}`, cur.version);
    j.casAction(next, cur.version);
    return j.getAction(actionId) as ActionRecord;
  });
}

/** Startup sweep: nothing can still be running, so interrupted verifications become unknown (no network calls). */
export async function sweepInterruptedVerifications(svc: Services): Promise<number> {
  const pend = svc.journal.listPendingVerifications();
  for (const a of pend) await reconcileInterruptedVerification(svc, a.actionId, null, false, 'system');
  return pend.length;
}

/** Fresh target + control probes (NEW sessions launched after the receipt time), then the verdict matrix. */
export async function verifyAction(svc: Services, actionId: string, expectedVersion: number, operator: string): Promise<ActionRecord> {
  const j = svc.journal;
  const a0 = j.getAction(actionId);
  if (!a0) throw notFound('action');
  if (a0.provenance === 'replay') throw notEligible('replay actions are not eligible');
  if (a0.version !== expectedVersion) throw staleRevision(`action is at version ${a0.version}, verify was for ${expectedVersion}`);
  if (a0.state === 'verification_pending') return reconcileInterruptedVerification(svc, actionId, expectedVersion, true, operator);
  const startStates = a0.kind === 'restriction' ? ['native_application_observed', 'verification_failed', 'verification_unknown'] : ['removal_observed', 'recovery_failed', 'recovery_unknown'];
  if (!startStates.includes(a0.state)) throw conflict(`action is ${a0.state}; verification starts only from ${startStates.join(', ')}`);
  if (!a0.nativeReceipt) throw conflict('no native receipt recorded');
  if (!svc.guild) throw unavailable('Guild adapter is not configured; fresh probes cannot be launched (never faked)');
  if (!a0.nativeReceipt.matchesApprovedScope) throw conflict('native receipt does not match the approved scope; verification of an unapproved rule is refused');
  const notBefore = a0.nativeReceipt.recordedAt;

  const pendingState = 'verification_pending';
  const pending = wrapStale(() => {
    const next = applyTransition(a0, pendingState, operator, 'fresh target/control probes launching', expectedVersion);
    j.casAction(next, expectedVersion);
    return next;
  });
  const tag = `${actionId}-v${pending.version}`;
  inFlight.add(actionId);
  let target: ProbeResult;
  let control: ProbeResult;
  try {
    [target, control] = await Promise.all([
      probeSafely(svc, 'target', pending, notBefore, `probe-${tag}-target`),
      probeSafely(svc, 'control', pending, notBefore, `probe-${tag}-control`),
    ]);
  } finally {
    inFlight.delete(actionId);
  }
  const expect = { targetSubjectId: pending.scope.policySubjectId, controlSubjectId: svc.config.guild.verifiedControlPolicySubjectId };
  const { verdict, explanation } =
    pending.kind === 'restriction' ? restrictionVerdict(pending.provenance, target, control, expect) : recoveryVerdict(pending.provenance, target, control, expect);
  const receipt: VerificationReceipt = {
    verificationId: `ver-${randomBytes(6).toString('hex')}`, provenance: pending.provenance, actionId, kind: pending.kind, target, control, verdict, explanation,
    residualScope: pending.scope.residualCapability, verifiedAt: nowUtcNano(),
  };
  const finalState = pending.kind === 'restriction' ? restrictionStateFor(verdict) : recoveryStateFor(verdict);
  return wrapStale(() =>
    j.tx(() => {
      j.saveVerification(receipt);
      const cur = j.getAction(actionId) as ActionRecord;
      const next = applyTransition(cur, finalState, operator, `${verdict}: ${explanation}`, pending.version);
      j.casAction(next, pending.version);
      return j.getAction(actionId) as ActionRecord;
    }),
  );
}

/** Separate reviewed recovery action; never created by the count falling. */
export function createRecovery(svc: Services, actionId: string, expectedVersion: number, reason: string, operator: string): ActionRecord {
  const j = svc.journal;
  return j.tx(() => {
    const src = j.getAction(actionId);
    if (!src || src.kind !== 'restriction') throw notFound('restriction action');
    if (src.provenance === 'replay') throw notEligible('replay actions are not eligible');
    if (src.version !== expectedVersion) throw staleRevision(`action is at version ${src.version}, request was for ${expectedVersion}`);
    if (![...EFFECT_POSSIBLE, 'disputed', 'disputed_stale_application'].includes(src.state as never)) throw conflict(`a native restriction is not recorded as applied (state ${src.state}); there is nothing to recover`);
    const existing = j.listActions(src.caseId).find((x) => x.kind === 'recovery' && x.reversesActionId === actionId && !['rejected', 'recovered', 'simulated_recovered'].includes(x.state));
    if (existing) throw conflict(`recovery ${existing.actionId} is already ${existing.state}`);
    const c = j.getCase(src.caseId);
    const manifestSha = src.manifestSha256;
    if (!c) throw notFound('case');
    const { digest } = scopeDigestOf(src.provenance, c.caseId, c.revision, manifestSha, src.scope, 'remove_deny_rule');
    const now = nowUtcNano();
    const rec: ActionRecord = {
      actionId: newActionId(), caseId: src.caseId, provenance: src.provenance, kind: 'recovery', version: 1, state: 'review_ready', caseRevision: c.revision,
      manifestSha256: manifestSha, scope: src.scope, scopeDigest: digest, approvedBy: null, approvedAt: null, rejectionReason: null, nativeReceipt: null,
      verifications: [], reversesActionId: actionId, history: [{ at: now, from: 'none', to: 'review_ready', by: operator, note: reason }],
    };
    j.createAction(rec);
    return rec;
  });
}

export function reviewRecovery(svc: Services, actionId: string, body: { expectedVersion: number; decision: 'approve' | 'reject'; reason: string }, operator: string): ActionRecord {
  const j = svc.journal;
  return wrapStale(() =>
    j.tx(() => {
      const a = j.getAction(actionId);
      if (!a || a.kind !== 'recovery') throw notFound('recovery action');
      if (a.version !== body.expectedVersion) throw new StaleVersionError(body.expectedVersion, a.version);
      const c = j.getCase(a.caseId);
      if (!c) throw notFound('case');
      if (body.decision === 'approve' && c.revision !== a.caseRevision) throw staleRevision(`recovery was drafted for case revision ${a.caseRevision}; case is now ${c.revision}`);
      const to = body.decision === 'approve' ? 'approved' : ('rejected' as never);
      const next = applyTransition(a, to, operator, body.reason, body.expectedVersion, body.decision === 'approve' ? { approvedBy: operator, approvedAt: nowUtcNano() } : { rejectionReason: body.reason });
      j.casAction(next, body.expectedVersion);
      return j.getAction(actionId) as ActionRecord;
    }),
  );
}

export function recordRemovalReceipt(svc: Services, actionId: string, body: RemovalReceiptBody, operator: string): ActionRecord {
  const j = svc.journal;
  return wrapStale(() =>
    j.tx(() => {
      const a = j.getAction(actionId);
      if (!a) throw notFound('action');
      if (a.kind !== 'recovery') throw conflict('removal receipts apply only to recovery actions; this is a restriction action');
      if (a.version !== body.expectedVersion) throw new StaleVersionError(body.expectedVersion, a.version);
      if (a.state !== 'approved') throw conflict(`recovery is ${a.state}; a removal receipt is accepted only after approval`);
      if (tryParseUtcNano(body.removedAt) === null) throw invalid('removedAt must be strict UTC RFC3339 text');
      const s = a.scope;
      const receipt: NativeApplicationReceipt = {
        recordedBy: operator, recordedAt: nowUtcNano(), method: body.method, nativeRuleId: body.nativeRuleId,
        observedSelectors: { credentialId: s.credentialId, operation: s.operation, policySubjectId: s.policySubjectId, workspaceId: s.workspaceId, decision: 'REMOVED', resources: selectorText(s.resourceSelector) },
        appliedAt: body.removedAt, evidenceNote: body.evidenceNote, matchesApprovedScope: true, mismatches: [],
      };
      const next = applyTransition(a, 'removal_observed', operator, `removal receipt recorded via ${body.method}`, body.expectedVersion, { nativeReceipt: receipt });
      j.casAction(next, body.expectedVersion);
      return j.getAction(actionId) as ActionRecord;
    }),
  );
}

export { ACTIVE_RESTRICTION, HttpError };
