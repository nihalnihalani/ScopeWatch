import { useState } from 'react';
import type { ActionRecord, CaseDetail } from '../../shared/contracts.js';
import { RECEIPT_ACCEPTING_STATES } from '../../shared/contracts.js';
import { actionEligibilityReason, latestAction, SIMULATED_LABEL } from '../format.js';
import { Dialog, GuardedButton, Id, Notice } from './common.js';
import { ErrorNotice, useOp, type Ops } from './ops.js';


export function ReviewDialog({ detail, ops, onClose }: { detail: CaseDetail; ops: Ops; onClose: () => void }) {
  const scope = detail.proposedScope;
  const action = latestAction(detail, 'restriction');
  const approved = !!action && action.state !== 'rejected' && action.state !== 'review_ready' && action.state !== 'none' && action.state !== 'stale';
  return (
    <Dialog title={approved ? 'Native handoff' : 'Review restriction'} onClose={onClose} describedBy="dlg-desc">
      {detail.provenance === 'contract_test' ? (
        <Notice tone="info" title={SIMULATED_LABEL} role="status">
          <p className="small">Every step below is simulated. Nothing here changes a real Guild account, and any positive result is a simulated_* outcome, never verification.</p>
        </Notice>
      ) : null}
      <p id="dlg-desc" className="muted">
        {approved
          ? 'The scope below is approved. ScopeWatch does not change Guild policy; a human applies it natively and records what they observed.'
          : 'Approving records a decision about one exact scope. It does not change Guild policy by itself.'}
      </p>
      {scope ? (
        approved && action ? <Handoff detail={detail} action={action} ops={ops} /> : <ReviewStep detail={detail} ops={ops} onDone={onClose} />
      ) : (
        <Notice tone="warn" title="No proposed scope">The server has not proposed a restriction scope for this case.</Notice>
      )}
    </Dialog>
  );
}

function ScopeTable({ detail }: { detail: CaseDetail }) {
  const s = detail.proposedScope!;
  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label="Exact restriction scope">
      <table>
        <tbody>
          <tr><th scope="row">Workspace</th><td><Id value={s.workspaceId} /></td></tr>
          <tr><th scope="row">Policy subject</th><td><Id value={s.policySubjectId} /></td></tr>
          <tr><th scope="row">Credential</th><td><Id value={s.credentialId} /></td></tr>
          <tr><th scope="row">Operation</th><td><span className="id">{s.operation}</span></td></tr>
          <tr>
            <th scope="row">Resource selector</th>
            <td>
              {s.resourceSelector ? (
                <span className="id">repos: {s.resourceSelector.repos.join(', ') || '(none)'}; methods: {s.resourceSelector.methods.join(', ') || '(none)'}</span>
              ) : (
                <span>None: the native matcher is not verified, so this dimension is unrestricted and the rule covers the credential and operation for this subject.</span>
              )}
            </td>
          </tr>
          <tr><th scope="row">Decision</th><td><strong>{s.decision}</strong></td></tr>
        </tbody>
      </table>
    </div>
  );
}

