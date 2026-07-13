/**
 * Reactive counter: animates from `from` to `to` over `duration` with ease-out cubic.
 * Honors prefers-reduced-motion. Side-effect-only action (no return value).
 */
export interface CountUpOptions {
	from?: number;
	to: number;
	duration?: number;
	decimals?: number;
	easing?: (t: number) => number;
}

export function countUp(node: HTMLElement, opts: CountUpOptions) {
	const duration = opts.duration ?? 700;
	const decimals = opts.decimals ?? 0;
	const ease = opts.easing ?? ((t: number) => 1 - Math.pow(1 - t, 3));

	function format(n: number) {
		const v = decimals === 0 ? Math.round(n) : Number(n.toFixed(decimals));
		return v.toLocaleString('fi-FI', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		});
	}

	function set(n: number) {
		node.textContent = format(n);
	}

	let raf = 0;

	function run(target: number) {
		const reduced = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		if (reduced) { set(target); return; }
		const start = performance.now();
		const from = opts.from ?? 0;
		const tick = (now: number) => {
			const t = Math.min(1, (now - start) / duration);
			set(from + (target - from) * ease(t));
			if (t < 1) raf = requestAnimationFrame(tick);
		};
		raf = requestAnimationFrame(tick);
	}

	run(opts.to);

	return {
		destroy() {
			cancelAnimationFrame(raf);
		}
	};
}