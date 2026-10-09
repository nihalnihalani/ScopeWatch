> Advisory research snapshot. For current native authority, event attribution, window boundaries and recovery semantics follow [the corrected architecture](../architecture/ARCHITECTURE.md) and its contracts. Fixture alternatives below are not simultaneous build requirements.

> Timing override: [current human build authorization](../event/BUILD_AUTHORIZATION.md) permits starting now or anytime, with no global cutoff or hard duration cap. The old calendar schedule is superseded; readiness and actual evidence govern progress. Request/test timeouts and diagnostic retry bounds remain operational controls, not permission to stop required work.

# Round 2: ClickHouse rebuttal and simplified ScopeWatch decision

Research-only, 9 October 2026. No new collection, implementation or runtime tests in this rebuttal. Read alongside [ClickHouse capabilities](clickhouse-capabilities.md), [Guild evidence contract](guild-capabilities.md) and the [source KB](../../references/scopewatch-kb/clickhouse/index.md).

## Accept the criticism and fix the label

The judge is right: the minimum is an **asynchronous approval-event quota circuit breaker with a reviewed selective response**. Trusted purpose text, session attribution and an LLM explanation do not prove task drift, malicious intent, successful resource access or exfiltration. The honest product sentence is:

> ScopeWatch finds a workload exceeding its owner's declared approval-event allowance across completed sessions, supplies the contributing evidence for review, and selectively restricts subsequent matching operations while the approved workload continues.

The analytic predicate remains deterministic. The system does not need a model to decide that thirty exceeds twenty, nor does it demonstrate a new security detection category. The hosted investigator's useful role is to inspect the pinned operator context, produce a grounded incident and expose uncertainty before the operator decides the concrete action.

Shared credentials and differentiated allowances nevertheless change the response. A credential-wide count or revocation would combine unlike approved workloads and interrupt maintenance. An actor-aware query applies each workload's own declaration and proposes the support actor's proved scope. The native DENY and fresh successful maintenance action then establish that the actual action matches that decision. Purpose context explains **why the operator assigned different allowances**; it does not establish that the support agent's actual content was off task.

The fixture is deliberately controlled. Any numbers in this document are planned values, never measured results or production recommendations. A support workload with five sessions of six native approvals against twenty, and a busier maintenance workload with 120 against 200, is a useful contrast only after those native units, actor bindings and windows are established.

## The exact analytical decision must precede actor selection

The query receives a workspace, selected credential/operation family, declared cutoff/window, pinned manifest version and the fully covered session population. **It receives no suspected actor chosen by the UI or operator.** Within that authorized population it evaluates every manifest-bound workload and returns the violators, their excess and contributing sessions. A deterministic tie rule may order several violations, but the minimum fixture should contain exactly one. An ambiguous or incomplete result is a review state, not an invented unique winner.

Logical order for the proposed query contract:

1. Establish the covered source sessions and authenticated task→agent/workspace/credential mapping.
2. Resolve native event identity and reject conflicts in counting or attribution fields **before** grouping by actor.
3. Select actual `ALLOW` decisions for the established exact operation and a half-open native record-creation interval `[start, cutoff)`.
4. Count exact native decision units, retain distinct contributing session references, and apply the pinned allowance for each actor.
5. Return the violating actor/scope plus count, allowance, excess, manifest version, clock/window, source references and completeness state.
6. Save that result and actual query ID as the case. The UI displays the returned subject; the investigator receives the same case. The operator later chooses whether to approve that specific response.

This separates machine selection of a declared-policy violation from human authorization of containment. A chart's manually selected actor, a prompt's allegation, or a tool payload's `agent_id` cannot determine the subject. Case creation should reconcile an existing case rather than opening another issue on every repeated evaluation; idempotent case handling must not deduplicate genuinely new native decisions.

