/**
 * Validated server configuration (lead-owned).
 * Fails closed: native mode with missing Guild/ClickHouse settings reports UNCONFIGURED; it never
 * falls back to replay. Secret VALUES are never serialized: use `describeConfig` for display.
 */
import { randomBytes } from 'node:crypto';
import type { RunMode } from '../shared/contracts.js';

export interface ClickHouseConfig {
  url: string;
  /** 'clickhouse_local' for loopback docker; 'clickhouse_cloud' otherwise. */
  target: 'clickhouse_local' | 'clickhouse_cloud';
  database: string;
  /** Privilege lanes (CLICKHOUSE_CONTRACTS.md): collector INSERT, evaluator SELECT. */
  collector: { username: string; password: string };
  evaluator: { username: string; password: string };
}

export interface GuildConfig {
  baseUrl: string;
  /** Trigger key "id:secret" for launches (server-side only). */
  triggerKey: string | null;
  /** Account key "id:secret" with workspaces:read + agents:read for collection. */
  collectorKey: string | null;
  workspaceId: string | null;
  workspaceOwner: string | null;
  workspaceName: string | null;
  /** Allowlisted installed agents (launch profiles). */
  targetInstalledAgentId: string | null;
  controlInstalledAgentId: string | null;
  investigatorInstalledAgentId: string | null;
  /** Verified (by native proof) policy-subject IDs and credential/operation. */
  verifiedTargetPolicySubjectId: string | null;
  verifiedControlPolicySubjectId: string | null;
  verifiedCredentialId: string | null;
  verifiedOperation: string | null;
  ownedRepo: string | null;
  /** Expected control fixture marker. Server-side only: never put into a model prompt. */
  controlExpectedMarker: string | null;
  /** Server-held expected marker for the TARGET fixture, used only by recovery probes (devil P1-B). */
  targetExpectedMarker: string | null;
  /**
   * Native agent ref (as observed in agent task nodes) → verified policy-subject ID. Recorded from
   * native proof (docs/native/NATIVE_PROOF_LEDGER.md); never inferred from display names.
   * Env GUILD_AGENT_SUBJECT_MAP as JSON object.
   */
  agentSubjectMap: Record<string, string>;
  /** Verified native event identity domain; 'unverified' blocks native admission. */
  identityDomain: 'workspace' | 'session' | 'unverified';
  /** Synthetic ticket number the allowlisted probe instruction reads. */
  probeTicketNumber: number | null;
}

export interface AppConfig {
  mode: RunMode;
  bindHost: '127.0.0.1';
  port: number;
  /** Exact allowed Host/Origin values for mutation routes. */
  allowedOrigins: string[];
  operatorSecret: string;
  operatorSecretGenerated: boolean;
  operatorName: string;
  sqlitePath: string;
  clickhouse: ClickHouseConfig | null;
  guild: GuildConfig;
  /** Pinned manifest file path (native) — bytes are hashed exactly. */
  pinnedManifestPath: string | null;
  pinnedManifestRef: string | null;
}

export class ConfigError extends Error {}

const MODES: RunMode[] = ['native', 'replay', 'contract_test'];

function env(name: string, src: NodeJS.ProcessEnv): string | null {
  const v = src[name];
  return v === undefined || v.trim() === '' ? null : v.trim();
}

export function isLoopbackUrl(u: string): boolean {
  try {
    const h = new URL(u).hostname;
    return h === '127.0.0.1' || h === 'localhost' || h === '[::1]' || h === '::1';
  } catch {
    return false;
  }
}

/** Native mode may only talk to the real Guild public API host (devil P0-1). */
export const NATIVE_GUILD_HOSTS = ['api.guild.ai'] as const;

export function isAllowedNativeGuildUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return url.protocol === 'https:' && (NATIVE_GUILD_HOSTS as readonly string[]).includes(url.hostname) && url.port === '';
  } catch {
    return false;
  }
}

