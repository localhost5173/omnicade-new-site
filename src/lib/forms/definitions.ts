// The site's survey forms (originally recreated from tally.so/r/vGo1a8
// and tally.so/r/pb81g1, since reworked for launch). A form is data: the
// renderer in components/forms/FormQuestions.svelte turns a definition
// into the page, the server action in server.ts validates + files it
// with the api, and the dashboard reads the answers back as a JSON
// object keyed by these stable question keys.
//
// `key` is the storage key -- changing a label is free; changing a key
// orphans the old answers, so don't.
//
// Option VALUES are the canonical Swedish text and are what the api
// stores, regardless of the visitor's language -- so the dashboard sees
// one uniform vocabulary while English visitors read English labels.
// `showIf` matches against those canonical values for the same reason.

export type Locale = 'sv' | 'en';
export type L = { sv: string; en: string };

export interface FormOption {
	/** canonical stored value (the Swedish text) */
	value: string;
	label: L;
}

export interface ShowIf {
	key: string;
	/** canonical values that make the question visible; '*' = any non-empty answer */
	values: string[];
}

export interface FormQuestion {
	key: string;
	type: 'single' | 'multi' | 'scale' | 'text' | 'textarea' | 'email' | 'consent' | 'note';
	label: L;
	required?: boolean;
	options?: FormOption[];
	/** multi only: cap the picked options */
	maxChoices?: number;
	/** scale only */
	minLabel?: L;
	maxLabel?: L;
	placeholder?: L;
	/** text only: expect an amount, validated as a number (kr) */
	numeric?: boolean;
	/** visible while ANY clause matches; single answers match directly,
	 * multi answers match when any picked option is listed */
	showIf?: ShowIf | ShowIf[];
}

export interface FormDef {
	/** the api's form id (see omnicade-api form_handlers.go knownForms) */
	id: 'player-feedback' | 'business-partner';
	slug: string;
	title: L;
	intro: L;
	questions: FormQuestion[];
}

/** sv text is the canonical value; en is display-only */
const opts = (...entries: [string, string][]): FormOption[] =>
	entries.map(([value, en]) => ({ value, label: { sv: value, en } }));

