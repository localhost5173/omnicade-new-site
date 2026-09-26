<script lang="ts">
	// Pure-CSS arcade cabinet with an animated attract screen — the hero
	// visual. The attract slides mirror the real cabinet's attract state:
	// game art class, chips, and a blinking "TAP CARD" prompt.
	const slides = [
		{ title: 'STREET FIGHTER 6', kind: 'VERSUS FIGHTING', hue: '#ff3b3b' },
		{ title: 'PAC-MAN', kind: 'ARCADE CLASSIC', hue: '#ffe14d' },
		{ title: 'METAL SLUG', kind: 'RUN & GUN', hue: '#ff8a3d' },
		{ title: 'GUILTY GEAR STRIVE', kind: 'MODERN AAA', hue: '#4aa3ff' },
		{ title: 'MORTAL KOMBAT', kind: '16-BIT LEGEND', hue: '#25d07a' },
		{ title: 'ROCKET LEAGUE', kind: 'STEAM TITLE', hue: '#4aa3ff' }
	];

	let idx = $state(0);

	$effect(() => {
		const t = setInterval(() => {
			idx = (idx + 1) % slides.length;
		}, 2600);
		return () => clearInterval(t);
	});

	const slide = $derived(slides[idx]);
</script>

<div class="scene" aria-hidden="true">
	<div class="cabinet">
		<div class="marquee-light"></div>
		<div class="marquee">
			<span class="m-word">OMNI<em>CADE</em></span>
		</div>

		<div class="bezel">
			<div class="screen">
				<div class="slide" style="--hue: {slide.hue}">
					<div class="s-kind">{slide.kind}</div>
					<div class="s-title">{slide.title}</div>
					<div class="s-chips">
						<span>1–2 PLAYERS</span><span>CARD PAYMENT</span><span>SAVED TIME</span>
					</div>
				</div>

				<div class="prompt">▶ TAP CARD TO START<span class="cursor">_</span></div>

				<div class="scanlines"></div>
				<div class="vignette"></div>
			</div>
		</div>

		<div class="deck">
			{#each [0, 1] as p (p)}
				<div class="panel">
					<div class="stick"><i></i></div>
					<div class="buttons">
						{#each [0, 1, 2, 3, 4, 5] as b (b)}
							<span class="b b{b}"></span>
						{/each}
					</div>
				</div>
			{/each}
			<div class="slot">
				<div class="card-rail"></div>
				<span class="slot-label">CARD</span>
			</div>
		</div>

		<div class="kick">
			<div class="kick-grill"></div>
			<span class="kick-brand">OMNICADE X</span>
		</div>
	</div>

	<div class="floor"></div>
</div>

<style>
	.scene {
		perspective: 1200px;
		display: grid;
		place-items: center;
	}

	.cabinet {
		width: min(430px, 88vw);
		display: flex;
		flex-direction: column;
		align-items: center;
		animation: floaty 7s ease-in-out infinite;
		filter: drop-shadow(0 40px 60px rgba(0, 0, 0, 0.6));
	}

	/* ---------- marquee ---------- */
	.marquee-light {
		width: 86%;
		height: 14px;
		border-radius: 10px 10px 0 0;
		background: linear-gradient(180deg, rgba(255, 204, 0, 0.9), rgba(255, 204, 0, 0.25));
		box-shadow: 0 -6px 34px rgba(255, 204, 0, 0.45);
	}

	.marquee {
		width: 94%;
		background: linear-gradient(180deg, #191926, #0d0d15);
		border: 1px solid var(--line);
		border-bottom: none;
		border-radius: 12px 12px 0 0;
		padding: 14px 0 10px;
		text-align: center;
	}

	.m-word {
		font-family: var(--display);
		font-size: clamp(20px, 4.4vw, 30px);
		letter-spacing: 0.12em;
		color: var(--text);
		text-shadow: 0 0 22px rgba(255, 204, 0, 0.5);
	}

	.m-word em {
		font-style: normal;
		color: var(--accent);
	}

	/* ---------- screen ---------- */
	.bezel {
		width: 100%;
		background: linear-gradient(180deg, #12121c, #0b0b12);
		border: 1px solid var(--line);
		padding: 16px 16px 12px;
	}

	.screen {
		position: relative;
		aspect-ratio: 16 / 10;
		border-radius: 8px;
		overflow: hidden;
		background:
			radial-gradient(120% 90% at 50% 0%, rgba(255, 255, 255, 0.05), transparent 55%),
			linear-gradient(165deg, #0b0b18 0%, #05050a 100%);
		border: 1px solid #1c1c2c;
		box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.8);
	}

	.slide {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 18px;
		text-align: center;
		animation: slidein 0.5s ease both;
	}

	@keyframes slidein {
		from {
			opacity: 0;
			transform: scale(1.05);
			filter: blur(6px);
		}
		to {
			opacity: 1;
			transform: scale(1);
			filter: blur(0);
		}
	}

	.s-kind {
		font-family: var(--pixel);
		font-size: clamp(6px, 1.4vw, 8px);
		letter-spacing: 0.2em;
		color: var(--hue, var(--accent));
		text-shadow: 0 0 12px currentColor;
	}

	.s-title {
		font-family: var(--display);
		font-size: clamp(18px, 4.2vw, 30px);
		line-height: 1.05;
		letter-spacing: 0.03em;
		text-shadow: 0 0 30px var(--hue, var(--accent));
	}

	.s-chips {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
		justify-content: center;
	}

	.s-chips span {
		font-size: 8.5px;
		font-weight: 600;
		letter-spacing: 0.12em;
		color: var(--dim);
		border: 1px solid var(--line);
		border-radius: 999px;
		padding: 3px 8px;
		background: rgba(255, 255, 255, 0.03);
	}

	.prompt {
		position: absolute;
		bottom: 12px;
		left: 0;
		right: 0;
		text-align: center;
		font-family: var(--display);
		font-size: clamp(9px, 2vw, 12px);
		letter-spacing: 0.16em;
		color: var(--accent);
		animation: blink 1.4s steps(1) infinite;
	}

	.cursor {
		animation: blink 0.8s steps(1) infinite;
	}

	.scanlines {
		position: absolute;
		inset: 0;
		background: repeating-linear-gradient(
			to bottom,
			rgba(255, 255, 255, 0.03) 0px,
			rgba(255, 255, 255, 0.03) 1px,
			transparent 1px,
			transparent 3px
		);
		mix-blend-mode: overlay;
	}

	.vignette {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at center, transparent 58%, rgba(0, 0, 0, 0.55) 100%);
	}

	/* ---------- control deck ---------- */
	.deck {
		width: 100%;
		background: linear-gradient(180deg, #171724, #0e0e16);
		border: 1px solid var(--line);
		border-radius: 0 0 10px 10px;
		padding: 16px 18px 14px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 14px;
	}

	.panel {
		display: flex;
		align-items: center;
		gap: 10px;
		background: var(--panel2);
		border: 1px solid var(--line);
		border-radius: 10px;
		padding: 10px 12px;
	}

	.stick {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: radial-gradient(circle at 50% 42%, #23233a, #0c0c14 78%);
		border: 1px solid var(--line);
		display: grid;
		place-items: center;
		flex: none;
	}

	.stick i {
		width: 9px;
		height: 15px;
		border-radius: 5px;
		background: linear-gradient(180deg, var(--accent), #7a5c00);
		box-shadow: 0 0 8px rgba(255, 204, 0, 0.4);
	}

	.buttons {
		display: grid;
		grid-template-columns: repeat(3, 12px);
		gap: 5px;
	}

	.b {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		box-shadow: inset 0 -2px 3px rgba(0, 0, 0, 0.5);
	}

	.b0 { background: #ff3b3b; }
	.b1 { background: #ffe14d; }
	.b2 { background: #25d07a; }
	.b3 { background: #4aa3ff; }
	.b4 { background: #ff8a3d; }
	.b5 { background: #f2f3f7; }

	.slot {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
		background: var(--panel2);
		border: 1px solid rgba(255, 204, 0, 0.35);
		border-radius: 10px;
		padding: 10px 14px;
		box-shadow: 0 0 18px rgba(255, 204, 0, 0.12);
	}

	.card-rail {
		width: 44px;
		height: 7px;
		border-radius: 4px;
		background: #05050a;
		border: 1px solid var(--line);
		box-shadow: inset 0 0 6px rgba(255, 204, 0, 0.35);
	}

	.slot-label {
		font-family: var(--pixel);
		font-size: 7px;
		letter-spacing: 0.18em;
		color: var(--accent);
	}

	/* ---------- kick panel + floor ---------- */
	.kick {
		width: 78%;
		background: linear-gradient(180deg, #101019, #0a0a11);
		border: 1px solid var(--line);
		border-top: none;
		border-radius: 0 0 16px 16px;
		padding: 12px 18px;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.kick-grill {
		width: 42%;
		height: 10px;
		background: repeating-linear-gradient(
			to right,
			var(--line) 0 2px,
			transparent 2px 6px
		);
	}

	.kick-brand {
		font-family: var(--pixel);
		font-size: 7px;
		letter-spacing: 0.2em;
		color: var(--dim);
	}

	.floor {
		width: 130%;
		height: 60px;
		margin-top: 8px;
		background: radial-gradient(ellipse at 50% 0%, rgba(255, 204, 0, 0.12), transparent 68%);
	}
</style>
