<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PriceMap from '$lib/PriceMap.svelte';
	import PriceBandsChart from '$lib/components/sections/PriceBandsChart.svelte';
	import HistoryCharts from '$lib/components/sections/HistoryCharts.svelte';
	import { copy } from '$lib/copy/fi';

	let { data } = $props();
	const fmt = new Intl.NumberFormat('fi-FI');
	const tops = $derived([
		{ title: copy.kartta.topExpensive, rows: data.market.topExpensive },
		{ title: copy.kartta.topCheapest, rows: data.market.topCheapest }
	]);
</script>

<svelte:head>
	<title>Markkina-analyysi | RehtiArvio</title>
	<meta name="description" content={copy.kartta.lede} />
</svelte:head>

<PageHero
	eyebrow={copy.kartta.title}
	h1={copy.kartta.h1}
	lede={copy.kartta.lede}
/>

<div class="kstats num" aria-label={copy.landing.market.eyebrow}>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsTransactions}</span><span class="kstat__val">{fmt.format(data.market.totalTransactions)}</span></div>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsMedian}</span><span class="kstat__val">{fmt.format(data.market.medianEurM2)} <span class="kstat__unit">€/m²</span></span></div>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsP25}</span><span class="kstat__val">{fmt.format(data.market.p25EurM2)} <span class="kstat__unit">€/m²</span></span></div>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsP75}</span><span class="kstat__val">{fmt.format(data.market.p75EurM2)} <span class="kstat__unit">€/m²</span></span></div>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsAreas}</span><span class="kstat__val">{fmt.format(data.market.areasWithData)}</span></div>
</div>

<Card padded={false} variant="raised">
	<PriceMap onareaclick={(pc) => goto(`/?pc=${pc}`)} />
</Card>

<p class="note note--touch">{copy.kartta.tapHint}</p>

<p class="note">
	<span class="note__dot" aria-hidden="true"></span>
	{copy.kartta.legendNoData}
</p>

<PriceBandsChart bands={data.market.bands} />

{#await data.lazy.countryHistory then ch}
	{#if ch}
		<div class="country">
			<Card>
				<HistoryCharts
					history={ch}
					priceTitle={copy.kartta.countryPriceTitle}
					volumeTitle={copy.kartta.countryVolumeTitle}
					source={copy.kartta.countrySource}
				/>
			</Card>
		</div>
	{/if}
{/await}

<div class="tops">
	{#each tops as top (top.title)}
		<div class="top">
			<h2 class="top__title">{top.title}</h2>
			<table class="top__table num">
				<thead>
					<tr><th>{copy.kartta.colArea}</th><th class="r">{copy.kartta.colPrice}</th><th class="r">{copy.kartta.colN}</th></tr>
				</thead>
				<tbody>
					{#each top.rows as r (r.pc)}
						<tr>
							<td>
								<button type="button" class="top__link" onclick={() => goto(`/?pc=${r.pc}`)}>
									{r.pc} {r.nimi}
								</button>
							</td>
							<td class="r">{fmt.format(r.eur)}</td>
							<td class="r">{fmt.format(r.n)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/each}
</div>
<p class="note">{copy.kartta.topHint}</p>

<p class="attr">{copy.kartta.attribution}</p>

<style>
	.kstats {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem 2rem;
		margin: 0 0 var(--space-5);
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
		max-width: var(--container-app);
	}
	.kstat { display: flex; flex-direction: column; gap: 0.1rem; }
	.kstat__lbl {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}
	.kstat__val { font-size: var(--text-lg); font-weight: 600; font-variant-numeric: tabular-nums; }
	.kstat__unit { font-size: var(--text-sm); font-weight: 500; color: var(--ink-2); }
	@media (max-width: 720px) { .kstats { gap: 0.85rem 1.5rem; } }

	.note {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin: var(--space-5) 0 0;
		color: var(--ink-2);
		font-size: var(--text-sm);
		max-width: var(--container-prose);
	}

	/* Touch guidance is only meaningful on coarse-pointer devices. */
	.note--touch {
		display: none;
	}

	@media (pointer: coarse) {
		.note--touch {
			display: flex;
		}
	}

	.note__dot {
		width: 12px;
		height: 12px;
		border-radius: var(--radius-full);
		background: transparent;
		border: 1.5px dashed var(--ink-3);
		flex-shrink: 0;
	}

	.country {
		max-width: var(--container-app);
		margin-top: var(--space-7);
	}

	.tops {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: var(--space-7);
		margin-top: var(--space-7);
		max-width: var(--container-app);
	}

	.top__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.6rem;
	}

	.top__table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.top__table th {
		text-align: left;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--ink-2);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		padding: 0.45rem 0.5rem;
		border-bottom: 1px solid var(--border-2);
	}

	.top__table td {
		padding: 0.35rem 0.5rem;
		border-bottom: 1px solid var(--border);
		color: var(--ink-2);
	}

	.top__table .r {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}

	.top__link {
		font: inherit;
		color: var(--ink);
		background: transparent;
		border: none;
		padding: 0.35rem 0;
		min-height: 40px;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		text-align: left;
		text-decoration: underline;
		text-decoration-color: var(--border-2);
		text-underline-offset: 3px;
	}

	.top__link:hover {
		text-decoration-color: var(--ink);
	}

	@media (max-width: 720px) {
		.tops {
			grid-template-columns: 1fr;
			gap: var(--space-5);
		}
	}

	.attr {
		margin: var(--space-3) 0 0;
		padding-top: 0.7rem;
		border-top: 1px solid var(--border);
		color: var(--ink-3);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		max-width: var(--container-prose);
	}
</style>