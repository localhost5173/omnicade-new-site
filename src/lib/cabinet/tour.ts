// "How a session works", in 3D: five camera shots over the cabinet model, each
// with a small animation. Step 1 has a person walking up and putting their
// hands on the controls; after that the person fades out and only the
// hardware moves -- the joystick, the buttons and a card on the reader --
// while the cabinet's screen (the /screen iframe) is driven to the matching
// phase of the session demo over postMessage.
//
// World units are centimetres (Cabinet3D scales the metre glb by 100), the
// cabinet faces +Z and the floor is y = 0.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export type DemoPhase =
	| 'attract'
	| 'game'
	| 'tiers'
	| 'pay'
	| 'countdown'
	| 'running'
	| 'extend'
	| 'over';

/** What SessionDemo (kiosk) accepts over postMessage. */
export interface DemoMsg {
	type: 'omnicade-demo';
	release?: boolean;
	phase?: DemoPhase;
	/** highlighted entry in the current list, -1 for none */
	cursor?: number;
	game?: number;
	tier?: number;
	remaining?: number;
	count?: number;
	grace?: number;
}

type Drive = Omit<DemoMsg, 'type'>;

export interface Shot {
	pos: THREE.Vector3;
	target: THREE.Vector3;
}

export interface Tour {
	readonly steps: number;
	/** seconds the autoplaying tour stays on step i */
	duration(i: number): number;
	/** seconds the current step has played (the tour's own clock: it only
	 *  advances with rendered frames, so slow devices don't skip ahead) */
	readonly time: number;
	shot(i: number, aspect: number): Shot;
	enter(i: number): void;
	update(dt: number): void;
	leave(): void;
}

// ---------------------------------------------------------------- easing
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => {
	const u = clamp01(x);
	return u * u * (3 - 2 * u);
};
/** 0 -> 1 -> 0 between t0 and t0 + d: a quick move out and back */
const pulse = (t: number, t0: number, d: number) => {
	const u = (t - t0) / d;
	return u <= 0 || u >= 1 ? 0 : Math.sin(Math.PI * u);
};
const DOWN = new THREE.Vector3(0, -1, 0);

// ---------------------------------------------------------------- person
interface Limb {
	joint: THREE.Group;
	mid: THREE.Group;
}

interface Person {
	root: THREE.Group;
	hips: THREE.Group;
	armL: Limb;
	armR: Limb;
	legL: Limb;
	legR: Limb;
	mat: THREE.MeshStandardMaterial;
}

const SHOULDER_Y = 146; // root-local, see buildPerson
const SHOULDER_X = 20;
const UPPER_ARM = 29;
const FOREARM = 28; // elbow to the middle of the hand

