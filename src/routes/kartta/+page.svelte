<script lang="ts">
	import { goto } from '$app/navigation';
	import PriceMap from '$lib/PriceMap.svelte';
</script>

<svelte:head>
	<title>Hintakartta — Asuntoarvio</title>
	<meta
		name="description"
		content="Koko Suomen toteutuneet kerrostaloasuntojen neliöhinnat postinumeroalueittain kartalla. Lähde: Tilastokeskus."
	/>
</svelte:head>

<section class="intro">
	<h1>Toteutuneet neliöhinnat — koko Suomi</h1>
	<p>
		Kerrostaloasuntojen toteutuneiden kauppojen keskineliöhinta postinumeroalueittain, painotettu
		neljän viimeisimmän tilastoneljänneksen kaupoilla. Klikkaa aluetta esitäyttääksesi vertailun.
		Vaaleat ääriviiva-alueet: Tilastokeskus ei julkaise hintaa (alle tilastointirajan kauppoja).
	</p>
</section>

<PriceMap onareaclick={(pc) => goto(`/?pc=${pc}`)} />

<style>
	.intro h1 {
		font-size: 1.7rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.5rem;
	}
	.intro p {
		color: var(--ink-2);
		max-width: 42rem;
		margin: 0 0 1.25rem;
	}
</style>
