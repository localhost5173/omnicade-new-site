<script lang="ts">
	import SessionDemo from './SessionDemo.svelte';
	import { getLocale, strings } from '$lib/i18n';

	const t = strings[getLocale()];
</script>

<section class="hero" id="top">
	<div class="glow glow-a" aria-hidden="true"></div>
	<div class="glow glow-b" aria-hidden="true"></div>

	<div class="wrap grid">
		<div class="copy">
			<p class="eyebrow">{t.hero.eyebrow}</p>
			<h1 class="h1">
				{t.hero.headlineTop}<br />
				<span class="gold">{t.hero.headlineGold}</span>
			</h1>
			<p class="lede">
				{t.hero.ledeTop}<strong>{t.hero.ledeStrong}</strong>{t.hero.ledeRest}
			</p>

			<div class="actions">
				<a class="btn btn-gold" href="#session">{t.hero.cta}</a>
			</div>

			<dl class="stats">
				{#each t.hero.stats as s (s.label)}
					<div class="stat">
						<dt>{s.n}</dt>
						<dd>{s.label}</dd>
					</div>
				{/each}
			</dl>

			<p class="legal">
				{t.hero.legalTop}<strong>{t.hero.legalStrong}</strong>{t.hero.legalRest}
			</p>
		</div>

		<div class="visual">
			<SessionDemo />
		</div>
	</div>
</section>

<style>
	.hero {
		padding: 96px 0 96px;
		overflow: hidden;
	}

	.grid {
		display: grid;
		grid-template-columns: 1.05fr 0.95fr;
		gap: 56px;
		align-items: center;
	}

	.glow {
		position: absolute;
		border-radius: 50%;
		filter: blur(110px);
		pointer-events: none;
		z-index: -1;
	}

	.glow-a {
		width: 560px;
		height: 560px;
		left: -160px;
		top: -120px;
		background: rgba(255, 204, 0, 0.09);
	}

	.glow-b {
		width: 640px;
		height: 640px;
		right: -200px;
		bottom: -240px;
		background: rgba(74, 163, 255, 0.08);
	}

	.h1 {
		font-family: var(--display);
		font-size: clamp(40px, 6.4vw, 76px);
		line-height: 0.98;
		letter-spacing: 0.005em;
		text-transform: uppercase;
	}

	.gold {
		color: var(--accent);
		text-shadow: 0 0 34px rgba(255, 204, 0, 0.35);
	}

	.actions {
		display: flex;
		gap: 14px;
		margin-top: 34px;
		flex-wrap: wrap;
	}

	.stats {
		display: grid;
		grid-template-columns: repeat(2, auto);
		gap: 34px;
		margin-top: 52px;
		justify-content: start;
	}

	.stat dt {
		font-family: var(--display);
		font-size: clamp(22px, 3vw, 32px);
		color: var(--accent);
	}

	.stat dd {
		font-size: 12px;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--dim);
		margin-top: 2px;
	}

	.legal {
		margin-top: 26px;
		font-size: 13.5px;
		color: var(--dim);
	}

	.legal strong {
		color: var(--text);
	}

	@media (max-width: 960px) {
		.hero {
			padding-top: 64px;
		}

		.grid {
			grid-template-columns: 1fr;
			gap: 64px;
		}

		.stats {
			grid-template-columns: repeat(2, auto);
		}
	}
</style>
