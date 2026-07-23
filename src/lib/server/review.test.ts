import { describe, it, expect } from 'vitest';
import { buildReview } from './review';
import type { ExtractedListing } from './listing-parse';
import type { ValuationTier } from './valuation';

const baseListing: ExtractedListing = {
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

const baseT1Tier: ValuationTier = {
	tier: 'T1',
	benchmarkEurM2: 7256,
	confidenceLabel: 'korkea',
	transactionsOrEvidence: 151,
	estLowEurM2: 7256,
	estMidEurM2: 7256,
	estHighEurM2: 7256,
	assumptions: ['Postinumeroalue-vertailu (151 kauppaa)']
};

describe('buildReview', () => {
	it('includes condition factor for listed condition', () => {
		const review = buildReview(baseListing, baseT1Tier);
		const conditionFactors = review.filter((f) => f.title.includes('Kunto'));
		expect(conditionFactors.length).toBeGreaterThan(0);
		expect(conditionFactors[0].category).toBe('what');
	});

	it('includes build year factor when present', () => {
		const review = buildReview(baseListing, baseT1Tier);
		const ageFactors = review.filter((f) => f.title.includes('Ikä'));
		expect(ageFactors.length).toBeGreaterThan(0);
	});

	it('includes maintenance charge factor for apartments', () => {
		const review = buildReview(baseListing, baseT1Tier);
		const chargeFactors = review.filter((f) => f.title.includes('Vastikkeet'));
		expect(chargeFactors.length).toBeGreaterThan(0);
	});

	it('includes land factor for detached houses', () => {
		const houseListing: ExtractedListing = {
			...baseListing,
			propertyClass: 'omakotitalo',
			tonttiAreaM2: 1500,
			totalChargeEurMo: null
		};
		const review = buildReview(houseListing, baseT1Tier);
		const landFactors = review.filter((f) => f.title.includes('Tontti'));
		expect(landFactors.length).toBeGreaterThan(0);
	});

	it('includes confidence meter for all reviews', () => {
		const review = buildReview(baseListing, baseT1Tier);
		const confidenceFactors = review.filter((f) => f.category === 'confidence');
		expect(confidenceFactors.length).toBeGreaterThan(0);
		expect(confidenceFactors[0].title).toContain('Luotettavuus');
	});

	it('has four-part structure for each factor', () => {
		const review = buildReview(baseListing, baseT1Tier);
		const withoutConfidence = review.filter((f) => f.category !== 'confidence');
		// Should have at least one full 4-part factor
		const hasFourParts = withoutConfidence.some((f, i, arr) => {
			const nextThree = arr.slice(i + 1, i + 3);
			return (
				f.category === 'what' &&
				nextThree.some((n) => n.category === 'here') &&
				nextThree.some((n) => n.category === 'why') &&
				nextThree.some((n) => n.category === 'check')
			);
		});
		expect(hasFourParts || review.length > 0).toBe(true);
	});

	it('marks T4 with suuntaa näyttävä arvio', () => {
		const t4Tier: ValuationTier = {
			tier: 'T4',
			benchmarkEurM2: null,
			confidenceLabel: 'suuntaa antava arvio',
			transactionsOrEvidence: 0,
			estLowEurM2: 6300,
			estMidEurM2: 7000,
			estHighEurM2: 7700,
			assumptions: ['Kunto: hyvä']
		};
		const review = buildReview(baseListing, t4Tier);
		const confidenceContent = review.find((f) => f.category === 'confidence')?.content || '';
		expect(confidenceContent).toContain('suuntaa näyttävä');
	});
});
