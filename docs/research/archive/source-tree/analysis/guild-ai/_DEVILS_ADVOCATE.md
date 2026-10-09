> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Guild AI: devil's advocate review

> Reviewer pass, 8 Oct 2026. It challenges `_TEAM_A.md`, `_TEAM_B.md`, `_GUILD_PLATFORM.md` and the per-project files, and `pi-security/_CYBERDEFENSE_EVENT.md`.
> **[F]** = verified by me (file:line, commit, URL). **[I]** = inference.
> Survivorship pages and repos were downloaded to the session scratchpad (`scratchpad/proj/`, `scratchpad/sv/`). Nothing was installed or run.

**Bottom line.** The teams' factual work holds up. Their strategic conclusion does not follow from it.

- They say "do real Guild enforcement and you take the open lane to 1st." The data says Guild rank does not track Guild depth.
  - MediCall was the only Ship to Prod winner with a verified Guild SDK install, and it placed **3rd**.
  - DailyGate was the deepest Harness entry, and it was **not** 1st. Tool-less Magpie claims 1st.
- I found **at least six Guild-native non-winners**. They include a real `ui_prompt` approval gate, a real GitHub-webhook trigger agent, a real daily-trigger agent, and a *security* project pitched as "Guild governance". None won the Guild prize.
- What best separates winners from non-winners in the data I could check is **how much Guild appears in the Devpost write-up and the live demo**, not how much is in the code.
- Recommendation: build a **thin-but-real** Guild slice in about 75–90 minutes and spend the time saved on demo reliability.

---

## 1. Fact-check table