export function loadConfig(src: NodeJS.ProcessEnv = process.env): AppConfig {
  const modeRaw = (env('SCOPEWATCH_MODE', src) ?? 'replay').replace('-', '_') as RunMode;
  if (!MODES.includes(modeRaw)) throw new ConfigError(`SCOPEWATCH_MODE must be one of ${MODES.join(', ')}`);
  const mode = modeRaw;

  const bindHost = env('SCOPEWATCH_BIND_HOST', src) ?? '127.0.0.1';
  if (bindHost !== '127.0.0.1') throw new ConfigError('SCOPEWATCH_BIND_HOST must be 127.0.0.1 (loopback only)');
  const port = Number(env('SCOPEWATCH_PORT', src) ?? 4317);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new ConfigError('SCOPEWATCH_PORT invalid');

  const extraOrigins = (env('SCOPEWATCH_ALLOWED_ORIGINS', src) ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  const allowedOrigins = [`http://127.0.0.1:${port}`, `http://localhost:${port}`, ...extraOrigins];

  let operatorSecret = env('SCOPEWATCH_OPERATOR_SECRET', src);
  let operatorSecretGenerated = false;
  if (!operatorSecret) {
    operatorSecret = randomBytes(24).toString('base64url');
    operatorSecretGenerated = true;
  }
  if (operatorSecret.length < 16) throw new ConfigError('SCOPEWATCH_OPERATOR_SECRET must be at least 16 characters');

  const chUrl = env('CLICKHOUSE_URL', src);
  let clickhouse: ClickHouseConfig | null = null;
  if (chUrl) {
    const database =
      env(mode === 'replay' ? 'CLICKHOUSE_REPLAY_DATABASE' : mode === 'contract_test' ? 'CLICKHOUSE_CONTRACT_DATABASE' : 'CLICKHOUSE_DATABASE', src) ??
      (mode === 'replay' ? 'scopewatch_replay' : mode === 'contract_test' ? 'scopewatch_contract' : 'scopewatch');
    if (mode !== 'native' && database === (env('CLICKHOUSE_DATABASE', src) ?? 'scopewatch')) {
      throw new ConfigError('replay/contract_test must not use the native ClickHouse database');
    }
    if (mode === 'native' && /_(replay|contract)$/.test(database)) {
      throw new ConfigError('native mode must not use a replay/contract ClickHouse database (devil P2-3)');
    }
    const prefix = mode === 'replay' ? 'CLICKHOUSE_REPLAY' : mode === 'contract_test' ? 'CLICKHOUSE_CONTRACT' : 'CLICKHOUSE';
    const cu = env(`${prefix}_INGEST_USERNAME`, src);
    const cp = env(`${prefix}_INGEST_PASSWORD`, src);
    const eu = env(`${prefix}_QUERY_USERNAME`, src);
    const ep = env(`${prefix}_QUERY_PASSWORD`, src);
    if (cu && cp && eu && ep) {
      clickhouse = {
        url: chUrl,
        target: isLoopbackUrl(chUrl) ? 'clickhouse_local' : 'clickhouse_cloud',
        database,
        collector: { username: cu, password: cp },
        evaluator: { username: eu, password: ep },
      };
    }
  }

  const guildBase = env('GUILD_API_BASE_URL', src) ?? 'https://api.guild.ai';
  if (mode === 'contract_test' && !isLoopbackUrl(guildBase)) {
    throw new ConfigError('contract_test mode requires a loopback GUILD_API_BASE_URL (mock Guild API)');
  }
  if (mode === 'native' && !isAllowedNativeGuildUrl(guildBase)) {
    throw new ConfigError(
      `native mode requires GUILD_API_BASE_URL in ${NATIVE_GUILD_HOSTS.join(', ')} over https (loopback/mock hosts are refused)`,
    );
  }
  const guild: GuildConfig = {
    baseUrl: guildBase,
    triggerKey: env('GUILD_TRIGGER_KEY', src) ?? joinKey(env('GUILD_TRIGGER_ID', src), env('GUILD_TRIGGER_SECRET', src)),
    collectorKey: env('GUILD_COLLECTOR_KEY', src) ?? joinKey(env('GUILD_COLLECTOR_KEY_ID', src), env('GUILD_COLLECTOR_KEY_SECRET', src)),
    workspaceId: env('GUILD_WORKSPACE_ID', src),
    workspaceOwner: env('GUILD_WORKSPACE_OWNER', src),
    workspaceName: env('GUILD_WORKSPACE_NAME', src),
    targetInstalledAgentId: env('GUILD_TARGET_INSTALLED_AGENT_ID', src),
    controlInstalledAgentId: env('GUILD_CONTROL_INSTALLED_AGENT_ID', src),
    investigatorInstalledAgentId: env('GUILD_INVESTIGATOR_INSTALLED_AGENT_ID', src),
    verifiedTargetPolicySubjectId: env('GUILD_VERIFIED_TARGET_POLICY_SUBJECT_ID', src),
    verifiedControlPolicySubjectId: env('GUILD_VERIFIED_CONTROL_POLICY_SUBJECT_ID', src),
    verifiedCredentialId: env('GUILD_VERIFIED_CREDENTIAL_ID', src),
    verifiedOperation: env('GUILD_VERIFIED_OPERATION', src),
    ownedRepo: env('OWNED_GITHUB_OWNER', src) && env('OWNED_GITHUB_REPO', src) ? `${env('OWNED_GITHUB_OWNER', src)}/${env('OWNED_GITHUB_REPO', src)}` : null,
    controlExpectedMarker: env('SCOPEWATCH_CONTROL_EXPECTED_MARKER', src),
    targetExpectedMarker: env('SCOPEWATCH_TARGET_EXPECTED_MARKER', src),
    agentSubjectMap: parseSubjectMap(env('GUILD_AGENT_SUBJECT_MAP', src)),
    identityDomain: parseIdentityDomain(env('GUILD_IDENTITY_DOMAIN', src)),
    probeTicketNumber: env('GUILD_PROBE_TICKET_NUMBER', src) ? Number(env('GUILD_PROBE_TICKET_NUMBER', src)) : null,
  };

  return {
    mode,
    bindHost: '127.0.0.1',
    port,
    allowedOrigins,
    operatorSecret,
    operatorSecretGenerated,
    operatorName: env('SCOPEWATCH_OPERATOR_NAME', src) ?? 'operator',
    sqlitePath: env('SCOPEWATCH_SQLITE_PATH', src) ?? `runtime/scopewatch-${mode}.sqlite`,
    clickhouse,
    guild,
    pinnedManifestPath: env('PINNED_MANIFEST_PATH', src),
    pinnedManifestRef: env('PINNED_MANIFEST_REF', src),
  };
}

function parseSubjectMap(raw: string | null): Record<string, string> {
  if (!raw) return {};
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    throw new ConfigError('GUILD_AGENT_SUBJECT_MAP must be a JSON object of string → string');
  }
  if (!v || typeof v !== 'object' || Array.isArray(v) || Object.values(v).some((x) => typeof x !== 'string')) {
    throw new ConfigError('GUILD_AGENT_SUBJECT_MAP must be a JSON object of string → string');
  }
  return v as Record<string, string>;
}

