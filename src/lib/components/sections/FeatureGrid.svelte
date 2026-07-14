<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	type Feature = { icon: 'map' | 'analyze' | 'yield' | 'shield'; title: string; body: string };

	let {
		features
	}: {
		features?: Feature[];
	} = $props();

	const defaultItems: Feature[] = [
		{ icon: 'map', title: copy.landing.features.mapTitle, body: copy.landing.features.mapBody },
		{ icon: 'analyze', title: copy.landing.features.analyzeTitle, body: copy.landing.features.analyzeBody },
		{ icon: 'yield', title: copy.landing.features.yieldTitle, body: copy.landing.features.yieldBody }
	];

	const items: Feature[] = $derived(features ?? defaultItems);
</script>

<section class="features" aria-label={copy.landing.features.h2}>
	<header class="head">
		<h2 class="head__title">{copy.landing.features.h2}</h2>
	</header>
	<div class="grid">
		{#each items as f, i (f.title)}
			<article class="feat reveal" data-stagger={i + 1} use:inview>
				<div class="feat__icon" aria-hidden="true">
					{#if f.icon === 'map'}
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M9 3 3 5v16l6-2 6 2 6-2V3l-6 2z" /><path d="M9 3v16" /><path d="M15 5v16" />
						</svg>
					{:else if f.icon === 'analyze'}
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M3 3v18h18" /><path d="M7 14l4-4 4 3 5-7" />
						</svg>
					{:else if f.icon === 'yield'}
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4l-5.2 5.2a2 2 0 0 0 2.8 2.8l5.2-5.2a4 4 0 0 0 5.4-5.4l-2.3 2.3-1.7-1.7z" />
							<path d="M9 14h6" />
						</svg>
					{:else}
						<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
							<path d="M12 2 4 5v6c0 5 3.5 9 8 11 4.5-2 8-6 8-11V5z" />
						</svg>
					{/if}
				</div>
				<h3 class="feat__title">{f.title}</h3>
				<p class="feat__body">{f.body}</p>
			</article>
		{/each}
	</div>
</section>

<style>
	.features {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		margin-top: var(--space-10);
	}

	.head__title {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		margin: 0;
		text-wrap: balance;
		max-width: 38rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
	}

	.feat {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.4rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		transition: transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
	}

	.feat:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.feat__icon {
		width: 36px;
		height: 36px;
		display: grid;
		place-items: center;
		border-radius: var(--radius-md);
		background: color-mix(in srgb, var(--brand) 10%, transparent);
		color: var(--brand);
	}

	.feat__title {
		font-size: var(--text-md);
		font-weight: 600;
		margin: 0.25rem 0 0;
	}

	.feat__body {
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-list);
		margin: 0;
	}

	@media (max-width: 860px) {
		.grid { grid-template-columns: 1fr; }
	}

	@media (prefers-reduced-motion: reduce) {
		.feat:hover { transform: none; }
	}
</style>