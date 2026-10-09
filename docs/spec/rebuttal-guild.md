> Advisory research snapshot. For current native authority, event attribution, window boundaries and recovery semantics follow [the corrected architecture](../architecture/ARCHITECTURE.md) and its contracts. Fixture alternatives below are not simultaneous build requirements.

> Timing override: [current human build authorization](../event/BUILD_AUTHORIZATION.md) permits starting now or anytime, with no global cutoff or hard duration cap. The old calendar schedule is superseded; readiness and actual evidence govern progress. Request/test timeouts and diagnostic retry bounds remain operational controls, not permission to stop required work.

# Guild rebuttal: exact identity, outcomes and security scope

Research-only round 2, 9 October 2026. No new web collection, account call, hosted run or policy mutation was performed. The independent judge's strongest objections are valid. **The fixed approval-event core is viable as a bounded workflow if its account proof succeeds; the optional outcome join must never become a hidden prerequisite or expand the security claim.** It demonstrates a trusted per-workload permission-use capacity violation and a narrow restriction of subsequent matching calls. It does not establish data theft, malicious intent, an exploited model, general agent quarantine or immediate prevention during an ongoing turn.

Scope remains one project, no more than four people, with Akash excluded. Begin authorized implementation immediately. Prove native source/binding/credential and trial effects, restore both allowed baselines, then complete the actual core loop; its receipts are readiness gates rather than calendar checkpoints. Optional native-outcome enrichment follows a working core and exact correlation proof. Ambiguous outcomes stay unmatched/optional. There is no receipt server, MCP bridge, OAuth bridge or second integration in this plan.

## 1. Trigger-key scope: the correction is necessary

The cached `.firecrawl/click-guild-guild-api-triggers.md` and indexed `.firecrawl/docs.guild.ai/platform/api-triggers/index.md` contain the same statements. I compared their bodies: they are byte-identical after removing the index's metadata front matter. The host/path capture is explicitly marked `reused_prior_capture`; it is **not an independent fresh retrieval**. Its body SHA-256 is `0fa6189ff7b47c427c33854fea76c5f9ea185f3b478e5d92543e657d0b5b007f`.

Three short excerpts, sixteen quoted words total, resolve the apparent scope contradiction:

- Key issuance says: “Each key is scoped to that one trigger.”
- Optional `agent_id` can route to a “different agent installed in the workspace”.
- The security section permits session read/write for “any session” in that workspace.

