> Imported historical analysis; current ScopeWatch architecture/contracts govern the build.

# Why they won: ClickHouse prize at Agentic Engineering Hack (NYC, 23 May 2026) and Multiagents Hackathon (London, 26 Jun 2026)

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Round-2 matched winner-vs-loser analysis. Round-1 code findings are cited, not redone: [policydiff.md](../../archive/source-tree/analysis/clickhouse/policydiff.md), [tc-pilot.md](../../archive/source-tree/analysis/clickhouse/tc-pilot.md), [licensetrace.md](../../archive/source-tree/analysis/clickhouse/licensetrace.md), [synapsecro.md](../../archive/source-tree/analysis/clickhouse/synapsecro.md), [_DEVILS_ADVOCATE.md](../../archive/source-tree/analysis/clickhouse/_DEVILS_ADVOCATE.md).

Labels: **[V]** verified (source given), **[I]** inference. All work files (galleries, project pages, videos, frames) are in the session scratchpad and were not committed. Frame times are approximate (sampled every 4–19 s, depending on video length). Videos were read from frames as 4×4 contact sheets, with full-resolution re-reads of key moments.

---

## 1. Event context

| | Agentic Engineering Hack (NYC) | Multiagents Hackathon (London) |
|---|---|---|
| Date / hours | Sat 23 May 2026. Coding 11:00–16:30 ET. **17:00 "Finalists Presentations and Judging"**, 19:00 awards [V Devpost] | Fri 26 Jun 2026. Kickoff 10:00, deadline 16:30 BST, 19:00 closing and awards. Luma advertises "Prizes + demos" [V Devpost, Luma] |
| Participants / gallery | 205 registered / **75 gallery projects** [V] | 82 registered / **46 gallery projects** [V] |
| **Projects using ClickHouse** (Built With tag, or ≥2 mentions in the story) | **60 of 75** (55 tagged), 54 with a video [V, scraped all 75 pages] | **27 of 46** (25 tagged), 23 with a video [V, scraped all 46 pages] |
| ClickHouse prize | "$1,000 — 2 winners. **'Makes your life better' — fix issues that stem from your job or day-to-day life** / **'Impact in our community/World, improving lives'**. *Either of these categories will win first place!* 1st: $1,000 cash + $500 credits; 2nd: $300 credits" [V Devpost] | "£1,000 — 2 winners. 1st: $1,000 gift card + $500 credits. 2nd: $300 credits" [V Devpost] |
| Criteria | Idea, Technical Implementation, Tool Use, Presentation (3-min demo), Autonomy, **20% each** [V] | Same five criteria, no weights shown [V] |
| ClickHouse people | Judge **Nataly Merezhuk** (Software Engineer, ClickHouse). Speaker Zoe Steinkamp (Sr Developer Advocate) [V Luma] | Judges **Tyler Hannan** (Senior Director, Developer Advocacy) and **Lee Wright** (Sales Director) [V Luma] |
| Other judges | 12 listed, including Nimble ×2, Luminai, Airbyte, Crosby, VCs (Evolution Equity, Creandum), Google Strategy [V Luma] | Gensyn, Prometheux CEO, Tavily, Project A (VC), Cursor, Modal [V Luma] |
| Team size | Max 4. Gallery mean 1.93; 34 of 75 solo [V] | Max 3. Gallery mean 1.24; 36 of 46 solo [V] |
| Rules of note | "No previous projects allowed. Githubs will need to be submitted." [V] | "Projects must be built during the event." Public GitHub repo required [V] |

**Prize map** [V, winner badges on every gallery page]:
- **NYC:**
  - ClickHouse: policyDiff, TC-Pilot.
  - Top Overall: **TC-Pilot**, RegRadar, Denial Rescue (RossMD). All three use ClickHouse.
  - Nimble: Wage.MD, Receipts, BasketIQ. All use ClickHouse.
  - Senso: PolicyGuard.
- **London:**
  - ClickHouse: LicenseTrace, SynapseCRO.
  - Prometheux: **LicenseTrace**, Provena, TrialMatch.
  - Tavily: **Basket**, Argus, Sentinel.
  - Top Overall: Agentic Workflow Compiler, Replay, Sidequest.
  - Gensyn: Deriv8, BrandCompete.
  - Senso: Sleep score DD.

**The only two double winners at these events both hold a ClickHouse prize:** TC-Pilot (ClickHouse + Top Overall) and LicenseTrace (ClickHouse + Prometheux Intelligence Prize, the £1,000 "best overall project built with Prometheux").

**Correction to round 1.** `_DEVILS_ADVOCATE.md` estimated 4–8 ClickHouse entries in London and called the pool "thin". The real counts are **27 of 46 in London and 60 of 75 in NYC**. ClickHouse is a near-default sponsor at these events. Each slot faced roughly 13 (London) to 30 (NYC) ClickHouse users. Winning was **not** cheap.

