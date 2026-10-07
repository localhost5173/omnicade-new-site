import { createSubmitAction } from '$lib/forms/server';
import { businessPartnerForm } from '$lib/forms/definitions';

// the homepage's prerender crawl follows the footer links here; the
// action needs a server, so this route is one on purpose
export const prerender = false;

export const actions = {
	default: createSubmitAction(businessPartnerForm)
};
