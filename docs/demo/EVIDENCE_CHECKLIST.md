# ScopeWatch evidence checklist

Prepared 9 October 2026. **Every checkbox starts open. No runtime findings, policy effects, benchmark measurements or event-account tests are asserted by this handoff.** Planned fixtures and diagrams do not count as implementation evidence.

Use this checklist with the [architecture](../architecture/ARCHITECTURE.md), [Guild contracts](../architecture/GUILD_CONTRACTS.md), [ClickHouse contracts](../architecture/CLICKHOUSE_CONTRACTS.md), and [demo script](DEMO_SCRIPT.md). Preserve one coherent case revision; stronger claims require additional evidence, not stronger narration.

## Evidence classes and review state

| Class | Meaning | Can support native action? |
|---|---|---|
| Native controlled case | Actual Guild source and tool results from owned synthetic fixtures | Only after identity, coverage, generation, manifest and action gates qualify it |
| Application-derived fact | Journal binding, canonicalization, query result or state transition with source references | Only through the qualified native case contract |
| Synthetic/replay fixture | Generated rows/edge conditions/load with expected answers | No; separate namespace and privileges |
| Model interpretation | Investigator explanation or hypothesis | No; never changes deterministic scope or allowance |
| Designed/unexecuted | Planned behavior, source docs or diagrams | No |

Record each item as **not run / passed / failed / unknown / disputed**, its reviewer, capture time, artifact reference and case revision. Use “unknown” for absent evidence; do not convert absence into zero or success. Current state for every section below is **not run**.

## 1. Scenario, manifest and baseline

- [ ] Label Maya/HarborDesk fictional and all tickets/customer references synthetic; record owned repository and fixture version/hash.
- [ ] Pin the operator manifest **before** the declared main run: immutable repository reference plus distinct content hash, effective start, window width, allowance, unit, verified workspace/subjects/credential/operation, approval source and version.
- [ ] Establish what a native ALLOW event actually counts. Do not assume one tool call equals one event or one completed read.
- [ ] Bind actual installed policy subjects and versions for TicketAssist and ReleaseReview. Keep display names and agent-definition IDs separate from installed/evaluated subject IDs.
- [ ] Verify both selected operations actually resolve the same integration credential through native metadata/independent authoritative binding. Check SHARED/MEMBER mode and actual resolver priority; a provider label is insufficient.
- [ ] Verify exact installed tool and native evaluated operation names. An SDK prefix such as `github_issues_get` is not automatically policy operation `issues_get`.
- [ ] Prove a permitted baseline with actual returned fixture content for both workloads before the main scenario.
- [ ] Record preflight runs/rules separately with declared interval/provenance. Restore only the known trial rule and verify the baseline; do not silently omit setup approvals that fall within the declared evaluated interval.
- [ ] Record the finite controller-managed task/turn cohort before evaluation. The coverage claim is this cohort, not all workspace or account sessions.

Illustrative research parameters are support allowance 20/count target 30 and release allowance 60/count target 40 in 600 seconds. They remain unpinned/unobserved until established by the actual run.

## 2. Native collection and attribution

- [ ] Preserve sanitized native session/task/event snapshots, original semantic fields, source account/scope, pages/cursors, supported ordering and failed-page records.
- [ ] Exhaust the supported snapshot rather than using only the newest default page. Do not advance a high-water mark past an unfetched page.
- [ ] Retain actual completion evidence and reconciliation reads. Events persisting after completed turns add source delay; repeated stability does not prove perpetual vendor finality.
- [ ] Document the authoritative native identity domain. Keep IDs opaque; UUID appearance/order does not establish global uniqueness or pagination order.
- [ ] Preserve native record-creation time, collector observation time and any actual service/result time separately, with precision/timezone and clock uncertainties.
- [ ] Resolve each security event to its **actual evaluated acting policy subject** through native task evidence. Do not copy the requested root agent onto delegated descendants.
- [ ] Preserve event → task → subject mapping method/proof and evaluated credential/operation. Null, conflicting or unverified required fields keep admission unresolved.
- [ ] Compare all semantic versions per identity before ALLOW/actor/operation/time filtering. Identical delivery yields one canonical fact; conflicting decision, actor, credential, operation, session or time is quarantined/reconciled.
- [ ] Preserve genuinely distinct retry IDs as distinct approvals even if the downstream operation fails. Keep DENY/ERROR separate; ERROR is not universal proof of refusal.
- [ ] Keep outcome context unmatched unless a proven exact native relationship and cardinality attach that outcome. Parent ancestry alone is insufficient.
- [ ] Explicitly disclose late/active/missing cohort members, unsupported source-finality claims and unmanaged sessions outside scope.

