# RehtiArvio — rules for agents and humans

Free benchmark + listing analysis for Finnish apartment investors. Live at
https://rehtiarvio.vercel.app. This file is the project constitution: the
constraints below were each earned the hard way in one intensive build day
(2026-07-05). Do not relax them without the owner's explicit decision.

## Non-negotiable rules

### Legal / data lanes

1. **Never scrape Oikotie (or any listing portal) systematically.** Their ToS
   forbids "säännöllinen, järjestelmällinen tai jatkuva tietojen kerääminen".
   The ONLY permitted fetch is a **user-directed single-URL fetch** at analysis
   time, https-only, against the host allowlist in
   `src/lib/server/listing-parse.ts` (`allowedListingUrl`). Do not add crawl
   loops, caching of listing pages, or bulk fetch — anywhere, including the geo
   repo's extraction fleet (Oikotie is excluded there by source policy too).
2. **StatFin attribution is a license condition, not decoration.** Price data
   is Tilastokeskus table 13mt, CC BY 4.0. Rent data is Tilastokeskus table
   asvu 13eb, CC BY 4.0. "Lähde: Tilastokeskus" must remain visible in the
   footer and on the map views; the OG share card carries the 13mt attribution
   line and must continue to.
3. **No personal data storage beyond what's declared.** `query_log` stores
   query facts (postal code, rooms, price), never listing URLs or addresses.
   `leads` stores an email the user typed in themselves. `reports.facts` may
   additionally carry structured figures deterministically parsed from
   documents the buyer pasted at order time (vastikkeet, lainaosuus,
   korjausvuodet — see `doc-parse.ts`); the pasted document text itself is
   never stored, and the parser must never extract names or free prose.

### Product honesty

4. **A verdict never ships as a naked percentage.** Always delta + confidence
   tier (korkea/kohtalainen/matala/ei saatavilla) + interpretation flags.
   Validated biases the flags must keep covering: new-build premium (can be
   ±40%, inverts in areas like Jätkäsaari), unit-size effects (small yksiöt
   above area mean, large units below), intra-postal heterogeneity, and
   StatFin-suppressed cells (validated against live listings, 2026-06).
5. **No LLM calls in the web request path.** Listing extraction is
   deterministic (`listing-parse.ts`). LLM/agent work (tilinpäätös scorecards,
   search-based enrichment) runs offline on the homeserver worker and lands in
   Supabase; the site only reads results.

### Engineering

6. **No Next.js.** Owner decision (CVE track record). Stack is SvelteKit 2 +
   `@sveltejs/adapter-vercel`, runtime pinned `nodejs22.x`, region `fra1`.
7. **Secrets live only in Vercel env** (`SUPABASE_SERVICE_ROLE_KEY`,
   `MML_API_KEY`, `CRON_SECRET`). Never commit them; `.env` is gitignored;
   history is verified clean — keep it that way.
8. **Supabase writes are best-effort.** `supalog.ts` must never throw or delay
   a response; the site works fully without Supabase (bundled seed).
9. **Parser changes need fixture proof.** Real-world listing text is hostile
   (doubled label/value lines, portal footers, kuntotutkimus decoys). Run new
   parser code against a pasted-listing fixture AND a URL-fetch torture fixture
   before shipping. Known traps already fixed once — don't regress:
   grouped-number parsing must not merge repeated numbers ("54 54" ≠ 5454),
   scalar fields take only their first line, page tails are cut at
   `CUTOFF_MARKERS`, and kuntotutkimus/selvitys/suunnittelu lines are never
   "completed renovations".

### Design

10. **Clean and simple; intentional, not templated.** Design tokens live in
    `src/routes/+layout.svelte`: Baltic petrol accent `#0f6a78`, copper
    `#a4512e` = over market, pine `#2e6b46` = under market, light + dark themes
    via tokens. Square corners, no gradient heroes, no emoji section markers.
    Map ramp/breaks live in `src/lib/PriceMap.svelte` — the ramp is
    lightness-monotonic and CVD-validated; don't eyeball replacements.
11. **UI language is Finnish; code and docs are English.**

## Dev environment gotchas (Windows host)

- Local `vite build` with adapter-vercel fails on Windows (symlink EPERM).
  Build happens on Vercel's Linux builders — don't fight it locally.
- `vercel deploy` CLI uploads hang intermittently from this machine; prefer
  git-integration auto-deploys (see ROADMAP — pending repo-visibility
  decision) or retry in foreground.
- Svelte attribute `pattern="[0-9]{5}"` is parsed as an expression — write
  `pattern={'[0-9]{5}'}`.
- Testing form actions with curl: send `Origin: <site-origin>` (CSRF) and
  `Accept: text/html` (otherwise you get devalue JSON).
- Restart the dev server after changing `$lib/server` modules if results look
  stale; kill by port (netstat → taskkill), not by name.
- **SvelteKit's `+server.*` route matcher accepts `.js`/`.ts` only.** `@vercel/og`
  wants a React-style JSX tree; the OG route at `src/routes/arvio/og/+server.ts`
  builds the element tree with a plain `h()` helper in `template.ts` (no JSX,
  no `react` dep — `react` ships inside `@vercel/og` and we don't import it
  at build time). Renaming the route to `.tsx` will break the matcher and
  the route will 404 silently; don't.

## Data regeneration

- **Benchmark cells (13mt, sale prices):** monthly Vercel cron calls
  `/api/refresh` (guarded by `CRON_SECRET`); StatFin publishes quarterly. With
  Supabase configured the cells upsert into `benchmarks`; without it the
  refresh returns cells in the response — paste into
  `src/lib/server/benchmarks.seed.json`.
- **Rent cells (asvu 13eb, rents):** same cron pulls the postal-code rents
  table in the same call. 13eb lives in the **StatFin_Passiivi** (archive)
  database, not the live asvu; it is still refreshed quarterly (latest update
  2026-01-15) and the URL is stable, but treat it as an archived source. If
  the table id or URL breaks, fall back to the live regional table `15fa`
  (Whole country / Greater Helsinki / Uusimaa / … / Rovaniemi) for a
  town-level-only mode. **Suppression rule** from StatFin: cells with < 20
  observations or a high rental-housing-company share are returned as null —
  never substitute a different number; the rents engine's postal→town tier
  chain handles fall-back. The cron synthesizes town-level cells
  (transaction-weighted average of populated postal cells in the same town)
  and writes both postal and town rows to the `rents` table with a
  `postal_or_town` discriminator. Without Supabase, the response payload is
  the same shape as the existing `rents.seed.json`; paste it in.
- **`rents.seed.json`** ships 2,048 cells (1,740 postal + 308 synthesized town
  fall-backs), bootstrapped from 2025Q1–Q4. Regenerate with:
  `node --experimental-strip-types scripts/build-rents-seed.mts`
  It writes both `rents.seed.json` and `postal-areas.ts` (the postal→town
  lookup the engine's tier chain uses). Per project convention, regeneration
  scripts now live in `scripts/` rather than the geo repo scratch.
- `centroids.json` + `static/map-data.geojson` come from Paavo postal-code
  polygons (WFS) joined to the seed; regeneration scripts live in the geo repo
  scratch (`C:/tmp/geo-bench/`) — promote them into `scripts/` here if touched
  again.

## Related repos

- The Stage-1 extraction worker, its prompts, data-source validation docs,
  and business planning live in a **separate private repository**. This repo
  must stay deployable and understandable on its own: the only contract
  between the two is the Supabase schema (`reports` in, `scorecards` out).

## The plan

Current state, pending blockers, and the staged business plan are in
`docs/ROADMAP.md`. Read it before starting new work.
