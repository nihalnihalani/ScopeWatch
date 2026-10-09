/**
 * Self-contained helpers for the Guild adapter: canonical JSON, hashing, exact UTC nanosecond
 * parsing (never rounded through Date for the fraction) and secret redaction.
 */
import { createHash } from 'node:crypto';

export function sha256Hex(s: string): string {
  return createHash('sha256').update(s, 'utf8').digest('hex');
}

/** Deterministic JSON: object keys sorted recursively, undefined dropped. */
export function canonicalJson(v: unknown): string {
  if (v === null || typeof v !== 'object') {
    const s = JSON.stringify(v === undefined ? null : v);
    return s === undefined ? 'null' : s;
  }
  if (Array.isArray(v)) return `[${v.map((x) => canonicalJson(x)).join(',')}]`;
  const o = v as Record<string, unknown>;
  const keys = Object.keys(o)
    .filter((k) => o[k] !== undefined)
    .sort();
  return `{${keys.map((k) => `${JSON.stringify(k)}:${canonicalJson(o[k])}`).join(',')}}`;
}

export interface ParsedUtc {
  /** Validated UTC text (offset +00:00 normalized to Z; fraction digits preserved). */
  text: string;
  /** Epoch nanoseconds as decimal string. */
  ns: string;
}

const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})[Tt ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?(Z|z|[+-]00:?00)$/;

/** Returns null for anything that is not an exact UTC instant (non-UTC offsets are NOT converted). */
export function parseUtcNano(raw: unknown): ParsedUtc | null {
  if (typeof raw !== 'string') return null;
  const m = RFC3339.exec(raw.trim());
  if (!m) return null;
  const [, y, mo, d, h, mi, s, frac] = m;
  const ms = Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s));
  const chk = new Date(ms);
  if (
    Number.isNaN(ms) ||
    chk.getUTCFullYear() !== Number(y) ||
    chk.getUTCMonth() !== Number(mo) - 1 ||
    chk.getUTCDate() !== Number(d) ||
    chk.getUTCHours() !== Number(h) ||
    Number(s) > 59
  ) {
    return null;
  }
  const fracDigits = frac ?? '';
  const nanos = BigInt(fracDigits.padEnd(9, '0') || '0');
  const ns = (BigInt(ms) / 1000n) * 1_000_000_000n + nanos;
  const text = `${y}-${mo}-${d}T${h}:${mi}:${s}${fracDigits ? `.${fracDigits}` : ''}Z`;
  return { text, ns: ns.toString() };
}

/** Current local time as UTC text (millisecond precision, local clock - not a native clock). */
export function nowUtcText(now: () => Date = () => new Date()): string {
  return now().toISOString();
}

/** Exact ns comparison of two ns decimal strings. */
export function nsGreater(a: string, b: string): boolean {
  return BigInt(a) > BigInt(b);
}

export type Redactor = (text: string) => string;

/** Build a redactor for key strings of the form "id:secret" (also redacts parts, base64 and Basic headers). */
export function makeRedactor(keys: Array<string | null | undefined>): Redactor {
  const needles = new Set<string>();
  for (const k of keys) {
    if (!k) continue;
    needles.add(k);
    needles.add(Buffer.from(k, 'utf8').toString('base64'));
    const i = k.indexOf(':');
    if (i >= 0) {
      const secret = k.slice(i + 1);
      if (secret.length >= 4) needles.add(secret);
    }
  }
  const sorted = [...needles].filter((n) => n.length >= 4).sort((a, b) => b.length - a.length);
  return (text: string) => {
    let out = text;
    for (const n of sorted) out = out.split(n).join('[REDACTED]');
    return out.replace(/(Basic|Bearer)\s+[A-Za-z0-9+/=._-]{8,}/gi, '$1 [REDACTED]');
  };
}

export function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function str(v: unknown): string | null {
  return typeof v === 'string' && v !== '' ? v : null;
}

export interface Agreed {
  value: string | null;
  /** Two or more candidate locations carried different non-empty values. */
  conflict: boolean;
}

/**
 * Fail-closed field resolution across candidate locations (e.g. top-level vs `details`): absent candidates are
 * skipped; the value is returned only when every present candidate is equal. Disagreement yields null + conflict,
 * never silent precedence.
 */
export function agree(...candidates: unknown[]): Agreed {
  const present = [...new Set(candidates.map(str).filter((v): v is string => v !== null))];
  if (present.length === 0) return { value: null, conflict: false };
  if (present.length > 1) return { value: null, conflict: true };
  return { value: present[0] as string, conflict: false };
}

export function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
