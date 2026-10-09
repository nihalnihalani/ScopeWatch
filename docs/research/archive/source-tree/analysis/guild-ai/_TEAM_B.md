> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Guild AI — Team B summary (Magpie, DailyGate, proPR, Argus)

> Checked 8 Oct 2026. Per-project files: [magpie.md](magpie.md), [dailygate.md](dailygate.md), [propr.md](propr.md), [argus.md](argus.md). The Guild API surface is covered by Team A in `_GUILD_PLATFORM.md` and isn't repeated here.

## 0. New evidence found this pass

| Item | Finding | Source |
|---|---|---|
| Harness Hack Guild prize wording | "Most Innovative Use of Agents (Guild.ai)": $2,000 cash, 3 winners, 1 x $1,000 1st, 2 x $500 2nd | https://harness-hack.devpost.com/ |
| Harness Hack judging | Idea 20 / Technical implementation 20 / **Tool Use 20** ("Did the solution effectively use sponsor tools?") / Presentation (3-min demo) 20 / **Autonomy 20** ("How well does the agent act on real-time data without manual intervention?") | same |
| Self-Evolving Guild prize wording | "Best use of agents in Guild": $2,000, 3 winners. "Awarded by Guild for the best use of agents in Guild. 1st place: $1,000. 2nd place: $500 (two teams)." Same five criteria, unweighted. Rules: built during event, max team of 4. | https://self-evolving-agents.devpost.com/ |
| Self-Evolving gallery | **Still unpublished** ("The hackathon managers haven't published this gallery yet"). Main page still says "Winners announced soon". | /project-gallery (fetched live, maxAge 0) |
| **Sponsor-side winner list (Self-Evolving)** | Guild Head of DevRel Corbett Waddingham, 25 Jul 2026: "special thank you to our winners: Ashna Parekh, C. Lai, Nalin Iyer, Jason Ye, and Von Viray." This confirms Argus as a Guild winner from the sponsor (rank still participant-reported). | linkedin.com/posts/waddingham_thanks-to-tokens-and-the-crew-at-senso-for-activity-7486614556996313088-yrOw |
| The two 2nd-place recipients (partial) | Inference: **Team 1 = Nalin Iyer + Jason Ye + Von Viray** (all Vocare co-founders/UNSW; they compete together as a team per compiled.sh and AI Tinkerers listings). **Team 2 = "C. Lai"** (unidentified). **Projects and repos not found.** GitHub: Von Viray = ORANGECRAB13 (no repo dated 24 Jul; `c0mpiledHack` created 26 Jul is a different event); Nalin Iyer = GigaQuake07 (no 2026 repos); Jason Ye account ambiguous. Nothing cloned. | search results above; `gh api users/*/repos` |
| Magpie demo URL (previously unresolved) | https://www.youtube.com/watch?v=HWpXXJRrSqc (193 s, 12 Jun) | Devpost embed |
| Magpie rank | Creator LinkedIn: "Won 1st place for Most Innovative Use of Agents (Guild.ai)" | activity-7472151833524727808 |
| Guild commentary on winners | No Guild blog post about hackathon winners was found. The only sponsor-side statement is Corbett's thank-you post. Guild's later "Software Factory" post (Sep 2026) states its philosophy: "Agents do the work. People own the outcome. Humans still merge every PR." | waddingham_adding-ai-to-your-workflow... |
| Context (not Guild) | Self-Evolving top-4 overall included **Immune** (self-patching prompt-injection defense, Senso credits). It's a Cyberdefense-relevant pattern but not a Guild winner. | Subhan Poudel LinkedIn post |

## 1. Sponsor-usage depth table

