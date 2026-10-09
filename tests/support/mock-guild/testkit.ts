/** Test helpers: build an AppConfig pointing at the loopback CONTRACT-TEST MOCK and an adapter over it. */
import type { AppConfig } from '../../../src/server/config.js';
import { GuildAdapter, type GuildAdapterOptions } from '../../../src/integrations/guild/index.js';
import type { RegisteredSession } from '../../../src/shared/ports.js';
import { MOCK_DEFAULTS, startMockGuild, type MockOptions } from './server.js';

export type Mock = Awaited<ReturnType<typeof startMockGuild>>;

export function makeConfig(m: Mock, over: Partial<AppConfig['guild']> = {}): AppConfig {
  const o = m.options;
  return {
    mode: 'contract_test',
    bindHost: '127.0.0.1',
    port: 0,
    allowedOrigins: [],
    operatorSecret: 'x'.repeat(24),
    operatorSecretGenerated: false,
    operatorName: 'operator',
    sqlitePath: ':memory:',
    clickhouse: null,
    pinnedManifestPath: null,
    pinnedManifestRef: null,
    guild: {
      baseUrl: m.url,
      triggerKey: o.triggerKey,
      collectorKey: o.collectorKey,
      workspaceId: o.workspace.id,
      workspaceOwner: o.workspace.owner,
      workspaceName: o.workspace.name,
      targetInstalledAgentId: o.installed.target,
      controlInstalledAgentId: o.installed.control,
      investigatorInstalledAgentId: o.installed.investigator,
      verifiedTargetPolicySubjectId: o.subjects.target,
      verifiedControlPolicySubjectId: o.subjects.control,
      verifiedCredentialId: o.credentialId,
      verifiedOperation: o.operation,
      ownedRepo: o.ownedRepo,
      controlExpectedMarker: o.controlMarker,
      agentSubjectMap: { [o.installed.target]: o.subjects.target, [o.installed.control]: o.subjects.control },
      identityDomain: 'workspace',
      probeTicketNumber: null,
      ...over,
    },
  };
}

export async function setup(opts: MockOptions = {}, adapterOpts: GuildAdapterOptions = {}, over: Partial<AppConfig['guild']> = {}) {
  const mock = await startMockGuild(opts);
  const config = makeConfig(mock, over);
  const adapter = new GuildAdapter(config, { pollMs: 5, completionTimeoutMs: 3000, backoffMs: 5, requestTimeoutMs: 2000, ...adapterOpts });
  return { mock, config, adapter };
}

export function regFor(mock: Mock, sessionId: string, profile: 'target' | 'control' | 'investigator' = 'target'): RegisteredSession {
  const o = mock.options;
  return {
    workspaceId: o.workspace.id,
    sessionId,
    launchId: `launch-${sessionId}`,
    profile,
    expectedPolicySubjectId: profile === 'control' ? o.subjects.control : o.subjects.target,
    installedAgentId: o.installed[profile],
  };
}

export const SUBJECT_MAP = (mock: Mock): Record<string, string> => ({
  [mock.options.installed.target]: mock.options.subjects.target,
  [mock.options.installed.control]: mock.options.subjects.control,
});

export { MOCK_DEFAULTS };
