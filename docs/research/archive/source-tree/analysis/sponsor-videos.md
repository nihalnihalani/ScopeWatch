> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Sponsor videos: what each sponsor is pitching right now, and how they demo it

*Prepared 8 Oct 2026 for the tokens& Cyberdefense hackathon (9 Oct). Companion to `WHY_THEY_WON.md` §7.*

**Labels.** **[V]** means verified: it was quoted from an auto-transcript or read from a sampled frame. **[I]** means inferred: it is my interpretation or recommendation. Auto-captions mangle names (for example "Smgrep", "Click House", "Libra chat", "lengthuse"). Quotes are lightly cleaned for those errors only. Transcript timestamps are in 30-second buckets and marked `~`. Frame timestamps are exact to the sampling interval.

---

## 1. Method and coverage

I used yt-dlp to pull `en-orig` auto-subs and metadata. The plain `en` track returned HTTP 429. I converted the subs to timestamped text. For six demo-heavy videos I downloaded 360p video (the `mweb` client, because the default client returned 403) and sampled frames: 1 per 15 s, 1 per 4 s for the 89 s triage video and 1 per 6 s for Insights. I reviewed them as contact sheets. All media is in the session scratchpad, and nothing was committed.

On top of the assigned list I searched by judge and speaker name. That surfaced talks by **judge Dustin Healy**, **speaker Zoe Steinkamp** and **speaker Milan Williams**. Those are probably the most important videos here.

| Sponsor | Video (id) | Date | Length | Views | Transcript | Frames |
|---|---|---|---|---|---|---|
| ClickHouse | Platform for AI: build and run agents on your data, Pete Hampton (yjkQXzj8IAk) | 2026-09-11 | 18:40 | 744 | y | y (75) |
| ClickHouse | Shipping Reliable AI Agents: Langfuse + ClickHouse, Marc (Langfuse) (VBVNMzNu47E) | 2026-09-18 | 21:26 | 853 | y | n |
| ClickHouse | The ClickHouse Platform for AI, Don (agent observability lead) (a3eU9fXUlDk) | 2026-09-17 | 19:16 | 414 | y | n |
| ClickHouse | **Meetup SF: Agentic AI Stack, Dustin Healy (JUDGE)** (Zk0fopZ0zSg) | 2026-03-06 | 21:26 | 304 | y | n |
| ClickHouse | **Build AI Agents w/ Gemini & ClickHouse MCP, Devpost hackathon workshop, Zoe Steinkamp + Andre Maidl** (JIwe_YG6Rys) | 2026-08-19 | 40:57 | 331 | y | n |
| ClickHouse | **Agentic Architecture in Production: Fast Context Retrieval, Zoe Steinkamp** (x-oL9C8FJm0) | 2026-05-12 | 30:11 | 96 | y (skimmed) | n |
| Guild | Guild Agent Triages Production Incident in 52 Seconds (i9CMe3Z8Okc) | 2026-04-07 | 1:29 | 60 | y | y (22) |
| Guild | Quick Start Demo (Hhf09Q-4CUg) | 2026-05-05 | 3:34 | 590 | y | y (14) |
| Guild | CLI Agent Build Demo, "Corey" (6BNId00qxa0) | 2026-05-06 | 3:10 | 192 | y | y (13) |
| Guild | Introducing Guild Insights (RSYzFo2V2jQ) | 2026-08-13 | 2:13 | 43 | music only | y (22) |
| Guild | Why AI Agents Need a Control Plane, James Everingham on TBPN (IwdB-25SSBs) | 2026-03-04 | 11:27 | 435 | y | n |
| Guild | BAM podcast: James Everingham on Building Guild AI (kr07fIo-bhg) | 2026-09-29 | 19:34 | 44 | y | n |
| Semgrep | **TechPod Talks: Daghan Altas (JUDGE)**, "PMF, Secure by Design, Betting on the Models" (czwSnl5uRD0) | 2026-09-30 | 43:31 | 42 | y | n |
| Semgrep | Black Hat USA 2026: SAST + Mythos to Shift Right, Drew Dennison (CTO) (xG3c-uCUNJQ) | 2026-08-26 | 19:02 | 469 | y | y (76) |
| Semgrep | 10 Pilots → 100 Agents panel (Drew Dennison on panel) (pv0EC_8x7j0) | 2026-09-02 | 30:37 | 134 | y (Semgrep parts) | n |
| Semgrep | Introducing Semgrep Workflows (9jPEGY-c6zQ) | 2026-03-18 | 2:28 | 1,038 | y | n |
| Semgrep | Semgrep Multimodal (year-in-review sizzle) (Le4fRMsy_ZQ) | 2026-06-10 | 0:40 | 177 | y (thin) | n |
| Semgrep | **Hacker Summer Camp Highlights: Milan Williams (SPEAKER)** (Y8JbxP4hbX4) | 2024-10-25 | 2:07 | 18 | y | n |
| Pi | **Guy Arazi (CEO) on AI-powered security**, Grace Gong podcast (zeRXxNOz2RU) | 2026-06-12 | 62:29 | 7,591 | y | n |
| Pi | Product-X: "Pi Security $25M Series A" (third-party, **not Pi**) (TnVzlxiYv64) | 2026-08-09 | 9:57 | 129 | y | n |

