import { fail, redirect } from '@sveltejs/kit';
import { knownPostalCodes, evaluateProperty, locationBenchmark } from '$lib/server/benchmark';
import { marketStats } from '$lib/server/marketstats';
import { geocodeAddress } from '$lib/server/geocode';
import { createReport } from '$lib/server/reports';
import { getSubscriberByToken } from '$lib/server/subscribers';
import { addLead, logQuery } from '$lib/server/supalog';
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

export const load: PageServerLoad = async ({ url }) => {
	const pc = url.searchParams.get('pc');
	return {
		postalCodes: knownPostalCodes(),
		prefillPc: pc && /^\d{5}$/.test(pc) ? pc : null,
		market: marketStats()
	};
};

function toFacts(x: ExtractedListing): ListingFacts | { error: string } {
	const isHouse = x.propertyClass === 'omakotitalo' || x.propertyClass === 'paritalo';
	if (!x.postalCode) return { error: 'Postinumeroa ei löytynyt ilmoituksesta (Sijainti-kenttä).' };
	// Houses have no huonetyyppi cell; apartments/row houses need it for the benchmark.
	if (!x.roomsType && !isHouse) return { error: 'Huonelukua ei löytynyt ilmoituksesta.' };
	if (!x.livingAreaM2) return { error: 'Asuinpinta-alaa ei löytynyt ilmoituksesta.' };
	const price = x.debtFreePriceEur ?? x.askingPriceEur;
	if (!price) return { error: 'Hintaa ei löytynyt ilmoituksesta.' };
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
	waitlist: async ({ request }) => {
		const email = String((await request.formData()).get('email') ?? '').trim().toLowerCase();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
			return fail(400, { waitlistError: 'Tarkista sähköpostiosoite.' });
		}
		const ok = await addLead(email, 'landing-waitlist');
		if (!ok) return fail(503, { waitlistError: 'Tallennus epäonnistui. Yritä hetken kuluttua uudelleen.' });
		return { joined: true };
	},

	// NB: named because SvelteKit forbids a default action next to named ones
	// (waitlist/report) — the form posts to ?/analyze.
	analyze: async ({ request, fetch }) => {
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
						'Osoite ei kelpaa. Tuetut: asunnot.oikotie.fi, etuovi.com, kiinteistomaailma.fi, remax.fi (https). Voit aina liittää ilmoituksen tekstin suoraan.'
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
					error: `Sivun haku epäonnistui (${e instanceof Error ? e.message : 'tuntematon virhe'}). Portaali voi estää automaattisen haun. Avaa ilmoitus selaimessa, valitse kaikki (Ctrl+A), kopioi ja liitä teksti alla olevaan kenttään.`
				});
			}
		}
		if (!text) return fail(400, { error: 'Liitä ilmoituksen teksti tai anna ilmoituksen osoite.' });

		// URL path: JSON-LD/__NEXT_DATA__ extraction fills gaps in label parsing.
		const extracted = fetchedHtml ? parseListingHtml(fetchedHtml) : parseListingText(text);
		const facts = toFacts(extracted);
		if ('error' in facts) {
			return fail(422, {
				error: `${facts.error} ${source ? 'Sivu ei ehkä sisällä tietoja ilman selainta. Liitä ilmoituksen teksti suoraan.' : 'Tarkista, että liitit koko ilmoituksen (Ctrl+A → kopioi).'}`
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
				!(extracted.condition && f.startsWith('Rakennusvuosi ei tiedossa')) &&
				!f.startsWith('Postinumeroalueen keskiarvo ei erottele')
		);
		resolvedFlags.push(
			location
				? 'Sijaintipainotettu vertailu on naapurialueiden kauppojen etäisyyspainotus (beta). Katu- ja rakennustason kauppahistoriaa se ei vielä sisällä.'
				: 'Mikrosijaintia (katu, kerros, näkymä) vertailu ei vielä erottele. Se vaatii kauppakohtaista aineistoa.'
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

		return {
			extracted,
			facts,
			verdict: { ...verdict, flags: resolvedFlags },
			insights: deriveInsights(extracted),
			tier,
			review,
			location,
			source,
			reportPayload
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
		if (!raw || raw.length > 24_000) return fail(400, { reportError: 'Virheellinen pyyntö.' });
		let payload: Record<string, unknown>;
		try {
			payload = JSON.parse(raw);
		} catch {
			return fail(400, { reportError: 'Virheellinen pyyntö.' });
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
		if (!id) return fail(503, { reportError: 'Tallennus epäonnistui. Yritä hetken kuluttua.' });
		redirect(303, `/raportti/${id}`);
	}
};
