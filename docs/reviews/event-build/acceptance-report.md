claude-sonnet-5-5

# Independent acceptance report

LOCAL verdict: LOCAL_READY for the families below (replay + contract_test against the real local backend and real local ClickHouse 25.8.33.6). Native gates: all PENDING; nothing here is native evidence. contract_test runs use the loopback CONTRACT-TEST MOCK (labeled, not observed account behavior).

## Files
tests/e2e/{01-auth,02-replay,03-contract-flow,04-responsive}.spec.ts, tests/e2e/support/{start-e2e-server.mjs,e2e-server.ts,helpers.ts,constants.ts}; tests/adversarial/{support.ts,replay.adversarial.test.ts,contract.adversarial.test.ts}; evidence/screenshots/*.png (17, synthetic/mock only, no secrets).
Harness: start-e2e-server.mjs registers tsx and starts replay on PORT (4417), contract_test on PORT+1 (cookie host `localhost`), mock Guild on PORT+2, a harness-only mock-clock tick side channel on PORT+3. Fresh SQLite under runtime/e2e/, real ClickHouse lanes from runtime/clickhouse-local.env. Contract cohort (5 target + 2 control sessions) is launched through the real scenario service at startup.

## Commands and results
| Command | Exit | Result |
|---|---|---|
| npm run build | 0 | server + client built |
| npm run test:e2e (npx playwright test) | 0 | 34 passed (final); earlier runs failed only on my own locator/precondition bugs, fixed |
| npx vitest run --project integration | 0 | 7 files, 98 passed (incl. 26 adversarial) |
| npx vitest run --project unit | 0 | 8 files, 86 passed |
| npx vitest run --project client | 0 | 1 file, 20 passed |
| npm run test:ch | 0 | 3 files, 34 passed (real ClickHouse) |
| npx tsc -p tsconfig.json --noEmit | 0 | clean |
| npx eslint tests/e2e tests/adversarial | 0 | 0 errors (6 unused-directive warnings) |

## Per-family verdict
- Auth/session/CSRF/Origin/Host: PASS (UI + HTTP). 401 without/forged session, 403 wrong/missing CSRF, 403 foreign/missing Origin, 403 foreign Host (DNS rebinding), HttpOnly+Strict cookie, secret not echoed.
- Replay case (UI): PASS. Primary/control values asserted against API JSON; oracle agrees; 64 receipts match per-class; timeline inspector; review blocked with reason and API 409 not_eligible; export download has NOT NATIVE EVIDENCE limits.
- Contract flow (UI+mock): PASS. Dialog Tab/Shift+Tab trap over 55 presses, Escape closes and restores focus; wrong-scope receipt -> scope_mismatch; correct receipt -> native_application_observed; stale action version -> 409 shown in UI; verify without mock policy -> verification_failed (target outcome `allowed`, verdict restriction_failed); after HUMAN-simulated mock /__mock/deny -> simulated_restriction_observed (target refused_policy, control content inspected); recovery fails while mock deny remains, then simulated_recovered after /__mock/undeny. No `restriction_verified` or native `recovered` anywhere in case/export JSON.
- Responsive: PASS at 360/768/1440 both modes: no page-wide horizontal overflow, no console errors, no 5xx/failed requests; 360 handoff dialog fits.
- Adversarial/integration: PASS. Injected subject/credential/sql/command fields -> 4xx and no action; path-traversal seeds rejected; replay approve 409 and zero actions; stale expectedRevision 409; native-receipt/verify/removal from rejected state 409/404; duplicate approve 409; export/status/case payloads contain no configured secret or CH password; replay run leaves native db `scopewatch` row counts identical (replay db grew); replay receipts all name scopewatch_replay, contract receipts scopewatch_contract; readback failure (rows dropped at the ClickHouse client insert seam) -> generation readback_failed, no case, native db untouched.

## Findings
- P2-1 UI/server disagreement on contract_test review. Expected: one policy. Actual: server accepts review/approve for contract_test cases (needed for simulated states), UI disables "Review restriction" ("Contract-test provenance is not action eligible") so the simulated review path is unreachable from the UI. E2E therefore approves via API then drives receipt/verify/recovery in UI. Route: POST /api/cases/:id/review; src/client/format.ts actionEligibilityReason. Evidence: tests/e2e/03-contract-flow.spec.ts tests 2-3.
- P2-2 Probe freshness depends on Guild-clock vs server-clock. verifyAction uses receipt.recordedAt (server wall clock) as notBefore and discards probes whose Guild `created_at` is not strictly after it (actions.ts probeSafely). Any skew/second-resolution timestamps yields verification_unknown ("probe was not strictly after the native receipt time"). Reproduced with the mock whose virtual clock starts at a fixed past instant: verification is unreachable until the mock clock is ticked. Not a mock-only issue for a native run with skew; consider recording skew tolerance or comparing against Guild-observed times. Evidence: first adversarial run output "discarded as stale"; harness uses tickMock().
- P2-3 Session cookie `sw_session` is not port-scoped: two instances on the same host (127.0.0.1) overwrite each other's session (observed risk; harness uses localhost for the second). Dev-only.
- P3-4 removal-receipt on a restriction action returns 404 (restriction action not a recovery) rather than 409.
- P3-5 Operator-entered appliedAt with second precision within the same second as approval is flagged out-of-band (disputed_stale_application) because approvedAt has ms precision. Observed when tests used truncated timestamps. Human-paced use unaffected.
- Observation: UI was changed concurrently by the interface teammate (QueryPanel grouped by class) during my work; specs were updated to the new structure.

## Not covered
Native/Guild live behavior (G1/G1b/G2), real identity-domain/policy IDs, Cloud ClickHouse, UI approve path for contract_test (blocked, P2-1), investigation UI against mock narrative, dark mode/contrast measurement, multi-operator concurrency across real browsers, readback failure through the browser, late-arrival-v1 seed in UI, conflict/gap states in the UI (covered only by backend tests), keyboard test of the Review dialog itself (only the handoff dialog).
Native evidence status: none; all native gates pending.

## Update after lead fixes (a4a8ce1, 3f4fab5, fb6d8eb)
- Specs updated: cookie `sw_session_<port>`; contract_test review now driven through the UI (dialog shows SIMULATED labels, approve exact scope, handoff); mock-clock side channel removed (controller-clock freshness works without it, including in adversarial tests); eslint clean (0 errors, 0 warnings).
- New 05-generations-dark.spec.ts: mock events endpoint 500 -> generation listed under "Evidence generations" as not admitted, no case created, existing case JSON byte-identical; dark mode 1440 (replay + contract-test) no overflow/console errors, screenshots saved.
- Sequential final run: npm run build exit 0; npm run test:e2e exit 0 (36 passed); npx vitest run --project integration exit 0 (7 files, 104 passed). P2-1, P2-2, P2-3, P3-4, P3-5 verified closed by these runs.
- Still not covered: native/live, Cloud ClickHouse, contrast measurement, multi-operator concurrency, conflict-state generation in browser (only coverage-incomplete shown).

## Update after devil integrated-review fixes (2bd264a, e177fe1, 709a0ab)
- Harness sets SCOPEWATCH_TARGET_EXPECTED_MARKER (mock target marker). Adversarial removal bodies carry observedSelectors.
- E2E recovery flow now: mismatched removal receipt -> scope_mismatch, verify refused 409; corrected receipt with mock deny still applied -> recovery failed; undeny + mock targetWrongContent (bare ALLOW) -> NOT recovered; correct target+control content -> simulated_recovered. New test: status shows "Configuration checks (N missing)" and "Native proof gates", no "N of N passed", no gate `passed`.
- 05: a not-ready newer generation leaves case evidence/actions/revision untouched; only actionBlockedReason changes (superseded note).
- Runs (sequential): npm run build 0; npm run test:e2e 0 (37 passed); npx vitest run --project integration 0 (8 files, 120 passed); eslint tests/e2e tests/adversarial 0 problems; tsc 0.
- NEW FINDING P2: server accepts a corrected removal receipt from scope_mismatch (actions.ts recordRemovalReceipt), but EffectPanel RemovalForm renders only when recovery state is `approved`, so after a mismatched removal receipt the operator has no UI to correct it. E2E corrects via API and records an annotation `finding`. Fix: show RemovalForm for `scope_mismatch` recovery actions.
- Screenshots refreshed: contract-test-simulated-recovered-1440, new contract-test-removal-mismatch-1440.

## Final pass (after 347097f)
- Recovery spec now corrects the removal mismatch through the UI form (API workaround removed); previous P2 (no removal form after scope_mismatch) CLOSED.
- All 21 screenshots in evidence/screenshots regenerated against the current UI.
- Sequential: npm run build 0; npm run test:e2e 0 (37 passed); npx vitest run --project integration 0 (8 files, 120 passed); eslint tests/e2e tests/adversarial 0; tsc 0.
- OPEN P2: ReviewDialog (src/client/components/ReviewDialog.tsx, `approved` computation with initial==='handoff') flips the open handoff dialog back to the "Review restriction" step (Approve button present) right after a correct native receipt, because native_application_observed is not in RECEIPT_ACCEPTING_STATES. Server still guards (no second action), but the UI invites a re-approve. Recorded as a Playwright `finding` annotation (heading text after receipt), not asserted. Fix: when initial==='handoff' keep Handoff for any non-rejected/non-stale action state.
- FINAL LOCAL VERDICT: LOCAL_READY with one open P2 (above). Native gates pending; no native evidence.

## Final acceptance pass (after be24e1b)
- Previous open P2 (handoff dialog flips to Review/Approve after a correct receipt) CLOSED: spec now asserts the "Native handoff" heading and no "Approve exact scope"/"Reject" buttons after a correct receipt.
- Fixed a race in my own recovery spec (polled on version, which bumps at verification_pending; now polls for a terminal recovery state). Verified stable over 3 consecutive e2e runs.
- Final: npm run build 0; npm run test:e2e 0 (37 passed, 4 runs after the fix incl. this one); eslint tests/e2e tests/adversarial 0. Screenshots (21) regenerated. No open findings. Native gates pending; no native evidence.
