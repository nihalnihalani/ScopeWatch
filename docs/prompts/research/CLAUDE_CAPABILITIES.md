# Claude model and agent-team capabilities for the ScopeWatch build prompt

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Verified **9 October 2026**, using live official Anthropic/Claude Code and Cursor documentation. Research only: no Claude session, teammates, settings change, installation, account call, or application build was started. Read-only local checks found Claude Code **2.1.295** at `/Users/nihalnihalani/.local/bin/claude`.

This report informs the event build prompt. It does not override `AGENTS.md`, `docs/build/FIRST_HOUR.md`, organizer timing, or ScopeWatch's native-evidence and human policy-action requirements. The repository remains documentation/templates until implementation. Current human authorization in [BUILD_AUTHORIZATION](../../event/BUILD_AUTHORIZATION.md) permits implementation now or anytime without a build cutoff; model/harness capability is separate from that authorization.

## Requested models are real; account access remains unverified

| Requested model | Exact Claude API ID | Official status/release | Context / max output | Standard API input / output per million tokens | Minimum Claude Code |
|---|---|---|---|---|---|
| Claude Opus 5.5 | `claude-opus-5-5` | Active/latest; 22 September 2026 | 1M / 128K | $4 / $20 | 2.1.280 |
| Claude Sonnet 5.5 | `claude-sonnet-5-5` | Active/latest; 28 September 2026 | 1M / 128K | $2 / $10 | 2.1.284 |

