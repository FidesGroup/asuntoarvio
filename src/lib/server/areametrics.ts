/**
 * Per-postal-area derived market metrics: 12-month price change, gross rental
 * yield, price-to-income ratio and market liquidity. Pure functions, no I/O
 * and no seed imports — callers (marketstats.ts at runtime, the seed scripts
 * at build time) inject the data so both lanes compute identical numbers.
 *
 * Honesty discipline (rule 4): every metric has an explicit availability
 * threshold below which it is null, never a shaky number. Definitions are
 * documented on /miksi and must stay in sync with that page.
 */

/** Room-type split as stored in centroids.json: [eur_m2, n_4q]. */
export type RoomSplit = Partial<Record<'y' | 'k2' | 'k3', [number, number]>>;

export interface CentroidCell {
	c: number[];
	eur: number | null;
	n: number;
	per: RoomSplit;
	nimi: string;
}

/** Previous 4-quarter window, same shape as the centroid room split. */
export interface PrevCell {
	per: RoomSplit;
}

export interface PaavoCell {
	/** median income of adult residents, €/yr (Paavo hr_mtu) */
	mtu: number | null;
	/** dwelling count (Paavo ra_asunn) */
	asunnot: number | null;
}

/** RentCell shape from rents.seed.json — only the field we need. */
export interface RentCellLike {
	benchmark_eur_m2_kk: number | null;
}

export interface AreaMetrics {
	/** mix-controlled 12-month change, % (null below threshold) */
	chgPct: number | null;
	/** gross rental yield, % (postal-tier StatFin rent only) */
	yieldPct: number | null;
	/** price of a 60 m² apartment in years of local adult median income */
	priceIncome: number | null;
	/** transactions per 4 quarters per 1,000 dwellings */
	per1000: number | null;
	medianIncome: number | null;
	dwellings: number | null;
}

/** Same publication threshold as marketstats RANK_MIN_N. */
export const METRIC_MIN_N = 10;
/** Reference apartment size for the price-to-income ratio, m². */
export const PI_REFERENCE_M2 = 60;
/** Minimum dwelling stock before a per-1,000 rate is meaningful. */
export const LIQ_MIN_DWELLINGS = 50;

const ROOM_TO_RENT_KEY: Record<'y' | 'k2' | 'k3', string> = {
	y: 'yksiö',
	k2: 'kaksio',
	k3: 'kolmio+'
};

const round1 = (x: number) => Math.round(x * 10) / 10;

/**
 * Mix-controlled 12-month change: the change is computed per room type
 * against the same room type one year earlier, then transaction-weighted.
 * This controls for the sale mix shifting between yksiöt and perheasunnot,
 * which a naive mean-vs-mean comparison would report as a price change.
 */
export function changePct(now: RoomSplit, prev: RoomSplit | undefined): number | null {
	if (!prev) return null;
	let wSum = 0;
	let acc = 0;
	let prevN = 0;
	for (const r of ['y', 'k2', 'k3'] as const) {
		const cur = now[r];
		const old = prev[r];
		if (!cur || !old) continue;
		const [eurNow, nNow] = cur;
		const [eurPrev, nPrev] = old;
		if (eurNow > 0 && eurPrev > 0 && nNow > 0 && nPrev > 0) {
			acc += (eurNow / eurPrev - 1) * nNow;
			wSum += nNow;
			prevN += nPrev;
		}
	}
	if (wSum < METRIC_MIN_N || prevN < METRIC_MIN_N) return null;
	return round1((acc / wSum) * 100);
}

/**
 * Gross rental yield: StatFin postal-tier rent (asvu 13eb) against the same
 * room type's realized price (13mt), transaction-weighted across room types.
 * Town/maakunta rent fall-backs are deliberately NOT used here — a map cell
 * must not present a town-level rent as if it were local.
 */
export function grossYieldPct(
	pc: string,
	per: RoomSplit,
	rents: Record<string, RentCellLike>
): number | null {
	let wSum = 0;
	let acc = 0;
	for (const r of ['y', 'k2', 'k3'] as const) {
		const cur = per[r];
		if (!cur) continue;
		const [eur, n] = cur;
		const rent = rents[`${pc}_${ROOM_TO_RENT_KEY[r]}`]?.benchmark_eur_m2_kk;
		if (eur > 0 && n > 0 && rent != null && rent > 0) {
			acc += ((rent * 12) / eur) * n;
			wSum += n;
		}
	}
	if (wSum < METRIC_MIN_N) return null;
	return round1((acc / wSum) * 100);
}

/** Price of a PI_REFERENCE_M2 apartment in years of adult median income. */
export function priceIncomeRatio(eur: number | null, mtu: number | null): number | null {
	if (eur === null || eur <= 0 || mtu === null || mtu <= 0) return null;
	return round1((eur * PI_REFERENCE_M2) / mtu);
}

/**
 * Transactions per 4 quarters per 1,000 dwellings. n = 0 means StatFin
 * published nothing for the area — the true count is censored, not zero —
 * so the rate is null there, never 0. Published counts are still a floor
 * (suppressed room-type cells are missing), documented on /miksi.
 */
export function tradesPer1000(n: number, dwellings: number | null): number | null {
	if (n <= 0 || dwellings === null || dwellings < LIQ_MIN_DWELLINGS) return null;
	return round1((n / dwellings) * 1000);
}

export function computeAreaMetrics(
	pc: string,
	cell: CentroidCell,
	prev: PrevCell | undefined,
	paavo: PaavoCell | undefined,
	rents: Record<string, RentCellLike>
): AreaMetrics {
	return {
		chgPct: changePct(cell.per, prev?.per),
		yieldPct: grossYieldPct(pc, cell.per, rents),
		priceIncome: priceIncomeRatio(cell.eur, paavo?.mtu ?? null),
		per1000: tradesPer1000(cell.n, paavo?.asunnot ?? null),
		medianIncome: paavo?.mtu ?? null,
		dwellings: paavo?.asunnot ?? null
	};
}
