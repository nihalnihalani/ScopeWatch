> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Cyberdefense: adversarial ideation, round 1

Prepared 9 October 2026. Scope: one defensive AI project, a conservative five-hour event window, up to four builders. Akash excluded. This round uses the supplied current prize text and the repository's historical research; it does not claim fresh web verification.

## The money constraint changes the recommendation

The current Semgrep award is **Best Vulnerability Detected by Semgrep**, specifically a unique or interesting issue in **AI-generated code**. That is materially different from the older best-use-of-Semgrep award. A clever rule generator or a polished scanner can be an excellent project and still fail this prize's basic proposition.

| Prize | Known top award | What must be visibly real |
|---|---:|---|
| ClickHouse | $1,000 Amazon/Visa gift card + $500 credits | High-volume, low-latency analytics that change detection, remediation or monitoring. Rows and actual query latency. |
| Guild | $1,000 | Agents hosted and run in Guild, with a real session and a useful tool action. |
| Semgrep | $1,000 cash gift card + 20 credits | A defensible, interesting finding in genuinely AI-generated code; actual Semgrep output and a reproducible problem. |
| Pi | Stream Deck + unspecified gift card | Innovation. No product integration is available or necessary. |

**Known top-award arithmetic: $3,000 in cash/gift cards + $500 ClickHouse credits + 20 Semgrep credits, with Pi's hardware and unknown-value gift card additional.** This is a conditional ceiling if multiple sponsor awards can go to the same project, not expected winnings. Credits are not cash. Splitting a team award among four people reduces an individual's share; the event text does not establish the division method.

Stacking is not verified for this event. Historical multi-prize winners show that stacking occurred at other events; they do not establish today's rule. No numeric win probability is justified without current entrants, eligibility decisions, judge preferences and stacking rules. Choose a project that remains compelling for one major prize if stacking is disallowed.

The old Pi and Guild documents' uncertainty about whether prizes exist is superseded by the current prize list. The old overall judging weights and requirement for three sponsor tools are also not established by today's supplied rules.

## What the historical evidence actually supports

The corrected [winner analysis](../winners/WHY_THEY_WON.md) reports that sponsor fit, a human stake, a working demo and explicit sponsor roles discriminated better than integration depth. Argus's real Guild-created ticket and AeroRider's visible ClickHouse route decision are useful models: one clear tool action or changed outcome. Darwin, CommitDNA and Udon Cat used a distinctive Semgrep framing, but their older award does not prove eligibility for today's finding award.

The counterexamples matter. IncidentSherpa used real SQL and still lost ClickHouse; MCP Server Auditor pitched governance and lost Guild; security-goons built a scan/fix/rescan loop and lost Semgrep. A three-logo SOC wrapper is not a winning argument. Historical winners' fabricated scores, hidden mocks and late integrations are weaknesses to avoid, not techniques to copy.

This round scores **fit and execution prospects**, not statistical prize odds. Scores run from 1 (weak) to 5 (strong). Semgrep scores are conditional on finding an actual issue through a normal AI-generation workflow. “Novelty” means distinction from a generic hackathon scanner; none of these scores proves world-first novelty.

## Eight candidates

