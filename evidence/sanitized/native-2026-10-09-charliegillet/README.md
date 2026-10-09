# Native run 2026-10-09: charliegillet~scopewatch (Guild + ClickHouse Cloud)

**Provenance: NATIVE.** Real Guild sessions in workspace `charliegillet~scopewatch`, real ClickHouse Cloud
(26.6, AWS us-east-2). Sanitized export from `GET /api/export/case-f9890e72144e`; no keys, passwords or fixture
marker values (scanned before commit).

| Step | Result |
|---|---|
| Cohort | `scenario-mv1keu43`: 5 TicketAssist + 8 ReleaseReview sessions launched with the API trigger, 0 unreconciled |
| Pipeline | generation `gen-mv1kixi5-ae08f2`: 13/13 sessions complete, 13 canonical keys, 0 conflicts, 0 readiness gaps; ClickHouse Cloud readback 5/5 components; 13 anchors, 20 queries; independent oracle agrees |
| Case | `case-f9890e72144e` (manifest sha256 `3619803b…`, pinned at `charliegillet/scopewatch-fixtures@3f517a3`): TicketAssist 5 vs allowance 3, first crossing 2026-10-09T22:57:51.416316Z (count 4); ReleaseReview 8 vs allowance 10, compliant |
| Approval | operator approved exact scope (DENY `issues_get`, GitHub credential `01a122b4…`, subject = TicketAssist definition id, workspace `scopewatch`) at 23:05:46.785Z |
| Native rule | applied by the human in the Guild web UI: rule `01a122fe-ccc1-02e7-0000-6841331a888e`, created 23:28:06.337908Z; selectors read back from Guild's policy record with the Guild CLI; receipt matches approved scope |
| Verification | `restriction_verified` at 23:28:49.613Z: fresh target session `01a122ff-57b0…` refused, DENY/POLICY_DENIED for the bound subject; fresh control session `01a122ff-57f3…` ALLOW and its tool result contained the server-held control marker |

Notes: an earlier DENY rule (`01a122e7…`, 23:02:38Z) was applied before approval; the human deleted it and
re-applied after approval so the receipt is not out-of-band. Recovery (G1b: remove the rule, both succeed) and the
investigator issue are not part of this export yet. Identity domain `session` is operator-declared.
