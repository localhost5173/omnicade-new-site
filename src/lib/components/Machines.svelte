<script lang="ts">
	import { machines } from '$lib/data';
</script>

<section id="machines">
	<div class="wrap">
		<div class="sec-head">
			<div>
				<p class="eyebrow">The lineup</p>
				<h2 class="h2">PICK YOUR <span class="gold">CABINET</span></h2>
				<p class="lede">
					Every Omnicade shares the same soul — card payments, saved sessions, self-healing kiosk
					software. The difference is what's under the marquee.
				</p>
			</div>
		</div>

		<div class="grid">
			{#each machines as m (m.id)}
				<article class="card machine" class:hero={m.hero} style="--ma: var(--{m.accent})">
					{#if m.hero}
						<div class="flag"><span class="badge gold">FLAGSHIP</span></div>
					{/if}

					<div class="art" aria-hidden="true">
						<div class="mini">
							<div class="mini-screen"></div>
							<div class="mini-deck"></div>
						</div>
					</div>

					<p class="tagline" style="color: var(--ma)">{m.tagline}</p>
					<h3>{m.name}</h3>
					<p class="desc">{m.desc}</p>

					<ul class="features">
						{#each m.features as f (f)}
							<li><span class="tick" style="color: var(--ma)">▸</span>{f}</li>
						{/each}
					</ul>

					<p class="price">{m.price}</p>
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
		align-items: stretch;
	}

	.machine {
		padding: 26px;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.machine.hero {
		border-color: rgba(255, 204, 0, 0.4);
		box-shadow: 0 0 60px rgba(255, 204, 0, 0.07);
	}

	.flag {
		position: absolute;
		top: 18px;
		right: 18px;
	}

	.art {
		height: 130px;
		display: grid;
		place-items: center;
		background:
			radial-gradient(60% 90% at 50% 100%, color-mix(in srgb, var(--ma) 14%, transparent), transparent 70%),
			var(--bg);
		border: 1px solid var(--line);
		border-radius: 10px;
		margin-bottom: 20px;
	}

	.mini {
		width: 74px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.mini-screen {
		width: 62px;
		height: 44px;
		border-radius: 6px 6px 0 0;
		border: 3px solid #20202f;
		border-bottom: none;
		background: linear-gradient(165deg, color-mix(in srgb, var(--ma) 30%, #0b0b18), #05050a 80%);
		box-shadow: 0 0 26px color-mix(in srgb, var(--ma) 45%, transparent);
	}

	.mini-deck {
		width: 74px;
		height: 26px;
		border-radius: 4px 4px 8px 8px;
		border: 3px solid #20202f;
		border-top: 2px solid #26263a;
		background: linear-gradient(180deg, #171724, #0d0d15);
	}

	.tagline {
		font-family: var(--pixel);
		font-size: 8px;
		letter-spacing: 0.16em;
		text-transform: uppercase;
		margin-bottom: 8px;
	}

	h3 {
		font-family: var(--display);
		font-size: 28px;
		letter-spacing: 0.02em;
	}

	.desc {
		color: var(--dim);
		font-size: 14.5px;
		margin-top: 10px;
		flex: 1;
	}

	.features {
		list-style: none;
		margin: 18px 0 16px;
		display: grid;
		gap: 7px;
	}

	.features li {
		display: flex;
		gap: 9px;
		align-items: baseline;
		font-size: 13.5px;
		font-weight: 600;
		letter-spacing: 0.03em;
		color: var(--text);
	}

	.tick {
		font-size: 12px;
	}

	.price {
		font-family: var(--pixel);
		font-size: 9px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--dim);
		border-top: 1px dashed var(--line);
		padding-top: 14px;
	}

	@media (max-width: 900px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
