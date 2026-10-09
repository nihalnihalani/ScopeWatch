# ScopeWatch event build plan

Prepared 9 October 2026. This repository is a research and build handoff. **Application source, hosted agents, credentials, policies, database objects, measurements and competition results must be created and tested during the event.** Planned modules and interfaces below are implementation instructions, not implemented capabilities. The inherited offline window oracle is pre-event research reference; it is not competition runtime code or a live integration proof.

Use the supplied event packet and organizer instructions to confirm the actual start/deadline. The conservative plan is **11:30 AM–4:30 PM PT: 300 minutes, one project, four owners**. Record elapsed minutes as well as PT so local timezone conversion does not change the schedule.

Read [the architecture](../architecture/ARCHITECTURE.md), [Guild contracts](../architecture/GUILD_CONTRACTS.md) and [ClickHouse contracts](../architecture/CLICKHOUSE_CONTRACTS.md) before interpreting older sketches in [the master specification](../spec/MASTER_SPEC.md). The architecture's per-event acting-subject binding, historical anchors, generation readback and manual native policy action take precedence. [FIRST_HOUR.md](FIRST_HOUR.md) is the execution checklist for the initial account proof; [the scenario playbook](../spec/SCENARIO_PLAYBOOK.md) explains the wider acceptance cases.

## The outcome to finish

An operator sees an actual installed workload exceeding its pinned permission allowance across several completed sessions, reviews a real hosted investigation, applies a precise native restriction, then observes a fresh target refusal and an inspected successful approved-work result. ClickHouse must select the breached workload from all qualified candidates; the screen cannot choose the suspect in advance.

The fixture uses fictional HarborDesk operator Maya, TicketAssist, ReleaseReview, one owned GitHub repository and synthetic support/release tickets. The illustrative envelope is **600 seconds; TicketAssist 30 approvals against 20; ReleaseReview 40 against 60**. These are desired fixture parameters, not results. Calibrate the actual native decision unit before pinning the manifest. Both workloads must resolve to the **same actual credential**, proved from the evaluated operations.

The measured unit is unique native **ALLOW permission decisions** for the selected credential/operation and verified acting subject. It is not tool-call count, successful reads, unique tickets, stolen records or malicious intent. The policy is an asynchronous reviewed circuit breaker for subsequent matching operations. Source persistence, collection, investigation and the human step add delay; an allowed operation already past the native gate is not undone.

## Ownership and handoffs

Assign one named human to each lane at kickoff. Each lane has one decision-maker and a concrete handoff; several people editing the same module is not the plan.

| Owner | Primary responsibility | Deliverables | Handoff / review partner |
|---|---|---|---|
| **A — Guild and enforcement** | Account access; installed subjects/versions; chosen launch contract; shared credential/mode; native investigator; exact UI policy scope; actual effects | Account-test ledger; sanitized installation and launch receipts; per-event attribution proof examples; verified policy selector/operation; investigator session/issue; trial/final rule receipts; target/control native results | Supplies actual native contracts to B; asks C to inspect control content and D to check claims |
| **B — Collector and ClickHouse** | Complete finite snapshots; journal; admission; verified event bindings; exact publication/readback; all-candidate current/historical queries; case revision; meaningful replay/timing | Event/task/page receipts; sealed generation; exact ID/semantic/binding/context readback; SQL version and results/query IDs; first-crossing/current/peak witnesses; focused correctness reports; optional replay measurements | Receives source shapes from A; gives immutable factual case to A/D; C checks expected fixture answers |
| **C — Scenario and Semgrep** | Owned synthetic fixtures; operator envelope; controlled launches; outcome witness; evidence labels; bounded same-project scan discovery | Fixture inventory/expected markers; preflight/main boundaries; pinned manifest reference and SHA-256; registered run cohort; scenario ledger; actual scan output/source provenance and finding/fix evidence only if obtained | Works with A on baseline/probes, B on counts, D on narrative; fixture/control duties take priority over discovery |
| **D — UI, evidence and submission** | One case page; authenticated local operator routes; readable evidence; truthful state labels; public read-only export; recording/access/submission | Case/review/effect page; query panel; evidence index; factual narration; actual demo recording; README/sponsor proof links; accessible repo/video and organizer submission | Receives authoritative facts from B and actual receipts from A/C; protects recording time after scope freeze |

One local Node/TypeScript backend, one React view, a short-transaction SQLite journal and ClickHouse Cloud are sufficient. Pin a supported event runtime and actual client versions. Node 24's `node:sqlite` is a candidate, not a guarantee for an arbitrary runtime. Use one compatible adapter if the selected runtime differs; do not install a second architecture to rescue a convenience.

## Dependency order

