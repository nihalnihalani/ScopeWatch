/**
 * E2E harness entry (used by playwright.config.ts webServer): node tests/e2e/support/start-e2e-server.mjs <port>
 * Starts the REAL ScopeWatch server in two modes on loopback:
 *   replay        -> <port>
 *   contract_test -> <port+1>   (against the loopback CONTRACT-TEST MOCK Guild at <port+2>; NOT native evidence)
 * Builds nothing: run `npm run build` first. Health URL for Playwright is the replay port.
 */
import { register } from 'tsx/esm/api';

register();
await import('./e2e-server.ts');
