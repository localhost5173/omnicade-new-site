import adapter from '@sveltejs/adapter-node';
import type { Config } from '@sveltejs/kit';

// adapter-node since the player accounts: login/account/claim are
// server-rendered pages holding an HttpOnly session cookie and proxying the
// api server-side (the api's CORS is deliberately not credentialed, so the
// browser never talks to it directly). The marketing page stays prerendered
// (see routes/+page.ts).
const config: Config = {
	kit: {
		adapter: adapter()
	}
};

export default config;
