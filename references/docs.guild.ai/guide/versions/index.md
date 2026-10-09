---
source_url: https://docs.guild.ai/guide/versions
fetched_url: https://docs.guild.ai/guide/versions.md
collected_on: 2026-10-09
collection_status: fresh_primary_capture
raw_json: .firecrawl/scopewatch-guild-versions-2026-10-09.json
scrape_id: 01a11f96-e5cc-77ac-bcf4-b8e212aca8b7
http_status: 200
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Versions

> Manage agent versions as you develop, test, and publish.

Every time you save an agent, Guild creates a new version. Versions let you iterate on agent code while keeping previous versions available.

## Version lifecycle

```bash theme={null}
# Save a new version
guild agent save --message "Add error handling"

# Save and wait for validation
guild agent save --message "Add error handling" --wait

# Save, validate, and publish in one step
guild agent save --message "Add error handling" --wait --publish

# Bound how long the command waits for validation and publish (default: 300 seconds)
guild agent save --message "Add error handling" --publish --timeout 600
```

<Note>
  `--publish` implies `--wait`, so it always waits for validation and publish to finish before reporting success. `--timeout <seconds>` bounds that wait; the default is 300. If validation is still running when the timeout elapses, finish the job with `guild agent publish <agent-id> --wait`.
</Note>

## Version states

| State | Description |
| - | - |
| **Saved** | Code is uploaded and stored |
| **Validated** | Runtime has verified the agent builds and conforms to its schemas |
| **Published** | Available to your organization for installation |

## Version numbers and bump levels

When you publish with `guild agent save --publish`, Guild derives the next version number from the latest published version. Use `--bump` to choose which part of the semantic version increments:

| Bump level | Result (from `1.2.3`) |
| - | - |
| `--bump major` | `2.0.0` |
| `--bump minor` | `1.3.0` |
| `--bump patch` (default) | `1.2.4` |

Non-TypeScript agents (`GUILD_NATIVE`, `GOOSE`, `OPENCLAW`, and `LANGGRAPH`) honor the requested `--bump` level when deriving their publish version. When nothing has been published yet, the first version is `1.0.0` regardless of bump level. To set an exact version instead of deriving one, pass `--version-number <semver>`.

<Note>
  When you use `-A`/`--all` without `--message`, non-TypeScript agents whose version bump is skipped default the commit message to `"Update agent"` instead of failing. Combining `-A` with `--no-bump` and no `--message` still fails with an error.
</Note>

## Tool and dependency validation

When you save an agent with `guild agent save`, Guild validates the tools and dependencies declared in the build before persisting the version. If a declared dependency is broken or violates visibility rules, Guild rejects the build with a `400 BadRequest` error and lists the specific validation failures.

Guild rejects the build when your agent depends on:

* A private sub-agent or integration owned by another account.
* A private sub-agent or integration owned by the same account when the agent itself is public.
* A sub-agent that has been archived.

Resolve the reported dependencies and save again to build a valid version.

## Testing before publishing

Use `guild agent test` to create a temporary version for testing without saving:

```bash theme={null}
guild agent test
```

Ephemeral versions are created automatically when testing from a local agent directory and don't appear in your version history.

<Note>
  Ephemeral versions include only files tracked by Git. Files that are already committed or staged with `git add` are uploaded. New untracked files are ignored until you stage them with `git add`. Modified tracked files still upload their working-tree content, so you can test uncommitted changes to existing files without committing them first.
</Note>

## Listing versions

```bash theme={null}
# List all versions of an agent
guild agent versions
```

## Publishing

Publishing makes a validated version available to your organization. Other team members can install published agents into their workspaces.

```bash theme={null}
# Publish the latest validated version
guild agent publish
```
