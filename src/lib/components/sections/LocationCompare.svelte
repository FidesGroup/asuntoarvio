<script lang="ts">
	/**
	 * Location-weighted comparison: inverse-distance blend of neighboring
	 * postal areas around the geocoded address, with the classic price map
	 * and the exact neighbor table so the weighting is inspectable.
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import PriceMap from '$lib/PriceMap.svelte';
	import { copy } from '$lib/copy/fi';

	let {
		location,
		listingEurM2
	}: {
		location: {
			eurM2: number;
			deltaPct: number;
			lon: number;
			lat: number;
			areasUsed: { pc: string; nimi: string; eurM2: number; km: number }[];
		};
		listingEurM2: number;
	} = $props();

	const fmt = new Intl.NumberFormat('fi-FI');
	const R = copy.landing.report;
</script>

<Card padded={false}>
	<div class="lc">
		<div class="lc__head">
			<h2 class="lc__h">{R.locationTitle} <Chip size="sm" tone="neutral">{R.locationBeta}</Chip></h2>
			<p class="lc__lede">{R.locationLede}</p>
		</div>
		<PriceMap
			height="260px"
			zoom={10.8}
			center={[location.lon, location.lat]}
			marker={[location.lon, location.lat]}
			showLegend={false}
		/>
		<div class="lc__body">
			<div class="lc__stats num">
				<div class="lc__stat">
					<span class="lc__lbl">{R.locationWeighted}</span>
					<span class="lc__val">{fmt.format(location.eurM2)} <span class="lc__unit">€/m²</span></span>
				</div>
				<div class="lc__stat">
					<span class="lc__lbl">{R.locationDelta}</span>
					<span class="lc__val" class:over={location.deltaPct > 0} class:under={location.deltaPct < 0}>
						{location.deltaPct > 0 ? '+' : ''}{String(location.deltaPct).replace('.', ',')} %
					</span>
				</div>
				<div class="lc__stat">
					<span class="lc__lbl">Kohteen neliöhinta</span>
					<span class="lc__val">{fmt.format(listingEurM2)} <span class="lc__unit">€/m²</span></span>
				</div>
			</div>
			<table class="lc__table num">
				<thead>
					<tr><th>{R.locationCols.area}</th><th class="r">{R.locationCols.price}</th><th class="r">{R.locationCols.dist}</th></tr>
				</thead>
				<tbody>
					{#each location.areasUsed as a (a.pc)}
						<tr>
							<td>{a.pc} {a.nimi}</td>
							<td class="r">{fmt.format(a.eurM2)}</td>
							<td class="r">{String(a.km).replace('.', ',')} km</td>
						</tr>
					{/each}
				</tbody>
			</table>
			<p class="lc__src">Lähde: Tilastokeskus 13mt · MML geokoodaus</p>
		</div>
	</div>
</Card>

<style>
	.lc {
		display: flex;
		flex-direction: column;
	}
	.lc__head {
		padding: 1.1rem 1.25rem 0.9rem;
	}
	.lc__h {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.25rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.lc__lede {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
	}
	.lc__body {
		padding: 1rem 1.25rem 1.1rem;
		display: flex;
		flex-direction: column;
		gap: 0.9rem;
	}
	.lc__stats {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: 0.85rem;
	}
	.lc__stat {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.lc__lbl {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}
	.lc__val {
		font-size: var(--text-xl);
		font-weight: 600;
		font-variant-numeric: tabular-nums;
	}
	.lc__val.over { color: var(--warn); }
	.lc__val.under { color: var(--good); }
	.lc__unit {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink-2);
	}
	.lc__table {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}
	.lc__table th {
		text-align: left;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--ink-2);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		padding: 0.4rem 0.5rem;
		border-bottom: 1px solid var(--border-2);
	}
	.lc__table td {
		padding: 0.35rem 0.5rem;
		border-bottom: 1px solid var(--border);
		color: var(--ink-2);
	}
	.lc__table .r {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.lc__src {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}
</style>
