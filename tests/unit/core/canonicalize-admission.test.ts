import { describe, expect, it } from 'vitest';
import { canonicalize } from '../../../src/core/canonicalize.js';
import { assessReadiness, type AdmissionInput } from '../../../src/core/admission.js';
import { CRED, OP, T0, SEC, WS, build, key, manifestDoc, mkObs, registry, run } from './fixtures.js';

const G = 'g1';

describe('canonicalization (conflict-first)', () => {
  it('exact redelivery yields one fact; a new ID (retry) is a second fact', () => {
    const b = build(G, [{ id: 'e1', session: 's1', subject: 'a', at: T0, copies: 2 }, { id: 'e2', session: 's1', subject: 'a', at: T0 + SEC }], ['s1']);
    const c = canonicalize(b.observations);
    expect(b.observations).toHaveLength(3);
    expect(c.facts.map((f) => [f.nativeIdentityKey, f.copies])).toEqual([[key('e1'), 2], [key('e2'), 1]]);
    expect(c.conflicts).toEqual([]);
  });

  it.each([
    ['decision ALLOW -> DENY', { decision: 'DENY' as const }, 'decision'],
    ['session change', { session: 's2' }, 'sessionId'],
    ['time change by 1ns', { at: T0 + 1n }, 'createdAtNs'],
    ['credential change', { credential: 'other' }, 'credentialId'],
    ['operation change', { operation: 'other_op' }, 'operation'],
  ])('same-ID %s is a conflict, even when the changed copy would be filtered out', (_n, change, field) => {
    const base = mkObs(G, { id: 'e1', session: 's1', at: T0 });
    const copy = { ...mkObs(G, { id: 'e1', session: 's1', at: T0, copy: 2, ...change }) };
    // the changed copy is a DENY / other-operation / out-of-window row that a filter-first design would drop
    const c = canonicalize([base, copy]);
    expect(c.facts).toEqual([]);
    expect(c.conflicts).toHaveLength(1);
    expect(c.conflicts[0]?.differingFields).toContain(field);
  });

  it('NULL -> value for any semantic field is a conflict', () => {
    const a = mkObs(G, { id: 'e1', session: 's1', at: T0 });
    const b = { ...mkObs(G, { id: 'e1', session: 's1', at: T0, copy: 2 }), nativeTaskId: null };
    const c = canonicalize([a, b]);
    expect(c.conflicts[0]?.differingFields).toEqual(['nativeTaskId']);
  });

  it('delivery-only differences (observedAt, fetch/page ref, envelope hash, observation id) are ignored', () => {
    const a = mkObs(G, { id: 'e1', session: 's1', at: T0 });
    const b = { ...mkObs(G, { id: 'e1', session: 's1', at: T0, copy: 2 }), pageRef: 'other-page', observedAt: '2030-01-01T00:00:00Z', contentSha256: 'ff', fetchRecordId: 'zzz' };
    const c = canonicalize([a, b]);
    expect(c.conflicts).toEqual([]);
    expect(c.facts).toHaveLength(1);
  });

  it('NULL identity key is a gap, never silently dropped', () => {
    const a = { ...mkObs(G, { id: 'e1', session: 's1', at: T0 }), nativeIdentityKey: null };
    const c = canonicalize([a]);
    expect(c.nullKeyObservations).toHaveLength(1);
    expect(c.facts).toHaveLength(0);
  });

  it('is input-order independent', () => {
    const b = build(G, [...run('x', 'a', ['s1', 's2'], 6, T0, 5), { id: 'x-001', session: 's1', subject: 'a', at: T0, copies: 2 }].slice(0, 6), ['s1', 's2']);
    const fwd = canonicalize(b.observations);
    const rev = canonicalize([...b.observations].reverse());
    expect(rev.facts.map((f) => f.signature)).toEqual(fwd.facts.map((f) => f.signature));
  });
});

function input(over: Partial<AdmissionInput> = {}): AdmissionInput {
  const b = build(G, run('a', 'subj-a', ['s1', 's2'], 4, T0, 10), ['s1', 's2']);
  return {
    generationId: G, manifest: manifestDoc([['subj-a', 'A', '2'], ['subj-b', 'B', '9']]), identityDomainStatus: 'declared_fixture',
    registry: registry(['s1', 's2']), observations: b.observations, bindings: b.bindings, coverage: b.coverage, captureCutoff: '2026-10-09T12:09:00Z', ...over,
  };
}
const kinds = (i: AdmissionInput) => assessReadiness(i).gaps.map((g) => g.kind);