Required public wording when finality remains unproved: **“captured native approvals in this observed cohort,” “within the observed envelope,”** and any applicable evidence gaps.

## 3. Sealed generation and analytical admission

- [ ] Seal raw/canonical identity sets and semantic digests, per-event acting-subject bindings/digest, snapshot references, manifest reference/hash and qualified coverage in the journal generation.
- [ ] Preserve publication acknowledgement and exact analytical readback. Compare the expected bounded ID set/digests, actor bindings, manifest and coverage against the journal.
- [ ] Reject a partial/mismatched projection. INSERT acknowledgement alone does not earn evaluation or a compliant zero.
- [ ] Record collecting → sealed → inserted → readback-confirmed → evaluated states, retries and generation/case revision. Do not imply a distributed transaction between SQLite and ClickHouse.
- [ ] Ensure only the trusted native admission path can publish native facts. Replay/browser/model labels cannot mint native provenance or create an approved action.
- [ ] Invalidate pending approvals if source facts, mapping, manifest or coverage change. Preserve prior effect receipts with their observed times if later evidence becomes disputed.

## 4. ClickHouse decision and correctness

- [ ] Save actual schema/query text or immutable reference, parameters, query ID, result rows and server version/region.
- [ ] Evaluate **all qualified pinned candidates** against their own allowances. Supply generation/manifest/operation/anchor, not a preselected suspect actor.
- [ ] Include zero-observed-count candidates with qualified coverage; an omitted row or unknown candidate is not a safe zero.
- [ ] Apply `(anchor − 600 seconds, anchor]`, truncated at manifest effective start, with native precision and whole equal-timestamp groups.
- [ ] Evaluate historical event-time anchors as well as the current window. Preserve first crossing and peak witness separately from today's count.
- [ ] Return actual count, allowance, subject/credential/operation, window/clock, manifest version, contributing sessions and evidence status for target and control.
- [ ] Check against an independent exact reference sweep using the same admitted facts. Preserve expected and actual answers for boundary, duplicate, late-event and high-volume-compliant cases.
- [ ] Verify a delayed breach remains visible after it ages out of the current window. A current zero must not erase the historical case.
- [ ] Verify missing page/mapping, same-ID semantic conflict and changed actor binding yield incomplete/disputed evidence. Label non-native edge fixtures as fixtures.
- [ ] Do not claim immediate uniqueness from ReplacingMergeTree merges, exact rolling semantics from summed minute buckets or updated manifest semantics from stale incremental-view joins.

## 5. Real Guild investigation

- [ ] Retain actual trigger/launch record, returned session/task identity, hosted agent/version and run times.
- [ ] Prove a real tool read of the exact pinned manifest/context. A prompt containing a copied policy is weaker than the claimed independent read.
- [ ] Retain actual incident-creation tool event, repository/issue URL and captured issue content at review time.
- [ ] Verify counts, contributing IDs, interval, identities, bulk exception, unknowns and proposed scope against deterministic case facts.
- [ ] Label model hypotheses and unreviewed/inaccurate statements. If grounding fails, use deterministic manual review and withhold the grounded hosted-incident claim.
- [ ] Verify investigator tools/policies permit the needed manifest read and incident create while excluding evidence/manifest mutation, policy administration and arbitrary redirection.
- [ ] Keep trigger/admin/database keys out of prompt, frontend and exports. A trigger-created key can have broader workspace/session access; do not describe it as investigator-only isolation.
- [ ] Preserve a shareable sanitized tool trace and video if private native URLs require workspace access.

## 6. Operator approval and manual native action

