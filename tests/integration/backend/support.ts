/**
 * Test support. FakeGuildPort is a TEST DOUBLE: it returns scripted values and is NOT native evidence.
 * seedCase() builds a journal case from the independent oracle (no ClickHouse) so HTTP/action behavior can be tested hermetically.
 */
import type { CandidateResult, EvaluationReceipt, Provenance, ProbeResult, Witness } from '../../../src/shared/contracts.js';
import type { BindingInput, BindingResult, CollectedSession, GuildPort, InvestigationContext, LaunchProfile, LaunchReceipt, ProbeRequest, RegisteredSession } from '../../../src/shared/ports.js';
import { loadConfig, type AppConfig } from '../../../src/server/config.js';
import { Journal } from '../../../src/storage/journal.js';
import type { Services } from '../../../src/server/services/context.js';
import { assessReadiness } from '../../../src/core/admission.js';
import { bindingDigest, canonicalize, coverageDigest, manifestDigest, semanticDigest } from '../../../src/core/canonicalize.js';
import { runOracle, type OracleWitness } from '../../../src/core/oracle.js';
import { rankBreaches } from '../../../src/core/selection.js';
import { formatUtcNano, nowUtcNano, parseUtcNano } from '../../../src/core/time.js';
import { recordCase } from '../../../src/server/services/cases.js';
import { SEC, T0, build, manifestDoc, pinned, registry, run } from '../../unit/core/fixtures.js';

export const SECRET = 'test-operator-secret-0123456789';
export const ORIGIN = 'http://127.0.0.1:4317';
export const HOST = '127.0.0.1:4317';

export function testConfig(mode: 'replay' | 'contract_test' | 'native' = 'replay'): AppConfig {
  return loadConfig({
    SCOPEWATCH_MODE: mode,
    SCOPEWATCH_OPERATOR_SECRET: SECRET,
    ...(mode === 'contract_test' ? { GUILD_API_BASE_URL: 'http://127.0.0.1:4010' } : {}),
  } as NodeJS.ProcessEnv);
}

export type ProbeScript = Partial<Record<'target' | 'control', Partial<ProbeResult> & { throwError?: boolean }>>;

