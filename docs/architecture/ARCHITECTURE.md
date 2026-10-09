# ScopeWatch architecture: evidence to selective restriction

9 October 2026. **Proposed hackathon architecture, not an implemented system.** Native account behavior, permissions, policy effect, findings and benchmark latency remain event tests. Akash is excluded. This document refines the [master plan](../spec/MASTER_SPEC.md); its historical-window and native-policy-action corrections take precedence over earlier sketches.

Open [the offline diagram viewer](architecture.html) to switch between seven diagrams, zoom and inspect the accompanying contracts. [System overview SVG](rendered/01-system.svg) · [PNG](rendered/01-system.png) · [editable Mermaid sources](diagrams/01-system.mmd). The individual diagram links below are part of one architecture; trying to put every contract in a single image would obscure the trust boundaries.

## 1. Outcome and fixed scope

ScopeWatch helps an operator decide which installed AI workload should lose one matching integration capability while preserving approved work. It measures unique native **permission ALLOW decisions**, not successful reads or stolen records. ClickHouse evaluates all qualified workload candidates against their own pinned allowances; a real Guild investigator reads context and creates a bounded incident; the human applies the reviewed native policy; fresh target/control operations verify the observed effect.

The controlled fixture uses fictional HarborDesk operator Maya, TicketAssist and ReleaseReview, an owned GitHub repository and synthetic support/release tickets. Illustrative allowances are 20 and 60 approvals in 600 seconds; desired observed counts are 30 and 40. These are planning parameters. Establish the actual counted unit before pinning and running the fixture. Both evaluated calls must resolve to the **same actual integration credential**, not merely the same provider or repository.

The product is an asynchronous circuit breaker with a contextual review workflow. It does not prevent the first excess approval, stop an active turn, undo prior calls, prove malicious intent or sandbox every remaining capability. A normal rate limiter can also aggregate across sessions. The contribution is inspectable evidence, workload-specific approval context and observed narrow restriction with surviving approved work.

## 2. Full system and trust boundaries

![ScopeWatch system architecture](rendered/01-system.png)

[Editable system diagram](diagrams/01-system.mmd). Solid lines represent the proposed live execution/evidence/action path. Dashed lines are optional enrichment, labeled replay or development/research dependencies. All boxes describe a proposal; none represents a tested integration.

| Boundary | Authority and crossing contract | Forbidden shortcut |
|---|---|---|
| Synthetic ticket → workload | Lower-trust task content may be read as data; actual influence requires a matched control and trace. | Ticket text cannot authorize expanded allowances or administrative operations. |
| Browser → controller | Authenticated operator references a stored case/revision; controller resolves the trusted scope. | Arbitrary browser-supplied actor/credential/SQL/command is not an approved target. |
| Guild → collector | Native IDs, decisions, evaluated credential and task evidence, with raw source preservation. | A display name, model claim or root label cannot substitute for actual acting-subject proof. |
| Collector → ClickHouse | Frozen, acknowledged generation with canonical rows, qualified coverage and pinned manifest projection. | Replay cannot mint native provenance; partial publication cannot earn a compliant zero. |
| Query → investigator | Compact immutable facts and pinned context; no administrative keys. | Model narrative cannot change count, target, manifest or proposed mutation. |
| Approval → native policy | Human applies the reviewed exact rule through actual Guild UI or separately verified CLI. | No undocumented credential-policy REST mutation endpoint or assumed API-key authority. |
| Policy → result claim | Fresh native refusal and inspected successful control result at recorded time. | API/CLI success, an operator checkbox or cached panel does not establish effect. |

Guild's policy, resolver and platform-held credential are native components. ScopeWatch's journal, normalization, coverage, manifest, SQL orchestration and action workflow are application design. ClickHouse is analytical evidence, not the transactional authority for human approval.

## 3. Minimal deployment and process responsibilities

[Deployment diagram](rendered/06-deployment.svg) · [Mermaid](diagrams/06-deployment.mmd).

Use one local Node/TypeScript backend and one React browser view. The backend runs bounded polling, snapshot publication, query orchestration and result verification in the same process. A local SQLite journal stores the transactional control state. ClickHouse Cloud stores/query-serves the analytical projection. Guild hosts the monitored workloads and investigator; GitHub provides owned synthetic fixtures and the incident artifact. There is no new queue, microservice, generic SOC console, OAuth broker or receipt server.

