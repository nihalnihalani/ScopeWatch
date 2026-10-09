> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/platform/credentials#content-area)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

- [Guides](https://docs.guild.ai/)
- [CLI](https://docs.guild.ai/cli/getting-started)
- [SDK](https://docs.guild.ai/packages/agents-sdk)
- [API Reference](https://docs.guild.ai/api-reference/introduction)
- [Integrations](https://docs.guild.ai/integrations/overview)
- [Examples](https://docs.guild.ai/examples/overview)

Search...

Ctrl KAsk AssistantCTRLI

- [guild.ai](https://guild.ai/)
- [Sign in](https://app.guild.ai/)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

Search or ask...

Navigation

Access & setup

Credentials

### Overview

- [Introduction](https://docs.guild.ai/)
- [Quickstart](https://docs.guild.ai/quickstart)
- [Command palette](https://docs.guild.ai/platform/command-palette)

### The Smith

- [What is The Smith?](https://docs.guild.ai/platform/smith)
- [Getting started with The Smith](https://docs.guild.ai/docs/the-smith/getting-started)
- [Artifacts](https://docs.guild.ai/platform/artifacts)

### The Factory

- [What is a Software Factory?](https://docs.guild.ai/platform/factory)
- [Factory setup wizard](https://docs.guild.ai/platform/factory-setup-wizard)

### Platform

- Agents

- Workspaces

- Usage

- Agent Hub

- Access & setup



  - [Overview](https://docs.guild.ai/platform/settings)
  - [Account settings](https://docs.guild.ai/platform/account-settings)
  - [Security](https://docs.guild.ai/platform/security-settings)
  - [Organizations](https://docs.guild.ai/platform/organizations)
  - [Profile settings](https://docs.guild.ai/platform/profile-settings)
  - [Credentials](https://docs.guild.ai/platform/credentials)
  - [Credential policies](https://docs.guild.ai/platform/credential-policies)
  - [Identity mapping](https://docs.guild.ai/platform/identity-mapping)
  - [Audit logs](https://docs.guild.ai/insights/audit-logs)
  - [Environments](https://docs.guild.ai/platform/environments)
  - [API keys](https://docs.guild.ai/platform/api-keys)
  - Models & providers
- Concepts


### Agent SDK

- [Introduction](https://docs.guild.ai/guide/sdk-introduction)
- Agents

- [Versions](https://docs.guild.ai/guide/versions)
- Runtime


Access & setup

# Credentials

Copy pageCopy page

Connect third-party services so agents can authenticate automatically, and control which workspaces and agents use each credential.

Copy pageCopy page

Credentials let agents access external services like GitHub, Slack, and Jira on behalf of your team. Every credential is owned by an account — your personal account or an organization — and a credential never serves a workspace owned by a different account.By default, a credential you connect serves every workspace the account owns. You can also connect a credential for a single workspace, for yourself only, or for a single agent.

## [​](https://docs.guild.ai/platform/credentials\#where-a-credential-can-be-used)  Where a credential can be used

| Scope | What it serves | Who can connect it | Where to connect it |
| --- | --- | --- | --- |
| **Account** (default) | Every workspace the account owns | An organization admin, or the owner of a personal account | **Access & setup > Credentials** |
| **Workspace** | Agents in one workspace only | An admin of the account that owns the workspace | The workspace’s **Credentials** page, **The whole workspace** option |
| **Member** | Your own runs in the organization’s workspaces | Any organization member, for themselves | The workspace’s **Credentials** page, **Only me** option |
| **Dedicated to an agent** | One installed agent only | An admin of the account that owns the workspace, or the person who installed the agent | The installed agent’s page, **Dedicated to this agent** |

You can also **grant** an existing credential to one installed agent, so that agent uses it ahead of anything else. See [Give an agent its own credential](https://docs.guild.ai/platform/credentials#give-an-agent-its-own-credential).

## [​](https://docs.guild.ai/platform/credentials\#connect-an-account-credential)  Connect an account credential

Connecting and disconnecting organization credentials requires the **Admin** role. Members see each integration’s connection status but no **Connect** or **Disconnect** action. On a personal account, you manage your own credentials.

1. Go to your personal account or organization at [app.guild.ai](https://app.guild.ai/).
2. Open **Access & setup > Credentials**. The page lists the credentials you have already connected, or a gallery of the apps you can connect when there are none yet.
3. Click **Connect** in the page header, or pick an app from the gallery.
4. Search for and select the app.
5. Choose who the credential is for — **The whole organization** ( **All my workspaces** on a personal account), **One workspace**, or, in an organization, **Only me**. Options your role cannot use are marked.
6. Complete the service’s authorization. An app that authenticates with a key asks for its fields in the same dialog; an app that authenticates by signing in sends you to the service and returns you here.

The credential is now available to agents in every workspace the account owns, unless you scoped it to one workspace or to yourself, or a workspace [restricts itself to its own credentials](https://docs.guild.ai/platform/credentials#restrict-a-workspace-to-its-own-credentials).The list’s **Scope** column names each credential’s scope — **Org default** ( **Account default** on a personal account), **Workspace**, **Member**, or **Agent** — and gives the workspace name for a credential homed to one, so you can tell several credentials for the same app apart.

## [​](https://docs.guild.ai/platform/credentials\#connect-a-workspace-or-member-credential)  Connect a workspace or member credential

Use a workspace credential when one workspace should use a different account for a service than the rest of the organization. Use a member credential when agents should act as you rather than through a credential the whole organization shares.

1. Open the workspace and select **Credentials** in the workspace sidebar. The page lists every credential available to agents in this workspace, with its scope.
2. Click **Connect credential** and choose the app.
3. Choose who the credential belongs to:
   - **The whole workspace** — a workspace credential, owned by the organization. It serves any agent in this workspace and is never offered to another workspace. Requires the **Admin** role.
   - **Only me** — a member credential. It serves only your own runs in this organization’s workspaces, and you can grant it to an agent. Nobody else’s runs use it.
4. Complete the service’s authorization.

## [​](https://docs.guild.ai/platform/credentials\#give-an-agent-its-own-credential)  Give an agent its own credential

An agent can have credentials that apply to it alone. Manage them from the workspace’s **Credentials** page, under **Bind a credential to an agent in this workspace**, or from the installed agent’s page.

- **Dedicated to this agent** — a new credential that only this agent can use. It is stored under the account that owns the workspace and never serves other agents or workspaces. An admin of that account or the person who installed the agent can connect one, with an API key or through OAuth. Connecting a new dedicated credential for the same integration replaces the old one.
- **Granted to this agent** — an existing credential lent to this agent. A granted member credential serves only that member’s runs of the agent; a granted organization credential serves every run of the agent. Revoking a grant removes the agent’s access immediately; the credential itself is not deleted.

For a given integration, an agent uses either grants or a dedicated credential, not both.

### [​](https://docs.guild.ai/platform/credentials\#grants-from-more-than-one-owner)  Grants from more than one owner

Each credential owner holds their own grant on an agent, so granting yours does not displace anyone else’s, and re-granting your own replaces only your earlier grant.An agent authenticates with one grant per service. When more than one live grant could serve a call, the call fails instead of choosing for you: revoke the grants you do not want, or connect a dedicated credential, until one remains.Only an admin of the account that owns the workspace, or the person who installed the agent, can grant or connect an agent’s credentials. A member credential can be granted only by the member it belongs to, and a member can always revoke a grant of their own credential.Account API keys can do the same through the API — see [Share an existing credential with a workspace agent](https://docs.guild.ai/api-reference/workspaces/share-an-existing-credential-with-a-workspace-agent) and [Mint an API-key credential for a workspace agent](https://docs.guild.ai/api-reference/workspaces/mint-an-api-key-credential-for-a-workspace-agent).

## [​](https://docs.guild.ai/platform/credentials\#restrict-a-workspace-to-its-own-credentials)  Restrict a workspace to its own credentials

In a workspace’s **Settings**, turn on **Use only credentials scoped to this workspace** to keep agents there from using the account’s shared credentials. With it on, agents in the workspace use only workspace, member, dedicated, and granted credentials.

## [​](https://docs.guild.ai/platform/credentials\#how-guild-chooses-a-credential)  How Guild chooses a credential

When an agent calls a service, Guild uses the first credential it finds for that service, checking in this order:

1. Credentials **granted to the agent**. For a sub-agent, Guild also checks the agents that called it, nearest first.
2. A credential **dedicated to the agent**.
3. Your **member credential**, when you are the person the run acts for.
4. The **workspace credential**.
5. The **account’s credentials**, unless the workspace is restricted to its own credentials. If the account has more than one credential for the same service, Guild uses the oldest.

If none is found, the call fails and the agent can [ask you to connect the service](https://docs.guild.ai/platform/credentials#when-a-credential-is-missing).Connect one account credential per service. If you need a second connection for the same service, scope it to a workspace, a member, or an agent, so each agent resolves the credential you intend.

## [​](https://docs.guild.ai/platform/credentials\#how-agents-use-credentials)  How agents use credentials

Agents never see credentials. When an agent calls a service tool (e.g. `github_issues_get`), the call goes through Guild’s credential proxy. The proxy chooses the credential, checks its [credential policies](https://docs.guild.ai/platform/credential-policies), and then adds authentication server-side. The credential never enters the agent’s code, container, prompt, or state.For GitHub, Guild authenticates as a GitHub App and mints short-lived installation access tokens on demand. No long-lived GitHub token is stored in or distributed to any runtime, and access is bounded by the repositories the App is installed on — enforced by GitHub itself, in addition to Guild’s policy layer.LLM provider keys are a separate kind of credential with their own settings. They are also held server-side and never placed in the agent runtime. See [LLM settings](https://docs.guild.ai/platform/llm-settings).

## [​](https://docs.guild.ai/platform/credentials\#when-a-credential-is-missing)  When a credential is missing

If an agent needs a service that isn’t connected, it can ask for one using `guild_credentials_request` from [`guildTools`](https://docs.guild.ai/sdk/tools):

```
await task.guild?.credentials_request({
  service: "github",
})
```

The session shows a card asking you to connect the service before the agent continues. Completing it connects an account credential, so on an organization only an admin can complete it. You can also skip the request, and the agent continues without the service.

## [​](https://docs.guild.ai/platform/credentials\#managing-credentials)  Managing credentials

Credentials can be disconnected and reconnected at any time — account credentials from **Access & setup > Credentials**, and workspace, member, and agent credentials from the workspace’s **Credentials** page. Disconnecting a credential immediately blocks agent access to that service: because credentials are resolved at the proxy on every request, subsequent tool calls are denied — including calls from sessions that are already running.On the **Access & setup > Credentials** page, use the search box to filter the list by service name and find a credential quickly.

## [​](https://docs.guild.ai/platform/credentials\#find-credentials-with-the-command-palette)  Find credentials with the command palette

Open the [command palette](https://docs.guild.ai/platform/command-palette) with `Cmd+K` / `Ctrl+K` and search the `credentials` scope for a third-party service by name. Selecting a service you have not connected opens **Access & setup > Credentials** filtered to it, with its **Connect** button.

## [​](https://docs.guild.ai/platform/credentials\#related-settings)  Related settings

LLM provider keys are configured separately from service credentials, in **Access & setup > Models & providers**. See [LLM settings](https://docs.guild.ai/platform/llm-settings).

[Profile settings\\
\\
Previous](https://docs.guild.ai/platform/profile-settings) [Credential policies\\
\\
Next](https://docs.guild.ai/platform/credential-policies)

Ctrl+I

## On this page

- [Where a credential can be used](https://docs.guild.ai/platform/credentials#where-a-credential-can-be-used)
- [Connect an account credential](https://docs.guild.ai/platform/credentials#connect-an-account-credential)
- [Connect a workspace or member credential](https://docs.guild.ai/platform/credentials#connect-a-workspace-or-member-credential)
- [Give an agent its own credential](https://docs.guild.ai/platform/credentials#give-an-agent-its-own-credential)
  - [Grants from more than one owner](https://docs.guild.ai/platform/credentials#grants-from-more-than-one-owner)
- [Restrict a workspace to its own credentials](https://docs.guild.ai/platform/credentials#restrict-a-workspace-to-its-own-credentials)
- [How Guild chooses a credential](https://docs.guild.ai/platform/credentials#how-guild-chooses-a-credential)
- [How agents use credentials](https://docs.guild.ai/platform/credentials#how-agents-use-credentials)
- [When a credential is missing](https://docs.guild.ai/platform/credentials#when-a-credential-is-missing)
- [Managing credentials](https://docs.guild.ai/platform/credentials#managing-credentials)
- [Find credentials with the command palette](https://docs.guild.ai/platform/credentials#find-credentials-with-the-command-palette)
- [Related settings](https://docs.guild.ai/platform/credentials#related-settings)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

[About](https://www.guild.ai/about) [Contact](https://www.guild.ai/contact) [Privacy policy](https://www.guild.ai/privacy-policy) [Terms](https://www.guild.ai/terms)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

Assistant

Responses are generated using AI and may contain mistakes.