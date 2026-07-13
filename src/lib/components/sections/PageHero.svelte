<script lang="ts">
	import { inview } from '$lib/styles/actions';

	let {
		eyebrow,
		h1,
		lede,
		compact = false
	}: {
		eyebrow?: string;
		h1: string;
		lede?: string;
		compact?: boolean;
	} = $props();
</script>

<section class="page-hero" class:page-hero--compact={compact} use:inview>
	{#if eyebrow}
		<span class="page-hero__eyebrow">{eyebrow}</span>
	{/if}
	<h1 class="page-hero__h1">{h1}</h1>
	{#if lede}
		<p class="page-hero__lede">{lede}</p>
	{/if}
</section>

<style>
	.page-hero {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		margin-bottom: var(--space-7);
		max-width: var(--container-prose);
	}

	.page-hero--compact {
		margin-bottom: var(--space-5);
	}

	.page-hero__eyebrow {
		display: inline-block;
		align-self: flex-start;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--brand);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		background: color-mix(in srgb, var(--brand) 10%, transparent);
		padding: 0.3rem 0.65rem;
		border-radius: var(--radius-full);
	}

	.page-hero__h1 {
		font-size: var(--text-3xl);
		line-height: var(--lh-snug);
		letter-spacing: var(--ls-tight);
		font-weight: 600;
		text-wrap: balance;
		margin: 0;
	}

	.page-hero__lede {
		color: var(--ink-2);
		font-size: var(--text-lg);
		line-height: var(--lh-body);
		margin: 0;
		max-width: 36rem;
	}
</style>