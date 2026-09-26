<script lang="ts">
	import { operatorFeatures } from '$lib/data';
</script>

<section id="operators">
	<div class="wrap">
		<div class="sec-head">
			<div>
				<p class="eyebrow">For operators</p>
				<h2 class="h2">A FLEET THAT <span class="gold">RUNS ITSELF</span></h2>
				<p class="lede">
					Omnicade was built unattended-first: cabinets boot, heal, update and take payments on
					their own. You configure, collect, and only show up when you want to.
				</p>
			</div>
			<a class="btn btn-gold" href="#contact">Talk to us</a>
		</div>

		<div class="grid">
			{#each operatorFeatures as f (f.title)}
				<article class="card feat">
					<span class="icon" aria-hidden="true">{f.icon}</span>
					<h3>{f.title}</h3>
					<p>{f.body}</p>
				</article>
			{/each}
		</div>

		<div class="strip card">
			<p class="strip-k">THE OPERATOR'S NIGHT</p>
			<p class="strip-v">
				11:40 PM — a customer walks away mid-session.
				<span class="ok"> Idle watchdog ends it and saves their time.</span>
				1:20 AM — a game wedges on a splash screen.
				<span class="ok"> The watchdog reboots it with backoff.</span>
				6:00 AM — a new update ships.
				<span class="ok"> Cabinets rebuild themselves at boot. You slept through all of it.</span>
			</p>
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 18px;
	}

	.feat {
		padding: 26px 24px;
	}

	.icon {
		font-size: 22px;
		color: var(--accent);
		text-shadow: 0 0 18px rgba(255, 204, 0, 0.4);
	}

	h3 {
		font-family: var(--display);
		font-size: 17px;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		margin-top: 12px;
	}

	.feat p {
		color: var(--dim);
		font-size: 14px;
		margin-top: 8px;
	}

	.strip {
		margin-top: 26px;
		padding: 26px 30px;
		border-color: rgba(37, 208, 122, 0.3);
	}

	.strip-k {
		font-family: var(--pixel);
		font-size: 8.5px;
		letter-spacing: 0.18em;
		color: var(--ok);
		margin-bottom: 12px;
	}

	.strip-v {
		font-size: 15.5px;
		line-height: 1.9;
		color: var(--dim);
	}

	.strip-v .ok {
		color: var(--ok);
	}

	@media (max-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
