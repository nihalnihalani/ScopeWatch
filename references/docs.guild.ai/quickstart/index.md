---
source_url: https://docs.guild.ai/quickstart
source_capture: .firecrawl/click-guild-guild-quickstart.md
collection_status: reused_prior_capture
indexed_at: 2026-10-09
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Quickstart

> Build and publish your first agent in five minutes.

## Run an agent

<iframe src="https://www.youtube.com/embed/Hhf09Q-4CUg" title="YouTube video player" frameborder="0" className="w-full aspect-video rounded-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen />

<Steps>
  <Step title="Sign in">
    Go to [app.guild.ai](https://app.guild.ai) and sign in with your Google or GitHub account, or enter your email to receive a passwordless magic link. Signing in lands you on the chat page; new accounts also see a short survey dialog, which you can complete, skip, or dismiss with Escape.
  </Step>

  <Step title="Create a workspace">
    Click **Workspaces** in the left nav, then click **New Workspace** and give it a name.
  </Step>

  <Step title="Install an agent">
    Inside your workspace, click **Agents** in the left nav and click **Add Agent**. On the **All** tab, find an agent and add it (try `github-issues` if you have a GitHub integration, or any public agent).
  </Step>

  <Step title="Start a session">
    Click **Chat** in the workspace's left nav. Type `@` and pick your agent, type a message, and press **Enter**.

    The agent runs and responds in the session panel. It may ask clarifying questions or request access to services along the way.
  </Step>
</Steps>

<Tip>
  To connect GitHub, Slack, Jira, or other services, go to **Access & setup > Credentials** and click **Connect** for each service.
</Tip>

***

## Build your own agent

Paste this into your coding agent (Claude Code, Cursor, Codex, etc.) to get started:

```text Coding agent prompt theme={null}
Install the Guild CLI globally with npm: npm install -g @guildai/cli
Authenticate by running: guild auth login --non-interactive
This will print a URL. Tell me to open it in my browser to complete authentication, then wait for the command to finish.
After auth succeeds, run: guild setup --provider <claude, codex, or gemini — whichever you are> --yes
This will install skills for guild agent development and Factory setup.
Then select the home workspace: guild workspace select home
Then list agent categories with: guild agent categories
Create a new agent, picking a category from that list: guild agent init --name hello-agent --template LLM --category <category>
If I belong to an organization, ask me which account should own the agent and add --owner <name>.
Then change into the hello-agent directory it creates.
Edit agent.ts to be a friendly greeting agent using llmAgent with multi-turn mode and guildTools.
Test the agent with: echo '{"prompt":"Hello!"}' | guild agent test --mode json
Ask me if the response looks good. Once I confirm, save and publish with: guild agent save --message "First version" --wait --publish
```

Or follow the steps below manually.

Ready to build a custom agent? The Guild CLI handles the full workflow: create, test, save, publish.

### Prerequisites

* **Node.js 22+** and **npm** (see [nodejs.org](https://nodejs.org))

### Install and authenticate

<Steps>
  <Step title="Install the CLI">
    ```bash theme={null}
    npm install -g @guildai/cli
    ```
  </Step>

  <Step title="Authenticate with Guild">
    ```bash theme={null}
    guild auth login
    ```

    This opens your browser to sign in at [app.guild.ai](https://app.guild.ai) and configures your local npm registry for Guild packages.

    Verify:

    ```bash theme={null}
    guild auth status
    # ✓ Authenticated
    ```
  </Step>
</Steps>

<Tip>
  If something goes wrong, run `guild doctor` to diagnose your setup. See the [CLI troubleshooting](https://docs.guild.ai/cli/getting-started#troubleshooting) section for common issues.
</Tip>

### Create, test, publish

<Steps>
  <Step title="Create the agent">
    ```bash theme={null}
    guild agent init --name hello-agent --template LLM
    cd hello-agent
    ```

    <Note>
      If your account belongs to one or more organizations, `--owner <name-or-id>` is required in non-interactive mode (scripted or CI use). Set a default with `guild config set default_owner <name-or-id>` to avoid passing it on every invocation.
    </Note>

    This scaffolds a `hello-agent/` directory, creates the agent in the Guild backend, initializes a local git repo, and pulls starter files:

    ```text theme={null}
    hello-agent/
    ├── agent.ts          # Your agent code
    ├── package.json      # Dependencies (runtime packages are pre-configured)
    ├── tsconfig.json     # TypeScript config
    ├── guild.json        # Local config (managed by the CLI)
    └── .gitignore
    ```
  </Step>

  <Step title="Edit the agent">
    Open `agent.ts` and replace the contents:

    ```typescript theme={null}
    import { llmAgent, guildTools } from "@guildai/agents-sdk"

    export default llmAgent({
      description: "A friendly greeting agent",
      tools: { ...guildTools },
      systemPrompt: `You are a friendly assistant. Greet users warmly and answer their questions.`,
      mode: "multi-turn",
    })
    ```

    `mode: "multi-turn"` keeps the conversation going after each response. `llmAgent` wires `ui_notify` internally so progress notifications (`task.ui.notify()`) work, but hides it from the model unless you explicitly add `ui_notify` to your agent's `tools`. Add `userInterfaceTools` explicitly if your agent needs `ui_prompt` or `ui_ping`.

    <Note>
      The `description` field is optional and deprecated as of `@guildai/agents-sdk` 0.4.0. Guild generates the agent's published description automatically from its code, so setting `description` no longer affects the published description.
    </Note>
  </Step>

  <Step title="Select a workspace">
    ```bash theme={null}
    guild workspace select
    ```

    This prompts you to pick a workspace interactively. You can also pass `--workspace <id>` to `guild agent test` directly.
  </Step>

  <Step title="Test it">
    ```bash theme={null}
    guild agent test
    ```

    This opens an interactive chat session. Ephemeral versions are created automatically when testing from a local agent directory:

    ```text theme={null}
    You: Hello!
    Agent: Hello! Welcome. I'm happy to help. What can I do for you today?
    ```

    Press `Ctrl+C` to exit.
  </Step>

  <Step title="Save and publish">
    ```bash theme={null}
    guild agent save --message "First version" --wait --publish
    ```

    * `--wait` blocks until validation passes
    * `--publish` implies `--wait` and makes the agent available to your organization once validation and publish both finish

    Your agent is live. Install it in a workspace to use it.

    For details on publishing workflows, see [Publish to the Agent Hub](https://docs.guild.ai/platform/publish-to-agent-hub).
  </Step>
</Steps>

## Next steps

<CardGroup cols={2}>
  <Card title="CLI reference" icon="terminal" href="/cli/getting-started">
    Full development loop: templates, testing, publishing, troubleshooting.
  </Card>

  <Card title="Agent SDK" icon="code" href="/guide/sdk-introduction">
    Build advanced agents with typed inputs, tool sets, and platform services.
  </Card>

  <Card title="Native agents" icon="wand-magic-sparkles" href="/guide/native-agents">
    A prompt and a tool list, with no code (the simplest way to build).
  </Card>

  <Card title="Agent types" icon="layer-group" href="/guide/agent-types">
    Compare every type: Native, TypeScript, Goose, and OpenClaw.
  </Card>

  <Card title="TypeScript LLM agents" icon="brain" href="/guide/llm-agents">
    Prompt-driven agents with tools, in TypeScript.
  </Card>

  <Card title="Auto-managed state agents" icon="square-code" href="/guide/coded-agents">
    Deterministic TypeScript agents for algorithmic workflows.
  </Card>
</CardGroup>
