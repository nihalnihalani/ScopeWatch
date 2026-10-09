# Event evidence

> **Current execution policy:** [Start now or anytime, with no build cutoff](../docs/event/BUILD_AUTHORIZATION.md).

**Native evidence: none yet (NATIVE_PENDING).** Everything here is labeled by source class:

| Path | Source class | Notes |
|---|---|---|
| `sanitized/replay-local-2026-10-09/` | replay (synthetic seeds) + local ClickHouse 25.8 | Real executed SQL/readback/oracle receipts on synthetic data; see its README |
| `screenshots/replay-*.png` | replay | Real running UI against the real local backend |
| `screenshots/contract-test-*.png` | contract test | Real adapter against the **loopback mock Guild API** built from the documented schema; `simulated_*` outcomes; not account behavior |

Keep private/raw records outside tracked exports (`raw/`, `private/` are ignored). When native gates run
(`docs/native/NATIVE_PROOF_LEDGER.md`), add `sanitized/native-<run-id>/` with the pinned manifest, task/event mapping,
coverage, generation readback, query receipts, investigator receipt, native rule evidence and fresh target/control
results. Never replace raw native facts with synthetic "native" receipts. [Evidence checklist](../docs/demo/EVIDENCE_CHECKLIST.md).
