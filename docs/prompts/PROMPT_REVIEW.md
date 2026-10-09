# Independent review of the ScopeWatch build prompt

Review date: 9 October 2026. Scope: the complete [build prompt](BUILD_SCOPEWATCH.md), its requested model/team behavior and its compatibility with ScopeWatch's current project contracts. This is a skeptical document review, **not an application implementation, native-team/model invocation, live account test or production certification**.

Reviewed [AGENTS.md](../../AGENTS.md), [START_HERE.md](../../START_HERE.md), [the architecture](../architecture/ARCHITECTURE.md), [the build plan](../build/BUILD_PLAN.md), [event rules](../event/EVENT_RULES.md), [Claude capability research](research/CLAUDE_CAPABILITIES.md) and [creator-method research](research/CREATOR_METHODS.md). Account/model access, actual team creation, credentials, native source fields and effects remain event tests.

## Final verdict

The draft's product, evidence and human-action boundaries are sound. It gives the team concrete code/UI/testing work instead of treating a plan or attractive mock as completion. It also acknowledges that an exact requested model, a supported feature and an available account are different facts.

**Accepted as an event-build instruction pack after three orchestration corrections. No unresolved P0/P1 prompt defect remains in this review.** I reread the corrected master, launch guide and all five scoped role briefs. The graph now separates independent local acceptance from native evidence gates; Task statuses match the audited tool contract; early optional work no longer waits on late acceptance. `LOCAL_INCOMPLETE` also prevents unfinished independent code from being disguised as an account-only gap. No application behavior can be validated from a prompt review alone.

## Findings and required changes

| ID | Severity | Concrete counterexample / consequence | Smallest correction | Status |
|---|---|---|---|---|
| **R1 — Local acceptance blocked by live prerequisites** | **P1** | The initial draft drew T09 fresh native probes → T10 acceptance → T11 review → T12 handoff. Native Tasks enforce prerequisites. If credentials/operator action were pending, T10 could not be claimed, despite independent local QA and LOCAL_READY requirements. | Split local acceptance/review/handoff from native acceptance. Native probes are mandatory evidence for VERIFIED_LIVE, not a prerequisite for running independent local tests. Keep the native chain blocked and explicit; never make local receipts satisfy its edges. | **Closed:** T10L → review/handoff is independent; T10N retains native gates; dashed evidence edges are explicitly not unconditional Task blockers. Acceptance brief and launch goal agree. |
| **R2 — Unsupported native Task statuses** | **P1** | The initial draft made native Tasks canonical but required `pending / running / needs_review / done / blocked / cut`. The audited native contract exposes `pending / in_progress / completed`; unsupported updates or a competing ledger could result. | Use supported native statuses. Record richer workflow/gate states in descriptions/metadata and the leader's durable mirror. Cut/blocked do not become completed-success receipts. | **Closed:** master and briefs use `pending / in_progress / completed`; richer dispositions remain metadata/mirror; optional cut nodes are outside the required independent completion set. |
| **R3 — Early experiment placed after late acceptance** | **P2** | The initial optional DAG grouped cause proof with replay/finding after late acceptance, while the cause test had to end before 1:30. | Give early cause/discovery their own fixture/source prerequisites and cutoffs; retain post-core replay/outcome gates. | **Closed:** bounded cause and ordinary-generation Semgrep discovery have separate early edges; measured replay/exact outcomes remain conditional post-core work. |

These are resolved document defects, not passing runtime tests. Their fixes preserve the limited scope and do not add features.

## Pitfalls the draft already handles correctly

