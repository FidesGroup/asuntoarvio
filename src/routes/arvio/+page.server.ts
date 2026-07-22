import { error } from '@sveltejs/kit';
import {
	evaluate,
	lookupCell,
	parseFacts,
	type ApartmentFacts
} from '$lib/server/benchmark';
import centroids from '$lib/server/centroids.json';
import {
	computeYield,
	type RentSource,
	type YieldInputs,
	type YieldResult
} from '$lib/server/yield';
import { estimateRent } from '$lib/server/rents';
import { fetchAreaHistory } from '$lib/server/history';
import { logQuery } from '$lib/server/supalog';
import { analyticsDistinctId } from '$lib/server/consent';
import { trackServerEvent } from '$lib/server/analytics';
import type { PageServerLoad } from './$types';

/** vero.fi, varainsiirtovero (asunto-osakkeet) 1.5%, page updated 2026-01-01. */
const TRANSFER_TAX_RATE = 0.015;

/**
 * Interest assumption for the own-vs-rent comparison: annual rate applied
 * to the full debt-free price, treated as pure cost (no amortization, no
 * appreciation — both move wealth, not monthly cost). Stated in the UI.
 */
const OWN_VS_RENT_INTEREST = 0.035;

/** Typical plumbing-renovation age band for Finnish apartment buildings. */
function pipeRenovationPhase(buildYear: number | null): 'near' | 'in' | null {
	if (!buildYear) return null;
	const age = new Date().getFullYear() - buildYear;
	if (age >= 40 && age <= 70) return 'in';
	if (age >= 30) return 'near';
	return null;
}

export const load: PageServerLoad = async ({ url, cookies }) => {
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
	const cid = analyticsDistinctId(cookies);
	if (cid) {
		await trackServerEvent(cid, 'analyzer_submitted', {
			postal_code: facts.postalCode,
			rooms_type: facts.roomsType,
			delta_pct: verdict.deltaPct,
			confidence: verdict.confidence,
			source: 'share-link'
		});
	}
	// Quarter-to-quarter dispersion of the benchmark cell (real published
	// means, not a modeled deviation).
	const cell = lookupCell(facts.postalCode, facts.roomsType);
	const cellEurs = (cell?.series ?? [])
		.map((s) => s.eur_m2)
		.filter((e): e is number => e !== null);
	const quarterRange =
		cellEurs.length >= 2 ? { min: Math.min(...cellEurs), max: Math.max(...cellEurs) } : null;

	const centroid =
		(centroids as Record<string, { c: number[] }>)[facts.postalCode]?.c ?? null;

	const ownVsRent = yieldInput
		? {
				rentEur: yieldInput.rent.monthlyRentEur,
				rentPerM2: Math.round((yieldInput.rent.monthlyRentEur / facts.livingAreaM2) * 10) / 10,
				rentIsEstimate: yieldInput.source === 'estimate',
				interestEur: Math.round((facts.priceEur * OWN_VS_RENT_INTEREST) / 12),
				vastikeEur: Math.round(yieldInput.rent.monthlyVastikeEur),
				reserveEur: yieldResult ? Math.round(yieldResult.reserveEurYr / 12) : 0
			}
		: null;

	return {
		facts,
		verdict,
		yield: yieldResult,
		rentEstimate,
		quarterRange,
		centroid,
		ownVsRent,
		notes: {
			transferTaxEur: Math.round(facts.priceEur * TRANSFER_TAX_RATE),
			pipeReno: pipeRenovationPhase(facts.buildYear ?? null)
		},
		// Nested so SvelteKit streams it — the verdict renders immediately and
		// the history section fills in when StatFin answers (or never, quietly).
		lazy: { history: fetchAreaHistory(facts.postalCode) }
	};
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