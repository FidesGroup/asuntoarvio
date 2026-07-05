import { fail } from '@sveltejs/kit';
import { knownPostalCodes, evaluate, locationBenchmark } from '$lib/server/benchmark';
import { geocodeAddress } from '$lib/server/geocode';
import { addLead, logQuery } from '$lib/server/supalog';
import {
	allowedListingUrl, deriveInsights, htmlToText, parseListingText,
	type ExtractedListing
} from '$lib/server/listing-parse';
import type { ListingFacts } from '$lib/server/benchmark';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pc = url.searchParams.get('pc');
	return {
		postalCodes: knownPostalCodes(),
		prefillPc: pc && /^\d{5}$/.test(pc) ? pc : null
	};
};

function toFacts(x: ExtractedListing): ListingFacts | { error: string } {
	if (!x.postalCode) return { error: 'Postinumeroa ei löytynyt ilmoituksesta (Sijainti-kenttä).' };
	if (!x.roomsType) return { error: 'Huonelukua ei löytynyt ilmoituksesta.' };
	if (!x.livingAreaM2) return { error: 'Asuinpinta-alaa ei löytynyt ilmoituksesta.' };
	const price = x.debtFreePriceEur ?? x.askingPriceEur;
	if (!price) return { error: 'Hintaa ei löytynyt ilmoituksesta.' };
	return {
		postalCode: x.postalCode,
		roomsType: x.roomsType,
		livingAreaM2: x.livingAreaM2,
		priceEur: price,
		priceIsDebtFree: x.debtFreePriceEur !== null,
		buildYear: x.buildYear
	};
}

export const actions: Actions = {
	waitlist: async ({ request }) => {
		const email = String((await request.formData()).get('email') ?? '').trim().toLowerCase();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
			return fail(400, { waitlistError: 'Tarkista sähköpostiosoite.' });
		}
		const ok = await addLead(email, 'landing-waitlist');
		if (!ok) return fail(503, { waitlistError: 'Tallennus epäonnistui — yritä hetken kuluttua uudelleen.' });
		return { joined: true };
	},

	default: async ({ request, fetch }) => {
		const fd = await request.formData();
		const pasted = String(fd.get('text') ?? '').trim();
		const urlRaw = String(fd.get('url') ?? '').trim();

		let text = pasted;
		let source: string | null = null;

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
				text = htmlToText(html);
				source = url.hostname;
			} catch (e) {
				return fail(502, {
					error: `Sivun haku epäonnistui (${e instanceof Error ? e.message : 'tuntematon virhe'}). Portaali voi estää automaattisen haun — avaa ilmoitus selaimessa, valitse kaikki (Ctrl+A), kopioi ja liitä teksti alla olevaan kenttään.`
				});
			}
		}
		if (!text) return fail(400, { error: 'Liitä ilmoituksen teksti tai anna ilmoituksen osoite.' });

		const extracted = parseListingText(text);
		const facts = toFacts(extracted);
		if ('error' in facts) {
			return fail(422, {
				error: `${facts.error} ${source ? 'Sivu ei ehkä sisällä tietoja ilman selainta — liitä ilmoituksen teksti suoraan.' : 'Tarkista että liitit koko ilmoituksen (Ctrl+A → kopioi).'}`
			});
		}

		const verdict = evaluate(facts);

		let location: {
			eurM2: number;
			deltaPct: number;
			lon: number;
			lat: number;
			areasUsed: { pc: string; nimi: string; eurM2: number; km: number }[];
		} | null = null;
		if (extracted.address) {
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
				? 'Sijaintipainotettu vertailu on naapurialueiden kauppojen etäisyyspainotus (beta) — katu- ja rakennustason kauppahistoriaa se ei vielä sisällä.'
				: 'Mikrosijaintia (katu, kerros, näkymä) vertailu ei vielä erottele — se vaatii kauppakohtaista aineistoa.'
		);

		await logQuery({
			postal_code: facts.postalCode,
			rooms_type: facts.roomsType,
			living_area_m2: facts.livingAreaM2,
			price_eur: facts.priceEur,
			delta_pct: location?.deltaPct ?? verdict.deltaPct,
			confidence: verdict.confidence
		});

		return {
			extracted,
			facts,
			verdict: { ...verdict, flags: resolvedFlags },
			insights: deriveInsights(extracted),
			location,
			source
		};
	}
};
