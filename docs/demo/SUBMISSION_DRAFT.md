# ScopeWatch submission (DRAFT - not submitted)

> Draft from `templates/submission.template.md`. Claims are limited to [BUILD_STATUS](../BUILD_STATUS.md). Items marked HUMAN or TBD are not done. Nothing here has been submitted.

## What we built

ScopeWatch answers one operator question: when several AI workloads share one integration credential, which workload should lose a matching capability while approved work continues? It counts native permission ALLOW decisions per acting subject in a 600 s window against each workload's own pinned allowance, selects the workload by a ClickHouse query over a finite captured cohort, keeps historical crossings visible after the current count falls, and drives a human-reviewed native policy handoff followed by fresh target/control verification. It never applies policy itself and never auto-releases.

Working today (local): ingestion journal, ClickHouse publish with exact readback, per-anchor SQL evaluation with an independent oracle, operator case UI, review/approval bound to case revision and scope, native-receipt recording, verification and recovery logic. Replay (synthetic) and contract-test (loopback mock Guild) paths run end to end; native mode is implemented against the documented Guild API but **has not run against a live account loop**.

## Repository and demo

- Repository: https://github.com/nihalnihalani/ScopeWatch (private; reviewer access is a HUMAN step)
- Demo video: upload pending (HUMAN). Local recording: `evidence/demo/scopewatch-local-demo.mp4`, script in [EVENT_DEMO.md](EVENT_DEMO.md). It shows replay (synthetic) and contract_test (mock) only.
- Working site: none.

## Tools and sponsor contributions

- ClickHouse: all counts, anchors and cutoff evaluations run as parameterized SQL against ClickHouse; the replay evidence bundle records 64 executed-query receipts and exact readback on a **local** ClickHouse 25.8 (Docker). No ClickHouse Cloud run, no scale claim; a 20k-unit replay smoke benchmark ([bench-local-2026-10-09](../../evidence/sanitized/bench-local-2026-10-09/README.md)) reports small-n local timings only.
- Guild.ai: adapter implemented against the documented API; private workload and investigator agents were created on the real account and calibration observations were recorded (CLI auth, workspace/trigger/agent identifiers, event type `security_event`, task shapes). The live loop (hosted sessions, real security events, hosted investigation, native DENY, fresh probes) is **NATIVE_PENDING**; the first calibration session failed before any permission decision (missing GitHub credential).
- Semgrep: two Semgrep CLI 1.180.0 scans of this build's own source with public rulesets returned **0 findings** ([evidence/semgrep](../../evidence/semgrep/README.md)); no finding is claimed and no defect was inserted. The sponsor's Guardian OAuth route was not run.
- Pi: no integration, no claim.
- Other tools: TypeScript, Fastify, SQLite journal, Playwright, Claude Code (AI-assisted development, multi-agent team; see BUILD_STATUS for roles and models).

## Proof and limits

- Actual controlled native evidence: none yet (NATIVE_PENDING). Only CLI/account calibration observations exist, recorded in the native ledger.
- Separately labeled replay and contract-test measurements: replay (harbordesk-v1: TicketAssist peak 30 vs allowance 20, ReleaseReview 40 vs 60, LabelSweeper 0; late-arrival-v1 historical crossing retained with current count 0) and contract_test results with `simulated_*` outcomes from the mock. Neither is native proof.
- Verified (2026-10-09, committed tree `d819e75`): typecheck, lint, 246 unit/integration tests, 34 local-ClickHouse tests, 37 Playwright e2e, build, audit (see BUILD_STATUS receipts).
- Unknown / not done: native security-event payload shape and subject-ID domain, `response_data` availability for control inspection, hosted investigator incident, native DENY and fresh refusal, recovery, Cloud ClickHouse, Semgrep finding.
- Provenance: research and documentation templates predate the build; application source starts at commit `d79cdb0` (2026-10-09 ~12:20 UTC) on branch `codex/scopewatch-event-build`; see `git log` for actual history.

## Team (HUMAN to fill, at most four)

- [Name] - [contact email]
- [Name] - [contact email]
- [Name] - [contact email]
- [Name] - [contact email]
