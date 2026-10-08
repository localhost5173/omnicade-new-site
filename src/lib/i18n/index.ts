// All site copy, in both languages, typed as one Strings shape so a
// missing translation is a compile error. Components read their locale
// from context (set by the root layout from the hook's decision) and
// pull their strings from here.
import { getContext, setContext } from 'svelte';

export type Locale = 'sv' | 'en';

export interface SessionStep {
	title: string;
	body: string;
}

export interface Stat {
	n: string;
	label: string;
}

export interface Strings {
	htmlLang: Locale;
	title: string;
	ogDescription: string;
	hero: {
		eyebrow: string;
		headlineTop: string;
		headlineGold: string;
		ledeTop: string;
		ledeStrong: string;
		ledeRest: string;
		cta: string;
		stats: Stat[];
		legalTop: string;
		legalStrong: string;
		legalRest: string;
	};
	session: {
		eyebrow: string;
		title: string;
		titleGold: string;
		lede: string;
		steps: SessionStep[];
	};
	demo: {
		chromeTitle: string;
		attractPrompt: string;
		attractHint: string;
		pickGame: string;
		pickTime: string;
		tapCard: string;
		payHint: string;
		nowPlaying: string;
		sessionTime: string;
		runningHint: string;
		lowTime: string;
		paused: string;
		extendHint: (grace: number) => string;
		walkAway: string;
		over: string;
		timeSaved: string;
		overHint: string;
		restart: string;
		phases: Record<'ATTRACT' | 'GAME' | 'TIERS' | 'PAY' | 'COUNTDOWN' | 'RUNNING' | 'EXTEND' | 'OVER', string>;
	};
	footer: {
		tagline: string;
		links: [string, string][];
	};
	forms: {
		eyebrow: string;
		submit: string;
		submitting: string;
		fillIn: (label: string) => string;
		answerQuestion: (label: string) => string;
		maxChoices: (n: number) => string;
		badEmail: string;
		badNumber: string;
		submitFailed: string;
	};
	formPages: {
		fragor: { title: string; description: string; thanksBody: string };
		'for-foretag': { title: string; description: string; thanksBody: string };
	};
}