| Candidate | ClickHouse | Guild | Semgrep | Pi innovation | Five-hour feasibility | Novelty | Demo clarity |
|---|---:|---:|---:|---:|---:|---:|---:|
| 1. **Return to Sender**: approved webhook destination becomes an exfiltration path through redirects or retry state | 5 | 4 | 4 | 4 | 4 | 4 | 5 |
| 2. **Phantom Approval**: an agent's approval is replayed onto a different export after mutable job state changes | 4 | 5 | 4 | 5 | 3 | 5 | 5 |
| 3. **Tenant Time Bomb**: queued/background AI tasks lose the initiating tenant boundary | 4 | 4 | 4 | 4 | 4 | 4 | 5 |
| 4. **Echo / Fix Receipt**: one report yields a rule, verified variants, a shared fix and replayable regression memory | 3 | 4 | 3 | 3 | 3 | 3 | 5 |
| 5. **ToolTrap Flight Recorder**: tool-output prompt injection attempts a forbidden action, then runtime capabilities deny it | 5 | 5 | 2 | 4 | 4 | 3 | 5 |
| 6. **Poisoned Package Trail**: generated dependency/install workflow exposes a supply-chain trust-boundary failure | 5 | 3 | 3 | 4 | 3 | 4 | 4 |
| 7. **Credential Evacuation**: a generated observability helper copies secrets into agent traces, then one fix removes the exposure | 5 | 4 | 3 | 3 | 5 | 2 | 5 |
| 8. **Patch Referee**: competing AI fixes are judged with Semgrep plus behavior and telemetry before one approved patch ships | 3 | 5 | 2 | 3 | 2 | 2 | 4 |

### 1. Return to Sender: best balanced starting hypothesis

**Persona and story:** A small support team gives an AI agent a webhook/export service. The agent sends synthetic customer records only to an approved host. A redirect, stale retry URL or URL parsing inconsistency turns that apparently safe callback into an internal-service request or a canary data transfer.

**The generation experiment:** Ask a coding model for a useful support webhook/export feature with tenant scoping, delivery retries and an allowed-destination list. Do not ask for an insecure implementation. Save the exact prompt, model/version, original output and timestamp. Inspect what is actually generated; select the demonstrated flaw rather than inventing a promised vulnerability.

**Minimal live proof:** An approved callback responds with a redirect to a local, controlled service. The pre-fix exporter follows it and a fake sensitive marker appears at that service. After the patch, the same request is denied, and an ordinary callback still succeeds. If the generated code already handles redirects safely, do not alter it to manufacture a discovery: try a different legitimate feature request or select another candidate.

**Sponsor jobs:** Semgrep identifies the source-to-request or unsafe redirect-handling pattern with file/line; ClickHouse correlates live callback/redirect/egress records with a larger labelled synthetic stream and identifies the affected integrations; Guild runs a read-only investigator and, following approval in the app, a scoped operator disables the **local demo** integration or opens a real issue. Pi judges an original composition of an agent, deferred delivery and the URL trust boundary.

**Why it can win:** The demo shows “approved destination” becoming “unapproved destination” in seconds, then the fix restoring the boundary. ClickHouse is essential to blast-radius calculation and detection, not a historical memory table with six records.

**Disqualifier:** It is only generic SSRF, only a seeded vulnerable example, or Semgrep does not actually flag the vulnerable code. A dashboard calling an LLM to say “this looks suspicious” is insufficient.

**Mitigation:** Show the multi-step chain and its provenance. Use a local rule if needed, but explicitly distinguish a custom rule developed after diagnosis from an existing rule that originally discovered the issue. If only the custom rule detects it, ask the Semgrep mentor whether that qualifies before claiming it does. Validate a benign delivery, a denied redirect and the exact pre-fix exploit.

**Scope guard:** Select **one** failure mechanism: redirects **or** retry-state mutation. Do not attempt redirect handling, DNS rebinding, all private-IP families, signed callbacks and a new proxy in five hours.

### 2. Phantom Approval: strongest Guild/Pi story, highest semantic risk

**Persona and story:** A SOC analyst approves “export tenant A's incident summary.” A queued job reads mutable export parameters later, or a reusable approval token authorizes a new job. The agent consequently exports tenant B's report or a larger dataset using approval that never covered that action.

**Minimal live proof:** Show the approved action digest next to the executed digest. They differ before the fix. The fixed system binds approval to tenant, immutable action parameters and one execution; replay or changed parameters are rejected while the intended export succeeds.

**Sponsor jobs:** Guild holds and runs two agent roles; the app's authenticated approval dispatches the operator session. ClickHouse joins approved/executed actions by approval ID and detects a mismatch among a synthetic event backlog plus fresh events. Semgrep flags the concrete unsafe use of a mutable job object or approval token. Pi sees a novel “the agent respected approval yet violated its meaning” failure.

