<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import { copy } from '$lib/copy/fi';
</script>

<svelte:head>
	<title>Tietosuojaseloste | RehtiArvio</title>
	<meta name="description" content="RehtiArvion tietosuojaseloste: mitä tietoa kerätään, miksi, ja miten käytät oikeuksiasi." />
</svelte:head>

<div class="page">
	<PageHero h1={copy.tietosuoja.h1} lede={copy.tietosuoja.lede} />
	<p class="updated">{copy.tietosuoja.updated}</p>

	<section class="section">
		<h2>{copy.tietosuoja.controllerTitle}</h2>
		<p>{copy.tietosuoja.controllerBody}</p>
	</section>

	<section class="section">
		<h2>{copy.tietosuoja.whatTitle}</h2>
		<dl class="deflist">
			{#each copy.tietosuoja.whatRows as row (row.name)}
				<div class="deflist__row">
					<dt>{row.name} <span class="deflist__basis">— {row.basis}</span></dt>
					<dd>{row.desc}</dd>
				</div>
			{/each}
		</dl>
	</section>

	<section class="section">
		<h2>{copy.tietosuoja.retentionTitle}</h2>
		<p>{copy.tietosuoja.retentionNote}</p>
	</section>

	<section class="section">
		<h2>{copy.tietosuoja.recipientsTitle}</h2>
		<ul>
			{#each copy.tietosuoja.recipients as r (r)}
				<li>{r}</li>
			{/each}
		</ul>
	</section>

	<section class="section">
		<h2>{copy.tietosuoja.transfersTitle}</h2>
		<p>{copy.tietosuoja.transfersBody}</p>
	</section>

	<section class="section">
		<h2>{copy.tietosuoja.rightsTitle}</h2>
		<p>{copy.tietosuoja.rightsBody}</p>
	</section>

	<section class="section">
		<h2>{copy.tietosuoja.automatedTitle}</h2>
		<p>{copy.tietosuoja.automatedBody}</p>
	</section>

	<p class="cookies-link"><a href="/evasteet">{copy.tietosuoja.cookiesLink}</a></p>
</div>

<style>
	.page {
		max-width: var(--container-prose);
		display: flex;
		flex-direction: column;
		gap: var(--space-7);
	}

	.updated {
		margin: calc(var(--space-7) * -1) 0 0;
		color: var(--ink-3);
		font-size: var(--text-xs);
	}

	.section h2 {
		font-size: var(--text-xl);
		font-weight: 600;
		margin: 0 0 var(--space-3);
	}

	.section p,
	.section li {
		color: var(--ink-2);
		line-height: var(--lh-body);
	}

	.section ul {
		margin: 0;
		padding-left: 1.2rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.deflist {
		display: flex;
		flex-direction: column;
		gap: var(--space-5);
		margin: 0;
	}

	.deflist__row dt {
		color: var(--ink);
		font-weight: 600;
	}

	.deflist__basis {
		color: var(--ink-3);
		font-weight: 400;
		font-size: var(--text-sm);
	}

	.deflist__row dd {
		margin: 0.25rem 0 0;
		color: var(--ink-2);
		line-height: var(--lh-body);
	}

	.cookies-link {
		margin: 0;
	}
</style>
