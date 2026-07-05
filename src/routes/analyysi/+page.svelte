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
	<h1>Ilmoitusanalyysi: taloyhtiötiedot automaattisesti</h1>
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
				<h3>Sijaintipainotettu vertailu <span class="beta">beta</span></h3>
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
	.hero h1 {
		font-size: 1.8rem;
		line-height: 1.2;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 0.75rem;
		max-width: 38rem;
		font-weight: 700;
	}
	.hero .lede {
		color: var(--ink-2);
		max-width: 42rem;
		margin: 0 0 1.75rem;
		font-size: 1rem;
		line-height: 1.6;
	}
	form {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		box-shadow: var(--shadow-md);
		border-radius: 2px;
	}
	.form-title {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		color: var(--ink-2);
		font-weight: 700;
		margin: 0 0 0.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid var(--line);
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
	}
	input,
	textarea {
		font: inherit;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--line-2);
		border-radius: 2px;
		padding: 0.85rem 0.9rem;
		min-height: 48px;
		transition: border-color 0.12s ease, box-shadow 0.12s ease;
		width: 100%;
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
		line-height: 1.5;
	}
	input:focus-visible,
	textarea:focus-visible,
	button:focus-visible {
		outline: none;
		border-color: var(--ink);
		box-shadow: 0 0 0 3px rgba(10, 10, 10, 0.08);
	}
	.or {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.85rem;
	}
	.actions {
		display: flex;
	}
	button {
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
		transition: background 0.15s ease, color 0.15s ease, transform 0.05s ease;
		width: 100%;
	}
	button:hover {
		background: var(--bg);
		color: var(--ink);
	}
	button:active {
		transform: translateY(1px);
	}
	.error {
		margin: 0;
		color: var(--ink);
		font-size: 0.92rem;
		font-weight: 600;
		background: var(--chip-bg);
		padding: 0.7rem 0.9rem;
		border-left: 3px solid var(--ink);
	}
	article {
		margin-top: 2.5rem;
	}
	.crumb {
		color: var(--ink-2);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.72rem;
		margin: 0 0 0.7rem;
		font-weight: 600;
	}
	.delta {
		font-size: 2.6rem;
		line-height: 1.05;
		letter-spacing: -0.03em;
		margin: 0 0 1.5rem;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}
	.delta span {
		display: block;
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--ink-2);
		margin-top: 0.4rem;
		max-width: 36rem;
		line-height: 1.5;
	}
	.delta.over,
	.delta.under {
		color: var(--ink);
	}
	.delta.none {
		color: var(--ink-2);
		font-size: 1.6rem;
	}
	h3 {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-weight: 700;
		margin: 1.75rem 0 0.6rem;
		color: var(--ink);
	}
	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.2rem 1.35rem;
		box-shadow: var(--shadow-sm);
		border-radius: 2px;
	}
	.loc {
		border-left: 4px solid var(--ink);
		padding-left: 1.3rem;
	}
	.loc h3 {
		margin-top: 0;
	}
	.beta {
		font-size: 0.65rem;
		background: var(--chip-bg);
		padding: 0.1rem 0.4rem;
		vertical-align: middle;
		letter-spacing: 0.05em;
		text-transform: none;
	}
	.loc p {
		margin: 0.4rem 0;
		line-height: 1.55;
	}
	.loc .ov,
	.loc .un {
		color: var(--ink);
	}
	.areas {
		color: var(--ink-2);
		font-size: 0.82rem;
	}
	ul {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		max-width: 42rem;
		line-height: 1.5;
	}
	ul.muted {
		color: var(--ink-2);
	}
	details {
		margin-top: 2rem;
		font-size: 0.85rem;
		color: var(--ink-2);
	}
	pre {
		overflow-x: auto;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1rem;
		font-size: 0.75rem;
	}

	/* ===== Mobile-first ===== */
	@media (max-width: 720px) {
		.hero h1 {
			font-size: 1.5rem;
		}
		.hero .lede {
			font-size: 0.95rem;
		}
		form {
			padding: 1.1rem;
			gap: 0.75rem;
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
			min-height: 54px;
			font-size: 1rem;
		}
		.delta {
			font-size: 2rem;
		}
		.card {
			padding: 1rem 1.1rem;
		}
	}
</style>
