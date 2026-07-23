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
	'T1': 'postinumeroalueen toteutuneisiin kauppoihin (korkea luotettavuus)',
	'T2': 'kunnan keskiarvoon (kohtalainen luotettavuus)',
	'T3': 'laajemman alueen keskiarvoon (kohtalainen luotettavuus)',
	'T4': 'kohteen kuntoon (suuntaa näyttävä)'
};

const CONFIDENCE_METER: Record<string, { label: string; whatsMissing: string[] }> = {
	T1: {
		label: 'Korkea luotettavuus',
		whatsMissing: []
	},
	T2: {
		label: 'Kohtalainen luotettavuus',
		whatsMissing: ['tarkempaa postinumerotason dataa']
	},
	T3: {
		label: 'Kohtalainen luotettavuus (aluevertailu)',
		whatsMissing: ['lisää paikallisia kauppoja', 'postinumeroalueen omat erityispiirteet']
	},
	'T4': {
		label: 'Suuntaa näyttävä arvio',
		whatsMissing: [
			'vertailukauppoja (niitä on nyt liian vähän)',
			'toteutuneita myyntihintoja vertailupohjaksi',
			'kohteen omien erityispiirteiden vaikutuksen'
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
			content: 'Kunto kertoo, missä tilassa asunto nyt on ja kuinka paljon remonttia on vielä edessä.'
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
				'Huonokuntoinen koti nielee remonttirahaa, hyväkuntoinen taas pitää arvonsa ja säästää sinut ikäviltä yllätyksiltä.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Kuntotutkimus kertoo totuuden. Kannattaa suosia kohteita, joissa isot remontit — putket, katto, sähköt — on jo tehty.'
		});
	}

	// === BUILD YEAR & AGE ===
	if (listing.buildYear) {
		const age = new Date().getFullYear() - listing.buildYear;
		factors.push({
			category: 'what',
			title: 'Ikä',
			content: 'Rakennusvuosi kertoo talon iän. Vanhempi talo vaatii yleensä enemmän huoltoa, mutta on usein tehty kestämään.'
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
					? 'Yli 40-vuotiaassa talossa putkiremontti on todennäköisesti lähivuosien asia, ellei sitä ole jo tehty. Kannattaa varautua siihen jo hinnassa.'
					: 'Uudemmassa talossa remonttihuolia on vähemmän — mutta siitä myös maksat enemmän.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Remonttihistorian ja kuntotutkimuksen saat myyjältä tai isännöitsijältä.'
		});
	}

	// === LAND (detached houses only) ===
	if (isHouse && listing.tonttiAreaM2) {
		factors.push({
			category: 'what',
			title: 'Tontti',
			content: 'Tontin koko ja se, omistaako taloyhtiö maan vai vuokraako sen, näkyvät sekä kodin hinnassa että kuukausikuluissa.'
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
					? 'Omalla tontilla ei ole tontinvuokraa, joka voisi myöhemmin nousta.'
					: 'Vuokratontista maksetaan vuokraa vuosittain, ja se voi nousta — mikä painaa kohteen arvoa alas.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Vuokratontilla katso sopimuksesta, milloin se päättyy ja miten vuokraa korotetaan.'
		});
	}

	// === MAINTENANCE CHARGES (apartments only) ===
	if (!isHouse && listing.totalChargeEurMo) {
		factors.push({
			category: 'what',
			title: 'Vastikkeet',
			content: 'Vastike on kuukausimaksu, jolla taloyhtiö hoitaa lämmön, sähkön, siivouksen ja korjaukset.'
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
				'Vastike juoksee joka kuukausi siinä missä vuokrakin. Mitä korkeampi se on, sitä ohuemmaksi jää sijoituksen tuotto.'
		});
		factors.push({
			category: 'check',
			title: 'Tarkista vielä',
			content: 'Kysy isännöitsijältä, mihin suuntaan vastike on menossa. Korkea vastike voi olla merkki tulossa olevista remonteista.'
		});
	}

	// === CONFIDENCE METER ===
	const meter = CONFIDENCE_METER[tier.tier] || CONFIDENCE_METER['T4'];
	let confidenceText = `Arvio perustuu ${TIER_LABELS[tier.tier] || TIER_LABELS['T4']}.`;
	if (meter.whatsMissing.length > 0) {
		confidenceText += ` Luotettavuutta nostaisi: ${meter.whatsMissing.join(', ')}.`;
	}
	if (tier.tier === 'T4') {
		confidenceText += ' Tämä on suuntaa näyttävä arvio, ei vielä todellinen vertailu.';
	}

	factors.push({
		category: 'confidence',
		title: `Luotettavuus: ${meter.label}`,
		content: confidenceText,
		tier: tier.tier
	});

	return factors;
}