**Gaps.**
- No first-party Pi Security demo video exists on YouTube that I could find. Pi has no channel, and searches mostly return Raspberry Pi, Pi Securities (a Thai brokerage) and the Pi coding agent. The Guy Arazi interview is the only first-party source.
- The Product-X video sounds like a synthetic or AI-voiced "analyst" show. Treat its claims (sandboxed exploit generation, regression tests, pay-per-fix) as **[I]/unreliable**, and don't quote them to Pi.
- I found nothing recent by Milan Williams (2026) or Corbett Waddingham.
- The Daghan Altas video is a podcast, not a demo.

---

## 2. ClickHouse

**Current pitch, in their words [V]:**
- "**The ClickHouse Platform for AI** is an open, end-to-end stack that gives agents the real-time analytics they demand through MCP, the CLI, and ClickHouse Agents powered by Claude" (description of yjkQXzj8IAk and a3eU9fXUlDk).
- "Nobody does **agentic analytics on real-time data** quite like ClickHouse" (Hampton, ~5:30).
- "This topic of **agentic data access**" (Hampton, ~3:30).
- "You can very much think of all this as the **headless ClickHouse experience**. You bring your agents, your inference, but the data remains in ClickHouse" (Hampton, ~10:00).
- "**Data has gravity**" (Don, ~5:00).

**Architecture they repeat in every talk [V] (frames and transcripts):**
- **Data layer**: ClickHouse, plus Postgres-in-ClickHouse ("milliseconds to microseconds"), ClickPipes and 80+ sources.
- **Connectivity layer**: the open-source MCP server, the Cloud MCP server, agent skills (">40,000 downloads"), Claude Code / Codex plugins and an "agent-native CLI".
- **Agentic layer**: the ClickHouse Assistant, and **ClickHouse Agents** (beta, "brought to market with Anthropic… Claude family exclusively", built on LibreChat, with a code interpreter, skills and shareable artifacts).
- **Side boxes**: ClickStack (infrastructure observability) and **Langfuse** (agent observability and evals).
- **Next**: a **context** layer. All of this closes "**the trust feedback loop**".

**Problem framing [V]:**
- Slide at frame ~4:45: "**Scale**: An agent issues 10–100× the queries a human does. **Cost**: A slow, expensive data layer makes every inference worse. **Performance**: Latency compounds through every tool call in the agentic loop."
- Don's arithmetic (~3:00): "if the agent is calling the database 60 times [at 1 s]… that is 1 minute… in 500 milliseconds… now you're going from 1 minute to 30 seconds."
- Hampton: "a lot of the agents we're seeing are really just **demoware**. Don't really hold up in production" (~17:30).

**Demo structure (Hampton, yjkQXzj8IAk) [V]:**

| Time | Beat |
|---|---|
| 0:00 | Hook: GitHub at 1B commits in 2025, heading for 14× growth ("software factories") |
| ~2:30 | Anthropic's 1M tool-call study: data analysis/BI is #7 at 3.5% |
| ~4:45 | The Scale / Cost / Performance slide |
| ~6:00 | Internal token-usage tile map |
| ~7:00 | 1st-party vs 3rd-party |
| ~10:00 | MCP adoption chart ("doesn't matter how many people told us MCP was dead") |
| ~12:00 | ClickHouse Agents demo: a "UK Real-Estate Advisor" agent with instructions, then skills ("download our colleagues' brains into agents"), then SQL plus code interpreter, then a forecast artifact. Payoff: "would have taken a couple days… now three minutes and 18 seconds" |
| ~17:30 | Trust feedback loop slide: `while(true) {Measure + Influence}`, with Context/Skills ⇄ LLM Observability/Evaluations |

