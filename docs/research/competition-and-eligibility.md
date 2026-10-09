# Competition and current-event eligibility audit

Checked 9 October 2026 IST. Exhaustive follow-up to the initial research/build brief; no competition project was built, scanned, deployed or tested. This pass uses official product documentation, vendor product announcements, official project submissions, and the existing archive's primary-source code/award forensics. Akash excluded.

## What changes after checking competitors

**There is no defensible market-novelty proof for the proposed generic workflow.** Production products already combine runtime telemetry and code, analyze likely root causes, prioritize vulnerabilities, generate fixes/PRs, and test authorization across identities. Sponsor products themselves cover much of the suggested architecture. Neither “code-to-runtime” nor “two tenants test one endpoint” is a new category.

That does not invalidate a hackathon project. An authentic, surprising issue in ordinary AI-generated code, a working bounded investigation, and a short evidence-focused demonstration can be worthwhile. Describe the specific finding and demonstrated result rather than claiming to be the first platform for contextual security, runtime prioritization or automatic remediation. No probability of winning follows from these competitor comparisons.

The exact cache bug remains conditional. Select an actual supported finding first. If it is a cache fast-path authorization failure, the useful small contract is: **under fixed identity and policy, warming a cache must not change which protected data the principal may receive**. Show the cold/warm difference, aggregate actual observed violations, and replay the identical sequence after a reviewed repair while legitimate use still succeeds. This is a focused demonstrator and evidence receipt, not a claim to outperform the following products.

## Six named alternatives and overlapping capabilities

All undated documentation was inspected during this pass; that is an access date, not a verified launch date. “Documented” does not mean tested or available in an event account. Silence in one inspected page is not evidence that a product lacks a feature elsewhere.

