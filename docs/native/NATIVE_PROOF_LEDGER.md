# Native proof ledger (G1 / G1b / G2)

Status vocabulary: `pending` (no real evidence), `observed` (native response captured for this item; not a gate pass), `passed`, `failed`, `unresolved`. This is a ScopeWatch application record, not a vendor attestation.
History: at this file's creation every item was **pending** (`guild auth status` reported "Not authenticated (token expired)", no `GUILD_*` settings, adapter run only against the CONTRACT-TEST MOCK `tests/support/mock-guild`, built from the documented schema). Mock results prove code paths only.
Current (2026-10-09): some G1 inputs are **observed** from two real calibration sessions (below). No gate has passed; nothing is VERIFIED_LIVE.

## Evidence classes used below
- **Native controlled evidence**: responses from the real Guild account, captured by the adapter or entered by the operator from the Guild UI/CLI. None yet.
- **Contract-test**: real adapter vs loopback mock. Not evidence of account behavior.
- **CLI-surface finding**: `guild ... --help` output. Shows the command exists; says nothing about what the account allows. Not executed against an account.

## Native observations recorded (account `nihal.nihalani`, 2026-10-09 ~14:10–14:25 UTC)

Native controlled evidence (CLI as the human user; raw responses kept in ignored `evidence/private/`):

