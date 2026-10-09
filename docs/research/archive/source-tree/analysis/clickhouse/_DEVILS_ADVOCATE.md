> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# ClickHouse: devil's advocate review

Reviewer: ClickHouse Devil's Advocate, 8 Oct 2026. Read-only. RedBot is out of scope.

This review tests the conclusions in `_TEAM_A.md`, `_TEAM_B.md` and the ten per-project files against:
- the repos (`repos/clickhouse/*`, plus the SynapseCRO and Vital Signal clones in the session scratchpad)
- Devpost pages re-fetched on 8 Oct 2026
- the Devpost galleries for Harness Engineering Hack (78 projects) and Multiagents London (46 projects)

Labels: **[V]** = I re-checked it myself. **[I]** = inference.

---

## 1. Fact-check table

| # | Claim (team) | Verdict | My evidence |
|---|---|---|---|
| 1 | LicenseTrace writes one hardcoded row (`server.js:627`), and live scans never reach ClickHouse (B) | **CONFIRMED** | **[V]** `server.js:627-632` passes the literals `root:"gatsby"`, `contaminated:1`, `copyleft:"smartwrap"` and a fixed path string. `saveScan` is the only ClickHouse writer: `server.js:233-258` does a CREATE, an INSERT and then `SELECT count()`. The `/api/scan-sources` live path (`:604-620`) never calls it. Nothing reads the table back. The SQL is built by string concatenation with a hand-rolled `esc` (`:239,248-251`). The last commit is `1c08cb3` at 15:59 BST, before the 16:30 deadline, so the repo probably matches what was judged. |
| 2 | TC Pilot's before/after "3.74 points" reads back an effect the seeder put there (A) | **CONFIRMED, with one nuance** | **[V]** `backend/app/routes/admin.py` sets `MED_EFFECTS = {"ondansetron": [("nausea", -3.0)], …}` and adds a sinusoidal `_chemo_ramp`. The query is real (`avgIf`/`countIf`), but the insight is the generator constant plus confounding from the chemo ramp. The Devpost entry discloses the seeding, so this is a weakness only if a judge asks "what did you learn?". |
| 3 | TC Pilot uses 5 ReplacingMergeTree and 2 MergeTree tables (A) | **CONFIRMED** | **[V]** `clickhouse_client.py:39,48,66,85,103` are ReplacingMergeTree; `:56,76` are MergeTree. |
| 4 | AeroRider has 3 MVs plus AggregatingMergeTree, and reads the rollups (B) | **CONFIRMED** | **[V]** `sql/schema.sql` has 3 `CREATE MATERIALIZED VIEW` statements (`:48,84,144`), 2 AggregatingMergeTree targets (`:43,81`), 1 SummingMergeTree (`:139`) and TTLs (`:17,32,46,127,142,180`). The reads are real: `backend/app/queries.py:320-335,608` use `avgMerge`/`countMerge`/`maxMerge`. **Caveat:** the whole 8.7k-line repo is a single commit, `347e95c` "Initial AeroRider demo", at 16:24 PDT on event day. Nothing proves it was built during the event, and nothing shows what was live at judging. |
| 5 | SynapseCRO's commits sit at exact 5-minute intervals the day before the event (B) | **CONFIRMED** | **[V]** 8 commits run from `c4c3a49` to `7eaf4b5`, 2026-06-25 09:00:00 to 09:35:00 +0100. Author date and committer date are identical to the second, which suggests scripted history. The first ClickHouse commit is `c3a27bc` at 11:15 on event day. **This breaks the London rule "Projects must be built during the event", and the team still won.** |
| 6 | Rokko's schema has no clicks column, so its CTR claim is unsupported (A) | **CONFIRMED for the published SQL; OVERSTATED as a conclusion** | **[V]** `ad-simulator/setup-clickhouse.sql:6-17` has only impression columns, and no `.sql` file contains a click field. However, the agent backend that computed "CTR" is unpublished (Team A says so itself). The repo is a re-push ("Refreshing the repo", 2025-07-25 22:33). "Unsupported" really means "unverifiable". |
| 7 | IncidentLogica has no ClickHouse (A) | **OVERSTATED** | **[V]** Devpost Built With lists only aws, bedrock, claude and temporal, and the story never mentions ClickHouse. But the sponsor itself, the party that judged it, wrote that it stored "incident timelines, prompts/responses, and metrics". The defensible claim is "no public evidence", not "no ClickHouse". The team may have shown it at the booth. |
| 8 | Vital Signal's "189 WHO alerts" are 5 hardcoded alerts, and its SummingMergeTree MV was probably never created (A) | **CONFIRMED** | **[V]** `structify_service.py` returns `self._get_fallback_alerts()` unconditionally, with the comment "For demo reliability, use fallback data". `scripts/init_db.py` drops every `;`-split chunk that starts with `--`, and `database_schema.sql` starts with comments. `create_tables_manual.py` creates only 4 MergeTree tables and no MV. Whether the MV was created by hand in the console is unknowable. |
| 9 | EARWITNESS won the Langfuse slot ("inference") (B) | **CONFIRMED, and stronger than Team B said** | **[V]** Commit `b3777c8` (2026-06-25), "docs: highlight harness langfuse award", sets the README line to "**Harness Engineering Hack: Best use of Langfuse**". This is a team self-claim, not inference. Its ClickHouse code is 3 plain MergeTree tables (`clickhouse_events.py:44,60,74`). |
| 10 | seconds ai uses scoped ClickHouse users and GRANTs per agent (B) | **OVERSTATED** | **[V]** The `CREATE USER guild_writer` and `GRANT INSERT …` statements appear only in `guild/README.md:13-15`, as setup instructions. No code creates them, so whether they existed in the demo database is unverified. |
| 11 | "Two of the five never name ClickHouse in the demo" (A §4) | **WRONG (internally inconsistent)** | Team A's own table marks policyDiff "Never named", IncidentLogica "Never named" and Vital Signal "Never on screen" (a silent video). That is **3 of 5** winners with no ClickHouse moment in the recording, which makes the "make the ClickHouse moment explicit" rule weaker, not stronger. |
| 12 | "Langfuse counts as ClickHouse" (B, pattern 9 / formula 5) | **CONFIRMED for Harness only; WRONG as a general rule** | **[V]** The Harness prize text lists "$500 … for the most impressive use of Langfuse" under Best Use of ClickHouse. The London ClickHouse prize text (re-fetched) has **no Langfuse line**. The Cyberdefense partner list (Luma and LinkedIn) **does not mention Langfuse**. |

