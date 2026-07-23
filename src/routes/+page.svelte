<script lang="ts">
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/styles/toast.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import HeroAnalyzer from '$lib/components/sections/HeroAnalyzer.svelte';
	import AnalysisReport from '$lib/components/sections/AnalysisReport.svelte';
	import { goto } from '$app/navigation';
	import PriceMap from '$lib/PriceMap.svelte';
	import CaseGrid from '$lib/components/sections/CaseGrid.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';
	import { inview } from '$lib/styles/actions';

	let { data, form } = $props();

	let pending = $state(false);

	const fmtNum = new Intl.NumberFormat('fi-FI');

	const hasResult = $derived(!!form?.verdict);

	const tier = $derived(form?.tier ?? null);
</script>

<svelte:head>
	<title>RehtiArvio | Ilmainen markkinahinta-analyysi</title>
	<meta
		name="description"
		content="Liitä ilmoituksen linkki, niin näet heti, mitä samalta postinumeroalueelta on oikeasti maksettu. Vertailu tulee suoraan Tilastokeskuksen toteutuneista kaupoista, ei välittäjän arviosta. Ilmaiseksi."
	/>
	<meta property="og:title" content="RehtiArvio | Ilmainen markkinahinta-analyysi" />
	<meta
		property="og:description"
		content="Liitä ilmoituksen linkki, niin näet heti, mitä samalta postinumeroalueelta on oikeasti maksettu. Vertailu tulee suoraan Tilastokeskuksen toteutuneista kaupoista, ei välittäjän arviosta. Ilmaiseksi."
	/>
	<meta property="og:type" content="website" />
	<meta property="og:url" content={SITE_URL} />
	<meta property="og:image" content={`${SITE_URL}/og`} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content="RehtiArvio | Ilmainen markkinahinta-analyysi" />
	<meta
		name="twitter:description"
		content="Liitä ilmoituksen linkki, niin näet heti, mitä samalta postinumeroalueelta on oikeasti maksettu — suoraan Tilastokeskuksen toteutuneista kaupoista."
	/>
	<meta name="twitter:image" content={`${SITE_URL}/og`} />
</svelte:head>

<div class="hero-grid">
	<HeroAnalyzer {data} {form} />
	<aside class="hero-grid__map" aria-label={copy.landing.priceMap.title}>
		<figure class="mapfig">
			<PriceMap height="26rem" zoom={4.6} center={[25.2, 61.4]} showLegend={false} onareaclick={(pc) => goto(`/?pc=${pc}`)} />
			<figcaption class="mapfig__cap">
				<span class="mapfig__source">{copy.landing.priceMap.source}</span>
				<span class="mapfig__hint">{copy.landing.priceMap.hint}</span>
				<a class="mapfig__link" href="/kartta">{copy.landing.priceMap.openFull}</a>
			</figcaption>
		</figure>
	</aside>
</div>

