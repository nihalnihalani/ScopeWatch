> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# ClickHouse Team A: team summary

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

This summary covers the five projects with full write-ups in this folder: `rokko.md`, `policydiff.md`, `tc-pilot.md`, `incidentlogica.md` and `vital-signal.md`. RedBot is left out; §7 explains why.

Labels: **[V]** means verified, with the citation in the per-project file. **[I]** means inference.

## 1. What the sponsor said it valued

These come from the two ClickHouse recap blogs, which I fetched in full on 2026-10-08:
- https://clickhouse.com/blog/aws-mcp-hackathon-san-francisco
- https://clickhouse.com/blog/nyc-ai-agents-hackathon

They are the only first-party statements about judging. No scorecards exist.

**Rokko (1st, SF).** The blog said:
- Kafka streams events into ClickHouse "for feature computation; the agent reacts to fresh signals."
- "Millisecond-class aggregations and joins on streaming data made model features instantly queryable."

**IncidentLogica (2nd, SF).** The blog said:
- ClickHouse stored "incident timelines, prompts/responses, and metrics for post-mortems."
- The team's advice was "Fake it till you make it - how you tell the story matters."

**VitalSignal (1st, NYC).** The blog said:
- "ClickHouse sits at the center of the architecture."
- The team's approach was "Decisions first, hacking second" and "Stable core, then integrations."
- "A small, polished project beats an ambitious, half-broken one every time."

**SF takeaways across teams:**
- "Streaming → features → actions."
- "Production-grade UX… analytics feel instantaneous."
- "Observability by default: Storing prompts, traces, and metrics made it easy to explain model behavior."

**NYC takeaways across teams:**
- "ingest data → store in ClickHouse → compute features → let agents act."
- "MVPs over grand visions… Shipped a narrow but usable loop."
- On-site pair programming on schema design helped.

**NYC context:** about 135 attendees, about 20 submissions, at least 3 sponsor tools required, and ClickHouse was the only database sponsor.

**Rubric implied by these quotes [I]:**
1. A visible data → agent → action loop.
2. A narrow scope that works end to end.
3. ClickHouse chosen early and placed at the centre.
4. Decisions and traces stored so the agent's behaviour can be explained.
5. A UI that feels instant.

Advanced engine features are never cited as a reason for winning.

## 2. Usage depth by project

| Project | Award evidence | ClickHouse features found in code | Depth |
|---|---|---|---|
| Rokko | 1st (badge + blog) **[V]** | Kafka table engine → parsing materialized view → MergeTree `PARTITION BY` day, `ORDER BY (campaign_id, timestamp, ad_id)`, LowCardinality columns, 2 plain views (`setup-clickhouse.sql`) | Load-bearing for ingestion; agent query side unpublished |
| IncidentLogica | 2nd (blog) **[V]** | None found; ClickHouse is absent from the Devpost tech list, the narration and the nearest repo | Unverifiable; likely decorative or absent |
| Vital Signal | 1st (blog) **[V]** | 4–6 MergeTree tables, `PARTITION BY toYYYYMM`, JSON stored in String columns, base64 images; a SummingMergeTree MV is defined but probably never created | Load-bearing (light) |
| policyDiff | Category winner (badge); 1st is creator-claimed | ReplacingMergeTree + `FINAL` for version diffing, a work-queue table, GROUP BY revenue rollups, inter-service bus | Load-bearing |
| TC Pilot | Best use of ClickHouse + Top Overall (badges); 2nd is creator-claimed | 5 ReplacingMergeTree + 2 MergeTree tables, `avgIf`/`countIf` before/after query, `toDate` trends, write-then-read health check, Datadog spans | Load-bearing, near core-to-the-pitch |

**Features not used by any project:** TTL, projections, AggregatingMergeTree rollups that are actually created, vector search, and a ClickHouse MCP server. Every winner used ClickHouse at a basic to moderate level **[V across files]**.

## 3. Cross-project patterns

1. **Winners showed a loop, not just storage.**
   - Rokko: query → reallocate creatives → re-poll.
   - TC Pilot: aggregates feed the agent, plus an analytics screen.
   - policyDiff: diff → classify → dollar impact.
   - Vital Signal: stored profile → personalised alert → real email.
2. **Synthetic or seeded data is normal.** It appears in every inspectable project: Rokko's simulator (disclosed), TC Pilot's seeded cohort, policyDiff's demo trigger and hand-typed rates, and Vital Signal's 5 hardcoded alerts. Judges did not penalise it. The projects that disclosed it lost nothing **[I]**.
3. **Claims ran ahead of the code**:
   - Rokko's CTR claim has no clicks column.
   - "189 WHO alerts" in Vital Signal are really 5 hardcoded ones.
   - IncidentLogica's ClickHouse use exists only in the blog.
   - TC Pilot's headline effect is a seeder constant.
   - policyDiff's headline figure comes from hand-typed rates.

   Judges appear to have scored the demo and the story, not the repo **[I]**.
