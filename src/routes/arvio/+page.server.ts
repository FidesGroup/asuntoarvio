import { error } from '@sveltejs/kit';
import { evaluate, parseFacts } from '$lib/server/benchmark';
import { logQuery } from '$lib/server/supalog';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const facts = parseFacts(url.searchParams);
	if ('error' in facts) throw error(400, facts.error);
	// Facts live in the URL -> the result page is shareable with zero storage.
	const verdict = evaluate(facts);
	await logQuery({
		postal_code: facts.postalCode,
		rooms_type: facts.roomsType,
		living_area_m2: facts.livingAreaM2,
		price_eur: facts.priceEur,
		delta_pct: verdict.deltaPct,
		confidence: verdict.confidence
	});
	return { facts, verdict };
};
