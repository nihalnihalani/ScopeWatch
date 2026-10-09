# ScopeWatch architecture artifacts

> **Current execution policy:** [Start now or anytime, with no build cutoff](../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Open [architecture.html](architecture.html) directly in a browser. It is an offline viewer with seven embedded SVGs, view tabs, fit/zoom and SVG/PNG/source links. No network dependency, account login or sponsor credential is required to view it. To serve it locally, run `python3 -m http.server 8769 --bind 127.0.0.1 --directory docs/architecture` from the repository root, then open `http://127.0.0.1:8769/architecture.html`. That optional server serves documentation only; it is not the proposed ScopeWatch application. The old research workspace's preview may occupy that port; choose another free port if needed.

- [Detailed architecture](ARCHITECTURE.md): components, trust boundaries, records, canonicalization, historical windows, approval/native policy action, verification/recovery, failure cases and event gates.
- [Independent devil's advocate review](ARCHITECTURE_REVIEW.md): severity-ranked attacks, corrected design defects, remaining account proofs and residual limitations.
- [Guild contracts](GUILD_CONTRACTS.md) and [ClickHouse contracts](CLICKHOUSE_CONTRACTS.md): fresh primary-source/API research and concrete proposals.
- [Source/capture ledger](RESEARCH_LEDGER.json): root references, hashes and specialist manifests.

| View | Editable source | SVG | PNG |
|---|---|---|---|
| System / trust boundaries | [Mermaid](diagrams/01-system.mmd) | [SVG](rendered/01-system.svg) | [PNG](rendered/01-system.png) |
| Execution / evidence / action | [Mermaid](diagrams/02-sequence.mmd) | [SVG](rendered/02-sequence.svg) | [PNG](rendered/02-sequence.png) |
| Evidence admission / analytics | [Mermaid](diagrams/03-evidence.mmd) | [SVG](rendered/03-evidence.svg) | [PNG](rendered/03-evidence.png) |
| Native identity / credential scope | [Mermaid](diagrams/04-identity.mmd) | [SVG](rendered/04-identity.svg) | [PNG](rendered/04-identity.png) |
| Action / recovery states | [Mermaid](diagrams/05-action-state.mmd) | [SVG](rendered/05-action-state.svg) | [PNG](rendered/05-action-state.png) |
| Deployment / secrets / permissions | [Mermaid](diagrams/06-deployment.mmd) | [SVG](rendered/06-deployment.svg) | [PNG](rendered/06-deployment.png) |
| Proof / sponsor contribution | [Mermaid](diagrams/07-claims-and-sponsors.mmd) | [SVG](rendered/07-claims-and-sponsors.svg) | [PNG](rendered/07-claims-and-sponsors.png) |

The overview connects stage boundaries for a compact layout. Exact call order, identity proof and result/evidence hops are expanded in the other six views and written contracts. Use zoom or an SVG viewer for small labels.

To regenerate, use [render-diagrams.cjs](render-diagrams.cjs) with a local Mermaid 11.12.0 browser bundle and Playwright module path:

```text
node render-diagrams.cjs /path/to/mermaid.min.js /path/to/playwright
```

This is a documentation renderer, not event application source. It renders the authored `.mmd` files, exports SVG/PNG, builds the self-contained viewer and checks its seven tabs and zoom controls. The runtime/diagram version is pinned for reproducibility; no claim of latest availability is made.

Validation separates three evidence classes: rendered diagram/UI checks; 19 saved offline algorithm contract checks including 1,000 randomized oracle comparisons; and **unperformed** live account/database/policy tests. The last class remains a build gate. No scanner finding, prompt influence, SQL benchmark or native enforcement result was produced by this research.
