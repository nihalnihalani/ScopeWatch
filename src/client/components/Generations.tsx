import type { GenerationSummary } from '../../shared/api.js';
import type { GapKind } from '../../shared/contracts.js';
import { Badge, Id, Notice } from './common.js';

const KIND_NOTE: Partial<Record<GapKind, string>> = {
  coverage_incomplete: 'Partial coverage',
  identity_conflict: 'Integrity conflict',
  binding_conflict: 'Integrity conflict',
  identity_missing: 'Identity missing',
  binding_unresolved: 'Binding unresolved',
  binding_missing: 'Binding missing',
};

/** Generations that were not admitted to a case, with the readiness gaps that blocked them. */
export function GenerationsPanel({ items }: { items: GenerationSummary[] | null }) {
  if (items === null) return null;
  const blocked = items.filter((g) => g.caseId === null);
  if (items.length === 0) return null;
  if (blocked.length === 0) {
    return (
      <section className="panel panel-slim" aria-labelledby="gen-h">
        <h2 id="gen-h">Evidence generations</h2>
        <span className="hint">{items.length} total, 0 not admitted to a case. Every generation was admitted to a case.</span>
      </section>
    );
  }
  return (
    <section className="panel" aria-labelledby="gen-h">
      <header>
        <h2 id="gen-h">Evidence generations</h2>
        <span className="hint">{items.length} total, {blocked.length} not admitted to a case. Missing or conflicting evidence stays unknown; no case is created for it.</span>
      </header>
      <div className="panel-body">
        {blocked.map((g) => {
          const r = g.readiness;
          const conflict = !!r && (r.conflictKeys > 0 || r.gaps.some((x) => x.kind.endsWith('conflict')));
          const identity = !!r && r.gaps.some((x) => x.kind === 'identity_missing');
          return (
            <Notice key={g.generation.generationId} tone={conflict ? 'bad' : 'warn'} title={conflict ? 'Not admitted: integrity conflict' : identity ? 'Not admitted: identity not verified' : 'Not admitted: evidence not ready'} role="status">
              <p className="small"><Id value={g.generation.generationId} label="generation" /> · {g.generation.provenance} · {g.generation.state.replace(/_/g, ' ')} · captured up to <span className="mono">{g.generation.captureCutoff}</span></p>
              {r ? (
                <>
                  <p className="small">{r.completeSessions} of {r.cohortSessions} cohort sessions complete · {r.canonicalKeys} canonical keys · {r.conflictKeys} conflicting.</p>
                  {r.gaps.length ? (
                    <ul>{r.gaps.map((x, i) => <li key={i}><Badge tone={x.kind.endsWith('conflict') ? 'bad' : 'warn'}>{KIND_NOTE[x.kind] ?? x.kind.replace(/_/g, ' ')}</Badge> {x.detail}{x.sessionId ? <> (session <span className="id">{x.sessionId}</span>)</> : null}</li>)}</ul>
                  ) : <p className="small">No gap detail was reported.</p>}
                </>
              ) : <p className="small">No readiness report is attached to this generation.</p>}
            </Notice>
          );
        })}
      </div>
    </section>
  );
}
