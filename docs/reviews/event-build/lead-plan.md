# ScopeWatch build plan / feature contract (lead, 2026-10-09)

Authorization: docs/event/BUILD_AUTHORIZATION.md (commit d8f282b) — build now, no cutoff.
Branch: codex/scopewatch-event-build. Lead: Opus 5.5 (claude-opus-5-5).

## Environment facts (observed 2026-10-09T12:12Z)
- Node v25.2.1 (node:sqlite available, experimental warning). npm, Docker 28.4 running, Playwright chromium cached.
- Guild CLI v0.17.0 installed; `guild auth status` → "Not authenticated (token expired)". No GUILD_* env configured.
- No ClickHouse Cloud credentials. Local ClickHouse server available via docker image clickhouse/clickhouse-server:25.8.
- => Native Guild gates are NATIVE_PENDING (human must `guild auth login`, provide trigger/account keys, workspace, installs).
- Local ClickHouse SQL is REAL executed SQL but against a local server with replay/contract-test data; it is NOT ClickHouse Cloud and NOT native evidence.

## Stack
Node/TypeScript (ESM, strict), Fastify 5 server bound to 127.0.0.1, React 19 + Vite client, node:sqlite journal,
@clickhouse/client against local docker ClickHouse (or Cloud when configured), vitest unit/integration, Playwright e2e.

## Provenance modes (server-enforced, visible in UI header)
- `native`: real Guild adapter + configured ClickHouse. Without config → explicit UNCONFIGURED state; never falls back to replay.
- `replay`: separately namespaced synthetic dataset (ClickHouse db `scopewatch_replay`, journal provenance `replay`).
   Full analytical pipeline (journal → seal → CH publish → readback → all-anchor SQL → oracle equality → case revision).
   Cases are NOT action-eligible; no hosted investigation; review shows scope preview with disabled approve + reason.
- `contract-test`: Guild adapter pointed at a loopback mock Guild API (tests/support/mock-guild) built from the DOCUMENTED
   schema (not observed account). Exercises the native adapter, binding, investigation, action/CAS, verify, recovery code
   paths end-to-end, labeled "CONTRACT TEST — mock Guild API, not native evidence" everywhere; export marks it non-evidence.
   Base URL must be loopback or the server refuses to start.

## Module ownership
- Lead: package.json/lock, tsconfig, vite/vitest/playwright config, src/shared/contracts.ts, src/server/config.ts,
  src/server/main.ts (bootstrap), tools/doctor.ts, docker/clickhouse, .scopewatch-run/*, README.
- Backend (Sonnet): src/core/**, src/storage/**, src/integrations/clickhouse/**, src/server/http/**, src/server/services/**,
  tools/replay.ts, tests/unit/core/**, tests/integration/backend/**.
- Native (Sonnet): src/integrations/guild/**, tests/support/mock-guild/**, tests/unit/guild/**, tests/integration/guild/**,
  docs/evidence-notes for native shapes.
- Interface (Sonnet): src/client/**, index.html, client assets, tests/unit/client/**.
- Acceptance (Sonnet, after builders): tests/e2e/**, tests/adversarial/**, QA reports, screenshots under evidence/screenshots.
- Devil (Opus): .scopewatch-run/teammates/devil/*.md only.

## Core invariants (enforced in code + tests)
1. Count distinct native ALLOW identities (native_identity_key) for verified subject/credential/operation. ALLOW ≠ read.
2. Per-event binding from task graph; root/requested label never a fallback; unresolved blocks readiness.
3. Canonicalize all versions of each identity in the frozen generation BEFORE any decision/actor/op/time filter;
   variant_count≠1 → conflict → generation not admissible; NULL identity → gap.
4. Coverage = registered finite cohort; missing/open/failed-page session → incomplete, never zero.
5. Window (T−600s, T] ∩ [effective_from, cutoff]; ns BigInt; full tie groups; all distinct anchors + cutoff;
   first crossing, peak witness, current count stored separately.
6. ClickHouse returns all-candidate counts per anchor (fixed parameterized SQL); app sweep is independent oracle; mismatch → error.
7. Journal (SQLite) is authority. Generation states collecting→sealed→inserted→readback_confirmed→evaluated.
   Readback compares ids + semantic json + bindings + manifest + coverage digest.
8. Manifest sha256 computed over exact bytes, stored in an external wrapper (journal), not inside the manifest.
9. Investigator: pinned context only, no admin keys; grounding check of numeric/ID claims vs journal facts.
10. Approval binds case revision + manifest hash + scope digest; CAS on expected revision; server-resolved scope only.
11. Native policy application = human (UI/verified CLI). App records operator-entered native receipt; no policy mutation endpoint.
12. Verification: fresh target probe must be DENY/POLICY_DENIED for bound subject; fresh control must return inspected expected
    marker (marker never sent to model). Matrix: target success → failed; both fail → continuity failed; missing → unknown.
13. Late conflict after effect → disputed; receipts preserved; no auto-release.
14. Recovery = separate reviewed action; requires removal receipt + BOTH target and control success.
15. Replay/contract-test cannot write native namespace or be action-eligible as native evidence.

## HTTP API (application routes, not Guild)
GET /api/session (mode, csrf, operator), POST /api/login (operator secret) ; GET /api/status (config/doctor, CH, Guild, freshness)
GET /api/cases ; GET /api/cases/:id ; GET /api/cases/:id/evidence ; GET /api/cases/:id/queries
POST /api/cases/:id/investigate ; POST /api/cases/:id/review {expectedRevision, decision: approve|reject, reason}
POST /api/actions/:id/native-receipt {expectedVersion, observed rule fields} ; POST /api/actions/:id/verify {expectedVersion}
POST /api/actions/:id/recovery (create recovery review) ; GET /api/export/:caseId (sanitized read-only bundle)
POST /api/replay/run (replay mode only) ; POST /api/pipeline/run (native/contract-test: collect→seal→publish→evaluate)
Mutations: session cookie (HttpOnly, SameSite=Strict) + X-CSRF-Token synchronizer + exact Host/Origin allowlist.

## Acceptance (must pass for LOCAL_READY)
- `npm run typecheck`, `npm run lint`, `npm test` (unit+integration), `npm run test:ch` (real local ClickHouse SQL),
  `npm run test:e2e` (Playwright vs real local server), `npm run build`, `npm run doctor`.
- Test families from BUILD_SCOPEWATCH §7 (normalization, canonicalization, coverage/publication, analytics semantics incl.
  SQL==oracle on boundary/tie/late fixtures, journal/actions, security, browser/product).
- Browser screenshots 360/768/1440 for replay and contract-test cases and key states.
- Devil integrated review: no open P0/P1.
