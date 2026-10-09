claude-sonnet-5-5

# Native Guild integration report

## Files
- src/integrations/guild/: util.ts, http.ts, collector.ts, binding.ts, launcher.ts, investigator.ts, verifier.ts, context.ts, index.ts (`createGuildPort`, `GuildAdapter`, `missingSettings`)
- tests/support/mock-guild/: server.ts (`startMockGuild`), run.ts (CLI, port arg), testkit.ts
- tests/unit/guild/: util, normalize, binding, probe tests; tests/integration/guild/adapter.test.ts
- docs/native/NATIVE_PROOF_LEDGER.md

## Commands
- `npx tsc -p tsconfig.json --noEmit`: exit 0, no errors anywhere (including others' paths at run time).
- `npx vitest run tests/unit/guild tests/integration/guild`: 5 files, 54 tests passed (30 unit, 24 integration).
- `npx eslint` over my paths: no output (clean).
- `npx tsx tests/support/mock-guild/run.ts 4777` + `curl /__mock/state`: 200, mock label present.
- `guild --help` and subcommand `--help` only (CLI surface; see ledger).

## Behavior summary
- Launch: POST /v1/workspaces/{owner}/{name}/sessions, trigger key only, agent_id only from config allowlist, no POST retry; timeout/5xx/network -> outcome `unknown`. Reconcile uses documented GET workspace sessions list + events?types=trigger_message and an embedded `scopewatch-ref:` line; returns null (stays unknown, no blind retry) if absence cannot be proven.
- Collection: events (sort_by=id) and tasks exhausted via offset/limit/has_more/total_count; page failure -> incomplete/failed; non-terminal root -> open; 404 = access problem. Identity key `[workspaceId,eventId]` (or session-scoped via option).
- Binding: task graph only; nested B resolves to B only if the chain reaches a root mapping to the registered subject; root/registered subject is never a fallback; version IDs need explicit `version:<id>` map keys.
- Probes: fresh session after notBefore, fixed instruction, decision+reason from bound native events, control content from tool task response_data vs server-held marker (never sent to agent).
- Investigator: compact facts only; created only with exactly one completed issues_create task having html_url; else create_unknown/failed.

## Documented vs observed
| Field/behavior | Documented source | Observed on account |
|---|---|---|
| security event: decision, operation, reason_code, task_id, credentials_id, created_at | session-events-schema.md | NOT OBSERVED |
| event `type` == "security" | schema leaves `type` untyped | NOT OBSERVED |
| events/tasks pagination, sort_by | schema (default -id) | NOT OBSERVED |
| tool task response_data only when projected by size | session-tasks-schema.md | NOT OBSERVED (risk for control inspection) |
| task `agent` expansion shape | `agent: {}` | NOT OBSERVED (adapter reads agent.id / agent_id) |
| trigger launch response (id, root_task, workspace, trigger) | api-triggers-fresh.md | NOT OBSERVED |
| policy subject ID domain vs installed/definition IDs | unknown | NOT OBSERVED |

## NATIVE gate statuses
G1: pending. G1b: pending. G2: pending. No native response was observed, fabricated or claimed. All adapter tests are contract_test provenance against the loopback mock.

## Human inputs needed
See docs/native/NATIVE_PROOF_LEDGER.md steps 1-9: `guild auth login`; trigger key (UI); collector account key with workspaces:read + agents:read; workspace owner/name/id; three installed agent IDs (corrected by native observation 2026-10-09: launches need the three agent DEFINITION ids or owner~name as `GUILD_*_AGENT_ID`; installed ids are rejected and are informational only); verified policy-subject IDs, credential ID, operation; owned repo; control marker; human-applied trial DENY.

## Requested shared-contract changes (lead)
1. config: optional `GUILD_IDENTITY_DOMAIN` (workspace|session) and an agent-ref -> policy-subject map (`subjectDomainMap` source for production binding); currently the backend must supply it to `bindEvents`, and probes derive it from the launched root agent ref.
2. ProbeOutcome has no value for "target call ALLOWED"; adapter returns `succeeded_expected` for that, verifier should treat target `succeeded_expected` as restriction failed.
3. Optional: `RegisteredSession.expectedPolicySubjectId` for the investigator is passed as '' internally (collection only, no binding).
4. Optional config for probe ticket number (adapter option `probeTicketNumber`, default 1) and request/completion timeouts (adapter options).

## Notes
- Mock never imported from src/**. No secrets printed or written; redaction covers key, secret, base64 and Basic headers.

## Update after lead's shared-contract changes
- Target ALLOWED now returns outcome `allowed` (was succeeded_expected). Control success still `succeeded_expected`.
- Adapter consumes config.guild.agentSubjectMap (merged under any map passed to bindEvents; empty map leaves refs unresolved), identityDomain (`unverified` keeps the workspace-shaped key but labels observations `unverified`), probeTicketNumber (default 1).
- testkit.ts updated for the new GuildConfig fields.
- Re-run: tsc exit 0 (no errors); vitest tests/unit/guild + tests/integration/guild: 5 files, 55 tests passed; eslint clean. Gates G1/G1b/G2 remain pending.
