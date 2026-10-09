# EARWITNESS: whole-project deep dive

> **Current execution policy:** [Start now or anytime, with no build cutoff](../../event/BUILD_AUTHORIZATION.md). The human reports that the event is already underway and public schedules are stale. Older start/deadline/duration advice below is superseded; historical timestamps and analytics windows remain evidence, not build gates.

Round-1 file: [`analysis/clickhouse/earwitness.md`](../archive/source-tree/analysis/clickhouse/earwitness.md). Repo: `repos/clickhouse/earwitness` (https://github.com/gorajing/earwitness). All line refs are against the cloned HEAD `8337471`.

Legend: **[V]** = verified at file:line (or git/command output). **[I]** = inference.

---

## 1. At a glance

EARWITNESS is an "autonomous airplay-royalty auditor". A seeded fake radio station "airs" a clip every 20 s and posts a claim (title / artist / license). A verifier loop ignores the text, fingerprints the actual audio with librosa chroma cross-correlation (searching ±2 semitones to catch pitch-shift disguises) against a reference catalog, and derives a verdict **deterministically**. An LLM (Pioneer, `Qwen/Qwen3-32B`) only writes the narrative. Verified plays pay the artist $0.01 USDC on-chain; discrepancies are withheld. Every cycle becomes a public Langfuse trace, a ClickHouse row, a cited-markdown ledger row (Senso) and a generative-UI card (OpenUI). Other agents can buy the verification packet for $0.01 through x402. It is aimed at hackathon judges and, notionally, at labels and rights-holders. Pitch: *"Playlists lie. The signal doesn't."* (`README.md:11`) [V].

Award: it carries the structured badge under **Best Use of ClickHouse** at the Harness Engineering Hack (12 Jun 2026). The README claims "**Best use of Langfuse**" (`README.md:3`) [V]. That fits the Langfuse $500 sub-slot inside the ClickHouse prize, as round 1 established. **Reading for us: this prize was won on LLM observability depth (Langfuse), not ClickHouse depth.** [I, high confidence]

---

## 2. Repo map

```
earwitness/                         repo root (single author: Jin Choi)
├── earwitness/                     the agent service (Python 3.12, FastAPI) — 1,743 lines
│   ├── __init__.py        48   ClearancePacket / EvidenceLine dataclasses ("frozen contract")
│   ├── app.py            208   FastAPI app, lifespan starts 2 asyncio loops, all REST routes
│   ├── station.py        220   seeded broadcast loop, claims JSONL + Airtable dual-write, afplay
│   ├── evidence.py       147   DSP core: chroma xcorr fingerprint, ±2 st search, spectral stats
│   ├── verdict.py        233   deterministic verdict + Pioneer LLM narrative + Langfuse trace
│   ├── payout.py          89   USDC payout: CDP SDK (Base Sepolia) or `awal` CLI (Base mainnet)
│   ├── events.py         127   ClickHouse client-per-thread, inserts, dashboard/autonomy queries
│   ├── clickhouse_events.py 86 DDL `ensure_schema()` + smoke helpers (only used by smoke script)
│   ├── market.py         231   x402 v2 paywall on GET /api/v1/verify + buyer-agent CLI
│   ├── publish.py         90   cited-ledger markdown + Senso publish
│   ├── openui_lang.py    100   ClearancePacket -> OpenUI Lang (deterministic template) + NDJSON
│   ├── pioneer_feedback.py 35  dispute -> Pioneer feedback API
│   ├── tracing.py         67   Langfuse helpers — mostly DEAD (only auth_check is used)
│   └── config.py          62   Settings dataclass (used by clickhouse_events + smoke only)
├── dashboard/                      Vite + React 19 + @openuidev/react-lang 0.2.6
│   ├── src/App.jsx       457   polling dashboard, Judge Mode, station controls, stream reader
│   ├── src/openuiLibrary.jsx 198 5 Zod-typed OpenUI components (VerdictCard, ABPlayer, …)
│   ├── src/main.jsx       12   React root + OpenUI CSS
│   ├── src/styles.css    794   hand-written CSS
│   └── package-lock.json 5721  generated
├── scripts/                        393 py + 177 sh
│   ├── make_test_seeds.py  99  synthetic tones + the "plant" (pitch-shifted track_a)
│   ├── ingest_real_seeds.py 125 real-track ingest + self-verifying plant invariant
│   ├── smoke_integrations.py 79 Langfuse/ClickHouse/Pioneer/CDP credential smoke tests
│   ├── bootstrap_demo_wallets.py 75 generates EVM keypairs into .env
│   ├── live_stats.py       15  prints ClickHouse autonomy scoreboard for the voice-over
│   └── *.sh                    awal status/send/x402-pay, restart/stop local demo
├── tests/                 438   6 unittest files, 17 tests, all mocked (no network)
├── seeds/                          WAV catalog/reference/feed_test + committed clips + claims_feed.jsonl (737 rows)
├── public/earwitness-ledger.md     last published ledger (666 verified · 337 lies · $3.56 out · $0.36 in)
├── docs/                 1,112   PLAN, INTEGRATIONS (verified API specs), DEMO, PREFLIGHT,
│                                  FINAL_HOUR_PLAN, CODEX_HANDOFF/REVIEW, LIVE_STATE, RENDER, DEVPOST
├── render.yaml            59   Render free web service; builds dashboard, serves it from FastAPI
├── _archive/              340 py + ~420 md   two abandoned pre-pivot ideas (all NotImplementedError stubs)
└── .agents/ .claude/ .cursor/skills/  ~7,970 lines vendored skill packs (Langfuse, Senso, Agentic Wallet)
```

**Lines of code** (`wc -l`) [V]:

| Category | Lines | Hand-written? |
|---|---|---|
| Python app (`earwitness/`) | 1,743 | yes |
| Python scripts + shell | 393 + 177 | yes |
| Tests | 438 | yes |
| JSX | 667 | yes |
| CSS | 794 | yes (no Tailwind/shadcn) |
| Config (render.yaml, vite, package.json, requirements, .env.example, index.html) | ~177 | yes |
| Docs + README | 1,187 | yes (heavily AI-agent-authored planning docs) [I] |
| `_archive/` | ~760 | obsolete stubs, skimmed |
| Vendored skill packs (`.agents/.claude/.cursor`) | ~7,970 | **vendored**, `skills-lock.json` |
| `package-lock.json` | 5,721 | generated |

**Hand-written code ≈ 3,420 lines (Py + JSX + scripts + tests), ≈ 4,200 with CSS.** Live runtime path ≈ 1,550 Py + 667 JSX. Dead or near-dead modules: `tracing.py` (except `auth_check`), `clickhouse_events.py`/`config.py` (smoke-only), `verdict.latest_claims()`/`main()` (CLI-only), `events.log_check()` (never called).

**Read fully:** every file in `earwitness/`, `dashboard/src/*.jsx`, `scripts/`, `tests/`, `render.yaml`, `.env.example`, `requirements.txt`, README, all `docs/*.md`. **Skimmed:** `styles.css` (first 60 lines), `_archive/` (README, schema.sql, ingest.py, loop.py, sample-signal/agent.py, SPONSORS.md head), `seeds/claims_feed.jsonl` (head), vendored skill packs (names only). **Skipped:** WAV binaries, `package-lock.json`.

---

## 3. System architecture

### Component diagram (as found in code)

```mermaid
flowchart TB
  subgraph Proc["Single uvicorn process (earwitness.app:app) — Render free plan or local"]
    direction TB
    LS["lifespan() app.py:96-104<br/>creates 2 asyncio tasks"]
    ST["run_station() station.py:190<br/>every PLAY_SECONDS: copy WAV -> seeds/clips/{play_id}/,<br/>append claims_feed.jsonl, Airtable POST (env-gated)"]
    Q[["STATE['unverified'] deque<br/>app.py:41 (in-memory)"]]
    VL["run_verifier() app.py:63-93<br/>polls deque every 2s"]
    VC["verification_cycle() verdict.py:141<br/>(asyncio.to_thread)"]
    EV["evidence.fingerprint_match()<br/>librosa chroma + scipy fftconvolve<br/>_REF_CACHE (never invalidated)"]
    DS["derive_status() verdict.py:67<br/>pure rules"]
    NR["narrate() verdict.py:107<br/>langfuse.openai -> Pioneer"]
    PY["pay_artist() payout.py:38"]
    EVT["events.py ch() per-thread client"]
    PUB["publish_ledger() publish.py:60"]
    MEM[("PACKETS dict (unbounded)<br/>RECENT deque(50)")]
    API["REST routes app.py:115-204<br/>+ market.py /api/v1/verify"]
    X402MW["PaymentMiddlewareASGI (x402 v2)<br/>market.py:196"]
    STATIC["StaticFiles /clips + dashboard/dist"]
  end

  DASH["React dashboard (OpenUI Renderer)<br/>polls /api/packets,/api/metrics,/health every 2.5s;<br/>POST /api/chat NDJSON stream"]
  BUY["Buyer agent<br/>market.py:203 (eth_account) or awal x402 pay"]

  LF[(Langfuse Cloud US<br/>OTel traces, scores, media,<br/>+ legacy /api/public/ingestion)]
  PI[(Pioneer API<br/>OpenAI-compatible /v1 + native /inferences)]
  CH[(ClickHouse Cloud :8443<br/>earwitness.plays / money / checks<br/>+ verdicts_per_min (console-only MV))]
  CDP[(Coinbase CDP server wallet<br/>Base Sepolia)]
  AWAL[(npx awal@2.10.0 CLI<br/>Base mainnet)]
  FAC[(x402.org facilitator<br/>eip155:84532)]
  SEN[(Senso apiv2<br/>questions + content-engine/publish)]
  AT[(Airtable REST<br/>claimed_plays)]
  MD[/public/earwitness-ledger.md/]

  LS --> ST & VL
  ST --> Q --> VL --> VC
  ST -.->|env-gated| AT
  VC --> EV --> DS --> NR
  NR --> PI
  VC -->|spans, scores, audio media, public flag| LF
  VL -->|verified only| PY
  PY -->|CDP_WALLET_SECRET set| CDP
  PY -->|else subprocess| AWAL
  VL -->|log_money out / log_play| EVT --> CH
  VL --> PUB --> MD
  PUB -.->|SENSO_API_KEY| SEN
  PUB -->|autonomy_totals| EVT
  VL --> MEM
  DASH --> API
  API --> MEM
  API -->|/api/metrics 4-6 SELECTs| EVT
  API -->|/api/dispute create_score| LF
  API -->|/api/dispute feedback| PI
  BUY --> X402MW --> API
  X402MW <--> FAC
  API -->|log_money in| EVT
  DASH --> STATIC
```

### Sequence: the main demo flow (planted lie caught, honest play paid)

```mermaid
sequenceDiagram
  autonumber
  participant S as run_station (station.py)
  participant V as run_verifier (app.py)
  participant F as evidence.py (librosa)
  participant VD as verdict.py
  participant P as Pioneer LLM
  participant L as Langfuse
  participant W as payout.py (CDP/awal)
  participant C as ClickHouse
  participant M as publish.py (ledger/Senso)
  participant D as Dashboard (React/OpenUI)

  S->>S: air_next(): copy plant_clip.wav -> clips/{id}/actual.wav, claim "Midnight Garden, CC-BY"
  S->>V: append Play to STATE["unverified"]
  V->>VD: to_thread(verification_cycle(claim))
  VD->>L: propagate_attributes(session=station:earwitness-fm:DATE) + root "agent" observation
  VD->>F: run_fingerprint() @observe tool
  F-->>VD: best_ref=track_a 0.97, shift -1 st; midnight_garden < 0.80
  VD->>VD: derive_status() -> "discrepancy" (best_ref != claimed_ref)
  VD->>P: narrate() chat.completions (Qwen3-32B), force-JSON, 2 attempts
  P-->>VD: {"confidence", "narrative"} (or deterministic fallback)
  VD->>L: attach aired WAV as LangfuseMedia, score_trace x2, set public, flush
  VD->>L: POST /api/public/ingestion trace-create public:true (workaround)
  VD-->>V: ClearancePacket(trace_url, ...)
  alt status == verified
    V->>W: pay_artist("0.01")
    W-->>V: tx hash
    V->>C: INSERT earwitness.money (out)
  else discrepancy
    Note over V: payout withheld (no money row)
  end
  V->>C: INSERT earwitness.plays
  V->>M: publish_ledger(): rewrite ledger.md (+ ClickHouse totals banner), POST Senso
  D->>V: GET /api/packets, /api/metrics (ClickHouse), /health every 2.5s
  D->>V: Judge Mode -> select first discrepancy -> POST /api/chat {packet_id}
  V-->>D: NDJSON chunks of OpenUI Lang, one line per 0.15s
  D->>D: Renderer builds NowPlayingCard, FingerprintMatchView, VerdictCard(+ABPlayer)
  D->>V: (optional) Dispute -> POST /api/dispute/{id} -> Langfuse score + Pioneer feedback
```

---

## 4. Component walkthrough

### 4.1 Contract: `earwitness/__init__.py`
`ClearancePacket` (`:32-48`) is the single object fanned out to ClickHouse, Langfuse I/O, Senso markdown, the x402 response, OpenUI and Pioneer feedback. `status: Literal["verified","discrepancy","inconclusive"]` (`:21`). The docstring still lists `loop.py`, which does not exist; the loop lives in `app.py` [V]. A good hackathon idea: freeze one dataclass early so parallel agents (Claude Code for the backend, Codex for the frontend, per `docs/PLAN.md:3-4`) can't drift.

### 4.2 Service host: `earwitness/app.py`
- `lifespan` (`:96-104`) starts `run_station(STATE)` and `run_verifier()` as asyncio tasks. Everything runs in one process with no queue or DB for state. [V]
- `run_verifier` (`:63-93`) pops one Play every 2 s, runs the CPU-heavy cycle in `asyncio.to_thread` (`:71`), pays out on `verified` (`:72-80`), logs to ClickHouse (`:81`), publishes the ledger (`:82-86`), and caches the packet (`:87-88`). Every stage has its own `try/except` with `print`, so the loop never dies. [V]
- Routes: see §5. CORS `allow_origins=["*"]` (`:108`). Static `/clips` (`:110`). The built dashboard is mounted at `/` last (`:207-208`) so API routes win. [V]
- `/api/chat` (`:162-181`) does not call an LLM. It templates the stored packet into OpenUI Lang and **fakes streaming** with `asyncio.sleep(STREAM_DELAY)` per line. The docstring calls this "deterministic content, streamed delivery (the theater)". [V]

### 4.3 Station: `earwitness/station.py`
- `DEFAULT_PLAYLIST` (`:34-44`) has three entries. Two are honest and one is "THE LIE": `aired_file: seeds/feed_test/plant_clip.wav`, `claimed_ref: midnight_garden`. [V]
- `air_next` (`:152-187`) copies the WAV to `seeds/clips/{play_id}/actual.wav`, copies the claimed reference to `claimed.wav` if it exists, appends JSON to `claims_feed.jsonl`, best-effort posts to Airtable (`:135-149`), and optionally plays audio via macOS `afplay`. [V]
- The comment at `:165` says "the plant's claimed_ref has no audio — that's the point", but `seeds/reference/midnight_garden.wav` exists (added in `02ab181`, "B4.6 … A/B gasp moment now has data and audio"). The comment is stale. [V]
- `run_station` (`:190-214`) sleeps in 0.25 s slices so skip/restart flags respond quickly. [V]

### 4.4 DSP evidence: `earwitness/evidence.py`. The real technical core.
- `load_chroma` (`:34-39`): 22.05 kHz mono, silence trim, `chroma_stft` (n_fft 4096, hop 2048), per-frame L2 normalisation. [V]
- `_best_lag_score` (`:42-54`): for each of 12 chroma bins, `fftconvolve(r[b], q[b][::-1])` gives the cross-correlation over all lags. Summed over bins, that is the sum of per-frame cosine similarities at each lag. Dividing by an overlap-count vector gives the **mean frame-cosine per lag**, and lags with less than 4 s of overlap are discarded. [V] This is a neat, cheap alignment-free matcher.
- `match_score` (`:57-64`): `np.roll(query, shift, axis=0)` for shift in −2..+2 means transposition invariance comes from rotating chroma bins. [V]
- `MATCH_THRESHOLD = 0.80` (`:28`). `_REF_CACHE` (`:79`) is keyed by path and never invalidated, a hazard the team documented (`docs/CODEX_HANDOFF.md:32`). [V]
- `fingerprint_evidence` (`:106-117`) sets `supports` by substring match of the stem in the claimed title, a fragile heuristic the team flagged (`docs/CODEX_HANDOFF.md:58-60`). It is display-only. Status comes from `derive_status`. [V]

### 4.5 Verdict / AI: `earwitness/verdict.py`. See §6.

### 4.6 Payout: `earwitness/payout.py`
- Path selection uses a length heuristic, `"cdp" if len(CDP_WALLET_SECRET) > 10 else "awal"` (`:20-23`). [V]
- CDP path (`:47-54`): `CdpClient()` → `get_or_create_account(name="earwitness-treasury")` → `transfer(..., parse_units(amount, 6), token="usdc", network="base-sepolia")`. [V]
- awal path (`:57-76`): `asyncio.create_subprocess_exec("npx","awal@2.10.0","send", amount, artist, "--chain","base",…)`, using an argv list with no shell. Amount is regex-validated (`:16, 59`) and the address is regex-validated (`:15, 33`). The tx hash is scraped from undocumented JSON or by regex over any 64-hex string (`:79-89`). [V]
- No idempotency key and no "owed" record (see §10). [V]

### 4.7 ClickHouse: `earwitness/events.py` and `clickhouse_events.py`. See §5 and §7.

### 4.8 Ledger publish: `earwitness/publish.py`
- `_rows` is a module-level list (`:25`), so a restart wipes the ledger history, as the team noted (`docs/FINAL_HOUR_PLAN.md:25-29`). The **banner** comes from ClickHouse, so lifetime totals survive restarts (`:28-33`). [V]
- Senso: it reuses an existing "geo question" by searching `/org/prompts` (`:50-57`), else creates one (`:77-84`), then `content-engine/publish` with `raw_markdown` each cycle (`:85-90`). That is synchronous HTTP with a 60 s timeout on the verifier thread. [V]

### 4.9 x402 market: `earwitness/market.py`
- `build_x402_routes()` (`:158-178`) builds `{"GET /api/v1/verify": RouteConfig(accepts=[PaymentOption(scheme="exact", price="$0.01", network="eip155:84532", pay_to=…)])}` and optional Bazaar discovery metadata (`:117-155`, with a hand-patched `method="GET"` at `:154` to satisfy x402 2.13 validation). [V]
- `install_market` (`:181-200`) skips the middleware if `PAY_TO_ADDRESS` is unset, which **silently makes `/api/v1/verify` free**. The handler still returns the packet with `"paid": False` (`:94-100`). [V]
- Money-in ledger: on `request.state.payment_payload`, it logs `log_money("in", …, tx_hash="x402_settled", counterparty="buyer_agent", …)` (`:80-92`). That literal string stands in for the real settlement hash, so the inbound side of the P&L has no on-chain receipt. [V]
- `buy_verification` (`:203-219`) is a complete x402 v2 buyer: `x402Client` + `EthAccountSigner` + `x402_httpx_transport`. [V]

### 4.10 OpenUI templating: `earwitness/openui_lang.py`
- `verdict_lang` (`:78-91`) emits five lines: `root = Stack([np1, fp1, v1])` first (a renderer rule), then positional component calls whose argument order must equal the Zod key order in `openuiLibrary.jsx`. The positional contract is spelled out in the docstring (`:3-12`). [V]
- `_esc` (`:45-46`) escapes only `\` and `"`. A newline in claim metadata would start a new OpenUI statement (see §10). [V]
- `ndjson_chunk` (`:94-96`) wraps text in a **fake OpenAI streaming chunk**, so the frontend adapter is reused unchanged. [V]

### 4.11 Dashboard: `dashboard/src/App.jsx`, `openuiLibrary.jsx`
- It polls `/api/packets`, `/api/metrics` and `/health` together every 2.5 s (`App.jsx:270-286, 371-375`), with no error handling. One failing endpoint, for example a missing ClickHouse MV, rejects `Promise.all` and the dashboard stops updating. [V]
- `streamPacket` (`:310-345`) is a hand-rolled NDJSON reader that accumulates `choices[0].delta.content` and feeds `<Renderer response=… library=… isStreaming=…>` (`:447-451`). [V]
- **Judge Mode** (`:151-192, 357-369`) picks the first `discrepancy` packet and walks four labelled steps with `setTimeout` at 650/3100/5600 ms. It is pure UI choreography, a one-click "demo path" for judges. [V]
- The Dispute button lives inside the OpenUI `VerdictCard` and dispatches a `window` CustomEvent (`openuiLibrary.jsx:149-155`). `App.jsx:383-395` catches it and POSTs `/api/dispute/{id}`. This works around the planned `useTriggerAction`. [V]
- `AudioRail` sends a HEAD request to each clip URL before rendering `<audio>` (`openuiLibrary.jsx:16-56`). [V]

### 4.12 Scripts
- `make_test_seeds.py` builds synthetic additive-synth "tracks". The plant is `pitch_shift(track_a, +1) * 0.85` (`:85`). `midnight_garden` is built from E/F-only pitch classes so it can never lock on the plant within ±2 st (`:78-82`). This is deliberate adversarial seed design. [V]
- `ingest_real_seeds.py` swaps in real tracks (4 Suno tracks, commit `2c39330`) and **self-verifies the demo invariant** (`run_verify`, `:53-71`): the plant must lock `track_a` ≥ 0.80, score below 0.80 against `midnight_garden`, and the honest clip must lock `track_b`. [V]
- `smoke_integrations.py` runs credential checks without printing secrets (`:14-75`). `bootstrap_demo_wallets.py` writes the buyer private key into `.env` and never prints it (`:1-4, 70`). [V]

### 4.13 Infra
- `render.yaml` defines one free web service. It builds `pip install` and then `npm run build` and starts uvicorn (`:7-10`). Secrets use `sync: false` (`:38-59`). `VERDICT_LLM` is set (`:32-33`) but never read by code. [V]
- No Dockerfile, no CI. [V]

### 4.14 Tests (`tests/`, 17 tests)
They cover the ClickHouse-backed totals and metrics with a fake client (`test_autonomy_stats.py`), Pioneer inference-id preference and the feedback retry (`test_pioneer_integration.py`), the x402 route and Bazaar extension validation (`test_x402_market.py`), payout network labelling (`test_app_health.py`), station audio controls, and OpenUI claim parsing. Nothing tests the DSP or `derive_status`. The real invariant check lives in `ingest_real_seeds.py --verify`. [V]

---

## 5. Data model

### ClickHouse (database `earwitness`)

| Table | Repo DDL (`clickhouse_events.py`) | What code inserts (`events.py`) | Drift |
|---|---|---|---|
| `plays` | `:31-47` ts DateTime64(3) DEFAULT now64(3), station_id, claimed_meta, matched_track_id, fingerprint_score Float64, verdict Enum8(verified=1,discrepancy=2,inconclusive=3), confidence, packet_id; MergeTree **ORDER BY (station_id, ts)** | `:35-42` adds `claimed_artist`, `claimed_title` | **Repo DDL lacks 2 inserted columns** → insert fails on a repo-created table [V] |
| `money` | `:48-63` ts, direction Enum8(in=1,out=2), amount_usdc **Decimal64(6)**, tx_hash, counterparty, reason, packet_id; **ORDER BY (direction, ts)** | `:45-50` matches | OK |
| `checks` | `:64-77` ts, packet_id, buyer, amount_usdc, tx_hash; ORDER BY (packet_id, ts) | `log_check` `:53-56` inserts price_usdc, status | Mismatch, and `log_check` is **never called** [V] |
| `verdicts_per_min` (MV target) | **not in repo** | read at `events.py:104-107` (`minute`, `total`, `discrepancy`) | Created by hand in the console per `docs/INTEGRATIONS.md:151-152` (SummingMergeTree + `verdicts_per_min_mv`) [V/I] |

Queries [V]:
- `autonomy_totals` (`events.py:59-75`): `countIf(verdict='verified')`, `countIf(verdict='discrepancy')`, `count()` and `toString(sumIf(amount_usdc, direction='out'))` / `'in'`.
- `metrics` (`:102-121`): a 15-minute discrepancy rate from the MV, the last 20 money rows, P&L, the last 20 plays, plus totals. That is **6 queries per poll** (4 + the 2 in `autonomy_totals`), every 2.5 s per open dashboard.

### In-memory state (`app.py:41-43`)
`STATE` holds `now_playing`, the `unverified` deque and audio flags. `PACKETS` (dict, unbounded) and `RECENT` (deque maxlen 50) are lost on restart. Packets served by `/api/v1/verify` exist only here. [V]

### Files
`seeds/claims_feed.jsonl` (append-only claims history, not read by the live loop) and `public/earwitness-ledger.md` (rewritten every cycle). [V]

### API routes

| Method | Path | Handler | Purpose |
|---|---|---|---|
| GET | `/health` | `app.py:115-119` | ok, packet count, station status, payout network label |
| GET | `/api/station` | `app.py:122-124` | station status |
| POST | `/api/station/audio` | `app.py:127-130` | toggle `afplay` speakers |
| POST | `/api/station/stop-audio` | `app.py:133-136` | kill current clip |
| POST | `/api/station/skip` | `app.py:139-141` | skip to next play |
| POST | `/api/station/restart` | `app.py:144-146` | restart rotation |
| GET | `/api/metrics` | `app.py:149-151` → `events.metrics()` | ClickHouse dashboard reads |
| GET | `/api/packets` | `app.py:154-159` | recent 50 packets |
| POST | `/api/chat` | `app.py:162-181` | stream packet as OpenUI Lang NDJSON |
| POST | `/api/dispute/{packet_id}` | `app.py:184-204` | Langfuse `label-dispute` BOOLEAN score + Pioneer feedback |
| GET | `/api/v1/verify` | `market.py:73-100` | **x402-paywalled** packet ($0.01, Base Sepolia) |
| GET | `/clips/*` | `app.py:110` | WAVs for the A/B player |
| GET | `/*` | `app.py:207-208` | built dashboard |

None of these routes has auth. [V]

### Environment variables
From `.env.example` and code: `PIONEER_API_KEY`, `PIONEER_BASE_URL`, `VERDICT_MODEL` (`verdict.py:35`, default `Qwen/Qwen3-32B`), `VERDICT_LLM` (unused), `ANTHROPIC_API_KEY` (unused), `LANGFUSE_PUBLIC_KEY`, `LANGFUSE_SECRET_KEY`, `LANGFUSE_BASE_URL`, `CLICKHOUSE_HOST`, `CLICKHOUSE_USERNAME`, `CLICKHOUSE_PASSWORD`, `CDP_API_KEY_ID`, `CDP_API_KEY_SECRET`, `CDP_WALLET_SECRET`, `PAY_TO_ADDRESS`, `ARTIST_ADDRESS`, `BUYER_PRIVATE_KEY`, `BUYER_ADDRESS`, `X402_FACILITATOR_URL`, `X402_ENABLED`, `X402_PUBLIC_URL`, `X402_BAZAAR_ENABLED`, `X402_NETWORK`, `X402_VERIFY_PRICE`, `SENSO_API_KEY`, `AIRBYTE_CLIENT_ID`, `AIRBYTE_CLIENT_SECRET`, `CLAIMS_VIA_AIRBYTE`, `AIRTABLE_PAT`, `AIRTABLE_BASE_ID`, `PLAY_SECONDS`, `AIR_ALOUD`, `PAYOUT_USDC`, `STREAM_DELAY`, `VERDICT_BATCH`, `FORCE_SYNTH`, and `VITE_API_BASE` (frontend). [V]

---

## 6. AI / agent design

There is exactly **one model call site** and no tool-calling or multi-agent loop. The "agent" is a fixed pipeline plus two always-on loops. Autonomy comes from the scheduler, not from LLM planning. [V]

| Item | Detail |
|---|---|
| Provider / model | Pioneer (Fastino), OpenAI-compatible at `https://api.pioneer.ai/v1`, model `Qwen/Qwen3-32B` (`verdict.py:35, 41-46`) [V] |
| Client | `from langfuse.openai import OpenAI` (`verdict.py:26`). The drop-in wrapper auto-logs a Langfuse *generation* with tokens/latency [V] |
| Call | `llm().chat.completions.create(model=…, max_tokens=2048, messages=[system, user=json.dumps(prompt)])` (`verdict.py:123-126`) [V] |
| Input | `{"claimed": {artist,title,license}, "fingerprint": {best_match, score, semitone_shift, all}, "derived_status": status}` (`:111-116`) [V] |
| Parsing | Strips Qwen `<think>…</think>` tags, then greedy `\{.*\}` regex, then `json.loads` (`:80-86`). It clamps confidence to [0,1] (`:129`) [V] |
| Retries | 2 attempts, then a **deterministic fallback** narrative `confidence = min(0.99, 0.5 + fp/2)` and "LLM narrative unavailable" (`:121-138`) [V] |
| Authority | The LLM **cannot change status**. Status comes from `derive_status` (`:67-77`) before the call, and the prompt says the status "is already derived … and is FINAL" [V] |
| Memory | None. Each cycle is stateless. The Langfuse session (`station:earwitness-fm:YYYY-MM-DD`, `:36`) groups a day of cycles for viewing only [V] |
| Feedback loop | `/api/dispute` → Langfuse `create_score(name="label-dispute", value=1, data_type="BOOLEAN")` (`app.py:194-195`) + Pioneer `POST /inferences/{id}/feedback` with a 422 body-shape fallback and 5xx backoff (`pioneer_feedback.py:21-35`). Pioneer's native inference id is found by **listing the last 5 inferences and string-matching** title + status (`verdict.py:89-104`) [V] |

System prompt (`verdict.py:117-120`) [V]:

```text
You are EARWITNESS, an airplay-royalty verification agent. The verdict status is already
derived from signal evidence and is FINAL. Write the evidence narrative. Respond ONLY with
JSON: {"confidence": float 0..1, "narrative": str <=50 words, plain and forensic}.
```

Langfuse trace structure per cycle (`verdict.py:141-201`) [V]:
- `propagate_attributes(session_id, tags=["earwitness"], metadata={"play_id"})`
- root `start_as_current_observation(name="verification-cycle:<title>", as_type="agent")`
  - `fingerprint-audio` (`@observe as_type="tool"`, `:62`)
  - `llm-verdict-narrative` (`@observe as_type="agent"`, `:107`) → auto generation from `langfuse.openai`
- On discrepancy: `root.update(metadata={"aired_audio": LangfuseMedia(content_bytes=wav, content_type="audio/wav")})`, guarded so it only reads `.wav` files under `seeds/` (`:177-188`)
- `score_trace("fingerprint-confidence", NUMERIC)`, `score_trace("verdict", CATEGORICAL)` (`:190-192`)
- `set_current_trace_io`, `set_current_trace_as_public`, `get_trace_url` (`:193-198`)
- `_force_trace_public()` (`:204-217`): the docstring says *"us.cloud drops the OTel public flag at ingestion … The legacy ingestion event is the only path that actually makes traces judge-visible."* It POSTs a `trace-create` event with `public: true` to `/api/public/ingestion`. [V] Whether that still holds is not verified [I].

**Claim mismatch:** the README says the trace span tree shows "ingest → fingerprint → LLM verdict" (`README.md:23-24`). The `ingest-claimed-feed` tool span (`latest_claims`, `verdict.py:49-59`) only runs in the CLI `main()` (`:221`). The live loop passes the in-memory Play straight to `verification_cycle` (`app.py:69-71`), so **live traces have no ingest span**. [V]

---

## 7. All integrations

| Integration | Where (file:line) | What it actually does | Depth |
|---|---|---|---|
| **Langfuse v4** | `verdict.py:25-26, 49, 62, 107, 141-217`; `app.py:193-195`; `tracing.py:18-20` | public trace per cycle, session per day, typed observations (agent/tool), auto LLM generation, 2 trace scores, audio media, user-feedback score, force-public workaround | **core-to-the-pitch** (the award) |
| **ClickHouse Cloud** | `events.py:23-121`; `clickhouse_events.py:12-86`; `publish.py:28-33`; `market.py:83-90`; `scripts/live_stats.py` | append-only play and money ledger, async inserts, `countIf`/`sumIf` P&L, MV-backed rate (MV not in repo) | **load-bearing but thin**: the dashboard metrics and ledger banner depend on it; not in the video |
| librosa / scipy | `evidence.py:34-103` | chroma xcorr fingerprinting | **core** (the "moat") |
| Pioneer | `verdict.py:41-46, 89-138`; `pioneer_feedback.py` | narrative + confidence; dispute feedback | load-bearing for narrative; status-independent |
| x402 v2 | `market.py:158-219` | paywall + buyer client + Bazaar metadata | load-bearing for "money in"; inbound tx hash not recorded |
| Coinbase CDP / Agentic Wallet | `payout.py:47-76`; `scripts/awal_*.sh` | $0.01 USDC per verified play (Sepolia or mainnet) | load-bearing |
| OpenUI (Thesys) | `openui_lang.py`; `dashboard/src/openuiLibrary.jsx`; `App.jsx:447` | deterministic OpenUI Lang streamed to the `Renderer` | load-bearing (the only verdict UI) |
| Senso / cited.md | `publish.py:60-90` | rolling markdown publish | thin wrapper, env-gated, local fallback always written |
| Airtable | `station.py:135-149` | best-effort claim dual-write | decorative (write-only, nothing reads it back) |
| Airbyte Agent Engine | `verdict.py:52-57` imports `.claims_airbyte` | **module does not exist**; path only runs in CLI `main()` | **missing** (claimed in README:50 and DEVPOST) |
| Render | `render.yaml` | free web service; now 503 suspended | infra |
| Anthropic fallback | `.env.example:9`, `RENDER.md:83` | never referenced in code | missing |

**Other sponsors relevant to our event:** no Semgrep, Guild AI or Pi Security usage. Guild "Most Innovative Use of Agents" was a planned checkbox target with "no Guild SDK" (`docs/PLAN.md:71-73`). [V]

---

## 8. Real vs. mock map

| Feature / claim (source) | Status | Evidence |
|---|---|---|
| "Listens to a live broadcast" (README:6) | **mocked (disclosed)** | station copies seeded WAVs in a fixed 3-entry rotation (`station.py:34-44, 161`); README:14 "seeded and disclosed" |
| Agent "genuinely doesn't know which segment lies" (README:14) | real | verifier sees only the claim plus audio; decision comes from DSP (`verdict.py:147-148`) |
| Catches pitch-shift disguise | real, seeded | ±2 st chroma roll (`evidence.py:57-64`); plant is `pitch_shift(+1)` (`ingest_real_seeds.py:106`) |
| "The catch cannot miss" (DEMO.md:56) | real by construction | adversarial seed design + self-check (`ingest_real_seeds.py:53-71`) |
| LLM verdict (Pioneer) | partially real | LLM narrates only; deterministic fallback if 403/garbage (`verdict.py:134-138`); the handoff notes Pioneer billing was blocked for part of the day (`docs/CODEX_HANDOFF.md:37`) |
| Public Langfuse trace per cycle | real | `verdict.py:197-200`; ledger rows link traces (`public/earwitness-ledger.md`) |
| Inline audio in discrepancy trace | real | `verdict.py:177-188` |
| Trace span "ingest → fingerprint → LLM" (README:23) | partially real | no ingest span in the live loop (§6) |
| Dispute → Langfuse score + Pioneer history | real (Pioneer id via heuristic) | `app.py:184-204`; `verdict.py:89-104` |
| ClickHouse "every play/verdict/dollar within ~1s" | real | `events.py:31` async insert with wait; `app.py:76-81` |
| "insert-time MV for discrepancy rate" (README:46) | **partially real / not reproducible** | read at `events.py:104-107`; no DDL in repo |
| P&L query | real | `events.py:111-114` |
| x402 money-in $0.01 | real (testnet) | `market.py:158-200`; ledger "$0.36 earned" |
| Money-in ledger tx hash | **hardcoded** | `"x402_settled"` literal (`market.py:86`) |
| Real USDC payouts | real | CDP Sepolia or awal mainnet (`payout.py`); ledger links basescan.org mainnet tx hashes. On-chain existence not checked here |
| "$3.56 paid on-chain" vs "666 verified" | real but incomplete | $3.56 / $0.01 ≈ 356 payouts. About 310 verified plays (~47%) have no money row because a failed payout skips `log_money` but still logs a `verified` play (`app.py:72-81`). Nothing records the owed royalties [V code / I arithmetic] |
| Senso cited.md publish | real when keyed | `publish.py:70-90`; FINAL_HOUR_PLAN says "senso publish 201 success firing every cycle" (`:7-8`) |
| Airbyte claims ingestion "as a tool call" | **missing** | `.claims_airbyte` absent; CLI-only path (`verdict.py:52-57, 221`) |
| Airtable play-log | partially real | write-only, env-gated (`station.py:135-149`) |
| OpenUI "agent speaks UI" | real rendering, **no generation** | Python f-string template + fake streaming (`openui_lang.py:78-96`, `app.py:176-180`) |
| x402 Bazaar discoverability | real config, flag-gated | `market.py:117-155`; tested in `test_x402_market.py` |
| Hosted app | dead | 503 suspended (round 1) |
| VERDICT_LLM / Anthropic fallback | missing | env var never read |

**Rough ratio:** about **75% real**, 15% partially real or hardcoded, 10% missing or mocked (weighting by user-visible feature). The one big disclosed mock is the station itself. [I]

---

## 9. Demo path trace (84-s video, plus the planned Judge Mode)

The submitted video (round 1 §6, 84 s, recorded at 4:29 PM) has narration only over the dashboard. The code behind each beat:

| Video beat | What the viewer sees | Code that runs |
|---|---|---|
| 0:04–0:21 hook | dashboard header, metric strip | `App.jsx:402-423`; `MetricStrip` reads `metrics.totals` from `events.autonomy_totals()` (ClickHouse) |
| 0:21–0:41 "labels lie, sound is physics" | Judge Mode banner "Playlists lie. The signal does not." | `App.jsx:166` (static text) |
| 0:41–1:05 "fake radio station every 20 seconds… fingerprints what is actually aired" | now-playing / station controls, packet list | `run_station` (`station.py:190`), `/health` → `station_status`; packets from `RECENT` (`app.py:154-159`) |
| (Judge Mode click) | OpenUI cards stream in; FingerprintMatchView "Midnight Garden — failed to lock (0.33) → Neon Tide 97%, shift −1" | `runJudgeMode` (`App.jsx:357-369`) → `streamPacket` → `/api/chat` → `verdict_lang` (`openui_lang.py:78-91`), `_ref_label` (`:68-75`) |
| 1:05–1:19 "verified → money moves… discrepancy → doesn't… actual payment" | BroadcastPaymentPanel: "withheld" card / latest payout receipt link | `App.jsx:194-240` using `metrics.ledger` (ClickHouse `money` rows) + `health.payout_explorer_tx_base` |

**Not shown in the video** but scripted (`docs/DEMO.md`): the ClickHouse SQL console `count()` twice (`:12`), Langfuse Sessions and the inline-audio trace (`:13, :36`), x402 402→200 (`:45`), the P&L query (`:46`). [V] The DSP scores shown come from real computation each cycle, but the inputs are seeded and the outcome is fixed by seed design.

---

## 10. Code quality and security review

**Structure (B).** Small single-purpose modules, clear docstrings that explain *why* (e.g. `events.py:23-25`, `verdict.py:204-207`), dataclass contract, regex-validated payout inputs, subprocess argv without a shell, a path-escape guard before uploading to a public trace (`verdict.py:181-184`), and unit tests for the integration edges. Weaknesses: broad `except Exception: print(...)` everywhere (no logging or metrics), dead modules (`tracing.py`, `clickhouse_events.py` drift), stale comments (`station.py:165`, `__init__.py:16` mentions `loop.py`), module globals for state, and a sync HTTP Senso publish on the verifier thread. Typing is partial (`packet` untyped in `events.log_play`, `publish.publish_ledger`).

**Bugs found** [V]:
1. **`/api/chat` crash for evicted packets.** `PACKETS` is unbounded but `RECENT` keeps only 50 (`app.py:42-43`). For a `packet_id` in `PACKETS` but no longer in `RECENT`, `next((c, p) for c, p in RECENT if …)` raises `StopIteration` → 500 (`app.py:167-168`).
2. **Schema drift:** repo DDL cannot accept `log_play` inserts (`clickhouse_events.py:33-45` vs `events.py:36-42`). A fresh environment breaks.
3. **Missing MV breaks the dashboard:** if `verdicts_per_min` doesn't exist, `metrics()` throws, `/api/metrics` returns 500, and `Promise.all` in `fetchMetrics` rejects with no catch (`App.jsx:271-275`), so the dashboard freezes.
4. **Payout/accounting gap:** a payout failure leaves the play `verified` with no `owed` record. If the payout succeeds but `log_money` throws, the message still says "PAYOUT BLOCKED" (`app.py:73-80`), so the logged money undercounts what was actually paid.
5. **Pioneer feedback may target the wrong inference.** The id is chosen by substring match over the last 5 inferences (`verdict.py:94-101`).
6. **Memory growth:** `PACKETS` is never pruned on an always-on service.

**Security (cyberdefense lens)** [V unless marked]:
- **No authentication on any route**, including `POST /api/station/*` (anyone can mute, skip or restart), `POST /api/dispute/{id}` (anyone can write Langfuse scores and send Pioneer training corrections, i.e. **training-data poisoning via an unauthenticated feedback endpoint**), and `/api/metrics` (an unauthenticated trigger for 6 ClickHouse queries per call, a cost/DoS lever). `app.py:127-204`.
- **CORS `*`** with all methods and headers (`app.py:108-109`).
- **Fail-open paywall:** without `PAY_TO_ADDRESS` or with `X402_ENABLED=0`, `/api/v1/verify` serves packets for free (`market.py:185-190`).
- **Unverifiable revenue records:** inbound payments are logged with the literal `"x402_settled"` instead of the settlement tx (`market.py:86`).
- **OpenUI Lang injection:** `_esc` doesn't escape newlines (`openui_lang.py:45-46`). Claims are "untrusted by design" (`verdict.py:180`), so a claim title containing `\nroot = …` could inject components into the generated UI [I, not exploited]. The ledger markdown also embeds `claimed_meta` unescaped in a table (`publish.py:63-65`).
- **`href={props.traceUrl}`** is rendered without scheme validation (`openuiLibrary.jsx:173`). Low risk because the value comes from Langfuse.
- **Secrets:** none committed. `.env` is gitignored (`.gitignore:5`). Public addresses only appear in `docs/LIVE_STATE.md:26, 32`. Langfuse project id `cmqbakvqa01foad0dje44z20k` is public by design. [V: `git grep` over tracked non-vendored files for Langfuse key prefixes, `sk-…`, PEM headers and inline passwords returned nothing]
- **Shell:** `restart_local_awal.sh:16-17` builds a command string from env vars and passes it to `osascript`/`sh -lc`. It is local-only and low risk.
- **Good practice worth copying:** `payout.py:15-16, 33, 59` validate address and amount before a money-moving subprocess. `verdict.py:181-184` prevents path traversal into a public artifact.

---

## 11. Build history

**39 commits, 1 git author (Jin Choi).** Planning docs describe three "workers": Jin, Claude Code (backend) and Codex (frontend + market), with a mid-day handoff to Codex at ~2:25 PM (`docs/PLAN.md:3-4`, `docs/CODEX_HANDOFF.md:1`). All commits use one identity. [V]

| Hour (PDT, 12 Jun) | Commits | Notable (size, excluding WAV/lockfiles where relevant) |
|---|---|---|
| 12:16–12:27 | 6 | `9f406b9` plan + specs + `_archive` (+1,550); `3075670` evidence/config/tracing/clickhouse_events/seeds + Langfuse skill pack (+3,134, ~2,000 vendored); `0cd35ac` station (+129); `9a88f2c` verdict (+277); `36f3816` app/events/openui_lang/payout/publish/feedback + Senso skill pack ×3 (+4,369, ~3,900 vendored) |
| 12:50–12:55 | 2 | `bce1b73` dashboard + market.py (+6,822, of which 5,721 lockfile); `02ab181` A/B fix |
| 13:07–13:42 | 10 | Agentic Wallet skill + scripts (+1,485 mostly vendored), dual-path payout, Senso fix, Langfuse inline audio, Judge Mode (+320), per-thread ClickHouse client (`4cf106c`), force-public traces (`a052fc6`) |
| 14:21–14:59 | 8 | real-seed ingest tool, Senso reuse + Pioneer feedback fix (+183), $0.01 price, Suno tracks, autonomy stats from ClickHouse (`4b37acb`, +297), truthful labels |
| 15:06–15:56 | 7 | station controls (+403), Render config, dashboard declutter, payout network labels + tests |
| 16:02–16:14 (final 30 min) | 2 | verdict panel scroll fix, x402 Bazaar metadata fix |
| **post-deadline** 16:47, 17:20 | 2 | docs only (LIVE_STATE, RENDER) + local restart scripts. **No `earwitness/*.py` changes** [V] |
| 15 Jun, 25 Jun | 3 | backed-up claims feed (+729 rows) and ledger; README award line |

**What existed before the event:** the first commit lands at 12:16 already containing a "locked plan" with "verified" API specs and an archive of two earlier pivots. Five substantial code commits land within 11 minutes (12:16–12:27), labelled with plan block IDs (B1, B1.5, B2, B3+B4). That indicates **work done uncommitted from the morning and committed in bursts** [I]. Nothing suggests code from before the event day. The `_archive` stubs are all `NotImplementedError` (e.g. `_archive/war-room/pipeline/ingest.py:14-27`) [V].

**Final hour (15:30–16:30):** deployment (Render) and UI polish only. The core loop was frozen by about 14:40. [V]

---

## 12. How hard was this to build?

A skilled builder with AI agents could rebuild the **live core** (FastAPI + 2 loops, chroma matcher, deterministic verdict + one LLM call, Langfuse tracing, 2 ClickHouse tables + P&L, a simple React dashboard) in about **3–3.5 hours**. The full eight-sponsor surface (x402 seller + buyer, CDP + awal payouts, Senso, OpenUI positional contract, Bazaar) is closer to the full 5.5 hours, and only fits with parallel agents and a pre-verified integration spec, which is exactly what `docs/INTEGRATIONS.md` was. [I]

The hard parts [V from docs/commits]:
1. **The DSP invariant**: the plant must lock its true source ≥ 0.80 and miss its claimed source below 0.80 across ±2 st, while honest tracks don't cross-match. This needed adversarial seed design (`make_test_seeds.py:78-82`) and a self-check (`ingest_real_seeds.py:53-71`).
2. **Langfuse public visibility**: the OTel public flag was dropped, so traces were needed via a legacy ingestion POST (`verdict.py:204-217`). The Devpost lesson was "verify from the judge's seat" (`docs/DEVPOST.md:36`).
3. **The ClickHouse concurrency gotcha**: one client shared between the threadpool and the event loop dropped verdicts (`4cf106c`, `events.py:23-25`).
4. **x402 v2 API churn** and the Bazaar validation quirk (`market.py:152-154`).
5. **Live-money ops**: wallet funding, burn rate (~$1.20/hr), network labels.

---

## 13. Reusable patterns and code (for a Cyberdefense entry: ClickHouse, Pi Security, Guild AI, Semgrep)

### P1. Deterministic verdict, LLM only narrates (judge-proof, demo-proof)
`verdict.py:67-77` and `:117-120`. Swap the DSP score for Semgrep findings, a Sigma/YARA hit or an IOC match. The rules decide severity or block/allow, and the LLM explains:

```python
def derive_status(match: MatchResult, claimed_ref: str) -> tuple[str, list[str]]:
    """Deterministic verdict algebra — the demo cannot be flipped by a flaky model."""
    if match.is_match and match.best_ref != claimed_ref:
        return "discrepancy", [...]
    if match.is_match and match.best_ref == claimed_ref:
        return "verified", [...]
    return "inconclusive", [...]
...
system = ("... The verdict status is already derived from signal evidence and is FINAL. "
          "Write the evidence narrative. Respond ONLY with JSON: {...}")
```
Add the fallback at `verdict.py:134-138` so the pipeline never blocks on the model. This is also the right security posture: **the model has no authority over the action**, which is a strong line for a cyberdefense judge.

### P2. Langfuse "decision audit" trace per agent cycle (the pattern that won the prize)
`verdict.py:141-200`. For a SOC/triage agent: one session per scan or incident, typed observations, numeric + categorical scores, evidence as media, a public URL embedded in every downstream record.

```python
with propagate_attributes(session_id=SESSION_ID, tags=["earwitness"], metadata={"play_id": ...}):
    with langfuse.start_as_current_observation(name=f"verification-cycle:{title}", as_type="agent") as root:
        match = run_fingerprint(...)            # @observe(as_type="tool")
        note = narrate(...)                     # @observe(as_type="agent") + langfuse.openai generation
        root.update(metadata={"aired_audio": LangfuseMedia(content_bytes=clip.read_bytes(),
                                                           content_type="audio/wav")})
        root.score_trace(name="fingerprint-confidence", value=match.best_score, data_type="NUMERIC")
        root.score_trace(name="verdict", value=status, data_type="CATEGORICAL")
        langfuse.set_current_trace_as_public()
        packet.trace_url = langfuse.get_trace_url()
langfuse.flush()
```
Cyber mapping: attach the offending log excerpt, pcap snippet or Semgrep SARIF as media; score `severity` (categorical) and `confidence` (numeric); put the trace URL on every alert row in ClickHouse. Copy the path-escape guard (`verdict.py:181-184`) before uploading evidence to a *public* trace, and **verify public visibility from a logged-out browser** (`verdict.py:204-207`). ClickHouse owns Langfuse, so pitch them as one stack.

### P3. ClickHouse small-insert client that survives concurrent dashboards
`events.py:20-32`:

```python
_tls = threading.local()
def ch():
    """One client PER THREAD — clickhouse-connect sessions reject concurrent queries,
    and /api/metrics (threadpool) collides with the verifier's inserts (event loop)."""
    if not hasattr(_tls, "client"):
        _tls.client = clickhouse_connect.get_client(
            host=os.environ["CLICKHOUSE_HOST"], port=8443, ...,
            settings={"async_insert": 1, "wait_for_async_insert": 1})
    return _tls.client
```
Use this for alert/event streams. Upgrade it for our entry: `LowCardinality(String)` for source/rule/severity, `ORDER BY (tenant, rule_id, ts)`, a TTL, and **commit the MV DDL in an idempotent `ensure_schema()`**, which EARWITNESS failed to do.

### P4. KPI row as `countIf`/`sumIf` in one scan
`events.py:59-67, 111-114`:

```sql
SELECT countIf(verdict='verified'), countIf(verdict='discrepancy'), count() FROM earwitness.plays;
SELECT toString(sumIf(amount_usdc, direction='in')), toString(sumIf(amount_usdc, direction='out')), count()
FROM earwitness.money;
```
Cyber version: `countIf(severity='critical')`, `countIf(status='auto_remediated')`, `countIf(verdict='false_positive')` → a live line like "N alerts triaged · M blocked · K false positives suppressed". `scripts/live_stats.py` turns it into a sentence to **read aloud during the demo**, which is a cheap, effective trick.

### P5. Deterministic generative UI with streamed "theater"
`openui_lang.py:78-96` + `app.py:176-180`: template the UI DSL from the verdict object and stream it line by line with a delay, wrapped as fake OpenAI chunks so any chat-UI renderer works. You get a "the agent speaks UI" look with no model unpredictability. **Escape newlines**, unlike `_esc`.

### P6. Self-verifying demo invariant
`ingest_real_seeds.py:53-71`: a script that asserts the planted attack is caught and the clean control isn't, run twice for determinism before every restart (`docs/CODEX_HANDOFF.md:23-29`). For us that means a planted vulnerable commit or malicious log line plus a clean control, gated in CI or preflight.

### Bonus: the abandoned idea is our domain
`_archive/war-room/` is a **ClickHouse-backed incident-response agent**: victim app → `war_room.events` (`LowCardinality` route/release, `ORDER BY (route, ts)`) → detect via `countIf(status >= 500)/count()` over a 2-minute window → investigate (correlate with `war_room.deploys`) → revert PR → postmortem (`_archive/war-room/pipeline/schema.sql`, `agent/loop.py`). The author rated it "a genuinely great, differentiated use" of ClickHouse (`_archive/war-room/SPONSORS.md:12`). It is all stubs, but the schema and loop are a ready skeleton for a Cyberdefense ClickHouse entry. [V]

### What to avoid
- **Schema only in the cloud console** (MV missing, DDL drift). Judges cloning the repo can't reproduce it.
- **Sponsor beats scripted but not recorded**: ClickHouse and Langfuse never appear on screen in the 84-s video, which was recorded one minute before the deadline.
- **Claiming integrations that are dead code** (Airbyte, Anthropic fallback). A diligent judge or a Semgrep-style scan of imports finds `.claims_airbyte` missing.
- **Unauthenticated control and feedback endpoints**: at a security hackathon, an open `/api/dispute` that feeds model training is an easy finding for an opposing judge.
- **Recording money-in without a receipt** (`"x402_settled"`) while claiming "receipts both directions".
- **Free-tier hosting that later suspends**: the hosted proof is gone (503).
