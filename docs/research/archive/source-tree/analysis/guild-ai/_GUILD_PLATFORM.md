> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Guild AI (guild.ai): the platform and the API surface winners used

Sources: guild.ai and docs.guild.ai (fetched 2026-10-08; about 34 doc pages saved to the scratchpad), the npm registry, and every `repos/guild-ai/*` clone (Phalanx, Branch, RxScout, MediCall from Ship to Prod on 24 Apr 2026; Magpie and DailyGate from Harness Engineering Hack on 12 Jun 2026; Argus from tokens& Self-Evolving Agents on 24 Jul 2026). Lines marked "inference" are my reading, not something a source states.

## 1. What Guild is

- **Positioning.** The site title is "Guild.ai | The Control Plane for AI Agents". The meta description reads: "Guild lets engineering teams manage, govern, and share every agent in production — with security and observability built in." The site headline is "THE ENTERPRISE OS FOR AI AGENTS / Your agents are out of control".
  - "Secure every connection — Control what agents can access with scoped credentials, permissions, policies, and human approval gates."
  - Other products: Software Factory ("Agents can prepare pull requests, but humans approve and merge"), MCP Gateway, Optimizer.
  - Free tier: 100M free tokens (50M at signup, 50M on setup).
- **Hackathon blurb (Luma).** "Code-first, model-agnostic, vendor-neutral platform for engineering teams."
- **Not to be confused with** the older Guild AI ML-experiment tracker, or GNU Guile's `guild` binary. MediCall used `npx @guildai/cli` to avoid that name collision.
- **Core model (docs index).** "A workspace is a container for agents, triggers, context, and credential policies." "A session is a log of an agent's run." Execution path: Browser/CLI → Guild API → runtime (agent executor) → Agent.
- **Sandbox.** "The runtime only supports `@guildai/agents-sdk` and `zod`… Agents have no direct route to the internet… `fetch` exists but cannot connect." Outbound calls go through integrations (`task.tools`), or through `guildai~experimental-fetch` for arbitrary URLs.
  - MediCall's April agents used raw `fetch` successfully. Either the sandbox has tightened since April, or MediCall relied on something else (unresolved).
- **Security architecture.** "Agent code never holds credentials, and every call to an external service or LLM provider passes through a Guild-controlled proxy where policy is enforced and the call is recorded."
- **Guild people at Ship to Prod (Luma).** Judges were James Everingham (CEO), Killian Murphy (VP Engineering) and Bryce Heltzel ("Agents @ Guild.ai", also a speaker).

## 2. The prize

Verbatim from https://ship-to-prod.devpost.com/:

> **Most Innovative Use of Guild.ai Platform** — $2,500 in cash — 6 winners. 1st: $1000 Visa Gift Card (1 team) · 2nd: $500 Visa Gift Card (1 team) · 3rd: $250 Visa Gift Card (4 teams)

- **Overall judging criteria (20% each):**
  - Autonomy ("act on real-time data without manual intervention")
  - Idea
  - Technical Implementation
  - Tool Use ("at least 3 sponsor tools")
  - Presentation ("Demonstration of the solution in 3 minutes")
- **Rules:** teams of up to 4. Hacking ran 11:00–16:30 PT. "No previous projects allowed. Githubs will need to be submitted." Teams had to "Publish your agent's output to cited.md" and were encouraged to monetize with x402/MPP.
- **No Guild-specific judging rubric was published.**
- **No Guild blog, LinkedIn or X post about the winners was found.**
- **Ranks.** Only MediCall's rank is known: 3rd, from a participant's LinkedIn post. Devpost does not show 1st or 2nd.

## 3. Packages and tooling (exact names)

