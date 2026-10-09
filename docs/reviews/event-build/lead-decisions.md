# Decisions (lead)

- D1 2026-10-09T12:20Z Stack: Fastify 5.12.5 (patched; 5.6.1 had advisories) + React 19 + Vite 8 + node:sqlite + @clickhouse/client 1.24.0 + vitest 5 + Playwright 1.64. Alternative: express/node:http. Reason: small, typed, cookie plugin. Source: npm audit.
- D2 Three provenance modes native/replay/contract_test, fixed at startup; native refuses loopback Guild URL; contract_test requires loopback. Reason: exercise adapter/action paths without native access while preventing masquerade.
- D3 Local ClickHouse 25.8 in docker on 127.0.0.1:18123 provides REAL executed SQL receipts labeled clickhouse_local; not Cloud, not native evidence.
- D4 Native policy application is operator-recorded (guild_ui / guild_cli_verified); no policy mutation endpoint exists in the app.
- D5 Guild CLI token expired at preflight → native gates pending human `guild auth login` + keys.
- D6 Devil plan review (.scopewatch-run/teammates/devil/plan-review.md) resolutions:
  P0-1 native Guild URL must be https://api.guild.ai (config.isAllowedNativeGuildUrl) — ACCEPTED.
  P0-2 per-mode journal file (runtime/scopewatch-<mode>.sqlite), provenance column on every row, eligibility via
       isNativeActionEligible(row.provenance), simulated_* verdict/state names for non-native, mock-guild unimportable from src — ACCEPTED.
  P1-1 contract_test kept (needed to exercise action UI in browser) BUT: banner every view, export marks non-evidence,
       investigation narrative labeled "mock incident, not model output", not used for demo claims — PARTIALLY ACCEPTED.
  P1-2..P1-7 ACCEPTED (receipt rechecks revision+scope → scope_mismatch/disputed_stale_application; probes new sessions
       after receipt time; ExternalIntent rows + reconcile; readback checks multiplicity, retry uses fresh generation;
       SEMANTIC_FIELDS closed list + identity domain gate; cohort from launch registry/seed declaration).
  P2-1..P2-5 ACCEPTED (scopeDigestInput canonical order; full recovery routes; strict >, BigInt; oracle independent code
       path from SQL; UI contract doc first; CH image pinned by digest).
- D7 Integration port src/shared/ports.ts (GuildPort) is the only backend↔native coupling.
- D9 2026-10-09T12:46:18Z Human instruction: commit often — checkpoint commit after each verified lane/milestone (path-scoped git add).
