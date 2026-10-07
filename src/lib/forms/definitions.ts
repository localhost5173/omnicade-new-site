// The site's survey forms, recreated from the original Tally forms
// (tally.so/r/vGo1a8 and tally.so/r/pb81g1). A form is data: the renderer
// in components/forms/FormQuestions.svelte turns a definition into the
// page, the server action in server.ts validates + files it with the api,
// and the dashboard reads the answers back as a JSON object keyed by
// these stable question keys.
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
	/** only render the question while answers[showIf.key] is one of these */
	showIf?: { key: string; values: string[] };
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
	title: { sv: 'Hjälp oss forma framtidens Omnicade!', en: 'Help shape the future of Omnicade!' },
	intro: {
		sv: 'Omnicade är en innovation som jag och min vän skapat för att förvandla väntetider på platser som restauranger, hotell och köpcentrum till något roligare. Vi finjusterar just nu vår prototyp, och din feedback betyder allt för hur slutresultatet blir. Det tar bara ett par minuter, tack för att du hjälper oss att göra det här på riktigt!',
		en: 'Omnicade is an innovation my friend and I built to turn waiting times at places like restaurants, hotels and shopping centres into something more fun. We are fine-tuning our prototype right now, and your feedback shapes the final product. It only takes a couple of minutes, thank you for helping us make this real!'
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
			key: 'demo_note_1',
			type: 'note',
			label: {
				sv: 'Här kommer vi visa upp Omnicade i aktion. Du hittar den på en plats du besöker, betalar för speltid och spelar direkt, själv eller med andra.',
				en: 'Here is where we show Omnicade in action. You find it at a place you visit, pay for play time and start playing right away, alone or with others.'
			}
		},
		{
			key: 'interest',
			type: 'scale',
			label: { sv: 'Hur intressant verkar Omnicade för dig?', en: 'How interesting does Omnicade seem to you?' },
			required: true,
			minLabel: { sv: 'Inte alls intressant', en: 'Not interesting at all' },
			maxLabel: { sv: 'Mycket intressant', en: 'Very interesting' }
		},
		{
			key: 'try_likelihood',
			type: 'scale',
			label: {
				sv: 'Om du såg en Omnicade på en plats du besökte, hur sannolikt är det att du skulle testa den?',
				en: 'If you saw an Omnicade at a place you visit, how likely are you to try it?'
			},
			required: true,
			minLabel: { sv: 'Mycket osannolikt', en: 'Very unlikely' },
			maxLabel: { sv: 'Mycket sannolikt', en: 'Very likely' }
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
				['Event/festival', 'Event/festival'],
				['Flygplats/tågstation', 'Airport/train station'],
				['Ingenstans särskilt', 'Nowhere in particular'],
				['Annat', 'Other']
			)
		},
		{
			key: 'play_with',
			type: 'single',
			label: { sv: 'Vem skulle du främst spela med?', en: 'Who would you mostly play with?' },
			options: opts(
				['Själv', 'By myself'],
				['Kompisar', 'Friends'],
				['Familj', 'Family'],
				['Partner', 'Partner'],
				['Andra personer på platsen', 'Other people at the venue'],
				['Spelar ingen roll', 'Does not matter']
			)
		},
		{
			key: 'reason',
			type: 'single',
			label: {
				sv: 'Vad skulle vara den största anledningen till att du spelar?',
				en: 'What would be the biggest reason for you to play?'
			},
			options: opts(
				['Testa ett nytt spel', 'Try a new game'],
				['Spela med kompisar', 'Play with friends'],
				['Något att göra medan jag väntar', 'Something to do while waiting'],
				['Arkadkänslan', 'The arcade feeling'],
				['Tävlingsmomentet', 'The competition'],
				['Något annorlunda att göra', 'Something different to do'],
				['Jag skulle troligen inte spela', 'I probably would not play'],
				['Annat', 'Other']
			)
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
			key: 'session_length',
			type: 'single',
			label: {
				sv: 'Hur länge skulle du helst vilja spela åt gången?',
				en: 'How long would you prefer to play at a time?'
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
			key: 'price_20_min',
			type: 'single',
			label: {
				sv: 'Vad vore ett rimligt pris för 20 minuters spelande?',
				en: 'What would be a fair price for 20 minutes of play?'
			},
			required: true,
			options: opts(
				['25 kr', '25 SEK'],
				['35 kr', '35 SEK'],
				['40 kr', '40 SEK'],
				['45 kr', '45 SEK'],
				['Mer än 45 kr', 'More than 45 SEK'],
				['Mer än 40 kr', 'More than 40 SEK'],
				['Jag skulle inte betala', 'I would not pay']
			)
		},
		{
			key: 'price_10_min',
			type: 'single',
			label: {
				sv: 'Vad vore ett rimligt pris för 10 minuters spelande?',
				en: 'What would be a fair price for 10 minutes of play?'
			},
			required: true,
			options: opts(
				['20 kr', '20 SEK'],
				['25 kr', '25 SEK'],
				['30 kr', '30 SEK'],
				['35 kr', '35 SEK'],
				['Mer än 35 kr', 'More than 35 SEK'],
				['Jag skulle inte betala', 'I would not pay']
			)
		},
		{
			key: 'price_30_min',
			type: 'single',
			label: {
				sv: 'Vad vore ett rimligt pris för 30 minuters spelande?',
				en: 'What would be a fair price for 30 minutes of play?'
			},
			required: true,
			options: opts(
				['30 kr', '30 SEK'],
				['40 kr', '40 SEK'],
				['50 kr', '50 SEK'],
				['60 kr', '60 SEK'],
				['Mer än 60 kr', 'More than 60 SEK'],
				['Mer än 50 kr', 'More than 50 SEK'],
				['Jag skulle inte betala', 'I would not pay']
			)
		},
		{
			key: 'price_60_min',
			type: 'single',
			label: {
				sv: 'Vad vore ett rimligt pris för 60 minuters spelande?',
				en: 'What would be a fair price for 60 minutes of play?'
			},
			required: true,
			options: opts(
				['40 kr', '40 SEK'],
				['60 kr', '60 SEK'],
				['80 kr', '80 SEK'],
				['100 kr', '100 SEK'],
				['Mer än 100 kr', 'More than 100 SEK'],
				['Mer än 80 kr', 'More than 80 SEK'],
				['Jag skulle inte betala', 'I would not pay']
			)
		},
		{
			key: 'payment_method',
			type: 'single',
			label: { sv: 'Hur skulle du helst betala?', en: 'How would you prefer to pay?' },
			options: opts(
				['Kort', 'Card'],
				['Apple Pay', 'Apple Pay'],
				['Google Pay', 'Google Pay'],
				['Swish', 'Swish'],
				['QR-kod', 'QR code'],
				['Annat', 'Other']
			)
		},
		{
			key: 'why_choose_omnicade',
			type: 'text',
			label: {
				sv: 'Vad skulle krävas för att du skulle välja att spela på en Omnicade i stället för på mobilen?',
				en: 'What would it take for you to play on an Omnicade instead of your phone?'
			},
			placeholder: {
				sv: 'Berätta vad som skulle få dig att välja Omnicade...',
				en: 'Tell us what would make you pick the Omnicade...'
			}
		},
		{
			key: 'games_wanted',
			type: 'text',
			label: { sv: 'Vilka spel skulle du vilja kunna spela på Omnicade?', en: 'Which games would you want to play on an Omnicade?' },
			placeholder: { sv: 'T.ex. Mario Kart, Street Fighter, FIFA...', en: 'E.g. Mario Kart, Street Fighter, FIFA...' }
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
			label: { sv: 'Finns det något du skulle ändra eller förbättra?', en: 'Is there anything you would change or improve?' },
			placeholder: { sv: 'Dela med dig av dina idéer eller funderingar...', en: 'Share your ideas or thoughts...' }
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
			required: true
		}
	]
};

