<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	type Factor = { category: string; title: string; content: string };

	let {
		review = [],
		flags = []
	}: {
		review?: Factor[];
		flags?: string[];
	} = $props();

	let factorsOpen = $state(false);

	function groupReview(list: Factor[]) {
		const groups: { title: string; parts: Factor[] }[] = [];
		for (const f of list) {
			if (f.category === 'confidence') continue;
			if (f.category === 'what') groups.push({ title: f.title, parts: [f] });
			else if (groups.length) groups[groups.length - 1].parts.push(f);
		}
		return groups;
	}

	const groups = $derived(groupReview(review));
</script>

{#if review?.length || flags?.length}
	<Card inview>
		{#snippet header()}
			{#if review?.length}
				<div class="head">
					<h3 class="head__title">{copy.landing.result.factorsTitle}</h3>
					<button
						type="button"
						class="head__toggle"
						aria-expanded={factorsOpen}
						onclick={() => (factorsOpen = !factorsOpen)}
					>
						{factorsOpen ? copy.landing.result.factorsClose : copy.landing.result.factorsToggle}
						<span class="head__chev" class:open={factorsOpen} aria-hidden="true">›</span>
					</button>
				</div>
			{/if}
		{/snippet}

		{#if review?.length && factorsOpen}
			<div class="factors">
				{#each groups as g (g.title)}
					<div class="factor">
						<h4 class="factor__h">{g.title}</h4>
						{#each g.parts as p, i (i)}
							<p class="factor__p">
								{#if p.category === 'what'}<b>Mitä tämä on:</b>
								{:else if p.category === 'here'}<b>Tässä kohteessa:</b>
								{:else if p.category === 'why'}<b>Miksi tällä on väliä:</b>
								{:else if p.category === 'check'}<b>Tarkista vielä:</b>{/if}
								{p.content}
							</p>
						{/each}
					</div>
				{/each}
			</div>
		{/if}

		{#if flags?.length}
			<div class="flags">
				<h4 class="flags__h">{copy.landing.result.flagsTitle}</h4>
				<div class="flags__chips">
					{#each flags as flag (flag)}
						<Chip size="sm" tone="neutral">{flag}</Chip>
					{/each}
				</div>
			</div>
		{/if}
	</Card>
{/if}

<style>
	.head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
		margin: 0;
	}

	.head__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.head__toggle {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--brand);
		background: transparent;
		border: 1px solid transparent;
		padding: 0.35rem 0.65rem;
		border-radius: var(--radius-full);
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-standard);
	}

	.head__toggle:hover { background: color-mix(in srgb, var(--brand) 10%, transparent); }

	.head__chev {
		display: inline-block;
		transition: transform var(--dur-base) var(--ease-emphasized);
	}

	.head__chev.open { transform: rotate(90deg); }

	.factors {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.75rem;
	}

	.factor {
		background: var(--surface-tint);
		padding: 0.9rem 1.05rem;
		border-radius: var(--radius-md);
	}

	.factor__h {
		font-size: var(--text-md);
		font-weight: 600;
		margin: 0 0 0.4rem;
	}

	.factor__p {
		font-size: var(--text-sm);
		line-height: var(--lh-body);
		color: var(--ink-2);
		margin: 0 0 0.35rem;
	}

	.factor__p b { color: var(--ink); font-weight: 600; }

	.flags {
		margin-top: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.flags__h {
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--ink-2);
		margin: 0 0 0.5rem;
		text-transform: uppercase;
		letter-spacing: var(--ls-wide);
	}

	.flags__chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}

	@media (max-width: 720px) {
		.factors { grid-template-columns: 1fr; }
	}

	@media (prefers-reduced-motion: reduce) {
		.head__chev { transition: none; }
	}
</style>