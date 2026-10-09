---
source_url: "https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud"
title: "Executable UDFs GA"
observed_on: "2026-10-09"
publication_date: "2026-10-05"
collection: "reused-cache"
capture_origin: ".firecrawl/click-guild-clickhouse-udf.md"
---

[Skip to content](https://clickhouse.com/blog/executable-udfs-generally-available-on-clickhouse-cloud#main)

Collapse the terminal

->Scroll to top

<-Back

- [Blog](https://clickhouse.com/blog)
- /
- [Product](https://clickhouse.com/blog?category=product)

Copy pageCopied!More actions

- ![View as Markdown](https://clickhouse.com/_next/static/immutable/media/icon-markdown.2-p3ljls89_ww.svg)**View as Markdown** Open this page in Markdown
- ![Open in ChatGPT](https://clickhouse.com/_next/static/immutable/media/icon-chatgpt.0aw932qxrira1.svg)**Open in ChatGPT** Ask questions about this page
- ![Open in Claude](https://clickhouse.com/_next/static/immutable/media/icon-claude.42qslf9ajhpwk.svg)**Open in Claude** Ask questions about this page
- ![Open in v0](https://clickhouse.com/_next/static/immutable/media/icon-v0.0mczhus58alob.svg)**Open in v0** Ask questions about this page

# Executable UDFs are now generally available on ClickHouse Cloud

![francisco neves](https://clickhouse.com/_next/image?url=%2Fuploads%2FFrancisco_Neves_407b3f3902.png&w=96&q=75)![216 0 2](https://clickhouse.com/_next/image?url=%2Fuploads%2F216_0_2_4d92aea0d9.jpg&w=96&q=75)![t02em6f031p u0745sr32v7 8cc6d2a629c9 512](https://clickhouse.com/_next/image?url=%2Fuploads%2FT02_EM_6_F031_P_U0745_SR_32_V7_8cc6d2a629c9_512_7d7b8e0c15.jpg&w=96&q=75)![zach naimon](https://clickhouse.com/_next/image?url=%2Fuploads%2FZach_Naimon_2f4cfc668e.jpeg&w=96&q=75)![t02em6f031p u06dlsr8k6h 4bfdbed89520 512](https://clickhouse.com/_next/image?url=%2Fuploads%2FT02_EM_6_F031_P_U06_DLSR_8_K6_H_4bfdbed89520_512_cbff481702.jpg&w=96&q=75)![t02em6f031p u0afx7180sj 4e05006047b5 512](https://clickhouse.com/_next/image?url=%2Fuploads%2FT02_EM_6_F031_P_U0_AFX_7180_SJ_4e05006047b5_512_d901e206d9.png&w=96&q=75)![t02em6f031p u043r4lcrfs e0746edacb29 512](https://clickhouse.com/_next/image?url=%2Fuploads%2FT02_EM_6_F031_P_U043_R4_LCRFS_e0746edacb29_512_078317ee8d.jpg&w=96&q=75)

[Francisco Neves](https://clickhouse.com/authors/author-francisco-neves), [San Tran](https://clickhouse.com/authors/san-tran), [Jia Xu](https://clickhouse.com/authors/jia-xu), [Zach Naimon](https://clickhouse.com/authors/zach-naimon), [Ilya Andreev](https://clickhouse.com/authors/ilya-andreev), [Hanzi Jiang](https://clickhouse.com/authors/hanzi-jiang) and [Kevin Zhang](https://clickhouse.com/authors/kevin-zhang)

Oct 5, 2026 · 22 minutes read

> TL;DR
> Executable UDFs are GA on ClickHouse Cloud across AWS, GCP, and Azure, with a Native runtime for compiled Rust/Go/C++/JavaScript, network access, memory limits, a `deterministic` flag, Cloud API + Terraform support, and per-query UDF metrics in 26.6+. Below, we use them to count and price LLM tokens and grade completions inside ClickHouse.

_Note: companion code here - [_github.com/ClickHouse/llm-token-udf_](https://github.com/ClickHouse/llm-token-udf)._

Four months ago we put executable UDFs into public beta on ClickHouse Cloud: write a function in Python, upload it as a zip, call it from SQL like any built-in. The requests we got during the beta were pretty consistent. People wanted to upload compiled code rather than Python, wanted UDFs on Azure, wanted network access without opening a support ticket, and wanted to see what their UDFs were doing to the cluster.

Today, we are happy to announce that **executable UDFs are generally available on ClickHouse Cloud** on AWS, GCP, and Azure. Since the beta announcement, we have added:

- Native runtime - upload a precompiled, statically linked binary instead of a Python script. Rust, Go, C++, and JavaScript (compiled with Bun ) are supported today.
- Network access - the private-beta feature from the beta post is now available in every organization. UDFs can make outbound calls to public endpoints.
- Azure - UDFs now run on all three clouds.
- A per-process memory limit, and a `deterministic` flag that lets the query cache serve queries that call your UDF.
- 12 UDF endpoints in the Cloud API, and `clickhouse_udf` / `clickhouse_udf_attachment` resources in the Terraform provider (3.24.0+) with per-service version pinning.
- 8 `ProfileEvents` counters and 2 asynchronous metrics in ClickHouse 26.6+, so a query's UDF cost (wall time, pool wait, CPU, memory, bytes over the pipe) shows up in `system.query_log` next to everything else.

UDFs are not billed separately. They run inside your service's pods and consume the same CPU and memory as your queries.

The beta post scored ~6 billion stock trades with a PyTorch autoencoder. This time we built something closer to what most of you told us you're doing with UDFs, which is accounting - in this case, working out where an LLM bill goes using the prompts you're already logging into ClickHouse. Full source for the UDFs, SQL, and Terraform is at [github.com/ClickHouse/llm-token-udf](https://github.com/ClickHouse/llm-token-udf).

## Why tokens?\#

If you run anything on top of an LLM, you log the calls somewhere: prompt, completion, model, latency, probably a trace ID. Increasingly that somewhere is ClickHouse, via ClickStack, Langfuse, or an OpenTelemetry collector using the GenAI semantic conventions.

What you don't reliably have is a token count. Providers return `usage` on most responses, but not on streamed ones (some do, some don't, some only with a flag), not through every proxy, and not from self-hosted models. In the synthetic dataset below, ~30% of spans arrive with no usage at all, which is roughly what you'd see if you stream responses to users. And when `usage` is present, it's a total. It can't tell you that 41% of your support bot's input spend is a system prompt that hasn't changed since March, or that your retrieval layer started returning twice as many chunks last Tuesday.

Counting tokens is a library call (`tiktoken` in Python, `tiktoken-rs` in Rust), so the problem is not the counting. The problem is that the library lives in code and the prompts live in a table. You can export the prompts, count them in a notebook, and load the counts back, which is slow, stale, and one more pipeline to babysit. You can implement byte-pair encoding over a 200k-entry vocabulary with `arrayFold` (please don't). Or you can put the library next to the data.

## What we built\#

Two UDFs and some SQL:

- `count_tokens(model, text) -> UInt32` \- a Rust binary on the Native runtime. Deterministic and CPU-bound, called four times per span at insert time by a materialized view.
- `judge_response(prompt, completion) -> Tuple(score, verdict, reason)` \- a Python UDF with network access that asks Claude to grade a sample of completions, with the output constrained via tool-use. Called every 10 minutes by a refreshable materialized view.

Everything else is ordinary ClickHouse: a dictionary of model prices (pulled from a public price list with `url()`, since fetching a JSON file is not a job for a UDF), two materialized views, and the queries.

```
1┌───────────────────────────┐
2│  llm_spans                │     ← prompts, completions, model, usage (often NULL)
3└──────────────┬────────────┘
4               │ INSERT
5               ▼
6┌───────────────────────────┐
7│  llm_span_tokens_mv       │     ← fires on every INSERT
8│  (calls count_tokens ×4)  │
9└──────────────┬────────────┘
10               │
11               ▼
12┌───────────────────────────┐     ┌──────────────────────────┐
13│  llm_span_tokens          │ ⟵─┤  model_prices (dict)     │ ← url() + refreshable MV, daily
14│  system / context / user /│     └──────────────────────────┘
15│  completion token counts  │
16└───────────────────────────┘
17               ▲
18               │ every 10 min, 2% sample
19┌──────────────┴────────────┐
20│  llm_evals_mv             │     ← refreshable MV, APPEND
21│  (calls judge_response)   │        over the network
22└───────────────────────────┘
```

Copy command

## The tokenizer, as a Native UDF\#

The Native runtime (not to be confused with ClickHouse's `Native` _format_, which is one of the I/O format options for any UDF) takes a zip with two folders, `amd64/` and `arm64/`, each containing a statically linked Linux executable named `main` plus any data files you want alongside it at runtime. Both architectures are required because ClickHouse Cloud runs on both. The binary runs with no arguments and nothing is installed for you, so everything it needs has to be compiled in.

`count_tokens` is ~100 lines of Rust around `tiktoken-rs`. Most of it is the wire protocol, which is the same one a Python UDF speaks, just in binary:

```
1// Deploy as: executable_pool, runtime = Native, format = RowBinary,
2// send_chunk_header = true, deterministic = true.
3// Arguments: (model String, text String) -> UInt32
4fn main() {
5    let mut tok = Tokenizers::load();           // reads models.json from the binary's directory
6    let mut stdin = BufReader::with_capacity(1 << 20, io::stdin().lock());
7    let mut stdout = BufWriter::with_capacity(1 << 20, io::stdout().lock());
8    let (mut header, mut model, mut text) = (String::new(), Vec::new(), Vec::new());
9
10    loop {
11        // 1. chunk header: row count as decimal text + '\n' (send_chunk_header)
12        header.clear();
13        match stdin.read_line(&mut header) {
14            Ok(0) => return,                    // pipe closed; pool process exits cleanly
15            Ok(_) => {}
16            Err(e) => die(&format!("reading chunk header: {e}")),
17        }
18        let rows: usize = header.trim().parse().unwrap_or_else(|_| die("bad chunk header"));
19
20        // 2. N RowBinary rows: each String is a LEB128 length + raw bytes
21        for i in 0..rows {
22            read_string(&mut stdin, &mut model)
23                .and_then(|_| read_string(&mut stdin, &mut text))
24                .unwrap_or_else(|e| die(&format!("row {i}: {e}")));
25            let n = tok.count(&String::from_utf8_lossy(&model), &String::from_utf8_lossy(&text));
26            stdout.write_all(&n.to_le_bytes()).unwrap_or_else(|_| process::exit(1));
27        }
28        // 3. N UInt32 answers, flushed once per chunk
29        stdout.flush().unwrap_or_else(|_| process::exit(1));
30    }
31}
```

Copy command

We used `RowBinary` rather than the `TabSeparated` format from the beta demo. TSV was fine for 14 numeric features, but prompts are full of tabs, newlines, and backslashes that would need escaping on both sides of the pipe, whereas RowBinary is binary-safe and ClickHouse doesn't have to format text on the way out or parse it on the way back in. In our testing, moving a UDF from `TabSeparatedRaw` to `RowBinary` is worth ~20% on its own.

The chunk header is the other half of the protocol. With `send_chunk_header` on, ClickHouse writes the row count before each chunk, so the process reads exactly that many rows, processes them, and flushes once. Without it, a UDF that buffers output has no way of knowing when a block ends. During the beta we debugged a UDF that flushed every 128 rows and therefore hung on every block whose size wasn't a multiple of 128 (ie - the last block of nearly every query) until the read timeout fired. If your UDF doesn't flush per row, turn this on.

The model-to-encoding mapping (`gpt-4o` → `o200k_base`, `gpt-4` → `cl100k_base`, and so on) lives in a `models.json` next to the binary, so when a new model comes out we edit a text file and upload a new version instead of recompiling. One detail that cost us a review cycle: the data files are deployed next to the binary, but the process does not start in that directory (the bundle lives under `/scripts`, the working directory is `/`), so the binary resolves `models.json` relative to its own path rather than to the working directory, and exits with an error if the file isn't there instead of quietly carrying on without it. Models we don't recognize fall back to `o200k_base`. That is an approximation for non-OpenAI tokenizers, but it's good enough for cost attribution, and the provider's own `usage` takes precedence whenever it's present (more on that below).

Building both architectures from a laptop is two `cargo` commands with the musl targets:

```
1cargo build --release --target x86_64-unknown-linux-musl
2cargo build --release --target aarch64-unknown-linux-musl
3# -> count_tokens.zip: amd64/main, amd64/models.json, arm64/main, arm64/models.json
```

Copy command

The binaries are ~7MB each and the zip is 6.6MB.

### Deploying it\#

The deployment surface is the same upload screen as the beta, with a few new fields:

| **Field** | **Value** |
| --- | --- |
| Name | `count_tokens` |
| Type | `executable_pool` |
| Runtime type | `Native` |
| Format | `RowBinary` |
| Send chunk header | `true` |
| Deterministic | `true` |
| Memory limit | `512 MiB` |
| Pool size | `4` |
| Arguments | `model String`, `text String` |
| Return type | `UInt32` |

Two of these are new since the beta. 'Deterministic' tells ClickHouse that the function returns the same output for the same input, which is what the query cache needs to know before it will store a result. During the beta, every Cloud UDF was treated as non-deterministic, so `use_query_cache = 1` on a query that called one failed with `QUERY_CACHE_USED_WITH_NONDETERMINISTIC_FUNCTIONS`. With the flag set, the second run of this dashboard query comes back from the cache in 0 ms with zero UDF invocations:

```
1SELECT feature, sum(count_tokens(model, system_prompt)) AS system_tokens
2FROM llm_spans
3WHERE toDate(ts) = '2026-10-01'    -- a literal on purpose: today() is itself non-deterministic
4GROUP BY feature
5SETTINGS use_query_cache = 1;
```

Copy command

```
1┌─query_duration_ms─┬─QueryCacheHits─┬─QueryCacheMisses─┬─udf_invocations─┐
2│               209 │              0 │                1 │              14 │   ← first run
3│                 0 │              1 │                0 │               0 │   ← second run
4└───────────────────┴────────────────┴──────────────────┴─────────────────┘
```

Copy command

'Memory limit' caps the memory available to each sandbox process; the default is 4 GiB. The limit applies to virtual address space rather than resident memory, which matters because some runtimes reserve far more address space than they touch. Our Rust binary sits at 43 MiB virtual / 39 MiB resident per process, the Python version at 103 / 93 MiB, and the Go version reserves ~1.2 GiB of address space while using 29 MiB. In other words, size the limit for the runtime, not the workload, and give Go plenty of headroom.

### Wiring it into ingest\#

We'll call `count_tokens` from a materialized view, so the tokenizer runs exactly once per span, at insert time:

```
1CREATE MATERIALIZED VIEW llm_span_tokens_mv TO llm_span_tokens AS
2SELECT
3    ts, trace_id, span_id, service, feature, customer_id, model,
4    count_tokens(model, system_prompt)     AS system_tokens,
5    count_tokens(model, retrieved_context) AS context_tokens,
6    count_tokens(model, user_prompt)       AS user_tokens,
7    count_tokens(model, completion)        AS completion_tokens,
8    provider_input_tokens,
9    provider_output_tokens,
10    sipHash64(system_prompt)               AS system_prompt_hash
11FROM llm_spans;
```

Copy command

Every `INSERT INTO llm_spans` fires this view, counts four components per span, and lands the result in `llm_span_tokens`. Every query after that is an aggregation over integers.

For a sense of throughput, 100,000 synthetic spans (351 MiB of prompt text, 69M tokens) go through this view in 5.2 seconds on a 4 vCPU box with a pool of 4, ie - ~13M tokens/sec, or ~19k spans/sec.

### Pricing it\#

Token counts become dollars with a price per token. LiteLLM maintains a public price list as a JSON file, and since fetching a file is a job for `url()` rather than a UDF, we'll wrap the fetch in a refreshable materialized view that re-pulls it daily and feeds a dictionary:

```
1CREATE MATERIALIZED VIEW model_prices_mv
2REFRESH EVERY 1 DAY
3TO model_prices
4AS
5SELECT
6    kv.1                                                   AS model,
7    JSONExtractString(kv.2, 'litellm_provider')            AS provider,
8    JSONExtractFloat(kv.2, 'input_cost_per_token')         AS input_cost_per_token,
9    JSONExtractFloat(kv.2, 'output_cost_per_token')        AS output_cost_per_token,
10    JSONExtractFloat(kv.2, 'cache_read_input_token_cost')  AS cache_read_input_token_cost,
11    now()                                                  AS updated_at
12FROM
13(
14    SELECT arrayJoin(JSONExtractKeysAndValuesRaw(json)) AS kv
15    FROM url('https://raw.githubusercontent.com/BerriAI/litellm/main/model_prices_and_context_window.json',
16             JSONAsString, 'json String')
17)
18WHERE JSONHas(kv.2, 'input_cost_per_token');
```

Copy command

That gives us 3,683 priced models, refreshed once a day and looked up with `dictGet`. The cost query uses the provider's `usage` where it exists and our count where it doesn't:

```
1SELECT
2    toDate(ts) AS day,
3    feature,
4    round(sum(coalesce(provider_input_tokens, system_tokens + context_tokens + user_tokens)
5            * dictGet('model_prices_dict', 'input_cost_per_token', model)
6          + coalesce(provider_output_tokens, completion_tokens)
7            * dictGet('model_prices_dict', 'output_cost_per_token', model)), 2)  AS est_cost_usd,
8    countIf(provider_input_tokens IS NULL)                         AS spans_filled_by_udf,
9    count()                                                        AS spans
10FROM llm_span_tokens
11GROUP BY day, feature
12ORDER BY day DESC, est_cost_usd DESC;
```

Copy command

```
1┌────────day─┬─feature───────┬─est_cost_usd─┬─spans_filled_by_udf─┬─spans─┐
2│ 2026-09-30 │ sql_assistant │         3.25 │                 558 │  1781 │
3│ 2026-09-30 │ support_bot   │         3.24 │                 539 │  1759 │
4│ 2026-09-30 │ docs_search   │         3.06 │                 535 │  1796 │
5│ 2026-09-30 │ summarizer    │         2.93 │                 527 │  1818 │
6└────────────┴───────────────┴──────────────┴─────────────────────┴───────┘
```

Copy command

Where the provider did report usage, we can check our own work against it. The difference between `provider_input_tokens` and our three component counts is the chat-template overhead (role markers and message framing), which for a given model should be a stable dozen or so tokens. If it drifts, either the provider changed its template or our `models.json` is wrong for that model, and either way it's a one-line `quantile` query to find out.

### What the components tell you\#

The system prompt is static text sent on every call, and providers now bill cached prefix tokens at 50-90% off list depending on the provider (that's the `cache_read_input_token_cost` column above). So 'how much of my input spend is the system prompt?' is the same question as 'how much would prompt caching save me?':

```
1SELECT
2    feature,
3    sum(system_tokens)                                              AS sys_tokens,
4    sum(system_tokens + context_tokens + user_tokens)               AS input_tokens,
5    round(sys_tokens / input_tokens * 100, 1)                       AS system_pct,
6    round(sum(system_tokens
7              * (dictGet('model_prices_dict', 'input_cost_per_token', model)
8                 - dictGet('model_prices_dict', 'cache_read_input_token_cost', model))), 2)
9                                                                    AS usd_saved_if_cached
10FROM llm_span_tokens
11WHERE ts >= now() - INTERVAL 7 DAY
12GROUP BY feature
13ORDER BY usd_saved_if_cached DESC;
```

Copy command

```
1┌─feature───────┬─sys_tokens─┬─input_tokens─┬─system_pct─┬─usd_saved_if_cached─┐
2│ support_bot   │    3483276 │      8461730 │       41.2 │                4.04 │
3│ sql_assistant │    3237735 │      8382894 │       38.6 │                3.78 │
4│ docs_search   │    2213208 │      7287850 │       30.4 │                2.61 │
5│ summarizer    │    1552014 │      6999309 │       22.2 │                1.81 │
6└───────────────┴────────────┴──────────────┴────────────┴─────────────────────┘
```

Copy command

The dollar figures are small because the dataset is small (100k spans over two weeks); multiply by your own volume. The point is that this query can't be written from `usage` totals at all. It needs the components, and the components come from the tokenizer.

## Judging a sample, over the network\#

Cost is one half of the accounting; whether the completions were any good is the other, and the usual approach is to have a second model grade a sample. That is a network call to an LLM API from inside the database, which is what network-enabled UDFs are for.

`judge_response` is a Python UDF (~120 lines) that posts the prompt and completion to Claude with a tool-use schema whose `verdict` field is an enum of `pass`, `partial`, and `fail`, and whose `score` is an integer from 1 to 5. The model is required to call the tool, so the response is always parseable and the verdict is always one of the three values:

```
1# abridged - full file in the repo
2JUDGE_TOOL = {
3    "name": "report_verdict",
4    "description": "Grade how well the completion answers the prompt.",
5    "input_schema": {
6        "type": "object",
7        "properties": {
8            "score":   {"type": "integer", "minimum": 1, "maximum": 5},
9            "verdict": {"type": "string", "enum": ["pass", "partial", "fail"]},
10            "reason":  {"type": "string", "maxLength": 200},
11        },
12        "required": ["score", "verdict", "reason"],
13    },
14}
15
16def main() -> None:
17    for line in sys.stdin:                       # JSONEachRow in ...
18        if not line.strip():
19            continue
20        row = json.loads(line)
21        score, verdict, reason = judge(row["prompt"], row["completion"])
22        sys.stdout.write(json.dumps({"result": [score, verdict, reason]}) + "\n")   # ... JSONEachRow out
23        sys.stdout.flush()
```

Copy command

This one uses `JSONEachRow` rather than `RowBinary`, since throughput is beside the point when every row is an HTTPS round trip and JSON makes the tuple return type easy to emit. Each pool process keeps a `requests.Session` open for its lifetime, caches results per `(prompt, completion)` so re-judging is free, and retries on 429/529 with backoff. It also fails soft - a bad API call returns `(0, 'error', reason)` rather than killing the query - because it runs unattended.

On the API key: there is no secrets manager for UDFs yet (see below), so the key ships in a `config.json` inside the zip rather than appearing anywhere in SQL. The sandbox has no cloud identity of its own (no instance role, no metadata endpoint, no inherited environment), so the only credentials a UDF has are the ones you give it.

| **Field** | **Value** |
| --- | --- |
| Name | `judge_response` |
| Type | `executable_pool` |
| Runtime type | `python3.11` |
| Format | `JSONEachRow` |
| Network access | enabled |
| Deterministic | `false` |
| Max command exec time (s) | `30` |
| Pool size | `4` |
| Arguments | `prompt String`, `completion String` |
| Return type | `Tuple(UInt8, String, String)` |

The eval loop itself is a refreshable materialized view. Every 10 minutes it takes a deterministic 2% sample of the last 10 minutes of spans, judges them, and appends the results:

```
1CREATE MATERIALIZED VIEW llm_evals_mv
2REFRESH EVERY 10 MINUTE
3APPEND TO llm_evals
4AS
5WITH judge_response(
6        concat(system_prompt, '\n\n', retrieved_context, '\n\nUser: ', user_prompt),
7        completion
8     ) AS j
9SELECT
10    ts, trace_id, span_id, feature, model,
11    j.1   AS score,
12    j.2   AS verdict,
13    j.3   AS reason,
14    now() AS judged_at
15FROM llm_spans
16WHERE ts >= now() - INTERVAL 10 MINUTE
17  AND cityHash64(trace_id) % 100 < 2;
```

Copy command

There is no scheduler or eval service in this picture, just a view with a refresh interval. The same `GROUP BY feature, model` you'd write for cost gives you fail rates by feature and model, and because `llm_evals` and `llm_span_tokens` share `span_id`, 'which expensive prompts are also failing' is a join.

## What it costs to run\#

The biggest gap in the beta was observability. A UDF runs in a separate process, so `system.query_log` showed the query's own CPU and memory and nothing about the children, and when a customer asked whether their UDF or their query was slow, neither of us could answer from the system tables.

ClickHouse 26.6 added eight `ProfileEvents` for executable UDFs, and they now appear in `system.query_log`, `system.events`, and `system.metric_log` on every Cloud service:

| **ProfileEvent** | **What it measures** |
| --- | --- |
| `ExecutableUserDefinedFunctionInvocations` | Number of UDF invocations (one per chunk) |
| `ExecutableUserDefinedFunctionElapsedMicroseconds` | Wall-clock time spent in UDF calls |
| `ExecutableUserDefinedFunctionPoolWaitMicroseconds` | Time spent waiting for a free pool process |
| `ExecutableUserDefinedFunctionUserTimeMicroseconds` | User-mode CPU consumed by the child processes |
| `ExecutableUserDefinedFunctionSystemTimeMicroseconds` | Kernel-mode CPU consumed by the child processes |
| `ExecutableUserDefinedFunctionPeakMemoryByteSeconds` | Per-process peak memory integrated over wall time |
| `ExecutableUserDefinedFunctionInputBytes` | Bytes written to the children's stdin |
| `ExecutableUserDefinedFunctionOutputBytes` | Bytes read from the children's stdout |

Two asynchronous metrics, `ExecutableUserDefinedFunctionProcesses` and `ExecutableUserDefinedFunctionMemoryResidentBytes`, report how many UDF processes are alive on the server right now and how much resident memory they hold (summed per process, so an upper bound).

With these in place, the question of which language to write a UDF in becomes a `query_log` query. We wrote `count_tokens` three times - Rust on the Native runtime, Python with `tiktoken`, and Go with a pure-Go tokenizer - and ran the materialized view's workload (100k spans, 4 counts each, 351 MiB of text) through each:

```
1SELECT
2    extract(query, 'AS (\\w+)_tokens')                                            AS impl,
3    query_duration_ms,
4    ProfileEvents['ExecutableUserDefinedFunctionInvocations']                     AS invocations,
5    round(ProfileEvents['ExecutableUserDefinedFunctionElapsedMicroseconds'] / 1e6, 2) AS udf_wall_s,
6    round((ProfileEvents['ExecutableUserDefinedFunctionUserTimeMicroseconds']
7         + ProfileEvents['ExecutableUserDefinedFunctionSystemTimeMicroseconds']) / 1e6, 2) AS udf_cpu_s,
8    formatReadableSize(ProfileEvents['ExecutableUserDefinedFunctionInputBytes'])  AS udf_in
9FROM system.query_log
10WHERE type = 'QueryFinish' AND ProfileEvents['ExecutableUserDefinedFunctionInvocations'] > 0
11ORDER BY event_time_microseconds;
```

Copy command

```
1┌─impl─┬─query_duration_ms─┬─invocations─┬─udf_wall_s─┬─udf_cpu_s─┬─udf_in─────┐
2│ rs   │              5161 │         144 │       7.05 │      6.94 │ 355.09 MiB │
3│ py   │              7207 │         144 │      10.05 │      9.94 │ 355.09 MiB │
4│ go   │             15028 │         144 │      20.97 │     26.14 │ 355.09 MiB │
5└──────┴───────────────────┴─────────────┴────────────┴───────────┴────────────┘
```

Copy command

Rust is 1.4x faster than Python here and 2.9x faster than Go, which is not the order we expected going in. Python is close because `tiktoken`'s core is Rust; the 1.4x is the interpreter loop and the pipe handling. Go is slow because the pure-Go tokenizer library is slow, and the Native runtime does nothing about a slow library. Simply put, the runtime removes the interpreter and the dependency install and lets you ship the library you already have, but the library still has to be fast. (For CPU-bound Python with no native core underneath it, the picture is different: a design-partner customer measured ~25x moving a string-matching UDF from Python to Go.)

The counts, for what it's worth, were identical across all three implementations, and matched `tiktoken` itself on 1,200 spot-checked values.

## Terraform\#

Everything above was set up in the console. For anything headed to production you'll probably want it in code, and the Terraform provider (3.24.0+) now has two resources for that: `clickhouse_udf` publishes a new version whenever the zip's hash changes and waits for the build, and `clickhouse_udf_attachment` binds one version to one service.

```
1resource "clickhouse_udf" "count_tokens" {
2  function_name = "count_tokens"
3  runtime       = "native"
4  type          = "executable_pool"
5  format        = "RowBinary"
6  return_type   = "UInt32"
7  arguments     = [{ name = "model", type = "String" }, { name = "text", type = "String" }]
8
9  pool_size                  = 4
10  send_chunk_header          = true
11  max_command_execution_time = 10
12
13  source_archive_path = "${path.module}/../udf/count_tokens_rs/count_tokens.zip"
14  source_archive_hash = filebase64sha256("${path.module}/../udf/count_tokens_rs/count_tokens.zip")
15}
16
17# Dev follows every successful build.
18resource "clickhouse_udf_attachment" "dev" {
19  function_name = clickhouse_udf.count_tokens.function_name
20  service_id    = var.dev_service_id
21  version       = clickhouse_udf.count_tokens.version
22}
23
24# Prod stays where you pinned it.
25resource "clickhouse_udf_attachment" "prod" {
26  function_name = clickhouse_udf.count_tokens.function_name
27  service_id    = var.prod_service_id
28  version       = var.count_tokens_prod_version
29}
```

Copy command

This mirrors how versions work in the console. Versions are immutable, a new zip is a new version, and versions are attached per service, so you can run v7 on dev while prod stays on v6 and roll back a single service without touching the others. A service holds one version of a function at a time. For `executable_pool` UDFs the long-lived pool processes keep serving the old version until the pool is refreshed, so the console has a 'Reload UDF' action next to each attached service that runs `SYSTEM RELOAD FUNCTION` for you. Two of the newer settings, `deterministic` and the memory limit, aren't in the provider schema yet, so for the time being those are set in the console or via the API.

The same lifecycle is available in the [Cloud API](https://clickhouse.com/docs/products/cloud/api-reference/udf/udf-create): create an upload URL, push the zip, create the function or a new version, attach it to a service.

## What we learned in beta\#

Four months of beta support threads reduce to a short list.

Use `executable_pool`. With plain `executable`, ClickHouse starts a fresh sandboxed process for every block of data; with `executable_pool`, a pool of long-lived processes is reused across blocks and queries, which is faster, keeps your model or vocabulary warm in memory, and holds up under load in a way that per-block process spawning does not. We have yet to see a Cloud workload where `executable` was the right choice.

Fewer, bigger chunks. Every invocation has a fixed setup cost on both sides of the pipe. The same 5,000-row query took 165 ms as one chunk and 1,544 ms with `max_block_size = 1`, ie - 5,000 invocations. If `ExecutableUserDefinedFunctionInvocations` is in the hundreds of thousands for a single query, raise `preferred_block_size_bytes` (we've used `100000000`) and check the counter again.

Pool size is per replica, and `max_threads` is the ceiling. A query uses at most `max_threads` pool processes at once, so a pool of 64 on a 16-thread query is a pool of 16. Start at 4, and raise it when `ExecutableUserDefinedFunctionPoolWaitMicroseconds` says so, bearing in mind that each process holds its own copy of whatever you load at startup.

Flush per chunk, not per N rows. Turn on `send_chunk_header` and read exactly that many rows. Covered above, but it accounted for more beta support threads than anything else.

Fail loudly. A UDF that can't find a bundled file, can't parse a config, or gets a row it doesn't understand should write one line to stderr and exit non-zero. ClickHouse surfaces the stderr in the query error, so the problem is visible in the first query rather than in a wrong number three dashboards later. Our first `count_tokens` treated a missing `models.json` as "no rules" and tokenized every model as `o200k_base`; the counts looked plausible, and nobody would have noticed until a `gpt-4` bill didn't reconcile.

Know when a UDF is the wrong tool. Every row crosses a process boundary through a pipe and is serialized on the way, and that cost can't be optimized away. For trivial per-row work it dominates - a no-op UDF over billions of rows will be several times slower than the equivalent built-in in any language. UDFs pay for themselves on logic SQL can't express (a tokenizer, a model, a parser, an API call), not on logic it can.

The first UDF on a service restarts it. Attaching your first UDF adds a helper container to the service's pods, which means a rolling restart; the second UDF onward does not, and removing the last one restarts again. Treat the first attach like a maintenance window.

## What we're building next\#

- Secrets - the number one ask: environment variables or secret references for UDFs, so API keys don't ship inside the zip. We have a design that ties UDF inputs to named collections with proper access separation, and it's next on the list.
- Runtime config without a rebuild - pool size, timeouts, and memory limits are tied to a version today. We're decoupling them so a `clickhouse_udf_attachment` can override them per service without publishing a new version.
- Network access for Native UDFs - today the Native runtime is compute-only and outbound network is Python-only.
- More runtimes - WebAssembly UDFs exist in open-source ClickHouse as an experimental feature and aren't in Cloud yet; we're looking at that, and at curated per-language runtimes, as the longer-term shape.

## Try it yourself\#

Executable UDFs are generally available today in every ClickHouse Cloud organization on AWS, GCP, and Azure, with nothing to enable. Open 'User-defined functions' from your organization menu in the console, or start from the [docs](https://clickhouse.com/docs/products/cloud/features/sql-console-features/user-defined-functions), the [Cloud API reference](https://clickhouse.com/docs/products/cloud/api-reference/udf/udf-create), or the [Terraform resources](https://registry.terraform.io/providers/ClickHouse/clickhouse/latest/docs/resources/udf).

The full project is at [github.com/ClickHouse/llm-token-udf](https://github.com/ClickHouse/llm-token-udf):

```
1llm-token-udf/
2├── udf/
3│   ├── count_tokens_rs/   # the Native UDF (Rust): source, build script, zip layout
4│   ├── count_tokens/      # the same UDF in Go
5│   ├── count_tokens_py/   # the same UDF in Python
6│   └── judge_response/    # the network UDF (Python, Anthropic tool-use)
7├── sql/                   # schema, MVs, prices, evals, and every query in this post
8├── terraform/             # clickhouse_udf + dev/prod attachments
9└── local/                 # XML config for running the same UDFs against open-source ClickHouse
```

Copy command

If you port a Python UDF to the Native runtime and measure the difference, or build something we haven't thought of, drop us a note!

### Get started today\#

[Get started](https://clickhouse.cloud/signUp?loc=blog-cta-footer&pagePath=%2Fblog%2Fexecutable-udfs-generally-available-on-clickhouse-cloud&origPath=%2Fblog%2Fexecutable-udfs-generally-available-on-clickhouse-cloud&utm_ga=GA1.1.1305821483.1791463422) with ClickHouse Cloud today and receive $300 in credits. At the end of your 30-day trial, continue with a pay-as-you-go plan, or [contact us](https://clickhouse.com/company/contact?loc=blog-cta-footer) to learn more about our volume-based discounts. Visit our [pricing page](https://clickhouse.com/pricing?loc=blog-cta-header) for details.

* * *

Share this post

- Copy URL
- [![Y Combinator icon](https://clickhouse.com/_next/static/immutable/media/ycombinator.37q2g-no9bowl.svg)](https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fclickhouse.com%2Fblog%2Fexecutable-udfs-generally-available-on-clickhouse-cloud "Share on Y Combinator")
- [![X icon](https://clickhouse.com/_next/static/immutable/media/x.3nm91lx52ia7n.svg)](https://x.com/intent/tweet?text=https%3A%2F%2Fclickhouse.com%2Fblog%2Fexecutable-udfs-generally-available-on-clickhouse-cloud "Share on X")
- [![Bluesky icon](https://clickhouse.com/_next/static/immutable/media/bluesky.292c8t8kns7n1.svg)](https://bsky.app/intent/compose?text=https%3A%2F%2Fclickhouse.com%2Fblog%2Fexecutable-udfs-generally-available-on-clickhouse-cloud "Share on Bluesky")
- [![Facebook icon](https://clickhouse.com/_next/static/immutable/media/facebook.32ysyflv7kktz.svg)](https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fclickhouse.com%2Fblog%2Fexecutable-udfs-generally-available-on-clickhouse-cloud "Share on Facebook")
- [![LinkedIn icon](https://clickhouse.com/_next/static/immutable/media/linkedin.37911rnwi-sdg.svg)](https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fclickhouse.com%2Fblog%2Fexecutable-udfs-generally-available-on-clickhouse-cloud "Share on LinkedIn")

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

![what is direct io and why does clickhouse managed postgres use it for backups](https://clickhouse.com/_next/image?url=%2Fuploads%2FWhat_is_Direct_IO_and_why_does_Click_House_Managed_Postgres_use_it_for_backups_d4110a79b9.png&w=750&q=75)

Engineering

### [What is direct I/O, and why does ClickHouse Managed Postgres use it for backups?](https://clickhouse.com/blog/direct-io-managed-postgres-backups)

Kaushik Iska · Oct 2, 2026

[View all Blogs](https://clickhouse.com/blog)

## Follow us

[![X](https://clickhouse.com/_next/static/immutable/media/x.3nm91lx52ia7n.svg)](https://x.com/ClickhouseDB "X")[![Bluesky](https://clickhouse.com/_next/static/immutable/media/bluesky.292c8t8kns7n1.svg)](https://bsky.app/profile/clickhouse.com "Bluesky")[![Slack](https://clickhouse.com/_next/static/immutable/media/slack.2_pspehyws_jz.svg)](https://clickhouse.com/slack "Slack")[![Github](https://clickhouse.com/_next/static/immutable/media/github.3ofxqpa2uzt_a.svg)](https://github.com/ClickHouse/ClickHouse "Github")[![Telegram](https://clickhouse.com/_next/static/immutable/media/telegram.0054ol1lpoidb.svg)](https://telegram.me/clickhouse_en "Telegram")[![Meetup](https://clickhouse.com/_next/static/immutable/media/meetup.2tf1x11zaaepo.svg)](https://www.meetup.com/pro/clickhouse "Meetup")[![RSS](https://clickhouse.com/_next/static/immutable/media/rss.1pu3aqlsglh-q.svg)](https://clickhouse.com/rss.xml "RSS")