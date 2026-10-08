// Server-side plumbing shared by both form pages: the SvelteKit action
// that validates a submission and files it with omnicade-api. The browser
// never talks to the api directly, same as every other player route.
import { fail } from '@sveltejs/kit';
import { api } from '$lib/server/api';
import { strings } from '$lib/i18n';
import { questionVisible, type FormDef } from './definitions';

export type SubmitResult = { ok: true } | { error: string };

export function createSubmitAction(def: FormDef) {
	return async (event: import('@sveltejs/kit').RequestEvent) => {
		// the hook already resolved the locale for this request
		const locale = event.locals.locale;
		const t = strings[locale];
		const data = await event.request.formData();

		// honeypot: bots fill every field. humans never see this one.
		if ((data.get('website') ?? '') !== '') {
			return { ok: true } satisfies SubmitResult;
		}

		// Rebuild the answers object from the definition so unknown keys
		// posted by hand cannot smuggle themselves into the stored JSON.
		const answers: Record<string, string | string[]> = {};
		for (const q of def.questions) {
			if (q.type === 'note') continue;
			if (!questionVisible(q, answers)) continue;

			if (q.type === 'multi') {
				const picked = data.getAll(q.key).map(String);
				if (q.required && picked.length === 0) {
					return fail(400, { error: t.forms.answerQuestion(q.label[locale]) });
				}
				if (q.maxChoices && picked.length > q.maxChoices) {
					return fail(400, { error: t.forms.maxChoices(q.maxChoices) });
				}
				if (picked.length) answers[q.key] = picked;
			} else if (q.type === 'consent') {
				if (q.required && data.get(q.key) !== 'on') {
					return fail(400, { error: q.label[locale] });
				}
				if (data.get(q.key) === 'on') answers[q.key] = 'ja';
			} else {
				const value = String(data.get(q.key) ?? '').trim();
				if (q.required && !value) {
					return fail(400, { error: t.forms.fillIn(q.label[locale]) });
				}
				if (q.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
					return fail(400, { error: t.forms.badEmail });
				}
				if (q.numeric && value) {
					// Van Westendorp prices: whole kronor, or decimals with a
					// comma or dot -- normalized to a dot before storing
					if (!/^\d+([.,]\d+)?$/.test(value)) {
						return fail(400, { error: t.forms.badNumber });
					}
					answers[q.key] = value.replace(',', '.');
				} else if (value) {
					answers[q.key] = value;
				}
			}
		}

		// traffic source tag (?src= / ?utm_source= on the form page), so
		// self-selected respondents can be read per channel without asking
		const src = String(data.get('__src') ?? '').trim();
		if (src) answers.src = src;

		// the lifted email column: the api uses it for follow-up queries
		const email = typeof answers.email === 'string' ? answers.email : '';

		const res = await api<{ id: string }>(`/forms/${def.id}/responses`, {
			method: 'POST',
			body: { answers, email }
		});
		if (!res.ok) {
			// res.error is human ("the arcade service is unreachable") when the
			// api is down, so the visitor knows it is not their input's fault.
			return fail(res.status || 502, { error: res.error ?? t.forms.submitFailed });
		}
		return { ok: true } satisfies SubmitResult;
	};
}
