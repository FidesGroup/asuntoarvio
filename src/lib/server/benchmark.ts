/**
 * Benchmark engine: listing facts -> delta vs area benchmark + confidence + flags.
 *
 * The benchmark is a transaction-weighted mean of realized EUR/m2 over the
 * last four quarters with data (Statistics Finland table 13mt, old apartment
 * sales by postal code, CC BY 4.0). Validated against live listings in the
 * 2026-07-05 hard-areas spike (geo repo: docs/benchmark-spike-hard-areas.md):
 * postal means are a useful screen but MUST ship with confidence + flags,
 * never as a naked percentage.
 */
import seed from './benchmarks.seed.json';
import housesSeed from './houses.seed.json';
import centroidsRaw from './centroids.json';
import type { PropertyClass } from './listing-parse';

export type RoomsType = 'yksiö' | 'kaksio' | 'kolmio+';

export interface BenchmarkCell {
	benchmark_eur_m2: number | null;
	n_4q: number;
	series: { q: string; eur_m2: number | null; n: number | null }[];
}

export interface HouseBenchmarkCell {
	benchmark_eur_m2: number | null;
	n_4q: number;
	series: { q: string; eur_m2: number | null; n: number | null }[];
}

export interface ListingFacts {
	postalCode: string;
	roomsType?: RoomsType | null; // optional for detached houses
	livingAreaM2: number;
	/** velaton hinta if known, otherwise myyntihinta */
	priceEur: number;
	priceIsDebtFree: boolean;
	buildYear?: number | null;
	propertyClass?: PropertyClass | null; // optional; defaults to kerrostalo if omitted
}

export interface BenchmarkCell {
	benchmark_eur_m2: number | null;
	n_4q: number;
	series: { q: string; eur_m2: number | null; n: number | null }[];
}

export interface Verdict {
	listingEurM2: number;
	benchmarkEurM2: number | null;
	deltaPct: number | null;
	confidence: 'korkea' | 'kohtalainen' | 'matala' | 'ei saatavilla';
	transactions4q: number;
	latestQuarter: string | null;
	flags: string[];
}

// Postal code to house region mapping (simplified for Stage 2)
// In production, this would be a full postal->region lookup table
const POSTAL_TO_HOUSE_REGION: Record<string, string> = {
	'00100': 'pks', '00120': 'pks', '00130': 'pks', '00140': 'pks', // Helsinki -> Greater Helsinki
	'02100': 'pks', '02150': 'pks', '02200': 'pks', '02250': 'pks', // Espoo
	'01300': 'pks', '01400': 'pks', '01500': 'pks', '01600': 'pks'  // Vantaa
};

const fallbackRegion = 'SSS'; // Whole country fallback

const TYPE_KEY: Record<RoomsType, string> = {
	'yksiö': 'yksiöt',
	'kaksio': 'kaksiot',
	'kolmio+': 'kolmiot+'
};

const cells = seed as Record<string, BenchmarkCell>;
const houseCells = housesSeed as Record<string, HouseBenchmarkCell>;

export function knownPostalCodes(): string[] {
	return [...new Set(Object.keys(cells).map((k) => k.split('_')[0]))].sort();
}

export function lookupHouseCell(region: string): HouseBenchmarkCell | null {
	return houseCells[region] ?? null;
}

function getHouseRegionForPostal(postalCode: string): string {
	return POSTAL_TO_HOUSE_REGION[postalCode] ?? fallbackRegion;
}

/* ------------------------------------------------------------------ *
 * Location-weighted benchmark (micro-location v1)
 *
 * Inverse-distance-weighted blend of nearby postal-area benchmarks for
 * the same room class, anchored on the geocoded street address. Softens
 * hard postal-boundary steps; it does NOT know street-level comps.
 * ------------------------------------------------------------------ */

interface CentroidCell {
	c: [number, number]; // lon, lat
	eur: number | null;
	n: number;
	per: Record<string, [number, number]>; // short room key -> [eur_m2, n_4q]
	nimi: string;
}

const CENTROIDS = centroidsRaw as unknown as Record<string, CentroidCell>;
const PER_KEY: Record<RoomsType, string> = { 'yksiö': 'y', kaksio: 'k2', 'kolmio+': 'k3' };

export interface LocationBenchmark {
	eurM2: number;
	areasUsed: { pc: string; nimi: string; eurM2: number; km: number }[];
}

