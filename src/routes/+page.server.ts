import { fail } from '@sveltejs/kit';
import { knownPostalCodes } from '$lib/server/benchmark';
import { addLead } from '$lib/server/supalog';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const pc = url.searchParams.get('pc');
	return {
		postalCodes: knownPostalCodes(),
		prefillPc: pc && /^\d{5}$/.test(pc) ? pc : null
	};
};

export const actions: Actions = {
	waitlist: async ({ request }) => {
		const email = String((await request.formData()).get('email') ?? '').trim().toLowerCase();
		if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
			return fail(400, { waitlistError: 'Tarkista sähköpostiosoite.' });
		}
		const ok = await addLead(email, 'landing-waitlist');
		if (!ok) return fail(503, { waitlistError: 'Tallennus epäonnistui — yritä hetken kuluttua uudelleen.' });
		return { joined: true };
	}
};
