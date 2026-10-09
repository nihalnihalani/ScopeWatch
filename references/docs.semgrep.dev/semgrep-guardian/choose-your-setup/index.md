---
source_url: "https://docs.semgrep.dev/semgrep-guardian/choose-your-setup"
captured_at: "2026-10-09T07:57:20.048321+00:00"
capture_time_basis: "raw CLI output file mtime"
source_kind: "current documentation"
published_date: null
raw_capture: ".firecrawl/scopewatch-kb/semgrep-pi/choose-your-setup-new.md"
raw_sha256: "887638a733c6b816fb8ff01ff685bec786465e9acdf508706d3f68786375159e"
body_sha256: "e2cab847dc46ddb7e34683188ddc5ccfac2e679f074e6b7a8762bb2c2cd0cf2f"
normalization: "trim preamble before first H1; preserve examples and tables"
---

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