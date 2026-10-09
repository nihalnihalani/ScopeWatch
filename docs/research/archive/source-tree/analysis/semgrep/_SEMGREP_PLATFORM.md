> Imported historical/advisory research. This is not current build authority; follow the ScopeWatch architecture/contracts and START_HERE. Original research date and qualifications remain below.

# Semgrep platform: what to build on for the 9 Oct 2026 Cyberdefense hackathon

Written 2026-10-08. Each claim is labelled as either **verified**, with its source, or *inference*. Re-check CLI flags at kickoff with `semgrep --version` and `semgrep scan --help`. Semgrep is **not installed** on this machine (`semgrep: not found`). Nothing was installed.

## 0. What Semgrep rewarded last time (verbatim)

From the **AWS AI Agents Hackathon, 10 Oct 2025** prize section (https://aws-agentic-ai-hackathon.devpost.com/, fetched 2026-10-08):

> **Best Use of Semgrep** — 3 winners
> **1st Place: $2,500** — *Generate Rules for Agents*: Create an agent that helps customize your security experience. Incorporate an agentic workflow that improves security
> **2nd Place: $1,500** — Write a rule to check your code or any agents for custom security practices.
> **3rd Place: $1,000** — Run a Semgrep scan that finds no vulnerabilities of any generated or code you write.

The overall judging criteria were each worth 25%:
- **Idea**: "vertical-specific agent using advanced reasoning, action, and tool use".
- **Technical implementation**: "Surprise and inspires judges… through the **novel use of tools** in a unique way".
- **Tool Use**: "Integration of **at least 3 sponsor tools**".
- **Presentation**: "live demo in 3-minutes… 1 overview slide".

Teams had a 3-minute demo, and Devpost required a 3-minute recording.

**Semgrep's retrospective** (semgrep.dev/blog/2025/what-a-hackathon-reveals-about-ai-agent-trends-to-expect-2026, by Jayson DeLancey and Braden Riggs) organised the winners as trends:
- **MCP is the backbone.** The post shows `semgrep mcp` running locally via the CLI.
- **Trend 1**, multiple LLMs: Darwin.
- **Trend 2**, LLM coaching / best practices: CommitDNA.
- **Trend 3**, vibe-coding securely in the browser: Udon Cat.
- **Trend 4**, malicious IDE extensions and MCP servers: **AgentSafe**. It vetted MCP servers *before connecting* by running Semgrep on the server's public code and checking the vendor's posture in Vanta. This was a "pre-flight inspection" that Semgrep praised heavily, though it is not among the three Semgrep-prize winners in our data.

Recurring phrases in Semgrep's own language: "deterministic", "predictable results", "fast", "shift left", "in-workflow", "before it leaves the browser", "pre-flight inspection".

**2026 judges from Semgrep** (luma.com/cyberhack, verified): **Milan Williams (Product)** and **Daghan Altas (Head of Product)**. Both are product people, so *inference*: they reward alignment with the current product roadmap below. The 2026 Semgrep prize wording was **not found** on the Luma page. Ask at the kickoff, and assume tiers similar to 2025's.

## 1. Semgrep's developer surface as of Oct 2026 (verified from semgrep.dev blog posts and GitHub)

| Surface | What it is now | Source |
|---|---|---|
| **Semgrep CLI** (OSS / Community Edition) | `semgrep scan --config <pack or rule.yaml> --json/--sarif`. Latest release **v1.180.0, 2026-10-07**. Registry packs such as `p/default`, `p/security-audit`, `p/python`, `p/owasp-top-ten`, `p/secrets`. `semgrep --test` runs rule unit tests | GitHub releases API |
| **Semgrep MCP server** | Now **built into the `semgrep` binary**: run `semgrep mcp` (the standalone `semgrep/mcp` repo is deprecated). An experimental hosted server is at `https://mcp.semgrep.ai/mcp`. **Tools** (from `cli/src/semgrep/mcp/server.py` `register()` on `develop`): `semgrep_scan`, `semgrep_scan_with_custom_rule`, `semgrep_scan_remote`, `semgrep_scan_supply_chain`, `get_abstract_syntax_tree`, `get_supported_languages`, `semgrep_rule_schema`, `semgrep_findings` (AppSec Platform, token required), `semgrep_whoami`. **Prompts:** `write_custom_semgrep_rule`, `setup_semgrep_mcp`. **Resources:** `semgrep://rule/schema`, `semgrep://rule/{rule_id}/yaml`. **Hooks** in the package: `post_tool`, `inject_secure_defaults`, `stop`, `supply_chain`. There is also `finding_elicitation` (MCP elicitation for findings) | github.com/semgrep/semgrep `cli/src/semgrep/mcp/`; semgrep/mcp README |
| **Semgrep Guardian** | A plugin for Claude Code, Cursor, Codex, Replit, Copilot, Kiro and others. It bundles **MCP server + Hooks + Skills** and scans every file an AI agent writes, the moment it's written (Code + Supply Chain + Secrets). "3M scans/week, 95% under 5 s". Official partner of Cursor and Claude Code | blog "Introducing Semgrep Guardian" (2026) |
| **Agentic Workflows** (public beta) | 9 prebuilt workflows covering 70+ CWEs (SQLi, XSS, SSRF-like, command injection, NoSQL, weak crypto, API audit…). They combine **Pro Engine taint/interfile analysis + "Mandoline" code slicer + frontier models (Claude Opus)**. Semgrep claims "3.5× more true positives than Opus 4.8 alone, at 19% lower cost per TP". **Custom Agentic Workflows**: a Python SDK, a library of Semgrep and AI tools, a CLI for local dev, and managed orchestration | blog "Introducing Semgrep Agentic Workflows" (2026) |
| **New rulesets** | **AI Security** (27 rules: prompt injection, unrestricted tool use), **Agent Skills** (122 Pro rules: malicious agent skill files for Claude Code, Cursor, Windsurf, Codex, Continue), **Shadow AI** (186 rules: hardcoded LLM keys, missing guardrails, insecure agent/tool configs), plus OWASP LLM Top 10 coverage | blog "Getting ready for Mythos" (2026) |
| **Autofix** (public beta) | Generates fix PRs for SAST **and** SCA, with breaking-change analysis for dependency upgrades | same |
| **Supply Chain: Malware Detection & Response** | Rules generated within minutes of an incident, then org rescan, notifications, and policy-driven Jira/Slack/webhook responses. A **Malware Firewall** (private beta) runs inside Guardian | blog "Introducing Malware Detection and Response Automation" (2026) |
| **AppSec Platform API** | REST over `https://semgrep.dev/api/v1/…` with `Authorization: Bearer $SEMGREP_APP_TOKEN`: list deployments, projects and findings (with filters), triage. *Verify the endpoint names in the docs before relying on them* | general knowledge; not re-verified today |
| **Semgrep Assistant** | AI triage (true/false positive, with reasoning), remediation guidance, memories; a BYO-model picker (the blog mentions provider selection) | 2025 blog; product pages |

**Industry framing Semgrep is pushing right now** (Mythos post): frontier models favour offense ("Mythos" class models), AI writes most code, and **deterministic analysis plus AI reasoning beats AI alone**. Any build that shows **"LLM proposes, Semgrep deterministically verifies"** is on-message.

## 2. Integration options ranked by how impressive and load-bearing they'd look to Semgrep judges

### Rank 1: Agent that **writes, tests and deploys custom Semgrep rules** from a threat signal (2025 tier 1 + tier 2 in one loop)

The story: a new CVE, an incident report, or an exploit attempt in your logs arrives. An agent turns it into a Semgrep rule, proves the rule with positive and negative tests, then sweeps every repo for variants. It can also hand the rule to Guardian/MCP so agents never write the pattern again. This lines up with Semgrep's own "expert-verified, automated rule generation within minutes" (Malware D&R) and Custom Agentic Workflows.

```python
# rulegen_agent.py: LLM drafts a rule, Semgrep is the deterministic judge
import json, subprocess, tempfile, pathlib

def semgrep_test(rule_yaml: str, vuln: str, safe: str, lang_ext=".py") -> dict:
    d = pathlib.Path(tempfile.mkdtemp())
    (d / "rule.yaml").write_text(rule_yaml)
    # semgrep --test convention: test file shares the rule's basename;
    # annotate expected matches with `# ruleid: <id>` and non-matches with `# ok: <id>`
    (d / f"rule{lang_ext}").write_text(vuln + "\n" + safe)
    r = subprocess.run(["semgrep", "--test", "--json", str(d)], capture_output=True, text=True)
    return json.loads(r.stdout or "{}")

def sweep(rule_path: str, target: str) -> list[dict]:
    r = subprocess.run(["semgrep", "scan", "--config", rule_path, "--json",
                        "--metrics=off", target], capture_output=True, text=True)
    return json.loads(r.stdout)["results"]   # check_id, path, start.line, extra.message/severity/lines
```

```yaml
# Example agent-authored rule (taint mode): LLM output flowing into a shell
rules:
  - id: llm-output-to-shell
    mode: taint
    languages: [python]
    severity: ERROR
    message: LLM/tool output reaches a shell sink without allow-listing (prompt-injection → RCE)
    metadata: {cwe: "CWE-78", category: security, generated-by: rulegen-agent}
    pattern-sources:
      - pattern: $CLIENT.messages.create(...)
      - pattern: $AGENT.run(...)
    pattern-sanitizers:
      - pattern: shlex.quote(...)
    pattern-sinks:
      - pattern: subprocess.run($CMD, ..., shell=True, ...)
      - pattern: os.system($CMD)
```

Via MCP instead of the CLI, the agent calls these tools in order:
1. `semgrep_rule_schema`, to stay schema-valid.
2. The `write_custom_semgrep_rule` prompt.
3. `semgrep_scan_with_custom_rule(code_files, rule)`.

Demo beat: show the rule YAML appearing, then the green `semgrep --test` result, then "found 3 more variants across 4 repos".

### Rank 2: Semgrep as the **gate in an autonomous remediation loop** (scan → patch → re-scan clean → PR)

This is the Cyberdefense "Autonomous remediation: patch, harden, and verify fixes" track. It does what Udon Cat skipped (the re-scan) and literally satisfies the 2025 tier-3 criterion "finds no vulnerabilities". Darwin's tournament idea can be layered on: several models propose patches, and the one that makes Semgrep go clean *and* passes tests wins.

```python
def remediate(repo, finding, propose_patch, max_iters=3):
    for _ in range(max_iters):
        patch = propose_patch(finding)                 # LLM (Claude via Bedrock/Anthropic API)
        apply(repo, patch)
        after = sweep(f"r/{finding['check_id']}", repo)  # re-run the SAME rule (registry id) or the local rule file
        still = [r for r in after if r["path"] == finding["path"]]
        if not still and run_tests(repo):
            return open_pr(repo, patch, evidence={"before": finding, "after": "0 findings"})
        revert(repo, patch)
    return escalate_to_human(finding)                   # fail closed (Darwin failed open)
```

On screen, show a before/after panel: rule ID, file:line, the diff, then **"Semgrep: 0 findings ✓ / tests ✓"**.

### Rank 3: **Semgrep MCP + hooks inside your agent** (Guardian pattern): scan every file the agent writes, in-loop

Run `semgrep mcp` as an MCP server for your agent (Claude Agent SDK, Guild agent, etc.). After every write or edit tool call, call `semgrep_scan` on the touched file. Block or self-repair before commit. That is Semgrep's flagship 2026 product motion (Guardian = MCP + Hooks + Skills).

```jsonc
// .mcp.json (Claude Code / Agent SDK)
{ "mcpServers": { "semgrep": { "command": "semgrep", "args": ["mcp"] } } }
// hosted alternative (experimental): {"type":"streamable-http","url":"https://mcp.semgrep.ai/mcp"}
```

Stream the actual MCP tool-call names into your UI (`semgrep_scan`, `get_abstract_syntax_tree`, `semgrep_scan_supply_chain`). CommitDNA's UI did exactly this, though it was scripted. Do it for real.

### Rank 4: **Agent and MCP supply-chain pre-flight** (the AgentSafe pattern plus the new AI rulesets)

Before your defense agent installs a package, loads an MCP server or a skill file, it:
- runs `semgrep_scan_supply_chain` (malicious or vulnerable deps);
- scans the server or skill source with the **Agent Skills / AI Security / Shadow AI** rulesets and `p/secrets`;
- refuses the install when anything is high severity.

This is extremely on-trend: s1ngularity, shai-hulud, malicious MCP servers, and Semgrep's malware firewall. Note that the Agent Skills pack is **Pro** (needs login). Have a fallback that uses community packs plus your own rules.

### Rank 5: **AppSec Platform API + analytics** (findings as a data stream)

`semgrep ci` or `semgrep scan --json` pushes findings into ClickHouse (pairing with another sponsor). Build dashboards for MTTR, findings introduced by agents vs. humans, and fix rate. That mirrors Guardian's "track how many issues agents introduced vs fixed" pitch. Use `semgrep_findings` (MCP) or the REST API (`/api/v1/deployments/{slug}/findings`) if you have a token. This is good for the multi-sponsor criterion, but less "Semgrep-novel" on its own.

### Rank 6 (baseline only): one CLI scan converted to a score (Darwin style)

A subprocess call plus a severity-weighted score. It is cheap and won 2025's lowest tier. Only do this as a component of ranks 1–3, and **show the findings**, not just a number.

## 3. Practical CLI cheat-sheet (verify flags at kickoff)

```bash
pip install semgrep  # or brew install semgrep
semgrep scan --config p/default --json -o findings.json .   # JSON: results[].check_id/path/start.line/extra.{severity,message,lines,metadata}
semgrep scan --config p/security-audit --config p/secrets --sarif -o out.sarif .
semgrep scan --config ./rules/ --autofix .                  # applies rules' `fix:` keys (deterministic autofix)
semgrep --test ./rules/                                     # rule unit tests (# ruleid: / # ok: annotations)
semgrep scan --config r/python.lang.security.audit.md5-used-as-password.md5-used-as-password .
semgrep login && semgrep ci                                 # AppSec Platform (Pro rules, Supply Chain, Secrets, dashboards)
semgrep mcp                                                 # MCP server (stdio) from the same binary
```

- Exit codes: `semgrep scan` exits 0 even when it has findings unless you pass `--error`. Gate on `results` length or on `--error`. Darwin never checked either.
- First-run registry download can take seconds. Pre-warm the packs before the demo, and use local rule files for the live path.
- `--config auto` requires metrics to be on. The MCP code raises an error when `SEMGREP_SEND_METRICS=off` and the config is auto (`server.py get_semgrep_scan_args`).

## 4. Demo rules for Semgrep judges (derived from the 3 winners)

1. Name Semgrep in the first 10 seconds and badge it in the UI (all three winners did).
2. Show a **real rule ID + message + file:line** (only Udon Cat did, and it reads as most credible).
3. Make Semgrep *decide* something: rank, gate, verify. Darwin's 40% weight was the judge-facing hook.
4. Use Semgrep in a **loop** (generate → verify, fix → re-scan) rather than a one-shot scan. CommitDNA's "Vulnerability Factory" verify-loop was its standout claim.
5. Custom rules plus MCP plus agentic is the top tier. None of the 2025 winners actually demonstrated a custom rule live. **That gap is your opening.**
6. Do not fail open, fabricate numbers or script the logs. The 2026 judges are Semgrep *product* leads and will spot invented rule IDs.
