/** Headless replay: declared synthetic seed -> journal -> seal -> publish -> readback -> all-anchor SQL -> oracle -> case. */
import { loadConfig } from '../src/server/config.js';
import { loadLocalEnv } from '../src/server/services/envfile.js';
import { buildServices, closeServices } from '../src/server/services/bootstrap.js';
import { runReplayPipeline } from '../src/server/services/pipeline.js';
import { buildCaseDetail } from '../src/server/services/cases.js';

async function main(): Promise<void> {
  loadLocalEnv('runtime/clickhouse-local.env');
  const seed = process.argv[2] ?? 'harbordesk-v1';
  const config = loadConfig({ ...process.env, SCOPEWATCH_MODE: 'replay' });
  const svc = await buildServices(config);
  try {
    console.log(`REPLAY (synthetic fixture, NOT native evidence) seed=${seed}`);
    console.log(`clickhouse: ${svc.chStatus.status} - ${svc.chStatus.detail}`);
    const r = await runReplayPipeline(svc, seed);
    console.log(`pipeline: state=${r.state} case=${r.caseId} gaps=${r.readinessGaps}\n  ${r.detail}`);
    if (!r.caseId) process.exitCode = 1;
    else {
      const d = buildCaseDetail(svc.journal, r.caseId);
      console.log(`generation ${d.generation.generationId} state=${d.generation.state} raw=${d.generation.rawCount} canonical=${d.generation.canonicalKeyCount}`);
      console.log(`readback ok=${d.generation.readback?.ok} components=${JSON.stringify(d.generation.readback?.components)}`);
      console.log(`manifest sha256 ${d.manifest.sha256}`);
      console.log(`anchors evaluated: ${d.evaluation.anchors.length}; queries executed: ${d.evaluation.queries.length}; oracle agrees: ${d.evaluation.oracleAgrees}`);
      const q0 = d.evaluation.queries[0];
      console.log(`server: ${q0?.target} ${q0?.serverVersion} db=${q0?.database}`);
      for (const c of d.candidates) {
        console.log(`  ${c.displayLabel}: allowance=${c.allowance} peak=${c.peakCount} current=${c.currentCount} breached=${c.breached}${c.firstCrossing ? ` firstCrossing=${c.firstCrossing.anchor} count=${c.firstCrossing.count} sessions=${c.firstCrossing.sessions.length} queryId=${c.firstCrossing.queryId}` : ''}`);
      }
      console.log(`primary: ${d.primaryLabel ?? 'none'}; action blocked: ${d.actionBlockedReason}`);
      console.log(`sample query receipts:`);
      for (const q of d.evaluation.queries.filter((x) => x.queryClass !== 'anchor_all_candidates').slice(0, 4).concat(d.evaluation.queries.filter((x) => x.queryClass === 'anchor_all_candidates').slice(0, 2))) {
        console.log(`  ${q.queryClass} id=${q.queryId} rows=${q.rowCount} clientMs=${q.clientMs} serverMs=${q.serverMs} sql=${q.sqlSha256.slice(0, 12)}`);
      }
    }
  } finally {
    await closeServices(svc);
  }
}

main().catch((e) => {
  console.error(`replay failed: ${(e as Error).stack ?? e}`);
  process.exit(1);
});