| Observation | Value / consequence |
|---|---|
| CLI auth | `guild auth status`: authenticated as `nihal.nihalani` after the human's `guild auth login` |
| Workspaces visible | `nihal.nihalani~home` (`019dc129-fab3-3bb9-0000-5549ef568e99`), `understudy~my-workspace`; `required_credentials_mode` null, `should_restrict_members` false |
| Pre-existing credentials / triggers / installs | none (0 credentials for both owners, 0 triggers, 0 installed agents) |
| Agents created by the build (private) | see `guild-agents/README.md`; **installed-agent IDs differ from agent definition IDs** |
| API trigger created via CLI | `01a1210d-481f-3d51-0000-e8193501dc4a`; the CLI response contains **no key/secret** (key is web-UI only, as documented) |
| Event type name | events endpoint's valid types list **`security_event`**, not the documented `security` → adapter fixed to accept both |
| Calibration session `01a1210e-1f93-351a-0000-3bb41b85f91f` (chat, ticketassist, read #3) | tool task `github_issues_get` status ERROR, runtime error "Integration credentials not configured for github-oauth"; **no `security_event` recorded** (0 with `types=security_event`) → missing credential fails before a permission decision |
| Task shapes | agent task: `entity_type: EntTaskAgent`, `parent_task_id: null`, `agent.id` = **agent definition ID**, `version` object (not `version_id`); tool task: `entity_type: EntTaskTool`, **`parent_task` object** (not `parent_task_id`), `http_status_code/request_bytes/response_bytes` null on error, no `response_data` key → adapter fixed for `parent_task.id` / `version.id` |
| Pagination | `{has_more, limit, offset, total_count}` present on events and tasks |

Still unobserved at that time (historical; most since observed below): an actual `security_event` payload, its
`credentials_id`/operation string/clock precision, the policy-subject ID domain, and `response_data` availability on
successful tool tasks. The `nihal.nihalani~home` set is not used by the current configuration.

## Native observations recorded (account `charliegillet`, 2026-10-09 ~22:15 UTC)

Native controlled evidence: two sessions launched with the API trigger key, read with a read-only account key.
Sanitized raw responses: `tests/unit/guild/fixtures/native-2026-10-09-charliegillet/` (see its `README.md`; fixture
markers replaced, no keys). Agent IDs: `guild-agents/README.md`.

| Item | Value / consequence |
|---|---|
| Workspace | `charliegillet~scopewatch` (`01a1226d-8f2d-3bb9-0000-8cd6bac376ac`) |
| Trigger | API trigger `scopewatch-api` (`01a12273-707e-3d51-0000-bf5f28c1c0ab`), configured default agent TicketAssist |
| Target session | `01a122bc-1ef2-f9c4-0000-bcb0253909a1`, root task `01a122bc-1ef9-4aa6-0000-c03de051454d` (agent `scopewatch-ticketassist`, definition `01a1226d-b40c-726e-0000-c52bb1bbe8a7`, version `01a1226d-dcfe-cf83-0000-9697f0e273a3`) |
| Control session | `01a122bc-20c5-f9c4-0000-7d43acfdda01`, root task `01a122bc-20cb-4aa6-0000-b137f842d3fa` (agent `scopewatch-releasereview`, definition `01a1226f-93bc-726e-0000-647311bcfc16`, version `01a1226f-a529-cf83-0000-55b870ae6b0f`) |
| Launch `agent_id` | Must be the agent **definition** ID (or `owner~agent-name`). The workspace installed-agent ID returned 400 `{"error":"InvalidInputError","message":"Agent '<id>' not found"}` (`launch-rejected-installed-id.json`). Launch response: `entity_type: EntSessionTriggerApi`, `session_type: "api"`, `workspace`, `root_task` (`EntTaskAgent`, `DISPATCHED`); no projection of the agent that ran |
| `session.trigger.agent` / `trigger.workspace_agent` | The trigger's configured default (TicketAssist definition / installed IDs) on **both** sessions, although the control root task ran ReleaseReview. Not identity or attribution evidence |
| Identity source | Root task `agent.id` = agent definition ID; `version` object `id` = published version ID; security `details.agent_id` = agent definition ID |
| `security_event` shape | Top-level `id`, `type: security_event`, `entity_type: EntEventSecurity`, `operation`, `decision`, `reason_code`, `message`, `created_at`, `capability` (null), `credentials` (null), `integration` (null), `acting_user` object, `task` object. Under `details`: `credentials_id`, `agent_id`, `session_id`, `workspace_id`, `trigger_id`, `run_as_user_id`, `actor_type`, `credential_scope`, `http_method`, `resources`, `service_principal_id` (= trigger ID), `task_entity_type`, `task_status`, `via`. Top-level `task_id`, `credentials_id`, `acting_user_id` **absent** |
| Event task binding | `task.id` is the **tool** task (`EntTaskTool`, `github_issues_get`); `task.parent_task` embeds the root agent task with `agent.id` = definition ID |
| Decision/operation | One `ALLOW` / `ACCESS_ALLOWED`, operation `issues_get`, per session; `details.http_method: GET`, `details.resources.repos: "charliegillet/scopewatch-fixtures"` (a string) |
| Credential | `details.credentials_id` `01a122b4-50dc-c369-0000-8e61c35f6839` on target **and** control; `details.credential_scope: "Account default"` |
| Acting identity | `acting_user` = trigger creator (`charliegillet`), `details.actor_type: HUMAN`, `details.run_as_user_id` = creator ID. Recorded, not authority |
| Clock | `created_at` ISO-8601, 6 fractional digits (microseconds), `+00:00` |
| Tool result content | In the tool task's `runtime_done` event, `content` object (GitHub issue), marker at `content.body`. Tasks listing has **no** `response_data` (tool task `response_bytes` 2644, `http_status_code` 200). Both sessions read fixture issue #1, whose body carries both the control and target fixture markers; no marker in launch text |
| Pagination | One page each: events `total_count` 9 (target) / 10 (control), tasks 3 / 3, `has_more: false` |

Still pending: event-ID identity domain (workspace- vs session-unique); trial DENY and which ID the policy `--agents`
selector takes (definition vs installed); G1, G1b, G2 gates; investigator issue creation.

## Human steps (in order)
1. ~~`! guild auth login`~~ **done 2026-10-09** (authenticated as `nihal.nihalani`).
2. Create the three installed workloads in the Guild workspace: target agent, control agent, investigator. Record, for each, the agent definition ID (what a trigger launch `agent_id` accepts, or `owner~agent-name`) and separately the installed-agent and version IDs. They differ. *(Corrected by native observation 2026-10-09: an installed-agent ID is rejected as launch `agent_id`; see `tests/unit/guild/fixtures/native-2026-10-09-charliegillet/README.md`.)* **Done** for `charliegillet~scopewatch` (`guild-agents/README.md`).
3. Create an **API trigger** (Triggers > Add Trigger > API) and copy the one-time `<key_id>:<key_secret>` string into `GUILD_TRIGGER_ID` / `GUILD_TRIGGER_SECRET`. Trigger keys are web-UI only (no CLI/API).
4. Create an **account API key** with `workspaces:read` and `agents:read` (missing `agents:read` makes the events/tasks reads return 500). Put it in `GUILD_COLLECTOR_KEY_ID` / `GUILD_COLLECTOR_KEY_SECRET`. Never give the investigator or any model these keys.
5. Set `GUILD_WORKSPACE_ID`, `GUILD_WORKSPACE_OWNER`, `GUILD_WORKSPACE_NAME`, `GUILD_TARGET_AGENT_ID`, `GUILD_CONTROL_AGENT_ID`, `GUILD_INVESTIGATOR_AGENT_ID` (agent definition ID or `owner~agent-name`; these are what launches send as `agent_id`), `OWNED_GITHUB_OWNER`, `OWNED_GITHUB_REPO`, `SCOPEWATCH_CONTROL_EXPECTED_MARKER` (the synthetic control ticket content; never put it in a prompt). `GUILD_*_INSTALLED_AGENT_ID` are optional and informational only: never sent as `agent_id`, never identity.
6. Inspect the shared credential: record its ID, whether it is shared by target and control (or equivalently bound), and every existing grant/policy rule (`guild credentials list`, `guild credentials policy list <credential-id>`). Note the default allow-all posture. *Partly observed 2026-10-09:* both sessions used `details.credentials_id` `01a122b4-50dc-c369-0000-8e61c35f6839` (`credential_scope: "Account default"`); grants/policy rules not yet listed.
7. Run one target and one control session; from the real security events record: the policy-subject ID domain (is it the installed-agent ID, the definition ID, something else), `credentials_id`, the exact `operation` string, the event ID domain (workspace vs session scope), `created_at` precision. Put the verified values in `GUILD_VERIFIED_TARGET_POLICY_SUBJECT_ID`, `GUILD_VERIFIED_CONTROL_POLICY_SUBJECT_ID`, `GUILD_VERIFIED_CREDENTIAL_ID`, `GUILD_VERIFIED_OPERATION`. *Observed 2026-10-09:* security evidence carries the agent definition ID (`details.agent_id`), `credentials_id` under `details`, operation `issues_get`, microsecond `created_at`. Pending: event-ID domain, and whether the policy selector accepts the definition ID (step 8).
8. Trial DENY (human, Guild UI, or a separately verified CLI such as `guild credentials policy create <credential-id> --decision DENY --operations <op> --agents <target> --workspaces <ws>`): apply to the TARGET subject only; record the native rule ID and selectors, and which ID form `--agents` accepted. The application never creates policies. **Pending.**
9. Fresh target + control probes (the app does this; operator triggers it). Then remove only the trial rule through the same native control and repeat both probes for G1b.

## G1 - native/projection trial proof (status: pending)
| Item | Needed evidence | What the app records | Status |
|---|---|---|---|
| Two actual launches | returned session ID, root task ID, workspace, session_type for target and control; agent/version from the root agent task (the launch response and `session.trigger.*` do not identify the agent that ran) | `LaunchReceipt` (preserved raw returned fields) | **observed** 2026-10-09 (calibration sessions above); not yet through the app's `LaunchReceipt` |
| Per-event binding | each security event's `task.id` (tool task) resolves through the task graph to an agent task whose agent ref (definition ID, = `details.agent_id`) maps to the verified policy subject | `EventBinding` + proofRef (task chain) | **observed** shape (tool task → root agent task, definition ID); subject mapping to a policy selector pending trial DENY |
| Shared credential | same `credentials_id` on target and control events | `credentialId` per observation | **observed** `01a122b4-50dc-c369-0000-8e61c35f6839` via `details.credentials_id` |
| Unit/operation/clock | the native ALLOW decision is the counted unit; operation string; `created_at` precision | observation `createdAtRaw` / ns | **observed** operation `issues_get`, one ALLOW per read, microsecond `created_at`; event-ID domain (workspace vs session) pending |
| Coverage | all event and task pages exhausted, sessions terminal | `SessionCoverage` page refs | **observed** single complete page each, root tasks `DONE`; not yet through the app collector |
| Policy | native DENY rule on target only (rule ID or UI evidence); which ID `--agents` takes | operator-entered `NativeApplicationReceipt` | pending |
| Trial effects | fresh target `DENY/POLICY_DENIED` for the bound subject, fresh control returns the expected fixture in the tool task's `runtime_done` `content.body` (tasks listing has no `response_data`) | `ProbeResult` x2 | pending |
| Analytics | awaited insert + readback | backend | pending (not native adapter) |

## G1b - restored baseline and main readiness (status: pending)
Remove the known trial rule through the native control only; fresh target and control probes both succeed (control marker present); pin the main manifest after calibration. Pending the G1 results.

## G2 - hosted investigator (status: pending)
Investigator agent (launched by definition ID) runs with compact facts, creates exactly one issue in the owned repo through the GitHub integration; app records session ID, `issues_create` tool task ID, `html_url` from that tool task's result content (on 2026-10-09 tool results appeared in the tool task's `runtime_done` event, not `response_data`; unverified for `issues_create`), and the narrative as untrusted text. Pending: no investigator session or issue creation has been observed.

