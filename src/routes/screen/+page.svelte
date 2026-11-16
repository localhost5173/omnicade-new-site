<script lang="ts">
	import SessionDemo from '$lib/components/SessionDemo.svelte';
</script>

<!-- What the 3D cabinet's screen shows (it iframes this page): the session
     demo, bare and full-bleed. Any other page can be put on the screen by
     passing a different `src` to Cabinet3D. -->
<svelte:head>
	<meta name="robots" content="noindex" />
</svelte:head>

<SessionDemo kiosk />

<style>
	:global(body) {
		overflow: hidden;
	}

	/* the cabinet glass already has its own scanlines */
	:global(body::after) {
		display: none;
	}
</style>
