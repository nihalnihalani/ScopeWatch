/**
 * ClickHouse DDL adapted from CLICKHOUSE_CONTRACTS.md. Plain MergeTree: ordering keys are NOT uniqueness;
 * canonicalization is explicit in queries and readback checks row multiplicity.
 */
export const SQL_VERSION = 'scopewatch.sql/v1';

export function ddl(): string[] {
  return [
    `CREATE TABLE IF NOT EXISTS native_event_versions
(
    generation_id String,
    fetch_record_id String,
    observation_id String,
    identity_domain Nullable(String),
    native_identity_key Nullable(String),
    workspace_id String,
    session_id String,
    native_event_id Nullable(String),
    native_task_id Nullable(String),
    credential_id Nullable(String),
    operation Nullable(String),
    decision Nullable(String),
    reason_code Nullable(String),
    created_at_raw Nullable(String),
    created_at Nullable(DateTime64(9, 'UTC')),
    unit_mapping_version String,
    semantic_json String,
    observed_at DateTime64(9, 'UTC'),
    source_ref String,
    content_sha256 String
)
ENGINE = MergeTree
ORDER BY (generation_id, workspace_id, session_id, observation_id)`,
    `CREATE TABLE IF NOT EXISTS session_snapshots
(
    generation_id String,
    workspace_id String,
    session_id String,
    launch_subject_id Nullable(String),
    coverage_state String,
    expected_pages UInt32,
    fetched_pages UInt32,
    raw_records UInt64,
    required_field_gaps UInt32,
    completion_ref String
)
ENGINE = MergeTree
ORDER BY (generation_id, workspace_id, session_id)`,
    `CREATE TABLE IF NOT EXISTS event_bindings
(
    generation_id String,
    native_identity_key String,
    policy_subject_id Nullable(String),
    binding_state String,
    native_acting_task_id Nullable(String),
    mapping_method String,
    binding_ref String
)
ENGINE = MergeTree
ORDER BY (generation_id, native_identity_key)`,
    `CREATE TABLE IF NOT EXISTS allowance_versions
(
    manifest_hash String,
    manifest_ref String,
    policy_version String,
    workspace_id String,
    credential_id String,
    operation String,
    policy_subject_id String,
    max_unique_allow_decisions UInt64,
    window_seconds UInt32,
    effective_from DateTime64(9, 'UTC'),
    effective_until Nullable(DateTime64(9, 'UTC')),
    approval_ref String
)
ENGINE = MergeTree
ORDER BY (manifest_hash, workspace_id, credential_id, operation, policy_subject_id)`,
    `CREATE TABLE IF NOT EXISTS generation_context
(
    generation_id String,
    provenance String,
    manifest_hash String,
    capture_cutoff DateTime64(9, 'UTC'),
    raw_count UInt64,
    canonical_key_count UInt64,
    semantic_digest String,
    binding_digest String,
    coverage_digest String,
    manifest_digest String
)
ENGINE = MergeTree
ORDER BY generation_id`,
  ];
}

export const TABLES = ['native_event_versions', 'session_snapshots', 'event_bindings', 'allowance_versions', 'generation_context'] as const;
