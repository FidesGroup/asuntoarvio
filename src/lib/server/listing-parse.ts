/**
 * Deterministic parser for Finnish listing-portal detail pages (Oikotie,
 * Etuovi, broker sites). No LLM: the portals render isännöitsijäntodistus
 * fields as label/value pairs with stable Finnish labels. Works on pasted
 * listing text or on tag-stripped fetched HTML.
 */
import type { RoomsType } from './benchmark';

export interface RenovationItem {
	year: number;
	text: string;
}

export type PropertyClass = 'kerrostalo' | 'rivitalo' | 'omakotitalo' | 'paritalo' | 'muu';

export interface ExtractedListing {
	address: string | null;
	postalCode: string | null;
	livingAreaM2: number | null;
	roomsType: RoomsType | null;
	roomsRaw: string | null;
	debtFreePriceEur: number | null;
	askingPriceEur: number | null;
	debtShareEur: number | null;
	maintenanceChargeEurMo: number | null;
	capitalChargeEurMo: number | null;
	totalChargeEurMo: number | null;
	buildYear: number | null;
	condition: string | null;
	landOwnership: string | null;
	floor: string | null;
	elevator: boolean | null;
	apartmentCount: number | null;
	mortgagesEur: number | null;
	housingCompany: string | null;
	renovationsDone: RenovationItem[];
	renovationsUpcoming: RenovationItem[];
	propertyClass: PropertyClass | null;
	tonttiAreaM2: number | null;
	energyClass: string | null;
}

/** Labels that begin a value block. Order-insensitive; matched per line. */
const LABELS = [
	'Sijainti', 'Kaupunginosa', 'Asuinpinta-ala', 'Kokonaispinta-ala', 'Huoneiston kokoonpano',
	'Huoneita', 'Kunto', 'Kerros', 'Hissi', 'Tulevat remontit', 'Tehdyt remontit',
	'Velaton hinta', 'Myyntihinta', 'Neliöhinta', 'Velkaosuus', 'Hoitovastike', 'Pääomavastike',
	'Yhtiövastike yhteensä', 'Rakennusvuosi', 'Rakennuksen käyttöönottovuosi', 'Huoneistojen lukumäärä',
	'Tontin omistus', 'Taloyhtiön nimi', 'Lisätietoa taloyhtiöstä', 'Postitoimipaikka',
	// section headers & frequent labels we capture only to terminate the previous block
	'Perustiedot', 'Hinta', 'Vastikkeet', 'Muut maksut', 'Talon ja tontin tiedot', 'Kohdenumero',
	'Tontin pinta-ala', 'Pinta-alojen lisätiedot', 'Lisätietoa vapautumisesta', 'Keittiön varusteet',
	'Parveke', 'Kylpyhuoneen varusteet', 'Säilytystilat', 'Asunnossa sauna', 'Asumistyyppi',
	'Vuokrattu', 'Kohde on', 'Kiinteistötunnus', 'Lainaosuuden maksu', 'Lunastuspykälä',
	'Lisätietoa vastikkeista', 'Saunan kustannukset', 'Vesimaksun lisätiedot', 'Muut kustannukset',
	'Uudiskohde', 'Rakennuksen tyyppi', 'Kerroksia', 'Taloyhtiössä on sauna', 'Rakennusmateriaali',
	'Kattomateriaali', 'Kattotyyppi', 'Energialuokka', 'Energiatodistus', 'Ilmastointijärjestelmä',
	'Kiinteistön antennijärjestelmä', 'Tontin koko', 'Kiinteistönhoito', 'Isännöinti',
	'Kaavoitustiedot', 'Kaavatilanne', 'Liikenneyhteydet', 'Lämmitys', 'Lisätietoja lämmityksestä',
	// Etuovi value labels
	'Huoneistoselitelmä', 'Asuintilojen pinta-ala', 'Kerrokset', 'Asunnon kunto', 'Muuta taloyhtiöstä',
	// Etuovi section headers & labels captured only to terminate the previous block
	'Asunnon perustiedot', 'Tyyppi', 'Omistusmuoto', 'Lisätietoja pinta-alasta', 'Vapautuminen',
	'Hinta ja kustannukset', 'Vastike', 'Lisätietoa maksuista', 'Asunnon lisätiedot',
	'Kohteen lisätiedot', 'Lisätietoja kunnosta', 'Lämmitysjärjestelmän kuvaus',
	'Vesihuollon kuvaus', 'Viemäri', 'Asunnon tilat ja materiaalit', 'Keittiön kuvaus',
	'Kylpyhuoneen kuvaus', 'Olohuoneen kuvaus', 'Makuuhuoneiden kuvaus', 'Säilytystilojen kuvaus',
	'Taloyhtiö', 'Isännöitsijän yhteystiedot', 'Huolto', 'Huoltoyhtiö', 'Taloyhtiöön kuuluu',
	'Rakennus- ja pintamateriaalit', 'Kattomateriaalin kuvaus', 'Taloyhtiön autopaikat',
	'Kaavoitustilanne', 'Palvelut ja liikenneyhteydet', 'Palvelut', 'Muut lisätiedot',
	'Tiedustelut', 'Parvekkeen kuvaus', 'Tietoliikenne', 'Sauna'
];

