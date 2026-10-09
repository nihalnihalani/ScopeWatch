/**
 * journal -> seal -> publish -> readback -> evaluate -> case. SQLite is the local authority; ClickHouse is analytical.
 * No distributed transaction is assumed: each state advance is a forward-only journal CAS after the external step.
 */
import { randomBytes } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { EventBinding, GenerationReceipt, PinnedManifest, RawObservation, SessionCoverage } from '../../shared/contracts.js';
import type { PipelineRunResult } from '../../shared/api.js';
import type { GuildPort } from '../../shared/ports.js';
import { assessReadiness, isConflictGap } from '../../core/admission.js';
import { bindingDigest, canonicalize, coverageDigest, manifestDigest, semanticDigest } from '../../core/canonicalize.js';
import { pinManifest } from '../../core/manifest.js';
import { nowUtcNano } from '../../core/time.js';
import { evaluateGeneration, GenerationNotAdmissibleError, OracleMismatchError } from '../../integrations/clickhouse/evaluator.js';
import { Publisher } from '../../integrations/clickhouse/publisher.js';
import type { GenerationRow } from '../../storage/journal.js';
import { recordCase } from './cases.js';
import type { Services } from './context.js';
import { conflict, invalid, unavailable } from './errors.js';
import { expandSeed, loadSeed } from './seed.js';

const newGenId = () => `gen-${Date.now().toString(36)}-${randomBytes(3).toString('hex')}`;

/** Replay: declared seed -> journal -> the SAME analytical path as native. Labeled synthetic everywhere. */
export async function runReplayPipeline(svc: Services, seedName = 'harbordesk-v1'): Promise<PipelineRunResult> {
  if (svc.config.mode !== 'replay') throw conflict('replay pipeline is only available in replay mode');
  const seed = loadSeed(svc.rootDir, seedName);
  const ex = expandSeed(seed);
  const j = svc.journal;
  const manifest: PinnedManifest = pinManifest({
    bytes: ex.manifestBytes,
    manifestId: `manifest-replay-${seed.seedId}`,
    provenance: 'replay',
    immutableRef: `replay:${seed.seedId}`,
    approvedBy: 'synthetic-fixture',
  });
  const scenarioId = `scenario-${seed.seedId}`;
  j.saveManifest(manifest);
  j.saveScenario({ scenarioId, provenance: 'replay', manifestId: manifest.manifestId, identityDomainStatus: 'declared_fixture', captureCutoff: seed.captureCutoff, source: `seed:${seed.seedId}`, createdAt: nowUtcNano() }, ex.registry);
  const generationId = newGenId();
  j.createGeneration({ generationId, provenance: 'replay', manifestId: manifest.manifestId, manifestSha256: manifest.sha256, captureCutoff: seed.captureCutoff, identityDomainStatus: 'declared_fixture', scenarioId, parentGenerationId: null });
  const facts = ex.buildFacts(generationId);
  j.addObservations(generationId, facts.observations);
  j.addBindings(generationId, facts.bindings);
  j.addCoverage(generationId, facts.coverage);
  return processGeneration(svc, generationId);
}

