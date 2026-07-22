import { getCheckoutSession, stripeEnabled } from '$lib/server/stripe';
import { getSubscriberByToken, upsertSubscriber } from '$lib/server/subscribers';
import { analyticsDistinctId } from '$lib/server/consent';
import { trackServerEvent } from '$lib/server/analytics';
import type { PageServerLoad } from './$types';

const COOKIE = 'ra_access';

/**
 * Post-checkout landing + lightweight account view. Exchanges the Stripe
 * session for a subscriber row and sets the access-token cookie; on later
 * visits shows status from the cookie. No passwords — the token is the login.
 */
export const load: PageServerLoad = async ({ url, cookies }) => {
	const sessionId = url.searchParams.get('session_id');

	if (sessionId && stripeEnabled()) {
		const session = await getCheckoutSession(sessionId);
		if (session?.paid && session.email) {
			const sub = await upsertSubscriber({
				email: session.email.toLowerCase(),
				stripe_customer_id: session.customerId,
				stripe_subscription_id: session.subscriptionId,
				status: 'active'
			});
			if (sub) {
				cookies.set(COOKIE, sub.access_token, {
					path: '/',
					httpOnly: true,
					sameSite: 'lax',
					secure: true,
					maxAge: 60 * 60 * 24 * 365
				});
				// Fired here (the visitor's own browser load, with their cookies),
				// not from the Stripe webhook — the webhook is server-to-server
				// with no consent cookie to attach a distinct_id to.
				const cid = analyticsDistinctId(cookies);
				if (cid) await trackServerEvent(cid, 'subscription_activated', {});
				return { state: 'activated' as const, email: sub.email };
			}
		}
		return { state: 'session-failed' as const, email: null };
	}

	const token = cookies.get(COOKIE);
	if (token) {
		const sub = await getSubscriberByToken(token);
		if (sub) return { state: sub.status, email: sub.email } as const;
	}
	return { state: 'anonymous' as const, email: null };
};
