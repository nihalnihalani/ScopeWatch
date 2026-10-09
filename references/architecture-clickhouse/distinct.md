> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/reference/statements/select/distinct#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=c90f5eb2-0a9e-43d9-bf49-7930abb2eecc&pagePath=%2Fdocs%2Freference%2Fstatements%2Fselect%2Fdistinct&origPath=%2Fdocs%2Freference%2Fstatements%2Fselect%2Fdistinct) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=c90f5eb2-0a9e-43d9-bf49-7930abb2eecc&pagePath=%2Fdocs%2Freference%2Fstatements%2Fselect%2Fdistinct&origPath=%2Fdocs%2Freference%2Fstatements%2Fselect%2Fdistinct)

If `SELECT DISTINCT` is specified, only unique rows will remain in a query result. Thus, only a single row will remain out of all the sets of fully matching rows in the result.You can specify the list of columns that must have unique values: `SELECT DISTINCT ON (column1, column2,...)`. If the columns are not specified, all of them are taken into consideration.Consider the table:

```
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

Using `DISTINCT` without specifying columns:

```
SELECT DISTINCT * FROM t1;
```

```
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 1 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

Using `DISTINCT` with specified columns:

```
SELECT DISTINCT ON (a,b) * FROM t1;
```

```
┌─a─┬─b─┬─c─┐
│ 1 │ 1 │ 1 │
│ 2 │ 2 │ 2 │
│ 1 │ 2 │ 2 │
└───┴───┴───┘
```

## [​](https://clickhouse.com/docs/reference/statements/select/distinct\#distinct-and-order-by)  DISTINCT and ORDER BY

ClickHouse supports using the `DISTINCT` and `ORDER BY` clauses for different columns in one query. The `DISTINCT` clause is executed before the `ORDER BY` clause.Consider the table:

```
┌─a─┬─b─┐
│ 2 │ 1 │
│ 1 │ 2 │
│ 3 │ 3 │
│ 2 │ 4 │
└───┴───┘
```

Selecting data:

```
SELECT DISTINCT a FROM t1 ORDER BY b ASC;
```

```
┌─a─┐
│ 2 │
│ 1 │
│ 3 │
└───┘
```

Selecting data with the different sorting direction:

```
SELECT DISTINCT a FROM t1 ORDER BY b DESC;
```

```
┌─a─┐
│ 3 │
│ 1 │
│ 2 │
└───┘
```

Row `2, 4` was cut before sorting.Take this implementation specificity into account when programming queries.

## [​](https://clickhouse.com/docs/reference/statements/select/distinct\#null-processing)  Null Processing

`DISTINCT` works with [NULL](https://clickhouse.com/docs/reference/syntax#null) as if `NULL` were a specific value, and `NULL==NULL`. In other words, in the `DISTINCT` results, different combinations with `NULL` occur only once. It differs from `NULL` processing in most other contexts.

## [​](https://clickhouse.com/docs/reference/statements/select/distinct\#alternatives)  Alternatives

It is possible to obtain the same result by applying [GROUP BY](https://clickhouse.com/docs/reference/statements/select/group-by) across the same set of values as specified as `SELECT` clause, without using any aggregate functions. But there are few differences from `GROUP BY` approach:

- `DISTINCT` can be applied together with `GROUP BY`.
- Before external execution starts, a query without [ORDER BY](https://clickhouse.com/docs/reference/statements/select/order-by) can stop as soon as it has read enough different rows to satisfy [LIMIT](https://clickhouse.com/docs/reference/statements/select/limit).
- Before external execution starts and when `ORDER BY` is omitted, a [`LIMIT ... AFTER ... UNTIL`](https://clickhouse.com/docs/reference/statements/select/limit#limit-after-until) range without `ALL` can also stop the query once the range has ended.
- Data blocks are output as they are processed until external execution starts.

## [​](https://clickhouse.com/docs/reference/statements/select/distinct\#distinct-in-external-memory)  DISTINCT in External Memory

`DISTINCT` can write temporary data to disk to process sets of unique values that are too large to
keep in memory. This requires additional disk I/O and can make queries slower.Two settings control when spilling starts:

- `max_bytes_before_external_distinct` sets a threshold in bytes of total query memory. It defaults
to `0` (disabled).
- `max_bytes_ratio_before_external_distinct` sets a fraction of available memory under server or
user limits, measured at the start of execution. It defaults to `0.5` and has no effect when
neither limit applies.

When both thresholds apply, the smaller is used. Set both settings to `0` to disable spilling.`max_memory_usage` does not affect the ratio. To configure spilling relative to a query memory limit,
set an absolute threshold below that limit. For example, this query uses a 16 MiB spill threshold
with a 256 MiB query memory limit:

```
SELECT DISTINCT number % 1000000 AS id
FROM numbers(2000000)
SETTINGS
    max_bytes_before_external_distinct = 16777216,
    max_bytes_ratio_before_external_distinct = 0,
    max_memory_usage = 268435456;
```

These thresholds do not cap memory usage. Leave room for other query processing and the spill
itself. Spilling may also start earlier under memory pressure.Rows can be returned before spilling, and a `LIMIT` satisfied at this stage can finish the query early.
Once spilling starts, the rest of the input must be read before the remaining results can be returned.
If the query includes `ORDER BY`, those results are returned in the requested order.When `DISTINCT` uses input sorted by a prefix of its keys, it does not spill. A large group of rows
with the same prefix can still use substantial memory.As with `optimize_distinct_in_order`, spilling may deduplicate floating-point values that have
different binary representations but compare equal, including `0.0` and `-0.0`, or `NaN` values
with different payloads.

Last modified on September 18, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/reference/statements/select/distinct.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Freference%2Fstatements%2Fselect%2Fdistinct)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**