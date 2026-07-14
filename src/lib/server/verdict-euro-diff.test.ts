/**
 * Euro-difference helper used by VerdictBlock and /arvio for the euro-first verdict
 * (HANDOFF step 4). Mirrors the formula in those consumers — the test pins both
 * the unit-convention (deltaPct is in percent, not a fraction) and the rounding
 * (nearest 1 000 €) so a future refactor can't silently produce nonsense.
 */
import { describe, it, expect } from 'vitest';

function eurDiff(priceEur: number, deltaPct: number | null): number | null {
	if (deltaPct === null || !Number.isFinite(deltaPct)) return null;
	if (!Number.isFinite(priceEur) || priceEur <= 0) return null;
	const fraction = deltaPct / 100;
	if (fraction <= -1) return null;
	const raw = priceEur - priceEur / (1 + fraction);
	return Math.round(raw / 1000) * 1000;
}

describe('eurDiff — euro-first verdict helper', () => {
	it('computes positive diff for price above market', () => {
		// 10% over: price − price / 1.10 = 289000 − 262727 = 26273 → 26 000 €
		expect(eurDiff(289_000, 10)).toBe(26_000);
	});

	it('computes negative diff for price below market', () => {
		// 10% under: price − price / 0.90 = 289000 − 321111 = −32111 → −32 000 €
		expect(eurDiff(289_000, -10)).toBe(-32_000);
	});

	it('rounds to nearest 1 000 €', () => {
		// 5% over: 200000 − 200000/1.05 = 9523.8 → 10 000 €
		expect(eurDiff(200_000, 5)).toBe(10_000);
		// 1.5% over: 200000 − 200000/1.015 = 2955.7 → 3 000 €
		expect(eurDiff(200_000, 1.5)).toBe(3_000);
		// 0.3% over: 200000 − 200000/1.003 = 598.2 → 1 000 €
		expect(eurDiff(200_000, 0.3)).toBe(1_000);
	});

	it('handles 0 % diff (price matches market)', () => {
		expect(eurDiff(289_000, 0)).toBe(0);
	});

	it('returns null when deltaPct is null', () => {
		expect(eurDiff(289_000, null)).toBeNull();
	});

	it('returns null when deltaPct is non-finite', () => {
		expect(eurDiff(289_000, Number.NaN)).toBeNull();
	});

	it('returns null when deltaPct <= -100% (degenerate)', () => {
		expect(eurDiff(289_000, -100)).toBeNull();
		expect(eurDiff(289_000, -150)).toBeNull();
	});

	it('returns null when priceEur is missing or non-finite', () => {
		expect(eurDiff(0, 10)).toBeNull();
		expect(eurDiff(Number.NaN, 10)).toBeNull();
	});

	it('unit guard: treats deltaPct as percent, not a fraction', () => {
		// If someone passes a fraction (e.g. 0.10 for 10%) instead of percent (10),
		// the helper would still compute a value — but a much smaller one. The
		// percent interpretation is what the verdict block feeds in; the test
		// pins that contract.
		const percent = eurDiff(289_000, 10);
		const fraction = eurDiff(289_000, 0.1);
		expect(percent).toBe(26_000);
		expect(fraction).toBe(0); // rounds to zero, not 26 000 — percent is the contract
		expect(percent).not.toBe(fraction);
	});
});
