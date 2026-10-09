# Knowledge Base: ClickHouse capabilities for ScopeWatch

Observed 9 October 2026. Reference corpus for the Cyberdefense Hackathon research expansion; no implementation, account test or performance measurement was performed. Eleven first-party pages: three existing captures reused, eight newly scraped with Firecrawl. Raw Markdown retains examples and tables and lives under `.firecrawl/<hostname>/<path>/index.md`; each page has adjacent `metadata.json`. Existing captures were not altered.

## Start here

- Analytical decision and five-hour scope: [ClickHouse capability findings](../../../docs/spec/clickhouse-capabilities.md).
- Machine-readable provenance: [sources.json](sources.json).
- Current project baseline: [FINAL_IDEA.md](../../../docs/spec/FINAL_IDEA.md).

## Dated releases inside 9 September–9 October 2026

| ID | Page/date | Relevant section | Raw reference |
| --- | --- | --- | --- |
| C01 | [ClickStack August update](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026), **16 September** | Variables, chart formulas, alert evaluation history/webhooks, emerging signals, tile validation, OIDC limits | [Markdown](../../clickhouse.com/blog/whats-new-in-clickstack-august-2026/index.md) |
| C04 | [ClickHouse 26.9](https://clickhouse.com/blog/clickhouse-release-26-09), **23 September** | CREATE TOKEN, LIMIT AFTER/UNTIL, APPEND INCREMENTAL, DISTINCT external memory | [Markdown](../../clickhouse.com/blog/clickhouse-release-26-09/index.md) |
| C02 | [Executable UDFs GA](https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud), **5 October** | Native runtimes; Python-only network today; first attachment restart; process-boundary costs | [Markdown](../../clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud/index.md) |

“August update” is an edition name; its publication date is September 16. Dated release availability does not establish the version enabled in the team's account. This is the latest relevant first-party release evidence located in the bounded search, not a claim to have exhaustively audited every October release.

Supplemental structured evidence collected by the root researcher: the Alexandria GitHub releases provider returned [`v26.9.13.15-stable`](https://github.com/ClickHouse/ClickHouse/releases/tag/v26.9.13.15-stable), published October 8, as the newest record on page 1. [Raw provider response](../../releases/clickhouse-releases-page1.json). This supplement is separate from the eleven Markdown pages and does not establish Cloud rollout.

## Current documented capabilities, without a recent-launch claim

| ID | Topic | Research use | Raw reference |
| --- | --- | --- | --- |
| C11 | [uniqExact](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact) | Exact event identity counts; memory grows with distinct identities | [Markdown](../../clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact/index.md) |
| C09 | [ReplacingMergeTree](https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/replacingmergetree) | Background deduplication is eventual; use correct query-time semantics | [Markdown](../../clickhouse.com/docs/reference/engines/table-engines/mergetree-family/replacingmergetree/index.md) |
| C03 | [Incremental materialized views](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view) | Insert-time rollups; right-side budget changes do not retrigger an MV join | [Markdown](../../clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view/index.md) |
| C08 | [Asynchronous inserts](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts) | Buffered rows are not queryable until flush; wait for acknowledgement | [Markdown](../../clickhouse.com/docs/concepts/features/operations/insert/asyncinserts/index.md) |
| C05 | [system.query_log](https://clickhouse.com/docs/reference/system-tables/query_log) | Real query IDs, rows read, duration, memory; Cloud logs are node-local | [Markdown](../../clickhouse.com/docs/reference/system-tables/query_log/index.md) |
| C10 | [ClickStack SQL visualizations](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations) | Cross-table queries and drilldown; readonly SELECT; alert variables are empty | [Markdown](../../clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations/index.md) |
| C06 | [ClickStack alerts](https://clickhouse.com/docs/clickstack/features/alerts) | SQL alert result rules, group semantics, minimum listed one-minute schedule | [Markdown](../../clickhouse.com/docs/clickstack/features/alerts/index.md) |
| C07 | [ClickStack MCP](https://clickhouse.com/docs/clickstack/mcp) | Cloud OAuth versus OSS/BYOC bearer setup; tool permissions and discovery | [Markdown](../../clickhouse.com/docs/clickstack/mcp/index.md) |

## Usage notes

Read the capability findings first, then the precise source section when evaluating a claim. The manifest distinguishes dated releases from current docs and reused captures. Existing cache capture timestamps were not independently recovered; `observed_on` is the date inspected and assembled into this corpus.

An old guessed `uniqexact` URL returned 404; the valid URL was discovered with Firecrawl map and scraped. The failed output is retained as diagnostic evidence and excluded from the eleven-page corpus. Search/map discovery JSON is kept in this directory. These pages do not establish native Guild identity fields, event delivery timing, selective DENY feasibility or hackathon prize stacking; those require the separate Guild/rules research and event account proof.

## Rerun inputs

workflow: firecrawl-knowledge-base
source: official ClickHouse/ClickStack docs and relevant release notes
goal: reference, capability selection for ScopeWatch
depth: thorough, bounded eleven-page corpus
output_dir: .firecrawl/scopewatch-kb/clickhouse/
raw_output_convention: .firecrawl/clickhouse.com/<path>/index.md
