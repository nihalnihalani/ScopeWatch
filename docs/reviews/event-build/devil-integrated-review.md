# Devil integrated review — HEAD fb6d8eb (codex/scopewatch-event-build)

Reviewer: claude-opus-5-5. Report only; no code edits. Plan-review dispositions (DECISIONS D6) were checked in code.

## Receipts I ran (2026-10-09, local)
- `npx vitest run --project unit --project integration` → exit 0, 15 files / 190 tests passed.
- `npm run test:ch` (runtime/clickhouse-local.env) → exit 0, 3 files / 34 tests, real local ClickHouse 25.8.33.6.
- `SCOPEWATCH_MODE=replay SCOPEWATCH_SQLITE_PATH=<scratch> npm run replay` → evaluated, readback 5/5 components true,
  57 anchors + cutoff, 64 queries, oracle agrees; TicketAssist first crossing 12:05:00Z count 21 (5 sessions), peak 30;
  ReleaseReview 40/60; LabelSweeper explicit 0; review blocked (replay not eligible).
- Did not rerun e2e (acceptance is editing tests/e2e); inspected evidence/screenshots/contract-test-simulated-restriction-1440.png.

## Plan-review items verified as fixed (code evidence)
P0-1 native URL allowlist (config.ts NATIVE_GUILD_HOSTS, refuses loopback); P0-2 journal pinned to mode (journal.ts:168-195
refuses foreign provenance/file), simulated_* verdicts (core/actions.ts:107,128), eslint mock-import guard; P1-2 receipt
recheck → disputed_stale_application/scope_mismatch (services/actions.ts:96-128); P1-3 fresh probe after receipt,
unused session, server-held marker (guild/verifier.ts); P1-4 intents + reconcile, no blind relaunch; P1-5 readback
multiplicity + fresh-generation retry (publisher.ts:100-103, readback); P1-6 SEMANTIC_FIELDS + identity-domain gate
(admission.ts:41); P1-7 registry-based coverage (admission.ts:62-108); unreconciled launch intents block readiness
(pipeline.ts:131-136). Canonicalize-before-filter holds in both SQL (queries.ts VARIANTS_CTE has only the generation
filter) and an independently written oracle (core/oracle.ts). Per-event nested binding with no root fallback
(guild/binding.ts). Auth/Origin/Host/CSRF/strict schemas (http/app.ts:108-125). Good work.

## P0
None found.

## P1

**P1-A Evidence from an old generation stays approvable after a newer generation changes the primary candidate.**
Counterexample: G1 evaluates and TicketAssist is primary, so case X (id = hash(prov, manifest, primary)) reaches rev 1,
review_ready. Late arrivals land in G2, ReleaseReview now crosses earlier, and rankBreaches makes it primary, so G2 writes
case Y. Case X is never revised. Its pre-effect actions are never marked stale (staleness exists only inside one caseId,
journal.ts:424-453), and reviewCase/actionBlockedReason accept it because its own generation is `evaluated`. The same thing
happens when G2 is sealed-not-ready from a new open or failed session (only conflict gaps dispute cases,
pipeline.ts:146-150).
Consequence: an operator approves and verifies a restriction on superseded evidence. ARCH §6 says "a later source change
… invalidates pending action eligibility until reconciled".
Evidence: cases.ts:33-36 caseIdFor, 68-85 recordCase, 150-158 actionBlockedReason; selection.ts rankBreaches.
Owner: backend.
Repair: in actionBlockedReason and reviewCase, block when a newer generation for the same (provenance, manifest/scenario)
exists whose state is not this case's generation. Mark pre-effect actions of every older-generation case stale when any
newer generation is sealed. Add an integration test with a primary flip and a not-ready later generation.

**P1-B The recovery predicate accepts a target ALLOW decision as a "successful expected result".**
Counterexample: after removal, the target probe gets ALLOW and the tool then errors or returns wrong content. verifier.ts
returns `allowed` for the target role without inspecting content. recoveryVerdict (core/actions.ts:120-121) treats
`allowed` as success, giving `recovered` in native mode.
Consequence: recovery is certified from a decision, not an expected result. AGENTS.md says "ALLOW ≠ read" and recovery
needs "successful expected target and control results".
Owner: native and backend.
Repair: for recovery probes, inspect target tool response_data against a server-held target marker, the same way as the
control (`succeeded_expected`). Only that outcome satisfies recoveryVerdict. Also check control.boundSubjectId in
recoveryVerdict, as restrictionVerdict does.

