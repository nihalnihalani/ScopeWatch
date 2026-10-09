> Imported historical analysis; current ScopeWatch architecture/contracts govern the build.

# Why they won: Ship to Prod (24 Apr 2026), Guild.ai prize

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

> Round 2, matched winner-vs-loser analysis. Builds on round-1 files in `analysis/guild-ai/` (per-project files, `_TEAM_A.md`, `_GUILD_PLATFORM.md`, `_DEVILS_ADVOCATE.md`). Round-1 code findings are cited, not redone.
> **[V]** = verified (source given). **[I]** = inference. Analysed on 8 Oct 2026. Videos, frames, storyboards and Devpost HTML are in the session scratchpad (`scratchpad/stp/`, `scratchpad/proj/`). Nothing was committed.
>
> **Frame method note.** YouTube blocked full-video downloads for 6 of the 10 videos (HTTP 403 / "only images available"). For those I used YouTube's own storyboard sprites (320×180, about one frame every 1–2 s): RxScout, MediCall, Dress Rehearsal, FeedbackForge, Verity, CRM Heal. Phalanx, Branch, Agent Court and research-agent were downloaded at 360p and sampled every 4–10 s. At storyboard resolution I can read layout, headings and big numbers, not small text. Where I could not read something, I say so.

---

## 1. Event context

| Item | Fact | Source |
|---|---|---|
| Event | Ship to Prod – Agentic Engineering Hackathon, tokens&, AWS Builder Loft SF, Fri 24 Apr 2026 | [V] Devpost, Luma |
| Pool | **62** gallery projects (61 pages scraped), **155** registered participants | [V] gallery scrape; Devpost search snippet "Participants (155)" |
| Sponsors | 11 tools on Luma: AWS, WunderGraph, Ghost/TigerData, Nexla, Redis, Akash, TinyFish, Chainguard, Vapi, InsForge, Guild.ai | [V] luma.com/shiptoprod |
| Guild prize | "Most Innovative Use of Guild.ai Platform", $2,500, **6 winners**: 1st $1,000, 2nd $500, **3rd $250 × 4** | [V] `_GUILD_PLATFORM.md` §2 |
| Guild usage in pool | 18 of 61 pages mention "guild" in the write-up body; about 14 do so substantively | [V] my re-parse of `scratchpad/proj/ship-to-prod__*.html`; [V] DA §2.3 |
| Odds | 6 awards / ~14 credible Guild pitches ≈ **40%** | [I] |
| Criteria | Autonomy, Idea, Technical Implementation, Tool Use ("≥3 sponsor tools"), Presentation ("3 minutes"), 20% each. No Guild-specific rubric. | [V] `_GUILD_PLATFORM.md` §2 |
| Guild judges | James Everingham (CEO), Killian Murphy (VP Engineering), Bryce Heltzel (Agents @ Guild.ai, also a speaker). About 30 judges overall. | [V] Luma "Judges" list |
| Agenda | Kickoff 9:45–11:00, hack until 4:30, **Demos 4:30–5:00**, Closing + Awards 7:00 | [V] Luma schedule |
| Judging format | A 30-minute demo window for 62 teams means judges went table to table, not a stage show for everyone. Sponsor judges scored their own track in person. | [I] from the agenda |
| Overall winners | "Top Overall Winners": **ForgeRedemption** and **HEARTH**. Neither mentions Guild. | [V] gallery winner labels |
| Ranks | Only MediCall's is public: **3rd** (Kevin Chen, LinkedIn). 1st and 2nd are unpublished. | [V] `medicall.md` §1 |

**What this means.** Guild had three senior people judging in person. They saw the Devpost page and a table-side demo. The video was secondary. Nothing suggests they opened repos. **[I]**

---

## 2. Comparison set

Guild "mentions" counts "guild" in the Devpost write-up body only, so tags and prize labels are excluded. Words is the length of the write-up body. Prior Devpost wins are counted from the page-1 profile scrape, minus this event's win. They are approximate. **[V]**

