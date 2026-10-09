# Semgrep advocate: Code Vaccine, an admission gate for the next AI feature patch

Prepared 9 October 2026 IST. Research and planning only. **[V]** means primary-source fact, **[U]** means the supplied event packet, and **[I]** means design judgment. No generated finding, scan, implementation, outcome or prize odds are claimed. The out-of-scope sponsor is excluded; there is no invented judging score or row-count floor.

## Position

**[I] My concrete project is Code Vaccine: “Can I accept this new AI-generated feature patch without reopening the authorization bug I just fixed?”**

Use one ordinary AI-generated incident-export micro-app, one authentic stock Semgrep finding, one frozen authorization contract and one admission decision. The product returns a useful yes/no/incomplete gate for a future patch, with the source finding, required legitimate behavior and failed protection attached. It does not run a model tournament, manufacture a vulnerability corpus, or rank LLMs by a small sample.

This is a **conditional Semgrep-first recommendation**. If a genuinely interesting eligible issue is not found within 20–30 minutes, this advocate does not justify continuing a discovery hunt merely to preserve the pitch. The prize-strategy review is right that three equal $1,000 ceilings do not make the most uncertain one automatically the lead track.

## The exact human problem and case

**[I] User:** a developer using an agent to add exports to a tenant-based incident system. After fixing a real auth bug, they want the agent to add CSV output or a new report field without silently relaxing the security rule again. A “scan clean” message cannot tell them whether legitimate exports still work or whether the same protected request has become allowed again.

Generate one small Flask or TypeScript app during the event from normal product requirements: tenant isolation, reader/admin roles, JWT-backed authentication, incident viewing and an export endpoint. Require correct authorization; do not request insecure decoding, missing checks, a particular scanner pattern or intentionally vulnerable code. Preserve the initial prompt, model, time, untouched output and hash before any repair.

**[I] Preferred organic finding:** decoded or explicitly unverified JWT claims determine tenant/admin authority for an export. This is conditional, not a flaw we know the generator will produce. The interesting finding would be the actual authorization consequence in that workflow, rather than a novelty claim about JWTs. If decoded claims are only displayed or are verified elsewhere before a decision, that is not this finding.

