import { json } from '@sveltejs/kit';
import { evaluate, parseFacts } from '$lib/server/benchmark';
import type { RequestHandler } from './$types';

/**
 * POST /api/benchmark
 * { "pc": "00530", "rt": "kaksio", "m2": 54, "price": 289000, "debtfree": "1", "yr": 1961 }
 * -> verdict JSON. Same engine as the web UI; this endpoint is the future
 * MCP-tool / metered-API surface.
 */
export const POST: RequestHandler = async ({ request }) => {
	let body: Record<string, unknown>;
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body.' }, { status: 400 });
	}
	const params = new URLSearchParams();
	for (const [k, v] of Object.entries(body)) {
		if (v !== null && v !== undefined) params.set(k, String(v));
	}
	const facts = parseFacts(params);
	if ('error' in facts) return json({ error: facts.error }, { status: 400 });
	return json({ facts, verdict: evaluate(facts), source: 'Tilastokeskus, StatFin 13mt (CC BY 4.0)' });
};
