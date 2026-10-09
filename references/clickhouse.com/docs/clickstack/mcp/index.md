---
source_url: "https://clickhouse.com/docs/clickstack/mcp"
title: "ClickStack MCP"
observed_on: "2026-10-09"
publication_date: null
collection: "fresh-firecrawl"
capture_origin: ".firecrawl/scopewatch-kb/clickhouse/mcp-capture.json"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/clickstack/mcp#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=a10e95ac-3fe8-43b0-85bc-aeaa8794a908&pagePath=%2Fdocs%2Fclickstack%2Fmcp&origPath=%2Fdocs%2Fclickstack%2Fmcp) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=a10e95ac-3fe8-43b0-85bc-aeaa8794a908&pagePath=%2Fdocs%2Fclickstack%2Fmcp&origPath=%2Fdocs%2Fclickstack%2Fmcp)

ClickStack includes a built-in [Model Context Protocol (MCP)](https://modelcontextprotocol.io/) server that lets AI assistants interact with your observability data. Once connected, an AI assistant can query logs, traces, and metrics; manage dashboards and alerts; explore data sources; and work with saved searches — all through natural language.This allows you to use tools like [Claude Code](https://docs.anthropic.com/en/docs/claude-code), [Cursor](https://www.cursor.com/), or any MCP-compatible client to investigate incidents, build dashboards, and manage your observability setup without leaving your development environment.

Observability investigations with Claude + the ClickStack MCP server - YouTube

Tap to unmute

[Observability investigations with Claude + the ClickStack MCP server](https://www.youtube.com/watch?v=FaL5iOgNogg) [ClickHouse](https://www.youtube.com/channel/UChtmrD-dsdpspr42P_PyRAw)

![thumbnail-image](https://yt3.ggpht.com/C08vYC3eDSRgBBlRrQsGbQ8xmQepXljHVPSqV3RLZaV4C3ssS86M6aqCUzKDtmHy9ygReMnuKg=s68-c-k-c0x00ffffff-no-rj)

ClickHouse15.6K subscribers

[Watch on](https://www.youtube.com/watch?v=FaL5iOgNogg)

## [​](https://clickhouse.com/docs/clickstack/mcp\#availability)  Availability

The MCP server is available in the following ClickStack deployment types:

| Deployment | Status |
| --- | --- |
| **Open Source ClickStack** | Available |
| **BYOC (Bring Your Own Cloud)** | Available |
| **ClickStack on ClickHouse Cloud** | Available |
| **HyperDX v1** ( [hyperdx.io](https://hyperdx.io/)) | Not supported |

**Different setup for ClickHouse Cloud vs OSS/BYOC**ClickStack on ClickHouse Cloud uses a different endpoint and authentication method than Open Source and BYOC deployments. See the [ClickStack on ClickHouse Cloud](https://clickhouse.com/docs/clickstack/mcp#managed-clickstack) section below for Cloud-specific setup.

## [​](https://clickhouse.com/docs/clickstack/mcp\#managed-clickstack)  ClickStack on ClickHouse Cloud

ClickStack on ClickHouse Cloud connects through the Cloud MCP endpoint at `https://mcp.clickhouse.cloud/clickstack` and authenticates with OAuth 2.0. API key authentication is not supported for this endpoint.

### [​](https://clickhouse.com/docs/clickstack/mcp\#managed-prerequisites)  Prerequisites

- A running ClickHouse Cloud service with [ClickStack enabled](https://clickhouse.com/docs/clickstack/deployment/managed)
- [MCP enabled](https://clickhouse.com/docs/products/cloud/features/ai-ml/mcp/remote-mcp#enable-remote-mcp-server) on the service — open the Cloud console, click **Connect**, select **Connect with MCP**, and toggle it on

### [​](https://clickhouse.com/docs/clickstack/mcp\#managed-endpoint)  Endpoint

```
https://mcp.clickhouse.cloud/clickstack
```

Authentication uses OAuth 2.0. When your MCP client connects for the first time, it opens a browser window for you to sign in with your ClickHouse Cloud credentials. No API key is needed.

### [​](https://clickhouse.com/docs/clickstack/mcp\#managed-connecting-a-client)  Connecting an MCP client

Each client handles the OAuth flow automatically on first connection.

- Claude Code

- Cursor

- VS Code

- OpenCode

- LibreChat

- Other


```
claude mcp add --transport http clickstack https://mcp.clickhouse.cloud/clickstack
```

Launch Claude Code and run `/mcp`, then select `clickstack` to complete the OAuth flow.

Add the following to `.cursor/mcp.json`:

```
{
  "mcpServers": {
    "clickstack": {
      "url": "https://mcp.clickhouse.cloud/clickstack"
    }
  }
}
```

Add the following to `.vscode/mcp.json`:

```
{
  "servers": {
    "clickstack": {
      "type": "http",
      "url": "https://mcp.clickhouse.cloud/clickstack"
    }
  }
}
```

Add the following to `opencode.json`:

```
{
  "mcp": {
    "clickstack": {
      "type": "remote",
      "url": "https://mcp.clickhouse.cloud/clickstack"
    }
  }
}
```

Add the following to `librechat.yaml`:

```
mcpServers:
  clickstack:
    type: streamable-http
    url: https://mcp.clickhouse.cloud/clickstack
```

Any MCP client that supports **Streamable HTTP** with OAuth can connect. Configure it with:

- **URL:**`https://mcp.clickhouse.cloud/clickstack`

### [​](https://clickhouse.com/docs/clickstack/mcp\#managed-service-override)  Targeting a specific service

Without the `x-service-id` header, requests default to the first ClickStack service provisioned and used by your account. To target a different service, pass `x-service-id: <YOUR_SERVICE_ID>` as a header in your MCP client configuration.

## [​](https://clickhouse.com/docs/clickstack/mcp\#oss-byoc)  Open Source and BYOC

Open Source and BYOC deployments use your ClickStack instance’s built-in MCP endpoint with Bearer token authentication.

### [​](https://clickhouse.com/docs/clickstack/mcp\#oss-prerequisites)  Prerequisites

- A running ClickStack instance (see [Deployment](https://clickhouse.com/docs/clickstack/deployment/overview) for setup options)
- A **Personal API Access Key** — find yours in HyperDX under **Team Settings → API Keys → Personal API Access Key**

![Personal API Access Key in Team Settings](https://mintcdn.com/private-7c7dfe99/LCIbqddLfKHZZnfk/images/clickstack/api-key-personal.webp?fit=max&auto=format&n=LCIbqddLfKHZZnfk&q=85&s=bd30aebcbfd948a9c9ad63361be23dd2)

The Personal API Access Key is different from the **Ingestion API Key** found in Team Settings, which is used to authenticate telemetry data sent to the OpenTelemetry collector.

### [​](https://clickhouse.com/docs/clickstack/mcp\#oss-endpoint)  Endpoint

The MCP server is available at the `/api/mcp` path on your ClickStack frontend URL. For example, with a default local deployment, the URL is `http://localhost:8080/api/mcp`. Replace `localhost:8080` with your instance’s host and port if you’ve customized the defaults.

The examples on this page use the frontend app URL (port `8080` by default). You can also reach the MCP server directly via the backend at `<BACKEND_URL>/mcp`, but not all deployments expose the backend, so these docs use the frontend path.

The MCP server uses the **Streamable HTTP** transport with **Bearer token** authentication.

### [​](https://clickhouse.com/docs/clickstack/mcp\#oss-connecting-a-client)  Connecting an MCP client

Replace `<YOUR_CLICKSTACK_URL>` with your instance URL (for example, `http://localhost:8080`) and `<YOUR_API_KEY>` with your Personal API Access Key.

- Claude Code

- Cursor

- VS Code

- OpenCode

- LibreChat

- Other


```
claude mcp add --transport http hyperdx <YOUR_CLICKSTACK_URL>/api/mcp \
  --header "Authorization: Bearer <YOUR_API_KEY>"
```

Add the following to `.cursor/mcp.json`:

```
{
  "mcpServers": {
    "hyperdx": {
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

Add the following to `.vscode/mcp.json`:

```
{
  "servers": {
    "hyperdx": {
      "type": "http",
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

Add the following to `opencode.json`:

```
{
  "mcp": {
    "hyperdx": {
      "type": "remote",
      "url": "<YOUR_CLICKSTACK_URL>/api/mcp",
      "oauth": false,
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}
```

Add the following to `librechat.yaml`:

```
mcpServers:
  clickstack:
    type: streamable-http
    url: <YOUR_CLICKSTACK_URL>/api/mcp
    headers:
      Authorization: "Bearer <YOUR_API_KEY>"
```

Any MCP client that supports **Streamable HTTP** can connect. Configure it with:

- **URL:**`<YOUR_CLICKSTACK_URL>/api/mcp`
- **Header:**`Authorization: Bearer <YOUR_API_KEY>`

## [​](https://clickhouse.com/docs/clickstack/mcp\#capabilities)  What can you do with MCP?

Once connected, your AI assistant has access to a range of tools spanning the core areas of ClickStack. These include:

- **Querying data** — Search and aggregate logs, traces, and metrics using ClickStack’s query builder, search syntax, or raw SQL.
- **Data sources** — List available data sources, database connections, column schemas, and attribute keys.
- **Dashboards** — Create, update, delete, and inspect dashboards along with their tiles.
- **Alerts** — Create, update, and inspect alerts along with their evaluation history.
- **Saved searches** — Create, update, and inspect reusable saved search definitions.
- **Webhooks** — List available webhook destinations for alert notifications.
- **Teams** — List teams the current user belongs to and identify the active team.

The specific set of tools may expand over time. Your MCP client will automatically discover the available tools when it connects.

## [​](https://clickhouse.com/docs/clickstack/mcp\#multi-team)  Multi-team usage (OSS/BYOC)

This applies to Open Source and BYOC deployments only. For ClickStack on ClickHouse Cloud, see [Targeting a specific service](https://clickhouse.com/docs/clickstack/mcp#managed-service-override).By default, MCP requests operate in the context of your primary team. If you belong to multiple teams, pass the `x-hdx-team` header set to the team’s ID alongside your `Authorization` header. If the header is omitted, your primary team is used. If you specify a team you don’t belong to, the request is rejected with a `401` error.Use the team listing tool from your MCP client to discover which teams you have access to and which one is active.

## [​](https://clickhouse.com/docs/clickstack/mcp\#troubleshooting)  Troubleshooting

### [​](https://clickhouse.com/docs/clickstack/mcp\#troubleshooting-managed)  ClickStack on ClickHouse Cloud

OAuth flow doesn't complete

- Confirm your MCP client supports OAuth 2.0. Clients that only support Bearer token or stdio transport can’t authenticate with the Cloud endpoint.
- Check that your browser isn’t blocking the OAuth popup or redirect.
- Verify your ClickHouse Cloud account has access to the organization and service.

MCP is enabled but the client can't connect

- Confirm you’re using the ClickStack endpoint (`https://mcp.clickhouse.cloud/clickstack`), not the general Cloud MCP endpoint (`https://mcp.clickhouse.cloud/mcp`).
- Verify that [MCP is enabled](https://clickhouse.com/docs/products/cloud/features/ai-ml/mcp/remote-mcp#enable-remote-mcp-server) on the service in the Cloud console.

Requests go to the wrong service

Without the `x-service-id` header, requests default to the first ClickStack service provisioned and used by your account. Pass the header to target a specific service. See [Targeting a specific service](https://clickhouse.com/docs/clickstack/mcp#managed-service-override).

### [​](https://clickhouse.com/docs/clickstack/mcp\#troubleshooting-oss)  Open Source and BYOC

I'm getting a 403 authentication error

- Verify that you’re using the **Personal API Access Key** (not the Ingestion API Key).
- Confirm the key is included as a `Bearer` token in the `Authorization` header.
- Check that your ClickStack instance is running and reachable at the URL you configured.

I'm being rate limited

The MCP server enforces a rate limit of **600 requests per minute** per user. If you exceed this limit, requests are temporarily rejected. Reduce the frequency of requests or wait before retrying.

I'm getting a 401 error with the x-hdx-team header

Verify that the team ID is correct and that your user account is a member of that team.

I can't connect to the MCP server

- Ensure your MCP client supports the **Streamable HTTP** transport. Older clients that only support the stdio transport won’t work.
- If you’re running ClickStack locally, confirm the app is accessible at the configured URL (the default is `http://localhost:8080`).
- For BYOC deployments behind a load balancer or reverse proxy, ensure the `/api/mcp` path isn’t being blocked or rewritten.

Last modified on August 24, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/clickstack/mcp.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Fclickstack%2Fmcp)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**