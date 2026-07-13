<script lang="ts">
	import { page } from '$app/stores';
	import { toasts } from '$lib/styles/toast.svelte';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Crumbs from '$lib/components/ui/Crumbs.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import DeltaBadge from '$lib/components/ui/DeltaBadge.svelte';
	import ConfidenceChip from '$lib/components/ui/ConfidenceChip.svelte';
	import FactorList from '$lib/components/sections/FactorList.svelte';
	import { copy } from '$lib/copy/fi';

	let { data } = $props();
	const { facts, verdict, yield: yieldResult, rentEstimate } = $derived(data);

	const fmt = new Intl.NumberFormat('fi-FI');
	const overUnder = $derived(verdict.deltaPct === null ? 'none' : verdict.deltaPct >= 0 ? 'over' : 'under');
	const verdictLabel = $derived(
		verdict.deltaPct === null
			? 'Ei vertailuarvoa tälle alueelle.'
			: verdict.deltaPct >= 0
				? 'Pyyntihinta on alueen toteutuneiden kauppojen yläpuolella.'
				: 'Pyyntihinta on alueen toteutuneiden kauppojen alapuolella.'
	);
	const shareUrl = $derived($page.url.toString());
	const ogImageUrl = $derived(`/arvio/og?${$page.url.searchParams.toString()}`);

	let copyState = $state<'idle' | 'copied' | 'error'>('idle');
	async function copyShareLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copyState = 'copied';
			toasts.success(copy.arvio.copied);
			setTimeout(() => (copyState = 'idle'), 2000);
		} catch {
			copyState = 'error';
			toasts.error(copy.arvio.copyError);
			setTimeout(() => (copyState = 'idle'), 2000);
		}
	}

	function shareNative() {
		const nav: any = navigator;
		if (nav.share) {
			nav.share({ title: 'RehtiArvio', text: verdictLabel, url: shareUrl }).catch(() => {});
		} else {
			copyShareLink();
		}
	}
</script>

<svelte:head>
	<title>
		{verdict.deltaPct === null
			? 'Ei vertailuarvoa'
			: `${verdict.deltaPct > 0 ? '+' : ''}${verdict.deltaPct} % vs alue`} | RehtiArvio
	</title>
	<meta property="og:title" content={`RehtiArvio: ${verdictLabel}`} />
	<meta property="og:description" content={`${facts.postalCode} · ${facts.roomsType} · ${facts.livingAreaM2} m² — ${verdictLabel}`} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`RehtiArvio: ${verdictLabel}`} />
	<meta name="twitter:description" content={`${facts.postalCode} · ${facts.roomsType} · ${facts.livingAreaM2} m²`} />
	<meta name="twitter:image" content={ogImageUrl} />
</svelte:head>

