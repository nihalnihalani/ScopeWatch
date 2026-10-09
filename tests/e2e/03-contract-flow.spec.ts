/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test, type Page } from '@playwright/test';
import { CONTRACT, SHOTS, apiGet, apiPost, mockControl, signInOk, watch } from './support/helpers.js';

/**
 * contract_test: the app talks to the loopback CONTRACT-TEST MOCK Guild API. Everything here is simulated
 * and NOT native evidence. The "human applies the policy" step is simulated by calling the MOCK control
 * endpoint directly from the test, never through the application.
 */
test.describe.configure({ mode: 'serial' });

let caseId = '';
let actionId = '';

async function detail(page: Page): Promise<any> {
  return apiGet(page, CONTRACT, `/api/cases/${caseId}`);
}
async function restrictionAction(page: Page): Promise<any> {
  const d = await detail(page);
  return [...d.actions].reverse().find((a: any) => a.kind === 'restriction');
}
async function recoveryAction(page: Page): Promise<any> {
  const d = await detail(page);
  return [...d.actions].reverse().find((a: any) => a.kind === 'recovery');
}
test('pipeline run from the UI produces a labeled contract_test case', async ({ page }) => {
  const w = watch(page);
  await mockControl('undeny');
  await signInOk(page, CONTRACT);
  const strip = page.getByRole('region', { name: 'Provenance' });
  await expect(strip).toHaveAttribute('data-provenance', 'contract_test');
  await page.getByRole('button', { name: 'Collect registered cohort and evaluate' }).click();
  await expect(page.getByRole('heading', { name: 'Subject versus control' })).toBeVisible({ timeout: 60_000 });
  const list = await apiGet<any[]>(page, CONTRACT, '/api/cases');
  expect(list.length).toBeGreaterThan(0);
  caseId = list[0].caseId;
  const d = await detail(page);
  expect(d.provenance).toBe('contract_test');
  expect(d.readiness.ready).toBe(true);
  expect(d.evaluation.oracleAgrees).toBe(true);
  const primary = d.candidates.find((c: any) => c.policySubjectId === d.primary.policySubjectId);
  await expect(page.getByTestId('primary-peak')).toHaveText(primary.peakCount);
  await expect(page.locator('[data-role="primary"]')).toContainText(primary.displayLabel);
  await page.screenshot({ path: `${SHOTS}/contract-test-case-1440.png`, fullPage: true });
  expect(w.unexpected()).toEqual([]);
});

test('review is reachable in the UI for contract_test with explicit SIMULATED labels; approve exact scope through the UI', async ({ page }) => {
  const w = watch(page);
  await signInOk(page, CONTRACT);
  const d = await detail(page);
  expect(d.proposedScope).toBeTruthy();
  await expect(page.locator('#open-review')).toHaveAttribute('aria-disabled', 'false');
  await page.locator('#open-review').click();
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible();
  await expect(dlg).toContainText(/simulated/i);
  await expect(dlg).toContainText(/not (native )?evidence|nothing here changes a real Guild/i);
  await expect(page.getByTestId('dlg-revision')).toHaveText(String(d.revision));
  await page.screenshot({ path: `${SHOTS}/contract-test-review-dialog-1440.png` });
  await page.locator('#rv-reason').fill('e2e: approve exact scope on contract_test case');
  await page.locator('#rv-approve').click();
  await expect(dlg.getByRole('heading', { name: 'Native handoff' })).toBeVisible();
  const a = await restrictionAction(page);
  actionId = a.actionId;
  expect(a.provenance).toBe('contract_test');
  expect(['approved', 'native_application_pending']).toContain(a.state);
  expect(a.scopeDigest).toBe(d.proposedScopeDigest);
  expect(a.approvedBy).toBe('e2e-operator');
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);
  expect(w.unexpected()).toEqual([]);
});

