/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { SHOTS, REPLAY, apiGet, apiPost, signInOk, watch } from './support/helpers.js';

test.describe.configure({ mode: 'serial' });

test.describe('replay mode against the real local backend', () => {
  test('empty state, then replay pipeline run builds a labeled replay case', async ({ page }) => {
    const w = watch(page);
    await signInOk(page, REPLAY);
    const strip = page.getByRole('region', { name: 'Provenance' });
    await expect(strip).toHaveAttribute('data-provenance', 'replay');
    await expect(strip).toContainText(/synthetic|replay|not native/i);
    await expect(page.getByRole('heading', { name: 'No cases yet' })).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/replay-empty-1440.png`, fullPage: true });
    await page.getByRole('button', { name: 'Run replay pipeline' }).click();
    await expect(page.getByRole('heading', { name: 'Subject versus control' })).toBeVisible({ timeout: 30_000 });
    expect(w.unexpected()).toEqual([]);
  });

  test('query-selected subject vs control show the API counts (not hardcoded)', async ({ page }) => {
    const w = watch(page);
    await signInOk(page, REPLAY);
    const list = await apiGet<any[]>(page, REPLAY, '/api/cases');
    expect(list.length).toBeGreaterThan(0);
    const d = await apiGet<any>(page, REPLAY, `/api/cases/${list[0].caseId}`);
    const key = (x: any) => `${x.workspaceId}|${x.policySubjectId}|${x.credentialId}|${x.operation}`;
    const primary = d.candidates.find((c: any) => key(c) === key(d.primary));
    expect(primary).toBeTruthy();
    // the primary must be the candidate the SQL evaluation selected, and the oracle must agree
    expect(d.evaluation.oracleAgrees).toBe(true);
    expect(d.evaluation.primary ? key(d.evaluation.primary) : key(d.primary)).toBe(key(d.primary));
    expect(BigInt(primary.peakCount)).toBeGreaterThan(BigInt(primary.allowance));
    const card = page.locator('[data-role="primary"]');
    await expect(card).toContainText(primary.displayLabel);
    await expect(page.getByTestId('primary-allowance')).toHaveText(primary.allowance);
    await expect(page.getByTestId('primary-peak')).toHaveText(primary.peakCount);
    await expect(page.getByTestId('primary-current')).toHaveText(primary.currentCount);
    const ctl = page.locator('[data-role="control"]');
    await expect(ctl).toBeVisible();
    const others = d.candidates.filter((c: any) => key(c) !== key(d.primary));
    const ctlPeak = await page.getByTestId('control-peak').innerText();
    expect(others.map((o: any) => o.peakCount)).toContain(ctlPeak);
    const ctlName = await ctl.locator('.name').innerText();
    expect(others.map((o: any) => o.displayLabel)).toContain(ctlName);
    // control is its own allowance subject, not the primary
    expect(ctlName).not.toBe(primary.displayLabel);
    await page.screenshot({ path: `${SHOTS}/replay-case-1440.png`, fullPage: true });
    expect(w.unexpected()).toEqual([]);
  });

  test('timeline session inspector opens bounded evidence for a contributing session', async ({ page }) => {
    await signInOk(page, REPLAY);
    const first = page.locator('section[aria-labelledby="tl-h"] ul.btn-row button.tl-select').first();
    await first.scrollIntoViewIfNeeded();
    const sid = (await first.locator('.id').innerText()).trim();
    await first.click();
    const insp = page.getByTestId('inspector');
    await expect(insp).toBeVisible();
    await expect(insp).toContainText(sid);
    await expect(insp).toContainText('Binding method');
    await expect(insp).toContainText(/replay/);
    await page.screenshot({ path: `${SHOTS}/replay-inspector-1440.png`, fullPage: true });
  });

  test('query receipts match the API receipts and are labeled as replay measurements', async ({ page }) => {
    await signInOk(page, REPLAY);
    const list = await apiGet<any[]>(page, REPLAY, '/api/cases');
    const d = await apiGet<any>(page, REPLAY, `/api/cases/${list[0].caseId}`);
    const q = await apiGet<any[]>(page, REPLAY, `/api/cases/${list[0].caseId}/queries`);
    expect(q.length).toBe(d.evaluation.queries.length);
    expect(q.length).toBeGreaterThan(1);
    await expect(page.getByText(`${q.length} receipts`, { exact: true })).toBeVisible();
    // per-class grouping must match the API receipts
    const byClass = new Map<string, number>();
    for (const r of q) byClass.set(r.queryClass, (byClass.get(r.queryClass) ?? 0) + 1);
    for (const [cls, n] of byClass) {
      const rows = q.filter((r: any) => r.queryClass === cls).reduce((a: number, r: any) => a + r.rowCount, 0);
      const row = page.getByTestId(`qclass-${cls}`);
      await expect(row).toContainText(cls);
      await expect(row.locator('[data-col="receipts"]')).toHaveText(String(n));
      await expect(row.locator('[data-col="rows"]')).toHaveText(String(rows));
    }
    await expect(page.getByTestId('timing-label')).toContainText('replay measurement on a synthetic fixture');
    await page.getByText(`All ${q.length} executed receipts`).click();
    const box = page.getByRole('region', { name: 'All query receipts, scrollable' });
    for (const r of [q[0], q[Math.floor(q.length / 2)], q[q.length - 1]]) await expect(box).toContainText(r.queryId);
    // every receipt names a server and a sha256 of the executed SQL
    for (const r of q) {
      expect(r.sqlSha256).toMatch(/^[0-9a-f]{64}$/);
      expect(r.target).toBeTruthy();
      expect(r.serverVersion).toBeTruthy();
    }
    await expect(page.getByText('Independent oracle agrees')).toBeVisible();
  });

  test('review is blocked for replay with a visible reason; API refuses too', async ({ page }) => {
    await signInOk(page, REPLAY);
    const btn = page.locator('#open-review');
    await expect(btn).toHaveAttribute('aria-disabled', 'true');
    await expect(page.locator('#open-review-why')).toContainText(/Replay provenance is not action eligible/);
    await btn.click({ force: true });
    await expect(page.getByRole('dialog')).toHaveCount(0);
    const list = await apiGet<any[]>(page, REPLAY, '/api/cases');
    const r = await apiPost(page, REPLAY, `/api/cases/${list[0].caseId}/review`, { expectedRevision: list[0].revision, decision: 'approve', reason: 'e2e: attempt to approve a replay case' });
    expect(r.status()).toBe(409);
    expect((await r.json()).code).toBe('not_eligible');
  });

  test('export downloads sanitized JSON that states it is non-evidence', async ({ page }) => {
    await signInOk(page, REPLAY);
    const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Download sanitized JSON' }).click()]);
    const p = await dl.path();
    const body = JSON.parse(readFileSync(p, 'utf8'));
    expect(body.provenance).toBe('replay');
    expect(body.limits.join(' ')).toContain('NOT NATIVE EVIDENCE');
    expect(body.limits.join(' ')).toMatch(/finite registered cohort/);
    expect(body.sourceClasses.events_and_bindings).toBe('replay');
    await page.getByRole('button', { name: 'Show limits and source classes' }).click();
    await expect(page.getByRole('heading', { name: 'What this bundle does not prove' })).toBeVisible();
  });
});
