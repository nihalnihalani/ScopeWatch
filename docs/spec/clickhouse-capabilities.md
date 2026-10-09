> Advisory research snapshot. For current native authority, event attribution, window boundaries and recovery semantics follow [the corrected architecture](../architecture/ARCHITECTURE.md) and its contracts. Fixture alternatives below are not simultaneous build requirements.

# ScopeWatch: ClickHouse capability expansion and analytical decision

Research-only decision, 9 October 2026. One project, up to four people, 11:30–4:30 PT; Akash excluded. No application, hosted run, SQL benchmark, alert or containment test was performed. The exact Guild event fields and enforceable scope remain account-proof gates. Source corpus: [ClickHouse KB](../../references/scopewatch-kb/clickhouse/index.md), eleven first-party pages with [manifest](../../references/scopewatch-kb/clickhouse/sources.json).

## Recommendation

Keep ScopeWatch, but make ClickHouse answer an **evidence-backed scope decision**, not merely display a quota gauge:

> Which authenticated workload exceeded its own predeclared permission-use allowance across completed sessions, which native decisions establish that conclusion, and what agent/operation restriction preserves the other workload's approved work?

The mandatory analytic output is one case containing workload binding, manifest version, explicit window and clock, exact counted native unit, allowance, contributing sessions, collection completeness and narrow proposed scope. The outcome is then a real Guild investigation and operator-approved subsequent-call DENY. A bigger chart stack cannot substitute for those facts.

The added capability worth prioritizing is **exact identity aggregation plus versioned context and query receipts**. Native ClickStack SQL alerts, dashboard variables and investigation tools are useful extensions when the team already has a working deployment. The genuinely new September 23 `CREATE TOKEN` is an attractive optional security improvement for bounded database reads. October 5 UDFs and preview PromQL add unnecessary integration work here.

## A detailed operator story

An operations lead has a support workload and an approved maintenance workload sharing a repository integration credential. The lead declared different budgets because they do different jobs. A support workload repeatedly opens short sessions: each session looks ordinary, but together its permission decisions exceed its assigned allowance. Maintenance emits much more activity, yet remains inside its higher approved allowance. There need be no proven attacker: a runaway agent or misconfigured task is a sufficient operational problem.

For a **planned fixture**, five support sessions could produce six counted native ALLOW units each, against twenty over a declared fifteen-minute window; maintenance could have 120 against an approved 200. These are illustrative counts, not observed events, production thresholds or a claimed mapping from one ALLOW to one file read. The account proof must determine whether the selected native event represents one decision or contains separately countable decisions. Use the established unit consistently.

ClickHouse computes both workloads from the same collected evidence and joins the proper declared allowance. The operator opens the case: it names the support workload, shows all five native session links, preserves the policy version and identifies the relevant operation family. The maintenance row makes the reason for differentiated treatment visible. Replaying the same native IDs changes neither case count nor conclusion. An ALLOW with a failed tool result remains a permission approval and is not relabeled successful delivery.

A real Guild-hosted investigator reads the manifest and bounded evidence, explains the policy violation and creates an incident in the owned operations repository. The operator approves a DENY at the narrow scope actually supported by Guild. A later target operation produces native denial; maintenance performs its expected action successfully. ClickHouse then associates the case with the investigation/session and verification receipts. This closes the lab case while keeping the pre-action ALLOW history visible.

This story is richer than an ordinary rate limiter because the analytical unit crosses sessions, the threshold expresses declared workload intent, the evidence is native and deduplicated, the conclusion names an attributable scope, and the response preserves shared-credential work. These are product and evidence distinctions, not a claim that rolling counters are novel algorithms. The decisive stage moment is **“This much busier workload is approved; this smaller workload exceeded its owner's allowance; contain only the latter.”**

## What ClickHouse should calculate

