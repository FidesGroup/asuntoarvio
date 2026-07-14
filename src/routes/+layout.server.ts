import { marketStats } from '$lib/server/marketstats';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async () => {
	return { dataMeta: { areas: marketStats().areasWithData } };
};
