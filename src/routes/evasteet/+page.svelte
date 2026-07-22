<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import ConsentPreferences from '$lib/components/consent/ConsentPreferences.svelte';
	import { copy } from '$lib/copy/fi';
</script>

<svelte:head>
	<title>Evästeet | RehtiArvio</title>
	<meta name="description" content="RehtiArvion evästeet ja seurannan hallinta." />
</svelte:head>

<div class="page">
	<PageHero h1={copy.evasteet.h1} lede={copy.evasteet.lede} />

	<section class="section">
		<h2>{copy.evasteet.manageTitle}</h2>
		<ConsentPreferences />
	</section>

	<section class="section">
		<h2>{copy.evasteet.tableTitle}</h2>
		<div class="table-scroll">
			<table>
				<thead>
					<tr>
						<th>{copy.evasteet.tableCols.name}</th>
						<th>{copy.evasteet.tableCols.group}</th>
						<th>{copy.evasteet.tableCols.purpose}</th>
						<th>{copy.evasteet.tableCols.duration}</th>
						<th>{copy.evasteet.tableCols.setter}</th>
					</tr>
				</thead>
				<tbody>
					{#each copy.evasteet.rows as row (row.name)}
						<tr>
							<td class="num" data-label={copy.evasteet.tableCols.name}>{row.name}</td>
							<td data-label={copy.evasteet.tableCols.group}>{row.group}</td>
							<td data-label={copy.evasteet.tableCols.purpose}>{row.purpose}</td>
							<td data-label={copy.evasteet.tableCols.duration}>{row.duration}</td>
							<td data-label={copy.evasteet.tableCols.setter}>{row.setter}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</section>
</div>

<style>
	.page {
		max-width: var(--container-prose);
		display: flex;
		flex-direction: column;
		gap: var(--space-9);
	}

	.section h2 {
		font-size: var(--text-xl);
		font-weight: 600;
		margin: 0 0 var(--space-4);
	}

	.table-scroll {
		overflow-x: auto;
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	th,
	td {
		text-align: left;
		padding: 0.6rem 0.8rem;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}

	thead th {
		background: var(--surface-2);
		color: var(--ink-2);
		font-weight: 600;
	}

	tbody tr:last-child td {
		border-bottom: none;
	}

	/* On phones, reflow each row into a stacked label/value card instead of a
	   sideways-scrolling table. The header row is redundant once every cell
	   carries its own label. */
	@media (max-width: 480px) {
		.table-scroll {
			overflow-x: visible;
			border: none;
			border-radius: 0;
		}

		table,
		tbody,
		tr,
		td {
			display: block;
			width: 100%;
		}

		thead {
			display: none;
		}

		tr {
			border: 1px solid var(--border);
			border-radius: var(--radius-sm);
			padding: 0.4rem 0.9rem;
			margin-bottom: 0.6rem;
			background: var(--surface);
		}

		tbody tr:last-child {
			margin-bottom: 0;
		}

		td {
			display: flex;
			flex-direction: column;
			gap: 0.15rem;
			padding: 0.5rem 0;
			border-bottom: 1px solid var(--border);
		}

		tr td:last-child {
			border-bottom: none;
		}

		td::before {
			content: attr(data-label);
			font-size: var(--text-xs);
			font-weight: 600;
			color: var(--ink-3);
			letter-spacing: var(--ls-wide);
			text-transform: uppercase;
		}
	}
</style>
