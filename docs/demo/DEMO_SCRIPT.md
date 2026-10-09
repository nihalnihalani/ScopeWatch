# ScopeWatch: two-minute demo script

Prepared 9 October 2026. **This is a rehearsal plan. No native runtime results, policy effects, findings or benchmark latency have been measured for this repository.** Maya, HarborDesk, TicketAssist and ReleaseReview are fictional. The owned repository and its support/release tickets must contain synthetic data.

The core story is one operator decision: **which shared-credential workload should lose this matching capability, while approved work continues?** The [architecture](../architecture/ARCHITECTURE.md) defines the evidence and manual native action; the [evidence checklist](EVIDENCE_CHECKLIST.md) defines what earns each sentence below. Two minutes is a planning target, not a verified official duration cap.

## Before recording

- [ ] Complete a real source → ClickHouse decision → hosted investigation → reviewed native policy → fresh target/control verification run. Preserve the receipts before making the video.
- [ ] Replace every `{field}` below with a value from the same admitted case revision. If it has no evidence, use the weaker sentence in the claim table or omit it.
- [ ] Confirm both workloads' evaluated operations used the same actual integration credential. Same provider or repository is insufficient.
- [ ] Choose a historical crossing/peak anchor that explains the case. Show its window separately from the current count; delayed collection may mean the current window is already quiet.
- [ ] Verify the exact permission-event unit, actual acting-subject bindings, pinned manifest, finite observed cohort and analytical readback. If native finality remains unproved, say “captured native approvals” and “within the observed envelope.”
- [ ] Set the public view to a sanitized recording/read-only export. Keep the operator action in the authenticated local/native UI. Rehearse switching to actual Guild policy configuration without exposing a key.
- [ ] If steps are prerecorded or time-compressed, label them. Video timestamps below are presentation positions, not source-event times or a response-time benchmark.
- [ ] Open the exact query/result, investigator session/issue, native rule receipt and two fresh result witnesses. Do not depend on judge access to a private workspace session URL.

### Replace these fields from evidence

| Field | Source | Current value |
|---|---|---|
| `{support_sessions}` | Contributing native sessions for the selected witness window | Unmeasured |
| `{support_count}` / `{support_allowance}` | Actual query result / pinned operator manifest | Unmeasured / unpinned |
| `{release_count}` / `{release_allowance}` | Same-generation candidate comparison / pinned manifest | Unmeasured / unpinned |
| `{window_label}` / `{anchor}` | Exact `(anchor − 600s, anchor]` contract, truncated at manifest start | Unexecuted |
| `{manifest_version}` / `{case_revision}` | Sealed journal facts and immutable context reference | Not produced |
| `{actual_operation}` / `{actual_subject}` | Verified native policy operation / evaluated acting subject | Unverified |
| `{query_id}` | Actual ClickHouse execution receipt | Not produced |
| `{p50_ms}` / `{p95_ms}` / `{n}` | Labeled repeated measurement of one named query class | Unmeasured |
| `{target_probe}` / `{control_probe}` | Fresh native refusal / inspected real fixture result | Not produced |

The research fixture proposes allowances **20 and 60** in 600 seconds and target counts **30 and 40**. Those values are illustrative parameters, not results. Use them only if the pinned manifest and actual run establish them. Native ALLOW events do not prove successful reads, distinct records or exfiltration.

## Default cut: exactly 2:00

Narration is deliberately short so the operator can show readable proof. The scheduled segments total 120 seconds. Keep the number labels visible long enough to read; speak actual counts only after replacing the fields above.