function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
	const rad = Math.PI / 180;
	const dLat = (lat2 - lat1) * rad;
	const dLon = (lon2 - lon1) * rad;
	const a =
		Math.sin(dLat / 2) ** 2 +
		Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLon / 2) ** 2;
	return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function locationBenchmark(
	lon: number,
	lat: number,
	roomsType: RoomsType,
	maxKm = 8,
	k = 8
): LocationBenchmark | null {
	const perKey = PER_KEY[roomsType];
	const cands: { pc: string; nimi: string; eurM2: number; n: number; km: number }[] = [];
	for (const [pc, cell] of Object.entries(CENTROIDS)) {
		const per = cell.per?.[perKey];
		if (!per) continue;
		const km = haversineKm(lon, lat, cell.c[0], cell.c[1]);
		if (km <= maxKm) cands.push({ pc, nimi: cell.nimi, eurM2: per[0], n: per[1], km });
	}
	cands.sort((a, b) => a.km - b.km);
	const top = cands.slice(0, k);
	if (top.length < 2) return null; // one area = no interpolation, fall back to postal cell
	let wSum = 0;
	let vSum = 0;
	for (const c of top) {
		const w = c.n / Math.max(c.km * c.km, 0.01); // transaction count over squared distance
		wSum += w;
		vSum += w * c.eurM2;
	}
	return {
		eurM2: Math.round(vSum / wSum),
		areasUsed: top.slice(0, 4).map(({ pc, nimi, eurM2, km }) => ({ pc, nimi, eurM2, km: Math.round(km * 10) / 10 }))
	};
}

export function lookupCell(postalCode: string, roomsType: RoomsType): BenchmarkCell | null {
	return cells[`${postalCode}_${TYPE_KEY[roomsType]}`] ?? null;
}

/**
 * New property-class-aware evaluation. Routes apartments/row houses to room-type
 * cell lookup, and detached houses to municipality-level fallback (not yet implemented).
 * Backward compatible: propertyClass defaults to kerrostalo if omitted.
 */
export function evaluateProperty(facts: ListingFacts): Verdict {
	const propertyClass = facts.propertyClass ?? 'kerrostalo';

	// For apartments and row houses, use room-type cell lookup
	if (propertyClass === 'kerrostalo' || propertyClass === 'rivitalo') {
		if (!facts.roomsType) {
			return {
				listingEurM2: Math.round(facts.priceEur / facts.livingAreaM2),
				benchmarkEurM2: null,
				deltaPct: null,
				confidence: 'ei saatavilla',
				transactions4q: 0,
				latestQuarter: null,
				flags: ['Huonetyyppi puuttuu, joten vertailua ei voi vielä laskea.']
			};
		}
		return evaluate(facts as Required<Pick<ListingFacts, 'roomsType'>> & ListingFacts);
	}

	// For detached houses, use regional fallback (Stage 2)
	if (propertyClass === 'omakotitalo' || propertyClass === 'paritalo') {
		const region = getHouseRegionForPostal(facts.postalCode);
		const houseCell = lookupHouseCell(region);
		const listingEurM2 = Math.round(facts.priceEur / facts.livingAreaM2);
		const flags: string[] = [
			'Omakotitalon €/m² on karkea seula: tontin arvo ja talon oma luonne heiluttavat sitä paljon.'
		];

		if (!houseCell || houseCell.benchmark_eur_m2 === null) {
			flags.push('Alueelta ei löydy tarpeeksi kauppoja, joten vertailua ei voi laskea.');
			return {
				listingEurM2,
				benchmarkEurM2: null,
				deltaPct: null,
				confidence: 'ei saatavilla',
				transactions4q: 0,
				latestQuarter: null,
				flags
			};
		}

		const deltaPct = Math.round((listingEurM2 / houseCell.benchmark_eur_m2 - 1) * 1000) / 10;
		const confidence = houseCell.n_4q >= 100 ? 'kohtalainen' : 'matala'; // houses always downgraded vs apartments
		if (confidence !== 'kohtalainen') {
			flags.push(
				`Alueelta vain ${houseCell.n_4q} kauppaa neljän viime neljänneksen ajalta — pieni otos, joten ota luku suuntaa näyttävänä.`
			);
		}

		return {
			listingEurM2,
			benchmarkEurM2: houseCell.benchmark_eur_m2,
			deltaPct,
			confidence,
			transactions4q: houseCell.n_4q,
			latestQuarter: latestQuarterOf(houseCell),
			flags
		};
	}

	// For unknown property types, return error
	return {
		listingEurM2: Math.round(facts.priceEur / facts.livingAreaM2),
		benchmarkEurM2: null,
		deltaPct: null,
		confidence: 'ei saatavilla',
		transactions4q: 0,
		latestQuarter: null,
		flags: ['Kohdetyyppiä ei tunnistettu, joten vertailua ei voi laskea.']
	};
}

