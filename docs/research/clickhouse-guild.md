# ClickHouse + Guild.ai: prize strategy for Cyberdefense, 9 October 2026

**October 9 expansion correction:** a Guild API-trigger key is issued for one trigger, but the same documentation describes access to sessions throughout that workspace and optional routing to another installed agent. Earlier trigger-scoping shorthand must not be read as investigator-only effective privilege. See [the corrected Guild audit](../spec/guild-capabilities.md) and [master specification](../spec/MASTER_SPEC.md). No account-level behavior has been tested.

Checked 9 October 2026 IST. Research uses Firecrawl CLI v1.23.3, official current documentation and product announcements, and this repository's 7–8 October winner/code forensics. Akash excluded. This is a strategy recommendation, not an implementation or a claim of prize eligibility.

## Decision

Make ClickHouse produce the evidence that a specific vulnerability caused a real security failure, and make Guild hold the credentials and run the bounded response. The strongest combined story is **finding → observed exploitation → impact count → approved repair → regression replay proves closure**. A generic security chatbot or a scanner whose results are merely logged in ClickHouse leaves both sponsors peripheral.

For a cross-tenant RAG cache vulnerability, show tenant A receiving a tenant B canary document after a shared cache hit. An instrumented application emits the request's authenticated tenant and the returned document's true owner into ClickHouse. The detection is a deterministic mismatch; the LLM summarizes and proposes a patch. Guild's investigator cannot write; a separate remediator can create a branch/PR or file an issue for this one demo repository after approval. The patch includes tenant identity in the cache key and verifies ownership on cache hits. Replay both the violating case and legitimate cache hits after the change. This preserves ClickHouse analytics, Guild agent hosting/governance, and the broader Semgrep finding story without needing a full SOC platform.

The Semgrep capability to identify this pattern is a separate prerequisite. Do not promise that existing Semgrep rules flag cross-tenant cache authorization; validate an actual AI-generated issue and rule before selecting the exact bug. A source finding plus correlated runtime event is evidence of a candidate root cause, not a general proof of causation.

## Verified past winners and what actually worked

Rank provenance is separate from category membership. Devpost badges establish award membership; participant LinkedIn claims do not independently prove rank. Code conclusions below come from the repository's full-file reads, not from assuming the sponsor recap proves implementation.

