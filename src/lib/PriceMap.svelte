<script lang="ts">
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { copy } from '$lib/copy/fi';

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
	// Tap-to-pin panel for coarse-pointer devices, where the mousemove
	// tooltip never fires. A tap pins the area's numbers to a fixed panel.
	let pinned: { pc: string; nimi: string; eur: number | null; n: number } | null = $state(null);
	let clearPin: () => void = () => (pinned = null);

	// Single-hue ink ramp (publication palette), white→black = cheap→expensive.
	// Lightness-monotonic and CVD-safe (single hue — discrimination is lightness only).
	// Endpoints match the editorial palette: paper (#ffffff) to ink (#0a0a0a).
	const RAMP = ['#ffffff', '#dad6cb', '#b1ab99', '#857c66', '#534a39', '#0a0a0a'];
	const BREAKS = [800, 1450, 2200, 3400, 5700];
	const fmt = new Intl.NumberFormat('fi-FI');

	onMount(() => {
		let map: import('maplibre-gl').Map | undefined;
		(async () => {
			const maplibregl = (await import('maplibre-gl')).default;
			map = new maplibregl.Map({
				container,
				style: 'https://tiles.openfreemap.org/styles/dark',
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
				// Bright on dark basemap so even the darkest (most expensive) cells have a
				// visible border per the user instruction: 'most expensive spots according
				// to the colour theme' stays ink, but every cell gets a bright outline.
				map.addLayer({
					id: 'price-halo',
					type: 'line',
					source: 'prices',
					filter: ['!=', ['get', 'eur'], null],
					paint: { 'line-color': '#ffffff', 'line-opacity': 0.5, 'line-width': 0.6 }
				});
				map.addLayer({
					id: 'price-outline',
					type: 'line',
					source: 'prices',
					filter: ['!=', ['get', 'eur'], null],
					paint: { 'line-color': '#fafaf7', 'line-opacity': 0.85, 'line-width': 1 }
				});
				map.addLayer({
					id: 'price-nodata',
					type: 'line',
					source: 'prices',
					filter: ['==', ['get', 'eur'], null],
					paint: { 'line-color': '#aaaaaa', 'line-opacity': 0.55, 'line-width': 0.8, 'line-dasharray': [2, 2] }
				});
				if (marker) {
					new maplibregl.Marker({ color: '#fafaf7' }).setLngLat(marker).addTo(map);
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

				const coarse = window.matchMedia('(hover: none), (pointer: coarse)').matches;
				let pinnedId: string | null = null;
				clearPin = () => {
					if (map && pinnedId !== null)
						map.setFeatureState({ source: 'prices', id: pinnedId }, { hover: false });
					pinnedId = null;
					pinned = null;
				};
				map.on('click', 'price-fill', (e) => {
					if (!map) return;
					const f = e.features?.[0];
					if (!f) return;
					if (coarse) {
						// Pin instead of navigating: touch users need to read the
						// numbers first; the panel's own button triggers onareaclick.
						clearPin();
						pinnedId = f.properties.pc;
						if (pinnedId !== null)
							map.setFeatureState({ source: 'prices', id: pinnedId }, { hover: true });
						pinned = {
							pc: f.properties.pc, nimi: f.properties.nimi,
							eur: f.properties.eur, n: f.properties.n
						};
					} else if (onareaclick) {
						onareaclick(f.properties.pc);
					}
				});
				map.on('click', (e) => {
					if (!map || !pinned) return;
					const hits = map.queryRenderedFeatures(e.point, { layers: ['price-fill'] });
					if (hits.length === 0) clearPin();
				});
			});
		})();
		return () => map?.remove();
	});
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && pinned) clearPin(); }} />

<div class="mapwrap" style="--h: {height}">
	<div class="map" bind:this={container}></div>
	{#if hover && !pinned}
		<div class="tooltip" style="left: {hover.x + 12}px; top: {hover.y + 12}px">
			<b>{hover.pc} {hover.nimi}</b><br />
			{#if hover.eur}{fmt.format(hover.eur)} €/m² <span>· {hover.n} kauppaa/4 nelj.</span>
			{:else}ei julkaistua hintaa{/if}
		</div>
	{/if}
	{#if pinned}
		<div class="panel" role="status">
			<button class="panel__close" type="button" aria-label={copy.kartta.panelClose} onclick={() => clearPin()}>×</button>
			<b>{pinned.pc} {pinned.nimi}</b>
			{#if pinned.eur}
				<span class="panel__price">{fmt.format(pinned.eur)} €/m² <span class="panel__sub">· {pinned.n} kauppaa/4 nelj.</span></span>
			{:else}
				<span class="panel__sub">ei julkaistua hintaa</span>
			{/if}
			{#if onareaclick && pinned.eur}
				<button class="panel__use" type="button" onclick={() => { const pc = pinned?.pc; if (pc) onareaclick?.(pc); }}>
					{copy.kartta.panelUse}
				</button>
			{/if}
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
	.panel {
		position: absolute;
		top: 0.75rem;
		left: 0.75rem;
		/* Clear of the top-right nav control and the bottom-left legend. */
		max-width: min(18rem, calc(100% - 5.5rem));
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		background: var(--surface);
		border: 1px solid var(--border);
		color: var(--ink);
		padding: 0.7rem 2.6rem 0.7rem 0.8rem;
		font-size: var(--text-sm);
		font-variant-numeric: tabular-nums;
		line-height: var(--lh-snug);
		box-shadow: 0 2px 8px rgb(0 0 0 / 0.12);
		z-index: 6;
	}
	.panel b {
		font-weight: 600;
	}
	.panel__price {
		color: var(--ink);
	}
	.panel__sub {
		color: var(--ink-2);
	}
	.panel__close {
		position: absolute;
		top: 0;
		right: 0;
		width: 44px;
		height: 44px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--ink-2);
		font-size: 1.3rem;
		line-height: 1;
		cursor: pointer;
	}
	.panel__use {
		margin-top: 0.25rem;
		align-self: flex-start;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0.5rem 0.9rem;
		background: var(--brand);
		color: var(--brand-ink);
		border: none;
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 500;
		cursor: pointer;
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
