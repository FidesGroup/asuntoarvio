<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import PricingTable from '$lib/components/sections/PricingTable.svelte';
	import { copy } from '$lib/copy/fi';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Tilaa | RehtiArvio</title>
	<meta name="description" content={copy.tilaa.lede} />
</svelte:head>

<PageHero h1={copy.tilaa.h1} lede={copy.tilaa.lede} />

<PricingTable enabled={data.enabled} {form} />