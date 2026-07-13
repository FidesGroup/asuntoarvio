<script lang="ts">
	let { data, form } = $props();
</script>

<svelte:head>
	<title>Tilaa | RehtiArvio by Fides</title>
	<meta
		name="description"
		content="RehtiArvio Sijoittaja -tilaus: asuntocardit: taloyhtiön syväkatsaus web-lähteistä koottuna, lähteineen."
	/>
</svelte:head>

<section class="hero">
	<span class="eyebrow">Hinnoittelu</span>
	<h1>Valitse itsellesi sopiva taso.</h1>
	<p class="lede">
		Ilmainen analyysi kertoo, mitä ilmoitus väittää. Asuntocard kertoo, mitä siitä löytyy
		muualta: remonttihistorian ristivarmistus, saman taloyhtiön muut myynnit, tontti- ja
		isännöintitiedot, jokainen väite lähteineen.
	</p>
</section>

<section class="pricing" aria-label="Hinnoittelutasot">
	<article class="tier">
		<header>
			<h2>Ilmainen</h2>
			<p class="tier__price"><b>0 &euro;</b><span class="tier__period">&mdash; aina ilmainen</span></p>
		</header>
		<ul class="tier__features">
			<li class="ok">Kohdeanalyysi ja hintakartta</li>
			<li class="ok">Jaettava vertailuraportti (/arvio)</li>
			<li class="ok">Koko maan hintakartta (1 724 postinumeroa)</li>
			<li class="ok">Kuntoarvio (suuntaa-antava haarukka)</li>
			<li class="no">Asuntocard (taloyhtiön syväkatsaus)</li>
			<li class="no">Saman taloyhtiön muut kohteet</li>
			<li class="no">Hälytykset uusista ilmoituksista</li>
		</ul>
		<a class="tier__cta tier__cta--ghost" href="/">Aloita ilmaiseksi</a>
	</article>

	<article class="tier tier--featured">
		<span class="tier__badge">Suosituin</span>
		<header>
			<h2>Asuntocard</h2>
			<p class="tier__price"><b>19 &euro;</b><span class="tier__period">/ kertamaksu</span></p>
		</header>
		<ul class="tier__features">
			<li class="ok">Kaikki ilmaisen ominaisuudet</li>
			<li class="ok">Remonttihistorian ristivarmistus</li>
			<li class="ok">Saman taloyhtiön muut myynnit</li>
			<li class="ok">Tontin ja isännöinnin varmistus</li>
			<li class="ok">Punaiset liput: ristiriidat lähteissä</li>
			<li class="ok">PDF-raportti, jokainen löydös lähde-URL:eineen</li>
			<li class="no">Hälytykset uusista ilmoituksista</li>
		</ul>
		{#if data.enabled}
			<form method="POST" class="tier__form">
				<input type="hidden" name="plan" value="single" />
				<input type="email" name="email" required placeholder="sinä@esimerkki.fi" class="tier__email" />
				<button type="submit" class="tier__cta tier__cta--solid">Osta asuntocard &mdash; 19 &euro;</button>
			</form>
			{#if form?.error}<p class="error">{form.error}</p>{/if}
			<p class="fine">Maksu Stripen kautta. Ei sitoutumista.</p>
		{:else}
			<a class="tier__cta tier__cta--solid" href="/#waitlist">Liity odotuslistalle</a>
		{/if}
	</article>

	<article class="tier">
		<header>
			<h2>Sijoittaja Pro</h2>
			<p class="tier__price">
				<b>7 &euro;</b><span class="tier__period">/ kk &middot; tai <b>69 &euro;</b> / v</span>
			</p>
		</header>
		<ul class="tier__features">
			<li class="ok">Kaikki Asuntocard-ominaisuudet</li>
			<li class="ok">Rajattomat asuntocardit</li>
			<li class="ok">Hälytykset uusista alueen ilmoituksista</li>
			<li class="ok">Seurantalista ja vertailutyökalu</li>
			<li class="ok">API pääsy (beta) &mdash; MCP-integraatio</li>
			<li class="ok">Vuositilauksella <b>-18 %</b> (69 &euro; vs 84 &euro;)</li>
			<li class="ok">Peru milloin tahansa</li>
		</ul>
		{#if data.enabled}
			<form method="POST" class="tier__form">
				<input type="hidden" name="plan" value="pro" />
				<input type="email" name="email" required placeholder="sinä@esimerkki.fi" class="tier__email" />
				<button type="submit" class="tier__cta tier__cta--ghost">Aloita Pro &mdash; 7 &euro;/kk</button>
			</form>
			{#if form?.error}<p class="error">{form.error}</p>{/if}
			<p class="fine">Vuosimaksu valittavissa seuraavassa vaiheessa.</p>
		{:else}
			<a class="tier__cta tier__cta--ghost" href="/#waitlist">Liity odotuslistalle</a>
		{/if}
	</article>
</section>

<style>
	.eyebrow {
		display: inline-block;
		font-size: 0.78rem;
		font-weight: 500;
		color: var(--ink-2);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		margin-bottom: 0.5rem;
	}
	.hero h1 {
		font-size: 1.9rem;
		letter-spacing: -0.02em;
		margin: 0 0 0.6rem;
	}
	.lede {
		color: var(--ink-2);
		max-width: 44rem;
		margin: 0 0 2rem;
	}
	.pricing {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-top: 2rem;
	}
	.tier {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--line);
		border-radius: var(--radius-lg);
		padding: 1.5rem 1.5rem 1.75rem;
		box-shadow: var(--shadow-sm);
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.tier--featured {
		border-color: var(--baltic);
		box-shadow: var(--shadow-md);
	}
	.tier__badge {
		position: absolute;
		top: -0.6rem;
		left: 1.5rem;
		background: var(--baltic);
		color: var(--baltic-ink);
		font-size: var(--text-xs);
		font-weight: 600;
		padding: 0.2rem 0.6rem;
		border-radius: var(--radius-pill);
		letter-spacing: var(--ls-wide);
	}
	.tier h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.4rem;
		color: var(--ink);
		letter-spacing: var(--ls-snug);
	}
	.tier__price {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}
	.tier__price b {
		font-size: var(--text-3xl);
		font-weight: 600;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		letter-spacing: var(--ls-tight);
	}
	.tier__period {
		font-size: var(--text-sm);
		color: var(--ink-2);
		font-weight: 400;
	}
	.tier__features {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}
	.tier__features li {
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-list);
		padding-left: 1.5rem;
		position: relative;
	}
	.tier__features li::before {
		position: absolute;
		left: 0;
		top: 0.05em;
		font-weight: 600;
		font-size: 1rem;
	}
	.tier__features li.ok::before {
		content: '+';
		color: var(--under);
	}
	.tier__features li.no::before {
		content: '\2212';
		color: var(--ink-3);
	}
	.tier__features li.no {
		color: var(--ink-3);
	}
	.tier__cta {
		display: inline-flex;
		justify-content: center;
		align-items: center;
		font: inherit;
		font-weight: 500;
		padding: 0.75rem 1.1rem;
		border-radius: var(--radius-pill);
		text-decoration: none;
		cursor: pointer;
		letter-spacing: var(--ls-snug);
		text-align: center;
	}
	.tier__cta--solid {
		background: var(--baltic);
		color: var(--baltic-ink);
		border: 1px solid var(--baltic);
	}
	.tier__cta--solid:hover { background: var(--baltic-2); border-color: var(--baltic-2); }
	.tier__cta--ghost {
		background: transparent;
		color: var(--baltic);
		border: 1px solid var(--baltic);
	}
	.tier__cta--ghost:hover { background: var(--baltic); color: var(--baltic-ink); }
	.tier__form {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: auto;
	}
	.tier__email {
		font: inherit;
		font-size: var(--text-sm);
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 0.6rem 0.75rem;
		border-radius: var(--radius-md);
	}
	.tier__email:focus-visible {
		outline: none;
		border-color: var(--baltic);
		box-shadow: 0 0 0 3px var(--ring);
	}
	.fine {
		color: var(--ink-3);
		font-size: var(--text-xs);
		margin: 0.5rem 0 0;
		text-align: center;
	}
	@media (max-width: 820px) {
		.pricing { grid-template-columns: 1fr; }
	}
</style>