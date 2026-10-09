/**
 * Fixed, versioned, parameterized SQL (CLICKHOUSE_CONTRACTS.md). The shared CTE prefix performs conflict-first
 * canonicalization: its ONLY early restriction is the sealed generation. No actor / ALLOW / operation / time filter
 * exists in `variants`. Typed {name:Type} parameters only; UInt64/Int64 are read as strings and parsed as BigInt.
 */
import type { ClickHouseClient } from '@clickhouse/client';
import { randomUUID } from 'node:crypto';
import type { QueryReceipt } from '../../shared/contracts.js';
import { canonicalJson, sha256Hex } from '../../core/hash.js';
import { nowUtcNano } from '../../core/time.js';
import { SQL_VERSION } from './schema.js';

const VARIANTS_CTE = `WITH
variants AS
(
    SELECT DISTINCT
        native_identity_key, identity_domain, workspace_id, session_id,
        native_event_id, native_task_id, credential_id, operation, decision, reason_code,
        created_at_raw, created_at, unit_mapping_version, semantic_json
    FROM native_event_versions
    WHERE generation_id = {generation_id:String}
),
key_variants AS
(
    SELECT native_identity_key, count() AS variant_count
    FROM variants
    GROUP BY native_identity_key
),
canonical AS
(
    SELECT v.*
    FROM variants AS v
    INNER ALL JOIN key_variants AS k
        ON v.native_identity_key = k.native_identity_key
    WHERE k.variant_count = 1
)`;

const SCOPED_CTES = `, candidates AS
(
    SELECT DISTINCT *
    FROM allowance_versions
    WHERE manifest_hash = {manifest_hash:String}
),
scoped AS
(
    SELECT
        c.native_identity_key AS native_identity_key, c.workspace_id AS workspace_id, c.session_id AS session_id,
        c.native_event_id AS native_event_id, c.created_at AS created_at,
        m.policy_subject_id AS policy_subject_id, m.credential_id AS credential_id, m.operation AS operation,
        m.max_unique_allow_decisions AS max_unique_allow_decisions, m.window_seconds AS window_seconds,
        m.effective_from AS effective_from
    FROM canonical AS c
    INNER ALL JOIN session_snapshots AS s
        ON c.workspace_id = s.workspace_id AND c.session_id = s.session_id
    INNER ALL JOIN event_bindings AS b
        ON c.native_identity_key = b.native_identity_key
    INNER ALL JOIN candidates AS m
        ON c.workspace_id = m.workspace_id
       AND b.policy_subject_id = m.policy_subject_id
       AND c.credential_id = m.credential_id
       AND c.operation = m.operation
    WHERE s.generation_id = {generation_id:String}
      AND b.generation_id = {generation_id:String}
      AND b.binding_state = 'verified'
      AND s.coverage_state = 'complete'
      AND c.decision = 'ALLOW'
      AND c.created_at >= m.effective_from
      AND c.created_at <= {window_anchor:DateTime64(9, 'UTC')}
)`;

