/**
 * Address geocoding via Maanmittauslaitos open geocoding API (Pelias).
 * Requires MML_API_KEY (free, avoin-paikkatieto.maanmittauslaitos.fi).
 * Returns null on any failure — the caller falls back to postal-level.
 */
import { env } from '$env/dynamic/private';

export async function geocodeAddress(
	fetchFn: typeof fetch,
	address: string,
	postalCode: string | null
): Promise<{ lon: number; lat: number } | null> {
	if (!env.MML_API_KEY) return null;
	const text = [address, postalCode].filter(Boolean).join(' ');
	const url =
		'https://avoin-paikkatieto.maanmittauslaitos.fi/geocoding/v2/pelias/search' +
		`?text=${encodeURIComponent(text)}&size=1&lang=fi&api-key=${env.MML_API_KEY}`;
	try {
		const res = await fetchFn(url, { signal: AbortSignal.timeout(5000) });
		if (!res.ok) return null;
		const d = (await res.json()) as { features?: { geometry?: { coordinates?: [number, number] } }[] };
		const coords = d.features?.[0]?.geometry?.coordinates;
		return coords ? { lon: coords[0], lat: coords[1] } : null;
	} catch {
		return null;
	}
}
