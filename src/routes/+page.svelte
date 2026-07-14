<script lang="ts">
	import { enhance } from '$app/forms';
	import { toasts } from '$lib/styles/toast.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import HeroAnalyzer from '$lib/components/sections/HeroAnalyzer.svelte';
	import VerdictBlock from '$lib/components/sections/VerdictBlock.svelte';
	import PriceMapSection from '$lib/components/sections/PriceMapSection.svelte';
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

<HeroAnalyzer {data} {form} />

{#if hasResult && form?.facts && form?.verdict}
	<VerdictBlock verdict={form.verdict} {tier} facts={form.facts} />
{/if}

<PriceMapSection centroids={data.centroids} />

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

	@media (max-width: 560px) {
		.waitlist {
			flex-direction: column;
			align-items: stretch;
		}
		.waitlist :global(.field) {
			flex: 1 1 auto;
		}
	}
</style>
