/**
 * Deterministic parser for buyer-pasted taloyhtiö documents: the text of an
 * isännöitsijäntodistus, tilinpäätös/tase or kunnossapitotarveselvitys (PTS).
 * No LLM in the request path (CLAUDE.md rule 5): everything here is regex over
 * labelled Finnish document lines. Privacy lane (rule 3): the pasted text is
 * parsed and discarded — only the structured figures below are stored on the
 * report. Never extract names, apartment identifiers or free prose.
 */
import { MAJOR_RENOVATIONS, STUDY_RE, minorOnly } from './listing-parse';

export interface DocItem {
	year: number;
	text: string;
}

export interface ExtractedDocs {
	hoitovastikeEurMo: number | null;
	hoitovastikeEurM2Mo: number | null;
	rahoitusvastikeEurMo: number | null;
	/** Huoneistokohtainen osuus yhtiön lainoista. */
	lainaosuusEur: number | null;
	/** Yhtiön lainat yhteensä (tase: "Lainat rahoituslaitoksilta"). */
	yhtioLainatEur: number | null;
	hoitokulutEurYr: number | null;
	lunastuslauseke: boolean | null;
	landOwnership: 'oma' | 'vuokra' | null;
	landLeaseEndYear: number | null;
	landRentEurYr: number | null;
	apartmentCount: number | null;
	buildYear: number | null;
	renovationsDone: DocItem[];
	renovationsUpcoming: DocItem[];
	/** How many of the above carried data — 0 means the paste was unusable. */
	fieldsFound: number;
}

/**
 * Finnish document amount: "24 560,00" / "24.560,00" / "245,50" / "245".
 * Spaces and dots group thousands; the decimal separator is a comma.
 */
function fiNumber(raw: string): number | null {
	let s = raw.replace(/[\s  ]/g, '');
	s = s.replace(/\.(?=\d{3}(\D|$))/g, '');
	s = s.replace(',', '.');
	const n = Number(s);
	return Number.isFinite(n) ? n : null;
}

const AMOUNT = String.raw`(-?\d[\d\s  .,]*)`;

/**
 * First euro amount on the line. Anchored to the € sign so dates
 * ("Lainaosuus 31.12.2025: 24 560,00 €") can never be read as the amount.
 */
function moneyEur(line: string): number | null {
	const m = line.match(new RegExp(`${AMOUNT}\\s*€`));
	return m ? fiNumber(m[1]) : null;
}

/** Amount attached to "€/kk" — skips the "€/m²/kk" figure on the same line. */
function eurPerMo(line: string): number | null {
	const m = line.match(new RegExp(`${AMOUNT}\\s*€\\s*/\\s*kk`));
	return m ? fiNumber(m[1]) : null;
}

function eurPerM2Mo(line: string): number | null {
	const m = line.match(new RegExp(`${AMOUNT}\\s*€\\s*/\\s*m[²2]\\s*/\\s*kk`));
	return m ? fiNumber(m[1]) : null;
}

/**
 * Bare balance-sheet amount for lines that carry no € sign
 * ("Lainat rahoituslaitoksilta 1 250 000,00  1 380 000,00"). Dates are
 * stripped first; of the remaining amounts the FIRST is taken (current
 * fiscal year — the comparison year prints second). Grouped-number semantics
 * follow listing-parse: a doubled "54 54" must not merge.
 */
function firstAmount(line: string): number | null {
	const cleaned = line.replace(/\b\d{1,2}\.\d{1,2}\.\d{4}\b/g, ' ');
	const m = cleaned.match(/-?\d+(?:[\s  ]\d{3})*(?:,\d+)?(?!\d)/);
	return m ? fiNumber(m[0]) : null;
}

/**
 * First line matching the label. PDF pastes often split label and value onto
 * consecutive lines, so when the label line carries no digit the next line is
 * appended. Scalar fields never read further than that (listing-parse rule:
 * a missing terminator must not swallow the page).
 */
function findLine(lines: string[], re: RegExp): string | null {
	for (let i = 0; i < lines.length; i++) {
		if (re.test(lines[i])) {
			let t = lines[i];
			if (!/\d/.test(t) && i + 1 < lines.length) t = `${t} ${lines[i + 1]}`;
			return t.slice(0, 240);
		}
	}
	return null;
}

