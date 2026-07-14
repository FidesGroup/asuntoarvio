<script lang="ts">
	import { page } from '$app/state';
	import { copy } from '$lib/copy/fi';

	const links = [
		{ href: '/', label: copy.nav.analyze },
		{ href: '/kartta', label: copy.nav.map },
		{ href: '/tilaa', label: copy.nav.pricing },
		{ href: '/miksi', label: copy.nav.why }
	];

	let menuOpen = $state(false);

	function isActive(href: string): boolean {
		const path = page.url.pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(href + '/');
	}

	function close() { menuOpen = false; }
</script>

<header class="hdr">
	<a class="wordmark" href="/" onclick={close} aria-label={copy.brand.name}>
		<span class="wordmark__mark" aria-hidden="true"></span>
		<span class="wordmark__text">{copy.brand.name}</span>
	</a>

	<nav class="nav" aria-label="Päänavigaatio">
		{#each links as l (l.href)}
			<a
				href={l.href}
				class="nav__link"
				class:active={isActive(l.href)}
				aria-current={isActive(l.href) ? 'page' : undefined}
				onclick={close}
			>
				{l.label}
			</a>
		{/each}
	</nav>

	<div class="actions">
		<button
			type="button"
			class="iconbtn burger"
			aria-label="Valikko"
			aria-expanded={menuOpen}
			onclick={() => (menuOpen = !menuOpen)}
		>
			<span class="burger__bar" class:open={menuOpen}></span>
			<span class="burger__bar burger__bar--mid" class:open={menuOpen}></span>
			<span class="burger__bar" class:open={menuOpen}></span>
		</button>
	</div>
</header>

{#if menuOpen}
	<div class="drawer" role="dialog" aria-modal="true" aria-label="Valikko">
		<button class="drawer__backdrop" aria-label="Sulje valikko" onclick={close}></button>
		<nav class="drawer__nav" aria-label="Päänavigaatio">
			{#each links as l (l.href)}
				<a
					href={l.href}
					class="drawer__link"
					class:active={isActive(l.href)}
					aria-current={isActive(l.href) ? 'page' : undefined}
					onclick={close}
				>{l.label}</a>
			{/each}
		</nav>
	</div>
{/if}

<style>
	.hdr {
		position: sticky;
		top: 0;
		z-index: var(--z-header);
		display: flex;
		align-items: center;
		gap: 1.25rem;
		padding: 0.9rem 0;
		background: color-mix(in srgb, var(--bg) 88%, transparent);
		backdrop-filter: saturate(160%) blur(12px);
		-webkit-backdrop-filter: saturate(160%) blur(12px);
		border-bottom: 1px solid var(--border);
	}

	.wordmark {
		display: inline-flex;
		align-items: center;
		gap: 0.55rem;
		text-decoration: none;
		color: var(--ink);
		font-weight: 700;
		letter-spacing: var(--ls-tight);
		font-size: 1.15rem;
		flex-shrink: 0;
	}

	.wordmark__mark {
		width: 22px;
		height: 22px;
		background: var(--brand);
		border-radius: 6px;
		position: relative;
	}

	.wordmark__mark::after {
		content: '';
		position: absolute;
		left: 5px;
		top: 11px;
		width: 12px;
		height: 2px;
		background: var(--brand-ink);
		border-radius: 2px;
		box-shadow:
			0 -4px 0 var(--brand-ink),
			0 -7px 0 var(--brand-ink);
	}

	.nav {
		display: flex;
		gap: 0.15rem;
		margin-left: auto;
		align-items: center;
	}

	.nav__link {
		color: var(--ink-2);
		font-size: var(--text-sm);
		font-weight: 500;
		text-decoration: none;
		padding: 0.45rem 0.75rem;
		border-radius: var(--radius-sm);
		transition: background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard);
	}

	.nav__link:hover {
		color: var(--ink);
		background: var(--chip);
	}

	.nav__link.active {
		background: var(--brand);
		color: var(--brand-ink);
	}

	.actions {
		display: flex;
		gap: 0.35rem;
		margin-left: 0.5rem;
	}

	.iconbtn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: var(--radius-full);
		background: transparent;
		color: var(--ink-2);
		border: 1px solid transparent;
		cursor: pointer;
		transition: background var(--dur-fast) var(--ease-standard), color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
	}

	.iconbtn:hover {
		color: var(--ink);
		background: var(--chip);
		border-color: var(--border);
	}

	.burger {
		display: none;
		flex-direction: column;
		gap: 4px;
	}

	.burger__bar {
		display: block;
		width: 18px;
		height: 1.5px;
		background: currentColor;
		border-radius: 2px;
		transition: transform var(--dur-fast) var(--ease-standard), opacity var(--dur-fast) var(--ease-standard);
	}

	.burger__bar.open:nth-child(1) { transform: translateY(5.5px) rotate(45deg); }
	.burger__bar.open:nth-child(2) { opacity: 0; }
	.burger__bar.open:nth-child(3) { transform: translateY(-5.5px) rotate(-45deg); }

	@media (max-width: 720px) {
		.nav { display: none; }
		.burger { display: inline-flex; }
	}

	/* Mobile drawer */
	.drawer {
		position: fixed;
		inset: 0;
		z-index: var(--z-overlay);
	}

	.drawer__backdrop {
		position: absolute;
		inset: 0;
		background: color-mix(in srgb, var(--ink) 30%, transparent);
		backdrop-filter: blur(2px);
		border: none;
		cursor: pointer;
		animation: fade-in var(--dur-base) var(--ease-standard);
	}

	.drawer__nav {
		position: absolute;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(20rem, 80vw);
		background: var(--surface);
		border-left: 1px solid var(--border);
		padding: 5rem 1.5rem 2rem;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		animation: slide-in var(--dur-base) var(--ease-emphasized);
	}

	.drawer__link {
		text-decoration: none;
		color: var(--ink);
		font-size: var(--text-lg);
		font-weight: 500;
		padding: 0.75rem 0.5rem;
		border-radius: var(--radius-md);
		transition: background var(--dur-fast) var(--ease-standard);
	}

	.drawer__link:hover { background: var(--chip); }
	.drawer__link.active { color: var(--brand); }

	@keyframes fade-in {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slide-in {
		from { transform: translateX(100%); }
		to { transform: translateX(0); }
	}

	@media (prefers-reduced-motion: reduce) {
		.drawer__backdrop { animation: none; }
		.drawer__nav { animation: none; }
		.burger__bar { transition: none; }
	}
</style>