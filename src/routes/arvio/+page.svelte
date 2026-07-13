<script lang="ts">
	import { page } from '$app/stores';
	let { data } = $props();
	const { facts, verdict, yield: yieldResult, rentEstimate } = $derived(data);
	const fmt = new Intl.NumberFormat('fi-FI');
	const overUnder = $derived(
		verdict.deltaPct === null ? null : verdict.deltaPct >= 0 ? 'over' : 'under'
	);
	const verdictLabel = $derived(
		verdict.deltaPct === null
			? 'Ei vertailuarvoa'
			: verdict.deltaPct >= 0
				? 'Pyyntihinta on alueen toteutuneiden kauppojen yläpuolella'
				: 'Pyyntihinta on alueen toteutuneiden kauppojen alapuolella'
	);
	const shareUrl = $derived($page.url.toString());
	const ogImageUrl = $derived(`/arvio/og?${$page.url.searchParams.toString()}`);
	let copyState = $state<'idle' | 'copied' | 'error'>('idle');
	async function copyShareLink() {
		try {
			await navigator.clipboard.writeText(shareUrl);
			copyState = 'copied';
			setTimeout(() => (copyState = 'idle'), 2000);
		} catch {
			copyState = 'error';
			setTimeout(() => (copyState = 'idle'), 2000);
		}
	}
</script>

<svelte:head>
	<title>
		{verdict.deltaPct === null
			? 'Ei vertailuarvoa'
			: `${verdict.deltaPct > 0 ? '+' : ''}${verdict.deltaPct} % vs alue`} | RehtiArvio by Fides
	</title>
	<meta property="og:title" content={`RehtiArvio: ${verdictLabel}`} />
	<meta property="og:description" content={`${facts.postalCode} · ${facts.roomsType} · ${facts.livingAreaM2} m² — ${verdictLabel}`} />
	<meta property="og:image" content={ogImageUrl} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={`RehtiArvio: ${verdictLabel}`} />
	<meta name="twitter:description" content={`${facts.postalCode} · ${facts.roomsType} · ${facts.livingAreaM2} m²`} />
	<meta name="twitter:image" content={ogImageUrl} />
</svelte:head>

