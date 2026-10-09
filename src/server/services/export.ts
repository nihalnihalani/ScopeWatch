/** Sanitized read-only export. Never includes secrets, raw payloads or the operator history stream. */
import type { SanitizedExport } from '../../shared/contracts.js';
import { nowUtcNano } from '../../core/time.js';
import { buildCaseDetail } from './cases.js';
import type { Services } from './context.js';

export function exportCase(svc: Services, caseId: string): SanitizedExport {
  const d = buildCaseDetail(svc.journal, caseId);
  const prov = d.provenance;
  const limits = [
    'Counts cover a finite registered cohort at the recorded capture cutoff; native finality is not proved.',
    'Local journal CAS does not stop external admins or stale manual UI actions; native effects are operator-recorded and verified by fresh probes only.',
    'ClickHouse receipts name the executing server (local development server or Cloud) and are not latency claims for other targets.',
  ];
  if (prov === 'replay') limits.unshift('NOT NATIVE EVIDENCE: SYNTHETIC REPLAY FIXTURE declared by a seed file. No Guild account, session or policy decision is represented.');
  if (prov === 'contract_test') limits.unshift('NOT NATIVE EVIDENCE: CONTRACT TEST output from the adapter against a loopback mock Guild API. It exercises code paths only.');
  const { actions, ...rest } = d;
  return {
    schema: 'scopewatch.export/v1',
    exportedAt: nowUtcNano(),
    provenance: prov,
    limits,
    case: { ...rest, actions: actions.map(({ history: _h, ...a }) => a) },
    sourceClasses: {
      events_and_bindings: prov,
      manifest: prov,
      clickhouse_queries: prov,
      investigation: prov,
      verification_probes: prov,
      native_application_receipts: 'operator_recorded',
      case_workflow: 'application',
    },
  };
}
