/**
 * Fetch-based Guild public API client. HTTP Basic with "id:secret" keys. Idempotent GETs retry with
 * bounded backoff; POST is NEVER retried (an ambiguous launch is reported, not repeated).
 * All error text is redacted before it leaves this module.
 */
import { isRecord, makeRedactor, sleep, type Redactor } from './util.js';

export type HttpFailureKind =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'server_error'
  | 'client_error'
  | 'timeout'
  | 'network'
  | 'bad_json';

export interface HttpResult {
  ok: boolean;
  status: number | null;
  body: unknown;
  failure: HttpFailureKind | null;
  /** Redacted, human-readable. */
  message: string;
  /** 401/403/404: hidden/restricted workspace or missing scope. NEVER interpret as an empty result. */
  accessProblem: boolean;
  attempts: number;
}

export interface HttpOptions {
  baseUrl: string;
  timeoutMs?: number;
  getRetries?: number;
  backoffMs?: number;
  /** Secrets to redact from all error text. */
  secrets?: Array<string | null | undefined>;
  fetchImpl?: typeof fetch;
}

export interface RequestOptions {
  /** "id:secret". Passed per request so trigger and collector lanes never mix. */
  key: string | null;
  query?: Record<string, string | number | boolean | null | undefined>;
  body?: unknown;
  timeoutMs?: number;
}

export class GuildHttp {
  private readonly base: string;
  private readonly timeoutMs: number;
  private readonly getRetries: number;
  private readonly backoffMs: number;
  readonly redact: Redactor;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: HttpOptions) {
    const b = opts.baseUrl.replace(/\/+$/, '');
    this.base = /\/v1$/.test(b) ? b : `${b}/v1`;
    this.timeoutMs = opts.timeoutMs ?? 15_000;
    this.getRetries = opts.getRetries ?? 3;
    this.backoffMs = opts.backoffMs ?? 200;
    this.redact = makeRedactor(opts.secrets ?? []);
    this.fetchImpl = opts.fetchImpl ?? fetch;
  }

  get baseUrl(): string {
    return this.base;
  }

  get(path: string, o: RequestOptions): Promise<HttpResult> {
    return this.run('GET', path, o);
  }

  /** Not retried under any circumstance. */
  post(path: string, o: RequestOptions): Promise<HttpResult> {
    return this.run('POST', path, o);
  }

  private async run(method: 'GET' | 'POST', path: string, o: RequestOptions): Promise<HttpResult> {
    const max = method === 'GET' ? this.getRetries + 1 : 1;
    let last: HttpResult | null = null;
    for (let attempt = 1; attempt <= max; attempt++) {
      last = await this.once(method, path, o, attempt);
      if (last.ok) return last;
      const retryable = last.failure === 'timeout' || last.failure === 'network' || last.failure === 'server_error' || last.status === 429;
      if (!retryable || attempt === max) return last;
      await sleep(this.backoffMs * 2 ** (attempt - 1));
    }
    return last as HttpResult;
  }

  private async once(method: 'GET' | 'POST', path: string, o: RequestOptions, attempts: number): Promise<HttpResult> {
    const url = new URL(this.base + path);
    for (const [k, v] of Object.entries(o.query ?? {})) {
      if (v !== null && v !== undefined) url.searchParams.set(k, String(v));
    }
    const headers: Record<string, string> = { accept: 'application/json' };
    if (o.key) headers.authorization = `Basic ${Buffer.from(o.key, 'utf8').toString('base64')}`;
    let body: string | undefined;
    if (o.body !== undefined) {
      headers['content-type'] = 'application/json';
      body = JSON.stringify(o.body);
    }
    const ac = new AbortController();
    const timer = setTimeout(() => ac.abort(), o.timeoutMs ?? this.timeoutMs);
    try {
      const res = await this.fetchImpl(url, { method, headers, body, signal: ac.signal, redirect: 'error' });
      const text = await res.text();
      let json: unknown = null;
      let badJson = false;
      if (text.length > 0) {
        try {
          json = JSON.parse(text);
        } catch {
          badJson = true;
        }
      }
      if (res.ok) {
        if (badJson) return this.fail(res.status, 'bad_json', 'response was not valid JSON', attempts, null);
        return { ok: true, status: res.status, body: json, failure: null, message: 'ok', accessProblem: false, attempts };
      }
      return this.classify(res.status, json, attempts, method, path);
    } catch (e) {
      const aborted = e instanceof Error && (e.name === 'AbortError' || ac.signal.aborted);
      const msg = e instanceof Error ? e.message : String(e);
      return this.fail(null, aborted ? 'timeout' : 'network', aborted ? 'request timed out' : `network error: ${msg}`, attempts, null);
    } finally {
      clearTimeout(timer);
    }
  }

  private classify(status: number, json: unknown, attempts: number, method: string, path: string): HttpResult {
    const vendor = isRecord(json) ? String(json.message ?? json.error ?? '') : '';
    const tail = vendor ? `: ${vendor.slice(0, 200)}` : '';
    if (status === 401) return this.fail(status, 'unauthorized', `401 unauthorized (key invalid or expired)${tail}`, attempts, true);
    if (status === 403) return this.fail(status, 'forbidden', `403 forbidden (missing scope or not workspace owner)${tail}`, attempts, true);
    if (status === 404) {
      return this.fail(
        status,
        'not_found',
        `404 not found: hidden/restricted workspace or missing resource; treated as an ACCESS problem, never as an empty result${tail}`,
        attempts,
        true,
      );
    }
    if (status >= 500) {
      const hint = method === 'GET' && /\/(events|tasks)$/.test(path) ? ' (documented: 500 here usually means the key lacks agents:read)' : '';
      return this.fail(status, 'server_error', `${status} server error${hint}${tail}`, attempts, false);
    }
    return this.fail(status, 'client_error', `${status} client error${tail}`, attempts, false);
  }

  private fail(status: number | null, failure: HttpFailureKind, message: string, attempts: number, access: boolean | null): HttpResult {
    return {
      ok: false,
      status,
      body: null,
      failure,
      message: this.redact(message),
      accessProblem: access ?? false,
      attempts,
    };
  }
}