**Judging mode (NYC) [V].** Both NYC winners' YouTube videos were uploaded *after* the event: TC-Pilot on 24 May, policyDiff on 25 May (yt-dlp `upload_date`). At **16:41 on event day** Nataly Merezhuk (the ClickHouse judge) commented on TC-Pilot's Devpost: "Your YouTube video isn't available!" At 17:05 she commented on RentProof: "Your GitHub is missing" (Devpost comments API). So ClickHouse staff screened ClickHouse entries for completeness between 16:30 and 17:05. The deciding evidence must have been the **live finalist demos and Devpost text, not the videos.** London's equivalent is not observable. Its Devpost pages were created after the deadline (LicenseTrace 16:32, Basket 16:33, ResearchAgent 17:08 BST [V "started this project" stamps]). Lateness was evidently tolerated.

---

## 2. Comparison set

Selection: every ClickHouse winner, plus non-winners with real ClickHouse claims and a video. I also included the ClickHouse users that won *other* prizes, as halo controls.

| Event | Project | Result | Team (Devpost) | ClickHouse role (claimed → verified) | Video |
|---|---|---|---|---|---|
| NYC | **policyDiff** | **ClickHouse winner** (1st claimed) | 2 on Devpost, 3 git authors | Inter-service bus + `$ at risk` join; load-bearing [V round 1] | 119 s, uploaded 25 May |
| NYC | **TC-Pilot** | **ClickHouse + Top Overall** (2nd claimed) | 2 | Sole datastore + `avgIf/countIf` event-study page; near core [V round 1] | 263 s (over the 3-min limit), uploaded 24 May |
| NYC | PolicyPulse | lost | 2 | Policy snapshots + decision log; 4 MergeTree tables [V repo grep] | 178 s |
| NYC | zipsick | lost | 3 | Z-score anomaly SQL; TTL, `PARTITION BY`, `LowCardinality`, `countIf`, `uniqExact` [V repo grep] | 234 s |
| NYC | MindMesh | lost | 3 | Event table + **MV → AggregatingMergeTree** hourly rollup [V repo grep] | 220 s |
| NYC | Unsyphn | lost | 4 | ReplacingMergeTree snapshot history, partitions [V repo grep] | 306 s (over limit) |
| NYC | HealthGuard AI | lost | 1 | Claims "10 custom ClickHouse UDFs". **Repo has no ClickHouse code** (1 unrelated file mentions it); first commit 21 May [V repo] | 145 s, silent |
| NYC | RegRadar | Top Overall, not ClickHouse | 4 | ClickHouse console shown at length | 39 s, silent |
| NYC | Wage.MD | Nimble, not ClickHouse | 1 | Filings table + aggregating MV, "sub-100ms percentile queries" [V Devpost/video] | 205 s |
| NYC | Denial Rescue | Top Overall, not ClickHouse | 3 | "legal memory layer" [V Devpost] | unavailable (YouTube) |
| LDN | **LicenseTrace** | **ClickHouse + Prometheux** | 1 | One hardcoded audit row; **decorative** [V round 1 `server.js:622-640`] | 206 s |
| LDN | **SynapseCRO** | **ClickHouse winner** | 1 | Memory loop into 5 prompt sites, TTL, MV, `/clickhouse` page; load-bearing. Core product pre-dates the event [V round 1] | 87 s |
| LDN | Basket | Tavily, not ClickHouse | 3 | Week × category rollup + spike ratio; `uniqExact(source_url)` idempotence [V Devpost]. **No GitHub link on Devpost** [V] | 85 s, recorded 16:39 |
| LDN | Pulse (marketing-ops) | lost | 1 | Real-time GA4 funnel ingest into ClickHouse, agent polls it every tick, `avgIf`/`countIf`/`toStartOfMinute`, 14× `LowCardinality` [V repo grep]. **Platform pre-built 11–13 Jun**; one event-day commit at 16:24 [V git] | 151 s, silent |
| LDN | ResearchAgent | lost | 2 | Stores Q&A; History page reads it back [V Devpost]. No GitHub link [V] | 133 s Loom |
| LDN | Multiagent Market Monitor | lost | 1 | Price-fetch log in ClickHouse Cloud [V transcript] | 131 s |
| LDN | Agentic Workflow Compiler / Replay | Top Overall, not ClickHouse | 1 / 1 | "Cloud sink scaffolded, not demo-critical" / "integration was not completed before submission" [V Devpost] | 93 s silent / none |

---

## 3. Demo forensics

### NYC

**policyDiff (119 s, screen recording, one narrator).**
- Frames 0–45 s: a static dark hero page, "Payer Policy Change Monitor":
  - **$20.15M Total Revenue at Risk**, 11 tightening changes, **0 published evidence briefs**, 0 pending diffs.
  - An orange **"Trigger Demo Change"** button labelled "Use the demo path when live payer content is delayed or blocked upstream".
  - Badges "LIVE REFRESH EVERY 10 SECONDS" and "DATADOG TRACING ENABLED", plus **"LAST UPDATED 4:26:28 PM"**. It was recorded 4 minutes before the deadline, on localhost.
