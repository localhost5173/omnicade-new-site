<script lang="ts">
	import { getLocale, strings } from '$lib/i18n';

	const t = strings[getLocale()];
</script>

<section id="session">
	<div class="wrap">
		<div class="sec-head">
			<div>
				<p class="eyebrow">{t.session.eyebrow}</p>
				<h2 class="h2">{t.session.title} <span class="gold">{t.session.titleGold}</span></h2>
				<p class="lede">{t.session.lede}</p>
			</div>
		</div>

		<ol class="steps">
			{#each t.session.steps as s, i (s.title)}
				<li>
					<span class="n">{String(i + 1).padStart(2, '0')}</span>
					<div>
						<h3>{s.title}</h3>
						<p>{s.body}</p>
					</div>
				</li>
			{/each}
		</ol>
	</div>
</section>

<style>
	.steps {
		list-style: none;
		display: grid;
		gap: 0;
		max-width: 640px;
	}

	.steps li {
		display: flex;
		gap: 20px;
		position: relative;
		padding: 0 0 34px 0;
	}

	/* the connective rail */
	.steps li::before {
		content: '';
		position: absolute;
		left: 21px;
		top: 48px;
		bottom: 6px;
		width: 2px;
		background: linear-gradient(180deg, var(--line), transparent);
	}

	.steps li:last-child::before {
		display: none;
	}

	.n {
		flex: none;
		width: 44px;
		height: 44px;
		display: grid;
		place-items: center;
		border-radius: 12px;
		border: 1px solid rgba(255, 204, 0, 0.4);
		background: rgba(255, 204, 0, 0.06);
		color: var(--accent);
		font-family: var(--pixel);
		font-size: 10px;
		box-shadow: 0 0 20px rgba(255, 204, 0, 0.08);
	}

	h3 {
		font-family: var(--display);
		font-size: 19px;
		letter-spacing: 0.03em;
		text-transform: uppercase;
	}

	.steps p {
		color: var(--dim);
		font-size: 14.5px;
		margin-top: 6px;
		max-width: 44ch;
	}

	@media (max-width: 960px) {
		.steps {
			max-width: none;
		}
	}
</style>
