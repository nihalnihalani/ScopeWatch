> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/reference/functions/aggregate-functions/any#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=cdcf6a5f-78a1-43f0-ac6e-5768cb4cc978&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2Fany&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2Fany) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=cdcf6a5f-78a1-43f0-ac6e-5768cb4cc978&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2Fany&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2Fany)

## [​](https://clickhouse.com/docs/reference/functions/aggregate-functions/any\#any)  any

Introduced in: v1.1.0Selects the first encountered value of a column.

As a query can be executed in arbitrary order, the result of this function is non-deterministic. If you need an arbitrary but deterministic result, use functions min or max.

By default, the function never returns NULL, i.e. ignores NULL values in the input column.
However, if the function is used with the `RESPECT NULLS` modifier, it returns the first value reads no matter if NULL or not.**Implementation details**In some cases, you can rely on the order of execution.
This applies to cases when `SELECT` comes from a subquery that uses `ORDER BY`.When a `SELECT` query has the `GROUP BY` clause or at least one aggregate function, ClickHouse (in contrast to MySQL) requires that all expressions in the `SELECT`, `HAVING`, and `ORDER BY` clauses be calculated from keys or from aggregate functions.
In other words, each column selected from the table must be used either in keys or inside aggregate functions.
To get behavior like in MySQL, you can put the other columns in the `any` aggregate function.

The return type of the function is the same as the input, except for LowCardinality which is discarded.
This means that given no rows as input it will return the default value of that type (0 for integers, or Null for a Nullable() column).
You might use the -OrNull combinator to modify this behaviour.

**Syntax**

```
any(column)[ RESPECT NULLS]
```

**Aliases**: `any_value`, `first_value`**Arguments**

- `column` — The column name. [`Any`](https://clickhouse.com/docs/reference/data-types/index)

**Returned value**Returns the first value encountered.
[`Any`](https://clickhouse.com/docs/reference/data-types/index)**Examples****Usage example**

Query

```
CREATE TABLE tab (city Nullable(String)) ENGINE=Memory;
INSERT INTO tab (city) VALUES (NULL), ('Amsterdam'), ('New York'), ('Tokyo'), ('Valencia'), (NULL);
SELECT any(city), anyRespectNulls(city) FROM tab;
```

Response

```
┌─any(city)─┬─anyRespectNulls(city)─┐
│ Amsterdam │ ᴺᵁᴸᴸ                  │
└───────────┴───────────────────────┘
```

Last modified on July 19, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/reference/functions/aggregate-functions/any.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Freference%2Ffunctions%2Faggregate-functions%2Fany)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**