- ~52 s: bar charts of revenue by service line, change type and payer.
- ~67–112 s: scrolling "Classified policy changes" cards (BCBS Oncology Imaging, Cigna CT Colonoscopy, Humana Brain MRI…), each with a $ figure and a confidence.
- **No ClickHouse logo, badge or console appears; it is never spoken** [V frames + transcript, round 1].
- Problem stated at 0:00–0:12. The payoff number is on screen from frame 1 ($20.15M).
- Polish: high visual polish, flat narration, no live run.

**TC-Pilot (263 s, phone-filmed laptop at the table; sticky note "39" visible).**
- 0 s: laptop. ~16 s: a selfie of the presenter. ~33 s: "Paste your report." ~66 s: Datadog LLM Observability trace tree. ~82 s: "How are you feeling today?" symptom sliders. ~132–181 s: trial-finder text plus a terminal of API calls.
- **~214 s: "Population analytics — Real-time aggregation across all patients and symptom logs — powered by ClickHouse."** Cards: **3,026 patients · 387,139 symptom data points · 4,137 medication records**. Each card carries an "`xxx ms · CLICKHOUSE`" latency badge.
- **~232 s: tooltip "Ondansetron (Zofran) — Nausea, Before 5.2 → After 1.8, ▼3.4 pts improvement, 7,008 data points"** over a bar chart of "Symptom change in the 14 days after starting each medication". The narration says 3.74.
- ~247 s: a hand pointing at a spreadsheet-like table of rows.
- **ClickHouse is the last ~50 s and the only screen with numbers** [V frames]. Seconds to problem: ~5; to first live product: ~33.
- Polish: low (handheld, filler speech, over the limit). The wow is the quantified, ClickHouse-badged insight.

**PolicyPulse (178 s), the closest domain twin of policyDiff.**
- 0–56 s: PowerPoint slides with webcam inset:
  - "Prior Authorization Is Breaking Healthcare" (16+ hrs, 82%, 94%, 29%).
  - A sponsor slide with a ClickHouse box.
  - "$25.7B / 3B claims / 53M".
  - A KPI list.
- ~67–78 s: Streamlit page **"1. Policy Diff From Nimble vs Current Policy In ClickHouse"** (JSON diff + "Autonomous Monitor Status"). ClickHouse is named in the UI title and spoken at 0:20, 1:10 and 1:30 [V].
- ~120–170 s: JSON doctor uploads, "Relevant To Caught Diff" / "Not Relevant", "Payment Verification: Verified".
- Weaker than policyDiff on payoff: no single $ number on the product screen, and a raw-JSON UI.

**zipsick (234 s).**
- 0–205 s: a beautiful slide deck. "An autonomous community-signal agent for public health" → "Nothing currently watches the block itself" → prior art → "Observe → verify → act → publish → monetize" (ClickHouse labelled "Anomaly SQL").
- ~88–117 s: **"Not a viral post — a local deviation. ClickHouse compares the last six hours … against a 90-day baseline … z-score 3.41"**. Then "Four real NYC outbreaks, replayed end-to-end" and "Five primitives, one loop: Nimble · ClickHouse · Datadog · Senso · x402".
- **Only the last ~15 s show the product** (a ZIP heat map) [V frames]. Its ClickHouse story was arguably the best in NYC; the demo was a pitch deck.

**MindMesh (220 s).**
- 0–135 s: journaling app with a "ClickHouse · Datadog" header badge, wellness ring 80 → 43 on a sad entry.
- ~138–165 s: Datadog LLM Obs traces.
- **~179–193 s: ClickHouse Cloud SQL console, `SELECT * FROM wellness_events`, rows returned.** Spoken: "every event lands in click house … can tell when this is the third high-stress entry in an hour" [V].
- ClickHouse is shown as a table dump, not as an insight.

**Unsyphn (306 s).**
- 0–77 s: animated 3D cube landing page.
- Portfolio dashboard, then a Notion change card: "Data retention shrinks from 90 to 30 days. Per-seat pricing rises 18%". Evidence bundle.
- ClickHouse spoken once (~3:37). Ends off-script: "Take your trash with you … You give me 100 bucks, you can stay here" [V transcript]. Over the limit, rambling.

**HealthGuard AI (145 s, silent).**
- A dark multi-tab dashboard: 500 claims, $6.0M, 11.2% flagged, fraud by specialty, drug-safety alerts, trials, and a Lapdog LLM-observability tab. A small "ClickHouse Live" status pill sits in the header.
- No narration. The repo does not back the ClickHouse claims [V].

**RegRadar (39 s, silent; Top Overall).**
- "Compliance operations" dashboard (12 / 8 / 9 / 8 / 4 tiles, bar chart by policy). **~12–28 s: ClickHouse Cloud console showing `remediation_steps` and `regulations` tables.** ~20 s: Lapdog/Datadog log.
- It shows the ClickHouse console more than any NYC entry yet did not win the ClickHouse prize [V].

