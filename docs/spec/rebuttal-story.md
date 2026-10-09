> Advisory research snapshot. For current native authority, event attribution, window boundaries and recovery semantics follow [the corrected architecture](../architecture/ARCHITECTURE.md) and its contracts. Fixture alternatives below are not simultaneous build requirements.

# ScopeWatch: round-two story rebuttal

9 October 2026 IST. Product planning only; no implementation, exploit, hosted run, policy test, scan finding or benchmark. This responds to the judge's objection that ScopeWatch is still a quota circuit breaker. It preserves the native approval-event metric and the single ScopeWatch project. Akash is excluded.

## The concession and the change

**Concession:** the minimum is a quota circuit breaker. It does not demonstrate off-task activity, exfiltration, a successful data drain or prompt influence. A conventional policy engine can count the same events. We should concede that immediately instead of trying to make “scope” mean an unobserved destination or task boundary.

**Change from the initial advocacy:** make the declared allowance an explicit **operator approval envelope for a concrete job**, and make the final control result the centerpiece. Earlier framing allowed “data-access budget” and “compromised agent” to carry more security meaning than the native evidence earns. The detector now names its exact conclusion: **this installed workload exceeded the unique native ALLOW decisions its operator approved for this operation family and rolling interval**. The fictional compromise remains scenario context unless actual prompt influence is observed. No mandatory receipt service or extra attack demonstration is added.

## The fictional operator story

**Maya is the on-call engineering operator at a small software company.** She runs two Guild-hosted workflows against an owned repository through one shared GitHub integration credential. The repository's synthetic issues stand in for operational context; no customer or confidential production data is involved in the demo.

The support-triage workflow is responsible for one narrow ticket. Its useful job is to inspect the ticket and relevant linked context, then produce a triage note. Maya gives it a limited approval envelope because she has approved that bounded job, not indefinite repeated integration use. The approved number includes room for ordinary retries. It is a deliberately conservative operator limit, not a learned anomaly threshold or a claim that a particular count indicates an attacker.

The bulk-review workflow has a different job: work through a preapproved release-review batch in the same owned repository. That job reasonably needs more requests. Maya records a larger allowance before it begins, bound to the actual installed agent/workspace and selected operation family. The distinction comes from Maya's approval, not from the model saying “this is a bulk task.”

Illustrative fixture allowances are **20 unique native ALLOW decisions in a rolling ten-minute window for support**, and **60 for bulk**. A controlled support misuse run can accumulate 30 decisions across several short completed sessions, while bulk accumulates 40. These are planning numbers, not results, production recommendations or guaranteed one-decision-per-tool-call behavior. The actual event mapping must be checked first, and the final predeclared fixture numbers must match that event unit.

The important contrast is **30 of 20 versus 40 of 60**. Raw volume is higher for the legitimate workflow. ScopeWatch's query selects support because support violated its own approval envelope. It does not select bulk simply because bulk is busy.

Maya could revoke the shared credential, but that would interrupt the release review too. Instead, ClickHouse combines the native evidence across sessions and returns the particular breached workload, exact allowance version and contributing sessions. A real Guild investigator reads the manifest and case evidence, creates a useful incident in the owned repository, and proposes a narrow subsequent-operation restriction. Its record explains both why support is over its allowance and why bulk remains within its separately approved allowance.

Maya reviews the exact installed actor/workspace, credential, operation and any actually proven resource selector. She applies the reviewed native DENY. A fresh matching operation from support is refused. A fresh matching operation from bulk returns the expected owned fixture result, which we inspect in the actual tool result. The shared credential remains useful for the work Maya approved.

**The business outcome is one demonstrated legitimate operation preserved during one demonstrated workload restriction.** Do not turn it into invented savings, uptime percentages, prevented losses or production coverage.

The deliberate support run represents a compromised or malfunctioning worker in a controlled lab. ScopeWatch reacts to the policy violation in either case. It does not diagnose the cause from the count.

## What the final two calls must prove

The target call must occur after the native policy change, under the same authenticated installed workload subject, in a fresh session if practical. Show the actual policy identifier/scope and the native matching DENY. The target must not obtain a fresh successful result for that repeated operation. A local stopped worker, a suggested policy or an investigator saying “contained” is insufficient.

The bulk control must also occur after that change. Use a fixture reserved for this verification whose expected marker is not handed to the model in its trigger prompt. Inspect the real fresh tool response/result for the owned fixture's expected marker and context. If available, retain its native task/session identity and actual result receipt. **A model's answer alone, an ALLOW event, a familiar cached result, HTTP 200, or a tool DONE status is insufficient proof of the expected fixture being returned.** If the integration cannot expose enough actual result evidence, report that the surviving-work proof is unverified.

