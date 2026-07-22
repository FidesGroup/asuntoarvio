import { SITE_URL } from '$lib/site';
import type { RequestHandler } from './$types';

export const prerender = true;

export const GET: RequestHandler = () => {
	const body = `User-agent: *
Disallow: /tili
Disallow: /raportti/
Disallow: /api/

Sitemap: ${SITE_URL}/sitemap.xml
`;
	return new Response(body, { headers: { 'Content-Type': 'text/plain' } });
};