| Package | Where it comes from | What it is | Seen in |
|---|---|---|---|
| `@guildai/cli` (bin `guild`) | **Public npm.** v0.26.0, created 2026-03-06 | Build, test, publish and chat with agents; manage workspaces, sessions and triggers | All CLI users; MediCall `package.json:12-16` |
| `@guildai/agents-sdk` | **Private registry `https://app.guild.ai/npm`** (`guild auth login` configures npm). Public npm returns "Not found". MediCall's April lockfiles, the only lockfiles in these repos that resolve it, pin **0.2.40**; the docs now say 0.6.0 and require Zod ~4.3. Scaffolded `package.json` files mark it `--external` in an esbuild `bundle` script, so the runtime provides it | `agent`, `llmAgent`, `Task`, `pick`, `guildTools`, `userInterfaceTools`, `consoleTools`, `progressLogNotifyEvent`, `guildAgentTool`, `guildServiceTool`, `ask`, `callTools`, `output` | MediCall lockfile `guild-agent/package-lock.json:101-104`; Branch (optional, never installed); Magpie, DailyGate, Argus |
| `@guildai-services/<owner>~<service>` | Private registry | Integration tool sets. Examples: `guildai~github` (`gitHubTools`), `guildai~slack`, `guildai~jira`, `guildai~linear`, `guildai~experimental-coding`, `guildai~experimental-fetch`, `guildlabs~google-docs-oauth`. Teams can also publish their own, e.g. `daily-gate~dailygate-trust` and `sashaskind~composio-gmail` | DailyGate, Argus, Magpie |
| `@guildai/<owner>~<agent>` (and `/tool`) | Private registry | A published agent. Importing `/tool` lets one agent call another as a tool | MediCall package names (`@guildai/medicall~medicall-call-agent`); DailyGate router imports `@guildai/daily-gate~dailygate-observer/tool` |
| `guild.json` | Local, created by `guild agent init` | Holds `agent_id`. The docs say "Don't edit `guild.json` — it's managed by the CLI." | Phalanx reads `agent_id` from it (`src/lib/guild/orchestrator.ts:63-77`) |

## 4. API surface, with code from the repos

### 4.1 Agent types

1. **Auto-managed coded agent**: the `"use agent"` directive plus `agent({ description, inputSchema, outputSchema, tools, run })`. Guild's Babel plugin compiles it into a resumable state machine. Restriction: "No `Promise.all`… use `task.gather`".
   ```ts
   // medicall/guild-agent/agent.ts:1-3,57,90-97
   "use agent";
   import { type Task, agent } from "@guildai/agents-sdk";
   async function run(input: Input, _task: Task<Tools>): Promise<Output> { /* POST /api/run-pipeline */ }
   export default agent({ description: "Triggers MediCall's call pipeline…", inputSchema, outputSchema, tools: {}, run });
   ```
2. **LLM agent**: `llmAgent({ description, systemPrompt, tools, inputSchema?, inputTemplate?, mode: "one-shot" | "multi-turn", useWorkspaceAgents? })`. Every DailyGate and Magpie agent uses this type.
   ```ts
   // dailygate/tiers/reversible/agent.ts:35-56 — a permission tier = a minimal tool grant
   export default llmAgent({
     description, systemPrompt,
     inputSchema: z.object({ id: z.string(), title: z.string(), category: z.string(), needed_action: z.string() }),
     inputTemplate: "Work item {{id}} [{{category}}]: {{title}}. Needed action: {{needed_action}}",
     tools: {
       ...pick(gitHubTools, ["github_issues_get", "github_issues_create_comment", "github_issues_add_labels"]),
       ...pick(guildTools, ["guild_get_me"]),
     },
     mode: "one-shot", useWorkspaceAgents: false,
   });
   ```
3. **Self-managed state agent**: `start(input, task)` and `onToolResults(results, task)`, with `task.save/restore`, `callTools([...])` for parallel tool calls, `ask(prompt)` and `output(...)`. The docs describe it and MediCall's skill notes summarize it (`medicall/.claude/skills/guild-agent-development/SKILL.md`). **No winner used it.**
4. The CLI also lists other agent types: GUILD_NATIVE (`PROMPT.md`), GOOSE, OPENCLAW and LANGGRAPH (`graph.py`).

### 4.2 Tools and connectors (`task.tools`)

- **`pick(toolset, [names])`** scopes an agent to the minimum operations it needs. This is the main least-privilege primitive in winners' code: 27 call sites across the repos.
  ```ts
  // argus/guild-agents/argus-jira-filer/agent.ts:42-45 — "Scoped tools: list projects + create issue only."
  const tools = { ...pick(jiraTools, ["jira_create_issue", "jira_get_all_projects"]), ...consoleTools };
  ...
  created = await task.tools.jira_create_issue(payload);   // :152 — no Jira creds in app code
  ```
