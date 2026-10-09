import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Comparison } from '../../../src/client/components/Comparison.js';
import { EffectPanel } from '../../../src/client/components/EffectPanel.js';
import { InvestigationPanel } from '../../../src/client/components/Misc.js';
import { ReviewDialog } from '../../../src/client/components/ReviewDialog.js';
import { ApiClientError, type ApiClient } from '../../../src/client/api.js';
import type { Ops } from '../../../src/client/components/ops.js';
import { App } from '../../../src/client/App.js';
import { makeAction, makeDetail, makeSession, makeStatus } from './fixtures.js';

afterEach(cleanup);

function fakeOps(over: Partial<Ops> = {}): Ops {
  const rej = () => Promise.reject(new Error('unexpected call'));
  return { investigate: rej, review: rej, nativeReceipt: rej, verify: rej, createRecovery: rej, actionReview: rej, removalReceipt: rej, reload: async () => {}, ...over } as Ops;
}

function fakeClient(over: Partial<ApiClient> = {}): ApiClient {
  const detail = makeDetail({}, 'contract_test');
  return {
    session: async () => makeSession({ mode: 'contract_test' }),
    login: async () => makeSession(),
    logout: async () => makeSession({ authenticated: false, csrfToken: null }),
    status: async () => makeStatus({ mode: 'contract_test' }),
    cases: async () => [detail],
    caseDetail: async () => detail,
    runReplay: async () => ({ generationId: 'g', state: 'evaluated', caseId: null, readinessGaps: 0, detail: '' }),
    runPipeline: async () => ({ generationId: 'g', state: 'evaluated', caseId: null, readinessGaps: 0, detail: '' }),
    investigate: async () => detail,
    review: async () => detail,
    nativeReceipt: async () => makeAction(),
    verify: async () => makeAction(),
    createRecovery: async () => makeAction(),
    actionReview: async () => makeAction(),
    removalReceipt: async () => makeAction(),
    exportBundle: async () => { throw new Error('n/a'); },
    ...over,
  };
}

describe('Comparison', () => {
  it('shows a historical breach with current count 0 beside the control under its own allowance', () => {
    render(<Comparison detail={makeDetail()} />);
    expect(screen.getByTestId('primary-peak').textContent).toBe('62');
    expect(screen.getByTestId('primary-current').textContent).toBe('0');
    expect(screen.getByTestId('primary-allowance').textContent).toBe('40');
    expect(screen.getByText(/Historical breach, current count within allowance/)).toBeTruthy();
    expect(screen.getByTestId('control-allowance').textContent).toBe('120');
    expect(screen.getByTestId('control-current').textContent).toBe('90');
    expect(screen.getAllByText(/not proof that a read succeeded/).length).toBeGreaterThan(0);
  });
});

describe('EffectPanel gating', () => {
  it('disables Review restriction for replay provenance and says why', () => {
    const onOpen = vi.fn();
    render(<EffectPanel detail={makeDetail({}, 'replay')} ops={fakeOps()} onOpenReview={onOpen} onOpenHandoff={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Review restriction' });
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText(/Replay provenance is not action eligible/)).toBeTruthy();
    fireEvent.click(btn);
    expect(onOpen).not.toHaveBeenCalled();
  });

  it('enables Review restriction for a ready native case', () => {
    const onOpen = vi.fn();
    render(<EffectPanel detail={makeDetail()} ops={fakeOps()} onOpenReview={onOpen} onOpenHandoff={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: 'Review restriction' }));
    expect(onOpen).toHaveBeenCalled();
  });

  it('labels simulated verdicts as simulated and never as verified', () => {
    const action = makeAction({ provenance: 'contract_test', state: 'simulated_restriction_observed' });
    render(<EffectPanel detail={makeDetail({ actions: [action] }, 'contract_test')} ops={fakeOps()} onOpenReview={() => {}} onOpenHandoff={() => {}} />);
    expect(screen.getAllByText(/SIMULATED|Simulated/).length).toBeGreaterThan(0);
    expect(screen.queryByText('Restriction verified')).toBeNull();
  });

  it('shows scope_mismatch with server-computed mismatches', () => {
    const action = makeAction({ state: 'scope_mismatch', nativeReceipt: { recordedBy: 'maya', recordedAt: '2026-10-09T18:20:00Z', method: 'guild_ui', nativeRuleId: 'r1', observedSelectors: { credentialId: 'x', operation: 'o', policySubjectId: 'p', workspaceId: 'w', decision: 'DENY', resources: null }, appliedAt: '2026-10-09T18:19:00Z', evidenceNote: 'note', matchesApprovedScope: false, mismatches: ['credentialId differs'] } });
    render(<EffectPanel detail={makeDetail({ actions: [action] })} ops={fakeOps()} onOpenReview={() => {}} onOpenHandoff={() => {}} />);
    expect(screen.getByText(/does NOT match the approved scope/)).toBeTruthy();
    expect(screen.getByText('credentialId differs')).toBeTruthy();
  });
});

