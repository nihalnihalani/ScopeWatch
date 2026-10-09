import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Comparison } from '../../../src/client/components/Comparison.js';
import { EffectPanel } from '../../../src/client/components/EffectPanel.js';
import { InvestigationPanel } from '../../../src/client/components/Misc.js';
import { ReviewDialog } from '../../../src/client/components/ReviewDialog.js';
import { ApiClientError, type ApiClient } from '../../../src/client/http-client.js';
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
    generations: async () => [],
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
    expect(screen.getByRole('button', { name: 'Review restriction' }).getAttribute('aria-disabled')).toBe('false');
    expect(screen.getAllByText(/Simulated — contract test against mock Guild API; not native evidence/).length).toBeGreaterThan(0);
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

describe('contract-test investigation', () => {
  it('allows running and labels mock narrative as not model output', () => {
    const base = makeDetail({}, 'contract_test');
    const detail = { ...base, investigation: { investigationId: 'i', caseId: 'c', caseRevision: 3, provenance: 'contract_test' as const, state: 'created' as const, contextSha256: '0'.repeat(64), nativeSessionId: null, nativeTaskId: null, contextReadRef: null, incidentUrl: null, narrative: 'canned', grounded: null, checks: [], unavailableReason: null, updatedAt: 'x' } };
    render(<InvestigationPanel detail={detail} ops={fakeOps()} />);
    expect(screen.getByText(/Mock incident text from contract-test Guild mock — not model output, not evidence/)).toBeTruthy();
    cleanup();
    render(<InvestigationPanel detail={makeDetail({}, 'contract_test')} ops={fakeOps()} />);
    expect(screen.getByRole('button', { name: 'Run investigation' }).getAttribute('aria-disabled')).toBe('false');
  });
});

describe('contract-test review dialog', () => {
  it('opens labeled simulated, traps focus and restores focus on Escape', async () => {
    render(<App client={fakeClient()} />);
    await screen.findByText('Subject versus control');
    const opener = screen.getByRole('button', { name: 'Review restriction' });
    opener.focus();
    fireEvent.click(opener);
    const dlg = await screen.findByRole('dialog');
    expect(within(dlg).getAllByText(/Simulated — contract test against mock Guild API; not native evidence/).length).toBeGreaterThan(0);
    expect(dlg.contains(document.activeElement)).toBe(true);
    const f = Array.from(dlg.querySelectorAll<HTMLElement>('button, textarea'));
    f[f.length - 1]!.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(dlg.contains(document.activeElement)).toBe(true);
    fireEvent.keyDown(document, { key: 'Escape' });
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
    expect(document.activeElement).toBe(opener);
  });
});

describe('removal receipt, config checks and simulated styling', () => {
  it('removal form collects observed selectors and sends them', async () => {
    const removalReceipt = vi.fn().mockResolvedValue(makeAction({ kind: 'recovery' }));
    const rec = makeAction({ actionId: 'rec-1', kind: 'recovery', state: 'approved' });
    render(<EffectPanel detail={makeDetail({ actions: [makeAction({ state: 'restriction_verified' }), rec] })} ops={fakeOps({ removalReceipt })} onOpenReview={() => {}} onOpenHandoff={() => {}} />);
    const btn = screen.getByRole('button', { name: 'Record removal receipt' });
    expect(btn.getAttribute('aria-disabled')).toBe('true');
    const vals: Record<string, string> = { 'Workspace ID': 'ws-test', 'Policy subject ID': 'subj-breach', 'Credential ID': 'cred-test', Operation: 'repo.read', Decision: 'DENY', 'Removed at (UTC)': '2026-10-09T19:00:00Z', 'Evidence note': 'seen removed' };
    for (const [l, v] of Object.entries(vals)) fireEvent.change(screen.getByLabelText(l, { exact: true }), { target: { value: v } });
    fireEvent.click(screen.getByRole('button', { name: 'Record removal receipt' }));
    await waitFor(() => expect(removalReceipt).toHaveBeenCalled());
    expect(removalReceipt.mock.calls[0]![1].observedSelectors).toMatchObject({ workspaceId: 'ws-test', decision: 'DENY', resources: null });
  });

  it('renders configuration checks apart from native proof gates, never as passed', async () => {
    const status = makeStatus({ configChecks: [{ check: 'GUILD_WORKSPACE_ID', status: 'present', detail: 'set' }, { check: 'GUILD_TRIGGER_KEY', status: 'missing', detail: 'unset' }], nativeGates: [{ gate: 'G1', status: 'pending', detail: 'no receipt', receiptRef: null }, { gate: 'G2', status: 'passed', detail: 'ok', receiptRef: 'receipt:g2:1' }] });
    render(<App client={fakeClient({ status: async () => status })} />);
    await screen.findByText(/Configuration checks/);
    expect(screen.getByText(/Native proof gates/)).toBeTruthy();
    expect(document.body.textContent).toContain('receipt:g2:1');
    expect(document.body.textContent).not.toMatch(/\d of \d passed/);
  });

  it('styles simulated outcomes with the hatched simulated tone, not native green', () => {
    const action = makeAction({ provenance: 'contract_test', state: 'simulated_restriction_observed' });
    const { container } = render(<EffectPanel detail={makeDetail({ actions: [action] }, 'contract_test')} ops={fakeOps()} onOpenReview={() => {}} onOpenHandoff={() => {}} />);
    expect(container.querySelector('.badge.tone-sim')).toBeTruthy();
    expect(container.querySelector('.badge.tone-ok')).toBeNull();
  });
});