Agent/operation scope is the minimum. A resource selector may be used only if the account test proves its evaluation. Policy resource support does not establish native resource-event visibility. If bulk fails too, the product has failed the central selective-containment demonstration even if support is denied.

Guild's turn-end event persistence means several excess decisions may already exist before detection. The demonstrated action restricts **subsequent** relevant operations. It does not prevent the first excess approval, undo completed calls, or terminate an in-progress turn.

## Claims the receipt can and cannot justify

| Claim | Status and exact evidence |
|---|---|
| “The operator approved different allowances for support and bulk.” | Justified by the operator-owned manifest created before the scenario, version/effective time and authenticated workload binding. This proves declared policy context, not actual semantic task relevance of every operation. |
| “Support exceeded its approval-event allowance across completed sessions.” | Justified by exact native ALLOW IDs, deduplication, established clock, authenticated binding and the actual ClickHouse aggregate/contributing-session result. |
| “Bulk had higher raw volume but remained within its allowance.” | Justified by its separately approved allowance and actual count under the same precise event semantics. |
| “Guild refused this later support operation while bulk returned this fixture.” | Justified only by the actual scoped native policy, actual target DENY and freshly inspected control result after that policy. |
| “The investigator created a grounded review record through Guild.” | Justified by its hosted session URL, real manifest/context read, actual issue and tool evidence. It is not a claim that an LLM is necessary to count. |
| “The support run models a compromised agent.” | A disclosed fictional controlled scenario. Do not state that ScopeWatch proved compromise, or that a prompt attack actually occurred. |
| “The model followed an untrusted instruction.” | Unproved unless a real controlled input read and recorded behavior establish influence. No such claim is required by the core. |
| “Thirty documents were retrieved/stolen, or data reached an unapproved recipient.” | Unproved from thirty ALLOW decisions. Requires independently meaningful actual outcomes/resource/destination evidence. No native-schema field is invented to support it. |
| “This task was semantically off scope.” | Unproved from a task name and budget. The core proves exceeding the operator's approval envelope, not why the individual calls were inappropriate. |

## The optional native outcome join has one small gate

Only after the entire core loop works by **1:30 PT**, allow a maximum **15 minutes**, ending at **1:45**, to try the exact native EventSecurity.task_id → tool task → parent/root → launched-workload relationship. Do not join by approximate timestamp, actor label or operation text. Ambiguous joins, absent fields and nullable responses remain **unmatched**, visibly.

A verified TaskTool match may add actual available status/response-size context and help distinguish a permitted-but-failed operation. It does not silently change the primary counter to documents, successful reads or bytes disclosed. Tool DONE or HTTP status alone is not a protected-object receipt. The actual inspected control fixture remains the minimum surviving-work witness.

There is no custom receipt server, new hosted service or broad reconciliation pipeline. If the join gate fails, delete its unfinished UI panel and keep the complete approval-event story. If it works, present it as a bounded matched-outcome enhancement, with unmatched rows retained and its limitations stated.

## Seven core-live scenarios, selected from the larger matrix

The IDs refer to [the 34-scenario coverage matrix](story-and-scenarios.md). These can share the same controlled run; they are not seven applications or seven attack projects.

| Matrix ID | Core-live scenario | Required visible result |
|---|---|---|
| **2** | Bulk has more approvals than support, but is preapproved within its own higher allowance. | Query treats bulk as compliant; the manifest predates the run. |
| **3** | Support's completed sessions collectively breach its allowance. | Native count and contributing sessions select support. A session alone is not the policy subject. |
| **5** | Replay one native event ID to the collector/query. | Count and case remain unchanged. Label the replay clearly. |
| **7** | One genuine ALLOW is followed by an observed failed operation. | It remains in the approval-event count and is never described as a successful read. If a genuine failure cannot be obtained/observed, use a labeled fixture explanation and mark the native failure control unverified. |
| **10** | A labeled fixture lacks trusted identity or collection completeness. | The UI/query state says incomplete evidence rather than compliant zero. This is a fixture test, not a fabricated native Guild event. |
| **14** | Two attributable installed agents share the credential; only the breached agent is targeted. | Exact reviewed policy scope; fresh bulk fixture succeeds after the action. Both failing is a failed proof. |
| **30** | Target repeats the selected operation after containment, preferably from a new session. | Actual native denial for the same authenticated subject; no fresh successful target result. |

