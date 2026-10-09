import type { CaseDetail } from '../../shared/contracts.js';
import { Badge, Id } from './common.js';

export function QueryPanel({ detail }: { detail: CaseDetail }) {
  const ev = detail.evaluation;
  const groups = Object.entries(ev.queries.reduce<Record<string, typeof ev.queries>>((m, q) => { (m[q.queryClass] ??= []).push(q); return m; }, {}));
  const synthetic = detail.provenance !== 'native';
  return (
    <section className="panel" aria-labelledby="q-h">
      <header>
        <h2 id="q-h">Executed queries</h2>
        <span className="hint">Receipts from SQL actually executed against ClickHouse.</span>
      </header>
      <div className="panel-body">
        <div className="btn-row">
          {ev.oracleAgrees ? <Badge tone="ok">Independent oracle agrees</Badge> : <Badge tone="bad">Oracle disagrees</Badge>}
          <Badge tone="neutral">{ev.queries.length} receipts</Badge>
        </div>
        {!ev.oracleAgrees && ev.oracleMismatches.length ? (
          <div className="notice tone-bad" role="alert">
            <h3>Oracle mismatches</h3>
            <ul>{ev.oracleMismatches.map((m, i) => <li key={i}>{m}</li>)}</ul>
          </div>
        ) : null}
        {synthetic ? (
          <p className="small muted" data-testid="timing-label">
            Timings below are a {detail.provenance === 'replay' ? 'replay measurement on a synthetic fixture' : 'contract-test measurement against a mock'}; they say nothing about a native account. Client round trip and server duration are separate numbers.
          </p>
        ) : (
          <p className="small muted">Client round trip and server duration are separate numbers; neither includes Guild collection.</p>
        )}
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--s-2)' }} aria-label="Query classes">
          {groups.map(([cls, qs]) => (
            <li key={cls} className="inspector" data-testid={`qclass-${cls}`}>
              <div className="btn-row"><strong>{cls}</strong><span className="small muted">{qs.length} receipt{qs.length === 1 ? '' : 's'} · {qs.reduce((n, q) => n + q.rowCount, 0)} rows</span></div>
              <dl className="kvs">
                <div className="kv"><dt>Client round trip (max)</dt><dd className="mono">{Math.max(...qs.map((q) => q.clientMs))} ms</dd></div>
                <div className="kv"><dt>Server duration (max)</dt><dd className="mono">{qs.some((q) => q.serverMs !== null) ? `${Math.max(...qs.map((q) => q.serverMs ?? 0))} ms` : 'n/a'}</dd></div>
                <div className="kv"><dt>Target / version</dt><dd className="mono">{qs[0]!.target} · {qs[0]!.serverVersion}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        <details>
          <summary>All {ev.queries.length} executed receipts</summary>
          <div className="scroll-box" tabIndex={0} role="region" aria-label="All query receipts, scrollable">
          {ev.queries.map((q) => (
          <details key={q.queryId}>
            <summary>
              {q.queryClass} · <span className="mono">{q.queryId}</span> · {q.rowCount} rows · client {q.clientMs} ms / server {q.serverMs ?? 'n/a'} ms
            </summary>
            <dl className="kvs" style={{ marginTop: 'var(--s-2)' }}>
              <div className="kv"><dt>Query ID</dt><dd><Id value={q.queryId} /></dd></div>
              <div className="kv"><dt>SQL version</dt><dd className="mono">{q.sqlVersion}</dd></div>
              <div className="kv"><dt>SQL sha256</dt><dd><Id value={q.sqlSha256} /></dd></div>
              <div className="kv"><dt>Output sha256</dt><dd><Id value={q.outputSha256} /></dd></div>
              <div className="kv"><dt>Database</dt><dd className="mono">{q.database}</dd></div>
              <div className="kv"><dt>Executed at</dt><dd className="mono">{q.executedAt}</dd></div>
            </dl>
            <pre className="code" tabIndex={0} aria-label={`Parameters for ${q.queryId}`}>{JSON.stringify(q.params, null, 2)}</pre>
          </details>
        ))}
          </div>
        </details>
      </div>
    </section>
  );
}
