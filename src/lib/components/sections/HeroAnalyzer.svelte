<script lang="ts">
	import { enhance } from '$app/forms';
	import { inview } from '$lib/styles/actions';
	import Field from '$lib/components/ui/Field.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { copy } from '$lib/copy/fi';

	let {
		data,
		form,
		pending = $bindable(false),
		formError = $bindable<string | null>(null)
	}: {
		data: {
			postalCodes: string[];
			prefillPc?: string | null;
		};
		form: any;
		pending?: boolean;
		formError?: string | null;
	} = $props();

	let cachedValues = $state<Record<string, string>>({});
	let manualOpen = $state(false);

	// Live postcode suggestion (top fuzzy prefix match)
	let pcSuggestion = $state<string | null>(null);
	function onPcInput(e: Event) {
		const v = (e.currentTarget as HTMLInputElement).value.replace(/\D/g, '').slice(0, 5);
		(e.currentTarget as HTMLInputElement).value = v;
		if (v.length >= 2) {
			const match = data.postalCodes.find((p) => p.startsWith(v));
			pcSuggestion = match ?? null;
		} else {
			pcSuggestion = null;
		}
	}

	function prefillRent(event: SubmitEvent) {
		const form = event.currentTarget as HTMLFormElement;
		const pc = (form.elements.namedItem('pc') as HTMLInputElement)?.value?.trim();
		const rt = (form.elements.namedItem('rt') as HTMLSelectElement)?.value;
		const m2 = Number((form.elements.namedItem('m2') as HTMLInputElement)?.value);
		const rentEl = form.elements.namedItem('rent') as HTMLInputElement | null;
		if (!pc || !rt || !Number.isFinite(m2) || m2 < 10 || !rentEl || rentEl.value) return;
		fetch(`/api/rent-estimate?pc=${encodeURIComponent(pc)}&rt=${encodeURIComponent(rt)}&m2=${m2}`)
			.then((r) => (r.ok ? r.json() : null))
			.then((d) => {
				if (d && typeof d.monthlyRentEur === 'number') rentEl.value = String(d.monthlyRentEur);
			})
			.catch(() => {});
	}
</script>

