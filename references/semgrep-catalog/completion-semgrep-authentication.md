> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.semgrep.dev/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.semgrep.dev/semgrep-guardian/authentication#content-area)

[Semgrep home page![light logo](https://mintcdn.com/semgrep-ee9d73d8/6O2eWotSEeX-M9yU/logo/light.svg?fit=max&auto=format&n=6O2eWotSEeX-M9yU&q=85&s=b53db72fbb1f3942a5595610873e9cc6)![dark logo](https://mintcdn.com/semgrep-ee9d73d8/6O2eWotSEeX-M9yU/logo/dark.svg?fit=max&auto=format&n=6O2eWotSEeX-M9yU&q=85&s=2c839aeee7634559bcfcaab9f54df40d)](https://semgrep.dev/)

Search...

Ctrl KAsk AssistantCTRLI

- [Login](https://semgrep.dev/orgs/-)
- [Book demo](https://semgrep.dev/contact/demo/)
- [Book demo](https://semgrep.dev/contact/demo/)

Search...

Navigation

Deploy across your organization

Semgrep Guardian authentication

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

- [Credentials](https://docs.semgrep.dev/semgrep-guardian/authentication#credentials)
- [Scans running under an unexpected account](https://docs.semgrep.dev/semgrep-guardian/authentication#scans-running-under-an-unexpected-account)
- [Shared tokens and service accounts](https://docs.semgrep.dev/semgrep-guardian/authentication#shared-tokens-and-service-accounts)
- [Related pages](https://docs.semgrep.dev/semgrep-guardian/authentication#related-pages)

Deploy across your organization

# Semgrep Guardian authentication

Copy pageCopy page

How Semgrep Guardian signs in, where credentials are stored, and why shared tokens are discouraged.

Copy pageCopy page

How you sign in depends on which coding agent you use. Claude Code and Codex are the recommended setups.

- Claude Code and Codex

- Other coding agents


The Claude Code and Codex plugins use Semgrep’s hosted remote server and authenticate through OAuth, so developers don’t need to install or run the Semgrep CLI. Each developer completes a one-time browser sign-in when they first use the plugin. Semgrep refreshes access tokens automatically, so developers rarely need to sign in again.

### [​](https://docs.semgrep.dev/semgrep-guardian/authentication\#credentials)  Credentials

OAuth credentials are written to `~/.semgrep/guardian.yml` when you sign in through the Claude Code or Codex plugin.At startup, Guardian fetches its default authentication method from Semgrep’s remote server. OAuth is the default for users who aren’t yet signed in. This setting is global and not configurable per user.If OAuth credentials are present in `guardian.yml`, Guardian uses them instead of any API token in `~/.semgrep/settings.yml`.

### [​](https://docs.semgrep.dev/semgrep-guardian/authentication\#scans-running-under-an-unexpected-account)  Scans running under an unexpected account

If you’re switching from a local CLI setup to the Claude Code or Codex plugin, an existing OAuth session in `guardian.yml` takes precedence over CLI credentials in `settings.yml`. If scans run under a different account than you expect, check which file contains active credentials. Use [`semgrep logout`](https://docs.semgrep.dev/getting-started/cli#log-out) to remove CLI credentials from `settings.yml`.To sign in with the legacy API-token method in Claude Code or Codex, ask the Guardian MCP to sign in to Semgrep using the legacy method.

Other integrations run Semgrep through a locally installed CLI. Each developer signs in with `semgrep login`, which opens a browser-based sign-in flow. See [Install the Semgrep CLI](https://docs.semgrep.dev/semgrep-guardian/install-cli) only if you need one of these setups.

### [​](https://docs.semgrep.dev/semgrep-guardian/authentication\#credentials-2)  Credentials

Credentials are written to `~/.semgrep/settings.yml` when you sign in through `semgrep login` or set an API token manually. This is the same file the Semgrep CLI uses. If you’re already signed in through `semgrep login`, Guardian can use those credentials.

## [​](https://docs.semgrep.dev/semgrep-guardian/authentication\#shared-tokens-and-service-accounts)  Shared tokens and service accounts

Shared API tokens and service accounts are not recommended. Each developer authenticates individually, through OAuth in Claude Code or Codex, or with `semgrep login` elsewhere, so Semgrep can associate activity with the correct user.Semgrep discourages sharing app or API tokens across a team because:

- Revoking a shared token affects every user who depends on it.
- Shared credentials are rate-limited as a single user, which can throttle scans when many developers run Guardian concurrently.
- An API token in `settings.yml` is only used when no OAuth session exists in `guardian.yml`. Prefer OAuth for enterprise deployments.

Prefer OAuth. When developers can’t complete a browser sign-in, deploy Guardian with a read-only token. Semgrep supports this shared credential on Semgrep Enterprise. For more information, see [Deploy with a read-only token](https://docs.semgrep.dev/semgrep-guardian/enterprise-deployment#deploy-with-a-read-only-token-semgrep-enterprise-only).

## [​](https://docs.semgrep.dev/semgrep-guardian/authentication\#related-pages)  Related pages

- [Choose your setup](https://docs.semgrep.dev/semgrep-guardian/choose-your-setup)
- [Deploy across your organization](https://docs.semgrep.dev/semgrep-guardian/enterprise-deployment)

Was this page helpful?

YesNo

[Suggest edits](https://github.com/semgrep/semgrep-docs/edit/main/docs/semgrep-guardian/authentication.mdx)

[Rules and configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration) [Enterprise deployment](https://docs.semgrep.dev/semgrep-guardian/enterprise-deployment)

[x](https://x.com/semgrep) [github](https://github.com/semgrep/semgrep) [linkedin](https://www.linkedin.com/company/semgrep)

Assistant

Responses are generated using AI and may contain mistakes.