import { useMemo, useState } from 'react';
import type { CaseDetail, TimelineEntry } from '../../shared/contracts.js';
import { sameKey } from '../format.js';
import { Id } from './common.js';

const KIND_LABEL: Record<TimelineEntry['kind'], string> = {
  session: 'Session',
  first_crossing: 'First crossing',
  peak: 'Peak',
  query: 'Query',
  investigation: 'Investigation',
  review: 'Review',
  native_application: 'Native application',
  verification: 'Verification',
  recovery: 'Recovery',
  dispute: 'Dispute',
};

export function Timeline({ detail }: { detail: CaseDetail }) {
  const [selected, setSelected] = useState<string | null>(null);
  const primary = detail.candidates.find((c) => sameKey(c, detail.primary)) ?? null;
  const entries = useMemo(() => [...detail.timeline].sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0)), [detail.timeline]);

  const sessionEntries = new Map<string, TimelineEntry>();
  for (const e of entries) if (e.kind === 'session' && e.ref) sessionEntries.set(e.ref, e);

  const contributing = new Map<string, { first: string | null; peak: string | null }>();
  for (const s of primary?.firstCrossing?.sessions ?? []) contributing.set(s.sessionId, { first: s.count, peak: null });
  for (const s of primary?.peakWitness?.sessions ?? []) {
    const cur = contributing.get(s.sessionId) ?? { first: null, peak: null };
    cur.peak = s.count;
    contributing.set(s.sessionId, cur);
  }

  for (const ev of detail.sessions) if (!contributing.has(ev.sessionId)) contributing.set(ev.sessionId, { first: null, peak: null });
  const sel = selected;
  const selEntry = sel ? sessionEntries.get(sel) ?? null : null;
  const selEv = sel ? detail.sessions.find((x) => x.sessionId === sel) ?? null : null;
  const selCounts = sel ? contributing.get(sel) ?? null : null;

  return (
    <section className="panel" aria-labelledby="tl-h">
      <header>
        <h2 id="tl-h">Evidence timeline</h2>
        <span className="hint">Contributing sessions, crossing, query, review, native step and verification, in time order.</span>
      </header>
      <div className="panel-body">
        {contributing.size ? (
          <div>
            <h3 style={{ fontSize: 'var(--t-md)', marginBottom: 'var(--s-2)' }}>Contributing sessions ({contributing.size})</h3>
            <ul className="btn-row" style={{ listStyle: 'none', margin: 0, padding: 0 }}>
              {[...contributing.entries()].map(([sid, c]) => (
                <li key={sid}>
                  <button type="button" className="tl-select" aria-pressed={sel === sid} onClick={() => setSelected(sel === sid ? null : sid)}>
                    <span className="id" title={sid}>{sid}</span>
                    <span className="muted small"> · {c.first === null && c.peak === null ? 'not in a witness' : `${c.first ?? '0'} at first crossing${c.peak ? `, ${c.peak} at peak` : ''}`}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="muted">No contributing sessions are recorded for a witness on this case.</p>
        )}
        {sel ? (
          <div className="inspector" role="region" aria-label="Bounded source evidence for the selected session" data-testid="inspector">
            <h3 style={{ fontSize: 'var(--t-md)' }}>Source evidence (bounded)</h3>
            <dl className="kvs">
              <div className="kv"><dt>Session ID</dt><dd><Id value={sel} /></dd></div>
              <div className="kv"><dt>ALLOW decisions counted</dt><dd className="mono">{selCounts ? `${selCounts.first ?? '0'} at first crossing${selCounts.peak ? `, ${selCounts.peak} at peak` : ''}` : 'not in a witness'}</dd></div>
              <div className="kv"><dt>Binding method</dt><dd>{selEv ? (selEv.mappingMethods.join(', ') || 'none recorded') : selEntry?.detail || 'Not provided for this session.'}</dd></div>
              {selEv ? (
                <>
                  <div className="kv"><dt>Coverage</dt><dd>{selEv.coverageState}</dd></div>
                  <div className="kv"><dt>Bound policy subject</dt><dd>{selEv.policySubjectId ? <Id value={selEv.policySubjectId} /> : 'unresolved'}</dd></div>
                  <div className="kv"><dt>Bindings</dt><dd className="mono">verified {selEv.bindingStates.verified} · unresolved {selEv.bindingStates.unresolved} · conflict {selEv.bindingStates.conflict}</dd></div>
                  <div className="kv"><dt>Proof refs</dt><dd>{selEv.proofRefs.length ? selEv.proofRefs.map((r) => <div key={r}><Id value={r} /></div>) : 'none'}</dd></div>
                  <div className="kv"><dt>Pages / completion</dt><dd className="mono">{selEv.pageRefs.length} page(s) · <Id value={selEv.completionRef} /></dd></div>
                </>
              ) : null}
              <div className="kv"><dt>Provenance</dt><dd>{selEntry?.provenance ?? detail.provenance}</dd></div>
            </dl>
            {selEv ? (
              <div>
                <div className="small muted">Identity keys from this session ({selEv.identityKeys.length} of {selEv.identityKeyTotal} shown):</div>
                <pre className="code wrapcode" tabIndex={0}>{selEv.identityKeys.join('\n')}</pre>
              </div>
            ) : null}
          </div>
        ) : null}
        <ol className="timeline" aria-label="Case events">
          {entries.length === 0 ? <li className="muted">No timeline entries yet.</li> : null}
          {entries.map((e, i) => (
            <li key={`${e.at}-${i}`} className="tl-item" data-kind={e.kind}>
              <div className="tl-head">
                <span className="tl-kind">{KIND_LABEL[e.kind]}</span>
                <time className="mono muted small" dateTime={e.at}>{e.at}</time>
              </div>
              {e.kind === 'session' && e.ref ? (
                <button type="button" className="tl-select" aria-pressed={sel === e.ref} onClick={() => setSelected(sel === e.ref ? null : (e.ref as string))}>
                  {e.title}
                </button>
              ) : (
                <div className="tl-title">{e.title}</div>
              )}
              <div className="small" style={{ overflowWrap: 'anywhere' }}>{e.detail}</div>
              {e.provenance !== detail.provenance ? <div className="small muted">source: {e.provenance}</div> : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
