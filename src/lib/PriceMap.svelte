<script lang="ts">
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { copy } from '$lib/copy/fi';
	import type { MapMode } from '$lib/map-modes';

	let {
		center = [25.5, 62.6] as [number, number],
		zoom = 4.6,
		height = 'min(72vh, 640px)',
		marker = null as [number, number] | null,
		showLegend = true,
		mode = 'eur' as MapMode,
		onareaclick = null as ((pc: string) => void) | null
	} = $props();

	let container: HTMLDivElement;

	interface AreaProps {
		pc: string;
		nimi: string;
		eur: number | null;
		n: number;
		chg: number | null;
		yld: number | null;
		pir: number | null;
		liq: number | null;
	}
	let hover: { p: AreaProps; x: number; y: number } | null = $state(null);
	// Tap-to-pin panel for coarse-pointer devices, where the mousemove
	// tooltip never fires. A tap pins the area's numbers to a fixed panel.
	let pinned: AreaProps | null = $state(null);
	let clearPin: () => void = () => (pinned = null);

	const fmt = new Intl.NumberFormat('fi-FI');
	const fmt1 = new Intl.NumberFormat('fi-FI', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
	const signed = (v: number) => `${v > 0 ? '+' : ''}${fmt1.format(v)}`;

	/**
	 * All ramps are ColorBrewer 6-class schemes (lightness-monotonic and
	 * CVD-validated per ColorBrewer — rule 10: never eyeball replacements).
	 * eur keeps the classic YlOrRd choropleth (owner decision 2026-07-14);
	 * chg is diverging RdBu around 0 (red = falling, blue = rising);
	 * the rest are sequential. Breaks were set from the observed
	 * distribution quantiles printed by scripts/enrich-map-data.mts.
	 * eur BREAKS must keep matching BAND_BREAKS in marketstats.ts.
	 */
	const MODES: Record<
		MapMode,
		{
			prop: string;
			ramp: string[];
			breaks: number[];
			legendTitle: string;
			labels: [string, string, string];
			line: (p: AreaProps) => string | null;
		}
	> = {
		eur: {
			prop: 'eur',
			ramp: ['#ffffb2', '#fed976', '#feb24c', '#fd8d3c', '#f03b20', '#bd0026'],
			breaks: [800, 1450, 2200, 3400, 5700],
			legendTitle: '€/m²',
			labels: ['<800', '2 200', '>5 700'],
			line: (p) => (p.eur === null ? null : `${fmt.format(p.eur)} €/m²`)
		},
		chg: {
			prop: 'chg',
			ramp: ['#b2182b', '#ef8a62', '#fddbc7', '#d1e5f0', '#67a9cf', '#2166ac'],
			breaks: [-10, -5, 0, 5, 10],
			legendTitle: copy.kartta.modes.chg,
			labels: ['<−10 %', '0', '>+10 %'],
			line: (p) => (p.chg === null ? null : `${signed(p.chg)} % / 12 kk`)
		},
		yld: {
			prop: 'yld',
			ramp: ['#ffffcc', '#c7e9b4', '#7fcdbb', '#41b6c4', '#2c7fb8', '#253494'],
			breaks: [5, 6.5, 8, 10, 12],
			legendTitle: copy.kartta.modes.yld,
			labels: ['<5 %', '8 %', '>12 %'],
			line: (p) => (p.yld === null ? null : `${fmt1.format(p.yld)} % ${copy.kartta.modeUnits.yld}`)
		},
		pir: {
			prop: 'pir',
			ramp: ['#feebe2', '#fcc5c0', '#fa9fb5', '#f768a1', '#c51b8a', '#7a0177'],
			breaks: [2.5, 4, 5.5, 7, 9],
			legendTitle: copy.kartta.modes.pir,
			labels: ['<2,5', '5,5', '>9'],
			line: (p) => (p.pir === null ? null : `${fmt1.format(p.pir)} ${copy.kartta.modeUnits.pir}`)
		},
		liq: {
			prop: 'liq',
			ramp: ['#f2f0f7', '#dadaeb', '#bcbddc', '#9e9ac8', '#756bb1', '#54278f'],
			breaks: [3, 6, 12, 20, 30],
			legendTitle: copy.kartta.modes.liq,
			labels: ['<3', '12', '>30'],
			line: (p) => (p.liq === null ? null : `${fmt1.format(p.liq)} ${copy.kartta.modeUnits.liq}`)
		}
	};
	const modeCfg = $derived(MODES[mode]);

	function fillColor(m: MapMode): unknown {
		const c = MODES[m];
		const step: unknown[] = ['step', ['get', c.prop], c.ramp[0]];
		c.breaks.forEach((b, i) => step.push(b, c.ramp[i + 1]));
		return step;
	}

	function readProps(props: Record<string, unknown>): AreaProps {
		return {
			pc: props.pc as string,
			nimi: props.nimi as string,
			eur: (props.eur ?? null) as number | null,
			n: (props.n ?? 0) as number,
			chg: (props.chg ?? null) as number | null,
			yld: (props.yld ?? null) as number | null,
			pir: (props.pir ?? null) as number | null,
			liq: (props.liq ?? null) as number | null
		};
	}

	let applyMode: (m: MapMode) => void = () => {};

	onMount(() => {
		let map: import('maplibre-gl').Map | undefined;
		(async () => {
			const maplibregl = (await import('maplibre-gl')).default;
			map = new maplibregl.Map({
				container,
				// Light "classic map" basemap (place names, roads, water) so the
				// choropleth sits on familiar geography instead of a dark void.
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
					filter: ['!=', ['get', modeCfg.prop], null],
					paint: {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						'fill-color': fillColor(mode) as any,
						// Slightly translucent so basemap labels/roads show through and
						// the map keeps reading as a real map.
						'fill-opacity': ['case', ['boolean', ['feature-state', 'hover'], false], 0.95, 0.75]
					}
				});
				// Soft white borders between cells — the classic atlas look on a
				// light basemap; enough separation without shouting.
				map.addLayer({
					id: 'price-outline',
					type: 'line',
					source: 'prices',
					filter: ['!=', ['get', modeCfg.prop], null],
					paint: { 'line-color': '#ffffff', 'line-opacity': 0.9, 'line-width': 0.8 }
				});
				map.addLayer({
					id: 'price-nodata',
					type: 'line',
					source: 'prices',
					filter: ['==', ['get', modeCfg.prop], null],
					paint: { 'line-color': '#9a9a9a', 'line-opacity': 0.5, 'line-width': 0.7, 'line-dasharray': [2, 2] }
				});
				if (marker) {
					new maplibregl.Marker({ color: '#0a0a0a' }).setLngLat(marker).addTo(map);
				}

				applyMode = (m: MapMode) => {
					if (!map) return;
					const prop = MODES[m].prop;
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					map.setPaintProperty('price-fill', 'fill-color', fillColor(m) as any);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					map.setFilter('price-fill', ['!=', ['get', prop], null] as any);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					map.setFilter('price-outline', ['!=', ['get', prop], null] as any);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					map.setFilter('price-nodata', ['==', ['get', prop], null] as any);
				};

				let hoveredId: string | null = null;
				map.on('mousemove', 'price-fill', (e) => {
					if (!map) return;
					const f = e.features?.[0];
					if (!f) return;
					if (hoveredId !== null) map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: false });
					hoveredId = f.properties.pc;
					if (hoveredId !== null) map.setFeatureState({ source: 'prices', id: hoveredId }, { hover: true });
					hover = { p: readProps(f.properties), x: e.point.x, y: e.point.y };
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
						pinned = readProps(f.properties);
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

	$effect(() => {
		applyMode(mode);
	});
</script>

<svelte:window onkeydown={(e) => { if (e.key === 'Escape' && pinned) clearPin(); }} />

<div class="mapwrap" style="--h: {height}">
	<div class="map" bind:this={container}></div>
	{#if hover && !pinned}
		{@const line = modeCfg.line(hover.p)}
		<div class="tooltip" style="left: {hover.x + 12}px; top: {hover.y + 12}px">
			<b>{hover.p.pc} {hover.p.nimi}</b><br />
			{#if line}{line}{:else}{copy.kartta.noValue}{/if}
			{#if mode !== 'eur' && hover.p.eur !== null}
				<br /><span>{fmt.format(hover.p.eur)} €/m²</span>
			{/if}
			<span>· {hover.p.n} kauppaa/4 nelj.</span>
		</div>
	{/if}
	{#if pinned}
		{@const line = modeCfg.line(pinned)}
		<div class="panel" role="status">
			<button class="panel__close" type="button" aria-label={copy.kartta.panelClose} onclick={() => clearPin()}>×</button>
			<b>{pinned.pc} {pinned.nimi}</b>
			{#if line}
				<span class="panel__price">{line}</span>
			{:else}
				<span class="panel__sub">{copy.kartta.noValue}</span>
			{/if}
			<span class="panel__sub">
				{#if mode !== 'eur' && pinned.eur !== null}{fmt.format(pinned.eur)} €/m² · {/if}{pinned.n} kauppaa/4 nelj.
			</span>
			{#if onareaclick && pinned.eur !== null}
				<button class="panel__use" type="button" onclick={() => { const pc = pinned?.pc; if (pc) onareaclick?.(pc); }}>
					{copy.kartta.panelUse}
				</button>
			{/if}
		</div>
	{/if}
	{#if showLegend}
		<div class="legend" aria-label="Värilegenda: {modeCfg.legendTitle}">
			<span class="title">{modeCfg.legendTitle}</span>
			{#each modeCfg.ramp as color (color)}<span class="swatch" style="background:{color}"></span>{/each}
			<span class="lab">{modeCfg.labels[0]}</span><span class="lab mid">{modeCfg.labels[1]}</span><span class="lab">{modeCfg.labels[2]}</span>
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
		border: 1px solid var(--border);
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