**Why it can win:** It moves beyond generic prompt injection and creates a memorable real capability-boundary failure. A human approval checkbox becoming unsafe is immediately understandable.

**Disqualifier:** The team claims Guild's own approval or policy system is vulnerable when the problem is in its application, or Semgrep can only detect an arbitrary toy function name. A prompt telling the model “do not reuse approvals” is not a security fix.

**Mitigation:** Describe it as an AI-generated application defect. Scope the vulnerable flow to one function/file so OSS Semgrep can inspect the relevant logic, but do not rewrite already safe generated code to force eligibility. The enforcement belongs in deterministic application authorization. Custom-rule detection plus behavior can establish a useful project, but finding-award eligibility is uncertain.

**Scope guard:** One mutable field and one replay. Implement either action binding or one-time consumption robustly enough to prove the selected mechanism; do not promise a general-purpose approval platform.

### 3. Tenant Time Bomb: best narrow application-security path

**Persona and story:** An AI-created multi-tenant export API checks a tenant at request time but passes only a record ID into a background worker. The worker's later lookup ignores the original tenant, or reads a task-local/global tenant that another request changed.

**Minimal live proof:** Two synthetic tenants. Tenant A's delayed export contains tenant B's marker before the fix. Passing explicit immutable tenant context into the worker and performing an authorized lookup prevents the leak; tenant A can still export its own data.

**Sponsor jobs:** Semgrep highlights the actual unscoped lookup or propagation defect; ClickHouse correlates request tenant, task tenant and returned object tenant to find affected jobs; Guild investigates and opens one actionable issue with a scoped integration. Pi innovation comes from temporal authorization instead of another static IDOR scanner.

**Why it can win:** Small fixture, clear victim, clear before/after, credible bug class. It is easier to keep the target and behavior tests small than a whole autonomous SOC.

**Disqualifier:** It is ordinary missing tenant filtering with no delayed-context mechanism, or the team advertises a whole vulnerability class as eliminated because one demo passes.

**Mitigation:** Show the delay boundary explicitly and record every principal/object relation. A custom Semgrep rule should identify the behavior present in the example, not claim universal IDOR detection. Show ordinary background work still works after the patch.

**Scope guard:** One queue implementation, two tenants, one export. No distributed broker or real customer system.

### 4. Echo / Fix Receipt: strongest fallback product, weaker finding award

One report becomes a validated Semgrep rule, several variants, a root-cause patch, saved exploit replay and an advisory supplied to a later coding agent. This builds on the repository's existing recommendation. Its genuine advantage is **proof that the known behavior no longer works**, not simply “0 findings.”

Use real ClickHouse security events at scale to calculate affected endpoints and prioritize the patch; a table storing five learned rules is a weak fit for today's explicit scale/latency rubric. Use one real Guild triage session and one scoped write if available.

**Disqualifier:** The target flaws were intentionally authored to teach the rule, which does not establish a unique issue found in AI-generated code. Also, Pi already publicly pitches institutional memory, variant analysis and strategic remediation; reproducing that feature list is not inherently innovative.

**Mitigation:** Run the finding-first experiment before choosing the target; preserve the generation provenance; add one behavioral distinction that a syntax-only scanner misses. Cut live LLM rule synthesis if it endangers the demo, and label any cached generated rule. Do not pitch “every variant” or “never returns” beyond tested coverage.

### 5. ToolTrap Flight Recorder: strong ClickHouse/Guild specialist

A fetched support document contains an instruction to call a forbidden export tool. A real Guild-hosted agent's available tools cannot execute that action. ClickHouse joins document origin, agent session, tool attempt and denial across high-volume traces, exposing campaign recurrence and the target's blast radius.

**Disqualifier:** The barrier is only a system prompt, or the claimed denial is a local fake presented as Guild policy. Prompt injection by itself may have no Semgrep-detectable code finding, and this space is crowded.

