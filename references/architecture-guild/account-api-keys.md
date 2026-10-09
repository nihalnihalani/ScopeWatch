> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/platform/api-keys#content-area)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

- [Guides](https://docs.guild.ai/)
- [CLI](https://docs.guild.ai/cli/getting-started)
- [SDK](https://docs.guild.ai/packages/agents-sdk)
- [API Reference](https://docs.guild.ai/api-reference/introduction)
- [Integrations](https://docs.guild.ai/integrations/overview)
- [Examples](https://docs.guild.ai/examples/overview)

Search...

Ctrl KAsk AssistantCTRLI

- [guild.ai](https://guild.ai/)
- [Sign in](https://app.guild.ai/)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

Search or ask...

Navigation

Access & setup

API keys

### Overview

- [Introduction](https://docs.guild.ai/)
- [Quickstart](https://docs.guild.ai/quickstart)
- [Command palette](https://docs.guild.ai/platform/command-palette)

### The Smith

- [What is The Smith?](https://docs.guild.ai/platform/smith)
- [Getting started with The Smith](https://docs.guild.ai/docs/the-smith/getting-started)
- [Artifacts](https://docs.guild.ai/platform/artifacts)

### The Factory

- [What is a Software Factory?](https://docs.guild.ai/platform/factory)
- [Factory setup wizard](https://docs.guild.ai/platform/factory-setup-wizard)

### Platform

- Agents

- Workspaces

- Usage

- Agent Hub

- Access & setup



  - [Overview](https://docs.guild.ai/platform/settings)
  - [Account settings](https://docs.guild.ai/platform/account-settings)
  - [Security](https://docs.guild.ai/platform/security-settings)
  - [Organizations](https://docs.guild.ai/platform/organizations)
  - [Profile settings](https://docs.guild.ai/platform/profile-settings)
  - [Credentials](https://docs.guild.ai/platform/credentials)
  - [Credential policies](https://docs.guild.ai/platform/credential-policies)
  - [Identity mapping](https://docs.guild.ai/platform/identity-mapping)
  - [Audit logs](https://docs.guild.ai/insights/audit-logs)
  - [Environments](https://docs.guild.ai/platform/environments)
  - [API keys](https://docs.guild.ai/platform/api-keys)
  - Models & providers
- Concepts


### Agent SDK

- [Introduction](https://docs.guild.ai/guide/sdk-introduction)
- Agents

- [Versions](https://docs.guild.ai/guide/versions)
- Runtime


Access & setup

# API keys

Copy pageCopy page

Create and manage account API keys for programmatic access to the Guild public API.

Copy pageCopy page

Account API keys authenticate programmatic requests to the Guild public API on behalf of your personal account or an organization. Create and manage them from **Access & setup > API keys**, in either your personal account or an organization. Use the account switcher at the top of the left nav to choose which.See the [API reference](https://docs.guild.ai/api-reference/introduction) for the base URL, authentication, the scope model, and every endpoint a key can reach.

## [​](https://docs.guild.ai/platform/api-keys\#create-a-key)  Create a key

Give the key a name (for example, “Production”), then set permissions for each of six resource groups — **Agents**, **Workspaces**, **Sessions**, **Skills**, **Integrations**, and **Tool calls** — to **No access**, **Read**, or **Read & write**. A key can never reach another account, billing, or credentials, regardless of the permissions you grant it.The full secret is shown exactly once, immediately after creation. Copy it before leaving the page — Guild does not display it again. Use it as the HTTP Basic auth credential (`username:password`) on API requests.

## [​](https://docs.guild.ai/platform/api-keys\#rotate-a-key)  Rotate a key

Rotate a key to replace its secret in place. The key keeps the same ID and permissions, so only the secret changes. Find the key in the list, select **Rotate**, and confirm.

Rotation replaces the old secret immediately. Any agents or scripts using the old secret lose access instantly until you update them with the newly minted secret.

## [​](https://docs.guild.ai/platform/api-keys\#revoke-a-key)  Revoke a key

Revoking a key permanently disables it. Find the key in the list, select **Revoke**, and confirm — this cannot be undone, and anything still using that key loses access immediately.

[Environments\\
\\
Previous](https://docs.guild.ai/platform/environments) [Models & providers\\
\\
Next](https://docs.guild.ai/platform/llm-settings)

Ctrl+I

## On this page

- [Create a key](https://docs.guild.ai/platform/api-keys#create-a-key)
- [Rotate a key](https://docs.guild.ai/platform/api-keys#rotate-a-key)
- [Revoke a key](https://docs.guild.ai/platform/api-keys#revoke-a-key)

[Guild home page![light logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/light.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=21393c9a072674c192091492cc76f441)![dark logo](https://mintcdn.com/guildai/x-xVeOd53CpYbehm/logo/dark.svg?fit=max&auto=format&n=x-xVeOd53CpYbehm&q=85&s=d6acfb4e042a02c7229b6dea41c1a957)](https://docs.guild.ai/)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

[About](https://www.guild.ai/about) [Contact](https://www.guild.ai/contact) [Privacy policy](https://www.guild.ai/privacy-policy) [Terms](https://www.guild.ai/terms)

[github](https://github.com/guildaidev) [discord](https://discord.gg/guild-ai)

Assistant

Responses are generated using AI and may contain mistakes.