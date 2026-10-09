import { describe, expect, it } from 'vitest';
import { buildApp } from '../../../src/server/http/app.js';
import { createRecovery, recordNativeReceipt, recordRemovalReceipt, reviewCase, reviewRecovery, verifyAction } from '../../../src/server/services/actions.js';
import { buildCaseDetail } from '../../../src/server/services/cases.js';
import { processGeneration } from '../../../src/server/services/pipeline.js';
import { recoveryVerdict } from '../../../src/core/actions.js';
import { formatUtcNano, nowNs } from '../../../src/core/time.js';
import type { ActionRecord, ProbeResult, StatusReport } from '../../../src/shared/contracts.js';
import { T0, build, run } from '../../unit/core/fixtures.js';
import { FakeGuildPort, HOST, ORIGIN, SECRET, seedCase, services, testConfig } from './support.js';

const sel = { credentialId: 'cred-test', operation: 'issues_get', policySubjectId: 'subj-a', workspaceId: 'ws-test', decision: 'DENY', resources: null };
const now = () => new Date().toISOString();
const ALLOW3: Array<[string, string, string]> = [['subj-a', 'A', '5'], ['subj-b', 'B', '5'], ['subj-ok', 'Control', '50']];

describe('P1-A: superseded cases cannot be acted on', () => {
  it('primary flip: a newer evaluated generation with a different primary blocks the older case and stales its approval', () => {
    const svc = services('contract_test', new FakeGuildPort());
    const first = seedCase(svc, { allowances: ALLOW3, groups: [['subj-a', 8]] });
    reviewCase(svc, first.caseId, { expectedRevision: first.revision, decision: 'approve', reason: 'ok' }, 'op');
    const second = seedCase(svc, { allowances: ALLOW3, groups: [['subj-a', 3], ['subj-b', 9]] });
    expect(second.caseId).not.toBe(first.caseId);
    expect(svc.journal.getCase(second.caseId)!.primary?.policySubjectId).toBe('subj-b');
    // older case: blocked, approval stale
    expect(svc.journal.listActions(first.caseId)[0]!.state).toBe('stale');
    expect(buildCaseDetail(svc.journal, first.caseId).actionBlockedReason).toMatch(/Superseded/);
    expect(() => reviewCase(svc, first.caseId, { expectedRevision: first.revision, decision: 'approve', reason: 'again' }, 'op')).toThrow(/Superseded/);
    // the newest case is still actionable
    expect(buildCaseDetail(svc.journal, second.caseId).actionBlockedReason).toBeNull();
    expect(reviewCase(svc, second.caseId, { expectedRevision: second.revision, decision: 'approve', reason: 'ok' }, 'op').actions).toHaveLength(1);
  });

  it('a later NOT-READY sealed generation also supersedes: older case blocked, pre-effect approval stale', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    const first = seedCase(svc, { allowances: ALLOW3, groups: [['subj-a', 8]] });
    reviewCase(svc, first.caseId, { expectedRevision: first.revision, decision: 'approve', reason: 'ok' }, 'op');
    const j = svc.journal;
    const g0 = j.getGeneration(first.generationId)!;
    const gen = 'g-notready';
    j.createGeneration({ generationId: gen, provenance: 'contract_test', manifestId: g0.manifestId, manifestSha256: g0.manifestSha256, captureCutoff: g0.captureCutoff, identityDomainStatus: 'declared_fixture', scenarioId: g0.scenarioId, parentGenerationId: null });
    const b = build(gen, run('a', 'subj-a', ['s1'], 8, T0, 10), ['s1'], { provenance: 'contract_test' }); // s2 never collected
    j.addObservations(gen, b.observations);
    j.addBindings(gen, b.bindings);
    j.addCoverage(gen, b.coverage);
    const r = await processGeneration(svc, gen);
    expect(r.state).toBe('sealed');
    expect(j.listActions(first.caseId)[0]!.state).toBe('stale');
    expect(buildCaseDetail(j, first.caseId).actionBlockedReason).toMatch(/Superseded.*sealed/);
    expect(() => reviewCase(svc, first.caseId, { expectedRevision: first.revision, decision: 'approve', reason: 'x' }, 'op')).toThrow(/Superseded/);
  });
});

