# Semgrep and Pi: vulnerability-first prize strategy

> **Current execution policy:** [Start now or anytime, with no build cutoff](../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Checked 9 October 2026 IST through Firecrawl. **[V]** means source-backed fact; **[U]** means user-provided event rule; **[I]** means inference or recommendation. No code was generated, installed, scanned, attacked or patched during this research pass. Sixteen official pages and three searches were saved under `.firecrawl/semgrep-pi-*`.

Final case priority is refined by the later [published-rule audit](finding-feasibility.md) and [completed recommendation](archive/RECOMMENDATION.md): select actual supported scanner evidence first; the cache case below remains conditional. This file preserves the initial sponsor-profile reasoning.

## Decision

**[I] Recommend a defense that produces a reproducible witness for a subtle authorization failure in AI-generated code, fixes the shared cause, and preserves the witness as a regression test.** The best hunt target is a shared cache in a multi-tenant incident assistant: the database path enforces tenant isolation, but a warmed cache returns protected results before authorization. A stronger second case is an authorized user warming a cache, losing permission, then continuing to receive the cached answer. Tenant-only cache keys cannot fix that case.

For Semgrep, the strongest eligibility path is an **actual built-in Guardian finding in code generated from an ordinary product prompt**, followed by an owned-lab reproduction and verified repair. If Guardian misses the interesting issue, a team-authored local Semgrep rule can find candidate variants and a replay can confirm them. Disclose that the team diagnosed the issue first and authored the rule afterward. Whether that counts for the prize remains an event eligibility question; do not rebrand manual discovery as an earlier Guardian detection.

Pi offers upside without a product integration. Its thesis informs the design, but its award says Most Innovative; that does not establish that copying Pi's workflow is a judging criterion. Differentiate through evidence of cache state and permission transitions, not a general AppSec agent dashboard.

## Current prize rules supersede older assumptions

| Sponsor | Current event rule | Implication |
|---|---|---|
| Semgrep | **[U] Best Vulnerability Detected by Semgrep**, unique/interesting issue in AI-generated code; first $1,000 cash gift card, second $500 cash gift card; both receive 20 credits | Optimize finding quality, impact, provenance and reproducibility. A rule generator or clean scan alone does not satisfy this wording. |
| Pi | **[U] Most Innovative**, three winners each receive an Elgato Stream Deck and gift card, amount unspecified. Prize sponsor only; no product/technology access | Treat as a bonus. Do not promise a Pi integration or assign the gift card a dollar amount. |

The user-provided rules resolve the older archive's uncertainty about whether Pi has a prize and replace assumptions that Semgrep will repeat its 2025 use-of-tool/custom-rules rubric. The supplied details do not settle whether prizes may be stacked. Gift cards, hardware and service credits are separate from cash.

## What prior Semgrep winners made

All three Devpost pages were freshly fetched and show **Winner: Best Use of Semgrep**. None publishes the individual first/second/third rank. Blog or gallery ordering does not establish placement.

| Winner | Project | Semgrep's nameable job | Transferable lesson |
|---|---|---|---|
| [Darwin](https://devpost.com/software/darwin-cmfysv) | Models compete to generate tool code | Security findings feed a model fitness score | The sponsor participates in a decision the audience sees. |
| [CommitDNA](https://devpost.com/software/commitdna-personalized-sec-compliance-tutor-on-your-commits) | Personalized security coaching from commit patterns | Scan personal patterns and validate generated training snippets, as claimed in the submission | Convert a finding into a reusable artifact. |
| [Udon Cat](https://devpost.com/software/udon-cat) | Scan/fix through web, CLI and a Bolt extension | Findings anchor proposed repairs where code is generated | Show actual rule IDs, locations and changed code. |

**[V]** Semgrep's [November 2025 retrospective](https://semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026/) discusses those three stories and AgentSafe's inspection of MCP servers before connection. This is sponsor interpretation, not a judge scorecard. Submission claims are not independently demonstrated implementations.

**[I]** Clear outcomes and visible sponsor contribution transfer. The existing repository's matched winner/loser analysis also shows custom rules, scan/fix loops and MCP in losing entries. None is a sufficient winning formula. Today's finding-centric award further weakens predictions based on the earlier Best Use award.

No historical Pi awardee has been independently verified in the archive or this focused pass. That is an evidence gap, not proof none exists.

## Current Semgrep capabilities and access traps

1. **Guardian scans at generation time. [V]** The [overview](https://docs.semgrep.dev/semgrep-guardian/overview) describes MCP, hooks and skills, returning findings to the agent, which decides whether to regenerate. The [quickstart](https://docs.semgrep.dev/semgrep-guardian/quickstart) recommends remote OAuth plugins for Claude Code/Codex without a local CLI. It confirms the event's Claude command, `claude plugin install semgrep@claude-plugins-official`, followed by a fresh session and browser sign-in.

2. **Recommended remote hooks do not automatically use newly learned rules. [V]** The [rule-configuration documentation](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration) says the recommended Claude remote and Codex plugins scan with fixed `guardian-default`; organization Policies do not apply. Local Claude and other MCP integrations use organization Policies. Guardian-default omits rules without a reliable fix. Run a custom cache rule explicitly through local CLI/custom-rule tooling or an approved policy-aware setup. Do not promise that adding a rule changes the default remote hook.

3. **Community Edition does not prove cross-file authorization. [V]** [Analysis docs](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro) distinguish CE's within-function scope from proprietary Code's cross-function analysis and optional cross-file analysis. Cross-file analysis requires separate setup and does not currently run on diff-aware PR scans. A syntactic cache-key rule produces candidates; it cannot universally prove that authorization is absent in another function, middleware or runtime service.

4. **Business-logic detection already exists. [V]** The [March 18 Custom Workflows launch](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/) describes Pro taint tracing plus model reasoning for missing authorization/IDOR, with its Python SDK in private beta. The [July 28 Agentic Workflows launch](https://semgrep.dev/blog/2026/introducing-semgrep-agentic-workflows-automate-deep-vulnerability-hunting-at-scale/) adds nine prebuilt workflows spanning 70+ CWEs, using Pro analysis, Mandoline slicing and frontier models. Prebuilt workflows are public beta for customers and consume AI credits. Do not hinge a five-hour build on custom SDK/Pro access not promised by the event. Vendor benchmark numbers are not independent project validation.

5. **September 24 supply-chain response is already shipped. [V]** The [malware automation announcement](https://semgrep.dev/blog/2026/introducing-malware-detection-and-response-automation) describes expert-reviewed rule generation, repository rescans and policy-triggered incident responses. Its Guardian malware firewall is private beta and blocks packages at the network layer before installation. A basic package blocker or scan-to-ticket loop duplicates current capabilities; do not assume firewall access.

6. **AI-specific rule packs exist. [V]** The [current AI-defense article](https://semgrep.dev/blog/2026/getting-ready-for-mythos-with-semgrep/) lists AI Security, Agent Skills and Shadow AI packs. Generic prompt-injection scanning is a weak novelty claim. Search excerpts are saved; these packs were not executed or independently counted.

## Pi's latest direction and its limits

**[V] September 29:** [Pi's Compliance API integration](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api) records organization Claude Code sessions and provides security context through Sloane while coding decisions happen. It records which guidance fired and whether it was followed. The post describes guidance without blocking/proxying and targets Claude Enterprise organizations. The event explicitly offers no Pi access.

**[V] Existing thesis:** the [Lemonade case study](https://www.pi.security/customers/lemonade) describes reproduction, locating source/owner, finding variants, proposing a shared fix and turning the lesson into future guardrails. Its timing/impact figures are vendor/customer case-study claims, not targets or verified hackathon performance.

**[V] Variant example:** the [August AWS SDK report](https://www.pi.security/blog/one-word-aws-sdk-cloud-takeover) describes seven SDK variants across six languages, manual confirmation and customer-authorized impact reproduction. The report attributes duplication to conventional SDK code generation, **not LLM-generated code**. Replaying that published issue is a known-research demo, not a new Semgrep finding at this event.

**[I]** Use Pi's idea that a report is one instance of a shared failure. Avoid claiming universal semantic variant discovery from one AST rule or product innovation from copying Pi's marketing flow.

## Three ideation rounds

**Round 1:** Guardian clone, package/MCP firewall, generic AI SOC, report-to-patch agent, cache/permission witness. The first three overlap shipped sponsor products. A broad report-to-patch loop exceeds the event's scope. Cache state gives a narrow, dramatic failure and measurable repair.

**Round 2:** ordinary SQL injection is easier but less distinctive; pure prompt injection is harder to attribute to Semgrep and can depend on stochastic model behavior. Cold-path-secure/warm-path-insecure access is legible, reproducible and crosses a genuine trust boundary. Add revocation only after the simpler witness works.

**Round 3:** keep one generated target, one confirmed issue, one witness, one shared repair and one future regression. Give ClickHouse the actual event timeline/query and Guild restricted execution/patch roles if these are necessary to the larger design. Remove ticket integrations, cross-language promises, vulnerability leaderboards and auto-deployment.

## Owned-lab build plan and provenance

Generate the small incident assistant **during the event** from an ordinary product prompt requesting authenticated tenant incident records, cached summaries and correct authorization. Do not ask the generator to omit a check or create vulnerable code. Preserve prompt, model identifier, generation time, original output and SHA-256 before edits.

Time-box the hunt to about 30 minutes:

1. Prefer a genuine built-in Guardian finding with unusual impact. Save raw scan, rule ID and source SHA.
2. Inspect cache/retrieval permissions. If another agent/human diagnoses the issue first, disclose that before using a custom rule to find candidate variants. Prize attribution is weaker and subject to eligibility.
3. If generated code is secure, do not insert a flaw and call it discovery. The defense remains useful; Semgrep is an opportunity, not guaranteed prize money.

The witness compares a cold denied tenant-B request, tenant A warming its protected result, then B receiving A's artificial marker on the same warm request if vulnerable. An optional second witness warms an authorized user's result, revokes permission, then repeats a cache hit. No real secret or third-party victim is needed.

Log tenant identity from the **verified server-side session**, ownership from the trusted fixture/database, and cache scope from the service. Do not trust tenant/owner claims in request bodies or attacker-controlled logs. A reused key fingerprint or multiple tenants hitting one key is only an investigation signal: safe global cached data can be shared.

Use Semgrep to report **candidate** sites, with positive and negative controls against explicit scoped keys and intentionally global data. Expose identifier/framework dependence; one passing test does not establish rename or unseen-wrapper coverage. Runtime replay is the proof of actual unauthorized protected-data disclosure.

Repair at the shared boundary: authenticate and authorize before returning protected cached data; derive tenancy from verified identity; include all visibility-changing attributes in cache scope; invalidate or version results when permissions change. Tenant prefixes alone miss user ACL differences and revoked permissions. These controls are explicitly recommended by [OWASP Multi-Tenant Security](https://cheatsheetseries.owasp.org/cheatsheets/Multi_Tenant_Security_Cheat_Sheet.html).

Re-run the witness and legitimate same-tenant reads, unauthorized users within one tenant, revocation and cache-hit behavior. Preserve patch and replay. A clean scan means that ruleset no longer reports that pattern; it is not proof the application is secure.

## Devil's advocate

| Challenge | Response or kill criterion |
|---|---|
| Cache leakage and regression tests are established | Correct. [OWASP authorization regression guidance](https://cheatsheetseries.owasp.org/cheatsheets/Authorization_Regression_Testing_Cheat_Sheet.html) already covers caching-related tenant failures. Claim a useful product and interesting real finding, not a new vulnerability class/zero-day. |
| You wrote the rule after discovering the issue | Keep attribution honest. Prefer built-in Guardian detection. Custom-rule-after-diagnosis eligibility is uncertain. |
| The lab was planted | Seeded fixtures demonstrate a defense but differ from organic generated-code findings. Label provenance prominently. Synthetic tenant data is fine; intentionally insecure target code is a different claim. |
| A missing tenant name is not an exploit | Agreed. Static rules produce candidates; trusted ownership and a denied principal receiving a protected marker establish the witness. |
| Tenant-only keys do not fix revocation | Authorize every protected cache return and validate permission version/invalidation behavior. |
| Sponsors already offer these workflows | Avoid cloning general analysis/context products. Focus on stateful witnesses and verified recurrence; acknowledge existing capabilities. |
| Too broad for five hours | One cache boundary, one issue, one patch. General rule synthesis, multiple issues and a broad variant hunt are optional cuts. |
| Tools are decorative | Each sponsor needs a visible necessary job. A tool tag or logo alone is not a prize strategy. |

## Submission evidence and demo

Preserve generated-code provenance; exact Semgrep output and detection origin; file/line and source SHA; the cold/warm or revocation witness; actual patch; before/after responses; rule controls and regression results; and limitations. Label synthetic load, precomputed runs and deliberately seeded fixtures. Never use fake rule IDs or synthetic scanner results presented as live.

The pitch can lead with: **The database protected the incident, but the warmed cache bypassed its permission boundary.** Show the witness, Semgrep's exact contribution, the shared fix and the same request denied afterward. Make measured query/agent decisions visible, not just sponsor logos.

## Source register

Sixteen saved official pages:

- `semgrep-pi-guardian-quickstart.md`, `semgrep-pi-guardian-overview.md`, `semgrep-pi-guardian-rules.md`: installation, generated-code scanning and fixed-ruleset constraint; links appear above.
- `semgrep-pi-pro-analysis.md`, `semgrep-pi-custom-workflows.md`, `semgrep-pi-agentic-workflows.md`: analysis scope and access; links above.
- `semgrep-pi-malware-sep24.md`: recent malware product; link above.
- `semgrep-pi-winner-retrospective.md`, `semgrep-pi-darwin-award.md`, `semgrep-pi-commitdna-award.md`, `semgrep-pi-udon-award.md`: sponsor interpretations and official category badges; links above.
- `semgrep-pi-compliance-sep29.md`, `semgrep-pi-lemonade.md`, `semgrep-pi-variant-analysis.md`: Pi launch, case study and known research; links above.
- `semgrep-pi-owasp-tenant.md`, `semgrep-pi-owasp-auth-regression.md`: secure cache behavior and novelty baseline; links above.

Three saved searches: `semgrep-pi-search-current.json`, `semgrep-pi-search-pi-current.json`, `semgrep-pi-search-cache-isolation.json`. The AI rule-pack claim comes from the fetched official excerpt in the first search, not a registry execution/count. Other important claims use full saved pages.

## Rerun inputs

workflow: firecrawl-deep-research

topic: Semgrep/Pi historical winners, current capabilities and vulnerability-first Cyberdefense Hackathon strategy, excluding Akash

depth: thorough sponsor subtask within parallel research

output: Markdown analytical report
