<script lang="ts">
	import { enhance } from '$app/forms';
	import MiniMap from '$lib/components/MiniMap.svelte';
	let { data, form } = $props();
	let activeInput = $state<'url' | 'text' | 'manual'>('url');
	let beginnerMode = $state(true);
	let heroInView = $state(true);
	let ctaBar: HTMLDivElement | undefined = $state();
	$effect(() => {
		if (typeof window === 'undefined') return;
		const hero = document.querySelector('.hero');
		if (!hero) return;
		const io = new IntersectionObserver(
			([e]) => (heroInView = e.isIntersecting),
			{ threshold: 0.1 }
		);
		io.observe(hero);
		return () => io.disconnect();
	});

	const CLASS_LABELS: Record<string, string> = {
		kerrostalo: 'kerrostalo', rivitalo: 'rivitalo',
		omakotitalo: 'omakotitalo', paritalo: 'paritalo', muu: 'muu kohde'
	};
	const TIER_STEPS = ['T1', 'T2', 'T3', 'T4'] as const;

	interface Factor { category: string; title: string; content: string; tier?: string }
	/** Group the flat review list into topics: each topic starts at a 'what'. */
	function groupReview(review: Factor[]): { title: string; parts: Factor[] }[] {
		const groups: { title: string; parts: Factor[] }[] = [];
		for (const f of review) {
			if (f.category === 'confidence') continue;
			if (f.category === 'what') groups.push({ title: f.title, parts: [f] });
			else if (groups.length) groups[groups.length - 1].parts.push(f);
		}
		return groups;
	}

	function prefillRent(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const pc = (form.elements.namedItem('pc') as HTMLInputElement)?.value?.trim();
		const rt = (form.elements.namedItem('rt') as HTMLSelectElement)?.value;
		const m2 = Number((form.elements.namedItem('m2') as HTMLInputElement)?.value);
		const rentEl = form.elements.namedItem('rent') as HTMLInputElement | null;
		if (!pc || !rt || !Number.isFinite(m2) || m2 < 10 || !rentEl || rentEl.value) return;
		fetch(`/api/rent-estimate?pc=${encodeURIComponent(pc)}&rt=${encodeURIComponent(rt)}&m2=${m2}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((d) => {
				if (d && typeof d.monthlyRentEur === 'number') {
					rentEl.value = String(d.monthlyRentEur);
				}
			})
			.catch(() => {});
	}
</script>

<svelte:head>
	<title>RehtiArvio — ilmoitusanalyysi ja markkinahintavertailu</title>
</svelte:head>

<section class="hero">
	<div class="hero__copy">
		<span class="eyebrow">Ilmoitusanalyysi</span>
		<h1>Onko pyyntihinta linjassa toteutuneiden kauppojen kanssa?</h1>
		<p class="lede">
			Anna myynti-ilmoituksen URL-osoite tai liitä teksti — saat välittömästi vertailuarvon
			Tilastokeskuksen toteutuneisiin kauppoihin, kuntoarvion ja selkeän luotettavuusluokituksen.
		</p>
		<div class="hero__pills">
			<span class="pill"><b>{Intl.NumberFormat('fi-FI').format(data.postalCodes.length)}</b> postinumeroa</span>
			<span class="pill"><b>4</b> neljännestä</span>
			<span class="pill"><b>0</b> mainosta</span>
		</div>
	</div>
	<aside class="hero__viz">
		<MiniMap centroids={data.centroids} size={340} />
		<article class="sample">
			<header class="sample__head">
				<span class="crumb">00100 · kaksio · 50 m² · rak. 1985</span>
				<span class="chip korkea">korkea</span>
			</header>
			<div class="sample__row">
				<div class="sample__metric">
					<span class="muted">Kohteen neliöhinta</span>
					<b>7 256 <small>€/m²</small></b>
				</div>
				<div class="sample__metric">
					<span class="muted">Alueen kaupat</span>
					<b>7 256 <small>€/m²</small></b>
				</div>
			</div>
			<div class="sample__delta under">−0,0 % <span>markkinatasossa</span></div>
			<footer class="sample__foot muted">
				151 kauppaa · 2026Q1 · Lähde: Tilastokeskus 13mt
			</footer>
		</article>
	</aside>
</section>

<div class="analyzer">
	<div class="tabs" role="tablist">
		<button
			type="button"
			class="tab"
			class:active={activeInput === 'url'}
			aria-selected={activeInput === 'url'}
			role="tab"
			onclick={() => (activeInput = 'url')}
		>
			Anna URL-osoite
		</button>
		<button
			type="button"
			class="tab"
			class:active={activeInput === 'text'}
			aria-selected={activeInput === 'text'}
			role="tab"
			onclick={() => (activeInput = 'text')}
		>
			Liitä ilmoituksen teksti
		</button>
		<button
			type="button"
			class="tab tab--alt"
			class:active={activeInput === 'manual'}
			aria-selected={activeInput === 'manual'}
			role="tab"
			onclick={() => (activeInput = 'manual')}
		>
			Syötä tiedot käsin
		</button>
	</div>

	{#if activeInput === 'manual'}
		<form method="GET" action="/arvio" class="manual-form" onsubmit={prefillRent}>
			<h2 class="form-title">Anna kohteen perustiedot</h2>
			<div class="manual-grid">
				<label>
					<span class="lbl">Postinumero</span>
					<input name="pc" inputmode="numeric" pattern={'[0-9]{5}'} placeholder="00530" required list="known-pc" value={data.prefillPc ?? ''} />
				</label>
				<label>
					<span class="lbl">Huonetyyppi</span>
					<select name="rt" required>
						<option value="yksiö">Yksiö</option>
						<option value="kaksio" selected>Kaksio</option>
						<option value="kolmio+">Kolmio tai suurempi</option>
					</select>
				</label>
				<label>
					<span class="lbl">Pinta-ala <span class="unit">(m²)</span></span>
					<input name="m2" inputmode="decimal" type="number" step="0.5" min="10" max="400" placeholder="54" required />
				</label>
				<label>
					<span class="lbl">Velaton hinta <span class="unit">(€)</span></span>
					<input name="price" inputmode="numeric" type="number" step="1000" min="10000" placeholder="289 000" required />
				</label>
				<label>
					<span class="lbl">Hintatyyppi</span>
					<select name="debtfree">
						<option value="1" selected>Velaton hinta</option>
						<option value="0">Myyntihinta</option>
					</select>
				</label>
				<label>
					<span class="lbl">Rakennusvuosi <span class="opt">(valinnainen)</span></span>
					<input name="yr" inputmode="numeric" type="number" min="1800" max="2030" placeholder="1961" />
				</label>
				<label>
					<span class="lbl">Arvioitu vuokra <span class="unit">(€/kk)</span> <span class="opt">(valinnainen)</span></span>
					<input name="rent" inputmode="numeric" type="number" step="10" min="100" max="20000" placeholder="950" />
				</label>
				<label>
					<span class="lbl">Hoitovastike <span class="unit">(€/kk)</span> <span class="opt">(valinnainen)</span></span>
					<input name="vastike" inputmode="numeric" type="number" step="10" min="0" max="5000" placeholder="280" />
				</label>
			</div>
			<datalist id="known-pc">
				{#each data.postalCodes as pc (pc)}<option value={pc}></option>{/each}
			</datalist>
			<div class="manual__actions">
				<button type="submit">Analysoi kohde</button>
			</div>
		</form>
	{:else}
		<form method="POST" action="?/analyze" class="auto-form" use:enhance>
			{#if activeInput === 'url'}
				<label class="field">
					<span class="lbl">Ilmoituksen URL</span>
					<input
						type="url"
						name="url"
						placeholder="https://asunnot.oikotie.fi/myytavat-asunnot/helsinki/…"
						autocomplete="off"
					/>
				</label>
			{:else}
				<label class="field">
					<span class="lbl">Ilmoituksen teksti</span>
					<textarea
						name="text"
						rows="10"
						placeholder="Avaa ilmoitus selaimessa → valitse kaikki (Ctrl+A) → kopioi → liitä tähän"
					></textarea>
				</label>
			{/if}
			<div class="auto__actions">
				<button type="submit">Analysoi ilmoitus</button>
				<p class="hint">Tuetut portaalit: Oikotie, Etuovi, Kiinteistömaailma, Remax (https).</p>
			</div>
			{#if form?.error}
				<p class="error">{form.error}</p>
			{/if}
			{#if form?.reportError}
				<p class="error">{form.reportError}</p>
			{/if}
		</form>
	{/if}
</div>

{#if form?.verdict && activeInput !== 'manual'}
	<article class="result">
		<p class="crumb">
			{form.extracted.address ?? '–'} · {form.facts.postalCode}
			{#if form.extracted.propertyClass}· {CLASS_LABELS[form.extracted.propertyClass]}{/if}
			{#if form.facts.roomsType}· {form.facts.roomsType}{/if}
			· {form.facts.livingAreaM2} m²
			{#if form.facts.buildYear}· rak. {form.facts.buildYear}{/if}
			{#if form.source}· lähde {form.source}{/if}
		</p>

		{#if form.verdict.deltaPct !== null}
			<h2 class="delta {form.verdict.deltaPct >= 0 ? 'over' : 'under'}">
				{form.verdict.deltaPct > 0 ? '+' : ''}{String(form.verdict.deltaPct).replace('.', ',')} %
				<span>{form.verdict.deltaPct >= 0 ? 'yli' : 'alle'} alueen toteutuneiden kauppojen</span>
			</h2>
		{:else if form.tier?.tier === 'T4'}
			<h2 class="delta none">Suuntaa-antava arvio <span>alueen kaupoista ei riittävää vertailua — arvio perustuu kohteen kuntoon</span></h2>
		{:else}
			<h2 class="delta none">Ei vertailuarvoa <span>tälle alueelle ja huonetyypille</span></h2>
		{/if}

		{#if form.tier}
			<section class="meter card" aria-label="Arvion luotettavuus">
				<div class="meter__row">
					<div class="meter__steps" role="img" aria-label="Taso {form.tier.tier}">
						{#each TIER_STEPS as t (t)}
							<span class="meter__step" class:on={t === form.tier.tier}>{t}</span>
						{/each}
					</div>
					<div class="meter__text">
						<b>Luotettavuus: {form.tier.confidenceLabel}</b>
						<span>
							{#if form.tier.tier === 'T1'}Postinumeroalueen toteutuneet kaupat ({form.tier.transactionsOrEvidence} kpl / 4 nelj.)
							{:else if form.tier.tier === 'T3'}Alueen toteutuneet kaupat ({form.tier.transactionsOrEvidence} kpl) — karkeampi taso
							{:else}Ei riittävästi vertailukauppoja — kunto-perusteinen arvio{/if}
						</span>
					</div>
				</div>
			</section>
		{/if}

		{#if form.tier?.tier === 'T4'}
			<section class="card estimate">
				<h3>Kunto-perusteinen hinta-arvio <span class="beta">suuntaa-antava</span></h3>
				<div class="band" role="img" aria-label="Arviohaarukka">
					<div class="band__edge">
						<span class="band__eur">{Intl.NumberFormat('fi-FI').format(form.tier.estLowEurM2)} €/m²</span>
						<span class="band__lbl">alaraja</span>
					</div>
					<div class="band__mid">
						<span class="band__eur band__eur--mid">{Intl.NumberFormat('fi-FI').format(form.tier.estMidEurM2)} €/m²</span>
						<span class="band__lbl">paras arvio</span>
					</div>
					<div class="band__edge">
						<span class="band__eur">{Intl.NumberFormat('fi-FI').format(form.tier.estHighEurM2)} €/m²</span>
						<span class="band__lbl">yläraja</span>
					</div>
				</div>
				<p class="estimate__note">
					Arvio perustuu kohteen kuntoon ja alueen karkeaan hintatasoon, ei toteutuneisiin
					vertailukauppoihin.
				</p>
				<p class="areas">Oletukset: {form.tier.assumptions.join(' · ')}</p>
			</section>
		{/if}

		{#if form.location}
			<section class="loc card">
				<header class="loc__head">
					<h3>Sijaintipainotettu vertailu</h3>
					<span class="beta">beta</span>
				</header>
				<p>
					Osoitteen ympäristön kaupoilla painotettu vertailuarvo on
					<b>{Intl.NumberFormat('fi-FI').format(form.location.eurM2)} €/m²</b> → kohde on
					<b>
						{form.location.deltaPct > 0 ? '+' : ''}{String(form.location.deltaPct).replace('.', ',')} %
						{form.location.deltaPct >= 0 ? 'yli' : 'alle'}
					</b>
					sijainnin markkinatason.
				</p>
				<p class="areas">
					Painotus: {#each form.location.areasUsed as a, i (a.pc)}{i > 0 ? ' · ' : ''}{a.nimi || a.pc}
						{a.km} km ({Intl.NumberFormat('fi-FI').format(a.eurM2)} €/m²){/each}
				</p>
			</section>
		{/if}

		{#if form.review?.length || form.insights.length}
			<section class="card">
				<header class="review__head">
					<h3>Kohteen läpikäynti</h3>
					<label class="toggle">
						<input type="checkbox" bind:checked={beginnerMode} />
						<span>Selitä perusteet</span>
					</label>
				</header>
				{#if beginnerMode && form.review?.length}
					<div class="factors">
						{#each groupReview(form.review) as g (g.title)}
							<article class="factor">
								<h4>{g.title}</h4>
								{#each g.parts as p, i (i)}
									<p class="factor__part">
										{#if p.category === 'what'}<b>Mitä tämä on:</b>
										{:else if p.category === 'here'}<b>Tässä kohteessa:</b>
										{:else if p.category === 'why'}<b>Miksi tällä on väliä rahallesi:</b>
										{:else if p.category === 'check'}<b>Tarkista vielä:</b>{/if}
										{p.content}
									</p>
								{/each}
							</article>
						{/each}
					</div>
				{:else if form.insights.length}
					<ul>
						{#each form.insights as line (line)}<li>{line}</li>{/each}
					</ul>
				{/if}
			</section>
		{/if}

		<section class="card">
			<h3>Tulkinnan varaukset</h3>
			<ul class="muted">
				{#each form.verdict.flags as flag (flag)}<li>{flag}</li>{/each}
			</ul>
		</section>

		<section class="card">
			<h3>Asuntocard: taloyhtiön syväkatsaus <span class="beta">beta</span></h3>
			<p class="card-lede">
				Ristivarmistamme remonttihistorian, saman taloyhtiön muut myynnit ja tonttitiedot
				julkisista web-lähteistä, jokainen löydös lähteineen. Kortti valmistuu tyypillisesti
				muutamassa minuutissa ja kuuluu RehtiArvio-tilaukseen.
			</p>
			<form method="POST" action="?/report" class="report-form">
				<input type="hidden" name="payload" value={form.reportPayload} />
				<button type="submit">Kokoa asuntocard</button>
				<a class="sub-link" href="/tilaa">Ei vielä tilausta?</a>
			</form>
		</section>
	</article>
{/if}

<section class="trust" aria-label="Luotettavuus">
	<p class="trust__line">
		Ei mainoksia · Data: Tilastokeskus (CC BY 4.0) · Emme tallenna osoitteita tai ilmoituksia
	</p>
	<div class="stats">
		<div class="stat">
			<b>{Intl.NumberFormat('fi-FI').format(data.postalCodes.length)}</b>
			<span>postinumeroaluetta katettu</span>
		</div>
		<div class="stat">
			<b>4 nelj.</b>
			<span>toteutuneet kaupat, kauppamäärillä painotettu</span>
		</div>
		<div class="stat">
			<b>0 kpl</b>
			<span>tallennettuja osoitteita tai ilmoituksia</span>
		</div>
	</div>
</section>

<section class="features" aria-label="Mitä RehtiArvio tekee">
	<header class="features__head">
		<span class="eyebrow">Ominaisuudet</span>
		<h2>Työkalu, joka katsoo toteutuneisiin kauppoihin — ei mielipiteisiin.</h2>
	</header>
	<div class="features__grid">
		<article class="feat">
			<div class="feat__bar" aria-hidden="true"></div>
			<h3>Koko maan hintakartta</h3>
			<p>
				<a href="/kartta">Hintakartta</a> esittää toteutuneet neliöhinnat postinumeroalueittain
				Hangosta Nuorgamiin. Klikkaus esitäyttää vertailulomakkeen.
			</p>
		</article>
		<article class="feat">
			<div class="feat__bar" aria-hidden="true"></div>
			<h3>Kohdeanalyysi</h3>
			<p>
				Liitä Oikotie-, Etuovi- tai välittäjäsivun URL-osoite. Järjestelmä poimii ilmoituksen
				kentistä hinnan, vastikkeet, tontin, tehdyt ja tulevat remontit.
			</p>
		</article>
		<article class="feat">
			<div class="feat__bar" aria-hidden="true"></div>
			<h3>Kuntoarvio</h3>
			<p>
				Kun vertailukauppoja on vähän, annamme kuntoon perustuvan hinta-arvion: kuntoluokka,
				ikä, tehdyt ja tulossa olevat remontit sekä tontin omistus.
			</p>
		</article>
		<article class="feat">
			<div class="feat__bar" aria-hidden="true"></div>
			<h3>Vuokratuotto</h3>
			<p>
				Brutto- ja nettotuotto Tilastokeskuksen vuokratilastosta (asvu 13eb) tai syöttämälläsi
				vuokralla. Sisältää varainsiirtoveron 1,5 % ja remonttivarauksen.
			</p>
		</article>
		<article class="feat">
			<div class="feat__bar" aria-hidden="true"></div>
			<h3>Toteutuneet vertailukaupat</h3>
			<p>
				Vertailuarvo muodostetaan Tilastokeskuksen julkaisemista kaupoista, painotettuna
				neljän viimeisimmän neljänneksen kauppamäärillä. Kauppojen lukumäärä näkyy aina.
			</p>
		</article>
		<article class="feat">
			<div class="feat__bar" aria-hidden="true"></div>
			<h3>Yksityisyys etusijalla</h3>
			<p>
				Teemme yhden käyttäjän ohjaaman sivun haun vain luotetuilta ilmoituspalveluilta.
				Mitään listausta tai käyttäjätietoja ei tallenneta palveluun.
			</p>
		</article>
	</div>
</section>

<section class="cases" aria-label="Esimerkkitapauksia">
	<header class="cases__head">
		<span class="eyebrow">Esimerkkejä</span>
		<h2>Mitä arvio kertoi ostajalle.</h2>
	</header>
	<div class="cases__grid">
		<article class="case">
			<span class="crumb">00100 · yksiö</span>
			<div class="case__delta under">−8,2 % <span>alle alueen</span></div>
			<p>
				Ilmoituksen pyyntihinta oli selvästi alueen mediaanin alapuolella. Syyksi paljastui
				tuleva putkiremontti — ostaja budjetoi 320 €/m² ja teki tarjouksen.
			</p>
		</article>
		<article class="case">
			<span class="crumb">00200 · kolmio+</span>
			<div class="case__delta over">+14,7 % <span>yli alueen</span></div>
			<p>
				Hinta kuulosti korkealta, mutta naapurialueiden kaupoilla painotettu vertailu osoitti
				kohteen olevan linjassa mikrosijainnin kanssa. Ostaja jatkoi neuvottelua.
			</p>
		</article>
		<article class="case">
			<span class="crumb">33100 · rivitalo</span>
			<div class="case__delta estimate">suuntaa-antava <span>kuntoarvio</span></div>
			<p>
				Alueella alle 20 kauppaa neljänneksessä. Kuntoarvio (hyvä kunto, 1998 rakennettu,
				putket tehty) arvioi hinnan haarukaksi 2 850–3 150 €/m².
			</p>
		</article>
		<article class="case">
			<span class="crumb">90500 · omakotitalo</span>
			<div class="case__delta estimate">suuntaa-antava <span>aluevertailu</span></div>
			<p>
				Omakotitaloille ei ole kuntakohtaista dataa. Aluevertailu varoittaa: tontin arvo
				vaihtelee paljon, eikä €/m² yksin riitä hinta-arvioksi.
			</p>
		</article>
	</div>
</section>

<div class="ctabar" class:visible={!heroInView} bind:this={ctaBar} aria-hidden={heroInView}>
	<form method="POST" action="?/analyze" use:enhance class="ctabar__form">
		<span class="ctabar__lead">Liitä uusi ilmoitus →</span>
		<input
			type="url"
			name="url"
			placeholder="https://asunnot.oikotie.fi/..."
			autocomplete="off"
			class="ctabar__input"
			aria-label="Ilmoituksen URL"
		/>
		<button type="submit" class="ctabar__btn">Analysoi</button>
		<button type="button" class="ctabar__close" aria-label="Sulje" onclick={() => (heroInView = true)}>×</button>
	</form>
</div>

<section class="waitlist" id="raportti">
	<div class="waitlist__body">
		<h2>Rakenteilla: kohderaportti</h2>
		<p>
			Maksullinen kohderaportti kokoaa taloyhtiön tilinpäätöksestä talouskortin (hoitokate,
			lainat, vastikekehitys, remonttihistoria) yhdistettynä markkinahintavertailuun. Jätä
			sähköpostiosoitteesi, niin saat kutsun ensimmäisten joukossa.
		</p>
	</div>
	<div class="waitlist__cta">
		<form method="POST" action="?/waitlist" use:enhance>
			<input type="email" name="email" placeholder="nimi@esimerkki.fi" required autocomplete="email" />
			<button type="submit">Liity jonotuslistalle</button>
		</form>
		{#if form?.joined}
			<p class="joined">Kiitos! Sähköpostisi on kirjattu jonotuslistalle.</p>
		{:else if form?.waitlistError}
			<p class="error">{form.waitlistError}</p>
		{/if}
	</div>
</section>

<style>
	.eyebrow {
		display: inline-block;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-2);
		letter-spacing: var(--ls-wide);
		background: var(--chip-bg);
		padding: 0.35rem 0.7rem;
		border-radius: var(--radius-pill);
		margin-bottom: 1.25rem;
	}
	.hero {
		display: grid;
		grid-template-columns: 1.1fr 1fr;
		gap: 2rem;
		align-items: center;
		padding-top: 0.5rem;
		margin-bottom: 2rem;
	}
	.hero__copy { max-width: 36rem; }
	.hero h1 {
		font-size: var(--text-3xl);
		line-height: var(--lh-snug);
		letter-spacing: var(--ls-tight);
		text-wrap: balance;
		margin: 0 0 1rem;
		max-width: 36rem;
		font-weight: 600;
	}
	.hero .lede {
		color: var(--ink-2);
		max-width: 36rem;
		margin: 0 0 1.25rem;
		font-size: var(--text-md);
		line-height: var(--lh-body);
	}
	.hero__pills {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}
	.pill {
		display: inline-flex;
		gap: 0.35rem;
		align-items: baseline;
		font-size: var(--text-sm);
		color: var(--ink-2);
		background: var(--chip-bg);
		border: 1px solid var(--line);
		padding: 0.35rem 0.7rem;
		border-radius: var(--radius-pill);
	}
	.pill b {
		color: var(--ink);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.hero__viz {
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}
	.sample {
		background: var(--sky);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		padding: 1.1rem 1.25rem;
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
	.sample__head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;
	}
	.sample__row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.85rem;
	}
	.sample__metric {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.sample__metric .muted {
		color: var(--ink-3);
		font-size: var(--text-xs);
		letter-spacing: var(--ls-wide);
		font-weight: 500;
	}
	.sample__metric b {
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--ls-tight);
	}
	.sample__metric small {
		font-size: var(--text-sm);
		color: var(--ink-3);
		font-weight: 500;
		margin-left: 0.1rem;
	}
	.sample__delta {
		font-size: var(--text-lg);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
	}
	.sample__delta span {
		display: block;
		font-size: var(--text-sm);
		font-weight: 400;
		color: var(--ink-2);
		margin-top: 0.1rem;
	}
	.sample__foot {
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-snug);
	}

	.analyzer {
		background: var(--sky);
		padding: 1.25rem 1.25rem 1.5rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		border: 1px solid var(--line);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	.tabs {
		display: flex;
		gap: 0.3rem;
		padding: 0.3rem;
		background: var(--bg);
		border-radius: var(--radius-pill);
		width: fit-content;
		max-width: 100%;
		flex-wrap: wrap;
	}
	.tab {
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink-2);
		background: transparent;
		border: none;
		padding: 0.55rem 1rem;
		cursor: pointer;
		border-radius: var(--radius-pill);
		transition: background 0.15s ease, color 0.15s ease;
		white-space: nowrap;
	}
	.tab:hover {
		color: var(--ink);
	}
	.tab.active {
		background: var(--surface);
		color: var(--ink);
		box-shadow: var(--shadow-sm);
	}
	.tab--alt {
		color: var(--ink-3);
	}

	.field {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.lbl {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink);
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}
	.unit, .opt {
		color: var(--ink-3);
		font-weight: 400;
		font-size: var(--text-xs);
	}

	.analyzer input,
	.analyzer textarea,
	.analyzer select {
		font: inherit;
		font-size: var(--text-md);
		color: var(--ink);
		background: var(--bg);
		border: 1px solid transparent;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-md);
		transition: background 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
		width: 100%;
	}
	.analyzer textarea {
		font-size: var(--text-md);
		resize: vertical;
		line-height: var(--lh-body);
		min-height: 200px;
	}
	.analyzer input::placeholder,
	.analyzer textarea::placeholder {
		color: var(--ink-3);
	}
	.analyzer input:hover,
	.analyzer textarea:hover,
	.analyzer select:hover {
		background: var(--surface);
		border-color: var(--line-2);
	}
	.analyzer input:focus-visible,
	.analyzer textarea:focus-visible,
	.analyzer select:focus-visible,
	.analyzer button:focus-visible {
		outline: none;
		background: var(--surface);
		border-color: var(--baltic);
		box-shadow: 0 0 0 4px var(--ring);
	}

	.auto__actions {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.auto__actions button[type='submit'],
	.manual__actions button[type='submit'] {
		font: inherit;
		font-size: var(--text-md);
		font-weight: 500;
		background: var(--baltic);
		color: var(--baltic-ink);
		border: 1px solid var(--baltic);
		padding: 0.95rem 1.6rem;
		cursor: pointer;
		border-radius: var(--radius-pill);
		letter-spacing: var(--ls-snug);
		transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease, transform 0.05s ease, box-shadow 0.15s ease;
		box-shadow: 0 1px 2px var(--ring), 0 4px 12px var(--ring);
	}
	.auto__actions button[type='submit']:hover,
	.manual__actions button[type='submit']:hover {
		background: var(--baltic-2);
		border-color: var(--baltic-2);
		transform: translateY(-1px);
		box-shadow: 0 2px 4px var(--ring), 0 8px 20px var(--ring);
	}
	.hint {
		color: var(--ink-3);
		font-size: var(--text-xs);
		margin: 0;
	}
	.error {
		color: #b91c1c;
		font-size: var(--text-sm);
		font-weight: 500;
		background: #fef2f2;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-md);
		margin: 0;
	}
	@media (prefers-color-scheme: dark) {
		.error {
			background: #2a1414;
			color: #fca5a5;
		}
	}

	.manual-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.form-title {
		font-size: var(--text-md);
		font-weight: 600;
		letter-spacing: var(--ls-snug);
		color: var(--ink);
		margin: 0 0 0.25rem;
	}
	.manual-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem 1rem;
		padding: 1rem;
		border-radius: var(--radius-md);
	}
	.manual-grid label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.manual__actions {
		display: flex;
	}

	.result {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.crumb {
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		font-size: var(--text-xs);
		margin: 0 0 0.25rem;
		font-weight: 500;
	}
	.delta {
		font-size: var(--text-4xl);
		line-height: var(--lh-tight);
		letter-spacing: var(--ls-tightest);
		margin: 0;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	.delta span {
		display: block;
		font-size: var(--text-md);
		font-weight: 400;
		letter-spacing: var(--ls-snug);
		color: var(--ink-2);
		margin-top: 0.5rem;
		max-width: 40rem;
		line-height: var(--lh-body);
	}
	.delta.over { color: var(--over); }
	.delta.under { color: var(--under); }
	.delta.none { color: var(--ink); font-size: var(--text-2xl); }

	.card {
		background: var(--sky);
		border: 1px solid var(--line);
		padding: 1.5rem 1.75rem;
		box-shadow: var(--shadow-sm);
		border-radius: var(--radius-lg);
	}
	.loc__head {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		margin-bottom: 0.75rem;
	}
	.loc__head h3 { margin: 0; }
	.beta {
		font-size: var(--text-xs);
		font-weight: 500;
		background: var(--chip-bg);
		color: var(--ink-2);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-pill);
		letter-spacing: var(--ls-wide);
	}
	.loc p { margin: 0.5rem 0; line-height: var(--lh-body); color: var(--ink-2); }
	.loc p b { color: var(--ink); }
	.areas { color: var(--ink-3); font-size: var(--text-xs); }
	h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.6rem;
		color: var(--ink);
		letter-spacing: var(--ls-snug);
	}
	ul {
		margin: 0;
		padding-left: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 42rem;
		line-height: var(--lh-list);
		color: var(--ink-2);
	}
	ul.muted { color: var(--ink-2); }

	.trust {
		margin-top: 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.trust__line {
		margin: 0;
		text-align: center;
		font-size: var(--text-sm);
		color: var(--ink-3);
		letter-spacing: var(--ls-snug);
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
	.stat {
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		background: var(--sky);
		padding: 1.1rem 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}
	.stat b {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.stat span {
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-body);
	}

	.features {
		margin-top: 3rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.features__head { max-width: 42rem; }
	.features__head h2 {
		font-size: var(--text-2xl);
		letter-spacing: var(--ls-tight);
		margin: 0;
		font-weight: 600;
		line-height: var(--lh-snug);
		text-wrap: balance;
	}
	.features__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}
	.feat {
		background: var(--sky);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		padding: 1.4rem 1.5rem;
		box-shadow: var(--shadow-sm);
		transition: box-shadow 0.2s ease, transform 0.2s ease;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.feat:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}
	.feat__bar {
		width: 28px;
		height: 3px;
		background: var(--baltic);
		border-radius: var(--radius-pill);
		margin-bottom: 0.4rem;
	}
	.feat h3 {
		font-size: var(--text-lg);
		font-weight: 600;
		letter-spacing: var(--ls-snug);
		margin: 0;
		color: var(--ink);
	}
	.feat p {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-list);
	}
	.feat a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--ink-3);
		text-decoration-thickness: 1px;
	}

	.cases {
		margin-top: 3rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}
	.cases__head h2 {
		font-size: var(--text-2xl);
		letter-spacing: var(--ls-tight);
		margin: 0;
		font-weight: 600;
		line-height: var(--lh-snug);
	}
	.cases__grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1rem;
	}
	.case {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		padding: 1.25rem 1.35rem;
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
	}
	.case .crumb {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		font-weight: 500;
	}
	.case__delta {
		font-size: var(--text-2xl);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--ls-tight);
	}
	.case__delta span {
		display: block;
		font-size: var(--text-sm);
		font-weight: 400;
		color: var(--ink-2);
		margin-top: 0.15rem;
	}
	.case__delta.under { color: var(--under); }
	.case__delta.over { color: var(--over); }
	.case__delta.estimate { color: var(--ink); font-size: var(--text-lg); }
	.case p {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-list);
	}

	.waitlist {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 2rem;
		align-items: center;
		background: var(--sky);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		padding: 2.25rem 2.5rem;
		box-shadow: var(--shadow-sm);
		margin-top: 1.5rem;
	}
	.waitlist h2 {
		font-size: var(--text-2xl);
		letter-spacing: var(--ls-tight);
		margin: 0 0 0.6rem;
		font-weight: 600;
	}
	.waitlist p {
		color: var(--ink-2);
		margin: 0;
		font-size: var(--text-md);
		line-height: var(--lh-body);
	}
	.waitlist__cta form {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.waitlist__cta form input {
		flex: 1 1 auto;
		min-width: 0;
		font: inherit;
		font-size: var(--text-md);
		color: var(--ink);
		background: var(--bg);
		border: 1px solid transparent;
		padding: 0.8rem 0.95rem;
		border-radius: var(--radius-md);
		min-height: 46px;
	}
	.waitlist__cta form input:focus-visible {
		outline: none;
		background: var(--surface);
		border-color: var(--baltic);
		box-shadow: 0 0 0 4px var(--ring);
	}
	.waitlist__cta form button {
		font: inherit;
		font-size: var(--text-md);
		font-weight: 500;
		background: transparent;
		color: var(--baltic);
		border: 1px solid var(--baltic);
		padding: 0.8rem 1.25rem;
		min-height: 46px;
		cursor: pointer;
		border-radius: var(--radius-pill);
		transition: background 0.15s ease, color 0.15s ease, border-color 0.15s ease;
		white-space: nowrap;
	}
	.waitlist__cta form button:hover {
		background: var(--baltic);
		color: var(--baltic-ink);
	}
	.joined {
		color: var(--ink);
		font-weight: 500;
		background: var(--chip-bg);
		padding: 0.8rem 1rem;
		border-radius: var(--radius-md);
		margin: 0.5rem 0 0;
		font-size: var(--text-sm);
	}
	.card-lede {
		color: var(--ink-2);
		margin: 0 0 1rem;
		max-width: 44rem;
	}
	form.report-form {
		background: none;
		border: none;
		border-radius: 0;
		box-shadow: none;
		padding: 0;
		margin: 0;
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
	}
	form.report-form button {
		width: auto;
	}
	.sub-link {
		color: var(--ink-2);
		font-size: 0.9rem;
	}

	/* Tier/confidence meter */
	.meter__row {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex-wrap: wrap;
	}
	.meter__steps {
		display: flex;
		gap: 0.3rem;
	}
	.meter__step {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--ink-3);
		border: 1px solid var(--line-2);
		padding: 0.3rem 0.6rem;
		border-radius: var(--radius-pill);
		letter-spacing: var(--ls-wide);
	}
	.meter__step.on {
		background: var(--baltic);
		border-color: var(--baltic);
		color: var(--baltic-ink);
	}
	.meter__text {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.meter__text b { color: var(--ink); font-weight: 600; }
	.meter__text span { color: var(--ink-2); font-size: var(--text-sm); }

	/* T4 estimate: dashed border = estimate, not comparable-based verdict */
	.estimate { border-style: dashed; border-color: var(--line-2); }
	.band {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1rem;
		margin: 0.75rem 0 1rem;
		padding: 1rem 1.25rem;
		background: var(--bg);
		border-radius: var(--radius-md);
	}
	.band__edge, .band__mid {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}
	.band__eur {
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		color: var(--ink-2);
		font-size: var(--text-md);
	}
	.band__eur--mid {
		font-size: var(--text-xl);
		font-weight: 600;
		color: var(--ink);
	}
	.band__lbl {
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
	}
	.estimate__note {
		margin: 0 0 0.5rem;
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-body);
		font-weight: 500;
	}

	/* Beginner-mode review */
	.review__head {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.toggle {
		display: flex;
		align-items: center;
		gap: 0.45rem;
		font-size: var(--text-sm);
		color: var(--ink-2);
		cursor: pointer;
		user-select: none;
	}
	.toggle input { accent-color: var(--baltic); width: 1.05rem; height: 1.05rem; }
	.factors {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.85rem;
		margin-top: 0.9rem;
	}
	.factor {
		background: var(--bg);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		padding: 1rem 1.1rem;
	}
	.factor h4 {
		margin: 0 0 0.5rem;
		font-size: var(--text-md);
		font-weight: 600;
		letter-spacing: var(--ls-snug);
		color: var(--ink);
	}
	.factor__part {
		margin: 0 0 0.45rem;
		font-size: var(--text-sm);
		line-height: var(--lh-body);
		color: var(--ink-2);
	}
	.factor__part b { color: var(--ink); font-weight: 600; }

	@media (max-width: 860px) {
		.analyzer { padding: 1.1rem; }
		.factors { grid-template-columns: 1fr; }
		.hero { grid-template-columns: 1fr; gap: 1.5rem; }
		.hero__copy { max-width: none; }
		.features__grid { grid-template-columns: 1fr 1fr; }
		.cases__grid { grid-template-columns: 1fr 1fr; }
		.manual-grid { grid-template-columns: 1fr 1fr; }
		.stats { grid-template-columns: 1fr; }
		.features__grid { grid-template-columns: 1fr; }
		.cases__grid { grid-template-columns: 1fr; }
		.waitlist {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 1.75rem 1.5rem;
		}
	}
	@media (max-width: 560px) {
		.analyzer { padding: 1rem; }
		.tabs { width: 100%; }
		.tab { flex: 1; text-align: center; padding: 0.55rem 0.5rem; }
		.manual-grid { grid-template-columns: 1fr; }
		.analyzer input,
		.analyzer textarea,
		.analyzer select,
		.waitlist__cta form input {
			padding: 0.95rem 1rem;
			min-height: 50px;
		}
		.analyzer textarea { min-height: 160px; }
		.auto__actions button[type='submit'],
		.manual__actions button[type='submit'] {
			min-height: 52px;
			width: 100%;
		}
		.waitlist { padding: 1.5rem 1.25rem; }
		.waitlist__cta form { flex-direction: column; }
		.waitlist__cta form button { width: 100%; }
		.card { padding: 1.25rem 1.4rem; }
	}

	.ctabar {
		position: fixed;
		left: 50%;
		bottom: 1rem;
		transform: translate(-50%, calc(100% + 1rem));
		z-index: 50;
		max-width: 44rem;
		width: calc(100% - 2rem);
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-pill);
		box-shadow: var(--shadow-lg);
		padding: 0.4rem 0.5rem 0.4rem 1rem;
		transition: transform 0.25s ease, opacity 0.2s ease;
		opacity: 0;
		pointer-events: none;
	}
	.ctabar.visible {
		transform: translate(-50%, 0);
		opacity: 1;
		pointer-events: auto;
	}
	.ctabar__form {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.ctabar__lead {
		font-size: var(--text-sm);
		color: var(--ink-2);
		font-weight: 500;
		white-space: nowrap;
	}
	.ctabar__input {
		flex: 1 1 auto;
		min-width: 0;
		font: inherit;
		font-size: var(--text-sm);
		color: var(--ink);
		background: var(--bg);
		border: 1px solid transparent;
		padding: 0.55rem 0.75rem;
		border-radius: var(--radius-pill);
	}
	.ctabar__input:focus-visible {
		outline: none;
		background: var(--surface);
		border-color: var(--baltic);
		box-shadow: 0 0 0 3px var(--ring);
	}
	.ctabar__btn {
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 500;
		background: var(--baltic);
		color: var(--baltic-ink);
		border: 1px solid var(--baltic);
		padding: 0.55rem 1.1rem;
		border-radius: var(--radius-pill);
		cursor: pointer;
		white-space: nowrap;
	}
	.ctabar__btn:hover { background: var(--baltic-2); border-color: var(--baltic-2); }
	.ctabar__close {
		flex: 0 0 auto;
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		font-size: 1.4rem;
		line-height: 1;
		color: var(--ink-3);
		background: transparent;
		border: 1px solid transparent;
		border-radius: var(--radius-pill);
		cursor: pointer;
	}
	.ctabar__close:hover { color: var(--ink); background: var(--chip-bg); }
	@media (max-width: 560px) {
		.ctabar__lead { display: none; }
		.ctabar__btn { padding: 0.55rem 0.9rem; }
	}
</style>