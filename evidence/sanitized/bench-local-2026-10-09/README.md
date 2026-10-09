# Bench (SMALL-SCALE SMOKE) - REPLAY synthetic, local ClickHouse in docker (2026-10-09)

**Source class: REPLAY synthetic population. NOT native evidence, NOT ClickHouse Cloud, NOT containment latency, NOT a production SLA.**
Server: local docker `clickhouse/clickhouse-server:25.8` (digest pinned in `docker/clickhouse/compose.yaml`; image digest `sha256:0152dd51...ee77`), version 25.8.33.6; container limits 2 CPUs / ~2 GB RAM; client on Apple M4 Pro laptop, Node v25.2.1, sequential single client.

## What this is
One run of `npx tsx tools/bench.ts --units 20000 --conflict-units 3000 --anchors 12 --n 6 --extract-repeats 2`, started 2026-10-09T14:45:30Z, finished 14:45:44Z. It completed BEFORE the disk-full / Docker VM I/O failure (which occurred during the later full-scale attempt); all 244 issued query ids were found in `system.query_log` with no errors, so these results are not affected by that failure.

**The full-scale run (~1M raw versions, or the lead-capped <=300k) was NOT performed**: the Docker VM suffered input/output errors (host disk reached 100%), ClickHouse became unhealthy, and per the user's decision the benchmark was not retried. Treat this directory as a 20k-unit smoke measurement only. No scale claim follows.

## Population (declared, seeded: seed 20261009)
22,891 stored raw rows = 20,000 distinct canonical identities + 2,891 exact redelivery rows; 0 conflicts in the main generation. 8 manifests (2 workspaces x 2 credentials x 2 operations), 50 candidates (2 zero-event, 45 distinct allowances, min 1 / max 311), 16 anchors per manifest, tie groups up to 156 events per candidate-instant, boundary instants (t, t+600s, t+600s-1ns, effective_from, cutoff). Unit mix: ~36% selected ALLOW, DENY/ERROR ~25%, plus out-of-scope, other-subject, incomplete-session, unbound, pre-effective and post-cutoff traffic. Separate conflict generation: 3,000 units with 8 injected same-ID variants. Expected answers (anchors, counts at every anchor, current, peak, first crossing) were computed by `src/core/oracle.ts` before any query (digest in `results.json`).

## Results (n = timed samples after 2 warmups and 1 cold run per class; caches not dropped, so "cold" = first execution after insert only; ms; nearest-rank)
| class | n | client p50/p95 | server query_duration p50/p95 | read_rows p50 |
|---|---|---|---|---|
| conflict_check (a) | 6 | 54.5/63.9 | 50/57 | 22,891 |
| anchor_list (a) | 6 | 46.2/58.4 | 43/54 | 66,072 |
| anchor_all_candidates, one anchor (b) | 6 | 42.9/47.1 | 40/44 | 66,122 |
| procedure members: anchor_all_candidates | 128 | 43.1/145.9 | 40/134 | 66,122 |
| procedure (c): evaluateGeneration per manifest, 17 anchor evaluations (16 anchors + cutoff), 24-27 queries | 8 | 1343.6/1586.4 (p95 = max) | multi-query | |
| oracle_extract (d): 3 SELECTs | 2 | 87.3/114.4 | 46/51 | 22,891 |
| oracle_sweep (d) per manifest | 8 | 15.7/18.6 | in-process | |

Correctness: 63 checks, 0 failures (SQL equals declared oracle for anchors, per-anchor counts, current, peak, first crossing; conflict keys returned exactly as injected). Query log: 244 issued, 244 QueryFinish found, 0 missing, 0 duplicates, 0 exceptions.

## Limitations
Tiny n (p95 at n=8 is the maximum); small data; procedure wall time includes the in-process oracle equality check; allowances were derived from realized peaks (parameter selection only); query_duration_ms is integer milliseconds; failed queries (none occurred) would not have ids.
Files: `results.json` (full detail incl. per-sample rows), `results.csv` (template columns, one row per issued query/sample). No secrets (grep for password/secret: 0 hits).