## Documented-but-unobserved assumptions the live run must confirm
Annotations dated 2026-10-09 are native observations on `charliegillet~scopewatch` (fixtures cited above).
1. `type` of a security event is the string `security` (the schema leaves `type` untyped). *Observed false:* `security_event` (both accounts).
2. `sort_by=id` returns ascending order (docs only state the default is `-id`). Still unobserved.
3. The expanded task `agent` object exposes the agent ref under `id`; the schema shows `agent: {}`. *Observed:* `agent.id` = agent definition ID.
4. Tool task `response_data` is documented as stored **only when the response was projected due to size**. If small responses omit it, control-content inspection cannot be done from the tasks endpoint and the app reports `missing` (it never trusts model prose). *Observed 2026-10-09:* the tasks listing has no `response_data` for a 2644-byte response; the tool result is the tool task's `runtime_done` event `content` (object), issue body at `content.body`. Whether large/projected responses differ is unobserved.
5. `GET /v1/workspaces/{ws}/sessions` and `GET /v1/sessions/{id}/events?types=trigger_message` are documented and are used only for launch reconciliation (the launch input embeds `scopewatch-ref: <ref>`). *Observed:* `trigger_message` `content.data` echoes the launch input including the `scopewatch-ref` line.
6. ~~The trigger-created session response exposes `trigger.agent` fields used for `returnedAgentRef`/`returnedVersionId`~~ *Corrected 2026-10-09:* `session.trigger.agent` / `trigger.workspace_agent` are the trigger's configured default agent, not the agent that ran (control session shows TicketAssist; its root task ran ReleaseReview). Never use them for identity or attribution; use the root agent task and the security event.

