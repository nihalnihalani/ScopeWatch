/**
 * Fresh-session probes. Every probe is a NEW session launched after `notBefore` with a fixed,
 * allowlisted instruction (only a validated operation name, owned repo and ticket number are
 * substituted). The outcome comes from native security events bound to the probe's subject plus,
 * for the control, the actual tool task response_data compared with the server-held marker. The
 * marker is never sent to the agent and model prose is never consulted.
 */
import type { ProbeRequest, RegisteredSession, TaskNode } from '../../shared/ports.js';
import type { Decision, ProbeOutcome, ProbeResult, RawObservation } from '../../shared/contracts.js';
import type { AdapterContext } from './context.js';
import { bindEvents } from './binding.js';
import { nowUtcText, parseUtcNano, sha256Hex } from './util.js';

const OP_RE = /^[a-z][a-z0-9_]{0,80}$/;
const REPO_RE = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

export function buildProbeInput(operation: string, repo: string, ticket: number): string {
  return `ScopeWatch probe. Use the ${operation} tool exactly once to read synthetic ticket #${ticket} in ${repo}, then reply with the ticket title only. Do not call any other tool.`;
}

export interface ProbeOptions {
  ticketNumber: number;
}

export function classifyDecision(d: Decision | null, reason: string | null): ProbeOutcome | 'allowed' {
  if (d === 'ALLOW') return 'allowed';
  if (d === 'DENY' && reason === 'POLICY_DENIED') return 'refused_policy';
  if (d === 'DENY' || d === 'ERROR') return 'refused_other';
  return 'missing';
}

/** Does any tool task response_data (raw value) contain the marker? Returns tri-state. */
export function inspectMarker(node: TaskNode | undefined, marker: string): 'present' | 'absent' | 'no_data' {
  if (!node || node.responseData === null || node.responseData === undefined) return 'no_data';
  const text = typeof node.responseData === 'string' ? node.responseData : JSON.stringify(node.responseData);
  return text.includes(marker) ? 'present' : 'absent';
}

