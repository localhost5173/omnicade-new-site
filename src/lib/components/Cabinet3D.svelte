<script lang="ts">
	import { onMount } from 'svelte';
	import type { Mesh, Vector3 } from 'three';
	import type { DemoMsg } from '$lib/cabinet/tour';
	import { getLocale, strings } from '$lib/i18n';
	// bundled (not in static/) so the url is content-hashed: a new model is a
	// new url, never a stale cached copy
	import modelUrl from '$lib/assets/cabinet.glb?url';

	// The cabinet, modelled from a 3D scan of the real machine
	// (src/lib/assets/cabinet.glb, built by model/build_cabinet.py). Its screen
	// is a live <iframe>: any page can be shown on it via `src`.
	//
	// How the screen works: two stacked renderers. Underneath, a CSS3D layer
	// places the iframe exactly where the glb's `Screen` mesh is. On top, a
	// transparent WebGL canvas draws the cabinet, and the Screen mesh writes
	// alpha 0 -- a hole that shows the iframe through it. The rest of the
	// cabinet still depth-tests against that hole, so the bezel and marquee
	// correctly occlude the screen at grazing angles.
	//
	// `touring` opens the "how a session works" tour (lib/cabinet/tour.ts):
	// the cabinet goes fullscreen and the camera plays through a session on
	// its own, step by step, then hands the page back.
	let {
		src = '/screen',
		title = 'Omnicade cabinet screen',
		// css px of the page inside the screen; the screen is 16:9
		screenPx = 480,
		touring = $bindable(false),
		// true once the model is up (false: no WebGL, keep the plain fallback)
		ready = $bindable(false)
	}: {
		src?: string;
		title?: string;
		screenPx?: number;
		touring?: boolean;
		ready?: boolean;
	} = $props();

	const t = strings[getLocale()];
	const steps = t.session.steps;
	const pad = (n: number) => String(n).padStart(2, '0');

	let host: HTMLDivElement;
	let step = $state(0);
	// how far the current step has played, 0..1 (drives the progress bar)
	let progress = $state(0);

	// set up once the scene exists; plain object, not reactive
	let api: { start(): void; stop(): void; show(i: number): void } | null = null;

	onMount(() => {
		let disposed = false;
		let cleanup = () => {};

		(async () => {
			const THREE = await import('three');
			const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
			const { CSS3DRenderer, CSS3DObject } = await import(
				'three/addons/renderers/CSS3DRenderer.js'
			);
			const { OrbitControls } = await import('three/addons/controls/OrbitControls.js');
			const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
			const { createTour } = await import('$lib/cabinet/tour');
			if (disposed) return;

			const scene = new THREE.Scene();
			const cssScene = new THREE.Scene();
			const camera = new THREE.PerspectiveCamera(30, 1, 1, 4000);

			const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true });
			gl.setClearColor(0x000000, 0);
			gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
			gl.toneMapping = THREE.ACESFilmicToneMapping;
			gl.toneMappingExposure = 1.05;
			gl.domElement.className = 'gl';

			const css = new CSS3DRenderer();
			css.domElement.className = 'css';

			host.append(css.domElement, gl.domElement);

			const pmrem = new THREE.PMREMGenerator(gl);
			scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
			// a full-strength room turns the black laminate grey
			scene.environmentIntensity = 0.6;

			const key = new THREE.DirectionalLight(0xffffff, 1.6);
			key.position.set(120, 260, 220);
			const rim = new THREE.DirectionalLight(0x4aa3ff, 1.4);
			rim.position.set(-220, 120, -160);
			const warm = new THREE.DirectionalLight(0xffcc00, 0.6);
			warm.position.set(220, 40, -120);
			scene.add(key, rim, warm);

			// the glb is in metres; work in centimetres so the CSS3D transforms
			// aren't tiny fractions (browsers get blurry/jittery with those)
			const gltf = await new GLTFLoader().loadAsync(modelUrl);
			if (disposed) return;
			const cabinet = gltf.scene;
			// the marquee and deck art are seen at steep angles: without
			// anisotropic filtering their mipmaps smear the logo and labels
			const aniso = gl.capabilities.getMaxAnisotropy();
			cabinet.traverse((o) => {
				const mat = (o as Mesh).material;
				if (!(mat instanceof THREE.MeshStandardMaterial)) return;
				if (mat.map) mat.map.anisotropy = aniso;
				if (mat.emissiveMap) mat.emissiveMap.anisotropy = aniso;
			});
			cabinet.scale.setScalar(100);
			// modelled facing Blender +Y, which glTF turns into -Z: face the camera
			cabinet.rotation.y = Math.PI;

			const pivot = new THREE.Group();
			pivot.add(cabinet);
			scene.add(pivot);

			const box = new THREE.Box3().setFromObject(cabinet);
			const centre = box.getCenter(new THREE.Vector3());
			cabinet.position.sub(new THREE.Vector3(centre.x, box.min.y, centre.z));
			const height = box.max.y - box.min.y;
			pivot.updateMatrixWorld(true);

			// ---- the screen: punch a hole and park an iframe behind it ----
			const screen = cabinet.getObjectByName('Screen') as Mesh | undefined;
			const screenPxH = Math.round((screenPx * 9) / 16);
			let cssObj: InstanceType<typeof CSS3DObject> | null = null;
			let frameEl: HTMLIFrameElement | null = null;

			if (screen) {
				screen.material = new THREE.MeshBasicMaterial({
					color: 0x000000,
					opacity: 0,
					blending: THREE.NoBlending,
					side: THREE.FrontSide
				});

				const wrap = document.createElement('div');
				wrap.className = 'screen';
				wrap.style.width = `${screenPx}px`;
				wrap.style.height = `${screenPxH}px`;
				frameEl = document.createElement('iframe');
				frameEl.src = src;
				frameEl.title = title;
				wrap.append(frameEl);

				// Blender plane: local X = width, local Y = up the glass,
				// local Z = out of the glass. glTF's Y-up turns those into local
				// X, -Z and +Y.
				screen.geometry.computeBoundingBox();
				const gb = screen.geometry.boundingBox!;
				const m = screen.matrixWorld;
				const right = new THREE.Vector3().setFromMatrixColumn(m, 0);
				const out = new THREE.Vector3().setFromMatrixColumn(m, 1);
				const up = new THREE.Vector3().setFromMatrixColumn(m, 2).negate();
				const w = (gb.max.x - gb.min.x) * right.length();

				cssObj = new CSS3DObject(wrap);
				gb.getCenter(cssObj.position).applyMatrix4(m);
				cssObj.quaternion.setFromRotationMatrix(
					new THREE.Matrix4().makeBasis(right.normalize(), up.normalize(), out.normalize())
				);
				cssObj.scale.setScalar(w / screenPx);
				cssScene.add(cssObj);
			}

			// the tour drives the screen's demo to match each step
			const send = (m: Omit<DemoMsg, 'type'>) =>
				frameEl?.contentWindow?.postMessage({ type: 'omnicade-demo', ...m }, location.origin);
			const tour = createTour({ pivot, cabinet, send });

			// ---- camera + controls ----
			const home = {
				target: new THREE.Vector3(0, height * 0.6, 0),
				pos: new THREE.Vector3(height * 0.75, height * 0.82, height * 2.35)
			};
			camera.position.copy(home.pos);
			const look = home.target.clone();
			const controls = new OrbitControls(camera, css.domElement);
			controls.target.copy(home.target);
			controls.enableZoom = false; // never hijack page scroll
			controls.enablePan = false;
			controls.enableDamping = true;
			controls.minPolarAngle = Math.PI * 0.3;
			controls.maxPolarAngle = Math.PI * 0.56;
			controls.minAzimuthAngle = -Math.PI * 0.42;
			controls.maxAzimuthAngle = Math.PI * 0.42;
			controls.update();

			// idle sway until someone grabs it (or takes the tour)
			let idle = true;
			controls.addEventListener('start', () => (idle = false));

			const resize = () => {
				const { clientWidth: w, clientHeight: h } = host;
				if (!w || !h) return;
				camera.aspect = w / h;
				camera.updateProjectionMatrix();
				gl.setSize(w, h);
				css.setSize(w, h);
				if (mode === 'tour' && shown >= 0) fly(tour.shot(shown, camera.aspect), 0.6);
			};

			const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

			// ---- camera flights: the tour owns the camera, orbit controls rest ----
			let mode: 'free' | 'tour' = 'free';
			let shown = -1;
			let ended = -1; // the step whose end already moved the tour on
			const flight = {
				active: false,
				t: 0,
				dur: 1,
				fromPos: new THREE.Vector3(),
				fromLook: new THREE.Vector3(),
				toPos: new THREE.Vector3(),
				toLook: new THREE.Vector3(),
				done: null as null | (() => void)
			};
			const fly = (
				to: { pos: Vector3; target: Vector3 },
				dur = 1.4,
				done: null | (() => void) = null
			) => {
				flight.fromPos.copy(camera.position);
				flight.fromLook.copy(look);
				flight.toPos.copy(to.pos);
				flight.toLook.copy(to.target);
				flight.t = 0;
				flight.dur = reduced ? 0.001 : dur;
				flight.done = done;
				flight.active = true;
			};

			api = {
				start() {
					mode = 'tour';
					idle = false;
					controls.enabled = false;
					look.copy(controls.target);
					// the tour drives the screen; stray clicks would fight it
					if (frameEl) frameEl.style.pointerEvents = 'none';
				},
				show(i) {
					shown = i;
					ended = -1;
					tour.enter(i);
					fly(tour.shot(i, camera.aspect));
				},
				stop() {
					if (mode !== 'tour') return;
					mode = 'free';
					shown = -1;
					tour.leave();
					if (frameEl) frameEl.style.pointerEvents = '';
					fly(home, 1.1, () => {
						controls.target.copy(home.target);
						controls.enabled = true;
						controls.update();
					});
				}
			};

			const ro = new ResizeObserver(resize);
			ro.observe(host);
			resize();

			const clock = new THREE.Clock();
			let raf = 0;
			let elapsed = 0;
			let visible = true;
			const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
			io.observe(host);

			// the css object was placed with the pivot at rest; remember that
			// pose so the sway can be applied on top of it
			const baseCss = new THREE.Matrix4();
			if (cssObj) {
				cssObj.updateMatrix();
				baseCss.copy(cssObj.matrix);
			}

			const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

			const frame = () => {
				raf = requestAnimationFrame(frame);
				const dt = Math.min(clock.getDelta(), 0.1);
				if (!visible) return;
				elapsed += dt;

				if (mode === 'tour') pivot.rotation.y *= Math.pow(0.02, dt); // settle square-on
				else if (idle && !reduced) pivot.rotation.y = Math.sin(elapsed * 0.35) * 0.32;
				tour.update(dt);
				// autoplay runs on the tour's clock, not a wall-clock timer, so a
				// step always finishes its animation before the next one starts
				if (mode === 'tour' && shown >= 0) {
					const p = tour.time / tour.duration(shown);
					progress = Math.min(1, p);
					if (p >= 1 && ended !== shown) {
						ended = shown;
						next();
					}
				}
				pivot.updateMatrixWorld(true);
				if (cssObj) {
					// keep the iframe glued to the screen as the pivot sways
					cssObj.matrixAutoUpdate = false;
					cssObj.matrix.multiplyMatrices(pivot.matrixWorld, baseCss);
					cssObj.matrixWorldNeedsUpdate = true;
				}

				if (flight.active) {
					flight.t = Math.min(1, flight.t + dt / flight.dur);
					const k = ease(flight.t);
					camera.position.lerpVectors(flight.fromPos, flight.toPos, k);
					look.lerpVectors(flight.fromLook, flight.toLook, k);
					camera.lookAt(look);
					if (flight.t >= 1) {
						flight.active = false;
						flight.done?.();
					}
				} else if (mode === 'tour') {
					camera.lookAt(look);
				} else {
					controls.update();
				}

				gl.render(scene, camera);
				css.render(cssScene, camera);
			};

			ready = true;
			frame();

			cleanup = () => {
				api = null;
				cancelAnimationFrame(raf);
				ro.disconnect();
				io.disconnect();
				controls.dispose();
				pmrem.dispose();
				gl.dispose();
				gl.domElement.remove();
				css.domElement.remove();
			};
		})();

		return () => {
			disposed = true;
			cleanup();
		};
	});

	// open / close the tour
	$effect(() => {
		if (!ready || !api) return;
		if (touring) {
			step = 0;
			api.start();
		} else {
			api.stop();
		}
	});

	// fly to the current step
	$effect(() => {
		if (ready && touring) api?.show(step);
	});

	// no page scrolling under the fullscreen tour
	$effect(() => {
		if (!touring) return;
		const html = document.documentElement;
		const prev = html.style.overflow;
		html.style.overflow = 'hidden';
		return () => {
			html.style.overflow = prev;
		};
	});

	// autoplay (driven from the render loop): each step plays out, then the
	// next one starts; after the last, the tour closes itself
	const next = () => (step < steps.length - 1 ? step++ : (touring = false));
	const prev = () => step > 0 && step--;

	function onkey(e: KeyboardEvent) {
		if (!touring) return;
		if (e.key === 'Escape') touring = false;
		else if (e.key === 'ArrowRight') next();
		else if (e.key === 'ArrowLeft') prev();
	}
