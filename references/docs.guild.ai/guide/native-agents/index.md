---
source_url: https://docs.guild.ai/guide/native-agents
fetched_url: https://docs.guild.ai/guide/native-agents
collected_on: 2026-10-09
collection_status: fresh_primary_capture
raw_json: .firecrawl/scopewatch-guild-native-2026-10-09.json
scrape_id: 01a11f96-9aa9-7669-a7cb-e54a6c65dae7
http_status: 200
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/guide/native-agents#content-area)

A Native agent is a prompt and a tool list. `PROMPT.md` becomes the agent’s system prompt, and an optional `guild.yaml` declares the integrations, sub-agents, and built-in tools it may call. There is no TypeScript, no build step to compile, and no container — Guild runs the agentic loop itself.Use this agent type when the work is expressible as instructions plus tools. It is the shortest path from an idea to a running agent, and it is the type to reach for first.Because the loop runs inside Guild, a Native agent also starts faster than the container-backed types. Goose and OpenClaw agents each get their own container, created when the task starts and destroyed when it ends; a Native agent has nothing to start, so its first turn begins as soon as the task is dispatched.

Native agents take text in and return text out. When you need attachments, a custom input schema, or credential requests, build a [TypeScript LLM agent](https://docs.guild.ai/guide/llm-agents). For a structured output schema, use a [Goose agent](https://docs.guild.ai/guide/goose-agents#output-schema) or [auto-managed state agent](https://docs.guild.ai/guide/coded-agents#input-and-output-schemas). See [What Native agents do not do](https://docs.guild.ai/guide/native-agents#what-native-agents-do-not-do).

## [​](https://docs.guild.ai/guide/native-agents\#create-a-native-agent)  Create a Native agent

- CLI

- Web


```
guild agent init --name my-native-agent --agent-type guild_native
```

The scaffold includes:

```
my-agent/
├── PROMPT.md         # Agent role, behavior, and instructions — becomes the system prompt
├── guild.yaml        # Integrations, sub-agents, and built-in tools
├── README.md
└── .gitignore
```

Replace the template `PROMPT.md` with your agent’s instructions, then save and run the agent like you would any other Guild agent.

1. Open **Agents** in the left nav, click **Your agents**, then click **Create Agent**.
2. Choose **Start with a prompt** — the default creation path for all users.
3. Describe what you want the agent to do. Guild scaffolds a Native agent from your prompt and opens it in the **Editor**, which has tabs for the **System Prompt** (`PROMPT.md`), **README**, and **`guild.yaml`**.
4. Refine the generated `PROMPT.md` with your agent’s instructions.

## [​](https://docs.guild.ai/guide/native-agents\#the-prompt)  The prompt

`PROMPT.md` is the whole agent. Its contents become the system prompt, and it is the only required file — a missing or empty `PROMPT.md` fails the build before any tool validation runs.

```
You are a release-notes assistant.

Given a milestone, list the merged pull requests with the GitHub tools and
group them under Features, Fixes, and Internal. Keep each entry to one line.

Ask before including anything from a draft pull request.
```

The system prompt is written once, at the task’s first dispatch, and is immutable for that task’s lifetime. Editing `PROMPT.md` therefore applies to tasks created after the next build, not to a session already in flight.

### [​](https://docs.guild.ai/guide/native-agents\#workspace-variables)  Workspace variables

A prompt can reference a [workspace variable](https://docs.guild.ai/platform/workspace-variables) with `{{env.KEY}}`, and Guild substitutes the workspace’s value when the task runs. Keys must match `[A-Z][A-Z0-9_]*`; a malformed reference is a build error, so a typo surfaces at save time rather than as a literal `{{env.…}}` in the model’s context.

```
File issues against the {{env.DEFAULT_REPO}} repository unless told otherwise.
```

## [​](https://docs.guild.ai/guide/native-agents\#tools-guild-yaml)  Tools (`guild.yaml`)

Every tool a Native agent can call is declared in `guild.yaml` at the root of the agent’s version files. Each integration operation, sub-agent, and built-in you declare becomes a tool the model sees. Omit the file when the agent needs no tools at all.

```
integrations:
  - name: acme~github
    version: ^1.4.0
    tools: [github_repos_get, github_issues_list]

sub_agents:
  - name: acme~research
    version: ^1.0.0

builtins:
  - name: ui
```

See the [`guild.yaml` reference](https://docs.guild.ai/guide/guild-yaml) for the field rules and validation. A Native agent also accepts a [`models`](https://docs.guild.ai/guide/guild-yaml#models) section to declare the models it prefers.

### [​](https://docs.guild.ai/guide/native-agents\#built-in-tools)  Built-in tools

A Native agent runs in Guild’s own loop rather than a container, so the built-ins available to it differ from the container-backed types:

| Service | Tool | Behavior |
| --- | --- | --- |
| `ui` | `ui_prompt` | Asks the user a question. Suspends the task until they answer. |
| `ui` | `ui_progress` | Posts a progress update without pausing the run. |

`ui_progress` is specific to Native agents. The `console` and `guild` services — and so `console_log` and `guild_credentials_request` — are not available; declaring either is a build error. A missing credential surfaces to the model as a tool error it can explain, rather than as a request to connect the integration.

The `environment` field is not supported for Native agents — there is no container to pin an image to. Declaring it, or any other section a Native agent does not support, is a build error rather than being silently ignored.

## [​](https://docs.guild.ai/guide/native-agents\#input-and-output)  Input and output

Native agents have a fixed text contract: they take text in and return text out. Unlike a Goose recipe, there are no declared parameters and no response JSON schema — the input and output schemas are applied for you at build time.Follow-up messages continue the same task with the transcript intact, so a Native agent holds an open-ended session without any extra declaration. [Workspace context](https://docs.guild.ai/platform/context) is injected into the first user message of a session only.

## [​](https://docs.guild.ai/guide/native-agents\#build-time-validation)  Build-time validation

Guild validates the agent when you save a version:

1. **Validate PROMPT.md** — the prompt is present and non-empty, and every `{{env.KEY}}` reference is well formed. The fixed text input/output contract is applied here.
2. **Validate Guild integrations** — each integration in `guild.yaml` resolves to a published version, and any listed tools map to real operations on it.
3. **Validate Guild subagents** — each sub-agent resolves to a published version.
4. **Validate Guild builtins** — each service and tool is one a Native agent may use.
5. **Store Guild tools** — the resolved tool manifest is recorded on the version. Tool names must be unique across integrations, sub-agents, and builtins; a duplicate is a build error.

A public agent cannot depend on a private integration or a private sub-agent. See [Versions](https://docs.guild.ai/guide/versions) for the full dependency visibility rules.

## [​](https://docs.guild.ai/guide/native-agents\#what-native-agents-do-not-do)  What Native agents do not do

Native agents are deliberately narrow. Use the table to choose the next agent type when your task needs a capability outside their fixed text contract:

| Not supported | Where to go instead |
| --- | --- |
| Attachments — images or PDFs on a turn | [TypeScript LLM agents](https://docs.guild.ai/guide/llm-agents#attachments). A Native agent is told an attachment arrived and that it cannot read it. |
| A custom input schema | [TypeScript LLM agents](https://docs.guild.ai/guide/llm-agents#structured-input). |
| Declared parameters and a structured output schema | [Goose agents](https://docs.guild.ai/guide/goose-agents#parameters), or [auto-managed state agents](https://docs.guild.ai/guide/coded-agents#input-and-output-schemas) for custom Zod input and output schemas. |
| Asking the user to connect an integration | [TypeScript LLM agents](https://docs.guild.ai/guide/llm-agents) with `guildTools`. |
| Reading or writing files, or running commands | [OpenClaw agents](https://docs.guild.ai/guide/openclaw-agents) or [Goose agents](https://docs.guild.ai/guide/goose-agents) — both run in a container with a coding toolchain. |
| Deterministic, cost-predictable logic | [Auto-managed state agents](https://docs.guild.ai/guide/coded-agents). |

Ctrl+I

Assistant

Responses are generated using AI and may contain mistakes.