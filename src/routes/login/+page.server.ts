import { fail, redirect } from '@sveltejs/kit';
import { api, setSession, sessionFromRequest } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

// Logged-in visitors do not need the login page.
export const load: PageServerLoad = async ({ cookies, url }) => {
	if (sessionFromRequest(cookies)) throw redirect(302, '/account');
	return { reset: url.searchParams.get('reset') === '1' };
};

export const actions: Actions = {
	default: async ({ cookies, request, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');
		const next = safeNext(url.searchParams.get('next'));

		const res = await api<{ token: string }>('/auth/login', {
			method: 'POST',
			body: { email, password }
		});
		if (res.ok && res.data?.token) {
			// The token lives in the HttpOnly cookie and nowhere else.
			setSession(cookies, res.data.token);
			throw redirect(302, next);
		}
		return fail(res.status === 403 ? 403 : 400, {
			error: res.error ?? 'login failed',
			emailNotVerified: res.status === 403 && res.error === 'email_not_verified',
			email
		});
	}
};

// safeNext keeps the post-login redirect on this site only.
function safeNext(next: string | null): string {
	if (!next || !next.startsWith('/') || next.startsWith('//')) return '/account';
	return next;
}
