# Semgrep scans of ScopeWatch's own AI-generated source (2026-10-09)

**Result: 0 findings in both scans. No Semgrep finding is claimed.** No defect was inserted or requested to create one.

| Scan | Commit | Rulesets (public registry, `--metrics=off`, no login) | Paths | Files | Findings | Errors |
|---|---|---|---|---|---|---|
| `scan-1-original/` | `c28492f` | p/default, p/typescript, p/nodejs, p/secrets, p/javascript | src, tools, guild-agents | 68 | 0 | 0 |
| `scan-2-audit/` | `c28492f` | p/security-audit, p/owasp-top-ten, p/react, p/sql-injection, p/xss, p/command-injection, p/jwt | src, tools, guild-agents (tests/support requested but skipped by Semgrep's default test-path ignores) | 68 | 0 | 0 |

Tool: Semgrep CLI 1.180.0 (pip, isolated venv). The working tree at scan time also contained two in-progress, untracked
demo tools (`tools/demo-record.ts`, `tools/demo-server.ts`) that were included in the scanned paths.
Raw JSON output is preserved unmodified in each folder; `stderr.log` holds the CLI log.

Not done: the sponsor's remote **Semgrep Guardian** route (Claude Code plugin + OAuth, fixed `guardian-default` rules)
requires a human browser sign-in and was not run. A clean public-ruleset scan is not a proof of absence of
vulnerabilities; the app's authority boundaries are covered by its own adversarial tests instead.
