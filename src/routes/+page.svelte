<script lang="ts">
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/styles/toast.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import HeroAnalyzer from '$lib/components/sections/HeroAnalyzer.svelte';
	import VerdictBlock from '$lib/components/sections/VerdictBlock.svelte';
	import { goto } from '$app/navigation';
	import PriceMap from '$lib/PriceMap.svelte';
	import FeatureGrid from '$lib/components/sections/FeatureGrid.svelte';
	import { copy } from '$lib/copy/fi';

	let { data, form } = $props();

	let pending = $state(false);

	const hasResult = $derived(!!form?.verdict);

	const tier = $derived(form?.tier ?? null);
</script>

<svelte:head>
	<title>RehtiArvio | Ilmainen markkinahinta-analyysi</title>
	<meta
		name="description"
		content="Liitä myynti-ilmoitus, niin saat vertailun Tilastokeskuksen toteutuneisiin kauppoihin postinumeroalueittain. Ilmainen."
	/>
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
	<VerdictBlock verdict={form.verdict} {tier} facts={form.facts} />
{/if}

<FeatureGrid />

<form
	method="POST"
	action="?/waitlist"
	class="waitlist"
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
