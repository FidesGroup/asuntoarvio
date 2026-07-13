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
	'T1': 'Postinumeroaluevertailu — korkea luotettavuus',
	'T2': 'Kunnan keskiarvo — kohtalainen luotettavuus',
	'T3': 'Alueen keskiarvo — kohtalainen luotettavuus',
	'T4': 'Kunto-perusteinen arvio — suuntaa-antava'
};

const CONFIDENCE_METER: Record<string, { label: string; whatsMissing: string[] }> = {
	T1: {
		label: 'Korkea luotettavuus',
		whatsMissing: []
	},
	T2: {
		label: 'Kohtalainen luotettavuus',
		whatsMissing: ['Postinumeroalueen yksityiskohtaisuutta']
	},
	T3: {
		label: 'Kohtalainen luotettavuus (aluevertailu)',
		whatsMissing: ['Paikallisten kauppojen dataa', 'Postinumeroalueen erityispiirteitä']
	},
	'T4': {
		label: 'Suuntaa-antava arvio',
		whatsMissing: [
			'Vertailukohteita (liian vähän kauppoja)',
			'Todellisen myyntihinnan vertailupohjaa',
			'Kohteen yksilöllisten tekijöiden vaikutusta'
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
			content: 'Kohteen kunto kuvaa talon yleis- ja teknisen tilan. Arviosta näkyy, kuinka paljon remontointia vielä tarvitaan.'
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
			title: 'Miksi tällä on väliä rahallesi',
			content:
				'Huono kunto merkitsee tulevaa remontoinnin tarvetta, mikä on kallista. Hyvä kunto auttaa arvon säilymisessä ja välttää yllätyksellisiä korjauskuluja.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Kuntotutkimus antaa tarkan kuvan. Suosi kohteet, joissa isot remontit on jo tehty (putket, katto, sähköt).'
		});
	}

	// === BUILD YEAR & AGE ===
	if (listing.buildYear) {
		const age = new Date().getFullYear() - listing.buildYear;
		factors.push({
			category: 'what',
			title: 'Ikä',
			content: 'Rakennusvuosi kertoo talon iästä. Vanhemmat talot vaativat usein enemmän ylläpitoa, mutta voivat olla paremmin rakennetut.'
		});
		factors.push({
			category: 'here',
			title: 'Tässä kohteessa',
			content: `Rakennettu ${listing.buildYear}, nyt ${age} vuotta vanha.`
		});
		factors.push({
			category: 'why',
			title: 'Miksi tällä on väliä rahallesi',
			content:
				age > 40
					? 'Vanhassa talossa pitkien putkien saneeraus on todennäköinen pian. Budjeti näille kuluille.'
					: 'Uudempi rakennus on usein arvokkaampi, mutta ostohinta on korkeampi.'
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
			title: 'Miksi tällä on väliä rahallesi',
			content:
				listing.landOwnership === 'Oma'
					? 'Oman maan omistus on turvallista — ei tontinvuokran nousua tulevaisuudessa.'
					: 'Vuokratontti merkitsee vuokranmaksua pitemmän ajan, ja vuokra voi nousta. Se alentaa kiinteistön arvoa.'
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
			content: 'Vastike on kuukausittainen kulu, joka maksetaan talon yhteisestä ylläpidosta (lämmitys, sähkö, siivous, korjaukset).'
		});
		factors.push({
			category: 'here',
			title: 'Tässä kohteessa',
			content: `Kuukausittain: €${listing.totalChargeEurMo.toLocaleString('fi-FI')}.`
		});
		factors.push({
			category: 'why',
			title: 'Miksi tällä on väliä rahallesi',
			content:
				'Vastikkeet ovat asumisnkustannuksia kuten vuokra. Korkea vastike alentaa käytettävissä olevia varoja ja kannattavuutta.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Kysy isännöitsijältä vastikkeen historiasta ja tulevista suunnitelmista. Korkeat vastikkeet voivat merkitä tulossa olevia remontteja.'
		});
	}

	// === CONFIDENCE METER ===
	const meter = CONFIDENCE_METER[tier.tier] || CONFIDENCE_METER['T4'];
	let confidenceText = `Arvio perustuu ${TIER_LABELS[tier.tier] || 'arvioon'}.`;
	if (meter.whatsMissing.length > 0) {
		confidenceText += ` Luotettavuutta parantaisi: ${meter.whatsMissing.join(', ').toLowerCase()}.`;
	}
	if (tier.tier === 'T4') {
		confidenceText += ' Tämä on suuntaa-antava arvio, ei todellinen vertailu.';
	}

	factors.push({
		category: 'confidence',
		title: `Luotettavuus: ${meter.label}`,
		content: confidenceText,
		tier: tier.tier
	});

	return factors;
}