4. **Solo and two-person teams won.** Rokko and Vital Signal were solo builds, and TC Pilot had two people.
5. **Preparation before the event.** Vital Signal pre-created accounts and keys. TC Pilot did a practice run and wrote contract docs. policyDiff wrote per-engineer specs.
6. **Hygiene was poor.** Committed credentials (Rokko, Vital Signal), SQL built by string formatting (policyDiff) and unauthenticated admin routes (TC Pilot) did not cost these teams. Cyberdefense judges (Semgrep, Pi Security) are likely to notice the same issues **[I]**.

## 4. Common demo structure

| Beat | Rokko (167 s) | TC Pilot (263 s) | policyDiff (119 s) | IncidentLogica (130 s) | Vital Signal (108 s, silent) |
|---|---|---|---|---|---|
| Hook | Names 3 sponsors at 0:00 | Weak hook | Problem statement | Team intros at 0:01 | — |
| Data disclosure | Simulator admitted at 0:14 | Seeded cohort | "Generated" at 1:10 | — | — |
| Live run | Chat setup 0:37–1:05 | Pathology run 0:46–1:03 | Dashboard tour only | Fallback 0:34–1:10 | Airia agent run |
| ClickHouse moment | 1:07–1:20, agent queries ClickHouse | 3:27–4:15, sub-second analytics | Never named | Never named | Never on screen |
| Payoff | Creative set to 94% (1:59–2:16) | "Improved nausea by 3.74 pts" | $ at risk | Slack report | Real Gmail emails |

Two of the five never name ClickHouse in the demo. The two that do (Rokko and TC Pilot) put the query on screen next to an effect it caused.

## 5. Ranked winning formula for the ClickHouse prize [I]

1. **One closed loop shown live in under 3 minutes.** Data lands in ClickHouse, a query produces a number, the agent acts, and the data visibly changes.
2. **Make the ClickHouse moment explicit.** Show the SQL, its latency in milliseconds, and say "ClickHouse" out loud.
3. **A quantified consequence from a ClickHouse aggregate.** Examples: dollars at risk, a before/after effect size, or blast radius.
4. **Persist every agent decision and trace in ClickHouse and query it on stage.** This is the blog's "Observability by default" point.
5. **A real external artifact at the end.** An email, Slack message, ticket or PR.
6. **Narrow scope plus a personal "why."**
7. **One visible engine feature beyond MergeTree.** Candidates: a materialized-view rollup, TTL, or Kafka/ClickPipes ingestion. It is cheap differentiation, because no past winner went further.
8. **Clean hygiene.** Have no secrets in git, use parameterised SQL and require auth. This matters more at a security event than it did at past ones.

## 6. Steal-this for the Cyberdefense entry (consolidated)

- **Event pipeline.** Security events go through Kafka or a direct insert into a MergeTree table keyed `ORDER BY (asset, ts)`. Add TTL and an MV rollup per minute.
- **Before/after effect query.** This is TC Pilot's pattern: compare findings or alerts before and after a control or Semgrep rule was enabled.
- **Blast-radius join.** This is policyDiff's pattern: join a finding to an asset-criticality table to get a risk score.
- **Context-dependent action.** This is Vital Signal's pattern: the same alert gets a different priority per asset, based on context stored in ClickHouse.
- **Agent run log.** Store each agent/Guild run as a ReplacingMergeTree row, pending → completed, as an audit trail. Store each Semgrep finding in the same database.
- **Disclosed simulator.** Admit it in the first 20 seconds, the way Rokko did, and let the agent's action change the stream.

## 7. Uncertainties and gaps

- **RedBot is omitted.** Both my attempts to write the RedBot project file and a short RedBot entry in this summary were stopped by a safety classifier, so neither exists. The facts the team lead already has from my earlier message are not repeated here. The facts this summary would have used from the RedBot code are:
  - the ClickHouse tables and engines
  - read paths that fail silently
  - a UI that never reads ClickHouse
  - commit timing versus the submission
  - a 3-slide deck

  Any RedBot analysis has to come from another team or a manual pass.
- **Ranks.** The policyDiff 1st and TC Pilot 2nd placements are creator claims only. LinkedIn could not be fetched.
- **Judged version vs current repo.** Several repos have commits after the event (TC Pilot's trial finder merged on 24 May; policyDiff added real reimbursement data later). What judges saw may differ from HEAD.
- **Missing code.**
  - IncidentLogica has no team code.
  - Rokko's agent backend is unpublished, so its ClickHouse queries can't be checked.
  - The Vital Signal repo was identified from the author handle, date and description, not from a Devpost link.
- **Demo reviews were partial.** The Vital Signal recording has no audio and was reviewed from still frames. The IncidentLogica video file returned 403, so only its captions were reviewed. The policyDiff demo was reviewed from audio only.
- **The "why it won" analysis is inference.** No scorecards exist. Field sizes were small (about 20 submissions at NYC), so placings may reflect a thin ClickHouse pool rather than a high bar.
