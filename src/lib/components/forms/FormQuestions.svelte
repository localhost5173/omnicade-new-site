<script lang="ts">
	// The form renderer: turns a FormDef into question markup, google-forms
	// style. One component renders every form; a question's `type` decides
	// the widget, `showIf` hides it until its trigger is answered, and every
	// input carries name=key so the server action can rebuild the answers
	// object from plain FormData.
	import { questionVisible, type FormDef, type FormQuestion } from '$lib/forms/definitions';
	import { getLocale } from '$lib/i18n';

	const locale = getLocale();

	let {
		def,
		answers = $bindable()
	}: {
		def: FormDef;
		// loose on purpose: a question's answer is a string, a string[] or
		// nothing depending on its type, and the template binds into it
		answers: Record<string, any>;
	} = $props();

	// multi with a cap: Tally-style, the oldest picks fall off when you
	// check past the limit, so the cap is felt without an error message
	function capChoices(q: FormQuestion) {
		const picked = answers[q.key];
		if (Array.isArray(picked) && q.maxChoices && picked.length > q.maxChoices) {
			answers[q.key] = picked.slice(picked.length - q.maxChoices!);
		}
	}

	const visible = (q: FormQuestion) => questionVisible(q, answers);
</script>

{#each def.questions as q (q.key)}
	{#if visible(q)}
		{#if q.type === 'note'}
			<p class="q-note">{q.label[locale]}</p>
		{:else}
			<div class="q" class:required={q.required}>
				<p class="q-label">{q.label[locale]}</p>

				{#if q.type === 'single'}
					<div class="choices" role="radiogroup" aria-label={q.label[locale]}>
						{#each q.options! as opt (opt.value)}
							<label class="choice">
								<input type="radio" name={q.key} value={opt.value} bind:group={answers[q.key]} required={q.required} />
								<span>{opt.label[locale]}</span>
							</label>
						{/each}
					</div>
				{:else if q.type === 'multi'}
					<div class="choices">
						{#each q.options! as opt (opt.value)}
							<label class="choice">
								<input
									type="checkbox"
									name={q.key}
									value={opt.value}
									bind:group={answers[q.key]}
									onchange={() => capChoices(q)}
								/>
								<span>{opt.label[locale]}</span>
							</label>
						{/each}
					</div>
				{:else if q.type === 'scale'}
					<div class="scale">
						{#each [1, 2, 3, 4, 5] as v (v)}
							<label class="scale-n">
								<input type="radio" name={q.key} value={String(v)} bind:group={answers[q.key]} required={q.required} />
								<span>{v}</span>
							</label>
						{/each}
					</div>
					<div class="scale-ends">
						<span>{q.minLabel?.[locale]}</span>
						<span>{q.maxLabel?.[locale]}</span>
					</div>
				{:else if q.type === 'textarea'}
					<textarea class="input" name={q.key} rows="4" placeholder={q.placeholder?.[locale]}></textarea>
				{:else if q.type === 'email'}
					<input class="input" type="email" name={q.key} placeholder={q.placeholder?.[locale]} />
				{:else if q.type === 'text'}
					<input class="input" type="text" name={q.key} placeholder={q.placeholder?.[locale]} />
				{:else if q.type === 'consent'}
					<label class="choice consent">
						<input type="checkbox" name={q.key} required={q.required} />
						<span>{q.label[locale]}</span>
					</label>
				{/if}
			</div>
		{/if}
	{/if}
{/each}

<style>
	.q {
		margin-bottom: 34px;
	}

	.q-label {
		font-weight: 600;
		font-size: 15.5px;
		letter-spacing: 0.02em;
		margin-bottom: 12px;
	}

	.q.required .q-label::after {
		content: ' *';
		color: var(--accent);
	}

	.q-note {
		color: var(--dim);
		font-size: 14.5px;
		border-left: 3px solid var(--accent);
		padding: 6px 0 6px 14px;
		margin: 26px 0 34px;
		max-width: 62ch;
	}

	.choices {
		display: grid;
		gap: 8px;
	}

	.choice {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 14px;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.02);
		cursor: pointer;
		font-size: 14.5px;
		transition: border-color 0.15s ease;
	}

	.choice:hover {
		border-color: rgba(255, 204, 0, 0.4);
	}

	.choice:has(input:checked) {
		border-color: var(--accent);
		background: rgba(255, 204, 0, 0.05);
	}

	.choice input {
		accent-color: var(--accent);
		width: 15px;
		height: 15px;
		flex: none;
	}

	.choice.consent {
		align-items: flex-start;
		color: var(--dim);
		font-size: 13.5px;
		line-height: 1.5;
	}

	.choice.consent input {
		margin-top: 3px;
	}

	.scale {
		display: flex;
		gap: 10px;
	}

	.scale-n {
		flex: 1;
		display: grid;
		place-items: center;
		gap: 2px;
		padding: 12px 0;
		border: 1px solid var(--line);
		border-radius: 10px;
		background: rgba(255, 255, 255, 0.02);
		cursor: pointer;
		font-family: var(--display);
		font-size: 17px;
		transition: border-color 0.15s ease;
	}

	.scale-n:hover {
		border-color: rgba(255, 204, 0, 0.4);
	}

	.scale-n:has(input:checked) {
		border-color: var(--accent);
		background: rgba(255, 204, 0, 0.08);
		color: var(--accent);
	}

	.scale-n input {
		position: absolute;
		opacity: 0;
		pointer-events: none;
	}

	.scale-ends {
		display: flex;
		justify-content: space-between;
		gap: 16px;
		margin-top: 8px;
		font-size: 12px;
		color: var(--dim);
		letter-spacing: 0.04em;
	}

	.input {
		margin-top: 4px;
	}

	textarea.input {
		resize: vertical;
	}

	@media (max-width: 640px) {
		.scale {
			gap: 6px;
		}
	}
</style>
