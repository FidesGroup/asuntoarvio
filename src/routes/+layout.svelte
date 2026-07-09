<script lang="ts">
	import '@fontsource-variable/ibm-plex-sans';
	import { page } from '$app/state';
	let { children } = $props();
	const links = [
		{ href: '/', label: 'Analyysi' },
		{ href: '/kartta', label: 'Hintakartta' },
		{ href: '/tilaa', label: 'Asuntocardit' }
	];
	const fidesUrl = 'https://fidesgroup.fi';
</script>

<div class="shell">
	<header>
		<div class="brand">
			<a class="fides" href={fidesUrl} aria-label="Fides Group, etusivu" target="_blank" rel="noopener">
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
			kaupat postinumeroalueittain (CC BY 4.0). Suuntaa antava seula, ei arviolausunto eikä
			sijoitusneuvontaa.
		</p>
	</footer>
</div>

<style>
	:root {
		/* Brand — CLAUDE.md rule 10 */
		--baltic:     #0f6a78;
		--baltic-2:   #0a525d;
		--baltic-ink: #ffffff;
		--copper:     #a4512e;
		--copper-2:   #8a3f1f;
		--pine:       #2e6b46;
		--pine-2:     #1f5234;
		--over:       var(--copper);
		--under:      var(--pine);
		--accent:     var(--baltic);

		/* Neutrals */
		--bg:         #f7f6f4;
		--surface:    #ffffff;
		--ink:        #111827;
		--ink-2:      #4b5563;
		--ink-3:      #6b7280;
		--line:       #ececea;
		--line-2:     #d6d3d1;
		--chip-bg:    #f3f1ee;

		/* Tinted shadow ring (focus + drop shadow) */
		--ring:       rgba(15, 106, 120, 0.18);
		--shadow-sm:  0 1px 2px rgba(17, 24, 39, 0.04), 0 1px 3px rgba(17, 24, 39, 0.03);
		--shadow-md:  0 2px 4px -1px rgba(17, 24, 39, 0.04), 0 8px 24px -6px rgba(17, 24, 39, 0.08);
		--shadow-lg:  0 4px 8px -2px rgba(17, 24, 39, 0.05), 0 20px 40px -8px rgba(17, 24, 39, 0.1);
		--radius-sm:  8px;
		--radius-md:  12px;
		--radius-lg:  18px;
		--radius-pill: 999px;
		--fides-ink:  #ffffff;
		--fides-bg:   #111827;

		/* Type scale — fluid */
		--text-xs:   clamp(0.72rem, 0.70rem + 0.10vw, 0.78rem);
		--text-sm:   clamp(0.83rem, 0.81rem + 0.10vw, 0.88rem);
		--text-md:   1rem;
		--text-lg:   clamp(1.06rem, 1.02rem + 0.20vw, 1.13rem);
		--text-xl:   clamp(1.22rem, 1.15rem + 0.35vw, 1.38rem);
		--text-2xl:  clamp(1.45rem, 1.30rem + 0.75vw, 1.75rem);
		--text-3xl:  clamp(1.85rem, 1.50rem + 1.50vw, 2.40rem);
		--text-4xl:  clamp(2.40rem, 1.80rem + 2.50vw, 3.50rem);
		--text-hero: clamp(3.00rem, 2.00rem + 4.50vw, 5.00rem);

		/* Line-height */
		--lh-tight: 1.05;
		--lh-snug:  1.20;
		--lh-body:  1.60;
		--lh-list:  1.55;

		/* Letter-spacing */
		--ls-tightest: -0.04em;
		--ls-tight:    -0.025em;
		--ls-snug:     -0.01em;
		--ls-normal:   0;
		--ls-wide:     0.04em;
	}

	@media (prefers-color-scheme: dark) {
		:root {
			--bg:         #0b0b0c;
			--surface:    #151517;
			--ink:        #f5f5f4;
			--ink-2:      #c8c8cc;
			--ink-3:      #8a8a90;
			--line:       #232325;
			--line-2:     #2e2e30;
			--chip-bg:    #1d1d1f;
			--baltic:     #4fb3c0;
			--baltic-2:   #6fc6d2;
			--copper:     #d68464;
			--copper-2:   #e9a384;
			--pine:       #6cb386;
			--pine-2:     #8dc9a3;
			--over:       var(--copper);
			--under:      var(--pine);
			--accent:     var(--baltic);
			--ring:       rgba(79, 179, 192, 0.28);
			--fides-ink:  #0b0b0c;
			--fides-bg:   #f5f5f4;
		}
	}

	/* Must be :global — a bare `*` in a component style only reaches the
	   layout's own elements, so page-level inputs with width:100% + padding
	   overflowed their containers. */
	:global(*),
	:global(*::before),
	:global(*::after) {
		box-sizing: border-box;
	}

	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--ink);
		font-family: 'IBM Plex Sans Variable', 'IBM Plex Sans', 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif;
		line-height: var(--lh-body);
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		letter-spacing: var(--ls-snug);
	}

	:global(:focus-visible) {
		outline: 2px solid var(--baltic);
		outline-offset: 3px;
		border-radius: inherit;
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
		font-family: 'IBM Plex Sans Variable', 'IBM Plex Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
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
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		color: var(--ink);
		text-decoration: none;
		line-height: 1;
	}

	.byline {
		font-size: var(--text-xs);
		color: var(--ink-2);
		letter-spacing: var(--ls-snug);
		font-weight: 400;
	}

	nav {
		margin-left: auto;
		display: flex;
		gap: 0.5rem;
	}
	nav a {
		color: var(--ink-2);
		font-size: var(--text-sm);
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
		background: var(--baltic);
		color: var(--baltic-ink);
	}

	main {
		flex: 1;
	}

	footer {
		padding-top: 2rem;
		color: var(--ink-2);
		font-size: var(--text-sm);
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
		line-height: var(--lh-list);
	}
	.footer__copy b {
		color: var(--ink);
		font-weight: 600;
	}

	.attr {
		margin: 0;
		color: var(--ink-3);
		font-size: var(--text-xs);
		line-height: var(--lh-list);
	}
	footer a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 2px;
		text-decoration-color: var(--ink-3);
	}

	/* ===== Mobile-first (type is fluid via tokens) ===== */
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
			padding: 0.55rem 0.5rem;
		}
	}
</style>
