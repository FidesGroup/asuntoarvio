<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>RehtiArvio — onko pyyntihinta linjassa toteutuneiden kauppojen kanssa?</title>
</svelte:head>

<section class="hero">
	<span class="eyebrow">Markkinahinta-analyysi</span>
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
	<article class="prop">
		<div class="prop__icon" aria-hidden="true">◆</div>
		<h3>Toteutuneet kauppahinnat</h3>
		<p>
			Vertailuarvo muodostetaan Tilastokeskuksen julkaisemista toteutuneista kaupoista, painotettuna
			neljän viimeisimmän neljänneksen kauppamäärillä. Jokaisen tuloksen yhteydessä ilmoitetaan
			taustalla olevien kauppojen lukumäärä.
		</p>
	</article>
	<article class="prop">
		<div class="prop__icon" aria-hidden="true">◇</div>
		<h3>Taloyhtiötiedot ilmoituksesta</h3>
		<p>
			<a href="/analyysi">Ilmoitusanalyysi</a> poimii myynti-ilmoituksesta tontin, vastikkeet,
			yhtiölainat sekä tehdyt ja tulevat remontit — ne tekijät, jotka ratkaisevat
			sijoituspäätöksen, mutta eivät näy neliöhintavertailussa.
		</p>
	</article>
	<article class="prop">
		<div class="prop__icon" aria-hidden="true">◈</div>
		<h3>Koko maan hintakartta</h3>
		<p>
			<a href="/kartta">Hintakartta</a> esittää toteutuneet neliöhinnat postinumeroalueittain
			Hangosta Nuorgamiin. Klikkaus esitäyttää vertailulomakkeen.
		</p>
	</article>
</section>