/** FAKE GuildPort: scripted, labeled test double. */
export class FakeGuildPort implements GuildPort {
  readonly provenance: Provenance;
  probeCalls: ProbeRequest[] = [];
  probeScript: ProbeScript = {};
  collectFails = new Set<string>();
  bindState: 'verified' | 'unresolved' = 'verified';
  constructor(provenance: Provenance = 'contract_test') {
    this.provenance = provenance;
  }
  async health() {
    return { ok: true, detail: 'FAKE test double', missing: [] };
  }
  async launch(profile: LaunchProfile, _in: string, ref: string): Promise<LaunchReceipt> {
    return { launchId: `l-${ref}`, provenance: this.provenance, profile, requestedInstalledAgentId: 'inst', route: 'api_trigger', nativeSessionId: `sess-${ref}`, nativeRootTaskId: null, workspaceId: 'ws-test', returnedAgentRef: null, returnedVersionId: null, sessionType: 'api_trigger', startedAt: nowUtcNano(), nativeCreatedAt: null, idempotencyRef: ref, outcome: 'created', error: null };
  }
  async awaitCompletion() {
    return 'DONE';
  }
  async collectSession(reg: RegisteredSession, generationId: string): Promise<CollectedSession> {
    if (this.collectFails.has(reg.sessionId)) throw new Error(`fake: collection of ${reg.sessionId} failed`);
    const b = build(generationId, run(`ev-${reg.sessionId}`, reg.expectedPolicySubjectId, [reg.sessionId], 3, T0, 20), [reg.sessionId], { provenance: this.provenance });
    return { provenance: this.provenance, workspaceId: reg.workspaceId, sessionId: reg.sessionId, sessionStatus: 'DONE', complete: true, observations: b.observations, tasks: [], coverage: b.coverage[0]!, pageRefs: ['p1'], errors: [] };
  }
  bindEvents(input: BindingInput): BindingResult {
    const bindings = input.observations.map((o) => ({
      generationId: input.generationId, nativeIdentityKey: o.nativeIdentityKey!, policySubjectId: this.bindState === 'verified' ? input.registry.find((r) => r.sessionId === o.sessionId)!.expectedPolicySubjectId : null,
      bindingState: this.bindState, nativeActingTaskId: o.nativeTaskId, mappingMethod: 'fake', proofRef: 'fake', ...(this.bindState === 'unresolved' ? { reason: 'fake unresolved' } : {}),
    }));
    return { bindings, diagnostics: [] };
  }
  async runInvestigation(ctx: InvestigationContext) {
    const f = ctx.facts as { primary: { policySubjectId: string; firstCrossing: { count: string } | null } };
    return {
      investigationId: 'x', caseId: ctx.caseId, caseRevision: ctx.caseRevision, provenance: this.provenance, state: 'created' as const, contextSha256: ctx.contextSha256, nativeSessionId: 'fake-sess', nativeTaskId: null,
      contextReadRef: null, incidentUrl: 'https://example.invalid/fake', narrative: `FAKE narrative: ${f.primary.policySubjectId} made ${f.primary.firstCrossing?.count} approvals and also exfiltrated 999 records.`, grounded: null, checks: [], unavailableReason: null, updatedAt: nowUtcNano(),
    };
  }
  async runProbe(req: ProbeRequest): Promise<ProbeResult> {
    this.probeCalls.push(req);
    const s = this.probeScript[req.role] ?? {};
    if (s.throwError) throw new Error('fake probe timeout');
    const started = formatUtcNano(parseUtcNano(req.notBefore) + SEC);
    const refused = req.role === 'target';
    const { throwError: _t, ...rest } = s;
    return {
      role: req.role, provenance: this.provenance, launchId: `probe-${req.idempotencyRef}`, nativeSessionId: `ps-${req.role}`, nativeEventIds: ['pe'], decision: refused ? 'DENY' : 'ALLOW', reasonCode: refused ? 'POLICY_DENIED' : null,
      boundSubjectId: refused ? req.scope.policySubjectId : 'subj-control', credentialId: req.scope.credentialId, inspection: 'FAKE inspection', outcome: refused ? 'refused_policy' : 'succeeded_expected', startedAt: started, completedAt: started, ...rest,
    };
  }
  async reconcileLaunch(_ref: string): Promise<LaunchReceipt | null> {
    return null;
  }
}

export function services(mode: 'replay' | 'contract_test' | 'native', guild: GuildPort | null = null): Services {
  const config = testConfig(mode);
  return { config, journal: new Journal(':memory:', mode), ch: null, chStatus: { status: 'unconfigured', detail: 'test: no ClickHouse' }, guild, rootDir: process.cwd() };
}

function w(o: OracleWitness | null, allowance: bigint): Witness | null {
  return o ? { anchor: formatUtcNano(o.anchorNs), anchorNs: o.anchorNs.toString(), count: o.count.toString(), allowance: allowance.toString(), identityKeys: o.identityKeys, sessions: o.sessions.map((s) => ({ sessionId: s.sessionId, count: s.count.toString() })), queryId: null } : null;
}

