# Harness, graph and UI-loop design for ScopeWatch

Research cutoff: 9 October 2026. Firecrawl developer discovery was followed by selective primary-source extraction. This report explains the prompt's design; it does not measure that prompt, run a team or implement the application.

## New evidence worth applying

Anthropic's **24 March 2026** application-harness article describes planner, generator and separate evaluator stages, feature-level agreements and an evaluator interacting with the actual app through Playwright. Its examples also show cost/complexity tradeoffs and cases where a later subjective iteration was not the preferred result. ScopeWatch borrows independent evaluation and testable feature contracts, not the article's broad scope expansion or 5–15 design rounds. Our three-round UI cap is a deadline choice, not a researched optimum. [Primary article](https://www.anthropic.com/engineering/harness-design-long-running-apps).

The **26 November 2025** long-running-agent article identifies premature completion, half-built features and missing end-to-end verification. It uses progress artifacts and incremental feature work to support later sessions. ScopeWatch consequently requires actual feature receipts and durable handoff, while treating the inherited fixture oracle as research rather than implemented-product proof. [Primary article](https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents).

The **29 September 2025** context-engineering article advocates high-signal context, on-demand retrieval, compaction and structured notes. A larger context window does not make dumping every archive useful. ScopeWatch uses a compact auto-loaded instruction file, one lead prompt, scoped role briefs and domain-specific files; source documents remain data rather than authority. [Primary article](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents).

The newer dated creator practices and exact current team/model/goal contracts are separately audited in [CREATOR_METHODS](CREATOR_METHODS.md) and [CLAUDE_CAPABILITIES](CLAUDE_CAPABILITIES.md). They must not be conflated: first-person workflow stories are not tool API guarantees, and product documentation is not evidence of an author's private habits.

## What graph engineering means here

| Graph | Nodes / edges | Useful job | Limit |
|---|---|---|---|
| Build dependency DAG | Features/evidence gates and prerequisites | Expose critical path and truly independent work | Does not create missing credentials or make sequential work parallel |
| Native identity graph | Authenticated security event, actual task/agent/caller/version | Establish the actual policy subject | Cannot be replaced by task tracker or root/display label |
| Code dependency map | Modules, DTOs, imports, database/API boundaries | Assign write ownership and assess change impact | A pretty diagram does not establish runtime behavior |
| Claim/evidence map | Claim → native source/query/result/check/review | Prevent unsupported “done”/native-success assertions | Hashes alone do not authenticate source or prove finality |
| Graph of Thoughts | Separately defined LLM reasoning operations | A research technique/framework with its own evaluation | Not a synonym for agents, task dependencies or the native Guild graph |

The [official Graph of Thoughts implementation](https://github.com/spcl/graph-of-thoughts) models operations executed with an LLM and includes specific examples. Its existence does not establish improved ScopeWatch coding, production UI quality or a creator endorsement. We do not add its package, a graph database or LangGraph as an event dependency.

Neither reviewed creator source endorses a named graph-prompting algorithm. Our task/evidence graph is a synthesis for this repository. In particular, local acceptance/review/handoff must remain schedulable while native prerequisites are pending; a DAG that makes all QA depend on live verification defeats the stated fallback.

## Four nested feedback loops

1. **Feature loop:** bounded contract → one owned vertical slice → focused behavior check → independent acceptance → targeted repair → integration receipt.
2. **Native-evidence loop:** actual source → complete captured cohort/mapping → canonical generation/readback → historical SQL → reviewed human action → actual fresh effects. A missing account prerequisite cannot be substituted with a fixture.
3. **UI-quality loop:** agreed rubric → working real-endpoint page → independent interaction/screenshots → specific refinements. Preserve the best passing checkpoint; aesthetics never override functionality or source honesty.
4. **Continuation/handoff loop:** actual Task/proof state → next ready work → concise transcript evidence → checkpoint/resume. Native `/goal` can continue turns but its evaluator does not independently run checks.

Each has a termination condition, resource/deadline bound and unknown/failed state. Native unknown mutation outcomes are reconciled before retry. A fixed attempt count can trigger diagnosis/replanning, but it cannot turn a core failure into success.

## UI and acceptance are observable

The prompt defines a bounded industrial operator interface: source-derived subject/control comparison, contributing sessions, current/historical witness, query versus labeled load, exact review scope and actual effects. It specifies all material empty/error/unknown/stale states and tests actual backend interactions. The visual style is a project choice informed by the installed frontend-design guidance, not a measured best design.

Playwright's official practices recommend user-facing behavior, isolated tests and resilient locators. Their accessibility guide explicitly notes that automation finds only some problems. ScopeWatch therefore combines programmatic checks with keyboard/dialog/responsive interaction and inspected screenshots; it does not certify universal accessibility from an axe score. [Best practices](https://playwright.dev/docs/best-practices), [accessibility testing](https://playwright.dev/docs/accessibility-testing).

No test count, screenshot, prompt length, agent persona or model label proves production readiness. The pack distinguishes LOCAL_READY, LOCAL_INCOMPLETE, NATIVE_PENDING/BLOCKED and VERIFIED_LIVE. Remaining source-finality, external-policy-race and account-model constraints stay explicit.

## Evidence limits and source trail

Primary captures are saved in the source research workspace under `.firecrawl/prompt-*`. The packaged [source ledger](SOURCES.json) preserves URL/hash/capture provenance without copying whole copyrighted interviews or configuring accounts. Search hits from third-party summaries were discovery aids, not contract evidence. “Deep research” describes the primary-source selection and synthesis, not an exhaustive crawl of the web.

The prompt pack was statically reviewed for consistency/links/commands/graph structure. It has not been evaluated in a real complete ScopeWatch build, and no model/team/account call was started. Use real event receipts to judge effectiveness and remove optional instructions only when observed evidence justifies it; preserve human and evidence requirements.
