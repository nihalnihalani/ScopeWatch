> Imported historical analysis; current ScopeWatch architecture/contracts govern the build.

# Why they won: Best Use of Semgrep, AWS AI Agents Hackathon (10 Oct 2025)

Round 2, matched winner-vs-loser analysis. Builds on [darwin.md](../semgrep-darwin.md), [commitdna.md](../semgrep-commitdna.md), [udon-cat.md](../semgrep-udon-cat.md), [_TEAM.md](../../archive/source-tree/analysis/semgrep/_TEAM.md) and [_DEVILS_ADVOCATE.md](../../archive/source-tree/analysis/semgrep/_DEVILS_ADVOCATE.md). Written 8 Oct 2026. **[V]** = verified with the source named; **[I]** = inference.

**One-paragraph answer.** The Semgrep prize did not go to the best projects at the event, and it did not go to the most genuine Semgrep integrations. It went to the three projects where **Semgrep had a new, nameable job inside an AI-coding workflow**, and where that job was **visible on screen with a Semgrep label** in a short, polished demo:
- Darwin: Semgrep is the fitness function that picks which LLM survives.
- CommitDNA: Semgrep is the ground truth behind a personal security tutor.
- Udon Cat: Semgrep is the scanner inside a bolt.new vibe-coding browser.

Each of those jobs maps one-to-one onto a Semgrep product story, and Semgrep's own blog later used them as its "trends" 1, 2 and 3. The best project overall (TidyShot) and the most genuinely working pipeline (Watchman) both lost the Semgrep prize. For both, Semgrep was one anonymous box in a pipeline whose payoff was about something else.

---

## 1. Event context

| Item | Value | Source |
|---|---|---|
| Date / venue | Fri 10 Oct 2025, AWS SF Builders Loft | [V] Devpost overview |
| Agenda | 9:30 doors; 10:00 keynote + sponsor talks (10–15 min each); **11:30 start coding; 4:30 PM submission deadline; 5:00 PM finalist presentations and judging**; 7:00 PM awards | [V] Devpost schedule |
| Build time | About 5 h | [V] |
| Registrants | 192 on Devpost; "300+" claimed; Semgrep blog says "over 250 developers… 50+ projects" | [V] Devpost header; Semgrep blog |
| Gallery | **56 projects** (24 + 24 + 8 over 3 pages) | [V] fetched `/project-gallery?page=1..3` |
| Semgrep users | **20/56** list Semgrep in "Built with"; 25/56 mention it in the story | [V] DA §3 |
| Sponsor prize | Best Use of Semgrep, 3 winners: 1st $2,500 "Generate Rules for Agents — create an agent that helps customize your security experience. Incorporate an agentic workflow that improves security"; 2nd $1,500 "Write a rule to check your code or any agents for custom security practices"; 3rd $1,000 "Run a Semgrep scan that finds no vulnerabilities of any generated or code you write" | [V] Devpost prizes |
| Other prizes | Overall 1st/2nd/3rd ($5k credits + $5k cash / $3k / $2k); Best Use of AWS ($10k credits); Best Use of Vanta (2 winners) | [V] Devpost prizes |
| Judging criteria | **Idea 25% · Technical implementation 25% ("surprise and inspire… through the novel use of tools in a unique way") · Tool Use 25% ("at least 3 sponsor tools") · Presentation 25% ("live demo in 3 minutes… 1 overview slide")**. Four criteria, not five. There is **no Autonomy criterion** at this event | [V] Devpost "Judging Criteria" |
| Submission | "3-minute demo recording along with all details required from Devpost" | [V] Devpost requirements |
| Sponsors | AWS, Anthropic, Bugcrowd, Evolution VC, **Semgrep**, System Initiative, Vanta | [V] Luma |
| Judges | 6 AWS staff (Jon Turdiev, Saptarshi Banerjee, Srujith Poondla, Gautam Kumar, Avnish Kumar, Sathya Balakrishnan); Arsh Vishen (Vanta PM); Gagan Bhat (Anthropic); **Daghan Altas (Head of Product, Semgrep)**; Taher Elgamal; Adam Jacob and Nick Stinemates (System Initiative); and 7 others | [V] Luma judges list (Devpost shows only the first two, with "See Luma for judges") |
| Semgrep speaker | **Jayson DeLancey**, Head of Security Advocacy. He co-wrote the 25 Nov 2025 retrospective blog with Braden Riggs | [V] Luma speakers; blog byline |
| Team sizes in set | Darwin 5 on Devpost (3 git committers); CommitDNA 1; Udon Cat 2; TidyShot 2; AuditArc 3; Watchman 1; Yoru 1; IndieCode Shield 4; Stimpack 3; CodeShield 5; security-goons 1; AgentSafe 1 | [V] Devpost "Created by" |

