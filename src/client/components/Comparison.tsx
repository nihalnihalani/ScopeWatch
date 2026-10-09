import type { CandidateKey, CandidateResult, CaseDetail } from '../../shared/contracts.js';
import { WINDOW_SECONDS } from '../../shared/contracts.js';
import { big, breachedHistorically, sameKey } from '../format.js';
import { Badge, Id } from './common.js';

function pct(n: bigint, max: bigint): number {
  if (max <= 0n) return 0;
  return Math.min(100, Math.max(0, Number((n * 10000n) / max) / 100));
}

function Gauge({ c }: { c: CandidateResult }) {
  const allow = big(c.allowance);
  const cur = big(c.currentCount);
  const peak = big(c.peakCount);
  let max = allow;
  if (cur > max) max = cur;
  if (peak > max) max = peak;
  max = max + max / 10n + 1n;
  return (
    <div>
      <div className="gauge" role="img" aria-label={`Current ${c.currentCount}, peak ${c.peakCount}, allowance ${c.allowance}`}>
        <div className="fill" style={{ width: `${pct(cur, max)}%` }} />
        <div className="peak" style={{ left: `${pct(peak, max)}%` }} />
        <div className="allow" style={{ left: `${pct(allow, max)}%` }} />
      </div>
      <div className="gauge-legend" aria-hidden="true">
        <span>bar: current</span>
        <span>solid tick: peak</span>
        <span>dashed: allowance</span>
      </div>
    </div>
  );
}

export function SubjectCard({ c, role, caseProv }: { c: CandidateResult; role: 'primary' | 'control'; caseProv: CaseDetail['provenance'] }) {
  const hist = breachedHistorically(c);
  const currentOver = big(c.currentCount) > big(c.allowance);
  return (
    <article className={`subject ${role === 'primary' ? 'subject--breach' : 'subject--control'}`} aria-label={role === 'primary' ? 'Selected subject' : 'Busiest compliant control'} data-role={role}>
      <h3>{role === 'primary' ? 'Query-selected subject' : 'Busiest other candidate (own allowance)'}</h3>
      <div>
        <div className="name">{c.displayLabel}</div>
        <Id value={c.policySubjectId} label="policy subject" />
      </div>
      <div className="btn-row">
        {hist ? <Badge tone="warn">Exceeded allowance in window</Badge> : <Badge tone="ok">Within own allowance</Badge>}
        {c.readiness !== 'ready' ? <Badge tone="warn">Not definitive: evidence incomplete</Badge> : null}
        {hist && !currentOver ? <Badge tone="info">Historical breach, current count within allowance</Badge> : null}
      </div>
      <dl className="nums">
        <div className="num"><dt>Allowance ALLOW decisions</dt><dd data-testid={`${role}-allowance`}>{c.allowance}</dd></div>
        <div className="num"><dt>Window</dt><dd>{WINDOW_SECONDS}s</dd></div>
        <div className="num"><dt>Peak</dt><dd data-testid={`${role}-peak`}>{c.peakCount}</dd></div>
        <div className="num"><dt>Current</dt><dd data-testid={`${role}-current`}>{c.currentCount}</dd></div>
      </dl>
      <Gauge c={c} />
      <dl className="kvs">
        <div className="kv">
          <dt>First crossing</dt>
          <dd className="mono">
            {c.firstCrossing ? `${c.firstCrossing.anchor} (count ${c.firstCrossing.count} of ${c.firstCrossing.allowance})` : 'never crossed'}
          </dd>
        </div>
        <div className="kv">
          <dt>Peak anchor</dt>
          <dd className="mono">{c.peakWitness ? c.peakWitness.anchor : 'n/a'}</dd>
        </div>
        <div className="kv">
          <dt>Credential / operation</dt>
          <dd><Id value={c.credentialId} /> <span className="muted">/</span> <span className="id">{c.operation}</span></dd>
        </div>
      </dl>
      <p className="small muted">
        Counted unit: native permission ALLOW decisions, window (T−{WINDOW_SECONDS}s, T]. An ALLOW is a policy decision, not proof that a read succeeded or returned data.
        {caseProv !== 'native' ? ' This dataset is not native account evidence.' : ''}
      </p>
    </article>
  );
}

