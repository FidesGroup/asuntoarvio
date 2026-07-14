<script lang="ts">
	import { copy } from '$lib/copy/fi';
</script>

<section class="features" aria-label={copy.landing.features.eyebrow}>
	<header class="head">
		<p class="head__eyebrow">{copy.landing.features.eyebrow}</p>
	</header>
	<ul class="list">
		{#each copy.landing.features.items as item, i (i)}
			<li class="list__item">{item}</li>
		{/each}
	</ul>
</section>

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
		flex-wrap: wrap;
		gap: 0.5rem 1.25rem;
		margin: 0;
		padding: 1rem 0 0;
		list-style: none;
		border-top: 1px solid var(--border);
	}

	.list__item {
		font-size: var(--text-md);
		color: var(--ink-2);
		line-height: var(--lh-list);
	}

	.list__item::before {
		content: '·';
		margin-right: 1.25rem;
		color: var(--ink-3);
	}

	.list__item:first-child::before {
		display: none;
	}

	@media (max-width: 720px) {
		.list {
			flex-direction: column;
			gap: 0.4rem;
		}
		.list__item::before {
			display: none;
		}
		.list__item {
			padding-left: 0.7rem;
			border-left: 2px solid var(--border-2);
		}
	}
</style>
