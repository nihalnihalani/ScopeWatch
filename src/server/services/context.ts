import type { AppConfig } from '../config.js';
import type { ChServices } from '../../integrations/clickhouse/client.js';
import type { GuildPort } from '../../shared/ports.js';
import type { Journal } from '../../storage/journal.js';

/** Everything the services need; built once by main.ts or by tests. */
export interface Services {
  config: AppConfig;
  journal: Journal;
  /** null when ClickHouse is unconfigured or unreachable: surfaced, never faked. */
  ch: ChServices | null;
  chStatus: { status: 'ok' | 'unconfigured' | 'unavailable'; detail: string };
  /** null in replay mode (no Guild access) or when the adapter could not be built. */
  guild: GuildPort | null;
  /** Repository root used to find data/replay seeds. */
  rootDir: string;
}