<article class="verdict">
	<Crumbs
		parts={[
			facts.postalCode,
			facts.roomsType,
			`${facts.livingAreaM2} m²`,
			facts.buildYear ? `rak. ${facts.buildYear}` : null
		]}
	/>

	<header class="head">
		<DeltaBadge delta={verdict.deltaPct} size="hero" />
		<p class="head__summary">{verdictLabel}</p>
		<ConfidenceChip
			value={verdict.confidence}
			transactions={verdict.transactions4q}
			latestQuarter={verdict.latestQuarter}
		/>
	</header>

	<div class="metrics">
		<div class="metric">
			<span class="metric__lbl">Kohteen neliöhinta</span>
			<span class="metric__val num">{fmt.format(verdict.listingEurM2)}<span class="metric__unit">€/m²</span></span>
		</div>
		<div class="metric metric--alt">
			<span class="metric__lbl">Alueen kaupat</span>
			<span class="metric__val num">
				{#if verdict.benchmarkEurM2}
					{fmt.format(verdict.benchmarkEurM2)}<span class="metric__unit">€/m²</span>
				{:else}
					<span class="metric__dash">–</span>
				{/if}
			</span>
		</div>
		<div class="metric metric--alt">
			<span class="metric__lbl">Kauppoja (4 nelj.)</span>
			<span class="metric__val num">
				{fmt.format(verdict.transactions4q)}
				{#if verdict.latestQuarter}<span class="metric__sub">· viim. {verdict.latestQuarter}</span>{/if}
			</span>
		</div>
	</div>

	<div class="share-row">
		<Button variant="primary" onclick={copyShareLink}>
			{#if copyState === 'copied'}✓ {copy.arvio.copied}{:else}{copy.arvio.copyCta}{/if}
		</Button>
		<Button variant="secondary" onclick={shareNative}>{copy.arvio.shareOnMobile}</Button>
		<span class="share-hint">{copy.arvio.shareRow.hint}</span>
	</div>

	<FactorList flags={verdict.flags ?? []} />

	{#if yieldResult}
		<Card>
			{#snippet header()}<h2 class="card__h">{copy.arvio.yield.title}</h2>{/snippet}
			<div class="yield-grid">
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.gross}</span>
					<span class="metric__val num">{String(yieldResult.grossYieldPct).replace('.', ',')}<span class="metric__unit">%</span></span>
				</div>
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.net}</span>
					<span class="metric__val num">{String(yieldResult.netYieldPct).replace('.', ',')}<span class="metric__unit">%</span></span>
				</div>
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.monthlyNet}</span>
					<span class="metric__val num">{fmt.format(yieldResult.monthlyNetEur)}<span class="metric__unit">€</span></span>
				</div>
				<div class="metric">
					<span class="metric__lbl">{copy.arvio.yield.reserve}</span>
					<span class="metric__val num">{fmt.format(yieldResult.reserveEurYr)}<span class="metric__unit">€ / v</span></span>
				</div>
			</div>
			<p class="note">{copy.arvio.yield.note}</p>
			{#if yieldResult.rentSource === 'estimate'}
				<p class="note">{copy.arvio.yield.rentIsEstimate(rentEstimate?.latestQuarter ?? null)}</p>
			{/if}
			{#if yieldResult.flags?.length}
				<ul class="flags-list">
					{#each yieldResult.flags as f (f)}<li>{f}</li>{/each}
				</ul>
			{/if}
		</Card>
	{/if}

	<div class="back-row">
		<a class="back" href="/">{copy.arvio.back}</a>
	</div>
</article>

<style>
	.verdict {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: flex-start;
	}

	.head__summary {
		color: var(--ink-2);
		font-size: var(--text-lg);
		line-height: var(--lh-body);
		max-width: 38rem;
		margin: 0;
	}

	.metrics {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.metric {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 1rem 1.15rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		min-width: 0;
	}

	.metric--alt { background: var(--surface-tint); border-color: transparent; }

	.metric__lbl {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-2);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.metric__val {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		color: var(--ink);
		display: inline-flex;
		align-items: baseline;
		gap: 0.15rem;
		flex-wrap: wrap;
	}

	.metric__unit {
		font-size: 0.55em;
		color: var(--ink-2);
		font-weight: 500;
	}

	.metric__sub {
		font-size: var(--text-xs);
		color: var(--ink-3);
		font-weight: 400;
	}

	.metric__dash { color: var(--ink-3); }

	.share-row {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		flex-wrap: wrap;
		padding: 0.85rem 1rem;
		background: var(--surface-tint);
		border-radius: var(--radius-md);
	}

	.share-hint {
		font-size: var(--text-sm);
		color: var(--ink-3);
		margin-left: auto;
	}

	.card__h {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.yield-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.6rem;
		margin: 0 0 0.85rem;
	}

	.yield-grid .metric { padding: 0.75rem 0.95rem; }
	.yield-grid .metric__val { font-size: var(--text-xl); }

	.note {
		margin: 0 0 0.4rem;
		color: var(--ink-3);
		font-size: var(--text-sm);
		line-height: var(--lh-list);
	}

	.flags-list {
		list-style: none;
		margin: 0.5rem 0 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.flags-list li {
		font-size: var(--text-sm);
		color: var(--ink-2);
		padding-left: 1.2rem;
		position: relative;
	}

	.flags-list li::before {
		content: '·';
		position: absolute;
		left: 0;
		color: var(--ink-3);
	}

	.back-row {
		margin-top: var(--space-3);
	}

	.back {
		color: var(--ink-2);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--text-md);
		padding: 0.5rem 0;
		transition: color var(--dur-fast) var(--ease-standard);
	}

	.back:hover { color: var(--ink); }

	@media (max-width: 720px) {
		.metrics { grid-template-columns: 1fr 1fr; }
		.yield-grid { grid-template-columns: 1fr 1fr; }
	}

	@media (max-width: 420px) {
		.metrics { grid-template-columns: 1fr; }
	}
</style>