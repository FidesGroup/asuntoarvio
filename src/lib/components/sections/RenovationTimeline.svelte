<script lang="ts">
	/**
	 * Renovation history parsed from the listing: done items (solid marker)
	 * and upcoming items (dashed marker), sorted by year.
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import { copy } from '$lib/copy/fi';

	interface RenovationItem {
		year: number | null;
		text: string;
		major?: boolean;
	}
	let {
		done = [],
		upcoming = []
	}: { done?: RenovationItem[]; upcoming?: RenovationItem[] } = $props();

	const R = copy.landing.report;
	const byYear = (a: RenovationItem, b: RenovationItem) => (a.year ?? 9999) - (b.year ?? 9999);
	const doneSorted = $derived([...done].sort(byYear));
	const upcomingSorted = $derived([...upcoming].sort(byYear));
</script>

<Card>
	{#snippet header()}<h2 class="h">{R.renoTitle}</h2>{/snippet}
	{#if doneSorted.length || upcomingSorted.length}
		<div class="cols">
			<div class="col">
				<h3 class="col__h">{R.renoDone}</h3>
				<ul class="tl">
					{#each doneSorted as r, i (i)}
						<li class="tl__item tl__item--done">
							<span class="tl__year num">{r.year ?? '–'}</span>
							<span class="tl__text">{r.text}</span>
						</li>
					{:else}
						<li class="tl__none">–</li>
					{/each}
				</ul>
			</div>
			<div class="col">
				<h3 class="col__h">{R.renoUpcoming}</h3>
				<ul class="tl">
					{#each upcomingSorted as r, i (i)}
						<li class="tl__item tl__item--upcoming">
							<span class="tl__year num">{r.year ?? '–'}</span>
							<span class="tl__text">{r.text}</span>
						</li>
					{:else}
						<li class="tl__none">–</li>
					{/each}
				</ul>
			</div>
		</div>
	{:else}
		<p class="none">{R.renoNone}</p>
	{/if}
</Card>

<style>
	.h {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}
	.cols {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1.25rem;
	}
	.col__h {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0 0 0.5rem;
	}
	.tl {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
	}
	.tl__item {
		display: flex;
		gap: 0.7rem;
		font-size: var(--text-sm);
		line-height: var(--lh-list);
		padding-left: 0.7rem;
		border-left: 2px solid var(--ink-2);
	}
	.tl__item--upcoming {
		border-left-style: dashed;
		border-left-color: var(--border-2);
	}
	.tl__year {
		font-weight: 600;
		color: var(--ink);
		flex-shrink: 0;
		min-width: 2.6rem;
		font-variant-numeric: tabular-nums;
	}
	.tl__text {
		color: var(--ink-2);
	}
	.tl__none {
		color: var(--ink-3);
		font-size: var(--text-sm);
	}
	.none {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
	}
	@media (max-width: 720px) {
		.cols {
			grid-template-columns: 1fr;
		}
	}
</style>
