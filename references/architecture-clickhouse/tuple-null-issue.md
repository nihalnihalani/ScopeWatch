[Skip to content](https://github.com/ClickHouse/ClickHouse/issues/114784#start-of-content)

You signed in with another tab or window. [Reload](https://github.com/ClickHouse/ClickHouse/issues/114784) to refresh your session.You signed out in another tab or window. [Reload](https://github.com/ClickHouse/ClickHouse/issues/114784) to refresh your session.You switched accounts on another tab or window. [Reload](https://github.com/ClickHouse/ClickHouse/issues/114784) to refresh your session.Dismiss alert

{{ message }}

# optimize\_injective\_functions\_inside\_uniq changes results: uniq\*(tuple(nullable)) drops NULLs and depends on constant folding\#114784

[New issue](https://github.com/login?return_to=https://github.com/ClickHouse/ClickHouse/issues/114784)

Copy link

[New issue](https://github.com/login?return_to=https://github.com/ClickHouse/ClickHouse/issues/114784)

Copy link

Closed

[#115466](https://github.com/ClickHouse/ClickHouse/pull/115466)

Closed

[optimize\_injective\_functions\_inside\_uniq changes results: uniq\*(tuple(nullable)) drops NULLs and depends on constant folding](https://github.com/ClickHouse/ClickHouse/issues/114784#top)#114784

[#115466](https://github.com/ClickHouse/ClickHouse/pull/115466)

Copy link

Assignees

[![vdimir](https://avatars.githubusercontent.com/u/7023786?s=64&v=4)](https://github.com/vdimir)

Labels

[potential bugTo be reviewed by developers and confirmed/rejected.](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3A%22potential%20bug%22) To be reviewed by developers and confirmed/rejected.

## Description

[![@konsta-danyliuk](https://avatars.githubusercontent.com/u/152849230?v=4&size=48)](https://github.com/konsta-danyliuk)

[konsta-danyliuk](https://github.com/konsta-danyliuk)

opened [on Aug 14on Aug 14, 2026](https://github.com/ClickHouse/ClickHouse/issues/114784#issue-5150233462)

Issue body actions

### Company or project name

_No response_

### Describe what's wrong

`optimize_injective_functions_inside_uniq` (default `true`) strips injective functions from `uniq*` arguments. When the stripped function is `tuple()` and its argument is `Nullable`, the rewrite is not semantics-preserving: `tuple(NULL)` is a value that `uniq*` counts, but a bare `NULL` is skipped by `uniq*`. So the optimization silently changes the result.

```
SELECT uniqExact(tuple(x)) FROM values('x Nullable(Int32)', 1, 2, NULL);
-- 2   (with the optimization, i.e. by default)

SELECT uniqExact(tuple(x)) FROM values('x Nullable(Int32)', 1, 2, NULL)
SETTINGS optimize_injective_functions_inside_uniq = 0;
-- 3   (correct: (1), (2) and (NULL) are three distinct tuples)
```

`EXPLAIN SYNTAX` shows the rewrite dropping the tuple:

```
EXPLAIN SYNTAX SELECT countDistinct(tuple(arrayJoin([NULL])));
-- SELECT uniqExact(arrayJoin([NULL]))
```

A second, related symptom: with the analyzer, whether the optimization applies at all depends on whether the argument happens to be constant-foldable, so semantically identical expressions disagree with each other:

```
SELECT countDistinct(tuple(NULL));                                     -- 1
SELECT countDistinct(tuple(arrayJoin([NULL])));                        -- 0
SELECT countDistinct(tuple(arrayJoin(
    emptyArrayToSingle([]::Array(Nullable(Int32))))));                  -- 0
```

`tuple(NULL)` has all-constant arguments, so it is folded into a `ConstantNode` during query analysis, and the pass no longer recognises it as a function to unwrap. The `arrayJoin` variants are not folded , so there the `tuple()` is stripped. With `enable_analyzer = 0` all three return `0`, because the legacy `TreeOptimizer` does the same rewrite on the un-folded AST.

### Does it reproduce on the most recent release?

Yes

### How to reproduce

[https://fiddle.clickhouse.com/718dd23f-a726-4218-92f5-7b78048bda57](https://fiddle.clickhouse.com/718dd23f-a726-4218-92f5-7b78048bda57)

Also reproduces with `uniq`, `uniqHLL12`, `uniqCombined64` and `uniqTheta` (every function listed in `isUniqFunction`), and with `countDistinct` via `count_distinct_implementation`.

### Expected behavior

`uniqExact(tuple(x))` should not depend on `optimize_injective_functions_inside_uniq`, on whether the argument is constant-foldable, or on `enable_analyzer`. `tuple()` is injective on the values it receives, but it also removes nullability, and `uniq*` treats NULL specially — so it must not be eliminated when its argument is `Nullable` and its own result type is not.

### Error message and/or stacktrace

_No response_

### Related issues and pull requests

_No response_

### Additional context

_No response_

### Version info

- Resolved by: [Do not strip injective functions that hide argument nullability inside uniq #115466](https://github.com/ClickHouse/ClickHouse/pull/115466)
- Backported to: `26.7.5.8`, `26.6.4.8`, `26.5.8.9`, `26.3.21.7`, `25.8.33.3`

## Activity

1. [![](https://avatars.githubusercontent.com/u/152849230?s=64&v=4)konsta-danyliuk](https://github.com/konsta-danyliuk)

added

[potential bugTo be reviewed by developers and confirmed/rejected.](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3A%22potential%20bug%22) To be reviewed by developers and confirmed/rejected.

[on Aug 14on Aug 14, 2026](https://github.com/ClickHouse/ClickHouse/issues/114784#event-29449874912)

2. [![](https://avatars.githubusercontent.com/u/7023786?s=64&v=4)vdimir](https://github.com/vdimir)



self-assigned this

[on Aug 19on Aug 19, 2026](https://github.com/ClickHouse/ClickHouse/issues/114784#event-29682437524)

3. [![](https://avatars.githubusercontent.com/u/7023786?s=64&v=4)vdimir](https://github.com/vdimir)

closed this as [completed](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aissue%20state%3Aclosed%20archived%3Afalse%20reason%3Acompleted) in [#115466](https://github.com/ClickHouse/ClickHouse/pull/115466) [on Aug 20on Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/issues/114784#event-29740558951)

4. [![](https://avatars.githubusercontent.com/in/12910?s=64&v=4)pull](https://github.com/apps/pull)

added a commit that references this issue [on Aug 20on Aug 20, 2026](https://github.com/ClickHouse/ClickHouse/issues/114784#event-29741027669)









[Do not strip injective functions that hide argument nullability insid…](https://github.com/sowelswl/ClickHouse/commit/76beaa11fafd1bff70e9e860caee318564a20b52)

...











[76beaa1](https://github.com/sowelswl/ClickHouse/commit/76beaa11fafd1bff70e9e860caee318564a20b52)

5. [![](https://avatars.githubusercontent.com/u/270696204?s=64&u=6ae9e1bf9f672dc714370f9f756303a3eb827a32&v=4)groeneai](https://github.com/groeneai)

added a commit that references this issue [1mo agoon Sep 13, 2026](https://github.com/ClickHouse/ClickHouse/issues/114784#event-31047374727)









[Pin the two settings that decide whether these faces read a null map …](https://github.com/groeneai/ClickHouse/commit/c69f677a9d3ab84d58252a8eef70d325f7e3f8f4)

...











[c69f677](https://github.com/groeneai/ClickHouse/commit/c69f677a9d3ab84d58252a8eef70d325f7e3f8f4)


[Sign up for free](https://github.com/signup?return_to=https://github.com/ClickHouse/ClickHouse/issues/114784)**to join this conversation on GitHub.** Already have an account?[Sign in to comment](https://github.com/login?return_to=https://github.com/ClickHouse/ClickHouse/issues/114784)

## Metadata

## Metadata

### Assignees

- [![@vdimir](https://avatars.githubusercontent.com/u/7023786?s=64&v=4)\\
vdimir](https://github.com/vdimir)

### Labels

[potential bugTo be reviewed by developers and confirmed/rejected.](https://github.com/ClickHouse/ClickHouse/issues?q=state%3Aopen%20label%3A%22potential%20bug%22) To be reviewed by developers and confirmed/rejected.

### Type

No type

### Projects

No projects

### Milestone

No milestone

### Relationships

None yet

### Development

No branches or pull requests

## Issue actions

- ![](https://github.githubassets.com/assets/github-copilot-app-light-15ad5534265eeacd.svg)Open in GitHub Copilot app

You can’t perform that action at this time.