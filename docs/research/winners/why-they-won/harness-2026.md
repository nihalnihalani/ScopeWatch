> Imported historical analysis; current ScopeWatch architecture/contracts govern the build.

# Harness Engineering Hack (12 Jun 2026): why the ClickHouse and Guild winners won

Round-2 matched analysis. Analyst pass on 8 Oct 2026. Read-only. **[V]** = verified (source given). **[I]** = inference.
Builds on round 1: `analysis/clickhouse/{seconds-ai,aerorider,earwitness}.md`, `analysis/clickhouse/_DEVILS_ADVOCATE.md`, `analysis/guild-ai/{magpie,dailygate,propr}.md`, `analysis/guild-ai/_DEVILS_ADVOCATE.md`. Code findings from round 1 are cited, not redone.

> **Disclosure that changes how to read this file.** IncidentSherpa, the key ClickHouse/Guild loser, is this user's own team's entry. Its Devpost repo link is `github.com/nihalnihalani/harnesshack`, and the commits are by `nihalnihalani` (IST) and Charlie Gillet (PDT) **[V]** (Devpost page; `git log`). Read §6 with that in mind: it is a post-mortem on our own loss, written as neutrally as I could.

---

## 1. Event context

| Item | Fact | Source |
|---|---|---|
| Venue, date | AWS Builder Loft SF, Fri 12 Jun 2026. Doors 9:30, hack from ~10:00, **submission 4:30 PM**, **demos 4:30–5:00 PM**, awards 7:00 PM | [V] harness-hack.devpost.com, luma.com/harnesshack |
| Pool | **78** gallery projects, **187** participants | [V] Devpost; 78 project pages in scratchpad |
| Sponsor reach (Devpost "Built With") | ClickHouse **45/78**, Guild **24/78**, Langfuse **19/78** | [V] parsed tags from all 78 pages |
| Criteria | Idea, Technical implementation, Tool Use, Presentation (3-min demo), **Autonomy** ("act on real-time data without manual intervention"): 20% each | [V] Devpost |
| ClickHouse prize | $1,600, 3 winners: Team #1 $1,000 + $500 credits; Team #2 $500 credits + $250; **"$500 … for the most impressive use of Langfuse"** | [V] Devpost |
| Guild prize | "Most Innovative Use of Agents (Guild.ai)": $2,000, 1 × $1,000 (1st), 2 × $500 (2nd) | [V] Devpost |
| Overall | "Top 2 Overall Winners", 2 slots, no cash amount stated | [V] Devpost |
| Judges (Luma) | 22 listed. Guild: **Killian Murphy (VP Eng)**. Langfuse: **Lotte Verheyden (DevRel)**. **No ClickHouse employee is listed as a judge**; Zoe Steinkamp (ClickHouse Sr DevRel) is listed as a *speaker*. Corbett Waddingham (Guild DevRel) is a speaker. Others: Anthropic, Stripe, Snorkel, Nvidia, AWS, Oracle, Snowflake, Gap, LinkedIn engineers, plus Airbyte/Pioneer/Jua/TrueFoundry/Composio/Thesys/Render staff | [V] luma.com/harnesshack (scraped 8 Oct) |
| Judging mode | Invitation-only judges. The in-room PA audible in Magpie's video at 2:07–2:20 says "less than 10 minutes left to submit … If you are a general judge, not a sponsor judge, a general judge, please come" | [V] Magpie transcript. So there were **separate general and sponsor judges** [V], and recording/booth demos happened concurrently with the deadline [I] |
| Team sizes in set | 1–4 (table §2) | [V] Devpost "Created by" |

**Every prize label in the gallery** (scraped `winner label` markup on all 78 pages) **[V]**:

| Project | Prizes |
|---|---|
| **AeroRider** | Best Use of ClickHouse **+ Top 2 Overall** |
| **SilverShield / FDA SafetyNet** | Airbyte **+ Top 2 Overall** |
| seconds ai | ClickHouse |
| EARWITNESS | ClickHouse (README: "Best use of Langfuse") |
| Magpie, DailyGate, proPR | Guild |
| **IncidentSherpa** | **Best use of Senso.ai** |
| SayHello, Hestia | Airbyte |
| Agent Negotiation Platform | Pioneer |
| AI Manager | Composio |
| FarmaWatch | TrueFoundry |
| OpenBeats | OpenUI |

Correction to round 1: `_DEVILS_ADVOCATE.md` and `MASTER_REPORT.md` say IncidentSherpa "lost". It lost ClickHouse, Langfuse and Guild, but **won Senso.ai** (a prize its own plan did not even list: `final-plan.md:34-46` in its repo) **[V]**.

