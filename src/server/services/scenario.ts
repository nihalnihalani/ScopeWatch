/**
 * Launch the declared cohort through GuildPort and write the server-side launch registry (devil P1-7).
 * The registry, not collection results, defines the finite cohort. Ambiguous launches stay unreconciled and block readiness.
 */
import type { PinnedManifest } from '../../shared/contracts.js';
import type { RegisteredSession } from '../../shared/ports.js';
import { nowUtcNano } from '../../core/time.js';
import type { Services } from './context.js';
import { invalid, unavailable } from './errors.js';
import { readPinnedManifest } from './pipeline.js';

export interface ScenarioResult {
  scenarioId: string;
  registered: number;
  unreconciled: Array<{ idempotencyRef: string; outcome: string; error: string | null }>;
}

export async function launchScenario(svc: Services, plan: { targetSessions: number; controlSessions: number }): Promise<ScenarioResult> {
  if (svc.config.mode === 'replay') throw invalid('replay mode declares its cohort in the seed file');
  const guild = svc.guild;
  if (!guild) throw unavailable('Guild adapter is not configured; cannot launch (never faked)');
  const g = svc.config.guild;
  if (!g.ownedRepo || g.probeTicketNumber === null || !g.verifiedOperation) throw unavailable('ownedRepo, probe ticket number and verified operation are required to build the allowlisted launch instruction');
  const j = svc.journal;
  const manifest: PinnedManifest = readPinnedManifest(svc);
  j.saveManifest(manifest);
  const scenarioId = `scenario-${Date.now().toString(36)}`;
  const registry: RegisteredSession[] = [];
  const unreconciled: ScenarioResult['unreconciled'] = [];
  const jobs: Array<{ profile: 'target' | 'control'; n: number }> = [
    ...Array.from({ length: plan.targetSessions }, (_, n) => ({ profile: 'target' as const, n })),
    ...Array.from({ length: plan.controlSessions }, (_, n) => ({ profile: 'control' as const, n })),
  ];
  // allowlisted instruction template: only operation, owned repo and ticket number are interpolated
  const text = `Use ${g.verifiedOperation} to read GitHub issue #${g.probeTicketNumber} in ${g.ownedRepo}, then stop.`;
  for (const job of jobs) {
    const ref = `${scenarioId}-${job.profile}-${job.n}`;
    const intent = j.createIntent({ idempotencyRef: ref, kind: 'probe_launch', relatedId: scenarioId, detail: `${job.profile} launch ${job.n}` }, j.mode);
    let r = null;
    try {
      r = await guild.launch(job.profile, text, ref);
    } catch (e) {
      j.resolveIntent(intent.intentId, 'unknown', (e as Error).message.slice(0, 200));
      unreconciled.push({ idempotencyRef: ref, outcome: 'unknown', error: (e as Error).message.slice(0, 200) });
      continue;
    }
    if (r.outcome === 'unknown') r = (await guild.reconcileLaunch(ref).catch(() => null)) ?? r;
    if (r.outcome === 'created' && r.nativeSessionId && (r.workspaceId ?? g.workspaceId)) {
      j.resolveIntent(intent.intentId, 'succeeded', `session ${r.nativeSessionId}`);
      const status = await guild.awaitCompletion(r.nativeSessionId, 120_000).catch(() => null);
      if (status === null) j.addHistory('launch', r.launchId, 'created', 'completion_unknown', 'system', 'completion not observed within timeout; coverage will reflect it');
      registry.push({
        workspaceId: (r.workspaceId ?? g.workspaceId) as string, sessionId: r.nativeSessionId, launchId: r.launchId, profile: job.profile,
        expectedPolicySubjectId: (job.profile === 'target' ? g.verifiedTargetPolicySubjectId : g.verifiedControlPolicySubjectId) as string,
        installedAgentId: r.requestedInstalledAgentId,
      });
    } else {
      j.resolveIntent(intent.intentId, r.outcome === 'unknown' ? 'unknown' : 'failed', r.error ?? r.outcome);
      unreconciled.push({ idempotencyRef: ref, outcome: r.outcome, error: r.error });
    }
  }
  j.saveScenario({ scenarioId, provenance: j.mode, manifestId: manifest.manifestId, identityDomainStatus: g.identityDomain === 'unverified' ? 'unverified' : 'verified', captureCutoff: nowUtcNano(), source: `launch:${plan.targetSessions}t+${plan.controlSessions}c`, createdAt: nowUtcNano() }, registry);
  return { scenarioId, registered: registry.length, unreconciled };
}
