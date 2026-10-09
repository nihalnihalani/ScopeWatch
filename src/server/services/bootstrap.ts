import { resolve } from 'node:path';
import type { AppConfig } from '../config.js';
import { connectClickHouse } from '../../integrations/clickhouse/client.js';
import { createGuildPort } from '../../integrations/guild/index.js';
import { Journal } from '../../storage/journal.js';
import type { Services } from './context.js';

/** Build services from validated config. Missing/unreachable dependencies are surfaced in status, never faked. */
export async function buildServices(config: AppConfig, rootDir = process.cwd()): Promise<Services> {
  const journal = new Journal(resolve(rootDir, config.sqlitePath), config.mode);
  let ch: Services['ch'] = null;
  let chStatus: Services['chStatus'] = { status: 'unconfigured', detail: 'CLICKHOUSE_URL and per-lane credentials are not configured' };
  if (config.clickhouse) {
    try {
      ch = await connectClickHouse(config.clickhouse);
      chStatus = { status: 'ok', detail: `${config.clickhouse.target} ${ch.serverVersion} database ${config.clickhouse.database}` };
    } catch (e) {
      chStatus = { status: 'unavailable', detail: (e as Error).message };
    }
  }
  let guild: Services['guild'] = null;
  if (config.mode !== 'replay') {
    try {
      guild = createGuildPort(config);
    } catch (e) {
      guild = null;
      chStatus = { ...chStatus };
      console.error(`guild adapter unavailable: ${(e as Error).message}`);
    }
  }
  return { config, journal, ch, chStatus, guild, rootDir };
}

export async function closeServices(svc: Services): Promise<void> {
  await svc.ch?.close();
  svc.journal.close();
}
