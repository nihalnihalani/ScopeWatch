---
source_url: https://docs.guild.ai/platform/llm-settings
fetched_url: https://docs.guild.ai/platform/llm-settings
collected_on: 2026-10-09
collection_status: fresh_primary_capture
raw_json: .firecrawl/scopewatch-guild-llm-settings-rendered-2026-10-09.json
scrape_id: 01a11f97-faad-702b-aa03-287a70d1eb1f
http_status: 200
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/llms.txt](https://docs.guild.ai/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://docs.guild.ai/platform/llm-settings#content-area)

**Models & providers** controls which provider and credentials Guild uses when agents call `task.llm`. By default, agents use **managed** LLM access backed by your Guild tokens balance. You can switch to **bring your own key (BYOK)** by adding an inference provider credential.LLM configuration is stored on an **account** (your user account or an organization), not on individual workspaces. Sessions in a workspace use the LLM settings for that workspace’s owner account.Together these settings act as a central model gateway: credentials are held server-side and never distributed to agents, [model policies](https://docs.guild.ai/platform/llm-settings#model-policies) control which models each workspace and agent may call, the [daily token limit](https://docs.guild.ai/platform/llm-settings#daily-token-limit) caps spend, and every call is attributed to its workspace, agent, and user in [Usage](https://docs.guild.ai/insights/usage).

## [​](https://docs.guild.ai/platform/llm-settings\#open-models-&-providers)  Open Models & providers

**Models & providers** is under **Access & setup** in the left nav. The page itself is headed **LLM Settings**.

### [​](https://docs.guild.ai/platform/llm-settings\#personal-account)  Personal account

1

Open your personal account

Use the account switcher at the top of the left nav, or click your avatar and select **Settings**.

2

Go to Models & providers

Click **Access & setup** in the left nav, then **Models & providers**.

Direct URL: `https://app.guild.ai/settings/llm-settings`

### [​](https://docs.guild.ai/platform/llm-settings\#organization)  Organization

Organization LLM settings apply to workspaces owned by that organization. Only organization **admins** can open this section.

1

Open your organization

Switch to the organization with the account switcher at the top of the left nav.

2

Go to Models & providers

Click **Access & setup** in the left nav, then **Models & providers**.

Direct URL: `https://app.guild.ai/organizations/{org-name}/settings/llm-settings`

## [​](https://docs.guild.ai/platform/llm-settings\#managed-vs-byok)  Managed vs BYOK

| Mode | When it applies | Billing |
| --- | --- | --- |
| **Managed** | No active credentials on the account | LLM usage draws from your **Guild tokens balance** |
| **BYOK** | At least one active credential | Calls use your provider account; your Guild tokens balance is not consumed |

The page shows your current mode as **LLM Tier**:

- **Managed ( _tier_)** — Guild runs LLMs on your behalf using managed infrastructure.
- **BYOK (Bring Your Own Key)** — Guild routes LLM calls through your own inference provider credentials, selected by your account’s [model policies](https://docs.guild.ai/platform/llm-settings#model-policies).

When you add your first credential, the account switches from managed to BYOK automatically. When you delete your last active credential, Guild switches back to managed.

On a managed account, Guild honors an agent’s declared LLM preference when it holds a managed key for the preferred publisher. A pinned managed default applies only when the agent declares no preference. If an agent prefers a publisher Guild has no managed key for, the run fails. To use that publisher, an admin of the owning account adds a credential for it, which switches the whole account to BYOK.

## [​](https://docs.guild.ai/platform/llm-settings\#inference-provider-credentials)  Inference provider credentials

Credentials live on the account. Adding one switches the account to BYOK; removing the last one returns it to managed.An **inference provider** is the endpoint Guild authenticates to. A **model publisher** is who made the model. For a publisher’s own API these are the same party, but a provider can serve models from several publishers — so a credential carries one **access** per publisher it unlocks, and [model policies](https://docs.guild.ai/platform/llm-settings#model-policies) bind to a specific access rather than to the credential as a whole.Providers differ in how they authenticate, which is why this is a credential and not simply a key: the fields in the form are derived from the provider you pick.

### [​](https://docs.guild.ai/platform/llm-settings\#add-a-credential)  Add a credential

Click **Add API key** in the page header and choose an inference provider from the menu: one of the publishers’ own APIs ( **Anthropic**, **Google AI**, **Meta**, or **OpenAI**), or a third-party provider that serves models from several publishers ( **AWS Bedrock**, **Fireworks AI**, or **OpenRouter**). The dialog is titled for the provider you chose, such as **Add OpenRouter key**.

| Field | Description |
| --- | --- |
| **Name** | A label you choose, such as `Production` or `Testing`. |
| **API key** | The secret from your provider console. [AWS Bedrock](https://docs.guild.ai/platform/providers/aws-bedrock) asks for an **IAM role ARN** and an **AWS region** instead. |
| **Models** | One row per model publisher the provider serves. Check each publisher this credential should reach. Each checked row has a default model, which Guild uses when a request names none. It’s pre-filled with the platform default for that publisher, and you can change it to any model the credential can use. |

Click **Add Key** to save. A credential gets one **access** for each publisher you check.The platform default model for each publisher is below. Each publisher’s page lists its models, the providers that serve them, and how to call them from an agent.

| Publisher | Default model |
| --- | --- |
| [Anthropic](https://docs.guild.ai/platform/models/anthropic) | `claude-sonnet-4-6` |
| [OpenAI](https://docs.guild.ai/platform/models/openai) | `gpt-4o` |
| [Gemini](https://docs.guild.ai/platform/models/gemini) | `gemini-3.5-flash` |
| [Meta](https://docs.guild.ai/platform/models/meta) | `muse-spark-1.1` |
| [DeepSeek](https://docs.guild.ai/platform/models/deepseek) | `deepseek-v3.2` |
| [Alibaba (Qwen)](https://docs.guild.ai/platform/models/qwen) | `qwen3-next-80b-a3b` |
| [Moonshot AI](https://docs.guild.ai/platform/models/moonshot) | `kimi-k2.5` |
| [Z.ai](https://docs.guild.ai/platform/models/zai) | `glm-5` |

DeepSeek, Alibaba (Qwen), Moonshot AI, and Z.ai models are served through third-party inference providers — AWS Bedrock, OpenRouter, or Fireworks AI — rather than the publishers’ own APIs. OpenRouter also serves Anthropic, OpenAI, Gemini, and Meta models. Fireworks AI serves DeepSeek, Alibaba (Qwen), Moonshot AI, Z.ai, and OpenAI models. Each provider’s page lists the models it serves: [AWS Bedrock](https://docs.guild.ai/platform/providers/aws-bedrock), [Fireworks AI](https://docs.guild.ai/platform/providers/fireworks), and [OpenRouter](https://docs.guild.ai/platform/providers/openrouter).

Guild stores credentials securely and shows only a masked value in the table (first and last few characters).

### [​](https://docs.guild.ai/platform/llm-settings\#third-party-providers)  Third-party providers

Third-party inference providers serve models from several publishers. Some authenticate differently from a single API key, so see each provider’s page for setup:

- [AWS Bedrock](https://docs.guild.ai/platform/providers/aws-bedrock) assumes an IAM role in your AWS account.
- [Fireworks AI](https://docs.guild.ai/platform/providers/fireworks) uses a Fireworks API key.
- [OpenRouter](https://docs.guild.ai/platform/providers/openrouter) uses an OpenRouter API key.

### [​](https://docs.guild.ai/platform/llm-settings\#update-a-credential)  Update a credential

Select **Edit** from the row menu to update an existing credential. Under **Models**, check or uncheck publishers and change each one’s default model.Unchecking a publisher stops the credential serving it, and the [model policies](https://docs.guild.ai/platform/llm-settings#model-policies) bound to that publisher’s access stop applying.

### [​](https://docs.guild.ai/platform/llm-settings\#rotate-a-credential)  Rotate a credential

Rotate a credential to swap in a new secret without disturbing the [model policies](https://docs.guild.ai/platform/llm-settings#model-policies) bound to its accesses. Guild validates the new secret, creates a replacement credential carrying the old one’s policies and default model, and archives the old credential immediately. Usage already recorded stays attributed to the credential that incurred it.Select **Rotate key** from the credential’s row menu and paste the new secret. Rotating cannot be undone, and an already-archived credential cannot be rotated.

### [​](https://docs.guild.ai/platform/llm-settings\#default-model)  Default model

Each credential has a **default model** — the model used when that credential is selected but the request doesn’t resolve to a more specific allowed model. A credential that reaches several publishers has one default model for each. You set them under **Models** when you add the credential, pre-filled with the [platform default](https://docs.guild.ai/platform/llm-settings#add-a-credential) for each publisher, and can change them later with **Edit**.

### [​](https://docs.guild.ai/platform/llm-settings\#manage-credentials)  Manage credentials

The table lists each credential’s provider, masked secret, created date, and creator. Use the row menu to:

- **Edit** — Change which publishers the credential reaches, and each one’s default model.
- **Rotate key** — Replace the credential’s secret while keeping its policies. See [Rotate a credential](https://docs.guild.ai/platform/llm-settings#rotate-a-credential).
- **Delete** — Archive the credential. Archived credentials appear when you filter to **Archived keys**.

Use **Search** and the status filter ( **All keys**, **Active keys**, **Archived keys**) to find credentials.Which credential serves a request is decided by your account’s [model policies](https://docs.guild.ai/platform/llm-settings#model-policies), not by marking one as the default.

Deleting a credential also removes every model policy bound to its accesses. To replace its secret without losing those policies or its default model, [rotate](https://docs.guild.ai/platform/llm-settings#rotate-a-credential) it instead.Deleting your **last** active credential returns the account to **managed** mode.

## [​](https://docs.guild.ai/platform/llm-settings\#model-policies)  Model policies

Model policies control which LLMs agents can call. A policy (a “rule”) binds a credential access to a scope with a set of allowed models. Policies are an **allowlist**: a model is available only if a matching rule allows it.Model policy configuration is available only in **BYOK** mode. The **Account default** and **Overrides** sections, along with the workspace-level and workspace agent-level **Models** sections, appear only when the account has at least one active credential. In **managed** mode, these sections are hidden because LLM calls use Guild-provided tokens and there are no rules to assign.

### [​](https://docs.guild.ai/platform/llm-settings\#account-default)  Account default

Set the account default rules under **Models** in **Access & setup > Models & providers**. Rules are ranked, and the first matching rule wins. Each rule allows one of:

| Scope | When to use |
| --- | --- |
| **All models** | Allow every model the provider exposes for that access. |
| **Specific models** | Restrict the access to a chosen set of models. |

For a **Specific models** rule, you can:

- Select standard models from the built-in catalog.
- Enter custom globs to match model families, for example `haiku-*` or `gpt-4o-*`.

Use **Add rule** to add a rule, the row menu to edit or remove one, and the drag handle to reorder. Changes apply immediately.This section is hidden on the **LLM Settings** page in **managed** mode (no active credentials). It appears once the account has at least one active credential.

### [​](https://docs.guild.ai/platform/llm-settings\#overrides)  Overrides

The **Overrides** section, below **Models** in **Access & setup > Models & providers**, lists every workspace, agent, and workspace-agent that sets its own rules instead of the account default. An override **replaces** the account default entirely — there is no merging.Filter the list by scope — **Workspaces**, **Agents**, or **Workspace agents** — and use **Add override** to create one or the row menu to edit it. **Reset all overrides** clears every override and returns all scopes to the account default.Like **Models**, this section is hidden on the **LLM Settings** page in **managed** mode and appears once the account has at least one active credential.

### [​](https://docs.guild.ai/platform/llm-settings\#rule-hierarchy-and-inheritance)  Rule hierarchy and inheritance

Model rules resolve down an inheritance chain so you can set a policy once and refine it where needed, from least to most specific:

```
Account (root) -> Workspace -> Agent -> Workspace agent
```

Each sub-level inherits the rules of its parent until you override it; the most specific level that has its own rules wins. Overriding pre-copies the inherited rules to the level you are editing so you can adjust them from a known starting point.

Credentials always belong to the owning account — a workspace, agent, or workspace agent can’t hold a key of its own. An override replaces the inherited rules, so it can point a lower level at a different key the account owns and change which models that key serves.

You can set an override directly from the scope it applies to:

- **Workspace** — open the workspace and click **Models** in the sidebar. The page shows the inherited account rules; **Add rule** overrides them for this workspace, and **Reset to inherited** drops the override. If the owning account has no active credentials, this page shows an empty state — **Using Guild-provided tokens** — instead of the editor, and model controls become available once you add a credential to the account.
- **Workspace agent** — open the agent inside a workspace and use the **Models** section on its detail page. It works the same way, overriding the rules for that agent in that workspace. If the owning account has no active credentials, the **Models** section is hidden entirely.

A status banner shows whether the level is **Inherited** (using the account default) or **Overridden** (using its own rules).

### [​](https://docs.guild.ai/platform/llm-settings\#find-a-credential%E2%80%99s-id-from-the-cli)  Find a credential’s ID from the CLI

`guild llm policy create` needs the ID of the credential a policy binds to. List an account’s credentials to find it:

```
guild llm credential list <account>
```

| Argument or option | Description |
| --- | --- |
| `<account>` | Account ID or name. Required. |
| `--limit <number>` | Number of results to return. |
| `--offset <number>` | Offset for pagination. |
| `--archived` | Show archived credentials **instead of** live ones. |

The output has one row per credential:

| Column | Description |
| --- | --- |
| `CREDENTIAL` | The name you gave the credential. |
| `PROVIDER` | The provider that serves it. |
| `PUBLISHERS` | The model publishers this credential unlocks, comma-separated — one per access. Pass one to `--publisher` when there is more than one. |
| `ID` | The credential UUID to pass to `guild llm policy create --credential`. |

### [​](https://docs.guild.ai/platform/llm-settings\#manage-policies-from-the-cli)  Manage policies from the CLI

The Guild CLI manages model policies under `guild llm policy`. Each policy binds a credential access to a target — a workspace, agent, or workspace-agent — with an optional model allowlist.

| Command | Description |
| --- | --- |
| `guild llm policy list <account>` | List an account’s model policies. Add `--target-id <id>` to show only the rules on one workspace, agent, or workspace-agent. |
| `guild llm policy create --credential <id> [--publisher <publisher>] --target-id <id> [--models <patterns>]` | Create a policy. `--credential` is the LLM credential ID. `--publisher` names the model publisher on it (case-insensitive, e.g. `ANTHROPIC`); omit it when the credential serves a single publisher and Guild infers it. Omit `--models` to allow all models; pass comma-separated globs (e.g. `haiku-*,sonnet-*`) to restrict. |
| `guild llm policy update <policy-id> (--models <patterns> | --all-models)` | Replace a policy’s allowed models. `--all-models` clears the restriction; `--models ""` allows none. |
| `guild llm policy delete <policy-id>` | Delete a policy. Removing the last policy on a target returns it to inheriting the account default. |
| `guild llm policy reorder <target-id> --policies <id1,id2,...>` | Reorder a target’s policies; pass all of the target’s policy IDs in the desired rank. |

Model values follow the same semantics as the console: a list of patterns (with optional `*` wildcards) allows those models, all models means unrestricted, and an empty list disables that access for the target.

### [​](https://docs.guild.ai/platform/llm-settings\#manage-policies-from-chat)  Manage policies from chat

[Smith](https://docs.guild.ai/platform/smith) can do the same work conversationally. Ask it to list your credentials, show the policies on a target, restrict a credential to certain models, or change policy priority. Smith presents the exact change it intends to make and waits for your approval before creating, updating, deleting, or reordering anything.

## [​](https://docs.guild.ai/platform/llm-settings\#daily-token-limit)  Daily token limit

When you use BYOK, you can set a **Daily token limit** in the **Usage & limits** section at the top of the page. All LLM requests are rejected after the account exceeds this limit for the day. The limit resets at midnight UTC. Leave the field empty for unlimited usage.This limit applies to LLM usage on the account while BYOK is active.

## [​](https://docs.guild.ai/platform/llm-settings\#guild-tokens-balance)  Guild tokens balance

When the account is in **managed** mode, the page shows your **Guild tokens balance**. The balance is indicative and may not update in real time.

## [​](https://docs.guild.ai/platform/llm-settings\#how-agents-use-these-settings)  How agents use these settings

Agents do not embed credentials in code. At runtime, Guild resolves LLM configuration for each session from the workspace owner’s account settings.See [LLMs](https://docs.guild.ai/guide/llms) for calling `task.llm` from agent code and [Credentials](https://docs.guild.ai/platform/credentials) for connecting third-party services agents use as tools.

## [​](https://docs.guild.ai/platform/llm-settings\#model-selection)  Model selection

Guild resolves the provider and model for each `task.llm` call from policies and agent preferences.

### [​](https://docs.guild.ai/platform/llm-settings\#policy-resolution)  Policy resolution

A policy pairs a credential access with a list of allowed models. To find the active policy set, Guild walks this hierarchy and stops at the first level that has any policies defined:

1. **Workspace agent** — policies on a specific agent installed in the workspace
2. **Agent** — policies on the agent definition
3. **Workspace** — policies on the workspace
4. **Account** — policies on the user or organization account

Only the matching level applies. Policies from different levels are not merged.

### [​](https://docs.guild.ai/platform/llm-settings\#preferences)  Preferences

An agent can declare preferences, each naming a provider and optionally a model. Guild evaluates them against the active policies in order:

- A preference with no model selects the policy’s first allowed model, or the credential’s default model when the policy lists none.
- A preference with a model is matched against the policy’s allowed models as wildcard patterns, so `claude-haiku-*` matches any Claude Haiku variant. A policy with no allowed-models list matches every model.

### [​](https://docs.guild.ai/platform/llm-settings\#fallback)  Fallback

If no preference matches, or the agent declares none, Guild falls back to the first available policy and its first allowed model, or that credential’s default model.

Ctrl+I

Assistant

Responses are generated using AI and may contain mistakes.