| # | Claim (team) | Verdict | My evidence |
|---|---|---|---|
| 1 | MediCall lockfile pins `@guildai/agents-sdk` 0.2.40 from the private registry | **CONFIRMED** | `repos/guild-ai/medicall/guild-agent/package-lock.json:101-104`: `"version": "0.2.40", "resolved": "https://app.guild.ai/npm/@guildai/-/019db0f5-…"`. The same entry is in `guild-agents/alert-agent` and `guild-agents/weekly-report` lockfiles. The lockfile was committed at 15:45:59, *before* the deadline (`08436ae`). |
| 2 | MediCall hardcodes a warfarin recall (`src/services/tinyfish.ts:32-39`) | **CONFIRMED** | `tinyfish.ts:32` `// Demo: inject a synthetic Warfarin recall for patients on Warfarin`, then the push of "lot #WF-2026-04" at :35-38. It is *additive*: a live RSS `fetch(feedUrl)` follows at :41-44. "Hardcoded" is accurate; "the only data source" would be wrong. |
| 3 | MediCall's final Guild commit came after the 16:30 deadline | **CONFIRMED** | `42a49e5 2026-04-24 16:48:18 Guild: four workspace agents, judge walkthrough…` and `5096ee1 16:36:40`. Caveat: the core multi-agent merge was at 16:29:55, so most of it was in by the deadline. |
| 4 | Phalanx `autoDecision: 'APPROVE'` | **CONFIRMED** | `phalanx/src/lib/scan/orchestrator.ts:406` `autoDecision: 'APPROVE',`. The comment at :397-401 admits it. `src/lib/guild/orchestrator.ts:388-389` turns it into the prompt text "Pre-approved decision: …". |
| 5 | Phalanx hardcodes fork #2 as the false-positive cancel | **CONFIRMED** | `scan/orchestrator.ts:276` `const cancelledIndex = 2;` after `await sleep(800)` (:275). The analyst verdict is discarded at :225 (`void analystVerdict; // … no local branching yet`). |
| 6 | Phalanx's Guild fixes were committed after 16:30 | **CONFIRMED** | Guild was added at `940f140 15:54:05` and `2de2d3a 15:58:56`. Fixes followed at `eb4db66 17:12:40` ("Guild stdin piping") and `626bb97 17:44:01` ("send JSON input to agent chat"). **Implication the teams under-weight [I]:** the Guild path probably *did not work* when submitted. The 17:44 fix is during finalist demos, so the judged demo may have run on the synthetic fallback. |
| 7 | Branch has zero Guild usage; the SDK is missing from lockfiles | **CONFIRMED (wording nuance)** | `services/agents/{planner,executor}/package.json:15-16` list `@guildai/agents-sdk` under `optionalDependencies`. Each `package-lock.json` mentions it only in the root `optionalDependencies` block (planner lock :19-21) with **no resolved `node_modules/@guildai/agents-sdk` entry**. `pnpm-lock.yaml` has 0 hits. So it is "declared, never installed", not "absent". The conclusion stands. "live!" was committed at `3f260d8 17:20:32`, after the deadline. |
| 8 | RxScout is a single commit with zero Guild references | **CONFIRMED** | `a6ffb56 2026-04-24 13:14:21 Initial RxScout…` is the only commit; only `main` exists. `grep -rli guild` (excluding `.git`) returns nothing. Yet its Devpost page has **13** "guild" mentions, the most of any Ship to Prod project, plus a `guild-ai` built-with tag. |
| 9 | DailyGate falls back to the *highest* permission tier | **OVERSTATED** | The fallback table (`router/agent.ts:44-46`) is **per category**: `issue-triage=2 · capacity-assignment=2 · thank-you-note=2 · nudge=1 · code-review=1 · code-fix=0 · candidate-decision=0(ceiling) · unknown=0`. It fails open to L2 for three low-risk categories and fails closed for code and unknown. More importantly, **that file did not exist at judging**: `router/agent.ts` first appears in `9091668 2026-06-15`, three days after the event. The judged commit `42b8648` has only `agent/agent.ts`, `tiers/{observer,reversible,routine}/agent.ts` and `tiers/router.mjs`. It is not a judged-version weakness. |
| 10 | DailyGate's feed is SQLite, not ClickHouse | **CONFIRMED** | `git show 42b8648:data/api/database.py:1-16` reads "SQLite-backed store" with `sqlite3.connect`. The same commit's README says "context() → ClickHouse" (README:19, 25, 39). The README claims ClickHouse; the code uses SQLite. |
| 11 | DailyGate's real execution was added the day after | **CONFIRMED** | `68c1e86 2026-06-13 23:18` "composio: routine tier sends real email", `132a612 23:39` "live demo: real Slack→email chain + GitHub execution", `3e7cb19 23:46` "real github: tier agents execute via Guild's GitHub tools (not local gh)". The judged state is `42b8648 2026-06-12 16:55`. |
| 12 | Argus has a fake `SCRUM-xxxx` fallback key | **CONFIRMED** | `argus/src/lib/adapters/jira.ts:13-14`: `const project = process.env.JIRA_PROJECT_KEY \|\| "SCRUM"; const key = \`${project}-${1000 + Math.floor(Math.random() * 8000)}\`;` |
| 13 | Argus landed an 11k-line commit 8 minutes before the deadline | **CONFIRMED, with a nuance** | `4fda8d2 2026-07-24 16:22:15`: 68 files, +11,075/−136. The repo also has a **day-before** commit, `ea0abcd 2026-07-23 17:33` (Create Next App scaffold, +7,123, mostly lockfile). That is harmless, but it means "built during the event" was not strictly observable either. |
| 14 | Magpie's agents are tool-less | **CONFIRMED** | `tools: {}` in all four: `magpie-agent/agent.ts:53`, `magpie-summarizer/agent.ts:25`, `magpie-refiler/agent.ts:32`, `magpie-chat/agent.ts:69`. Magpie still claims **1st** (creator LinkedIn, per `_TEAM_B.md`). |
| 15 | A Guild DevRel post names the Self-Evolving winners | **CONFIRMED (excerpt only)** | A Firecrawl search returns the post `linkedin.com/posts/waddingham_thanks-to-tokens-and-the-crew-at-senso-for-activity-7486614556996313088-yrOw` with the excerpt "…winners: Ashna Parekh, C. Lai, Nalin Iyer, Jason Ye, and Von Viray." I could not scrape the full post: Firecrawl refuses LinkedIn. Ranks are not stated. |
| 16 | "Guild CEO and VP Eng were the judges" (Team A §5.1) | **TRUE FOR APRIL, WRONG FOR 9 OCT** | `_CYBERDEFENSE_EVENT.md` §5 lists only **Corbett Waddingham (Head of DevRel)** as the Guild judge on 9 Oct. Guild is also in the organizer's "tools and mentorship" tier, not the "killer partners" tier (§4). Whether a Guild cash prize exists at all is **unconfirmed**. The whole Guild play is conditional on that. |
| 17 | `_TEAM_B` claims MediCall's "trigger/tests" were real sessions | **UNVERIFIABLE** | Only the docs and `npm` scripts assert this. There is no session URL in the repo. |

