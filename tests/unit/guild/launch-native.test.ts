/**
 * Launch path against SANITIZED native responses captured 2026-10-09 (account charliegillet). The fetch
 * stub replays the captured bodies; no real Guild API is called. These pin the observed native contract:
 * agent_id is the agent DEFINITION id, an installed id is a definite 400 failure, and
 * session.trigger.agent (the trigger's default agent) is never recorded as the agent that ran.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ConfigError, launchRefWarnings, loadConfig, missingGuildSettings, type AppConfig } from '../../../src/server/config.js';
import { GuildHttp } from '../../../src/integrations/guild/http.js';
import { isAgentNotFoundRejection, launchAgentFor, Launcher } from '../../../src/integrations/guild/launcher.js';
import { missingSettings } from '../../../src/integrations/guild/index.js';

const FIX = join(__dirname, 'fixtures', 'native-2026-10-09-charliegillet');
const load = <T>(f: string): T => JSON.parse(readFileSync(join(FIX, f), 'utf8')) as T;

interface AgentFx { id: string; name: string; version_id?: string | null }
interface SessionFx {
  id: string;
  root_task: { id: string } & Record<string, unknown>;
  trigger: { agent: AgentFx; workspace_agent: { id: string } };
  workspace: { id: string };
  [k: string]: unknown;
}

const targetLaunch = load<SessionFx>('target-launch.json');
const controlSession = load<SessionFx>('control-session.json');
const rejected = load<{ http_status: number; body: { error: string; message: string } }>('launch-rejected-installed-id.json');
const controlTasks = load<{ items: Array<{ id: string; agent?: AgentFx }> }>('control-tasks.json');

// Ids as observed in the fixtures. The installed id is the one native rejected.
const INSTALLED_ID = targetLaunch.trigger.workspace_agent.id;
const TRIGGER_DEFAULT_AGENT = targetLaunch.trigger.agent.id;
const TARGET_DEF = TRIGGER_DEFAULT_AGENT; // the target profile is TicketAssist, the trigger default
const controlRoot = controlTasks.items.find((t) => t.id === controlSession.root_task.id)!;
const CONTROL_DEF = controlRoot.agent!.id;

const BASE_ENV = {
  SCOPEWATCH_MODE: 'native',
  SCOPEWATCH_OPERATOR_SECRET: 'x'.repeat(24),
  GUILD_API_BASE_URL: 'https://api.guild.ai',
  GUILD_TRIGGER_KEY: 'trig-id:trig-secret',
  GUILD_COLLECTOR_KEY: 'coll-id:coll-secret',
  GUILD_WORKSPACE_ID: targetLaunch.workspace.id,
  GUILD_WORKSPACE_OWNER: 'charliegillet',
  GUILD_WORKSPACE_NAME: 'scopewatch',
};

function cfg(extra: Record<string, string> = {}): AppConfig {
  return loadConfig({ ...BASE_ENV, ...extra } as NodeJS.ProcessEnv);
}

interface Sent {
  method: string;
  url: string;
  body: Record<string, unknown> | null;
}

function launcherWith(config: AppConfig, respond: (s: Sent) => { status: number; body: unknown }) {
  const sent: Sent[] = [];
  const fetchImpl = (async (input: URL | string, init?: RequestInit) => {
    const s: Sent = { method: init?.method ?? 'GET', url: String(input), body: init?.body ? (JSON.parse(String(init.body)) as Record<string, unknown>) : null };
    sent.push(s);
    const r = respond(s);
    return new Response(JSON.stringify(r.body), { status: r.status, headers: { 'content-type': 'application/json' } });
  }) as typeof fetch;
  const http = new GuildHttp({ baseUrl: config.guild.baseUrl, secrets: [config.guild.triggerKey, config.guild.collectorKey], fetchImpl, getRetries: 0, backoffMs: 1 });
  const launcher = new Launcher({ config, provenance: 'native', http, now: () => new Date('2026-10-09T22:15:16Z'), pollMs: 1 });
  return { launcher, sent };
}

describe('native launch config (GUILD_*_AGENT_ID)', () => {
  it('parses the launch agent refs separately from informational installed ids', () => {
    const c = cfg({
      GUILD_TARGET_AGENT_ID: TARGET_DEF,
      GUILD_CONTROL_AGENT_ID: 'charliegillet~scopewatch-releasereview',
      GUILD_INVESTIGATOR_AGENT_ID: 'charliegillet~scopewatch-investigator',
      GUILD_TARGET_INSTALLED_AGENT_ID: INSTALLED_ID,
    });
    expect(c.guild).toMatchObject({
      targetAgentId: TARGET_DEF,
      controlAgentId: 'charliegillet~scopewatch-releasereview',
      investigatorAgentId: 'charliegillet~scopewatch-investigator',
      targetInstalledAgentId: INSTALLED_ID,
      controlInstalledAgentId: null,
    });
    expect(launchAgentFor(c, 'target')).toBe(TARGET_DEF);
    expect(launchAgentFor(c, 'investigator')).toBe('charliegillet~scopewatch-investigator');
  });

  it('native missing-prerequisite lists require launch refs, not installed ids', () => {
    const c = cfg({ GUILD_TARGET_INSTALLED_AGENT_ID: INSTALLED_ID, GUILD_CONTROL_INSTALLED_AGENT_ID: INSTALLED_ID, GUILD_INVESTIGATOR_INSTALLED_AGENT_ID: INSTALLED_ID });
    for (const list of [missingGuildSettings(c.guild), missingSettings(c)]) {
      expect(list).toEqual(expect.arrayContaining(['GUILD_TARGET_AGENT_ID', 'GUILD_CONTROL_AGENT_ID', 'GUILD_INVESTIGATOR_AGENT_ID']));
      expect(list.some((n) => n.includes('INSTALLED'))).toBe(false);
    }
    const ok = cfg({ GUILD_TARGET_AGENT_ID: TARGET_DEF, GUILD_CONTROL_AGENT_ID: CONTROL_DEF, GUILD_INVESTIGATOR_AGENT_ID: 'o~inv' });
    expect(missingSettings(ok).filter((n) => n.includes('AGENT_ID'))).toEqual([]);
  });

  it('flags a launch ref that equals a configured installed id (the observed native rejection)', () => {
    const c = cfg({ GUILD_TARGET_AGENT_ID: INSTALLED_ID, GUILD_TARGET_INSTALLED_AGENT_ID: INSTALLED_ID, GUILD_CONTROL_AGENT_ID: CONTROL_DEF });
    const w = launchRefWarnings(c.guild);
    expect(w).toHaveLength(1);
    expect(w[0]).toContain('GUILD_TARGET_AGENT_ID');
    expect(w[0]).not.toContain(INSTALLED_ID);
  });

  it('native mode still refuses non-Guild hosts', () => {
    expect(() => cfg({ GUILD_API_BASE_URL: 'http://127.0.0.1:1' })).toThrow(ConfigError);
  });
});

describe('native launch (fixture replay)', () => {
  it('sends the agent DEFINITION id as agent_id, never the installed id, and does not adopt trigger.agent', async () => {
    const c = cfg({ GUILD_TARGET_AGENT_ID: TARGET_DEF, GUILD_TARGET_INSTALLED_AGENT_ID: INSTALLED_ID });
    const { launcher, sent } = launcherWith(c, () => ({ status: 200, body: targetLaunch }));
    const r = await launcher.launch('target', 'read ticket', 'ref-native-1');

    expect(sent).toHaveLength(1);
    expect(sent[0]!.method).toBe('POST');
    expect(new URL(sent[0]!.url).pathname).toBe('/v1/workspaces/charliegillet/scopewatch/sessions');
    expect(sent[0]!.body).toMatchObject({ session_type: 'api_trigger', agent_id: TARGET_DEF });
    expect(JSON.stringify(sent[0]!.body)).not.toContain(INSTALLED_ID);

    expect(r).toMatchObject({
      outcome: 'created',
      nativeSessionId: targetLaunch.id,
      nativeRootTaskId: targetLaunch.root_task.id,
      workspaceId: targetLaunch.workspace.id,
      requestedAgentRef: TARGET_DEF,
      requestedInstalledAgentId: INSTALLED_ID,
      sessionType: 'api',
      error: null,
    });
    // trigger.agent is the trigger's default agent: never recorded as the agent that ran.
    expect(r.returnedAgentRef).toBeNull();
    expect(r.returnedVersionId).toBeNull();
  });

  it('control session: trigger.agent names TicketAssist while the root task ran ReleaseReview; receipt stays null', async () => {
    expect(TRIGGER_DEFAULT_AGENT).not.toBe(CONTROL_DEF);
    expect(controlRoot.agent!.name).toBe('scopewatch-releasereview');
    expect(controlSession.trigger.agent.name).toBe('scopewatch-ticketassist');

    const c = cfg({ GUILD_CONTROL_AGENT_ID: CONTROL_DEF });
    const { launcher, sent } = launcherWith(c, () => ({ status: 200, body: controlSession }));
    const r = await launcher.launch('control', 'read ticket', 'ref-native-2');
    expect(sent[0]!.body).toMatchObject({ agent_id: CONTROL_DEF });
    expect(r.outcome).toBe('created');
    expect(r.returnedAgentRef).not.toBe(TRIGGER_DEFAULT_AGENT);
    expect(r.returnedAgentRef).toBeNull();
    expect(r.requestedInstalledAgentId).toBe('');
  });

  it('records a root-task agent only when the returned record names it on the root task', async () => {
    const c = cfg({ GUILD_CONTROL_AGENT_ID: CONTROL_DEF });
    const body = { ...controlSession, root_task: { ...controlSession.root_task, agent: { id: CONTROL_DEF, version_id: 'ver-x' } } };
    const { launcher } = launcherWith(c, () => ({ status: 200, body }));
    const r = await launcher.launch('control', 'read ticket', 'ref-native-3');
    expect(r).toMatchObject({ returnedAgentRef: CONTROL_DEF, returnedVersionId: 'ver-x' });
  });

  it('a 400 "Agent ... not found" (installed id sent) is a definite failure, not unknown, and is not retried', async () => {
    const c = cfg({ GUILD_TARGET_AGENT_ID: INSTALLED_ID });
    const { launcher, sent } = launcherWith(c, () => ({ status: rejected.http_status, body: rejected.body }));
    const r = await launcher.launch('target', 'read ticket', 'ref-native-4');
    expect(sent).toHaveLength(1);
    expect(r.outcome).toBe('failed');
    expect(r.nativeSessionId).toBeNull();
    expect(r.error).toContain('not found');
    expect(r.error).toContain('DEFINITION');
    expect(r.error).not.toContain('trig-secret');
    expect(isAgentNotFoundRejection(rejected.http_status, rejected.body)).toBe(true);
    expect(isAgentNotFoundRejection(500, rejected.body)).toBe(false);
    expect(isAgentNotFoundRejection(400, { error: 'InvalidInputError', message: 'agent_input is required' })).toBe(false);
  });

  it('a profile without a launch agent ref never calls the network, even if an installed id is configured', async () => {
    const c = cfg({ GUILD_INVESTIGATOR_INSTALLED_AGENT_ID: INSTALLED_ID });
    const { launcher, sent } = launcherWith(c, () => ({ status: 200, body: targetLaunch }));
    const r = await launcher.launch('investigator', 'facts', 'ref-native-5');
    expect(sent).toHaveLength(0);
    expect(r.outcome).toBe('failed');
    expect(r.error).toContain('launch agent ref');
  });

  it('a launch timeout/5xx stays unknown (unchanged ambiguity handling)', async () => {
    const c = cfg({ GUILD_TARGET_AGENT_ID: TARGET_DEF });
    const { launcher } = launcherWith(c, () => ({ status: 503, body: { error: 'unavailable' } }));
    const r = await launcher.launch('target', 'read ticket', 'ref-native-6');
    expect(r.outcome).toBe('unknown');
  });
});
