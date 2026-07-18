/**
 * Merge derived area metrics into static/map-data.geojson properties so the
 * /kartta map modes are data-driven with plain `get` expressions (no runtime
 * joins). Reads the same seeds and the same pure functions as marketstats.ts,
 * so map, tables and CSV always agree.
 *
 * Rerun after build-price-change.mts / build-paavo-stats.mts:
 *   node --experimental-strip-types scripts/enrich-map-data.mts
 *
 * Adds per feature: chg (12-mo %), yld (gross yield %), pir (price/income
 * years), liq (trades per 1,000 dwellings) — null when below threshold.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { computeAreaMetrics } from '../src/lib/server/areametrics.ts';
import type { CentroidCell, PrevCell, PaavoCell, RentCellLike } from '../src/lib/server/areametrics.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));

const centroids = read('src/lib/server/centroids.json') as Record<string, CentroidCell>;
const prev = read('src/lib/server/price-change.seed.json') as {
	cells: Record<string, PrevCell>;
};
const paavo = read('src/lib/server/paavo.seed.json') as { cells: Record<string, PaavoCell> };
const rents = read('src/lib/server/rents.seed.json') as Record<string, RentCellLike>;

const gjPath = resolve(root, 'static/map-data.geojson');
const gj = JSON.parse(readFileSync(gjPath, 'utf8')) as {
	features: { properties: Record<string, unknown> }[];
};

const counts = { chg: 0, yld: 0, pir: 0, liq: 0 };
const dists: Record<'chg' | 'yld' | 'pir' | 'liq', number[]> = { chg: [], yld: [], pir: [], liq: [] };
for (const f of gj.features) {
	const pc = f.properties.pc as string;
	const cell = centroids[pc];
	const m = cell
		? computeAreaMetrics(pc, cell, prev.cells[pc], paavo.cells[pc], rents)
		: { chgPct: null, yieldPct: null, priceIncome: null, per1000: null };
	f.properties.chg = m.chgPct;
	f.properties.yld = m.yieldPct;
	f.properties.pir = m.priceIncome;
	f.properties.liq = m.per1000;
	if (m.chgPct !== null) { counts.chg++; dists.chg.push(m.chgPct); }
	if (m.yieldPct !== null) { counts.yld++; dists.yld.push(m.yieldPct); }
	if (m.priceIncome !== null) { counts.pir++; dists.pir.push(m.priceIncome); }
	if (m.per1000 !== null) { counts.liq++; dists.liq.push(m.per1000); }
}

writeFileSync(gjPath, JSON.stringify(gj));
console.log('[enrich] features with data:', counts);
for (const [k, vals] of Object.entries(dists)) {
	vals.sort((a, b) => a - b);
	const q = (p: number) => vals[Math.min(vals.length - 1, Math.floor(vals.length * p))];
	console.log(
		`[enrich] ${k}: min=${q(0)} p10=${q(0.1)} p25=${q(0.25)} p50=${q(0.5)} p75=${q(0.75)} p90=${q(0.9)} max=${vals[vals.length - 1]}`
	);
}