function parseIdentityDomain(raw: string | null): 'workspace' | 'session' | 'unverified' {
  if (raw === null) return 'unverified';
  if (raw === 'workspace' || raw === 'session') return raw;
  throw new ConfigError('GUILD_IDENTITY_DOMAIN must be workspace or session (set only after native proof)');
}

function joinKey(id: string | null, secret: string | null): string | null {
  return id && secret ? `${id}:${secret}` : null;
}

/** Names of missing native prerequisites (never values). */
export function missingGuildSettings(g: GuildConfig): string[] {
  const required: Array<[keyof GuildConfig, string]> = [
    ['triggerKey', 'GUILD_TRIGGER_ID/GUILD_TRIGGER_SECRET'],
    ['collectorKey', 'GUILD_COLLECTOR_KEY_ID/GUILD_COLLECTOR_KEY_SECRET'],
    ['workspaceId', 'GUILD_WORKSPACE_ID'],
    ['workspaceOwner', 'GUILD_WORKSPACE_OWNER'],
    ['workspaceName', 'GUILD_WORKSPACE_NAME'],
    ['targetInstalledAgentId', 'GUILD_TARGET_INSTALLED_AGENT_ID'],
    ['controlInstalledAgentId', 'GUILD_CONTROL_INSTALLED_AGENT_ID'],
    ['investigatorInstalledAgentId', 'GUILD_INVESTIGATOR_INSTALLED_AGENT_ID'],
    ['verifiedTargetPolicySubjectId', 'GUILD_VERIFIED_TARGET_POLICY_SUBJECT_ID'],
    ['verifiedControlPolicySubjectId', 'GUILD_VERIFIED_CONTROL_POLICY_SUBJECT_ID'],
    ['verifiedCredentialId', 'GUILD_VERIFIED_CREDENTIAL_ID'],
    ['verifiedOperation', 'GUILD_VERIFIED_OPERATION'],
    ['ownedRepo', 'OWNED_GITHUB_OWNER/OWNED_GITHUB_REPO'],
    ['controlExpectedMarker', 'SCOPEWATCH_CONTROL_EXPECTED_MARKER'],
    ['targetExpectedMarker', 'SCOPEWATCH_TARGET_EXPECTED_MARKER'],
    ['probeTicketNumber', 'GUILD_PROBE_TICKET_NUMBER'],
  ];
  const out = required.filter(([k]) => g[k] === null).map(([, n]) => n);
  if (Object.keys(g.agentSubjectMap).length === 0) out.push('GUILD_AGENT_SUBJECT_MAP');
  if (g.identityDomain === 'unverified') out.push('GUILD_IDENTITY_DOMAIN');
  return out;
}

/** Safe description for doctor/status output: presence only, no secret values. */
export function describeConfig(c: AppConfig): Record<string, string> {
  return {
    mode: c.mode,
    bind: `${c.bindHost}:${c.port}`,
    operatorSecret: c.operatorSecretGenerated ? 'generated at startup (printed once to server stdout)' : 'configured',
    sqlitePath: c.sqlitePath,
    clickhouse: c.clickhouse ? `${c.clickhouse.target} db=${c.clickhouse.database} (credentials configured)` : 'unconfigured',
    guildBaseUrl: c.guild.baseUrl,
    guildMissing: missingGuildSettings(c.guild).join(', ') || 'none',
    pinnedManifest: c.pinnedManifestPath ? 'configured' : 'unconfigured',
  };
}
