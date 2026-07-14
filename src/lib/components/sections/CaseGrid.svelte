<script lang="ts">
	/**
	 * Example valuations per property type, priced from the real benchmark
	 * and rent seeds. Area-level statistics only — the disclaimer states
	 * these are not appraisals of individual listings.
	 */
	import { copy } from '$lib/copy/fi';

	interface ExampleCase {
		id: string;
		roomsType: string;
		m2: number;
		pc: string;
		areaName: string;
		eurM2: number;
		n: number;
		priceLevelEur: number;
		rentEurMonth: number | null;
		grossYieldPct: number | null;
	}
	let { examples }: { examples: ExampleCase[] } = $props();

	const fmt = new Intl.NumberFormat('fi-FI');
	const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
</script>

{#if examples.length}
	<section class="cases" aria-label={copy.landing.examples.eyebrow}>
		<header class="cases__head">
			<p class="cases__eyebrow">{copy.landing.examples.eyebrow}</p>
			<h2 class="cases__title">{copy.landing.examples.title}</h2>
		</header>
		<div class="cases__grid">
			{#each examples as ex (ex.id)}
				<article class="case">
					<h3 class="case__h">
						{cap(ex.roomsType)} · {ex.m2} m²
						<span class="case__area">{ex.areaName} ({ex.pc})</span>
					</h3>
					<dl class="case__rows num">
						<div class="case__row">
							<dt>{copy.landing.examples.rows.area}</dt>
							<dd>{fmt.format(ex.eurM2)} €/m² <span class="case__sub">· {fmt.format(ex.n)} kauppaa</span></dd>
						</div>
						<div class="case__row">
							<dt>{copy.landing.examples.rows.priceLevel}</dt>
							<dd>~{fmt.format(ex.priceLevelEur)} €</dd>
						</div>
						{#if ex.rentEurMonth !== null}
							<div class="case__row">
								<dt>{copy.landing.examples.rows.rent}</dt>
								<dd>~{fmt.format(ex.rentEurMonth)} €/kk</dd>
							</div>
						{/if}
						{#if ex.grossYieldPct !== null}
							<div class="case__row">
								<dt>{copy.landing.examples.rows.yield}</dt>
								<dd>{String(ex.grossYieldPct).replace('.', ',')} %</dd>
							</div>
						{/if}
					</dl>
					{#if copy.landing.examples.takes[ex.id]}
						<p class="case__take">{copy.landing.examples.takes[ex.id]}</p>
					{/if}
				</article>
			{/each}
		</div>
		<p class="cases__disclaimer">{copy.landing.examples.disclaimer}</p>
	</section>
{/if}

<style>
	.cases {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-top: var(--space-9);
		max-width: var(--container-app);
	}

	.cases__head {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.cases__eyebrow {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--brand);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0;
	}

	.cases__title {
		font-size: var(--text-xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		margin: 0;
	}

	.cases__grid {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 1rem;
	}

	.case {
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		padding: 1.1rem 1.25rem;
	}

	.case__h {
		font-size: var(--text-md);
		font-weight: 600;
		margin: 0;
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 0.5rem;
	}

	.case__area {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink-2);
	}

	.case__rows {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}

	.case__row {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		font-size: var(--text-sm);
		padding-bottom: 0.3rem;
		border-bottom: 1px solid var(--border);
	}

	.case__row dt {
		color: var(--ink-3);
	}

	.case__row dd {
		margin: 0;
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		text-align: right;
	}

	.case__sub {
		color: var(--ink-3);
		font-weight: 400;
	}

	.case__take {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-list);
	}

	.cases__disclaimer {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
	}

	@media (max-width: 720px) {
		.cases__grid {
			grid-template-columns: 1fr;
		}
	}
</style>
