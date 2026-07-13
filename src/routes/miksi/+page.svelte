<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import MethodBlock from '$lib/components/sections/MethodBlock.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<title>Miksi RehtiArvio? | RehtiArvio</title>
	<meta name="description" content="Miten RehtiArvio toimii, mistä data tulee, ja mitä työkalu ei tee." />
</svelte:head>

<PageHero h1="Toteutuneet hinnat, ei markkinahypetystä." lede="Fides Groupin ilmainen työkalu. Data Tilastokeskukselta, ei mainoksia." />

<MethodBlock cover={data.count} />