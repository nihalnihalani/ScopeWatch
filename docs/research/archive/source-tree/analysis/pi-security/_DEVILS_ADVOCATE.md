> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Pi Security: devil's advocate review

Reviewed 8 Oct 2026 (the day before the event). Inputs: `_PI_PROFILE.md`, `_CYBERDEFENSE_EVENT.md`, `_PI_WINNER_MODEL.md`, plus `clickhouse/_TEAM_A.md`, `clickhouse/_TEAM_B.md`, `guild-ai/_TEAM_B.md`, `semgrep/_TEAM.md`, `semgrep/_SEMGREP_PLATFORM.md`. Akash is out of scope.

Labels: **[F]** = I re-fetched it myself today (curl or Firecrawl, 8 Oct 2026). **[I]** = inference. **[U]** = I could not re-verify it.

---

## 1. Fact-check table

| # | Claim in the Pi files | Verdict | My evidence |
|---|---|---|---|
| 1 | Pi raised about $35M, announced June 2026 | **CONFIRMED**, with one nuance | [F] Newswire, "Press Release • Jun 10, 2026": "today announced $35 million in funding led by Brightmind Partners and Third Point Ventures", with George Kurtz and the Armis founders as angels. The release itself does **not** split this into a $10M seed and a $25M Series A ("Series A" appears 0 times). That split comes only from Calcalist, which I did not re-fetch [U]. |
| 2 | "Institutional security memory" is Pi's positioning | **CONFIRMED** | [F] The homepage hero reads "giving your organization institutional security memory and permanently stopping repetitive vulnerabilities". The phrase appears 6 times on the homepage. The press release says "'security brain', which is the organization's institutional product security memory". |
| 3 | Sloane launched on 29 Sep 2026 inside Claude Code | **OVERSTATED** | [F] The 29 Sep 2026 post (by Yoni Ramon and Matan Hason) announces the **Claude Compliance API integration**. In that post Sloane is "Pi's agent running natively in the session". Sloane already existed as Pi's assistant on the homepage, so 29 Sep is when Sloane was announced running **inside** Claude Code, not when Sloane launched. The profile file words this correctly ("Since 29 Sep … also runs"); shorthand summaries of it do not. |
| 3a | (Not flagged before) The same post says "**Nothing is blocked, nothing is proxied**, and nothing sits between the developer and Claude." | **NEW, and it matters for the design** | [F] cc post. Pi's newest messaging is *advise and let the agent self-correct*, not *block*. The Lemonade case study does say Pi "can hold the merge" when a finding crosses a threshold, so blocking is not off-message at the **PR**. But a hard block inside a **coding-agent session** contradicts Pi's own latest line. See §3.4. |
| 4 | No public API, SDK, CLI, MCP server or docs | **CONFIRMED** | [F] `pi.security/docs`, `/api` and `/developers` return 404. `docs.pi.security` and `api.pi.security` do not resolve (curl code 000). `app.pi.security` redirects to `/login?returnTo=%2F`. Every call to action on the homepage is "Get a demo". |
| 5 | Pi's judges are Mike Caballero (Engineering @ Pi) and Rishiraj Chandra (Software Engineer @ Pi) | **CONFIRMED** | [F] The Luma page lists both under "Judges", with LinkedIn links to `/in/michael-s-caballero/` and `/in/rishiraj-c/`. Guy Arazi (Co-Founder & CEO @ Pi) is listed as a speaker. |
| 6 | Pi is listed under "Tools and mentorship", not with the headline partners | **PARTLY CONFIRMED / OVERSTATED as evidence** | [U] LinkedIn blocks Firecrawl ("we do not support this site"), so I could not re-read the organizer's post. [F] On **Luma**, Pi sits in the same "Our Partners" list as everyone else, third of eight, with the tagline "End to End Agentic Product Security". Luma shows no tiering. Guild and ClickHouse are also in the "mentorship" group on LinkedIn, and both have awarded cash prizes at past tokens& events. So "mentorship group" is **weak evidence** that Pi has no prize. |
| 7 | `cyberhack.devpost.com` returns 403 | **CONFIRMED**, and the inference holds up | [F] `cyberhack.devpost.com/` and `/project-gallery` both return 403. Controls I ran: `harness-hack.devpost.com` and `self-evolving-agents.devpost.com` return **200** with the same curl, and a random slug returns **404**. So the 403 is not general bot blocking. It means the challenge exists but is not public, most likely an unpublished draft. |
| 8 | Submission deadline 4:30 PM, hacking starts 11:00 AM (about 5.5 h) | **CONFIRMED** | [F] Luma agenda: "11:00 AM — Kickoff & Hack · 1:30 PM — Lunch · 4:30 PM — Project Submission · 5:00 PM — Finalist Demos + Judging · 7:00 PM — Awards + Closing". Lunch falls inside the window, so real build time is about 5 h. |
| 9 | The four tracks (Threat discovery, Attack intelligence, Autonomous remediation, Continuous defense) | **CONFIRMED** verbatim | [F] On both Luma and tech-week.com. |
| 10 | "$30K+ in prizes, cash and credits" | **UNVERIFIED** | [U] It is not on Luma (0 matches for "prize" or "$30K" in the page source) and not on tech-week.com. It exists only in the LinkedIn post, which I couldn't fetch. |
| 11 | "No past winner did real code-level variant analysis" (the open lane) | **PLAUSIBLE but scoped** | [I] This is true within the 3 sponsors' winner sets analysed in this repo. It says nothing about other hackathons, and Semgrep itself sells "rule generation within minutes" and Agentic Workflows (`_SEMGREP_PLATFORM.md:40,43`). So it is an open lane for **prize history**, not an open lane for **product novelty**. |

