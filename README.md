# asuntoarvio

Is the asking price above or below realized sales in the area? Free benchmark
and listing-analysis tool for Finnish apartment investors — Stage 0 of the
apartment-investor analytics product. Live at https://asuntoarvio.vercel.app.

Compares a listing's €/m² against Statistics Finland's realized old-apartment
sale prices by postal code (StatFin 13mt, CC BY 4.0) across the whole country,
and always ships the delta with a confidence tier and interpretation flags
(validated against live listings, 2026-06).

**Read first:** [`CLAUDE.md`](CLAUDE.md) — project rules (legal lanes,
engineering constraints, design system). [`docs/ROADMAP.md`](docs/ROADMAP.md)
— current state and staged plan.

**Stack:** SvelteKit 2 + adapter-vercel (EU region `fra1`, runtime
`nodejs22.x`), MapLibre GL, optional Supabase. Deliberately **not** Next.js.
No LLM and no client-side data fetching in the request path; verdict pages are
SSR from URL params, so every verdict is shareable with zero storage.

## Run

```bash
npm install
npm run dev        # http://localhost:5173 — works offline from the bundled seed
```

## Deploy

```bash
vercel             # preview
vercel --prod
```

Set `CRON_SECRET`, `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`, and
`MML_API_KEY` (geocoding for micro-location) in Vercel env. The monthly cron
(`vercel.json`) refreshes benchmark cells from StatFin; without Supabase the
refresh returns fresh cells in the response (update
`src/lib/server/benchmarks.seed.json` from it).

## Layout

```
src/lib/server/benchmark.ts          # verdict engine: delta + confidence + flags
                                     # + locationBenchmark (IDW over postal centroids)
src/lib/server/listing-parse.ts      # deterministic Oikotie/Etuovi field extraction
src/lib/server/geocode.ts            # MML Pelias address geocoding
src/lib/server/statfin.ts            # PxWeb client (13mt) for the refresh cron
src/lib/server/supalog.ts            # best-effort query log + waitlist writes
src/lib/server/benchmarks.seed.json  # whole-Finland cells (1,724 postal areas)
src/lib/server/centroids.json        # postal centroids + per-room prices for IDW
src/lib/PriceMap.svelte              # shared MapLibre choropleth (kartta + analyysi)
src/routes/+page.svelte              # landing: benchmark form + waiting list
src/routes/arvio/+page.svelte        # shareable verdict page (SSR from URL params)
src/routes/analyysi/                 # paste/URL listing analysis + mini price map
src/routes/kartta/+page.svelte       # whole-Finland price choropleth
src/routes/api/benchmark/+server.ts  # JSON API — future MCP-tool / metered surface
src/routes/api/refresh/+server.ts    # cron: StatFin -> Supabase (or response)
static/map-data.geojson              # Paavo postal polygons + price properties
supabase/                            # migrations + combined_v0.sql (run in SQL editor)
```

## Stage roadmap (detail in docs/ROADMAP.md)

- **Stage 0 (this):** free benchmark + listing analysis, email capture,
  demand metrics.
- **Stage 1:** paid kohde report — Stripe Checkout inserts a `reports` row; an
  offline worker extracts the taloyhtiö scorecard from Virre tilinpäätös and
  writes it back to `scorecards`; this repo only renders the result.
- **Stage 1.5:** MCP server exposing `area_benchmark` (free) and
  `taloyhtio_scorecard` (metered) — same engine, second distribution channel.
- **Stage 2:** richer transaction-level sources → building-level micro-location.

Attribution: price data © Tilastokeskus (Statistics Finland), StatFin table
13mt, CC BY 4.0. This tool is a screening aid, not a valuation or investment
advice.
