> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# ClickHouse — Team B summary (2026 tokens& events)

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Projects: [seconds ai](seconds-ai.md), [AeroRider](aerorider.md), [EARWITNESS](earwitness.md) (Harness Engineering Hack, SF, 12 Jun 2026), [LicenseTrace](licensetrace.md), [SynapseCRO](synapsecro.md) (Multiagents Hackathon, London, 26 Jun 2026).

## Prize and judging facts (verified on Devpost, 8 Oct 2026)

| Event | ClickHouse prize text | Field | Judging criteria |
|---|---|---|---|
| Harness Engineering Hack (https://harness-hack.devpost.com/) | "Best Use of ClickHouse — $1,600 in cash — 3 winners. Team #1: $1000 amazon gift card/visa card, $500 ClickHouse credits. Team #2: $500 ClickHouse credits, $250 Cash/amazon gift card. **$500 Cash/amazon gift card for the most impressive use of Langfuse**" | 187 participants | Idea 20%, Technical 20%, Tool Use 20%, Presentation (3-min demo) 20%, **Autonomy 20%** ("How well does the agent act on real-time data without manual intervention?") |
| Multiagents Hackathon London (https://multiagents-hackathon.devpost.com/) | "Best Use of ClickHouse — £1,000 in cash — 2 winners. 1st place: $1,000 gift card (USD) + $500 ClickHouse Cloud credits. 2nd place: $300 ClickHouse Cloud credits." | 82 participants; "Projects must be built during the event. Maximum team size of 3." | Idea, Technical Implementation, Tool Use, Presentation, Autonomy (same wording, no weights shown) |

No ClickHouse-specific judging rubric beyond "Best Use of ClickHouse" was published. **No ClickHouse blog or LinkedIn recap of either 2026 event was found** (firecrawl searches, 8 Oct 2026); the 2025 events had sponsor recaps. The closest official sponsor voice is ClickHouse's own Click-a-Thon page (https://clickhouse.com/clickathon/india2026): "**Ship something real, not a demo. Judges can smell a slide deck. Build a working prototype on ClickHouse … that solves an actual problem a customer would pay for.**" ClickHouse acquired Langfuse on 16 Jan 2026 (clickhouse.com/blog/clickhouse-acquires-langfuse-open-source-llm-observability), which explains the Langfuse sub-prize inside the ClickHouse category.

## Sponsor-usage depth table

| Project | Engines | MVs | TTL | Geo/JSON/array funcs | Other notable | Read path changes decision? | ClickHouse in video | Depth |
|---|---|---|---|---|---|---|---|---|
| **AeroRider** | ReplacingMT, **AggregatingMT** (`-State/-Merge`), SummingMT, MergeTree | **3** (in repo DDL) | yes (2h / 45d / `expires_at`) | `geoToH3`, `h3kRing`, `pointInPolygon`, `geoDistance`, window `row_number()` | **ExternalData** temp table per query; `system.parts` introspection; MATERIALIZED col | **Yes**: the route flips after a Gemini hazard is inserted and re-scored | ~40% of narration plus a hidden judge drawer | **core-to-the-pitch** |
| **seconds ai** | ReplacingMT ×3, MergeTree | 0 (2 plain views) | no | `uniqExact(If)`, `arrayJoin`, `groupUniqArray`, `toJSONString(map())` | **Scoped users + GRANTs** per agent; HTTP JSONEachRow insert from a Guild sandbox | Partly: `/cases` and the mailer read ClickHouse, but the mailer uses the heuristic score with `LIMIT 1` | 4 mentions, "stored in ClickHouse"; aggregation never shown | **load-bearing** |
| **SynapseCRO** | MergeTree ×5, SummingMT | 1 (target unused by funnel) | yes (365d) | `ARRAY JOIN JSONExtractArrayRaw`, `countIf`, `dateDiff` | **aggregate memory → LLM prompt** at 5 call sites; `/clickhouse` showcase page | **Yes**: persistent findings change agent prompts | 1 mention ("for its back end") | **load-bearing** (core to the Devpost sponsor text) |
| **EARWITNESS** | MergeTree ×3 | 1 (**console only**, not in repo) | no | `sumIf`/`countIf` P&L | `async_insert` + `wait_for_async_insert`; per-thread clients | No: dashboard/ledger only | **0 mentions** | **thin wrapper** (the win is most likely the Langfuse slot) |
| **LicenseTrace** | MergeTree ×1 | 0 | no | none | raw HTTPS interface, string-built SQL | No: write-only, a **hardcoded** constant row; live scans not logged | 1 mention (3:02) | **decorative** |

## Cross-project patterns

1. **Depth of ClickHouse use did not determine whether a team won.** It spans "core" (AeroRider) to "decorative" (LicenseTrace) among winners, so these prizes were judged holistically (story, autonomy, polish) with ClickHouse as a qualifier. The creator-reported rank for AeroRider was 2nd, which suggests even the deepest technical ClickHouse entry did not obviously take 1st at Harness. The rank for the others is unknown.
2. **The best ClickHouse stories encode a domain concept as an aggregation.** Examples: numerosity → `uniqExact(author)` (seconds ai), respiratory load over a route → H3 joins + `avgMerge` (AeroRider), "issue persists across audits" → `count(DISTINCT audit_id)` + `dateDiff` (SynapseCRO). Each team could say *why ClickHouse*, not just *that ClickHouse*.
3. **A read-back loop is the differentiator.** The strongest entries (AeroRider, SynapseCRO) write AI output into ClickHouse and read aggregates back to change the next decision. The weaker ones only log.
4. **A judge-facing ClickHouse surface** (AeroRider's hidden "What Happened" drawer, SynapseCRO's `/clickhouse` page, EARWITNESS's P&L strip). Winners make the database visible without cluttering the product.
5. **Autonomy framing is universal** (it is 20% of the score): cron/Guild schedules, background loops, "no human in the loop" lines in every video.
6. **Real-world grounding beats synthetic toys**: a named incident (Gatsby/smartwrap), real SF cameras and AQI, real Reddit/web posts, real on-chain receipts. However, every winner also seeds or plants its demo data (AQI corridor, planted lie track, curated 13-package graph, seeded "14-day persistent" findings, cached Pioneer outputs). **Deterministic seeded demos plus real integrations is the norm.**
7. **Claims exceed code in 4 of 5 projects** (Composio/Senso/OTel in seconds ai, the simulated x402 in LicenseTrace, the MV not in the repo for EARWITNESS, the eval self-improvement reading Supabase in SynapseCRO). Judges evidently did not audit repos deeply in a 1-day event.
8. **Heavy AI-assisted building** (CLAUDE.md briefs, Codex handoffs, Cursor); every team shipped 2k–25k lines in ~6 hours.
9. **Langfuse counts as ClickHouse.** At Harness a third of the ClickHouse prize slots went to Langfuse use.

## Common demo structure (observed)

`Hook: a pain with money/health/legal stakes (0:00–0:30)` → `"key idea" one-liner` → `live run on real-looking data` → `sponsor roll-call or behind-the-scenes panel` → `payoff moment (phone notification / route flips / red path lights up / payment withheld)` → `one-line thesis`. Video lengths were 84–206 s; three of five were under 2:30 of the allowed 3:00. Only AeroRider puts ClickHouse on screen as the decision engine.

## Ranked "winning formula" for the ClickHouse prize (for Cyberdefense, 9 Oct 2026)

1. **Make ClickHouse the decision engine, not the log.** The agent (or Semgrep/Pi/Guild step) writes findings or verdicts into ClickHouse. A ClickHouse query (aggregates, windows, distinct counts) re-ranks or decides, and the outcome visibly changes on screen (AeroRider pattern).
2. **Encode one security concept as one memorable aggregation** and put the SQL on a slide. Examples: `uniqExact(src_ip)` per (asset, technique) in 1h/24h `uniqExactIf` windows = campaign detection; `count(DISTINCT scan_id)` + `dateDiff(first_seen,last_seen)` = "still unfixed after N scans" (seconds ai + SynapseCRO patterns).
3. **Use idiomatic ClickHouse features in repo DDL**: MV → AggregatingMergeTree (`uniqState`, `countState`) rollups, TTL on ephemeral AI verdicts, ReplacingMergeTree for finding lifecycle, ExternalData for "this scan's SBOM/IP list", parameterized queries, async inserts. Keep all DDL in code (EARWITNESS's console-only MV is a cautionary tale).
4. **Feed ClickHouse history back into the LLM prompt** ("Historical security memory (ClickHouse): …"), so memory changes the next triage (SynapseCRO pattern).
5. **Add Langfuse traces of the agent's decisions** (public traces, sessions, scores). ClickHouse owns Langfuse, so it is plausibly double credit with the same judges.
6. **Build a judge drawer or page** showing the executed SQL, ms, rows read (`system.query_log`), tables/engines/MVs (`system.tables`/`system.parts`).
7. **Narrate ClickHouse explicitly in the video** at the decision moment, put "(ClickHouse)" in the video title, and write a Devpost "Sponsor Section" plus a "ClickHouse challenges we hit" paragraph (SharedMergeTree, FINAL, per-thread clients).
8. **Security-specific hygiene judges will check**: least-privilege ClickHouse users (seconds ai's GRANTs), no string-built SQL (LicenseTrace), and no false-negative edge cases in detection rules (LicenseTrace's `-or-later` bug).
9. **Stage determinism**: seed a known-bad scenario so the catch cannot miss (every winner did this), but disclose it.

## Explicit uncertainties

- **Ranks**: no official ranks for any of the five. AeroRider's "2nd" is creator-reported. "team 1" in the seconds ai title is not a rank. Which Harness team got "Team #1" vs "Team #2" vs the Langfuse slot is unknown. That EARWITNESS took the Langfuse slot is **inference** from its README and the prize text.
- **Judged version vs. repo**: AeroRider has a single commit 6 minutes before the deadline. EARWITNESS and SynapseCRO have later commits (analyzed at event-day state where possible). The seconds ai hosted demo lives on non-default branches. The demo DB schemas for seconds ai (`profit`) and EARWITNESS (MV, columns) differ from repo DDL.
- **SynapseCRO repository identity** is strong but rests on circumstantial evidence (same Devpost user ↔ GitHub handle, matching routes/features, the `/clickhouse` page). Its June-25 synthetic-cadence timestamps are unexplained; they may reflect history rewriting rather than true pre-work, but either way they predate the event.
- **Live booth demos** (4:30–5:00 PM) were not observable; the ClickHouse moments may have been shown live but not in the videos.
- **Video content** was analyzed from YouTube auto-captions, not frames. On-screen claims (e.g. AeroRider's drawer) were cross-checked only via repo screenshots.
- **Hosted apps** were checked on 8 Oct 2026 only: EARWITNESS is suspended, SynapseCRO's ClickHouse page is disconnected, seconds ai's backend is up in `demo_mode`. No logins or audits were run.
- **AeroRider bike-count overcount** and the **LicenseTrace npm package names** are inferences from SQL and CSV contents, not verified by execution or registry lookup.
- **On-chain payouts** (EARWITNESS) and **Pioneer fine-tune deployment** (seconds ai) are taken from repo artifacts and were not independently verified.