function ReviewStep({ detail, ops, onDone }: { detail: CaseDetail; ops: Ops; onDone: () => void }) {
  const [reason, setReason] = useState('');
  const { busy, error, run } = useOp(ops);
  const s = detail.proposedScope!;
  const elig = actionEligibilityReason(detail);
  const noReason = reason.trim().length < 8 ? 'Enter a concrete reason (at least 8 characters).' : null;
  const submit = (decision: 'approve' | 'reject') =>
    void run(
      () => ops.review(detail.caseId, { expectedRevision: detail.revision, decision, reason: reason.trim() }),
      decision === 'approve' ? 'Scope approved. Native Guild step still pending.' : 'Review rejected. No restriction will be requested.',
    ).then((ok) => {
      if (ok && decision === 'reject') onDone();
    });
  return (
    <>
      <dl className="kvs">
        <div className="kv"><dt>Case</dt><dd><Id value={detail.caseId} /></dd></div>
        <div className="kv"><dt>Revision you are approving</dt><dd className="mono" data-testid="dlg-revision">{detail.revision}</dd></div>
        <div className="kv"><dt>Provenance</dt><dd>{detail.provenance}</dd></div>
      </dl>
      <ScopeTable detail={detail} />
      <div className="notice tone-info" role="note" aria-label="What changes">
        <h3>What changes if a human applies this</h3>
        <p>
          A DENY rule for this credential and operation is added for this policy subject in Guild. Native ALLOW decisions for it then stop being produced; the count in this window will fall as a result, which is not by itself a release.
        </p>
      </div>
      <div className="notice tone-neutral" role="note" aria-label="What remains usable">
        <h3>What remains usable</h3>
        {s.residualCapability.length ? <ul>{s.residualCapability.map((r, i) => <li key={i}>{r}</li>)}</ul> : <p>The server listed no residual capability. Treat this as unknown, not as none.</p>}
        <p className="small muted">Other subjects, including the compared control under its own allowance, are not part of this scope.</p>
      </div>
      <div>
        <div className="small muted">Digest input the server will bind on approval (exact bytes):</div>
        <pre className="code wrapcode" tabIndex={0} aria-label="Scope digest input" data-testid="digest-input">{detail.proposedScopeDigestInput ? JSON.stringify(detail.proposedScopeDigestInput) : 'not provided by the server'}</pre>
        <p className="small"><span className="muted">sha256:</span> <Id value={detail.proposedScopeDigest ?? 'not provided'} /></p>
      </div>
      <div className="field">
        <label htmlFor="rv-reason">Reason for this decision</label>
        <textarea id="rv-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} aria-describedby="rv-reason-hint" data-autofocus="" />
        <span id="rv-reason-hint" className="hintline">Recorded with your operator identity against revision {detail.revision}.</span>
      </div>
      {error ? <ErrorNotice error={error} onReload={() => void ops.reload()} /> : null}
      <div className="btn-row">
        <GuardedButton id="rv-approve" variant="primary" reason={elig ?? noReason} busy={busy} onClick={() => submit('approve')}>Approve exact scope</GuardedButton>
        <GuardedButton id="rv-reject" variant="danger" reason={noReason} busy={busy} onClick={() => submit('reject')}>Reject</GuardedButton>
      </div>
    </>
  );
}

function Handoff({ detail, action, ops }: { detail: CaseDetail; action: ActionRecord; ops: Ops }) {
  const s = detail.proposedScope!;
  const canReceipt = (RECEIPT_ACCEPTING_STATES as string[]).includes(action.state);
  return (
    <>
      <Notice tone="info" title="Human-native step required">
        <p>ScopeWatch has no API that changes Guild policy. Nothing is restricted until a person applies the rule in Guild.</p>
        <ol className="handoff">
          <li>Open Guild → Access &amp; setup → Credentials → the policy table.</li>
          <li>Add a <strong>DENY</strong> rule with exactly these selectors:</li>
        </ol>
      </Notice>
      <ScopeTable detail={detail} />
      <p className="small muted">Approved by {action.approvedBy ?? 'unknown'} at <span className="mono">{action.approvedAt ?? 'unknown'}</span> · action version {action.version} · digest <Id value={action.scopeDigest} /></p>
      <p className="small muted">Residual capability after the rule: {s.residualCapability.join('; ') || 'not stated'}</p>
      {action.nativeReceipt ? <ReceiptSummary action={action} /> : null}
      {canReceipt ? <NativeReceiptForm action={action} detail={detail} ops={ops} /> : (
        <p className="small muted">State is “{action.state}”; a native receipt cannot be recorded in this state.</p>
      )}
    </>
  );
}

export function ReceiptSummary({ action }: { action: ActionRecord }) {
  const r = action.nativeReceipt;
  if (!r) return null;
  return (
    <div className={`notice ${r.matchesApprovedScope ? 'tone-ok' : 'tone-bad'}`} role="note" aria-label="Recorded native receipt">
      <h3>{r.matchesApprovedScope ? 'Recorded rule matches the approved scope' : 'Recorded rule does NOT match the approved scope'}</h3>
      <p className="small">Entered by {r.recordedBy} at <span className="mono">{r.recordedAt}</span> via {r.method}; applied at <span className="mono">{r.appliedAt}</span>. This is an operator-entered observation, not a Guild-signed receipt.</p>
      {r.mismatches.length ? <ul>{r.mismatches.map((m, i) => <li key={i}>{m}</li>)}</ul> : null}
      <p className="small" style={{ overflowWrap: 'anywhere' }}>Note: {r.evidenceNote}</p>
    </div>
  );
}

