<script lang="ts">
	import { techRows } from '$lib/data';
</script>

<section id="tech">
	<div class="wrap">
		<div class="sec-head">
			<div>
				<p class="eyebrow">Under the hood</p>
				<h2 class="h2">THE INVISIBLE <span class="gold">STAFF</span></h2>
				<p class="lede">
					An Omnicade runs a small crew of software daemons that behave like staff: a navigator
					that drives the game, a guard that watches the door, a watchdog that watches the clock.
					None of them ever take a break.
				</p>
			</div>
		</div>

		<div class="rows">
			{#each techRows as r (r.k)}
				<article class="card row">
					<span class="tag">{r.tag}</span>
					<h3>{r.k}</h3>
					<p>{r.v}</p>
				</article>
			{/each}
		</div>

		<p class="foot-note">
			Everything above is shipping code, not roadmap — it has survived live cabinets, real
			payments and unattended nights.
		</p>
	</div>
</section>

<style>
	.rows {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 18px;
	}

	.row {
		padding: 24px 26px;
		position: relative;
	}

	.tag {
		position: absolute;
		top: 22px;
		right: 24px;
		font-family: var(--pixel);
		font-size: 7px;
		letter-spacing: 0.16em;
		color: var(--blue);
		border: 1px solid rgba(74, 163, 255, 0.35);
		background: rgba(74, 163, 255, 0.07);
		border-radius: 6px;
		padding: 5px 8px;
	}

	h3 {
		font-family: var(--display);
		font-size: 19px;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.row p {
		color: var(--dim);
		font-size: 14.5px;
		margin-top: 8px;
		max-width: 58ch;
	}

	.foot-note {
		margin-top: 26px;
		text-align: center;
		font-family: var(--pixel);
		font-size: 9px;
		letter-spacing: 0.12em;
		color: var(--dim);
	}

	@media (max-width: 800px) {
		.rows {
			grid-template-columns: 1fr;
		}
	}
</style>
