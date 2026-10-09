---
source_url: https://docs.guild.ai/guide/coded-agents
source_capture: .firecrawl/click-guild-guild-coded-agents.md
collection_status: reused_prior_capture
indexed_at: 2026-10-09
---

> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# Auto-managed state agents

> Build deterministic TypeScript agents with automatic state management.

<iframe src="https://www.youtube.com/embed/2F2ZDnYgQAw" title="YouTube video player" frameborder="0" className="w-full aspect-video rounded-xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen />

Auto-managed state agents (using `AutomaticallyManagedStateAgent`) are TypeScript functions you write yourself. They execute deterministically from start to finish, with no LLM driving the control flow — though you can call LLMs as needed within your code.

The runtime handles state persistence automatically. You write a straightforward `async run` function, and the [babel-plugin-agent-compiler](https://docs.guild.ai/packages/babel-plugin) transforms it into a resumable state machine behind the scenes.

## Example

Add the `"use agent"` directive at the top of your file so the runtime can manage state between tool calls.

```typescript theme={null}
"use agent"

import {
  type Task,
  agent,
  pick,
  progressLogNotifyEvent,
  userInterfaceTools,
} from "@guildai/agents-sdk"
import { gitHubTools } from "@guildai-services/guildai~github"
import { z } from "zod"

const inputSchema = z.object({
  repo: z.string().describe("The GitHub repository in 'owner/name' format"),
  issue_number: z.number().describe("The issue number to summarize"),
})
type Input = z.infer<typeof inputSchema>

const outputSchema = z.object({
  summary: z.string(),
  labels: z.array(z.string()),
})
type Output = z.infer<typeof outputSchema>

const tools = {
  ...userInterfaceTools,
  ...pick(gitHubTools, [
    "github_issues_get",
    "github_issues_list_comments",
  ]),
}
type Tools = typeof tools

async function run(input: Input, task: Task<Tools>): Promise<Output> {
  const [owner, repo] = input.repo.split("/")

  await task.ui?.notify(progressLogNotifyEvent("Fetching issue..."))

  const issue = await task.tools.github_issues_get({
    owner,
    repo,
    issue_number: input.issue_number,
  })

  // Use LLM to summarize
  const result = await task.llm.generateText({
    prompt: `Summarize this GitHub issue:\n\n${issue?.body}`,
  })

  return {
    summary: result.text,
    labels: issue?.labels?.map((l) => l.name) ?? [],
  }
}

export default agent({
  description: "Summarizes a GitHub issue and extracts its labels.",
  inputSchema,
  outputSchema,
  tools,
  run,
})
```

<Warning>
  The runtime only supports `@guildai/agents-sdk` and `zod`. See the [SDK introduction](https://docs.guild.ai/guide/sdk-introduction) for details.
</Warning>

<Note>
  The `description` field is optional and deprecated as of `@guildai/agents-sdk` 0.4.0. Guild generates the agent's published description automatically from its code, so setting `description` no longer affects the published description.
</Note>

## Input and output schemas

Define your schemas using Zod. The runtime uses them to validate input and expose the agent as a typed tool for orchestrating agents.

<Warning>
  **`inputSchema` must use `z.object()` at the root.** The runtime registers each agent as an LLM tool, and LLM providers require `"type": "object"` at the top of input schemas. Root schemas that are not objects — such as `z.discriminatedUnion()`, `z.union()`, `z.record()`, or a primitive like `z.string()` — are rejected and fail the build. Wrap a non-object schema in a root `z.object()` property instead: use `z.object({ data: z.record(z.string(), z.number()) })` rather than `z.record(z.string(), z.number())`.
</Warning>

```typescript theme={null}
const inputSchema = z.object({
  message: z.string().describe("The message to process"),
})

const outputSchema = z.object({
  response: z.string(),
})
```

## Error handling

Any exception thrown from your `run` function is returned to the calling agent or user. Use standard TypeScript error handling:

```typescript theme={null}
async function run(input: Input, task: Task<Tools>): Promise<Output> {
  try {
    // ...
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Failed to process: ${message}`)
  }
}
```

## Limitations

The `"use agent"` directive relies on the [Babel compiler](https://docs.guild.ai/packages/babel-plugin) to transform your code into a state machine. This means:

* **No `Promise.all`, `Promise.any`, or `Promise.race`** — awaiting tool calls one at a time serializes between the calls, so each runs independently. If the calls are independent tool calls and you want them to run **in parallel** rather than one after another, use `task.gather` / `task.gatherSettled` instead — see [Parallel tool calls with `task.gather`](#parallel-tool-calls-with-task-gather) below. These are the compiler-supported replacement for `Promise.all` / `Promise.allSettled` when every input is a tool call.
* **No dynamic function references across `await` points** — conditionally assigned functions may not survive serialization
* **No external imports** — only `@guildai/agents-sdk`, `zod`, and `@guildai-services/*` are supported

### What may cross an `await`

Every `await` is a possible suspension point. When the agent suspends, the
state machine's frames — which hold your local variables — are serialized with
`@guildai/s11n` and restored on resume. So the rule is: **anything in a local
variable that crosses an `await` must survive that round trip.**

`s11n` handles primitives, plain objects, arrays, `Map`, `Set`, `Date`, plain
`Error`, cycles, and shared references. It does not handle `Promise`, `RegExp`,
`WeakMap`, `WeakSet`, class instances, or arbitrary functions.

The compiler does not check this. Code that violates it type-checks, builds,
and — if the agent happens never to suspend — may pass a test run, then fail
once a real suspension happens.

#### A promise held in a local across an `await`

The hazard is holding a promise in a variable that is still live at a suspend
point. Creating and consuming one inside a single expression is fine, because
nothing promise-valued ever occupies a frame slot.

```typescript theme={null}
// ❌ `p` is in a frame slot at the `await`
const p = fetchSomething()
await somethingElse()
return await p

// ✅ created and consumed in one expression
const [a, b] = await task.gather([toolA(), toolB()])
```

This applies to **tool-call promises too**, which is easy to miss because they
look like ordinary values. Accumulating them into an array and passing that
array to `task.gather` type-checks and builds clean, then fails at run time:

```typescript theme={null}
// ❌ `calls` holds promises and is live at the await
const calls = []
for (const w of workflows) calls.push(listRuns(w.id, 1))
const pages = await task.gather(calls)
```

Build the batch **inline at the call site** instead, as an array literal in the
`task.gather` argument.

The failure is not diagnosable from the message, so recognize the two
signatures:

| What happened | Error |
| - | - |
| The state was serialized | `SerializationError: Cannot serialize Promise` |
| The state was not serialized | `ReferenceError: <name> is not defined` |

The `ReferenceError` names a variable that plainly exists in your source. It
means the frame slot holding that value did not come back — not that you
misspelled anything.

### Async code must live in the agent's file

The compiler only processes the file that carries the `"use agent"` directive.
An `async` function imported from another module is never compiled into the
state machine, so it has no frames of its own and no static body the compiler
can hoist. Awaiting one across a suspension loses its state: the call compiles
cleanly, type-checks, and returns the wrong thing after a resume.

```typescript theme={null}
// ❌ phase-runner.ts — compiled agent awaits an async function from another file
import { runPhase } from "./phase-runner"
const result = await runPhase(task, input)
```

The practical consequence is worth stating plainly, because every instinct says
otherwise: **a compiled orchestrator cannot be split into modules along its
`async` boundaries.** An orchestrator that grows large stays in one file.

What you *can* move out is **synchronous** code. A sync helper is not compiled
at all, so it may live in any file, as long as the value it returns is
serializable. That is the seam to decompose along — see
[Keep heavy work in synchronous helpers](#keep-heavy-work-in-synchronous-helpers-not-async-ones)
below.

The same reasoning covers function *values* that arrive from outside the
compiled file — a function passed in as an argument, returned from a library
call, or imported from another module. The compiler has no body to hoist, so
you may call it freely within a single step, but storing it in a variable that
crosses an `await` yields `undefined` after a resume.

### What the build catches, and what it does not

Some unsupported constructs fail loudly at build time:

| Construct | Result |
| - | - |
| `break label` / `continue label` | Build error — not implemented. |
| Two nested functions with the same name in one compiled scope | Build error — the hoisted names would collide. |
| `async function*` generators | Build error — not implemented. |

Others compile clean and go wrong at run time, with no warning:

| Construct | What happens |
| - | - |
| A non-serializable value in a local across an `await` | Fails on resume — see [What may cross an `await`](#what-may-cross-an-await). |
| An `async` function imported from another file | Loses its state across a suspension. |
| `for await (const x of ...)` | The `await` is dropped. The compiler emits a plain `for-of`, so each item is an unresolved promise. |

For `for await`, enumerate the source synchronously and `await` each item
inside an ordinary `for-of` loop. A genuinely streaming source cannot be
consumed from a compiled agent.

### Keep heavy work in synchronous helpers, not async ones

The `"use agent"` directive makes the compiler translate **every asynchronous
function in the agent's module** — the `run` body and any `async` function it
nests or calls within the same file — into state-machine steps. It does
**not** translate **synchronous** functions (those are hoisted and left as
ordinary JavaScript), and it never touches code in other files. So the lever
for heavy *pure* computation is simple: **make it a synchronous function.** The
async/sync distinction is what matters here, not where the function lives.

A synchronous call runs to completion within a single step of its caller,
which has two payoffs:

1. **Nothing extra is serialized.** A sync helper isn't compiled at all — it's
   hoisted to the closure as an ordinary function and runs inside its caller's
   current step, so its intermediates — a 5,000-element array, a large `Map` —
   are plain JS locals that never enter `$frames` and so are never serialized.
   (What *is* captured at each `await` is the live frame stack of the compiled
   code.) Mark that same helper `async` and it becomes part of the state
   machine: its locals move into frame slots and serialize at every suspension
   like everything else.

2. **It runs as plain JS, and it can't blow the step budget.** Compiled code
   is native JavaScript, but the compiler lowers every loop into numbered
   state-machine steps and each iteration costs one metered step against a
   budget (1,000 per refill). A genuine `await` resets the refill counter, but a tight
   compiled loop never yields — so a few thousand iterations of pure arithmetic
   exhaust the budget repeatedly, and after a fixed number of refills without
   yielding (10 by default, i.e. \~10,000 steps) the runtime **stops the agent**
   with "Agent ran too many synchronous steps without yielding." A sync helper
   sidesteps this entirely: it runs as one ordinary native loop, off the meter.

Keep `run()` a thin **orchestrator** — tool calls, `task.gather`, control flow
— and push date parsing, bucketing, aggregation, statistics, and large-array
assembly into **synchronous** helpers (module scope is the natural home):

```typescript theme={null}
// ✅ run() awaits I/O; the heavy loop is a plain sync function
const pages = await task.gather([
  listRuns(currentId, 1),
  listRuns(previousId, 1),
]);
const { skipped, regressed } = analyzeRuns(pages, cfg); // sync → not compiled

// ❌ marking the same helper async pulls it into the state machine — its big
//    intermediates now serialize at every await, for no benefit
const { skipped, regressed } = await analyzeRuns(pages, cfg)
async function analyzeRuns(pages, cfg) {
  /* parse dates, bucket, median... */
}
```

Note that `run()`'s own loops are compiled too: each iteration spends one step
against the budget. That's fine for tens or hundreds of items, but if the
orchestrator itself iterates over thousands, move that loop into a sync helper
as well — the budget doesn't care whether a loop is "setup" or "work."

The sync helpers are also independently unit-testable, since they never touch
`task`.

(This applies only to compiled `"use agent"` agents. Self-managed-state agents
— the `start` / `onToolResults` pattern — have no directive and aren't compiled
at all.)

### Compilation required for sub-agents and service hooks

Calling a sub-agent or service hook from an uncompiled auto-managed state agent crashes at runtime. To prevent this, Guild validates at build time that any auto-managed state agent using these tools is compiled.

An auto-managed state agent must be compiled with the `"use agent"` directive when it registers or calls:

* Sub-agents (tools of `toolType: "agent"`).
* Individually registered integration service hooks.

Bundled platform hook services — such as `ui`, `guild`, and `console` — are exempt and do not require compilation.

<Warning>
  Saving or publishing an uncompiled auto-managed state agent that registers sub-agents or integration service hooks fails with a build validation error, which blocks the publish. Add the `"use agent"` directive to the top of the agent's main module to compile it, or remove those tools.
</Warning>

## Importing text assets

Guild compiles and bundles your TypeScript agent with esbuild during the server-side build. So that you can import bundled files as strings, the build applies a fixed text-loader whitelist: files with a whitelisted extension are read as raw text through esbuild's text loader. You cannot override this whitelist from your local `bundle` script.

The server-side build loads imported files by extension:

| Extension | How the server-side build loads it |
| - | - |
| `.md`, `.org`, `.txt`, `.yaml`, `.html`, `.css` | Read as raw text using esbuild's text loader. |
| `.json` | Imported and parsed into a JavaScript object using esbuild's default loader, not as text. |
| Any other extension | Fails the build with an error such as `No loader is configured for ".png" files`, unless you handle the file with your own custom pre-bundling. |

Import a whitelisted text asset like any other module:

```typescript theme={null}
import emailTemplate from "./email-template.html"
import widgetStyles from "./widget.css"
```

## Parallel tool calls with `task.gather`

`Promise.all` over tool calls is an anti-pattern here: it hides the tool-call promises from the runtime and does not survive serialization (see [Limitations](#limitations) above). For auto-managed state agents (`"use agent"`), the supported way to fan out **independent tool calls concurrently** is `task.gather` and `task.gatherSettled`. The runtime allocates every subtask atomically, dispatches them as a single batch, suspends the state machine while they run, and assembles the results in source order on resume.

### One agent, one job

The same work over N inputs — process every file, fetch every PR, summarize every issue — belongs in **one** compiled agent that maps those inputs to tool calls in a single `task.gather`. Do not create a second sub-agent just to gain concurrency: `task.gather` already runs the batch in parallel inside the single agent.

```typescript theme={null}
const results = await task.gather(
  input.repos.map((repo) =>
    task.tools.github_repos_get({ owner: input.owner, repo }),
  ),
)
```

The `.map()` builds the array inline in the `task.gather` argument, so no promise is ever stored in a local across an `await` — see [Rules and limits](#rules-and-limits).

### `task.gather` — fail fast

Analogous to `Promise.all`: resolves to an array of results in source order, or rejects on the first failure.

```typescript theme={null}
"use agent"

