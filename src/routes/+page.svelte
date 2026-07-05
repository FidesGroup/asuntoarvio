<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Asuntoarvio — onko pyyntihinta yli vai alle markkinan?</title>
</svelte:head>

<section class="hero">
	<p class="eyebrow">Asuntosijoittajan hintaseula</p>
	<h1>Onko pyyntihinta yli vai alle alueen toteutuneiden kauppojen?</h1>
	<p>
		Vertaamme neliöhintaa Tilastokeskuksen <b>toteutuneisiin kauppahintoihin</b> — emme
		pyyntihintoihin. Koko Suomi, {data.postalCodes.length} postinumeroaluetta.
	</p>
</section>

<form method="GET" action="/arvio" class="bench">
	<div class="grid">
		<label>
			Postinumero
			<input name="pc" inputmode="numeric" pattern={'[0-9]{5}'} placeholder="00530" required list="known-pc" value={data.prefillPc ?? ''} />
		</label>
		<label>
			Huonetyyppi
			<select name="rt" required>
				<option value="yksiö">Yksiö</option>
				<option value="kaksio" selected>Kaksio</option>
				<option value="kolmio+">Kolmio tai suurempi</option>
			</select>
		</label>
		<label>
			Pinta-ala, m²
			<input name="m2" inputmode="decimal" type="number" step="0.5" min="10" max="400" placeholder="54" required />
		</label>
		<label>
			Hinta, €
			<input name="price" inputmode="numeric" type="number" step="1000" min="10000" placeholder="289 000" required />
		</label>
		<label>
			Hintatyyppi
			<select name="debtfree">
				<option value="1" selected>Velaton hinta</option>
				<option value="0">Myyntihinta</option>
			</select>
		</label>
		<label>
			Rakennusvuosi <span class="opt">(valinnainen)</span>
			<input name="yr" inputmode="numeric" type="number" min="1800" max="2030" placeholder="1961" />
		</label>
	</div>
	<datalist id="known-pc">
		{#each data.postalCodes as pc (pc)}<option value={pc}></option>{/each}
	</datalist>
	<button type="submit">Vertaa markkinaan</button>
</form>

<section class="props">
	<div>
		<h2>Toteutuneet kaupat</h2>
		<p>
			Vertailuarvo lasketaan Tilastokeskuksen julkaisemista toteutuneista kaupoista, painotettuna
			neljän viimeisimmän neljänneksen kauppamäärillä — ja jokaisen tuloksen mukana kerrotaan,
			kuinka moneen kauppaan se perustuu.
		</p>
	</div>
	<div>
		<h2>Taloyhtiö ilmoituksesta</h2>
		<p>
			<a href="/analyysi">Ilmoitusanalyysi</a> poimii myynti-ilmoituksesta tontin omistuksen,
			vastikkeet, yhtiölainat sekä tehdyt ja tulevat remontit — asiat, jotka ratkaisevat
			sijoituksen, mutta eivät näy hintavertailussa.
		</p>
	</div>
	<div>
		<h2>Koko Suomi kartalla</h2>
		<p>
			<a href="/kartta">Hintakartta</a> näyttää toteutuneet neliöhinnat postinumeroalueittain
			Hangosta Nuorgamiin. Klikkaus esitäyttää vertailun.
		</p>
	</div>
</section>

<section class="waitlist" id="raportti">
	<h2>Tulossa: sijoittajaraportti</h2>
	<p>
		Maksullinen kohderaportti on rakenteilla: taloyhtiön tilinpäätöksestä louhittu talouskortti
		(hoitokate, lainat, vastikekehitys, remonttihistoria) yhdistettynä hintavertailuun. Jätä
		sähköpostisi, niin saat ensimmäisten joukossa kutsun — ei muuta postia.
	</p>
	{#if form?.joined}
		<p class="joined">Kiitos! Olet jonotuslistalla.</p>
	{:else}
		<form method="POST" action="?/waitlist">
			<input type="email" name="email" placeholder="nimi@esimerkki.fi" required autocomplete="email" />
			<button type="submit">Liity jonotuslistalle</button>
		</form>
		{#if form?.waitlistError}<p class="error">{form.waitlistError}</p>{/if}
	{/if}
</section>

<style>
	.hero {
		margin-bottom: 1.75rem;
	}
	.eyebrow {
		color: var(--accent);
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.09em;
		margin: 0 0 0.5rem;
	}
	.hero h1 {
		font-size: 2rem;
		line-height: 1.15;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 0.75rem;
		max-width: 36rem;
	}
	.hero p {
		color: var(--ink-2);
		max-width: 38rem;
		margin: 0;
	}
	form.bench {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: 1rem 1.25rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ink-2);
	}
	.opt {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
	}
	input,
	select {
		font: inherit;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 0.6rem 0.7rem;
		border-radius: 0;
	}
	input:focus-visible,
	select:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
	button {
		margin-top: 1.25rem;
		font: inherit;
		font-weight: 700;
		background: var(--accent);
		color: var(--bg);
		border: none;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
	}
	.props {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		margin-top: 2.5rem;
	}
	.props div {
		background: var(--surface);
		padding: 1.1rem 1.25rem;
	}
	.props h2 {
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.4rem;
	}
	.props p {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.9rem;
	}
	.props a {
		color: var(--accent);
	}
	.waitlist {
		margin-top: 2.5rem;
		border: 1px solid var(--line);
		border-left: 3px solid var(--accent);
		background: var(--surface);
		padding: 1.5rem;
	}
	.waitlist h2 {
		font-size: 1.1rem;
		letter-spacing: -0.01em;
		margin: 0 0 0.5rem;
	}
	.waitlist p {
		color: var(--ink-2);
		max-width: 40rem;
		margin: 0 0 1rem;
	}
	.waitlist form {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		border: none;
		background: none;
		padding: 0;
	}
	.waitlist input {
		flex: 1 1 16rem;
	}
	.waitlist button {
		margin-top: 0;
	}
	.joined {
		color: var(--under);
		font-weight: 700;
	}
	.error {
		color: var(--over);
		font-size: 0.9rem;
		margin: 0.5rem 0 0;
	}
</style>