**Mitigation:** Show a real scoped toolset and the actual failure; label local app controls accurately. Make one distinctive failure mode the story, such as a shared export helper ignoring a user's scope. If that code finding is absent, deliberately optimize this project for ClickHouse/Guild instead of forcing Semgrep in.

### 6. Poisoned Package Trail: potentially current, fragile in five hours

An AI-created build or agent-plugin installer trusts a mutable dependency name, unverified artifact or shell script fetched from a URL. The defense reconstructs package provenance and install-to-process-to-egress behavior; Semgrep catches an actual unsafe install/script execution path. The AI proposes a pinned, verified replacement and Guild opens the remediation issue.

**Disqualifier:** It becomes a generic CVE news summarizer; the issue is merely a fabricated package name rather than a code vulnerability; or it relies on executing unknown real packages on the host.

**Mitigation:** Use controlled package/artifact fixtures and preserve normal AI generation. Prove a canary process or network event, not malware detection broadly. Drop external package intelligence if it consumes the build window. The evidence base and current trend importance require fresh research before ranking this above the top three.

### 7. Credential Evacuation: safest completion, weakest uniqueness

A generated agent wrapper logs headers, context or environment-derived credentials into traces. Semgrep highlights the exposed-data path. ClickHouse traces where a **fake** secret propagated and how many sessions contain it; Guild hosts the investigator. A deterministic redaction/allowlist fix closes the demonstrated leak and passes benign trace tests.

**Disqualifier:** A hardcoded key in a sample is all the finding consists of, or the app itself copies real secrets into ClickHouse to showcase the problem. This is likely too ordinary for “most unique or interesting” unless the propagation mechanism is unusual.

**Mitigation:** Demonstrate an indirect dataflow, such as exception serialization or shared retry diagnostics bypassing an existing redactor. Use canaries only. Treat this as the high-reliability fallback if the more interesting finding experiments fail.

### 8. Patch Referee: deprioritize

Multiple agents produce patches; Semgrep and behavioral tests choose which can ship; Guild supplies scoped execution and an operator. ClickHouse stores trial outcomes and decision latency.

**Why it ranks last:** Darwin already framed Semgrep as a fitness function. The project needs several slow LLM calls, fixture tests and patch application while its ClickHouse data volume is tiny. It can win a best-use prize in another event but is poorly aligned with today's finding prize and analytics-scale rubric.

**Disqualifier:** The winner is hardcoded or random, “0 findings” is the only acceptance criterion, or an unsafe patch wins because it deletes the vulnerable feature.

**Mitigation:** One patch plus proof is better use of the same time here. Keep a patch tournament as a future feature, not the hackathon spine.

## What can defeat every candidate

| Attack on the pitch | Why it matters | Required answer |
|---|---|---|
| “You asked the model to write an insecure example.” | Invalidates the AI-code discovery narrative. | Exact unleading generation prompt/output, event timestamp, immutable original commit. Seeded benchmark fixtures separately labelled. |
| “Your custom rule was written after you knew the bug.” | Detection mechanism and discovery attribution are different. | State exactly how the issue was first recognized and how Semgrep confirmed/found it. Confirm custom-rule eligibility with the sponsor. |
| “You only have seven ClickHouse rows.” | Today's rubric explicitly names data scale and response latency. | Labelled representative synthetic backlog plus real current events, verified row count and timings, and one query affecting a decision. No minimum scale invented. |
| “Those milliseconds came from a label.” | A fabricated benchmark is easy to test. | Measured query execution and end-to-end detection/action latency separately, reproducible query, hardware/cloud context. No claimed production SLO. |
| “Your agent is hosted somewhere else.” | A wrapper around an external pipeline weakens Guild's exact prize. | Published Guild agent, session URL, tool invocation and useful result. Honest ownership of backend behavior. |
| “Your approval is just a button.” | UI intent is not authorization. | Authenticated approval identity, immutable approved action, fail-closed state transition; then a scoped operator. Do not attribute app enforcement to Guild. |
| “The LLM guessed a threat.” | No demonstrated security efficacy. | Deterministic event predicate and a reproduced behavior; LLM explains or proposes the bounded fix. |
| “It prevents everything now.” | One proof does not establish universal coverage. | Name the tested mechanism, positive and negative controls, and coverage boundaries. |
| “This existed before the hackathon.” | Violates the supplied build-during-event requirement. | Research/preparation separated from implementation; project and original target committed during the event. |
| “It is another AI SOC.” | Saturation defeats innovation. | One domain-specific failure and one memorable changed result, rather than an alert wall plus chatbot. |

