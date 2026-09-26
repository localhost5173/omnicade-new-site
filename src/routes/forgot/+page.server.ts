import { api } from '$lib/server/api';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ request }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '');
		// Always the same answer, whether or not the address has an account:
		// this route must not leak which emails exist.
		await api('/auth/request-reset', { method: 'POST', body: { email } });
		return { success: true as const };
	}
};
