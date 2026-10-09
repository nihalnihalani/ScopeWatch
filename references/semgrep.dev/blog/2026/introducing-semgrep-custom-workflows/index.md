---
source_url: "https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T19:25:52.199853+00:00"
normalized_at: "2026-10-09T07:47:21.934546+00:00"
reuse_of: ".firecrawl/semgrep-pi-custom-workflows.md"
source_kind: "dated release"
published_date: "2026-03-18"
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "733e9eb34685e7a3b578cba6e742562d9434f8a17b86e3a33c5a1d704e6e8b67"
body_sha256: "9cbc570505a92e1c68f9742e8f0954c8170dd61a6ad8c8fa63c332a5b34740ba"
---

# Introducing Semgrep Custom Workflows

Operationalize AI alongside deterministic analysis to automate code security workflows you can build, test, and deploy at scale.

![profile image](https://semgrep.dev/assets/people/img_4150-(1).jpg)

Vivek Khimani

[![linkedin logo](https://semgrep.dev/build/assets/linkedin-BOc8hy7f.svg)](https://www.linkedin.com/in/vivek-k-4a4660146/)

![profile image](https://semgrep.dev/assets/people/img_2386.jpeg)

Braden Riggs

[![linkedin logo](https://semgrep.dev/build/assets/linkedin-BOc8hy7f.svg)](https://www.linkedin.com/in/bradenriggs/)



March 18th, 2026


Table of Contents

* * *

1. [The tradeoff between tools and AI](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/#the-tradeoff-between-tools-and-ai)
2. [From custom rules to custom workflows](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/#from-custom-rules-to-custom-workflows)
3. [How it works](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/#how-it-works)
4. [How are AppSec teams benefiting from Workflows today?](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/#how-are-appsec-teams-benefiting-from-workflows-today?%C2%A0)
5. [Here are some Custom Workflows teams are building today](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/#here-are-some-custom-workflows-teams-are-building-today)
6. [What comes next](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/#what-comes-next)

AI can find code security vulnerabilities that traditional tooling can't. Business logic flaws, IDORs, broken access control. These are vulnerability classes that have historically required a human reviewer to identify. Semgrep has been [evaluating AI's performance on these kinds of problems](https://semgrep.dev/blog/2025/ai-powered-detection-with-semgrep/), and early results show that AI can catch what pattern matching misses. For many organizations, these are also the vulnerability classes that command significant bug bounty payouts.

The capability is real. But putting AI into production for code security introduces operational challenges that are worth understanding:

- **Variable costs.** Token spend is hard to predict, hard to budget for, and has the potential to grow.

- **Inconsistent output.** Outputs vary between runs. You can't reproduce results, which breaks trust, compliance, and review workflows.

- **No auditability.** Information goes in, a result comes out, and you can't trace the reasoning path.

- **Hallucinations.** False positives from AI erode the developer trust that security teams depend on.

- **Scale.** What works in a proof of concept doesn't automatically work across your full repository fleet. Running AI org-wide means solving for latency, orchestration, observability, and cost simultaneously. On large repos, sequential execution can't keep pace with PR volume, and most teams don't have the infrastructure to parallelize it.


We've heard these concerns consistently from teams exploring AI for AppSec and the pressure to solve them is growing. Developers using AI coding assistants are shipping more code and more PRs, and vulnerability volume is growing with it. Manual review alone can't keep up. The question isn't whether to bring AI into your security program. It's how to do it in a way that's accountable, cost-efficient, and reproducible.

### **The tradeoff between tools and AI** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/\#the-tradeoff-between-tools-and-ai "The tradeoff between tools and AI")

Most AppSec teams today rely on deterministic tools. As they evaluate how to bring AI into their programs, they're facing a tradeoff.

Deterministic tools like Semgrep's analysis engine are fast, consistent, and cheap to run. But they have a capability ceiling. They operate on syntax and data flow, not semantics. They can't reason about business logic, evaluate authorization models, or assess whether a finding is actually exploitable in context.

AI has shown it can handle these kinds of tasks. But it's expensive, inconsistent, and hard to audit.

Teams that try to combine the two on their own end up wrapping APIs that weren't designed for security automation, building custom orchestration layers, and maintaining infrastructure they didn't plan for. That approach doesn't scale to hundreds of repositories and thousands of developers.

Semgrep Workflows solves this by giving teams a programmable platform to combine deterministic analysis and AI into pipelines that are testable, auditable, and cost-controlled, with managed infrastructure that scales across your full repository fleet.

### **From custom rules to custom workflows** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/\#from-custom-rules-to-custom-workflows "From custom rules to custom workflows")

Semgrep was built on a core belief: no vendor can foresee every company's code security needs. Customization is essential, and it must be simple yet powerful. [Semgrep Custom Rules](https://semgrep.dev/docs/writing-rules/overview) brought that philosophy to vulnerability detection. Today, [Semgrep infrastructure processes millions of code scans a week](https://semgrep.dev/blog/2025/enterprise-scale-code-scanning-semgrep-managed-scans-crossed-1-million-weekly-scans/), with thousands of teams using custom rules to encode exactly what vulnerabilities and anti-patterns uniquely matter in their codebase.

[Custom Workflows](https://semgrep.dev/products/semgrep-workflows/) extends this philosophy across the entire code security loop: what gets detected, how findings are triaged, how they're validated, and how they get resolved. Each workflow is a multi-step pipeline where deterministic tools handle code scanning, policy checks, and validation, while AI steps handle tasks that require reasoning over code context: classifying whether a finding is exploitable, synthesizing evidence across files, or even generating a fix.

Semgrep's own Multimodal detection is a Workflow built on this platform. It uses the Pro Engine's taint analysis to trace where user input flows into sensitive operations like database queries or API responses, then passes that analysis to an LLM that reasons about whether authorization checks are missing along those paths. That combination finds business-logic vulnerabilities like IDORs and broken access control that neither static analysis nor LLMs catch reliably on their own. Our [research found that](https://semgrep.dev/blog/2025/ai-powered-detection-with-semgrep/) Semgrep’s Workflow-based approach to IDOR detection produced 8× more true positives and 50% fewer false positives than an LLM-only baseline, where 88% of findings were false positives.

The same platform that powers Multimodal detection is [now available in Private Beta](https://semgrep.dev/contact/product-join-workflows-beta/) for teams to build their own Custom Workflows.

### **How it works** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/\#how-it-works "How it works")

Workflows are defined in code. It's a Python SDK that gives workflow writers your normal development environment, and your favorite coding LLMs.Think of it as programmable CI for security: instead of stitching together scripts and API calls, you define typed, testable pipeline steps in a real development environment. At a high level, each workflow defines:

1. **Triggers.** What starts the workflow: PR events, scheduled scans, webhooks, or API calls.

2. **Steps.** Methods with typed inputs and outputs that run in parallel or sequentially. Each step maps to any tool in the library: Semgrep's analysis engines, LLMs, dev tools like git, or even your own custom tools.


**Outcomes.** Structured results delivered into the systems your team already uses: Jira, Slack, GitHub, or the Semgrep dashboard.

![Architecture diagram showing how a Semgrep Workflow executes. User-authored workflow code feeds into a workflow execution pipeline where steps run in parallel or sequence, each capable of using tools like LLMs, Semgrep scans, or custom logic. Results route to integrations including GitHub PRs, Jira tickets, Slack notifications, and the Semgrep Dashboard. The underlying Semgrep infrastructure handles orchestration, parallelization, error handling, private deployment, and monitoring, scaling to over 100,000 repos.](https://semgrep.dev/assets/semgrep-workflows-modified.png)

You develop and debug locally using the CLI, running the same code that will run in production. When ready, you deploy onto Semgrep's managed infrastructure, which parallelizes execution across your repository fleet so workflows run fast, even at scale. Built-in retries, orchestration, observability, cost controls, and logging mean you can see what ran, what it cost, and what failed. No infrastructure to build, maintain, or optimize.

Every step produces a traceable output. When an AI step classifies a finding, you can inspect the deterministic steps that fed it: which scan produced the finding, what code context was gathered, what policy was applied. Workflows are plain Python, so AI coding assistants can help write and extend them with ease.

![Diagram showing Semgrep Workflows in four steps: (1) Write workflow code using Python decorators like @step and @tool(llm), (2) Run and trace locally with semgrep workflow run, inspecting step outputs and debugging with full traces, (3) Deploy and fan out with semgrep workflow deploy to run the same code unchanged across repos and monorepos via the Semgrep Runtime, (4) Deliver results where teams work, including the Semgrep Platform, GitHub, Jira, Slack, and API, as findings, code fixes, PRs, remediation guidance, and notifications.](https://semgrep.dev/assets/semgrep-workflows-how-it-works.png)

### **How are AppSec teams benefiting from Workflows today?** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/\#how-are-appsec-teams-benefiting-from-workflows-today?%C2%A0 "How are AppSec teams benefiting from Workflows today? ")

Semgrep's own triage, Multimodal detection, and Autofix capabilities are all built as workflows on this platform. They run across thousands of customer repositories in production today, and the results speak for themselves:

![Three performance cards for Semgrep Workflows: Triage workflow shows 96% security analyst agreement rate on evaluated findings, filtering false positives before human review. IDOR/auth workflow shows 8x more true positives and 50% fewer false positives versus LLM-only or baseline approaches, using code context, application analysis, and targeted reasoning. Autofix workflow shows 30 minutes saved per finding on average and 22% faster median time to resolution versus baseline, shifting developer effort from writing fixes to reviewing AI-generated patches.](https://semgrep.dev/assets/semgrep-workflows-performance-proof.png)

The same SDK, tools, and managed infrastructure behind these results is what ships in the private beta. Teams can build workflows for custom detection, triage, validation, remediation, and policy automation.

### **Here are some Custom Workflows teams are building today** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/\#here-are-some-custom-workflows-teams-are-building-today "Here are some Custom Workflows teams are building today")

Workflows is in early private beta with a group of design partners. Here's a sample of what they're already building:

1. **Cross-file privilege escalation detection.** One of our design partners built a workflow that compares access control configurations across languages, then uses an LLM to verify whether the vulnerability is reachable. Traditional scanners miss this class of bug entirely because it only exists in the relationship between separate config files.

2. **Binary firmware analysis.** One design partner receives only compiled binaries from a vendor. Their workflow decompiles firmware using [Ghidra](https://github.com/NationalSecurityAgency/ghidra), then runs Semgrep analysis on the decompiled output to find vulnerabilities in code they never see as source.

3. **Workflow code review.** Our engineers started building so many workflows, internally and for customers, that we needed a workflow to review the workflows. On every PR that modifies a workflow definition, an LLM-assisted check enforces our internal guidelines and posts findings as PR comments.


### **What comes next** [![Link icon](https://semgrep.dev/build/assets/link-2-CZjK2H9r.svg)](https://semgrep.dev/blog/2026/introducing-semgrep-custom-workflows/\#what-comes-next "What comes next")

The next phase of application security is not human-out-of-the-loop automation. It is always-on, reviewable automation.

![](https://semgrep.dev/assets/semgrep-eval-loop.png)

More security work will happen continuously: detection, validation, triage, and remediation running across repositories before a human looks at every result. That only works if the automation is reproducible, observable, and easy to audit.

Workflows gives teams a way to encode repeatable security logic, run it continuously, and keep humans in control of policy, review, and exceptions.

Semgrep Custom Workflows is now in private beta. [Sign up for early access.](https://semgrep.dev/contact/product-join-workflows-beta/)

#### Dive deeper into  or continue reading our featured posts.

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