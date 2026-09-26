// Site content. Everything here is sourced from the real Omnicade trees:
//   - tiers/topups:      omnicade-steam-engine/data/pricing.json
//   - palette:           omnicade-steam-engine/data/theme.json
//   - session flow:      omnicade-steam-engine/README.md
//   - platform claims:   omnicade-engine (libretro), omnicade-api (game sync)
//   - hardware/ops:      omnicade-os/README.md

export interface GameSource {
	name: string;
	tag: string;
	blurb: string;
	games: string[];
}

export interface Tier {
	minutes: number;
	price: number;
	currency: string;
	/** informational only — Pricing computes its own per-minute figure */
	perMin?: number;
	badge?: string;
	badgeClass?: 'gold' | 'ok';
	default?: boolean;
}

export interface Topup {
	minutes: number;
	price: number;
	currency: string;
}

export type MachineAccent = 'ok' | 'gold' | 'blue';

export interface Machine {
	id: string;
	name: string;
	tagline: string;
	price: string;
	desc: string;
	features: string[];
	accent: MachineAccent;
	hero?: boolean;
}

export interface SessionStep {
	n: string;
	title: string;
	body: string;
}

export interface TechRow {
	k: string;
	v: string;
	tag: string;
}

export interface OperatorFeature {
	title: string;
	body: string;
	icon: string;
}

export interface Stat {
	n: string;
	label: string;
}

export const games: Record<'retro' | 'modern' | 'indie', GameSource> = {
	retro: {
		name: 'Retro',
		tag: '200+ libretro cores',
		blurb:
			'Every console, handheld and arcade board that matters — from Atari and the NES to the Dreamcast era — through the battle-tested libretro ecosystem.',
		games: ['Pac-Man', 'Sonic', 'Street Fighter II', 'Metal Slug', 'Mario Kart', 'Mortal Kombat']
	},
	modern: {
		name: 'Modern AAA',
		tag: 'Steam, pre-launched',
		blurb:
			'Full PC titles through Steam. The machine boots the game before anyone pays and parks it on the right menu, so a session starts at the fight — not at a loading screen.',
		games: ['Street Fighter 6', 'Tekken 8', 'Guilty Gear Strive', 'Rocket League']
	},
	indie: {
		name: 'Your games',
		tag: 'Any executable',
		blurb:
			'Ship your own builds to the fleet: any Linux executable or ROM, priced per cabinet, synced over the API. Your game on an arcade cabinet, on every corner.',
		games: ['Indie fighters', 'Rhythm games', 'Local multiplayer', 'Your build here']
	}
};

export const tiers: Tier[] = [
	{ minutes: 10, price: 25, currency: 'kr', perMin: 2.5 },
	{ minutes: 20, price: 45, currency: 'kr', badge: 'MOST POPULAR', badgeClass: 'gold', default: true },
	{ minutes: 30, price: 60, currency: 'kr' },
	{ minutes: 60, price: 100, currency: 'kr', badge: 'BEST VALUE', badgeClass: 'ok' }
];

export const topups: Topup[] = [
	{ minutes: 5, price: 18, currency: 'kr' },
	{ minutes: 10, price: 30, currency: 'kr' },
	{ minutes: 20, price: 50, currency: 'kr' }
];

export const machines: Machine[] = [
	{
		id: 'omnicade-s',
		name: 'OMNICADE S',
		tagline: 'The classic reimagined',
		price: 'from 1 cabinet',
		desc: 'Retro-first cabinet. A Raspberry Pi 5-class brain drives 200+ emulator cores in a full-size cabinet with dual arcade panels.',
		features: ['200+ emulator cores', 'Dual arcade panels', 'Card payments', 'Attract mode'],
		accent: 'ok'
	},
	{
		id: 'omnicade-x',
		name: 'OMNICADE X',
		tagline: 'Anything it can run, it runs',
		price: 'the flagship',
		desc: 'A modern gaming PC in a cabinet: Ryzen-class power and a real GPU, running everything the S does plus full Steam titles at 60fps.',
		features: [
			'Retro + Steam AAA',
			'Dual arcade panels',
			'Player screen + nav head',
			'Silent until paid'
		],
		accent: 'gold',
		hero: true
	},
	{
		id: 'omnicade-duo',
		name: 'OMNICADE DUO',
		tagline: 'Two seats, one cabinet',
		price: 'head to head',
		desc: 'Versus fighting, side by side. Two full panels, one giant screen, and a session system that splits time fairly between players.',
		features: ['2-player panels', 'Versus-ready', 'Card payments', 'Saved sessions'],
		accent: 'blue'
	}
];

