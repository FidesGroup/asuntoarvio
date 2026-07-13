import { knownPostalCodes } from '$lib/server/benchmark';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => ({ count: knownPostalCodes().length });