| Output | Meaning and decision value | Required proof |
| --- | --- | --- |
| Permission-use total | Exact unique native ALLOW units for one selected operation family over an explicit window | Native identity key; established unit; complete covered sessions |
| Allowance and excess | Count minus the manifest's approved allowance; optionally count/allowance when allowance is positive | Manifest declared before the scenario, version fixed in case |
| Contributing sessions | The set and per-session contribution explaining the total | Native session URLs and authenticated workload binding |
| Control workload | Its own count and allowance over comparable coverage | Same integration credential; its own manifest; actual successful post-action result |
| Scope proposal | Workload plus the narrow operation/resource dimension proven available | Native operation mapping and Guild enforcement proof |
| Case receipt | Query ID, evaluated cutoff/window, source IDs, manifest version and uncertainty | Durable case record; no manual actor selection in the UI |
| Closure receipt | Target denial and legitimate control outcome after approved policy change | Native denial event plus independently checked successful control result |

Operation or resource diversity and newly observed scope are **stretch explanation fields only**, conditional on stable native fields. They can help an investigator describe where the excess concentrated, but a new resource is not automatically forbidden. Do not add an opaque anomaly score, guessed data sensitivity or “exfiltration probability” to make a deterministic intent violation sound like threat attribution.

An exact distinct aggregate can count composite native identities; `uniqExact` explicitly supports multiple arguments and returns an exact result, at the cost of memory that grows with cardinality. Use a stable key established from native metadata, potentially including workspace/session/decision identity, and bound the time and actor scope. Conflicting versions of the same identity must be flagged rather than letting two different payloads silently coexist. This design is proposed; no query was executed. [Exact aggregation docs](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact).

Freeze each case's manifest context. A later allowance change can produce a new evaluation; it must not silently rewrite the old case. Decide explicitly whether the approved allowance is evaluated as of the case cutoff or per event's effective policy. The five-hour slice should use one unchanged manifest per scenario and retain its version. This avoids pretending a complicated historical policy interpretation has already been solved.

Plain MergeTree plus a bounded exact query is sufficient initially. Background `ReplacingMergeTree` merges do not guarantee immediate deduplication; `count()` on it can overcount before merges. Query-time `FINAL` provides its dedup semantics, while exact native identity aggregation can preserve the count on immutable raw evidence. Do not treat an `ORDER BY` key as transactional uniqueness. [ReplacingMergeTree docs](https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/replacingmergetree).

Only add minute rollups after raw-query correctness exists. A rollup of ordinary counts will count retries twice, and summing overlapping time buckets does not establish an exact rolling window. Distinct aggregate state or correctly deduplicated source facts would be needed, with exact boundary treatment. Keep changing budget context at query time: an incremental MV triggers from its left-most source inserts, so updates to a manifest on the right side of a join do not rewrite prior rollups. [Incremental MV docs](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view).

## Actual recent releases, separated from current documentation

The requested window is 9 September–9 October 2026. These are relevant **dated announcements** located in that window, rather than current docs mistaken for launches.

| Date | Capability and actual status | ScopeWatch value | Choice |
| --- | --- | --- | --- |
| **16 September**; article edition “Aug '26,” v2.34–v2.38 | Dashboard variables GA, dependent filters; formulas and formula alerts; release markers; alert evaluation history/richer webhook fields | A reusable actor→operation→case drilldown, explicit excess/allowance views and evidence of failed evaluations | Stretch if ClickStack already works |
| **16 September** | New `clickstack_emerging_signals` and `clickstack_query_tiles`; read/write tool annotations | Assist investigation of changing log patterns and validate dashboard tiles; tool annotations help clients gate writes | Stretch; no authority to decide violation |
| **16 September** | LLM observability **beta**; TimeSeries/PromQL **private preview** in managed service, experimental OSS; standalone collector OIDC | LLM context optional; PromQL unnecessary; OIDC only relevant to a chosen standalone collector | Cut from mandatory slice |
| **23 September**, ClickHouse **26.9** | `CREATE TOKEN`: time-limited credential restricted to a subset of existing user grants; default lifetime 30 minutes if omitted | Timebox SELECT-only evidence access without exposing a principal's main password | Stretch after version/access proof |
| **23 September**, **26.9** | `LIMIT AFTER`/`UNTIL`, with `ALL`, select bounded ordered sequences around conditions | Optional drilldown after budget crossing and before a denial, after dedup/window calculation | Stretch; ordinary SQL can provide equivalent product evidence |
| **23 September**, **26.9** | `APPEND INCREMENTAL` scheduled refreshable MVs; external-memory `DISTINCT` | Event archival/large exact dedup workflows later | Cut from five hours |
| **5 October** | Executable UDFs GA in Cloud across AWS/GCP/Azure; compiled Native runtimes, memory/deterministic controls, lifecycle APIs | Custom parsers/evaluators when SQL is insufficient | Cut for this scenario |

