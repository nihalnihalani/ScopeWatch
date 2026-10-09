> ## Documentation Index
> Fetch the complete documentation index at: https://docs.guild.ai/llms.txt
> Use this file to discover all available pages before exploring further.

# GitHub

> Give agents authenticated access to the GitHub REST API.

The `@guildai-services/guildai~github` package provides agents with access to the GitHub REST API through Guild's GitHub App integration.

<Note>
  The `@guildai-services/guildai~github` package is available to every Guild workspace. Its tools and response schemas are generated from GitHub's official OpenAPI specification, so tool names match GitHub's REST API operation IDs — for example, `github_pulls_get` maps to the `pulls_get` operation.
</Note>

## Authentication

* **Type:** GitHub App
* **Token management:** Generated on-demand and refreshed automatically
* **Scoping:** Limited to repositories where the Guild GitHub App is installed

### Setup

<Steps>
  <Step title="Open Credentials">Go to **Credentials** in Guild.</Step>
  <Step title="Connect GitHub">Click **GitHub** and authorize the Guild app on your organization or repository.</Step>
  <Step title="Select repositories">Choose which repositories to grant access to.</Step>
</Steps>

## Usage

```typescript theme={null}
import { gitHubTools } from "@guildai-services/guildai~github"
import { llmAgent } from "@guildai/agents-sdk"

export default llmAgent({
  description: "An agent that manages GitHub issues",
  tools: { ...gitHubTools },
})
```

### Selecting specific tools

Agents perform better with fewer tools. Use `pick()` to include only what your agent needs. Tools are named with the `github_` prefix — for example, `pulls_get` becomes `github_pulls_get`.

```typescript theme={null}
import { gitHubTools } from "@guildai-services/guildai~github"
import { llmAgent, pick } from "@guildai/agents-sdk"

export default llmAgent({
  description: "An agent that reviews pull requests",
  tools: {
    ...pick(gitHubTools, [
      "github_pulls_list",
      "github_pulls_get",
      "github_pulls_list_reviews",
      "github_pulls_create_review",
    ]),
  },
})
```

### Trimming responses

GitHub API responses can be large. Use `guildServiceTool()` with `githubSchemasLite` to strip unnecessary fields before the LLM sees them.

```typescript theme={null}
import {
  githubSchemas as gh,
  githubSchemasLite as ghlite,
  gitHubEndpoints,
} from "@guildai-services/guildai~github"
import { guildServiceTool, llmAgent } from "@guildai/agents-sdk"
import { z } from "zod"

const github_issues_list_for_repo = guildServiceTool("github", {
  description: gitHubEndpoints["issues_list_for_repo"].description,
  inputSchema: gitHubEndpoints["issues_list_for_repo"].parameterSchema,
  outputSchema: z
    .array(gh.IssueSchema)
    .transform((issues) => issues.map((x) => ghlite.IssueSchema.parse(x))),
})

export default llmAgent({
  description: "An agent that triages GitHub issues",
  tools: { github_issues_list_for_repo },
})
```

## API endpoints