- [ ] Record authenticated operator, approval time, case/evidence revision, manifest reference/hash, exact workspace/subject/credential/operation, verified selectors, intended mutation and scope digest.
- [ ] Resolve scope from trusted stored references. Reject browser-supplied arbitrary actor/credential/SQL/command and model-issued administrative text.
- [ ] Verify local revision/CSRF checks and revalidate immediately before action. Changed evidence/scope requires fresh review.
- [ ] Show **actual human application in Guild native UI** or a separately verified documented CLI with real authority. No documented policy mutation API is assumed by this core.
- [ ] Capture actual native rule ID/selectors/readback or clear native UI evidence, application time and observed pre-action rule context. A command preview or checkbox is insufficient.
- [ ] Use repository/method selectors only after proving the selected integration evaluates them. Record exact operation semantics and any overlapping grants/default allow-all.
- [ ] Remove/replace initial allow-all before claiming a least-privilege baseline. A targeted DENY can override it without tightening unrelated operations.
- [ ] Record unknown/rejected application outcomes and reconcile before retrying. Do not blindly create contradictory duplicate rules.
- [ ] Disclose the external race with other admins/native edits. Local CAS does not make remote policy edits atomic; an old copied scope applied out of band is disputed/needs review.
- [ ] Distinguish approval, native action observed and verification pending. Do not turn native application into a green effect claim before both probes.

## 7. Fresh effect and surviving work

- [ ] Launch a genuinely fresh target operation after the action, preferably a new session/task, retaining actual evaluated subject/credential/operation and source time.
- [ ] Capture actual native refusal/reason for the reviewed matching scope. A local stop, archived agent, paused trigger or global credential revoke is a different control.
- [ ] Launch a fresh approved control through the same actual credential after the same action.
- [ ] Inspect the real returned synthetic fixture content/marker or an audited wrapper of the actual SDK result; retain wrapper/source version if used.
- [ ] Keep the expected marker out of the model prompt. Do not accept model prose, DONE, HTTP status or byte count alone as successful approved work.
- [ ] Bind both probes to the action/rule/case revision and record times and rule context.
- [ ] Declare **verified matching restriction** only when target refused **and** control content succeeded. Target succeeds = restriction failed; both fail = continuity failed; missing witness = unknown.
- [ ] List residual scope: other operations/resources/credentials/integrations, already permitted calls and in-flight work. No global safe/fully-contained badge.
- [ ] Keep historical breach/effect receipts when the window empties. Recovery is separately reviewed; after actual rule removal/readback, both restored target and control must return their fixtures. Missing recovery results stay unknown/failed.

## 8. Separate real case from replay scale

- [ ] Keep native controlled evidence and replay in distinct namespaces/permissions; replay cannot publish native events or approve actions.
- [ ] Label replay seed/generator/version, population shape, expected candidate answers and source class in UI/video/README.
- [ ] Include varied subjects, credentials, sessions, operations, decisions, allowances, time distribution, larger compliant actors and smaller breached actors.
- [ ] Include repeated IDs, delayed arrivals and conflict/missing-mapping fixtures with expected outcomes. Repeated same-ID rows are not new approvals.
- [ ] Record stored rows, distinct canonical/replay identities, candidate/workload count, selected-operation fraction and dataset-kind split.
- [ ] Grow only after verifying semantics and the complete core. One million rows is a possible planning target, not a required floor or an observed production fleet.
- [ ] Report no customer users, real attacks, stolen records or additional discoveries from generated load.

## 9. Measurement receipt

Every timing row starts **unmeasured**. Save raw samples, sample definition, inclusion/exclusion/failure counts, clock/source and exact units. Report p50/p95 with actual **n**, chosen percentile convention and warm/cold conditions; do not populate a p95 from a vendor claim or hide a slow/failed sample. A single observation is a single duration, not a useful distribution benchmark.

| Measurement | Required fields | Current state |
|---|---|---|
| Single current-window SQL aggregate | Query class/text/hash, actual query IDs/results, server version/region, dataset cardinality/diversity, server `query_log` duration or labeled client round trip, rows read if available, warm/cold, raw samples, n, p50/p95 | Unmeasured |
| Historical-anchor evaluation | Same fields plus anchor/candidate counts, total sweep definition and validated expected answer; measured separately from a single aggregate | Unmeasured |
| Turn persistence / collection / publication | Native record time, actual completed-turn observation, collector observation, coverage/reconciliation and queryable-publication observation, clock uncertainty, per-phase samples | Unmeasured |
| Detection handoff | Explicit start/end (e.g. queryable admitted generation → evaluated case); excludes or includes poll wait as declared | Unmeasured |
| Hosted investigation | Actual launch/session, trusted context read and completed issue-create times; elapsed definition | Unmeasured |
| Human native action | Approval time, manual application/rule observation time and scope; human delay labeled explicitly | Unmeasured |
| Verification | Actual fresh launch/refusal/control-result times and final two-probe completion; not rule-creation latency | Unmeasured |
| Total response | Declared starting witness/event and final verified outcome, whether human wait included, phase breakdown and clock caveats | Unmeasured |

