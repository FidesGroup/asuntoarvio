<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PriceMap from '$lib/PriceMap.svelte';
	import PriceBandsChart from '$lib/components/sections/PriceBandsChart.svelte';
	import HistoryCharts from '$lib/components/sections/HistoryCharts.svelte';
	import DivergenceChart from '$lib/components/sections/DivergenceChart.svelte';
	import { MAP_MODES, type MapMode } from '$lib/map-modes';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { data } = $props();
	const fmt = new Intl.NumberFormat('fi-FI');
	const fmt1 = new Intl.NumberFormat('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const signed = (v: number) => `${v > 0 ? '+' : ''}${fmt1.format(v)}`;

	let mode: MapMode = $state('eur');

	const m = $derived(data.market);
	const katsaus = $derived(
		copy.kartta.katsaus({
			areas: m.areasWithData,
			transactions: fmt.format(m.totalTransactions),
			median: fmt.format(m.medianEurM2),
			chg: m.countryChangePct,
			riser: m.topRisers[0]
				? { name: `${m.topRisers[0].pc} ${m.topRisers[0].nimi}`, value: m.topRisers[0].value }
				: null,
			faller: m.topFallers[0]
				? { name: `${m.topFallers[0].pc} ${m.topFallers[0].nimi}`, value: m.topFallers[0].value }
				: null,
			medianYield: m.medianYieldPct
		})
	);

	interface TopTable {
		title: string;
		valueHead: string;
		rows: { pc: string; nimi: string; display: string; n: number }[];
		hint?: string;
	}
	const tops = $derived<TopTable[]>([
		{
			title: copy.kartta.topExpensive,
			valueHead: copy.kartta.colPrice,
			rows: m.topExpensive.map((r) => ({ ...r, display: fmt.format(r.eur) }))
		},
		{
			title: copy.kartta.topCheapest,
			valueHead: copy.kartta.colPrice,
			rows: m.topCheapest.map((r) => ({ ...r, display: fmt.format(r.eur) }))
		},
		{
			title: copy.kartta.topVolume,
			valueHead: copy.kartta.colPrice,
			rows: m.topByVolume.map((r) => ({ ...r, display: fmt.format(r.eur) }))
		},
		{
			title: copy.kartta.topRisers,
			valueHead: copy.kartta.colChange,
			rows: m.topRisers.map((r) => ({ ...r, display: signed(r.value) }))
		},
		{
			title: copy.kartta.topFallers,
			valueHead: copy.kartta.colChange,
			rows: m.topFallers.map((r) => ({ ...r, display: signed(r.value) }))
		},
		{
			title: copy.kartta.topYield,
			valueHead: copy.kartta.colYield,
			rows: m.topYield.map((r) => ({ ...r, display: fmt1.format(r.value) })),
			hint: copy.kartta.topYieldHint
		}
	]);
</script>

<svelte:head>
	<title>Kartta | RehtiArvio</title>
	<meta name="description" content={copy.kartta.lede} />
	<meta property="og:title" content="Kartta | RehtiArvio" />
	<meta property="og:description" content={copy.kartta.lede} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE_URL}/kartta`} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Kartta | RehtiArvio" />
	<meta name="twitter:description" content={copy.kartta.lede} />
</svelte:head>

<PageHero
	eyebrow={copy.kartta.title}
	h1={copy.kartta.h1}
	lede={copy.kartta.lede}
/>

<section class="katsaus" aria-label={copy.kartta.katsausTitle}>
	<div class="katsaus__head">
		<h2 class="katsaus__title">{copy.kartta.katsausTitle}</h2>
		<span class="katsaus__window num">{copy.kartta.katsausWindow(m.windowLabel)}</span>
	</div>
	<p class="katsaus__body">{katsaus.join(' ')}</p>
	<p class="katsaus__fine">{copy.kartta.katsausDisclaimer}</p>
</section>

<div class="kstats num" aria-label={copy.landing.market.eyebrow}>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsTransactions}</span><span class="kstat__val">{fmt.format(m.totalTransactions)}</span></div>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsMedian}</span><span class="kstat__val">{fmt.format(m.medianEurM2)} <span class="kstat__unit">€/m²</span></span></div>
	{#if m.countryChangePct !== null}
		<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsChange}</span><span class="kstat__val">{signed(m.countryChangePct)} <span class="kstat__unit">%</span></span></div>
	{/if}
	{#if m.medianYieldPct !== null}
		<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsYield}</span><span class="kstat__val">{fmt1.format(m.medianYieldPct)} <span class="kstat__unit">% brutto</span></span></div>
	{/if}
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsP25}</span><span class="kstat__val">{fmt.format(m.p25EurM2)} <span class="kstat__unit">€/m²</span></span></div>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsP75}</span><span class="kstat__val">{fmt.format(m.p75EurM2)} <span class="kstat__unit">€/m²</span></span></div>
	<div class="kstat"><span class="kstat__lbl">{copy.kartta.statsAreas}</span><span class="kstat__val">{fmt.format(m.areasWithData)}</span></div>
</div>

<div class="modes" role="radiogroup" aria-label={copy.kartta.modesLabel}>
	{#each MAP_MODES as mm (mm)}
		<button
			type="button"
			class="modes__btn"
			class:modes__btn--on={mode === mm}
			role="radio"
			aria-checked={mode === mm}
			onclick={() => (mode = mm)}
		>
			{copy.kartta.modes[mm]}
		</button>
	{/each}
</div>
<p class="modes__lede">{copy.kartta.modeLedes[mode]}</p>

<Card padded={false} variant="raised">
	<PriceMap {mode} onareaclick={(pc) => goto(`/?pc=${pc}`)} />
</Card>

<p class="note note--touch">{copy.kartta.tapHint}</p>

<p class="note">
	<span class="note__dot" aria-hidden="true"></span>
	{copy.kartta.legendNoData}
</p>

<PriceBandsChart bands={m.bands} />

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

{#await data.lazy.divergence then div}
	{#if div}
		<div class="country">
			<Card>
				<DivergenceChart divergence={div} />
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
					<tr><th>{copy.kartta.colArea}</th><th class="r">{top.valueHead}</th><th class="r">{copy.kartta.colN}</th><th></th></tr>
				</thead>
				<tbody>
					{#each top.rows as r (r.pc)}
						<tr>
							<td>
								<a class="top__link" href={`/postinumero/${r.pc}`}>{r.pc} {r.nimi}</a>
							</td>
							<td class="r">{r.display}</td>
							<td class="r">{fmt.format(r.n)}</td>
							<td class="r">
								<button type="button" class="top__cta" onclick={() => goto(`/?pc=${r.pc}`)}>
									{copy.kartta.rowPrefillCta}
								</button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
			{#if top.hint}<p class="top__hint">{top.hint}</p>{/if}
		</div>
	{/each}
</div>
<p class="note">{copy.kartta.topHint}</p>

<p class="dl">
	<a class="dl__btn" href="/kartta/data.csv" download>{copy.kartta.csvCta}</a>
	<span class="dl__note">{copy.kartta.csvNote}</span>
</p>

<p class="attr">{copy.kartta.attribution}</p>

<style>
	.katsaus {
		max-width: var(--container-prose);
		margin: 0 0 var(--space-5);
		padding: 1rem 1.2rem;
		background: var(--surface-tint);
		border-left: 3px solid var(--brand);
	}
	.katsaus__head {
		display: flex;
		align-items: baseline;
		gap: 0.8rem;
		flex-wrap: wrap;
	}
	.katsaus__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}
	.katsaus__window {
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}
	.katsaus__body {
		margin: 0.5rem 0 0;
		font-size: var(--text-md);
		line-height: var(--lh-body);
		color: var(--ink-2);
	}
	.katsaus__fine {
		margin: 0.5rem 0 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
	}

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

	.modes {
		display: inline-flex;
		flex-wrap: wrap;
		border: 1px solid var(--border-2);
		margin-bottom: 0.6rem;
	}
	.modes__btn {
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 500;
		background: transparent;
		color: var(--ink-2);
		border: none;
		padding: 0.45rem 0.9rem;
		min-height: 40px;
		cursor: pointer;
	}
	.modes__btn:not(:last-child) {
		border-right: 1px solid var(--border-2);
	}
	.modes__btn--on {
		background: var(--brand);
		color: var(--brand-ink);
	}
	@media (pointer: coarse) {
		.modes__btn {
			min-height: 44px;
		}
	}
	.modes__lede {
		margin: 0 0 var(--space-3);
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-body);
		max-width: var(--container-prose);
		min-height: 2.6em;
	}

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
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-5) var(--space-7);
		margin-top: var(--space-7);
		max-width: var(--container-app);
	}

	@media (max-width: 900px) {
		.tops {
			grid-template-columns: 1fr;
			gap: var(--space-5);
		}
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

	.top__hint {
		margin: 0.45rem 0 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
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

	.top__cta {
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 500;
		background: var(--surface-tint);
		color: var(--ink);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.3rem 0.55rem;
		min-height: 32px;
		cursor: pointer;
	}

	.top__cta:hover {
		background: var(--chip);
	}

	.dl {
		display: flex;
		align-items: baseline;
		gap: 0.8rem;
		flex-wrap: wrap;
		margin: var(--space-5) 0 0;
	}
	.dl__btn {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0.5rem 1rem;
		background: var(--brand);
		color: var(--brand-ink);
		font-size: var(--text-sm);
		font-weight: 500;
		text-decoration: none;
	}
	.dl__note {
		font-size: var(--text-sm);
		color: var(--ink-2);
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
