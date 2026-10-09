---
source_url: "https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations"
title: "ClickStack SQL visualizations"
observed_on: "2026-10-09"
publication_date: null
collection: "fresh-firecrawl"
capture_origin: ".firecrawl/scopewatch-kb/clickhouse/sql-visualizations-capture.json"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=71cd2cc7-856a-4d37-a4b7-0ac35e045930&pagePath=%2Fdocs%2Fclickstack%2Ffeatures%2Fdashboards%2Fsql-visualizations&origPath=%2Fdocs%2Fclickstack%2Ffeatures%2Fdashboards%2Fsql-visualizations) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=71cd2cc7-856a-4d37-a4b7-0ac35e045930&pagePath=%2Fdocs%2Fclickstack%2Ffeatures%2Fdashboards%2Fsql-visualizations&origPath=%2Fdocs%2Fclickstack%2Ffeatures%2Fdashboards%2Fsql-visualizations)

ClickStack supports visualizations based on raw SQL queries. This gives you full control over the query logic while still integrating with dashboard-level time ranges, filters, and chart rendering.SQL-based visualizations are useful when you need to go beyond the built-in Chart Explorer — for example, to join tables or build complex aggregations that are not supported by the chart builder.

## [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#creating-a-raw-sql-chart)  Creating a SQL-based visualization

To create a SQL-based visualization, open a dashboard tile editor and select the **SQL** tab.

