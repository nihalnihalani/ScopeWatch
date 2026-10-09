Model: claude-sonnet-5-5

# Backend / analytics engineer report

Slice complete: journal, core evidence logic, ClickHouse publisher/evaluator, services, HTTP, tools, replay seeds, tests.
Nothing here is native evidence: ClickHouse receipts are from the LOCAL docker server (clickhouse_local 25.8.33.6); replay data is synthetic; contract_test uses a FAKE GuildPort defined inside tests.

## Files (all new)
- src/core: time, hash, manifest, canonicalize, admission, oracle, selection, grounding, actions
- src/storage/journal.ts
- src/integrations/clickhouse: schema, client, admin (provisioning), queries, publisher, evaluator
- src/server/services: context, bootstrap, envfile, errors, seed, cases, pipeline, investigation, actions, export, scenario
- src/server/http/app.ts, src/server/main.ts
- tools/ch-setup.ts, tools/replay.ts, tools/run-scenario.ts
- data/replay/harbordesk-v1.json, data/replay/late-arrival-v1.json (declared synthetic seeds with expected answers)
- tests/unit/core (fixtures.ts + 4 files), tests/integration/backend (support.ts + 3 files), tests/clickhouse (helpers.ts + 3 files)

## Commands run (final state)
| Command | Exit | Result |
|---|---|---|
| npx tsc -p tsconfig.json --noEmit | 0 | clean (whole repo incl. other teammates' files at that moment) |
| npx tsc -p tsconfig.server.json --noEmit | 0 | clean |
| npx eslint . | 0 | clean |
| npx vitest run --project unit | 0 | 8 files, 86 tests passed |
| npx vitest run --project integration | 0 | 4 files, 66 tests passed (mine: journal 8, http-actions 24, pipeline-export 9 = 41; the other 25 are another teammate's file) |
| npm run test:ch | 0 | 3 files, 34 tests passed against real ClickHouse (publish-readback 11, sql-oracle 16, pipeline 7) |
| npm run ch:up / npm run ch:setup | 0 / 0 | DBs scopewatch, scopewatch_replay, scopewatch_contract + least-privilege users; wrote runtime/clickhouse-local.env (gitignored, mode 0600) |
| npm run replay | 0 | evaluated, readback ok, 57 anchors, 64 queries, oracle agrees |

Mutation checks (to prove the SQL-vs-oracle tests are not vacuous): changing `>` to `>=` on the window lower bound in the anchor SQL made the boundary test and the 25-fixture randomized test fail; reverted. (First draft of the randomized test used a weak LCG and did NOT catch it; replaced by mulberry32.)

## Real ClickHouse receipts (local docker, not Cloud)
- SELECT version(): 25.8.33.6 (image pinned by digest in docker/clickhouse/compose.yaml)
- harbordesk-v1 replay (npm run replay): generation gen-mv0z090p-b7b945, raw=77 rows, canonical=76, manifest sha256 63514a84ad2a99d83cfcd592a5c7da4f391a5f013000a528c8d41d913c760e59
  readback components all true; 57 distinct anchors + cutoff evaluated = 64 queries (conflict 2, anchor list 1, all-candidate 57, current 1, witness 3)
  TicketAssist: allowance 20, first crossing 2026-10-09T12:05:00Z count 21 (5 sessions), peak 30, current 30; ReleaseReview peak 40/60; LabelSweeper explicit zero
  sample query ids: first-crossing witness sw-247eb778-09dd-4f57-a464-8d90e67afe60; current sw-7d9405a9-5e43-42dd-8c9e-dbac7332dd95
- late-arrival-v1: first crossing 12:04:00 count 30 (10-event tie group takes 20 to 30), current count at cutoff 0, 30-identity witness
- serverMs comes from the x-clickhouse-summary elapsed_ns response header (wait_end_of_query=1); the test suite also confirms issued query ids appear exactly once in system.query_log after SYSTEM FLUSH LOGS (admin lane).
- Privilege lanes tested: evaluator INSERT rejected; collector DROP/ALTER DELETE/CREATE rejected.

## Behavior notes the lead / other teammates must know
1. Provenance/eligibility: replay cases -> POST review is 409 not_eligible (nothing recorded). contract_test cases ARE reviewable (needed to exercise the action UI) but every positive verdict is simulated_* via restrictionVerdict/recoveryVerdict; restriction_verified/recovered only for provenance 'native'. isNativeActionEligible() is used for verdict naming; the review gate uses `provenance === 'replay'`. Tell me if you want contract_test blocked from review too.
2. Not-ready generations (coverage gap, unresolved binding, conflict, unverified identity domain, unreconciled launch intent) are SEALED, readiness stored, NOT published, NO case. They are visible only via an extra route GET /api/generations (generation + readiness + evaluation errors). CaseDetail.evaluation is non-null so there is no "incomplete case" object. Requested contract change: allow a case/summary in evidence_incomplete with `evaluation: EvaluationReceipt | null`, or have the UI read /api/generations.
3. Extra routes beyond api.ts: GET /api/generations, GET /api/cases/:id/queries. Add to Routes if the client wants them.
4. Host header allowlist is enforced on every request (DNS-rebinding), Origin on every POST. A Vite dev proxy with changeOrigin will present a different Host/Origin: add that origin via SCOPEWATCH_ALLOWED_ORIGINS.
5. Empty JSON body on POST is treated as {}; unknown fields are rejected (ajv removeAdditional=false) with 422 invalid.
6. Receipt rules: accepted from approved, native_application_pending/unknown, scope_mismatch, and stale (RECEIPT_ACCEPTING_STATES + stale). Stale case revision or appliedAt earlier than approval => disputed_stale_application (receipt preserved, verify refused). Selector mismatch => scope_mismatch. Verify refused unless receipt matches approved scope.
7. verify: moves to verification_pending (CAS) BEFORE the external probes; one ExternalIntent per probe recorded before the call; thrown/timed-out probe => intent unknown + probe 'missing' => verdict unknown. Probe whose startedAt is not strictly after the receipt recordedAt is discarded as missing. ProbeOutcome 'allowed' (new contract value) is treated as target success => restriction_failed, and as target success for recovery.
8. Late integrity conflicts (identity/binding/allowance conflict gaps in a later generation) call markEffectActionsDisputed for actions of the same manifest hash: effect-possible states become `disputed`, receipts kept, no auto-release.
9. Readiness adds an extra gap for unresolved ExternalIntents recorded under the scenario id (ambiguous launches keep the cohort incomplete).
10. Case id = hash(provenance, manifest sha, primary key); a re-run for the same evidence appends a new revision (older pre-effect approvals become stale).

## Known gaps / not done
- A verification interrupted after verification_pending (process crash between the CAS and the final transition) leaves the action in verification_pending; verify refuses it (409). Needs a reconcile-on-start sweep (record only, not built).
- Investigation reconcile path uses GuildPort.reconcileLaunch(ref) only; nothing reads back an incident issue.
- Static client serving + SPA fallback is implemented but untested (no dist/client exists yet).
- Native mode end to end (GuildPort real adapter) is untested here: no credentials. src/server/services/bootstrap.ts statically imports createGuildPort from ../integrations/guild/index.js (present now).
- Cloud ClickHouse path (clickhouse_cloud target, TLS) is untested; config switch exists only via loopback detection in config.ts.
- No pagination/size cap on case detail sessions beyond 50 identity keys per session.
- Interrupted verify probes are not auto-reconciled (intents stay unknown and are shown to the operator via timeline only through verification verdict).
- operator login has an in-memory failed-attempt limiter only (not per IP).

## Requested shared changes (lead)
- package.json: add script `"scenario": "tsx tools/run-scenario.ts"` (uses env; args: target sessions, control sessions).
- eslint no-restricted-imports for tests/support/mock-guild from src/** (lead-owned config).
- contracts: optional `evaluation: EvaluationReceipt | null` / incomplete-case object (note 2); Routes entries for the two extra GETs.
- config.ts: for non-native modes a missing CLICKHOUSE_* lane credential silently yields clickhouse=null (reported as "unconfigured"); consider reporting which variables are missing in doctor.

## Test intent index
- unit/core: strict time, exact ns, manifest hash-by-bytes, selection order; canonicalization (redelivery, new-ID retry, same-ID decision/session/time/credential/operation change, NULL to value, delivery-only ignored, NULL key gap, order independence); admission (missing session/page/binding/allowance, duplicate and changed mappings, unverified domain, conflicts vs missing, required fields, clock mismatch, epoch, unregistered sessions); oracle (exactly-600s excluded, 1ns inside included, strict >, effective start, 20 to 30 tie, late breach current 0, zero candidate, nested actor, conflict removal, incomplete coverage, 150 brute-force randomized sets); action verdict matrix, CAS, illegal transitions; grounding.
- integration/backend: journal CAS, stale case revision, per-mode provenance guard, forward-only generation states, sealed immutability, intents; HTTP 401/403 csrf/403 origin+host/422 unknown fields/replay 409; review, receipt (match, mismatch, stale, out-of-band), verify (success, target allowed, timeout, stale probe, no Guild 503), recovery (separate predicate, stale drafted revision), investigation grounding; pipeline with FakeGuildPort (failed collection, unresolved bindings, unverified domain, ambiguous launch, no ClickHouse 503); export has no secrets and states non-native.
- clickhouse: see above (publish/readback tamper cases; SQL equals oracle on boundary/tie/effective/late/nested/coverage/multi-candidate + 25 randomized; conflict blocks; seeds equal their declared answers).


## Follow-up round (lead requests 1-3)
- GET /api/generations now returns exactly GenerationSummary[] { generation, readiness, caseId } (evaluation errors remain in the journal only).
- Interrupted verification: verify from verification_pending reconciles the recorded probe intents via GuildPort.reconcileLaunch, resolves them reconciled/unknown, never relaunches, and lands in verification_unknown (recovery_unknown for recovery) with the reason in history; an in-process in-flight set prevents racing a live verify. Startup sweep (bootstrap) marks pending verifications unknown without network calls. A later explicit verify launches fresh probes.
- Late integrity conflict: Journal.disputeCases appends a NEW evidence_disputed revision to every case on the manifest (old revision preserved, uncertainty prefixed DISPUTED), un-applied approvals become stale, applied effects keep receipts and go to `disputed`; no recovery is created.
- Static client: npm run build exit 0; inject tests confirm /, /cases/x, /some/route serve index.html (text/html); /api/unknown is JSON 401 unauthenticated and JSON 404 {code:not_found} authenticated.
- New file tests/integration/backend/robustness.test.ts (6 tests).
- Exits: tsc 0 (both configs), eslint 0, unit+client+integration 0 (14 files, 178 tests), test:ch 0 (34), replay 0 (57 anchors, 64 queries, oracle agrees).
