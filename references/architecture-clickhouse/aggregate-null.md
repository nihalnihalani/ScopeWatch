> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/reference/functions/aggregate-functions#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=2fbd2c57-b764-4542-899d-069fc22a4f44&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=2fbd2c57-b764-4542-899d-069fc22a4f44&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions)

Aggregate functions work in the [normal](http://www.sql-tutorial.com/sql-aggregate-functions-sql-tutorial) way as expected by database experts.ClickHouse also supports:

- [Parametric aggregate functions](https://clickhouse.com/docs/reference/functions/aggregate-functions/parametric-functions), which accept other parameters in addition to columns.
- [Combinators](https://clickhouse.com/docs/reference/functions/aggregate-functions/combinators), which change the behavior of aggregate functions.

## [​](https://clickhouse.com/docs/reference/functions/aggregate-functions\#null-processing)  NULL processing

During aggregation, all `NULL` arguments are skipped. If the aggregation has several arguments it will ignore any row in which one or more of them are NULL.There is an exception to this rule, which are the functions [`first_value`](https://clickhouse.com/docs/reference/functions/aggregate-functions/first_value), [`last_value`](https://clickhouse.com/docs/reference/functions/aggregate-functions/last_value) and their aliases (`any` and `anyLast` respectively) when followed by the modifier `RESPECT NULLS`. For example, `FIRST_VALUE(b) RESPECT NULLS`.**Examples:**Consider this table:

```
┌─x─┬────y─┐
│ 1 │    2 │
│ 2 │ ᴺᵁᴸᴸ │
│ 3 │    2 │
│ 3 │    3 │
│ 3 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

Let’s say you need to total the values in the `y` column:

```
SELECT sum(y) FROM t_null_big
```

```
┌─sum(y)─┐
│      7 │
└────────┘
```

Now you can use the `groupArray` function to create an array from the `y` column:

```
SELECT groupArray(y) FROM t_null_big
```

```
┌─groupArray(y)─┐
│ [2,2,3]       │
└───────────────┘
```

`groupArray` does not include `NULL` in the resulting array.You can use [COALESCE](https://clickhouse.com/docs/reference/functions/regular-functions/functions-for-nulls#coalesce) to change NULL into a value that makes sense in your use case. For example: `avg(COALESCE(column, 0))` with use the column value in the aggregation or zero if NULL:

```
SELECT
    avg(y),
    avg(coalesce(y, 0))
FROM t_null_big
```

```
┌─────────────avg(y)─┬─avg(coalesce(y, 0))─┐
│ 2.3333333333333335 │                 1.4 │
└────────────────────┴─────────────────────┘
```

Also you can use [Tuple](https://clickhouse.com/docs/reference/data-types/tuple) to work around NULL skipping behavior. A `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won’t skip that row because of that `NULL` value.

```
SELECT
    groupArray(y),
    groupArray(tuple(y)).1
FROM t_null_big;

┌─groupArray(y)─┬─tupleElement(groupArray(tuple(y)), 1)─┐
│ [2,2,3]       │ [2,NULL,2,3,NULL]                     │
└───────────────┴───────────────────────────────────────┘
```

Note that aggregations are skipped when the columns are used as arguments to an aggregated function. For example [`count`](https://clickhouse.com/docs/reference/functions/aggregate-functions/count) without parameters (`count()`) or with constant ones (`count(1)`) will count all rows in the block (independently of the value of the GROUP BY column as it’s not an argument), while `count(column)` will only return the number of rows where column is not NULL.

```
SELECT
    v,
    count(1),
    count(v)
FROM
(
    SELECT if(number < 10, NULL, number % 3) AS v
    FROM numbers(15)
)
GROUP BY v

┌────v─┬─count()─┬─count(v)─┐
│ ᴺᵁᴸᴸ │      10 │        0 │
│    0 │       1 │        1 │
│    1 │       2 │        2 │
│    2 │       2 │        2 │
└──────┴─────────┴──────────┘
```

And here is an example of first\_value with `RESPECT NULLS` where we can see that NULL inputs are respected and it will return the first value read, whether it’s NULL or not:

```
SELECT
    col || '_' || ((col + 1) * 5 - 1) AS range,
    first_value(odd_or_null) AS first,
    first_value(odd_or_null) IGNORE NULLS as first_ignore_null,
    first_value(odd_or_null) RESPECT NULLS as first_respect_nulls
FROM
(
    SELECT
        intDiv(number, 5) AS col,
        if(number % 2 == 0, NULL, number) AS odd_or_null
    FROM numbers(15)
)
GROUP BY col
ORDER BY col

┌─range─┬─first─┬─first_ignore_null─┬─first_respect_nulls─┐
│ 0_4   │     1 │                 1 │                ᴺᵁᴸᴸ │
│ 1_9   │     5 │                 5 │                   5 │
│ 2_14  │    11 │                11 │                ᴺᵁᴸᴸ │
└───────┴───────┴───────────────────┴─────────────────────┘
```

Last modified on July 23, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/reference/functions/aggregate-functions/index.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Freference%2Ffunctions%2Faggregate-functions)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~