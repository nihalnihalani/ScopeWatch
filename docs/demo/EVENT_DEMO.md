# ScopeWatch local demo recording (what exists today)

This is the **actual** recording produced by `tools/demo-record.ts` for the current build. It supersedes nothing in [DEMO_SCRIPT.md](DEMO_SCRIPT.md), which remains the plan for the final native cut. **This video contains no native evidence.** Native status is **NATIVE_PENDING** ([BUILD_STATUS](../BUILD_STATUS.md), [native ledger](../native/NATIVE_PROOF_LEDGER.md)).

> **Caption correction (2026-10-09):** the original recording's 0:10–0:17 caption mislabeled LabelSweeper as the control. Because local ClickHouse was unavailable for a re-record, the lead patched that segment (10.3–17.7 s) and `frame-02` by overlaying a corrected caption rendered from the same values (ffmpeg `overlay`; app pixels unchanged). `tools/demo-record.ts` is fixed for future recordings. The `.webm` original was removed; only the patched `.mp4` is kept.

- Files: `evidence/demo/scopewatch-local-demo.mp4` (H.264, 1440x900, 2:21, caption-patched), plus `evidence/demo/frame-01..11-*.png`.
- Every scene carries a caption banner injected with `page.evaluate` (no application code changed). Banner colors: blue = replay (synthetic), orange = contract_test (loopback mock Guild), grey = closing note.
- Data: replay = synthetic HarborDesk fixture, real local ClickHouse 25.8 in Docker. contract_test = real Guild adapter against the loopback **mock** (`tests/support/mock-guild`), built from the documented schema, not observed account behavior. Maya/HarborDesk/TicketAssist/ReleaseReview are fictional.
- Counts in captions are read from the running app's API at record time, not typed in.

## Scene script (times approximate, +/- 2 s)

| Time | Scene | Shows | Proves | Does NOT prove |
|---|---|---|---|---|
| 0:00 | Replay, signed in, empty | Provenance strip says replay; "No cases yet" | The UI labels provenance before any result | Anything about native data |
| 0:05 | Run replay pipeline | Click "Run replay pipeline" | Journal, seal, ClickHouse publish, readback, anchor SQL, oracle run end to end locally | Cloud ClickHouse, scale, latency |
| 0:10 | Subject versus control | TicketAssist (query-selected) peak 30 vs allowance 20; control panel ReleaseReview peak 40 vs allowance 60; LabelSweeper is a separate zero-event candidate (values from `/api/cases`) | Each workload is measured against its own allowance; the busier one is not selected | That a native ALLOW stream looks like this |
| 0:17 | Anchor vs current | Peak at historical anchor and current-cutoff count shown separately | The two evaluations are distinct fields | Late-arrival aging (that is a separate fixture, `late-arrival-v1`, not in this video) |
| 0:25 | Timeline + session inspector | Contributing session, binding method, source class | Bounded per-session evidence with binding method | Native task-graph binding |
| 0:34 | Executed-query receipts | 64 receipts, query ID, SQL sha256, server version, "replay measurement on a synthetic fixture" | Receipts come from SQL actually executed against local ClickHouse | A performance claim; timings are labeled replay measurements |
| 0:45 | Independent oracle | "Independent oracle agrees" | SQL result equals a separate recomputation | Application correctness beyond that check |
| 0:50 | Review blocked | Disabled "Review restriction" with reason; API returns 409 `not_eligible` | Replay can never become an approved action | - |
| 0:57 | Sanitized export | Download, "What this bundle does not prove" | Export is sanitized and states its limits | - |
| 1:07 | contract_test: collect and evaluate | Mock cohort collected, case built (Mock target peak 15 vs allowance 4) | Adapter, binding, ClickHouse evaluation code paths | Any real Guild behavior |
| 1:18 | Review dialog | SIMULATED labels, exact revision and scope | Approval binds exact case revision and scope | A real approval of a real policy |
| 1:25 | Native handoff + receipt | Operator types the exact scope as a receipt; "matches approved scope", still unverified | The app never applies policy; receipts are operator observations | That a human applied a real rule |
| 1:41 | Failure case | No DENY in the mock; verification fails with "Target not refused" | A restriction is not reported unless the target is refused | - |
| 1:53 | Simulated human step | Caption: "simulating the human Guild UI step - MOCK"; DENY applied through the mock's control endpoint, not the app | Clearly labeled simulation | Anything native |
| 1:58 | Re-verify | Fresh probes; `simulated_restriction_observed` (target `refused_policy`, control `succeeded_expected`) | Verification logic requires target refusal plus inspected control content | Native `restriction_verified` (never produced in this mode) |
| 2:10 | Closing | NATIVE_PENDING note | - | - |

## Not shown

Hosted Guild sessions, real security events, the hosted investigator and its incident, a real native DENY, recovery, Semgrep. None have occurred yet; see the ledger.

## Re-run

```
npm run build                  # client + server, once
npx tsx tools/demo-record.ts   # starts tools/demo-server.ts on :4617-4619 (runtime/demo), records, converts to mp4
```

Needs the local ClickHouse container (`runtime/clickhouse-local.env`), Playwright chromium and `ffmpeg` for the mp4. Override ports with `SCOPEWATCH_DEMO_PORT`. The recorder uses its own ports and `runtime/demo`, so it does not collide with `npm run test:e2e`.
