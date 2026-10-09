---
source_url: "https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T19:25:44.055561+00:00"
normalized_at: "2026-10-09T07:47:21.933286+00:00"
reuse_of: ".firecrawl/semgrep-pi-guardian-rules.md"
source_kind: "current documentation"
published_date: null
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "6b25e1f49f3cae14f9457c244d990272c21b5550bf6b7a9d16df4efb24d65a68"
body_sha256: "d86740fa3bd3e13adf42982d446c94f65d92cdc4747d6854b84dd91aca7e645b"
---

# Semgrep Guardian rules and configuration

Copy pageCopy page

Which rules Semgrep Guardian scans with, and why this differs between the Claude Code and Codex plugins and other integrations.

Copy pageCopy page

Which rules Guardian scans with depends on how it runs scans, and this differs by integration. Check which row applies to you before assuming your Policies are in effect.

| Setup | Scans run by | Rules used |
| --- | --- | --- |
| **Claude Code remote plugin or Codex plugin** (default, recommended) | Guardian hooks | Fixed [`guardian-default`](https://semgrep.dev/p/guardian-default) ruleset |
| **Claude Code, local plugin** | Guardian hooks, local CLI | Rules enabled in your organization’s Policies |
| **All other coding agents** (Cursor, GitHub Copilot, VS Code, Devin, Kiro, other MCP clients) | `semgrep_scan` through the Semgrep MCP server | Rules enabled in your organization’s Policies |

**If you use the recommended Claude Code or Codex plugin, your Policies don’t apply.**Guardian’s hooks run a fixed ruleset rather than reading your Policies configuration. If you’ve tuned your Policies and expect those rules to run in Claude Code or Codex, those rules don’t run, and Guardian might appear to miss findings that a CI or platform scan reports.If you require custom rules, see Semgrep’s `#mcp` [Slack community](https://go.semgrep.dev/slack) for assistance.

## [​](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration\#coverage-in-the-guardian-default-ruleset)  Coverage in the guardian-default ruleset

The `guardian-default` ruleset is based on [`p/default`](https://semgrep.dev/p/default). Semgrep includes a rule only when the agent can apply a fix or a sanitizer. Rules that lack a reliable fix can cause the agent to rewrite code incorrectly, so Semgrep omits them.

## [​](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration\#what-guardian-scans-for)  What Guardian scans for

Guardian scans generated files using Semgrep Code, Supply Chain, and Secrets, so findings can cover:

- Code vulnerabilities detected by [Semgrep Code](https://docs.semgrep.dev/semgrep-code/overview)
- Vulnerable dependencies detected by [Semgrep Supply Chain](https://docs.semgrep.dev/semgrep-supply-chain/overview)
- Committed credentials detected by [Semgrep Secrets](https://docs.semgrep.dev/semgrep-secrets/conceptual-overview)

## [​](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration\#guardian-does-not-replace-ci-scans)  Guardian does not replace CI scans

Guardian runs as your agent writes code; your CI and platform scans run on push, pull request, or a schedule and always enforce your Policies. Continue running Semgrep in CI. See [Set up and deploy scans](https://docs.semgrep.dev/deployment/checklist).

## [​](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration\#related-pages)  Related pages

- [Choose your setup](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup)
- [Authentication](https://docs.semgrep.dev/semgrep-guardian/authentication)

Was this page helpful?

YesNo

[Suggest edits](https://github.com/semgrep/semgrep-docs/edit/main/docs/semgrep-guardian/rules-and-configuration.mdx)

[Other IDEs](https://docs.semgrep.dev/semgrep-guardian/ide-setup/other) [Authentication](https://docs.semgrep.dev/semgrep-guardian/authentication)

[x](https://x.com/semgrep) [github](https://github.com/semgrep/semgrep) [linkedin](https://www.linkedin.com/company/semgrep)

Assistant

Responses are generated using AI and may contain mistakes.