<section class="hero" use:inview>
	<span class="hero__eyebrow">{copy.landing.eyebrow}</span>
	<h1 class="hero__h1">{copy.landing.h1}</h1>
	<p class="hero__lede">{copy.landing.lede}</p>

	<form
		method="POST"
		action="?/analyze"
		class="form"
		use:enhance={() => {
			pending = true;
			return async ({ update }) => {
				await update();
				pending = false;
				formError = form?.error ?? form?.reportError ?? null;
			};
		}}
		onsubmit={(e) => {
			const f = e.currentTarget as HTMLFormElement;
			for (const el of f.elements) {
				const i = el as HTMLInputElement;
				if (i.name) cachedValues[i.name] = i.value;
			}
			pending = true;
		}}
	>
		<Field label="Ilmoituksen URL" htmlFor="url">
			{#snippet children({ id })}
				<input
					{id}
					type="url"
					name="url"
					placeholder={copy.landing.urlPlaceholder}
					autocomplete="off"
					required
				/>
			{/snippet}
		</Field>
		<div class="form__actions">
			<Button type="submit" size="lg" loading={pending}>{copy.landing.analyzeCta}</Button>
		</div>
		{#if form?.error || form?.reportError}
			<p class="form__error" role="alert">{form?.error ?? form?.reportError}</p>
		{/if}
	</form>

	<button
		type="button"
		class="form__manual-toggle"
		onclick={() => (manualOpen = !manualOpen)}
		aria-expanded={manualOpen}
	>
		{manualOpen ? copy.landing.manualLinkClose : copy.landing.manualLink}
	</button>

	{#if manualOpen}
		<form
			method="GET"
			action="/arvio"
			class="form form--manual"
			onsubmit={prefillRent}
		>
			<h2 class="form__title">{copy.landing.manualTitle}</h2>
			<div class="form__grid">
				<Field label="Postinumero" required htmlFor="pc">
					{#snippet children({ id })}
						<input
							{id}
							name="pc"
							inputmode="numeric"
							pattern={'[0-9]{5}'}
							placeholder="00530"
							required
							list="known-pc"
							value={data.prefillPc ?? cachedValues.pc ?? ''}
							oninput={onPcInput}
						/>
					{/snippet}
				</Field>
				<Field label="Huonetyyppi" required htmlFor="rt">
					{#snippet children({ id })}
						<select {id} name="rt" required>
							<option value="yksiö">Yksiö</option>
							<option value="kaksio" selected>Kaksio</option>
							<option value="kolmio+">Kolmio tai suurempi</option>
						</select>
					{/snippet}
				</Field>
				<Field label="Pinta-ala" required htmlFor="m2">
					{#snippet children({ id })}
						<input {id} name="m2" inputmode="decimal" type="number" step="0.5" min="10" max="400" placeholder="54" required value={cachedValues.m2 ?? ''} />
					{/snippet}
				</Field>
				<Field label="Velaton hinta" required htmlFor="price">
					{#snippet children({ id })}
						<input {id} name="price" inputmode="numeric" type="number" step="1000" min="10000" placeholder="289 000" required value={cachedValues.price ?? ''} />
					{/snippet}
				</Field>
				<Field label="Rakennusvuosi" optional htmlFor="yr">
					{#snippet children({ id })}
						<input {id} name="yr" inputmode="numeric" type="number" min="1800" max="2030" placeholder="1961" value={cachedValues.yr ?? ''} />
					{/snippet}
				</Field>
				<Field label="Hoitovastike" optional helper="€/kk" htmlFor="vastike">
					{#snippet children({ id })}
						<input {id} name="vastike" inputmode="numeric" type="number" step="10" min="0" max="5000" placeholder="280" value={cachedValues.vastike ?? ''} />
					{/snippet}
				</Field>
			</div>
			<datalist id="known-pc">
				{#each data.postalCodes as pc (pc)}<option value={pc}></option>{/each}
			</datalist>
			<div class="form__actions">
				<Button type="submit" size="lg">{copy.landing.analyzeCta}</Button>
			</div>
		</form>
	{/if}

	<p class="hero__privacy">{copy.landing.privacyNote}</p>
</section>

<style>
	.hero {
		max-width: var(--container-prose);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
		padding-top: var(--space-5);
	}

	.hero__eyebrow {
		display: inline-block;
		align-self: flex-start;
		font-size: var(--text-xs);
		font-weight: 600;
		color: var(--brand);
		letter-spacing: var(--ls-wide);
		text-transform: uppercase;
		background: color-mix(in srgb, var(--brand) 10%, transparent);
		padding: 0.3rem 0.65rem;
		border-radius: var(--radius-full);
	}

	.hero__h1 {
		font-size: var(--text-4xl);
		line-height: var(--lh-tight);
		letter-spacing: var(--ls-tightest);
		font-weight: 600;
		text-wrap: balance;
		margin: 0;
	}

	.hero__lede {
		color: var(--ink-2);
		font-size: var(--text-lg);
		margin: 0;
		line-height: var(--lh-body);
	}

	.hero__privacy {
		color: var(--ink-3);
		font-size: var(--text-xs);
		margin: 0;
		line-height: var(--lh-list);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 0.85rem;
	}

	.form--manual {
		margin-top: 0.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--border);
	}

	.form__title {
		font-size: var(--text-sm);
		font-weight: 600;
		margin: 0 0 0.25rem;
		color: var(--ink-2);
		letter-spacing: var(--ls-snug);
		text-transform: uppercase;
	}

	.form__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem 1rem;
	}

	.form__actions {
		display: flex;
	}

	.form__error {
		color: var(--danger-fg);
		font-size: var(--text-sm);
		font-weight: 500;
		background: var(--danger-bg);
		padding: 0.7rem 0.9rem;
		border-radius: var(--radius-md);
		margin: 0;
	}

	.form__manual-toggle {
		font: inherit;
		font-size: var(--text-sm);
		color: var(--brand);
		background: transparent;
		border: none;
		/* 44px hit area without disturbing the vertical rhythm. */
		padding: 0.65rem 0;
		margin: -0.45rem 0;
		min-height: 44px;
		display: inline-flex;
		align-items: center;
		cursor: pointer;
		text-align: left;
		text-decoration: underline;
		text-decoration-color: color-mix(in srgb, var(--brand) 35%, transparent);
		text-underline-offset: 3px;
		align-self: flex-start;
	}

	.form__manual-toggle:hover {
		text-decoration-color: var(--brand);
	}

	@media (max-width: 720px) {
		.form__grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
	}

	@media (max-width: 480px) {
		.form__grid { grid-template-columns: 1fr; }
	}
</style>
