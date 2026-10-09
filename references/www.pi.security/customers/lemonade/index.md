---
source_url: "https://www.pi.security/customers/lemonade"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T19:26:45.061080+00:00"
normalized_at: "2026-10-09T07:47:21.936295+00:00"
reuse_of: ".firecrawl/semgrep-pi-lemonade.md"
source_kind: "customer/vendor case study"
published_date: null
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "93386a39988c5df4dd073719845e787d858a9e2be9f9481eba0d3af5604552fa"
body_sha256: "524a4fdb8f75fd63157369c5dea411db936e5ae8fd952f68d53ca54bbb5cf5bc"
---

# From a week to 15 minutes:  security at the speed Lemonade ships

Lemonade builds AI-native insurance on a codebase that grows faster than any team can hold in its head. With Pi on every incoming security report, a critical finding goes from landing in the queue to a safe proposed fix in the owner's hands within 15 minutes. And the report doesn't just close a bug: it becomes a guardrail that keeps the whole class from ever merging again.

![Jonathan Jaffe, CISO of Lemonade, in a video interview](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a7d541cc53442527d2d0d33_lemonade-testimonial-poster.webp)

Challenge

- Every report kicked off a manual hunt: find the code, find the owner, hand it back. Even critical vulnerabilities could take over a week to fix.
- Fixing one instance didn't stop the pattern: the same root cause resurfaced elsewhere the next quarter.
- Lemonade develops agentically; institutional security memory was becoming impossible to maintain by hand.

Solution

Lemonade routes every incoming report through Pi, whether it comes from an offensive pentest, HackerOne, or internal research. Pi reproduces the finding against the real product, locates the exact file and line, identifies the owner, and proposes a fix that won't break the application.

Then it keeps going: it maps the root-cause pattern and every variant across Lemonade's repositories, captures the pattern into memory, and enforces it as a guardrail on every pull request from then on. One report closes the whole class, and keeps it closed.

![HackerOne](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a7d28c4c0d0ec6be0c8fb24_timeline-hackerone.png)

Report lands

0:00

![GitHub](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a7d28c59e1b6ebefaca0e30_timeline-github.png)

Code located

4:00

![Code owner](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a7d2dc9efec73439c85a3b9_timeline-owner.png)

Owner identified

6:00

+11

Variants found

11:00

![Proposed fix pull request](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a7d28c5c0d0ec6be0c8fb52_timeline-git-pr.png)

One fix proposed

15:00

Fix validated

20:00

Memory created

forever

1 week → 15 min

Resolving a critical finding used to take over a week. Now: code located, owner identified, and a safe fix proposed.

1 report → 15 bugs

One bug bounty report triggers a root-cause hunt that closes every variant across the codebase, and mints the guardrail that keeps the class out.

< 40 min

Average time to map an entire vulnerability class like IDOR or SSRF across all repositories and propose one strategic fix.

## When security means putting on the brakes

> Normally, security means putting on the brakes. _Before Pi_, getting from a pentest finding to a _deployed fix could take over a week_, even for a critical vulnerability, just because finding the issue is difficult.

Jonathan Jaffe

CISO, Lemonade

Lemonade is a full-stack insurance company, AI-native and cloud-native from the first line of code. That's the point of the company, and it's also the security team's hardest problem: the product ships fast, the codebase compounds, and every security report arrives as a description of a symptom, not a location in the code.

The old process looked like most companies' process. A report came in; someone had to work out where the issue lived, who owned that code, and what a safe fix looked like. Then it joined a developer's queue. Deployment could take over a week, even for a critical finding, because the expensive part was never writing the fix. It was finding the issue.

And fixing it once didn't mean it was gone. The same root cause would surface again in another repository, from another report, a quarter later: an authorization check missing here, an unvalidated outbound request there.

## Every report, resolved the way an engineer would, at machine speed

Now every report lands on Pi first. Pi reproduces the finding against Lemonade's real product, filters out what isn't actually a risk, and for everything that is: pins it to the exact file and line, identifies the owner, and drafts a fix that won't break the application. What used to take a week of hunting now takes about 15 minutes of machine work and a human review.

