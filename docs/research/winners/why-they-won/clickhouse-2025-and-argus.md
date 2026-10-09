> Imported historical analysis; current ScopeWatch architecture/contracts govern the build.

# Why they won: ClickHouse 2025 (AWS MCP, NYC AI Agents) and Guild at Self-Evolving (Argus)

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

> Round 2, matched winner-vs-loser analysis. Analyst: `why-clickhouse-2025`. Done 8 Oct 2026. Read-only.
> **[V]** = verified, with source. **[I]** = inference. Round-1 files are cited rather than re-derived: [`clickhouse/rokko.md`](../../archive/source-tree/analysis/clickhouse/rokko.md), [`clickhouse/incidentlogica.md`](../../archive/source-tree/analysis/clickhouse/incidentlogica.md), [`clickhouse/vital-signal.md`](../../archive/source-tree/analysis/clickhouse/vital-signal.md), [`guild-ai/argus.md`](../../archive/source-tree/analysis/guild-ai/argus.md).
> Working files (videos, frames, galleries, clones) are in the session scratchpad only. Nothing was committed.

## 0. Headline findings

1. **AWS MCP (Jul 2025): the ClickHouse prize had no competition.** Only **2 of 47** gallery projects mention ClickHouse as something they used: Rokko and IncidentLogica. Both won. The prize ("Most fun use of ClickHouse", 2 winners) went to every ClickHouse entry. IncidentLogica's Devpost page does carry the badge "Winner, Most fun use of ClickHouse" **[V]**, even though ClickHouse is in neither its Built With list, its story nor its video. The only rival on record is **GlucoTrack**. The sponsor blog spotlights it, but it is **not in the Devpost gallery** **[V]**. So a "matched loser" barely exists at this event. Rokko took 1st on merit. IncidentLogica took 2nd because the field was empty.
2. **NYC (Oct 2025): the field was real (17 of 51 entries list ClickHouse), and the winner won on product, story and sponsor breadth, not on ClickHouse depth.** Vital Signal won **five** prizes (Airia, Freepik, PhenoML, Structify, ClickHouse) **[V Devpost]**. At least two losers used ClickHouse more idiomatically. Causal Trust Agent had 8 MergeTree and 2 SummingMergeTree tables on ClickHouse Cloud, and CareRadar ran patient-record scans in ClickHouse. Both lost on things that have nothing to do with ClickHouse. They had no video, a technical persona instead of a human one, and in Causal Trust's case only **two** sponsor tools against a three-tool rule **[V]**.
3. **Self-Evolving (Jul 2026): Argus beat at least one team with *more* Guild depth.** The two 2nd-place projects are still unpublished. One is now identifiable with high confidence: **Vocare**, a utility-arrearage voice agent by Von Viray, Nalin Iyer and Jason Ye **[I, high; §C.2]**. It had two `pick()`-scoped Guild agents plus a self-published Guild integration. But its own build log, dated 24 Jul, says the agents were "saved as DRAFTS … **Server does not yet route through them**" **[V]**. Argus wired one agent into the live path and showed a **real** Jira key (`SCRUM-19`) on screen. Argus's silent fallback can only produce keys from 1000 to 8999, so `SCRUM-19` proves the real Guild path ran in that recording **[V]**. The other Guild users we found used the wrong "Guild": the `guildai` 0.9 ML experiment tracker, which shares the name **[V]**.
4. **All three 1st-place winners were solo builders.** Rokko (Jason Kelly), Vital Signal (Richel Gomez) and Argus (Ashna Parekh) **[V]**. The 2nd-place teams were bigger: IncidentLogica had 3, RedBot 5 and Vocare 3.

---

## Part A. MCP · AWS · Enterprise Agents Challenge (San Francisco, 25 Jul 2025)

### A.1 Event context

| Item | Value | Source |
|---|---|---|
| Format | **One day**, Fri 25 Jul 2025. Coding 11:00 to 17:00, finalist presentations 17:30, awards 19:30. The sponsor blog's "two fast-paced days" is wrong | Luma https://luma.com/awshack **[V]** |
| Pool | **47** gallery projects (2 pages + 1) | `/project-gallery` pages 1-2 **[V]** |
| Used ClickHouse | **2**: Rokko and IncidentLogica (the latter only via the blog and its badge). Upsell Agent mentions ClickHouse only under "What's next" | Devpost page text of all 47 **[V]** |
| ClickHouse prize | "**Most fun use of ClickHouse**, 2 winners: ClickHouse platform credit of $500, and one tbd physical gift of around $500" | Devpost main page **[V]** |
| Criteria | Idea 25%, Technical implementation 25% ("surprise and inspire … novel use of tools"), Tool Use 25% ("at least 3 sponsor tools"), Presentation 25% ("live demo in 3 minutes … 1 overview slide"). **No autonomy criterion** | Devpost **[V]** |
| ClickHouse judge | **Kaushik Iska**, Engineering Manager @ClickHouse | Devpost + Luma **[V]** |
| Other relevant judges | Temporal: Cornelia Davis and **Steve Androulakis**, who wrote the `temporal-ai-agent` sample that IncidentLogica's visible system is built on (round-1 §7). Confluent: Sean Falconer | Luma **[V]** |
| Halo | Rokko also won **Best use of Confluent Cloud** **[V]**. IncidentLogica won only the ClickHouse prize **[V]** |

### A.2 Comparison set

| Project | Result | Team | Sponsors (Devpost Built With) | ClickHouse evidence | Video |
|---|---|---|---|---|---|
| **Rokko: The Ad Optimizer Agent** | **ClickHouse 1st** + Confluent | Solo (Jason Kelly) | AWS, Bedrock, ClickHouse, Confluent, Node, React | Kafka engine → MV → MergeTree; 5,906 real messages (round-1 §4) | YT `-NTsy-OQp00`, 167 s, narrated |
| **IncidentLogica** | **ClickHouse 2nd** | 3 (Ahmet Dedeler, Ryuzo Kijima, Oliver Cingl) | AWS, Bedrock, Claude, Temporal (**no ClickHouse**) | None in code, Devpost or video. Blog bullet only | YT `zzqxzkcJOjk`, 130 s, phone-filmed |
| GlucoTrack (blog spotlight) | No prize; **not in gallery** | ? | Bedrock, Temporal, React, ClickHouse (per blog) | Blog: "backbone for time-series ingestion and sub-second queries into the React UI" | None found |
| Upsell Agent | Dynatrace prize | Solo | Bedrock, Claude, MongoDB, Temporal | "Push … reports to clickhouse" under *What's next* only | None |

There are no other matched losers. I searched every project page in the gallery for "clickhouse" **[V]**. GitHub searches for a GlucoTrack repo (`gluco`, `OhioT1DM`, Jul-Aug 2025) found nothing attributable **[V]**.

### A.3 Demo forensics (frames sampled every 10 s, read as contact sheets)