**Overall winners vs sponsor winners:** both overall winners also won a sponsor prize (AeroRider: ClickHouse; SilverShield: Airbyte). No Guild winner placed overall. The halo ran overall → sponsor, or both were driven by the same quality. **[V]** for the overlap, **[I]** for direction.

---

## 2. Comparison set

Submission/recording times are YouTube upload timestamps converted to PDT **[V]** (yt-dlp `timestamp`).

### ClickHouse (+ Langfuse slot)

| Project | Result | Team | Video (len, uploaded) | CH depth (round 1 / my check) | Other sponsors named |
|---|---|---|---|---|---|
| **seconds ai** | CH winner (rank unpublished; Team #1 by elimination if AeroRider's 2nd is true) | 4 | 143 s, 16:40 | Load-bearing views (`case_signals`), never on screen | Guild, Firecrawl, Pioneer, Composio*, Render, Senso* (*claimed) |
| **AeroRider** | CH winner, **creator-reported 2nd**; **Top 2 Overall** | 1 author | 143 s, 16:44 | Deepest: 3 MVs, AggregatingMergeTree, H3, TTL, ExternalData | ClickHouse only (+Gemini) |
| **EARWITNESS** | CH umbrella, self-reported **Langfuse slot** | 1 | **84 s**, 16:31 | Thin: 3 MergeTree tables; MV console-only | Langfuse, CDP/x402, Senso, Airbyte, Pioneer, OpenUI |
| IncidentSherpa (ours) | Lost CH/Langfuse/Guild; **won Senso** | 2 (1 presenter) | **183 s**, **17:45** | Real `lagInFrame` causal SQL (`libs/clickhouse/causal.py:65-66`); plain MergeTree (`libs/clickhouse/schema.py:16,27,41`) | 9 sponsors |
| SilverShield / FDA SafetyNet | Airbyte + **Top 2 Overall**; not CH | 1 (Devpost) | 120 s, 16:02 | **Chained MVs**: recall insert → join 1M prescriptions → geo rollup (`phase3_lakehouse/02_materialized_view.sql`) | Airbyte, OpenUI; "Guild.ai" is the *guildai* ML-experiment pip package, not the sponsor (`requirements.txt:22`) |
| Theta Desk | No prize | 1 | 175 s, **16:56** | ReplacingMergeTree + SQL factor screen (`services/pipeline/db.py:9-37`) | Airbyte, Senso, x402, Render, OpenUI |
| Ghost Churn | No prize | 1 (Devpost) | **237 s, silent** (mean volume −90 dB) | Devpost claims an MV "decision engine"; repo has **no DDL**, ClickHouse is only a webhook source; a `.env` with CH/Langfuse key names is committed (`backend/.env`) | Airbyte, Senso, OpenUI, Render, Langfuse |
| ThreatLens, Chain of Custody | No prize | 1 each | none / video unavailable | Claimed only (not checked) | — |

### Guild

| Project | Result | Team | Video | Guild depth (round 1 / DA) |
|---|---|---|---|---|
| **Magpie** | Guild, **creator-reported 1st** | 2 | 193 s, 16:24 | 4 tool-less one-shot `llmAgent`s (`tools: {}`), real sessions API |
| **DailyGate** | Guild (2nd by elimination [I]) | 2 | 150 s, 16:30 | Deepest: tool-scoped tier agents (`pick()`), but judged version took no real actions and the UI ran a scripted `/demo/run` |
| **proPR** | Guild (2nd by elimination [I]) | 1 listed | **none** | Unknown (no repo, no video) |
| NightCrawler | No prize | 4 | 182 s, 16:33 | Real `ui_prompt` gate that auto-approves on failure (DA §3) |
| MCP Server Auditor | No prize | 2 | 90 s, 16:18 | Guild as REST audit sink; allow/deny is local (DA §3) |
| RepoToon | No prize | 1 | 110 s, 16:07 | Real GitHub-release webhook trigger + `gitHubTools` (DA §3) |
| Odette | No prize | 3 | 135 s, 16:28 | `pick(guildTools)` + Composio (DA §3) |
| IncidentSherpa (ours) | No Guild prize | 2 | 183 s, 17:45 | Guild sink built; **"DEGRADED — Guild not configured"** on screen (§3) |

RedBot: not analysed (out of scope). Akash: out of scope.

---

## 3. Demo forensics

Method: yt-dlp (mweb client) low-res download, frames every 10 s (`ffmpeg fps=1/10`), contact sheets plus full-size crops read with the Read tool; transcripts from auto-captions. Frame "fN" = the Nth 10-second frame (≈ (N−1)×10 s). Videos stayed in the scratchpad.

### seconds ai (143 s) [V frames f1–f14, transcript]
- **f1–f9 (0:00–~1:30): a static GitHub README architecture diagram** ("Public data sources → Guild.ai agent orchestration (Ingestion agent, Pioneer agent) → **ClickHouse: shared storage, full provenance** → Render (Composio, Senso.ai) → Attorney email / cited.md"), with **all four team members on webcam, wearing event lanyards, holding a mic**. Menu-bar clock reads 4:34 PM, i.e. recorded after the deadline.
- f10 on: live hosted app `seconds-ai.onrender.com`: "20/417 showing", "20 high confidence", "100.0% avg Pioneer", ranked signals ("fdcpa violation … CRITICAL … Pioneer confidence 100%"), then the "Legal signals, surfaced early." landing page.
- Timeline: problem stated by 0:13; insight "50 different people … that's a class action forming" 0:15–0:29; **first ClickHouse in speech 0:46**, on screen from f1 (diagram); payoff "hundreds of millions of dollars" (0:33) and the phone notification with "how much money they can potentially make" (2:07–2:12). Ending: "Thank you so much for watching."
- Wow moment: the phone notification (spoken; the phone itself is not visible in the frames I sampled).
- Polish: medium. Live product appears only after ~90 s; the first half is a diagram.

### AeroRider (143 s) [V frames f1–f14, crops f8, f10]
- Real product from second 1: a light-theme Leaflet map of SF with green/orange station dots and a "Plan a cleaner route" card. No slides, no face.
- 0:13 destination entered; 0:26–0:47 narration "each route is sent to **Click House cloud** as hundreds of GPS points … scores the entire full ride" while routes draw.
- f8 (~1:10): result card "Shortest: Air High, Exposure 0% lower" vs **"Recommended: Balanced … Air Elevated, Exposure 10% lower"**.
- f10 (~1:30): hidden "What Happened" drawer: "Latest route evidence loaded in 368.5 ms. Last refresh **04:41:44 PM**", "Camera checks 2 / 2 hazard", "**Live bikes 45505 near route**", and two Gemini camera verdicts, both labelled "**TVD01 — I-80 : Fremont**", "Hazard, 85%, 0.7 km". So the camera evidence on screen comes from a freeway camera ~35 mi from the SF route, and the bike count is the overcount round 1 flagged.
- f14 (~2:10): QUERY tab with a SQL CTE (`incoming_points`, `arrayJoin(h3kRing(route_h3_cell, 1))`, `active_visual_hazards`). Round 1 found this is a display copy, not the executed SQL (`frontend/app.js:1153-1215`).
- Recorded at ~4:41 PM (drawer clock), uploaded 16:44: after the deadline.
- Wow: "the AI is not just chatting with the user. It changes the route decision" (1:51–2:01). Clean, calm, single narrator, no "um" storms.

### EARWITNESS (84 s) [V frames f1–f8, crop f1]
- Live local app (`127.0.0.1:5173`), editorial typography: "The agent that pays for what actually aired." KPI row: **Verified total 422 · Lies caught 217 · Earned $0.36 · Paid out $2.97 · Agent margin −$2.61**; "Playlists lie. The signal does not."; "$0.01 USDC" artist payment rail; tx hash "0x7905…2e43"; a step strip ending "Ready for judge". Later frames: "Night Window — locked (1.00) → Night Window 100%" fingerprint match and a raw JSON evidence pane; counters tick 422 → 424.
- **ClickHouse and Langfuse are never named or shown** in the video (transcript and frames). Recording filename "Screen Recording 2026 06 12 at 4 29 21 PM": 1 minute before the deadline.
- Devpost story is **3 sentences** (44 words) **[V]**; Devpost entry created 16:34 PDT.
- Wow: "basically Shazam with the wallet and a conscience" (0:39) plus a live payout.

### IncidentSherpa (ours, 183 s) [V frames f1–f18, crops f4, f14; transcript]
- Every frame has a webcam bubble of the presenter. The UI is a dense dark "ops command center": typed event logstream, causal graph ("PAYMENTS-DB-PRIMARY → precedes by 2m 15s → PAYMENTS-SERVICE → precedes by 55s → CHECKOUT-SERVICE"), "SHOW SQL" popover with real `avg(value) OVER baseline`, `stddevPop(value) OVER baseline` window SQL (f10).
- **Visible failures on screen:**
  - f14: red row "**00:41:02 DEGRADED — guild — Guild not configured: set GUILD_WORKSPACE (workspace UUID) … BUILD-STATE.md B1**". The sponsor we planned as the largest prize shows as broken, with an internal file name.
  - f4: "SUGGESTED INCIDENT COMMANDER: **(name not parseable from cited doc)**".
  - f16: tile "Airbyte Context Store: **SKIPPED — NOT CONFIGURED (B5)**".
  - f15: Langfuse home: 6 traces, **$0.00 model cost, 0 scores**.
- Speech: "Um this is incident chairpa" (0:02); ~40 "um/uh"; "it has like a … fake engineer I guess fixing like nine of the last 12" (2:10); ClickHouse gets ~15 s (1:24–1:45): "click house finds the real cause … this is actually like a real database query not just some guess by an AI". Ending (f18): the presenter pastes the postmortem into Apple Notes.
- Length **183 s** (over the 3-min requirement). **Uploaded 17:45 PDT**, 75 minutes after the deadline and after the 4:30–5:00 demo window; the repo has commits until 17:23 (`4677971`, "drop Render tab (dropped this hack)") although the Devpost still lists Render **[V]**.

### SilverShield / FDA SafetyNet (120 s) [V frames f1–f12, transcript]
- f1–f2: the real openFDA "Drug Enforcement Overview" page (proof of a real data source). f3 on: a clean, light dashboard with a **9-step progress strip** (FDA recall → Ingested → Severity → Cohort → Drafted → Dispatched → Alert card → Done), a US choropleth map, KPI "**1,402** patients · **51** states · **1,222** pharmacies", header "158 recalls · 1,000,000 prescriptions · 5,000 pharmacies", and a red "**LETHAL RECALL — CLASS I** … Your medication has been recalled … WHAT YOU SHOULD DO" patient card. f4 shows the run starting from zero (0/0/0) after "Launch live defense".
- Narration is tight and scripted: problem by 0:20; live by 0:32; "matches the drug against a database of 1 million patient prescriptions … in real time" (0:57); privacy point (1:26); "**click house** and air bite matching a million records in seconds" (1:39). Ends at 2:00 on "A government alert turned into a real life saved."

### Theta Desk (175 s) [V frames sampled, transcript]
- Scripted, fast narration (likely read or TTS-like); "Airbyte pipes … 4,000 live option contracts into **click house** cloud … all the vector math lives in SQL not Python" (0:48–1:07); payoff "SOFI … 76.6% annualized yield"; x402 bot buys the sheet for $0.01. Uploaded 16:56, 26 minutes late **[V]**. Five-sponsor roll-call at the end.

### Ghost Churn (237 s) [V frames f1–f24, audio]
- **No audio track content** (−90 dB). Same dark terminal UI cycles: six account cards (ARR $48,000 …), "Early Warning: Acme Corp ↓ 67%", "Save offer ready for Acme Corp … APPROVE & SEND / Edit offer / Escalate to CSM". Never shows ClickHouse. 57 s over the limit.

### Magpie (193 s) [V frames f1–f19, transcript]
- f1–f6 (0:00–~1:00): the **GitHub README** ("Magpie … every snippet is classified … by a **Guild.ai agent** and streamed into **ClickHouse**"), ASCII architecture (watcher → Guild agents classify/chat/summarize/refile → ClickHouse `clipboard_events` → Next.js + OpenUI). The final README line on screen: "Everything intelligent runs through **Guild agents** (one platform)."
- Sponsor roll-call in speech at 0:26 ("guild AI that runs the agents. Every clipboard copy is a live agent invocation"), 0:43 ClickHouse, 0:54 OpenUI.
- f7–f8: VS Code terminal starts `watcher.py`. f9–f13: Wikipedia "Computer security" with highlighted paragraphs being copied. f15 (~2:20): dashboard "32 / 9 / 5" and notebooks including **"Cybersecurity"**; f16 opens it with the just-copied paragraph. f17–f19: "Neural Networks" notebook → "Summarize this notebook" → a generated summary.
- PA announcement over the demo at 2:07 confirms in-room recording minutes before the deadline. Ends mid-sentence ("That's about").
- Wow: copy text → a new notebook appears. Guild itself (app.guild.ai, sessions) is **never on screen**.

### DailyGate (150 s) [V frames f1–f15, transcript]
- Every frame is one light web dashboard (Safari, `localhost`, clock 4:27–4:28 PM): header "**2.3 hrs saved · 14 acted alone · 4 categories trusted**", "How the agent learns" four-step diagram (Work arrives → Trust gate → Agent acts → Score improves), "Agent execution — live" with demo buttons (gh-412 duplicate issue, gh-399 stale nudge, email-7 thank-you, email-3 hiring decision), per-category Bayesian bars with "always escalates" on candidate-decision, an "Acted autonomously" feed and "Time saved by the agent 2.3".
- **No live run is triggered on camera**, no Guild UI, and **"Guild" is never spoken** (transcript). Only "composio" is named (0:47).
- Payoff numbers at 2:10: "2.3 hours have been saved. 14 things have been acted alone autonomously … four categories".

### NightCrawler (182 s) [V frames f1–f19, crops ~0:52 and ~1:15; transcript]
- Polished dark "Conspiracy Board" with flight/filing/options cards (Tim Cook → Beijing, Jensen Huang stayed home, "NVDA put-volume spike +500%") converging on "High-confidence signal".
- ~0:52: modal "**GUILD APPROVAL REQUIRED** — Publish market-moving intelligence? … Approve & Publish". From ~1:15 to the end, the left panel reads "**Approval request failed**" in red. The narration still says "I hit the guild AI approval button. Instantly, Composio publishes…" (2:27).
- Strong scripted hook ("don't read the news. Watch the sky"), but the domain is trading on tracked private jets, and the payoff is a backtest on 4-week-old data.

### MCP Server Auditor (90 s) [V frames f1–f9, transcript]
- Dense dark report UI: "x402 — payment required to run this audit · Pay $0.10", six prober cards (Path Traversal, Credential Leakage, Tool-Description Poisoning, Excessive Scope, Unvalidated Outbound, Schema Control), "AUDIT REPORT 5 / 1 CRITICAL / 4 HIGH" findings list.
- Narration is even and scripted, against "a seeded vulnerable MCP target" with a clean negative control (0:58). **Guild is never named**; it says "every probe goes through the governance gate" (0:29–0:39). A competent security demo with no sponsor moment and no human stakes.

### Odette (135 s) [V transcript only]
- Unscripted, multi-voice and halting ("Yeah. So yeah and then you can say uh like iPhone uh uh 13 Pro, I don't know 15 Pro"). Guild named once at 1:15 ("we use guild AI for creating our agents"). Ends "okay I think … thank you very much".

### Not reviewed
- RepoToon (B34gUPPU_N8, 110 s): video downloaded, no captions available; frames not reviewed. proPR: no video exists. Chain of Custody: "This video is unavailable" **[V]**.

---

## 4. Rubric scorecard (predicted vs actual)

Scores are 1–5 on the five 20% criteria plus Sponsor Fit (SF) for the prize in question. Total = sum of the five criteria (max 25). Evidence column gives the deciding citation per row.

### ClickHouse

| Project | Idea | Tech | Tool | Pres | Auton | **Total** | SF (CH) | Key evidence | Predicted | Actual |
|---|---|---|---|---|---|---|---|---|---|---|
| AeroRider | 4 | 4 | 5 | 4 | 2 | **19** | 5 | Route flips on a CH query over AI-written rows (`main.py:359-388`); clean live map from 0:01; button-driven (Auton 2) | 1st | **2nd (claimed) + Top 2 Overall** |
| SilverShield | 5 | 4 | 4 | 5 | 4 | **22** | 4 | Lethal-recall card, 1M rows, chained MVs; tight 2:00 | 2nd *(if entered)* | not a CH winner; Airbyte + Overall |
| seconds ai | 5 | 3 | 4 | 3 | 4 | **19** | 3 | Class-action money story; "fires on a schedule … no human"; diagram for ~90 s; CH never shown in action | 3rd | **CH winner (1st if AeroRider is 2nd)** |
| IncidentSherpa | 4 | 4 | 4 | 2 | 3 | **17** | 4 | Real causal SQL, shown; but DEGRADED rows, "fake engineer", 183 s, uploaded 17:45 | 4th | lost (won Senso) |
| Theta Desk | 3 | 4 | 4 | 3 | 4 | **18** | 4 | SQL factor screen; scheduled; upload 26 min late | 4th–5th | lost |
| EARWITNESS (CH lens) | 5 | 3 | 2 | 3 | 5 | **18** | 1 | CH never named in video; 3 plain tables | not a CH winner | **CH umbrella (Langfuse slot)** |
| EARWITNESS (Langfuse lens) | — | — | 5 | — | — | — | 5 (Langfuse) | Public traces, scores, sessions, audio media (round 1 §4) | Langfuse slot | **Langfuse slot** |
| Ghost Churn | 4 | 2 | 2 | 1 | 3 | **12** | 1 | Silent 237 s video; no CH DDL in repo | out | lost |

### Guild

| Project | Idea | Tech | Tool | Pres | Auton | **Total** | SF (Guild) | Key evidence | Predicted | Actual |
|---|---|---|---|---|---|---|---|---|---|---|
| DailyGate | 5 | 3 | 4 | 3 | 4 | **19** | 5 | "Earns autonomy" = Guild's "control plane" story; `pick()` tiers; but no live run, Guild never said | 1st | **2nd (by elimination)** |
| Magpie | 4 | 3 | 3 | 4 | 4 | **18** | 3 | Ctrl+C → card, recorded live; "every clipboard copy is a live agent invocation"; `tools: {}` | 2nd | **1st (claimed)** |
| NightCrawler | 4 | 3 | 3 | 4 | 3 | **17** | 4 | Guild approval modal, then "Approval request failed" for 2 min | 3rd | lost |
| IncidentSherpa | 4 | 4 | 3 | 2 | 3 | **16** | 3 | "Guild not configured" row on screen | 4th | lost |
| MCP Auditor | 4 | 3 | 3 | 3 | 3 | **16** | 2 | Security theme; Guild only as audit sink and never named in the video ("governance gate") | 5th | lost |
| Odette | 3 | 2 | 3 | 1 | 3 | **12** | 3 | Halting unscripted demo; Guild named once at 1:15 | out | lost |
| proPR | ? | ? | ? | ? | ? | — | ? | No repo, no video, 62-word Devpost | unscorable | **2nd (by elimination)** |

### Where prediction and reality disagree (the informative part)

1. **seconds ai over AeroRider for CH Team #1 (if AeroRider's "2nd" is true).** My rubric ties them at 19 and AeroRider wins on Sponsor Fit. Three things plausibly flipped it [I]: (a) **Autonomy**: seconds ai said "autonomous agent fires on a schedule. There's no human in the loop" (0:40–0:44), AeroRider's whole demo is a user pressing "Find Healthiest Route"; (b) **spread of awards**: AeroRider already took a Top-2 Overall slot, and a 4-person team in the room with a hosted URL is a natural Team #1 pick; (c) **no ClickHouse employee is on the judge list** [V], so whoever scored "Best Use of ClickHouse" may have been general/other-sponsor judges who reward story over engine depth. The rank itself rests only on Mukunth's LinkedIn post [round 1].
2. **EARWITNESS took the ClickHouse umbrella with no ClickHouse in its video.** Explained by the prize structure: a $500 Langfuse sub-slot, judged with a Langfuse DevRel judge on the panel [V Luma], and EARWITNESS was the most complete Langfuse build [round 1 §4]. Our plan rated that slot "essentially uncontested, 72%" (`final-plan.md:40`). It was contested by a single-purpose Langfuse showcase.
3. **Magpie over DailyGate.** DailyGate's idea is the better Guild fit, but its video is a static dashboard with no live action and never says "Guild". Magpie shows a live cause → effect in the room and says "Guild AI runs the agents … every clipboard copy is a live agent invocation" in the first 30 s. Guild's judge was the VP Engineering, whom Magpie thanked by name afterwards [round 1 §8.5].
4. **SilverShield not winning CH.** Its ClickHouse use (chained MVs firing on insert, 1M-row join) is arguably the most "ClickHouse-native" product in the set, and it scored highest overall. Its Built-With omits ClickHouse (tags: agents, openai, python) [V]. Most likely it was not opted into the CH prize, or judges avoid stacking [I; unknowable]. Our own repo notes an organizer slide: "MUST tick each sponsor prize on Devpost or forfeit it" (`010df93`).

---

## 5. Differentiators

| Factor | CH winners (seconds, Aero, EARW) | CH losers (Sherpa, Theta, Ghost) | Guild winners (Magpie, DailyGate) | Guild losers (Night, MCP Aud, Sherpa) | Signal |
|---|---|---|---|---|---|
| Video ≤ 3:00 and in by ~16:45 | 3/3 (143, 143, 84 s) | 0/3 (183 s & 17:45; 175 s & 16:56; 237 s) | Magpie 193 s; DailyGate 150 s | 2/3 | **Strong for CH.** Every CH loser broke length or timing |
| On-screen sponsor failure | 0 | Sherpa: "DEGRADED", "not parseable", "SKIPPED" | 0 | Night: "Approval request failed"; Sherpa: "Guild not configured" | **Strong.** Only losers showed broken sponsor integrations on camera |
| Clear emotional idea in < 30 s | 3/3 (class action $, lungs, artists paid) | partial | 2/2 | 2/3 | Weak (everyone had one) |
| Quantified payoff on screen | 10% lower exposure; $ payout; 422 verified | Sherpa: none spoken; Theta 76.6% | 2.3 hrs / 14 acted | Night: backtest | Medium |
| Sponsor named in first 60 s of speech | seconds 0:46, Aero 0:28, EARW **never** | Sherpa 1:24 (CH) | Magpie 0:26, DailyGate **never** | Night 0:58 | Weak (2 of 5 winners never named it) |
| Sponsor count named | seconds 6, Aero 1, EARW 0 in video | Sherpa 9, Theta 5 | Magpie 3, DailyGate 1 | Night 6 | Medium: 9-sponsor tour is the outlier loser |
| Delivery | Calm or team-shared | Halting ("um" ×~40) / silent / fast-read | Calm | Polished (Night) | Medium |
| Live product from second 1 | Aero, EARW yes; seconds no (diagram ~90 s) | Sherpa yes | DailyGate yes (static); Magpie no (README 60 s) | Night yes | **None.** Diagrams-first did not hurt |
| Team size | 4, 1, 1 | 2, 1, 1 | 2, 2 | 4, 2, 2 | None |
| Domain | legal $, health, music $ | incidents, trading, SaaS churn | study, eng-management | trading/OSINT, security, incidents | Weak: **neither security nor trading won a CH/Guild prize here**; health won overall twice |
| Overall-prize halo | Aero (Overall) | — | — | — | Aero won both; SilverShield didn't win CH |
| Sponsor-staff relationship | — | — | Magpie thanked Guild VP Eng + DevRel | — | Medium for Guild (unobservable elsewhere) |

The two strongest differentiators are **execution hygiene** (inside 3:00, on time) and **no visible sponsor failure on screen**. Neither is about the sponsor's technology.

---

## 6. Counterfactuals

**Losers: smallest plausible flip**

- **IncidentSherpa (ours) → ClickHouse/Langfuse.** (1) Hide or relabel the "DEGRADED / not configured / not parseable / SKIPPED" rows before recording (a demo-mode filter), or drop Guild and Airbyte from the pitch entirely. (2) Cut to ≤2:45 and upload by 16:30: the 17:45 upload means the judged artifact was probably the in-room demo, not the video [I]. (3) Give ClickHouse 30 s with a number ("this query over N rows found the 2m15s precedence in X ms") instead of 15 s. (4) Show a Langfuse trace with scores and costs, not a home page with $0.00 and 0 scores. Any two of these would likely have put it ahead of seconds ai on Presentation [I, medium].
- **NightCrawler → Guild.** Make the approval path fail *closed with a retry* and re-record; the on-screen "Approval request failed" contradicts the narration at 2:27. One re-take [I, medium].
- **SilverShield → ClickHouse.** Tick the ClickHouse prize and add `clickhouse` to Built With [I, low-medium; opt-in status unknown].
- **Theta Desk → ClickHouse.** Submit 30 minutes earlier and cut to 2:45; its SQL story is stronger than seconds ai's [I, low-medium].
- **Ghost Churn.** Record narration. A silent 4-minute video cannot score on Presentation [V silent].

**Winners: what nearly cost them**

- **seconds ai:** a static diagram for the first ~90 s, ClickHouse only as "where data is stored", and its own README admits Composio/Senso are not wired [round 1]. A judge who opened `case_signals` would have found `author: ""` on the Guild path [round 1 §5].
- **AeroRider:** camera evidence from a Fremont freeway (TVD01 I-80) on an SF bike route, a 45,505 bike overcount on screen, recorded at 4:41 PM, and a single dump commit at 16:24 [V].
- **EARWITNESS:** 84 s, no sponsor in the video, a 44-word Devpost, Devpost entry created at 16:34 [V]. It survived because the Langfuse slot was judged on Langfuse, presumably via the live booth or trace links [I].
- **Magpie:** ended mid-sentence, four tool-less agents, Guild never on screen [V].
- **DailyGate:** never says "Guild", no live action, SQLite under a ClickHouse claim [V].

---

## 7. Why each winner won (verdicts)

**seconds ai (ClickHouse)**
1. Strong, money-shaped idea with a legal "aha" (numerosity = distinct complainants) and a team of four presenting together in the room. *High* [V transcript 0:15–0:35; frames f1–f9].
2. Autonomy framing that matches the 20% criterion ("fires on a schedule … no human in the loop"). *Medium-high* [V 0:40–0:44].
3. A hosted URL with real ClickHouse-backed data plus a phone payoff. *Medium* [V f10–f14; round 1 `/health`].
4. ClickHouse depth (`case_signals`): *low* as a cause, since it was never shown [V].

**AeroRider (ClickHouse, claimed 2nd; Top 2 Overall)**
1. The cleanest live demo in the set: a real map from second 1, a visible decision flip, calm narration. *High* [V frames].
2. ClickHouse narrated as the decision engine, with a judge drawer (ms, SQL). *Medium-high* [V f10, f14; 0:26–0:47].
3. Health/consumer domain with a quantified payoff ("10% lower"). *Medium* [V f8].
4. Missing autonomy probably kept it off CH Team #1 [I, low-medium].

**EARWITNESS (ClickHouse umbrella, Langfuse slot)**
1. Langfuse depth, judged with Langfuse DevRel on the panel. *High* for the slot [V README award line; Luma judge list; round 1 §4].
2. Memorable, unfakeable narrative ("Shazam with a wallet") with live counters and real payouts. *Medium-high* [V f1, 0:21–0:41].
3. Strong autonomy (always-on loops, 422+ verdicts). *Medium* [V f1 KPIs].

**Magpie (Guild, claimed 1st)**
1. Live, visceral cause → effect recorded in the room (copy → notebook appears → summarize). *High* [V f9–f19].
2. Guild given a crisp role sentence in the first 30 s ("every clipboard copy is a live agent invocation"). *Medium-high* [V 0:26–0:35].
3. Relationship with the Guild judge (VP Eng thanked publicly). *Medium, unobservable* [round 1].
4. Guild depth: *none* as a cause (`tools: {}`).

**DailyGate (Guild, probably 2nd)**
1. The idea is Guild's own marketing story (governed, earned autonomy). *High* [round 1 §8].
2. Real rigor in the trust model and the README/Devpost Guild density (11 mentions, the most in the gallery). *Medium* [V parse].
3. The video lost ground: no Guild name, no live action. That probably cost it 1st. *Medium* [V transcript, frames].

**proPR (Guild)**: unknowable. No public artifact; any verdict would be invention. Only inference: it won on the live booth demo of an operational workflow with human escalation (round 1).

**Overall winners (AeroRider, SilverShield):** both are solo-presented, light-themed, map-centred consumer-safety products (lungs; recalled drugs) with a one-button live run, a big number on screen, and a 2:00–2:23 video submitted on time. Neither is an "agent infra" project. *Medium* [V frames].

---

## 8. What this means for tomorrow's Cyberdefense entry

1. **Ship a clean 2:30–2:50 video before the deadline.** Every ClickHouse loser here broke the length or the time limit; every winner did not. Treat "uploaded by T−10 min" as a hard gate.
2. **Run a "demo mode" that never shows a broken sponsor.** Our own loss and NightCrawler's both put a red failure from a sponsor integration on camera. Before recording, grep the UI for DEGRADED / failed / not configured / SKIPPED. If a sponsor is not working at 3:30 PM, cut it from the pitch rather than show it degraded.
3. **Fewer sponsors, each with one sentence and one visible effect.** Magpie (3) and AeroRider (1) won; our 9-sponsor tour gave ClickHouse 15 s.
4. **Give ClickHouse a decision, a number and 30+ seconds** (AeroRider pattern), plus an autonomous trigger (seconds ai pattern). Together those cover Tool Use and Autonomy.
5. **Check which prizes exist and tick them all on Devpost.** Here a Langfuse slot hid inside ClickHouse, and we won Senso, which we had not targeted. Read the prize text at kickoff.
6. **Rehearse the narration.** Presentation is 20% and every winner had a calm or scripted delivery.
7. **Domain caution:** at this event, security and trading entries (MCP Auditor, ThreatLens, NightCrawler, Theta Desk, ours) won none of the CH/Guild prizes, while health and money stories did. At a Cyberdefense event the domain is fixed, so the lesson is to give the security story a human victim and a number, as SilverShield did for drug recalls.

---

## 9. Uncertainties

- **No ranks are published by the organizer.** AeroRider "2nd" and Magpie "1st" are creator claims (LinkedIn/README). seconds ai = Team #1 and DailyGate/proPR = 2nd are only by elimination.
- **We don't know which artifact was judged**: the video, the 4:30–5:00 room demo, or both. The PA in Magpie's video shows separate general and sponsor judges walking the room. Several winners uploaded after 4:30, so the video may not have been decisive.
- **Prize opt-in is invisible.** SilverShield may simply not have entered ClickHouse.
- **ClickHouse judge identity is unknown.** No ClickHouse employee is on the Luma judge list. If ClickHouse DevRel judged off-list, the "story over depth" reading weakens.
- RepoToon has no captions and its frames were not reviewed; Odette was reviewed from its transcript only.
- IncidentSherpa is our own project, which risks motivated reasoning in either direction. Its scoring above used only on-screen and transcript evidence.
- Devpost "started this project" timestamps may be entry-creation times, not submission times; I used YouTube upload times for lateness instead.
