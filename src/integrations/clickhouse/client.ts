import { createClient, type ClickHouseClient } from '@clickhouse/client';
import type { ClickHouseConfig } from '../../server/config.js';

export interface ChServices {
  readonly config: ClickHouseConfig;
  /** INSERT + SELECT on the namespace tables (readback). */
  readonly collector: ClickHouseClient;
  /** SELECT only. */
  readonly evaluator: ClickHouseClient;
  readonly serverVersion: string;
  close(): Promise<void>;
}

export class ChUnavailableError extends Error {}

/** Separate clients per privilege lane; captures `SELECT version()` through the evaluator lane. */
export async function connectClickHouse(cfg: ClickHouseConfig): Promise<ChServices> {
  const mk = (u: { username: string; password: string }) =>
    createClient({ url: cfg.url, username: u.username, password: u.password, database: cfg.database, request_timeout: 30_000, application: 'scopewatch' });
  const collector = mk(cfg.collector);
  const evaluator = mk(cfg.evaluator);
  try {
    const rs = await evaluator.query({ query: 'SELECT version() AS v', format: 'JSONEachRow' });
    const rows = await rs.json<{ v: string }>();
    const v = rows[0]?.v;
    if (!v) throw new Error('empty version result');
    return {
      config: cfg,
      collector,
      evaluator,
      serverVersion: v,
      async close() {
        await Promise.allSettled([collector.close(), evaluator.close()]);
      },
    };
  } catch (e) {
    await Promise.allSettled([collector.close(), evaluator.close()]);
    throw new ChUnavailableError(`ClickHouse unavailable at ${cfg.url}: ${(e as Error).message}`);
  }
}
