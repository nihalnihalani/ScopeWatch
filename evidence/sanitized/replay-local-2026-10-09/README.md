# Replay evidence bundle — local ClickHouse, synthetic seeds (2026-10-09)

**Source class: REPLAY (synthetic fixture). NOT native evidence.** No Guild account, session, policy decision,
hosted investigation or native probe is represented. ClickHouse target is a **local** server
(`clickhouse/clickhouse-server:25.8`, pinned digest in `docker/clickhouse/compose.yaml`, `version()` = 25.8.33.6),
not ClickHouse Cloud. Timings inside are local and are not latency claims.

Produced by the real application (`dist/server`, mode `replay`) through its HTTP API on 2026-10-09 ~13:32 UTC:
`POST /api/replay/run` for each seed → `GET /api/cases` → `GET /api/export/:caseId` → `GET /api/status`.
A replay approve attempt (`POST /api/cases/:id/review`) returned **409 not_eligible**.
Secret scan of these files for the operator secret and local ClickHouse passwords: none found.

| File | What it shows |
|---|---|
| `pipeline-harbordesk-v1.json` | generation evaluated, 0 readiness gaps, 1 breach |
| `export-case-3a18d334a005.json` | harbordesk-v1: readback ok on rawIds/semantics/bindings/coverage/manifest; 57 anchors, 64 executed queries, independent oracle agrees. TicketAssist first crossing 21/20 at 12:05:00Z (peak 30, current 30); ReleaseReview 40/60 within its own allowance; LabelSweeper explicit zero. Action blocked: replay not eligible |
| `pipeline-late-arrival-v1.json`, `export-case-b4e47d07f66a.json` | late-arrival-v1: a 10-event tie takes TicketAssist from 20 to 30 at 12:04:00Z; **current count at cutoff is 0** and the historical crossing witness is retained (21 anchors, 27 queries, oracle agrees) |
| `cases.json`, `status.json` | case summaries and dependency status (replay mode has no Guild access by design) |

Each query receipt carries its `query_id`, SQL sha256/version, typed parameters, row count, output sha256, client ms
and server ms (from `system.query_log` when readable). Seeds: `data/replay/*.json` with declared expected answers,
asserted in `tests/clickhouse/pipeline.test.ts`.
