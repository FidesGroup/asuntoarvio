import { allTowns } from '$lib/server/towns';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ towns: allTowns() });