export const playerFeedbackForm: FormDef = {
	id: 'player-feedback',
	slug: 'fragor',
	title: { sv: 'Omnicades spelarenkät', en: 'Omnicade player survey' },
	intro: {
		sv: 'Omnicade är en spelautomat som placeras på exempelvis restauranger, hotell och köpcentrum. Man betalar speltid med kort och spelar Steam-spel. Vi har en prototyp under utveckling och vill veta vad du tänker om konceptet. Enkäten tar ett par minuter.',
		en: 'Omnicade is a gaming cabinet placed at venues such as restaurants, hotels and shopping centres. Players pay for play time by card and play Steam games. We have a prototype in development and want your opinion on the concept. The survey takes a couple of minutes.'
	},
	questions: [
		{
			key: 'age',
			type: 'single',
			label: { sv: 'Hur gammal är du?', en: 'How old are you?' },
			required: true,
			options: opts(
				['Under 16', 'Under 16'],
				['16–18', '16–18'],
				['19–24', '19–24'],
				['25–34', '25–34'],
				['35–44', '35–44'],
				['45+', '45+'],
				['Vill inte ange', 'Prefer not to say']
			)
		},
		{
			key: 'play_frequency',
			type: 'single',
			label: { sv: 'Hur ofta spelar du digitala spel?', en: 'How often do you play video games?' },
			required: true,
			options: opts(
				['Varje dag', 'Every day'],
				['Flera gånger i veckan', 'Several times a week'],
				['Någon gång i veckan', 'About once a week'],
				['Någon gång i månaden', 'About once a month'],
				['Mer sällan', 'More rarely'],
				['Aldrig', 'Never']
			)
		},
		{
			key: 'genres',
			type: 'multi',
			label: {
				sv: 'Vilka typer av spel spelar du helst? (välj upp till 3)',
				en: 'What kinds of games do you prefer? (pick up to 3)'
			},
			maxChoices: 3,
			options: opts(
				['Party/multiplayer', 'Party/multiplayer'],
				['Fighting', 'Fighting'],
				['Racing', 'Racing'],
				['Sport', 'Sports'],
				['Action', 'Action'],
				['Indie', 'Indie'],
				['Retro', 'Retro'],
				['Plattform', 'Platformer'],
				['Strategi', 'Strategy'],
				['Annat', 'Other']
			)
		},
		{
			key: 'fighting_familiarity',
			type: 'single',
			label: {
				sv: 'Bekantskap med fighting games?',
				en: 'How familiar are you with fighting games?'
			},
			options: opts(
				['Aldrig spelat', 'Never played'],
				['Testat något fighting game', 'Tried one once or twice'],
				['Spelar ibland', 'Play sometimes'],
				['Spelar ofta', 'Play often']
			)
		},
		{
			key: 'last_arcade_visit',
			type: 'single',
			label: {
				sv: 'När besökte du senast en spelhall, bowling eller flipperlokal?',
				en: 'When did you last visit an arcade, bowling alley or pinball venue?'
			},
			options: opts(
				['Inom den senaste månaden', 'Within the last month'],
				['1–6 månader sedan', '1–6 months ago'],
				['6–12 månader sedan', '6–12 months ago'],
				['Mer än ett år sedan', 'More than a year ago'],
				['Aldrig', 'Never']
			)
		},
		{
			key: 'spend_when_out',
			type: 'single',
			label: {
				sv: 'Ungefär hur mycket lägger du på underhållning ute (spel, bowling, bio) per tillfälle?',
				en: 'Roughly how much do you spend on entertainment out (games, bowling, cinema) per occasion?'
			},
			options: opts(
				['0–100 kr', '0–100 SEK'],
				['100–250 kr', '100–250 SEK'],
				['250–500 kr', '250–500 SEK'],
				['Över 500 kr', 'Over 500 SEK'],
				['Det varierar för mycket', 'Varies too much']
			)
		},
		{
			key: 'waiting_habits',
			type: 'multi',
			label: {
				sv: 'Vad gör du vanligtvis medan du väntar på en plats? (välj alla som stämmer)',
				en: 'What do you usually do while waiting at a venue? (pick all that apply)'
			},
			options: opts(
				['Skrollar mobilen', 'Scrolling my phone'],
				['Pratar med mitt sällskap', 'Talking to my group'],
				['Tittar på något', 'Watching something'],
				['Läser eller jobbar', 'Reading or working'],
				['Gör inget särskilt', 'Nothing in particular'],
				['Annat', 'Other']
			)
		},
		{
			key: 'waiting_other',
			type: 'text',
			label: { sv: 'Något annat? Skriv fritt:', en: 'Something else? Write freely:' },
			showIf: { key: 'waiting_habits', values: ['Annat'] }
		},
		{
			key: 'demo_note_1',
			type: 'note',
			label: {
				sv: 'Så fungerar det: du hittar en Omnicade på en plats du besöker, betalar för speltid och spelar direkt, själv eller med andra.',
				en: 'How it works: you find an Omnicade at a place you visit, pay for play time and start playing right away, alone or with others.'
			}
		},
		{
			key: 'try_likelihood',
			type: 'scale',
			label: {
				sv: 'Om du såg en Omnicade på en plats du besökte, hur sannolikt är det att du skulle testa den? (1 = mycket osannolikt, 5 = mycket sannolikt)',
				en: 'If you saw an Omnicade at a place you visit, how likely are you to try it? (1 = very unlikely, 5 = very likely)'
			},
			required: true,
			minLabel: { sv: 'Mycket osannolikt', en: 'Very unlikely' },
			maxLabel: { sv: 'Mycket sannolikt', en: 'Very likely' }
		},
		{
			key: 'kiosk_comfort',
			type: 'scale',
			label: {
				sv: 'Hur bekväm skulle du vara med att spela på en Omnicade i en kiosk eller spelbutik?',
				en: 'How comfortable would you be playing an Omnicade in a kiosk or gaming shop?'
			},
			required: true,
			minLabel: { sv: 'Inte bekvämt alls', en: 'Not comfortable at all' },
			maxLabel: { sv: 'Helt okej', en: 'Totally fine' }
		},
		{
			key: 'venues',
			type: 'multi',
			label: {
				sv: 'Var skulle du helst vilja hitta en Omnicade? (välj upp till 3)',
				en: 'Where would you most want to find an Omnicade? (pick up to 3)'
			},
			required: true,
			maxChoices: 3,
			options: opts(
				['Restaurang', 'Restaurant'],
				['Bar', 'Bar'],
				['Hotell', 'Hotel'],
				['Köpcentrum', 'Shopping centre'],
				['Biograf', 'Cinema'],
				['Studentområde', 'Student area'],
				['Spelhall', 'Arcade hall'],
				['Kiosk/spelbutik', 'Kiosk/gaming shop'],
				['Event/festival', 'Event/festival'],
				['Flygplats/tågstation', 'Airport/train station'],
				['Ingenstans särskilt', 'Nowhere in particular'],
				['Annat', 'Other']
			)
		},
		{
			key: 'venues_other',
			type: 'text',
			label: { sv: 'Var då? Skriv fritt:', en: 'Where? Write freely:' },
			placeholder: {
				sv: 'T.ex. lasarettet, gymmet, tågstationen...',
				en: 'E.g. the hospital, the gym, the train station...'
			},
			showIf: { key: 'venues', values: ['Annat'] }
		},
		{
			key: 'session_note',
			type: 'note',
			label: {
				sv: 'En session är minst 10 minuter. Du väljer själv hur länge du spelar.',
				en: 'A session is at least 10 minutes. You choose how long you play.'
			}
		},
		{
			key: 'first_block',
			type: 'single',
			label: {
				sv: 'Vilket tidsblock skulle du köpa först?',
				en: 'Which time block would you buy first?'
			},
			required: true,
			options: opts(
				['10 minuter', '10 minutes'],
				['20 minuter', '20 minutes'],
				['30 minuter', '30 minutes'],
				['60 minuter', '60 minutes']
			)
		},
		{
			key: 'price_note',
			type: 'note',
			label: {
				sv: 'Fyra snabba prisfrågor om 20 minuters spelande, svara i kronor:',
				en: 'Four quick price questions about 20 minutes of play, answer in SEK:'
			}
		},
		{
			key: 'price_too_cheap',
			type: 'text',
			label: {
				sv: 'Vid vilket pris blir det så billigt att du misstänker att något är fel?',
				en: 'At what price would it be so cheap you would doubt the quality?'
			},
			required: true,
			numeric: true,
			placeholder: { sv: 'kr', en: 'SEK' }
		},
		{
			key: 'price_bargain',
			type: 'text',
			label: {
				sv: 'Vid vilket pris är det en riktig affär?',
				en: 'At what price is it a real bargain?'
			},
			required: true,
			numeric: true,
			placeholder: { sv: 'kr', en: 'SEK' }
		},
		{
			key: 'price_expensive',
			type: 'text',
			label: {
				sv: 'Vid vilket pris börjar det bli dyrt?',
				en: 'At what price does it start getting expensive?'
			},
			required: true,
			numeric: true,
			placeholder: { sv: 'kr', en: 'SEK' }
		},
		{
			key: 'price_too_expensive',
			type: 'text',
			label: {
				sv: 'Vid vilket pris är det så dyrt att du inte spelar?',
				en: 'At what price would it be so expensive you would not play?'
			},
			required: true,
			numeric: true,
			placeholder: { sv: 'kr', en: 'SEK' }
		},
		{
			key: 'payment_method',
			type: 'multi',
			label: {
				sv: 'Vilka betalsätt skulle du använda? (välj alla som passar)',
				en: 'Which payment methods would you use? (pick all that suit you)'
			},
			options: opts(
				['Kort', 'Card'],
				['Apple Pay', 'Apple Pay'],
				['Google Pay', 'Google Pay'],
				['Swish', 'Swish'],
				['Annat', 'Other']
			)
		},
		{
			key: 'blockers',
			type: 'multi',
			label: {
				sv: 'Vad skulle kunna få dig att INTE använda Omnicade? (välj alla som stämmer)',
				en: 'What could stop you from using an Omnicade? (pick all that apply)'
			},
			options: opts(
				['För dyrt', 'Too expensive'],
				['Spelen intresserar mig inte', 'The games do not interest me'],
				['Vill inte spela offentligt', 'Do not want to play in public'],
				['För mycket folk', 'Too many people'],
				['Vill inte vänta på min tur', 'Do not want to wait my turn'],
				['Oklart hur den fungerar', 'Unclear how it works'],
				['Krånglig betalning', 'Fiddly payment'],
				['Föredrar min egen enhet', 'Prefer my own device'],
				['Inget särskilt', 'Nothing in particular'],
				['Annat', 'Other']
			)
		},
		{
			key: 'ideas',
			type: 'textarea',
			label: {
				sv: 'Finns det något du skulle ändra eller förbättra? (frivilligt)',
				en: 'Is there anything you would change or improve? (optional)'
			},
			placeholder: { sv: 'Dela med dig av dina idéer eller funderingar...', en: 'Share your ideas or thoughts...' }
		},
		{
			key: 'city',
			type: 'text',
			label: { sv: 'Var bor du? (ort eller område, frivilligt)', en: 'Where do you live? (city or area, optional)' },
			placeholder: { sv: 'T.ex. Göteborg, Majorna...', en: 'E.g. Chicago, the north side...' }
		},
		{
			key: 'wants_test',
			type: 'single',
			label: {
				sv: 'Vill du få möjlighet att testa Omnicade när vi placerar ut stationer?',
				en: 'Do you want the chance to try an Omnicade when we place the first ones?'
			},
			required: true,
			options: opts(
				['Ja', 'Yes'],
				['Kanske', 'Maybe'],
				['Nej', 'No']
			)
		},
		{
			key: 'email',
			type: 'email',
			label: {
				sv: 'Lämna gärna din e-post så hör vi av oss när du kan testa (frivilligt)',
				en: 'Leave your email and we will reach out when you can try it (optional)'
			},
			placeholder: { sv: 'din.epost@exempel.se', en: 'you@example.com' },
			showIf: { key: 'wants_test', values: ['Ja', 'Kanske'] }
		},
		{
			key: 'consent',
			type: 'consent',
			label: {
				sv: 'Jag godkänner att Omnicade sparar min e-post för att kontakta mig om test. Jag kan när som helst be om att den raderas.',
				en: 'I consent to Omnicade storing my email to contact me about testing. I can ask for it to be deleted at any time.'
			},
			required: true,
			showIf: { key: 'wants_test', values: ['Ja', 'Kanske'] }
		}
	]
};