const YEAR_RE = /(18|19|20)\d{2}/;

function parseDocRenovationLine(line: string): DocItem | null {
	// "2015 putkiremontti", "2026–2028: julkisivujen korjaus"
	let m = line.match(/^\s*(\d{4})(?:\s*[-–]\s*\d{2,4})?\s*[:;.]?\s+(.*\S)/);
	if (m) {
		const year = Number(m[1]);
		if (year >= 1900 && year < 2060) return { year, text: m[2].trim().slice(0, 160) };
	}
	// "Putkiremontti 2028 (hankesuunnittelu)" — trailing year, optional note
	m = line.match(/^(.*[a-zäöå].*?)[\s(]+((?:19|20)\d{2})\)?[.,]?(?:\s*\(.*\))?$/i);
	if (m && m[1].trim().length >= 4) {
		return { year: Number(m[2]), text: m[1].trim().slice(0, 160) };
	}
	return null;
}

const UPCOMING_HEADERS =
	/kunnossapitotarveselvitys|kunnossapitotarpe|kunnossapitoselvitys|\bpts\b|tulevat\s+(korjaukset|remontit)|päätetyt\s+(korjaukset|remontit)|hallituksen\s+selvitys/i;
const DONE_HEADERS =
	/(suoritetut|tehdyt|toteutetut|aikaisemmat|aiemmat)\s+(huomattavat\s+)?(korjaukset|korjaus|remontit)|korjaushistoria/i;

/** Labels that terminate a renovation section (the document moved on). */
const SECTION_STOPS =
	/^(vastikkeet|vastike|talous|hinta|lainat|lainaosuu|tontti|rakennus|energia|isännöi|vakuutu|hoitovastike|rahoitusvastike|pääomavastike|yhtiövastike|huoneistojen lukumäärä|osakkeiden lukumäärä|osakesarjat|autopaikat|tilinpäätös|talousarvio)/i;

