/**
 * Consent-cookie shape, shared by server (parses the incoming cookie) and
 * client (the runes store). No secrets here — safe to import from either.
 * Bumping CONSENT_VERSION forces the banner to reappear for everyone, even
 * inside CONSENT_MAX_AGE — use it when a materially new purpose (e.g.
 * naming a specific ad platform under "marketing") is added.
 */
export const CONSENT_COOKIE = 'ra_consent';
export const CONSENT_VERSION = 1;
export const CONSENT_MAX_AGE = 60 * 60 * 24 * 180; // ~180 days

export type ConsentAction = 'accept_all' | 'reject_all' | 'custom' | 'withdraw';

export type ConsentState = {
	v: number;
	cid: string;
	necessary: true;
	analytics: boolean;
	marketing: boolean;
	ts: string;
};

export function parseConsentCookie(raw: string | undefined): ConsentState | null {
	if (!raw) return null;
	try {
		const parsed = JSON.parse(raw);
		if (
			parsed &&
			typeof parsed.cid === 'string' &&
			typeof parsed.v === 'number' &&
			typeof parsed.analytics === 'boolean' &&
			typeof parsed.marketing === 'boolean'
		) {
			return {
				v: parsed.v,
				cid: parsed.cid,
				necessary: true,
				analytics: parsed.analytics,
				marketing: parsed.marketing,
				ts: typeof parsed.ts === 'string' ? parsed.ts : new Date().toISOString()
			};
		}
	} catch {
		// malformed cookie — treat as no consent recorded
	}
	return null;
}

export function serializeConsentCookie(state: ConsentState): string {
	return JSON.stringify(state);
}

/** False for missing consent or a stale notice version — either way, re-prompt. */
export function isConsentCurrent(state: ConsentState | null): state is ConsentState {
	return state !== null && state.v === CONSENT_VERSION;
}
