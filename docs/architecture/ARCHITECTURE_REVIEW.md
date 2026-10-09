# ScopeWatch independent adversarial architecture review

9 October 2026. This review attacks the proposed architecture and its evidence obligations. It does **not** certify a Guild account, ClickHouse service, integration, enforcement effect, security finding or production system. The reviewed sources are [ARCHITECTURE.md](ARCHITECTURE.md), the seven [editable diagrams](diagrams/01-system.mmd), [Guild contracts](GUILD_CONTRACTS.md), [ClickHouse contracts](CLICKHOUSE_CONTRACTS.md), [MASTER_SPEC](../spec/MASTER_SPEC.md) and the [42-scenario playbook](../spec/SCENARIO_PLAYBOOK.md). Preliminary objections were sent before the architecture draft; the final verdict below distinguishes corrections from account gates and residual limits.

## Verdict

**Conditionally accept the architecture for a bounded asynchronous demonstration.** The most defensible result is a verified workload exceeding a predeclared permission-decision allowance across the captured controller-managed cohort, followed by a reviewed native restriction on a subsequent matching call while a fresh approved control returns its expected synthetic result.

The design now keeps identity, provenance, historical crossings, uncertainty, approval and observed policy effect separate. It does not depend on invented policy APIs, a model authorizing itself, an immediate uniqueness promise from ClickHouse background merges, or a fake successful-control receipt. Those corrections materially improve the original proposal.

The condition matters. Native acting-subject/credential fields, captured-source completeness, policy selector behavior, manual application and real target/control effects remain account proofs. A concrete event-attribution SQL defect found during this review is now corrected in the design; the query and its joins remain unexecuted against ClickHouse. Passing offline algorithm checks earns algorithm evidence only.

This is a useful operator workflow with a conventional quota predicate. It is not a novel rate-limiting algorithm, proof of malicious intent, a prompt-injection detector, an inline budget guard, a universal sandbox or evidence that customer records were stolen. The review would reject those stronger claims from the proposed receipts.

## Severity and evidence labels

- **P0 / claim blocker:** proceeding without the proof can deny the wrong subject, manufacture a breach or certify incomplete evidence. This label does not mean an exploit was observed.
- **P1 / correctness or authority risk:** a plausible implementation can misstate the result, lose a contradiction or perform an unreviewed action.
- **P2 / scope or competition risk:** the product can still work, but the feature, measurement or award claim is weaker than its presentation.
- **Corrected design:** the reviewed architecture explicitly contains the necessary rule. Implementation and account verification remain required.
- **Open account gate:** documentation or design cannot establish the event account's behavior.
- **Residual limit:** the bounded architecture deliberately cannot provide the stronger guarantee.

## 1. Identity and the shared credential

| Attack | Severity | Disposition in the architecture | Proof still required |
|---|---|---|---|
| A model, issue or browser supplies another workload's actor ID. | P0 | **Corrected design.** Journal facts and authenticated native graph/launch evidence choose the subject; edited issue text cannot become an action command. | Exercise the actual controller route and retain native identity evidence. |
| Every descendant event in a root A session is attributed to A even when nested B made the call. | P0 | **Corrected architecture and query design.** Per-event binding supplies the actual subject; missing/conflicting binding blocks admission. | Execute the SQL and establish exact native mapping. Avoid nested agents in the live core and reject any unsupported actor change. |
| Agent definition ID, workspace-installation ID, task ID and display name are treated as interchangeable. | P0 | **Corrected design / open account gate.** Record distinct identifiers and test the actual native policy selector. | A request by the proved subject must be denied while the independently identified control remains usable. |
| Both jobs use GitHub/the same repository, so the presentation calls their credentials shared. | P0 | **Corrected design / open account gate.** The same evaluated native credential must be proved for both jobs. | Native `credentials_id`, or another explicitly authoritative evaluated binding, must corroborate the actual calls. Configuration intent alone is inadequate. |
| A trigger's creator avatar is used as the acting-user identity. | P1 | **Corrected design.** Trigger runs have no human acting user; SHARED/MEMBER mode and resolution priority are preflight checks. | Verify the chosen launch path and actual modes/grants in the account. |

