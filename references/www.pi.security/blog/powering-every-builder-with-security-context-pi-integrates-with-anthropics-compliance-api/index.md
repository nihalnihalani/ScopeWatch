---
source_url: "https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T19:26:39.241581+00:00"
normalized_at: "2026-10-09T07:47:21.935961+00:00"
reuse_of: ".firecrawl/semgrep-pi-compliance-sep29.md"
source_kind: "dated release"
published_date: "2026-09-29"
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "481dd388de6c2b570df59fdd2afabba06c7bed5f226e797273db420d3cf5d8b0"
body_sha256: "2390d0a7afdff7dc5845559f6fdc9de415fa9a8397e406ee58ab0bd5b55818d9"
---

# Powering Every Builder with Security Context: Pi Integrates with Claude’s Compliance API

Pi now integrates with Claude’s Compliance API for a complete record of Claude Code sessions across your organization. And through Sloane, Pi’s agent running natively in the session, your organization’s security context reaches the coding agent while decisions are still being made, not after they reach review.

![](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6aaf761c8885994c9f15b409_matan-hason.jpg)![](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a4a7f62f45c1dd84b5e055a_Yoni%20Ramon.jpg)

Yoni Ramon and Matan Hason

29 September 2026·3 min read

![Claude and Pi logos side by side, separated by a vertical rule, on a soft blue gradient](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6aaf76e218eb061351987be4_claude-pi-blog-hero-v2.webp)

In brief

- Pi now connects to Claude’s Compliance API, for a complete record of Claude Code sessions across your organization, **not just the ones from developers who installed Pi**.
- Through Sloane, Pi’s agent running natively in the session, your team’s gates reach the coding agent while decisions are still being made, not in a review days later.
- Session by session, Pi shows which gates fired, whether the agent followed them, and where a developer chose otherwise and why.
- Pi reads only Claude Code sessions and your organization’s user list, never Claude chats, projects, or files.

Most of the security decisions in AI-written code are made in the first few minutes of a task, by an agent, with nobody watching.

That has always been the cheap moment to get something right. Every hour after it, the fix costs more and the people who could have made it are further away. Coding agents have compressed that moment to almost nothing. A developer describes a task; the agent reads the repo, picks the libraries, touches the sensitive code, and pushes. By the time a pull request appears, a hundred small decisions have been made and the agent has moved on.

Security sees the PR. It does not see how the PR came to exist.

Today, we’re announcing Pi’s integration with Claude’s Compliance API, giving Pi a complete record of Claude Code sessions across your organization and bringing your security team’s context into those sessions through Sloane, while decisions are still being made.

## The rearview mirror problem

The industry’s answer so far is visibility: collect the sessions, build the dashboard, flag the risky ones. Pi does that too. But visibility alone is a rearview mirror. By the time it shows you the wrong turn, the agent has taken a hundred more and no one was there to argue.

Pi works where the turn is made. Your security team sets gates that define which code deserves a pause and what the agent should know before it continues. That might be the security playbook for a sensitive part of the system, advisory data on a dependency, an existing ticket that should be attached, or a reviewer who should be offered a look. Sloane carries those gates into every Claude Code session, and when one matches, the agent gets the context it was missing and keeps going. The developer is asked only when a decision needs a human. Nothing is blocked, nothing is proxied, and nothing sits between the developer and Claude.

Picture it. An agent reaches for a rendering library with a known vulnerability. Before the change lands, it learns which version is safe and which library the team already approved, and switches. A few minutes later it edits authentication code, and the developer is asked to confirm and link the ticket. By the time the pull request is opened, those security decisions have already been addressed.

![A Claude Code session timeline in Pi: threat model, fix written in session, tests added, merged with zero concerns shipped](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6aaf5902fc52b61b201a8366_agents-session.webp)One session, start to finish: two concerns raised at design, fixed as the code was written, verified, and merged 14 minutes later.

Visibility shows you what the agent built. Pi gives the agent the security context to make better decisions as it builds, and proves it.

## What developers gain

Security context arrives inside the tool developers already use, at the moment it is useful. Not a separate dashboard to check. Not a PR comment three days later asking why the ticket is missing, why that version was chosen, or why the pattern differs from the one the team settled on last year. Those questions get answered while the change is being written, mostly by the agent, using your organization’s own playbooks, advisory data, and review process.

Fewer surprises at the pull request. Less rework after it. And developers can see what is recorded about their work.

## What security teams gain

The whole picture. Claude’s Compliance API hands Pi every Claude Code session in your organization, not just the ones from developers who installed something.

Proof your controls were applied. Session by session, Pi shows which gates fired, whether the agent followed them, and where a developer chose otherwise and why.

![Flaws in agent-written code over the last 30 days: 96 flaws found across 1,244 sessions, 46 caught at planning, 33 fixed inside the session, 17 with a fix ready before merge, an 82% reduction in risk](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6aaf71d104e1b6ccdff43c6c_agents-impact-v2.webp)How early each flaw was handled: of 96 flaws across 1,244 sessions, 46 were caught at planning, 33 were fixed inside the session, and 17 had a fix ready before merge.