Do the account-dependent proofs before encoding a native adapter. Independent health/access checks and an empty UI layout can run in parallel, but guessed vendor fields must not become application authority.

| Order | Prerequisite | Work unlocked | Acceptance gate |
|---:|---|---|---|
| **0** | Official build window starts; owners and allowed accounts/repo agreed | Event implementation and runtime configuration | Event start recorded; synthetic/owned scope declared; source created during event |
| **1** | Actual Guild read/launch authority and installed integration | Two short hosted calls under distinct actual subjects | Returned native session/task/version records; selected evaluated operation/unit/clock; same actual credential or unresolved gate |
| **2** | Actual event/task shapes from step 1 | Collector mapping and pagination contract | Complete finite event/task page traversal; native identity domain recorded; each counted event has one proven acting policy subject |
| **3** | Verified subject/credential/operation/selectors | Trial native restriction | Actual human UI action, or independently tested documented CLI; fresh target `DENY`/`POLICY_DENIED`; fresh control expected content |
| **4** | Known trial rule and both witnesses | Main allowed scenario | Deliberate removal of only the trial rule, native readback/evidence, fresh allowed baseline for both workloads; trial/main boundary retained |
| **5** | Native data shape and finite capture known | Event-built schema/admission/publisher | Exact raw/context input inserted and read back; mappings, manifest and coverage agree with the journal, not only IDs |
| **6** | Calibrated unit and verified baseline | Pinned main envelope and run cohort | Immutable repo reference plus independent content SHA-256; effective start before activity; no policy replacement through cutoff; all sessions registered |
| **7** | Sealed, readback-confirmed generation and qualified whole cohort | Authoritative detector | All candidates returned, including complete zero; conflict gates pass before filters; SQL historical anchors agree with event-built reference sweep |
| **8** | Deterministic case revision and pinned context | Hosted investigation | Actual investigator reads selected context/manifest version and creates actual incident; quantitative/scope claims checked against facts |
| **9** | Current reviewable case and precise scope | Authenticated operator approval and native application | Local CAS accepts expected revision; approved digest matches stored scope; native rule/evidence observed; no invented REST mutation |
| **10** | Actual native application | Final effect claim | Fresh matching target refusal plus fresh inspected approved control content, tied to this action and timestamps |
| **11** | Full core loop works | Focused design fixtures, replay, optional enrichment | Core receipts complete; optional work fits cutoffs; replay cannot create an eligible native action |
| **12** | Scope frozen and facts verified | Recorded demo and submission | Recording/access/README agree with observed evidence; organizer form submitted with deadline margin |

Steps 1–3 determine whether the primary promise is feasible. A missing native actor/credential field cannot be repaired by a model label. Step 4 is mandatory before the main excess run: a forgotten trial DENY makes the intended ALLOW scenario invalid. Step 5 may run alongside the trial after step 2 establishes source shapes; the main generation still requires step 6's pinned context.

## The 300-minute schedule

The table allocates the whole five-hour window. Gate owners report **pass, fail or unknown with evidence**, not a percentage-complete estimate.

| Elapsed / PT | Shared milestone | A — Guild | B — Collector/CH | C — Scenario/scan | D — UI/submission | Gate / cut |
|---|---|---|---|---|---|---|
| **0–45 / 11:30–12:15** | First native account proof | Two hosted subjects; actual credential/operation/unit; policy trial; fresh effects | Source pages/task graph; identity contract; CH connection/version; minimal event-built insert/readback/query | Synthetic ticket and control marker; preflight envelope; expected baseline; at most 20–30 minutes total scan setup/discovery alongside generation | One factual shell; receipt index; access/submission requirements | **G1:** native mapping, finite capture, selective trial and CH proof. Mentor once, simplify the same integration; no guessed authority |
| **45–120 / 12:15–1:30** | One full main loop | Restore trial baseline; investigator read/issue; final exact native action/probes | Seal/read back main generation; all-candidate historical/current query; case revision and scope digest | Pin main epoch; register/run completed short sessions; inspect both actual results; retain eligible finding evidence if any | Wire actual case/query/review/effect; approval/session protections; ground narration | **G2:** source → SQL selection → real incident → reviewed native restriction → both fresh effects. If late, cut every optional enhancement |
| **120–135 / 1:30–1:45** | Optional exact historical outcome match | One specialist checks actual identifiers/cardinality | Add matched/unmatched context only if proved | Preserve actual result witness; no new service | Keep output meaning separate from approval unit | Skip unless G2 passed; **hard stop 1:45**. No proximity join or receipt server |
| **135–180 / 1:45–2:30** | Focused controls and final readable case | Preserve native sessions/rules; diagnose any effect gap | Boundary/conflict/late fixtures; diverse replay if time; labeled timing sample | Duplicate delivery, ALLOW failure if obtainable, stale/unknown walkthroughs; proof-class ledger | Tighten one screen; prepare public export and recording path | **G3: scope freeze at 2:30.** No token, alert, MCP or feature dependency added |
| **180–270 / 2:30–4:00** | Verification, rehearsal, real recording and upload | Stand by for existing-core issues; keep receipts accessible | Fix only demonstrated core defects; reconcile query/results/timing | Check story against actual counts and fixture outcomes; scan/fix/rescan only an existing earned finding | Recording owner protected; narrate bounded claims; README/tools/sponsor evidence; accessibility checks | **G4:** viewable real demo + readable receipt trail. No new account/service/SDK/feature family |
| **270–285 / 4:00–4:15** | Submit | Verify sponsor/native links | Confirm repository/evidence commit state | Confirm team/contact details | Use actual organizer form; verify repo/video access and submission acknowledgement | **G5:** submitted by 4:15 target; do not assume a Devpost endpoint |
| **285–300 / 4:15–4:30** | Deadline reserve | Support only submission/core access | Support only submission/core access | Factual/access check | Reconcile upload/form failure or required correction | Hard deadline; margin is reserved time, not feature time |