export const SQL = {
  /** Variant counts per identity: any row returned is an integrity conflict (NULL keys are gaps handled by readiness). */
  conflictCheck: `${VARIANTS_CTE}
SELECT native_identity_key, toString(variant_count) AS variant_count_text FROM key_variants
WHERE native_identity_key IS NOT NULL AND variant_count != 1
ORDER BY native_identity_key`,

  nullKeyCount: `SELECT toString(count()) AS null_key_rows FROM native_event_versions
WHERE generation_id = {generation_id:String} AND native_identity_key IS NULL`,

  /** Distinct canonical event-time anchors of selected ALLOW facts (window_anchor = capture cutoff). */
  anchorList: `${VARIANTS_CTE}${SCOPED_CTES}
SELECT DISTINCT toString(toUnixTimestamp64Nano(created_at)) AS anchor_ns, created_at
FROM scoped
ORDER BY created_at`,

  /** All-candidate counts at one anchor; zero-event candidates retained via LEFT JOIN with join_use_nulls. */
  anchorAllCandidates: `${VARIANTS_CTE}${SCOPED_CTES},
anchor_totals AS
(
    SELECT
        workspace_id, policy_subject_id, credential_id, operation,
        uniqExact(native_identity_key) AS anchor_count
    FROM scoped
    WHERE created_at > {window_anchor:DateTime64(9, 'UTC')} - toIntervalSecond(window_seconds)
    GROUP BY workspace_id, policy_subject_id, credential_id, operation
)
SELECT
    m.workspace_id AS workspace_id, m.policy_subject_id AS policy_subject_id, m.credential_id AS credential_id, m.operation AS operation,
    m.manifest_hash AS manifest_hash, m.window_seconds AS window_seconds,
    toString(toUnixTimestamp64Nano({window_anchor:DateTime64(9, 'UTC')})) AS evaluated_anchor_ns,
    toString(ifNull(t.anchor_count, toUInt64(0))) AS anchor_count,
    toString(m.max_unique_allow_decisions) AS max_unique_allow_decisions,
    ifNull(t.anchor_count, toUInt64(0)) > m.max_unique_allow_decisions AS anchor_breached
FROM candidates AS m
LEFT ALL JOIN anchor_totals AS t
    ON m.workspace_id = t.workspace_id
   AND m.policy_subject_id = t.policy_subject_id
   AND m.credential_id = t.credential_id
   AND m.operation = t.operation
ORDER BY m.workspace_id, m.policy_subject_id, m.credential_id, m.operation
SETTINGS join_use_nulls = 1`,

  /** Per-session contributions and identity keys inside the window of one stored anchor. */
  witness: `${VARIANTS_CTE}${SCOPED_CTES}
SELECT
    workspace_id, policy_subject_id, credential_id, operation, session_id,
    toString(uniqExact(native_identity_key)) AS session_count,
    arraySort(groupUniqArray(native_identity_key)) AS identity_keys
FROM scoped
WHERE created_at > {window_anchor:DateTime64(9, 'UTC')} - toIntervalSecond(window_seconds)
GROUP BY workspace_id, policy_subject_id, credential_id, operation, session_id
ORDER BY workspace_id, policy_subject_id, credential_id, operation, session_id`,
} as const;

export type QueryName = keyof typeof SQL;

export interface QueryContext {
  client: ClickHouseClient;
  database: string;
  target: 'clickhouse_local' | 'clickhouse_cloud';
  serverVersion: string;
}

export interface QueryRun<T> {
  rows: T[];
  receipt: QueryReceipt;
}

/** Parse server-side elapsed time from the ClickHouse summary header, if present. */
function serverMsFrom(headers: Record<string, string | string[] | undefined> | undefined): number | null {
  const raw = headers?.['x-clickhouse-summary'];
  const s = Array.isArray(raw) ? raw[0] : raw;
  if (!s) return null;
  try {
    const ns = (JSON.parse(s) as { elapsed_ns?: string }).elapsed_ns;
    return ns === undefined ? null : Math.round(Number(BigInt(ns) / 1000n) / 1000);
  } catch {
    return null;
  }
}

export async function runNamed<T>(
  ctx: QueryContext,
  name: QueryName,
  queryClass: QueryReceipt['queryClass'],
  params: Record<string, string>,
): Promise<QueryRun<T>> {
  const sql = SQL[name];
  const queryId = `sw-${randomUUID()}`;
  const t0 = performance.now();
  const rs = await ctx.client.query({
    query: sql,
    query_id: queryId,
    query_params: params,
    format: 'JSONEachRow',
    clickhouse_settings: { wait_end_of_query: 1 },
  });
  const rows = await rs.json<T>();
  const clientMs = Math.round((performance.now() - t0) * 1000) / 1000;
  return {
    rows,
    receipt: {
      queryId,
      queryClass,
      sqlSha256: sha256Hex(sql),
      sqlVersion: `${SQL_VERSION}:${name}`,
      params,
      rowCount: rows.length,
      outputSha256: sha256Hex(canonicalJson(rows)),
      clientMs,
      serverMs: serverMsFrom(rs.response_headers),
      executedAt: nowUtcNano(),
      target: ctx.target,
      database: ctx.database,
      serverVersion: ctx.serverVersion,
    },
  };
}

export interface AnchorRow {
  workspace_id: string;
  policy_subject_id: string;
  credential_id: string;
  operation: string;
  manifest_hash: string;
  window_seconds: number;
  evaluated_anchor_ns: string;
  anchor_count: string;
  max_unique_allow_decisions: string;
  anchor_breached: number | boolean;
}

export interface WitnessRow {
  workspace_id: string;
  policy_subject_id: string;
  credential_id: string;
  operation: string;
  session_id: string;
  session_count: string;
  identity_keys: string[];
}