<section class="waitlist" id="raportti">
	<div class="waitlist__body">
		<h2>Rakenteilla: kohderaportti</h2>
		<p>
			Maksullinen kohderaportti kokoaa taloyhtiön tilinpäätöksestä talouskortin — hoitokate,
			lainat, vastikekehitys, remonttihistoria — yhdistettynä markkinahintavertailuun. Jätä
			sähköpostiosoitteesi, niin saat kutsun ensimmäisten joukossa.
		</p>
	</div>
	<div class="waitlist__cta">
		{#if form?.joined}
			<p class="joined">Kiitos — sähköpostisi on kirjattu jonotuslistalle.</p>
		{:else}
			<form method="POST" action="?/waitlist">
				<input type="email" name="email" placeholder="nimi@esimerkki.fi" required autocomplete="email" />
				<button type="submit">Liity jonotuslistalle</button>
			</form>
			{#if form?.waitlistError}<p class="error">{form.waitlistError}</p>{/if}
		{/if}
	</div>
</section>

<style>
	/* ===== Hero ===== */
	.hero {
		max-width: 44rem;
		padding-top: 1rem;
	}
	.eyebrow {
		display: inline-block;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--ink-2);
		letter-spacing: 0.01em;
		background: var(--chip-bg);
		padding: 0.35rem 0.7rem;
		border-radius: var(--radius-pill);
		margin-bottom: 1.25rem;
	}
	.hero h1 {
		font-size: 2.6rem;
		line-height: 1.1;
		letter-spacing: -0.035em;
		text-wrap: balance;
		margin: 0 0 1.1rem;
		max-width: 30rem;
		font-weight: 500;
	}
	.hero .lede {
		color: var(--ink-2);
		max-width: 38rem;
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.6;
	}

	/* ===== Form (soft card) ===== */
	form.bench {
		background: var(--surface);
		padding: 2rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
		border: 1px solid var(--line);
	}

	.bench__title {
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0;
		color: var(--ink);
		margin: 0 0 1.25rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem 1.25rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}

	.lbl {
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--ink);
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.unit,
	.opt {
		color: var(--ink-3);
		font-weight: 400;
		font-size: 0.78rem;
	}

	/* ===== Inputs (soft) ===== */
	input,
	select {
		font: inherit;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid transparent;
		padding: 0.8rem 0.95rem;
		min-height: 46px;
		border-radius: var(--radius-md);
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
		width: 100%;
	}

	input::placeholder {
		color: var(--ink-3);
	}

	input:hover,
	select:hover {
		background: var(--surface);
		border-color: var(--line-2);
	}

	input:focus-visible,
	select:focus-visible,
	button:focus-visible {
		outline: none;
		background: var(--surface);
		border-color: var(--ink);
		box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.08);
	}

	.bench__actions {
		margin-top: 1.5rem;
		display: flex;
	}

	form.bench button[type='submit'] {
		font: inherit;
		font-weight: 500;
		background: var(--ink);
		color: var(--surface);
		border: 1px solid var(--ink);
		padding: 0.95rem 1.75rem;
		min-height: 50px;
		cursor: pointer;
		border-radius: var(--radius-pill);
		letter-spacing: 0.005em;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			transform 0.05s ease,
			box-shadow 0.15s ease;
		width: 100%;
		box-shadow: 0 1px 2px rgba(17, 24, 39, 0.15), 0 4px 12px rgba(17, 24, 39, 0.1);
	}
	form.bench button[type='submit']:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(17, 24, 39, 0.15), 0 8px 20px rgba(17, 24, 39, 0.12);
	}
	form.bench button[type='submit']:active {
		transform: translateY(0);
	}

	/* ===== Properties ===== */
	.props {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.prop {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		padding: 1.5rem 1.6rem;
		box-shadow: var(--shadow-sm);
		transition: box-shadow 0.2s ease, transform 0.2s ease;
	}
	.prop:hover {
		box-shadow: var(--shadow-md);
		transform: translateY(-2px);
	}
	.prop__icon {
		font-size: 1.4rem;
		color: var(--ink-3);
		margin-bottom: 0.85rem;
		letter-spacing: 0.05em;
	}
	.prop h3 {
		font-size: 1.05rem;
		font-weight: 600;
		letter-spacing: -0.015em;
		margin: 0 0 0.5rem;
		color: var(--ink);
	}
	.prop p {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.92rem;
		line-height: 1.55;
	}
	.prop a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--ink-3);
		text-decoration-thickness: 1px;
	}

	/* ===== Waitlist (split layout) ===== */
	.waitlist {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: 2rem;
		align-items: center;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		padding: 2.25rem 2.5rem;
		box-shadow: var(--shadow-sm);
	}
	.waitlist h2 {
		font-size: 1.3rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.6rem;
		font-weight: 600;
	}
	.waitlist p {
		color: var(--ink-2);
		margin: 0;
		font-size: 0.95rem;
		line-height: 1.6;
	}
	.waitlist form {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.waitlist form input {
		flex: 1 1 auto;
		min-width: 0;
		background: var(--bg);
	}
	.waitlist form button {
		font: inherit;
		font-weight: 500;
		background: transparent;
		color: var(--ink);
		border: 1px solid var(--ink);
		padding: 0.8rem 1.25rem;
		min-height: 46px;
		cursor: pointer;
		border-radius: var(--radius-pill);
		transition: background 0.15s ease, color 0.15s ease;
		white-space: nowrap;
	}
	.waitlist form button:hover {
		background: var(--ink);
		color: var(--surface);
	}
	.joined {
		color: var(--ink);
		font-weight: 500;
		background: var(--chip-bg);
		padding: 0.8rem 1rem;
		border-radius: var(--radius-md);
		margin: 0;
	}
	.error {
		color: #b91c1c;
		font-size: 0.85rem;
		margin: 0.4rem 0 0;
		font-weight: 500;
	}
	@media (prefers-color-scheme: dark) {
		.error {
			color: #fca5a5;
		}
	}

	/* ===== Mobile-first ===== */
	@media (max-width: 860px) {
		.hero h1 {
			font-size: 2.05rem;
		}
		form.bench {
			padding: 1.5rem;
		}
		.grid {
			grid-template-columns: 1fr 1fr;
		}
		.props {
			grid-template-columns: 1fr;
		}
		.waitlist {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 1.75rem 1.5rem;
		}
	}

	@media (max-width: 560px) {
		.hero h1 {
			font-size: 1.75rem;
			letter-spacing: -0.025em;
		}
		.hero .lede {
			font-size: 0.98rem;
		}
		form.bench {
			padding: 1.25rem;
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
		form.bench button[type='submit'] {
			min-height: 52px;
			font-size: 1rem;
		}
		.waitlist {
			padding: 1.5rem 1.25rem;
		}
		.waitlist h2 {
			font-size: 1.15rem;
		}
		.waitlist form {
			flex-direction: column;
			align-items: stretch;
		}
		.waitlist form button {
			width: 100%;
		}
		.prop {
			padding: 1.25rem 1.4rem;
		}
	}
</style>
