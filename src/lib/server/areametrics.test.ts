import { describe, it, expect } from 'vitest';
import {
	type RoomSplit,
	changePct,
	grossYieldPct,
	priceIncomeRatio,
	tradesPer1000,
	computeAreaMetrics,
	type CentroidCell
} from './areametrics';

describe('changePct — mix-controlled 12-month change', () => {
	it('compares each room type against itself, weighted by current n', () => {
		// yksiöt +10% (n 20), kaksiot -10% (n 20) → 0.0 despite different levels
		const now: RoomSplit = { y: [2200, 20], k2: [1800, 20] };
		const prev: { per: RoomSplit } = { per: { y: [2000, 20], k2: [2000, 20] } };
		expect(changePct(now, prev.per)).toBe(0);
	});

	it('is immune to sale-mix shifts a naive mean would report as change', () => {
		// Both room types flat year-on-year; only the mix changed. Naive
		// weighted means: now (4000*30+2000*10)/40=3500 vs prev
		// (4000*10+2000*30)/40=2500 → +40% "change". Mix-controlled: 0.
		const now: RoomSplit = { y: [4000, 30], k2: [2000, 10] };
		const prev: { per: RoomSplit } = { per: { y: [4000, 10], k2: [2000, 30] } };
		expect(changePct(now, prev.per)).toBe(0);
	});

	it('returns null below the transaction threshold in either window', () => {
		expect(changePct({ y: [2000, 5] }, { y: [1900, 50] })).toBeNull();
		expect(changePct({ y: [2000, 50] }, { y: [1900, 5] })).toBeNull();
	});

	it('returns null without a previous window', () => {
		expect(changePct({ y: [2000, 50] }, undefined)).toBeNull();
	});

	it('skips room types missing from one window instead of failing', () => {
		expect(changePct({ y: [2100, 30], k3: [3000, 40] }, { y: [2000, 30] })).toBe(5);
	});
});

describe('grossYieldPct', () => {
	const rents = {
		'00100_yksiö': { benchmark_eur_m2_kk: 30 },
		'00100_kaksio': { benchmark_eur_m2_kk: 25 },
		'00100_kolmio+': { benchmark_eur_m2_kk: null }
	};

	it('computes rent*12/price per room type, transaction-weighted', () => {
		// yksiöt: 360/7200 = 5%, n 10; kaksiot: 300/6000 = 5%, n 20 → 5.0
		expect(grossYieldPct('00100', { y: [7200, 10], k2: [6000, 20] }, rents)).toBe(5);
	});

	it('ignores room types whose postal-tier rent is suppressed', () => {
		expect(grossYieldPct('00100', { y: [7200, 10], k3: [5000, 100] }, rents)).toBe(5);
	});

	it('returns null when no postal-tier rent matches (no town fall-back)', () => {
		expect(grossYieldPct('99999', { y: [2000, 100] }, rents)).toBeNull();
	});

	it('returns null below the transaction threshold', () => {
		expect(grossYieldPct('00100', { y: [7200, 5] }, rents)).toBeNull();
	});
});

describe('priceIncomeRatio', () => {
	it('prices a 60 m² apartment in years of median income', () => {
		expect(priceIncomeRatio(3000, 30000)).toBe(6);
	});
	it('is null without price or income', () => {
		expect(priceIncomeRatio(null, 30000)).toBeNull();
		expect(priceIncomeRatio(3000, null)).toBeNull();
		expect(priceIncomeRatio(3000, 0)).toBeNull();
	});
});

describe('tradesPer1000', () => {
	it('normalizes trades by dwelling stock', () => {
		expect(tradesPer1000(50, 2500)).toBe(20);
	});
	it('is null when nothing is published — censored, not zero', () => {
		expect(tradesPer1000(0, 2500)).toBeNull();
	});
	it('is null for tiny dwelling stocks', () => {
		expect(tradesPer1000(5, 40)).toBeNull();
	});
});

describe('computeAreaMetrics', () => {
	it('degrades gracefully when joins are missing', () => {
		const cell: CentroidCell = { c: [25, 62], eur: 2000, n: 30, per: { k2: [2000, 30] }, nimi: 'X' };
		const m = computeAreaMetrics('12345', cell, undefined, undefined, {});
		expect(m).toEqual({
			chgPct: null,
			yieldPct: null,
			priceIncome: null,
			per1000: null,
			medianIncome: null,
			dwellings: null
		});
	});
});
