import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { GenerationSummary } from '../shared/api.js';
import type { CaseDetail, CaseSummary, Provenance, SessionInfo, StatusReport } from '../shared/contracts.js';
import { ApiClientError, createApiClient, type ApiClient } from './http-client.js';
import { Comparison } from './components/Comparison.js';
import { Badge, Notice, ProvenanceStrip } from './components/common.js';
import { EffectPanel } from './components/EffectPanel.js';
import { ExportPanel, GateList, InvestigationPanel, StatusNotices } from './components/Misc.js';
import { ErrorNotice, type Ops } from './components/ops.js';
import { GenerationsPanel } from './components/Generations.js';
import { QueryPanel } from './components/QueryPanel.js';
import { ReviewDialog } from './components/ReviewDialog.js';
import { Timeline } from './components/Timeline.js';
import { ageText, labelOf, latestAction, shortId, toneOf } from './format.js';

type Boot =
  | { phase: 'loading' }
  | { phase: 'error'; error: ApiClientError }
  | { phase: 'login'; session: SessionInfo; error?: ApiClientError }
  | { phase: 'ready'; session: SessionInfo };

/** Replay evidence is never "ready for review": it can never be approved (lead fix, demo finding). */
function evidenceLabel(state: string, provenance: string): string {
  if (state === 'review_ready' && provenance === 'replay') return 'Breach evidence complete (replay, not reviewable)';
  return labelOf(state);
}

