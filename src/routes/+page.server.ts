import { fail, redirect } from '@sveltejs/kit';
import { knownPostalCodes, evaluateProperty, locationBenchmark, lookupCell } from '$lib/server/benchmark';
import { computeYield } from '$lib/server/yield';
import { marketStats } from '$lib/server/marketstats';
import { exampleCases } from '$lib/server/examples';
import { fetchCountryHistory } from '$lib/server/country-history';
import { geocodeAddress } from '$lib/server/geocode';
import { createReport } from '$lib/server/reports';
import { getSubscriberByToken } from '$lib/server/subscribers';
import { addLead, logQuery } from '$lib/server/supalog';
import { analyticsDistinctId } from '$lib/server/consent';
import { trackServerEvent } from '$lib/server/analytics';
import {
	allowedListingUrl, deriveInsights, htmlToText, parseListingText, parseListingHtml,
	type ExtractedListing
} from '$lib/server/listing-parse';
import { parseDocsText, deriveDocInsights } from '$lib/server/doc-parse';
import { resolveValuation } from '$lib/server/valuation';
import { buildReview } from '$lib/server/review';
import { estimateRent } from '$lib/server/rents';
import type { ListingFacts } from '$lib/server/benchmark';
import { copy } from '$lib/copy/fi';
import type { Actions, PageServerLoad } from './$types';

/** vero.fi, varainsiirtovero (asunto-osakkeet) 1.5%, page updated 2026-01-01. */
const TRANSFER_TAX_RATE = 0.015;
/** Interest assumption for own-vs-rent, stated as pure cost in the UI. */
const OWN_VS_RENT_INTEREST = 0.035;

const PIPE_RENO_RE = /putki|lvi|linjasaneeraus|käyttövesi/i;

function pipeRenovationPhase(
	buildYear: number | null,
	renovationsDone: { text: string }[]
): 'near' | 'in' | 'done' | null {
	if (renovationsDone.some((r) => PIPE_RENO_RE.test(r.text))) return 'done';
	if (!buildYear) return null;
	const age = new Date().getFullYear() - buildYear;
	if (age >= 40 && age <= 70) return 'in';
	if (age >= 30) return 'near';
	return null;
}

export const load: PageServerLoad = async ({ url }) => {
	const pc = url.searchParams.get('pc');
	return {
		postalCodes: knownPostalCodes(),
		prefillPc: pc && /^\d{5}$/.test(pc) ? pc : null,
		market: marketStats(),
		examples: exampleCases(),
		lazy: { country: fetchCountryHistory() }
	};
};

function toFacts(x: ExtractedListing): ListingFacts | { error: string } {
	const isHouse = x.propertyClass === 'omakotitalo' || x.propertyClass === 'paritalo';
	if (!x.postalCode) return { error: 'Ilmoituksesta ei löytynyt postinumeroa (Sijainti-kenttä).' };
	// Houses have no huonetyyppi cell; apartments/row houses need it for the benchmark.
	if (!x.roomsType && !isHouse) return { error: 'Ilmoituksesta ei löytynyt huonelukua.' };
	if (!x.livingAreaM2) return { error: 'Ilmoituksesta ei löytynyt asuinpinta-alaa.' };
	const price = x.debtFreePriceEur ?? x.askingPriceEur;
	if (!price) return { error: 'Ilmoituksesta ei löytynyt hintaa.' };
	return {
		postalCode: x.postalCode,
		roomsType: x.roomsType,
		livingAreaM2: x.livingAreaM2,
		priceEur: price,
		priceIsDebtFree: x.debtFreePriceEur !== null,
		buildYear: x.buildYear,
		propertyClass: x.propertyClass
	};
}

