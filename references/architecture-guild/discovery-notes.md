# Discovery notes

Research date: 2026-10-09.

1. Developer search was performed first for exact Guild launch/auth/event/policy contracts, and separately for policy mutation endpoints. Results were non-authoritative for the exact contract; adjacent marketing/general docs were not promoted into endpoint claims. Captures: developer-contracts.json and developer-policy-mutation.json.
2. Official-domain discovery: search-policy-auth.json returned credentials/integration/CLI pages. Results used for official navigation; partial feedback was sent once with valuable credentials source and missing policy/auth contracts.
3. Official-domain event/task discovery query returned `No results found.` CLI wrote no search result file; no stale file or empty search ID was used for feedback. Query: site:docs.guild.ai session security events credentials_id TaskAgent agent workspaces:read agents:read.
4. Existing repository docs/llms capture located targeted official docs and OpenAPI. New captures were saved here, not copied from prior results.
5. Exact contracts were selectively extracted with Firecrawl; *.md schema URLs and *-fresh captures requested max-age 0. Initial rendered JSON outputs used default cache behavior; metadata preserves returned cache dates/states.
6. public-openapi-raw.json retrieved exact YAML using rawHtml format; public-openapi.yaml preserves those raw bytes as text; public-endpoints.json is a parsed derivative. public-openapi.md is Markdown-transformed and is not the parsing source.
7. No runtime account authentication/operations were performed.
