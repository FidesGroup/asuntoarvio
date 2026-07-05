/**
 * Statistics Finland PxWeb client for table 13mt
 * (old apartment EUR/m2 + transaction counts by postal code, quarterly, CC BY 4.0).
 * Used by the refresh cron; the app itself reads the local seed / Supabase cache.
 * Attribution requirement: "Lähde: Tilastokeskus" must be shown wherever values appear.
 */
import type { BenchmarkCell } from './benchmark';

const TABLE_URL = 'https://statfin.stat.fi/PxWeb/api/v1/fi/StatFin/ashi/13mt.px';
const TYPES: Record<string, string> = { '1': 'yksiöt', '2': 'kaksiot', '3': 'kolmiot+' };

export async function fetchLatestQuarters(count = 4): Promise<string[]> {
	const res = await fetch(TABLE_URL);
	if (!res.ok) throw new Error(`StatFin metadata: HTTP ${res.status}`);
	const meta = (await res.json()) as { variables: { code: string; values: string[] }[] };
	const q = meta.variables.find((v) => v.code === 'timeperiod_q');
	if (!q) throw new Error('timeperiod_q variable not found');
	return q.values.slice(-count);
}

export async function fetchBenchmarks(
	postalCodes: string[],
	quarters: string[]
): Promise<Record<string, BenchmarkCell>> {
	const query = {
		query: [
			{ code: 'timeperiod_q', selection: { filter: 'item', values: quarters } },
			{ code: 'postinumeroalue_4_20220101', selection: { filter: 'item', values: postalCodes } },
			{ code: 'talotyyppi_6_20131021', selection: { filter: 'item', values: Object.keys(TYPES) } }
		],
		response: { format: 'json-stat2' }
	};
	const res = await fetch(TABLE_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(query)
	});
	if (!res.ok) throw new Error(`StatFin query: HTTP ${res.status}`);
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

	// flatten row-major indices -> keyed lookup
	const data = new Map<string, number | null>();
	const dims = d.id;
	const strides = d.size.map((_, i) => d.size.slice(i + 1).reduce((a, b) => a * b, 1));
	d.value.forEach((v, flat) => {
		const key = dims
			.map((_, i) => codesByDim[i][Math.floor(flat / strides[i]) % d.size[i]])
			.join('|');
		data.set(key, v);
	});

	const get = (post: string, t: string, q: string, metric: string) => {
		const parts: Record<string, string> = {
			timeperiod_q: q,
			postinumeroalue_4_20220101: post,
			talotyyppi_6_20131021: t,
			contentscode: metric
		};
		return data.get(dims.map((dim) => parts[dim]).join('|')) ?? null;
	};

	const out: Record<string, BenchmarkCell> = {};
	for (const post of postalCodes) {
		for (const [t, name] of Object.entries(TYPES)) {
			const series = quarters.map((q) => ({
				q,
				eur_m2: get(post, t, q, 'keskihinta_aritm_nw'),
				n: get(post, t, q, 'lkm_julk20')
			}));
			const good = series.filter((s) => s.eur_m2 !== null && s.n);
			const nSum = good.reduce((a, s) => a + (s.n as number), 0);
			out[`${post}_${name}`] = {
				benchmark_eur_m2: good.length
					? Math.round(good.reduce((a, s) => a + (s.eur_m2 as number) * (s.n as number), 0) / nSum)
					: null,
				n_4q: nSum,
				series
			};
		}
	}
	return out;
}
