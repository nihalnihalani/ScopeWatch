# Runtime advocate: ScopeWatch

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Prepared 9 October 2026 IST. Planning and research only: no generated target, exploit, scan, benchmark, hosted agent or containment action has been exercised. Akash excluded. The debate's numerical scores and a ten-million-row floor are not official criteria and are not used here. **[V]** marks source-supported capability/fact; **[I]** marks the proposed product or planning judgment; **[G]** marks an event-time gate that remains untested.

## My concrete affirmative case

**[I] Build ScopeWatch: detect a workload exceeding its declared data-access budget across several individually authorized agent sessions, then quarantine that workload without disabling another legitimate agent.** The user is an engineering/security owner operating hosted agents with a shared integration credential. Their decision is: “Which workload should lose this credential right now, and what legitimate work will continue?”

The opening sentence is: **“Every call was authorized. Together, these sessions crossed the workload's access budget.”** This is an operation-budget violation, not proof of malicious intent or a claim that the credential itself was stolen.

Use one owned integration and synthetic private content. One published Guild workload makes a sequence of read attempts in several short sessions. A second published workload performs a legitimate approved read workflow. Both use a connected credential; neither sees the long-lived service secret. The application maintains a server-owned workload manifest with an explicit rolling budget and authorized bulk-export exceptions. **For a successful-read budget, ClickHouse must aggregate correlated actual delivery receipts from the owned service, not native ALLOW decisions alone.** Guild security events add permission-decision/credential/task evidence. When verified successful-read receipts cross the declared budget, it opens an investigation. A Guild-hosted investigator gathers the relevant manifest/context and creates a useful incident record in an owned operations repository. The human then approves a workload-scoped Guild policy DENY. Repeat the calls: the contained workload is denied, while the other agent still completes its legitimate read. None of these event-time gates has been exercised.

This is materially different from BoundaryProof, Code Vaccine or ToolTrust. It does not discover or repair a source vulnerability. It detects and scopes **runtime behavior that a per-call permission grant allows**, and its output is a containment decision with a demonstrated residual-access check. Semgrep is absent from the core. A real qualifying incidental finding can be submitted if one arises, but I would not spend the build engineering a defect to manufacture that eligibility.

## Why the predicate is defensible

**[I] The predicate is compliance with a declared operational security limit**, not “unusual = malicious.” A workload may be permitted to read a resource in isolation while being restricted to a defined volume over a rolling interval. The user sets that limit in the manifest before replay. The manifest identifies the workload, credential/integration, relevant read operations, interval, budget and any preapproved bulk-export allowance. It is controlled by the operator, not by the model's prompt or an agent-supplied `purpose` string.

For the demo, a threshold such as 20 successful read responses in five minutes is an **example configured lab budget**, not a recommended universal production threshold. Five sessions of eight independently confirmed successful responses each are sufficient to demonstrate why session-by-session inspection misses the combined violation. The count is successful read responses, not necessarily distinct documents or bytes exfiltrated. If object/byte fields are not independently available, do not display them.

The trusted platform facts are the security decision, operation, credential and task IDs. **ALLOW establishes permission to attempt an operation, not its successful completion, returned objects or bytes.** Bind tasks/sessions to workload identity using authenticated Guild metadata and the server's own record of which installed agent it launched. Do not trust a tool payload's `agent_id`, tenant or credential label as identity. Deduplicate platform events by native event ID and delivery observations by service-owned receipt ID; replayed duplicates must not create a fresh alert. An approved high-volume workflow must remain below its **own configured allowance**, even if its raw volume exceeds the contained workload's. This is a meaningful negative control.

**[G] Smallest complete successful-delivery receipt:** an append-only observation from the owned service with receipt/request ID, server-observed operation, authenticated integration principal, successful/failed status, served-at time and the actual returned synthetic object IDs or hashes if those are counted. It must bind to the controller-created run and actual Guild session/workload through an authenticated correlation mechanism. A client-supplied run label or an agent's self-report is insufficient. Preserve the mapping and exclude unmatched/ambiguous records. A signed service receipt proves the service observation, not the Guild identity binding by itself. The team's first event-time integration test must establish both. The exact correlation mechanism and delivery collection have **not** been implemented or verified.

**[V]** Guild's current public event schema provides `EventSecurity` with `decision` (ALLOW/DENY/ERROR), `operation`, `reason_code`, `capability`, `credentials_id` and `task_id`; structured `details` are optional. This is stronger source material than agent-authored telemetry. [Fetch session events](https://docs.guild.ai/api-reference/sessions/fetch-session-events).