## Selection and kill gates

**Round-1 recommendation:** Run a short, parallel **finding-first experiment** on Return to Sender, Phantom Approval and Tenant Time Bomb. Pick the most interesting issue that actually appears in normal AI-generated code and that Semgrep can genuinely demonstrate. Do not spend the afternoon proving a vulnerability that exists only in the pitch.

Proposed operational gates, not evidence about actual build times:

1. **First 30 minutes:** Normal generation prompt, saved provenance, minimal local exploit and an initial Semgrep path. Also confirm stacking, custom-rule eligibility and event start time. No project implementation before the event.
2. **By 12:30 PT:** One working exploit/fix contrast and a real Guild session or a decision to deprioritize that sponsor. If no interesting Semgrep finding exists, switch to ClickHouse/Guild-led ToolTrap or the credential-trace fallback.
3. **By 2:00 PT:** Live ingress to ClickHouse and one query causing a changed decision; a fresh-event indicator, measured query time and verified count. Keep synthetic throughput and real exploit events distinct.
4. **By 3:15 PT:** End-to-end happy path works twice. Freeze the scope; start recording, evidence packaging and write-up.
5. **By 4:10 PT:** Video link, accessible repo, team/contact details and evidence attachments checked. Submit with buffer before 4:30 PT.

With four people, assign target/exploit/fix, telemetry/ClickHouse, Guild/backend, and UI/demo/provenance. With one person, target **two monetary tracks**, not all three: one genuine finding with one live telemetry-to-action path, leaving at least the last hour for the submission. Pi remains eligible on innovation without any integration work.

## Evidence used in this round

- Current event and award details pasted by the user: authoritative for this recommendation unless the organizer updates them.
- [WHY_THEY_WON.md](../winners/WHY_THEY_WON.md): corrected cross-event winner/loser analysis; causal conclusions remain inference without scorecards.
- [MASTER_REPORT.md](source-tree/analysis/MASTER_REPORT.md): historical synthesis, superseded where corrected by the later winner report or current prize text.
- [Pi adversarial review](source-tree/analysis/pi-security/_DEVILS_ADVOCATE.md): clone risk, exploit-as-regression memory, five-hour scope critique. Old prize uncertainty superseded.
- [Semgrep adversarial review](source-tree/analysis/semgrep/_DEVILS_ADVOCATE.md): custom rules and scan/fix loops did not guarantee prior awards; OSS/MCP and latency pitfalls.
- [Guild platform research](source-tree/analysis/guild-ai/_GUILD_PLATFORM.md) and [Guild adversarial review](source-tree/analysis/guild-ai/_DEVILS_ADVOCATE.md): hosted sessions, `pick()` scoping, registry friction and approval ownership. Product details need current verification before coding.
- [ClickHouse adversarial review](source-tree/analysis/clickhouse/_DEVILS_ADVOCATE.md): real query decisions, synthetic-data honesty, engine correctness and counterexamples.
- [Sponsor videos](source-tree/analysis/sponsor-videos.md): proof of closure, useful governed actions and explicit numbers. These are communication cues, not a substitute for today's award wording.

Next rounds should challenge the selected finding, its observability evidence and sponsor dependence, then cut the architecture against the clock.