- **`guildTools`** gives access to the Guild API itself, as 46 tools named `guild_*`. Hook tools include `guild_agent_install_request` ("User approves agent installation") and `guild_credentials_request` (OAuth).
- **`userInterfaceTools`**: `ui_prompt` ("Ask the user a question and block until they respond (hook — suspends execution)"), `ui_notify` and `ui_ping`.
- **`consoleTools`**: `task.console.log/error` writes to the session log (Argus).
- **An agent as a tool.** DailyGate's router delegates to tier agents that are imported as tools (`dailygate/router/agent.ts:9-13,62-68`). Each tier is a separate Guild agent holding a larger tool grant: L0 read-only, L1 comment/label, L2 assign/close/email, and a coder that opens a PR.
- **Sandboxed code execution**: `task.tools.experimental_coding_create({ image })`, then `communicate`, then `experimental_coding_delete` (`dailygate/coder/agent.ts:57-83`).
- **Progress events**: `task.ui.notify(progressLogNotifyEvent(msg))` (`branch/services/agents/planner/src/agent.ts:109-120`; the fallback path).

### 4.3 Human-in-the-loop and approvals

The docs have no single "approvals" API. The available primitives are:

- `task.ui.prompt({ type: "text", text })`, which blocks until the user replies. It requires `userInterfaceTools`.
- `ask(prompt)`, the self-managed-agent equivalent.
- Hook tools that suspend the session until a human acts (`guild_agent_install_request`, `guild_credentials_request`).
- Credential policies (§4.6), the deterministic, non-LLM enforcement point.

What winners actually did:
- **Phalanx** pre-wrote the decision into the prompt: "Pre-approved decision: APPROVE by phalanx-ci-demo" (`phalanx/src/lib/guild/orchestrator.ts:388-390`; call site `src/lib/scan/orchestrator.ts:403-410`). It never called `ui_prompt`.
- **DailyGate** wrote a prompt rule: "If you are in an interactive session, call the ui_prompt tool to ask the manager… If no user is present, do NOT call ui_prompt" (`dailygate/agent/agent.ts:54-57`).
- **No winner used a credential policy in code.**

### 4.4 Sessions: three ways winners invoked agents

1. **CLI subprocess** (Phalanx, and RxScout according to its Devpost).
   ```ts
   // phalanx/src/lib/guild/orchestrator.ts:106-108
   spawn('guild', ['agent','chat','--path', meta.path,'--mode','json','--no-splash','--ephemeral'])
   // stdin: JSON.stringify({ prompt }) ; stdout: JSON envelope → unwrapEnvelope() → zod parse
   ```
   - `guild agent chat` builds an **ephemeral version from local git-tracked files** by default.
   - `--mode json|jsonl` gives machine I/O, and `--resume <session-id>` continues a session.
   - Phalanx discarded the real session ID and generated its own `randomUUID()` at `:103`. Avoid this.
2. **HTTP API, app host, bearer token** (Magpie).
   ```ts
   // magpie/clipdeck-dashboard/src/lib/guild.ts:73-84,103,31-46
   POST https://app.guild.ai/api/workspaces/{WORKSPACE_ID}/sessions
        { initial_prompt, session_type: "chat", agent_id: "owner~agent" }   // Bearer from `guild auth token`
   GET  https://app.guild.ai/api/sessions/{id}/events   // poll until last `runtime_done` event has content.text
   ```
3. **Public API trigger** (docs).
   ```
   POST https://api.guild.ai/v1/workspaces/{owner}/{workspace}/sessions   (HTTP Basic api_key_id:api_key_secret)
   { "session_type": "api_trigger", "agent_input": { "text": "…" }, "agent_id": "owner~agent" (optional) }
   → 201 { id, session_type: "api", session_url: "https://app.guild.ai/sessions/<id>" }
   ```
   No winner used it. **Its `session_url` is ideal for linking audit evidence.**

### 4.5 Triggers

"A trigger runs an agent automatically — either when an event occurs in an external service, on a recurring schedule, or on demand via an API request."

```bash
guild trigger create --type time --frequency DAILY --time 09:00 --agent <id>
guild trigger create --type webhook --service SLACK --event app_mention --agent <id>   # or --integration github
```

MediCall says it ran a daily 08:00 UTC time trigger (`medicall/docs/guild-judge-walkthrough.md`). Branch planned a GitHub webhook trigger but never built it (`branch/plan.md:24`).

### 4.6 Credential policies (the strongest Cyberdefense primitive, unused by winners)

"Guild's credential proxy evaluates each rule… If a matching `DENY` rule exists, the request is blocked regardless of any `ALLOW` rules. If no rule allows the request, it is denied." Rules can be scoped by `operations` (fnmatch globs), `resources`, `agents` and `workspaces`.

```yaml
github:
  - decision: DENY
    operations: [repos_delete, repos_delete_release]
  - decision: ALLOW
    operations: [issues_*, pulls_*]
```

### 4.7 Audit and observability