**[V] Critical latency limit:** the same documentation explicitly says events persist when an agent turn completes, not while model output streams. Therefore this MVP must use bounded short turns and detect **between completed turns/runs**. Do not claim immediate in-turn streaming prevention or say the first excess read was prevented. Ingestion delay must include this platform persistence delay. Polling requires `workspaces:read` plus `agents:read`, defaults to newest-first and 20 items, and should use the exclusive `from_id` cursor. Missing `agents:read` currently causes a documented 500.

**[G]** The first build test must confirm that the actual event account returns ALLOW and DENY security events for the chosen operation, enough authenticated metadata to map task/session to workload, and independently correlated owned-service successful-delivery receipts. The documentation describes a schema; it does not prove every desired record is populated for our integration. No such account-level test has been performed. If only native events work, the honest narrower product counts **permission decisions/allowed attempts**, not successful reads or a data drain; that is a weaker demonstration and cannot claim the main successful-read-budget promise.

## What ClickHouse actually decides

**[I]** The query resolves a real uncertainty: “Is this a few independent successful reads, or a cumulative budget breach by the same workload/credential across sessions?” It groups unique authenticated successful-delivery receipts by workload and credential over the rolling interval, applies the manifest's allowance, and returns contributing session IDs. This changes the application's state from normal monitoring to a specific investigation/containment candidate. Native DENY events after the approved policy change prove the platform refused subsequent requests; owned-service observations confirm whether any content was nonetheless served. A native-only variant can resolve the cumulative permission-decision count, but not successful delivery.

The minimum useful live dataset is a few sessions from two workloads, one declared budget breach and one legitimate high-volume control. That proves the analytical contract. A separate, explicitly labelled replay corpus can exercise scale: varied workload IDs, credentials, sessions, operations, permission decisions, time ranges, allowance classes and duplicate/late events. A target near one million stored rows is optional; it is neither a real customer fleet nor an official minimum. A large table of cloned rows adds little evidence.

Measure total stored rows, the actual query's rows read, SQL p50/p95 over a stated sample, ingestion/persistence lag, alert-to-hosted-investigation time and containment-to-first-observed-denial time separately. Show both all-session contributing evidence and the narrower contained actor. Record the workload that remained functional. No number in this brief is a measured project benchmark.

Plain ClickHouse MergeTree/client ingestion is enough. If useful, incremental rollups can summarize minute-level activity, but budget/identity changes must not be assumed to retroactively update an incremental MV join. Apply changing manifest context at query time. [Incremental MV semantics](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view).

## Why Guild is necessary here, and why an investigator is useful

