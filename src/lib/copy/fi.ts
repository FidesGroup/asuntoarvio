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
		map: 'Kartta',
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
			openFull: 'Avaa kartta →'
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
					'Suuret perheasunnot jäävät usein alle alueen neliökeskihinnan. Hinnoittelussa se on neuvotteluvaraa.',
				'kaksio-oulu':
					'Edullisemmilla alueilla tilastovuokra nostaa bruttotuoton selvästi kasvukeskuksia korkeammaksi.'
			} as Record<string, string>,
			disclaimer:
				'Luvut ovat aluetason tilastoja (Tilastokeskus 13mt ja asvu), eivät arvioita yksittäisistä kohteista. Emme ole välittäjä.'
		},

		market: {
			eyebrow: 'Markkinat nyt',
			transactions: 'Kauppoja / 4 nelj.',
			change12: '12 kk hintakehitys',
			forecast12: '12 kk trendiennuste',
			areas: 'Aluetta, joilla julkaistu hinta',
			mostExpensive: 'Kallein alue',
			cheapest: 'Edullisin alue',
			countrySub: 'koko maa, kerrostalot',
			source: 'Lähde: Tilastokeskus 13mt · 13mv',
			methodToggle: 'Miten tämä lasketaan?'
		},

		report: {
			factsTitle: 'Ilmoituksesta poimitut tiedot',
			factsMissing: 'ei ilmoitettu',
			facts: {
				address: 'Osoite',
				debtFreePrice: 'Velaton hinta',
				askingPrice: 'Myyntihinta',
				debtShare: 'Velkaosuus',
				maintenanceCharge: 'Hoitovastike',
				capitalCharge: 'Pääomavastike',
				totalCharge: 'Yhtiövastike yhteensä',
				area: 'Asuinpinta-ala',
				rooms: 'Huoneisto',
				buildYear: 'Rakennusvuosi',
				condition: 'Kunto',
				floor: 'Kerros',
				elevator: 'Hissi',
				landOwnership: 'Tontin omistus',
				tonttiArea: 'Tontin pinta-ala',
				energyClass: 'Energialuokka',
				housingCompany: 'Taloyhtiö',
				apartmentCount: 'Huoneistoja yhtiössä',
				mortgages: 'Yhtiön kiinnitykset',
				perApartment: 'per huoneisto',
				ofPrice: 'hinnasta',
				yes: 'kyllä',
				no: 'ei',
				years: 'v'
			},
			locationTitle: 'Sijaintipainotettu vertailu',
			locationBeta: 'beta',
			locationLede:
				'Naapurialueiden toteutuneet kaupat etäisyyspainotettuna osoitteen ympäriltä.',
			locationWeighted: 'Sijaintipainotettu hintataso',
			locationDelta: 'Kohde vs. sijaintipainotettu',
			locationCols: { area: 'Alue', price: '€/m²', dist: 'Etäisyys' },
			estimateTitle: 'Hinta-arviohaarukka',
			estimateAssumptions: 'Oletukset',
			insightsTitle: 'Poiminnat ilmoituksesta',
			renoTitle: 'Remonttihistoria ja tulevat remontit',
			renoDone: 'Tehty',
			renoUpcoming: 'Tulossa',
			renoNone: 'Ilmoituksessa ei mainittu remontteja. Pyydä isännöitsijäntodistus ja kunnossapitotarveselvitys.',
			historyLoading: 'Haetaan alueen hintahistoriaa Tilastokeskuksesta…',
			shareCta: 'Avaa jaettava arvio →',
			shareHint: 'Linkki sisältää arvion tiedot ilman ilmoituksen tekstiä.',
			sourceLine: (host: string) => `Analysoitu ilmoituksesta (${host}), yksi käyttäjän pyytämä haku.`
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
			errorInvalid: 'Tarkista sähköpostiosoite.',
			marketingOptIn: 'Saan myös muuta RehtiArvion postia sähköpostiini.'
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
			vastikeUnknown: 'Hoitovastiketta ei annettu. Omistuksen kulut ovat todellisuudessa suuremmat.',
			note: 'Korko-oletus 3,5 % velattomasta hinnasta puhtaana kuluna. Ei sisällä lyhennystä eikä arvonmuutosta: lyhennys kasvattaa varallisuutta, arvonmuutos on riski molempiin suuntiin.'
		},
		notes: {
			title: 'Huomioitavaa arviossa',
			transferTax: (eur: string) => `Ostajan varainsiirtovero n. ${eur} € (1,5 %, vero.fi).`,
			pipeNear: 'Rakennus lähestyy tyypillistä putkiremontti-ikää. Tarkista tehdyt remontit.',
			pipeIn: 'Rakennus on tyypillisessä putkiremontti-iässä. Varmista, onko putkiremontti tehty.',
			pipeDone: 'Putkiremontti on ilmoituksen mukaan tehty. Suurin yksittäinen remonttiriski on takana.',
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
				'Trendiennuste on lineaarinen jatke alueen toteutuneista hinnoista (enintään 5 v), suuntaa antava, ei takuu tulevasta.',
			source: 'Lähde: Tilastokeskus 13mt',
			partialNote: 'Viimeisin vuosi voi olla vajaa.'
		},
		method: {
			title: 'Näin luku lasketaan',
			items: [
				'Kohteen neliöhinta = velaton hinta jaettuna asuinpinta-alalla.',
				'Vertailutaso on postinumeroalueen toteutuneiden kauppojen kauppamäärillä painotettu keskihinta neljältä viimeiseltä neljännekseltä (Tilastokeskus 13mt).',
				'Jos omalta alueelta on alle 30 kauppaa, vertailu laajenee kuntatasolle ja luotettavuusluokka laskee.',
				'Tilastokeskus ei julkaise alle 20 kaupan soluja. Puuttuvaa arvoa ei koskaan korvata toisella luvulla.',
				'Ero ilmoitetaan aina yhdessä luotettavuusluokan ja tulkinnan varausten kanssa, ei pelkkänä prosenttina.'
			]
		},
		back: '← Takaisin hakuun',
		ogFallback: 'Toteutuneet hinnat, ei mielipiteet.'
	},

	kartta: {
		title: 'Kartta',
		h1: 'Asuntomarkkinat postinumeroalueittain',
		lede: 'Toteutuneet neliöhinnat, 12 kuukauden hintakehitys, bruttovuokratuotot ja markkinan likviditeetti kartalla. Klikkaa aluetta esitäyttääksesi vertailun.',
		legendNoData: 'Katkoviivalla merkityltä alueelta ei ole julkaistua arvoa valitulle tunnusluvulle.',
		noValue: 'ei julkaistua arvoa',
		tapHint: 'Napauta aluetta nähdäksesi luvut.',
		panelUse: 'Käytä vertailussa',
		panelClose: 'Sulje tietoruutu',
		modesLabel: 'Kartan tunnusluku',
		modes: {
			eur: 'Neliöhinta',
			chg: 'Muutos 12 kk',
			yld: 'Vuokratuotto',
			pir: 'Hinta / tulot',
			liq: 'Likviditeetti'
		},
		modeUnits: {
			yld: 'brutto / v',
			pir: 'vuoden mediaanituloa',
			liq: 'kauppaa / 1 000 asuntoa'
		},
		modeLedes: {
			eur: 'Toteutuneiden kauppojen keskineliöhinta neljältä viimeiseltä neljännekseltä.',
			chg: 'Neliöhintojen muutos edellisvuoden vastaavaan neljään neljännekseen. Laskettu huonetyypeittäin ja painotettu kauppamäärillä, jotta myyntirakenteen muutos ei näy hinnanmuutoksena.',
			yld: 'Bruttovuokratuotto: alueen tilastovuokra (12 kk) suhteessa saman huonetyypin toteutuneisiin neliöhintoihin. Ei sisällä vastikkeita eikä veroja.',
			pir: '60 m² asunnon velaton hinta suhteessa alueen aikuisväestön mediaanivuosituloihin. Mitä suurempi luku, sitä kireämpi hintataso suhteessa paikalliseen ostovoimaan.',
			liq: 'Julkaistut kaupat neljältä neljännekseltä suhteessa alueen asuntokantaan. Ohuilla markkinoilla yksittäiset kaupat heiluttavat hintatilastoa enemmän.'
		},
		katsausTitle: 'Markkinakatsaus',
		katsausWindow: (w: string) => `Tarkastelujakso ${w}`,
		katsaus: (s: {
			areas: number;
			transactions: string;
			median: string;
			chg: number | null;
			riser: { name: string; value: number } | null;
			faller: { name: string; value: number } | null;
			medianYield: number | null;
		}) => {
			const pct = (v: number) => `${v > 0 ? '+' : ''}${String(v).replace('.', ',')}`;
			const out: string[] = [];
			out.push(
				`Tilastokeskus julkaisi neliöhinnan ${s.areas} postinumeroalueelta; julkaistuja kauppoja kirjattiin ${s.transactions} ja julkaistujen alueiden mediaanineliöhinta oli ${s.median} €/m².`
			);
			if (s.chg !== null) {
				out.push(
					`Vuodentakaiseen verrattuna neliöhinnat ${s.chg < 0 ? 'laskivat' : 'nousivat'} julkaistuilla alueilla keskimäärin ${pct(Math.abs(s.chg)).replace('+', '')} % (kauppamäärillä painotettu, huonetyypeittäin vakioitu).`
				);
			}
			if (s.riser && s.faller) {
				out.push(
					`Voimakkainta nousu oli alueella ${s.riser.name} (${pct(s.riser.value)} %); suurin lasku kirjattiin alueella ${s.faller.name} (${pct(s.faller.value)} %).`
				);
			}
			if (s.medianYield !== null) {
				out.push(
					`Tilastovuokriin suhteutettu bruttovuokratuotto oli mediaanialueella ${String(s.medianYield).replace('.', ',')} %.`
				);
			}
			return out;
		},
		katsausDisclaimer:
			'Katsaus muodostetaan automaattisesti sivun tilastoista. Se ei ole sijoitusneuvo.',
		countryPriceTitle: 'Koko maan hintakehitys (kerrostalot)',
		countryVolumeTitle: 'Koko maan myyntimäärät (kerrostalot)',
		countrySource: 'Lähde: Tilastokeskus 13mv',
		divergence: {
			title: 'Alueellinen eriytyminen: pääkaupunkiseutu vs. muu Suomi',
			lede: 'Kerrostalojen toteutuneet neliöhinnat indeksoituna: sama lähtötaso vuonna 2020, joten viivojen etäisyys kertoo markkinoiden eriytymisen.',
			unit: (base: number) => `indeksi, ${base} = 100`,
			pks: 'PKS',
			msu: 'Muu Suomi',
			variantLabel: 'Hintasarjan tyyppi',
			nominal: 'Nimellinen',
			real: 'Reaalinen',
			realNote:
				'Reaalinen sarja on deflatoitu kuluttajahintaindeksillä: se näyttää hintakehityksen suhteessa yleiseen hintatasoon.',
			source: 'Lähde: Tilastokeskus 13mv · KHI 11xs'
		},
		bandsTitle: 'Neliöhintojen jakauma',
		bandsUnit: 'postinumeroalueet hintaluokittain',
		bandsAreas: 'aluetta',
		bandsTransactions: 'kauppaa',
		statsMedian: 'Mediaani',
		statsP25: 'Alakvartiili',
		statsP75: 'Yläkvartiili',
		statsTransactions: 'Kauppoja / 4 nelj.',
		statsAreas: 'Alueita',
		statsChange: '12 kk muutos',
		statsYield: 'Mediaanituotto',
		topExpensive: 'Kalleimmat alueet',
		topCheapest: 'Edullisimmat alueet',
		topVolume: 'Vaihdetuimmat alueet',
		topYield: 'Korkeimmat vuokratuotot',
		topRisers: 'Suurimmat nousijat 12 kk',
		topFallers: 'Suurimmat laskijat 12 kk',
		topHint: 'Vähintään 10 kauppaa neljällä neljänneksellä. Avaa alueen sivu tai esitäytä vertailu suoraan.',
		rowPrefillCta: 'Esitäytä',
		topYieldHint: 'Bruttotuotto ennen vastikkeita ja veroja. Korkea tuotto heijastaa usein myös korkeampaa riskiä.',
		colArea: 'Alue',
		colPrice: '€/m²',
		colN: 'Kauppoja',
		colYield: 'Tuotto-%',
		colChange: 'Muutos-%',
		csvCta: 'Lataa aluetaulukko (CSV)',
		csvNote: 'Kaikki julkaistut alueet tunnuslukuineen.',
		attribution: 'Lähde: Tilastokeskus (13mt, asvu 13eb, 13mv, Paavo, CC BY 4.0).'
	},

	// Colon-label titles/descriptions on purpose ("Helsinki: ...") — Finnish
	// place names inflect irregularly (Helsinki -> Helsingin/Helsingissä,
	// Turku -> Turun), and there's no lookup table for every town/area name
	// here, so copy never grammatically inflects the {town}/{nimi} value.
	kaupunki: {
		eyebrow: 'Kaupunki',
		lede: 'Toteutuneet asuntokauppojen neliöhinnat postinumeroalueittain, Tilastokeskuksen tilastoista.',
		indexEyebrow: 'Kaupungit',
		indexH1: 'Asuntojen hinnat kaupungeittain',
		indexLede: 'Toteutuneet asuntokauppojen neliöhinnat postinumeroalueittain, ryhmiteltynä kaupungeittain. Tilastokeskuksen tilastoista.',
		indexMetaTitle: 'Asuntojen hinnat kaupungeittain | RehtiArvio',
		indexMetaDescription: 'Toteutuneet asuntokauppojen neliöhinnat postinumeroalueittain, ryhmiteltynä kaupungeittain. Tilastokeskuksen tilastoista.',
		metaTitle: (town: string) => `${town}: asuntojen neliöhinnat postinumeroalueittain | RehtiArvio`,
		metaDescription: (town: string, median: string, n: number) =>
			`${town}: asuntojen mediaanineliöhinta ${median} €/m², ${n} postinumeroaluetta. Toteutuneet kauppahinnat Tilastokeskuksen tilastoista.`,
		statMedian: 'Mediaanihinta',
		statAreas: 'Postinumeroaluetta',
		statTransactions: 'Kauppoja / 4 nelj.',
		tableTitle: 'Postinumeroalueet',
		colArea: 'Alue',
		colPrice: '€/m²',
		colN: 'Kauppoja',
		colChange: 'Muutos 12 kk',
		colYield: 'Tuotto-%',
		rowHint: 'Avaa alueen oma sivu tarkempiin tietoihin, tai esitäytä vertailu suoraan.',
		openArea: 'Avaa alueen sivu',
		prefillCta: 'Esitäytä',
		backToKartta: 'Avaa koko maan kartta →',
		notFound: 'Kaupunkia ei löytynyt.',
		attribution: 'Lähde: Tilastokeskus (13mt, asvu 13eb, CC BY 4.0).'
	},

	postinumero: {
		eyebrow: 'Postinumeroalue',
		metaTitle: (pc: string, nimi: string) => `${pc} ${nimi}: asuntojen neliöhinnat | RehtiArvio`,
		metaDescription: (pc: string, nimi: string, eur: string) =>
			`${pc} ${nimi}: toteutunut asuntokauppojen neliöhinta ${eur} €/m², Tilastokeskuksen tilastoista.`,
		statPrice: 'Neliöhinta',
		statN: 'Kauppoja / 4 nelj.',
		statChange: 'Muutos 12 kk',
		statYield: 'Vuokratuotto (brutto)',
		statPriceIncome: 'Hinta / tulot',
		statLiquidity: 'Kauppaa / 1 000 asuntoa',
		prefillCta: 'Esitäytä vertailu tälle alueelle →',
		townTitle: 'Muut postinumeroalueet',
		backToKartta: 'Avaa koko maan kartta →',
		notFound: 'Postinumeroaluetta ei löytynyt.',
		attribution: 'Lähde: Tilastokeskus (13mt, asvu 13eb, Paavo, CC BY 4.0).'
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
			'Hinnat päivittyvät neljä kertaa vuodessa, kun Tilastokeskus julkaisee uudet luvut. Tilastojen tunnisteet (13mt, 13mv, 15hw, asvu 13eb sekä Paavo-aluetilasto) löytyvät sivun alatunnisteesta ja Kartta-sivun lähdemerkinnöistä.',
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
		metricsTitle: 'Kartan tunnusluvut',
		metricsIntro:
			'Kartta-sivun karttatasot, taulukot ja CSV-vienti käyttävät seuraavia tunnuslukuja. Jokainen lasketaan vain, kun havaintoja on riittävästi. Muuten arvo jätetään näyttämättä sen sijaan, että tilalle keksittäisiin luku.',
		metrics: [
			{
				name: 'Neliöhinta (€/m²)',
				desc: 'Toteutuneiden kauppojen keskineliöhinta neljältä viimeiseltä neljännekseltä, painotettu kauppamäärillä (Tilastokeskus 13mt).'
			},
			{
				name: 'Muutos 12 kk',
				desc: 'Neliöhintojen muutos edellisvuoden vastaavaan neljään neljännekseen. Lasketaan huonetyypeittäin ja painotetaan kauppamäärillä, jotta myyntirakenteen muutos ei näy hinnanmuutoksena. Näytetään vain, jos molemmissa jaksoissa on vähintään 10 julkaistua kauppaa.'
			},
			{
				name: 'Vuokratuotto (brutto)',
				desc: 'Alueen tilastovuokra 12 kuukaudelta jaettuna saman huonetyypin toteutuneella neliöhinnalla (asvu 13eb / 13mt), painotettu kauppamäärillä. Bruttoluku: ei sisällä vastikkeita, veroja eikä tyhjiä kuukausia. Puuttuvia postinumeroalueita ei paikata kuntatason vuokrilla.'
			},
			{
				name: 'Hinta / tulot',
				desc: '60 m² asunnon hinta alueen neliöhinnalla jaettuna alueen aikuisväestön mediaanivuosituloilla (Paavo). Karkea kohtuuhintaisuuden mittari: mitä suurempi luku, sitä kireämpi hintataso suhteessa paikalliseen ostovoimaan.'
			},
			{
				name: 'Likviditeetti',
				desc: 'Julkaistut kaupat neljältä neljännekseltä tuhatta asuntoa kohden (13mt / Paavo). Vähimmäisarvio: tilastosalauksen piilottamat kaupat eivät ole mukana. Ohuilla markkinoilla yksittäiset kaupat heiluttavat hintatilastoa enemmän.'
			},
			{
				name: 'Alueellinen eriytyminen',
				desc: 'Pääkaupunkiseudun ja muun Suomen kerrostalohinnat indeksisarjoina (13mv), perusvuosi 2020 = 100. Reaalinen sarja on deflatoitu kuluttajahintaindeksillä (KHI 11xs).'
			}
		],
		limitsTitle: 'Mitä aluetilasto ei kerro',
		limitsIntro:
			'Aluetason tilasto on rehellinen vain, jos sen rajat sanotaan ääneen. Nämä tunnetut vinoumat on validoitu vertaamalla tilastoja eläviin myynti-ilmoituksiin:',
		limits: [
			'Uudiskohteet: uudistuotannon preemio alueen keskiarvoon nähden voi olla kymmeniä prosentteja, ja tiiviin uudisrakentamisen alueilla suhde voi kääntyä toisinpäin.',
			'Huoneistokoko: pienet yksiöt myydään tyypillisesti alueen keskineliöhintaa kalliimmalla ja suuret perheasunnot halvemmalla.',
			'Alueen sisäinen hajonta: sama postinumeroalue voi sisältää sekä arvokorttelin että lähiön, eikä keskiarvo kuvaa kumpaakaan täydellisesti.',
			'Salatut solut: Tilastokeskus ei julkaise vähäisten havaintojen soluja (vuokratilastossa raja on 20 havaintoa). Puuttuva arvo ei tarkoita nollaa, eikä salattua arvoa koskaan korvata toisella luvulla.',
			'Vuokratilasto painottuu vapaarahoitteisiin vuokrasuhteisiin, ja yksittäisen asunnon vuokra voi poiketa alueen tilastovuokrasta selvästi.'
		],
		coverageTitle: 'Katettu alue',
		coverageCount: (n: number) => `Vertailuhinnat kattavat ${n.toLocaleString('fi-FI')} postinumeroaluetta eri puolilla Suomea.`,
		faqTitle: 'Usein kysyttyä',
		faq: [
			{
				q: 'Mistä RehtiArvion hintatiedot tulevat?',
				a: 'Kaikki hinnat ovat Tilastokeskuksen keräämiä tietoja oikeista, jo tehdyistä asuntokaupoista. Emme käytä pyyntihintoja emmekä välittäjien arvioita.'
			},
			{
				q: 'Kuinka luotettava hinta-arvio on?',
				a: 'Riippuu kauppojen määrästä alueella. Vähintään 30 kauppaa omalta postinumeroalueelta antaa tarkan vertailun; harvemmalla siirrytään laajempaan aluevertailuun tai asunnon kunnon perusteella tehtyyn suuntaa antavaan kuntoarvioon.'
			},
			{
				q: 'Miten hinta-arvio lasketaan käytännössä?',
				a: 'Liität myynti-ilmoituksen linkin tai tekstin. Työkalu poimii hinnan, pinta-alan, huoneluvun ja remontit, ja vertaa niitä saman postinumeroalueen toteutuneisiin kauppoihin viimeisen vuoden ajalta.'
			},
			{
				q: 'Onko RehtiArvio virallinen arviolausunto?',
				a: 'Ei. Emme anna virallisia arviolausuntoja emmekä sijoitusneuvoja, emmekä tee kuntotarkastusta — se on aina ostajan omalla vastuulla.'
			},
			{
				q: 'Kuinka usein hinnat päivittyvät?',
				a: 'Neljä kertaa vuodessa, kun Tilastokeskus julkaisee uudet luvut.'
			},
			{
				q: 'Maksaako RehtiArvion käyttö?',
				a: 'Perusvertailu ja Kartta-sivu ovat ilmaisia. Taloyhtiöraportti ja Pro-tilaus ovat maksullisia lisäpalveluita.'
			}
		]
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
		dataLine: (n: number) =>
			`Data: Tilastokeskus 13mt · 13mv · asvu 13eb · ${n.toLocaleString('fi-FI')} postinumeroaluetta julkaistuin hinnoin · päivittyy neljännesvuosittain.`,
		links: {
			why: 'Miksi RehtiArvio?',
			how: 'Miten tämä toimii',
			cities: 'Kaupungit',
			statfi: 'Tilastokeskus (CC BY 4.0)',
			privacy: 'Tietosuoja',
			cookies: 'Evästeet',
			fides: 'Fides Group'
		},
		attribution:
			'Hinta-aineistot: Tilastokeskus (13mt, 15hw, asvu 13eb, CC BY 4.0). Suuntaa antava seula, ei arviolausunto eikä sijoitusneuvonta.'
	},

	consent: {
		bannerAriaLabel: 'Evästeasetukset',
		lede: 'Sivulla on muutama eväste. Pakolliset pyörittävät sivua, loput käynnistyvät vain, jos hyväksyt ne.',
		privacyLink: 'Lue lisää evästeistä',
		acceptAll: 'Hyväksy kaikki',
		rejectAll: 'Hylkää valinnaiset',
		customize: 'Mukauta',
		save: 'Tallenna valinnat',
		back: '← Takaisin',
		saved: 'Valinnat tallennettu.',
		categories: {
			necessary: {
				title: 'Välttämättömät',
				desc: 'Pyörittävät sivua ja tilaajan kirjautumista. Aina päällä, muuten sivu ei toimi.'
			},
			analytics: {
				title: 'Analytiikka',
				desc: 'Kävijämäärät, sivujen käyttö ja se, mitä postinumeroalueita tai hintoja katsot. Näiden avulla näemme, mikä toimii ja mikä ei. Lisätietoa: /tietosuoja.'
			},
			marketing: {
				title: 'Markkinointi',
				desc: 'Ei vielä käytössä. Varattu mahdollista mainontaa varten myöhemmin; kytkin ei tee tällä hetkellä mitään.'
			}
		}
	},

	evasteet: {
		h1: 'Evästeet ja seurannan hallinta',
		lede: 'Kolme ryhmää: välttämättömät ovat aina päällä, analytiikan ja markkinoinnin voit hyväksyä tai hylätä alta milloin tahansa.',
		manageTitle: 'Omat valinnat',
		tableTitle: 'Käytössä olevat evästeet',
		tableCols: { name: 'Nimi', group: 'Ryhmä', purpose: 'Tarkoitus', duration: 'Voimassaolo', setter: 'Asettaja' },
		rows: [
			{ name: 'ra_consent', group: 'Välttämätön', purpose: 'Tallentaa evästevalintasi', duration: '~180 vrk', setter: '1. osapuoli (RehtiArvio)' },
			{ name: 'ra_access', group: 'Välttämätön', purpose: 'Tilaajan kirjautumisen tunnistus', duration: '365 vrk', setter: '1. osapuoli (RehtiArvio)' },
			{ name: 'ph_*_posthog', group: 'Analytiikka', purpose: 'Anonyymi käyttäjätunniste istuntojen välillä, vain jos hyväksyit analytiikan', duration: '~1 v', setter: 'PostHog (eu.posthog.com)' },
			{ name: 'Ei vielä käytössä', group: 'Markkinointi', purpose: 'Täydennetään tähän, kun mainosalusta valitaan', duration: '–', setter: '–' }
		]
	},

	tietosuoja: {
		h1: 'Tietosuojaseloste',
		lede: 'Tässä kerrotaan, mitä tietoa RehtiArvio kerää sivuston kävijöistä, miksi, ja miten pääset käsiksi omiin tietoihisi.',
		updated: 'Päivitetty 22.7.2026 (v1).',
		controllerTitle: 'Rekisterinpitäjä',
		controllerBody:
			'Arttu Hakkarainen / Fides Group, Y-tunnus 3637368-5, Espoo. Rekisteriasioissa: arthakkarainen@gmail.com.',
		whatTitle: 'Mitä kerätään ja millä perusteella',
		whatRows: [
			{
				name: 'Selailu- ja käyttödata',
				basis: 'Suostumus (analytiikka)',
				desc: 'Sivulataukset, klikkaukset ja se, mitä postinumeroalueita tai hintoja katsot. Kerätään PostHogilla (EU, eu.posthog.com), vain jos hyväksyt analytiikan.'
			},
			{
				name: 'Jonotuslistan sähköposti',
				basis: 'Oma pyyntö',
				desc: 'Itse antamasi sähköposti Taloyhtiöraportin jonotuslistalle. Oma valintaruutunsa kertoo, saako osoitteeseen lähettää myös muuta postia.'
			},
			{
				name: 'Tilaajatiedot',
				basis: 'Sopimus',
				desc: 'Sähköposti sekä Stripen asiakas- ja tilaustunnukset, Taloyhtiöraportin tai Pro-tilauksen toimittamista varten.'
			},
			{
				name: 'Taloyhtiöraportin luvut',
				basis: 'Sopimus',
				desc: 'Ostajan liittämistä asiakirjoista koneellisesti poimitut luvut: vastikkeet, lainaosuus, korjausvuodet. Asiakirjatekstiä tai nimiä ei tallenneta.'
			},
			{
				name: 'Suostumusloki',
				basis: 'Suostumuksen todistaminen (laki edellyttää)',
				desc: 'Mitä evästevalintaa teit, milloin ja millä selosteversiolla. Ei IP-osoitetta eikä selaintunnistetta.'
			}
		],
		retentionTitle: 'Säilytysajat',
		retentionRows: [
			{
				name: 'Jonotuslistan sähköpostit',
				period: 'Säilössä niin kauan kuin ne palvelevat tarkoitustaan (jonotuslistan ilmoitus, ja markkinointiluvan antaneilla myös muu posti). Käydään läpi kerran vuodessa.'
			},
			{
				name: 'Suostumusloki',
				period: 'Säilössä todisteena annetusta tai perutusta suostumuksesta. Katsotaan tämäkin läpi vuosittain, vaikka erillistä poistorajaa ei ole.'
			},
			{
				name: 'Analytiikkatapahtumat',
				period: 'Niin pitkään kuin PostHogin projektiasetuksissa on määritetty. Tällä hetkellä valittuna pisin saatavilla oleva aika.'
			},
			{
				name: 'Tilaajatiedot ja taloyhtiöraportit',
				period: 'Asiakassuhteen ajan, ja sen jälkeen niin kauan kuin kirjanpitolaki vaatii.'
			}
		],
		recipientsTitle: 'Kenelle tieto menee',
		recipients: [
			'Supabase (EU, eu-west-1, Irlanti): tietokanta.',
			'PostHog EU Cloud (eu.posthog.com): kävijäanalytiikka, vain suostumuksella.',
			'Vercel: sivuston hosting, laskenta-alue Frankfurt.',
			'Stripe: maksunvälitys tilausten yhteydessä.'
		],
		transfersTitle: 'Tiedon siirtyminen EU:n ulkopuolelle',
		transfersBody:
			'Vercel, Stripe ja PostHog ovat yhdysvaltalaisia yhtiöitä, vaikka itse tieto säilytetään EU-alueella. Tämä nojaa EU:n vakiosopimuslausekkeisiin tai muuhun GDPR:n hyväksymään siirtoperusteeseen.',
		rightsTitle: 'Sinun oikeutesi',
		rightsBody:
			'Voit pyytää pääsyn omiin tietoihisi, pyytää niiden korjaamista tai poistamista, rajoittaa niiden käsittelyä, pyytää tiedot siirrettäväksi toiseen palveluun ja perua suostumuksesi milloin tahansa osoitteessa /evasteet. Jos jokin ei täsmää, voit tehdä kantelun tietosuojavaltuutetulle (tietosuoja.fi). Näitä oikeuksia käytät ottamalla yhteyttä yllä olevaan sähköpostiin.',
		automatedTitle: 'Automaattinen päätöksenteko',
		automatedBody:
			'Hinta-arvio on tilastollinen vertailu, ei sinua koskeva päätös, jolla olisi oikeudellisia vaikutuksia (GDPR 22 artikla).',
		cookiesLink: 'Evästekohtaiset tiedot löytyvät sivulta /evasteet.'
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