describe('P1-B / P1-C: recovery predicates and removal receipt selectors', () => {
  const probe = (role: 'target' | 'control', over: Partial<ProbeResult> = {}): ProbeResult => ({
    role, provenance: 'native', launchId: 'l', nativeSessionId: 's', nativeEventIds: [], decision: 'ALLOW', reasonCode: null,
    boundSubjectId: role === 'target' ? 'subj-t' : 'subj-c', credentialId: 'c', inspection: 'x', outcome: 'succeeded_expected', startedAt: '2026-10-09T12:00:00Z', completedAt: null, ...over,
  });
  it('recovery success needs target succeeded_expected (not merely allowed) and BOTH subjects bound', () => {
    const exp = { targetSubjectId: 'subj-t', controlSubjectId: 'subj-c' };
    expect(recoveryVerdict('native', probe('target'), probe('control'), exp).verdict).toBe('recovered');
    expect(recoveryVerdict('native', probe('target', { outcome: 'allowed' }), probe('control'), exp).verdict).toBe('recovery_failed');
    expect(recoveryVerdict('native', probe('target'), probe('control', { boundSubjectId: 'other' }), exp).verdict).toBe('unknown');
    expect(recoveryVerdict('native', probe('target', { boundSubjectId: 'other' }), probe('control'), exp).verdict).toBe('unknown');
  });

  function recoveryApproved() {
    const guild = new FakeGuildPort();
    const svc = services('contract_test', guild);
    const { caseId, revision } = seedCase(svc);
    reviewCase(svc, caseId, { expectedRevision: revision, decision: 'approve', reason: 'ok' }, 'op');
    const a = svc.journal.listActions(caseId)[0] as ActionRecord;
    const obs = recordNativeReceipt(svc, a.actionId, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: 'r', observedSelectors: sel, appliedAt: now(), evidenceNote: '' }, 'op');
    const rec = createRecovery(svc, a.actionId, obs.version, 'resolved', 'op');
    const ap = reviewRecovery(svc, rec.actionId, { expectedVersion: 1, decision: 'approve', reason: 'ok' }, 'op');
    return { svc, guild, rec, ap };
  }
  it('a removal receipt that differs from the restriction scope is a mismatch that blocks recovery verify; the corrected receipt unblocks it', async () => {
    const { svc, guild, rec, ap } = recoveryApproved();
    const bad = recordRemovalReceipt(svc, rec.actionId, { expectedVersion: ap.version, method: 'guild_ui', nativeRuleId: null, observedSelectors: { ...sel, decision: 'REMOVED', operation: 'issues_list' }, removedAt: now(), evidenceNote: '' }, 'op');
    expect(bad.state).toBe('scope_mismatch');
    expect(bad.nativeReceipt!.observedSelectors.operation).toBe('issues_list'); // exactly what the operator entered, never filled from scope
    expect(bad.nativeReceipt!.mismatches.join(' ')).toMatch(/operation/);
    await expect(verifyAction(svc, rec.actionId, bad.version, 'op')).rejects.toMatchObject({ status: 409 });
    expect(guild.probeCalls).toHaveLength(0);
    const fixed = recordRemovalReceipt(svc, rec.actionId, { expectedVersion: bad.version, method: 'guild_ui', nativeRuleId: null, observedSelectors: { ...sel, decision: 'REMOVED' }, removedAt: now(), evidenceNote: '' }, 'op');
    expect(fixed.state).toBe('removal_observed');
  });
  it('recovery probes are launched with purpose "recovery"; restriction probes with "restriction"', async () => {
    const { svc, guild, rec, ap } = recoveryApproved();
    const rm = recordRemovalReceipt(svc, rec.actionId, { expectedVersion: ap.version, method: 'guild_ui', nativeRuleId: null, observedSelectors: { ...sel, decision: 'REMOVED' }, removedAt: now(), evidenceNote: '' }, 'op');
    guild.probeScript = { target: { outcome: 'succeeded_expected', decision: 'ALLOW', boundSubjectId: 'subj-a' } };
    await verifyAction(svc, rec.actionId, rm.version, 'op');
    expect(guild.probeCalls.map((p) => p.purpose)).toEqual(['recovery', 'recovery']);
  });
});

