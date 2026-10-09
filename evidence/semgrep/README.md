# Semgrep scans of ScopeWatch's own AI-generated source

**Result: 0 findings in all three scans. No Semgrep finding is claimed.** No defect was inserted or requested to create one.

| Scan | Commit | Rulesets (public registry, `--metrics=off`, no login) | Paths | Files | Findings | Errors |
|---|---|---|---|---|---|---|
| `scan-1-original/` | `c28492f` | p/default, p/typescript, p/nodejs, p/secrets, p/javascript | src, tools, guild-agents | 68 | 0 | 0 |
| `scan-2-audit/` | `c28492f` | p/security-audit, p/owasp-top-ten, p/react, p/sql-injection, p/xss, p/command-injection, p/jwt | src, tools, guild-agents (tests/support requested but skipped by Semgrep's default test-path ignores) | 68 | 0 | 0 |
| `scan-3-guardian-ai-current/` | `d5ed715` | p/guardian-default, p/ai-best-practices | src, tools, guild-agents | 70 | 0 | 0 |

Tool: Semgrep CLI 1.180.0 (pip, isolated venv). The working tree at scan time also contained two in-progress, untracked
demo tools (`tools/demo-record.ts`, `tools/demo-server.ts`) that were included in the scanned paths.
Raw JSON output is preserved unmodified in each folder; `stderr.log` holds the CLI log.

The third scan ran on 10 October 2026 IST (9 October 18:48:28–18:48:36 UTC) against a clean current source tree,
using the same CLI version and metrics disabled. This was **local Community Edition**, not the hosted Guardian
service. The scan loaded 359 code rules and ran 165 applicable rules; zero skipped-rule entries or scan errors
were reported. `scan-3-guardian-ai-current/receipt.json` records the full commit, source hashes, scan surface,
configuration names, timestamps and counts. It does not establish hosted Code/Supply Chain/Secrets coverage.

Semgrep is now an active sponsor target under the human's 10 October instruction. A finding claim still requires
real detector output, a reachable consequence and legitimate control, original discovery chronology, a repair
and actual rescan. The completeness audit's already identified semantic defects remain **manual-first**;
a later custom rule matching them would be confirmation/regression coverage, not original Semgrep discovery.

Not done: the sponsor's remote **Semgrep Guardian** route (Claude Code plugin + OAuth, fixed `guardian-default` rules)
requires a human browser sign-in and was not run. A clean public-ruleset scan is not a proof of absence of
vulnerabilities; the app's authority boundaries are covered by its own adversarial tests instead.
