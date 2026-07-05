<script lang="ts">
	let { data } = $props();
	const { facts, verdict } = $derived(data);
	const fmt = new Intl.NumberFormat('fi-FI');
	const overUnder = $derived(
		verdict.deltaPct === null ? null : verdict.deltaPct >= 0 ? 'over' : 'under'
	);
	const verdictLabel = $derived(
		verdict.deltaPct === null
			? 'Ei vertailuarvoa'
			: verdict.deltaPct >= 0
				? 'Pyyntihinta on alueen toteutuneiden kauppojen yläpuolella'
				: 'Pyyntihinta on alueen toteutuneiden kauppojen alapuolella'
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

	<div class="hero">
		{#if verdict.deltaPct !== null}
			<span class="eyebrow">Analyysin tulos</span>
			<h1 class={overUnder}>
				{verdict.deltaPct > 0 ? '+' : ''}{String(verdict.deltaPct).replace('.', ',')} %
			</h1>
			<p class="summary">{verdictLabel}</p>
		{:else}
			<span class="eyebrow">Analyysin tulos</span>
			<h1 class="none">Ei vertailuarvoa</h1>
			<p class="summary">Tälle alueelle ja huonetyypille ei löydy riittävästi toteutuneita kauppoja.</p>
		{/if}
	</div>

	<dl>
		<div>
			<dt>Kohteen neliöhinta</dt>
			<dd>{fmt.format(verdict.listingEurM2)} <span class="unit">€/m²</span></dd>
		</div>
		<div>
			<dt>Alueen toteutuneet kaupat</dt>
			<dd>
				{#if verdict.benchmarkEurM2}
					{fmt.format(verdict.benchmarkEurM2)} <span class="unit">€/m²</span>
				{:else}
					<span class="dash">—</span>
				{/if}
			</dd>
		</div>
		<div>
			<dt>Kauppoja (4 neljännestä)</dt>
			<dd>
				{fmt.format(verdict.transactions4q)}
				{#if verdict.latestQuarter}<span class="meta">· viimeisin {verdict.latestQuarter}</span>{/if}
			</dd>
		</div>
		<div>
			<dt>Luotettavuus</dt>
			<dd><span class="chip {verdict.confidence === 'korkea' ? 'chip--solid' : ''}">{verdict.confidence}</span></dd>
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
		color: var(--ink-3);
		letter-spacing: 0.01em;
		font-size: 0.82rem;
		margin: 0 0 1.5rem;
		font-weight: 500;
	}

	.hero {
		margin-bottom: 2.5rem;
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
		margin-bottom: 1.1rem;
	}

	h1 {
		font-size: 4.5rem;
		line-height: 1;
		letter-spacing: -0.04em;
		margin: 0 0 0.85rem;
		font-variant-numeric: tabular-nums;
		font-weight: 500;
	}
	h1.over,
	h1.under {
		color: var(--ink);
	}
	h1.none {
		color: var(--ink);
		font-size: 2.4rem;
	}

	.summary {
		color: var(--ink-2);
		font-size: 1.1rem;
		line-height: 1.5;
		max-width: 36rem;
		margin: 0;
	}

	dl {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
		margin: 0 0 2rem;
	}
	dl div {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		padding: 1.1rem 1.25rem;
		box-shadow: var(--shadow-sm);
	}
	dt {
		font-size: 0.78rem;
		color: var(--ink-2);
		font-weight: 500;
		margin-bottom: 0.4rem;
	}
	dd {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		font-size: 1.15rem;
		letter-spacing: -0.02em;
	}
	.unit {
		font-size: 0.85rem;
		color: var(--ink-2);
		font-weight: 500;
		margin-left: 0.15rem;
	}
	.meta {
		display: block;
		font-size: 0.78rem;
		color: var(--ink-3);
		font-weight: 400;
		margin-top: 0.25rem;
	}
	.dash {
		color: var(--ink-3);
	}

	.chip {
		display: inline-block;
		background: var(--chip-bg);
		color: var(--ink-2);
		padding: 0.2rem 0.6rem;
		font-size: 0.85rem;
		border-radius: var(--radius-pill);
		font-weight: 500;
	}
	.chip--solid {
		background: var(--ink);
		color: var(--surface);
	}

	.card {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.5rem 1.75rem;
		box-shadow: var(--shadow-sm);
		border-radius: var(--radius-lg);
	}

	.flags h2 {
		font-size: 0.95rem;
		font-weight: 600;
		margin: 0 0 0.75rem;
		color: var(--ink);
	}
	.flags ul {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--ink-2);
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		max-width: 42rem;
		line-height: 1.5;
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 2rem;
		color: var(--ink-2);
		text-decoration: none;
		font-weight: 500;
		font-size: 0.95rem;
		padding: 0.5rem 0;
		transition: color 0.15s ease;
	}
	.back:hover {
		color: var(--ink);
	}

	/* ===== Mobile-first ===== */
	@media (max-width: 720px) {
		h1 {
			font-size: 3rem;
			margin-bottom: 0.75rem;
		}
		h1.none {
			font-size: 1.8rem;
		}
		.summary {
			font-size: 1rem;
		}
		dl {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.card {
			padding: 1.25rem 1.4rem;
		}
	}
	@media (max-width: 420px) {
		h1 {
			font-size: 2.4rem;
		}
		dl {
			grid-template-columns: 1fr;
		}
	}
</style>
