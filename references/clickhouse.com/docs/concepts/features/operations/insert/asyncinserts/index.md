---
source_url: "https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts"
title: "Asynchronous inserts"
observed_on: "2026-10-09"
publication_date: null
collection: "fresh-firecrawl"
capture_origin: ".firecrawl/scopewatch-kb/clickhouse/async-inserts-capture.json"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=4c5b6a2e-46f9-43ad-82a7-4b7de447a4f2&pagePath=%2Fdocs%2Fconcepts%2Ffeatures%2Foperations%2Finsert%2Fasyncinserts&origPath=%2Fdocs%2Fconcepts%2Ffeatures%2Foperations%2Finsert%2Fasyncinserts) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=4c5b6a2e-46f9-43ad-82a7-4b7de447a4f2&pagePath=%2Fdocs%2Fconcepts%2Ffeatures%2Foperations%2Finsert%2Fasyncinserts&origPath=%2Fdocs%2Fconcepts%2Ffeatures%2Foperations%2Finsert%2Fasyncinserts)

Asynchronous inserts in ClickHouse provide a powerful alternative when client-side batching isn’t feasible. This is especially valuable in observability workloads, where hundreds or thousands of agents send data continuously—logs, metrics, traces—often in small, real-time payloads. Buffering data client-side in these environments increases complexity, requiring a centralized queue to ensure sufficiently large batches can be sent.

