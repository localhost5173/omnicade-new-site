// Per-request locale decision. Precedence:
//
//   1. ?lang=sv|en        — explicit, and remembered in a year-long cookie
//   2. lang cookie        — the same override, persisted
//   3. edge geo header    — CF-IPCountry / X-Vercel-IP-Country / X-Geo-Country;
//                           set by the CDN or a traefik geoip plugin in
//                           production. No header here means no geo opinion.
//   4. Accept-Language    — the browser's own preference (sv browsers get sv)
//   5. en                 — the default
//
// Real "GET from Sweden" detection needs one of those edge headers; without
// a geo-aware front (traefik-geoip, Cloudflare) steps 1/2/4 carry the load.

export type Locale = 'sv' | 'en';

const COOKIE = 'lang';
const YEAR = 60 * 60 * 24 * 365;

interface CookieStore {
	get(name: string): string | undefined;
	set(name: string, value: string, opts: Record<string, unknown>): void;
}

export function pickLocale(headers: Headers, cookies: CookieStore, url: URL): Locale {
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
