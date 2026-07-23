<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import ConfidenceChip from '$lib/components/ui/ConfidenceChip.svelte';
	import DeltaBadge from '$lib/components/ui/DeltaBadge.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	type Tier = 'T1' | 'T2' | 'T3' | 'T4' | string;

	let {
		verdict,
		tier,
		facts
	}: {
		verdict: { deltaPct: number | null; listingEurM2: number; benchmarkEurM2: number | null; confidence: string; flags: string[]; transactions4q?: number; latestQuarter?: string | null };
		tier: { tier: Tier; confidenceLabel: string; transactionsOrEvidence: number; estLowEurM2?: number; estMidEurM2?: number; estHighEurM2?: number; assumptions?: string[] } | null;
		facts: { postalCode: string; livingAreaM2: number; priceEur: number; roomsType?: string | null; buildYear?: number | null };
	} = $props();

	const fmt = new Intl.NumberFormat('fi-FI');

	const eurDiff = $derived.by(() => {
		if (verdict.deltaPct === null) return null;
		if (tier?.tier === 'T4') return null;
		if (!facts?.priceEur || !Number.isFinite(facts.priceEur)) return null;
		const fraction = verdict.deltaPct / 100;
		if (!Number.isFinite(fraction) || fraction <= -1) return null;
		const raw = facts.priceEur - facts.priceEur / (1 + fraction);
		return Math.round(raw / 1000) * 1000;
	});

	const eurHeadline = $derived.by(() => {
		if (eurDiff === null) return null;
		const abs = fmt.format(Math.abs(eurDiff));
		if (eurDiff === 0) return 'Hintapyyntö osuu hyvin siihen, mitä alueella on oikeasti maksettu.';
		return eurDiff > 0
			? copy.landing.result.verdictEurOver(abs)
			: copy.landing.result.verdictEurUnder(abs);
	});

	const tierDescription = $derived.by(() => {
		if (!tier) return '';
		if (tier.tier === 'T1') return copy.landing.result.tier.T1(tier.transactionsOrEvidence);
		if (tier.tier === 'T3') return copy.landing.result.tier.T3(tier.transactionsOrEvidence);
		return copy.landing.result.tier.T4;
	});
</script>

<Card variant="default" inview>
	<p class="result__source">Lähde: Tilastokeskus 13mt · 4 viimeistä neljännestä</p>

	<div class="result__row">
		<div class="result__delta">
			<DeltaBadge delta={verdict.deltaPct} size="hero" />
		</div>
		<div class="result__sentence">
			{#if eurHeadline}
				<p class="result__headline">{eurHeadline}</p>
			{:else}
				<p class="result__headline result__headline--neutral">{copy.landing.result.verdictNeutral}</p>
				<p class="result__sub">
					{verdict.deltaPct === null
						? copy.landing.result.noVerdictReason
						: copy.landing.result.estimateReason}
				</p>
			{/if}
		</div>
		<div class="result__confidence">
			<ConfidenceChip
				value={verdict.confidence}
				transactions={verdict.transactions4q}
				latestQuarter={verdict.latestQuarter}
			/>
			{#if tierDescription}
				<span class="result__tier">{tierDescription}</span>
			{/if}
		</div>
	</div>

	<dl class="result__stats">
		<div class="stat">
			<dt class="stat__label">{copy.landing.result.statListing}</dt>
			<dd class="stat__value num">{fmt.format(verdict.listingEurM2)}<span class="stat__unit">€/m²</span></dd>
		</div>
		<div class="stat">
			<dt class="stat__label">{copy.landing.result.statBenchmark}</dt>
			<dd class="stat__value num">
				{#if verdict.benchmarkEurM2}
					{fmt.format(verdict.benchmarkEurM2)}<span class="stat__unit">€/m²</span>
				{:else}
					<span class="stat__dash">–</span>
				{/if}
			</dd>
		</div>
		<div class="stat">
			<dt class="stat__label">{copy.landing.result.statConfidence}</dt>
			<dd class="stat__value stat__value--text">{copy.landing.result.confidence[verdict.confidence as 'korkea' | 'kohtalainen' | 'matala'] ?? verdict.confidence}</dd>
		</div>
	</dl>

	<p class="vmethod">{copy.landing.methodNote}</p>
</Card>

<style>
	.result__source {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0 0 1rem;
		padding-top: 0.85rem;
		border-top: 1px solid var(--border);
	}

	.result__row {
		display: grid;
		grid-template-columns: auto 1fr auto;
		align-items: center;
		gap: 1.5rem 2rem;
		margin-bottom: 1.5rem;
	}

	.result__delta {
		display: flex;
		align-items: center;
	}

	.result__sentence {
		min-width: 0;
	}

	.result__headline {
		font-size: var(--text-xl);
		line-height: var(--lh-snug);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		margin: 0;
		font-variant-numeric: tabular-nums;
	}

	.result__headline--neutral {
		font-size: var(--text-lg);
		color: var(--ink-2);
	}

	.result__sub {
		color: var(--ink-3);
		font-size: var(--text-sm);
		margin: 0.4rem 0 0;
		line-height: var(--lh-list);
	}

	.result__confidence {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		gap: 0.35rem;
		min-width: 0;
	}

	.result__tier {
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
		max-width: 18rem;
		text-align: right;
	}

	.result__stats {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0;
		margin: 0;
		padding: 1rem 0 0;
		border-top: 1px solid var(--border);
	}

	.stat {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
		padding: 0 1.25rem;
	}

	.stat + .stat {
		border-left: 1px solid var(--border);
	}

	.stat__label {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0;
	}

	.stat__value {
		font-size: var(--text-xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		color: var(--ink);
		margin: 0;
		display: inline-flex;
		align-items: baseline;
		gap: 0.15rem;
	}

	.stat__value--text {
		font-size: var(--text-md);
		text-transform: capitalize;
	}

	.stat__unit {
		font-size: 0.55em;
		color: var(--ink-2);
		font-weight: 500;
	}

	.stat__dash {
		color: var(--ink-3);
	}

	.vmethod {
		margin: 0.85rem 0 0;
		padding-top: 0.7rem;
		border-top: 1px solid var(--border);
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
	}

	@media (max-width: 720px) {
		.result__row {
			grid-template-columns: 1fr;
			gap: 0.75rem;
		}
		.result__delta { justify-content: flex-start; }
		.result__confidence { align-items: flex-start; }
		.result__tier { text-align: left; max-width: none; }
		.result__stats { grid-template-columns: 1fr; }
		.stat + .stat {
			border-left: 0;
			border-top: 1px solid var(--border);
			padding-top: 0.85rem;
		}
		.stat { padding: 0; }
		.stat + .stat { margin-top: 0.85rem; }
		.stat:first-child { padding-top: 0.85rem; }
	}
</style>
