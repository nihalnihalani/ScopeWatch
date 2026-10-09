// Shapes observed natively on 2026-10-09 (calibration session 01a1210e-1f93-351a-0000-3bb41b85f91f, account
// nihal.nihalani). Field values below are copied in reduced form from that session's task listing.
import { describe, expect, it } from 'vitest';
import { isSecurityEvent, normalizeTask, securityFields } from '../../../src/integrations/guild/collector.js';

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
});
