import { marketStats } from '$lib/server/marketstats';
import { fetchCountryHistory } from '$lib/server/country-history';
import { fetchDivergence } from '$lib/server/regional-history';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		market: marketStats(),
		// Nested so it streams: the map renders immediately, the StatFin-backed
		// history sections fill in when StatFin answers (or never, quietly).
		lazy: { countryHistory: fetchCountryHistory(), divergence: fetchDivergence() }
	};
};