| Project | Verified award evidence | What the project actually built / limitation | Transferable pattern |
|---|---|---|---|
| Rokko, July 2025 | [ClickHouse recap confirms first](https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco); [Devpost](https://devpost.com/software/rokko-the-ad-optimizer-agent) | Kafka engine + transforming MV + MergeTree impressions; live simulated stream changes creative weights. Sponsor recap calls it bidding, but video/code analysis shows creative redistribution. Backend absent from published tree. | Stream → aggregate → agent changes something → changed stream is visible. |
| IncidentLogica, July 2025 | Same [recap confirms second](https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco); [Devpost](https://devpost.com/software/incidentlogica) | Temporal-based incident orchestration, retries/fallbacks and Slack; no ClickHouse use independently evidenced in submission/code/video. The historical field had two visible entries for two awards. | Useful incident timeline story, but poor evidence to copy technically. A thin historical field does not imply easy odds today. |
| Vital Signal, October 2025 | [ClickHouse recap confirms first](https://clickhouse.com/blog/nyc-ai-agents-hackathon); [Devpost](https://devpost.com/software/vital-signal) | Profile-based outbreak risk and multilingual emails, with ClickHouse profile/decision storage. Full-file deep dive recovered more code than first-pass winners.json; canned alerts and clinical text limit realness. | Same event → different user consequences, with an observable downstream outcome. |
| RedBot, October 2025 | [ClickHouse recap confirms second](https://clickhouse.com/blog/nyc-ai-agents-hackathon); [Devpost](https://devpost.com/software/the-redbot-autonomous-security-system) | Authorized chatbot assessment: prompt injection, data leakage and misconfiguration tests; ClickHouse stores prompts, responses, vulnerability signals, severity/history. [Schema](https://github.com/yli12313/AI-Agents-Hackathon-2025/blob/main/database_schema.py). Some mock/stub behavior. | Direct defensive precedent, so a generic chatbot red team would be derivative. Differentiate through source-to-runtime proof and verified repair. |
| policyDiff, May 2026 | [Category badge](https://devpost.com/software/policydiff-asn4xf); first only creator-claimed | Three services communicate through ClickHouse; policy changes joined to claims for revenue exposure. Hero dollar value seeded; demo trigger partly simulated. | One quantified impact frame; database is system spine. Use real counts and label replay datasets. |
| TC Pilot, May 2026 | [ClickHouse + Top Overall badges](https://devpost.com/software/tc-pilot); second only creator-claimed | Clinical-trial context, run state and event-study analytics in ClickHouse; visible latency badges and agent steps. Some synthetic cohort effects. | Overall quality plus an attributable ClickHouse insight beats a console table dump. |
| AeroRider, June 2026 | [Category badge](https://devpost.com/software/aerorider); second only creator-claimed | Seven tables, three MVs, latest-state tables, TTL, H3, one scoring query; AI hazard rows written back and route re-scored. Seeded default corridor guarantees a flip. | SQL as judge, model as sensor; real before/after in product UI. |
| DailyGate, June 2026 | [Guild category badge](https://devpost.com/software/dailygate); exact rank unconfirmed | At judging, three published Guild agents with physically different tool grants and a local router. UI's “live” panel was scripted and made no Guild call; later cloud router/coder/tests are post-event. | Permission tier = separate agent toolset is strong. Show genuine hosted session rather than a local scripted panel. |
| MediCall, April 2026 | [Guild category badge](https://devpost.com/software/medicare-6jtuhn); third only participant-claimed | Four published Guild typed agents, daily trigger, backend calls, live phone outcome. Hardcoded recall and silent simulated-success fallback. | Published-agent proof and trigger matter; a thin cron wrapper makes sponsor peripheral. |
| Argus, July 2026 | [Canonical code](https://github.com/Ashna16/Argus); Oct 8 notes include Guild DevRel corroboration of winner, first only participant-claimed | Published typed Guild agent holds no Jira secret and uses scoped Jira tools to file a human-accepted finding. “Guild pause” is actually local state; demo re-recorded four weeks after event. | Real secretless last-mile response plus actual session events. Do not brand a local pause as Guild enforcement. |
| Branch, April 2026 | [Guild + three other sponsor badges](https://devpost.com/software/branch-5zn8h0) | Issue → forked DB → checks → real bot PR → hardened image. Guild SDK absent from lockfile and no Guild API calls. Other sponsor steps real; some plan/PR content hardcoded. | Per-sponsor proof dossier and coherent pipeline can stack awards, but duplicate the genuine work rather than decorative Guild. |

Full forensic source files: `analysis/why-they-won/clickhouse-2025-and-argus.md`, `clickhouse-2026-agentic-london.md`, `ship-to-prod-2026-guild.md`; `analysis/deep-dives/_TEAM_clickhouse-a.md`, `_TEAM_clickhouse-b.md`, `_TEAM_guild-group.md`, `argus.md`, `dailygate.md`. The richer Oct 8 deep dives correct some Oct 7 `data/winners.json` source-access assumptions. Award ranks remain as qualified above.

The strongest recurring inference is **a retellable outcome with sponsor-specific proof**, rather than maximum engine complexity. This is correlation from selected projects, not official judge scoring. The 2026 matched comparison showed deeper ClickHouse users losing to better-presented projects; console screenshots alone were unhelpful. At a cybersecurity event, previously tolerated unauthenticated endpoints, prompt-built SQL, false success fallbacks and fake audit panels would undermine credibility.

## Current and recent ClickHouse capabilities

### Recent release worth knowing

[What's new in ClickStack, Aug '26](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026) is **published 16 September 2026** and covers v2.34–v2.38. These are real recent capabilities, not October 2025 features mistaken for 2026:

- Dashboard variables are GA. Tenant, service and release filters can flow into SQL/builder/Lucene/PromQL queries, including dependent dropdowns.
- Chart formulas combine series, and formula alerts evaluate the calculated result. Use leak count / total cache hits only if the denominator is defined honestly.
- Release markers identify the moment each `service.version` first appeared in logs/traces. This is a useful vulnerable-build → patched-build marker, but timestamp correlation alone does not establish causation.
- **Beta** LLM observability dashboard covers calls, tools, cache hits, tokens, errors and latency; supports OpenTelemetry GenAI, OpenLLMetry, OpenInference and Vercel AI SDK telemetry without dedicated tables/ingestion changes. It is not a complete evaluations/prompt-management product.
- Alert history records each evaluation, including query duration and notification failures; stable `alertId` and richer webhook payloads support deduplication for a Guild handoff.
- New MCP `clickstack_emerging_signals` compares log patterns in two windows. Sponsor's planted-pattern service-health evaluation found the pattern in 8/10 runs vs 0/10 without the tool. This is a vendor evaluation on planted log patterns, not a security detection accuracy benchmark.
- New MCP `clickstack_query_tiles` checks multiple tiles; the article demonstrates validation of 17 tiles in one call. Read/write annotations help clients gate modifying tools.
- Collector OIDC validates signature, issuer, audience and expiration; **standalone collector mode only**. Do not promise this for an arbitrary managed deployment.
- TimeSeries/PromQL is **private preview in managed ClickStack**, experimental in OSS. Visual PromQL builder and PromQL alerts were unsupported in that release. Exclude from a five-hour plan.

[Executable UDFs GA](https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud), **5 October 2026**, adds Cloud support across AWS/GCP/Azure, compiled Native runtimes (Rust/Go/C++/JavaScript via Bun), outbound network access, memory limit and deterministic-cache flag. Cloud API endpoints and Terraform resources exist; UDF query metrics require **ClickHouse 26.6+**, Terraform provider **3.24.0+**. Article demonstrates 100k synthetic LLM spans / 351 MiB text / 69M tokens processed in 5.2 s on 4 vCPUs and 4 workers, roughly 19k spans/s. These are vendor demo numbers, not our benchmark.

**MVP recommendation:** Do not adopt UDF deployment simply because it is new. Plain SQL aggregation, an incremental MV and real query measurement will provide stronger prize evidence per hour. If the team already has ClickStack working, use release markers and a native dashboard to expose change. Otherwise use ClickHouse HTTP/client plus a custom product screen; bringing up a new observability platform risks the day.

### Low-risk engine behavior to use correctly

[Incremental MV docs](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view) explain that computation moves to insert time and updates continually as inserted blocks arrive. For runtime telemetry, maintain minute × commit × sink rollups while retaining raw evidence in MergeTree.

Critical constraint: an incremental MV **only triggers from its left-most source table**. A new Semgrep finding inserted later on the right side of an MV join will not retroactively enrich old events. Avoid this subtle bug: aggregate raw event facts in the MV and join findings at query time, or explicitly backfill/recompute after scan updates. New scan results and old runtime evidence must actually meet.

The docs' 238.98-million-row votes example reports a 133 ms raw aggregate and a 4 ms rollup query over ~9k rows. The hardware is not supplied in the inspected excerpt, so quote it only as illustrative documentation. Do not reuse either number as the hackathon project's latency.

## Current Guild capabilities and integration traps

Live-verified documentation, 9 October IST:

- [Security architecture](https://docs.guild.ai/platform/security-architecture): credentials stay in control plane; outbound tool/LLM calls traverse Guild proxies. Coding containers have networked setup then offline runtime except mediated egress. Session log records tool/LLM/subtask/error events; administrative audit log is a distinct tamper-evident surface.
- [Credential policies](https://docs.guild.ai/platform/credential-policies): DENY overrides ALLOW; rules can scope operations, resource repositories/domains/methods, agents and workspaces. **Every new credential starts with an unscoped allow-all policy. Adding a scoped rule does not remove it; the UI may hide that default row. Delete the default policy before claiming deny-by-default least privilege.** Policy enforcement is at egress, not a prompt instruction.
- [API triggers](https://docs.guild.ai/platform/api-triggers): trigger key creation/management is **web UI only**. One-trigger-scoped key is Basic `<id>:<secret>` to `https://api.guild.ai/v1/workspaces/{owner}/{workspace}/sessions` with `session_type: api_trigger` and `agent_input` object. Response has genuine `id`, `session_url`, root task status and later token usage. Status terminal states: DONE/ERROR/INTERRUPTED.
- General partner API keys are separate: [docs index](https://docs.guild.ai/llms.txt) says they can create **chat only**; api_trigger/time/webhook types return 403. Do not copy a bearer-browser-session endpoint from older winner code or assume a general key is a trigger key.
- [Auto-managed state agents](https://docs.guild.ai/guide/coded-agents): typed Zod I/O, deterministic code control flow with optional LLM calls; compiler transforms `"use agent"` into resumable state machine. Root input schema must be `z.object()`. Runtime supports SDK, zod, integration packages, not arbitrary third-party imports. Use `task.gather`/`gatherSettled`, not Promise.all/any/race. SDK **0.4.0+ deprecates `description`**; generated published description comes from code.
- [Quickstart](https://docs.guild.ai/quickstart): Node 22+, `@guildai/cli`, auth configures private npm registry, `guild agent init`, test, `save --wait --publish`, then install in workspace. Do not assume public npm installs the SDK without Guild authentication. Native prompt+tool agents exist if typed code introduces too much friction.
- [Docs index](https://docs.guild.ai/llms.txt) includes current Codex, opencode and Antigravity drivers, LangGraph agents, environments, Agent Hub and MCP server. Availability is documented; no release date was verified, so do not label all of these newly launched this month.

## Realistic five-hour implementation slice

Use one threat, one app, one replay and two hosted agents:

1. **Investigator:** gets finding JSON and a bounded ClickHouse evidence summary. Toolset reads only the demo repository and evidence integration; outputs typed { finding_id, observed_requests, affected_documents, source_links, recommended_patch }. No raw credentials, no arbitrary SQL execution, no writes. Treat attack text as data.
2. **Remediator:** separately installed, only this repository, allowed branch/PR or issue operations needed for the demo. It receives the approved typed patch/test plan. Gate the side effect in application code and/or a real Guild prompt; demonstrate a read-agent write attempt denied by policy with real session event proof. Never auto-merge.

A custom OpenAPI integration exposing `get_case(case_id)` and `run_regression(case_id, commit)` is cleaner than allowing the agent arbitrary URLs, but requires authentication and a deployed endpoint. If that exceeds budget, pass the actual ClickHouse aggregate as the trigger input and use existing GitHub tools for the hosted output step. Hosting a secretless, policy-bounded action is genuine Guild value even without making every local scanner step run in Guild.

Parallel team lanes can share fixed tables: telemetry + SQL; scanner + replay/patch; Guild; product/demo. Establish table/JSON contracts before coding. The Guild auth/integration proof should work within first 45–60 minutes; if not, ask sponsor mentor then simplify, rather than leaving sponsor integration to final hour.

### Suggested evidence model

Raw runtime events include event_time, request_id/trace_id, authenticated_tenant, returned_document_owner, document_hash, cache_hit, route/sink_id, code_commit, result, dataset_kind. Do not retain actual tenant secrets or fabricate a connection between a rule and an event. Findings include finding_id, scanner/rule, commit, file/line, route/sink mapping and confidence of that mapping. Action rows include finding_id, genuine Guild session ID/URL, approval ID, patch commit, regression result and timestamps.

ClickHouse query groups mismatches by version/sink, counts requests/distinct victim tenants/distinct documents, and joins the finding matching the same code version/sink. Legitimate sharing must be explicitly modeled; `tenant_a != tenant_b` is valid only for the app's strict single-tenant ownership policy. Unique documents are known affected objects, not guessed monetary loss.

### Metrics that win scrutiny

- Label one million background/replay events **synthetic/replayed**, and label attack requests **live against the controlled app**. Volume without meaningful queries is decorative.
- Show table count, actual query ID, rows read, p50/p95 query duration across a bounded repeatable measurement, and end-to-end event-to-alert lag. Record warm/cold condition, database region/service size, and workload.
- Measure raw scan and MV query over the same semantic answer; preserve correctness. No fabricated “38 ms” or “99.9%” badge.
- Show leaks before patch and zero on a defined replay after patch, with legitimate request checks still passing. This establishes closure for that test case, not general zero vulnerabilities.
- Put the actual SQL/ClickHouse badge beside the impact number and link the actual Guild session beside the response action.
- `SPONSORS.md`: Sponsor / Necessary role / Demo timestamp / Real proof / Limitation. Include each judge's concrete evidence path.

## Devil's advocate

The main rival is a slick “AI SOC” with a huge dashboard and many fake attacks. Avoid competing on breadth. A verified boundary failure in ordinary AI-generated glue code, quantified in real telemetry and fixed/retested, is the better technical story.

However, cross-tenant cache bugs are difficult for generic Semgrep rules, and root-cause mapping can become hand-tagged fiction. Select the vulnerability only after a real scan returns it. A known-file controlled harness is honest for the MVP; avoid implying arbitrary repository detection.

ClickHouse should answer a question requiring event aggregation, not store ten rows under a large logo. Guild should actually host a run and enforce credentials/tool access, not be represented by a local log. If those two proofs cannot be shown, the multi-prize ceiling is irrelevant.

Prompt injection scanners and patch agents are already crowded. RedBot and tracepath are direct historical precedents. The distinctive contribution should be **proof that the vulnerability was exercised and that the exact fix closes the observed path**, coupled with real permission enforcement.

## Source inventory and saved evidence

All live fetched evidence is under `.firecrawl/click-guild-*`; fetching/reading performed serially to respect the shared two-job limit. The shared 12-request/min cap briefly throttled one call, then the same scrape succeeded. One obsolete OpenTelemetry schema URL returned 404; it was not used as evidence.

1. [Guild docs](https://docs.guild.ai/) → `.firecrawl/click-guild-guild-index.md`: current core model.
2. [Guild documentation index](https://docs.guild.ai/llms.txt) → `click-guild-guild-llms.txt`: current API/scoping/surface index.
3. [Guild API triggers](https://docs.guild.ai/platform/api-triggers.md) → `click-guild-guild-api-triggers.md`: correct trigger key creation/auth/session handling.
4. [Guild security architecture](https://docs.guild.ai/platform/security-architecture.md) → `click-guild-guild-security.md`: secretless runtime, egress, audit distinction.
5. [Guild credential policies](https://docs.guild.ai/platform/credential-policies.md) → `click-guild-guild-policies.md`: allow-all initial policy trap.
6. [Guild coded agents](https://docs.guild.ai/guide/coded-agents.md) → `click-guild-guild-coded-agents.md`: compiler, limits, I/O schema.
7. [Guild quickstart](https://docs.guild.ai/quickstart.md) → `click-guild-guild-quickstart.md`: installation and actual publish sequence.
8. [ClickStack August 2026](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026) → `click-guild-clickstack-aug26.md`: September 16 product update, v2.34–2.38.
9. [Executable UDFs GA](https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud) → `click-guild-clickhouse-udf.md`: October 5 launch and vendor demo performance.
10. [Incremental MVs](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view) → `click-guild-clickhouse-mv.md`: correct insert-trigger semantics and illustrative benchmark.
11. [NYC winner recap](https://clickhouse.com/blog/nyc-ai-agents-hackathon) → `click-guild-clickhouse-nyc-winners.md`: independent rank confirmation and sponsor's desired loop.
12. [AWS winner recap](https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco) → `click-guild-clickhouse-aws-winners.md`: independent ranks, historical partial-build caveat.

Searches saved: `click-guild-clickhouse-new-search.json`, `click-guild-clickstack-sept-search.json`; feedback sent after reading. No primary evidence verified a fresh Guild release date or the probability of winning/stacking these exact Cyberdefense prizes. Event-specific prize economics and stacking require organizer rules supplied to the root researcher.

Rerun inputs: workflow = firecrawl-deep-research; depth = thorough; topic = ClickHouse/Guild sponsor fit, prior winners, current capabilities, 5h defensive AI MVP; output = Markdown notes.
