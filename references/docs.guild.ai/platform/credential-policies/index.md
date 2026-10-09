---
source_url: https://docs.guild.ai/platform/credential-policies
source_capture: .firecrawl/click-guild-guild-policies.md
collection_status: reused_prior_capture
indexed_at: 2026-10-09
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Credential policies

> Control which operations agents can perform with each connected credential.

Credential policies let you define fine-grained access rules that Guild's credential proxy enforces before any request reaches the external service. Limiting what each agent can do with a credential reduces the impact when something goes wrong.

## How policies work

A credential policy is a list of rules. Guild's credential proxy evaluates each rule against the incoming request. If a matching `DENY` rule exists, the request is blocked regardless of any `ALLOW` rules. If no rule allows the request, it is denied.

Every new credential starts with an allow-all policy, so it works before you write any rules. Requests that no scoped rule covers stay allowed until you delete that policy — see [Default posture](#default-posture).

```yaml theme={null}
github:
  - decision: ALLOW
    operations: [pulls_list, pulls_get, issues_list_for_repo, issues_get]
```

Each rule has a `decision` and one or more conditions. When a rule omits a condition field, that field matches unconditionally.

### Rule fields

| Field | Type | Description |
| - | - | - |
| `decision` | `ALLOW` \| `DENY` | Whether to permit or block the request when this rule matches. |
| `operations` | list of strings | Operation names or patterns this rule applies to. Omit to match all operations. |
| `resources` | map | [Resource constraints](#resource-constraints) this rule applies to, keyed by resource type. Omit to match all resources. |
| `agents` | list | Agents this rule applies to. Omit to apply the rule to every agent. |
| `workspaces` | list | Workspaces this rule applies to. Omit to apply the rule to every workspace. |

## Operations field

The `operations` field specifies which operations a rule applies to. Guild matches each entry against the incoming operation name.

Values support glob-style wildcard patterns using [`fnmatch`](https://docs.python.org/3/library/fnmatch.html) syntax:

| Pattern | Matches |
| - | - |
| `pulls_get` | Only the exact operation `pulls_get` |
| `pulls_*` | Any operation starting with `pulls_` |
| `*_list` | Any operation ending with `_list` |
| `*` | Any operation |

Patterns are case-sensitive. A `null` operation never matches any pattern, including `*`.

### Exact names

To allow a specific set of operations, list them by name:

```yaml theme={null}
github:
  - decision: ALLOW
    operations: [issues_get, issues_list_for_repo, pulls_get, pulls_list]
```

### Wildcard patterns

To target a group of related operations, use a pattern. This example allows all `issues_` and `pulls_` operations without listing each one individually:

```yaml theme={null}
github:
  - decision: ALLOW
    operations: [issues_*, pulls_*]
```

A bare `*` matches every operation:

```yaml theme={null}
github:
  - decision: ALLOW
    operations: [*]
```

<Note>
  Wildcards follow Python's `fnmatch` case-sensitive matching. The pattern `get_*` matches `get_issue` and `get_pull` but not `Get_issue`.
</Note>

## DENY and ALLOW precedence

`DENY` rules take precedence over `ALLOW` rules. If any rule with `DENY` matches an operation, the request is blocked even when a separate `ALLOW` rule also matches.

To block specific operations while permitting everything else, add a targeted `DENY` rule alongside a catch-all `ALLOW`:

```yaml theme={null}
github:
  - decision: DENY
    operations: [repos_delete, repos_delete_release]
  - decision: ALLOW
    operations: [*]
```

Wildcard patterns work the same way in `DENY` rules. To block all deletion-style operations by pattern:

```yaml theme={null}
github:
  - decision: DENY
    operations: [*_delete, repos_delete_*]
  - decision: ALLOW
    operations: [*]
```

<Warning>
  A `DENY` rule with a wildcard pattern blocks every matching operation regardless of any `ALLOW` rules. Verify your patterns before deploying to production.
</Warning>

## Resource constraints

Rules can constrain which resources an operation may touch, not just which operations are allowed. Guild extracts resource identifiers from each outbound request — the repository from a GitHub API path, the channel from a Slack payload, the hostname from an HTTP request — and matches them against the rule before the request leaves Guild.

| Service | Resource key | Value format |
| - | - | - |
| GitHub | `repos` | `owner/repo` patterns, e.g. `acme/*` |
| Slack | `channels` | Channel IDs, e.g. `C0123ABCD` |
| HTTP | `domains` | Hostname patterns, e.g. `*.internal.acme.com` |
| Any | `methods` | HTTP verbs: `GET`, `POST`, `DELETE`, ... |

```yaml theme={null}
github:
  - decision: ALLOW
    operations: [issues_*, pulls_*]
    resources:
      repos: [acme/api, acme/app]
      methods: [GET]
```

This rule lets an agent read issues and pull requests in two named repositories and nothing else — even if the underlying credential can reach every repository in the organization.

Use `methods` to separate read access from mutating access. A rule that allows only `GET` grants read-only access regardless of which operations it matches.

## Scoping rules to agents and workspaces

Each rule can be scoped to specific agents, specific workspaces, or both. A rule without scoping applies to every agent and workspace that uses the credential.

Scoped rules let you give one agent read-only access to one repository while another agent gets write access to a different one, all on the same connected credential.

Configure scoping when creating or editing a policy in the UI, or pass `--agents` and `--workspaces` to the CLI:

```bash theme={null}
guild credentials policy create <credential-id> \
  --decision ALLOW \
  --operations "issues_*,pulls_*" \
  --resources '{"repos": ["acme/api"], "methods": ["GET"]}' \
  --agents <agent-id> \
  --workspaces <workspace-id>
```

## Viewing policies in the UI

The credentials management page renders each policy as a structured table so you can scan access rules at a glance. Every operation appears in its own row, which makes it clear exactly what each rule permits or blocks.

The table includes the following columns:

| Column | Description |
| - | - |
| **Operations** | The operation the row applies to. |
| **Access** | Whether the rule allows or denies the operation. |
| **Workspaces** | The workspaces the rule is scoped to. |
| **Agents** | The agents the rule is scoped to. |
| Resource columns | The resources the integration exposes, where it exposes any: **Repositories** for GitHub, **Channels** for Slack, **Domains** and **HTTP methods** for cURL. |

Workspaces and agents appear as chips linking to their workspace or agent pages. Where a rule leaves a dimension unrestricted, the cell reads *All operations*, *All workspaces*, or *All agents*.

A cell listing more than six values shows the first six and a **+N more** expander.

### Default posture

Guild auto-creates an unscoped allow-all policy so a credential works before you write any rules. That default is shown while it is the only policy. Once you add a scoped policy the table hides it, because a row allowing everything obscures the rule you just wrote — and reports the effective fallback in a footnote instead:

* *Anything not matched by a policy above is allowed by default* — the auto-created allow-all policy is still in place, so unmatched requests reach the service.
* *Anything not matched by a policy above is denied by default* — you deleted it, so unmatched requests are refused.

Delete the allow-all policy once your scoped rules cover everything agents should reach. Until you do, the fallback is allow, not the platform's default deny.

## Enforcement

Policies are enforced inside Guild's credential proxy, before any request reaches the external service. Agents never evaluate policy themselves and cannot bypass it: the credential is injected server-side only after the policy check passes. If no rule allows a request, it is denied by default, and a matching `DENY` rule always wins over any `ALLOW`.

See [Credentials](https://docs.guild.ai/platform/credentials) for how server-side credential injection works.
