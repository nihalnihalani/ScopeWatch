---
source_url: "https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact"
title: "uniqExact"
observed_on: "2026-10-09"
publication_date: null
collection: "fresh-firecrawl"
capture_origin: ".firecrawl/scopewatch-kb/clickhouse/uniqexact-canonical-capture.json"
---

> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=4d7b2191-0692-473e-be6c-8be3949218c4&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FuniqExact&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FuniqExact) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=4d7b2191-0692-473e-be6c-8be3949218c4&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FuniqExact&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FuniqExact)

## [​](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact\#uniqExact)  uniqExact

Introduced in: v1.1.0Calculates the exact number of different argument values.

The `uniqExact` function uses more memory than `uniq`, because the size of the state has unbounded growth as the number of different values increases.
Use the `uniqExact` function if you absolutely need an exact result.
Otherwise use the [`uniq`](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniq) function.

**Syntax**

```
uniqExact(x[, ...])
```

**Arguments**

- `x` — The function takes a variable number of parameters. [`Tuple(T)`](https://clickhouse.com/docs/reference/data-types/tuple) or [`Array(T)`](https://clickhouse.com/docs/reference/data-types/array) or [`Date`](https://clickhouse.com/docs/reference/data-types/date) or [`DateTime`](https://clickhouse.com/docs/reference/data-types/datetime) or [`String`](https://clickhouse.com/docs/reference/data-types/string) or [`(U)Int*`](https://clickhouse.com/docs/reference/data-types/int-uint) or [`Float*`](https://clickhouse.com/docs/reference/data-types/float) or [`Decimal`](https://clickhouse.com/docs/reference/data-types/decimal)

**Returned value**Returns the exact number of different argument values as a UInt64. [`UInt64`](https://clickhouse.com/docs/reference/data-types/int-uint)**Examples****Basic usage**

Query

```
CREATE TABLE example_data
(
    id UInt32,
    category String
)
ENGINE = Memory;

INSERT INTO example_data VALUES
(1, 'A'), (2, 'B'), (3, 'A'), (4, 'C'), (5, 'B'), (6, 'A');

SELECT uniqExact(category) as exact_unique_categories
FROM example_data;
```

Response

```
┌─exact_unique_categories─┐
│                       3 │
└─────────────────────────┘
```

**Multiple arguments**

Query

```
SELECT uniqExact(id, category) as exact_unique_combinations
FROM example_data;
```

Response

```
┌─exact_unique_combinations─┐
│                         6 │
└───────────────────────────┘
```

**See Also**

- [uniq](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniq)
- [uniqCombined](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqCombined)
- [uniqHLL12](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqHLL12)
- [uniqTheta](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqthetasketch)

Last modified on July 19, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/reference/functions/aggregate-functions/uniqExact.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Freference%2Ffunctions%2Faggregate-functions%2FuniqExact)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**