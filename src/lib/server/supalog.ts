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

/** Waiting-list signup. Returns true on success; duplicates count as success. */
export async function addLead(
	email: string,
	source = 'landing',
	marketingOptIn = false
): Promise<boolean> {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return false;
	try {
		const res = await fetch(`${env.SUPABASE_URL}/rest/v1/leads`, {
			method: 'POST',
			headers: {
				apikey: env.SUPABASE_SERVICE_ROLE_KEY,
				authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
				'content-type': 'application/json',
				prefer: 'return=minimal,resolution=ignore-duplicates'
			},
			body: JSON.stringify({ email, source, marketing_opt_in: marketingOptIn }),
			signal: AbortSignal.timeout(3000)
		});
		return res.ok;
	} catch {
		return false;
	}
}

/**
 * GDPR Art. 7(1) proof-of-consent record: what was agreed, when, under which
 * notice version. Best-effort like the rest of this file — if it fails to
 * write, the cookie the caller already set is still the source of truth for
 * gating analytics; this is the audit trail, not the gate itself.
 */
export async function logConsent(row: {
	visitor_id: string;
	consent_version: number;
	analytics: boolean;
	marketing: boolean;
	action: 'accept_all' | 'reject_all' | 'custom' | 'withdraw';
	source_path: string;
}): Promise<void> {
	if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) return;
	try {
		await fetch(`${env.SUPABASE_URL}/rest/v1/consent_log`, {
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
		// consent audit writes are best-effort by design
	}
}
