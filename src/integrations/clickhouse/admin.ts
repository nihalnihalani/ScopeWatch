/**
 * One-time provisioning (admin lane): database, schema, and least-privilege users. Never used by the running app.
 */
import { createClient, type ClickHouseClient } from '@clickhouse/client';
import { randomBytes } from 'node:crypto';
import { ddl } from './schema.js';

export interface NamespaceUsers {
  ingest: { username: string; password: string };
  query: { username: string; password: string };
}

export function adminClient(url: string, username: string, password: string): ClickHouseClient {
  return createClient({ url, username, password, request_timeout: 30_000 });
}

/** Fixed prefix satisfies ClickHouse Cloud's complexity policy (upper, lower, digit, special); the hex carries the entropy. */
export function randomPassword(): string {
  return `Sw9-${randomBytes(18).toString('hex')}`;
}

const IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/;
const PW = /^[A-Za-z0-9_-]+$/;

export async function provisionNamespace(admin: ClickHouseClient, db: string, users: NamespaceUsers): Promise<{ queryLogGrant: boolean }> {
  for (const n of [db, users.ingest.username, users.query.username]) if (!IDENT.test(n)) throw new Error(`unsafe identifier ${n}`);
  for (const pw of [users.ingest.password, users.query.password]) if (!PW.test(pw)) throw new Error('generated passwords must be [A-Za-z0-9_-]');
  await admin.command({ query: `CREATE DATABASE IF NOT EXISTS ${db}` });
  for (const stmt of ddl()) await admin.command({ query: stmt.replace(/CREATE TABLE IF NOT EXISTS (\w+)/, `CREATE TABLE IF NOT EXISTS ${db}.$1`) });
  for (const u of [users.ingest, users.query]) {
    await admin.command({ query: `CREATE USER IF NOT EXISTS ${u.username} IDENTIFIED WITH sha256_password BY '${u.password}'` });
    await admin.command({ query: `ALTER USER ${u.username} IDENTIFIED WITH sha256_password BY '${u.password}'` });
  }
  await admin.command({ query: `GRANT INSERT, SELECT ON ${db}.* TO ${users.ingest.username}` });
  await admin.command({ query: `GRANT SELECT ON ${db}.* TO ${users.query.username}` });
  let queryLogGrant = false;
  try {
    await admin.command({ query: `GRANT SELECT ON system.query_log TO ${users.query.username}` });
    queryLogGrant = true;
  } catch {
    queryLogGrant = false;
  }
  return { queryLogGrant };
}

export async function dropNamespace(admin: ClickHouseClient, db: string, users: NamespaceUsers): Promise<void> {
  await admin.command({ query: `DROP DATABASE IF EXISTS ${db}` });
  for (const u of [users.ingest, users.query]) await admin.command({ query: `DROP USER IF EXISTS ${u.username}` });
}