**Net:** the code-level facts mostly hold (8 confirmed of 12). Where the teams went wrong is in **what they concluded from those facts** (claims 6, 7, 11 and 12), not in the facts themselves.

---

## 2. Causal challenges

The teams' thesis is that judges reward a visible data → action loop and a strong narrative, not ClickHouse depth. Below are the strongest alternative explanations, ranked by how much I think each one threatens that thesis.

1. **n ≈ 10, no control group, ranks mostly unknown.**
   - There are 11 ClickHouse winners across 6 events. Only Rokko, IncidentLogica and Vital Signal have sponsor-confirmed ranks.
   - There are no scorecards, and until §3 below the teams looked at zero losers.
   - Any "formula" fitted to this set is a story that fits 10 points. **Confidence that any single factor is causal: low.**

2. **Small, thin pools: the base rate, not the formula.**
   - NYC had about 20 submissions (blog [V]).
   - London had 46 gallery projects for 2 slots. Harness had 78 for 3 slots.
   - At London, at least 4 of the 46 visibly used ClickHouse in their gallery card or story: LicenseTrace, SynapseCRO, Basket and ResearchAgent [V]. If the eligible pool is about 4–8, any competent entry has a 25–50% prior.
   - IncidentLogica placing 2nd with no visible ClickHouse is best explained by a thin pool. That rewards *showing up with ClickHouse at all*, not any particular pattern.

