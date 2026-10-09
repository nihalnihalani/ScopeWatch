/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Records the local ScopeWatch walkthrough video (replay + contract_test against the MOCK Guild) with caption banners.
 * Usage: npx tsx tools/demo-record.ts      (needs `npm run build`, local ClickHouse env in runtime/clickhouse-local.env)
 * Output: evidence/demo/scopewatch-local-demo.webm (+ .mp4 when ffmpeg exists) and evidence/demo/frame-*.png
 * Nothing here is native evidence: replay is synthetic data, contract_test is a loopback mock. Native status: NATIVE_PENDING.
 */
import { spawn, spawnSync, type ChildProcess } from 'node:child_process';
import { copyFileSync, mkdirSync, readFileSync, rmSync, statSync } from 'node:fs';
import { chromium, type Page } from '@playwright/test';

const PORT = Number(process.env.SCOPEWATCH_DEMO_PORT ?? 4617);
const REPLAY = `http://127.0.0.1:${PORT}`;
const CONTRACT = `http://localhost:${PORT + 1}`;
const MOCK = `http://127.0.0.1:${PORT + 2}`;
const SECRET = process.env.SCOPEWATCH_OPERATOR_SECRET || 'e2e-operator-secret-fixed-value-01';
const OUT = 'evidence/demo';
const TMP = 'runtime/demo/video';
const t0 = Date.now();
const log = (m: string) => console.log(`[demo ${((Date.now() - t0) / 1000).toFixed(1)}s] ${m}`);

/** tsx spawns a grandchild; kill the whole process group so no server (and its SQLite WAL handles) outlives the run. */
function killTree(c: ChildProcess): void {
  try { process.kill(-(c.pid as number), 'SIGTERM'); } catch { /* already gone */ }
}

async function startServer(): Promise<ChildProcess> {
  const child = spawn('node_modules/.bin/tsx', ['tools/demo-server.ts', String(PORT)], {
    env: { ...process.env, SCOPEWATCH_OPERATOR_SECRET: SECRET }, stdio: ['ignore', 'pipe', 'inherit'], detached: true,
  });
  child.stdout?.on('data', (d) => process.stdout.write(`  | ${d}`));
  for (let i = 0; i < 120; i++) {
    try {
      if ((await fetch(`${REPLAY}/api/health`)).ok && (await fetch(`${CONTRACT}/api/health`)).ok) return child;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 1000));
  }
  killTree(child);
  throw new Error('demo server did not become healthy');
}

async function mockControl(path: string): Promise<void> {
  const r = await fetch(`${MOCK}/__mock/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' });
  if (!r.ok) throw new Error(`mock ${path} -> ${r.status}`);
}

async function caption(page: Page, kind: 'replay' | 'mock' | 'note', text: string): Promise<void> {
  await page.evaluate(([k, t]) => {
    let el = document.getElementById('sw-demo-caption');
    if (!el) {
      el = document.createElement('div');
      el.id = 'sw-demo-caption';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:2147483647;max-width:1180px;width:calc(100% - 48px);'
        + 'padding:12px 18px;border-radius:10px;font:600 20px/1.35 system-ui,sans-serif;color:#fff;box-shadow:0 6px 24px rgba(0,0,0,.45);pointer-events:none;';
      document.body.appendChild(el);
    }
    const tag = k === 'replay' ? 'REPLAY - SYNTHETIC DATA, NOT NATIVE EVIDENCE' : k === 'mock' ? 'CONTRACT TEST - LOOPBACK MOCK GUILD, NOT NATIVE EVIDENCE' : 'ScopeWatch local demo - NATIVE_PENDING';
    el.style.background = k === 'replay' ? '#1d4e89' : k === 'mock' ? '#8a4b08' : '#333';
    el.innerHTML = `<div style="font:700 12px/1 system-ui;letter-spacing:.08em;opacity:.85;margin-bottom:6px">${tag}</div>${t}`;
  }, [kind, text] as const);
}
const hold = (page: Page, ms: number) => page.waitForTimeout(ms);
async function say(page: Page, kind: 'replay' | 'mock' | 'note', text: string, ms: number): Promise<void> {
  log(text.replace(/<[^>]+>/g, ''));
  await caption(page, kind, text);
  await hold(page, ms);
}
async function shot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${name}.png` });
}
async function signIn(page: Page, base: string): Promise<void> {
  await page.goto(`${base}/`);
  await page.locator('#login-secret').fill(SECRET);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.getByRole('main', { name: 'Case workstation' }).waitFor();
}
async function scrollTo(page: Page, sel: ReturnType<Page['locator']>): Promise<void> {
  await sel.first().scrollIntoViewIfNeeded();
  await sel.first().evaluate((e) => e.scrollIntoView({ block: 'center', behavior: 'smooth' }));
  await hold(page, 900);
}
async function apiJson(page: Page, base: string, path: string): Promise<any> {
  return (await page.request.get(`${base}${path}`)).json();
}
async function csrf(page: Page, base: string): Promise<string> {
  return ((await (await page.request.get(`${base}/api/session`)).json()) as any).csrfToken;
}

