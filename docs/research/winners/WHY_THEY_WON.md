# Why they won: findings across all events

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

**Round 2, 8 Oct 2026.** This combines two sets of work:
- [5 event reports](why-they-won/) that compare each sponsor prize's winners with 3–6 losers at the same event that used the same sponsor. The teams looked at demo video frames and transcripts, the Devpost text, and the rubric, and scored every project.
- [17 whole-codebase deep dives](.) that read every source file of each winning project.

Labels: **[V]** = verified. **[I]** = inference. No judge scorecards exist anywhere, so every "why" is inferred from outcomes and labelled with a confidence level.

---

## 1. The short answer

The scoring models matched the actual results well:
- **Semgrep 2025:** 3 of 3 winners predicted.
- **Agentic Engineering:** 2 of 2.
- **Ship to Prod:** 5 of 6.
- **Harness and London:** one miss each.

Ranking projects by a score that counts **Sponsor Fit first and overall quality second** reproduces almost every result. Ranking by overall quality alone does not. Ranking by how deeply the code uses the sponsor does worst of all.

Winners got **four things right at the same time**:

| # | Factor | What it means | Confidence |
|---|---|---|---|
| 1 | **The sponsor has a job you can name, and it decides the outcome on screen** | Darwin: Semgrep is "40% of Fitness", the thing that decides which AI model survives. AeroRider: a ClickHouse query flips the recommended route. Rokko: the agent raises the best ad to a 94% traffic share. Magpie: "every clipboard copy is a live agent invocation." | **High** |
| 2 | **A human stake with a number in the first frames** | policyDiff "$20.15M at risk", RxScout "$7 vs $393", Phalanx "60 days → 90 s", plus a named persona (a cancer patient, a senior taking warfarin, a revenue-cycle team) | **High** |
| 3 | **A clean, narrated demo: ≤3:00, live product by about 0:20, nothing broken on camera, submitted on time** | Every matched loser broke at least one of these. IncidentSherpa (ours): 183 s, uploaded 75 min late, "DEGRADED – Guild not configured" on screen. Basket: 52 s of static or blank screen. NightCrawler: "Approval request failed" for 2 min. | **High** |
| 4 | **A Devpost write-up that speaks the sponsor's language like a builder** | Exact SDK and CLI terms plus one lesson learned (Branch's `sponsors.md`, RxScout's 11 Guild mentions). In Ship to Prod, 5 of 6 winners did this, against 1 of 6 matched losers. | **Medium-high** |

**Things that did not predict winning:**
- How deeply the code uses the sponsor.
- Honesty or real-vs-mock ratio.
- Custom rules, re-scans, materialized views, deny policies or triggers.
- The number of sponsors used (it helped the *overall* prize but diluted the sponsor beat).

---

## 2. Each winner in one line

