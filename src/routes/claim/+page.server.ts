import { fail, redirect } from '@sveltejs/kit';
import { api, sessionFromRequest } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

// The thanks-screen QR lands here: /claim?code=... The code is public
// information (its worth is what the screen said), so the preview answers
// without a login; the claim itself needs one.
export const load: PageServerLoad = async ({ cookies, url }) => {
	const code = url.searchParams.get('code') ?? '';
	if (!code) return { code: '', preview: null };

	const preview = await api<{ seconds: number; arcade_name: string; expires_at: string }>(
		`/claim/${encodeURIComponent(code)}/preview`
	);
	if (!preview.ok || !preview.data) {
		return { code, preview: null, dead: true };
	}
	const token = sessionFromRequest(cookies);
	if (token) {
		// Logged in already: the page offers the one-tap claim.
		const me = await api<Me>('/me', { token });
		if (me.ok && me.data) {
			return { code, preview: preview.data, loggedIn: true, balance: me.data.account.balance_seconds };
		}
	}
	return { code, preview: preview.data, loggedIn: false };
};

export const actions: Actions = {
	claim: async ({ cookies, request }) => {
		const token = sessionFromRequest(cookies);
		const form = await request.formData();
		const code = String(form.get('code') ?? '');
		if (!token) {
			// not logged in: the login form carries the code through
			throw redirect(302, `/login?next=${encodeURIComponent('/claim?code=' + code)}`);
		}
		const res = await api<{ swept_seconds: number; balance_seconds: number }>('/claim', {
			method: 'POST',
			token,
			body: { code }
		});
		if (res.status === 409) {
			return fail(409, { error: res.error, code });
		}
		if (!res.ok || !res.data) {
			return fail(400, { error: res.error ?? 'this code is invalid or has expired', code });
		}
		return { success: true as const, swept: res.data.swept_seconds, balance: res.data.balance_seconds };
	}
};

type Me = {
	account: { balance_seconds: number };
};
