/** Server bootstrap: loadConfig -> journal -> ClickHouse -> GuildPort -> Fastify on 127.0.0.1. */
import { loadConfig, ConfigError, describeConfig } from './config.js';
import { loadLocalEnv } from './services/envfile.js';
import { buildServices, closeServices } from './services/bootstrap.js';
import { buildApp, modeLabel } from './http/app.js';

async function main(): Promise<void> {
  loadLocalEnv('runtime/clickhouse-local.env');
  const config = loadConfig(process.env);
  const svc = await buildServices(config);
  const app = await buildApp(config, svc);
  await app.listen({ host: config.bindHost, port: config.port });
  console.log(`ScopeWatch ${modeLabel(config, svc)}`);
  console.log(`listening on http://${config.bindHost}:${config.port}`);
  console.log(`clickhouse: ${svc.chStatus.status} (${svc.chStatus.detail})`);
  console.log(`guild adapter: ${svc.guild ? 'built' : config.mode === 'replay' ? 'not used in replay mode' : 'UNAVAILABLE (see /api/status)'}`);
  for (const [k, v] of Object.entries(describeConfig(config))) if (k !== 'operatorSecret') console.log(`  ${k}: ${v}`);
  if (config.operatorSecretGenerated) console.log(`operator secret (shown once, not stored): ${config.operatorSecret}`);
  const stop = async () => {
    await app.close();
    await closeServices(svc);
    process.exit(0);
  };
  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
}

main().catch((e) => {
  console.error(e instanceof ConfigError ? `configuration error: ${e.message}` : `startup failed: ${(e as Error).stack ?? e}`);
  process.exit(1);
});
