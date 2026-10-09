/**
 * Independent acceptance harness: REAL journal (temp SQLite file), REAL local ClickHouse, REAL Fastify app via inject.
 * contract_test uses the loopback CONTRACT-TEST MOCK Guild (labeled, not native evidence). No FakeGuildPort here.
 */
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import type { FastifyInstance } from 'fastify';
import { loadConfig } from '../../src/server/config.js';
import { parseEnvFile } from '../../src/server/services/envfile.js';
import { buildServices, closeServices } from '../../src/server/services/bootstrap.js';
import { buildApp } from '../../src/server/http/app.js';
import { launchScenario } from '../../src/server/services/scenario.js';
import type { Services } from '../../src/server/services/context.js';
import { startMockGuild } from '../support/mock-guild/server.js';

export const SECRET = 'adversarial-operator-secret-value-01';
export const ORIGIN = 'http://127.0.0.1:4317';
export const HOST = '127.0.0.1:4317';
export type Body = any; // eslint-disable-line @typescript-eslint/no-explicit-any

export interface Stack {
  app: FastifyInstance;
  svc: Services;
  mock: Awaited<ReturnType<typeof startMockGuild>> | null;
  cookie: string;
  csrf: string;
  secrets: string[];
  post: (url: string, payload: unknown, over?: Record<string, string | undefined>) => Promise<{ status: number; body: Body; text: string }>;
  get: (url: string, over?: Record<string, string | undefined>) => Promise<{ status: number; body: Body; text: string }>;
  close: () => Promise<void>;
}

export function chEnv(): Record<string, string> {
  return existsSync('runtime/clickhouse-local.env') ? parseEnvFile(readFileSync('runtime/clickhouse-local.env', 'utf8')) : {};
}