export const businessPartnerForm: FormDef = {
	id: 'business-partner',
	slug: 'for-foretag',
	title: { sv: 'Omnicade för verksamheter', en: 'Omnicade for businesses' },
	intro: {
		sv: 'Vi utvärderar en spelstation som vi själva placerar, äger och driver hos verksamheter som din. Ni står för platsen och får ersättning enligt avtal. Enkäten tar ungefär 3 minuter.',
		en: 'We are evaluating a gaming station that we place, own and operate at venues like yours. You provide the space and receive compensation per agreement. The survey takes about 3 minutes.'
	},
	questions: [
		{
			key: 'business_type',
			type: 'single',
			label: { sv: 'Vilken typ av verksamhet representerar du?', en: 'What kind of business do you represent?' },
			required: true,
			options: opts(
				['Restaurang', 'Restaurant'],
				['Bar', 'Bar'],
				['Hotell', 'Hotel'],
				['Köpcentrum', 'Shopping centre'],
				['Butik', 'Retail store'],
				['Kiosk/spelbutik/tobak', 'Kiosk/gaming shop/tobacconist'],
				['Studentboende', 'Student housing'],
				['Kontor', 'Office'],
				['Event', 'Events'],
				['Fastighetsägare', 'Property owner'],
				['Spel-/underhållningsverksamhet', 'Game/entertainment business'],
				['Annat', 'Other']
			)
		},
		{
			key: 'business_type_other',
			type: 'text',
			label: { sv: 'Vilken då? Skriv fritt:', en: 'Which one? Write freely:' },
			showIf: { key: 'business_type', values: ['Annat'] }
		},
		{
			key: 'role',
			type: 'single',
			label: { sv: 'Vilken roll har du?', en: 'What is your role?' },
			required: true,
			options: opts(
				['Ägare/VD', 'Owner/CEO'],
				['Platschef/driftansvarig', 'Site manager/operations'],
				['Marknad/event', 'Marketing/events'],
				['Anställd', 'Employee'],
				['Annat', 'Other']
			)
		},
		{
			key: 'role_other',
			type: 'text',
			label: { sv: 'Vilken roll då? Skriv fritt:', en: 'Which role? Write freely:' },
			showIf: { key: 'role', values: ['Annat'] }
		},
		{
			key: 'decision_maker',
			type: 'single',
			label: {
				sv: 'Vem skulle fatta beslutet om en sådan pilot?',
				en: 'Who would decide on a pilot like this?'
			},
			options: opts(
				['Jag själv', 'Me'],
				['Ägaren/huvudkontoret', 'The owner/head office'],
				['Fastighetsägaren', 'The property owner'],
				['Vet inte', 'Do not know'],
				['Annat', 'Other']
			)
		},
		{
			key: 'decision_maker_other',
			type: 'text',
			label: { sv: 'Vem då? Skriv fritt:', en: 'Who? Write freely:' },
			showIf: { key: 'decision_maker', values: ['Annat'] }
		},
		{
			key: 'daily_visitors',
			type: 'single',
			label: { sv: 'Ungefär hur många besökare har ni per dag?', en: 'Roughly how many visitors do you have per day?' },
			required: true,
			options: opts(
				['Färre än 50', 'Fewer than 50'],
				['50–100', '50–100'],
				['100–250', '100–250'],
				['250–500', '250–500'],
				['Fler än 500', 'More than 500'],
				['Vet inte', 'Do not know']
			)
		},
		{
			key: 'dwell_time',
			type: 'single',
			label: { sv: 'Hur lång tid stannar besökarna i genomsnitt?', en: 'How long do visitors typically stay?' },
			options: opts(
				['Under 15 minuter', 'Under 15 minutes'],
				['15–30 minuter', '15–30 minutes'],
				['30–60 minuter', '30–60 minutes'],
				['Över en timme', 'Over an hour'],
				['Varierar kraftigt', 'Varies a lot']
			)
		},
		{
			key: 'peak_hours',
			type: 'multi',
			label: { sv: 'När är ni som mest belagda? (välj alla)', en: 'When are you at your busiest? (pick all)' },
			options: opts(
				['Förmiddagar', 'Mornings'],
				['Eftermiddagar', 'Afternoons'],
				['Kvällar', 'Evenings'],
				['Helger', 'Weekends'],
				['Jämnt ut över veckan', 'Evenly across the week']
			)
		},
		{
			key: 'has_entertainment',
			type: 'single',
			label: {
				sv: 'Erbjuder ni idag någon underhållning eller aktivitet för era besökare?',
				en: 'Do you offer any entertainment or activities for your visitors today?'
			},
			required: true,
			options: opts(
				['Ja', 'Yes'],
				['Nej', 'No']
			)
		},
		{
			key: 'current_offerings',
			type: 'text',
			label: { sv: 'Vad erbjuder ni?', en: 'What do you offer?' },
			showIf: { key: 'has_entertainment', values: ['Ja'] }
		},
		{
			key: 'existing_machines',
			type: 'text',
			label: {
				sv: 'Vilka underhållningsmaskiner står i lokalen idag, om några? (frivilligt)',
				en: 'What amusement machines stand in your venue today, if any? (optional)'
			},
			placeholder: { sv: 'T.ex. fotbollsspel, flipper, biljard', en: 'E.g. foosball, pinball, pool tables' }
		},
		{
			key: 'revenue_share',
			type: 'single',
			label: {
				sv: 'Vilken andel av intäkterna från de maskinerna får ni?',
				en: 'What share of the revenue from those machines do you get?'
			},
			showIf: { key: 'existing_machines', values: ['*'] },
			options: opts(
				['Vi äger maskinerna själva', 'We own the machines ourselves'],
				['Under 20%', 'Under 20%'],
				['20–30%', '20–30%'],
				['Över 30%', 'Over 30%'],
				['Vet inte', 'Do not know']
			)
		},
		{
			key: 'model_note',
			type: 'note',
			label: {
				sv: 'Omnicade placeras, ägs och drivs av oss. Vi sköter teknik, spel, licenser, betalning, övervakning och service. Ni står för platsen och får ersättning enligt avtal.',
				en: 'Omnicade is placed, owned and operated by us. We handle technology, games, licenses, payments, monitoring and service. You provide the space and receive compensation per agreement.'
			}
		},
		{
			key: 'pilot_interest',
			type: 'scale',
			label: {
				sv: 'Hur intresserade skulle ni vara av att testa Omnicade hos er under en pilotperiod? (1 = inte alls, 5 = mycket)',
				en: 'How interested would you be in trying an Omnicade for a pilot period? (1 = not at all, 5 = very)'
			},
			required: true,
			minLabel: { sv: 'Inte alls intresserade', en: 'Not interested at all' },
			maxLabel: { sv: 'Mycket intresserade', en: 'Very interested' }
		},
		{
			key: 'ops_importance',
			type: 'scale',
			label: {
				sv: 'Hur viktigt är det att ni inte själva behöver sköta den dagliga driften?',
				en: 'How important is it that you do not have to handle the day-to-day operation?'
			},
			minLabel: { sv: 'Inte viktigt', en: 'Not important' },
			maxLabel: { sv: 'Avgörande', en: 'Decisive' }
		},
		{
			key: 'benefits',
			type: 'multi',
			label: {
				sv: 'Vilken nytta tror du att Omnicade skulle kunna ge er? (välj alla som stämmer)',
				en: 'What value do you think Omnicade could bring you? (pick all that apply)'
			},
			options: opts(
				['Något att göra för besökare', 'Something for visitors to do'],
				['Längre vistelsetid', 'Longer visit duration'],
				['Mer aktivitet i lokalen', 'More activity in the venue'],
				['Nya målgrupper', 'New audiences'],
				['Merförsäljning', 'Additional sales'],
				['Differentiering', 'Differentiation'],
				['Event', 'Events'],
				['Ingen tydlig nytta', 'No clear benefit'],
				['Annat', 'Other']
			)
		},
		{
			key: 'placement',
			type: 'text',
			label: {
				sv: 'Var i lokalen skulle en Omnicade kunna stå? (frivilligt)',
				en: 'Where in your venue could an Omnicade stand? (optional)'
			},
			placeholder: { sv: 'T.ex. vid entrén, i väntytan, nära baren', en: 'E.g. by the entrance, in the waiting area, near the bar' }
		},
		{
			key: 'obstacles',
			type: 'multi',
			label: {
				sv: 'Vad skulle kunna göra det svårt att ha en Omnicade hos er? (välj alla som stämmer)',
				en: 'What could make it hard to have an Omnicade at your venue? (pick all that apply)'
			},
			options: opts(
				['Utrymme', 'Space'],
				['Ljudnivå', 'Noise level'],
				['El', 'Power'],
				['Internet', 'Internet'],
				['Skadegörelse', 'Vandalism'],
				['Säkerhet', 'Security'],
				['Kundflöde', 'Customer flow'],
				['Utseende/design', 'Looks/design'],
				['Underhåll', 'Maintenance'],
				['Administration', 'Administration'],
				['Regler/tillstånd', 'Regulations/permits'],
				['Inga särskilda hinder', 'No particular obstacles'],
				['Annat', 'Other']
			)
		},
		{
			key: 'cooperation_model',
			type: 'single',
			label: {
				sv: 'Vilken samarbetsmodell skulle vara mest intressant för er?',
				en: 'Which cooperation model would be most interesting for you?'
			},
			options: opts(
				['Intäktsdelning – ni får en andel av intäkterna', 'Revenue sharing – you get a share of the revenue'],
				['Fast ersättning för platsen', 'Fixed compensation for the space'],
				['Kombination av fast ersättning och intäktsdelning', 'A combination of fixed compensation and revenue sharing'],
				['Vill diskutera andra upplägg', 'Would like to discuss other arrangements'],
				['Vet inte', 'Do not know']
			)
		},
		{
			key: 'pilot_timeline',
			type: 'single',
			label: { sv: 'När skulle ni kunna starta en pilot?', en: 'When could you start a pilot?' },
			options: opts(
				['Omgående', 'Right away'],
				['Inom 3 månader', 'Within 3 months'],
				['Inom 6 månader', 'Within 6 months'],
				['Inom ett år', 'Within a year'],
				['Inte aktuell', 'Not on the table']
			)
		},
		{
			key: 'wants_contact',
			type: 'single',
			label: {
				sv: 'Vill du diskutera möjligheten att placera en Omnicade hos er?',
				en: 'Do you want to discuss placing an Omnicade at your venue?'
			},
			required: true,
			options: opts(
				['Ja – kontakta mig', 'Yes – contact me'],
				['Kanske – jag vill veta mer', 'Maybe – I want to know more'],
				['Nej', 'No']
			)
		},
		{
			key: 'what_would_change',
			type: 'textarea',
			label: {
				sv: 'Vad skulle behöva vara annorlunda för att det skulle vara intressant?',
				en: 'What would need to be different for this to be interesting?'
			},
			showIf: [
				{ key: 'pilot_interest', values: ['1', '2'] },
				{ key: 'wants_contact', values: ['Nej'] }
			]
		},
		{
			key: 'name',
			type: 'text',
			label: { sv: 'Namn', en: 'Name' },
			required: true,
			showIf: {
				key: 'wants_contact',
				values: ['Ja – kontakta mig', 'Kanske – jag vill veta mer']
			}
		},
		{
			key: 'company',
			type: 'text',
			label: { sv: 'Företag', en: 'Company' },
			required: true,
			showIf: {
				key: 'wants_contact',
				values: ['Ja – kontakta mig', 'Kanske – jag vill veta mer']
			}
		},
		{
			key: 'email',
			type: 'email',
			label: { sv: 'E-post', en: 'Email' },
			required: true,
			placeholder: { sv: 'namn@exempel.se', en: 'name@example.com' },
			showIf: {
				key: 'wants_contact',
				values: ['Ja – kontakta mig', 'Kanske – jag vill veta mer']
			}
		},
		{
			key: 'phone',
			type: 'text',
			label: { sv: 'Telefon', en: 'Phone' },
			showIf: {
				key: 'wants_contact',
				values: ['Ja – kontakta mig', 'Kanske – jag vill veta mer']
			}
		},
		{
			key: 'city',
			type: 'text',
			label: { sv: 'Ort', en: 'City' },
			showIf: {
				key: 'wants_contact',
				values: ['Ja – kontakta mig', 'Kanske – jag vill veta mer']
			}
		},
		{
			key: 'comment',
			type: 'textarea',
			label: { sv: 'Kommentar', en: 'Comment' },
			showIf: {
				key: 'wants_contact',
				values: ['Ja – kontakta mig', 'Kanske – jag vill veta mer']
			}
		},
		{
			key: 'consent',
			type: 'consent',
			label: {
				sv: 'Jag godkänner att Omnicade sparar mina kontaktuppgifter för att kontakta mig om ett samarbete.',
				en: 'I consent to Omnicade storing my contact details to reach me about a cooperation.'
			},
			required: true,
			showIf: {
				key: 'wants_contact',
				values: ['Ja – kontakta mig', 'Kanske – jag vill veta mer']
			}
		}
	]
};

export const forms: FormDef[] = [playerFeedbackForm, businessPartnerForm];

export function formBySlug(slug: string): FormDef | undefined {
	return forms.find((f) => f.slug === slug);
}

/** A question renders only when ANY of its showIf clauses is satisfied.
 * Single answers match directly; multi answers (arrays) match when any
 * picked option is listed; the '*' wildcard means "any non-empty answer". */
export function questionVisible(q: FormQuestion, answers: Record<string, unknown>): boolean {
	if (!q.showIf) return true;
	const clauses = Array.isArray(q.showIf) ? q.showIf : [q.showIf];
	return clauses.some((clause) => {
		const value = answers[clause.key];
		if (clause.values.includes('*')) {
			return Array.isArray(value) ? value.length > 0 : String(value ?? '').trim() !== '';
		}
		if (Array.isArray(value)) {
			return value.some((picked) => clause.values.includes(String(picked)));
		}
		return clause.values.includes(String(value ?? ''));
	});
}
