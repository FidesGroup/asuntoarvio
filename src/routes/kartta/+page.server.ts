import { marketStats } from '$lib/server/marketstats';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return { market: marketStats() };
};
