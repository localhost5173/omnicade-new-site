// Locale lives on locals for every request (pages, actions, everything),
// and the resolved value lands in <html lang> so SSR'd Swedish HTML is
// announced as Swedish, not English.
import type { Handle } from '@sveltejs/kit';
import { clientIpFrom, pickLocale, type Locale } from '$lib/server/locale';

export const handle: Handle = async ({ event, resolve }) => {
	let locale: Locale = 'en';
	try {
		// kit throws when the prerender crawl touches url.searchParams/cookies
		// or getClientAddress (those requests have no real url/peer) -- they
		// render the default locale
		const clientIp = clientIpFrom(event.request.headers, event.getClientAddress());
		locale = pickLocale(event.request.headers, event.cookies, event.url, clientIp);
	} catch {
		locale = 'en';
	}
	event.locals.locale = locale;
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale)
	});
};