export function App({ client: injected }: { client?: ApiClient }) {
  const csrf = useRef<string | null>(null);
  const client = useMemo(() => injected ?? createApiClient(() => csrf.current), [injected]);
  const [boot, setBoot] = useState<Boot>({ phase: 'loading' });
  const [status, setStatus] = useState<StatusReport | null>(null);
  const [cases, setCases] = useState<CaseSummary[] | null>(null);
  const [caseId, setCaseId] = useState<string | null>(() => decodeURIComponent(window.location.hash.replace(/^#\/case\//, '')) || null);
  const [gens, setGens] = useState<GenerationSummary[] | null>(null);
  const [detail, setDetail] = useState<CaseDetail | null>(null);
  const [detailError, setDetailError] = useState<ApiClientError | null>(null);
  const [listError, setListError] = useState<ApiClientError | null>(null);
  const [live, setLive] = useState('');
  const [runBusy, setRunBusy] = useState(false);
  const [runError, setRunError] = useState<ApiClientError | null>(null);
  const caseIdRef = useRef(caseId);
  caseIdRef.current = caseId;

  const announce = useCallback((m: string) => setLive(m), []);

  const handleAuth = useCallback((e: unknown): ApiClientError => {
    const err = e instanceof ApiClientError ? e : new ApiClientError(0, 'internal', e instanceof Error ? e.message : 'Unexpected error');
    if (err.code === 'unauthenticated') setBoot((b) => (b.phase === 'ready' ? { phase: 'login', session: { ...b.session, authenticated: false, csrfToken: null } } : b));
    return err;
  }, []);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await client.status());
    } catch (e) {
      handleAuth(e);
    }
  }, [client, handleAuth]);

  const loadCases = useCallback(async () => {
    try {
      const list = await client.cases();
      setCases(list);
      setListError(null);
      if (!caseIdRef.current && list[0]) setCaseId(list[0].caseId);
    } catch (e) {
      setListError(handleAuth(e));
    }
  }, [client, handleAuth]);

  const loadGens = useCallback(async () => {
    try {
      setGens(await client.generations());
    } catch (e) {
      handleAuth(e);
    }
  }, [client, handleAuth]);

  const loadDetail = useCallback(
    async (id: string) => {
      try {
        const d = await client.caseDetail(id);
        if (caseIdRef.current === id) {
          setDetail(d);
          setDetailError(null);
        }
        return d;
      } catch (e) {
        setDetailError(handleAuth(e));
        return null;
      }
    },
    [client, handleAuth],
  );

  useEffect(() => {
    let alive = true;
    client.session().then(
      (s) => {
        if (!alive) return;
        csrf.current = s.csrfToken;
        setBoot(s.authenticated ? { phase: 'ready', session: s } : { phase: 'login', session: s });
      },
      (e) => alive && setBoot({ phase: 'error', error: e instanceof ApiClientError ? e : new ApiClientError(0, 'network', 'Server unreachable') }),
    );
    return () => {
      alive = false;
    };
  }, [client]);

  const ready = boot.phase === 'ready';
  useEffect(() => {
    if (!ready) return;
    void loadStatus();
    void loadCases();
    void loadGens();
  }, [ready, loadStatus, loadCases, loadGens]);

  useEffect(() => {
    if (!ready || !caseId) {
      setDetail(null);
      return;
    }
    setDetail(null);
    setDetailError(null);
    void loadDetail(caseId);
  }, [ready, caseId, loadDetail]);

  useEffect(() => {
    const onHash = () => setCaseId(decodeURIComponent(window.location.hash.replace(/^#\/case\//, '')) || null);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const ops: Ops = useMemo(
    () => ({
      investigate: (id, rev) => client.investigate(id, rev),
      review: (id, body) => client.review(id, body),
      nativeReceipt: (id, body) => client.nativeReceipt(id, body),
      verify: (id, body) => client.verify(id, body),
      createRecovery: (id, body) => client.createRecovery(id, body),
      actionReview: (id, body) => client.actionReview(id, body),
      removalReceipt: (id, body) => client.removalReceipt(id, body),
      reload: async (note) => {
        const id = caseIdRef.current;
        await Promise.all([id ? loadDetail(id) : null, loadCases(), loadStatus(), loadGens()]);
        if (note) announce(note);
      },
    }),
    [client, loadDetail, loadCases, loadStatus, loadGens, announce],
  );

  const [railOpen] = useState(() => (typeof window !== 'undefined' && typeof window.matchMedia === 'function' ? window.matchMedia('(min-width: 1100px)').matches : true));
  const [dialog, setDialog] = useState<'review' | 'handoff' | null>(null);

  async function login(secret: string) {
    try {
      const s = await client.login(secret);
      csrf.current = s.csrfToken;
      setBoot(s.authenticated ? { phase: 'ready', session: s } : { phase: 'login', session: s });
      announce('Signed in.');
    } catch (e) {
      setBoot((b) => ({ phase: 'login', session: b.phase === 'login' || b.phase === 'ready' ? b.session : { authenticated: false, operator: null, csrfToken: null, mode: 'replay' }, error: e instanceof ApiClientError ? e : undefined }));
    }
  }

  async function runPipeline() {
    setRunBusy(true);
    setRunError(null);
    try {
      const mode = status?.mode ?? (boot.phase === 'ready' ? boot.session.mode : 'native');
      const r = mode === 'replay' ? await client.runReplay() : await client.runPipeline();
      announce(`Pipeline finished: ${r.state}. ${r.readinessGaps} readiness gaps.`);
      await Promise.all([loadCases(), loadStatus(), loadGens()]);
      if (r.caseId) {
        window.location.hash = `#/case/${encodeURIComponent(r.caseId)}`;
        setCaseId(r.caseId);
      }
    } catch (e) {
      setRunError(handleAuth(e));
    } finally {
      setRunBusy(false);
    }
  }

  const mode: Provenance = (status?.mode ?? (boot.phase === 'loading' || boot.phase === 'error' ? 'native' : boot.session.mode)) as Provenance;
  const modeKnown = status != null || (boot.phase !== 'loading' && boot.phase !== 'error');

  return (
    <>
      <a className="skip" href="#main">Skip to case</a>
      <header className="app-header">
        <div className="brand"><span>ScopeWatch</span><span className="brand-mark">operator case</span></div>
        <div className="header-meta">
          {detail ? <span>Case <strong className="id" title={detail.caseId}>{shortId(detail.caseId, 22)}</strong> · rev <strong>{detail.revision}</strong></span> : <span>No case open</span>}
          {boot.phase === 'ready' && boot.session.operator ? <span>Operator <strong>{boot.session.operator}</strong></span> : null}
          {status ? <span>Server time <span className="mono">{status.serverTime}</span></span> : null}
        </div>
        {boot.phase === 'ready' ? (
          <div className="header-actions">
            <button type="button" className="btn" onClick={() => void ops.reload('Refreshed.')}>Refresh</button>
            <button type="button" className="btn" onClick={() => void client.logout().then((s) => { csrf.current = null; setBoot({ phase: 'login', session: s }); })}>Sign out</button>
          </div>
        ) : null}
      </header>
      {modeKnown ? <ProvenanceStrip mode={mode} caseProvenance={detail?.provenance ?? null} /> : (
        <div className="prov prov--native" role="region" aria-label="Provenance"><span className="prov-tag">UNKNOWN</span><span>Run mode not yet reported by the server.</span></div>
      )}

      <div className="live" role="status" aria-live="polite" aria-atomic="true">{live}</div>

      {boot.phase === 'loading' ? <main id="main" className="layout"><p className="spinner-text" role="status">Loading session</p></main> : null}
      {boot.phase === 'error' ? (
        <main id="main" className="layout"><ErrorNotice error={boot.error} onReload={() => window.location.reload()} /></main>
      ) : null}
      {boot.phase === 'login' ? <Login onSubmit={login} error={boot.error ?? null} mode={boot.session.mode} /> : null}

      {boot.phase === 'ready' ? (
        <main id="main" className="layout" aria-label="Case workstation">
          <nav className="rail" aria-label="Cases">
            <details className="rail-details" open={railOpen}>
              <summary>Cases{cases ? ` (${cases.length})` : ''}</summary>
              <h2>Cases</h2>
              {listError ? <ErrorNotice error={listError} onReload={() => void loadCases()} /> : null}
              {cases === null && !listError ? <p className="spinner-text muted">Loading cases</p> : null}
              {cases && cases.length === 0 ? <p className="muted small">No cases yet.</p> : null}
              <ul className="case-list">
                {(cases ?? []).map((c) => (
                  <li key={c.caseId}>
                    <button type="button" className="case-btn" aria-current={c.caseId === caseId ? 'true' : undefined} onClick={() => { window.location.hash = `#/case/${encodeURIComponent(c.caseId)}`; setCaseId(c.caseId); }}>
                      <span className="id" title={c.caseId}>{shortId(c.caseId, 26)}</span>
                      <span>{c.primaryLabel ?? 'no selected subject'}</span>
                      <span className="small muted">{c.provenance} · {evidenceLabel(c.evidenceState, c.provenance)} · rev {c.revision}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </details>
          </nav>

          <div className="workbench">
            <StatusNotices status={status} />
            <GateList status={status} />
            {cases && cases.length === 0 && !listError ? (
              <EmptyState mode={mode} busy={runBusy} onRun={() => void runPipeline()} error={runError} status={status} />
            ) : null}
            <GenerationsPanel items={gens} />
            {caseId && detailError ? <ErrorNotice error={detailError} onReload={() => caseId && void loadDetail(caseId)} /> : null}
            {caseId && !detail && !detailError ? <p className="spinner-text" role="status">Loading case</p> : null}
            {detail ? (
              <CaseView detail={detail} status={status} client={client} ops={ops} onOpen={setDialog} onRerun={() => void runPipeline()} rerunBusy={runBusy} runError={runError} />
            ) : null}
          </div>
          {dialog && detail ? <ReviewDialog detail={detail} ops={ops} initial={dialog} onClose={() => setDialog(null)} /> : null}
        </main>
      ) : null}
      <footer className="app-footer">
        ScopeWatch counts native permission ALLOW decisions per policy subject in a rolling 600 second window. An ALLOW is a policy decision, not proof that data was read.
      </footer>
    </>
  );
}

function EmptyState({ mode, busy, onRun, error, status }: { mode: Provenance; busy: boolean; onRun: () => void; error: ApiClientError | null; status: StatusReport | null }) {
  const blocked = mode !== 'replay' && status && status.guild.status === 'unconfigured';
  return (
    <section className="panel" aria-labelledby="empty-h">
      <header><h2 id="empty-h">No cases yet</h2></header>
      <div className="panel-body">
        <p>
          {mode === 'replay'
            ? 'Run the replay pipeline to build a case from the synthetic fixture. Replay cases are labeled and can never be applied natively.'
            : 'Collect the registered launch cohort, seal it, publish to ClickHouse, read it back and evaluate. This needs a configured Guild account and a registered scenario.'}
        </p>
        {error ? <ErrorNotice error={error} /> : null}
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={onRun} disabled={busy || !!blocked} aria-describedby={blocked ? 'empty-why' : undefined}>
            {busy ? 'Running…' : mode === 'replay' ? 'Run replay pipeline' : 'Collect registered cohort and evaluate'}
          </button>
        </div>
        {blocked ? <p id="empty-why" className="why-disabled">Unavailable: Guild is not configured (see the notice above for the missing settings).</p> : null}
      </div>
    </section>
  );
}

function Login({ onSubmit, error, mode }: { onSubmit: (s: string) => void; error: ApiClientError | null; mode: Provenance }) {
  const [secret, setSecret] = useState('');
  const [busy, setBusy] = useState(false);
  return (
    <main id="main" className="login" aria-label="Sign in">
      <form
        className="panel"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          await onSubmit(secret);
          setBusy(false);
        }}
      >
        <header><h2>Operator sign-in</h2></header>
        <div className="panel-body">
          <p className="small muted">Login required. The operator secret is held server-side; it is never stored in this page. Run mode: {mode}.</p>
          <div className="field">
            <label htmlFor="login-secret">Operator secret</label>
            <input id="login-secret" type="password" autoComplete="current-password" value={secret} onChange={(e) => setSecret(e.target.value)} />
          </div>
          {error ? <ErrorNotice error={error} /> : null}
          <button type="submit" className="btn btn-primary" disabled={busy || !secret}>{busy ? 'Signing in…' : 'Sign in'}</button>
        </div>
      </form>
    </main>
  );
}

function CaseView({ detail, status, client, ops, onOpen, onRerun, rerunBusy, runError }: { detail: CaseDetail; status: StatusReport | null; client: ApiClient; ops: Ops; onOpen: (d: 'review' | 'handoff') => void; onRerun: () => void; rerunBusy: boolean; runError: ApiClientError | null }) {
  const restr = latestAction(detail, 'restriction');
  const captureAge = ageText(detail.generation.captureCutoff, status?.serverTime ?? null);
  const queryAge = ageText(detail.evaluation.evaluatedAt, status?.serverTime ?? null);
  const gaps = detail.readiness.gaps;
  const conflictGaps = gaps.filter((g) => g.kind.endsWith('conflict'));
  return (
    <>
      <section className="panel" aria-label="Case state">
        <div className="stateline">
          <dl className="kvs" style={{ flex: 1 }}>
            <div className="kv"><dt>Subject</dt><dd><strong>{detail.primaryLabel ?? 'No subject selected'}</strong></dd></div>
            <div className="kv"><dt>Evidence</dt><dd><Badge tone={toneOf(detail.evidenceState)}>{evidenceLabel(detail.evidenceState, detail.provenance)}</Badge></dd></div>
            <div className="kv"><dt>Action</dt><dd>{!restr && detail.provenance !== 'native' ? <Badge tone="neutral">Not action eligible ({detail.provenance === 'replay' ? 'replay' : 'contract test'})</Badge> : <Badge tone={toneOf(restr?.state ?? detail.actionState)}>{labelOf(restr?.state ?? detail.actionState)}</Badge>}</dd></div>
            <div className="kv"><dt>Captured up to</dt><dd className="mono">{detail.generation.captureCutoff}{captureAge ? ` (${captureAge})` : ''}</dd></div>
            <div className="kv"><dt>Last queried</dt><dd className="mono">{detail.evaluation.evaluatedAt}{queryAge ? ` (${queryAge})` : ''}</dd></div>
            <div className="kv"><dt>Generation</dt><dd><span className="id" title={detail.generation.generationId}>{shortId(detail.generation.generationId, 20)}</span> · {detail.generation.state.replace(/_/g, ' ')}</dd></div>
          </dl>
        </div>
      </section>

      {detail.evidenceState === 'evidence_incomplete' || !detail.readiness.ready ? (
        <Notice tone="warn" title="Partial coverage: counts are not definitive" role="status">
          <p>{detail.readiness.completeSessions} of {detail.readiness.cohortSessions} cohort sessions are complete. Missing or open evidence is unknown, not zero.</p>
          {gaps.length ? <ul>{gaps.map((g, i) => <li key={i}><strong>{g.kind.replace(/_/g, ' ')}</strong>: {g.detail}{g.sessionId ? <> (session <span className="id">{g.sessionId}</span>)</> : null}</li>)}</ul> : null}
        </Notice>
      ) : null}
      {detail.evidenceState === 'evidence_disputed' || detail.readiness.conflictKeys > 0 || conflictGaps.length ? (
        <Notice tone="bad" title="Integrity conflict: contradictory copies of the same event" role="alert">
          <p>{detail.readiness.conflictKeys} canonical event key(s) have contradictory stable fields. Conflicts are not resolved by picking the latest row; affected counts are unproven.</p>
          {conflictGaps.length ? <ul>{conflictGaps.map((g, i) => <li key={i}>{g.detail}</li>)}</ul> : null}
        </Notice>
      ) : null}
      {detail.evidenceState === 'no_breach' ? (
        <Notice tone="neutral" title="No candidate crossed its allowance" role="status">
          <p>This is a statement about the evaluated, complete cohort window only. It is not a safety verdict.</p>
        </Notice>
      ) : null}
      {detail.generation.state === 'readback_failed' ? (
        <Notice tone="bad" title="Analytical readback failed" role="alert"><p>The published facts did not read back equal to the journal: {(detail.generation.readback?.mismatches ?? []).join('; ') || 'no detail'}.</p></Notice>
      ) : null}
      {runError ? <ErrorNotice error={runError} /> : null}
      <div className="btn-row">
        <button type="button" className="btn" onClick={onRerun} disabled={rerunBusy} aria-describedby="rerun-note">{rerunBusy ? 'Running…' : status?.mode === 'replay' ? 'Re-run replay pipeline' : 'Re-collect registered cohort'}</button>
        <span id="rerun-note" className="small muted">Creates a new generation; existing approvals stay bound to their revision.</span>
      </div>

      <div className="cols">
        <div className="stack">
          <Comparison detail={detail} />
          <Timeline detail={detail} />
          <InvestigationPanel detail={detail} ops={ops} />
        </div>
        <aside className="stack" aria-label="Effect, queries and export">
          <EffectPanel detail={detail} ops={ops} onOpenReview={() => onOpen('review')} onOpenHandoff={() => onOpen('handoff')} />
          <QueryPanel detail={detail} />
          <ExportPanel detail={detail} client={client} />
        </aside>
      </div>
    </>
  );
}
