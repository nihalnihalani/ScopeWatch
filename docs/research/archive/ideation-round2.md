> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Cyberdefense: adversarial ideation, round 2

9 October 2026. This pass responds to the parent's researched shortlist and newly verified sponsor constraints. The constraints reported by the parent are taken as session evidence; this subagent has not independently fetched them.

## Shortlist verdict

Choose **BoundaryProof**: a genuine, interesting vulnerability in an ordinary AI-generated support/incident application, tied to live runtime evidence, a hosted investigator and independently replayed fix checks. The **cross-tenant cache leak** is the preferred finding if it actually exists in the generated code. It is not a mandatory fixture to manufacture.

“ProofPatch” is a delivery architecture rather than the innovative idea. Its title alone does not distinguish it from Semgrep Guardian, Autofix, Pi remediation or yesterday's scan/fix/rescan hackathon entries. The finding supplies the distinction: **the database filter was right, but the cache returned the other tenant's data before that filter ran**. The proof supplies credibility.

| Candidate | Verdict | Main objection | Rescue |
|---|---|---|---|
| A. ProofPatch | Keep as architecture | Scan -> map -> patch is already a familiar workflow; apparent integration breadth can bury the actual finding. | One concrete mechanism, one victim, one before/after, with each sponsor visibly supporting that result. |
| B. Cross-tenant incident/RAG cache leak | Preferred conditional finding | A cache-key-only rule does not prove a reachable access-control failure. Current custom-rule eligibility is unconfirmed. | Preserve original AI output; demonstrate cache warm order, server-established tenant identity, and unauthorized returned data. Label custom-vs-registry detection honestly. |
| C. Injection-proof SOC | ClickHouse/Guild fallback | Prompt-injection semantics are not reliably demonstrated by generic Semgrep matching. A scoped agent does not make the whole SOC injection-proof. | Show a specific forbidden tool action blocked by a genuine runtime capability boundary; concentrate on those two monetary awards. |
| D. Build/rollback/cache guard | Verification requirement, not separate feature | A patching agent can modify its own verifier or invalidate the scan cache, obtaining a green result without fixing the bug. | A verifier outside writable patch paths plus fresh pre-/post-fix behavior and exact source hashes. Keep it narrow. |

## Attack the cache story before committing

1. **Cache identity is not authorization.** Prefixing the key with `tenant_id` is insufficient if access depends on user, role, document ACL, redaction policy or a revoked grant. The chosen fixture needs a precise authorization model. For the minimum, make all documents uniformly available to authenticated members of their tenant; verify tenant scope before a hit is served. Broader claims require broader tests.

2. **The exploit's order matters.** Tenant B first warms the cache for B's globally unique document ID. Tenant A requests that same ID. If the cache hit is served before the correctly scoped database lookup, A receives B's document. “A and B used the same ID” is ambiguous unless IDs are defined; do not accidentally demonstrate ordinary key collisions in a database that also aliases rows.

3. **Authenticated tenant identity must come from the server.** An `X-Tenant` header supplied by the client is not sufficient unless the demo explicitly defines it as a fixed trusted authentication stub. Prefer two preconfigured authenticated test principals. A resource tenant in the ClickHouse event must be derived from the owned test fixture or server-side resource metadata, not from an attacker's assertion.

4. **Semgrep discovery attribution needs care.** A model or human may diagnose the bug, after which a local rule detects the hazardous code. That is a useful Semgrep contribution, but not identical to “Semgrep found the bug first.” Guardian's remote plugins use `guardian-default`; a custom cache rule must run in the separate local CLI path. Do not present a custom rule as a Guardian built-in capability or silently rename a rule ID.

5. **One pattern is not a general cache-leak detector.** Cached authorization decisions, ACL changes, custom decorators, cross-file call chains and multiple cache libraries are outside a one-file custom rule. State what the rule catches and what the behavioral replay proves. Semgrep OSS cross-function limits remain relevant.

6. **Synthetic scale does not prove production detection.** One million labelled synthetic request events can establish query behavior and processing performance for that dataset. Only the owned A/B requests establish the application flaw. UI labels must keep `synthetic workload` separate from `live exploit evidence`; “one million real attacks” would be false.

7. **ClickHouse is asynchronous analytics.** Events arriving after a bad response can reveal and quantify exposure, then trigger an investigator. They cannot retroactively prevent the leaked response. The repaired application authorization prevents the demonstrated leak; ClickHouse detects mismatches and checks post-fix monitoring. End-to-end event-to-decision time differs from SQL execution time.

8. **“RAG” should earn its place.** If the defect exists in a response cache, adding a vector database, embeddings or an LLM on every retrieval wastes time and creates another moving part. A support incident API is enough. Include cached summaries or retrieval only if those mechanisms are present in the normally generated application and explain the finding.

## Attack the agent integration

- **Hosting is the current Guild prize.** Run at least one actual investigator in Guild with real input and useful output; keep the real session URL. Merely logging a local LangGraph run to a Guild-looking panel weakens the exact prize.
- **Credential grants can default allow-all.** Overwrite them before connecting them to an agent; inspect the final permitted operations. Do not demonstrate “least privilege” based only on `pick()` in source while broader workspace/integration access remains possible. At minimum, avoid delete, merge and unrestricted write credentials entirely.
- **Trigger authentication is distinct.** The parent reports that general Guild keys can chat but API triggers require a dedicated trigger key with Basic auth. Use that key type or call the documented chat-session route and describe it accurately; do not burn the afternoon on silent authentication retries.
- **Approval ownership must be explicit.** An authenticated button in the project app can approve an immutable proposed action and start a second scoped operator session. This is application approval followed by Guild execution, not proof that Guild enforced the approval. Do not claim a noninteractive trigger called an interactive approval tool.
- **Real read/write beats a fake control plane.** One actual repo-file lookup and one issue creation with evidence are sufficient for a credible slice. Multiple agents with no useful execution add latency. A local patch runner can remain local if the narration clearly assigns the planning/tool action to Guild and the application test enforcement to the runner.

## Money-oriented narrowing

The highest known monetary ceiling remains $3,000 across ClickHouse, Guild and Semgrep, conditional on stacking. That does not justify building every integration at equal depth. The vulnerable-code finding is the prerequisite for Semgrep; high-volume query-to-investigation is the prerequisite for ClickHouse; a useful hosted session is the prerequisite for Guild.

Give the demo each in turn:

1. **Finding:** original generation -> exact Semgrep file/line -> cache warm -> tenant A sees tenant B's canary.
2. **Impact:** ClickHouse query finds that specific breach among the synthetic workload and starts/feeds the investigator; measured row count and time are visible.
3. **Closure:** Guild investigation points to the unsafe early return; one approved patch changes it; trusted replay blocks A's unauthorized read while B's authorized read still returns the right data.

The strongest line is: **“The SQL had the tenant filter. The cache skipped it. We caught the leak, mapped its scope and proved the patch keeps the right users working.”** It is a hypothesis until the authentic target demonstrates it.

If no genuine qualifying finding is established in the discovery window, retain the pipeline and switch the prize focus. Do not deliberately introduce an insecure cache return and claim it was discovered. An explicitly seeded benchmark is still a valid working defensive project, but its Semgrep award eligibility must be disclosed and cannot be assumed.

Round 3 should define a small, testable contract and remove extra features that do not strengthen one of the above three demonstrations.
