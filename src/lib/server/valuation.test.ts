import { describe, it, expect } from 'vitest';
import {
	detectConditionBand,
	computeAgePremium,
	buildConditionEstimate,
	resolveValuation,
	KUNTO_BANDS,
	type ConditionBand
} from './valuation';
import type { ExtractedListing } from './listing-parse';

const baseApartment: ExtractedListing = {
	address: 'Malminkatu 40 A',
	postalCode: '00100',
	livingAreaM2: 50,
	roomsType: 'kaksio',
	roomsRaw: '2h',
	debtFreePriceEur: 362800,
	askingPriceEur: 362800,
	debtShareEur: 0,
	maintenanceChargeEurMo: 150,
	capitalChargeEurMo: 0,
	totalChargeEurMo: 150,
	buildYear: 1985,
	condition: 'Hyvä',
	landOwnership: 'Oma',
	floor: '3',
	elevator: true,
	apartmentCount: 20,
	mortgagesEur: 0,
	housingCompany: 'Malminkatu 40 Osakeyhtymä',
	renovationsDone: [],
	renovationsUpcoming: [],
	propertyClass: 'kerrostalo',
	tonttiAreaM2: null,
	energyClass: null
};

describe('detectConditionBand', () => {
	it('detects "uusi" from new labels', () => {
		expect(detectConditionBand('uusi')).toBe('uusi');
		expect(detectConditionBand('Ensiasunto')).toBe('uusi');
	});

	it('detects "erinomainen" from excellent labels', () => {
		expect(detectConditionBand('erinomainen')).toBe('erinomainen');
		expect(detectConditionBand('Erittäin hyvä')).toBe('erinomainen');
	});

	it('detects "hyvä" from good labels', () => {
		expect(detectConditionBand('hyvä')).toBe('hyvä');
		expect(detectConditionBand('Kunnossa')).toBe('hyvä');
	});

	it('detects "tyydyttävä" from fair labels', () => {
		expect(detectConditionBand('tyydyttävä')).toBe('tyydyttävä');
		expect(detectConditionBand('Kohtuullinen')).toBe('tyydyttävä');
	});

	it('detects "välttävä" from poor labels', () => {
		expect(detectConditionBand('välttävä')).toBe('välttävä');
	});

	it('detects "huono" from bad labels', () => {
		expect(detectConditionBand('huono')).toBe('huono');
		expect(detectConditionBand('Rikkoutuneet')).toBe('huono');
	});

	it('defaults to "hyvä" when null or unknown', () => {
		expect(detectConditionBand(null)).toBe('hyvä');
		expect(detectConditionBand('xyz')).toBe('hyvä');
	});
});

describe('computeAgePremium', () => {
	it('returns 0 for typical year (1975)', () => {
		expect(computeAgePremium(1975)).toBe(0);
	});

	it('adds 5% per decade newer than 1975', () => {
		expect(computeAgePremium(1985)).toBeCloseTo(0.05, 2); // +5%
		expect(computeAgePremium(1995)).toBeCloseTo(0.10, 2); // +10%
		expect(computeAgePremium(2005)).toBeCloseTo(0.15, 2); // +15% (capped)
	});

	it('subtracts ~5% per decade older than 1975', () => {
		expect(computeAgePremium(1965)).toBeCloseTo(-0.05, 2);
		expect(computeAgePremium(1955)).toBeCloseTo(-0.10, 2);
		expect(computeAgePremium(1945)).toBeCloseTo(-0.15, 2); // capped at -20%
	});

	it('handles null build year', () => {
		expect(computeAgePremium(null)).toBe(0);
	});
});

describe('KUNTO_BANDS', () => {
	it('has all condition bands defined', () => {
		expect(KUNTO_BANDS.uusi).toBe(1.15);
		expect(KUNTO_BANDS.erinomainen).toBe(1.08);
		expect(KUNTO_BANDS.hyvä).toBe(1.0);
		expect(KUNTO_BANDS.tyydyttävä).toBe(0.92);
		expect(KUNTO_BANDS.välttävä).toBe(0.82);
		expect(KUNTO_BANDS.huono).toBe(0.70);
	});
});