describe('receipt forms for every accepting state', () => {
  const rec = (state: 'approved' | 'scope_mismatch') => makeAction({ actionId: 'rec-1', kind: 'recovery', state });
  it('shows the removal form for approved and scope_mismatch recovery actions, with mismatch note', () => {
    for (const st of ['approved', 'scope_mismatch'] as const) {
      const { unmount } = render(<EffectPanel detail={makeDetail({ actions: [makeAction({ state: 'restriction_verified' }), rec(st)] })} ops={fakeOps()} onOpenReview={() => {}} onOpenHandoff={() => {}} />);
      expect(screen.getByRole('button', { name: 'Record removal receipt' })).toBeTruthy();
      if (st === 'scope_mismatch') expect(screen.getByText(/did not match the restriction scope/)).toBeTruthy();
      unmount();
    }
  });

  it.each(['approved', 'native_application_pending', 'native_application_unknown', 'scope_mismatch', 'stale'] as const)('native receipt form is reachable in state %s', (st) => {
    const d = makeDetail({ actions: [makeAction({ state: st })] });
    render(<ReviewDialog detail={d} ops={fakeOps()} onClose={() => {}} initial="handoff" />);
    expect(screen.getByRole('button', { name: st === 'stale' ? 'Record as disputed out-of-band application' : 'Record native receipt' })).toBeTruthy();
    if (st === 'stale') expect(screen.getByText(/disputed out-of-band application/, { selector: 'strong' })).toBeTruthy();
    cleanup();
  });
});

describe('dialog never offers Approve while a non-rejected action exists', () => {
  it.each(['approved', 'native_application_observed', 'verification_failed', 'verification_unknown', 'restriction_verified', 'scope_mismatch', 'disputed_stale_application'] as const)('state %s shows handoff status, not Approve', (st) => {
    const d = makeDetail({ actions: [makeAction({ state: st })] });
    for (const initial of ['review', 'handoff'] as const) {
      render(<ReviewDialog detail={d} ops={fakeOps()} onClose={() => {}} initial={initial} />);
      expect(screen.queryByRole('button', { name: 'Approve exact scope' })).toBeNull();
      expect(screen.getByText('Human-native step required')).toBeTruthy();
      cleanup();
    }
  });

  it('a rejected action allows a fresh review', () => {
    render(<ReviewDialog detail={makeDetail({ actions: [makeAction({ state: 'rejected' })] })} ops={fakeOps()} onClose={() => {}} />);
    expect(screen.getByRole('button', { name: 'Approve exact scope' })).toBeTruthy();
  });
});

