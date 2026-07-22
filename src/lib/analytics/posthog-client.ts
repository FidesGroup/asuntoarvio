import { env } from '$env/dynamic/public';

/**
 * Client-side PostHog loader. Dynamically imported so the script isn't even
 * in the bundle graph for a visitor who rejects analytics — never call this
 * except from AnalyticsLoader.svelte's consent-gated effect.
 */
let initialized = false;

export async function initClientAnalytics(distinctId: string): Promise<void> {
	if (initialized || !env.PUBLIC_POSTHOG_KEY) return;
	initialized = true;
	const { default: posthog } = await import('posthog-js');
	posthog.init(env.PUBLIC_POSTHOG_KEY, {
		api_host: env.PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
		person_profiles: 'identified_only',
		disable_session_recording: true,
		capture_pageview: true
	});
	posthog.identify(distinctId);
}

export function captureClientEvent(name: string, properties?: Record<string, unknown>): void {
	if (!initialized) return;
	import('posthog-js').then(({ default: posthog }) => posthog.capture(name, properties));
}
