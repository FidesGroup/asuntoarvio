/**
 * Whole-country price history from StatFin 13mv (old apartment €/m² and
 * transaction counts by larger areas, quarterly since 2006, CC BY 4.0).
 * Same shape as AreaHistory so the /arvio history charts render it
 * unchanged on the Markkina-analyysi page. Best-effort + cached.
 */
import type { AreaHistory, YearPoint } from './history';

const TABLE_URL = 'https://statfin.stat.fi/PxWeb/api/v1/fi/StatFin/ashi/13mv.px';
const AREA = 'ksu'; // Koko maa
// 13mv publishes the room-type split only for kerrostalot (talotyyppi 3);
// talotyyppi 0/1 carry only the 'Yhteensä' room class.
const BUILDING_TYPE = '3';
const ROOMS: Record<string, string> = { '01': 'yksiöt', '02': 'kaksiot', '03': 'kolmiot+' };

let cache: { at: number; data: AreaHistory | null } | null = null;
const TTL_MS = 12 * 60 * 60 * 1000;

export async function fetchCountryHistory(): Promise<AreaHistory | null> {
	if (cache && Date.now() - cache.at < TTL_MS) return cache.data;
	let data: AreaHistory | null = null;
	try {
		data = await fetchUncached();
	} catch (e) {
		console.error('country-history:', e);
		data = null;
	}
	cache = { at: Date.now(), data };
	return data;
}

async function fetchUncached(): Promise<AreaHistory | null> {
	const metaRes = await fetch(TABLE_URL, { signal: AbortSignal.timeout(6000) });
	if (!metaRes.ok) return null;
	const meta = (await metaRes.json()) as { variables: { code: string; values: string[] }[] };
	const quarters = meta.variables.find((v) => v.code === 'timeperiod_q')?.values ?? [];
	if (!quarters.length) return null;

	const query = {
		query: [
			{ code: 'timeperiod_q', selection: { filter: 'item', values: quarters } },
			{ code: 'alue_43_20220407', selection: { filter: 'item', values: [AREA] } },
			{ code: 'talotyyppi_5_20111209', selection: { filter: 'item', values: [BUILDING_TYPE] } },
			{ code: 'huoneluku_1_20111212', selection: { filter: 'item', values: Object.keys(ROOMS) } }
		],
		response: { format: 'json-stat2' }
	};
	const res = await fetch(TABLE_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(query),
		signal: AbortSignal.timeout(6000)
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
	const get = (room: string, q: string, metric: string) => {
		const parts: Record<string, string> = {
			timeperiod_q: q,
			alue_43_20220407: AREA,
			talotyyppi_5_20111209: BUILDING_TYPE,
			huoneluku_1_20111212: room,
			contentscode: metric
		};
		return data.get(d.id.map((dim) => parts[dim]).join('|')) ?? null;
	};
	// Transaction counts switch register in 2020; take whichever is published.
	const getN = (room: string, q: string) =>
		get(room, q, 'lkm_julk20') ?? get(room, q, 'lkm_julk19');

	const byYear = new Map<number, { sums: Record<string, number>; ns: Record<string, number>; n: number }>();
	const qMeans: number[] = [];
	for (const q of quarters) {
		const year = Number(q.slice(0, 4));
		if (!byYear.has(year)) byYear.set(year, { sums: {}, ns: {}, n: 0 });
		const y = byYear.get(year)!;
		let qSum = 0;
		let qN = 0;
		for (const [room, name] of Object.entries(ROOMS)) {
			const eur = get(room, q, 'keskihinta_aritm');
			const n = getN(room, q);
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
	const years: YearPoint[] = [...byYear.entries()]
		.map(([year, y]) => ({
			year,
			eur: Object.fromEntries(
				Object.values(ROOMS).map((name) => [
					name,
					y.ns[name] ? Math.round(y.sums[name] / y.ns[name]) : null
				])
			),
			n: y.n
		}))
		.sort((a, b) => a.year - b.year);
	if (!years.some((y) => y.n > 0)) return null;

	const means = years
		.map((y) => {
			const vals = Object.values(ROOMS)
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

	return { postalCode: AREA, years, annualChangePct, last12moChangePct, next12moTrendPct };
}
