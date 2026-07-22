import type { Cookies } from '@sveltejs/kit';
import { CONSENT_COOKIE, parseConsentCookie } from '$lib/consent/shared';

/**
 * The pseudonymous id to attach to a server-side analytics event, or null
 * if the visitor hasn't opted into the analytics category. Every new
 * `trackServerEvent` call site must gate on this — never fire unconditionally.
 */
export function analyticsDistinctId(cookies: Cookies): string | null {
	const state = parseConsentCookie(cookies.get(CONSENT_COOKIE));
	return state?.analytics ? state.cid : null;
}
