import { expect, test } from '@playwright/test';
import { CONTRACT, REPLAY, SECRET, signIn, watch } from './support/helpers.js';

for (const [label, base] of [['replay', REPLAY], ['contract-test', CONTRACT]] as const) {
  test.describe(`auth (${label})`, () => {
    test('unauthenticated API access is 401 and the page shows the sign-in form', async ({ page }) => {
      const w = watch(page);
      const r = await page.request.get(`${base}/api/cases`);
      expect(r.status()).toBe(401);
      await page.goto(`${base}/`);
      await expect(page.getByRole('heading', { name: 'Operator sign-in' })).toBeVisible();
      expect(w.unexpected([401])).toEqual([]);
    });

    test('wrong secret is rejected and shows an error; no session is created', async ({ page }) => {
      const w = watch(page);
      await signIn(page, base, 'definitely-wrong-secret-value');
      await expect(page.getByRole('heading', { name: 'Operator sign-in' })).toBeVisible();
      await expect(page.getByRole('alert').first()).toBeVisible();
      const s = await (await page.request.get(`${base}/api/session`)).json();
      expect(s.authenticated).toBe(false);
      expect((await page.request.get(`${base}/api/cases`)).status()).toBe(401);
      expect(w.unexpected([401])).toEqual([]);
    });

    test('correct secret signs in; the secret is not echoed in page text, storage or the session payload', async ({ page }) => {
      await signIn(page, base);
      await expect(page.getByRole('main', { name: 'Case workstation' })).toBeVisible();
      const html = await page.content();
      expect(html).not.toContain(SECRET);
      const storage = await page.evaluate(() => JSON.stringify({ l: { ...localStorage }, s: { ...sessionStorage } }));
      expect(storage).not.toContain(SECRET);
      const sess = await page.request.get(`${base}/api/session`);
      expect(await sess.text()).not.toContain(SECRET);
      const cookies = await page.context().cookies(base);
      const c = cookies.find((x) => x.name === `sw_session_${new URL(base).port}`);
      expect(c?.httpOnly).toBe(true);
      expect(c?.sameSite).toBe('Strict');
    });

    test('sign out returns to the sign-in form and API is 401 again', async ({ page }) => {
      await signIn(page, base);
      await page.getByRole('button', { name: 'Sign out' }).click();
      await expect(page.getByRole('heading', { name: 'Operator sign-in' })).toBeVisible();
      expect((await page.request.get(`${base}/api/cases`)).status()).toBe(401);
    });
  });
}
