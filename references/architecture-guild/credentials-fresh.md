> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Credentials

> Connect third-party services so agents can authenticate automatically, and control which workspaces and agents use each credential.

Credentials let agents access external services like GitHub, Slack, and Jira on behalf of your team. Every credential is owned by an account — your personal account or an organization — and a credential never serves a workspace owned by a different account.

By default, a credential you connect serves every workspace the account owns. You can also connect a credential for a single workspace, for yourself only, or for a single agent.

## Where a credential can be used

| Scope | What it serves | Who can connect it | Where to connect it |
| - | - | - | - |
| **Account** (default) | Every workspace the account owns | An organization admin, or the owner of a personal account | **Access & setup > Credentials** |
| **Workspace** | Agents in one workspace only | An admin of the account that owns the workspace | The workspace's **Credentials** page, **The whole workspace** option |
| **Member** | Your own runs in the organization's workspaces | Any organization member, for themselves | The workspace's **Credentials** page, **Only me** option |
| **Dedicated to an agent** | One installed agent only | An admin of the account that owns the workspace, or the person who installed the agent | The installed agent's page, **Dedicated to this agent** |

You can also **grant** an existing credential to one installed agent, so that agent uses it ahead of anything else. See [Give an agent its own credential](#give-an-agent-its-own-credential).

## Connect an account credential

<Note>
  Connecting and disconnecting organization credentials requires the **Admin** role. Members see each integration's connection status but no **Connect** or **Disconnect** action. On a personal account, you manage your own credentials.
</Note>

1. Go to your personal account or organization at [app.guild.ai](https://app.guild.ai).
2. Open **Access & setup > Credentials**. The page lists the credentials you have already connected, or a gallery of the apps you can connect when there are none yet.
3. Click **Connect** in the page header, or pick an app from the gallery.
4. Search for and select the app.
5. Choose who the credential is for — **The whole organization** (**All my workspaces** on a personal account), **One workspace**, or, in an organization, **Only me**. Options your role cannot use are marked.
6. Complete the service's authorization. An app that authenticates with a key asks for its fields in the same dialog; an app that authenticates by signing in sends you to the service and returns you here.

The credential is now available to agents in every workspace the account owns, unless you scoped it to one workspace or to yourself, or a workspace [restricts itself to its own credentials](#restrict-a-workspace-to-its-own-credentials).

The list's **Scope** column names each credential's scope — **Org default** (**Account default** on a personal account), **Workspace**, **Member**, or **Agent** — and gives the workspace name for a credential homed to one, so you can tell several credentials for the same app apart.

## Connect a workspace or member credential

Use a workspace credential when one workspace should use a different account for a service than the rest of the organization. Use a member credential when agents should act as you rather than through a credential the whole organization shares.

1. Open the workspace and select **Credentials** in the workspace sidebar. The page lists every credential available to agents in this workspace, with its scope.
2. Click **Connect credential** and choose the app.
3. Choose who the credential belongs to:
   * **The whole workspace** — a workspace credential, owned by the organization. It serves any agent in this workspace and is never offered to another workspace. Requires the **Admin** role.
   * **Only me** — a member credential. It serves only your own runs in this organization's workspaces, and you can grant it to an agent. Nobody else's runs use it.
4. Complete the service's authorization.

## Give an agent its own credential

An agent can have credentials that apply to it alone. Manage them from the workspace's **Credentials** page, under **Bind a credential to an agent in this workspace**, or from the installed agent's page.

* **Dedicated to this agent** — a new credential that only this agent can use. It is stored under the account that owns the workspace and never serves other agents or workspaces. An admin of that account or the person who installed the agent can connect one, with an API key or through OAuth. Connecting a new dedicated credential for the same integration replaces the old one.
* **Granted to this agent** — an existing credential lent to this agent. A granted member credential serves only that member's runs of the agent; a granted organization credential serves every run of the agent. Revoking a grant removes the agent's access immediately; the credential itself is not deleted.

For a given integration, an agent uses either grants or a dedicated credential, not both.

### Grants from more than one owner

Each credential owner holds their own grant on an agent, so granting yours does not displace anyone else's, and re-granting your own replaces only your earlier grant.

An agent authenticates with one grant per service. When more than one live grant could serve a call, the call fails instead of choosing for you: revoke the grants you do not want, or connect a dedicated credential, until one remains.

Only an admin of the account that owns the workspace, or the person who installed the agent, can grant or connect an agent's credentials. A member credential can be granted only by the member it belongs to, and a member can always revoke a grant of their own credential.

Account API keys can do the same through the API — see [Share an existing credential with a workspace agent](https://docs.guild.ai/api-reference/workspaces/share-an-existing-credential-with-a-workspace-agent) and [Mint an API-key credential for a workspace agent](https://docs.guild.ai/api-reference/workspaces/mint-an-api-key-credential-for-a-workspace-agent).

## Restrict a workspace to its own credentials

In a workspace's **Settings**, turn on **Use only credentials scoped to this workspace** to keep agents there from using the account's shared credentials. With it on, agents in the workspace use only workspace, member, dedicated, and granted credentials.

## How Guild chooses a credential

When an agent calls a service, Guild uses the first credential it finds for that service, checking in this order:

1. Credentials **granted to the agent**. For a sub-agent, Guild also checks the agents that called it, nearest first.
2. A credential **dedicated to the agent**.
3. Your **member credential**, when you are the person the run acts for.
4. The **workspace credential**.
5. The **account's credentials**, unless the workspace is restricted to its own credentials. If the account has more than one credential for the same service, Guild uses the oldest.

If none is found, the call fails and the agent can [ask you to connect the service](#when-a-credential-is-missing).

Connect one account credential per service. If you need a second connection for the same service, scope it to a workspace, a member, or an agent, so each agent resolves the credential you intend.

## How agents use credentials

Agents never see credentials. When an agent calls a service tool (e.g. `github_issues_get`), the call goes through Guild's credential proxy. The proxy chooses the credential, checks its [credential policies](https://docs.guild.ai/platform/credential-policies), and then adds authentication server-side. The credential never enters the agent's code, container, prompt, or state.

For GitHub, Guild authenticates as a GitHub App and mints short-lived installation access tokens on demand. No long-lived GitHub token is stored in or distributed to any runtime, and access is bounded by the repositories the App is installed on — enforced by GitHub itself, in addition to Guild's policy layer.

LLM provider keys are a separate kind of credential with their own settings. They are also held server-side and never placed in the agent runtime. See [LLM settings](https://docs.guild.ai/platform/llm-settings).

## When a credential is missing

If an agent needs a service that isn't connected, it can ask for one using `guild_credentials_request` from [`guildTools`](https://docs.guild.ai/sdk/tools):

```typescript theme={null}
await task.guild?.credentials_request({
  service: "github",
})
```

The session shows a card asking you to connect the service before the agent continues. Completing it connects an account credential, so on an organization only an admin can complete it. You can also skip the request, and the agent continues without the service.

## Managing credentials

Credentials can be disconnected and reconnected at any time — account credentials from **Access & setup > Credentials**, and workspace, member, and agent credentials from the workspace's **Credentials** page. Disconnecting a credential immediately blocks agent access to that service: because credentials are resolved at the proxy on every request, subsequent tool calls are denied — including calls from sessions that are already running.

On the **Access & setup > Credentials** page, use the search box to filter the list by service name and find a credential quickly.

## Find credentials with the command palette

Open the [command palette](https://docs.guild.ai/platform/command-palette) with `Cmd+K` / `Ctrl+K` and search the `credentials` scope for a third-party service by name. Selecting a service you have not connected opens **Access & setup > Credentials** filtered to it, with its **Connect** button.

## Related settings

LLM provider keys are configured separately from service credentials, in **Access & setup > Models & providers**. See [LLM settings](https://docs.guild.ai/platform/llm-settings).
