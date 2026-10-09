> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/platform/credential-policies#content-area)

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

Credential policies

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

# Credential policies

Copy pageCopy page

Control which operations agents can perform with each connected credential.

Copy pageCopy page

Credential policies let you define fine-grained access rules that Guild’s credential proxy enforces before any request reaches the external service. Limiting what each agent can do with a credential reduces the impact when something goes wrong.

## [​](https://docs.guild.ai/platform/credential-policies\#how-policies-work)  How policies work

A credential policy is a list of rules. Guild’s credential proxy evaluates each rule against the incoming request. If a matching `DENY` rule exists, the request is blocked regardless of any `ALLOW` rules. If no rule allows the request, it is denied.Every new credential starts with an allow-all policy, so it works before you write any rules. Requests that no scoped rule covers stay allowed until you delete that policy — see [Default posture](https://docs.guild.ai/platform/credential-policies#default-posture).

```
github:
  - decision: ALLOW
    operations: [pulls_list, pulls_get, issues_list_for_repo, issues_get]
```

Each rule has a `decision` and one or more conditions. When a rule omits a condition field, that field matches unconditionally.

### [​](https://docs.guild.ai/platform/credential-policies\#rule-fields)  Rule fields

| Field | Type | Description |
| --- | --- | --- |
| `decision` | `ALLOW` \| `DENY` | Whether to permit or block the request when this rule matches. |
| `operations` | list of strings | Operation names or patterns this rule applies to. Omit to match all operations. |
| `resources` | map | [Resource constraints](https://docs.guild.ai/platform/credential-policies#resource-constraints) this rule applies to, keyed by resource type. Omit to match all resources. |
| `agents` | list | Agents this rule applies to. Omit to apply the rule to every agent. |
| `workspaces` | list | Workspaces this rule applies to. Omit to apply the rule to every workspace. |

## [​](https://docs.guild.ai/platform/credential-policies\#operations-field)  Operations field

The `operations` field specifies which operations a rule applies to. Guild matches each entry against the incoming operation name.Values support glob-style wildcard patterns using [`fnmatch`](https://docs.python.org/3/library/fnmatch.html) syntax:

| Pattern | Matches |
| --- | --- |
| `pulls_get` | Only the exact operation `pulls_get` |
| `pulls_*` | Any operation starting with `pulls_` |
| `*_list` | Any operation ending with `_list` |
| `*` | Any operation |

Patterns are case-sensitive. A `null` operation never matches any pattern, including `*`.

### [​](https://docs.guild.ai/platform/credential-policies\#exact-names)  Exact names

To allow a specific set of operations, list them by name:

```
github:
  - decision: ALLOW
    operations: [issues_get, issues_list_for_repo, pulls_get, pulls_list]
```

### [​](https://docs.guild.ai/platform/credential-policies\#wildcard-patterns)  Wildcard patterns

To target a group of related operations, use a pattern. This example allows all `issues_` and `pulls_` operations without listing each one individually:

```
github:
  - decision: ALLOW
    operations: [issues_*, pulls_*]
```

A bare `*` matches every operation:

```
github:
  - decision: ALLOW
    operations: [*]
```

Wildcards follow Python’s `fnmatch` case-sensitive matching. The pattern `get_*` matches `get_issue` and `get_pull` but not `Get_issue`.

## [​](https://docs.guild.ai/platform/credential-policies\#deny-and-allow-precedence)  DENY and ALLOW precedence

`DENY` rules take precedence over `ALLOW` rules. If any rule with `DENY` matches an operation, the request is blocked even when a separate `ALLOW` rule also matches.To block specific operations while permitting everything else, add a targeted `DENY` rule alongside a catch-all `ALLOW`:

```
github:
  - decision: DENY
    operations: [repos_delete, repos_delete_release]
  - decision: ALLOW
    operations: [*]
```

Wildcard patterns work the same way in `DENY` rules. To block all deletion-style operations by pattern:

```
github:
  - decision: DENY
    operations: [*_delete, repos_delete_*]
  - decision: ALLOW
    operations: [*]
```

A `DENY` rule with a wildcard pattern blocks every matching operation regardless of any `ALLOW` rules. Verify your patterns before deploying to production.

## [​](https://docs.guild.ai/platform/credential-policies\#resource-constraints)  Resource constraints

Rules can constrain which resources an operation may touch, not just which operations are allowed. Guild extracts resource identifiers from each outbound request — the repository from a GitHub API path, the channel from a Slack payload, the hostname from an HTTP request — and matches them against the rule before the request leaves Guild.

| Service | Resource key | Value format |
| --- | --- | --- |
| GitHub | `repos` | `owner/repo` patterns, e.g. `acme/*` |
| Slack | `channels` | Channel IDs, e.g. `C0123ABCD` |
| HTTP | `domains` | Hostname patterns, e.g. `*.internal.acme.com` |
| Any | `methods` | HTTP verbs: `GET`, `POST`, `DELETE`, … |

```
github:
  - decision: ALLOW
    operations: [issues_*, pulls_*]
    resources:
      repos: [acme/api, acme/app]
      methods: [GET]
```

This rule lets an agent read issues and pull requests in two named repositories and nothing else — even if the underlying credential can reach every repository in the organization.Use `methods` to separate read access from mutating access. A rule that allows only `GET` grants read-only access regardless of which operations it matches.

## [​](https://docs.guild.ai/platform/credential-policies\#scoping-rules-to-agents-and-workspaces)  Scoping rules to agents and workspaces

Each rule can be scoped to specific agents, specific workspaces, or both. A rule without scoping applies to every agent and workspace that uses the credential.Scoped rules let you give one agent read-only access to one repository while another agent gets write access to a different one, all on the same connected credential.Configure scoping when creating or editing a policy in the UI, or pass `--agents` and `--workspaces` to the CLI:

```
guild credentials policy create <credential-id> \
  --decision ALLOW \
  --operations "issues_*,pulls_*" \
  --resources '{"repos": ["acme/api"], "methods": ["GET"]}' \
  --agents <agent-id> \
  --workspaces <workspace-id>
```

## [​](https://docs.guild.ai/platform/credential-policies\#viewing-policies-in-the-ui)  Viewing policies in the UI

The credentials management page renders each policy as a structured table so you can scan access rules at a glance. Every operation appears in its own row, which makes it clear exactly what each rule permits or blocks.The table includes the following columns:

| Column | Description |
| --- | --- |
| **Operations** | The operation the row applies to. |
| **Access** | Whether the rule allows or denies the operation. |
| **Workspaces** | The workspaces the rule is scoped to. |
| **Agents** | The agents the rule is scoped to. |
| Resource columns | The resources the integration exposes, where it exposes any: **Repositories** for GitHub, **Channels** for Slack, **Domains** and **HTTP methods** for cURL. |

Workspaces and agents appear as chips linking to their workspace or agent pages. Where a rule leaves a dimension unrestricted, the cell reads _All operations_, _All workspaces_, or _All agents_.A cell listing more than six values shows the first six and a **+N more** expander.

### [​](https://docs.guild.ai/platform/credential-policies\#default-posture)  Default posture

Guild auto-creates an unscoped allow-all policy so a credential works before you write any rules. That default is shown while it is the only policy. Once you add a scoped policy the table hides it, because a row allowing everything obscures the rule you just wrote — and reports the effective fallback in a footnote instead:

- _Anything not matched by a policy above is allowed by default_ — the auto-created allow-all policy is still in place, so unmatched requests reach the service.
- _Anything not matched by a policy above is denied by default_ — you deleted it, so unmatched requests are refused.

Delete the allow-all policy once your scoped rules cover everything agents should reach. Until you do, the fallback is allow, not the platform’s default deny.

## [​](https://docs.guild.ai/platform/credential-policies\#enforcement)  Enforcement

Policies are enforced inside Guild’s credential proxy, before any request reaches the external service. Agents never evaluate policy themselves and cannot bypass it: the credential is injected server-side only after the policy check passes. If no rule allows a request, it is denied by default, and a matching `DENY` rule always wins over any `ALLOW`.See [Credentials](https://docs.guild.ai/platform/credentials) for how server-side credential injection works.

[Credentials\\
\\
Previous](https://docs.guild.ai/platform/credentials) [Identity mapping\\
\\
Next](https://docs.guild.ai/platform/identity-mapping)

Ctrl+I

## On this page

- [How policies work](https://docs.guild.ai/platform/credential-policies#how-policies-work)
  - [Rule fields](https://docs.guild.ai/platform/credential-policies#rule-fields)
- [Operations field](https://docs.guild.ai/platform/credential-policies#operations-field)
  - [Exact names](https://docs.guild.ai/platform/credential-policies#exact-names)
  - [Wildcard patterns](https://docs.guild.ai/platform/credential-policies#wildcard-patterns)
- [DENY and ALLOW precedence](https://docs.guild.ai/platform/credential-policies#deny-and-allow-precedence)
- [Resource constraints](https://docs.guild.ai/platform/credential-policies#resource-constraints)
- [Scoping rules to agents and workspaces](https://docs.guild.ai/platform/credential-policies#scoping-rules-to-agents-and-workspaces)
- [Viewing policies in the UI](https://docs.guild.ai/platform/credential-policies#viewing-policies-in-the-ui)
  - [Default posture](https://docs.guild.ai/platform/credential-policies#default-posture)
- [Enforcement](https://docs.guild.ai/platform/credential-policies#enforcement)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

[About](https://www.guild.ai/about) [Contact](https://www.guild.ai/contact) [Privacy policy](https://www.guild.ai/privacy-policy) [Terms](https://www.guild.ai/terms)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

Assistant

Responses are generated using AI and may contain mistakes.