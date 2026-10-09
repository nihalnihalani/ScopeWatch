# Devil plan review — .scopewatch-run/PLAN.md

Reviewer model: claude-opus-5-5 (per own system prompt). Scope: plan only (no code exists yet beyond package.json).
Inputs read: PLAN.md, DEVILS_ADVOCATE.md, AGENTS.md, ARCHITECTURE.md §5–9, ARCHITECTURE_REVIEW.md, BUILD_SCOPEWATCH.md §4–7.
Verdict: plan is broadly aligned with the corrected contracts. 2 P0, 7 P1, 5 P2. P0/P1 are design-level repairs to land
in contracts.ts/config.ts before builders fan out; none needs a new platform.

## P0

**P0-1 Native mode can be pointed at the mock and still say "native".** Counterexample: operator sets GUILD_BASE_URL=
http://127.0.0.1:4010 (mock left running from tests) with mode=native. Plan only constrains contract-test to loopback;
it never constrains native to the real host. Consequence: mock-authored DENY/control-marker responses are journaled with
provenance `native`, become action-eligible, appear in export as evidence — fabricated native response under the
native label. Repair: config.ts pins native base URL to an allowlist (https://api.guild.ai, exact) and refuses
loopback/private/non-TLS; contract-test refuses anything non-loopback (already planned). Doctor prints which rule fired.
Add a unit test for each refusal.

**P0-2 Provenance is a server-wide mode, not a per-row/per-case attribute checked at action time.** Counterexample:
run replay or contract-test, then restart in native mode against the same SQLite file; prior cases/actions are
listed and the review route checks "current mode == native" and accepts approval. Or contract-test action rows reach a
"verified" state that native UI renders. Consequence: synthetic facts gain native action eligibility (violates inv. 15,
BUILD §4.15). Repair: (1) separate journal file per mode (journal-native.sqlite / -replay / -contract) plus a
`provenance` column on every generation/case/action row that is part of the approval digest; (2) eligibility checks
read the row's provenance, never the process mode; (3) native-mode queries filter provenance='native' and CH db is
per-mode (scopewatch_native vs scopewatch_replay vs scopewatch_contract — plan names only replay); (4) contract-test
terminal states use distinct names (e.g. `simulated_restriction_observed`), never `verified_matching_restriction`;
(5) tests/support/mock-guild must be unimportable from src/** (eslint no-restricted-imports + excluded from
tsconfig.server build). Adversarial test: replay case id posted to /review in native mode → 409 with reason.

## P1

**P1-1 Contract-test is scope creep and a masquerade risk as a UI mode.** Docs specify two modes (native, replay);
BUILD §7 forbids "replace native checks with mocks just to turn green" and "fake AI calls". A UI mode whose mock returns
DENY because the operator typed a receipt simulates "effect from acknowledgement"; a mock investigator returns canned
incident prose. Consequence: screenshots of a green-looking verified loop with no native evidence; judges/readers
conflate. Repair (smallest): keep mock-guild as an integration-test harness only (tests/integration/guild) driving the
real adapter; do not expose contract-test in the product UI or screenshots. If the lead keeps it as a mode: banner on
every view + export refusal + no investigation narrative (show "mock incident, not model output") + P0-2 rules.

**P1-2 Native receipt does not re-check case revision or compare observed rule to approved scope.** Plan's
POST native-receipt carries only action expectedVersion. Counterexample: approval on rev 3; late conflict creates rev 4;
operator applies old copied scope in Guild UI and enters receipt → recorded as "native action observed" for current case.
Or receipt fields show broader selector/different subject. Repair: on receipt, compare case current revision vs
approved revision and observed fields vs approved scope digest; mismatch → `disputed_stale_application` /
`scope_mismatch`, receipt preserved, verify disabled for success claim (ARCH §8). Receipt alone never sets effect.

**P1-3 Verify freshness and subject resolution unspecified.** Counterexample: verify reuses a target session launched
before the receipt time, or a control session whose returned subject differs from the approved control. Consequence:
pre-policy result or wrong subject certifies restriction. Repair: verify launches NEW target/control sessions server-side
from the approved scope only (allowlisted launch profiles), requires launch time > receipt time, binds returned actual
subject/credential/operation per event, and compares control content to a server-held marker never sent in prompts.
Missing any part → `unknown`. Matrix as inv. 12.

**P1-4 Unknown external outcomes have no state/reconcile rule.** Plan omits the Journal/actions test family item
"unknown external outcome, repeated incident/action reconciliation". Counterexample: investigator issue-create or probe
launch times out; retry creates a second issue/second probe that is counted as fresh evidence. Repair: journal
intent rows with stable idempotency ref before the remote call; timeout → `outcome_unknown`; retry only after
reconciliation read (search by ref / list sessions); UI shows unknown state.

**P1-5 ClickHouse retry duplicates and readback multiplicity.** Plain MergeTree + "idempotent retry" after an
insert with unknown ACK can store rows twice (insert dedup is not guaranteed on non-replicated local tables). A readback
comparing ID sets/digests over DISTINCT rows passes; a count query that isn't DISTINCT double-counts. Repair: readback
asserts exact row multiplicity per (generation_id, key) == journal; retry = drop/recreate partition for that generation
(or insert into fresh generation id) rather than blind re-insert; all count SQL uses uniqExact/DISTINCT canonical key.
Test: inject a double insert → readback fails, no admission.

**P1-6 Identity domain and semantic-compare field set are not pinned.** Plan says `native_identity_key` but not its
uniqueness domain nor which fields are delivery-only. Counterexample A: key includes session → copied ID with altered
session hides as two events. B: observed_at/page cursor included in semantic json → exact redelivery flagged as
conflict, whole generation inadmissible forever. Repair: contracts.ts declares (a) identity domain as an explicit
config gate (`unverified` blocks native admission; fixtures declare theirs), (b) a closed list of semantic fields
(decision, actor/task, credential, session, operation, native created time, …) vs delivery fields; NULL→value =
conflict. Tests for both directions.

**P1-7 Cohort registry source is circular if derived from collected sessions.** Inv. 4 says "registered finite cohort"
but not who registers. If the registry is built from what collection found, a never-collected session is never missing.
Repair: registry rows are written from controller launch records/manifest before evaluation (replay: from the seed
declaration); coverage = registry − collected-complete; pipeline/run body accepts no session IDs/subjects (server-side
registry only).

## P2

**P2-1 Approval digest field list too terse.** "scope digest" must explicitly include workspace, actual subject,
credential, operation, resource selector, intended mutation and provenance (ARCH §8). Write the canonical JSON order in
contracts.ts so the UI preview and server digest are byte-identical.

**P2-2 Recovery routes incomplete.** Only "create recovery review" exists. Need recovery approve (own revision/CAS),
removal receipt, recovery verify with distinct predicate (both target and control succeed), plus `failed/unknown`.
Can share /review with a `kind` stored server-side, not browser-chosen.

**P2-3 Predicate/time encoding.** State `count > allowance` (strict) and pass DateTime64(9) parameters as strings from
BigInt; never JS Number. Oracle should canonicalize from journal facts with its own code path, so SQL-side DISTINCT
canonicalization and app canonicalization check each other (shared helper = shared bug).

**P2-4 Missing explicit items:** UI contract doc before components (BUILD §6); manifest effective start/allowances
declared before activity with hash in external wrapper (inv. 8 present, but declaration-before-activity check is not);
required UI states list (stale approval, rejected review, recovery pending/failed). `.scopewatch-run/` is already
gitignored — good; add a `journals/`/runtime store path under the ignored `runtime/`.

**P2-5 (e) Local docker ClickHouse as receipt.** Legitimate as "executed SQL" for query semantics if the receipt names:
local server, image digest (pin digest, not `25.8` tag), `version()`, query_id from system.query_log, parameters,
dataset provenance (replay/fixture), and row counts. It is not ClickHouse Cloud evidence, not native evidence, and not a
latency claim for Cloud. Re-run the same query files on Cloud when credentials exist and label separately.

## Not findings (checked)
Canonicalize-before-filter, conflict→inadmissible, (T−600s,T] with ties/effective start, separate first-crossing/peak/
current, readback of bindings+manifest+coverage, human-only policy application, no auto-release, CSRF/Origin/Host and
loopback bind are all present in the plan and match the corrected architecture.
