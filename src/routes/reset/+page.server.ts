import { fail, redirect } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

// The mail link lands here with ?token=...
export const load: PageServerLoad = async ({ url }) => {
	return { token: url.searchParams.get('token') ?? '' };
};

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const token = String(form.get('token') ?? '');
		const password = String(form.get('password') ?? '');
		const password2 = String(form.get('password2') ?? '');
		if (password !== password2) {
			return fail(400, { error: 'the passwords do not match', token });
		}
		const res = await api('/auth/reset', { method: 'POST', body: { token, password } });
		if (!res.ok) {
			return fail(400, { error: res.error ?? 'this link is invalid or has expired', token });
		}
		throw redirect(302, '/login?reset=1');
	}
};
