/**
 * Per-event acting-subject binding via the task graph:
 *   security.task_id -> task node -> parent traversal -> nearest AGENT task -> agent ref
 *   -> subjectDomainMap -> verified policy subject, corroborated by the launch registry.
 * The root/requested subject is NEVER a fallback. Anything ambiguous is unresolved/conflict with a reason.
 * Installation, definition and version IDs are distinct key spaces: only exact agent refs map; version
 * refs must be supplied explicitly as `version:<id>` keys.
 * Native events also name an agent (`details.agent_id`, the agent DEFINITION id), a session and a workspace; these only
 * corroborate the graph: any disagreement fails closed. `session.trigger.*` (the trigger's configured default
 * agent, not the agent that ran) and `acting_user` are never consulted.
 */
import type { BindingInput, BindingResult, TaskNode } from '../../shared/ports.js';
import type { BindingState, EventBinding, RawObservation } from '../../shared/contracts.js';
import { eventRefs, type EventRefs } from './collector.js';
import { canonicalJson, isRecord } from './util.js';

interface One {
  state: BindingState;
  subject: string | null;
  actingTaskId: string | null;
  method: string;
  proofRef: string;
  reason?: string;
}

const METHOD = 'task_graph:security.task_id→agent_task→launch_registry';
const METHOD_NESTED = 'task_graph:security.task_id→nested_agent_task→root_agent_task→launch_registry';

/**
 * Refs re-derived from the persisted semanticJson (survives publish/readback, unlike extra in-memory fields).
 * Non-JSON or non-native semantic payloads (e.g. replay seeds) carry no refs and add no checks.
 */
function observationRefs(o: RawObservation): EventRefs {
  try {
    const parsed: unknown = JSON.parse(o.semanticJson);
    if (isRecord(parsed)) return eventRefs(parsed);
  } catch {
    /* not JSON: nothing to corroborate */
  }
  return { taskId: null, credentialsId: null, agentRef: null, sessionRef: null, workspaceRef: null, conflicts: [] };
}

function subjectFor(node: TaskNode, map: Record<string, string>): string | null {
  if (node.agentRef && Object.prototype.hasOwnProperty.call(map, node.agentRef)) return map[node.agentRef] ?? null;
  if (node.versionId && Object.prototype.hasOwnProperty.call(map, `version:${node.versionId}`)) return map[`version:${node.versionId}`] ?? null;
  return null;
}

