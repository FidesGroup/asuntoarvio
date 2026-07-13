<script lang="ts">
	let { parts }: { parts: (string | null | undefined | false)[] } = $props();

	const cleaned = $derived(parts.filter((p): p is string => !!p && String(p).trim().length > 0));
</script>

{#if cleaned.length > 0}
	<p class="crumbs">
		{#each cleaned as part, i (i)}
			<span class="crumbs__part">{part}</span>{#if i < cleaned.length - 1}<span class="crumbs__sep" aria-hidden="true">·</span>{/if}
		{/each}
	</p>
{/if}

<style>
	.crumbs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 0.5rem;
		align-items: baseline;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0;
	}

	.crumbs__sep {
		color: var(--border-2);
		text-transform: none;
	}
</style>