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
   is Tilastokeskus table 13mt, CC BY 4.0. "Lähde: Tilastokeskus" must remain
   visible in the footer and on the map views.
3. **No personal data storage beyond what's declared.** `query_log` stores
   query facts (postal code, rooms, price), never listing URLs or addresses.
   `leads` stores an email the user typed in themselves.

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

## Data regeneration

- Benchmark cells: monthly Vercel cron calls `/api/refresh` (guarded by
  `CRON_SECRET`); StatFin publishes quarterly. Without Supabase the refresh
  returns cells in the response — paste into
  `src/lib/server/benchmarks.seed.json`.
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
