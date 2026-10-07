<script lang="ts">
	import '../app.css';
	import type { Snippet } from 'svelte';
	import { setLocaleContext } from '$lib/i18n';

	let { children, data }: { children: Snippet; data: { locale: 'sv' | 'en' } } = $props();

	setLocaleContext(data.locale);
</script>

{@render children()}
