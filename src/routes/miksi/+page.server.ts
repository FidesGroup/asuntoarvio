import { knownPostalCodes } from '$lib/server/benchmark';
import type { PageServerLoad } from './$types';

// No personalization on this page — safe to bake the postal-code count in at
// build time and serve it as static HTML.
export const prerender = true;

export const load: PageServerLoad = async () => ({ count: knownPostalCodes().length });