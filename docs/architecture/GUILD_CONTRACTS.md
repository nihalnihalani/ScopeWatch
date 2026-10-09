# ScopeWatch Guild contracts and architecture gates

> **Current execution policy:** [Start now or anytime, with no build cutoff](../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Research verification: 9 October 2026. This is documentation research, not a Guild account test. No credential was created, session launched, policy changed, or runtime configured. New captures are in `.firecrawl/architecture-guild/`; `sources-manifest.json` records capture provenance, hashes, URLs and cache metadata. The authoritative machine-readable API was retrieved through Firecrawl from `https://api.guild.ai/v1/openapi.yaml` and preserved without Markdown damage as `public-openapi.yaml`.

**The monitored-permission loop is documented; automated policy mutation through an account/trigger API key is not.** Make the core native enforcement step a reviewed Guild policy UI action. The documented CLI create command is another candidate after its installed version/authentication are tested. A ScopeWatch approval button prepares a precise review and records native application and verification; it must not claim to call an undocumented policy endpoint.

## 1. Corrections the architecture must preserve

1. A trigger key's association with one trigger does not make it an investigator-only credential. Its detailed security contract permits reads/writes to any session in the workspace, and launch accepts an override selecting another installed agent. [API triggers](https://docs.guild.ai/platform/api-triggers#security-and-scope).
2. Account-key and trigger-key launch payloads/routes differ. Account keys start `chat` sessions with `initial_prompt`; the trigger route uses `api_trigger` plus `agent_input`, returning a session whose type is `api`. [Account session start](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace), [trigger launch](https://docs.guild.ai/platform/api-triggers#trigger-a-session).
3. The public API specification contains credential-association and dedicated-key mint routes, but **no credential-policy mutation route**. `integrations:write` does not establish policy-edit authority. [Public OpenAPI](https://api.guild.ai/v1/openapi.yaml), [scope model](https://docs.guild.ai/api-reference/introduction#scopes).
4. New credentials initially allow unmatched calls. Adding scoped rules hides the initial allow-all row and exposes its fallback in a footnote; it does not remove that grant. A matching DENY still wins. [Credential policies](https://docs.guild.ai/platform/credential-policies#default-posture).
5. Events persist at turn completion. There is no documented zero-lag durable security feed or atomic “last event” watermark. [Events contract](https://docs.guild.ai/api-reference/sessions/fetch-session-events).
6. Native approval records are permission decisions, not returned tickets, successful reads, or records leaked. `task_id` supports attribution through the task graph; it does not guarantee an event-to-tool-outcome join. [Event schema](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [task schema](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks).
7. Workloads sharing a service do not necessarily use the same credential. Resolution priority, grants, acting-user requirements and workspace settings must be inspected, then corroborated with native `credentials_id`. [Credentials](https://docs.guild.ai/platform/credentials#how-guild-chooses-a-credential).

## 2. Documented / account-unverified / application-designed matrix

| Concern | Documented contract | Account-unverified gate | ScopeWatch design |
|---|---|---|---|
| Launch | Two distinct key flows, detailed below | Key access, selected installed agent, actual response/session/task/version projections | Server-side allowlisted launcher and immutable launch registry |
| API authority | Account scopes cover an account; trigger session access covers its workspace | Restricted-workspace visibility and actual response permissions | Separate launcher, collector and operator authority; no secrets in browser/model inputs |
| Evidence | Native security decision, operation, task/credential fields; optional context | Actual security rows, populated selected credential, clock, decision-event cardinality | Preserve raw rows; count unique selected ALLOW IDs; explicit incomplete evidence |
| Pagination | Events newest first by default; exclusive `from_id`; tasks offset pagination | Accepted `sort_by=id`, page stability, late appearance/update behavior | Exhaust completed snapshots; advance only after successful traversal; reconcile |
| Actor | Native task IDs/parents/version; task-agent projections; installed-agent resource | Whether the event points to a tool or agent task; actual policy selector identity | Corroborated graph traversal plus launch registry; reject ambiguity |
| Policy dimensions | Operations/resources/agents/workspaces; DENY precedence | Exact selector IDs, repository/method extraction, combined matching and effect | Frozen reviewed candidate and fresh target/control verification |
| Policy mutation | UI configuration and CLI create example | Actual edit/delete controls, installed CLI command/auth, receipt/population | Manual native application is core; REST automation remains blocked |
| Credential binding | Grants/dedicated/member/workspace/account resolution | Same resolved credential on both workloads; required credential mode | Single intended shared credential, record associations and modes |
| Results | Optional tool HTTP/byte fields; size-dependent response projection | Exact event/tool relation and inspectable expected control result | Keep outcomes separate; never infer success from ALLOW or task DONE |
| Administration | Organization-admin audit UI and filtered CSV export | Policy-specific action name, target/ID/scope fields in this account | Supplemental sanitized receipt; application record is explicitly app-produced |

Sources: [API triggers](https://docs.guild.ai/platform/api-triggers), [API introduction](https://docs.guild.ai/api-reference/introduction), [events](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [tasks](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks), [policies](https://docs.guild.ai/platform/credential-policies), [credentials](https://docs.guild.ai/platform/credentials), [audit logs](https://docs.guild.ai/insights/audit-logs).

## 3. Launch and authentication contracts

### Trigger key path

- UI navigation: workspace → **Run / Triggers** → **Add Trigger** → **API**, select the agent, copy the combined `id:secret` once. Trigger-key management is explicitly UI-only; do not create a supposed public key-management endpoint.
- Use HTTP Basic authentication against `https://api.guild.ai`; the documented public host rejects browser session cookies and task tokens.
- Route: `POST /v1/workspaces/{owner_name}/{workspace_name}/sessions`.
- Payload: `session_type: "api_trigger"`, text-capable `agent_input`; optional `agent_id` can select another installed workspace agent using `owner~agent-name` or UUID. Do not forward a caller-supplied override without server validation.
- Response: documented `201`, `session_type: "api"`. Preserve the returned session/workspace/root-task IDs and projections actually present.
- Follow-up: `POST /v1/sessions/{session_id}/events`; trigger-key messages become `trigger_message`, support text rather than image/file attachments, and the key can operate on other sessions in the same workspace.
- Trigger runs have no human acting identity (`acting_user_id` is `None`). The UI avatar of the trigger creator is presentation, not proof the run acts as that human. [API triggers](https://docs.guild.ai/platform/api-triggers).

### Account API key path

Account keys are created at account **Access & setup > API keys** or with the documented `guild api-key create`. HTTP Basic is supported; the API introduction also documents Bearer authentication carrying the entire `id:secret` string. Keys with no scopes authenticate but cannot access resources. The scope list is `agents`, `sessions`, `workspaces`, `skills`, `integrations`, and `tool_call`; write implies read within a group. These are account scopes, not arbitrary per-case privileges. [Account API keys](https://docs.guild.ai/platform/api-keys), [API authentication/scopes](https://docs.guild.ai/api-reference/introduction#authentication).

| Operation | Exact account-key route | Endpoint-specific scope |
|---|---|---|
| Start conversation | `POST /v1/workspaces/{workspace_id_or_name}/sessions` with required `session_type: "chat"`, `agent_id`, `initial_prompt` | `sessions:write`, on a workspace owned by key's account |
| Get session | `GET /v1/sessions/{session_id}` | `workspaces:read` |
| Get durable events | `GET /v1/sessions/{session_id}/events` | `workspaces:read` **and** `agents:read` |
| Get tasks | `GET /v1/sessions/{session_id}/tasks` | `workspaces:read` **and** `agents:read` |
| List installed agents | `GET /v1/workspaces/{workspace_id_or_name}/workspace_agents` | `workspaces:read` **and** `agents:read` |
| Identify caller | `GET /v1/me` | Valid key; no extra scope |

The generic scope table mentions session reads, but the individual endpoint descriptions provide the concrete additional requirements. Follow those descriptions. Missing `agents:read` currently produces a documented `500` for agent-session events/tasks; a successful authentication check is insufficient. Account keys may create only `chat`, not `api_trigger`, `time`, `webhook`, or `agent_test`. Account-key follow-ups require `sessions:write` and are permitted only in chat sessions that **the same key initiated**; another key's chat, a person's chat, or a trigger session returns `404`. The author is the key itself, and a follow-up `agent_id` override is ignored. This differs from the trigger key's workspace-wide session access. [Session start](https://docs.guild.ai/api-reference/workspaces/start-a-session-in-a-workspace), [events](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [tasks](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks), [installed agents](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-installed-agents), [follow-up contract](https://docs.guild.ai/api-reference/sessions/post-a-follow-up-event-to-a-session), [caller identity](https://docs.guild.ai/api-reference/accounts/identify-the-calling-key).

A workspace with `should_restrict_members` is invisible to every account key regardless of scopes and yields `404`. Treat a denied/hidden read as an access problem, not a non-existent or empty evidence source. Use the actual returned workspace UUID for the account-key route so owner/name routing is not guessed from the trigger route. [Get workspace](https://docs.guild.ai/api-reference/workspaces/get-a-workspace).

Recommended core: pick one verified launch path; keep its secret in the backend. A separate account collector key needs the demonstrated read scopes and an accessible workspace. Trigger keys can also read their workspace, but they carry broader session-write authority, so using one as a collector is a deliberate authority tradeoff, not read-only isolation. Neither key becomes policy admin by adding `integrations:write`.

## 4. Native security evidence and complete collection

`EventSecurity` describes `id`, `created_at`, `updated_at`, `decision` (`ALLOW`, `DENY`, `ERROR`), `operation`, `reason_code`, `task_id`, nullable `acting_user_id`, `capability`, `credentials_id`, and `details`. Reason codes include `ACCESS_ALLOWED`, `POLICY_DENIED`, `CREDENTIAL_UNAVAILABLE`, `PRIVILEGE_ESCALATION_DENIED`, and `PLATFORM_ACCESS_DENIED`. Its schema lists properties without a required-field guarantee; several related-object projections are unconstrained `{}`. Inspect actual responses before making any required analytics field a native promise. [Security event schema](https://docs.guild.ai/api-reference/sessions/fetch-session-events).

The credential field is **`credentials_id`**, plural. There is no documented mandatory top-level agent ID, repository, URL, recipient, object count, downstream completion timestamp, or tool-call ID on a security event. A resource selector in policy does not prove that resource is exported into security evidence. Missing selected credential/operation/actor/clock means unresolved coverage. Never fill the gap from an agent-provided label or an assumed connected credential.

The core counter is **distinct native ALLOW security-event IDs for the selected operation, credential and verified workload within a declared interval**. It does not count successful tickets or unique objects. New-ID retries consume another observed approval unit; replaying an existing event ID does not. DENY/ERROR remain separate. Neither event cardinality per tool invocation nor complete coverage of every possible external action was tested; calibrate the selected integration/call during preflight. [Event decision definitions](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [egress mediation](https://docs.guild.ai/platform/security-architecture#policy-enforcement-at-egress).

Collection contract:

| Item | Documented | Required application behavior |
|---|---|---|
| Defaults | Events `-id`, newest first, default `20`, maximum `1000` | A first-page result is only a page, never full history |
| Cursor | `from_id` is exclusive `id > from_id`; UUIDv7 IDs are time ordered | Keep IDs opaque; do not decode them as service-execution timestamps |
| Ordering input | `sort_by` is a string; `id` acceptance is not enumerated in the schema | Test ascending traversal; otherwise page a completed finite snapshot |
| Pagination | `offset`, `limit`, `pagination.has_more` and `total_count` | Exhaust every page; retain failures/page boundaries/filter state |
| Persistence | Durable events appear when a turn completes | Short turns, await completion, then collect; measure observed delay |
| Tasks | Offset pagination, default `20`, maximum `1000`; trigger guide says oldest first | Exhaust tasks separately; event coverage does not imply graph coverage |

Sources: [events endpoint](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [trigger event/task guide](https://docs.guild.ai/platform/api-triggers#fetch-session-events), [task endpoint](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks).

**Proposed algorithm, not a Guild guarantee:** establish a finite completed-turn/session snapshot, collect all pages with consistent filters, retain raw IDs/content and authenticated graph evidence, deduplicate, then commit the cursor only after successful traversal. If `sort_by=id` works, advancing from the last item must still follow every page within that cursor range before committing. Never advance immediately to the newest ID from a truncated newest-first page. Re-fetch completed snapshots to reconcile late arrival/updates; the docs do not promise an atomic snapshot token or bounded late-arrival lag. Conflicting re-deliveries become integrity exceptions, not an arbitrary latest-row actor assignment.

Use native record `created_at` as the explicitly labeled event-record clock after validating it; keep collector observation time separately. The canonical application window is **(T − 600 seconds, T]**, truncated at the manifest's effective start: exclude the lower boundary and include the upper boundary. Preserve native precision and include the full equal-timestamp group before evaluating its count. Evaluate historical anchors as well as the current window so delayed durable events can establish an earlier crossing; a current zero does not erase that historical breach. This application-designed contract is defined in [ARCHITECTURE.md](ARCHITECTURE.md#7-current-and-historical-window-evaluation). A completed root task, a socket connection, or a fast SQL query is not proof of zero native persistence delay. Empty in-progress polls and failed pages produce “evidence incomplete,” not a compliant zero.

## 5. Actor linkage and optional outcomes

`TaskAgent` exposes task/session/parent IDs and nullable `version_id`; `agent` and `version` are unstructured projections in this task schema. `TaskTool` provides task/session/parent IDs, `tool_call_id`, `tool_name`, status, and nullable HTTP status/request bytes/response bytes. `response_data` is a full JSON response only when the response was projected because of size; it is not an always-present receipt. [Task schema](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks).

The installed-agent resource has a top-level **workspace-agent installation ID**, plus nested `agent`, `agent_version`, `version_id`, and `workspace_id`. Credential associations target that installation; account-wide availability may have no association row. These identifiers are different entities. The policy page uses `<agent-id>` but does not formally establish that the workspace-agent install ID and agent definition ID are interchangeable. Resolve the actual policy subject in the UI/CLI test and record both IDs; do not blindly copy the install response's top-level ID into `--agents`. [Installed-agent schema](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-installed-agents), [policy selectors](https://docs.guild.ai/platform/credential-policies#scoping-rules-to-agents-and-workspaces), [public API](https://api.guild.ai/v1/openapi.yaml).

Attribution design: security `task_id` → authenticated matching task → parent traversal to the relevant agent task → corroborated agent/version and controller launch → installed subject/policy selector. Missing nodes, cycles, conflicting session identity, multiple plausible actors, or changed versions invalidate definitive grouping. Avoid sub-agents in the core; parent/caller credential inheritance complicates the meaning of the responsible subject.

Attribution is separate from tool-result correlation. When a security event points to a parent agent task containing multiple tool descendants, joining all descendants creates false outcomes. Time/name/sequence proximity is insufficient to establish exact native call identity. Keep unmatched outcomes separate. `DONE`, ALLOW, HTTP 2xx and an inspected expected ticket are different facts; response bytes are not document counts or exfiltration. The fresh control success should inspect actual expected fixture content, even if optional outcome enrichment is cut.

## 6. Credential setup and policy enforcement

Credential selection is documented as grants (including caller-chain grants for sub-agents), dedicated agent credential, acting member credential, workspace credential, then account credential; multiple account credentials use the oldest. Multiple simultaneously usable grants fail rather than choosing. Workspace isolation can exclude account defaults. [Credential resolution](https://docs.guild.ai/platform/credentials#how-guild-chooses-a-credential).

`required_credentials_mode` is present in workspace and installed-agent schemas: `SHARED` requires organization-side credentials; `MEMBER` requires the acting member's credentials; an unset agent value inherits the workspace setting. This is a **preflight risk**, not proof of a mode enabled here. Trigger sessions lack a human acting identity, so a member-only grant/mode must not be assumed compatible. Prefer a verified organization/workspace/shared grant appropriate to the chosen launch path. Record each workload's resolved native credential ID rather than inferring it from configuration. [Installed-agent mode](https://docs.guild.ai/api-reference/workspaces/list-a-workspaces-installed-agents), [workspace schema](https://docs.guild.ai/api-reference/workspaces/get-a-workspace), [trigger identity](https://docs.guild.ai/platform/api-triggers#security-and-scope).

GitHub is `@guildai-services/guildai~github`, authenticated through an installed GitHub App with tokens minted/refreshed on demand. App repository scope is an independent ceiling. Tools carry `github_`; policy operation names do not. Core operations are `issues_get` (GET ticket), `repos_get_content` (GET manifest), and `issues_create` (POST incident). Verify installed integration versions and actual tool manifests; examples do not pin the current account version. [GitHub integration](https://docs.guild.ai/integrations/github).

Policy dimensions:

| Field | Documented selection | Core choice |
|---|---|---|
| `operations` | Exact names or case-sensitive `fnmatch` patterns; null operation matches no pattern | Exact `issues_get` |
| `resources.repos` | GitHub `owner/repo` patterns extracted from outbound API path | One owned synthetic repository |
| `resources.methods` | HTTP verbs | `GET` |
| `agents` | Selected agents; omission unrestricted | One verified target subject |
| `workspaces` | Selected workspaces; omission unrestricted | One verified workspace |
| `decision` | Matching DENY overrides ALLOW | `DENY` after reviewed scope |

Omitted dimensions are unrestricted. A new credential has an auto-created allow-all rule; scoped additions retain that fallback until it is deliberately removed. Inspect the policy table's fallback footnote, including the hidden default, before claiming a restricted baseline. Exact resource matching, combined selector behavior and selector identity still need native positive/negative controls. [Policy rules, resources and defaults](https://docs.guild.ai/platform/credential-policies).

### Concrete application route

**UI core:** select the account → **Access & setup > Credentials**, or use the workspace's **Credentials** page for the relevant scope. Locate the verified credential and its native policy table/editor. The policy documentation explicitly supports creating/editing scopes in this UI and displays operation/access/workspace/agent/resource columns. Exact add/edit/delete button labels and receipt fields were not demonstrated; do not invent them. Preserve the applied native rule/ID when available, actor/time and fallback, then run both witnesses. [Credential navigation](https://docs.guild.ai/platform/credentials), [policy UI](https://docs.guild.ai/platform/credential-policies#viewing-policies-in-the-ui).

**Documented CLI candidate, not executed:**

```bash
guild credentials policy create <verified-credential-id> \
  --decision DENY \
  --operations "issues_get" \
  --resources '{"repos": ["<owner>/<fixture-repo>"], "methods": ["GET"]}' \
  --agents <verified-policy-agent-id> \
  --workspaces <verified-workspace-id>
```

The official page supplies this create-command form. Installed CLI support, its authentication authority, return payload, update/delete commands and idempotency were not tested. The captured public OpenAPI exposes credential association GET/POST/DELETE and dedicated API-key mint POST, but no policy CRUD or audit-export endpoint. Do not equate disconnecting an association, minting a key or `integrations:write` with policy mutation. [Policy CLI example](https://docs.guild.ai/platform/credential-policies#scoping-rules-to-agents-and-workspaces), [public API specification](https://api.guild.ai/v1/openapi.yaml), [account-key limits](https://docs.guild.ai/platform/api-keys#create-a-key).

**Effect criterion:** after observed native application, start a fresh matching target request and a fresh approved-work request through the same verified credential. Require native target `DENY`/`POLICY_DENIED`, plus the control's inspected expected result. Record the native IDs and actual request/application observations. This proves subsequent matching scope; it does not retract prior disclosures, stop all capabilities, cancel a request already past the gate, or establish a synchronous budget limiter. Policy-application acknowledgement with unknown outcome must remain “application unknown” until reconciled.

## 7. Receipts, blockers and fallback claims

An organization admin can open **Access & setup > Audit log**, filter the user-action/security streams and **Export** the current filtered CSV. The docs establish timestamp/actor/action/target/workspace columns and read-only records, but not a policy-specific action name, exported selector payload or public audit API. Use this as supplemental native evidence only when the actual entry exists. Preserve the app's approved-scope digest and case linkage as **ScopeWatch records**, not Guild-native fields. [Audit logs](https://docs.guild.ai/insights/audit-logs).

| Blocking condition | Honest next step / fallback | Claim that remains unavailable |
|---|---|---|
| Key cannot access workspace/session | Inspect restricted membership/scopes; verify the selected trigger path or use actual native UI evidence | Complete API collection |
| Credential ID or actor mapping missing | Retain raw unresolved rows; request sponsor help once; show incomplete evidence | Authenticated shared-credential actor breach |
| Pagination fails or persistence incomplete | Retry/reconcile finite completed snapshots; retain page failure | Exact complete count or compliant zero |
| Public policy endpoint absent | Native UI core; CLI only after verified command/auth test | Automatic controller policy mutation |
| Actual scoped DENY does not isolate | Correct matching scope and repeat both results; retain monitoring/incident only if it remains useful | Selective containment |
| Fresh control also fails | Inspect default/grant/mode/operation scope; trial is failed | Continuity of approved work |
| Native target reason is credential/platform error | Diagnose actual reason; preserve separate counters | Policy-denial proof |
| Optional outcome join/result absent | Cut enrichment and retain approval unit | Returned-object counts or data theft |
| Native incident write fails | Preserve actual investigation output as an incomplete action | Created hosted incident |

Broader controls are separately named: session stop interrupts that session; trigger deactivation stops its scheduled/event automation routes; agent archive disables the agent across workspaces; credential disconnect blocks subsequent credential use and may disrupt approved work. The security architecture advertises UI/API stop, but the retrieved public OpenAPI contains no public stop-session mutation route; use the documented UI rather than inventing one. These controls do not replace operation-specific containment without changing the claim. [Stop controls](https://docs.guild.ai/platform/security-architecture#stop-controls).

First native proof must establish the installed/version identity, one selected operation, its native approval unit and credential/task mapping, complete event/task pages, then actual targeted policy application and both fresh outcomes. Restore the allowed baseline after any trial before the main scenario; keep trial/main manifest boundaries explicit. No account proof was produced during this research.

## 8. Research trail

The Firecrawl developer index was queried first for API-contract and policy-mutation questions. It returned adjacent/marketing references rather than the exact detailed Guild contracts; those results were not promoted into endpoint evidence. Targeted official-domain web discovery followed, then selective extraction of canonical docs and `.md` schema pages. One event/task search returned no results. Existing repository captures were used to locate the right pages, while new request outputs were saved in the owned source directory. Selected exact contracts were fetched with `--max-age 0`; ordinary initial rendered captures retain their actual cache metadata.

The full public OpenAPI was fetched through Firecrawl's `rawHtml` format because Markdown extraction damages YAML indentation. The preserved YAML parsed successfully; `public-endpoints.json` derives only its path/method index and confirms no policy-named path. This is evidence about the published public surface, not proof that a private internal API does not exist. Public API/doc versions are not installed SDK/platform/integration versions or account availability guarantees.

Primary capture inventory and hashes: `.firecrawl/architecture-guild/sources-manifest.json`. Exact schema captures: `session-events-schema.md`, `session-tasks-schema.md`, `installed-agents-schema.md`, `start-session-account-schema.md`, `get-workspace-schema.md`, and `public-openapi.yaml`. Contract pages: `api-triggers-fresh.md`, `api-introduction-fresh.md`, `credentials-fresh.md`, `credential-policies-fresh.md`, `github-fresh.md`, `security-architecture-fresh.md`, `audit-logs-fresh.md` and `account-api-keys.md`.
