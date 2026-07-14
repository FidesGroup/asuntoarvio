<script lang="ts">
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	type Outcome = 'over' | 'under' | 'estimate';
	type CaseItem = { pc: string; rooms: string; outcome: Outcome; delta: string | null; body: string };

	const items: CaseItem[] = [
		{
			pc: '00100',
			rooms: 'yksiö',
			outcome: 'under',
			delta: '−8,2 %',
			body: 'Ensiasunnon ostaja huomasi vertailun näyttävän pyyntihinnan noin 22 000 € alle alueen tason. Syyksi paljastui tuleva putkiremontti: ostaja budjetoi 320 €/m² lisää ja tarjosi vähemmän.'
		},
		{
			pc: '00200',
			rooms: 'kolmio+',
			outcome: 'over',
			delta: '+14,7 %',
			body: 'Perhe vertaili isoa kolmiota ja sai 45 000 € yli alueen mediaanin. Lähialueen toteutuneet kaupat osoittivat kohteen olevan kuitenkin linjassa kadun muiden kauppojen kanssa, joten neuvottelu jatkui.'
		},
		{
			pc: '33100',
			rooms: 'rivitalo',
			outcome: 'estimate',
			delta: null,
			body: 'Rivitalon ostaja sai alueelta vain 12 kauppaa neljänneksessä. Kuntoarvio (hyvä kunto, 1998 rakennettu, putket tehty) arvioi hinnan haarukaksi 178 000–196 000 €.'
		},
		{
			pc: '90500',
			rooms: 'omakotitalo',
			outcome: 'estimate',
			delta: null,
			body: 'Omakotitalon ostajalle työkalu ei antanut euromääräistä eroa. Aluevertailu varoitti, että tontin arvo vaihtelee paljon eikä €/m² yksin riitä hinta-arvioksi. Ostaja tilasi kuntotarkastuksen ennen tarjousta.'
		}
	];

	function outcomeLabel(o: Outcome) {
		if (o === 'over') return copy.landing.cases.outcomes.over;
		if (o === 'under') return copy.landing.cases.outcomes.under;
		return copy.landing.cases.outcomes.estimate;
	}
</script>

<section class="cases" aria-label={copy.landing.cases.h2}>
	<header class="head">
		<h2 class="head__title">{copy.landing.cases.h2}</h2>
	</header>
	<div class="grid">
		{#each items as c, i (c.pc)}
			<article class="case reveal" data-stagger={i + 1} use:inview>
				<div class="case__top">
					<span class="case__crumb">{c.pc} · {c.rooms}</span>
					<span class="case__delta case__delta--{c.outcome}">
						{#if c.delta}{c.delta}<span class="case__label">{outcomeLabel(c.outcome)}</span>{:else}{outcomeLabel(c.outcome)}<span class="case__label">kuntoarvio</span>{/if}
					</span>
				</div>
				<p class="case__body">{c.body}</p>
			</article>
		{/each}
	</div>
</section>

<style>
	.cases {
		display: flex;
		flex-direction: column;
		gap: var(--space-6);
		margin-top: var(--space-10);
	}

	.head__title {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		margin: 0;
		text-wrap: balance;
		max-width: 38rem;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 1rem;
	}

	.case {
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.25rem 1.35rem;
		display: flex;
		flex-direction: column;
		gap: 0.7rem;
		min-width: 0;
	}

	.case__top {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.case__crumb {
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		font-weight: 500;
	}

	.case__delta {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		font-variant-numeric: tabular-nums;
		line-height: 1.1;
	}

	.case__delta--over    { color: var(--warn); }
	.case__delta--under   { color: var(--good); }
	.case__delta--estimate { color: var(--ink); font-size: var(--text-lg); }

	.case__label {
		display: block;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-2);
		letter-spacing: var(--ls-snug);
		margin-top: 0.15rem;
		text-transform: none;
	}

	.case__body {
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-list);
		margin: 0;
	}

	@media (max-width: 1100px) { .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
	@media (max-width: 560px)  { .grid { grid-template-columns: 1fr; } }
</style>