Node 24's built-in `node:sqlite` offers `DatabaseSync` and prepared statements; the bundled local runtime exposes it. That is a runtime-availability check, not a project implementation. Pin an actual supported event runtime; keep transactions short and never hold one over an external API call. If the event runtime differs, use an existing compatible SQLite adapter, rather than claiming every Node version supports this module. [Node 24 SQLite reference](https://nodejs.org/docs/latest-v24.x/api/sqlite.html).

The controller binds to `127.0.0.1`. Operator login/session data stays local; use a random server-held operator secret, HttpOnly/SameSite session cookie, exact Host/Origin allowlist and a synchronizer CSRF token on mutation POSTs. Render untrusted issue labels, reasons and model text as escaped text. Native session lookup and launch routing are server-side allowlisted. SameSite alone is not the complete CSRF defense. A public demo is a sanitized read-only export or recording with no administrative route. [OWASP CSRF guidance](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html).

### Secret and role placement

| Identity / secret | Location and minimum job | Limit |
|---|---|---|
| Guild API-trigger key | Controller secret configuration; launch only allowlisted subjects through server routes. | Documented effective access extends to workspace sessions and optional alternate `agent_id` routing; issuance for one trigger is not investigator-only isolation. |
| Guild collection/read authority | Controller only, actual permitted workspace/session/task reads. | Check required scopes, restricted-workspace visibility and nullable projections. Do not assume trigger and account keys are interchangeable. |
| Integration credential | Native Guild storage/resolver; never in frontend, model prompt or exported evidence. | Selection priority, grants/caller chain and SHARED/MEMBER mode can change which credential is evaluated. |
| Native policy authority | Operator's actual Guild UI / verified interactive CLI session. | General account API keys do not establish credential-policy edit authority. |
| ClickHouse publisher | Backend INSERT to the native analytical projection, minimum required visibility checks. | Cannot make browser inputs native source facts. |
| ClickHouse evaluator | SELECT on approved evidence/manifest/coverage objects; parameterized query values. | Read access does not grant policy administration. Actual server roles must be tested. |
| Replay writer/reader | Separate namespace and distinct benchmark permissions. | No native-table publication, action creation or scope approval. |
| Semgrep OAuth | Developer's Guardian setup, outside runtime controller and exports. | Fixed remote rules and source uploads are setup-specific. |
| Firecrawl credentials | Research tooling only. | No live detection, investigator or enforcement dependency is introduced. |

## 4. Native contract gates and policy implementation

[Identity diagram](rendered/04-identity.svg) · [Guild contract audit](GUILD_CONTRACTS.md).

The first-hour test resolves exact names and fields against actual responses. A security event's `task_id` must connect to the **actual evaluated acting subject** through the native task graph. Do not assign every descendant/delegated event to the controller's requested root agent. Definition IDs, installed-agent IDs and display names are not automatically interchangeable.

Use the event's populated native `credentials_id` or other independently verified authoritative binding for the evaluated operation. Keep raw vendor pluralization separate from our normalized `credential_id`. The shared-credential comparison fails if the two actors actually resolve different credentials. Guild documents credential priority from grant/caller chain through dedicated, acting-member, workspace and account credentials; multiple usable grants can fail instead of choosing. An API-trigger run has no human acting user, so a member-dependent configuration can fail before the scenario. Inspect SHARED/MEMBER mode and the actual credential chosen. [Credential policies](https://docs.guild.ai/platform/credential-policies), [API triggers](https://docs.guild.ai/platform/api-triggers).

For GitHub, verify the installed manifest and actual evaluated operation: a prefixed SDK tool such as `github_issues_get` is not automatically the policy operation `issues_get`. Repository/method selectors are used only if the selected integration actually evaluates them. A tool subset does not replace native credential policy. Remove/replace the initial allow-all when claiming a least-privilege baseline; an exact DENY can override it but does not tighten unrelated operations.

