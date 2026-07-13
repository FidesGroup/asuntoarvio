<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	let {
		reportPayload
	}: {
		reportPayload: string;
	} = $props();

	let pending = $state(false);
</script>

<Card variant="raised" inview>
	{#snippet header()}
		<div class="head">
			<h3 class="head__title">{copy.landing.result.asuntocardTitle}</h3>
			<Chip size="sm" tone="brand">{copy.landing.result.asuntocardBeta}</Chip>
		</div>
	{/snippet}

	<p class="lede">{copy.landing.result.asuntocardLede}</p>

	<form
		method="POST"
		action="?/report"
		class="form"
		use:enhance={() => {
			pending = true;
			return async ({ update }) => {
				await update();
				pending = false;
			};
		}}
	>
		<input type="hidden" name="payload" value={reportPayload} />
		<Button type="submit" loading={pending}>{copy.landing.result.asuntocardCta}</Button>
		<a class="form__sub" href="/tilaa">{copy.landing.result.asuntocardNoSub}</a>
	</form>
</Card>

<style>
	.head {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.head__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.lede {
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
		margin: 0 0 1rem;
	}

	.form {
		display: flex;
		align-items: center;
		gap: 0.85rem;
		flex-wrap: wrap;
	}

	.form__sub {
		font-size: var(--text-sm);
		color: var(--ink-2);
		text-decoration: underline;
		text-decoration-color: var(--border-2);
	}

	.form__sub:hover {
		text-decoration-color: var(--brand);
		color: var(--brand);
	}
</style>