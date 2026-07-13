/**
 * Reactive theme signal with View Transitions API support for smooth cross-fade.
 * 'auto' follows prefers-color-scheme; 'light' / 'dark' force.
 */
import { browser } from '$app/environment';

export type Theme = 'auto' | 'light' | 'dark';

function createThemeStore() {
	let pref = $state<Theme>('auto');

	function read(): Theme {
		if (!browser) return 'light';
		try {
			const s = localStorage.getItem('ra_theme');
			if (s === 'light' || s === 'dark' || s === 'auto') return s;
		} catch {}
		return 'auto';
	}

	function persist(t: Theme) {
		if (!browser) return;
		try { localStorage.setItem('ra_theme', t); } catch {}
	}

	function apply(t: Theme) {
		if (!browser) return;
		const resolved = t === 'auto'
			? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
			: t;
		document.documentElement.dataset.theme = resolved;
	}

	return {
		get pref() { return pref; },
		init() {
			pref = read();
			apply(pref);
			if (browser) {
				const mq = window.matchMedia('(prefers-color-scheme: dark)');
				mq.addEventListener('change', () => pref === 'auto' && apply('auto'));
			}
		},
		set(next: Theme) {
			pref = next;
			persist(next);
			const swap = () => apply(next);
			if (browser && 'startViewTransition' in document) {
				(document as any).startViewTransition(swap);
			} else {
				swap();
			}
		},
		toggle() {
			const resolved = pref === 'auto'
				? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
				: pref;
			this.set(resolved === 'dark' ? 'light' : 'dark');
		}
	};
}

export const theme = createThemeStore();