test('handoff dialog: focus moves in, Tab/Shift+Tab are trapped, Escape closes and restores focus to opener', async ({ page }) => {
  await signInOk(page, CONTRACT);
  const opener = page.getByRole('button', { name: 'Open native handoff and record receipt' });
  await opener.focus();
  await page.keyboard.press('Enter');
  const dlg = page.getByRole('dialog');
  await expect(dlg).toBeVisible();
  await expect(dlg).toHaveAttribute('aria-modal', 'true');
  expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]'))).toBe(true);
  // cycle many Tab presses: focus must never leave the dialog
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), `Tab #${i + 1}`).toBe(true);
  }
  for (let i = 0; i < 15; i++) {
    await page.keyboard.press('Shift+Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('[role="dialog"]')), `Shift+Tab #${i + 1}`).toBe(true);
  }
  await page.screenshot({ path: `${SHOTS}/contract-test-handoff-dialog-1440.png` });
  await page.keyboard.press('Escape');
  await expect(dlg).toHaveCount(0);
  await expect(opener).toBeFocused();
});

async function fillReceipt(page: Page, sel: Record<string, string>, note: string) {
  await page.locator('#nr-ws').fill(sel.workspaceId!);
  await page.locator('#nr-sub').fill(sel.policySubjectId!);
  await page.locator('#nr-cred').fill(sel.credentialId!);
  await page.locator('#nr-op').fill(sel.operation!);
  await page.locator('#nr-dec').fill(sel.decision!);
  await page.locator('#nr-at').fill(new Date().toISOString());
  await page.locator('#nr-note').fill(note);
}

test('native receipt with a wrong scope is accepted as an observation but flagged scope_mismatch', async ({ page }) => {
  const w = watch(page);
  await signInOk(page, CONTRACT);
  const d = await detail(page);
  const s = d.proposedScope;
  await page.getByRole('button', { name: 'Open native handoff and record receipt' }).click();
  await fillReceipt(page, { workspaceId: s.workspaceId, policySubjectId: 'some-other-subject-id', credentialId: s.credentialId, operation: s.operation, decision: s.decision }, 'e2e: deliberately wrong subject');
  await page.getByRole('button', { name: 'Record native receipt' }).click();
  await expect(page.getByRole('dialog').getByText('Recorded rule does NOT match the approved scope')).toBeVisible();
  const a = await restrictionAction(page);
  expect(a.state).toBe('scope_mismatch');
  expect(a.nativeReceipt.matchesApprovedScope).toBe(false);
  expect(a.nativeReceipt.mismatches.join(' ')).toMatch(/subject some-other-subject-id != approved/);
  await page.screenshot({ path: `${SHOTS}/contract-test-scope-mismatch-1440.png` });
  await page.keyboard.press('Escape');
  expect(w.unexpected([409])).toEqual([]);
});

test('correct native receipt moves to native_application_observed (still unverified)', async ({ page }) => {
  await signInOk(page, CONTRACT);
  const d = await detail(page);
  const s = d.proposedScope;
  await page.getByRole('button', { name: 'Open native handoff and record receipt' }).click();
  await fillReceipt(page, { workspaceId: s.workspaceId, policySubjectId: s.policySubjectId, credentialId: s.credentialId, operation: s.operation, decision: s.decision }, 'e2e: exact scope as simulated in mock');
  await page.getByRole('button', { name: 'Record native receipt' }).click();
  await expect(page.getByTestId('action-restriction').getByText('Recorded rule matches the approved scope')).toBeVisible();
  const a = await restrictionAction(page);
  expect(a.state).toBe('native_application_observed');
  const dlg = page.getByRole('dialog');
  await expect(dlg.getByRole('heading', { level: 2, name: 'Native handoff' })).toBeVisible();
  await expect(dlg.getByRole('button', { name: 'Approve exact scope' })).toHaveCount(0);
  await expect(dlg.getByRole('button', { name: 'Reject' })).toHaveCount(0);
  expect(a.verifications).toHaveLength(0);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('button', { name: 'Verify restriction with fresh sessions' })).toBeVisible();
});

