# Guild agents created for the ScopeWatch live run (2026-10-09)

Source of the private Guild agents used for native calibration, created via `guild agent init/save --publish`.
Guild hosts each agent's own git repo; this directory is the reviewed source copy.

## Current calibration set: `charliegillet~scopewatch`

Owned by `charliegillet`, installed with auto-update disabled into workspace `charliegillet~scopewatch`
(`01a1226d-8f2d-3bb9-0000-8cd6bac376ac`). Fixture repo: private `charliegillet/scopewatch-fixtures`, probe ticket #1.
API trigger `scopewatch-api` (`01a12273-707e-3d51-0000-bf5f28c1c0ab`, default agent TicketAssist; launches select the
agent per request by its agent DEFINITION id or `owner~name`). The trigger key exists only in the Guild web UI.

Observed 2026-10-09: sending an installed-agent id as the launch `agent_id` returns 400 `InvalidInputError`
"Agent '<id>' not found", so the launch refs are the definition ids below (`GUILD_TARGET_AGENT_ID`,
`GUILD_CONTROL_AGENT_ID`, `GUILD_INVESTIGATOR_AGENT_ID`); the `GUILD_*_INSTALLED_AGENT_ID` settings are informational
only. A session's `trigger.agent` / `trigger.workspace_agent` is the trigger's default agent (TicketAssist), not the
agent that ran; identity comes from the root agent task and `security_event.details.agent_id`.

| Agent | Source | Installed-agent ID (workspace) | Agent definition ID | Published version ID |
|---|---|---|---|---|
| `scopewatch-ticketassist` (target workload) | `workload/agent.ts` | `01a12273-2db0-22ef-0000-45bb36e41906` | `01a1226d-b40c-726e-0000-c52bb1bbe8a7` | `01a1226d-dcfe-cf83-0000-9697f0e273a3` |
| `scopewatch-releasereview` (control workload) | `workload/agent.ts` | `01a12273-3070-22ef-0000-410a1ac55656` | `01a1226f-93bc-726e-0000-647311bcfc16` | `01a1226f-a529-cf83-0000-55b870ae6b0f` |
| `scopewatch-investigator` (hosted investigator) | `investigator/agent.ts` | `01a12273-330a-22ef-0000-7b2df1eaf0ae` | `01a12271-9df0-726e-0000-2464aea8ebc4` | `01a12271-acf5-cf83-0000-3b7d6bb9c21f` |

Each Guild agent package adds `@guildai-services/guildai~github` to the scaffolded `package.json` dependencies.

## Earlier set: `nihal.nihalani~home` (historical)

Owned by `nihal.nihalani`; first calibration session observed here. Not used by the current configuration.

| Agent | Installed-agent ID (workspace) | Agent definition ID |
|---|---|---|
| `scopewatch-ticketassist` | `01a1210c-5dfb-22ef-0000-88e0654f107d` | `01a12107-ab30-726e-0000-5ace89c9c392` |
| `scopewatch-releasereview` | `01a1210c-6714-22ef-0000-617323e29640` | `01a1210a-2dd0-726e-0000-10450a33e44a` |
| `scopewatch-investigator` | `01a1210c-f26f-22ef-0000-78cf81a12f0d` | `01a1210b-6a7a-726e-0000-bd76c4178394` |

## Notes

Observed natively in both accounts: installed-agent IDs differ from agent definition IDs (the design kept them
distinct until proven). Which one the credential-policy `agents` selector expects is still unverified.

The workloads are deterministic coded agents (no LLM): they read only `charliegillet/scopewatch-fixtures` issues named
in the launch text, via `github_issues_get`. Fixture markers are never in launch text; ScopeWatch inspects tool results.
The investigator's tools are limited to `github_repos_get_content` and `github_issues_create`; repository scope is
enforced by prompt and the GitHub App installation, not by a native policy (residual risk).
