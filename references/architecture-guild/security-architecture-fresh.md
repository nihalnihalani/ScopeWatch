> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Security architecture

> How Guild isolates agent execution, keeps credentials out of agent runtimes, and enforces policy on every outbound call.

Guild separates the control plane from agent execution and mediates every path between them. Agent code never holds credentials, and every call to an external service or LLM provider passes through a Guild-controlled proxy where policy is enforced and the call is recorded.

## Execution isolation

Agent code runs in Guild's runtime, a separate service from the control plane. The runtime holds no credentials and no policy state. Every call an agent makes to an external service or LLM provider goes back through the control plane, which checks policy and adds the credential itself.

Coding agents run in dedicated, network-isolated containers with a two-phase network lifecycle:

1. **Setup phase.** The container has network access to install dependencies and prepare the workspace.
2. **Runtime phase.** Before agent execution begins, the container moves to an offline network with no general egress. From this point, the only outbound paths are Guild-mediated proxies.

During the runtime phase, a stray network call — a package install, a direct API request — fails rather than silently reaching the internet.

## Secretless execution

Agents never see credentials.

* **Service credentials** are injected server-side by Guild's credential proxy after a [credential policy](https://docs.guild.ai/platform/credential-policies) check. The credential never enters the agent's code, container, prompt, or state. See [Credentials](https://docs.guild.ai/platform/credentials).
* **Inference provider credentials** are held server-side. Agent LLM calls route through a Guild proxy to the control plane; the credential never enters the agent runtime. See [LLM settings](https://docs.guild.ai/platform/llm-settings).
* **GitHub access** uses a GitHub App with short-lived installation tokens minted on demand, bounded to the repositories the App is installed on.

## Policy enforcement at egress

Because every outbound call passes through Guild, policy is enforced at the point of egress rather than by agent code:

* **Tool calls** are evaluated against [credential policies](https://docs.guild.ai/platform/credential-policies): a request no rule allows is denied (each new credential starts with an allow-all policy), `DENY` wins over `ALLOW`, with rules scoped by operation, resource (repository, channel, domain, HTTP method), agent, and workspace.
* **LLM calls** are evaluated against [model policies](https://docs.guild.ai/platform/llm-settings#model-policies): an allowlist of models per account, workspace, agent, or workspace-agent, plus a [daily token limit](https://docs.guild.ai/platform/llm-settings#daily-token-limit).
* **Execution limits** cap LLM call counts, token usage, state size, and synchronous steps per execution as runaway backstops. See [Execution limits](https://docs.guild.ai/reference/limits).

## Stop controls

* **Stop a session.** Any running session can be [stopped](https://docs.guild.ai/platform/sessions#stopping-a-session) from the UI or API. Running tasks are halted and the interruption is recorded with who stopped it and when.
* **Disable an agent.** [Archiving an agent](https://docs.guild.ai/platform/agents#disabling-an-agent) removes it from every workspace and stops it from running.
* **Pause automation.** [Deactivating a trigger](https://docs.guild.ai/platform/triggers#activate-and-deactivate) stops scheduled and event-driven runs without deleting the configuration.
* **Revoke a credential.** [Disconnecting a credential](https://docs.guild.ai/platform/credentials#managing-credentials) immediately denies subsequent tool calls, including from sessions already running.

## Audit surfaces

Three complementary records cover what happened and who authorized it:

* The [audit log](https://docs.guild.ai/insights/audit-logs) is a tamper-evident, exportable record of administrative actions: credential changes, trigger changes, agent installs and publishes, membership and role changes, and API key lifecycle.
* The [session event log](https://docs.guild.ai/platform/sessions#event-log) records every LLM call, tool invocation, sub-task spawn, error, and lifecycle transition inside a session, in real time.
* [Insights](https://docs.guild.ai/insights/usage) attributes token usage and spend to each workspace, agent, user, provider, and model.
