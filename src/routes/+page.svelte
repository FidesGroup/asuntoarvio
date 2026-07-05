<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Asuntoarvio — onko pyyntihinta yli vai alle markkinan?</title>
</svelte:head>

<section class="hero">
	<h1>Onko pyyntihinta yli vai alle alueen toteutuneiden kauppojen?</h1>
	<p>
		Syötä myynti-ilmoituksen perustiedot. Vertaamme neliöhintaa Tilastokeskuksen julkaisemiin
		toteutuneisiin kauppahintoihin samalla postinumeroalueella — et pyyntihintoihin.
	</p>
</section>

<form method="GET" action="/arvio">
	<div class="grid">
		<label>
			Postinumero
			<input name="pc" inputmode="numeric" pattern={'[0-9]{5}'} placeholder="00530" required list="known-pc" />
		</label>
		<label>
			Huonetyyppi
			<select name="rt" required>
				<option value="yksiö">Yksiö</option>
				<option value="kaksio" selected>Kaksio</option>
				<option value="kolmio+">Kolmio tai suurempi</option>
			</select>
		</label>
		<label>
			Pinta-ala, m²
			<input name="m2" inputmode="decimal" type="number" step="0.5" min="10" max="400" placeholder="54" required />
		</label>
		<label>
			Hinta, €
			<input name="price" inputmode="numeric" type="number" step="1000" min="10000" placeholder="289 000" required />
		</label>
		<label>
			Hintatyyppi
			<select name="debtfree">
				<option value="1" selected>Velaton hinta</option>
				<option value="0">Myyntihinta</option>
			</select>
		</label>
		<label>
			Rakennusvuosi <span class="opt">(valinnainen)</span>
			<input name="yr" inputmode="numeric" type="number" min="1800" max="2030" placeholder="1961" />
		</label>
	</div>
	<datalist id="known-pc">
		{#each data.postalCodes as pc (pc)}<option value={pc}></option>{/each}
	</datalist>
	<button type="submit">Vertaa markkinaan</button>
	<p class="note">
		Kattavuus tässä esiversiossa: {data.postalCodes.length} Helsingin postinumeroaluetta.
		Tarkempi analyysi taloyhtiötiedoilla: <a href="/analyysi">liitä myynti-ilmoitus</a>.
	</p>
</form>

<style>
	.hero h1 {
		font-size: 1.9rem;
		line-height: 1.2;
		letter-spacing: -0.02em;
		text-wrap: balance;
		margin: 0 0 0.75rem;
	}
	.hero p {
		color: var(--ink-2);
		max-width: 38rem;
		margin: 0 0 2rem;
	}
	form {
		background: var(--surface);
		border: 1px solid var(--line);
		padding: 1.5rem;
	}
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: 1rem 1.25rem;
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--ink-2);
	}
	.opt {
		text-transform: none;
		letter-spacing: 0;
		font-weight: 400;
	}
	input,
	select {
		font: inherit;
		font-variant-numeric: tabular-nums;
		color: var(--ink);
		background: var(--bg);
		border: 1px solid var(--line);
		padding: 0.6rem 0.7rem;
		border-radius: 0;
	}
	input:focus-visible,
	select:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--accent);
		outline-offset: 1px;
	}
	button {
		margin-top: 1.25rem;
		font: inherit;
		font-weight: 700;
		background: var(--accent);
		color: var(--bg);
		border: none;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
	}
	.note {
		margin: 1rem 0 0;
		font-size: 0.8rem;
		color: var(--ink-2);
	}
</style>
