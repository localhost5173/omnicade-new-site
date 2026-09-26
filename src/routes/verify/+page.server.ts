import { api } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

// The mail link lands here with ?token=...; the page consumes it and shows
// the outcome. A dead link offers the resend form (same silence rules as
// the api route: it never says whether the address exists).
export const load: PageServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token') ?? '';
	if (!token) return { state: 'missing' as const };
	const res = await api('/auth/verify', { method: 'POST', body: { token } });
	return { state: res.ok ? ('verified' as const) : ('failed' as const) };
};

export const actions: Actions = {
	resend: async ({ request }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		if (email) {
			await api('/auth/resend-verification', { method: 'POST', body: { email } });
		}
		return { resent: true as const };
	}
};