If the official window differs, preserve dependency order and cutoffs proportionally; explicitly update the team clock. Do not make local timezone arithmetic part of the competition runtime.

## Event implementation blueprint

The following filenames are **planned event-created modules**, not files to generate before kickoff. Keep these boundaries even if the team uses fewer files. Interfaces exchange journal IDs and immutable references, never agent-authored authorization claims.

| Planned module | Owner | Input → output | Required responsibility and invariant |
|---|---|---|---|
| `src/server/config.ts` | B/D | Server environment and fixed registry → validated configuration | Fail closed for missing secrets/unsupported routes; no secret serializes into browser/incident/export; pin actual runtime/package versions |
| `src/server/guild/launcher.ts` | A/B | Allowlisted launch profile + fixture reference → `LaunchReceipt` | Implement one tested account or trigger contract; preserve actual returned native IDs/version; requested actor is intent, not binding |
| `src/server/guild/collector.ts` | B | Registered finite session/turn cohort → raw event/task pages + `CollectionSnapshot` | Exhaust both endpoints with tested pagination; journal each page/failure; commit cursor only after complete traversal; preserve observation vs native clock |
| `src/server/guild/binding.ts` | A/B | Native event `task_id`, authenticated full graph and installation/policy-domain proof → `EventBinding` | Resolve the actual acting policy subject for each event; reject gaps/cycles/conflicting sessions/ambiguous actors; session root is never a default |
| `src/server/journal.ts` | B | Trusted records + expected revision → append-only facts, state transition, CAS result | SQLite is transactional action authority; short transactions; no transaction across HTTP; retain superseded revisions and unknown outcomes |
| `src/server/manifest.ts` | C/B | Operator-reviewed immutable reference and bytes → `PinnedManifest` | SHA-256 of exact bytes separate from Git reference; exactly one allowance per candidate scope; effective boundary/unit/clock/window validated |
| `src/server/admission.ts` | B | All raw versions, bindings, coverage and manifest → `ReadinessReport` + canonical set | Native identity domain established; compare all semantic versions before actor/ALLOW/operation/time filtering; quarantine conflicts; explicit gaps |
| `src/server/clickhouse/publisher.ts` | B | Sealed journal generation → insert acknowledgements → exact readback receipt | Publish immutable projection, retry/reconcile idempotently; compare ID set, native semantics, per-event binding, manifest and coverage; acknowledgement alone is insufficient |
| `src/server/clickhouse/queries.ts` | B | Trusted generation/manifest/anchor parameters → complete all-candidate rows + query receipt | Fixed versioned SQL with typed values; no browser actor/SQL; exact identity count; explicit zero candidates only after readiness; throw on partial results |
| `src/server/evaluator.ts` | B | Confirmed generation + pinned manifest → `EvaluationReceipt` | Query distinct historical event-time anchors plus current cutoff; save first crossing, peak witness/current count separately; all breaches and stable primary ordering |
| `src/server/investigation.ts` | A/B | Immutable bounded deterministic case context → actual native investigation/incident receipt | Real hosted context read and issue create; no admin/database credentials; reconcile unknown create result; check output claims; issue text never changes authority |
| `src/server/actions.ts` | D/B | Authenticated action reference + expected revision + CSRF token → prepared/approved/observed action | Resolve trusted scope server-side; hash exact intended scope/context; reject stale approval; prepare native review; store actual human-applied rule evidence |
| `src/server/verifier.ts` | A/C/B | Observed action + allowlisted target/control probes → `VerificationReceipt` | Genuine fresh requests; native target policy refusal; inspect control tool result/marker; separate failure/unknown; no hardcoded or prompt-given answer marker |
| `src/server/http.ts` | D/B | Local operator session + validated references → sanitized case DTOs | Bind loopback; exact Host/Origin allowlist; HttpOnly/SameSite cookie and synchronizer CSRF; escaped untrusted text; protected mutation routes |
| `src/client/CasePage.tsx` | D | Sanitized DTO → one case/review/effect view | Facts, interpretation, uncertainty, current/historical counts, policy application and effects remain distinct; no global “safe” badge |
| `src/server/export.ts` | D/B | Reviewed journal receipts → sanitized read-only evidence bundle | Strip secrets/private payloads/admin routes; preserve provenance/time/IDs required to assess claim; public export is not approval authority |
| `tools/replay.ts` and event-built correctness fixtures | B/C | Explicit synthetic seed + expected results → separate replay namespace/reports | Replay has no native publication/action permission; report stored rows vs canonical units; cut before recording if late |

