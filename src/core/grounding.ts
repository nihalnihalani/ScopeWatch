/**
 * Grounding check of an investigator narrative against stored deterministic facts.
 * The narrative is untrusted text: only numbers tied to counting words and ID-shaped tokens are checked.
 * A narrative is "grounded" only if it states at least one checkable quantitative claim and all checks pass.
 */
import type { InvestigationClaimCheck } from '../shared/contracts.js';

export interface GroundingFacts {
  /** All integers that are legitimately stated by stored facts (counts, allowances, excess, window seconds ...). */
  numbers: Set<string>;
  /** All IDs legitimately stated by facts (subjects, sessions, identity keys, workspace, credential, operation). */
  ids: Set<string>;
  primaryCount: string;
  primaryAllowance: string;
  primarySubjectId: string;
}

const COUNT_WORD = /(\d[\d,]*)\s+(?:unique\s+|distinct\s+|native\s+)*(?:allow(?:ed)?(?:\s+\w+)?|approvals?|permission\w*|decisions?|events?|sessions?|calls?|reads?|records?|rows?|items?|issues?|files?|repos?|requests?|secrets?|tokens?|accounts?|users?|subjects?|agents?|identit(?:y|ies))/gi;
const ALLOWANCE = /(?:allowance|limit|budget|quota|cap)(?:\s+of|\s+is|\s+was|:)?\s+(\d[\d,]*)/gi;
const ID_LIKE = /\b[A-Za-z][A-Za-z0-9]*(?:[-_:][A-Za-z0-9]+){1,}\b/g;

export function checkNarrative(narrative: string, facts: GroundingFacts): { grounded: boolean; checks: InvestigationClaimCheck[] } {
  const checks: InvestigationClaimCheck[] = [];
  const seen = new Set<string>();
  const push = (c: InvestigationClaimCheck) => {
    const k = `${c.claim}|${c.expected}`;
    if (!seen.has(k)) {
      seen.add(k);
      checks.push(c);
    }
  };
  for (const re of [COUNT_WORD, ALLOWANCE]) {
    re.lastIndex = 0;
    for (let m = re.exec(narrative); m; m = re.exec(narrative)) {
      const n = (m[1] as string).replace(/,/g, '');
      const ok = facts.numbers.has(n);
      push({ claim: `quantity ${n} ("${m[0].trim()}")`, expected: ok ? n : `one of stored numbers`, found: n, ok });
    }
  }
  ID_LIKE.lastIndex = 0;
  for (let m = ID_LIKE.exec(narrative); m; m = ID_LIKE.exec(narrative)) {
    const id = m[0];
    // skip plain hyphenated English words (no digit and short) to avoid false failures
    if (!/\d/.test(id) && !facts.ids.has(id) && id.length < 12) continue;
    const ok = facts.ids.has(id);
    push({ claim: `identifier ${id}`, expected: ok ? id : 'identifier present in stored facts', found: id, ok });
  }
  const mentionsPrimary = narrative.includes(facts.primarySubjectId);
  push({
    claim: 'narrative names the primary subject from stored facts',
    expected: facts.primarySubjectId,
    found: mentionsPrimary ? facts.primarySubjectId : null,
    ok: mentionsPrimary,
  });
  const states = narrative.includes(facts.primaryCount);
  push({ claim: 'narrative states the stored primary count', expected: facts.primaryCount, found: states ? facts.primaryCount : null, ok: states });
  return { grounded: checks.length > 0 && checks.every((c) => c.ok), checks };
}
