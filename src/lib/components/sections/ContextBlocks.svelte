<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	let {
		location,
		estimate
	}: {
		location?: {
			eurM2: number;
			deltaPct: number;
			areasUsed: { pc: string; nimi: string; eurM2: number; km: number }[];
		} | null;
		estimate?: {
			low: number;
			mid: number;
			high: number;
			assumptions: string[];
		} | null;
	} = $props();

	const fmt = new Intl.NumberFormat('fi-FI');
</script>

{#if estimate}
	<Card inview>
		{#snippet header()}
			<div class="head">
				<h3 class="head__title">{copy.landing.result.estimateBand.title}</h3>
				<Chip size="sm" tone="warn">{copy.landing.result.estimateBand.beta}</Chip>
			</div>
		{/snippet}

		<div class="band">
			<div class="band__edge">
				<span class="band__eur num">{fmt.format(estimate.low)}</span>
				<span class="band__lbl">€/m² · {copy.landing.result.estimateBand.low}</span>
			</div>
			<div class="band__mid">
				<span class="band__eur band__eur--mid num">{fmt.format(estimate.mid)}</span>
				<span class="band__lbl">€/m² · {copy.landing.result.estimateBand.mid}</span>
			</div>
			<div class="band__edge">
				<span class="band__eur num">{fmt.format(estimate.high)}</span>
				<span class="band__lbl">€/m² · {copy.landing.result.estimateBand.high}</span>
			</div>
		</div>

		<p class="note">{copy.landing.result.estimateBand.note}</p>

		{#if estimate.assumptions?.length}
			<p class="assumptions">
				<b>{copy.landing.result.estimateBand.assumptionsLabel}:</b>
				{estimate.assumptions.join(' · ')}
			</p>
		{/if}
	</Card>
{/if}

{#if location}
	<Card inview>
		{#snippet header()}
			<div class="head">
				<h3 class="head__title">{copy.landing.result.locationTitle}</h3>
				<Chip size="sm" tone="brand">{copy.landing.result.locationBeta}</Chip>
			</div>
		{/snippet}

		<p class="loc">
			{copy.landing.result.locationIntro(fmt.format(location.eurM2))}
			<strong class:over={location.deltaPct > 0} class:under={location.deltaPct < 0}>
				{location.deltaPct > 0 ? '+' : ''}{String(location.deltaPct).replace('.', ',')} %
				{location.deltaPct >= 0 ? copy.landing.result.verdictOver : copy.landing.result.verdictUnder}
			</strong>
		</p>

		{#if location.areasUsed?.length}
			<p class="areas">
				{#each location.areasUsed as a, i (a.pc)}
					{i > 0 ? ' · ' : ''}{a.nimi || a.pc} {a.km} km ({fmt.format(a.eurM2)} €/m²)
				{/each}
			</p>
		{/if}
	</Card>
{/if}

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.head__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.band {
		display: flex;
		align-items: stretch;
		justify-content: space-between;
		gap: 0.5rem;
		padding: 0.5rem;
		background: var(--surface-tint);
		border-radius: var(--radius-md);
	}

	.band__edge, .band__mid {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
		padding: 0.7rem 0.5rem;
		border-radius: var(--radius-sm);
		background: var(--surface);
	}

	.band__mid {
		background: var(--brand);
		color: var(--brand-ink);
	}

	.band__eur {
		font-weight: 600;
		font-size: var(--text-lg);
		color: var(--ink);
	}

	.band__eur--mid {
		font-size: var(--text-2xl);
		color: var(--brand-ink);
	}

	.band__lbl {
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
	}

	.band__mid .band__lbl {
		color: color-mix(in srgb, var(--brand-ink) 80%, transparent);
	}

	.note {
		margin: 0.85rem 0 0.25rem;
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-body);
	}

	.assumptions {
		margin: 0.5rem 0 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
	}

	.assumptions b {
		color: var(--ink-2);
		font-weight: 600;
	}

	.loc {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
	}

	.loc strong.over  { color: var(--warn); }
	.loc strong.under { color: var(--good); }

	.areas {
		margin: 0.6rem 0 0;
		color: var(--ink-3);
		font-size: var(--text-xs);
		font-variant-numeric: tabular-nums;
	}
</style>