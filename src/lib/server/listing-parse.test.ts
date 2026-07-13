import { describe, it, expect } from 'vitest';
import { parseListingText, parseListingHtml, htmlToText } from './listing-parse';

describe('parseListingText - apartment (kerrostalo) fixture', () => {
	const apartmentText = `
Sijainti
Malminkatu 40 A, 00100 Helsinki

Perustiedot
Asuinpinta-ala
50 m²

Huoneiston kokoonpano
2h

Kunto
Hyvä

Rakennusvuosi
1985

Kerros
3

Hissi
Kyllä

Asumistyyppi
Kerrostalo

Tontin omistus
Oma

Energialuokka
C

Hinta
Myyntihinta
250 000 €

Velaton hinta
250 000 €

Vastikkeet
Yhtiövastike yhteensä
150 €/kk

Tehdyt remontit
2015 putkiremontti
2018 ikkunaremontti

Tulevat remontit
2026 julkisivuremontti
	`;

	it('extracts address, postal code, and area', () => {
		const result = parseListingText(apartmentText);
		expect(result.address).toBe('Malminkatu 40 A');
		expect(result.postalCode).toBe('00100');
		expect(result.livingAreaM2).toBe(50);
	});

	it('detects room type as kaksio', () => {
		const result = parseListingText(apartmentText);
		expect(result.roomsType).toBe('kaksio');
	});

	it('extracts build year and condition', () => {
		const result = parseListingText(apartmentText);
		expect(result.buildYear).toBe(1985);
		expect(result.condition).toBe('Hyvä');
	});

	it('detects propertyClass as kerrostalo', () => {
		const result = parseListingText(apartmentText);
		expect(result.propertyClass).toBe('kerrostalo');
	});

	it('extracts energy class', () => {
		const result = parseListingText(apartmentText);
		expect(result.energyClass).toBe('C');
	});

	it('extracts prices and charges', () => {
		const result = parseListingText(apartmentText);
		expect(result.askingPriceEur).toBe(250000);
		expect(result.debtFreePriceEur).toBe(250000);
		expect(result.totalChargeEurMo).toBe(150);
	});

	it('parses renovations (done and upcoming)', () => {
		const result = parseListingText(apartmentText);
		expect(result.renovationsDone).toHaveLength(2);
		expect(result.renovationsDone[0]).toEqual({ year: 2015, text: 'putkiremontti' });
		expect(result.renovationsUpcoming).toHaveLength(1);
		expect(result.renovationsUpcoming[0].year).toBe(2026);
	});
});

describe('parseListingText - detached house (omakotitalo) fixture', () => {
	const houseText = `
Sijainti
Kuusitie 5, 02100 Espoo

Perustiedot
Asuinpinta-ala
120 m²

Rakennusvuosi
1975

Kohde on
Omakotitalo

Rakennuksen tyyppi
Omakotitalo

Kunto
Tyydyttävä

Energialuokka
D

Tontin pinta-ala
1 500 m²

Tontin omistus
Oma

Hinta
Myyntihinta
450 000 €

Velaton hinta
450 000 €

Tulevat remontit
2026 putkiremontti
2027 kattoremontti
	`;

	it('detects propertyClass as omakotitalo', () => {
		const result = parseListingText(houseText);
		expect(result.propertyClass).toBe('omakotitalo');
	});

	it('extracts plot area', () => {
		const result = parseListingText(houseText);
		expect(result.tonttiAreaM2).toBe(1500);
	});

	it('extracts house-specific fields', () => {
		const result = parseListingText(houseText);
		expect(result.livingAreaM2).toBe(120);
		expect(result.buildYear).toBe(1975);
		expect(result.condition).toBe('Tyydyttävä');
		expect(result.landOwnership).toBe('Oma');
		expect(result.energyClass).toBe('D');
	});

	it('has no roomsType for houses', () => {
		const result = parseListingText(houseText);
		expect(result.roomsType).toBeNull();
	});
});

describe('parseListingText - row house (rivitalo) fixture', () => {
	const rowHouseText = `
Sijainti
Mansikkatie 12 B, 00200 Helsinki

Perustiedot
Asuinpinta-ala
75 m²

Huoneiston kokoonpano
3h

Kunto
Erinomainen

Rakennusvuosi
2005

Asumistyyppi
Rivitalo

Energialuokka
B

Tontin pinta-ala
200 m²

Hinta
Myyntihinta
320 000 €

Velaton hinta
320 000 €

Vastikkeet
Yhtiövastike yhteensä
120 €/kk
	`;

	it('detects propertyClass as rivitalo', () => {
		const result = parseListingText(rowHouseText);
		expect(result.propertyClass).toBe('rivitalo');
	});

	it('extracts roomsType and plot area for row house', () => {
		const result = parseListingText(rowHouseText);
		expect(result.roomsType).toBe('kolmio+');
		expect(result.tonttiAreaM2).toBe(200);
	});
});

describe('parseListingHtml - JSON-LD extraction path', () => {
	const jsonLdHtml = `
<!DOCTYPE html>
<html>
<head>
	<script type="application/ld+json">
	{
		"@type": "Thing",
		"name": "Malminkatu 40 A",
		"price": "250000",
		"floorSize": "50"
	}
	</script>
</head>
<body>
Sijainti
Malminkatu 40 A, 00100 Helsinki

Perustiedot
Asuinpinta-ala
50 m²

Huoneiston kokoonpano
2h

Asumistyyppi
Kerrostalo

Energialuokka
E
</body>
</html>
	`;

	it('merges JSON-LD data with text parsing', () => {
		const result = parseListingHtml(jsonLdHtml);
		// JSON-LD should provide price and area
		expect(result.askingPriceEur).toBe(250000);
		expect(result.livingAreaM2).toBe(50);
		// Text parsing should provide postal code and property class
		expect(result.postalCode).toBe('00100');
		expect(result.propertyClass).toBe('kerrostalo');
	});
});

