> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Guild AI Team A: summary of the Ship to Prod Guild winners (24 Apr 2026)

Six projects won "Most Innovative Use of Guild.ai Platform": Phalanx, Branch, RxScout, MediCall, WildFire Response and tracepath. Each has a per-project file in this folder. The Guild API surface, prize wording and judges are in `_GUILD_PLATFORM.md`.

## 1. Headline findings

1. **Only one of the six winners has code proving it ran on the Guild cloud: MediCall.** Its lockfile resolves `@guildai/agents-sdk@0.2.40` from `app.guild.ai/npm`. It has published, versioned `@guildai/medicall~*` agents, CLI scripts against workspace `medicall/medicall`, and a judge walkthrough of app.guild.ai.
   - Even so, it placed **3rd** (per a participant's LinkedIn post).
2. **Phalanx** really does start Guild sessions, by shelling out to `guild agent chat --mode json --ephemeral`. But the sessions do not affect the outcome:
   - The analyst verdict is discarded (`src/lib/scan/orchestrator.ts:225`).
   - The false-positive cancellation is hardcoded to fork index 2 (`:276`).
   - The "human approval gate" is an `autoDecision: 'APPROVE'` string injected into the LLM prompt, with a synthetic fallback (`:403-428`).
   - The "Guild audit log" panel shows Phalanx's own Redis events, keyed by a locally generated UUID.
3. **Branch** never touched Guild. The SDK is an optional dependency that is absent from both lockfiles. The "Guild planner agent" is a Node `tsx` subprocess calling GLM 5.1 through the `openai` SDK, and the executor agent is dead code. It still won four sponsor tracks.
4. **RxScout's public repo has zero Guild references** (exhaustive grep; one commit at 13:14 PT; only a `main` branch; the sibling repo `RxCheep` is empty). Its Devpost describes a later rewrite onto Guild agents (`guild agent chat --ephemeral --mode json`, `rx-ocr`, `rx-parser`, `guildTools` fetch) that was never pushed. It most likely won on the live demo and the Devpost narrative.
5. **WildFire Response** has a 404 repo, an unavailable YouTube video and a 404 Drive file. Its Devpost mentions Guild only as future work ("optional Guild (or similar) for live policy traces").
6. **tracepath** has no repo and no video. Its Devpost describes the most security-relevant and most platform-native design: a Guild agent calling a typed OpenAPI tool backend (Hono + valibot + hono-openapi), osv-scanner plus the Chainguard secfixes join, reachability tracing, and capped tool outputs.
7. **Judges plausibly scored the Guild narrative and the live demo, not the repo.** Judging was in person (finalists at 17:00, a 3-minute demo). Three of the four repos with code contain no causal Guild usage, and two winners have no inspectable artifact at all.

## 2. Guild usage depth by project and feature

Ratings: decorative / thin wrapper / load-bearing / core-to-the-pitch. "–" means not used. "claim" means stated in Devpost/README/docs but not in code.

| Feature | Phalanx | Branch | RxScout | MediCall | WildFire | tracepath |
|---|---|---|---|---|---|---|
| Guild SDK actually installed | unknown (agents not vendored) | no | no | **yes** | unknown | unknown |
| Agent definitions in repo | no (clone hint only) | yes (Guild-shaped) | no | **yes ×4** | no | no |
| Real Guild sessions | **yes (2 per scan, CLI)** | no | claim | **yes (trigger/tests, per docs)** | – | claim |
| Agents affect control flow | **no** | n/a | n/a | yes (start the pipeline) | – | claim |
| Typed I/O (Zod/valibot) | yes (5 schemas) | yes | – | yes | – | claim (OpenAPI) |
| Triggers / scheduling | – | claim (webhook) | – | **load-bearing (time trigger, claimed)** | – | – |
| Integrations (`task.tools`) | – | – | claim (`guildTools`) | – | – | claim |
| HITL / approval | decorative (auto-approve) | – | – | – | app-level queue (not Guild) | none |
| Audit / sessions shown to judges | decorative (own log labelled "Guild") | – | – | **load-bearing (judge tour)** | – | – |
| Overall | thin wrapper pitched as core | decorative | none in code | load-bearing scheduler, thin agents | unverifiable | core (claimed), unverifiable |
| Other tracks won | Chainguard, WunderGraph | Chainguard, Ghost, WunderGraph | – | Vapi (1st) | – | – |

## 3. Common patterns

- **Governance vocabulary wins.** Every code-backed winner pitched Guild as the *control plane / governance / audit* layer, echoing guild.ai's "Control Plane for AI Agents… human approval gates":
  - Phalanx: "Agent governance isn't optional — it's the product."
  - Branch: "the agent boundary is the right unit of governance."
  - MediCall: "Guild is our control plane… Sessions are our flight recorder."
- **Multiple named agents with typed contracts.** Phalanx had 5, MediCall 4, RxScout 3 (claimed), Branch 2. Separate agents per responsibility reads as "using the platform" even when each agent is trivial.
- **Security and software-supply-chain topics are over-represented.** Phalanx (CVE remediation), tracepath (CVE triage) and Branch (issue to PR) make three of six. They match Guild's Software Factory and governance story.
- **Multi-sponsor stacking.** Phalanx won 3 tracks and Branch 4, using about 8 sponsor tools each. The rubric weights "Tool Use (≥3 sponsor tools)" at 20%.
- **Heavy use of coding agents and late integration.**
  - Phalanx added Guild at 15:54–15:58 and fixed it at 17:12 and 17:44, after the deadline.
  - MediCall's final Guild commit is at 16:48, after the deadline.
  - Branch's "live!" commit is at 17:20.
  - RxScout's only commit is co-authored by Claude Opus 4.7.
- **Mocks and hardcoding are pervasive and were not penalized.**
  - Phalanx: hardcoded CVE and cancellation, placeholder x402 transaction.
  - MediCall: synthetic warfarin recall, and a "TinyFish" step that is a plain RSS `fetch`.
  - Branch: `USE_MOCK_*` paths.

## 4. Common demo structure (from the 4 transcripts available)

1. **0:00–0:15. Emotional or economic hook with a number.** "$60B a year / 60 days to patch" (Phalanx); "125,000 Americans die every year" (MediCall); "$7 vs $393" (RxScout, from Devpost).
2. **One-line product definition.** "This is Phalanx…"
3. **A live run narrated panel by panel**, including a "wow" beat:
   - Phalanx 2:07: a mid-flight cancel.
   - MediCall 1:42: a live phone call.
   - Branch 1:08: a GitHub bot writing the PR.
4. **A governance beat.** Phalanx 1:17: "the analyst… got denied… only the rollout operator can touch production." Note that this beat was WunderGraph, not Guild.
5. **Sponsor roll-call plus "remove any one and it breaks"** (Phalanx 3:08; Branch 1:24).
6. **An impact number to close.** "60 days → 90 seconds."

**Guild itself is barely visible in the videos.** It is named once by Phalanx (3:08), garbled by auto-captions in Branch ("AI for the orchestration") and MediCall ("G.A.I. agents wake up autonomously"), and never mentioned by RxScout. The Guild showcase evidently happened in live judging, which MediCall scripted in `docs/guild-judge-walkthrough.md`.

## 5. Ranked winning formula for the Guild prize (applied to Cyberdefense)

1. **Frame Guild as the governance and control plane of a security agent.** Use the words scoped credentials, approval gates, audit trail, blast radius. That is Guild's own pitch, and the Guild CEO and VP Engineering were the judges.
2. **Do the governance for real with Guild primitives.** Every winner faked or skipped this, so it is the open lane to 1st place.
   - **Least privilege:** one agent per role, each with a minimal `pick()`-ed toolset.
   - **Hard deny:** a credential policy with `DENY` on destructive operations for every agent except the operator, triggered live in the demo.
   - **Human gate:** the operator agent blocks on `task.ui.prompt` / `ask()`, and a human clicks approve during the demo.
   - **Delegation:** router-to-tier delegation, as in DailyGate, if time allows.
3. **Autonomy through a Guild trigger.** Use a webhook (for example a GitHub push or a Semgrep finding) or a schedule, so the agent starts with no human. Autonomy is 20% of the score, and MediCall's "no human trigger needed" was its Guild headline.
4. **Make Guild sessions the audit trail.** Show the real `session_url` next to each action on the dashboard. Do not invent session IDs.
5. **Have a 2-minute judge walkthrough of app.guild.ai** covering agents, sessions, triggers and policies, plus `guild … --json` evidence scripts.
6. **Typed tool backend and output caps** (tracepath): an OpenAPI or Zod tool surface, bounded windows, reachability before alerting.
7. **Stack the other sponsors meaningfully:**
   - Semgrep findings start the agent.
   - ClickHouse stores events and the audit trail.
   - Pi Security provides the threat signal.

   Say "remove any one and it breaks."
8. **Push the judged code and commit the Guild lockfile.** It is cheap insurance against code review, which may be stricter at a security event.

## 6. Uncertainties (explicit)

- **Ranks.** Devpost does not publish Guild ranks 1st or 2nd. Only MediCall's 3rd is known, and it is participant-reported. I cannot say which winner took the $1,000.
- **Judged version vs. repo.** Phalanx's Guild fixes and Branch's "live!" commit landed after the 16:30 deadline. RxScout's judged version is apparently not in the repo. Judges may have seen different code from what is public.
- **Phalanx agents.** The five Guild agent definitions are not in the repo. Their prompts and tools, and whether they use `ui_prompt` or `multi-turn`, are unverifiable.
- **MediCall's trigger and sessions** are asserted in docs and npm scripts. I could not access the Guild workspace to verify them. Its use of raw `fetch` inside a Guild agent conflicts with current sandbox docs; the platform may have changed since April.
- **Videos.** I read auto-captions only and did not watch frames, so on-screen Guild UI moments are inferred. WildFire has no video available, and tracepath has none at all.
- **No sponsor commentary.** No Guild blog, LinkedIn or X post about these winners was found, so "why it won" is inference throughout.
- **tracepath and WildFire identities.** No repos were found. Candidate GitHub accounts for tracepath (`baptiste0928`, `cboillot`) are unconfirmed. GitHub code search was partly rate-limited (HTTP 403).
- **SDK version drift.** April lockfiles show `agents-sdk` 0.2.40; the docs (Oct 2026) describe 0.6.0. Some API details in `_GUILD_PLATFORM.md` reflect the current docs, not April behavior.
