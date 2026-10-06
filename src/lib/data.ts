// Site content. Everything here is sourced from the real Omnicade trees:
//   - tiers/topups:      omnicade-steam-engine/data/pricing.json
//   - palette:           omnicade-steam-engine/data/theme.json
//   - session flow:      omnicade-steam-engine/README.md
//   - platform claims:   omnicade-api (game sync, Steam)
//   - hardware/ops:      omnicade-os/README.md

export interface Tier {
	minutes: number;
	price: number;
	currency: string;
	/** informational only; SessionDemo computes its own figures */
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

export interface SessionStep {
	n: string;
	title: string;
	body: string;
}

export interface Stat {
	n: string;
	label: string;
}

// consumed only by SessionDemo: the cabinet's real tiers, at demo speed
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

export const sessionSteps: SessionStep[] = [
	{
		n: '01',
		title: 'Walk up',
		body: 'The cabinet sits in attract mode, playing real game footage on a glowing marquee. Any button wakes it.'
	},
	{
		n: '02',
		title: 'Pick your game',
		body: 'Every Steam title the cabinet carries, on one carousel. Choose one and it launches behind the scenes while you sort out payment.'
	},
	{
		n: '03',
		title: 'Pick your time',
		body: 'Ten, twenty, thirty, sixty minutes. Prices on the screen, no surprises.'
	},
	{
		n: '04',
		title: 'Tap your card',
		body: 'The reader does the rest. A quick 3, 2, 1 and you are in the game, with the session timer floating in the corner.'
	},
	{
		n: '05',
		title: 'Run out? Extend.',
		body: 'At zero the game freezes mid-frame and an add-time card appears over it. Choose more time and you resume exactly where you stood.'
	},
	{
		n: '06',
		title: 'Walk away safe',
		body: 'Leave early and your remaining time is saved to your card. Walk up to any Omnicade, tap, and continue.'
	}
];

export const stats: Stat[] = [
	{ n: '5s', label: 'from tap card to playing' },
	{ n: '0', label: 'attendants needed' }
];

export const navLinks: [string, string][] = [
	['The session', '#session'],
	['Your minutes', '/account']
];