test('stale action version (409) is visible in the UI and does not change state', async ({ page }) => {
  const w = watch(page);
  await signInOk(page, CONTRACT);
  await expect(page.getByRole('button', { name: 'Verify restriction with fresh sessions' })).toBeVisible();
  const before = await restrictionAction(page);
  // somebody else (another tab/operator) advances the action while this page still shows the old version.
  // NOTE: no mock DENY is applied, so this verification must FAIL (target not refused).
  const r = await apiPost(page, CONTRACT, `/api/actions/${actionId}/verify`, { expectedVersion: before.version });
  expect(r.status(), await r.text()).toBe(200);
  const mid = await restrictionAction(page);
  expect(mid.version).toBeGreaterThan(before.version);
  expect(mid.state).not.toBe('restriction_verified');
  expect(mid.state).not.toBe('simulated_restriction_observed');
  const v = mid.verifications[mid.verifications.length - 1];
  expect(v.verdict).not.toBe('restriction_verified');
  expect(v.verdict).not.toBe('simulated_restriction_observed');
  expect(v.target.outcome).not.toBe('refused_policy');
  // the UI still shows the old version: clicking Verify must surface the stale error
  await page.getByRole('button', { name: 'Verify restriction with fresh sessions' }).click();
  await expect(page.getByRole('alert').filter({ hasText: /stale|changed|version/i }).first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/contract-test-stale-409-1440.png`, fullPage: true });
  const after = await restrictionAction(page);
  expect(after.version).toBe(mid.version);
  expect(w.unexpected([409])).toEqual([]);
});

test('without a mock policy applied, verification reports a failed restriction (never verified)', async ({ page }) => {
  await signInOk(page, CONTRACT);
  const a = await restrictionAction(page);
  expect(['verification_failed', 'verification_unknown']).toContain(a.state);
  await expect(page.getByTestId('action-restriction')).toContainText(/fail|not refused|unknown|unproved/i);
  await expect(page.getByTestId('verification').first()).toBeVisible();
  await expect(page.getByText(/Target not refused by policy/).first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/contract-test-restriction-failed-1440.png`, fullPage: true });
});

