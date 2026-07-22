import { marketStats } from '$lib/server/marketstats';
import { CONSENT_COOKIE, parseConsentCookie } from '$lib/consent/shared';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies }) => {
	return {
		dataMeta: { areas: marketStats().areasWithData },
		consent: parseConsentCookie(cookies.get(CONSENT_COOKIE))
	};
};