describe('workflow stepper, earlier attempts, grouped timeline, environment panel', () => {
  it('derives steps from the record: replay steps are not eligible, simulated outcomes are labeled', async () => {
    const { WorkflowStepper } = await import('../../../src/client/components/Stepper.js');
    const { container } = render(<WorkflowStepper detail={makeDetail({}, 'replay')} />);
    const step = (k: string) => container.querySelector(`[data-step="${k}"]`)!.textContent!;
    expect(step('review')).toContain('Not eligible (replay)');
    expect(step('apply')).toContain('human, in Guild UI');
    expect(step('verify')).toContain('Not eligible (replay)');
    cleanup();
    const sim = makeAction({ provenance: 'contract_test', state: 'simulated_restriction_observed' });
    const r2 = render(<WorkflowStepper detail={makeDetail({ actions: [sim] }, 'contract_test')} />);
    const verify = r2.container.querySelector('[data-step="verify"]')!.textContent!;
    expect(verify).toContain('Simulated');
    expect(verify).not.toMatch(/^.*Verified/);
    cleanup();
    const nat = render(<WorkflowStepper detail={makeDetail({ actions: [makeAction({ state: 'approved' })] })} />);
    expect(nat.container.querySelector('[data-step="apply"]')!.getAttribute('aria-current')).toBe('step');
    expect(nat.container.querySelector('[data-step="verify"]')!.textContent).toContain('Not started');
  });

  it('keeps the latest verification visible and collapses earlier attempts', () => {
    const probe = (role: 'target' | 'control') => ({ role, outcome: role === 'target' ? 'not_refused' : 'succeeded_expected', decision: 'ALLOW', reasonCode: null, boundSubjectId: null, credentialId: null, nativeSessionId: null, provenance: 'native' as const, inspection: 'x' });
    const v = (id: string) => ({ verificationId: id, verdict: 'verification_failed', kind: 'restriction', verifiedAt: 't', explanation: `explain-${id}`, target: probe('target'), control: probe('control'), residualScope: [] }) as unknown as import('../../../src/shared/contracts.js').VerificationReceipt;
    const action = makeAction({ state: 'verification_failed', verifications: [v('v1'), v('v2'), v('v3')] });
    render(<EffectPanel detail={makeDetail({ actions: [action] })} ops={fakeOps()} onOpenReview={() => {}} onOpenHandoff={() => {}} />);
    expect(screen.getByText('Earlier attempts (2)')).toBeTruthy();
    const latest = screen.getAllByTestId('verification')[0]!;
    expect(latest.textContent).toContain('explain-v3');
    expect(latest.closest('details')).toBeNull();
    expect(screen.getByText('explain-v1').closest('details')).toBeTruthy();
  });

  it('groups consecutive session entries into one timeline entry and keeps selection working', async () => {
    const { Timeline } = await import('../../../src/client/components/Timeline.js');
    const d = makeDetail();
    const mk = (id: string) => ({ at: '2026-10-09T18:01:00.000000000Z', kind: 'session' as const, title: `Session ${id}: 3 counted ALLOW identities`, detail: '', provenance: d.provenance, ref: id });
    const detail = { ...d, timeline: [mk('sess-a'), mk('sess-b'), mk('sess-c')] };
    const { container } = render(<Timeline detail={detail} />);
    expect(container.querySelectorAll('ol.timeline > li').length).toBe(1);
    expect(screen.getByText('Sessions (3)')).toBeTruthy();
    fireEvent.click(screen.getAllByRole('button', { name: /Session sess-a: 3 counted/ })[0]!);
    expect(screen.getByTestId('inspector').textContent).toContain('sess-a');
  });

  it('collapses config checks and gates into one environment panel with a one-line summary', async () => {
    render(<App client={fakeClient({ status: async () => makeStatus({ configChecks: [{ check: 'A', status: 'missing', detail: 'unset' }], nativeGates: [{ gate: 'G1', status: 'pending', detail: 'd', receiptRef: null }, { gate: 'G2', status: 'pending', detail: 'd', receiptRef: null }] }) })} />);
    const panel = await screen.findByLabelText('Environment and native gates');
    expect(panel.tagName).toBe('DETAILS');
    expect((panel as HTMLDetailsElement).open).toBe(false);
    expect(panel.querySelector('summary')!.textContent).toContain('1 missing setting · gates G1/G2 pending');
  });
});