The defensible interpretation is that a key is generated for and associated with one trigger, while its **documented effective session privileges are broader**: same-workspace session status/events/tasks/runtime access and follow-up writes, plus routing a start request to another installed agent. “Investigator-only key,” “single-session key” and “one-trigger key therefore cannot invoke another installed agent” are unsupported. Issuance association must not be advertised as least-privilege authorization. [Official API-trigger documentation](https://docs.guild.ai/platform/api-triggers).

Keep this controller credential outside the investigator's input, tools, prompt and incident output. Use the owned synthetic workspace and disclose its real scope. The investigator's bounded GitHub credential policy/tool list is a separate boundary; it does not restrict the trigger key. An account API key with read scopes is also a different credential flow, not a replacement that may automatically start `api_trigger` sessions. No new auth infrastructure is needed to acknowledge these facts.

## 2. Workload attribution and outcome correlation are different joins

The **core attribution join** maps a native security event to its authenticated workload. It is valid for many security events to reference one agent task, provided the platform task/session/agent mapping is observed and verified against the controller's own launch record. The native task graph provides session and parent links; the agent task provides an agent/version projection. A tool task can point to its owning agent task. That establishes who ran the task; it does not establish which one of that task's several outbound results corresponds to a particular security event. The public schema leaves `agent` as an unconstrained projection, so its actual identity fields must be observed, not assumed. [Security-event schema](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [task schema](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks).

The **optional outcome join** requires an exact native relation between one selected security decision and one particular tool invocation. If `EventSecurity.task_id` references an agent task with five descendant tool tasks, attaching every descendant outcome to every security event multiplies outcomes and invents evidence. Following parent links is appropriate for actor attribution; a descendant cross-product is inappropriate for result attribution.

The scoped experiment may establish a one-to-one relation only if the actual platform records expose and demonstrate it, for example a security event that references the exact `TaskTool.id`, or an authenticated native correlation identifier that matches its `tool_call_id`. Confirm the semantics and cardinality in both directions for the selected operation. A tool-name match, approximate timestamp, sequence position, nearest event, agent-authored run label, or merely having one candidate in a single-call fixture is not an authenticated exact join. The schema does not guarantee an outcome correlation key inside optional `details`.

If the security event is attached to an agent task and exposes no exact call relation, retain `outcome_match_status: unmatched`. If several decisions or calls match one key, retain `ambiguous`. Do not attach status or bytes to the decision. The unique native security-event counter and incident remain usable; outcome enrichment is incomplete. Missing fields cannot be filled from a model's assertion.

## 3. What the optional outcome fields prove, and what the control needs

`TaskTool.http_status_code`, `request_bytes` and `response_bytes` are nullable. `response_data` is only stored when the response was projected because of size. Consequently a small successful response can have no stored `response_data`, and an absent response body cannot be treated as a failed operation or invented content receipt. DONE describes a task state; ALLOW describes a permission decision; a 2xx describes HTTP status; response size describes response bytes. None independently proves a returned document, sensitive information exposure or theft. [Full task endpoint](https://docs.guild.ai/api-reference/sessions/fetch-session-sub-tasks).

The control witness has a different requirement from cross-session outcome analytics: **after the target DENY, make a fresh real control call using the same verified credential and inspect its actual expected synthetic result**. Record the native control session/task/operation, returned fixture identifier and expected marker from the real tool result, and whatever outcome fields are genuinely present. The Guild session UI documents inspection of tool arguments/results and raw JSON. A generic agent response saying “success” is insufficient. A screenshot of a repository object existing proves existence, not that the control agent received it. If the actual returned result cannot be inspected, continued useful access is unproved even if an ALLOW exists. [Session evidence UI](https://docs.guild.ai/platform/sessions).

This control-success witness is essential to the core selective-action promise. It does not require correlating every historic security event to a tool outcome or implementing a returned-object budget. Historic permission counts stay permission counts.

## 4. Native clocks and pagination: evidence cannot outrun collection

The security-event schema declares `created_at` and `updated_at` date-time properties. Their actual presence and timezone representation still require the account proof; a declared property is not an observed populated field. Use a displayed **native event record-creation clock** if the actual `created_at` values support it, and define the manifest's half-open window against that clock. `updated_at` is not the operation-completion clock. Neither task timestamps nor collector arrival prove the external service's served-at time.

The event endpoint states UUIDv7 IDs are time-ordered. That supports ordering/cursors. It does not establish that the UUID's embedded generation time is the exact permission-evaluation or data-delivery time. Do not silently replace the chosen timestamp with a decoded UUID timestamp. If only collector observation time is usable, the operator must deliberately declare and label a collector-observation budget/window; a hidden clock substitution changes the predicate. Persist separate source and observation times.

Events are documented to persist after a turn finishes. Durable event collection therefore supports between-turn detection and **subsequent-call restriction**. A WebSocket or a live reasoning draft does not remove this constraint. Draft IDs are ephemeral and invalid pagination cursors. [Specific events endpoint](https://docs.guild.ai/api-reference/sessions/fetch-session-events), [draft-event distinction](https://docs.guild.ai/platform/sessions).

Default reads are newest-first with only 20 items; `from_id` is exclusive and `limit` is capped at 1,000. Completeness must be established **before advancing the persisted cursor**. Select one tested traversal: ascending durable order with all pages drained, or a stable completed-session snapshot exhausted with pagination. Under a newest-first read, remembering the first/highest ID after page one and polling above it discards the unseen backlog. Do not interpret a 1,000-item page as a complete session merely because it is the maximum page size.

Check `has_more`, reconcile native IDs/counts and preserve collection status. Advance the high-water mark only after the full intended range is collected and stored. Reconcile completed sessions if late persistence can expose older IDs. The specific endpoint and general session-pagination prose differ enough that the implementation must test sort direction rather than copying a “last returned ID” recipe blindly. Both `workspaces:read` and `agents:read` are required; a documented missing-scope 500 is a collection error, not a clean empty result. Failed/partial collection remains an evidence warning.

## 5. `pick()` is not credential authorization; one DENY is not quarantine

`pick()` in a TypeScript agent, or the Native agent's explicit tool manifest, limits the tools exposed to that agent's loop. It helps minimize model capabilities. It is **not the credential proxy's resource/operation/actor authorization policy**. A selected `github_issues_create` tool can still target unintended repositories unless the actual credential policy constrains it. Conversely, a visible tool can be refused by the proxy. The proof requires the credential rule and native evaluated outcome, not only an SDK/tool-list screenshot. [GitHub tool selection](https://docs.guild.ai/integrations/github), [proxy policy](https://docs.guild.ai/platform/credential-policies).

New credentials receive an unscoped allow-all policy. Adding a scoped ALLOW may hide that default row in the UI while leaving its fallback active. Remove it once the narrowly required allows cover both monitored workloads and the investigator, then verify the effective configuration. A targeted DENY can override allow-all, but its success does not imply the baseline is generally least-privilege. Preserve the policy table/footnote and actual target/control outcomes.

The containment claim is exactly: **the reviewed policy restricted subsequent requests matching this credential, selected operation, target agent, workspace and tested resource/method conditions**. Other operations, other credentials, other integrations and unmatched resources remain outside the tested DENY. Do not say “the agent is quarantined,” “all data access is revoked” or “the attack is contained” without separately proving those broader paths. Native policy support for repository constraints does not guarantee the security event contains a repository field suitable for resource-level detection.

Prove a fresh target `DENY` with `POLICY_DENIED`, the exact applied rule/scope, and the fresh control's expected result. Credential unavailability or platform-access errors do not prove the selected policy matched. If both agents fail, selective continuity failed. If the target succeeds, the claimed restriction failed. A session stop, trigger pause, agent archive or global credential disconnect is a deliberate alternate mode with a different availability/security scope; it is never an automatic substitute retaining the original claim.

## 6. Viability judgment and corrections

**Conditional yes.** A fixed native approval-event predicate avoids the unclosed delivered-data correlation dependency and makes the readiness-driven plan more credible. A bounded Native investigator and one built-in GitHub integration keep its useful agent workflow small. The product still depends on actual native security-event population, authenticated actor/credential identity, complete pagination, an honest window clock, real scoped policy effect and fresh control success. Documentation alone closes none of those account-level gates. If they fail, keep the dependent live claim pending, diagnose the supported path and complete independent local code/UI/tests/review. Any observed monitoring/review or deliberately broader control is labeled as the narrower result, not selective restriction proved by elapsed time.

The model adds approved-purpose and exception context and writes an actionable real incident. It must not declare malice, change the budget or approve its own containment. External tool content remains untrusted. This is a concrete permission-use safeguard with residual-access proof, not a claim of a novel autonomous security platform.

Final corrections for the synthesized plan:

- Trigger association is one trigger; documented session access and agent routing are broader than investigator-only scope.
- Many security events may map to one authenticated actor; historic outcome enrichment needs an exact native one-to-one call relation or stays unmatched.
- Historic ALLOW counters remain permission decisions. The core control must independently return an inspected expected synthetic result after the DENY.
- Native `created_at` is the proposed record clock; UUIDv7 ordering and collector arrival are separate concepts. Drain all relevant pages before advancing the cursor.
- Explicit tools/`pick()` reduce the loop's catalog; credential policies enforce request authorization. Remove default allow-all before claiming a restricted baseline.
- Claim only tested subsequent matching-call restriction. Complete the full core against actual evidence gates; optional outcome joins need exact correlation after core readiness and no new infrastructure. Finite request/test timeouts and repeated-failure diagnosis govern individual operations, not the total build duration or permission to stop required work.