| Project | Guild feature | Where | Depth |
|---|---|---|---|
| Magpie | 4 x `llmAgent` one-shot, `tools: {}` | magpie-*/agent.ts | thin wrapper (each) |
| Magpie | Guild HTTP API: create chat session + poll events | clipdeck-dashboard/src/lib/guild.ts:58-113 | load-bearing (only LLM path) |
| Magpie | Guild CLI `guild chat --once` from Python | magpie-watcher/watcher.py:93-94 | load-bearing |
| DailyGate | Per-tier agents; **toolset = permission** (`pick(gitHubTools, …)`) | tiers/{observer,reversible,routine}/agent.ts | **core-to-the-pitch** |
| DailyGate | Agents-as-tools (router → tier tools) | router/agent.ts:9-12, 62-68 (post-event) | core (post-event) |
| DailyGate | Custom OpenAPI integrations (Composio Gmail bridge; trust API) | agent/integrations/*.yaml; router/agent.ts:13 | load-bearing |
| DailyGate | Webhook trigger on GitHub `issues.opened` | agent/triggers/setup-trigger.sh:25-30 | scripted at event; agent reasoned over a fixture |
| DailyGate | Experimental coding container → PR | coder/agent.ts:57-83 (post-event) | load-bearing (post-event) |
| DailyGate | Org workspace + publish | commits 9920b96, c3d7567 (post-event) | supporting |
| Argus | Code-first `agent()` with Zod I/O + `pick(jiraTools, [create, list])` | guild-agents/argus-jira-filer/agent.ts:42-45, 96-182 | **core-to-the-pitch (narrow)** |
| Argus | API-trigger session (`session_type: "api_trigger"`, Basic id:secret) + event streaming to UI | src/lib/adapters/guild.ts:170-300 | load-bearing |
| Argus | Guild-held Jira credential (no creds in app) | src/lib/adapters/jira.ts:3-8; docs/SPONSORS.md:47-57 | core |
| Argus | "Guild pause/monitor" | guild.ts:43-104 (local runBus + best-effort context POST) | **decorative** |
| proPR | "guild" tag only | Devpost | unknown |

## 2. Cross-project patterns (what the Guild judges rewarded)

1. **Governance and HITL framing beat raw capability** [inference, strong]. DailyGate (earned autonomy with ceilings), Argus (human Accept → credential-isolated write) and proPR ("escalations to humans when needed") all frame the agent as acting *within bounds with a human in the loop*. That's Guild's own "control plane / govern / people own the outcome" message. Magpie is the exception (pure ambient autonomy).
2. **Least privilege expressed as Guild tool scoping.** Both coded winners use `pick(serviceTools, [...])` to give an agent only the tools it needs (DailyGate tiers; Argus create-only Jira). This is the most reusable Guild idiom found [fact].
3. **Real writes to external systems are the wow moment.** A Jira ticket opened live (Argus 03:00-03:14). Notebook cards appear on Ctrl+C (Magpie 02:11-02:48). DailyGate's "acted autonomously" feed (01:34) was DB-scripted at judging time [fact].
4. **Autonomy criterion (20%) is explicitly scored**, and every winner leans on "no manual intervention": ambient clipboard (Magpie), triggers/earned autonomy (DailyGate), "continuously monitors" (proPR), auto-file after Accept (Argus) [fact: criteria; inference: mapping].
5. **Built in about 5 hours, Guild code last.** Magpie's Guild code landed 15:14-15:54. DailyGate's tiers landed 14:28 and its trigger 16:06. Argus was one commit at 16:22 [fact]. Judges evaluated working-but-thin integrations. Much of DailyGate's sophistication is **post-event** [fact].
6. **Talking to Guild DevRel matters.** Magpie and Argus both publicly thank Corbett Waddingham (and Killian Murphy, VP Eng). A non-winner said sponsor support "plays a big part" [fact]. Guild staff are the judges for this prize ("Awarded by Guild") [fact].
7. **Sponsor stacking is universal**: Magpie used 3 sponsors, DailyGate 3-4, Argus 6 [fact].
8. **Small fields**: 3 Guild winners of 78 Harness projects. Self-Evolving shows a "20 participants" registration field and 5 named Guild winners [fact].

## 3. Common demo structure

`Problem hook (0-20 s)` → `sponsor roll-call naming each sponsor's one job (20-60 s)` → `live run on a realistic target (60-150 s)` → `human approval or one-click action` → `artifact lands somewhere real or visibly (ticket, card, summary)` → `impact number or closing line`.
- Magpie: hook 00:00, roll-call 00:18-00:54, live copies 00:54-02:11, wow 02:11, Guild summarizer 02:48.
- Argus: diagram 00:00-01:12, live run 01:12, "Guild paused" 01:56, Accept 02:55, Jira opened 03:14, clip 03:33.
- DailyGate: hook 00:00, concept 00:19, Bayesian gate 00:38, feed 01:34, impact stats 02:10 ("2.3 hours saved, 14 acted alone"). **Never names Guild in captions.** So naming Guild on screen may not be strictly necessary if the architecture is Guild-native, though it's risky [inference].

## 4. Ranked winning formula for the Guild prize (Cyberdefense application)

1. **Make Guild the governance layer, not the LLM host.** Use separate Guild agents per permission tier, with tool scoping via `pick(...)` as the security boundary. Pitch line: "the containment agent physically cannot delete. Guild didn't grant it the tool."
2. **Keep credentials in Guild.** Ticketing, IdP and cloud credentials live in Guild integrations, and your app holds none (Argus pattern). Screenshot the scoped credential for the slide.
3. **A human approval gate on irreversible actions, enforced in code, failing closed.** Avoid DailyGate's prompt-only ceiling and fail-open fallback table. Use an async persisted approval queue (Guild `ui_prompt` doesn't work under triggers, per DailyGate's Devpost).
4. **Real-time trigger plus a live write to a real system on stage**: a GitHub/webhook/alert trigger wakes the agent, and the demo ends in a real Jira/GitHub artifact with evidence links (Semgrep finding, ClickHouse query link).
5. **Earned autonomy / learn from analyst decisions** (Bayesian trust per incident class, or decline → suppression memory). This hits Autonomy and the "self-evolving" narrative.
6. **Stream Guild session events into your UI** so judges see Guild working (Argus `describeGuildEvent`), and name Guild at each handoff.
7. **Engage Guild DevRel during the build** and confirm the pattern with them. DailyGate cites "confirmed by a Guild engineer."
8. Don't brand local logic as Guild (Argus pause), and don't ship silent fake fallbacks (Argus random ticket key). Security judges will probe exactly this.

## 5. Uncertainties (explicit)

- **Ranks:** Magpie 1st (creator-claimed only). Argus 1st (participant-claimed; the sponsor confirms winner status but not rank). DailyGate and proPR ranks are unknown. Assigning them 2nd by elimination depends on Magpie's claim.
- **Self-Evolving 2nd-place teams:** names only (C. Lai; Nalin Iyer / Jason Ye / Von Viray). Grouping into two teams is inference. Projects and repos weren't found, so nothing was cloned into `repos/guild-ai/`.
- **Judged vs. current code:** DailyGate's HEAD differs heavily from the judged state (`42b8648`). Our analysis separates them. Argus and Magpie are effectively unchanged.
- **Argus demo** is a post-event re-record (22 Aug). The in-room demo content is unknown. Whether the Jira ticket in the video came from the Guild path or the fallback draft can't be proven from captions.
- **Captions are auto-generated.** Sponsor names may be misheard (DailyGate's lack of "Guild" mentions could be a caption artifact). Video frames weren't visually reviewed.
- **proPR:** no code, demo or team detail beyond one Devpost member. All analysis is inference.
- Search coverage for Guild commentary was limited to Google-indexed LinkedIn plus guild.ai/blog search snippets. X/Twitter wasn't reachable via the tools used.
