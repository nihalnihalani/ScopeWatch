import type { CaseDetail } from '../../shared/contracts.js';
import { Badge, Id } from './common.js';

export function QueryPanel({ detail }: { detail: CaseDetail }) {
  const ev = detail.evaluation;
  const groups = Object.entries(ev.queries.reduce<Record<string, typeof ev.queries>>((m, q) => { (m[q.queryClass] ??= []).push(q); return m; }, {}));
  const targets = [...new Set(ev.queries.map((q) => `${q.target} · ${q.serverVersion}`))];
  const oneTarget = targets.length === 1 ? targets[0]! : null;
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
        {oneTarget ? <p className="small" data-testid="query-target">Target: <span className="mono">{oneTarget}</span></p> : null}
        <div className="table-wrap" tabIndex={0} role="region" aria-label="Executed query families, scrollable">
          <table className="dense">
            <thead>
              <tr>
                <th scope="col">Family</th>
                <th scope="col" className="r">Receipts</th>
                <th scope="col" className="r">Rows</th>
                <th scope="col" className="r">Client ms (max)</th>
                <th scope="col" className="r">Server ms (max)</th>
                {oneTarget ? null : <th scope="col">Target / version</th>}
              </tr>
            </thead>
            <tbody>
              {groups.map(([cls, qs]) => (
                <tr key={cls} data-testid={`qclass-${cls}`}>
                  <th scope="row" className="fam" title={cls}>{cls}</th>
                  <td className="num-c" data-col="receipts">{qs.length}</td>
                  <td className="num-c" data-col="rows">{qs.reduce((n, q) => n + q.rowCount, 0)}</td>
                  <td className="num-c" data-col="client-ms">{Math.max(...qs.map((q) => q.clientMs))}</td>
                  <td className="num-c" data-col="server-ms">{qs.some((q) => q.serverMs !== null) ? Math.max(...qs.map((q) => q.serverMs ?? 0)) : 'n/a'}</td>
                  {oneTarget ? null : <td className="mono tgt" data-col="target"><span>{qs[0]!.target}</span> <span className="muted">· {qs[0]!.serverVersion}</span></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