const LABEL_SET = new Map(LABELS.map((l) => [l.toLowerCase(), l]));

function normalizeNumber(raw: string): number | null {
	// Match the FIRST well-formed number (grouped thousands allowed) without
	// pre-stripping whitespace: repeated values ("54 54 m2") must not merge.
	// First run is \d+ (not \d{1,3}) so ungrouped values like "1951" parse
	// whole; the trailing (?!\d) keeps a doubled "1906 1906" from being read
	// as grouped thousands.
	const m = raw.match(/-?\d+(?:[   ]\d{3})*(?:[.,]\d+)?(?!\d)/);
	if (!m) return null;
	return Number(m[0].replace(/[   ]/g, '').replace(',', '.'));
}

function blockText(lines: string[]): string {
	return lines.join(' ').replace(/\s+/g, ' ').trim();
}

function parseRenovations(lines: string[]): RenovationItem[] {
	const items: RenovationItem[] = [];
	for (const line of lines) {
		// Oikotie: "1992 putkiremontti" — Etuovi: "2010: Linjasaneeraus" (also "2018;")
		const m = line.match(/^\s*(\d{4})(?:\s*[-–]\s*\d{2,4})?\s*[:;.]?\s+(.*\S)/);
		if (m) items.push({ year: Number(m[1]), text: m[2].trim() });
	}
	return items;
}

/** Portal page tails (recommendations, footer) begin at these markers. */
const CUTOFF_MARKERS = [
	'Alueen muut kohteet', 'Oikotie suosittelee', 'Muita suosittuja kaupunkeja',
	'Seuraa meitä', 'Yksityisille ilmoittajille', 'Samankaltaisia kohteita',
	'Katso myös nämä', 'Evästeasetukset'
];

/**
 * Parse listing from HTML. First attempts JSON-LD / __NEXT_DATA__ extraction,
 * then falls back to label/value text parsing.
 */
export function parseListingHtml(html: string): ExtractedListing {
	const jsonData = extractJsonFromHtml(html);
	const textData = parseListingText(htmlToText(html));

	if (jsonData) {
		const jsonExtract = extractFromJson(jsonData);
		if (jsonExtract) {
			// Merge: JSON-LD data fills gaps in text parsing
			return {
				...textData,
				...Object.fromEntries(
					Object.entries(jsonExtract).filter(([, v]) => v !== null && v !== undefined)
				)
			};
		}
	}
	return textData;
}

