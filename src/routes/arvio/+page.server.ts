import { error } from '@sveltejs/kit';
import { evaluate, parseFacts } from '$lib/server/benchmark';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const facts = parseFacts(url.searchParams);
	if ('error' in facts) throw error(400, facts.error);
	// Facts live in the URL -> the result page is shareable with zero storage.
	return { facts, verdict: evaluate(facts) };
};
