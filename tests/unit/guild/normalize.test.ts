import { describe, expect, it } from 'vitest';
import { identityKey, normalizeSecurityEvent, normalizeTask, semanticOf, type NormalizeCtx } from '../../../src/integrations/guild/collector.js';

const ctx = (over: Partial<NormalizeCtx> = {}): NormalizeCtx => ({
  provenance: 'contract_test', generationId: 'g1', workspaceId: 'ws1', sessionId: 'sess1', pageRef: 'events:sess1:offset=0:limit=3', index: 0, domain: 'workspace', observedAt: '2026-10-09T12:00:00Z', ...over,
});
const ev = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  id: 'e1', type: 'security', created_at: '2026-10-09T12:00:00.123456789Z', updated_at: 'x', task_id: 't1', decision: 'ALLOW', operation: 'issues_get', reason_code: 'ACCESS_ALLOWED', credentials_id: 'c1', capability: 'read', ...over,
});

describe('normalizeSecurityEvent', () => {
  it('maps vendor credentials_id and exact clock', () => {
    const o = normalizeSecurityEvent(ev(), ctx());
    expect(o.credentialId).toBe('c1');
    expect(o.createdAtRaw).toBe('2026-10-09T12:00:00.123456789Z');
    expect(o.createdAtNs).toBe('1791547200123456789');
    expect(o.nativeIdentityKey).toBe('["ws1","e1"]');
    expect(o.decision).toBe('ALLOW');
  });
  it('missing credentials_id, clock and id stay null (gaps), not defaulted', () => {
    const o = normalizeSecurityEvent(ev({ credentials_id: undefined, created_at: undefined, id: undefined }), ctx());
    expect(o.credentialId).toBeNull();
    expect(o.createdAt).toBeNull();
    expect(o.createdAtNs).toBeNull();
    expect(o.nativeIdentityKey).toBeNull();
  });
  it('invalid or non-UTC clock keeps raw but yields null parsed values', () => {
    const o = normalizeSecurityEvent(ev({ created_at: '2026-10-09T12:00:00+05:00' }), ctx());
    expect(o.createdAtRaw).toBe('2026-10-09T12:00:00+05:00');
    expect(o.createdAtNs).toBeNull();
  });
  it('identity key is stable and domain-specific; session comes from the fetch, not the payload', () => {
    expect(identityKey('workspace', 'w', 's', 'e')).toBe('["w","e"]');
    expect(identityKey('session', 'w', 's', 'e')).toBe('["w","s","e"]');
    const o = normalizeSecurityEvent(ev({ session_id: 'spoofed' }), ctx());
    expect(o.sessionId).toBe('sess1');
  });
  it('semanticJson ignores delivery fields and key order; differs on semantic change', () => {
    const a = normalizeSecurityEvent(ev(), ctx({ pageRef: 'p1', index: 0 }));
    const b = normalizeSecurityEvent({ ...ev(), updated_at: 'later' }, ctx({ pageRef: 'p2', index: 5 }));
    expect(a.semanticJson).toBe(b.semanticJson);
    expect(a.observationId).not.toBe(b.observationId);
    const c = normalizeSecurityEvent(ev({ decision: 'DENY' }), ctx());
    expect(c.semanticJson).not.toBe(a.semanticJson);
    expect(Object.keys(JSON.parse(a.semanticJson))).not.toContain('updated_at');
  });
  it('native shape: task object and details-nested credentials_id/agent_id fill the observation', () => {
    const native = { id: 'e9', type: 'security_event', created_at: '2026-10-09T22:15:23.634925+00:00', decision: 'ALLOW', operation: 'issues_get',
      reason_code: 'ACCESS_ALLOWED', credentials: null, integration: null, acting_user: { id: 'u1', name: 'creator' },
      task: { id: 'tool-1', entity_type: 'EntTaskTool', status: 'STARTED' },
      details: { credentials_id: 'c9', agent_id: 'def-9', session_id: 'sess1', actor_type: 'HUMAN' } };
    const o = normalizeSecurityEvent(native, ctx());
    expect(o).toMatchObject({ nativeTaskId: 'tool-1', credentialId: 'c9', operation: 'issues_get', decision: 'ALLOW', createdAt: '2026-10-09T22:15:23.634925Z' });
    const sem = JSON.parse(o.semanticJson) as Record<string, unknown>;
    expect(sem.task).toEqual({ id: 'tool-1' });
    expect(sem.acting_user).toEqual({ id: 'u1' });
    expect((sem.details as Record<string, unknown>).agent_id).toBe('def-9');
  });
  it('contradictory top-level vs nested refs normalize to null gaps', () => {
    const o = normalizeSecurityEvent(ev({ task: { id: 'other' }, details: { credentials_id: 'c2' } }), ctx());
    expect(o.nativeTaskId).toBeNull();
    expect(o.credentialId).toBeNull();
  });
  it('documented-shape semanticJson is unchanged by the native-shape keys (absent keys dropped)', () => {
    expect(Object.keys(JSON.parse(normalizeSecurityEvent(ev(), ctx()).semanticJson)).sort()).toEqual(
      ['acting_user_id', 'capability', 'created_at', 'credentials_id', 'decision', 'details', 'id', 'operation', 'reason_code', 'task_id']);
  });
  it('a spoofed agent label in the payload is preserved as data but never becomes identity/subject', () => {
    const o = normalizeSecurityEvent(ev({ details: { agent: 'control-agent' }, agent_label: 'control' }), ctx());
    expect(o.nativeIdentityKey).toBe('["ws1","e1"]');
    expect(semanticOf(ev({ agent_label: 'control' }))).not.toHaveProperty('agent_label');
  });
});

describe('normalizeTask', () => {
  it('distinguishes tool and agent tasks and parses response_data', () => {
    const tool = normalizeTask({ id: 't', parent_task_id: 'p', tool_name: 'issues_get', status: 'DONE', http_status_code: 200, response_data: '{"a":1}' }, 's')!;
    expect(tool.kind).toBe('tool');
    expect(tool.responseData).toEqual({ a: 1 });
    const agent = normalizeTask({ id: 'p', parent_task_id: null, entity_type: 'EntTaskAgent', status: 'DONE', agent: { id: 'inst-1' }, version_id: 'v1' }, 's')!;
    expect(agent.kind).toBe('agent');
    expect(agent.agentRef).toBe('inst-1');
    expect(agent.versionId).toBe('v1');
  });
  it('without entity_type a node with agent/version_id/null parent is NOT an agent (unknown)', () => {
    const n = normalizeTask({ id: 'x', parent_task_id: null, agent: { id: 'inst-1' }, version_id: 'v1', status: 'DONE' }, 's')!;
    expect(n.kind).toBe('unknown');
    expect(n.agentRef).toBeNull();
  });
});
