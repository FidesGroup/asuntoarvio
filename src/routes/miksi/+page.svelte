<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import MethodBlock from '$lib/components/sections/MethodBlock.svelte';
	import { copy } from '$lib/copy/fi';

	let { data } = $props();
</script>

<svelte:head>
	<title>Miksi RehtiArvio? | RehtiArvio</title>
	<meta name="description" content="Miten RehtiArvio toimii, mistä hinnat tulevat ja mitä työkalu ei tee." />
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