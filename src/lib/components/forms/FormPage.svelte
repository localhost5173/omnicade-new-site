<script lang="ts">
	// Shared page shell for the survey forms: intro, the question renderer,
	// honeypot, submit, and the thanks state. The two routes differ only in
	// their FormDef and the thank-you copy.
	import { enhance } from '$app/forms';
	import FormQuestions from './FormQuestions.svelte';
	import { getLocale, strings } from '$lib/i18n';
	import type { FormDef } from '$lib/forms/definitions';

	const locale = getLocale();
	const t = strings[locale];

	let {
		def,
		form = null,
		thanksBody
	}: {
		def: FormDef;
		form: { ok?: boolean; data?: { error?: string } } | null;
		thanksBody: string;
	} = $props();

	// loose typing, same reason as in FormQuestions. multi questions start
	// as [] rather than undefined: the SSR'd checkbox group binding reads
	// the array to decide checked state, and undefined has no .includes.
	function initAnswers(d: FormDef): Record<string, any> {
		const a: Record<string, any> = {};
		for (const q of d.questions) {
			if (q.type === 'multi') a[q.key] = [];
		}
		return a;
	}
	let answers = $state<Record<string, any>>(initAnswers(def));
	let submitting = $state(false);
</script>

<div class="wrap">
	{#if form?.ok}
		<div class="thanks">
			<p class="t-title">TACK!</p>
			<p class="t-body">{thanksBody}</p>
			<a class="btn btn-ghost" href="/">Tillbaka till omnicade.se</a>
		</div>
	{:else}
		<p class="eyebrow">{t.forms.eyebrow}</p>
		<h1 class="h2">{def.title[locale]}</h1>
		<p class="lede">{def.intro[locale]}</p>

		{#if form?.data?.error}
			<div class="banner err" role="alert">{form.data.error}</div>
		{/if}

		<form
			method="POST"
			use:enhance={() => {
				submitting = true;
				return async ({ update }) => {
					submitting = false;
					await update();
					// land on the top of whatever came back (the thanks pane or
					// the error banner), not wherever the last question was
					window.scrollTo({ top: 0 });
				};
			}}
		>
			<FormQuestions bind:answers {def} />

			<!-- honeypot: bots fill in every input, humans never see this one -->
			<div class="hp" aria-hidden="true">
				<label>
					Leave this field empty
					<input type="text" name="website" tabindex="-1" autocomplete="off" />
				</label>
			</div>

			<button class="btn btn-gold" type="submit" disabled={submitting}>
				{submitting ? t.forms.submitting : t.forms.submit}
			</button>
		</form>
	{/if}
</div>

<style>
	form {
		margin-top: 44px;
		max-width: 640px;
	}

	.btn[type='submit'] {
		margin-top: 10px;
	}

	.hp {
		position: absolute;
		left: -9999px;
	}

	.thanks {
		padding: 120px 0 80px;
		max-width: 560px;
	}

	.t-title {
		font-family: var(--display);
		font-size: clamp(40px, 6vw, 64px);
		color: var(--accent);
		text-shadow: 0 0 34px rgba(255, 204, 0, 0.35);
	}

	.t-body {
		color: var(--dim);
		margin: 18px 0 30px;
	}

	.banner {
		margin-top: 26px;
		max-width: 640px;
	}
</style>
