/** Launch the declared cohort through the Guild adapter (native / contract_test) and register it server-side. */
import { loadConfig } from '../src/server/config.js';
import { loadLocalEnv } from '../src/server/services/envfile.js';
import { buildServices, closeServices } from '../src/server/services/bootstrap.js';
import { launchScenario } from '../src/server/services/scenario.js';

async function main(): Promise<void> {
  loadLocalEnv('runtime/clickhouse-local.env');
  const config = loadConfig(process.env);
  if (config.mode === 'replay') {
    console.error('replay mode declares its cohort in data/replay/*.json; nothing to launch');
    process.exit(2);
  }
  const svc = await buildServices(config);
  try {
    const t = Number(process.argv[2] ?? 5);
    const c = Number(process.argv[3] ?? 2);
    const r = await launchScenario(svc, { targetSessions: t, controlSessions: c });
    console.log(`scenario ${r.scenarioId}: registered ${r.registered} sessions; unreconciled launches: ${r.unreconciled.length}`);
    for (const u of r.unreconciled) console.log(`  ${u.idempotencyRef}: ${u.outcome} ${u.error ?? ''}`);
    if (r.unreconciled.length) process.exitCode = 1;
  } finally {
    await closeServices(svc);
  }
}

main().catch((e) => {
  console.error(`scenario failed: ${(e as Error).message}`);
  process.exit(1);
});
