# Interface engineer report

Model ID: claude-sonnet-5-5

## UI contract
docs/ui/UI_CONTRACT.md (persona Maya, hierarchy, tokens, layouts, states, review flow, a11y, walkthrough).

## Files
docs/ui/UI_CONTRACT.md; src/client/{index.html,main.tsx,App.tsx,api.ts,format.ts}; src/client/components/{common,Comparison,Timeline,QueryPanel,ReviewDialog,EffectPanel,Misc,ops}.tsx; src/client/styles/{tokens,app}.css; tests/unit/client/{fixtures.ts,workstation.test.tsx}; throwaway: this dir's fixture-server.ts, shots.mjs, screens/.

## Commands
- npx vitest run --project client: exit 0, 16 tests pass
- npx tsc -p tsconfig.json --noEmit: no errors in src/client or tests/unit/client
- npx vite build: exit 0

## Browser verification (NOT against the real backend; src/server/main.ts did not exist)
A throwaway fixture server (fixture-server.ts, test data from tests/unit/client/fixtures.ts) served dist/client plus fake /api. Playwright (headless shell 1234) at 360/768/1440, replay/contract_test/native/login/stale; light, plus dark at 1440. Result: page-wide overflow 0 in every capture, no console errors or failed requests. Flows exercised: Review restriction dialog, Escape restores focus to the opener, approve then handoff, native receipt, stale 409 alert, login. Screenshots in screens/. Real-endpoint wiring remains UNVERIFIED until the backend runs.

## Known gaps
- Dark mode only checked visually at 1440 native/contract; no automated contrast measurement (tokens chosen for >=4.5:1 by hand).
- Verify/recovery/removal flows are covered by component logic but not browser-exercised (fixture server lacks them).
- Case list rail on narrow screens is a closed disclosure.
- No refinement rounds beyond one CSS fix (primary row background).

## Requested DTO/API changes
1. CaseDetail: per-session evidence (sessionId, coverageState, binding method/proof ref, identity keys per session). Now the inspector shows only witness-level identity keys and TimelineEntry.detail for binding method. Caller: Timeline.tsx.
2. ActionRecord.scopeDigest is only available after approval; pre-approval digest preview (ScopeDigestInput bytes) would let the dialog show it. Caller: ReviewDialog.
3. Confirm the server verbs: recovery POST body uses restriction actionId; response ActionRecord state expected review_ready. Confirm which action states accept native-receipt (UI allows approved, native_application_pending/unknown, scope_mismatch).
4. Contract-test: per devil P1-1 UI shows banner everywhere and blocks approval (isNativeActionEligible), so simulated_* states appear only if the server produces them.
