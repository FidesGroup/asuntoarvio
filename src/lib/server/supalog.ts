/**
 * Fire-and-mostly-forget writes to Supabase (PostgREST, service role).
 * Never throws and never blocks the response for more than ~1.5 s —
 * missing config or missing tables must not break a verdict.
 */
import { env } from '$env/dynamic/private';

export async function logQuery(row: {
	postal_code: string;
	rooms_type: string;
	living_area_m2: number | null;
	price_eur: number | null;
	delta_pct: number | null;
	confidence: string | null;
}): Promise<void> {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;
	try {
		await fetch(`${env.SUPABASE_URL}/rest/v1/query_log`, {
			method: 'POST',
			headers: {
				apikey: env.SUPABASE_SERVICE_ROLE_KEY,
				authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
				'content-type': 'application/json',
				prefer: 'return=minimal'
			},
			body: JSON.stringify(row),
			signal: AbortSignal.timeout(1500)
		});
	} catch {
		// metrics are best-effort by design
	}
}
