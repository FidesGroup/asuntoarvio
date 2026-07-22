<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { data } = $props();
	const fmt = new Intl.NumberFormat('fi-FI');
</script>

<svelte:head>
	<title>{copy.kaupunki.indexMetaTitle}</title>
	<meta name="description" content={copy.kaupunki.indexMetaDescription} />
	<meta property="og:title" content={copy.kaupunki.indexMetaTitle} />
	<meta property="og:description" content={copy.kaupunki.indexMetaDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE_URL}/kaupunki`} />
	<meta name="twitter:card" content="summary" />
</svelte:head>

<PageHero eyebrow={copy.kaupunki.indexEyebrow} h1={copy.kaupunki.indexH1} lede={copy.kaupunki.indexLede} />

<ul class="towns">
	{#each data.towns as t (t.slug)}
		<li>
			<a class="towns__link" href={`/kaupunki/${t.slug}`}>
				<span class="towns__name">{t.town}</span>
				<span class="towns__stat num">{fmt.format(t.medianEurM2)} €/m² · {t.areaCount} aluetta</span>
			</a>
		</li>
	{/each}
</ul>

<style>
	.towns {
		list-style: none;
		margin: 0;
		padding: 0;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(15rem, 1fr));
		gap: 0.5rem;
	}

	.towns__link {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		padding: 0.75rem 0.9rem;
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		text-decoration: none;
		color: var(--ink);
		min-height: 44px;
		justify-content: center;
		transition: background var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
	}

	.towns__link:hover {
		background: var(--surface-tint);
		border-color: var(--border-2);
	}

	.towns__name {
		font-weight: 600;
	}

	.towns__stat {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
</style>
