# ScopeWatch event build status

Branch `codex/scopewatch-event-build` (private repo `nihalnihalani/ScopeWatch`). Build authorized by
[BUILD_AUTHORIZATION.md](event/BUILD_AUTHORIZATION.md); first event-build source commit `d79cdb0` (2026-10-09 ~12:20 UTC).

## Status dimensions

| Dimension | Status | Basis |
|---|---|---|
| **LOCAL** | **LOCAL_READY** | All required independent code/UI/local checks pass on the committed tree (table below); independent acceptance and Opus devil re-review report no open P0/P1 |
| **NATIVE** | **NATIVE_PENDING** | No authenticated Guild account (`guild auth status`: not authenticated), no `GUILD_*` keys, no ClickHouse Cloud credentials. G1/G1b/G2 all pending — see [native proof ledger](native/NATIVE_PROOF_LEDGER.md) |
| VERIFIED_LIVE | **not claimed** | Requires actual native source/actor/credential/unit/coverage, executed SQL/readback on the native projection, real hosted incident, human native DENY and fresh target refusal + inspected control result |

Replay and contract-test results are never native proof. Every positive effect in this repository is `simulated_*`
from the loopback mock Guild API; every ClickHouse receipt is from a **local** ClickHouse 25.8.33.6 server in Docker.

## Final check receipts (committed tree)

Run by the lead on 2026-10-09 ~13:52 UTC at commit `d819e75` (+ this doc), after a clean `npm ci`:

| Command | Exit | Result |
|---|---|---|
| `npm ci` | 0 | lockfile install |
| `npm run typecheck` | 0 | TypeScript strict, whole repo |
| `npm run lint` | 0 | ESLint, 0 errors / 0 warnings |
| `npm test` (unit + client + integration + adversarial) | 0 | 17 files, **246 passed** |
| `npm run test:ch` (local ClickHouse 25.8.33.6) | 0 | 3 files, **34 passed** |
| `npm run build` | 0 | server (tsc) + client (vite) |
| `npm run test:e2e` (Playwright, real local server) | 0 | **37 passed** |
| `npm run doctor` (replay, local CH env) | 0 | local prerequisites present |
| `npm run doctor` (native) | 1 | correctly reports missing Guild/ClickHouse settings; native gates pending |
| `python3 tools/validate_handoff.py` | 0 | research handoff docs/links/imports intact |
| `npm audit --omit=dev` | 0 | 0 vulnerabilities |
| `npm run replay` | 0 | readback 5/5, 57 anchors, 64 queries, oracle agrees (see evidence bundle) |

Independent receipts: acceptance (Sonnet) 37 e2e / 120 integration; devil (Opus) re-review 205 unit+integration,
24 client, 34 ClickHouse — reports in [docs/reviews/event-build/](reviews/event-build/).


## After the core sign-off (2026-10-09 ~14:00–15:40 UTC)

| Item | Outcome | Evidence |
|---|---|---|
| Guild account calibration | Human ran `guild auth login`; build created a private fixture repo, three private agents (installed in `nihal.nihalani~home`) and an API trigger; one calibration session observed real event/task shapes. Adapter fixed for `security_event`, `parent_task`/`version` objects (+4 tests). | [native ledger](native/NATIVE_PROOF_LEDGER.md), [guild-agents/](../guild-agents/README.md), commit `c28492f` |
| Remaining native steps | **Skipped by human instruction** (GitHub App authorization, trigger key copy, collector key — all web-UI). Live loop not run. | DECISIONS D10 |
| Semgrep | 2 CLI scans (public rulesets, 68 files): **0 findings; no finding claimed** | [evidence/semgrep](../evidence/semgrep/README.md) |
| Replay benchmark | 20k-unit smoke only (SQL == oracle, 63 checks; 244/244 query ids reconciled); full scale **not run** | [bench-local-2026-10-09](../evidence/sanitized/bench-local-2026-10-09/README.md) |
| Demo | 2:21 local recording (replay + contract test, captioned non-native); one caption corrected by overlay | [EVENT_DEMO](demo/EVENT_DEMO.md), [evidence/demo](../evidence/demo/README.md) |
| Submission | Draft only; video upload, reviewer access, team names/emails and the submission itself are human steps | [SUBMISSION_DRAFT](demo/SUBMISSION_DRAFT.md) |
| Environment | During the full-scale benchmark the host disk filled; the Docker VM now returns I/O errors and the local ClickHouse container is unhealthy. Human chose not to restart Docker. **ClickHouse tests, `npm run replay` and e2e cannot be re-run until Docker is restarted**; their passing receipts above predate the incident. Local CH data may need `npm run ch:down && npm run ch:up && npm run ch:setup` afterwards. | — |

## Team and models (actual)

