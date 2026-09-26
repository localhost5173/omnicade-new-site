<script lang="ts">
	let { items = [], speed = 36 }: { items?: string[]; speed?: number } = $props();

	const doubled = $derived([...items, ...items]);
</script>

<div class="marquee" aria-hidden="true">
	<div class="track" style:animation-duration="{speed}s">
		{#each doubled as item, i (i)}
			<span class="item">{item}</span>
			<span class="sep">✦</span>
		{/each}
	</div>
</div>

<style>
	.marquee {
		border-top: 1px solid var(--line);
		border-bottom: 1px solid var(--line);
		background: linear-gradient(180deg, var(--panel), var(--bg));
		overflow: hidden;
		padding: 12px 0;
	}

	.track {
		display: flex;
		gap: 28px;
		width: max-content;
		animation: marquee linear infinite;
	}

	.item {
		font-family: var(--display);
		font-size: 13px;
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--dim);
		white-space: nowrap;
	}

	.item:nth-child(8n + 1) {
		color: var(--accent);
	}

	.sep {
		color: var(--line);
		font-size: 11px;
		align-self: center;
	}
</style>
