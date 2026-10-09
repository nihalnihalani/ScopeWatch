> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Cyberdefense: adversarial ideation, round 3

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

9 October 2026. Final narrowed recommendation: **BoundaryProof**, with an authentic cache-boundary finding if discovered, otherwise the strongest authentic Semgrep finding or a clearly disclosed two-sponsor runtime-defense fallback. Akash excluded. This is an implementation brief for work begun during the event, not prebuilt application code.

## The concrete five-hour product

**Input:** An immutable snapshot of normally AI-generated application code; authenticated owned test principals A and B; live request/response evidence; a larger labelled synthetic telemetry workload.

**Output:** A report containing original generation provenance, actual Semgrep findings, source locations, a local reproduction, a ClickHouse blast-radius query with measured timing, a real Guild investigation session, a narrowly approved patch, and fresh before/after test receipts that retain authorized behavior.

**One screen:** A horizontal evidence chain with five states: `Found -> Reproduced -> Scoped -> Proposed -> Verified`. The before and after response panels are the hero. A secondary analytics panel shows actual row count, query time and synthetic/live source labels. A real Guild session link is visible. Avoid an alert dashboard, chat transcript wall or an invented “security score.”

## Minimal cache-finding contract

Only use this contract if a normal AI-generation attempt produces the hazardous control flow without asking for that hazard.

- Original code implements a tenant-scoped document/incident endpoint and a cache.
- Tenant B's authenticated request warms the cache for B's document.
- Tenant A's authenticated request for B's document returns B's synthetic canary because a cache hit precedes authorization.
- Actual Semgrep output identifies the relevant unsafe code. If the rule is local and custom, say so; preserve the diagnostic sequence and ask the mentor whether this meets the finding award.
- The approved patch evaluates authorization before serving cached material and uses a cache key appropriate to the demonstrated authorization domain. An explicit per-tenant model is sufficient for the minimum fixture.
- A fresh verifier proves B still receives B's document, A receives A's document, A cannot read B's warmed document, and B cannot read A's warmed document. If IDs or ACLs are globally scoped, verify denial behavior exactly as specified.
- The output states “verified for these cases,” not “all cross-tenant leaks solved.”

Do not imply that tenant-prefixing alone fixes per-user ACL or redaction differences. Either keep those out of the target model or add a specific test and matching policy context.

## What each sponsor does

| Sponsor | Required working behavior | Ten-second evidence | What not to claim |
|---|---|---|---|
| Semgrep | Run on original AI-produced source, report the actual unsafe code, rerun after the patch. | Rule origin/ID, file/line, original source hash and finding. | That a custom post-diagnosis rule first discovered the bug, or that Guardian runs an arbitrary local rule. |
| ClickHouse | Ingest the live owned proof events alongside labelled synthetic workload; query mismatched request/resource ownership; return candidate exposures or investigation scope. | Verified count, real query time, result containing the injected live event; query changed the investigator's scope. | That one million synthetic events were production traffic or that async analytics blocked a response already sent. |
| Guild | Host/run an investigator that consumes the real evidence and performs a bounded useful tool action; optionally a separately invoked operator creates a real issue after app approval. | Actual session URL plus tool event and returned artifact. | That local backend code is hosted in Guild, or app approval is Guild policy enforcement. |
| Pi | Present the innovation: a bypass around an apparently correct check and durable behavioral proof of closure. | The unsafe cache hit versus the fixed authorized/unauthorized replay. | Any Pi integration, since no access is offered, or a world-first vulnerability. |

One hosted investigator plus a real useful action is preferable to two broken agents. Use a second operator only if the first slice is already working. Explicitly restrict connected credential policies; the parent's research reports allow-all defaults before they are overwritten. Use the dedicated Basic-auth trigger key for API triggers, or the documented chat-session path with accurate labels.

## Analytics that earns its place

The data generator creates representative benign event diversity: tenants, principals, objects, caches, status codes and timestamps. It is seeded and labelled synthetic. The owned target app produces separate live evidence records with trusted actor and resource metadata. An observer can derive the served object/tenant from the controlled fixture's returned ID/canary; do not trust a client-provided tenant claim as provenance.

The query can compute mismatched-tenant responses, impacted principals/resources and the time window for a specific finding. It should return the true injected live event among the synthetic workload and feed those rows to the investigator. A small labelled synthetic anomaly population may demonstrate throughput, but its counts are not victims or discovered bugs.

Use a simple append-only `MergeTree` path and a parameterized aggregate query first. A materialized view is optional only if current measurements justify it. Report SQL execution timing separately from insert-to-detection and event-to-action latency. If ingestion or query timing exceeds the design, expose the actual value and reduce the workload; never display a prewritten sub-100ms claim.

The selected performance target of roughly one million synthetic rows is a demonstrator design choice, not an event requirement. If the event account/network makes it slow, smaller verified volume with a working live update is more defensible than a fake million-row badge.

## Trusted closure proof

The patch-generating agent has no arbitrary shell or write tool over the verifier. It can propose a diff restricted to the target app file; the backend rejects changes outside allowlisted paths, symlinks or attempts to alter test fixtures/expected results. The authoritative verifier runs in a separate process from a copy outside writable patch paths. Its fixture data, expected authorization outcomes and request sequence are fixed for the run.

