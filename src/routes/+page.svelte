<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Session from '$lib/components/Session.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { getLocale, strings } from '$lib/i18n';

	const locale = getLocale();
	const t = strings[locale];
</script>

<svelte:head>
	<title>{t.title}</title>
	<meta property="og:title" content={t.title} />
	<meta property="og:description" content={t.ogDescription} />
	<meta property="og:type" content="website" />
</svelte:head>

<main>
	<Hero />
	<Session />
</main>

<Footer />