export function parseListingText(text: string): ExtractedListing {
	for (const marker of CUTOFF_MARKERS) {
		const i = text.indexOf(marker);
		if (i > 200) text = text.slice(0, i);
	}
	const lines = text
		.split(/\r?\n/)
		.map((l) => l.replace(/[  ]/g, ' ').trim())
		.filter((l) => l.length > 0);

	// group into blocks: label -> value lines until the next label
	const blocks = new Map<string, string[]>();
	let current: string | null = null;
	for (const line of lines) {
		const label = LABEL_SET.get(line.replace(/:$/, '').toLowerCase());
		if (label) {
			current = label;
			if (!blocks.has(label)) blocks.set(label, []);
			continue;
		}
		if (current) blocks.get(current)!.push(line);
	}
	// Scalar fields: only the FIRST captured line, hard-capped — a missing
	// terminator label must never swallow the rest of the page into a value.
	const val = (label: string): string | null => {
		const b = blocks.get(label);
		return b && b.length ? b[0].slice(0, 160).trim() : null;
	};
	// Prose fields where a later sentence matters (e.g. kiinnitykset).
	const valLong = (label: string): string | null => {
		const b = blocks.get(label);
		return b && b.length ? blockText(b.slice(0, 12)).slice(0, 1200) : null;
	};

	// Sijainti is one line on Oikotie ("Malminkatu 40 A, 00100 Helsinki") but a
	// district line followed by the address line on Etuovi ("Helsinki Ruskeasuo"
	// / "Raisiontie 6 A, 00280") — take the line that carries the postal code.
	const sijaintiLines = (blocks.get('Sijainti') ?? []).slice(0, 4).map((l) => l.slice(0, 160));
	const sijainti = sijaintiLines.find((l) => /\b\d{5}\b/.test(l)) ?? sijaintiLines[0] ?? '';
	const postal = blockText(sijaintiLines).match(/\b(\d{5})\b/);

	const roomsRaw = val('Huoneiston kokoonpano') ?? val('Huoneistoselitelmä') ?? val('Huoneita');
	let rooms: number | null = null;
	const huoneita = val('Huoneita');
	if (huoneita && /^\d+/.test(huoneita)) rooms = Number(huoneita.match(/^\d+/)![0]);
	else if (roomsRaw && /^\d+\s*h/i.test(roomsRaw)) rooms = Number(roomsRaw.match(/^(\d+)\s*h/i)![1]);
	else if (huoneita) {
		// Etuovi gives a word ("Kaksio") instead of a count
		rooms = /yksiö/i.test(huoneita) ? 1 : /kaksio/i.test(huoneita) ? 2
			: /kolmio/i.test(huoneita) ? 3 : /neli[öo]/i.test(huoneita) ? 4 : null;
	}
	const roomsType: RoomsType | null =
		rooms === null ? null : rooms <= 1 ? 'yksiö' : rooms === 2 ? 'kaksio' : 'kolmio+';

	const hoito = val('Hoitovastike') ? normalizeNumber(val('Hoitovastike')!) : null;
	const paaoma = val('Pääomavastike') ? normalizeNumber(val('Pääomavastike')!) : null;
	const yhteensa = val('Yhtiövastike yhteensä') ? normalizeNumber(val('Yhtiövastike yhteensä')!) : null;

	const taloyhtioInfo = [valLong('Lisätietoa taloyhtiöstä'), valLong('Muuta taloyhtiöstä')]
		.filter(Boolean)
		.join(' ');
	const kiinnitys = taloyhtioInfo.match(/kiinnitykset[^0-9]*([\d\s  .,]+)\s*€/i);

	const landRaw = val('Tontin omistus');
	const landOwnership = landRaw === null ? null : /^oma\b/i.test(landRaw) ? 'Oma' : landRaw.slice(0, 80);

	const buildYearRaw = val('Rakennusvuosi') ?? val('Rakennuksen käyttöönottovuosi');
	const hissiRaw = val('Hissi');
	const areaRaw = val('Asuinpinta-ala') ?? val('Asuintilojen pinta-ala');

	const housingCompanyName = val('Taloyhtiön nimi');

	// Detect property class from labels
	const asumistyyppi = val('Asumistyyppi') ?? '';
	const rakennuksenTyyppi = val('Rakennuksen tyyppi') ?? '';
	const kohdeOn = val('Kohde on') ?? '';
	const propertyClassRaw = [asumistyyppi, rakennuksenTyyppi, kohdeOn].join(' ').toLowerCase();
	let propertyClass: PropertyClass | null = null;
	if (/omakoti|omakotitalo/i.test(propertyClassRaw)) propertyClass = 'omakotitalo';
	else if (/paritalo|rivi.*talo|rivitalo/i.test(propertyClassRaw)) propertyClass = 'rivitalo';
	else if (/kerrostalo/i.test(propertyClassRaw)) propertyClass = 'kerrostalo';
	else if (housingCompanyName) propertyClass = 'kerrostalo'; // default share-based to kerrostalo if no explicit type

	// Extract plot area (tontti)
	const tonttiAreaRaw = val('Tontin koko') ?? val('Tontin pinta-ala');
	const tonttiAreaM2 = tonttiAreaRaw ? normalizeNumber(tonttiAreaRaw) : null;

	// Extract energy class
	const energyClassRaw = val('Energialuokka') ?? val('Energiatodistus');
	const energyClass = energyClassRaw ? energyClassRaw.slice(0, 40).trim() : null;

	return {
		address: sijainti ? sijainti.split(/,/)[0].trim() || null : null,
		postalCode: postal ? postal[1] : null,
		livingAreaM2: areaRaw ? normalizeNumber(areaRaw) : null,
		roomsType,
		roomsRaw,
		debtFreePriceEur: val('Velaton hinta') ? normalizeNumber(val('Velaton hinta')!) : null,
		askingPriceEur: val('Myyntihinta') ? normalizeNumber(val('Myyntihinta')!) : null,
		debtShareEur: val('Velkaosuus') ? normalizeNumber(val('Velkaosuus')!) : null,
		maintenanceChargeEurMo: hoito,
		capitalChargeEurMo: paaoma,
		totalChargeEurMo: yhteensa ?? (hoito !== null || paaoma !== null ? (hoito ?? 0) + (paaoma ?? 0) : null),
		buildYear: buildYearRaw ? normalizeNumber(buildYearRaw) : null,
		condition: val('Kunto') ?? val('Asunnon kunto'),
		landOwnership,
		floor: val('Kerros') ?? val('Kerrokset'),
		elevator: hissiRaw === null ? null : /kyllä/i.test(hissiRaw),
		apartmentCount: val('Huoneistojen lukumäärä') ? normalizeNumber(val('Huoneistojen lukumäärä')!) : null,
		mortgagesEur: kiinnitys ? normalizeNumber(kiinnitys[1]) : null,
		housingCompany: housingCompanyName,
		renovationsDone: parseRenovations(blocks.get('Tehdyt remontit') ?? []),
		renovationsUpcoming: parseRenovations(blocks.get('Tulevat remontit') ?? []),
		propertyClass,
		tonttiAreaM2,
		energyClass
	};
}

