# BoundaryProof: finding feasibility and revised case priority

> **Current execution policy:** [Start now or anytime, with no build cutoff](../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Primary-source catalog audit, 9 October 2026 IST. No target was generated or executed, no exploit was written, and no Semgrep scan was run. **There is no actual generated-code finding from this audit.** It establishes published rule availability and limitations so the team can select a real finding during the event.

## Revised decision

Do not make warm-cache authorization the mandatory centerpiece of a money-oriented Semgrep entry. No rule for that specific permission/cache behavior was established in the published Guardian-default bundle. Preserve BoundaryProof as a source-to-runtime-to-verified-fix product, but select the actual case from observed generated code and actual scan results.

1. **First preference: an observed JWT trust failure with a Guardian rule**, where unverified claims determine a tenant, role or privileged action. Signature verification disabled is a stronger anchor than merely decoding a token. Decoding for display or decoding after independent verification can be benign. An interesting impact chain can distinguish the finding; the JWT bug class itself is established.
2. **Second: an observed outbound destination flaw found by an explicit stock CLI registry scan.** Flask/requests SSRF and Python MCP SSRF have public community rules. A validated first destination that subsequently redirects to an unapproved destination could provide the interesting behavior, but the inspected rules do not themselves establish the redirect chain or data disclosure. Remote Guardian coverage for these checked IDs was not found.
3. **Third: cache permission/revocation behavior**, if a real finding exists and custom-rule or Pro/Workflow eligibility and access are settled. This remains a useful and dramatic defense benchmark, but has the weakest default-scanner premise.
4. **Fallback: secret logging or credential-bearing tool responses.** Existing stock rules offer straightforward evidence, but the finding must disclose a synthetic canary through an actual protected boundary; routine hardcoded-secret detection is less distinctive. Exact logging syntax matters.

This is a conditional priority for attributable evidence and event feasibility, not a forecast of prize odds. Do not force ordinary generated code into a prepared rule shape or insert a flaw to fill the chosen case.

## What was actually audited

The docs-linked [public Guardian configuration](https://semgrep.dev/c/p/guardian-default) was fetched through Firecrawl as raw response text and parsed as YAML. It contains **332 rules**, all with registry metadata `origin: community` in this snapshot. The earlier Markdown-derived response contained 331 IDs; the later raw response additionally contains `generic.secrets.security.detected-aws-session-token.detected-aws-session-token`. The cause of that difference was not established. The checksummed raw response defines this audit's snapshot; the two fetches are not claimed byte-equivalent.

The [AI best-practices configuration](https://semgrep.dev/c/p/ai-best-practices) contains **27 rules**, `missed: 0`, with community origins. Its rule-ID intersection with the Guardian bundle is **zero**. Neither count proves the authenticated hosted service executed the same configuration, that a target matches a rule, or that the reported site is exploitable. Additional hosted Secrets/Supply Chain services are outside this public code-rule snapshot.

| Snapshot | Saved raw response | Saved time, UTC | SHA-256 |
|---|---|---|---|
| Guardian-default | `.firecrawl/completion-semgrep-guardian-config.raw.html` (plain YAML content) | 2026-10-08 19:52:54 | `156462e998d02e348318d145032037fbb78bab7dcd40648ebdd09ffb52266126` |
| AI best practices | `.firecrawl/completion-semgrep-ai-pack.raw.yaml` | 2026-10-08 19:56:59 | `c623efdb571a3c1dbb533fae0e62761a96bbd9a8b59714e94b8282f5b06bc7af` |

These UTC timestamps fall on 9 October IST. `.firecrawl/completion-semgrep-catalog-audit.json` preserves counts, checksums and all observed IDs. The current official community-rule tree was also fetched, at commit [`a84ff9cc2453ca91d581380de4b8b3f272f6f4be`](https://github.com/semgrep/semgrep-rules/tree/a84ff9cc2453ca91d581380de4b8b3f272f6f4be), with an untruncated 4,932-entry GitHub tree response.

## Exact existing rule options

The IDs below were read from public registry YAML, including actual patterns, not guessed from project descriptions. Presence means catalog presence, not a detected vulnerability.

| Finding candidate | Exact rule ID | Public Guardian bundle? | Inspected semantics / limitation |
|---|---|---|---|
| Python disabled JWT verification | `python.jwt.security.unverified-jwt-decode.unverified-jwt-decode` | Yes; version `5PTo12w` | Matches `jwt.decode` with `options` containing `verify_signature: False`, including the options-variable form. Does not prove the decoded claims control authorization. |
| JS JWT decode without verify | `javascript.jsonwebtoken.security.audit.jwt-decode-without-verify.jwt-decode-without-verify` | Yes; `LjTkgpe` | Matches `jsonwebtoken` decode, excluding particular surrounding same-token verify patterns. Metadata confidence is LOW. Verification elsewhere or nonsecurity display can make a site benign. |
| Python JWT none algorithm | `python.jwt.security.jwt-none-alg.jwt-python-none-alg` | Yes; `JdTzxYj` | Matches encode with algorithm none or decode permitting none. A signing call does not establish that a verifier accepts a forged token. |
| JS JWT none algorithm | `javascript.jsonwebtoken.security.jwt-none-alg.jwt-none-alg` | Yes; `QkTGqQo` | Matches the inspected `require('jsonwebtoken')` plus verify-options syntax permitting none. Do not assume arbitrary wrapper or import syntax coverage. |
| Flask requests SSRF | `python.flask.security.injection.ssrf-requests.ssrf-requests` | No; registry version `rxTAKJn` | Structural route/request-data patterns reaching `requests` calls, with direct and limited intermediate-variable forms. No inspected sanitizer logic proves an allowlist or detects a later redirect hop. |
| Python MCP SSRF | `ai.ai-best-practices.mcp-ssrf.mcp-ssrf.mcp-ssrf-python` | No; AI pack; `JdTnOgr` | Taint from `@server.tool()` parameters to requests get/post/put/delete or urllib urlopen. HTTPX is not an inspected sink. `urllib.parse.urlparse(...)` is treated as a sanitizer, although parsing alone does not establish a safe destination policy. |
| Flask browser open redirect | `python.flask.security.open-redirect.open-redirect` | No; `e1Tyj2Y` | Flask request data reaches Flask redirect under route syntax. Several path forms are excluded; a surrounding Werkzeug URL-parse conditional also suppresses the rule. Metadata confidence LOW. |
| Express browser open redirect | `javascript.express.security.audit.express-open-redirect.express-open-redirect` | No; `nWT2L0v` | Taint through the inspected Express handler forms to response redirect. It concerns browser navigation, not automatically an outbound server callback or secret leak. |
| Java browser open redirect | `java.lang.security.audit.unvalidated-redirect.unvalidated-redirect` | Yes; `PkTR329` | Particular servlet parameter/string-to-sendRedirect/Location forms. Choosing Java solely for this rule adds unnecessary five-hour build risk if the team does not already use it. |
| Python credential logging | `python.lang.security.audit.logging.logger-credential-leak.python-logger-credential-disclosure` | No; `A8TgdOR` | Logger object/method and format-string regex: credential-like words plus `%s`. It is not general secret-data taint tracking; JSON header dumps, f-strings or differently named fields can fall outside this shape. |
| Python MCP credential response | `ai.ai-best-practices.mcp-credential-in-response.mcp-credential-in-response.mcp-credential-in-response-python` | No; AI pack; `l4Tp3PG` | Dictionary return from a tool with literal credential-like keys. Does not establish that the value is sensitive, unexpected for the caller, or absent elsewhere after removal. |

Primary YAML for [Python JWT verification](https://semgrep.dev/c/p/guardian-default), [JS JWT decode](https://semgrep.dev/c/p/guardian-default), [Flask SSRF](https://semgrep.dev/c/r/python.flask.security.injection.ssrf-requests.ssrf-requests), [Flask redirect](https://semgrep.dev/c/r/python.flask.security.open-redirect.open-redirect), [Express redirect](https://semgrep.dev/c/r/javascript.express.security.audit.express-open-redirect.express-open-redirect), [credential logging](https://semgrep.dev/c/r/python.lang.security.audit.logging.logger-credential-leak.python-logger-credential-disclosure), and [Python MCP rules](https://semgrep.dev/c/p/ai-best-practices) directly contains the patterns and registry metadata.

The inspected [Express SSRF rule](https://semgrep.dev/c/r/javascript.express.security.audit.express-ssrf.express-ssrf) is also community/public, but explicitly targets the `request` package in its sinks. It is not evidence of coverage for modern native fetch or Axios. A current [TypeScript MCP source rule](https://raw.githubusercontent.com/semgrep/semgrep-rules/a84ff9cc2453ca91d581380de4b8b3f272f6f4be/typescript/mcp/security/mcp-ssrf-typescript.yaml) includes fetch/Axios sinks and schema-parse sanitizers, but the guessed registry configuration returned no rules and it is absent from the inspected AI pack. Treat that one as **source-only**, not a confirmed published-registry/Guardian option. The exact published Python MCP ID came from the full pack; a shorter guessed ID had returned an empty configuration.

## CE, Pro and hosted availability

The retrieved candidate rules use public community pattern/taint constructs and do not request cross-file analysis. They are reasonable **local CE candidate configurations**, subject to actual parse/scan validation at the event. This audit did not execute them. A community origin or confidence label is not a statement that a particular generated target will match or that its complete data flow is supported.

Official [cross-file documentation](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro), already saved in the earlier pass, states CE's within-function scope, Code's cross-function scope and optional proprietary cross-file setup. Consequently authorization in helper/middleware chains and stateful cache/revocation behavior cannot be assumed covered by a public rule or CE scan.

Official [Guardian rule configuration](https://docs.semgrep.dev/semgrep-guardian/rules-and-configuration) says recommended remote Claude/Codex hooks use fixed Guardian-default, while local/policy-aware paths differ. A stock CLI scan with additional published configurations is a different scan surface; retain its actual JSON and label the surface accurately. The sponsor packet does not explicitly require Guardian-only detection, but published custom-rule eligibility was not located.

Inspection of rule bodies, not only ID keywords, found no protected-cache/tenant authorization pattern in Guardian-default. The relevant Improper Authorization categories in that bundle cover infrastructure/file-policy shapes; `enableGlobalCache` appears in a package-manager age rule and is unrelated. This does not prove that every private Semgrep service lacks cache understanding. Commercial Multimodal/Agentic Workflows advertise authorization reasoning, but access, target coverage and award eligibility remain unestablished here.

## Impact evidence required for each case

| Case | Minimum genuine behavior to demonstrate | Weakest assumption |
|---|---|---|
| JWT identity/tenant/role confusion | Unverified claims actually authorize a protected local read/action that a valid authorization path would deny; patch restores verification and permitted behavior | A decode finding might be benign, and a familiar JWT bug needs a compelling actual impact story. |
| Callback/destination boundary | The controlled service actually reaches an unapproved owned destination or exposes a synthetic canary; preserve initial and final destination evidence | Rule coverage is framework/syntax-specific; a generic SSRF flag does not prove a redirect bypass, DNS behavior or credential forwarding. |
| Warm cache / revoked permissions | The same unauthorized local request is denied cold but discloses a protected marker warm, or stays accessible after revocation | Default Guardian does not establish this finding; custom/Pro attribution and access are unresolved. |
| Secret logging/tool response | A credential-like synthetic value actually escapes its allowed audience through the log/tool response; patch removes that exposure while normal use works | A sensitive-looking key/value can be nonsensitive, and broad logging styles can evade the narrow rule. |

Never replace the target's normal HTTP client/framework or add an insecure line just to satisfy a rule. Preserve ordinary generated-code provenance and select the actual observed case. Public catalog entries, CWE metadata and HIGH confidence do not substitute for scanner output and runtime context. No second method's discovery should be attributed retroactively to Semgrep.

## Published event and organization requirements

The previously saved [public Luma event](https://luma.com/cyberhack) confirms the event, sponsors and agenda but does not publish the supplied detailed Semgrep prize conditions. Searches restricted to the sponsor/event language located no authoritative current statement resolving team-authored rules, issues diagnosed before Semgrep, deliberately seeded targets, or exact generated-code proof requirements. This is an absence in the checked public material, not a claim that organizers have no additional rules.

The [Guardian authentication documentation](https://docs.semgrep.dev/semgrep-guardian/authentication) establishes individual OAuth sign-in/account association and warns against shared tokens; an existing OAuth session takes precedence over local CLI credentials. It does **not** establish that the hackathon requires an Enterprise organization, a special generated-code attestation, a saved generation transcript or a particular repository integration. Prompt/model/output/time/hash preservation is our evidence recommendation, not a quoted prize requirement. Pi's separate Enterprise Compliance API offering is not a Semgrep access condition.

Before betting the Semgrep track on a custom cache rule, obtain the organizer/sponsor's eligibility interpretation. Without that resolution, an actual built-in/stock-rule finding with preserved evidence has the lower attribution uncertainty.

## Current Pi and competitor overlap

The earlier saved [Pi September 29 launch](https://www.pi.security/blog/powering-every-builder-with-security-context-pi-integrates-with-anthropics-compliance-api) already puts institutional context into coding sessions and records guidance outcomes. The [Lemonade case study](https://www.pi.security/customers/lemonade) already combines reproduction, source mapping, variants, repair and recurring guardrails. Pi's event provides no product access; copying those workflows is not a novelty claim.

A fresh first-party [Snyk September 17 announcement](https://snyk.io/news/agentic-ai-security-moves-into-production/) describes independent deterministic validation, generally available Secrets Detection and Agentic Development Security, a Remediation Agent in open preview, and an Agentic AppSec Agent in private preview. These are vendor availability statements, not independently measured accuracy/adoption claims. They demonstrate that **independent validation**, **agent governance** and **scan-to-remediation** are already commercial product directions. Semgrep's own current Workflows and Guardian add further overlap.

Therefore BoundaryProof's defensible distinction is a compact, inspectable case connecting the authentic scan, observed local consequence, analytics-driven investigation and an independently verified patch. It does not invent these security categories or claim universal remediation. The specific surprising finding must come from the event build.

## Durable evidence

All new evidence is saved as `.firecrawl/completion-semgrep-*`: raw Guardian and AI bundles, a full-ID/checksum audit, pinned official repository tree and source files, individual registry YAML, Guardian authentication and Snyk's September release. Developer-index/search results also preserve failed or inconclusive lookups. Existing sixteen sponsor sources were reused rather than rescraped.

The conclusion is **catalog-supported case selection at the event**, with JWT trust first, explicit stock-rule outbound flaws second, and custom/stateful cache findings conditional. No exact generated finding or winning payout is established.
