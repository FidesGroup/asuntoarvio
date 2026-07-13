<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Miksi RehtiArvio? | RehtiArvio by Fides</title>
	<meta
		name="description"
		content="Miten RehtiArvio toimii, mistä data tulee, ja mitä työkalu ei tee."
	/>
</svelte:head>

<article class="miksi">
	<span class="eyebrow">Miksi RehtiArvio?</span>
	<h1>Toteutuneet hinnat, ei markkinahypetystä.</h1>
	<p class="lede">
		RehtiArvio kertoo, mitä asunnot oikeasti maksoivat — ei mitä välittäjä sanoo niiden
		maksavan. Työkalu on Fides Groupin rakentama, ilmainen eikä sisällä mainoksia.
	</p>

	<section class="card">
		<h2>Mistä data tulee</h2>
		<p>
			Kaikki vertailuhinnat tulevat <a href="https://stat.fi" target="_blank" rel="noopener">Tilastokeskukselta</a>
			(CC BY 4.0):
		</p>
		<ul>
			<li><b>13mt</b> — vanhojen osakeasuntojen neliöhinnat postinumeroalueittain, neljännesvuosittain.</li>
			<li><b>15hw</b> — vanhojen omakotitalojen neliöhinnat aluetasolla, neljännesvuosittain.</li>
			<li><b>asvu 13eb</b> — asuntojen vuokrat postinumeroalueittain, neljännesvuosittain.</li>
		</ul>
		<p>
			Aineistot päivittyvät Tilastokeskuksen julkaisuaikataulun mukaan. Tilastokeskuksen
			vaatima lähdemerkintä näkyy sivuston alatunnisteessa ja jokaisen luvun yhteydessä.
		</p>
	</section>

	<section class="card">
		<h2>Miten vertailu toimii</h2>
		<ol>
			<li>Liität Oikotie-, Etuovi- tai välittäjäsivun URL-osoitteen (tai ilmoituksen tekstin).</li>
			<li>Järjestelmä poimii ilmoituksesta hinnan, pinta-alan, huoneluvun, vastikkeet ja remontit.</li>
			<li>Vertailemme hinnan postinumeroalueen toteutuneisiin kauppoihin (4 viimeisintä neljännestä).</li>
			<li>Saat delta-prosentin, luotettavuusluokan ja lista asioista, jotka on hyvä tarkistaa.</li>
		</ol>
		<p>
			Jos postinumeroalueelta ei löydy riittävästi kauppoja (alle 30 neljänneksessä),
			annamme kuntoon perustuvan hinta-arvion haarukan. Haarukka on merkitty selvästi
			suuntaa-antavaksi eikä sitä pidä sekoittaa toteutuneeseen vertailuun.
		</p>
	</section>

	<section class="card">
		<h2>Mitä RehtiArvio ei tee</h2>
		<ul>
			<li>Ei arviolausuntoja eikä sijoitusneuvontaa.</li>
			<li>Ei ota kantaa yksittäisen asunnon kuntoon — kuntotutkimus on aina ostajan tehtävä.</li>
			<li>Ei sisällä mainoksia, eikä myy dataa kolmansille osapuolille.</li>
			<li>Ei tallenna ilmoituksia, osoitteita tai käyttäjätietoja palvelimelle (ks. <a href="/#yksityisyys">yksityisyys</a>).</li>
		</ul>
	</section>

	<section class="card">
		<h2>Luotettavuusluokat</h2>
		<p>Jokainen arvio kertoo mihin se perustuu:</p>
		<ul>
			<li><b>T1 — Postinumeroaluevertailu</b>: vähintään 30 toteutunutta kauppaa neljännellä. Korkea luotettavuus, kun kauppoja on yli 100.</li>
			<li><b>T3 — Aluevertailu</b>: käytetään, kun postinumeroalueelta ei löydy dataa (omakotitalot usein).</li>
			<li><b>T4 — Kuntoarvio</b>: kun vertailukauppoja ei ole riittävästi. Arvio perustuu kuntoon, ikään ja tehtyihin remontteihin. Aina merkitty suuntaa-antavaksi.</li>
		</ul>
	</section>

	<section class="card">
		<h2>Katettu alue</h2>
		<p>
			Postinumeroalueita: <b>{Intl.NumberFormat('fi-FI').format(data.count)}</b> · Julkaistua
			dataa osa-alueilla, joilla Tilastokeskus on julkaissut kauppoja. Voit tarkistaa kattavuuden
			<a href="/kartta">hintakartalta</a>.
		</p>
	</section>

	<a class="back" href="/">← Takaisin hakuun</a>
</article>

<style>
	.miksi {
		display: flex;
		flex-direction: column;
		gap: 1rem;
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
	}
	h1 {
		font-size: var(--text-3xl);
		letter-spacing: var(--ls-tight);
		margin: 0;
		font-weight: 600;
		line-height: var(--lh-snug);
	}
	.lede {
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
		margin: 0 0 1rem;
		max-width: 42rem;
	}
	.card {
		background: var(--sky);
		border: 1px solid var(--line);
		padding: 1.5rem 1.75rem;
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-sm);
	}
	.card h2 {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0 0 0.7rem;
		letter-spacing: var(--ls-snug);
	}
	.card p {
		margin: 0 0 0.6rem;
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
	}
	.card ul, .card ol {
		margin: 0 0 0.6rem;
		padding-left: 1.25rem;
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		color: var(--ink-2);
	}
	.card a {
		color: var(--ink);
		text-decoration: underline;
		text-underline-offset: 3px;
		text-decoration-color: var(--ink-3);
	}
	.back {
		display: inline-flex;
		align-items: center;
		gap: 0.4rem;
		margin-top: 1rem;
		color: var(--ink-2);
		text-decoration: none;
		font-weight: 500;
	}
	.back:hover { color: var(--ink); }
</style>