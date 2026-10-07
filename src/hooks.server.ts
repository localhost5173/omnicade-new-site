// Locale lives on locals for every request (pages, actions, everything),
// and the resolved value lands in <html lang> so SSR'd Swedish HTML is
// announced as Swedish, not English.
import type { Handle } from '@sveltejs/kit';
import { pickLocale, type Locale } from '$lib/server/locale';

export const handle: Handle = async ({ event, resolve }) => {
	let locale: Locale = 'en';
	try {
		// kit throws when the prerender crawl touches url.searchParams/cookies
		// (those requests have no real url) -- they render the default locale
		locale = pickLocale(event.request.headers, event.cookies, event.url);
	} catch {
		locale = 'en';
	}
	event.locals.locale = locale;
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', locale)
	});
};