**Rokko (`-NTsy-OQp00`, 167 s, uploaded 26 Jul 2025).** The transcript is in round-1 §6. Frames:
- **0 s**: an "Ad Optimization Agent Architecture" slide over the live app. It shows four boxes: Rokko Agent (AWS Bedrock / Claude Sonnet 4), Shared Config, Ad Simulator, Confluent Cloud ("Kafka Streaming") and **ClickHouse ("Analytics Database")**. **ClickHouse is on screen in the very first frame** **[V]**.
- 10-30 s: the Ad Viewer Simulator config panel (impressions/sec, device/gender/browser weights, creatives c1/c2/c3 = 74/13/13), then "Start Simulation". The Impression Log fills with live rows **[V]**.
- 40-60 s: the Rokko chat window opens beside the simulator. "Oreo Q3 2025", then "Women 25-35" **[V]**.
- **70-80 s: the payoff table.** "Overall Stats: Total Impressions: 7,080 · Total Clicks: 484 · Overall CTR: 6.84%". A per-creative table follows (Creative | Impressions | Clicks | CTR | Conversions; c1.png 3,915 | 92 | 4.9%…). Then "🏆 Best Performer: c1.png with 4.9% CTR" **[V]**. *New versus round 1:* the agent **displays clicks, CTR and conversions** that the published ClickHouse schema cannot hold. So the unpublished backend either simulated them or used an extended table (round-1 §4.4 stands, but the judges saw real-looking numbers).
- 100-110 s: "New Creative Distribution: c1.png: 75% (↑ from 55%) … Projected CTR Improvement: 6.84% → 7.2% (+5.3%) · ROI Boost: 15-20%" **[V]**.
- **120 s: the closed loop.** The simulator's Creatives fields now read **c1 = 94**, c2 = 3, c3 = 3, and the Campaign Config panel shows "Version: 4" **[V]**.
- 130-150 s: "show me c1.png". **160 s**: back to the architecture slide with ClickHouse at the bottom **[V]**.
- Polish: two localhost browser windows, a plain UI, one narrator. The sponsor is named in speech in the first 10 s (round-1 §6). It contains 3 numbers (CTR, +5.3%, 94%) and visible causality (data → decision → config change → stream changes).

**IncidentLogica (`zzqxzkcJOjk`, 130 s, uploaded 26 Jul 2025).**
- **0 s**: a selfie-style phone shot of three young team members in a meeting room. One wears a STANFORD sweatshirt **[V]**.
- 10-40 s: the phone camera pans over **two laptops on a table**. Neither screen is legible at this resolution **[V]**.
- 50-80 s: Temporal Cloud "Event History" and workflow pages, filmed off the screen **[V]**.
- 90 s: a "Temporal AI Agent" chat page **[V]**. 100 s: motion blur / a face. 110 s: **Slack** (dark purple UI) on the second laptop **[V]**.
- 120 s: back to Temporal. The final frames are black.
- **ClickHouse never appears on screen. Bedrock is never legible.** It has no slide, no number and no persona. It is the least polished demo in this report.

### A.4 Rubric scorecard (1-5; criteria 25% each, plus Sponsor Fit)

| Project | Idea | Tech | Tool Use | Presentation | **Weighted** | Sponsor Fit (ClickHouse) | Evidence |
|---|---|---|---|---|---|---|---|
| Rokko | 3: ad optimisation, consumer-legible Oreo framing (transcript 0:35-1:05) | 4: Kafka engine + MV ingest live for about 6 h; backend missing from repo (round-1 §3, §4.3) | 5: Bedrock + Confluent + ClickHouse in one loop, all three on the 0 s slide | 4: narrated, live data, closed loop at 120 s; 18 s dead air, abrupt end | **4.0** | **5**: the exact "streaming → features → actions" pattern the blog names | frames 0/70/120 s |
| IncidentLogica | 3: "never-fails" incident commander; demo is a trip planner (round-1 §5) | 2: visible system is the upstream Temporal sample (round-1 §7) | 3: Temporal + Bedrock + Slack; no ClickHouse | 1: phone video, no slide, "what was our name?" (1:59) | **2.25** | **1**: no visible ClickHouse use | frames 0-120 s |
| GlucoTrack | n/a (no submission found) | | | | | 4 on paper (blog) | blog only |

**Predicted vs actual:** Rokko 1st matches. IncidentLogica 2nd is explained by a **2-entry field with 2 prize slots**, not by the rubric. Any third entry with a visible ClickHouse query would likely have displaced it **[I]**.

### A.5 The AWS blog, sentence by sentence (https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco, Zoe Steinkamp, 20 Nov 2025)