/** A plain, faceless mannequin, front = -Z, feet on y = 0, ~175 cm tall. */
function buildPerson(): Person {
	const mat = new THREE.MeshStandardMaterial({
		color: '#9aa0b8',
		roughness: 0.55,
		metalness: 0.05,
		emissive: '#161824',
		transparent: true
	});
	const cap = (r: number, len: number) =>
		new THREE.Mesh(new THREE.CapsuleGeometry(r, len, 6, 16), mat);
	const group = (parent: THREE.Object3D, x: number, y: number, z = 0) => {
		const g = new THREE.Group();
		g.position.set(x, y, z);
		parent.add(g);
		return g;
	};

	const root = new THREE.Group();
	const hips = group(root, 0, 95);
	const pelvis = cap(12, 10);
	pelvis.rotation.z = Math.PI / 2;
	pelvis.scale.set(1, 1, 0.8);
	hips.add(pelvis);

	const spine = group(hips, 0, 5);
	const torso = cap(15, 30);
	torso.position.y = 26;
	torso.scale.set(1.2, 1, 0.72);
	spine.add(torso);
	const neck = cap(5, 6);
	neck.position.y = 52;
	spine.add(neck);
	const head = new THREE.Mesh(new THREE.SphereGeometry(10.5, 24, 18), mat);
	head.position.y = 64;
	head.scale.set(0.9, 1.05, 1);
	spine.add(head);

	const arm = (side: number): Limb => {
		const joint = group(spine, side * SHOULDER_X, SHOULDER_Y - 100);
		const upper = cap(5, 20);
		upper.position.y = -14.5;
		joint.add(upper);
		const mid = group(joint, 0, -UPPER_ARM);
		const fore = cap(4.3, 19);
		fore.position.y = -13;
		mid.add(fore);
		const hand = new THREE.Mesh(new THREE.SphereGeometry(5, 16, 12), mat);
		hand.position.y = -FOREARM;
		hand.scale.set(0.8, 1.15, 0.6);
		mid.add(hand);
		return { joint, mid };
	};

	const leg = (side: number): Limb => {
		const joint = group(hips, side * 9, -2);
		const thigh = cap(7, 30);
		thigh.position.y = -21;
		joint.add(thigh);
		const mid = group(joint, 0, -43);
		const shin = cap(5.5, 32);
		shin.position.y = -21;
		mid.add(shin);
		const ankle = group(mid, 0, -45);
		const foot = new THREE.Mesh(new RoundedBoxGeometry(9, 5, 24, 2, 2), mat);
		foot.position.set(0, -2.5, -6);
		ankle.add(foot);
		return { joint, mid };
	};

	return { root, hips, armL: arm(-1), armR: arm(1), legL: leg(-1), legR: leg(1), mat };
}

/** Two-bone IK in the person's root frame: shoulder/elbow rotations that put
 *  the hand on `target`, elbow dropping below the line. */
function reach(shoulder: THREE.Vector3, target: THREE.Vector3): [THREE.Quaternion, THREE.Quaternion] {
	const d = target.clone().sub(shoulder);
	const dist = THREE.MathUtils.clamp(d.length(), 5, UPPER_ARM + FOREARM - 0.01);
	const dir = d.normalize();
	const cosA =
		(UPPER_ARM * UPPER_ARM + dist * dist - FOREARM * FOREARM) / (2 * UPPER_ARM * dist);
	const a = Math.acos(THREE.MathUtils.clamp(cosA, -1, 1));
	const perp = DOWN.clone().addScaledVector(dir, -DOWN.dot(dir));
	if (perp.lengthSq() < 1e-6) perp.set(0, 0, 1);
	perp.normalize();
	const upper = dir.clone().multiplyScalar(Math.cos(a)).addScaledVector(perp, Math.sin(a));
	const elbow = shoulder.clone().addScaledVector(upper, UPPER_ARM);
	const fore = target.clone().sub(elbow).normalize();
	const q1 = new THREE.Quaternion().setFromUnitVectors(DOWN, upper);
	const q2 = new THREE.Quaternion().setFromUnitVectors(
		DOWN,
		fore.applyQuaternion(q1.clone().invert())
	);
	return [q1, q2];
}

// ---------------------------------------------------------------- card
function buildCard(): THREE.Mesh {
	const c = document.createElement('canvas');
	c.width = 512;
	c.height = 323;
	const g = c.getContext('2d')!;
	const grad = g.createLinearGradient(0, 0, 512, 323);
	grad.addColorStop(0, '#ffcc00');
	grad.addColorStop(1, '#ff8a3d');
	g.fillStyle = grad;
	g.fillRect(0, 0, 512, 323);
	g.fillStyle = 'rgba(0,0,0,0.12)';
	g.beginPath();
	g.arc(470, 40, 210, 0, Math.PI * 2);
	g.fill();
	g.fillStyle = '#d9b44a';
	g.strokeStyle = '#7a5b10';
	g.lineWidth = 3;
	g.beginPath();
	g.roundRect(46, 112, 78, 60, 10);
	g.fill();
	g.stroke();
	g.fillStyle = '#16161f';
	g.font = '900 44px "Archivo Black", "Arial Black", sans-serif';
	g.fillText('OMNICADE', 46, 266);
	g.font = '700 22px "Chakra Petch", sans-serif';
	g.fillText('PLAYER CARD', 48, 296);
	const tex = new THREE.CanvasTexture(c);
	tex.colorSpace = THREE.SRGBColorSpace;
	tex.anisotropy = 8;
	const mat = new THREE.MeshStandardMaterial({
		map: tex,
		roughness: 0.35,
		metalness: 0.1,
		transparent: true
	});
	// 85.6 x 54 mm, an ordinary bank card
	return new THREE.Mesh(new RoundedBoxGeometry(8.56, 5.4, 0.12, 2, 0.35), mat);
}

