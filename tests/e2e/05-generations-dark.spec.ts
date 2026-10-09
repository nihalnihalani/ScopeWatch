/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, test } from '@playwright/test';
import { CONTRACT, REPLAY, SHOTS, apiGet, apiPost, mockControl, pageOverflow, signInOk, watch } from './support/helpers.js';

test('a not-ready generation (mock events endpoint 500) is listed as not admitted, creates no case and leaves the existing case untouched', async ({ page }) => {
  const w = watch(page);
  await signInOk(page, CONTRACT);
  const before = await apiGet<any[]>(page, CONTRACT, '/api/cases');
  const caseBefore = JSON.stringify(await apiGet<any>(page, CONTRACT, `/api/cases/${before[0].caseId}`));
  await mockControl('scenario', { eventsServerError: true });
  try {
    const r = await apiPost(page, CONTRACT, '/api/pipeline/run', {});
    expect(r.status(), await r.text()).toBe(200);
    const body = await r.json();
    expect(body.caseId).toBeNull();
    expect(body.readinessGaps).toBeGreaterThan(0);
    await page.reload();
    const panel = page.locator('section[aria-labelledby="gen-h"]');
    await expect(panel).toContainText('not admitted to a case');
    await expect(panel.getByText(/Not admitted: evidence not ready|Not admitted: integrity conflict/).first()).toBeVisible();
    await expect(panel).toContainText(body.generationId.slice(0, 12));
    await expect(panel.getByText(/Partial coverage|coverage/i).first()).toBeVisible();
    await page.screenshot({ path: `${SHOTS}/contract-test-generation-not-admitted-1440.png`, fullPage: true });
  } finally {
    await mockControl('scenario', { eventsServerError: false });
  }
  const after = await apiGet<any[]>(page, CONTRACT, '/api/cases');
  expect(after.length).toBe(before.length);
  expect(JSON.stringify(await apiGet<any>(page, CONTRACT, `/api/cases/${before[0].caseId}`))).toBe(caseBefore);
  expect(w.unexpected()).toEqual([]);
});

for (const [label, base] of [['replay', REPLAY], ['contract-test', CONTRACT]] as const) {
  test(`${label} dark mode at 1440px: no overflow, no console errors`, async ({ page }) => {
    const w = watch(page);
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await signInOk(page, base);
    await expect(page.getByRole('heading', { name: 'Subject versus control' })).toBeVisible();
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    const m = /rgba?\((\d+), (\d+), (\d+)/.exec(bg)!;
    expect(Number(m[1]) + Number(m[2]) + Number(m[3]), `body background ${bg} should be dark`).toBeLessThan(250);
    const o = await pageOverflow(page);
    expect(o.scrollWidth).toBeLessThanOrEqual(o.clientWidth);
    await page.screenshot({ path: `${SHOTS}/${label}-case-dark-1440.png`, fullPage: true });
    expect(w.unexpected()).toEqual([]);
  });
}
