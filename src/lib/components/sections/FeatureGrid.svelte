<script lang="ts">
	import { copy } from '$lib/copy/fi';

	const groups = [copy.landing.features, copy.landing.cases];
</script>

{#each groups as group (group.eyebrow)}
	<section class="features" aria-label={group.eyebrow}>
		<header class="head">
			<p class="head__eyebrow">{group.eyebrow}</p>
		</header>
		<ul class="list">
			{#each group.items as item, i (i)}
				<li class="list__item">{item}</li>
			{/each}
		</ul>
	</section>
{/each}

<style>
	.features {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin-top: var(--space-9);
		max-width: var(--container-prose);
	}

	.head__eyebrow {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--brand);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0;
	}

	.list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin: 0;
		padding: 1rem 0 0;
		list-style: none;
		border-top: 1px solid var(--border);
	}

	.list__item {
		font-size: var(--text-md);
		color: var(--ink-2);
		line-height: var(--lh-list);
		padding-left: 0.7rem;
		border-left: 2px solid var(--border-2);
	}
</style>
