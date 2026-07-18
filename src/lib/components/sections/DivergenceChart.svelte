<script lang="ts">
	/**
	 * Regional divergence: pääkaupunkiseutu vs muu Suomi as quarterly price
	 * indices (2020 = 100), with a nominal/real toggle when the CPI series is
	 * available. Same editorial chart language as HistoryCharts: monochrome
	 * lines, identity by dash pattern + direct end labels, hover crosshair.
	 */
	import { copy } from '$lib/copy/fi';

	interface DivergenceSeries {
		quarters: string[];
		nominal: Record<'pks' | 'msu', (number | null)[]>;
		real: Record<'pks' | 'msu', (number | null)[]> | null;
		baseYear: number;
	}
	let { divergence }: { divergence: DivergenceSeries } = $props();

	const SERIES = [
		{ key: 'pks' as const, label: copy.kartta.divergence.pks, color: '#0a0a0a', dash: '' },
		{ key: 'msu' as const, label: copy.kartta.divergence.msu, color: '#5c5443', dash: '6 4' }
	];

	let variant = $state<'nominal' | 'real'>('nominal');
	const active = $derived(
		variant === 'real' && divergence.real ? divergence.real : divergence.nominal
	);

	const W = 640;
	const H = 260;
	const PAD = { top: 12, right: 96, bottom: 26, left: 40 };

	const qs = $derived(divergence.quarters);
	const vals = $derived(
		SERIES.flatMap((s) => active[s.key]).filter((v): v is number => v !== null)
	);
	const lo = $derived(Math.min(...vals, 100) - 3);
	const hi = $derived(Math.max(...vals, 100) + 3);

	function x(i: number): number {
		return PAD.left + (i / Math.max(qs.length - 1, 1)) * (W - PAD.left - PAD.right);
	}
	function y(v: number): number {
		return PAD.top + (1 - (v - lo) / (hi - lo)) * (H - PAD.top - PAD.bottom);
	}

	/** Contiguous non-null runs so suppressed quarters break the line honestly. */
	function segments(key: 'pks' | 'msu'): { x: number; y: number }[][] {
		const runs: { x: number; y: number }[][] = [];
		let run: { x: number; y: number }[] = [];
		active[key].forEach((v, i) => {
			if (v === null) {
				if (run.length) runs.push(run);
				run = [];
			} else {
				run.push({ x: x(i), y: y(v) });
			}
		});
		if (run.length) runs.push(run);
		return runs;
	}
	function path(run: { x: number; y: number }[]): string {
		return run.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
	}

	const yTicks = $derived.by(() => {
		const step = hi - lo > 40 ? 10 : 5;
		const ticks: number[] = [];
		for (let v = Math.ceil(lo / step) * step; v <= hi; v += step) ticks.push(v);
		return ticks;
	});
	const yearTicks = $derived(
		qs.map((q, i) => ({ q, i })).filter(({ q }) => q.endsWith('Q1') && Number(q.slice(0, 4)) % 2 === 1)
	);

	let hoverI: number | null = $state(null);
	function onMove(e: PointerEvent) {
		const svg = e.currentTarget as SVGSVGElement;
		const r = svg.getBoundingClientRect();
		const px = ((e.clientX - r.left) / r.width) * W;
		const frac = (px - PAD.left) / (W - PAD.left - PAD.right);
		hoverI = Math.max(0, Math.min(qs.length - 1, Math.round(frac * (qs.length - 1))));
	}
	const fmtIdx = (v: number) => String(v).replace('.', ',');
</script>

