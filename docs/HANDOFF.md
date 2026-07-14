# Handoff: consumer-orientation changes

Task list for an implementing agent. Scope: copy and landing-page UX only —
no parser, schema, or route changes. Written 2026-07-14 after a market/UX
review; rationale lives in that review, not here.

## Step 0 — Read constraints first

Read `CLAUDE.md` at repo root. Hard rules that apply to this work:

- UI language is Finnish; code and docs are English.
- A verdict never ships as a naked percentage — always delta + confidence +
  interpretation flags.
- "Lähde: Tilastokeskus" attribution stays visible (footer, map views).
- Stack is SvelteKit 2; square corners, no gradients, no emoji.
- Do not touch `src/lib/server/listing-parse.ts` or anything that fetches
  listing portals.
- Do not build locally (`vite build` fails on Windows by design) — verify
  with `npm run dev` only.

## Step 1 — Jargon sweep in `src/lib/copy/fi.ts`

All UI text lives in this one file. Make these replacements:

- `landing.tabs.url`: `'Anna URL'` → `'Liitä linkki'`
- `landing.result.locationTitle`: `'Sijaintipainotettu vertailu'` →
  `'Lähialueen toteutuneet kaupat'`
- `landing.features.analyzeTitle`: `'Kohdeanalyysi'` → `'Ilmoituksen tarkistus'`
- `miksi.howSteps[3]`: replace `'Saat delta-prosentin ja luotettavuusluokan.'`
  with `'Saat eron alueen hintatasoon euroina ja tiedon, moneenko kauppaan
  vertailu perustuu.'`
- `miksi.tiers`: remove the T1/T3/T4 codes from user-facing text — rewrite
  each `desc` in plain Finnish ("Vähintään 30 kauppaa alueella — vahva
  vertailu", etc.) and change `tierTitle` to `'Kuinka luotettava vertailu on'`.
  Do NOT rename the `T1`/`T3`/`T4` identifiers in TypeScript code — display
  strings only.

## Step 2 — Unify product name: "Asuntocard" → "Taloyhtiöraportti"

In `fi.ts` only (display strings, not code identifiers): `nav.pricing`,
`landing.result.asuntocardTitle/Lede/Cta/NoSub`, the `tilaa` section,
`raportti.eyebrow`. Make `landing.waitlist.h2/body` use the same name so the
waitlist and pricing page clearly describe one product.

Then grep `src/` for hardcoded `asuntocard`/`Asuntocard` in `.svelte` files
(check `PricingTable.svelte`, `UpsellCard.svelte`) and route any stragglers
through `copy`.

Do NOT rename routes, DB columns, or the `reports`/`scorecards` schema.

## Step 3 — Trust copy

In `fi.ts`:

- Add to `landing`: `independence: 'Emme ole välittäjä emmekä hyödy kaupasta —
  vertailu perustuu Tilastokeskuksen toteutuneisiin kauppahintoihin.'`
  Render it in `src/lib/components/sections/HeroAnalyzer.svelte` under the lede.
- Add `privacyNote: 'Emme tallenna ilmoituksia emmekä osoitteita.'`
  Render it as small text below the analyzer form's submit button.

## Step 4 — Euro-first verdict

In `src/lib/components/sections/VerdictBlock.svelte`: the component receives
`verdict` (with delta %) and `facts` (price, m²). Compute the euro difference
from the existing delta and price (e.g. `price − price / (1 + delta)`), round
to nearest 1 000 €, and make the headline "Pyyntihinta on noin X € yli/alle
alueen toteutuneiden kauppojen".

Keep the existing percentage, confidence tier and flags visible directly
beneath — removing them violates CLAUDE.md rule 4. Format numbers with
`Intl.NumberFormat('fi-FI')`.

## Step 5 — Transaction count as the trust signal

In `fi.ts` `landing.result.tier`, the T1/T3 strings already interpolate a
count — reword to lead with it:

- T1 → `` (n) => `Perustuu ${n} toteutuneeseen kauppaan tällä postinumeroalueella` ``
- T3 → `` (n) => `Perustuu ${n} kauppaan laajemmalta alueelta — karkeampi vertailu` ``

## Step 6 — Demo button (zero-effort first result)

`/arvio` renders a shareable SSR verdict purely from URL params. In
`HeroAnalyzer.svelte`, next to the primary CTA add a plain link styled as a
secondary button: "Katso esimerkkiarvio" pointing to
`/arvio?pc=00530&rt=kaksio&m2=54&price=289000&debtfree=1&yr=1961`.

Verify the link renders a full verdict in dev before committing; adjust
params to a postal code with T1 data if 00530 is thin.

## Step 7 — Beginner mode for the manual form

In `HeroAnalyzer.svelte` there is an unused `let beginnerMode = $state(true)`
(line ~37). Wire it:

- When true, show only Postinumero, Huonetyyppi, Pinta-ala, Velaton hinta +
  a toggle link `'Sijoittajalle: lisää vuokra ja vastike'`.
- Toggling reveals Rakennusvuosi, Arvioitu vuokra, Hoitovastike, Hintatyyppi
  (default `velaton`).
- Add a helper line under Hintatyyppi: `'Velaton hinta = myyntihinta +
  yhtiölainaosuus. Ilmoituksissa yleensä molemmat.'`

## Step 8 — Mobile paste instructions

In `fi.ts`, `landing.textPlaceholder` says "valitse kaikki (Ctrl+A)" —
desktop-only. Add `textPlaceholderTouch: 'Avaa ilmoitus → kopioi ilmoituksen
teksti → liitä tähän'` and in `HeroAnalyzer.svelte` pick it via
`matchMedia('(pointer: coarse)')` (evaluate in `onMount` to stay SSR-safe;
default to the desktop string).

## Step 9 — Feature card swap

In `fi.ts` `landing.features`: replace the yield card texts with

- `yieldTitle: 'Remontit ja vastikkeet'`
- `yieldBody: 'Näet mitä ilmoitus kertoo remonteista ja kuluista — ja mitä se
  jättää kertomatta.'`

Keep the actual yield computation in results untouched. In
`FeatureGrid.svelte`, the `yield` icon (€-symbol path) no longer fits — swap
to a simple wrench/document stroke icon matching the existing 1.8-stroke style.

## Step 10 — Rewrite case studies

In `src/lib/components/sections/CaseGrid.svelte`, rewrite the four `items`
bodies as buyer stories with euro outcomes, e.g. case 1: `'Ensiasunnon ostaja
huomasi, ettei putkiremonttia ollut hinnoiteltu — budjetoi 320 €/m² lisää ja
tarjosi vähemmän.'` Keep length within ~2 sentences per card; keep the
existing delta/outcome fields.

## Step 11 — Verify

Run `npm run dev`, then check:

- `/` renders hero + independence line + demo link.
- Beginner form submits to `/arvio` and shows the euro-first verdict with
  % + confidence still visible.
- Demo link works.
- `/miksi` has no T1/T3/T4 codes visible.
- `/tilaa` and the waitlist both say Taloyhtiöraportti.
- Footer still shows Tilastokeskus attribution.
- Grep for leftover `Asuntocard` in display strings.

Commit in small batches per step.

## Out of scope for this pass

Needs owner decisions/design: PWA share-target, per-city SEO pages, updating
CLAUDE.md's investor→consumer positioning line.