export const MAJOR_RENOVATIONS: [RegExp, string][] = [
	[/putki|linjasaneeraus|viemäri|käyttövesi/i, 'putkiremontti'],
	[/julkisivu/i, 'julkisivuremontti'],
	[/ikkun/i, 'ikkunaremontti'],
	[/vesikat|katon uusiminen|kattoremontti|peltikat/i, 'kattoremontti'],
	[/hissi/i, 'hissiremontti'],
	[/lämmitysjärjestelm|maalämpö|kaukolämpölait/i, 'lämmitysjärjestelmä'],
	[/sähkönousu|sähköjärjestelm|sähköpääkeskus/i, 'sähköremontti']
];

// Minor upkeep must not read as a major renovation: patching, repainting,
// weather-stripping or servicing a facade is not a julkisivuremontti...
const MINOR_RE = /paikkaus|maalau|värimääri|tiivist|huolto|tarkastam|puhdistus/i;
// ...unless the line itself announces a remontti/saneeraus
// ("kuntotutkimus (julkisivun remontti tai kalkkimaalaus)" stays a signal).
export const minorOnly = (t: string) => MINOR_RE.test(t) && !/remontti|saneeraus/i.test(t);

// Studies and plans are not completed renovations: "putkistojen
// kuntotutkimus 2011" must not read as putkiremontti 2011.
export const STUDY_RE = /kuntotutkim|kuntokartoit|kartoitus|selvitys|suunnittelu|tutkimus|kuntoarvio/i;