3. **General quality and finalist gating (the Top-Overall halo).**
   - TC Pilot won Top Overall and Best ClickHouse. Quality is correlated across prizes.
   - At Cyberdefense, only **finalists demo live at 5 PM**. If sponsor judges pick mostly from finalists, the first gate is overall quality: Idea, Autonomy and Presentation make up 60% of the rubric and are not ClickHouse-specific.
   - "Narrative wins" may just mean "good teams win everything".

4. **Sponsor relationship and mentor engagement.**
   - The NYC blog credits on-site pair programming on schema design.
   - ClickHouse staff (Nataly Merezhuk) commented on TC Pilot's Devpost before judging [V, tc-pilot.md §1].
   - Teams that talked to ClickHouse mentors became known to the people judging. This is unobservable in repos and could dominate.

5. **Rules are not enforced, so judging is impression-based.**
   - SynapseCRO pre-built its base product, against an explicit rule [V].
   - TC Pilot's video runs 263 s against a 3-minute limit [V].
   - LicenseTrace's only ClickHouse write is a constant [V].
   - Nobody audited the repos. This *supports* the teams' "story beats code" view. But it also means **code-depth claims about winners cannot explain wins**, in either direction.

6. **Judge identity has changed.**
   - The 2025 recaps came from ClickHouse DevRel and marketing.
   - Tomorrow's listed ClickHouse judge is **Dustin Healy, Full Stack SWE**, and the ClickHouse speaker is Zoe Steinkamp (DevRel).
   - An engineer judge may weigh correct engine use and SQL quality more than past DevRel judges did. The history may not transfer [I].

7. **The current repo is not the judged version.**
   - AeroRider is a single dump commit. Rokko is a re-push.
   - EARWITNESS's MV lived only in the console. The seconds ai demo ran on non-default branches. SynapseCRO and TC Pilot have later commits.
   - Statements of the form "X lacked feature Y" are therefore weak for four of the inspectable winners.

8. **Recency, ordering and live-booth effects.** Booth demos were never observed. ClickHouse moments may have happened live (IncidentLogica), which biases every "never named in the video" claim.

**What survives:** "Deep ClickHouse is not *necessary*" is well supported, because LicenseTrace and IncidentLogica won. "A visible loop plus narrative is *sufficient*" is **not** supported. See §3.

---

## 3. Survivorship evidence (non-winners that used ClickHouse)

| Project (event) | ClickHouse use (source) | Result | Lesson |
|---|---|---|---|
| **IncidentSherpa** (Harness) https://devpost.com/software/incidentsherpa | ClickHouse Cloud with **live `LAG/LEAD` window SQL computing cross-service causal chains, with the SQL shown on screen**. Also **Langfuse** traces shown ("six total traces"), plus Slack and Jira actions through Composio. Demo transcript [V]: "click house finds the real cause … We can actually see like the SQL … a real database query not just some guess by an AI". 183 s. | **Lost all 3 ClickHouse/Langfuse slots** | **This is almost exactly the recommended Cyberdefense formula, in an incident-response domain, and it lost.** The visible differences: 9 sponsors (sprawl), a halting delivery full of "um", a "fake engineer" admitted on stage, and no quantified payoff. The formula is not sufficient. Execution and focus decide it. |
| **Basket** (London) https://devpost.com/software/basket-dgx3h4 | ClickHouse as the "Aggregator/Detector": a week × category rollup, spike detection against a baseline, all in SQL, with idempotent ingest via `uniqExact(source_url)` (Devpost [V]). | Lost to LicenseTrace (decorative) and SynapseCRO | This is Team B's recommended "encode a concept as one aggregation" pattern, and it lost to a constant-row INSERT. The video is an 85-second raw "Screen Recording … 163945", recorded at 16:39, after the 16:30 deadline [V]. **Presentation and polish beat depth.** |
| **ResearchAgent** (London) https://devpost.com/software/researchagent-feihnl | Stores Q&A history and a History page reads it back (Devpost [V]). The depth is about the same as LicenseTrace. | Lost | Equal (shallow) depth gave opposite outcomes. Depth did not discriminate, but the loser had a generic idea, 6-sponsor sprawl and a Loom video. |
| **Magpie** (Harness, won Guild) | Real MergeTree tables and real queries behind a "live, queryable dashboard" on seeded rows (`repos/guild-ai/magpie/clickhouse/create_table.sql:11`; guild analysis [V]) | Won Guild, not ClickHouse | A dashboard built on ClickHouse is not enough. |
| **DailyGate** (Harness, won Guild) | Its ClickHouse schema uses ReplacingMergeTree for the decision and trust tables (`data/schema.sql:33,41`), but **the runtime data lane is SQLite** (guild-ai/dailygate.md:77,117 [V]) | Won Guild, not ClickHouse | Claimed but unused ClickHouse did *not* win. This weakly suggests something real has to touch ClickHouse. |

