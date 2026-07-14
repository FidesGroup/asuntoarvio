<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Crumbs from '$lib/components/ui/Crumbs.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import { copy } from '$lib/copy/fi';

	let { data } = $props();
	const fmt = new Intl.NumberFormat('fi-FI');
	const facts = $derived(data.report.facts as any);
	const card = $derived(data.scorecard?.data as any);
	const inFlight = $derived(['pending', 'paid', 'processing'].includes(data.report.status));

	const host = (u: string) => {
		try { return new URL(u).hostname.replace(/^www\./, ''); }
		catch { return u; }
	};
</script>

<svelte:head>
	<title>{copy.raportti.pageTitle}</title>
	<meta name="robots" content="noindex" />
	{#if inFlight}
		<meta http-equiv="refresh" content="12" />
	{/if}
</svelte:head>

<PageHero
	eyebrow={copy.raportti.eyebrow}
	h1={facts?.company ?? facts?.address ?? 'Taloyhtiö'}
	compact
/>

<Crumbs
	parts={[
		facts?.address ?? '–',
		facts?.postalCode ?? null,
		facts?.roomsType,
		facts?.livingAreaM2 ? `${facts.livingAreaM2} m²` : null,
		facts?.buildYear ? `rak. ${facts.buildYear}` : null
	]}
/>

{#if facts?.verdict?.deltaPct != null}
	<Card>
		{#snippet header()}<h2 class="card__h">Markkinahintavertailu</h2>{/snippet}
		<p class="line">
			Ilmoituksen neliöhinta on
			<strong class:over={facts.verdict.deltaPct >= 0} class:under={facts.verdict.deltaPct < 0}>
				{facts.verdict.deltaPct > 0 ? '+' : ''}{String(facts.verdict.deltaPct).replace('.', ',')} %
				{facts.verdict.deltaPct >= 0 ? 'yli' : 'alle'}
			</strong>
			alueen toteutuneiden kauppojen
			({fmt.format(facts.verdict.listingEurM2)} vs {fmt.format(facts.verdict.benchmarkEurM2)} €/m²,
			luotettavuus {facts.verdict.confidence}).
		</p>
	</Card>
{/if}

{#if inFlight}
	<Card>
		{#snippet header()}<h2 class="card__h">{copy.raportti.pendingTitle}</h2>{/snippet}
		<p>{copy.raportti.pendingBody}</p>
	</Card>
{:else if data.report.status === 'failed'}
	<Card>
		{#snippet header()}<h2 class="card__h">{copy.raportti.failedTitle}</h2>{/snippet}
		<p>{copy.raportti.failedBody}</p>
	</Card>
{:else if card}
	{#if card.corroborated?.renovations?.length}
		<Card>
			{#snippet header()}<h2 class="card__h">Ristivarmistettu remonttihistoria</h2>{/snippet}
			<ul class="list">
				{#each card.corroborated.renovations as r (r)}
					<li>
						<b>{r.year}</b> {r.type}{#if r.evidence}: {r.evidence}{/if}
						{#if r.source_url}<a href={r.source_url} rel="nofollow noopener" target="_blank">[{host(r.source_url)}]</a>{/if}
					</li>
				{/each}
			</ul>
		</Card>
	{/if}

	{#if card.listings_same_company?.length}
		<Card>
			{#snippet header()}<h2 class="card__h">Saman taloyhtiön muut kohteet</h2>{/snippet}
			<ul class="list">
				{#each card.listings_same_company as l (l)}
					<li>
						{l.summary}
						{#if l.url}<a href={l.url} rel="nofollow noopener" target="_blank">[{host(l.url)}]</a>{/if}
					</li>
				{/each}
			</ul>
		</Card>
	{/if}

	{#if card.red_flags?.length}
		<Card>
			{#snippet header()}
				<div class="row-h">
					<h2 class="card__h">Punaiset liput</h2>
					<Chip tone="warn" size="sm">{card.red_flags.length}</Chip>
				</div>
			{/snippet}
			<ul class="list">
				{#each card.red_flags as f (f)}
					<li>
						{f.text}
						{#if f.source_url}<a href={f.source_url} rel="nofollow noopener" target="_blank">[{host(f.source_url)}]</a>{/if}
					</li>
				{/each}
			</ul>
		</Card>
	{/if}

	{#if card.corroborated?.land_ownership || card.corroborated?.isannointi}
		<Card>
			{#snippet header()}<h2 class="card__h">Tontti ja isännöinti</h2>{/snippet}
			<ul class="list">
				{#if card.corroborated.land_ownership}
					<li>
						Tontti: {card.corroborated.land_ownership.value}
						{#if card.corroborated.land_ownership.source_url}<a href={card.corroborated.land_ownership.source_url} rel="nofollow noopener" target="_blank">[{host(card.corroborated.land_ownership.source_url)}]</a>{/if}
					</li>
				{/if}
				{#if card.corroborated.isannointi}
					<li>
						Isännöinti: {card.corroborated.isannointi.name}
						{#if card.corroborated.isannointi.source_url}<a href={card.corroborated.isannointi.source_url} rel="nofollow noopener" target="_blank">[{host(card.corroborated.isannointi.source_url)}]</a>{/if}
					</li>
				{/if}
			</ul>
		</Card>
	{/if}

	{#if card.area_notes?.length}
		<Card>
			{#snippet header()}<h2 class="card__h">Alue</h2>{/snippet}
			<ul class="list">
				{#each card.area_notes as n (n)}
					<li>
						{n.text}
						{#if n.source_url}<a href={n.source_url} rel="nofollow noopener" target="_blank">[{host(n.source_url)}]</a>{/if}
					</li>
				{/each}
			</ul>
		</Card>
	{/if}

	<Card>
		{#snippet header()}<h2 class="card__h">{copy.raportti.sourcesTitle}</h2>{/snippet}
		{#if card.sources?.length}
			<ul class="list list--sources">
				{#each card.sources as s (s)}<li><a href={s} rel="nofollow noopener" target="_blank">{s}</a></li>{/each}
			</ul>
		{/if}
		<p class="fine">{copy.raportti.fine(data.scorecard?.confidence ?? null)}</p>
		{#if card.notes}<p class="fine">{card.notes}</p>{/if}
	</Card>
{:else}
	<Card>
		{#snippet header()}<h2 class="card__h">Kortti on valmis, mutta sisältöä ei voitu näyttää</h2>{/snippet}
		<p>Yritä ladata sivu uudelleen.</p>
	</Card>
{/if}

<style>
	.card__h { font-size: var(--text-lg); font-weight: 600; margin: 0; }
	.row-h { display: flex; align-items: center; gap: 0.5rem; }

	.line { margin: 0; color: var(--ink-2); font-size: var(--text-md); line-height: var(--lh-body); }
	.line strong.over  { color: var(--warn); }
	.line strong.under { color: var(--good); }

	.list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 0.4rem; }
	.list li { font-size: var(--text-sm); color: var(--ink-2); line-height: var(--lh-list); }
	.list li b { color: var(--ink); }
	.list li a { margin-left: 0.3rem; font-size: 0.85em; word-break: break-all; }
	.list--sources li { font-size: 0.82rem; }

	.fine { margin: 0.75rem 0 0; color: var(--ink-3); font-size: var(--text-xs); line-height: var(--lh-list); }
</style>