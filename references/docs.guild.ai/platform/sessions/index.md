---
source_url: https://docs.guild.ai/platform/sessions
fetched_url: https://docs.guild.ai/platform/sessions.md
collected_on: 2026-10-09
collection_status: fresh_primary_capture
raw_json: .firecrawl/scopewatch-guild-sessions-2026-10-09.json
scrape_id: 01a11f96-5ba1-768e-ad2e-1e34cbf6119f
http_status: 200
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Sessions

> Start conversations with agents and interact with them in real time.

A session is a conversation with an agent. You provide input, the agent runs, asks questions if needed, and returns its output.

## Starting a session

### Web UI

1. Open your workspace at [app.guild.ai](https://app.guild.ai) and click **Chat** in its left nav
2. To send the message to a specific agent, type `@` and pick one of the workspace's agents
3. Type a message and press **Enter**

### CLI

```bash theme={null}
guild session create --agent <agent-name> --workspace <workspace-id>
```

## Sending structured input

Most agents accept a plain-text message, so the composer is a plain-text box. When an agent version defines an input schema with parameters beyond `text` and `attachments`, the composer switches to a JSON editor for that agent.

The editor is prefilled with placeholder values generated from the agent version's parameter schema, so you can replace the placeholders instead of writing the payload from scratch. Edit the values, then press `Shift+Enter` to send. The composer header shows a **Shift+Enter to send** label as a reminder.

## How sessions work

1. You send a message to an agent
2. The **Guild API** receives the request, authenticates it, and forwards it to the runtime
3. The **runtime** loads the agent code and executes it
4. The agent can call tools, invoke sub-agents, make LLM calls, and ask you questions
5. When the agent finishes, its output is returned to your session

## Agent-test session authorization

An agent-test session — started by `guild agent test` or through the API — may only run an agent the workspace already trusts: one owned by the workspace owner's account, or one installed in the workspace as a workspace agent.

That covers testing a public or third-party agent you installed from the Hub. An installed agent already runs in the workspace routinely, through chat, triggers, and tool dispatch, so a test session grants it nothing it does not already have.

## Session lifecycle

Sessions can be in one of several states:

| State | Description |
| - | - |
| **Active** | The agent is running or waiting for your input |
| **Completed** | The agent has finished and returned its output |
| **Failed** | The agent encountered an error |
| **Interrupted** | A user stopped the session; running tasks were halted |

## Stopping a session

Stop a running session from the session menu (**End session**).

Stopping a session immediately transitions its running tasks to **Interrupted**, records who stopped the session and when, and writes the interruption to the session's [event log](#event-log). Stopping a session that has already been stopped does nothing.

Interrupted sessions cannot be resumed.

## Task blocks

In the web UI, each agent invocation renders as a task block with up to four sections:

| Section | Description |
| - | - |
| `INTENT` | The goal the agent set out to accomplish. |
| `PROGRESS` | The model's reasoning stream, rendered live as markdown. Appears between `INTENT` and `ACTIVITY`. |
| `ACTIVITY` | Tool calls and intermediate actions. |
| `RESPONSE` | The agent's final output. |

`PROGRESS` appears only when the selected model supports reasoning and the runtime has it enabled. See [Reasoning progress](https://docs.guild.ai/guide/llms#reasoning-progress).

## Multi-turn sessions

Agents built with `mode: "multi-turn"` keep the session open for back-and-forth conversation. The session remains active until the agent calls the `__submit__` tool to signal completion.

## Agent mentions

In workspace chat, type `@` followed by an agent name to direct your message to a specific agent. The `@mention` UI lets you select any agent installed in the workspace from a picker that appears as you type.

```text theme={null}
@code-reviewer Please review the logic in the auth module.
```

If no agent is mentioned, the message goes to the default agent for the workspace (Smith, unless changed).

## Skill mentions

In workspace chat, type `/` followed by a skill name to activate a [skill](https://docs.guild.ai/platform/skills) for that message. A picker appears as you type, listing the skills available to the workspace.

```text theme={null}
/incident-runbook Walk me through triaging this alert.
```

Mentioning a skill loads its instructions into the agent's context for the current message, so the agent follows the playbook without you restating it. Agent mentions use `@` instead — see [Agent mentions](#agent-mentions).

## Message history

The composer keeps the messages you have sent, so you can recall and resend one without retyping it.

* Press the **Up arrow** to walk back through previously sent messages, starting with the most recent.
* Press the **Down arrow** to walk forward. Pressing it past the newest message restores the draft you were typing before you started navigating.

## Event log

The event log is a real-time view of everything that happens inside a session — LLM calls, tool invocations, sub-task spawns, container log lines, errors, and lifecycle transitions. It is primarily useful for debugging and auditing agent behavior.

To open the event log for a session, click the **Events** tab inside the session view.

Each event entry shows:

| Field | Description |
| - | - |
| **Type** | The kind of event (e.g., `llm_call`, `tool_call`, `agent_console`, `container_log`, `error`) |
| **Timestamp** | When the event occurred |
| **Content** | The raw event payload, collapsed by default |

Click any event to expand its full payload.

### Copying JSON values

Expanded payloads render in a JSON viewer. Hover over any node — an object, an array, or a single value — to reveal a **Copy value** button, and click it to copy that node as formatted JSON. Hovering the outermost node copies the entire payload.

The same viewer and copy control appear wherever Guild renders structured data, including tool call arguments and results, LLM request and response bodies, and webhook payloads.

### Debug mode

Use debug mode when the default stacked list is too verbose to scan. It renders every event in a dense, table-based layout that makes high-volume sessions easier to read.

To turn on debug mode, click the bug icon in the session header toolbar. Click it again to return to the stacked list.

In debug mode, events render in a table with sticky headers and these columns:

| Column | Description |
| - | - |
| **Category** | The kind of event, such as `llm_call`, `tool_call`, or `error`. |
| **Description** | A short summary of the event. |
| **Time** | When the event occurred. |

The table nests each event under the task that produced it, so a sub-task's events sit with that task instead of in one flat run.

Within the table:

* Click a parent task's expand/collapse control to hide or reveal everything beneath it.
* Click a row to expand its details inline.
* Ctrl-click (Windows and Linux) or Cmd-click (macOS) a row to toggle a raw-event JSON viewer inside that row.
* Progress groups flatten into individual rows, so each grouped event appears on its own line.

#### Event filter bar

When you are in debug mode, an event filter chip bar appears above the dense table. Use it to control which event types the table shows.

The chips operate on the processed event types that the UI renders, such as user messages, agent messages, progress, container, agent errors, credentials, LLM, runtime done, runtime error, and console. Toggle a chip off to hide that event type from the table, and toggle it back on to show it again.

LLM events are hidden by default. All other event types are shown by default. Toggle the **LLM** chip on to include LLM events in the table.

Click the reset button (`↺`) to restore all filters to their default states.

<Note>
  Your active filter choices are saved automatically to your browser's local storage, so they persist the next time you open a session in the same browser.
</Note>

#### Event timing waterfall

Use the event timing waterfall to see how long each event took and how events overlap, directly in the debug table. It renders each row's time span as a shaded rectangle behind the **Description** column, so you can scan the sequence and duration of work without leaving the table.

To turn it on, click the Gantt chart icon in the [event filter bar](#event-filter-bar). Hover the icon to see its **Show event timing** or **Hide event timing** tooltip. Click it again to hide the bars.

When the waterfall is on:

* Events with a duration — tasks, runs, LLM spans, and stream groups — render as shaded bars. Each bar's width and horizontal position map to its time span relative to the full session's timeline.
* Point events, which have no duration, render as ticks.
* Overlapping and nested bars step up in color contrast so densely packed rows stay readable.

<Note>
  The waterfall toggle state is saved to your browser's local storage, so it persists the next time you open a session in the same browser.
</Note>

#### Side panels

On wider screens, debug mode opens a panel on each side of the conversation:

* The **left panel** lists the session's **Tasks**. Toggle it with the panel button in the session header.
* The **right panel** carries **Context**, **Agent**, and **Runtimes** sections, along with the session's token counts.

Opening an in-app link from a chat message puts the link panel in the right-hand slot while it is open; the **Tasks** panel stays where it is.

### Container logs

When an agent runs work inside a container — creating an environment, running a setup script — the container's standard output and standard error reach the session as `container_log` events. Previously they were visible only on the runtime detail page.

In the session view they appear as **Container** steps folded into the progress steps group, in chronological order alongside the task's other events, each marked at info or error level. Error lines are styled as errors and count toward the progress group's error badge. In debug mode, the **Container** chip filters them.

In the CLI, a container log line renders with the `container` label:

```bash theme={null}
▪ container Installing dependencies...
✗ container npm ERR! missing script: build
```

Read-only workspace members can see `container_log` events on the timeline without container management access: a viewer may read one if they can access either the container or the session's task timeline.

### Setup log downloads

When a container's setup script fails, the runtime-error event card offers the full output for download — **Download full stdout log** and **Download full stderr log** — and links to the [runtime detail page](https://docs.guild.ai/platform/environments#setup-logs), where the same downloads appear.

The buttons appear only where the logs were captured, so a setup that failed before Guild stored anything shows none.

### Reading events through the API

`GET /v1/sessions/{id}/events` returns the ordered event history as a cursor-paginated list. See [API triggers](https://docs.guild.ai/platform/api-triggers) for the host and authentication.

| Parameter | Type | Description |
| - | - | - |
| `from_id` | string | Return only events after this event ID, exclusive. Omit to start from the first event. |
| `types` | string | Comma-separated event types to include. |
| `limit` | integer | Maximum events per page. |
| `offset` | integer | Events to skip before returning results. |

The response reports `has_more`. While it is `true`, pass the last returned event's `id` as `from_id` to fetch the next page.

<Warning>
  Draft events carry synthetic, ephemeral IDs and are not valid cursors. Passing a response-stream or reasoning-progress draft ID as `from_id` is rejected.
</Warning>

## Streaming and reasoning drafts

While an agent runs, it streams two kinds of intermediate update to your session in real time:

* **Response stream drafts** deliver partial LLM response tokens as the model generates them.
* **Reasoning progress drafts** deliver intermediate reasoning updates as the model works toward an answer.

Both are stored as ephemeral drafts rather than as durable event rows. They render live in the session view but are not persisted to the [event log](#event-log), which keeps the durable log focused on completed LLM calls, tool invocations, and lifecycle transitions.

## Find sessions with the command palette

Open the [command palette](https://docs.guild.ai/platform/command-palette) with `Cmd+K` / `Ctrl+K` and search the `sessions` scope by name. Recent chats are also listed when you open the palette.

## Managing sessions

```bash theme={null}
# List sessions in a workspace
guild session list --workspace <workspace-id>

# Get session details
guild session get <session-id>
```
