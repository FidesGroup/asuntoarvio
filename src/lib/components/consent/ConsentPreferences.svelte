<script lang="ts">
	import { getContext } from 'svelte';
	import { ConsentStore, CONSENT_CONTEXT_KEY } from '$lib/consent/state.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { copy } from '$lib/copy/fi';

	let { onDone }: { onDone?: () => void } = $props();

	const consent = getContext<ConsentStore>(CONSENT_CONTEXT_KEY);

	let analytics = $state(consent.analytics);
	let marketing = $state(consent.marketing);
	let saving = $state(false);
	let saved = $state(false);

	$effect(() => {
		analytics = consent.analytics;
		marketing = consent.marketing;
	});

	async function save() {
		saving = true;
		await consent.saveCustom(analytics, marketing);
		saving = false;
		saved = true;
		onDone?.();
	}
</script>

<div class="prefs">
	<div class="prefs__row">
		<label class="prefs__label">
			<input type="checkbox" checked disabled />
			<span>
				<b>{copy.consent.categories.necessary.title}</b>
				<span class="prefs__desc">{copy.consent.categories.necessary.desc}</span>
			</span>
		</label>
	</div>
	<div class="prefs__row">
		<label class="prefs__label">
			<input type="checkbox" bind:checked={analytics} />
			<span>
				<b>{copy.consent.categories.analytics.title}</b>
				<span class="prefs__desc">{copy.consent.categories.analytics.desc}</span>
			</span>
		</label>
	</div>
	<div class="prefs__row">
		<label class="prefs__label">
			<input type="checkbox" bind:checked={marketing} />
			<span>
				<b>{copy.consent.categories.marketing.title}</b>
				<span class="prefs__desc">{copy.consent.categories.marketing.desc}</span>
			</span>
		</label>
	</div>

	<div class="prefs__actions">
		<Button variant="primary" size="sm" loading={saving} onclick={save}>{copy.consent.save}</Button>
		{#if saved}<span class="prefs__saved">{copy.consent.saved}</span>{/if}
	</div>
</div>

<style>
	.prefs {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);
	}

	.prefs__row {
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: var(--space-3) var(--space-4);
	}

	.prefs__label {
		display: flex;
		gap: var(--space-3);
		align-items: flex-start;
		cursor: pointer;
	}

	.prefs__label input {
		margin-top: 0.3rem;
		flex-shrink: 0;
	}

	.prefs__label span b {
		display: block;
		color: var(--ink);
	}

	.prefs__desc {
		display: block;
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-list);
		margin-top: 0.2rem;
	}

	.prefs__actions {
		display: flex;
		align-items: center;
		gap: var(--space-4);
	}

	.prefs__saved {
		color: var(--good);
		font-size: var(--text-sm);
	}
</style>
