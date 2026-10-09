import type { AppConfig } from '../../server/config.js';
import type { CollectedSession, RegisteredSession } from '../../shared/ports.js';
import type { Provenance } from '../../shared/contracts.js';
import type { GuildHttp } from './http.js';
import type { Launcher } from './launcher.js';

/** Shared adapter dependencies passed to investigator/verifier helpers. */
export interface AdapterContext {
  config: AppConfig;
  provenance: Provenance;
  http: GuildHttp;
  launcher: Launcher;
  now: () => Date;
  collect(reg: RegisteredSession, generationId: string): Promise<CollectedSession>;
  completionTimeoutMs: number;
}
