/**
 * Rent estimate engine: postal code + room type -> monthly rent estimate
 * (€/m²/kk) + confidence tier + flags. Used by /arvio and the landing form
 * prefill. Sourced from StatFin asvu table 13eb, CC BY 4.0.
 *
 * Honesty discipline (rule 4): every RentEstimate carries the source tier
 * ('postal' | 'town' | 'mk' | null) and a flag string list. Suppressed cells
 * fall through to the next tier; we never substitute a different number.
 */
import seed from './rents.seed.json';
import { postalToTown, postalToMk } from './postal-areas';
import type { RoomsType } from './benchmark';

export interface RentSeriesPoint {
	q: string;
	eur_m2: number | null;
	n: number | null;
}

export interface RentCell {
	benchmark_eur_m2_kk: number | null;
	n_4q: number;
	latest_quarter: string | null;
	series: RentSeriesPoint[];
}

export type RentTier = 'postal' | 'town' | 'mk' | null;

export interface RentEstimate {
	monthlyEurM2: number | null;
	monthlyRentEur: number | null;
	n4q: number;
	latestQuarter: string | null;
	tier: RentTier;
	flags: string[];
}

const TYPE_KEY: Record<RoomsType, string> = {
	'yksiö': 'yksiö',
	kaksio: 'kaksio',
	'kolmio+': 'kolmio+'
};

const cells = seed as Record<string, RentCell>;

function getCell(postalCode: string, roomsType: RoomsType): {
	cell: RentCell | null;
	tier: RentTier;
} {
	const key = `${postalCode}_${TYPE_KEY[roomsType]}`;
	const direct = cells[key];
	if (direct && direct.benchmark_eur_m2_kk !== null) {
		return { cell: direct, tier: 'postal' };
	}
	const town = postalToTown(postalCode);
	if (town) {
		const townKey = `${town}_${TYPE_KEY[roomsType]}`;
		const c = cells[townKey];
		if (c && c.benchmark_eur_m2_kk !== null) {
			return { cell: c, tier: 'town' };
		}
	}
	const mk = postalToMk(postalCode);
	if (mk) {
		const mkKey = `${mk}_${TYPE_KEY[roomsType]}`;
		const c = cells[mkKey];
		if (c && c.benchmark_eur_m2_kk !== null) {
			return { cell: c, tier: 'mk' };
		}
	}
	return { cell: null, tier: null };
}

/**
 * Estimate a monthly rent for a listing. Returns null monthlyRentEur when no
 * cell is available at any tier — the UI must then ask the user to type rent.
 *
 * `monthlyEurM2` is the per-m²-per-month benchmark from StatFin; multiply by
 * the listing's living area to get the suggested monthly rent.
 */
export function estimateRent(
	postalCode: string,
	roomsType: RoomsType,
	livingAreaM2: number
): RentEstimate {
	const flags: string[] = [];
	const { cell, tier } = getCell(postalCode, roomsType);

	if (!cell || cell.benchmark_eur_m2_kk === null || tier === null) {
		flags.push(
			'Tilastokeskus ei julkaise tälle postinumerolle ja huonetyypille vuokra-aineistoa. Syötä vuokra käsin.'
		);
		return {
			monthlyEurM2: null,
			monthlyRentEur: null,
			n4q: 0,
			latestQuarter: null,
			tier: null,
			flags
		};
	}

	if (tier === 'town') {
		flags.push(
			`Vuokra-arvio perustuu kunnan tasoon (${cell.benchmark_eur_m2_kk} €/m²/kk), koska postinumeroalueen aineisto on Tilastokeskuksessa salattu.`
		);
	} else if (tier === 'mk') {
		flags.push(
			`Vuokra-arvio perustuu maakunnan tasoon, koska tarkempaa aineistoa ei ole saatavilla.`
		);
	}

	if (cell.n_4q < 20) {
		flags.push(
			`Pieni otos (${cell.n_4q} havaintoa). Tilastokeskuksen salassapitoraja on 20 havaintoa.`
		);
	}

	const monthlyRentEur = Math.round(cell.benchmark_eur_m2_kk * livingAreaM2);
	return {
		monthlyEurM2: cell.benchmark_eur_m2_kk,
		monthlyRentEur,
		n4q: cell.n_4q,
		latestQuarter: cell.latest_quarter,
		tier,
		flags
	};
}

export function knownRentPostalCodes(): string[] {
	return [
		...new Set(
			Object.keys(cells)
				.map((k) => k.split('_')[0])
				.filter((pc) => /^\d{5}$/.test(pc))
		)
	].sort();
}