/** native / contract_test: collect the server-side REGISTERED cohort through the GuildPort, then the same path. */
export async function runCohortPipeline(svc: Services): Promise<PipelineRunResult> {
  if (svc.config.mode === 'replay') throw conflict('cohort pipeline is not available in replay mode');
  const guild = svc.guild;
  if (!guild) throw unavailable('Guild adapter is not configured; native collection is unavailable (never faked)');
  const j = svc.journal;
  const scenario = j.latestScenario();
  if (!scenario) throw invalid('no registered cohort: launch a scenario first (npm run scenario)');
  if (scenario.provenance !== j.mode) throw conflict('scenario provenance does not match this journal');
  const manifest = j.getManifest(scenario.manifestId);
  if (!manifest) throw invalid('scenario manifest missing from journal');
  const registry = j.getRegistry(scenario.scenarioId);
  const generationId = newGenId();
  const captureCutoff = nowUtcNano();
  j.createGeneration({ generationId, provenance: j.mode, manifestId: manifest.manifestId, manifestSha256: manifest.sha256, captureCutoff, identityDomainStatus: scenario.identityDomainStatus, scenarioId: scenario.scenarioId, parentGenerationId: null });
  const allObs: RawObservation[] = [];
  const allTasks = [];
  const coverage: SessionCoverage[] = [];
  const seenIds = new Set<string>();
  for (const reg of registry) {
    try {
      const cs = await guild.collectSession(reg, generationId);
      if (cs.provenance !== j.mode) throw new Error(`adapter returned ${cs.provenance} data for a ${j.mode} journal`);
      for (const o of cs.observations) {
        let id = `${o.observationId}@${generationId}`;
        while (seenIds.has(id)) id += '+';
        seenIds.add(id);
        allObs.push({ ...o, observationId: id, generationId, provenance: j.mode });
      }
      allTasks.push(...cs.tasks);
      coverage.push({ ...cs.coverage, generationId });
    } catch (e) {
      coverage.push({
        generationId, workspaceId: reg.workspaceId, sessionId: reg.sessionId, launchSubjectId: reg.expectedPolicySubjectId, coverageState: 'failed',
        expectedPages: 0, fetchedPages: 0, rawRecords: 0, requiredFieldGaps: 0, completionRef: 'collection-failed', notes: [(e as Error).message.slice(0, 300)],
      });
    }
  }
  const bound = guild.bindEvents({ generationId, observations: allObs, tasks: allTasks, registry, subjectDomainMap: svc.config.guild.agentSubjectMap });
  j.addObservations(generationId, allObs);
  j.addBindings(generationId, bound.bindings.map((b) => ({ ...b, generationId })));
  j.addCoverage(generationId, coverage);
  return processGeneration(svc, generationId);
}

/** Retry after readback_failed or unknown ACK: a FRESH generation id with the same journal rows. Never blind re-insert. */
export async function retryWithFreshGeneration(svc: Services, failedGenerationId: string): Promise<PipelineRunResult> {
  const j = svc.journal;
  const old = j.getGeneration(failedGenerationId);
  if (!old) throw invalid('unknown generation');
  const generationId = newGenId();
  j.createGeneration({ generationId, provenance: old.provenance, manifestId: old.manifestId, manifestSha256: old.manifestSha256, captureCutoff: old.captureCutoff, identityDomainStatus: old.identityDomainStatus, scenarioId: old.scenarioId, parentGenerationId: old.generationId });
  j.cloneGenerationRows(old.generationId, generationId);
  return processGeneration(svc, generationId);
}

export function bundleOf(svc: Services, g: GenerationRow): { generation: GenerationReceipt; manifest: PinnedManifest; observations: RawObservation[]; bindings: EventBinding[]; coverage: SessionCoverage[] } {
  const j = svc.journal;
  const manifest = j.getManifest(g.manifestId);
  if (!manifest) throw new Error(`manifest ${g.manifestId} missing`);
  const { scenarioId: _s, identityDomainStatus: _i, createdAt: _c, ...generation } = g;
  return { generation, manifest, observations: j.getObservations(g.generationId), bindings: j.getBindings(g.generationId), coverage: j.getCoverage(g.generationId) };
}