export const businessPartnerForm: FormDef = {
	id: 'business-partner',
	slug: 'for-foretag',
	title: { sv: 'Är Omnicade rätt för er verksamhet?', en: 'Is Omnicade right for your business?' },
	intro: {
		sv: 'Vi söker samarbetspartners som vill skapa mervärde för sina besökare genom vår fysiska spelstation. Din feedback är värdefull för oss, oavsett vad svaret blir. Tar cirka 3 minuter.',
		en: 'We are looking for partners who want to add value for their visitors through our physical gaming station. Your feedback is valuable to us whatever the answer. Takes about 3 minutes.'
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
				['Studentboende', 'Student housing'],
				['Kontor', 'Office'],
				['Event', 'Events'],
				['Fastighetsägare', 'Property owner'],
				['Spel-/underhållningsverksamhet', 'Game/entertainment business'],
				['Annat', 'Other']
			)
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
			key: 'model_note',
			type: 'note',
			label: {
				sv: 'Omnicade placeras, ägs och drivs av oss. Vi sköter teknik, spel, licenser, betalning, övervakning och service. Ni står för platsen och får ersättning enligt avtal.',
				en: 'Omnicade is placed, owned and operated by us. We handle technology, games, licenses, payments, monitoring and service. You provide the space and receive compensation per agreement.'
			}
		},
		{
			key: 'relevance',
			type: 'scale',
			label: {
				sv: 'Hur relevant tror du att Omnicade skulle vara för er verksamhet?',
				en: 'How relevant do you think Omnicade would be for your business?'
			},
			required: true,
			minLabel: { sv: 'Inte alls relevant', en: 'Not relevant at all' },
			maxLabel: { sv: 'Mycket relevant', en: 'Very relevant' }
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
			key: 'pilot_interest',
			type: 'scale',
			label: {
				sv: 'Hur intresserade skulle ni vara av att testa Omnicade hos er under en pilotperiod?',
				en: 'How interested would you be in trying an Omnicade for a pilot period?'
			},
			required: true,
			minLabel: { sv: 'Inte alls intresserade', en: 'Not interested at all' },
			maxLabel: { sv: 'Mycket intresserade', en: 'Very interested' }
		},
		{
			key: 'placement',
			type: 'text',
			label: { sv: 'Var i lokalen skulle en Omnicade kunna stå?', en: 'Where in your venue could an Omnicade stand?' },
			placeholder: { sv: 'T.ex. vid entrén, i väntytan, nära baren', en: 'E.g. by the entrance, in the waiting area, near the bar' }
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
			required: true
		},
		{
			key: 'what_would_change',
			type: 'text',
			label: {
				sv: 'Vad skulle behöva vara annorlunda för att det skulle vara intressant?',
				en: 'What would need to be different for this to be interesting?'
			}
		}
	]
};

export const forms: FormDef[] = [playerFeedbackForm, businessPartnerForm];

export function formBySlug(slug: string): FormDef | undefined {
	return forms.find((f) => f.slug === slug);
}

/** A question renders only when every showIf it declares is satisfied. */
export function questionVisible(q: FormQuestion, answers: Record<string, unknown>): boolean {
	if (!q.showIf) return true;
	return q.showIf.values.includes(String(answers[q.showIf.key] ?? ''));
}
