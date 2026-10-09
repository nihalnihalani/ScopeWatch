import { existsSync, readFileSync } from 'node:fs';

/** Parse KEY=VALUE lines (no interpolation, no export). */
export function parseEnvFile(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split('\n')) {
    const m = /^\s*([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(line);
    if (m && !line.trim().startsWith('#')) out[m[1] as string] = (m[2] as string).trim();
  }
  return out;
}

/** Load a local env file into process.env without overriding values already set. Returns names loaded (never values). */
export function loadLocalEnv(path: string, env: NodeJS.ProcessEnv = process.env): string[] {
  if (!existsSync(path)) return [];
  const loaded: string[] = [];
  for (const [k, v] of Object.entries(parseEnvFile(readFileSync(path, 'utf8')))) {
    if (env[k] === undefined || env[k] === '') {
      env[k] = v;
      loaded.push(k);
    }
  }
  return loaded;
}