test('after a HUMAN-simulated mock policy, verification yields simulated_restriction_observed only', async ({ page }) => {
  const w = watch(page);
  await mockControl('deny', {});
  await signInOk(page, CONTRACT);
  await page.getByRole('button', { name: 'Verify restriction with fresh sessions' }).click();
  await expect(page.getByTestId('action-restriction').getByText(/Simulated/).first()).toBeVisible({ timeout: 60_000 });
  const a = await restrictionAction(page);
  expect(a.state).toBe('simulated_restriction_observed');
  const v = a.verifications[a.verifications.length - 1];
  expect(v.verdict).toMatch(/^simulated_/);
  expect(v.target.outcome).toBe('refused_policy');
  expect(v.control.outcome).toBe('succeeded_expected');
  await expect(page.getByText('SIMULATED: produced against non-native data', { exact: false })).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/contract-test-simulated-restriction-1440.png`, fullPage: true });
  // the full action history must never contain a native verdict
  const d = await detail(page);
  const all = JSON.stringify(d.actions);
  expect(all).not.toContain('"restriction_verified"');
  expect(all).not.toMatch(/"verdict":"recovered"/);
  expect(w.unexpected([409])).toEqual([]);
});

test('recovery is a separate review: start, approve, record removal, fail without removal, then simulated_recovered', async ({ page }) => {
  await signInOk(page, CONTRACT);
  await page.locator('#rcv').fill('e2e: control compliant and incident closed');
  await page.getByRole('button', { name: 'Start recovery review' }).click();
  await expect(page.getByTestId('action-recovery')).toBeVisible();
  let rec = await recoveryAction(page);
  expect(rec.state).toBe('review_ready');
  const restr = await restrictionAction(page);
  expect(restr.state).toBe('simulated_restriction_observed'); // starting recovery does not release anything
  await page.locator('#arv').fill('e2e: approve recovery scope');
  await page.getByRole('button', { name: 'Approve recovery scope' }).click();
  await expect(page.locator('#rm-submit')).toBeVisible();
  const scope = (await detail(page)).proposedScope;
  const fillRemoval = async (subject: string, note: string) => {
    await page.locator('#rm-ws').fill(scope.workspaceId);
    await page.locator('#rm-sub').fill(subject);
    await page.locator('#rm-cred').fill(scope.credentialId);
    await page.locator('#rm-op').fill(scope.operation);
    await page.locator('#rm-dec').fill('DENY');
    await page.locator('#rm-a').fill(new Date().toISOString());
    await page.locator('#rm-n').fill(note);
  };
  // 1) removal receipt whose observed selectors do NOT match the restriction scope -> mismatch, recovery cannot be verified
  await fillRemoval('some-other-subject-id', 'e2e: observed removal of a different subject rule');
  await page.locator('#rm-submit').click();
  await expect.poll(async () => (await recoveryAction(page)).state).not.toBe('approved');
  rec = await recoveryAction(page);
  expect(rec.state).toBe('scope_mismatch');
  const blocked = await apiPost(page, CONTRACT, `/api/actions/${rec.actionId}/verify`, { expectedVersion: rec.version });
  expect(blocked.status()).toBe(409);
  await page.screenshot({ path: `${SHOTS}/contract-test-removal-mismatch-1440.png`, fullPage: true });
  // 2) correct removal receipt, but the mock DENY is STILL applied -> recovery verification must fail
  await expect(page.locator('#rm-submit')).toBeVisible(); // correction must be possible in the UI after scope_mismatch
  await fillRemoval(scope.policySubjectId, 'e2e: operator says removed (mock deny still applied)');
  await page.locator('#rm-submit').click();
  await expect(page.getByRole('button', { name: 'Verify recovery with fresh sessions' })).toBeVisible();
  await page.getByRole('button', { name: 'Verify recovery with fresh sessions' }).click();
  await expect(page.getByTestId('action-recovery').getByText(/Recovery verification failed|recovery failed|Recovery could not be decided/i).first()).toBeVisible({ timeout: 60_000 });
  rec = await recoveryAction(page);
  expect(['recovery_failed', 'recovery_unknown']).toContain(rec.state);
  // 3) human removes the mock rule, but the target's content is wrong: a bare ALLOW is NOT recovery
  await mockControl('undeny', {});
  await mockControl('scenario', { targetWrongContent: true });
  try {
    await page.getByRole('button', { name: 'Verify recovery with fresh sessions' }).click();
    await expect.poll(async () => (await recoveryAction(page)).state, { timeout: 60_000 }).toMatch(/^(recovery_failed|recovery_unknown|simulated_recovered|recovered)$/);
    const bare = await recoveryAction(page);
    expect(['recovery_failed', 'recovery_unknown']).toContain(bare.state);
    expect(bare.state).not.toBe('simulated_recovered');
    rec = bare;
  } finally {
    await mockControl('scenario', { targetWrongContent: false });
  }
  // 4) expected target AND control content -> simulated recovery
  await page.reload();
  await page.getByRole('button', { name: 'Verify recovery with fresh sessions' }).click();
  await expect(page.getByTestId('action-recovery').getByText(/SIMULATED recovery/).first()).toBeVisible({ timeout: 60_000 });
  rec = await recoveryAction(page);
  expect(rec.state).toBe('simulated_recovered');
  await page.screenshot({ path: `${SHOTS}/contract-test-simulated-recovered-1440.png`, fullPage: true });
});

test('contract_test export is marked non-evidence and carries no native verdicts', async ({ page }) => {
  await signInOk(page, CONTRACT);
  const b = await apiGet<any>(page, CONTRACT, `/api/export/${caseId}`);
  expect(b.provenance).toBe('contract_test');
  expect(b.limits.join(' ')).toMatch(/NOT NATIVE EVIDENCE/);
  const s = JSON.stringify(b);
  expect(s).not.toContain('"restriction_verified"');
});

test('status separates configuration checks (presence only) from native proof gates', async ({ page }) => {
  await signInOk(page, CONTRACT);
  await expect(page.getByText(/Configuration checks \(\d+ missing\)/)).toBeVisible();
  await expect(page.getByText(/Native proof gates/)).toBeVisible();
  await expect(page.locator('body')).not.toContainText(/\d+ of \d+ passed/);
  const st = await apiGet<any>(page, CONTRACT, '/api/status');
  expect(st.configChecks.length).toBeGreaterThan(0);
  for (const g of st.nativeGates) expect(g.status).not.toBe('passed');
});