{#if hasResult && form?.facts && form?.verdict}
	<AnalysisReport {form} />
{/if}

<section class="market" aria-label={copy.landing.market.eyebrow}>
	<p class="market__eyebrow">{copy.landing.market.eyebrow}</p>
	<div class="market__grid">
		<div class="mstat">
			<span class="mstat__lbl">{copy.landing.market.transactions}</span>
			<span class="mstat__val num">{fmtNum.format(data.market.totalTransactions)}</span>
		</div>
		<div class="mstat">
			<span class="mstat__lbl">{copy.landing.market.change12}</span>
			{#await data.lazy.country}
				<span class="mstat__val num">–</span>
			{:then c}
				{#if c?.last12moChangePct != null}
					<span class="mstat__val num">{c.last12moChangePct > 0 ? '+' : ''}{String(c.last12moChangePct).replace('.', ',')} %</span>
					<span class="mstat__sub">{copy.landing.market.countrySub}</span>
				{:else}
					<span class="mstat__val num">–</span>
				{/if}
			{/await}
		</div>
		<div class="mstat">
			<span class="mstat__lbl">{copy.landing.market.forecast12}</span>
			{#await data.lazy.country}
				<span class="mstat__val num">–</span>
			{:then c}
				{#if c?.next12moTrendPct != null}
					<span class="mstat__val num">{c.next12moTrendPct > 0 ? '+' : ''}{String(c.next12moTrendPct).replace('.', ',')} %</span>
					<span class="mstat__sub">{copy.landing.market.countrySub}</span>
				{:else}
					<span class="mstat__val num">–</span>
				{/if}
			{/await}
		</div>
		<div class="mstat">
			<span class="mstat__lbl">{copy.landing.market.mostExpensive}</span>
			<span class="mstat__val num">{fmtNum.format(data.market.topExpensive[0].eur)} <span class="mstat__unit">€/m²</span></span>
			<span class="mstat__sub">{data.market.topExpensive[0].pc} {data.market.topExpensive[0].nimi}</span>
		</div>
		<div class="mstat">
			<span class="mstat__lbl">{copy.landing.market.cheapest}</span>
			<span class="mstat__val num">{fmtNum.format(data.market.topCheapest[0].eur)} <span class="mstat__unit">€/m²</span></span>
			<span class="mstat__sub">{data.market.topCheapest[0].pc} {data.market.topCheapest[0].nimi}</span>
		</div>
	</div>
	<p class="market__src">{copy.landing.market.source}</p>
	<details class="market__method">
		<summary class="market__method-toggle">{copy.landing.market.methodToggle}</summary>
		<p class="market__method-body">{copy.landing.methodNote}</p>
	</details>
</section>

<div class="reveal" use:inview>
	<CaseGrid examples={data.examples} />
</div>

<form
	method="POST"
	action="?/waitlist"
	class="waitlist reveal"
	use:inview
	use:enhance={() => {
		pending = true;
		return async ({ result, update }) => {
			const data = (result as any)?.data;
			pending = false;
			if (data?.joined) {
				toasts.success(copy.landing.waitlist.success);
			} else if (data?.waitlistError) {
				toasts.error(data?.waitlistError);
			}
			await update({ reset: false });
		};
	}}
>
	<span class="waitlist__eyebrow">{copy.landing.waitlist.eyebrow}</span>
	<Field label={copy.landing.waitlist.title} htmlFor="waitlist-email" required>
		{#snippet children({ id })}
			<input
				{id}
				type="email"
				name="email"
				placeholder={copy.landing.waitlist.placeholder}
				required
				autocomplete="email"
			/>
		{/snippet}
	</Field>
	<label class="waitlist__marketing">
		<input type="checkbox" name="marketingOptIn" />
		{copy.landing.waitlist.marketingOptIn}
	</label>
	<Button type="submit" loading={pending}>{copy.landing.waitlist.cta}</Button>
</form>

<style>
	.hero-grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr) clamp(16rem, 30%, 21rem);
		gap: var(--space-7) var(--space-9);
		align-items: start;
		margin-bottom: var(--space-9);
	}

	/* Optically align the map top with the hero eyebrow. */
	.hero-grid__map {
		padding-top: var(--space-5);
	}

	.mapfig {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin: 0;
	}

	.mapfig__cap {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		padding-top: 0.7rem;
		border-top: 1px solid var(--border);
	}

	.mapfig__source {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.mapfig__hint {
		font-size: var(--text-xs);
		color: var(--ink-3);
	}

	.mapfig__link {
		font-size: var(--text-sm);
		color: var(--ink-2);
		margin-top: 0.35rem;
		align-self: flex-start;
	}

	@media (max-width: 900px) {
		.hero-grid {
			grid-template-columns: 1fr;
		}
		/* Mobile gets no landing map — /kartta is the map surface there. */
		.hero-grid__map {
			display: none;
		}
	}

	.market {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
		margin-top: var(--space-9);
		max-width: var(--container-prose);
	}

	.market__eyebrow {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--brand);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		margin: 0;
	}

	.market__grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(8.5rem, 1fr));
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border);
	}

	.mstat {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
		min-width: 0;
	}

	.mstat__lbl {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.mstat__val {
		font-size: var(--text-xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
	}

	.mstat__unit {
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink-2);
	}

	.mstat__sub {
		font-size: var(--text-xs);
		color: var(--ink-2);
	}

	.market__src {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--ink-3);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
	}

	.market__method {
		margin: 0;
	}

	/* Progressive disclosure: methodology explanation collapsed by default so
	   the stat strip stays the focus. StatFin attribution (.market__src) stays
	   always visible above it — it is a license condition, not decoration. */
	.market__method-toggle {
		display: inline-flex;
		align-items: center;
		min-height: 44px;
		font-size: var(--text-sm);
		color: var(--brand);
		cursor: pointer;
		list-style: none;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--brand) 35%, transparent);
		text-underline-offset: 3px;
		width: fit-content;
	}

	.market__method-toggle::-webkit-details-marker { display: none; }

	.market__method-toggle::before {
		content: '+';
		display: inline-block;
		width: 1em;
		margin-right: 0.35rem;
		font-weight: 600;
		text-decoration: none;
	}

	.market__method[open] .market__method-toggle::before { content: '−'; }

	.market__method-toggle:hover {
		text-decoration-color: var(--brand);
	}

	.market__method-body {
		margin: 0.35rem 0 0;
		font-size: var(--text-sm);
		color: var(--ink-2);
		line-height: var(--lh-list);
		max-width: var(--container-prose);
	}

	@media (max-width: 720px) {
		.market__grid {
			grid-template-columns: repeat(2, minmax(0, 1fr));
			gap: 1rem 1.25rem;
		}
	}

	.waitlist {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		gap: 0.75rem 1rem;
		margin-top: var(--space-9);
		padding: 1.25rem 0 0;
		border-top: 1px solid var(--border);
		max-width: var(--container-prose);
	}

	.waitlist :global(.field) {
		flex: 1 1 18rem;
		min-width: 0;
		margin: 0;
	}

	.waitlist__eyebrow {
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--brand);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		padding-bottom: 0.35rem;
	}

	.waitlist__marketing {
		flex: 1 1 100%;
		display: flex;
		align-items: flex-start;
		gap: 0.5rem;
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-list);
		cursor: pointer;
	}

	.waitlist__marketing input {
		margin-top: 0.2rem;
		flex-shrink: 0;
	}

	@media (max-width: 480px) {
		.waitlist {
			flex-direction: column;
			align-items: stretch;
		}
		.waitlist :global(.field) {
			flex: 1 1 auto;
		}
	}
</style>
