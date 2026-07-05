import { knownPostalCodes } from '$lib/server/benchmark';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pc = url.searchParams.get('pc');
	return {
		postalCodes: knownPostalCodes(),
		prefillPc: pc && /^\d{5}$/.test(pc) ? pc : null
	};
};
