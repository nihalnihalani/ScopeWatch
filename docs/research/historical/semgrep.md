> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Semgrep sponsor winners

> Derivative Markdown export of the saved **Sponsor_Winners_Research** report, checked **7 October 2026**. The report is the authoritative source; no separate source-notes archive was recovered. Statements about availability, current code, upcoming events and claims retain the report’s historical snapshot. They have not been reverified for a later date. Extraction repairs join wrapped lines and restore damaged hyphens only.

[Repository overview](../../../CURATION.md) · [Full report](../archive/source-tree/research/report.md) · [Event map](event-map.md) · [Evidence register](evidence.md)

## How to read the evidence

Verified award means a structured event award badge or an explicit sponsor announcement. A sponsor list, technology tag or creator claim alone does not qualify. Rank unconfirmed means category membership is known but placement is not independently published. Creator-reported ranks remain labeled throughout.

Repository verified means the project identity follows a submission or corroborated creator link. Source inspected means selected files were read without installing, running or deploying the project. Current source may differ from the judged version. Linked videos were not independently played, and hosted demos were not exercised unless specifically stated.

Why it may have won is analysis. No individual judge scorecards were found. Sponsor retrospectives can explain a project's value without proving which factor caused its award. Medical, legal, security and performance claims remain prototype claims unless supported separately.

## Verified awardees

- 10 October 2025: three Best Use of Semgrep winners. Advertised tiers were $2,500, $1,500 and $1,000, but the reviewed award records do not map names to tiers. Overall judging weighted idea, implementation, sponsor integration and presentation equally. [126](https://aws-agentic-ai-hackathon.devpost.com/)

These records refer to the San Francisco Creators Corner event, not the separate AWS AI Agent Global Hackathon. AWS independently lists Semgrep as a sponsor. [127](https://startups.aws.com/events/aws-ai-agents-hackathon?lang=en-US)

### Darwin

Best Use of Semgrep winner; individual rank unconfirmed. AWS AI Agents Hackathon, 10 October 2025. [128](https://devpost.com/software/darwin-cmfysv)

**What it built.** A tournament compares models that generate tool code. Security findings influence a fitness score shown with model performance in an evolution dashboard.

**Repository evidence.** Public; README and scanner source inspected. The repository contains a FastAPI backend and Next.js frontend. Its README assigns security 40 percent of the score, correctness 30 percent, speed 20 percent and quality 10 percent. backend/forge/scanner.py invokes Semgrep, parses JSON findings and applies severity-based penalties. It also has an explicitly marked heuristic fallback when scanning is unavailable or fails. [129](https://github.com/persist-os/aws-hackathon/blob/main/backend/forge/scanner.py)

**Published explanation.** Semgrep's retrospective highlights deterministic static-analysis pressure as a way to compare models. This is sponsor commentary, not a published judging scorecard. [130](https://semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026/)

**Why it may have stood out, inference.** The sponsor tool controls the product's central choice. A visible tournament makes that contribution easy to explain and demonstrate.

**Limits.** Code was read, not run. Model examples differ between the submission and README, so the exact live lineup remains uncertain. A clean scan is not proof of secure code.

Repository [131](https://github.com/persist-os/aws-hackathon) | Demo [132](https://www.youtube.com/watch?v=52UihmmZJ0s)

### CommitDNA

Best Use of Semgrep winner; individual rank unconfirmed. AWS AI Agents Hackathon, 10 October 2025. [133](https://devpost.com/software/commitdna-personalized-sec-compliance-tutor-on-your-commits)

**What it built.** A personalized security tutor turns a developer's commit patterns into short coding exercises, using a Claude Agent SDK and Bedrock workflow with Semgrep and compliance context.

**Repository evidence.** Submission-linked identity verified; public URL returned 404. The submission describes a feedback loop that creates training snippets and uses Semgrep again to check that the intended issue is present. The public demo landing page identifies its sample as the creator's last 100 commits. Repository contents are not publicly inspectable; its availability could reflect a private, deleted or renamed repository.

**Published explanation.** Semgrep's retrospective emphasizes context-sensitive coaching and immediate learning feedback. It does not assign an exact placing. [130](https://semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026/)

**Why it may have stood out, inference.** Detection leads to a concrete learning outcome. The second validation step gives the sponsor tool a role throughout the experience.

**Limits.** Implementation and claimed accuracy could not be independently checked. The live landing page is not evidence that the full workflow still works.

Repository [134](https://github.com/yigitkonur/commitdna) | Demo [135](https://cln.sh/kwd5YrFm) | Hosted app [136](https://commit-dna.pages.dev/)

### Udon Cat

Best Use of Semgrep winner; individual rank unconfirmed. AWS AI Agents Hackathon, 10 October 2025. [137](https://devpost.com/software/udon-cat)

**What it built.** A security assistant scans code and proposes fixes through a web interface, command line and a Chrome extension for Bolt. Its submission describes a FastAPI backend and Cerebras-hosted Qwen code generation.

**Repository evidence.** Submission-linked identity verified; public URL returned 404. The submitted design combines Semgrep findings with suggested repairs and confidence-based fix application. The exact repository is linked from the official submission, but its public page returned 404, so those implementation claims remain submission descriptions.

**Published explanation.** Semgrep's retrospective calls attention to security checks inside browser coding environments, where generated code can be inspected before it leaves the browser. [130](https://semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026/)

**Why it may have stood out, inference.** The integration appears where developers are creating code and connects a finding to a practical repair. That creates an understandable user outcome in a short demo.

**Limits.** No public source review or functional test was possible. The reviewed award badge establishes the category, not the individual rank or quality of every suggested fix.

Repository [138](https://github.com/chinesepowered/aws-secure-agent) | Demo [139](https://www.youtube.com/watch?v=LdO30NH6WRU)
