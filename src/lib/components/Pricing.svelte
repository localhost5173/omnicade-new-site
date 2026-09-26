<script lang="ts">
	import { tiers, topups } from '$lib/data';
	import type { Tier } from '$lib/data';

	// default tier mirrors pricing.json's `default: true` (20 min)
	let selected = $state<Tier>(tiers.find((t) => t.default) ?? tiers[0]);

	const perMin = (t: Tier): string => (t.price / t.minutes).toFixed(1);
</script>

<section id="pricing">
	<div class="wrap">
		<div class="sec-head">
			<div>
				<p class="eyebrow">Pay for time, not coins</p>
				<h2 class="h2">SIMPLE <span class="gold">TIME TIERS</span></h2>
				<p class="lede">
					Operators set their own prices per cabinet — these are the shipped defaults. Tap a card,
					pick a tier, play. Add more time mid-session without leaving the game.
				</p>
			</div>
		</div>

		<div class="grid">
			{#each tiers as t (t.minutes)}
				{@const active = selected.minutes === t.minutes}
				<button
					class="card tier"
					class:active
					onclick={() => (selected = t)}
					aria-pressed={active}
				>
					{#if t.badge}
						<span class="badge {t.badgeClass}">{t.badge}</span>
					{/if}
					<p class="mins">{t.minutes}<span>min</span></p>
					<p class="price">{t.price} <span>{t.currency}</span></p>
					<p class="per">≈ {perMin(t)} {t.currency} / min</p>
					<p class="select">{active ? '● SELECTED' : '○ SELECT'}</p>
				</button>
			{/each}
		</div>

		<div class="topups card">
			<div class="t-head">
				<h3>MID-SESSION TOP-UPS</h3>
				<p>
					The game freezes mid-frame, the card appears over it, and you resume exactly where you
					stood — the extend flow, shipped.
				</p>
			</div>
			<div class="t-list">
				{#each topups as t (t.minutes)}
					<div class="t">
						<span class="plus">+{t.minutes} MIN</span>
						<span class="tp">{t.price} {t.currency}</span>
					</div>
				{/each}
			</div>
		</div>

		<p class="note">
			Walk away early and remaining time is <strong>saved to your card</strong> — pick up where
			you left off on any Omnicade.
		</p>
	</div>
</section>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 18px;
	}

	.tier {
		position: relative;
		padding: 30px 22px 20px;
		text-align: center;
		font-family: var(--ui);
		color: var(--text);
		cursor: pointer;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}

	.tier.active {
		border-color: var(--accent);
		box-shadow: 0 0 44px rgba(255, 204, 0, 0.13);
		transform: translateY(-3px);
	}

	.badge {
		position: absolute;
		top: -11px;
		left: 50%;
		transform: translateX(-50%);
		white-space: nowrap;
	}

	.mins {
		font-family: var(--display);
		font-size: 44px;
		line-height: 1;
		color: var(--text);
	}

	.mins span {
		font-size: 16px;
		color: var(--dim);
		margin-left: 6px;
		letter-spacing: 0.08em;
	}

	.price {
		font-family: var(--display);
		font-size: 24px;
		color: var(--accent);
	}

	.price span {
		font-size: 13px;
		color: var(--dim);
	}

	.per {
		font-size: 12px;
		color: var(--dim);
		letter-spacing: 0.06em;
	}

	.select {
		margin-top: 10px;
		font-family: var(--pixel);
		font-size: 7.5px;
		letter-spacing: 0.16em;
		color: var(--dim);
		padding-top: 12px;
		border-top: 1px dashed var(--line);
	}

	.tier.active .select {
		color: var(--accent);
	}

	.topups {
		margin-top: 22px;
		padding: 26px 28px;
		display: flex;
		gap: 40px;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}

	.t-head {
		max-width: 46ch;
	}

	.t-head h3 {
		font-family: var(--display);
		font-size: 17px;
		letter-spacing: 0.06em;
		color: var(--accent);
	}

	.t-head p {
		color: var(--dim);
		font-size: 14px;
		margin-top: 6px;
	}

	.t-list {
		display: flex;
		gap: 12px;
		flex-wrap: wrap;
	}

	.t {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		border: 1px solid var(--line);
		background: var(--panel2);
		border-radius: 10px;
		padding: 12px 18px;
	}

	.plus {
		font-family: var(--display);
		font-size: 16px;
		color: var(--ok);
	}

	.tp {
		font-size: 12.5px;
		color: var(--dim);
		font-weight: 600;
	}

	.note {
		margin-top: 22px;
		text-align: center;
		color: var(--dim);
		font-size: 14px;
	}

	.note strong {
		color: var(--text);
	}

	@media (max-width: 900px) {
		.grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}

	@media (max-width: 520px) {
		.grid {
			grid-template-columns: 1fr;
		}
	}
</style>