<AccordionGroup>
  <Accordion title="Gists">
    | Operation | Method | Path |
    | - | - | - |
    | `gists_list` | GET | `/gists` |
    | `gists_create` | POST | `/gists` |
    | `gists_list_public` | GET | `/gists/public` |
    | `gists_get` | GET | `/gists/{gist_id}` |
    | `gists_update` | PATCH | `/gists/{gist_id}` |
    | `gists_delete` | DELETE | `/gists/{gist_id}` |
    | `gists_list_comments` | GET | `/gists/{gist_id}/comments` |
    | `gists_create_comment` | POST | `/gists/{gist_id}/comments` |
  </Accordion>

  <Accordion title="Organizations">
    | Operation | Method | Path |
    | - | - | - |
    | `orgs_list_issue_types` | GET | `/orgs/{org}/issue-types` |
    | `orgs_create_issue_type` | POST | `/orgs/{org}/issue-types` |
    | `orgs_list_members` | GET | `/orgs/{org}/members` |
    | `repos_list_for_org` | GET | `/orgs/{org}/repos` |
    | `repos_create_in_org` | POST | `/orgs/{org}/repos` |
  </Accordion>

  <Accordion title="Repositories">
    | Operation | Method | Path |
    | - | - | - |
    | `repos_get` | GET | `/repos/{owner}/{repo}` |
    | `repos_update` | PATCH | `/repos/{owner}/{repo}` |
    | `repos_delete` | DELETE | `/repos/{owner}/{repo}` |
    | `repos_list_activities` | GET | `/repos/{owner}/{repo}/activity` |
    | `repos_list_contributors` | GET | `/repos/{owner}/{repo}/contributors` |
    | `repos_list_languages` | GET | `/repos/{owner}/{repo}/languages` |
    | `repos_get_readme` | GET | `/repos/{owner}/{repo}/readme` |
    | `repos_list_tags` | GET | `/repos/{owner}/{repo}/tags` |
  </Accordion>

  <Accordion title="Branches">
    | Operation | Method | Path |
    | - | - | - |
    | `repos_list_branches` | GET | `/repos/{owner}/{repo}/branches` |
    | `repos_get_branch` | GET | `/repos/{owner}/{repo}/branches/{branch}` |
  </Accordion>

  <Accordion title="Commits">
    | Operation | Method | Path |
    | - | - | - |
    | `repos_list_commits` | GET | `/repos/{owner}/{repo}/commits` |
    | `repos_get_commit` | GET | `/repos/{owner}/{repo}/commits/{ref}` |
    | `repos_compare_commits` | GET | `/repos/{owner}/{repo}/compare/{basehead}` |
    | `repos_list_commit_comments_for_repo` | GET | `/repos/{owner}/{repo}/comments` |
    | `repos_get_commit_comment` | GET | `/repos/{owner}/{repo}/comments/{comment_id}` |
    | `repos_update_commit_comment` | PATCH | `/repos/{owner}/{repo}/comments/{comment_id}` |
    | `repos_delete_commit_comment` | DELETE | `/repos/{owner}/{repo}/comments/{comment_id}` |
    | `repos_create_commit_comment` | POST | `/repos/{owner}/{repo}/commits/{commit_sha}/comments` |
    | `repos_get_combined_status_for_ref` | GET | `/repos/{owner}/{repo}/commits/{ref}/status` |
    | `repos_list_pull_requests_associated_with_commit` | GET | `/repos/{owner}/{repo}/commits/{commit_sha}/pulls` |
  </Accordion>

  <Accordion title="Contents">
    | Operation | Method | Path |
    | - | - | - |
    | `repos_get_content` | GET | `/repos/{owner}/{repo}/contents/{path}` |
    | `repos_create_or_update_file_contents` | PUT | `/repos/{owner}/{repo}/contents/{path}` |
    | `repos_delete_file` | DELETE | `/repos/{owner}/{repo}/contents/{path}` |
  </Accordion>

  <Accordion title="Issues">
    | Operation | Method | Path |
    | - | - | - |
    | `issues_list_for_repo` | GET | `/repos/{owner}/{repo}/issues` |
    | `issues_create` | POST | `/repos/{owner}/{repo}/issues` |
    | `issues_get` | GET | `/repos/{owner}/{repo}/issues/{issue_number}` |
    | `issues_update` | PATCH | `/repos/{owner}/{repo}/issues/{issue_number}` |
    | `issues_lock` | PUT | `/repos/{owner}/{repo}/issues/{issue_number}/lock` |
    | `issues_unlock` | DELETE | `/repos/{owner}/{repo}/issues/{issue_number}/lock` |
    | `issues_get_parent` | GET | `/repos/{owner}/{repo}/issues/{issue_number}/parent` |
    | `issues_list_sub_issues` | GET | `/repos/{owner}/{repo}/issues/{issue_number}/sub_issues` |
    | `issues_add_sub_issue` | POST | `/repos/{owner}/{repo}/issues/{issue_number}/sub_issues` |
    | `issues_remove_sub_issue` | DELETE | `/repos/{owner}/{repo}/issues/{issue_number}/sub_issues` |
    | `issues_list_assignees` | GET | `/repos/{owner}/{repo}/assignees` |
    | `issues_add_assignees` | POST | `/repos/{owner}/{repo}/issues/{issue_number}/assignees` |
    | `issues_remove_assignees` | DELETE | `/repos/{owner}/{repo}/issues/{issue_number}/assignees` |
    | `issues_list_comments_for_repo` | GET | `/repos/{owner}/{repo}/issues/comments` |
    | `issues_get_comment` | GET | `/repos/{owner}/{repo}/issues/comments/{comment_id}` |
    | `issues_update_comment` | PATCH | `/repos/{owner}/{repo}/issues/comments/{comment_id}` |
    | `issues_delete_comment` | DELETE | `/repos/{owner}/{repo}/issues/comments/{comment_id}` |
    | `issues_list_comments` | GET | `/repos/{owner}/{repo}/issues/{issue_number}/comments` |
    | `issues_create_comment` | POST | `/repos/{owner}/{repo}/issues/{issue_number}/comments` |
    | `issues_list_labels_for_repo` | GET | `/repos/{owner}/{repo}/labels` |
    | `issues_create_label` | POST | `/repos/{owner}/{repo}/labels` |
    | `issues_get_label` | GET | `/repos/{owner}/{repo}/labels/{name}` |
    | `issues_update_label` | PATCH | `/repos/{owner}/{repo}/labels/{name}` |
    | `issues_delete_label` | DELETE | `/repos/{owner}/{repo}/labels/{name}` |
    | `issues_add_labels` | POST | `/repos/{owner}/{repo}/issues/{issue_number}/labels` |
    | `issues_list_dependencies_blocked_by` | GET | `/repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by` |
    | `issues_add_blocked_by_dependency` | POST | `/repos/{owner}/{repo}/issues/{issue_number}/dependencies/blocked_by` |
  </Accordion>

  <Accordion title="Pull requests">
    | Operation | Method | Path |
    | - | - | - |
    | `pulls_list` | GET | `/repos/{owner}/{repo}/pulls` |
    | `pulls_create` | POST | `/repos/{owner}/{repo}/pulls` |
    | `pulls_get` | GET | `/repos/{owner}/{repo}/pulls/{pull_number}` |
    | `pulls_update` | PATCH | `/repos/{owner}/{repo}/pulls/{pull_number}` |
    | `pulls_merge` | PUT | `/repos/{owner}/{repo}/pulls/{pull_number}/merge` |
    | `pulls_list_commits` | GET | `/repos/{owner}/{repo}/pulls/{pull_number}/commits` |
    | `pulls_list_files` | GET | `/repos/{owner}/{repo}/pulls/{pull_number}/files` |
    | `pulls_list_reviews` | GET | `/repos/{owner}/{repo}/pulls/{pull_number}/reviews` |
    | `pulls_create_review` | POST | `/repos/{owner}/{repo}/pulls/{pull_number}/reviews` |
    | `pulls_submit_review` | POST | `/repos/{owner}/{repo}/pulls/{pull_number}/reviews/{review_id}/events` |
    | `pulls_list_review_comments` | GET | `/repos/{owner}/{repo}/pulls/{pull_number}/comments` |
    | `pulls_create_review_comment` | POST | `/repos/{owner}/{repo}/pulls/{pull_number}/comments` |
    | `pulls_list_requested_reviewers` | GET | `/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers` |
    | `pulls_request_reviewers` | POST | `/repos/{owner}/{repo}/pulls/{pull_number}/requested_reviewers` |
  </Accordion>

  <Accordion title="Check runs">
    | Operation | Method | Path |
    | - | - | - |
    | `checks_create` | POST | `/repos/{owner}/{repo}/check-runs` |
    | `checks_get` | GET | `/repos/{owner}/{repo}/check-runs/{check_run_id}` |
    | `checks_update` | PATCH | `/repos/{owner}/{repo}/check-runs/{check_run_id}` |
    | `checks_list_annotations` | GET | `/repos/{owner}/{repo}/check-runs/{check_run_id}/annotations` |
    | `checks_list_for_ref` | GET | `/repos/{owner}/{repo}/commits/{ref}/check-runs` |
  </Accordion>

  <Accordion title="Workflows & actions">
    | Operation | Method | Path |
    | - | - | - |
    | `actions_list_repo_workflows` | GET | `/repos/{owner}/{repo}/actions/workflows` |
    | `actions_get_workflow` | GET | `/repos/{owner}/{repo}/actions/workflows/{workflow_id}` |
    | `actions_list_workflow_runs_for_repo` | GET | `/repos/{owner}/{repo}/actions/runs` |
    | `actions_get_workflow_run` | GET | `/repos/{owner}/{repo}/actions/runs/{run_id}` |
    | `actions_list_workflow_runs` | GET | `/repos/{owner}/{repo}/actions/workflows/{workflow_id}/runs` |
    | `actions_list_jobs_for_workflow_run` | GET | `/repos/{owner}/{repo}/actions/runs/{run_id}/jobs` |
    | `actions_list_workflow_run_artifacts` | GET | `/repos/{owner}/{repo}/actions/runs/{run_id}/artifacts` |
    | `actions_download_job_logs_for_workflow_run` | GET | `/repos/{owner}/{repo}/actions/jobs/{job_id}/logs` |
    | `actions_re_run_workflow` | POST | `/repos/{owner}/{repo}/actions/runs/{run_id}/rerun` |
    | `actions_re_run_workflow_failed_jobs` | POST | `/repos/{owner}/{repo}/actions/runs/{run_id}/rerun-failed-jobs` |
    | `actions_force_cancel_workflow_run` | POST | `/repos/{owner}/{repo}/actions/runs/{run_id}/force-cancel` |
  </Accordion>

  <Accordion title="Releases">
    | Operation | Method | Path |
    | - | - | - |
    | `repos_list_releases` | GET | `/repos/{owner}/{repo}/releases` |
    | `repos_create_release` | POST | `/repos/{owner}/{repo}/releases` |
    | `repos_get_release` | GET | `/repos/{owner}/{repo}/releases/{release_id}` |
    | `repos_update_release` | PATCH | `/repos/{owner}/{repo}/releases/{release_id}` |
    | `repos_delete_release` | DELETE | `/repos/{owner}/{repo}/releases/{release_id}` |
    | `repos_get_latest_release` | GET | `/repos/{owner}/{repo}/releases/latest` |
    | `repos_generate_release_notes` | POST | `/repos/{owner}/{repo}/releases/generate-notes` |
  </Accordion>

  <Accordion title="Deployments">
    | Operation | Method | Path |
    | - | - | - |
    | `repos_list_deployments` | GET | `/repos/{owner}/{repo}/deployments` |
    | `repos_create_deployment` | POST | `/repos/{owner}/{repo}/deployments` |
    | `repos_get_deployment` | GET | `/repos/{owner}/{repo}/deployments/{deployment_id}` |
    | `repos_delete_deployment` | DELETE | `/repos/{owner}/{repo}/deployments/{deployment_id}` |
    | `repos_create_deployment_status` | POST | `/repos/{owner}/{repo}/deployments/{deployment_id}/statuses` |
  </Accordion>

  <Accordion title="Search">
    | Operation | Method | Path |
    | - | - | - |
    | `search_code` | GET | `/search/code` |
    | `search_commits` | GET | `/search/commits` |
    | `search_issues_and_pull_requests` | GET | `/search/issues` |
    | `search_repos` | GET | `/search/repositories` |
    | `search_users` | GET | `/search/users` |
  </Accordion>

  <Accordion title="Users">
    | Operation | Method | Path |
    | - | - | - |
    | `users_get_by_username` | GET | `/users/{username}` |
    | `repos_list_for_user` | GET | `/users/{username}/repos` |
  </Accordion>
