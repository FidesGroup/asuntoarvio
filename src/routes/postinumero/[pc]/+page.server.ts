import { error } from '@sveltejs/kit';
import { areaRows } from '$lib/server/marketstats';
import { postalToTown } from '$lib/server/postal-areas';
import { townBySlug, slugifyTown } from '$lib/server/towns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const row = areaRows().find((r) => r.pc === params.pc);
	if (!row) throw error(404, 'Postinumeroaluetta ei löytynyt.');
	const townName = postalToTown(params.pc);
	const town = townName ? townBySlug(slugifyTown(townName)) : null;
	return { row, town };
};
