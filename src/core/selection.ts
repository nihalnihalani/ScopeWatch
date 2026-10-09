import type { CandidateKey } from '../shared/contracts.js';
import { cmp } from './hash.js';

export interface BreachRankInput {
  key: CandidateKey;
  firstCrossingNs: bigint;
  /** count - allowance at the first crossing */
  excess: bigint;
}

/** Declared application convention (not a severity score): first crossing ASC, excess DESC, then ids ASC. */
export function rankBreaches(items: BreachRankInput[]): BreachRankInput[] {
  return [...items].sort((a, b) => {
    if (a.firstCrossingNs !== b.firstCrossingNs) return a.firstCrossingNs < b.firstCrossingNs ? -1 : 1;
    if (a.excess !== b.excess) return a.excess > b.excess ? -1 : 1;
    return (
      cmp(a.key.workspaceId, b.key.workspaceId) ||
      cmp(a.key.policySubjectId, b.key.policySubjectId) ||
      cmp(a.key.credentialId, b.key.credentialId) ||
      cmp(a.key.operation, b.key.operation)
    );
  });
}
