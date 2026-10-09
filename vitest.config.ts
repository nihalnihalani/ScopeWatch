import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    projects: [
      { test: { name: 'unit', include: ['tests/unit/**/*.test.ts'], exclude: ['tests/unit/client/**'], environment: 'node' } },
      { test: { name: 'client', include: ['tests/unit/client/**/*.test.tsx'], environment: 'jsdom' } },
      { test: { name: 'integration', include: ['tests/integration/**/*.test.ts', 'tests/adversarial/**/*.test.ts'], environment: 'node', testTimeout: 30000 } },
      { test: { name: 'clickhouse', include: ['tests/clickhouse/**/*.test.ts'], environment: 'node', testTimeout: 120000, fileParallelism: false } },
    ],
  },
});