**Demo structure (judge Dustin Healy, Zk0fopZ0zSg) [V].** This is the one to mirror.
1. **One command** (~0:30–4:00): `docker compose up` starts ClickHouse, the ClickHouse MCP server, LibreChat and Langfuse ("the **agentic data stack**"), with health checks so the MCP connects first.
2. Add the ClickHouse Cloud MCP by URL with OAuth (~6:30), then list tools.
3. Ask a natural-language question (~8:00). The agent hits an "Output schema error" and fixes it itself: "**that's what I mean by self-healing**."
4. Langfuse traces (~9:30): "where failures happen, where tool calls happen… who's costing the most tokens."
5. Create an LLM-as-judge evaluator live (~12:30).
6. An artifact renders (~18:30): "I didn't write any SQL."
7. **Payoff** (~19:00): "what I hear a lot about when I go into customer calls is the idea of **auditability**… a read-only shareable view and they get a **chain of custody** for how this was generated… see all the tool calls and know that okay this was the SQL query that made this."
8. Side topics he's excited about (~16:00): **context overflow** ("you can't give the agent millions of rows"), **MCP UI** (a tool returns a UI resource the model never sees) and the code interpreter.

**Zoe Steinkamp (speaker) [V]:**
- At the Devpost hackathon workshop she stayed hands-off: she answered Q&A while Andre built a Gemini ADK agent over the ClickHouse Cloud MCP.
- The query ran in "around three milliseconds" (~29:30).
- Hackathon credits: "about $400 worth."
- In her conference talk: agents "like to query as much as possible… back-to-back querying". She also stressed "**low latency data**… if the data they're getting is old… they'll just spit back hallucinations." She mentioned that Anthropic and OpenAI both use ClickHouse for observability.

**Metrics they brag about [V]:** 1B → 14B GitHub commits; skills package >40k downloads; MCP adoption "took off" in early 2026; Langfuse "21 of the Fortune 50", ">50M SDK installs a month", "petabytes"; queries in milliseconds.

**Implications [I]:**
- Dustin is a LibreChat/agent-UX engineer who now works on the "agentic data stack". He'll reward an agent that **queries ClickHouse through MCP or tools**, **self-heals**, and shows a **chain of custody**: the SQL behind every number.
- Zoe will reward **low latency on fresh data** and agents doing many back-to-back queries.
- "Security memory" maps onto their own word **"context"**: the right context for the agent at the right time.

---

## 3. Guild

**Current pitch [V]:**
- "**The control plane for AI agents.** Build, deploy, govern, and share — the complete agent lifecycle in one platform" (i9CM description).
- Homepage hero, frame 0:00 of Hhf09Q: "**Building AI agents is easy. Managing them isn't.**"
- James Everingham:
  - "Agents are non-deterministic, and you need a **deterministic layer** if you're going to have a stable infra layer" (TBPN ~2:00).
  - "You need to put **guardrails** around them and you need to be able to control them during execution so you can **stop them from doing something bad before it happens, not just debug it after**" (BAM ~1:30).
  - "You need a **new type of identity system to map back to human accountability**" (BAM ~2:30).
  - "Control **what they have access to and what they don't**… observability… what they did, what they touched" (TBPN ~1:00).
  - "**Circuit breakers**… turn this thing off if it gets too hungry" (TBPN ~3:00).

**Product nouns on screen [V]:** Dashboard, Workspace, Agents, Triggers (GitHub issue, Slack, webhook, schedule), Sessions, Credentials, Integrations, Agent Hub, Orchestrator, Insights (Usage / Platform / Audit Logs / Identity tabs), `guild agent init`, "mode multi-turn".

**★ The incident-triage demo (i9CMe3Z8Okc, 89 s): the template for a security entry [V, frames every 4 s]**