---

## 2. Is there even a Pi prize?

**Evidence for one:**
- Pi sends **two judges and its CEO** as a speaker. Sponsors who only "mentor" rarely give up two engineers for a 5-hour judging slot [I].
- At tokens& events, sponsor-staff judges have awarded their own sponsor prizes. Guild's Corbett Waddingham, for example, judged the Guild prize ("Awarded by Guild", `guild-ai/_TEAM_B.md:11`).
- The other "tools and mentorship" names (Guild, ClickHouse) did pay cash prizes in the past (`_CYBERDEFENSE_EVENT.md` §7; `clickhouse/_TEAM_B.md`).
- Pi has just raised $35M and has 7 open roles, including Security Researcher and AI Engineer (Ashby). A hackathon prize is cheap recruiting [I].

**Evidence against:**
- No prize text exists anywhere I could reach.
- Pi has **no product hackers can use**, so "Best use of Pi" can't be judged in the normal "Tool Use" sense.
- The LinkedIn grouping puts Pi in "Tools and mentorship" (unverified by me, §1 #6).

**My estimate [I]:**

| Outcome | Probability |
|---|---|
| Some Pi-judged award exists | 50% (±15) |
| If it exists, it is **themed** ("Best remediation agent", "Best AppSec agent") rather than "Best use of Pi" | ~70% |
| Pi engineers sit on the **overall finalist panel** whether or not Pi has a prize (they are on the general judges list) | ~85% |

**What Nihal should do:**
1. **Do not optimise for Pi alone.** Choose a project whose *spine* is Pi's thesis (find once, fix at the root, never meet it again) but whose *scored prizes* are Semgrep, ClickHouse, Guild and Overall. This hedge is nearly free, because Pi's thesis is also the "Autonomous remediation" and "Continuous defense" tracks almost word for word.
2. At kickoff, before writing code:
   - (a) screenshot the Devpost prize list;
   - (b) ask Mike or Rishiraj directly: "Is there a Pi prize, and what would make you pick a winner?";
   - (c) ask whether one project can win more than one sponsor prize.
3. **If there is no Pi prize**, keep the same project. Drop the Pi-specific copy in the README, keep Pi's vocabulary in the pitch (the Pi engineers are still overall judges), and move the demo time freed up to the Semgrep rule moment and the ClickHouse query moment.
4. **If Pi offers sandbox or API access on the day**, integrating it beats everything below. Re-plan around it.

---

## 3. Attacking Echo

### 3.1 Clone or compliment?

Echo is a **1:1 miniature of Pi's Lemonade timeline**:

| Lemonade timeline | Echo step |
|---|---|
| report lands | report |
| code located | root cause |
| variants found | variants |
| one fix proposed | one fix |
| fix validated | verified |
| memory created | memory and guardrail |

The winner-model file presents this as a strength ("they get us"). The counter-argument:

- **Two Pi *engineers* will judge it against the product they build every day.** They know exactly where Pi's version is hard: dynamic repro against a real product, behavioural (non-textual) variant search, fixes in house style that merge without edits about 60% of the time, and cross-language sweeps. A 5-hour toy covers none of these at depth. Engineers looking at a copy of their own product usually notice what's **missing** before what's present [I].
- Pi's own words cut against the core of Echo's mechanism. Variant search works "by what the code actually does rather than by matching text" (Bugcrowd post), and "Detection is a commodity." An LLM-written **Semgrep pattern is text/AST matching**. A Pi engineer can fairly say "that's the generic scanner approach we position against" [I].
- **Flattery still has value**, though. Hackathon judges reward projects that understand their problem. The deciding factor is whether Echo shows **one thing Pi doesn't publicly claim**, so it reads as "they extended our thesis" and not "they rebuilt our landing page" [I].

**Fix:** keep Echo's spine but add an original twist the Pi engineers can't dismiss as a toy. The best candidate is **"the exploit is the guardrail"**. The stored memory is not only a Semgrep rule but also the **reproduction request itself, replayed as a regression test**. A reintroduction is then caught **statically** (Semgrep) and **dynamically** (the replayed exploit returns 200 again). That answers "by behaviour, not text" directly. It is also cheap: you have already written the exploit for step 1.

### 3.2 Is the full 7-step loop buildable in about 5 hours?

| Step | Effort | Risk | Notes |
|---|---|---|---|
| Seeded multi-tenant app with one shared data-access helper and 4–6 handlers | 45 min | Low | Must be written **during** the event if the "no previous projects" rule applies (it did at Ship to Prod and Self-Evolving). Clarify at kickoff whether a pre-written *vulnerable target fixture* counts. |
| Repro agent (HTTP exploit) | 30 min | Low | Seeded, so an LLM plus `httpx` works. |
| Root cause (handler → helper) | 30 min | Medium | The LLM can do it on a 300-line repo. Its answer is unverifiable unless you show the call path. |
| **LLM → behavioural anti-pattern → Semgrep rule → `semgrep --test` → sweep** | 60–90 min | **High** | See §3.3. |
| Fix at the shared layer + re-run all exploits | 45 min | Medium | Constrain the LLM to edit one file. |
| ClickHouse memory (findings, variants, rules, guardrail hits) | 30 min | Low | |
| Guild agents + approval gate | 60–90 min | **Medium–High** | Past Guild winners landed their Guild code last and thin (`guild-ai/_TEAM_B.md` §2.5). The learning curve is real. |
| Second-run guardrail (PR check or agent hook) | 45 min | Medium | |
| Demo polish, video, README | 60 min | — | Non-negotiable. |

**Total: about 7–9 h for one person and about 4–5 h for three people working in parallel.** As written, the full loop is **not** realistic solo and is **tight** for a team. The winner-model file also includes owner identification, a Slack draft, a GitHub PR and triage/dedupe in Echo's flowchart. Each is another 20–40 min [I].

### 3.3 The step most likely to fail live

**LLM-synthesised Semgrep rule for IDOR.** IDOR is an *absence-of-check* bug: "a query by id with no tenant scope". In Semgrep that needs `pattern-not-inside` or `pattern-not` around a scoping call. LLM-generated rules for this shape commonly fail in one of three ways:
- they fail to parse;
- they match **everything** (40 "variants");
- they match **nothing** once the second variant uses a different ORM call or an aliased helper.

Then an engineer judge asks the obvious live question: "rename the helper / inline the query, does it still catch it?" [I].

Mitigations:
1. Seed variants in **2–3 syntactic forms you have tested in advance against the generated rule**.
2. Run a generate → `semgrep --test` → repair loop with at most 3 attempts, and show the green test on screen. This is also Semgrep's #1–2 winning formula (`semgrep/_TEAM.md`).
3. Cache the rule from rehearsal as a **disclosed** fallback.
4. Have the dynamic exploit replay (§3.1) as the second net, so a rule miss is not a demo miss.

Runner-up failure: Guild session latency or streaming during the 3-minute live slot. Pre-warm it, or show a recorded run with the live one in reserve.

### 3.4 Where the "block" happens

The winner model's climax is "a new PR … gets **blocked**". That works at the PR (Lemonade: "can hold the merge"). But Pi's newest launch, which both Pi engineers will have just worked on, deliberately says *nothing is blocked* inside the coding agent. Two options:
- **PR-level hold** with an inline comment citing the original finding ID and the approved helper. This is on-message.
- **Agent-session advisory.** A Claude Code `PreToolUse`/`PostToolUse` hook returns the memory ("this re-opens ECHO-1; use `scopeToTenant()`"), and the agent fixes its own diff. This is on-message for Pi *and* is Semgrep's Guardian pattern (`_SEMGREP_PLATFORM.md:39`), so it scores with two sponsors. Avoid a hard block here.

### 3.5 Is stacking four sponsors a strength or sponsor bingo?

The evidence is mixed. It favours **stacking with one job per sponsor**.

**For stacking:**
- Guild winners stacked 3–6 sponsors ("universal", `guild-ai/_TEAM_B.md:47`).
- ClickHouse NYC *required* at least 3 sponsor tools (`clickhouse/_TEAM_A.md:38`).
- The organizer's "Tool Use" criterion is worth 20%.

**Against stacking:**
- Udon Cat won Semgrep with **no** other event sponsors (`semgrep/_TEAM.md:31`).
- ClickHouse depth "did not determine whether a team won" (`clickhouse/_TEAM_B.md`, pattern 1).
- VitalSignal's own lesson: "A small, polished project beats an ambitious, half-broken one every time."
- Two of five ClickHouse winners never named ClickHouse in their demo. Stacking without an on-screen moment earned nothing for those sponsors.

**Verdict [I]:** stacking is a **strength only if each sponsor makes one visible decision**. Sponsor bingo happens when the tech is decorative. In Echo as drafted, the risk is Guild, which is described only as "runs agents + approval": exactly the "LLM host" usage that Guild Team B says loses to governance usage. Assign jobs like this:

| Sponsor | Job | On-screen moment |
|---|---|---|
| Semgrep | The deterministic judge of the LLM's rule and fix | Rule YAML, green `--test`, "N variants", then "0 findings ✓" after the fix |
| ClickHouse | The memory that changes the next decision | One aggregate (e.g. `count(DISTINCT finding_id)` of reintroductions per pattern) feeding the guardrail or prompt, with the SQL and its ms on screen |
| Guild | The permission boundary | A fixer agent that, through `pick()`, *cannot* push to main; human Accept for auth code. "The fixer physically can't merge; Guild didn't grant it the tool." |
| Pi | Not a tool. The **thesis and vocabulary** | "a report is a sample, not the finding", "root cause, not symptom" |

Three minutes cannot hold four deep sponsor beats plus a 7-step loop. Budget about 20 s per sponsor moment.

---

## 4. Ranking the alternatives

| Rank | Concept | Pi fit | Build risk (5 h) | Demo wow | Multi-prize reach | Comment |
|---|---|---|---|---|---|---|
| **1** | **Echo-lite + "exploit is the guardrail" + agent-session advisory** (proposed below) | High | Medium | High | Semgrep, ClickHouse, Guild, Overall | It keeps A's 1 → N moment and adds an original twist. The second run lands where Pi's and Semgrep's newest products both live. |
| 2 | A: Echo as specified | High | **High** | High if it works | Same | Too many steps. Failure-prone at rule synthesis. Reads as a clone of Pi's landing page. |
| 3 | D: Undo-proof | Medium–High | **Low** | Medium | Semgrep (custom rule), ClickHouse | The best solo fallback. It lacks the "1 report → N bugs" hook, so pair it with a variant sweep to rescue the wow. |
| 4 | B: Sloane-lite | High on trend | Low–Medium | Medium | Semgrep (Guardian-like), ClickHouse | It is **derivative of two products at once** (Sloane and Semgrep Guardian), and memory is only useful once something has filled it. With no "learn" step it's an advisory lookup table. Its strongest form is merged into #1. |
| 5 | C: Recall (triage) | Medium | **High** | Low–Medium | ClickHouse | It needs a 30-report corpus and many repros. Triage is a hard thing to make dramatic in 3 minutes, and "dedupe" isn't a wow. |

---

## 5. Revised recommendation

**Recommendation: build "Echo-lite". One report becomes a learned rule plus a replayable exploit, one shared-layer fix, and a coding-agent session that is steered away from reintroducing the bug.**

| Claim | Confidence |
|---|---|
| This is the best Pi-aligned choice | **Medium (60%)** |
| This is a good choice overall, since it also competes credibly for Semgrep and ClickHouse | **Medium–High (70%)** |
| The full 7-step Echo can be finished and demoed reliably by a solo builder | **Low (25%)** |

### Minimum viable cut (must be demo-ready by about 3:45 PM)

1. **Target:** a tiny multi-tenant API (FastAPI or Express), written at the event, with a shared `get_record(id)` helper and 5 handlers. Four are IDOR-vulnerable in **2–3 syntactic forms**, and one is safe because it uses the existing `scope_to_tenant()`.
2. **Report in:** paste a HackerOne-style text, then the repro script fires the request (tenant A reads tenant B's invoice → **200**).
3. **Learn:**
   - The LLM states the anti-pattern in one sentence.
   - It writes a Semgrep rule plus `ruleid:`/`ok:` test cases.
   - The `semgrep --test` loop runs (at most 3 tries) until green.
   - The sweep reports "**1 report → 4 bugs**", with file:line for each.
4. **Fix once:** a patch to the shared helper or middleware using `scope_to_tenant()`. All 4 exploits are replayed and return **403**, and Semgrep reports **0 findings ✓**.
5. **Remember:** ClickHouse tables `findings`, `patterns` (rule YAML + exploit request + approved helper) and `guardrail_hits`. Show one query on screen.
6. **Second run, the climax:** a Claude Code session is asked to "add an export-invoices endpoint".
   - A hook runs the learned rule on the written file and replays the stored exploit against the dev server.
   - The hook returns "re-opens ECHO-1; use `scope_to_tenant()`".
   - The agent fixes its own code, and the `guardrail_hits` row appears in ClickHouse.

**Add if time allows, in this order:**
1. A Guild fixer agent with `pick()`-scoped tools and a human Accept gate.
2. A GitHub PR with an inline comment.
3. Owner via `git blame`.
4. A Slack draft.
5. A second language.

**Cut:** triage and dedupe, Jira, multi-repo, CVSS scoring.

**Disclose in the README** ("What's real vs. seeded"): the target app and its bugs are seeded. Rule generation, the sweep, the fix, exploit replay and the hook are live.

### Demo, 3 minutes

| Time | Beat |
|---|---|
| 0:00–0:15 | "A bug report is a sample, not the finding." |
| 0:15–0:45 | The exploit returns 200. |
| 0:45–1:20 | The rule YAML appears, `--test` goes green, "1 → 4". |
| 1:20–1:50 | A one-file diff in the helper; 4 × 403; "0 findings". |
| 1:50–2:35 | The coding agent writes the bug again, the hook pushes back, the agent self-corrects, and a ClickHouse row lands. |
| 2:35–3:00 | Sponsor roll-call (one line each) and the impact line. |

---

## 6. Open questions to resolve at kickoff

1. Does a Pi prize exist? What is its exact wording, and does it require anything Pi-specific?
2. Does Pi offer any sandbox or API (or Sloane access) to hackers? If yes, re-plan around it.
3. Can one project win more than one sponsor prize? (This decides whether the four-sponsor stack is worth its demo time.)
4. Does "built during the event" forbid a pre-written vulnerable target fixture?
5. Is "Tool Use" defined as "at least 3 sponsor tools" (the Ship to Prod wording)?
6. Is the demo live in the room (5:00 PM finalists) or a 3-minute recording, or both? A live run raises the cost of the §3.3 failure.
7. Ask the Pi engineers which they value more: a hard **PR hold**, or the **in-session advisory** their 29 Sep post describes.
8. Still unverified by me: the "$30K+" prize pool, the LinkedIn "Tools and mentorship" grouping, and the $10M seed + $25M Series A split.
