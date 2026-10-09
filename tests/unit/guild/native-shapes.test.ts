// Shapes observed natively on 2026-10-09 (calibration session 01a1210e-1f93-351a-0000-3bb41b85f91f, account
// nihal.nihalani). Field values below are copied in reduced form from that session's task listing.
import { describe, expect, it } from 'vitest';
import { eventRefs, isRuntimeDone, isSecurityEvent, normalizeTask, securityFieldConflicts, securityFields, semanticOf } from '../../../src/integrations/guild/collector.js';
import { canonicalJson } from '../../../src/integrations/guild/util.js';

describe('observed native shapes', () => {
  it('accepts the observed security_event type and the documented security type, nothing else', () => {
    expect(isSecurityEvent({ type: 'security_event' })).toBe(true);
    expect(isSecurityEvent({ type: 'security' })).toBe(true);
    expect(isSecurityEvent({ type: 'runtime_error' })).toBe(false);
  });

  it('tool tasks link to their agent task through parent_task.id', () => {
    const tool = normalizeTask({ id: 't-tool', entity_type: 'EntTaskTool', tool_name: 'github_issues_get', status: 'ERROR',
      parent_task: { id: 't-agent', entity_type: 'EntTaskAgent', parent_task_id: null } }, 's1');
    expect(tool?.kind).toBe('tool');
    expect(tool?.parentTaskId).toBe('t-agent');
  });

  it('agent tasks expose the agent definition id and version object', () => {
    const agent = normalizeTask({ id: 't-agent', entity_type: 'EntTaskAgent', parent_task_id: null, status: 'DONE',
      agent: { id: 'def-1', full_name: 'owner~name' }, version: { id: 'ver-1' } }, 's1');
    expect(agent?.kind).toBe('agent');
    expect(agent?.agentRef).toBe('def-1');
    expect(agent?.versionId).toBe('ver-1');
    expect(agent?.parentTaskId).toBeNull();
  });

  it('flattens nested security payloads without letting them override envelope identity', () => {
    const f = securityFields({ id: 'ev-1', type: 'security_event', created_at: '2026-10-09T14:00:00Z',
      security: { id: 'spoof', decision: 'ALLOW', operation: 'issues_get', credentials_id: 'c1', task_id: 't1' } });
    expect(f.id).toBe('ev-1');
    expect(f.decision).toBe('ALLOW');
    expect(f.credentials_id).toBe('c1');
  });

  it('envelope vs nested disagreement on a decision/reference field is a gap, not precedence', () => {
    const e = { id: 'ev-1', type: 'security_event', created_at: '2026-10-09T14:00:00Z', decision: 'DENY', credentials_id: 'c1',
      security: { decision: 'ALLOW', operation: 'issues_get', credentials_id: 'c1', task_id: 't1' } };
    expect(securityFieldConflicts(e)).toEqual(['decision']);
    const f = securityFields(e);
    expect(f.decision).toBeNull();
    expect(f.credentials_id).toBe('c1');
    expect(f.operation).toBe('issues_get');
    expect(securityFieldConflicts({ id: 'ev-2', decision: 'ALLOW' })).toEqual([]);
  });

  // Native 2026-10-09 (account charliegillet): task object + details-nested refs; runtime_done carries tool results.
  it('reads task/credential/agent/session refs from the native task object and details', () => {
    const r = eventRefs({ id: 'ev', task: { id: 't-tool', entity_type: 'EntTaskTool' },
      details: { credentials_id: 'c1', agent_id: 'def-1', session_id: 's1', actor_type: 'HUMAN' } });
    expect(r).toEqual({ taskId: 't-tool', credentialsId: 'c1', agentRef: 'def-1', sessionRef: 's1', workspaceRef: null, conflicts: [] });
  });

  it('top-level and nested refs must agree; disagreement is a conflict, not precedence', () => {
    expect(eventRefs({ task_id: 't1', task: { id: 't1' }, credentials_id: 'c1', details: { credentials_id: 'c1' } }))
      .toMatchObject({ taskId: 't1', credentialsId: 'c1', conflicts: [] });
    const r = eventRefs({ task_id: 't1', task: { id: 't2' }, credentials_id: 'c1', details: { credentials_id: 'c2', agent_id: 'd' }, agent_id: 'e' });
    expect(r).toMatchObject({ taskId: null, credentialsId: null, agentRef: null });
    expect(r.conflicts).toEqual(['task_id', 'credentials_id', 'agent_id']);
  });

  it('an envelope/nested conflict is not refilled from task.id or details, on the raw event, the merge or semanticJson', () => {
    const raw = { id: 'ev', task_id: 'tool1', task: { id: 'tool1' }, credentials_id: 'C1', details: { credentials_id: 'C1', workspace_id: 'ws1' },
      security: { task_id: 'tool2', credentials_id: 'C9' } };
    for (const e of [raw, securityFields(raw)]) {
      const r = eventRefs(e);
      expect(r).toMatchObject({ taskId: null, credentialsId: null, workspaceRef: 'ws1' });
      expect(r.conflicts).toEqual(['task_id', 'credentials_id']);
    }
    const merged = securityFields(raw);
    expect(merged.field_conflicts).toEqual(['task_id', 'credentials_id']);
    const projected = JSON.parse(canonicalJson(semanticOf(merged))) as Record<string, unknown>;
    expect(projected).not.toHaveProperty('security');
    expect(eventRefs(projected)).toMatchObject({ taskId: null, credentialsId: null, conflicts: ['task_id', 'credentials_id'] });
    expect(JSON.parse(canonicalJson(semanticOf(securityFields({ id: 'ev', task: { id: 't' } }))))).not.toHaveProperty('field_conflicts');
  });

  it('top-level and details workspace_id must agree', () => {
    expect(eventRefs({ workspace_id: 'w1', details: { workspace_id: 'w2' } })).toMatchObject({ workspaceRef: null, conflicts: ['workspace_id'] });
  });

  it('recognizes runtime_done events', () => {
    expect(isRuntimeDone({ type: 'runtime_done', content: {} })).toBe(true);
    expect(isRuntimeDone({ type: 'runtime_start' })).toBe(false);
    expect(isSecurityEvent({ type: 'runtime_done' })).toBe(false);
  });
});
