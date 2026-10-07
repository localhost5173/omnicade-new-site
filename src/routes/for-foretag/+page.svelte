<script lang="ts">
	import FormPage from '$lib/components/forms/FormPage.svelte';
	import { businessPartnerForm as def } from '$lib/forms/definitions';
	import { getLocale, strings } from '$lib/i18n';

	let { form }: { form: { ok?: boolean; data?: { error?: string } } | null } = $props();
	const locale = getLocale();
	const t = strings[locale];
</script>

<svelte:head>
	<title>{t.formPages['for-foretag'].title}</title>
	<meta name="description" content={t.formPages['for-foretag'].description} />
</svelte:head>

<section class="form-page">
	<FormPage {def} {form} thanksBody={t.formPages['for-foretag'].thanksBody} />
</section>

<style>
	.form-page {
		padding: 110px 0 110px;
	}
</style>
