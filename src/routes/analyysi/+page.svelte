<script lang="ts">
	let { form } = $props();
	const fmt = new Intl.NumberFormat('fi-FI');
	const overUnder = $derived(
		form?.verdict?.deltaPct == null ? null : form.verdict.deltaPct >= 0 ? 'over' : 'under'
	);
</script>

<svelte:head>
	<title>Ilmoitusanalyysi — Asuntoarvio</title>
</svelte:head>

<section class="hero">
	<h1>Liitä myynti-ilmoitus — saat arviobenchmarkin taloyhtiötietoineen</h1>
	<p>
		Anna ilmoituksen osoite (Oikotie, Etuovi, välittäjäsivut) tai liitä ilmoituksen teksti.
		Poimimme kentät koneellisesti — hinta, vastikkeet, tontti, tehdyt ja tulevat remontit — ja
		vertaamme neliöhintaa alueen toteutuneisiin kauppoihin.
	</p>
</section>

<form method="POST">
	<label>
		Ilmoituksen osoite
		<input name="url" type="url" placeholder="https://asunnot.oikotie.fi/myytavat-asunnot/helsinki/…" />
	</label>
	<p class="or">tai liitä ilmoituksen teksti (avaa ilmoitus → Ctrl+A → kopioi → liitä):</p>
	<label>
		Ilmoituksen teksti
		<textarea name="text" rows="8" placeholder="Perustiedot&#10;Sijainti&#10;    Malminkatu 40 A, 00100 Helsinki&#10;…"></textarea>
	</label>
	<button type="submit">Analysoi</button>
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
			<section class="loc">
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
			</section>
		{/if}

		{#if form.insights.length}
			<section>
				<h3>Taloyhtiö ja kohde — ilmoituksesta poimittua</h3>
				<ul>
					{#each form.insights as line (line)}<li>{line}</li>{/each}
				</ul>
			</section>
		{/if}

		<section>
			<h3>Huomioi tulkinnassa</h3>
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
		font-size: 1.7rem;
		line-height: 1.2;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 0.75rem;
	}
	.hero p {
		color: var(--ink-2);
		max-width: 40rem;
		margin: 0 0 1.75rem;
	}
	form {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
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
	input,
	textarea {
		font: inherit;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 0.6rem 0.7rem;
		border-radius: 0;
	}
	textarea {
		font-size: 0.85rem;
		resize: vertical;
	}
	input:focus-visible,
	textarea:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
	.or {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.85rem;
	}
	button {
		align-self: flex-start;
		font: inherit;
		font-weight: 700;
		background: var(--accent);
		color: var(--bg);
		border: none;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
	}
	.error {
		margin: 0;
		color: var(--over);
		font-size: 0.9rem;
	}
	article {
		margin-top: 2.5rem;
	}
	.crumb {
		color: var(--ink-2);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.8rem;
		margin: 0 0 0.5rem;
	}
	.delta {
		font-size: 2.6rem;
		line-height: 1.05;
		letter-spacing: -0.03em;
		margin: 0 0 1.5rem;
		font-variant-numeric: tabular-nums;
	}
	.delta span {
		display: block;
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--ink-2);
		margin-top: 0.4rem;
		max-width: 36rem;
	}
	.delta.over {
		color: var(--over);
	}
	.delta.under {
		color: var(--under);
	}
	.delta.none {
		color: var(--ink-2);
		font-size: 1.6rem;
	}
	h3 {
		font-size: 0.95rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 1.75rem 0 0.5rem;
	}
	.loc {
		background: var(--surface);
		border: 1px solid var(--line);
		border-left: 3px solid var(--accent);
		padding: 0.9rem 1.1rem;
		max-width: 42rem;
	}
	.loc h3 {
		margin-top: 0;
	}
	.beta {
		font-size: 0.65rem;
		background: var(--chip-bg);
		padding: 0.1rem 0.4rem;
		vertical-align: middle;
	}
	.loc p {
		margin: 0.4rem 0;
	}
	.loc .ov {
		color: var(--over);
	}
	.loc .un {
		color: var(--under);
	}
	.areas {
		color: var(--ink-2);
		font-size: 0.8rem;
	}
	ul {
		margin: 0;
		padding-left: 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-width: 42rem;
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
</style>