Sending many small batches in synchronous mode isn’t recommended, leading to many parts being created. This will lead to poor query performance and [“too many part”](https://clickhouse.com/docs/resources/support-center/knowledge-base/troubleshooting/exception-too-many-parts) errors.

Asynchronous inserts shift batching responsibility from the client to the server by writing incoming data to an in-memory buffer, then flushing it to storage based on configurable thresholds. This approach significantly reduces part creation overhead, lowers CPU usage, and ensures ingestion remains efficient—even under high concurrency.The core behavior is controlled via the [`async_insert`](https://clickhouse.com/docs/reference/settings/session-settings/async-insert#async_insert) setting.

![Async inserts](https://mintcdn.com/private-7c7dfe99/EDr8ydtGBgFPOQea/images/bestpractices/async_inserts.webp?fit=max&auto=format&n=EDr8ydtGBgFPOQea&q=85&s=d9907c52fd0538b24ede7536aa1f13bb)

Asynchronous inserts are supported over both the HTTP and native TCP interfaces.When enabled (`async_insert = 1`), inserts are buffered and only written to disk once one of the flush conditions is met:

- The buffer reaches a specified data size ( [`async_insert_max_data_size`](https://clickhouse.com/docs/reference/settings/session-settings/async-insert#async_insert_max_data_size), default 100 MiB).
- A time threshold elapses ( [`async_insert_busy_timeout_ms`](https://clickhouse.com/docs/reference/settings/session-settings/async-insert#async_insert_busy_timeout_max_ms), default 200 ms or 1000 ms on Cloud).
- A maximum number of insert queries accumulate ( [`async_insert_max_query_number`](https://clickhouse.com/docs/reference/settings/session-settings/async-insert#async_insert_max_query_number), default 450).

Whichever threshold is reached first triggers the flush.This batching process is invisible to clients and helps ClickHouse efficiently merge insert traffic from multiple sources. However, until a flush occurs, the data can’t be queried. Importantly, there are multiple buffers per insert shape and settings combination, and in clusters, buffers are maintained per node—enabling fine-grained control across multi-tenant environments. Insert mechanics are otherwise identical to those described for [synchronous inserts](https://clickhouse.com/docs/concepts/best-practices/selecting-an-insert-strategy#synchronous-inserts-by-default).

### [​](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts\#choosing-a-return-mode)  Choosing a return mode

The behavior of asynchronous inserts is further refined using the [`wait_for_async_insert`](https://clickhouse.com/docs/reference/settings/session-settings/wait-for#wait_for_async_insert) setting.When set to 1 (the default), ClickHouse only acknowledges the insert after the data is successfully flushed to disk. This ensures strong durability guarantees and makes error handling straightforward: if something goes wrong during the flush, the error is returned to the client. This mode is recommended for most production scenarios, especially when insert failures must be tracked reliably.[Benchmarks](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) show it scales well with concurrency—whether you’re running 200 or 500 clients—thanks to adaptive inserts and stable part creation behavior.Setting `wait_for_async_insert = 0` enables “fire-and-forget” mode. Here, the server acknowledges the insert as soon as the data is buffered, without waiting for it to reach storage.This offers ultra-low-latency inserts and maximal throughput, ideal for high-velocity, low-criticality data. However, this comes with trade-offs: there’s no guarantee the data will be persisted, errors only surface during flush, and there is no dead-letter queue for failed inserts — tracing failures requires inspecting server logs and system tables after the fact. Use this mode only if your workload can tolerate data loss.[Benchmarks also demonstrate](https://clickhouse.com/blog/asynchronous-data-inserts-in-clickhouse) substantial part reduction and lower CPU usage when buffer flushes are infrequent (e.g. every 30 seconds), but the risk of silent failure remains.Our strong recommendation is to use `async_insert=1,wait_for_async_insert=1` if using asynchronous inserts. Using `wait_for_async_insert=0` is very risky because your INSERT client may not be aware if there are errors, and also can cause potential overload if your client continues to write quickly in a situation where the ClickHouse server needs to slow down the writes and create some backpressure to ensure reliability of the service.

### [​](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts\#adaptive-async-inserts)  Adaptive async inserts

Since version 24.2, ClickHouse uses adaptive flush timeouts by default ( [`async_insert_use_adaptive_busy_timeout`](https://clickhouse.com/docs/reference/settings/session-settings/async-insert#async_insert_use_adaptive_busy_timeout)). Instead of a fixed flush interval, the timeout dynamically adjusts between a minimum ( [`async_insert_busy_timeout_min_ms`](https://clickhouse.com/docs/reference/settings/session-settings/async-insert#async_insert_busy_timeout_min_ms), default 50 ms) and maximum ( [`async_insert_busy_timeout_max_ms`](https://clickhouse.com/docs/reference/settings/session-settings/async-insert#async_insert_busy_timeout_max_ms), default 200 ms or 1000 ms on Cloud) based on incoming data rate.When data arrives frequently, the timeout stays closer to the minimum to flush sooner and reduce end-to-end latency. When data is sparse, it grows toward the maximum to accumulate larger batches. This is especially useful in default mode (`wait_for_async_insert=1`), where a fixed high timeout would force clients to block for the full interval even when data is ready to flush.

### [​](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts\#error-handling)  Error handling

Schema validation and data parsing happen during buffer flush, not when the insert is received. If any row in an insert query has a parsing or type error, **none of the data from that query is flushed** — the entire query’s payload is rejected. In default mode (`wait_for_async_insert=1`), the error is returned to the client. In fire-and-forget mode, errors are written to server logs and the [`system.asynchronous_inserts`](https://clickhouse.com/docs/reference/system-tables/asynchronous_inserts) table.Destination lookup and authorization are re-evaluated at flush time as well, against the catalog and access-control state current then, not the state when the insert was received. A materialized view attached to the destination, or a grant revoked, between receiving the insert and flushing its buffer affects the flush.Each flush creates at least one part per distinct partition key value in the buffer. Even for tables without a partition key, a single flush can produce multiple parts if the buffered data exceeds [`max_insert_block_size`](https://clickhouse.com/docs/reference/settings/session-settings/max-insert#max_insert_block_size) (default ~1 million rows).

Despite using async inserts, you can still encounter [“too many parts”](https://clickhouse.com/docs/resources/support-center/knowledge-base/troubleshooting/exception-too-many-parts) errors if the partitioning key has high cardinality.

### [​](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts\#deduplication-and-reliability)  Deduplication and reliability

Since version 26.2, ClickHouse performs automatic deduplication for asynchronous inserts as well as for synchronous ones, which makes retries safe on tables that keep a deduplication log. `*ReplicatedMergeTree` engines keep one by default; a plain `MergeTree` table needs `non_replicated_deduplication_window` set to a positive value. Both insert types are controlled by [`deduplicate_insert`](https://clickhouse.com/docs/reference/settings/session-settings/deduplicate-insert#deduplicate_insert), which defaults to `enable`. Dependent materialized views are supported.In practice, if the same insert is retried — due to, for instance, a timeout or network drop — ClickHouse can safely ignore the duplicate. This helps maintain idempotency and avoids double-writing data. For asynchronous inserts, deduplication works per user query rather than per flushed batch, so a duplicate query does not discard the other queries batched with it.For details, and for the one restriction that applies to materialized views under asynchronous inserts, see [Deduplicating inserts on retries](https://clickhouse.com/docs/concepts/features/operations/insert/deduplicating-inserts-on-retries#deduplication-for-asynchronous-inserts).

### [​](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts\#enabling-asynchronous-inserts)  Enabling asynchronous inserts

Asynchronous inserts can be enabled for a particular user, or for a specific query:

- Enabling asynchronous inserts at the user level. This example uses the user `default`, if you create a different user then substitute that username:






















```
ALTER USER default SETTINGS async_insert = 1
```

- You can specify the asynchronous insert settings by using the SETTINGS clause of insert queries:






















```
INSERT INTO YourTable SETTINGS async_insert=1, wait_for_async_insert=1 VALUES (...)
```

- You can also specify asynchronous insert settings as connection parameters when using a ClickHouse programming language client.As an example, this is how you can do that within a JDBC connection string when you use the ClickHouse Java JDBC driver for connecting to ClickHouse Cloud:






















```
"jdbc:ch://HOST.clickhouse.cloud:8443/?user=default&password=PASSWORD&ssl=true&custom_http_params=async_insert=1,wait_for_async_insert=1"
```


`INSERT ... SELECT` can also take the asynchronous insert queue route when `async_insert = 1` and the whole result is a single block within `async_insert_max_data_size`; otherwise it runs synchronously. This route has its own eligibility rules and its own write accounting and cancellation behavior. See [Asynchronous `INSERT ... SELECT`](https://clickhouse.com/docs/concepts/features/operations/insert/async-insert-select) for the details.

### [​](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts\#flushing-buffers-on-shutdown)  Flushing buffers on shutdown

To flush all pending async insert buffers — for example, during a graceful shutdown or before maintenance — run:

```
SYSTEM FLUSH ASYNC INSERT QUEUE
```

This ensures any buffered data is written to storage before the server stops.

### [​](https://clickhouse.com/docs/concepts/features/operations/insert/asyncinserts\#comparison-with-buffer-tables)  Comparison with buffer tables

Asynchronous inserts are the modern replacement for [Buffer tables](https://clickhouse.com/docs/reference/engines/table-engines/special/buffer). Key differences:

- **No DDL changes required.** Async inserts are transparent — you enable a setting, not create additional tables.
- **Per-shape buffering.** Async inserts maintain separate buffers per unique query shape and settings combination, enabling granular flush policies. Buffer tables use a single buffer per target table.
- **Durability.** In default mode (`wait_for_async_insert=1`), data is confirmed on disk before the client receives acknowledgment. Buffer tables behave like fire-and-forget — buffered data is lost on crash.
- **Cluster behavior.** In clusters, async insert buffers are maintained per node. Buffer tables require explicit creation on each node.

Last modified on July 3, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/concepts/features/operations/insert/asyncinserts.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Fconcepts%2Ffeatures%2Foperations%2Finsert%2Fasyncinserts)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~