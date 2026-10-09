/**
 * SQLite journal: the local, transactional AUTHORITY (ARCH §5). One file per run mode; every fact/case/action row
 * carries `provenance`, and the journal refuses to write rows whose provenance differs from its mode (devil P0-2).
 * Transactions are short and synchronous: never held across an await of external IO.
 */
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { randomBytes } from 'node:crypto';
import type {
  ActionRecord,
  ActionState,
  EvaluationReceipt,
  EventBinding,
  EvidenceState,
  ExternalIntent,
  GenerationReceipt,
  GenerationState,
  IdentityDomainStatus,
  InvestigationReceipt,
  PinnedManifest,
  Provenance,
  RawObservation,
  ReadbackResult,
  ReadinessReport,
  SessionCoverage,
  VerificationReceipt,
  CandidateKey,
} from '../shared/contracts.js';
import type { RegisteredSession } from '../shared/ports.js';
import { StaleVersionError } from '../core/actions.js';
import { nowUtcNano } from '../core/time.js';

type Row = Record<string, unknown>;
const j = (v: unknown): string => JSON.stringify(v);
const p = <T>(s: unknown): T => JSON.parse(String(s)) as T;

export class JournalError extends Error {}
export class StaleCaseRevisionError extends Error {
  constructor(
    public readonly expected: number,
    public readonly actual: number,
  ) {
    super(`stale case revision: expected ${expected}, current ${actual}`);
  }
}

export interface GenerationRow extends GenerationReceipt {
  scenarioId: string | null;
  identityDomainStatus: IdentityDomainStatus;
  createdAt: string;
}

export interface CaseRow {
  caseId: string;
  provenance: Provenance;
  revision: number;
  evidenceState: EvidenceState;
  actionState: ActionState;
  primary: CandidateKey | null;
  primaryLabel: string | null;
  createdAt: string;
  updatedAt: string;
  generationId: string;
  evaluationId: string;
}

export interface CaseRevisionRow {
  caseId: string;
  revision: number;
  provenance: Provenance;
  generationId: string;
  evaluationId: string;
  evidenceState: EvidenceState;
  uncertainty: string[];
  createdAt: string;
}