| Winner | Sponsor / event | Main reason it won | Real in code (deep dive) |
|---|---|---|---|
| **Rokko** | ClickHouse 1st, AWS MCP 2025 | Only 2 of 47 projects used ClickHouse, and both won. It also earned 1st: ClickHouse on the first slide, a performance table at about 70 s, and the agent raising the best ad to 94% live | Ingestion real; agent backend never published |
| **IncidentLogica** | ClickHouse 2nd, AWS MCP 2025 | **No competition**: ClickHouse doesn't appear in its video or on its Devpost page | Unknown |
| **Vital Signal** | ClickHouse 1st, NYC 2025 (+4 other prizes) | Personal health story, 7 sponsor tools, ends in a real Gmail inbox; 17 ClickHouse entries | About 50%; the agent was built in Airia (no-code), alerts hardcoded |
| **policyDiff** | ClickHouse, Agentic Eng 2026 | Clearest fit for the "fix issues from your job" theme; "$20.15M" in the first frame; ClickHouse is the only link between its 3 services | The scraper probably never ran; the demo button invents events |
| **TC Pilot** | ClickHouse + Top Overall, Agentic Eng 2026 | Fits the "community impact" theme; a "powered by ClickHouse" page with ms badges and "Zofran ▼3.4". Top Overall alone wasn't enough: 2 other Top Overall ClickHouse users got nothing | About 80% (best code of any winner); main branch was still mocked at the deadline |
| **seconds ai** | ClickHouse, Harness 2026 | A money and legal idea; 4 people presenting in the room; "fires on a schedule, no human in the loop" | The hosted demo skips its best query; its "complaints" are news and law-firm pages |
| **AeroRider** | ClickHouse (claims 2nd) + Top-2 Overall, Harness | Cleanest live demo, with ClickHouse narrated as the engine that picks the route. Probably not 1st because the demo needed a user's click (weak autonomy) | About 65%; the pollution on the default route was planted so the route always flips |
| **EARWITNESS** | ClickHouse umbrella (Langfuse slot), Harness | Most complete Langfuse build, with a Langfuse judge on the panel; ClickHouse never in its video | About 75%; rules decide, the LLM only explains |
| **LicenseTrace** | ClickHouse, London 2026 (+ £1k Prometheux) | Best demo in the set (a named incident, real lawsuits, three test cases) | No LLM calls; ClickHouse is one constant row |
| **SynapseCRO** | ClickHouse, London 2026 | Best written case for ClickHouse (memory fed into its prompts, a `/clickhouse` page); strong autonomy | Half the code was pre-built the day before the event; memory works in only 2 of its 5 claimed uses |
| **Phalanx** | Guild, Ship to Prod 2026 (+2 tracks) | Security pitch with a hard number; a "GUILD AUDIT LOG" panel on screen the whole video; its author had 5 prior wins | About 30%; the winning fix is chosen by hashing its name; any role is handed out on request; Guild was broken at the deadline |
| **Branch** | Guild + 3 more tracks, Ship to Prod | Packaging: `sponsors.md` gives every sponsor what we use, where it's in the demo, live proof and a pitch line. The author, Nelson Lai, is a serial winner of "Best use of X" prizes (7 wins) | **No Guild code**; the AI's plan is thrown away; the migration and PR are hardcoded |
| **RxScout** | Guild, Ship to Prod | Clearest idea ($7 vs $393) and the most Guild-specific write-up | Price search real; **no Guild code**; Guild never in the video |
| **MediCall** | Guild **3rd**, Ship to Prod (+ Vapi 1st) | The only real Guild build, but Guild's CEO and VP Engineering judged and could see each agent is one HTTP request. It's a consumer app, and its wow moment was another sponsor's phone call | Recall hardcoded; a failed call is recorded as "took meds" |
| **tracepath / WildFire** | Guild, Ship to Prod | tracepath: a design built around Guild for closing vulnerability tickets. WildFire: team pedigree (about 6 prior wins each). Low confidence, evidence gone | — |
| **Magpie** | Guild (claims 1st), Harness | A live copy-and-a-card-appears moment, with Guild's role named within 30 s; thanked Guild's VP Engineering | Four single-prompt agents with no tools; clipboard (passwords included) stored in plain text |
| **DailyGate** | Guild (2nd by elimination), Harness | Best fit for Guild's own "control plane" story, but the video never says "Guild" and never runs anything live, so it ranked below Magpie | At judging the execution panel was scripted; real execution was added after |
| **Argus** | Guild 1st (claimed), Self-Evolving 2026 | A real Jira ticket (SCRUM-19) on screen. Vocare (2nd) had deeper Guild on paper, but its agents were drafts the app never called | The Jira filing via Guild is real; "AI bug detection" is fixed browser checks |
| **Darwin** | Semgrep, AWS AI Agents 2025 | Framing: Semgrep is what decides which AI model survives, as a "40% of Fitness" label. Won with a silent 75 s video | Semgrep found 14 real issues that were never shown; "150 vulnerabilities" are 15 failed runs × 10 |
| **CommitDNA** | Semgrep | Strongest presentation (a letter grade, swipe-style training, a "Semgrep MCP" label); fully scripted but marked "accelerated for judges" | Repo gone; all 5 rule IDs invented |
| **Udon Cat** | Semgrep | Semgrep in a new place (a bolt.new browser extension); badge on screen at 0:00, named at 0:04; real rule IDs | Repo gone; no re-scan |

---

## 3. The natural experiments (where the causal evidence is strongest)

