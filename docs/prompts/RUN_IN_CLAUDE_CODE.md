# Run the ScopeWatch team prompt

Prepared 9 October 2026 from [current official capability research](research/CLAUDE_CAPABILITIES.md). This guide does not launch a session, change saved settings, install software or build event source. Use it when event implementation is authorized.

## Recommended route: Claude Code inside Cursor's terminal

Open Cursor's integrated terminal and run:

```sh
cd /Users/nihalnihalani/Desktop/Github/ScopeWatch
CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1 \
CLAUDE_CODE_ENABLE_TODO_TOOLS=1 \
claude --model claude-opus-5-5 \
  --effort high \
  --permission-mode auto \
  --teammate-mode in-process
```

This requests an interactive Opus 5.5 lead, session-scoped native-team enablement and shared Task tools. The local binary was checked at 2.1.295; official minimums are 2.1.280 for Opus 5.5 and 2.1.284 for Sonnet 5.5. Check the event environment again. Account access and effective provider/managed settings remain untested.

Auto mode preserves classifier checks and explicit permission restrictions; account/org support can prevent it. If unavailable, use the supported existing permission mode and let required approvals surface. Do not replace it with a bypass flag. Do not clear saved settings or print credentials while diagnosing model/tool overrides.

Do not use `claude -p` for this recipe: native teammates are interactive-only; print/SDK delegation uses ordinary subagents. Native Cursor Agent is also a separate harness; selecting Opus in its picker does not activate Claude Code teams. In-process display avoids installing pane tools or assuming split-pane support.

## Paste this continuation goal

In the interactive session, paste this **single `/goal` command**. It is below the documented 4,000-character limit and references the complete saved prompt:

```text
/goal Read AGENTS.md, START_HERE.md, docs/prompts/BUILD_SCOPEWATCH.md and docs/prompts/agent-briefs/README.md. Execute the complete authorized ScopeWatch event build described there with an actual Opus 5.5 lead, Sonnet 5.5 implementation/acceptance teammates and independent Opus 5.5 devil review. Verify event clock/authorization and actual harness/models/tools first. Complete all independent application/UI/backend code, runnable commands, meaningful tests, browser interaction/screenshots, independent review fixes, docs and sanitized demo/evidence artifacts. Do not finish at a plan or mocked UI. Keep source/identity/credential/coverage, historical SQL/readback, human native policy action and fresh target/control evidence exact. Native pending inputs must not block independent local QA/review/handoff, and replay must not become native proof. Surface actual command exits and evidence/check references, actual model changes, LOCAL_READY or LOCAL_INCOMPLETE, and truthful NATIVE_PENDING/BLOCKED or VERIFIED_LIVE. Continue repair/integration within the documented deadline; never fabricate success or run an unbounded loop. Respect human stop and native policy authority. The goal is met only when all required independent work and applicable checks are complete; unavailable native prerequisites are precisely reported after independent work, not counted as passing. Outside the authorized event window do not generate competition source.
```

`/goal` continues after turns; auto mode alone does not. Its evaluator reads the transcript and does not execute tests. The lead must supply real receipts. A native/account impossibility can stop the harness; the final report must still distinguish local implementation from live proof. [Official goal guide](https://code.claude.com/docs/en/goal).

If `/goal` is unavailable, use this ordinary bootstrap and report that automatic continuation is unavailable:

```text
Read docs/prompts/BUILD_SCOPEWATCH.md and execute it completely during the authorized event build. Use the actual native team and model/tool checks described there. Maintain the shared task graph, independent acceptance/devil review and durable handoff; continue implementation/testing/repair instead of stopping at a plan. Preserve truthful LOCAL_READY/LOCAL_INCOMPLETE and native-proof status. Report a missing harness capability instead of pretending it exists.
```

This bootstrap is guidance within the available session; it does not manufacture persistence. If exact models or native teams are unavailable, disclose the gap and request a concrete execution/model choice instead of silently relabeling a different harness.

## Checks that matter

- Exact requested IDs: `claude-opus-5-5` and `claude-sonnet-5-5`. Provider aliases can select older models. Confirm actual active/requested provider/model and inspect each teammate.
- Shared Task tools need the researched TODO opt-in; an existing `CLAUDE_CODE_ENABLE_TASKS=0` can alter behavior. Without them, use one leader ledger plus messages, not unsupported tool statuses.
- Do not force a global Sonnet override if you also want an Opus reviewer. Managed allowlists/mod hooks can change requests.
- Respect documented content-based fallback/refusals; record model changes. This pack supplies no evasion workaround.
- Auxiliary goal/evaluation requests can use other harness models; exact lead/worker requests do not guarantee only those models ever run.
- Teammates lack lead history and may need respawning after resume. Preserve scoped handoffs, current model observations and event clock.
- Do not create obsolete team runtime config or assume TeamCreate/TeamDelete commands. The current lifecycle is documented in the capability audit.

## Event clock and result

Conservative window: 9 October **11:30 AM–4:30 PM PT**, or **10 October 00:00–05:00 Asia/Calcutta**, or 9 October 18:30–23:30 UTC. Confirm actual organizer instructions. This prompt is pre-event research; competition source follows the build-during-event rule.

The result should be a real local application with complete required UI/backend behavior, actual tests/review and precise native gate status. VERIFIED_LIVE still requires actual account/SQL/hosted-investigation/human-policy/fresh-result proof. A prompt cannot create missing credentials or human approval; independent code/UI completion proceeds.