| Project | Guild result | Other prizes won | Team (prior Devpost wins) | Video length | Guild mentions / words | Real Guild in code (round 1) |
|---|---|---|---|---|---|---|
| **Phalanx** | Winner (rank ?) | Chainguard, WunderGraph | 1: Elijah Umana (**5**) | 212 s | 3 / 698 | Thin: 2 CLI sessions, outcome hardcoded |
| **Branch** | Winner (rank ?) | Chainguard, Ghost, WunderGraph (**4 tracks**) | 1: Nelson Lai `clai74` (**6**) | 137 s | 6 / 872 | **None** (SDK declared, never installed) |
| **RxScout** | Winner (rank ?) | — | 1, private (Bharat Bhavnasi; 0 on found profile) | 75 s | **11** / 1,161 | **None** (1 commit, 13:14) |
| **MediCall** | Winner, **3rd** | **Vapi 1st** | 2: Abdullah Waheed (1), Kevin Chen (2) | 180 s | 10 / 753 | **Only real SDK install**, 4 published agents, time trigger |
| **tracepath** | Winner (rank ?) | — | 2: both first-time Devpost users (0) | **none** | 4 / 850 | No public code |
| **WildFire Response** | Winner (rank ?) | — | 2: Pramod Thebe (**6**), Yuvraj Gupta (**6**) | dead | 1 / 475 (as "future work") | None evidenced |
| Dress Rehearsal | — | — | 3: Dhruv Vootkuri (3), others (0) | **258 s** (over limit) | 7 / **2,644** | Claimed "registered Guild agent"; not verified |
| Agent Court | — | — | 2: (0, 0) | **55 s, silent** | 6 / 1,252 | Claimed; fallback "no Guild key required" |
| research-agent | — | — | 1: (0) | **11 s** | 4 / 300 | **Real**: `llmAgent` + `guildTools` + daily trigger (DA §3) |
| FeedbackForge | — | — | 1 listed (Anna McGovern, 1); 2 in video | 106 s | 2 / 377 | Real `llmAgent` with `guildTools`; single commit 16:59 (DA §3) |
| Verity | — | **Ghost** | 3 | **283 s** (over limit) | 4 / 832 | Tag + text only |
| CRM Heal | — | — | 1: (0) | 106 s, silent | 3 / 532 | "Guild integration **without API**" (Devpost) |
| *Guardian Agent Breaker (GAB)* | — | Chainguard | 1 | n/a | 2 / 340 | not analysed (thin) |
| *RedBox AI* | — | — | — | — | — | **Not analysed** (out of scope per brief) |

Sources: `scratchpad/stp.json` (parser `stp_parse.py`); `yt-dlp --print` metadata; Devpost profile pages `devpost.com/<user>`.

---

## 3. Demo forensics

### Winners

**Phalanx** (212 s, 360p, frames every 10 s) **[V]**
- **On screen.** A single dark, dense dashboard titled "Phalanx: Parallel-fork CVE response fabric". About 10 sponsor-labelled panels: FORK RACE, GHOST FORK TERMINAL, REDIS COORDINATION, INSFORGE STAGING, TINYFISH WEB ACTION, WUNDERGRAPH, CHAINGUARD, NEXLA, x402, and a right-hand column titled **"GUILD AUDIT LOG"**.
- **Timeline.**
  - 0:00–0:14: hook stat ("$60B… 60 days to patch").
  - ~0:20: repo URL pasted into the dashboard. First live product at about 20 s.
  - ~0:50–1:00: the Guild audit-log column fills with 3 "Analyst" rows.
  - ~1:40–1:50: a green Guild "action"/approval row appears, and a red toast reads "cancel fork: false_positive" (the wow beat; transcript 2:07).
  - Guild is **spoken once**, in the 3:08 sponsor roll-call (`phalanx.md` §6).
- **Observed.** The large "FORK RACE" panel looked empty in every sampled frame. At 360p I can't rule out content too small to see. **[V/I]**
- **Polish.** Medium-high. Everything is live-looking with no slides, but the dashboard is too dense to read at video resolution.
- **Guild visibility.** The panel is **labelled Guild** for the whole video, even though round 1 showed it is Phalanx's own Redis log (`phalanx.md` §4).

**Branch** (137 s, 360p, frames every 10 s) **[V]**
- **On screen.** The whole video is a **GitHub README scroll** (`github.com/chinesepowered/hack-apr24`), with these sections in order:
  1. "What the demo shows (live, not narrated)": a 7-step list from issue to PR to image.
  2. The **"Sponsor leverage"** table, with columns *Sponsor / What Branch uses / Why it's impressive*.
  3. A cut (~0:45–1:20) to a **private repo `hack-apr24demo`**, showing a commit by **`branch-dev-apr242026[bot]`**: "feat(customers): add VAT number support… 6 minutes ago", plus a commits page.
  4. Back to the README. At ~1:50 the **Guild.ai row** is on screen: "Coded agents in `services/agents/{planner,executor}`… `'use agent'` directive, `agent({description, inputSchema, outputSchema, run})` factory… the orchestrator **spawns the planner as a real subprocess**… SDK loaded via dynamic import so the demo works before `guild auth login`."
  5. The "Run it" section.
