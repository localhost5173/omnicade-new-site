<script lang="ts">
	import Nav from '$lib/components/Nav.svelte';
	import Hero from '$lib/components/Hero.svelte';
	import Marquee from '$lib/components/Marquee.svelte';
	import Platform from '$lib/components/Platform.svelte';
	import Machines from '$lib/components/Machines.svelte';
	import Session from '$lib/components/Session.svelte';
	import Pricing from '$lib/components/Pricing.svelte';
	import Operators from '$lib/components/Operators.svelte';
	import Tech from '$lib/components/Tech.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Omnicade — Arcade machines that run virtually any game</title>
	<meta
		property="og:title"
		content="Omnicade — Arcade machines that run virtually any game"
	/>
	<meta
		property="og:description"
		content="8-bit classics to modern AAA behind one glowing screen. Card payments, saved sessions, a fleet that runs itself."
	/>
	<meta property="og:type" content="website" />
</svelte:head>

<Nav />

<main>
	<Hero />
	<Marquee
		items={[
			'STREET FIGHTER 6',
			'PAC-MAN',
			'200+ EMULATOR CORES',
			'SONIC',
			'TEKKEN 8',
			'METAL SLUG',
			'GUILTY GEAR STRIVE',
			'MORTAL KOMBAT',
			'ROCKET LEAGUE',
			'STREET FIGHTER II'
		]}
	/>
	<Platform />
	<Machines />
	<Session />
	<Pricing />
	<Operators />
	<Tech />
</main>

<Footer />
