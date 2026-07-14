/**
 * Whole-country market statistics computed from the bundled benchmark
 * centroids (StatFin 13mt, 4 latest quarters, CC BY 4.0). Shown on the
 * landing page and /kartta — "Lähde: Tilastokeskus" must stay visible.
 */
import centroids from './centroids.json';

export interface AreaStat {
	pc: string;
	nimi: string;
	eur: number;
	n: number;
}

export interface PriceBand {
	/** inclusive lower bound, null = open start */
	from: number | null;
	/** exclusive upper bound, null = open end */
	to: number | null;
	areas: number;
	transactions: number;
}

export interface MarketStats {
	areasWithData: number;
	totalTransactions: number;
	medianEurM2: number;
	topExpensive: AreaStat[];
	topCheapest: AreaStat[];
	/** distribution over the same €/m² bands as the map ramp */
	bands: PriceBand[];
}

/** Must match BREAKS in src/lib/PriceMap.svelte so chart and map agree. */
const BAND_BREAKS = [800, 1450, 2200, 3400, 5700];

/** Areas need a minimum transaction count before ranking them publicly. */
const RANK_MIN_N = 10;
const TOP_COUNT = 5;

let cached: MarketStats | null = null;

export function marketStats(): MarketStats {
	if (cached) return cached;
	const rows: AreaStat[] = Object.entries(
		centroids as Record<string, { c: number[]; eur: number | null; n: number; nimi: string }>
	)
		.filter(([, v]) => v.eur !== null && v.eur > 0)
		.map(([pc, v]) => ({ pc, nimi: v.nimi, eur: v.eur as number, n: v.n }));

	const eurs = rows.map((r) => r.eur).sort((a, b) => a - b);
	const mid = Math.floor(eurs.length / 2);
	const median = eurs.length % 2 ? eurs[mid] : Math.round((eurs[mid - 1] + eurs[mid]) / 2);

	const ranked = rows.filter((r) => r.n >= RANK_MIN_N);
	const byEurDesc = [...ranked].sort((a, b) => b.eur - a.eur);

	const edges = [null, ...BAND_BREAKS, null];
	const bands: PriceBand[] = [];
	for (let i = 0; i < edges.length - 1; i++) {
		const from = edges[i];
		const to = edges[i + 1];
		const inBand = rows.filter(
			(r) => (from === null || r.eur >= from) && (to === null || r.eur < to)
		);
		bands.push({
			from,
			to,
			areas: inBand.length,
			transactions: inBand.reduce((a, r) => a + r.n, 0)
		});
	}

	cached = {
		areasWithData: rows.length,
		totalTransactions: rows.reduce((a, r) => a + r.n, 0),
		medianEurM2: median,
		topExpensive: byEurDesc.slice(0, TOP_COUNT),
		topCheapest: byEurDesc.slice(-TOP_COUNT).reverse(),
		bands
	};
	return cached;
}
