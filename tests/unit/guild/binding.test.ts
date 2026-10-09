import { describe, expect, it } from 'vitest';
import { bindEvents } from '../../../src/integrations/guild/binding.js';
import { normalizeSecurityEvent, normalizeTask } from '../../../src/integrations/guild/collector.js';
import type { RegisteredSession, TaskNode } from '../../../src/shared/ports.js';

const WS = 'ws1', S = 'sess1';
const obs = (id: string, taskId: string | null, session = S, extra: Record<string, unknown> = {}) =>
  normalizeSecurityEvent({ id, type: 'security', created_at: '2026-10-09T12:00:00Z', task_id: taskId, decision: 'ALLOW', operation: 'issues_get', credentials_id: 'c1', ...extra }, {
    provenance: 'contract_test', generationId: 'g', workspaceId: WS, sessionId: session, pageRef: 'p', index: 0, domain: 'workspace', observedAt: '2026-10-09T12:00:00Z',
  });
const agent = (id: string, parent: string | null, ref: string | null, version: string | null = null, session = S): TaskNode =>
  normalizeTask({ id, parent_task_id: parent, entity_type: 'EntTaskAgent', status: 'DONE', session_id: session, agent: ref ? { id: ref } : undefined, version_id: version }, session)!;
const tool = (id: string, parent: string, session = S): TaskNode => normalizeTask({ id, parent_task_id: parent, tool_name: 'issues_get', status: 'DONE', session_id: session }, session)!;
const reg = (subject = 'subj-A'): RegisteredSession => ({ workspaceId: WS, sessionId: S, launchId: 'l', profile: 'target', expectedPolicySubjectId: subject, installedAgentId: 'instA' });
const MAP = { instA: 'subj-A', instB: 'subj-B', defB: 'subj-DEF' };
const run = (observations: ReturnType<typeof obs>[], tasks: TaskNode[], registry = [reg()], map: Record<string, string> = MAP) =>
  bindEvents({ generationId: 'g', observations, tasks, registry, subjectDomainMap: map });