import { type Task, agent, pick } from "@guildai/agents-sdk"
import { gitHubTools } from "@guildai-services/guildai~github"
import { z } from "zod"

const tools = {
  ...pick(gitHubTools, ["github_pulls_list", "github_issues_list_for_repo"]),
}
type Tools = typeof tools

async function run(input: Input, task: Task<Tools>): Promise<Output> {
  const [pulls, issues] = await task.gather([
    task.tools.github_pulls_list({ owner, repo, state: "open" }),
    task.tools.github_issues_list_for_repo({ owner, repo, state: "open" }),
  ])

  return {
    type: "text",
    text: `${pulls.length} open PRs, ${issues.length} open issues`,
  }
}
```

Results are fully typed: `task.gather([a, b])` returns a tuple whose elements are the awaited return types of `a` and `b`, in order.

### `task.gatherSettled` — collect every outcome

Analogous to `Promise.allSettled`: never rejects. Each entry is a `PromiseSettledResult` describing whether that call fulfilled or rejected, so one failing call doesn't sink the rest.

```typescript theme={null}
const results = await task.gatherSettled([
  task.tools.github_repos_get({ owner, repo: "a" }),
  task.tools.github_repos_get({ owner, repo: "b" }),
])

for (const result of results) {
  if (result.status === "fulfilled") {
    task.console.info(`got ${result.value.full_name}`)
  } else {
    task.console.warn(`failed: ${result.reason}`)
  }
}
```

### Rules and limits

* **Inputs must be tool-call expressions** — `task.tools.X(...)`, sub-agent tool calls, or hook tools. The `ToolCallPromise` brand on the parameter type rejects arbitrary promises (`fetch(...)`, timers, library code) at compile time. This is the deliberate boundary that makes `gather` work where `Promise.all` can't: every input is a dispatchable tool call the runtime can serialize, not an opaque promise.
* **Build the array inline at the call site.** Tool-call promises are promises, so an array of them held in a local variable is live in a frame slot when `gather` suspends, and serialization fails — see [A promise held in a local across an `await`](#a-promise-held-in-a-local-across-an-await). Pass an array literal in the argument.
* **Use only from a compiled (`"use agent"`) agent body.** Self-managed state agents already fan out in parallel by returning `callTools([...])` with more than one entry — they don't need `gather`.

## When to use auto-managed state

| Situation | Use auto-managed? |
| - | - |
| Algorithmic, sequential logic | Yes |
| You want minimal boilerplate | Yes |
| You need parallel tool calls | Yes — use [`task.gather`](#parallel-tool-calls-with-task-gather) |
| You need full control over state | No — use [self-managed state](https://docs.guild.ai/guide/self-managed-agents) |
