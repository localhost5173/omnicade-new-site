<script lang="ts">
	import { tiers, topups } from '$lib/data';
	import type { Tier, Topup } from '$lib/data';
	import { getLocale, strings } from '$lib/i18n';
	import type { DemoMsg } from '$lib/cabinet/tour';

	// kiosk: just the screen, full-bleed -- what the 3D cabinet's iframe shows
	let { kiosk = false }: { kiosk?: boolean } = $props();

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

	// Remote control for the 3D cabinet's step-by-step tour: in kiosk mode the
	// parent page can set the phase and move a highlight over the lists in time
	// with the joystick on the model. While driven, the clock still ticks the
	// countdown and session time down, but never changes phase on its own.
	let driven = $state(false);
	let cursor = $state(-1);

	$effect(() => {
		if (!kiosk) return;
		const onMessage = (e: MessageEvent<DemoMsg>) => {
			if (e.origin !== location.origin || e.data?.type !== 'omnicade-demo') return;
			const d = e.data;
			if (d.release) {
				driven = false;
				cursor = -1;
				reset();
				return;
			}
			driven = true;
			if (d.game !== undefined) game = GAMES[d.game];
			if (d.tier !== undefined) chosen = tiers[d.tier];
			if (d.remaining !== undefined) remaining = d.remaining;
			if (d.count !== undefined) count = d.count;
			if (d.grace !== undefined) grace = d.grace;
			cursor = d.cursor ?? -1;
			if (d.phase) phase = d.phase;
		};
		addEventListener('message', onMessage);
		return () => removeEventListener('message', onMessage);
	});

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
			if (driven) {
				if (phase === PHASE.COUNTDOWN && count > 0) count -= 1;
				else if (phase === PHASE.RUNNING && remaining > 0) remaining -= 1;
				else if (phase === PHASE.EXTEND && grace > 0) grace -= 1;
				return;
			}
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
		if (phase === PHASE.OVER && !driven) {
			const t = setTimeout(reset, 6000);
			return () => clearTimeout(t);
		}
	});

	const mmss = (s: number): string =>
		`${Math.floor(Math.max(0, s) / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

	// `t` is taken by the tier loops below, so the strings are `ui`
	const ui = strings[getLocale()];
</script>

<div class="demo" class:card={!kiosk} class:kiosk aria-label="Interactive session demo">
	{#if !kiosk}
		<div class="chrome">
			<span class="dot"></span>
			<span class="dot"></span>
			<span class="dot"></span>
			<span class="title">{ui.demo.chromeTitle}</span>
		</div>
	{/if}

	<div class="screen" class:low={lowTime}>
		{#if phase === PHASE.ATTRACT}
			<button class="pane attract" onclick={tapAny}>
				<img class="attract-logo" src="/logo.jpg" alt="" aria-hidden="true" />
				<p class="big press">{ui.demo.attractPrompt}</p>
				<p class="hint">{ui.demo.attractHint}</p>
			</button>
		{:else if phase === PHASE.GAME}
			<div class="pane">
				<p class="k">{ui.demo.pickGame}</p>
				<div class="gamegrid">
					{#each GAMES as g, i (g)}
						<button class="tier" class:focus={cursor === i} onclick={() => pickGame(g)}>
							<strong>{g}</strong>
						</button>
					{/each}
				</div>
			</div>
		{:else if phase === PHASE.TIERS}
			<div class="pane">
				<p class="k">{ui.demo.pickTime}</p>
				<div class="tiergrid">
					{#each tiers as t, i (t.minutes)}
						<button class="tier" class:focus={cursor === i} onclick={() => pickTier(t)}>
							{#if t.badge}<span class="badge {t.badgeClass}">{t.badge}</span>{/if}
							<strong>{t.minutes} MIN</strong>
							<span class="p">{t.price} {t.currency}</span>
						</button>
					{/each}
				</div>
			</div>
		{:else if phase === PHASE.PAY}
			<div class="pane">
				<p class="k">{ui.demo.tapCard}</p>
				<div class="spinner" aria-hidden="true"></div>
				<p class="hint">{ui.demo.payHint}</p>
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
				<!-- stand-in for the live game: a looping two-fighter bout -->
				<div class="game" aria-hidden="true">
					<div class="city"></div>
					<div class="floor"></div>
					<div class="hud">
						<span class="hp p1"><i></i></span>
						<span class="vs">VS</span>
						<span class="hp p2"><i></i></span>
					</div>
					{#each ['f1', 'f2'] as f (f)}
						<div class="fighter {f}">
							<div class="bob">
								<div class="rig">
									<span class="head"></span>
									<span class="torso"></span>
									<span class="arm"></span>
									<span class="leg back"></span>
									<span class="leg front"></span>
								</div>
							</div>
						</div>
					{/each}
					<span class="spark s1"></span>
					<span class="spark s2"></span>
				</div>
				<!-- the cabinet floats the session clock over the game, in the corner -->
				<div class="clock" class:warn={remaining <= 5}>
					<span class="t">{mmss(remaining)}</span>
					<span class="lbl">{ui.demo.sessionTime}</span>
					<div class="bar"><span style="width: {pct * 100}%"></span></div>
				</div>
			</div>
		{:else if phase === PHASE.EXTEND}
			<div class="pane">
				<p class="k danger">{ui.demo.paused}</p>
				<div class="tiergrid small">
					{#each topups as t, i (t.minutes)}
						<button class="tier" class:focus={cursor === i} onclick={() => extend(t)}>
							<strong>+{t.minutes} MIN</strong>
							<span class="p">{t.price} {t.currency}</span>
						</button>
					{/each}
				</div>
				<p class="hint">{@html ui.demo.extendHint(grace)}</p>
				<button class="walk" onclick={walkAway}>{ui.demo.walkAway}</button>
			</div>
		{:else}
			<div class="pane">
				<p class="k">{ui.demo.over}</p>
				<p class="big">{ui.demo.thanks}</p>
				<p class="hint">{ui.demo.overHint}</p>
			</div>
		{/if}
		<div class="scan"></div>
	</div>

	{#if !kiosk}
		<div class="foot">
			<span class="chip gold">{ui.demo.phases[phase.toUpperCase() as keyof typeof ui.demo.phases]}</span>
			<button class="reset" onclick={reset}>{ui.demo.restart}</button>
		</div>
	{/if}
</div>

<style>
	.demo {
		max-width: 520px;
		margin: 0 auto;
		padding: 14px;
		background: linear-gradient(180deg, #14141f, var(--panel));
	}

	.demo.kiosk {
		max-width: none;
		height: 100vh;
		padding: 0;
		background: none;
	}

	.kiosk .screen {
		aspect-ratio: auto;
		height: 100%;
		border: none;
		border-radius: 0;
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

	.tier:hover,
	.tier.focus {
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

	/* ---- running: the game, with the session clock floating over it ---- */
	.pane.running {
		padding: 0;
		animation: none;
	}

	.game {
		position: absolute;
		inset: 0;
		overflow: hidden;
		background:
			radial-gradient(
				circle at 78% 26%,
				#ffe9a8 0 13px,
				rgba(255, 204, 0, 0.18) 14px 30px,
				transparent 31px
			),
			linear-gradient(180deg, #1d1240 0%, #3a1d5c 55%, #6a2a5e 100%);
	}

	.city {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 30%;
		height: 34%;
		background:
			linear-gradient(#190f33, #190f33) 2% 100% / 9% 62% no-repeat,
			linear-gradient(#22143f, #22143f) 12% 100% / 7% 88% no-repeat,
			linear-gradient(#190f33, #190f33) 20% 100% / 11% 48% no-repeat,
			linear-gradient(#22143f, #22143f) 33% 100% / 6% 74% no-repeat,
			linear-gradient(#190f33, #190f33) 41% 100% / 12% 56% no-repeat,
			linear-gradient(#22143f, #22143f) 55% 100% / 8% 96% no-repeat,
			linear-gradient(#190f33, #190f33) 65% 100% / 10% 66% no-repeat,
			linear-gradient(#22143f, #22143f) 77% 100% / 7% 80% no-repeat,
			linear-gradient(#190f33, #190f33) 86% 100% / 12% 52% no-repeat;
	}

	.floor {
		position: absolute;
		left: 0;
		right: 0;
		bottom: 0;
		height: 30%;
		border-top: 2px solid #ff8a3d;
		background:
			repeating-linear-gradient(90deg, rgba(255, 138, 61, 0.16) 0 2px, transparent 2px 38px),
			linear-gradient(180deg, #2b1640, #120a1f);
	}

	.hud {
		position: absolute;
		top: 10px;
		left: 12px;
		right: 12px;
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.hp {
		flex: 1;
		height: 9px;
		border: 1px solid rgba(255, 255, 255, 0.55);
		background: #3a0d12;
		display: flex;
	}

	.hp.p2 {
		justify-content: flex-end;
	}

	.hp i {
		display: block;
		height: 100%;
		background: linear-gradient(180deg, var(--yellow), var(--accent));
		animation: hp1 12.8s steps(1) infinite;
	}

	.hp.p2 i {
		animation-name: hp2;
	}

	/* four exchanges per cycle; each bar drops as its fighter gets hit */
	@keyframes hp1 {
		0% {
			width: 100%;
		}
		21.9% {
			width: 86%;
		}
		46.9% {
			width: 70%;
		}
		71.9% {
			width: 58%;
		}
		96.9% {
			width: 44%;
		}
	}

	@keyframes hp2 {
		0% {
			width: 100%;
		}
		9.4% {
			width: 82%;
		}
		34.4% {
			width: 66%;
		}
		59.4% {
			width: 49%;
		}
		84.4% {
			width: 34%;
		}
	}

	.vs {
		font-family: var(--pixel);
		font-size: 7px;
		color: var(--text);
	}

	.fighter {
		position: absolute;
		bottom: 30%;
		width: 26px;
		height: 56px;
	}

	.fighter.f1 {
		left: calc(50% - 74px);
		--c: #e8202f;
		--d: #8e0f1a;
	}

	/* the same rig, mirrored and half a cycle behind: they take turns */
	.fighter.f2 {
		right: calc(50% - 74px);
		transform: scaleX(-1);
		--c: #2e7dff;
		--d: #123c86;
	}

	.fighter.f2 .rig,
	.fighter.f2 .arm {
		animation-delay: -1.6s;
	}

	.bob {
		position: absolute;
		inset: 0;
		animation: bob 0.4s steps(2) infinite;
	}

	@keyframes bob {
		50% {
			transform: translateY(-2px);
		}
	}

	.rig {
		position: absolute;
		inset: 0;
		animation: bout 3.2s infinite;
	}

	/* step in, punch, step back ... then get hit while the other one swings */
	@keyframes bout {
		0%,
		34%,
		52%,
		100% {
			transform: translateX(0);
			filter: none;
		}
		9% {
			transform: translateX(28px);
		}
		14%,
		24% {
			transform: translateX(34px);
		}
		55% {
			transform: translateX(-10px);
			filter: brightness(2.4);
		}
		62% {
			transform: translateX(-6px);
			filter: none;
		}
		72% {
			transform: translateX(0);
		}
	}

	.rig span {
		position: absolute;
		background: var(--c);
		box-shadow: inset -3px -3px 0 var(--d);
	}

	.head {
		left: 7px;
		top: 0;
		width: 13px;
		height: 13px;
		border-radius: 3px;
	}

	.torso {
		left: 4px;
		top: 14px;
		width: 19px;
		height: 22px;
		border-radius: 3px;
	}

	.arm {
		left: 16px;
		top: 18px;
		width: 14px;
		height: 6px;
		border-radius: 2px;
		transform-origin: left center;
		animation: punch 3.2s infinite;
	}

	@keyframes punch {
		0%,
		12%,
		27%,
		100% {
			transform: scaleX(1);
		}
		15%,
		23% {
			transform: scaleX(2.3);
		}
	}

	.leg {
		top: 36px;
		width: 7px;
		height: 20px;
		border-radius: 2px;
	}

	.leg.back {
		left: 4px;
		transform: rotate(10deg);
	}

	.leg.front {
		left: 15px;
		transform: rotate(-12deg);
	}

	.spark {
		position: absolute;
		bottom: calc(30% + 34px);
		left: 50%;
		width: 22px;
		height: 22px;
		background: var(--yellow);
		clip-path: polygon(50% 0, 61% 36%, 100% 50%, 61% 64%, 50% 100%, 39% 64%, 0 50%, 39% 36%);
		filter: drop-shadow(0 0 6px #fff);
		opacity: 0;
		animation: spark 3.2s infinite;
	}

	/* where each punch lands: just in front of the fighter being hit */
	.spark.s1 {
		margin-left: 2px;
	}

	.spark.s2 {
		margin-left: -24px;
		animation-delay: -1.6s;
	}

	@keyframes spark {
		0%,
		14%,
		25%,
		100% {
			opacity: 0;
			transform: scale(0.3) rotate(0deg);
		}
		16% {
			opacity: 1;
			transform: scale(1.2) rotate(20deg);
		}
		21% {
			opacity: 0.9;
			transform: scale(0.9) rotate(45deg);
		}
	}

	.clock {
		position: absolute;
		right: 10px;
		bottom: 10px;
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 3px;
		padding: 7px 10px 8px;
		border: 1px solid var(--line);
		border-radius: 8px;
		background: rgba(7, 7, 12, 0.8);
	}

	.clock .t {
		font-family: var(--display);
		font-size: 22px;
		line-height: 1;
		color: var(--text);
		font-variant-numeric: tabular-nums;
	}

	.clock.warn .t {
		color: var(--danger);
		text-shadow: 0 0 18px rgba(255, 59, 59, 0.5);
	}

	.clock .lbl {
		font-family: var(--pixel);
		font-size: 6px;
		letter-spacing: 0.2em;
		color: var(--dim);
	}

	.bar {
		width: 96px;
		height: 4px;
		border-radius: 999px;
		background: var(--panel2);
		overflow: hidden;
	}

	.bar span {
		display: block;
		height: 100%;
		background: linear-gradient(90deg, var(--accent), var(--yellow));
		box-shadow: 0 0 12px rgba(255, 204, 0, 0.5);
		transition: width 1s linear;
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
