# Third advocate: ToolTrust, a connector release review

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Prepared 9 October 2026. Independent affirmative case using the four requested research files and their verified sources. Akash excluded. Product and prize planning only: no target generation, scan, implementation, operational attack or new web research. No finding exists yet. Debate scores and a 10-million-row floor are not treated as official criteria.

## The affirmative case

**Build ToolTrust: review one AI-generated connector before approving it to move sensitive data.** The user is the developer or automation owner deciding whether a generated integration is ready to use. The question is concrete: “Does this connector send information only to the destination and audience I approved?” The output is one release-review card: the actual source finding, the observed recipient/audience, the affected connector activity, a useful hosted review decision and evidence that the corrected connector still performs its intended job.

Choose one genuine outbound-destination failure first, or one genuine credential-audience failure if that is what the code and scan establish. Do not combine both just to broaden the pitch. The ordinary feature request should ask for a useful connector; neither a defect nor the desired award outcome is part of the generation brief. Select the case after the actual scan. Demonstrations use owned endpoints and synthetic confidential markers.

The most compelling **owned-lab finding hypothesis** is a generated support-export connector that appears to honor its approved recipient, but sends a synthetic report to a different owned receiver after a destination transition during delivery. No such target, scan finding or delivery has been obtained. Its proposed detection anchor is an explicit stock CLI scan of generated Flask/requests code with `python.flask.security.injection.ssrf-requests.ssrf-requests`, not Guardian. That rule could flag the source path; it does not establish the later transition or report disclosure. Ordinary generation can produce correct code, unsupported syntax or a finding without this consequence. If the actual scan and controlled observation do not support this story, reject the hypothesis rather than force it.

This is a distinct product commitment from a general AppSec investigation/repair platform. It serves one release decision for one integration. It does not require tenant infrastructure, an incident-management suite, a patch factory, a fleet policy engine or a recurrence-memory product. The judged outcome is a connector that completes its legitimate task while respecting the declared recipient boundary. The review card makes the defect's business meaning legible without a long explanation of authorization internals.

The affirmative advantage over a routine JWT case is presentation and product specificity, not a claimed higher win probability. “This integration moved information beyond its approved recipient” is an understandable consequence attached to the tool the builder intended to ship. A JWT finding can be entirely valid yet familiar or benign in context. ToolTrust still needs a genuinely interesting observed finding; a generic SSRF or credential flag is not automatically distinctive.

## Genuine detection and eligibility gates

The [finding audit](../finding-feasibility.md) establishes published candidate rules, not a target match or vulnerability:

