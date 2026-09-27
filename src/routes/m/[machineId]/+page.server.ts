import { fail } from '@sveltejs/kit';
import { api, sessionFromRequest } from '$lib/server/api';
import type { Actions, PageServerLoad } from './$types';

// The cabinet's static pairing QR lands here: /m/<machineId>. Logged in,
// the page offers "use my minutes on this machine"; the confirm rings the
// cabinet over its always-on channel and the player picks PLAY on the
// machine.
export const load: PageServerLoad = async ({ cookies, params }) => {
	const machine = await api<{ machine_id: string; arcade_name: string; online: boolean }>(
		`/machines/${encodeURIComponent(params.machineId)}/public`
	);
	if (machine.status === 0) {
		// The api is unreachable from the site: the cabinet may be fine.
		return { machine: null, unreachable: true };
	}
	if (!machine.ok || !machine.data) {
		return { machine: null };
	}
	const token = sessionFromRequest(cookies);
	if (!token) return { machine: machine.data, loggedIn: false };
	const me = await api<{ account: { balance_seconds: number } }>('/me', { token });
	return { machine: machine.data, loggedIn: true, balance: me.data?.account.balance_seconds ?? 0 };
};

export const actions: Actions = {
	pair: async ({ cookies, params }) => {
		const token = sessionFromRequest(cookies);
		if (!token) throw fail(401, { error: 'log in first' });
		const res = await api<{ expires_at: string }>(
			`/me/machines/${encodeURIComponent(params.machineId)}/login-request`,
			{ method: 'POST', token }
		);
		if (res.status === 409) {
			return fail(409, { error: 'this cabinet is offline right now' });
		}
		if (!res.ok) {
			return fail(400, { error: res.error ?? 'could not reach the cabinet' });
		}
		return { success: true as const };
	}
};