- **Audit logs** are "a tamper-evident record of administrative actions… read-only and cannot be modified or deleted". They cover credentials, triggers, agents, integrations, members and API keys.
- **The session event log** "records every LLM call, tool invocation, sub-task spawn, error, and lifecycle transition."
- Stop controls: stop session, archive agent, deactivate trigger, revoke credential.
- Phalanx's "Guild audit log" panel is its **own** Redis event stream (`phalanx/src/components/dashboard/AgentFeed.tsx:43`), not Guild's log.

### 4.8 CLI lifecycle used by winners

```bash
npm install -g @guildai/cli && guild auth login            # configures @guildai npm registry
guild agent init --name x --template AUTO_MANAGED_STATE    # or LLM (default) / BLANK
guild agent test ; guild agent chat [--mode json]
guild agent save --message "v1" --wait --publish           # versioned, semver from package.json
guild agent clone owner~agent                               # Phalanx install hint
guild workspace agent list --workspace org/ws --json        # MediCall evidence scripts
guild session list --workspace org/ws --type time --json
```

## 5. Usage matrix: which Guild features each winner actually used in code

| Feature | Phalanx | Branch | RxScout | MediCall | WildFire | tracepath | Magpie* | DailyGate* | Argus* |
|---|---|---|---|---|---|---|---|---|---|
| SDK installed from the Guild registry | ? (agents not in repo) | **no** (optional dep, absent from lockfile) | no | **yes: lockfile resolves 0.2.40 from app.guild.ai/npm** | ? | ? | declared dep with CLI-scaffolded `bundle` script; no lockfile committed | same as Magpie | same as Magpie |
| Coded `agent()` / `"use agent"` | – | shape only | – | **4 agents** | ? | ? | – | coder | **yes** |
| `llmAgent` | ? | – | – | – | ? | claimed | **4** | **~14** | – |
| Published / versioned agents | claimed (5) | – | – | **yes (v1.0.5)** | ? | ? | yes | yes | yes |
| Invocation | CLI `agent chat --mode json` | Node subprocess (no Guild) | Devpost: CLI; code: none | Guild time trigger + dashboard | ? | Guild agent → OpenAPI tools | HTTP sessions API | triggers / CLI | app adapter |
| `task.tools` integrations | – | – | Devpost: `guildTools`/fetch | – | – | GitHub? (claimed) | – | GitHub, Slack, Linear, Gmail, Calendar | **Jira (scoped)** |
| `pick()` least-privilege | – | – | – | – | – | – | – | **yes** | **yes** |
| Agent-as-tool / delegation | – | – | – | – | – | – | – | **yes (permission tiers)** | – |
| HITL (`ui_prompt` / `ask`) | **simulated** in prompt | – | – | – | app-level approval queue | none ("no human in the middle") | – | prompt-conditional | human acceptance before filing (per LinkedIn) |
| Triggers | – | planned | – | **time (claimed in docs)** | – | – | – | yes | – |
| Credential policies | – | – | – | – | – | – | – | – | implied ("no Jira creds in app") |
| Depth rating | thin wrapper pitched as core | decorative | none in public code | load-bearing scheduler, thin agents | unverifiable | claimed core, unverifiable | load-bearing | core | load-bearing |

\* Projects from later events, included because they show the full API surface. Their code may postdate judging; DailyGate has commits through Aug 2026.

## 6. Takeaways for the Cyberdefense entry

1. **Use Guild's real enforcement points, not look-alikes.**
   - Give each role a separate published agent with a `pick()`-ed toolset.
   - Add a credential policy that DENYs destructive operations for every agent except the operator.
   - Use `task.ui.prompt` for the human gate.
   - Show a DENY happening live. Phalanx's best demo beat was a scope denial, and it happened in WunderGraph, not Guild.
2. **Make Guild sessions the audit trail.** Store and display the real `session_url` / session ID on every finding and action.
3. **Use a trigger** (webhook from GitHub/Semgrep/alerts, or a schedule) so "no human trigger needed" is true. Autonomy is 20% of the score.
4. **Prepare a judge tour of app.guild.ai** in the style of MediCall's `guild-judge-walkthrough.md`: agents, then sessions, then triggers, then policies.
5. **Install the SDK from the Guild registry and commit the lockfile.** That is cheap, verifiable proof; Branch's lockfile shows it never had the SDK.
6. **Respect the sandbox.** Use only the SDK and zod, no `Promise.all` in auto-managed agents, and integrations or `experimental-fetch` for HTTP. Cap tool outputs, as tracepath did.
