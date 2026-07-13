<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import PriceMap from '$lib/PriceMap.svelte';
	import { copy } from '$lib/copy/fi';
</script>

<svelte:head>
	<title>Hintakartta | RehtiArvio</title>
	<meta name="description" content={copy.kartta.lede} />
</svelte:head>

<PageHero
	eyebrow={copy.kartta.title}
	h1={copy.kartta.h1}
	lede={copy.kartta.lede}
/>

<Card padded={false} variant="raised">
	<PriceMap onareaclick={(pc) => goto(`/?pc=${pc}`)} />
</Card>

<div class="legend">
	<div class="legend__item">
		<span class="legend__dot legend__dot--filled"></span>
		<div>
			<strong>{copy.kartta.legendTitle}</strong>
			<span>{copy.kartta.legend1}</span>
		</div>
	</div>
	<div class="legend__item">
		<span class="legend__dot legend__dot--outline"></span>
		<div>
			<strong>Ei dataa</strong>
			<span>{copy.kartta.legend2}</span>
		</div>
	</div>
</div>

<p class="attr">{copy.kartta.attribution}</p>

<style>
	.legend {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.85rem;
		margin-top: var(--space-5);
		max-width: var(--container-prose);
	}

	.legend__item {
		display: flex;
		align-items: flex-start;
		gap: 0.7rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 0.85rem 1rem;
	}

	.legend__item div { display: flex; flex-direction: column; gap: 0.15rem; }
	.legend__item strong { font-weight: 600; color: var(--ink); }
	.legend__item span { color: var(--ink-2); font-size: var(--text-sm); }

	.legend__dot {
		width: 14px;
		height: 14px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
		margin-top: 0.15rem;
	}

	.legend__dot--filled { background: var(--brand); }
	.legend__dot--outline { background: transparent; border: 1.5px solid var(--ink-3); }

	.attr {
		margin: var(--space-5) 0 0;
		color: var(--ink-3);
		font-size: var(--text-sm);
		max-width: var(--container-prose);
	}

	@media (max-width: 560px) {
		.legend { grid-template-columns: 1fr; }
	}
</style>