7. **Native gate (task classification):** a task node is treated as an AGENT task only when its `entity_type` says so (e.g. `EntTaskAgent`); it is a TOOL task when `tool_name` or an `EntTaskTool` entity type is present. Presence of `agent`, `version_id` or a null `parent_task_id` alone is not enough. If the real account omits `entity_type`, nodes classify `unknown` and every binding is `unresolved` until this gate is resolved by inspecting real task payloads. *Observed:* `entity_type` present (`EntTaskAgent`, `EntTaskTool`) in tasks listing and in the security event's `task` / `task.parent_task`.
8. Recovery probes: a target ALLOW is `allowed`; only result content containing the server-held `SCOPEWATCH_TARGET_EXPECTED_MARKER` is `succeeded_expected`. Per item 4, that content was observed in the tool task's `runtime_done` event, not `response_data`.

## CLI-surface findings (Guild CLI v0.17.0, `--help` only, not executed against an account)
- `guild auth login | logout | status | token`
- `guild credentials list [--owner --search --limit --offset]`
- `guild credentials policy list <credential-id> | create <credential-id> [--decision ALLOW|DENY --operations --workspaces --agents --resources <json>] | update <policy-id> | delete <policy-id>`
- `guild trigger list | get | create [--type webhook|time|api --agent --workspace --input] | update | activate | deactivate | sessions <trigger-id>`
- `guild session list | get | events | tasks | create | send | interrupt`
- `guild workspace list | get | agent | member | context ...`; `guild agent list | get | versions | capabilities ...`
- `guild api <method> <path>`: arbitrary authenticated request (could serve as a separately verified CLI route for reads).
The CLI has a policy mutation surface; whether it is permitted for this account, and what `--agents` expects (installed vs definition ID), is **unverified** (security events carry the definition ID as of 2026-10-09; that does not establish the selector's ID form). The public HTTP API has no inspected policy-mutation endpoint; ScopeWatch does not call one.
