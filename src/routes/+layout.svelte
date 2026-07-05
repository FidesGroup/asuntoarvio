<script lang="ts">
	import { page } from '$app/state';
	let { children } = $props();
	const links = [
		{ href: '/', label: 'Vertailu' },
		{ href: '/analyysi', label: 'Ilmoitusanalyysi' },
		{ href: '/kartta', label: 'Hintakartta' }
	];
	const fidesUrl = 'https://fidesgroup.fi';
</script>

<div class="shell">
	<header>
		<div class="brand">
			<a class="fides" href={fidesUrl} aria-label="Fides Group — etusivu" target="_blank" rel="noopener">
				<span class="fides__mark">FIDES</span>
				<span class="fides__sub">GROUP</span>
			</a>
			<div class="brand__wordmark">
				<a class="wordmark" href="/">RehtiArvio</a>
				<span class="byline">Markkinahinta-analyysi · by Fides Group</span>
			</div>
		</div>
		<nav aria-label="Päänavigaatio">
			{#each links as l (l.href)}
				<a href={l.href} aria-current={page.url.pathname === l.href ? 'page' : undefined}>{l.label}</a>
			{/each}
		</nav>
	</header>
	<main>
		{@render children()}
	</main>
	<footer>
		<div class="footer__brand">
			<a class="fides fides--small" href={fidesUrl} aria-label="Fides Group" target="_blank" rel="noopener">
				<span class="fides__mark">FIDES</span>
				<span class="fides__sub">GROUP</span>
			</a>
			<div class="footer__copy">
				<b>RehtiArvio</b> on Fides Groupin kehittämä työkalu asuntokaupan markkinahintavertailuun.
				Toteutuneet hinnat, ei markkinahypetystä.
			</div>
		</div>
		<p class="attr">
			Lähde: <a href="https://stat.fi/tilasto/ashi">Tilastokeskus</a>, vanhojen osakeasuntojen
			kaupat postinumeroalueittain (CC BY 4.0). Suuntaa antava seula — ei arviolausunto eikä
			sijoitusneuvontaa.
		</p>
	</footer>
</div>

<style>
	:root {
		--bg: #ffffff;
		--surface: #ffffff;
		--ink: #0a0a0a;
		--ink-2: #475569;
		--ink-3: #94a3b8;
		--line: #e2e8f0;
		--line-2: #cbd5e1;
		--line-strong: #0a0a0a;
		--accent: #0a0a0a;
		--over: #0a0a0a;
		--under: #0a0a0a;
		--chip-bg: #f1f5f9;
		--shadow-sm: 0 1px 2px rgba(10, 10, 10, 0.04), 0 1px 3px rgba(10, 10, 10, 0.06);
		--shadow-md: 0 2px 4px rgba(10, 10, 10, 0.05), 0 4px 12px rgba(10, 10, 10, 0.08);
		--fides-ink: #ffffff;
		--fides-bg: #0a0a0a;
	}
	@media (prefers-color-scheme: dark) {
		:root {
			--bg: #0a0a0a;
			--surface: #141414;
			--ink: #f5f5f5;
			--ink-2: #cbd5e1;
			--ink-3: #64748b;
			--line: #1e293b;
			--line-2: #334155;
			--line-strong: #f5f5f5;
			--accent: #f5f5f5;
			--over: #f5f5f5;
			--under: #f5f5f5;
			--chip-bg: #1e293b;
			--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.5);
			--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.45), 0 4px 12px rgba(0, 0, 0, 0.55);
			--fides-ink: #0a0a0a;
			--fides-bg: #f5f5f5;
		}
	}

	* {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--ink);
		font-family: 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif;
		line-height: 1.55;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
	}
	.shell {
		max-width: 56rem;
		margin: 0 auto;
		padding: 1.25rem 1.25rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2.25rem;
		min-height: 100vh;
	}
	header {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex-wrap: wrap;
		border-bottom: 3px solid var(--ink);
		padding-bottom: 1.1rem;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 0.9rem;
	}
	.fides {
		font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
		font-weight: 700;
		background: var(--fides-bg);
		color: var(--fides-ink);
		display: inline-flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		padding: 0.55rem 0.7rem 0.4rem;
		line-height: 0.95;
		letter-spacing: 0.04em;
		text-decoration: none;
		border: 1px solid var(--fides-bg);
		user-select: none;
	}
	.fides__mark {
		font-size: 1.15rem;
	}
	.fides__sub {
		font-size: 0.55rem;
		font-weight: 500;
		letter-spacing: 0.32em;
		text-align: center;
		padding-top: 0.1rem;
		border-top: 1px solid var(--fides-ink);
		margin-top: 0.2rem;
		opacity: 0.85;
	}
	.fides--small .fides__mark {
		font-size: 0.85rem;
	}
	.fides--small .fides__sub {
		font-size: 0.45rem;
		letter-spacing: 0.3em;
	}
	.fides--small {
		padding: 0.4rem 0.55rem 0.3rem;
	}
	.fides:hover {
		outline: 2px solid var(--fides-ink);
		outline-offset: 2px;
	}
	.brand__wordmark {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}
	.wordmark {
		font-size: 1.55rem;
		font-weight: 700;
		letter-spacing: -0.025em;
		color: var(--ink);
		text-decoration: none;
		line-height: 1;
	}
	.byline {
		font-size: 0.65rem;
		color: var(--ink-2);
		text-transform: uppercase;
		letter-spacing: 0.14em;
		font-weight: 500;
	}
	nav {
		margin-left: auto;
		display: flex;
		gap: 1.4rem;
	}
	nav a {
		color: var(--ink-2);
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		text-decoration: none;
		padding-bottom: 1.1rem;
		margin-bottom: -1.15rem;
		border-bottom: 2px solid transparent;
		transition: color 0.12s ease, border-color 0.12s ease;
	}
	nav a:hover {
		color: var(--ink);
	}
	nav a[aria-current='page'] {
		color: var(--ink);
		border-bottom-color: var(--ink);
	}
	main {
		flex: 1;
	}
	footer {
		border-top: 3px solid var(--ink);
		padding-top: 1.25rem;
		color: var(--ink-2);
		font-size: 0.8rem;
		display: flex;
		flex-direction: column;
		gap: 1.1rem;
	}
	.footer__brand {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}
	.footer__copy {
		color: var(--ink);
		font-weight: 500;
		max-width: 38rem;
		line-height: 1.5;
	}
	.attr {
		margin: 0;
		color: var(--ink-2);
		font-size: 0.78rem;
	}
	footer a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	/* ----- Mobile tuning (small-first) ----- */
	@media (max-width: 560px) {
		.shell {
			padding: 1rem 1rem 3rem;
			gap: 1.75rem;
		}
		header {
			gap: 0.85rem;
			padding-bottom: 0.85rem;
		}
		.brand {
			gap: 0.7rem;
		}
		.wordmark {
			font-size: 1.35rem;
		}
		.byline {
			font-size: 0.58rem;
			letter-spacing: 0.12em;
		}
		.fides__mark {
			font-size: 1rem;
		}
		nav {
			width: 100%;
			margin-left: 0;
			gap: 1.1rem;
			padding-top: 0.25rem;
		}
		nav a {
			padding-bottom: 0.4rem;
			margin-bottom: 0;
		}
	}
</style>