### Contract shapes to agree before integration

Use strings for opaque IDs and exact decimal integers. Preserve timestamps as original source text plus validated exact UTC/nanosecond representation. Do not round through JavaScript `Date` before counting; do not convert UInt64/Int64 output to `Number` without a safe-range check. These are ScopeWatch contracts, not vendor payloads.

| Contract | Minimum content | Admission / authority rule |
|---|---|---|
| `LaunchReceipt` | Controller launch ID; mode; requested profile; actual workspace/session/task; corroborated subject/version; start/completion refs | Only server-approved routing; actual response/graph corroborates identity |
| `RawObservation` | Source/fetch/page ref; native event/task/session/workspace; stable original payload; native clock; observed time; bytes/content hash | Immutable raw source, including redeliveries and changed copies |
| `EventBinding` | Generation/native identity; acting task; actual policy subject; verified/unresolved/conflict; method and authenticated proof ref | Exactly one verified binding per admitted native identity; root launch label is insufficient |
| `CollectionSnapshot` | Registered cohort; endpoint/filter/order/page/cursor receipts; completion/reconciliation refs; missing mappings/fields/conflicts; cutoff | Qualified finite observed cohort, never a promise of all workspace history or future finality |
| `PinnedManifest` | Schema/version; immutable ref and SHA-256; effective start; workspace/credential/operation; exact unit/clock; W=600; candidate allowances/approval refs | Operator-controlled context frozen through main horizon; mutable branch head and model purpose are excluded |
| `GenerationReceipt` | G; raw/canonical expected keys/semantic digest; binding digest; coverage/manifest digest; cutoff; publication ACKs; readback result | Sealed immutable input; analytical readback must match all trusted context before evaluation |
| `ReadinessReport` | Each gap/conflict; manifest/binding/coverage cardinalities; native provenance; confirmed generation; cohort/individual status | Missing candidate ≠ zero; conflicts ≠ missing-only lower bound; whole cohort ready for definitive core selection |
| `EvaluationReceipt` | G/M/SQL hash; anchors and actual query IDs/outputs; all candidates; first crossing and peak witnesses; current count; sessions/source keys; uncertainty | Query supplies selected subject, not frontend; current zero never erases earlier crossing |
| `InvestigationReceipt` | Context hash/ref; native session/task/version; actual read refs; incident URL/create receipt; grounding checks | Interpretation only; administrative scope is resolved from stored deterministic facts |
| `ActionReceipt` | Action/case/evidence revision; manifest hash; workspace/subject/credential/operation/resource; scope digest; operator/time; observed native rule/evidence; state/version | Local CAS + immediate revalidation; no claim of atomic native policy mutation or remote CAS |
| `VerificationReceipt` | Action ID; fresh target/control launch/event/task/result refs; native reason; expected-content inspection method; probe times; residual scope | Both witnesses belong to the actual applied action; absence/failure stays unknown/failed |

`native_identity_key` is an injective encoding of the **verified vendor uniqueness domain**, such as a canonical tuple. Do not add session to a workspace-global identity merely to hide altered-session copies; do not infer the domain from UUID appearance. Keep vendor `credentials_id` distinct from normalized `credential_id` in source maps.

### Local state and native action interface

SQLite owns local state. Keep generation states **collecting → sealed → inserted → readback-confirmed → evaluated**. A timeout between insert and local state update is reconciled by exact readback; it does not earn a new independent event or a silent partial generation. Late source data creates G+1 carrying prior relevant versions forward, invalidates pending dependent review and triggers recomputation.

