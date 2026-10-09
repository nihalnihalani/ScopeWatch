[Skip to content](https://github.com/ClickHouse/ClickHouse/pull/115466#start-of-content)

You signed in with another tab or window. [Reload](https://github.com/ClickHouse/ClickHouse/pull/115466) to refresh your session.You signed out in another tab or window. [Reload](https://github.com/ClickHouse/ClickHouse/pull/115466) to refresh your session.You switched accounts on another tab or window. [Reload](https://github.com/ClickHouse/ClickHouse/pull/115466) to refresh your session.Dismiss alert

{{ message }}

## Conversation

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=80&v=4)](https://github.com/vdimir)

### ![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=48&v=4)**[vdimir](https://github.com/vdimir)**     commented   [on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466\#issue-5193910042)•   edited by robot-clickhouse-ci-1      Loading          \#\#\# Uh oh!        There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).


Copy link


Copy Markdown

Member

`optimize_injective_functions_inside_uniq` stripped any injective function from a `uniq*` argument, on the grounds that an injective function preserves the number of distinct values. That holds for the values, but not for the rows the aggregate sees: `AggregateFunctionFactory::get` wraps `uniq*` in the `Null` combinator when an argument is `Nullable`, and that combinator skips the rows where the argument is NULL.

An injective function whose result type cannot be `Nullable` hides the nullability of its argument, so removing it turns "count every row" into "skip the NULL rows":

```
SELECT uniqExact(tuple(x)) FROM values('x Nullable(Int32)', 1, 2, NULL);
-- 2 before this change; 3 with the optimization disabled, and 3 now
```

The pass now keeps a function whenever removing it would change the argument's nullability. The affected functions are `tuple`, `bitmaskToArray` and `bitPositionsToArray` (the injective ones whose result type cannot be `Nullable`, so `makeNullableSafe` leaves it off); the affected aggregates are `uniq`, `uniqExact`, `uniqHLL12` and `uniqTheta`. `uniqCombined` and `uniqCombined64` were already protected, because the `Null` combinator changes their result type to `Nullable(UInt64)` and the pass rejects that.

This also removes a discrepancy the same rewrite caused between expressions that differ only in being constant-foldable, reported in the issue: `countDistinct(tuple(NULL))` is folded into a `ConstantNode` and so escaped the pass, while `countDistinct(tuple(arrayJoin([NULL])))` did not. All the variants return 1 now.

With `enable_analyzer = 0` the same rewrite runs in `TreeOptimizer` before types are resolved, so the nullability cannot be checked there and the old results stand; the test is tagged `no-old-analyzer`.

Closes: [#114784](https://github.com/ClickHouse/ClickHouse/issues/114784)

### Changelog category (leave one):

- Bug Fix (user-visible misbehavior in an official stable release)

### Changelog entry (a [user-readable short description](https://github.com/ClickHouse/ClickHouse/blob/master/docs/changelog_entry_guidelines.md) of the changes that goes into CHANGELOG.md):

Fixed `uniq`, `uniqExact`, `uniqHLL12` and `uniqTheta` returning a wrong result for an argument wrapped in an injective function that hides nullability, such as `uniqExact(tuple(x))` over a `Nullable` column. The `optimize_injective_functions_inside_uniq` optimization removed the wrapping function, after which NULL rows were skipped instead of counted.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

* * *

Workflow \[ [PR](https://s3.amazonaws.com/clickhouse-test-reports/json.html?PR=115466&sha=latest&name_0=PR)\]

Sync PR \[ [sync-upstream/pr/115466](https://github.com/search?q=head%3Async-upstream%2Fpr%2F115466+org%3AClickHouse+type%3Apr&type=pullrequests)\]

### Version info

- Backported to: `26.7.5.8`, `26.6.4.8`, `26.5.8.9`, `26.3.21.7`, `25.8.33.3`

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

All reactions

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)[![@claude](https://avatars.githubusercontent.com/u/81847?s=40&v=4)](https://github.com/claude)

`
          Do not strip injective functions that hide argument nullability insid…
` …

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

`
          76beaa1
`

```
…e uniq

`optimize_injective_functions_inside_uniq` removed any injective function
from a `uniq*` argument, on the grounds that an injective function preserves
the number of distinct values. That is true of the values, but not of the
rows the aggregate sees: `AggregateFunctionFactory::get` wraps `uniq*` in the
`Null` combinator when an argument is `Nullable`, and that combinator skips
the rows where the argument is NULL.

An injective function whose result type cannot be `Nullable` hides the
nullability of its argument, so removing it turns "count every row" into
"skip the NULL rows". `tuple(NULL)` and `bitmaskToArray(NULL)` are values
that `uniq*` counts, while a bare NULL is not:

    SELECT uniqExact(tuple(x)) FROM values('x Nullable(Int32)', 1, 2, NULL);
    -- 2 before, 3 now and with the optimization disabled

The affected functions are `tuple`, `bitmaskToArray` and
`bitPositionsToArray`; the affected aggregates are `uniq`, `uniqExact`,
`uniqHLL12` and `uniqTheta`. `uniqCombined` and `uniqCombined64` were already
protected, because the `Null` combinator changes their result type to
`Nullable(UInt64)` and the pass rejects that.

This also removes a discrepancy the same rewrite caused between expressions
that differ only in being constant-foldable: `countDistinct(tuple(NULL))` is
folded into a `ConstantNode` and so escaped the pass, while
`countDistinct(tuple(arrayJoin([NULL])))` did not. Both return 1 now.

With `enable_analyzer = 0` the same rewrite runs in `TreeOptimizer` before
types are resolved, where the nullability cannot be checked, so it keeps the
old results; the test is tagged `no-old-analyzer`.

Closes: #114784

Co-Authored-By: Claude Opus 5 (1M context) <noreply@anthropic.com>
```

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)[vdimir](https://github.com/vdimir)

added
[pr-must-backport](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-must-backport) Pull request should be backported intentionally. Use this label with great care! [v26.4-must-backport](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Av26.4-must-backport)

labels

[on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29689031764)

[![@clickhouse-gh](https://avatars.githubusercontent.com/in/928874?s=80&v=4)](https://github.com/apps/clickhouse-gh)

### **[clickhouse-gh](https://github.com/apps/clickhouse-gh) Bot**     commented   [on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466\#issuecomment-5343779121)•   edited      Loading          \#\#\# Uh oh!        There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).


Copy link


Copy Markdown

Contributor

| Workflow \[ [PR](https://s3.amazonaws.com/clickhouse-test-reports/json.html?PR=115466&sha=latest&name_0=PR)\], commit \[ [`76beaa1`](https://github.com/ClickHouse/ClickHouse/commit/76beaa11fafd1bff70e9e860caee318564a20b52)\]

**Summary:** ✅

- Performance Comparison: [Performance dashboard](https://performance.ci.clickhouse.com/runs?q=115466)

* * *

#### AI Review

##### Summary

This PR fixes `optimize_injective_functions_inside_uniq` in the query-tree analyzer by preserving injective wrappers that hide top-level nullability, and it adds focused stateless coverage for the analyzer path. The fix is incomplete, though: the legacy `enable_analyzer = 0` optimizer still applies the same lossy rewrite and still returns the wrong cardinality, so the linked bug remains reproducible in a supported compatibility mode.

##### Findings

❌ Blockers

- \[src/Analyzer/Passes/UniqInjectiveFunctionsEliminationPass.cpp:73\] The PR restores the nullability invariant only in the analyzer pass, but `TreeOptimizer::optimizeInjectiveFunctionsInsideUniq` still routes `enable_analyzer = 0` through `RemoveInjectiveFunctionsVisitor`, which strips `tuple(nullable)` / `bitmaskToArray(nullable)` without any nullability check and keeps returning wrong results. The linked issue explicitly expects the result not to depend on `enable_analyzer`, and the old analyzer is still user-accessible for backward compatibility, so closing the issue here would leave a correctness hole in supported behavior.


Suggested fix: either port the same nullability-preserving guard to the legacy optimizer path, or disable `optimize_injective_functions_inside_uniq` when `enable_analyzer = 0` so the setting cannot silently change results there.

##### Final Verdict

- Status: **❌ Block**
- Minimum required actions: make the `enable_analyzer = 0` path preserve the same semantics as the analyzer path, or stop applying `optimize_injective_functions_inside_uniq` in the legacy optimizer.

### LLVM Coverage Report

| Metric | Baseline | Current | Δ |
| --- | --- | --- | --- |
| Lines | 86.90% | 86.90% | +0.00% |
| Functions | 91.90% | 92.00% | +0.10% |
| Branches | 79.20% | 79.30% | +0.10% |

**Changed lines:** Changed C/C++ lines covered: 7/7 (100.00%) · [Uncovered code](https://s3.amazonaws.com/clickhouse-test-reports/PRs/115466/76beaa11fafd1bff70e9e860caee318564a20b52/llvm_coverage/print_uncovered_code/print_uncovered_code.log)

[Full report](https://s3.amazonaws.com/clickhouse-test-reports/PRs/115466/76beaa11fafd1bff70e9e860caee318564a20b52/llvm_coverage/generate_llvm_coverage_report/index.html) · [Diff report](https://s3.amazonaws.com/clickhouse-test-reports/PRs/115466/76beaa11fafd1bff70e9e860caee318564a20b52/llvm_coverage/generate_llvm_coverage_diff_report/index_diff.html) |

All reactions

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

[![@clickhouse-gh](https://avatars.githubusercontent.com/in/928874?s=40&v=4)](https://github.com/apps/clickhouse-gh)[clickhouse-gh](https://github.com/apps/clickhouse-gh) Bot

added
the [pr-bugfix](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-bugfix) Pull request with bugfix, not backported by default
label

[on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29689064791)

[![@Avogar](https://avatars.githubusercontent.com/u/48961922?s=40&u=6c3b0716cd58cb12804295438edbea76abe70149&v=4)](https://github.com/Avogar)[Avogar](https://github.com/Avogar)

self-assigned this

[on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29689119156)

[![Avogar](https://avatars.githubusercontent.com/u/48961922?s=60&v=4)](https://github.com/Avogar)

**[Avogar](https://github.com/Avogar)**

approved these changes

[on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#pullrequestreview-4973449717)

[View reviewed changes](https://github.com/ClickHouse/ClickHouse/pull/115466/files/76beaa11fafd1bff70e9e860caee318564a20b52)

[![clickhouse-gh[bot]](https://avatars.githubusercontent.com/in/928874?s=60&v=4)](https://github.com/apps/clickhouse-gh)

**[clickhouse-gh](https://github.com/apps/clickhouse-gh) Bot**

reviewed

[on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#pullrequestreview-4973668917)

[View reviewed changes](https://github.com/ClickHouse/ClickHouse/pull/115466/files/76beaa11fafd1bff70e9e860caee318564a20b52)

Comment thread[src/Analyzer/Passes/UniqInjectiveFunctionsEliminationPass.cpp](https://github.com/ClickHouse/ClickHouse/pull/115466/files/76beaa11fafd1bff70e9e860caee318564a20b52#diff-9b71f24b3b70888f0c6e1ca01580400eb4551206ce77761aa3086eab6d625cbe)

|     |     |     |
| --- | --- | --- |
|  |  |  |
|  |  | /// The \`Null\` combinator makes \`uniq\*\` skip rows where a Nullable argument is NULL: \`uniq(tuple(x))\` |
|  |  | /// counts the (NULL) row while \`uniq(x)\` skips it. |
|  |  | if (isNullableOrLowCardinalityNullable(arg->getResultType()) |

### ![@clickhouse-gh](https://avatars.githubusercontent.com/in/928874?s=48&v=4)**[clickhouse-gh](https://github.com/apps/clickhouse-gh) Bot** [on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466\#discussion_r3814220589)


Copy link


Copy Markdown

Contributor

There was a problem hiding this comment.

### Choose a reason for hiding this comment

The reason will be displayed to describe this comment to others. [Learn more](https://docs.github.com/articles/managing-disruptive-comments/#hiding-a-comment).


Choose a reason
SpamAbuseOff TopicOutdatedDuplicateResolvedLow QualityHide comment

This fixes the query-tree path, but `enable_analyzer = 0` still goes through `TreeOptimizer::optimizeInjectiveFunctionsInsideUniq`, whose `RemoveInjectiveFunctionsVisitor` blindly strips `tuple(nullable)` / `bitmaskToArray(nullable)` without any nullability check (`src/Interpreters/RemoveInjectiveFunctionsVisitor.cpp:20-32`). The linked issue explicitly requires the result not to depend on `enable_analyzer`, and the old analyzer is still a supported compatibility mode, so this PR still leaves wrong results reachable for users who keep that setting at `0`. Please either preserve the same nullability invariant in the legacy path or disable `optimize_injective_functions_inside_uniq` there until it can prove the rewrite is semantics-preserving.

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

All reactions

[![@clickhouse-gh](https://avatars.githubusercontent.com/in/928874?s=80&v=4)](https://github.com/apps/clickhouse-gh)

### **[clickhouse-gh](https://github.com/apps/clickhouse-gh) Bot**     commented   [on Aug 19Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466\#issuecomment-5345944575)


Copy link


Copy Markdown

Contributor

| ### Build profile diff (arm\_release)

Comparing [`76beaa11f`](https://github.com/ClickHouse/ClickHouse/commit/76beaa11fafd1bff70e9e860caee318564a20b52) with master [`8a4c746fd`](https://github.com/ClickHouse/ClickHouse/commit/8a4c746fd2354901b486b5e72561d6b35a6e2d84) (stripped binary size, per-symbol sizes and ThinLTO time; compile times per translation unit against the most recent warmup build that recompiled it).

✅ No significant changes.

**Binary sizes**

| Binary | Master | PR | Δ |
| --- | --: | --: | --: |
| `programs/clickhouse-stripped` | 702.07 MiB | 699.05 MiB | -3.02 MiB (-0.43%) |

Only the stripped binary is compared: the official master build keeps debug symbols while PR builds strip them, so the other binaries differ by construction.

**Compile time of recompiled translation units**

44 translation units recompiled, 319 s compile time in total, 44 of them have a recent master baseline.

[Job report](https://s3.amazonaws.com/clickhouse-test-reports/json.html?PR=115466&sha=76beaa11fafd1bff70e9e860caee318564a20b52&name_0=PR&name_1=Build%20profile%20diff) |

All reactions

Sorry, something went wrong.


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)

[vdimir](https://github.com/vdimir)

added this pull request to the [merge queue](https://github.com/ClickHouse/ClickHouse/queue/master) [on Aug 20Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29738490584)

Hide detailsView details

Merged
via the queue into
master

with commit [`f229f01`](https://github.com/ClickHouse/ClickHouse/commit/f229f018001e35e35b86f4b944ed0980dcf890cd) [on Aug 20Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29740557850)

180 of 181 checks passed


### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)

[vdimir](https://github.com/vdimir)


deleted the

vdimir/fix-uniq-injective-tuple-nullable

branch

[2 months agoAugust 20, 2026 11:40](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29740559077)

This was referenced on Aug 20Aug 20, 2026

[Backport #115466 to 25.8: Do not strip injective functions that hide argument nullability inside uniq\\
#115598](https://github.com/ClickHouse/ClickHouse/pull/115598)

Merged

[Backport #115466 to 26.3: Do not strip injective functions that hide argument nullability inside uniq\\
#115599](https://github.com/ClickHouse/ClickHouse/pull/115599)

Merged

[Backport #115466 to 26.5: Do not strip injective functions that hide argument nullability inside uniq\\
#115600](https://github.com/ClickHouse/ClickHouse/pull/115600)

Merged

[Backport #115466 to 26.6: Do not strip injective functions that hide argument nullability inside uniq\\
#115601](https://github.com/ClickHouse/ClickHouse/pull/115601)

Merged

[Backport #115466 to 26.7: Do not strip injective functions that hide argument nullability inside uniq\\
#115602](https://github.com/ClickHouse/ClickHouse/pull/115602)

Merged

[![@robot-clickhouse-ci-2](https://avatars.githubusercontent.com/u/118811860?s=40&v=4)](https://github.com/robot-clickhouse-ci-2)[robot-clickhouse-ci-2](https://github.com/robot-clickhouse-ci-2)

added
the [pr-backports-created](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-backports-created) Backport PRs are successfully created, it won't be processed by CI script anymore
label

[on Aug 20Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29741209826)

[![@robot-ch-test-poll2](https://avatars.githubusercontent.com/u/63349887?s=40&v=4)](https://github.com/robot-ch-test-poll2)[robot-ch-test-poll2](https://github.com/robot-ch-test-poll2)

added
the [pr-must-backport-synced](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-must-backport-synced) The \`\*-must-backport\` labels are synced into the cloud Sync PR
label

[on Aug 20Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29741954492)

[![@robot-clickhouse-ci-1](https://avatars.githubusercontent.com/u/118761991?s=40&v=4)](https://github.com/robot-clickhouse-ci-1)[robot-clickhouse-ci-1](https://github.com/robot-clickhouse-ci-1)

added
the [pr-synced-to-cloud](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-synced-to-cloud) The PR is synced to the cloud repo
label

[on Aug 20Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#event-29742917977)

[clickhouse-gh](https://github.com/apps/clickhouse-gh) Bot

added a commit
that referenced
this pull request

[on Aug 20Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-3264efb)

[![@clickhouse-gh](https://avatars.githubusercontent.com/in/928874?s=40&v=4)](https://github.com/apps/clickhouse-gh)

`
          Merge pull request #115602 from ClickHouse/backport/26.7/115466
`…

Verified

# Verified

This commit was created on GitHub.com and signed with GitHub’s **verified signature**.


GPG key ID: B5690EEEBB952194

Verified
on Aug 20, 2026, 11:19 AM

[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits)

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

`
          3264efb
`

```
Backport #115466 to 26.7: Do not strip injective functions that hide argument nullability inside uniq
```

[![@robot-ch-test-poll4](https://avatars.githubusercontent.com/u/69306974?s=40&v=4)](https://github.com/robot-ch-test-poll4)[robot-ch-test-poll4](https://github.com/robot-ch-test-poll4)

mentioned this pull request
[on Aug 20Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-issue-5150233462)

[optimize\_injective\_functions\_inside\_uniq changes results: uniq\*(tuple(nullable)) drops NULLs and depends on constant folding\\
#114784](https://github.com/ClickHouse/ClickHouse/issues/114784)

Closed

[vdimir](https://github.com/vdimir)

added a commit
that referenced
this pull request

[on Aug 21Aug 21, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-eab23fa)

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)

`
          Merge pull request #115599 from ClickHouse/backport/26.3/115466
`…

Verified

# Verified

This commit was created on GitHub.com and signed with GitHub’s **verified signature**.


GPG key ID: B5690EEEBB952194

Verified
on Aug 21, 2026, 04:13 AM

[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits)

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

`
          eab23fa
`

```
Backport #115466 to 26.3: Do not strip injective functions that hide argument nullability inside uniq
```

[vdimir](https://github.com/vdimir)

added a commit
that referenced
this pull request

[on Aug 21Aug 21, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-ecc1fe4)

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)

`
          Merge pull request #115600 from ClickHouse/backport/26.5/115466
`…

Verified

# Verified

This commit was created on GitHub.com and signed with GitHub’s **verified signature**.


GPG key ID: B5690EEEBB952194

Verified
on Aug 21, 2026, 04:13 AM

[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits)

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

`
          ecc1fe4
`

```
Backport #115466 to 26.5: Do not strip injective functions that hide argument nullability inside uniq
```

[vdimir](https://github.com/vdimir)

added a commit
that referenced
this pull request

[on Aug 21Aug 21, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-68f7a2e)

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)

`
          Merge pull request #115601 from ClickHouse/backport/26.6/115466
`…

Verified

# Verified

This commit was created on GitHub.com and signed with GitHub’s **verified signature**.


GPG key ID: B5690EEEBB952194

Verified
on Aug 21, 2026, 04:14 AM

[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits)

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

`
          68f7a2e
`

```
Backport #115466 to 26.6: Do not strip injective functions that hide argument nullability inside uniq
```

[vdimir](https://github.com/vdimir)

added a commit
that referenced
this pull request

[on Aug 21Aug 21, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-23fd7ca)

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=40&v=4)](https://github.com/vdimir)

`
          Merge pull request #115598 from ClickHouse/backport/25.8/115466
`…

Verified

# Verified

This commit was created on GitHub.com and signed with GitHub’s **verified signature**.


GPG key ID: B5690EEEBB952194

Verified
on Aug 21, 2026, 12:09 PM

[Learn about vigilant mode](https://docs.github.com/github/authenticating-to-github/displaying-verification-statuses-for-all-of-your-commits)

Loading

Loading status checks…

### Uh oh!

There was an error while loading. [Please reload this page](https://github.com/ClickHouse/ClickHouse/pull/115466).

`
          23fd7ca
`

```
Backport #115466 to 25.8: Do not strip injective functions that hide argument nullability inside uniq
```

[kewin-robetti](https://github.com/kewin-robetti)

pushed a commit
to viasoftkorp/ClickHouse
that referenced
this pull request

[on Aug 24Aug 24, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-075b316)

[![@robot-clickhouse](https://avatars.githubusercontent.com/u/41385210?s=40&v=4)](https://github.com/robot-clickhouse)

`
          Backport ClickHouse#115466 to 25.8: Do not strip injective functions …
`…

`
          075b316
`

```
…that hide argument nullability inside uniq
```

[kewin-robetti](https://github.com/kewin-robetti)

pushed a commit
to viasoftkorp/ClickHouse
that referenced
this pull request

[on Aug 24Aug 24, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-db2b41b)

[![@robot-clickhouse](https://avatars.githubusercontent.com/u/41385210?s=40&v=4)](https://github.com/robot-clickhouse)

`
          Backport ClickHouse#115466 to 26.3: Do not strip injective functions …
`…

`
          db2b41b
`

```
…that hide argument nullability inside uniq
```

[kewin-robetti](https://github.com/kewin-robetti)

pushed a commit
to viasoftkorp/ClickHouse
that referenced
this pull request

[on Aug 24Aug 24, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-0e58741)

[![@robot-clickhouse](https://avatars.githubusercontent.com/u/41385210?s=40&v=4)](https://github.com/robot-clickhouse)

`
          Backport ClickHouse#115466 to 26.5: Do not strip injective functions …
`…

`
          0e58741
`

```
…that hide argument nullability inside uniq
```

[VighneshPath](https://github.com/VighneshPath)

pushed a commit
to VighneshPath/ClickHouse
that referenced
this pull request

[3 weeks agoSep 16, 2026](https://github.com/ClickHouse/ClickHouse/pull/115466#ref-commit-06d5f5d)

[![@robot-clickhouse](https://avatars.githubusercontent.com/u/41385210?s=40&v=4)](https://github.com/robot-clickhouse)

`
          Backport ClickHouse#115466 to 26.6: Do not strip injective functions …
`…

`
          06d5f5d
`

```
…that hide argument nullability inside uniq
```

This file contains hidden or bidirectional Unicode text that may be interpreted or compiled differently than what appears below. To review, open the file in an editor that reveals hidden Unicode characters.
[Learn more about bidirectional Unicode characters](https://github.co/hiddenchars)

[Show hidden characters](https://github.com/ClickHouse/ClickHouse/pull/115466)

[Sign up for free](https://github.com/join?source=comment-repo) **to join this conversation on GitHub**.
Already have an account?
[Sign in to comment](https://github.com/login?return_to=https%3A%2F%2Fgithub.com%2FClickHouse%2FClickHouse%2Fpull%2F115466)

### Reviewers

[![@clickhouse-gh](https://avatars.githubusercontent.com/in/928874?s=40&v=4)](https://github.com/apps/clickhouse-gh)[clickhouse-gh\[bot\]](https://github.com/apps/clickhouse-gh)clickhouse-gh\[bot\] left review comments

[![@Avogar](https://avatars.githubusercontent.com/u/48961922?s=40&v=4)](https://github.com/Avogar)[Avogar](https://github.com/Avogar)Avogar approved these changes

### Assignees

[![@Avogar](https://avatars.githubusercontent.com/u/48961922?s=40&v=4)](https://github.com/Avogar)[Avogar](https://github.com/Avogar)

### Labels

[pr-backports-created](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-backports-created) Backport PRs are successfully created, it won't be processed by CI script anymore [pr-bugfix](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-bugfix) Pull request with bugfix, not backported by default [pr-must-backport](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-must-backport) Pull request should be backported intentionally. Use this label with great care! [pr-must-backport-synced](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-must-backport-synced) The \`\*-must-backport\` labels are synced into the cloud Sync PR [pr-synced-to-cloud](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Apr-synced-to-cloud) The PR is synced to the cloud repo [v26.4-must-backport](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3Av26.4-must-backport)

### Projects

None yet

### Milestone

No milestone

### Development

Successfully merging this pull request may close these issues.

[optimize\_injective\_functions\_inside\_uniq changes results: uniq\*(tuple(nullable)) drops NULLs and depends on constant folding](https://github.com/ClickHouse/ClickHouse/issues/114784)

### 5 participants

[![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=52&v=4)](https://github.com/vdimir)[![@Avogar](https://avatars.githubusercontent.com/u/48961922?s=52&v=4)](https://github.com/Avogar)[![@robot-ch-test-poll2](https://avatars.githubusercontent.com/u/63349887?s=52&v=4)](https://github.com/robot-ch-test-poll2)[![@robot-clickhouse-ci-1](https://avatars.githubusercontent.com/u/118761991?s=52&v=4)](https://github.com/robot-clickhouse-ci-1)[![@robot-clickhouse-ci-2](https://avatars.githubusercontent.com/u/118811860?s=52&v=4)](https://github.com/robot-clickhouse-ci-2)

Add this suggestion to a batch that can be applied as a single commit.This suggestion is invalid because no changes were made to the code.Suggestions cannot be applied while the pull request is closed.Suggestions cannot be applied while viewing a subset of changes.Only one suggestion per line can be applied in a batch.Add this suggestion to a batch that can be applied as a single commit.Applying suggestions on deleted lines is not supported.You must change the existing code in this line in order to create a valid suggestion.Outdated suggestions cannot be applied.This suggestion has been applied or marked resolved.Suggestions cannot be applied from pending reviews.Suggestions cannot be applied on multi-line comments.Suggestions cannot be applied while the pull request is queued to merge.Suggestion cannot be applied right now. Please check back later.

You can’t perform that action at this time.