| Blog sentence (verbatim or close) | Who it describes | What the losers lacked |
|---|---|---|
| "Builders prototyped next-gen AI agents that **act on live data**: adtech, AI ops, and digital health were standouts." | adtech = Rokko, AI ops = IncidentLogica, digital health = GlucoTrack | The three domains are the three spotlighted projects. "Act on live data" fits only Rokko on video (live stream, config change at 120 s) |
| "ClickHouse served as the real-time analytics backbone across stacks with **Temporal, AWS Bedrock, Confluent Kafka, Slack, and React**." | The union of the three projects' stacks | The sponsor lists partner tech the winners used. Naming other sponsors' tools in the same pipeline earns mentions |
| "how ClickHouse powers **real-time observability, low-latency predictions, and analytics that feel instantaneous in a product UI**" | observability → IncidentLogica; predictions → Rokko; instant UI → GlucoTrack | One clause per project. Each project was given a ClickHouse "role" by the sponsor, whether or not it was shown |
| Rokko: "A real-time agent that **predicts ad bidding prices** from time-series ad signals." | Rokko | **Inaccurate.** Rokko re-weights creatives (frame 100-120 s). The sponsor remembered the *category* (real-time adtech ML), not the mechanism |
| "**Confluent Kafka streams events into ClickHouse for feature computation; the agent reacts to fresh signals and updates bids.**" | Rokko | Backed: Kafka engine + MV (round-1 §4.1), agent reaction visible at 120 s. IncidentLogica had no stream |
| "**Millisecond-class aggregations and joins** on streaming data made model features instantly queryable." | Rokko | Aggregates are on screen at 70 s. **No joins** in published SQL. No loser showed query latency either, so nobody was out-performed on this |
| "The team **preferred ClickHouse over batch-oriented options** for low-latency, scalable analytics on hot data." | Rokko | A *stated reason for choosing ClickHouse*. This reads like a questionnaire answer. Winners gave the sponsor a quotable "why us" **[I]** |
| IncidentLogica: "Temporal for durable orchestration…; AWS Bedrock calls…; **ClickHouse for storing incident timelines, prompts/responses, and metrics for post-mortems**; Slack…" | IncidentLogica | **Unverified anywhere else** (round-1 §4). Probably said in the live pitch **[I]** |
| "Challenge: **Presenting a partial build while conveying the full vision**." / "Advice: '**Fake it till you make it** - how you tell the story matters'" | IncidentLogica | The sponsor **published** a winner's admission of a partial build. A ClickHouse placement in a thin field tolerated it |
| GlucoTrack: "Early trend plots across time windows lagged. **Moving fully to ClickHouse (with tuned schema + queries) restored smooth, low-latency dashboards**" + "made our project feel like a real product instead of a demo" | GlucoTrack (no prize) | The *strongest* ClickHouse story in the post belongs to a project with **no Devpost entry**. Lesson: the story only pays if you submit it to the prize **[I]** |
| "**Streaming → features → actions**: Event streams (often via Kafka) landed in ClickHouse … fed agents that act in real time." | Rokko | This is the 1st-place pattern written as a general lesson |
| "**Orchestration matters**: Temporal gave reliability superpowers" | IncidentLogica, GlucoTrack | Not a ClickHouse quality. The sponsor rewarded fit with the ecosystem |
| "**Production-grade UX**: React dashboards reading from ClickHouse made analytics feel instantaneous" | GlucoTrack (and Rokko's React UI) | IncidentLogica had no dashboard |
| "**Observability by default**: Storing prompts, traces, and metrics made it easy to explain model behavior" | IncidentLogica (claimed) | Cheap to claim and to build: log every LLM step to a ClickHouse table |

### A.6 Differentiators (Rokko vs IncidentLogica)

| Factor | Rokko | IncidentLogica |
|---|---|---|
| ClickHouse on screen / in speech | 0 s slide, spoken in first 10 s, 4× in transcript **[V]** | Never **[V]** |
| Quantified payoff | 6.84% CTR → 7.2%, c1 → 94% **[V]** | None |
| Live data | Simulator → Kafka → ClickHouse, 5,906 messages **[V]** | Stock travel goal **[V round-1]** |
| Wow moment | Agent mutates live config (120 s) | Model fallback, narrated not shown |
| Persona | "Oreo Q3, women 25-35" | None |
| Sponsor count / halo | 3 sponsors, won 2 prizes | 3 sponsors, ClickHouse not among them |
| Demo craft | Screen recording, narrated, 167 s | Phone camera, 130 s |
| Team | Solo working engineer (upwave.com email, round-1 §1) | 3 students [I from frame 0 s and account ages] |

### A.7 Counterfactuals

- **IncidentLogica, nearly lost:** a third ClickHouse submission showing a single query would very likely have taken 2nd. GlucoTrack, had it submitted to Devpost, would have been that entry **[I]**. Smallest change that would have *secured* it: one 10-second shot of the `incident_events` table it claims to keep.
- **Rokko, nearly lost:** little. The missing backend and hard-coded credentials (round-1 §4.7) were invisible to judges. The 18 s of dead air and abrupt ending cost presentation points, not the prize.

### A.8 Verdicts

**Rokko: 1st, why it won (ranked).**
1. **It was the only entry whose demo *shows* ClickHouse doing the sponsor's headline job** (stream in → aggregate → agent acts). Confidence **high**: frames 0/70/120 s, blog wording.
2. **Visible closed loop with numbers.** Confidence **high**: 94% at 120 s.
3. **Sponsor stacking.** Confluent + ClickHouse prizes from one pipeline. Confidence **medium**.
4. **A thin field.** It was 1 of 2 ClickHouse entries. Confidence **high**. This explains why the bar was low, not why it was 1st rather than 2nd.

**IncidentLogica: 2nd, why it won.**
1. **There were 2 slots and 2 entrants.** Confidence **high** (gallery count, badge).
2. **The pitch fit ClickHouse's "observability" narrative**, presumably spoken live **[I, low-medium]**.
3. **Demo quality played no positive role.** Confidence **high**.

---

## Part B. NYC AI Agents Hackathon (Datadog NYC, 4 Oct 2025)

### B.1 Event context

| Item | Value | Source |
|---|---|---|
| Format | One Saturday. Coding 11:00, **submission 16:30**, **finalist presentations and judging 17:00**, awards 19:00. About 135 attendees, "roughly half … working software engineers" | Luma https://luma.com/hackdogs, blog **[V]** |
| Pool | **51** gallery projects. The blog's "roughly 20 projects" is an undercount | gallery pages 1-3 **[V]** |
| Used ClickHouse | **17** list ClickHouse in Built With (one is "clickhouse(future)"). 2 more mention it only in text, and DreamPulse says "I couldn't get the … Clickhouse integrations working" | project pages **[V]** |
| ClickHouse prize | "**Best use of ClickHouse**, 2 winners: 1st $1000 Amazon GC & $800 ClickHouse credits; 2nd $250 GC & $500 credits" | Devpost **[V]** |
| Rule | "Every team had to use at least three sponsor technologies" | blog, Devpost Tool Use criterion **[V]** |
| Criteria | Idea, Technical Implementation, Tool Use, Presentation (3 min), **Autonomy** ("act on real-time data without manual intervention"), 20% each | Devpost **[V]** |
| ClickHouse people | Judge **Kevin Zhang** (Senior SWE @ClickHouse). On site, the blog lists "Kevin Zhang, Nataly Merezhuk, and Zoe Steinkamp" pairing on "schemas … event streams". Zoe was a speaker | Luma, blog **[V]** |
| Other judges | 22 listed across OpenAI, Perplexity, Datadog, ClickHouse, Structify, Airia, TrueFoundry, All Hands, DeepL (Ben Morss), Linkup, **PhenoML (CEO Kerry Weinberg)**, Freepik, and others | Luma **[V]** |

### B.2 Comparison set

| Project | Result (Devpost badges) | Team | Sponsor tools listed | ClickHouse depth (evidence) | Video |
|---|---|---|---|---|---|
| **Vital Signal** | **ClickHouse 1st** + Airia + Freepik + PhenoML + Structify (**5 prizes**) | Solo | Airia, ClickHouse, DeepL, Freepik, PhenoML, SendGrid, Structify (7) | Load-bearing (light): profiles, risk-assessment log, image BLOBs (round-1 §4) | Drive, 108 s, **silent** |
| RedBot | **ClickHouse 2nd** (only prize) | 5 | ClickHouse, DeepL, OpenHands, … | **not analysed** (brief) | none on Devpost |
| Causal Trust Agent | — | 4 | ClickHouse, Datadog (+Python): **only 2 sponsor tools** | **Deepest in field**: ClickHouse Cloud, 8 MergeTree + 2 SummingMergeTree DDL, `audit_results` table as agent memory (commit 8455fc5) **[V clone]** | none |
| CareRadar | — | 2 | ClickHouse, Datadog, OpenAI | MergeTree patient table; "moving beyond hardcoded queries" listed as *next* **[V Devpost]** | none (screenshots) |
| CortexCI | — | 2 | ClickHouse, Datadog, OpenAI | "executes [tests] on ClickHouse Cloud"; on screen, **ClickHouse appears only as an error** (§B.3) | YT `Np27fqzkXR0`, 239 s, silent |
| Umbrella Mode | — | Solo | ClickHouse, Datadog, OpenAI | 6 MergeTree DDL; "summarized data is piped into ClickHouse" (sink) **[V clone, Devpost]** | YT `C7Ot4jQyBEY`, 151 s, silent |
| 3blue1brown / Manim + ClickHouse MCP | — | Solo | ClickHouse, Claude (Claude is **not** a sponsor) | ClickHouse MCP over a HuggingFace dataset; repo commits all on **6 Oct** (after the event) **[V]** | YT `ORrgh3EfbGg`: **now unavailable** |
| Halo cases: ClassPro (DeepL prize), AdVantage AI (Freepik prize) | Other prizes, not ClickHouse | 1-3 | both list ClickHouse | ClassPro: 4 MergeTree DDL. AdVantage: "deploys it through the ClickHouse API to thousands of micro-audiences" (not something ClickHouse does) | none |

Also examined but weaker: BabelFHIR-Vibe (claims "sub-20ms queries"; Vimeo 404), Skopeo (video unavailable), HomeGenie (13 s video), GovernsAI, BookLang, SmartCircle (0 ClickHouse references in repo), AutoInfra CoPilot (frontend "in progress").

### B.3 Demo forensics

**Vital Signal.** Frames were reviewed in round 1 (`vital-signal.md` §6) and are not redone here. In summary: a silent 108 s screen capture of the Airia 3-node run → tool panels per sponsor → run stats "26,245 tokens, $0.0734, 70,386 ms" → **a real Gmail inbox** with risk-scored, translated alerts (image broken). ClickHouse is never on screen except as the "Get VitalSignal Users" tool at about 16 s. The recording was made at 16:27, 3 minutes before the deadline. It has no hook and no problem statement. **The video cannot be what won.** The 17:00 finalist pitch was decisive **[I, high]**.

**CortexCI (`Np27fqzkXR0`, 239 s, uploaded 4 Oct; audio is digital silence, max −91 dB).**
- 0-30 s: VS Code, scrolling `test.js` mock code-change payloads ("Add trip rating functionality", a `trip_ratings` `ENGINE = MergeTree() ORDER BY (trip_id, created_at)` DDL string) **[V]**.
- 40-110 s: the terminal pipeline. "STEP 1: CHANGE DETECTION … STEP 2: AI ANALYSIS … Risks identified: 3 - SQL injection due to unsanitized queries", then "STEP 3: AI TEST CODE GENERATION … Prompting OpenAI" and "Test Summary: Total 5 · Passed 5 · Pass Rate 100%" **[V]**.
- **120 s: wow moment.** "Pass Rate 88.89% … ❌ Some tests failed! **Deployment blocked.**" **[V]**.
- 140-180 s: Datadog Logs explorer with `nyc-taxi-resolver` events **[V]**.
- **200-210 s: the only ClickHouse moment.** "SQL: SELECT * FROM daily_trip_summary ORDER BY date LIMIT 5 … **FAILED: ClickHouse error** … `Code: 60. DB::Exception: Unknown table expression identifier 'daily_trip_summary'` (version 25.6.2.6151 official build)" **[V]**.
- 220-230 s: "Deployment FAILED", "DEPLOYMENT HISTORY SUMMARY".
- Verdict: no narration, 4 min against a 3-min limit, terminal-only, and the sponsor shows up as a missing-table error.

**Umbrella Mode (`C7Ot4jQyBEY`, 151 s, uploaded **21 Oct 2025**; silent).**
- 0-60 s: `agent-hackathon-beta.vercel.app`, a sign-up form beside a chat panel. The user says "help me fill out this form", then "My name is Lebron James and my email is lebron@gmail.com" **[V]**.
- 60-110 s: tool calls "intent / selector / actor … Completed". The form fills. The agent warns that personal email domains are blocked **[V]**.
- 110-140 s: "I'm getting some errors when I submit". Tool "**datadog** Completed". The agent explains "recent backend errors … brief database timeouts" **[V]**.
- The macOS menu-bar clock reads **"Sat Oct 4 5:14-5:17 PM"**, so it was recorded after the 16:30 deadline **[V]**. **ClickHouse never appears.** The Datadog tool is the visible sponsor.

**Not watchable:** 3blue1brown (`ORrgh3EfbGg`) and Skopeo (`Oc9vO6mRmr0`) are "unavailable". BabelFHIR (Vimeo 1124504244) returns 404 **[V yt-dlp]**. HomeGenie is a 13 s clip. Causal Trust Agent, CareRadar and RedBot have no video.

**Pattern:** **none** of the NYC ClickHouse entries we could watch (winner included) has narration or shows a ClickHouse query succeeding. The recorded demos were weak across the board. The live finalist presentation is where the ranking happened **[I, high]**.

### B.4 Rubric scorecard (1-5; five criteria 20% each, plus Sponsor Fit)

| Project | Idea | Tech | Tool Use | Present. | Autonomy | **Avg** | Sponsor Fit | Key evidence |
|---|---|---|---|---|---|---|---|---|
| **Vital Signal** | **5**: family-abroad outbreak alerts, personal quote (blog) | 3: works end to end; WHO data hardcoded (round-1 §5) | **5**: 7 sponsors, 5 prizes | 4 [I]: live finalist pitch; video ends in real inbox | 4: one "Start workflow" → 70 s autonomous run → emails | **4.2** | 4: "center of the architecture"; basic features | Devpost badges; round-1 frames |
| Causal Trust Agent | 3: MTTR for multi-agent pipelines (engineer persona) | **4**: ClickHouse Cloud, memory table, SummingMergeTree | **2**: 2 sponsor tools against a 3-tool rule | 1: no video | 4: auto-detect → patch → rollback | **2.8** | **4**: deepest ClickHouse | BW list; repo DDL; 2,107 lines committed **3 Oct 22:08** (eve of event) |
| CareRadar | **4**: clinicians spot at-risk patients (health) | 2: hardcoded queries | 3 | 1: no video | 2: dashboard + alerts | **2.4** | 3: ClickHouse for patient scans | Devpost text |
| CortexCI | 3 | 3 | 3 | 2: silent, 239 s, terminal | 4: push → tests → block | **3.0** | **1**: ClickHouse only as an error on screen | frames 120/200 s |
| Umbrella Mode | 3 | 3 | 3 | 2: silent, recorded post-deadline | 3 | **2.8** | 1: logging sink, never shown | frames; menu-bar clock |
| 3b1b / ClickHouse MCP | 3 | 2: repo is post-event | 2: Claude + ClickHouse only | ? (video gone) | 2 | **~2.3** | 4 on paper (billion-row + MCP) | repo dates 6 Oct |
| RedBot | not analysed | | | | | | | — |

**Predicted vs actual.** Rubric order is Vital Signal > CortexCI ≈ Causal Trust ≈ Umbrella > CareRadar. **Sponsor-fit order** is Causal Trust ≈ Vital Signal ≈ 3b1b > CareRadar. The real result (Vital Signal 1st, RedBot 2nd) agrees with neither for 2nd. The disagreement tells us the ClickHouse prize was **not** awarded for ClickHouse depth. The deepest ClickHouse entry (Causal Trust) received nothing, plausibly because it broke the 3-sponsor rule, had no video, and its pitch persona was an SRE dashboard. RedBot's domain (security), mentioned in the blog alongside health, was the other "real problem" **[I]**.

### B.5 The NYC blog, sentence by sentence (https://clickhouse.com/blog/nyc-ai-agents-hackathon, Zoe Steinkamp, 8 Dec 2025). RedBot paragraphs skipped per brief.

| Blog sentence | Winner trait (Vital Signal) | What the matched losers lacked |
|---|---|---|
| "130+ builders … ship **autonomous AI agents on real data**." | Real outbound email from an autonomous run (round-1 frames 1:28-1:44) | CareRadar (hardcoded queries) and CortexCI (mock code changes in `test.js`) ran on synthetic inputs. So did VS (hardcoded alerts), but its *output* was real |
| "ClickHouse showed up as the **only database sponsor** and became the default choice for data-intensive agent stacks." | — | Explains why 17 of 51 listed ClickHouse even when it was a logging sink (Umbrella) or aspirational (Budgetation "clickhouse(future)") |
| "**VitalSignal** and **RedBot** took home top prizes for tackling **global health alerts and chatbot security**." | Health | The sponsor describes winners by **problem domain**, not by ClickHouse feature. Causal Trust ("multi-agent pipeline MTTR"), CortexCI ("CI tests") and Umbrella ("form filling") are tooling for developers |
| "Agentic AI is at its best when it can see **fresh data, reason over it, and act quickly**." | Scrape → score → email loop | Umbrella and CortexCI act, but ClickHouse is not in their visible loop |
| "help teams **design schemas, model event streams, and wire ClickHouse** into their agents" | Solo builder chose ClickHouse early (blog) | No Devpost loser mentions ClickHouse staff help; RedBot's advice "don't hesitate to ask mentors" does **[V blog]** |
| "VitalSignal is an autonomous AI agent that delivers **personalized** global disease outbreak alerts." | Same alert → different outcome per profile | No loser had per-user personalisation over stored profiles |
| "It **continuously monitors** health-related signals" | Claimed. Actually 5 hardcoded alerts (round-1 §5) | The sponsor repeated the Devpost claim unverified: **claims in the pitch become the sponsor's copy** |
| "runs **multi-factor risk analysis** by region and user profile" | `risk_assessments` table with per-factor columns (round-1 §4) | Causal Trust had richer tables but no human-facing "risk score" |
| "the core problem: … hard to know **what matters to you and your loved ones**" | Emotional pull | Every loser in the set is B2B / developer-facing except CareRadar (clinician) |
| "ClickHouse sits at the **center of the architecture**, storing user profiles …, scraped and streamed JSON alerts, metadata … (images)" | Profiles, assessment log, image BLOB round-trip **[V round-1]** | Umbrella and CortexCI used ClickHouse at the edge (sink; one failing query) |
| "Sponsor tools like Airia, Structify, and PhenoML help extract and structure signals **before they land in ClickHouse**." | ClickHouse framed as the landing zone for *other sponsors'* outputs | Causal Trust: ClickHouse + Datadog only |
| "Because ClickHouse can **ingest diverse data types** and query them in real time, the builder could **experiment quickly**" | Praise for flexibility and speed, not analytics | Depth (SummingMergeTree, MVs) is never praised anywhere in the post |
| Inspiration quote ("I have family in different parts of the world…") | Personal "why" | None of the losers' Devpost stories has a first-person stake except Skopeo (Texas floods; video gone) |
| "**Decisions first**, hacking second: Chose ClickHouse as the database early. **Pre-created accounts and API keys**" | Prep | Causal Trust also prepped (commit the night before) but on the wrong axis: code, not sponsor accounts |
| "Docs-driven development … **Stable core, then integrations**" | Commit log 11:39 core → 15:59 integrations (round-1 §7) | CortexCI's ClickHouse table was missing at demo time (Code 60) |
| "orchestrating **six new platforms** under a 5.5-hour deadline" | Sponsor breadth praised explicitly | Losers used 2-3 sponsor tools |
| "knowing when to stop … a **'good enough' end-to-end solution**" | Shipped at 16:27 | AutoInfra ("Frontend (in progress)") and 3b1b (code interpreter "not working") shipped incomplete loops |
| "**I never once had to worry about database limitations** … That confidence let me stay ambitious and build the features that made the project a winner." | **A quotable testimonial** for the sponsor | No loser produced a ClickHouse testimonial. DreamPulse's Devpost says the opposite ("couldn't get … Clickhouse integrations working") |
| "The plan is to **use sponsor credits** to turn VitalSignal from prototype into a full-scale project" | A future customer story | — |
| "A **small, polished project** beats an ambitious, half-broken one every time." | | 3b1b, AutoInfra, CortexCI (error on screen) |
| "**ingest data → store in ClickHouse → compute features → let agents act.** ClickHouse became the natural 'source of truth'" | VS: store → personalise → email | Umbrella/CortexCI: ClickHouse not the source of truth |
| "one **AI-agent platform** + an **LLM API** + **ClickHouse** for analytics and state" | Exactly Airia + GPT-4.1 + ClickHouse | Causal Trust had no agent platform. Umbrella and CortexCI had raw OpenAI only |
| "Sponsors that showed up in person … **Pair program on schema design** … turned 'it sort of works' into 'this feels production-grade'" | — | — |
| "a strong ClickHouse-specific prize made it easier for teams to justify building something **data-intensive**" | Ironically VS is *not* data-intensive | The data-intensive entries (3b1b's billion rows, Causal Trust) lost |
| "MVPs over grand visions: **Picked a real problem (health alerts, chatbot security)**, shipped a narrow but usable loop" | Both winners named again by domain | — |

### B.6 Differentiators (Vital Signal vs matched losers)

| Factor | Vital Signal | Losers (pattern) | Weight [I] |
|---|---|---|---|
| Idea / emotional pull | Family abroad, health, personalised | Developer tooling (4 of 5) | **High** |
| Named persona in output | "Maria Silva", "Sarah Chen" emails | "Lebron James" form-fill (Umbrella), none elsewhere | Medium |
| Real external artifact | Real Gmail inbox | Terminal logs, Datadog | **High** |
| Sponsor breadth | 7 tools; 5 prizes | 2-3 tools; Causal Trust fails the 3-tool rule | **High** (Tool Use = 20%, and every sponsor judge saw "their" tool) |
| ClickHouse depth | Light | Causal Trust deeper | **None or negative** |
| ClickHouse on screen | About 1 s (tool panel) | Never (Umbrella) / as an error (CortexCI) | Low (video not decisive) |
| Sponsor vocabulary | "center of architecture", "BLOB storage" story on Devpost | "sink", "future", "attempted" | Medium |
| Video | Silent, 108 s | Silent or none | Low (everyone weak) |
| Team | Solo, prepared (accounts and keys pre-made) | 2-4 people | Low-medium |
| Timing | Demo recorded 16:27, Devpost 16:35 | Similar (16:24-16:41) | None |
| Domain | Health | Dev tooling, CI, forms | **High** (blog names health and security explicitly) |

### B.7 Counterfactuals

- **Causal Trust Agent:** add one more sponsor tool (it already "optionally invokes LLM reasoning", so listing OpenAI would have satisfied the rule) and record a 2-minute narrated video showing the ClickHouse memory table driving a fix. That is the smallest flip candidate for ClickHouse 2nd **[I]**.
- **CareRadar:** replace one hardcoded query with a live ClickHouse aggregation that surfaces a named at-risk patient and pushes an alert, plus a video. It already had the health domain the sponsor liked **[I]**.
- **CortexCI:** create the missing `daily_trip_summary` table so ClickHouse appears as a success, not `Code: 60`. Cut to 3 minutes and narrate.
- **Umbrella Mode:** put one ClickHouse panel (actions or errors over time) on screen. Today ClickHouse is invisible.
- **Vital Signal, nearly lost:** the judge-test credentials failed (Ben Morss's Devpost comment, round-1 §1). The headline image is broken in the emails. "Real-time WHO data" is hardcoded. Any judge who checked the code or tried the link would have marked Tech down. The live pitch carried it **[I]**.

### B.8 Verdict: Vital Signal

1. **Problem and story: personal, health, "same alert → different outcome".** Confidence **high**. The blog leads with it, quotes it, and names the domain twice.
2. **Sponsor breadth with ClickHouse as the hub.** 7 tools, 5 prizes, "six new platforms" praised in the blog. Confidence **high**.
3. **End-to-end loop ending in a real inbox** ("small, polished project beats an ambitious, half-broken one"). Confidence **high**.
4. **Gave the sponsor a testimonial and a roadmap** ("never once had to worry about database limitations"; "use sponsor credits"). Confidence **medium**: the quote was probably collected after the win, but the attitude was visible on Devpost ("ClickHouse isn't just for time-series").
5. **ClickHouse technical depth: not a factor.** Confidence **high**: deeper losers lost.

RedBot (2nd): not analysed, per brief.

---

## Part C. Self-Evolving Agents Hackathon (DG717 SF, 24 Jul 2026): Guild

### C.1 Event context

| Item | Value | Source |
|---|---|---|
| Gallery | **Still unpublished** on 8 Oct 2026: "The hackathon managers haven't published this gallery yet" | `/project-gallery` pages 1-5 **[V]** |
| Guild prize | "**Best use of agents in Guild**, $2,000, 3 winners … 1st place: $1,000. 2nd place: $500 (two teams)" | Devpost **[V]** |
| Other sponsors | Replay ("Best SaaS app with completed QA"), Actian VectorAI, Band, Senso | Devpost **[V]** |
| Criteria | Idea, Technical Implementation, Tool Use, Presentation, Autonomy (unweighted); "Judges: See Luma" | Devpost **[V]** |
| Winners (sponsor side) | Guild Head of DevRel **Corbett Waddingham**, 25 Jul 02:53 UTC: "special thank you to our winners: Ashna Parekh, C. Lai, Nalin Iyer, Jason Ye, and Von Viray". Comments: **Nalin Iyer**: "Had fun building with Guild.ai!"; **Ashna Parekh**: "Definitely had fun building with Guild.ai 💯" | LinkedIn post, fetched with curl (Firecrawl refuses LinkedIn) **[V]** |
| Rank | Argus 1st is participant-claimed (round-1 §1). 5 names / 3 slots → Ashna (solo) + two teams **[I]** |

### C.2 Identifying the 2nd-place projects

- **Vocare, autonomous hardship intake for US utilities (Von Viray, Nalin Iyer, Jason Ye): identified, confidence high [I].**
  - The three are a known team. They shared 1st at UNSW's AI for Progress hackathon as Team Teachi. Nalin's profile lists "Global Winner, ElevenLabs Worldwide Hackathon, Dec 2025" and "Winner, Hack2Heal". They were in SF in July 2026: Von's Loop Engineering Hackathon entry *GreenLight* is dated 17 Jul 2026 **[V]**.
  - The repo is `github.com/ORANGECRAB13/c0mpiledHack`. ORANGECRAB13 is Von Viray, and Nalin commits as `Nalin_21BRS1631`. It was pushed 25 Jul 2026 19:05-19:06 PDT as four squashed "Phase" commits from a local workspace named **`HackSF`**. Its `HANDOFF.md` is "**Last updated: 24 July 2026**", the event day **[V]**.
  - It targets **exactly the Self-Evolving sponsors**: "Prizes being targeted: *Best use of agents in Guild* … *Best SaaS app with completed QA (Replay)*", plus Band escalation, "Actian VectorAI *(planned)*" and Pioneer. The next commit says "Context graph + Neo4j semantic engine (**replaces Actian VectorAI**)" **[V]**. After that, at 20:23 the same evening, the team ripped Guild out for the next event ("Replace Guild agents with proprietary agent tier"). That event is c0mpiled Startup School Hackathon II, where compiled.sh lists the same three names **[V]**.
  - `OVERVIEW.md` §13: "Best use of agents in Guild — **won** by carrying *two* distinct governed action types (approval gate + knowledge-graph write), where most demos show one." **[V]**
- **C. Lai: not identified.** Searches for Guild-SDK repos (`@guildai/agents-sdk` in package.json), Self-Evolving repos created 22-27 Jul, and LinkedIn/Devpost all found no Lai **[V]**. Probably solo **[I, low]**.

### C.3 Comparison set (Guild users at Self-Evolving)

| Project | Result | Team | What "Guild" actually is in the code | Depth |
|---|---|---|---|---|
| **Argus** | **Guild 1st** (claimed; sponsor-named winner) | Solo | Guild.ai platform. One published code-first agent `argus-jira-filer` v1.0.11, `pick(jiraTools, [create, list])`, Jira credential held in Guild, API-trigger session from the app (round-1 §4) | Narrow, **live-wired** |
| **Vocare** | **Guild 2nd** [I] | 3 | Guild.ai platform. **Two** agents (`arrearage-authority`: `pick(VocareArrearageApiTools, [case_get, approval_decide])`; `arrearage-ratification`: `[knowledge_gaps_list, knowledge_gap_ratify]`) + **self-published Guild integration** `vocare-arrearage-api` v1.1.0 from an OpenAPI spec **[V c42fd12]**. But HANDOFF (24 Jul): "Two agents saved as **DRAFTS** … **Server does not yet route through them**"; "Guild and Band SDK calls are still stubbed"; "Empty credentials: Actian, Guild, Band, Pioneer slots … blank" **[V]** | Broader, **not wired** (as of the handoff snapshot) |
| C. Lai entry | Guild 2nd | ? | unknown | — |
| Self-Evolving Voice Workflows (`ayushgupta4897`) | none [I] | Solo | Guild.ai platform. Published agent `ayushgupta4897~swarm-validator` with an agent id, real traces pulled via `guild session events`; "**Guild hosts the Validator only**" **[V README, recon/guild_impl.md]** | Real but LLM-only validator; no external tool or credential |
| LivingBook (`oceanseth`) | none [I] | 2 | Guild.ai SDK `llmAgent` with **`tools: noTools`** (`agents-src/livingbook-marketing/agent.ts:59`) **[V]** | Prompt wrapper |
| DeltaDesk (`batu2244`) | none [I] | 2-3 | Plan: "Guild.ai is the desk … custom Guild integration … keys runtime-injected" (`solution-design.md:93`). Code: `requirements-guild.txt` → **`guildai>=0.9.0`** (the ML experiment tracker) **[V]** | Plan ≠ build |
| Firevolv (`anayvaidya11`) | none [I] | 3 | **`guildai==0.9.0`**, explicitly "Guild AI / guildai 0.9.x (the ML experiment tracker), **NOT the Guild.ai agent-platform CLI** that ships the same `guild` command" (`eval/guild.yml`) **[V]** | Wrong product |
| Self-Evolving QA (`Squidgy-AI`) | none [I] | 2 | `pip install guild` / `guild run evolution-loop` (ML tracker) **[V GUILD_SETUP.md]** | Wrong product |

"none [I]" means the commit authors don't match any of Corbett's five named winners.

### C.4 Demo forensics: Argus (`ybS23YwBhHQ`, 232 s, uploaded **22 Aug 2026**, a post-event re-record)

- **0-60 s**: a Riverside face-cam over a slide, "ARGUS — Universal Te[sting agent]". A pipeline of 8 boxes, **each colour-coded by sponsor**: 1. SENSO → 2. PIONEER / 2. REPLAY → 3-4. ARGUS → 5. REPLAY → 6. BAND → **7. GUILD "File automatically"** → 8. JIRA "Real ticket + video". The tagline reads "**One document. One live run. One approved Jira ticket.**" **[V]**
- 70 s: input form (Target URL `https://www.saucedemo.com`, "Context for Senso" upload). 80 s: "Compiling ground truth". 90 s: "4 grounded test cases" with model routing "Gemini 3 Flash (Pioneer)" **[V]**.
- 100-110 s: Replay "Exploratory cases from sessions", **PAUSED** **[V]**.
- **120-130 s: "Bug found — run paused" / yellow banner "Guild paused the run".** Live Swag Labs product grid on the right **[V]**. Round 1 showed this pause is local (`guild.ts:43-56`).
- 140 s: "Broken product images for problem_user. Expected / Actual / Severity high", with Accept / Decline **[V]**.
- 160-170 s: BAND "Human in the loop", the message Argus sent to the reviewer, "Delivered to Band" **[V]**.
- **180 s: "Guild agent files it"**. A dark log panel: `Handing "Sort order incorrect on inventory page" to ashnaparekh1998~argus-jira-filer`, `Session 019f… started`, "The agent holds its own scoped Jira credential — Argus never sees a Jira token" **[V]**.
- **190-200 s: a real Jira page**, `ashnaparekh1998-…atlassian.net/browse/SCRUM-19`. Expected/Actual prices, Replay recording and clip links, labels `argus · automated-qa · medium`, and "**Filed by Argus via Guild Jira connector.**" **[V]**
  - **Forensic point:** the silent fallback in `jira.ts:14` generates `SCRUM-${1000 + random*8000}`, which is always 4 digits. **`SCRUM-19` cannot come from the fallback**, so the Guild → Jira path really executed in this recording **[V]**.
- 210-220 s: the Replay clip with a red box on "Sauce Labs Backpack $29.99" **[V]**.
- Guild appears on screen 4 times (slide, pause banner, session log, Jira footer) and is named 8 times in speech (round-1 §6).

Vocare and the C. Lai project have no public video. The other Self-Evolving entries' videos were not located.

### C.5 Rubric scorecard (1-5; unweighted)

| Project | Idea | Tech | Tool Use | Present. | Autonomy | **Avg** | Guild Fit | Evidence |
|---|---|---|---|---|---|---|---|---|
| **Argus** | 4: QA for PMs | 4: live pipeline, typed agent | **5**: 5-6 sponsors, each on slide | **5**: sponsor-coloured slide, live run, real ticket | 3: human Accept gates the write | **4.2** | **5**: credential-isolated, scoped, live write to a system of record | frames 0/120/180/190 s |
| **Vocare** [I] | **5**: welfare/utility hardship, "$1,842.60 unlocked" | 4: deterministic policy graph, voice | 4: Guild, Replay, Band; Actian/Pioneer "planned" | ? | 4 | **~4.2** | 4 on design (2 governed actions + own integration); **2-3 as wired** (drafts, stubs) | OVERVIEW/HANDOFF |
| Voice Workflows | 4 | 4 | 4 | ? | 4 | ~4 | 3: real hosted agent, no tool scoping or credential | guild_impl.md |
| LivingBook | 3 | 3 | 3 | ? | 3 | ~3 | 2: `noTools` | agent.ts:59 |
| DeltaDesk / Firevolv / Squidgy QA | 3-4 | 3 | 2 | ? | 3 | ~3 | **1**: wrong Guild | requirements, guild.yml |

**Predicted vs actual.** On paper Vocare's Guild design is *richer* than Argus's (two governed action types, a self-published integration, the same `pick()` least-privilege idiom). Yet Argus took 1st **[I]**. The best available explanation is that **Argus's Guild path was live and visibly produced an artifact. Vocare's, per its own 24 Jul log, was drafts and stubs.** A DevRel judge can open a real Guild session and a real Jira ticket. A draft agent is only a slide **[I, medium]**. The two teams with a real Guild.ai *tool-using* agent placed. The hosted-but-toolless (Voice Workflows, LivingBook) and wrong-Guild entries did not **[I]**.

### C.6 Differentiators

| Factor | Argus | Vocare | Other Guild users |
|---|---|---|---|
| Right product (Guild.ai, not `guildai` 0.9) | ✓ | ✓ | 3 of 5 wrong or planned only |
| Scoped tools via `pick()` | ✓ (Jira create + list) | ✓ (2 agents × 2 tools) | ✗ (noTools / validator only) |
| Credential held in Guild | ✓ (Jira) | Own integration (credential blank in snapshot) | ✗ |
| Wired into live app path | **✓** (`SCRUM-19`) | **✗ in snapshot** ("Server does not yet route through them") | partial |
| Real artifact in an external system | **✓** Jira ticket + clip | Audit document (internal) | ✗ |
| Sponsor visible on screen | 4 Guild moments | unknown | unknown |
| Relationship with sponsor staff | Thanks Corbett (round-1 §8.6); commented on his post | Nalin commented on his post | Inseon Hwang credited Corbett but did not win |
| Team | Solo | 3 serial winners | 1-3 |

### C.7 Counterfactuals

- **Vocare:** flip one env var. Route `approval_decide` through the published Guild agent and show its session id plus the resulting action live. By their own log, it was a wiring task, not a design task **[I]**.
- **Voice Workflows:** give the Guild validator a governed, credentialed action (for example "promote graph version" via a scoped integration) instead of an LLM verdict.
- **LivingBook:** replace `noTools` with one `pick()`-scoped integration call.
- **Firevolv / Squidgy / DeltaDesk:** use Guild.ai, not the `guildai` ML tracker. Firevolv's own config comments show they knew both existed.
- **Argus, nearly lost:** if the Guild call had failed during judging, the UI would have silently shown a fake `SCRUM-xxxx` (round-1 §4). The "Guild paused the run" banner is local theatre that a code-reading judge could have flagged. The 11k-line single commit 8 minutes before the deadline makes provenance unverifiable.

### C.8 Verdict: Argus (1st, participant-claimed and sponsor-corroborated)

1. **A live, credential-isolated Guild write into a real system of record, shown on screen.** Confidence **high** that it was on screen (`SCRUM-19`, the "Filed by Argus via Guild Jira connector" footer). Confidence **medium** that this is what separated it from Vocare.
2. **Sponsor choreography.** An 8-box, sponsor-coloured pipeline slide and a Guild moment at every hand-off. Confidence **medium-high**.
3. **Guild's own pitch, enacted.** Scoped tools, the platform holds the credential, a human approves. Confidence **high** that it matches Guild's messaging (round-1 §8). Confidence **medium** as a cause.
4. **Using the right product with real tools in a field where most "Guild" entries were wrong-product or toolless.** Confidence **high** for the field composition.
5. **Unknowable:** the judged live demo (the video is a re-record four weeks later), C. Lai's entry, the scorecards.

---

## D. Cross-event differentiators (ranked)

1. **The sponsor must *visibly do the job* in the demo.** Rokko: ClickHouse slide at 0 s and an aggregate table at 70 s. Argus: Guild session at 180 s and Jira at 190 s. Losers' sponsors were invisible (IncidentLogica, Umbrella), appeared as an error (CortexCI), or were wired as drafts (Vocare). **Vital Signal is the exception**: its video barely shows ClickHouse, and the live pitch carried it.
2. **A human problem with a named persona and a real external artifact.** An Oreo campaign config change, a Gmail alert for Maria Silva, a Jira ticket with a clip. Developer-tooling entries with deeper sponsor use lost at NYC.
3. **Sponsor breadth, with the prize sponsor as the hub.** Rokko 3 sponsors / 2 prizes. Vital Signal 7 / 5. Argus 5-6. Causal Trust lost with 2 against a rule of 3.
4. **Depth of sponsor-specific engineering did not predict the win in any of the three events** (consistent with MASTER_REPORT). Causal Trust > Vital Signal, and Vocare ≥ Argus on design, and both lost.
5. **Thin fields decide more than quality.** AWS ClickHouse had 2 entries for 2 slots.
6. **Solo builders won every 1st place here** (3 of 3). That is a correlation only. The likely mechanism is one coherent loop and a single narrator **[I]**.

## E. What this means for tomorrow's Cyberdefense entry (9 Oct 2026; sponsors ClickHouse, Pi Security, Guild AI, Semgrep)

1. **Show ClickHouse succeeding on screen within the first 30 seconds.** Use a slide box labelled "ClickHouse" plus one live query with its row count or latency. Rokko did the former. No 2025 loser did either. Never let a ClickHouse error reach the recording (CortexCI).
2. **Use the loop ClickHouse writes about: stream → store → compute → act.** Security events land in ClickHouse, an aggregate (per-IP, per-rule over a window) drives the agent, and the agent changes a live control that visibly changes the next query's result. That is Rokko's 94% moment translated to "attacker 10.0.0.7 → blocked".
3. **Lead with a human stake and name the domain.** ClickHouse's own blog names "health alerts, chatbot security" as winners' problems. Security is already in their winners' list (RedBot). Frame the persona ("a 3-person SOC at a clinic"), not "an SRE tool".
4. **Use all four sponsors and route each through ClickHouse.** Semgrep findings and Pi Security signals land in ClickHouse tables. A Guild agent acts on them. Count the three-tool minimum *in the Devpost Built With list*.
5. **Guild: the right product, wired live, with an external write.** Use `@guildai/agents-sdk` (not `pip install guildai`). Use one `pick()`-scoped agent with the credential held in Guild. Call it from the live path and show the session id and the resulting ticket or PR on screen. Vocare's lesson: two governed agents as drafts lose to one that fires. Argus's lesson: a real low-numbered ticket key is proof. Label any fallback on screen.
6. **Hand the sponsor a quote.** Prepare one sentence per sponsor for the Devpost "Built with" story and the pitch ("ClickHouse let us query 2M auth events in 40 ms, so the agent can decide inside the attack window"). Vital Signal's testimonial ended up in ClickHouse's blog.
7. **The live finalist pitch decides; the video is a backup.** At NYC every watchable ClickHouse video, the winner's included, was silent. Still record a narrated 3-minute backup, because judges may only see the video.

## F. Uncertainties

- **No scorecards or ranks are published** for any event. Every "why" is inferred from artifacts, sponsor copy and the field.
- **Live pitches were not recorded.** At NYC (17:00 finalist presentations) and AWS (17:30) the pitch was probably decisive and is unseen.
- **RedBot was not analysed** (brief). The NYC 2nd-place reasoning is therefore incomplete.
- **GlucoTrack**: the blog spotlights it but it has no Devpost entry or repo. We can't tell whether it entered the prize.
- **Vocare identification** rests on the team names, workspace name `HackSF`, a 24 Jul handoff and the Self-Evolving sponsor set. It is inferential (high). Its HANDOFF status is a snapshot whose time on 24 Jul is unknown, so the wiring may have been finished before judging.
- **C. Lai's 2nd-place project is unidentified.** The Self-Evolving gallery remains unpublished (checked 8 Oct 2026).
- The "none [I]" outcomes for other Self-Evolving Guild users are inferred from Corbett's winner list. Those projects may have won other sponsors' prizes.
- Videos for 3blue1brown, Skopeo and BabelFHIR are no longer available. Argus's video is a post-event re-record, and Rokko's and IncidentLogica's were uploaded the next day. None is guaranteed to be what the judges saw.
- The blogs were written 4 and 2 months after the events and contain factual errors ("two days", "bidding prices", "roughly 20 projects"). Treat them as the sponsor's *framing*, not as a record.