function NativeReceiptForm({ action, detail, ops }: { action: ActionRecord; detail: CaseDetail; ops: Ops }) {
  const s = detail.proposedScope!;
  const { busy, error, run } = useOp(ops);
  const [method, setMethod] = useState<'guild_ui' | 'guild_cli_verified'>('guild_ui');
  const [ruleId, setRuleId] = useState('');
  const [sel, setSel] = useState({ workspaceId: '', policySubjectId: '', credentialId: '', operation: '', decision: '', resources: '' });
  const [appliedAt, setAppliedAt] = useState('');
  const [note, setNote] = useState('');
  const set = (k: keyof typeof sel) => (e: { target: { value: string } }) => setSel({ ...sel, [k]: e.target.value });
  const missing = !sel.workspaceId || !sel.policySubjectId || !sel.credentialId || !sel.operation || !sel.decision
    ? 'Enter every selector exactly as Guild shows it.'
    : !appliedAt.trim() ? 'Enter when the rule was applied (UTC).' : note.trim().length < 4 ? 'Add an evidence note.' : null;
  const f = (id: string, label: string, k: keyof typeof sel, hint: string) => (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} value={sel[k]} onChange={set(k)} autoComplete="off" spellCheck={false} aria-describedby={`${id}-h`} />
      <span id={`${id}-h`} className="hintline">Approved: {hint}</span>
    </div>
  );
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (missing) return;
        void run(
          () =>
            ops.nativeReceipt(action.actionId, {
              expectedVersion: action.version,
              method,
              nativeRuleId: ruleId.trim() || null,
              observedSelectors: { ...sel, resources: sel.resources.trim() || null },
              appliedAt: appliedAt.trim(),
              evidenceNote: note.trim(),
            }),
          'Native receipt recorded. It is unverified until a fresh target refusal is observed.',
        );
      }}
      aria-label="Record native application"
      className="stack"
    >
      <h3 style={{ fontSize: 'var(--t-md)' }}>Record what you observed in Guild</h3>
      <p className="small muted">Type the selectors as shown in Guild. They are compared with the approved scope by the server; they are not pre-filled so the comparison stays independent.</p>
      <div className="field-grid">
        <div className="field">
          <label htmlFor="nr-method">Applied through</label>
          <select id="nr-method" value={method} onChange={(e) => setMethod(e.target.value as typeof method)}>
            <option value="guild_ui">Guild UI</option>
            <option value="guild_cli_verified">Guild CLI (separately verified)</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="nr-rule">Native rule ID (if shown)</label>
          <input id="nr-rule" value={ruleId} onChange={(e) => setRuleId(e.target.value)} autoComplete="off" spellCheck={false} />
        </div>
        {f('nr-ws', 'Workspace ID', 'workspaceId', s.workspaceId)}
        {f('nr-sub', 'Policy subject ID', 'policySubjectId', s.policySubjectId)}
        {f('nr-cred', 'Credential ID', 'credentialId', s.credentialId)}
        {f('nr-op', 'Operation', 'operation', s.operation)}
        {f('nr-dec', 'Decision', 'decision', s.decision)}
        <div className="field">
          <label htmlFor="nr-res">Resources (blank if none)</label>
          <input id="nr-res" value={sel.resources} onChange={set('resources')} autoComplete="off" spellCheck={false} aria-describedby="nr-res-h" />
          <span id="nr-res-h" className="hintline">Approved: {s.resourceSelector ? `repos ${s.resourceSelector.repos.join(',')}; methods ${s.resourceSelector.methods.join(',')}` : 'none (unrestricted dimension)'}</span>
        </div>
        <div className="field">
          <label htmlFor="nr-at">Applied at (UTC)</label>
          <input id="nr-at" value={appliedAt} onChange={(e) => setAppliedAt(e.target.value)} placeholder="2026-10-09T18:42:01Z" autoComplete="off" spellCheck={false} />
        </div>
      </div>
      <div className="field">
        <label htmlFor="nr-note">Evidence note</label>
        <textarea id="nr-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error ? <ErrorNotice error={error} onReload={() => void ops.reload()} /> : null}
      <GuardedButton id="nr-submit" type="submit" variant="primary" reason={missing} busy={busy}>Record native receipt</GuardedButton>
    </form>
  );
}