export function bindEvents(input: BindingInput): BindingResult {
  const byId = new Map<string, TaskNode[]>();
  for (const t of input.tasks) {
    const list = byId.get(t.taskId) ?? [];
    if (!list.some((x) => x.rawJson === t.rawJson && x.sessionId === t.sessionId)) list.push(t);
    byId.set(t.taskId, list);
  }
  const reg = new Map(input.registry.map((r) => [`${r.workspaceId}|${r.sessionId}`, r]));

  const resolveOne = (o: RawObservation): One => {
    const bad = (state: BindingState, reason: string, proofRef = `task_graph:${o.sessionId}`): One => ({
      state, subject: null, actingTaskId: null, method: METHOD, proofRef, reason,
    });
    const refs = observationRefs(o);
    if (refs.conflicts.length > 0) return bad('conflict', `security event fields disagree across top-level/nested locations: ${refs.conflicts.join(', ')}`);
    if (refs.sessionRef && refs.sessionRef !== o.sessionId) return bad('conflict', `event payload names session ${refs.sessionRef}, collected for ${o.sessionId}`);
    // Native launch responses carry workspace.id (the same id form as details.workspace_id); a collection workspace
    // in another form (config owner~name fallback) cannot corroborate the payload and fails closed here too.
    if (refs.workspaceRef && refs.workspaceRef !== o.workspaceId) return bad('conflict', `event payload names workspace ${refs.workspaceRef}, collected for ${o.workspaceId}`);
    if (!o.nativeTaskId) return bad('unresolved', 'security event has no task_id');
    const r = reg.get(`${o.workspaceId}|${o.sessionId}`);
    if (!r) return bad('unresolved', 'session is not in the registered launch cohort');
    const nodes = byId.get(o.nativeTaskId);
    if (!nodes || nodes.length === 0) return bad('unresolved', `task node ${o.nativeTaskId} missing from task pages`);
    if (nodes.length > 1) return bad('conflict', `task ${o.nativeTaskId} delivered with conflicting content`);
    let cur: TaskNode = nodes[0] as TaskNode;
    if (cur.sessionId !== o.sessionId) return bad('conflict', `task ${cur.taskId} belongs to session ${cur.sessionId}, event collected for ${o.sessionId}`);

    const chain: string[] = [];
    const seen = new Set<string>();
    let acting: TaskNode | null = null;
    let root: TaskNode = cur;
    for (;;) {
      if (seen.has(cur.taskId)) return bad('conflict', `cycle in task graph at ${cur.taskId}`, `task_graph:${o.sessionId}:${chain.join('>')}`);
      seen.add(cur.taskId);
      chain.push(cur.taskId);
      if (cur.sessionId !== o.sessionId) return bad('conflict', `ancestor ${cur.taskId} belongs to session ${cur.sessionId}`);
      if (cur.kind === 'agent' && !acting) acting = cur;
      root = cur;
      if (!cur.parentTaskId) break;
      const parents = byId.get(cur.parentTaskId);
      if (!parents || parents.length === 0) return bad('unresolved', `parent task ${cur.parentTaskId} missing (broken chain)`, `task_graph:${o.sessionId}:${chain.join('>')}`);
      if (parents.length > 1) return bad('conflict', `parent task ${cur.parentTaskId} delivered with conflicting content`);
      cur = parents[0] as TaskNode;
    }
    const proofRef = `task_graph:${o.sessionId}:${chain.join('>')}`;
    if (!acting) return bad('unresolved', 'no agent task found in ancestry', proofRef);
    if (root.kind !== 'agent') return bad('unresolved', 'task graph root is not an agent task', proofRef);
    if (refs.agentRef) {
      // Conservative for nested sub-agents: the event's agent must be the nearest acting agent, else fail closed.
      if (!acting.agentRef) return bad('unresolved', `event agent ${refs.agentRef} cannot be corroborated: acting agent task ${acting.taskId} has no agent ref`, proofRef);
      if (acting.agentRef !== refs.agentRef) return bad('conflict', `event agent ${refs.agentRef} disagrees with acting agent task ${acting.taskId} ref ${acting.agentRef}`, proofRef);
    }
    const subject = subjectFor(acting, input.subjectDomainMap);
    if (!subject) return bad('unresolved', `agent ref ${acting.agentRef ?? 'null'} is not mapped to a verified policy subject`, proofRef);

    if (acting.taskId === root.taskId) {
      if (subject !== r.expectedPolicySubjectId) {
        return { state: 'conflict', subject: null, actingTaskId: acting.taskId, method: METHOD, proofRef, reason: `graph subject ${subject} disagrees with registered launch subject ${r.expectedPolicySubjectId}` };
      }
      return { state: 'verified', subject, actingTaskId: acting.taskId, method: METHOD, proofRef };
    }
    // Nested sub-agent: B's own mapped subject is used only when the chain is proven to hang off the registered root.
    const rootSubject = subjectFor(root, input.subjectDomainMap);
    if (!rootSubject) return bad('unresolved', 'nested agent: root agent ref is unmapped, chain not corroborated', proofRef);
    if (rootSubject !== r.expectedPolicySubjectId) {
      return { state: 'conflict', subject: null, actingTaskId: acting.taskId, method: METHOD_NESTED, proofRef, reason: `root subject ${rootSubject} disagrees with registered launch subject ${r.expectedPolicySubjectId}` };
    }
    return { state: 'verified', subject, actingTaskId: acting.taskId, method: METHOD_NESTED, proofRef };
  };

  const groups = new Map<string, One[]>();
  const diagnostics: BindingResult['diagnostics'] = [];
  for (const o of input.observations) {
    if (!o.nativeIdentityKey) {
      diagnostics.push({ nativeIdentityKey: `observation:${o.observationId}`, state: 'unresolved', reason: 'identity key missing; cannot bind' });
      continue;
    }
    const list = groups.get(o.nativeIdentityKey) ?? [];
    list.push(resolveOne(o));
    groups.set(o.nativeIdentityKey, list);
  }

  const bindings: EventBinding[] = [];
  for (const [key, list] of groups) {
    const first = list[0] as One;
    const same = list.every((x) => canonicalJson([x.state, x.subject, x.actingTaskId]) === canonicalJson([first.state, first.subject, first.actingTaskId]));
    const res: One = same ? first : { state: 'conflict', subject: null, actingTaskId: null, method: METHOD, proofRef: first.proofRef, reason: 'redeliveries of one identity bind differently' };
    bindings.push({
      generationId: input.generationId,
      nativeIdentityKey: key,
      policySubjectId: res.state === 'verified' ? res.subject : null,
      bindingState: res.state,
      nativeActingTaskId: res.actingTaskId,
      mappingMethod: res.method,
      proofRef: res.proofRef,
      ...(res.reason ? { reason: res.reason } : {}),
    });
    if (res.state !== 'verified') diagnostics.push({ nativeIdentityKey: key, state: res.state, reason: res.reason ?? 'unresolved' });
  }
  return { bindings, diagnostics };
}