| t | On screen | Narration |
|---|---|---|
| 0:00 | Cream title card: "**Your flash sale just broke. Revenue is bleeding and nobody knows why.**" | "**23 customers charged, zero orders fulfilled.** This is a live revenue bleed during an active flash sale." |
| 0:04 | Card: "**By the time your team sees this, Guild's control plane already has the answer.**" | "A Guild agent picks up the ticket the moment it lands." |
| 0:08 | Guild **Workspace Sessions → Triggers** list, with a red-highlighted trigger "Customers charged but orders not going through" | (from the Zendesk ticket) |
| 0:16 | Orange step label "**Investigating Jira**". Zoom on PAY-441/507/512 with highlighted "returns 200 OK to Stripe" | "PAY-507 is the smoking gun, filed yesterday." |
| 0:32 | "**Querying New Relic**". Transaction trace zoom, with highlighted **847** and **$41,200** | "847 transactions… $41,000 in charges, no orders." |
| 0:48 | "**Searching GitHub**". Code diff zoom: highlighted `// TODO: add retry logic here`, `return null` | "A try/catch with a to-do comment swallowing every exception." |
| 1:04 | "**Incident Report**": "P0 INCIDENT — ZD-51204 / PAY-507", ROOT CAUSE (confirmed), **BLAST RADIUS**, **IMMEDIATE ACTIONS NEEDED** (1. HOTFIX with file `src/payments/webhook-handler.ts lines 74-79`, 2. REPLAY, 3. CONNECTION POOL) | "The agent doesn't just find the bug, it **maps the full blast radius, sequences the recovery steps**, and gets the right people moving. The payments lead has a **file path, line number, and a replay plan before they've even opened their laptop**." |
| 1:20 | End card: "**One control plane.**" Guild.ai logo | Description: "**8 agents. 4 integrations. One control plane.**" |

The pattern is: dollar-and-human hook with two numbers → one trigger → 4 labelled tool steps (~16 s each, each with **one highlighted number or line** zoomed in) → a structured report (root cause / blast radius / actions with file:line) → a slogan card. There's no voice-over about Guild features; the UI chrome (Sessions, Triggers) does that work.

**Other demo patterns [V]:**
- **Quick Start (3:34):** sign in → dashboard (token spend) → workspace → add agent → orchestrator chat "what issues do we have open?" → tour of Sessions and Triggers while it runs → back to **Sessions** to see what happened. Payoff: "it went through GitHub and found my two issues."
- **CLI (3:10):** `guild agent init` → agent.ts → "in the GitHub tools, **we're picking just list commits and get commit. We don't need all of the GitHub tools… so those are the only two we're going to load**" (~1:30). This is a least-privilege beat in Guild's own demo. Then a **side-by-side** of the raw GitHub API (JSON, "exit code 1") vs the agent's readable output.
- **Insights (2:13, captions only):**
  - "Measure performance at a glance and optimize what matters across every team, platform, provider, and agent"
  - "Dive deeper with complete runtime visibility"
  - "Cost per run — now $0.39"
  - "Evals programmatically identify opportunities to optimize model usage"
  - "**Control spend automatically with circuit breakers**"
  - "Set rate limits to shut down long-running sessions before they drain the budget"
  - KPI tiles include "SESSIONS 3,847".

**Metrics [V]:** raised $44M (GV lead, Khosla, NFX); "one engineer blew through their entire budget in 12 hours"; built for "45,000 internal developers at Meta" → "45 million developers".

**James's favourite customer agents [V]:**
- A **risk-analysis agent** that runs when CI pulls from source: "how likely is this diff going to take the system down… let low risk diffs go through and a high-risk one stop". He says this "eliminate[s] holiday code freeze".
- A **duplicate-bug agent**.

**Implications [I]:**
- Guild judges itself on three things: agents **triggered by events**, visible as **Sessions**, and **scoped** to the tools they need.
- The incident-triage video is exactly the shape of a security-triage demo.
- The risk-gate agent is a use case the CEO already loves. A security gate on a diff is close to it.

---

## 4. Semgrep

**Current pitch, from the Black Hat 2026 product slide (frame 6:45) [V]:**
- **Guardian** (Prevention): "Detect mistakes and malware, inject guidance to the agent."
- **Multimodal** (Detection): "8× more true positives, 50% fewer FPs."
- **Autofix** (Remediation): "Auto-generated, validated patches. Continuous remediation across repos."
- These are built on **Agentic Workflows** and a **Context Engine** foundation: "Developer feedback, threat models, and business context."
- The "Code Security **Jobs to be Done**" slide (6:00): **Prevent new bugs** (Guardian) / **Harden codebase** (Agentic Workflows) / **Hunt beyond rules** ("Find bugs before attackers do").

