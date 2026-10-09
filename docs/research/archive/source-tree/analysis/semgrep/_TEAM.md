> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Semgrep team summary: Best Use of Semgrep winners (AWS AI Agents Hackathon, 10 Oct 2025)

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Per-project files: [darwin.md](../../../../winners/semgrep-darwin.md) · [commitdna.md](../../../../winners/semgrep-commitdna.md) · [udon-cat.md](../../../../winners/semgrep-udon-cat.md) · platform guide: [_SEMGREP_PLATFORM.md](_SEMGREP_PLATFORM.md)

## Headline findings

1. **The prize had explicit tiers with different asks** (verified, Devpost):
   - 1st: "Generate Rules for Agents — an agent that helps customize your security experience; agentic workflow that improves security".
   - 2nd: "Write a rule… for custom security practices".
   - 3rd: "Run a Semgrep scan that finds no vulnerabilities of any generated or code you write".

   The earlier research didn't capture this. *Inference* on the mapping: CommitDNA is the best fit for 1st, Udon Cat for 1st or 2nd, Darwin for 3rd (it shows Defense 100/100 on generated code).
2. **No winner demonstrated a custom Semgrep rule.** Every one used registry rulesets or claimed rule work without showing it. The 2nd-tier criterion was effectively unclaimed on screen. This is the most exploitable gap.
3. **Only Darwin's source is inspectable.** Its Semgrep call is real but thin:
   - It runs `semgrep --config p/security-audit --config p/python --json` on a temp file (`backend/forge/scanner.py:339-352`).
   - Severities are converted to −40/−25/−10/−5 penalties, which feed 40% of the fitness score.
   - It **fails open to 100** (`app/orchestrator.py:153-157`) and never shows a finding.
   - It was added at **15:01, about 90 min before the deadline**.
4. **CommitDNA's shipped UI is fully scripted.** Its hosted bundle contains no fetch calls, and the "agent logs" are hard-coded strings. Some Semgrep rule IDs on the cards look invented. The author disclosed on screen that the analysis was "Accelerated 10x for judges" and said "some parts are just created for demo purposes". It still won, on the *idea*: Semgrep as a generate-and-verify oracle, plus the Semgrep MCP.
5. **Udon Cat showed the most genuine Semgrep output.** Verbatim registry rule IDs and messages appear, followed by an LLM fix, a diff and a backup. It was praised for bringing Semgrep into browser IDEs (bolt.new). Its author `chinesepowered` is a serial hackathon winner (also Guild winner Branch) who creates several hack repos per week.
6. **Semgrep blogged about all three** as "trends" in its retrospective. The sponsor rewards projects it can turn into a product narrative: MCP, multi-LLM, coaching, browser vibe-coding, MCP supply chain.

## Sponsor-usage depth table

| Project | Semgrep surface | Rules | Where the result goes | Finding shown to user? | Loop? | Depth | Verifiability |
|---|---|---|---|---|---|---|---|
| Darwin | CLI subprocess, JSON | `p/security-audit` + `p/python` | 40% of the fitness score that picks the winning LLM | **No** (score only; vuln count estimated client-side) | No (single scan; regex fallback; fail-open 100) | Load-bearing formula, thin implementation | Source read (file:line) |
| CommitDNA | **Semgrep MCP** (claimed) | `p/security-audit` (in UI logs); claimed rule "reverse-engineering" | Developer profile, blind spots, training cards | Yes (card ruleId/CWE; partly invented-looking) | **Claimed** generate → Semgrep re-verify loop | Core to pitch (claimed); scripted UI | 404 repo; JS bundle + demo |
| Udon Cat | "Semgrep API" (CLI vs hosted unknown) | Registry (md5-used-as-password, formatted-sql-query, sqlalchemy raw query, avoid-pickle) | Each finding goes to a Qwen fix, then applied by confidence | **Yes, verbatim rule ID + message + lines** | Fix applied; **no re-scan** | Load-bearing | 404 repo; demo frames |

Other sponsors: Darwin used Bedrock. CommitDNA used Claude Agent SDK, Bedrock and Vanta MCP (claimed). Udon Cat used Cerebras/Qwen, with **no AWS and no Vanta**, so the "≥3 sponsor tools" criterion clearly wasn't required to win the Semgrep prize.

## Common demo structure

1. **Semgrep named in the first 3–15 s and badged in the UI.** Udon Cat's header said "Powered by Semgrep + Cerebras". CommitDNA had a "Semgrep MCP" chip on agent 1. Darwin had a "Semgrep — 40% of Fitness" panel.
2. Live-looking run with progressive streaming: narration cards, agent columns, "Kitty is sniffing for bugs".
3. A single memorable result artifact: "Apex Predator 98.3", "B+ 87/100 Backend Fortress Builder", "8 issues / 8 fixes".
4. A personality layer: biology metaphor, Duolingo/Tinder swipe, a cute cat.
5. A proof or architecture beat: Darwin's evolution chart, CommitDNA's README mermaid, Udon Cat's GitHub Desktop diff plus backup.

Durations: 75 s (silent), 134 s, 200 s. All under the 3-minute cap.

## Ranked winning formula for Semgrep (2026 Cyberdefense)

1. **Semgrep in a deterministic verification loop with an LLM.** The LLM generates (a rule, a patch, a sample) and Semgrep verifies, re-running until clean. This is Semgrep's 2026 core message ("deterministic analysis + AI reasoning beats AI alone"; Agentic Workflows; Guardian).
2. **A custom rule written live, by an agent, with `semgrep --test` passing**, then swept across repos. It covers the old tier 1 and tier 2, and no 2025 winner showed it.
3. **Put Semgrep where code is born** (agent hooks / MCP / IDE / browser IDE). This mirrors Guardian, and Udon Cat and CommitDNA both scored with this framing.
4. **Make Semgrep decide something visible** (rank models or patches, gate deploys, block installs). Show the weight or gate on screen.
5. **Show real rule IDs, messages and file:line**, then end on "0 findings ✓" after the fix (the old tier 3).
6. **Story and persona plus one memorable metric**, kept within 3 minutes.
7. Bonus: AI / agent supply-chain pre-flight (scan an MCP server or skill before trusting it; AI Security / Agent Skills / Shadow AI rulesets). Semgrep's blog highlighted AgentSafe for exactly this.

Avoid: failing open, scripted "live" logs without disclosure, invented rule IDs, a score with no visible findings.

## Explicit uncertainties

- **Tier placements are not published.** The mapping of winners to 1st/2nd/3rd is inference.
- **2026 Semgrep prize wording is unknown.** Luma lists Semgrep as a sponsor and its judges (Milan Williams, Product; Daghan Altas, Head of Product) but no prize text. Confirm at kickoff.
- CommitDNA and Udon Cat repos are 404. **Wayback Machine was "Temporarily Offline"** during two attempts, so archived snapshots remain unchecked and are worth retrying. Their backend implementations are unverified.
- Darwin: we cannot tell from the demo whether the 100/100 scores came from Semgrep (0 findings), the regex heuristic, or the fail-open path. The UI drops `scanner_used`.
- Udon Cat: whether `semgrep_client.py` wrapped the CLI or a hosted API is unknown. The CLI is never shown.
- Whether `chinesepowered` = Nelson Lai is inference (repo owner + speaker + Devpost creator).
- Udon Cat recording-time clock readings come from low-res (360p) frames and are approximate.
- The "invented-looking" CommitDNA rule IDs were not checked against the live registry.
- The 2025 judges were AWS SAs (Jon Turdiev, Saptarshi Banerjee). It is unknown whether Semgrep staff judged the sponsor prize separately (likely; *inference*).