describe('buildConditionEstimate - T4', () => {
	it('creates estimate with baseline multipliers (hyvä + age premium)', () => {
		const t4 = buildConditionEstimate(
			7000, // anchor
			50,   // m2
			'hyvä',
			1975, // use exact baseline year to avoid age premium
			[],
			[],
			'Oma'
		);
		expect(t4.tier).toBe('T4');
		expect(t4.confidenceLabel).toBe('suuntaa antava arvio');
		expect(t4.estMidEurM2).toBe(7000); // hyvä + no age premium = 1.0 multiplier
	});

	it('applies condition multipliers (1975 baseline, no age premium)', () => {
		const base = 7000;
		const uusi = buildConditionEstimate(base, 50, 'uusi', 1975, [], [], 'Oma');
		expect(uusi.estMidEurM2).toBeCloseTo(base * 1.15, -1);

		const huono = buildConditionEstimate(base, 50, 'huono', 1975, [], [], 'Oma');
		expect(huono.estMidEurM2).toBeCloseTo(base * 0.70, -1);
	});

	it('applies age premium for newer buildings', () => {
		const base = 7000;
		const new2005 = buildConditionEstimate(base, 50, 'hyvä', 2005, [], [], 'Oma');
		// 2005: +30 years = +15% age premium (capped)
		expect(new2005.estMidEurM2).toBeCloseTo(base * 1.15, -1);
	});

	it('applies age discount for older buildings', () => {
		const base = 7000;
		const old1950 = buildConditionEstimate(base, 50, 'hyvä', 1950, [], [], 'Oma');
		// 1950: -25 years = -25/10 * 5% = -12.5%
		expect(old1950.estMidEurM2).toBeCloseTo(base * 0.875, -1);
	});

	it('applies rented land penalty', () => {
		const base = 7000;
		const ownLand = buildConditionEstimate(base, 50, 'hyvä', 1975, [], [], 'Oma');
		const rentedLand = buildConditionEstimate(base, 50, 'hyvä', 1975, [], [], 'Vuokratontti');
		// Rented: -12%
		expect(rentedLand.estMidEurM2).toBeCloseTo(base * 0.88, -1);
		expect(ownLand.estMidEurM2).toBe(7000);
	});

	it('outputs range (±10%) around midpoint', () => {
		const t4 = buildConditionEstimate(7000, 50, 'hyvä', 1975, [], [], 'Oma');
		expect(t4.estLowEurM2).toBeCloseTo(7000 * 0.90, -1);
		expect(t4.estHighEurM2).toBeCloseTo(7000 * 1.10, -1);
	});

	it('tracks assumptions in flags', () => {
		const t4 = buildConditionEstimate(7000, 50, 'hyvä', 1975, [], [], 'Vuokratontti');
		expect(t4.assumptions).toContain('Kunto: hyvä');
		expect(t4.assumptions).toContain('Rakennusvuosi: 1975');
		expect(t4.assumptions).toContain('Vuokratontti: -12%');
	});

	it('adds completed reno credits', () => {
		const base = 7000;
		const withReno = buildConditionEstimate(
			base,
			50,
			'hyvä',
			1975,
			[{ year: 2015, text: 'putkiremontti' }],
			[],
			'Oma'
		);
		// putkiremontti: +300 €/m²
		expect(withReno.estMidEurM2).toBeCloseTo(base + 300, -1);
		expect(withReno.assumptions.some((a) => a.includes('Remontti'))).toBe(true);
	});

	it('subtracts upcoming reno liability', () => {
		const base = 7000;
		const withLiability = buildConditionEstimate(
			base,
			50,
			'hyvä',
			1975,
			[],
			[{ year: 2026, text: 'putkiremontti' }],
			'Oma'
		);
		// putkiremontti (upcoming): -15%
		expect(withLiability.estMidEurM2).toBeCloseTo(base * 0.85, -1);
		expect(withLiability.assumptions.some((a) => a.includes('Tuleva remontti'))).toBe(true);
	});
});

describe('resolveValuation - tiered routing', () => {
	it('returns T1 for postal apartment with high evidence', () => {
		const result = resolveValuation({
			...baseApartment,
			postalCode: '00100', // Known in seed with 151 txns
			roomsType: 'kaksio'
		});
		expect(result.tier).toBe('T1');
		expect(result.confidenceLabel).toBe('korkea'); // >=100 txns
		expect(result.benchmarkEurM2).toBe(7256);
	});

	it('skips to T4 when postal data is sparse', () => {
		const result = resolveValuation({
			...baseApartment,
			postalCode: '99999', // Unknown postal
			roomsType: 'kaksio'
		});
		expect(result.tier).toBe('T4');
		expect(result.confidenceLabel).toBe('suuntaa antava arvio');
	});

	it('routes detached houses to T3 (region)', () => {
		const result = resolveValuation({
			...baseApartment,
			propertyClass: 'omakotitalo',
			postalCode: '00100',
			livingAreaM2: 120
		});
		// Should use house region data (pks region)
		expect(result.tier).toBe('T3');
		expect(result.confidenceLabel).toBe('kohtalainen');
		expect(result.benchmarkEurM2).toBe(4200);
	});

	it('falls back to T4 when no tier has evidence', () => {
		const result = resolveValuation({
			...baseApartment,
			postalCode: '99999',
			propertyClass: 'kerrostalo'
		});
		expect(result.tier).toBe('T4');
	});

	it('includes tier in assumptions', () => {
		const t1 = resolveValuation({
			...baseApartment,
			postalCode: '00100',
			roomsType: 'kaksio'
		});
		expect(t1.assumptions[0]).toContain('Postinumeroalue');

		const t4 = resolveValuation({
			...baseApartment,
			postalCode: '99999'
		});
		expect(t4.assumptions.length).toBeGreaterThan(0);
	});
});

describe('Condition estimate range validation', () => {
	it('never has low >= mid', () => {
		const t4 = buildConditionEstimate(7000, 50, 'hyvä', 1985, [], [], 'Oma');
		expect(t4.estLowEurM2).toBeLessThan(t4.estMidEurM2);
	});

	it('never has high <= mid', () => {
		const t4 = buildConditionEstimate(7000, 50, 'hyvä', 1985, [], [], 'Oma');
		expect(t4.estHighEurM2).toBeGreaterThan(t4.estMidEurM2);
	});

	it('maintains ±10% spread under normal conditions', () => {
		const t4 = buildConditionEstimate(7000, 50, 'hyvä', 1985, [], [], 'Oma');
		const spread = (t4.estHighEurM2 - t4.estLowEurM2) / t4.estMidEurM2;
		expect(spread).toBeCloseTo(0.20, 1); // ±10% = 20% spread
	});
});