// ---------------------------------------------------------------- tour
interface Ctx {
	/** the group the cabinet model sits in (at rest: unrotated) */
	pivot: THREE.Object3D;
	/** the glb scene */
	cabinet: THREE.Object3D;
	send: (m: Drive) => void;
}

interface StepDef {
	/** seconds on screen before the tour moves on; the step plays once */
	duration: number;
	/** screen changes, [seconds into the step, message]. The first one sets
	 *  the screen the previous step ended on, so the flow never jumps back. */
	events: [number, Drive][];
	run: (t: number) => void;
	shot: (aspect: number) => Shot;
}

export function createTour({ pivot, cabinet, send }: Ctx): Tour {
	pivot.updateMatrixWorld(true);
	const node = (name: string) => {
		const o = cabinet.getObjectByName(name);
		if (!o) throw new Error(`cabinet.glb has no ${name}`);
		return o;
	};
	const world = (o: THREE.Object3D) => o.getWorldPosition(new THREE.Vector3());

	// --- joystick: pivot group at the washer, shaft + bat re-parented under it.
	// Its local +Y is the stick's axis (the deck normal). Tilts are worked out
	// from world directions as the player sees them -- right is +X (they face
	// -Z), forward is away from them, toward the screen -- so stick and
	// on-screen cursor always move the same way.
	const washer = node('P1_Stick_Washer');
	const stick = new THREE.Group();
	washer.parent!.add(stick);
	stick.position.copy(washer.position);
	stick.quaternion.copy(washer.quaternion);
	stick.updateMatrixWorld(true);
	stick.attach(node('P1_Stick_Shaft'));
	stick.attach(node('P1_Stick_Bat'));
	const stickRest = stick.quaternion.clone();
	const toStick = stick.getWorldQuaternion(new THREE.Quaternion()).invert();
	const stickRight = new THREE.Vector3(1, 0, 0).applyQuaternion(toStick);
	const stickForward = new THREE.Vector3(0, 0, -1).applyQuaternion(toStick);
	const stickAxis = new THREE.Vector3(0, 1, 0);
	const tiltQ = new THREE.Quaternion();
	/** right/forward in -1..1: where the top of the stick goes */
	const tiltStick = (right: number, forward: number) => {
		const tip = stickRight.clone().multiplyScalar(right).addScaledVector(stickForward, forward);
		const amount = Math.min(1, tip.length());
		stick.quaternion.copy(stickRest);
		if (amount < 1e-4) return;
		// turning the axis about (axis x tip) swings its top toward tip
		const about = stickAxis.clone().cross(tip).normalize();
		stick.quaternion.multiply(tiltQ.setFromAxisAngle(about, 0.36 * amount));
	};

	// --- buttons: caps travel down their own axis
	const caps = new Map<string, { o: THREE.Object3D; rest: THREE.Vector3; axis: THREE.Vector3 }>();
	const cap = (name: string) => {
		let c = caps.get(name);
		if (!c) {
			const o = node(name);
			c = {
				o,
				rest: o.position.clone(),
				axis: new THREE.Vector3(0, 1, 0).applyQuaternion(o.quaternion)
			};
			caps.set(name, c);
		}
		return c;
	};
	const A = 'P1_Btn10'; // front row, next to the stick
	const press = (name: string, depth: number) => {
		const c = cap(name);
		c.o.position.copy(c.rest).addScaledVector(c.axis, -0.0045 * depth); // metres, glb space
	};

	// --- card reader + its LED
	const face = node('CardReaderFace');
	const faceQ = face.getWorldQuaternion(new THREE.Quaternion());
	const readerPos = world(face);
	const readerOut = new THREE.Vector3(0, 1, 0).applyQuaternion(faceQ);
	const readerUp = new THREE.Vector3(0, 0, -1).applyQuaternion(faceQ);
	const readerRight = new THREE.Vector3().crossVectors(readerUp, readerOut);
	const led = (node('CardReaderLED') as THREE.Mesh).material as THREE.MeshStandardMaterial;
	const ledIdle = led.emissive.clone();
	const ledOk = new THREE.Color('#25d07a');

	const card = buildCard();
	card.quaternion.setFromRotationMatrix(
		new THREE.Matrix4().makeBasis(readerRight, readerUp, readerOut)
	);
	card.visible = false;
	pivot.add(card);
	const cardMat = card.material as THREE.MeshStandardMaterial;

	/** card flies in, rests on the reader, leaves. Returns true while touching. */
	const tapCard = (t: number, t0: number) => {
		const u = t - t0;
		const IN = 0.8,
			HOLD = 0.9,
			OUT = 0.7;
		if (u < -0.05 || u > IN + HOLD + OUT) {
			card.visible = false;
			return false;
		}
		card.visible = true;
		let k: number; // 1 = far out, 0 = on the glass
		if (u < IN) k = 1 - smooth(u / IN);
		else if (u < IN + HOLD) k = 0;
		else k = smooth((u - IN - HOLD) / OUT);
		cardMat.opacity = clamp01(Math.min(u / 0.2, (IN + HOLD + OUT - u) / 0.2));
		card.position
			.copy(readerPos)
			.addScaledVector(readerOut, 0.9 + 30 * k)
			.addScaledVector(readerRight, 9 * k)
			.addScaledVector(readerUp, -6 * k);
		return u >= IN - 0.05 && u < IN + HOLD + 0.15;
	};

	// --- the person, standing at player 1's controls
	const bat = node('P1_Stick_Bat');
	const stickTop = world(bat);
	const aTop = world(node(A));
	const deckNormal = new THREE.Vector3(0, 1, 0).applyQuaternion(
		washer.getWorldQuaternion(new THREE.Quaternion())
	);
	const frontZ = world(node('P1_Start0')).z;
	const stand = new THREE.Vector3((stickTop.x + aTop.x) / 2, 0, frontZ + 30);
	const start = stand.clone().add(new THREE.Vector3(250, 0, 120)); // in from the side, not past the camera
	const walkDir = stand.clone().sub(start);
	const walkLen = walkDir.length();
	walkDir.normalize();
	const walkYaw = Math.atan2(-walkDir.x, -walkDir.z);

	const person = buildPerson();
	person.root.visible = false;
	pivot.add(person.root);
	let personAlpha = 0;
	let personWant = 0;

	const shoulderL = new THREE.Vector3(-SHOULDER_X, SHOULDER_Y, 0);
	const shoulderR = new THREE.Vector3(SHOULDER_X, SHOULDER_Y, 0);
	const qa = new THREE.Quaternion();
	const qb = new THREE.Quaternion();
	const eul = new THREE.Euler();

	const WALK = 3.4,
		TURN = 0.6,
		REACH = 0.8,
		PRESS = 5.0;

	const posePerson = (t: number) => {
		const p = person;
		// walking along the path, slowing into the stop
		const s = smooth(t / WALK);
		const speed = t < WALK ? (6 * (t / WALK) * (1 - t / WALK)) / 1.5 : 0; // 0..1
		const amp = clamp01(speed);
		const w = ((s * walkLen) / 120) * Math.PI * 2; // one full stride per 120 cm
		p.root.position.copy(start).addScaledVector(walkDir, s * walkLen);
		const turn = smooth((t - WALK) / TURN);
		p.root.rotation.y = walkYaw * (1 - turn);
		p.hips.position.y = 95 - amp * 1.6 * Math.cos(2 * w);

		p.legL.joint.rotation.x = amp * 0.45 * Math.sin(w);
		p.legR.joint.rotation.x = -amp * 0.45 * Math.sin(w);
		p.legL.mid.rotation.x = -amp * (0.1 + 0.55 * Math.max(0, Math.cos(w)));
		p.legR.mid.rotation.x = -amp * (0.1 + 0.55 * Math.max(0, -Math.cos(w)));

		// arms: walking swing, blending into the reach for stick + button
		const r = smooth((t - WALK - TURN * 0.5) / REACH);
		p.root.updateMatrixWorld(true);
		const dip = pulse(t, PRESS - 0.05, 0.3) * 1.2;
		const tl = p.root.worldToLocal(stickTop.clone().addScaledVector(deckNormal, 3.5));
		const tr = p.root.worldToLocal(aTop.clone().addScaledVector(deckNormal, 2.5 - dip));
		const [l1, l2] = reach(shoulderL, tl);
		const [r1, r2] = reach(shoulderR, tr);
		const swing = amp * 0.35 * Math.sin(w);
		const set = (limb: Limb, swingX: number, ik1: THREE.Quaternion, ik2: THREE.Quaternion) => {
			qa.setFromEuler(eul.set(swingX, 0, 0));
			limb.joint.quaternion.slerpQuaternions(qa, ik1, r);
			qb.setFromEuler(eul.set(Math.abs(swingX) * 0.5 + 0.1, 0, 0));
			limb.mid.quaternion.slerpQuaternions(qb, ik2, r);
		};
		set(p.armL, -swing, l1, l2);
		set(p.armR, swing, r1, r2);
	};

	// --- shots (target + where the camera sits relative to it)
	const screenC = world(node('Screen'));
	const deckC = stickTop.clone().lerp(aTop, 0.5);
	deckC.x *= 0.5; // pull toward the middle so both players' sides read
	const at = (
		target: THREE.Vector3,
		dir: [number, number, number],
		dist: number,
		// what to centre on when the frame is narrower than it is tall
		portrait: THREE.Vector3 = target
	) => {
		const d = new THREE.Vector3(...dir).normalize();
		return (aspect: number): Shot => {
			const tall = aspect < 1;
			// narrow frames need to back off to fit the width
			const k = aspect < 1.2 ? Math.pow(1.2 / aspect, 0.7) : 1;
			const aim = (tall ? portrait : target).clone();
			return { target: aim, pos: aim.clone().addScaledVector(d, dist * k) };
		};
	};
	const controlsShot = deckC.clone().lerp(screenC, 0.45).add(new THREE.Vector3(0, -8, 0));
	const readerShot = readerPos.clone().lerp(screenC, 0.15).add(new THREE.Vector3(0, -6, 0));
	const extendShot = controlsShot.clone().lerp(readerPos, 0.35);

	// --- the steps, in the order of strings.session.steps. Read together they
	// are one unbroken session on the screen: every step plays once, slowly
	// (the camera spends its first ~1.4 s flying in), and ends on exactly the
	// screen the next one starts from.
	/** a stick move or button press peaking at `at` seconds */
	const hit = (t: number, at: number, d = 0.6) => pulse(t, at - d / 2, d);
	const PICKED = { game: 2, tier: 1 }; // BRAWLHALLA, 20 MIN

	const steps: StepDef[] = [
		{
			// walk up: attract mode, then any button wakes it
			duration: 8.5,
			events: [
				[0, { phase: 'attract', cursor: -1 }],
				[PRESS + 0.05, { phase: 'game', cursor: 0 }]
			],
			run: (t) => {
				posePerson(t);
				press(A, hit(t, PRESS, 0.3));
			},
			shot: at(new THREE.Vector3(30, 88, 70), [-0.55, 0.3, 1], 560, new THREE.Vector3(12, 95, 40))
		},
		{
			// pick your game: right, down, left, select
			duration: 9,
			events: [
				[0, { phase: 'game', cursor: 0 }],
				[2.0, { phase: 'game', cursor: 1 }],
				[3.6, { phase: 'game', cursor: 3 }],
				[5.2, { phase: 'game', cursor: 2 }],
				[6.9, { phase: 'tiers', cursor: 0, game: PICKED.game }]
			],
			run: (t) => {
				tiltStick(hit(t, 2.0) - hit(t, 5.2), -hit(t, 3.6));
				press(A, hit(t, 6.85, 0.3));
			},
			shot: at(controlsShot, [-0.2, 0.42, 1], 205)
		},
		{
			// pick your time: right onto the 20 min tier, select
			duration: 7.5,
			events: [
				[0, { phase: 'tiers', cursor: 0, game: PICKED.game }],
				[2.0, { phase: 'tiers', cursor: 1 }],
				[3.9, { phase: 'pay', cursor: -1, tier: PICKED.tier }]
			],
			run: (t) => {
				tiltStick(hit(t, 2.0), 0);
				press(A, hit(t, 3.85, 0.3));
			},
			shot: at(controlsShot, [0.12, 0.45, 1], 205)
		},
		{
			// tap your card: reader goes green, 3-2-1, playing -- and the
			// clock is left nearly empty so it runs out into the next step
			duration: 10,
			events: [
				[0, { phase: 'pay', cursor: -1, ...PICKED }],
				[2.25, { phase: 'countdown', count: 3 }],
				[6.4, { phase: 'running', remaining: 3, ...PICKED }]
			],
			run: (t) => {
				const touching = tapCard(t, 1.5);
				led.emissive.copy(touching ? ledOk : ledIdle);
			},
			shot: at(readerShot, [0.38, 0.16, 1], 165, readerPos.clone().lerp(screenC, 0.05))
		},
		{
			// run out? extend: pick +10 with the stick, pay for it with a tap
			// of the card, back in the game where it froze
			duration: 12,
			events: [
				[0, { phase: 'extend', cursor: 0, grace: 10, remaining: 0, ...PICKED }],
				[2.4, { phase: 'extend', cursor: 1 }],
				[4.3, { phase: 'pay', cursor: -1 }],
				[7.25, { phase: 'running', remaining: 10 }]
			],
			run: (t) => {
				tiltStick(hit(t, 2.4), 0);
				press(A, hit(t, 4.25, 0.3));
				const touching = tapCard(t, 6.5);
				led.emissive.copy(touching ? ledOk : ledIdle);
			},
			// wide enough for the stick, the screen and the reader at once
			shot: at(extendShot, [0.22, 0.34, 1], 250, readerPos.clone().lerp(screenC, 0.4))
		}
	];

	// ---------------------------------------------------------------- runner
	let current = -1;
	let t = 0;
	let fired = 0;

	const rest = () => {
		tiltStick(0, 0);
		for (const c of caps.values()) c.o.position.copy(c.rest);
		card.visible = false;
		led.emissive.copy(ledIdle);
	};

	return {
		steps: steps.length,
		duration: (i) => steps[i].duration,
		get time() {
			return t;
		},
		shot: (i, aspect) => steps[i].shot(aspect),
		enter(i) {
			current = i;
			t = 0;
			fired = 0;
			rest();
			personWant = i === 0 ? 1 : 0;
			if (i === 0) {
				personAlpha = 1;
				posePerson(0);
			}
		},
		update(dt) {
			// the person only exists for the walk-up; elsewhere it fades away
			personAlpha += (personWant - personAlpha) * clamp01(dt * 4);
			person.mat.opacity = personAlpha;
			person.root.visible = personAlpha > 0.01;
			if (current < 0) return;

			const s = steps[current];
			t += dt;
			while (fired < s.events.length && s.events[fired][0] <= t) send(s.events[fired++][1]);
			s.run(t);
		},
		leave() {
			current = -1;
			personWant = 0;
			rest();
			send({ release: true });
		}
	};
}
