import { fail } from '@sveltejs/kit';
import { evaluate, type ListingFacts } from '$lib/server/benchmark';
import {
	allowedListingUrl, deriveInsights, htmlToText, parseListingText,
	type ExtractedListing
} from '$lib/server/listing-parse';
import type { Actions } from './$types';

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
	default: async ({ request, fetch }) => {
		const form = await request.formData();
		const pasted = String(form.get('text') ?? '').trim();
		const urlRaw = String(form.get('url') ?? '').trim();

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
					headers: { 'user-agent': 'asuntoarvio/0.1 (kayttajan oma due diligence -haku, 1 sivu)' },
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
		// listing data resolves the generic hedges the bare form cannot
		const resolvedFlags = verdict.flags.filter(
			(f) =>
				!(extracted.condition && f.startsWith('Rakennusvuosi ei tiedossa')) &&
				!f.startsWith('Postinumeroalueen keskiarvo ei erottele')
		);
		resolvedFlags.push(
			'Mikrosijaintia (katu, kerros, näkymä) vertailu ei vielä erottele — se vaatii kauppakohtaista aineistoa.'
		);

		return {
			extracted,
			facts,
			verdict: { ...verdict, flags: resolvedFlags },
			insights: deriveInsights(extracted),
			source
		};
	}
};
