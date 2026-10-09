/** Real local ClickHouse test harness: one throwaway database + least-privilege users per test file. */
import { randomBytes } from 'node:crypto';
import type { ClickHouseClient } from '@clickhouse/client';
import { adminClient, dropNamespace, provisionNamespace, randomPassword, type NamespaceUsers } from '../../src/integrations/clickhouse/admin.js';
import { connectClickHouse, type ChServices } from '../../src/integrations/clickhouse/client.js';
import type { ClickHouseConfig } from '../../src/server/config.js';
import type { GenerationReceipt, ManifestDocument, PinnedManifest, Provenance } from '../../src/shared/contracts.js';
import { bindingDigest, canonicalize, coverageDigest, manifestDigest, semanticDigest } from '../../src/core/canonicalize.js';
import type { PublishBundle } from '../../src/integrations/clickhouse/publisher.js';
import type { EvaluationInput } from '../../src/integrations/clickhouse/evaluator.js';
import { build, manifestDoc, pinned, type Built, type EvSpec } from '../unit/core/fixtures.js';

export const CH_URL = process.env['CLICKHOUSE_URL'] ?? 'http://127.0.0.1:18123';
const ADMIN_USER = process.env['SCOPEWATCH_CH_ADMIN_USER'] ?? 'sw_admin';
const ADMIN_PW = process.env['SCOPEWATCH_CH_ADMIN_PASSWORD'] ?? 'local-dev-admin';

/** Returns null when reachable, else the explicit skip reason. */
export async function chSkipReason(): Promise<string | null> {
  const admin = adminClient(CH_URL, ADMIN_USER, ADMIN_PW);
  try {
    const r = await admin.ping();
    if (!r.success) return `ClickHouse ping failed at ${CH_URL}: ${String((r as { error?: Error }).error?.message)}`;
    return null;
  } catch (e) {
    return `ClickHouse unreachable at ${CH_URL} (${(e as Error).message}); run npm run ch:up && npm run ch:setup`;
  } finally {
    await admin.close();
  }
}

export interface Namespace {
  ch: ChServices;
  admin: ClickHouseClient;
  db: string;
  users: NamespaceUsers;
  config: ClickHouseConfig;
  drop(): Promise<void>;
}

export async function makeNamespace(): Promise<Namespace> {
  const tag = randomBytes(4).toString('hex');
  const db = `sw_t_${tag}`;
  const users: NamespaceUsers = {
    ingest: { username: `swt_${tag}_i`, password: randomPassword() },
    query: { username: `swt_${tag}_q`, password: randomPassword() },
  };
  const admin = adminClient(CH_URL, ADMIN_USER, ADMIN_PW);
  await provisionNamespace(admin, db, users);
  const config: ClickHouseConfig = { url: CH_URL, target: 'clickhouse_local', database: db, collector: users.ingest, evaluator: users.query };
  const ch = await connectClickHouse(config);
  return {
    ch, admin, db, users, config,
    async drop() {
      await ch.close();
      await dropNamespace(admin, db, users);
      await admin.close();
    },
  };
}

export interface FixtureOpts {
  cutoff?: string;
  effectiveFrom?: string;
  provenance?: Provenance;
  mutateBuilt?: (b: Built) => Built;
  doc?: ManifestDocument;
}

/** Builds a sealed-generation bundle plus evaluation input from declared events. */
export function mkBundle(
  gen: string,
  evs: EvSpec[],
  sessions: string[],
  allowances: Array<[string, string, string]>,
  opts: FixtureOpts = {},
): { bundle: PublishBundle; input: EvaluationInput } {
  const prov = opts.provenance ?? 'replay';
  const doc = opts.doc ?? manifestDoc(allowances, opts.effectiveFrom);
  const manifest: PinnedManifest = pinned(doc, prov);
  let b = build(gen, evs, sessions, { provenance: prov });
  if (opts.mutateBuilt) b = opts.mutateBuilt(b);
  const cutoff = opts.cutoff ?? '2026-10-09T12:30:00Z';
  const canon = canonicalize(b.observations);
  const generation: GenerationReceipt = {
    generationId: gen, provenance: prov, state: 'sealed', manifestId: manifest.manifestId, manifestSha256: manifest.sha256, captureCutoff: cutoff,
    rawCount: b.observations.length, canonicalKeyCount: canon.facts.length, semanticDigest: semanticDigest(canon.facts), bindingDigest: bindingDigest(b.bindings),
    coverageDigest: coverageDigest(b.coverage), manifestDigest: manifestDigest(manifest.sha256, doc), sealedAt: '2026-10-09T12:30:00Z', insertAckAt: null, readback: null, parentGenerationId: null,
  };
  return {
    bundle: { generation, manifest, observations: b.observations, bindings: b.bindings, coverage: b.coverage },
    input: { generationId: gen, provenance: prov, manifest, captureCutoff: cutoff, observations: b.observations, bindings: b.bindings, coverage: b.coverage },
  };
}
