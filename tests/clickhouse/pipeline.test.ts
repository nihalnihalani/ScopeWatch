import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { Journal } from '../../src/storage/journal.js';
import { buildCaseDetail } from '../../src/server/services/cases.js';
import { retryWithFreshGeneration, runCohortPipeline, runReplayPipeline } from '../../src/server/services/pipeline.js';
import type { Services } from '../../src/server/services/context.js';
import type { SeedFile } from '../../src/server/services/seed.js';
import { nowUtcNano } from '../../src/core/time.js';
import { manifestDoc, pinned } from '../unit/core/fixtures.js';
import { FakeGuildPort, testConfig } from '../integration/backend/support.js';
import { chSkipReason, makeNamespace, type Namespace } from './helpers.js';

const skip = await chSkipReason();
if (skip) console.warn(`[tests/clickhouse] SKIPPED: ${skip}`);
const d = skip ? describe.skip : describe;

d('full pipeline on real local ClickHouse (journal -> seal -> publish -> readback -> all-anchor SQL -> oracle -> case)', () => {
  let ns: Namespace;
  const svcFor = (mode: 'replay' | 'contract_test', guild: FakeGuildPort | null = null): Services => ({
    config: testConfig(mode), journal: new Journal(':memory:', mode), ch: ns.ch, chStatus: { status: 'ok', detail: 'test namespace' }, guild, rootDir: process.cwd(),
  });
  beforeAll(async () => {
    ns = await makeNamespace();
  });
  afterAll(async () => {
    await ns?.drop();
  });

  for (const seedName of ['harbordesk-v1', 'late-arrival-v1']) {
    it(`replay seed ${seedName}: results equal the seed's declared answers; case is labeled synthetic and not action eligible`, async () => {
      const svc = svcFor('replay');
      const seed = JSON.parse(readFileSync(`data/replay/${seedName}.json`, 'utf8')) as SeedFile;
      const r = await runReplayPipeline(svc, seedName);
      expect(r).toMatchObject({ state: 'evaluated', readinessGaps: 0 });
      const d = buildCaseDetail(svc.journal, r.caseId!);
      expect(d.generation).toMatchObject({ state: 'evaluated', provenance: 'replay' });
      expect(d.generation.readback).toMatchObject({ ok: true, components: { rawIds: true, semantics: true, bindings: true, coverage: true, manifest: true } });
      expect(d.evaluation.oracleAgrees).toBe(true);
      expect(d.readiness).toMatchObject({ ready: true, cohortSessions: seed.cohort.length, completeSessions: seed.cohort.length });
      expect(d.primary?.policySubjectId).toBe(seed.expected.primary);
      for (const [subject, exp] of Object.entries(seed.expected.candidates)) {
        const c = d.candidates.find((x) => x.policySubjectId === subject)!;
        expect(c, subject).toBeDefined();
        expect({ breached: c.breached, peak: c.peakCount, current: c.currentCount, crossing: c.firstCrossing?.anchor ?? null, crossingCount: c.firstCrossing?.count ?? null, peakAnchor: c.peakWitness?.anchor ?? null }, subject).toEqual({
          breached: exp.breached, peak: exp.peakCount, current: exp.currentCount, crossing: exp.firstCrossingAnchor, crossingCount: exp.firstCrossingCount, peakAnchor: exp.peakAnchor,
        });
      }
      expect(d.actionBlockedReason).toMatch(/not action eligible/);
      expect(d.uncertainty.join(' ')).toMatch(/SYNTHETIC REPLAY/);
      // every receipt names the real server
      expect(d.evaluation.queries.every((q) => q.target === 'clickhouse_local' && q.serverVersion === ns.ch.serverVersion)).toBe(true);
    });
  }

  it('late-arrival: the historical crossing is preserved with current count 0 and a 30-identity tie witness', async () => {
    const svc = svcFor('replay');
    const r = await runReplayPipeline(svc, 'late-arrival-v1');
    const d = buildCaseDetail(svc.journal, r.caseId!);
    const ta = d.candidates.find((c) => c.policySubjectId === 'subj-ticketassist')!;
    expect(ta.currentCount).toBe('0');
    expect(ta.firstCrossing).toMatchObject({ count: '30', anchor: '2026-10-09T12:04:00Z' });
    expect(ta.firstCrossing!.identityKeys).toHaveLength(30);
    expect(d.uncertainty.join(' ')).toMatch(/historical crossing .* preserved/);
    expect(d.sessions.every((s) => s.coverageState === 'complete')).toBe(true);
  });

  it('a re-run appends a new case revision (same case id), never overwriting the prior evidence', async () => {
    const svc = svcFor('replay');
    const a = await runReplayPipeline(svc, 'harbordesk-v1');
    const b = await runReplayPipeline(svc, 'harbordesk-v1');
    expect(b.caseId).toBe(a.caseId);
    expect(svc.journal.getCase(a.caseId!)!.revision).toBe(2);
    expect(svc.journal.getCaseRevision(a.caseId!, 1)!.generationId).toBe(a.generationId);
    expect(svc.journal.getCaseRevision(a.caseId!, 2)!.generationId).toBe(b.generationId);
  });

  it('a journal-level identity conflict blocks the generation before publication and creates no case', async () => {
    const svc = svcFor('replay');
    const guild = new FakeGuildPort('replay');
    svc.journal.close();
    const j = new Journal(':memory:', 'replay');
    svc.journal = j;
    // build a ready generation, then add a changed copy of one identity to the SAME generation before sealing
    const doc = manifestDoc([['subj-t', 'T', '2']]);
    const m = pinned(doc, 'replay');
    j.saveManifest(m);
    j.saveScenario({ scenarioId: 'sc', provenance: 'replay', manifestId: m.manifestId, identityDomainStatus: 'declared_fixture', captureCutoff: '2026-10-09T12:09:00Z', source: 't', createdAt: nowUtcNano() },
      [{ workspaceId: 'ws-test', sessionId: 's1', launchId: 'l1', profile: 'target', expectedPolicySubjectId: 'subj-t', installedAgentId: 'i' }]);
    const gen = 'g-conf';
    j.createGeneration({ generationId: gen, provenance: 'replay', manifestId: m.manifestId, manifestSha256: m.sha256, captureCutoff: '2026-10-09T12:09:00Z', identityDomainStatus: 'declared_fixture', scenarioId: 'sc', parentGenerationId: null });
    const col = await guild.collectSession({ workspaceId: 'ws-test', sessionId: 's1', launchId: 'l1', profile: 'target', expectedPolicySubjectId: 'subj-t', installedAgentId: 'i' }, gen);
    const first = col.observations[0]!;
    const rogue = { ...first, observationId: first.observationId + '-rogue', decision: 'DENY' as const, provenance: 'replay' as const };
    j.addObservations(gen, [...col.observations.map((o) => ({ ...o, provenance: 'replay' as const })), rogue]);
    j.addBindings(gen, guild.bindEvents({ generationId: gen, observations: col.observations, tasks: [], registry: j.getRegistry('sc'), subjectDomainMap: {} }).bindings);
    j.addCoverage(gen, [col.coverage]);
    const { processGeneration } = await import('../../src/server/services/pipeline.js');
    const r = await processGeneration(svc, gen);
    expect(r).toMatchObject({ state: 'sealed', caseId: null });
    expect(j.getReadiness(gen)!.gaps.map((g) => g.kind)).toContain('identity_conflict');
    expect(j.listCases()).toEqual([]);
    // nothing was written to ClickHouse for this generation
    const rs = await ns.admin.query({ query: `SELECT count() AS n FROM ${ns.db}.native_event_versions WHERE generation_id = 'g-conf'`, format: 'JSONEachRow' });
    expect(Number(((await rs.json<{ n: string | number }>())[0] as { n: string | number }).n)).toBe(0);
  });

  it('contract_test cohort pipeline through a FAKE GuildPort: case is contract_test provenance, never native', async () => {
    const svc = svcFor('contract_test', new FakeGuildPort());
    const doc = manifestDoc([['subj-t', 'Target', '2'], ['subj-c', 'Control', '50']]);
    const m = pinned(doc, 'contract_test');
    svc.journal.saveManifest(m);
    svc.journal.saveScenario({ scenarioId: 'sc1', provenance: 'contract_test', manifestId: m.manifestId, identityDomainStatus: 'declared_fixture', captureCutoff: nowUtcNano(), source: 'test', createdAt: nowUtcNano() },
      ['s1', 's2'].map((s) => ({ workspaceId: 'ws-test', sessionId: s, launchId: `l-${s}`, profile: 'target' as const, expectedPolicySubjectId: 'subj-t', installedAgentId: 'i' })));
    const r = await runCohortPipeline(svc);
    expect(r.state).toBe('evaluated');
    const d = buildCaseDetail(svc.journal, r.caseId!);
    expect(d.provenance).toBe('contract_test');
    expect(d.candidates.find((c) => c.policySubjectId === 'subj-t')).toMatchObject({ peakCount: '6', breached: true });
    expect(d.candidates.find((c) => c.policySubjectId === 'subj-c')).toMatchObject({ peakCount: '0', breached: false });
    expect(d.actionBlockedReason).toBeNull(); // exercisable, but verdicts will only ever be simulated_*
    expect(d.uncertainty.join(' ')).toMatch(/CONTRACT TEST/);
  });

  it('retryWithFreshGeneration uses a new generation id (parent linked) and re-verifies from scratch', async () => {
    const svc = svcFor('replay');
    const a = await runReplayPipeline(svc, 'late-arrival-v1');
    const b = await retryWithFreshGeneration(svc, a.generationId);
    expect(b.generationId).not.toBe(a.generationId);
    expect(b.state).toBe('evaluated');
    expect(svc.journal.getGeneration(b.generationId)!.parentGenerationId).toBe(a.generationId);
    expect(svc.journal.getGeneration(b.generationId)!.readback!.ok).toBe(true);
  });
});
