<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let container: HTMLDivElement;
	let hover: { pc: string; nimi: string; eur: number | null; n: number; x: number; y: number } | null =
		$state(null);

	// Sequential petrol ramp, light→dark = cheap→expensive (lightness-monotonic).
	// Breaks ≈ national quantiles p5/p25/p50/p75/p95 of area means.
	const RAMP = ['#d9ecee', '#a8d2d8', '#74b5bf', '#4295a3', '#1d7386', '#0b4f5c'];
	const BREAKS = [800, 1450, 2200, 3400, 5700];
	const fmt = new Intl.NumberFormat('fi-FI');

	onMount(async () => {
		const maplibregl = (await import('maplibre-gl')).default;
		const map = new maplibregl.Map({
			container,
			style: 'https://tiles.openfreemap.org/styles/positron',
			center: [25.5, 62.6],
			zoom: 4.6,
			attributionControl: { compact: true }
		});
		map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

		map.on('load', () => {
			map.addSource('prices', { type: 'geojson', data: '/map-data.geojson', promoteId: 'pc' });

			map.addLayer({
				id: 'price-fill',
				type: 'fill',
				source: 'prices',
				filter: ['!=', ['get', 'eur'], null],
				paint: {
					'fill-color': [
						'step', ['get', 'eur'],
						RAMP[0], BREAKS[0], RAMP[1], BREAKS[1], RAMP[2], BREAKS[2], RAMP[3], BREAKS[3], RAMP[4], BREAKS[4], RAMP[5]
					],
					'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, 0.75]
				}
			});
			// no published price: hollow with a faint outline, clearly "no data" not "cheap"
			map.addLayer({
				id: 'price-nodata',
				type: 'line',
				source: 'prices',
				filter: ['==', ['get', 'eur'], null],
				paint: { 'line-color': '#9aacaf', 'line-opacity': 0.25, 'line-width': 0.4 }
			});
			map.addLayer({
				id: 'price-outline',
				type: 'line',
				source: 'prices',
				filter: ['!=', ['get', 'eur'], null],
				paint: { 'line-color': '#0b4f5c', 'line-opacity': 0.35, 'line-width': 0.5 }
			});

			let hoveredId: string | null = null;
			map.on('mousemove', 'price-fill', (e) => {
				const f = e.features?.[0];
				if (!f) return;
				if (hoveredId !== null) map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: false });
				hoveredId = f.properties.pc;
				map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: true });
				hover = {
					pc: f.properties.pc,
					nimi: f.properties.nimi,
					eur: f.properties.eur,
					n: f.properties.n,
					x: e.point.x,
					y: e.point.y
				};
				map.getCanvas().style.cursor = 'pointer';
			});
			map.on('mouseleave', 'price-fill', () => {
				if (hoveredId !== null) map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: false });
				hoveredId = null;
				hover = null;
				map.getCanvas().style.cursor = '';
			});
			map.on('click', 'price-fill', (e) => {
				const pc = e.features?.[0]?.properties.pc;
				if (pc) goto(`/?pc=${pc}`);
			});
		});
		return () => map.remove();
	});
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

<div class="mapwrap">
	<div class="map" bind:this={container}></div>
	{#if hover}
		<div class="tooltip" style="left: {hover.x + 12}px; top: {hover.y + 12}px">
			<b>{hover.pc} {hover.nimi}</b><br />
			{#if hover.eur}{fmt.format(hover.eur)} €/m² <span>· {hover.n} kauppaa/4 nelj.</span>
			{:else}ei julkaistua hintaa{/if}
		</div>
	{/if}
	<div class="legend" aria-label="Värilegenda: euroa per neliömetri">
		<span class="title">€/m²</span>
		{#each RAMP as color, i (color)}
			<span class="swatch" style="background:{color}"></span>
		{/each}
		<span class="lab">&lt;800</span><span class="lab mid">2 200</span><span class="lab">&gt;5 700</span>
	</div>
</div>

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
	.mapwrap {
		position: relative;
		border: 1px solid var(--line);
	}
	.map {
		height: min(72vh, 640px);
		width: 100%;
	}
	.tooltip {
		position: absolute;
		pointer-events: none;
		background: var(--surface);
		border: 1px solid var(--line);
		color: var(--ink);
		padding: 0.4rem 0.6rem;
		font-size: 0.8rem;
		font-variant-numeric: tabular-nums;
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.12);
		z-index: 5;
		max-width: 16rem;
	}
	.tooltip span {
		color: var(--ink-2);
	}
	.legend {
		position: absolute;
		left: 0.75rem;
		bottom: 0.75rem;
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 0.45rem 0.6rem;
		display: grid;
		grid-template-columns: repeat(6, 1.4rem);
		gap: 2px;
		font-size: 0.65rem;
		color: var(--ink-2);
	}
	.legend .title {
		grid-column: 1 / -1;
		font-weight: 700;
		color: var(--ink);
	}
	.swatch {
		height: 0.7rem;
	}
	.lab {
		grid-row: 3;
	}
	.lab.mid {
		grid-column: 3 / 5;
		text-align: center;
	}
	.lab:first-of-type {
		grid-column: 1 / 3;
	}
	.lab:last-of-type {
		grid-column: 5 / 7;
		text-align: right;
	}
</style>