- No dashboard and no product UI. Windows "Activate Windows" watermark.
- **Timeline.** Problem 0:01–0:30. Product artifact (bot commit) at about 45 s. Guild spoken at 1:52, garbled by captions as "we use AI for the orchestration". Ends: "look at sponsors.md… happy to show you more."
- **Polish.** Low as a video. High as a document.

**RxScout** (75 s, storyboard) **[V]**
- **On screen.**
  - A polished consumer landing page: "Find the cheapest pharmacy for your prescription — in minutes" with a lifestyle hero photo and a search form.
  - Then "Scouting Atorvastatin 20mg": **8 pharmacy cards**, each showing a **live browser thumbnail** while it works. One card shows the TinyFish fish mascot.
  - The cards then resolve to prices ($6.37, $4.00, $14.17, $3.00 legible at sprite resolution).
  - A dark pill in the top-right header looks like sponsor badges, but I couldn't read it.
- **Timeline.** Live product from 0:00. There is no problem statement in the video; it is all in the Devpost tagline ("$7 at Costco, $393 across the street"). Payoff ≈ 0:40 ("best one is in Walmart"). Guild is **never spoken and never on screen**. Narration credits TinyFish.
- **Polish.** High visual design, minimal narration.

**MediCall** (180 s, storyboard) **[V]**
- **On screen.** A light editorial dashboard headed "Every morning, a call that shows up — so families never find out too late", with patient rows and a call-outcome panel.
- **The only Guild UI frame in any winner's video:** about 0:54–0:56, a dark **Guild app/docs page** ("Guild" logo, "Introduction", "Core concepts", "Workspaces", "Agents") is on screen for about 2 s. It looks like a tab flash, not a tour.
- About 1:06–1:12: Chrome new-tab / Google search dropdown, so the presenter is switching tabs.
- About 1:42–2:42: the live phone call (round-1 transcript).
- **Timeline.** Emotional hook in 0:00–0:12 ("125,000 Americans die… my neighbor's mom"). Guild spoken at 0:24 ("G.A.I. agents wake up autonomously, no human trigger needed"). Payoff is the live call reciting the warfarin recall (round 1 found it hardcoded).
- **Polish.** Medium. Real product, two-thirds live call.

**tracepath.** No video exists. The Devpost page only. **[V]**

**WildFire Response.** YouTube "unavailable", Drive 404. Not assessable. **[V]**

### Matched losers

**Dress Rehearsal** (258 s, storyboard + captions) **[V]**
- Opens on **OBS / screen-recording software** (a recording-setup screen with a webcam bubble) for about 10 s, then a dark landing page: "Pilots don't practice on real planes. Stop practicing high-stakes conversations on reality."
- Then a job-description form ("Software Engineering Intern — Anthropic"), 10 parallel persona simulations, and an aggregate dashboard.
- Webcam overlay throughout. The video ends back on the OBS screen.
- **Guild is never spoken.** The closing roll-call lists "InScribe [InsForge]… Redis… Tiny Fish… Wonder Graph Cosmo… Cloud [Claude]" (4:00–4:12).
- **Over the 3-minute limit by 78 s.**

**Agent Court** (55 s, 360p, frames every 5 s) **[V]**
- A silent, very polished dark UI: "People v. Agent-tbmlxz", with Task on trial, Budget Ledger (Defendant A $0.550/$0.50 **OVER**, Defendant B $0.115), live tool calls, Prosecutor and Defense statements, a 5-juror vote, and verdict "**RETRY** — SENTENCE: RETRY_WITH_WUNDERGRAPH".
- Guild appears only as small footer text: "SPONSOR STACK: … **Guild.ai** logs every tool call as a courtroom exhibit".
- **No narration, no problem statement.** The verdict sells WunderGraph, not Guild.

**research-agent** (11 s, phone recording) **[V]**
- A Telegram chat with the "Research agent" bot at 4:21 PM. The user taps "Send report" and gets "Pulling your briefing now…" then a news digest.
- Nothing about Guild. It never states a problem.