export function pickControl(c: CaseDetail): CandidateResult | null {
  const others = c.candidates.filter((x) => !sameKey(x, c.primary));
  if (!others.length) return null;
  const sorted = [...others].sort((a, b) => {
    const ab = breachedHistorically(a) ? 1 : 0;
    const bb = breachedHistorically(b) ? 1 : 0;
    if (ab !== bb) return ab - bb; // compliant first
    const dp = big(b.peakCount) - big(a.peakCount);
    return dp > 0n ? 1 : dp < 0n ? -1 : 0;
  });
  return sorted[0] ?? null;
}

export function Comparison({ detail, onSelectCandidate }: { detail: CaseDetail; onSelectCandidate?: (k: CandidateKey) => void }) {
  const primary = detail.candidates.find((x) => sameKey(x, detail.primary)) ?? null;
  const control = pickControl(detail);
  return (
    <section className="panel" aria-labelledby="cmp-h">
      <header>
        <h2 id="cmp-h">Subject versus control</h2>
        <span className="hint">Each subject is measured against its own allowance, not a shared threshold.</span>
      </header>
      <div className="panel-body">
        {!primary ? (
          <p>
            {detail.evidenceState === 'no_breach'
              ? 'No candidate exceeded its allowance in the evaluated window. The query selected no subject.'
              : 'The evaluation selected no primary subject. Required evidence may be missing; absence of a breach is not established.'}
          </p>
        ) : null}
        <div className="compare">
          {primary ? <SubjectCard c={primary} role="primary" caseProv={detail.provenance} /> : null}
          {control ? <SubjectCard c={control} role="control" caseProv={detail.provenance} /> : null}
        </div>
        {detail.uncertainty.length ? (
          <div className="notice tone-warn" role="note" aria-label="Uncertainty affecting these counts">
            <h3>Uncertainty affecting these counts</h3>
            <ul>{detail.uncertainty.map((u, i) => <li key={i}>{u}</li>)}</ul>
          </div>
        ) : null}
        <h3 style={{ fontSize: 'var(--t-md)' }}>All candidates ({detail.candidates.length})</h3>
        <div className="table-wrap" tabIndex={0} role="region" aria-label="All candidates table, scrollable">
          <table>
            <thead>
              <tr>
                <th scope="col">Subject</th>
                <th scope="col">Allowance</th>
                <th scope="col">Current</th>
                <th scope="col">Peak</th>
                <th scope="col">First crossing</th>
                <th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {detail.candidates.map((c) => {
                const isP = sameKey(c, detail.primary);
                return (
                  <tr key={`${c.policySubjectId}|${c.credentialId}|${c.operation}`} className={isP ? 'row-primary' : undefined}>
                    <th scope="row" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 'var(--t-sm)', color: 'var(--ink)', background: 'transparent', whiteSpace: 'normal' }}>
                      {onSelectCandidate ? (
                        <button type="button" className="tl-select" onClick={() => onSelectCandidate(c)}>{c.displayLabel}</button>
                      ) : c.displayLabel}
                      <div><Id value={c.policySubjectId} /></div>
                    </th>
                    <td className="num-c">{c.allowance}</td>
                    <td className="num-c">{c.currentCount}</td>
                    <td className="num-c">{c.peakCount}</td>
                    <td className="mono">{c.firstCrossing ? c.firstCrossing.anchor : '—'}</td>
                    <td>
                      {breachedHistorically(c) ? <Badge tone="warn">Exceeded{isP ? ' (selected)' : ''}</Badge> : <Badge tone="ok">Within</Badge>}
                      {c.readiness !== 'ready' ? <> <Badge tone="warn">Incomplete</Badge></> : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
