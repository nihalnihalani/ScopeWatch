import { describe, expect, it } from 'vitest';
import { runCohortPipeline, runReplayPipeline } from '../../../src/server/services/pipeline.js';
import { launchScenario } from '../../../src/server/services/scenario.js';
import { exportCase } from '../../../src/server/services/export.js';
import { buildCaseDetail } from '../../../src/server/services/cases.js';
import { HttpError } from '../../../src/server/services/errors.js';
import { manifestDoc, pinned } from '../../unit/core/fixtures.js';
import { nowUtcNano } from '../../../src/core/time.js';
import { FakeGuildPort, SECRET, seedCase, services } from './support.js';
import type { Services } from '../../../src/server/services/context.js';

/** Registers a cohort directly in the journal (what scenario.ts would write after launching). */
function registerCohort(svc: Services, sessions: string[], identity: 'declared_fixture' | 'verified' | 'unverified' = 'declared_fixture') {
  const doc = manifestDoc([['subj-t', 'Target', '2'], ['subj-c', 'Control', '50']]);
  const m = pinned(doc, svc.journal.mode);
  svc.journal.saveManifest(m);
  svc.journal.saveScenario(
    { scenarioId: 'sc-1', provenance: svc.journal.mode, manifestId: m.manifestId, identityDomainStatus: identity, captureCutoff: nowUtcNano(), source: 'test', createdAt: nowUtcNano() },
    sessions.map((s) => ({ workspaceId: 'ws-test', sessionId: s, launchId: `l-${s}`, profile: 'target' as const, expectedPolicySubjectId: 'subj-t', installedAgentId: 'inst' })),
  );
}

describe('pipeline with a FAKE GuildPort (test double, not native)', () => {
  it('collects the REGISTERED cohort; a session whose collection failed is incomplete coverage, never zero, and nothing is published', async () => {
    const guild = new FakeGuildPort();
    guild.collectFails.add('s2');
    const svc = services('contract_test', guild);
    registerCohort(svc, ['s1', 's2', 's3']);
    const r = await runCohortPipeline(svc);
    expect(r.state).toBe('sealed');
    expect(r.caseId).toBeNull();
    const rep = svc.journal.getReadiness(r.generationId)!;
    expect(rep.ready).toBe(false);
    expect(rep.cohortSessions).toBe(3);
    expect(rep.completeSessions).toBe(2);
    expect(rep.gaps.map((g) => `${g.kind}:${g.sessionId}`)).toEqual(['coverage_incomplete:s2']);
    expect(svc.journal.getGeneration(r.generationId)!.state).toBe('sealed');
  });

  it('unresolved acting-subject bindings block readiness even though sessions are complete', async () => {
    const guild = new FakeGuildPort();
    guild.bindState = 'unresolved';
    const svc = services('contract_test', guild);
    registerCohort(svc, ['s1']);
    const r = await runCohortPipeline(svc);
    const kinds = new Set(svc.journal.getReadiness(r.generationId)!.gaps.map((g) => g.kind));
    expect(kinds).toEqual(new Set(['binding_unresolved']));
  });

  it('an unverified native identity domain blocks admission', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    registerCohort(svc, ['s1'], 'unverified');
    const r = await runCohortPipeline(svc);
    expect(svc.journal.getReadiness(r.generationId)!.gaps.some((g) => g.detail.includes('identity domain'))).toBe(true);
    expect(r.caseId).toBeNull();
  });

  it('an ambiguous launch (unknown intent) keeps the cohort incomplete until reconciled', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    registerCohort(svc, ['s1']);
    const i = svc.journal.createIntent({ idempotencyRef: 'sc-1-target-9', kind: 'probe_launch', relatedId: 'sc-1', detail: 'timeout' }, 'contract_test');
    svc.journal.resolveIntent(i.intentId, 'unknown', 'timed out');
    const r = await runCohortPipeline(svc);
    expect(svc.journal.getReadiness(r.generationId)!.gaps.some((g) => g.detail.includes('unreconciled'))).toBe(true);
    expect(r.caseId).toBeNull();
  });

  it('a ready generation without ClickHouse is 503 dependency_unavailable (never faked), but stays sealed with its readiness stored', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    registerCohort(svc, ['s1', 's2']);
    await expect(runCohortPipeline(svc)).rejects.toMatchObject({ status: 503, code: 'dependency_unavailable' });
    const g = svc.journal.listGenerations()[0]!;
    expect(g.state).toBe('sealed');
    expect(svc.journal.getReadiness(g.generationId)!.ready).toBe(true);
  });

  it('modes are enforced: replay pipeline refuses other modes, cohort pipeline refuses replay, no registry is invalid', async () => {
    await expect(runReplayPipeline(services('contract_test', new FakeGuildPort()))).rejects.toBeInstanceOf(HttpError);
    await expect(runCohortPipeline(services('replay'))).rejects.toBeInstanceOf(HttpError);
    await expect(runCohortPipeline(services('contract_test', new FakeGuildPort()))).rejects.toMatchObject({ status: 422 });
    await expect(runCohortPipeline(services('native', null))).rejects.toMatchObject({ status: 503 });
  });

  it('scenario launch records an intent per launch and registers only created sessions', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    const cfg = svc.config.guild;
    Object.assign(cfg, { ownedRepo: 'o/r', probeTicketNumber: 7, verifiedOperation: 'issues_get', workspaceId: 'ws-test', verifiedTargetPolicySubjectId: 'subj-t', verifiedControlPolicySubjectId: 'subj-c', identityDomain: 'workspace' });
    const dir = (await import('node:fs')).mkdtempSync((await import('node:path')).join((await import('node:os')).tmpdir(), 'sw-m-'));
    const path = `${dir}/manifest.json`;
    (await import('node:fs')).writeFileSync(path, JSON.stringify(manifestDoc([['subj-t', 'Target', '2'], ['subj-c', 'Control', '50']])));
    (svc.config as { pinnedManifestPath: string | null }).pinnedManifestPath = path;
    const r = await launchScenario(svc, { targetSessions: 2, controlSessions: 1 });
    expect(r).toMatchObject({ registered: 3, unreconciled: [] });
    expect(svc.journal.getRegistry(r.scenarioId).map((x) => x.expectedPolicySubjectId).sort()).toEqual(['subj-c', 'subj-t', 'subj-t']);
    expect(svc.journal.listIntents(r.scenarioId)).toHaveLength(3);
  });
});