export const actions: Actions = {
	waitlist: async ({ request, cookies }) => {
		const fd = await request.formData();
		const email = String(fd.get('email') ?? '').trim().toLowerCase();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
			return fail(400, { waitlistError: 'Tarkistathan sähköpostiosoitteen.' });
		}
		// Distinct from the cookie-banner's marketing category: this is the
		// waitlist form's own, separately-consented opt-in for RehtiArvio's
		// own emails beyond the waitlist notification itself (unchecked by default).
		const marketingOptIn = fd.get('marketingOptIn') === 'on';
		const ok = await addLead(email, 'landing-waitlist', marketingOptIn);
		if (!ok) return fail(503, { waitlistError: 'Tallennus ei nyt onnistunut. Yritäthän hetken kuluttua uudelleen.' });
		const cid = analyticsDistinctId(cookies);
		if (cid) await trackServerEvent(cid, 'waitlist_joined', {});
		return { joined: true };
	},

	// NB: named because SvelteKit forbids a default action next to named ones
	// (waitlist/report) — the form posts to ?/analyze.
	analyze: async ({ request, fetch, cookies }) => {
		const fd = await request.formData();
		const pasted = String(fd.get('text') ?? '').trim();
		const urlRaw = String(fd.get('url') ?? '').trim();

		let text = pasted;
		let fetchedHtml: string | null = null;
		let source: string | null = null;
		let sourceUrl: string | null = null;

		if (!text && urlRaw) {
			const url = allowedListingUrl(urlRaw);
			if (!url) {
				return fail(400, {
					error:
						'Tämä osoite ei kelpaa. Toimivat: asunnot.oikotie.fi, etuovi.com, kiinteistomaailma.fi, remax.fi (https). Voit myös aina liittää ilmoituksen tekstin suoraan.'
				});
			}
			try {
				const res = await fetch(url, {
					headers: { 'user-agent': 'rehtiarvio/0.1 (kayttajan oma due diligence -haku, 1 sivu)' },
					signal: AbortSignal.timeout(8000)
				});
				if (!res.ok) throw new Error(`HTTP ${res.status}`);
				const html = (await res.text()).slice(0, 2_000_000);
				fetchedHtml = html;
				text = htmlToText(html);
				source = url.hostname;
				sourceUrl = url.href;
			} catch (e) {
				return fail(502, {
					error: `Sivun haku ei onnistunut (${e instanceof Error ? e.message : 'tuntematon virhe'}). Portaali voi estää automaattisen haun. Avaa ilmoitus selaimessa, valitse kaikki (Ctrl+A), kopioi ja liitä teksti alla olevaan kenttään.`
				});
			}
		}
		if (!text) return fail(400, { error: 'Liitä ilmoituksen teksti tai anna sen osoite, niin päästään alkuun.' });

		// URL path: JSON-LD/__NEXT_DATA__ extraction fills gaps in label parsing.
		const extracted = fetchedHtml ? parseListingHtml(fetchedHtml) : parseListingText(text);
		const facts = toFacts(extracted);
		if ('error' in facts) {
			return fail(422, {
				error: `${facts.error} ${source ? 'Sivu ei ehkä näytä tietoja ilman selainta. Liitä ilmoituksen teksti suoraan.' : 'Varmistathan, että liitit koko ilmoituksen (Ctrl+A → kopioi).'}`
			});
		}

		const verdict = evaluateProperty(facts);
		const tier = resolveValuation(extracted);
		const review = buildReview(extracted, tier);

		let location: {
			eurM2: number;
			deltaPct: number;
			lon: number;
			lat: number;
			areasUsed: { pc: string; nimi: string; eurM2: number; km: number }[];
		} | null = null;
		// Location blend is apartment-only: it interpolates room-type cells.
		if (extracted.address && facts.roomsType) {
			const geo = await geocodeAddress(fetch, extracted.address, extracted.postalCode);
			if (geo) {
				const lb = locationBenchmark(geo.lon, geo.lat, facts.roomsType);
				if (lb) {
					location = {
						eurM2: lb.eurM2,
						deltaPct: Math.round((verdict.listingEurM2 / lb.eurM2 - 1) * 1000) / 10,
						lon: geo.lon,
						lat: geo.lat,
						areasUsed: lb.areasUsed
					};
				}
			}
		}

		const resolvedFlags = verdict.flags.filter(
			(f) =>
				!(extracted.condition && f.startsWith('Rakennusvuotta ei tiedetä')) &&
				!f.startsWith('Postinumeroalueen keskiarvo ei erottele')
		);
		resolvedFlags.push(
			location
				? 'Sijaintipainotettu vertailu painottaa naapurialueiden kauppoja niiden etäisyyden mukaan (beta). Katu- ja rakennustason kauppahistoriaa se ei vielä sisällä.'
				: 'Mikrosijaintia — katua, kerrosta, näkymää — vertailu ei vielä erota. Se vaatisi kauppakohtaista aineistoa.'
		);

		await logQuery({
			postal_code: facts.postalCode,
			// Houses have no room-type cell; log the property class instead.
			rooms_type: facts.roomsType ?? extracted.propertyClass ?? 'tuntematon',
			living_area_m2: facts.livingAreaM2,
			price_eur: facts.priceEur,
			delta_pct: location?.deltaPct ?? verdict.deltaPct,
			confidence: verdict.confidence
		});
		const cid = analyticsDistinctId(cookies);
		if (cid) {
			await trackServerEvent(cid, 'analyzer_submitted', {
				postal_code: facts.postalCode,
				rooms_type: facts.roomsType ?? extracted.propertyClass ?? 'tuntematon',
				delta_pct: location?.deltaPct ?? verdict.deltaPct,
				confidence: verdict.confidence,
				source: source ? 'url' : 'text'
			});
		}

		// Server-built asuntocard job payload: echoed back via a hidden field on
		// the ?/report form so a card can be ordered without re-parsing the text.
		// Detached houses have no housing company, so no report can exist for them.
		const reportPayload = extracted.propertyClass === 'omakotitalo' ? null : JSON.stringify({
			company: extracted.housingCompany,
			address: extracted.address,
			postalCode: facts.postalCode,
			buildYear: facts.buildYear,
			propertyClass: extracted.propertyClass,
			roomsType: facts.roomsType,
			livingAreaM2: facts.livingAreaM2,
			priceEur: facts.priceEur,
			landOwnership: extracted.landOwnership,
			renovationsDone: extracted.renovationsDone,
			renovationsUpcoming: extracted.renovationsUpcoming,
			verdict: {
				deltaPct: verdict.deltaPct,
				listingEurM2: verdict.listingEurM2,
				benchmarkEurM2: verdict.benchmarkEurM2,
				confidence: verdict.confidence
			},
			location: location ? { eurM2: location.eurM2, deltaPct: location.deltaPct } : null,
			source,
			sourceUrl
		});

		// Yield + own-vs-rent with the listing's REAL vastike when published.
		const vastikeEur = extracted.totalChargeEurMo ?? extracted.maintenanceChargeEurMo ?? 0;
		const rentEst = facts.roomsType
			? estimateRent(facts.postalCode, facts.roomsType, facts.livingAreaM2)
			: null;
		const yieldResult =
			rentEst?.monthlyRentEur != null
				? computeYield(
						{
							monthlyRentEur: rentEst.monthlyRentEur,
							monthlyVastikeEur: vastikeEur,
							priceEur: facts.priceEur,
							priceIsDebtFree: facts.priceIsDebtFree,
							livingAreaM2: facts.livingAreaM2
						},
						'estimate'
					)
				: null;
		const ownVsRent =
			rentEst?.monthlyRentEur != null
				? {
						rentEur: rentEst.monthlyRentEur,
						rentPerM2: Math.round((rentEst.monthlyRentEur / facts.livingAreaM2) * 10) / 10,
						rentIsEstimate: true,
						interestEur: Math.round((facts.priceEur * OWN_VS_RENT_INTEREST) / 12),
						vastikeEur: Math.round(vastikeEur),
						reserveEur: yieldResult ? Math.round(yieldResult.reserveEurYr / 12) : 0
					}
				: null;

		const cell = facts.roomsType ? lookupCell(facts.postalCode, facts.roomsType) : null;
		const cellEurs = (cell?.series ?? [])
			.map((s) => s.eur_m2)
			.filter((e): e is number => e !== null);
		const quarterRange =
			cellEurs.length >= 2 ? { min: Math.min(...cellEurs), max: Math.max(...cellEurs) } : null;

		const share = new URLSearchParams({
			pc: facts.postalCode,
			rt: facts.roomsType ?? '',
			m2: String(facts.livingAreaM2),
			price: String(facts.priceEur)
		});
		if (facts.buildYear) share.set('yr', String(facts.buildYear));
		if (vastikeEur > 0) share.set('vastike', String(Math.round(vastikeEur)));

		return {
			extracted,
			facts,
			verdict: { ...verdict, flags: resolvedFlags },
			insights: deriveInsights(extracted),
			tier,
			review,
			location,
			source,
			reportPayload,
			yieldResult,
			ownVsRent,
			quarterRange,
			shareParams: facts.roomsType ? share.toString() : null,
			notes: {
				transferTaxEur: Math.round(facts.priceEur * TRANSFER_TAX_RATE),
				pipeReno: pipeRenovationPhase(facts.buildYear ?? null, extracted.renovationsDone)
			}
		};
	},

	report: async ({ request, cookies }) => {
		const token = cookies.get('ra_access');
		const sub = token ? await getSubscriberByToken(token) : null;
		if (!sub || sub.status !== 'active') {
			return fail(402, {
				reportError: copy.errors.reportNeedSub
			});
		}

		const fd = await request.formData();
		const raw = String(fd.get('payload') ?? '');
		if (!raw || raw.length > 24_000) return fail(400, { reportError: 'Pyyntö ei kelpaa.' });
		let payload: Record<string, unknown>;
		try {
			payload = JSON.parse(raw);
		} catch {
			return fail(400, { reportError: 'Pyyntö ei kelpaa.' });
		}
		if (
			!/^\d{5}$/.test(String(payload?.postalCode ?? '')) ||
			(!payload.company && !payload.address)
		) {
			return fail(400, {
				reportError: copy.errors.reportNeedTarget
			});
		}

		// Optional buyer-pasted documents (isännöitsijäntodistus / tilinpäätös).
		// Parsed deterministically here and discarded: only the structured
		// figures land in `facts` (CLAUDE.md rules 3 and 5) — never the text.
		const docsText = String(fd.get('docs') ?? '').slice(0, 300_000).trim();
		if (docsText) {
			const docs = parseDocsText(docsText);
			if (docs.fieldsFound === 0) {
				return fail(422, { reportError: copy.errors.docsUnparsed });
			}
			const num = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? v : null);
			payload.docs = docs;
			payload.docInsights = deriveDocInsights(docs, {
				livingAreaM2: num(payload.livingAreaM2),
				priceEur: num(payload.priceEur),
				buildYear: num(payload.buildYear)
			});
		}

		const id = await createReport({
			email: sub.email,
			subscriberId: sub.id,
			listingUrl: typeof payload.sourceUrl === 'string' ? payload.sourceUrl : null,
			facts: payload
		});
		if (!id) return fail(503, { reportError: 'Tallennus ei nyt onnistunut. Yritäthän hetken kuluttua.' });
		const cid = analyticsDistinctId(cookies);
		if (cid) {
			await trackServerEvent(cid, 'report_ordered', {
				postal_code: typeof payload.postalCode === 'string' ? payload.postalCode : null,
				has_docs: Boolean(payload.docs)
			});
		}
		redirect(303, `/raportti/${id}`);
	}
};
