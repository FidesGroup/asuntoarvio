<script lang="ts">
	import HeroAnalyzer from '$lib/components/sections/HeroAnalyzer.svelte';
	import VerdictBlock from '$lib/components/sections/VerdictBlock.svelte';
	import ContextBlocks from '$lib/components/sections/ContextBlocks.svelte';
	import FactorList from '$lib/components/sections/FactorList.svelte';
	import UpsellCard from '$lib/components/sections/UpsellCard.svelte';
	import FeatureGrid from '$lib/components/sections/FeatureGrid.svelte';
	import CaseGrid from '$lib/components/sections/CaseGrid.svelte';
	import TrustBar from '$lib/components/sections/TrustBar.svelte';
	import WaitlistCTA from '$lib/components/sections/WaitlistCTA.svelte';

	let { data, form } = $props();

	let activeInput = $state<'url' | 'text' | 'manual'>('url');
	let pending = $state(false);
	let formError = $state<string | null>(null);

	const hasResult = $derived(!!form?.verdict);

	const tier = $derived(form?.tier ?? null);
	const location = $derived(form?.location ?? null);
	const estimate = $derived(
		tier?.tier === 'T4' && tier?.estLowEurM2 != null && tier?.estHighEurM2 != null
			? { low: tier.estLowEurM2, mid: tier.estMidEurM2, high: tier.estHighEurM2, assumptions: tier.assumptions ?? [] }
			: null
	);
</script>

<svelte:head>
	<title>RehtiArvio — ilmainen markkinahinta-analyysi</title>
	<meta
		name="description"
		content="Liitä myynti-ilmoitus — saat vertailuarvon Tilastokeskuksen toteutuneisiin kauppoihin postinumeroalueittain. Ilmainen."
	/>
</svelte:head>

<HeroAnalyzer {data} {form} bind:activeInput bind:pending bind:formError />

{#if hasResult && form?.facts && form?.verdict}
	{@const verdict = form.verdict}
	<div class="result-block">
		<VerdictBlock
			{verdict}
			{tier}
			facts={form.facts}
			{location}
			extracted={form.extracted}
			source={form.source}
		/>
		<ContextBlocks {location} {estimate} />
		<FactorList review={form.review ?? []} flags={verdict.flags ?? []} />
		{#if form.reportPayload}
			<UpsellCard reportPayload={form.reportPayload} />
		{/if}
	</div>
{/if}

<FeatureGrid />
<CaseGrid />
<TrustBar postalCount={data.postalCodes.length} />
<WaitlistCTA {form} />

<style>
	.result-block {
		margin-top: var(--space-9);
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}
</style>