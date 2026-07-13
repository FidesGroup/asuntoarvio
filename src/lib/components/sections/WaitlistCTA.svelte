<script lang="ts">
	import { enhance } from '$app/forms';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import { toasts } from '$lib/styles/toast.svelte';
	import { copy } from '$lib/copy/fi';

	let { form }: { form: any } = $props();
	let pending = $state(false);
	let error = $state<string | null>(null);
</script>

<section class="waitlist" id="raportti" aria-label={copy.landing.waitlist.h2}>
	<Card variant="default" padded={true} inview>
		<h2 class="waitlist__h2">{copy.landing.waitlist.h2}</h2>
		<p class="waitlist__body">{copy.landing.waitlist.body}</p>

		<form
			method="POST"
			action="?/waitlist"
			class="waitlist__form"
			use:enhance={() => {
				pending = true;
				error = null;
				return async ({ result, update }) => {
					const data = (result as any)?.data;
					pending = false;
					if (data?.joined) {
						toasts.success(copy.landing.waitlist.success);
						error = null;
					} else if (data?.waitlistError) {
						error = data.waitlistError;
						toasts.error(data.waitlistError);
					}
					await update({ reset: false });
				};
			}}
		>
			<Field label="Sähköposti" required error={error} htmlFor="waitlist-email">
				{#snippet children({ id })}
					<input {id} type="email" name="email" placeholder={copy.landing.waitlist.emailPlaceholder} required autocomplete="email" />
				{/snippet}
			</Field>
			<Button type="submit" loading={pending}>{copy.landing.waitlist.cta}</Button>
		</form>
	</Card>
</section>

<style>
	.waitlist {
		margin-top: var(--space-10);
	}

	.waitlist :global(.card) {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		max-width: var(--container-prose);
	}

	.waitlist__h2 {
		font-size: var(--text-2xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		margin: 0;
	}

	.waitlist__body {
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
		margin: 0;
	}

	.waitlist__form {
		display: flex;
		gap: 0.6rem;
		flex-wrap: wrap;
		align-items: flex-end;
	}

	.waitlist__form :global(.field) {
		flex: 1 1 18rem;
		min-width: 0;
	}

	@media (max-width: 560px) {
		.waitlist__form { flex-direction: column; align-items: stretch; }
	}
</style>