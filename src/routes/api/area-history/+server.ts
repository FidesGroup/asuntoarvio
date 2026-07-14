import { error, json } from '@sveltejs/kit';
import { fetchAreaHistory } from '$lib/server/history';
import type { RequestHandler } from './$types';

/** Area price history (StatFin 13mt, server-cached) for client-side charts. */
export const GET: RequestHandler = async ({ url }) => {
	const pc = (url.searchParams.get('pc') ?? '').trim();
	if (!/^\d{5}$/.test(pc)) throw error(400, 'pc');
	return json(await fetchAreaHistory(pc));
};
