import { describe, it, expect } from 'vitest';
import { parseDocsText, deriveDocInsights } from './doc-parse';

// Realistic isännöitsijäntodistus paste with the known traps: a date before
// the € amount, per-m² and per-kk on the same line, a two-column tase line
// without € signs, doubled numbers, and study/plan decoys in the PTS.
const todistus = `
ISÄNNÖITSIJÄNTODISTUS
Asunto Oy Esimerkkikatu 12, Helsinki

Rakennusvuosi 1972
Huoneistojen lukumäärä 24
Energialuokka D

Tontti
Vuokrattu, vuokranantaja Helsingin kaupunki
Vuokra-aika päättyy 31.12.2038
Vuosivuokra 18 500,00 €

Vastikkeet
Hoitovastike 4,10 €/m²/kk 225,50 €/kk
Rahoitusvastike 310,00 €/kk

Lainaosuus 31.12.2025: 24 560,00 €
Lainat rahoituslaitoksilta 1 250 000,00 1 380 000,00

Yhtiöjärjestyksessä ei ole lunastuslauseketta

Suoritetut huomattavat korjaus- ja muutostyöt
1998 ikkunoiden uusiminen
2011 putkistojen kuntotutkimus
2015 julkisivujen paikkaus ja huoltomaalaus

Kunnossapitotarveselvitys 2026-2030
2027 julkisivujen kuntotutkimus
Putkiremontti 2028 (hankesuunnittelu)
Vesikaton uusiminen 2029.
`;

describe('parseDocsText — isännöitsijäntodistus fixture', () => {
	const d = parseDocsText(todistus);

	it('reads vastikkeet from a combined per-m² + per-kk line', () => {
		expect(d.hoitovastikeEurMo).toBe(225.5);
		expect(d.hoitovastikeEurM2Mo).toBe(4.1);
		expect(d.rahoitusvastikeEurMo).toBe(310);
	});

	it('never reads a date as the lainaosuus amount', () => {
		expect(d.lainaosuusEur).toBe(24560);
	});

	it('takes the current-year column from a two-column tase line', () => {
		expect(d.yhtioLainatEur).toBe(1250000);
	});

	it('reads negated lunastuslauseke as false', () => {
		expect(d.lunastuslauseke).toBe(false);
	});

	it('extracts leased-land facts', () => {
		expect(d.landOwnership).toBe('vuokra');
		expect(d.landLeaseEndYear).toBe(2038);
		expect(d.landRentEurYr).toBe(18500);
	});

	it('extracts building facts', () => {
		expect(d.buildYear).toBe(1972);
		expect(d.apartmentCount).toBe(24);
	});

	it('scopes renovations to their sections, both year positions', () => {
		expect(d.renovationsDone.map((r) => r.year)).toEqual([1998, 2011, 2015]);
		expect(d.renovationsUpcoming.map((r) => r.year).sort()).toEqual([2027, 2028, 2029]);
		expect(d.renovationsUpcoming.find((r) => r.year === 2028)?.text).toMatch(/putkiremontti/i);
	});

	it('counts fields', () => {
		expect(d.fieldsFound).toBeGreaterThanOrEqual(10);
	});
});

describe('deriveDocInsights — fixture facts', () => {
	const d = parseDocsText(todistus);
	// fi-FI grouping uses a non-breaking space; normalize for assertions.
	const insights = deriveDocInsights(d, { livingAreaM2: 55, priceEur: 189000, buildYear: 1972 })
		.map((s) => s.replace(/[  ]/g, ' '));

	it('reports lainaosuus with per-m² and price share', () => {
		const line = insights.find((s) => s.startsWith('Huoneistokohtainen lainaosuus'));
		expect(line).toContain('24 560 €');
		expect(line).toContain('447 €/m²');
		expect(line).toContain('13 % kohteen hinnasta');
	});

	it('does not read studies or upkeep as major renovations', () => {
		// 2011 kuntotutkimus and 2015 paikkaus/huoltomaalaus are decoys; the
		// only done major is the 1998 ikkunaremontti.
		const done = insights.find((s) => s.startsWith('Asiakirjojen korjaushistoria'));
		expect(done).toContain('ikkunaremontti 1998');
		expect(done).not.toContain('putkiremontti');
		expect(done).not.toContain('julkisivu');
	});

	it('flags PTS majors but not the 2027 kuntotutkimus decoy', () => {
		const pts = insights.find((s) => s.startsWith('Kunnossapitotarveselvityksessä'));
		expect(pts).toContain('putkiremontti (2028)');
		expect(pts).toContain('kattoremontti (2029)');
		expect(pts).not.toContain('julkisivuremontti');
	});

	it('does not warn about a missing putkiremontti when the PTS has one', () => {
		expect(insights.find((s) => s.includes('Putkiremonttia ei näy'))).toBeUndefined();
	});

	it('warns about the leased land with rent and end year', () => {
		const t = insights.find((s) => s.startsWith('Tontti on vuokrattu'));
		expect(t).toContain('18 500 €');
		expect(t).toContain('päättyy 2038');
	});
});

describe('parseDocsText — hostile pastes', () => {
	it('returns fieldsFound 0 on unrelated text', () => {
		expect(parseDocsText('Tervetuloa uutiskirjeeseemme! Lue lisää verkossa.').fieldsFound).toBe(0);
	});

	it('does not merge doubled numbers', () => {
		const d = parseDocsText('Huoneistojen lukumäärä 24 24');
		expect(d.apartmentCount).toBe(24);
	});

	it('reads a label with the value on the next line (PDF column paste)', () => {
		const d = parseDocsText('Hoitovastike\n245,00 €/kk');
		expect(d.hoitovastikeEurMo).toBe(245);
	});

	it('reads positive lunastuslauseke', () => {
		expect(parseDocsText('Yhtiöjärjestyksessä on lunastuslauseke.').lunastuslauseke).toBe(true);
	});

	it('handles dot-grouped amounts', () => {
		const d = parseDocsText('Lainaosuus 24.560,00 €');
		expect(d.lainaosuusEur).toBe(24560);
	});
});