export const sessionSteps: SessionStep[] = [
	{
		n: '01',
		title: 'Walk up',
		body: 'The cabinet plays an attract loop of real game footage on a glowing marquee. Tap your card to wake it.'
	},
	{
		n: '02',
		title: 'Pick your time',
		body: 'Ten, twenty, thirty, sixty minutes. Prices on the screen, no surprises. The card reader handles the rest.'
	},
	{
		n: '03',
		title: '3 — 2 — 1 — FIGHT',
		body: 'The game is already running behind the scenes. Your countdown lands you straight into the action, with the session timer floating in the corner.'
	},
	{
		n: '04',
		title: 'Run out? Extend.',
		body: 'At zero the game freezes mid-frame and an add-time card appears over it. Choose more time and you resume exactly where you stood.'
	},
	{
		n: '05',
		title: 'Walk away safe',
		body: 'Leave early and your remaining time is saved to your card — walk up to any Omnicade, tap, and continue.'
	}
];

export const techRows: TechRow[] = [
	{
		k: 'The navigator',
		v: 'A computer-vision system watches the game screen and drives its menus like a player — so the next customer always finds the game exactly where it should be, even mid-match.',
		tag: 'IMAGE MATCHING'
	},
	{
		k: 'The guard',
		v: 'Kernel-level input filtering (HID-BPF) keeps players inside the paid game — back-outs get rate-limited or blocked at the USB report itself, without Steam ever noticing.',
		tag: 'HID-BPF'
	},
	{
		k: 'The watchdog',
		v: 'No input for half a minute? The player gets a clear on-screen warning, then the session ends and their time is saved. Idle customers never burn money.',
		tag: 'IDLE DETECTION'
	},
	{
		k: 'Silent parking',
		v: 'Games are frozen, buried and parked mid-menu between sessions. Boot to battle-ready takes minutes and happens invisibly, before anyone puts money in.',
		tag: 'PROCESS FREEZE'
	},
	{
		k: 'Self-healing kiosk',
		v: 'NixOS under the hood: atomic, reproducible system updates and services that restart themselves, with backoff. A wedged boot retries on its own and reports honestly.',
		tag: 'NIXOS'
	},
	{
		k: 'Sound of money',
		v: 'The cabinet is completely silent until it gets paid. Game audio, system sounds and even Steam bings are muted stream-by-stream, and unmute the instant a session starts.',
		tag: 'PIPEWIRE'
	}
];

export const operatorFeatures: OperatorFeature[] = [
	{
		title: 'Fleet dashboard',
		body: 'Register machines, push game lists, set per-cabinet pricing and watch the fleet from one web dashboard.',
		icon: '▤'
	},
	{
		title: 'Per-cabinet keys',
		body: 'Every machine authenticates with its own key, stored as a hash. Lose one, revoke it in seconds — no shared secrets, ever.',
		icon: '⚿'
	},
	{
		title: 'Payments that clear',
		body: 'Card payments flow through a central payment server with live websocket status — every tap tracked from card-present to completed.',
		icon: '▣'
	},
	{
		title: 'Atomic updates',
		body: 'One command rolls the whole OS + engine forward, reproducibly. Rollback is trivial because the system is code.',
		icon: '⟳'
	},
	{
		title: 'Revenue by the minute',
		body: 'Time tiers, top-ups and per-card balances are all in the data model — reconcile revenue against sessions automatically.',
		icon: '◈'
	},
	{
		title: 'Honest states',
		body: 'A cabinet that cannot start a session says so — "down, healing" — instead of spinning a paying customer into a dead screen.',
		icon: '◉'
	}
];

export const stats: Stat[] = [
	{ n: '200+', label: 'emulator cores' },
	{ n: '∞', label: 'games in one cabinet' },
	{ n: '60s', label: 'from card tap to combat' },
	{ n: '0', label: 'attendants needed' }
];

export const navLinks: [string, string][] = [
	['Games', '#games'],
	['Machines', '#machines'],
	['The session', '#session'],
	['Pricing', '#pricing'],
	['Operators', '#operators'],
	['Under the hood', '#tech']
];
