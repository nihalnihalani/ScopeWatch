> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Audit logs

> Review a tamper-evident record of administrative actions across your account.

Audit logs give account administrators a tamper-evident record of administrative actions taken across their organization. Open them from **Access & setup > Audit log** in an organization. Only organization admins can view audit logs.

Each log entry captures:

| Field | Description |
| - | - |
| **Timestamp** | When the action occurred (UTC) |
| **Actor** | The user who performed the action |
| **Action** | What was done (e.g., `credential.created`, `trigger.deleted`) |
| **Target** | The resource that was affected |
| **Workspace** | The workspace where the action took place, if applicable |

Audit log entries are read-only and cannot be modified or deleted.

## Captured actions

Audit logs capture actions in these categories:

* **Credentials** — connect, disconnect, rotate
* **Triggers** — create, update, delete, activate, deactivate
* **Agents** — install, uninstall, publish
* **Integrations** — create, update, publish, delete
* **Members** — invite, remove, role change
* **API keys** — create, delete

## Narrowing the timeline

Three controls sit above the log list: an **Event type** dropdown, a **Filters** menu, and the search box.

### Event type

The timeline merges two streams. Pick which one you are looking at:

| Event type | Shows |
| - | - |
| **All** | Both streams, interleaved by time |
| **User actions** | Changes people made through the API — the HTTP audit log |
| **Security events** | Access decisions Guild made — allow, deny, or error |

### Filters

**Filters** opens a menu of values for the stream you are on, and reads **Filters (active)** while one is applied.

* On **User actions**, filter by **Method**: `POST`, `PATCH`, `PUT`, or `DELETE`.
* On **Security events**, filter by **Reason** — the reason code Guild recorded with the decision.

Selecting the same value again clears it, and switching **Event type** clears a filter that does not apply to the new stream.

## Searching and filtering logs

The search box supports field-scoped tokens so you can filter logs to specific operations, decisions, actors, and timeframes. Type a token as `field:value` in the search box, and it parses into a typed filter.

| Token | What it filters | Example |
| - | - | - |
| `operation:` | The security audit log operation. | `operation:users_get_by_username` |
| `decision:` | The security event decision: `ALLOW`, `DENY`, or `ERROR`. | `decision:deny` |
| `actor:` | The actor name. Wrap names containing spaces in quotes. | `actor:"Ada"` |
| `view:` | The HTTP audit log view. | `view:connect` |
| `source:` | The stream source. `user` maps to `http_action`; `security` maps to `security_decision`. | `source:security` |
| `sort:` | The sort order. `asc` shows oldest first; `desc` shows newest first. | `sort:desc` |
| `last:` | A relative timeframe window. | `last:7d`, `last:24h`, `last:30m` |
| `since:` | The start of an absolute timeframe window. | `since:2026-07-01` |
| `until:` | The end of an absolute timeframe window. | `until:2026-07-24` |

Words that are not field-scoped tokens fall through as a free-text query that searches all fields.

Each active token renders as a removable chip below the search box. Click the **X** on a chip to clear that filter.

A `source:` token takes precedence over the **Event type** dropdown, so `source:security` narrows the timeline to security events whatever the dropdown reads. Some tokens imply a stream: `operation:` and `decision:` are security-only, `actor:` and `view:` are user-action-only, and each pins the timeline to its own stream.

## Exporting logs

Click **Export** in the Audit Logs view to download a CSV of the currently filtered log entries.

## Related records

The audit log covers administrative actions. Two other records complete the picture of what agents did and at what cost:

* The [session event log](https://docs.guild.ai/platform/sessions#event-log) records every LLM call, tool invocation, sub-task spawn, error, and lifecycle transition inside each session, including who interrupted a session and when.
* [Insights](https://docs.guild.ai/insights/usage) attributes token usage and spend to each workspace, agent, user, provider, and model.

See [Security architecture](https://docs.guild.ai/platform/security-architecture#audit-surfaces) for how these fit together.