**Workflows (2:28) [V]:**
- "The answer isn't more tokens. It's **AI grounded in deterministic code analysis orchestrated in workflows that your team controls**."
- Demo: 4 steps on the OWASP Python benchmark:
  1. Semgrep Code + Supply Chain + a Claude scan in parallel (1,600 findings / 18 packages / ~60 vulns)
  2. **Triage** ("filters out false positives")
  3. Autofix
  4. Create a PR
- "This entire pipeline is defined in code… version it in git."

**Drew Dennison (CTO, Black Hat) [V]:**
- "Shift left simultaneously and **shift right**."
- "Attackers have to be right once. We have to be right all the time."
- "**Your agent rebuilds the codebase from text. Every time.**" (slide 11:30)
- **Mandolin** (program slicing and deep reachability): up to "**100× [fewer] tokens**", answers "in under a second". Slide 14:30: "One graph call replaces a grep, three reads and a follow-up grep."
- **Context Engine** (slide 16:00) has three parts: "**Human**: Capture all the things a model will never know / **Caching**: Don't waste tokens on repeated work / **Memory**: Not all data lives in code." In his words: "memories of like, 'Hey, human looked at this bug before. That one was a false positive.'"
- "This **dynamic loop**… generate an exploit… **massively dropped our false positive rate when we could actually go all the way to a proof of compromise**."
- Results: ">100 run-time verified vulnerabilities over trending OSS projects."
- On the panel: "1 in 1,000 PRs have a critical security bug" and "**scanning the code, triaging it, is it real, verifying that it's real, and then ultimately fixing it**."

**★ Judge Daghan Altas (Head of Product, 30 Sep 2026) [V].** This is the most important framing.
- "LLMs made the **detection** problem an easier problem… that problem has eroded" (~23:30).
- "The game has shifted from 'can we detect these things and put them in the backlog'… to 'okay, how do we close all of this… we got to close it all **today**'. We're on a **tear for velocity**… **how do you close 10,000 tickets?**" (~24:00)
- "What is the **triaging** process? What is the **remediation** process? What is the **proof-of-work** process? So that when somebody comes to you and says 'that malware, we're done with it,' **how do you know you're done? And how fast are you done?**" (~25:00)
- "Giving the **defenders the velocity of defense**, because attack has all the velocity right now" (~25:00).
- "Can we **close the entire loop**, including reporting and proof of work?" (~25:30)
- "If your value proposition is 'AI is terrible at that so I'm going to fix that'… you're giving yourself a **one-year life**" (~27:00). He calls this "**betting on the models**": d(Semgrep value)/d(AI) must be positive.
- "**We work for the models.** Our job is to surface as much signal as we can so that the models can do the best job they can" (~32:00).
- "Models still struggle with **recall**" (~31:30). He frames this through precision vs recall: 9 of 90 found is 10% recall.
- Secure by design: "X-ray the Golden Gate Bridge before the first car… like wait, what?" (~20:00). "The solution is more cultural than technical."
- "PR code reviews from humans… rapidly going to go away… the only way code reviews survive is **architectural threat modeling**" (~40:30–42:00).

**Speaker Milan Williams (2024, Sr PM for Semgrep Code and Secrets) [V]:**
- "**secure guardrails**… see **how many vulnerabilities Semgrep is preventing from hitting production**"
- "helping security teams talk to executives about the value… **how many things they've prevented** and how many things developers are actually fixing"
- "people only see us when crap goes wrong… **showcase your wins**."

**Implications [I]:**
- "Rule learned from one report finds 1 → 4" is still right. It is *Context Engine: Memory* plus deterministic grounding, which is Semgrep's own architecture.
- But don't stop at detection. Daghan explicitly calls detection commoditised. The Semgrep beat must end in **closed + proof of work**: fix applied, rule now blocks the class, `--test` passes, and a time-to-close number.

---

## 5. Pi Security

**Source:** Guy Arazi, co-founder and CEO, in a 62-minute interview (Jun 2026). This is the only first-party source. Pi is ex-MSRC.