export interface ScenarioRow {
  scenarioId: string;
  provenance: Provenance;
  manifestId: string;
  identityDomainStatus: IdentityDomainStatus;
  captureCutoff: string;
  source: string;
  createdAt: string;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS meta (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS manifests (
  manifest_id TEXT PRIMARY KEY, provenance TEXT NOT NULL, immutable_ref TEXT NOT NULL, sha256 TEXT NOT NULL,
  byte_length INTEGER NOT NULL, document_json TEXT NOT NULL, pinned_at TEXT NOT NULL, approved_by TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS scenarios (
  scenario_id TEXT PRIMARY KEY, provenance TEXT NOT NULL, manifest_id TEXT NOT NULL, identity_domain_status TEXT NOT NULL,
  capture_cutoff TEXT NOT NULL, source TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS launch_registry (
  launch_id TEXT PRIMARY KEY, scenario_id TEXT NOT NULL, provenance TEXT NOT NULL, workspace_id TEXT NOT NULL,
  session_id TEXT NOT NULL, profile TEXT NOT NULL, expected_subject TEXT NOT NULL, installed_agent_id TEXT NOT NULL,
  created_at TEXT NOT NULL, UNIQUE (scenario_id, workspace_id, session_id));
CREATE TABLE IF NOT EXISTS generations (
  generation_id TEXT PRIMARY KEY, seq INTEGER NOT NULL, provenance TEXT NOT NULL, state TEXT NOT NULL, scenario_id TEXT,
  manifest_id TEXT NOT NULL, manifest_sha256 TEXT NOT NULL, capture_cutoff TEXT NOT NULL, identity_domain_status TEXT NOT NULL,
  raw_count INTEGER NOT NULL DEFAULT 0, canonical_key_count INTEGER NOT NULL DEFAULT 0,
  semantic_digest TEXT NOT NULL DEFAULT '', binding_digest TEXT NOT NULL DEFAULT '', coverage_digest TEXT NOT NULL DEFAULT '',
  manifest_digest TEXT NOT NULL DEFAULT '', sealed_at TEXT, insert_ack_at TEXT, readback_json TEXT,
  parent_generation_id TEXT, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS raw_observations (
  observation_id TEXT PRIMARY KEY, generation_id TEXT NOT NULL, provenance TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS ix_raw_gen ON raw_observations (generation_id);
CREATE TABLE IF NOT EXISTS bindings (
  id INTEGER PRIMARY KEY AUTOINCREMENT, generation_id TEXT NOT NULL, native_identity_key TEXT NOT NULL,
  provenance TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS ix_bind_gen ON bindings (generation_id);
CREATE TABLE IF NOT EXISTS coverage (
  id INTEGER PRIMARY KEY AUTOINCREMENT, generation_id TEXT NOT NULL, workspace_id TEXT NOT NULL, session_id TEXT NOT NULL,
  provenance TEXT NOT NULL, json TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS ix_cov_gen ON coverage (generation_id);
CREATE TABLE IF NOT EXISTS readiness (generation_id TEXT PRIMARY KEY, provenance TEXT NOT NULL, json TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS evaluations (
  evaluation_id TEXT PRIMARY KEY, generation_id TEXT NOT NULL, provenance TEXT NOT NULL, json TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS evaluation_errors (
  id INTEGER PRIMARY KEY AUTOINCREMENT, generation_id TEXT NOT NULL, provenance TEXT NOT NULL, detail TEXT NOT NULL, created_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS query_receipts (
  query_id TEXT PRIMARY KEY, evaluation_id TEXT, generation_id TEXT, provenance TEXT NOT NULL, json TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cases (
  case_id TEXT PRIMARY KEY, provenance TEXT NOT NULL, revision INTEGER NOT NULL, evidence_state TEXT NOT NULL,
  action_state TEXT NOT NULL, primary_json TEXT, primary_label TEXT, generation_id TEXT NOT NULL, evaluation_id TEXT NOT NULL,
  manifest_sha256 TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS case_revisions (
  case_id TEXT NOT NULL, revision INTEGER NOT NULL, provenance TEXT NOT NULL, generation_id TEXT NOT NULL,
  evaluation_id TEXT NOT NULL, evidence_state TEXT NOT NULL, uncertainty_json TEXT NOT NULL, created_at TEXT NOT NULL,
  PRIMARY KEY (case_id, revision));
CREATE TABLE IF NOT EXISTS investigations (
  investigation_id TEXT PRIMARY KEY, case_id TEXT NOT NULL, case_revision INTEGER NOT NULL, provenance TEXT NOT NULL,
  json TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS actions (
  action_id TEXT PRIMARY KEY, case_id TEXT NOT NULL, provenance TEXT NOT NULL, kind TEXT NOT NULL, version INTEGER NOT NULL,
  state TEXT NOT NULL, case_revision INTEGER NOT NULL, json TEXT NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS ix_actions_case ON actions (case_id);
CREATE TABLE IF NOT EXISTS verifications (
  verification_id TEXT PRIMARY KEY, action_id TEXT NOT NULL, provenance TEXT NOT NULL, json TEXT NOT NULL, verified_at TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS external_intents (
  intent_id TEXT PRIMARY KEY, idempotency_ref TEXT NOT NULL UNIQUE, kind TEXT NOT NULL, related_id TEXT NOT NULL,
  provenance TEXT NOT NULL, outcome TEXT NOT NULL, created_at TEXT NOT NULL, resolved_at TEXT, detail TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS operator_sessions (
  session_id TEXT PRIMARY KEY, operator TEXT NOT NULL, csrf TEXT NOT NULL, created_at TEXT NOT NULL, expires_at_ms INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS history (
  id INTEGER PRIMARY KEY AUTOINCREMENT, at TEXT NOT NULL, entity TEXT NOT NULL, entity_id TEXT NOT NULL, provenance TEXT NOT NULL,
  from_state TEXT NOT NULL, to_state TEXT NOT NULL, by TEXT NOT NULL, note TEXT NOT NULL);
`;

const GEN_ORDER: GenerationState[] = ['collecting', 'sealed', 'inserted', 'readback_confirmed', 'evaluated'];

export class Journal {
  readonly db: DatabaseSync;
  private depth = 0;

  constructor(
    readonly path: string,
    readonly mode: Provenance,
  ) {
    if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true });
    this.db = new DatabaseSync(path);
    if (path !== ':memory:') this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;');
    this.db.exec(SCHEMA);
    const m = this.db.prepare('SELECT value FROM meta WHERE key = ?').get('mode') as Row | undefined;
    if (!m) this.db.prepare('INSERT INTO meta (key, value) VALUES (?, ?)').run('mode', mode);
    else if (m['value'] !== mode) throw new JournalError(`journal file ${path} belongs to mode ${String(m['value'])}, not ${mode}`);
  }

  close(): void {
    this.db.close();
  }

  /** Short synchronous transaction. Never await inside. */
  tx<T>(fn: () => T): T {
    if (this.depth > 0) return fn();
    this.db.exec('BEGIN IMMEDIATE');
    this.depth = 1;
    try {
      const r = fn();
      this.db.exec('COMMIT');
      return r;
    } catch (e) {
      this.db.exec('ROLLBACK');
      throw e;
    } finally {
      this.depth = 0;
    }
  }

  private guard(prov: Provenance): void {
    if (prov !== this.mode) throw new JournalError(`provenance ${prov} may not be written to a ${this.mode} journal`);
  }
  private get(sql: string, ...args: Array<string | number | null>): Row | undefined {
    return this.db.prepare(sql).get(...args) as Row | undefined;
  }
  private all(sql: string, ...args: Array<string | number | null>): Row[] {
    return this.db.prepare(sql).all(...args) as Row[];
  }
  private run(sql: string, ...args: Array<string | number | null>): number {
    return Number(this.db.prepare(sql).run(...args).changes);
  }

  // ---- manifests / scenarios / registry ----
  saveManifest(m: PinnedManifest): void {
    this.guard(m.provenance);
    this.run(
      'INSERT OR IGNORE INTO manifests (manifest_id, provenance, immutable_ref, sha256, byte_length, document_json, pinned_at, approved_by) VALUES (?,?,?,?,?,?,?,?)',
      m.manifestId, m.provenance, m.immutableRef, m.sha256, m.byteLength, j(m.document), m.pinnedAt, m.approvedBy,
    );
  }
  getManifest(id: string): PinnedManifest | null {
    const r = this.get('SELECT * FROM manifests WHERE manifest_id = ?', id);
    if (!r) return null;
    return {
      manifestId: String(r['manifest_id']), provenance: r['provenance'] as Provenance, immutableRef: String(r['immutable_ref']),
      sha256: String(r['sha256']), byteLength: Number(r['byte_length']), document: p(r['document_json']),
      pinnedAt: String(r['pinned_at']), approvedBy: String(r['approved_by']),
    };
  }
  saveScenario(s: ScenarioRow, registry: RegisteredSession[]): void {
    this.guard(s.provenance);
    this.tx(() => {
      this.run(
        'INSERT OR REPLACE INTO scenarios (scenario_id, provenance, manifest_id, identity_domain_status, capture_cutoff, source, created_at) VALUES (?,?,?,?,?,?,?)',
        s.scenarioId, s.provenance, s.manifestId, s.identityDomainStatus, s.captureCutoff, s.source, s.createdAt,
      );
      for (const r of registry) {
        this.run(
          'INSERT OR REPLACE INTO launch_registry (launch_id, scenario_id, provenance, workspace_id, session_id, profile, expected_subject, installed_agent_id, created_at) VALUES (?,?,?,?,?,?,?,?,?)',
          r.launchId, s.scenarioId, s.provenance, r.workspaceId, r.sessionId, r.profile, r.expectedPolicySubjectId, r.installedAgentId, nowUtcNano(),
        );
      }
    });
  }
  getScenario(id: string): ScenarioRow | null {
    const r = this.get('SELECT * FROM scenarios WHERE scenario_id = ?', id);
    return r ? this.scenarioRow(r) : null;
  }
  latestScenario(): ScenarioRow | null {
    const r = this.get('SELECT * FROM scenarios ORDER BY rowid DESC LIMIT 1');
    return r ? this.scenarioRow(r) : null;
  }
  private scenarioRow(r: Row): ScenarioRow {
    return {
      scenarioId: String(r['scenario_id']), provenance: r['provenance'] as Provenance, manifestId: String(r['manifest_id']),
      identityDomainStatus: r['identity_domain_status'] as IdentityDomainStatus, captureCutoff: String(r['capture_cutoff']),
      source: String(r['source']), createdAt: String(r['created_at']),
    };
  }
  getRegistry(scenarioId: string): RegisteredSession[] {
    return this.all('SELECT * FROM launch_registry WHERE scenario_id = ? ORDER BY workspace_id, session_id', scenarioId).map((r) => ({
      workspaceId: String(r['workspace_id']), sessionId: String(r['session_id']), launchId: String(r['launch_id']),
      profile: r['profile'] as RegisteredSession['profile'], expectedPolicySubjectId: String(r['expected_subject']),
      installedAgentId: String(r['installed_agent_id']),
    }));
  }

  // ---- generations ----
  createGeneration(g: {
    generationId: string; provenance: Provenance; manifestId: string; manifestSha256: string; captureCutoff: string;
    identityDomainStatus: IdentityDomainStatus; scenarioId: string | null; parentGenerationId: string | null;
  }): void {
    this.guard(g.provenance);
    const seq = Number((this.get('SELECT COALESCE(MAX(seq),0)+1 AS n FROM generations') as Row)['n']);
    this.run(
      `INSERT INTO generations (generation_id, seq, provenance, state, scenario_id, manifest_id, manifest_sha256, capture_cutoff,
        identity_domain_status, parent_generation_id, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      g.generationId, seq, g.provenance, 'collecting', g.scenarioId, g.manifestId, g.manifestSha256, g.captureCutoff,
      g.identityDomainStatus, g.parentGenerationId, nowUtcNano(),
    );
  }
  getGeneration(id: string): GenerationRow | null {
    const r = this.get('SELECT * FROM generations WHERE generation_id = ?', id);
    return r ? this.genRow(r) : null;
  }
  listGenerations(): GenerationRow[] {
    return this.all('SELECT * FROM generations ORDER BY seq DESC').map((r) => this.genRow(r));
  }
  private genRow(r: Row): GenerationRow {
    return {
      generationId: String(r['generation_id']), provenance: r['provenance'] as Provenance, state: r['state'] as GenerationState,
      manifestId: String(r['manifest_id']), manifestSha256: String(r['manifest_sha256']), captureCutoff: String(r['capture_cutoff']),
      rawCount: Number(r['raw_count']), canonicalKeyCount: Number(r['canonical_key_count']), semanticDigest: String(r['semantic_digest']),
      bindingDigest: String(r['binding_digest']), coverageDigest: String(r['coverage_digest']), manifestDigest: String(r['manifest_digest']),
      sealedAt: (r['sealed_at'] as string | null) ?? null, insertAckAt: (r['insert_ack_at'] as string | null) ?? null,
      readback: r['readback_json'] ? p<ReadbackResult>(r['readback_json']) : null,
      parentGenerationId: (r['parent_generation_id'] as string | null) ?? null,
      scenarioId: (r['scenario_id'] as string | null) ?? null, identityDomainStatus: r['identity_domain_status'] as IdentityDomainStatus,
      createdAt: String(r['created_at']),
    };
  }
  private requireState(id: string, state: GenerationState): GenerationRow {
    const g = this.getGeneration(id);
    if (!g) throw new JournalError(`unknown generation ${id}`);
    if (g.state !== state) throw new JournalError(`generation ${id} is ${g.state}; expected ${state}`);
    return g;
  }
  addObservations(generationId: string, obs: RawObservation[]): void {
    this.tx(() => {
      this.requireState(generationId, 'collecting');
      for (const o of obs) {
        this.guard(o.provenance);
        if (o.generationId !== generationId) throw new JournalError('observation generation mismatch');
        this.run('INSERT INTO raw_observations (observation_id, generation_id, provenance, json) VALUES (?,?,?,?)', o.observationId, generationId, o.provenance, j(o));
      }
    });
  }
  addBindings(generationId: string, bs: EventBinding[]): void {
    this.tx(() => {
      this.requireState(generationId, 'collecting');
      for (const b of bs) this.run('INSERT INTO bindings (generation_id, native_identity_key, provenance, json) VALUES (?,?,?,?)', generationId, b.nativeIdentityKey, this.mode, j(b));
    });
  }
  addCoverage(generationId: string, cs: SessionCoverage[]): void {
    this.tx(() => {
      this.requireState(generationId, 'collecting');
      for (const c of cs) this.run('INSERT INTO coverage (generation_id, workspace_id, session_id, provenance, json) VALUES (?,?,?,?,?)', generationId, c.workspaceId, c.sessionId, this.mode, j(c));
    });
  }
  getObservations(generationId: string): RawObservation[] {
    return this.all('SELECT json FROM raw_observations WHERE generation_id = ? ORDER BY observation_id', generationId).map((r) => p<RawObservation>(r['json']));
  }
  getBindings(generationId: string): EventBinding[] {
    return this.all('SELECT json FROM bindings WHERE generation_id = ? ORDER BY id', generationId).map((r) => p<EventBinding>(r['json']));
  }
  getCoverage(generationId: string): SessionCoverage[] {
    return this.all('SELECT json FROM coverage WHERE generation_id = ? ORDER BY id', generationId).map((r) => p<SessionCoverage>(r['json']));
  }
  /** Copies all rows into a fresh collecting generation (retry never blind re-inserts into the old id). */
  cloneGenerationRows(fromId: string, toId: string): void {
    this.tx(() => {
      for (const o of this.getObservations(fromId)) {
        this.run(
          'INSERT INTO raw_observations (observation_id, generation_id, provenance, json) VALUES (?,?,?,?)',
          `${o.observationId}@${toId}`, toId, o.provenance, j({ ...o, observationId: `${o.observationId}@${toId}`, generationId: toId }),
        );
      }
      this.addBindings(toId, this.getBindings(fromId).map((b) => ({ ...b, generationId: toId })));
      this.addCoverage(toId, this.getCoverage(fromId).map((c) => ({ ...c, generationId: toId })));
    });
  }
  saveReadiness(r: ReadinessReport): void {
    this.run('INSERT OR REPLACE INTO readiness (generation_id, provenance, json, created_at) VALUES (?,?,?,?)', r.generationId, this.mode, j(r), nowUtcNano());
  }
  getReadiness(generationId: string): ReadinessReport | null {
    const r = this.get('SELECT json FROM readiness WHERE generation_id = ?', generationId);
    return r ? p<ReadinessReport>(r['json']) : null;
  }
  /** collecting -> sealed. After this no rows can be added; digests are fixed. */
  sealGeneration(id: string, d: { rawCount: number; canonicalKeyCount: number; semanticDigest: string; bindingDigest: string; coverageDigest: string; manifestDigest: string }): void {
    this.tx(() => {
      this.requireState(id, 'collecting');
      this.run(
        'UPDATE generations SET state = ?, raw_count = ?, canonical_key_count = ?, semantic_digest = ?, binding_digest = ?, coverage_digest = ?, manifest_digest = ?, sealed_at = ? WHERE generation_id = ? AND state = ?',
        'sealed', d.rawCount, d.canonicalKeyCount, d.semanticDigest, d.bindingDigest, d.coverageDigest, d.manifestDigest, nowUtcNano(), id, 'collecting',
      );
    });
  }
  /** Forward-only generation state transitions with from-state CAS. */
  advanceGeneration(id: string, from: GenerationState, to: GenerationState, extra: { insertAckAt?: string; readback?: ReadbackResult } = {}): void {
    const okForward = GEN_ORDER.indexOf(to) === GEN_ORDER.indexOf(from) + 1 || (from === 'inserted' && to === 'readback_failed');
    if (!okForward) throw new JournalError(`illegal generation transition ${from} -> ${to}`);
    const n = this.run(
      'UPDATE generations SET state = ?, insert_ack_at = COALESCE(?, insert_ack_at), readback_json = COALESCE(?, readback_json) WHERE generation_id = ? AND state = ?',
      to, extra.insertAckAt ?? null, extra.readback ? j(extra.readback) : null, id, from,
    );
    if (n !== 1) throw new JournalError(`generation ${id} was not in state ${from}`);
  }

  // ---- evaluations ----
  saveEvaluation(e: EvaluationReceipt): void {
    this.guard(e.provenance);
    this.tx(() => {
      this.run('INSERT INTO evaluations (evaluation_id, generation_id, provenance, json, created_at) VALUES (?,?,?,?,?)', e.evaluationId, e.generationId, e.provenance, j(e), e.evaluatedAt);
      for (const q of e.queries) {
        this.run('INSERT OR REPLACE INTO query_receipts (query_id, evaluation_id, generation_id, provenance, json) VALUES (?,?,?,?,?)', q.queryId, e.evaluationId, e.generationId, e.provenance, j(q));
      }
    });
  }
  getEvaluation(id: string): EvaluationReceipt | null {
    const r = this.get('SELECT json FROM evaluations WHERE evaluation_id = ?', id);
    return r ? p<EvaluationReceipt>(r['json']) : null;
  }
  saveEvaluationError(generationId: string, detail: string): void {
    this.run('INSERT INTO evaluation_errors (generation_id, provenance, detail, created_at) VALUES (?,?,?,?)', generationId, this.mode, detail, nowUtcNano());
  }
  listEvaluationErrors(generationId: string): string[] {
    return this.all('SELECT detail FROM evaluation_errors WHERE generation_id = ? ORDER BY id', generationId).map((r) => String(r['detail']));
  }

  // ---- cases ----
  getCase(caseId: string): CaseRow | null {
    const r = this.get('SELECT * FROM cases WHERE case_id = ?', caseId);
    return r ? this.caseRow(r) : null;
  }
  listCases(): CaseRow[] {
    return this.all('SELECT * FROM cases ORDER BY updated_at DESC, case_id').map((r) => this.caseRow(r));
  }
  private caseRow(r: Row): CaseRow {
    return {
      caseId: String(r['case_id']), provenance: r['provenance'] as Provenance, revision: Number(r['revision']),
      evidenceState: r['evidence_state'] as EvidenceState, actionState: r['action_state'] as ActionState,
      primary: r['primary_json'] ? p<CandidateKey>(r['primary_json']) : null, primaryLabel: (r['primary_label'] as string | null) ?? null,
      createdAt: String(r['created_at']), updatedAt: String(r['updated_at']), generationId: String(r['generation_id']), evaluationId: String(r['evaluation_id']),
    };
  }
  getCaseRevision(caseId: string, revision: number): CaseRevisionRow | null {
    const r = this.get('SELECT * FROM case_revisions WHERE case_id = ? AND revision = ?', caseId, revision);
    if (!r) return null;
    return {
      caseId, revision, provenance: r['provenance'] as Provenance, generationId: String(r['generation_id']), evaluationId: String(r['evaluation_id']),
      evidenceState: r['evidence_state'] as EvidenceState, uncertainty: p<string[]>(r['uncertainty_json']), createdAt: String(r['created_at']),
    };
  }
  listCaseRevisions(caseId: string): CaseRevisionRow[] {
    return this.all('SELECT revision FROM case_revisions WHERE case_id = ? ORDER BY revision', caseId).map((r) => this.getCaseRevision(caseId, Number(r['revision'])) as CaseRevisionRow);
  }
  /**
   * Create the case (revision 1) or append revision N+1 (expectedRevision must equal the current one).
   * A new revision marks pre-effect actions of older revisions 'stale' (approval no longer matches evidence).
   */
  saveCaseRevision(a: {
    caseId: string; provenance: Provenance; expectedRevision: number; generationId: string; evaluationId: string; manifestSha256: string;
    evidenceState: EvidenceState; primary: CandidateKey | null; primaryLabel: string | null; uncertainty: string[];
  }): number {
    this.guard(a.provenance);
    return this.tx(() => {
      const cur = this.getCase(a.caseId);
      const curRev = cur?.revision ?? 0;
      if (curRev !== a.expectedRevision) throw new StaleCaseRevisionError(a.expectedRevision, curRev);
      const rev = curRev + 1;
      const now = nowUtcNano();
      this.run(
        'INSERT INTO case_revisions (case_id, revision, provenance, generation_id, evaluation_id, evidence_state, uncertainty_json, created_at) VALUES (?,?,?,?,?,?,?,?)',
        a.caseId, rev, a.provenance, a.generationId, a.evaluationId, a.evidenceState, j(a.uncertainty), now,
      );
      if (!cur) {
        this.run(
          'INSERT INTO cases (case_id, provenance, revision, evidence_state, action_state, primary_json, primary_label, generation_id, evaluation_id, manifest_sha256, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)',
          a.caseId, a.provenance, rev, a.evidenceState, a.evidenceState === 'review_ready' && a.provenance !== 'replay' ? 'review_ready' : 'none', a.primary ? j(a.primary) : null, a.primaryLabel, a.generationId, a.evaluationId, a.manifestSha256, now, now,
        );
      } else {
        this.run(
          'UPDATE cases SET revision = ?, evidence_state = ?, primary_json = ?, primary_label = ?, generation_id = ?, evaluation_id = ?, manifest_sha256 = ?, updated_at = ? WHERE case_id = ? AND revision = ?',
          rev, a.evidenceState, a.primary ? j(a.primary) : null, a.primaryLabel, a.generationId, a.evaluationId, a.manifestSha256, now, a.caseId, curRev,
        );
        for (const act of this.listActions(a.caseId)) {
          if (act.caseRevision < rev && ['review_ready', 'approved', 'native_application_pending', 'native_application_unknown'].includes(act.state) && act.kind === 'restriction') {
            this.casAction({ ...act, state: 'stale', version: act.version + 1, history: [...act.history, { at: now, from: act.state, to: 'stale', by: 'system', note: `case advanced to revision ${rev}` }] }, act.version);
          }
        }
        this.refreshCaseActionState(a.caseId);
      }
      return rev;
    });
  }
  /** Late conflict after an effect: preserve receipts, mark effect-possible actions disputed (no auto-release). */
  markEffectActionsDisputed(manifestSha256: string, note: string): string[] {
    return this.tx(() => {
      const touched: string[] = [];
      for (const c of this.all('SELECT case_id FROM cases WHERE manifest_sha256 = ?', manifestSha256)) {
        for (const act of this.listActions(String(c['case_id']))) {
          if (act.kind === 'restriction' && ['native_application_observed', 'verification_pending', 'verification_failed', 'verification_unknown', 'restriction_verified', 'simulated_restriction_observed'].includes(act.state)) {
            const now = nowUtcNano();
            this.casAction({ ...act, state: 'disputed', version: act.version + 1, history: [...act.history, { at: now, from: act.state, to: 'disputed', by: 'system', note }] }, act.version);
            touched.push(act.actionId);
          }
        }
        this.run('UPDATE cases SET evidence_state = ?, updated_at = ? WHERE case_id = ?', 'evidence_disputed', nowUtcNano(), String(c['case_id']));
        this.refreshCaseActionState(String(c['case_id']));
      }
      return touched;
    });
  }
  /**
   * A later generation has integrity conflicts: every case on this manifest gets a NEW revision marked
   * evidence_disputed (pre-effect approvals become stale), applied effects keep receipts but go to `disputed`.
   */
  disputeCases(manifestSha256: string, note: string): { cases: string[]; actions: string[] } {
    return this.tx(() => {
      const cases: string[] = [];
      for (const c of this.all('SELECT case_id FROM cases WHERE manifest_sha256 = ?', manifestSha256)) {
        const cur = this.getCase(String(c['case_id'])) as CaseRow;
        const rev = this.getCaseRevision(cur.caseId, cur.revision) as CaseRevisionRow;
        this.saveCaseRevision({
          caseId: cur.caseId, provenance: cur.provenance, expectedRevision: cur.revision, generationId: cur.generationId, evaluationId: cur.evaluationId,
          manifestSha256, evidenceState: 'evidence_disputed', primary: cur.primary, primaryLabel: cur.primaryLabel, uncertainty: [`DISPUTED: ${note}`, ...rev.uncertainty],
        });
        cases.push(cur.caseId);
      }
      return { cases, actions: this.markEffectActionsDisputed(manifestSha256, note) };
    });
  }
  caseForGeneration(generationId: string): string | null {
    const r = this.get('SELECT case_id FROM case_revisions WHERE generation_id = ? ORDER BY rowid DESC LIMIT 1', generationId);
    return r ? String(r['case_id']) : null;
  }
  listPendingVerifications(): ActionRecord[] {
    return this.all("SELECT action_id FROM actions WHERE state IN ('verification_pending')").map((r) => this.getAction(String(r['action_id'])) as ActionRecord);
  }
  refreshCaseActionState(caseId: string): void {
    const c = this.getCase(caseId);
    if (!c) return;
    const acts = this.listActions(caseId).filter((a) => a.kind === 'restriction');
    const latest = acts[acts.length - 1];
    const s: ActionState = latest ? (latest.state as ActionState) : c.evidenceState === 'review_ready' && c.provenance !== 'replay' ? 'review_ready' : 'none';
    this.run('UPDATE cases SET action_state = ?, updated_at = ? WHERE case_id = ?', s, nowUtcNano(), caseId);
  }

  // ---- investigations ----
  saveInvestigation(i: InvestigationReceipt): void {
    this.guard(i.provenance);
    this.run('INSERT OR REPLACE INTO investigations (investigation_id, case_id, case_revision, provenance, json, updated_at) VALUES (?,?,?,?,?,?)', i.investigationId, i.caseId, i.caseRevision, i.provenance, j(i), i.updatedAt);
  }
  latestInvestigation(caseId: string): InvestigationReceipt | null {
    const r = this.get('SELECT json FROM investigations WHERE case_id = ? ORDER BY rowid DESC LIMIT 1', caseId);
    return r ? p<InvestigationReceipt>(r['json']) : null;
  }

  // ---- actions ----
  createAction(a: ActionRecord): void {
    this.guard(a.provenance);
    if (a.version !== 1) throw new JournalError('new actions start at version 1');
    this.tx(() => {
      const { verifications: _v, ...rest } = a;
      this.run('INSERT INTO actions (action_id, case_id, provenance, kind, version, state, case_revision, json, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?)', a.actionId, a.caseId, a.provenance, a.kind, a.version, a.state, a.caseRevision, j(rest), nowUtcNano(), nowUtcNano());
      this.refreshCaseActionState(a.caseId);
    });
  }
  getAction(id: string): ActionRecord | null {
    const r = this.get('SELECT * FROM actions WHERE action_id = ?', id);
    return r ? this.actionRow(r) : null;
  }
  listActions(caseId: string): ActionRecord[] {
    return this.all('SELECT * FROM actions WHERE case_id = ? ORDER BY rowid', caseId).map((r) => this.actionRow(r));
  }
  private actionRow(r: Row): ActionRecord {
    const base = p<Omit<ActionRecord, 'verifications'>>(r['json']);
    const verifications = this.all('SELECT json FROM verifications WHERE action_id = ? ORDER BY rowid', String(r['action_id'])).map((v) => p<VerificationReceipt>(v['json']));
    return { ...base, version: Number(r['version']), state: r['state'] as ActionRecord['state'], verifications };
  }
  /** Compare-and-set on action.version. `next.version` must be expectedVersion+1. */
  casAction(next: ActionRecord, expectedVersion: number): void {
    this.guard(next.provenance);
    if (next.version !== expectedVersion + 1) throw new JournalError('casAction requires version = expected + 1');
    this.tx(() => {
      const { verifications: _v, ...rest } = next;
      const n = this.run('UPDATE actions SET version = ?, state = ?, json = ?, updated_at = ? WHERE action_id = ? AND version = ?', next.version, next.state, j(rest), nowUtcNano(), next.actionId, expectedVersion);
      if (n !== 1) {
        const cur = this.get('SELECT version FROM actions WHERE action_id = ?', next.actionId);
        throw new StaleVersionError(expectedVersion, cur ? Number(cur['version']) : -1);
      }
      this.refreshCaseActionState(next.caseId);
    });
  }
  saveVerification(v: VerificationReceipt): void {
    this.guard(v.provenance);
    this.run('INSERT INTO verifications (verification_id, action_id, provenance, json, verified_at) VALUES (?,?,?,?,?)', v.verificationId, v.actionId, v.provenance, j(v), v.verifiedAt);
  }

  // ---- external intents ----
  createIntent(i: Omit<ExternalIntent, 'intentId' | 'createdAt' | 'resolvedAt' | 'outcome'>, provenance: Provenance): ExternalIntent {
    this.guard(provenance);
    const full: ExternalIntent = { ...i, intentId: `int-${randomBytes(6).toString('hex')}`, outcome: 'pending', createdAt: nowUtcNano(), resolvedAt: null };
    this.run('INSERT INTO external_intents (intent_id, idempotency_ref, kind, related_id, provenance, outcome, created_at, resolved_at, detail) VALUES (?,?,?,?,?,?,?,?,?)', full.intentId, full.idempotencyRef, full.kind, full.relatedId, provenance, full.outcome, full.createdAt, null, full.detail);
    return full;
  }
  resolveIntent(intentId: string, outcome: ExternalIntent['outcome'], detail: string): void {
    this.run('UPDATE external_intents SET outcome = ?, resolved_at = ?, detail = ? WHERE intent_id = ?', outcome, nowUtcNano(), detail, intentId);
  }
  getIntentByRef(ref: string): ExternalIntent | null {
    const r = this.get('SELECT * FROM external_intents WHERE idempotency_ref = ?', ref);
    return r ? this.intentRow(r) : null;
  }
  listIntents(relatedId: string): ExternalIntent[] {
    return this.all('SELECT * FROM external_intents WHERE related_id = ? ORDER BY rowid', relatedId).map((r) => this.intentRow(r));
  }
  private intentRow(r: Row): ExternalIntent {
    return {
      intentId: String(r['intent_id']), idempotencyRef: String(r['idempotency_ref']), kind: r['kind'] as ExternalIntent['kind'],
      relatedId: String(r['related_id']), outcome: r['outcome'] as ExternalIntent['outcome'], createdAt: String(r['created_at']),
      resolvedAt: (r['resolved_at'] as string | null) ?? null, detail: String(r['detail']),
    };
  }

  // ---- operator sessions ----
  createOperatorSession(operator: string, ttlMs = 8 * 3600_000): { sessionId: string; csrf: string } {
    const sessionId = randomBytes(32).toString('base64url');
    const csrf = randomBytes(24).toString('base64url');
    this.run('INSERT INTO operator_sessions (session_id, operator, csrf, created_at, expires_at_ms) VALUES (?,?,?,?,?)', sessionId, operator, csrf, nowUtcNano(), Date.now() + ttlMs);
    return { sessionId, csrf };
  }
  getOperatorSession(sessionId: string): { operator: string; csrf: string } | null {
    const r = this.get('SELECT * FROM operator_sessions WHERE session_id = ?', sessionId);
    if (!r) return null;
    if (Number(r['expires_at_ms']) < Date.now()) {
      this.run('DELETE FROM operator_sessions WHERE session_id = ?', sessionId);
      return null;
    }
    return { operator: String(r['operator']), csrf: String(r['csrf']) };
  }
  deleteOperatorSession(sessionId: string): void {
    this.run('DELETE FROM operator_sessions WHERE session_id = ?', sessionId);
  }

  lastTimes(): { lastCaptureAt: string | null; lastEvaluationAt: string | null } {
    const c = this.get('SELECT sealed_at FROM generations WHERE sealed_at IS NOT NULL ORDER BY seq DESC LIMIT 1');
    const e = this.get('SELECT created_at FROM evaluations ORDER BY rowid DESC LIMIT 1');
    return { lastCaptureAt: (c?.['sealed_at'] as string | undefined) ?? null, lastEvaluationAt: (e?.['created_at'] as string | undefined) ?? null };
  }

  // ---- history ----
  addHistory(entity: string, entityId: string, from: string, to: string, by: string, note: string): void {
    this.run('INSERT INTO history (at, entity, entity_id, provenance, from_state, to_state, by, note) VALUES (?,?,?,?,?,?,?,?)', nowUtcNano(), entity, entityId, this.mode, from, to, by, note);
  }
  listHistory(entityId: string): Array<{ at: string; entity: string; from: string; to: string; by: string; note: string }> {
    return this.all('SELECT * FROM history WHERE entity_id = ? ORDER BY id', entityId).map((r) => ({
      at: String(r['at']), entity: String(r['entity']), from: String(r['from_state']), to: String(r['to_state']), by: String(r['by']), note: String(r['note']),
    }));
  }
}
