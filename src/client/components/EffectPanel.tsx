import { useState } from 'react';
import { RECEIPT_ACCEPTING_STATES } from '../../shared/contracts.js';
import type { ActionRecord, CaseDetail, ProbeResult, VerificationReceipt } from '../../shared/contracts.js';
import { actionEligibilityReason, labelOf, latestAction, SIMULATED_LABEL, toneOf } from '../format.js';
import { Badge, GuardedButton, Id } from './common.js';
import { ErrorNotice, useOp, type Ops } from './ops.js';
import { EMPTY_SELECTORS, ReceiptSummary, SelectorFields, selectorsMissing, type SelectorState } from './ReviewDialog.js';

const MEANING: Record<string, string> = {
  review_ready: 'Waiting for a reviewer decision. Nothing is approved.',
  rejected: 'The review was rejected. No restriction is requested.',
  approved: 'Scope approved. Nothing has changed in Guild: a human must apply the rule natively and record it.',
  stale: 'The approval no longer matches the current case revision. It cannot be relied on; review again.',
  native_application_pending: 'Waiting for a native rule receipt from the operator.',
  native_application_unknown: 'The native outcome is unknown. Do not assume the rule exists or does not exist.',
  native_application_observed: 'An operator recorded a matching rule. It is not verified: no fresh target refusal has been inspected yet.',
  verification_pending: 'Fresh target and control sessions are being checked.',
  verification_failed: 'Verification failed. The restriction is not shown to work; see the probes below.',
  verification_unknown: 'Verification could not decide. Treat the restriction as unproven.',
  restriction_verified: 'Verified for this subject, credential and operation only: the target was refused by policy and control content was inspected in fresh sessions.',
  simulated_restriction_observed: 'SIMULATED: produced against non-native data. This is not evidence that any real policy works.',
  scope_mismatch: 'The recorded native rule differs from the approved scope. The restriction is not accepted as approved.',
  disputed_stale_application: 'A rule was recorded against an approval that has since gone stale. Disputed; preserve and re-review.',
  disputed: 'The effect is disputed. Preserve the record and review manually.',
  removal_observed: 'An operator recorded removal of the rule. Not verified until target and control both succeed.',
  recovery_failed: 'Recovery verification failed; the expected access did not return.',
  recovery_unknown: 'Recovery could not be decided.',
  recovered: 'Recovered: expected target and control results both succeeded in fresh sessions.',
  simulated_recovered: 'SIMULATED recovery on non-native data. Not evidence.',
};

const VERIFY_STATES = new Set(['native_application_observed', 'verification_pending', 'verification_failed', 'verification_unknown']);
const RECOVERY_VERIFY_STATES = new Set(['removal_observed', 'verification_pending', 'recovery_failed', 'recovery_unknown']);

function Probe({ p }: { p: ProbeResult }) {
  const good = p.role === 'target' ? p.outcome === 'refused_policy' : p.outcome === 'succeeded_expected';
  const tone = p.provenance !== 'native' ? (good ? 'sim' : 'bad') : good ? 'ok' : 'bad';
  const sim = p.provenance !== 'native' ? 'Simulated: ' : '';
  const text = sim +
    (p.role === 'target'
      ? p.outcome === 'refused_policy' ? 'Target refused by policy' : `Target not refused by policy (${p.outcome})`
      : p.outcome === 'succeeded_expected' ? 'Control content inspected, as expected' : `Control not confirmed (${p.outcome})`);
  return (
    <div className="inspector" aria-label={`${p.role} probe`}>
      <Badge tone={tone}>{text}</Badge>
      <dl className="kvs">
        <div className="kv"><dt>Decision / reason</dt><dd className="mono">{p.decision ?? 'none'} / {p.reasonCode ?? 'none'}</dd></div>
        <div className="kv"><dt>Bound subject</dt><dd>{p.boundSubjectId ? <Id value={p.boundSubjectId} /> : 'unresolved'}</dd></div>
        <div className="kv"><dt>Credential</dt><dd>{p.credentialId ? <Id value={p.credentialId} /> : 'unresolved'}</dd></div>
        <div className="kv"><dt>Session</dt><dd>{p.nativeSessionId ? <Id value={p.nativeSessionId} /> : 'none'}</dd></div>
      </dl>
      <p className="small" style={{ overflowWrap: 'anywhere' }}>Inspection: {p.inspection}</p>
    </div>
  );
}

function Verification({ v }: { v: VerificationReceipt }) {
  const simulated = v.verdict.startsWith('simulated_');
  const good = v.verdict === 'restriction_verified' || v.verdict === 'recovered';
  return (
    <div className="stack" data-testid="verification">
      <div className="btn-row">
        <Badge tone={simulated ? 'sim' : good ? 'ok' : v.verdict === 'unknown' || v.verdict === 'policy_refusal_unproved' ? 'warn' : 'bad'}>
          {simulated ? `Simulated: ${labelOf(v.verdict)}` : labelOf(v.verdict)}
        </Badge>
        <span className="small muted mono">{v.verifiedAt} · {v.kind}</span>
      </div>
      <p className="small" style={{ overflowWrap: 'anywhere' }}>{v.explanation}</p>
      <div className="stack"><Probe p={v.target} /><Probe p={v.control} /></div>
      {v.residualScope.length ? <p className="small muted">Residual scope: {v.residualScope.join('; ')}</p> : null}
    </div>
  );
}