Evidence, not just policy. When an auditor asks how AI-written code is governed, you show them what was asked, what was built, and who decided what, with nothing reconstructed after the fact.

## Scoped on purpose

Pi reads only Claude Code sessions and your organization’s user list, never Claude chats, projects, or files. The Compliance API can delete data; Pi never does. Session content is held only long enough to build the record. What remains is the evidence itself.

## Why it matters

Every other security control your organization owns was built for a world where a person wrote the code and a person could be asked about it. Coding agents broke that assumption. Security teams now have a choice: watch the agent from a distance, or be in the room when it decides. Pi and Claude’s Compliance API together make the second one possible: guidance while the code is written, and a record you can stand behind afterward.

## Get started

Pi’s integration with Claude’s Compliance API is available now for Claude Enterprise organizations. If your developers build with Claude Code, Pi puts your security team’s judgment into the first few minutes of every task, and hands them the record of everything that followed.

[Book a demo](https://www.pi.security/get-a-demo)

On this page

1. [In brief](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#in-brief)
2. [The rearview mirror problem](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#the-rearview-mirror-problem)
3. [What developers gain](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#what-developers-gain)
4. [What security teams gain](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#what-security-teams-gain)
5. [Scoped on purpose](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#scoped-on-purpose)
6. [Why it matters](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#why-it-matters)
7. [Get started](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#get-started)

![Powering Every Builder with Security Context: Pi Integrates with Claude’s Compliance API](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6aaf77458a243e59e4c578a7_6aaf76e218eb061351987be4_claude-pi-blog-hero-v2.webp)

[All Posts](https://www.pi.security/blog)

Partners

# Powering Every Builder with Security Context: Pi Integrates with Claude’s Compliance API

Pi now integrates with Claude’s Compliance API for a complete record of Claude Code sessions across your organization. And through Sloane, Pi’s agent running natively in the session, your organization’s security context reaches the coding agent while decisions are still being made, not after they reach review.

![Yoni Ramon](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a4a7f62f45c1dd84b5e055a_Yoni%20Ramon.jpg)

Yoni Ramon

CPO, Co-founder

September 20, 2026

\|

1

min read

Share this post

Table of contents

[Overview](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#)

## Related articles

[![](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a8d1fb478a169f909cf2195_6a8d0925da976767c41209bf_mammoth-aws-regions.webp)\\
\\
Research\\
\\
Pi Found a Systemic AWS SDK Flaw. One Malformed Region Took Over a Security Vendor’s Production Cloud\\
\\
We autonomously traced the vulnerability across six languages and 2,000+ packages, developed fixes, and proved it could be used to take over a security vendor’s cloud. AWS rated CVE-2026-22611 low severity.\\
\\
![](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a4a7f76d56fec78916d603a_Guy%20Arazi.jpg)\\
\\
Guy Arazi\\
\\
CEO, Co-founder](https://www.pi.security/blog/one-word-aws-sdk-cloud-takeover)

[![](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a4693123db0afd077904938_Linkedin%20Pi%20x%20Bugcrowd%20partnership.png)\\
\\
Partners\\
\\
Bugcrowd + Pi\\
\\
From any bug bounty report to a fix in your developer's hands, under 30 minutes\\
\\
![](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a4a7f76d56fec78916d603a_Guy%20Arazi.jpg)\\
\\
Guy Arazi\\
\\
CEO, Co-founder](https://www.pi.security/blog/bugcrowd-pi-from-any-bug-bounty-report-to-a-fix-in-your-developers-hands-under-30-minutes)

[![](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a298db3e53d35039d44c04f_%D1%81over3.jpg)\\
\\
Memory\\
\\
A Piece of the Pi\\
\\
Why Guy and I built Pi: a story about the most expensive thing a security team owns and keeps losing, its own memory.\\
\\
![](https://cdn.prod.website-files.com/6a27d7a17b4ea42497cdca12/6a4a7f62f45c1dd84b5e055a_Yoni%20Ramon.jpg)\\
\\
Yoni Ramon\\
\\
CPO, Co-founder](https://www.pi.security/blog/a-piece-of-the-pi)

[![Pi logo](https://cdn.prod.website-files.com/6a1d76b4779db0754b2f6700/6a1da78f063222585c84a189_pi-logo.svg)](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api#)

[About](https://www.pi.security/about) [Careers](https://www.pi.security/careers) [Blog](https://www.pi.security/blog)

### Build fast.  Stay secured.

[See it in action](https://www.pi.security/get-a-demo)

Pi @ 2026. All rights reserved.

[follow us on LinkedIn](https://www.linkedin.com/company/pi-sec/)

[Terms of Use](https://www.pi.security/terms-of-use) [Cookie Policy](https://www.pi.security/cookie-policy) [Privacy Policy](https://www.pi.security/privacy-policy) [Contact Us](mailto:contact@pi.security)

Pi @ 2026. All rights reserved.

Your browser does not support the video tag.