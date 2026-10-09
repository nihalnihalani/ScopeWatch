import type { CaseDetail } from '../../shared/contracts.js';
import { Badge, Id } from './common.js';

export function QueryPanel({ detail }: { detail: CaseDetail }) {
  const ev = detail.evaluation;
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
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 'var(--s-2)' }} aria-label="Query receipts">
          {ev.queries.map((q) => (
            <li key={q.queryId} className="inspector">
              <div className="btn-row"><strong>{q.queryClass}</strong><span className="small muted">{q.rowCount} rows</span></div>
              <Id value={q.queryId} label="query id" />
              <dl className="kvs">
                <div className="kv"><dt>Client round trip</dt><dd className="mono">{q.clientMs} ms</dd></div>
                <div className="kv"><dt>Server duration</dt><dd className="mono">{q.serverMs === null ? 'n/a' : `${q.serverMs} ms`}</dd></div>
                <div className="kv"><dt>Target</dt><dd>{q.target}</dd></div>
                <div className="kv"><dt>Server version</dt><dd className="mono">{q.serverVersion}</dd></div>
              </dl>
            </li>
          ))}
        </ul>
        {ev.queries.map((q) => (
          <details key={q.queryId}>
            <summary>
              {q.queryClass} · SQL {q.sqlVersion} · <span className="mono">sha256 {q.sqlSha256.slice(0, 12)}…</span>
            </summary>
            <dl className="kvs" style={{ marginTop: 'var(--s-2)' }}>
              <div className="kv"><dt>SQL sha256</dt><dd><Id value={q.sqlSha256} /></dd></div>
              <div className="kv"><dt>Output sha256</dt><dd><Id value={q.outputSha256} /></dd></div>
              <div className="kv"><dt>Database</dt><dd className="mono">{q.database}</dd></div>
              <div className="kv"><dt>Executed at</dt><dd className="mono">{q.executedAt}</dd></div>
            </dl>
            <pre className="code" tabIndex={0} aria-label={`Parameters for ${q.queryId}`}>{JSON.stringify(q.params, null, 2)}</pre>
          </details>
        ))}
      </div>
    </section>
  );
}