function ReasonInline({ id, label, cta, reason, onSubmit, busy, variant }: { id: string; label: string; cta: string; reason?: string | null; onSubmit: (r: string) => void; busy: boolean; variant?: 'primary' | 'danger' }) {
  const [text, setText] = useState('');
  const short = text.trim().length < 8 ? 'Enter a concrete reason (at least 8 characters).' : null;
  return (
    <div className="stack">
      <div className="field">
        <label htmlFor={id}>{label}</label>
        <textarea id={id} rows={2} value={text} onChange={(e) => setText(e.target.value)} />
      </div>
      <GuardedButton id={`${id}-btn`} variant={variant ?? 'primary'} reason={reason ?? short} busy={busy} onClick={() => onSubmit(text.trim())}>{cta}</GuardedButton>
    </div>
  );
}

function RemovalForm({ action, ops }: { action: ActionRecord; ops: Ops }) {
  const { busy, error, run } = useOp(ops);
  const [method, setMethod] = useState<'guild_ui' | 'guild_cli_verified'>('guild_ui');
  const [ruleId, setRuleId] = useState('');
  const [at, setAt] = useState('');
  const [note, setNote] = useState('');
  const [sel, setSel] = useState<SelectorState>(EMPTY_SELECTORS);
  const miss = selectorsMissing(sel) ? 'Enter every selector exactly as Guild shows it after removal.' : !at.trim() ? 'Enter when the rule was removed (UTC).' : note.trim().length < 4 ? 'Add an evidence note.' : null;
  return (
    <form
      className="stack"
      aria-label="Record native rule removal"
      onSubmit={(e) => {
        e.preventDefault();
        if (miss) return;
        void run(() => ops.removalReceipt(action.actionId, { expectedVersion: action.version, method, nativeRuleId: ruleId.trim() || null, observedSelectors: { ...sel, resources: sel.resources.trim() || null }, removedAt: at.trim(), evidenceNote: note.trim() }), 'Removal receipt recorded. Recovery is unverified until target and control both succeed.');
      }}
    >
      <p className="small">Remove the DENY rule in Guild (Access &amp; setup → Credentials → policy table), then record it here.</p>
      <div className="field-grid">
        <div className="field"><label htmlFor="rm-m">Removed through</label>
          <select id="rm-m" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}><option value="guild_ui">Guild UI</option><option value="guild_cli_verified">Guild CLI (separately verified)</option></select></div>
        <div className="field"><label htmlFor="rm-r">Native rule ID (if shown)</label><input id="rm-r" value={ruleId} onChange={(e) => setRuleId(e.target.value)} autoComplete="off" /></div>
        <div className="field"><label htmlFor="rm-a">Removed at (UTC)</label><input id="rm-a" value={at} onChange={(e) => setAt(e.target.value)} placeholder="2026-10-09T19:10:00Z" autoComplete="off" /></div>
      </div>
      <p className="small muted">Enter the selectors of the rule you observed being removed. The server compares them with the restriction's scope; they are not pre-filled.</p>
      <SelectorFields sel={sel} onChange={setSel} scope={action.scope} prefix="rm" />
      <div className="field"><label htmlFor="rm-n">Evidence note</label><textarea id="rm-n" rows={2} value={note} onChange={(e) => setNote(e.target.value)} /></div>
      {error ? <ErrorNotice error={error} onReload={() => void ops.reload()} /> : null}
      <GuardedButton id="rm-submit" type="submit" variant="primary" reason={miss} busy={busy}>Record removal receipt</GuardedButton>
    </form>
  );
}

