<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes, HTMLAnchorAttributes } from 'svelte/elements';

	type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'link';
	type Size = 'sm' | 'md' | 'lg';

	type CommonProps = {
		variant?: Variant;
		size?: Size;
		block?: boolean;
		loading?: boolean;
		children: Snippet;
	};

	type AsButton = CommonProps & HTMLButtonAttributes & { href?: never };
	type AsLink = CommonProps & HTMLAnchorAttributes & { href: string };

	let props: AsButton | AsLink = $props();

	const variant = $derived(props.variant ?? 'primary');
	const size = $derived(props.size ?? 'md');
</script>

{#if 'href' in props && props.href}
	<a
		class="btn btn--{variant} btn--{size}"
		class:btn--block={props.block}
		href={props.href}
		{...props as HTMLAnchorAttributes}
	>
		{@render props.children()}
	</a>
{:else}
	<button
		class="btn btn--{variant} btn--{size}"
		class:btn--block={props.block}
		class:btn--loading={(props as AsButton).loading}
		disabled={(props as AsButton).loading || (props as AsButton).disabled}
		{...props as HTMLButtonAttributes}
	>
		{#if (props as AsButton).loading}
			<span class="btn__spinner" aria-hidden="true"></span>
		{/if}
		<span class="btn__label">{@render props.children()}</span>
	</button>
{/if}

<style>
	.btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		font: inherit;
		font-weight: 500;
		letter-spacing: var(--ls-snug);
		text-decoration: none;
		border: 1px solid transparent;
		cursor: pointer;
		border-radius: var(--radius-full);
		transition:
			background var(--dur-fast) var(--ease-standard),
			color var(--dur-fast) var(--ease-standard),
			border-color var(--dur-fast) var(--ease-standard),
			transform var(--dur-fast) var(--ease-standard),
			box-shadow var(--dur-fast) var(--ease-standard);
		white-space: nowrap;
		user-select: none;
	}

	.btn:active {
		transform: translateY(1px);
	}

	.btn--block { width: 100%; }

	/* Sizes */
	.btn--sm {
		font-size: var(--text-sm);
		padding: 0.5rem 0.95rem;
		min-height: 36px;
	}
	.btn--md {
		font-size: var(--text-md);
		padding: 0.7rem 1.2rem;
		min-height: 44px;
	}
	.btn--lg {
		font-size: var(--text-lg);
		padding: 0.85rem 1.55rem;
		min-height: 52px;
	}

	/* Primary */
	.btn--primary {
		background: var(--brand);
		color: var(--brand-ink);
		border-color: var(--brand);
		box-shadow: 0 1px 2px var(--ring), 0 4px 14px -4px var(--ring);
	}
	.btn--primary:hover {
		background: var(--brand-600);
		border-color: var(--brand-600);
	}

	/* Secondary */
	.btn--secondary {
		background: var(--surface);
		color: var(--ink);
		border-color: var(--border);
	}
	.btn--secondary:hover {
		border-color: var(--border-2);
		background: var(--surface-2);
	}

	/* Ghost */
	.btn--ghost {
		background: transparent;
		color: var(--ink-2);
		border-color: transparent;
	}
	.btn--ghost:hover {
		color: var(--ink);
		background: var(--chip);
	}

	/* Danger */
	.btn--danger {
		background: var(--danger-fg);
		color: var(--brand-ink);
		border-color: var(--danger-fg);
	}

	/* Link */
	.btn--link {
		background: transparent;
		color: var(--brand);
		border-color: transparent;
		padding: 0;
		min-height: 0;
		text-decoration: underline;
		text-decoration-color: var(--border-2);
		text-underline-offset: 3px;
	}
	.btn--link:hover {
		text-decoration-color: var(--brand);
	}

	.btn--loading .btn__label {
		opacity: 0.7;
	}

	.btn__spinner {
		width: 1em;
		height: 1em;
		border: 2px solid currentColor;
		border-right-color: transparent;
		border-radius: var(--radius-full);
		animation: spin 0.7s linear infinite;
	}

	@keyframes spin {
		to { transform: rotate(360deg); }
	}

	@media (prefers-reduced-motion: reduce) {
		.btn:active { transform: none; }
		.btn__spinner { animation-duration: 3s; }
	}
</style>