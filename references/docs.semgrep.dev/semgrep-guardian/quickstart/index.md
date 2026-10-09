---
source_url: "https://docs.semgrep.dev/semgrep-guardian/quickstart"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T19:25:27.199797+00:00"
normalized_at: "2026-10-09T07:47:21.932869+00:00"
reuse_of: ".firecrawl/semgrep-pi-guardian-quickstart.md"
source_kind: "current documentation"
published_date: null
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "a03839a85fc44deac414fd11490ac8ec211314621343e00c1c1eeb7bd486b061"
body_sha256: "2967ea934ced53e93ce7023911c5687d15d6a17636f6f496cf90d72a14414e67"
---

# Semgrep Guardian quickstart

Copy pageCopy page

Set up Semgrep Guardian with Claude Code or Codex to scan AI-generated code and catch security issues before they ship.

Copy pageCopy page

**Claude Code and Codex are the recommended Semgrep Guardian setups.** Both use Semgrep’s hosted remote server and authenticate through OAuth, so you don’t need a local Semgrep CLI.If you use a different coding agent, see [Choose your setup](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup).

**For Windows machines:** [Windows Subsystem for Linux (WSL)](https://learn.microsoft.com/en-us/windows/wsl/install) is required. Native Windows is unsupported.

- Claude Code

- Codex


## [​](https://docs.semgrep.dev/semgrep-guardian/quickstart\#prerequisites)  Prerequisites

- A Semgrep account
- Claude Code installed (`claude` command)

## [​](https://docs.semgrep.dev/semgrep-guardian/quickstart\#set-up-guardian)  Set up Guardian

1

Install the plugin

Install the Guardian plugin from the Claude Marketplace:

```
claude plugin install semgrep@claude-plugins-official
```

2

Sign in to Semgrep

Start a new Claude Code session:

```
claude
```

You’re prompted to sign in to Semgrep through your browser. This is a one-time sign-in. Semgrep refreshes access tokens automatically, so you rarely need to sign in again.

This integration uses Claude Code [hooks](https://code.claude.com/docs/en/hooks) and [plugins](https://code.claude.com/docs/en/plugins). By default, it uses Semgrep’s hosted remote server, so you don’t need to install the Semgrep CLI locally.

## [​](https://docs.semgrep.dev/semgrep-guardian/quickstart\#prerequisites-2)  Prerequisites

- A Semgrep account
- Codex CLI installed (`codex` command)

## [​](https://docs.semgrep.dev/semgrep-guardian/quickstart\#set-up-guardian-2)  Set up Guardian

1

Install the plugin

Add the Semgrep marketplace, then install the Guardian plugin from it:

```
codex plugin marketplace add https://github.com/semgrep/guardian --sparse .claude-plugin --sparse plugin
codex plugin add semgrep@semgrep-marketplace
```

2

Start a new Codex session

Start a new Codex session so the plugin loads:

```
codex
```

3

Sign in to Semgrep

Ask Codex:

```
Log in to Semgrep Guardian.
```

Complete the sign-in prompts in your browser. This is a one-time sign-in. Semgrep refreshes access tokens automatically, so you rarely need to sign in again.

4

Confirm you're signed in

Ask Codex:

```
Who am I logged in as in Semgrep Guardian?
```

Codex confirms your identity and Semgrep deployment.

5

Verify the installation

From your terminal, run:

```
codex plugin list --json
```

By default, this integration uses Semgrep’s hosted remote server, so you don’t need to install the Semgrep CLI locally.

## [​](https://docs.semgrep.dev/semgrep-guardian/quickstart\#next-steps)  Next steps

- [Claude Code setup](https://docs.semgrep.dev/semgrep-guardian/ide-setup/claude-code) for the local plugin option, or [Codex setup](https://docs.semgrep.dev/semgrep-guardian/ide-setup/codex) for more information
- [Rules and configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration) for which rules Guardian scans with
- [Authentication](https://docs.semgrep.dev/semgrep-guardian/authentication) for credential details and how to switch accounts
- [Deploy across your organization](https://docs.semgrep.dev/semgrep-guardian/enterprise-deployment) for fleet-wide deployment

Was this page helpful?

YesNo

[Suggest edits](https://github.com/semgrep/semgrep-docs/edit/main/docs/semgrep-guardian/quickstart.mdx)

[Overview](https://docs.semgrep.dev/semgrep-guardian/overview) [Choose your setup](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup)

[x](https://x.com/semgrep) [github](https://github.com/semgrep/semgrep) [linkedin](https://www.linkedin.com/company/semgrep)

Assistant

Responses are generated using AI and may contain mistakes.