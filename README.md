# ScopeWatch

**Find suspicious permission use across AI-agent sessions, review the evidence, and restrict one matching capability while approved work keeps running.**

This repository contains the researched **build handoff** for the 9 October 2026 Cyberdefense Hackathon. It includes architecture, exact sponsor-contract research, implementation tasks, reference sources, offline design checks, demo/submission plans and blank evidence templates. **The competition application is not implemented yet.** Build the actual event source during the event and replace illustrative counts with observed results.

## Start building from these files

1. [START_HERE.md](START_HERE.md): reading order, fixed scope, authority and first decisions.
2. [First-hour gates](docs/build/FIRST_HOUR.md): prove actual Guild actors, shared evaluated credential, evidence access, SQL and narrow policy effect before expanding scope.
3. [Build plan](docs/build/BUILD_PLAN.md): four owners, dependency order, modules, acceptance checks and the 300-minute schedule.
4. [Architecture](docs/architecture/ARCHITECTURE.md), [Guild contracts](docs/architecture/GUILD_CONTRACTS.md) and [ClickHouse contracts](docs/architecture/CLICKHOUSE_CONTRACTS.md): authoritative technical contracts.
5. [Master specification](docs/spec/MASTER_SPEC.md) and [42-scenario playbook](docs/spec/SCENARIO_PLAYBOOK.md): product scope, controlled story, material failures and cut lines.
6. [Demo script](docs/demo/DEMO_SCRIPT.md), [evidence checklist](docs/demo/EVIDENCE_CHECKLIST.md) and [submission checklist](docs/demo/SUBMISSION_CHECKLIST.md): finish the proof and deliver a reviewable entry.

When older research differs, the corrected architecture/contracts govern evidence and native API/action semantics. The master governs product/event scope. [Curation and provenance](CURATION.md) explains what was included and what remains advisory.

## Architecture

![ScopeWatch system architecture](docs/architecture/rendered/01-system.png)

[Offline interactive diagram viewer](docs/architecture/architecture.html) · [SVG overview](docs/architecture/rendered/01-system.svg) · [seven diagrams and exports](docs/architecture/README.md) · [independent architecture review](docs/architecture/ARCHITECTURE_REVIEW.md).

Download/open the HTML viewer locally for tabs and zoom; GitHub displays its source rather than running it. It embeds the diagrams and works without an account or network connection.

## The one useful idea

Fictional operator Maya runs TicketAssist and ReleaseReview through an owned synthetic GitHub integration. A pinned manifest gives them different permission-use allowances. ClickHouse evaluates all qualified candidates across the captured sessions, including historical rolling-window crossings. A Guild-hosted investigator reads pinned context and creates an incident. Maya reviews an exact scope and applies native Guild policy through its UI or a verified CLI. Fresh target refusal and actual approved-control results establish the observed matching restriction.

The primary unit is **native ALLOW permission decisions**. It is not customer records retrieved, data leaked or proof of compromise. The observed cohort is finite and controller-managed; source finality and unrestricted workspace-wide coverage are not promised. The optional planted-ticket test earns a prompt-influence claim only through actual source consumption, changed behavior and a matched benign control.

## Sponsor jobs

| Sponsor | Necessary contribution | Evidence / limit |
|---|---|---|
| ClickHouse | Exact all-candidate current/historical counts, own allowances and contributing sessions | Actual query output; separately labeled diverse replay and measured latency; no decorative scale or millisecond-containment claim |
| Guild.ai | Hosted workloads/investigator, mediated native evidence and matching-call policy behavior | Actual context read/incident, exact subject/credential proof, target refusal and inspected control result |
| Semgrep | Scan ordinary AI-generated code from this same workflow | A genuine interesting finding, provenance, consequence, correction and rescan if obtained; no assumed finding |
| Pi | Innovation-prize story | No event product access or runtime integration dependency; novelty remains uncertain |

Akash is excluded. The conditional top monetary face value is $2,000 for ClickHouse/Guild firsts, or $3,000 with eligible Semgrep first **if awards stack**; credits and unknown Pi value are separate. [Sponsor strategy](docs/sponsors/SPONSOR_STRATEGY.md).

## Repository map

| Path | Purpose |
|---|---|
| `docs/architecture/` | Detailed design, seven Mermaid sources, SVG/PNG exports, viewer and fresh API/SQL audits |
| `docs/build/` | Executable task order and first-hour go/no-go evidence gates |
| `docs/spec/` | Master product spec and scenario matrix; advocacy snapshots explicitly subordinate to corrected contracts |
| `docs/demo/` | Narration, evidence and submission/access checks |
| `docs/sponsors/` | Prize priorities and sponsor-specific proof |
| `docs/reviews/` | Independent packaging/completeness review |
| `docs/research/` | Recent discussions, finding feasibility, historical winners and archived debates |
| `references/` | Selected official documentation/API/schema/rule snapshots and source metadata |
| `research/offline-reference/` | Pre-event fixture oracle and saved offline verification; not the competition application |
| `templates/` | Blank manifest, case/action, measurement, finding and submission records |
| `provenance/` | Import/source hashes and original-to-packaged path map |
| `evidence/` | Instructions for future sanitized event evidence; actual runtime evidence is absent |
| `tools/validate_handoff.py` | Offline link/JSON/template/import-hash/export and high-confidence secret-shape checks; documentation validation only |

No `npm start` application is promised in this handoff. The only executable helpers are documentation validation/rendering and the inherited offline design oracle. [Environment template](.env.example) has blank values; never commit real credentials or raw sessions.

Run `python3 tools/validate_handoff.py` to check the package and `python3 research/offline-reference/verify_reference.py` for the inherited offline fixture oracle. These checks neither call sponsors nor test a competition application.

The repository starts private. Before submission, give reviewers actual repository access or deliberately make the intended submission public after checking its contents. The one-project rule, team limit of four, build-during-event rule and 4:30 PM PT deadline are preserved in the submission plan.