<article class="verdict-page">
	<p class="crumb">
		{facts.postalCode} · {facts.roomsType} · {facts.livingAreaM2} m²
		{#if facts.buildYear}· rak. {facts.buildYear}{/if}
	</p>

	<div class="verdict-grid">
		<aside class="verdict-side">
			<div class="hero">
				{#if verdict.deltaPct !== null}
					<span class="eyebrow">Analyysin tulos</span>
					<h1 class={overUnder}>
						{verdict.deltaPct > 0 ? '+' : ''}{String(verdict.deltaPct).replace('.', ',')} %
					</h1>
					<p class="summary">{verdictLabel}</p>
				{:else}
					<span class="eyebrow">Analyysin tulos</span>
					<h1 class="none">Ei vertailuarvoa</h1>
					<p class="summary">Tälle alueelle ja huonetyypille ei löydy riittävästi toteutuneita kauppoja.</p>
				{/if}
			</div>

			<dl>
				<div>
					<dt>Kohteen neliöhinta</dt>
					<dd>{fmt.format(verdict.listingEurM2)} <span class="unit">€/m²</span></dd>
				</div>
				<div>
					<dt>Alueen toteutuneet kaupat</dt>
					<dd>
						{#if verdict.benchmarkEurM2}
							{fmt.format(verdict.benchmarkEurM2)} <span class="unit">€/m²</span>
						{:else}
							<span class="dash">–</span>
						{/if}
					</dd>
				</div>
				<div>
					<dt>Kauppoja (4 neljännestä)</dt>
					<dd>
						{fmt.format(verdict.transactions4q)}
						{#if verdict.latestQuarter}<span class="meta">· viimeisin {verdict.latestQuarter}</span>{/if}
					</dd>
				</div>
				<div>
					<dt>Luotettavuus</dt>
					<dd><span class="chip {verdict.confidence === 'korkea' ? 'chip--solid' : ''}">{verdict.confidence}</span></dd>
				</div>
			</dl>

			<div class="side-actions">
				<button class="share" type="button" onclick={copyShareLink}>
					{#if copyState === 'copied'}Linkki kopioitu{:else if copyState === 'error'}Kopiointi epäonnistui{:else}Kopioi linkki / Jaa{/if}
				</button>
			</div>
		</aside>

		<div class="verdict-main">
			<section class="flags card">
				<h2>Tulkinnan varaukset</h2>
				<ul>
					{#each verdict.flags as flag (flag)}
						<li>{flag}</li>
					{/each}
				</ul>
			</section>

			{#if yieldResult}
				<section class="yield card">
					<h2>Vuokratuotto</h2>
					<dl class="yield-grid">
						<div>
							<dt>Bruttotuotto</dt>
							<dd>{String(yieldResult.grossYieldPct).replace('.', ',')} <span class="unit">%</span></dd>
						</div>
						<div>
							<dt>Nettotuotto</dt>
							<dd>{String(yieldResult.netYieldPct).replace('.', ',')} <span class="unit">%</span></dd>
						</div>
						<div>
							<dt>Nettokassavirta / kk</dt>
							<dd>{fmt.format(yieldResult.monthlyNetEur)} <span class="unit">€</span></dd>
						</div>
						<div>
							<dt>Remonttivaraus / v</dt>
							<dd>{fmt.format(yieldResult.reserveEurYr)} <span class="unit">€ (oletus)</span></dd>
						</div>
					</dl>
					<p class="yield-note">
						Laskelma sisältää varainsiirtoveron 1,5 % (vero.fi 2026). Remonttivaraus on
						oletusarvo, ei tilastoista laskettu — vähennä se todellisesta tuotosta tai
						syötä tarkempi luku. {yieldResult.rentSource === 'estimate'
							? `Vuokra on alueen tilastollinen arvio${rentEstimate?.tier === 'town' ? ' (kunnan taso)' : rentEstimate?.tier === 'mk' ? ' (maakunnan taso)' : ''}${rentEstimate?.latestQuarter ? `, viimeisin ${rentEstimate.latestQuarter}` : ''}.`
							: ''}
					</p>
					{#if yieldResult.flags.length}
						<ul class="yield-flags">
							{#each yieldResult.flags as flag (flag)}
								<li>{flag}</li>
							{/each}
						</ul>
					{/if}
				</section>
			{/if}

			<div class="footer-row">
				<a class="back" href="/">← Takaisin hakuun</a>
			</div>
		</div>
	</div>
</article>

<style>
	.crumb {
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		font-size: var(--text-xs);
		margin: 0 0 1.5rem;
		font-weight: 500;
	}

	.hero {
		margin-bottom: 2.5rem;
	}

	.eyebrow {
		display: inline-block;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-2);
		letter-spacing: var(--ls-wide);
		background: var(--chip-bg);
		padding: 0.35rem 0.7rem;
		border-radius: var(--radius-pill);
		margin-bottom: 1.1rem;
	}

	h1 {
		font-size: var(--text-hero);
		line-height: var(--lh-tight);
		letter-spacing: var(--ls-tightest);
		margin: 0 0 0.85rem;
		font-variant-numeric: tabular-nums;
		font-weight: 600;
	}
	h1.over { color: var(--over); }
	h1.under { color: var(--under); }
	h1.none { color: var(--ink); font-size: var(--text-2xl); }

	.summary {
		color: var(--ink-2);
		font-size: var(--text-lg);
		line-height: var(--lh-body);
		max-width: 36rem;
		margin: 0;
	}

	dl {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
		margin: 0 0 2rem;
	}
	dl div {
		background: var(--sky);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		padding: 1.1rem 1.25rem;
		box-shadow: var(--shadow-sm);
	}
	dt {
		font-size: var(--text-xs);
		color: var(--ink-2);
		font-weight: 500;
		margin-bottom: 0.4rem;
		letter-spacing: var(--ls-wide);
	}
	dd {
		margin: 0;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		font-size: var(--text-xl);
		letter-spacing: var(--ls-tight);
	}
	.unit {
		font-size: var(--text-sm);
		color: var(--ink-2);
		font-weight: 500;
		margin-left: 0.15rem;
	}
	.meta {
		display: block;
		font-size: var(--text-xs);
		color: var(--ink-3);
		font-weight: 400;
		margin-top: 0.25rem;
	}
	.dash {
		color: var(--ink-3);
	}

	.chip {
		display: inline-block;
		background: var(--chip-bg);
		color: var(--ink-2);
		padding: 0.2rem 0.6rem;
		font-size: var(--text-sm);
		border-radius: var(--radius-pill);
		font-weight: 500;
	}
	.chip--solid {
		background: var(--ink);
		color: var(--surface);
	}

	.card {
		background: var(--sky);
		border: 1px solid var(--line);
		padding: 1.5rem 1.75rem;
		box-shadow: var(--shadow-sm);
		border-radius: var(--radius-lg);
	}

	.flags h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.75rem;
		color: var(--ink);
		letter-spacing: var(--ls-snug);
	}
	.flags ul {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--ink-2);
		display: flex;
		flex-direction: column;
		gap: 0.45rem;
		max-width: 42rem;
		line-height: var(--lh-list);
	}

	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 2rem;
		color: var(--ink-2);
		text-decoration: none;
		font-weight: 500;
		font-size: var(--text-md);
		padding: 0.5rem 0;
		transition: color 0.15s ease;
	}
	.back:hover {
		color: var(--ink);
	}

	.verdict-page {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.verdict-grid {
		display: grid;
		grid-template-columns: minmax(18rem, 22rem) 1fr;
		gap: 1.5rem;
		align-items: start;
	}
	.verdict-side {
		position: sticky;
		top: 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		padding: 1.5rem 1.5rem 1.75rem;
		background: var(--sky);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-md);
	}
	.verdict-side .hero {
		margin: 0;
	}
	.verdict-main {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.side-actions {
		display: flex;
		gap: 0.6rem;
		margin-top: 0.5rem;
	}
	.side-actions .share {
		flex: 1;
		text-align: center;
	}
	.footer-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		margin-top: 1rem;
		flex-wrap: wrap;
	}

	.share {
		background: var(--ink);
		color: var(--surface);
		border: none;
		padding: 0.6rem 1rem;
		font: inherit;
		font-weight: 500;
		font-size: var(--text-md);
		border-radius: var(--radius-pill);
		cursor: pointer;
		transition: opacity 0.15s ease;
	}
	.share:hover {
		opacity: 0.85;
	}

	.yield-grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 0.75rem;
		margin: 0 0 1rem;
	}
	.yield-grid div {
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-md);
		padding: 1rem 1.15rem;
	}

	.yield-note {
		color: var(--ink-3);
		font-size: var(--text-sm);
		line-height: var(--lh-body);
		margin: 0 0 0.75rem;
		max-width: 42rem;
	}

	.yield-flags {
		margin: 0;
		padding-left: 1.25rem;
		color: var(--ink-2);
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		max-width: 42rem;
		line-height: var(--lh-list);
		font-size: var(--text-sm);
	}

	@media (max-width: 720px) {
		.yield-grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.verdict-grid { grid-template-columns: 1fr; }
		.verdict-side { position: static; }
	}
	@media (max-width: 420px) {
		.yield-grid {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 720px) {
		dl {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
		.card {
			padding: 1.25rem 1.4rem;
		}
	}
	@media (max-width: 420px) {
		dl {
			grid-template-columns: 1fr;
		}
	}
</style>