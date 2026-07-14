<script lang="ts">
	/**
	 * Hero mini-map of Finland: €/m² by postal area, colored by lightness ramp.
	 * Single-hue (Baltic petrol) sequential ramp — CVD-safe, lightness-monotonic
	 * per rule 10. Centroid data comes from `centroids.json` (postal codes + lat/lon
	 * + €/m²). Areas without published data render as a faint dot, not omitted.
	 */
	interface Centroid {
		c: number[];
		eur: number | null;
		n: number;
		nimi: string;
	}
	let { centroids, size = 320 }: { centroids: Record<string, Centroid>; size?: number } = $props();

	const LON_MIN = 19.59;
	const LON_MAX = 31.33;
	const LAT_MIN = 59.81;
	const LAT_MAX = 69.9;
	const W = 600;
	const H = 800;

	type Point = { pc: string; nimi: string; eur: number | null; x: number; y: number; r: number };
	const points: Point[] = $derived(Object.entries(centroids).map(([pc, c]) => {
		const [lon, lat] = c.c;
		const x = ((lon - LON_MIN) / (LON_MAX - LON_MIN)) * W;
		const y = H - ((lat - LAT_MIN) / (LAT_MAX - LAT_MIN)) * H;
		return { pc, nimi: c.nimi, eur: c.eur, x, y, r: c.n > 0 ? 2.7 : 1.7 };
	}));

	const eurs = $derived(points.map((p) => p.eur).filter((e): e is number => e !== null && e > 0));
	const eurMin = $derived(eurs.length ? Math.min(...eurs) : 0);
	const eurMax = $derived(eurs.length ? Math.max(...eurs) : 0);

	/** Map €/m² to lightness step: 0 = pale (cheapest), 1 = deep (most expensive). */
	function lightness(eur: number | null): number {
		if (eur === null || eur <= 0) return -1; // no-data bucket
		const t = (Math.log(eur) - Math.log(eurMin)) / (Math.log(eurMax) - Math.log(eurMin));
		return Math.max(0, Math.min(1, t));
	}

	function fillFor(eur: number | null): string {
		if (eur === null || eur <= 0) return 'var(--border-2)';
		const t = lightness(eur);
		// 5-step sequential ramp on the Baltic petrol hue. Floor raised from 18%→30%
		// so the cheapest-tier dots (majority, price distribution skews low) don't
		// blend into the --surface card background. Still lightness-monotonic, single-hue.
		if (t < 0.2) return 'color-mix(in srgb, var(--brand) 30%, var(--surface))';
		if (t < 0.4) return 'color-mix(in srgb, var(--brand) 48%, var(--surface))';
		if (t < 0.6) return 'color-mix(in srgb, var(--brand) 66%, var(--surface))';
		if (t < 0.8) return 'color-mix(in srgb, var(--brand) 84%, var(--surface))';
		return 'var(--brand)';
	}

	let hovered = $state<Point | null>(null);
</script>

<div class="mmap" style="--mmap-size: {size}px">
	<svg
		viewBox="0 0 {W} {H}"
		role="img"
		aria-label="Suomen postinumeroalueiden neliöhinnat"
	>
		<g>
			{#each points as p (p.pc)}
				<circle
					cx={p.x}
					cy={p.y}
					r={hovered?.pc === p.pc ? p.r * 1.8 : p.r}
					fill={fillFor(p.eur)}
					opacity={p.eur !== null && p.eur > 0 ? 0.98 : 0.55}
					onmouseenter={() => (hovered = p)}
					onmouseleave={() => (hovered = null)}
					role="presentation"
				/>
			{/each}
		</g>
	</svg>
	<div class="mmap__legend">
		<span class="mmap__legend-chip" style="background: var(--surface)"></span>
		<span class="mmap__legend-label">
			{Intl.NumberFormat('fi-FI').format(eurMin)} €
		</span>
		<span class="mmap__legend-bar"></span>
		<span class="mmap__legend-label">
			{Intl.NumberFormat('fi-FI').format(eurMax)} €
		</span>
		<span class="mmap__legend-label mmap__legend-sub">/ m²</span>
	</div>
	{#if hovered && hovered.eur !== null && hovered.eur > 0}
		<div class="mmap__tip" role="tooltip">
			<b>{hovered.nimi || hovered.pc}</b>
			<span class="muted">{hovered.pc}</span>
			<span>{Intl.NumberFormat('fi-FI').format(hovered.eur)} €/m²</span>
		</div>
	{:else if hovered}
		<div class="mmap__tip" role="tooltip">
			<b>{hovered.nimi || hovered.pc}</b>
			<span class="muted">ei julkaistua hintaa</span>
		</div>
	{/if}
</div>

<style>
	.mmap {
		position: relative;
		width: var(--mmap-size);
		height: calc(var(--mmap-size) * 1.33);
		max-width: 100%;
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		background: var(--surface);
		box-shadow: var(--shadow-md);
		overflow: hidden;
	}
	.mmap svg {
		width: 100%;
		height: 100%;
		display: block;
	}
	.mmap svg g {
		/* Subtle depth cue so dots sit forward of the flat card background. */
		filter: drop-shadow(0 0.5px 0.9px rgba(9, 15, 20, 0.35));
	}
	.mmap__legend {
		position: absolute;
		left: 0.85rem;
		bottom: 0.85rem;
		display: flex;
		align-items: center;
		gap: 0.4rem;
		padding: 0.4rem 0.7rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-full);
		box-shadow: var(--shadow-sm);
		font-size: var(--text-xs);
		color: var(--ink-2);
	}
	.mmap__legend-bar {
		display: inline-block;
		width: 80px;
		height: 8px;
		border-radius: var(--radius-full);
		background: linear-gradient(
			to right,
			color-mix(in srgb, var(--brand) 30%, var(--surface)),
			color-mix(in srgb, var(--brand) 48%, var(--surface)),
			color-mix(in srgb, var(--brand) 66%, var(--surface)),
			color-mix(in srgb, var(--brand) 84%, var(--surface)),
			var(--brand)
		);
		border: 1px solid var(--border);
	}
	.mmap__legend-label {
		font-variant-numeric: tabular-nums;
		font-weight: 500;
		letter-spacing: var(--ls-snug);
	}
	.mmap__legend-sub {
		color: var(--ink-3);
	}
	.mmap__tip {
		position: absolute;
		top: 0.75rem;
		right: 0.85rem;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
		padding: 0.55rem 0.7rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		font-size: var(--text-sm);
		min-width: 8rem;
	}
	.mmap__tip b { font-weight: 600; color: var(--ink); }
	.mmap__tip span { color: var(--ink-2); font-variant-numeric: tabular-nums; }
	.mmap__tip .muted { color: var(--ink-3); font-size: var(--text-xs); }
</style>