- [Flask requests SSRF](https://semgrep.dev/c/r/python.flask.security.injection.ssrf-requests.ssrf-requests) and the Python MCP SSRF rule in the [AI best-practices pack](https://semgrep.dev/c/p/ai-best-practices) are inspected public stock-rule candidates. Neither is present in the inspected Guardian-default bundle. Their framework and syntax coverage is limited.
- [Python credential logging](https://semgrep.dev/c/r/python.lang.security.audit.logging.logger-credential-leak.python-logger-credential-disclosure) and the Python MCP credential-response rule in that AI pack are alternative anchors. Their narrow shapes do not establish sensitivity, audience or impact.
- A source flag does not prove a later destination transition or information disclosure. A credential-like field can be nonsensitive. The actual controlled observation must establish the consequence advertised on the review card.

The Semgrep pitch must say **stock CLI scan** when that is the surface used. Do not imply Guardian coverage. The packet does not explicitly require Guardian-only detection, but current-event acceptance of this exact discovery path should be confirmed. Preserve ordinary generated-code provenance and the untouched initial scanner output. If the team first discovers the issue by another method, disclose that sequence; a later custom rule is confirmation, with unresolved finding-award eligibility.

Do not change the generated connector's client/framework or insert a bad line to fit a published rule. If no meaningful, attributable finding appears by the discovery cutoff, ToolTrust becomes a labelled connector-review benchmark for Guild/ClickHouse; it does not become a Semgrep finding entry. If an actual qualifying JWT case exists while this connector case does not, choose the real case over this advocacy.

## Sponsor roles that earn their place

| Sponsor | Necessary product role | What must be visible | Reason to remove it |
|---|---|---|---|
| Semgrep | Identifies the actual generated connector source issue | Original scan result, rule, source location, attribution and observed consequence | No qualifying finding, or the actual discovery path is not accepted |
| ClickHouse | Answers which connector/release deserves review first and how much observed connector activity crossed the declared boundary | A measured query over actual stored activity; its answer changes the case selected or the review priority | Only finding storage, an arbitrary row-count badge or a decorative dashboard |
| Guild | Hosts the release reviewer that uses bounded evidence and performs a useful review action | Published agent, genuine session and useful tool event producing the release-review record | Merely formats an explanation locally, or hosted execution remains blocked |
| Pi | Rewards the usefulness and originality of the demonstrated connector-review result | Clear problem, actual surprising finding and retained legitimate use | No need to remove the pitch opportunity; assign no invented gift-card value |

The reviewer can record “hold for correction” or “demonstrated checks passed for this version”; it does not claim comprehensive safety. The ClickHouse answer must affect that review, rather than appear afterward as a sponsor flourish. If the team cannot establish an analytical question at meaningful scale, favor the completed finding/Guild story and remove the ClickHouse prize claim.

Use diverse labelled synthetic/replayed connector traffic for the scale demonstration and separate live owned-lab evidence for the actual case. Report true stored row count, query work and measured timings. No verified minimum row count has been established here; a fabricated 10-million-row threshold should not determine the build. Nor should synthetic volume be described as real customer exposure.

## Historical support and its limits

The [complete relevant-winner matrix](../all-relevant-winners.md) and [competition audit](../competition-and-eligibility.md) support specific design lessons:

This memo does not use the new debate pulse as verified primary incident evidence. Its secondary and vendor/promotional reports would require advisory or first-party corroboration before they could support an incident claim.

- **Rokko:** sponsor-confirmed ClickHouse first place. Its analytics feed an action loop. ToolTrust should similarly let the aggregate change the review decision; this is transferable use, not a requirement to copy its architecture.
- **RedBot:** sponsor-confirmed ClickHouse second place. Security is already a valid product domain. ToolTrust should have a more specific connector-release user story than a broad autonomous security bot.
- **DailyGate:** verified Guild category membership; exact rank unresolved. The corrected investigation establishes published agents with different tool grants while the displayed live panel was scripted. Adapt genuine hosted work and show the real session; discard the pretend live presentation.
- **Darwin:** verified older Best Use of Semgrep award; exact rank unresolved. Generated tool code and scanner-informed decisions are historical precedent. Its inspected inflated headline totals are a warning, and its old category does not establish eligibility for today's finding prize.
- **IncidentSherpa:** won Senso while missing ClickHouse/Guild despite substantive analytics. **LicenseTrace:** won ClickHouse despite thin inspected integration. These counterexamples prevent treating implementation depth as a causal winning formula.

Archive membership is distinct from exact rank; inspected code may differ from the judging version and was not uniformly executed. Selected winners and counterexamples supply no unbiased denominator, judge scores or win odds. The evidence supports a clear product job, visible sponsor work and honest presentation, not a probability ranking.

## Credible five-hour contract

| PT time | Product milestone | Cutoff |
|---|---|---|
| 11:30–12:00 | Confirm sponsor/stacking rules and account access; inspect ordinary generated connector code and actual scan evidence | Choose the genuine eligible case, or explicitly take the benchmark/two-sponsor branch |
| 12:00–1:00 | Complete one connector case, retained legitimate behavior and a useful Guild review run; analytics lane works in parallel | No genuine hosted run: simplify once with mentor help, then remove Guild from the required demonstration |
| 1:00–2:00 | Connect the review card to the analytics answer and hosted action | One complete review loop beats separate sponsor demos |
| 2:00–2:45 | Finish the corrected-version result and scale/timing evidence; prepare sponsor evidence links | Cut any sponsor whose necessary contribution remains unproven; freeze the product path |
| 2:45–4:00 | Verify the retained workflow, rehearse, record and upload the short demonstration | No new product scope; use honestly recorded real sessions if needed |
| 4:00–4:30 | Verify repository/video access, finish the tools/build description and submit | Retain submission margin |

The six phases total **300 minutes**. For four people, assign one connector/finding owner, one analytics owner, one Guild owner and one product/demo owner. For two people, prioritize the real finding and the strongest working companion sponsor; for one, complete one primary eligible entry before adding another. No technical build begins in this research task.

## Prize argument and decision trigger

Each known top monetary award is $1,000. A Semgrep/Guild top-award outcome is a **conditional $2,000 cash/gift-card face-value ceiling** if those awards stack; adding qualifying ClickHouse raises that ceiling to **conditional $3,000**. This is not expected payout. The $5,250 total award pool is distributed among teams. Credits, hardware and Pi's unspecified gift card remain separate. Payment methods, stacking and custom-rule attribution are unresolved event questions. See the [independent financial critique](../prize-strategy-adversarial.md).

**Choose ToolTrust if the first 30 minutes produce a genuine stock-rule connector finding with a meaningful observed consequence, and the team can show useful hosted review plus an analytical decision.** It deserves preference over a broader platform when that smaller user story can be completed and explained reliably. If these gates fail, concede to the real supported case or a simpler working entry. The affirmative case is narrower scope and a clear buyer decision; it is not guaranteed novelty, eligibility or prize success.
