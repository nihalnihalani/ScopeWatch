/**
 * ScopeWatch application HTTP surface (NOT Guild routes). Loopback-only server:
 * exact Host allowlist on every request, exact Origin allowlist on every POST, HttpOnly SameSite=Strict session
 * cookie, synchronizer CSRF header, strict JSON body schemas (unknown fields rejected), ApiError envelopes.
 * The browser can never pass a subject, credential, session, SQL or command: scope is resolved from the journal.
 */
import Fastify, { type FastifyInstance, type FastifyReply, type FastifyRequest } from 'fastify';
import fastifyCookie from '@fastify/cookie';
import fastifyStatic from '@fastify/static';
import { createHash, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { ApiError, StatusReport, SessionInfo } from '../../shared/contracts.js';
import { CSRF_HEADER, SESSION_COOKIE } from '../../shared/api.js';
import type {
  GenerationSummary, ActionReviewBody, LoginBody, NativeReceiptBody, RecoveryCreateBody, RemovalReceiptBody, ReviewBody, VerifyBody,
} from '../../shared/api.js';
import { missingGuildSettings, type AppConfig } from '../config.js';
import { nowUtcNano } from '../../core/time.js';
import type { Services } from '../services/context.js';
import { HttpError, conflict, invalid, notFound } from '../services/errors.js';
import { buildCaseDetail, listSummaries } from '../services/cases.js';
import { createRecovery, recordNativeReceipt, recordRemovalReceipt, reviewCase, reviewRecovery, verifyAction } from '../services/actions.js';
import { investigateCase } from '../services/investigation.js';
import { exportCase } from '../services/export.js';
import { runCohortPipeline, runReplayPipeline } from '../services/pipeline.js';

const digest = (s: string) => createHash('sha256').update(s).digest();
const safeEq = (a: string, b: string) => timingSafeEqual(digest(a), digest(b));

interface Auth {
  sessionId: string;
  operator: string;
  csrf: string;
}
declare module 'fastify' {
  interface FastifyRequest {
    auth?: Auth;
  }
}

const str = (max: number, min = 0) => ({ type: 'string', minLength: min, maxLength: max }) as const;
const int = { type: 'integer', minimum: 0, maximum: 1_000_000 } as const;
const body = (props: Record<string, unknown>, required: string[]) => ({ type: 'object', properties: props, required, additionalProperties: false });
const nullableStr = (max: number) => ({ type: ['string', 'null'], maxLength: max });

const SCHEMAS = {
  login: body({ secret: str(256, 1) }, ['secret']),
  empty: body({}, []),
  replay: body({ seed: { type: 'string', pattern: '^[a-z0-9][a-z0-9-]{0,63}$' } }, []),
  investigate: body({ expectedRevision: int }, ['expectedRevision']),
  review: body({ expectedRevision: int, decision: { enum: ['approve', 'reject'] }, reason: str(500, 1) }, ['expectedRevision', 'decision', 'reason']),
  receipt: body(
    {
      expectedVersion: int,
      method: { enum: ['guild_ui', 'guild_cli_verified'] },
      nativeRuleId: nullableStr(200),
      observedSelectors: body(
        { credentialId: str(300), operation: str(200), policySubjectId: str(300), workspaceId: str(300), decision: str(30), resources: nullableStr(500) },
        ['credentialId', 'operation', 'policySubjectId', 'workspaceId', 'decision', 'resources'],
      ),
      appliedAt: str(40, 1),
      evidenceNote: str(1000),
    },
    ['expectedVersion', 'method', 'nativeRuleId', 'observedSelectors', 'appliedAt', 'evidenceNote'],
  ),
  verify: body({ expectedVersion: int }, ['expectedVersion']),
  recovery: body({ expectedVersion: int, reason: str(500, 1) }, ['expectedVersion', 'reason']),
  actionReview: body({ expectedVersion: int, decision: { enum: ['approve', 'reject'] }, reason: str(500, 1) }, ['expectedVersion', 'decision', 'reason']),
  removal: body(
    { expectedVersion: int, method: { enum: ['guild_ui', 'guild_cli_verified'] }, nativeRuleId: nullableStr(200), removedAt: str(40, 1), evidenceNote: str(1000) },
    ['expectedVersion', 'method', 'nativeRuleId', 'removedAt', 'evidenceNote'],
  ),
} as const;

export function modeLabel(config: AppConfig, svc: Services): string {
  if (config.mode === 'replay') return 'REPLAY: synthetic fixture, not native evidence';
  if (config.mode === 'contract_test') return 'CONTRACT TEST: mock Guild API, not native evidence';
  return svc.guild && svc.ch ? 'NATIVE' : 'NATIVE (UNCONFIGURED: no native evidence is available)';
}

export async function buildApp(config: AppConfig, svc: Services): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    bodyLimit: 64 * 1024,
    ajv: { customOptions: { removeAdditional: false, coerceTypes: false, useDefaults: false, allErrors: false } },
  });
  await app.register(fastifyCookie);
  const hosts = new Set(config.allowedOrigins.map((o) => new URL(o).host));
  const origins = new Set(config.allowedOrigins);
  const j = svc.journal;

  // treat an empty JSON body as {} so clients may POST with no payload
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, raw, done) => {
    const text = typeof raw === 'string' ? raw : raw.toString('utf8');
    if (text.trim() === '') return done(null, {});
    try {
      done(null, JSON.parse(text));
    } catch {
      done(new HttpError(422, 'invalid', 'request body is not valid JSON'), undefined);
    }
  });

  const PUBLIC = new Set(['GET /api/health', 'GET /api/session', 'POST /api/login']);
  const failures: number[] = [];

  app.addHook('onRequest', async (req: FastifyRequest) => {
    const host = req.headers.host ?? '';
    if (!hosts.has(host)) throw new HttpError(403, 'origin', 'Host header is not in the allowlist');
    const path = req.url.split('?')[0] as string;
    if (req.method === 'POST') {
      const origin = (req.headers.origin as string | undefined) ?? refererOrigin(req.headers.referer as string | undefined);
      if (!origin || !origins.has(origin)) throw new HttpError(403, 'origin', 'Origin is not in the allowlist');
    }
    if (!path.startsWith('/api/')) return;
    const sid = req.cookies[SESSION_COOKIE];
    const s = sid ? j.getOperatorSession(sid) : null;
    if (s && sid) req.auth = { sessionId: sid, operator: s.operator, csrf: s.csrf };
    if (PUBLIC.has(`${req.method} ${path}`)) return;
    if (!req.auth) throw new HttpError(401, 'unauthenticated', 'login required');
    if (req.method === 'POST') {
      const tok = req.headers[CSRF_HEADER];
      if (typeof tok !== 'string' || !safeEq(tok, req.auth.csrf)) throw new HttpError(403, 'csrf', 'missing or invalid CSRF token');
    }
  });

  app.setErrorHandler((err: Error & { validation?: unknown; statusCode?: number }, _req, reply) => {
    let status = 500;
    let out: ApiError = { error: 'internal error', code: 'internal' };
    if (err instanceof HttpError) {
      status = err.status;
      out = { error: err.message, code: err.code, ...(err.detail ? { detail: err.detail } : {}) };
    } else if (err.validation) {
      status = 422;
      out = { error: 'request body failed validation', code: 'invalid', detail: err.message.slice(0, 300) };
    } else if (err.statusCode && err.statusCode >= 400 && err.statusCode < 500) {
      status = err.statusCode === 400 ? 422 : err.statusCode;
      out = { error: 'bad request', code: 'invalid', detail: err.message.slice(0, 200) };
    } else {
      console.error(`[scopewatch] internal error: ${err.stack ?? err.message}`);
    }
    void reply.status(status).send(out);
  });

  const sessionInfo = (req: FastifyRequest): SessionInfo => ({
    authenticated: !!req.auth,
    operator: req.auth?.operator ?? null,
    csrfToken: req.auth?.csrf ?? null,
    mode: config.mode,
  });

  app.get('/api/health', async () => ({ ok: true as const }));
  app.get('/api/session', async (req) => sessionInfo(req));

  app.post<{ Body: LoginBody }>('/api/login', { schema: { body: SCHEMAS.login } }, async (req, reply) => {
    const now = Date.now();
    while (failures.length && (failures[0] as number) < now - 60_000) failures.shift();
    if (failures.length >= 10) throw new HttpError(429, 'unauthenticated', 'too many failed attempts; wait a minute');
    if (!safeEq(req.body.secret, config.operatorSecret)) {
      failures.push(now);
      throw new HttpError(401, 'unauthenticated', 'invalid operator secret');
    }
    const s = j.createOperatorSession(config.operatorName);
    void reply.setCookie(SESSION_COOKIE, s.sessionId, { httpOnly: true, sameSite: 'strict', path: '/', maxAge: 8 * 3600 });
    return { authenticated: true, operator: config.operatorName, csrfToken: s.csrf, mode: config.mode } satisfies SessionInfo;
  });

  app.post('/api/logout', { schema: { body: SCHEMAS.empty } }, async (req, reply) => {
    if (req.auth) j.deleteOperatorSession(req.auth.sessionId);
    void reply.clearCookie(SESSION_COOKIE, { path: '/' });
    return { authenticated: false, operator: null, csrfToken: null, mode: config.mode } satisfies SessionInfo;
  });

  let guildHealth: { at: number; value: StatusReport['guild'] } | null = null;
  app.get('/api/status', async (): Promise<StatusReport> => {
    const missing = missingGuildSettings(config.guild);
    let guild: StatusReport['guild'];
    if (config.mode === 'replay') guild = { status: 'unconfigured', baseUrl: null, detail: 'replay mode has no Guild access by design', missing: [] };
    else if (!svc.guild) guild = { status: 'unconfigured', baseUrl: config.guild.baseUrl, detail: 'Guild adapter not built; native collection unavailable', missing };
    else if (guildHealth && Date.now() - guildHealth.at < 15_000) guild = guildHealth.value;
    else {
      try {
        const h = await svc.guild.health();
        guild = { status: h.ok ? 'ok' : 'unavailable', baseUrl: config.guild.baseUrl, detail: h.detail, missing: h.missing };
      } catch (e) {
        guild = { status: 'error', baseUrl: config.guild.baseUrl, detail: (e as Error).message.slice(0, 200), missing };
      }
      guildHealth = { at: Date.now(), value: guild };
    }
    const t = j.lastTimes();
    const gates: StatusReport['nativeGates'] = [];
    if (config.mode === 'replay') gates.push({ gate: 'native evidence', status: 'pending', detail: 'replay mode cannot produce native evidence' });
    else {
      gates.push({ gate: 'guild credentials and installs', status: missing.length ? 'pending' : 'passed', detail: missing.length ? `missing: ${missing.join(', ')}` : 'all configured (presence only)' });
      gates.push({ gate: 'native identity domain', status: config.guild.identityDomain === 'unverified' ? 'pending' : 'passed', detail: config.guild.identityDomain });
      gates.push({ gate: 'pinned manifest', status: config.pinnedManifestPath ? 'passed' : 'pending', detail: config.pinnedManifestPath ? 'path configured' : 'PINNED_MANIFEST_PATH unset' });
    }
    gates.push({ gate: 'clickhouse', status: svc.chStatus.status === 'ok' ? 'passed' : 'pending', detail: svc.chStatus.detail });
    return {
      mode: config.mode,
      modeLabel: modeLabel(config, svc),
      serverTime: nowUtcNano(),
      clickhouse: { status: svc.chStatus.status === 'ok' ? 'ok' : svc.chStatus.status, target: config.clickhouse?.target ?? null, version: svc.ch?.serverVersion ?? null, detail: svc.chStatus.detail },
      guild,
      journal: { status: 'ok', path: config.sqlitePath, detail: `${config.mode} journal` },
      lastCaptureAt: t.lastCaptureAt,
      lastEvaluationAt: t.lastEvaluationAt,
      nativeGates: gates,
    };
  });

  app.get('/api/cases', async () => listSummaries(j));
  app.get<{ Params: { id: string } }>('/api/cases/:id', async (req) => buildCaseDetail(j, req.params.id));
  app.get<{ Params: { id: string } }>('/api/cases/:id/queries', async (req) => {
    const d = buildCaseDetail(j, req.params.id);
    return d.evaluation.queries;
  });
  app.get('/api/generations', async (): Promise<GenerationSummary[]> =>
    j.listGenerations().map(({ scenarioId: _s, identityDomainStatus: _i, createdAt: _c, ...generation }) => ({
      generation, readiness: j.getReadiness(generation.generationId), caseId: j.caseForGeneration(generation.generationId),
    })),
  );

  app.post<{ Body: { seed?: string } }>('/api/replay/run', { schema: { body: SCHEMAS.replay } }, async (req) => {
    if (config.mode !== 'replay') throw conflict('replay run is only available in replay mode');
    return runReplayPipeline(svc, req.body.seed);
  });
  app.post('/api/pipeline/run', { schema: { body: SCHEMAS.empty } }, async () => {
    if (config.mode === 'replay') throw conflict('pipeline run is not available in replay mode; use /api/replay/run');
    return runCohortPipeline(svc);
  });
  app.post<{ Params: { id: string }; Body: { expectedRevision: number } }>('/api/cases/:id/investigate', { schema: { body: SCHEMAS.investigate } }, async (req) =>
    investigateCase(svc, req.params.id, req.body.expectedRevision),
  );
  app.post<{ Params: { id: string }; Body: ReviewBody }>('/api/cases/:id/review', { schema: { body: SCHEMAS.review } }, async (req) =>
    reviewCase(svc, req.params.id, req.body, (req.auth as Auth).operator),
  );
  app.post<{ Params: { id: string }; Body: NativeReceiptBody }>('/api/actions/:id/native-receipt', { schema: { body: SCHEMAS.receipt } }, async (req) =>
    recordNativeReceipt(svc, req.params.id, req.body, (req.auth as Auth).operator),
  );
  app.post<{ Params: { id: string }; Body: VerifyBody }>('/api/actions/:id/verify', { schema: { body: SCHEMAS.verify } }, async (req) =>
    verifyAction(svc, req.params.id, req.body.expectedVersion, (req.auth as Auth).operator),
  );
  app.post<{ Params: { id: string }; Body: RecoveryCreateBody }>('/api/actions/:id/recovery', { schema: { body: SCHEMAS.recovery } }, async (req) =>
    createRecovery(svc, req.params.id, req.body.expectedVersion, req.body.reason, (req.auth as Auth).operator),
  );
  app.post<{ Params: { id: string }; Body: ActionReviewBody }>('/api/actions/:id/review', { schema: { body: SCHEMAS.actionReview } }, async (req) =>
    reviewRecovery(svc, req.params.id, req.body, (req.auth as Auth).operator),
  );
  app.post<{ Params: { id: string }; Body: RemovalReceiptBody }>('/api/actions/:id/removal-receipt', { schema: { body: SCHEMAS.removal } }, async (req) =>
    recordRemovalReceipt(svc, req.params.id, req.body, (req.auth as Auth).operator),
  );
  app.get<{ Params: { caseId: string } }>('/api/export/:caseId', async (req) => exportCase(svc, req.params.caseId));

  // static client + SPA fallback when a build exists
  const clientRoot = join(svc.rootDir, 'dist', 'client');
  if (existsSync(join(clientRoot, 'index.html'))) {
    await app.register(fastifyStatic, { root: clientRoot, wildcard: false });
    app.setNotFoundHandler((req: FastifyRequest, reply: FastifyReply) => {
      if (req.method === 'GET' && !req.url.startsWith('/api/')) return reply.sendFile('index.html');
      return reply.status(404).send({ error: 'not found', code: 'not_found' } satisfies ApiError);
    });
  } else {
    app.setNotFoundHandler((_req, reply) => reply.status(404).send({ error: 'not found', code: 'not_found' } satisfies ApiError));
  }
  void invalid;
  void notFound;
  return app;
}

function refererOrigin(ref: string | undefined): string | undefined {
  if (!ref) return undefined;
  try {
    return new URL(ref).origin;
  } catch {
    return undefined;
  }
}
