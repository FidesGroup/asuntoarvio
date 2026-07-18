/**
 * Build price-change.seed.json: the 4-quarter window immediately preceding
 * the current benchmark window, per postal code and room type, from StatFin
 * 13mt (CC BY 4.0). Enables the mix-controlled 12-month change metric in
 * src/lib/server/areametrics.ts.
 *
 * One-shot generator, rerun after each benchmark seed refresh:
 *   node --experimental-strip-types scripts/build-price-change.mts
 *
 * Output: src/lib/server/price-change.seed.json
 *   { currentWindow, prevWindow, cells: { [pc]: { per: { y|k2|k3: [eur, n] } } } }
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchBenchmarks } from '../src/lib/server/statfin.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const TABLE_URL = 'https://statfin.stat.fi/PxWeb/api/v1/fi/StatFin/ashi/13mt.px';
const ROOM_KEY: Record<string, 'y' | 'k2' | 'k3'> = {
	'yksiöt': 'y',
	kaksiot: 'k2',
	'kolmiot+': 'k3'
};

function prevQuarter(q: string): string {
	const year = Number(q.slice(0, 4));
	const nr = Number(q.slice(5));
	return nr === 1 ? `${year - 1}Q4` : `${year}Q${nr - 1}`;
}

async function main() {
	const seed = JSON.parse(
		readFileSync(resolve(root, 'src/lib/server/benchmarks.seed.json'), 'utf8')
	) as Record<string, { series: { q: string }[] }>;
	const currentWindow = [
		...new Set(Object.values(seed).flatMap((c) => c.series.map((s) => s.q)))
	].sort();
	if (currentWindow.length !== 4) {
		throw new Error(`expected a 4-quarter benchmark window, got: ${currentWindow.join(',')}`);
	}
	const prevWindow: string[] = [];
	let q = currentWindow[0];
	for (let i = 0; i < 4; i++) {
		q = prevQuarter(q);
		prevWindow.unshift(q);
	}
	console.log(`[price-change] current=${currentWindow.join(',')} prev=${prevWindow.join(',')}`);

	const metaRes = await fetch(TABLE_URL);
	if (!metaRes.ok) throw new Error(`StatFin metadata: HTTP ${metaRes.status}`);
	const meta = (await metaRes.json()) as {
		variables: { code: string; values: string[] }[];
	};
	const quarters = meta.variables.find((v) => v.code === 'timeperiod_q')?.values ?? [];
	for (const p of prevWindow) {
		if (!quarters.includes(p)) throw new Error(`quarter ${p} not published in 13mt`);
	}
	const postalCodes = meta.variables.find((v) => v.code === 'postinumeroalue_4_20220101')?.values ?? [];
	if (!postalCodes.length) throw new Error('postal code dimension missing');
	console.log(`[price-change] fetching ${postalCodes.length} postal codes…`);

	const cells = await fetchBenchmarks(postalCodes, prevWindow);

	const out: Record<string, { per: Partial<Record<'y' | 'k2' | 'k3', [number, number]>> }> = {};
	let populated = 0;
	for (const [key, cell] of Object.entries(cells)) {
		if (cell.benchmark_eur_m2 === null || cell.n_4q === 0) continue;
		const us = key.indexOf('_');
		const pc = key.slice(0, us);
		const room = ROOM_KEY[key.slice(us + 1)];
		if (!room) continue;
		(out[pc] ??= { per: {} }).per[room] = [cell.benchmark_eur_m2, cell.n_4q];
		populated++;
	}
	console.log(`[price-change] ${populated} room-type cells across ${Object.keys(out).length} areas`);

	writeFileSync(
		resolve(root, 'src/lib/server/price-change.seed.json'),
		JSON.stringify({ currentWindow, prevWindow, cells: out })
	);
	console.log('[price-change] wrote src/lib/server/price-change.seed.json');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