<div class="div">
	<div class="div__head">
		<h3 class="div__title">{copy.kartta.divergence.title}</h3>
		<span class="div__unit">{copy.kartta.divergence.unit(divergence.baseYear)}</span>
		{#if divergence.real}
			<div class="div__toggle" role="group" aria-label={copy.kartta.divergence.variantLabel}>
				<button
					type="button"
					class="div__btn"
					class:div__btn--on={variant === 'nominal'}
					aria-pressed={variant === 'nominal'}
					onclick={() => (variant = 'nominal')}
				>
					{copy.kartta.divergence.nominal}
				</button>
				<button
					type="button"
					class="div__btn"
					class:div__btn--on={variant === 'real'}
					aria-pressed={variant === 'real'}
					onclick={() => (variant = 'real')}
				>
					{copy.kartta.divergence.real}
				</button>
			</div>
		{/if}
	</div>
	<p class="div__lede">{copy.kartta.divergence.lede}</p>
	<svg
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label={copy.kartta.divergence.title}
		onpointermove={onMove}
		onpointerleave={() => (hoverI = null)}
	>
		{#each yTicks as t (t)}
			<line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} class="grid" class:grid--base={t === 100} />
			<text x={PAD.left - 6} y={y(t) + 3} class="tick tick--y">{t}</text>
		{/each}
		{#each yearTicks as { q, i } (q)}
			<text x={x(i)} y={H - 8} class="tick tick--x">{q.slice(0, 4)}</text>
		{/each}
		{#if hoverI !== null}
			<line x1={x(hoverI)} x2={x(hoverI)} y1={PAD.top} y2={H - PAD.bottom} class="crosshair" />
		{/if}
		{#each SERIES as s (s.key)}
			{#each segments(s.key) as run, i (i)}
				<path d={path(run)} fill="none" stroke={s.color} stroke-width="2" stroke-dasharray={s.dash} stroke-linecap="round" />
				{#if i === segments(s.key).length - 1 && run.length}
					<text x={run[run.length - 1].x + 6} y={run[run.length - 1].y + 3} class="endlabel" fill={s.color}>{s.label}</text>
				{/if}
			{/each}
			{#if hoverI !== null && active[s.key][hoverI] !== null}
				<circle cx={x(hoverI)} cy={y(active[s.key][hoverI] as number)} r="4" fill={s.color} stroke="var(--surface)" stroke-width="2" />
			{/if}
		{/each}
	</svg>
	<div class="div__tip num" role="status">
		{#if hoverI !== null}
			<b>{qs[hoverI]}</b>
			{#each SERIES as s (s.key)}
				{#if active[s.key][hoverI] !== null}
					<span>{s.label}: {fmtIdx(active[s.key][hoverI] as number)}</span>
				{/if}
			{/each}
		{:else}
			&nbsp;
		{/if}
	</div>
	{#if variant === 'real'}
		<p class="div__note">{copy.kartta.divergence.realNote}</p>
	{/if}
	<p class="div__src">{copy.kartta.divergence.source}</p>
</div>

<style>
	.div {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.div__head {
		display: flex;
		align-items: baseline;
		gap: 0.6rem;
		flex-wrap: wrap;
	}
	.div__title {
		font-size: var(--text-md);
		font-weight: 600;
		margin: 0;
	}
	.div__unit {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}
	.div__toggle {
		margin-left: auto;
		display: inline-flex;
		border: 1px solid var(--border-2);
	}
	.div__btn {
		font: inherit;
		font-size: var(--text-xs);
		font-weight: 500;
		background: transparent;
		color: var(--ink-2);
		border: none;
		padding: 0.35rem 0.7rem;
		min-height: 32px;
		cursor: pointer;
	}
	.div__btn--on {
		background: var(--brand);
		color: var(--brand-ink);
	}
	@media (pointer: coarse) {
		.div__btn {
			min-height: 44px;
		}
	}
	.div__lede {
		margin: 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-body);
		max-width: var(--container-prose);
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
	.grid--base {
		stroke: var(--border-2);
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
	.div__tip {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 1rem;
		font-size: var(--text-sm);
		color: var(--ink-2);
		min-height: 1.4em;
	}
	.div__tip b { color: var(--ink); }
	.div__note {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		line-height: var(--lh-list);
	}
	.div__src {
		margin: 0.6rem 0 0;
		padding-top: 0.6rem;
		border-top: 1px solid var(--border);
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}
</style>
