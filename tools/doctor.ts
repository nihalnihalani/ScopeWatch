/**
 * `npm run doctor` — reports configuration presence and dependency reachability.
 * Never prints secret values. Exit code: 0 when the selected mode's local prerequisites are usable,
 * 1 when a required local prerequisite is missing. Native gates are reported, not counted as passing.
 */
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { ConfigError, describeConfig, loadConfig, missingGuildSettings } from '../src/server/config.js';

type Line = { item: string; status: 'ok' | 'missing' | 'unavailable' | 'pending' | 'info'; detail: string };

async function chPing(url: string): Promise<string> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 3000);
  try {
    const r = await fetch(new URL('/ping', url), { signal: ctrl.signal });
    return r.ok ? 'ok' : `http ${r.status}`;
  } catch (e) {
    return `unreachable (${(e as Error).name})`;
  } finally {
    clearTimeout(t);
  }
}

function guildCliStatus(): string {
  try {
    const out = execFileSync('sh', ['-c', 'guild auth status 2>&1'], { encoding: 'utf8', timeout: 8000 });
    return out.split('\n').find((l) => l.trim())?.trim() ?? 'no output';
  } catch (e) {
    const err = e as { stdout?: string; code?: string };
    if (err.code === 'ENOENT') return 'guild CLI not installed';
    return (err.stdout ?? '').split('\n').find((l) => l.trim())?.trim() ?? 'not authenticated';
  }
}

async function main(): Promise<number> {
  const lines: Line[] = [];
  let cfg;
  try {
    cfg = loadConfig();
  } catch (e) {
    if (e instanceof ConfigError) {
      console.log(`CONFIG ERROR: ${e.message}`);
      return 1;
    }
    throw e;
  }
  const d = describeConfig(cfg);
  for (const [k, v] of Object.entries(d)) lines.push({ item: `config.${k}`, status: 'info', detail: v });

  lines.push({ item: 'node', status: 'info', detail: process.version });
  lines.push({ item: 'client build', status: existsSync('dist/client/index.html') ? 'ok' : 'missing', detail: 'dist/client (run npm run build)' });

  let localFail = false;
  if (!cfg.clickhouse) {
    lines.push({ item: 'clickhouse', status: 'missing', detail: 'CLICKHOUSE_URL + per-mode ingest/query users not configured (see runtime/clickhouse-local.env after npm run ch:setup)' });
    localFail = true;
  } else {
    const ping = await chPing(cfg.clickhouse.url);
    lines.push({ item: 'clickhouse', status: ping === 'ok' ? 'ok' : 'unavailable', detail: `${cfg.clickhouse.target} db=${cfg.clickhouse.database} ping=${ping}` });
    if (ping !== 'ok') localFail = true;
  }

  const missing = missingGuildSettings(cfg.guild);
  if (cfg.mode === 'native') {
    lines.push({ item: 'guild settings', status: missing.length ? 'missing' : 'ok', detail: missing.length ? `missing: ${missing.join(', ')}` : 'all present (values not shown)' });
    if (missing.length) localFail = true;
  } else {
    lines.push({ item: 'guild settings', status: 'info', detail: `${cfg.mode} mode does not use native Guild credentials` });
  }
  lines.push({ item: 'guild CLI auth', status: 'info', detail: guildCliStatus() });
  lines.push({ item: 'native gates G1/G1b/G2', status: 'pending', detail: 'require real Guild account proof; see docs/native/NATIVE_PROOF_LEDGER.md' });

  const w = Math.max(...lines.map((l) => l.item.length));
  for (const l of lines) console.log(`${l.item.padEnd(w)}  ${l.status.toUpperCase().padEnd(11)} ${l.detail}`);
  console.log(localFail ? '\nRESULT: local prerequisites missing for this mode' : '\nRESULT: local prerequisites present for this mode');
  return localFail ? 1 : 0;
}

main().then((c) => process.exit(c), (e) => { console.error(e); process.exit(2); });
