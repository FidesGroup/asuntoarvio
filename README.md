# asuntoarvio

Is the asking price above or below realized sales in the area? Free benchmark
tool for Finnish apartment investors — Stage 0 of the apartment-investor
analytics product. Compares a listing's €/m² against Statistics Finland's
realized old-apartment sale prices by postal code (StatFin 13mt, CC BY 4.0),
and always ships the delta with a confidence tier and interpretation flags
(validated against live listings: geo repo `docs/benchmark-spike-hard-areas.md`).

**Stack:** SvelteKit 2 + adapter-vercel (EU region `fra1`), optional Supabase.
Deliberately **not** Next.js. No client-side data fetching; result pages are
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

Set `CRON_SECRET` in Vercel env; the monthly cron (`vercel.json`) refreshes
benchmark cells from StatFin. Without Supabase configured the refresh returns
the fresh cells in the response (update `src/lib/server/benchmarks.seed.json`
from it); with `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` it upserts the
`benchmarks` table (`supabase/migrations/`).

## Layout

```
src/lib/server/benchmark.ts       # verdict engine: delta + confidence + flags
src/lib/server/statfin.ts         # PxWeb client (13mt) for the refresh cron
src/lib/server/benchmarks.seed.json  # bundled cells (19 Helsinki postal areas)
src/routes/+page.svelte           # landing + form (plain GET form, no JS needed)
src/routes/arvio/+page.svelte     # shareable verdict page (SSR from URL params)
src/routes/api/benchmark/+server.ts  # JSON API — future MCP-tool / metered surface
src/routes/api/refresh/+server.ts    # cron: StatFin -> Supabase (or response)
supabase/migrations/              # benchmarks, query_log/leads, reports/scorecards
```

## Stage roadmap

- **Stage 0 (this):** free benchmark, email capture, demand metrics.
- **Stage 1:** paid kohde report — Stripe Checkout inserts a `reports` row; the
  homeserver worker (geo prospect-agent infra) extracts the taloyhtiö
  scorecard from Virre tilinpäätös and writes it back to `scorecards`.
- **Stage 1.5:** MCP server exposing `area_benchmark` (free) and
  `taloyhtio_scorecard` (metered) — same engine, second distribution channel.

Attribution: price data © Tilastokeskus (Statistics Finland), StatFin table
13mt, CC BY 4.0. This tool is a screening aid, not a valuation or investment
advice.
