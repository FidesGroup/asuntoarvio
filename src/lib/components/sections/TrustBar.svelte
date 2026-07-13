<script lang="ts">
	import Stat from '$lib/components/ui/Stat.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	let { postalCount }: { postalCount: number } = $props();
</script>

<section class="trust" aria-label={copy.landing.trust.line} use:inview>
	<p class="trust__line">{copy.landing.trust.line}</p>
</section>

<style>
	.trust {
		margin-top: var(--space-10);
		padding-top: var(--space-7);
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: center;
	}

	.trust__line {
		text-align: center;
		font-size: var(--text-sm);
		color: var(--ink-3);
		letter-spacing: var(--ls-snug);
		margin: 0;
	}
</style>