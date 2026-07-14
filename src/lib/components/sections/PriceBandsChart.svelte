<script lang="ts">
	/**
	 * Distribution of postal areas over the map's €/m² bands. Bars use the
	 * exact PriceMap ramp so the chart and the choropleth read as one
	 * system; counts are direct-labeled (6 bars, one label each).
	 */
	import { copy } from '$lib/copy/fi';

	interface PriceBand {
		from: number | null;
		to: number | null;
		areas: number;
		transactions: number;
	}
	let { bands }: { bands: PriceBand[] } = $props();

	/** Same hexes as RAMP in src/lib/PriceMap.svelte. */
	const RAMP = ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'];
	const fmt = new Intl.NumberFormat('fi-FI');

	const W = 640;
	const H = 220;
	const PAD = { top: 26, right: 8, bottom: 26, left: 8 };

	const maxAreas = $derived(Math.max(...bands.map((b) => b.areas), 1));
	const slot = $derived((W - PAD.left - PAD.right) / bands.length);
	const barW = $derived(slot - 10);

	function label(b: PriceBand): string {
		if (b.from === null) return `<${fmt.format(b.to as number)}`;
		if (b.to === null) return `>${fmt.format(b.from)}`;
		return `${fmt.format(b.from)}–${fmt.format(b.to)}`;
	}
	function barH(b: PriceBand): number {
		return (b.areas / maxAreas) * (H - PAD.top - PAD.bottom);
	}

	let hovered = $state<number | null>(null);
</script>

<div class="bands">
	<div class="bands__head">
		<h2 class="bands__title">{copy.kartta.bandsTitle}</h2>
		<span class="bands__unit">{copy.kartta.bandsUnit}</span>
	</div>
	<svg viewBox="0 0 {W} {H}" role="img" aria-label={copy.kartta.bandsTitle} onpointerleave={() => (hovered = null)}>
		{#each bands as b, i (i)}
			{@const x = PAD.left + i * slot + 5}
			{@const h = barH(b)}
			<rect
				{x}
				y={H - PAD.bottom - h}
				width={barW}
				height={h}
				rx="3"
				fill={RAMP[i]}
				stroke="var(--border-2)"
				stroke-width="1"
				opacity={hovered === null || hovered === i ? 1 : 0.55}
				onpointerenter={() => (hovered = i)}
				role="presentation"
			/>
			<text x={x + barW / 2} y={H - PAD.bottom - h - 7} class="count">{fmt.format(b.areas)}</text>
			<text x={x + barW / 2} y={H - 8} class="tick">{label(b)}</text>
		{/each}
	</svg>
	<p class="bands__read num" role="status">
		{#if hovered !== null}
			{label(bands[hovered])} €/m²: <b>{fmt.format(bands[hovered].areas)}</b> {copy.kartta.bandsAreas} ·
			<b>{fmt.format(bands[hovered].transactions)}</b> {copy.kartta.bandsTransactions}
		{:else}
			&nbsp;
		{/if}
	</p>
</div>

<style>
	.bands {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		max-width: var(--container-app);
		margin-top: var(--space-7);
	}
	.bands__head {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}
	.bands__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}
	.bands__unit {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
	svg {
		width: 100%;
		height: auto;
	}
	.count {
		text-anchor: middle;
		font-size: 12px;
		font-weight: 600;
		fill: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.tick {
		text-anchor: middle;
		font-size: 11px;
		fill: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}
	.bands__read {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
		min-height: 1.4em;
	}
	.bands__read b {
		color: var(--ink);
	}
</style>