**Correction to round 1.** `_TEAM.md` and `MASTER_REPORT.md` say the 2025 judges were AWS SAs, and that it is unknown whether Semgrep staff judged. **Luma lists Daghan Altas (Semgrep Head of Product) as a 2025 judge.** He is the same person listed for tomorrow. The leniency toward scripted demos therefore came from the *same* Semgrep judge. Round 1's main reason to expect stricter judging tomorrow ("product owners now, not DevRel") goes away. **[V]**

**Rank within the Semgrep prize is unknowable.** All three pages say only "Winner · Best Use of Semgrep". **[V]** See DA §2.

---

## 2. Comparison set

Selection: all 3 winners, plus every Semgrep user that has a video and looks competent, plus the projects named in the brief, plus the two overall winners that used Semgrep (the "halo" cases).

| Project | Result | Semgrep role (as claimed) | Other sponsors | Video | Team | Devpost created (EDT) |
|---|---|---|---|---|---|---|
| **Darwin** | **Semgrep winner** | Fitness function: 40% of the score that picks the winning LLM | Bedrock | 75 s, silent | 5 (3 committers) | 19:39 |
| **CommitDNA** | **Semgrep winner** | Semgrep MCP scans your last 100 commits → personal tutor and flashcards | Claude Agent SDK, Vanta MCP | 134 s, webcam | 1 | 19:29 |
| **Udon Cat** | **Semgrep winner** | Scan → Qwen fix → apply + backup; web UI, CLI, **Chrome extension on bolt.new** | none (Cerebras/Qwen are not event sponsors) | 200 s, webcam | 2 | 17:34 |
| TidyShot | **1st overall + Best Use of Vanta**; not Semgrep | Custom text rules validate LLM-detected secrets in OCR'd screenshots | Bedrock, Vanta MCP, Neon | 125 s, phone-filmed | 2 | 19:47 |
| AuditArc | **2nd overall**; not Semgrep | One of three feeds into a security/compliance dashboard | Vanta, Harness, AWS | none | 3 | 19:30 |
| Watchman | nothing | Semgrep on each push → Bedrock triage → GitHub issue + PR + email | Bedrock | 203 s | 1 | 19:10 |
| Stimpack | nothing | `semgrep ci` in GitHub Actions → Claude Code auto-fix PR | Claude | 74 s | 3 | 19:15 |
| IndieCode Shield | nothing | Semgrep MCP server scans a GitHub URL → business-risk report; "custom rules" claimed | AWS (Strands/Bedrock) | 57 s, **silent** | 4 | 19:24 |
| Yoru | nothing | Semgrep gate on agent-written code **before execution** in a Daytona sandbox | Claude | 137 s | 1 | 19:51 |
| CodeShield | nothing | Semgrep report on a repo whose code is abstracted before it goes to Bedrock | Bedrock, Vanta | 244 s | 5 | 19:45 |
| security-goons | nothing | Semgrep MCP subagents, fix, **rescan gate** | (Cursor/Claude) | **none** | 1 | 19:41 |
| AgentSafe | nothing, but **featured in Semgrep's blog** | Semgrep-scan an MCP server's source **before connecting** | Vanta | **none** | 1 | 19:58 |
| AI-powered security code review | nothing | Semgrep MCP + Claude explanations + tickets | Vanta | private (yt-dlp: "Private video") | 1 | 19:36 |
| RedBot | n/a | not analysed (out of scope) | | | | |

Creation times run up to 19:58 EDT (16:58 PT), after the 16:30 PT deadline. Devpost "started this project" is the page creation time, so either the deadline was soft or edits continued. **[V]** times; **[I]** interpretation.

---

## 3. Demo forensics

Method: `yt-dlp` (android client; the web client returned 403), auto-captions, frames at 1/10 s tiled 2×2 and read visually. Scratch files only. Spoken "Semgrep" times come from captions, which mis-hear it as "sam grab", "Smra", "SRAP", "s graph", "SEM grip".

### Summary timeline