**Survivorship verdict:**
- Losers include entries **deeper** than some winners (IncidentSherpa and Basket versus LicenseTrace).
- Neither depth nor a visible SQL loop predicts winning.
- The best remaining discriminators are **demo polish, a single sharp idea, sponsor focus (fewer than 5 tools) and a quantified payoff**. All of these are general hackathon factors, not ClickHouse factors.

---

## 4. Formula stress-test (ClickHouse decision engine, one security aggregation, Langfuse traces, SQL drawer)

Each risk is followed by its mitigation.

1. **Langfuse is a weak bet at this event.**
   - It is not a listed partner. The Langfuse sub-prize existed only at Harness, and IncidentSherpa showed Langfuse and lost.
   - It costs 30–45 minutes (keys, SDK, trace naming) out of 330.
   - **Mitigation:** add it only if tomorrow's Devpost prize text mentions Langfuse. Otherwise log agent decisions in a ClickHouse `agent_runs` table, which counts directly as ClickHouse use.

2. **MV and AggregatingMergeTree demo traps.**
   - An MV fires only on inserts made after it is created. If you seed first, the rollup is empty on stage.
   - `-State`/`-Merge` mistakes return blobs. An MV over a ReplacingMergeTree source double-counts updates.
   - **Mitigation:** create the MVs *before* seeding, and keep a plain `GROUP BY` fallback query. A SWE judge will ask "why an MV here?", so have a one-sentence answer ready ("pre-aggregates per-minute so the agent's query reads N rows, not M").

3. **ReplacingMergeTree correctness.** Without `FINAL`, or `argMax`, duplicates show up before merges run. A ClickHouse engineer will spot that instantly. **Mitigation:** use `FINAL` on small tables and say why.

4. **The security-hygiene own-goal.**
   - Semgrep and Pi engineers are on the panel. String-built SQL (LicenseTrace and policyDiff style), committed keys (Rokko and Vital Signal) or unauthenticated admin routes (TC Pilot) will be flagged on stage at a *cyberdefense* event.
   - **Mitigation:** use ClickHouse parameterized queries (`{x:String}`) and `.env` files kept out of git. Run Semgrep on your own repo, and show the clean result as a proof point.

5. **Synthetic security data will be probed.**
   - The Pi engineers are application-security practitioners, and a seeded attack stream invites "is this real?".
   - **Mitigation:** make at least one stream real, such as Semgrep findings on real public repos or OSV/CVE feeds. Seed only the attack scenario, and disclose it in the first 20 seconds (as Rokko did).

6. **The SQL drawer reads as a gimmick unless the SQL decides something.**
   - IncidentSherpa showed its SQL and lost.
   - **Mitigation:** the drawer must sit next to a *changed outcome*, such as a severity re-rank, a blocked PR or a quarantined asset, plus a number ("this query over 2.1M events in 48 ms moved X from P3 to P1").

7. **Scope and integration risk in 5.5 hours.**
   - Stacking ClickHouse, Guild, Semgrep and Pi gives four failure points. IncidentSherpa's 9 sponsors diluted its pitch.
   - Venue Wi-Fi plus ClickHouse Cloud's HTTPS port 8443 is a single point of failure.
   - **Mitigation:** create the ClickHouse Cloud service and keys tonight (Vital Signal precedent), and test port 8443 from a tether. Keep a local `clickhouse-server` or a recorded fallback. Freeze features by 3:30 PM.

