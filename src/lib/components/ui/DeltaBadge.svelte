<script lang="ts">
	import { countUp } from '$lib/styles/countUp.svelte';
	import { inview } from '$lib/styles/actions';

	type Direction = 'over' | 'under' | 'none';

	let {
		delta,
		size = 'xl'
	}: {
		delta: number | null;
		size?: 'lg' | 'xl' | 'hero';
	} = $props();

	const dir: Direction = $derived(delta === null ? 'none' : delta >= 0 ? 'over' : 'under');
	const fmt = $derived(new Intl.NumberFormat('fi-FI', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1
	}));
	const target = $derived(delta === null ? 0 : Math.abs(delta));
	const isZero = $derived(delta === 0);
	const zeroText = '0,0';
</script>

<div class="delta delta--{dir} delta--{size}" use:inview>
	{#if delta === null}
		<span class="delta__value">–</span>
	{:else if isZero}
		<span class="delta__value">{zeroText}<span class="delta__sign">&nbsp;%</span></span>
	{:else}
		<span class="delta__sign">{delta > 0 ? '+' : '−'}</span>
		<span use:countUp={{ to: target, decimals: 1, duration: 750 }}>{fmt.format(target)}</span>
		<span class="delta__sign">&nbsp;%</span>
	{/if}
</div>

<style>
	.delta {
		display: inline-flex;
		align-items: baseline;
		gap: 0.05em;
		font-weight: 600;
		letter-spacing: var(--ls-tightest);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.delta--lg   { font-size: var(--text-4xl); }
	.delta--xl   { font-size: clamp(2.6rem, 2rem + 2.4vw, 3.6rem); }
	.delta--hero { font-size: var(--text-hero); }

	.delta__sign {
		font-size: 0.55em;
		font-weight: 500;
		opacity: 0.85;
	}

	.delta--over  { color: var(--warn); }
	.delta--under { color: var(--good); }
	.delta--none  { color: var(--ink); }
</style>