**P1-C The removal receipt makes up "observed" selectors and asserts a match.**
recordRemovalReceipt (services/actions.ts:298-301) fills observedSelectors from the approved scope and sets
`matchesApprovedScope: true, mismatches: []`. The operator never supplies what was removed.
Counterexample: the operator removes a different or broader rule, or the wrong subject's rule. The receipt still says it
matches. Recovery probes then run against an unknown policy state.
Consequence: the receipt records values nobody observed as observed (unlabeled fabricated evidence).
Owner: backend and interface.
Repair: RemovalReceiptBody carries observed selectors, and compareSelectors is reused with decision 'REMOVED'. A mismatch
goes to a mismatch or disputed state and blocks recovery verify.

**P1-D The "Native gates (N of N passed)" header counts configuration presence, and passes in contract_test.**
In contract_test against the mock, the UI shows "Native gates (4 of 4 passed)" (screenshot
contract-test-simulated-restriction-1440.png, top). In native mode, "native identity domain: passed" means only that
GUILD_IDENTITY_DOMAIN is set, and "guild credentials and installs: passed" means presence only (http/app.ts:193-200).
Consequence: the UI implies native proof gates (G1/G2: actual acting subject, shared evaluated credential, identity
domain) have passed when none has. This is the "UI hides missing function" failure.
Owner: lead (status route) and interface.
Repair: rename the panel to "Configuration checks". In contract_test, report status `simulated` and never `passed`. Add
the real native proof gates G1/G1b/G2 as `pending` until a sanitized native receipt reference exists, and never derive
them from env presence.

## P2

- **P2-1 Verification ignores later case revisions.** verifyAction (actions.ts:225+) does not check that the case is still
  at action.caseRevision or not disputed before writing `restriction_verified`. Withhold the success verdict, or mark it
  disputed, when the revision changed (ARCH §8 "withhold the approved-current-case success claim"). Owner: backend.
- **P2-2 appliedAt is not bounded.** A future appliedAt is accepted, and probe notBefore = recordedAt even if the operator
  says the rule was applied later. Reject appliedAt > now + small skew, and use notBefore = max(recordedAt, appliedAt).
  Owner: backend.
- **P2-3 Native mode can point at the replay ClickHouse database.** Native mode accepts CLICKHOUSE_DATABASE=scopewatch_replay
  (config.ts check is one-directional). Rows are generation-scoped and the journal is authority, so impact is low, but
  provenance separation should be symmetric: refuse the *_replay / *_contract names in native. Owner: lead.
- **P2-4 identityDomainStatus `verified` comes from operator env (scenario.ts:62).** It should be called "operator-declared"
  in the UI and uncertainty list until a native proof reference is recorded. Owner: backend.
