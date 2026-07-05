<script lang="ts">
	let { data } = $props();
	const { facts, verdict } = $derived(data);
	const fmt = new Intl.NumberFormat('fi-FI');
	const overUnder = $derived(
		verdict.deltaPct === null ? null : verdict.deltaPct >= 0 ? 'over' : 'under'
	);
</script>

<svelte:head>
	<title>
		{verdict.deltaPct === null
			? 'Ei vertailuarvoa'
			: `${verdict.deltaPct > 0 ? '+' : ''}${verdict.deltaPct} % vs alue`} — RehtiArvio by Fides
	</title>
</svelte:head>

<article>
	<p class="crumb">
		{facts.postalCode} · {facts.roomsType} · {facts.livingAreaM2} m²
		{#if facts.buildYear}· rak. {facts.buildYear}{/if}
	</p>

	{#if verdict.deltaPct !== null}
		<h1 class={overUnder}>
			{verdict.deltaPct > 0 ? '+' : ''}{String(verdict.deltaPct).replace('.', ',')} %
			<span>{verdict.deltaPct >= 0 ? 'yli' : 'alle'} alueen toteutuneiden kauppojen</span>
		</h1>
	{:else}
		<h1 class="none">Ei vertailuarvoa <span>tälle alueelle ja huonetyypille</span></h1>
	{/if}

	<dl>
		<div>
			<dt>Kohteen neliöhinta</dt>
			<dd>{fmt.format(verdict.listingEurM2)} €/m²</dd>
		</div>
		<div>
			<dt>Alueen toteutuneet kaupat</dt>
			<dd>
				{#if verdict.benchmarkEurM2}
					{fmt.format(verdict.benchmarkEurM2)} €/m²
				{:else}
					—
				{/if}
			</dd>
		</div>
		<div>
			<dt>Kauppoja (4 neljännestä)</dt>
			<dd>{verdict.transactions4q}{verdict.latestQuarter ? ` · viimeisin ${verdict.latestQuarter}` : ''}</dd>
		</div>
		<div>
			<dt>Luotettavuus</dt>
			<dd><span class="chip {verdict.confidence === 'korkea' ? 'ok' : ''}">{verdict.confidence}</span></dd>
		</div>
	</dl>

	<section class="flags card">
		<h2>Tulkinnan varaukset</h2>
		<ul>
			{#each verdict.flags as flag (flag)}
				<li>{flag}</li>
			{/each}
		</ul>
	</section>

	<a class="back" href="/">← Takaisin hakuun</a>
</article>

<style>
	.crumb {
		color: var(--ink-2);
		text-transform: uppercase;
		letter-spacing: 0.1em;
		font-size: 0.72rem;
		margin: 0 0 0.6rem;
		font-weight: 600;
	}
	h1 {
		font-size: 3.4rem;
		line-height: 1;
		letter-spacing: -0.035em;
		margin: 0 0 2rem;
		font-variant-numeric: tabular-nums;
		font-weight: 700;
	}
	h1 span {
		display: block;
		font-size: 1rem;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--ink-2);
		margin-top: 0.5rem;
		line-height: 1.5;
	}
	h1.over,
	h1.under {
		color: var(--ink);
	}
	h1.none {
		color: var(--ink-2);
		font-size: 2rem;
	}
	dl {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1px;
		background: var(--line);
		border: 1px solid var(--line);
		margin: 0 0 2rem;
	}
	dl div {
		background: var(--surface);
		padding: 0.9rem 1rem;
	}
	dt {
		font-size: 0.72rem;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: var(--ink-2);
		font-weight: 700;
	}
	dd {
		margin: 0.3rem 0 0;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
		font-size: 1.05rem;
	}
	.chip {
		display: inline-block;
		background: var(--chip-bg);
		padding: 0.15rem 0.55rem;
		font-size: 0.85rem;
		border-radius: 2px;
		font-weight: 600;
	}
	.chip.ok {
		color: var(--ink);
		background: var(--ink);
		color: var(--bg);
	}
	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.2rem 1.35rem;
		box-shadow: var(--shadow-sm);
		border-radius: 2px;
	}
	.flags h2 {
		font-size: 0.78rem;
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-weight: 700;
		margin: 0 0 0.6rem;
		color: var(--ink);
	}
	.flags ul {
		margin: 0;
		padding-left: 1.1rem;
		color: var(--ink-2);
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		max-width: 42rem;
		line-height: 1.5;
	}
	.back {
		display: inline-block;
		margin-top: 2.5rem;
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-thickness: 1.5px;
		font-weight: 600;
	}

	/* ===== Mobile-first ===== */
	@media (max-width: 720px) {
		h1 {
			font-size: 2.4rem;
			margin-bottom: 1.5rem;
		}
		h1.none {
			font-size: 1.5rem;
		}
		dl {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		dl div {
			padding: 0.75rem 0.85rem;
		}
		.card {
			padding: 1rem 1.1rem;
		}
	}
	@media (max-width: 420px) {
		h1 {
			font-size: 2rem;
		}
		dl {
			grid-template-columns: 1fr;
		}
	}
</style>
