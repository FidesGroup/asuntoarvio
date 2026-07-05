import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { knownPostalCodes } from '$lib/server/benchmark';
import { fetchBenchmarks, fetchLatestQuarters } from '$lib/server/statfin';
import type { RequestHandler } from './$types';

/**
 * GET /api/refresh — Vercel cron target (see vercel.json).
 * Recomputes benchmark cells from StatFin for the covered postal codes.
 * With Supabase configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY) it
 * upserts into `benchmarks`; without it, it returns the fresh cells so the
 * seed JSON can be updated manually. Guarded by CRON_SECRET.
 */
export const GET: RequestHandler = async ({ request }) => {
	const auth = request.headers.get('authorization');
	if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const quarters = await fetchLatestQuarters(4);
	const cells = await fetchBenchmarks(knownPostalCodes(), quarters);

	if (env.SUPABASE_URL && env.SUPABASE_SERVICE_ROLE_KEY) {
		const rows = Object.entries(cells).map(([key, cell]) => {
			const [postal_code, rooms_type] = [key.slice(0, 5), key.slice(6)];
			return { postal_code, rooms_type, ...cell, refreshed_at: new Date().toISOString() };
		});
		const res = await fetch(`${env.SUPABASE_URL}/rest/v1/benchmarks`, {
			method: 'POST',
			headers: {
				apikey: env.SUPABASE_SERVICE_ROLE_KEY,
				authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
				'content-type': 'application/json',
				prefer: 'resolution=merge-duplicates'
			},
			body: JSON.stringify(rows)
		});
		if (!res.ok) return json({ error: `Supabase upsert failed: ${res.status}` }, { status: 502 });
		return json({ refreshed: rows.length, quarters, sink: 'supabase' });
	}

	return json({ refreshed: Object.keys(cells).length, quarters, sink: 'response-only', cells });
};
