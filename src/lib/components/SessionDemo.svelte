<script lang="ts">
	import { tiers, topups } from '$lib/data';
	import type { Tier, Topup } from '$lib/data';

	// The cabinet's session flow, shrunk to demo speed:
	// attract → game → tiers → pay → countdown → running → extend/over.
	// (On the real cabinet the same states run at full minutes; the
	// engine has a play-time divider exactly for demos like this.)
	const PHASE = {
		ATTRACT: 'attract',
		GAME: 'game',
		TIERS: 'tiers',
		PAY: 'pay',
		COUNTDOWN: 'countdown',
		RUNNING: 'running',
		EXTEND: 'extend',
		OVER: 'over'
	} as const;

	type Phase = (typeof PHASE)[keyof typeof PHASE];

	// the demo library; a real cabinet syncs its Steam titles over the api
	const GAMES = ['STREET FIGHTER 6', 'STICKMAN FIGHT', 'BRAWLHALLA', 'RIVALS OF AETHER'];

	let phase = $state<Phase>(PHASE.ATTRACT);
	let remaining = $state(0); // demo seconds
	let grace = $state(0); // extend-screen grace, demo seconds
	let count = $state(3); // 3-2-1
	let chosen = $state<Tier | null>(null); // tier picked
	let game = $state<string | null>(null); // game picked

	const total = $derived(chosen ? chosen.minutes : 0);
	const pct = $derived(total > 0 ? Math.max(0, remaining) / total : 0);
	const lowTime = $derived(phase === PHASE.RUNNING && remaining <= 5);

	function tapAny() {
		// attract mode: any button (here: the screen itself) wakes the cabinet
		phase = PHASE.GAME;
	}

	function pickGame(g: string) {
		game = g;
		phase = PHASE.TIERS;
	}

	function pickTier(t: Tier) {
		chosen = t;
		phase = PHASE.PAY;
	}

	function extend(t: Topup) {
		remaining += t.minutes;
		phase = PHASE.RUNNING;
	}

	function walkAway() {
		phase = PHASE.OVER;
	}

	function reset() {
		phase = PHASE.ATTRACT;
		chosen = null;
		game = null;
		remaining = 0;
		grace = 0;
		count = 3;
	}

	$effect(() => {
		const tick = setInterval(() => {
			if (phase === PHASE.PAY) {
				// like the cabinet's paymentBypass: same flow, auto-approve
				phase = PHASE.COUNTDOWN;
			} else if (phase === PHASE.COUNTDOWN) {
				if (count === 0) {
					remaining = chosen?.minutes ?? 0;
					phase = PHASE.RUNNING;
				} else {
					count -= 1;
				}
			} else if (phase === PHASE.RUNNING) {
				if (remaining <= 0) {
					grace = 10;
					phase = PHASE.EXTEND;
				} else {
					remaining -= 1;
				}
			} else if (phase === PHASE.EXTEND) {
				if (grace <= 0) {
					phase = PHASE.OVER;
				} else {
					grace -= 1;
				}
			}
		}, 1000);

		return () => clearInterval(tick);
	});

	$effect(() => {
		if (phase === PHASE.OVER) {
			const t = setTimeout(reset, 6000);
			return () => clearTimeout(t);
		}
	});

	const mmss = (s: number): string =>
		`${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;
</script>

<div class="demo card" aria-label="Interactive session demo">
	<div class="chrome">
		<span class="dot"></span>
		<span class="dot"></span>
		<span class="dot"></span>
		<span class="title">OMNICADE · LIVE DEMO</span>
	</div>

	<div class="screen" class:low={lowTime}>
		{#if phase === PHASE.ATTRACT}
			<button class="pane attract" onclick={tapAny}>
				<img class="attract-logo" src="/logo.jpg" alt="" aria-hidden="true" />
				<p class="big press">TAP ANY BUTTON TO PLAY</p>
				<p class="hint">this window counts as a button</p>
			</button>
		{:else if phase === PHASE.GAME}
			<div class="pane">
				<p class="k">PICK YOUR GAME</p>
				<div class="gamegrid">
					{#each GAMES as g (g)}
						<button class="tier" onclick={() => pickGame(g)}>
							<strong>{g}</strong>
						</button>
					{/each}
				</div>
			</div>
		{:else if phase === PHASE.TIERS}
			<div class="pane">
				<p class="k">PICK YOUR TIME</p>
				<div class="tiergrid">
					{#each tiers as t (t.minutes)}
						<button class="tier" onclick={() => pickTier(t)}>
							{#if t.badge}<span class="badge {t.badgeClass}">{t.badge}</span>{/if}
							<strong>{t.minutes} MIN</strong>
							<span class="p">{t.price} {t.currency}</span>
						</button>
					{/each}
				</div>
				<p class="hint">demo prices, real cabinet, real card reader</p>
			</div>
		{:else if phase === PHASE.PAY}
			<div class="pane">
				<p class="k">TAP CARD</p>
				<div class="spinner" aria-hidden="true"></div>
				<p class="hint">waiting for the payment server… (auto-approves, like the cabinet's test mode)</p>
			</div>
		{:else if phase === PHASE.COUNTDOWN}
			<div class="pane">
				{#if count > 0}
					<p class="count">{count}</p>
				{:else}
					<p class="fight">FIGHT</p>
				{/if}
			</div>
		{:else if phase === PHASE.RUNNING}
			<div class="pane running">
				{#if game}
					<p class="now">NOW PLAYING · {game}</p>
				{/if}
				<div class="clock" class:warn={remaining <= 5}>
					<span class="t">{mmss(remaining)}</span>
					<span class="lbl">SESSION TIME</span>
				</div>
				<div class="bar"><span style="width: {pct * 100}%"></span></div>
				{#if lowTime}
					<p class="toast">⚠ LOW TIME · TAP CARD TO ADD MORE</p>
				{:else}
					<p class="hint">the real cabinet floats this timer over the live game, in the corner</p>
				{/if}
			</div>
		{:else if phase === PHASE.EXTEND}
			<div class="pane">
				<p class="k danger">GAME PAUSED, MID-FRAME</p>
				<div class="tiergrid small">
					{#each topups as t (t.minutes)}
						<button class="tier" onclick={() => extend(t)}>
							<strong>+{t.minutes} MIN</strong>
							<span class="p">{t.price} {t.currency}</span>
						</button>
					{/each}
				</div>
				<p class="hint">resume offer ends in <b>{grace}s</b> · nothing? time is <b>saved to your card</b></p>
				<button class="walk" onclick={walkAway}>walk away (save time)</button>
			</div>
		{:else}
			<div class="pane">
				<p class="k">SESSION OVER</p>
				<p class="big">TIME SAVED ✓</p>
				<p class="hint">your remaining time is on your card, tap any Omnicade to continue</p>
			</div>
		{/if}
		<div class="scan"></div>
	</div>

	<div class="foot">
		<span class="chip gold">{phase.toUpperCase()}</span>
		<button class="reset" onclick={reset}>↺ restart demo</button>
	</div>
</div>

<style>
	.demo {
		max-width: 520px;
		margin: 0 auto;
		padding: 14px;
		background: linear-gradient(180deg, #14141f, var(--panel));
	}

	.chrome {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 4px 6px 12px;
	}

	.dot {
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--line);
	}

	.dot:first-child {
		background: var(--danger);
	}

	.dot:nth-child(2) {
		background: var(--warn);
	}

	.dot:nth-child(3) {
		background: var(--ok);
	}

	.title {
		margin-left: 8px;
		font-family: var(--pixel);
		font-size: 7.5px;
		letter-spacing: 0.18em;
		color: var(--dim);
	}

	.screen {
		position: relative;
		aspect-ratio: 16 / 10.5;
		border-radius: 10px;
		border: 1px solid #1c1c2c;
		overflow: hidden;
		background:
			radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.04), transparent 55%),
			linear-gradient(165deg, #0b0b18, #05050a);
		box-shadow: inset 0 0 44px rgba(0, 0, 0, 0.8);
		transition: box-shadow 0.3s ease;
	}

	.screen.low {
		box-shadow:
			inset 0 0 44px rgba(0, 0, 0, 0.8),
			0 0 0 2px rgba(255, 59, 59, 0.55);
	}

	.pane {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 14px;
		padding: 20px;
		text-align: center;
		animation: fadein 0.35s ease both;
	}

	.pane.attract {
		border: none;
		background: transparent;
		color: inherit;
		font: inherit;
		cursor: pointer;
		width: 100%;
		/* no fade-in: its stacking context would trap the logo's
		   mix-blend-mode and the jpg's black box would show */
		animation: none;
	}

	.attract-logo {
		width: 190px;
		height: auto;
		/* the jpg's pure-black box disappears into the screen's near-black bg */
		mix-blend-mode: lighten;
	}

	@keyframes fadein {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
		to {
			opacity: 1;
			transform: none;
		}
	}

	.scan {
		position: absolute;
		inset: 0;
		pointer-events: none;
		background: repeating-linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.028) 0 1px,
			transparent 1px 3px
		);
	}

	.k {
		font-family: var(--pixel);
		font-size: 9px;
		letter-spacing: 0.2em;
		color: var(--accent);
	}

	.k.danger {
		color: var(--danger);
	}

	.big {
		font-family: var(--display);
		font-size: clamp(20px, 3.4vw, 30px);
		letter-spacing: 0.03em;
	}

	.press {
		color: var(--accent);
		text-shadow: 0 0 24px rgba(255, 204, 0, 0.4);
		animation: blink 1.3s steps(1) infinite;
	}

	.hint {
		font-size: 12px;
		color: var(--dim);
		max-width: 34ch;
	}

	.gamegrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		width: 100%;
		max-width: 400px;
	}

	.tiergrid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 10px;
		width: 100%;
		max-width: 360px;
	}

	.tiergrid.small {
		grid-template-columns: repeat(3, 1fr);
		max-width: 420px;
	}

	.tier {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 4px;
		align-items: center;
		background: var(--panel2);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 14px 8px 12px;
		cursor: pointer;
		font-family: var(--ui);
		color: var(--text);
		transition:
			border-color 0.15s ease,
			transform 0.15s ease,
			box-shadow 0.15s ease;
	}

	.tier:hover {
		border-color: var(--accent);
		transform: translateY(-2px);
		box-shadow: 0 8px 24px rgba(255, 204, 0, 0.14);
	}

	.tier strong {
		font-family: var(--display);
		font-size: 15px;
		letter-spacing: 0.03em;
	}

	.tier .p {
		font-size: 12px;
		color: var(--accent);
		font-weight: 700;
	}

	.spinner {
		width: 46px;
		height: 46px;
		border-radius: 50%;
		border: 4px solid var(--line);
		border-top-color: var(--accent);
		animation: spin 0.9s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.count {
		font-family: var(--display);
		font-size: clamp(64px, 12vw, 110px);
		color: var(--accent);
		text-shadow: 0 0 50px rgba(255, 204, 0, 0.5);
		animation: pop 1s ease both;
	}

	.fight {
		font-family: var(--display);
		font-size: clamp(40px, 8vw, 72px);
		color: var(--danger);
		text-shadow: 0 0 50px rgba(255, 59, 59, 0.5);
		animation: pop 0.5s ease both;
	}

	@keyframes pop {
		0% {
			transform: scale(1.6);
			opacity: 0;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.now {
		font-family: var(--pixel);
		font-size: 7.5px;
		letter-spacing: 0.16em;
		color: var(--dim);
	}

	.clock {
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	.clock .t {
		font-family: var(--display);
		font-size: clamp(40px, 8vw, 64px);
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}

	.clock.warn .t {
		color: var(--danger);
		text-shadow: 0 0 30px rgba(255, 59, 59, 0.4);
	}

	.clock .lbl {
		font-family: var(--pixel);
		font-size: 7.5px;
		letter-spacing: 0.2em;
		color: var(--dim);
		margin-top: 4px;
	}

	.bar {
		width: min(70%, 280px);
		height: 6px;
		border-radius: 999px;
		background: var(--panel2);
		border: 1px solid var(--line);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--yellow));
		box-shadow: 0 0 12px rgba(255, 204, 0, 0.5);
		transition: width 1s linear;
	}

	.toast {
		font-family: var(--pixel);
		font-size: 8px;
		letter-spacing: 0.1em;
		color: var(--warn);
		animation: blink 0.9s steps(1) infinite;
	}

	.walk {
		background: none;
		border: 1px solid var(--line);
		color: var(--dim);
		font-family: var(--ui);
		font-size: 12px;
		font-weight: 600;
		letter-spacing: 0.06em;
		border-radius: 8px;
		padding: 8px 14px;
		cursor: pointer;
		transition:
			color 0.15s ease,
			border-color 0.15s ease;
	}

	.walk:hover {
		color: var(--text);
		border-color: var(--dim);
	}

	.foot {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 12px 6px 2px;
	}

	.reset {
		background: none;
		border: none;
		color: var(--dim);
		font-family: var(--ui);
		font-size: 12.5px;
		font-weight: 600;
		cursor: pointer;
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	.reset:hover {
		color: var(--accent);
	}
</style>