- **P2-5 Simulated green check styling.** Contract-test effect cards use the same green check styling ("Target refused by
  policy", "Control content inspected, as expected") as native success. Text labels are present (SIMULATED/NON-NATIVE), so
  this is P2. Use a neutral or hatched simulated style so screenshots cannot be cropped into a native claim. Owner:
  interface.
- **P2-6 Unknown/`'agent' in t` heuristics in normalizeTask (collector.ts:110-112).** A tool node without tool_name or
  entity_type but with an `agent` field is treated as an agent and can become the "acting" subject. This is NOT OBSERVED
  on any account. Keep it as a documented native gate, and fail to `unresolved` when entity_type is absent in native
  mode. Owner: native.

## Verdict
- **LOCAL_READY: conditionally yes after P1-A..D.** Core analytics are the strongest part: canonicalization first, the
  registry cohort, exact readback, all-anchor SQL with an independent oracle, and the historical crossing preserved at
  current 0. Each is backed by executed local ClickHouse receipts and mutation-checked tests. P1-A..D are small, localized
  authority and labeling repairs. They block the completion claims for "stale approval is rejected", "recovery verified",
  and "UI does not overstate native status". They do not block the analytical claim.
- **Native: NATIVE_PENDING, correctly reported in README.** No Guild response, acting-subject proof, shared evaluated
  credential, Cloud query, hosted investigation, human DENY or fresh probe exists. Every positive effect in the repo is
  `simulated_*` from the loopback mock. Remaining obligations are native ledger steps 1-9: `guild auth login`, keys,
  verified subject/credential/operation/identity domain, real cohort launch and collection, human DENY, fresh refusal and
  inspected control.
- Residual limits (not defects): no native finality, no external CAS, binding depends on an operator-supplied
  agentSubjectMap, and local ClickHouse is not Cloud.

## Re-review — HEAD 709a0ab (63d3276, 2bd264a, e177fe1, 709a0ab)

Receipts (working tree = HEAD plus acceptance's uncommitted tests/adversarial and tests/e2e edits):
- unit+integration: 16 files, 205/205 passed. client: 24/24. test:ch: 34/34 (local ClickHouse 25.8.33.6). `tsc --noEmit`: exit 0.
- First run hit 1 failure in tests/adversarial/contract.adversarial.test.ts (recovery removal body) plus a TS error in the
  same file while acceptance was editing it. A rerun of that file passed 10/10. This matches the lead's note (old bodies
  had no observedSelectors). It is not a product regression. Acceptance must commit and rerun before claiming green.
- e2e not rerun by me (acceptance is editing it).

| Item | Status | Evidence |
|---|---|---|
| P1-A superseded evidence | **Fixed** | journal.ts `supersededBy` / `supersedeOlderCases` run on seal of ANY newer non-collecting generation for the same manifest+provenance. Pre-effect restriction actions become `stale`, and actionBlockedReason blocks review (cases.ts). Tests: review-fixes "primary flip…" and "later NOT-READY sealed generation also supersedes". |
| P1-B recovery predicate | **Fixed** | recoveryVerdict now needs target AND control `succeeded_expected` plus both bound subjects (core/actions.ts). Recovery target probe inspects the server-held SCOPEWATCH_TARGET_EXPECTED_MARKER (verifier.ts inspectContent, purpose='recovery'), and the marker is a required native setting. |
| P1-C removal receipt | **Fixed** | RemovalReceiptBody.observedSelectors is required (strict schema). compareSelectors(removal) gives a mismatch, which goes to `scope_mismatch`; verify refuses because matchesApprovedScope=false. The UI form has no pre-fill. Test: review-fixes "removal receipt that differs…". |
| P1-D gate labeling | **Fixed** | Status splits `configChecks` (present/missing/simulated/not_applicable, "presence only, not proof") from `nativeGates` G1/G1b/G2. Those are always `pending` in native with receiptRef null, `not_applicable` elsewhere, and the UI flags "passed without receipt (invalid)". Tests in review-fixes. |
| P2-1 verify revision | **Partially** | Success is withheld (→ `disputed`) when the case revision changed or evidence is disputed. Supersession by a newer generation that produced a *different* caseId is not checked here: an action already at native_application_observed on a superseded case can still reach `restriction_verified`. Repair: also withhold when `supersededBy(caseId)` is non-null. |
| P2-2 bounded times | **Fixed** | appliedAt/removedAt more than 60s in the future are rejected. notBefore = max(recordedAt, appliedAt). Tested. |
| P2-3 native CH db | **Fixed** | config refuses `*_replay` / `*_contract` in native. |
| P2-4 identity domain label | **Fixed** | uncertainty line "operator-declared (no native proof reference)"; config check detail says the same. |
| P2-5 simulated styling | **Fixed** | Non-native probe/verdict badges use the hatched `tone-sim` style and a "Simulated:" prefix instead of the green ok tone. |
| P2-6 agent heuristic | **Fixed** | normalizeTask: agent only when entity_type matches Agent. agentRef is only read for agent nodes, otherwise `unknown`, which leaves the binding unresolved. Unit tests added. |

New observations from the fixes (P2, no P0/P1 regressions found):
- **R-1:** A recovery target with uninspectable content (`no_data`) returns `allowed`, which gives `recovery_failed`, where `recovery_unknown` would be correct ("missing → unknown"). This is conservative (never certifies), so it is wording/state only. Owner: native.
- **R-2:** Supersession counts any newer non-collecting generation, including `readback_failed` from a transient ClickHouse error, so one bad run blocks the current good case until a successful rerun. This fails closed and is acceptable. Disclose it in the blocked reason, which already names the state.

### Final verdict
- **LOCAL_READY: yes**, provided acceptance commits its in-progress adversarial/e2e updates and the full applicable suite
  (including `npm run test:e2e`) is rerun green on the committed tree. No P0/P1 remains open. P2-1 is partial (supersession
  is not checked at verify), and R-1 and R-2 can be cut with the reasons above.
- **Native: NATIVE_PENDING.** No native proof exists. All positive effects are `simulated_*` from the loopback mock, and
  G1/G1b/G2 are correctly reported as pending.
