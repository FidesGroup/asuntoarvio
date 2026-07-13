<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'neutral' | 'brand' | 'good' | 'warn' | 'danger' | 'subtle';
	type Size = 'sm' | 'md';

	let {
		tone = 'neutral',
		size = 'md',
		children
	}: {
		tone?: Tone;
		size?: Size;
		children: Snippet;
	} = $props();
</script>

<span class="chip chip--{tone} chip--{size}">{@render children()}</span>

<style>
	.chip {
		display: inline-flex;
		align-items: center;
		gap: 0.3rem;
		font-weight: 500;
		border-radius: var(--radius-full);
		letter-spacing: var(--ls-snug);
		white-space: nowrap;
	}

	.chip--sm {
		font-size: var(--text-xs);
		padding: 0.15rem 0.55rem;
	}

	.chip--md {
		font-size: var(--text-sm);
		padding: 0.3rem 0.7rem;
	}

	.chip--neutral {
		background: var(--chip);
		color: var(--ink-2);
	}

	.chip--brand {
		background: var(--brand);
		color: var(--brand-ink);
	}

	.chip--good {
		background: var(--good-bg);
		color: var(--good-fg);
	}

	.chip--warn {
		background: color-mix(in srgb, var(--warn) 14%, transparent);
		color: var(--warn);
	}

	.chip--danger {
		background: var(--danger-bg);
		color: var(--danger-fg);
	}

	.chip--subtle {
		background: transparent;
		color: var(--ink-3);
		padding-left: 0;
		padding-right: 0;
	}
</style>