**Policy application is manual in the core architecture.** Fresh research found documented UI/CLI policy configuration, while the inspected public OpenAPI did not establish a credential-policy mutation route and account-key documentation restricts credential access. The UI therefore offers “Review scope / open native policy configuration,” then records actual applied-rule evidence. It does not advertise an automated “contain” button backed by an invented endpoint. A future adapter requires an actually verified native contract and authority; it is outside the critical path. [API-key constraints](https://docs.guild.ai/platform/api-keys).

Record the native rule identifier/selectors from actual readback or native UI evidence, the operator/time and result status. An organization audit export can be retained if it exists, but policy-specific audit fields are not promised. A generated command preview or “I applied it” checkbox alone is not the native effect receipt.

## 5. Records and authority

These are **ScopeWatch data contracts**, not vendor payloads. IDs remain opaque strings. An immutable repository reference and a SHA-256 content hash are separate values.

| Journal record | Minimum fields | Invariant |
|---|---|---|
| `manifest_version` | Reference/hash, effective start, verified workspace/subjects/credential/operation, unit, W=600s, allowance per subject, approval source | Frozen for the controlled case; the model cannot edit it. |
| `launch` | Controller launch ID, actual returned session/task, requested and corroborated actual subject/version, mode, start/completion | The returned native record, not request intent alone, binds the run. |
| `raw_observation` | Source/account/scope, native event/task/session identifiers, original semantic fields, native time, observed time, content hash | Preserve originals; identical delivery and changed content are distinct observations. |
| `collection_snapshot` | Finite registered task/turn cohort, pages/cursors, completion evidence, reconciliation reads, missing mappings/conflicts, cutoff | Exhausted pages do not independently prove perpetual source finality or account-wide discovery. |
| `event_binding` | Generation/native identity → actual acting policy subject/task, verified mapping method and proof | Per-event authority; root session/requested actor is not sufficient. Missing or conflicting mappings block admission. |
| `generation` | Revision, manifest, raw/canonical key sets/digests, event-binding digest, snapshot references, publication ACK and readback | Eligible only after analytical facts and their actor bindings/context match the sealed journal generation. |
| `case_revision` | Candidate, count/allowance, current window, first historical crossing/peak witness, contributing source IDs, query IDs, uncertainty | Never erase historical breach because today's count is zero. |
| `investigation` | Native session/task, immutable context read, actual incident URL, checked claims, missing evidence | Explanatory artifact only; edited issue content is never parsed into authority. |
| `action` | Case/evidence revision, manifest hash, exact scope digest, operator approval, native rule receipt, state/version | CAS rejects stale local approval; no promise of atomic remote policy mutation. |
| `verification` | Actual fresh target/control launches, refused operation, inspected control fixture, timestamps, residual scope | Both probes belong to the applied action; success is bounded to observed calls/time. |

Keep the analytical projection tagged with generation and trusted source kind. Separate raw observations, canonical events, manifest and coverage projections from replay objects. A canonical fact is emitted only by admission, never directly by a model/browser/replay uploader.

## 6. Admission: canonical facts before filters

[Evidence pipeline](rendered/03-evidence.svg) · [ClickHouse contract audit](CLICKHOUSE_CONTRACTS.md).

The event endpoint's default newest-first small page cannot be used as if it were a complete history. Collect the supported finite snapshot with the actual cursor contract, exhaust pages and reconcile completed-turn records before freezing it. Persist pages and failures; do not advance a high-water mark past an unfetched page. Durable events appear after completed turns; neither a socket nor a fast SQL query eliminates this source delay. [Native session events](https://docs.guild.ai/api-reference/sessions/fetch-session-events).

Determine the native event identity domain from the authoritative contract. If event IDs identify an event across sessions, session belongs in compared semantic content, not in an equality key that would hide copied IDs with altered sessions. If IDs are only unique within a documented narrower scope, use that scope's injective encoding. Do not infer uniqueness from UUID appearance. Unknown identity scope remains an explicit gate; a collision cannot be resolved by choosing a convenient row.

For each key, compare all semantic versions in the frozen generation **before** filtering by ALLOW, actor, operation or window. Same-ID differences in decision, actor, credential, session, operation or event time are integrity conflicts. Quarantine them, mark dependent cases stale and reconcile; arbitrary `argMax`/latest-row selection is not a correction. Exact repeated delivery yields one canonical event, while a genuine new ALLOW ID counts as another unit, including a failed downstream retry.

Required native actor/credential/operation/clock fields stay unresolved when absent. Separate native record-creation time from observation and service/result times. Null or inconsistent clocks do not become a valid zero. Optional outcome attribution requires exact native relationships and proven cardinality; parent/child ancestry alone does not attach every descendant result to a permission event.

### Coverage and publication

The core observes a **closed, finite controller-managed cohort**, not every workspace agent/session. Register the scenario tasks/turns before evaluation and disclose this monitored set. Open, missing or uncollected members prevent a definitive comparison for the cohort. Undiscovered/unmanaged sessions are outside the coverage claim, not implicitly safe.

Completion plus exhausted pages establishes what was captured under the tested source contract. Repeated stable reads are a reconciliation practice, not proof that a vendor can never append another delayed event. If native finality remains unproved, label counts “captured native approvals” and “within observed envelope”; do not certify complete account history. A later source change creates a new revision and invalidates pending action eligibility until reconciled.

After publication, read back the exact expected generation and compare bounded canonical ID sets/semantic digests against the journal; for the tiny case this can be an exact comparison. Include verified **per-event actor bindings**, expected manifest and qualified coverage in the digest/readback. The same native ID set with altered subject mappings is a different generation, not equivalent evidence. Do not admit a case on INSERT acknowledgement alone, or a query which returns only part of the intended cohort. No distributed transaction between SQLite and ClickHouse is assumed: publication states are collecting → sealed → inserted → readback-confirmed → evaluated, with idempotent retry/reconciliation.

## 7. Current and historical window evaluation

The window contract is **(T − 600 seconds, T]**, truncated at the manifest's effective start. The lower boundary is excluded and the upper boundary included. Preserve native precision; add an entire equal-timestamp group before testing its count. The older inclusive-start/exclusive-end sketch is superseded to avoid inconsistent edge handling.

At each required anchor, parameterized ClickHouse SQL aggregates all canonical ALLOW identities by actual workspace/subject/credential/operation and joins the pinned manifest's candidate set. Include candidates with zero observed counts. The backend supplies the generation/manifest/operation/anchor contract, **not the suspect actor**. The UI displays actual query results and contributing sessions; it never hardcodes TicketAssist as the answer.

Historical crossings are essential. Suppose 21 approvals arrive natively between 12:00 and 12:05, but the completed-turn records are first collected at 12:20. A current window then contains zero, while an anchored window at 12:05 proves an earlier breach. Today's zero cannot erase it.

Evaluate distinct native event-time anchors for each candidate within the declared observed interval. Between events the rolling count can only decrease, so a crossing must occur at an arrival group. Preserve the first crossing, peak observed witness and current count separately. A late event at s may affect anchors in [s,s+W); rebuild the small candidate's full sweep when in doubt. A changed/conflicting fact is not append-only and requires full affected-case recomputation/review.

For the small lab, the simplest SQL path is exact all-candidate aggregation at each bounded distinct anchor. A reference two-pointer sweep over query-returned canonical facts checks correctness; it is not a replacement for showing ClickHouse's actual candidate/count decision. At larger scale, a different optimized sweep must be validated before claiming identical semantics. Do not silently benchmark a single current-window aggregate as if it measured a full historical scan.

The [contract audit](CLICKHOUSE_CONTRACTS.md) contains the complete schema/query proposal, independent reference oracle and boundary fixtures. Every SQL snippet is unexecuted against ClickHouse in this research. Plain MergeTree plus explicit canonical generations suffices; ReplacingMergeTree background merges are not immediate uniqueness, and incremental-view joins do not retroactively adopt changed approvals. [Replacement semantics](https://clickhouse.com/docs/engines/table-engines/mergetree-family/replacingmergetree), [materialized-view contracts](https://clickhouse.com/docs/materialized-view/incremental-materialized-view).

## 8. Investigation and human decision

[End-to-end sequence](rendered/02-sequence.svg).

One actual Guild Native investigator reads the exact pinned manifest/context and creates an incident in the owned repository. Its narrow tools and native policy permit those jobs, not arbitrary repository changes, evidence mutation, credential attachment or policy administration. The investigator receives compact actual counts, allowances, contributing IDs, immutable references and unknowns; no launch/admin/database keys.

The model explains why the larger approved batch is within its allowance while the smaller support job has a recorded excess. It may summarize suspicious behavior as a hypothesis. Check quoted counts, identities and scope against deterministic journal facts before describing its artifact as grounded. Show model interpretation separately; a protected tool list does not guarantee the narrative cannot socially mislead the human. If grounding fails, keep the incident marked unreviewed and use the deterministic evidence for manual review rather than inventing useful AI work.

The approval digest binds case/evidence revision, manifest reference/hash, actual workspace/subject/credential/operation, any verified resource selector and intended mutation. The authenticated POST contains stored action/case references plus expected revision and CSRF token. Within a short local transaction, compare the expected current revision and record the exact approval. Revalidate immediately before native action. An edited incident cannot change the approved scope.

Native policy changes by another admin remain an external race. Record the observed pre-action rule context, expected scope, actual rule/readback, action time and probe time. Local journal CAS does **not** make external Guild edits atomic or provide continuous enforcement. It also cannot prevent an operator from applying an old copied scope directly in native UI/CLI after a case changes. Record such an out-of-band stale application as disputed/needs review, preserve the actual receipt and withhold the approved-current-case success claim. If no native revision/CAS contract is available, disclose that limitation and verify effects after action.

## 9. Action lifecycle and recovery

[Action state machine](rendered/05-action-state.svg).

“Approved,” “native action observed,” “verification pending” and “verified matching restriction” are separate states. Unknown application outcome is reconciled; do not create contradictory duplicate rules blindly. If the target succeeds, restriction failed. If both target and approved control fail, continuity failed. If a result is missing, verification is unknown. Preserve these states in the UI instead of displaying a global green “safe” badge.

The target must make a genuine fresh matching request, preferably in a new task/session. Retain the native refusal/reason and actual evaluated subject/operation. The control must return a genuinely inspected synthetic fixture marker through a real tool result or an audited wrapper of that actual result. Do not give the answer marker to the model as prompt text or accept its claim of success. A status code, DONE task or byte count does not by itself establish meaningful fixture content.

The action scope is subsequent matching operations. Other methods, resources, credentials, integrations, already permitted calls and in-flight work remain residual capability. Stop/archive/pause/global revoke are different controls, not selective-DENY substitutes. Falling below the rolling allowance never automatically removes the native policy. Recovery is a separate reviewed operation: after actual rule removal/readback, both the restored target and approved control must return their expected results. This uses a distinct recovery predicate, not the target-refusal predicate for containment. Missing/failing results keep recovery unknown/failed.

A late integrity conflict after observed restriction marks supporting case evidence disputed and requires operator review. Preserve the historical effect receipt at its observed time; do not erase it, claim its supporting source facts remain settled, or automatically remove the native DENY.

## 10. Cause experiment, Semgrep and sponsor evidence

[Claims and sponsor diagram](rendered/07-claims-and-sponsors.svg).

The optional planted-ticket comparison changes only lower-trust ticket content, keeping the trusted task, tools, fixtures, manifest and controller launch schedule fixed. Record actual source consumption and subsequent calls, alongside the benign condition. A scripted extra burst is deterministic misuse simulation, not proof of prompt influence. Cap the comparison at ten minutes within the scenario lane, stop by 1:30 and skip it if the core is late.

Semgrep runs during ordinary generation of this same controller/support/collector workflow. Preserve initial source, prompt/model/source hash and actual finding output before remediation. Focus its 20–30-minute discovery budget on ticket-lookup authorization, bounded query handling and token/admin handling without requesting insecure implementations or inserting a defect. The remote Guardian path uses OAuth and fixed `guardian-default`; organization Policies do not automatically apply. No genuine interesting eligible finding means no finding-prize claim. A finding must earn consequence, positive control, correction and rescan evidence. [Guardian configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration).

The ClickHouse case panel contains actual controlled native events. The scale panel contains a separately labeled diverse replay population, distinct native/replay identity handling and expected answers. Report measured p50/p95, sample count, exact query class, version, region, warm/cold condition, dataset cardinality and actual query IDs; distinguish server `query_log` duration from client round-trip duration. Separate turn persistence, collection, evaluation, investigator, human action and verification latency. SQL latency is not containment latency.

ClickHouse and Guild are the primary substantive tracks. Semgrep is an evidence-earned third opportunity; Pi is prize-only with uncertain novelty and no runtime access. Conditional top monetary face value remains $2,000 for the two primary firsts or $3,000 with eligible Semgrep first if awards stack; credits and unknown Pi value are separate. This architecture does not estimate win probability.

## 11. Failure and adversarial acceptance matrix

| Scenario | Required response / proof |
|---|---|
| Late events after a crossing aged out | Evaluate historical anchors; retain breach witness separately from current zero. |
| Same-ID copy changes decision or session | Canonicalize all versions before filters; quarantine and invalidate dependent revision. |
| Another managed turn is active/missing | Coverage pending/unknown; no definitive cohort compliance or target comparison. |
| Nested task belongs to another policy subject | Resolve actual acting subject or mark unresolved; do not copy root. |
| Different evaluated credentials | Shared-credential story fails; correct setup or narrow the claim. |
| ClickHouse projection missing rows | Reject generation admission; reconcile exact ID/digest readback. |
| Ticket/model/issue changes actor or allowance | Treat as untrusted content; controller facts and manifest remain authority. |
| Browser submits arbitrary scope/session/SQL | Reject; authenticated reference, fixed routing and trusted journal resolution only. |
| Source conflict after approval | Evidence revision changes; approval becomes stale before further action. |
| Another admin changes native policy | External race disclosed; record actual rule context and rerun both probes. |
| Default allow-all remains or SDK name mismatches | Baseline/scope gate fails; use verified operation and actual native policy. |
| Native mutation API absent | Use actual human UI / verified CLI; no fake REST adapter. |
| Target succeeds or both calls fail | Verification failed; correct reviewed scope, then rerun both. |
| No historical outcome join | Keep permission metric; actual fresh control witness remains separately necessary. |
| No planted-ticket influence or Semgrep finding | Omit those claims; core stays focused. |
| Cloud/network unavailable after a real run | Present disclosed recording/receipts; no fabricated live execution. |

See the [42-scenario playbook](../spec/SCENARIO_PLAYBOOK.md) for broader scope, and [independent architecture review](ARCHITECTURE_REVIEW.md) for severity-ranked attacks, resolutions and outstanding gates.

## 12. Build gates and evidence handoff

By 12:15 PT prove hosted calls, exact acting subjects, same evaluated credential, operation/unit/clock, finite source capture, actual selected native DENY and fresh target/control results. Restore only the known preflight trial rule and prove allowed baseline before declaring the main scenario; do not silently omit applicable setup events. If the gate fails, narrow the same product's claims. CrossedLine is only available if its genuine finding, owned reproduction and alternate controls already work; no late 28-run second-app build.

By 1:30 complete the full source → SQL selection → real investigation → reviewed native action → both fresh effects loop. Optional exact outcome matching gets 1:30–1:45 only if that loop works. Freeze scope at 2:30; protect recording, access, README and submission; aim 4:15 ahead of the 4:30 deadline. The same 300-minute plan and four owners remain. This document adds design precision, not extra event features.

Retain sanitized native snapshots/task mappings, exact expected generation ID-set/digest, manifest reference/hash, actual query/result/timing, investigator context-read/issue, approved scope/native rule evidence and both probe results. Add actual generated-source/finding/fix/rescan evidence only if obtained. Public artifacts never contain secrets or live admin endpoints. Build event source during the event.

## 13. Research and validation ledger

Firecrawl Build Search guided query-to-source discovery and selective extraction; exact developer contract questions escalated to the developer index and official pages. Firecrawl stays outside the runtime because the product's detector consumes native integration evidence. No web text becomes live policy authority.

- [Guild native contract research](GUILD_CONTRACTS.md): exact source/API fields, credential selection, policy authority and account gates.
- [ClickHouse contract research](CLICKHOUSE_CONTRACTS.md): canonicalization, null/conflict handling, exact anchor counts and offline reference checks.
- [Devil's advocate review](ARCHITECTURE_REVIEW.md): preliminary attacks plus final draft review.
- [Existing 34-page source reference](../../references/scopewatch-kb/index.md) and [master build plan](../spec/MASTER_SPEC.md).
- New primary captures and discovery records are retained under `.firecrawl/architecture-*`; new docs/source-contract verification is distinct from runtime verification.

The seven Mermaid files are editable sources; SVG/PNG and the offline viewer are diagram artifacts. Rendering and offline algorithm checks do not prove the Guild/ClickHouse live integration. Outstanding vendor/account assumptions are not silently closed by this research.