Routine support compliance is implicit in the initial baseline, but does not need another demo beat. All remaining scenarios stay **core design requirements/limitations or stretch**, as labeled in the matrix. Cross-workspace proof, clone/group-budget evasion, recipient/resource violation, actual prompt influence and recovery automation do not enter the required live plan.

## Two-minute demonstration

| Time | Content |
|---|---|
| **0:00–0:15** | “Maya approved a small triage job and a larger release review using the same credential.” Show the predeclared manifest, workload identities and separate allowances. |
| **0:15–0:40** | Several real support sessions accumulate beyond the support allowance. Show the actual SQL selecting support while the higher-volume bulk workflow remains compliant. Display exact counted unit and contributing native session links. |
| **0:40–0:55** | Show the duplicate replay leaving the count unchanged and the failed ALLOW annotation. Keep synthetic/replay scale and actual native case labels separate; any latency badge is measured SQL latency only. |
| **0:55–1:10** | Open the genuine Guild investigator session and created incident. Show the manifest read and precise proposed scope; the incident cites evidence and makes no theft claim. |
| **1:10–1:40** | Maya approves and applies the actual narrow native policy. Perform or show the genuine recorded target repeat refusal and fresh inspected bulk fixture result. Spend the most time here. |
| **1:40–2:00** | Show the receipt: count/manifest/query, hosted record, approval/policy, target denial and control result. State turn-end detection and subsequent-operation scope. Mention a real Semgrep finding only if obtained; otherwise end on the preserved-work outcome. |

A recording must be labeled. Two minutes is our communication target, not an established event duration rule. Optional outcome enrichment can occupy a small evidence toggle, not another storyline.

## Thirty-second answer to “just rate limit”

> “Yes. It is a rolling approval-event budget; we do not claim exfiltration detection or new rate limiting. The operator problem is a shared credential. Our query identifies the breached workload across sessions and excludes the preapproved bulk job. The hosted investigator produces a scope the operator reviews. Guild refuses the target's next matching operation, while the approved job returns this fresh fixture. That verified selective outcome is the product; volume alone does not decide who loses access.”

## The same-project Semgrep lane and prize uncertainty

A small Semgrep lane helps because the actual generated collector/controller handles identity, evidence, credentials and privileged policy actions. A genuine security defect there would threaten the trustworthiness of this same containment workflow. Finding and repairing such an issue can improve the product and add an attributable sponsor evidence card without changing the user, repository or scenario.

Preserve ordinary first-draft generation and actual hook/stock scan artifacts before repairs. Cap focused discovery at **20–30 minutes in parallel**. A real candidate needs generated provenance, detector attribution, a meaningful owned-lab consequence and repair verification. Do not manufacture one by changing code to match a rule. A clean scan or catalog entry is not an interesting finding. No finding means the same finished core remains; omit the finding-prize claim.

One project means no separate Ledgerly target, no 28-run generation tournament, no broad source-hunting framework and no second containment app. A separate vulnerable-app story would consume owner capacity and undermine the sponsor cohesion we are defending.

ClickHouse plus Guild top awards have a **$2,000 monetary face-value ceiling if stacking is allowed**. A genuinely eligible Semgrep top award could make that **$3,000**, with credits, Pi's hardware and unknown gift card separate. That is neither expected payout nor guaranteed cash. If stacking is prohibited, each known top monetary amount is $1,000; emphasize the strongest completed sponsor proof and retain both integrations because they serve one product. Pi's innovation appeal remains uncertain because budget controls and agent containment are established ideas. Past awards do not establish current stacking or win probabilities.

## Four-person load and the cuts

Four owners are already occupied: **Guild/native policy and verification; collector/ClickHouse; manifest/scenario/Semgrep provenance; case screen/evidence/video/submission**. The third owner must not become the operator of a new prompt tournament, and the fourth must reserve recording/submission time.

If load is too high, cut optional native outcome enrichment first, then prompt-influence/resource/recipient work, recovery automation, large load-test ambitions and UI polish. Keep a modest diverse labeled replay workload and real query measurement where feasible. Use one static operator manifest, one investigator and one owned incident issue; manual reviewed policy application is acceptable if its native effect is proven and labeled accurately.

Never cut the fresh post-policy bulk success or replace the target native denial with a local pause. If the native scoped-control gate fails, the remaining honest product is monitoring/review with unverified containment. If a real Semgrep issue is found, pursue only the small proof/repair that the existing team can finish; do not sacrifice the completed control loop for a third conditional prize.
