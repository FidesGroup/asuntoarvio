<script lang="ts">
	import MiniMap from '$lib/components/MiniMap.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	let { centroids }: { centroids: Record<string, any> } = $props();
</script>

<section class="pricemap" aria-label={copy.landing.priceMap.title} use:inview>
	<header class="head">
		<p class="head__eyebrow">{copy.landing.priceMap.eyebrow}</p>
		<h2 class="head__title">{copy.landing.priceMap.title}</h2>
	</header>

	<figure class="pricemap__fig">
		<MiniMap centroids={centroids} size={220} compact />
		<figcaption class="pricemap__cap">
			<span class="pricemap__source">{copy.landing.priceMap.source}</span>
			<span class="pricemap__hint">{copy.landing.priceMap.hint}</span>
		</figcaption>
	</figure>
</section>

<style>
	.pricemap {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: var(--space-9);
		max-width: var(--container-prose);
	}

	.head {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.head__eyebrow {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--brand);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0;
	}

	.head__title {
		font-size: var(--text-xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		margin: 0;
	}

	.pricemap__fig {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin: 0;
	}

	.pricemap__cap {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding-top: 0.7rem;
		border-top: 1px solid var(--border);
	}

	.pricemap__source {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.pricemap__hint {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
</style>
