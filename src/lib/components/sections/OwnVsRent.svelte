<script lang="ts">
	/**
	 * Monthly cost comparison: statistical rent vs owning costs (interest
	 * assumption + vastike + renovation reserve). Deterministic; the
	 * interest assumption and exclusions are stated in the note below.
	 * Monochrome stacked bar — identity via labels, hue stays reserved.
	 */
	import { copy } from '$lib/copy/fi';

	interface OwnVsRent {
		rentEur: number;
		rentPerM2: number;
		rentIsEstimate: boolean;
		interestEur: number;
		vastikeEur: number;
		reserveEur: number;
	}
	let { data }: { data: OwnVsRent } = $props();

	const fmt = new Intl.NumberFormat('fi-FI');
	const ownParts = $derived([
		{ label: copy.arvio.ownRent.interest, value: data.interestEur, color: '#0a0a0a' },
		{ label: copy.arvio.ownRent.vastike, value: data.vastikeEur, color: '#5c5443' },
		{ label: copy.arvio.ownRent.reserve, value: data.reserveEur, color: '#948c75' }
	].filter((p) => p.value > 0));
	const ownTotal = $derived(ownParts.reduce((a, p) => a + p.value, 0));
	const maxTotal = $derived(Math.max(data.rentEur, ownTotal, 1));

	const W = 640;
	const BAR_H = 26;
	const GAP = 2;
	const LABEL_W = 78;
	const VALUE_W = 86;
	const plotW = W - LABEL_W - VALUE_W;

	function w(value: number): number {
		return (value / maxTotal) * plotW;
	}
</script>

<div class="ovr">
	<svg viewBox="0 0 {W} {BAR_H * 2 + 26}" role="img" aria-label={copy.arvio.ownRent.title}>
		<text x="0" y={BAR_H / 2 + 4} class="row-label">{copy.arvio.ownRent.rent}</text>
		<rect x={LABEL_W} y="2" width={w(data.rentEur)} height={BAR_H - 6} rx="3" fill="#0a0a0a" opacity="0.82" />
		<text x={LABEL_W + w(data.rentEur) + 8} y={BAR_H / 2 + 4} class="row-value">{fmt.format(data.rentEur)} €/kk</text>

		<text x="0" y={BAR_H + 10 + BAR_H / 2 + 4} class="row-label">{copy.arvio.ownRent.own}</text>
		{#each ownParts as p, i (p.label)}
			{@const xStart = LABEL_W + ownParts.slice(0, i).reduce((a, q) => a + w(q.value) + GAP, 0)}
			<rect x={xStart} y={BAR_H + 12} width={Math.max(w(p.value) - GAP, 1)} height={BAR_H - 6} rx="3" fill={p.color} />
		{/each}
		<text x={LABEL_W + ownParts.reduce((a, q) => a + w(q.value) + GAP, 0) + 6} y={BAR_H + 10 + BAR_H / 2 + 4} class="row-value">{fmt.format(ownTotal)} €/kk</text>
	</svg>
	<div class="ovr__legend">
		{#each ownParts as p (p.label)}
			<span class="ovr__key"><span class="ovr__swatch" style="background:{p.color}"></span>{p.label} {fmt.format(p.value)} €</span>
		{/each}
	</div>
	{#if data.rentIsEstimate}
		<p class="ovr__note">{copy.arvio.ownRent.rent} {fmt.format(data.rentEur)} €/kk ({String(data.rentPerM2).replace('.', ',')} €/m²) {copy.arvio.ownRent.rentEstimateSuffix}.</p>
	{/if}
	{#if data.vastikeEur === 0}
		<p class="ovr__note">{copy.arvio.ownRent.vastikeUnknown}</p>
	{/if}
	<p class="ovr__note">{copy.arvio.ownRent.note}</p>
</div>

<style>
	.ovr {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	svg {
		width: 100%;
		height: auto;
	}
	.row-label {
		font-size: 12px;
		font-weight: 600;
		fill: var(--ink);
	}
	.row-value {
		font-size: 12px;
		font-weight: 600;
		fill: var(--ink);
		font-variant-numeric: tabular-nums;
	}
	.ovr__legend {
		display: flex;
		flex-wrap: wrap;
		gap: 0.3rem 1.1rem;
	}
	.ovr__key {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: var(--text-xs);
		color: var(--ink-2);
		font-variant-numeric: tabular-nums;
	}
	.ovr__swatch {
		width: 10px;
		height: 10px;
		border-radius: 2px;
	}
	.ovr__note {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
	}
</style>
