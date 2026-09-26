<script lang="ts">
	import { navLinks } from '$lib/data';

	let scrolled = $state(false);

	function onScroll() {
		scrolled = window.scrollY > 24;
	}
</script>

<svelte:window onscroll={onScroll} />

<header class="nav" class:scrolled>
	<div class="wrap inner">
		<a class="logo" href="#top" aria-label="Omnicade home">
			<span class="coin" aria-hidden="true"></span>
			<span class="word">OMNI<span class="gold">CADE</span></span>
		</a>

		<nav aria-label="Main">
			{#each navLinks as [label, href] (href)}
				<a {href}>{label}</a>
			{/each}
		</nav>

		<a class="btn btn-gold cta" href="#operators">Get a cabinet</a>
	</div>
</header>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 100;
		padding: 14px 0;
		transition:
			background 0.25s ease,
			border-color 0.25s ease,
			padding 0.25s ease;
		border-bottom: 1px solid transparent;
	}

	.nav.scrolled {
		background: rgba(7, 7, 12, 0.82);
		backdrop-filter: blur(14px);
		border-bottom-color: var(--line);
		padding: 10px 0;
	}

	.inner {
		display: flex;
		align-items: center;
		gap: 28px;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
		font-family: var(--display);
		font-size: 19px;
		letter-spacing: 0.06em;
	}

	.gold {
		color: var(--accent);
	}

	.coin {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: radial-gradient(circle at 34% 30%, var(--yellow), #b98a00 72%);
		box-shadow:
			0 0 14px rgba(255, 204, 0, 0.5),
			inset 0 0 0 2px rgba(0, 0, 0, 0.28);
		position: relative;
		flex: none;
	}

	.coin::after {
		content: '◉';
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
		font-size: 9px;
		color: rgba(0, 0, 0, 0.55);
	}

	nav {
		display: flex;
		gap: 4px;
		margin-left: auto;
	}

	nav a {
		font-size: 13.5px;
		font-weight: 600;
		letter-spacing: 0.05em;
		text-transform: uppercase;
		color: var(--dim);
		padding: 8px 12px;
		border-radius: 8px;
		transition:
			color 0.15s ease,
			background 0.15s ease;
	}

	nav a:hover {
		color: var(--text);
		background: rgba(255, 255, 255, 0.045);
	}

	.cta {
		padding: 10px 18px;
		font-size: 13px;
	}

	@media (max-width: 960px) {
		nav {
			display: none;
		}

		.cta {
			margin-left: auto;
		}
	}
</style>