export async function runProbe(a: AdapterContext, req: ProbeRequest, opt: ProbeOptions): Promise<ProbeResult> {
  const g = a.config.guild;
  const started = nowUtcText(a.now);
  const result: ProbeResult = {
    role: req.role,
    provenance: a.provenance,
    launchId: `launch_${sha256Hex(req.idempotencyRef).slice(0, 24)}`,
    nativeSessionId: null,
    nativeEventIds: [],
    decision: null,
    reasonCode: null,
    boundSubjectId: null,
    credentialId: null,
    inspection: '',
    outcome: 'missing',
    startedAt: started,
    completedAt: null,
  };
  const finish = (outcome: ProbeOutcome, inspection: string, patch: Partial<ProbeResult> = {}): ProbeResult => ({
    ...result, ...patch, outcome, inspection, completedAt: nowUtcText(a.now),
  });

  const expectedSubject = req.role === 'target' ? g.verifiedTargetPolicySubjectId : g.verifiedControlPolicySubjectId;
  const installed = req.role === 'target' ? g.targetInstalledAgentId : g.controlInstalledAgentId;
  if (!expectedSubject || !installed || !g.workspaceId) return finish('missing', 'probe settings (verified subject / installed agent / workspace) not configured');
  if (req.scope.workspaceId !== g.workspaceId) return finish('missing', 'scope workspace is not the configured workspace');
  if (req.role === 'target' && req.scope.policySubjectId !== expectedSubject) return finish('missing', 'scope subject is not the configured verified target subject');
  if (g.verifiedCredentialId && req.scope.credentialId !== g.verifiedCredentialId) return finish('missing', 'scope credential differs from the verified credential');
  if (g.verifiedOperation && req.scope.operation !== g.verifiedOperation) return finish('missing', 'scope operation differs from the verified operation');
  if (!OP_RE.test(req.scope.operation)) return finish('missing', 'operation name failed allowlist validation');
  if (!g.ownedRepo || !REPO_RE.test(g.ownedRepo)) return finish('missing', 'owned repo is not configured or invalid');
  if (req.role === 'control' && !g.controlExpectedMarker) return finish('missing', 'control expected marker not configured (server-side)');

  const notBeforeNs = parseNs(req.notBefore);
  if (notBeforeNs === null) return finish('missing', 'notBefore is not a valid UTC timestamp');

  const rcpt = await a.launcher.launch(req.role, buildProbeInput(req.scope.operation, g.ownedRepo, opt.ticketNumber), req.idempotencyRef);
  Object.assign(result, { launchId: rcpt.launchId, nativeSessionId: rcpt.nativeSessionId, startedAt: rcpt.startedAt });
  if (rcpt.outcome === 'failed') return finish('failed', `launch failed: ${rcpt.error ?? 'unknown'}`);
  if (rcpt.outcome === 'unknown' || !rcpt.nativeSessionId) return finish('missing', `launch outcome ambiguous: ${rcpt.error ?? 'reconcile before retry'}`);
  const startNs = parseNs(rcpt.startedAt);
  if (startNs === null || startNs <= notBeforeNs) return finish('missing', 'probe launch (controller clock) was not strictly after notBefore; not a fresh probe');
  if (!a.launcher.isFreshSession(rcpt.nativeSessionId, req.idempotencyRef)) return finish('missing', 'probe session ID was already used by another launch; not a fresh probe');

  const status = await a.launcher.awaitCompletion(rcpt.nativeSessionId, a.completionTimeoutMs);
  if (status === null) return finish('missing', 'probe session did not reach a terminal state in time');

  const reg: RegisteredSession = {
    workspaceId: g.workspaceId,
    sessionId: rcpt.nativeSessionId,
    launchId: rcpt.launchId,
    profile: req.role,
    expectedPolicySubjectId: expectedSubject,
    installedAgentId: installed,
  };
  const col = await a.collect(reg, `probe:${req.idempotencyRef}`);
  if (col.errors.length > 0 || col.coverage.coverageState !== 'complete') return finish('missing', `probe collection incomplete (${col.coverage.coverageState}): ${col.errors[0] ?? col.coverage.notes.join('; ')}`);

  // Attribution uses ONLY the operator-verified map; nothing is derived from the launch itself.
  const map: Record<string, string> = { ...(g.agentSubjectMap ?? {}) };
  const root = col.tasks.find((t) => t.kind === 'agent' && t.parentTaskId === null);
  if (!root?.agentRef || map[root.agentRef] !== expectedSubject) {
    return finish('missing', `root agent ref ${root?.agentRef ?? 'null'} is not mapped to the expected subject in the verified agentSubjectMap`);
  }
  const bind = bindEvents({ generationId: `probe:${req.idempotencyRef}`, observations: col.observations, tasks: col.tasks, registry: [reg], subjectDomainMap: map });
  const verified = new Map(bind.bindings.filter((b) => b.bindingState === 'verified' && b.policySubjectId === expectedSubject).map((b) => [b.nativeIdentityKey, b]));

  const selected: RawObservation[] = col.observations.filter(
    (o) => o.operation === req.scope.operation && o.credentialId === req.scope.credentialId && o.nativeIdentityKey !== null && verified.has(o.nativeIdentityKey),
  );
  if (selected.length === 0) return finish('missing', 'no security event for the scoped operation/credential bound to the expected subject');

  const ids = [...new Set(selected.map((o) => o.nativeEventId).filter((x): x is string => x !== null))];
  const decisions = new Set(selected.map((o) => `${o.decision}|${o.reasonCode}`));
  const first = selected[0] as RawObservation;
  const patch: Partial<ProbeResult> = { nativeEventIds: ids, decision: first.decision, reasonCode: first.reasonCode, boundSubjectId: expectedSubject, credentialId: first.credentialId };
  if (decisions.size > 1) return finish('failed', `mixed decisions in one probe session: ${[...decisions].join(', ')}`, patch);

  const verdict = classifyDecision(first.decision, first.reasonCode);
  if (verdict === 'refused_policy') return finish('refused_policy', `native DENY/POLICY_DENIED for bound subject (${ids.length} events)`, patch);
  if (verdict === 'refused_other') return finish('refused_other', `native ${first.decision}/${first.reasonCode ?? 'no reason'}: refusal not attributable to policy`, patch);
  if (verdict === 'missing') return finish('missing', 'decision missing on selected event', patch);

  // ALLOW
  if (req.role === 'target') {
    if (req.purpose !== 'recovery') return finish('allowed', 'target call was ALLOWED by native policy (restriction not in effect for this scope)', patch);
    const tm = g.targetExpectedMarker;
    if (!tm) return finish('missing', 'recovery probe needs the server-held target marker, which is not configured', patch);
    return inspectContent(selected, col.tasks, tm, patch, finish, 'target');
  }
  return inspectContent(selected, col.tasks, g.controlExpectedMarker as string, patch, finish, 'control');
}

function inspectContent(
  selected: RawObservation[],
  tasks: TaskNode[],
  marker: string,
  patch: Partial<ProbeResult>,
  finish: (o: ProbeOutcome, i: string, p?: Partial<ProbeResult>) => ProbeResult,
  who: 'target' | 'control',
): ProbeResult {
  const toolNodes = selected.map((o) => tasks.find((t) => t.taskId === o.nativeTaskId));
  const states = toolNodes.map((n) => inspectMarker(n, marker));
  if (states.includes('present')) {
    const n = toolNodes[states.indexOf('present')] as TaskNode;
    return finish('succeeded_expected', `${who} tool task ${n.taskId} response_data contains the server-held marker (sha256 ${sha256Hex(marker).slice(0, 12)})`, patch);
  }
  if (states.every((s) => s === 'no_data')) {
    return who === 'target'
      ? finish('allowed', 'ALLOW observed but tool task response_data is absent; target content not inspectable, recovery not proven', patch)
      : finish('missing', 'ALLOW observed but tool task response_data is absent (documented: stored only when projected); content not inspectable', patch);
  }
  return who === 'target'
    ? finish('allowed', 'ALLOW observed but target response_data does not contain the expected marker; recovery not proven', patch)
    : finish('succeeded_unexpected_content', 'ALLOW observed but tool response_data does not contain the expected marker', patch);
}

function parseNs(t: string): bigint | null {
  const p = parseUtcNano(t);
  return p ? BigInt(p.ns) : null;
}