export async function processGeneration(svc: Services, generationId: string): Promise<PipelineRunResult> {
  const j = svc.journal;
  const g0 = j.getGeneration(generationId);
  if (!g0) throw invalid('unknown generation');
  const manifest = j.getManifest(g0.manifestId);
  if (!manifest) throw new Error('manifest missing');
  const scenario = g0.scenarioId ? j.getScenario(g0.scenarioId) : null;
  const registry = g0.scenarioId ? j.getRegistry(g0.scenarioId) : [];
  const observations = j.getObservations(generationId);
  const bindings = j.getBindings(generationId);
  const coverage = j.getCoverage(generationId);

  // 1. readiness over the REGISTERED cohort, then seal (frozen regardless of readiness)
  const readiness = assessReadiness({
    generationId, manifest: manifest.document, identityDomainStatus: scenario?.identityDomainStatus ?? g0.identityDomainStatus,
    registry, observations, bindings, coverage, captureCutoff: g0.captureCutoff,
  });
  for (const i of g0.scenarioId ? j.listIntents(g0.scenarioId) : []) {
    if (i.outcome === 'unknown' || i.outcome === 'failed' || i.outcome === 'pending') {
      readiness.gaps.push({ kind: 'coverage_incomplete', detail: `launch ${i.idempotencyRef} is ${i.outcome} (unreconciled); a session may exist that is not in the cohort` });
      readiness.ready = false;
    }
  }
  j.saveReadiness(readiness);
  const canon = canonicalize(observations);
  j.sealGeneration(generationId, {
    rawCount: observations.length,
    canonicalKeyCount: canon.facts.length,
    semanticDigest: semanticDigest(canon.facts),
    bindingDigest: bindingDigest(bindings),
    coverageDigest: coverageDigest(coverage),
    manifestDigest: manifestDigest(manifest.sha256, manifest.document),
  });
  if (!readiness.ready) {
    if (readiness.gaps.some((x) => isConflictGap(x.kind))) {
      const touched = j.markEffectActionsDisputed(manifest.sha256, `later generation ${generationId} has integrity conflicts`);
      if (touched.length) j.addHistory('generation', generationId, 'sealed', 'sealed', 'system', `disputed ${touched.length} applied actions`);
    }
    return { generationId, state: 'sealed', caseId: null, readinessGaps: readiness.gaps.length, detail: `not ready: ${readiness.gaps.length} gaps (${[...new Set(readiness.gaps.map((x) => x.kind))].join(', ')}); not published, no case created` };
  }
  if (!svc.ch) throw unavailable(`ClickHouse ${svc.chStatus.status}: ${svc.chStatus.detail}. Generation ${generationId} is sealed but not published.`);

  // 2. publish (awaited) then exact readback; ACK alone is not admission
  const sealed = j.getGeneration(generationId) as GenerationRow;
  const bundle = bundleOf(svc, sealed);
  const pub = new Publisher(svc.ch, sealed.provenance);
  const ackAt = await pub.insert(bundle);
  j.advanceGeneration(generationId, 'sealed', 'inserted', { insertAckAt: ackAt });
  const rb = await pub.readback({ ...bundle, generation: { ...bundle.generation, state: 'inserted' } });
  if (!rb.ok) {
    j.advanceGeneration(generationId, 'inserted', 'readback_failed', { readback: rb });
    return { generationId, state: 'readback_failed', caseId: null, readinessGaps: 0, detail: `readback mismatch, not admitted: ${rb.mismatches.join('; ')}. Retry uses a fresh generation.` };
  }
  j.advanceGeneration(generationId, 'inserted', 'readback_confirmed', { readback: rb });

  // 3. evaluate every anchor + cutoff in ClickHouse, compare with the oracle
  try {
    const ev = await evaluateGeneration(svc.ch, {
      generationId, provenance: sealed.provenance, manifest, captureCutoff: sealed.captureCutoff, observations, bindings, coverage,
    });
    j.saveEvaluation(ev);
    j.advanceGeneration(generationId, 'readback_confirmed', 'evaluated');
    const rec = recordCase(j, j.getGeneration(generationId) as GenerationRow, manifest, ev, readiness.cohortSessions);
    return { generationId, state: 'evaluated', caseId: rec.caseId, readinessGaps: 0, detail: ev.primary ? `case ${rec.caseId} revision ${rec.revision}: ${ev.breachedKeys.length} breach(es)` : `no breach; case ${rec.caseId} revision ${rec.revision}` };
  } catch (e) {
    if (e instanceof OracleMismatchError || e instanceof GenerationNotAdmissibleError) {
      const detail = e instanceof OracleMismatchError ? `${e.message} :: ${e.mismatches.join('; ')}` : e.message;
      j.saveEvaluationError(generationId, detail);
      return { generationId, state: 'readback_confirmed', caseId: null, readinessGaps: 0, detail: `evaluation error (no case created): ${e.message}` };
    }
    throw e;
  }
}

export function readPinnedManifest(svc: Services): PinnedManifest {
  const path = svc.config.pinnedManifestPath;
  if (!path) throw invalid('PINNED_MANIFEST_PATH is not configured');
  return pinManifest({
    bytes: readFileSync(path), manifestId: `manifest-${svc.config.mode}-${Date.now().toString(36)}`, provenance: svc.journal.mode,
    immutableRef: svc.config.pinnedManifestRef ?? `file:${path}`, approvedBy: svc.config.operatorName,
  });
}

export type { GuildPort };