Prefer a bounded repeated SQL sample, such as 20 runs if time permits, but report the actual n. Leave unavailable `query_log`, rows-read or server statistics unavailable and use a labeled client measurement. SQL milliseconds are not containment milliseconds; source persistence, polling, model work, human review and probes are separate. Negative/inconsistent clock lag is a data-quality issue, not silently clamped to zero.

## 10. Optional cause comparison

- [ ] Preserve matched benign/planted synthetic tickets; change only lower-trust content while freezing trusted task, tools, fixture, manifest and launch schedule.
- [ ] Record fresh tasks, exact ticket-read result/source consumption and ensuing tool calls for each condition.
- [ ] Do not script extra calls and attribute them to the model. Deterministic excess is labeled misuse simulation.
- [ ] Claim influence only when the actual trace establishes consumption and expansion beyond the trusted job relative to the control; repeat a surprising result if feasible.
- [ ] Record no influence or secure refusal honestly. A single comparison is not a robustness benchmark.
- [ ] Cap at ten minutes within the existing scenario lane; stop by 1:30 PT or earlier if the core/probes/scan preservation need the time.

## 11. Optional same-codebase Semgrep finding

- [ ] Start the actual supplied scan path during ordinary generation of this ScopeWatch support/controller/collector code. Require correct authenticated behavior; do not request or insert a defect.
- [ ] Preserve original generation prompt, model/tool/version, initial source/output, immutable reference/hash, time and unchanged scan/hook output **before repair**.
- [ ] Record actual scanner/setup, detector/ruleset/rule ID, file/line, source hash, command/config/versions and scan errors/status. Do not relabel an offline capability audit as a discovery.
- [ ] Describe scanner-first versus manual-first chronology. A later custom rule is confirmation unless it performed original discovery.
- [ ] Preserve an owned synthetic consequence witness with a legitimate positive control. Separate alleged severity from observed impact.
- [ ] Retain corrected source/patch version, repeated consequence test, surviving legitimate behavior and actual rescan result, including remaining findings/errors.
- [ ] Explain why this issue is interesting in this workflow. A raw finding count or generic severity label alone is weak evidence.
- [ ] Confirm the actual discovery/scan/custom-rule route and one-project eligibility with the sponsor/event materials. Fixed remote `guardian-default` rules and OAuth setup differ from CLI configuration; organization Policies do not automatically apply there.
- [ ] Cap focused discovery at 20–30 minutes total. No separate 28-generation app, manufactured vulnerability, late second project or mandatory finding quota.
- [ ] If no authentic interesting eligible finding exists, mark **no finding obtained** and omit the finding-prize claim. Scanning for quality may still be described accurately.

## 12. Public evidence package and final review

- [ ] Use the repository templates only as blank capture scaffolds; do not mark them as measured receipts until populated from actual evidence.
- [ ] Bundle sanitized source snapshots/mappings, generation and manifest references/digests, query/result/timing, investigator/context-read/issue, reviewed scope/native rule evidence and both probe witnesses.
- [ ] Preserve originals privately where needed and map sanitized artifact to original reference. A hash supports tamper evidence, not proof of immutable storage or comprehensive safety.
- [ ] Redact credentials, trigger/admin keys, cookies and sensitive response content; preserve enough scope/identity continuity to audit the shared-credential claim without exposing secrets.
- [ ] Label prerecorded/cached proof and actual run times. Keep public export read-only with no live administrative route.
- [ ] Ensure every video number/status/claim traces to the same case revision; each benchmark has its own dataset/query/sample receipt.
- [ ] Attach genuine finding artifacts only if obtained. Mark planned/adversarial fixture tests distinctly from live native results.
- [ ] Have a teammate check the final [script](DEMO_SCRIPT.md), sponsor claims and [submission checklist](SUBMISSION_CHECKLIST.md) against these artifacts.

The final supported success statement is: **“In this observed controlled cohort, the query identified the workload exceeding its pinned native-approval allowance; a real hosted investigator created the case; after operator-reviewed native action, this fresh matching target operation was refused while this fresh approved control returned its expected fixture.”** Until all required evidence exists, use the weaker variant matching the actual state.
