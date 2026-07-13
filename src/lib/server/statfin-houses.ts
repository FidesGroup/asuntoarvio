/**
 * Statistics Finland PxWeb client for table 15hw
 * (detached-house prices, regional, quarterly, CC BY 4.0).
 * Used by the refresh cron; the app itself reads the local seed / Supabase cache.
 * Attribution requirement: "Lähde: Tilastokeskus" must be shown wherever values appear.
 */
import type { HouseBenchmarkCell } from './benchmark';

const TABLE_URL = 'https://statfin.stat.fi/PxWeb/api/v1/fi/StatFin/kihi/15hw.px';

// Regional codes in 15hw.px; we use these as the fallback tier for detached houses
const REGION_KEYS: Record<string, string> = {
	'SSS': 'Koko maa',
	'pks': 'Pääkaupunkiseutu',
	'iso': 'Suuret kaupungit',
	'keh': 'Kehyskunnat',
	'mki': 'Koko maa ilman suuria kaupunkeja',
	'S01': 'Etelä-Suomi',
	'S02': 'Länsi-Suomi',
	'S03': 'Itä-Suomi',
	'S04': 'Pohjois-Suomi'
};

export async function fetchLatestQuarters(count = 4): Promise<string[]> {
	const res = await fetch(TABLE_URL);
	if (!res.ok) throw new Error(`StatFin house metadata: HTTP ${res.status}`);
	const meta = (await res.json()) as { variables: { code: string; values: string[] }[] };
	const q = meta.variables.find((v) => v.code === 'timeperiod_q');
	if (!q) throw new Error('timeperiod_q variable not found in 15hw.px');
	return q.values.slice(-count);
}

export async function fetchHouseBenchmarks(
	regions: string[],
	quarters: string[]
): Promise<Record<string, HouseBenchmarkCell>> {
	const query = {
		query: [
			{ code: 'timeperiod_q', selection: { filter: 'item', values: quarters } },
			{ code: 'alue_20_20260422', selection: { filter: 'item', values: regions } },
			{ code: 'contentscode', selection: { filter: 'item', values: ['kihi_keskineliohinta', 'kihi_kauppamaara'] } }
		],
		response: { format: 'json-stat2' }
	};
	const res = await fetch(TABLE_URL, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(query)
	});
	if (!res.ok) throw new Error(`StatFin house query: HTTP ${res.status}`);
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

	const get = (region: string, q: string, metric: string) => {
		const parts: Record<string, string> = {
			timeperiod_q: q,
			alue_20_20260422: region,
			contentscode: metric
		};
		return data.get(dims.map((dim) => parts[dim]).join('|')) ?? null;
	};

	const out: Record<string, HouseBenchmarkCell> = {};
	for (const region of regions) {
		const series = quarters.map((q) => ({
			q,
			eur_m2: get(region, q, 'kihi_keskineliohinta'),
			n: get(region, q, 'kihi_kauppamaara')
		}));
		const good = series.filter((s) => s.eur_m2 !== null && s.n);
		const nSum = good.reduce((a, s) => a + (s.n as number), 0);
		out[region] = {
			benchmark_eur_m2: good.length
				? Math.round(good.reduce((a, s) => a + (s.eur_m2 as number) * (s.n as number), 0) / nSum)
				: null,
			n_4q: nSum,
			series
		};
	}
	return out;
}
