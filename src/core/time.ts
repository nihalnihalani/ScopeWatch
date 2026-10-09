/**
 * Exact UTC timestamp handling. Counting never goes through JS Date: text <-> epoch nanoseconds (BigInt).
 */
import type { EpochNsText, UtcNanoText } from '../shared/contracts.js';

export class TimeError extends Error {}

const RE = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?Z$/;
const CH_RE = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,9}))?$/;

const MIN_YEAR = 1970;
const MAX_YEAR = 2261;
const NS_PER_S = 1_000_000_000n;

function isLeap(y: number): boolean {
  return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
}

function daysInMonth(y: number, m: number): number {
  return [31, isLeap(y) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][m - 1] as number;
}

/** Days since 1970-01-01 for a proleptic Gregorian civil date (Hinnant). */
function daysFromCivil(y: number, m: number, d: number): number {
  const yy = m <= 2 ? y - 1 : y;
  const era = Math.floor(yy / 400);
  const yoe = yy - era * 400;
  const doy = Math.floor((153 * (m + (m > 2 ? -3 : 9)) + 2) / 5) + d - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

function civilFromDays(z0: number): { y: number; m: number; d: number } {
  const z = z0 + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor((doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365);
  const y = yoe + era * 400;
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const d = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const m = mp < 10 ? mp + 3 : mp - 9;
  return { y: m <= 2 ? y + 1 : y, m, d };
}

function build(parts: RegExpExecArray, text: string): bigint {
  const [y, mo, d, h, mi, s] = parts.slice(1, 7).map(Number) as [number, number, number, number, number, number];
  const frac = parts[7] ?? '';
  if (y < MIN_YEAR || y > MAX_YEAR) throw new TimeError(`year out of range: ${text}`);
  if (mo < 1 || mo > 12) throw new TimeError(`month out of range: ${text}`);
  if (d < 1 || d > daysInMonth(y, mo)) throw new TimeError(`day out of range: ${text}`);
  if (h > 23 || mi > 59 || s > 59) throw new TimeError(`time out of range: ${text}`);
  const secs = BigInt(daysFromCivil(y, mo, d)) * 86400n + BigInt(h * 3600 + mi * 60 + s);
  return secs * NS_PER_S + BigInt(frac.padEnd(9, '0') || '0');
}

/** Strict RFC3339 UTC ("Z" only, up to 9 fractional digits) to epoch nanoseconds. */
export function parseUtcNano(text: string): bigint {
  const m = RE.exec(text);
  if (!m) throw new TimeError(`not a strict UTC RFC3339 timestamp: ${JSON.stringify(text)}`);
  return build(m, text);
}

export function tryParseUtcNano(text: string | null | undefined): bigint | null {
  if (text === null || text === undefined) return null;
  try {
    return parseUtcNano(text);
  } catch {
    return null;
  }
}

/** Epoch ns -> UTC text; fraction printed only when non-zero, trailing zeros trimmed. */
export function formatUtcNano(ns: bigint): UtcNanoText {
  if (ns < 0n) throw new TimeError('negative epoch ns');
  const secs = ns / NS_PER_S;
  const frac = ns % NS_PER_S;
  const days = Number(secs / 86400n);
  const rem = Number(secs % 86400n);
  const { y, m, d } = civilFromDays(days);
  const p = (n: number, w = 2) => String(n).padStart(w, '0');
  const base = `${p(y, 4)}-${p(m)}-${p(d)}T${p(Math.floor(rem / 3600))}:${p(Math.floor((rem % 3600) / 60))}:${p(rem % 60)}`;
  const f = frac === 0n ? '' : '.' + String(frac).padStart(9, '0').replace(/0+$/, '');
  return `${base}${f}Z`;
}

/** ClickHouse DateTime64(9,'UTC') text form: 'YYYY-MM-DD HH:MM:SS.fffffffff'. */
export function toClickHouseDateTime64(ns: bigint): string {
  const frac = ns % NS_PER_S;
  const whole = formatUtcNano(ns - frac).replace('T', ' ').replace('Z', '');
  return `${whole}.${String(frac).padStart(9, '0')}`;
}

export function fromClickHouseDateTime64(text: string): bigint {
  const m = CH_RE.exec(text);
  if (!m) throw new TimeError(`not a ClickHouse DateTime64 text: ${JSON.stringify(text)}`);
  return build(m, text);
}

export function nsToText(ns: bigint): EpochNsText {
  return ns.toString(10);
}

export function parseEpochNsText(t: string): bigint {
  if (!/^\d{1,19}$/.test(t)) throw new TimeError(`not an epoch-ns decimal: ${JSON.stringify(t)}`);
  return BigInt(t);
}

/** Wall clock for stamping records (NOT used for counting). */
export function nowUtcNano(): UtcNanoText {
  return formatUtcNano(BigInt(Date.now()) * 1_000_000n);
}

export function nowNs(): bigint {
  return BigInt(Date.now()) * 1_000_000n;
}
