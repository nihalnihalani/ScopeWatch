---
source_url: "https://clickhouse.com/docs/clickstack/features/alerts"
title: "ClickStack alerts"
observed_on: "2026-10-09"
publication_date: null
collection: "fresh-firecrawl"
capture_origin: ".firecrawl/scopewatch-kb/clickhouse/alerts-capture.json"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/clickstack/features/alerts#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=8d403bc1-0923-4b49-bc21-b657533e9fb6&pagePath=%2Fdocs%2Fclickstack%2Ffeatures%2Falerts&origPath=%2Fdocs%2Fclickstack%2Ffeatures%2Falerts) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=8d403bc1-0923-4b49-bc21-b657533e9fb6&pagePath=%2Fdocs%2Fclickstack%2Ffeatures%2Falerts&origPath=%2Fdocs%2Fclickstack%2Ffeatures%2Falerts)

ClickStack includes built-in support for alerting, enabling teams to detect and respond to issues in real time across logs, metrics, and traces.Alerts can be created directly in the HyperDX interface and integrate with popular notification systems like Slack and PagerDuty.Alerting works seamlessly across your ClickStack data, helping you track system health, catch performance regressions, and monitor key business events.

## [​](https://clickhouse.com/docs/clickstack/features/alerts\#types-of-alerts)  Types of alerts

ClickStack supports two complementary ways to create alerts: **Search alerts** and **Dashboard chart alerts**. Once the alert is created, it is attached to either the search or the chart.

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#search-alerts)    1. Search alerts

Search alerts allow you to trigger notifications based on the results of a saved search. They help you detect when specific events or patterns occur more (or less) frequently than expected.An alert is triggered when the count of matching results within a defined time window either exceeds or falls below a specified threshold.To create a search alert:For an alert to be created for a search, the search must be saved. You can either create the alert for an existing saved search or save the search during the alert creation process. In the example below, we assume the search isn’t saved.

1

Open alert creation dialog

