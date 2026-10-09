---
source_url: "https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T20:00:32.463977+00:00"
normalized_at: "2026-10-09T07:47:21.936759+00:00"
reuse_of: ".firecrawl/completion-root-susvibes-september.md"
source_kind: "dated research"
published_date: "2026-09-29"
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "b135f253647cc0b1e364c8ef378de8527e617ab142061cf09d9fa4f24fd422ca"
body_sha256: "efa9a3275699b6394ecdae068732ebc9e91ba733cfa8ba6dff9fcbbb78f2d79f"
---

# Claude Opus 5.5 Writes Working Code but Only Half of It Is Secure

We ran Claude Opus 5.5 on 186 real CVE tasks. It wrote working code 94% of the time, but secure code only 55% of the time.

![profile image](https://semgrep.dev/assets/people/dr-katie-paxton-fear.jpg)

Katie Paxton-Fear

[![linkedin logo](https://semgrep.dev/build/assets/linkedin-BOc8hy7f.svg)](https://www.linkedin.com/in/katiepf/)



September 29th, 2026


Table of Contents

* * *

1. [How SusVibes Tests for Secure Code](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/#how-susvibes-tests-for-secure-code%C2%A0)
2. [Over Half of Opus 5.5’s Solutions Were Likely from Memory](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/#over-half-of-opus-5.5%E2%80%99s-solutions-were-likely-from-memory)
3. [How Memorisation Weakens Open-Source Benchmarks](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/#how-memorisation-weakens-open-source-benchmarks)
4. [Solutions Produced via Reasoning Are 20% Less Secure than from Memory (64% vs. 51%) and Sometimes the Memory Was Vulnerable Code](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/#solutions-produced-via-reasoning-are-20%-less-secure-than-from-memory-(64%-vs.-51%)-and-sometimes-the-memory-was-vulnerable-code%C2%A0)
5. [Opus 5.5 Excels at a Few Security Weaknesses, like Incorrect Authorisation (CWE-863), While It Still Struggles with the Rest](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/#opus-5.5-excels-at-a-few-security-weaknesses,-like-incorrect-authorisation-(cwe-863),-while-it-still-struggles-with-the-rest%C2%A0)
6. [What This Means If Your Developers Use AI Coding Agents](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/#what-this-means-if-your-developers-use-ai-coding-agents)

**TL;DR.** We ran Claude Opus 5.5 through all 186 tasks of SusVibes, a benchmark built from real vulnerabilities in open-source Python projects. It produced working code on 93.5% of tasks, but only 54.8% were both working and secure. That score would place first on the public SusVibes leaderboard as it stands as of our runs (26th September 2026), and a large part of it is memory. 53% of Opus's solutions, including 56% of its secure ones, are near-identical to the project's real code. Opus didn't technically cheat, it had no internet access or repository access, so it wasn’t looking anything up. It was reproducing code it had already seen in its training data. That makes any benchmark built from public CVEs a weaker measure with every new model: the tasks stay fixed while their answers keep flowing into training data. If you're judging how secure AI-generated code is , "the model scores well on a CVE benchmark" and "the model writes secure code it hasn't seen before" are two  different claims.

## **How SusVibes Tests for Secure Code** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/\#how-susvibes-tests-for-secure-code%C2%A0 "How SusVibes Tests for Secure Code ")

[SusVibes](https://github.com/LeiLiLab/susvibes) ( [paper](https://arxiv.org/abs/2512.03262)) takes 186 real CVEs (Common Vulnerabilities and Exposures) from open-source Python projects and turns each one into a feature request. The benchmark deletes the code that implemented the feature, including the part where the original developer introduced the vulnerability, and asks an agent to write it again. The task description never mentions security beyond a one-line generic reminder (which already offers the kind of hint that a developer heavily utilizing AI coding tools may never use).

Each solution is then scored twice:

1. Functional: the project's own test suite runs. The solution passes if it breaks no more tests than the reference implementation.

2. Security: the tests that shipped with the CVE fix run. The solution passes if it isn't vulnerable to the original bug.


The final scoring metric counts a task only when the solution is “correct and secure”. A solution that works but reintroduces the vulnerability scores zero.

We ran Claude Opus 5.5 under SWE-agent 1.1.0 using the leaderboard's standard protocol: the canonical SusVibes prompt, the generic security reminder, and a 200-call limit per task. And while it beat out both its predecessors and OpenAI’s entries, digging into the data proves it’s not _quite_ as clear as “new model better.”

![Opus 5.5 on all 186 SusVibes v1.0 tasks. Of the remaining 12, 10 were incorrect and two produced an empty or unscorable patch.](https://semgrep.dev/assets/opus-5.5-on-all-susvibes-v1.0-tasks.png)
Figure 1. Opus 5.5 on all 186 SusVibes v1.0 tasks. Of the remaining 12, 10 were incorrect and two produced an empty or unscorable patch.

Functional correctness is essentially solved, rarely did Opus produce pure slop that was not functional. Of the 12 tasks Opus didn't get right, only about six are genuine functional failures. The rest are some broken tasks nobody can pass or one task where the model ran out of output room mid-thought.

Security is a different story. Of the 174 solutions that worked, 72 still contained the vulnerability the benchmark was built around. That's 41% of working solutions shipping the original bug.

For context, 30 standard submissions already sit on the [SusVibes v1.0 leaderboard](https://leililab.github.io/susvibes-leaderboard/#leaderboard). The best correct-and-secure score among them is 43.5% (GPT-5.5 with mini-swe-agent). Claude Opus 4.8 under SWE-agent scored 19.4%. At 54.8%, Opus 5.5 would place first by roughly 11 points. And a huge jump from its predecessors.

![SusVibe’s top 5 results from their leaderboard and Claude 4.8](https://semgrep.dev/assets/susvibes-results.png)
Figure 2. SusVibe’s top 5 results from their leaderboard and Claude 4.8

But we do have some caveats:

- Our runs used the current SusVibes prompt, which adds an anti-cheating block that earlier submissions didn't have.

- We had to fix harness problems (described below) that could plausibly have depressed earlier scores too.


Here’s the problem though, this is a well known benchmark, on open source projects, so while we implemented the anti-cheating block, the AI model could still ‘cheat’ (or perhaps a better term might be benchmark-rote-memorisation) by simply memorizing the correct answers.

## **Over Half of Opus 5.5’s Solutions Were Likely from Memory** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/\#over-half-of-opus-5.5%E2%80%99s-solutions-were-likely-from-memory "Over Half of Opus 5.5’s Solutions Were Likely from Memory")

SusVibes tasks come from public projects, and the fixes for those CVEs have been public for months or years. A model trained on public code may have seen the vulnerable version, the fixed version, or both. So we measured how closely each of Opus's solutions matched the project's real implementation, comparing only the lines each patch adds to non-test files, with whitespace and comments ignored. Now this isn’t a guaranteed sign that the code was recalled rather than written securely.

53% of Opus's solutions (93 of the 176 we could judge) were identical or near-identical to the real code. In the most extreme cases the match was essentially character for character. On one pysaml2 task, Opus reproduced 54 lines of signature-handling code with a similarity of 1.00. On a Django task it wrote 145 lines of `django/utils/http.py` in a single step, 99% matching the original.

There wasn’t any ‘cheating’ in play here, technically: no git history, no installed copies of the package, no network access. It read the file with the feature removed, read the tests, and wrote the code back from memory. So while Opus never went looking for the fix, the effect is the same as if it had: for more than half of the tasks, it already knew the answer, so the benchmark wasn't measuring whether it could work the answer out.

That matters for the security score in a specific way. 57 of Opus's 102 secure solutions (56%), were memorised, and 36 of those reproduce the CVE fix's own lines. A large part of the headline number is the model recalling code someone else already secured.

![Where the secure solutions came from. ](https://semgrep.dev/assets/where-the-secure-code-came-from.png)
Figure 3. Where the secure solutions came from. "Memorised" means a similarity of 0.80 or higher to the project's real code.

### **How Memorisation Weakens Open-Source Benchmarks** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/\#how-memorisation-weakens-open-source-benchmarks "How Memorisation Weakens Open-Source Benchmarks")

SusVibes has a fixed set of tasks, and every one of them comes from a public repository with a public fix. Each new model is trained on more public code than the last, which means more of those fixes. The tasks stay the same while the chance that a model has already seen the answer keeps rising.

Our data suggests this is well under way. Memorisation isn't confined to old CVEs:

| CVE fixed in | Solutions memorised | Near-verbatim copies (similarity 0.95 or higher) |
| --- | --- | --- |
| 2014 to 2019 | 58% | 31% |
| 2020 to 2021 | 60% | 25% |
| 2022 | 37% | 9% |
| 2023 to 2024 | 57% | 18% |

Near-verbatim copies are most common for the oldest CVEs, which fits the idea that the longer a fix has been public, the more completely a model absorbs it. But even for CVEs fixed in 2023 and 2024, 57% of Opus's solutions were already memorised. The year-by-year pattern isn't a clean line (2022 is the outlier). The point is simpler: a lot of the tasks in this benchmark are already in the model's training data.

The consequence is that scores on a public-CVE benchmark will keep climbing whether or not models get better at secure coding, and a newer model's higher score can't be read as better security judgement without first checking how much of it is recalled rather than reasoning.

### **Solutions Produced via Reasoning Are 20% Less Secure than from Memory (64% vs. 51%) and Sometimes the Memory Was Vulnerable Code** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/\#solutions-produced-via-reasoning-are-20%-less-secure-than-from-memory-(64%-vs.-51%)-and-sometimes-the-memory-was-vulnerable-code%C2%A0 "Solutions Produced via Reasoning Are 20% Less Secure than from Memory (64% vs. 51%) and Sometimes the Memory Was Vulnerable Code ")

Opus 5.5 showed evidence of reproducing code from memory, especially when the memory reproduced vulnerable code verbatim. There is a significantly different result of whether the solution was secure when the code was reproduced verbatim from memory versus when it was produced via the model’s reasoning.  The outcome follows whichever version Opus recalled:

![Memorised solutions by which version of the real code they reproduce. For another 30 memorised solutions the lines didn't clearly match either version; 60% of those were secure.](https://semgrep.dev/assets/memorised-solutions-by-which-version-of-the-real-code-they-reproduce.png)
Figure 4. Memorised solutions by which version of the real code they reproduce. For another 30 memorised solutions the lines didn't clearly match either version; 60% of those were secure.

Opus didn’t just recall the fixes, it often recalled the pre-fix too, reproducing the original vulnerability. When Opus remembered the patched code, it was secure four times out of five. When it remembered the code as it was before the fix, it was almost always vulnerable. It wasn't evaluating either version. It reproduced whichever one it had absorbed. Split the whole benchmark into memorised and non-memorised solutions and here’s what you get:

![Memorised solutions (similarity to the real code of 0.80 or higher) against solutions Opus wrote itself. Secure rates are over functionally correct solutions; some bars rest on fewer than 10 tasks.](https://semgrep.dev/assets/memorised-solutions-against-opus-written-solutions.png)
Figure 5. Memorised solutions (similarity to the real code of 0.80 or higher) against solutions Opus wrote itself. Secure rates are over functionally correct solutions; some bars rest on fewer than 10 tasks.

- Overall: memorised solutions were secure 64% of the time and 51% of the time for solutions Opus wrote itself.

- Small fixes look like real skill. When the real fix was one to four lines, memorised and independent solutions were secure at nearly the same rate (77% and 73%). For fixes over 50 lines, memorised solutions held at 60% while independent ones fell to 33%. Opus gets large, multi-part security fixes right mostly when it remembers them.

- The age of the CVE flips the effect. For CVEs fixed in 2019 or earlier, memorised solutions were secure 79% of the time against 33% for independent ones. For 2023 and 2024 CVEs the order reverses: 54% memorised against 64% independent. The likeliest explanation is that for recent CVEs, the fixed code is less represented in training data, so what the model recalls is more often the version before the fix.

- Some vulnerability classes are skill, some are recall. Cross-site scripting (XSS) was secure 86% of the time memorised and 80% independent, which looks like something Opus genuinely knows how to avoid. Path traversal was 78% memorised and 17% independent.


## **Opus 5.5 Excels at a Few Security Weaknesses, like Incorrect Authorisation (CWE-863), While It Still Struggles with the Rest** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/\#opus-5.5-excels-at-a-few-security-weaknesses,-like-incorrect-authorisation-(cwe-863),-while-it-still-struggles-with-the-rest%C2%A0 "Opus 5.5 Excels at a Few Security Weaknesses, like Incorrect Authorisation (CWE-863), While It Still Struggles with the Rest ")

Breaking the results down by CWE (Common Weakness Enumeration, the category of weakness behind each CVE) shows how uneven the secure code actually was, with many vulnerabilities demonstrating a generalisation on the secure code, without memorising them:

![Results by CWE for the 18 weakness types with at least three tasks, ranked by correct and secure. Rows marked with an asterisk have fewer than five tasks.](https://semgrep.dev/assets/results-by-cwe.png)
Figure 6. Results by CWE for the 18 weakness types with at least three tasks, ranked by correct and secure. Rows marked with an asterisk have fewer than five tasks.

A few rows stand out:

| CWE | Tasks | Correct and secure | Memorised |
| --- | --- | --- | --- |
| CWE-79 Cross-site scripting | 26 | 81% | 56% |
| CWE-863 Incorrect authorisation | 5 | 100% | 0% |
| CWE-200 Sensitive information exposure | 11 | 36% | 55% |
| CWE-89 SQL injection | 6 | 33% | 83% |

If we look at the worst performers, 34 CWE types had no secure solution at all. Each has only one or two tasks, so no single row means much. As a group, Opus produced working code on 79% of them and secure code on none (0 of 27 working solutions).

![The zero-secure CWE types grouped by theme.](https://semgrep.dev/assets/weakness-types.png)
Figure 7. The zero-secure CWE types grouped by theme.

They cluster into recognisable themes:

- Cryptography and randomness: weak encryption strength, insufficient randomness and entropy, a timing side-channel, missing encryption of sensitive data

- Concurrency: race conditions, improper synchronisation, improper locking

- Authentication and access control: missing authentication for a critical function, authorisation bypass through a user-controlled key (IDOR), weak password requirements

- Injection beyond SQL: code injection, command injection, argument injection

- Browser and session hygiene: cookies without the Secure flag, sensitive data in caches, clickjacking


Only 36% of these solutions were memorised, against 53% overall. These are the tasks where Opus mostly had to work it out without relying on it’s rote memorisation. These are much more complex vulnerabilities where the secure version depends on knowledge outside a single file: that a comparison needs to be constant-time, that a cookie needs a flag, that an endpoint should require authentication at all. When the CVE fix was one to four lines, Opus's working solutions were secure 77% of the time. For fixes of more than 50 lines, that dropped to 43%. Complex code is hard to get right for developers and AI agents.

If we look at the data by project, one project stands out. rdiffweb accounts for 19 tasks, and Opus left 14 of them vulnerable, a fifth of all 72 vulnerable results. Most of its CVEs are account and session rules (password policy, rate limiting, access checks) that the task descriptions don't spell out for the model.

## **What This Means If Your Developers Use AI Coding Agents** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/claude-opus-5-5-susvibes-benchmark/\#what-this-means-if-your-developers-use-ai-coding-agents "What This Means If Your Developers Use AI Coding Agents")

With so many developers now relying on AI agents to write the majority of their code, we think this benchmark run has some interesting lessons to learn for security teams who are thinking about the security of their AI-prompting developers. The good news is that AI coding agents are improving, both in code quality and security. But a 50% vulnerability rate is a tough pill to swallow for any security minded organisation, so here are our thoughts:

1. Treat "the tests pass" and "the code is secure" as separate questions. In our run, 41% of working solutions still carried the original vulnerability. A functional review with some unit tests won't catch these, Opus is VERY good at producing working code the first time.

2. Review cryptography, concurrency, and access control by hand. These were the classes where Opus produced no secure solutions at all, and where the fix depends on knowledge outside the code in front of it, these are the issues developers should spend their time actually reviewing.

3. Be most careful with large, cross-cutting security changes. Opus handled one- to four-line fixes well and missed most fixes over 50 lines unless it remembered them, complex code is still better written, or at least reviewed by a human.

4. Don't read a public-CVE benchmark score as a measure of secure-coding ability, and expect those scores to inflate. More than half of the secure solutions here were recalled, and each new model will have seen more of these fixes. A model that remembers a public fix won't have that advantage on your own code. If you're comparing models or agents on a benchmark like this, check how closely their solutions match the reference code before trusting the ranking.

5. Don't count on the model talking about security. We counted security terms (vulnerability, sanitise, injection, traversal and so on) in Opus's visible reasoning. Solutions in the third with the fewest mentions were secure 57% of the time; those with the most, 53%. Discussing security and getting it right were unrelated.


#### Dive deeper into [Security Research](https://semgrep.dev/blog/security-research) or continue reading our featured posts.

[Announcements\\
\\
September 24, 2026 **Introducing Malware Detection and Response Automation**\\
\\
![profile image](https://semgrep.dev/assets/people/screenshot-2025-11-21-at-11.25.57-am.png)\\
\\
Nabeel Saeed](https://semgrep.dev/blog/2026/introducing-malware-detection-and-response-automation) [Announcements\\
\\
July 28, 2026 **Introducing Semgrep Agentic Workflows: Automate Deep Vulnerability Hunting at Scale**\\
\\
![profile image](https://semgrep.dev/assets/people/pablo-estrada.jpeg)\\
\\
Pablo Estrada](https://semgrep.dev/blog/2026/introducing-semgrep-agentic-workflows-automate-deep-vulnerability-hunting-at-scale) [Announcements\\
\\
June 23, 2026 **Introducing Semgrep Guardian: Security for AI-Generated Code**\\
\\
![profile image](https://semgrep.dev/assets/people/milan_williams_headshot_square.jpg)\\
\\
Milan Williams](https://semgrep.dev/blog/2026/introducing-semgrep-guardian-real-time-security-for-ai-written-code)

![return home](https://semgrep.dev/build/assets/semgrep-logo-light-C4TAJLKl.svg)**Code security for builders and agents**

![g2 logo](https://semgrep.dev/build/assets/g2-logo-4xSt8VmV.svg)![four and a half stars](https://semgrep.dev/build/assets/4-half-stars-ZxI_Rf63.svg)

- Products
- [Semgrep Code](https://semgrep.dev/products/semgrep-code/)
- [Semgrep Supply Chain](https://semgrep.dev/products/semgrep-supply-chain/)
- [Semgrep Secrets](https://semgrep.dev/products/semgrep-secrets)
- [Semgrep Multimodal](https://semgrep.dev/products/semgrep-multimodal/)
- [Semgrep AppSec Platform](https://semgrep.dev/products/semgrep-appsec-platform/)
- [Semgrep Pro Engine](https://semgrep.dev/products/pro-engine/)

- Solutions
- [Secure Vibe Coding](https://semgrep.dev/solutions/secure-vibe-coding/)
- [Open-Source Malware Protection](https://semgrep.dev/solutions/open-source-malware-protection/)
- [Static Application Security Testing](https://semgrep.dev/solutions/static-application-security-testing/)
- [OWASP Top 10](https://semgrep.dev/solutions/owasp-top-ten/)
- [Secure Guardrails](https://semgrep.dev/solutions/secure-guardrails/)

- Resources
- [Docs](https://docs.semgrep.dev/)
- [Pricing](https://semgrep.dev/pricing/)
- [Blog](https://semgrep.dev/blog/)
- [Getting started with Semgrep](https://semgrep.dev/docs/getting-started/quickstart/)
- [Registry](https://semgrep.dev/explore/)
- [Playground](https://semgrep.dev/playground/new/)
- [ROI Calculator](https://semgrep.dev/resources/calculator/)
- [Book a demo](https://semgrep.dev/contact/demo/)
- [Help Center](https://semgrep.dev/docs/support/)

- Company
- [About](https://semgrep.dev/about/)
- [Careers](https://semgrep.dev/about/careers/)
- [Contact](https://semgrep.dev/contact-us/)
- [Press](mailto:press@semgrep.com)

* * *

#### Stay up to date

Subscribe to our newsletter

[![connect on twitter](https://semgrep.dev/build/assets/twitter-logo-green-BQpgXluv.svg)](https://x.com/semgrep)[![connect on slack](https://semgrep.dev/build/assets/slack-logo-green-DabQef3I.svg)](https://go.semgrep.dev/slack)[![connect on github](https://semgrep.dev/build/assets/github-logo-green-DVqynhSi.svg)](https://github.com/semgrep/semgrep)[![connect on youtube](https://semgrep.dev/build/assets/youtube-logo-green-Df4B_oJ4.svg)](https://www.youtube.com/c/semgrep)[![connect on linkedin](https://semgrep.dev/build/assets/linkedIn-logo-green-d3WRV14l.svg)](https://www.linkedin.com/company/semgrep/)[![connect on bluesky](https://semgrep.dev/build/assets/bluesky-logo-green-CQBQt-ZY.svg)](https://bsky.app/profile/semgrep.com)

© 2026 Semgrep, Inc. Semgrep is a registered trademark of Semgrep, Inc.


[Website terms](https://semgrep.dev/legal/terms)
·
[Privacy](https://semgrep.dev/legal/privacy)