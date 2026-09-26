<script lang="ts">
	import { games } from '$lib/data';

	const pillars: { key: keyof typeof games; accent: string; icon: string }[] = [
		{ key: 'retro', accent: 'var(--ok)', icon: '👾' },
		{ key: 'modern', accent: 'var(--blue)', icon: '🎮' },
		{ key: 'indie', accent: 'var(--accent)', icon: '🛠️' }
	];
</script>

<section id="games">
	<div class="wrap">
		<div class="sec-head">
			<div>
				<p class="eyebrow">One machine, every library</p>
				<h2 class="h2">RUNS <span class="gold">VIRTUALLY ANY GAME</span></h2>
				<p class="lede">
					Omnicade cabinets are not tied to one catalog. Three game sources live side by side on
					the same machine, same screen, same card reader.
				</p>
			</div>
		</div>

		<div class="grid">
			{#each pillars as p (p.key)}
				{@const g = games[p.key]}
				<article class="card pillar" style="--pa: {p.accent}">
					<div class="icon" aria-hidden="true">{p.icon}</div>
					<p class="tag" style="color: {p.accent}">{g.tag}</p>
					<h3>{g.name}</h3>
					<p class="blurb">{g.blurb}</p>
					<div class="titles">
						{#each g.games as t (t)}
							<span class="chip">{t}</span>
						{/each}
					</div>
				</article>
			{/each}
		</div>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 20px;
	}

	.pillar {
		padding: 30px 26px 26px;
		position: relative;
		overflow: hidden;
	}

	.pillar::before {
		content: '';
		position: absolute;
		inset: 0 auto 0 0;
		width: 3px;
		background: var(--pa);
		opacity: 0.7;
	}

	.icon {
		font-size: 30px;
		margin-bottom: 14px;
		filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.15));
	}

	.tag {
		font-family: var(--pixel);
		font-size: 8.5px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		margin-bottom: 10px;
	}

	h3 {
		font-family: var(--display);
		font-size: 24px;
		letter-spacing: 0.02em;
		text-transform: uppercase;
	}

	.blurb {
		color: var(--dim);
		font-size: 14.5px;
		margin-top: 10px;
	}

	.titles {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: 18px;
	}

	@media (max-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
