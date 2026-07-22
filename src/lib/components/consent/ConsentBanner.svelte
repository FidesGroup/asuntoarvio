<script lang="ts">
	import { getContext } from 'svelte';
	import { ConsentStore, CONSENT_CONTEXT_KEY } from '$lib/consent/state.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import ConsentPreferences from './ConsentPreferences.svelte';
	import { copy } from '$lib/copy/fi';

	const consent = getContext<ConsentStore>(CONSENT_CONTEXT_KEY);

	let customizing = $state(false);
</script>

{#if consent.needsPrompt}
	<div class="banner" role="region" aria-label={copy.consent.bannerAriaLabel}>
		{#if !customizing}
			<p class="banner__lede">
				{copy.consent.lede}
				<a href="/evasteet">{copy.consent.privacyLink}</a>
			</p>
			<div class="banner__actions">
				<Button variant="ghost" size="sm" onclick={() => (customizing = true)}>
					{copy.consent.customize}
				</Button>
				<Button variant="secondary" size="sm" onclick={() => consent.rejectAll()}>
					{copy.consent.rejectAll}
				</Button>
				<Button variant="primary" size="sm" onclick={() => consent.acceptAll()}>
					{copy.consent.acceptAll}
				</Button>
			</div>
		{:else}
			<button class="banner__back" onclick={() => (customizing = false)}>{copy.consent.back}</button>
			<ConsentPreferences onDone={() => (customizing = false)} />
		{/if}
	</div>
{/if}

<style>
	.banner {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		z-index: var(--z-toast);
		background: var(--surface);
		border-top: 1px solid var(--border);
		box-shadow: var(--shadow-lg);
		padding: var(--space-4) var(--space-5);
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-4);
		max-height: 80vh;
		overflow-y: auto;
	}

	.banner__lede {
		flex: 1 1 24rem;
		margin: 0;
		color: var(--ink-2);
		font-size: var(--text-sm);
		line-height: var(--lh-list);
	}

	.banner__lede a {
		color: var(--brand);
	}

	.banner__actions {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}

	.banner__back {
		align-self: flex-start;
		background: none;
		border: none;
		color: var(--ink-2);
		font: inherit;
		font-size: var(--text-sm);
		cursor: pointer;
		padding: 0;
		text-decoration: underline;
		text-decoration-color: var(--border-2);
	}

	@media (max-width: 480px) {
		.banner {
			flex-direction: column;
			align-items: stretch;
		}
		.banner__actions {
			justify-content: stretch;
		}
		.banner__actions :global(.btn) {
			flex: 1;
		}
	}
</style>
