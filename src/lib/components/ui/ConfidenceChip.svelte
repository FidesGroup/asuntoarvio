<script lang="ts">
	type Tone = 'neutral' | 'good' | 'warn' | 'brand';

	let {
		value,
		transactions,
		latestQuarter
	}: {
		value: 'korkea' | 'kohtalainen' | 'matala' | 'ei saatavilla' | string;
		transactions?: number;
		latestQuarter?: string | null;
	} = $props();

	const tone = $derived<Tone>(
		value === 'korkea' ? 'good' :
		value === 'kohtalainen' ? 'brand' :
		value === 'matala' ? 'warn' :
		value === 'ei saatavilla' ? 'neutral' : 'neutral'
	);

	const dot = $derived(
		value === 'korkea' ? '●' :
		value === 'kohtalainen' ? '◐' :
		value === 'matala' ? '◑' : '○'
	);
</script>

<span class="chip chip--{tone}" title={latestQuarter ? `Viimeisin ${latestQuarter}` : undefined}>
	<span class="dot" aria-hidden="true">{dot}</span>
	<span class="lbl">{value}</span>
	{#if transactions != null && transactions > 0}
		<span class="num">· {transactions.toLocaleString('fi-FI')} kauppaa</span>
	{/if}
</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		font-size: var(--text-xs);
		font-weight: 500;
		padding: 0.3rem 0.7rem;
		border-radius: var(--radius-full);
		letter-spacing: var(--ls-snug);
		white-space: nowrap;
	}

	.chip--good {
		background: var(--good-bg);
		color: var(--good-fg);
	}
	.chip--warn {
		background: color-mix(in srgb, var(--warn) 14%, transparent);
		color: var(--warn);
	}
	.chip--brand {
		background: color-mix(in srgb, var(--brand) 12%, transparent);
		color: var(--brand);
	}
	.chip--neutral {
		background: var(--chip);
		color: var(--ink-2);
	}

	.dot {
		font-size: 0.7em;
		line-height: 1;
	}

	.num {
		color: inherit;
		opacity: 0.85;
		font-variant-numeric: tabular-nums;
	}
</style>