export async function startStack(mode: 'replay' | 'contract_test', opts: { launch?: boolean } = {}): Promise<Stack> {
  mkdirSync('runtime/e2e', { recursive: true });
  const sqlite = `${process.cwd()}/runtime/e2e/adv-${mode}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}.sqlite`;
  const base: Record<string, string> = { ...chEnv(), SCOPEWATCH_MODE: mode, SCOPEWATCH_OPERATOR_SECRET: SECRET, SCOPEWATCH_SQLITE_PATH: sqlite };
  let mock: Stack['mock'] = null;
  const secrets = [SECRET, ...Object.entries(chEnv()).filter(([k]) => /PASSWORD/.test(k)).map(([, v]) => v)];
  if (mode === 'contract_test') {
    mock = await startMockGuild({});
    const o = mock.options;
    const manifest = `${process.cwd()}/runtime/e2e/adv-manifest-${Date.now().toString(36)}.json`;
    writeFileSync(manifest, JSON.stringify({
      schema: 'scopewatch.manifest/v1', policyVersion: 'adv-v1', workspaceId: o.workspace.id, credentialId: o.credentialId, operation: o.operation,
      unit: 'native_allow_security_event_id', clock: 'mock.created_at', subjectIdDomain: 'mock_subject', identityDomain: 'workspace', windowSeconds: 600,
      effectiveFrom: '2020-01-01T00:00:00Z', effectiveUntil: null,
      allowances: [
        { policySubjectId: o.subjects.target, displayLabel: 'Mock target', maxUniqueAllowDecisions: '4', approvalRef: 'adv-approval-t' },
        { policySubjectId: o.subjects.control, displayLabel: 'Mock control', maxUniqueAllowDecisions: '100', approvalRef: 'adv-approval-c' },
      ],
    }));
    Object.assign(base, {
      GUILD_API_BASE_URL: mock.url, GUILD_TRIGGER_KEY: o.triggerKey, GUILD_COLLECTOR_KEY: o.collectorKey,
      GUILD_WORKSPACE_ID: o.workspace.id, GUILD_WORKSPACE_OWNER: o.workspace.owner, GUILD_WORKSPACE_NAME: o.workspace.name,
      GUILD_TARGET_AGENT_ID: o.agents.target, GUILD_CONTROL_AGENT_ID: o.agents.control, GUILD_INVESTIGATOR_AGENT_ID: o.agents.investigator,
      GUILD_TARGET_INSTALLED_AGENT_ID: o.installed.target, GUILD_CONTROL_INSTALLED_AGENT_ID: o.installed.control, GUILD_INVESTIGATOR_INSTALLED_AGENT_ID: o.installed.investigator,
      GUILD_VERIFIED_TARGET_POLICY_SUBJECT_ID: o.subjects.target, GUILD_VERIFIED_CONTROL_POLICY_SUBJECT_ID: o.subjects.control,
      GUILD_VERIFIED_CREDENTIAL_ID: o.credentialId, GUILD_VERIFIED_OPERATION: o.operation,
      OWNED_GITHUB_OWNER: o.ownedRepo.split('/')[0] as string, OWNED_GITHUB_REPO: o.ownedRepo.split('/')[1] as string,
      SCOPEWATCH_CONTROL_EXPECTED_MARKER: o.controlMarker, SCOPEWATCH_TARGET_EXPECTED_MARKER: o.targetMarker,
      GUILD_AGENT_SUBJECT_MAP: JSON.stringify({ [o.agents.target]: o.subjects.target, [o.agents.control]: o.subjects.control }),
      GUILD_IDENTITY_DOMAIN: 'workspace', GUILD_PROBE_TICKET_NUMBER: '1', PINNED_MANIFEST_PATH: manifest, PINNED_MANIFEST_REF: 'adv:manifest',
    });
    secrets.push(o.triggerKey, o.collectorKey, o.triggerKey.split(':')[1] as string, o.collectorKey.split(':')[1] as string, o.controlMarker, o.targetMarker);
  }
  const config = loadConfig(base as NodeJS.ProcessEnv);
  const svc = await buildServices(config);
  if (svc.chStatus.status !== 'ok') throw new Error(`ClickHouse required for acceptance tests but is ${svc.chStatus.status}: ${svc.chStatus.detail}. Run npm run ch:up && npm run ch:setup.`);
  if (mode === 'contract_test' && opts.launch !== false) {
    const r = await launchScenario(svc, { targetSessions: 5, controlSessions: 2 });
    if (r.unreconciled.length) throw new Error('scenario launch left unreconciled intents');
  }
  const app = await buildApp(config, svc);
  const login = await app.inject({ method: 'POST', url: '/api/login', headers: { host: HOST, origin: ORIGIN }, payload: { secret: SECRET } });
  if (login.statusCode !== 200) throw new Error(`login failed ${login.statusCode}`);
  const c = login.cookies[0] as { name: string; value: string };
  const cookie = `${c.name}=${c.value}`;
  const csrf = login.json().csrfToken as string;
  const stack: Stack = {
    app, svc, mock, cookie, csrf, secrets,
    post: async (url, payload, over = {}) => {
      const headers: Record<string, string> = { host: HOST, origin: ORIGIN, cookie, 'x-csrf-token': csrf };
      for (const [k, v] of Object.entries(over)) if (v === undefined) delete headers[k]; else headers[k] = v;
      const r = await app.inject({ method: 'POST', url, payload: payload as object, headers });
      return { status: r.statusCode, body: safeJson(r.body), text: r.body };
    },
    get: async (url, over = {}) => {
      const headers: Record<string, string> = { host: HOST, cookie };
      for (const [k, v] of Object.entries(over)) if (v === undefined) delete headers[k]; else headers[k] = v;
      const r = await app.inject({ method: 'GET', url, headers });
      return { status: r.statusCode, body: safeJson(r.body), text: r.body };
    },
    close: async () => {
      await app.close();
      await closeServices(svc);
      await mock?.close();
      for (const s of ['', '-wal', '-shm']) rmSync(`${sqlite}${s}`, { force: true });
    },
  };
  return stack;
}

function safeJson(t: string): Body {
  try {
    return JSON.parse(t);
  } catch {
    return null;
  }
}

/** Row counts of every table in a ClickHouse database via the evaluator lane credentials (SELECT-only). */
export async function chRowCounts(database: 'scopewatch' | 'scopewatch_replay' | 'scopewatch_contract'): Promise<Record<string, number>> {
  const { createClient } = await import('@clickhouse/client');
  const env = chEnv();
  const prefix = database === 'scopewatch' ? 'CLICKHOUSE' : database === 'scopewatch_replay' ? 'CLICKHOUSE_REPLAY' : 'CLICKHOUSE_CONTRACT';
  const client = createClient({ url: env.CLICKHOUSE_URL, username: env[`${prefix}_QUERY_USERNAME`], password: env[`${prefix}_QUERY_PASSWORD`], database });
  try {
    const t = await (await client.query({ query: `SELECT name FROM system.tables WHERE database = {db:String} ORDER BY name`, query_params: { db: database }, format: 'JSONEachRow' })).json<{ name: string }>();
    const out: Record<string, number> = {};
    for (const { name } of t) {
      const r = await (await client.query({ query: `SELECT toString(count()) AS n FROM \`${database}\`.\`${name}\``, format: 'JSONEachRow' })).json<{ n: string }>();
      out[name] = Number(r[0]?.n ?? 0);
    }
    return out;
  } finally {
    await client.close();
  }
}