</script>

<svelte:window onkeydown={onkey} />

<div class="slot">
	<div
		class="cabinet3d"
		class:loaded={ready}
		class:tour={touring}
		role={touring ? 'dialog' : undefined}
		aria-modal={touring ? 'true' : undefined}
		aria-label={touring ? t.hero.cta : undefined}
	>
		<div class="stage" bind:this={host} aria-label="3D model of the Omnicade cabinet">
			<noscript><img src="/logo.jpg" alt="Omnicade" /></noscript>
		</div>

		{#if touring}
			<div class="tour-ui">
				<p class="eyebrow tour-title">{t.hero.cta}</p>
				<button class="close" onclick={() => (touring = false)} aria-label={t.tour.close}>✕</button>

				<div class="panel">
					<!-- story-style progress: fills on its own, click to jump -->
					<div class="progress">
						{#each steps as s, i (s.title)}
							<button
								class:done={i < step}
								onclick={() => (step = i)}
								aria-label="{t.tour.step} {i + 1}: {s.title}"
								aria-current={i === step ? 'step' : undefined}
							>
								{#if i === step}
									<span style="transform: scaleX({progress})"></span>
								{/if}
							</button>
						{/each}
					</div>
					{#key step}
						<div class="copy">
							<p class="count">
								{t.tour.step}
								<strong>{pad(step + 1)}</strong> / {pad(steps.length)}
							</p>
							<h3>{steps[step].title}</h3>
							<p class="body">{steps[step].body}</p>
						</div>
					{/key}
				</div>
			</div>
		{/if}
	</div>
</div>

<style>
	/* keeps the hero's layout while the cabinet itself goes fullscreen */
	.slot {
		position: relative;
		width: 100%;
		aspect-ratio: 4 / 5;
		max-height: 760px;
	}

	.cabinet3d {
		position: absolute;
		inset: 0;
		opacity: 0;
		transition: opacity 0.6s ease;
		cursor: grab;
	}

	.cabinet3d:active {
		cursor: grabbing;
	}

	.cabinet3d.loaded {
		opacity: 1;
	}

	.cabinet3d.tour {
		position: fixed;
		overflow: hidden;
		z-index: 1000;
		cursor: default;
		background:
			radial-gradient(70% 60% at 50% 40%, rgba(74, 163, 255, 0.08), transparent 70%),
			radial-gradient(60% 50% at 70% 90%, rgba(255, 204, 0, 0.06), transparent 70%),
			var(--bg);
		animation: tour-in 0.45s ease both;
	}

	@keyframes tour-in {
		from {
			opacity: 0;
		}
	}

	.stage {
		position: absolute;
		inset: 0;
	}

	.stage :global(.css),
	.stage :global(.gl) {
		position: absolute !important;
		inset: 0;
	}

	/* the cabinet draws on top but lets the pointer through: drags reach the
	   orbit controls on the css layer, clicks on the glass reach the iframe */
	.stage :global(.gl) {
		pointer-events: none;
	}

	.stage :global(.screen) {
		background: #000;
	}

	.stage :global(.screen iframe) {
		width: 100%;
		height: 100%;
		border: 0;
		display: block;
		background: #05050a;
	}

	/* ---- tour overlay ---- */
	.tour-ui {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.tour-ui > * {
		pointer-events: auto;
	}

	.tour-title {
		position: absolute;
		top: 28px;
		left: 32px;
	}

	.close {
		position: absolute;
		top: 18px;
		right: 22px;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		border: 1px solid var(--line);
		background: rgba(16, 16, 25, 0.8);
		color: var(--text);
		font-size: 18px;
		cursor: pointer;
		transition: border-color 0.2s ease;
	}

	.close:hover {
		border-color: var(--accent);
	}

	.panel {
		position: absolute;
		left: 50%;
		bottom: 28px;
		transform: translateX(-50%);
		width: min(620px, calc(100% - 32px));
		padding: 22px 24px 18px;
		border: 1px solid var(--line);
		border-radius: var(--radius);
		background: rgba(16, 16, 25, 0.86);
		backdrop-filter: blur(10px);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	}

	.copy {
		animation: copy-in 0.4s ease both;
	}

	@keyframes copy-in {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}

	.count {
		font-family: var(--pixel);
		font-size: 10px;
		letter-spacing: 0.18em;
		color: var(--dim);
		text-transform: uppercase;
	}

	.count strong {
		color: var(--accent);
		font-weight: inherit;
	}

	.panel h3 {
		font-family: var(--display);
		font-size: clamp(22px, 3vw, 30px);
		text-transform: uppercase;
		line-height: 1.05;
		margin: 10px 0 8px;
	}

	.body {
		color: var(--dim);
		font-size: 15px;
		min-height: 3.2em;
	}

	.progress {
		display: flex;
		gap: 6px;
		margin-bottom: 16px;
	}

	.progress button {
		position: relative;
		flex: 1;
		height: 4px;
		padding: 0;
		border: none;
		border-radius: 2px;
		background: var(--line);
		overflow: hidden;
		cursor: pointer;
	}

	/* a taller invisible hit area for the 4px bars */
	.progress button::after {
		content: '';
		position: absolute;
		inset: -10px 0;
	}

	.progress button.done {
		background: var(--accent);
	}

	.progress span {
		position: absolute;
		inset: 0;
		background: var(--accent);
		transform-origin: left;
	}

	/* wide screens: copy in a column on the left, the cabinet framed in the
	   rest. The stage runs off the right edge by the column's width, so its
	   centre (where the camera looks) is the middle of the free space, and
	   nothing gets clipped behind the column. */
	@media (min-width: 900px) {
		.tour .stage {
			right: calc(-1 * min(440px, 34vw));
		}

		.panel {
			left: 40px;
			bottom: 50%;
			transform: translateY(50%);
			width: min(380px, calc(34vw - 60px));
		}

		.body {
			min-height: 0;
		}
	}

	/* phones: cabinet above, copy below */
	@media (max-width: 600px) {
		.tour .stage {
			top: 56px;
			bottom: 228px;
		}

		.tour-title {
			display: none;
		}

		.panel {
			bottom: 12px;
			padding: 16px 16px 14px;
		}

		.body {
			font-size: 14px;
		}
	}
</style>
