<script lang="ts">
	import { copy } from '$lib/copy/fi';

	let { areas = null }: { areas?: number | null } = $props();

	const fidesUrl = 'https://fidesgroup.fi';
</script>

<footer class="ftr">
	<div class="ftr__brand">
		<a
			class="fides"
			href={fidesUrl}
			aria-label="Fides Group"
			target="_blank"
			rel="noopener"
		>
			<span class="fides__mark">FIDES</span>
			<span class="fides__sub">GROUP</span>
		</a>
		<p class="ftr__copy">
			<b>RehtiArvio</b> {copy.footer.brandLine}
		</p>
	</div>

	<nav class="ftr__nav" aria-label="Alatunnisteen linkit">
		<a href="/miksi">{copy.footer.links.why}</a>
		<a href="/#miten">{copy.footer.links.how}</a>
		<a href="https://stat.fi/tilasto/ashi" target="_blank" rel="noopener">{copy.footer.links.statfi}</a>
		<a href="/tietosuoja">{copy.footer.links.privacy}</a>
		<a href="/evasteet">{copy.footer.links.cookies}</a>
		<a href={fidesUrl} target="_blank" rel="noopener">{copy.footer.links.fides}</a>
	</nav>

	<p class="ftr__attr">{copy.footer.attribution}</p>
	{#if areas}
		<p class="ftr__data num">{copy.footer.dataLine(areas)}</p>
	{/if}
</footer>

<style>
	.ftr {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		padding-top: var(--space-9);
		border-top: 1px solid var(--border);
		color: var(--ink-2);
		font-size: var(--text-sm);
	}

	.ftr__brand {
		display: flex;
		gap: 1.25rem;
		align-items: flex-start;
		flex-wrap: wrap;
	}

	.ftr__copy {
		max-width: 36rem;
		line-height: var(--lh-list);
		margin: 0;
	}

	.ftr__copy b {
		color: var(--ink);
		font-weight: 600;
	}

	.fides {
		font-family: var(--font-sans);
		font-weight: 700;
		background: var(--ink);
		color: var(--bg);
		display: inline-flex;
		flex-direction: column;
		align-items: stretch;
		justify-content: center;
		padding: 0.45rem 0.6rem 0.32rem;
		line-height: 0.95;
		letter-spacing: 0.04em;
		text-decoration: none;
		border-radius: var(--radius-sm);
		flex-shrink: 0;
		transition: opacity var(--dur-fast) var(--ease-standard);
	}

	.fides:hover { opacity: 0.85; }

	.fides__mark { font-size: 0.85rem; }
	.fides__sub {
		font-size: 0.42rem;
		letter-spacing: 0.3em;
		text-align: center;
		padding-top: 0.18rem;
		border-top: 1px solid currentColor;
		margin-top: 0.22rem;
		opacity: 0.85;
	}

	.ftr__nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.4rem;
	}

	.ftr__nav a {
		color: var(--ink-2);
		text-decoration: none;
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		padding: 0.2rem 0;
		border-bottom: 1px solid var(--border);
		transition: color var(--dur-fast) var(--ease-standard), border-color var(--dur-fast) var(--ease-standard);
	}

	.ftr__nav a:hover {
		color: var(--ink);
		border-bottom-color: var(--ink-3);
	}

	.ftr__attr {
		margin: 0;
		color: var(--ink-3);
		font-size: var(--text-xs);
		line-height: var(--lh-list);
		max-width: 50rem;
	}

	.ftr__data {
		margin: 0;
		color: var(--ink-3);
		font-size: var(--text-xs);
		line-height: var(--lh-list);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}
</style>