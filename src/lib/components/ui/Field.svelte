<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		label,
		helper,
		error,
		required = false,
		optional = false,
		htmlFor,
		children
	}: {
		label: string;
		helper?: string;
		error?: string | null;
		required?: boolean;
		optional?: boolean;
		htmlFor?: string;
		children: Snippet<[{ id?: string }]>;
	} = $props();

	const id = $derived(htmlFor ?? `f-${Math.random().toString(36).slice(2, 8)}`);

	let wrap = $state<HTMLDivElement | undefined>();
	$effect(() => {
		if (error && wrap) {
			wrap.classList.remove('field-shake');
			void wrap.offsetWidth;
			wrap.classList.add('field-shake');
			setTimeout(() => wrap?.classList.remove('field-shake'), 400);
		}
	});
</script>

<div class="field" class:field--error={!!error} bind:this={wrap}>
	<label class="field__label" for={id}>
		<span>{label}</span>
		{#if required}<span class="field__req" aria-hidden="true">*</span>{/if}
		{#if optional}<span class="field__opt">valinnainen</span>{/if}
	</label>
	{@render children({ id })}
	{#if helper && !error}
		<p class="field__helper">{helper}</p>
	{/if}
	{#if error}
		<p class="field__error" role="alert">{error}</p>
	{/if}
</div>

<style>
	.field {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.field__label {
		display: inline-flex;
		align-items: baseline;
		gap: 0.4rem;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink);
	}

	.field__req {
		color: var(--danger-fg);
		font-weight: 600;
	}

	.field__opt {
		font-size: var(--text-xs);
		color: var(--ink-3);
		font-weight: 400;
	}

	.field__helper {
		font-size: var(--text-xs);
		color: var(--ink-3);
		margin: 0;
		line-height: var(--lh-list);
	}

	.field__error {
		font-size: var(--text-xs);
		color: var(--danger-fg);
		margin: 0;
		font-weight: 500;
		line-height: var(--lh-list);
	}

	.field--error :global(input),
	.field--error :global(textarea),
	.field--error :global(select) {
		border-color: var(--danger-fg);
		box-shadow: 0 0 0 3px color-mix(in srgb, var(--danger-fg) 18%, transparent);
	}

	:global(.field input),
	:global(.field textarea),
	:global(.field select) {
		font: inherit;
		font-size: var(--text-md);
		color: var(--ink);
		background: var(--bg);
		border: 1px solid transparent;
		padding: 0.8rem 1rem;
		border-radius: var(--radius-md);
		transition:
			background var(--dur-fast) var(--ease-standard),
			border-color var(--dur-fast) var(--ease-standard),
			box-shadow var(--dur-fast) var(--ease-standard);
		width: 100%;
	}

	:global(.field textarea) {
		resize: vertical;
		line-height: var(--lh-body);
		min-height: 180px;
	}

	:global(.field input::placeholder),
	:global(.field textarea::placeholder) {
		color: var(--ink-3);
	}

	:global(.field input:hover),
	:global(.field textarea:hover),
	:global(.field select:hover) {
		background: var(--surface);
		border-color: var(--border-2);
	}

	:global(.field input:focus-visible),
	:global(.field textarea:focus-visible),
	:global(.field select:focus-visible) {
		outline: none;
		background: var(--surface);
		border-color: var(--brand);
		box-shadow: 0 0 0 4px var(--ring);
	}

	:global(.field-shake) {
		animation: shake-x 0.4s var(--ease-standard);
	}

	@keyframes shake-x {
		0%, 100% { transform: translateX(0); }
		20%      { transform: translateX(-4px); }
		40%      { transform: translateX(4px); }
		60%      { transform: translateX(-3px); }
		80%      { transform: translateX(2px); }
	}

	@media (prefers-reduced-motion: reduce) {
		:global(.field-shake) { animation: none; }
	}
</style>