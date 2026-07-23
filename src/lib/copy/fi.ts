/**
 * Single source of truth for all Finnish copy on the free version.
 * Voice: warm, plain-spoken Finnish, on the buyer's side. We are not a broker
 * and we don't gain from the sale — so we can just tell it straight. Vary the
 * rhythm, address the reader directly, say each caveat once like advice, not
 * like a disclaimer. Facts, sources and mandated disclaimers stay put.
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
		eyebrow: 'Todelliset kauppahinnat, suoraan tilastoista',
		h1: 'Onko asunnon hinta kohdallaan?',
		lede: 'Liitä ilmoituksen linkki, niin kerromme heti, mitä samalta postinumeroalueelta on oikeasti maksettu. Vertailu tulee suoraan Tilastokeskuksen toteutuneista kaupoista — ei välittäjän arviosta.',

		tabs: {
			url: 'Liitä linkki',
			text: 'Liitä teksti',
			manual: 'Syötä käsin'
		},

		urlPlaceholder: 'https://asunnot.oikotie.fi/myytavat-asunnot/helsinki/…',
		textPlaceholder: 'Avaa ilmoitus selaimessa → valitse kaikki (Ctrl+A) → liitä tähän',
		textPlaceholderTouch: 'Avaa ilmoitus → kopioi sen teksti → liitä tähän',
		analyzeCta: 'Analysoi ilmoitus',
		manualTitle: 'Kerro kohteen perustiedot',
		supportedSources: 'Toimii näissä: Oikotie, Etuovi, Kiinteistömaailma, Remax (https).',
		beginnerToggleOn: 'Sijoittajalle: lisää vuokra ja vastike',
		beginnerToggleOff: 'Aloittelijalle: piilota lisäkentät',
		debtfreeHelper: 'Velaton hinta = myyntihinta + osuus yhtiölainasta. Ilmoituksessa lukee yleensä molemmat.',
		demoLinkCta: 'Katso esimerkkiarvio',
		manualLink: 'tai syötä tiedot itse',
		manualLinkClose: 'piilota käsin syöttö',
		independence:
			'Emme ole välittäjä emmekä hyödy kaupasta mitenkään. Siksi voimme kertoa suoraan, mitä alueella on oikeasti maksettu — luvut ovat Tilastokeskuksen toteutuneita kauppahintoja.',
		privacyNote: 'Emme tallenna ilmoituksia emmekä osoitteita.',

		result: {
			verdictOver: 'yli alueen toteutuneiden kauppojen',
			verdictUnder: 'alle alueen toteutuneiden kauppojen',
			verdictEurOver: (eur: string) =>
				`Hintapyyntö on noin ${eur} € yli sen, mitä alueella on oikeasti maksettu.`,
			verdictEurUnder: (eur: string) =>
				`Hintapyyntö on noin ${eur} € alle sen, mitä alueella on oikeasti maksettu.`,
			verdictNeutral: 'Suuntaa näyttävä arvio',
			noVerdict: 'Ei vertailuarvoa',
			noVerdictReason: 'tälle alueelle ja huonetyypille',
			estimateReason: 'alueelta ei löytynyt tarpeeksi kauppoja vertailuun, joten arvio nojaa kohteen kuntoon',
			confidence: {
				korkea: 'korkea',
				kohtalainen: 'kohtalainen',
				matala: 'matala'
			},
			tier: {
				T1: (n: number) => `Takana ${n} toteutunutta kauppaa juuri tällä postinumeroalueella`,
				T3: (n: number) => `Takana ${n} kauppaa vähän laajemmalta alueelta, joten vertailu on karkeampi`,
				T4: 'Vertailukauppoja on liian vähän, joten arvio nojaa kohteen kuntoon'
			},
			statListing: 'Kohteen neliöhinta',
			statBenchmark: 'Alueen kaupat',
			statConfidence: 'Luotettavuus',
			factorsTitle: 'Mistä luku muodostui?',
			factorsToggle: 'Näytä selitykset',
			factorsClose: 'Piilota selitykset',
			flagsTitle: 'Mitä kannattaa pitää mielessä',
			asuntocardTitle: 'Taloyhtiöraportti: syväsukellus taloyhtiöön',
			asuntocardBeta: 'beta',
			asuntocardLede:
				'Kokoaa yhteen remonttihistorian, saman taloyhtiön muut myynnit ja tonttitiedot julkisista lähteistä. Saat raportin muutamassa minuutissa.',
			asuntocardCta: 'Tilaa Taloyhtiöraportti',
			asuntocardNoSub: 'Ei vielä tilausta?'
		},

		priceMap: {
			eyebrow: 'Datasta',
			title: 'Postinumeroalueiden neliöhinnat',
			source: 'Lähde: Tilastokeskus 13mt · 4 viimeistä neljännestä',
			hint: 'Keltainen on edullinen, punainen kallis. Klikkaa aluetta, niin esitäytämme vertailun sinulle.',
			openFull: 'Avaa kartta →'
		},

		examples: {
			eyebrow: 'Esimerkkejä erilaisista kohteista',
			title: 'Miltä arvio näyttää eri asunnoille?',
			rows: {
				area: 'Alueen kaupat',
				priceLevel: 'Alueen hintataso',
				rent: 'Vuokra-arvio',
				yield: 'Bruttotuotto'
			},
			takes: {
				'yksio-helsinki':
					'Pienestä yksiöstä maksetaan usein enemmän per neliö kuin alueella keskimäärin. Vertailu näyttää, kuinka iso tuo lisähinta on.',
				'kaksio-tampere':
					'Kaksioita vaihtaa omistajaa eniten, joten niissä vertailu osuu yleensä tarkimmilleen.',
				'kolmio-turku':
					'Iso perheasunto jää usein alueen neliökeskihinnan alle. Sen huomaa hyvin, kun istut neuvottelupöytään.',
				'kaksio-oulu':
					'Edullisemmalla alueella tilastovuokra nostaa bruttotuoton selvästi kasvukeskuksia korkeammaksi.'
			} as Record<string, string>,
			disclaimer:
				'Luvut ovat aluetason tilastoja (Tilastokeskus 13mt ja asvu), eivät arvioita yksittäisistä kohteista. Emme ole välittäjä.'
		},

		market: {
			eyebrow: 'Markkinat juuri nyt',
			transactions: 'Kauppoja / 4 nelj.',
			change12: '12 kk hintakehitys',
			forecast12: '12 kk trendiennuste',
			areas: 'Aluetta, joilta hinta julkaistu',
			mostExpensive: 'Kallein alue',
			cheapest: 'Edullisin alue',
			countrySub: 'koko maa, kerrostalot',
			source: 'Lähde: Tilastokeskus 13mt · 13mv',
			methodToggle: 'Mistä nämä luvut lasketaan?'
		},

		report: {
			factsTitle: 'Mitä ilmoituksesta poimittiin',
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
				'Naapurustossa toteutuneet kaupat, painotettuna sen mukaan, kuinka lähellä osoitetta ne ovat.',
			locationWeighted: 'Sijaintipainotettu hintataso',
			locationDelta: 'Kohde vs. sijaintipainotettu',
			locationCols: { area: 'Alue', price: '€/m²', dist: 'Etäisyys' },
			estimateTitle: 'Hinta-arvion haarukka',
			estimateAssumptions: 'Oletukset',
			insightsTitle: 'Poimintoja ilmoituksesta',
			renoTitle: 'Tehdyt ja tulossa olevat remontit',
			renoDone: 'Tehty',
			renoUpcoming: 'Tulossa',
			renoNone: 'Ilmoituksessa ei mainittu remontteja. Pyydä isännöitsijäntodistus ja kunnossapitotarveselvitys, niin näet koko kuvan.',
			historyLoading: 'Haetaan alueen hintahistoriaa Tilastokeskuksesta…',
			shareCta: 'Avaa jaettava arvio →',
			shareHint: 'Linkissä on arvion luvut, mutta ei ilmoituksen tekstiä.',
			sourceLine: (host: string) => `Analysoitu ilmoituksesta (${host}), yhtenä sinun pyytämänäsi hakuna.`
		},

		methodNote:
			'Näin lasketaan: kohteen neliöhintaa verrataan siihen, mitä alueella on toteutuneissa kaupoissa maksettu neljän viime neljänneksen aikana (kauppamäärillä painotettu keskiarvo). Mitä enemmän vertailukauppoja, sitä luotettavampi luku.',

		waitlist: {
			eyebrow: 'Tulossa',
			title: 'Taloyhtiöraportti',
			placeholder: 'nimi@esimerkki.fi',
			cta: 'Liity jonoon',
			success: 'Kiitos! Sähköpostisi on tallessa.',
			errorGeneric: 'Tallennus ei nyt onnistunut. Yritäthän hetken kuluttua uudelleen.',
			errorInvalid: 'Tarkistathan sähköpostiosoitteen.',
			marketingOptIn: 'Saan myös muuta RehtiArvion postia sähköpostiini.'
		}
	},

	arvio: {
		titlePrefix: 'RehtiArvio: ',
		copyCta: 'Kopioi linkki',
		copied: 'Linkki kopioitu',
		copyError: 'Kopiointi ei onnistunut',
		shareOnMobile: 'Jaa',
		transcript: 'Toteutuneet kaupat',
		noVerdictLabel: 'Tälle alueelle ei ole vertailuarvoa.',
		shareRow: {
			title: 'Jaa arvio',
			hint: 'Linkissä on kaikki arvion luvut. Tiliä ei tarvita.'
		},
		yield: {
			title: 'Vuokratuotto',
			rentRow: 'Vuokra-arvio',
			gross: 'Bruttotuotto',
			net: 'Nettotuotto',
			monthlyNet: 'Nettokassavirta / kk',
			reserve: 'Remonttivaraus / v',
			note: 'Mukana varainsiirtovero 1,5 % (vero.fi 2026). Remonttivaraus on oletusarvo, jonka voit korvata omalla luvullasi.',
			rentIsEstimate: (q?: string | null) => `Vuokra on alueen tilastollinen arvio${q ? ` (${q})` : ''}, ei kohteen toteutunut vuokra.`
		},
		quarterRange: 'Neljännesvaihtelu',
		location: {
			title: 'Sijainti',
			hint: 'Postinumeroalue hintakartalla. Väri kertoo alueen toteutuneen neliöhinnan.'
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
			vastikeUnknown: 'Hoitovastiketta ei annettu, joten omistuksen todelliset kulut ovat tässä näytettyä suuremmat.',
			note: 'Korko-oletus 3,5 % velattomasta hinnasta, laskettu puhtaana kuluna. Mukana ei ole lainanlyhennystä eikä arvonmuutosta: lyhennys kasvattaa varallisuuttasi, arvonmuutos taas on riski molempiin suuntiin.'
		},
		notes: {
			title: 'Hyvä pitää mielessä',
			transferTax: (eur: string) => `Ostajalle tulee maksettavaksi varainsiirtovero noin ${eur} € (1,5 %, vero.fi).`,
			pipeNear: 'Talo lähestyy tyypillistä putkiremontti-ikää. Tarkista ilmoituksesta tai isännöitsijältä, mitä on jo tehty.',
			pipeIn: 'Talo on tyypillisessä putkiremontti-iässä. Varmista, onko putkiremontti jo tehty vai vielä edessä.',
			pipeDone: 'Putkiremontti on ilmoituksen mukaan tehty — talon suurin yksittäinen remonttiriski on siis takana.',
			trend: (pct: string, from: number, to: number) =>
				`Alueen keskihinnat ovat liikkuneet keskimäärin ${pct} % vuodessa (${from}–${to}).`
		},
		history: {
			priceTitle: 'Miten alueen keskihinnat ovat kehittyneet',
			priceUnit: '€/m² vuosikeskiarvo',
			volumeTitle: 'Miten alueen myyntimäärät ovat kehittyneet',
			volumeUnit: 'julkaistut kaupat / vuosi',
			trendLabel: 'Keskimääräinen vuosimuutos',
			last12Label: 'Viimeisen 12 kk hintakehitys',
			forecastLabel: 'Seuraavan 12 kk trendiennuste',
			forecastSeries: 'Ennuste',
			forecastNote:
				'Ennuste jatkaa alueen toteutunutta hintakehitystä suorana viivana (enintään 5 v). Se näyttää suuntaa, ei lupaa mitään tulevasta.',
			source: 'Lähde: Tilastokeskus 13mt',
			partialNote: 'Viimeisin vuosi voi olla vielä vajaa.'
		},
		method: {
			title: 'Näin luku syntyy',
			items: [
				'Kohteen neliöhinta = velaton hinta jaettuna asuinpinta-alalla.',
				'Vertailutaso on se, mitä postinumeroalueella on toteutuneissa kaupoissa maksettu neljän viime neljänneksen aikana (kauppamäärillä painotettu keskihinta, Tilastokeskus 13mt).',
				'Jos omalta alueelta löytyy alle 30 kauppaa, vertailu laajenee kuntatasolle ja luotettavuusluokka laskee.',
				'Tilastokeskus ei julkaise alle 20 kaupan soluja. Puuttuvaa arvoa emme koskaan paikkaa toisella luvulla.',
				'Ero näytetään aina yhdessä luotettavuusluokan ja varausten kanssa — ei koskaan pelkkänä prosenttina.'
			]
		},
		back: '← Takaisin hakuun',
		ogFallback: 'Toteutuneet hinnat, ei mielipiteet.'
	},

	kartta: {
		title: 'Kartta',
		h1: 'Asuntomarkkinat postinumeroalueittain',
		lede: 'Toteutuneet neliöhinnat, 12 kuukauden hintakehitys, bruttovuokratuotot ja markkinan vilkkaus samalla kartalla. Klikkaa aluetta, niin esitäytämme vertailun sinulle.',
		legendNoData: 'Katkoviivalla merkityltä alueelta ei ole julkaistua arvoa valitulle tunnusluvulle.',
		noValue: 'ei julkaistua arvoa',
		tapHint: 'Napauta aluetta, niin näet luvut.',
		panelUse: 'Käytä vertailussa',
		panelClose: 'Sulje tietoruutu',
		modesLabel: 'Kartan tunnusluku',
		modes: {
			eur: 'Neliöhinta',
			chg: 'Muutos 12 kk',
			yld: 'Vuokratuotto',
			pir: 'Hinta / tulot',
			liq: 'Vilkkaus'
		},
		modeUnits: {
			yld: 'brutto / v',
			pir: 'vuoden mediaanituloa',
			liq: 'kauppaa / 1 000 asuntoa'
		},
		modeLedes: {
			eur: 'Mitä alueella on keskimäärin maksettu neliöltä neljän viime neljänneksen aikana.',
			chg: 'Paljonko neliöhinnat ovat liikkuneet vuodentakaisesta. Laskettu huonetyypeittäin ja painotettu kauppamäärillä, jottei myyntien rakenteen muutos näyttäisi hinnanmuutokselta.',
			yld: 'Bruttovuokratuotto: alueen tilastovuokra (12 kk) suhteessa saman huonetyypin toteutuneisiin neliöhintoihin. Vastikkeet ja verot eivät ole tässä mukana.',
			pir: '60 m² asunnon velaton hinta suhteessa alueen aikuisväestön mediaanivuosituloihin. Mitä isompi luku, sitä kireämpi hintataso paikalliseen ostovoimaan nähden.',
			liq: 'Neljän neljänneksen kaupat suhteessa alueen asuntokantaan. Hiljaisilla alueilla yksittäinen kauppa heiluttaa hintatilastoa herkemmin.'
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
				`Tilastokeskus julkaisi neliöhinnan ${s.areas} postinumeroalueelta. Kauppoja kirjattiin ${s.transactions}, ja näiden alueiden mediaanineliöhinta oli ${s.median} €/m².`
			);
			if (s.chg !== null) {
				out.push(
					`Vuodentakaiseen verrattuna neliöhinnat ${s.chg < 0 ? 'laskivat' : 'nousivat'} keskimäärin ${pct(Math.abs(s.chg)).replace('+', '')} % (kauppamäärillä painotettu, huonetyypeittäin vakioitu).`
				);
			}
			if (s.riser && s.faller) {
				out.push(
					`Kovinta nousu oli alueella ${s.riser.name} (${pct(s.riser.value)} %), ja jyrkin lasku alueella ${s.faller.name} (${pct(s.faller.value)} %).`
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
			'Katsaus kootaan automaattisesti sivun tilastoista. Se ei ole sijoitusneuvo.',
		countryPriceTitle: 'Koko maan hintakehitys (kerrostalot)',
		countryVolumeTitle: 'Koko maan myyntimäärät (kerrostalot)',
		countrySource: 'Lähde: Tilastokeskus 13mv',
		divergence: {
			title: 'Alueet erkanevat: pääkaupunkiseutu vs. muu Suomi',
			lede: 'Kerrostalojen toteutuneet neliöhinnat indeksoituna samaan lähtötasoon vuonna 2020. Mitä kauemmas viivat karkaavat toisistaan, sitä enemmän markkinat ovat eriytyneet.',
			unit: (base: number) => `indeksi, ${base} = 100`,
			pks: 'PKS',
			msu: 'Muu Suomi',
			variantLabel: 'Hintasarjan tyyppi',
			nominal: 'Nimellinen',
			real: 'Reaalinen',
			realNote:
				'Reaalisesta sarjasta on poistettu yleinen hintojen nousu kuluttajahintaindeksillä. Se näyttää, miten asuntohinnat liikkuivat suhteessa muuhun hintatasoon.',
			source: 'Lähde: Tilastokeskus 13mv · KHI 11xs'
		},
		bandsTitle: 'Miten neliöhinnat jakautuvat',
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
		topVolume: 'Vilkkaimmat alueet',
		topYield: 'Parhaat vuokratuotot',
		topRisers: 'Kovimmat nousijat 12 kk',
		topFallers: 'Jyrkimmät laskijat 12 kk',
		topHint: 'Mukana vähintään 10 kauppaa neljällä neljänneksellä. Avaa alueen sivu tai esitäytä vertailu suoraan.',
		rowPrefillCta: 'Esitäytä',
		topYieldHint: 'Bruttotuotto ennen vastikkeita ja veroja. Korkea tuotto tarkoittaa usein myös korkeampaa riskiä.',
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
		lede: 'Mitä asunnoista on oikeasti maksettu, postinumeroalue kerrallaan — suoraan Tilastokeskuksen tilastoista.',
		indexEyebrow: 'Kaupungit',
		indexH1: 'Asuntojen hinnat kaupungeittain',
		indexLede: 'Toteutuneet neliöhinnat postinumeroalueittain, kaupungeittain koottuna. Kaikki suoraan Tilastokeskuksen tilastoista.',
		indexMetaTitle: 'Asuntojen hinnat kaupungeittain | RehtiArvio',
		indexMetaDescription: 'Katso, mitä asunnoista on oikeasti maksettu eri kaupungeissa — toteutuneet neliöhinnat postinumeroalueittain, suoraan Tilastokeskuksen tilastoista.',
		metaTitle: (town: string) => `${town}: asuntojen neliöhinnat postinumeroalueittain | RehtiArvio`,
		metaDescription: (town: string, median: string, n: number) =>
			`${town}: asuntojen mediaanineliöhinta ${median} €/m², ${n} postinumeroaluetta. Toteutuneet kauppahinnat suoraan Tilastokeskuksen tilastoista.`,
		statMedian: 'Mediaanihinta',
		statAreas: 'Postinumeroaluetta',
		statTransactions: 'Kauppoja / 4 nelj.',
		tableTitle: 'Postinumeroalueet',
		colArea: 'Alue',
		colPrice: '€/m²',
		colN: 'Kauppoja',
		colChange: 'Muutos 12 kk',
		colYield: 'Tuotto-%',
		rowHint: 'Avaa alueen oma sivu tarkempiin lukuihin, tai esitäytä vertailu suoraan.',
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
			`${pc} ${nimi}: asunnoista on maksettu ${eur} €/m² — toteutuneet kauppahinnat suoraan Tilastokeskuksen tilastoista.`,
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
			'Ilmainen analyysi kertoo, mitä ilmoitus lupaa. Taloyhtiöraportti kertoo, mitä siitä löytyy muualta — jokainen väite lähteineen.',
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
		finePro: 'Vuosimaksun voit valita seuraavassa vaiheessa.',
		faqTitle: 'Usein kysyttyä',
		faq: [
			{ q: 'Voinko peruuttaa?', a: 'Voit. Pro-tilauksen saa poikki milloin vain, ja veloitus loppuu kuluvan kauden päätteeksi.' },
			{ q: 'Mitä tietoja tallennatte?', a: 'Emme tallenna ilmoituksia emmekä osoitteita — vain sähköpostisi tilausta varten.' },
			{ q: 'Miten laskutus toimii?', a: 'Laskutus kulkee Stripen kautta, ja saat kuitin suoraan sähköpostiisi.' },
			{ q: 'Onko kokeilujaksoa?', a: 'Taloyhtiöraportti on kertamaksu, joten siinä ei ole kokeilujaksoa. Pro-tilaukseen lisätään 14 päivän kokeilu myöhemmin.' },
			{ q: 'Saanko datani ulos?', a: 'Saat. Kaikki Taloyhtiöraportit tulevat PDF:nä, ja Pro-tilaukseen kuuluu myös JSON-vienti.' }
		]
	},

	miksi: {
		h1: 'Toteutuneet hinnat, ei markkinahypeä.',
		lede: 'RehtiArvio kertoo ilmaiseksi, mitä asunnoista on oikeasti maksettu. Hinnat tulevat Tilastokeskukselta, eivät välittäjiltä. Ei mainoksia, ei kaupittelua.',
		dataTitle: 'Mistä hinnat tulevat',
		dataIntro:
			'Jokainen hinta on Tilastokeskuksen keräämä tieto oikeasta, jo tehdystä asuntokaupasta. Emme käytä pyyntihintoja emmekä välittäjien arvioita — vain sitä, mitä kaupoissa on todella maksettu.',
		dataRows: [
			{ code: 'Kerros- ja rivitalot', desc: 'Toteutuneet kauppahinnat postinumeroalueittain.' },
			{ code: 'Omakotitalot', desc: 'Toteutuneet kauppahinnat aluetasolla.' },
			{ code: 'Vuokrat', desc: 'Keskivuokrat postinumeroalueittain.' }
		],
		dataNote:
			'Hinnat päivittyvät neljästi vuodessa, aina kun Tilastokeskus julkaisee tuoreet luvut. Käytetyt tilastot (13mt, 13mv, 15hw, asvu 13eb sekä Paavo-aluetilasto) näet sivun alatunnisteesta ja Kartta-sivun lähdemerkinnöistä.',
		howTitle: 'Näin vertailu toimii',
		howSteps: [
			'Liität myynti-ilmoituksen linkin tai tekstin.',
			'Poimimme siitä hinnan, pinta-alan, huoneluvun ja remontit.',
			'Vertaamme hintaa saman postinumeroalueen kauppoihin viimeisen vuoden ajalta.',
			'Näet euroissa, onko pyyntihinta yli vai alle alueen tason — ja kuinka moneen kauppaan vertailu nojaa.'
		],
		howFallback: 'Jos alueelta löytyy alle 30 kauppaa, annamme sen sijaan hinta-arvion asunnon kunnon perusteella. Sen merkitsemme aina suuntaa näyttäväksi.',
		dontTitle: 'Mitä emme tee',
		dontItems: [
			'Emme anna virallisia arviolausuntoja emmekä sijoitusneuvoja.',
			'Emme tee kuntotarkastusta — se on ostajan tehtävä.',
			'Emme näytä mainoksia emmekä myy tietojasi eteenpäin.',
			'Emme tallenna ilmoituksia emmekä osoitteita.'
		],
		tierTitle: 'Kuinka luotettava vertailu on',
		tiers: [
			{ name: 'Tarkka vertailu', desc: 'Asunnon omalta postinumeroalueelta löytyi vähintään 30 kauppaa. Tämä on luotettavin taso.' },
			{ name: 'Aluevertailu', desc: 'Omalta alueelta ei löytynyt tarpeeksi kauppoja, joten vertaamme laajempaan alueeseen. Karkeampi taso.' },
			{ name: 'Kuntoarvio', desc: 'Kauppoja on liian vähän vertailuun, joten annamme hintahaarukan asunnon kunnon perusteella. Aina suuntaa näyttävä.' }
		],
		metricsTitle: 'Kartan tunnusluvut',
		metricsIntro:
			'Kartta-sivun karttatasot, taulukot ja CSV-vienti nojaavat näihin tunnuslukuihin. Jokainen lasketaan vain, kun havaintoja on tarpeeksi. Muuten arvo jää näyttämättä — emme keksi tilalle lukua.',
		metrics: [
			{
				name: 'Neliöhinta (€/m²)',
				desc: 'Toteutuneiden kauppojen keskineliöhinta neljältä viime neljännekseltä, kauppamäärillä painotettuna (Tilastokeskus 13mt).'
			},
			{
				name: 'Muutos 12 kk',
				desc: 'Neliöhintojen muutos vuodentakaiseen samaan neljään neljännekseen. Laskettu huonetyypeittäin ja painotettu kauppamäärillä, jottei myyntien rakenteen muutos näyttäisi hinnanmuutokselta. Näytetään vain, kun molemmissa jaksoissa on vähintään 10 julkaistua kauppaa.'
			},
			{
				name: 'Vuokratuotto (brutto)',
				desc: 'Alueen 12 kuukauden tilastovuokra jaettuna saman huonetyypin toteutuneella neliöhinnalla (asvu 13eb / 13mt), kauppamäärillä painotettuna. Bruttoluku: ei sisällä vastikkeita, veroja eikä tyhjiä kuukausia. Puuttuvia postinumeroalueita emme paikkaa kuntatason vuokrilla.'
			},
			{
				name: 'Hinta / tulot',
				desc: '60 m² asunnon hinta alueen neliöhinnalla, jaettuna alueen aikuisväestön mediaanivuosituloilla (Paavo). Karkea mittari hintojen kohtuullisuudelle: mitä isompi luku, sitä kireämpi hintataso paikalliseen ostovoimaan nähden.'
			},
			{
				name: 'Vilkkaus',
				desc: 'Neljän neljänneksen julkaistut kaupat tuhatta asuntoa kohden (13mt / Paavo). Vähimmäisarvio: tilastosalauksen piilottamat kaupat eivät ole mukana. Hiljaisilla alueilla yksittäinen kauppa heiluttaa hintatilastoa herkemmin.'
			},
			{
				name: 'Alueiden erkaneminen',
				desc: 'Pääkaupunkiseudun ja muun Suomen kerrostalohinnat indeksisarjoina (13mv), perusvuosi 2020 = 100. Reaalisesta sarjasta on poistettu yleinen hintojen nousu kuluttajahintaindeksillä (KHI 11xs).'
			}
		],
		limitsTitle: 'Mitä aluetilasto ei kerro',
		limitsIntro:
			'Aluetason tilasto on rehellinen vain, jos sen rajat sanotaan ääneen. Nämä tunnetut vinoumat olemme tarkistaneet vertaamalla tilastoja eläviin myynti-ilmoituksiin:',
		limits: [
			'Uudiskohteet: uudistuotannon lisähinta alueen keskiarvoon nähden voi olla kymmeniä prosentteja, ja tiiviin uudisrakentamisen alueilla suhde voi kääntyä toisin päin.',
			'Huoneistokoko: pienestä yksiöstä maksetaan yleensä alueen keskiarvoa enemmän per neliö, isosta perheasunnosta vähemmän.',
			'Alueen sisäinen hajonta: sama postinumeroalue voi sisältää sekä arvokorttelin että lähiön, eikä keskiarvo kuvaa kumpaakaan täydellisesti.',
			'Salatut solut: Tilastokeskus ei julkaise vähäisten havaintojen soluja (vuokratilastossa raja on 20 havaintoa). Puuttuva arvo ei tarkoita nollaa, emmekä koskaan korvaa salattua arvoa toisella luvulla.',
			'Vuokratilasto painottuu vapaarahoitteisiin vuokrasuhteisiin, ja yksittäisen asunnon vuokra voi poiketa alueen tilastovuokrasta selvästikin.'
		],
		coverageTitle: 'Kuinka laajalta löytyy tietoa',
		coverageCount: (n: number) => `Vertailuhinnat kattavat ${n.toLocaleString('fi-FI')} postinumeroaluetta eri puolilta Suomea.`,
		faqTitle: 'Usein kysyttyä',
		faq: [
			{
				q: 'Mistä RehtiArvion hintatiedot tulevat?',
				a: 'Jokainen hinta on Tilastokeskuksen keräämä tieto oikeasta, jo tehdystä asuntokaupasta. Emme käytä pyyntihintoja emmekä välittäjien arvioita.'
			},
			{
				q: 'Kuinka luotettava hinta-arvio on?',
				a: 'Se riippuu alueen kauppojen määrästä. Vähintään 30 kauppaa omalta postinumeroalueelta antaa tarkan vertailun; harvemmalla siirrymme laajempaan aluevertailuun tai asunnon kunnon perusteella tehtyyn suuntaa näyttävään kuntoarvioon.'
			},
			{
				q: 'Miten hinta-arvio käytännössä lasketaan?',
				a: 'Liität myynti-ilmoituksen linkin tai tekstin. Poimimme siitä hinnan, pinta-alan, huoneluvun ja remontit, ja vertaamme niitä saman postinumeroalueen toteutuneisiin kauppoihin viimeisen vuoden ajalta.'
			},
			{
				q: 'Onko RehtiArvio virallinen arviolausunto?',
				a: 'Ei ole. Emme anna virallisia arviolausuntoja emmekä sijoitusneuvoja, emmekä tee kuntotarkastusta — se jää aina ostajan omalle vastuulle.'
			},
			{
				q: 'Kuinka usein hinnat päivittyvät?',
				a: 'Neljästi vuodessa, aina kun Tilastokeskus julkaisee tuoreet luvut.'
			},
			{
				q: 'Maksaako RehtiArvion käyttö?',
				a: 'Perusvertailu ja Kartta-sivu ovat ilmaisia. Taloyhtiöraportti ja Pro-tilaus ovat maksullisia lisäpalveluita.'
			}
		]
	},

	tili: {
		activated: 'Tilaus on aktivoitu',
		activatedLede: 'Taloyhtiöraportit ovat nyt käytössäsi tällä selaimella.',
		active: 'Tilaus on voimassa',
		activeLede: 'Taloyhtiöraportit löydät ilmoitusanalyysin tuloksista.',
		pastDue: 'Maksu odottaa',
		pastDueLede: 'Päivitä maksutapa Stripen sähköpostilinkistä.',
		canceled: 'Tilaus on päättynyt',
		sessionFailed: 'Aktivointi ei onnistunut',
		sessionFailedLede: 'Lataa sivu hetken kuluttua uudelleen.',
		none: 'Ei aktiivista tilausta',
		noneLede: 'Avaa tilausvahvistus samalla selaimella, tai tilaa alta.',
		ctaAnalyze: 'Siirry ilmoitusanalyysiin →',
		ctaResubscribe: 'Tilaa uudelleen →'
	},

	raportti: {
		eyebrow: 'Taloyhtiöraportti',
		pageTitle: 'Taloyhtiöraportti | RehtiArvio',
		pendingTitle: 'Kokoamme raporttia…',
		pendingBody: 'Haemme ja ristivarmistamme taloyhtiön tietoja julkisista verkkolähteistä. Tämä vie yleensä muutaman minuutin.',
		failedTitle: 'Raportin kokoaminen ei onnistunut',
		failedBody: 'Taloyhtiöstä ei löytynyt tarpeeksi julkisia lähteitä. Kokeilethan hetken kuluttua uudelleen.',
		sourcesTitle: 'Lähteet ja luotettavuus',
		talousTitle: 'Taloyhtiön talous',
		ptsTitle: 'Kunnossapitotarveselvitys (PTS)',
		historyTitle: 'Korjaushistoria asiakirjoista',
		docsSource:
			'Lähde: ostajan toimittamat asiakirjat (isännöitsijäntodistus / tilinpäätös). Asiakirjan tekstiä ei ole tallennettu — vain koneellisesti poimitut luvut.',
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
			`Raportti on koottu koneellisesti julkisista verkkolähteistä${conf != null ? ` (kattavuusarvio ${Math.round(conf * 100)} %)` : ''}. Mukana ovat vain lähteissä näkyvät tiedot. Tämä ei ole arvio eikä sijoitusneuvontaa.`
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
		lede: 'Sivulla on muutama eväste. Välttämättömät pyörittävät sivua, loput käynnistyvät vain, jos annat niille luvan.',
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
				desc: 'Pyörittävät sivua ja tilaajan kirjautumista. Aina päällä, sillä muuten sivu ei toimi.'
			},
			analytics: {
				title: 'Analytiikka',
				desc: 'Kävijämäärät, sivujen käyttö ja se, mitä postinumeroalueita tai hintoja katsot. Näiden avulla näemme, mikä toimii ja mikä ei. Lisää: /tietosuoja.'
			},
			marketing: {
				title: 'Markkinointi',
				desc: 'Ei vielä käytössä. Varattu mahdollista myöhempää mainontaa varten; kytkin ei tällä hetkellä tee mitään.'
			}
		}
	},

	evasteet: {
		h1: 'Evästeet ja seurannan hallinta',
		lede: 'Kolme ryhmää: välttämättömät ovat aina päällä, ja analytiikan sekä markkinoinnin voit hyväksyä tai hylätä alta milloin tahansa.',
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
		lede: 'Tässä kerromme, mitä tietoa RehtiArvio kerää sivuston kävijöistä, miksi, ja miten pääset käsiksi omiin tietoihisi.',
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
				desc: 'Itse antamasi sähköposti Taloyhtiöraportin jonotuslistalle. Erillinen valintaruutu kertoo, saako osoitteeseen lähettää myös muuta postia.'
			},
			{
				name: 'Tilaajatiedot',
				basis: 'Sopimus',
				desc: 'Sähköposti sekä Stripen asiakas- ja tilaustunnukset, Taloyhtiöraportin tai Pro-tilauksen toimittamista varten.'
			},
			{
				name: 'Taloyhtiöraportin luvut',
				basis: 'Sopimus',
				desc: 'Ostajan liittämistä asiakirjoista koneellisesti poimitut luvut: vastikkeet, lainaosuus, korjausvuodet. Asiakirjan tekstiä tai nimiä ei tallenneta.'
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
				period: 'Säilytämme niin kauan kuin ne palvelevat tarkoitustaan (jonotuslistan ilmoitus, ja markkinointiluvan antaneilla myös muu posti). Käymme listan läpi kerran vuodessa.'
			},
			{
				name: 'Suostumusloki',
				period: 'Säilytämme todisteena annetusta tai perutusta suostumuksesta. Tämänkin katsomme läpi vuosittain, vaikka erillistä poistorajaa ei ole.'
			},
			{
				name: 'Analytiikkatapahtumat',
				period: 'Niin pitkään kuin PostHogin projektiasetuksissa on määritetty. Tällä hetkellä valittuna on pisin saatavilla oleva aika.'
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
		cookiesLink: 'Evästekohtaiset tiedot löydät sivulta /evasteet.'
	},

	errors: {
		invalidEmail: 'Tarkistathan sähköpostiosoitteen.',
		saveFailed: 'Tallennus ei onnistunut. Yritäthän hetken kuluttua uudelleen.',
		generic: 'Jokin meni vikaan.',
		reportNeedSub: 'Taloyhtiöraportit kuuluvat RehtiArvio-tilaukseen. Tilaa /tilaa-sivulta, tai jos olet jo tilannut, avaa /tili samalla selaimella.',
		reportNeedTarget:
			'Taloyhtiöraporttiin tarvitaan taloyhtiön nimi tai osoite. Analysoi ilmoitus ensin.',
		docsUnparsed:
			'Liittämästäsi tekstistä ei löytynyt taloyhtiön talouslukuja (vastikkeet, lainaosuus, korjaukset). Tarkista, että kopioit isännöitsijäntodistuksen tekstin — tai tyhjennä kenttä ja tilaa raportti ilman asiakirjoja.'
	}
};
