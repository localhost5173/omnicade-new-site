// Per-request locale decision. Precedence:
//
//   1. ?lang=sv|en        — explicit, and remembered in a year-long cookie
//   2. lang cookie        — the same override, persisted
//   3. edge geo header    — CF-IPCountry / X-Vercel-IP-Country / X-Geo-Country;
//                           set by the CDN or a traefik geoip plugin in
//                           production. No header here means no geo opinion.
//   4. IP lookup          — geoip-lite's bundled GeoLite2 country database,
//                           resolved from the client IP (X-Forwarded-For
//                           behind traefik, the socket address otherwise)
//   5. Accept-Language    — the browser's own preference
//   6. en                 — the default
//
// Steps 3 and 4 are both "where is this request from"; the header only
// exists when an edge already did the lookup, so it outranks ours for
// free. Private/unresolvable addresses lookup to nothing and fall through.

import geoip from 'geoip-lite';

export type Locale = 'sv' | 'en';

const COOKIE = 'lang';
const YEAR = 60 * 60 * 24 * 365;

interface CookieStore {
	get(name: string): string | undefined;
	set(name: string, value: string, opts: Record<string, unknown>): void;
}

/** The visitor's address: behind traefik that's the last XFF entry (the
 * one our own proxy appended), otherwise the socket itself. */
export function clientIpFrom(headers: Headers, fallback: string): string {
	const xff = headers.get('x-forwarded-for');
	if (xff) {
		const entries = xff.split(',').map((s) => s.trim());
		const ip = entries[entries.length - 1];
		if (ip) return ip.replace(/^::ffff:/, '');
	}
	return fallback.replace(/^::ffff:/, '');
}

function lookupCountry(ip: string): string | undefined {
	try {
		return geoip.lookup(ip)?.country;
	} catch {
		// a malformed address must never take a request down with it
		return undefined;
	}
}

export function pickLocale(
	headers: Headers,
	cookies: CookieStore,
	url: URL,
	clientIp: string
): Locale {
	const param = url.searchParams.get('lang');
	if (param === 'sv' || param === 'en') {
		cookies.set(COOKIE, param, { path: '/', maxAge: YEAR, sameSite: 'lax' });
		return param;
	}

	const cookie = cookies.get(COOKIE);
	if (cookie === 'sv' || cookie === 'en') return cookie;

	const geo =
		headers.get('cf-ipcountry') ??
		headers.get('x-vercel-ip-country') ??
		headers.get('x-geo-country');
	if (geo?.toUpperCase() === 'SE') return 'sv';

	// the ip decides: Sweden -> sv, any other resolvable country -> en.
	// Accept-Language only speaks up when the ip resolves to nothing
	// (localhost, private nets) so a Swedish dev still sees Swedish.
	const country = lookupCountry(clientIp);
	if (country === 'SE') return 'sv';
	if (country) return 'en';

	// Accept-Language: "sv-SE,sv;q=0.9,en;q=0.8" -> highest-weight base language
	const parsed = (headers.get('accept-language') ?? '')
		.split(',')
		.map((part) => {
			const [tag, q] = part.trim().split(';q=');
			return { base: tag.trim().split('-')[0].toLowerCase(), q: q ? parseFloat(q) : 1 };
		})
		.sort((a, b) => b.q - a.q);
	if (parsed[0]?.base === 'sv') return 'sv';

	return 'en';
}
