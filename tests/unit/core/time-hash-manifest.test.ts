import { describe, expect, it } from 'vitest';
import { formatUtcNano, fromClickHouseDateTime64, parseUtcNano, toClickHouseDateTime64, tryParseUtcNano } from '../../../src/core/time.js';
import { canonicalJson } from '../../../src/core/hash.js';
import { pinManifest, ManifestError } from '../../../src/core/manifest.js';
import { rankBreaches } from '../../../src/core/selection.js';
import { manifestDoc } from './fixtures.js';

describe('time', () => {
  it('round-trips nanosecond precision exactly and never loses digits', () => {
    const t = '2026-10-09T12:34:56.123456789Z';
    expect(formatUtcNano(parseUtcNano(t))).toBe(t);
    expect(parseUtcNano('2026-10-09T12:34:56.5Z') - parseUtcNano('2026-10-09T12:34:56Z')).toBe(500_000_000n);
    expect(parseUtcNano('2026-10-09T12:00:00.000000001Z') - parseUtcNano('2026-10-09T12:00:00Z')).toBe(1n);
  });
  it('rejects non-strict, out-of-range and offset timestamps', () => {
    for (const bad of ['2026-10-09 12:00:00Z', '2026-10-09T12:00:00+00:00', '2026-02-30T00:00:00Z', '2026-13-01T00:00:00Z', '2026-10-09T24:00:00Z', '2026-10-09T12:00:00.1234567890Z', '2026-10-09T12:00:00']) {
      expect(tryParseUtcNano(bad), bad).toBeNull();
    }
  });
  it('handles leap days and ClickHouse DateTime64 text', () => {
    expect(formatUtcNano(parseUtcNano('2028-02-29T23:59:59.999999999Z'))).toBe('2028-02-29T23:59:59.999999999Z');
    const ns = parseUtcNano('2026-10-09T12:00:00.5Z');
    expect(toClickHouseDateTime64(ns)).toBe('2026-10-09 12:00:00.500000000');
    expect(fromClickHouseDateTime64('2026-10-09 12:00:00.500000000')).toBe(ns);
  });
});

describe('canonicalJson', () => {
  it('is key-order independent and rejects BigInt', () => {
    expect(canonicalJson({ b: 1, a: { d: 2, c: 3 } })).toBe(canonicalJson({ a: { c: 3, d: 2 }, b: 1 }));
    expect(() => canonicalJson({ n: 1n })).toThrow();
  });
});

describe('manifest', () => {
  const bytes = (d: unknown) => Buffer.from(JSON.stringify(d));
  const pin = (d: unknown) => pinManifest({ bytes: bytes(d), manifestId: 'm', provenance: 'replay', immutableRef: 'x', approvedBy: 'a' });
  it('hashes exact bytes in an external wrapper (hash is not inside the document)', () => {
    const doc = manifestDoc([['s1', 'S1', '20']]);
    const p = pin(doc);
    expect(p.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(p.document)).not.toContain(p.sha256);
    const spaced = pinManifest({ bytes: Buffer.from(JSON.stringify(doc, null, 4)), manifestId: 'm', provenance: 'replay', immutableRef: 'x', approvedBy: 'a' });
    expect(spaced.sha256).not.toBe(p.sha256); // different bytes, same content: hash binds the exact bytes
  });
  it('rejects duplicate subject allowances, wrong window, non-integer allowance, bad effective start', () => {
    expect(() => pin(manifestDoc([['s1', 'a', '5'], ['s1', 'b', '6']]))).toThrow(ManifestError);
    expect(() => pin({ ...manifestDoc([['s1', 'a', '5']]), windowSeconds: 300 })).toThrow(/windowSeconds/);
    expect(() => pin(manifestDoc([['s1', 'a', '5.5']]))).toThrow(/exact non-negative integer/);
    expect(() => pin(manifestDoc([['s1', 'a', '5']], 'yesterday'))).toThrow(/effectiveFrom/);
  });
});

describe('selection', () => {
  const k = (s: string) => ({ workspaceId: 'w', policySubjectId: s, credentialId: 'c', operation: 'o' });
  it('orders by first crossing ASC, excess DESC, then ids ASC', () => {
    const r = rankBreaches([
      { key: k('c'), firstCrossingNs: 20n, excess: 1n },
      { key: k('b'), firstCrossingNs: 10n, excess: 1n },
      { key: k('a'), firstCrossingNs: 10n, excess: 5n },
      { key: k('0'), firstCrossingNs: 10n, excess: 5n },
    ]);
    expect(r.map((x) => x.key.policySubjectId)).toEqual(['0', 'a', 'b', 'c']);
  });
});
