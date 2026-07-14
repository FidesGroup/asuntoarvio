/**
 * Tiered valuation resolver: T1 postal → T2 town → T3 region → T4 condition estimate.
 * Stops at first tier with sufficient recent evidence; tier used becomes confidence label.
 * T4 outputs a range (low–high) + labeled "paras arvio" midpoint with assumption flags.
 * All multipliers are deterministic constants with clear documentation (rule 5, rule 4).
 */
import type { ExtractedListing } from './listing-parse';
import { evaluate, evaluateProperty, lookupCell, lookupHouseCell } from './benchmark';

export type ConditionBand = 'uusi' | 'erinomainen' | 'hyvä' | 'tyydyttävä' | 'välttävä' | 'huono';

// Deterministic multiplier bands for property condition
export const KUNTO_BANDS: Record<ConditionBand, number> = {
	uusi: 1.15,         // +15% for new
	erinomainen: 1.08,  // +8% for excellent
	hyvä: 1.0,          // baseline
	tyydyttävä: 0.92,   // -8% for fair
	välttävä: 0.82,     // -18% for poor
	huono: 0.70         // -30% for bad
};

// Build year effects (adjustment vs typical for region)
const TYPICAL_BUILD_YEAR = 1975;
const AGE_PREMIUM_PER_DECADE = 0.05; // +5% per decade newer than 1975

// Major renovation credit (+cost to buyer, but improves value)
const MAJOR_RENO_CREDIT_EUR_M2: Record<string, number> = {
	putkiremontti: 300,      // Pipes: +€300/m² normalized value
	kattoremontti: 250,      // Roof: +€250/m²
	julkisivuremontti: 200,  // Facade: +€200/m²
	ikkunaremontti: 150,     // Windows: +€150/m²
	sähköremontti: 100,      // Electrical: +€100/m²
	hissiremontti: 120       // Elevator: +€120/m²
};

// Major renovation liability (pending, costs buyer ~this much)
const MAJOR_RENO_LIABILITY_PERCENT: Record<string, number> = {
	putkiremontti: 0.15,     // 15% of area value
	kattoremontti: 0.12,
	julkisivuremontti: 0.08,
	ikkunaremontti: 0.06
};

// Land ownership penalty (rented vs owned)
const RENTED_LAND_PENALTY_PERCENT = 0.12; // -12% for rented land

export interface ValuationTier {
	tier: 'T1' | 'T2' | 'T3' | 'T4';
	benchmarkEurM2: number | null;
	confidenceLabel: 'korkea' | 'kohtalainen' | 'matala' | 'suuntaa antava arvio';
	transactionsOrEvidence: number;
	estLowEurM2: number;
	estMidEurM2: number;
	estHighEurM2: number;
	assumptions: string[]; // Labels for what assumptions were used
}

/**
 * Map property condition string to condition band.
 * Tries to find a match in Finnish condition labels.
 */
export function detectConditionBand(conditionRaw: string | null): ConditionBand {
	if (!conditionRaw) return 'hyvä'; // default to fair
	const lower = conditionRaw.toLowerCase();
	if (/uusi|new|ensiasunto/.test(lower)) return 'uusi';
	if (/erinomainen|erittäin hyvä|excellent|excellent condition/.test(lower)) return 'erinomainen';
	if (/hyvä|good|kunnossa/.test(lower)) return 'hyvä';
	if (/tyydyttävä|acceptable|kohtuullinen/.test(lower)) return 'tyydyttävä';
	if (/välttävä|poor|huomattavan huono/.test(lower)) return 'välttävä';
	if (/huono|bad|very poor|rikkoutuneet/.test(lower)) return 'huono';
	return 'hyvä';
}

/**
 * Compute age-based premium (newer = more valuable, up to a point).
 * +5% per decade newer than 1975; caps at +15% (very new).
 */
export function computeAgePremium(buildYear: number | null): number {
	if (!buildYear) return 0;
	const decadesNewer = (buildYear - TYPICAL_BUILD_YEAR) / 10;
	return Math.min(0.15, Math.max(-0.20, decadesNewer * AGE_PREMIUM_PER_DECADE));
}

/**
 * T4: Condition-based estimate. Anchors on coarsest-available area price,
 * applies multipliers for condition + age + renovations + land, outputs range.
 */
