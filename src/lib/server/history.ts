/**
 * Area price history from StatFin 13mt (same table/lane as the benchmark
 * seed, CC BY 4.0 — "Lähde: Tilastokeskus" must be shown wherever these
 * values appear). Fetched on demand per postal code for the /arvio page,
 * aggregated to yearly figures, cached in memory. Best-effort: any
 * failure returns null and the page renders without the history section.
 */

const TABLE_URL = 'https://statfin.stat.fi/PxWeb/api/v1/fi/StatFin/ashi/13mt.px';

const TYPES: Record<string, string> = { '1': 'yksiöt', '2': 'kaksiot', '3': 'kolmiot+' };

export interface YearPoint {
	year: number;
	/** transaction-weighted mean €/m² for the year, per room type (null = suppressed) */
	eur: Record<string, number | null>;
	/** published transactions in the year, all room types */
	n: number;
}

export interface AreaHistory {
	postalCode: string;
	years: YearPoint[];
	/** average annual €/m² change across all room types, % (null if < 3 populated years) */
	annualChangePct: number | null;
	/** last 4 populated quarters vs the 4 before, weighted mean €/m², % */
	last12moChangePct: number | null;
	/**
	 * 12-month trend projection, %: linear regression over the last up to
	 * 20 quarterly weighted means (≈5 years) extended 4 quarters forward.
	 * Deterministic and disclosed in the UI as a trend, not a promise.
	 */
	next12moTrendPct: number | null;
}

const cache = new Map<string, { at: number; data: AreaHistory | null }>();
const TTL_MS = 12 * 60 * 60 * 1000;

export async function fetchAreaHistory(postalCode: string): Promise<AreaHistory | null> {
	const hit = cache.get(postalCode);
	if (hit && Date.now() - hit.at < TTL_MS) return hit.data;
	let data: AreaHistory | null = null;
	try {
		data = await fetchUncached(postalCode);
	} catch {
		data = null;
	}
	cache.set(postalCode, { at: Date.now(), data });
	return data;
}

async function fetchUncached(postalCode: string): Promise<AreaHistory | null> {
	const signal = AbortSignal.timeout(4000);
	const metaRes = await fetch(TABLE_URL, { signal });
	if (!metaRes.ok) return null;
	const meta = (await metaRes.json()) as { variables: { code: string; values: string[] }[] };
	const quarters = meta.variables.find((v) => v.code === 'timeperiod_q')?.values ?? [];
	if (!quarters.length) return null;

	const query = {
		query: [
			{ code: 'timeperiod_q', selection: { filter: 'item', values: quarters } },
			{ code: 'postinumeroalue_4_20220101', selection: { filter: 'item', values: [postalCode] } },
			{ code: 'talotyyppi_6_20131021', selection: { filter: 'item', values: Object.keys(TYPES) } }
		],
		response: { format: 'json-stat2' }
	};
	const res = await fetch(TABLE_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(query),
		signal
	});
	if (!res.ok) return null;
	const d = (await res.json()) as {
		id: string[];
		size: number[];
		value: (number | null)[];
		dimension: Record<string, { category: { index: Record<string, number> } }>;
	};

	const codesByDim = d.id.map((dim) => {
		const index = d.dimension[dim].category.index;
		const arr: string[] = [];
		for (const [code, i] of Object.entries(index)) arr[i] = code;
		return arr;
	});
	const strides = d.size.map((_, i) => d.size.slice(i + 1).reduce((a, b) => a * b, 1));
	const data = new Map<string, number | null>();
	d.value.forEach((v, flat) => {
		const key = d.id
			.map((_, i) => codesByDim[i][Math.floor(flat / strides[i]) % d.size[i]])
			.join('|');
		data.set(key, v);
	});
	const get = (t: string, q: string, metric: string) => {
		const parts: Record<string, string> = {
			timeperiod_q: q,
			postinumeroalue_4_20220101: postalCode,
			talotyyppi_6_20131021: t,
			contentscode: metric
		};
		return data.get(d.id.map((dim) => parts[dim]).join('|')) ?? null;
	};

	// Quarterly → yearly: transaction-weighted €/m² per room type, summed n.
	// Also keep the all-type weighted mean per quarter for the 12-month change.
	const byYear = new Map<number, { sums: Record<string, number>; ns: Record<string, number>; n: number }>();
	const qMeans: number[] = [];
	for (const q of quarters) {
		const year = Number(q.slice(0, 4));
		if (!byYear.has(year)) byYear.set(year, { sums: {}, ns: {}, n: 0 });
		const y = byYear.get(year)!;
		let qSum = 0;
		let qN = 0;
		for (const [t, name] of Object.entries(TYPES)) {
			const eur = get(t, q, 'keskihinta_aritm_nw');
			const n = get(t, q, 'lkm_julk20');
			if (eur !== null && n) {
				y.sums[name] = (y.sums[name] ?? 0) + eur * n;
				y.ns[name] = (y.ns[name] ?? 0) + n;
				y.n += n;
				qSum += eur * n;
				qN += n;
			}
		}
		if (qN > 0) qMeans.push(qSum / qN);
	}
	let last12moChangePct: number | null = null;
	if (qMeans.length >= 8) {
		const recent = qMeans.slice(-4).reduce((a, b) => a + b, 0) / 4;
		const prev = qMeans.slice(-8, -4).reduce((a, b) => a + b, 0) / 4;
		if (prev > 0) last12moChangePct = Math.round((recent / prev - 1) * 1000) / 10;
	}

	let next12moTrendPct: number | null = null;
	{
		const N = Math.min(qMeans.length, 20);
		if (N >= 8) {
			const ys = qMeans.slice(-N);
			const xm = (N - 1) / 2;
			const ym = ys.reduce((a, b) => a + b, 0) / N;
			const denom = ys.reduce((a, _, i) => a + (i - xm) ** 2, 0);
			const slope = ys.reduce((a, y, i) => a + (i - xm) * (y - ym), 0) / denom;
			const lastMean = qMeans.slice(-4).reduce((a, b) => a + b, 0) / 4;
			const nextMean = lastMean + slope * 4;
			if (lastMean > 0) next12moTrendPct = Math.round((nextMean / lastMean - 1) * 1000) / 10;
		}
	}
	const years: YearPoint[] = [...byYear.entries()]
		.map(([year, y]) => ({
			year,
			eur: Object.fromEntries(
				Object.values(TYPES).map((name) => [
					name,
					y.ns[name] ? Math.round(y.sums[name] / y.ns[name]) : null
				])
			),
			n: y.n
		}))
		.sort((a, b) => a.year - b.year);
	if (!years.some((y) => y.n > 0)) return null;

	// Average annual change: CAGR over the all-types weighted yearly mean.
	const means = years
		.map((y) => {
			const vals = Object.values(TYPES)
				.map((name) => y.eur[name])
				.filter((e): e is number => e !== null);
			return vals.length
				? { year: y.year, eur: vals.reduce((a, b) => a + b, 0) / vals.length }
				: null;
		})
		.filter((m): m is { year: number; eur: number } => m !== null);
	let annualChangePct: number | null = null;
	if (means.length >= 3) {
		const first = means[0];
		const last = means[means.length - 1];
		const span = last.year - first.year;
		if (span >= 2 && first.eur > 0) {
			annualChangePct = Math.round(((last.eur / first.eur) ** (1 / span) - 1) * 1000) / 10;
		}
	}

	return { postalCode, years, annualChangePct, last12moChangePct, next12moTrendPct };
}
