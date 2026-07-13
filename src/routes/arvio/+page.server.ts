import { error } from '@sveltejs/kit';
import {
	evaluate,
	parseFacts,
	type ApartmentFacts
} from '$lib/server/benchmark';
import {
	computeYield,
	type RentSource,
	type YieldInputs,
	type YieldResult
} from '$lib/server/yield';
import { estimateRent } from '$lib/server/rents';
import { logQuery } from '$lib/server/supalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const facts = parseFacts(url.searchParams);
	if ('error' in facts) throw error(400, facts.error);
	const verdict = evaluate(facts);
	const yieldInput = resolveYieldInputs(url.searchParams, facts);
	const yieldResult: YieldResult | null = yieldInput
		? computeYield(yieldInput.rent, yieldInput.source)
		: null;
	const rentEstimate = yieldInput
		? null
		: estimateRent(facts.postalCode, facts.roomsType, facts.livingAreaM2);
	await logQuery({
		postal_code: facts.postalCode,
		rooms_type: facts.roomsType,
		living_area_m2: facts.livingAreaM2,
		price_eur: facts.priceEur,
		delta_pct: verdict.deltaPct,
		confidence: verdict.confidence
	});
	return { facts, verdict, yield: yieldResult, rentEstimate };
};

/**
 * Resolve yield inputs in priority order:
 *   1. user-supplied rent+vastike (URL params)  -> source 'user'
 *   2. estimate from StatFin asvu rents seed    -> source 'estimate'
 *   3. no yield at all
 *
 * When an estimate is used, vastike is left at 0 (we don't have it); the
 * engine flags this so the user can correct it.
 */
function resolveYieldInputs(
	params: URLSearchParams,
	facts: ApartmentFacts
): { rent: YieldInputs; source: RentSource } | null {
	const userRentRaw = params.get('rent');
	if (userRentRaw !== null) {
		const monthlyRentEur = Number(userRentRaw);
		if (
			!Number.isFinite(monthlyRentEur) ||
			monthlyRentEur < 100 ||
			monthlyRentEur > 20_000
		) {
			throw error(400, 'Vuokra puuttuu tai on virheellinen (100–20 000 €/kk).');
		}
		const vastikeRaw = params.get('vastike');
		const monthlyVastikeEur = vastikeRaw === null ? 0 : Number(vastikeRaw);
		if (
			!Number.isFinite(monthlyVastikeEur) ||
			monthlyVastikeEur < 0 ||
			monthlyVastikeEur > 5_000
		) {
			throw error(400, 'Vastike puuttuu tai on virheellinen (0–5 000 €/kk).');
		}
		return {
			rent: {
				monthlyRentEur,
				monthlyVastikeEur,
				priceEur: facts.priceEur,
				priceIsDebtFree: facts.priceIsDebtFree,
				livingAreaM2: facts.livingAreaM2
			},
			source: 'user'
		};
	}
	const est = estimateRent(facts.postalCode, facts.roomsType, facts.livingAreaM2);
	if (est.monthlyRentEur === null) return null;
	return {
		rent: {
			monthlyRentEur: est.monthlyRentEur,
			monthlyVastikeEur: 0,
			priceEur: facts.priceEur,
			priceIsDebtFree: facts.priceIsDebtFree,
			livingAreaM2: facts.livingAreaM2
		},
		source: 'estimate'
	};
}