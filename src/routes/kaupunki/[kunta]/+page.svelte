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
					<td class="tbl__area"><a href={`/postinumero/${r.pc}`}>{r.pc} {r.nimi}</a></td>
					<td class="r" data-label={copy.kaupunki.colPrice}>{fmt.format(r.eur)}</td>
					<td class="r" data-label={copy.kaupunki.colN}>{fmt.format(r.n)}</td>
					<td class="r" data-label={copy.kaupunki.colChange}>{r.chgPct !== null ? signed(r.chgPct) : '–'}</td>
					<td class="r" data-label={copy.kaupunki.colYield}>{r.yieldPct !== null ? fmt1.format(r.yieldPct) : '–'}</td>
					<td class="tbl__action">
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
		transition:
			background var(--dur-fast) var(--ease-standard),
			transform var(--dur-fast) var(--ease-standard);
	}

	.tbl__cta:hover {
		background: var(--chip);
	}

	.tbl__cta:active {
		transform: translateY(1px);
	}

	@media (prefers-reduced-motion: reduce) {
		.tbl__cta:active {
			transform: none;
		}
	}

	/* On phones, reflow each row into a stacked card: area name as the title,
	   numeric columns as label/value rows, prefill as a full-width action. */
	@media (max-width: 480px) {
		.tbl-scroll {
			overflow-x: visible;
		}

		.tbl,
		.tbl tbody,
		.tbl tr,
		.tbl td {
			display: block;
			width: 100%;
		}

		.tbl thead {
			display: none;
		}

		.tbl tr {
			border: 1px solid var(--border);
			border-radius: var(--radius-sm);
			padding: 0.55rem 0.9rem;
			margin-bottom: 0.6rem;
			background: var(--surface);
		}

		.tbl tbody tr:last-child {
			margin-bottom: 0;
		}

		.tbl td {
			padding: 0.45rem 0;
			white-space: normal;
			text-align: left;
			border-bottom: 1px solid var(--border);
		}

		.tbl tr td:last-child {
			border-bottom: none;
		}

		.tbl__area {
			font-size: var(--text-md);
			font-weight: 600;
			padding-top: 0.2rem;
		}

		.tbl .r {
			display: flex;
			justify-content: space-between;
			align-items: baseline;
			gap: 1rem;
		}

		.tbl .r::before {
			content: attr(data-label);
			font-size: var(--text-xs);
			font-weight: 600;
			color: var(--ink-3);
			letter-spacing: var(--ls-wide);
			text-transform: uppercase;
		}

		.tbl__action {
			padding-top: 0.6rem;
		}

		.tbl__action .tbl__cta {
			width: 100%;
			min-height: 44px;
		}
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