> _I know of no products_ that could ingest a penetration test report, then go to the exact spot of the repository and show the code that's causing that problem, _much less fix that code_.

Jonathan Jaffe

CISO, Lemonade

## Every report becomes structured memory, and memory becomes guardrails

Resolving the finding is only half of what the report is for.

When Pi closes a finding, it doesn't file the lesson away in a report nobody reads. It captures the pattern as a memory: how this class shows up in Lemonade's code, why it's dangerous in this product, and what the approved fix looks like here. Not a generic rule, but this codebase's own idiom.

That memory immediately becomes a live guardrail at the one place code enters the codebase: the pull request. Every PR is checked against it. When the pattern reappears, Pi comments on the exact line with the exact fix, and can hold the merge when the finding crosses the threshold Lemonade set for that memory. Inside the coding agent, the same memory means AI-written code follows the safe pattern by default, so the vulnerable version never gets typed in the first place.

These guardrails aren't a ruleset someone configured on day one. They're written continuously, by Lemonade's own findings; every pentest, every bug bounty submission makes the wall a little higher. One researcher reports one IDOR, and from that day, Lemonade's codebase stops accepting that class of IDOR. Everywhere. From anyone.

## Three ways Lemonade uses Pi

1

Report to fix, in minutes.

A pentest finding or HackerOne submission arrives. Pi locates the code behind it, routes it to the owner, and proposes the fix, typically within 15 minutes of the report landing. The developer starts from a solution, not a scavenger hunt.

2

Class elimination, not bug whack-a-mole.

When Pi fixes a finding, it maps the pattern behind it and hunts every variant across Lemonade's repositories. For classes like IDOR and SSRF, mapping the full class and proposing one strategic fix takes under 40 minutes on average. The past is swept clean.

3

One signal becomes a standing guardrail.

The pattern joins Pi's memory and is enforced on every pull request and inside the coding agent from then on. The class isn't just fixed; it's barred from re-entry. The future is covered too.

> Pi _doesn't just fix the one issue_. It goes to the root cause and finds all the variants. One report might result in _squashing 15 bugs_. _That's revolutionary_.

Jonathan Jaffe

CISO, Lemonade

## What changed

- **Critical findings resolve in minutes, not weeks.** Security keeps pace with how fast Lemonade ships, instead of setting the pace.
- **Recurring classes stop recurring.** One report closes the pattern everywhere it lives, and a guardrail at the pull request keeps it closed.
- **The security team's attention goes where it matters.** Noise is filtered before it reaches a person; what's left is real.
- **The memory compounds.** Every finding becomes a memory; every memory becomes a guardrail. As the codebase expands agentically, the protection grows with it. Pi can't unlearn what Lemonade has already paid to find out once.

> As Lemonade develops agentically, our code base is expanding even faster than it used to. It's hard to maintain institutional memory. _Except now we have Pi_.

Jonathan Jaffe

CISO, Lemonade

![Lemonade](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a293d03b2a8fcd3b612c021_lemonade.svg)

Industry

Insurance, AI-native and full-stack

Region

North America

Use cases

- Pentest & bug bounty resolution
- Root-cause & variant elimination
- Dynamic guardrails at the PR

Champion

Jonathan Jaffe

Chief Information Security Officer

[![Pi logo](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a1da78f063222585c84a189_pi-logo.svg)](https://www.pi.security/customers/lemonade#)

[About](https://www.pi.security/about) [Careers](https://www.pi.security/careers) [Blog](https://www.pi.security/blog)

### Build fast.  Stay secured.

[See it in action](https://www.pi.security/get-a-demo)

Pi @ 2026. All rights reserved.

[follow us on LinkedIn](https://www.linkedin.com/company/pi-sec/)

[Terms of Use](https://www.pi.security/terms-of-use) [Cookie Policy](https://www.pi.security/cookie-policy) [Privacy Policy](https://www.pi.security/privacy-policy) [Contact Us](mailto:contact@pi.security)

Pi @ 2026. All rights reserved.

Your browser does not support the video tag.