import type { LayoutServerLoad } from './$types';

// the hook already decided the locale for this request; hand it to the
// layout (which puts it in context) and the page data
export const load: LayoutServerLoad = (event) => {
	return { locale: event.locals.locale };
};
