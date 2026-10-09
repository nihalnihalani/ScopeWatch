import type { CaseDetail, Provenance } from '../../shared/contracts.js';
import { GLYPH, labelOf, latestAction, type Tone } from '../format.js';

type StepKind = 'done' | 'current' | 'todo' | 'na';
interface Step {
  key: string;
  name: string;
  text: string;
  tone: Tone;
  kind: StepKind;
  human?: boolean;
}

const OBSERVED_OR_LATER = new Set(['native_application_observed', 'verification_pending', 'verification_failed', 'verification_unknown', 'restriction_verified', 'simulated_restriction_observed']);
const NOT_ELIGIBLE: Record<Provenance, string> = { native: '', replay: 'Not eligible (replay)', contract_test: '' };

/**
 * Where the case is in the workflow, derived only from the record (evidence, investigation, actions).
 * A step reads "done" only when the record says so; non-native outcomes are always prefixed "Simulated".
 */
export function deriveSteps(detail: CaseDetail): Step[] {
  const prov = detail.provenance;
  const native = prov === 'native';
  const replay = prov === 'replay';
  const restr = latestAction(detail, 'restriction');
  const rec = latestAction(detail, 'recovery');
  const inv = detail.investigation;
  const rs = restr?.state ?? null;
  const ev = detail.evidenceState;
  const where = replay ? ' (replay fixture)' : native ? '' : ' (contract-test mock)';

  const detect: Step = detail.primary
    ? { key: 'detect', name: 'Detect', text: `Breach found${where}`, tone: native ? 'ok' : 'sim', kind: 'done' }
    : ev === 'no_breach'
      ? { key: 'detect', name: 'Detect', text: 'No breach in evaluated window', tone: 'neutral', kind: 'done' }
      : { key: 'detect', name: 'Detect', text: 'No subject selected', tone: 'warn', kind: 'current' };

  const evidence: Step =
    ev === 'review_ready' ? { key: 'evidence', name: 'Evidence admitted', text: `Complete${where}`, tone: native ? 'ok' : 'sim', kind: 'done' }
    : ev === 'evidence_disputed' ? { key: 'evidence', name: 'Evidence admitted', text: 'Disputed (conflict)', tone: 'bad', kind: 'current' }
    : ev === 'evidence_incomplete' ? { key: 'evidence', name: 'Evidence admitted', text: 'Incomplete (unknown, not zero)', tone: 'warn', kind: 'current' }
    : ev === 'no_breach' ? { key: 'evidence', name: 'Evidence admitted', text: 'Complete, no breach', tone: 'neutral', kind: 'done' }
    : { key: 'evidence', name: 'Evidence admitted', text: 'Pending', tone: 'warn', kind: 'current' };

  let investigate: Step;
  if (replay) investigate = { key: 'investigate', name: 'Investigate', text: 'Unavailable (replay)', tone: 'neutral', kind: 'na' };
  else if (inv?.state === 'created') investigate = { key: 'investigate', name: 'Investigate', text: native ? 'Receipt recorded' : 'Simulated mock text (not evidence)', tone: native ? 'ok' : 'sim', kind: 'done' };
  else if (inv && (inv.state === 'failed' || inv.state === 'create_unknown')) investigate = { key: 'investigate', name: 'Investigate', text: inv.state === 'failed' ? 'Failed' : 'Outcome unknown', tone: 'warn', kind: 'current' };
  else if (inv?.state === 'running') investigate = { key: 'investigate', name: 'Investigate', text: 'Running', tone: 'info', kind: 'current' };
  else investigate = { key: 'investigate', name: 'Investigate', text: ev === 'review_ready' ? 'Optional, not started' : 'Not started', tone: 'neutral', kind: 'todo' };

  const evReady = ev === 'review_ready' && !replay;
  let review: Step;
  if (replay) review = { key: 'review', name: 'Review & approve', text: NOT_ELIGIBLE.replay, tone: 'neutral', kind: 'na' };
  else if (!restr) review = { key: 'review', name: 'Review & approve', text: evReady ? 'Awaiting operator review' : 'Blocked: evidence not ready', tone: evReady ? 'info' : 'warn', kind: evReady ? 'current' : 'todo' };
  else if (rs === 'review_ready') review = { key: 'review', name: 'Review & approve', text: 'Awaiting operator decision', tone: 'info', kind: 'current' };
  else if (rs === 'rejected') review = { key: 'review', name: 'Review & approve', text: 'Rejected', tone: 'warn', kind: 'current' };
  else if (rs === 'stale') review = { key: 'review', name: 'Review & approve', text: 'Approval stale; review again', tone: 'bad', kind: 'current' };
  else review = { key: 'review', name: 'Review & approve', text: `Scope approved${native ? '' : ' (contract test)'}`, tone: native ? 'ok' : 'sim', kind: 'done' };

  let apply: Step;
  const applyBase = { key: 'apply', name: 'Apply in Guild', human: true };
  if (replay) apply = { ...applyBase, text: NOT_ELIGIBLE.replay, tone: 'neutral', kind: 'na' };
  else if (!restr || rs === 'review_ready' || rs === 'rejected') apply = { ...applyBase, text: 'Not started', tone: 'neutral', kind: 'todo' };
  else if (rs === 'approved' || rs === 'native_application_pending') apply = { ...applyBase, text: 'Waiting for a human to apply the rule', tone: 'info', kind: 'current' };
  else if (rs === 'stale') apply = { ...applyBase, text: 'Approval stale', tone: 'bad', kind: 'todo' };
  else if (rs === 'native_application_unknown') apply = { ...applyBase, text: 'Native outcome unknown', tone: 'warn', kind: 'current' };
  else if (rs === 'scope_mismatch' || rs === 'disputed_stale_application' || rs === 'disputed') apply = { ...applyBase, text: labelOf(rs), tone: 'bad', kind: 'current' };
  else if (rs && OBSERVED_OR_LATER.has(rs)) apply = { ...applyBase, text: native ? 'Operator recorded a rule (unverified)' : 'Simulated rule recorded (mock)', tone: native ? 'ok' : 'sim', kind: 'done' };
  else apply = { ...applyBase, text: 'Not started', tone: 'neutral', kind: 'todo' };

  let verify: Step;
  if (replay) verify = { key: 'verify', name: 'Verify', text: NOT_ELIGIBLE.replay, tone: 'neutral', kind: 'na' };
  else if (rs === 'restriction_verified') verify = { key: 'verify', name: 'Verify', text: 'Verified (target refused, control inspected)', tone: 'ok', kind: 'done' };
  else if (rs === 'simulated_restriction_observed') verify = { key: 'verify', name: 'Verify', text: 'Simulated refusal observed (not evidence)', tone: 'sim', kind: 'done' };
  else if (rs === 'verification_failed') verify = { key: 'verify', name: 'Verify', text: 'Failed', tone: 'bad', kind: 'current' };
  else if (rs === 'verification_unknown') verify = { key: 'verify', name: 'Verify', text: 'Unknown (unproven)', tone: 'warn', kind: 'current' };
  else if (rs === 'verification_pending') verify = { key: 'verify', name: 'Verify', text: 'Fresh probes running', tone: 'info', kind: 'current' };
  else if (rs === 'native_application_observed') verify = { key: 'verify', name: 'Verify', text: 'Ready to verify', tone: 'info', kind: 'current' };
  else verify = { key: 'verify', name: 'Verify', text: 'Not started', tone: 'neutral', kind: 'todo' };

  const rcs = rec?.state ?? null;
  let recover: Step;
  const recBase = { key: 'recover', name: 'Recover' };
  if (replay) recover = { ...recBase, text: NOT_ELIGIBLE.replay, tone: 'neutral', kind: 'na' };
  else if (!rec) recover = { ...recBase, text: 'Not started (separate review)', tone: 'neutral', kind: 'todo' };
  else if (rcs === 'recovered') recover = { ...recBase, text: 'Recovered (target and control succeeded)', tone: 'ok', kind: 'done' };
  else if (rcs === 'simulated_recovered') recover = { ...recBase, text: 'Simulated recovery (not evidence)', tone: 'sim', kind: 'done' };
  else if (rcs === 'recovery_failed') recover = { ...recBase, text: 'Verification failed', tone: 'bad', kind: 'current' };
  else if (rcs === 'recovery_unknown') recover = { ...recBase, text: 'Unknown', tone: 'warn', kind: 'current' };
  else if (rcs === 'removal_observed') recover = { ...recBase, text: 'Removal recorded, unverified', tone: 'info', kind: 'current' };
  else if (rcs === 'approved') recover = { ...recBase, text: 'Waiting for human removal in Guild', tone: 'info', kind: 'current' };
  else if (rcs === 'review_ready') recover = { ...recBase, text: 'Awaiting recovery review', tone: 'info', kind: 'current' };
  else recover = { ...recBase, text: labelOf(rcs ?? 'none'), tone: 'neutral', kind: 'current' };

  return [detect, evidence, investigate, review, apply, verify, recover];
}

export function WorkflowStepper({ detail }: { detail: CaseDetail }) {
  const steps = deriveSteps(detail);
  return (
    <section className="stepper-wrap" aria-label="Workflow position">
      <ol className="stepper">
        {steps.map((s, i) => (
          <li key={s.key} className={`step step--${s.kind} tone-step-${s.tone}`} data-step={s.key} aria-current={s.kind === 'current' ? 'step' : undefined}>
            <span className="step-head">
              <span className="step-no" aria-hidden="true">{GLYPH[s.tone]}</span>
              <span className="step-name">{i + 1}. {s.name}</span>
            </span>
            <span className="step-text">{s.text}</span>
            {s.human ? <span className="step-human">human, in Guild UI</span> : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
