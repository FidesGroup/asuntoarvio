<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Crumbs from '$lib/components/ui/Crumbs.svelte';
	import ConfidenceChip from '$lib/components/ui/ConfidenceChip.svelte';
	import DeltaBadge from '$lib/components/ui/DeltaBadge.svelte';
	import Stat from '$lib/components/ui/Stat.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	type Tier = 'T1' | 'T2' | 'T3' | 'T4' | string;

	let {
		verdict,
		tier,
		facts,
		location = null,
		extracted = null,
		source = null
	}: {
		verdict: { deltaPct: number | null; listingEurM2: number; benchmarkEurM2: number | null; confidence: string; flags: string[]; transactions4q?: number; latestQuarter?: string | null };
		tier: { tier: Tier; confidenceLabel: string; transactionsOrEvidence: number; estLowEurM2?: number; estMidEurM2?: number; estHighEurM2?: number; assumptions?: string[] } | null;
		facts: { postalCode: string; livingAreaM2: number; roomsType?: string | null; buildYear?: number | null };
		location?: {
			eurM2: number;
			deltaPct: number;
			areasUsed: { pc: string; nimi: string; eurM2: number; km: number }[];
		} | null;
		extracted?: { address?: string | null; propertyClass?: string | null } | null;
		source?: string | null;
	} = $props();

	const fmt = new Intl.NumberFormat('fi-FI');
	const CLASS_LABELS: Record<string, string> = {
		kerrostalo: 'kerrostalo', rivitalo: 'rivitalo',
		omakotitalo: 'omakotitalo', paritalo: 'paritalo', muu: 'muu kohde'
	};

	const verdictSentence = $derived.by(() => {
		if (verdict.deltaPct === null) return copy.landing.result.noVerdictReason;
		if (tier?.tier === 'T4') return copy.landing.result.estimateReason;
		return verdict.deltaPct >= 0 ? copy.landing.result.verdictOver : copy.landing.result.verdictUnder;
	});

	const headline = $derived.by(() => {
		if (verdict.deltaPct === null) return copy.landing.result.noVerdict;
		if (tier?.tier === 'T4') return copy.landing.result.verdictNeutral;
		return '';
	});

	const tierDescription = $derived.by(() => {
		if (!tier) return '';
		if (tier.tier === 'T1') return copy.landing.result.tier.T1(tier.transactionsOrEvidence);
		if (tier.tier === 'T3') return copy.landing.result.tier.T3(tier.transactionsOrEvidence);
		return copy.landing.result.tier.T4;
	});
</script>

<article class="result" use:inview>
	<Crumbs
		parts={[
			extracted?.address ?? null,
			facts.postalCode,
			extracted?.propertyClass ? CLASS_LABELS[extracted.propertyClass] : null,
			facts.roomsType,
			`${facts.livingAreaM2} m²`,
			facts.buildYear ? `rak. ${facts.buildYear}` : null,
			source ? `lähde ${source}` : null
		]}
	/>

	<header class="result__head">
		<DeltaBadge delta={verdict.deltaPct} size="hero" />
		{#if headline}
			<h2 class="result__headline">{headline}</h2>
		{/if}
		<p class="result__sentence">{verdictSentence}</p>
	</header>

	<div class="result__metrics">
		<div class="metric">
			<span class="metric__label">Kohteen neliöhinta</span>
			<span class="metric__value num">{fmt.format(verdict.listingEurM2)}<span class="metric__unit">€/m²</span></span>
		</div>
		<div class="metric metric--alt">
			<span class="metric__label">Alueen kaupat</span>
			<span class="metric__value num">
				{#if verdict.benchmarkEurM2}
					{fmt.format(verdict.benchmarkEurM2)}<span class="metric__unit">€/m²</span>
				{:else}
					<span class="metric__dash">–</span>
				{/if}
			</span>
		</div>
		<div class="metric metric--chip">
			<span class="metric__label">Luotettavuus</span>
			<ConfidenceChip
				value={verdict.confidence}
				transactions={verdict.transactions4q}
				latestQuarter={verdict.latestQuarter}
			/>
			{#if tierDescription}
				<span class="metric__tier">{tierDescription}</span>
			{/if}
		</div>
	</div>
</article>

<style>
	.result {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.result__head {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.result__headline {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		margin: 0.5rem 0 0;
	}

	.result__sentence {
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
		max-width: 38rem;
		margin: 0;
	}

	.result__metrics {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem;
	}

	.metric {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		padding: 1.1rem 1.25rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		min-width: 0;
	}

	.metric--alt { background: var(--surface-tint); border-color: transparent; }

	.metric--chip {
		gap: 0.5rem;
	}

	.metric__label {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-2);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.metric__value {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		color: var(--ink);
		display: inline-flex;
		align-items: baseline;
		gap: 0.15rem;
	}

	.metric__unit {
		font-size: 0.55em;
		color: var(--ink-2);
		font-weight: 500;
	}

	.metric__dash {
		color: var(--ink-3);
	}

	.metric__tier {
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
	}

	@media (max-width: 720px) {
		.result__metrics { grid-template-columns: 1fr; }
	}
</style>