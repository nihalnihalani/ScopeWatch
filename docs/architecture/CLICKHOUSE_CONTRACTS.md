# ScopeWatch ClickHouse contracts and deterministic decision architecture

> **Current execution policy:** [Start now or anytime, with no build cutoff](../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Research and proposed contracts, 9 October 2026. No account, database, Guild runtime, grant, insert, or SQL execution was performed. The SQL below is a reviewable design and requires a syntax/account proof before use. An isolated Python reference algorithm passed 19 contract checks and 1,000 randomized comparisons against a brute-force reference; that establishes the stated window algorithm on fixtures, not ClickHouse performance or integration correctness. [Offline checks](../../research/offline-reference/verification.json), [reference implementation](../../research/offline-reference/verify_reference.py).

## Decision and necessary corrections

Use four small immutable inputs: raw native event versions, verified event-specific acting-subject bindings, the complete controller-owned session cohort with collection status, and pinned operator allowances. Evaluate all manifest candidates. Keep **current permission count**, **historical rolling-window crossing**, **coverage**, and **action eligibility** separate. Plain MergeTree, exact grouping and a bounded query are enough; materialized views are unnecessary for the minimal case workflow.

The canonical fixture is MASTER_SPEC's **600 seconds, TicketAssist 30/20, ReleaseReview 40/60**. The capability expansion's fifteen-minute/120-versus-200 illustration is a different proposed fixture and must not leak into the same case. The exact clock is verified native security-record creation time. The analytical interval is **(anchor_time − 600 seconds, anchor_time]**, with all records tied at the anchor included. A record exactly 600 seconds old is excluded. Manifest effective start is independently inclusive.

Two defects would make an otherwise exact counter wrong:

1. Filtering raw copies by ALLOW, actor, credential, operation or time **before** checking identity conflicts can hide a changed copy. Compare every version of an identity in the frozen source generation first.
2. Querying only the window ending at evaluation time can miss a historical breach when turn-end persistence/polling delays ingestion until the events have aged out. Evaluate historical event-time anchors and preserve a crossing witness even when the current count is zero.

These are application correctness requirements inferred from the declared ScopeWatch budget and delayed source behavior, not new ClickHouse detection features.

## Severity register

| Severity | Failure | Concrete consequence | Required disposition |
|---|---|---|---|
| P0 | Native ID domain or one-event/one-decision unit assumed | Double-counted decisions or conflicts hidden by an over-broad composite key | Establish native ID uniqueness domain and unit in account proof; unresolved unit blocks a definitive case |
| P0 | ALLOW/time/actor filter runs before conflict detection | A conflicting DENY, other actor or out-of-window copy disappears | Canonicalize complete frozen generation first; quarantine contradictions |
| P0 | Session mapping based on a model label or requested launch subject | Wrong installed workload selected for denial | Require authenticated native corroboration of policy subject; retain unverified rows |
| P0 | Only “now minus ten minutes” is evaluated | Delayed source persists an expired breach that is never detected | Exact historical anchor evaluation and late recomputation |
| P0 | Missing pages/sessions/required fields become zero or compliance | Incomplete evidence creates a false safe conclusion or wrong ranking | Explicit pending/incomplete states; whole monitored cohort coverage; gate action eligibility |
| P0 | Latest manifest or mutable branch head used for old events/cases | Retrospective approval changes erase or invent a breach | Freeze reference/hash, effective boundary, version and evaluation semantics |
| P0 | Replay/client labels can enter privileged native input | A synthetic actor becomes a live action target | Native writer/provenance boundary and independently trusted generation receipt |
| P1 | MergeTree sorting key, ReplacingMergeTree or insert retry dedup treated as uniqueness | Counts vary with background merges/batch shapes | Query-level native identity canonicalization; keep all contradictory source versions |
| P1 | `any`, `argMax`, `ANY JOIN` or duplicate manifest bindings pick a mapping arbitrarily | Reproducibility loss and incorrect attribution | Validate right-side cardinality; deterministic canonical values and explicit selection rule |
| P1 | Async buffer acknowledgement treated as queryable coverage | Evaluation sees fewer rows than the receipt claims | Batch synchronous inserts, or await async flush and verify acknowledged generation |
| P1 | UInt64/Int64 JSON converted to JS Number; DateTime64 rounded via JS Date | Incorrect count/timestamp comparisons | BigInt/exact decimal strings; preserve original timestamp and precision |
| P1 | QueryStart/child/unrelated/missing samples enter p50/p95 | Misleading performance evidence | Exact issued query IDs, initial QueryFinish records, sample reconciliation and explicit estimator |
| P2 | Minute counts/late-changing manifest rollups introduced early | Boundary and historical-policy errors; extra integration burden | Keep raw query; only optimize after equality proof |
| P2 | 26.9 tokens assumed deployed/usable | Authentication distraction or privilege mistake | Optional, selected-service/version/grant/client proof first |

## Native identity, exact duplicates and conflicts

The platform's actual uniqueness contract determines identity. If an event ID is workspace-unique, use an injective encoding of `(workspace_id, native_event_id)` and compare session as payload. Adding session to that key would hide a same-ID record whose session changed. If the ID is only session-unique, `(workspace_id, session_id, native_event_id)` is appropriate after that domain is established. If the native event bundles multiple countable decisions, add a native decision identity or a proved stable native ordinal; do not infer one unit from a tool-call count. An opaque ID is an equality key, never a pagination-order or event-time authority.

`native_identity_key` below is a collector encoding under a recorded `identity_domain`; it is not a new guessed native identifier. Encode a tuple with canonical JSON or length prefixes, not delimiter concatenation. A missing key remains NULL and adds a gap. A cryptographic source hash is useful for receipts, but comparing only a truncated/hash-derived payload fingerprint is not the specified equality test.

An **exact redelivery** has the same identity and identical decision-relevant native content: source workspace/session, original event/task/subject/credential fields, raw and parsed creation time, decision, operation, unit-mapping version, and the stable native security payload. Observation time, fetch/page identifier and collector diagnostics are provenance rather than event semantics. Preserve both redeliveries; the canonical query retains one logical fact. A changed stable native value is an **integrity conflict**, including ALLOW→DENY, NULL→value, changed attribution, changed timestamp, changed credential or changed operation. Do not choose the last fetched row as truth. If the source genuinely supports revisions, define and prove a separate authoritative revision protocol; none is assumed here.

`uniqExact` returns an exact distinct count and accepts multiple values or a Tuple, with memory that grows with distinct cardinality. Ordinary aggregation skips rows containing NULL arguments; the documented Tuple workaround preserves NULL values. However, issue #114784 identified an optimizer rewrite that stripped `tuple(nullable)` and changed `uniq*` results. The linked fix #115466 merged on 20 August 2026 and lists backports, but an announcement/fix does not establish the selected service's version or analyzer/settings path. The proposed conflict query therefore uses **full-row DISTINCT followed by count()**, whose documented NULL equality preserves NULL→value differences without depending on that rewrite. `uniqExact` remains appropriate for non-NULL validated native identity counts. [Exact aggregate contract](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact), [aggregate NULL processing](https://clickhouse.com/docs/reference/functions/aggregate-functions#null-processing), [merged optimizer fix](https://github.com/ClickHouse/ClickHouse/pull/115466), [DISTINCT NULL semantics](https://clickhouse.com/docs/reference/statements/select/distinct#null-processing).

## Frozen generations and the smallest viable raw schema

A **generation G** is one closed evaluation input: exact acknowledged raw fetch records, expected session inventory, event-binding and coverage snapshots, manifest reference and one UTC capture cutoff. The controller seals G only after all required insert acknowledgements and records counts, input digest, scope, capture cutoff, collector version and provenance class. No writes append to a sealed G; late or corrected source data creates G+1. G+1 carries forward all previously observed relevant native versions as well as new copies; fetching only the latest source image would discard the evidence needed to identify a changed record. This is an application invariant enforced by the trusted collector, not a MergeTree transaction or a uniqueness constraint. In the small live lab, copying the bounded native snapshot into each generation is acceptable. Its storage/ingestion cost must be included if used for larger replay; this is not an asserted production snapshot strategy.

The native table and event-binding table accept only the trusted native collector. Replay uses a separate database/table set with the same query contract and a clearly synthetic receipt. A writable `dataset_kind='native_lab'` value is insufficient to establish native provenance. Manifest writes belong to a separate trusted operator/controller path; the observer workloads and investigator have neither grant.

Illustrative DDL, **not executed**:

```sql
CREATE TABLE scopewatch.native_event_versions
(
    generation_id String,
    fetch_record_id String,
    identity_domain Nullable(String),
    native_identity_key Nullable(String),
    workspace_id String,
    session_id String,
    native_event_id Nullable(String),
    native_task_id Nullable(String),
    native_subject_id Nullable(String),
    credential_id Nullable(String),
    operation Nullable(String),
    decision Nullable(String),
    created_at_raw Nullable(String),
    created_at Nullable(DateTime64(9, 'UTC')),
    unit_mapping_version String,
    semantic_json String,
    observed_at DateTime64(9, 'UTC'),
    source_ref String
)
ENGINE = MergeTree
ORDER BY (generation_id, workspace_id, session_id, fetch_record_id);

CREATE TABLE scopewatch.session_snapshots
(
    generation_id String,
    workspace_id String,
    session_id String,
    launch_subject_id Nullable(String),
    launch_binding_state String,
    coverage_state String,
    expected_pages UInt32,
    fetched_pages UInt32,
    expected_native_records UInt64,
    acknowledged_raw_records UInt64,
    required_field_gaps UInt32,
    completion_ref String,
    launch_and_mapping_ref String,
    coverage_ref String
)
ENGINE = MergeTree
ORDER BY (generation_id, workspace_id, session_id);

CREATE TABLE scopewatch.event_bindings
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
ORDER BY (generation_id, native_identity_key);

CREATE TABLE scopewatch.allowance_versions
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
ORDER BY (manifest_hash, workspace_id, credential_id, operation,
          policy_subject_id);
```

`semantic_json` is a canonical serialization of stable native security content and is retained along with the raw source artifact; it must not contain collector observation/page envelope fields. Each event_bindings row resolves the **actual acting policy subject for that native decision**, using authenticated native event/task-graph facts; it cannot copy the session root or requested launch subject. Nested B operations inside A's session resolve to B. If the account cannot establish the acting subject, binding_state remains unresolved and the cohort fails readiness. Verify the native task/event correspondence, policy identifier domain, mapping method and proof reference; optional native task/subject fields may be NULL only when other exact native evidence establishes that same acting-subject relation. NULL event identity, clock, decision, selected operation or required credential/subject binding makes the relevant evidence incomplete. The account proof decides which fields are required, rather than making every schema property mandatory.

DateTime64 uses integer epoch ticks with explicit column precision/timezone. Nanoseconds avoid introducing millisecond tie/edge changes during normalization; retain source text and reject unparseable/out-of-range timestamps. Do not round through JS Date or guess that a JSON integer means seconds or precision ticks: numeric parsing has version/format qualifications. Use validated UTC text and typed query parameters. Collector observation and native creation remain different clocks, including visible negative/implausible lag. [DateTime64 contract](https://clickhouse.com/docs/reference/data-types/datetime64).

## Readiness gates before aggregation

Readiness is a structured result, not a hidden WHERE condition. A preflight query/controller pass returns all gaps and then sets action eligibility. It must establish:

- Exactly one immutable manifest per selected evaluation context, one allowance row per `(workspace, credential, operation, policy_subject)`, the expected 600-second unit/clock and approval reference. Exact repeated allowance rows can be deduplicated; contradictory rows block evaluation.
- Exactly one inventoried launch/coverage snapshot per expected cohort session, and exactly one verified event_bindings row per canonical native identity in G. A duplicate mapping with changed actual subject, method or proof is a metadata conflict. The session root/requested launch label is not acting-subject corroboration. A verified event subject with no manifest allowance is an explicit missing-allowance/unapproved state, not an INNER JOIN omission.
- The entire registered monitored cohort through cutoff is inventoried. Include sessions begun before the oldest counted window when they can contribute events within it. Open/incomplete turns, failed pages, missing cursors, unknown sessions or absent required fields are disclosed. A successful last page alone does not prove traversal of the finite source snapshot.
- Every raw row required by the generation receipt is acknowledged/queryable; expected counts/digests match. API page count is not a deduplicated event count.
- No unresolved native identities or stable-content conflicts exist in the evaluation scope. Check **all decisions and all timestamps in G**, including copies outside the selected operation/window.

With complete verified candidate A and incomplete candidate B, A's verified crossing may be shown with its own witness, but the system cannot declare A the only offender or the whole cohort safe. For the smallest operator-action demo, require whole declared cohort readiness before selecting a definitive primary case. If a missing-only source has clean canonical identity, an observed count already above allowance mathematically proves at least that many approvals; mark it an observed lower-bound breach rather than inventing complete attribution/ranking. Conflicts are not the same as missing-only data and require resolution.

A complete candidate with no matching events is zero. An incomplete or absent candidate is pending/incomplete. Neither INNER JOIN disappearance nor ClickHouse's default-filled outer-join values is an acceptable status encoding. NULL JOIN keys do not match, and ordinary joins can multiply rows if the mapping table is not unique. Use scalar left joins with explicit `join_use_nulls=1` only after cardinality validation; do not use `ANY JOIN` to conceal duplicate bindings. [JOIN contract](https://clickhouse.com/docs/reference/statements/select/join).

This readiness statement is **cohort-scoped at the recorded snapshot cutoff**. It does not establish every session in a workspace, every credential user or future source completeness. A later source revision reopens the evidence with a new generation.

## Canonical extraction and authoritative all-candidate anchor query

The following CTE is reused verbatim by count, session evidence and historical extraction queries. Its only early restriction is the sealed source generation. There is no preselected actor, ALLOW filter, operation filter or timestamp filter in `key_variants`.

```sql
WITH
variants AS
(
    SELECT DISTINCT
        native_identity_key, identity_domain, workspace_id, session_id,
        native_event_id, native_task_id, native_subject_id,
        credential_id, operation, decision,
        created_at_raw, created_at, unit_mapping_version, semantic_json
    FROM scopewatch.native_event_versions
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
)
-- Terminal SELECT depends on the operation below.
```

Before any terminal SELECT is eligible to establish compliance/breach, inspect `key_variants` for `variant_count != 1` and raw required-field gaps. The canonical CTE omits conflicting/NULL-key rows to permit a diagnostic view; that omission cannot itself authorize a case. Configure exact queries to throw on timeout/resource/overflow failures, rather than return a partial DISTINCT/GROUP BY result; pagination applies only to evidence presentation after full evaluation, never to detection input. Because variants contains one row per complete stable native record, `variant_count=1` gives one reproducible logical row. It avoids arbitrary latest-row/`any` replacement. `any` is generally non-deterministic; it is unnecessary here. [any contract](https://clickhouse.com/docs/reference/functions/aggregate-functions/any).

After the readiness gates, append these CTEs and the SELECT. The selected manifest hash is a trusted pinned input, not an actor chosen in the UI. This same query evaluates each historical anchor; binding window_anchor to G's capture cutoff gives the current count:

```sql
, candidates AS
(
    SELECT DISTINCT *
    FROM scopewatch.allowance_versions
    WHERE manifest_hash = {manifest_hash:String}
),
scoped AS
(
    SELECT
        c.native_identity_key, c.workspace_id, c.session_id,
        c.native_event_id, c.created_at,
        m.policy_subject_id, m.credential_id, m.operation,
        m.max_unique_allow_decisions, m.window_seconds,
        m.effective_from
    FROM canonical AS c
    INNER ALL JOIN scopewatch.session_snapshots AS s
        ON c.workspace_id = s.workspace_id AND c.session_id = s.session_id
    INNER ALL JOIN scopewatch.event_bindings AS b
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
),
anchor_totals AS
(
    SELECT
        workspace_id, policy_subject_id, credential_id, operation,
        uniqExact(native_identity_key) AS anchor_count
    FROM scoped
    WHERE created_at >
        {window_anchor:DateTime64(9, 'UTC')} - toIntervalSecond(window_seconds)
    GROUP BY workspace_id, policy_subject_id, credential_id, operation
)
SELECT
    m.workspace_id, m.policy_subject_id, m.credential_id, m.operation,
    m.manifest_hash, m.policy_version, m.manifest_ref,
    m.window_seconds, m.effective_from,
    {window_anchor:DateTime64(9, 'UTC')} AS evaluated_anchor,
    ifNull(t.anchor_count, toUInt64(0)) AS anchor_count,
    m.max_unique_allow_decisions,
    ifNull(t.anchor_count, toUInt64(0)) > m.max_unique_allow_decisions
        AS anchor_breached
FROM candidates AS m
LEFT ALL JOIN anchor_totals AS t
    ON m.workspace_id = t.workspace_id
   AND m.policy_subject_id = t.policy_subject_id
   AND m.credential_id = t.credential_id
   AND m.operation = t.operation
ORDER BY m.workspace_id, m.policy_subject_id, m.credential_id, m.operation
SETTINGS join_use_nulls = 1;
```

The freeze epoch must cover the whole evaluation horizon: an `effective_until` before cutoff or an in-window manifest replacement fails the simple path. The final result deliberately starts from **all** candidates, including the busier authorized control and verified zero-event candidates. The controller attaches the separately established readiness state. The subject comes from b's event-specific verified mapping; s supplies collection coverage only. The historical decision combines the exact database result for every declared anchor.

To obtain the exact contributing sessions for a stored witness, apply the same `scoped` CTE to that witness's anchor, not the later current cutoff:

```sql
SELECT
    workspace_id, policy_subject_id, credential_id, operation,
    uniqExact(native_identity_key) AS witness_count,
    arraySort(groupUniqArray(tuple(workspace_id, session_id)))
        AS contributing_sessions
FROM scoped
WHERE created_at > {anchor:DateTime64(9, 'UTC')} - INTERVAL 600 SECOND
  AND created_at <= {anchor:DateTime64(9, 'UTC')}
GROUP BY workspace_id, policy_subject_id, credential_id, operation
ORDER BY workspace_id, policy_subject_id, credential_id, operation;
```

Also return a separate ordered per-session query grouped by workspace/subject/credential/operation/session with `uniqExact(native_identity_key)`; its sum must equal the candidate witness count when canonical session binding is single-valued. `groupUniqArray` has the same state-memory class as `uniqExact`; `groupUniqArray(max_size)` truncates evidence. Sort the final full small-lab array for deterministic receipts. At larger scale use paginated per-session/evidence queries with explicit truncation and totals, never a capped array presented as all contributing sessions. [Distinct-array contract](https://clickhouse.com/docs/reference/functions/aggregate-functions/groupUniqArray).

## Exact historical crossings, tied timestamps and late recomputation

The **authoritative small-demo path is ClickHouse's all-candidate aggregate at every distinct event-time anchor**, using the query above with window_anchor=t. Derive the ordered anchor set from the same canonical/event-bound selected ALLOW facts, with `effective_from <= created_at <= G.capture_cutoff`; include complete timestamp tie groups and also evaluate the capture cutoff for current usage. An anchor-list query is `SELECT DISTINCT created_at FROM scoped ORDER BY created_at`, with scoped initially bounded by the capture cutoff. There is no UI actor filter. At every anchor ClickHouse returns all candidates and their exact native counts; the controller selects the first strict crossing under the deterministic rule below and retrieves its native/session witness. Save the query IDs and output for the selected crossing, control and current snapshot. This is several small bounded database evaluations, not an asserted scalable historical range join.

The following application two-pointer sweep is the **independent equality oracle**, not the authority that manufactures candidate counts. Extract the same `scoped` facts with `toUnixTimestamp64Nano(created_at) AS event_time_ns`, exact identity and session, ordered by candidate/time/identity. Keep integer strings/BigInt end to end and compare every candidate's anchor results with the database results on the small live fixture.

```text
require sealed G, trusted M, native provenance and readiness gates
for every candidate in M, including zero-event candidates:
    events = canonical ALLOWs for candidate credential/operation
             with M.effective_from <= event_time <= cutoff
    sort events by (exact event_time_ns, native_identity_key)
    queue = empty; first_crossing = absent; maximum_count = 0
    for each distinct timestamp t, in ascending order:
        remove every queued event whose time <= t - 600 * 10^9
        append the ENTIRE group of events whose time == t
        n = queue.length
        maximum_count = max(maximum_count, n)
        if n > allowance and first_crossing is absent:
            save (t, n, allowance, manifest/hash, G,
                  sorted identity keys, per-session contribution)
    current_count = number of events with cutoff-600s < time <= cutoff
    emit candidate/current_count/first_crossing/maximum_count/coverage
breaches = every ready candidate with a first_crossing
primary = first in sorted order:
          (first_crossing_time ASC, excess_at_first_crossing DESC,
           workspace_id ASC, policy_subject_id ASC,
           credential_id ASC, operation ASC)
```

Use BigInt for the count-minus-allowance comparison and nanosecond arithmetic. The primary ordering is an explicit application convention, not a security severity score. Return all breaches and the authorized control alongside the primary. A tie group may cross from 20 to 30 at once; save the full thirty-event witness, including all ten new events at the anchor. An arbitrary “21st event” within that tie is not the mathematical witness.

**Why the sweep is sufficient:** for a fixed allowance, the count in `(t−W,t]` can increase only when events arrive in event time. Between distinct arrival times it only stays level or decreases as older events expire. Checking each full arrival tie group therefore finds every possible strict crossing. The sorted scan is O(n log n), and the subsequent sweep is O(n); retaining only the first crossing's keys avoids copying a queue at every anchor. The offline reference retains all anchor keys for independent small-fixture verification and is not a performance implementation.

**Late events:** a unique event at time u can alter anchor windows with `u <= anchor < u+600s`; the right endpoint is strict because u is excluded at `anchor=u+600s`. It can also introduce a new anchor at u. Create G+1 and recompute the affected candidate over the entire pinned evaluation horizon; this simple rerun avoids a complicated incremental state protocol. A changed identity/mapping or manifest interpretation requires a broader invalidation. Link revised evidence to the prior case, preserve both snapshots and require renewed review if the target/action scope changes. An earlier historical breach remains reviewable after current usage falls to zero; an aged-out count is not recovery authorization.

The authoritative database procedure is:

```text
anchors = all distinct canonical/event-bound selected ALLOW timestamps
          within the pinned epoch through G.capture_cutoff
for t in ascending anchors:
    execute FIXED_ALL_CANDIDATE_ANCHOR_SQL with window_anchor=t
    retain every candidate's anchor_count and corresponding query_id
    for each ready candidate not yet crossed:
        if anchor_count > allowance: record first crossing at t
execute the same query with window_anchor=G.capture_cutoff for current usage
select primary from all breached candidates with the declared stable ordering
```

Using the union of candidates' anchors is sufficient: every count increase for every candidate occurs at one of these timestamps. Another candidate's timestamp cannot increase a given candidate's count but can expose an expiration; extra evaluations do not invent a breach. At a timestamp with several events, the SQL right-inclusive predicate includes the entire tie group. Derive the ordered anchor set from the full capture-cutoff snapshot before replaying anchors; never stop source ingestion at the first discovered crossing.

No inequality JOIN or Cartesian historical cross-pair query is necessary. Query count is proportional to distinct anchors and can be acceptable for the bounded native case. The million-row replay must state how many anchor evaluations were actually executed; a single anchor benchmark is not a full historical-detector benchmark. No authoritative SQL was run in this research.

## Manifest version and effective-time semantics

The minimal-case analytics contract is a **frozen policy epoch**. Pin one operator-owned manifest before applicable activity; select it by immutable repository reference and exact content hash. Effective start is inclusive; events before it are separate preflight activity under another declared context. Count all applicable activity from the declared epoch, including retries. The rolling window is `(anchor−600s,anchor] ∩ [effective_from, cutoff]`; the short initial portion of an epoch is explicit rather than padded with prior unapproved activity.

Do not treat the event's collector-assigned `policy_version` as native evidence. Allowance is evaluation context joined by the declared subject/credential/operation. The case receipt records M, G, effective boundary, clock, unit version, cutoff and witness. A Git blob ID is not a SHA-256 content hash. A human-friendly version label is not an immutable manifest.

For this simple path, require no effective replacement through cutoff. If policy changes mid-horizon, either close the epoch and evaluate each epoch independently under explicitly approved semantics, or design a separate **policy-as-of-anchor** or **policy-as-of-event** contract. Those are different products: per-event limits cannot be blindly summed into one cross-version denominator, and applying the current allowance to old events can retroactively invent approval. An ASOF/latest-row join without those semantics does not solve the authority question. Historical case receipts remain immutable even when a new manifest evaluation is requested.

## Engine and insertion contracts

A MergeTree ordering key organizes storage; it does not reject duplicate logical events. ReplacingMergeTree removes rows sharing its sorting key during background merges whose timing is not guaranteed. `FINAL` gives that engine's query-time replacement behavior; it does not validate that conflicting native content was resolved correctly. A last-version winner can destroy the contradiction evidence needed by this case. Keep immutable raw versions and explicit grouping. [Replacement semantics](https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/replacingmergetree).

One completed snapshot batch with synchronous insertion is the simplest live collector path. If async inserts are selected, use `async_insert=1, wait_for_async_insert=1` and await successful flush acknowledgement before sealing coverage; buffered rows are unqueryable before flush. An ambiguous timeout leaves G unsealed until retry/reconciliation confirms the expected queryable input. Insert/query retry deduplication depends on engine/settings and operates at an insert identity/block/query level, not at the native permission-event identity across differently shaped overlapping pages. Canonical grouping remains necessary. [Async-insert contract](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts).

A minute-rollup count can double-count redelivery and cannot exactly answer arbitrary rolling boundaries. A distinct-state rollup requires correct raw identity/conflict handling and raw-boundary reconciliation. Incremental MVs trigger on inserts to the left-most source; a changed manifest on the right does not rewrite already-produced results. No MV is justified before the raw decision and witness equality checks pass. [Incremental MV contract](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view).

## Cloud JavaScript TLS, authentication and read/write roles

Use the server-side `@clickhouse/client` with the selected Cloud service's HTTPS URL/port and SQL username/password from the connection panel; typical TLS port is 8443. Cloud console/API identity, ClickStack OAuth, ingestion keys and SQL credentials are different surfaces. Do not infer interoperability. Keep SQL credentials in the controller/collector service, with verified TLS; frontend and investigator receive sanitized bounded results. Pin actual installed client/server versions. `query_params` binds typed `{name:Type}` values, and `query_id` is assigned by the client or must be unique when supplied. Consume/await the result set rather than treating headers as a completed result. [Official JS client](https://clickhouse.com/docs/integrations/language-clients/js/index).

Illustrative client shape, without connection or execution:

```ts
const reader = createClient({
  url: requiredEnv('SCOPEWATCH_CH_HTTPS_URL'),
  username: requiredEnv('SCOPEWATCH_CH_READER_USER'),
  password: requiredEnv('SCOPEWATCH_CH_READER_PASSWORD'),
  database: 'scopewatch',
});
const result = await reader.query({
  query: FIXED_ALL_CANDIDATE_ANCHOR_SQL,
  query_id: crypto.randomUUID(),
  query_params: { generation_id, manifest_hash, window_anchor: exactUtcText },
  format: 'JSONEachRow',
});
const rows = await result.json();
// UInt64/Int64 output remains quoted decimal strings. Parse with BigInt.
```

Use three privilege lanes: **collector** INSERT only on native raw/session/event-binding tables, **manifest authority** INSERT only on allowance records, **evaluator** SELECT only on the required evidence tables. A one-time schema/grant administrator is separate. The investigator has no database credential in the minimum path; optional evidence access uses a narrower sanitized table/view or controller endpoint. Grant no GRANT OPTION, DDL, mutation, policy/role administration, external-source or backup rights. The client `role`/`roles` field selects granted roles; it does not create a security boundary around an otherwise powerful SQL user. Narrow server privileges are the boundary. [GRANT contracts](https://clickhouse.com/docs/reference/statements/grant).

`readonly=1` adds query restrictions but does not replace least-privilege grants. Current docs explicitly qualify backup, temporary/access-management and named-collection behavior. Settings must be constrained server-side; a model-selected request setting is insufficient. The JS client also notes that response compression can require a setting unavailable to a strict readonly user. Preconfigure the evaluator's fixed allowed query settings, including `join_use_nulls`, or prove they can be supplied; avoid demanding arbitrary SET capability to make the demo work. [Readonly semantics](https://clickhouse.com/docs/concepts/features/configuration/settings/permissions-for-queries).

Counts are UInt64 and nanosecond ticks are Int64. Keep JSON quoting enabled and compare exact decimal strings as BigInt; disabling integer quoting and using Number risks losing precision. A known small fixture can be rendered as a Number only after an explicit safe-range check. [JS integer caveat](https://clickhouse.com/docs/integrations/language-clients/js/index#integral-types-int64-int128-int256-uint64-uint128-uint256).

26.9 `CREATE TOKEN` remains optional. Service version, creation privilege, token TTL/subset grants and the installed client's accepted authentication form must be independently proved. A release announcement or a developer-index snapshot mentioning `access_token` does not prove the currently installed package supports it. Existing dedicated SQL readers satisfy the minimum design; no token, MCP, UDF or alert deployment is a dependency.

## Query receipts and honest p50/p95 measurements

Store application-issued query IDs, exact SQL version/hash, bound scope/window/manifest/generation parameters, output digest and the actual bounded output separately. `system.query_log` stores execution metadata, not query result rows. In Cloud it is per-node; inspect all relevant replicas. Successful runs have QueryStart and QueryFinish records; filter initial QueryFinish by the exact issued ID set. `is_initial_query=1` excludes correlated child work but can still include internal top-level queries, so it alone is not the sample definition. Logs flush asynchronously and may be sampled/disabled; reconcile every issued run with logs and report missing runs. [Query-log contract](https://clickhouse.com/docs/reference/system-tables/query_log).

Proposed receipt retrieval, performed only by an appropriately permitted diagnostics reader:

```sql
SELECT
    hostName() AS node, query_id, initial_query_id,
    event_time_microseconds, query_duration_ms,
    read_rows, read_bytes, result_rows, memory_usage,
    exception_code, exception
FROM clusterAllReplicas('default', system.query_log)
WHERE type = 'QueryFinish'
  AND is_initial_query = 1
  AND query_id IN {issued_ids:Array(String)}
ORDER BY query_id, node, event_time_microseconds;
```

Use the actual inspected cluster name; `'default'` is the documentation's Cloud example, not an account guarantee. Keep exception-before-start/while-processing and client timeout runs in a separate failure inventory. Diagnose duplicate initial finishes rather than silently counting them twice. Node-local logs, a not-yet-flushed log, service resume or a missing privilege do not imply a successful zero-millisecond query. A restricted reader may not have permission to use `clusterAllReplicas` or flush logs; wait/retrieve via the diagnostics lane rather than widening investigator privileges.

Before execution declare the sample size, query path and estimator. For a modest demo sample, report each duration or nearest-rank p50/p95: sort n valid durations and take ranks `ceil(0.50*n)` and `ceil(0.95*n)`. At n=20, p95 is the 19th duration and has little tail precision; it is a descriptive sample, not a production SLA. Publish n, issued/success/error/missing counts, rows read, memory, data shape, region/service/version, cache/warmup/service-resume conditions and concurrency. Repeating the same cached cutoff query is a warm repeated workload, not diverse production throughput.

Measure **server execution** from query_log and **client wall time** until full result consumption separately. Measure native occurrence→completed-turn persistence→collector observation→queryable acknowledgement→evaluation→investigation→approval→policy→fresh denial/control separately. SQL latency does not include the historical anchor sweep unless explicitly instrumented, and it does not remove source, model or human delay.

The scale panel must state whether it measured (a) raw conflict/canonical extraction, (b) one all-candidate anchor aggregate, (c) the complete authoritative historical procedure over all anchors, or (d) the independent extraction-plus-sweep oracle. A million stored replay rows with repeated native IDs can still contain few decision units. Report stored rows, distinct canonical units, conflicts, sessions, candidates, operation mix, time/tie distribution, allowances and selected candidates. Label the replay/synthetic provenance; no real fleet, customer events, attack accuracy or containment performance follows from it.

## Acceptance gates and next implementation proof

The 19 offline checks cover input-order independence, same-ID redelivery/new-ID retry, timestamp/session/decision conflict rejection, NULL identity gap, failed ALLOW versus DENY/ERROR/unrelated scope, effective start, complete zero, 30/20 versus 40/60, nested-actor binding/missing/conflicting binding, left-open/right-closed ties, expired-current historical breach and late recomputation. A further 1,000 randomized timestamp sets match brute-force anchor counts. These checks neither validate SQL syntax nor prove required Guild identifiers exist.

For implementation, prove in order: native unit/ID/clock/binding; cohort pagination/coverage; actual raw insert/readability; conflict CTE and all-candidate counts; database-anchor/sweep equality on boundary/late/conflict fixtures; pinned manifest/readiness cases; then the live historical witness and query receipt. Run a meaningful distinct replay only after those gates. The database's decisive product contribution is a reproducible subject/allowance/session decision over trusted facts. It is not uniqueness of the quota algorithm or an unmeasured analytics scale claim.

## Saved primary evidence

All captures are under [.firecrawl/architecture-clickhouse](../../references/architecture-clickhouse). Existing first-party KB captures were copied and inspected instead of refetched when sufficient. New client, precision, JOIN, aggregate NULL, DISTINCT/GROUP BY, distinct-array and privilege docs plus the linked merged optimizer fix were scraped after developer-index discovery and targeted searches. Developer-index results are discovery evidence; final contracts use the full first-party pages, not third-party mirrors or unresolved issue reports.

| Capture | Primary URL | Use |
|---|---|---|
| `uniqexact.md` | https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact | Exact identity/semantic grouping |
| `aggregate-null.md` | https://clickhouse.com/docs/reference/functions/aggregate-functions | Tuple-preserved NULL semantics |
| `groupuniqarray.md` | https://clickhouse.com/docs/reference/functions/aggregate-functions/groupUniqArray | Exact session set/memory/truncation |
| `distinct.md` | https://clickhouse.com/docs/reference/statements/select/distinct | Full stable-record variants, including NULL |
| `group-by.md` | https://clickhouse.com/docs/reference/statements/select/group-by | NULL grouping and conflict group cardinality |
| `tuple-null-fix.md` | https://github.com/ClickHouse/ClickHouse/pull/115466 | Verified merged optimizer fix and version qualification |
| `tuple-null-issue.md` | https://github.com/ClickHouse/ClickHouse/issues/114784 | Original reproducer, superseded by merged fix |
| `any.md` | https://clickhouse.com/docs/reference/functions/aggregate-functions/any | Non-deterministic representative caution |
| `datetime64.md` | https://clickhouse.com/docs/reference/data-types/datetime64 | Precision/timezone/numeric input qualifications |
| `join.md` | https://clickhouse.com/docs/reference/statements/select/join | Multiplication/NULL/strictness contracts |
| `replacingmergetree.md` | https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/replacingmergetree | Background replacement versus native integrity |
| `incremental-mv.md` | https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view | Right-side manifest changes do not retrigger |
| `async-inserts.md` | https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts | Queryability/acknowledgement versus native dedup |
| `js-client.md` | https://clickhouse.com/docs/integrations/language-clients/js/index | HTTP(S), typed bindings, roles, query IDs, integers |
| `grant.md` | https://clickhouse.com/docs/reference/statements/grant | Narrow database privileges |
| `readonly.md` | https://clickhouse.com/docs/concepts/features/configuration/settings/permissions-for-queries | Readonly qualifications |
| `query-log.md` | https://clickhouse.com/docs/reference/system-tables/query_log | Per-node finish metadata and log/sample scope |

The accompanying [capture manifest](../../references/architecture-clickhouse/sources.json) includes local hashes and acquisition provenance. No live service version, permission configuration, native identity domain, complete production cohort, query latency or enforcement success is established by these documents.
