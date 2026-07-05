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

export type RoomsType = 'yksiö' | 'kaksio' | 'kolmio+';

export interface ListingFacts {
	postalCode: string;
	roomsType: RoomsType;
	livingAreaM2: number;
	/** velaton hinta if known, otherwise myyntihinta */
	priceEur: number;
	priceIsDebtFree: boolean;
	buildYear?: number | null;
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

const TYPE_KEY: Record<RoomsType, string> = {
	'yksiö': 'yksiöt',
	'kaksio': 'kaksiot',
	'kolmio+': 'kolmiot+'
};

const cells = seed as Record<string, BenchmarkCell>;

export function knownPostalCodes(): string[] {
	return [...new Set(Object.keys(cells).map((k) => k.split('_')[0]))].sort();
}

export function lookupCell(postalCode: string, roomsType: RoomsType): BenchmarkCell | null {
	return cells[`${postalCode}_${TYPE_KEY[roomsType]}`] ?? null;
}

export function evaluate(facts: ListingFacts): Verdict {
	const cell = lookupCell(facts.postalCode, facts.roomsType);
	const listingEurM2 = Math.round(facts.priceEur / facts.livingAreaM2);
	const flags: string[] = [];

	if (!facts.priceIsDebtFree) {
		flags.push(
			'Hinta syötetty myyntihintana. Jos kohteessa on yhtiölainaa, todellinen (velaton) neliöhinta on korkeampi — vertailu voi näyttää liian edulliselta.'
		);
	}
	if (facts.buildYear && facts.buildYear >= 2010) {
		flags.push(
			'Uudehko rakennus: vertailuarvo perustuu alueen vanhojen osakeasuntojen kauppoihin, joten uudiskohde näyttää tyypillisesti selvästi vertailua kalliimmalta.'
		);
	}
	if (facts.livingAreaM2 <= 30) {
		flags.push('Pieni asunto: pienet yksiöt myydään tyypillisesti alueen keskineliöhintaa kalliimmalla.');
	}
	if (facts.livingAreaM2 >= 100) {
		flags.push('Suuri asunto: suuret huoneistot myydään tyypillisesti alueen keskineliöhintaa halvemmalla.');
	}
	if (!facts.buildYear) {
		flags.push('Rakennusvuosi ei tiedossa — ikä- ja kuntoerot eivät näy vertailussa.');
	}

	if (!cell || cell.benchmark_eur_m2 === null) {
		flags.push(
			'Tilastokeskus ei julkaise tälle postinumero–huonetyyppi-yhdistelmälle neliöhintaa (liian vähän kauppoja). Vertailua ei voida laskea.'
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
			`Vertailu perustuu ${cell.n_4q} kauppaan viimeisen neljän tilastoneljänneksen ajalta — pieni otos, yksittäiset kaupat heiluttavat keskiarvoa.`
		);
	}
	flags.push(
		'Postinumeroalueen keskiarvo ei erottele mikrosijaintia, kuntoa eikä taloyhtiön velkoja tai remontteja. Suuntaa antava seula, ei arvio.'
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

export function parseFacts(params: URLSearchParams): ListingFacts | { error: string } {
	const postalCode = (params.get('pc') ?? '').trim();
	const roomsType = ROOMS_ALIASES[(params.get('rt') ?? '').trim().toLowerCase()];
	const livingAreaM2 = Number(params.get('m2'));
	const priceEur = Number(params.get('price'));
	const priceIsDebtFree = params.get('debtfree') !== '0';
	const buildYearRaw = params.get('yr');
	const buildYear = buildYearRaw ? Number(buildYearRaw) : null;

	if (!/^\d{5}$/.test(postalCode)) return { error: 'Postinumero puuttuu tai on virheellinen.' };
	if (!(roomsType in TYPE_KEY)) return { error: 'Valitse huonetyyppi.' };
	if (!Number.isFinite(livingAreaM2) || livingAreaM2 < 10 || livingAreaM2 > 400)
		return { error: 'Pinta-ala puuttuu tai on virheellinen (10–400 m²).' };
	if (!Number.isFinite(priceEur) || priceEur < 10_000 || priceEur > 20_000_000)
		return { error: 'Hinta puuttuu tai on virheellinen.' };
	if (buildYear !== null && (!Number.isFinite(buildYear) || buildYear < 1800 || buildYear > 2030))
		return { error: 'Rakennusvuosi on virheellinen.' };

	return { postalCode, roomsType, livingAreaM2, priceEur, priceIsDebtFree, buildYear };
}
