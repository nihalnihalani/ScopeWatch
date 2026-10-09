> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Guild AI sponsor winners

> Derivative Markdown export of the saved **Sponsor_Winners_Research** report, checked **7 October 2026**. The report is the authoritative source; no separate source-notes archive was recovered. Statements about availability, current code, upcoming events and claims retain the report’s historical snapshot. They have not been reverified for a later date. Extraction repairs join wrapped lines and restore damaged hyphens only.

[Repository overview](../../../CURATION.md) · [Full report](../archive/source-tree/research/report.md) · [Event map](event-map.md) · [Evidence register](evidence.md)

## How to read the evidence

Verified award means a structured event award badge or an explicit sponsor announcement. A sponsor list, technology tag or creator claim alone does not qualify. Rank unconfirmed means category membership is known but placement is not independently published. Creator-reported ranks remain labeled throughout.

Repository verified means the project identity follows a submission or corroborated creator link. Source inspected means selected files were read without installing, running or deploying the project. Current source may differ from the judged version. Linked videos were not independently played, and hosted demos were not exercised unless specifically stated.

Why it may have won is analysis. No individual judge scorecards were found. Sponsor retrospectives can explain a project's value without proving which factor caused its award. Medical, legal, security and performance claims remain prototype claims unless supported separately.

## Verified awardees

