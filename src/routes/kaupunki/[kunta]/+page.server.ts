import { error } from '@sveltejs/kit';
import { townBySlug } from '$lib/server/towns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const town = townBySlug(params.kunta.toLowerCase());
	if (!town) throw error(404, 'Kaupunkia ei löytynyt.');
	return { town };
};