Persist each receipt with original target hash, patched target hash, verifier/fixture hashes, real status codes, actual returned object IDs/canaries and timestamps. Run pre-fix and post-fix from fresh cache/process state with the same warm sequence. A stale cached scan result cannot stand in for a fresh run. A scan error is “unverified,” not “clean.”

The independent verifier is a practical boundary for this demo, not a formal proof against adversarial programs. Preserve that distinction. Four behavior checks are valuable because they can reject the trivial “always deny” patch. Add one alternate cache-warming order if there is time; do not spend an hour building a general verification platform.

## Budget and gates

These are operational allocations, not promised execution times. Set relative to the actual organizer-confirmed build start; the user lists portal opening at 11:30 AM PT and agenda kickoff at 11:00 AM PT. Treat **11:30 AM-4:30 PM PT** as the conservative window.

| Window | Required outcome | Stop condition |
|---|---|---|
| First 30-40 min | Original AI code saved; reproducible flaw; actual Semgrep path; sponsor eligibility/stacking checked. Parallel account/hello-world setup only. | No authentic interesting finding: stop cache-specific hunting and choose another observed flaw or two-sponsor fallback. |
| Next 60-75 min | Pre-fix replay, minimal patch and benign/unauthorized checks; real ClickHouse insert/query; Guild hello-world and one useful session. | Guild auth/registry still blocked: reserve one mentor attempt, then cut Guild from the critical path. |
| Middle 75-90 min | UI evidence chain, telemetry scale run, query feeds investigator, final patch/closure receipt. | Pipeline still incomplete: remove operator agent, automated patching and optional recurrence memory. |
| Last 75 min | Rehearse, record, upload, finalize accessible repository and submission text. | No new features. Use the demonstrated path and disclose cached footage where applicable. |

At four builders, parallelize target/proof, analytics, hosted investigator/backend, and UI/submission. At one builder, do not promise all three monetary tracks; prioritize the authentic finding plus the most reliable companion sponsor. Pi innovation requires no integration work.

## Rescue plan, in order

1. **No cache bug but another authentic Semgrep finding:** Keep BoundaryProof, replace the story with the actual vulnerability; preserve original output and local proof. Do not force a cache metaphor.
2. **Custom cache rule is ineligible for Semgrep's finding award:** Use a registry/Guardian finding that has a real repro if available. Otherwise focus on ClickHouse and Guild; show Semgrep as tooling without claiming that prize.
3. **No authentic finding before the gate:** Build the scoped agent/runtime event investigation and proof-verification demo with an explicitly seeded benchmark. Position it for ClickHouse/Guild and possibly Pi. A seeded defensive demo can be good work; it does not become an authentic AI-code discovery by changing the caption.
4. **Guild integration still broken:** Keep local triage and the proof/analytics product, remove Guild prize claims. No fake session IDs or success falls back.
5. **ClickHouse service/network fails:** Try the documented/local working route once with mentor help; if still unavailable, keep the finding and hosted investigation project. No SQLite path branded as ClickHouse.
6. **Patch generation is too slow or unstable:** Show the generated patch proposal as a proposal, apply a clearly labelled human-reviewed patch, and retain the live verifier. The finding award does not require pretending autonomous remediation.
7. **Live demo has external-service latency:** Use the real recorded run with a visible “recorded run” label and retain inspectable receipts/session links. Keep the local repro/verifier live if stable.

## Ninety-second core demo, expandable to the actual event limit

- **0:00-0:12:** “The SQL had the tenant filter. The cache skipped it.” Show original AI output and one tenant's canary appearing in the other tenant's response.
- **0:12-0:30:** Actual Semgrep finding -> source line -> dangerous cache early return. State registry versus local custom rule.
- **0:30-0:48:** Live event enters ClickHouse among labelled synthetic traffic; one measured query identifies exposed objects and the affected request principals.
- **0:48-1:04:** Real Guild investigator session uses that evidence and returns the bounded cause/proposed action. If ready, show the actual issue artifact or approved operator action.
- **1:04-1:25:** Patch diff; fresh replay rejects unauthorized access and preserves the correct authorized response; receipt hashes visible.
- **1:25-1:30:** “Found in AI-generated code. Scoped with real analytics. Closed with behavior proof.”

For a longer allowed slot, extend the live code explanation and verifier evidence. Do not add a sponsor tour or another vulnerability mechanism. The supplied event text does not specify a demo-video duration, so the exact submission limit must be checked rather than inherited from historical hackathons.

## Final adversarial verdict

BoundaryProof is the strongest **conditional** money-oriented choice because one credible finding can satisfy Semgrep, a measured query can satisfy ClickHouse, a useful hosted investigator can satisfy Guild, and the bypass/behavior-proof story can appeal to Pi. Its upside depends on an authentic finding and actual sponsor use. The decisive execution choice is to **discover first, then build around what is real**, with a strict cutoff and an honest two-sponsor rescue path.

No predicted dollar value or win probability can be responsibly supplied from the available evidence. The team can optimize eligible, inspectable prize shots and protect submission quality; it cannot optimize a made-up probability table.
