/**
 * Single source of truth for all Finnish copy on the free version.
 * Kept short, action-first, no throat-clearing.
 */
export const copy = {
	brand: {
		name: 'RehtiArvio',
		tagline: 'Toteutuneet hinnat, ei mielipiteet.'
	},

	nav: {
		analyze: 'Analysoi',
		map: 'Hintakartta',
		pricing: 'Asuntocardit',
		why: 'Miksi?',
		skipToContent: 'Hyppää sisältöön'
	},

	landing: {
		eyebrow: 'Ilmainen analyysi',
		h1: 'Onko tämä hinta kohdallaan?',
		lede: 'Liitä ilmoitus — saat vertailuarvon toteutuneisiin kauppoihin.',
		pillCoverage: (n: number) => `${n.toLocaleString('fi-FI')} postinumeroa`,
		pillQuarters: '4 viimeistä neljännestä',
		pillNoAds: 'Ei mainoksia',

		tabs: {
			url: 'Anna URL',
			text: 'Liitä teksti',
			manual: 'Syötä käsin'
		},

		urlPlaceholder: 'https://asunnot.oikotie.fi/myytavat-asunnot/helsinki/…',
		textPlaceholder: 'Avaa ilmoitus selaimessa → valitse kaikki (Ctrl+A) → liitä tähän',
		analyzeCta: 'Analysoi ilmoitus',
		manualTitle: 'Anna kohteen perustiedot',
		supportedSources: 'Tuetut: Oikotie, Etuovi, Kiinteistömaailma, Remax (https).',

		result: {
			verdictOver: 'yli alueen toteutuneiden kauppojen',
			verdictUnder: 'alle alueen toteutuneiden kauppojen',
			verdictNeutral: 'Suuntaa-antava arvio',
			noVerdict: 'Ei vertailuarvoa',
			noVerdictReason: 'tälle alueelle ja huonetyypille',
			estimateReason: 'alueen kaupoista ei riittävää vertailua — arvio perustuu kohteen kuntoon',
			confidence: {
				korkea: 'korkea',
				kohtalainen: 'kohtalainen',
				matala: 'matala'
			},
			tier: {
				T1: (n: number) => `Postinumeroalueen kaupat (${n} kpl / 4 nelj.)`,
				T3: (n: number) => `Alueen kaupat (${n} kpl) — karkeampi taso`,
				T4: 'Ei riittävästi vertailukauppoja — kunto-perusteinen arvio'
			},
			locationTitle: 'Sijaintipainotettu vertailu',
			locationBeta: 'beta',
			locationIntro: (eurM2: string) =>
				`Osoitteen ympäristön kaupoilla painotettu vertailuarvo on ${eurM2} €/m².`,
			estimateBand: {
				title: 'Kunto-perusteinen hinta-arvio',
				beta: 'suuntaa-antava',
				low: 'alaraja',
				mid: 'paras arvio',
				high: 'yläraja',
				note: 'Perustuu kohteen kuntoon ja alueen karkeaan hintatasoon, ei toteutuneisiin kauppoihin.',
				assumptionsLabel: 'Oletukset'
			},
			factorsTitle: 'Miten luku muodostui?',
			factorsToggle: 'Avaa selitykset',
			factorsClose: 'Sulje selitykset',
			flagsTitle: 'Tulkinnan varaukset',
			asuntocardTitle: 'Asuntocard: taloyhtiön syväkatsaus',
			asuntocardBeta: 'beta',
			asuntocardLede:
				'Kokoaa remonttihistorian, taloyhtiön muut myynnit ja tonttitiedot julkisista lähteistä. Kortti valmistuu muutamassa minuutissa.',
			asuntocardCta: 'Kokoa asuntocard',
			asuntocardNoSub: 'Ei vielä tilausta?'
		},

		trust: {
			line: 'Toteutuneet hinnat · Tilastokeskus · 0 € · ei mainoksia',
			stat1Label: 'Postinumeroaluetta katettu',
			stat2Label: 'Toteutuneet kaupat, kauppamäärillä painotettu',
			stat3Label: 'Tallennettuja osoitteita tai ilmoituksia'
		},

		features: {
			eyebrow: 'Ominaisuudet',
			h2: 'Työkalu, joka katsoo toteutuneisiin kauppoihin.',
			mapTitle: 'Koko maan hintakartta',
			mapBody: 'Hangosta Nuorgamiin. Klikkaus esitäyttää vertailun.',
			analyzeTitle: 'Kohdeanalyysi',
			analyzeBody: 'Liitä URL — järjestelmä poimii hinnan, vastikkeet ja remontit.',
			yieldTitle: 'Vuokratuotto',
			yieldBody: 'Brutto- ja nettotuotto Tilastokeskuksen vuokratilastosta tai syöttämälläsi vuokralla.'
		},

		cases: {
			eyebrow: 'Esimerkkejä',
			h2: 'Mitä arvio kertoi ostajalle.',
			outcomes: {
				over: 'yli alueen',
				under: 'alle alueen',
				estimate: 'suuntaa-antava',
				estimateArea: 'aluevertailu'
			}
		},

		sticky: {
			lead: 'Liitä uusi ilmoitus',
			close: 'Sulje',
			cta: 'Analysoi'
		},

		waitlist: {
			h2: 'Tulossa: kohderaportti',
			body:
				'Kohderaportti yhdistää taloyhtiön talousluvut ja markkinahintavertailun. Jätä sähköposti, saat kutsun ensimmäisten joukossa.',
			emailPlaceholder: 'nimi@esimerkki.fi',
			cta: 'Liity jonotuslistalle',
			success: 'Kiitos! Sähköpostisi on kirjattu.',
			errorGeneric: 'Tallennus epäonnistui. Yritä hetken kuluttua.',
			errorInvalid: 'Tarkista sähköpostiosoite.'
		}
	},

	arvio: {
		titlePrefix: 'RehtiArvio: ',
		copyCta: 'Kopioi linkki',
		copied: 'Linkki kopioitu',
		copyError: 'Kopiointi epäonnistui',
		shareOnMobile: 'Jaa',
		transcript: 'Toteutuneet kaupat',
		shareRow: {
			title: 'Jaa arvio',
			hint: 'Linkki sisältää kaikki arvion tiedot — ei vaadi tiliä.'
		},
		yield: {
			title: 'Vuokratuotto',
			gross: 'Bruttotuotto',
			net: 'Nettotuotto',
			monthlyNet: 'Nettokassavirta / kk',
			reserve: 'Remonttivaraus / v',
			note: 'Sisältää varainsiirtoveron 1,5 % (vero.fi 2026). Remonttivaraus on oletusarvo.',
			rentIsEstimate: (q?: string | null) => `Vuokra on alueen tilastollinen arvio${q ? ` (${q})` : ''}.`
		},
		back: '← Takaisin hakuun',
		ogFallback: 'Toteutuneet hinnat, ei mielipiteet.'
	},

	kartta: {
		title: 'Hintakartta',
		h1: 'Toteutuneet neliöhinnat postinumeroalueittain',
		lede: 'Klikkaa aluetta esitäyttääksesi vertailun.',
		legendTitle: 'Väri = €/m²',
		legend1: 'Tumma = kallis, vaalea = halpa',
		legend2: 'Vaalea ääriviiva = ei julkaistua hintaa',
		attribution: 'Lähde: Tilastokeskus (13mt, CC BY 4.0).'
	},

	tilaa: {
		h1: 'Valitse itsellesi sopiva taso.',
		lede:
			'Ilmainen analyysi kertoo, mitä ilmoitus väittää. Asuntocard kertoo, mitä siitä löytyy muualta — jokainen väite lähteineen.',
		billedOnce: 'kertamaksu',
		billedMonth: '/ kk',
		billedYear: '/ v',
		badge: 'Suosituin',
		cta: {
			buy: 'Osta asuntocard',
			startPro: 'Aloita Pro',
			startFree: 'Aloita ilmaiseksi',
			waitlist: 'Liity odotuslistalle'
		},
		fineOnce: 'Maksu Stripen kautta. Ei sitoutumista.',
		finePro: 'Vuosimaksu valittavissa seuraavassa vaiheessa.',
		faqTitle: 'Usein kysyttyä',
		faq: [
			{ q: 'Voinko peruuttaa?', a: 'Kyllä. Pro-tilauksen voi peruuttaa milloin tahansa — veloitus päättyy kuluvan kauden loppuun.' },
			{ q: 'Mitä tietoja tallennatte?', a: 'Emme tallenna ilmoituksia tai osoitteita. Ainoastaan sähköpostisi tilausta varten.' },
			{ q: 'Toimiiko laskutus?', a: 'Laskutus menee Stripen kautta. Saat kuitin sähköpostiin.' },
			{ q: 'Onko kokeilujakso?', a: 'Asuntocard on kertamaksu — ei kokeilua. Pro-tilaukseen lisätään 14 pv kokeilu myöhemmin.' },
			{ q: 'Voinko viedä datan?', a: 'Kyllä. Kaikki asuntocardit ovat PDF-muodossa, ja Pro-tilaukseen sisältyy JSON-vienti.' }
		]
	},

	miksi: {
		h1: 'Toteutuneet hinnat, ei markkinahypetystä.',
		lede: 'Fides Groupin ilmainen työkalu. Data Tilastokeskukselta, ei mainoksia.',
		dataTitle: 'Mistä data tulee',
		dataRows: [
			{ code: '13mt', desc: 'Osakeasuntojen neliöhinnat postinumeroalueittain, neljännesvuosittain.' },
			{ code: '15hw', desc: 'Omakotitalojen neliöhinnat aluetasolla, neljännesvuosittain.' },
			{ code: 'asvu 13eb', desc: 'Asuntojen vuokrat postinumeroalueittain, neljännesvuosittain.' }
		],
		dataNote: 'Vaatimuksena lähdemerkintä näkyy sivuston alatunnisteessa ja jokaisen luvun yhteydessä.',
		howTitle: 'Miten vertailu toimii',
		howSteps: [
			'Liität ilmoituksen URL-osoitteen tai tekstin.',
			'Järjestelmä poimii hinnan, pinta-alan, huoneluvun ja remontit.',
			'Vertailemme postinumeroalueen toteutuneisiin kauppoihin (4 viimeisintä neljännestä).',
			'Saat delta-prosentin ja luotettavuusluokan.'
		],
		howFallback: 'Jos kauppoja on alle 30, annamme kuntoon perustuvan haarukan — merkitty aina suuntaa-antavaksi.',
		dontTitle: 'Mitä emme tee',
		dontItems: [
			'Ei arviolausuntoja tai sijoitusneuvontaa.',
			'Ei kuntotarkastusta — ostajan tehtävä.',
			'Ei mainoksia, ei datan myyntiä.',
			'Ei ilmoitusten tai osoitteiden tallennusta.'
		],
		tierTitle: 'Luotettavuusluokat',
		tiers: [
			{ name: 'T1', desc: 'Vähintään 30 kauppaa neljänneksellä. Korkea luotettavuus.' },
			{ name: 'T3', desc: 'Käytetään, kun postinumeroalueelta ei löydy dataa.' },
			{ name: 'T4', desc: 'Kuntoon perustuva haarukka. Aina merkitty suuntaa-antavaksi.' }
		],
		coverageTitle: 'Katettu alue',
		coverageCount: (n: number) => `Postinumeroalueita: ${n.toLocaleString('fi-FI')}.`
	},

	tili: {
		activated: 'Tilaus aktivoitu',
		activatedLede: 'Asuntocardit ovat käytössä tällä selaimella.',
		active: 'Tilaus voimassa',
		pastDue: 'Maksu odottaa',
		pastDueLede: 'Päivitä maksutapa Stripen sähköpostilinkistä.',
		canceled: 'Tilaus päättynyt',
		sessionFailed: 'Aktivointi ei onnistunut',
		sessionFailedLede: 'Lataa sivu uudelleen hetken kuluttua.',
		none: 'Ei aktiivista tilausta',
		noneLede: 'Avaa tilausvahvistus samalla selaimella, tai tilaa alta.',
		ctaAnalyze: 'Siirry ilmoitusanalyysiin →',
		ctaResubscribe: 'Tilaa uudelleen →'
	},

	raportti: {
		eyebrow: 'Asuntocard',
		pendingTitle: 'Korttia kootaan…',
		pendingBody: 'Haemme ja ristivarmistamme taloyhtiön tietoja julkisista web-lähteistä. Tämä kestää tyypillisesti muutaman minuutin.',
		failedTitle: 'Kortin kokoaminen ei onnistunut',
		failedBody: 'Taloyhtiölle ei löytynyt riittävästi julkisia lähteitä. Yritä myöhemmin uudelleen.',
		sourcesTitle: 'Lähteet ja luotettavuus',
		fine: (conf?: number | null) =>
			`Kortti on koottu koneellisesti julkisista web-lähteistä${conf != null ? ` (kattavuusarvio ${Math.round(conf * 100)} %)` : ''}. Vain lähteissä näkyvät tiedot on raportoitu. Tämä ei ole arvio eikä sijoitusneuvontaa.`
	},

	footer: {
		brandLine: 'Fides Groupin kehittämä työkalu asuntokaupan markkinahintavertailuun.',
		links: {
			why: 'Miksi RehtiArvio?',
			how: 'Miten tämä toimii',
			statfi: 'Tilastokeskus (CC BY 4.0)',
			fides: 'Fides Group'
		},
		attribution:
			'Hinta-aineistot: Tilastokeskus (13mt, 15hw, asvu 13eb, CC BY 4.0). Suuntaa antava seula, ei arviolausunto eikä sijoitusneuvontaa.'
	},

	errors: {
		invalidEmail: 'Tarkista sähköpostiosoite.',
		saveFailed: 'Tallennus epäonnistui. Yritä hetken kuluttua.',
		generic: 'Jokin meni vikaan.'
	}
};