import { expect, test } from '@playwright/test';
import { CONTRACT, REPLAY, SHOTS, VIEWPORTS, pageOverflow, signInOk, watch } from './support/helpers.js';

for (const [label, base] of [['replay', REPLAY], ['contract-test', CONTRACT]] as const) {
  for (const vp of VIEWPORTS) {
    test(`${label} case view at ${vp.name}px: no page-wide horizontal overflow, no console errors`, async ({ page }) => {
      const w = watch(page);
      const failed: string[] = [];
      page.on('requestfailed', (r) => failed.push(`${r.method()} ${r.url()} ${r.failure()?.errorText}`));
      page.on('response', (r) => { if (r.status() >= 500) failed.push(`${r.status()} ${r.url()}`); });
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await signInOk(page, base);
      await expect(page.getByRole('heading', { name: 'Subject versus control' })).toBeVisible();
      await page.waitForLoadState('networkidle');
      const o = await pageOverflow(page);
      expect(o.scrollWidth, `scrollWidth ${o.scrollWidth} > clientWidth ${o.clientWidth}`).toBeLessThanOrEqual(o.clientWidth);
      await page.screenshot({ path: `${SHOTS}/${label}-case-${vp.name}.png`, fullPage: true });
      expect(w.unexpected()).toEqual([]);
      expect(failed).toEqual([]);
    });
  }

  test(`${label} sign-in at 360px`, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 700 });
    await page.goto(`${base}/`);
    const o = await pageOverflow(page);
    expect(o.scrollWidth).toBeLessThanOrEqual(o.clientWidth);
    await page.screenshot({ path: `${SHOTS}/${label}-login-360.png` });
  });
}

test('contract-test handoff dialog at 360px does not overflow the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await signInOk(page, CONTRACT);
  const opener = page.getByRole('button', { name: 'Open native handoff and record receipt' });
  if (await opener.count()) {
    await opener.click();
    const o = await pageOverflow(page);
    expect(o.scrollWidth).toBeLessThanOrEqual(o.clientWidth);
    await page.screenshot({ path: `${SHOTS}/contract-test-handoff-dialog-360.png` });
  } else {
    test.info().annotations.push({ type: 'note', description: 'handoff opener not present in final state (simulated_recovered)' });
  }
});
