> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/api-reference/introduction#content-area)

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

Get Started

Introduction

### Get Started

- [Introduction](https://docs.guild.ai/api-reference/introduction)
- [Conversations](https://docs.guild.ai/api-reference/conversations)

### OAuth

- [POST\\
\\
Register an OAuth client](https://docs.guild.ai/api-reference/oauth/register-an-oauth-client)

### Workspaces

- [POST\\
\\
Create a workspace](https://docs.guild.ai/api-reference/workspaces/create-a-workspace)
- [GET\\
\\
Get a workspace](https://docs.guild.ai/api-reference/workspaces/get-a-workspace)
- [GET\\
\\
List a workspace's installed agents](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-installed-agents)
- [POST\\
\\
Add an agent to a workspace](https://docs.guild.ai/api-reference/workspaces/add-an-agent-to-a-workspace)
- [GET\\
\\
List a workspace agent's credential associations](https://docs.guild.ai/api-reference/workspaces/list-a-workspace-agents-credential-associations)
- [POST\\
\\
Share an existing credential with a workspace agent](https://docs.guild.ai/api-reference/workspaces/share-an-existing-credential-with-a-workspace-agent)
- [DEL\\
\\
Disconnect a credential association from a workspace agent](https://docs.guild.ai/api-reference/workspaces/disconnect-a-credential-association-from-a-workspace-agent)
- [POST\\
\\
Mint an API-key credential for a workspace agent](https://docs.guild.ai/api-reference/workspaces/mint-an-api-key-credential-for-a-workspace-agent)
- [GET\\
\\
List a workspace's sessions](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-sessions)
- [POST\\
\\
Start a session in a workspace](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace)
- [POST\\
\\
Create a trigger in a workspace](https://docs.guild.ai/api-reference/workspaces/create-a-trigger-in-a-workspace)

### Agents

- [GET\\
\\
List agents](https://docs.guild.ai/api-reference/agents/list-agents)
- [POST\\
\\
Create an agent](https://docs.guild.ai/api-reference/agents/create-an-agent)
- [GET\\
\\
Get an agent](https://docs.guild.ai/api-reference/agents/get-an-agent)
- [GET\\
\\
List an agent's versions](https://docs.guild.ai/api-reference/agents/list-an-agents-versions)
- [POST\\
\\
Configure an LLM agent](https://docs.guild.ai/api-reference/agents/configure-an-llm-agent)
- [POST\\
\\
Publish an agent version](https://docs.guild.ai/api-reference/agents/publish-an-agent-version)

### Sessions

- [GET\\
\\
Get a session](https://docs.guild.ai/api-reference/sessions/get-a-session)
- [GET\\
\\
Fetch session events](https://docs.guild.ai/api-reference/sessions/fetch-session-events)
- [POST\\
\\
Post a follow-up event to a session](https://docs.guild.ai/api-reference/sessions/post-a-follow-up-event-to-a-session)
- [GET\\
\\
Fetch session sub-tasks](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks)
- [GET\\
\\
Fetch session runtimes](https://docs.guild.ai/api-reference/sessions/fetch-session-runtimes)

### Skills

- [GET\\
\\
Get a skill](https://docs.guild.ai/api-reference/skills/get-a-skill)
- [POST\\
\\
Create a skill version](https://docs.guild.ai/api-reference/skills/create-a-skill-version)

### Accounts

- [GET\\
\\
Identify the calling key](https://docs.guild.ai/api-reference/accounts/identify-the-calling-key)
- [GET\\
\\
List an account's workspaces](https://docs.guild.ai/api-reference/accounts/list-an-accounts-workspaces)
- [GET\\
\\
List an account's skills](https://docs.guild.ai/api-reference/accounts/list-an-accounts-skills)
- [POST\\
\\
Create a skill under an account](https://docs.guild.ai/api-reference/accounts/create-a-skill-under-an-account)

Get Started

# Introduction

Copy pageCopy page

The Guild public API: base URL, authentication, scopes, and response conventions.

Copy pageCopy page

The Guild public API lets external code — partner integrations, scripts, CI pipelines — act on a Guild account programmatically: hold a conversation with an agent, read agents and skills, create workspaces, publish agent versions, schedule an agent with a [time trigger](https://docs.guild.ai/platform/schedule-triggers#with-the-public-api), and read session activity.

This is a different surface from the one described in [API triggers](https://docs.guild.ai/platform/api-triggers). API triggers use a **trigger API key**, scoped to a single trigger, to run one agent on demand. The public API described here uses an **account API key**, scoped to everything the key’s scopes allow across the whole account, to start and hold full conversations with any agent in the account’s workspaces, and to automate broader account and workspace management.

## [​](https://docs.guild.ai/api-reference/introduction\#conversations)  Conversations

A key can hold a full conversation with an agent: start a chat, read the agent’s replies, and send follow-ups. This is the surface a partner backend integrates against most often, so the whole flow is spelled out on its own page — see [Conversations](https://docs.guild.ai/api-reference/conversations).Session events can be polled or streamed over a WebSocket. The WebSocket is part of the public API but does not appear in the sidebar, because OpenAPI cannot describe WebSockets — see [Stream the conversation](https://docs.guild.ai/api-reference/conversations#stream-the-conversation).

## [​](https://docs.guild.ai/api-reference/introduction\#base-url)  Base URL

```
https://api.guild.ai/v1
```

You can explore the API before you create a key. Both of these are unauthenticated:

- **OpenAPI spec** — [`https://api.guild.ai/v1/openapi.yaml`](https://api.guild.ai/v1/openapi.yaml), the machine-readable spec to import into an API client or code generator.
- **API reference** — [`https://api.guild.ai/v1/docs`](https://api.guild.ai/v1/docs), the spec rendered as a browsable reference.

## [​](https://docs.guild.ai/api-reference/introduction\#authentication)  Authentication

Every request presents the API key one of two ways: as HTTP Basic Authentication, with the key’s ID as the username and its secret as the password, or as a Bearer token that carries the whole `<api_key_id>:<api_key_secret>` string in the `Authorization` header.

```
# HTTP Basic Authentication
curl -u "<api_key_id>:<api_key_secret>" https://api.guild.ai/v1/agents

# Bearer token
curl -H "Authorization: Bearer <api_key_id>:<api_key_secret>" https://api.guild.ai/v1/agents
```

The secret is shown exactly once, when the key is created. Settings presents it as a single string: the key id, a colon, then the secret (which starts with `glda_`). That whole string is exactly what `curl -u` takes, and it is exactly the Bearer token to send, so there is no need to split it.

### [​](https://docs.guild.ai/api-reference/introduction\#create-a-key)  Create a key

1

Open account settings

Go to [app.guild.ai](https://app.guild.ai/), open the account (user or organization) you want the key to act as, and go to **Settings**.

2

Create the key

Give it a name and choose its scopes.

3

Copy the credentials

Copy the `<api_key_id>:<api_key_secret>` string shown. It won’t be shown again.

### [​](https://docs.guild.ai/api-reference/introduction\#with-the-cli)  With the CLI

```
guild api-key create --owner <account> --name "CI key" --scopes "agents:write,workspaces:read"   # prints id:secret once
guild api-key list --owner <account>
guild api-key delete <id>
```

`--owner` defaults to the current user’s account. `--scopes` takes comma-separated `<group>:<access>` pairs.

A key created without `--scopes` authenticates but reaches nothing; every request it makes is denied. Always pass the scopes the key needs.

### [​](https://docs.guild.ai/api-reference/introduction\#mcp-clients)  MCP clients

Model Context Protocol (MCP) clients such as Claude or Cursor authenticate with OAuth instead of an account API key. A client registers itself with [dynamic client registration](https://www.rfc-editor.org/rfc/rfc7591) (RFC 7591) by calling [`POST /oauth/register`](https://docs.guild.ai/api-reference/oauth/register-an-oauth-client), so nobody has to add it by hand. A client registered this way is public: it holds no secret and proves itself with PKCE (Proof Key for Code Exchange) on each authorization.

## [​](https://docs.guild.ai/api-reference/introduction\#scopes)  Scopes

A key’s access is limited to the scopes you grant it when you create it. A scope is a `(group, access)` pair:

| Group | What it covers |
| --- | --- |
| `agents` | Reading agents with `read`; creating agents, configuring an LLM agent (system prompt, mode, tools), and publishing versions with `write` |
| `sessions` | Reading session status, events, tasks, and runtimes with `read`; starting a chat and sending follow-ups with `write` — see [Conversations](https://docs.guild.ai/api-reference/conversations) |
| `workspaces` | Reading workspaces, listing a workspace’s sessions, and listing its installed agents (which also requires `agents:read`) with `read`; creating workspaces and installing, updating, or removing a workspace’s agents with `write`. Changing a workspace’s agents needs `workspaces:write`, not `agents:write`, because it changes the workspace. |
| `skills` | Reading skills with `read`; creating skills and skill versions with `write` |
| `integrations` | Attaching an existing credential to a workspace agent, or minting a new one, with `write`. Minting takes an `auth_config_id`, shown as **ID** in the Authentication card of the integration’s Configuration tab |
| `tool_call` | Listing the tools an MCP gateway profile exposes with `read`; running them with `write` |

`access` is `read` or `write`; `write` implies `read`. A key created with no scopes can authenticate but reaches nothing. Each endpoint in this reference lists the scope it requires.

A scope only grants access to entities the key’s account can already see or own. It never lets a key reach another account’s private data, and it can’t act as a person — for example, an `agents:write` key can create and publish agents, but only an admin can make one public.

## [​](https://docs.guild.ai/api-reference/introduction\#request-conventions)  Request conventions

**Ids and names are interchangeable.** Wherever a request names another entity (a path segment like `{workspace_id_or_name}`, or an `owner_id` field), the account or entity **name** works as well as the UUID.**`owner_id` defaults to the key’s account.** On create endpoints where it is optional (creating an agent, for example), omit it and the key’s own account owns the result. There is no need to look up an account UUID.**The id you need next is the top-level one.** Responses embed related entities: an install response contains the agent, the workspace, and their owners, each with an `id` of its own. The id of the thing the call created is always the response’s **top-level**`id` field; ids inside nested objects identify those other entities.

## [​](https://docs.guild.ai/api-reference/introduction\#response-conventions)  Response conventions

**List endpoints** return a paginated envelope:

```
{
  "items": [ ],
  "pagination": {
    "total_count": 42,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

Pass `limit` (default `20`, max `1000`) and `offset` (default `0`) as query parameters to page through results.**Errors** return the relevant `4xx` status with a JSON body:

```
{
  "error": "not_found",
  "message": "Workspace not found"
}
```

| Status | Meaning |
| --- | --- |
| `401` | Missing or invalid credentials. |
| `403` | Authenticated, but the key’s scopes (or the account’s permissions) don’t allow this action. |
| `404` | The resource doesn’t exist, or exists but the key can’t see it — Guild returns 404 rather than 403 for reads, so a denied read is indistinguishable from an absent one. On a write, a 404 usually means an id in the path or parameters doesn’t match anything the key can see; check each id against the response it came from. |
| `400` | The request body or parameters are invalid. |

[Conversations\\
\\
Next](https://docs.guild.ai/api-reference/conversations)

Ctrl+I

## On this page

- [Conversations](https://docs.guild.ai/api-reference/introduction#conversations)
- [Base URL](https://docs.guild.ai/api-reference/introduction#base-url)
- [Authentication](https://docs.guild.ai/api-reference/introduction#authentication)
  - [Create a key](https://docs.guild.ai/api-reference/introduction#create-a-key)
  - [With the CLI](https://docs.guild.ai/api-reference/introduction#with-the-cli)
  - [MCP clients](https://docs.guild.ai/api-reference/introduction#mcp-clients)
- [Scopes](https://docs.guild.ai/api-reference/introduction#scopes)
- [Request conventions](https://docs.guild.ai/api-reference/introduction#request-conventions)
- [Response conventions](https://docs.guild.ai/api-reference/introduction#response-conventions)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

[About](https://www.guild.ai/about) [Contact](https://www.guild.ai/contact) [Privacy policy](https://www.guild.ai/privacy-policy) [Terms](https://www.guild.ai/terms)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

Assistant

Responses are generated using AI and may contain mistakes.