![SQL Editor Button](https://mintcdn.com/private-7c7dfe99/Fq51fr3EZZwXsSji/images/use-cases/observability/sql-editor-button.webp?fit=max&auto=format&n=Fq51fr3EZZwXsSji&q=85&s=44f08e7d96a5abc4f69e81fc5424e447)

From there:

1. Select a **ClickHouse connection** to run the query against.
2. Optionally select a **Source** — this enables dashboard-level filters to be applied to your chart via the `$__filters` macro.
3. Write your SQL query in the editor, using query parameters and macros to integrate with the dashboard time range, filters, and variables.
4. Click the **play** button to preview results, then **Save**.

## [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#query-parameters)  Query parameters

[Query parameters](https://clickhouse.com/docs/reference/syntax#defining-and-using-query-parameters) allow your SQL to reference the dashboard’s current time range and granularity. They use the ClickHouse parameterized query syntax: `{paramName:Type}`.

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#available-parameters)  Available parameters

The parameters available depend on the chart type:**Line and Stacked Bar charts:**

| Parameter | Type | Description |
| --- | --- | --- |
| `{startDateMilliseconds:Int64}` | Int64 | Start of the dashboard date range (milliseconds since epoch) |
| `{endDateMilliseconds:Int64}` | Int64 | End of the dashboard date range (milliseconds since epoch) |
| `{intervalSeconds:Int64}` | Int64 | Time bucket size in seconds (based on granularity) |
| `{intervalMilliseconds:Int64}` | Int64 | Time bucket size in milliseconds (based on granularity) |

**Table, Pie, and Number charts:**

| Parameter | Type | Description |
| --- | --- | --- |
| `{startDateMilliseconds:Int64}` | Int64 | Start of the dashboard date range (milliseconds since epoch) |
| `{endDateMilliseconds:Int64}` | Int64 | End of the dashboard date range (milliseconds since epoch) |

## [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#macros)  Macros

Macros are shortcuts that expand into common ClickHouse SQL expressions. They are prefixed with `$__` and are replaced before the query is sent to ClickHouse.

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#time-boundary-macros)  Time boundary macros

These macros return a ClickHouse expression representing the dashboard’s start or end time. They take no arguments.

| Macro | Expands to | Column type |
| --- | --- | --- |
| `$__fromTime` | `toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))` | DateTime |
| `$__toTime` | `toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))` | DateTime |
| `$__fromTime_ms` | `fromUnixTimestamp64Milli({startDateMilliseconds:Int64})` | DateTime64 |
| `$__toTime_ms` | `fromUnixTimestamp64Milli({endDateMilliseconds:Int64})` | DateTime64 |
| `$__interval_s` | `{intervalSeconds:Int64}` | Int64 |

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#time-filter-macros)  Time filter macros

These macros generate a `WHERE` clause fragment that filters a column to the dashboard time range.

| Macro | Description |
| --- | --- |
| `$__timeFilter(column)` | Filters a `DateTime` column to the dashboard range |
| `$__timeFilter_ms(column)` | Filters a `DateTime64` (millisecond) column to the dashboard range |
| `$__dateFilter(column)` | Filters a `Date` column to the dashboard range |
| `$__dateTimeFilter(dateCol, timeCol)` | Filters using separate `Date` and `DateTime` columns |
| `$__dt(dateCol, timeCol)` | Alias for `$__dateTimeFilter` |

**Example expansion** of `$__timeFilter(TimestampTime)`:

```
TimestampTime >= toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))
AND TimestampTime <= toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))
```

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#time-interval-macros)  Time interval macros

These macros bucket a timestamp column into intervals matching the dashboard granularity. They are typically used in `SELECT` and `GROUP BY` clauses for time series charts. These are only available for Line and Stacked-bar visualizations.

| Macro | Description |
| --- | --- |
| `$__timeInterval(column)` | Buckets a `DateTime` column into intervals of `intervalSeconds` |
| `$__timeInterval_ms(column)` | Buckets a `DateTime64` column into intervals of `intervalMilliseconds` |

**Example expansion** of `$__timeInterval(TimestampTime)`:

```
toStartOfInterval(toDateTime(TimestampTime), INTERVAL {intervalSeconds:Int64} second)
```

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#dashboard-filter-macro)  Dashboard filter macro

| Macro | Description |
| --- | --- |
| `$__filters` | Replaced with the dashboard-level filter conditions (requires a Source to be selected) |

When a **Source** is selected on the chart and dashboard filters are active, `$__filters` expands to the corresponding SQL `WHERE` conditions. When no source is selected or no filters are applied, it expands to `(1=1)`, so it is always safe to include in a `WHERE` clause.Only filters with **Broadcast filter condition** enabled are applied by `$__filters`. Filters exposed as variables are referenced explicitly, as described below.

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#dashboard-variables)  Dashboard variable macros

When a dashboard filter is [available as a variable](https://clickhouse.com/docs/clickstack/features/dashboards/overview#dashboard-variables), its selected values can be referenced anywhere in the query. These macros are only available on tiles belonging to a dashboard that declares at least one variable.

| Macro | Description |
| --- | --- |
| `$__filter($<variable>)` | Expands to `toString(<filter expression>) IN ($variable)` when values are selected for `variable`, and `1=1` otherwise. |
| `$__filter(<expression>, $<variable>)` | Expands to `<expression> IN ($variable)` when values are selected for `variable`, and `1=1` otherwise. |
| `$__conditionalAll(<condition>, $<variable>)` | Expands to `<condition>` when the variable has a selection, `1=1` otherwise. |

A variable’s values can also be interpolated directly as `$name` or `${name}`, with an optional format — `${name:sqlstring}` (the default), `${name:csv}`, or `${name:regex}`. In the default format a direct reference renders as `NULL` before anything is selected, so prefer the macros above wherever a predicate is expected.

## [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#how-results-are-plotted)  How query results are plotted

ClickStack automatically maps result columns to chart elements based on column types. The mapping rules differ by chart type.

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#line-and-stacked-bar-charts)  Line and Stacked Bar charts

| Role | Column type | Description |
| --- | --- | --- |
| **Timestamp** | First `Date` or `DateTime` column | Used as the x-axis. |
| **Series Value** | All numeric columns | Each numeric column is plotted as a separate series. These are typically aggregate values. |
| **Group Names** | String, Map, or Array columns | Optional. Rows with different group values are plotted as separate series. |

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#pie-chart)  Pie chart

| Role | Column type | Description |
| --- | --- | --- |
| **Slice Value** | First numeric column | Determines each slice’s size. |
| **Slice Label** | String, Map, or Array columns | Optional. Each unique value becomes a slice label. |

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#number-chart)  Number chart

| Role | Column type | Description |
| --- | --- | --- |
| **Number** | First numeric column | The value from the first row of the first numeric column is displayed. |

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#table-chart)  Table chart

All result columns are displayed directly as table columns.

## [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#examples)  Examples

**Required system table access**You will need to specify `otel_v2.otel_logs` or `otel_v2.otel_traces` if running the following examples on [play-clickstack.clickhouse.com](https://play-clickstack.clickhouse.com/).

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#example-line-chart)  Line chart — log count over time by service

This query counts log events per service, bucketed into time intervals matching the dashboard granularity.

```
SELECT
  toStartOfInterval(TimestampTime, INTERVAL {intervalSeconds:Int64} second) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE TimestampTime >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
  AND TimestampTime < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

- `ts` (DateTime) is used as the x-axis timestamp.
- `count` (numeric) is plotted as the series value.
- `ServiceName` (string) creates a separate line per service.

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#example-line-chart-macros)  Line chart — using macros

The same query written using macros for brevity:

```
SELECT
  $__timeInterval(TimestampTime) AS ts,
  ServiceName,
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND $__filters
GROUP BY ServiceName, ts
ORDER BY ts ASC
```

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#example-line-chart-variables)  Line chart — using dashboard variables

Given a dashboard with a `service` variable on `ServiceName` and a `severity` variable on `SeverityText`, this query scopes the chart to the current service selection and excludes the selected severities. Both macros expand to `1=1` while their variable has no selection, so the chart renders unfiltered until the viewer picks a value.

```
SELECT
  $__timeInterval(TimestampTime) AS ts,
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND $__filter(ServiceName, $service)
  AND $__conditionalAll(SeverityText NOT IN ($severity), $severity)
GROUP BY ts
ORDER BY ts ASC
```

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#example-stacked-bar)  Stacked bar chart — error count by severity

```
SELECT
  $__timeInterval(TimestampTime) AS ts,
  lower(SeverityText),
  count() AS count
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND lower(SeverityText) IN ('error', 'warn')
  AND $__filters
GROUP BY SeverityText, ts
ORDER BY ts ASC
```

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#example-table)  Table chart — top 10 slowest endpoints

```
SELECT
  SpanName AS endpoint,
  avg(Duration) / 1000 AS avg_duration_ms,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY SpanName
ORDER BY avg_duration_ms DESC
LIMIT 10
```

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#example-pie)  Pie chart — request distribution by service

```
SELECT
  ServiceName,
  count() AS request_count
FROM otel_traces
WHERE $__timeFilter(Timestamp)
  AND $__filters
GROUP BY ServiceName
```

- `request_count` (numeric) determines each slice’s size.
- `ServiceName` (string) labels each slice.

### [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#example-number)  Number chart — total error count

```
SELECT
  count() AS total_errors
FROM otel_logs
WHERE $__timeFilter(TimestampTime)
  AND SeverityText = 'error'
  AND $__filters
```

The single numeric value `total_errors` from the first row is displayed.

## [​](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations\#notes)  Notes

- SQL-based visualizations execute with `readonly` mode enabled — only `SELECT` queries are permitted.
- SQL-based visualizations must be exactly one SQL query - multiple queries are not supported.
- The SQL editor provides autocomplete suggestions for both query parameters and macros.
- A source must be selected to apply dashboard filters to SQL-based visualizations. The source should match the table being queried, for accurate filtering.
- Dashboard variables need no source — the values come from the dashboard’s filter dropdowns, not from the tile’s own source.
- Alerts on a SQL tile that references a dashboard variable evaluate with every variable in its empty state, not the values selected on the dashboard.

Last modified on August 28, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/clickstack/features/dashboards/sql-visualizations.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Fclickstack%2Ffeatures%2Fdashboards%2Fsql-visualizations)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**