import { useState } from 'react';
import type { ActionRecord, CaseDetail, ProposedScope } from '../../shared/contracts.js';
import { RECEIPT_ACCEPTING_STATES } from '../../shared/contracts.js';
import { actionEligibilityReason, labelOf, latestAction, SIMULATED_LABEL } from '../format.js';
import { Dialog, GuardedButton, Id, Notice } from './common.js';
import { ErrorNotice, useOp, type Ops } from './ops.js';


export function ReviewDialog({ detail, ops, onClose, initial = 'review' }: { detail: CaseDetail; ops: Ops; onClose: () => void; initial?: 'review' | 'handoff' }) {
  const scope = detail.proposedScope;
  const action = latestAction(detail, 'restriction');
  const approved = !!action && action.state !== 'rejected' && action.state !== 'review_ready' && action.state !== 'none' && (action.state !== 'stale' || initial === 'handoff');
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
        approved && action ? <Handoff action={action} ops={ops} /> : <ReviewStep detail={detail} ops={ops} onDone={onClose} />
      ) : (
        <Notice tone="warn" title="No proposed scope">The server has not proposed a restriction scope for this case.</Notice>
      )}
    </Dialog>
  );
}

function ScopeTable({ scope: s }: { scope: ProposedScope }) {
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
      <ScopeTable scope={s} />
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

function Handoff({ action, ops }: { action: ActionRecord; ops: Ops }) {
  const s = action.scope;
  const canReceipt = (RECEIPT_ACCEPTING_STATES as string[]).includes(action.state);
  return (
    <>
      {action.state === 'stale' ? (
        <Notice tone="bad" title="Stale approval: a receipt will be recorded as disputed" role="alert">
          <p>This approval no longer matches the current case revision. If someone already applied the old scope in Guild, recording it here preserves it as a <strong>disputed out-of-band application</strong>. It is never treated as an observed, current restriction.</p>
        </Notice>
      ) : null}
      <Notice tone="info" title="Human-native step required">
        <p>ScopeWatch has no API that changes Guild policy. Nothing is restricted until a person applies the rule in Guild.</p>
        <ol className="handoff">
          <li>Open Guild → Access &amp; setup → Credentials → the policy table.</li>
          <li>Add a <strong>DENY</strong> rule with exactly these selectors:</li>
        </ol>
      </Notice>
      <ScopeTable scope={action.scope} />
      <p className="small muted">Approved by {action.approvedBy ?? 'unknown'} at <span className="mono">{action.approvedAt ?? 'unknown'}</span> · action version {action.version} · digest <Id value={action.scopeDigest} /></p>
      <p className="small muted">Residual capability after the rule: {s.residualCapability.join('; ') || 'not stated'}</p>
      {action.nativeReceipt ? <ReceiptSummary action={action} /> : null}
      {canReceipt ? <NativeReceiptForm action={action} ops={ops} /> : (
        <p className="small muted">Current state: {labelOf(action.state)}. No further native receipt is accepted in this state; use the Effect panel for verification or recovery.</p>
      )}
    </>
  );
}

export function ReceiptSummary({ action }: { action: ActionRecord }) {
  const r = action.nativeReceipt;
  if (!r) return null;
  return (
    <div className={`notice ${r.matchesApprovedScope ? (action.provenance === 'native' ? 'tone-ok' : 'tone-sim') : 'tone-bad'}`} role="note" aria-label={action.kind === 'recovery' ? 'Recorded removal receipt' : 'Recorded native receipt'}>
      <h3>
        {action.provenance !== 'native' ? 'Simulated: ' : ''}
        {action.kind === 'recovery'
          ? r.matchesApprovedScope ? 'Removed rule matches the restriction scope' : 'Removed rule does NOT match the restriction scope (disputed)'
          : r.matchesApprovedScope ? 'Recorded rule matches the approved scope' : 'Recorded rule does NOT match the approved scope'}
      </h3>
      <p className="small">Entered by {r.recordedBy} at <span className="mono">{r.recordedAt}</span> via {r.method}; applied at <span className="mono">{r.appliedAt}</span>. This is an operator-entered observation, not a Guild-signed receipt.</p>
      {r.mismatches.length ? <ul>{r.mismatches.map((m, i) => <li key={i}>{m}</li>)}</ul> : null}
      <p className="small" style={{ overflowWrap: 'anywhere' }}>Note: {r.evidenceNote}</p>
    </div>
  );
}

export type SelectorState = { workspaceId: string; policySubjectId: string; credentialId: string; operation: string; decision: string; resources: string };
export const EMPTY_SELECTORS: SelectorState = { workspaceId: '', policySubjectId: '', credentialId: '', operation: '', decision: '', resources: '' };

/** Contract-test demo only: stands in for reading the rule back from the MOCK Guild. Never offered for native actions. */
export function simulatedSelectors(scope: ProposedScope): SelectorState {
  return { workspaceId: scope.workspaceId, policySubjectId: scope.policySubjectId, credentialId: scope.credentialId, operation: scope.operation, decision: scope.decision, resources: '' };
}

export function selectorsMissing(sel: SelectorState): boolean {
  return !sel.workspaceId || !sel.policySubjectId || !sel.credentialId || !sel.operation || !sel.decision;
}

/** Operator-typed observed selectors (never pre-filled, so the server comparison stays independent). */
export function SelectorFields({ sel, onChange, scope, prefix }: { sel: SelectorState; onChange: (s: SelectorState) => void; scope: ProposedScope; prefix: string }) {
  const set = (k: keyof SelectorState) => (e: { target: { value: string } }) => onChange({ ...sel, [k]: e.target.value });
  const f = (id: string, label: string, k: keyof SelectorState, hint: string) => (
    <div className="field">
      <label htmlFor={`${prefix}-${id}`}>{label}</label>
      <input id={`${prefix}-${id}`} value={sel[k]} onChange={set(k)} autoComplete="off" spellCheck={false} aria-describedby={`${prefix}-${id}-h`} />
      <span id={`${prefix}-${id}-h`} className="hintline">Expected: {hint}</span>
    </div>
  );
  return (
    <div className="field-grid">
      {f('ws', 'Workspace ID', 'workspaceId', scope.workspaceId)}
      {f('sub', 'Policy subject ID', 'policySubjectId', scope.policySubjectId)}
      {f('cred', 'Credential ID', 'credentialId', scope.credentialId)}
      {f('op', 'Operation', 'operation', scope.operation)}
      {f('dec', 'Decision', 'decision', scope.decision)}
      <div className="field">
        <label htmlFor={`${prefix}-res`}>Resources (blank if none)</label>
        <input id={`${prefix}-res`} value={sel.resources} onChange={set('resources')} autoComplete="off" spellCheck={false} aria-describedby={`${prefix}-res-h`} />
        <span id={`${prefix}-res-h`} className="hintline">Expected: {scope.resourceSelector ? `repos ${scope.resourceSelector.repos.join(',')}; methods ${scope.resourceSelector.methods.join(',')}` : 'none (unrestricted dimension)'}</span>
      </div>
    </div>
  );
}

function NativeReceiptForm({ action, ops }: { action: ActionRecord; ops: Ops }) {
  const s = action.scope;
  const { busy, error, run } = useOp(ops);
  const [method, setMethod] = useState<'guild_ui' | 'guild_cli_verified'>('guild_ui');
  const [ruleId, setRuleId] = useState('');
  const [sel, setSel] = useState<SelectorState>(EMPTY_SELECTORS);
  const [appliedAt, setAppliedAt] = useState('');
  const [note, setNote] = useState('');
  const missing = selectorsMissing(sel)
    ? 'Enter every selector exactly as Guild shows it.'
    : !appliedAt.trim() ? 'Enter when the rule was applied (UTC).' : note.trim().length < 4 ? 'Add an evidence note.' : null;
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
        <div className="field">
          <label htmlFor="nr-at">Applied at (UTC)</label>
          <input id="nr-at" value={appliedAt} onChange={(e) => setAppliedAt(e.target.value)} placeholder="2026-10-09T18:42:01Z" autoComplete="off" spellCheck={false} />
        </div>
      </div>
      {action.provenance !== 'native' ? (
        <GuardedButton id="nr-sim-fill" reason={null} onClick={() => { setSel(simulatedSelectors(s)); setRuleId('mock-rule'); setAppliedAt(new Date().toISOString()); setNote('Simulated: filled from the mock Guild policy for a contract-test demo.'); }}>
          Fill from Guild (simulated)
        </GuardedButton>
      ) : null}
      <SelectorFields sel={sel} onChange={setSel} scope={s} prefix="nr" />
      <div className="field">
        <label htmlFor="nr-note">Evidence note</label>
        <textarea id="nr-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      {error ? <ErrorNotice error={error} onReload={() => void ops.reload()} /> : null}
      <GuardedButton id="nr-submit" type="submit" variant="primary" reason={missing} busy={busy}>{action.state === 'stale' ? 'Record as disputed out-of-band application' : 'Record native receipt'}</GuardedButton>
    </form>
  );
}
