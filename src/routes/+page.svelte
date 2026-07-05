<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>RehtiArvio — onko pyyntihinta linjassa toteutuneiden kauppojen kanssa?</title>
</svelte:head>

<section class="hero">
	<p class="eyebrow">Markkinahinta-analyysi</p>
	<h1>Onko pyyntihinta linjassa toteutuneiden kauppojen kanssa?</h1>
	<p class="lede">
		Analyysi perustuu Tilastokeskuksen julkaisemiin toteutuneisiin kauppahintoihin
		postinumeroalueittain — emme vertaa pyyntihintoja pyyntihintoihin. Koko Suomen kattavuus,
		{data.postalCodes.length} postinumeroaluetta.
	</p>
</section>

<form method="GET" action="/arvio" class="bench">
	<h2 class="bench__title">Kohteen tiedot</h2>
	<div class="grid">
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
	</div>
	<datalist id="known-pc">
		{#each data.postalCodes as pc (pc)}<option value={pc}></option>{/each}
	</datalist>
	<div class="bench__actions">
		<button type="submit">Analysoi kohde</button>
	</div>
</form>

<section class="props">
	<div>
		<h2>Toteutuneet kauppahinnat</h2>
		<p>
			Vertailuarvo muodostetaan Tilastokeskuksen julkaisemista toteutuneista kaupoista, painotettuna
			neljän viimeisimmän neljänneksen kauppamäärillä. Jokaisen tuloksen yhteydessä ilmoitetaan
			taustalla olevien kauppojen lukumäärä.
		</p>
	</div>
	<div>
		<h2>Taloyhtiötiedot ilmoituksesta</h2>
		<p>
			<a href="/analyysi">Ilmoitusanalyysi</a> poimii myynti-ilmoituksesta tontin, vastikkeet,
			yhtiölainat sekä tehdyt ja tulevat remontit — ne tekijät, jotka ratkaisevat
			sijoituspäätöksen, mutta eivät näy neliöhintavertailussa.
		</p>
	</div>
	<div>
		<h2>Koko maan hintakartta</h2>
		<p>
			<a href="/kartta">Hintakartta</a> esittää toteutuneet neliöhinnat postinumeroalueittain
			Hangosta Nuorgamiin. Klikkaus esitäyttää vertailulomakkeen.
		</p>
	</div>
</section>

<section class="waitlist" id="raportti">
	<h2>Rakenteilla: kohderaportti</h2>
	<p>
		Maksullinen kohderaportti kokoaa taloyhtiön tilinpäätöksestä talouskortin — hoitokate, lainat,
		vastikekehitys, remonttihistoria — yhdistettynä markkinahintavertailuun. Jätä
		sähköpostiosoitteesi, niin saat kutsun ensimmäisten joukossa.
	</p>
	{#if form?.joined}
		<p class="joined">Kiitos — sähköpostisi on kirjattu jonotuslistalle.</p>
	{:else}
		<form method="POST" action="?/waitlist">
			<input type="email" name="email" placeholder="nimi@esimerkki.fi" required autocomplete="email" />
			<button type="submit" class="btn-ghost">Liity jonotuslistalle</button>
		</form>
		{#if form?.waitlistError}<p class="error">{form.waitlistError}</p>{/if}
	{/if}
</section>

<style>
	.hero {
		margin-bottom: 1.75rem;
	}
	.eyebrow {
		color: var(--ink-2);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		margin: 0 0 0.6rem;
	}
	.hero h1 {
		font-size: 2.1rem;
		line-height: 1.15;
		letter-spacing: -0.025em;
		text-wrap: balance;
		margin: 0 0 0.85rem;
		max-width: 34rem;
		font-weight: 700;
	}
	.hero .lede {
		color: var(--ink-2);
		max-width: 38rem;
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
	}

	/* ----- Form: card with subtle elevation ----- */
	form.bench {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.5rem;
		box-shadow: var(--shadow-md);
		border-radius: 2px;
	}
	.bench__title {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--ink-2);
		font-weight: 700;
		margin: 0 0 1rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--line);
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem 1.25rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.lbl {
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--ink-2);
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}
	.unit {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 500;
		color: var(--ink-3);
	}
	.opt {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
		color: var(--ink-3);
	}

	/* ----- Inputs ----- */
	input,
	select {
		font: inherit;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--line-2);
		border-radius: 2px;
		padding: 0.85rem 0.9rem;
		min-height: 48px;
		transition: border-color 0.12s ease, box-shadow 0.12s ease;
		width: 100%;
	}
	input::placeholder {
		color: var(--ink-3);
	}
	input:focus-visible,
	select:focus-visible,
	button:focus-visible {
		outline: none;
		border-color: var(--ink);
		box-shadow: 0 0 0 3px rgba(10, 10, 10, 0.08);
	}

	/* ----- Primary button: outlined → solid on hover/active ----- */
	.bench__actions {
		margin-top: 1.25rem;
		display: flex;
		justify-content: stretch;
	}
	form.bench button[type='submit'] {
		font: inherit;
		font-weight: 700;
		background: var(--ink);
		color: var(--bg);
		border: 2px solid var(--ink);
		padding: 1rem 1.6rem;
		min-height: 52px;
		cursor: pointer;
		border-radius: 2px;
		letter-spacing: 0.02em;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			transform 0.05s ease;
		width: 100%;
	}
	form.bench button[type='submit']:hover {
		background: var(--bg);
		color: var(--ink);
	}
	form.bench button[type='submit']:active {
		transform: translateY(1px);
	}

	/* ----- Ghost button (waitlist) ----- */
	.btn-ghost {
		font: inherit;
		font-weight: 700;
		background: transparent;
		color: var(--ink);
		border: 2px solid var(--ink);
		padding: 0.85rem 1.4rem;
		min-height: 48px;
		cursor: pointer;
		border-radius: 2px;
		transition: background 0.15s ease, color 0.15s ease;
	}
	.btn-ghost:hover {
		background: var(--ink);
		color: var(--bg);
	}

	/* ----- Properties grid ----- */
	.props {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		margin-top: 2.5rem;
	}
	.props div {
		background: var(--surface);
		padding: 1.25rem 1.35rem;
	}
	.props h2 {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		font-weight: 700;
		margin: 0 0 0.5rem;
		color: var(--ink);
	}
	.props p {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.92rem;
		line-height: 1.55;
	}
	.props a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-thickness: 1.5px;
	}

	/* ----- Waitlist card ----- */
	.waitlist {
		margin-top: 2.5rem;
		border: 1px solid var(--line);
		border-left: 4px solid var(--ink);
		background: var(--surface);
		padding: 1.5rem 1.6rem;
		box-shadow: var(--shadow-sm);
		border-radius: 2px;
	}
	.waitlist h2 {
		font-size: 1.1rem;
		letter-spacing: -0.01em;
		margin: 0 0 0.5rem;
		font-weight: 700;
	}
	.waitlist p {
		color: var(--ink-2);
		max-width: 42rem;
		margin: 0 0 1rem;
		font-size: 0.95rem;
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
	.joined {
		color: var(--ink);
		font-weight: 700;
		background: var(--chip-bg);
		padding: 0.6rem 0.8rem;
		display: inline-block;
		border-left: 3px solid var(--ink);
	}
	.error {
		color: var(--ink);
		font-size: 0.9rem;
		margin: 0.5rem 0 0;
		font-weight: 600;
	}

	/* ===== Mobile-first (single column, generous tap targets) ===== */
	@media (max-width: 720px) {
		.hero h1 {
			font-size: 1.7rem;
			letter-spacing: -0.02em;
		}
		.hero .lede {
			font-size: 0.95rem;
			line-height: 1.55;
		}
		form.bench {
			padding: 1.1rem;
		}
		.grid {
			grid-template-columns: 1fr;
			gap: 0.85rem;
		}
		input,
		select {
			padding: 0.95rem 1rem;
			min-height: 50px;
			font-size: 1rem;
		}
		.props {
			grid-template-columns: 1fr;
		}
		.props div {
			padding: 1rem 1.1rem;
		}
		form.bench button[type='submit'] {
			min-height: 54px;
			font-size: 1rem;
		}
		.waitlist {
			padding: 1.15rem 1.2rem;
		}
	}
</style>
