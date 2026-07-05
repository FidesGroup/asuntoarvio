<script lang="ts">
	import PriceMap from '$lib/PriceMap.svelte';
	let { form } = $props();
	const fmt = new Intl.NumberFormat('fi-FI');
	const overUnder = $derived(
		form?.verdict?.deltaPct == null ? null : form.verdict.deltaPct >= 0 ? 'over' : 'under'
	);
</script>

<svelte:head>
	<title>Ilmoitusanalyysi — RehtiArvio by Fides</title>
</svelte:head>

<section class="hero">
	<span class="eyebrow">Ilmoitusanalyysi</span>
	<h1>Poimi taloyhtiötiedot automaattisesti myynti-ilmoituksesta</h1>
	<p class="lede">
		Anna myynti-ilmoituksen URL-osoite (Oikotie, Etuovi, välittäjäsivut) tai liitä ilmoituksen
		teksti suoraan. Tiedot — hinta, vastikkeet, tontti, tehdyt ja tulevat remontit — poimitaan
		koneellisesti ja yhdistetään markkinahintavertailuun.
	</p>
</section>

<form method="POST">
	<h2 class="form-title">Ilmoituksen lähde</h2>
	<label>
		<span class="lbl">Ilmoituksen URL</span>
		<input name="url" type="url" placeholder="https://asunnot.oikotie.fi/myytavat-asunnot/helsinki/…" />
	</label>
	<p class="or">tai liitä ilmoituksen teksti (avaa ilmoitus → kopioi → liitä):</p>
	<label>
		<span class="lbl">Ilmoituksen teksti</span>
		<textarea name="text" rows="8" placeholder="Perustiedot&#10;Sijainti&#10;    Malminkatu 40 A, 00100 Helsinki&#10;…"></textarea>
	</label>
	<div class="actions">
		<button type="submit">Analysoi ilmoitus</button>
	</div>
	{#if form?.error}<p class="error">{form.error}</p>{/if}
</form>

{#if form?.verdict}
	<article>
		<p class="crumb">
			{form.extracted.address ?? '—'} · {form.facts.postalCode} · {form.facts.roomsType} ·
			{form.facts.livingAreaM2} m²
			{#if form.facts.buildYear}· rak. {form.facts.buildYear}{/if}
			{#if form.source}· lähde {form.source}{/if}
		</p>

		{#if form.verdict.deltaPct !== null}
			<h2 class="delta {overUnder}">
				{form.verdict.deltaPct > 0 ? '+' : ''}{String(form.verdict.deltaPct).replace('.', ',')} %
				<span>{form.verdict.deltaPct >= 0 ? 'yli' : 'alle'} alueen toteutuneiden kauppojen
					({fmt.format(form.verdict.listingEurM2)} vs {fmt.format(form.verdict.benchmarkEurM2)} €/m²,
					luotettavuus {form.verdict.confidence})</span>
			</h2>
		{:else}
			<h2 class="delta none">Ei vertailuarvoa <span>tälle alueelle ja huonetyypille — kohteen neliöhinta {fmt.format(form.verdict.listingEurM2)} €/m²</span></h2>
		{/if}

		{#if form.location}
			<section class="loc card">
				<header class="loc__head">
					<h3>Sijaintipainotettu vertailu</h3>
					<span class="beta">beta</span>
				</header>
				<p>
					Osoitteen ympäristön kaupoilla painotettu vertailuarvo on
					<b>{fmt.format(form.location.eurM2)} €/m²</b> → kohde on
					<b class={form.location.deltaPct >= 0 ? 'ov' : 'un'}>
						{form.location.deltaPct > 0 ? '+' : ''}{String(form.location.deltaPct).replace('.', ',')} %
						{form.location.deltaPct >= 0 ? 'yli' : 'alle'}
					</b>
					sijainnin markkinatason.
				</p>
				<p class="areas">
					Painotus: {#each form.location.areasUsed as a, i (a.pc)}{i > 0 ? ' · ' : ''}{a.nimi || a.pc}
						{a.km} km ({fmt.format(a.eurM2)} €/m²){/each}
				</p>
				{#key `${form.location.lon},${form.location.lat}`}
					<PriceMap
						center={[form.location.lon, form.location.lat]}
						zoom={11.5}
						height="300px"
						marker={[form.location.lon, form.location.lat]}
						showLegend={false}
					/>
				{/key}
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

		<details>
			<summary>Kaikki poimitut kentät</summary>
			<pre>{JSON.stringify(form.extracted, null, 2)}</pre>
		</details>
	</article>
{/if}

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
		max-width: 44rem;
		margin-bottom: 2rem;
	}
	.hero h1 {
		font-size: 2.3rem;
		line-height: 1.15;
		letter-spacing: -0.03em;
		text-wrap: balance;
		margin: 0 0 0.95rem;
		max-width: 38rem;
		font-weight: 500;
	}
	.hero .lede {
		color: var(--ink-2);
		max-width: 42rem;
		margin: 0;
		font-size: 1.05rem;
		line-height: 1.6;
	}

	form {
		background: var(--surface);
		padding: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		box-shadow: var(--shadow-md);
		border-radius: var(--radius-lg);
		border: 1px solid var(--line);
	}
	.form-title {
		font-size: 0.85rem;
		font-weight: 600;
		letter-spacing: 0;
		color: var(--ink);
		margin: 0 0 0.25rem;
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
	}
	input,
	textarea {
		font: inherit;
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
	input:hover,
	textarea:hover {
		background: var(--surface);
		border-color: var(--line-2);
	}
	input::placeholder,
	textarea::placeholder {
		color: var(--ink-3);
	}
	textarea {
		font-size: 0.92rem;
		resize: vertical;
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		min-height: 180px;
		line-height: 1.55;
	}
	input:focus-visible,
	textarea:focus-visible,
	button:focus-visible {
		outline: none;
		background: var(--surface);
		border-color: var(--ink);
		box-shadow: 0 0 0 4px rgba(17, 24, 39, 0.08);
	}
	.or {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.88rem;
	}
	.actions {
		display: flex;
	}
	button {
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
	button:hover {
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(17, 24, 39, 0.15), 0 8px 20px rgba(17, 24, 39, 0.12);
	}
	button:active {
		transform: translateY(0);
	}
	.error {
		margin: 0;
		color: #b91c1c;
		font-size: 0.9rem;
		font-weight: 500;
		background: #fef2f2;
		padding: 0.85rem 1rem;
		border-radius: var(--radius-md);
	}
	@media (prefers-color-scheme: dark) {
		.error {
			background: #2a1414;
			color: #fca5a5;
		}
	}

	article {
		margin-top: 2.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.crumb {
		color: var(--ink-3);
		letter-spacing: 0.01em;
		font-size: 0.82rem;
		margin: 0 0 0.5rem;
		font-weight: 500;
	}
	.delta {
		font-size: 2.6rem;
		line-height: 1.05;
		letter-spacing: -0.035em;
		margin: 0 0 0.5rem;
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
	.delta.over,
	.delta.under {
		color: var(--ink);
	}
	.delta.none {
		color: var(--ink);
		font-size: 1.6rem;
	}

	h3 {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 0.6rem;
		color: var(--ink);
		letter-spacing: -0.005em;
	}
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
	.loc__head h3 {
		margin: 0;
	}
	.beta {
		font-size: 0.65rem;
		font-weight: 500;
		background: var(--chip-bg);
		color: var(--ink-2);
		padding: 0.15rem 0.45rem;
		border-radius: var(--radius-pill);
		letter-spacing: 0.04em;
	}
	.loc p {
		margin: 0.5rem 0;
		line-height: 1.55;
		color: var(--ink-2);
	}
	.loc p b {
		color: var(--ink);
	}
	.loc .ov,
	.loc .un {
		color: var(--ink);
	}
	.areas {
		color: var(--ink-3);
		font-size: 0.82rem;
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
	ul.muted {
		color: var(--ink-2);
	}
	details {
		font-size: 0.85rem;
		color: var(--ink-2);
		margin-top: 0.5rem;
	}
	pre {
		overflow-x: auto;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1rem;
		font-size: 0.75rem;
		border-radius: var(--radius-md);
	}

	/* ===== Mobile-first ===== */
	@media (max-width: 720px) {
		.hero h1 {
			font-size: 1.8rem;
		}
		.hero .lede {
			font-size: 0.98rem;
		}
		form {
			padding: 1.5rem;
		}
		input {
			padding: 0.95rem 1rem;
			min-height: 50px;
			font-size: 1rem;
		}
		textarea {
			padding: 0.95rem 1rem;
			min-height: 160px;
			font-size: 1rem;
		}
		button {
			min-height: 52px;
			font-size: 1rem;
		}
		.delta {
			font-size: 2rem;
		}
		.card {
			padding: 1.25rem 1.4rem;
		}
	}
</style>
