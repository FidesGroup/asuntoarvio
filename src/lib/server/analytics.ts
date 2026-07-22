import { env } from '$env/dynamic/public';
import { PostHog } from 'posthog-node';

/**
 * Server-side product-usage events (postal codes/prices analyzed, etc).
 * More reliable than client-side capture since ad blockers routinely kill
 * client trackers. Best-effort, same convention as supalog.ts: never throws,
 * never blocks the response for more than ~1.5s, and every call site must
 * gate on `analyticsDistinctId()` first — this never fires unconditionally.
 */
let client: PostHog | null = null;

function getClient(): PostHog | null {
	if (client) return client;
	if (!env.PUBLIC_POSTHOG_KEY) return null;
	client = new PostHog(env.PUBLIC_POSTHOG_KEY, {
		host: env.PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
		flushAt: 1,
		flushInterval: 0
	});
	return client;
}

export async function trackServerEvent(
	distinctId: string,
	event: string,
	properties?: Record<string, unknown>
): Promise<void> {
	const ph = getClient();
	if (!ph) return;
	try {
		ph.capture({ distinctId, event, properties });
		// Serverless invocations don't stay alive to flush in the background —
		// shut down (with a hard timeout) so the queued capture actually sends.
		await Promise.race([
			ph.shutdown(),
			new Promise((resolve) => setTimeout(resolve, 1500))
		]);
	} catch {
		// analytics is best-effort by design
	} finally {
		client = null; // shutdown() closes the client; force a fresh one next call
	}
}
