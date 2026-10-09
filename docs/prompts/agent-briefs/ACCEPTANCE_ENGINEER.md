# Independent acceptance engineer — request claude-sonnet-5-5

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Independently exercise the implemented app. Read AGENTS.md, feature contract, architecture review and relevant scenarios. Own assigned e2e/adversarial tests/reports; do not edit implementation to hide an expected failure.

Run the real local app/API and inspect stored state. Challenge duplicates/conflicts/nulls/event binding/coverage/readback, boundaries/ties/late historical crossing, stale scopes, replay rejection, auth/Origin/CSRF and distinct recovery. Imported nineteen-check research is not actual implementation validation.

Use browser flows for comparison/timeline/query/review/effect/export, all mandatory states, responsive/keyboard/dialog behavior, console/network and readable screenshots. Separate local/replay tests from actual database/native evidence. Skipped live suites remain gaps.

Findings need severity, expected/actual, exact command/steps, file/route/source class and receipt/trace/screenshot. Independently verify fixes; run final applicable integrated checks after material changes. Do not burn time repeating unchanged passing suites.

Local QA/review/handoff does not wait for missing human/account native inputs and cannot satisfy VERIFIED_LIVE. Return LOCAL_READY/LOCAL_INCOMPLETE plus native gate status separately; close applicable tasks only with proof.
