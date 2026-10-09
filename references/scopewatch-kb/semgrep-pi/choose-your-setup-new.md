> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.semgrep.dev/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup#content-area)

[Semgrep home page![light logo](https://mintcdn.com/semgrep-ee9d73d8/6O2eWotSEeX-M9yU/logo/light.svg?fit=max&auto=format&n=6O2eWotSEeX-M9yU&q=85&s=b53db72fbb1f3942a5595610873e9cc6)![dark logo](https://mintcdn.com/semgrep-ee9d73d8/6O2eWotSEeX-M9yU/logo/dark.svg?fit=max&auto=format&n=6O2eWotSEeX-M9yU&q=85&s=2c839aeee7634559bcfcaab9f54df40d)](https://semgrep.dev/)

Search...

Ctrl KAsk AssistantCTRLI

- [Login](https://semgrep.dev/orgs/-)
- [Book demo](https://semgrep.dev/contact/demo/)
- [Book demo](https://semgrep.dev/contact/demo/)

Search...

Navigation

Set up your coding agent

Choose your Semgrep Guardian setup

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

- [Compare the two paths](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup#compare-the-two-paths)
- [Set up with Claude Code or Codex (recommended)](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup#set-up-with-claude-code-or-codex-recommended)
- [Set up with another coding agent](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup#set-up-with-another-coding-agent)

Set up your coding agent

# Choose your Semgrep Guardian setup

Copy pageCopy page

Compare the Claude Code and Codex plugins against local CLI integrations before installing Semgrep Guardian.

Copy pageCopy page

Guardian has two integration paths. They differ in how you authenticate, where credentials are stored, and which rules run, so choose before you install.

## [​](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup\#compare-the-two-paths)  Compare the two paths

|  | Claude Code and Codex plugins | Local CLI integrations |
| --- | --- | --- |
| **Agents** | Claude Code, Codex | Cursor, GitHub Copilot, VS Code, Devin (Windsurf), Kiro, other MCP-compatible agents, and the local Claude Code plugin |
| **Semgrep CLI required** | No | Yes |
| **Authentication** | OAuth, one-time browser sign-in | `semgrep login` |
| **Credentials file** | `~/.semgrep/guardian.yml` | `~/.semgrep/settings.yml` |
| **Rules** | Fixed [`guardian-default`](https://semgrep.dev/p/guardian-default) ruleset; Policies don’t apply | Rules enabled in your organization’s Policies |
| **Recommended** | Yes | Only if you use another agent |

If OAuth credentials are present in `guardian.yml`, Guardian uses them instead of any API token in `settings.yml`. See [Authentication](https://docs.semgrep.dev/semgrep-guardian/authentication) if scans run under an unexpected account.

**Rules are the most consequential difference between these paths.** The recommended Claude Code and Codex plugins run a fixed ruleset and ignore your Policies configuration. The local CLI integrations use your Policies. If you’ve tuned your Policies and expect those rules to run, see [Rules and configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration).

## [​](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup\#set-up-with-claude-code-or-codex-recommended)  Set up with Claude Code or Codex (recommended)

Follow the [Quickstart](https://docs.semgrep.dev/semgrep-guardian/quickstart), or see the [Claude Code setup](https://docs.semgrep.dev/semgrep-guardian/ide-setup/claude-code) or [Codex setup](https://docs.semgrep.dev/semgrep-guardian/ide-setup/codex) for more information.

## [​](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup\#set-up-with-another-coding-agent)  Set up with another coding agent

Each of these integrations needs the [Semgrep CLI installed and signed in](https://docs.semgrep.dev/semgrep-guardian/install-cli) first.

[**Cursor** \\
\\
Hooks and MCP through the Cursor Plugin Marketplace.](https://docs.semgrep.dev/semgrep-guardian/ide-setup/cursor)

[**GitHub Copilot** \\
\\
MCP in Visual Studio, JetBrains, Xcode, or Eclipse.](https://docs.semgrep.dev/semgrep-guardian/ide-setup/github-copilot)

[**VS Code** \\
\\
MCP server for Copilot Chat Agent mode.](https://docs.semgrep.dev/semgrep-guardian/ide-setup/vscode)

[**Devin (Windsurf)** \\
\\
Cascade hooks after file writes.](https://docs.semgrep.dev/semgrep-guardian/ide-setup/devin-windsurf)

[**Kiro** \\
\\
MCP server with local Semgrep CLI.](https://docs.semgrep.dev/semgrep-guardian/ide-setup/kiro)

[**Other agents** \\
\\
Generic MCP or hook configuration.](https://docs.semgrep.dev/semgrep-guardian/ide-setup/other)

[**Claude Code (local)** \\
\\
Run Guardian against a local Semgrep CLI instead of the remote server.](https://docs.semgrep.dev/semgrep-guardian/ide-setup/claude-code)

Was this page helpful?

YesNo

[Suggest edits](https://github.com/semgrep/semgrep-docs/edit/main/docs/semgrep-guardian/choose-your-setup.mdx)

[Quickstart](https://docs.semgrep.dev/semgrep-guardian/quickstart) [Install the Semgrep CLI](https://docs.semgrep.dev/semgrep-guardian/install-cli)

[x](https://x.com/semgrep) [github](https://github.com/semgrep/semgrep) [linkedin](https://www.linkedin.com/company/semgrep)

Assistant

Responses are generated using AI and may contain mistakes.