Case/action states must distinguish **evidence pending/incomplete/disputed, review ready, approved, native application unknown/observed, verification pending, verification failed, matching restriction verified**. A human rejecting an action records a reviewed rejection. A missing result is not a failed result, and neither is success. Keep old effect receipts at their observed times if later evidence becomes disputed.

Recovery is a separate reviewed action, not window aging. After deliberate removal of the specific native DENY and actual removal/readback evidence, require **expected successful results from both restored target and approved control**. This is a different verification predicate from target-refusal containment. Missing or failing results leave recovery unknown/failed; a late integrity conflict does not automatically remove an applied rule.

Possible application-owned routes are `GET /api/cases/:id`, `GET /api/cases/:id/evidence`, `POST /api/cases/:id/review`, `POST /api/actions/:id/approve`, `POST /api/actions/:id/native-receipt` and `POST /api/actions/:id/verify`. They are **event implementation choices**, not Guild endpoints. Mutation bodies carry stored IDs, expected revision and CSRF token; the server resolves the scope. Never accept arbitrary agent/credential/session IDs, SQL, URLs or CLI commands as approved scope.

Core action UI label: **“Review scope / open native policy configuration.”** It prepares the exact credential, operation, workspace, verified subject and proven repo/method selectors, then records the actual operator-applied native rule/evidence. It cannot advertise an automatic “contain” endpoint. The inspected public Guild API does not establish credential-policy mutation; account or trigger keys and `integrations:write` are not proof of policy authority. Native UI is the default; the documented CLI becomes an option only after its actual version, authentication, command and output are tested. Do not invent create/read/update/delete routes or audit fields. See [the concrete native route](../architecture/GUILD_CONTRACTS.md#concrete-application-route).

The approval transaction compares current case/evidence/manifest/scope revision and records the exact digest. Revalidate immediately before the human action. Another admin's edit or an old copied CLI command remains an external race; local CAS cannot make Guild UI atomic. Record pre-action context, actual readback/application and fresh effects. An out-of-band stale action is disputed, even if it happens to deny a call.

### Guild adapter implementation constraints

Choose one verified launch path. Account-key chat launch and trigger-key launch have different routes, payloads, returned session types and follow-up authority; do not merge them into a guessed generic call. Backend secrets stay server-side. A trigger key can reach other workspace sessions and select an alternate installed agent; issuance for the investigator does not mean investigator-only authority. Enforce a fixed installed-agent/profile allowlist.

Collect events and tasks separately, using the endpoint's actual tested pagination. Native events are durable after turn completion; favor short turns, record completion and exhaust pages. Newest-first default pages are not complete history. Do not advance a cursor past an unfetched page. Re-fetch completed captures to reconcile delayed/changed data, while labeling finality limitations.

For each counted event, traverse its authenticated task relation to the actual acting agent and validated policy selector domain. Definition, installation and display-name IDs are different objects until account proof says otherwise. A delegated B call inside A's root session belongs to B when the native relation proves B; missing/ambiguous traversal is unresolved. Avoid subagents in the main fixture to reduce complexity, while keeping the fixture/walkthrough that forbids root attribution.

Credential resolution depends on grants/caller chain, dedicated/member/workspace/account paths and SHARED/MEMBER mode. API-trigger runs lack a human acting user. Record actual evaluated `credentials_id` for both subjects and inspect grants/mode/default policy. `github_issues_get` as SDK tool does not prove policy operation `issues_get`; test the actual installed manifest and event. Repository/method selectors are used only after native evaluation is proved. A targeted DENY can override a broad fallback, but leaving the fallback does not establish least privilege for other operations.

The investigator needs actual pinned manifest/context reading and incident creation in the owned repo. Its available tools/native grants exclude manifest/evidence modification, credential/policy administration and arbitrary repository changes. Quantitative statements, identity and proposal scope are checked against stored facts. Unsupported theft, victim or maliciousness claims remain unreviewed interpretation.

### Analytical implementation constraints

Implement the fixed schema and exact query proposal in [CLICKHOUSE_CONTRACTS.md](../architecture/CLICKHOUSE_CONTRACTS.md) during the event, after source calibration. Plain MergeTree and exact grouping are sufficient. Sorting keys, insertion deduplication and ReplacingMergeTree are not native logical uniqueness or integrity checks. Do not add materialized views before correctness.

Readiness validates one manifest/candidate allowance, one qualified session snapshot per registered member and one verified per-event binding; it also rejects unknown identity domains, required-field gaps, changed semantic copies and inconsistent bindings. Compare complete stable records before applying ALLOW/actor/operation/time filters. A conflicting out-of-window DENY copy must still be detected. Full-row DISTINCT/count is the proposed conflict path; arbitrary `argMax`, `any` or `ANY JOIN` cannot select truth.

Freeze the small generation in SQLite, publish source versions, event bindings, coverage and manifest projection with awaited inserts, then **read back the exact expected generation**. For this tiny lab, compare sorted IDs and full canonical semantics directly, plus the binding/context records/digests. A matching ID set with altered policy subjects is a failure. Do not evaluate on insert acknowledgement alone or a result containing only part of the intended cohort. Publisher minimum visibility for this readback must be granted deliberately; it is not inferred from INSERT permission.

Use typed parameters for generation, manifest and exact anchor time. Keep the candidate set from the pinned manifest; return every ready candidate, including zero-event candidates. A candidate missing coverage/binding is incomplete, not outer-join zero. A verified acting subject with no allowance is an explicit missing-allowance state, not an INNER JOIN disappearance.

Evaluate **(T−600s, T] ∩ [manifest.effective_from, cutoff]**. The lower boundary is excluded; the upper boundary and effective start are included. Query all-candidate counts at every distinct canonical selected-ALLOW event-time anchor within the declared horizon, adding the entire equal-time group. Query cutoff separately for current usage. Save first crossing, peak witness/count and current count independently. If 21 approvals at 12:05 appear only at 12:20, the 12:05 crossing survives even when current count is zero.

Build an independent event-time two-pointer sweep during the event and compare its exact counts/witnesses with ClickHouse's actual anchor outputs on the small fixture. It is a correctness cross-check; it cannot replace the demonstrated database selection. Recompute the small affected candidate's full horizon after a late unique event; changed identity or mapping requires broader invalidation. Return all breaches; choose the primary by **first crossing time ascending, excess at first crossing descending, then workspace/subject/credential/operation IDs ascending**. This declared ordering is an application convention, not a severity score.

## Deliverable tickets and completion gates

These tickets are the minimum useful backlog. “Done” means the specified evidence exists. Optional tickets cannot compensate for an unfinished core ticket.

| Ticket | Owner / dependency | Concrete deliverable | Acceptance evidence |
|---|---|---|---|
| **T01 Native contract trial** | A+C; kickoff | Actual installation/version/credential/operation/unit/clock/selector ledger; two baseline calls; trial DENY/effects | Sanitized native event/task/installation pages, policy evidence and inspected control fixture; no assumed populated fields |
| **T02 Complete finite capture** | B; T01 source shape | Event-built collector plus raw/page/task/binding journal | Multi-page traversal, actual completion/reconciliation refs; failed-page fixture stays incomplete; per-event acting-subject proof |
| **T03 Main envelope/run cohort** | C; T01 and restored baseline | Immutable approved manifest, SHA-256, declared epoch and synthetic workload schedule | Approval/context predates activity; same actual credential; every main launch registered; trial events separated by explicit epoch |
| **T04 Generation publisher** | B; T02/T03 | Sealed immutable generation plus CH projections and readback | ID/semantic/binding/manifest/coverage equality; omitted row or altered binding prevents admission |
| **T05 Exact detector** | B; T04 | Versioned SQL, actual all-candidate historical/current outputs, first crossing/peak/current/session witnesses | Correct 30/20 versus 40/60 if actually achieved; zeros only with readiness; boundary/late/conflict oracle equality |
| **T06 Hosted investigation** | A; T05 | Real investigator reads pinned context and creates a useful issue | Actual source-read and issue-create receipts; counts/control comparison/unknowns checked; no privileged model capability |
| **T07 Review/native receipt** | D+B+A; T05/T06 | Authenticated precise review, CAS approval, actual UI/verified CLI application receipt | Stale revision rejected; browser cannot target arbitrary subject; native actual scope matches reviewed digest; unknown application preserved |
| **T08 Fresh effects** | A+C+B; T07 | Final target/control probes and effect receipt | Fresh native target policy refusal; actual expected control content inspected; both belong to action; target success/both fail are failure |
| **T09 Case screen/export** | D; T05–T08 | One readable case/query/review/effect page and sanitized read-only evidence index | Current/historical/evidence/action/effect states distinct; links/output resolve; no secrets, fabricated numbers or admin public path |
| **T10 Focused controls** | B+C; T02/T05/T07 | Event-built correctness fixtures and brief proof-class ledger | Duplicate/redelivery, new-ID retry, NULL/conflict, boundary/tie, missing coverage/binding, late history, nested actor, stale approval and unknown effect dispositions |
| **T11 Diverse replay/timing** | B+C; G2 passed | Separate synthetic dataset with declared expected answers and actual bounded timing | Native/replay authority split; stored rows vs canonical units; sample/query class/IDs/warmness/version/region; omit unmeasured stats |
| **T12 Semgrep candidate** | C; ordinary event source exists | Original scan/source provenance; owned consequence/positive control/fix/rescan if real finding obtained | Actual detector output precedes claimed discovery; no inserted defect; no finding-prize claim without earned evidence |
| **T13 Submission** | D with all owners; scope freeze | Actual recording, accessible repo/video, build/tool/sponsor explanation, team/contact details and form acknowledgement | Claims map to actual receipts; links readable by reviewer; submission target 4:15 PT |

## Focused acceptance matrix

Use the core native run for live facts and small explicitly labeled fixtures for edge semantics. Fixture success does not become a native account result. Each result records **native controlled, fixture, replay, walkthrough or unverified**.

| Check | Required outcome | Evidence class / priority |
|---|---|---|
| Routine support + higher-volume authorized bulk | Own pinned allowances determine compliance; bulk cannot become target because it is busier | Native controlled; core |
| Support excess across fresh completed sessions | Stable actual subject accumulates across sessions; SQL selects it and lists contributors | Native controlled; core |
| Exact native redelivery | Raw observations retained; one canonical approval and no duplicate case/incident | Native re-fetch/delivery; core |
| Genuine new-ID retry / ALLOW followed by downstream failure | Every distinct ALLOW unit counts; failure never called successful read | Native if safely obtainable; otherwise explicit fixture for count semantics and withheld live outcome claim |
| Lower edge, upper edge, effective start and tied timestamps | Exactly W-old excluded; anchor included; effective start included; whole tie group can cross allowance | Fixture checked against CH and event-built oracle; core correctness |
| Expired-current historical breach + late unique event | Earlier first crossing survives current zero; G+1 recomputes affected horizon | Fixture first; native delay shown only if observed |
| Changed same ID / NULL→value / changed session or actor | Conflict detected before filtering; pending case becomes disputed; no arbitrary latest copy | Fixture; core correctness |
| Nested B event inside A root session | B receives the event only with authenticated proof; ambiguous mapping remains unresolved | Fixture/walkthrough; account proof if actually present |
| Missing task/page/credential/clock/allowance | Explicit incomplete/missing state; never compliant zero or silent candidate omission | Fixture; core correctness |
| Projection ID set matches but actor binding differs | Generation readback fails; no eligible case | Fixture; core publication gate |
| Stale approval or browser-supplied scope/SQL | Reject or require current concrete review; no arbitrary target/SQL authority | Local event-built route verification; core |
| Unknown issue create / unknown native application | Reconcile known action/issue before retry; no blind duplicates or success badge | Fixture/walkthrough; real failures preserved if encountered |
| Wrong scope / both probes fail / target succeeds | Verification fails; correct scope and repeat both genuine probes | Core design; actual final positive/negative witnesses mandatory |
| Fresh post-policy new-session target + approved control | Matching native refusal + inspected expected control content; shared credential remains useful | Native controlled; core final outcome |
| Aging count or delayed conflict after effect | Historical receipt retained; no automatic recovery; disputed support reviewed | Fixture/walkthrough; core design |
| Dependency unavailable | Show unavailable/last confirmed evidence; real recording labeled if used | Core design; no invented live success |

Do not run 42 separate workflows. The wider [scenario playbook](../spec/SCENARIO_PLAYBOOK.md) is a design/claims map; one small shared native run covers the central outcome, while focused fixtures defend admission/window/state behavior.

## Cuts and fallback decisions

**Always cut:** a second application; a generic SOC/fleet console; a receipt server; a new OAuth/MCP bridge; autonomous policy administration; materialized rollups; new UDF deployment; automatic recovery; production tenancy/recipient classification; group budgets and multi-workspace scope. These are outside the five-hour critical path.

**Optional cause test before 1:30:** C may spend at most ten minutes of the existing scenario lane on a planted-ticket comparison after essential fixture work, provided native proof and the core loop stay on schedule. Stop by 1:30 and skip it if the core is delayed. A scripted burst is a controlled misuse simulation; prompt influence needs actual consumed source and matched behavior/control evidence. Keep its preflight/comparison context separate from the main epoch.

**Conditional only after G2:** exact outcome join only 1:30–1:45, diverse replay growing only while verification/recording stays protected, and already-working version-verified conveniences. Outcome enrichment needs exact native identifiers/cardinality; parent descendants or time proximity do not establish it.

Semgrep receives at most 20–30 minutes of focused discovery alongside ordinary correct generation of the same workflow. Preserve original source/scan output before repair. No interesting eligible finding means no finding-prize claim; keep the core and fixture owner intact. Do not insert a defect, request insecure code or start a separate vulnerability tournament.

| Failure by gate | Immediate action | Honest remaining claim |
|---|---|---|
| Native key/workspace access fails | Inspect actual scopes/restriction/mode once; request mentor help once; use tested native UI evidence if available | No complete API collector until proved |
| Native identity/unit/credential/acting-subject unresolved | Retain raw unresolved observations; stop definitive target/action eligibility; narrow the same product | Incomplete evidence review; no authenticated shared-credential breach |
| Selective policy scope fails | Inspect actual selector domain/default/grants; correct and rerun both; if still failed, preserve monitoring/investigation | No selective restriction or surviving-work claim |
| Trial baseline cannot be restored | Preserve actual trial; do not launch/narrate a supposed allowed excess | Setup proof only until verified allowed baseline |
| CH readback/query/coverage fails | Reconcile expected generation; reduce bounded data; retain error state | No authoritative all-candidate decision from partial results |
| Investigator cannot read/create artifact | Preserve actual output/unknown state; continue deterministic review | No completed hosted incident claim |
| Target succeeds, control fails or result absent | Diagnose reviewed scope/result path; repeat both actual probes | Failed or unknown verification, never a global green state |
| New syntax/alerts/tokens unavailable | Use ordinary parameterized SQL and restricted reader | Core remains valid if its gates pass |
| No cause influence/outcome join/finding | Omit stronger claim and optional panel | Actual permission circuit-breaker result |
| Cloud fails after real success | Use preserved real recording/receipts with capture time | Recorded observed behavior; no pretend live run |

CrossedLine is not a rescue build. Only consider an alternate submission if its genuine eligible finding, owned consequence/fix and hosted PR/policy behavior already work; a broken Guild/GitHub/credential setup may break it too. Otherwise finish the strongest honest ScopeWatch monitoring/review outcome and state the unproved effect.

## Evidence and submission handoff

Create a sanitized event evidence directory and index during the build. Use stable references to receipts, not secret-bearing logs. Keep original private raw evidence separately when sanitization would remove identifiers required for reasoning, and record what was omitted. Never fabricate a missing receipt or substitute a screenshot of planned counts.

| Bundle | Must retain | Reviewer can assess |
|---|---|---|
| Native setup/trial | Installed/version/policy ID domains; shared evaluated credential; actual operation/unit/clock; pages/tasks/mapping; trial rule/effects/removal and allowed baseline | Account-dependent gates were actually passed |
| Main context | Fixture inventory; operator approval; immutable manifest reference and SHA-256; effective start/cutoff; complete registered cohort | Allowances were approved before activity and coverage is bounded |
| Native generation | Raw observations/variants; canonical keys; per-event acting bindings and proof; coverage; journal seal; publication/readback | Target did not come from model labels, replay or incomplete projection |
| Detector | SQL version/hash/typed bindings; exact query IDs and full bounded outputs; historical/current/peak witness and per-session/source IDs | Database chose all-candidate result and preserved historical excess |
| Investigator | Native session/task/version; actual pinned context read; actual incident URL/create result; quantitative grounding check | Hosted AI contributed contextual work with limited authority |
| Approval/action/effects | Current revision/scope digest; operator/time; actual native rule/UI or verified CLI evidence; fresh target denial and control inspected result/times | Reviewed scope and observed subsequent matching effect with continuity |
| Scale/timing, if done | Explicit replay provenance/seed/expected result; stored/canonical counts; query class/sample/IDs; server/client source and unavailable logs; warmness/version/region | Measured analytics is separate from source/human/containment delay |
| Finding, if earned | Initial source/prompt/model/hash; unchanged actual discovery; rule/file/line; consequence and positive control; fix/rescan | Finding provenance and actual impact, rather than a scan logo |
| Public deliverables | Real recording; README/run steps/tools; sponsor evidence/timestamps/limits; accessible repo/video; team/contact and submission acknowledgement | Product works to the extent claimed and can be reviewed |

Report SQL latency by query class: conflict/canonical extraction, one anchor aggregate, full historical procedure or independent oracle. If timing twenty runs, report actual n and nearest-rank p50/p95 alongside failures/missing logs; do not silently mix these paths. `system.query_log` is execution metadata, not query results, and Cloud logs may require replica-aware authorized retrieval. Source creation→turn persistence→collection→queryable publication→evaluation→investigation→human/native action→both verification probes are separate stages.

Protect the final ninety minutes. A coherent recording of actual SQL selection, actual contextual incident, native reviewed scope and both fresh results is worth more than an optional integration without inspectable evidence. The final claim remains: **this authenticated workload's subsequent matching operation was restricted, and this approved control operation returned its expected synthetic fixture at the recorded time.**
