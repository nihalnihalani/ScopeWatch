import type { ManifestDocument, PinnedManifest, Provenance } from '../shared/contracts.js';
import { WINDOW_SECONDS } from '../shared/contracts.js';
import { sha256Hex } from './hash.js';
import { nowUtcNano, parseUtcNano } from './time.js';

export class ManifestError extends Error {}

/** Validate a parsed manifest document. Throws ManifestError with every problem listed. */
export function validateManifestDocument(doc: ManifestDocument): void {
  const problems: string[] = [];
  if (doc.schema !== 'scopewatch.manifest/v1') problems.push('schema must be scopewatch.manifest/v1');
  for (const f of ['policyVersion', 'workspaceId', 'credentialId', 'operation', 'unit', 'clock', 'subjectIdDomain'] as const) {
    if (typeof doc[f] !== 'string' || doc[f] === '') problems.push(`${f} required`);
  }
  if (doc.identityDomain !== 'workspace' && doc.identityDomain !== 'session') problems.push('identityDomain must be workspace|session');
  if (doc.windowSeconds !== WINDOW_SECONDS) problems.push(`windowSeconds must be ${WINDOW_SECONDS}`);
  let from: bigint | null = null;
  try {
    from = parseUtcNano(doc.effectiveFrom);
  } catch {
    problems.push('effectiveFrom must be strict UTC text');
  }
  if (doc.effectiveUntil !== null) {
    try {
      const until = parseUtcNano(doc.effectiveUntil);
      if (from !== null && until <= from) problems.push('effectiveUntil must be after effectiveFrom');
    } catch {
      problems.push('effectiveUntil must be strict UTC text or null');
    }
  }
  if (!Array.isArray(doc.allowances) || doc.allowances.length === 0) problems.push('at least one allowance required');
  const seen = new Set<string>();
  for (const a of doc.allowances ?? []) {
    if (!a.policySubjectId) problems.push('allowance policySubjectId required');
    if (seen.has(a.policySubjectId)) problems.push(`duplicate allowance for subject ${a.policySubjectId}`);
    seen.add(a.policySubjectId);
    if (!/^(0|[1-9]\d{0,18})$/.test(a.maxUniqueAllowDecisions)) problems.push(`allowance for ${a.policySubjectId} must be an exact non-negative integer string`);
    if (!a.approvalRef) problems.push(`allowance for ${a.policySubjectId} needs approvalRef`);
  }
  if (problems.length) throw new ManifestError(problems.join('; '));
}

/**
 * Pin a manifest from its EXACT bytes. The sha256 lives in this external wrapper, never inside the document.
 */
export function pinManifest(args: {
  bytes: Uint8Array;
  manifestId: string;
  provenance: Provenance;
  immutableRef: string;
  approvedBy: string;
}): PinnedManifest {
  let doc: ManifestDocument;
  try {
    doc = JSON.parse(Buffer.from(args.bytes).toString('utf8')) as ManifestDocument;
  } catch (e) {
    throw new ManifestError(`manifest is not valid JSON: ${(e as Error).message}`);
  }
  validateManifestDocument(doc);
  return {
    manifestId: args.manifestId,
    provenance: args.provenance,
    immutableRef: args.immutableRef,
    sha256: sha256Hex(args.bytes),
    byteLength: args.bytes.byteLength,
    document: doc,
    pinnedAt: nowUtcNano(),
    approvedBy: args.approvedBy,
  };
}

export interface CandidateDef {
  workspaceId: string;
  policySubjectId: string;
  credentialId: string;
  operation: string;
  displayLabel: string;
  allowance: bigint;
}

export function candidatesOf(doc: ManifestDocument): CandidateDef[] {
  return doc.allowances.map((a) => ({
    workspaceId: doc.workspaceId,
    policySubjectId: a.policySubjectId,
    credentialId: doc.credentialId,
    operation: doc.operation,
    displayLabel: a.displayLabel,
    allowance: BigInt(a.maxUniqueAllowDecisions),
  }));
}
