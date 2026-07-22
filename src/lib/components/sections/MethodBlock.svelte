<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	let { cover = 1724 }: { cover?: number } = $props();
</script>

<div class="miksi" use:inview>
	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.dataTitle}</h2>{/snippet}
		<p class="intro">{copy.miksi.dataIntro}</p>
		<table class="src">
			<thead>
				<tr><th>Asuntotyyppi</th><th>Mitä vertaamme</th></tr>
			</thead>
			<tbody>
				{#each copy.miksi.dataRows as r (r.code)}
					<tr><td class="src__code">{r.code}</td><td>{r.desc}</td></tr>
				{/each}
			</tbody>
		</table>
		<p class="note">{copy.miksi.dataNote}</p>
	</Card>

	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.howTitle}</h2>{/snippet}
		<ol class="steps">
			{#each copy.miksi.howSteps as s, i (i)}
				<li>{s}</li>
			{/each}
		</ol>
		<p class="note">{copy.miksi.howFallback}</p>
	</Card>

	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.dontTitle}</h2>{/snippet}
		<ul class="dont">
			{#each copy.miksi.dontItems as item (item)}
				<li>{item}</li>
			{/each}
		</ul>
	</Card>

	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.tierTitle}</h2>{/snippet}
		<dl class="tiers">
			{#each copy.miksi.tiers as t (t.name)}
				<div class="tier">
					<dt>{t.name}</dt>
					<dd>{t.desc}</dd>
				</div>
			{/each}
		</dl>
	</Card>

	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.metricsTitle}</h2>{/snippet}
		<p class="intro">{copy.miksi.metricsIntro}</p>
		<dl class="tiers">
			{#each copy.miksi.metrics as t (t.name)}
				<div class="tier">
					<dt>{t.name}</dt>
					<dd>{t.desc}</dd>
				</div>
			{/each}
		</dl>
	</Card>

	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.limitsTitle}</h2>{/snippet}
		<p class="intro">{copy.miksi.limitsIntro}</p>
		<ul class="dont">
			{#each copy.miksi.limits as item (item)}
				<li>{item}</li>
			{/each}
		</ul>
	</Card>

	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.coverageTitle}</h2>{/snippet}
		<p class="coverage">{copy.miksi.coverageCount(cover)} <a href="/kartta">Avaa kartta →</a></p>
	</Card>

	<Card>
		{#snippet header()}<h2 class="h2">{copy.miksi.faqTitle}</h2>{/snippet}
		<dl class="faq">
			{#each copy.miksi.faq as item (item.q)}
				<div class="faq__item">
					<dt>{item.q}</dt>
					<dd>{item.a}</dd>
				</div>
			{/each}
		</dl>
	</Card>
</div>

<style>
	.miksi {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
	}

	.h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.src {
		width: 100%;
		border-collapse: collapse;
		font-size: var(--text-sm);
	}

	.src th, .src td {
		text-align: left;
		padding: 0.6rem 0.5rem;
		border-bottom: 1px solid var(--border);
		vertical-align: top;
	}

	.src th {
		font-weight: 600;
		color: var(--ink-2);
		font-size: var(--text-xs);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.src__code {
		font-weight: 600;
		color: var(--brand);
	}

	.intro {
		margin: 0 0 0.85rem;
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
	}

	.note {
		margin: 0.85rem 0 0;
		font-size: var(--text-sm);
		color: var(--ink-3);
		line-height: var(--lh-list);
	}

	.steps {
		margin: 0;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		color: var(--ink-2);
		line-height: var(--lh-body);
	}

	.steps li::marker {
		color: var(--brand);
		font-weight: 600;
	}

	.dont {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.dont li {
		font-size: var(--text-md);
		line-height: var(--lh-list);
		color: var(--ink-2);
		padding-left: 1.5rem;
		position: relative;
	}

	.dont li::before {
		content: '−';
		position: absolute;
		left: 0;
		top: 0;
		color: var(--ink-3);
		font-weight: 600;
	}

	.tiers {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
		gap: 0.85rem;
		margin: 0;
	}

	.tier {
		background: var(--surface-tint);
		padding: 0.9rem 1rem;
		border-radius: var(--radius-md);
	}

	.tier dt {
		font-weight: 600;
		color: var(--brand);
		margin: 0 0 0.3rem;
	}

	.tier dd {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-list);
	}

	.coverage {
		margin: 0;
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
	}

	.faq {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin: 0;
	}

	.faq__item dt {
		font-weight: 600;
		color: var(--ink);
		margin: 0 0 0.3rem;
	}

	.faq__item dd {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-list);
	}

</style>