describe('bindEvents', () => {
  it('verifies a direct call under the registered root', () => {
    const r = run([obs('e1', 'tool1')], [agent('root', null, 'instA'), tool('tool1', 'root')]);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'verified', policySubjectId: 'subj-A', nativeActingTaskId: 'root' });
    expect(r.bindings[0]!.proofRef).toContain('tool1>root');
  });
  it('nested sub-agent B inside root A resolves to B only with proof', () => {
    const tasks = [agent('root', null, 'instA'), agent('child', 'root', 'instB'), tool('tool1', 'child')];
    const r = run([obs('e1', 'tool1')], tasks);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'verified', policySubjectId: 'subj-B', nativeActingTaskId: 'child' });
    expect(r.bindings[0]!.mappingMethod).toContain('nested');
  });
  it('nested B is NOT credited when root does not match the registered subject', () => {
    const tasks = [agent('root', null, 'instB'), agent('child', 'root', 'instB'), tool('tool1', 'child')];
    expect(run([obs('e1', 'tool1')], tasks).bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
  });
  it('unmapped agent ref is unresolved (no fallback to root/registered subject)', () => {
    const tasks = [agent('root', null, 'instA'), agent('child', 'root', 'unknownRef'), tool('tool1', 'child')];
    const r = run([obs('e1', 'tool1')], tasks);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'unresolved', policySubjectId: null });
    expect(r.diagnostics[0]!.reason).toContain('not mapped');
  });
  it('missing task node, missing parent and null task_id are unresolved gaps', () => {
    expect(run([obs('e1', 'nope')], [agent('root', null, 'instA')]).bindings[0]!.bindingState).toBe('unresolved');
    expect(run([obs('e1', 'tool1')], [tool('tool1', 'gone')]).bindings[0]!.bindingState).toBe('unresolved');
    expect(run([obs('e1', null)], []).bindings[0]!.bindingState).toBe('unresolved');
  });
  it('cycle is a conflict', () => {
    const tasks = [agent('a', 'b', 'instA'), agent('b', 'a', 'instA'), tool('tool1', 'a')];
    expect(run([obs('e1', 'tool1')], tasks).bindings[0]!.bindingState).toBe('conflict');
  });
  it('task belonging to another session is a conflict', () => {
    const tasks = [agent('root', null, 'instA'), tool('tool1', 'root', 'other-session')];
    expect(run([obs('e1', 'tool1')], tasks).bindings[0]!.bindingState).toBe('conflict');
  });
  it('conflicting duplicate task nodes are a conflict', () => {
    const tasks = [agent('root', null, 'instA'), tool('tool1', 'root'), { ...tool('tool1', 'root'), rawJson: '{"different":1}' }];
    expect(run([obs('e1', 'tool1')], tasks).bindings[0]!.bindingState).toBe('conflict');
  });
  it('unregistered session is unresolved', () => {
    expect(run([obs('e1', 'tool1')], [agent('root', null, 'instA'), tool('tool1', 'root')], []).bindings[0]!.bindingState).toBe('unresolved');
  });
  it('graph subject disagreeing with the registered launch subject is a conflict, never relabelled', () => {
    const r = run([obs('e1', 'tool1')], [agent('root', null, 'instB'), tool('tool1', 'root')]);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
  });
  it('installation vs definition/version IDs are distinct key spaces', () => {
    // agent task reports version "defB"; plain "defB" key must NOT be treated as an agent ref.
    const tasks = [agent('root', null, 'instA'), agent('child', 'root', null, 'defB'), tool('tool1', 'child')];
    expect(run([obs('e1', 'tool1')], tasks).bindings[0]!.bindingState).toBe('unresolved');
    // explicit version-domain key is honoured
    const withVersion = run([obs('e1', 'tool1')], tasks, [reg()], { ...MAP, 'version:defB': 'subj-DEF' });
    expect(withVersion.bindings[0]).toMatchObject({ bindingState: 'verified', policySubjectId: 'subj-DEF' });
  });
  it('redeliveries that bind differently become a conflict; identity-less rows are diagnostics only', () => {
    const tasks = [agent('root', null, 'instA'), tool('t1', 'root')];
    const a = obs('e1', 't1');
    const b = obs('e1', 'missing');
    const r = run([a, b, { ...obs('x', 't1'), nativeIdentityKey: null }], tasks);
    expect(r.bindings).toHaveLength(1);
    expect(r.bindings[0]!.bindingState).toBe('conflict');
    expect(r.diagnostics.some((d) => d.nativeIdentityKey.startsWith('observation:'))).toBe(true);
  });
  it('event details.agent_id agreeing with the acting agent ref verifies; disagreeing is a conflict', () => {
    const tasks = [agent('root', null, 'instA'), tool('tool1', 'root')];
    expect(run([obs('e1', 'tool1', S, { details: { agent_id: 'instA' } })], tasks).bindings[0]!.bindingState).toBe('verified');
    const r = run([obs('e1', 'tool1', S, { details: { agent_id: 'instB' } })], tasks);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
    expect(r.diagnostics[0]!.reason).toContain('disagrees with acting agent task');
  });
  it('nested: event agent must be the nearest acting agent (conservative)', () => {
    const tasks = [agent('root', null, 'instA'), agent('child', 'root', 'instB'), tool('tool1', 'child')];
    expect(run([obs('e1', 'tool1', S, { details: { agent_id: 'instB' } })], tasks).bindings[0]!.bindingState).toBe('verified');
    expect(run([obs('e1', 'tool1', S, { details: { agent_id: 'instA' } })], tasks).bindings[0]!.bindingState).toBe('conflict');
  });
  it('event agent ref with an acting agent that has no agent ref cannot be corroborated', () => {
    const tasks = [agent('root', null, 'instA'), agent('child', 'root', null, 'defB'), tool('tool1', 'child')];
    const r = run([obs('e1', 'tool1', S, { details: { agent_id: 'defB' } })], tasks, [reg()], { ...MAP, 'version:defB': 'subj-DEF' });
    expect(r.bindings[0]!.bindingState).toBe('unresolved');
  });
  it('payload session differing from the collected session is a conflict', () => {
    const tasks = [agent('root', null, 'instA'), tool('tool1', 'root')];
    expect(run([obs('e1', 'tool1', S, { details: { session_id: 'other' } })], tasks).bindings[0]!.bindingState).toBe('conflict');
    expect(run([obs('e1', 'tool1', S, { details: { session_id: S } })], tasks).bindings[0]!.bindingState).toBe('verified');
  });
  it('top-level vs nested field disagreement is a conflict, not silent precedence', () => {
    const tasks = [agent('root', null, 'instA'), tool('tool1', 'root')];
    const r = run([obs('e1', 'tool1', S, { details: { credentials_id: 'c-other' } })], tasks);
    expect(r.bindings[0]).toMatchObject({ bindingState: 'conflict', policySubjectId: null });
    expect(r.diagnostics[0]!.reason).toContain('credentials_id');
  });
  it('non-JSON semanticJson (e.g. replay seeds) adds no corroboration checks', () => {
    const tasks = [agent('root', null, 'instA'), tool('tool1', 'root')];
    expect(run([{ ...obs('e1', 'tool1'), semanticJson: 'not-json' }], tasks).bindings[0]!.bindingState).toBe('verified');
  });
  it('a root without entity_type is unknown and binding stays unresolved', () => {
    const root = normalizeTask({ id: 'root', parent_task_id: null, agent: { id: 'instA' }, status: 'DONE', session_id: S }, S)!;
    expect(run([obs('e1', 'tool1')], [root, tool('tool1', 'root')]).bindings[0]!.bindingState).toBe('unresolved');
  });
});
