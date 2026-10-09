---
source_url: https://docs.guild.ai/platform/api-triggers
source_capture: .firecrawl/click-guild-guild-api-triggers.md
collection_status: reused_prior_capture
indexed_at: 2026-10-09
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# API triggers

> Run an agent on demand via an authenticated HTTP request, and manage the API key that authenticates those requests.

An API trigger runs an agent on demand when an authenticated HTTP request is made to the workspace session endpoint. Unlike event and schedule triggers, an API trigger doesn't fire on its own — your code calls it.

<Note>
  In the CLI and REST API, API triggers are referred to as `api` triggers.
</Note>

## Create an API trigger

<Steps>
  <Step title="Open your workspace">
    Go to [app.guild.ai](https://app.guild.ai) and open the workspace where the agent is installed.
  </Step>

  <Step title="Go to Triggers">
    In the workspace's left nav, click **Triggers** under **Run**, then click **Add Trigger**.
  </Step>

  <Step title="Choose API">
    Select **API** and choose the agent this trigger will run.
  </Step>

  <Step title="Copy the credentials">
    Once the trigger is created, copy the combined credentials string (`<api_key_id>:<api_key_secret>`) displayed in the dialog. This string is shown only once — store it securely.
  </Step>
</Steps>

## Trigger API keys

Every API trigger is authenticated by a trigger API key: a combined `<api_key_id>:<api_key_secret>` credential generated when you create the trigger. Each key is scoped to that one trigger.

You can give a key an optional name to identify its purpose or origin — for example, `ci-pipeline`. Names are up to 100 characters and shown alongside the trigger in the web UI.

<Note>
  Creating and managing trigger API keys is currently exclusive to the web UI. There is no CLI subcommand for managing keys, and no endpoint for it on the public API — use the **Triggers** page in your workspace.
</Note>

## Trigger a session

Guild uses HTTP Basic Authentication to authorize API requests. Your API key is the credential pair: the key ID is the username and the key secret is the password. Pass the combined string as the authentication parameter (for example, with `curl -u "<api_key_id>:<api_key_secret>"`).

<Note>
  Make programmatic calls to the public API host, `https://api.guild.ai`. It accepts API key authentication only — browser session cookies and task tokens are rejected.
</Note>

To start a new agent session, make a `POST` request to the workspace's sessions endpoint:

```http theme={null}
POST /v1/workspaces/{owner_name}/{workspace_name}/sessions
```

#### Request body

The request body must be a JSON object with:

* `session_type`: Must be set to `"api_trigger"`.
* `agent_input`: A JSON object matching the input schema of your agent.
* `agent_id` (optional): Route the session to a different agent installed in the workspace, given as `owner~agent-name` or as a UUID. Omit it to run the trigger's configured agent.

#### Example

```bash theme={null}
curl -X POST https://api.guild.ai/v1/workspaces/<owner_name>/<workspace_name>/sessions \
  -u "<api_key_id>:<api_key_secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "session_type": "api_trigger",
    "agent_input": {
      "text": "Hello, agent!"
    }
  }'
```

#### Response

Returns `201` with the created session. `session_type` is always `"api"` for sessions started by an API trigger, regardless of the `"api_trigger"` value you sent in the request.

```json theme={null}
{
  "id": "3fa2c1e0-9b4e-4b3a-8f1a-2b6b8b6a2b31",
  "entity_type": "EntSessionTriggerApi",
  "created_at": "2026-08-26T14:02:11.483Z",
  "updated_at": "2026-08-26T14:02:11.483Z",
  "session_type": "api",
  "context_id": null,
  "session_url": "https://app.guild.ai/sessions/3fa2c1e0-9b4e-4b3a-8f1a-2b6b8b6a2b31",
  "workspace_url": "https://app.guild.ai/organizations/acme/workspaces/support",
  "interrupted_at": null,
  "interrupted_by": null,
  "workspace": { "id": "...", "name": "support", "full_name": "acme/support", "...": "..." },
  "trigger": { "id": "...", "type": "api", "agent": { "...": "..." }, "...": "..." },
  "root_task": {
    "id": "f1a04e6c-7b2a-4e1d-9c3a-1a2b3c4d5e6f",
    "entity_type": "EntTaskAgent",
    "status": "CREATED"
  },
  "token_usage": null
}
```

| Property | Type | Description |
| - | - | - |
| `id` | string | Session ID. Use this in later requests. |
| `session_type` | string | Always `"api"` for API trigger sessions. |
| `session_url` | string | Link to view the session in the Guild web UI. |
| `workspace` | object | The workspace the session runs in. |
| `trigger` | object | The trigger that started this session. |
| `root_task` | object or null | The agent's top-level task. `status` starts at `"CREATED"` and progresses as the agent runs (see [Fetch session sub-tasks](#fetch-session-sub-tasks) for the full status list). |
| `token_usage` | object or null | Aggregated LLM token usage for the session, or `null` until the agent has made at least one LLM call. |

## Interactive follow-up

If the agent is conversational or awaits subsequent inputs, you can post follow-up events directly to the session:

```http theme={null}
POST /v1/sessions/{session_id}/events
```

#### Request body

* `mode`: Set to `"text"` (default) or `"json"`.
* `content`: The message content. For `"text"` mode, a string; for `"json"` mode, a JSON object.

<Note>
  Requests authenticated with a trigger API key only deliver text to the agent. If you send multiple text parts they are joined with spaces, but there is no way to attach an image or file — that's only supported for messages sent by a logged-in user through the chat UI.
</Note>

#### Example

```bash theme={null}
curl -X POST https://api.guild.ai/v1/sessions/<session_id>/events \
  -u "<api_key_id>:<api_key_secret>" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "text",
    "content": "Follow-up question or answer goes here"
  }'
```

#### Response

Returns `201` with the created event. Events posted with a trigger API key are recorded as `trigger_message` events.

```json theme={null}
{
  "id": "9d2f4a1b-6e3c-4a2f-8b1d-5c6e7f8a9b0c",
  "entity_type": "EntEventTriggerMessage",
  "created_at": "2026-08-26T14:05:32.104Z",
  "updated_at": "2026-08-26T14:05:32.104Z",
  "task": { "id": "f1a04e6c-7b2a-4e1d-9c3a-1a2b3c4d5e6f", "entity_type": "EntTaskAgent", "status": "STARTED" },
  "type": "trigger_message",
  "content": { "type": "text", "data": "Follow-up question or answer goes here" }
}
```

| Property | Type | Description |
| - | - | - |
| `id` | string | Event ID. |
| `type` | string | Always `"trigger_message"` for events created through this endpoint with a trigger API key. |
| `task` | object | The task this event was posted to. `task.status` reflects the agent's current execution state — see [Fetch session sub-tasks](#fetch-session-sub-tasks) for the full status list. |
| `content` | object | `{"type": "text", "data": "<your message>"}`. For `"json"` mode, `data` is the JSON-stringified body you sent. |

## Retrieve session status

Retrieve the current execution state and metadata of a specific session:

```http theme={null}
GET /v1/sessions/{session_id}
```

#### Example

```bash theme={null}
curl -X GET https://api.guild.ai/v1/sessions/<session_id> \
  -u "<api_key_id>:<api_key_secret>"
```

#### Response

Returns `200` with the same session shape as [Trigger a session](#trigger-a-session). `root_task.status` and `token_usage` update as the agent runs:

```json theme={null}
{
  "id": "3fa2c1e0-9b4e-4b3a-8f1a-2b6b8b6a2b31",
  "entity_type": "EntSessionTriggerApi",
  "created_at": "2026-08-26T14:02:11.483Z",
  "updated_at": "2026-08-26T14:02:48.912Z",
  "session_type": "api",
  "context_id": null,
  "session_url": "https://app.guild.ai/sessions/3fa2c1e0-9b4e-4b3a-8f1a-2b6b8b6a2b31",
  "workspace_url": "https://app.guild.ai/organizations/acme/workspaces/support",
  "interrupted_at": null,
  "interrupted_by": null,
  "workspace": { "id": "...", "name": "support", "full_name": "acme/support", "...": "..." },
  "trigger": { "id": "...", "type": "api", "agent": { "...": "..." }, "...": "..." },
  "root_task": {
    "id": "f1a04e6c-7b2a-4e1d-9c3a-1a2b3c4d5e6f",
    "entity_type": "EntTaskAgent",
    "status": "DONE"
  },
  "token_usage": {
    "input_tokens": 4213,
    "output_tokens": 512,
    "cache_write_tokens": 1800,
    "cache_read_tokens": 900,
    "total_tokens": 6513,
    "llm_call_count": 3
  }
}
```

`root_task.status` is one of `CREATED`, `DISPATCHED`, `STARTED`, `WAITING`, `DONE`, `ERROR`, or `INTERRUPTED`. `DONE`, `ERROR`, and `INTERRUPTED` are terminal — poll until you see one of those to know the agent has finished.

## Fetch session events (logs and thoughts)

Retrieve the chronological feed of logs, agent thought progress, LLM usage statistics, tool calls, and final outputs:

```http theme={null}
GET /v1/sessions/{session_id}/events
```

#### Query parameters (Optional)

* `limit`: Maximum number of events to return (default: 20, max: 1000).
* `offset`: Number of events to skip (default: 0).
* `from_id`: Only return events with an `id` greater than this one — use the last event `id` you've seen as a cursor to page forward without `offset`.
* `types`: Comma-separated list of event types to filter by (e.g., `agent_console`, `trigger_message,user_message`).
* `sort_by`: Sort order (default: `-id`, newest first).

#### Example

```bash theme={null}
curl -X GET "https://api.guild.ai/v1/sessions/<session_id>/events?limit=100" \
  -u "<api_key_id>:<api_key_secret>"
```

#### Response

Returns `200` with a page of events, newest first by default. Every event has `id`, `entity_type`, `created_at`, `updated_at`, `task`, and `type`; the remaining fields depend on `type`.

##### Container log events

The response can include `container_log` events, carrying standard output and standard error produced inside a task's container.

| Field | Description |
| - | - |
| `id` | The unique identifier of the event. |
| `created_at` | The ISO-8601 timestamp when the event was recorded. |
| `updated_at` | The ISO-8601 timestamp when the event was last updated. |
| `task` | The task that produced the log line, serialized inline. |
| `type` | The event type, always `"container_log"`. |
| `level` | The log level — `INFO`, `ERROR`, or `null` when the line carries no level. |
| `message` | The log line text. |
| `timestamp` | The ISO-8601 timestamp when the line was produced inside the container. |

```json theme={null}
{
  "items": [
    {
      "id": "9d2f4a1b-6e3c-4a2f-8b1d-5c6e7f8a9b0c",
      "entity_type": "EntEventAgentConsole",
      "created_at": "2026-08-26T14:02:39.221Z",
      "updated_at": "2026-08-26T14:02:39.221Z",
      "task": { "id": "f1a04e6c-7b2a-4e1d-9c3a-1a2b3c4d5e6f", "entity_type": "EntTaskAgent", "status": "DONE" },
      "type": "agent_console",
      "level": "info",
      "content": "Looked up the ticket and drafted a reply."
    },
    {
      "id": "7c1b3e2a-4d5f-4a6b-9c8d-2e3f4a5b6c7d",
      "entity_type": "EntEventTriggerMessage",
      "created_at": "2026-08-26T14:02:11.520Z",
      "updated_at": "2026-08-26T14:02:11.520Z",
      "task": { "id": "f1a04e6c-7b2a-4e1d-9c3a-1a2b3c4d5e6f", "entity_type": "EntTaskAgent", "status": "DONE" },
      "type": "trigger_message",
      "content": { "type": "text", "data": "Hello, agent!" }
    }
  ],
  "pagination": {
    "total_count": 2,
    "limit": 100,
    "offset": 0,
    "has_more": false
  }
}
```

| Property | Type | Description |
| - | - | - |
| `type` | string | The event type — `trigger_message` and `user_message` carry the conversation; `agent_console`, `llm_start`/`llm_done`, and `runtime_*` events carry execution logs and thoughts. |
| `pagination.total_count` | integer | Total events matching the query, across all pages. |
| `pagination.has_more` | boolean | Whether a later page exists at the current `limit`/`offset`. |

## Fetch session sub-tasks

Fetch a list of all sub-tasks spawned by parent agents or tool calls inside this session:

```http theme={null}
GET /v1/sessions/{session_id}/tasks
```

#### Example

```bash theme={null}
curl -X GET https://api.guild.ai/v1/sessions/<session_id>/tasks \
  -u "<api_key_id>:<api_key_secret>"
```

#### Response

Returns `200` with a page of tasks, oldest first. The root task (the one your trigger started) has `parent_task_id: null`; tool calls and sub-agent runs appear as their own tasks with `parent_task_id` pointing back to the task that spawned them.

```json theme={null}
{
  "items": [
    {
      "id": "f1a04e6c-7b2a-4e1d-9c3a-1a2b3c4d5e6f",
      "entity_type": "EntTaskAgent",
      "created_at": "2026-08-26T14:02:11.501Z",
      "updated_at": "2026-08-26T14:02:48.912Z",
      "status": "DONE",
      "session": { "id": "3fa2c1e0-9b4e-4b3a-8f1a-2b6b8b6a2b31", "...": "..." },
      "parent_task_id": null,
      "agent": { "id": "...", "name": "support-agent", "...": "..." },
      "version": { "id": "...", "...": "..." },
      "parent_task": null,
      "token_usage": {
        "input_tokens": 4213,
        "output_tokens": 512,
        "cache_read_tokens": 900,
        "cache_write_tokens": 1800,
        "total_tokens": 6513,
        "llm_call_count": 3
      }
    },
    {
      "id": "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e",
      "entity_type": "EntTaskTool",
      "created_at": "2026-08-26T14:02:20.114Z",
      "updated_at": "2026-08-26T14:02:21.033Z",
      "status": "DONE",
      "session": { "id": "3fa2c1e0-9b4e-4b3a-8f1a-2b6b8b6a2b31", "...": "..." },
      "tool_name": "search_tickets",
      "tool_call_id": "toolu_01abc123",
      "token_usage": null,
      "request_bytes": 128,
      "response_bytes": 942,
      "http_status_code": 200,
      "parent_task": { "id": "f1a04e6c-7b2a-4e1d-9c3a-1a2b3c4d5e6f", "entity_type": "EntTaskAgent", "status": "DONE" }
    }
  ],
  "pagination": {
    "total_count": 2,
    "limit": 20,
    "offset": 0,
    "has_more": false
  }
}
```

| Property | Type | Description |
| - | - | - |
| `entity_type` | string | `EntTaskAgent` for the root agent task or a sub-agent invocation; `EntTaskTool` for a tool call. |
| `status` | string | One of `CREATED`, `DISPATCHED`, `STARTED`, `WAITING`, `DONE`, `ERROR`, `INTERRUPTED` — same values as `root_task.status` on the session. |
| `parent_task_id` / `parent_task` | string / object or null | Links a sub-task back to the task that spawned it. `null` on the root task. |

## Real-time streaming (WebSockets)

If you are building a real-time interface or monitoring tool, connect to the session events WebSocket instead of polling `GET /v1/sessions/{session_id}/events`.

```http theme={null}
wss://api.guild.ai/v1/sessions/{session_id}/events/ws
```

Authenticate with the same API key, sent as an `Authorization: Basic` header on the connection request.

<Note>
  The header is the only way to authenticate this connection. A browser's built-in `WebSocket` cannot set request headers, so connect from a server-side or native client instead.
</Note>

## Security and scope

* **Workspace Scope:** The API key carries workspace-level permissions. This allows it to read and write (including fetching status, event feeds, sub-tasks, and runtime statuses, as well as sending follow-up events/messages) to **any session** in the same workspace.
* **Execution Identity:** Sessions started via an API key do not run on behalf of a human user (`acting_user_id` is `None`). However, when viewing the session's chat feed in the UI, any events generated by the API will display the avatar of the user who originally created the trigger.

See [Manage triggers](https://docs.guild.ai/platform/triggers#manage-triggers) for activating, deactivating, listing, and inspecting triggers of any type.
