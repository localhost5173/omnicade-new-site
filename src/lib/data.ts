// Data sourced from the real Omnicade trees:
//   - tiers/topups:      omnicade-steam-engine/data/pricing.json
//   - palette:           omnicade-steam-engine/data/theme.json
//
// Site copy lives in src/lib/i18n (it is bilingual); this file is only
// what the cabinet's own data defines.

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