| Role | Requested | Self-reported running model | Notes |
|---|---|---|---|
| Lead / integrator | claude-opus-5-5 | claude-opus-5-5 | Claude Code 2.1.295; shared contracts, config, doctor, README, evidence, integration commits |
| Devil's advocate | `opus` alias | claude-opus-5-5 | Plan review (2 P0, 7 P1, 5 P2 → resolved, D6), integrated review (0 P0, 4 P1, 6 P2), targeted re-review (all P1 fixed) |
| Backend engineer | `sonnet` alias | claude-sonnet-5-5 | core, storage, ClickHouse, services, HTTP |
| Native engineer | `sonnet` alias | claude-sonnet-5-5 | Guild adapter, mock Guild API, native ledger |
| Interface engineer | `sonnet` alias | claude-sonnet-5-5 | operator case UI |
| Benchmark engineer | `sonnet` alias | claude-sonnet-5-5 | tools/bench.ts, small-scale bench evidence |
| Demo engineer | `sonnet` alias | claude-sonnet-5-5 | tools/demo-record.ts, demo docs, submission draft |
| Acceptance engineer | `sonnet` alias | claude-sonnet-5-5 | e2e, adversarial, screenshots |

The Agent tool accepts model aliases (`opus`/`sonnet`), not full IDs; running models are each agent's own report of its
system-prompt model ID. No model fallback/refusal was observed. Teammates were Agent-tool subagents coordinated through
a leader-owned ledger (`.scopewatch-run/`, ignored) and messages; `CLAUDE_CODE_ENABLE_TODO_TOOLS` was not set, so no
native shared Task tool was used. The session ran in bypass-permissions mode (reported at preflight).

Reports and reviews: [docs/reviews/event-build/](reviews/event-build/).

## What works locally (and how it was exercised)

- **Replay pipeline** (`SCOPEWATCH_MODE=replay`, UI button or `npm run replay`): seed → journal → seal → ClickHouse publish
  → exact readback (IDs, semantics, multiplicity, bindings, coverage, manifest) → every distinct anchor + cutoff in SQL for
  all candidates → independent oracle equality → case. Evidence: [replay bundle](../evidence/sanitized/replay-local-2026-10-09/README.md).
  harbordesk-v1: TicketAssist first crossing 21/20 at 12:05:00Z (peak 30), ReleaseReview 40/60 within its own allowance,
  LabelSweeper explicit zero; late-arrival-v1: historical crossing 30/20 at 12:04:00Z retained with current count 0.
- **Contract-test loop** (`SCOPEWATCH_MODE=contract_test`, e2e): real Guild adapter vs loopback mock → collect/bind →
  case → (mock) investigation labeled as mock text → UI review/approve exact scope → native receipt (mismatch →
  `scope_mismatch`; stale → `disputed_stale_application`) → simulated human DENY in the mock → fresh probes →
  `simulated_restriction_observed`; without the DENY → `restriction_failed`; recovery with observed removal selectors →
  wrong target content not recovered → `simulated_recovered`.
- **Security**: loopback bind, operator login, HttpOnly SameSite=Strict instance-scoped cookie, synchronizer CSRF, exact
  Host/Origin allowlist, strict body schemas (no browser-supplied subject/credential/SQL), sanitized export without secrets.
- **UI**: screenshots at 360/768/1440 and dark mode in [evidence/screenshots](../evidence/screenshots/), real local backend,
  no page overflow or console errors in e2e.

## Known limits and residual items

- Native mode is implemented against the **documented** Guild API; six documented-but-unobserved assumptions are listed in
  the ledger (security event `type`, ascending `sort_by=id`, task `agent.id`, `response_data` availability for small
  responses, reconciliation listing, trigger agent fields). Task nodes without `entity_type` stay unresolved.
- Policy application is a human Guild UI / verified CLI step; the app records operator receipts and never mutates policy.
  Local CAS cannot stop external admins.
- A transient `readback_failed` newer generation blocks the current case until a successful rerun (fails closed).
- No ClickHouse Cloud run, latency claim, Semgrep finding or planted-ticket influence claim. Optional lanes not attempted.
- Contrast was designed for ≥4.5:1 but not instrument-measured.
- Dev-tool transitive `braces` advisory (npm audit, dev only); `npm audit --omit=dev` reports 0.

## To reach VERIFIED_LIVE (human-owned steps)

1. `guild auth login`; create trigger key, collector account key (`workspaces:read`, `agents:read`), install target/control/investigator.
2. Run baseline probes, record verified subject IDs, shared `credentials_id`, operation, identity domain, agent-subject map in `.env`.
3. Apply/remove a trial DENY in the Guild UI; record receipts; restore baseline; pin the main manifest (SHA-256 + immutable ref).
4. `SCOPEWATCH_MODE=native` with Cloud (or local) ClickHouse: `npm run scenario`, `POST /api/pipeline/run`, investigate, review,
   apply the reviewed DENY in Guild UI, record receipt, verify. Save sanitized results under `evidence/sanitized/native-<run>/`.