8. **Autonomy is 20% of the score.** A button-triggered loop scores lower on autonomy. **Mitigation:** a scheduled or streaming trigger (cron, or a Guild schedule) that fires the aggregation and the action without a click.

9. **Judges may watch only the video, or only the finalist demo.** Plan for both: a 2:45 video with ClickHouse named at the decision moment, and a 3-minute live script with the same beats.

---

## 5. Revised winning formula, with confidence levels

| # | Element | Confidence | Why |
|---|---|---|---|
| 1 | **Reach the finalists first: one sharp security idea, a polished 2:30–2:50 demo, a quantified payoff ("cut exposure from 37 to 4 assets")** | **High** | Wins correlate with overall quality (TC Pilot's Top-Overall badge). Losers with deeper ClickHouse use (IncidentSherpa, Basket) lost on polish. |
| 2 | **ClickHouse must actually be in the runtime path, with no claimed-only use** | Medium-high | DailyGate (SQLite underneath) lost the ClickHouse prize. LicenseTrace shows the bar is low, but it is real. |
| 3 | **One ClickHouse query changes a security decision on screen, with ms and row count shown** | Medium | It is necessary to *communicate* "best use" to a SWE judge, but IncidentSherpa proves it is not sufficient. |
| 4 | **Fewer than 5 sponsor tools, with ClickHouse as the spine** (ClickHouse + Semgrep + Guild, Pi as thesis fit) | Medium | IncidentSherpa (9 tools) and ResearchAgent (6) lost. Winners name 2–4 tools in the story. |
| 5 | **Clean hygiene as part of the pitch**: parameterized SQL, no secrets, Semgrep-clean repo | Medium (event-specific) | The judging panel is security engineers. This went unpenalised before, but that was not a security event. |
| 6 | **Autonomous trigger** (schedule or stream), not a button | Medium | Autonomy is 20%, and every 2026 winner used the framing. |
| 7 | **One idiomatic engine feature with a one-line justification** (MV → AggregatingMergeTree rollup, *or* TTL, *or* ReplacingMergeTree lifecycle) | Low-medium | AeroRider did the most and was creator-reported 2nd, not 1st. It is cheap differentiation for an engineer judge, but only if it works on stage. |
| 8 | **Talk to the ClickHouse mentors early** (Zoe Steinkamp and Dustin Healy) about schema design | Medium (unobservable) | The NYC blog credits pair programming. Familiarity with judges is a plausible hidden factor. |
| 9 | Langfuse traces | **Low** | Only relevant if the prize text mentions it. It is not a listed partner, and IncidentSherpa had it and lost. |
| 10 | SQL "judge drawer" | Low-medium | Worth it only alongside #3. On its own it is decoration. |

---

## 6. Open questions

1. What exactly does the **Cyberdefense ClickHouse prize text** say: "Best Use", the number of slots, and any Langfuse line? Screenshot the Devpost at kickoff (it currently returns 403).
2. Do sponsor judges score **all submissions or only finalists**? This decides whether the video or the live demo matters more.
3. Is Dustin Healy judging alone or with DevRel? Does he read repos?
4. How many teams will use ClickHouse? If ClickHouse is the only analytics sponsor (MongoDB is also a partner), the pool may be larger than at London or NYC.
5. Is **AeroRider** actually ranked 1st or 2nd, and who took Harness "Team #1"? That would tell us whether the deepest entry beat the shallower seconds ai.
6. What did IncidentLogica show at the booth that made the sponsor write up its ClickHouse use?
7. Why did IncidentSherpa lose? Was it delivery, timing, being overshadowed by seconds ai and AeroRider, or a technical failure? Its repo was not located or checked.
8. Is Basket's 16:39 recording a late submission (which would make it ineligible, not a loser on merit)?
