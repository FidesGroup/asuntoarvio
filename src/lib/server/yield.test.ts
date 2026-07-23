import { describe, it, expect } from 'vitest';
import {
	computeYield,
	VARAINSIIRTOVERO_OSAKE,
	REMONTTIVARAUS_EUR_M2_YR,
	type YieldInputs
} from './yield';

const base: YieldInputs = {
	monthlyRentEur: 1000,
	monthlyVastikeEur: 200,
	priceEur: 200_000,
	priceIsDebtFree: true,
	livingAreaM2: 50
};

describe('computeYield', () => {
	it('computes gross yield as annual rent over price', () => {
		// 1000 * 12 / 200000 = 6.0%
		const r = computeYield(base, 'user');
		expect(r.grossYieldPct).toBe(6);
	});

	it('nets out vastike and adds transfer tax to the denominator', () => {
		// (1000 - 200) * 12 / (200000 * 1.015) = 9600 / 203000 = 4.729... -> 4.7
		const r = computeYield(base, 'user');
		const expected =
			Math.round(
				(((base.monthlyRentEur - base.monthlyVastikeEur) * 12) /
					(base.priceEur * (1 + VARAINSIIRTOVERO_OSAKE))) *
					1000
			) / 10;
		expect(r.netYieldPct).toBe(expected);
		expect(r.netYieldPct).toBe(4.7);
	});

	it('uses the confirmed 1.5% share transfer-tax rate', () => {
		expect(VARAINSIIRTOVERO_OSAKE).toBe(0.015);
	});

	it('treats a zero vastike as gross == net numerator and flags it', () => {
		const r = computeYield({ ...base, monthlyVastikeEur: 0 }, 'user');
		expect(r.monthlyNetEur).toBe(1000);
		expect(r.flags.some((f) => f.includes('Vastiketta ei annettu'))).toBe(true);
	});

	it('flags a non-debt-free price as optimistic', () => {
		const r = computeYield({ ...base, priceIsDebtFree: false }, 'user');
		expect(r.flags.some((f) => f.includes('myyntihintana'))).toBe(true);
	});

	it('flags an estimated rent as statistical, not actual', () => {
		const userR = computeYield(base, 'user');
		const estR = computeYield(base, 'estimate');
		expect(userR.rentSource).toBe('user');
		expect(estR.rentSource).toBe('estimate');
		expect(estR.flags.some((f) => f.includes('tilastollinen arvio'))).toBe(true);
		expect(userR.flags.some((f) => f.includes('tilastollinen arvio'))).toBe(false);
	});

	it('derives the reserve line from area and the labelled assumption', () => {
		const r = computeYield(base, 'user');
		expect(r.reserveEurYr).toBe(base.livingAreaM2 * REMONTTIVARAUS_EUR_M2_YR);
	});

	it('rounds yields to one decimal place', () => {
		const r = computeYield({ ...base, monthlyRentEur: 917 }, 'user');
		// ensure at most one decimal
		expect(Number.isInteger(r.grossYieldPct * 10)).toBe(true);
		expect(Number.isInteger(r.netYieldPct * 10)).toBe(true);
	});
});