function ActionCard({ action, ops, onOpenHandoff }: { action: ActionRecord; ops: Ops; onOpenHandoff: () => void }) {
  const { busy, error, run } = useOp(ops);
  const tone = toneOf(action.state);
  const isRestr = action.kind === 'restriction';
  const verifyOk = isRestr ? VERIFY_STATES.has(action.state) : RECOVERY_VERIFY_STATES.has(action.state);
  const latestV = action.verifications[action.verifications.length - 1] ?? null;
  const sim = action.provenance !== 'native';
  return (
    <div className="stack" data-testid={`action-${action.kind}`} aria-label={`${action.kind} action`}>
      <div className="btn-row">
        <Badge tone={tone}>{labelOf(action.state)}</Badge>
        <span className="small muted">{action.kind} · version {action.version}{sim ? ` · ${action.provenance} (not native)` : ''}</span>
      </div>
      <p className="small">{MEANING[action.state] ?? ''}</p>
      {action.rejectionReason ? <p className="small" style={{ overflowWrap: 'anywhere' }}>Rejection reason: {action.rejectionReason}</p> : null}
      <ReceiptSummary action={action} />
      {action.verifications.length ? (
        <div className="stack">{[...action.verifications].reverse().map((v) => <Verification key={v.verificationId} v={v} />)}</div>
      ) : latestV === null && (action.state === 'verification_unknown' || action.state === 'verification_failed') ? (
        <p className="small">No verification receipt is attached; the reason is unknown.</p>
      ) : null}
      {error ? <ErrorNotice error={error} onReload={() => void ops.reload()} /> : null}

      {isRestr && (RECEIPT_ACCEPTING_STATES as string[]).includes(action.state) ? (
        <button type="button" className="btn btn-primary" onClick={onOpenHandoff}>Open native handoff and record receipt</button>
      ) : null}
      {verifyOk ? (
        <GuardedButton id={`verify-${action.kind}`} reason={null} busy={busy} variant="primary" onClick={() => void run(() => ops.verify(action.actionId, { expectedVersion: action.version }), 'Verification requested. Read the probes; a request alone is not success.')}>
          {isRestr ? 'Verify restriction with fresh sessions' : 'Verify recovery with fresh sessions'}
        </GuardedButton>
      ) : null}

      {!isRestr && action.state === 'review_ready' ? (
        <div className="stack">
          <ReasonInline id="arv" label="Reason for recovery decision" cta="Approve recovery scope" busy={busy} onSubmit={(r) => void run(() => ops.actionReview(action.actionId, { expectedVersion: action.version, decision: 'approve', reason: r }), 'Recovery scope approved. Removal in Guild is still a human step.')} />
          <ReasonInline id="arj" label="Reason to reject recovery" cta="Reject recovery" variant="danger" busy={busy} onSubmit={(r) => void run(() => ops.actionReview(action.actionId, { expectedVersion: action.version, decision: 'reject', reason: r }), 'Recovery rejected.')} />
        </div>
      ) : null}
      {!isRestr && action.state === 'approved' ? <RemovalForm action={action} ops={ops} /> : null}
    </div>
  );
}

export function EffectPanel({ detail, ops, onOpenReview, onOpenHandoff }: { detail: CaseDetail; ops: Ops; onOpenReview: () => void; onOpenHandoff: () => void }) {
  const restr = latestAction(detail, 'restriction');
  const rec = latestAction(detail, 'recovery');
  const { busy, error, run } = useOp(ops);
  const elig = actionEligibilityReason(detail);
  const restrOpenForReview = !restr || restr.state === 'rejected' || restr.state === 'stale' || restr.state === 'review_ready' || restr.state === 'none';
  const canRecover = !!restr && ['restriction_verified', 'simulated_restriction_observed', 'native_application_observed', 'verification_failed', 'verification_unknown', 'scope_mismatch'].includes(restr.state) && (!rec || ['rejected', 'recovered', 'simulated_recovered'].includes(rec.state));
  const recoverReason = !restr
    ? 'No restriction exists to recover from.'
    : !canRecover
      ? rec && !['rejected', 'recovered', 'simulated_recovered'].includes(rec.state)
        ? 'A recovery is already in progress.'
        : `Restriction state “${labelOf(restr.state)}” cannot start a recovery review.`
      : null;
  return (
    <section className="panel" aria-labelledby="fx-h">
      <header>
        <h2 id="fx-h">Effect</h2>
        <span className="hint">What was approved, recorded natively and verified. No overall “safe” verdict.</span>
      </header>
      <div className="panel-body">
        {detail.provenance === 'contract_test' ? <p className="small" role="note"><strong>{SIMULATED_LABEL}</strong></p> : null}
        {restrOpenForReview ? (
          <div className="stack">
            <p className="small">{restr?.state === 'rejected' ? 'The previous review was rejected.' : restr?.state === 'stale' ? 'The previous approval is stale.' : 'No restriction has been approved for this case.'}</p>
            <GuardedButton id="open-review" variant="primary" reason={elig} onClick={onOpenReview}>Review restriction</GuardedButton>
          </div>
        ) : null}
        {restr ? <ActionCard action={restr} ops={ops} onOpenHandoff={onOpenHandoff} /> : null}
        {restr ? (
          <div className="stack" style={{ borderTop: '1px solid var(--line)', paddingTop: 'var(--s-3)' }}>
            <h3 style={{ fontSize: 'var(--t-md)' }}>Recovery (separate review)</h3>
            {rec ? <ActionCard action={rec} ops={ops} onOpenHandoff={onOpenHandoff} /> : <p className="small muted">No recovery has been started. A falling count never releases a restriction automatically.</p>}
            {error ? <ErrorNotice error={error} onReload={() => void ops.reload()} /> : null}
            {!rec || ['rejected', 'recovered', 'simulated_recovered'].includes(rec.state) ? (
              <ReasonInline id="rcv" label="Reason to start recovery review" cta="Start recovery review" reason={recoverReason} busy={busy} onSubmit={(r) => void run(() => ops.createRecovery(restr.actionId, { expectedVersion: restr.version, reason: r }), 'Recovery review started. Nothing is released yet.')} />
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
