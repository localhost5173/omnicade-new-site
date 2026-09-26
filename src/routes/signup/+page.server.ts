import { fail } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		const password = String(form.get('password') ?? '');
		const password2 = String(form.get('password2') ?? '');
		if (password !== password2) {
			return fail(400, { error: 'the passwords do not match', email });
		}
		const res = await api<{ account: { email: string } }>('/auth/signup', {
			method: 'POST',
			body: { email, password }
		});
		if (res.status === 409) {
			return fail(409, { error: 'an account with that email already exists -- log in instead', email });
		}
		if (!res.ok) {
			return fail(400, { error: res.error ?? 'signup failed', email });
		}
		// No session yet: the mail's verification link finishes the signup.
		return { success: true as const, email };
	}
};