| Comparison | Outcome | What it shows |
|---|---|---|
| **TidyShot** (1st overall) vs. the Semgrep winners | It lost Semgrep | Semgrep was a small "Pattern Validation" label run on text pulled from images, the payoff was a Vanta story, and no Semgrep output appeared. **Overall quality without a starring sponsor role doesn't win the sponsor prize.** AuditArc (2nd overall) shows the same split. |
| **Watchman** (best tech in the Semgrep pool) | Lost | It re-built Semgrep's own PR-comment and Autofix loop, with Semgrep only in a footer. **Engineering depth doesn't buy the prize.** |
| **AgentSafe** (Semgrep later blogged about it) | Lost | **No video** and created after the deadline. Every Semgrep entry without a video lost. |
| **RegRadar, Denial Rescue** (Top Overall, used ClickHouse) vs. TC Pilot | Only TC Pilot won ClickHouse | The halo from a top overall finish only counts when ClickHouse is visibly wired into the product with a number. |
| **Basket** (deeper ClickHouse) vs. LicenseTrace (one constant row) | LicenseTrace won | Presentation beat depth: Basket had 52 s of dead screen, a chart that contradicts its own claim, and no linked repo. |
| **Pulse** (best ClickHouse story in London on paper) | Lost | A **silent** video. |
| **IncidentSherpa** (our own Harness entry) vs. seconds ai and AeroRider | Lost ClickHouse; won Senso | A 9-sponsor tour gave ClickHouse 15 s; degraded states were on camera; 183 s; 75 min late. |
| **MediCall** (only real Guild SDK) vs. Branch and RxScout (none) | MediCall 3rd | The judges care about fit and story. A consumer app whose wow belongs to another sponsor ranks below engineering-workflow stories. |
| **Vocare** (two governed agents on paper) vs. Argus (one agent that fires) | Argus 1st | **One sponsor action that actually runs and leaves a real artifact beats more depth that never runs.** |
| **Projects that showed the ClickHouse console** (RegRadar, MindMesh, Market Monitor) | All lost | **Credit ClickHouse inside your own product screen**, not in its admin console. |

---

## 4. The hidden factors

1. **How crowded the sponsor's field is varies a lot.** Round 1 assumed thin fields everywhere.
   - **Nearly empty:** AWS MCP 2025, where 2 of 47 projects used ClickHouse and both won.
   - **Crowded:** NYC 2026 (60 of 75 used ClickHouse) and London (27 of 46).
   - So at most events, just using ClickHouse doesn't set you apart.
2. **Pedigree.**
   - In Ship to Prod, 3 of 6 winning teams had someone with 5+ prior wins; no matched loser did.
   - Nelson Lai (Branch, Udon Cat) runs a repeatable template for "Best use of X" prizes: a mock-mode fallback, a sponsor table, and a "real recorded run" number. That template is what you're competing against.
3. **Prize wording decides.** NYC's two ClickHouse winners matched its two published themes one-to-one. Harness hid a Langfuse slot inside the ClickHouse prize. You also have to tick each sponsor prize on Devpost or you forfeit it.
4. **Relationships.** 1st-place claimants publicly thanked Guild's VP Engineering (Magpie) and DevRel (Argus). ClickHouse staff commented on TC Pilot's Devpost before judging.
5. **Live judging overrides the video at some events.** At NYC 2026 both winners' videos were uploaded after the event, and the judge noted TC Pilot's video was unavailable. At other events the video is all the judges see. Prepare both.
6. **Domain.** At Harness, security entries won no ClickHouse or Guild prizes, while health and money stories did. Tomorrow every entry is security, so what sets you apart is a **human victim and a number** (SilverShield did this for drug recalls).

---

## 5. What every winner's code has in common (17 deep dives)

- **The LLM never makes the key decision.** Fixed rules, SQL or hardcoded logic decide, and the LLM explains or drafts.
- **The hero moment is set up so it can't fail on stage**, e.g. a planted pollution segment, a hash-chosen fix, a seeded medication effect, an injected recall.
- **Fallbacks quietly fake success**: a random ticket key, a perfect 100 score on error, random 85–98 scores, a substituted plan.
- **No winner has authentication.** Many have security holes:
  - string-built SQL from LLM output (policyDiff)
  - committed keys (Rokko, Vital Signal)
  - a server-side browser that will fetch `file://` (Argus)
  - a forgeable cron header (SynapseCRO)
  - stored XSS (seconds ai)
  - a token server that grants any role (Phalanx)
