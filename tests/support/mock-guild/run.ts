/** CLI: `npx tsx tests/support/mock-guild/run.ts [port]` - starts the CONTRACT-TEST MOCK Guild API on loopback. */
import { MOCK_LABEL, startMockGuild } from './server.js';

const port = Number(process.argv[2] ?? 4010);
const m = await startMockGuild({ port });
console.log(`${MOCK_LABEL}\nlistening on ${m.url} (loopback only); scenario control under /__mock/*`);
console.log(`launch agent_id (definition ids): ${JSON.stringify(m.options.agents)}; installed ids are rejected like native`);
process.on('SIGINT', () => void m.close().then(() => process.exit(0)));
