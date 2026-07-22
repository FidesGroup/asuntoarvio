<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { data } = $props();
	const town = $derived(data.town);
	const fmt = new Intl.NumberFormat('fi-FI');
	const fmt1 = new Intl.NumberFormat('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const signed = (v: number) => `${v > 0 ? '+' : ''}${fmt1.format(v)}`;

	const pageUrl = $derived(`${SITE_URL}/kaupunki/${town.slug}`);
	const metaTitle = $derived(copy.kaupunki.metaTitle(town.town));
	const metaDescription = $derived(
		copy.kaupunki.metaDescription(town.town, fmt.format(town.medianEurM2), town.areaCount)
	);
	const breadcrumbLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Etusivu', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Kartta', item: `${SITE_URL}/kartta` },
			{ '@type': 'ListItem', position: 3, name: town.town, item: pageUrl }
		]
	});
</script>

<svelte:head>
	<title>{metaTitle}</title>
	<meta name="description" content={metaDescription} />
	<link rel="canonical" href={pageUrl} />
	<meta property="og:title" content={metaTitle} />
	<meta property="og:description" content={metaDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={pageUrl} />
	<meta name="twitter:card" content="summary" />
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbLd)}<\/script>`}
</svelte:head>

<PageHero eyebrow={copy.kaupunki.eyebrow} h1={town.town} lede={copy.kaupunki.lede} />

<div class="stats num">
	<Stat value={town.medianEurM2} unit=" €/m²" label={copy.kaupunki.statMedian} size="md" />
	<Stat value={town.areaCount} label={copy.kaupunki.statAreas} size="md" />
	<Stat value={town.totalTransactions} label={copy.kaupunki.statTransactions} size="md" />
</div>

<h2 class="tbl__title">{copy.kaupunki.tableTitle}</h2>
<div class="tbl-scroll">
	<table class="tbl num">
		<thead>
			<tr>
				<th>{copy.kaupunki.colArea}</th>
				<th class="r">{copy.kaupunki.colPrice}</th>
				<th class="r">{copy.kaupunki.colN}</th>
				<th class="r">{copy.kaupunki.colChange}</th>
				<th class="r">{copy.kaupunki.colYield}</th>
				<th></th>
			</tr>
		</thead>
		<tbody>
			{#each town.rows as r (r.pc)}
				<tr>
					<td><a href={`/postinumero/${r.pc}`}>{r.pc} {r.nimi}</a></td>
					<td class="r">{fmt.format(r.eur)}</td>
					<td class="r">{fmt.format(r.n)}</td>
					<td class="r">{r.chgPct !== null ? signed(r.chgPct) : '–'}</td>
					<td class="r">{r.yieldPct !== null ? fmt1.format(r.yieldPct) : '–'}</td>
					<td>
						<button type="button" class="tbl__cta" onclick={() => goto(`/?pc=${r.pc}`)}>
							{copy.kaupunki.prefillCta}
						</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
<p class="hint">{copy.kaupunki.rowHint}</p>

<p class="back"><a href="/kartta">{copy.kaupunki.backToKartta}</a></p>
<p class="attr">{copy.kaupunki.attribution}</p>

<style>
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin: 0 0 var(--space-5);
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.tbl__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.6rem;
	}

	.tbl-scroll {
		overflow-x: auto;
	}

	.tbl {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.tbl th,
	.tbl td {
		text-align: left;
		padding: 0.55rem 0.6rem;
		border-bottom: 1px solid var(--border);
		white-space: nowrap;
	}

	.tbl th {
		font-weight: 600;
		color: var(--ink-2);
		font-size: var(--text-xs);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.tbl .r {
		text-align: right;
	}

	.tbl__cta {
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 500;
		background: var(--surface-tint);
		color: var(--ink);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 0.35rem 0.6rem;
		min-height: 32px;
		cursor: pointer;
	}

	.tbl__cta:hover {
		background: var(--chip);
	}

	.hint {
		margin: 0.6rem 0 0;
		font-size: var(--text-sm);
		color: var(--ink-3);
	}

	.back {
		margin: var(--space-6) 0 0;
	}

	.attr {
		margin: 0.4rem 0 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
</style>
