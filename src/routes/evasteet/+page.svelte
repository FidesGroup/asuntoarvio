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
							<td class="num">{row.name}</td>
							<td>{row.group}</td>
							<td>{row.purpose}</td>
							<td>{row.duration}</td>
							<td>{row.setter}</td>
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
</style>
