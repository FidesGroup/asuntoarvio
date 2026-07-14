/**
 * Theme plumbing is intentionally a no-op: the site is light-only now
 * (the dark token block was dropped from tokens.css per the editorial
 * palette decision). Kept as a module so existing call sites
 * (Header.svelte, +layout.svelte) still type-check after the Header
 * toggle button was removed. If dark mode ever comes back, restore
 * the original reactive store here.
 */
export type Theme = 'light';

function createThemeStore() {
	return {
		get pref(): Theme {
			return 'light';
		},
		init(): void {},
		set(_next: Theme): void {},
		toggle(): void {}
	};
}

export const theme = createThemeStore();
