> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# ClickHouse sponsor winners

> Derivative Markdown export of the saved **Sponsor_Winners_Research** report, checked **7 October 2026**. The report is the authoritative source; no separate source-notes archive was recovered. Statements about availability, current code, upcoming events and claims retain the report’s historical snapshot. They have not been reverified for a later date. Extraction repairs join wrapped lines and restore damaged hyphens only.

[Repository overview](../../../CURATION.md) · [Full report](../archive/source-tree/research/report.md) · [Event map](event-map.md) · [Evidence register](evidence.md)

## How to read the evidence

Verified award means a structured event award badge or an explicit sponsor announcement. A sponsor list, technology tag or creator claim alone does not qualify. Rank unconfirmed means category membership is known but placement is not independently published. Creator-reported ranks remain labeled throughout.

Repository verified means the project identity follows a submission or corroborated creator link. Source inspected means selected files were read without installing, running or deploying the project. Current source may differ from the judged version. Linked videos were not independently played, and hosted demos were not exercised unless specifically stated.

Why it may have won is analysis. No individual judge scorecards were found. Sponsor retrospectives can explain a project's value without proving which factor caused its award. Medical, legal, security and performance claims remain prototype claims unless supported separately.

## Verified awardees

- 25 July 2025: two Most fun use of ClickHouse winners. The sponsor recap confirms both placements. [17](https://mcp-aws-enterprise-agents.devpost.com/)
- 4 October 2025: two Best use of ClickHouse winners; both placements are sponsor-confirmed. [18](https://nyc-ai-agents-hackathon.devpost.com/)
- 23 May 2026: two category winners. Their first and second placements are creator reports. [19](https://agentic-engineering-hack.devpost.com/)
- 12 June 2026: three category winners, including a listed Langfuse subprize. The category total and itemized amounts conflict; no payout inference is made. [20](https://harness-hack.devpost.com/)
- 26 June 2026: two category winners. Exact ranks remain unresolved; the category header and detailed prize text also use different currencies. [21](https://multiagents-hackathon.devpost.com/)

### Rokko The Ad Optimizer Agent

First place; sponsor confirmed. MCP AWS Enterprise Agents Challenge, 25 July 2025. [22](https://devpost.com/software/rokko-the-ad-optimizer-agent)

**What it built.** A conversational ad-campaign optimizer uses simulated impressions and live performance feedback.

**Repository evidence.** Public; integration source inspected. setup-clickhouse.sql defines a MergeTree impressions table, a Kafka input and a transforming materialized view, plus daily and hourly aggregate views. [23](https://github.com/JasonLKelly/awshackjuly2025/blob/main/ad-simulator/setup-clickhouse.sql)

**Published explanation.** ClickHouse names it first and emphasizes streaming signals and fast feature aggregation for bidding decisions. [24](https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco)

**Why it may have stood out, inference.** Analytics changes the agent's optimization decisions, giving the demo an observable data-to-action loop.

**Limits.** The impression stream is a disclosed simulation. Apparent credentials in public materials should not be reused. No license was found in the inspected tree.

Repository [25](https://github.com/JasonLKelly/awshackjuly2025) | Demo [26](https://www.youtube.com/watch?v=-NTsy-OQp00)

### IncidentLogica

Second place; sponsor confirmed. MCP AWS Enterprise Agents Challenge, 25 July 2025. [27](https://devpost.com/software/incidentlogica)

**What it built.** An incident-analysis agent uses Temporal orchestration, Bedrock, retries and fallbacks, with Slack summaries.

**Repository evidence.** No canonical public repository found. The sponsor says ClickHouse stores incident timelines, model exchanges and postmortem metrics. The submission has no repository link, so that integration could not be checked in source.

**Published explanation.** ClickHouse names it second and discusses durable incident-response execution. Its recap describes a partial build. [24](https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco)

**Why it may have stood out, inference.** A recoverable workflow and inspectable incident history offer a useful defensive pattern.

**Limits.** The submission's technology list omits ClickHouse even though the sponsor describes it. Advertised behavior is not independently verified.

Demo [28](https://www.youtube.com/watch?v=zzqxzkcJOjk)

### Vital Signal

First place; sponsor confirmed. NYC AI Agents Hackathon, 4 October 2025. [29](https://devpost.com/software/vital-signal)

**What it built.** Personalized outbreak alerts and multilingual reports combine family context with health information.

**Repository evidence.** No canonical public repository found. Sponsor and entrant descriptions place user profiles, structured alerts and images in ClickHouse, with retrieval supporting contextual reports. No source inspection was possible.

**Published explanation.** ClickHouse confirms first place and highlights a polished, scoped workflow with personalized context and a stable data foundation. [30](https://clickhouse.com/blog/nyc-ai-agents-hackathon)

**Why it may have stood out, inference.** The product demonstrates why persistent context changes an agent's output, with a clear user-facing result.

**Limits.** No clinical or production-safety claims were verified. The recording's access was not independently checked. The similarly named vitalsignal-azure repository is unrelated.

Demo [31](https://drive.google.com/file/d/1YCWN7PK2r8o3UeF9A9W0dlnNLinGwTNH/view)

### RedBot

Second place; sponsor confirmed. NYC AI Agents Hackathon, 4 October 2025. [32](https://devpost.com/software/the-redbot-autonomous-security-system)

**What it built.** A prototype supports authorized chatbot security assessment and prioritized remediation reporting.

**Repository evidence.** Public; integration source inspected. database_schema.py and database_tools.py use clickhouse_connect, MergeTree tables, finding inserts, statistics and historical-pattern retrieval. [33](https://github.com/yli12313/AI-Agents-Hackathon-2025/blob/main/database_schema.py)

**Published explanation.** ClickHouse confirms second place and emphasizes actionable findings, fast analysis of accumulated assessment data and a usable narrow scope. [30](https://clickhouse.com/blog/nyc-ai-agents-hackathon)

**Why it may have stood out, inference.** This is a direct defensive precedent: retain authorized-test evidence, compare severity and history, and explain remediation priorities.

**Limits.** Source contains mock behavior and a stubbed profile getter. Public materials contain apparent credentials. No production assurance, live-target testing or code-license clearance was performed.

Repository [34](https://github.com/yli12313/AI-Agents-Hackathon-2025) | Pitch deck [35](https://github.com/yli12313/AI-Agents-Hackathon-2025/tree/main/pitch_deck)

### policyDiff

Category winner; first place is creator-reported only. Agentic Engineering Hack, 23 May 2026. [36](https://devpost.com/software/policydiff-asn4xf)

**What it built.** The prototype monitors payer-policy revisions, classifies coverage changes and estimates affected revenue.

**Repository evidence.** Public; integration source inspected. clickhouse_repo.py reads pending differences and reimbursement aggregates, inserts classified changes and maintains processing state across services. [37](https://github.com/manoj1749/policyDiff/blob/main/services/classifier-service/app/clickhouse_repo.py)

**Published explanation.** No project-specific judging explanation was located. The official submission verifies award membership; the creator reports first place.

**Why it may have stood out, inference.** Detected change becomes a quantified consequence. ClickHouse is the shared working data layer rather than a decorative dashboard.

**Limits.** Revenue-risk estimates were not validated. Use this exact repository and submission to avoid unrelated PolicyDiff projects. No license was found in the inspected tree.

Repository [38](https://github.com/manoj1749/policyDiff) | Demo [39](https://www.youtube.com/watch?v=EMDqxOE8Fto) | Hosted app [40](https://policy-diff-x3bo.vercel.app) | Participant rank claim [41](https://www.linkedin.com/posts/manojsadanala_hackathon-ai-healthcareai-activity-7465811469213892609-FtEk)

### TC Pilot

Category winner; second place is creator-reported only. Agentic Engineering Hack, 23 May 2026. [42](https://devpost.com/software/tc-pilot)

**What it built.** A cancer-navigation prototype explains pathology, prepares visits, tracks symptoms and surfaces clinical trials.

**Repository evidence.** Public; integration source inspected. clickhouse_client.py defines patient, symptom and medication tables and uses SQL for cohort comparisons and time trends, alongside a sponsor health check. [43](https://github.com/Haris320/tc-pilot/blob/main/backend/app/clients/clickhouse_client.py)

**Published explanation.** The award badge confirms the category. A creator profile reports second in ClickHouse and first overall; no sponsor ranking announcement was located.

**Why it may have stood out, inference.** The care-navigation workflow visibly uses population analytics beyond retaining chat transcripts.

**Limits.** The submission describes a seeded 1,000-patient cohort. A UUID cookie is prototype identity; full authentication was future work. No clinical validation or code-license clearance was performed.

Repository [44](https://github.com/Haris320/tc-pilot) | Demo [45](https://www.youtube.com/watch?v=n-i_Wm6XZzA) | Participant rank claim [46](https://www.linkedin.com/in/akhil-mohammed)

### seconds ai

Category winner; exact rank unconfirmed. Harness Engineering Hack, 12 June 2026. [47](https://devpost.com/software/seconds-ai)

**What it built.** Consumer complaints are aggregated into evidence-backed potential case leads.

**Repository evidence.** Public; integration source inspected. schema.sql defines replacing tables, joins model scores and computes case signals from distinct authors, time windows and source URLs. [48](https://github.com/txshah/seconds.ai/blob/main/app/schema.sql)

**Published explanation.** No individual judging explanation was located. The project title begins with team 1, which does not establish first place.

**Why it may have stood out, inference.** Data modeling expresses what makes a useful signal: independent people and timely evidence, rather than a raw post count.

**Limits.** The submission places the full autonomous connector loop and outreach in future work despite broader README claims. No license was found in the inspected tree.

Repository [49](https://github.com/txshah/seconds.ai) | Demo [50](https://www.youtube.com/watch?v=jNSkYxDTygo) | Hosted app [51](https://seconds-ai.onrender.com/)

### AeroRider

Category winner; second place is creator-reported only. Harness Engineering Hack, 12 June 2026. [52](https://devpost.com/software/aerorider)

**What it built.** Bike routes are compared using air quality, elevation and visual hazard signals.

**Repository evidence.** Public; integration source inspected. clickhouse.py supplies route points as external query data, computes H3 cells and stores visual hazards and ride events. [53](https://github.com/ybavgito/AeroRider/blob/main/backend/app/clickhouse.py)

**Published explanation.** The official badge confirms the category. The creator reports second place; no published project-specific scorecard was located.

**Why it may have stood out, inference.** Spatial and time-series analytics visibly changes a route choice, making the sponsor's effect understandable.

**Limits.** Health scoring is prototype logic and camera coverage is incomplete. No standalone video was located. No license was found in the inspected tree.

Repository [54](https://github.com/ybavgito/AeroRider) | Screenshots [55](https://github.com/ybavgito/AeroRider/tree/main/docs/screenshots) | Participant rank claim [56](https://www.linkedin.com/posts/mukunth-vaibhav-g_the-move-to-california-came-with-a-welcome-activity-7473404710582972417-bmjG)

### EARWITNESS

ClickHouse category winner; Langfuse subprize is self-described. Harness Engineering Hack, 12 June 2026. [57](https://devpost.com/software/earwitness-the-agent-that-pays-for-what-actually-aired)

**What it built.** Audio fingerprints are compared with claimed radio playlists and used to record royalty decisions.

**Repository evidence.** Public; integration source inspected. clickhouse_events.py creates play, money and check tables and uses asynchronous inserts with completion waits for event records. [58](https://github.com/gorajing/earwitness/blob/main/earwitness/clickhouse_events.py)

**Published explanation.** The badge is Best Use of ClickHouse. The README describes Best Use of Langfuse, a subprize listed under that umbrella; independent subprize confirmation was not located.

**Why it may have stood out, inference.** Ground-truth evidence and an event ledger make an automated decision inspectable.

**Limits.** The broadcast is seeded. Payment paths include testnet and fallback behavior; no live transaction was verified or executed. No license was found in the inspected tree.

Repository [59](https://github.com/gorajing/earwitness) | Demo [60](https://www.youtube.com/watch?v=QqeSwumPpBk) | Hosted app [61](https://earwitness.onrender.com)

### SynapseCRO

Category winner; exact rank unconfirmed. Multiagents Hackathon London, 26 June 2026. [62](https://devpost.com/software/synapsecro)

**What it built.** A website audit workflow proposes fixes and repeats an audit to check the outcome.

**Repository evidence.** No canonical public repository found. The entrant describes ClickHouse as history for findings, rank drift, conversion, performance and evaluations, with past results informing later prompts. Source verification was unavailable.

**Published explanation.** The official badge establishes Best Use of ClickHouse. No individual ranking or detailed sponsor explanation was located.

**Why it may have stood out, inference.** The defensible pattern is a persistent audit, repair and recheck loop whose earlier evidence changes later decisions.

**Limits.** The submission supplies a hosted app but no repository. The similarly named SynapseCross is unrelated. No account was connected and no live audit was initiated.

Demo [63](https://www.youtube.com/watch?v=O1_n7AjpXAc) | Hosted app [64](https://synapsecro.fly.dev)

### LicenseTrace

Category winner; exact rank unconfirmed. Multiagents Hackathon London, 26 June 2026. [65](https://devpost.com/software/licensetrace)

**What it built.** A dependency graph traces paths to possible copyleft-license risks and attaches explanations.

**Repository evidence.** Public; integration source inspected. server.js uses the HTTPS ClickHouse interface to create a scans table, store risk and path metadata, and confirm row counts. Analysis continues if storage is unconfigured or fails. [66](https://github.com/Welddevelopment/Tokens-Hackathon---Codebase-Dependencies-Scanner/blob/main/server.js)

**Published explanation.** The structured badge confirms the category, but no exact ranking or ClickHouse-specific judge explanation was located.

**Why it may have stood out, inference.** A simple audit trail can add sponsor value even when another tool performs the main reasoning. This qualifies claims that only elaborate ClickHouse integrations win.

**Limits.** License conclusions are prototype assertions, not legal advice. No license was found in the inspected repository tree.

Repository [67](https://github.com/Welddevelopment/Tokens-Hackathon---Codebase-Dependencies-Scanner) | Demo [68](https://www.youtube.com/watch?v=trJ8B1QgfKE)
