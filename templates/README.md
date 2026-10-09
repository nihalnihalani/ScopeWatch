# Blank build/evidence templates

These are ScopeWatch-designed record examples, **not Guild payloads, runtime results or operator approval**. JSON defaults deliberately keep identifiers/counts/evidence null and action flags false. The only numeric examples are separately marked illustrative fixture parameters.

- [Operator manifest](operator-manifest.template.json): fill verified subjects/credential/operation, identity domain, finite cohort, effective start and pinned approval before the main case.
- [Manifest provenance](manifest-provenance.template.json): record the final manifest's byte SHA-256 and containing immutable commit/path externally. Finalize and commit the manifest before pinning it; do not put its own hash or containing commit into the hashed bytes.
- [Case evidence](case-evidence.template.json): capture exact generation, mappings/coverage, publication readback, historical/current counts, real queries and investigation.
- [Action receipt](action-receipt.template.json): bind approval to revision/scope; record real native application and both fresh effects. Null selectors are not an enabled unrestricted rule.
- [Benchmark samples](benchmark-results.template.csv): actual samples only. Separate anchor query, full historical procedure and client/server clocks; compute percentiles from retained sample cohorts.
- [Finding provenance](finding-provenance.template.md): actual same-codebase discovery, consequence, correction and rescan.
- [Submission](submission.template.md): actual links/results/tools and up to four real names/emails.

See [evidence requirements](../docs/demo/EVIDENCE_CHECKLIST.md). Copy/complete records into appropriate private or reviewed sanitized event storage, preserving original source references. These templates do not implement an application schema validator.