describe('ReviewDialog', () => {
  it('traps focus, closes on Escape and restores focus to the opener', async () => {
    const opener = document.createElement('button');
    opener.textContent = 'opener';
    document.body.appendChild(opener);
    opener.focus();
    const onClose = vi.fn();
    const { unmount } = render(<ReviewDialog detail={makeDetail()} ops={fakeOps()} onClose={onClose} />);
    const dlg = screen.getByRole('dialog');
    expect(dlg.getAttribute('aria-modal')).toBe('true');
    expect(dlg.contains(document.activeElement)).toBe(true);
    // Tab from the last focusable wraps to the first.
    const focusables = Array.from(dlg.querySelectorAll<HTMLElement>('button, textarea, input, select, a[href]'));
    focusables[focusables.length - 1]!.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(focusables[0]);
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(focusables[focusables.length - 1]);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
    unmount();
    expect(document.activeElement).toBe(opener);
    opener.remove();
  });

  it('requires a reason before approving and sends the current revision', async () => {
    const review = vi.fn().mockResolvedValue(makeDetail());
    render(<ReviewDialog detail={makeDetail()} ops={fakeOps({ review })} onClose={() => {}} />);
    const approve = screen.getByRole('button', { name: 'Approve exact scope' });
    expect(approve.getAttribute('aria-disabled')).toBe('true');
    fireEvent.change(screen.getByLabelText('Reason for this decision'), { target: { value: 'Peak 62 of 40 allowance confirmed by oracle' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve exact scope' }));
    await waitFor(() => expect(review).toHaveBeenCalledTimes(1));
    expect(review.mock.calls[0]![1]).toMatchObject({ expectedRevision: 3, decision: 'approve' });
  });

  it('shows the stale state when the server answers 409 stale_revision', async () => {
    const review = vi.fn().mockRejectedValue(new ApiClientError(409, 'stale_revision', 'revision 3 is not current (4)'));
    render(<ReviewDialog detail={makeDetail()} ops={fakeOps({ review })} onClose={() => {}} />);
    fireEvent.change(screen.getByLabelText('Reason for this decision'), { target: { value: 'Peak 62 of 40 allowance confirmed' } });
    fireEvent.click(screen.getByRole('button', { name: 'Approve exact scope' }));
    const alert = await screen.findByRole('alert');
    expect(within(alert).getByText(/Stale/)).toBeTruthy();
    expect(within(alert).getByText(/NOT applied/)).toBeTruthy();
    expect(within(alert).getByRole('button', { name: 'Reload current state' })).toBeTruthy();
  });

  it('after approval presents a human-native handoff, not an automatic effect', () => {
    const detail = makeDetail({ actions: [makeAction({ state: 'approved' })] });
    render(<ReviewDialog detail={detail} ops={fakeOps()} onClose={() => {}} />);
    expect(screen.getByText(/Access & setup → Credentials/)).toBeTruthy();
    expect(screen.getByText(/no API that changes Guild policy/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Record native receipt' })).toBeTruthy();
  });
});

describe('untrusted text', () => {
  it('renders a narrative containing markup as text', () => {
    const narrative = '<script>window.__pwned = true</script><img src=x onerror="window.__pwned=true">';
    const detail = makeDetail({ investigation: { investigationId: 'i', caseId: 'c', caseRevision: 3, provenance: 'native', state: 'created', contextSha256: '0'.repeat(64), nativeSessionId: null, nativeTaskId: null, contextReadRef: null, incidentUrl: null, narrative, grounded: null, checks: [], unavailableReason: null, updatedAt: '2026-10-09T18:00:00Z' } });
    const { container } = render(<InvestigationPanel detail={detail} ops={fakeOps()} />);
    expect(screen.getByTestId('narrative').textContent).toBe(narrative);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img')).toBeNull();
    expect((window as unknown as { __pwned?: boolean }).__pwned).toBeUndefined();
  });
});

describe('App states', () => {
  it('shows the contract-test banner on every view and cannot approve', async () => {
    render(<App client={fakeClient()} />);
    await screen.findByText('Subject versus control');
    const strip = screen.getByRole('region', { name: 'Provenance' });
    expect(strip.textContent).toContain('Contract test — mock Guild API, not native evidence');
    expect(screen.getByRole('button', { name: 'Review restriction' }).getAttribute('aria-disabled')).toBe('true');
  });

  it('shows login-required with the provenance strip when unauthenticated', async () => {
    render(<App client={fakeClient({ session: async () => makeSession({ authenticated: false, csrfToken: null, mode: 'replay' }) })} />);
    await screen.findByLabelText('Operator secret');
    expect(screen.getByRole('region', { name: 'Provenance' }).textContent).toContain('REPLAY');
  });

  it('lists missing Guild settings by name when unconfigured', async () => {
    const status = makeStatus({ mode: 'native', guild: { status: 'unconfigured', baseUrl: null, detail: 'Guild is not configured', missing: ['GUILD_WORKSPACE_ID', 'GUILD_TRIGGER_KEY'] } });
    render(<App client={fakeClient({ status: async () => status, session: async () => makeSession(), cases: async () => [] })} />);
    await screen.findByText('Guild is not configured', { selector: 'h3' }).catch(() => null);
    await waitFor(() => expect(document.body.textContent).toContain('GUILD_WORKSPACE_ID'));
    expect(document.body.textContent).toContain('GUILD_TRIGGER_KEY');
    expect(screen.getByText('No cases yet')).toBeTruthy();
  });

  it('shows database unavailable from status', async () => {
    const status = makeStatus({ clickhouse: { status: 'unavailable', target: null, version: null, detail: 'connect ECONNREFUSED' } });
    render(<App client={fakeClient({ status: async () => status })} />);
    await screen.findByText(/ClickHouse unavailable/);
  });

  it('shows partial coverage and integrity conflict notices', async () => {
    const d = makeDetail({ evidenceState: 'evidence_incomplete', readiness: { generationId: 'g', ready: false, gaps: [{ kind: 'coverage_incomplete', detail: 'session sess-z still open', sessionId: 'sess-z' }, { kind: 'identity_conflict', detail: 'same ID, two decisions' }], cohortSessions: 3, completeSessions: 2, canonicalKeys: 9, conflictKeys: 1 } });
    render(<App client={fakeClient({ caseDetail: async () => d, cases: async () => [d] })} />);
    await screen.findByText(/Partial coverage/);
    expect(screen.getByText(/Integrity conflict/)).toBeTruthy();
    expect(screen.getByText(/2 of 3 cohort sessions are complete/)).toBeTruthy();
  });

  it('announces state changes through a polite live region', async () => {
    render(<App client={fakeClient()} />);
    await screen.findByText('Subject versus control');
    const live = document.querySelector('[aria-live="polite"]');
    expect(live).toBeTruthy();
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: 'Refresh' })); });
    await waitFor(() => expect(live!.textContent).toBe('Refreshed.'));
  });
});