async function replayScenes(page: Page): Promise<void> {
  await signIn(page, REPLAY);
  await say(page, 'replay', 'Replay mode: a synthetic fixture (fictional HarborDesk). Provenance strip is visible; no cases yet.', 4500);
  await shot(page, 'frame-01-replay-empty');
  await say(page, 'replay', 'Run the replay pipeline: journal, seal, ClickHouse publish, exact readback, SQL for every anchor, independent oracle.', 3000);
  await page.getByRole('button', { name: 'Run replay pipeline' }).click();
  await page.getByRole('heading', { name: 'Subject versus control' }).waitFor({ timeout: 60_000 });
  const list = await apiJson(page, REPLAY, '/api/cases');
  const d = await apiJson(page, REPLAY, `/api/cases/${list[0].caseId}`);
  const key = (x: any) => `${x.workspaceId}|${x.policySubjectId}|${x.credentialId}|${x.operation}`;
  const p = d.candidates.find((c: any) => key(c) === key(d.primary));
  if (d.evaluation.primary && key(d.evaluation.primary) !== key(d.primary)) throw new Error('evaluation.primary differs from case primary');
  // control = the panel's "busiest other candidate" (read from the DOM), not an API-order guess; other candidates are named separately
  const ctlName = (await page.locator('[data-role="control"] .name').innerText()).trim();
  const ctl = d.candidates.find((c: any) => c.displayLabel === ctlName && key(c) !== key(d.primary));
  const rest = d.candidates.filter((c: any) => key(c) !== key(d.primary) && c !== ctl);
  await scrollTo(page, page.getByRole('heading', { name: 'Subject versus control' }));
  await say(page, 'replay', `Counts are read from the API (<code>/api/cases</code>), not hardcoded: ${p.displayLabel} peak ${p.peakCount} vs allowance ${p.allowance}; control (busiest other candidate, own allowance) ${ctl.displayLabel} peak ${ctl.peakCount} / allowance ${ctl.allowance}${rest.length ? `; also evaluated: ${rest.map((c: any) => `${c.displayLabel} peak ${c.peakCount}${c.peakCount === '0' ? ' (zero events)' : ''}`).join(', ')}` : ''}.`, 7000);
  await shot(page, 'frame-02-replay-comparison');
  await say(page, 'replay', `Historical anchor and current cutoff are evaluated separately: ${p.displayLabel} peak ${p.peakCount} at its historical anchor, current-cutoff count ${p.currentCount}. Counts are distinct permission-ALLOW identities in a (T-600s, T] window (synthetic here).`, 6500);
  const tl = page.locator('section[aria-labelledby="tl-h"]');
  await scrollTo(page, tl);
  await say(page, 'replay', 'Timeline: select a contributing session to inspect its bounded evidence.', 2500);
  await tl.locator('ul.btn-row button.tl-select').first().click();
  await page.getByTestId('inspector').waitFor();
  await say(page, 'replay', 'Session inspector: binding method and source class (replay). Evidence is per session, not inferred from a display name.', 5500);
  await shot(page, 'frame-03-replay-inspector');
  await page.keyboard.press('Escape');
  const q = await apiJson(page, REPLAY, `/api/cases/${list[0].caseId}/queries`);
  const timing = page.getByTestId('timing-label');
  await scrollTo(page, timing);
  await say(page, 'replay', `Executed-query receipts: ${q.length} real ClickHouse executions (query ID, SQL sha256, server version). Timing is a replay measurement on a synthetic fixture.`, 6500);
  await page.getByText(`All ${q.length} executed receipts`).click();
  await hold(page, 3500);
  await shot(page, 'frame-04-replay-receipts');
  await scrollTo(page, page.getByText('Independent oracle agrees'));
  await say(page, 'replay', 'An independent oracle recomputes the counts and agrees with the SQL result. It checks the SQL, not the application.', 4500);
  const btn = page.locator('#open-review');
  await scrollTo(page, btn);
  await say(page, 'replay', 'Review is blocked for replay with a visible reason: replay provenance is not action eligible. The API refuses too (409 not_eligible).', 6000);
  await shot(page, 'frame-05-replay-review-blocked');
  const token = await csrf(page, REPLAY);
  const r = await page.request.post(`${REPLAY}/api/cases/${list[0].caseId}/review`, { data: { expectedRevision: list[0].revision, decision: 'approve', reason: 'demo: attempt to approve a replay case' }, headers: { origin: REPLAY, 'x-csrf-token': token, 'content-type': 'application/json' } });
  log(`replay review attempt -> HTTP ${r.status()} ${(await r.json() as any).code}`);
  const exp = page.getByRole('link', { name: 'Download sanitized JSON' });
  await scrollTo(page, exp);
  await say(page, 'replay', 'Sanitized export: no secrets, and it states its own limits ("NOT NATIVE EVIDENCE").', 3000);
  const [dl] = await Promise.all([page.waitForEvent('download'), exp.click()]);
  const body = JSON.parse(readFileSync((await dl.path()) as string, 'utf8'));
  log(`export provenance=${body.provenance}`);
  await page.getByRole('button', { name: 'Show limits and source classes' }).click();
  await hold(page, 800);
  await scrollTo(page, page.getByRole('heading', { name: 'What this bundle does not prove' }));
  await say(page, 'replay', 'What this bundle does not prove: listed in the product itself. Replay is a labeled measurement, never native proof.', 5000);
  await shot(page, 'frame-06-replay-limits');
}