describe('admission / readiness', () => {
  it('a complete cohort with one verified binding per identity is ready (zero-event candidate B is fine)', () => {
    const r = assessReadiness(input());
    expect(r).toMatchObject({ ready: true, cohortSessions: 2, completeSessions: 2, canonicalKeys: 4, conflictKeys: 0 });
  });

  it('coverage comes from the REGISTRY: a registered session that was never collected is missing, not zero', () => {
    const r = assessReadiness(input({ registry: registry(['s1', 's2', 's3']) }));
    expect(r.ready).toBe(false);
    expect(r.gaps.find((g) => g.sessionId === 's3')?.kind).toBe('coverage_incomplete');
    expect(r.completeSessions).toBe(2);
  });

  it('open / failed / short-paged / field-gap sessions block readiness', () => {
    const base = input();
    for (const patch of [{ coverageState: 'open' as const }, { coverageState: 'failed' as const }, { fetchedPages: 0, expectedPages: 2 }, { requiredFieldGaps: 1 }]) {
      const cov = base.coverage.map((c, i) => (i === 0 ? { ...c, ...patch } : c));
      expect(assessReadiness({ ...base, coverage: cov }).ready, JSON.stringify(patch)).toBe(false);
    }
  });

  it('missing, unresolved, conflicting and duplicate bindings are distinct gaps', () => {
    const base = input();
    const first = base.bindings[0]!;
    expect(kinds({ ...base, bindings: base.bindings.slice(1) })).toContain('binding_missing');
    expect(kinds({ ...base, bindings: [{ ...first, bindingState: 'unresolved', policySubjectId: null }, ...base.bindings.slice(1)] })).toContain('binding_unresolved');
    expect(kinds({ ...base, bindings: [{ ...first, bindingState: 'conflict' }, ...base.bindings.slice(1)] })).toContain('binding_conflict');
    expect(kinds({ ...base, bindings: [...base.bindings, first] })).toContain('binding_conflict'); // exact duplicate mapping
    expect(kinds({ ...base, bindings: [...base.bindings, { ...first, policySubjectId: 'subj-b' }] })).toContain('binding_conflict'); // changed subject
  });

  it('a verified acting subject with no manifest allowance is allowance_missing (not an inner-join omission)', () => {
    const base = input();
    const bindings = base.bindings.map((b, i) => (i === 0 ? { ...b, policySubjectId: 'subj-unknown' } : b));
    const r = assessReadiness({ ...base, bindings });
    expect(r.gaps.find((g) => g.kind === 'allowance_missing')?.policySubjectId).toBe('subj-unknown');
  });

  it('a manifest with duplicate subject allowances is allowance_conflict', () => {
    const m = manifestDoc([['subj-a', 'A', '2'], ['subj-a', 'A2', '3']]);
    expect(kinds(input({ manifest: m }))).toContain('allowance_conflict');
  });

  it('unverified identity domain blocks admission; fixture declaration is accepted', () => {
    expect(kinds(input({ identityDomainStatus: 'unverified' }))).toContain('identity_missing');
    expect(assessReadiness(input({ identityDomainStatus: 'declared_fixture' })).ready).toBe(true);
  });

  it('identity conflicts are reported as conflicts, separate from missing-only gaps', () => {
    const base = input();
    const changed = { ...mkObs(G, { id: 'a-001', session: 's1', at: T0, decision: 'DENY', copy: 2 }) };
    const r = assessReadiness({ ...base, observations: [...base.observations, changed] });
    expect(r.conflictKeys).toBe(1);
    expect(r.gaps.map((g) => g.kind)).toContain('identity_conflict');
    expect(r.gaps.map((g) => g.kind)).not.toContain('coverage_incomplete');
  });

  it('required fields (decision, credential, operation, clock) missing make evidence incomplete', () => {
    const base = input();
    const obs = base.observations.map((o, i) => (i === 0 ? { ...o, decision: null, createdAtNs: null, createdAt: null } : o));
    const r = assessReadiness({ ...base, observations: obs });
    expect(r.gaps.some((g) => g.kind === 'required_field_missing' && g.detail.includes('decision'))).toBe(true);
  });

  it('observations from an unregistered session are flagged, not silently counted', () => {
    const base = input();
    const extra = mkObs(G, { id: 'zz', session: 'rogue', at: T0 });
    expect(kinds({ ...base, observations: [...base.observations, extra] })).toContain('coverage_incomplete');
  });

  it('manifest epoch ending before cutoff is out of the simple frozen-epoch contract', () => {
    const m = { ...manifestDoc([['subj-a', 'A', '2']]), effectiveUntil: '2026-10-09T12:05:00Z' };
    expect(kinds(input({ manifest: m }))).toContain('manifest_epoch');
  });

  it('createdAt text must agree with createdAtNs (clock_invalid)', () => {
    const base = input();
    const obs = base.observations.map((o, i) => (i === 0 ? { ...o, createdAt: '2026-10-09T13:00:00Z' } : o));
    expect(kinds({ ...base, observations: obs })).toContain('clock_invalid');
  });

  it('constants sanity: window and credential/operation come from the manifest', () => {
    expect(WS).toBe('ws-test');
    expect(CRED).toBe('cred-test');
    expect(OP).toBe('issues_get');
  });
});
