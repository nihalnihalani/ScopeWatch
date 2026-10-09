> ## Documentation Index
>
> Fetch the complete documentation index at: [/docs/llms.txt](https://clickhouse.com/docs/llms.txt)
>
> Use this file to discover all available pages before exploring further.

[Skip to main content](https://clickhouse.com/docs/reference/functions/aggregate-functions/groupUniqArray#content-area)

[Home](https://clickhouse.com/docs)
Database

Solutions

Integrations

Resources

[50.3k](https://github.com/ClickHouse/ClickHouse) [Sign in](https://console.clickhouse.cloud/signIn?loc=docs-nav-signIn-cta&glxid=642b0691-b017-473d-a81f-c18def62d9fb&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FgroupUniqArray&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FgroupUniqArray) [Get Started](https://clickhouse.cloud/signUp?loc=docs-nav-signUp-cta&glxid=642b0691-b017-473d-a81f-c18def62d9fb&pagePath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FgroupUniqArray&origPath=%2Fdocs%2Freference%2Ffunctions%2Faggregate-functions%2FgroupUniqArray)

## [​](https://clickhouse.com/docs/reference/functions/aggregate-functions/groupUniqArray\#groupUniqArray)  groupUniqArray

Introduced in: v1.1.0Creates an array from different argument values.
The memory consumption of this function is the same as for the [`uniqExact`](https://clickhouse.com/docs/reference/functions/aggregate-functions/uniqExact) function.**Syntax**

```
groupUniqArray(x)
groupUniqArray(max_size)(x)
```

**Parameters**

- `max_size` — Limits the size of the resulting array to `max_size` elements. `groupUniqArray(1)(x)` is equivalent to `[any(x)]`. [`UInt64`](https://clickhouse.com/docs/reference/data-types/int-uint)

**Arguments**

- `x` — Expression. [`Any`](https://clickhouse.com/docs/reference/data-types/index)

**Returned value**Returns an array of unique values. [`Array`](https://clickhouse.com/docs/reference/data-types/array)**Examples****Usage example**

Query

```
CREATE TABLE t (x UInt8) ENGINE = Memory;
INSERT INTO t VALUES (1), (2), (1), (3), (2), (4);

SELECT groupUniqArray(x) FROM t;
```

Response

```
┌─groupUniqArray(x)─┐
│ [1,2,3,4]         │
└───────────────────┘
```

**With max\_size parameter**

Query

```
SELECT groupUniqArray(2)(x) FROM t;
```

Response

```
┌─groupUniqArray(2)(x)─┐
│ [1,2]                │
└──────────────────────┘
```

Last modified on September 2, 2026

Was this page helpful?

YesNo

[Suggest edits](https://github.com/clickhouse/clickhouse/edit/master/docs/reference/functions/aggregate-functions/groupUniqArray.mdx) [Raise issue](https://github.com/ClickHouse/ClickHouse/issues/new?template=60_documentation-issue.yaml&page=%2Freference%2Ffunctions%2Faggregate-functions%2FgroupUniqArray)

Ctrl+I

Copy pageView as MarkdownDownload PDF![](https://clickhouse.com/docs/images/icons/icon-mcp.svg)Set up the ClickHouse documentation MCP server

ClickHouse terminal~

reCAPTCHA

Recaptcha requires verification.

protected by **reCAPTCHA**