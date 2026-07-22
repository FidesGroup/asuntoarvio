import { SITE_URL } from '$lib/site';
import { areaRows } from '$lib/server/marketstats';
import { allTowns } from '$lib/server/towns';
import type { RequestHandler } from './$types';

export const prerender = true;

// Static, publicly indexable routes only. /arvio is query-param-driven (no
// single canonical URL per page) and /tili, /raportti/[id], /analyysi are
// excluded via robots.txt / noindex — see src/routes/robots.txt/+server.ts.
const STATIC_ROUTES = ['/', '/kartta', '/miksi', '/tilaa', '/tietosuoja', '/evasteet', '/kaupunki'];

export const GET: RequestHandler = () => {
	const paths = [
		...STATIC_ROUTES,
		...allTowns().map((t) => `/kaupunki/${t.slug}`),
		...areaRows().map((r) => `/postinumero/${r.pc}`)
	];
	const urls = paths.map((path) => `\t<url>\n\t\t<loc>${SITE_URL}${path}</loc>\n\t</url>`).join('\n');
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
	return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};
