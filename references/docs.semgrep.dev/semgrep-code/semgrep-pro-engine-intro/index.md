---
source_url: "https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro"
capture_time_basis: "existing raw file mtime"
captured_at: "2026-10-08T19:26:03.854505+00:00"
normalized_at: "2026-10-09T07:47:21.933868+00:00"
reuse_of: ".firecrawl/semgrep-pi-pro-analysis.md"
source_kind: "current documentation"
published_date: null
normalization: "trim preamble before first level-one heading; preserve remaining markdown examples/tables"
raw_sha256: "5f6b2abd7746b9058d32c929ebe55486212c75c4d18c658781ae23d9e2a6e2cf"
body_sha256: "3488b7c9426e0683bfc5047c12a1e77cbfa2b9432bbb290cb23d229489fff5dc"
---

# Perform cross-file analysis

Copy pageCopy page

Use Semgrep Code’s **cross-file (interfile) analysis** to detect vulnerabilities across files and folders within a project.

Copy pageCopy page

By design, Semgrep open source software, Semgrep Community Edition (CE), can only analyze interactions within a single function, also known as **intraprocedural analysis**. This limited scope makes Semgrep CE fast and easy to integrate into developer workflows.Semgrep Code runs **cross-function (interprocedural)** analysis by default, and gives security teams the option to trade off speed for better results and deeper analysis with **cross-file analysis**. By analyzing interactions across files and functions, Semgrep Code can reduce noise, uncover new vulnerabilities, and make results easier to understand.