/** Insight lines derived deterministically from the extracted listing. */
export function deriveInsights(x: ExtractedListing): string[] {
	const out: string[] = [];

	if (x.condition) {
		out.push(
			/tyydyttävä|välttävä|huono/i.test(x.condition)
				? `Kunnoksi ilmoitettu ${x.condition}. Keskimääräistä heikompi kunto selittää usein sen, miksi hinta jää alle markkinan.`
				: `Kunnoksi ilmoitettu ${x.condition}.`
		);
	}
	if (x.landOwnership === 'Oma') {
		out.push('Tontti on oma — ei tontinvuokran riskiä.');
	} else if (x.landOwnership && /vuokra|valinnainen/i.test(x.landOwnership)) {
		out.push(
			`Tontti: ${x.landOwnership}. Vuokratontti nostaa asumiskuluja, ja vuokrankorotukset ovat oma riskinsä. Katso sopimuksesta, milloin se päättyy.`
		);
	}

	const upcoming = new Map<string, number>();
	for (const r of x.renovationsUpcoming) {
		if (minorOnly(r.text)) continue;
		const hit = MAJOR_RENOVATIONS.find(([re]) => re.test(r.text));
		if (hit && (!upcoming.has(hit[1]) || r.year < upcoming.get(hit[1])!)) upcoming.set(hit[1], r.year);
	}
	if (upcoming.size) {
		out.push(`Tulossa isoja remontteja: ${[...upcoming.entries()].map(([k, y]) => `${k} (${y})`).join(', ')}. Hankesuunnittelu tietää yleensä tuntuvaa lainaosuutta tulevaisuudessa.`);
	} else if (x.renovationsUpcoming.length) {
		out.push('Tulevissa remonteissa ei näy isoja hankkeita (putket, julkisivu, katto, ikkunat) — vain tavanomaista ylläpitoa.');
	}

	const doneMajor = new Map<string, number>();
	for (const r of x.renovationsDone) {
		if (STUDY_RE.test(r.text) || minorOnly(r.text)) continue;
		const hit = MAJOR_RENOVATIONS.find(([re]) => re.test(r.text));
		if (hit && !doneMajor.has(hit[1])) doneMajor.set(hit[1], r.year);
	}
	if (doneMajor.size) {
		out.push(`Isot remontit jo tehty: ${[...doneMajor.entries()].map(([k, y]) => `${k} ${y}`).join(', ')}.`);
	}
	if (x.buildYear && x.buildYear < 1985 && !doneMajor.has('putkiremontti')) {
		out.push('Putkiremonttia ei näy remonttihistoriassa, vaikka talo on yli 40-vuotias. Varmista LVV-kuntotutkimuksesta tai PTS:stä, milloin linjasaneeraus on edessä.');
	}

	if (x.debtShareEur !== null && x.debtShareEur > 0 && x.livingAreaM2) {
		out.push(`Osuus yhtiölainasta ${Math.round(x.debtShareEur).toLocaleString('fi-FI')} € (${Math.round(x.debtShareEur / x.livingAreaM2)} €/m²).`);
	}
	if (x.maintenanceChargeEurMo !== null && x.livingAreaM2) {
		const perM2 = x.maintenanceChargeEurMo / x.livingAreaM2;
		if (perM2 > 7) {
			out.push(`Hoitovastike ${perM2.toFixed(1)} €/m²/kk on korkeahko (tyypillisesti 4–6 €/m²/kk). Kannattaa selvittää syy tilinpäätöksestä.`);
		}
	}
	if (x.mortgagesEur !== null) {
		const perUnit = x.apartmentCount
			? ` (~${Math.round(x.mortgagesEur / x.apartmentCount).toLocaleString('fi-FI')} €/huoneisto)`
			: '';
		out.push(`Taloyhtiön kiinnitykset ${Math.round(x.mortgagesEur).toLocaleString('fi-FI')} €${perUnit}. Luku kertoo panttauksen ylärajan, ei sitä paljonko lainaa on oikeasti nostettu.`);
	}
	return out;
}

