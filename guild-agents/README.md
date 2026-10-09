# Guild agents created for the ScopeWatch live run (2026-10-09)

Source of the three private Guild agents owned by `nihal.nihalani`, created via `guild agent init/save --publish`
and installed into workspace `nihal.nihalani~home`. Guild hosts each agent's own git repo; this directory is the
reviewed source copy.

| Agent | Source | Installed-agent ID (workspace) | Agent definition ID |
|---|---|---|---|
| `scopewatch-ticketassist` (target workload) | `workload/agent.ts` | `01a1210c-5dfb-22ef-0000-88e0654f107d` | `01a12107-ab30-726e-0000-5ace89c9c392` |
| `scopewatch-releasereview` (control workload) | `workload/agent.ts` | `01a1210c-6714-22ef-0000-617323e29640` | `01a1210a-2dd0-726e-0000-10450a33e44a` |
| `scopewatch-investigator` (hosted investigator) | `investigator/agent.ts` | `01a1210c-f26f-22ef-0000-78cf81a12f0d` | `01a1210b-6a7a-726e-0000-bd76c4178394` |

Observed natively: installed-agent IDs differ from agent definition IDs (the design kept them distinct until proven).
Which one the credential-policy `agents` selector expects is still unverified.

The workloads are deterministic coded agents (no LLM): they read only `nihalnihalani/scopewatch-fixtures` issues named
in the launch text, via `github_issues_get`. Fixture markers are never in launch text; ScopeWatch inspects tool results.
The investigator's tools are limited to `github_repos_get_content` and `github_issues_create`; repository scope is
enforced by prompt and the GitHub App installation, not by a native policy (residual risk).