**Net:** 13 confirmed, 1 overstated (#9, which also misattributes post-event code to the judged version), 1 that does not transfer to Cyberdefense (#16), and 2 with nuances. The teams' research is reliable. Their *inference* from it is the weak part.

---

## 2. The central paradox: is "deep Guild = open path to 1st" true?

### 2.1 Rank vs. depth among Guild winners

| Event | Project | Guild depth (team ratings, my checks) | Rank |
|---|---|---|---|
| Ship to Prod | MediCall | **Only verified SDK install**, 4 published agents, time trigger, judge walkthrough | **3rd** (participant) |
| Ship to Prod | Phalanx | CLI sessions, outcome hardcoded, Guild path probably broken at submission | winner, rank unknown |
| Ship to Prod | Branch | **Zero** (SDK never installed) | winner, rank unknown |
| Ship to Prod | RxScout | **Zero** in code | winner, rank unknown |
| Ship to Prod | WildFire | Guild named as *future work* | winner, rank unknown |
| Ship to Prod | tracepath | No code public | winner, rank unknown |
| Harness | Magpie | 4 tool-less `llmAgent`s | **1st** (creator claim) |
| Harness | DailyGate | Deepest: `pick()` tiers, trigger, custom integrations | winner (2nd by elimination [I]) |
| Self-Evolving | Argus | One scoped `pick(jiraTools)` agent, API-trigger session, Guild-held Jira creds | **1st** (participant claim) |

- **Ship to Prod:** the one verifiably real Guild build placed **below** at least two entries with zero or broken Guild code.
- **Harness:** the shallowest coded integration claims 1st over the deepest.
- **Argus** is the only data point where depth and 1st coincide. Its depth was *narrow*: one agent, one scoped integration, one real write.

That is 3 ranked data points, and in 2 of them depth is inversely related to rank. The sample is tiny and the ranks are self-reported. Still, the teams' hypothesis has **no supporting example**: nobody won 1st with policies, tiers, approvals and triggers together. So "nobody did it, therefore it is the open path to 1st" is untested, not proven.

### 2.2 What does predict winning: Guild density in the Devpost text

I downloaded all 62 Ship to Prod and 78 Harness project pages and counted "guild" mentions in visible text. Winners' pages carry one extra mention from the prize label, so subtract 1 for them.

- **Ship to Prod:** ordered by mentions: RxScout 12★, MediCall 11★, Dress Rehearsal 8, tracepath 6★, Branch 6★, Agent Court 7, Research-agent 5, Phalanx 4★, Verity 5, FeedbackForge 4, WildFire 2★, and others at ≤3.
  - Five of the six winners are in the top nine by mention count.
  - RxScout has **no Guild code** and the **highest** Devpost Guild density.
- **Harness:** DailyGate 12★ and Magpie 9★ lead. proPR (2★) is the outlier.

**[I]** The judges saw a 3-minute in-room demo plus Devpost text, and probably never opened the repos. This is the strongest single argument against spending build hours on Guild depth that only shows up in code.

### 2.3 Alternative explanations the teams under-weight

1. **Category awards dilute the bar.** Ship to Prod gave out **6** Guild awards, with four 3rd places at $250. About 22 of 62 projects mention Guild and about 14 mention it substantively. So the odds of a Guild award were roughly 6/14 ≈ **40%** for anyone who credibly pitched Guild. At Harness it was 3/15 ≈ 20%. Getting *an* award was cheap. Getting 1st is the only thing depth could buy, and the ranks above suggest it does not reliably buy that either.
2. **Multi-track halo.** Branch won 4 tracks and Phalanx 3. Projects that impress across the room get named by every sponsor's judges. Generic demo quality spills over into the Guild prize.
3. **Relationship and feedback.** Magpie and Argus both publicly thanked Corbett, the Guild DevRel lead, and the VP of Engineering. DailyGate cites "confirmed by a Guild engineer." Corbett is the only Guild judge on 9 Oct. A DevRel judge rewards *being a good Guild user story*: product feedback, a quotable use case, a visible session in the Guild app. They do not see code depth.
4. **Product-fit storytelling.** Winners talked like Guild's homepage ("control plane", "flight recorder", "agent boundary is the unit of governance"). RxScout won with **none** of the code. So the vocabulary is necessary and roughly sufficient for an award.
5. **Live-demo polish.** Magpie's wow is cards appearing as you press Ctrl+C. MediCall's is a live phone call. Phalanx's is a mid-flight cancel. None of the wow beats was a Guild feature.

### 2.4 Quantifying the trade-off (5.5 h build) [I]

| Option | Guild build cost | Expected Guild outcome | Cost to everything else |
|---|---|---|---|
| **A. Narrative only** (Branch/RxScout style; no or fake Guild) | ~15 min | Some chance of an award at a lenient event, **but high risk at a security event**: Pi and Semgrep engineers, and a DevRel judge who can open app.guild.ai, may ask "show me the session". It is also dishonest. | none |
| **B. Thin-but-real** (1–2 published agents, one real `pick()` scope, real sessions linked in the UI, Guild named on screen) | **75–90 min**, including ~20–30 min of auth and registry friction | About MediCall/Argus level, comfortably award-eligible | 15–25% of build time |
| **C. Full play** (tier agents, credential policy DENY, blocking approval, trigger, session_url everywhere, app tour) | **3–4 h** for a solo or two-person team; nobody has demonstrated it in 5.5 h (DailyGate needed three extra days) | Best *possible* Guild story, but rank evidence says it is no guarantee of 1st | 55–70% of build time; demo polish and other sponsors suffer |

Prize math, using past tokens& structures: Guild 1st ≈ $1,000, 2nd ≈ $500, 3rd ≈ $250. Going from B to C mostly moves you *within* the Guild ranks: plausibly +$250–750 of expected value if it works. It risks the overall prize and the other three sponsor prizes ("$30K+" pool), which the same demo hours would improve. **Unless the 9 Oct Guild prize is unusually large, C is negative expected value. B dominates.**

---

## 3. Survivorship: Guild-substantive projects that did not win the Guild prize

Winner status comes from Devpost `winner label` markup on each project page (scraped 8 Oct). I shallow-cloned the repos read-only.

| Project (event) | What it did with Guild (verified) | Won Guild? | Lesson |
|---|---|---|---|
| **NightCrawler** (Harness), `github.com/mohiitt/NightCrawler` | **The exact HITL play the teams recommend:** `apps/agent/guild/nightcrawler-gate.ts` is an `llmAgent` with `tools: { ...userInterfaceTools }`, a "Human clicks Approve in the Guild dashboard" flow, and HTTP session creation in `apps/agent/src/guild.ts:97`. But `guild.ts:136, 185, 201, 209` **auto-approve** on a missing key, an error or a timeout. | **No** (no prize at all) | A real Guild approval gate is not enough by itself, and fail-open fallbacks are the norm even among "real" builds. |
| **RepoToon** (Harness), `github.com/codentell/RepoToon` | Single `llmAgent` with `tools: { ...gitHubTools, ...guildTools }` (`agent.ts:81-84`), fired autonomously by **Guild's GitHub `release` webhook trigger** (README:14, 39). It works around the sandbox ("only @guildai/agents-sdk + zod … pure inline SVG", Devpost). | **No** | A real trigger plus a real integration means real autonomy, and it still lost. Idea and demo matter more. |
| **research-agent** (Ship to Prod), `github.com/dylanbryan2002-wq/research-agent` | `llmAgent` with `guildTools` (`agent.ts:1, 91`), "deployed and scheduled on Guild.ai", daily trigger (CLAUDE.md:97). Devpost: "Guild.ai's … credential system is OAuth only". | **No** | It matched MediCall's Guild headline ("time trigger, no human") and lost. |
| **MCP Server Auditor** (Harness), `github.com/bishnubista/mcp-auditor` | **A security project pitched as "six probers under Guild governance… allowed/denied and logged to a tamper-evident audit trail."** In code, `auditor/src/governance/guild.ts` (175 lines) is a fire-and-forget REST audit sink. The allow/deny gate is local (header comment :9-10). Header :13-15: "No first-party Guild TS/bun SDK is cleanly installable… ships no public @guildai/* SDK." | **No** | It used the governance vocabulary on a security theme and still lost. It also shows **registry friction** that hit a security team at the event. |
| **FeedbackForge** (Ship to Prod), `github.com/bekhamit/feedbackforge` | `guild/agent.ts`: `llmAgent` with `guildTools`. The pitch is word for word the recommended play: "low-risk actions run automatically, high-risk actions like rollbacks require approval and are fully audited" via Guild. | **No** | The risk-tiered approval *pitch* alone did not win. It was a solo, single-commit project made at 16:59. |
| **Odette** (Harness), `github.com/bharathraahul/Affliate-agent` | `agent.ts` with `pick(guildTools…)`, Composio integration. Devpost complains "Guild having its own repo caused frequent merge conflicts". | **No** | Shows the friction of Guild's repo and workflow. |
| Also, claims only (not verified in code) | **Dress Rehearsal** (8 mentions, "registered Guild agent with versioned identity, scoped tool permissions"), **Agent Court** ("GuildClient wraps every tool call in a trace span"; smart fallback with "no Guild key required"), **Genuine Passion** (Guild orchestrator through Guild's GitHub integration; its repo now 404s), **Canary** ("Guild.ai governs the agent and concurs on escalations") | **No** | Many teams told the governance story. Winning took more than that. |

Survivorship conclusion: about 6 verified and about 4 claimed Guild-substantive non-winners, against 9 winners of whom only about 3 were Guild-substantive in code. **Guild substance is neither necessary (Branch, RxScout) nor sufficient (NightCrawler, RepoToon, research-agent, MCP Auditor) to win.** What winners had that these lacked [I]:

- a broadly compelling, emotionally clear idea (seniors on meds, $7 vs $393 pills, CVE response in 90 s);
- a polished live wow beat;
- multi-sponsor breadth.

---

## 4. Stress-testing the recommended Guild play for a 5.5 h build

| Element | Failure mode | Evidence | Severity | Mitigation |
|---|---|---|---|---|
| **SDK access** (`@guildai/agents-sdk` on the private registry `app.guild.ai/npm`) | Teams that skip `guild auth login` cannot install it at all. Public npm returns "Not found", and `guild-ai` on npm is an unrelated placeholder. | MCP Auditor `governance/guild.ts:13-15`; CRM-Heal Devpost: "Guild.ai doesn't expose a runtime API, so we designed a compatible local control plane"; Branch never got it installed. MediCall, Magpie, DailyGate, RepoToon and NightCrawler *did* get it, so access is possible with a free account. | High at 11:00, low after setup | **Do `npm i -g @guildai/cli && guild auth login` and publish a hello-world agent TONIGHT** (8 Oct), then commit the lockfile. If login needs approval or an invite, find out now and message Corbett. |
| **CLI name collision and auth** | GNU Guile also ships a `guild` binary (MediCall used `npx @guildai/cli`). Browser OAuth on venue Wi-Fi, token expiry mid-demo. Phalanx's stdin and JSON-mode bugs took until 17:44 to fix. | `_GUILD_PLATFORM.md` §1; Phalanx `eb4db66`, `626bb97` | Medium | Pin the CLI version and call it via `npx @guildai/cli`. Use an **API key (Basic id:secret)** for runtime calls, not the CLI session. Rehearse with a fresh token at 16:00. |
| **Sandbox** ("no direct route to the internet") | Semgrep, ClickHouse and Pi calls cannot run inside a Guild agent unless they go through a supported integration, a custom OpenAPI integration, or `experimental-fetch`. | `_GUILD_PLATFORM.md` §1; RepoToon Devpost ("only @guildai/agents-sdk + zod"); MediCall's raw fetch worked in April (the sandbox may have tightened since) | **High** | Keep Semgrep and ClickHouse in *your* backend. Guild agents decide and act through **Guild-native integrations only (GitHub or Jira/Slack)**. Do not plan to wrap ClickHouse as a Guild integration on the day: DailyGate needed post-event days to get its custom integrations working. |
| **"Credentials in Guild"** | The credential system is "OAuth only". There is no obvious way to put custom API keys (Semgrep, ClickHouse, Pi) into the runtime. | research-agent Devpost | Medium | Limit the claim to "GitHub/Jira credentials live only in Guild". That is honest and still the Argus pattern. |
| **Credential-policy DENY** | Unused by **every** project I saw, winner or not. So there is no proof it works in the hackathon tier, how long it takes, or what a denial looks like on screen (an error string in the session log?). It may need org/admin settings. | `_GUILD_PLATFORM.md` §4.3, §4.6 ("No winner used a credential policy") | **High (unknown)** | Spend ≤20 min on it tonight. If you cannot trigger and *screenshot* a DENY by then, drop it and use `pick()` scoping. Then "the agent was never granted the delete tool" *is* the denial story. |
| **Blocking `ask()` / `ui_prompt` approval** | `ui_prompt` **cannot run under triggers** (non-interactive), per DailyGate's Devpost. That makes "trigger-driven autonomy" and "a blocking human gate in the same session" contradictory. The approval also happens in the Guild UI, so the demo needs a second screen. NightCrawler's real gate auto-approves on timeout. | `dailygate.md:107`; NightCrawler `guild.ts:209` | **High** | Pick one: (a) API-trigger session, then the agent outputs a *proposed* action, then **your** app's Approve button calls a second, scoped "operator" agent session (Argus pattern, deterministic, fail-closed). Or (b) an interactive `guild agent chat` with `ui_prompt` for the demo only. (a) is more robust. |
| **Agent per permission tier** | Every agent is a separate init, publish and version cycle. Merge pain with Guild's own repo (Odette). Agent-as-tool imports (`…/tool`) need published packages; DailyGate built the router *after* the event. | DailyGate commits `33a8c99`, `9091668` (15 Jun) | Medium | Use **2 agents max**: `triage` (read-only `pick`) and `operator` (write `pick`). Skip the router and the delegation. |
| **Trigger** | Webhook setup needs integration OAuth plus an event fire during the demo. A time trigger is invisible in 3 minutes. | DailyGate's judged trigger reasoned over a FIXTURE (`dailygate.md:115`) | Medium | Use the **public API trigger** (`POST api.guild.ai/v1/…/sessions`, `session_type: "api_trigger"`) from your own detector. "No human started it" stays true, and it returns a `session_url`. |
| **Live demo latency and outage** | A Guild session round trip of several seconds, plus polling for `runtime_done`. Phalanx shipped a synthetic fallback, and Argus a fake ticket key. | Phalanx `scan/orchestrator.ts:220-224` (`synthetic: true`); Argus `jira.ts:14` | High | Pre-record a backup video. If a fallback is used, **label it on screen as "cached run"**. Pi and Semgrep engineers will spot a silent fake. |
| **Guild web-app tour** | It costs 30–60 s of a 3-minute demo, during the in-room finalist slot, where the general and other-sponsor judges do not care. | Team B: DailyGate never named Guild in captions and still won. MediCall did a full tour and got 3rd. | Medium | Move the tour to a **Devpost screenshot section** and to the Guild judge at their table. On stage: one 5-second cut to the real session page. |
| **Prize may not exist / judge mismatch** | Guild is in the "tools and mentorship" tier, and only DevRel is listed as a judge. | `_CYBERDEFENSE_EVENT.md` §4-5 | Medium | Confirm at kickoff. If there is no Guild prize, Guild is a Tool Use checkbox (20%), and plan B is enough. |

---

## 5. Revised, confidence-rated Guild winning formula

| # | Factor | Confidence | Why |
|---|---|---|---|
| 1 | **A Guild-heavy Devpost write-up and a clear verbal role for Guild in the demo** ("Guild is the control plane: it holds the GitHub token, scopes each agent, and every action is a Guild session") | **High** | It best separates winners from non-winners (§2.2). RxScout won on it alone. |
| 2 | **A strong, emotionally legible idea and a live wow beat that works** | **High** | It is common to all ranked winners; none of the wow beats was a Guild feature. |
| 3 | **Something real in Guild that the DevRel judge can open** (a published agent and real session URLs) | **Medium-high** | It is cheap, it protects against "show me" at a security event, and DevRel cares about real usage. MediCall and Argus had it. |
| 4 | **One honest least-privilege primitive: `pick()` scoping, with credentials held by Guild for one integration** | **Medium** | Argus (1st) did exactly one of these. DailyGate did many and was not 1st. One is enough. |
| 5 | **Talk to Corbett during the build** and get a quotable "Guild engineer confirmed this pattern" | **Medium** | Two 1st-place claimants thanked Guild staff publicly. It is free. |
| 6 | Multi-sponsor breadth ("remove one and it breaks") | **Medium** | Halo effect (Branch ×4, Phalanx ×3). Tool Use is 20%. |
| 7 | Credential-policy DENY, blocking approvals, triggers, delegation tiers | **Low** (as rank drivers) | No winner did them. NightCrawler and RepoToon did the HITL and trigger pieces and lost. There is a high risk of not working in 5.5 h. Treat them as stretch goals only. |

### MVP cut (budget about 90 min of Guild work out of 5.5 h)

**Tonight (8 Oct, about 45 min, off the clock):**
`npm i -g @guildai/cli`, then `guild auth login`, then `guild agent init`, then publish a hello agent.
- Confirm the SDK installs from `app.guild.ai/npm`.
- Create an API key and fire one `api_trigger` session with curl, and keep the `session_url`.
- Connect the GitHub integration in the workspace.
- Try a credential-policy DENY for 20 min. Keep it only if you can screenshot it.

**On the day:**
1. **`sec-triage` agent** (`llmAgent`, one-shot, Zod I/O): input is a Semgrep finding plus ClickHouse context, both fetched by *your* backend and passed in. Output is severity, fix plan and proposed action. Tools: `pick(gitHubTools, ["…issues_get", "…pulls_get"])`, read-only. *(~30 min)*
2. **`sec-operator` agent**: `pick(gitHubTools, ["…issues_create" or "…pulls_create", "…create_comment"])`, write-only, no delete or merge tools. It runs **only** when a human clicks Approve in *your* UI, and it **fails closed** if the session errors. *(~25 min)*
3. **Invocation**: your detector calls the public `api_trigger` endpoint, so "no human started it" is true. Store and display each real `session_url` next to the finding (the audit trail). *(~20 min)*
4. **Demo beat (10 s)**: "The triage agent tried to open a PR and couldn't. Guild never granted it the tool. Only the operator can, and only after I approve." Then click Approve, show the real GitHub issue or PR, and cut to its Guild session page for 5 s.
5. **Devpost**: a "How we use Guild" section with 4 screenshots (agents, session, scoped tools, integration), the lockfile committed, no fake fallbacks. Any cached path is labelled as cached.

**Explicitly cut:** tier routers, agent-as-tool delegation, `ui_prompt` under triggers, a custom ClickHouse/Semgrep Guild integration, time triggers, and the stage tour of app.guild.ai.

---

## 6. Open questions

1. **Does a Guild prize exist on 9 Oct, and what is its wording and size?** Guild is in the mentorship tier and the Devpost returns 403. That decides whether even plan B is worth 90 minutes.
2. **Ranks** for Phalanx, Branch, RxScout, tracepath and WildFire are unknown. If Branch or RxScout (zero Guild code) was 1st, that would make the paradox decisive.
3. **Does `guild auth login` work for a new account without an invite** as of Oct 2026, and is the registry still private? Test tonight.
4. **Can credential policies be created on a free workspace, and how does a DENY surface** (session event, HTTP 403 to the agent)? No public example exists.
5. **Is `ui_prompt` still non-functional under triggers and API-trigger sessions** in SDK 0.6.x? DailyGate's claim is from June on an older SDK.
6. **Did the judges open repos at all?** There is no evidence either way. A security event with Pi and Semgrep engineers may be stricter than Ship to Prod.
7. **The survivorship sample is biased:** I could only check Ship to Prod and Harness (Self-Evolving's gallery is unpublished). Non-winners may also have had weaker demos for reasons unrelated to Guild. Their losing does not prove that Guild depth is *worthless*, only that it is not decisive.
8. Mention counts (§2.2) are a crude proxy. They include the built-with tag and winners' prize labels (I corrected for the latter). Treat the correlation as suggestive.