**FeedbackForge** (106 s, storyboard + captions) **[V]**
- Starts and ends on the **Loom "Videos" library page**, so the recording wasn't trimmed.
- The body is a plain white dashboard titled "FeedbackForge" with tickets on the left, an investigation log, and red/green diff-like panes.
- Guild **is spoken** at 1:26: "Guild AI was really important to make sure that we had the right controls for these agents." The approval itself isn't shown.
- Two people narrate, unscripted, with no wow moment.

**Verity** (283 s, storyboard + captions) **[V]**
- Starts and ends on Loom's "Record your first Loom" page.
- The presenter's script is visible in a split pane next to the app.
- The app is neo-brutalist pink/yellow: "Five agents. One cited.md. Zero hand-waving." It shows market cards with confidence % and a terminal.
- **Guild is never spoken.** 103 s over the limit. Verity won Ghost.

**CRM Heal** (106 s, storyboard) **[V]**
- Silent. A dark "Autonomous CRM Cleanup Mission Control": a file-picker CSV upload, then a table with coloured status pills and an activity feed.
- No narration. Its Devpost says "Guild integration **without API**".

---

## 4. Rubric scorecard (predicted vs. actual)

Scores are 1–5. I = Idea, T = Technical Implementation, TU = Tool Use, P = Presentation, A = Autonomy, SF = Guild Sponsor Fit. "?" means unassessable, scored 3 as neutral.

| Project | I | T | TU | P | A | SF | Σ | Evidence (one line each, key items) | Actual |
|---|---|---|---|---|---|---|---|---|---|
| Phalanx | 5 | 4 | 5 | 4 | 4 | 4 | **26** | Security + "60 days to 90 s"; 8 sponsors; "GUILD AUDIT LOG" panel visible all video; approval row ~1:45 | Winner (+2 tracks) |
| MediCall | 5 | 3 | 4 | 4 | 5 | 5 | **26** | Emotional hook 0:00; real SDK lockfile (`medicall.md` §4); time trigger = Autonomy; judge walkthrough doc | **3rd** |
| Branch | 4 | 4 | 5 | 2 | 4 | 4 | **23** | Issue to PR is Guild's "Software Factory" use case; README video only; exact SDK vocabulary in `sponsors.md` | Winner (+3 tracks) |
| RxScout | 5 | 3 | 4 | 3 | 3 | 3 | **21** | "$7 vs $393" hook; 8 live browser cards; 11 Guild mentions; 0 Guild code; Guild never in video | Winner |
| tracepath | 4 | 3? | 3 | 1 | 4 | 5 | **20** | "Guild.ai agent that closes CVE tickets"; typed OpenAPI tool surface; "40k-line lockfile" lesson; no video | Winner |
| Dress Rehearsal | 4 | 3 | 3 | 2 | 3 | 3 | **18** | Strong analogy hook; 258 s (over); Guild never spoken; 2,644-word Devpost | — |
| FeedbackForge | 3 | 2 | 3 | 2 | 3 | 4 | **17** | Exact governance pitch, spoken at 1:26; untrimmed Loom; solo commit at 16:59 | — |
| Agent Court | 4 | 3 | 3 | 2 | 2 | 3 | **17** | Best-looking UI in the set; 55 s silent; Guild = footer text; "no Guild key required" | — |
| research-agent | 2 | 3 | 3 | 1 | 4 | 4 | **17** | Real Guild daily trigger (DA §3); 11-second phone clip; 300 words | — |
| WildFire | 4 | 3? | 3 | 1? | 3 | 2 | **16** | "Human-approved agent actions" queue; Guild only "future work"; video dead | **Winner** |
| Verity | 3 | 3 | 3 | 2 | 3 | 1 | **15** | 283 s; Guild never spoken; won Ghost | — (Ghost) |
| CRM Heal | 3 | 2 | 3 | 1 | 3 | 1 | **13** | Silent; "Guild integration without API" | — |

**My predicted top 6:** Phalanx, MediCall, Branch, RxScout, tracepath, Dress Rehearsal.
**Actual:** the same, except **WildFire beat Dress Rehearsal**. **MediCall placed 3rd**, below where I'd put it.

