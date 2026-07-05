<script lang="ts">
	import { goto } from '$app/navigation';
	import PriceMap from '$lib/PriceMap.svelte';
</script>

<svelte:head>
	<title>Hintakartta — RehtiArvio by Fides</title>
	<meta
		name="description"
		content="Koko Suomen toteutuneet kerrostaloasuntojen neliöhinnat postinumeroalueittain kartalla. Lähde: Tilastokeskus."
	/>
</svelte:head>

<section class="intro">
	<p class="eyebrow">Hintakartta</p>
	<h1>Toteutuneet neliöhinnat postinumeroalueittain</h1>
	<p class="lede">
		Kerrostaloasuntojen toteutuneiden kauppojen keskineliöhinta postinumeroalueittain, painotettuna
		neljän viimeisimmän tilastoneljänneksen kaupoilla. Klikkaa aluetta esitäyttääksesi vertailun.
		Kartan vaaleat ääriviiva-alueet ovat postinumeroita, joilta Tilastokeskus ei julkaise hintaa
		(alle tilastointirajan kauppoja).
	</p>
</section>

<PriceMap onareaclick={(pc) => goto(`/?pc=${pc}`)} />

<style>
	.intro {
		margin-bottom: 1.25rem;
	}
	.eyebrow {
		color: var(--ink-2);
		font-size: 0.72rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.18em;
		margin: 0 0 0.55rem;
	}
	.intro h1 {
		font-size: 1.8rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.6rem;
		font-weight: 700;
		max-width: 36rem;
		text-wrap: balance;
	}
	.intro .lede {
		color: var(--ink-2);
		max-width: 44rem;
		margin: 0 0 1.25rem;
		font-size: 0.98rem;
		line-height: 1.6;
	}
	@media (max-width: 720px) {
		.intro h1 {
			font-size: 1.5rem;
		}
		.intro .lede {
			font-size: 0.95rem;
		}
	}
</style>