[September ClickStack release](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026), [26.9 release](https://clickhouse.com/blog/clickhouse-release-26-09), [October UDF announcement](https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud).

Deployment qualifications matter. The 26.9 announcement demonstrates the token and query features; it does not prove the team's selected Cloud service runs that version or grants token creation. The root researcher's Alexandria GitHub releases provider returned stable tag `v26.9.13.15-stable`, published October 8, as the newest record on its first thirty-release page. That is an observation of public release availability, not Cloud rollout or an inspected running service. Before adopting 26.9-only syntax, the team must inspect its actual service version and prove the intended statement/grant in the event account; fall back to existing restricted users and ordinary bounded SQL when unavailable. [Primary release](https://github.com/ClickHouse/ClickHouse/releases/tag/v26.9.13.15-stable), [saved provider response](../../references/releases/clickhouse-releases-page1.json).

A token never adds privileges beyond its user. `LIMIT AFTER` is inclusive and `UNTIL` exclusive; choosing an ordered sequence and correct tie-breaker remains the application's responsibility. Neither new syntax nor an append cursor produces a security verdict by itself. [26.9 announcement](https://clickhouse.com/blog/clickhouse-release-26-09).

The UDF headline mentions network access, but the detailed article says **outbound network is Python-only today; Native is compute-only**. It also says the first UDF attachment adds a helper container and causes a rolling restart, and every row crosses a serialized process boundary. Those costs are unjustified for permission aggregation SQL already expresses. Native-runtime network and UDF secrets are listed as future work, not existing functionality. [UDF announcement](https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud).

The ClickStack vendor's emerging-pattern evaluation found a planted pattern in 8/10 runs versus 0/10 without the tool. That is a vendor observability task result, **not** ScopeWatch detection accuracy, a security benchmark or proof that the investigator can identify attacks. Likewise the article's 17-tile validation is an example, not our measured outcome. [ClickStack release](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026).

## Current ClickStack features that can materially enrich the product

Raw SQL tiles can join the native event table, manifest context and case receipts rather than forcing the product into log search alone. They integrate with time ranges and variables, execute a single readonly SELECT, and can render the contributing-session table beside the actor chart. That makes the database's explanation visible instead of placing a logo next to a prechosen offender. These are current documented capabilities; the SQL page is marked last modified August 28, not a new October release. [SQL visualizations](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations).

Variables should narrow the investigator's view, never establish authorization. Alerts evaluate variable inputs in **empty state**, regardless of the viewer's current dashboard selection. A visible support-only filter therefore cannot be the mechanism that makes the alert target only support. Keep allowed actors, manifest version and operation scope explicit in durable data/SQL. The docs also say Number charts display the **first** numeric result column whereas alerting evaluates the **last** numeric column: return one unambiguous numeric value for a Number alert, or use a separate display query. [SQL tile semantics](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations), [alert result semantics](https://clickhouse.com/docs/clickstack/features/alerts).

Native SQL alerts support Line, Stacked Bar and Number; Table/Pie/Heatmap are not alert types. Grouped alerts are available for time-series charts. The smallest listed evaluation interval is **one minute**. That schedule is separate from the declared budget horizon. A fifteen-minute allowance evaluated every minute needs the intended fifteen-minute evidence in its SQL, not merely the current one-minute bucket. After skipped evaluations, the following range can include missed intervals. Never label an error or a missing evaluation a compliant zero. [Alert docs](https://clickhouse.com/docs/clickstack/features/alerts).

The September release adds evaluation history with query duration, errors and notification failures, and a stable `alertId` plus observed value/time-range fields for downstream routing. A case identity needs actor, manifest/window context as well as alert identity; one rule can yield repeated notifications or multiple groups. Current generic-webhook docs still list the older title/body/link templates, so confirm the selected deployment's payload rather than assuming the broader release fields are present. A controller must re-read the evidence before starting a case; a webhook is a trigger, not trusted proof or permission to apply a DENY. [Release note](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026), [current alert docs](https://clickhouse.com/docs/clickstack/features/alerts).

MCP offers native investigation and dashboard tools, but introduces a real auth boundary. **Cloud ClickStack** uses OAuth at `https://mcp.clickhouse.cloud/clickstack`; API-key authentication is unsupported there. **OSS/BYOC** uses Streamable HTTP with a Personal API Access Key, which differs from the ingestion key. Cloud service selection uses `x-service-id`; omission can choose the account's first used ClickStack service. Current docs mention a 600-request/minute per-user MCP limit. None of this proves Guild's hosted runtime can complete the chosen OAuth/client flow. Keep the core investigator on a bounded aggregate input and existing repository tools. [MCP docs](https://clickhouse.com/docs/clickstack/mcp).

Read/write annotations are useful metadata, not an authorization system. An investigator should not receive alert/dashboard editing power or arbitrary SQL simply because a server contains useful read tools. The native log-pattern tool is an optional explanation aid; the deterministic manifest/count query remains the authority for this declared-policy case.

## Ingestion, timing and measurement budget

Use one trusted collector, batch completed-turn event pages and confirm successful insertion before declaring coverage. Async inserts buffer data until a flush; buffered rows are not queryable. If async mode is chosen, `wait_for_async_insert=1` returns success after flush and propagates errors. Fire-and-forget acknowledgement is inadequate for a case claiming complete evidence. Current docs describe adaptive timeouts and a Cloud maximum default of roughly one second; these are configuration defaults, not an observed project latency guarantee. Block/query deduplication on retries also does not replace native identity deduplication across differently shaped overlapping fetches. [Async insert docs](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts).

The latency chain has separate observables: native event occurrence if available; completed-turn persistence; collector first observation; acknowledged/queryable insert; evaluation completion; hosted investigation; approval; policy change; subsequent denial. If native occurrence time is unavailable, measure from collector observation and label it. SQL milliseconds do not erase Guild's post-turn delay, polling, a one-minute native alert schedule, model time or human approval. A minimum design may use a bounded controller query after ingestion; call that an application evaluation, not a native ClickStack alert.

Preserve actual query IDs. `system.query_log` includes duration, rows read, errors and memory usage; successful queries have both start and finish rows. Filter the intended `QueryFinish` records and initial query IDs so child processing is not counted as extra benchmark samples. Cloud system logs are local per node; a complete view uses `clusterAllReplicas`. Query logs record execution metadata, not result rows, so the case must separately save its selected evidence/output. [Query log docs](https://clickhouse.com/docs/reference/system-tables/query_log).

These are **proposed measurement targets**, all currently unmeasured:

| Proposed metric | Honest definition |
| --- | --- |
| Native count correctness | Expected unique native units and contributing sessions on controlled fixtures, including repeated IDs |
| Investigation precision | Target actor/scope matches the declared scenario; control workload remains compliant |
| Query p50/p95 | A disclosed bounded sample, actual rows read/memory, region/service/version and warm/cold conditions |
| Coverage/freshness | Sessions expected versus fully fetched; collector lag and queryable-insert lag separately |
| Response latency | Evaluation→investigation issue→approved policy→observed subsequent denial, separate stages |
| Containment correctness | Native target denial plus successful approved control outcome after policy application |
| Replay scale | Actual synthetic/replayed row count and query behavior; never counted as real customer activity |

No latency SLA, cost saving, false-positive rate or security detection percentage is established. Roughly one million diverse replay rows are an optional scale demonstration after the working native loop, not a sponsor requirement. Do not claim the documentation's billion-row/MV benchmarks as our performance. Bounded exact queries may consume meaningful memory; increase replay volume only while query measurements and submission time remain under control.

## Essential, stretch and cut within five hours

| Essential | Stretch only after a complete loop | Cut |
| --- | --- | --- |
| Exact native-unit aggregate across sessions and own declared allowances | Existing ClickStack SQL dashboard with actor/operation drilldown | New multi-component observability deployment |
| Versioned manifest/window/clock and contributing-source links | Native one-minute SQL alert and evaluation-history receipt | PromQL/TimeSeries preview |
| Real native target/control, duplicate and outcome controls | 26.9 time-limited SELECT token for an optional evidence reader | UDF deployment, custom LLM evaluator, outbound SQL network calls |
| Real Guild investigator and operator-approved selective DENY | `LIMIT AFTER/UNTIL` incident-context drilldown | Arbitrary agent SQL or dashboard/policy administration |
| Real query and action receipts; visible incomplete collection | Correct distinct-state rollup with raw-query equality check | Automatic denial based solely on volume/anomaly/model judgment |
| One coherent screen and accessible recorded proof | Emerging-signal investigation on actual additional logs | Multi-integration/multi-agent swarm, lake export |

With four people, one owner handles native Guild/enforcement, one collection/SQL, one scenario/manifest/Semgrep provenance, and one product/evidence/submission. ClickHouse's lane should prove insertion and raw exact evaluation in the first forty-five minutes alongside the Guild kill gate. By 1:30 PT there should be one complete evidence→investigation→approved action loop. By 2:30 freeze scope; finish verification, recording and submission with the final thirty-minute margin. With two people, remove native alerts/MCP/rollups and preserve raw aggregation plus the real hosted enforcement story.

These time boxes are a proposed work allocation, not completed milestones. Use limited query and SELECT grants for evidence readers even if the new token feature is unavailable. No new sponsor account, collector deployment, OAuth integration or UDF lifecycle should be discovered in the final hour.

## Scenario debate and three adversarial questions

**1. “Isn't this just a quota counter? A script or PostgreSQL could do it.”** Yes, the minimal math is simple. ClickHouse earns its place when the same query resolves attribution across many sessions/credentials, deduplicates native units, joins declared intent, exposes contributing evidence and measures behavior over diverse replay volume. Those requirements do not make ClickHouse uniquely necessary. The reason to choose it is the sponsor's real analytics role and available performance/evidence surface. If the UI hardcodes the actor and the database stores ten decorative rows, this objection wins.

**2. “Your ALLOW event does not establish successful access, and detection is after the turn.”** Correct. The declared contract is an approval-event budget, and a breach is an investigation trigger, not proof of theft or malicious intent. Retain the failed-outcome control and the completed-turn timeline. ScopeWatch limits subsequent operations; it cannot honestly promise preemptive denial of an excess operation inside that same already-completed turn. A future successful-delivery budget would need independently linked receipts and a newly defined unit.

**3. “Your shared credential, duplicate/late events and dashboard settings could target the wrong agent.”** This is the principal correctness risk. Bind workload through authenticated native metadata and launch records, preserve manifest version and coverage, deduplicate native identity, treat conflicting/unknown records as uncertainty, and keep display variables out of authorization SQL. Require real agent-specific denial and successful control. If native fields cannot bind the actor or Guild cannot enforce the proved scope, submit the monitoring/review limitation explicitly; neither a local pause nor a globally revoked credential completes this story.

The strongest alternative is a full ClickStack “AI SOC” with emerging signals and automatic response. It looks broader but introduces logs/OTel schema, collector/auth, dashboard, alert cadence, OAuth and model ambiguity before the essential Guild evidence/action proof. Adopt native ClickStack only where existing setup makes it nearly free; do not trade the measurable selective-control outcome for a half-integrated observability tour.

## Evidence inventory and research limits

C01–C11 are listed in the KB with URLs, publication dates where established, raw capture paths, hashes and Firecrawl metadata. Relevant new dated evidence is September 16, September 23 and October 5. Current docs are separately labeled and are not called newly launched features. Cached August/UDF/MV pages were inspected and copied without refetching or modifying originals. New map/search results are retained; one stale guessed `uniqExact` URL returned 404 and was replaced through mapped discovery.

No claims here establish prize stacking, deployed versions, native field mapping, live collection completeness, exact operation units, working OAuth, hosted investigation or real selective containment. Those are explicit gates for the eventual event build. The recommendation is to deepen ScopeWatch's provenance, analytical explanation and measured control outcome while keeping the same two-sponsor core.