/** Hosts we agree to fetch a single user-supplied listing page from. */
const ALLOWED_HOSTS = new Set([
	'asunnot.oikotie.fi', 'www.etuovi.com', 'etuovi.com',
	'www.kiinteistomaailma.fi', 'kiinteistomaailma.fi', 'remax.fi', 'www.remax.fi'
]);

export function allowedListingUrl(raw: string): URL | null {
	try {
		const u = new URL(raw);
		if (u.protocol !== 'https:' || !ALLOWED_HOSTS.has(u.hostname)) return null;
		return u;
	} catch {
		return null;
	}
}

/** Extract JSON-LD or __NEXT_DATA__ from page HTML. */
function extractJsonFromHtml(html: string): Record<string, unknown> | null {
	// Try JSON-LD first
	const jsonLdMatch = html.match(/<script[^>]+type=['"]application\/ld\+json['"][^>]*>([\s\S]*?)<\/script>/i);
	if (jsonLdMatch) {
		try {
			return JSON.parse(jsonLdMatch[1]);
		} catch {
			// Fall through to __NEXT_DATA__
		}
	}
	// Try __NEXT_DATA__
	const nextDataMatch = html.match(/<script[^>]+id=['"]__NEXT_DATA__['"][^>]*>([\s\S]*?)<\/script>/i);
	if (nextDataMatch) {
		try {
			return JSON.parse(nextDataMatch[1]);
		} catch {
			// Fall through to null
		}
	}
	return null;
}

/** Attempt to extract listing facts from JSON-LD or __NEXT_DATA__. */
function extractFromJson(data: Record<string, unknown>): Partial<ExtractedListing> | null {
	try {
		// JSON-LD property schema
		if (data['@type'] === 'RealEstateAgent' || data['@type'] === 'Thing') {
			const res: Partial<ExtractedListing> = {};
			if (data.name) res.address = String(data.name);
			if (data.price) {
				const priceVal = Number(data.price);
				if (!isNaN(priceVal)) res.askingPriceEur = priceVal;
			}
			// livingArea might be in schema as floorSize or similar
			if (data.floorSize) res.livingAreaM2 = Number(data.floorSize);
			// Try to find area in description or parse from structured data
			return Object.keys(res).length > 0 ? res : null;
		}
		// Next.js props structure (Oikotie-specific; adjust as needed per actual structure)
		const props = (data.props as Record<string, unknown>)?.pageProps as Record<string, unknown>;
		if (props && typeof props === 'object') {
			const listing = props.listing as Record<string, unknown>;
			if (listing && typeof listing === 'object') {
				const res: Partial<ExtractedListing> = {};
				if (listing.address) res.address = String(listing.address);
				if (listing.postalCode) res.postalCode = String(listing.postalCode);
				if (listing.price) res.askingPriceEur = Number(listing.price);
				if (listing.livingArea) res.livingAreaM2 = Number(listing.livingArea);
				if (listing.buildYear) res.buildYear = Number(listing.buildYear);
				if (listing.rooms) {
					const r = Number(listing.rooms);
					res.roomsType = r <= 1 ? 'yksiö' : r === 2 ? 'kaksio' : 'kolmio+';
				}
				return Object.keys(res).length > 0 ? res : null;
			}
		}
	} catch {
		// Silently fall through on any parse error
	}
	return null;
}

/** Very small HTML -> text: enough for label/value parsing of SSR pages. */
export function htmlToText(html: string): string {
	return html
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6]|\/dt|\/dd)[^>]*>/gi, '\n')
		.replace(/<[^>]+>/g, ' ')
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&euro;/gi, '€')
		.replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
		.split(/\n/)
		.map((l) => l.replace(/[ \t]+/g, ' ').trim())
		.join('\n');
}