export function buildConditionEstimate(
	anchorEurM2: number,
	livingAreaM2: number,
	condition: ConditionBand,
	buildYear: number | null,
	renovationsDone: Array<{ year: number; text: string }>,
	renovationsUpcoming: Array<{ year: number; text: string }>,
	landOwnership: string | null
): ValuationTier {
	const assumptions: string[] = [
		`Kunto: ${condition}`,
		`Rakennusvuosi: ${buildYear ?? 'tuntematon'}`
	];

	// Start with condition band multiplier
	let multiplier = KUNTO_BANDS[condition];

	// Apply age premium
	const agePremium = computeAgePremium(buildYear);
	multiplier *= (1 + agePremium);
	if (agePremium > 0.01) assumptions.push(`Ikälisä: +${(agePremium * 100).toFixed(0)}%`);
	else if (agePremium < -0.01) assumptions.push(`Ikävähennys: ${(agePremium * 100).toFixed(0)}%`);

	// Apply renovation credits (completed major renos add value)
	let renovationCredit = 0;
	for (const reno of renovationsDone) {
		const credit = MAJOR_RENO_CREDIT_EUR_M2[reno.text];
		if (credit) {
			renovationCredit += credit;
			assumptions.push(`Remontti (${reno.year}): +${credit} €/m²`);
		}
	}

	// Apply renovation liability (upcoming major renos subtract expected cost)
	let renovationLiability = 0;
	for (const reno of renovationsUpcoming) {
		const liability = MAJOR_RENO_LIABILITY_PERCENT[reno.text];
		if (liability) {
			renovationLiability += liability;
			assumptions.push(`Tuleva remontti: -${(liability * 100).toFixed(0)}%`);
		}
	}

	// Apply land ownership penalty (rented land is a negative)
	let landPenalty = 0;
	if (landOwnership && /vuokra|valinnainen/i.test(landOwnership)) {
		landPenalty = RENTED_LAND_PENALTY_PERCENT;
		assumptions.push('Vuokratontti: -12%');
	}

	// Calculate midpoint estimate
	const midEstimateEurM2 = Math.round(
		anchorEurM2 * multiplier +
		renovationCredit -
		anchorEurM2 * renovationLiability -
		anchorEurM2 * landPenalty
	);

	// Calculate range (±10% around midpoint for condition uncertainty)
	const rangePercent = 0.10;
	const lowEurM2 = Math.round(midEstimateEurM2 * (1 - rangePercent));
	const highEurM2 = Math.round(midEstimateEurM2 * (1 + rangePercent));

	return {
		tier: 'T4',
		benchmarkEurM2: null, // No actual comparable
		confidenceLabel: 'suuntaa antava arvio',
		transactionsOrEvidence: 0,
		estLowEurM2: lowEurM2,
		estMidEurM2: midEstimateEurM2,
		estHighEurM2: highEurM2,
		assumptions
	};
}

/**
 * Map postal code to house region.
 * Uses POSTAL_TO_HOUSE_REGION from benchmark.ts as source of truth.
 */
function getHouseRegionFromPostal(postalCode: string | null): string {
	if (!postalCode) return 'SSS'; // fallback to whole country
	// For simplicity, use first 3 chars as proxy (e.g., '001' -> 'pks' if available)
	// This would be replaced with a full postal->region table in production
	// For now, hardcode known regions
	if (/^001|^002|^(00[2-3])/i.test(postalCode)) return 'pks'; // Helsinki/Espoo/Vantaa
	return 'SSS'; // default to whole country
}

/**
 * Tiered resolver: tries T1→T4 in order, returns first tier with evidence.
 * For apartments: T1=postal (room-type cell), T2=town (if implemented), T3=region, T4=estimate.
 * For houses: T1=postal (not applicable), T2=region (15hw.px), T3=country (SSS), T4=estimate.
 */
export function resolveValuation(listing: ExtractedListing): ValuationTier {
	// Only applies to apartments for now; houses skip to region
	const isHouse = listing.propertyClass === 'omakotitalo' || listing.propertyClass === 'paritalo';

	// For apartments: try postal (T1)
	if (!isHouse && listing.roomsType && listing.postalCode) {
		const cell = lookupCell(listing.postalCode, listing.roomsType);
		if (cell && cell.benchmark_eur_m2 !== null && cell.n_4q >= 30) {
			return {
				tier: 'T1',
				benchmarkEurM2: cell.benchmark_eur_m2,
				confidenceLabel: cell.n_4q >= 100 ? 'korkea' : 'kohtalainen',
				transactionsOrEvidence: cell.n_4q,
				estLowEurM2: cell.benchmark_eur_m2,
				estMidEurM2: cell.benchmark_eur_m2,
				estHighEurM2: cell.benchmark_eur_m2,
				assumptions: [`Postinumeroaluevertailu (${cell.n_4q} kauppaa)`]
			};
		}
	}

	// T2: Town (not yet implemented, skip for now)

	// T3: Region
	if (isHouse) {
		// For houses, region is T2 (skip postal)
		const region = getHouseRegionFromPostal(listing.postalCode);
		const houseCell = lookupHouseCell(region);
		if (houseCell && houseCell.benchmark_eur_m2 !== null && houseCell.n_4q >= 20) {
			return {
				tier: 'T3',
				benchmarkEurM2: houseCell.benchmark_eur_m2,
				confidenceLabel: 'kohtalainen',
				transactionsOrEvidence: houseCell.n_4q,
				estLowEurM2: houseCell.benchmark_eur_m2,
				estMidEurM2: houseCell.benchmark_eur_m2,
				estHighEurM2: houseCell.benchmark_eur_m2,
				assumptions: [`Aluevertailu (${houseCell.n_4q} kauppaa)`]
			};
		}
	}

	// T4: Condition estimate (fallback)
	const anchorEurM2 = listing.propertyClass?.includes('talo')
		? lookupHouseCell('SSS')?.benchmark_eur_m2 ?? 3450
		: 7000; // fallback apartment anchor
	const condition = detectConditionBand(listing.condition);

	return buildConditionEstimate(
		anchorEurM2,
		listing.livingAreaM2 ?? 50,
		condition,
		listing.buildYear,
		listing.renovationsDone,
		listing.renovationsUpcoming,
		listing.landOwnership
	);
}
