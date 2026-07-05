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
				<a href={l.href} aria-current={page.url.pathname === l.href ? 'page' : undefined}>
					<span>{l.label}</span>
				</a>
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
		/* Soft modern minimalist — off-white paper, generous elevation */
		--bg: #f7f6f4;
		--surface: #ffffff;
		--ink: #111827;
		--ink-2: #6b7280;
		--ink-3: #9ca3af;
		--line: #ececea;
		--line-2: #d6d3d1;
		--accent: #111827;
		--over: #111827;
		--under: #111827;
		--chip-bg: #f3f1ee;
		--shadow-sm: 0 1px 2px rgba(17, 24, 39, 0.04), 0 1px 3px rgba(17, 24, 39, 0.03);
		--shadow-md: 0 2px 4px -1px rgba(17, 24, 39, 0.04), 0 8px 24px -6px rgba(17, 24, 39, 0.08);
		--shadow-lg: 0 4px 8px -2px rgba(17, 24, 39, 0.05), 0 20px 40px -8px rgba(17, 24, 39, 0.1);
		--radius-sm: 8px;
		--radius-md: 12px;
		--radius-lg: 18px;
		--radius-pill: 999px;
		--fides-ink: #ffffff;
		--fides-bg: #111827;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--bg: #0b0b0c;
			--surface: #151517;
			--ink: #f5f5f4;
			--ink-2: #a1a1aa;
			--ink-3: #71717a;
			--line: #232325;
			--line-2: #2e2e30;
			--accent: #f5f5f4;
			--over: #f5f5f4;
			--under: #f5f5f4;
			--chip-bg: #1d1d1f;
			--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5), 0 1px 3px rgba(0, 0, 0, 0.4);
			--shadow-md: 0 2px 4px rgba(0, 0, 0, 0.45), 0 8px 24px rgba(0, 0, 0, 0.5);
			--shadow-lg: 0 4px 8px rgba(0, 0, 0, 0.5), 0 20px 40px rgba(0, 0, 0, 0.55);
			--fides-ink: #0b0b0c;
			--fides-bg: #f5f5f4;
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
		letter-spacing: -0.005em;
	}

	.shell {
		max-width: 60rem;
		margin: 0 auto;
		padding: 2rem 1.5rem 5rem;
		display: flex;
		flex-direction: column;
		gap: 3rem;
		min-height: 100vh;
	}

	header {
		display: flex;
		align-items: center;
		gap: 1.25rem;
		flex-wrap: wrap;
		padding-bottom: 1.5rem;
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
		padding: 0.6rem 0.8rem 0.45rem;
		line-height: 0.95;
		letter-spacing: 0.04em;
		text-decoration: none;
		border: 1px solid var(--fides-bg);
		user-select: none;
		border-radius: var(--radius-sm);
		transition: transform 0.15s ease;
	}
	.fides:hover {
		transform: translateY(-1px);
	}
	.fides__mark {
		font-size: 1.05rem;
	}
	.fides__sub {
		font-size: 0.5rem;
		font-weight: 500;
		letter-spacing: 0.32em;
		text-align: center;
		padding-top: 0.18rem;
		border-top: 1px solid var(--fides-ink);
		margin-top: 0.22rem;
		opacity: 0.85;
	}
	.fides--small .fides__mark {
		font-size: 0.8rem;
	}
	.fides--small .fides__sub {
		font-size: 0.42rem;
		letter-spacing: 0.3em;
	}
	.fides--small {
		padding: 0.45rem 0.6rem 0.32rem;
	}

	.brand__wordmark {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
	}

	.wordmark {
		font-size: 1.45rem;
		font-weight: 500;
		letter-spacing: -0.025em;
		color: var(--ink);
		text-decoration: none;
		line-height: 1;
	}

	.byline {
		font-size: 0.68rem;
		color: var(--ink-2);
		letter-spacing: 0.01em;
		font-weight: 400;
	}

	nav {
		margin-left: auto;
		display: flex;
		gap: 0.5rem;
	}
	nav a {
		color: var(--ink-2);
		font-size: 0.875rem;
		font-weight: 500;
		text-decoration: none;
		padding: 0.5rem 0.85rem;
		border-radius: var(--radius-pill);
		transition: background 0.15s ease, color 0.15s ease;
	}
	nav a:hover {
		background: var(--chip-bg);
		color: var(--ink);
	}
	nav a[aria-current='page'] {
		background: var(--ink);
		color: var(--surface);
	}

	main {
		flex: 1;
	}

	footer {
		padding-top: 2rem;
		color: var(--ink-2);
		font-size: 0.82rem;
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		border-top: 1px solid var(--line);
	}

	.footer__brand {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.footer__copy {
		color: var(--ink-2);
		max-width: 38rem;
		line-height: 1.5;
	}
	.footer__copy b {
		color: var(--ink);
		font-weight: 600;
	}

	.attr {
		margin: 0;
		color: var(--ink-3);
		font-size: 0.78rem;
		line-height: 1.5;
	}
	footer a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-color: var(--ink-3);
	}

	/* ===== Mobile-first ===== */
	@media (max-width: 640px) {
		.shell {
			padding: 1.25rem 1rem 4rem;
			gap: 2rem;
		}
		header {
			gap: 0.85rem;
			padding-bottom: 1rem;
		}
		.brand {
			gap: 0.7rem;
		}
		.wordmark {
			font-size: 1.25rem;
		}
		.byline {
			display: none;
		}
		.fides__mark {
			font-size: 0.95rem;
		}
		nav {
			width: 100%;
			margin-left: 0;
			gap: 0.35rem;
			justify-content: stretch;
		}
		nav a {
			flex: 1;
			text-align: center;
			font-size: 0.85rem;
			padding: 0.55rem 0.5rem;
		}
	}
</style>
