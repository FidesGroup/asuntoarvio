<script lang="ts">
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';

	let {
		center = [25.5, 62.6] as [number, number],
		zoom = 4.6,
		height = 'min(72vh, 640px)',
		marker = null as [number, number] | null,
		showLegend = true,
		onareaclick = null as ((pc: string) => void) | null
	} = $props();

	let container: HTMLDivElement;
	let hover: { pc: string; nimi: string; eur: number | null; n: number; x: number; y: number } | null =
		$state(null);

	// Single-hue Baltic petrol ramp (matches --brand / MiniMap hero), white→petrol = cheap→expensive.
	// Steps mix #0f6a78 into white at 0/18/38/58/78/100% (component-wise sRGB), mirroring MiniMap's ramp.
	// L (0.299R+0.587G+0.114B): 255 → 223.5 → 188.5 → 154.1 → 119.0 → 80.4, ~31-39pt gaps.
	// Still lightness-monotonic and CVD-safe (single hue — discrimination is lightness-only).
	const RAMP = ['#ffffff', '#d4e4e7', '#a4c6cc', '#74a9b1', '#448b96', '#0f6a78'];
	const BREAKS = [800, 1450, 2200, 3400, 5700];
	const fmt = new Intl.NumberFormat('fi-FI');

	onMount(() => {
		let map: import('maplibre-gl').Map | undefined;
		(async () => {
			const maplibregl = (await import('maplibre-gl')).default;
			map = new maplibregl.Map({
				container,
				style: 'https://tiles.openfreemap.org/styles/positron',
				center,
				zoom,
				attributionControl: { compact: true }
			});
			map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

			map.on('load', () => {
				if (!map) return;
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
						'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 1, 0.92]
					}
				});
				// White halo separator — thin line underneath to crisp up every polygon edge.
				map.addLayer({
					id: 'price-halo',
					type: 'line',
					source: 'prices',
					filter: ['!=', ['get', 'eur'], null],
					paint: { 'line-color': '#ffffff', 'line-opacity': 0.9, 'line-width': 0.6 }
				});
				map.addLayer({
					id: 'price-outline',
					type: 'line',
					source: 'prices',
					filter: ['!=', ['get', 'eur'], null],
					paint: { 'line-color': '#0a0a0a', 'line-opacity': 0.85, 'line-width': 1 }
				});
				map.addLayer({
					id: 'price-nodata',
					type: 'line',
					source: 'prices',
					filter: ['==', ['get', 'eur'], null],
					paint: { 'line-color': '#666666', 'line-opacity': 0.6, 'line-width': 0.8, 'line-dasharray': [2, 2] }
				});
				if (marker) {
					new maplibregl.Marker({ color: '#0a0a0a' }).setLngLat(marker).addTo(map);
				}

				let hoveredId: string | null = null;
				map.on('mousemove', 'price-fill', (e) => {
					if (!map) return;
					const f = e.features?.[0];
					if (!f) return;
				if (hoveredId !== null) map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: false });
				hoveredId = f.properties.pc;
				if (hoveredId !== null) map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: true });
					hover = {
						pc: f.properties.pc, nimi: f.properties.nimi,
						eur: f.properties.eur, n: f.properties.n,
						x: e.point.x, y: e.point.y
					};
					map.getCanvas().style.cursor = onareaclick ? 'pointer' : '';
				});
				map.on('mouseleave', 'price-fill', () => {
					if (!map) return;
					if (hoveredId !== null) map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: false });
					hoveredId = null;
					hover = null;
					map.getCanvas().style.cursor = '';
				});
				if (onareaclick) {
					map.on('click', 'price-fill', (e) => {
						const pc = e.features?.[0]?.properties.pc;
						if (pc) onareaclick(pc);
					});
				}
			});
		})();
		return () => map?.remove();
	});
</script>

<div class="mapwrap" style="--h: {height}">
	<div class="map" bind:this={container}></div>
	{#if hover}
		<div class="tooltip" style="left: {hover.x + 12}px; top: {hover.y + 12}px">
			<b>{hover.pc} {hover.nimi}</b><br />
			{#if hover.eur}{fmt.format(hover.eur)} €/m² <span>· {hover.n} kauppaa/4 nelj.</span>
			{:else}ei julkaistua hintaa{/if}
		</div>
	{/if}
	{#if showLegend}
		<div class="legend" aria-label="Värilegenda: euroa per neliömetri">
			<span class="title">€/m²</span>
			{#each RAMP as color (color)}<span class="swatch" style="background:{color}"></span>{/each}
			<span class="lab">&lt;800</span><span class="lab mid">2 200</span><span class="lab">&gt;5 700</span>
		</div>
	{/if}
</div>

<style>
	.mapwrap {
		position: relative;
		border: 1px solid var(--border);
	}
	.map {
		height: var(--h);
		width: 100%;
	}
	.tooltip {
		position: absolute;
		pointer-events: none;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--ink);
		padding: 0.4rem 0.6rem;
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
		line-height: var(--lh-body);
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
		border: 1px solid var(--border);
		padding: 0.45rem 0.6rem;
		display: grid;
		grid-template-columns: repeat(6, 1.4rem);
		gap: 2px;
		font-size: var(--text-xs);
		letter-spacing: var(--ls-wide);
		color: var(--ink-2);
	}
	.legend .title {
		grid-column: 1 / -1;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--ink);
	}
	.swatch {
		height: 0.7rem;
		border: 1px solid #0a0a0a;
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