const sv: Strings = {
	htmlLang: 'sv',
	title: 'Omnicade: Arkadmaskinen som kör Steam',
	ogDescription: 'Riktiga Steam-spel bakom en enda lysande skärm. Kortbetalning, sparade sessioner, dra och spela.',
	hero: {
		eyebrow: 'Arkadmaskinsföretaget',
		headlineTop: 'RIKTIGA STEAM-SPEL.',
		headlineGold: 'EN MASKIN.',
		ledeTop: 'Omnicade bygger arkadmaskiner runt dagens ',
		ledeStrong: 'största Steam-titlar',
		ledeRest: ', förladdade och väntande bakom en enda lysande skärm. Dra kort, välj tid, spela.',
		cta: 'Så fungerar en session',
		stats: [
			{ n: '5s', label: 'från kortdrag till spel' },
			{ n: '0', label: 'personal som behövs' }
		],
		legalTop: '✓ Alla titlar på maskinen är ',
		legalStrong: 'kommersiellt licensierade',
		legalRest: ', så att ta betalt för spelande är helt lagligt.'
	},
	session: {
		eyebrow: 'Från kortdrag till krediter',
		title: 'EN SESSION,',
		titleGold: 'BILD FÖR BILD',
		lede: 'Det här är exakt det flöde varje Omnicade kör. Demon ovan spelar i sekunder, den riktiga maskinen i minuter.',
		steps: [
			{
				title: 'Kom gående',
				body: 'Maskinen står i attract mode och spelar riktig spelvideo på den lysande skylten. Vilken knapp som helst väcker den.'
			},
			{
				title: 'Välj spel',
				body: 'Alla Steam-titlar som maskinen har, i en lista. Välj en så startar den i bakgrunden medan du löser betalningen.'
			},
			{
				title: 'Välj tid',
				body: 'Tio, tjugo, trettio, sextio minuter. Priserna på skärmen, inga överraskningar.'
			},
			{
				title: 'Dra kortet',
				body: 'Läsaren sköter resten. En snabb 3, 2, 1 så är du i spelet, med sessionstiden svävande i hörnet.'
			},
			{
				title: 'Tiden slut? Utöka.',
				body: 'Vid noll fryser spelet mitt i bilden och ett lägg-till-tid-kort visas. Välj mer tid så fortsätter du exakt där du stod.'
			},
			{
				title: 'Gå tryggt därifrån',
				body: 'Lämna du tidigt sparas resten av tiden på ditt kort. Gå upp till vilken Omnicade som helst, dra, och fortsätt.'
			}
		]
	},
	demo: {
		chromeTitle: 'OMNICADE · LIVE-DEMO',
		attractPrompt: 'TRYCK PÅ NÅGON KNAPP FÖR ATT SPELA',
		attractHint: 'det här fönstret räknas som en knapp',
		pickGame: 'VÄLJ SPEL',
		pickTime: 'VÄLJ TID',
		tapCard: 'DRA KORTET',
		payHint: "väntar på betalservern… (godkänner automatiskt, som maskinens testläge)",
		nowPlaying: 'SPELAR NU',
		sessionTime: 'SESSIONSTID',
		runningHint: 'den riktiga maskinen låter den här timern sväva över det levande spelet, i hörnet',
		lowTime: '⚠ LÅG TID · DRA KORTET FÖR MER',
		paused: 'SPEL PAUSAT, MITT I BILDEN',
		extendHint: (grace) => `erbjudandet gäller i <b>${grace}s</b> till · inget svar? tiden är <b>sparad på ditt kort</b>`,
		walkAway: 'gå därifrån (spara tiden)',
		over: 'SESSIONEN SLUT',
		timeSaved: 'TID SPARAD ✓',
		overHint: 'din resterande tid ligger på kortet, dra på valfri Omnicade för att fortsätta',
		restart: '↺ starta om demon',
		phases: {
			ATTRACT: 'ATTRAKT',
			GAME: 'SPELVAL',
			TIERS: 'TID',
			PAY: 'BETALA',
			COUNTDOWN: 'NEDRÄKNING',
			RUNNING: 'SPELAR',
			EXTEND: 'UTÖKA',
			OVER: 'SLUT'
		}
	},
	footer: {
		tagline: 'Arkadmaskiner som kör riktiga Steam-spel.',
		links: [
			['Sessionen', '#session'],
			['Dina minuter', '/account'],
			['Svara på enkäten', '/fragor'],
			['För verksamheter', '/for-foretag']
		]
	},
	forms: {
		eyebrow: 'OMNICADE-ENKÄT',
		submit: 'Skicka in',
		submitting: 'Skickar…',
		fillIn: (label) => `Fyll i: ${label}`,
		answerQuestion: (label) => `Svara på frågan: ${label}`,
		maxChoices: (n) => `Välj högst ${n} alternativ.`,
		badEmail: 'E-postadressen ser inte ut som en e-postadress.',
		badNumber: 'Ange beloppet i hela kronor, t.ex. 40.',
		submitFailed: 'Något gick fel. Försök igen.'
	},
	formPages: {
		fragor: {
			title: 'Omnicades spelarenkät',
			description: 'Kort enkät om spelvanor och vad du tänker om Omnicade-konceptet.',
			thanksBody: 'Dina svar är sparade. Hör av dig till beni@omnicade.se om det är något du vill lägga till.'
		},
		'for-foretag': {
			title: 'Omnicade för verksamheter',
			description: 'Kort enkät för verksamheter som överväger en spelstation från Omnicade.',
			thanksBody: 'Vi har dina uppgifter och hör av oss inom kort. Ser du fel i dem? Skriv till beni@omnicade.se.'
		}
	}
};

