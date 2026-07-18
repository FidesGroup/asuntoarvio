# Technical roadmap — RehtiArvio (public UI repo)

Last updated: 2026-07-14. Rules and constraints: see `../CLAUDE.md`.
This repo is the Vercel-facing UI and the commodity benchmark engine.
Business planning, the Stage-1 extraction worker, and its prompts live in a
separate private repository — features land here only when they are ready to
be public.

## Where we are (v0.3)

- **`/` landing** — two-column hero (URL analyzer left, fluid Finland
  MiniMap right with StatFin caption + /kartta link; stacks <900px),
  manual benchmark form behind a toggle, inline feature row, waiting-list
  signup (Supabase `leads`). Responsive overhaul 2026-07-14: 62rem main
  container, breakpoints 480/720/900, tap-to-pin price panel on /kartta
  for touch devices.
- **`/arvio`** — shareable SSR verdict from URL params, zero storage.
- **`/analyysi`** — paste listing text or give a listing URL (allowlisted
  hosts, single user-directed fetch); deterministic extraction of ~50 Finnish
  listing fields; verdict + taloyhtiö insights + flags; micro-location v1
  (MML geocoding → inverse-distance-weighted blend of nearby postal
  benchmarks) with an embedded price map around the address.
- **`/kartta`** — whole-Finland choropleth with five metric modes (€/m²,
  mix-controlled 12-mo change, gross rental yield, price-to-income, trades
  per 1,000 dwellings), an auto-generated Markkinakatsaus, PKS-vs-muu-Suomi
  divergence chart (nominal/real, 13mv + KHI), six ranked area tables and a
  CSV export of the full area table (2026-07-18). Click-through to prefill
  the benchmark. Metric definitions are documented on /miksi.
- **`/api/benchmark`** — JSON endpoint (future MCP surface).
- **`/api/refresh`** — monthly StatFin refresh cron.
- Whole-Finland seed: StatFin 13mt, 4-quarter transaction-weighted means,
  confidence tiers, suppressed-cell handling.

## v1 (2026-07-05): asuntocard subscription chain

Subscription → Stripe Checkout (`/tilaa`, REST, no SDK) → webhook
(`/api/stripe/webhook`, HMAC-verified) → `subscribers` row + access-token
cookie (`/tili`) → gated `?/report` action on `/analyysi` → `reports` row →
offline worker (private repo) fills `scorecards` → `/raportti/[id]` renders
the asuntocard with source links, self-refreshing until ready. Stripe keys +
`STRIPE_PRICE_ID` env open the tilaus page; without them it shows the
waitlist pointer.

## Next up (technical)

1. Apply Supabase migrations (`supabase/combined_v0.sql` in the SQL editor) —
   until then waitlist and query-log writes fail gracefully by design.
2. Post-deploy verification checklist: `/kartta` 200, waitlist renders,
   `/analyysi` URL-fetch path sane on a real listing, mini-map +
   location-weighted comparison visible (needs `MML_API_KEY`).
3. Parser breadth: Etuovi field variants, kerros/hissi extraction,
   vastike-per-m² insight.
4. Share-card meta tags (OpenGraph) for `/arvio` verdict pages.
5. MCP server wrapping `/api/benchmark` as a free tool.

## Stage roadmap (high level)

- **Stage 0 (this repo):** free benchmark + listing analysis, email capture.
- **Stage 1:** paid kohde report — Stripe Checkout inserts a `reports` row; an
  offline worker fills `scorecards`; this repo only renders the result.
- **Stage 1.5:** MCP distribution of the same engine.

Attribution: price data © Tilastokeskus (Statistics Finland), StatFin table
13mt, CC BY 4.0.
