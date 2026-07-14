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
		map: 'Markkina-analyysi',
		pricing: 'Taloyhtiöraportti',
		why: 'Miksi?',
		skipToContent: 'Hyppää sisältöön'
	},

	landing: {
		eyebrow: 'Hintavertailu tilastodatasta',
		h1: 'Onko asunnon hinta kohdallaan?',
		lede: 'Liitä myynti-ilmoitus, niin saat vertailun Tilastokeskuksen toteutuneisiin kauppoihin postinumeroalueittain.',

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
		manualLink: 'tai syötä tiedot käsin',
		manualLinkClose: 'piilota käsin syöttö',
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
			statListing: 'Kohteen neliöhinta',
			statBenchmark: 'Alueen kaupat',
			statConfidence: 'Luotettavuus',
			factorsTitle: 'Miten luku muodostui?',
			factorsToggle: 'Avaa selitykset',
			factorsClose: 'Sulje selitykset',
			flagsTitle: 'Tulkinnan varaukset',
			asuntocardTitle: 'Taloyhtiöraportti: syväkatsaus taloyhtiöön',
			asuntocardBeta: 'beta',
			asuntocardLede:
				'Kokoaa remonttihistorian, taloyhtiön muut myynnit ja tonttitiedot julkisista lähteistä. Raportti valmistuu muutamassa minuutissa.',
			asuntocardCta: 'Tilaa Taloyhtiöraportti',
			asuntocardNoSub: 'Ei vielä tilausta?'
		},

		priceMap: {
			eyebrow: 'Datasta',
			title: 'Postinumeroalueiden neliöhinnat',
			source: 'Lähde: Tilastokeskus 13mt · 4 viimeistä neljännestä',
			hint: 'Keltainen = edullinen, punainen = kallis neliöhinta. Klikkaa aluetta esitäyttääksesi vertailun.',
			openFull: 'Avaa markkina-analyysi →'
		},

		examples: {
			eyebrow: 'Esimerkkejä eri kohdetyypeistä',
			title: 'Miltä arvio näyttää erilaisille asunnoille?',
			rows: {
				area: 'Alueen kaupat',
				priceLevel: 'Alueen hintataso',
				rent: 'Vuokra-arvio',
				yield: 'Bruttotuotto'
			},
			takes: {
				'yksio-helsinki':
					'Pienet yksiöt myydään usein alueen keskineliöhintaa kalliimmalla. Vertailu näyttää preemion suuruuden.',
				'kaksio-tampere':
					'Kaksiot ovat vaihdetuin kohdetyyppi, joten vertailu on niissä luotettavimmillaan.',
				'kolmio-turku':
					'Suuret perheasunnot jäävät usein alle alueen neliökeskihinnan — hinnoittelussa se on neuvotteluvaraa.',
				'kaksio-oulu':
					'Edullisemmilla alueilla tilastovuokra nostaa bruttotuoton selvästi kasvukeskuksia korkeammaksi.'
			} as Record<string, string>,
			disclaimer:
				'Luvut ovat aluetason tilastoja (Tilastokeskus 13mt ja asvu), eivät arvioita yksittäisistä kohteista. Emme ole välittäjä.'
		},

		market: {
			eyebrow: 'Markkinat nyt',
			transactions: 'Kauppoja / 4 nelj.',
			median: 'Mediaanihinta',
			areas: 'Aluetta, joilla julkaistu hinta',
			mostExpensive: 'Kallein alue',
			cheapest: 'Edullisin alue',
			source: 'Lähde: Tilastokeskus 13mt'
		},

		methodNote:
			'Menetelmä: kohteen neliöhintaa verrataan alueen toteutuneiden kauppojen kauppamäärillä painotettuun keskiarvoon neljältä viimeiseltä neljännekseltä. Luotettavuusluokka määräytyy vertailukauppojen määrästä.',

		waitlist: {
			eyebrow: 'Tulossa',
			title: 'Taloyhtiöraportti',
			placeholder: 'nimi@esimerkki.fi',
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
			rentRow: 'Vuokra-arvio',
			gross: 'Bruttotuotto',
			net: 'Nettotuotto',
			monthlyNet: 'Nettokassavirta / kk',
			reserve: 'Remonttivaraus / v',
			note: 'Sisältää varainsiirtoveron 1,5 % (vero.fi 2026). Remonttivaraus on oletusarvo.',
			rentIsEstimate: (q?: string | null) => `Vuokra on alueen tilastollinen arvio${q ? ` (${q})` : ''}.`
		},
		quarterRange: 'Neljännesvaihtelu',
		location: {
			title: 'Sijainti',
			hint: 'Postinumeroalue hintakartalla. Väri = alueen toteutunut neliöhinta.'
		},
		ownRent: {
			title: 'Omistus vs. vuokraus',
			unit: '€/kk',
			rent: 'Vuokra',
			rentEstimateSuffix: '(tilastollinen arvio)',
			own: 'Omistus',
			interest: 'Korkokulu',
			vastike: 'Hoitovastike',
			reserve: 'Remonttivaraus',
			vastikeUnknown: 'Hoitovastiketta ei annettu — omistuksen kulut ovat todellisuudessa suuremmat.',
			note: 'Korko-oletus 3,5 % velattomasta hinnasta puhtaana kuluna. Ei sisällä lyhennystä eikä arvonmuutosta: lyhennys kasvattaa varallisuutta, arvonmuutos on riski molempiin suuntiin.'
		},
		notes: {
			title: 'Huomioitavaa arviossa',
			transferTax: (eur: string) => `Ostajan varainsiirtovero n. ${eur} € (1,5 %, vero.fi).`,
			pipeNear: 'Rakennus lähestyy tyypillistä putkiremontti-ikää. Tarkista tehdyt remontit.',
			pipeIn: 'Rakennus on tyypillisessä putkiremontti-iässä. Varmista, onko putkiremontti tehty.',
			trend: (pct: string, from: number, to: number) =>
				`Alueen keskihinnat ovat muuttuneet keskimäärin ${pct} % vuodessa (${from}–${to}).`
		},
		history: {
			priceTitle: 'Alueen keskihintojen kehitys',
			priceUnit: '€/m² vuosikeskiarvo',
			volumeTitle: 'Alueen myyntimäärien kehitys',
			volumeUnit: 'julkaistut kaupat / vuosi',
			trendLabel: 'Keskimääräinen vuosimuutos',
			last12Label: 'Edellisen 12 kk hintakehitys',
			forecastLabel: 'Seuraavan 12 kk trendiennuste',
			forecastSeries: 'Ennuste',
			forecastNote:
				'Trendiennuste on lineaarinen jatke alueen toteutuneista hinnoista (enintään 5 v) — suuntaa antava, ei takuu tulevasta.',
			source: 'Lähde: Tilastokeskus 13mt',
			partialNote: 'Viimeisin vuosi voi olla vajaa.'
		},
		method: {
			title: 'Näin luku lasketaan',
			items: [
				'Kohteen neliöhinta = velaton hinta jaettuna asuinpinta-alalla.',
				'Vertailutaso on postinumeroalueen toteutuneiden kauppojen kauppamäärillä painotettu keskihinta neljältä viimeiseltä neljännekseltä (Tilastokeskus 13mt).',
				'Jos omalta alueelta on alle 30 kauppaa, vertailu laajenee kuntatasolle ja luotettavuusluokka laskee.',
				'Tilastokeskus ei julkaise alle 20 kaupan soluja — puuttuvaa arvoa ei koskaan korvata toisella luvulla.',
				'Ero ilmoitetaan aina yhdessä luotettavuusluokan ja tulkinnan varausten kanssa, ei pelkkänä prosenttina.'
			]
		},
		back: '← Takaisin hakuun',
		ogFallback: 'Toteutuneet hinnat, ei mielipiteet.'
	},

	kartta: {
		title: 'Markkina-analyysi',
		h1: 'Asuntomarkkinat postinumeroalueittain',
		lede: 'Toteutuneet neliöhinnat kartalla, hintajakauma ja alueiden ääripäät. Klikkaa aluetta esitäyttääksesi vertailun.',
		legendNoData: 'Katkoviivalla merkityltä alueelta ei ole julkaistua hintaa.',
		tapHint: 'Napauta aluetta nähdäksesi hinnan.',
		panelUse: 'Käytä vertailussa',
		panelClose: 'Sulje tietoruutu',
		countryPriceTitle: 'Koko maan hintakehitys (kerrostalot)',
		countryVolumeTitle: 'Koko maan myyntimäärät (kerrostalot)',
		countrySource: 'Lähde: Tilastokeskus 13mv',
		bandsTitle: 'Neliöhintojen jakauma',
		bandsUnit: 'postinumeroalueet hintaluokittain',
		bandsAreas: 'aluetta',
		bandsTransactions: 'kauppaa',
		statsMedian: 'Mediaani',
		statsP25: 'Alakvartiili',
		statsP75: 'Yläkvartiili',
		statsTransactions: 'Kauppoja / 4 nelj.',
		statsAreas: 'Alueita',
		topExpensive: 'Kalleimmat alueet',
		topCheapest: 'Edullisimmat alueet',
		topHint: 'Vähintään 10 kauppaa neljällä neljänneksellä. Klikkaa riviä esitäyttääksesi vertailun.',
		colArea: 'Alue',
		colPrice: '€/m²',
		colN: 'Kauppoja',
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
		lede: 'RehtiArvio kertoo ilmaiseksi, mitä asunnoista on oikeasti maksettu. Hinnat tulevat Tilastokeskukselta, eivät välittäjiltä. Ei mainoksia.',
		dataTitle: 'Mistä hinnat tulevat',
		dataIntro:
			'Kaikki hinnat ovat Tilastokeskuksen keräämiä tietoja oikeista, jo tehdyistä asuntokaupoista. Emme käytä pyyntihintoja emmekä välittäjien arvioita.',
		dataRows: [
			{ code: 'Kerros- ja rivitalot', desc: 'Toteutuneet kauppahinnat postinumeroalueittain.' },
			{ code: 'Omakotitalot', desc: 'Toteutuneet kauppahinnat aluetasolla.' },
			{ code: 'Vuokrat', desc: 'Keskivuokrat postinumeroalueittain.' }
		],
		dataNote:
			'Hinnat päivittyvät neljä kertaa vuodessa, kun Tilastokeskus julkaisee uudet luvut. Tilastojen tunnisteet (13mt, 15hw, asvu 13eb) löytyvät sivun alatunnisteesta.',
		howTitle: 'Miten vertailu toimii',
		howSteps: [
			'Liität myynti-ilmoituksen linkin tai tekstin.',
			'Työkalu poimii ilmoituksesta hinnan, pinta-alan, huoneluvun ja remontit.',
			'Se vertaa hintaa saman postinumeroalueen kauppoihin viimeisen vuoden ajalta.',
			'Saat euroissa tiedon, onko pyyntihinta yli vai alle alueen tason, ja kuinka moneen kauppaan vertailu perustuu.'
		],
		howFallback: 'Jos alueelta löytyy alle 30 kauppaa, annamme hinta-arvion asunnon kunnon perusteella. Se on aina merkitty suuntaa antavaksi.',
		dontTitle: 'Mitä emme tee',
		dontItems: [
			'Emme anna virallisia arviolausuntoja emmekä sijoitusneuvoja.',
			'Emme tee kuntotarkastusta, se on ostajan tehtävä.',
			'Emme näytä mainoksia emmekä myy tietojasi.',
			'Emme tallenna ilmoituksia emmekä osoitteita.'
		],
		tierTitle: 'Kuinka luotettava vertailu on',
		tiers: [
			{ name: 'Tarkka vertailu', desc: 'Asunnon omalta postinumeroalueelta löytyi vähintään 30 kauppaa. Luotettavin taso.' },
			{ name: 'Aluevertailu', desc: 'Omalta alueelta ei löytynyt tarpeeksi kauppoja, joten vertaamme laajempaan alueeseen. Karkeampi taso.' },
			{ name: 'Kuntoarvio', desc: 'Kauppoja on liian vähän vertailuun, joten annamme hintahaarukan asunnon kunnon perusteella. Aina suuntaa antava.' }
		],
		coverageTitle: 'Katettu alue',
		coverageCount: (n: number) => `Vertailuhinnat kattavat ${n.toLocaleString('fi-FI')} postinumeroaluetta eri puolilla Suomea.`
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