export function parseDocsText(text: string): ExtractedDocs {
	const lines = text
		.slice(0, 300_000)
		.split(/\r?\n/)
		.map((l) => l.replace(/[  \t]/g, ' ').replace(/ {2,}/g, ' ').trim())
		.filter((l) => l.length > 0)
		.slice(0, 4000);

	// --- vastikkeet ---
	const hoitoLine =
		findLine(lines, /^hoitovastike/i) ?? findLine(lines, /^yhtiövastike(?!.*yhteensä)/i);
	const hoitovastikeEurMo = hoitoLine ? (eurPerMo(hoitoLine) ?? moneyEur(hoitoLine)) : null;
	const hoitovastikeEurM2Mo = hoitoLine ? eurPerM2Mo(hoitoLine) : null;

	const rahoitusLine = findLine(lines, /^(rahoitusvastike|pääomavastike)/i);
	const rahoitusvastikeEurMo = rahoitusLine
		? (eurPerMo(rahoitusLine) ?? moneyEur(rahoitusLine))
		: null;

	// --- lainat ---
	const lainaosuusLine = findLine(lines, /laina\s?osuus|osuus\s+yhtiön\s+lainoista|velkaosuus/i);
	const lainaosuusEur = lainaosuusLine ? moneyEur(lainaosuusLine) : null;

	const yhtioLainatLine = findLine(
		lines,
		/lainat\s+rahoituslaitoksilta|rahalaitoslainat|yhtiön\s+lainat|pitkäaikaiset\s+lainat|jäljellä\s+oleva\s+lainapääoma/i
	);
	const yhtioLainatEur = yhtioLainatLine
		? (moneyEur(yhtioLainatLine) ?? firstAmount(yhtioLainatLine))
		: null;

	const hoitokulutLine = findLine(lines, /hoitokulut\s+yhteensä|kiinteistön\s+hoitokulut/i);
	const hoitokulutEurYr = hoitokulutLine
		? (moneyEur(hoitokulutLine) ?? firstAmount(hoitokulutLine))
		: null;

	// --- yhtiöjärjestys / tontti ---
	const lunastusLine = findLine(lines, /lunastus(lauseke|pykälä|oikeus)/i);
	const lunastuslauseke = lunastusLine === null ? null : !/\bei\b/i.test(lunastusLine);

	const tonttiLine = findLine(lines, /tontin\s+(omistus|hallinta|omistusmuoto)|^tontti\b/i);
	const landOwnership =
		tonttiLine === null ? null
		: /vuokra/i.test(tonttiLine) ? 'vuokra'
		: /\boma\b/i.test(tonttiLine) ? 'oma'
		: null;

	const leaseLine = findLine(lines, /vuokra-?aika\s+päättyy|vuokrasopimus\s+(päättyy|on\s+voimassa)/i);
	const leaseYear = leaseLine?.match(/(\d{4})(?!.*\d{4})/);
	const landLeaseEndYear = leaseYear ? Number(leaseYear[1]) : null;

	const landRentLine = findLine(lines, /vuosivuokra|tontin\s+vuokra\b/i);
	const landRentEurYr = landRentLine ? moneyEur(landRentLine) : null;

	// --- rakennus ---
	const countLine = findLine(
		lines,
		/huoneistojen\s+lukumäärä|asuinhuoneistojen\s+lukumäärä|huoneistoja\s+yhteensä|asuinhuoneistoja\b/i
	);
	const countN = countLine ? firstAmount(countLine) : null;
	const apartmentCount = countN !== null && countN >= 1 && countN <= 2000 ? Math.round(countN) : null;

	const yearLine = findLine(lines, /rakennusvuosi|valmistumisvuosi|käyttöönotto/i);
	const yearM = yearLine?.match(YEAR_RE);
	const buildYear = yearM ? Number(yearM[0]) : null;

	// --- korjaukset: header-scoped year lines ---
	const renovationsDone: DocItem[] = [];
	const renovationsUpcoming: DocItem[] = [];
	let mode: 'done' | 'upcoming' | null = null;
	let modeLines = 0;
	for (const line of lines) {
		if (UPCOMING_HEADERS.test(line)) { mode = 'upcoming'; modeLines = 0; continue; }
		if (DONE_HEADERS.test(line)) { mode = 'done'; modeLines = 0; continue; }
		if (!mode) continue;
		if (SECTION_STOPS.test(line) || ++modeLines > 80) { mode = null; continue; }
		const item = parseDocRenovationLine(line);
		if (!item) continue;
		const target = mode === 'done' ? renovationsDone : renovationsUpcoming;
		if (target.length < 40) target.push(item);
	}

	const scalars = [
		hoitovastikeEurMo, hoitovastikeEurM2Mo, rahoitusvastikeEurMo, lainaosuusEur,
		yhtioLainatEur, hoitokulutEurYr, lunastuslauseke, landOwnership,
		landLeaseEndYear, landRentEurYr, apartmentCount, buildYear
	];
	const fieldsFound =
		scalars.filter((v) => v !== null).length +
		(renovationsDone.length ? 1 : 0) +
		(renovationsUpcoming.length ? 1 : 0);

	return {
		hoitovastikeEurMo, hoitovastikeEurM2Mo, rahoitusvastikeEurMo, lainaosuusEur,
		yhtioLainatEur, hoitokulutEurYr, lunastuslauseke, landOwnership,
		landLeaseEndYear, landRentEurYr, apartmentCount, buildYear,
		renovationsDone, renovationsUpcoming, fieldsFound
	};
}

export interface DocInsightContext {
	livingAreaM2: number | null;
	priceEur: number | null;
	buildYear: number | null;
}

const fmt = (n: number) => Math.round(n).toLocaleString('fi-FI');