**Wage.MD (205 s, webcam bubble; Nimble winner).**
- Landing "The government already knows what tech pays", 13,435 DOL filings. **~77–90 s: "How it works — ClickHouse: sub-100ms percentile queries over the filings" (highlighted).** Then cited.md Google salary brief and a Counselor percentile report [V]. Spoken ClickHouse at 1:10.

**Denial Rescue:** YouTube returns "video unavailable" [V]. Not analysed.

### London

**LicenseTrace (206 s, screen recording, solo narrator).**
- 0–26 s: empty scanner while the hook plays ("hundreds of open source packages … GPL, AGPL").
- ~39 s: "Reasoning live with Prometheux…". ~51 s: red banner **"gatsby is legally exposed — a GPL-2.0 dependency (smartwrap) is reachable via this path"**. ~64–77 s: red contamination path lit through the graph.
- ~90 s: "Pay with x402 / Unlock with password". ~116 s: cited report (Goldman Sachs Engineering incident link).
- ~129 s: node-jose "not flagged". ~141–193 s: express "No contamination found — clean tree".
- **No ClickHouse on screen in any sampled frame.** It is spoken once at 3:02 ("logged in click house") [V frames + transcript].
- Seconds to problem: 0. Wow: the red path at ~60 s. Three-case structure.
- Polish: highest in the London set.

**SynapseCRO (87 s).**
- 0–22 s: slides "SEO & CRO that ships fixes" → "Automated today" → **"Technical stack: Fly.io · Supabase · Gemini · Langfuse · ClickHouse"**.
- ~27 s: landing page whose nav bar includes a **"ClickHouse" tab** (never opened). ~33–44 s: audit form ("Start full audit"). ~49 s: research list of prior audits. ~54–60 s: pre-run "ramcorp" report.
- **~70–81 s: a merged GitHub PR diff created by the agent.**
- ClickHouse is spoken once ("ClickHouse for its back end") [V]. The ClickHouse case lives in the Devpost "Sponsor Section" and on the `/clickhouse` page.

**Basket (85 s; macOS file name says recording started 16:39:45, nine minutes after the deadline).**
- **0–37 s: a static landing page** ("Catch a reformulation backlash in week two, not the quarterly review") while the team talks.
- ~43–48 s: agent steps running.
- ~53–58 s: result card **"Complaints about Reese's Peanut Butter Cups rose 8× after the February reformulation, peaking the week of Feb 16, 2026"**, Reformulation **Feb 17**, 2026 · Severity 8× baseline · **5 cited**. The peak week starts the day *before* the detected reformulation date; a judge looking closely would spot that contradiction. Weekly bar chart.
- **~69–85 s: blank dark screen** [V frames].
- ClickHouse is spoken once ("aggregates the volume by week by click house") [V transcript].
- The "real-time aggregation" ran over a handful of cited sources.

**Pulse, autonomous marketing-ops (151 s, silent).**
- Landing "Dashboards are full. Nobody reads them." Docs page "Server-side ingest" (curl to a collector).
- Analytics dashboard (902 visitors, $52,920, 13.86% conversion) with a "Pulse Agent · autonomous insights" feed. Realtime page.
- **~132 s: Gmail inbox showing "[Pulse · warning] Meta Ads: Heavy Spend on Low Conversion Likelihood Segment"**, i.e. the agent's real action [V frames].
- No narration. ClickHouse is not legible on screen at sampled resolution [I].

**ResearchAgent (133 s Loom).**
- Local `file:///…/index.html` pages. The "How it works" cards repeat four times.
- **~75 s: "Search History — All questions asked so far, in real time" is empty.** That page is the ClickHouse read-back.
- ~83–125 s: an About page of sponsor cards ("ClickHouse — Storage layer", Gensyn, Prometheux, Cursor) [V frames].

**Multiagent Market Monitor (131 s).** Webcam talking head and VS Code terminal. ~49 s: ClickHouse Cloud console with a 2-row `stock_prices` table. Spoken: "Every price fetch is being logged directly into ClickHouse Cloud" [V]. Generic idea.

GTM WarRoom (46 s, blurry phone video), News2Signal (32 s, silent tour) and Agentic Workflow Compiler (93 s, silent) show no ClickHouse on screen [V frames].

---

## 4. Rubric scorecard (1–5; predicted vs. actual)

