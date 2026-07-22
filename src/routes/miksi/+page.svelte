<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import MethodBlock from '$lib/components/sections/MethodBlock.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { data } = $props();
</script>

<svelte:head>
	<title>Miksi RehtiArvio? | RehtiArvio</title>
	<meta name="description" content="Miten RehtiArvio toimii, mistä hinnat tulevat ja mitä työkalu ei tee." />
	<meta property="og:title" content="Miksi RehtiArvio? | RehtiArvio" />
	<meta property="og:description" content="Miten RehtiArvio toimii, mistä hinnat tulevat ja mitä työkalu ei tee." />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE_URL}/miksi`} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Miksi RehtiArvio? | RehtiArvio" />
	<meta name="twitter:description" content="Miten RehtiArvio toimii, mistä hinnat tulevat ja mitä työkalu ei tee." />
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