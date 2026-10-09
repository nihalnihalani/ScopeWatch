import { createHash, randomBytes } from 'node:crypto';

export function sha256Hex(data: string | Uint8Array): string {
  return createHash('sha256').update(data).digest('hex');
}

/** Deterministic JSON: object keys sorted by code unit, undefined dropped, BigInt rejected. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

function sortValue(v: unknown): unknown {
  if (v === null || typeof v !== 'object') {
    if (typeof v === 'bigint') throw new TypeError('canonicalJson: BigInt must be serialized as a string first');
    return v;
  }
  if (Array.isArray(v)) return v.map(sortValue);
  const out: Record<string, unknown> = {};
  for (const k of Object.keys(v as object).sort()) {
    const x = (v as Record<string, unknown>)[k];
    if (x !== undefined) out[k] = sortValue(x);
  }
  return out;
}

export function newId(prefix: string): string {
  return `${prefix}-${randomBytes(8).toString('hex')}`;
}

/** Codepoint-order comparator (never locale). */
export function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