Guild here is the agent control plane, not the older experiment-tracking product. [98](https://docs.guild.ai/)
- 24 April 2026: all six Most Innovative Use of Guild.ai Platform awardees were identified. Advertised Visa gift cards: one $1,000, one $500 and four $250. [70](https://ship-to-prod.devpost.com/)
- 12 June 2026: all three Most Innovative Use of Agents awardees were identified. Advertised Visa gift cards: one $1,000 and two $500. Exact badges do not assign rank. [20](https://harness-hack.devpost.com/)

### Phalanx

Category winner; exact rank unconfirmed. Ship to Prod, 24 April 2026. [99](https://devpost.com/software/phalanx-c2gupz)

**What it built.** Concurrent vulnerability-remediation hypotheses use isolation, cancellation, provenance and approval gates.

**Repository evidence.** Public; Guild orchestrator inspected. The orchestrator launches local Guild agents, parses structured results and emits action and approval events across five roles. HTTP API migration is described as future work. [100](https://github.com/ElijahUmana/phalanx/blob/main/src/lib/guild/orchestrator.ts)

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** Controlled remediation and an auditable approval boundary closely fit defensive agent governance.

**Limits.** Guild is optional in the README and substituted paths are marked. Source inspection does not prove that every demonstration path used live Guild.

Repository [101](https://github.com/ElijahUmana/phalanx) | Demo [102](https://youtu.be/raOOVmiU3y4)

### Branch

Category winner; exact rank unconfirmed. Ship to Prod, 24 April 2026. [103](https://devpost.com/software/branch-5zn8h0)

**What it built.** A GitHub issue becomes a change plan, database fork, schema check and pull-request preview.

**Repository evidence.** Public; agent implementation inspected. The planner has typed schemas, an optional Guild SDK factory, progress notifications and a command-line fallback. It can run as a local subprocess without the SDK. [104](https://github.com/chinesepowered/hack-apr24/blob/main/services/agents/planner/src/agent.ts)

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** Typed deployable agents and a verifiable issue-to-change workflow give the sponsor a concrete role.

**Limits.** This is a Guild-deployable artifact, not proof every run used a hosted Guild runtime. A video is embedded on the submission, but its direct URL was not recovered.

Repository [105](https://github.com/chinesepowered/hack-apr24)

### WildFire Response

Category winner; exact rank unconfirmed. Ship to Prod, 24 April 2026. [106](https://devpost.com/software/worldfire-response)

**What it built.** Also named WorldFire Response or SafeSignal, it shows wildfire evidence, household status, resources and human-approved actions.

**Repository evidence.** Submission-linked identity verified; public URL returned 404. The submission lists Guild, but its future-work section describes optional Guild policy traces. The available technical description primarily names other application services.

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** The approval experience is a useful pattern; there is no basis to attribute the award to a particular implemented Guild feature.

**Limits.** The award badge is verified, but deployed Guild behavior and source code were not verified. The recovered submission-linked repository returns 404; private, deleted and renamed are possible explanations.

Repository [107](https://github.com/YuvrajGupta1808/Wildfire-Response) | Demo [108](https://drive.google.com/file/d/1XN997klIFmQ-SWGQHdO51Q8G7rBo4216/view?usp=sharing)

### tracepath

Category winner; exact rank unconfirmed. Ship to Prod, 24 April 2026. [109](https://devpost.com/software/tracepath-ewops5)

**What it built.** An agent investigates vulnerability reachability and creates issues with evidence and possible fixes.

**Repository evidence.** No canonical public repository found. The submission describes a typed OpenAPI tool backend for Guild, dependency scanning, advisory retrieval and source navigation. No public code was located.

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** Source-level reachability can reduce noisy vulnerability reports and make remediation evidence actionable.

**Limits.** The design is submission-described. No source implementation or standalone playable demo was verified; the submission has screenshots.

### RxScout

Category winner; exact rank unconfirmed. Ship to Prod, 24 April 2026. [110](https://devpost.com/software/rxscout)

**What it built.** Medication text or photos are used to compare pharmacy cash prices through parallel searches.

**Repository evidence.** Public; execution paths inspected; Guild claim uncorroborated. Inspected paths use LangGraph, LangChain, ChatOpenAI and TinyFish, with streaming and a cache. No Guild call or Guild-named agent file was located in those paths. [111](https://github.com/bvsbharat/RxScot1/blob/main/server/src/graph/supervisor.js)

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** The fan-out workflow is concrete, but the award record alone does not establish the sponsor implementation.

**Limits.** The submission describes Guild OCR and parser agents. That could reflect external, private or different-version work, but available code does not establish it. No medical or price-accuracy claim was validated.

Repository [112](https://github.com/bvsbharat/RxScot1)

### MediCall

Category winner; third place is participant-reported only. Ship to Prod, 24 April 2026. [113](https://devpost.com/software/medicare-6jtuhn)

**What it built.** Orchestrated check-ins and monitoring are exposed through typed backend tools.

**Repository evidence.** Public; Guild agent implementation inspected. guild-agent/agent.ts imports the Guild SDK, defines input and output schemas, calls a pipeline endpoint and parses its response. Additional agent directories are present. [114](https://github.com/abdullahw1/MediCall/blob/main/guild-agent/agent.ts)

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** A narrow typed interface makes the automation's responsibilities understandable and testable.

**Limits.** The additional agent code was not reviewed. The embedded video URL was unresolved and clinical functionality was not validated.

Repository [115](https://github.com/abdullahw1/MediCall) | Participant rank claim [116](https://www.linkedin.com/posts/k3vnc_medicall-just-won-two-sponsor-tracks-at-ship-activity-7456111931733667840-SYDx)

### Magpie

Category winner; first place is participant-reported only. Harness Engineering Hack, 12 June 2026. [117](https://devpost.com/software/magpie-lcguye)

**What it built.** Copied study fragments become a classified notebook with summaries and a queryable interface.

**Repository evidence.** Public; Guild session client inspected. guild.ts creates a workspace session, sends an agent prompt, polls completion events and handles authorization errors and timeouts. Four roles are documented. [118](https://github.com/shantanujoshi25/magpie/blob/main/clipdeck-dashboard/src/lib/guild.ts)

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** Distinct roles and visible organization of a user's material give the orchestration a clear purpose.

**Limits.** The team's explanation of why its composition won is not a judge statement. An embedded video exists, but the direct URL was unresolved.

Repository [119](https://github.com/shantanujoshi25/magpie) | Participant rank claim [120](https://www.linkedin.com/posts/shantanujoshi25_aiagents-generativeui-hackathon-activity-7472151833524727808-e84A)

### DailyGate

Category winner; exact rank unconfirmed. Harness Engineering Hack, 12 June 2026. [121](https://devpost.com/software/dailygate)

**What it built.** A management assistant earns additional autonomy as a person approves its work.

**Repository evidence.** Public; permission-routing agent inspected. The router delegates to permission-tier agents with explicit ceilings and live trust context. It contains fallback levels when trust retrieval fails. [122](https://github.com/SashaSkind/dailygate/blob/main/router/agent.ts)

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** Changes in permission are visible and subject to human overrides, a useful governance precedent.

**Limits.** The submission places cloud-triggered live trust hosting in future work; current repository descriptions are later. Do not infer an individual second place from the prize schedule.

Repository [123](https://github.com/SashaSkind/dailygate) | Demo [124](https://youtu.be/B5a7SoK_7Bs)

### proPR

Category winner; exact rank unconfirmed. Harness Engineering Hack, 12 June 2026. [125](https://devpost.com/software/propr)

**What it built.** A property-management assistant handles complaint intake, triage, vendor contact, repair tracking and escalation.

**Repository evidence.** No public repository shown in reviewed submission. The submission names Guild and Claude with email and spreadsheet tags. Published implementation detail is insufficient for source verification.

**Published explanation.** No project-specific judge explanation was located.

**Why it may have stood out, inference.** The workflow offers a concrete operational outcome, but there is too little evidence to identify a particular technical feature that likely earned the award.

**Limits.** No public code, playable demo or exact placement was established. A schedule-derived second-place guess would overstate the evidence.

## Guild award history with incomplete publication

The 24 July 2026 Self-Evolving Agents event lists a Guild category, but its official project gallery says the managers have not published it. The organizer advertises one $1,000 first prize and two $500 second prizes. No official recipient list was recovered. [140](https://self-evolving-agents.devpost.com/) [141](https://self-evolving-agents.devpost.com/project-gallery)

### Argus

Participant-reported first prize only. Ashna Parekh publicly identifies Argus as the Guild first-prize project at the tokens& event. This is useful evidence, but it is not included among the 30 independently verified awardees. [142](https://www.linkedin.com/posts/ashna-parekh-50b025110_guildai-senso-googledeepmind-activity-7486852658482511872-vALk)

The participant describes a product-test workflow: product evidence generates tests, recordings support human acceptance, and a scoped Guild connector files approved issues without placing Jira credentials in the application. Inference: the useful defensive pattern is a controlled handoff from an accepted finding to a system of record.

The author's follow-up links resolve to a public canonical repository and a YouTube demo. Repository identity and access are verified; source code was not inspected. A visible demo description does not prove backend execution. The two advertised second-place recipients remain unidentified. [143](https://www.linkedin.com/posts/ashna-parekh-50b025110_pm-productidea-automatetesting-activity-7496749512976248832-jz-5) [144](https://github.com/Ashna16/Argus) [145](https://youtu.be/ybS23YwBhHQ)
