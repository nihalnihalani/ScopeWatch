/** Test fixture builders (synthetic data only). Used by unit, integration and ClickHouse tests. */
import type { EventBinding, ManifestDocument, PinnedManifest, Provenance, RawObservation, SessionCoverage } from '../../../src/shared/contracts.js';
import { canonicalJson, sha256Hex } from '../../../src/core/hash.js';
import { formatUtcNano, parseUtcNano } from '../../../src/core/time.js';
import { pinManifest } from '../../../src/core/manifest.js';

export const WS = 'ws-test';
export const CRED = 'cred-test';
export const OP = 'issues_get';

export function manifestDoc(allowances: Array<[string, string, string]>, effectiveFrom = '2026-10-09T12:00:00Z'): ManifestDocument {
  return {
    schema: 'scopewatch.manifest/v1', policyVersion: 'test-v1', workspaceId: WS, credentialId: CRED, operation: OP, unit: 'native_allow_security_event_id',
    clock: 'test.created_at', subjectIdDomain: 'test_subject', identityDomain: 'workspace', windowSeconds: 600, effectiveFrom, effectiveUntil: null,
    allowances: allowances.map(([id, label, max]) => ({ policySubjectId: id, displayLabel: label, maxUniqueAllowDecisions: max, approvalRef: `approval-${id}` })),
  };
}

export function pinned(doc: ManifestDocument, provenance: Provenance = 'replay'): PinnedManifest {
  return pinManifest({ bytes: Buffer.from(JSON.stringify(doc, null, 2)), manifestId: `m-${sha256Hex(JSON.stringify(doc)).slice(0, 8)}`, provenance, immutableRef: 'test:manifest', approvedBy: 'tester' });
}

export interface EvSpec {
  id: string;
  session: string;
  subject: string;
  /** UTC text or epoch ns bigint */
  at: string | bigint;
  decision?: 'ALLOW' | 'DENY' | 'ERROR';
  /** extra delivery copy ids (exact redelivery) */
  copies?: number;
}

export interface Built {
  observations: RawObservation[];
  bindings: EventBinding[];
  coverage: SessionCoverage[];
}

export function key(id: string): string {
  return JSON.stringify([WS, id]);
}

export function mkObs(gen: string, e: { id: string; session: string; at: string | bigint; decision?: 'ALLOW' | 'DENY' | 'ERROR'; copy?: number; provenance?: Provenance; credential?: string; operation?: string; workspace?: string }): RawObservation {
  const ns = typeof e.at === 'bigint' ? e.at : parseUtcNano(e.at);
  const text = formatUtcNano(ns);
  const decision = e.decision ?? 'ALLOW';
  const copy = e.copy ?? 1;
  const semantic = canonicalJson({ id: e.id, decision, at: text, session: e.session });
  return {
    observationId: `obs-${e.id}-c${copy}-${gen}`, provenance: e.provenance ?? 'replay', generationId: gen, fetchRecordId: `fetch-${e.session}-${copy}`, pageRef: `page-${copy}`,
    nativeIdentityKey: key(e.id), identityDomain: 'workspace', workspaceId: e.workspace ?? WS, sessionId: e.session, nativeEventId: e.id, nativeTaskId: `task-${e.id}`,
    credentialId: e.credential ?? CRED, operation: e.operation ?? OP, decision, reasonCode: null, createdAtRaw: text, createdAt: text, createdAtNs: ns.toString(),
    unitMappingVersion: 'u1', semanticJson: semantic, observedAt: formatUtcNano(ns + BigInt(copy) * 1_000_000_000n), contentSha256: sha256Hex(`${e.id}${copy}`),
  };
}

export function build(gen: string, evs: EvSpec[], sessions: string[], opts: { provenance?: Provenance } = {}): Built {
  const observations: RawObservation[] = [];
  const bindings: EventBinding[] = [];
  const perSession = new Map<string, number>();
  for (const e of evs) {
    for (let c = 1; c <= (e.copies ?? 1); c++) {
      observations.push(mkObs(gen, { id: e.id, session: e.session, at: e.at, decision: e.decision, copy: c, provenance: opts.provenance }));
      perSession.set(e.session, (perSession.get(e.session) ?? 0) + 1);
    }
    bindings.push({ generationId: gen, nativeIdentityKey: key(e.id), policySubjectId: e.subject, bindingState: 'verified', nativeActingTaskId: `task-${e.id}`, mappingMethod: 'test', proofRef: `proof-${e.id}` });
  }
  const coverage: SessionCoverage[] = sessions.map((s) => ({
    generationId: gen, workspaceId: WS, sessionId: s, launchSubjectId: null, coverageState: 'complete', expectedPages: 1, fetchedPages: 1,
    rawRecords: perSession.get(s) ?? 0, requiredFieldGaps: 0, completionRef: `done-${s}`, notes: [],
  }));
  return { observations, bindings, coverage };
}

export function registry(sessions: string[]) {
  return sessions.map((s) => ({ workspaceId: WS, sessionId: s, launchId: `launch-${s}`, profile: 'target' as const, expectedPolicySubjectId: 'x', installedAgentId: 'inst' }));
}

/** n events spaced `stepSec` apart starting at `startNs`, round-robin over sessions. */
export function run(prefix: string, subject: string, sessions: string[], n: number, startNs: bigint, stepSec: number): EvSpec[] {
  return Array.from({ length: n }, (_, i) => ({
    id: `${prefix}-${String(i + 1).padStart(3, '0')}`, session: sessions[i % sessions.length] as string, subject, at: startNs + BigInt(i) * BigInt(stepSec) * 1_000_000_000n,
  }));
}

export const T0 = parseUtcNano('2026-10-09T12:00:00Z');
export const SEC = 1_000_000_000n;
