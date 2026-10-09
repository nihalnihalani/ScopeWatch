> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Pi Security: company, product and API profile

Checked 8 Oct 2026. "Pi" here means the product-security company at **pi.security**. It does **not** mean Pi Network, Raspberry Pi, Inflection's Pi, the "pi" coding-agent harness, or the unrelated GitHub org `pisecurity`. That org is a Raspberry Pi tooling account in Poznań, Poland, created in 2020; I checked it via `api.github.com/orgs/pisecurity`.

Labels: **[F]** is a verified fact with its URL. **[I]** is my inference.

---

## 1. Summary

- **[F]** Pi calls itself an "Agentic Product Security Platform" (`<title>` of https://www.pi.security/). The Luma partner blurb says "End to End Agentic Product Security" (https://luma.com/cyberhack).
- **[F]** Its core idea is **"institutional security memory"**, which the press release also calls a "security brain". Pi ingests code, past incidents, pentest reports, tickets, design docs, cloud configuration and Slack/Teams threads. It then triages incoming findings in context, traces each one to its root cause, hunts every variant, writes a fix that fits the codebase, and turns the lesson into a guardrail on PRs, in the IDE and inside coding agents. Sources: https://www.pi.security/ and https://www.newswire.com/news/pi-raises-35m-to-make-security-scale-as-fast-as-code
- **[F]** Its tagline is "Find it once, fix it everywhere, never meet it again." (https://www.pi.security/blog/why-we-built-pi)
- **[F]** Pi has **no public API, SDK, CLI, MCP server, docs site or free tier**:
  - `pi.security/docs`, `/api`, `/developers`, `/pricing` and `/changelog` all return 404.
  - `docs.pi.security` and `api.pi.security` do not resolve.
  - `app.pi.security` redirects to `/login`.
  - Every call to action is "Get a demo".
  - No npm or GitHub presence was found.
  - I probed all of these with curl on 8 Oct 2026.
- **[I]** So a hackathon team almost certainly **cannot integrate Pi's product**, unless Pi hands out sandbox access on the day. Expect Pi to judge on **alignment with its thesis**, not on depth of SDK use. Ask the Pi engineers on site (Mike Caballero, Rishiraj Chandra) whether there is a hackathon sandbox or API.

## 2. Company facts

| Item | Value | Source |
|---|---|---|
| Founded | 2025 | [F] https://www.calcalistech.com/ctechnews/article/hyu11dri11fg ; https://dealroom.co/companies/pi/ |
| Founders | **Guy Arazi** (CEO): ex-Microsoft security researcher (Defender, Azure, MSRC), earlier helped establish XCloud at Palo Alto Networks. **Yoni Ramon** (CPO): led offensive security at Tesla for more than 10 years (vehicles and robotics), with SpaceX systems-engineering experience | [F] Calcalist; https://www.pi.security/about |
| Funding | About $35M in total: a $10M seed (early 2025, led by Brightmind Partners) and a $25M Series A (led by Third Point Ventures), announced 10 Jun 2026. Angels include George Kurtz (CrowdStrike) and the Armis founders. Recursive Ventures and QP Ventures appear on the About page | [F] newswire, Calcalist, /about |
| Team | About 23 people in SF and Tel Aviv (June 2026). Open roles: AI Engineer (Search & Knowledge Systems), Frontend, Head of Eng, Platform, Security Researcher (SF and TLV), PMM, Designer | [F] Calcalist; https://jobs.ashbyhq.com/pi-security |
| Customers named | Lemonade (CISO Jonathan Jaffe, with a case study), Teramind and Navan (logos). The press release also mentions "one of the world's leading AI labs" | [F] https://www.pi.security/ ; https://www.pi.security/customers/lemonade |
| Pi staff on the hackathon roster | Guy Arazi (speaker); **Mike Caballero, "Engineering @ Pi"** (judge, LinkedIn headline "Applying AI in application security", UC Berkeley); **Rishiraj Chandra, Software Engineer @ Pi** (judge) | [F] https://luma.com/cyberhack ; https://www.linkedin.com/in/michael-s-caballero |

## 3. Product pillars, in Pi's own words

From the homepage tabs (https://www.pi.security/):

1. **Ingest and index everything**: "continuously ingests your codebase, past incidents, pentest reports and tickets - building a living Inventory of your entire security history."
2. **Detect root causes, not symptoms**: "traces every vulnerability to its architectural source, then hunts every variant across your organization - closing entire classes at once."
3. **Remediate in context**: "Fixes are built for your codebase - your languages, architecture, and conventions - and delivered directly into developer workflows. One click to resolve."
4. **Enforce what was learned**: "Past learnings become prevention guardrails, and known insecure patterns are blocked before they can be introduced."
5. **Sloane**, Pi's AI security assistant: "knows every corner of your codebase, and your organization's full security history … Ask it anything." Since 29 Sep 2026 Sloane also runs **natively inside Claude Code sessions** (see §5).

Homepage marketing figures: 70% less manual triage, 85% fewer repeat bounty payouts, 95% of vulnerabilities blocked before production. Product screenshots show an "App threat models" repository list, an "API issue dashboard showing five IDOR variants in hotel search settings", and an IDOR detail page with a **Slack message draft to notify the developer**. [F]

## 4. How the workflow runs end to end, according to the Lemonade case study

Source: https://www.pi.security/customers/lemonade

```
Report lands (HackerOne / pentest / internal)   0:00
Code located (exact file + line)                4:00
Owner identified                                6:00
+11 variants found                              11:00
One fix proposed (PR)                           15:00
Fix validated                                   20:00
Memory created                                  forever
```

- **[F]** "Pi reproduces the finding against the real product, filters out what isn't actually a risk … pins it to the exact file and line, identifies the owner, and drafts a fix that won't break the application."
- **[F]** "It captures the pattern as a memory: how this class shows up in Lemonade's code, why it's dangerous in this product, and what the approved fix looks like here … That memory immediately becomes a live guardrail at … the pull request … Pi comments on the exact line with the exact fix, and can hold the merge when the finding crosses the threshold."
- **[F]** Headline numbers: "1 report → 15 bugs". Mapping a whole class such as IDOR or SSRF across all repos takes "< 40 min".

From the Bugcrowd partnership post (https://www.pi.security/blog/bugcrowd-pi-from-any-bug-bounty-report-to-a-fix-in-your-developers-hands-under-30-minutes, 2 Jul 2026):

- **[F]** Pi confirms a finding by **reproducing it dynamically in a sandbox**, not by reasoning about the report text. It also flags duplicates and resubmissions.
- **[F]** It scores severity in context ("knows this service faces the internet and handles billing data").
- **[F]** It puts the fix **at the right layer**: "the missing check doesn't belong on that one handler. It belongs in the shared middleware."
- **[F]** It writes the PR "in your codebase's own style"; "about 60% of these pull requests merge with no edits at all". When the PR merges, Pi syncs status to Bugcrowd, Jira and the repo.
- **[F]** Variant search works "by what the code actually does rather than by matching text".
- **[F]** One anecdote: a fix was accidentally overwritten months later, and Pi "recognized the pattern coming back and flagged it."

## 5. Recent launches and research (newest first)

| Date | Item | Why it matters for a hackathon |
|---|---|---|
| 29 Sep 2026 | **Pi integrates with Claude's Compliance API**: a full record of every Claude Code session across the organization. Sloane runs inside the session and carries security "gates" (playbooks, dependency advisories, ticket links, reviewer requests) to the agent "while decisions are still being made". "Nothing is blocked, nothing is proxied." A dashboard shows "96 flaws across 1,244 sessions: 46 caught at planning, 33 fixed inside the session, 17 with a fix ready before merge." (https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api) | **[I]** This is Pi's newest bet: **security context injected into coding-agent sessions**. A hackathon project that does a mini version of this (an MCP server or hook that feeds org-specific security memory to Claude Code or Codex as it writes) is right on-thesis. |
| 24 Aug 2026 | **AWS SDK variant analysis, CVE-2026-22611**. Pi found a region-parameter SSRF (`region="@attacker.com#"`) in one SDK and abstracted it into a *behavioral anti-pattern* ("outbound request construction with no host allowlist"). It then found the same flaw in 7 SDKs across 6 languages (2,024 packages), proved a production cloud takeover with permission, wrote the mitigation into the customer's code 26 days before a patched SDK shipped, and stored the rule in memory. (https://www.pi.security/blog/one-word-aws-sdk-cloud-takeover) | **[I]** Pi's flagship story is **one finding → a class → every variant across languages → one fix → a permanent guardrail**. Their key phrases are "severity is not impact" and "a valid report is a sample, not the finding". |
| 2 Jul 2026 | Bugcrowd partnership: any bounty report to a merged fix in under 30 min (see §4) | Bug-bounty and pentest reports are the main input |
| 10 Jun 2026 | Out of stealth with $35M | — |
| 9 Jun 2026 | "The Triage Gap" (Lovable, ClickUp and Microsoft valid reports closed in triage). "A wrong close doesn't expire. It becomes the reference point." Pi re-triaged four "informational" reports into 2 medium, 1 high and 1 critical by correlating them with program history and code. (https://www.pi.security/blog/the-triage-gap-how-valid-reports-become-public-zero-days) | **[I]** Triage of AI-generated report "slop" is a pain point Pi names directly. |
| 9 Jun 2026 | "Why we built Pi": generic AI-AppSec tools "know none" of your codebase. "They feel 10x. In practice, they're closer to 2x." "Detection is a commodity." (https://www.pi.security/blog/why-we-built-pi) | **[I]** A project that only *detects* is off-thesis for Pi. |

## 6. Founder and staff worldview, as rubric signals [I]

Drawn from the posts above. These phrases recur often enough that I expect them to shape how Pi judges score entries:

1. **Remediation beats detection.** "Finding flaws was always the easy part; fixing them is the hard one … As detection becomes nearly free, remediation is the problem that will define the next era" (press release). A scanner-only entry is a weak fit.
2. **Memory that compounds.** "A scanner starts every run from zero. Pi starts from everything it has already learned." The demo should show the system getting better on the second run.
3. **Root cause and variants.** One finding should turn into the whole class, fixed at the right layer (shared middleware or helper), not just the one endpoint.
4. **Organization context over generic rules.** The fix should use the codebase's *existing* safe helper, such as a tenant-scoping helper, not a generic snippet.
5. **Verify, don't guess.** Reproduce dynamically in a sandbox, validate that the fix closes the issue, and filter false positives.
6. **Security inside the coding agent.** Guardrails in the IDE, the PR and the Claude Code session, without blocking the developer.
7. **Severity is not impact.** Score each finding against the real architecture, not CVSS alone.
8. **Developer workflow.** Name the owner, draft a Slack message, open a PR in house style, sync to Jira.

## 7. Overlap and competition with the other sponsors at this event [I]

- **Semgrep** (a co-sponsor) sells deterministic SAST, Guardian (security for AI-written code), Multimodal (AI triage and fix) and Agentic Workflows. Pi's message deliberately positions against "generic" scanners. A project can still use Semgrep as the **detector** and build Pi-style memory, variant hunting and guardrails on top. That lets one project credibly pitch to both.
- **ClickHouse** fits naturally as the **memory and timeline store**: findings, variants, fix history and a per-PR guardrail-hit log.
- **Guild AI** fits as the **agent control plane**: triage, root-cause, fixer and verifier agents with approvals.

## 8. Unknowns

- Whether Pi offers a **hackathon prize at all**. The Luma page lists Pi as a partner, speaker and two judges, and the organizer's LinkedIn post lists "Pi Security" under "Tools and mentorship" (see `_CYBERDEFENSE_EVENT.md`). No prize text was found.
- Whether there is any **hackathon API or sandbox access** to Pi or Sloane.
- I did not watch Guy Arazi's video interview (https://www.youtube.com/watch?v=zeRXxNOz2RU) or read "A Piece of the Pi" (https://www.pi.security/blog/a-piece-of-the-pi).
