/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect, type APIResponse, type Page } from '@playwright/test';
import { E2E_SECRET } from './constants.js';

export const PORT = Number(process.env.SCOPEWATCH_E2E_PORT ?? 4417);
/** Replay instance uses 127.0.0.1; contract_test uses `localhost` so the two session cookies (not port-scoped) never collide. */
export const REPLAY = `http://127.0.0.1:${PORT}`;
export const CONTRACT = `http://localhost:${PORT + 1}`;
export const MOCK = `http://127.0.0.1:${PORT + 2}`;
export const SECRET = process.env.SCOPEWATCH_OPERATOR_SECRET || E2E_SECRET;

export interface Watch {
  errors: string[];
  unexpected: (allowStatuses?: number[]) => string[];
}

/** Collect console errors / page errors. Browser "Failed to load resource" lines for explicitly expected statuses are filtered. */
export function watch(page: Page): Watch {
  const errors: string[] = [];
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(m.text());
  });
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  return {
    errors,
    unexpected: (allow = []) =>
      errors.filter((e) => {
        const m = /Failed to load resource: the server responded with a status of (\d+)/.exec(e);
        return !(m && allow.includes(Number(m[1])));
      }),
  };
}

export async function signIn(page: Page, base: string, secret = SECRET): Promise<void> {
  await page.goto(`${base}/`);
  await page.locator('#login-secret').fill(secret);
  await page.getByRole('button', { name: 'Sign in' }).click();
}

export async function signInOk(page: Page, base: string): Promise<void> {
  await signIn(page, base);
  await expect(page.getByRole('main', { name: 'Case workstation' })).toBeVisible();
}

export async function csrf(page: Page, base: string): Promise<string> {
  const r = await page.request.get(`${base}/api/session`);
  const s = (await r.json()) as { csrfToken: string | null };
  if (!s.csrfToken) throw new Error('not signed in');
  return s.csrfToken;
}

export async function apiGet<T = any>(page: Page, base: string, path: string): Promise<T> {
  const r = await page.request.get(`${base}${path}`);
  expect(r.status(), `GET ${path}`).toBe(200);
  return (await r.json()) as T;
}

export async function apiPost(page: Page, base: string, path: string, body: unknown): Promise<APIResponse> {
  const token = await csrf(page, base);
  return page.request.post(`${base}${path}`, { data: body, headers: { origin: base, 'x-csrf-token': token, 'content-type': 'application/json' } });
}

export async function mockControl(path: string, body: unknown = {}): Promise<any> {
  const r = await fetch(`${MOCK}/__mock/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  if (!r.ok) throw new Error(`mock ${path} -> ${r.status}`);
  return r.json();
}

export const VIEWPORTS = [
  { name: '360', width: 360, height: 800 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
] as const;

export async function pageOverflow(page: Page): Promise<{ scrollWidth: number; clientWidth: number }> {
  return page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
}

export const SHOTS = 'evidence/screenshots';

/** Advance the MOCK Guild's virtual clock (harness side channel on port+3) so fresh probes start after real-time receipts. */
export async function tickMock(ms = 3 * 3600_000): Promise<void> {
  const r = await fetch(`http://127.0.0.1:${PORT + 3}/tick?ms=${ms}`);
  if (!r.ok) throw new Error(`tick failed ${r.status}`);
}
