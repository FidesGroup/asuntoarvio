/**
 * Vuokratuotto engine: monthly rent + vastike + price -> gross/net yield + flags.
 *
 * Deterministic, no I/O. Used by /arvio and /analyysi. Numbers must never ship
 * naked: every YieldResult carries its source assumptions (rent source,
 * transfer-tax rate, reserve line) and rule-4 honesty flags.
 *
 * Tax rate: varainsiirtovero on housing-company shares = 1.5% (vero.fi, updated
 * 2026-01-01). Encoded as a named constant so the source is auditable.
 * Remonttivaraus is an explicit ASSUMPTION, not sourced data.
 */
export type RentSource = 'user' | 'estimate';

export interface YieldInputs {
	monthlyRentEur: number;
	monthlyVastikeEur: number;
	priceEur: number;
	priceIsDebtFree: boolean;
	livingAreaM2: number;
}

export interface YieldResult {
	grossYieldPct: number;
	netYieldPct: number;
	monthlyNetEur: number;
	reserveEurYr: number;
	rentSource: RentSource;
	flags: string[];
}

/** vero.fi, varainsiirtovero (asunto-osakkeet), page updated 2026-01-01. */
export const VARAINSIIRTOVERO_OSAKE = 0.015;

/**
 * Remonttivaraus per m² per year, in EUR. LABELED ASSUMPTION — not a sourced
 * number. Shown as a separate line in the UI; callers must render the
 * assumption text alongside the figure. Rule 4: never naked yield.
 */
export const REMONTTIVARAUS_EUR_M2_YR = 5;

export function computeYield(inputs: YieldInputs, rentSource: RentSource): YieldResult {
	const flags: string[] = [];
	if (!inputs.priceIsDebtFree) {
		flags.push(
			'Hinta on syötetty myyntihintana. Jos kohteessa on yhtiölainaa, velaton neliöhinta on todellisuudessa korkeampi — silloin nettotuotto näyttää yläkanttiin.'
		);
	}
	if (inputs.monthlyVastikeEur <= 0) {
		flags.push(
			'Vastiketta ei annettu, joten laskelma olettaa hoitovastikkeeksi nollan. Todellinen nettotuotto jää tätä pienemmäksi.'
		);
	}
	if (rentSource === 'estimate') {
		flags.push(
			'Vuokra on alueen tilastollinen arvio (Tilastokeskus), ei kohteen toteutunut vuokra.'
		);
	}

	const annualGross = inputs.monthlyRentEur * 12;
	const transferTaxEur = inputs.priceEur * VARAINSIIRTOVERO_OSAKE;
	const denominator = inputs.priceEur + transferTaxEur;
	const grossYieldPct = roundPct(annualGross / inputs.priceEur);
	const netYieldPct = roundPct(
		((inputs.monthlyRentEur - inputs.monthlyVastikeEur) * 12) / denominator
	);
	const monthlyNetEur = Math.round(
		inputs.monthlyRentEur - inputs.monthlyVastikeEur
	);
	const reserveEurYr = Math.round(
		inputs.livingAreaM2 * REMONTTIVARAUS_EUR_M2_YR
	);

	return {
		grossYieldPct,
		netYieldPct,
		monthlyNetEur,
		reserveEurYr,
		rentSource,
		flags
	};
}

function roundPct(x: number): number {
	return Math.round(x * 1000) / 10;
}