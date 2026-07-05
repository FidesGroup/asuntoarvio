<script lang="ts">
	let { children } = $props();
</script>

<div class="shell">
	<header>
		<a class="wordmark" href="/">asunto<span>arvio</span></a>
		<span class="tagline">Pyyntihinta vastaan toteutuneet kaupat</span>
		<nav>
			<a href="/kartta">Hintakartta</a>
			<a href="/analyysi">Ilmoitusanalyysi</a>
		</nav>
	</header>
	<main>
		{@render children()}
	</main>
	<footer>
		<p>
			Hintavertailu: <a href="https://stat.fi/tilasto/ashi">Lähde: Tilastokeskus</a>, vanhojen
			osakeasuntojen kaupat postinumeroalueittain (CC BY 4.0). Suuntaa antava seula — ei
			arviolausunto eikä sijoitusneuvontaa.
		</p>
	</footer>
</div>

<style>
	:global(:root) {
		/* Finnish-functionalist ground: cool paper with a faint Baltic bias */
		--bg: #f6f8f8;
		--surface: #ffffff;
		--ink: #17272b;
		--ink-2: #51666c;
		--line: #d8e0e1;
		--accent: #0f6a78; /* Baltic petrol */
		--over: #a4512e; /* copper: above market */
		--under: #2e6b46; /* pine: below market */
		--chip-bg: #e8eeef;
	}
	@media (prefers-color-scheme: dark) {
		:global(:root) {
			--bg: #131b1d;
			--surface: #1a2426;
			--ink: #e4ecec;
			--ink-2: #93a7ab;
			--line: #2c3a3d;
			--accent: #4fb3c1;
			--over: #d98a63;
			--under: #7cc39a;
			--chip-bg: #233033;
		}
	}
	:global([data-theme='dark']) {
		--bg: #131b1d;
		--surface: #1a2426;
		--ink: #e4ecec;
		--ink-2: #93a7ab;
		--line: #2c3a3d;
		--accent: #4fb3c1;
		--over: #d98a63;
		--under: #7cc39a;
		--chip-bg: #233033;
	}
	:global([data-theme='light']) {
		--bg: #f6f8f8;
		--surface: #ffffff;
		--ink: #17272b;
		--ink-2: #51666c;
		--line: #d8e0e1;
		--accent: #0f6a78;
		--over: #a4512e;
		--under: #2e6b46;
		--chip-bg: #e8eeef;
	}

	:global(*) {
		box-sizing: border-box;
	}
	:global(body) {
		margin: 0;
		background: var(--bg);
		color: var(--ink);
		font-family: 'Helvetica Neue', Helvetica, Arial, system-ui, sans-serif;
		line-height: 1.55;
		-webkit-font-smoothing: antialiased;
	}
	.shell {
		max-width: 44rem;
		margin: 0 auto;
		padding: 1.5rem 1.25rem 4rem;
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		min-height: 100vh;
	}
	header {
		display: flex;
		align-items: baseline;
		gap: 1rem;
		flex-wrap: wrap;
		border-bottom: 2px solid var(--ink);
		padding-bottom: 0.75rem;
	}
	.wordmark {
		font-size: 1.35rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--ink);
		text-decoration: none;
	}
	.wordmark span {
		color: var(--accent);
	}
	.tagline {
		color: var(--ink-2);
		font-size: 0.85rem;
		text-transform: uppercase;
		letter-spacing: 0.06em;
	}
	nav {
		margin-left: auto;
		display: flex;
		gap: 1rem;
	}
	nav a {
		color: var(--accent);
		font-size: 0.85rem;
		font-weight: 600;
		text-decoration: none;
	}
	nav a:hover {
		text-decoration: underline;
	}
	main {
		flex: 1;
	}
	footer {
		border-top: 1px solid var(--line);
		padding-top: 1rem;
		color: var(--ink-2);
		font-size: 0.8rem;
	}
	footer a {
		color: var(--accent);
	}
</style>
