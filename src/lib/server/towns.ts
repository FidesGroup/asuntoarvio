/**
 * Per-town aggregation of areaRows() (marketstats.ts), grouped via the
 * postal->town lookup in postal-areas.ts. Powers the /kaupunki/[kunta] and
 * /postinumero/[pc] content pages — no new data source, just a different
 * slice of the same benchmark cells already used on /kartta.
 */
import { areaRows, type AreaRow } from './marketstats';
import { postalToTown } from './postal-areas';

export interface TownStats {
	town: string;
	slug: string;
	rows: AreaRow[];
	medianEurM2: number;
	totalTransactions: number;
	areaCount: number;
}

/** Lowercase, spaces to hyphens — Finnish letters (ä/ö/å) pass through as-is; the URL layer percent-encodes them. */
export function slugifyTown(name: string): string {
	return name.toLowerCase().trim().replace(/\s+/g, '-');
}

function median(sorted: number[]): number {
	const mid = Math.floor(sorted.length / 2);
	return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

let cached: Map<string, TownStats> | null = null;

function build(): Map<string, TownStats> {
	const byTown = new Map<string, AreaRow[]>();
	for (const row of areaRows()) {
		const town = postalToTown(row.pc);
		if (!town) continue;
		const list = byTown.get(town);
		if (list) list.push(row);
		else byTown.set(town, [row]);
	}
	const result = new Map<string, TownStats>();
	for (const [town, rows] of byTown) {
		const eurs = rows.map((r) => r.eur).sort((a, b) => a - b);
		result.set(slugifyTown(town), {
			town,
			slug: slugifyTown(town),
			rows: [...rows].sort((a, b) => b.eur - a.eur),
			medianEurM2: Math.round(median(eurs)),
			totalTransactions: rows.reduce((a, r) => a + r.n, 0),
			areaCount: rows.length
		});
	}
	return result;
}

/** All towns with at least one published-price postal area, sorted by name (fi collation). */
export function allTowns(): TownStats[] {
	cached ??= build();
	return [...cached.values()].sort((a, b) => a.town.localeCompare(b.town, 'fi'));
}

export function townBySlug(slug: string): TownStats | null {
	cached ??= build();
	return cached.get(slug) ?? null;
}
