import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

// The cabinets' pairing QR points at /pair/<machineId> — short enough to
// read out loud (the printed caption says "omnicade.eu/pair"); this route
// forwards it to the pairing page, which owns the login + confirm flow.
export const load: PageServerLoad = async ({ params }) => {
	throw redirect(302, `/m/${encodeURIComponent(params.machineId)}`);
};
