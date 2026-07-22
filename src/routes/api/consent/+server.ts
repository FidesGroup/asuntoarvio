import { error, json } from '@sveltejs/kit';
import { logConsent } from '$lib/server/supalog';
import {
	CONSENT_COOKIE,
	CONSENT_MAX_AGE,
	CONSENT_VERSION,
	serializeConsentCookie,
	type ConsentAction,
	type ConsentState
} from '$lib/consent/shared';
import type { RequestHandler } from './$types';

const ACTIONS: ConsentAction[] = ['accept_all', 'reject_all', 'custom', 'withdraw'];

/** Sets the ra_consent cookie and writes the Art. 7(1) audit row. Called by the consent banner/preferences UI — never anything else. */
export const POST: RequestHandler = async ({ request, cookies, url }) => {
	const body = await request.json().catch(() => null);
	const action = body?.action as ConsentAction;
	if (!ACTIONS.includes(action)) throw error(400, 'invalid action');

	const analytics =
		action === 'accept_all' ? true : action === 'reject_all' ? false : Boolean(body?.analytics);
	const marketing =
		action === 'accept_all' ? true : action === 'reject_all' ? false : Boolean(body?.marketing);

	const existingRaw = cookies.get(CONSENT_COOKIE);
	let cid: string;
	try {
		cid = existingRaw ? JSON.parse(existingRaw)?.cid : undefined;
	} catch {
		cid = undefined as unknown as string;
	}
	if (typeof cid !== 'string' || !cid) cid = crypto.randomUUID();

	const state: ConsentState = {
		v: CONSENT_VERSION,
		cid,
		necessary: true,
		analytics,
		marketing,
		ts: new Date().toISOString()
	};

	cookies.set(CONSENT_COOKIE, serializeConsentCookie(state), {
		path: '/',
		httpOnly: false, // the client store must read this to gate the analytics loader
		sameSite: 'lax',
		secure: true,
		maxAge: CONSENT_MAX_AGE
	});

	await logConsent({
		visitor_id: cid,
		consent_version: CONSENT_VERSION,
		analytics,
		marketing,
		action,
		source_path: typeof body?.path === 'string' ? body.path.slice(0, 200) : url.pathname
	});

	return json({ ok: true, state });
};