/** Create a fully evaluated case (generation evaluated, readiness ready) from oracle output. No ClickHouse involved. */
export function seedCase(svc: Services, opts: { subject?: string; n?: number; allowance?: string; allowances?: Array<[string, string, string]>; groups?: Array<[string, number]> } = {}): { caseId: string; generationId: string; revision: number } {
  const j = svc.journal;
  const prov = j.mode;
  const subject = opts.subject ?? 'subj-a';
  const gen = `gen-${Math.random().toString(36).slice(2, 8)}`;
  const doc = manifestDoc(opts.allowances ?? [[subject, 'Subject A', opts.allowance ?? '5'], ['subj-ok', 'Control', '50']]);
  const manifest = pinned(doc, prov);
  j.saveManifest(manifest);
  const sessions = ['s1', 's2'];
  const groups = opts.groups ?? [[subject, opts.n ?? 8]];
  const b = build(gen, groups.flatMap(([sub, n], i) => run(`g${i}`, sub, sessions, n, T0, 10)), sessions, { provenance: prov });
  const cutoff = '2026-10-09T12:09:00Z';
  j.saveScenario({ scenarioId: `sc-${gen}`, provenance: prov, manifestId: manifest.manifestId, identityDomainStatus: 'declared_fixture', captureCutoff: cutoff, source: 'test', createdAt: nowUtcNano() }, registry(sessions));
  j.createGeneration({ generationId: gen, provenance: prov, manifestId: manifest.manifestId, manifestSha256: manifest.sha256, captureCutoff: cutoff, identityDomainStatus: 'declared_fixture', scenarioId: `sc-${gen}`, parentGenerationId: null });
  j.addObservations(gen, b.observations);
  j.addBindings(gen, b.bindings);
  j.addCoverage(gen, b.coverage);
  const readiness = assessReadiness({ generationId: gen, manifest: doc, identityDomainStatus: 'declared_fixture', registry: registry(sessions), observations: b.observations, bindings: b.bindings, coverage: b.coverage, captureCutoff: cutoff });
  if (!readiness.ready) throw new Error('seedCase fixture must be ready');
  j.saveReadiness(readiness);
  const canon = canonicalize(b.observations);
  j.sealGeneration(gen, { rawCount: b.observations.length, canonicalKeyCount: canon.facts.length, semanticDigest: semanticDigest(canon.facts), bindingDigest: bindingDigest(b.bindings), coverageDigest: coverageDigest(b.coverage), manifestDigest: manifestDigest(manifest.sha256, doc) });
  j.advanceGeneration(gen, 'sealed', 'inserted', { insertAckAt: nowUtcNano() });
  j.advanceGeneration(gen, 'inserted', 'readback_confirmed', { readback: { checkedAt: nowUtcNano(), ok: true, components: { rawIds: true, semantics: true, bindings: true, coverage: true, manifest: true }, mismatches: [], queryIds: [] } });
  const o = runOracle({ ...b, manifest: doc, cutoffNs: parseUtcNano(cutoff) });
  const cands: CandidateResult[] = o.candidates.map((c) => ({
    workspaceId: c.workspaceId, policySubjectId: c.policySubjectId, credentialId: c.credentialId, operation: c.operation, displayLabel: doc.allowances.find((a) => a.policySubjectId === c.policySubjectId)!.displayLabel,
    allowance: c.allowance.toString(), currentCount: c.currentCount.toString(), peakCount: (c.peak?.count ?? 0n).toString(), peakWitness: w(c.peak, c.allowance), firstCrossing: w(c.firstCrossing, c.allowance), breached: c.firstCrossing !== null, readiness: 'ready',
  }));
  const ranked = rankBreaches(o.candidates.filter((c) => c.firstCrossing).map((c) => ({ key: { workspaceId: c.workspaceId, policySubjectId: c.policySubjectId, credentialId: c.credentialId, operation: c.operation }, firstCrossingNs: c.firstCrossing!.anchorNs, excess: c.firstCrossing!.count - c.allowance })));
  const ev: EvaluationReceipt = {
    evaluationId: `eval-${gen}`, generationId: gen, manifestSha256: manifest.sha256, provenance: prov, anchors: o.anchors.map(formatUtcNano), captureCutoff: cutoff, candidates: cands,
    breachedKeys: ranked.map((r) => r.key), primary: ranked[0]?.key ?? null, oracleAgrees: true, oracleMismatches: [], queries: [], evaluatedAt: nowUtcNano(),
  };
  j.saveEvaluation(ev);
  j.advanceGeneration(gen, 'readback_confirmed', 'evaluated');
  const rec = recordCase(j, j.getGeneration(gen)!, manifest, ev, 2);
  return { caseId: rec.caseId, generationId: gen, revision: rec.revision };
}
