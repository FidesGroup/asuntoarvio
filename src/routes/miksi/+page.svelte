<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import MethodBlock from '$lib/components/sections/MethodBlock.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { data } = $props();

	const faqLd = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: copy.miksi.faq.map((item) => ({
			'@type': 'Question',
			name: item.q,
			acceptedAnswer: { '@type': 'Answer', text: item.a }
		}))
	};
</script>

<svelte:head>
	<title>Miksi RehtiArvio? | RehtiArvio</title>
	<meta name="description" content="Mistä hinnat tulevat, miten vertailu toimii ja mitä emme edes yritä tehdä. Suoraan puhuttuna." />
	<meta property="og:title" content="Miksi RehtiArvio? | RehtiArvio" />
	<meta property="og:description" content="Mistä hinnat tulevat, miten vertailu toimii ja mitä emme edes yritä tehdä. Suoraan puhuttuna." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE_URL}/miksi`} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Miksi RehtiArvio? | RehtiArvio" />
	<meta name="twitter:description" content="Mistä hinnat tulevat, miten vertailu toimii ja mitä emme edes yritä tehdä. Suoraan puhuttuna." />
	{@html `<script type="application/ld+json">${JSON.stringify(faqLd)}<\/script>`}
</svelte:head>

<div class="page">
	<PageHero h1={copy.miksi.h1} lede={copy.miksi.lede} />
	<MethodBlock cover={data.count} />
</div>

<style>
	.page {
		max-width: var(--container-prose);
		display: flex;
		flex-direction: column;
	}
</style>