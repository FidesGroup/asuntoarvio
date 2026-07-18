/**
 * Whole-country market statistics computed from the bundled benchmark
 * centroids (StatFin 13mt, 4 latest quarters, CC BY 4.0), joined with rents
 * (asvu 13eb), the previous-year price window and Paavo income/dwelling
 * counts. Shown on the landing page and /kartta — "Lähde: Tilastokeskus"
 * must stay visible. Derived-metric definitions live in areametrics.ts and
 * are documented on /miksi.
 */
import centroids from './centroids.json';
import prevSeed from './price-change.seed.json';
import paavoSeed from './paavo.seed.json';
import rentsSeed from './rents.seed.json';
import {
	computeAreaMetrics,
	type CentroidCell,
	type PrevCell,
	type PaavoCell,
	type RentCellLike
} from './areametrics';

export interface AreaStat {
	pc: string;
	nimi: string;
	eur: number;
	n: number;
}

/** AreaStat plus the ranked metric's value (yield % or change %). */
export interface MetricStat extends AreaStat {
	value: number;
}

/** One row of the full downloadable area table. */
export interface AreaRow {
	pc: string;
	nimi: string;
	eur: number;
	n: number;
	chgPct: number | null;
	yieldPct: number | null;
	priceIncome: number | null;
	per1000: number | null;
	medianIncome: number | null;
	dwellings: number | null;
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
	p25EurM2: number;
	p75EurM2: number;
	/** transaction-weighted mix-controlled 12-mo change over published areas */
	countryChangePct: number | null;
	medianYieldPct: number | null;
	/** e.g. "2025Q2–2026Q1" — the 4-quarter window behind every figure */
	windowLabel: string;
	latestQuarter: string;
	topExpensive: AreaStat[];
	topCheapest: AreaStat[];
	topByVolume: AreaStat[];
	topYield: MetricStat[];
	topRisers: MetricStat[];
	topFallers: MetricStat[];
	/** distribution over the same €/m² bands as the map ramp */
	bands: PriceBand[];
}

/** Must match BREAKS in src/lib/PriceMap.svelte so chart and map agree. */
const BAND_BREAKS = [800, 1450, 2200, 3400, 5700];

/** Areas need a minimum transaction count before ranking them publicly. */
const RANK_MIN_N = 10;
const TOP_COUNT = 5;

let cachedRows: AreaRow[] | null = null;
let cached: MarketStats | null = null;

// JSON imports type tuples as number[] — routed through unknown on purpose.
const cells = centroids as unknown as Record<string, CentroidCell>;
const prevCells = (prevSeed as unknown as { cells: Record<string, PrevCell> }).cells;
const paavoCells = (paavoSeed as { cells: Record<string, PaavoCell> }).cells;
const rentCells = rentsSeed as Record<string, RentCellLike>;
const priceWindow = (prevSeed as { currentWindow: string[] }).currentWindow;

/** Full area table (published areas only) — feeds /kartta and the CSV export. */
export function areaRows(): AreaRow[] {
	if (cachedRows) return cachedRows;
	cachedRows = Object.entries(cells)
		.filter(([, v]) => v.eur !== null && v.eur > 0)
		.map(([pc, v]) => {
			const m = computeAreaMetrics(pc, v, prevCells[pc], paavoCells[pc], rentCells);
			return {
				pc,
				nimi: v.nimi,
				eur: v.eur as number,
				n: v.n,
				chgPct: m.chgPct,
				yieldPct: m.yieldPct,
				priceIncome: m.priceIncome,
				per1000: m.per1000,
				medianIncome: m.medianIncome,
				dwellings: m.dwellings
			};
		});
	return cachedRows;
}

function median(sorted: number[]): number {
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function marketStats(): MarketStats {
	if (cached) return cached;
	const rows = areaRows();

	const eurs = rows.map((r) => r.eur).sort((a, b) => a - b);
	const p25 = eurs[Math.floor(eurs.length * 0.25)];
	const p75 = eurs[Math.floor(eurs.length * 0.75)];

	const ranked = rows.filter((r) => r.n >= RANK_MIN_N);
	const byEurDesc = [...ranked].sort((a, b) => b.eur - a.eur);

	const withChg = ranked.filter((r): r is AreaRow & { chgPct: number } => r.chgPct !== null);
	const byChgDesc = [...withChg].sort((a, b) => b.chgPct - a.chgPct);
	const chgWeight = withChg.reduce((a, r) => a + r.n, 0);
	const countryChangePct = chgWeight
		? Math.round((withChg.reduce((a, r) => a + r.chgPct * r.n, 0) / chgWeight) * 10) / 10
		: null;

	const withYield = ranked.filter((r): r is AreaRow & { yieldPct: number } => r.yieldPct !== null);
	const yields = withYield.map((r) => r.yieldPct).sort((a, b) => a - b);
	const medianYieldPct = yields.length ? Math.round(median(yields) * 10) / 10 : null;

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

	const toStat = ({ pc, nimi, eur, n }: AreaRow): AreaStat => ({ pc, nimi, eur, n });
	const toMetric = (r: AreaRow, value: number): MetricStat => ({ ...toStat(r), value });

	cached = {
		areasWithData: rows.length,
		totalTransactions: rows.reduce((a, r) => a + r.n, 0),
		medianEurM2: Math.round(median(eurs)),
		p25EurM2: p25,
		p75EurM2: p75,
		countryChangePct,
		medianYieldPct,
		windowLabel: priceWindow.length ? `${priceWindow[0]}–${priceWindow[priceWindow.length - 1]}` : '',
		latestQuarter: priceWindow[priceWindow.length - 1] ?? '',
		topExpensive: byEurDesc.slice(0, TOP_COUNT).map(toStat),
		topCheapest: byEurDesc.slice(-TOP_COUNT).reverse().map(toStat),
		topByVolume: [...rows].sort((a, b) => b.n - a.n).slice(0, TOP_COUNT).map(toStat),
		topYield: [...withYield]
			.sort((a, b) => b.yieldPct - a.yieldPct)
			.slice(0, TOP_COUNT)
			.map((r) => toMetric(r, r.yieldPct)),
		topRisers: byChgDesc.slice(0, TOP_COUNT).map((r) => toMetric(r, r.chgPct)),
		topFallers: byChgDesc.slice(-TOP_COUNT).reverse().map((r) => toMetric(r, r.chgPct)),
		bands
	};
	return cached;
}
