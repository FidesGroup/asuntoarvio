<script lang="ts">
	import { goto } from '$app/navigation';
	import PriceMap from '$lib/PriceMap.svelte';
</script>

<svelte:head>
	<title>Hintakartta | RehtiArvio by Fides</title>
	<meta
		name="description"
		content="Koko Suomen toteutuneet kerrostaloasuntojen neliöhinnat postinumeroalueittain kartalla. Lähde: Tilastokeskus."
	/>
</svelte:head>

<section class="intro">
	<span class="eyebrow">Hintakartta</span>
	<h1>Toteutuneet neliöhinnat postinumeroalueittain</h1>
	<p class="lede">
		Kerrostaloasuntojen toteutuneiden kauppojen keskineliöhinta postinumeroalueittain, painotettuna
		neljän viimeisimmän tilastoneljänneksen kaupoilla. Klikkaa aluetta esitäyttääksesi vertailun.
		Kartan vaaleat ääriviiva-alueet ovat postinumeroita, joilta Tilastokeskus ei julkaise hintaa
		(alle tilastointirajan kauppoja).
	</p>
</section>

<div class="map-shell">
	<PriceMap onareaclick={(pc) => goto(`/?pc=${pc}`)} />
</div>

<style>
	.intro {
		margin-bottom: 1.75rem;
		max-width: 44rem;
	}
	.eyebrow {
		display: inline-block;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-2);
		letter-spacing: var(--ls-wide);
		background: var(--chip-bg);
		padding: 0.35rem 0.7rem;
		border-radius: var(--radius-pill);
		margin-bottom: 1.1rem;
	}
	.intro h1 {
		font-size: var(--text-2xl);
		letter-spacing: var(--ls-tight);
		margin: 0 0 0.75rem;
		font-weight: 600;
		max-width: 36rem;
		text-wrap: balance;
		line-height: var(--lh-snug);
	}
	.intro .lede {
		color: var(--ink-2);
		max-width: 44rem;
		margin: 0;
		font-size: var(--text-md);
		line-height: var(--lh-body);
	}

	.map-shell {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		overflow: hidden;
		box-shadow: var(--shadow-md);
	}
</style>
