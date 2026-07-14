<script lang="ts">
	/**
	 * The full post-analysis report: every fact, comparison, chart and
	 * caveat the engines produce for a pasted listing, composed from the
	 * same building blocks as /arvio plus listing-specific sections.
	 */
	import { onMount } from 'svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import VerdictBlock from '$lib/components/sections/VerdictBlock.svelte';
	import ExtractedFacts from '$lib/components/sections/ExtractedFacts.svelte';
	import LocationCompare from '$lib/components/sections/LocationCompare.svelte';
	import RenovationTimeline from '$lib/components/sections/RenovationTimeline.svelte';
	import FactorList from '$lib/components/sections/FactorList.svelte';
	import OwnVsRent from '$lib/components/sections/OwnVsRent.svelte';
	import HistoryCharts from '$lib/components/sections/HistoryCharts.svelte';
	import { copy } from '$lib/copy/fi';

	let { form }: { form: any } = $props();

	const fmt = new Intl.NumberFormat('fi-FI');
	const R = copy.landing.report;

	const verdict = $derived(form.verdict);
	const tier = $derived(form.tier);
	const showBand = $derived(
		tier && tier.estLowEurM2 !== tier.estHighEurM2 && tier.estMidEurM2 > 0
	);

	let history: any = $state(null);
	let historyPending = $state(true);
	onMount(() => {
		historyPending = true;
		history = null;
		fetch(`/api/area-history?pc=${encodeURIComponent(form.facts.postalCode)}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((h) => (history = h))
			.catch(() => {})
			.finally(() => (historyPending = false));
	});
</script>

<div class="report stack">
	<VerdictBlock {verdict} {tier} facts={form.facts} />

	<div class="metrics num">
		<div class="metric">
			<span class="metric__lbl">Kauppoja (4 nelj.)</span>
			<span class="metric__val">
				{fmt.format(verdict.transactions4q)}
				{#if verdict.latestQuarter}<span class="metric__sub">· viim. {verdict.latestQuarter}</span>{/if}
			</span>
		</div>
		{#if form.quarterRange}
			<div class="metric">
				<span class="metric__lbl">{copy.arvio.quarterRange}</span>
				<span class="metric__val metric__val--sm">
					{fmt.format(form.quarterRange.min)}–{fmt.format(form.quarterRange.max)}<span class="metric__unit">€/m²</span>
				</span>
			</div>
		{/if}
	</div>

	<ExtractedFacts extracted={form.extracted} facts={form.facts} />

	{#if form.location}
		<LocationCompare location={form.location} listingEurM2={verdict.listingEurM2} />
	{/if}

	{#if showBand}
		<Card>
			{#snippet header()}<h2 class="h">{R.estimateTitle}</h2>{/snippet}
			<p class="band num">
				<b>{fmt.format(tier.estLowEurM2)}</b> – <b>{fmt.format(tier.estMidEurM2)}</b> –
				<b>{fmt.format(tier.estHighEurM2)}</b> €/m²
				<span class="band__sub">· {tier.confidenceLabel}</span>
			</p>
			{#if tier.assumptions?.length}
				<div class="assumptions">
					<span class="assumptions__lbl">{R.estimateAssumptions}:</span>
					{#each tier.assumptions as a (a)}
						<Chip size="sm" tone="neutral">{a}</Chip>
					{/each}
				</div>
			{/if}
		</Card>
	{/if}

	{#if form.insights?.length}
		<Card>
			{#snippet header()}<h2 class="h">{R.insightsTitle}</h2>{/snippet}
			<ul class="insights">
				{#each form.insights as ins (ins)}
					<li>{ins}</li>
				{/each}
			</ul>
		</Card>
	{/if}

	<RenovationTimeline done={form.extracted.renovationsDone} upcoming={form.extracted.renovationsUpcoming} />

	<FactorList review={form.review} flags={verdict.flags ?? []} />

	<Card>
		{#snippet header()}<h2 class="h">{copy.arvio.notes.title}</h2>{/snippet}
		<ul class="insights">
			<li>{copy.arvio.notes.transferTax(fmt.format(form.notes.transferTaxEur))}</li>
			{#if form.notes.pipeReno === 'done'}
				<li>{copy.arvio.notes.pipeDone}</li>
			{:else if form.notes.pipeReno === 'in'}
				<li>{copy.arvio.notes.pipeIn}</li>
			{:else if form.notes.pipeReno === 'near'}
				<li>{copy.arvio.notes.pipeNear}</li>
			{/if}
			{#if history?.annualChangePct != null && history.years?.length}
				<li>
					{copy.arvio.notes.trend(
						`${history.annualChangePct > 0 ? '+' : ''}${String(history.annualChangePct).replace('.', ',')}`,
						history.years[0].year,
						history.years[history.years.length - 1].year
					)}
				</li>
			{/if}
		</ul>
	</Card>

	{#if form.yieldResult && form.ownVsRent}
		<Card>
			{#snippet header()}<h2 class="h">{copy.arvio.yield.title}</h2>{/snippet}
			<p class="rentrow num">
				{copy.arvio.yield.rentRow}: <b>{fmt.format(form.ownVsRent.rentEur)} €/kk</b>
				({String(form.ownVsRent.rentPerM2).replace('.', ',')} €/m²)
			</p>
			<div class="metrics metrics--tight num">
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.gross}</span>
					<span class="metric__val">{String(form.yieldResult.grossYieldPct).replace('.', ',')}<span class="metric__unit">%</span></span>
				</div>
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.net}</span>
					<span class="metric__val">{String(form.yieldResult.netYieldPct).replace('.', ',')}<span class="metric__unit">%</span></span>
				</div>
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.monthlyNet}</span>
					<span class="metric__val">{fmt.format(form.yieldResult.monthlyNetEur)}<span class="metric__unit">€</span></span>
				</div>
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.reserve}</span>
					<span class="metric__val">{fmt.format(form.yieldResult.reserveEurYr)}<span class="metric__unit">€/v</span></span>
				</div>
			</div>
			<p class="note">{copy.arvio.yield.note} {copy.arvio.yield.rentIsEstimate(null)}</p>
		</Card>
		<Card>
			{#snippet header()}<h2 class="h">{copy.arvio.ownRent.title} <span class="h__unit">{copy.arvio.ownRent.unit}</span></h2>{/snippet}
			<OwnVsRent data={form.ownVsRent} />
		</Card>
	{/if}

	{#if historyPending}
		<p class="loading">{R.historyLoading}</p>
	{:else if history}
		<Card>
			<HistoryCharts {history} />
		</Card>
	{/if}

	<Card>
		{#snippet header()}<h2 class="h">{copy.arvio.method.title}</h2>{/snippet}
		<ol class="method">
			{#each copy.arvio.method.items as item, i (i)}
				<li>{item}</li>
			{/each}
		</ol>
	</Card>

	<div class="continue">
		{#if form.shareParams}
			<Button href={`/arvio?${form.shareParams}`}>{R.shareCta}</Button>
			<span class="continue__hint">{R.shareHint}</span>
		{/if}
		{#if form.source}
			<span class="continue__src">{R.sourceLine(form.source)}</span>
		{/if}
	</div>
</div>

<style>
	.report {
		margin-top: var(--space-7);
	}

	.h {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.h__unit {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin-left: 0.4rem;
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(10.5rem, 1fr));
		gap: 0.85rem;
	}

	.metric {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.8rem 1rem;
		min-width: 0;
	}

	.metric__lbl {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.metric__val {
		font-size: var(--text-xl);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}

	.metric__val--sm {
		font-size: var(--text-lg);
	}

	.metric__unit {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink-2);
		margin-left: 0.25rem;
	}

	.metric__sub {
		font-size: var(--text-xs);
		color: var(--ink-3);
		font-weight: 400;
	}

	.band {
		margin: 0;
		font-size: var(--text-lg);
	}

	.band__sub {
		font-size: var(--text-sm);
		color: var(--ink-2);
	}

	.assumptions {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.4rem;
		margin-top: 0.7rem;
	}

	.assumptions__lbl {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.insights {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.insights li {
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-list);
		padding-left: 0.7rem;
		border-left: 2px solid var(--border-2);
	}

	.method {
		margin: 0;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		color: var(--ink-2);
		line-height: var(--lh-list);
		font-size: var(--text-sm);
	}

	.method li::marker {
		color: var(--ink-3);
		font-weight: 600;
	}

	.rentrow {
		margin: 0 0 1rem;
		font-size: var(--text-sm);
		color: var(--ink-2);
	}

	.rentrow b {
		color: var(--ink);
		font-variant-numeric: tabular-nums;
	}

	.note {
		margin: 0.85rem 0 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
	}

	.loading {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-3);
	}

	.continue {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.75rem 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.continue__hint,
	.continue__src {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
</style>
