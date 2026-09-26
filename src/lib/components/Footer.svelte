<script lang="ts">
	import { navLinks } from '$lib/data';

	let placed = $state(0);

	function press() {
		placed += 1;
	}
</script>

<footer id="contact">
	<div class="wrap">
		<div class="cta-band card">
			<p class="eyebrow">Ready player one?</p>
			<h2 class="h2">PUT AN <span class="gold">OMNICADE</span><br />ON YOUR FLOOR</h2>
			<p class="lede">
				Venues, arcades, bars and events — we configure the cabinet, you collect the revenue.
				Tell us where you want it.
			</p>
			<a class="btn btn-gold" href="mailto:hello@omnicade.eu">hello@omnicade.eu</a>
		</div>

		<div class="base">
			<div class="brand">
				<span class="word">OMNI<span class="gold">CADE</span></span>
				<p>Arcade machines that run virtually any game.</p>
			</div>

			<nav aria-label="Footer">
				{#each navLinks as [label, href] (href)}
					<a {href}>{label}</a>
				{/each}
			</nav>

			<button class="coin-btn" onclick={press} title="You know what to do">
				<span class="slot" aria-hidden="true"></span>
				{#if placed === 0}
					INSERT COIN
				{:else if placed === 1}
					CREDIT {placed}
				{:else}
					CREDITS {placed}
				{/if}
			</button>
		</div>

		<p class="legal">
			© {new Date().getFullYear()} Omnicade · Built with the same engine that runs the cabinets.
		</p>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line);
		padding: 96px 0 40px;
		background: linear-gradient(180deg, var(--bg), #050509);
	}

	.cta-band {
		text-align: center;
		padding: 64px 32px;
		background:
			radial-gradient(60% 100% at 50% 0%, rgba(255, 204, 0, 0.08), transparent 70%),
			linear-gradient(180deg, var(--panel2), var(--panel));
	}

	.cta-band .eyebrow {
		justify-content: center;
	}

	.cta-band .eyebrow::before {
		display: none;
	}

	.cta-band .lede {
		margin: 18px auto 30px;
	}

	.base {
		display: flex;
		align-items: flex-start;
		gap: 40px;
		margin-top: 56px;
		flex-wrap: wrap;
	}

	.brand .word {
		font-family: var(--display);
		font-size: 22px;
		letter-spacing: 0.06em;
	}

	.gold {
		color: var(--accent);
	}

	.brand p {
		color: var(--dim);
		font-size: 13px;
		margin-top: 6px;
	}

	nav {
		display: flex;
		gap: 18px;
		margin-left: auto;
		flex-wrap: wrap;
	}

	nav a {
		font-size: 13px;
		font-weight: 600;
		letter-spacing: 0.06em;
		text-transform: uppercase;
		color: var(--dim);
	}

	nav a:hover {
		color: var(--accent);
	}

	.coin-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		background: var(--panel);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 10px 16px;
		color: var(--accent);
		font-family: var(--pixel);
		font-size: 8px;
		letter-spacing: 0.16em;
		cursor: pointer;
		transition:
			border-color 0.15s ease,
			box-shadow 0.15s ease,
			transform 0.05s ease;
	}

	.coin-btn:hover {
		border-color: rgba(255, 204, 0, 0.5);
		box-shadow: 0 0 24px rgba(255, 204, 0, 0.15);
	}

	.coin-btn:active {
		transform: translateY(1px);
	}

	.slot {
		width: 18px;
		height: 8px;
		border-radius: 4px;
		background: #05050a;
		box-shadow: inset 0 0 6px rgba(255, 204, 0, 0.5);
	}

	.legal {
		margin-top: 48px;
		color: var(--dim);
		font-size: 12.5px;
		letter-spacing: 0.04em;
		border-top: 1px solid var(--line);
		padding-top: 22px;
	}
</style>
