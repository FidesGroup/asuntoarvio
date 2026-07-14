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

<p class="note note--touch">{copy.kartta.tapHint}</p>

<p class="note">
	<span class="note__dot" aria-hidden="true"></span>
	{copy.kartta.legendNoData}
</p>

<p class="attr">{copy.kartta.attribution}</p>

<style>
	.note {
		display: flex;
		align-items: center;
		gap: 0.55rem;
		margin: var(--space-5) 0 0;
		color: var(--ink-2);
		font-size: var(--text-sm);
		max-width: var(--container-prose);
	}

	/* Touch guidance is only meaningful on coarse-pointer devices. */
	.note--touch {
		display: none;
	}

	@media (pointer: coarse) {
		.note--touch {
			display: flex;
		}
	}

	.note__dot {
		width: 12px;
		height: 12px;
		border-radius: var(--radius-full);
		background: transparent;
		border: 1.5px dashed var(--ink-3);
		flex-shrink: 0;
	}

	.attr {
		margin: var(--space-3) 0 0;
		padding-top: 0.7rem;
		border-top: 1px solid var(--border);
		color: var(--ink-3);
		font-size: var(--text-xs);
		font-weight: 500;
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		max-width: var(--container-prose);
	}
</style>