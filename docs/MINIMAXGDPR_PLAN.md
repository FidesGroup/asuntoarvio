# MINIMAXGDPR PLAN

GDPR/ePrivacy-compliant visitor data collection for RehtiArvio. Prepared 2026-07-22 for another agent (MiniMax v3) to execute — this document is the spec, no implementation has happened yet.

## Context

RehtiArvio (rehtiarvio.vercel.app) currently collects **no** visitor analytics at all — no tracking script, no cookie-consent banner, no privacy or cookie policy page. The owner (a Finnish sole entrepreneur) wants to start collecting rich visitor data (traffic/behavioral analytics, lead/contact data, future marketing/ad retargeting, and product-usage data — e.g. which postal codes/prices people analyze) so it can be used for business decisions later.

Two things shape this plan:
1. **GDPR/ePrivacy doesn't allow "collect everything now, decide the purpose later."** Consent and lawful basis must be tied to disclosed purposes at collection time. So instead of one big data-grab, the design uses a small number of broad, honestly-disclosed consent categories, each collecting rich data for a stated purpose — this gets close to "as much data as legally possible" without building something that violates purpose-limitation/data-minimization or exposes the owner to a Tietosuojavaltuutettu complaint.
2. **CLAUDE.md is this repo's constitution**, and rule 3 ("No personal data storage beyond what's declared") explicitly exists to keep `query_log`/`leads`/`reports.facts` minimal. Adding analytics is a deliberate, real amendment to that rule, not a quiet extension — it's called out as its own step below, requiring the owner's explicit sign-off, per CLAUDE.md's own preamble.

The owner chose: collect all four data categories (traffic analytics, leads, marketing/ad tracking, product usage), and prefers first-party/EU-hosted tooling over US tools like GA4/Meta Pixel.

## Approach

**Analytics engine: PostHog EU Cloud** (`eu.posthog.com`), not a fully custom Supabase event pipeline. A hand-rolled Supabase event table would give rows, not a product — no autocapture, funnels, or dashboards — for more engineering effort and less richness than PostHog's free tier, which comfortably covers a portfolio-scale site. It's genuinely EU-hosted, offers a DPA, and has a self-host path later if the owner wants to fully internalize it. Marketing/ad-retargeting pixels (Meta/Google Ads) are inherently non-EU third parties — the plan builds the consent category and plumbing now but defers wiring an actual pixel until the owner picks a specific ad platform.