**Disagreement 1: WildFire over Dress Rehearsal.** All evidence for WildFire is gone (repo 404, video unavailable), so my low score mostly reflects missing evidence. Factors that would have counted in person and that I can't see **[I]**:
- **Team pedigree.** Both members have about 6 prior Devpost wins each. Serial winners give practised table demos.
- **Its write-up puts "human-approved agent actions" in the tagline**, which is Guild's governance thesis.
- Dress Rehearsal **never said "Guild"** in its own 4.3-minute video, and spent its time on a TinyFish research beat.

Confidence: low.

**Disagreement 2: MediCall only 3rd.** On every rubric line MediCall is the best Guild entry. Three reasons it probably wasn't 1st or 2nd **[I, medium]**:
1. **The judges were Guild's CEO and VP Engineering, who can tell a cron job from an agent.** Every MediCall agent is `tools: {}` plus one HTTP POST (`medicall.md` §4). Guild is the scheduler; the intelligence lives in Render.
2. **Use-case fit to Guild's ICP.** Luma pitches Guild as "a platform for **engineering teams**". Phalanx (AppSec CVE response), Branch (issue to PR, Guild's own "Software Factory" story) and tracepath (CVE triage) are engineering workflows. MediCall, RxScout and WildFire are consumer apps. With 1st/2nd unpublished, the most likely 1st/2nd are among the three engineering-workflow entries. **[I]**
3. **MediCall's own wow was a Vapi phone call**, and it took **Vapi 1st**. The Guild judges' best memory of the demo was another sponsor's feature.

**The pattern in the disagreements:** my rubric overweights verifiable Guild depth (research-agent, MediCall). The real outcome tracks **write-up and narrative fit with Guild, plus demo quality**, which confirms DA §2.2.

---

## 5. Differentiators (winners vs. matched losers)