describe('non-native polish and session evidence', () => {
  it('header action badge says not action eligible for replay', async () => {
    const d = makeDetail({}, 'replay');
    render(<App client={fakeClient({ session: async () => makeSession({ mode: 'replay' }), status: async () => makeStatus({ mode: 'replay' }), caseDetail: async () => d, cases: async () => [d] })} />);
    await screen.findByText(/Not action eligible \(replay\)/);
    const actionDd = screen.getByText('Action', { selector: 'dt' }).nextElementSibling!;
    expect(actionDd.textContent).not.toContain('Ready for review');
  });

  it('disables Run investigation for replay with the reason', () => {
    render(<InvestigationPanel detail={makeDetail({}, 'replay')} ops={fakeOps()} />);
    expect(screen.getByRole('button', { name: 'Run investigation' }).getAttribute('aria-disabled')).toBe('true');
    expect(screen.getByText(/Hosted investigation is unavailable for replay/)).toBeTruthy();
  });

  it('shows per-session evidence and the exact digest input', async () => {
    const { Timeline } = await import('../../../src/client/components/Timeline.js');
    render(<Timeline detail={makeDetail()} />);
    fireEvent.click(screen.getAllByRole('button', { name: /sess-a/ })[0]!);
    const insp = screen.getByTestId('inspector');
    expect(insp.textContent).toContain('task_graph:fixture');
    expect(insp.textContent).toContain('proof-1');
    cleanup();
    render(<ReviewDialog detail={makeDetail()} ops={fakeOps()} onClose={() => {}} />);
    expect(screen.getByTestId('digest-input').textContent).toContain('"intendedMutation":"add_deny_rule"');
  });
});