Criteria are the published five, plus **Sponsor Fit** (how well the entry advances ClickHouse's own story: fast analytics, agent memory, "ship something real").

### NYC

| Project | Idea | Tech | Tool | Pres. | Auton. | **Sponsor fit** | Total | Actual |
|---|---|---|---|---|---|---|---|---|
| policyDiff | 5: named buyer (revenue cycle), $ at risk | 4: 3 services joined only by ClickHouse (round 1) | 4: Nimble, Gemini, Datadog, Senso | 3: polished UI, flat 119 s, simulated trigger | 4: scheduled scrape → classify → insert | **4**: ClickHouse is the bus and produces the $ number | **24** | **Won** |
| TC-Pilot | 5: newly diagnosed cancer patient | 4: ~6k lines; agent reads ClickHouse aggregates | 4: Claude, Datadog, Nimble | 3: handheld, 263 s; but finalist-stage winner | 3: background trial search; mostly user-driven | **4**: "powered by ClickHouse" page, ms badges, event-study SQL | **23** | **Won** (+ Top Overall) |
| Wage.MD | 4: DOL salaries vs Glassdoor | 4: aggregating MV | 4 | 3: clear, webcam | 3 | 4: "sub-100ms percentile queries" slide | 22 | Nimble only |
| zipsick | 4: public health | 3: TTL/partitions/z-score | 4 | 2: 205 s of slides, 15 s product | 3 | 4: the anomaly is a ClickHouse query | 20 | lost |
| RegRadar | 4: "$2M fine" | 3 | 4 | 2: 39 s silent video (live pitch unknown) | 3 | 3: console tables, no insight | 19 | Top Overall only |
| MindMesh | 4: mental health | 3: MV + AggregatingMergeTree | 3 | 3 | 2 | 3: console dump | 18 | lost |
| PolicyPulse | 4: same space as policyDiff | 2: Streamlit, 4 MergeTree tables, 9 commits | 3 | 3: 56 s of slides first | 3 | 2: snapshot store | 17 | lost |
| Unsyphn | 3 | 3 | 3 | 2: 306 s, rambling | 3 | 2: one mention | 16 | lost |
| HealthGuard | 3 | 1: ClickHouse claims unbacked; pre-event commits | 2 | 2: silent | 1 | 1 | 10 | lost |

**Prediction vs. outcome: match.** The two highest totals are the two winners. The NYC result is explainable without luck:
- **policyDiff** is the clearest "Makes your life better (fix issues from your job)" entry.
- **TC-Pilot** is the clearest "Impact in our community / improving lives" entry.
- The two winners map one-to-one onto the two published sub-themes, and the prize text says "**either of these categories will win first place**".

[I] The likeliest reading is one winner per theme. If so, the "1st vs 2nd" question is mostly a cash-allocation detail, not a quality ranking.

### London

| Project | Idea | Tech | Tool | Pres. | Auton. | **Sponsor fit** | Total | Actual |
|---|---|---|---|---|---|---|---|---|
| Pulse (mkt-ops) | 4: wasted ad spend → emailed fix | 4: real-time ingest; but pre-built 13 Jun | 4: Prometheux reads ClickHouse via JDBC | 2: silent | 4: agent polls ClickHouse every tick, emails | **5** on paper | **23** | lost |
| SynapseCRO | 3: local-business SEO | 5: 25k lines, GitHub App, cron | 4 | 2: 87 s, pre-run audit | 5: weekly re-audit, auto-PRs | **4**: memory loop, TTL, MV, `/clickhouse` page | **23** | **Won** |
| LicenseTrace | 5: named incident + lawsuits; legal stakes | 3: ~1.7k lines | 4: Prometheux real, Tavily real | **5**: tight three-case demo | 3 | **1**: one constant row | **21** | **Won** (+ Prometheux) |
| Basket | 4: reformulation backlash | 3 | 4 | 2: 37 s static, 15 s blank, date contradiction | 2: on demand | 3: week × category rollup over ~5 sources | 18 | Tavily only |
| Market Monitor | 2 | 2 | 3 | 3 | 3 | 2: insert log | 15 | lost |
| ResearchAgent | 2 | 2 | 2: six-sponsor sprawl | 1: local file, empty history | 1 | 2 | 10 | lost |

**Prediction vs. outcome: one miss.** The rubric predicts Pulse ≈ SynapseCRO > LicenseTrace. LicenseTrace won and Pulse got nothing. That disagreement is the most informative result in this file (§5, §7).

---

## 5. Differentiators

| Factor | Winners | Matched losers | Signal |
|---|---|---|---|
| **Overall-quality halo** | TC-Pilot also won Top Overall. LicenseTrace also won the £1,000 Prometheux "best overall" prize. **Both double winners at these events hold a ClickHouse prize** [V] | RegRadar and Denial Rescue (Top Overall, ClickHouse users) did **not** win ClickHouse. Nor did the London Top Overall winners, whose ClickHouse was "scaffolded" or "not completed" [V Devpost] | **Strong but conditional.** The halo carries a project only if ClickHouse is visibly wired into something. A top project with a placeholder ClickHouse is filtered out |
| **Fit to the prize's published framing** | NYC winners map one-to-one onto the two sub-themes (job pain / community impact) [V prize text] | PolicyPulse is the same theme as policyDiff with a weaker product; Unsyphn has a weaker job pain | Strong for NYC [I] |
| **One quantified payoff on the product screen** | $20.15M at risk (policyDiff); "Zofran ▼3.4 pts, 7,008 points, ms · ClickHouse" (TC-Pilot); "gatsby is legally exposed" plus the red path (LicenseTrace); merged PR (SynapseCRO) | PolicyPulse's raw JSON; MindMesh/RegRadar/Market Monitor console row dumps; Basket's 8× marred by a date contradiction | **Strong.** Every winner has a single "result" frame. Losers that "show ClickHouse" show a table, not an insight |
| **Showing the ClickHouse console** | None of the four winners shows the ClickHouse Cloud console [V frames] | RegRadar, MindMesh and Market Monitor all show it [V] | **Console screenshots do not win.** A product screen that credits ClickHouse ("powered by ClickHouse", ms badges) does |
| **Sponsor named in video** | 0 (policyDiff), ~50 s (TC-Pilot), 1 clause (LicenseTrace), 1 clause plus a slide (SynapseCRO) | PolicyPulse and zipsick name ClickHouse repeatedly | Weak to none. NYC videos were not even available at judging |
| **Product, not slides** | All four winners show the product within ~30 s (SynapseCRO after 22 s of slides) | zipsick: 205 s of slides; PolicyPulse: 56 s of slides; Unsyphn: 77 s of animated landing | Moderate |
| **Video length** | 87–263 s; TC-Pilot over the limit | Unsyphn 306 s | None |
| **Audio narration** | All four narrated | HealthGuard, Pulse and RegRadar are silent; RegRadar still won Top Overall live | Moderate for London, where demos may be judged from Devpost [I] |
| **Built during the event** | SynapseCRO's core pre-dates the event (8 scripted commits on 25 Jun) yet won [V round 1] | Pulse's platform pre-dates the event (11–13 Jun) and lost; HealthGuard pre-dates it and lost | **Not enforced consistently.** Pre-work alone neither disqualifies nor saves [V/I] |
| **Repo hygiene / submission completeness** | All four winners link public repos | Basket and ResearchAgent link **no GitHub repo** (required) [V]. RentProof was flagged for a missing GitHub by the ClickHouse judge [V] | Moderate: ClickHouse staff check completeness |
| **ClickHouse depth (code)** | decorative (LicenseTrace), load-bearing (policyDiff, SynapseCRO), near-core (TC-Pilot) | Deeper than LicenseTrace: Pulse, zipsick, MindMesh, Basket | **Depth does not discriminate** (round-1 finding confirmed) |
| **Domain** | Healthcare ×2 (NYC); legal/compliance + growth (London) | Healthcare losers are common too (PolicyPulse, HealthGuard, MindMesh, zipsick) | Weak: healthcare is crowded in NYC |
| **Team pedigree** | Each NYC winner has a member with a prior Devpost prize:<br>• Haris A (Rutgers ECE '26): **Dispatch, "Best Use of Datadog MCP", NYC AI Agents Hackathon, 4 Oct 2025** (same Datadog-hosted lineage).<br>• Manoj Sadanala (53 repos, 68 followers): **ClaimCrane, Chubb Challenge Prize, Stevens QuackHacks 2026**. [V Devpost profiles, GitHub API]<br>Both arrived with written specs (round 1). London winners are strong solo profiles:<br>• Abhiram Vinjamuri: Cambridge CS, **Palantir FDE**, ACL WiNLP 2025 paper [V portfolio].<br>• Joel Jeon: London founder ("Capability Factory"), GitHub created 2 Apr 2026, first Devpost entry [V] | PolicyPulse and MindMesh members: no prior wins. Basket's team of 3 has no other wins. Pulse: a self-described "Junior Software Engineer" [V]. HealthGuard: a serial submitter (8+ projects) | **Moderate.** Prior winners and senior engineers recur among winners. It is a proxy for preparation and demo craft, not causal on its own |
| **Sponsor-staff interaction** | ClickHouse judge reviewed TC-Pilot's Devpost during judging; the team fixed the video next day [V] | RentProof was flagged and lost; BasketIQ's teammate lobbied "Makes your life better!! @ClickHouse" in a comment and lost ClickHouse (won Nimble) [V] | Weak. Being on the radar is not enough |
| **Prize spreading** | TC-Pilot and LicenseTrace each took two prizes | Basket took Tavily; Wage.MD took Nimble | **No evidence of a one-prize-per-team rule** [V] |

---

## 6. Counterfactuals

**Losers: smallest change that plausibly flips the result.**
- **Pulse (London).**
  - Narrate the video.
  - Add one "ClickHouse caught this" frame (the query, ms, rows) next to the Gmail alert.
  - Disclose the pre-built analytics base and show what was built that day.
  - [I] Its ClickHouse story ("real-time state an agent polls every tick") is exactly the sponsor narrative. A silent video and a one-commit event-day history are the likely reasons it lost.
- **Basket (London).**
  - Fix the reformulation-date contradiction (peak week before the reformulation date).
  - Fill the 37 s static opening and the 15 s blank tail with a live run.
  - Link the repo.
  - Put a "week × category rollup — N rows, X ms, ClickHouse" caption under the chart.
  - [I] Basket won Tavily, so judges valued it. Its ClickHouse contribution was presented as one agent among five, over ~5 sources, which does not read as "best use of ClickHouse".
- **zipsick (NYC).** Swap 150 s of slides for a live run of the z-score query firing on a seeded outbreak. It had the best ClickHouse concept in NYC.
- **PolicyPulse (NYC).** Put a dollar or patient-impact number on the product screen and replace JSON blobs with a UI. Its direct competitor (policyDiff) had the same idea with "$20.15M at risk" as frame 1.
- **RegRadar / Denial Rescue (NYC Top Overall).** Turn the ClickHouse console into an in-product insight (e.g. "violations by regulation, last 30 days, 40 ms · ClickHouse"). They had the halo but no ClickHouse moment.
- **MindMesh (NYC).** Render the MV's "third high-stress entry in an hour" escalation in the UI instead of a `SELECT *` dump.

**Winners: what nearly cost them.**
- **TC-Pilot:** the video was unavailable when the ClickHouse judge checked (16:41) [V]. It runs 263 s against a 180 s limit. The headline effect is a seeder constant [V round 1]. A judge reading `admin.py` would have deflated the wow.
- **policyDiff:**
  - The demo trigger is synthetic and the $ inputs are hand-typed [V round 1].
  - The Devpost page was created at 16:33, after the deadline [V].
  - ClickHouse is never named in the video. Had judging relied on the video, it might have lost the sponsor attribution.
- **LicenseTrace:**
  - Its ClickHouse is one constant row [V round 1]. Any judge who asked "show me the ClickHouse data" would have seen a single Gatsby row.
  - [I] It survived because nobody asked, and because Prometheux judges and the room already rated it top-tier.
- **SynapseCRO:**
  - The core product's commits are dated the day before, against "Projects must be built during the event" [V round 1].
  - The video never opens the `/clickhouse` page.
  - A rule-strict panel, or a competitor protest, could have disqualified it.

---

## 7. Why each winner won (verdicts)

### policyDiff (NYC): ClickHouse winner, "1st" creator-claimed
1. **Best fit to the "Makes your life better — issues from your job" theme**, with a named buyer (hospital revenue-cycle teams) and a dollar payoff on frame 1 ($20.15M at risk). *High.* [V prize text, frames]
2. **ClickHouse is the system spine.** Three services talk only through ClickHouse tables, and the $ figure is a ClickHouse join. This is explainable in a live Q&A to a ClickHouse engineer judge (Nataly Merezhuk). *Medium-high.* [V round 1, Luma]
3. **Team preparation and pedigree:** per-engineer specs, a prior prize-winning lead, three people working in parallel. *Medium.* [V]
4. **Why 1st over TC-Pilot (if true):** unknowable. [I] Plausible reasons:
   - The NYC prize was explicitly two themes "either of which wins first place", so the cash may simply have gone to one theme.
   - TC-Pilot was already receiving Top Overall.
   - policyDiff's ClickHouse is more central to its core loop.

   *Low.*

### TC-Pilot (NYC): ClickHouse + Top Overall, "2nd" creator-claimed
1. **Overall-quality halo:** it was a Top Overall finalist and winner. Its live demo carried the room even with a handheld recording. *High* that the halo helped, but see the next item.
2. **But the halo alone was not sufficient.** Two other Top Overall winners used ClickHouse (RegRadar, Denial Rescue) and did not win the ClickHouse prize. TC-Pilot had a dedicated **"powered by ClickHouse" analytics screen** with per-card latency badges and a quantified event-study insight. *High.* [V frames, prize map]
3. **Best fit to the "Impact in our community/World, improving lives" theme** (cancer patients). *Medium-high.* [V prize text]
4. Sponsor-staff engagement on Devpost during judging. *Low.* [V comment]

### LicenseTrace (London): ClickHouse + Prometheux Intelligence Prize
1. **Overall-quality halo:** it won the £1,000 Prometheux "best overall project built with Prometheux". The best-told demo in the London set: named Gatsby/smartwrap incident, lawsuits, a red path proof, and three test cases. *High.* [V prize map, frames]
2. **A security/compliance audit framing where "ClickHouse logs every scan" sounds natural**, and nobody checked that it is a constant row. The ClickHouse judges were a DevRel director and a sales director. [I] That is a story-weighted panel, less likely to audit `server.js`. *Medium.*
3. **Weak competition among *well-presented* ClickHouse entries.**
   - Of the 27 London ClickHouse users, the deep ones lost on presentation or completeness: Pulse (silent, pre-built), Basket (static/blank video, date contradiction, no repo), ResearchAgent (empty history page, no repo).
   - The London Top Overall winners had not finished their ClickHouse integration.
   - *Medium-high.* [V frames, Devpost]
4. **Why it beat Basket's real aggregation pipeline:**
   - LicenseTrace's demo was strong and Basket's was weak.
   - Basket's ClickHouse was one of five agents, over ~5 sources.
   - Basket already took Tavily.
   - Depth of ClickHouse code was not what the panel rewarded.

   *Medium.*

### SynapseCRO (London): ClickHouse winner
1. **The most complete ClickHouse sponsor narrative in the written submission:**
   - a "Sponsor Section";
   - a memory loop that feeds ClickHouse aggregates into five prompt sites;
   - TTL and an MV;
   - a judge-facing `/clickhouse` page.

   ClickHouse's own pitch is "the leading database for AI" (Luma). *High.* [V round 1, Luma]
2. **Autonomy and technical maturity:** weekly re-audits, a GitHub App, auto-PRs. The video's payoff is a merged PR. It scores top marks on Autonomy and Tech (40% of the criteria). *Medium-high.* [V frames]
3. **Senior builder:** Cambridge CS, Palantir FDE. *Medium,* as a proxy for execution speed.
4. The pre-built core helped it reach that maturity and was not penalised. *Medium.* [V round 1]

---

## 8. What this means for tomorrow's Cyberdefense entry (9 Oct)

1. **Expect a crowded ClickHouse field.** 60 of 75 (NYC) and 27 of 46 (London) used it. Using ClickHouse is table stakes; you need a reason to be *the* ClickHouse entry.
2. **Aim to be a top-3 overall project first.** Both double winners hold a ClickHouse prize, so ClickHouse judges pick from the projects the room already rates highly. But make sure ClickHouse is visibly wired. Top Overall winners with placeholder ClickHouse got nothing from ClickHouse.
3. **Build one product screen that credits ClickHouse with an insight, not a console.** For example:
   - "Exposure fell from 37 → 4 internet-facing assets after rule X, 210k events, 38 ms · ClickHouse"
   - an event-study bar chart with ms badges (TC-Pilot pattern).

   No winner showed the ClickHouse Cloud console; three losers did.
4. **Put the payoff number on the first product frame** (policyDiff's $20.15M) and narrate the video. Every winner was narrated. Silent losers include the strongest London ClickHouse story (Pulse).
5. **Match the prize's wording if it has themes.** NYC's two winners mapped one-to-one onto the two published ClickHouse themes. Check the Cyberdefense ClickHouse prize text tonight and name the theme in the Devpost title or tagline.
6. **Demo the product within 20–30 s.** zipsick and PolicyPulse lost with slide-first videos.
7. **Be complete by 16:30:** public repo, working video link, Devpost page created. ClickHouse staff flag missing GitHub and video links during judging [V]. Late creation was tolerated, but a broken video link was noticed.
8. **Do not rely on "nobody will check".** LicenseTrace's constant row and SynapseCRO's pre-dated core survived a DevRel/sales panel. A Cyberdefense panel with Semgrep and Pi engineers is more likely to read code [I]. Make the ClickHouse path real, and build on the day (or disclose prep).
9. **Write a Devpost "ClickHouse" section** explaining *why ClickHouse*: memory loop, TTL on verdicts, an MV for rollups, a challenge you hit. SynapseCRO won largely on its written sponsor case and a `/clickhouse` page.
10. **Prepare like the NYC winners did:** per-person contract specs, a rehearsed build, and at least one person who has shipped a winning hackathon demo before.

---

## 9. Uncertainties

- **Ranks are unpublished.** "1st/2nd" for policyDiff and TC-Pilot are creator claims (LinkedIn, inaccessible to Firecrawl). London ranks are unknown. That NYC's two winners map to the two sub-themes is inference from the prize text.
- **Live judging was not observed.** NYC judged finalists live from 17:00; the London format is unknown. Because NYC videos were uploaded after the event, video forensics there describe what the teams *recorded*, not what judges saw.
- **Scorecards are mine,** derived from frames, transcripts, Devpost text and round-1 code reads. No official scores exist.
- **The ClickHouse-user counts are a heuristic** (Built With tag or ≥2 story mentions). Devpost does not publish which prizes each project opted into, so the true number of ClickHouse-prize applicants may be lower.
- **Transcripts:**
  - Five videos are silent (HealthGuard, Pulse, RegRadar, News2Signal, Workflow Compiler) [V volumedetect].
  - zipsick, GTM WarRoom and ResearchAgent have audio but no captions, and local Whisper failed (broken torch install). Their analysis is frames-only.
  - Denial Rescue's video is unavailable.
- **Loser repos** (Pulse, PolicyPulse, HealthGuard, MindMesh, Unsyphn, zipsick) were checked only by shallow grep and git log, not full reads. Basket and ResearchAgent have no linked repo.
- **Pedigree:**
  - LinkedIn could not be fetched. Backgrounds come from Devpost profiles, the GitHub API and personal sites.
  - Abhiram Vinjamuri's Palantir/Cambridge profile is from his own portfolio site.
  - "Prior prize" counts only Devpost-listed wins.
- **The Basket recording time (16:39)** comes from the macOS file name in the YouTube title. Basket still won Tavily, so lateness did not make it ineligible.
- **The TC-Pilot tooltip value** reads ▼3.4 pts in a blurry frame; the narration says 3.74.