describe('export', () => {
  it('contains no secrets, no raw payloads, no history stream, and says non-native evidence plainly', () => {
    for (const mode of ['replay', 'contract_test'] as const) {
      const svc = services(mode, mode === 'contract_test' ? new FakeGuildPort() : null);
      const { caseId } = seedCase(svc);
      const out = exportCase(svc, caseId);
      const text = JSON.stringify(out);
      expect(out.limits[0]).toMatch(/NOT NATIVE EVIDENCE/);
      expect(out.provenance).toBe(mode);
      expect(text).not.toContain(SECRET);
      expect(text).not.toMatch(/password|secret|api[_-]?key|semanticJson|semantic_json|bearer/i);
      expect(text).not.toContain('"history"');
      expect(Object.keys(out.sourceClasses)).toContain('native_application_receipts');
    }
  });

  it('case detail exposes all candidates (including the zero/authorized control), uncertainty and per-session evidence', () => {
    const svc = services('replay');
    const { caseId } = seedCase(svc);
    const d = buildCaseDetail(svc.journal, caseId);
    expect(d.candidates.map((c) => c.policySubjectId).sort()).toEqual(['subj-a', 'subj-ok']);
    expect(d.candidates.find((c) => c.policySubjectId === 'subj-ok')).toMatchObject({ peakCount: '0', currentCount: '0', breached: false });
    expect(d.uncertainty.some((u) => /SYNTHETIC REPLAY/.test(u))).toBe(true);
    expect(d.sessions.map((s) => s.sessionId)).toEqual(['s1', 's2']);
    expect(d.sessions.reduce((n, s) => n + s.identityKeyTotal, 0)).toBe(8);
    expect(d.proposedScopeDigest).toMatch(/^[0-9a-f]{64}$/);
    expect(d.timeline.some((t) => t.kind === 'first_crossing')).toBe(true);
  });
});
