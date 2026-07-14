/**
 * Beginner-mode explained review: plain-language factors with four parts each.
 * Each factor has: Mitä tämä on (What) / Tässä kohteessa (Here) / Miksi väliä (Why) / Tarkista vielä (Check).
 * Plus confidence meter: tier name + what's missing for higher confidence.
 */
import type { ExtractedListing } from './listing-parse';
import type { ValuationTier } from './valuation';

export interface ReviewFactor {
	category: 'what' | 'here' | 'why' | 'check' | 'confidence';
	title: string;
	content: string;
	tier?: 'T1' | 'T2' | 'T3' | 'T4'; // used for confidence meter
	priority?: 'high' | 'medium' | 'low';
}

const TIER_LABELS: Record<string, string> = {
	'T1': 'postinumeroaluevertailuun (korkea luotettavuus)',
	'T2': 'kunnan keskiarvoon (kohtalainen luotettavuus)',
	'T3': 'alueen keskiarvoon (kohtalainen luotettavuus)',
	'T4': 'kohteen kuntoon (suuntaa antava)'
};

const CONFIDENCE_METER: Record<string, { label: string; whatsMissing: string[] }> = {
	T1: {
		label: 'Korkea luotettavuus',
		whatsMissing: []
	},
	T2: {
		label: 'Kohtalainen luotettavuus',
		whatsMissing: ['tarkempi postinumerotason data']
	},
	T3: {
		label: 'Kohtalainen luotettavuus (aluevertailu)',
		whatsMissing: ['paikallisten kauppojen data', 'postinumeroalueen erityispiirteet']
	},
	'T4': {
		label: 'Suuntaa antava arvio',
		whatsMissing: [
			'vertailukaupat (niitä on liian vähän)',
			'toteutuneiden myyntihintojen vertailupohja',
			'kohteen yksilöllisten tekijöiden vaikutus'
		]
	}
};

/**
 * Translate factor into beginner-friendly explanation (4 parts + review).
 */
export function buildReview(listing: ExtractedListing, tier: ValuationTier): ReviewFactor[] {
	const factors: ReviewFactor[] = [];
	const isHouse = listing.propertyClass === 'omakotitalo' || listing.propertyClass === 'paritalo';

	// === CONDITION ===
	if (listing.condition) {
		factors.push({
			category: 'what',
			title: 'Kunto',
			content: 'Kunto kertoo asunnon yleisestä ja teknisestä tilasta. Siitä näkee, kuinka paljon remonttia on vielä edessä.'
		});
		factors.push({
			category: 'here',
			title: 'Tässä kohteessa',
			content: `Ilmoitettu kunto: ${listing.condition}.${
				listing.renovationsDone.length > 0
					? ` Remontteja tehty: ${listing.renovationsDone.map((r) => `${r.text} (${r.year})`).join(', ')}.`
					: ''
			}`
		});
		factors.push({
			category: 'why',
			title: 'Miksi tällä on väliä',
			content:
				'Huonokuntoinen asunto vaatii remontteja, jotka maksavat. Hyväkuntoinen asunto säilyttää arvonsa paremmin, ja yllättävien korjauskulujen riski on pienempi.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Kuntotutkimus antaa tarkan kuvan. Suosi kohteita, joissa isot remontit (putket, katto, sähköt) on jo tehty.'
		});
	}

	// === BUILD YEAR & AGE ===
	if (listing.buildYear) {
		const age = new Date().getFullYear() - listing.buildYear;
		factors.push({
			category: 'what',
			title: 'Ikä',
			content: 'Rakennusvuosi kertoo talon iästä. Vanhemmat talot vaativat usein enemmän ylläpitoa, mutta voivat olla paremmin rakennettuja.'
		});
		factors.push({
			category: 'here',
			title: 'Tässä kohteessa',
			content: `Rakennettu ${listing.buildYear}, nyt ${age} vuotta vanha.`
		});
		factors.push({
			category: 'why',
			title: 'Miksi tällä on väliä',
			content:
				age > 40
					? 'Yli 40-vuotiaassa talossa putkiremontti on todennäköisesti edessä lähivuosina, jos sitä ei ole vielä tehty. Varaudu näihin kuluihin.'
					: 'Uudempi rakennus vaatii yleensä vähemmän korjauksia, mutta ostohinta on korkeampi.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Kuntotutkimus ja remonttihistoria löytyvät myyjältä tai isännöitsijältä.'
		});
	}

	// === LAND (detached houses only) ===
	if (isHouse && listing.tonttiAreaM2) {
		factors.push({
			category: 'what',
			title: 'Tontti',
			content: 'Tontin koko ja omistusmuoto vaikuttavat kodin arvoon ja asumiskustannuksiin.'
		});
		factors.push({
			category: 'here',
			title: 'Tässä kohteessa',
			content: `Tontin pinta-ala: ${listing.tonttiAreaM2} m². Omistus: ${
				listing.landOwnership === 'Oma' ? 'omaa maata' : listing.landOwnership || 'tuntematon'
			}.`
		});
		factors.push({
			category: 'why',
			title: 'Miksi tällä on väliä',
			content:
				listing.landOwnership === 'Oma'
					? 'Omalla tontilla ei ole tontinvuokraa, joka voisi nousta tulevaisuudessa.'
					: 'Vuokratontista maksetaan vuokraa vuosittain, ja vuokra voi nousta. Tämä alentaa kohteen arvoa.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Vuokratonteilla tarkista sopimuksen päättymisvuosi ja vuokrankorotuspolitiikka.'
		});
	}

	// === MAINTENANCE CHARGES (apartments only) ===
	if (!isHouse && listing.totalChargeEurMo) {
		factors.push({
			category: 'what',
			title: 'Vastikkeet',
			content: 'Vastike on kuukausittainen maksu, jolla katetaan taloyhtiön ylläpito (lämmitys, sähkö, siivous, korjaukset).'
		});
		factors.push({
			category: 'here',
			title: 'Tässä kohteessa',
			content: `Vastikkeet yhteensä ${listing.totalChargeEurMo.toLocaleString('fi-FI')} €/kk.`
		});
		factors.push({
			category: 'why',
			title: 'Miksi tällä on väliä',
			content:
				'Vastike on kuukausittainen asumiskustannus siinä missä vuokrakin. Korkea vastike pienentää sijoituksen tuottoa ja jää maksettavaksi joka kuukausi.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Kysy isännöitsijältä vastikkeen kehityksestä ja tulevista suunnitelmista. Korkea vastike voi kertoa tulossa olevista remonteista.'
		});
	}

	// === CONFIDENCE METER ===
	const meter = CONFIDENCE_METER[tier.tier] || CONFIDENCE_METER['T4'];
	let confidenceText = `Arvio perustuu ${TIER_LABELS[tier.tier] || TIER_LABELS['T4']}.`;
	if (meter.whatsMissing.length > 0) {
		confidenceText += ` Luotettavuutta parantaisi: ${meter.whatsMissing.join(', ')}.`;
	}
	if (tier.tier === 'T4') {
		confidenceText += ' Tämä on suuntaa antava arvio, ei todellinen vertailu.';
	}

	factors.push({
		category: 'confidence',
		title: `Luotettavuus: ${meter.label}`,
		content: confidenceText,
		tier: tier.tier
	});

	return factors;
}