| Project | Length | Problem stated by | First live product | Semgrep first **on screen** | Semgrep first **spoken** | Semgrep **finding** shown? | Payoff artifact | Ending |
|---|---|---|---|---|---|---|---|---|
| Darwin | 75 s (silent) | never (no audio) | 0:00 | ~0:55, "Security Scanning (Semgrep + Heuristic Fallback) **40% of Fitness**" | never | **No**, only "Defense 100" | "Apex Predator 98.3" | evolution chart + leaderboard |
| CommitDNA | 134 s | 0:10 | 0:00 | ~0:10, **"Semgrep MCP" chip** on agent 1 | 0:17 | Yes, "Found by Semgrep" XSS card (rule IDs invented, DA #8) | **"B+ 87/100 Backend Fortress Builder"** | README mermaid architecture |
| Udon Cat | 200 s | 0:09 ("fixes can only be done one at a time") | 0:34 | 0:00, header badge **"Powered by Semgrep + Cerebras"** | **0:04** | **Yes, verbatim registry IDs** (`python.lang.security.audit.md5-used-as-password…`) | "8 issues / 8 fixes" in a bolt.new popup | "vibe-secure as you vibe-code" |
| TidyShot | 125 s | 0:11 (slides) | ~1:00 | 0:00, **logo on title slide**; later a small "Semgrep" node under DECIDE in the loop diagram | 1:25, in passing ("runs through Claude, Semgrep and Vanta") | **No.** Findings are PHI fields (medical_record, address, phone_number, patient_id) | "Risk Level: critical", screenshot quarantined | trails off ("that's what we can do") |
| Watchman | 203 s (over limit) | 0:15 | 0:00 (static dashboard for ~70 s) | footer "Powered by Claude AI & **Semgrep**" on the GitHub issue (~2:30) | 1:49 ("s graph") | Count only ("8 findings"); no rule ID visible | Real GitHub issue #40 + PR #41 + Gmail alert at 4:04 PM | dashboard of past scans |
| Stimpack | 74 s | never (opens on the repo) | 0:00 | ~0:20, GitHub check **"Semgrep / semgrep(ci)" failing** | 0:18 | Implicit (red CI check) | Claude Code PR "Auto-fix Semgrep security findings" diff | "makes sure CI passes at the end" |
| IndieCode Shield | 57 s (silent) | never | 0:00 (form) | ~0:30, step "Analyzing code with Semgrep engine…" | never | **Yes**, real ID `dockerfile.security.missing-user-entrypoint…` in a fix prompt | Business Risk Score **"F"** | copy-to-clipboard fix prompt |
| Yoru | 137 s | 0:05 | 0:00 | **never seen in sampled frames** | **never** ("checks for your security flaws") | **No** | a tic-tac-toe game on a Daytona URL | "that's pretty much it" |
| CodeShield | 244 s (over limit) | 0:00 | ~1:05 (GitHub login) | ~1:40, "Scanning codebase with Semgrep…" | 0:33 | Downloadable "Semgrep Security Report" (TXT), not opened on screen | Claude response on the abstracted JSON | music, no close |

### Per-project frame notes

**Darwin** (frames 0–70 s) **[V]**
- 0 s: purple dark UI, "Darwin — Natural Selection to Evolve AI Tools", "Create an email validat…".
- 10–20 s: "Evolutionary Process" cards ("In the crucible of creation…", "the fossil record claims another victim… llama-4-maverick cannot adapt").
- 30 s: three model cards, each showing Defense 100, fitness 98.3 / 97.6 / 97.1, "Apex Predator".
- 50 s: the "Security-First Evolution" panel with Security 100, Vulnerabilities 150, and a red **"40% of Fitness"** pill next to "Semgrep + Heuristic Fallback". System Health "Struggling, Diversity 7%".
- 60–70 s: the "Evolution & Security" chart with a "Security Score (Semgrep)" series.
- Polish is high. No narration, and no vulnerability is ever shown. The Semgrep moment is a label and a weight.

**CommitDNA** (frames 0–130 s) **[V]**
- 0 s: a yellow banner across the top: "Hackathon Demo: Real agent data from @yigitkonur's last 100 commits… **Accelerated Mode for Judges**". Landing page "Turn Your Vulnerabilities Into Strengths".
- 10–40 s: "Multi-Agent Security Analysis", progress 13% → 27% → 41% → 59% → 81%, four columns with chips: **Semgrep MCP**, Claude + Semgrep, Vanta API, Claude 3.5 Sonnet.
- 50 s: grade card **B+ 87/100 "Backend Fortress Builder"**, with 23 / 15 / 8,450 / 12 days.
- 60 s: "Your Top 3 Blind Spots", #1 XSS, **"Found by Semgrep"**, with `dangerouslySetInnerHTML` lines.
- 80–100 s: "Top 3 Strengths", a "Tired Coding" bar chart, and swipe cards (red ✗ VULNERABLE / green ✓ SAFE) on a hard-coded MySQL password.
- 110 s: GitHub README with a mermaid diagram; the sidebar shows "Vanta MCP Server" and "semgrep CLI" tabs.
- Polish is the highest in the set. The webcam bubble adds a person. Everything is disclosed as accelerated.

**Udon Cat** (frames 0–190 s) **[V]**
- 0 s: macOS clock **4:08 PM**, recorded 22 minutes before the deadline. Pink header "Udon Cat — Your Cute Security Companion" with the **"Powered by Semgrep + Cerebras"** badge. Two people in the webcam bubble. Vidyard recorder.
- 20–30 s: path `/Users/ayana/…/aws-secure-agent/bad_file.py`, "Generate Fixes" ticked, "Kitty is sniffing for bugs…".
- 60–70 s: "Bugs Udon Cat Found". **`python.lang.security.audit.md5-used-as-password.md5-used-as-password`** WARNING, lines 21–21, then "Fix Available, high confidence" and "Apply Fix". Next card: `…formatted-sql-query` HIGH.
- 150–190 s: bolt.new "Cute Hello Kitty Game" with `bad_file.py` open. The extension popup "Paste your code, let kitty hunt for bugs!" shows **8 issues / 8 fixes**, cards for `subprocess-shell-true` and `avoid-pickle`, then "Fixed Code" and "Apply Selected Fixes". Clock 4:12 PM.
- Lowest visual polish of the three winners, but the most genuine Semgrep output.

**TidyShot** (frames 0–120 s, phone filming a laptop) **[V]**
- 0 s: title slide with "AWS AI Agents Hackathon 2025", "Powered by Our Sponsors" and **four logos: AWS, Vanta, Semgrep, Neon**.
- 10 s: slide "Why Screenshots Are a Security Nightmare" with **67% / $4.45M / 100%**, "First AI agent that thinks, not just scans".
- 30–40 s: "Autonomous Agent Reasoning Loop", an OODA circle. **Semgrep is a small green pill under DECIDE labelled "Pattern Validation"**, while Vanta MCP sits on ORIENT and Bedrock on top.
- 50–60 s: screenshot of a pediatric medical record. Dashboard **11 total / 7 sensitive / 21 findings / 3 critical**.
- 80–100 s: findings `medical_record`, `address` "20 Winooski Falls Way…", `phone_number`, `patient_id`, each "Detected … in screenshot". Status "critical".
- Strong problem slide and a strong live moment (take a screenshot → it gets caught). **Semgrep never produces anything a viewer can see.** The findings are vision-LLM output.

**Watchman** (frames 0–200 s) **[V]**
- 0–60 s: a static "Security Dashboard" (27 scans / 32 critical / 154 findings) while the speaker explains the problem, so about a minute goes by with no action.
- 70–90 s: Zed editor with `file_handler.py` (`pickle.loads`), `git push`. Terminal: "Starting security scan… **Scan complete: 8 findings**… Stored AI analysis… Created GitHub issue #40… Sending security issue notification".
- 120–150 s: GitHub with 15 open auto-generated PRs. Issue #40 "Security Alert: 3 Critical Issues Found" with footer "Generated by Watchman v1.0 | **Powered by Claude AI & Semgrep**". "Automated Fix Available: PR #41".
- 170–190 s: Gmail "Security Scan Complete: 8 issues found" at 4:04 PM (2 critical / 6 warnings).
- **The most genuinely end-to-end system in the set.** But it is the generic shape (scanner → LLM → ticket), and Semgrep is a footer line.

**Stimpack** (frames 0–70 s) **[V]** A real GitHub PR with failing checks **"Semgrep / semgrep(ci) (pull_request) Failing"**, plus an in-progress job "Auto-fix Semgrep findings with Claude Code". Then the generated PR "Auto-fix Semgrep security findings" with a diff (allow-listed endpoints, `verify=True`, PyJWT algorithms). Clock 4:25–4:26 PM. Raw GitHub UI, no product UI, no persona, no problem statement.

**IndieCode Shield** (frames 0–50 s, **no audio**, mean volume −90 dB) **[V]**
- Onboarding form: "What is the moat of your business?", "We have the most number of indie".
- 4-step wizard with "Analyzing code with Semgrep engine…", then "Your Business Risk Reports", score **F**, and real rule ID `dockerfile.security.missing-user-entrypoint` in a "Generated Fix Prompt".
- The Devpost **custom rules were not shown** (the repo has none; DA §3).

**Yoru** (frames 0–130 s; Windows clock 16:44–16:47) **[V]** "What shall we build together today?", "Build me a tic tac toe game", "Preparing to Execute", streaming HTML/CSS, a Daytona preview-URL warning, then the game link. **No Semgrep panel, badge or scan result in any sampled frame, and the word is never spoken.** The Semgrep gate exists only in the Devpost text.

**CodeShield** (frames 0–240 s) **[V]** 0–40 s: a voice-over plays over a static GitHub login page. About 1:40–2:40 is a loader stuck at 95% ("Semgrep is performing a comprehensive security analysis…", "Scanning codebase with Semgrep…"). Then two downloadable reports and an "AWS Bedrock AI Assistant" panel. At 244 s it runs over the 3-minute limit.

**No video:** security-goons, AgentSafe, AuditArc. The AI-powered security code review video is private. Judges of these projects saw only Devpost text, or a live finalist pitch if they were finalists (AuditArc must have been one, since it placed 2nd overall). **[V]/[I]**

**cln.sh check:** `cln.sh/kwd5YrFm` still resolves (302 → 200), and `commit-dna.pages.dev` returns 200. Frames were read from the identical YouTube copy (round 1 confirmed identical, 134 s). **[V]**

---

## 4. Rubric scorecard (predicted vs. actual)

Scores 1–5 on the event's four criteria, plus Sponsor Fit (SF): how well the project advances Semgrep's product story. "Core" is out of 20. The predicted Semgrep rank ranks by **SF first, then core** (the logic the outcome suggests). It is then compared with ranking by core alone.

| Project | Idea | Tech | Tool Use | Pres. | **SF** | Core | Evidence (one line each: I / T / TU / P / SF) |
|---|---|---|---|---|---|---|---|
| CommitDNA | 5 | 2 | 4 | 5 | **5** | 16 | I: "Duolingo… perfectly customized to you" (1:20) · T: no network calls, 0/5 rule IDs real (DA #7–8) · TU: Semgrep MCP + Vanta MCP + Claude chips (0:10) · P: grade card + swipe + 134 s · SF: MCP + "LLM explainability × deterministic SAST" = blog Trend 2 |
| Udon Cat | 4 | 4 | 2 | 4 | **5** | 14 | I: "vibe-secure as you vibe-code" · T: verbatim registry IDs + applied fix + backup (frames 60–70 s); no rescan · TU: Semgrep only among sponsors · P: badge at 0:00, spoken at 0:04, 200 s (over limit) · SF: browser/vibe-coding surface = blog Trend 3, Replit/Guardian direction |
| Darwin | 4 | 3 | 2 | 3 | **5** | 12 | I: natural selection of LLMs · T: real `semgrep` subprocess added 15:01, random quality, "llama" = Claude (DA #1–6) · TU: Bedrock + Semgrep · P: silent 75 s, polished · SF: Semgrep *decides* which model survives, "40% of Fitness" pill = blog Trend 1 + Assistant model picker |
| AgentSafe | 5 | ? | 3 | 1 | **5** | ~12 | I: MCP-server pre-flight scan · P: **no video** · SF: Semgrep blog Trend 4 wrote it up |
| TidyShot | 5 | 4 | 4 | 4 | 2 | **17** | I: $72k leaked-key incident, screenshots as a blind spot · T: live screenshot → quarantine (50–100 s) · TU: 4 sponsor logos at 0:00 · P: slides + live, phone-filmed · SF: Semgrep is a small "Pattern Validation" pill and is used on OCR text, not code ("Semgrep is designed for code, not extracted text", Devpost) |
| security-goons | 3 | 3 | 2 | 1 | 4 | 9 | SF: Semgrep MCP subagents + supply-chain + rescan gate (Devpost) · P: **no video** |
| Watchman | 3 | 5 | 2 | 2 | 2 | 12 | T: real push → 8 findings → issue #40 → PR #41 → email (70–190 s) · P: ~60 s static open, 203 s, Semgrep only in a footer · SF: re-implements Semgrep's own PR-comment/Assistant/Autofix loop |
| Stimpack | 3 | 4 | 2 | 2 | 3 | 11 | T: real `semgrep ci` failing check + Claude Code PR · P: 74 s, no problem statement, raw GitHub · SF: Semgrep visibly gates CI, but that is stock Semgrep CI + Autofix |
| IndieCode Shield | 3 | 3 | 3 | 1 | 3 | 10 | T: real rule ID on screen; custom rules claimed but absent · P: **57 s, silent** |
| CodeShield | 4 | 3 | 4 | 2 | 2 | 13 | I: "AI never sees your code" · P: 244 s, ~60 s of loader · SF: Semgrep = a downloadable TXT |
| Yoru | 3 | 4 | 2 | 2 | 1 | 11 | SF in demo: Semgrep never seen or said, so the pre-exec gate is invisible |
| AuditArc | 2 | 3 | 4 | ? | 2 | — | I: dashboard aggregator of Semgrep + Harness + Vanta · P: no video (live pitch won 2nd overall) · SF: Semgrep = one feed |

**Predicted Semgrep top 3 (SF first, then core):** CommitDNA, Udon Cat, Darwin, with AgentSafe tied on SF but sunk by no video. **This matches the actual winners exactly.** **[I]**

**Predicted by core alone:** TidyShot (17), CommitDNA (16), Udon Cat (14). That would have given Darwin's slot to TidyShot. **The real outcome rejects that**, which is the main signal: Semgrep's pick tracked sponsor fit, not overall quality. Overall placement tracked core: TidyShot 1st and AuditArc 2nd, both with SF 2. **[V outcome / I mechanism]**

**Disagreements, and why:**
- **AgentSafe** has a top-tier idea and sponsor fit, and Semgrep liked it enough to blog about it six weeks later. It still lost. The only visible gap is **no demo video**. It was also created at 19:58 EDT, 28 minutes past the deadline, so it may have been late or never seen in a finalist slot. **[V facts / I cause]**
- **Watchman** has the best Tech score and lost. Its idea is the commodity "scanner → LLM → ticket" shape that Semgrep already sells, and Semgrep is invisible in its demo. Engineering depth did not buy the sponsor prize. **[I, high]**
- **Darwin** has the lowest core score among the winners (silent video, thin integration) and still won. Sponsor fit was strong enough to carry it. If Darwin took 1st (the gallery and blog orders both list it first, DA §2), then sponsor fit dominated completely. **[I, medium]**

---

## 5. Differentiators

| Factor | Winners (D / C / U) | Matched losers | Verdict |
|---|---|---|---|
| **A new *job* for Semgrep, nameable in 3 words** | fitness function / personal tutor / browser guard | "scanner in a pipeline" (Watchman, Stimpack, IndieCode, AuditArc, CodeShield); "validation step" (TidyShot); "pre-exec gate", but invisible (Yoru) | **The strongest separator.** All 3 winners have it, and only AgentSafe (no video) and arguably Yoru (invisible) among losers **[V/I]** |
| **Maps to a Semgrep product narrative** | Assistant model choice + "deterministic > guesswork" / shift-left coaching / Replit-style vibe-coding scanner | Watchman/Stimpack ≈ Semgrep's own Autofix/PR comments, i.e. a clone, not an extension | Strong. The blog is literally organised as Trend 1/2/3 = D/C/U **[V blog]** |
| **Semgrep labelled on screen in the product UI** | 40%-of-Fitness pill (~55 s) / "Semgrep MCP" chip (~10 s) / header badge (0 s) | TidyShot: a logo on a *slide* plus a small diagram pill; Watchman: a footer; Yoru: none; CodeShield: loader text | Strong. A badge **inside the product**, not on a slide **[V frames]** |
| **Semgrep *decides* the visible outcome** | ranks models / grades *you* / produces the bug list | TidyShot: the outcome is PHI fields from the LLM; Watchman: the outcome is a PR | Strong **[V frames]** |
| **One memorable artifact** | "Apex Predator 98.3" / "B+ Backend Fortress Builder" / "8 issues, 8 fixes" + cat | TidyShot: "critical" + quarantine (good); Watchman: GitHub issue #40; others: a report | Medium. TidyShot had one too, but it wasn't Semgrep's |
| **Persona / charm** | biology narration / Duolingo + swipe / cute cat | mostly none; TidyShot's persona is "security analyst" | Medium |
| **Has a video at all** | 3/3 | security-goons, AgentSafe, AuditArc: none; AI-review: private | **Necessary.** Every no-video Semgrep entry lost Semgrep. AuditArc's 2nd overall came from the live finalist round, which the sponsor prize evidently did not need **[V]** |
| Video ≤ 3 min | 2 of 3 (Udon Cat 200 s) | Watchman 203 s, CodeShield 244 s | **Not decisive.** The limit was not enforced **[V]** |
| Genuineness of the Semgrep call | 1 real but thin, 1 scripted with invented IDs, 1 real | Watchman, Stimpack and IndieCode all real | **Not decisive, even with Semgrep's Head of Product judging** **[V]** |
| Custom rules | none shown | TidyShot built some; IndieCode claimed some | Not decisive (DA §3) |
| Scan → fix → rescan / gate | none rescanned | security-goons, Stimpack, Yoru | Not decisive |
| Number of sponsors | 2 / 3 / 1 | TidyShot 4, CodeShield 4, AuditArc 4 | Inverse for the Semgrep prize. More sponsors meant Semgrep was a smaller share of the story **[I]** |
| Spoken Semgrep in the first 20 s | CommitDNA 0:17, Udon Cat 0:04 (Darwin silent) | Stimpack 0:18; TidyShot 1:25; Watchman 1:49; Yoru never | Medium-weak supporting signal |
| Team size / pedigree | 5 / 1 / 2. CommitDNA is a prolific MCP builder; Udon Cat's author is a serial winner | TidyShot: founder pedigree (Chronicle co-founder, Google TAG). That bought overall, not Semgrep | Not decisive for the sponsor prize |
| Domain | AI-assisted *code* security (all 3) | screenshots/PHI (TidyShot), compliance dashboards (AuditArc), generic agent platform (Yoru) | Strong. Semgrep picked projects about **AI writing code** |
| Submission timing | Udon Cat earliest in the set (17:34 EDT); Darwin's Semgrep code landed at 15:01 PT | no pattern | Not decisive |

### The TidyShot natural experiment (won 1st overall + Vanta, not Semgrep)

TidyShot did more Semgrep-adjacent "work" than Darwin: custom rules, and a measured-sounding "LLM ~15% FP → <1% with Semgrep" claim. It also had a better overall project. It lost Semgrep for five visible reasons, ranked by confidence:

1. **Semgrep was used outside its domain, and its role was a validation side-step.** The Devpost itself says "Semgrep is designed for code, not extracted text from images… created temporary text files for Semgrep analysis". On the reasoning-loop slide, Semgrep is a small pill under DECIDE labelled "Pattern Validation". Vanta, by contrast, has its own MCP node driving ORIENT. **[V frame 30–40 s; Devpost]** High confidence.
2. **No Semgrep output is ever on screen.** The payoff fields (`medical_record`, `address`, `phone_number`, `patient_id`) are vision-LLM extractions. Nothing a Semgrep judge could point at says "Semgrep did that". **[V frames 80–100 s]** High.
3. **The story is a Vanta story.** It is about HIPAA/SOC2 compliance mapping on PHI in screenshots. Vanta's judge got a perfect fit, and TidyShot won Best Use of Vanta. **[V]** High.
4. **It doesn't extend a Semgrep product line.** Semgrep sells Code/Supply Chain/Secrets for *source code*. "Screenshot DLP" is not a direction Semgrep would blog about, and the blog never mentions TidyShot. **[V blog / I motive]** Medium-high.
5. **Spoken once, in passing, at 1:25 of 2:05.** **[V captions]** Medium.

Multi-prize wins were allowed (TidyShot took two). The Semgrep judges simply preferred others. **Overall judges (mostly AWS) reward a vivid business problem plus a live catch. Sponsor judges reward "my product in a starring role I can retell."** AuditArc (2nd overall, Semgrep in its stack as "Semgrep finds insecure code") is a second data point for the same split. **[V outcome / I mechanism]**

---

## 6. Counterfactuals

### Losers: the smallest change that plausibly flips the result

| Project | Smallest flip | Confidence |
|---|---|---|
| **AgentSafe** | Record and attach a 2-minute video showing the Semgrep findings on a real MCP server before connecting. The idea already had Semgrep's endorsement (the blog) | Medium-high |
| **TidyShot** | Name Semgrep's job ("Semgrep is the deterministic referee that kills the LLM's false positives"), and show a Semgrep rule firing on the extracted text with a before/after FP count on screen. Even then it competes with Vanta for the same story | Medium-low |
| **security-goons** | Any video showing `@semgrep-*` subagents and the rescan gate turning green | Medium |
| **Yoru** | One on-screen panel: "Semgrep blocked `subprocess(shell=True)` before execution → agent rewrote it". Say "Semgrep" once. The idea is Guardian-shaped; the demo hid it | Medium |
| **Watchman** | Cut the 60 s static opening. Show the Semgrep rule ID and message in the issue. Give it a framing Semgrep doesn't already sell, e.g. "24/7 watcher for *AI-agent commits*" | Low-medium (commodity shape) |
| **Stimpack** | A product name and a 15-second problem statement; frame it as "self-healing CI for AI-generated PRs" | Low-medium |
| **IndieCode Shield** | Add narration, and actually show one of the custom rules (prompt-injection taint → `llm.generate`) firing. That was a genuinely novel, on-trend rule | Medium |
| **CodeShield** | Cut to 2:30 and make Semgrep the "nothing leaves unless Semgrep-clean" gate on the round-trip | Low |

### Winners: what nearly cost them

- **Darwin.** A silent 75 s video with no finding shown; the Semgrep code landed 90 minutes before the deadline; random quality scores; "llama" is Claude. A judge who asked "show me one Semgrep finding" would have got nothing. **It survived because the framing (Semgrep decides which LLM lives) was the most product-aligned idea in the pool.** **[V]**
- **CommitDNA.** Fully scripted, invented rule IDs, an "Accelerated Mode for Judges" banner. A Semgrep judge recognising `javascript.jwt.security.jwt-hardcoded-secret` as non-existent could have sunk it. **The disclosure banner plus the strongest presentation in the pool carried it.** **[V]**
- **Udon Cat.** It ran 3:20 (over the limit), had no AWS or Vanta despite the "≥3 sponsor tools" criterion, never re-scanned, and was nearly late ("hopefully this finishes before three minutes"; recorded 4:08–4:12 PM). **Real registry IDs and the bolt.new extension carried it.** **[V]**

---

## 7. Why each winner won (verdicts)

### Darwin
1. **A novel framing that Semgrep could retell.** "Deterministic SAST as the selection pressure on LLMs." The blog's Trend 1 paraphrases it and ties it to the Assistant AI-provider picker and Semgrep's own Sonnet-vs-Codex IDOR research. **High** (blog [V]).
2. **Semgrep visibly decides the outcome**, via the "40% of Fitness" pill and a "Security Score (Semgrep)" series. **High** (frames [V]).
3. **A memorable metaphor and polished UI** ("Apex Predator", fossil-record narration). **Medium.**
4. **The live 3-minute pitch** (unrecorded) presumably supplied the narration the video lacks. **Low** (unknowable).

### CommitDNA
1. **The strongest presentation in the pool:** webcam, a grade about *you*, swipe training, all in 134 s. **High** (frames [V]).
2. **The Semgrep MCP chip on agent 1**, at the moment Semgrep was pushing `semgrep mcp`. The blog opens with MCP as "Trend 0". **High.**
3. **Shift-left coaching fits Semgrep's buyer pain** (developer adoption). Blog Trend 2. **Medium-high.**
4. **Honest disclosure** ("Accelerated Mode for Judges") defused the scripted-demo risk. **Low-medium.**

### Udon Cat
1. **A new surface: browser vibe-coding (bolt.new)** with a Semgrep scanner in it. Blog Trend 3, Replit/Guardian direction. **High.**
2. **The most credible Semgrep output on screen:** verbatim registry rule IDs and messages, "Thank you Semgrep". **High** (frames [V]).
3. **Sponsor-first hook.** Badge at 0:00, spoken at 0:04, and the problem framed as a Semgrep gap ("fixes one at a time") without knocking Semgrep. **Medium-high.**
4. **Charm** (the cat, "vibe-secure as you vibe-code"). **Medium.**

**Common cause across all three:** *Semgrep plays a starring, named role in "AI writes code"*, visible in the product UI, in a demo a Semgrep person can retell as a market trend. Depth, honesty, custom rules, rescans and sponsor count did not separate winners from losers.

---

## 8. What this means for tomorrow's Cyberdefense entry (9 Oct 2026)

1. **The same Semgrep judge, Daghan Altas, picked these three.** Round 1 assumed a stricter product judge in 2026. Instead, he is a known quantity who chose framing and fit over depth in 2025. Expect the same taste. Still, don't fake rule IDs: CommitDNA's disclosure banner is what made that survivable. **[V judge list / I taste]**
2. **Give Semgrep a starring job, with a 3-word name, inside an AI-writes-code story.** The "immune system / antibody rule" framing from the master plan qualifies. Say it in the first 15 seconds and put a **Semgrep badge in the product UI**, not just on the title slide.
3. **Make Semgrep's output the payoff.** Show a real rule ID with file:line, and a Semgrep-decided gate or ranking. **Do not let the climax be another sponsor's output**, the TidyShot failure. If ClickHouse, Guild and Pi share the screen, Semgrep's beat must still be the one that *decides* something.
4. **Fewer sponsors in the Semgrep story.** Udon Cat won with Semgrep alone, and the 4-sponsor projects lost Semgrep. Show multiple sponsors for the overall prize, but keep the Semgrep moment uncluttered.
5. **Always ship a narrated video.** Every Semgrep entry without a video lost, including the one Semgrep later blogged about.
6. **Don't open on a static screen.** Watchman and CodeShield burned 40–60 s on screens where nothing happened. Winners showed a live product within 0–34 s.
7. **Map the pitch to a named 2026 Semgrep product** (Guardian, Agentic Workflows, Multimodal, Malware D&R). The 2025 winners mapped onto 2025 product lines (MCP, Assistant model choice, Replit scanner), and the blog made those mappings explicit.

---

## 9. Uncertainties

- **No scorecards, and no tier placement** for the three winners. The "SF first" model fits the outcome but is reconstructed, not observed.
- **Who exactly judged the Semgrep prize** is inferred: Daghan Altas is on the judges list and Jayson DeLancey was on site. Whether they judged from Devpost videos, at booths or in the finalist round is unknown. Which projects were finalists is unpublished, apart from the overall winners.
- **The live pitches were not recorded.** Darwin's silent video in particular may badly under-represent what judges saw.
- Frames were sampled every 10 s at low resolution, so brief Semgrep moments between samples could be missed. Yoru's "no Semgrep" claim rests on 14 frames plus the full caption track, which never says Semgrep.
- Devpost "started this project" times are creation times, not final-submit times, so lateness can't be proven.
- AuditArc member Umar Turdiev shares a surname with judge Jon Turdiev. The relationship was not checked, and it is irrelevant to the Semgrep prize.
- Spoken-mention times rely on auto-captions that mangle "Semgrep". Some mentions may be missed.
- Round-1 code findings (Darwin internals, CommitDNA bundle, rule-ID registry checks) are cited, not re-verified here.