| Video time | Narration | Visible proof / operator action |
|---|---|---|
| **0:00–0:15** | “Maya runs support triage and a release batch on one shared credential. Across {support_sessions} sessions, support captured {support_count} native permission approvals against its approved {support_allowance}. Revoking the credential would interrupt both jobs.” | Title: **Owned synthetic scenario; fictional operator**. Two workloads, actual shared-credential evidence and pinned allowances. Lead with the operator's tradeoff. |
| **0:15–0:40** | “ScopeWatch combines the captured sessions against each job's own allowance. This ClickHouse result selects support. The busier release batch is within its observed envelope. The historical witness remains visible even when today's count falls.” | Actual all-candidate result, count/allowance, contributing sessions, window/anchor, first crossing/peak and current count. Open `{query_id}` and the parameterized SQL. Show the separate replay measurement strip only if measured: query class, rows, p50/p95 and n. |
| **0:40–1:00** | “A real Guild investigator read the pinned manifest and created this incident. It explains the release exception, cites the contributing evidence and leaves unknown read outcomes explicit.” | Actual hosted session and context-read tool event, then actual incident issue. Count/identity/scope must match `{case_revision}`. The model's interpretation is visibly separate from the deterministic facts. |
| **1:00–1:30** | “Maya reviews this exact workload, credential and operation. She applies the rule in Guild's native policy UI. The rule is recorded; verification is pending. Now a fresh matching support request is refused.” | Exact reviewed scope and revision; manual native UI application or separately verified documented CLI. Show actual rule/readback receipt, then fresh native target refusal and evaluated `{actual_operation}`. Never replace this with a stopped process or global revoke. |
| **1:30–1:50** | “The approved release job still returns this expected synthetic fixture. These are fresh tool results after the action: target refused, control succeeded.” | Inspect actual returned control content/marker from `{control_probe}`; show `{target_probe}` beside it. A model's “done,” HTTP status or byte count alone is insufficient. Do not put the expected marker in the probe prompt. |
| **1:50–2:00** | “One inspectable case: native source, exact query, grounded investigation, reviewed policy and both results. We verified this subsequent matching operation was restricted while this approved work continued.” | Compact evidence receipt with manifest/case revision, source IDs, query ID, investigator/issue, applied rule and both probe times. Small scope note: other capabilities and in-flight work remain outside this proof. |

If the real control has fewer approvals than the target, replace “the busier release batch” with “the separately approved release batch.” Do not force the run or describe an unsupported ordering to match the story.

## Optional Semgrep cut: still 2:00

Use this cut only after obtaining an authentic, interesting, eligible finding in **this same ScopeWatch controller/support/collector codebase**. Preserve the default cut if there is no finding. Do not add a second application or turn planted native events into a finding claim.

| Video time | Beat | Proof |
|---|---|---|
| 0:00–0:10 | Maya, shared credential, actual support count/allowance | Same fictional/synthetic label and real case evidence |
| 0:10–0:30 | ClickHouse chooses the workload from the captured cohort | Both candidate rows, historical witness, actual query |
| 0:30–0:45 | Guild reads trusted context and creates the incident | Actual source-read event and issue |
| 0:45–1:10 | Maya manually applies the reviewed native rule; target refused | Exact rule receipt and fresh target probe |
| 1:10–1:25 | Approved work returns its expected fixture | Fresh inspected control result |
| 1:25–1:50 | “During ordinary generation of this same workflow, {actual_detector} found {actual_issue}. This owned test showed {bounded_consequence}; the correction passed this replay and legitimate control. Here is the actual rescan.” | Original source hash/reference, genuine detector/rule/file/line, discovery sequence, consequence witness/control, corrected version and actual rescan status. If manual discovery preceded scanning, say “we found it manually; Semgrep confirmed it.” |
| 1:50–2:00 | Evidence receipt and bounded final claim | Runtime case plus genuine finding evidence, with separate provenance |

The finding need not be the cause of the controlled permission excess. Connect it as security review of this product, and state that relationship accurately. If the scan only reports a candidate without a reproduced consequence, present a candidate under review and withhold the finding-prize claim.

## Claim variants for the actual result