**[V]** The current public Guardian bundle contains `python.jwt.security.unverified-jwt-decode.unverified-jwt-decode`, which matches the inspected signature-verification-disabled forms, and `javascript.jsonwebtoken.security.audit.jwt-decode-without-verify.jwt-decode-without-verify`, whose audit confidence is LOW. [Primary bundle](https://semgrep.dev/c/p/guardian-default). Exact patterns, version IDs and checksummed snapshots are in [finding-feasibility.md](../finding-feasibility.md). Catalog membership is not proof that a target matches or is exploitable.

Do not confuse this JWT trust problem with OAuth issuer/resource-metadata attacks reported elsewhere. They are different failure classes and no advisory establishes that this hypothetical generated app has either one.

## One product loop, with a concrete endpoint

1. **Discover:** run actual Guardian/stock scanning on the preserved generated app. Show rule ID, file/line, original source SHA and raw output.
2. **Confirm:** an independent owned-lab harness shows a protected export permitted when the fixture's authorization contract says deny. Synthetic incident markers establish the returned object, not real customer secrets. Legitimate authorized viewing/export is the positive control.
3. **Freeze the vaccine:** retain the offending request class and allowed-behavior contract outside the patch agent's writable files. Record the trusted fixture and verifier hashes. A human approves the intended authorization rule; the LLM does not define its own successful test.
4. **Repair:** propose a minimal source change restoring trusted identity/authorization. Re-run the same negative and positive checks from fresh process state.
5. **Admit the next patch:** the new CSV/report feature is accepted only after the required protection checks and legitimate feature checks finish successfully. A missing run, scanner error or failed protection gives incomplete/hold, not success.

**[I] The demonstration's dependable final challenge is a disclosed rollback to the original bad source**, using its original hash. The gate must reject that known bad change and accept the verified fix. This is a regression challenge, not a claim that a second AI spontaneously reintroduced the bug. An actual subsequent AI feature patch is a bonus if it completes; do not rely on a fresh stochastic generation to produce the stage payoff.

The smallest product artifact is a reviewable **patch admission receipt**: original finding, frozen policy version, target/verifier hashes, actual test outcomes, legitimate feature outcomes, SQL decision and real hosted-review session. This is narrower than BoundaryProof's post-incident blast-radius workbench: its decision is whether the next change may be admitted.

## Necessary sponsor jobs

### Semgrep: original finding and continued source check

**[U]** This event rewards a unique/interesting issue found in AI-generated code. It does not repeat the previous Best Use rubric. The first finding must remain the center of the submission; “vaccine framework” alone does not satisfy the award.

**[I]** Keep the actual stock detector as the source evidence. The behavioral contract supplements it; a clean scan never substitutes for runtime checks. For the preferred Python case, prove claims are used for protected authorization, not only that the rule matches `verify_signature: False`.

**[V]** Recommended remote Guardian hooks use a fixed ruleset; new organization rules do not automatically apply. [Official configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration). This project avoids a newly learned custom cache rule as its discovery premise.

### ClickHouse: live admission and recurrence query

**[I]** ClickHouse stores source versions and streams independent evaluation events across version, route, role, tenant, policy version and feature requirement. Its query determines whether the current patch has a complete passing contract and groups recurring failed protection checks by changed code version. On stage, a newly failed evaluation must flip the patch from ready to hold through an actual query; the UI must not supply the verdict itself.

The analytical question is: **“Which protection failed in this patch, and is it the same contract the earlier finding taught us to preserve?”** A complete run requires every required case; zero failures with missing cases is not a passing release.

Use the real lab events for the active patch decision. Add a clearly labeled diverse synthetic historical workload only to demonstrate the aggregate's scale across many version/role/route cohorts. Start with a workload the setup can handle promptly, increase it only if the loop already works, and display the actual stored rows, rows read and measured latency. There is no official million/ten-million-row minimum, and synthetic rows must never masquerade as extra vulnerabilities or real releases.

**[V]** Insert-time rollups are documented, but joined finding changes do not retroactively trigger an incremental view; aggregate evaluation facts and join source findings at query time. [ClickHouse documentation](https://clickhouse.com/docs/concepts/features/materialized-views/incremental-materialized-view). Plain MergeTree plus a parameterized query is the minimum; a new UDF or observability deployment is unnecessary.

**[I] Limitation:** a tiny one-app gate does not intrinsically require an analytical database. The ClickHouse case earns its role only if continuous recurrence/complete-run queries over a meaningful workload visibly decide the next step. A few stored rows under a logo are not an adequate companion prize entry.

### Guild: real hosted release reviewer, scoped to one repository

**[I]** Publish and run one Release Reviewer in Guild. Give it the actual ClickHouse comparison and immutable source finding, then have it read the original/fixed app and propose the specific contract or reviewed source repair. Following human approval, its useful side effect is a review request/issue in the single owned repository, attaching the admission receipt and failed-case evidence. No merge permission, no arbitrary verifier edits and no authority to invent a passing result.

Passing the actual aggregate as hosted input avoids building a custom remotely reachable evaluation API in the first hour. The existing GitHub integration supplies a genuine tool action; save the actual issue/review link and Guild session URL. If a scoped custom read tool is already working, it can fetch the aggregate, but it is an optional expansion.

**[V]** Guild supports actual hosted sessions and credential scoping. New credentials initially have an allow-all policy, so replace/remove it before claiming a restricted configuration. [Credential policies](https://docs.guild.ai/platform/credential-policies), [API triggers](https://docs.guild.ai/platform/api-triggers), [security architecture](https://docs.guild.ai/platform/security-architecture). A local approval flag must not be called native Guild enforcement. The independent verifier remains outside the reviewer’s writable scope.

## Novelty and eligibility, without favorable assumptions

**[V]** Darwin already used Semgrep to score generated tools; this is why the multi-app/model tournament is removed. [Official retrospective](https://semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026/).

**[V]** Pi already advertises fixes becoming recurrence guardrails, and Semgrep/Snyk already offer agentic analysis, remediation and independent validation. [Pi case study](https://www.pi.security/customers/lemonade), [Semgrep Workflows](https://semgrep.dev/blog/2026/introducing-semgrep-agentic-workflows-automate-deep-vulnerability-hunting-at-scale/), [Snyk September announcement](https://snyk.io/news/agentic-ai-security-moves-into-production/).

**[I]** Therefore the claim is a usable, small admission gate preserving a demonstrated bug’s security lesson while retaining legitimate feature behavior. It is not a new vulnerability class, novel model-validation algorithm or novel concept of security regression tests. Pi's innovation award is upside, with no integration dependency and no verified historical winning formula for this product.

The principal uncertainty is discovery: good ordinary generated code may contain no interesting eligible finding. A weak JWT warning does not become interesting because it has a polished dashboard. A manually planted flaw or an issue diagnosed first by someone else and then covered by a custom rule creates attribution/eligibility questions. No public current rule resolved those questions in the prior official-source audit. Favor an actual stock finding with preserved provenance and confirm the applicable interpretation with the sponsor before claiming eligibility.

## Five-hour cut

| Time after start | Deliverable / cut |
|---|---|
| 0–30 minutes | One generated target, original snapshot, actual scan and candidate behavior. In parallel, Guild hosted hello-world and ClickHouse insert/query. No authentic interesting finding: abandon Semgrep-first prioritization. |
| 30–80 | One independent authorization contract, observed failure, minimal fixed source and passing legitimate use. Stop at one issue. |
| 80–140 | ClickHouse complete-run/recurrence decision plus one actual Guild reviewer and owned-repo action. No second agent or custom API required. |
| 140–190 | One case screen and admission receipt; verified-fix and disclosed-original-rollback challenge; measure real query latency. |
| 190–270 | Freeze scope, record a genuine complete run, upload and verify repository/video access. Label recorded/cached steps. |
| 270–300 | Submit the required repository, shareable video, build/tools details and team contacts with margin. |

Four people can own target/scan, independent verifier, analytics/UI and Guild/submission, sharing one receipt schema. With two people, cut automatic patch application, new integration APIs, additional feature generations and elaborate historical datasets. One hosted agent, one analytic decision and one honest finding take precedence over breadth.

## Advocate's final claim

**[I] If an interesting eligible auth finding appears promptly, Code Vaccine gives Semgrep the leading role and creates a concrete developer decision beyond a scan report: accept or hold the next AI feature patch.** ClickHouse must decide that status from actual evidence, and Guild must run a real scoped review action. Without the initial finding, this is a coherent defense prototype but an unsupported money-maximizing Semgrep-first bet.

## Round 2: concession, scope cut and A/B/C adjudication

**Concession:** ToolTrust has the clearer single buyer question: whether this connector sends data only to its approved recipient. Code Vaccine overlaps existing Pi guardrails, Semgrep workflows and Snyk validation, and its familiar JWT finding needs a genuinely interesting authorization consequence. A measured generation sample is not that consequence. There is no basis for promoting a toy JWT warning above a meaningful actual connector finding merely because Guardian includes its rule.

**Scope cut:** remove the generation corpus, model comparison, automatic patch application, draft PR and additional feature generations. Start with one ordinary app and one fixed contract. Make **Guild the second sponsor** after a qualifying Semgrep finding: one hosted reviewer, one useful scoped owned-repo issue/review artifact. ClickHouse becomes the third track only if recurrence/completeness analytics over a meaningful workload are already working; drop its prize claim rather than manufacture fleet exposure or a row-count spectacle.

### Answer to the independent judge's no-finding challenge

The stable product that survives failed discovery is an **authorization-contract admission gate for the same incident-export app**, not a newly seeded vulnerable app. The immutable contract is built while scanning runs: authorized reads and exports must work; disallowed tenant/role accesses must fail; every required evaluation must finish before the new feature version is admitted. A correctly generated app can demonstrate a legitimate CSV/report feature passing and a genuinely incomplete evaluation remaining on hold. No defect is inserted, no red vulnerability is claimed and no Semgrep finding-prize entry is asserted. This is the same user and decision as the main product, with a less dramatic but honest positive-security outcome.

If nothing qualifying appears by 20–30 minutes, stop discovery. Promote the already working Guild review outcome and, only if meaningful, the ClickHouse admission query. Do not keep rerolling the generator for an hour. A secure baseline is useful; it does not make Semgrep prize eligibility materialize.

The most interesting preferred auth case would be a real mismatch between a secured ordinary workflow and an export/helper path that trusts unverified claims to exercise a service privilege. That description is a hypothesis until the actual source and behavior establish it. Metadata HIGH/MEDIUM confidence and a JWT decode occurrence are insufficient. Preserve the actual original scan and generation artifact; require the owned-lab consequence and legitimate controls. Custom rules and manual-first discoveries remain conditional eligibility paths outside this core. The public packet does not expressly forbid stock CLI scanning, but its acceptance should be resolved with the sponsor; do not label a CLI result as Guardian output.

### Cross-rebuttal of B and C

**B, ScopeWatch:** a budget across multiple allowed-read sessions is a meaningful analytics question and avoids mandatory Semgrep discovery. It can be the stronger no-finding branch. However, the currently described EventSecurity persistence at turn end cannot substantiate stopping a data movement in the same turn. The product should say it detects a completed-turn aggregate and restricts subsequent eligible actions until a real enforcement test establishes more. A selective DENY must be exercised on an owned flow; docs and a policy diagram are not containment proof. Do not manufacture a source vulnerability to make B reach a third prize.

**C, ToolTrust:** recipient/destination review is narrower than a generic repair platform and can produce a more memorable consequence than a familiar JWT warning. Its stock Flask/MCP source rules still do not identify the later delivery transition. It needs both the actual scan result and observed unapproved recipient/data transfer, and it must not turn safe global deliveries or URL parsing into evidence of a leak. Its hosted reviewer should produce a useful owned-repo review action. Its one-connector ClickHouse use has the same optional-database problem as A unless the aggregate genuinely changes review priority.

**[I] Current product-planning rank: C ToolTrust > A Code Vaccine > B ScopeWatch.** C has the clearest small release decision; A has a more straightforward existing Guardian source anchor but more duplicate-product and contract-building cost; B has the strongest naturally aggregate question but its enforcement/timing claim is unresolved. This rank is not a probability or an official score.

**Event evidence overrides that rank:** a compelling verified auth finding favors A over C; a compelling verified connector finding favors C; no eligible finding by the cutoff makes B preferable to a forced Semgrep story **if** its truthful aggregate and selective subsequent-action DENY actually work. If B cannot establish that bounded action, retain the simpler completed release-review outcome instead of pretending containment. No advocate gets to count a proposed finding, hosted action or benchmark as an existing one.
