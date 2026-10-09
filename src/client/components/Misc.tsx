import { useState, type ReactElement } from 'react';
import type { CaseDetail, SanitizedExport, StatusReport } from '../../shared/contracts.js';
import type { ApiClient } from '../api.js';
import { ApiClientError } from '../api.js';
import { Badge, GuardedButton, Notice } from './common.js';
import { ErrorNotice, useOp, type Ops } from './ops.js';

export function InvestigationPanel({ detail, ops }: { detail: CaseDetail; ops: Ops }) {
  const inv = detail.investigation;
  const { busy, error, run } = useOp(ops);
  const startable = (detail.evidenceState === 'review_ready' || detail.provenance !== 'native') && (!inv || inv.state === 'not_started' || inv.state === 'failed' || inv.state === 'unavailable');
  const reason = detail.provenance !== 'native' ? `Hosted investigation is unavailable for ${detail.provenance} provenance; no model text is produced.` : detail.evidenceState !== 'review_ready' ? 'Investigation needs a case that is ready for review.' : inv && !startable ? `Investigation state is ${inv.state}.` : null;
  return (
    <section className="panel" aria-labelledby="inv-h">
      <header>
        <h2 id="inv-h">Investigation</h2>
        <span className="hint">Model text is untrusted data. It is never authority for a scope.</span>
      </header>
      <div className="panel-body">
        <div className="btn-row">
          <Badge tone={inv?.state === 'created' ? 'ok' : inv?.state === 'failed' || inv?.state === 'create_unknown' ? 'warn' : 'neutral'}>{inv ? inv.state.replace(/_/g, ' ') : 'not started'}</Badge>
          {inv?.grounded === false ? <Badge tone="bad">Ungrounded claims</Badge> : null}
          {inv?.grounded === true ? <Badge tone="ok">Claims checked against evidence</Badge> : null}
        </div>
        {inv?.unavailableReason ? <p className="small">Unavailable: {inv.unavailableReason}</p> : null}
        {inv?.narrative ? (
          <blockquote style={{ margin: 0, padding: 'var(--s-3)', borderLeft: '4px solid var(--line-strong)', background: 'var(--surface-2)', overflowWrap: 'anywhere', whiteSpace: 'pre-wrap' }} data-testid="narrative" aria-label="Untrusted investigator narrative">
            {inv.narrative}
          </blockquote>
        ) : null}
        {inv?.checks.length ? (
          <div className="table-wrap" tabIndex={0} role="region" aria-label="Claim checks, scrollable">
            <table>
              <thead><tr><th scope="col">Claim</th><th scope="col">Expected</th><th scope="col">Found</th><th scope="col">Check</th></tr></thead>
              <tbody>{inv.checks.map((c, i) => <tr key={i}><td>{c.claim}</td><td className="mono">{c.expected}</td><td className="mono">{c.found ?? 'absent'}</td><td>{c.ok ? <Badge tone="ok">Matches</Badge> : <Badge tone="bad">Does not match</Badge>}</td></tr>)}</tbody>
            </table>
          </div>
        ) : null}
        {inv?.incidentUrl ? <p className="small">Incident record: <span className="id">{inv.incidentUrl}</span> <span className="muted">(not opened automatically)</span></p> : null}
        {error ? <ErrorNotice error={error} onReload={() => void ops.reload()} /> : null}
        {startable ? <GuardedButton id="inv-run" reason={reason} busy={busy} onClick={() => void run(() => ops.investigate(detail.caseId, detail.revision), 'Investigation requested.')}>Run investigation</GuardedButton> : null}
      </div>
    </section>
  );
}

export function ExportPanel({ detail, client }: { detail: CaseDetail; client: ApiClient }) {
  const [bundle, setBundle] = useState<SanitizedExport | null>(null);
  const [err, setErr] = useState<ApiClientError | null>(null);
  const [busy, setBusy] = useState(false);
  const href = `/api/export/${encodeURIComponent(detail.caseId)}`;
  return (
    <section className="panel" aria-labelledby="ex-h">
      <header>
        <h2 id="ex-h">Evidence export</h2>
        <span className="hint">Sanitized, read-only. No live admin route.</span>
      </header>
      <div className="panel-body">
        <div className="btn-row">
          <a className="btn" href={href} download={`scopewatch-${detail.caseId}.json`}>Download sanitized JSON</a>
          <button type="button" className="btn" disabled={busy} onClick={() => { setBusy(true); setErr(null); client.exportBundle(detail.caseId).then(setBundle, (e) => setErr(e instanceof ApiClientError ? e : null)).finally(() => setBusy(false)); }}>
            {busy ? 'Loading…' : 'Show limits and source classes'}
          </button>
        </div>
        {err ? <ErrorNotice error={err} /> : null}
        {bundle ? (
          <div className="stack">
            <p className="small">Schema {bundle.schema}, exported <span className="mono">{bundle.exportedAt}</span>, provenance {bundle.provenance}.</p>
            <div className="notice tone-neutral" role="note"><h3>What this bundle does not prove</h3><ul>{bundle.limits.map((l, i) => <li key={i}>{l}</li>)}</ul></div>
            <div className="table-wrap" tabIndex={0} role="region" aria-label="Source classes, scrollable">
              <table><thead><tr><th scope="col">Section</th><th scope="col">Source class</th></tr></thead>
                <tbody>{Object.entries(bundle.sourceClasses).map(([k, v]) => <tr key={k}><td className="mono">{k}</td><td>{v}</td></tr>)}</tbody></table>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

/** Dependency and configuration problems, from StatusReport. Names missing settings explicitly. */
export function StatusNotices({ status }: { status: StatusReport | null }) {
  if (!status) return null;
  const out: ReactElement[] = [];
  if (status.guild.status !== 'ok' && status.mode !== 'replay') {
    out.push(
      <Notice key="g" tone={status.guild.status === 'unconfigured' ? 'warn' : 'bad'} title={status.guild.status === 'unconfigured' ? 'Guild is not configured' : `Guild API ${status.guild.status}`} role="status">
        <p>{status.guild.detail}</p>
        {status.guild.missing.length ? <p>Missing settings: {status.guild.missing.map((m) => <code key={m} className="mono"> {m}</code>)}</p> : null}
      </Notice>,
    );
  }
  if (status.clickhouse.status !== 'ok') {
    out.push(
      <Notice key="c" tone="bad" title={`ClickHouse ${status.clickhouse.status}`} role="status">
        <p>{status.clickhouse.detail}</p>
        <p className="small muted">Counts cannot be computed or re-queried. Existing case data below was captured earlier.</p>
      </Notice>,
    );
  }
  if (status.journal.status !== 'ok') {
    out.push(
      <Notice key="j" tone="bad" title={`Journal ${status.journal.status}`} role="status">
        <p>{status.journal.detail}</p>
        <p className="small muted">Approvals and receipts are not durable while the journal is unavailable.</p>
      </Notice>,
    );
  }
  return <>{out}</>;
}

export function GateList({ status }: { status: StatusReport | null }) {
  if (!status || !status.nativeGates.length) return null;
  return (
    <details>
      <summary>Native gates ({status.nativeGates.filter((g) => g.status === 'passed').length} of {status.nativeGates.length} passed)</summary>
      <ul className="small" style={{ paddingLeft: '1.2em' }}>
        {status.nativeGates.map((g) => <li key={g.gate}><strong>{g.gate}</strong>: {g.status} <span className="muted">{g.detail}</span></li>)}
      </ul>
    </details>
  );
}
