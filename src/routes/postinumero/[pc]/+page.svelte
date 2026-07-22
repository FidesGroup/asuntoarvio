<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { data } = $props();
	const row = $derived(data.row);
	const town = $derived(data.town);
	const fmt = new Intl.NumberFormat('fi-FI');

	const pageUrl = $derived(`${SITE_URL}/postinumero/${row.pc}`);
	const metaTitle = $derived(copy.postinumero.metaTitle(row.pc, row.nimi));
	const metaDescription = $derived(
		copy.postinumero.metaDescription(row.pc, row.nimi, fmt.format(row.eur))
	);
	const breadcrumbLd = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Etusivu', item: SITE_URL },
			{ '@type': 'ListItem', position: 2, name: 'Kartta', item: `${SITE_URL}/kartta` },
			...(town
				? [{ '@type': 'ListItem', position: 3, name: town.town, item: `${SITE_URL}/kaupunki/${town.slug}` }]
				: []),
			{
				'@type': 'ListItem',
				position: town ? 4 : 3,
				name: `${row.pc} ${row.nimi}`,
				item: pageUrl
			}
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

<PageHero eyebrow={copy.postinumero.eyebrow} h1={`${row.pc} ${row.nimi}`} lede={copy.kaupunki.lede} />

<div class="stats num">
	<Stat value={row.eur} unit=" €/m²" label={copy.postinumero.statPrice} size="md" />
	<Stat value={row.n} label={copy.postinumero.statN} size="md" />
	{#if row.chgPct !== null}
		<Stat
			value={row.chgPct}
			decimals={1}
			unit=" %"
			prefix={row.chgPct > 0 ? '+' : ''}
			label={copy.postinumero.statChange}
			size="md"
		/>
	{/if}
	{#if row.yieldPct !== null}
		<Stat value={row.yieldPct} decimals={1} unit=" %" label={copy.postinumero.statYield} size="md" />
	{/if}
	{#if row.priceIncome !== null}
		<Stat value={row.priceIncome} decimals={1} label={copy.postinumero.statPriceIncome} size="md" />
	{/if}
	{#if row.per1000 !== null}
		<Stat value={row.per1000} decimals={1} label={copy.postinumero.statLiquidity} size="md" />
	{/if}
</div>

<button type="button" class="cta" onclick={() => goto(`/?pc=${row.pc}`)}>
	{copy.postinumero.prefillCta}
</button>

{#if town}
	<p class="townlink"><a href={`/kaupunki/${town.slug}`}>{copy.postinumero.townTitle}: {town.town} →</a></p>
{/if}

<p class="back"><a href="/kartta">{copy.postinumero.backToKartta}</a></p>
<p class="attr">{copy.postinumero.attribution}</p>

<style>
	.stats {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		margin: 0 0 var(--space-5);
		padding-bottom: 1rem;
		border-bottom: 1px solid var(--border);
	}

	.cta {
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 600;
		background: var(--brand);
		color: var(--brand-ink);
		border: none;
		border-radius: var(--radius-md);
		padding: 0.7rem 1.1rem;
		min-height: 44px;
		cursor: pointer;
	}

	.cta:hover {
		opacity: 0.9;
	}

	.townlink {
		margin: var(--space-5) 0 0;
	}

	.back {
		margin: var(--space-4) 0 0;
	}

	.attr {
		margin: 0.4rem 0 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
</style>