</AccordionGroup>

## Webhook events

GitHub uses an app-scoped webhook model — a single webhook receives all events and Guild routes them to matching triggers.

| Event | Description |
| - | - |
| `issues` | Issue opened, closed, edited, assigned, or labeled |
| `issue_comment` | Comment created, edited, or deleted on an issue |
| `pull_request` | PR opened, closed, merged, edited, or review requested |
| `pull_request_review` | Review submitted, edited, or dismissed |
| `pull_request_review_comment` | Review comment created, edited, or deleted |
| `push` | Commits pushed to a branch |
| `release` | Release published, created, edited, or deleted |
| `check_run` | Check run created, completed, or rerequested |
| `workflow_job` | Workflow job queued, in progress, or completed |
| `workflow_run` | Workflow run requested, completed, or in progress |

Guild preprocesses webhook payloads before passing them to agents, removing avatar URLs, permalink URLs, and deeply nested metadata to reduce payload size.

A run started by a GitHub event acts as the organization member mapped to the GitHub user who caused it, or as the trigger's creator when there is no mapping. See [Identity mapping](https://docs.guild.ai/platform/identity-mapping).

## Limitations

* Access is scoped to repositories where the GitHub App is installed
* Rate limits follow GitHub's standard limits (5,000 requests/hour for authenticated apps)