- **Sponsor work lands late.** Guild code arrived in the last hour (Magpie), after the deadline (Phalanx, Branch), or the day after (DailyGate, TC Pilot's real agent).
- **Most were built by one or two people** using AI coding tools (SynapseCRO: 43 of 45 commits co-authored by Cursor or Claude).

**What this means tomorrow:** Pi and Semgrep engineers are judging. They are the people most likely to open the repo, and the same flaws, from an entry at a *cyberdefense* event, would be an own goal. **Copy the winners' presentation, not their shortcuts:** label cached steps, add auth, use parameterized SQL, and keep no secrets in git.

---

## 6. Corrections to round 1

| Round-1 claim | Corrected |
|---|---|
| ClickHouse prizes were won in thin fields | Only true for AWS MCP 2025. NYC 2026 and London were crowded (60/75 and 27/46). |
| The 2025 Semgrep judges were AWS staff; 2026 brings a stricter product judge | **Daghan Altas (Semgrep Head of Product) judged in 2025 too.** He picked framing and fit over depth. Expect the same taste tomorrow. |
| The 2025 Semgrep rubric had 5 criteria | 4 × 25% (Idea, Tech, Tool Use, Presentation), with no Autonomy |
| IncidentSherpa lost everything | It was **your team's entry**, and it won the Senso.ai prize |
| RxScout probably showed a Guild version live | The video matches the non-Guild LangGraph build |
| Branch's Guild planner produces the plan | The plan is thrown away; the migration and PR are hardcoded |
| Darwin's demo showed Semgrep vulnerabilities | "150" = 15 failed runs × 10; the 14 real Semgrep findings were never shown |
| SynapseCRO's PR #1 came from the self-improvement loop | It was made by hand with Cursor; PR #2 is the real bot PR |
| Vocare's place unknown | Vocare (Viray, Iyer, Ye) is one of the two 2nd places, identified with high confidence |

---

## 7. Updated playbook for 9 Oct

> **Superseded in part by [sponsor-videos.md](../archive/source-tree/analysis/sponsor-videos.md) §7**, which is based on the sponsors' own recent videos. It changes four things:
> - The video copies the shape of Guild's 89-second incident-triage demo.
> - The new jobs are Semgrep "closes the loop" (ending on proof the fix worked), ClickHouse "memory at agent speed" (with a show-query toggle), and Guild "governed, scoped, accountable".
> - Say "close" instead of "detect".
> - Langfuse is part of ClickHouse's own "agentic data stack", so it is worth an optional mention.

1. **One security story, a human victim and a number in the first 10 s.** For example: "A 3-person SOC at a clinic. One bug report → 4 more holes found and closed in 90 s."
2. **Give each sponsor a 3-word job and one on-screen moment where it decides something:**
   - **Semgrep:** "the immune system". A rule is learned from one report, `--test` passes, and it finds 1 → 4 bugs.
   - **ClickHouse:** "security memory". A product panel shows recurrence and time-to-protection, with ms and row count. **Never show the ClickHouse console.**
   - **Guild:** "least privilege". Triage *can't* write; only the operator can, after approval, with real `session_url`s.
   - **Pi:** "memory, not detection" (the thesis line at the close).
3. **Keep the Semgrep beat uncluttered.** Its payoff must not be another sponsor's output (the TidyShot trap).
4. **Video:** 2:30–2:50, narrated, live product by 0:20, rehearsed, uploaded by **4:20 PM**. Before recording, search the UI for "DEGRADED", "failed", "not configured" and "SKIPPED". Cut any sponsor that isn't working by 3:30 PM rather than show it broken.
5. **Write `SPONSORS.md` in Branch's four-block format:** what we use / where in the demo (timestamp) / live proof / one-line pitch. Add one "lesson learned" per sponsor, using builder vocabulary.
6. **At kickoff,** read each prize's exact wording and themes, tick every prize on Devpost, and pitch your idea in one sentence to Corbett, Dustin/Zoe and Daghan/Milan.
7. **Be honest where the judges can check:** a "What's real vs. seeded" README section, cached steps labelled on screen, auth on routes, parameterized SQL, no secrets, and Semgrep run on your own repo showing it clean.