/** Deterministic investor-readout lines from the extracted document facts. */
export function deriveDocInsights(d: ExtractedDocs, ctx: DocInsightContext): string[] {
	const out: string[] = [];
	const area = ctx.livingAreaM2;

	if (d.lainaosuusEur !== null && d.lainaosuusEur > 0) {
		const perM2 = area ? ` (${fmt(d.lainaosuusEur / area)} €/m²)` : '';
		const share = ctx.priceEur ? d.lainaosuusEur / ctx.priceEur : null;
		const sharePart = share !== null ? `, noin ${Math.round(share * 100)} % kohteen hinnasta` : '';
		let line = `Huoneistokohtainen lainaosuus ${fmt(d.lainaosuusEur)} €${perM2}${sharePart}.`;
		if (share !== null && share > 0.25) {
			line +=
				' Yhtiölainaosuus on iso — rahoitusvastike nousee korkojen mukana ja kun lyhennysvapaa loppuu.';
		}
		out.push(line);
	} else if (d.rahoitusvastikeEurMo !== null && d.rahoitusvastikeEurMo > 0) {
		out.push(
			`Rahoitusvastiketta peritään ${fmt(d.rahoitusvastikeEurMo)} €/kk, mutta huoneiston lainaosuus ei löytynyt asiakirjoista. Kysy se isännöitsijältä.`
		);
	}

	const hoitoPerM2 =
		d.hoitovastikeEurM2Mo ??
		(d.hoitovastikeEurMo !== null && area ? d.hoitovastikeEurMo / area : null);
	if (hoitoPerM2 !== null) {
		if (hoitoPerM2 > 7) {
			out.push(
				`Hoitovastike ${hoitoPerM2.toFixed(1)} €/m²/kk on korkeahko (tyypillisesti 4–6 €/m²/kk). Kannattaa selvittää syy tilinpäätöksestä.`
			);
		} else if (hoitoPerM2 < 3.5) {
			out.push(
				`Hoitovastike ${hoitoPerM2.toFixed(1)} €/m²/kk on matala. Varmista, ettei yhtiö kata hoitokuluja lainalla tai lykkää korjauksia — matala vastike ei aina ole pelkkä etu.`
			);
		}
	}

	if (d.lunastuslauseke === true) {
		out.push(
			'Yhtiöjärjestyksessä on lunastuslauseke: vanhat osakkaat voivat lunastaa kaupan itselleen. Tarkista lunastusajan pituus ennen kuin teet tarjouksen.'
		);
	}

	if (d.landOwnership === 'vuokra') {
		const rent = d.landRentEurYr !== null ? ` Vuosivuokra ${fmt(d.landRentEurYr)} €.` : '';
		const thisYear = new Date().getFullYear();
		const ending =
			d.landLeaseEndYear !== null && d.landLeaseEndYear <= thisYear + 15
				? ` Vuokrasopimus päättyy ${d.landLeaseEndYear}, ja uusi sopimus voi moninkertaistaa tontinvuokran.`
				: '';
		out.push(`Tontti on vuokrattu.${rent}${ending}`);
	}

	const majors = (items: DocItem[]) => {
		const m = new Map<string, number>();
		for (const r of items) {
			if (STUDY_RE.test(r.text) || minorOnly(r.text)) continue;
			const hit = MAJOR_RENOVATIONS.find(([re]) => re.test(r.text));
			if (hit && (!m.has(hit[1]) || r.year < m.get(hit[1])!)) m.set(hit[1], r.year);
		}
		return m;
	};
	const upcoming = majors(d.renovationsUpcoming);
	const done = majors(d.renovationsDone);
	if (upcoming.size) {
		out.push(
			`Kunnossapitotarveselvityksessä on isoja hankkeita: ${[...upcoming.entries()].map(([k, y]) => `${k} (${y})`).join(', ')}. Kysy niistä kustannusarviot, sillä ne eivät vielä näy lainaosuudessa.`
		);
	}
	if (done.size) {
		out.push(
			`Asiakirjoissa näkyvä korjaushistoria: ${[...done.entries()].map(([k, y]) => `${k} ${y}`).join(', ')}.`
		);
	}

	const by = d.buildYear ?? ctx.buildYear;
	if (by && by < new Date().getFullYear() - 40 && !done.has('putkiremontti') && !upcoming.has('putkiremontti')) {
		out.push(
			'Putkiremonttia ei näy korjaushistoriassa eikä kunnossapitotarveselvityksessä, vaikka talo on yli 40-vuotias. Kysy LVV-kuntotutkimuksen tulokset.'
		);
	}

	if (d.yhtioLainatEur !== null && d.yhtioLainatEur > 0 && d.apartmentCount) {
		out.push(
			`Yhtiön lainakanta ${fmt(d.yhtioLainatEur)} € (~${fmt(d.yhtioLainatEur / d.apartmentCount)} €/huoneisto).`
		);
	}

	return out;
}
