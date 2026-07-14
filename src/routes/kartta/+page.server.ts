import { marketStats } from '$lib/server/marketstats';
import { fetchCountryHistory } from '$lib/server/country-history';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {
		market: marketStats(),
		// Nested so it streams: the map renders immediately, the country
		// history section fills in when StatFin answers (or never, quietly).
		lazy: { countryHistory: fetchCountryHistory() }
	};
};
