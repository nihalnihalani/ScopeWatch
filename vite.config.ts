import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const serverPort = Number(process.env.SCOPEWATCH_PORT ?? 4317);

export default defineConfig({
  plugins: [react()],
  root: 'src/client',
  build: { outDir: '../../dist/client', emptyOutDir: true, sourcemap: true },
  server: {
    host: '127.0.0.1',
    port: 5317,
    strictPort: true,
    proxy: { '/api': { target: `http://127.0.0.1:${serverPort}`, changeOrigin: false } },
  },
});
