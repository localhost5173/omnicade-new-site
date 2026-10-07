// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { Locale } from '$lib/i18n';

declare global {
	namespace App {
		interface Locals {
			/** decided once per request by the hook, from param > cookie > geo header > Accept-Language */
			locale: Locale;
		}
	}
}

export {};
