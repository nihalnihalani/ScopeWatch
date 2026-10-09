import type { ApiError } from '../../shared/contracts.js';

export class HttpError extends Error {
  constructor(
    readonly status: number,
    readonly code: ApiError['code'],
    message: string,
    readonly detail?: string,
  ) {
    super(message);
  }
}

export const notFound = (what: string) => new HttpError(404, 'not_found', `${what} not found`);
export const invalid = (msg: string) => new HttpError(422, 'invalid', msg);
export const notEligible = (msg: string) => new HttpError(409, 'not_eligible', msg);
export const staleRevision = (msg: string) => new HttpError(409, 'stale_revision', msg);
export const conflict = (msg: string) => new HttpError(409, 'conflict', msg);
export const unavailable = (msg: string) => new HttpError(503, 'dependency_unavailable', msg);