**[V]** Guild provides hosted execution, server-held integration credentials and proxy-enforced policies scoped by operation, resource, agent and workspace. DENY takes precedence. New credentials initially have an unscoped allow-all policy; adding a scoped ALLOW alone does not remove that fallback. [Security architecture](https://docs.guild.ai/platform/security-architecture), [credential policies](https://docs.guild.ai/platform/credential-policies).

**[I]** The workload under observation cannot edit the external manifest, ClickHouse history, investigator or containment controller. The investigator has only bounded evidence access and the read/create operations required for the owned incident record. It cannot change policies, reconnect credentials, merge code or disable arbitrary agents. The containment credential stays in the human-controlled application/controller.

The LLM is not needed to perform the count, and I do not pretend otherwise. Its useful role is to read the workload's trusted manifest/context, assemble the contributing sessions and current evidence into a concise investigation record, distinguish an explicitly approved bulk job from an unapproved budget crossing, and propose the narrow scope that the operator should review. It must cite the case/query/session evidence. The actual predicate remains deterministic; the model cannot override the budget or approve itself.

A practical hosted action is **creating a reviewable incident issue in the owned operations repository**, with contributing sessions, the configured limit, observed count, uncertainty and proposed containment scope. That is a real system-of-record write through a Guild-held credential, not an explanation printed by the local app. If custom evidence tools are too slow to provision, pass the bounded actual query result to the agent and let its existing GitHub tools fetch the manifest and create the record. Exact supported tool names/grants must be selected from the installed integration, not guessed.

This is still a modest agent workflow; it is not “autonomous incident response.” But the same platform both produces the workload evidence and enforces the containment boundary, which makes its hosting/governance role load-bearing rather than a late audit-sink label.

## Containment: what is documented versus what must work

**[V]** Agent/workspace/resource-scoped policies and `guild credentials policy create` are documented. A matching DENY wins over ALLOW. Use a human-approved DENY targeting only the suspicious workload's relevant integration/read operations, then verify real subsequent denials. A second agent using the same credential should retain its allowed operation. This is the strongest proposed path. [Credential policies](https://docs.guild.ai/platform/credential-policies).

**[V]** A public DELETE credential-association endpoint exists and requires `integrations:write`; it distinguishes GRANTED (an existing credential shared with an agent) from CONNECTED (created for the agent). Deleting a CONNECTED association can delete the credential itself. The docs also describe account-wide ownership without an association row. Therefore **disconnecting a row must not be assumed equivalent to effective selective revocation**. Prefer an explicit scoped policy denial and verify its effect. [Disconnect credential association](https://docs.guild.ai/api-reference/workspaces/disconnect-a-credential-association-from-a-workspace-agent).

**[G]** No policy change, SDK run, event stream or containment action has been exercised. “Documented” is all the current evidence establishes. Within the first 45 minutes of the event, the Guild lane must produce: one hosted read, one observed native security event, an approved scoped denial, a denied repeat call, and another workload's successful allowed call. If it cannot, the affirmative case loses its strongest sponsor story. Ask the sponsor mentor once, simplify, and do not substitute a local flag labelled “Guild revoked.”

A global credential revoke is a broader fallback with an availability cost, not equivalent proof of selective containment. If only that works, label it and show the legitimate workload interruption. A mere drafted containment recommendation is weaker still. Neither should be presented as having completed the main promise.

## Why this theme is credible, and why it is not novel

**[V]** OWASP's 14 April 2026 exploit roundup identifies tool misuse and service-agent identity/privilege abuse and recommends scoping identities, isolating execution and policy-based validation. It is primary OWASP synthesis of externally reported cases, not our independent validation of those incidents. [OWASP roundup](https://genai.owasp.org/2026/04/14/owasp-genai-exploit-round-up-report-q1-2026/).

**[V]** NVIDIA's 28 September Open Agent Safety Platform combines OpenShell, independent software/hardware monitoring, credential/tool policy and behavior-drift analysis. “Out-of-band agent safety/containment” is existing territory. [NVIDIA reference architecture](https://developer.nvidia.com/blog/nvidia-open-agent-safety-platform-a-reference-for-continuous-in-silicon-agent-monitoring).

**[V]** WorkOS's 30 September checklist explicitly calls for per-agent/session/tool/tenant budgets, circuit breakers, spikes in denied calls and sudden jumps in data-read volume; it also discusses cascading revocation across chained agents. This is close prior art. [WorkOS checklist](https://workos.com/blog/ai-agent-permissions-checklist).

**[V]** ClickStack already supplies LLM traces, release markers, emerging-pattern comparisons and alerts; Guild already has governance and a software factory. Our previous six-product comparison established no market-novelty proof. [ClickStack September update](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026), [competition audit](../competition-and-eligibility.md).

**[I]** The small demonstration can still be useful: explicitly identify the cross-session workload/credential budget breach, produce a real investigation and show selective residual access. It is an implementation of a concrete safety control, not a new science or a claim that other platforms lack it. Innovation-prize strength remains uncertain and likely depends on execution and the exact case.

## Cash-like opportunity and authentic-finding risk

**[V, supplied packet]** ClickHouse and Guild each have a $1,000 top monetary award. Their combined top outcome is **$2,000 cash/gift-card face value if stacking is permitted**, plus ClickHouse credits. Pi adds unspecified gift-card/hardware value. This is a conditional ceiling, not expected payout or a win-probability forecast. Payout methods and stacking remain unresolved.

**[I]** ScopeWatch gives up a mandatory Semgrep track in exchange for avoiding a required authentic-source-finding discovery. That is a genuine tradeoff, not proof of better expected winnings. The analytics dataset and runnable governance proof are its own unclosed gates. Source findings, load-test scale and hosted execution must all be honest in any track.

**[I]** Semgrep can scan our own project for quality during the event, but an intentionally seeded drain workload or declared configuration budget is not automatically a unique issue discovered in AI-generated code. If a real eligible incidental code issue arises, preserve and submit it honestly; do not redesign the product to force a third logo.

## Five-hour contract, with explicit cuts

| PT | Milestone | Gate/cut |
|---|---|---|
| 11:30–12:15 | Confirm current rules; publish minimal workloads/investigator; prove correlated successful-delivery receipt → scoped DENY → blocked repeat + legitimate-agent success; analytics lane defines event/receipt/manifest contract | No stable delivery identity or genuine containment proof: abandon the main promise, not just its error message |
| 12:15–1:15 | Replay bounded short sessions, ingest native events, detect across-session breach; hosted investigator creates actual case record | The complete query → hosted action → human containment loop should exist by 1:15–1:30 |
| 1:15–2:00 | Case UI, negative approved-volume control, duplicate/late-event checks and real evidence links | Cut any second integration/service and elaborate policy optimizer |
| 2:00–2:45 | Meaningful labelled replay scale, actual timings, blocked/continued-call receipt | Freeze the product path; do not chase a row-count floor |
| 2:45–4:00 | Rehearse; record/upload a short truthful demo; prepare sponsor evidence dossier | No new features; honestly recorded successful hosted runs may be shown |
| 4:00–4:30 | Check repository/video access; submit tools/build description and names/emails | Preserve submission margin |

The phases total **300 minutes**. Four lanes: Guild/integration proof; event ingestion/query; workload/manifest/replay controls; UI/demo. Two people should keep one integration and one investigator. No untrusted document attack needs to reliably persuade a model on stage: the violating workload is a disclosed deterministic lab scenario, while the detector/hosted action/policy enforcement remain real.

**One deliberate cut:** remove automatic policy mutation by an LLM. The human approves a precise containment scope; the operator applies it through the documented platform path. This saves risk and prevents the investigator from governing itself. Do not build a general agent sandbox or a policy-generation engine.

## Round 2: answering A, C and the independent judge

**Concession to Code Vaccine (A):** if an ordinary event-generated program yields a genuinely interesting Guardian-supported authorization finding with a real protected-data consequence, its Semgrep eligibility is stronger than anything ScopeWatch currently has, and its conditional monetary ceiling can be higher. Published JWT rules still do not make that finding exist, and a familiar configuration flag without meaningful impact may be a weak finding entry. The frozen authorization contract and disclosed future bad-change gate are coherent, but the recurrence/CI story adds scope. ScopeWatch's advantage is a fixed runtime user job that survives absence of a source defect.

**Concession to ToolTrust (C):** an actual generated connector sending sensitive synthetic data beyond its approved recipient has the clearest business consequence of the three. If the actual stock CLI result and owned-lab consequence appear early and the sponsor accepts that route, I would choose that real case over defending a routine budget alarm. The published SSRF rule alone does not establish a redirect/destination-transition issue; no such finding or consequence exists yet. Its ClickHouse prioritization also risks expanding a one-connector release decision into an invented fleet.

**Answer to the judge's runtime challenge:** the complete trusted relationship requires independently observed successful delivery, authenticated correlation to platform workload identity, and a server-owned predeclared budget. Native ALLOW decisions alone do not close that obligation. The smallest meaningful data is several sessions plus a legitimate high-volume control, not millions of discoveries. The query changes which workload receives an investigation and containment proposal. The hosted agent reads context and creates an actual reviewable incident record through a scoped platform-held credential. The count does not need an LLM; the context/record/action benefits from a hosted agent and separated credentials. It is distinct from commercial authorization testing because it aggregates activity across completed hosted sessions and scopes credential containment, but the underlying control is established practice.

**My ranked planning judgment, with no odds:**

1. **ScopeWatch** as the current no-finding product commitment, conditional on its first-45-minute authenticated delivery-receipt/native-event/selective-DENY proof. Its user and core contract do not change if generation/scan discovery fails, but receipt correlation is a real additional dependency; a native-only budget notification does not satisfy the main promise.
2. **ToolTrust** as the best alternative if a genuine, meaningful connector finding/recipient consequence materializes early; in that state it moves above ScopeWatch.
3. **Code Vaccine** if its actual Guardian finding and protected-data consequence are stronger than the connector case or runtime proof. Prefer it over a hypothetical connector flaw, but cut recurrence extras until the first outcome is complete.

This ranking reflects scope and the current absence of findings, not market novelty, official scoring or monetary expectation. If ScopeWatch cannot exercise selective enforcement promptly while A/C has a real qualifying case, that evidence overrides the advocacy. The choice must follow the completed product proof rather than protect a prior recommendation.

## Research evidence and unresolved items

New primary captures: `.firecrawl/runtime-guild-events.md`, `runtime-guild-disconnect.md`, `runtime-owasp-q1.md`, `runtime-nvidia-open-safety.md`, `runtime-workos-permissions.md`; supporting search `.firecrawl/runtime-owasp-search.json` with feedback sent. Reused primary Guild/ClickHouse captures and historical corrections are inventoried in [clickhouse-guild.md](../clickhouse-guild.md) and [competition-and-eligibility.md](../competition-and-eligibility.md). Read the independent preliminary critique and ToolTrust advocacy before this rebuttal.

Unresolved: event account permissions; actual native-event population and identity binding; independently authenticated successful-delivery receipt collection/correlation; actual policy-edit effect and latency; rate limits; row diversity/timings; current stacking, sponsor opt-in and exact demo duration. **The delivery objection weakens my feasibility advantage: this is not just a native-event query and must not be marketed as one.** If A/C produces a genuine eligible consequence while receipt/containment work remains unproven, choose that completed evidence over this advocacy. No broad collection or implementation remains in this research assignment. I remain available for a focused rebuttal.
