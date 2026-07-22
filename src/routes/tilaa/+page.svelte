<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import PricingTable from '$lib/components/sections/PricingTable.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Tilaa | RehtiArvio</title>
	<meta name="description" content={copy.tilaa.lede} />
	<meta property="og:title" content="Tilaa | RehtiArvio" />
	<meta property="og:description" content={copy.tilaa.lede} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={`${SITE_URL}/tilaa`} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="Tilaa | RehtiArvio" />
	<meta name="twitter:description" content={copy.tilaa.lede} />
</svelte:head>

<PageHero h1={copy.tilaa.h1} lede={copy.tilaa.lede} />

<PricingTable enabled={data.enabled} {form} />