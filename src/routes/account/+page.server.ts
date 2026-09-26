import { fail, redirect } from '@sveltejs/kit';
import { api, clearSession, sessionFromRequest } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const token = sessionFromRequest(cookies);
	if (!token) throw redirect(302, '/login?next=/account');

	const me = await api<Me>('/me', { token });
	if (me.status === 401) {
		// dead session: back to login
		clearSession(cookies);
		throw redirect(302, '/login?next=/account');
	}
	if (!me.ok || !me.data) throw fail(500, { message: 'could not load the account' });
	return { me: me.data };
};

type Entry = {
	delta_seconds: number;
	reason: string;
	machine_id?: string;
	created_at: string;
};

type Me = {
	account: {
		id: string;
		email: string;
		balance_seconds: number;
		locked_seconds: number;
		email_verified: boolean;
		created_at: string;
	};
	cards: {
		card_hash_masked: string;
		balance_seconds: number;
		last_machine_id: string;
		last_used_at: string;
	}[];
	entries: Entry[];
};

export const actions: Actions = {
	logout: async ({ cookies }) => {
		const token = sessionFromRequest(cookies);
		if (token) await api('/auth/logout', { method: 'POST', token });
		clearSession(cookies);
		throw redirect(302, '/');
	}
};