The identity chain is more than a lookup from a session to a label. It is native security event → actual task/caller graph → verified acting policy subject → evaluated credential/operation → the pinned operator declaration. The controller's launch intent corroborates that chain; it cannot replace missing native facts.

The fresh Guild report describes grant/caller-chain, dedicated, member, workspace and account selection. A separate dedicated credential or grant can make two visually similar runs use different credentials. The architecture therefore correctly makes shared-credential proof a gate rather than a diagram assumption. [Guild credential resolution](https://docs.guild.ai/platform/credentials#how-guild-chooses-a-credential).

### Query consistency finding: session-level attribution, corrected

The initially reviewed `scoped` CTE in [CLICKHOUSE_CONTRACTS.md](CLICKHOUSE_CONTRACTS.md) obtained the policy subject through `session_snapshots.policy_subject_id`; it did not join an event-specific acting-subject binding. In a session containing root A and nested B, that shape can count B's approvals as A's. This directly contradicts the actual-actor requirement in the architecture.

The final corrected report now adds `event_bindings(generation_id,native_identity_key,policy_subject_id,binding_state,native_acting_task_id,mapping_method,binding_ref)`. Its `scoped` query matches the allowance through that event binding; the session snapshot supplies launch inventory and coverage only. Readiness rejects missing/conflicting event bindings and a verified actor with no declared allowance. Nested B operations in A's session therefore belong to B when that exact mapping is proved; otherwise the cohort is unresolved. I inspected the corrected schema and join. The offline reference now includes nested B→B and missing/conflicting-binding fixtures. This closes the design blocker; SQL execution and native acting-subject proof remain gates.

## 2. Collection coverage and provisional compliance

The original phrase “across sessions” could be read as the whole workload's activity. The reviewed architecture narrows it to a **closed finite controller-managed cohort**. Unknown workspace sessions, uncontrolled launch routes and future turns are outside that coverage. A complete response for one session does not establish a complete subject-wide history if another registered member remains active or uncollected.

The newest-first first page is not a snapshot. Every required event/task page, cursor and failure must be preserved; a failed page cannot become zero. Required actor, credential, operation, event clock and native identity gaps remain visible. Candidates with complete captured evidence and zero matching events appear as zero through the manifest candidate set; incomplete candidates appear as incomplete. A filter that silently removes every unresolved row would otherwise create a false safe state.

**Native finality is a residual limit.** The fresh Guild report establishes turn-end persistence but finds no atomic snapshot token or bounded late-arrival guarantee. Completion, exhausted pages and repeated stable reads establish observed reconciliation, not proof that no later record can appear. The final architecture correctly says “captured native approvals” and “within observed envelope.” Later facts reopen the evidence generation. It must not turn a temporarily empty poll into global compliance. [Guild event contract](https://docs.guild.ai/api-reference/sessions/fetch-session-events).

Missing-only data can sometimes prove a trustworthy lower-bound breach, but that does not establish the only offender or a complete target/control comparison. The live core's conservative requirement for the entire declared cohort is a reasonable five-hour choice. It must remain separate from any future lower-bound alert mode.

## 3. Exact deduplication and contradictions

Native IDs are opaque equality keys under the verified source identity domain. If an ID is unique across sessions, putting session in the key can hide a copied ID with a changed session. If uniqueness is genuinely session-scoped, omitting session can merge two real events. UUID appearance alone proves neither domain.

The architecture corrects three important failure modes:

1. Canonicalization compares semantic versions **before** filtering decision, operation, actor or interval. A changed DENY or out-of-window copy cannot disappear before conflict detection.
2. Identical redelivery counts once; a genuine retry with a new ALLOW identity counts again. Downstream failure does not forgive a permission unit under this declared metric.
3. Different actor, session, credential, operation, decision or native creation time under one authoritative identity is a contradiction. Quarantine it and invalidate dependent action eligibility; do not select `argMax`, `any` or a convenient last row as truth.

Observation time and fetch/page metadata belong to delivery provenance, so a later identical delivery is not a semantic conflict. Stable native NULL→value changes are a conflict until a separately established native revision protocol resolves them. A content hash binds retained bytes; it does not independently authenticate their origin or make the source final. The controller, authenticated native fetch and retained raw artifact remain trust assumptions.

The final proposed SQL compares full stable records with `SELECT DISTINCT` before counting variants; NULL→value changes remain different rows. An ordinary distinct aggregate over nullable individual arguments can silently skip needed differences. Neither NULL aggregation behavior nor background replacement supplies the integrity contract automatically. [Aggregate NULL behavior](https://clickhouse.com/docs/reference/functions/aggregate-functions#null-processing), [ReplacingMergeTree](https://clickhouse.com/docs/reference/engines/table-engines/mergetree-family/replacingmergetree).

## 4. Historical rolling crossings and late arrivals

The most consequential preliminary algorithm defect was evaluating only `(now−600s, now]`. If 21 approvals occur between 12:00 and 12:05 but become visible at 12:20, the current count is zero and a real historical crossing vanishes. The final architecture now requires historical event anchors, a retained first crossing/peak witness and a separate current count.

The interval is `(T−600s,T]`, truncated by the inclusive manifest effective start. All events with the same native timestamp enter together before testing the strict `count > allowance` predicate. An event exactly 600 seconds old is excluded. A new late event at s can change windows ending in `[s,s+600s)` and may introduce a new anchor. A changed/conflicting fact requires broader recomputation, not append-only arithmetic.

This is mathematically sufficient for the frozen allowance: the count increases only at an event-time arrival group; between groups it can only remain level or decrease. The final saved [offline verification ledger](../../research/offline-reference/verification.json) reports 19 checks, including 1,000 randomized sweep/brute-force comparisons and the actor-binding fixtures added during review. I inspected that ledger. It explicitly reports **no database queries and no Guild calls**. It does not test executed SQL joins, native timestamps, actual cohort mapping or policy effect.

The initial drafts disagreed on the live historical path. The final corrected contract now makes **ClickHouse's exact all-candidate aggregate at every distinct native event-time anchor** authoritative for the tiny case, with the application two-pointer sweep serving as the independent equality oracle. Save the actual database counts/query IDs for the first crossing, authorized control and current cutoff. This is a bounded series of queries; it is not yet a scalable historical detector. A million-row single-anchor aggregate, the entire historical procedure and extraction-plus-sweep are different measurements. Their latency cannot be exchanged in the pitch. I inspected the corrected procedure and its separate benchmark classes.

## 5. Journal, analytical projection and approval races

The local SQLite journal is the control authority; ClickHouse is the analytical projection. That is the right boundary for this build. The generation proceeds through sealed input, insert acknowledgement, **exact generation readback**, query and case admission. Successful INSERT alone cannot prove that the subsequent query used every intended row or the expected manifest/coverage projection. Readback must cover canonical semantic values, the event-specific actor bindings and their proof references, pinned manifest and coverage; unchanged event IDs with altered bindings are not equivalent generations. The final architecture adds a bounded ID-set/semantic-digest readback and does not assume a distributed transaction.

An immutable case does not mean permanently valid evidence. Late contradictions or changed mappings create a new evidence revision, making pending approval stale. Approval binds that revision, manifest reference/hash, actual workspace/subject/credential/operation, verified resource selector and exact intended mutation. Browser actor strings or model-written scope are not accepted. The local transaction uses compare-and-swap and releases before any remote work.

**External atomicity remains unavailable.** Another Guild administrator can edit a native rule after ScopeWatch's fingerprint check. A human can also execute an earlier manual snippet outside the journal. Local CAS cannot stop either action. The honest response is to retain pre-action context, actual native rule/readback, time and both post-action probes; detect/review an out-of-band or stale application instead of treating it as current approved authority. This is a residual limit, not a claim that a remote race was solved.

Unknown creation outcomes require reconciliation before retry. The same applies to investigator issue creation: the architecture should not claim exactly-once external issue creation without a verified native idempotency contract. A stable case reference and actual receipt/search reconciliation are an application convention; they do not make the external system transactional with SQLite.

## 6. Investigator privilege and untrusted evidence

The investigator can read the pinned manifest/context and create one bounded incident. It receives no controller trigger key, database key, policy-edit authority, credential attachment, generic HTTP or repository mutation tools. Repository-scoped native permission must constrain where incident creation can occur. A tool subset and a system prompt are not substitutes for actual credential-policy restrictions.

The trigger key itself is workspace-capable and can route to another installed agent. Keeping it server-side is necessary but not sufficient: the controller must also allowlist launch subjects and session read/follow-up targets rather than relay browser/model routing inputs. A separate read credential's actual endpoint scopes and workspace access must be tested; authentication success does not prove event/task access. [Trigger scope](https://docs.guild.ai/platform/api-triggers#security-and-scope).

Privilege separation prevents the model from directly mutating policy. It does **not** guarantee hallucination-free incident prose or prevent social persuasion. The final architecture correctly puts deterministic subject/count/scope before the narrative, compares quoted claims with journal facts and keeps ungrounded artifacts unreviewed. It also escapes untrusted labels/reasons in the browser. An issue edited after creation cannot silently redirect the pending action.

The pinned manifest is trusted because the operator selected its immutable reference/hash and owns the approval; ordinary repository text, same-named branch files, tickets and comments remain lower-trust evidence. Storage in the same repository does not erase this distinction.

## 7. Native application, effect and recovery

The fresh Guild audit found documented policy UI/CLI configuration but no public credential-policy mutation route in the inspected OpenAPI. The corrected core is therefore **manual native policy application after concrete review**. An automatic “contain” button backed by an invented endpoint or an assumed `integrations:write` privilege would fail this review. The command example remains unexecuted and its installed CLI/authentication is a gate. [Guild policies](https://docs.guild.ai/platform/credential-policies), [public API specification](https://api.guild.ai/v1/openapi.yaml).

A new credential's broad allow fallback may remain hidden behind scoped rows. A scoped ALLOW does not establish least privilege; an exact matching DENY can override the fallback but does not constrain unrelated operations. Record the real selected operation, actual policy subject and workspace, and use repository/method dimensions only after matching is proved. SDK `github_issues_get` and policy `issues_get` are different names.

The ending requires a genuine fresh target request with native `DENY`/`POLICY_DENIED`, and a fresh control returning its inspected expected synthetic content through the same proved credential. `CREDENTIAL_UNAVAILABLE`, generic ERROR, task DONE, HTTP 2xx or an operator checkbox is not interchangeable with that ending. Both calls failing is a failed continuity test. A target that succeeds means restriction failed. Missing results mean unknown.

This proves observed matching calls at their recorded time. It does not cancel calls already past the permission gate, undo earlier ALLOWs, block other credentials/operations or prove that the whole workflow completed correctly. Continuous enforcement and future policy stability remain stronger claims.

The initial action diagram reused containment verification for recovery. That defect is now **corrected**: after reviewed rule removal/readback, recovery requires expected results from **both target and control**, with separate unknown/failed paths. The final diagram also preserves a historical effect receipt when later source evidence is disputed; it does not automatically remove the active DENY or certify the old breach facts as settled.

## 8. Result, prompt influence and finding claims

Thirty ALLOW decisions are thirty approval units under this manifest. They are not thirty retrieved tickets, distinct records, victims or leaked objects. HTTP status/response bytes and the exact native event-to-tool match are separate evidence. A parent with several tool descendants cannot be cross-joined into per-event successful results. The fresh-control result witness is independent of the optional historical outcome join.

A planted support ticket beside a deterministic extra-call sequence proves neither model influence nor an attack. The optional comparison must keep trusted requirements, grants, fixtures, manifest and schedule fixed; change only the lower-trust content; retain source consumption and subsequent behavior; and compare the benign condition. A refusal or no changed behavior is a valid outcome. A single trace cannot establish robust prompt-injection detection accuracy.

Semgrep's lane also earns its claims from actual discovery. The fixed Guardian scan route cannot be assumed to detect the main cross-file identity or approval semantics. A clean scan is not proof of correctness. A custom rule written after manually finding a flaw is confirmation unless it actually originated discovery. No manufactured vulnerability, independent 28-run app, generic severity count or source-only patch substitutes for an authentic same-project finding, owned consequence, positive control, fix and rescan.

## 9. Five-hour feasibility and sponsor fit

The critical path is not the seven rendered diagrams. It is the first native account proof: real hosted calls, actual acting subjects, same evaluated credential, selected unit/operation/clock, complete captured pages, real reviewed DENY, actual target refusal and successful fresh control. If that fails by the 12:15 gate, the UI cannot rescue the main claim.

The design is reasonably bounded for four owners because it uses one local process/journal, one database projection, one integration, one case view and one investigator. Historical/conflict fixtures are correctness requirements rather than 42 new product features. Outcome enrichment, new token syntax, new MCP/OAuth bridges, dashboards, automated recovery and elaborate replay should be cut before the central proof. Native authentication/setup and unknown CLI support remain schedule risks.

ClickHouse's tiny lab can be implemented in another database; no unique necessity or algorithmic novelty follows. Its strongest sponsor contribution is actual reproducible all-candidate subject/allowance/session analysis plus clearly labeled diverse replay and measured query receipts. Guild's contribution is actual hosting, mediated native evidence, context read/incident creation and selective subsequent-call policy behavior. Firecrawl remains research tooling; including it in the architecture does not make it a runtime sponsor integration.

The build remains one project. A genuine Semgrep finding belongs to that project's ordinary generated code and does not justify a separate app. Semgrep award eligibility and stacking remain event/organizer questions; no architecture proves them. Pi has no runtime dependency and its innovation story is uncertain because the quota predicate is conventional. The $2,000/$3,000 figures are conditional top monetary face values, not expected winnings.

## 10. Minimum adversarial acceptance before strong claims

| Check | Required result | Evidence class |
|---|---|---|
| Redeliver an exact native event with a new observation timestamp. | One approval unit; both delivery records retained. | Actual captured native row, controlled redelivery. |
| Same authoritative identity changes decision/session/time/credential, including a copy outside the selected filter. | Conflict before filters; no definitive case/action admission. | Labeled fixture plus query equality proof; do not fabricate a native conflict. |
| Event has a nested/different actual acting subject. | Event-level verified binding, or the restricted-core cohort becomes unresolved. | Native graph/account proof if encountered; otherwise explicit fixture/design limit. |
| Another declared task is running, missing or has a failed page. | Provisional/incomplete state rather than safe zero. | Actual gap if available; labeled fixture otherwise. |
| Twenty-one approvals age out before collection/evaluation. | Historical crossing survives current zero. | Exact fixture/oracle, then native trace when feasible. |
| Boundary and tied-time events arrive in any order. | `(T−600s,T]` semantics and whole tie group; same witness. | Offline reference plus executed SQL equality. |
| Late fact/conflict arrives after approval. | New revision blocks current local action admission; native out-of-band effects retained as disputed. | Controller fixture/integration proof. |
| INSERT/query generation is missing one canonical row or manifest member. | Readback fails; no case admission. | Executed database proof. |
| Model/issue/browser tries to change actor, allowance, route or scope. | Trusted journal/scope unchanged; input rejected or shown only as evidence. | Actual installed grants and controller behavior. |
| Target and bulk control share actual credential before/after policy. | Same evaluated binding; target policy refusal plus inspected control result. | Native runtime core proof. |
| Native mutation times out or selector is wrong/broad. | Unknown/failed status; reconcile actual rule; both probes rerun after reviewed correction. | Native runtime if encountered, otherwise labeled state fixture. |
| Reviewed restoration removes the intended rule. | Expected target and control results; separate recovery status. | Native runtime only if recovery is demonstrated. |

The complete demonstration does not require executing every design case. It requires preserving the distinction between live native evidence, controlled replay, offline algorithm verification and untested account assumptions. The remaining gates should appear beside the affected claim, not disappear behind a general confidence statement.
