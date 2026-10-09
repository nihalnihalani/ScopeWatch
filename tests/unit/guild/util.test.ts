import { describe, expect, it } from 'vitest';
import { canonicalJson, makeRedactor, parseUtcNano } from '../../../src/integrations/guild/util.js';
import { GuildHttp } from '../../../src/integrations/guild/http.js';

describe('parseUtcNano', () => {
  it('keeps nanosecond precision exactly', () => {
    const p = parseUtcNano('2026-10-09T12:00:00.123456789Z');
    expect(p).toEqual({ text: '2026-10-09T12:00:00.123456789Z', ns: '1791547200123456789' });
  });
  it('does not round: adjacent nanos differ', () => {
    const a = parseUtcNano('2026-10-09T12:00:00.000000001Z')!;
    const b = parseUtcNano('2026-10-09T12:00:00.000000002Z')!;
    expect(BigInt(b.ns) - BigInt(a.ns)).toBe(1n);
  });
  it('normalizes +00:00 to Z and rejects non-UTC offsets and garbage', () => {
    expect(parseUtcNano('2026-10-09T12:00:00.5+00:00')?.text).toBe('2026-10-09T12:00:00.5Z');
    expect(parseUtcNano('2026-10-09T12:00:00+02:00')).toBeNull();
    expect(parseUtcNano('2026-02-30T12:00:00Z')).toBeNull();
    expect(parseUtcNano(null)).toBeNull();
    expect(parseUtcNano('yesterday')).toBeNull();
  });
});

describe('canonicalJson', () => {
  it('is key-order independent and drops undefined', () => {
    expect(canonicalJson({ b: 1, a: { d: [2, { y: 1, x: 2 }], c: undefined } })).toBe('{"a":{"d":[2,{"x":2,"y":1}]},"b":1}');
  });
});

describe('secret redaction', () => {
  const key = 'abc-id:supersecretvalue123';
  it('removes full key, secret part and base64 form', () => {
    const r = makeRedactor([key]);
    const b64 = Buffer.from(key).toString('base64');
    const out = r(`oops ${key} and ${b64} and supersecretvalue123 Authorization: Basic ${b64}`);
    expect(out).not.toContain('supersecretvalue123');
    expect(out).not.toContain(b64);
  });
  it('http client redacts secrets inside network error messages', async () => {
    const http = new GuildHttp({
      baseUrl: 'http://127.0.0.1:9',
      secrets: [key],
      getRetries: 0,
      fetchImpl: (async () => {
        throw new Error(`connect failed for ${key}`);
      }) as unknown as typeof fetch,
    });
    const r = await http.get('/x', { key });
    expect(r.ok).toBe(false);
    expect(r.message).not.toContain('supersecretvalue123');
    expect(r.message).toContain('[REDACTED]');
  });
  it('POST is never retried', async () => {
    let n = 0;
    const http = new GuildHttp({ baseUrl: 'http://127.0.0.1:9', getRetries: 3, backoffMs: 1, fetchImpl: (async () => { n++; throw new Error('boom'); }) as unknown as typeof fetch });
    await http.post('/x', { key: null, body: {} });
    expect(n).toBe(1);
    await http.get('/x', { key: null });
    expect(n).toBe(5);
  });
  it('classifies 404 as an access problem, never empty', async () => {
    const http = new GuildHttp({ baseUrl: 'http://127.0.0.1:9', fetchImpl: (async () => new Response('{"error":"nf"}', { status: 404 })) as unknown as typeof fetch });
    const r = await http.get('/x', { key: null });
    expect(r.failure).toBe('not_found');
    expect(r.accessProblem).toBe(true);
  });
});
