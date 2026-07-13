import { describe, it, expect } from 'vitest';
import { evaluate, evaluateProperty, parseFacts, type ListingFacts } from './benchmark';

const baseApartment: ListingFacts = {
	postalCode: '00100',
	roomsType: 'kaksio',
	livingAreaM2: 50,
	priceEur: 362800, // 7256 €/m² benchmark
	priceIsDebtFree: true,
	buildYear: 1985
};

describe('evaluate - apartment (backward compatibility)', () => {
	it('computes delta when benchmark is available', () => {
		const r = evaluate(baseApartment);
		expect(r.benchmarkEurM2).toBe(7256);
		expect(r.listingEurM2).toBe(7256);
		expect(r.deltaPct).toBe(0);
	});

	it('sets confidence based on transaction count', () => {
		const r = evaluate(baseApartment);
		expect(r.confidence).toBe('korkea'); // 151 transactions >= 100
		expect(r.transactions4q).toBe(151);
	});

	it('returns ei saatavilla when no benchmark', () => {
		const r = evaluate({
			...baseApartment,
			postalCode: '99999'
		});
		expect(r.benchmarkEurM2).toBeNull();
		expect(r.deltaPct).toBeNull();
		expect(r.confidence).toBe('ei saatavilla');
	});

	it('requires roomsType for apartment evaluation', () => {
		const r = evaluate({
			...baseApartment,
			roomsType: undefined as unknown as any
		});
		expect(r.confidence).toBe('ei saatavilla');
		expect(r.flags[0]).toContain('Huonetyyppi puuttuu');
	});
});

describe('evaluateProperty - property class routing', () => {
	it('routes kerrostalo to room-type cell lookup', () => {
		const r = evaluateProperty({
			...baseApartment,
			propertyClass: 'kerrostalo'
		});
		expect(r.benchmarkEurM2).toBe(7256);
		expect(r.confidence).toBe('korkea');
	});

	it('routes rivitalo to room-type cell lookup', () => {
		const r = evaluateProperty({
			...baseApartment,
			propertyClass: 'rivitalo'
		});
		expect(r.benchmarkEurM2).toBe(7256);
		expect(r.confidence).toBe('korkea');
	});

	it('defaults to kerrostalo when propertyClass omitted', () => {
		const r = evaluateProperty({
			...baseApartment,
			propertyClass: undefined
		});
		expect(r.benchmarkEurM2).toBe(7256);
		expect(r.confidence).toBe('korkea');
	});

	it('handles omakotitalo with regional fallback (Stage 2)', () => {
		const r = evaluateProperty({
			...baseApartment,
			propertyClass: 'omakotitalo'
		});
		expect(r.benchmarkEurM2).toBe(4200); // pks region benchmark
		expect(r.confidence).toBe('kohtalainen'); // always downgraded for houses
		expect(r.flags[0]).toContain('Omakotitalon €/m² on karkea seula');
		expect(r.flags.length).toBe(1); // Only the one flag for house caveat
	});

	it('handles paritalo with regional fallback (Stage 2)', () => {
		const r = evaluateProperty({
			...baseApartment,
			propertyClass: 'paritalo'
		});
		expect(r.benchmarkEurM2).toBe(4200); // pks region benchmark
		expect(r.confidence).toBe('kohtalainen'); // always downgraded for houses
		expect(r.flags[0]).toContain('Omakotitalon €/m² on karkea seula');
	});

	it('handles unknown property type', () => {
		const r = evaluateProperty({
			...baseApartment,
			propertyClass: 'muu' as any
		});
		expect(r.benchmarkEurM2).toBeNull();
		expect(r.confidence).toBe('ei saatavilla');
		expect(r.flags[0]).toContain('Tuntematon kohdetyyppi');
	});

	it('rejects apartment routing without roomsType', () => {
		const r = evaluateProperty({
			postalCode: '00100',
			livingAreaM2: 50,
			priceEur: 362800,
			priceIsDebtFree: true,
			propertyClass: 'kerrostalo'
		});
		expect(r.benchmarkEurM2).toBeNull();
		expect(r.confidence).toBe('ei saatavilla');
		expect(r.flags[0]).toContain('Huonetyyppi puuttuu');
	});
});

describe('parseFacts - backward compatibility', () => {
	it('parses valid apartment facts', () => {
		const params = new URLSearchParams({
			pc: '00100',
			rt: 'kaksio',
			m2: '50',
			price: '362800',
			debtfree: '1',
			yr: '1985'
		});
		const result = parseFacts(params);
		expect(result).not.toHaveProperty('error');
		expect(result.postalCode).toBe('00100');
		expect(result.roomsType).toBe('kaksio');
	});

	it('validates postal code format', () => {
		const params = new URLSearchParams({
			pc: '12345',
			rt: 'kaksio',
			m2: '50',
			price: '362800'
		});
		const result = parseFacts(params);
		expect(result).not.toHaveProperty('error');
	});

	it('rejects invalid postal code', () => {
		const params = new URLSearchParams({
			pc: '1234',
			rt: 'kaksio',
			m2: '50',
			price: '362800'
		});
		const result = parseFacts(params);
		expect(result).toHaveProperty('error');
	});
});