| Product / source | Date and stage supported by the inspected source | Already-covered territory | Consequence for this project |
|---|---|---|---|
| [Sentry Seer Autofix](https://docs.sentry.io/product/ai-in-sentry/seer/autofix/) | Current undated docs. SCM support described for GitHub.com/GitLab.com only. Slack Autofix explicitly Early Adopter. No broad GA date verified. | Uses issue details, traces, logs, profiles and source repositories for root cause, solution, generated patch/PR and CI-driven PR iteration; can hand off implementation to coding agents. | Telemetry → source explanation → PR is already a product. Make the security witness, scope and tested preserved behavior explicit. Do not assert that Sentry cannot verify fixes; its docs include CI iteration. |
| [Datadog Bits Investigation](https://docs.datadoghq.com/es/bits_ai/bits_investigation/) + [Runtime Code Analysis/IAST](https://docs.datadoghq.com/security/code_security/iast/) | Current undated docs. The old Bits AI SRE page still exists; current navigation names Bits Investigation. IAST coverage is language/framework specific; retrieved page displays an availability warning for selected US1 site, so do not imply universal regional access. | Bits gathers telemetry and reasons through production issues. IAST follows user-controlled data to vulnerable sinks in running services, supplies file/method/line and runtime exploitability context, and supports ticket/automation workflows. | “We use real runtime evidence instead of static findings alone” is established. A trusted authorization relation and immediate controlled pre/post witness are a particular project contract, not an industry first. |
| [Endor Labs + Microsoft Defender for Cloud](https://docs.endorlabs.com/integrations/microsoft-defender-for-cloud) | Current undated integration docs. Requires an Endor deployment/namespace/read-only key, enabled Defender CSPM, connected repositories and appropriate tenant/subscription permissions. No free event access or GA launch date established. | Correlates SCA findings with runtime alerts, maps code-to-runtime attack paths, and prioritizes reachable OSS vulnerabilities in deployed cloud workloads. | Do not pitch source/runtime correlation as new. A first-party AI-generated authorization bug is a different narrow subject from the documented OSS reachability integration, but broad superiority is unproven. |
| [StackHawk Business Logic Testing / BOLA](https://www.stackhawk.com/blog/understanding-and-protecting-against-api1-broken-object-level-authorization/) | Official article dated **30 January 2026**. Describes available multi-profile configuration; no specific beta/GA or pricing entitlement established. | Uses multiple authentication profiles and privilege levels; discovers resources as one profile, attempts access as another, and runs authorization regression testing in CI/CD. | Two-user/tenant testing and behavior verification are direct prior art. Focus on a surprising real generated implementation, cache-state differential, data impact and immutable-by-policy verifier inputs in the proposed demo; do not claim exclusive ownership of those techniques. |
| [ClickStack MCP + LLM observability](https://clickhouse.com/blog/whats-new-in-clickstack-august-2026) | Published **16 September 2026**, covering v2.34–v2.38. Dashboard variables GA; LLM dashboard beta; TimeSeries/PromQL private preview managed, experimental OSS. | Conversation/tool/cache-hit traces, release markers, formula alerts, richer webhooks; `clickstack_emerging_signals` compares log patterns across windows and `clickstack_query_tiles` checks dashboards. | A log-investigation chatbot or generic LLM trace UI overlaps the sponsor. Use existing capabilities as infrastructure and contribute an inspectable security predicate plus evidence-to-action state transition. |
| [Guild Software Factory](https://docs.guild.ai/platform/factory.md), [security architecture](https://docs.guild.ai/platform/security-architecture.md) | Current undated docs. Smith commissioning configures an eight-agent roster; end-to-end test spends real agent credits with no hard cap. No fresh launch date established. | Labeled issue → plan → implementation → reviewed PR, managed runtime verification/repair, hosted agent sessions, secretless mediated credentials and permission policies. | Generic issue-to-PR orchestration and “we govern agents” duplicate the sponsor's platform. Build one purpose-specific investigation/evidence tool or workflow that Guild really hosts; show the actual session and restricted operations. |

Two further overlaps were already researched by the Semgrep/Pi lane and are not counted as extra alternatives in this table: [Semgrep Agentic Workflows](https://semgrep.dev/blog/2026/introducing-semgrep-agentic-workflows-automate-deep-vulnerability-hunting-at-scale/) (28 July 2026 public beta for customers) hunts authentication/injection/business-logic defects, while [Custom Workflows](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/) describes typed pipelines for detection, triage, validation and remediation, with custom SDK access in private beta. Pi's contextual finding and repair stories also weaken a generic “security memory plus repair” novelty claim. Follow the other lane's source register for their access qualifications.

## The smallest feasible differentiated wedge

Do not implement six products. Build one **evidence-bearing case** around a genuine issue:

1. Preserve the ordinary generation prompt, original code/output/commit, and actual Semgrep rule/finding/error artifacts. The source location and finding attribution must be genuine. If the team first diagnosed the issue manually, state that sequence and treat any later custom rule as confirmation.
2. Use an owned target with trusted principal/object fixtures. The observer derives the authenticated actor and served-resource ownership independently of attacker-supplied tenant headers and of an assertion made by the vulnerable target.
3. For the conditional cache case, freeze relevant identity/policy/content versions and reproduce cold → privileged warm-up → unauthorized warm read. Record actual returned markers/resource IDs, including legitimate controls. This isolates a cache-state effect rather than narrating an LLM's suspicion.
4. ClickHouse changes the case from **source candidate** to **observed violation** when the query returns genuine unauthorized-response evidence. Count affected requests/resources for the observed sample. Absence of observed violations means “unobserved,” not “safe.”
5. That state change actually launches or changes a **Guild-hosted investigation** with bounded evidence. Preserve the genuine session URL and tool events. A separate operator/PR action is optional; one useful hosted investigator is enough for the core.
6. A reviewed patch is followed by an independent verifier using the same frozen inputs from fresh cache/process state. The receipt contains original and patched code versions, test/fixture hashes, returned objects/statuses, legitimate-use results, timestamps and real scan status. A hash provides tamper evidence; it does not by itself make a mutable artifact immutable or prove comprehensive safety.

The differentiation is the specific case and evidence discipline. The inspected competitor pages do not establish an identical packaged contract, but that is **not proof no competitor offers it**. Avoid “world first,” “guaranteed exploitability,” “zero vulnerabilities,” “no false positives,” and “all authorization bugs” claims.

For a five-hour build, begin with one language/backend, one actual bug, one instrumented route, one SQL predicate/aggregate, one hosted investigator and one case screen. Defer factories, full IAST, fleet inventory, universal reachability, dashboards assembled by agents and autonomous merges. Cloud/auth availability is a practical dependency, not proof that a competitor could not implement the idea.

## Logging-only ClickHouse versus an analytical detector driving Guild

| Demo behavior | Why it is weak/strong under the supplied current rubric | Honest claim |
|---|---|---|
| Insert Semgrep findings, then show a count | ClickHouse is a storage sink; little dependence of investigation on high-volume data. | “We retain scan results in ClickHouse.” |
| LLM reads an arbitrary sample of logs and declares an attack | Model judgment is hard to validate; the true authorization relation may be absent. | “The model suggests a hypothesis for review.” |
| A fixed query over stored runtime events finds an unauthorized protected-object response and changes the case state | Analytics produces checkable evidence, and the next hosted investigation genuinely depends on it. | “This query observed this violation in this sample and started this investigation.” |
| Controlled pre/post replay plus legitimate controls closes the demonstrated path | Establishes a concrete security outcome without equating no new logs with safety. | “The same unauthorized read failed after this patch, and these legitimate reads passed.” |

Disclose replay/synthetic rows and separately identify live owned-lab requests. A million-row seeded table is not a million real attacks or production traffic. Measure rows read, SQL latency and sample size, insert-to-alert lag and hosted-investigation time separately. A 20 ms aggregate does not make an end-to-end model workflow 20 ms. No benchmark was run in this research pass.

The current user-provided ClickHouse rubric explicitly mentions scale, query/response latency and insight-to-detection/remediation. Therefore a query that decides whether/what to investigate is a more direct fit than logging alone. This is a rubric interpretation, not a guaranteed winning requirement derived from historical outcomes.

## Historical counterexamples to a simple winning formula

Existing archive code reads and gallery evidence are used here; these are selected cases, not a complete population or official judge scores. Public submissions describe the builders' claims, while code/demo forensics test some of them.

- **[IncidentSherpa](https://devpost.com/software/incidentsherpa), Harness, 12 June 2026:** the user's own team's project already presented typed incident events, real ClickHouse window SQL and grounded postmortem context. The corrected archive records that it **won Senso and lost ClickHouse/Guild**. It was not a total failure. The archive identified on-screen broken Guild configuration and sponsor sprawl; these are plausible execution problems, not proven causal reasons for the result. “SQL finds cause then agent acts” is not sufficient by itself. Primary repo: [nihalnihalani/harnesshack](https://github.com/nihalnihalani/harnesshack); existing audit: `analysis/why-they-won/harness-2026.md`.
- **[LicenseTrace](https://devpost.com/software/licensetrace), London, 26 June 2026:** verified ClickHouse award membership despite the archive's inspected implementation writing a single constant ClickHouse row. Exact rank remains unconfirmed. A good security/legal story and demonstration can coincide with a thin sponsor implementation. Do not copy the thin integration: today's packet asks for meaningful scale and low-latency insight. Primary source: [server.js](https://github.com/Welddevelopment/Tokens-Hackathon---Codebase-Dependencies-Scanner/blob/main/server.js); audit: `analysis/why-they-won/clickhouse-2026-agentic-london.md`.
- **[research-agent repository](https://github.com/dylanbryan2002-wq/research-agent), Ship to Prod, 24 April 2026:** archive inspection found a real Guild `llmAgent`/`guildTools` and a documented daily trigger, while the comparison recorded no Guild award. Real platform usage alone was insufficient. The project/video narrative and eligible field matter; do not derive a numeric probability from this one counterexample. Audit: `analysis/why-they-won/ship-to-prod-2026-guild.md` and `analysis/guild-ai/_DEVILS_ADVOCATE.md`.

Countervailing winners remain useful: Rokko's stream/aggregate/action loop, TC Pilot's product-level analytics result, DailyGate's physically different tool grants and Argus's secretless ticketing step. Several historical ranks are participant claims; none demonstrates this event's stacking rules. Old event prize criteria, three-tool rules or tolerated submission problems must not be imported into the current event.

## Current-event submission/rules trail

Followed actual supplied or discovered links. **No event slugs were guessed.** No registration, login, account creation, messages or submission occurred.

| Trail | Retrieved evidence | What it does and does not establish |
|---|---|---|
| [Current Luma Cyberdefense page](https://luma.com/cyberhack), already saved as `.firecrawl/root-event.md` | Exact 9 October SF event, themes, judges/partners, 4:30 submission, 5:00 judging; links AWS registration and tokens& calendar/social/newsletter. | Supports public event identity/agenda. Retrieved text has no itemized prize table, award-stacking rule or demo-duration rule. |
| [tokensand.ai events](https://tokensand.ai/events) | Public organizer events list embeds/links this exact Luma event. | Does not supply an event-specific submission, prizes or rules page in the captured links. |
| [tokensand.com tools](https://tokensand.com/tools) | Lists exact current Luma event in a live-events strip and a generic “Submit project, tool, product, or perk” link. | Generic builder publication must not be assumed to be the hackathon submission portal. The captured “events/build” link was for NYC's different same-day event, so it was not repurposed by altering the event parameter. |
| [tokensand.com generic submission](https://tokensand.com/perks/submit) | Redirects to sign-in; registration return path indicates generic developer/perks submission. | No current Cyberdefense eligibility/prize/stacking/video evidence retrieved. No authenticated access attempted. |
| [AWS registration linked from Luma](https://events.builder.aws.com/B79KK1?utm_source=chatgpt.com) | Firecrawl failed to retrieve the page after its built-in engines/retry. | Contents remain unverified. A retrieval failure does not mean no rules exist there. |

The user's current packet therefore remains the itemized prize/submission source. It establishes one project/team, up to four people, build during event, accessible GitHub, short shareable demo, tools/build description and names/contact emails. It does **not** establish stacking, exact demo duration, sponsor-category opt-in, payout terms, whether a custom-confirmation Semgrep rule qualifies, or whether all three monetary categories can be entered together.

Keep the monetary ceiling qualified: $3,000 face value from top ClickHouse/Guild/Semgrep awards **only if they may stack**, plus non-cash credits and Pi's unspecified gift card/hardware. Public links checked in this pass neither approve nor prohibit stacking. Historical Branch/Vital Signal multi-prize wins are precedent at other events, not current permission.

The safe decision sequence is to choose a real eligible finding, verify actual ClickHouse/Guild setup early, and confirm current rules with the event materials/mentor at kickoff. Until Semgrep attribution is accepted and a real finding exists, the project can target a useful ClickHouse/Guild demonstration with Pi as innovation framing; do not present a seeded benchmark as an authentic Semgrep prize discovery.

## Source register

### Newly retrieved official sources

| Source | Date/stage note | Saved artifact |
|---|---|---|
| Sentry Autofix docs, URL above | Undated current docs; Early Adopter qualifier for Slack; no launch date verified | `.firecrawl/competition-sentry-autofix.md` |
| Datadog old Bits AI SRE docs, [official Spanish page](https://docs.datadoghq.com/es/bits_ai/bits_ai_sre/) | Undated current accessible page; older naming retained | `.firecrawl/competition-datadog-sre.md` |
| Datadog Bits Investigation docs, URL above | Undated; current navigation/product naming | `.firecrawl/competition-datadog-investigation.md` |
| Datadog IAST docs, URL above | Undated; language/site availability qualified | `.firecrawl/competition-datadog-iast.md` |
| Endor Labs Defender integration docs, URL above | Undated; configured enterprise integration and permission prerequisites | `.firecrawl/competition-endor-defender.md` |
| StackHawk BOLA article, URL above | 30 January 2026; configuration described, entitlement not verified | `.firecrawl/competition-stackhawk-bola.md` |
| Guild Software Factory docs, URL above | Undated; commissioning and credit-spending test workflow documented | `.firecrawl/competition-guild-factory.md` |
| IncidentSherpa official project submission, URL above | 12 June event from archive; builder claims in page, no measured project numbers adopted here | `.firecrawl/competition-incidentsherpa.md` |
| tokensand.ai events, URL above | Accessed 9 October IST; exact event listing | `.firecrawl/competition-organizer-events.json` |
| tokensand.com tools, URL above | Accessed 9 October IST; generic builder/event links | `.firecrawl/competition-organizer-tools.json` |
| [tokensand.com homepage](https://tokensand.com/) | Accessed 9 October IST; builder directory and generic submission links | `.firecrawl/competition-organizer-home.json` |
| tokensand.com generic submission, URL above | Sign-in gate; no authenticated/rules evidence | `.firecrawl/competition-organizer-submit.json` |

Reused official ClickStack, Guild security/policy/trigger/index, Semgrep workflow and Luma captures are inventoried in `clickhouse-guild.md` and `semgrep-pi.md`. Firecrawl search outputs: `.firecrawl/competition-*-search.json`. Search feedback was sent after using non-empty results; one overly compound Datadog search returned no results and created no file. AWS retrieval failure is recorded above and not used as factual page evidence.

Rerun inputs: workflow = firecrawl-deep-research + firecrawl; depth = exhaustive follow-up; topic = competing defensive AI/code-to-runtime/authorization products, selected historical counterexamples, actual linked current-event eligibility sources; output = Markdown research/build brief; no implementation.
