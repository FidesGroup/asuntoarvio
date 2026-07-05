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
			: `${verdict.deltaPct > 0 ? '+' : ''}${verdict.deltaPct} % vs alue`} — Asuntoarvio
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

	<section class="flags">
		<h2>Huomioi tulkinnassa</h2>
		<ul>
			{#each verdict.flags as flag (flag)}
				<li>{flag}</li>
			{/each}
		</ul>
	</section>

	<a class="back" href="/">← Vertaa toinen kohde</a>
</article>

<style>
	.crumb {
		color: var(--ink-2);
		text-transform: uppercase;
		letter-spacing: 0.06em;
		font-size: 0.8rem;
		margin: 0 0 0.5rem;
	}
	h1 {
		font-size: 3.2rem;
		line-height: 1.05;
		letter-spacing: -0.03em;
		margin: 0 0 2rem;
		font-variant-numeric: tabular-nums;
	}
	h1 span {
		display: block;
		font-size: 1.05rem;
		font-weight: 400;
		letter-spacing: 0;
		color: var(--ink-2);
		margin-top: 0.5rem;
	}
	h1.over {
		color: var(--over);
	}
	h1.under {
		color: var(--under);
	}
	h1.none {
		color: var(--ink-2);
		font-size: 2rem;
	}
	dl {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
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
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ink-2);
	}
	dd {
		margin: 0.25rem 0 0;
		font-weight: 700;
		font-variant-numeric: tabular-nums;
	}
	.chip {
		display: inline-block;
		background: var(--chip-bg);
		padding: 0.1rem 0.55rem;
		font-size: 0.85rem;
	}
	.chip.ok {
		color: var(--under);
	}
	.flags h2 {
		font-size: 1rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin: 0 0 0.5rem;
	}
	.flags ul {
		margin: 0;
		padding-left: 1.1rem;
		color: var(--ink-2);
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-width: 40rem;
	}
	.back {
		display: inline-block;
		margin-top: 2.5rem;
		color: var(--accent);
	}
</style>
