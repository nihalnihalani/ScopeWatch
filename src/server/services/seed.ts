/**
 * Replay seed declarations -> journal facts. Seeds are labeled SYNTHETIC; expansion is deterministic (no randomness).
 * The cohort registry comes from the seed's declaration, NOT from which sessions happen to have events.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { EventBinding, ManifestDocument, RawObservation, SessionCoverage } from '../../shared/contracts.js';
import type { RegisteredSession } from '../../shared/ports.js';
import { canonicalJson, sha256Hex } from '../../core/hash.js';
import { formatUtcNano, parseUtcNano } from '../../core/time.js';
import { invalid } from './errors.js';

export interface SeedExpectedCandidate {
  breached: boolean;
  firstCrossingAnchor: string | null;
  firstCrossingCount: string | null;
  peakCount: string;
  peakAnchor: string | null;
  currentCount: string;
}

export interface SeedFile {
  schema: 'scopewatch.replay-seed/v1';
  seedId: string;
  label: string;
  synthetic: true;
  identityDomainStatus: 'declared_fixture';
  captureCutoff: string;
  observedAt: string;
  manifest: ManifestDocument;
  cohort: Array<{ sessionId: string; launchId: string; profile: 'target' | 'control'; expectedPolicySubjectId: string; installedAgentId: string }>;
  bursts: Array<{ idPrefix: string; subject: string; sessions: string[]; count: number; start: string; spacingMs: number; decision: 'ALLOW' | 'DENY' }>;
  events: Array<{ eventId: string; sessionId: string; subject: string; decision: 'ALLOW' | 'DENY'; createdAt: string; reasonCode?: string }>;
  redeliveries: string[];
  expected: { primary: string | null; candidates: Record<string, SeedExpectedCandidate> };
}

export interface ExpandedSeed {
  seed: SeedFile;
  manifestBytes: Buffer;
  registry: RegisteredSession[];
  buildFacts(generationId: string): { observations: RawObservation[]; bindings: EventBinding[]; coverage: SessionCoverage[] };
}

export function loadSeed(rootDir: string, name: string): SeedFile {
  if (!/^[a-z0-9][a-z0-9-]*$/.test(name)) throw invalid('seed name must be a simple identifier');
  let raw: string;
  try {
    raw = readFileSync(join(rootDir, 'data', 'replay', `${name}.json`), 'utf8');
  } catch {
    throw invalid(`unknown replay seed ${name}`);
  }
  const s = JSON.parse(raw) as SeedFile;
  if (s.schema !== 'scopewatch.replay-seed/v1' || s.synthetic !== true) throw invalid('not a synthetic replay seed');
  return s;
}

interface Ev {
  eventId: string;
  sessionId: string;
  subject: string;
  decision: 'ALLOW' | 'DENY';
  createdAtNs: bigint;
  createdAtRaw: string;
  reasonCode: string | null;
}

export function expandSeed(seed: SeedFile): ExpandedSeed {
  const doc = seed.manifest;
  const evs: Ev[] = [];
  for (const b of seed.bursts) {
    const start = parseUtcNano(b.start);
    for (let i = 0; i < b.count; i++) {
      const ns = start + BigInt(i) * BigInt(b.spacingMs) * 1_000_000n;
      evs.push({
        eventId: `${b.idPrefix}-${String(i + 1).padStart(3, '0')}`,
        sessionId: b.sessions[i % b.sessions.length] as string,
        subject: b.subject,
        decision: b.decision,
        createdAtNs: ns,
        createdAtRaw: formatUtcNano(ns),
        reasonCode: b.decision === 'DENY' ? 'POLICY_DENIED' : null,
      });
    }
  }
  for (const e of seed.events) {
    evs.push({ eventId: e.eventId, sessionId: e.sessionId, subject: e.subject, decision: e.decision, createdAtNs: parseUtcNano(e.createdAt), createdAtRaw: e.createdAt, reasonCode: e.reasonCode ?? null });
  }
  const ids = new Set<string>();
  for (const e of evs) {
    if (ids.has(e.eventId)) throw invalid(`seed declares duplicate event id ${e.eventId}`);
    ids.add(e.eventId);
  }
  const declared = new Set(seed.cohort.map((c) => c.sessionId));
  for (const e of evs) if (!declared.has(e.sessionId)) throw invalid(`event ${e.eventId} is in session ${e.sessionId} outside the declared cohort`);

  const registry: RegisteredSession[] = seed.cohort.map((c) => ({
    workspaceId: doc.workspaceId, sessionId: c.sessionId, launchId: c.launchId, profile: c.profile,
    expectedPolicySubjectId: c.expectedPolicySubjectId, installedAgentId: c.installedAgentId,
  }));

  return {
    seed,
    manifestBytes: Buffer.from(JSON.stringify(doc, null, 2) + '\n', 'utf8'),
    registry,
    buildFacts(generationId) {
      const observations: RawObservation[] = [];
      const bindings: EventBinding[] = [];
      const perSession = new Map<string, number>();
      for (const e of evs.sort((a, b) => (a.createdAtNs < b.createdAtNs ? -1 : a.createdAtNs > b.createdAtNs ? 1 : a.eventId < b.eventId ? -1 : 1))) {
        const key = JSON.stringify([doc.workspaceId, e.eventId]);
        const taskId = `task-${e.eventId}`;
        const semantic = canonicalJson({
          decision: e.decision, eventId: e.eventId, operation: doc.operation, reasonCode: e.reasonCode, taskId, createdAt: e.createdAtRaw,
          credentialId: doc.credentialId, sessionId: e.sessionId, workspaceId: doc.workspaceId,
        });
        const deliveries = seed.redeliveries.includes(e.eventId) ? 2 : 1;
        for (let d = 1; d <= deliveries; d++) {
          const observationId = `obs-${e.eventId}-d${d}@${generationId}`;
          const observedAt = formatUtcNano(parseUtcNano(seed.observedAt) + BigInt(d - 1) * 1_000_000_000n);
          observations.push({
            observationId, provenance: 'replay', generationId, fetchRecordId: `fetch-${e.sessionId}-p${d}`, pageRef: `replay:${seed.seedId}:${e.sessionId}/events/page-${d}`,
            nativeIdentityKey: key, identityDomain: doc.identityDomain, workspaceId: doc.workspaceId, sessionId: e.sessionId,
            nativeEventId: e.eventId, nativeTaskId: taskId, credentialId: doc.credentialId, operation: doc.operation, decision: e.decision,
            reasonCode: e.reasonCode, createdAtRaw: e.createdAtRaw, createdAt: formatUtcNano(e.createdAtNs), createdAtNs: e.createdAtNs.toString(),
            unitMappingVersion: 'replay-unit/v1', semanticJson: semantic, observedAt, contentSha256: sha256Hex(`${observationId}|${semantic}|${observedAt}`),
          });
          perSession.set(e.sessionId, (perSession.get(e.sessionId) ?? 0) + 1);
        }
        bindings.push({
          generationId, nativeIdentityKey: key, policySubjectId: e.subject, bindingState: 'verified', nativeActingTaskId: taskId,
          mappingMethod: 'declared_fixture:per_event_subject', proofRef: `seed:${seed.seedId}:event:${e.eventId}`,
        });
      }
      const coverage: SessionCoverage[] = seed.cohort.map((c) => ({
        generationId, workspaceId: doc.workspaceId, sessionId: c.sessionId, launchSubjectId: c.expectedPolicySubjectId, coverageState: 'complete',
        expectedPages: 1, fetchedPages: 1, rawRecords: perSession.get(c.sessionId) ?? 0, requiredFieldGaps: 0,
        completionRef: `seed:${seed.seedId}:session:${c.sessionId}:complete`, notes: ['declared by synthetic replay seed'],
      }));
      return { observations, bindings, coverage };
    },
  };
}
