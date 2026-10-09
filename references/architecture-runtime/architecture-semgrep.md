> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.semgrep.dev/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration#content-area)

[Semgrep home page![light logo](https://mintcdn.com/semgrep-ee9d73d8/6O2eWotSEeX-M9yU/logo/light.svg?fit=max&auto=format&n=6O2eWotSEeX-M9yU&q=85&s=b53db72fbb1f3942a5595610873e9cc6)![dark logo](https://mintcdn.com/semgrep-ee9d73d8/6O2eWotSEeX-M9yU/logo/dark.svg?fit=max&auto=format&n=6O2eWotSEeX-M9yU&q=85&s=2c839aeee7634559bcfcaab9f54df40d)](https://semgrep.dev/)

Search...

Ctrl KAsk AssistantCTRLI

- [Login](https://semgrep.dev/orgs/-)
- [Book demo](https://semgrep.dev/contact/demo/)
- [Book demo](https://semgrep.dev/contact/demo/)

Search...

Navigation

Using Semgrep Guardian

Semgrep Guardian rules and configuration

[Home](https://docs.semgrep.dev/) [Scan & secure](https://docs.semgrep.dev/getting-started/quickstart) [Scan at code generation](https://docs.semgrep.dev/semgrep-guardian/overview) [Write rules](https://docs.semgrep.dev/writing-rules/overview) [API](https://docs.semgrep.dev/api-reference/v1/Introduction)
Help

Explore

What's New

- [Registry](https://semgrep.dev/explore/)
- [Playground](https://semgrep.dev/playground/new)
- [Academy](https://academy.semgrep.dev/)

### Semgrep Guardian

- [Overview](https://docs.semgrep.dev/semgrep-guardian/overview)
- [Quickstart](https://docs.semgrep.dev/semgrep-guardian/quickstart)

### Set up your coding agent

- [Choose your setup](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup)
- [Install the Semgrep CLI](https://docs.semgrep.dev/semgrep-guardian/install-cli)
- [Claude Code](https://docs.semgrep.dev/semgrep-guardian/ide-setup/claude-code)
- [Cursor](https://docs.semgrep.dev/semgrep-guardian/ide-setup/cursor)
- [Codex](https://docs.semgrep.dev/semgrep-guardian/ide-setup/codex)
- [GitHub Copilot](https://docs.semgrep.dev/semgrep-guardian/ide-setup/github-copilot)
- [VS Code](https://docs.semgrep.dev/semgrep-guardian/ide-setup/vscode)
- [Devin (Windsurf)](https://docs.semgrep.dev/semgrep-guardian/ide-setup/devin-windsurf)
- [Kiro](https://docs.semgrep.dev/semgrep-guardian/ide-setup/kiro)
- [Other IDEs](https://docs.semgrep.dev/semgrep-guardian/ide-setup/other)

### Using Semgrep Guardian

- [Rules and configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration)

### Deploy across your organization

- [Authentication](https://docs.semgrep.dev/semgrep-guardian/authentication)
- [Enterprise deployment](https://docs.semgrep.dev/semgrep-guardian/enterprise-deployment)

## On this page

- [Coverage in the guardian-default ruleset](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration#coverage-in-the-guardian-default-ruleset)
- [What Guardian scans for](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration#what-guardian-scans-for)
- [Guardian does not replace CI scans](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration#guardian-does-not-replace-ci-scans)
- [Related pages](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration#related-pages)

Using Semgrep Guardian

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