**LANGUAGE SUPPORT**Refer to [Supported languages](https://docs.semgrep.dev/supported-languages) to see languages supported by Semgrep Code.

## [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#run-cross-file-analysis)  Run cross-file analysis

This section guides you through installing the proprietary cross-file (interfile) analysis binary and helps you to scan your projects both in CLI and with Semgrep AppSec Platform.

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#run-cross-file-analysis-with-semgrep-appsec-platform)  Run cross-file analysis with Semgrep AppSec Platform

**PREREQUISITE**You have completed a [Semgrep core deployment](https://docs.semgrep.dev/deployment/core-deployment).

This is the preferred method to run cross-file analysis. It enables you to view and triage your findings from a centralized location. Your source code is not uploaded.

1

Sign in to [Semgrep AppSec Platform](https://semgrep.dev/login).

2

Go to **[Settings > General > Code](https://semgrep.dev/orgs/-/settings/general/code)**.

3

Click the **Cross-file analysis** toggle to turn on this feature.

4

Ensure that you have a [remediation policy](https://docs.semgrep.dev/semgrep-appsec-platform/unified-policies/get-started#manage-remediation-policies) to determine the actions Semgrep performs whenever a rule generates a finding.

**Full scans** now include cross-file analysis. You can trigger a full scan through your CI provider. Note that cross-file analysis does **not** currently run on diff-aware (pull request or merge request) scans.

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#run-cross-file-analysis-in-the-cli)  Run cross-file analysis in the CLI

**PREREQUISITE**

- Local installation of Semgrep CLI. See [Getting started with Semgrep](https://docs.semgrep.dev/getting-started/quickstart) to install Semgrep CLI.

1

Sign up or sign in to [Semgrep AppSec Platform](https://semgrep.dev/login).

2

For first-time users, click **Create an organization**. Note that you can further integrate organizations (orgs) with GitLab accounts and GitHub accounts, including personal and org accounts, after you complete this procedure.

3

Go to **[Settings > General > Code](https://semgrep.dev/orgs/-/settings/general/code)**.

4

Click the **Cross-file analysis** toggle to turn on this feature.

5

Ensure that you are in the **root directory** of the repository you want to scan.

6

In your CLI, log in to your Semgrep AppSec Platform account and run a scan:

```
semgrep login && semgrep ci
```

#### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#update-cross-file-analysis-in-the-cli)  Update cross-file analysis in the CLI

Cross-file analysis uses a separate `semgrep` binary. To update to the latest version, follow these steps:

1

Update your Semgrep CLI tool with the following command:

- macOS

- Linux

- Windows

- Docker


Use pipx ( [https://pipx.pypa.io/stable/how-to/install-pipx/](https://pipx.pypa.io/stable/how-to/install-pipx/)) or uv ( [https://docs.astral.sh/uv/](https://docs.astral.sh/uv/)):

```
pipx upgrade semgrep
# or
uv tool upgrade semgrep
```

Alternatively, use Homebrew:

```
# best-effort: install through Homebrew (maintained on a best-effort basis; often lags behind the latest release)
brew upgrade semgrep
```

Using pipx ( [https://pipx.pypa.io/stable/how-to/install-pipx/](https://pipx.pypa.io/stable/how-to/install-pipx/)) or uv ( [https://docs.astral.sh/uv/](https://docs.astral.sh/uv/)):

```
pipx upgrade semgrep
# or
uv tool upgrade semgrep
```

```
    # ensure that you have Python 3.9 or later installed
    # before proceeding

    pipx upgrade semgrep
    # or
    uv tool upgrade semgrep
```

```
    docker pull semgrep/semgrep:latest
```

2

Log in to Semgrep AppSec Platform:

```
semgrep login
```

3

Update the Semgrep cross-file binary:

```
semgrep install-semgrep-pro
```

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#write-rules-that-analyze-across-files-and-functions)  Write rules that analyze across files and functions

To create rules that analyze across files and functions, add `interfile: true` under the `options` key when defining a rule. This key tells Semgrep to use the rule for both cross-function and cross-file analysis.

#### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#cross-function-example)  Cross-function example

The following example shows how to define the `interfile` key (see the **Rule** pane) and the resulting cross-function analysis in the **Test code** pane.

Click **Run** to see the true positive in lines 27-30.Semgrep Code performed cross-function analysis as the `userInput()` source was called in `main()` while the `exec()` sink was called in the `DockerCompose` class.Interact with the rule widget to compare Semgrep Community Edition (CE) and Semgrep Code. In the **Rule** pane, you can remove the lines:

```
options:
  interfile: true
```

This results in a failure to detect the true positive, because Semgrep did not perform cross-function analysis.

## [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#known-limitations-of-cross-file-analysis)  Known limitations of cross-file analysis

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#commonjs)  CommonJS

Currently Semgrep’s cross-file analysis does not handle specific cases of CommonJS where you define a function and assign it to an export later. Cross-file analysis does not track the code below:

```
function get_user() {
    return get_user_input("example")
  }

module.exports = get_user
```

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#regressions-in-cross-file-analysis)  Regressions in cross-file analysis

Cross-file analysis resolves names differently than Semgrep CE’s analysis. Consequently, rules with `interfile: true` may produce different results than Semgrep CE. Some instances could be regarded as regressions; if you encounter them, please file a bug report. When you need to report a bug in Semgrep’s cross-file analysis, go through [Semgrep Support](https://docs.semgrep.dev/support). You can also contact us through [Semgrep Community Slack group](https://go.semgrep.dev/slack).

## [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#appendix)  Appendix

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#types-of-semgrep-code-analysis)  Types of Semgrep Code analysis

**Cross-file (interfile) analysis**

- Cross-file analysis finds patterns spanning multiple files within a project to help security engineers deeply understand their organization’s security issues. This analysis reduces noise and detects issues that Semgrep CE can’t find.
- Cross-file analysis runs on full scans. These scans may take longer to complete and can use more memory than Semgrep CE scans. See the available languages for cross-file analysis in [Supported languages](https://docs.semgrep.dev/supported-languages#semgrep-pro-engine).
- In Semgrep Code, cross-file analysis includes cross-function analysis as well.

**Cross-function (interprocedural) analysis**

- Cross-function analysis finds patterns within a single file spanning code blocks and functions.
- Semgrep Code scans run cross-function analysis by default.
- See an example of cross-function analysis in [Semgrep Code cross-function example](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro#pro-engine-cross-function-example).
- See the available languages for cross-function analysis in [Supported languages](https://docs.semgrep.dev/supported-languages#semgrep-pro-engine).

#### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#semgrep-code-cross-file-ci-scan-issues)  Semgrep Code cross-file CI scan issues

To provide reliably completed scans, Semgrep Code can **fall back** from cross-file analysis to single-file analysis. This ensures that in the vast majority of cases, scans run successfully.By default, if a scan uses more than **5 GB** of memory during cross-file pre-processing, the scan uses single-file analysis to ensure lower memory consumption. Similarly, if a cross-file scan doesn’t complete after 3 hours, the analysis times out and Semgrep re-scans the repository using single-file analysis. Typically, this happens because the repository is very large.If 1-2 repositories cause CI scan issues and scanning these repositories with interfile analysis is not critical, modify your configuration file to use `semgrep ci --pro-intrafile`. This overrides the Semgrep AppSec Platform setting for these repositories, and always runs these scans with single-file, cross-function analysis.If many repositories cause scan issues, or you have critical repositories you are unable to scan with Semgrep’s interfile analysis:

1

Disable the **Cross-file analysis** toggle in the **[Settings > General > Code](https://semgrep.dev/orgs/-/settings/general/code)** page of your organization.

2

Review scan troubleshooting guides such as [A Semgrep scan is having a problem - what next?](https://docs.semgrep.dev/kb/semgrep-code/semgrep-scan-troubleshooting) or [Troubleshooting “You are seeing this because the engine was killed.”](https://docs.semgrep.dev/kb/semgrep-code/scan-engine-kill)

3

If you need additional guidance, [contact Semgrep Support](https://docs.semgrep.dev/support), or reach out to the Semgrep team in the [Semgrep Community Slack](https://go.semgrep.dev/slack) so we can help you resolve the issue and create a plan for your organization.

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#difference-between-cross-file-analysis-and-join-mode)  Difference between cross-file analysis and join mode

Cross-file analysis is different from [join mode](https://docs.semgrep.dev/writing-rules/experiments/join-mode/overview), which also allows you to perform cross-file analyses by letting you join on the metavariable matches in separate rules. Join mode is an experimental feature which is not actively developed or maintained. You may encounter many issues while using join mode.

### [​](https://docs.semgrep.dev/semgrep-code/semgrep-pro-engine-intro\#feedback-for-semgrep-code%E2%80%99s-advanced-analyses)  Feedback for Semgrep Code’s advanced analyses

The team at Semgrep is excited to hear what’s on your mind. As you explore these features, we want to know what you’d like to be able to capture with it. We believe that this deeper analysis helps users find more vulnerabilities, build trust with developers, and enforce code standards quickly. Let us know what you think about the results in the [Semgrep Community Slack](https://go.semgrep.dev/slack).

Was this page helpful?

YesNo

[Suggest edits](https://github.com/semgrep/semgrep-docs/edit/main/docs/semgrep-code/semgrep-pro-engine-intro.mdx)

[Semgrep Supply Chain](https://docs.semgrep.dev/semgrep-supply-chain/ignoring-dependencies) [Unified Policies](https://docs.semgrep.dev/semgrep-appsec-platform/unified-policies/overview)

[x](https://x.com/semgrep) [github](https://github.com/semgrep/semgrep) [linkedin](https://www.linkedin.com/company/semgrep)

Assistant

Responses are generated using AI and may contain mistakes.