Start by entering a [search](https://clickhouse.com/docs/clickstack/features/search) and clicking the `Alerts` button in the top-right corner of the `Search` page.

![Alerts search view](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/alerts_search_view.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=4d243b6cc4b8401971319e04348f0dc0)

2

Create the alert

From the alert creation panel, you can:

- Assign a name to the saved search associated with the alert.
- Set a threshold and specify how many times it must be reached within a given period. Thresholds can also be used as upper or lower bounds. The period here will also dictate how often the alert is triggered.
- Specify a `grouped by` value. This allows the search to be subject to an aggregation, e.g., `ServiceName`, thus allowing multiple alerts to be triggered off the same search.
- Choose a webhook destination for notifications. You can add a new webhook directly from this view. See [Adding a webhook](https://clickhouse.com/docs/clickstack/features/alerts#add-webhook) for details.

Before saving, ClickStack visualizes the threshold condition so you can confirm it will behave as expected.

![Search alerts](https://mintcdn.com/private-7c7dfe99/Fq51fr3EZZwXsSji/images/use-cases/observability/search_alert.webp?fit=max&auto=format&n=Fq51fr3EZZwXsSji&q=85&s=cb006dae30b37d658f7abc077f25c852)

Note that multiple alerts can be added to a search. If the above process is repeated, you will see the current alerts as tabs at the top of the edit alert dialog, with each alert assigned a number.

![Multiple alerts](https://mintcdn.com/private-7c7dfe99/Fq51fr3EZZwXsSji/images/use-cases/observability/multiple_search_alerts.webp?fit=max&auto=format&n=Fq51fr3EZZwXsSji&q=85&s=af2d610a27d4e55934124792403a87bf)

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#dashboard-alerts)    2. Dashboard chart alerts

Dashboard alerts extend alerting to charts.You can create a chart-based alert directly from a saved dashboard, powered by full SQL aggregations and ClickHouse functions for advanced calculations.When a metric crosses a defined threshold, an alert triggers automatically, allowing you to monitor KPIs, latencies, or other key metrics over time.

For an alert to be created for a visualization on a dashboard, the dashboard must be saved.

To add a dashboard alert:Alerts can be created during the chart creation process, when adding a chart to a dashboard, or added to existing charts. In the example below, we assume the chart already exists on the dashboard.

1

Open the chart edit dialog

Open the chart’s configuration menu and select the alert button. This will show the chart edit dialog.

![Edit chart alert](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/edit_chart_alert.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=dce76c4df94f3e3c3d32c6bca40f59e8)

2

Add the alert

Select **Add Alert**.

![Add alert to chart](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/add_chart_alert.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=561562110582501b66d53e3db3d6600a)

3

Define the alert conditions

Define the condition (`>=`, `>`, `<=`, `<`, `=`, `!=`, `<= x >=`, `> or <`), threshold, duration, and webhook. The duration here will also dictate how often the alert is triggered.

![Create alert for chart](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/create_chart_alert.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=18c69cf4fb944463f02e06fe28fbf0cb)

You can add a new webhook directly from this view. See [Adding a webhook](https://clickhouse.com/docs/clickstack/features/alerts#add-webhook) for details.

## [​](https://clickhouse.com/docs/clickstack/features/alerts\#add-webhook)  Adding a webhook

During alert creation, you can either use an existing webhook or create one. Once created, the webhook will be available for reuse across other alerts.A webhook can be created for different service types, including Slack and PagerDuty, as well as generic targets.For example, consider the alert creation for a chart below. Before specifying the webhook, the user can select `Add New Webhook`.

![Add new webhook](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/add_new_webhook.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=1f3e1801dd25d78193282cde5ec51299)

This opens the webhook creation dialog, where you can create a new webhook:

![Webhook creation](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/add_webhook_dialog.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=e9899f0d2b868a591ddaebcdf48ea485)

A webhook name is required, while descriptions are optional. Other settings that must be completed depend on the service type.Note that different service types are available between ClickStack Open Source and ClickStack Cloud. See [Service type integrations](https://clickhouse.com/docs/clickstack/features/alerts#integrations).

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#integrations)  Service type integrations

ClickStack alerts integrate out of the box with the following service types:

- **Slack**: send notifications directly to a channel via either a webhook or API.
- **PagerDuty**: route incidents for on-call teams via the PagerDuty API.
- **Webhook**: connect alerts to any custom system or workflow via a generic webhook.

**ClickHouse Cloud only integrations**The Slack API and PagerDuty integrations are only supported in ClickHouse Cloud.

Depending on the service type, you will need to provide different details. Specifically:**Slack (Webhook URL)**

- Webhook URL. For example: `https://hooks.slack.com/services/<unique_path>`. See the [Slack documentation](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/) for further details.

**Slack (API)**

- Slack bot token. See the [Slack documentation](https://docs.slack.dev/authentication/tokens/#bot/) for further details.

**PagerDuty API**

- PagerDuty integration key. See the [PagerDuty documentation](https://support.pagerduty.com/main/docs/api-access-keys) for further details.

**Generic**

- Webhook URL
- Webhook headers (optional)
- Webhook body (optional). The body currently supports the template variables `{{title}}`, `{{body}}`, and `{{link}}`.

## [​](https://clickhouse.com/docs/clickstack/features/alerts\#managing-alerts)  Managing alerts

Alerts can be centrally managed through the alerts panel on the left-hand side of HyperDX.

![Manage alerts](https://mintcdn.com/private-7c7dfe99/Y7YJeVzyAMn9ugXv/images/use-cases/observability/manage_alerts.webp?fit=max&auto=format&n=Y7YJeVzyAMn9ugXv&q=85&s=0730d61d407ecdf8a4b359b81b4a36e0)

From this view, you can see all alerts that have been created and are currently running in ClickStack.

![Alerts view](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/alerts_view.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=02ba0512bb8ba0fabafd0ed610dedb47)

This view also displays the alert evaluation history. Alerts are evaluated on a recurring time interval (defined by the period/duration set during alert creation). During each evaluation, HyperDX queries your data to check whether the alert condition is met:

- **Red bar**: The threshold condition was met during this evaluation and the alert fired (notification sent)
- **Green bar**: The alert was evaluated but the threshold condition wasn’t met (no notification sent)

Each evaluation is independent - the alert checks the data for that time window and fires only if the condition is true at that moment.In the example above, the first alert has fired on every evaluation, indicating a persistent issue. The second alert shows a resolved issue - it fired twice initially (red bars), then on subsequent evaluations the threshold condition was no longer met (green bars).Clicking an alert takes you to the chart or search the alert is attached to.

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#deleting-alerts)  Deleting an alert

To remove an alert, open the edit dialog for the associated search or chart, then select **Remove Alert**.
In the example below, the `Remove Alert` button will remove the alert from the chart.

![Remove chart alert](https://mintcdn.com/private-7c7dfe99/Fq51fr3EZZwXsSji/images/use-cases/observability/remove_chart_alert.webp?fit=max&auto=format&n=Fq51fr3EZZwXsSji&q=85&s=bafa736d6d68f4a6caf1af1065e7e15f)

## [​](https://clickhouse.com/docs/clickstack/features/alerts\#sql-based-alerts)  SQL-based chart alerts

SQL-based chart alerts let you write arbitrary ClickHouse SQL to define alert conditions. This gives you full control over filtering, aggregation, and math — anything you can express in SQL can become an alert.

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#supported-chart-types)  Supported chart types

SQL-based alerts are supported on three chart display types:

| Chart type | Behavior |
| --- | --- |
| **Line** | Time-series alert. The query must produce time-bucketed rows. Each bucket is evaluated independently against the threshold. |
| **Stacked Bar** | Time-series alert. Same behavior as Line. |
| **Number** | Single-value alert. The query returns a single numeric result which is compared against the threshold once per evaluation. |

Other SQL-based chart types (Table, Pie, Heatmap, etc.) do not support alerts.

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#create-sql-based-alert)  Creating a SQL alert

To create an alert on a SQL-based chart:

1

Create or open a SQL-based chart on a dashboard

From a saved dashboard, either [create a new chart with the **SQL** chart mode](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations), or open an existing SQL-based chart for editing.Choose **Line**, **Stacked Bar**, or **Number** as the display type.

![Create SQL chart](https://mintcdn.com/private-7c7dfe99/Fq51fr3EZZwXsSji/images/use-cases/observability/open_sql_chart_mode.webp?fit=max&auto=format&n=Fq51fr3EZZwXsSji&q=85&s=9bcffbac68c1ac8634c6c131584be0b9)

2

Add the alert

Select **Add Alert** from the alert section of the chart editor. Configure:

- **Threshold type**: `>=` (greater than or equal), `>` (greater than), `<=` (less than or equal), `<` (less than), `=` (equal), `!=` (not equal), `<= x >=` (between), or `> or <` (outside)
- **Threshold value**: The numeric value to compare against
- **Interval**: How often the alert is evaluated (1m, 5m, 15m, 30m, 1h, 6h, 12h, or 1d). This also defines the time window for each evaluation.
- **Webhook**: The notification channel to use when the alert fires. See [Adding a webhook](https://clickhouse.com/docs/clickstack/features/alerts#add-webhook).

![Edit chart alert](https://mintcdn.com/private-7c7dfe99/uAzQoYEGwuyhrO3W/images/use-cases/observability/add_raw_sql_alert.webp?fit=max&auto=format&n=uAzQoYEGwuyhrO3W&q=85&s=e94400bd035d038cca01b1298c73845c)

**Alert Time Range**Typically, alert queries are executed once per interval. However, if one or more intervals are skipped due to errors or slow queries, the following execution will use a time range that includes the missed intervals. In this case, the query’s interval parameters would still be set to the alert’s configured period, but the time range parameters would reflect the longer time range.

3

Save the dashboard

Save the dashboard to activate the alert. The alert will begin evaluating on the configured interval.

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#sql-result-interpretation)  How query results are interpreted

The alert system inspects the columns returned by your SQL query to determine what to compare against the threshold.

- **Value column**: The **last numeric column** in your `SELECT` clause is used as the alert value. If your query returns multiple numeric columns (e.g., `count, avg_latency, p99_latency`), only the last one (`p99_latency`) is compared to the threshold.
- **Timestamp column**: For time-series charts (Line and Stacked Bar), the system identifies the Date/DateTime column in your results as the time bucket (i.e. the x-axis on a time-series chart). The value column for each time bucket is evaluated against the threshold independently, and if the value for any time bucket breaches the configured threshold, the alert will trigger.
- **Group columns**: Any non-numeric, non-timestamp columns (e.g., `ServiceName`, `Environment`) are treated as grouping dimensions. When groups are present, each unique combination of group values is tracked and alerted on separately. ClickStack will send an alert for each group with a value that breaches the configured threshold. Groups are only available for time-series charts.

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#query-params)  Query parameters and macros

SQL alert queries support template parameters and macros that are automatically replaced at evaluation time. These are the same parameters and macros available when [building a SQL-based chart](https://clickhouse.com/docs/clickstack/features/dashboards/sql-visualizations).

#### [​](https://clickhouse.com/docs/clickstack/features/alerts\#required-alert-parameters)  Required and Recommended Parameters

Queries used for line or stacked bar chart alerts **must** include an interval parameter or macro (`{intervalSeconds:Int64}`, `{intervalMilliseconds:Int64}`, `$__timeInterval(col)`, or `$__timeInterval_ms(col)`). During alert execution, it will be replaced with the alert’s configured period.Queries used for alerts **should** include a time range filter (`{startDateMilliseconds:Int64}` and `{endDateMilliseconds:Int64}`, or `$__timeFilter(col)`, etc.). Regardless of whether a time range filter is present in the query, the alert query will run on the alert’s configured period. If there is no time range filter, then the query will read the entire time range available in the source table during each execution.

**Alert Time Range**Typically, alert queries are executed once per interval. However, if one or more intervals are skipped due to errors or slow queries, the following execution will use a time range that includes the missed intervals. In this case, the query’s interval parameters would still be set to the alert’s configured period, but the time range parameters would reflect the longer time range.

### [​](https://clickhouse.com/docs/clickstack/features/alerts\#example-queries)  Example alert queries

#### [​](https://clickhouse.com/docs/clickstack/features/alerts\#example-error-rate)  Error rate per service (time-series)

Alert when any service has an error rate above 5%, with at least 10 requests in the alert period to avoid noisy alerts on low-traffic services.

```
WITH error_rates AS (
  SELECT
    $__timeInterval(Timestamp) as ts,
    ServiceName,
    countIf (SpanKind = 'Server') as request_count,
    countIf (
      SpanKind = 'Server'
      and StatusCode = 'Error'
    ) as error_count,
    error_count / request_count * 100 AS error_percent
  FROM $__sourceTable
  WHERE $__timeFilter(Timestamp)
  GROUP BY ts, ServiceName
)
SELECT ts, ServiceName, error_percent
FROM error_rates
WHERE request_count > 10
```

**Display type**: Line or Stacked Bar
**Threshold**: `>= 5` (fires when error rate reaches 5%)In this query, `ServiceName` is a non-numeric, non-timestamp column, so each service is tracked as a separate alert group. The alert fires independently per service.

#### [​](https://clickhouse.com/docs/clickstack/features/alerts\#example-anomaly-detection)  Anomaly detection with lagging average (time-series)

Alert on excess error counts that exceed a rolling average by more than two standard deviations. This catches spikes relative to recent baseline behavior rather than a fixed threshold.

```
WITH buckets AS (
  SELECT
    $__timeInterval(Timestamp) AS ts,
    count() AS bucket_count
  FROM $__sourceTable
  WHERE TimestampTime >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
        - toIntervalSecond($__interval_s * 30) -- Fetch 30 intervals back
    AND TimestampTime < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
    AND SeverityText = 'error'
  GROUP BY ts
  ORDER BY ts
  WITH FILL
    FROM toDateTime(fromUnixTimestamp64Milli({startDateMilliseconds:Int64}))
    TO toDateTime(fromUnixTimestamp64Milli({endDateMilliseconds:Int64}))
    STEP toIntervalSecond($__interval_s)
),

anomaly_detection AS (
  SELECT
    ts,
    bucket_count,
    avg(bucket_count) OVER (
      ORDER BY ts ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
    ) AS previous_30_avg,
    stddevPop(bucket_count) OVER (
      ORDER BY ts ROWS BETWEEN 30 PRECEDING AND 1 PRECEDING
    ) AS previous_30_stddev,
    greatest(
      bucket_count - (previous_30_avg + 2 * previous_30_stddev), 0
    ) AS excess_error_count
  FROM buckets
)

SELECT ts, excess_error_count
FROM anomaly_detection
WHERE ts >= fromUnixTimestamp64Milli({startDateMilliseconds:Int64})
  AND ts < fromUnixTimestamp64Milli({endDateMilliseconds:Int64})
```

**Display type**: Line
**Threshold**: `> 0` (fires when excess errors above the rolling baseline are detected)Note that the query fetches 30 intervals _before_ the start of the date range to seed the rolling window calculations, then filters the final output to only the evaluation window.

## [​](https://clickhouse.com/docs/clickstack/features/alerts\#common-alert-scenarios)  Common alert scenarios

Here are a few common alert scenarios you can use HyperDX for:**Errors:** We recommend setting up alerts for the default
`All Error Events` and `HTTP Status >= 400` saved searches to be notified when
excess errors occur.**Slow Operations:** You can set up a search for slow operations (e.g.,
`duration:>5000`) and then alert when there are too many slow operations
occurring.**User Events:** You can also set up alerts for customer-facing teams to be
notified when new users sign up or a critical user action is performed.

Last modified on July 10, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/clickstack/features/alerts.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Fclickstack%2Ffeatures%2Falerts)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**