<script lang="ts">
	import FormPage from '$lib/components/forms/FormPage.svelte';
	import { playerFeedbackForm as def } from '$lib/forms/definitions';
	import { getLocale, strings } from '$lib/i18n';

	let { form }: { form: { ok?: boolean; data?: { error?: string } } | null } = $props();
	const locale = getLocale();
	const t = strings[locale];
</script>

<svelte:head>
	<title>{t.formPages.fragor.title}</title>
	<meta name="description" content={t.formPages.fragor.description} />
</svelte:head>

<section class="form-page">
	<FormPage {def} {form} thanksBody={t.formPages.fragor.thanksBody} />
</section>

<style>
	.form-page {
		padding: 110px 0 110px;
	}
</style>
