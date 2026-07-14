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
		pricing: 'Taloyhtiöraportti',
		why: 'Miksi?',
		skipToContent: 'Hyppää sisältöön'
	},

	landing: {
		eyebrow: 'Ilmainen analyysi',
		h1: 'Onko tämä hinta kohdallaan?',
		lede: 'Liitä ilmoitus, niin saat vertailun alueen toteutuneisiin kauppoihin.',
		pillCoverage: (n: number) => `${n.toLocaleString('fi-FI')} postinumeroa`,
		pillQuarters: '4 viimeistä neljännestä',
		pillNoAds: 'Ei mainoksia',

		tabs: {
			url: 'Liitä linkki',
			text: 'Liitä teksti',
			manual: 'Syötä käsin'
		},

		urlPlaceholder: 'https://asunnot.oikotie.fi/myytavat-asunnot/helsinki/…',
		textPlaceholder: 'Avaa ilmoitus selaimessa → valitse kaikki (Ctrl+A) → liitä tähän',
		textPlaceholderTouch: 'Avaa ilmoitus → kopioi ilmoituksen teksti → liitä tähän',
		analyzeCta: 'Analysoi ilmoitus',
		manualTitle: 'Anna kohteen perustiedot',
		supportedSources: 'Tuetut: Oikotie, Etuovi, Kiinteistömaailma, Remax (https).',
		beginnerToggleOn: 'Sijoittajalle: lisää vuokra ja vastike',
		beginnerToggleOff: 'Aloittelijalle: piilota lisäkentät',
		debtfreeHelper: 'Velaton hinta = myyntihinta + yhtiölainaosuus. Ilmoituksissa on yleensä molemmat.',
		demoLinkCta: 'Katso esimerkkiarvio',
		independence:
			'Emme ole välittäjä emmekä hyödy kaupasta. Vertailu perustuu Tilastokeskuksen toteutuneisiin kauppahintoihin.',
		privacyNote: 'Emme tallenna ilmoituksia emmekä osoitteita.',

		result: {
			verdictOver: 'yli alueen toteutuneiden kauppojen',
			verdictUnder: 'alle alueen toteutuneiden kauppojen',
			verdictEurOver: (eur: string) =>
				`Pyyntihinta on noin ${eur} € yli alueen toteutuneiden kauppojen.`,
			verdictEurUnder: (eur: string) =>
				`Pyyntihinta on noin ${eur} € alle alueen toteutuneiden kauppojen.`,
			verdictNeutral: 'Suuntaa antava arvio',
			noVerdict: 'Ei vertailuarvoa',
			noVerdictReason: 'tälle alueelle ja huonetyypille',
			estimateReason: 'alueen kaupoista ei saatu riittävää vertailua, joten arvio perustuu kohteen kuntoon',
			confidence: {
				korkea: 'korkea',
				kohtalainen: 'kohtalainen',
				matala: 'matala'
			},
			tier: {
				T1: (n: number) => `Perustuu ${n} toteutuneeseen kauppaan tällä postinumeroalueella`,
				T3: (n: number) => `Perustuu ${n} kauppaan laajemmalta alueelta, joten vertailu on karkeampi`,
				T4: 'Ei riittävästi vertailukauppoja, joten arvio perustuu kohteen kuntoon'
			},
			locationTitle: 'Lähialueen toteutuneet kaupat',
			locationBeta: 'beta',
			locationIntro: (eurM2: string) =>
				`Osoitteen ympäristön kaupoilla painotettu vertailuarvo on ${eurM2} €/m².`,
			estimateBand: {
				title: 'Kuntoon perustuva hinta-arvio',
				beta: 'suuntaa antava',
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
			asuntocardTitle: 'Taloyhtiöraportti: syväkatsaus taloyhtiöön',
			asuntocardBeta: 'beta',
			asuntocardLede:
				'Kokoaa remonttihistorian, taloyhtiön muut myynnit ja tonttitiedot julkisista lähteistä. Raportti valmistuu muutamassa minuutissa.',
			asuntocardCta: 'Tilaa Taloyhtiöraportti',
			asuntocardNoSub: 'Ei vielä tilausta?',
			asuntocardDocsLabel: 'Isännöitsijäntodistus ja tilinpäätös',
			asuntocardDocsHelper:
				'Liitä asiakirjojen teksti (avaa PDF → Ctrl+A → kopioi). Poimimme talousluvut ja korjaukset koneellisesti. Itse tekstiä ei tallenneta, vain luvut.',
			asuntocardDocsPlaceholder:
				'Liitä tähän isännöitsijäntodistuksen ja/tai tilinpäätöksen teksti…'
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
			analyzeTitle: 'Ilmoituksen tarkistus',
			analyzeBody: 'Liitä URL, niin järjestelmä poimii hinnan, vastikkeet ja remontit.',
			yieldTitle: 'Remontit ja vastikkeet',
			yieldBody:
				'Näet, mitä ilmoitus kertoo remonteista ja kuluista, ja mitä se jättää kertomatta.'
		},

		cases: {
			eyebrow: 'Esimerkkejä',
			h2: 'Mitä arvio kertoi ostajalle.',
			outcomes: {
				over: 'yli alueen',
				under: 'alle alueen',
				estimate: 'suuntaa antava',
				estimateArea: 'aluevertailu'
			}
		},

		sticky: {
			lead: 'Liitä uusi ilmoitus',
			close: 'Sulje',
			cta: 'Analysoi'
		},

		waitlist: {
			h2: 'Tulossa: Taloyhtiöraportti',
			body:
				'Taloyhtiöraportti yhdistää taloyhtiön talousluvut ja markkinahintavertailun. Jätä sähköposti, saat kutsun ensimmäisten joukossa.',
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
		noVerdictLabel: 'Ei vertailuarvoa tälle alueelle.',
		shareRow: {
			title: 'Jaa arvio',
			hint: 'Linkki sisältää kaikki arvion tiedot. Tiliä ei tarvita.'
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
		legendNoData: 'Katkoviivalla merkityltä alueelta ei ole julkaistua hintaa.',
		attribution: 'Lähde: Tilastokeskus (13mt, CC BY 4.0).'
	},

	tilaa: {
		h1: 'Valitse itsellesi sopiva taso.',
		lede:
			'Ilmainen analyysi kertoo, mitä ilmoitus väittää. Taloyhtiöraportti kertoo, mitä siitä löytyy muualta, jokainen väite lähteineen.',
		billedOnce: 'kertamaksu',
		billedMonth: '/ kk',
		billedYear: '/ v',
		badge: 'Suosituin',
		cta: {
			buy: 'Osta Taloyhtiöraportti',
			startPro: 'Aloita Pro',
			startFree: 'Aloita ilmaiseksi',
			waitlist: 'Liity odotuslistalle'
		},
		fineOnce: 'Maksu Stripen kautta. Ei sitoutumista.',
		finePro: 'Vuosimaksu valittavissa seuraavassa vaiheessa.',
		faqTitle: 'Usein kysyttyä',
		faq: [
			{ q: 'Voinko peruuttaa?', a: 'Kyllä. Pro-tilauksen voi peruuttaa milloin tahansa. Veloitus päättyy kuluvan kauden loppuun.' },
			{ q: 'Mitä tietoja tallennatte?', a: 'Emme tallenna ilmoituksia tai osoitteita. Ainoastaan sähköpostisi tilausta varten.' },
			{ q: 'Toimiiko laskutus?', a: 'Laskutus menee Stripen kautta. Saat kuitin sähköpostiin.' },
			{ q: 'Onko kokeilujakso?', a: 'Taloyhtiöraportti on kertamaksu, eikä siinä ole kokeilujaksoa. Pro-tilaukseen lisätään 14 päivän kokeilu myöhemmin.' },
			{ q: 'Voinko viedä datan?', a: 'Kyllä. Kaikki Taloyhtiöraportit ovat PDF-muodossa, ja Pro-tilaukseen sisältyy JSON-vienti.' }
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
		dataNote: 'Lisenssin edellyttämä lähdemerkintä näkyy sivuston alatunnisteessa ja jokaisen luvun yhteydessä.',
		howTitle: 'Miten vertailu toimii',
		howSteps: [
			'Liität ilmoituksen URL-osoitteen tai tekstin.',
			'Työkalu poimii hinnan, pinta-alan, huoneluvun ja remontit.',
			'Se vertaa postinumeroalueen toteutuneisiin kauppoihin (4 viimeistä neljännestä).',
			'Saat eron alueen hintatasoon euroina ja tiedon, kuinka moneen kauppaan vertailu perustuu.'
		],
		howFallback: 'Jos kauppoja on alle 30, annamme kuntoon perustuvan haarukan, joka on aina merkitty suuntaa antavaksi.',
		dontTitle: 'Mitä emme tee',
		dontItems: [
			'Ei arviolausuntoja tai sijoitusneuvontaa.',
			'Ei kuntotarkastusta, se on ostajan tehtävä.',
			'Ei mainoksia, ei datan myyntiä.',
			'Ei ilmoitusten tai osoitteiden tallennusta.'
		],
		tierTitle: 'Kuinka luotettava vertailu on',
		tiers: [
			{ name: 'Tarkka vertailu', desc: 'Vähintään 30 kauppaa postinumeroalueelta. Vahva vertailu.' },
			{ name: 'Aluevertailu', desc: 'Käytetään, kun postinumeroalueelta ei löydy tarpeeksi kauppoja.' },
			{ name: 'Kuntoarvio', desc: 'Kuntoon perustuva haarukka. Aina merkitty suuntaa antavaksi.' }
		],
		coverageTitle: 'Katettu alue',
		coverageCount: (n: number) => `Postinumeroalueita: ${n.toLocaleString('fi-FI')}.`
	},

	tili: {
		activated: 'Tilaus aktivoitu',
		activatedLede: 'Taloyhtiöraportit ovat käytössä tällä selaimella.',
		active: 'Tilaus voimassa',
		activeLede: 'Taloyhtiöraportit löytyvät ilmoitusanalyysin tuloksista.',
		pastDue: 'Maksu odottaa',
		pastDueLede: 'Päivitä maksutapa Stripen sähköpostilinkistä.',
		canceled: 'Tilaus päättynyt',
		sessionFailed: 'Aktivointi ei onnistunut',
		sessionFailedLede: 'Lataa sivu uudelleen hetken kuluttua.',
		none: 'Ei aktiivista tilausta',
		noneLede: 'Avaa tilausvahvistus samalla selaimella tai tilaa alta.',
		ctaAnalyze: 'Siirry ilmoitusanalyysiin →',
		ctaResubscribe: 'Tilaa uudelleen →'
	},

	raportti: {
		eyebrow: 'Taloyhtiöraportti',
		pageTitle: 'Taloyhtiöraportti | RehtiArvio',
		pendingTitle: 'Raporttia kootaan…',
		pendingBody: 'Haemme ja ristivarmistamme taloyhtiön tietoja julkisista verkkolähteistä. Tämä kestää tyypillisesti muutaman minuutin.',
		failedTitle: 'Raportin kokoaminen ei onnistunut',
		failedBody: 'Taloyhtiölle ei löytynyt riittävästi julkisia lähteitä. Yritä myöhemmin uudelleen.',
		sourcesTitle: 'Lähteet ja luotettavuus',
		talousTitle: 'Taloyhtiön talous',
		ptsTitle: 'Kunnossapitotarveselvitys (PTS)',
		historyTitle: 'Korjaushistoria asiakirjoista',
		docsSource:
			'Lähde: ostajan toimittamat asiakirjat (isännöitsijäntodistus/tilinpäätös). Asiakirjatekstiä ei ole tallennettu, vain koneellisesti poimitut luvut.',
		talous: {
			hoitovastike: 'Hoitovastike',
			rahoitusvastike: 'Rahoitusvastike',
			lainaosuus: 'Lainaosuus',
			yhtioLainat: 'Yhtiön lainat',
			hoitokulut: 'Hoitokulut / v',
			lunastuslauseke: 'Lunastuslauseke',
			tontti: 'Tontti',
			on: 'On',
			ei: 'Ei',
			oma: 'Oma',
			vuokra: 'Vuokrattu'
		},
		fine: (conf?: number | null) =>
			`Raportti on koottu koneellisesti julkisista verkkolähteistä${conf != null ? ` (kattavuusarvio ${Math.round(conf * 100)} %)` : ''}. Vain lähteissä näkyvät tiedot on raportoitu. Tämä ei ole arvio eikä sijoitusneuvontaa.`
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
			'Hinta-aineistot: Tilastokeskus (13mt, 15hw, asvu 13eb, CC BY 4.0). Suuntaa antava seula, ei arviolausunto eikä sijoitusneuvonta.'
	},

	errors: {
		invalidEmail: 'Tarkista sähköpostiosoite.',
		saveFailed: 'Tallennus epäonnistui. Yritä hetken kuluttua.',
		generic: 'Jokin meni vikaan.',
		reportNeedSub: 'Taloyhtiöraportit kuuluvat RehtiArvio-tilaukseen. Tilaa /tilaa-sivulta, tai jos olet jo tilannut, avaa /tili samalla selaimella.',
		reportNeedTarget:
			'Taloyhtiöraportti tarvitsee taloyhtiön nimen tai osoitteen. Analysoi ilmoitus ensin.',
		docsUnparsed:
			'Liittämästäsi tekstistä ei löytynyt taloyhtiön talouslukuja (vastikkeet, lainaosuus, korjaukset). Tarkista, että kopioit isännöitsijäntodistuksen tekstin, tai tyhjennä kenttä ja tilaa raportti ilman asiakirjoja.'
	}
};