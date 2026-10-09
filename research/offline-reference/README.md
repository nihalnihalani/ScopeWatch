# Pre-event offline design reference

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../docs/event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

`verify_reference.py` is an inherited research oracle, not competition application source. `verification.json` records 19 checks including 1,000 randomized sweep-versus-brute-force comparisons. These cover intended small-fixture mathematics and selected literal mapping/conflict examples. They do not test executed SQL, live native identity graph traversal, actual API snapshots, controller authorization, policy selectors, UI or enforcement.

Run from any working directory with Python 3:

```bash
python3 research/offline-reference/verify_reference.py
```

The script prints its report to stdout and does not change the saved ledger. Redirect stdout to a separately named rerun record if desired. No sponsor network or credential access occurs. Preserve the research/event source distinction; do not simply present this inherited file as a during-event implementation.
