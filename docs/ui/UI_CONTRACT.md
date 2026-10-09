# ScopeWatch UI contract

Source: `docs/prompts/BUILD_SCOPEWATCH.md` section 6, `src/shared/api.ts`, `src/shared/contracts.ts`. The UI renders only what the real API returns. No counts, labels or outcomes are hardcoded; test fixtures are labeled test data.

## Task and persona

Maya is the on-call operator. She opens a case after a breach was detected from native permission ALLOW decisions. Her job in one sitting: (1) see which workload crossed its own allowance and how the busier compliant control compares, (2) trust or distrust the evidence (provenance, freshness, coverage, conflicts), (3) review one exact restriction scope, (4) hand it to the human-native Guild step, record what she observed, (5) read the verification result and, later, separately review recovery.

## Hierarchy (top to bottom, left to right at 1440px)

1. Header: product, project/case, operator, run mode. Provenance strip directly under it is persistent on every view.
2. Sticky chrome (768+): the provenance strip plus a compact case bar (provenance tag, subject, evidence badge, case id, revision) stay in view while scrolling. Below 768 they scroll with the page.
   Workflow stepper, derived only from record state (evidence, investigation, restriction and recovery actions): Detect, Evidence admitted, Investigate, Review & approve, Apply in Guild (marked "human, in Guild UI"), Verify, Recover. Replay steps read "Not eligible (replay)"; non-native outcomes read "Simulated ..." and are never shown as native; a step is "done" only when the record says so.
   Case state line: action state, capture cutoff, query time and age, generation, re-run.
3. Primary comparison (the memorable view): breached subject beside the busiest compliant control, each against its OWN allowance. All candidates table under it. Uncertainty sits next to the claim it affects.
4. Evidence timeline with selectable contributing sessions, and a bounded evidence inspector.
5. Right column: Effect panel (native application, verification, recovery; the latest verification attempt is shown in full and older attempts sit under "Earlier attempts (N)", each still fully readable) and Query panel (dense per-family table: receipts, rows, client ms max, server ms max, target/version; oracle badge; the "All N executed receipts" disclosure keeps query ids, hashes and params).
   Timeline: consecutive session entries are grouped into one entry listing sessions with counts; each stays selectable for the evidence inspector.
6. Environment & native gates: one collapsed panel at the foot of the workbench with a one-line summary (missing settings, gate states); configuration checks (presence only) and native proof gates stay separate inside it.
7. Export panel (sanitized read-only bundle and its limits).

Wording rule: the counted unit is native permission ALLOW decisions. "ALLOW" never means "successful read". The UI states this next to counts.

## Provenance (persistent, text plus pattern, never color alone)

| Mode | Strip text | Action eligible |
|---|---|---|
| native | `NATIVE` - collected from a Guild account | yes, if evidence ready |
| replay | `REPLAY` - synthetic fixture, not account evidence | never |
| contract_test | `Contract test — mock Guild API, not native evidence` | never |

Shown on every view including login, empty, error. The case provenance (row) is shown as well as the server run mode; a mismatch is called out.

## Tokens

CSS custom properties in `src/client/styles/tokens.css`. Fonts: IBM Plex Sans (UI) and IBM Plex Mono (identifiers, SQL, hashes), self-hosted via `@fontsource`, system fallbacks. Type scale 12/13/14/16/20/26. Spacing 4px base (`--s-1`..`--s-8`). Surfaces: warm-neutral paper (light) and graphite (dark), via `prefers-color-scheme`. Accents: one steel-teal for interaction, one amber for breach/attention, one brick red for failure, one green for observed-good. Status always has a text label and a glyph. Text/surface pairs target at least 4.5:1. Motion limited to 120ms opacity/transform; disabled under `prefers-reduced-motion`.

## Layouts

- 1440+: two columns (main 2fr, side 1fr), case list as a slim left rail.
- 768: single column, case list becomes a select-like disclosure, panels stack.
- 360: single column; tables and code scroll inside their own container; identifiers use `overflow-wrap:anywhere` with the full value in `title` and an accessible name. No page-wide horizontal overflow.

## Data states (all implemented)

loading; login required (401); no cases (empty) with the mode-correct run action; unconfigured (StatusReport settings listed by name); database unavailable (ClickHouse/journal/503); Guild/API error; partial coverage (`evidence_incomplete`, readiness gaps); integrity conflict (`evidence_disputed`, conflict gaps); no breach; stale approval (409 `stale_revision`, reload prompt); not eligible (403/409 `not_eligible`); replay/contract_test action blocked with reason; rejected review; approved awaiting native; native application pending/unknown/observed; scope_mismatch; disputed_stale_application; verification pending/failed/unknown/verified; simulated_*; recovery review_ready/approved/removal_observed/failed/unknown/recovered. A 200 response is never shown as success; success words appear only from record state.

## Review flow (never an automatic API effect)

1. "Review restriction" opens a dialog (role=dialog, focus trap, Escape, focus restore): exact workspace, policy subject, credential, operation, resource selector (or "unrestricted dimension"), decision DENY, what changes, residual capability, what stays usable, current revision, scope digest, reason field (required).
2. "Approve exact scope" posts `expectedRevision` + reason. The result is an approval of a scope, not a policy change.
3. Handoff (post-approval): "Open Guild, then Access & setup, then Credentials, then the policy table; add a DENY rule with these selectors", followed by a native-receipt form (what the operator observed). The server computes whether observed selectors match.
4. "Verify" requests fresh target and control probes. Verified only when the target was genuinely refused and the control content was inspected.
5. Recovery is a separate review (reason), a removal receipt, then verification requiring both target and control success. The falling count never releases anything.

Disabled controls carry a visible reason (`aria-describedby`), never a bare disabled button.

## Accessibility

Landmarks (`header`, `nav`, `main`, `aside`, `footer`), labeled regions, labeled form fields, visible focus ring (2px offset), keyboard-only flow for every action, one polite live region announcing state transitions only (not every fetch), untrusted strings rendered as text only (no `dangerouslySetInnerHTML`).

## Acceptance walkthrough

1. Open app unauthenticated: login with provenance strip visible.
2. Log in: case list. Empty: run action matching mode.
3. Open case: strip, state line, breached vs control cards with window/allowance/first crossing/peak/current, historical breach visible with current 0.
4. Select a session in the timeline: bounded evidence shown.
5. Query panel: receipts, hashes, params, client vs server ms, oracle agreement.
6. Replay/contract_test: "Review restriction" disabled with reason. Native: dialog, approve, handoff, receipt, verify.
7. Resize 360/768/1440: no page overflow. Tab through everything: focus visible; Escape closes dialog and restores focus.
