// Demo-recording harness: copy of tests/e2e/support/e2e-server.ts on separate ports and runtime/demo. Loopback only; contract_test talks to the MOCK Guild.
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { loadConfig } from '../src/server/config.js';
import { parseEnvFile } from '../src/server/services/envfile.js';
import { buildServices, closeServices } from '../src/server/services/bootstrap.js';
import { buildApp } from '../src/server/http/app.js';
import { launchScenario } from '../src/server/services/scenario.js';
import { MOCK_DEFAULTS, startMockGuild } from '../tests/support/mock-guild/server.js';
import { E2E_SECRET } from '../tests/e2e/support/constants.js';

const port = Number(process.argv[2] ?? process.env.SCOPEWATCH_DEMO_PORT ?? 4617);
const contractPort = port + 1;
const mockPort = port + 2;
const dir = 'runtime/demo';
mkdirSync(dir, { recursive: true });
for (const f of ['replay', 'contract']) for (const s of ['', '-wal', '-shm']) rmSync(`${dir}/${f}.sqlite${s}`, { force: true });

const chEnv = existsSync('runtime/clickhouse-local.env') ? parseEnvFile(readFileSync('runtime/clickhouse-local.env', 'utf8')) : {};
const secret = process.env.SCOPEWATCH_OPERATOR_SECRET || E2E_SECRET;
const base = { ...chEnv, SCOPEWATCH_OPERATOR_SECRET: secret, SCOPEWATCH_OPERATOR_NAME: 'demo-operator' };

const mock = await startMockGuild({ port: mockPort });
const o = mock.options;
writeFileSync(`${dir}/contract-manifest.json`, JSON.stringify({
  schema: 'scopewatch.manifest/v1', policyVersion: 'demo-contract-v1', workspaceId: o.workspace.id, credentialId: o.credentialId, operation: o.operation,
  unit: 'native_allow_security_event_id', clock: 'guild.security_event.created_at', subjectIdDomain: 'sandbox_subject', identityDomain: 'workspace', windowSeconds: 600,
  effectiveFrom: '2020-01-01T00:00:00Z', effectiveUntil: null,
  allowances: [
    { policySubjectId: o.subjects.target, displayLabel: 'TicketAssist', maxUniqueAllowDecisions: '4', approvalRef: 'demo-approval-target' },
    { policySubjectId: o.subjects.control, displayLabel: 'ReleaseReview', maxUniqueAllowDecisions: '100', approvalRef: 'demo-approval-control' },
  ],
}, null, 2));

const contractEnv = {
  ...base,
  SCOPEWATCH_MODE: 'contract_test', SCOPEWATCH_PORT: String(contractPort), SCOPEWATCH_SQLITE_PATH: `${dir}/contract.sqlite`,
  GUILD_API_BASE_URL: mock.url, GUILD_TRIGGER_KEY: o.triggerKey, GUILD_COLLECTOR_KEY: o.collectorKey,
  GUILD_WORKSPACE_ID: o.workspace.id, GUILD_WORKSPACE_OWNER: o.workspace.owner, GUILD_WORKSPACE_NAME: o.workspace.name,
  GUILD_TARGET_AGENT_ID: o.agents.target, GUILD_CONTROL_AGENT_ID: o.agents.control, GUILD_INVESTIGATOR_AGENT_ID: o.agents.investigator,
  GUILD_TARGET_INSTALLED_AGENT_ID: o.installed.target, GUILD_CONTROL_INSTALLED_AGENT_ID: o.installed.control, GUILD_INVESTIGATOR_INSTALLED_AGENT_ID: o.installed.investigator,
  GUILD_VERIFIED_TARGET_POLICY_SUBJECT_ID: o.subjects.target, GUILD_VERIFIED_CONTROL_POLICY_SUBJECT_ID: o.subjects.control,
  GUILD_VERIFIED_CREDENTIAL_ID: o.credentialId, GUILD_VERIFIED_OPERATION: o.operation,
  OWNED_GITHUB_OWNER: o.ownedRepo.split('/')[0] as string, OWNED_GITHUB_REPO: o.ownedRepo.split('/')[1] as string,
  SCOPEWATCH_CONTROL_EXPECTED_MARKER: o.controlMarker, SCOPEWATCH_TARGET_EXPECTED_MARKER: o.targetMarker,
  GUILD_AGENT_SUBJECT_MAP: JSON.stringify({ [o.agents.target]: o.subjects.target, [o.agents.control]: o.subjects.control }),
  GUILD_IDENTITY_DOMAIN: 'workspace', GUILD_PROBE_TICKET_NUMBER: '1',
  PINNED_MANIFEST_PATH: `${dir}/contract-manifest.json`, PINNED_MANIFEST_REF: 'demo:contract-manifest',
};
const replayEnv = { ...base, SCOPEWATCH_MODE: 'replay', SCOPEWATCH_PORT: String(port), SCOPEWATCH_SQLITE_PATH: `${dir}/replay.sqlite` };

const contractSvc = await buildServices(loadConfig(contractEnv as NodeJS.ProcessEnv));
const scenario = await launchScenario(contractSvc, { targetSessions: 5, controlSessions: 2 });
console.log(`[demo] contract scenario ${scenario.scenarioId}: registered ${scenario.registered}, unreconciled ${scenario.unreconciled.length}`);
const contractApp = await buildApp(contractSvc.config, contractSvc);
await contractApp.listen({ host: '127.0.0.1', port: contractPort });
console.log(`[demo] contract_test (MOCK Guild ${mock.url}) on :${contractPort}`);

const replaySvc = await buildServices(loadConfig(replayEnv as NodeJS.ProcessEnv));
const replayApp = await buildApp(replaySvc.config, replaySvc);
await replayApp.listen({ host: '127.0.0.1', port });
console.log(`[demo] replay on :${port}; clickhouse replay: ${replaySvc.chStatus.status}, contract: ${contractSvc.chStatus.status}`);

// Demo-only stand-in for the HUMAN step in the Guild UI: once the operator records a native receipt for a restriction,
// apply the matching DENY in the MOCK; once a removal receipt is recorded, remove it. The app itself never calls the mock control.
let mockDenied = false;
setInterval(() => {
  const j = contractSvc.journal;
  const acts = j.listCases().flatMap((c) => j.listActions(c.caseId));
  const want = acts.some((a) => a.kind === 'restriction' && a.nativeReceipt) && !acts.some((a) => a.kind === 'recovery' && a.nativeReceipt);
  if (want && !mockDenied) {
    mock.control.applyDeny({});
    mockDenied = true;
    console.log('[demo] simulated human: mock Guild DENY applied');
  } else if (!want && mockDenied) {
    mock.control.removeDeny();
    mockDenied = false;
    console.log('[demo] simulated human: mock Guild DENY removed');
  }
}, 500).unref();

let stopping = false;
const stop = async () => {
  if (stopping) return;
  stopping = true;
  await replayApp.close().catch(() => undefined);
  await contractApp.close().catch(() => undefined);
  await closeServices(replaySvc).catch(() => undefined);
  await closeServices(contractSvc).catch(() => undefined);
  await mock.close().catch(() => undefined);
  process.exit(0);
};
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
void MOCK_DEFAULTS;
