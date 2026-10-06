<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import Session from '$lib/components/Session.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Omnicade: The Steam arcade machine</title>
	<meta property="og:title" content="Omnicade: The Steam arcade machine" />
	<meta
		property="og:description"
		content="Real Steam games behind one glowing screen. Card payments, saved sessions, tap and play."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<main>
	<Hero />
	<Session />
</main>

<Footer />
