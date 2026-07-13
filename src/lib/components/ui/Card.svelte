<script lang="ts">
	import type { Snippet } from 'svelte';
	import { inview } from '$lib/styles/actions';

	type Variant = 'default' | 'raised' | 'inset' | 'flat';

	let {
		variant = 'default',
		padded = true,
		as = 'section',
		inview: enableInview = false,
		children,
		header,
		footer,
		...rest
	}: {
		variant?: Variant;
		padded?: boolean;
		as?: 'section' | 'article' | 'div';
		inview?: boolean;
		children: Snippet;
		header?: Snippet;
		footer?: Snippet;
		[key: string]: any;
	} = $props();
</script>

<svelte:element
	this={as}
	class="card card--{variant}"
	class:card--padded={padded}
	class:reveal={enableInview}
	use:inview={enableInview ? {} : undefined}
	{...rest}
>
	{#if header}
		<header class="card__header">{@render header()}</header>
	{/if}
	<div class="card__body">{@render children()}</div>
	{#if footer}
		<footer class="card__footer">{@render footer()}</footer>
	{/if}
</svelte:element>

<style>
	.card {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-xs);
		transition:
			box-shadow var(--dur-fast) var(--ease-standard),
			transform var(--dur-fast) var(--ease-standard),
			border-color var(--dur-fast) var(--ease-standard);
	}

	.card--padded {
		padding: 1.5rem 1.75rem;
	}

	.card--raised {
		box-shadow: var(--shadow-md);
		background: var(--surface);
	}

	.card--inset {
		background: var(--surface-tint);
		border-color: transparent;
		box-shadow: none;
	}

	.card--flat {
		background: transparent;
		border-color: transparent;
		box-shadow: none;
	}

	.card__header {
		margin-bottom: 1rem;
	}

	.card__footer {
		margin-top: 1rem;
	}

	@media (max-width: 560px) {
		.card--padded {
			padding: 1.25rem 1.4rem;
		}
	}
</style>