describe('parseListingHtml - __NEXT_DATA__ extraction path', () => {
	const nextDataHtml = `
<!DOCTYPE html>
<html>
<head>
	<script id="__NEXT_DATA__" type="application/json">
	{
		"props": {
			"pageProps": {
				"listing": {
					"address": "Kuusitie 5",
					"postalCode": "02100",
					"price": "450000",
					"livingArea": "120",
					"buildYear": "1975",
					"rooms": "4"
				}
			}
		}
	}
	</script>
</head>
<body>
Sijainti
Kuusitie 5, 02100 Espoo

Perustiedot
Asuinpinta-ala
120 m²

Rakennusvuosi
1975

Kohde on
Omakotitalo

Tontin pinta-ala
1 500 m²

Energialuokka
D
</body>
</html>
	`;

	it('extracts and merges __NEXT_DATA__', () => {
		const result = parseListingHtml(nextDataHtml);
		// __NEXT_DATA__ should provide these
		expect(result.askingPriceEur).toBe(450000);
		expect(result.livingAreaM2).toBe(120);
		expect(result.buildYear).toBe(1975);
		expect(result.roomsType).toBe('kolmio+');
		// Text parsing should provide property class and plot
		expect(result.propertyClass).toBe('omakotitalo');
		expect(result.tonttiAreaM2).toBe(1500);
	});
});

describe('parseListingHtml - fallback to text when no JSON', () => {
	const plainHtml = `
<!DOCTYPE html>
<html>
<body>
Sijainti
Malminkatu 40 A, 00100 Helsinki

Asuinpinta-ala
50 m²

Huoneiston kokoonpano
2h

Asumistyyppi
Kerrostalo

Myyntihinta
250 000 €
</body>
</html>
	`;

	it('falls back to text parsing when JSON is absent', () => {
		const result = parseListingHtml(plainHtml);
		expect(result.address).toBe('Malminkatu 40 A');
		expect(result.postalCode).toBe('00100');
		expect(result.propertyClass).toBe('kerrostalo');
	});
});

describe('htmlToText - robustness', () => {
	it('removes script and style tags', () => {
		const html = `
<html>
<script>alert('xss')</script>
<style>body { color: red; }</style>
<body>Text</body>
</html>
		`;
		const text = htmlToText(html);
		expect(text).not.toContain('alert');
		expect(text).not.toContain('color: red');
		expect(text).toContain('Text');
	});

	it('converts HTML entities', () => {
		const html = `<p>Price: 250&nbsp;000&nbsp;&euro;</p>`;
		const text = htmlToText(html);
		expect(text).toContain('250 000 €');
	});

	it('normalizes whitespace', () => {
		const html = `<p>Text   with   spaces</p>`;
		const text = htmlToText(html);
		expect(text).toContain('Text with spaces');
	});
});

describe('Property class detection edge cases', () => {
	it('defaults to kerrostalo for unknown type if housingCompany is present', () => {
		const text = `
Taloyhtiön nimi
Malminkatu 40 Osakeyhtymä

Asuinpinta-ala
50 m²
		`;
		const result = parseListingText(text);
		expect(result.propertyClass).toBe('kerrostalo');
	});

	it('returns null propertyClass when no type hints present', () => {
		const text = `
Asuinpinta-ala
50 m²

Myyntihinta
200 000 €
		`;
		const result = parseListingText(text);
		expect(result.propertyClass).toBeNull();
	});

	it('prefers "omakotitalo" label over "Kohde on"', () => {
		const text = `
Rakennuksen tyyppi
Omakotitalo

Kohde on
Vapaa asunto

Asuinpinta-ala
100 m²
		`;
		const result = parseListingText(text);
		expect(result.propertyClass).toBe('omakotitalo');
	});
});

describe('Known parser traps - regression tests', () => {
	it('does not merge repeated numbers in area field', () => {
		// Rule 9: "54 54 m2" must not become 5454
		const text = `
Asuinpinta-ala
54 54 m²
		`;
		const result = parseListingText(text);
		expect(result.livingAreaM2).toBe(54); // Takes first number only
	});

	it('cuts page at CUTOFF_MARKERS', () => {
		const text = `
Asuinpinta-ala
50 m²

Myyntihinta
200 000 €

Alueen muut kohteet
This should be cut
Merkittävä tieto
300 000 €
		`;
		const result = parseListingText(text);
		expect(result.askingPriceEur).toBe(200000); // Should not see the 300k
	});

	it('parses kuntotutkimus lines (filtering happens in insights layer)', () => {
		// Rule 9: kuntotutkimus is not a completed reno, but parser extracts all;
		// filtering to exclude studies happens in deriveInsights()
		const text = `
Tehdyt remontit
2015 putkiston kuntotutkimus
2016 putkiremontti

Asuinpinta-ala
50 m²
		`;
		const result = parseListingText(text);
		expect(result.renovationsDone).toHaveLength(2);
		expect(result.renovationsDone[0].text).toContain('kuntotutkimus');
		expect(result.renovationsDone[1].text).toBe('putkiremontti');
	});

	it('takes only first line of scalar fields', () => {
		const text = `
Kunto
Hyvä
Tyydyttävä

Asuinpinta-ala
50 m²
		`;
		const result = parseListingText(text);
		expect(result.condition).toBe('Hyvä');
	});
});