**Current pitch [V]:**
- **Origin**: "In MSRC we used to get **hundreds of reports** on a daily basis… you kind of see **the same issues over and over**… is the repo vulnerable, what's the vulnerable code, where does the fix need to take place, **who is even the owner**? It took us hours or sometimes days" (~4:30–6:00). Pi now does it "**between 20 to 30 minutes on average… on scale**… in most cases **70% of the reports are going to be false positive**" (~6:00).
- **Core noun**: "we're reconstructing that into something that we called **institutional memory**… what have you built in the past and what went good and what went wrong… we're using that data in every step of the way" (~14:30).
- **Strategic remediation**: "before we're proposing the fix, we're understanding what are the other **permutations or variants that exist in the same anti-pattern**… providing a **strategic remediation**… the next time someone is going to create another interface that might be causing the same flaw, it's going to get **automatically mitigated**… there's a whole differentiation between **remediation and mitigation**… sustainable over time" (~26:30–28:00).
- **Root cause**: "how can you stop them on the **root cause**… sometimes it can be a **cultural** thing… wrong process in place that makes them repeat the same issue over and over" (~8:30).
- **Lifecycle coverage**: design (threat modelling on the PRD, with comments "directly on Confluence or Notion"), development ("agents that are using the data that we provide"), **code review** (every PR), and **incident response / root-cause analysis** (~9:30–10:00).
- "It's **not retroactive**. Not an after-effect… we're not trying to get adoption for a new interface" (~24:00).
- "**Everyone is a creator… a developer.** How can you make them really understand how you're running security in your ecosystem?" (~17:30)
- **Customer proof**: broken access control at a Bay Area customer, where "within less than **3½ months** they managed to stop almost **80%** of these issues" (~26:00).
- **Category**: "Gartner created a new category called **autonomous remediation**" (~53:00). The budget line is product security / CTO.
- **Product surface** (~48:00): "one single platform with all the data, which is the institutional memory… the **CLI for agents**, the code review, and the remediations of existing findings."
- **Backlog fear** (~32:30): "10,000s of reports… as soon as this report can get leaked, that person… just need[s] to follow the reproduce steps."

**Demo:** none public. Infer a demo from the language: report in → owner and repo resolved → FP or real → variants of the anti-pattern → strategic remediation → the next agent is guided (**[I]**).

**Implications [I]:**
- The playbook's "memory, not detection" is nearly Guy's own thesis. Use **"institutional memory"** verbatim.
- Pi's "variants of the same anti-pattern" **is** the 1 → 4 moment. That beat can serve Pi and Semgrep at once, as long as the two are labelled differently: Semgrep = the deterministic rule that finds them, Pi = the memory that makes sure the next agent never writes it.
- The engineers judging (Mike Caballero, Rishiraj Chandra) build the CLI-for-agents and remediation features. Showing a coding agent being **fed** the memory before it writes code hits their part of the product.

---

## 6. Vocabulary cheat sheet (exact phrases, all [V])

**ClickHouse** (Dustin / Zoe)
1. "agentic data access"
2. "agentic analytics on real-time data"
3. "the agentic data stack" (ClickHouse + MCP + LibreChat + Langfuse), which is Dustin's term
4. "self-healing", for an agent that fixes its own failed query (Dustin)
5. "chain of custody… see all the tool calls… this was the SQL query that made this" (Dustin)
6. "auditability" (Dustin)
7. "An agent issues 10–100× the queries a human does" / "Latency compounds through every tool call in the agentic loop"
8. "the trust feedback loop" / "measure + influence"
9. "the right context… at a very specific time" (Don)
10. "context overflow" (Dustin)

**Guild** (Corbett / James)
1. "the control plane for AI agents"
2. "Building AI agents is easy. Managing them isn't."
3. "a deterministic layer" around non-deterministic agents
4. "stop them from doing something bad before it happens, not just debug it after"
5. "map back to human accountability"
6. "what they have access to and what they don't… what they did, what they touched"
7. "maps the full blast radius, sequences the recovery steps"
8. "file path, line number, and a replay plan before they've even opened their laptop"
9. "circuit breakers"
10. "One control plane."

**Semgrep** (Daghan / Milan)
1. "close the entire loop, including reporting and proof of work"
2. "the velocity of defense"
3. "How do you know you're done? And how fast are you done?"
4. "AI grounded in deterministic code analysis"
5. "we work for the models" / "betting on the models"
6. "prevent new bugs / harden codebase / hunt beyond rules"
7. "prevented from hitting production" (Milan)
8. "secure guardrails" (Milan)
9. "Your agent rebuilds the codebase from text. Every time."
10. "proof of compromise" / "run-time verified"