async function fillReceipt(page: Page, s: any): Promise<void> {
  await page.locator('#nr-ws').fill(s.workspaceId);
  await page.locator('#nr-sub').fill(s.policySubjectId);
  await page.locator('#nr-cred').fill(s.credentialId);
  await page.locator('#nr-op').fill(s.operation);
  await page.locator('#nr-dec').fill(s.decision);
  await page.locator('#nr-at').fill(new Date().toISOString());
  await page.locator('#nr-note').fill('demo: exact scope as simulated in the mock (not a real Guild rule)');
}

async function contractScenes(page: Page): Promise<void> {
  await mockControl('undeny');
  await signIn(page, CONTRACT);
  await say(page, 'mock', 'Switching to contract_test mode: the real Guild adapter talks to a loopback MOCK Guild API. Every positive outcome here is simulated.', 5000);
  await page.getByRole('button', { name: 'Collect registered cohort and evaluate' }).click();
  await page.getByRole('heading', { name: 'Subject versus control' }).waitFor({ timeout: 60_000 });
  const list = await apiJson(page, CONTRACT, '/api/cases');
  const caseId = list[0].caseId;
  const d = await apiJson(page, CONTRACT, `/api/cases/${caseId}`);
  const pc = d.candidates.find((c: any) => c.policySubjectId === d.primary.policySubjectId);
  await say(page, 'mock', `Collected the registered mock cohort, bound events to subjects, evaluated in ClickHouse: ${pc.displayLabel} peak ${pc.peakCount} vs allowance ${pc.allowance}. Provenance: contract_test.`, 5500);
  await shot(page, 'frame-07-contract-case');
  await page.locator('#open-review').click();
  const dlg = page.getByRole('dialog');
  await dlg.waitFor();
  await say(page, 'mock', 'Review dialog: SIMULATED labels, bound to the exact case revision and scope (workspace, subject, credential, operation). Nothing here changes a real Guild policy.', 7000);
  await shot(page, 'frame-08-contract-review');
  await page.locator('#rv-reason').fill('demo: approve exact scope on the contract_test case');
  await page.locator('#rv-approve').click();
  await dlg.getByRole('heading', { name: 'Native handoff' }).waitFor();
  await say(page, 'mock', 'Approved the exact scope. The application never applies policy: it hands off to a human in the Guild UI and only records a receipt.', 5500);
  await shot(page, 'frame-09-contract-handoff');
  const s = (await apiJson(page, CONTRACT, `/api/cases/${caseId}`)).proposedScope;
  await say(page, 'mock', 'Recording a receipt for the exact approved scope (operator-typed, as if read from the Guild UI). The mock stands in for the rule.', 3500);
  await fillReceipt(page, s);
  await page.getByRole('button', { name: 'Record native receipt' }).click();
  await page.getByTestId('action-restriction').getByText('Recorded rule matches the approved scope').waitFor();
  await say(page, 'mock', 'Receipt matches the approved scope: state is "native application observed", still UNVERIFIED. A wrong scope would be flagged scope_mismatch.', 5500);
  await page.keyboard.press('Escape');
  const verify = page.getByRole('button', { name: 'Verify restriction with fresh sessions' });
  await scrollTo(page, verify);
  await say(page, 'mock', 'Failure case first: no deny has been applied in the mock. Verifying with fresh target and control sessions...', 3500);
  await verify.click();
  await page.getByTestId('verification').first().waitFor({ timeout: 60_000 });
  await page.getByText(/Target not refused by policy/).first().waitFor();
  await hold(page, 800);
  await scrollTo(page, page.getByText(/Target not refused by policy/).last());
  await say(page, 'mock', 'Verification FAILED: the target was not refused, so the restriction is never reported as verified. Honest failure is a first-class state.', 7000);
  await shot(page, 'frame-10-contract-restriction-failed');
  await say(page, 'mock', 'Now simulating the human Guild UI step - MOCK: a DENY for the target subject is applied inside the loopback mock, not through the application.', 5000);
  await mockControl('deny');
  await say(page, 'mock', 'Verify again with fresh target and control sessions (the mock now refuses the target).', 2500);
  await page.getByRole('button', { name: 'Verify restriction with fresh sessions' }).click();
  const restriction = async () => [...(await apiJson(page, CONTRACT, `/api/cases/${caseId}`)).actions].reverse().find((a: any) => a.kind === 'restriction');
  for (let i = 0; i < 60 && (await restriction()).state === 'verification_pending'; i++) await hold(page, 1000);
  await page.getByTestId('action-restriction').getByText(/Simulated/).first().waitFor({ timeout: 60_000 });
  const act = [...(await apiJson(page, CONTRACT, `/api/cases/${caseId}`)).actions].reverse().find((a: any) => a.kind === 'restriction');
  const v = act.verifications[act.verifications.length - 1];
  log(`state=${act.state} verdict=${v.verdict} target=${v.target.outcome} control=${v.control.outcome}`);
  await scrollTo(page, page.getByText('SIMULATED: produced against non-native data', { exact: false }).last());
  await say(page, 'mock', `Result: <b>${act.state}</b> (target ${v.target.outcome}, control ${v.control.outcome}). Labeled SIMULATED; the only verdict possible here is simulated_*. Not a native verification.`, 8000);
  await shot(page, 'frame-11-contract-simulated-restriction');
  await say(page, 'note', 'Done. Native Guild/ClickHouse Cloud loop: NATIVE_PENDING. See docs/BUILD_STATUS.md and docs/native/NATIVE_PROOF_LEDGER.md.', 5000);
}

async function main(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  rmSync(TMP, { recursive: true, force: true });
  const server = await startServer();
  let exitCode = 0;
  try {
    const browser = await chromium.launch();
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, recordVideo: { dir: TMP, size: { width: 1440, height: 900 } }, acceptDownloads: true });
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await replayScenes(page);
    await contractScenes(page);
    if (errors.length) log(`PAGE ERRORS: ${errors.join(' | ')}`);
    const video = page.video();
    await ctx.close();
    await browser.close();
    copyFileSync((await video!.path()), `${OUT}/scopewatch-local-demo.webm`);
  } catch (e) {
    exitCode = 1;
    console.error(e);
  } finally {
    killTree(server);
    await new Promise((r) => setTimeout(r, 2000));
  }
  if (exitCode) process.exit(exitCode);
  const webm = `${OUT}/scopewatch-local-demo.webm`;
  const ff = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '28', '-movflags', '+faststart', `${OUT}/scopewatch-local-demo.mp4`]);
  log(`ffmpeg mp4 exit ${ff.status}`);
  log(`webm ${statSync(webm).size} bytes`);
}
void main();
