<script lang="ts">
	/**
	 * Area history from StatFin 13mt: yearly €/m² per room type (lines) and
	 * yearly published transaction counts (bars). Editorial monochrome series
	 * — identity is carried by dash pattern + direct end labels, never color
	 * alone (palette rule 10: hue stays reserved for verdict direction).
	 */
	import { copy } from '$lib/copy/fi';

	interface YearPoint {
		year: number;
		eur: Record<string, number | null>;
		n: number;
	}
	let {
		history
	}: { history: { years: YearPoint[]; annualChangePct: number | null } } = $props();

	const SERIES = [
		{ key: 'yksiöt', label: 'Yksiöt', color: '#0a0a0a', dash: '' },
		{ key: 'kaksiot', label: 'Kaksiot', color: '#5c5443', dash: '6 4' },
		{ key: 'kolmiot+', label: 'Kolmiot+', color: '#948c75', dash: '2 3' }
	];
	const fmt = new Intl.NumberFormat('fi-FI');

	const W = 640;
	const H = 260;
	const PAD = { top: 12, right: 76, bottom: 26, left: 48 };

	const years = $derived(history.years.filter((y) => y.n > 0));
	const yearMin = $derived(years[0]?.year ?? 0);
	const yearMax = $derived(years[years.length - 1]?.year ?? 1);

	const eurVals = $derived(
		years.flatMap((y) => SERIES.map((s) => y.eur[s.key]).filter((e): e is number => e !== null))
	);
	const eurMin = $derived(Math.min(...eurVals));
	const eurMax = $derived(Math.max(...eurVals));

	function x(year: number): number {
		if (yearMax === yearMin) return PAD.left;
		return PAD.left + ((year - yearMin) / (yearMax - yearMin)) * (W - PAD.left - PAD.right);
	}
	function yEur(eur: number): number {
		const lo = eurMin * 0.95;
		const hi = eurMax * 1.02;
		return PAD.top + (1 - (eur - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);
	}

	/** Contiguous non-null runs so suppressed years break the line honestly. */
	function segments(key: string): { x: number; y: number; year: number; eur: number }[][] {
		const runs: { x: number; y: number; year: number; eur: number }[][] = [];
		let run: { x: number; y: number; year: number; eur: number }[] = [];
		for (const yp of years) {
			const e = yp.eur[key];
			if (e === null) {
				if (run.length) runs.push(run);
				run = [];
			} else {
				run.push({ x: x(yp.year), y: yEur(e), year: yp.year, eur: e });
			}
		}
		if (run.length) runs.push(run);
		return runs;
	}
	function path(run: { x: number; y: number }[]): string {
		return run.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
	}

	const eurTicks = $derived.by(() => {
		const lo = eurMin * 0.95;
		const hi = eurMax * 1.02;
		const step = Math.pow(10, Math.floor(Math.log10(hi - lo)));
		const s = (hi - lo) / step > 4 ? step : step / 2;
		const ticks: number[] = [];
		for (let v = Math.ceil(lo / s) * s; v <= hi; v += s) ticks.push(v);
		return ticks.slice(0, 6);
	});
	const yearTicks = $derived(
		years.filter((y) => y.year % (yearMax - yearMin > 10 ? 4 : 2) === 0).map((y) => y.year)
	);

	// Volume bars
	const VH = 150;
	const nMax = $derived(Math.max(...years.map((y) => y.n), 1));
	function yN(n: number): number {
		return PAD.top + (1 - n / nMax) * (VH - PAD.top - PAD.bottom);
	}
	const barW = $derived(
		Math.max(3, ((W - PAD.left - PAD.right) / Math.max(years.length, 1)) - 2)
	);

	// Hover: nearest year, one tooltip per chart
	let hoverYear: number | null = $state(null);
	function onMove(e: PointerEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const r = svg.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		let best: number | null = null;
		let bestD = Infinity;
		for (const yp of years) {
			const d = Math.abs(x(yp.year) - px);
			if (d < bestD) { bestD = d; best = yp.year; }
		}
		hoverYear = best;
	}
	const hovered = $derived(years.find((y) => y.year === hoverYear) ?? null);
</script>

{#if years.length >= 3}
	<div class="hist">
		<div class="hist__head">
			<h3 class="hist__title">{copy.arvio.history.priceTitle}</h3>
			<span class="hist__unit">{copy.arvio.history.priceUnit}</span>
		</div>
		<svg
			viewBox="0 0 {W} {H}"
			role="img"
			aria-label={copy.arvio.history.priceTitle}
			onpointermove={onMove}
			onpointerleave={() => (hoverYear = null)}
		>
			{#each eurTicks as t (t)}
				<line x1={PAD.left} x2={W - PAD.right} y1={yEur(t)} y2={yEur(t)} class="grid" />
				<text x={PAD.left - 6} y={yEur(t) + 3} class="tick tick--y">{fmt.format(t)}</text>
			{/each}
			{#each yearTicks as t (t)}
				<text x={x(t)} y={H - 8} class="tick tick--x">{t}</text>
			{/each}
			{#if hovered}
				<line x1={x(hovered.year)} x2={x(hovered.year)} y1={PAD.top} y2={H - PAD.bottom} class="crosshair" />
			{/if}
			{#each SERIES as s (s.key)}
				{#each segments(s.key) as run, i (i)}
					<path d={path(run)} fill="none" stroke={s.color} stroke-width="2" stroke-dasharray={s.dash} stroke-linecap="round" />
					{#if i === segments(s.key).length - 1 && run.length}
						<text x={run[run.length - 1].x + 6} y={run[run.length - 1].y + 3} class="endlabel" fill={s.color}>{s.label}</text>
					{/if}
				{/each}
				{#if hovered && hovered.eur[s.key] !== null}
					<circle cx={x(hovered.year)} cy={yEur(hovered.eur[s.key] as number)} r="4" fill={s.color} stroke="var(--surface)" stroke-width="2" />
				{/if}
			{/each}
		</svg>
		{#if hovered}
			<div class="hist__tip num" role="status">
				<b>{hovered.year}</b>
				{#each SERIES as s (s.key)}
					{#if hovered.eur[s.key] !== null}
						<span>{s.label}: {fmt.format(hovered.eur[s.key] as number)} €/m²</span>
					{/if}
				{/each}
			</div>
		{/if}
		{#if history.annualChangePct !== null}
			<p class="hist__trend">
				{copy.arvio.history.trendLabel}:
				<b class="num">{history.annualChangePct > 0 ? '+' : ''}{String(history.annualChangePct).replace('.', ',')} %</b>
			</p>
		{/if}

		<div class="hist__head hist__head--second">
			<h3 class="hist__title">{copy.arvio.history.volumeTitle}</h3>
			<span class="hist__unit">{copy.arvio.history.volumeUnit}</span>
		</div>
		<svg
			viewBox="0 0 {W} {VH}"
			role="img"
			aria-label={copy.arvio.history.volumeTitle}
			onpointermove={onMove}
			onpointerleave={() => (hoverYear = null)}
		>
			{#each yearTicks as t (t)}
				<text x={x(t)} y={VH - 8} class="tick tick--x">{t}</text>
			{/each}
			{#each years as yp (yp.year)}
				<rect
					x={x(yp.year) - barW / 2}
					y={yN(yp.n)}
					width={barW}
					height={VH - PAD.bottom - yN(yp.n)}
					rx="2"
					class="bar"
					class:bar--hover={hoverYear === yp.year}
				/>
			{/each}
		</svg>
		{#if hovered}
			<div class="hist__tip num" role="status">
				<b>{hovered.year}</b><span>{fmt.format(hovered.n)} kauppaa</span>
			</div>
		{/if}
		<p class="hist__src">{copy.arvio.history.source} · {copy.arvio.history.partialNote}</p>
	</div>
{/if}

<style>
	.hist {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.hist__head {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
	}
	.hist__head--second {
		margin-top: 1.2rem;
	}
	.hist__title {
		font-size: var(--text-md);
		font-weight: 600;
		margin: 0;
	}
	.hist__unit {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
	svg {
		width: 100%;
		height: auto;
		touch-action: pan-y;
	}
	.grid {
		stroke: var(--border);
		stroke-width: 1;
	}
	.crosshair {
		stroke: var(--border-2);
		stroke-width: 1;
	}
	.tick {
		font-size: 11px;
		fill: var(--ink-3);
		font-variant-numeric: tabular-nums;
	}
	.tick--y { text-anchor: end; }
	.tick--x { text-anchor: middle; }
	.endlabel {
		font-size: 11px;
		font-weight: 600;
	}
	.bar {
		fill: var(--ink-2);
		opacity: 0.75;
	}
	.bar--hover { opacity: 1; }
	.hist__tip {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		font-size: var(--text-sm);
		color: var(--ink-2);
		min-height: 1.4em;
	}
	.hist__tip b { color: var(--ink); }
	.hist__trend {
		margin: 0.2rem 0 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
	}
	.hist__src {
		margin: 0.6rem 0 0;
		padding-top: 0.6rem;
		border-top: 1px solid var(--border);
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}
</style>
