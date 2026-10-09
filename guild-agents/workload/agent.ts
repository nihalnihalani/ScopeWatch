// ScopeWatch monitored workload (deterministic coded agent, no LLM).
// Deployed twice as two distinct Guild agents: scopewatch-ticketassist and scopewatch-releasereview.
// It reads ONLY the owned synthetic fixture repo and only the issue numbers named in its launch text.
// The expected-content markers are never in the launch text; ScopeWatch inspects tool results server-side.
"use agent";

import { type Task, agent, consoleTools, pick } from "@guildai/agents-sdk";
import { gitHubTools } from "@guildai-services/guildai~github";
import { z } from "zod";

const OWNER = "charliegillet";
const REPO = "scopewatch-fixtures";
const MAX_READS = 12;

const inputSchema = z.object({
  text: z.string().describe("Launch instruction naming GitHub issue numbers, e.g. 'read issue #3 #4'"),
});
type Input = z.infer<typeof inputSchema>;

const outputSchema = z.object({
  requested: z.array(z.number()),
  read: z.array(z.object({ number: z.number(), title: z.string() })),
  failed: z.array(z.object({ number: z.number(), error: z.string() })),
});
type Output = z.infer<typeof outputSchema>;

const tools = {
  ...pick(gitHubTools, ["github_issues_get"]),
  ...consoleTools,
};
type Tools = typeof tools;

function issueNumbers(text: string): number[] {
  const out: number[] = [];
  for (const m of text.matchAll(/#(\d{1,4})\b/g)) {
    const n = Number(m[1]);
    if (n >= 1 && n <= 9999) out.push(n);
  }
  return out.slice(0, MAX_READS);
}

// Synchronous helper (no await), so the agent compiler does not need to traverse it.
function titleOf(issue: unknown): string {
  if (issue && typeof issue === "object" && "title" in issue) return String((issue as { title: unknown }).title);
  return "";
}

async function run(input: Input, task: Task<Tools>): Promise<Output> {
  const requested = issueNumbers(typeof input.text === "string" ? input.text : "");
  const read: Output["read"] = [];
  const failed: Output["failed"] = [];
  for (const n of requested) {
    try {
      const issue = await task.tools.github_issues_get({ owner: OWNER, repo: REPO, issue_number: n });
      read.push({ number: n, title: titleOf(issue) });
    } catch (e) {
      failed.push({ number: n, error: e instanceof Error ? e.message.slice(0, 200) : String(e).slice(0, 200) });
    }
  }
  await task.console.log(`scopewatch workload: requested ${requested.length}, read ${read.length}, failed ${failed.length}`);
  return { requested, read, failed };
}

export default agent({ inputSchema, outputSchema, tools, run });