**Consent categories: three, not four.** Necessary (always on: existing `ra_access` cookie + the new `ra_consent` cookie itself), Analytics (opt-in; covers *both* traffic/behavioral data and product-usage events like postal-code/price queries under one disclosed purpose, so today's product events and future traffic-analytics expansion never need separate re-consent), Marketing (opt-in, inert placeholder for a future ad pixel). No fourth "personalization" category — nothing in the product does personalization today, and inventing one would repeat the "collect first, decide later" anti-pattern.

**Split for the analytics category:** client-side `posthog-js` (dynamically imported, never loaded before consent) for pageviews/autocapture/traffic; server-side `posthog-node` called from existing action sites (`+page.server.ts`, `arvio/+page.server.ts`, `tili/+page.server.ts`) for product-usage events, gated by reading the `ra_consent` cookie server-side — more reliable than client beacons since ad blockers routinely kill client-side trackers. **`query_log` stays completely untouched** — no visitor correlation added to it, so it remains trivially non-personal data exactly as rule 3 describes; the new pseudonymous stream is a parallel lane.

**Consent audit trail:** a new `consent_log` Supabase table (service-role-write-only, RLS enabled with no public policies — same convention as `query_log`/`leads`), written via a `logConsent()` addition to `src/lib/server/supalog.ts` using the existing best-effort, never-throws pattern (rule 8). No raw IP or user-agent stored in it — minimization; it only needs to prove *what* was agreed, *when*, under *which notice version* (GDPR Art. 7(1)'s burden of proof), not who agreed. The consent cookie carries a version number (`v`) that can be bumped to force re-prompting everyone if a materially new purpose is added later (e.g. naming a specific ad platform).

**"Manage cookie preferences" is not a second widget** — `/evasteet` embeds the same preference-toggle component the banner uses, pre-filled with the current choice, satisfying "withdrawal as easy as consent" with one build.

**Waitlist marketing consent is a separate object from the cookie-banner's marketing category** — add one new, unchecked checkbox to the existing waitlist form ("Saan myös lähettää muita RehtiArvion uutisia sähköpostiisi") with its own `leads.marketing_opt_in` column; the `leads` row itself is the audit record for that choice. Don't conflate it with the ad-retargeting consent category. Defer any marketing checkbox on the `/tilaa` Stripe subscriber flow — no promotional emails exist yet to justify the plumbing cost, and existing customers plausibly fall under Finland's soft-opt-in for similar-product marketing.

## Files to add/change

**Schema** (new migration file following the existing `supabase/migrations/*.sql` + hand-applied `supabase/combined_v0.sql` convention — this repo has no CLI-managed Supabase project, SQL is pasted into the dashboard):
- New `consent_log` table (id, created_at, visitor_id, consent_version, necessary/analytics/marketing booleans, action enum, source_path) — RLS enabled, no policies.
- Alter `leads`: add `marketing_opt_in boolean not null default false`.

**Consent primitives** (server):
- `src/lib/server/consent.ts` — cookie shape parse/serialize, version constant.
- `logConsent()` added to `src/lib/server/supalog.ts`, mirroring `logQuery`/`addLead`'s fire-and-forget shape.
- `src/routes/api/consent/+server.ts` — POST endpoint: sets the `ra_consent` cookie, calls `logConsent()`.
- `+layout.server.ts` — parse `ra_consent` server-side and hand initial state to the client (no banner flash for returning visitors).

**Consent UI** (Svelte, following rule 10's monochrome ink/paper tokens + rule 11 Finnish-content/English-code):
- `src/lib/consent/state.svelte.ts` — runes-based store the banner, `/evasteet`, and the analytics loader all read.
- `src/lib/components/ui/Dialog.svelte` — native `<dialog>` primitive (no new UI-library dependency; none exists in the repo today).
- `ConsentBanner.svelte` (accept-all / reject-all with **equal visual weight** — no dark pattern — plus "customize") and `ConsentPreferences.svelte` (the toggle list, reused by both the banner and `/evasteet`).
- `src/lib/components/chrome/Footer.svelte` — add an `/evasteet` link alongside the existing `/miksi`/StatFin/Fides links.

**Analytics wiring** (only after the gating logic above is proven inert-by-default):
- Add `posthog-js` / `posthog-node` deps.
- `src/lib/analytics/posthog-client.ts` + an `AnalyticsLoader.svelte` mounted once in `+layout.svelte`: dynamically imports `posthog-js` and calls `posthog.init()` only when the consent store's `analytics` flag is true.
- `src/lib/server/analytics.ts` (`trackServerEvent`, same best-effort shape as `supalog.ts`), called from `+page.server.ts` (`analyzer_submitted`, `report_ordered`, `waitlist_joined`), `arvio/+page.server.ts` (`analyzer_submitted`), `tili/+page.server.ts` (`subscription_activated` — fired from the page load after Stripe activation, not from the webhook, since the webhook has no visitor cookie to attach a `distinct_id` to). Events carry non-PII fields only (postal code, price delta, confidence tier) — never email/URL/address/document text, mirroring rule 3/5's existing boundary.
- Env vars in Vercel: `PUBLIC_POSTHOG_KEY` (PostHog's project key is designed to be public, like a Stripe publishable key) and `POSTHOG_HOST=https://eu.i.posthog.com`.
- Owner does once, in the PostHog dashboard (not code): create the EU-region project, turn off session recording, discard/anonymize IP at ingestion, set an explicit event-retention window, set `person_profiles: identified_only` so rejecting visitors never get a stored profile.

**New pages** (following the existing `/miksi` template: `PageHero` + `.page { max-width: var(--container-prose) }` + copy sourced from `src/lib/copy/fi.ts`):
- `/tietosuoja` (privacy policy) — controller identity (owner must supply Y-tunnus/business address/contact email — currently a placeholder blocking production go-live), data collected + legal basis per lane, retention table, sub-processors (Supabase — confirm its project region is actually EU before naming it as such — PostHog, Vercel, and **Stripe**, which has no prior disclosure anywhere since no privacy policy exists yet at all), international-transfer note, data-subject-rights section with a link to tietosuoja.fi, a short note that the benchmark verdict isn't an Art. 22 automated decision.
- `/evasteet` (cookie policy) — the three categories explained, a cookie table (`ra_consent`, `ra_access`, PostHog's own cookies, a placeholder marketing row), and the live embedded `ConsentPreferences` manager.

**CLAUDE.md** — present as an explicit diff requiring the owner's sign-off before merging (not silently merged):
- Append one clarifying sentence to rule 3 noting the new analytics lane is separate from `query_log` and must never be merged into it.
- Add new rule 13 (new `### Privacy / consent` subsection, after rule 12) documenting the three consent categories, that PostHog must never fire before `ra_consent` records `analytics:true`, and that `consent_log` is the Art. 7(1) proof-of-consent record.
- Add a line to `docs/ROADMAP.md`'s "Next up" section noting the consent system shipped.

## Sequencing

1. **Schema** — migration + `combined_v0.sql` update. Verify: table/column exist in Supabase, RLS has zero policies, an anon-key insert is rejected.
2. **Consent primitives** (cookie + `/api/consent` + `logConsent`), no visible UI yet. Verify: POST sets the cookie, a `consent_log` row appears.
3. **Consent banner + gating** wired into the layout, `/evasteet` footer link added. Verify (manual browser check — no Playwright infra exists in this repo yet): accept-all / reject-all / customize each write the right `consent_log` row and persist across reload; `/evasteet`'s manager pre-fills and updates state.
4. **Analytics wiring**, only once step 3 is proven inert-by-default. Verify: with analytics rejected, zero network requests to any `*.posthog.com` host across a full click-through; with it accepted, exactly one capture per pageview/event to `eu.i.posthog.com`; `analyzer_submitted` shows only non-PII fields; `query_log` row shape is unchanged.
5. **Privacy/cookie pages**, content finalized against what steps 1–4 actually collect. These must ship to production in the *same release* as the banner — a live banner pointing at a nonexistent privacy policy is itself a gap.
6. **CLAUDE.md amendment**, presented last as a sign-off diff, since it documents the finished state.

## Open decisions for the owner

- Y-tunnus, business address, contact email for `/tietosuoja` (blocks production go-live).
- Retention periods: unconverted `leads` emails (currently indefinite), `consent_log`, PostHog event retention, and whether Finnish bookkeeping law (kirjanpitolaki, ~6 years) should override GDPR-minimization instinct for Stripe-derived `subscribers` data — worth a quick check with an accountant.
- Confirm the live Supabase project's region is actually EU before the privacy policy states so.
- Whether to add committed Playwright specs for the consent flows (permanent regression coverage) vs. the one-time manual verification above.
