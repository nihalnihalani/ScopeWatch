import { describe, expect, it } from 'vitest';
import { buildProbeInput, classifyDecision, inspectMarker } from '../../../src/integrations/guild/verifier.js';
import { normalizeTask } from '../../../src/integrations/guild/collector.js';

describe('probe classification', () => {
  it('DENY + POLICY_DENIED is policy refusal; other DENY/ERROR is not', () => {
    expect(classifyDecision('DENY', 'POLICY_DENIED')).toBe('refused_policy');
    expect(classifyDecision('DENY', 'PLATFORM_ACCESS_DENIED')).toBe('refused_other');
    expect(classifyDecision('ERROR', 'CREDENTIAL_UNAVAILABLE')).toBe('refused_other');
    expect(classifyDecision('ALLOW', 'ACCESS_ALLOWED')).toBe('allowed');
    expect(classifyDecision(null, null)).toBe('missing');
  });
  it('marker inspection is tri-state on actual response_data', () => {
    const mk = (rd: unknown) => normalizeTask({ id: 't', parent_task_id: 'p', tool_name: 'issues_get', status: 'DONE', response_data: rd }, 's')!;
    expect(inspectMarker(mk('{"body":"x MARK y"}'), 'MARK')).toBe('present');
    expect(inspectMarker(mk('{"body":"nothing"}'), 'MARK')).toBe('absent');
    expect(inspectMarker(mk(null), 'MARK')).toBe('no_data');
    expect(inspectMarker(undefined, 'MARK')).toBe('no_data');
  });
  it('probe instruction is fixed text with only validated substitutions', () => {
    const t = buildProbeInput('issues_get', 'acme/repo', 1);
    expect(t).toBe('ScopeWatch probe. Use the issues_get tool exactly once to read synthetic ticket #1 in acme/repo, then reply with the ticket title only. Do not call any other tool.');
  });
});