| Factor | Winners (6) | Matched losers (6) | Discriminates? |
|---|---|---|---|
| **Guild described as a concrete product mechanism in the write-up** (named primitives: `guild agent chat --ephemeral --mode json`, `experimental-fetch`, `guildTools`, triggers, task primitives, `"use agent"`, `agent()` factory, auto-managed runtime, typed `/openapi` tool surface) | 5/6. RxScout, Branch, MediCall, tracepath, Phalanx ("sessions triggered via HTTP API"). WildFire is the exception. | 1/6 (research-agent: "deployed and scheduled", "daily trigger"). The rest use abstract labels: "registered Guild agent with immutable audit log" (Dress Rehearsal), "GuildClient wraps every tool call" (Agent Court), "We used Guild to control what the agent can do" (FeedbackForge), "without API" (CRM Heal) | **Strong.** Builders' vocabulary reads as "they really touched our product", while governance buzzwords read as a brochure. **[V counts / I mechanism]** |
| **A first-hand Guild "lesson learned"** in the write-up | 4/6. RxScout "pharmacy-scout would echo the request payload → `looksLikeInputEcho()`"; tracepath "first Guild runs asked for 40k-line lockfiles, every tool grew a cap"; MediCall "localhost default… GNU Guile name collision"; Phalanx "Guild's immutable audit log… turned out to be the selling point" | 1/6 (research-agent: "wiring env secrets into Guild") | **Strong.** It is free product feedback for the sponsor. **[V/I]** |
| **Prior-winner pedigree** (≥1 member with ≥5 prior Devpost wins) | 3/6 (Branch 6, Phalanx 5, WildFire 6+6). MediCall 1–2. tracepath and RxScout 0. | 0/6 (best: Dress Rehearsal 3) | **Strong.** Experience shows up as presentation craft. **[V counts / I causation]** |
| **Quantified, legible payoff** | Phalanx "60 days → 90 s"; RxScout "$7 vs $393"; MediCall "125,000 deaths/yr"; tracepath "closes tickets instead of filing them" | Verity "100% confidence"; others none | Medium |
| **Video within 3 min** | 4/4 that exist (75–212 s; Phalanx at 212 s is 32 s over) | Dress Rehearsal 258 s, Verity 283 s over; Agent Court 55 s **silent**; research 11 s; CRM Heal silent | **Medium-strong.** No loser had a clean, narrated, in-limit video with a hook. |
| **Untrimmed recording** (starts or ends on Loom/OBS) | 0 | 3 (Dress Rehearsal, FeedbackForge, Verity) | Medium (a polish signal) |
| **Guild visible on screen or spoken in the video** | Phalanx (panel label), MediCall (2 s tab + spoken), Branch (README row) = 3/4 | FeedbackForge spoken; Agent Court footer = 2/6 | **Weak.** RxScout won with none. Guild was judged at the table, not from the video. |
| **Real Guild code** | 1/6 (MediCall) + Phalanx thin | 2/6 real (research-agent, FeedbackForge) | **None or inverse** (DA §2) |
| **Engineering-team use case** (Guild's ICP) | 3/6 (Phalanx, Branch, tracepath) | 2/6 (FeedbackForge incident response, Agent Court agent supervision) | Weak for winning *a* prize; plausibly decides **rank** [I] |
| **Multi-track halo** | Branch 4, Phalanx 3, MediCall 2 | Verity 1 (Ghost) | Medium. The same craft that wins other sponsors wins Guild. |
| **Many sponsors** | Phalanx 8, Branch 5, RxScout 5 tags | Agent Court 4–5, Verity 6+ | None |
| **Domain** | Security 2, health 2, consumer savings 1, disaster 1 | Careers, courts, news, incidents, markets, CRM | Weak. Winners chose **stakes a judge feels** (patients, CVEs, wildfires, drug prices). Losers chose productivity. |
| **Team size** | 1, 1, 1, 2, 2, 2 | 1–3 | None |

### Why did Branch (zero Guild code) win 4 tracks?

1. **It is a sponsor-judging machine.**
   - `sponsors.md` gives every sponsor four fixed blocks: **What we use / Where it appears in the demo / Live proof (run id) / Pitch (a quotable sentence)**.
   - The README turns that into a table whose third column is literally *"Why it's impressive"*, written in each sponsor's own thesis ("Fork a database as casually as you fork a branch — is Ghost's thesis"; "the agent boundary is the right unit of governance… a versioned artifact you can roll back" for Guild).
   - A sponsor judge at the table can score their own track in 30 seconds. The video *is* that README. **[V]** (`hack-apr24/sponsors.md`, frames ~0:40–1:50)
2. **Verifiable artifacts instead of a UI.** A real bot-authored commit on a real repo, 6 minutes old on camera. "Our UI is exactly in your workflow." **[V]**
3. **For Guild specifically:**
   - Exact SDK vocabulary that only someone who read Guild's docs on the day would know.
   - Its subprocess shortcut is **disclosed** rather than hidden ("spawns the planner as a real subprocess… SDK loaded via dynamic import so the demo works before `guild auth login`").
   - An issue-to-PR coding agent is Guild's own "agents prepare PRs, humans approve" story.

   Guild's engineers would read it as a fluent early adopter blocked by auth, not as a faker. **[I, medium-high]**
4. **Pedigree.** Nelson Lai is a high-volume serial competitor (§5a). **[V]**

### Why did RxScout (zero Guild code, 1 commit) win?

1. **The densest, most specific Guild write-up in the event:** 11 body mentions, an ASCII architecture diagram with "Guild: rx-ocr" and "Guild: rx-parser" boxes, exact CLI flags, `experimental-fetch`, `guildTools`, and a believable failure mode (input echo). It also says "Guild agents are a nice middle ground between raw SDK calls and a full orchestration framework", which is a sentence a Guild marketer would quote. **[V]**
2. **The most viscerally clear idea in the pool:** "$7 at Costco, $393 across the street", backed by a demo that visibly fans out 8 live browser agents. That is Guild's "multi-agent" story told with TinyFish pixels. **[V]**
3. Round 1's strongest explanation still stands: a Guild CLI version was likely built after the 13:14 push and shown at the table but never pushed. **[I, medium]**
4. A 40% award rate and four $250 slots make "credible plus memorable" enough. **[I]**

### Why did MediCall (only real SDK install) place only 3rd?

See §4, disagreement 2:
- Guild was a cron job wrapping HTTP POSTs (`tools: {}`), visible to an engineer-judge.
- It is a consumer use case outside Guild's engineering-team ICP.
- The memorable beat belonged to Vapi.

Note: **3rd is shared by four teams**. MediCall may not have been "below" Branch or RxScout; it may have tied with them. Only 1st and 2nd are single slots. **[V prize structure]**

### What the 6 winners shared that the Guild-substantive losers lacked

The winners had a **legible stake plus a Guild write-up written in Guild's own builder vocabulary (often with a lesson learned), presented by people who had demoed to judges before.** The losers mostly had real-but-invisible Guild work (research-agent, FeedbackForge) or polished UIs with no narrated story (Agent Court, CRM Heal), and none had a serial winner on the team.

### 5a. Profile: Nelson Lai (`chinesepowered` / Devpost `clai74`)

- **Volume.**
  - GitHub has 141 public repos, about **91 named `hack-*` in 2026 alone** (12/month in Feb–Apr; 20 in Sep).
  - Devpost lists **61 projects** with **7 winner badges** (≈11%).
  - The most recent repo, `hack-37` (FloorCheck), was created and submitted on **7 Oct 2026**, the day before this analysis. **[V]** `gh api users/chinesepowered/repos`; `devpost.com/clai74`.
- **Win list [V], all "Best use of \<sponsor\>" prizes, never an overall prize:**

  | Project | Event | Prize |
  |---|---|---|
  | Airlock | Daytona HackSprint SF, Jul 2026 | Best Use of CodeRabbit (a *security* tool-sandbox verdict app) |
  | Branch | Ship to Prod | Guild + Chainguard + Ghost + WunderGraph |
  | RepoLens | Multimodal Frontier | Best use of Augment Code |
  | Udon Cat | AWS Agentic AI | Best Use of Semgrep |
  | Viral Video Creator | MCP AI Agents | Best Use of MiniMax |
  | AeBets | æternity | Winner |
  | AI Bears Club | SF Hacks 2024 | MLH GoDaddy domain |

- **House style (same template in Branch, Apr 2026, and FloorCheck, Oct 2026):** **[V]**
  1. A one-sentence bold value prop at the top of the README.
  2. A **headline number from "a real recorded run"** (FloorCheck: "3 dealers, 47 listings audited in 40 seconds… found 3 units sold out of trust ($262,400)").
  3. A **"Sponsors" table: one row per sponsor saying exactly what it does in the product.**
  4. `SUBMISSION.md`, `pitch.html` and `fixtures/` in the repo, plus a zero-credential `pnpm demo` mock mode so the demo never fails.
  5. Coding-agent-driven builds (plan-first `plan.md` in Branch).
  6. **Solo**, wide sponsor coverage, and narration kept to the minimum.
- **Implication.** His edge is **packaging for sponsor judges**, not depth. He optimises for "Best use of X" prizes, the exact prize type at Cyberdefense. If he enters on 9 Oct, expect a Guild/Semgrep/ClickHouse/Pi row for each, a mock fallback, and a crisp number. **[I]**

---

## 6. Counterfactuals

**Losers: smallest plausible flip**

| Loser | Smallest change |
|---|---|
| Dress Rehearsal | Cut to ≤3 min and say one Guild sentence on camera ("each persona is a Guild agent with scoped tools; here is the registry"). It already had the idea and 7 write-up mentions. |
| Agent Court | Add 30 s of voice-over with a problem statement, and make the verdict sentence "Guild's trace is the evidence" instead of "retry with WunderGraph". Delete "no Guild key required". |
| research-agent | Record a real 2-minute video showing the Guild trigger firing in app.guild.ai. It had the *real* autonomy Guild sells and showed none of it. |
| FeedbackForge | Show the approval: one high-risk rollback blocked and then approved in Guild. It *said* the winning pitch but never showed it. Also trim the Loom. |
| CRM Heal | Either use Guild for real or drop the tag. "Without API" disqualifies itself to a Guild judge. |

**Winners: what nearly cost the prize**

| Winner | Near miss |
|---|---|
| Phalanx | Guild was integrated 35 min before the deadline, and its CLI fixes landed at 17:12 and 17:44 (`phalanx.md` §7). A failed table demo would have left only a log labelled "Guild". |
| Branch | Any judge opening `package-lock.json`, or asking "show me it in app.guild.ai", would have found nothing. |
| RxScout | The repo contradicts the write-up. A single code check flips it. |
| MediCall | The silent "Simulated successful call" fallback and the hardcoded warfarin recall. If the live call had failed, so would the payoff. |
| tracepath | No video and no repo. It survived only on the in-person demo and the write-up. |
| WildFire | Guild is listed as "future work". |

---

## 7. Why each winner won (verdicts)

| Winner | Ranked causal factors (confidence) |
|---|---|
| **Phalanx** | 1. Security stakes with a hard number, "60 days → 90 s" (high). 2. Dashboard with a permanent "GUILD AUDIT LOG" panel and an approval row, so Guild *looked* load-bearing (med-high). 3. Serial-winner presenter, 5 prior wins (med). 4. Multi-track halo, 8 sponsors (med). 5. Engineering ICP fit, a 1st/2nd candidate (low-med). |
| **Branch** | 1. A per-sponsor dossier (`sponsors.md`, README table) built for sponsor judges (high). 2. Fluent, honest Guild SDK vocabulary plus the "agent boundary = unit of governance" pitch (med-high). 3. A real bot PR as proof, and an issue-to-PR use case that matches Guild's ICP (med). 4. Serial-winner craft (med). Guild code depth contributed **nothing** (high). |
| **RxScout** | 1. The most Guild-specific write-up in the pool, with a lesson learned (high). 2. A visceral price-gap idea and a parallel-agent visual (high). 3. A probable unpushed Guild build shown at the table (med). 4. A lenient 4-slot 3rd tier (med). |
| **MediCall** (3rd) | 1. The only real Guild platform use (published agents, trigger, judge walkthrough) (high). 2. An emotional health hook and a live call (high). Held to 3rd because the Guild part was thin (cron + POST), the use case is consumer, and the wow beat belonged to Vapi (med). |
| **tracepath** | 1. A Guild-native design: "a Guild.ai agent that…" in the tagline, with a typed OpenAPI tool surface for the agent (high). 2. Security/CVE engineering ICP (med-high). 3. A concrete lesson learned (40k-line lockfile caps) (med). Everything else is unknowable: no video, no repo. |
| **WildFire** | 1. Serial-winner team, ~6 prior wins each (med). 2. "Human-approved agent actions" in the tagline, matching Guild's governance language (med). 3. A safety-framed idea (low-med). Low overall confidence: all evidence is gone. |

---

## 8. What this means for tomorrow's Cyberdefense entry (9 Oct 2026)

The Guild judge is now **Corbett Waddingham (Head of DevRel)**, not the CEO/VP Eng (`MASTER_REPORT.md` §7). DevRel rewards a *retellable user story*, so this event's lessons matter even more.

1. **Write `SPONSORS.md` in Branch's four-block format for every sponsor:** What we use / Where in the demo (timestamp) / Live proof (a run ID or Guild `session_url`) / One-sentence pitch in the sponsor's own words. Put the same rows in the README and link it from Devpost. This is the cheapest multi-track lever in the dataset.
2. **Describe Guild with builder vocabulary, not governance adjectives.** Name the primitives you actually used (`pick(gitHubTools, [...])`, `api_trigger` session, published agent `owner~name@version`, `session_url`) and add **one "Guild lesson learned"** paragraph. Losers who wrote "immutable audit log / scoped permissions" in the abstract all lost.
3. **Then make it real.** At a security event, unlike April, the "show me" question is likely. Keep the thin-but-real slice from DA §5 (two agents, `pick()` scoping, real session links).
4. **The video: ≤3:00, narrated, trimmed, hook in the first 10 s with a number, live product by 0:20, Guild named on screen in one 5-second beat.** Every matched loser broke at least one of these rules.
5. **Pick an engineering-team security workflow** (Phalanx/tracepath territory), not a consumer app. It matches Guild's ICP and the event theme, and it is where the probable 1st/2nd places were.
6. **Expect professional competition.** Nelson Lai's template (mock-mode fallback, sponsor table, a "real recorded run" number) is the bar for "Best use of X" prizes. To beat it, add what he skips: real sponsor depth that holds up when a judge opens the code.

---

## 9. Uncertainties

- **Ranks.** Only MediCall's 3rd is public. 1st and 2nd are unknown, so "who beat whom" is mostly unknowable. Four teams tied at 3rd.
- **Judged demo ≠ video.** Judging was in person at the table. Videos (some uploaded 25 Apr) may not show what the judges saw. RxScout's and WildFire's table demos are unknowable.
- **Frame resolution.** Six videos were analysed from storyboard sprites (~320×180). Small text (badges, the RxScout header pill, Phalanx panel contents) could not be read. Phalanx's "empty FORK RACE panel" is a 360p observation.
- **Prior-win counts** come from page-1 Devpost profiles (no pagination check for heavy users) and include wins at other events of any kind. RxScout's Devpost member is private.
- **Mention counts** are a crude proxy, and the winner/loser split is n=6 vs n=6. Correlation, not proven cause.
- **Team sizes.** Devpost member lists can omit people (FeedbackForge lists 1, but its video has 2 speakers).
- **WildFire** is analysed from Devpost text and team pedigree only. Its verdict is low-confidence.
- **RedBot/RedBox AI** was not analysed (out of scope).