describe('follow-ups: superseded verify and recovery missing target', () => {
  it('verify withholds the success verdict (disputed, receipts kept) when a newer generation supersedes the case', async () => {
    const guild = new FakeGuildPort();
    const svc = services('contract_test', guild);
    const { caseId, revision } = seedCase(svc);
    reviewCase(svc, caseId, { expectedRevision: revision, decision: 'approve', reason: 'ok' }, 'op');
    const a = svc.journal.listActions(caseId)[0] as ActionRecord;
    const obs = recordNativeReceipt(svc, a.actionId, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: 'r', observedSelectors: sel, appliedAt: now(), evidenceNote: '' }, 'op');
    // a newer sealed generation for the same manifest (no case change): the effect already exists natively
    const j = svc.journal;
    const g0 = j.getGeneration(j.getCase(caseId)!.generationId)!;
    j.createGeneration({ generationId: 'g-newer', provenance: 'contract_test', manifestId: g0.manifestId, manifestSha256: g0.manifestSha256, captureCutoff: g0.captureCutoff, identityDomainStatus: 'declared_fixture', scenarioId: g0.scenarioId, parentGenerationId: null });
    j.sealGeneration('g-newer', { rawCount: 0, canonicalKeyCount: 0, semanticDigest: '', bindingDigest: '', coverageDigest: '', manifestDigest: '' });
    const v = await verifyAction(svc, a.actionId, obs.version, 'op');
    expect(v.state).toBe('disputed');
    expect(v.nativeReceipt).not.toBeNull();
    expect(v.verifications[0]!.verdict).toBe('simulated_restriction_observed');
    expect(v.history.at(-1)!.note).toMatch(/superseded/);
  });
  it('blocked reason mentions a failed-readback newer generation', () => {
    const svc = services('contract_test', new FakeGuildPort());
    const { caseId, generationId } = seedCase(svc);
    const j = svc.journal;
    const g0 = j.getGeneration(generationId)!;
    j.createGeneration({ generationId: 'g-rbf', provenance: 'contract_test', manifestId: g0.manifestId, manifestSha256: g0.manifestSha256, captureCutoff: g0.captureCutoff, identityDomainStatus: 'declared_fixture', scenarioId: g0.scenarioId, parentGenerationId: null });
    j.sealGeneration('g-rbf', { rawCount: 0, canonicalKeyCount: 0, semanticDigest: '', bindingDigest: '', coverageDigest: '', manifestDigest: '' });
    j.advanceGeneration('g-rbf', 'sealed', 'inserted');
    j.advanceGeneration('g-rbf', 'inserted', 'readback_failed');
    expect(buildCaseDetail(j, caseId).actionBlockedReason).toMatch(/failed readback; rerun the pipeline/);
  });
  it('recovery with a target probe that has no inspectable content (missing) is unknown, not failed; a refused target is failed', () => {
    const p = (role: 'target' | 'control', outcome: ProbeResult['outcome']): ProbeResult => ({ role, provenance: 'native', launchId: 'l', nativeSessionId: null, nativeEventIds: [], decision: null, reasonCode: null, boundSubjectId: role === 'target' ? 't' : 'c', credentialId: null, inspection: '', outcome, startedAt: '2026-10-09T12:00:00Z', completedAt: null });
    const exp = { targetSubjectId: 't', controlSubjectId: 'c' };
    expect(recoveryVerdict('native', p('target', 'missing'), p('control', 'succeeded_expected'), exp).verdict).toBe('unknown');
    expect(recoveryVerdict('native', p('target', 'refused_policy'), p('control', 'succeeded_expected'), exp).verdict).toBe('recovery_failed');
    expect(recoveryVerdict('native', p('target', 'allowed'), p('control', 'succeeded_expected'), exp).verdict).toBe('recovery_failed');
    expect(recoveryVerdict('native', p('target', 'succeeded_expected'), p('control', 'failed'), exp).verdict).toBe('recovery_failed');
  });
});