**Pi** (Guy, Mike, Rishiraj)
1. "institutional memory"
2. "the same issues over and over"
3. "permutations or variants that exist in the same anti-pattern"
4. "strategic remediation"
5. "remediation vs mitigation… sustainable over time"
6. "stop them on the root cause"
7. "not retroactive"
8. "who is even the owner?"
9. "autonomous remediation"
10. "70% of reports are false positive"

---

## 7. Changes to the playbook (`WHY_THEY_WON.md` §7)

**A. Copy Guild's 89-second triage template for the whole video's spine [I].**
- **Hook (0:00–0:08):** a cream card with a two-number human/dollar line, e.g. "**1 bug report. 4 identical holes. 0 people awake.**" The second card: "By the time your team sees this, it's already closed."
- **Trigger (0:08):** the report lands and a Guild **Session** starts (show the Sessions/Triggers chrome, the way Guild's own demo does).
- **4 labelled steps, ~15–20 s each,** with an orange label and **one zoom-highlighted number** per step:
  1. "Triaging report"
  2. "Writing rule"
  3. "Hunting variants 1 → 4"
  4. "Remembering"
- **Structured report card:** ROOT CAUSE / **BLAST RADIUS** / ACTIONS with `file:line`. This is literally Guild's format.
- **Slogan card:** e.g. "Memory, not detection."
- This fits inside 2:30–2:50 with room for a 20-second architecture beat.

**B. Revised 3-word jobs [I]:**

| Sponsor | Old job | New job | On-screen decision |
|---|---|---|---|
| Semgrep | "the immune system" | **"closes the loop"** (keep "immune system" in narration) | Rule from 1 report → `--test` passes → finds 1 → 4 → Autofix/patch → **proof-of-work line: "4/4 closed, rule blocks the class, 0 prevented from hitting prod since"** (Milan's metric). Say "AI grounded in deterministic code analysis." Don't pitch "better detection": Daghan calls that the 1-year-life trap. |
| ClickHouse | "security memory" | **"memory at agent speed"** | Panel showing recurrence and time-to-protection **with ms and rows**, plus a "**show query**" toggle exposing the exact SQL behind each number. That is Dustin's "chain of custody", and it shows the SQL without the console. Bonus: the triage agent reaches ClickHouse **through the ClickHouse MCP** ("agentic data access") and makes several back-to-back queries. |
| Guild | "least privilege" | **"governed, scoped, accountable"** (keep "least privilege" in narration) | Mirror Corey's CLI beat: "this agent loads only 2 tools", shown in agent.ts. Triage *can't* write; the operator approves; a **real `session_url`** links back to a human ("map back to human accountability"). Optional: a circuit-breaker or budget line. |
| Pi | "memory, not detection" | **unchanged; say "institutional memory"** | Closing beat: the *next* coding agent asks before writing a new endpoint, gets the anti-pattern from memory and doesn't reintroduce it. That is Guy's "automatically mitigated" and "not retroactive". |

**C. Pitch-language changes [I]:**
- Swap "detect" for "**close**" everywhere.
- The Devpost tagline could be: "*Turns one bug report into institutional memory: every variant closed, with proof of work, before the next agent writes it again.*"
- Add one time-to-close number. Daghan's question is literally "how fast are you done?"

**D. Guard against conflicts [I]:**
- Semgrep and Pi both claim "variants of the same anti-pattern". Narrate Semgrep as **finding and proving** the variants (deterministic rule), and Pi as **remembering and preventing** them (institutional memory feeding agents).
- ClickHouse is the store under both. Don't let ClickHouse's panel be the payoff of the Semgrep beat (the TidyShot trap still applies).

**E. Talking points for the judges at kickoff [I]:**
- **Dustin:** "self-healing agent over the ClickHouse MCP, with a chain of custody for every number."
- **Zoe:** "fresh data, millisecond queries, many agent queries per report."
- **Corbett:** "an incident-triage agent like your 52-second demo, but for security, scoped to read-only tools, approval-gated writes."
- **Daghan / Milan:** "we close the loop, with proof of work and a prevented-from-production counter."
- **Guy / Mike / Rishiraj:** "institutional memory: the same issue never comes back."

**F. Keep from §7 unchanged:**
- Live product by 0:20.
- The "What's real vs. seeded" README section.
- Cut any sponsor that's broken by 3:30 PM.
- Semgrep run on your own repo.