The final target rule must use only proved enforceable dimensions. Grouping by verified agent/workspace/credential/operation is within the core; a repository/method selector is an enforcement candidate requiring account proof. Nullable `details` does not establish repository-level analytic attribution. This avoids decorating a broad counter with unobserved resource precision. [Guild events](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [native policy selectors](https://docs.guild.ai/platform/credential-policies).

## Collection correctness is part of the decision

The events API defaults to newest first and twenty records; the documented limit caps at one thousand, and `from_id` is exclusive. Advancing to the newest ID while ignoring `has_more` can discard earlier activity. The collector must prove the chosen ascending durable traversal or exhaust a stable completed-session population with the endpoint's actual sort/cursor behavior. General pagination examples do not erase the specific endpoint's ordering. Read permissions and successful HTTP transport are also insufficient to prove that every intended event page was obtained. [Event endpoint](https://docs.guild.ai/api-reference/sessions/fetch-session-events).

For the minimum, use the controller's finite set of real launched lab sessions. Keep expected session/root-task IDs, page receipts, cursor/sort values, terminal-state observation, collection completion and reconciliation status. Declare coverage only after the relevant completed-turn evidence is collected. The endpoint does not establish an atomic snapshot in this research; repeated/reconciled completed-session reads may be needed. A failing page, unresolved parent task, nullable credential or newly arriving lower ID yields incomplete evidence. The active case must show that warning. The control is “within allowance over complete covered evidence” only when coverage supports that statement.

Native UUIDv7 IDs support the platform's durable ordering and exact identity. They do not supply an authenticated resource-execution clock. Preserve `created_at` as **Guild event record-creation time**, after returned-field proof, and record `observed_at` separately. Do not substitute `updated_at`, decode UUID time as delivered-data time, or silently mix arrival time with the policy window. Do not assume a database's UUID representation/order reproduces the API's cursor order; pass the actual opaque native IDs to that API and use an established clock for the query window. Stable native identity is a tie breaker and equality key, not a substitute timestamp. [Events](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [session record examples](https://docs.guild.ai/platform/api-triggers).

Deduplication also needs a conflict policy. If overlapping pages repeat the same decision identity with the same counting fields, count it once. If that identity is attributed to two different workloads, credentials, decisions, operations or record times, flag/quarantine it pending reconciliation. Grouping first and applying `uniqExact` separately can count one conflicting ID under two actors. Permitted metadata updates can be retained as source versions; last-write-wins must not silently resolve a changed security fact. An untrusted display label never overrides authenticated native task/launch mapping.

## SQL and schema pitfalls to avoid

| Tempting shortcut | Consequence | Minimal correction |
| --- | --- | --- |
| `count()` over repeated fetched rows | Retries appear to be additional approvals | Exact canonical native identity after conflict handling |
| `ReplacingMergeTree` means immediate uniqueness | Background merges can leave duplicate rows | Explicit query-time semantics; no reliance on eventual merge |
| Group before resolving actor mapping | Conflicting copies can count under multiple actors | One verified mapping per identity or visible uncertainty |
| Count all `security` events or all tool tasks | DENY/ERROR and tool execution become the wrong metric | Fixed ALLOW decision unit and exact selected operation |
| Join to latest manifest without pinning | A historical case changes when allowance changes | Immutable manifest version/hash and case cutoff |
| Insert-time MV join to a changing budget | New right-side context does not revise prior aggregates | Query-time context or explicit recomputation |
| Sum minute counts for arbitrary rolling windows | Duplicate or boundary-bucket overcount | Raw exact bounded query in the minimum |
| Treat missing actor's LEFT JOIN count as zero | Unknown collection looks compliant | Completeness and mapping states separate from numeric result |
| Use unsigned subtraction for `count - allowance` | Below-budget rows can produce invalid excess semantics | Compare first; use a suitable signed numeric expression for display |
| Trust arbitrary resource/actor text in SQL or scope | Forged labels influence identity or privileged action | Bound typed query inputs; verified structured scope and manifest |
| Join one security row to several tasks | Approval count multiplies with outcome rows | Preserve one canonical decision row; separately bounded outcome view |
| A manual actor filter supplies the case | ClickHouse merely decorates a prior UI choice | Unfiltered candidate evaluation within the authorized population |

The unsigned arithmetic row is a proposed schema review requirement, not an observed defect. `uniqExact` supplies exact distinct values but uses state that grows with cardinality; retain a bounded horizon and measure memory before expanding volume. `ReplacingMergeTree` offers eventual deduplication, and incremental MV joins trigger only on source inserts. These documented behaviors support the simpler raw-query choice. [Exact aggregation](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact), [ReplacingMergeTree](https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/replacingmergetree), [incremental MVs](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view).

Keep one unchanged manifest for the live scenario. Pin it before launching the workloads and make the investigator read that version, not a mutable branch head. Changes create a new explicit evaluation context; they do not rewrite the old case or retroactively approve its activity. Before an operator applies a stale case, reconcile that the reviewed actor, scope, manifest and proposed rule still match. If any privileged action has changed, present the revised concrete action for review.

## Replay must test the analysis rather than duplicate a picture

Separate two products of evidence:

- **Native controlled case:** real collected decision IDs, mapped actors/credential, manifest allowance, contributing sessions, hosted incident, target denial and actual control outcome.
- **Labeled replay workload:** synthetic/replayed rows used for query correctness and scale measurements. These rows never inflate the native incident or stand in for real users, successful reads or discoveries.

A meaningful replay varies actor/workspace/credential/session identities; ALLOW/DENY/ERROR; selected and unrelated operations; event times including window boundaries; differing approved allowances; compliant high-volume and violating low-volume cohorts; duplicated IDs; deliberately labeled late-arrival and mapping-conflict fixtures. Preserve the cohort's expected answer and actual result. Copying one suspicious row a million times proves little: it has neither realistic identity cardinality nor varied decisions, joins and selectivity. Reusing one native ID repeatedly also must not increase the approval total.

Measure actual stored rows, distinct IDs, candidate actors, covered time, relevant-row fraction, query ID, rows read, memory and a disclosed p50/p95 sample with service/version/region and warm/cold conditions. Native case correctness and replay throughput are separate metrics. A replay performance improvement cannot establish detection accuracy or end-to-end containment latency. The aggregate must return the same semantic answer across raw and any optional optimized form. [Query receipts](https://clickhouse.com/docs/reference/system-tables/query_log).

## Gate richer outcomes on core readiness and exact correlation

After the required core loop works, investigate native `TaskTool` correlation as a scoped optional enhancement. It must prove an exact one-to-one/declared-cardinality event→tool-task mapping through authenticated native identifiers and an actually useful returned synthetic fixture, not merely task DONE, ALLOW, HTTP 2xx or response-byte count. If the response projection is absent or correlation ambiguous, retain unmatched status and the approval-decision metric unchanged; revise the diagnostic approach when new evidence supports it. No elapsed-time cap ends required project work. Missing success evidence is neither zero delivered objects nor permission to narrate theft. [Tool-task schema](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks).

Even when correlation succeeds, show it as additional outcome evidence, not a silent replacement of the declared allowance unit. The operator approved a decision budget before the scenario; replacing it with object count after seeing the result changes the policy. The fresh post-action control still needs an actual expected synthetic result to prove useful work survived, regardless of whether the wider optional outcome join succeeds.

## New features remain bounded stretches

The September 23 **26.9** announcement adds restricted expiring tokens, ordered `LIMIT AFTER/UNTIL` context and incremental append refreshes. The October 8 public stable release observation does not prove this team's Cloud service version or grants. Keep token creation as an optional bounded reader-hardening experiment after service/version proof; existing restricted users suffice. `LIMIT` can support an optional ordered incident drilldown after identity/clock correctness. `APPEND INCREMENTAL` archival is cut. None requires another deployment or changes the core analytic claim. [26.9 announcement](https://clickhouse.com/blog/clickhouse-release-26-09), [public stable tag](https://github.com/ClickHouse/ClickHouse/releases/tag/v26.9.13.15-stable).

Native ClickStack is stretch only if already configured. Its alert variables evaluate **empty**, not as selected in the dashboard. Number charts display the first numeric field, while alerts evaluate the last; use an unambiguous numeric alert result. SQL alerts support Number/Line/Stacked Bar, grouped dimensions only on time-series charts, and the smallest listed interval is one minute. A rolling allowance horizon is separate from that evaluation cadence; missed intervals can be backfilled. These rules prevent a dashboard-selection illusion or a millisecond SQL badge from becoming an instant-coverage claim. [SQL tile semantics](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations), [alert semantics](https://clickhouse.com/docs/clickstack/features/alerts).

There is no need for MCP OAuth, OTel conversion, a new collector, formulas, UDFs or a separate custom evidence API. If a native alert is unavailable, a trusted application query after confirmed ingestion is acceptable and must be labeled as application evaluation. Page-persistence lag, insert visibility, evaluation cadence, hosted investigation, approval and subsequent-call denial remain separate timings.

## Concrete simplification and the strongest remaining criticism

Use one owned GitHub integration and synthetic repository, two authenticated installed workload identities sharing one credential, one selected policy operation, one manifest version, a finite set of completed sessions and one raw exact ClickHouse evaluation. Show one case table with source links and two post-action receipts. Pass the compact saved case to a real Guild investigator with manifest-read and incident-create tools. The operator applies the proved scoped DENY. Leave replay analytics on a separate evidence tab and gate outcome correlation on actual identifiers/cardinality after core readiness. Native dashboard deployment, rollups, automatic policy editing and semantic-drift claims remain outside the required core. Pending native prerequisites do not block independent local code/UI/tests/review; individual request/test bounds trigger diagnosis rather than project termination.

The strongest criticism remains that **a modest script and a template could deliver much of this value**, and the synthetic declaration can be arranged to make a predictable counter cross. Real native evidence, a query-selected subject, differentiated approved work and genuine selective enforcement improve credibility; they do not make the algorithm innovative or guarantee a prize. The later permission decisions have already occurred by detection time, and the detector does not establish why the agent used the permission. The project is strongest as a completed, auditable operational control demonstration for ClickHouse and Guild, with clearly measured analytics and explicitly limited security claims.
