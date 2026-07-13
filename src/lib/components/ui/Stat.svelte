<script lang="ts">
	import { countUp } from '$lib/styles/countUp.svelte';
	import { inview } from '$lib/styles/actions';

	let {
		value,
		unit = '',
		label,
		size = 'lg',
		tone = 'neutral',
		decimals = 0,
		duration = 700,
		prefix = '',
		suffix = ''
	}: {
		value: number;
		unit?: string;
		label?: string;
		size?: 'sm' | 'md' | 'lg' | 'xl';
		tone?: 'neutral' | 'good' | 'warn' | 'brand';
		decimals?: number;
		duration?: number;
		prefix?: string;
		suffix?: string;
	} = $props();
</script>

<div class="stat stat--{size} stat--{tone}" use:inview>
	<div class="stat__num num">
		{#if prefix}<span class="stat__aff">{prefix}</span>{/if}
		<span use:countUp={{ to: value, decimals, duration }}>{value}</span>
		{#if unit || suffix}
			<span class="stat__unit">{unit}{suffix}</span>
		{/if}
	</div>
	{#if label}<div class="stat__label">{label}</div>{/if}
</div>

<style>
	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		min-width: 0;
	}

	.stat__num {
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		font-variant-numeric: tabular-nums;
		line-height: 1.05;
		display: flex;
		align-items: baseline;
		gap: 0.2rem;
		flex-wrap: wrap;
	}

	.stat--sm .stat__num { font-size: var(--text-xl); }
	.stat--md .stat__num { font-size: var(--text-2xl); }
	.stat--lg .stat__num { font-size: var(--text-3xl); }
	.stat--xl .stat__num { font-size: var(--text-4xl); }

	.stat__unit {
		font-size: 0.55em;
		color: var(--ink-2);
		font-weight: 500;
	}

	.stat__aff {
		font-size: 0.6em;
		color: var(--ink-2);
	}

	.stat__label {
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-list);
	}

	.stat--good .stat__num { color: var(--good); }
	.stat--warn .stat__num { color: var(--warn); }
	.stat--brand .stat__num { color: var(--brand); }
	.stat--neutral .stat__num { color: var(--ink); }
</style>