const en: Strings = {
	htmlLang: 'en',
	title: 'Omnicade: The Steam arcade machine',
	ogDescription: 'Real Steam games behind one glowing screen. Card payments, saved sessions, tap and play.',
	hero: {
		eyebrow: 'The arcade machine company',
		headlineTop: 'REAL STEAM GAMES.',
		headlineGold: 'ONE CABINET.',
		ledeTop: 'Omnicade builds arcade machines around today’s ',
		ledeStrong: 'biggest Steam titles',
		ledeRest: ', pre-launched and waiting behind a single glowing screen. Tap a card, pick your time, play.',
		cta: 'How a session works',
		stats: [
			{ n: '5s', label: 'from tap card to playing' },
			{ n: '0', label: 'attendants needed' }
		],
		legalTop: '✓ Every title on the cabinet is ',
		legalStrong: 'commercially licensed',
		legalRest: ', so charging for play is fully legal.'
	},
	session: {
		eyebrow: 'From tap to credits',
		title: 'A SESSION,',
		titleGold: 'FRAME BY FRAME',
		lede: 'This is the exact flow every Omnicade runs. The demo above plays at seconds, the real cabinet at minutes.',
		steps: [
			{
				title: 'Walk up',
				body: 'The cabinet sits in attract mode, playing real game footage on the glowing marquee. Any button wakes it.'
			},
			{
				title: 'Pick your game',
				body: 'Every Steam title the cabinet carries, on one list. Choose one and it launches behind the scenes while you sort out payment.'
			},
			{
				title: 'Pick your time',
				body: 'Ten, twenty, thirty, sixty minutes. Prices on the screen, no surprises.'
			},
			{
				title: 'Tap your card',
				body: 'The reader does the rest. A quick 3, 2, 1 and you are in the game, with the session timer floating in the corner.'
			},
			{
				title: 'Run out? Extend.',
				body: 'At zero the game freezes mid-frame and an add-time card appears over it. Choose more time and you resume exactly where you stood.'
			},
			{
				title: 'Walk away safe',
				body: 'Leave early and your remaining time is saved to your card. Walk up to any Omnicade, tap, and continue.'
			}
		]
	},
	demo: {
		chromeTitle: 'OMNICADE · LIVE DEMO',
		attractPrompt: 'TAP ANY BUTTON TO PLAY',
		attractHint: 'this window counts as a button',
		pickGame: 'PICK YOUR GAME',
		pickTime: 'PICK YOUR TIME',
		tapCard: 'TAP CARD',
		payHint: "waiting for the payment server… (auto-approves, like the cabinet's test mode)",
		nowPlaying: 'NOW PLAYING',
		sessionTime: 'SESSION TIME',
		runningHint: 'the real cabinet floats this timer over the live game, in the corner',
		lowTime: '⚠ LOW TIME · TAP CARD TO ADD MORE',
		paused: 'GAME PAUSED, MID-FRAME',
		extendHint: (grace) => `the offer stands for <b>${grace}s</b> · nothing? your time is <b>saved to your card</b>`,
		walkAway: 'walk away (save time)',
		over: 'SESSION OVER',
		timeSaved: 'TIME SAVED ✓',
		overHint: 'your remaining time is on your card, tap any Omnicade to continue',
		restart: '↺ restart demo',
		phases: {
			ATTRACT: 'ATTRACT',
			GAME: 'GAME',
			TIERS: 'TIME',
			PAY: 'PAY',
			COUNTDOWN: 'COUNTDOWN',
			RUNNING: 'PLAYING',
			EXTEND: 'EXTEND',
			OVER: 'OVER'
		}
	},
	footer: {
		tagline: 'Arcade machines that run real Steam games.',
		links: [
			['The session', '#session'],
			['Your minutes', '/account'],
			['Take the survey', '/fragor'],
			['For businesses', '/for-foretag']
		]
	},
	forms: {
		eyebrow: 'OMNICADE SURVEY',
		submit: 'Submit',
		submitting: 'Sending…',
		fillIn: (label) => `Please fill in: ${label}`,
		answerQuestion: (label) => `Please answer: ${label}`,
		maxChoices: (n) => `Pick at most ${n} options.`,
		badEmail: 'That email address does not look like an email address.',
		badNumber: 'Enter the amount in whole kronor, e.g. 40.',
		submitFailed: 'Something went wrong. Try again.'
	},
	formPages: {
		fragor: {
			title: 'Omnicade player survey',
			description: 'A short survey about gaming habits and what you think of the Omnicade concept.',
			thanksBody: 'Your answers are saved. Mail beni@omnicade.se if there is anything you want to add.'
		},
		'for-foretag': {
			title: 'Omnicade for businesses',
			description: 'A short survey for venues considering a self-operated gaming station.',
			thanksBody: 'We have your details and will get back to you shortly. Anything wrong? Write beni@omnicade.se.'
		}
	}
};

export const strings: Record<Locale, Strings> = { sv, en };

const localeKey = 'locale';

/** Reads the locale the root layout put into context. Components only. */
export function getLocale(): Locale {
	return getContext<Locale>(localeKey);
}

export function setLocaleContext(value: Locale): void {
	setContext(localeKey, value);
}
