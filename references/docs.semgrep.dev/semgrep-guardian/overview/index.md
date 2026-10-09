---
source_url: "https://docs.semgrep.dev/semgrep-guardian/overview"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T19:25:36.675599+00:00"
normalized_at: "2026-10-09T07:47:21.932048+00:00"
reuse_of: ".firecrawl/semgrep-pi-guardian-overview.md"
source_kind: "current documentation"
published_date: null
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "36c039c8672d113061164fcefb8e32ad4eb2803a3cc1877cf5d9011f0ca47123"
body_sha256: "0f08eabf3affa43e02fa9c2f63ab0ecc4da58dd3340ceeab07641d1e7fb2a1f2"
---

# Semgrep Guardian

Copy pageCopy page

Semgrep Guardian integrates with AI coding agents to catch security issues in generated code before it ships.

Copy pageCopy page

Semgrep Guardian integrates natively with AI coding agents to catch security issues before they ship. It bundles the Semgrep MCP server, Hooks, and Skills into a single install, and scans every file an agent generates using Semgrep Code, Supply Chain, and Secrets.When findings are detected, Guardian returns them to the agent, which decides whether to regenerate the code.

## [​](https://docs.semgrep.dev/semgrep-guardian/overview\#how-guardian-works)  How Guardian works

Guardian runs at authoring time, on the developer’s machine, rather than in CI:

1. Your coding agent writes or edits a file.
2. A hook (or an MCP tool call, depending on the integration) triggers a Semgrep scan of what the agent just generated.
3. If Semgrep returns findings, the agent receives them and is prompted to regenerate the code.
4. The agent decides whether to regenerate. If it does, the new code is scanned again.

Because the scan happens before the code is committed, Guardian complements rather than replaces your CI and platform scans. For scanning repositories in CI, see [Set up and deploy scans](https://docs.semgrep.dev/deployment/checklist).

## [​](https://docs.semgrep.dev/semgrep-guardian/overview\#two-setup-paths)  Two setup paths

Guardian has two materially different integration paths. Which one you use changes how you authenticate, whether you need a local Semgrep CLI, and which rules Guardian scans with:

- **Claude Code or Codex with the Guardian plugin (recommended).** Uses Semgrep’s hosted remote server and authenticates through OAuth. No local Semgrep CLI required.
- **All other agents, and the local Claude Code plugin.** Runs Semgrep through a locally installed CLI.

See [Choose your setup](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup) for a full comparison, or go straight to the [Quickstart](https://docs.semgrep.dev/semgrep-guardian/quickstart) if you use Claude Code or Codex.These paths don’t scan with the same rules. The recommended Claude Code and Codex plugins run a fixed ruleset and don’t apply your organization’s Policies. The local CLI integrations do. See [Rules and configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration).

## [​](https://docs.semgrep.dev/semgrep-guardian/overview\#next-steps)  Next steps

[**Quickstart** \\
\\
Set up Guardian with Claude Code or Codex in a few minutes.](https://docs.semgrep.dev/semgrep-guardian/quickstart)

[**Choose your setup** \\
\\
Compare the remote and local CLI paths before you install.](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup)

[**Rules and configuration** \\
\\
Which rules Guardian scans with, and when that differs.](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration)

[**Deploy across your organization** \\
\\
Roll Guardian out to a fleet with marketplace controls or MDM.](https://docs.semgrep.dev/semgrep-guardian/enterprise-deployment)

## [​](https://docs.semgrep.dev/semgrep-guardian/overview\#additional-resources)  Additional resources

- Semgrep’s `#mcp` [Slack community](https://go.semgrep.dev/slack)
- The [Semgrep MCP server repo on GitHub](https://github.com/semgrep/semgrep/tree/develop/cli/src/semgrep/mcp)

Was this page helpful?

YesNo

[Suggest edits](https://github.com/semgrep/semgrep-docs/edit/main/docs/semgrep-guardian/overview.mdx)

[Quickstart](https://docs.semgrep.dev/semgrep-guardian/quickstart)

[x](https://x.com/semgrep) [github](https://github.com/semgrep/semgrep) [linkedin](https://www.linkedin.com/company/semgrep)

Assistant

Responses are generated using AI and may contain mistakes.