Exact IDs, release/status, context, and API rates come from the official [Opus 5.5 specification](https://platform.claude.com/docs/en/models/opus-5-5/overview) and [Sonnet 5.5 specification](https://platform.claude.com/docs/en/models/sonnet-5-5/overview). Version requirements come from [Claude Code model configuration](https://code.claude.com/docs/en/model-config#model-aliases). API rates are not a forecast of subscription limits, total build cost, provider billing, or Cursor usage.

The local binary exceeds those minimums, but **this research did not verify authentication, balance, organization restrictions, provider routing, or actual invocability of either model on this account**. During initial implementation preflight, inspect `/model` and `/status`, confirm the provider and exact lead model, and inspect the spawned teammate model. Do not call successful `--version`, a picker row, or a display label proof of an actual model request. The [model guide](https://code.claude.com/docs/en/model-config#checking-your-current-model) documents `/status` and the status line; startup `--model` values are not validated up front and an invalid value can fail on the first request.

### Aliases are moving selections, not exact version pins

At the captured documentation version, `opus` and `sonnet` resolve as follows:

| Provider | `opus` | `sonnet` |
|---|---|---|
| Anthropic API | Opus 5.5 | Sonnet 5.5 |
| Claude Platform on AWS | Opus 5.5 | Sonnet 4.6 |
| Amazon Bedrock / Google Cloud's Agent Platform | Opus 5.5 | Sonnet 4.5 |
| Microsoft Foundry | Opus 4.6 | Sonnet 4.5 |

Use the full IDs in the lead launch and each teammate's spawn request when the user's requirement is 5.5. Cloud providers can use inference profiles, version names, deployment names, or configured model overrides; resolve their actual deployment rather than assuming the Claude API string is the correct provider-native value. `ANTHROPIC_BASE_URL` changes the request destination and does not itself establish which model answers. [Official alias/provider and pinning rules](https://code.claude.com/docs/en/model-config#model-aliases).

## Native Claude Code teams require an interactive session

Native teams are experimental and disabled by default. Enable `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in the launch environment or settings. The lead spawns and coordinates named teammates, each with an independent context and peer messaging. A natural-language request must explicitly ask for an **agent team**: an agent panel can show ordinary subagents too, so its presence alone does not prove a native team formed. [Official agent-team guide](https://code.claude.com/docs/en/agent-teams#enable-agent-teams).

**`claude -p` and Agent SDK sessions do not spawn native teammates**, even with the team variable enabled; named delegation there runs ordinary subagents. An unattended headless invocation cannot be presented as the same native-team workflow. Use an interactive terminal session for the requested team. [Interactive requirement](https://code.claude.com/docs/en/agent-teams#enable-agent-teams).

The default display is `in-process`, which works in any terminal. This is the practical option for a terminal inside Cursor. Split panes require tmux or iTerm2, and the official documentation excludes VS Code's integrated terminal, Windows Terminal, and Ghostty from split-pane support. `--teammate-mode` accepts `in-process`, `auto`, `tmux`, and `iterm2`; this experimental flag is documented but intentionally absent from `claude --help`. Do not install pane tools just to write this prompt. [Display modes](https://code.claude.com/docs/en/agent-teams#choose-a-display-mode), [CLI flag contract](https://code.claude.com/docs/en/cli-reference#cli-flags).

### Task tools need a second opt-in on these models

Since Claude Code 2.1.268, Opus 5.5 and Sonnet 5.5 do **not** receive the written task-tracking tools by default. Set `CLAUDE_CODE_ENABLE_TODO_TOOLS=1` before launch to expose `TaskCreate`, `TaskGet`, `TaskList`, and `TaskUpdate` on all models/providers. Ensure an existing `CLAUDE_CODE_ENABLE_TASKS=0` override is not substituting the older `TodoWrite` checklist. Naming a Task tool in `--allowedTools` also opts in; `--tools` can opt in but additionally restricts the entire built-in tool set. [Task tool availability](https://code.claude.com/docs/en/tools-reference#task-tool-availability).

In-process teammates follow the lead's Task-tool availability. Split-pane teammates run separate processes, so their own model/tool configuration applies. Without Task tools, a team still coordinates through messages; it does not populate the promised shared dependency list. Verify the tools before relying on it. [Task tool inheritance](https://code.claude.com/docs/en/tools-reference#task-tool-availability).

When present, tasks support pending, in-progress, completed states, dependencies, explicit assignment, and self-claiming. Unresolved dependencies prevent a pending task from being claimed; completing prerequisites automatically unblocks dependents. Task-claim file locking prevents concurrent claims of the same task. **It does not lock application source files.** The official guide warns that teammates editing the same file can overwrite each other. [Task coordination](https://code.claude.com/docs/en/agent-teams#assign-and-claim-tasks), [file conflicts](https://code.claude.com/docs/en/agent-teams#avoid-file-conflicts).

## Exact teammate model and effort selection

Current selection order is:

1. The model named for that teammate in the spawn prompt.
2. A referenced subagent definition's `model`, with `inherit` selecting the lead model.
3. `CLAUDE_CODE_SUBAGENT_MODEL` if set to a value other than `inherit`.
4. The lead's current model.

A mod's `agent.spawn` hook can replace the first source. `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` bypasses the first two sources and forces the global subagent model or inherited lead model. Organization allowlists can substitute an allowed family version or fall back to the lead model, so an exact requested model still needs runtime verification. `teammateDefaultModel` was removed in 2.1.234 and is ignored; before 2.1.251 the global subagent variable had higher priority. [Official selection and substitution rules](https://code.claude.com/docs/en/agent-teams#specify-teammates-and-models).

Name exact full IDs in each spawn request; do not rely on a lead's `/model` setting to select Sonnet teammates. Once a teammate spawns, its model and fast mode are fixed; `/model` from an in-process teammate view targets the lead, not that teammate. Spawn a replacement if a different teammate model is required. [Teammate controls](https://code.claude.com/docs/en/agent-teams#talk-to-teammates-directly).

Both requested models support `low`, `medium`, `high`, `xhigh`, and `max` effort in Claude Code. Claude Code defaults both to `medium`; the Sonnet API model specification separately states an API default of `high`. These are different surfaces, so explicitly choose the CLI effort instead of copying an API default. Teammates inherit the lead's effort unless another applicable source changes it; in-process teammates can use a referenced agent definition's `effort`. Organization/managed caps can lower the effective level. `max` has higher spend and is not accepted as a persisted `effortLevel` or `modelSettings` value. `ultracode` is a workflow setting, not another model effort level. [Claude Code effort rules](https://code.claude.com/docs/en/model-config#adjust-effort-level), [definition fields applied to teammates](https://code.claude.com/docs/en/agent-teams#use-subagent-definitions-for-teammates).

For this time-bounded build, `high` is a reasonable explicit starting point for edge-case-heavy implementation and review; that is a workflow recommendation, not a measured ScopeWatch benchmark. Use deeper effort selectively rather than implying `max` guarantees correctness.

### Security-related content can change the active model

Claude Code documents content-based fallback: cybersecurity-flagged Opus 5.5 requests re-run on Opus 4.8, and cybersecurity-flagged Sonnet 5.5 requests re-run on Sonnet 5. The main session continues on the fallback afterward. Workspace context alone can trigger this on the first request. Organization allowlists can block the fallback, producing a refusal instead. [Automatic fallback rules](https://code.claude.com/docs/en/model-config#automatic-model-fallback).

`switchModelsOnFlag: false` requests a choice in supported interactive main-session cases; it does not establish a universal prevention mechanism. The documented subagent behavior still re-runs a flagged request on the fallback without showing that prompt. This report does not establish identical prompt handling for every teammate display mode. Include a requirement to record and disclose any model substitution/fallback; do not claim every lead/teammate request stayed on 5.5 or evade a refusal. [Ask-before-switch behavior](https://code.claude.com/docs/en/model-config#ask-before-switching).

## Practical session launch recipe for the later event

The following is a **suggested command, not executed setup**. Run it in the ScopeWatch directory only when the event build is authorized. It keeps changes session-scoped, uses the existing installed binary, requests native in-process teams, and opts into shared tasks:

```sh
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 \
CLAUDE_CODE_ENABLE_TODO_TOOLS=1 \
claude --model claude-opus-5-5 \
  --effort high \
  --permission-mode auto \
  --teammate-mode in-process
```

Check effective environment/settings overrides, provider, active model/effort, permission mode, and Task tools before spawning. Saved or managed settings can affect the launch. If auto mode is unavailable, preserve the existing permission controls and report the missing capability; do not silently substitute permission bypass. The command requests auto mode, but organization or server restrictions can prevent it. [CLI reference](https://code.claude.com/docs/en/cli-reference#cli-flags), [auto-mode availability](https://code.claude.com/docs/en/permission-modes#eliminate-prompts-with-auto-mode).

The build prompt should tell the Opus lead to spawn named native teammates with full model IDs and explicit owned paths. Sonnet 5.5 fits independent implementation lanes; a separate Opus 5.5 reviewer can challenge the integrated result. Keep the concurrent team small and use staged review instead of keeping every possible specialist running throughout. The ScopeWatch first-hour A/B/C/D assignments already provide useful lane boundaries; they are human-defined work responsibilities, not proof that an account or vendor contract is resolved.

## Persistence, permissions, and completion evidence

Auto mode approves eligible tool calls **within a turn**; it does not itself start the next turn. `/goal <measurable condition>` adds an evaluator after turns and can continue until the condition is met, judged impossible, cleared, or stopped/paused by documented errors. A goal does not change permission mode. Its condition can be at most 4,000 characters, so reference the complete saved build prompt and state measurable completion checks in the goal. A regular natural-language request to keep working is useful guidance but is not the same harness continuation mechanism. [Goal guide](https://code.claude.com/docs/en/goal#compare-ways-to-keep-a-session-running).

The goal evaluator uses the conversation transcript and does not independently run tests or read files. Require the lead to surface actual build/typecheck/lint/test exit results, review findings and resolutions, and truthful live-account/evidence gate status. A model-evaluated “met” verdict alone is not a passing test receipt or verified native behavior. `/goal` uses a configured small fast model for evaluation; specifying exact lead/teammate models does not mean auxiliary harness requests use only those models. [Goal evaluation](https://code.claude.com/docs/en/goal#how-evaluation-works).

Suggested completion condition for the final prompt: the authorized event implementation and required checks are complete, all actionable independent-review findings are resolved or explicitly dispositioned, the documented evidence/artifacts exist, and any unavailable live prerequisite is truthfully reported with completed independent work. Do not make success depend on invented receipts or endlessly repeat a human-only Guild policy action. Follow readiness milestones and evidenced completion; the current human instruction sets no build deadline, duration cutoff or arbitrary turn cap.

Teammates inherit the lead's permission mode except `dontAsk`. Their permission requests surface in the lead session and require the human there; a teammate cannot grant human consent or relay a denied action to bypass a check. Per-teammate permission modes cannot be set at spawn, though they can be changed afterward. Teammate plan approval is automatically granted in the lead session rather than a separate human review; do not equate it with ScopeWatch's operator approval of native policy scope. [Team permissions](https://code.claude.com/docs/en/agent-teams#permissions), [plan approval behavior](https://code.claude.com/docs/en/agent-teams#have-teammates-plan-before-implementing).

Auto mode retains explicit ask/deny rules, protected-path restrictions, classifier checks, and account limits. It can pause or fall back to manual prompting. It reduces routine interruptions; it does not authorize Guild policy mutations, deployments, paid purchases, secret distribution, or unrelated external actions. ScopeWatch's policy application remains the human Guild UI action or a separately verified CLI under the project contract. [Permission modes](https://code.claude.com/docs/en/permission-modes#available-modes), [ScopeWatch instructions](../../../AGENTS.md), [first-hour plan](../../build/FIRST_HOUR.md).

### Hooks can enforce bounded quality checks

`TaskCompleted` hooks can block task completion with exit code 2 and give stderr feedback. They fire both on explicit `TaskUpdate` completion and when a teammate finishes a turn with in-progress tasks. `TeammateIdle` exit code 2 feeds back and keeps the teammate working. `TaskCreated` can reject creation. These are available extension points, not hooks installed by this research. [Completion hook](https://code.claude.com/docs/en/hooks#taskcompleted), [idle hook](https://code.claude.com/docs/en/hooks#teammateidle), [creation hook](https://code.claude.com/docs/en/hooks#taskcreated).

If the later build adds hooks, use narrow task-specific deterministic checks and a bounded feedback path. Do not run the entire integrated suite before every partial implementation task, prevent all prerequisite tasks from completing, or treat task completion as application correctness. Hook setup is itself a settings/script change subject to trust/permissions; do not silently install it merely to make the prompt look autonomous.

## File isolation, context, resume, and shutdown

| Capability | Verified rule | Build-prompt implication |
|---|---|---|
| Source ownership | Shared task locks are not source locks; same-file edits can overwrite | Assign each teammate owned paths; designate a single integration owner for shared schema/config/lockfiles |
| Teammate context | Loads project context, MCP servers, skills, and its spawn prompt; lead history is absent | Every spawn must include objective, paths, authoritative docs, dependency contracts, acceptance checks, and evidence constraints |
| Task dependencies | Completion unblocks downstream tasks; status can lag | Read actual artifact/check output before closing prerequisites; nudge stale task status |
| Worktrees | Isolate independent sessions/subagents; normal default base is remote default branch | Explicitly inspect base/current required commits; do not assume an uncommitted prompt or event implementation is copied |
| Named agent plus call-level isolation | With teams enabled, an Agent call carrying `isolation` itself remains a subagent | Do not promise automatic per-teammate worktrees by adding call-level `isolation: worktree` |
| Resume | `/resume` and `/rewind` do not restore in-process teammates | Save handoff state and owned work; respawn named teammates after resuming |
| Goal resume | Active condition restores, timer/turn/spend baselines reset | Recheck clock and actual remaining work; goal restoration does not restore teammate runtime |
| Team topology | Exactly one team per session, no nested teams, fixed lead | Lead owns all teammate creation and replacement; teammates cannot form subteams |
| Shutdown | Graceful shutdown waits for current request/tool; may be slow | Ask completed workers to shut down; retain work before ending session |
| Cleanup | Team runtime config removed at session end; task list retained locally | No stale TeamCreate/TeamDelete or mandatory manual team-cleanup command |

Sources: [team context](https://code.claude.com/docs/en/agent-teams#context-and-communication), [spawn rules](https://code.claude.com/docs/en/agent-teams#how-claude-starts-agent-teams), [team limitations](https://code.claude.com/docs/en/agent-teams#limitations), [architecture/retention](https://code.claude.com/docs/en/agent-teams#architecture), [worktree base and isolation](https://code.claude.com/docs/en/worktrees#choose-the-base-branch), [goal resume](https://code.claude.com/docs/en/goal#resume-with-an-active-goal).

Team configuration is generated under `~/.claude/teams/session-<session-id-prefix>/`; tasks are under `~/.claude/tasks/<team-name>/`. Do not pre-author `.claude/teams/teams.json`, edit runtime mailbox/config files, or rely on old tutorials requiring separate team creation/deletion. No project-level team config exists. Changed subagent worktrees are retained rather than discarded immediately; preserve and integrate their work before cleanup. [Team storage contract](https://code.claude.com/docs/en/agent-teams#architecture), [worktree cleanup](https://code.claude.com/docs/en/worktrees#clean-up-subagent-and-background-session-worktrees).

## Cursor's picker is a separate harness

Cursor's official model list includes Opus 5.5 and Sonnet 5.5. Selecting either in Cursor's native Agent chooses the model used by **Cursor's** agent and billing pool; it does not turn that panel into the Claude Code terminal harness. Cursor has its own subagent frontmatter/model parameters and documented fallbacks for admin, plan, or legacy Max Mode restrictions. [Cursor models/pricing](https://cursor.com/docs/models-and-pricing), [Cursor subagent model configuration](https://cursor.com/docs/subagents#model-configuration).

Use a terminal running the installed `claude` CLI for the native Claude Code recipe above. A terminal hosted inside Cursor still runs that CLI independently of the native Cursor Agent model picker. Do not paste `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS`, Claude Code team commands, or Claude Code per-agent settings into Cursor's chat and claim native Claude Code teams exist. If the user instead chooses Cursor's Agent, label the result as Cursor delegation and follow Cursor's contracts; that is a distinct execution route.

## Costs and practical limits

Each active teammate has its own context, and token usage scales with team size and duration. Official guidance recommends small teams, Sonnet workers, focused spawn prompts, and shutting down finished teammates. Each model's 1M maximum does not mean unlimited history or unlimited free usage: Claude Code compacts context, gateways can enforce smaller limits, and subscriptions/account rates still apply. [Team costs](https://code.claude.com/docs/en/costs#agent-team-token-costs), [context and compaction](https://code.claude.com/docs/en/model-config#context-window-and-auto-compaction).

Use `/usage` for account/context visibility and `/cost` where applicable, but do not represent CLI cost estimates as a subscription bill. The `--max-budget-usd` flag is a print-mode API-call cap, not an established total native-team interactive budget. Removing a build cutoff does not establish an API-spend ceiling or guarantee account availability. No account spend ceiling, availability, or successful team test was verified during this research.

## Captures and verification scope

Saved source archive: `/Users/nihalnihalani/Desktop/Github/sponsor-winners-research/.firecrawl/prompt-claude/`. `SOURCES.json` records official URLs and SHA-256 hashes for the captured pages. Developer-index queries were performed first, then official search/scrape verification; third-party indexed hits were not used to establish the contracts above. A short rate-limit failure on two scrapes was retried successfully.

Important captures: `model-config.md`, `opus-5-5.md`, `sonnet-5-5.md`, `agent-teams.md`, `tools-reference.md`, `cli-reference.md`, `permission-modes.md`, `goal.md`, `hooks.md`, `worktrees.md`, `costs.md`, `cursor-models.md`, `cursor-subagents.md`, `local-claude-version.txt`, and `local-claude-help.txt`.

**Still unverified:** account/model access and effective policy; Claude subscription/API routing; active MCP/tool setup; actual native team spawning and exact teammate model; account-specific costs/limits; competition credentials and live vendor behavior. Resolve these through authorized event preflight and keep unresolved states explicit.