| Challenge | Required interpretation retained in the draft |
|---|---|
| Requested Opus/Sonnet models absent from the current Codex collaboration tool | Execute the requested team in the separately verified interactive Claude Code harness. Do not claim this Codex team's own agents are the requested Anthropic models. |
| Official 5.5 releases/local CLI version exist, but account routing/access is unknown | Check provider, actual active model and spawned teammate model. Full IDs are requested; aliases, forced overrides, allowlists and content-based fallback are disclosed. No silent model substitution or refusal evasion. |
| A headless process or agent panel is mistaken for a native team | Interactive native-team launch, team opt-in and Task-tool opt-in are explicit. `-p`/SDK/ordinary subagents and Cursor's own Agent are separate execution routes. |
| Autonomous coding is mistaken for autonomous human approval | Agents build review/receipt/verifier code. Native policy application remains the actual human Guild UI or independently verified documented CLI action, with precise reviewed scope and fresh effect evidence. No invented mutation endpoint. |
| Pasting a prompt becomes premature event implementation | Explicit event-window authorization gate precedes source generation. Outside the window only permitted planning/preflight runs; no waiting scheduler or timeout-as-approval shortcut. |
| Missing credentials stop all useful work, or become fake live success | LOCAL_READY, NATIVE_PENDING/BLOCKED and VERIFIED_LIVE are separate dimensions. Independent implementation continues, while missing account-dependent tests/effects remain gaps. |
| An attractive frontend masks a disconnected backend | Real local API wiring and browser flows are required; screenshot-only grading is insufficient. Config/loading/partial/conflict/error/stale/pending/failure/recovery states are part of the product. |
| Implementation owners self-certify the whole result | Acceptance engineer exercises the integrated app; separate devil reviewer writes review reports and does not grade its own code. Actual command/browser/native evidence closes gates. |
| Task locking is treated as source-file locking | Exclusive write paths and lead ownership of DTO/schema/config/package/lockfiles are explicit. Contract changes identify callers/tests before integration. |
| Unlimited self-repair becomes a progress substitute | Same-failure and distinct-fix/time thresholds trigger reproduction/consultation/replanning. They do not waive acceptance. External unknown mutations are reconciled before retry. |
| More context or more agents is always better | Small staged team, focused spawn briefs and current authoritative contracts first; archive/winner research is on demand. No nested teams, graph framework or mandatory whole-corpus reread. |
| Creator statements become an invented graph-method endorsement | Task DAG/evidence map/loop rules are attributed to project engineering choices. Creator research supports scoped work, executable feedback and simplification, not a named Graph of Thoughts prescription. |
| Production-quality becomes an enterprise/security-certification claim | Target is a bounded complete operator UI with tested craft. Source finality, universal containment, robustness and broad security certification are explicitly withheld. |

## Native and analytical correctness checks retained

The final prompt must continue to preserve all of these after orchestration edits:

- Per-event actual acting-subject proof and the same evaluated credential for both workloads; root/requested/display IDs are not authority.
- Whole-generation semantic conflict checking before ALLOW/subject/operation/time filters, with explicit gaps and no arbitrary latest-copy resolution.
- Finite qualified cohort, completed-turn source behavior, full event/task pagination and reconciliation without an account-wide finality claim.
- Exact `(T−600s,T]` historical anchors, full timestamp ties, inclusive manifest effective start and current/first-crossing/peak separation.
- Actual executed all-candidate ClickHouse selection; independently built oracle as a check, not a substitute for SQL.
- Publication/readback of facts, per-event mappings/proofs, manifest and coverage. Matching event IDs alone cannot establish equivalent generation authority.
- External manifest provenance wrapper: finalize bytes before calculating their SHA-256/recording containing immutable reference; no self-referential payload.
- Actual investigator context read and incident; model interpretation never changes manifest, count, target or mutation authority.
- Exact review/CAS scope with external-race limitation; actual native rule evidence plus fresh policy refusal and inspected expected control content.
- Separate recovery review/removal/readback with expected successful results from both restored target and control; window aging is not release authority.
- Replay namespace/privilege/action separation, safe secret handling and public read-only export.

## Packaging verification and remaining execution gates

Reviewed [the launch guide](RUN_IN_CLAUDE_CODE.md), [brief index](agent-briefs/README.md) and native/backend/interface/acceptance/devil briefs. Their model requests, opt-ins, ownership and completion boundaries agree with the corrected master. The launch is interactive, session-scoped and in-process; no permission-bypass, obsolete team configuration or headless-native-team claim was introduced.

Checked all eight master/launch/brief files: **11 local Markdown links resolve**. The actual `/goal` condition is **1,440 characters**, within the documented 4,000-character limit. These checks validate the handoff's packaging; they do not invoke Claude, create a team or validate account permissions. References to official captured capabilities are documentation proof, not runtime receipts.

At build execution, verify actual model/team/Task tools and account requirements before promising them. Use the real event clock and inherited permissions. An auxiliary goal verdict is transcript-based; actual build/typecheck/lint/test exits, browser behavior and native proof must remain visible in the milestone report.

Still unverified: authenticated invocability/effective provider/model routing and substitutions; actual native teammates and Task tools; account spend/limits; competition Guild/ClickHouse/GitHub credentials and permissions; native identity/unit/clock/field population/selectors; actual database syntax/results/readback; real hosted incident; human native action and both fresh effects; implemented UI/browser behavior. The prompt records these as preflight/evidence obligations and cannot guarantee them away.

Final independent acceptance must separate **what was implemented**, **what actually passed**, **what requires accounts/human action** and **what was cut**. A skipped live suite, unresolved core P1, subjective UI score or model-generated “done” cannot become a verified native result.

No application code, Git operation, account/config change, policy action or external message was performed by this review.