export function evaluate(facts: ListingFacts): Verdict {
	// Ensure roomsType is present for apartment lookup
	if (!facts.roomsType) {
		return {
			listingEurM2: Math.round(facts.priceEur / facts.livingAreaM2),
			benchmarkEurM2: null,
			deltaPct: null,
			confidence: 'ei saatavilla',
			transactions4q: 0,
			latestQuarter: null,
			flags: ['Huonetyyppi puuttuu, joten vertailua ei voi vielä laskea.']
		};
	}

	const cell = lookupCell(facts.postalCode, facts.roomsType);
	const listingEurM2 = Math.round(facts.priceEur / facts.livingAreaM2);
	const flags: string[] = [];

	if (!facts.priceIsDebtFree) {
		flags.push(
			'Hinta on syötetty myyntihintana. Jos kohteessa on yhtiölainaa, velaton neliöhinta on todellisuudessa korkeampi — silloin vertailu näyttää kohteen liiankin edullisena.'
		);
	}
	if (facts.buildYear && facts.buildYear >= 2010) {
		flags.push(
			'Uudehko talo: vertailuluku nojaa alueen vanhempien asuntojen kauppoihin, joten uudiskohde näyttää tyypillisesti selvästi vertailua kalliimmalta. Tämä on normaalia.'
		);
	}
	if (facts.livingAreaM2 <= 30) {
		flags.push('Pieni asunto: pienestä yksiöstä maksetaan yleensä alueen keskiarvoa enemmän per neliö, joten vertailu voi näyttää kohteen kalliina.');
	}
	if (facts.livingAreaM2 >= 100) {
		flags.push('Iso asunto: suuresta huoneistosta maksetaan yleensä alueen keskiarvoa vähemmän per neliö, joten vertailu voi näyttää kohteen edullisena.');
	}
	if (!facts.buildYear) {
		flags.push('Rakennusvuotta ei tiedetä, joten ikä- ja kuntoerot eivät näy vertailussa.');
	}

	if (!cell || cell.benchmark_eur_m2 === null) {
		flags.push(
			'Tilastokeskus ei julkaise tälle postinumeron ja huonetyypin yhdistelmälle neliöhintaa, koska kauppoja on liian vähän. Vertailua ei siksi voi laskea.'
		);
		return {
			listingEurM2,
			benchmarkEurM2: null,
			deltaPct: null,
			confidence: 'ei saatavilla',
			transactions4q: cell?.n_4q ?? 0,
			latestQuarter: latestQuarterOf(cell),
			flags
		};
	}

	const deltaPct = Math.round((listingEurM2 / cell.benchmark_eur_m2 - 1) * 1000) / 10;
	const confidence = cell.n_4q >= 100 ? 'korkea' : cell.n_4q >= 30 ? 'kohtalainen' : 'matala';
	if (confidence !== 'korkea') {
		flags.push(
			`Vertailu nojaa ${cell.n_4q} kauppaan neljän viime neljänneksen ajalta. Otos on pieni, joten yksittäinen kauppa heiluttaa keskiarvoa herkästi.`
		);
	}
	flags.push(
		'Postinumeroalueen keskiarvo ei erottele mikrosijaintia, kuntoa eikä taloyhtiön velkoja tai remontteja. Pidä tätä suuntaa antavana seulana, ei arviona.'
	);

	return {
		listingEurM2,
		benchmarkEurM2: cell.benchmark_eur_m2,
		deltaPct,
		confidence,
		transactions4q: cell.n_4q,
		latestQuarter: latestQuarterOf(cell),
		flags
	};
}

function latestQuarterOf(cell: BenchmarkCell | null): string | null {
	if (!cell) return null;
	const withData = cell.series.filter((s) => s.eur_m2 !== null);
	return withData.length ? withData[withData.length - 1].q : null;
}

/** Accept ASCII-safe aliases so API clients need not send "ö" or "+". */
const ROOMS_ALIASES: Record<string, RoomsType> = {
	'yksiö': 'yksiö', yksio: 'yksiö', '1h': 'yksiö',
	kaksio: 'kaksio', '2h': 'kaksio',
	'kolmio+': 'kolmio+', kolmio: 'kolmio+', '3h': 'kolmio+', '3h+': 'kolmio+'
};

/** Facts from the manual /arvio form: always apartment-shaped (roomsType present). */
export type ApartmentFacts = ListingFacts & { roomsType: RoomsType };

export function parseFacts(params: URLSearchParams): ApartmentFacts | { error: string } {
	const postalCode = (params.get('pc') ?? '').trim();
	const roomsType = ROOMS_ALIASES[(params.get('rt') ?? '').trim().toLowerCase()];
	const livingAreaM2 = Number(params.get('m2'));
	const priceEur = Number(params.get('price'));
	const priceIsDebtFree = params.get('debtfree') !== '0';
	const buildYearRaw = params.get('yr');
	const buildYear = buildYearRaw ? Number(buildYearRaw) : null;

	if (!/^\d{5}$/.test(postalCode)) return { error: 'Tarkistathan postinumeron — se puuttuu tai on virheellinen.' };
	if (!(roomsType in TYPE_KEY)) return { error: 'Valitsethan huonetyypin.' };
	if (!Number.isFinite(livingAreaM2) || livingAreaM2 < 10 || livingAreaM2 > 400)
		return { error: 'Tarkistathan pinta-alan (10–400 m²).' };
	if (!Number.isFinite(priceEur) || priceEur < 10_000 || priceEur > 20_000_000)
		return { error: 'Tarkistathan hinnan.' };
	if (buildYear !== null && (!Number.isFinite(buildYear) || buildYear < 1800 || buildYear > 2030))
		return { error: 'Tarkistathan rakennusvuoden.' };

	return { postalCode, roomsType, livingAreaM2, priceEur, priceIsDebtFree, buildYear };
}