describe('P2: verify/dispute, time bounds, declared identity domain', () => {
  it('P2-1: success is withheld (disputed) when the case became disputed after approval', async () => {
    const guild = new FakeGuildPort();
    const svc = services('contract_test', guild);
    const { caseId, revision } = seedCase(svc);
    reviewCase(svc, caseId, { expectedRevision: revision, decision: 'approve', reason: 'ok' }, 'op');
    const a = svc.journal.listActions(caseId)[0] as ActionRecord;
    const obs = recordNativeReceipt(svc, a.actionId, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: 'r', observedSelectors: sel, appliedAt: now(), evidenceNote: '' }, 'op');
    svc.journal.disputeCases(svc.journal.getGeneration(svc.journal.getCase(caseId)!.generationId)!.manifestSha256, 'late conflict');
    // disputeCases already moved the action to disputed; a fresh case revision path: verify must refuse from disputed
    await expect(verifyAction(svc, a.actionId, obs.version + 1, 'op')).rejects.toMatchObject({ status: 409 });
    const svc2 = services('contract_test', new FakeGuildPort());
    const c2 = seedCase(svc2);
    reviewCase(svc2, c2.caseId, { expectedRevision: c2.revision, decision: 'approve', reason: 'ok' }, 'op');
    const a2 = svc2.journal.listActions(c2.caseId)[0] as ActionRecord;
    const o2 = recordNativeReceipt(svc2, a2.actionId, { expectedVersion: a2.version, method: 'guild_ui', nativeRuleId: 'r', observedSelectors: sel, appliedAt: now(), evidenceNote: '' }, 'op');
    // case revision changes while probes are in flight
    svc2.guild!.runProbe = new Proxy(svc2.guild!.runProbe, { apply: (t, th, args) => { seedCase(svc2); return Reflect.apply(t, th, args); } });
    const v = await verifyAction(svc2, a2.actionId, o2.version, 'op');
    expect(v.state).toBe('disputed');
    expect(v.verifications[0]!.verdict).toBe('simulated_restriction_observed'); // observation recorded, success claim withheld
    expect(v.history.at(-1)!.note).toMatch(/withheld/);
    expect(v.nativeReceipt).not.toBeNull();
  });

  it('P2-2: future appliedAt/removedAt (>60s) is rejected; a later-than-receipt appliedAt becomes the probe freshness floor', async () => {
    const guild = new FakeGuildPort();
    const svc = services('contract_test', guild);
    const { caseId, revision } = seedCase(svc);
    reviewCase(svc, caseId, { expectedRevision: revision, decision: 'approve', reason: 'ok' }, 'op');
    const a = svc.journal.listActions(caseId)[0] as ActionRecord;
    const future = formatUtcNano(nowNs() + 3_600_000_000_000n);
    expect(() => recordNativeReceipt(svc, a.actionId, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: null, observedSelectors: sel, appliedAt: future, evidenceNote: '' }, 'op')).toThrow(/future/);
    const soon = formatUtcNano(nowNs() + 30_000_000_000n);
    const obs = recordNativeReceipt(svc, a.actionId, { expectedVersion: a.version, method: 'guild_ui', nativeRuleId: null, observedSelectors: sel, appliedAt: soon, evidenceNote: '' }, 'op');
    await verifyAction(svc, a.actionId, obs.version, 'op');
    expect(guild.probeCalls[0]!.notBefore).toBe(soon);
  });

  it('P2-4: operator-declared identity domain is labeled as such in uncertainty', async () => {
    const svc = services('contract_test', new FakeGuildPort());
    const { caseId } = seedCase(svc);
    expect(buildCaseDetail(svc.journal, caseId).uncertainty.join(' ')).toMatch(/fixture declaration/);
    svc.journal.db.exec("UPDATE generations SET identity_domain_status = 'verified'");
    const { recordCase } = await import('../../../src/server/services/cases.js');
    const g = svc.journal.listGenerations()[0]!;
    const ev = svc.journal.getEvaluation(svc.journal.getCase(caseId)!.evaluationId)!;
    recordCase(svc.journal, g, svc.journal.getManifest(g.manifestId)!, ev, 2);
    expect(buildCaseDetail(svc.journal, caseId).uncertainty.join(' ')).toMatch(/operator-declared \(no native proof reference recorded\)/);
  });
});

describe('P1-D: status gates never derive passed from env', () => {
  async function status(mode: 'replay' | 'contract_test' | 'native') {
    const svc = services(mode === 'native' ? 'replay' : mode, null);
    const cfg = testConfig(mode === 'native' ? 'replay' : mode);
    if (mode === 'native') {
      // exercise the native branch with a fully "configured" env: presence must still not mean passed
      Object.assign(cfg, { mode: 'native' });
      Object.assign(cfg.guild, { identityDomain: 'workspace', triggerKey: 'a:b', collectorKey: 'c:d', workspaceId: 'w', workspaceOwner: 'o', workspaceName: 'n' });
    }
    const app = await buildApp(cfg, svc);
    const login = await app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: ORIGIN }, payload: { secret: SECRET } });
    const r = await app.inject({ method: 'GET', url: '/api/status', headers: { host: HOST, cookie: `${login.cookies[0]!.name}=${login.cookies[0]!.value}` } });
    await app.close();
    return r.json() as StatusReport;
  }
  it('native: G1/G1b/G2 stay pending with null receiptRef even when settings are present', async () => {
    const s = await status('native');
    expect(s.nativeGates.map((g) => [g.gate, g.status, g.receiptRef])).toEqual([['G1', 'pending', null], ['G1b', 'pending', null], ['G2', 'pending', null]]);
    expect(s.configChecks.find((c) => c.check === 'identity domain declaration')!.detail).toMatch(/operator-declared/);
  });
  it('replay and contract_test: gates are not_applicable; contract_test config checks are simulated', async () => {
    for (const m of ['replay', 'contract_test'] as const) {
      const s = await status(m);
      expect(s.nativeGates.every((g) => g.status === 'not_applicable')).toBe(true);
    }
    const c = await status('contract_test');
    expect(c.configChecks.find((x) => x.check === 'guild credentials and installs')!.status).toBe('simulated');
    const r = await status('replay');
    expect(r.configChecks.find((x) => x.check === 'guild credentials and installs')!.status).toBe('not_applicable');
  });
});
