# Native proof ledger (G1 / G1b / G2)

Status vocabulary: `pending` (no real evidence), `passed`, `failed`, `unresolved`. This is a ScopeWatch application record, not a vendor attestation.
As of this file's creation every item is **pending**: `guild auth status` reported "Not authenticated (token expired)", no `GUILD_*` settings exist, and the adapter has only run against the CONTRACT-TEST MOCK (`tests/support/mock-guild`, built from the documented schema, not an observed account). Mock results prove code paths only.

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

Still unobserved: an actual `security_event` payload (needs the GitHub credential), its `credentials_id`/operation
string/clock precision, the policy-subject ID domain, and `response_data` availability on successful tool tasks.

## Human steps (in order)
1. ~~`! guild auth login`~~ **done 2026-10-09** (authenticated as `nihal.nihalani`).
2. Create the three installed workloads in the Guild workspace: target agent, control agent, investigator. Record, for each, the installed-agent ID (what a trigger `agent_id` accepts) and separately the agent definition/version ID. Do not assume they are the same.
3. Create an **API trigger** (Triggers > Add Trigger > API) and copy the one-time `<key_id>:<key_secret>` string into `GUILD_TRIGGER_ID` / `GUILD_TRIGGER_SECRET`. Trigger keys are web-UI only (no CLI/API).
4. Create an **account API key** with `workspaces:read` and `agents:read` (missing `agents:read` makes the events/tasks reads return 500). Put it in `GUILD_COLLECTOR_KEY_ID` / `GUILD_COLLECTOR_KEY_SECRET`. Never give the investigator or any model these keys.
5. Set `GUILD_WORKSPACE_ID`, `GUILD_WORKSPACE_OWNER`, `GUILD_WORKSPACE_NAME`, `GUILD_TARGET_INSTALLED_AGENT_ID`, `GUILD_CONTROL_INSTALLED_AGENT_ID`, `GUILD_INVESTIGATOR_INSTALLED_AGENT_ID`, `OWNED_GITHUB_OWNER`, `OWNED_GITHUB_REPO`, `SCOPEWATCH_CONTROL_EXPECTED_MARKER` (the synthetic control ticket content; never put it in a prompt).
6. Inspect the shared credential: record its ID, whether it is shared by target and control (or equivalently bound), and every existing grant/policy rule (`guild credentials list`, `guild credentials policy list <credential-id>`). Note the default allow-all posture.
7. Run one target and one control session; from the real security events record: the policy-subject ID domain (is it the installed-agent ID, the definition ID, something else), `credentials_id`, the exact `operation` string, the event ID domain (workspace vs session scope), `created_at` precision. Put the verified values in `GUILD_VERIFIED_TARGET_POLICY_SUBJECT_ID`, `GUILD_VERIFIED_CONTROL_POLICY_SUBJECT_ID`, `GUILD_VERIFIED_CREDENTIAL_ID`, `GUILD_VERIFIED_OPERATION`.
8. Trial DENY (human, Guild UI, or a separately verified CLI such as `guild credentials policy create <credential-id> --decision DENY --operations <op> --agents <target> --workspaces <ws>`): apply to the TARGET subject only; record the native rule ID and selectors. The application never creates policies.
9. Fresh target + control probes (the app does this; operator triggers it). Then remove only the trial rule through the same native control and repeat both probes for G1b.

## G1 - native/projection trial proof (status: pending)
| Item | Needed evidence | What the app records | Status |
|---|---|---|---|
| Two actual launches | returned session ID, root task ID, workspace, session_type, installed agent/version for target and control | `LaunchReceipt` (preserved raw returned fields) | pending |
| Per-event binding | each security `task_id` resolves through the task graph to an agent task whose agent ref maps to the verified policy subject | `EventBinding` + proofRef (task chain) | pending |
| Shared credential | same `credentials_id` on target and control events | `credentialId` per observation | pending |
| Unit/operation/clock | the native ALLOW decision is the counted unit; operation string; `created_at` precision | observation `createdAtRaw` / ns | pending |
| Coverage | all event and task pages exhausted, sessions terminal | `SessionCoverage` page refs | pending |
| Policy | native DENY rule on target only (rule ID or UI evidence) | operator-entered `NativeApplicationReceipt` | pending |
| Trial effects | fresh target `DENY/POLICY_DENIED` for the bound subject, fresh control returns the expected fixture in tool `response_data` | `ProbeResult` x2 | pending |
| Analytics | awaited insert + readback | backend | pending (not native adapter) |

## G1b - restored baseline and main readiness (status: pending)
Remove the known trial rule through the native control only; fresh target and control probes both succeed (control marker present); pin the main manifest after calibration. Pending the G1 results.

## G2 - hosted investigator (status: pending)
Investigator installed agent runs with compact facts, creates exactly one issue in the owned repo through the GitHub integration; app records session ID, `issues_create` tool task ID, `html_url` from its `response_data`, and the narrative as untrusted text. Pending.

## Documented-but-unobserved assumptions the live run must confirm
1. `type` of a security event is the string `security` (the schema leaves `type` untyped).
2. `sort_by=id` returns ascending order (docs only state the default is `-id`).
3. The expanded task `agent` object exposes the agent ref under `id`; the schema shows `agent: {}`.
4. Tool task `response_data` is documented as stored **only when the response was projected due to size**. If small responses omit it, control-content inspection cannot be done from the tasks endpoint and the app reports `missing` (it never trusts model prose). Record what the account actually returns.
5. `GET /v1/workspaces/{ws}/sessions` and `GET /v1/sessions/{id}/events?types=trigger_message` are documented and are used only for launch reconciliation (the launch input embeds `scopewatch-ref: <ref>`).
6. The trigger-created session response exposes `trigger.agent` fields used for `returnedAgentRef`/`returnedVersionId`; both are best-effort and null when absent.

7. **Native gate (task classification):** a task node is treated as an AGENT task only when its `entity_type` says so (e.g. `EntTaskAgent`); it is a TOOL task when `tool_name` or an `EntTaskTool` entity type is present. Presence of `agent`, `version_id` or a null `parent_task_id` alone is not enough. If the real account omits `entity_type`, nodes classify `unknown` and every binding is `unresolved` until this gate is resolved by inspecting real task payloads.
8. Recovery probes: a target ALLOW is `allowed`; only `response_data` containing the server-held `SCOPEWATCH_TARGET_EXPECTED_MARKER` is `succeeded_expected`. The same `response_data` availability caveat (item 4) applies.

## CLI-surface findings (Guild CLI v0.17.0, `--help` only, not executed against an account)
- `guild auth login | logout | status | token`
- `guild credentials list [--owner --search --limit --offset]`
- `guild credentials policy list <credential-id> | create <credential-id> [--decision ALLOW|DENY --operations --workspaces --agents --resources <json>] | update <policy-id> | delete <policy-id>`
- `guild trigger list | get | create [--type webhook|time|api --agent --workspace --input] | update | activate | deactivate | sessions <trigger-id>`
- `guild session list | get | events | tasks | create | send | interrupt`
- `guild workspace list | get | agent | member | context ...`; `guild agent list | get | versions | capabilities ...`
- `guild api <method> <path>`: arbitrary authenticated request (could serve as a separately verified CLI route for reads).
The CLI has a policy mutation surface; whether it is permitted for this account, and what `--agents` expects (installed vs definition ID), is **unverified**. The public HTTP API has no inspected policy-mutation endpoint; ScopeWatch does not call one.