| Evidence obtained | Strongest supported wording | Weaker wording / forbidden upgrade |
|---|---|---|
| Qualified captured native cohort and historical query witness | “Support exceeded its pinned approval-event allowance in this observed cohort/window.” | Missing actor/credential/coverage: “These captured events need attribution/reconciliation.” Do not call an incomplete candidate safe or definitively breached. |
| Counts without exact outcome matching | “{count} captured native permission approvals.” | Never “{count} records read/stolen.” Genuine retries with new ALLOW IDs still count even if the operation fails. |
| Exact inspected outcome witnesses | “These {n} successful synthetic lookup responses were observed.” | “Distinct records” requires actual unique object identities and returned content; status/bytes alone do not earn it. |
| Real hosted context read and issue creation | “The Guild investigator read this manifest and created this incident.” | No completed tool action: “We prepared investigation context; hosted issue creation remains unverified.” Do not call a local template a hosted investigation. |
| Native rule applied, probes pending/missing | “Native action observed; verification pending/unknown.” | Do not say restriction succeeded on a checkbox or rule-creation response. |
| Fresh matching target refused and real control fixture returned | “This subsequent matching operation was restricted; this approved control succeeded at these recorded times.” | Target succeeds: restriction failed. Both fail: continuity failed. Missing result: unknown. No “whole agent contained.” |
| Deterministic hosted excess | “Controlled misuse simulation.” | No prompt-injection claim from a planted ticket beside scripted calls. |
| Matched benign/planted input traces show consumption and changed behavior | “In this controlled comparison, the lower-trust ticket influenced these subsequent calls.” | One trace is not a robustness benchmark or proof of all attacks being prevented. Secure refusal/no influence is a valid outcome. |
| Real native case plus separate measured replay | “This live controlled case establishes the effect; this labeled replay measures the named query workload.” | No production traffic, million attacks, customer fleet or end-to-end latency claim from replay SQL alone. |
| Genuine eligible Semgrep finding plus provenance and consequence | “Semgrep detected this issue in our ordinarily generated code; these tests establish its bounded consequence and correction.” | Clean scan/no finding: “We scanned for quality; no eligible interesting finding was obtained.” A later custom rule is confirmation unless it actually discovered it first. |

## Thirty-second reviewer answers

- **“Isn't this a rate limit?”** “Yes, a rate limiter can count across sessions. Our contribution is the inspectable shared-credential decision under each workload's own allowance, a real contextual investigation, and the verified narrow restriction with approved work preserved. It is asynchronous.”
- **“Why ClickHouse?”** “A counter can solve the tiny case. Here ClickHouse actually selects the workload and contributing sessions. The separate measured replay shows the same named analytical question at the recorded scale. We do not claim exclusivity.”
- **“Why a model?”** “It reads the trusted context and produces this useful incident. Counts, identities, allowances and policy authority stay deterministic and operator-owned.”
- **“Was this a real customer incident?”** “No. Maya is fictional and the tickets are synthetic. These are actual controlled native sessions if the receipts are present; replay load is labeled separately.”
- **“Is this instant prevention?”** “No. Events persist after completed turns; collection, review and human action add delay. It does not prevent the first excess approval or interrupt an already permitted turn.”
- **“What happens when the window empties?”** “The historical breach stays visible. Native policy removal is a separate reviewed recovery with fresh success probes.”
- **“Is manual policy application automated containment?”** “No. ScopeWatch prepares the exact scope, records operator approval and native application evidence, then verifies the observed effects.”

## Recording fallback

If cloud/network access fails after a verified run, show the genuine sanitized recording and receipts with their run time, explicitly labeled prerecorded. If an essential gate never passed, use the corresponding weaker variant and show pending/failed states. Do not create simulated success screens or narrate planning values as observations.

The sponsor proof positions are summarized in [SPONSOR_STRATEGY.md](../sponsors/SPONSOR_STRATEGY.md); finish the [submission checklist](SUBMISSION_CHECKLIST.md) before the event deadline.
