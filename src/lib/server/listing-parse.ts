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
	'Kaavoitustiedot', 'Kaavatilanne', 'Liikenneyhteydet', 'Lämmitys', 'Lisätietoja lämmityksestä'
];

const LABEL_SET = new Map(LABELS.map((l) => [l.toLowerCase(), l]));

function normalizeNumber(raw: string): number | null {
	// Match the FIRST well-formed number (grouped thousands allowed) without
	// pre-stripping whitespace: repeated values ("54 54 m2") must not merge.
	const m = raw.match(/-?\d{1,3}(?:[   ]\d{3})*(?:[.,]\d+)?/);
	if (!m) return null;
	return Number(m[0].replace(/[   ]/g, '').replace(',', '.'));
}

function blockText(lines: string[]): string {
	return lines.join(' ').replace(/\s+/g, ' ').trim();
}

function parseRenovations(lines: string[]): RenovationItem[] {
	const items: RenovationItem[] = [];
	for (const line of lines) {
		const m = line.match(/^\s*(\d{4})(?:\s*[-–]\s*\d{2,4})?\s+(.*\S)/);
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

	const sijainti = val('Sijainti') ?? '';
	const postal = sijainti.match(/\b(\d{5})\b/);

	const roomsRaw = val('Huoneiston kokoonpano') ?? val('Huoneita');
	let rooms: number | null = null;
	const huoneita = val('Huoneita');
	if (huoneita && /^\d+/.test(huoneita)) rooms = Number(huoneita.match(/^\d+/)![0]);
	else if (roomsRaw) {
		const m = roomsRaw.match(/^(\d+)\s*h/i);
		if (m) rooms = Number(m[1]);
	}
	const roomsType: RoomsType | null =
		rooms === null ? null : rooms <= 1 ? 'yksiö' : rooms === 2 ? 'kaksio' : 'kolmio+';

	const hoito = val('Hoitovastike') ? normalizeNumber(val('Hoitovastike')!) : null;
	const paaoma = val('Pääomavastike') ? normalizeNumber(val('Pääomavastike')!) : null;
	const yhteensa = val('Yhtiövastike yhteensä') ? normalizeNumber(val('Yhtiövastike yhteensä')!) : null;

	const taloyhtioInfo = valLong('Lisätietoa taloyhtiöstä') ?? '';
	const kiinnitys = taloyhtioInfo.match(/kiinnitykset[^0-9]*([\d\s  .,]+)\s*€/i);

	const landRaw = val('Tontin omistus');
	const landOwnership = landRaw === null ? null : /^oma\b/i.test(landRaw) ? 'Oma' : landRaw.slice(0, 80);

	const buildYearRaw = val('Rakennusvuosi') ?? val('Rakennuksen käyttöönottovuosi');
	const hissiRaw = val('Hissi');

	return {
		address: sijainti ? sijainti.split(/,/)[0].trim() || null : null,
		postalCode: postal ? postal[1] : null,
		livingAreaM2: val('Asuinpinta-ala') ? normalizeNumber(val('Asuinpinta-ala')!) : null,
		roomsType,
		roomsRaw,
		debtFreePriceEur: val('Velaton hinta') ? normalizeNumber(val('Velaton hinta')!) : null,
		askingPriceEur: val('Myyntihinta') ? normalizeNumber(val('Myyntihinta')!) : null,
		debtShareEur: val('Velkaosuus') ? normalizeNumber(val('Velkaosuus')!) : null,
		maintenanceChargeEurMo: hoito,
		capitalChargeEurMo: paaoma,
		totalChargeEurMo: yhteensa ?? (hoito !== null || paaoma !== null ? (hoito ?? 0) + (paaoma ?? 0) : null),
		buildYear: buildYearRaw ? normalizeNumber(buildYearRaw) : null,
		condition: val('Kunto'),
		landOwnership,
		floor: val('Kerros'),
		elevator: hissiRaw === null ? null : /kyllä/i.test(hissiRaw),
		apartmentCount: val('Huoneistojen lukumäärä') ? normalizeNumber(val('Huoneistojen lukumäärä')!) : null,
		mortgagesEur: kiinnitys ? normalizeNumber(kiinnitys[1]) : null,
		housingCompany: val('Taloyhtiön nimi'),
		renovationsDone: parseRenovations(blocks.get('Tehdyt remontit') ?? []),
		renovationsUpcoming: parseRenovations(blocks.get('Tulevat remontit') ?? [])
	};
}

const MAJOR_RENOVATIONS: [RegExp, string][] = [
	[/putki|linjasaneeraus|viemäri|käyttövesi/i, 'putkiremontti'],
	[/julkisivu/i, 'julkisivuremontti'],
	[/ikkun/i, 'ikkunaremontti'],
	[/vesikat|katon uusiminen|kattoremontti|peltikat/i, 'kattoremontti'],
	[/hissi/i, 'hissiremontti'],
	[/lämmitysjärjestelm|maalämpö|kaukolämpölait/i, 'lämmitysjärjestelmä'],
	[/sähkönousu|sähköjärjestelm|sähköpääkeskus/i, 'sähköremontti']
];

/** Insight lines derived deterministically from the extracted listing. */
export function deriveInsights(x: ExtractedListing): string[] {
	const out: string[] = [];

	if (x.condition) {
		out.push(
			/tyydyttävä|välttävä|huono/i.test(x.condition)
				? `Kunto ilmoituksessa: ${x.condition} — keskimääräistä heikompi kunto selittää alle markkinan olevaa hintaa.`
				: `Kunto ilmoituksessa: ${x.condition}.`
		);
	}
	if (x.landOwnership === 'Oma') {
		out.push('Tontti: oma — ei tontinvuokrariskiä.');
	} else if (x.landOwnership && /vuokra|valinnainen/i.test(x.landOwnership)) {
		out.push(
			`Tontti: ${x.landOwnership} — vuokratontti lisää asumiskustannuksia ja vuokrankorotukset ovat riski. Tarkista vuokrasopimuksen päättymisvuosi.`
		);
	}

	const upcomingMajor = x.renovationsUpcoming
		.map((r) => {
			const hit = MAJOR_RENOVATIONS.find(([re]) => re.test(r.text));
			return hit ? `${hit[1]} (${r.year})` : null;
		})
		.filter(Boolean);
	if (upcomingMajor.length) {
		out.push(`Tulossa isoja remontteja: ${[...new Set(upcomingMajor)].join(', ')} — hankesuunnittelu tarkoittaa tyypillisesti merkittävää tulevaa lainaosuutta.`);
	} else if (x.renovationsUpcoming.length) {
		out.push('Tulevissa remonteissa ei näy suuria hankkeita (putket, julkisivu, katto, ikkunat) — tavanomaista ylläpitoa.');
	}

	// Studies and plans are not completed renovations: "putkistojen
	// kuntotutkimus 2011" must not read as putkiremontti 2011.
	const STUDY = /kuntotutkim|kuntokartoit|kartoitus|selvitys|suunnittelu|tutkimus|kuntoarvio/i;
	const doneMajor = new Map<string, number>();
	for (const r of x.renovationsDone) {
		if (STUDY.test(r.text)) continue;
		const hit = MAJOR_RENOVATIONS.find(([re]) => re.test(r.text));
		if (hit && !doneMajor.has(hit[1])) doneMajor.set(hit[1], r.year);
	}
	if (doneMajor.size) {
		out.push(`Tehdyt isot remontit: ${[...doneMajor.entries()].map(([k, y]) => `${k} ${y}`).join(', ')}.`);
	}
	if (x.buildYear && x.buildYear < 1985 && !doneMajor.has('putkiremontti')) {
		out.push('Putkiremonttia ei näy remonttihistoriassa vaikka rakennus on yli 40 v — varmista LVV-kuntotutkimuksesta/PTS:stä, milloin linjasaneeraus on edessä.');
	}

	if (x.debtShareEur !== null && x.debtShareEur > 0 && x.livingAreaM2) {
		out.push(`Yhtiölainaosuus ${Math.round(x.debtShareEur).toLocaleString('fi-FI')} € (${Math.round(x.debtShareEur / x.livingAreaM2)} €/m²).`);
	}
	if (x.maintenanceChargeEurMo !== null && x.livingAreaM2) {
		const perM2 = x.maintenanceChargeEurMo / x.livingAreaM2;
		if (perM2 > 7) {
			out.push(`Hoitovastike ${perM2.toFixed(1)} €/m²/kk on korkea (tyypillisesti 4–6 €/m²/kk) — selvitä syy tilinpäätöksestä.`);
		}
	}
	if (x.mortgagesEur !== null && x.apartmentCount) {
		out.push(`Taloyhtiön kiinnitykset ${Math.round(x.mortgagesEur).toLocaleString('fi-FI')} € (~${Math.round(x.mortgagesEur / x.apartmentCount).toLocaleString('fi-FI')} €/huoneisto) — kertoo panttauksen ylärajan, ei nostettua lainaa.`);
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
