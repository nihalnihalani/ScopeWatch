---
source_url: "https://clickhouse.com/blog/clickhouse-release-26-09"
title: "ClickHouse 26.9 release"
observed_on: "2026-10-09"
publication_date: "2026-09-23"
collection: "fresh-firecrawl"
capture_origin: ".firecrawl/scopewatch-kb/clickhouse/release-26-9-capture.json"
---

[Skip to content](https://clickhouse.com/blog/clickhouse-release-26-09#main)

Collapse the terminal

->Scroll to top

<-Back

- [Blog](https://clickhouse.com/blog)
- /
- [Engineering](https://clickhouse.com/blog?category=engineering)

Copy pageCopied!More actions

- ![View as Markdown](https://clickhouse.com/_next/static/immutable/media/icon-markdown.2-p3ljls89_ww.svg)**View as Markdown** Open this page in Markdown
- ![Open in ChatGPT](https://clickhouse.com/_next/static/immutable/media/icon-chatgpt.0aw932qxrira1.svg)**Open in ChatGPT** Ask questions about this page
- ![Open in Claude](https://clickhouse.com/_next/static/immutable/media/icon-claude.42qslf9ajhpwk.svg)**Open in Claude** Ask questions about this page
- ![Open in v0](https://clickhouse.com/_next/static/immutable/media/icon-v0.0mczhus58alob.svg)**Open in v0** Ask questions about this page

# ClickHouse release 26.9

![neutral avatar 400804ae96](https://clickhouse.com/_next/image?url=%2Fuploads%2Fneutral_avatar_400804ae96_5c370e757b.png&w=96&q=75)

[ClickHouse](https://clickhouse.com/authors/clickhouse)

Sep 23, 2026 · 12 minutes read

September has rolled around, and ClickHouse 26.9 has arrived with another packed collection of new features.

The ClickHouse 26.9 release contains 56 new features 🍁 135 performance optimizations 🍎 and 464 bug fixes 🐿️.

This release brings conditional boundaries for `LIMIT`, incremental refreshes for append-only materialized views, and disk spilling for high-cardinality `DISTINCT` queries.

We’ll also look at time-limited access tokens, faster `min`, `max`, and `count` queries, expanded PromQL support, and several quality-of-life improvements.

## New contributors\#

A special welcome to all the new contributors in 26.9! The growth of ClickHouse's community is humbling, and we are always grateful for the contributions that have made ClickHouse so popular.

Below are the names of the new contributors:

_Aaron Harlap, Actuele AI, Alex Francoeur, Alex Prabhat Bara, AlexF, Anand Kumar Shaw, Anton Kovalenko, Aparajita Pandey, Brandon Pereira, Claude, Denys Stetsenko, Dmitrii Bezrukov, Evandro Leopoldino Gonçalves, Friedrich ten Hagen, George Viamontes, Gülçin Yıldırım Jelinek, Hamza Wasim, Hank Hoffmeier, Héctor Pablos, Itamar Tempelhof, Ivan N. Taranov, Ivan Tkachev, Ivan Tkatchev, Jithin Zachariah, Jordan Bertasso, Jords, Joshua, Juanjo, Kelly Toole, Lucas, Luis Neves, Luís Lizardo, Marat Dulin, Mike Shi, Navneet Kumar, Pablo Francisco Pérez Hidalgo, Paul Annesley, Philip Li, Pratham Nayak, Pratheesh, SamWolfberg, Sankalp Thakur, Sebastian Vercruyssse, Serhiy Bzhezytskyy, Takayuki Enomoto, Thien Phan, Vadim Ilves, XanderYoon, Yongqiang Tian, alexprabhat99, anand-tradesea, aparajita, bakhtiiartashbolotov, cuishuang, jithinzac, kasimtj, key-arg, kyungryun, linsen, maederm, mariahlynnenagy, miao tang, mosya415, ngagejason, sakshichitnis27, sleepingeight, statxc, t, tars, zhanglangning_

Hint: if you’re curious how we generate this list… [here](https://gist.github.com/gingerwizard/5a9a87a39ba93b422d8640d811e269e9).

You can also [view the slides from the presentation](https://presentations.clickhouse.com/2026-release-26.9).

## Arithmetic operations between DateTime and Time\#

### Contributed by Yarik Briukhovetskyi\#

As of ClickHouse 26.9, you can use `Time` values as offsets when adding to or subtracting from `DateTime` values. The result retains the `DateTime` value’s timezone.

Let’s have a look at some simple examples:

```
1SELECT
2    now() AS now,
3    now + toTime('02:00:00'),
4    toTime('04:00:00') + now,
5    now64() AS now64,
6    now64 - toTime('02:00:00'),
7    now64 - toTime64('02:00:00.417', 3)
8FORMAT Vertical;
```

Copy command

```
1Row 1:
2──────
3now:                      2026-09-21 13:49:06
4plus(now, to⋯02:00:00')): 2026-09-21 15:49:06
5plus(toTime(⋯:00'), now): 2026-09-21 17:49:06
6now64:                    2026-09-21 13:49:06.440
7minus(now64,⋯02:00:00')): 2026-09-21 11:49:06.440
8minus(now64,⋯0.417', 3)): 2026-09-21 11:49:06.023
```

Copy command

If the calculation falls outside the range supported by the result type, [`date_time_overflow_behavior`](https://clickhouse.com/docs/reference/settings/formats/date-time#date_time_overflow_behavior) determines whether ClickHouse throws an exception, clamps the result to the nearest boundary, or leaves the overflow unchecked.

The maximum value that we can store in `DateTime` is `2106-02-07 06:28:15`. Let’s see what happens if we add one second to that time:

```
1SELECT
2      toDateTime('2106-02-07 06:28:15', 'UTC')
3      + toTime('00:00:01');
```

Copy command

```
1┌─plus(toDateT⋯00:00:01'))─┐
2│      1970-01-01 00:00:00 │
3└──────────────────────────┘
```

Copy command

It’s overflowed back to the minimum value of `DateTime`, which is expected as the default value of `date_time_overflow_behavior` is `ignore`. But, maybe, we prefer to get an exception if the value overflows:

```
1SELECT toDateTime('2106-02-07 06:28:15', 'UTC') + toTime('00:00:01')
2SETTINGS date_time_overflow_behavior = 'throw';
```

Copy command

```
1Received exception:
2Code: 321. DB::Exception: Value 4294967296 is out of bounds of type DateTime: In scope SELECT toDateTime('2106-02-07 06:28:15', 'UTC') + toTime('00:00:01') SETTINGS date_time_overflow_behavior = 'throw'. (VALUE_IS_OUT_OF_RANGE_OF_DATA_TYPE)
```

Copy command

Or, we can use `saturate`, in which case it will return the maximum value for that type:

```
1SELECT toDateTime('2106-02-07 06:28:10', 'UTC') + toTime('00:00:10')
2SETTINGS date_time_overflow_behavior = 'saturate';
```

Copy command

```
1┌─plus(toDateT⋯00:00:10'))─┐
2│      2106-02-07 06:28:15 │
3└──────────────────────────┘
```

Copy command

Finally, let’s run the timezone of the initial values and the calculated values:

```
1SELECT
2    now() AS now,
3    timezoneOf(now),
4    now + toTime('02:00:00') AS future,
5    timezoneOf(future)
6FORMAT Vertical;
```

Copy command

```
1Row 1:
2──────
3now:                2026-09-21 14:37:21
4timezoneOf(now):    Europe/London
5future:             2026-09-21 16:37:21
6timezoneOf(future): Europe/London
```

Copy command

## PromQL private preview\#

### Contributed by Vitaly Baranov, Nikita Mikhaylov, Valery Petrov, Minh Vu\#

ClickHouse 26.9 expands PromQL support with more functions, additional Prometheus HTTP API endpoints, and direct `SELECT` queries against TimeSeries tables.

PromQL and the TimeSeries table engine are now available in private preview on ClickHouse Cloud, letting you store metrics in ClickHouse and query them from ClickStack, Grafana, clickhouse-client, or SQL.

You can learn more in the [Introducing ClickHouse's new TimeSeries engine](https://clickhouse.com/blog/introducing-promql) blog post.

## CREATE TOKEN\#

### Contributed by Alexey Milovidov\#

ClickHouse 26.9 introduces [CREATE TOKEN](https://github.com/ClickHouse/ClickHouse/pull/116957), which lets a user create a time-limited credential for applications, scripts, CI jobs, and agents without exposing or replacing their main password.

The token can be restricted to a subset of a user’s existing privileges, reducing the impact of a leaked credential.

Let’s see how it works. First, we’ll create a small table:

```
1CREATE TABLE ourTable
2(
3    id UInt8
4);
5
6INSERT INTO ourTable VALUES (1);
```

Copy command

Next, let’s create a user called `alexey`:

```
1CREATE USER alexey IDENTIFIED WITH sha256_password BY 'main-password';
2GRANT SELECT, INSERT ON ourTable TO alexey;
3GRANT CREATE TOKEN ON *.* TO alexey;
```

Copy command

`alexey` has `SELECT` and `INSERT` power on this table, and can also create a token for himself.

Next, we’ll connect as `alexey` and create a token that lasts for 30 days and can only run `SELECT` queries against `ourTable`:

```
1CREATE TOKEN
2VALID FOR INTERVAL 30 DAY
3GRANTS (SELECT ON ourTable);
```

Copy command

The statement returns the generated token and its expiry:

```
1┌─token────────────────────────────┬─────────valid_until─┐
2│ NXuRnBywn4HcHCIyBWC2WHT2Cfn4xQLb │ 2026-10-21 15:07:57 │
3└──────────────────────────────────┴─────────────────────┘
```

Copy command

ClickHouse displays the token only once, so make sure you copy it down.

We can then connect with the token and run a `SELECT` query:

```
1./clickhouse client \
2--user alexey \
3--password 'NXuRnBywn4HcHCIyBWC2WHT2Cfn4xQLb' \
4--query "SELECT * FROM ourTable"
```

Copy command

```
11
```

Copy command

That works fine, just as we expected. But what about if we try to insert into the table using our token?

```
1./clickhouse client \
2--user alexey \
3--password 'NXuRnBywn4HcHCIyBWC2WHT2Cfn4xQLb' \
4--query "INSERT INTO ourTable VALUES (2)"
```

Copy command

```
1Code: 497. DB::Exception: alexey: Not enough privileges. To execute this query, it's necessary to have the grant INSERT(id) ON db.`table`. (ACCESS_DENIED)
```

Copy command

That doesn’t work as `alexey` only has `SELECT` access when authenticated using the token.

A token never grants more privileges than the user already has, and it stops working when it expires or if the user is removed. If you don’t provide a `VALID UNTIL` or `VALID FOR`, the default lifetime is 30 minutes.

## LIMIT with boundary conditions\#

### Contributed by Zakhar Kravchuk and Nihal Miaji\#

ClickHouse 26.9 extends `LIMIT` with boundary conditions that start and stop output based on values in the ordered result stream, a capability that, to our knowledge, is not currently available in any other database.

- `AFTER` includes the row that matches its condition.
- `UNTIL` stops before its matching row
- You can add `ALL` to apply the boundary each time the condition matches.

Try the different combinations below to see which rows each query returns.

This functionality is particularly useful for analyzing log data, so let’s explore an Nginx dataset used in the [Compressing nginx logs 170x with column storage](https://clickhouse.com/blog/log-compression-170x) blog post.

First, let’s create a table:

```
1CREATE TABLE nginx_logs
2(
3    timestamp DateTime,
4    ip String,
5    method LowCardinality(String),
6    path String,
7    status UInt16,
8    response_bytes UInt64,
9    referer String,
10    user_agent String
11)
12ENGINE = MergeTree
13ORDER BY (timestamp, ip, path);
```

Copy command

Next, we’ll ingest the data:

```
1INSERT INTO nginx_logs
2WITH extractGroups(
3    line,
4    '^(\\S+) - \\S+ \\[([^\\]]+)\\] "(\\S+) (.*) [^ ]+" (\\d+) (\\d+) "([^"]*)" "(.*)"$'
5) AS fields
6SELECT
7    assumeNotNull(parseDateTimeBestEffortOrNull(fields[2])) AS timestamp,
8    fields[1] AS ip,
9    fields[3] AS method,
10    fields[4] AS path,
11    toUInt16(fields[5]) AS status,
12    toUInt64(fields[6]) AS response_bytes,
13    fields[7] AS referer,
14    fields[8] AS user_agent
15FROM s3(
16    'https://datasets-documentation.s3.eu-west-3.amazonaws.com/http_logs/nginx-66.log.gz',
17    LineAsString
18)
19WHERE length(fields) = 8
20  AND parseDateTimeBestEffortOrNull(fields[2]) IS NOT NULL;
```

Copy command

Now, let’s get a quick overview of the data.

```
1SELECT
2    count() AS rows,
3    min(timestamp) AS first_timestamp,
4    max(timestamp) AS last_timestamp,
5    countIf(status >= 500) AS server_errors
6FROM nginx_logs;
```

Copy command

```
1Row 1:
2──────
3rows:            66514081 -- 66.51 million
4first_timestamp: 2019-01-24 00:00:00
5last_timestamp:  2019-02-24 00:00:00
6server_errors:   69857
```

Copy command

The following query starts at the first \`5xx\` response and returns five requests. `AFTER` is inclusive, so the request that satisfies the condition is included.

```
1SELECT timestamp, path, status
2FROM nginx_logs
3WHERE ip = '91.243.160.31'
4  AND timestamp >= '2019-01-24 00:00:00'
5  AND timestamp < '2019-02-03 00:00:00'
6ORDER BY timestamp, ip, path, method, status, response_bytes
7LIMIT 5 AFTER status >= 500;
```

Copy command

```
1┌───────────timestamp─┬─path─────────────────────────────────────────────────────────┬─status─┐
2│ 2019-01-24 06:54:01 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
3│ 2019-01-24 06:54:02 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
4│ 2019-01-24 06:54:06 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
5│ 2019-01-24 06:54:15 │ /product/552/1168/مایکروفر-رومیزی-ال-جی-مدل-MS93SCR          │    200 │
6│ 2019-01-24 06:54:16 │ /image/552/product/50x50                                     │    200 │
7└─────────────────────┴──────────────────────────────────────────────────────────────┴────────┘
```

Copy command

`UNTIL` is exclusive. This query starts at the first server error and stops before the first response with a status below `500`:

```
1SELECT timestamp, path, status
2FROM nginx_logs
3WHERE ip = '91.243.160.31'
4  AND timestamp >= '2019-01-24 00:00:00'
5  AND timestamp < '2019-02-03 00:00:00'
6ORDER BY timestamp, ip, path, method, status, response_bytes
7LIMIT 100
8    AFTER status >= 500
9    UNTIL status < 500;
```

Copy command

```
1┌───────────timestamp─┬─path─────────────────────────────────────────────────────────┬─status─┐
2│ 2019-01-24 06:54:01 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
3│ 2019-01-24 06:54:02 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
4│ 2019-01-24 06:54:06 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
5└─────────────────────┴──────────────────────────────────────────────────────────────┴────────┘
```

Copy command

An `AFTER` boundary is applied only once, unless we use `ALL`, which reapplies it whenever another row matches. This query returns every server error and the next two requests after it:

```
1SELECT timestamp, path, status
2FROM nginx_logs
3WHERE ip = '91.243.160.31'
4  AND timestamp >= '2019-01-24 00:00:00'
5  AND timestamp < '2019-02-03 00:00:00'
6ORDER BY timestamp, ip, path, method, status, response_bytes
7LIMIT 3 AFTER status >= 500 ALL;
```

Copy command

```
1┌───────────timestamp─┬─path─────────────────────────────────────────────────────────┬─status─┐
2│ 2019-01-24 06:54:01 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
3│ 2019-01-24 06:54:02 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
4│ 2019-01-24 06:54:06 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
5│ 2019-01-24 06:54:15 │ /product/552/1168/مایکروفر-رومیزی-ال-جی-مدل-MS93SCR          │    200 │
6│ 2019-01-24 06:54:16 │ /image/552/product/50x50                                     │    200 │
7│ 2019-01-28 23:27:00 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
8│ 2019-01-28 23:27:01 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
9│ 2019-01-28 23:27:05 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
10│ 2019-01-28 23:27:14 │ /product/552/1168/مایکروفر-رومیزی-ال-جی-مدل-MS93SCR          │    200 │
11│ 2019-01-28 23:27:15 │ /image/552/product/50x50                                     │    200 │
12│ 2019-02-02 13:43:29 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
13│ 2019-02-02 13:43:30 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
14│ 2019-02-02 13:43:34 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
15│ 2019-02-02 13:43:43 │ /product/552/1168/مایکروفر-رومیزی-ال-جی-مدل-MS93SCR          │    200 │
16│ 2019-02-02 13:43:44 │ /image/552/product/50x50                                     │    200 │
17└─────────────────────┴──────────────────────────────────────────────────────────────┴────────┘
```

Copy command

There are three separate incidents in this period, on rows 2, 7, and 12. Within each burst, every 500 responses reapplies the three-row boundary.

The consecutive failures therefore, extend the active window until two consecutive non-5xx requests occur after the final failure. In this example, both are successful 200 responses.

`ALL` can also reapply the starting boundary while `UNTIL` terminates each range:

```
1SELECT timestamp, path, status
2FROM nginx_logs
3WHERE ip = '91.243.160.31'
4  AND timestamp >= '2019-01-24 00:00:00'
5  AND timestamp < '2019-02-03 00:00:00'
6ORDER BY timestamp, ip, path, method, status, response_bytes
7LIMIT 100
8    AFTER status >= 500 ALL
9    UNTIL status < 500;
```

Copy command

```
1┌───────────timestamp─┬─path─────────────────────────────────────────────────────────┬─status─┐
2│ 2019-01-24 06:54:01 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
3│ 2019-01-24 06:54:02 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
4│ 2019-01-24 06:54:06 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
5│ 2019-01-28 23:27:00 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
6│ 2019-01-28 23:27:01 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
7│ 2019-01-28 23:27:05 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
8│ 2019-02-02 13:43:29 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
9│ 2019-02-02 13:43:30 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
10│ 2019-02-02 13:43:34 │ /product/28579/57435/اجاق-گاز-صفحه-ای-داتیس-مدل-DG-503-Ultra │    500 │
11└─────────────────────┴──────────────────────────────────────────────────────────────┴────────┘
```

Copy command

Unlike the previous query, this output excludes the successful requests after each failure burst. `UNTIL` closes the range at the first non-5xx response, while `ALL` continues scanning for the next burst.

## Incremental refreshable materialized views\#

### Contributed by Smita Kulkarni\#

ClickHouse 26.9 adds `APPEND INCREMENTAL` to [refreshable materialized views](https://clickhouse.com/docs/concepts/features/materialized-views/refreshable-materialized-view). Instead of scanning the entire source table on every refresh, ClickHouse processes only the rows committed since the previous refresh.

This can be used to incrementally copy append-only data into another ClickHouse table or replicate an event stream from a MergeTree table into an Iceberg data lake.

Let’s have a look at how to use this feature with Iceberg.

We’ll create an append-only stream of order events in ClickHouse and periodically copy them into an Iceberg table, demonstrating that each refresh processes only newly committed rows.

First, we’ll create our ClickHouse table:

```
1CREATE TABLE order_events
2(
3    event_id UInt64,
4    event_time DateTime,
5    order_id UInt64,
6    event_type LowCardinality(String),
7    country LowCardinality(String),
8    amount Decimal(10, 2)
9)
10ORDER BY (event_time, order_id, event_id)
11SETTINGS
12    enable_block_number_column = 1,
13    enable_block_offset_column = 1,
14    add_minmax_index_for_block_number_column = 1,
15    add_minmax_index_for_block_offset_column = 1,
16    part_minmax_index_columns = 'with_block_number_offset';
```

Copy command

The block-number and block-offset columns provide the cursor that ClickHouse uses to identify rows committed after the previous refresh.

Next, we’ll enable Iceberg inserts and create an Iceberg table on my local filesystem:

```
1SET allow_insert_into_iceberg = 1;
2CREATE TABLE lake_order_events
3(
4    event_id UInt64,
5    event_time DateTime,
6    order_id UInt64,
7    event_type String,
8    country String,
9    amount Decimal(10, 2)
10)
11ENGINE = IcebergLocal('lake_order_events', 'Parquet');
```

Copy command

The `lake_order_events` directory contains the Iceberg metadata, manifests, and Parquet data files.

Finally, we’ll create a materialized view that will copy the newly committed events to Iceberg every hour:

```
1CREATE MATERIALIZED VIEW order_events_to_iceberg
2REFRESH EVERY 1 HOUR APPEND INCREMENTAL
3TO lake_order_events
4AS
5SELECT event_id, event_time, order_id, event_type, country, amount
6FROM order_events;
```

Copy command

Time to ingest some data!

```
1INSERT INTO order_events VALUES
2    (1, '2026-09-22 09:05:00', 1001, 'placed', 'UK',       0),
3    (2, '2026-09-22 09:17:00', 1002, 'placed', 'Germany',  0),
4    (3, '2026-09-22 09:20:00', 1001, 'paid',   'UK',      89.99),
5    (4, '2026-09-22 09:31:00', 1002, 'paid',   'Germany', 129.00);
```

Copy command

These events will be copied across to the Iceberg table when the materialized view triggers each hour, but to speed things up, we’ll trigger a refresh:

```
1SYSTEM REFRESH VIEW order_events_to_iceberg;
2SYSTEM WAIT VIEW order_events_to_iceberg;
```

Copy command

And, if we query the Iceberg table:

```
1SELECT * FROM lake_order_events;
```

Copy command

```
1┌─event_id─┬─────────────────event_time─┬─order_id─┬─event_type─┬─country─┬─amount─┐
2│        1 │ 2026-09-22 09:05:00.000000 │     1001 │ placed     │ UK      │      0 │
3│        2 │ 2026-09-22 09:17:00.000000 │     1002 │ placed     │ Germany │      0 │
4│        3 │ 2026-09-22 09:20:00.000000 │     1001 │ paid       │ UK      │  89.99 │
5│        4 │ 2026-09-22 09:31:00.000000 │     1002 │ paid       │ Germany │    129 │
6└──────────┴────────────────────────────┴──────────┴────────────┴─────────┴────────┘
```

Copy command

All the records have made their way across. Next, let’s add some more rows to simulate changes to those orders:

```
1INSERT INTO order_events VALUES
2    (5, '2026-09-22 10:03:00', 1001, 'shipped',  'UK',        0),
3    (6, '2026-09-22 10:11:00', 1002, 'refunded', 'Germany', -129.00),
4    (7, '2026-09-22 10:28:00', 1003, 'placed',   'France',     0);
```

Copy command

We’ll manually refresh the materialized view again and then query the Iceberg table again:

```
1┌─event_id─┬─────────────────event_time─┬─order_id─┬─event_type─┬─country─┬─amount─┐
2│        1 │ 2026-09-22 09:05:00.000000 │     1001 │ placed     │ UK      │      0 │
3│        2 │ 2026-09-22 09:17:00.000000 │     1002 │ placed     │ Germany │      0 │
4│        3 │ 2026-09-22 09:20:00.000000 │     1001 │ paid       │ UK      │  89.99 │
5│        4 │ 2026-09-22 09:31:00.000000 │     1002 │ paid       │ Germany │    129 │
6│        5 │ 2026-09-22 10:03:00.000000 │     1001 │ shipped    │ UK      │      0 │
7│        6 │ 2026-09-22 10:11:00.000000 │     1002 │ refunded   │ Germany │   -129 │
8│        7 │ 2026-09-22 10:28:00.000000 │     1003 │ placed     │ France  │      0 │
9└──────────┴────────────────────────────┴──────────┴────────────┴─────────┴────────┘
```

Copy command

We can see the three new events are there.

For an Iceberg target, ClickHouse stores the incremental cursor in the snapshot summary. The cursor and newly appended data are therefore committed as part of the same Iceberg snapshot. We can query `system.iceberg_history` to see this:

```
1SELECT
2    made_current_at, operation,
3    summary['added-records'] AS added_records,
4    summary['total-records'] AS total_records,
5    summary['total-data-files'] AS total_data_files,
6    summary['clickhouse.refresh-cursor'] != '' AS has_refresh_cursor
7FROM system.iceberg_history
8WHERE table = 'lake_order_events'
9ORDER BY made_current_at;
```

Copy command

```
1┌─────────made_current_at─┬─operation─┬─added_records─┬─total_records─┬─total_data_files─┬─has_refresh_cursor─┐
2│ 2026-09-22 11:03:47.549 │ APPEND    │ 4             │ 4             │ 1                │                  1 │
3│ 2026-09-22 11:04:36.247 │ APPEND    │ 3             │ 7             │ 2                │                  1 │
4└─────────────────────────┴───────────┴───────────────┴───────────────┴──────────────────┴────────────────────┘
```

Copy command

The first refresh added four records, while the second added only the three new events, taking the total from four to seven. We can also see that both snapshots contain a refresh cursor.

ClickHouse stores this cursor in the Iceberg snapshot alongside the newly appended data. If ClickHouse restarts, the next refresh resumes from that position instead of replaying the same events. The cursor only advances when the append succeeds, so it always stays in sync with the data.

This approach works best with append-only data, such as events, logs, audit records, and other immutable facts.

## min, max, and count from column statistics\#

### Contributed by Alexey Milovidov\#

ClickHouse stores minimum and maximum values for numeric-like columns in each data part. As of 26.9, it can use those statistics to answer min, max, and count queries without reading the underlying column data.

Let’s try it with the Nginx logs table that we used earlier. We’ll use `response_bytes` rather than `timestamp`. Since `timestamp` is the first column in the table’s sorting key, ClickHouse can already answer that query from existing metadata.

We'll prefix our query with `EXPLAIN` so that we can see the query plan:

```
1EXPLAIN
2SELECT
3    min(response_bytes),
4    max(response_bytes),
5    count()
6FROM nginx_logs;
```

Copy command

```
1┌─explain──────────────────────────────────────────────────────────┐
2│ Output: min(response_bytes), max(response_bytes), count()        │
3│                                                                  │
4│ Aggregating                                                      │
5│ │  Keys:                                                         │
6│ │  Aggregates: min(response_bytes), max(response_bytes), count() │
7│ │  Skip merging: 0                                               │
8│ └──ReadFromPreparedSource (_statistics_min_max_projection)       │
9└──────────────────────────────────────────────────────────────────┘
```

Copy command

If we look at the last line, we can see that instead of reading the `response_bytes` column, ClickHouse prepares the result from its column statistics.

We can disable this optimization using the setting `use_statistics_for_min_max_aggregation`, and now ClickHouse has to scan the `response_bytes` column to compute the result, as shown in the following query:

```
1EXPLAIN
2SELECT
3    min(response_bytes),
4    max(response_bytes),
5    count()
6FROM nginx_logs
7SETTINGS use_statistics_for_min_max_aggregation = 0;
```

Copy command

```
1┌─explain──────────────────────────────────────────────────────────┐
2│ Output: min(response_bytes), max(response_bytes), count()        │
3│                                                                  │
4│ Aggregating                                                      │
5│ │  Keys:                                                         │
6│ │  Aggregates: min(response_bytes), max(response_bytes), count() │
7│ │  Skip merging: 0                                               │
8│ └──ReadFromMergeTree (default.nginx_logs)                        │
9│       Read type: Default                                         │
10│       Parts: 5 | Granules: 8122                                  │
11│       Output: response_bytes                                     │
12└──────────────────────────────────────────────────────────────────┘
```

Copy command

## `system.session_query_ids`\#

### Contributed by Vladimir Cherkasov\#

ClickHouse 26.9 introduces a new system table, `system.session_query_ids`, which keeps track of all the query ids in the current session in execution order.

We can query that table like this:

```
1SELECT * FROM system.session_query_ids;
```

Copy command

```
1┌─sequence_number─┬─query_id─────────────────────────────┐
2│               1 │ 8ebdec91-0636-44e7-9d1a-66974c2d0fe3 │
3│               2 │ 471e8bef-2042-4394-9a08-3538f4ebcf85 │
4│               3 │ f9757bd2-8fe3-4b14-b681-8e938a396880 │
5│               4 │ 36903bb2-9f85-420b-b37b-66f0d23ce41e │
6│               5 │ 4127be18-3e58-45f6-8153-5ff9a0d04675 │
7│               6 │ a81309ab-3498-4ba9-9217-8145406a168d │
8└─────────────────┴──────────────────────────────────────┘
```

Copy command

The `system.query_log` table includes a `query_id` per entry, which means we can now check which queries we just ran, without having to manually specify query ids when querying that table:

```
1SELECT query, query_duration_ms FROM system.query_log
2WHERE query_id IN (SELECT query_id FROM system.session_query_ids)
3AND type = 'QueryFinish'
4ORDER BY event_time_microseconds;
```

Copy command

```
1┌─query─────────────────────────────────────────────────────────────┬─query_duration_ms─┐
2│ SELECT * FROM lake_order_events;                                  │                10 │
3│ system flush logs;                                                │                 0 │
4│ SELECT query, query_duration_ms FROM system.query_log            ↴│                 3 │
5│↳WHERE query_id IN (SELECT query_id FROM system.session_query_ids)↴│                   │
6│↳  AND type = 'QueryFinish' ORDER BY event_time_microseconds;      │                   │
7│ SELECT * FROM system.session_query_ids;                           │                 0 │
8│ set output_format_pretty_row_numbers=0;                           │                 0 │
9│ SELECT * FROM system.session_query_ids;                           │                 0 │
10└───────────────────────────────────────────────────────────────────┴───────────────────┘
```

Copy command

## Limits on table size and table count\#

### Contributed by Alexey Milovidov\#

ClickHouse 26.9 lets us put limits on how large an individual table can grow, as well as how many tables can be created in a database.

This is useful for multi-tenant, temporary, and demo environments, where we don’t want one workload to consume everything.

Let’s start by creating a table that can contain a maximum of three rows:

```
1CREATE TABLE limited_events
2(
3    id UInt64,
4    message String
5)
6ENGINE = MergeTree
7ORDER BY id
8SETTINGS max_table_size_rows = 3;
```

Copy command

We’ll insert three rows:

```
1INSERT INTO limited_events VALUES
2    (1, 'started'),
3    (2, 'processing'),
4    (3, 'finished');
```

Copy command

If we insert one more row, it still succeeds:

```
1INSERT INTO limited_events VALUES
2    (4, 'one past limit');
3
4SELECT count()
5FROM limited_events;
```

Copy command

```
1┌─count()─┐
2│       4 │
3└─────────┘
```

Copy command

The limit is checked against the table’s current size when an `INSERT` starts. This means the `INSERT` that takes the table from three to four rows can finish. The next `INSERT` sees that the table is already over the limit and is rejected:

```
1INSERT INTO limited_events VALUES
2    (5, 'rejected');
```

Copy command

```
1Code: 1016. DB::Exception: Table size limit exceeded: the total number of rows in active data parts of table default.limited_events is 4, which exceeds the 'max_table_size_rows' setting value (3). (TABLE_SIZE_LIMIT_EXCEEDED)
```

Copy command

We can also limit a table by its compressed or uncompressed size using `max_table_size_bytes_compressed` and `max_table_size_bytes_uncompressed`.

We can put a limit on the number of tables in a database as well. Let’s create a database that can contain two tables:

```
1CREATE DATABASE tenant
2ENGINE = Atomic
3SETTINGS max_tables = 2;
```

Copy command

We can create the first two tables as usual:

```
1CREATE TABLE tenant.events (id UInt64)
2ENGINE = MergeTree
3ORDER BY id;
4
5CREATE TABLE tenant.users (id UInt64)
6ENGINE = MergeTree
7ORDER BY id;
```

Copy command

But if we try to create a third table, ClickHouse rejects it:

```
1CREATE TABLE tenant.audit_log (id UInt64)
2ENGINE = MergeTree
3ORDER BY id;
```

Copy command

```
1Code: 724. DB::Exception: Too many tables in database `tenant`. The limit (database setting `max_tables`) is set to 2, the current number is 2. (TOO_MANY_TABLES)
```

Copy command

## DISTINCT in external memory\#

### Contributed by Nihal Z. Miaji\#

Conceptually, `DISTINCT` needs to keep track of the values it has already seen. ClickHouse has several optimizations that reduce this work, but a high-cardinality query may still require maintaining a large in-memory set.

ClickHouse 26.9 can spill this hash set to disk, just like `GROUP BY` and `ORDER BY`, instead of allowing it to keep growing until the query runs out of memory.

Let’s see what that looks like by returning all the distinct values in a sequence of 100 million numbers, while using [`max_memory_usage`](https://clickhouse.com/docs/reference/settings/session-settings/max-memory-usage#max_memory_usage) to limit the query to 150 MB of memory:

```
1SELECT DISTINCT number
2FROM numbers_mt(100_000_000)
3FORMAT `NULL`
4SETTINGS max_memory_usage = 150_000_000
```

Copy command

```
1Received exception:
2Code: 241. DB::Exception: Query memory limit exceeded: would use 244.33 MiB (attempt to allocate chunk of 127.00 MiB), maximum: 143.05 MiB: While executing ExternalDistinctTransform. (MEMORY_LIMIT_EXCEEDED)
```

Copy command

It's unable to process the query as there isn't enough memory. We can allow `DISTINCT` to spill its intermediate state to disk by setting [`max_bytes_before_external_distinct`](https://clickhouse.com/docs/reference/settings/session-settings/max-bytes#max_bytes_before_external_distinct):

```
1SELECT DISTINCT number
2FROM numbers_mt(100_000_000)
3FORMAT `NULL`
4SETTINGS
5    max_memory_usage = 150_000_000,
6    max_bytes_before_external_distinct = 25_000_000;
```

Copy command

```
10 rows in set. Elapsed: 1.676 sec. Processed 100.00 million rows, 800.00 MB (59.65 million rows/s., 477.21 MB/s.)
2Peak memory usage: 105.63 MiB.
```

Copy command

This time, ClickHouse starts writing the `DISTINCT` data to temporary files when it reaches around 25 MB. The whole query can use up to 150 MB, leaving enough memory to read and merge those files at the end.

There's one more interesting thing to keep in mind when using this feature. Spilling to disk reduces memory usage, but it doesn't remove the need for memory completely. ClickHouse still needs memory for buffers, the query pipeline, and merging those temporary files that it's spilled to disk.

Let's see what happens if we reduce the overall query limit to 100 MB, while keeping the spill to disk threshold at 25 MB:

```
1SELECT DISTINCT number
2FROM numbers_mt(100_000_000)
3FORMAT `NULL`
4SETTINGS
5    max_memory_usage = 100_000_000,
6    max_bytes_before_external_distinct = 25_000_000;
```

Copy command

```
1Received exception:
2Code: 241. DB::Exception: Query memory limit exceeded: would use 98.94 MiB (attempt to allocate chunk of 4.13 MiB), maximum: 95.37 MiB: While executing BufferingFromFileSource. (MEMORY_LIMIT_EXCEEDED)
```

Copy command

The data has been spilled successfully, but ClickHouse runs out of memory while reading the temporary files back. We can tell from `BufferingFromFileSource` that the failure occurred during processing of the spilled files, rather than during the construction of the original in-memory set.

To fix that, we need to increase `max_memory_usage` back to 150MB.

> ClickHouse automatically enables external `DISTINCT` when [`max_bytes_ratio_before_external_distinct`](https://clickhouse.com/docs/reference/settings/session-settings/max-bytes#max_bytes_ratio_before_external_distinct) is set to `0.5`. This means that `DISTINCT` starts spilling when it reaches half of the memory available.

## Bracket syntax for JSON subcolumns\#

### Contributed by Pavel Kruglov\#

ClickHouse 26.9 adds bracket syntax for accessing paths in a `JSON` value. This makes it easier to write nested paths work with keys that contain characters such as dots or spaces.

Let's have a look at how this works with help from an in-memory example:

```
1WITH '{
2    "user": {"name": "Alex"},
3    "release.version": "26.9",
4    "first name": "Alexey",
5    "tags": ["database", "analytics"]
6}'::JSON AS json
7SELECT
8    json.user.name AS dot_notation,
9    json['user']['name'] AS bracket_notation,
10    json['release.version'] AS release_version,
11    json['first name'] AS first_name;
```

Copy command

```
1┌─dot_notation─┬─bracket_notation─┬─release_version─┬─first_name─┐
2│ Alex         │ Alex             │ 26.9            │ Alexey     │
3└──────────────┴──────────────────┴─────────────────┴────────────┘
```

Copy command

### Get started today

Interested in seeing how ClickHouse works on your data? Get started with ClickHouse Cloud in minutes and receive $300 in free credits.

[Sign up](https://console.clickhouse.cloud/signUp?loc=blog-cta-2268-get-started-today-sign-up&pagePath=%2Fblog%2Fclickhouse-release-26-09&origPath=%2Fblog%2Fclickhouse-release-26-09&utm_ga=GA1.1.1747003606.1791463423)

* * *

Share this post

- Copy URL
- [![Y Combinator icon](https://clickhouse.com/_next/static/immutable/media/ycombinator.37q2g-no9bowl.svg)](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fclickhouse.com%2Fblog%2Fclickhouse-release-26-09 "Share on Y Combinator")
- [![X icon](https://clickhouse.com/_next/static/immutable/media/x.3nm91lx52ia7n.svg)](https://x.com/intent/tweet?text=https%3A%2F%2Fclickhouse.com%2Fblog%2Fclickhouse-release-26-09 "Share on X")
- [![Bluesky icon](https://clickhouse.com/_next/static/immutable/media/bluesky.292c8t8kns7n1.svg)](https://bsky.app/intent/compose?text=https%3A%2F%2Fclickhouse.com%2Fblog%2Fclickhouse-release-26-09 "Share on Bluesky")
- [![Facebook icon](https://clickhouse.com/_next/static/immutable/media/facebook.32ysyflv7kktz.svg)](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fclickhouse.com%2Fblog%2Fclickhouse-release-26-09 "Share on Facebook")
- [![LinkedIn icon](https://clickhouse.com/_next/static/immutable/media/linkedin.37911rnwi-sdg.svg)](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fclickhouse.com%2Fblog%2Fclickhouse-release-26-09 "Share on LinkedIn")

### Subscribe to our newsletter

Stay informed on feature releases, product roadmap, support, and cloud offerings!

Loading form...

## Recent posts

[View all Blogs](https://clickhouse.com/blog)

![why bigquery can t match clickhouse cloud for real time analytics](https://clickhouse.com/_next/image?url=%2Fuploads%2FWhy_Big_Query_can_t_match_Click_House_Cloud_for_real_time_analytics_4baf359921.jpg&w=750&q=75)

Engineering

### [Why BigQuery can’t match ClickHouse Cloud for real-time analytics](https://clickhouse.com/blog/clickhouse-vs-bigquery-real-time-performance-per-dollar)

Tom Schreiber and Lionel Palacin · Oct 8, 2026

![postgres summit us 2026 recap](https://clickhouse.com/_next/image?url=%2Fuploads%2FPostgres_Summit_US_2026_Recap_0a167af52e.png&w=750&q=75)

Community

### [🗽 Postgres Summit US 2026 retrospective](https://clickhouse.com/blog/postgres-summit-us-2026)

David Wheeler · Oct 7, 2026

![why databricks can t match clickhouse cloud for real time analytics](https://clickhouse.com/_next/image?url=%2Fuploads%2FWhy_Databricks_can_t_match_Click_House_Cloud_for_real_time_analytics_670b2e37d1.jpg&w=750&q=75)

Engineering

### [Why Databricks can’t match ClickHouse Cloud for real-time analytics](https://clickhouse.com/blog/clickhouse-vs-databricks-real-time-performance-per-dollar)

Tom Schreiber and Lionel Palacin · Oct 6, 2026

![udfs ga](https://clickhouse.com/_next/image?url=%2Fuploads%2FUD_Fs_GA_3d5009e61d.png&w=750&q=75)

Product

### [Executable UDFs are now generally available on ClickHouse Cloud](https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud)

Francisco Neves, San Tran, Jia Xu, Zach Naimon, Ilya Andreev, Hanzi Jiang and Kevin Zhang · Oct 5, 2026

[View all Blogs](https://clickhouse.com/blog)

## Follow us

[![X](https://clickhouse.com/_next/static/immutable/media/x.3nm91lx52ia7n.svg)](https://x.com/ClickhouseDB "X")[![Bluesky](https://clickhouse.com/_next/static/immutable/media/bluesky.292c8t8kns7n1.svg)](https://bsky.app/profile/clickhouse.com "Bluesky")[![Slack](https://clickhouse.com/_next/static/immutable/media/slack.2_pspehyws_jz.svg)](https://clickhouse.com/slack "Slack")[![Github](https://clickhouse.com/_next/static/immutable/media/github.3ofxqpa2uzt_a.svg)](https://github.com/ClickHouse/ClickHouse "Github")[![Telegram](https://clickhouse.com/_next/static/immutable/media/telegram.0054ol1lpoidb.svg)](https://telegram.me/clickhouse_en "Telegram")[![Meetup](https://clickhouse.com/_next/static/immutable/media/meetup.2tf1x11zaaepo.svg)](https://www.meetup.com/pro/clickhouse "Meetup")[![RSS](https://clickhouse.com/_next/static/immutable/media/rss.1pu3aqlsglh-q.svg)](https://clickhouse.com/rss.xml "RSS")