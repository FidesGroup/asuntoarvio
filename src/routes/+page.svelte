<script lang="ts">
	import { enhance } from '$app/forms';
	let { data, form } = $props();
	let activeInput = $state<'url' | 'text' | 'manual'>('url');
</script>

<svelte:head>
	<title>RehtiArvio — ilmoitusanalyysi ja markkinahintavertailu</title>
</svelte:head>

<section class="hero">
	<span class="eyebrow">Ilmoitusanalyysi</span>
	<h1>Analysoi myynti-ilmoitus — selvitä, onko pyyntihinta linjassa toteutuneiden kauppojen kanssa.</h1>
	<p class="lede">
		Anna myynti-ilmoituksen URL-osoite (Oikotie, Etuovi, välittäjäsivut) tai liitä ilmoituksen
		teksti suoraan. Tiedot — hinta, vastikkeet, tontti, tehdyt ja tulevat remontit — poimitaan
		koneellisesti ja yhdistetään Tilastokeskuksen toteutuneisiin kauppahintoihin.
	</p>
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
		<form method="GET" action="/arvio" class="manual-form">
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
			</div>
			<datalist id="known-pc">
				{#each data.postalCodes as pc (pc)}<option value={pc}></option>{/each}
			</datalist>
			<div class="manual__actions">
				<button type="submit">Analysoi kohde</button>
			</div>
		</form>
	{:else}
		<form method="POST" class="auto-form" use:enhance>
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
		</form>
	{/if}
</div>

{#if form?.verdict && activeInput !== 'manual'}
	<article class="result">
		<p class="crumb">
			{form.extracted.address ?? '—'} · {form.facts.postalCode} · {form.facts.roomsType} ·
			{form.facts.livingAreaM2} m²
			{#if form.facts.buildYear}· rak. {form.facts.buildYear}{/if}
			{#if form.source}· lähde {form.source}{/if}
		</p>

		{#if form.verdict.deltaPct !== null}
			<h2 class="delta {form.verdict.deltaPct >= 0 ? 'over' : 'under'}">
				{form.verdict.deltaPct > 0 ? '+' : ''}{String(form.verdict.deltaPct).replace('.', ',')} %
				<span>{form.verdict.deltaPct >= 0 ? 'yli' : 'alle'} alueen toteutuneiden kauppojen</span>
			</h2>
		{:else}
			<h2 class="delta none">Ei vertailuarvoa <span>tälle alueelle ja huonetyypille</span></h2>
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

		{#if form.insights.length}
			<section class="card">
				<h3>Taloyhtiö ja kohde — ilmoituksesta poimittua</h3>
				<ul>
					{#each form.insights as line (line)}<li>{line}</li>{/each}
				</ul>
			</section>
		{/if}

		<section class="card">
			<h3>Tulkinnan varaukset</h3>
			<ul class="muted">
				{#each form.verdict.flags as flag (flag)}<li>{flag}</li>{/each}
			</ul>
		</section>
	</article>
{/if}

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
		<h3>Koko maan hintakartta</h3>
		<p>
			<a href="/kartta">Hintakartta</a> esittää toteutuneet neliöhinnat postinumeroalueittain
			Hangosta Nuorgamiin. Klikkaus esitäyttää vertailulomakkeen.
		</p>
	</article>
	<article class="prop">
		<div class="prop__icon" aria-hidden="true">◈</div>
		<h3>Yksityisyys etusijalla</h3>
		<p>
			Teemme yhden käyttäjän ohjaaman, kertaluonteisen sivun haun vain luotetuilta
			ilmoituspalveluilta. Mitään listausta tai käyttäjätietoja ei tallenneta palveluun.
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
		<form method="POST" action="?/waitlist" use:enhance>
			<input type="email" name="email" placeholder="nimi@esimerkki.fi" required autocomplete="email" />
			<button type="submit">Liity jonotuslistalle</button>
		</form>
		{#if form?.joined}
			<p class="joined">Kiitos — sähköpostisi on kirjattu jonotuslistalle.</p>
		{:else if form?.waitlistError}
			<p class="error">{form.waitlistError}</p>
		{/if}
	</div>
</section>

<style>
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
	.hero {
		max-width: 48rem;
		padding-top: 0.5rem;
		margin-bottom: 2rem;
	}
	.hero h1 {
		font-size: 2.4rem;
		line-height: 1.15;
		letter-spacing: -0.03em;
		text-wrap: balance;
		margin: 0 0 1rem;
		max-width: 42rem;
		font-weight: 500;
	}
	.hero .lede {
		color: var(--ink-2);
		max-width: 42rem;
		margin: 0;
		font-size: 1.02rem;
		line-height: 1.6;
	}

	/* ===== Analyzer container (PRIMARY card) ===== */
	.analyzer {
		background: var(--surface);
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
		font-size: 0.85rem;
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
		font-size: 0.82rem;
		font-weight: 500;
		color: var(--ink);
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}
	.unit, .opt {
		color: var(--ink-3);
		font-weight: 400;
		font-size: 0.78rem;
	}

	/* Analyzer inputs */
	.analyzer input,
	.analyzer textarea,
	.analyzer select {
		font: inherit;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid transparent;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-md);
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			box-shadow 0.15s ease;
		width: 100%;
	}
	.analyzer textarea {
		font-size: 0.92rem;
		resize: vertical;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		line-height: 1.55;
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
		border-color: var(--ink);
		box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.08);
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
		font-weight: 500;
		background: var(--ink);
		color: var(--surface);
		border: 1px solid var(--ink);
		padding: 0.95rem 1.6rem;
		cursor: pointer;
		border-radius: var(--radius-pill);
		letter-spacing: 0.005em;
		transition:
			background 0.15s ease,
			color 0.15s ease,
			transform 0.05s ease,
			box-shadow 0.15s ease;
		box-shadow: 0 1px 2px rgba(17, 24, 39, 0.15), 0 4px 12px rgba(17, 24, 39, 0.1);
	}
	.auto__actions button[type='submit']:hover,
	.manual__actions button[type='submit']:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(17, 24, 39, 0.15), 0 8px 20px rgba(17, 24, 39, 0.12);
	}
	.auto__actions button[type='submit']:active,
	.manual__actions button[type='submit']:active {
		transform: translateY(0);
	}
	.hint {
		color: var(--ink-3);
		font-size: 0.8rem;
		margin: 0;
	}
	.error {
		color: #b91c1c;
		font-size: 0.9rem;
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

	/* ===== Manual form (Syötä tiedot käsin) ===== */
	.manual-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.form-title {
		font-size: 0.95rem;
		font-weight: 600;
		letter-spacing: 0;
		color: var(--ink);
		margin: 0 0 0.25rem;
	}
	.manual-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem 1rem;
	}
	.manual-grid label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.manual__actions {
		display: flex;
	}

	/* ===== Result block ===== */
	.result {
		margin-top: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.crumb {
		color: var(--ink-3);
		letter-spacing: 0.01em;
		font-size: 0.82rem;
		margin: 0 0 0.25rem;
		font-weight: 500;
	}
	.delta {
		font-size: 2.4rem;
		line-height: 1.05;
		letter-spacing: -0.035em;
		margin: 0;
		font-variant-numeric: tabular-nums;
		font-weight: 500;
	}
	.delta span {
		display: block;
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--ink-2);
		margin-top: 0.5rem;
		max-width: 40rem;
		line-height: 1.55;
	}
	.delta.over, .delta.under { color: var(--ink); }
	.delta.none { color: var(--ink); font-size: 1.6rem; }

	.card {
		background: var(--surface);
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
		font-size: 0.65rem;
		font-weight: 500;
		background: var(--chip-bg);
		color: var(--ink-2);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-pill);
		letter-spacing: 0.04em;
	}
	.loc p { margin: 0.5rem 0; line-height: 1.55; color: var(--ink-2); }
	.loc p b { color: var(--ink); }
	.areas { color: var(--ink-3); font-size: 0.82rem; }
	h3 {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 0.6rem;
		color: var(--ink);
		letter-spacing: -0.005em;
	}
	ul {
		margin: 0;
		padding-left: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 42rem;
		line-height: 1.55;
		color: var(--ink-2);
	}
	ul.muted { color: var(--ink-2); }

	/* ===== Properties grid ===== */
	.props {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 3rem;
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
		font-size: 1rem;
		font-weight: 600;
		letter-spacing: -0.015em;
		margin: 0 0 0.5rem;
		color: var(--ink);
	}
	.prop p {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.9rem;
		line-height: 1.55;
	}
	.prop a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--ink-3);
		text-decoration-thickness: 1px;
	}

	/* ===== Waitlist ===== */
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
		margin-top: 1.5rem;
	}
	.waitlist h2 {
		font-size: 1.25rem;
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
	.waitlist__cta form {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.waitlist__cta form input {
		flex: 1 1 auto;
		min-width: 0;
		font: inherit;
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
		border-color: var(--ink);
		box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.08);
	}
	.waitlist__cta form button {
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
	.waitlist__cta form button:hover {
		background: var(--ink);
		color: var(--surface);
	}
	.joined {
		color: var(--ink);
		font-weight: 500;
		background: var(--chip-bg);
		padding: 0.8rem 1rem;
		border-radius: var(--radius-md);
		margin: 0.5rem 0 0;
	}

	/* ===== Mobile-first ===== */
	@media (max-width: 860px) {
		.hero h1 { font-size: 1.95rem; }
		.analyzer { padding: 1.1rem; }
		.manual-grid { grid-template-columns: 1fr 1fr; }
		.props { grid-template-columns: 1fr; }
		.waitlist {
			grid-template-columns: 1fr;
			gap: 1.5rem;
			padding: 1.75rem 1.5rem;
		}
	}
	@media (max-width: 560px) {
		.hero h1 { font-size: 1.65rem; letter-spacing: -0.025em; }
		.lede { font-size: 0.95rem; }
		.analyzer { padding: 1rem; }
		.tabs { width: 100%; }
		.tab { flex: 1; text-align: center; padding: 0.55rem 0.5rem; font-size: 0.78rem; }
		.manual-grid { grid-template-columns: 1fr; }
		.analyzer input,
		.analyzer textarea,
		.analyzer select,
		.waitlist__cta form input {
			padding: 0.95rem 1rem;
			min-height: 50px;
			font-size: 1rem;
		}
		.analyzer textarea { min-height: 160px; font-size: 1rem; }
		.auto__actions button[type='submit'],
		.manual__actions button[type='submit'] {
			min-height: 52px;
			font-size: 1rem;
			width: 100%;
		}
		.waitlist { padding: 1.5rem 1.25rem; }
		.waitlist h2 { font-size: 1.1rem; }
		.waitlist__cta form { flex-direction: column; }
		.waitlist__cta form button { width: 100%; }
		.prop { padding: 1.25rem 1.4rem; }
		.delta { font-size: 1.9rem; }
		.card { padding: 1.25rem 1.4rem; }
	}
</style>
