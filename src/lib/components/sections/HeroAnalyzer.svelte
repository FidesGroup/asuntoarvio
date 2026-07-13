<script lang="ts">
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { inview } from '$lib/styles/actions';
	import Field from '$lib/components/ui/Field.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import MiniMap from '$lib/components/MiniMap.svelte';
	import { copy } from '$lib/copy/fi';

	type Mode = 'url' | 'text' | 'manual';

	let {
		data,
		form,
		activeInput = $bindable<Mode>('url'),
		pending = $bindable(false),
		formError = $bindable<string | null>(null)
	}: {
		data: {
			postalCodes: string[];
			prefillPc?: string | null;
			centroids: Record<string, any>;
		};
		form: any;
		activeInput?: Mode;
		pending?: boolean;
		formError?: string | null;
	} = $props();

	const tabs: { id: Mode; label: string }[] = [
		{ id: 'url', label: copy.landing.tabs.url },
		{ id: 'text', label: copy.landing.tabs.text },
		{ id: 'manual', label: copy.landing.tabs.manual }
	];

	let beginnerMode = $state(true);
	let cachedValues = $state<Record<string, string>>({});

	// Live postcode suggestion (top 3 fuzzy prefix match)
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

	function cacheAndSubmit(e: SubmitEvent) {
		const f = e.currentTarget as HTMLFormElement;
		for (const el of f.elements) {
			const i = el as HTMLInputElement;
			if (i.name) cachedValues[i.name] = i.value;
		}
		pending = true;
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

	const fmt = new Intl.NumberFormat('fi-FI');
</script>

<section class="hero" use:inview>
	<div class="hero__copy">
		<span class="hero__eyebrow">{copy.landing.eyebrow}</span>
		<h1 class="hero__h1">{copy.landing.h1}</h1>
		<p class="hero__lede">{copy.landing.lede}</p>
		<div class="hero__pills">
			<Chip size="sm" tone="neutral">{copy.landing.pillCoverage(data.postalCodes.length)}</Chip>
			<Chip size="sm" tone="neutral">{copy.landing.pillQuarters}</Chip>
			<Chip size="sm" tone="good">{copy.landing.pillNoAds}</Chip>
		</div>
	</div>

	<div class="hero__viz">
		<MiniMap centroids={data.centroids} size={300} />
	</div>
</section>

<section class="analyzer" aria-label="Ilmoitusanalyysi">
	<div class="seg" role="tablist" aria-label="Syöttötapa">
		{#each tabs as t (t.id)}
			<button
				type="button"
				role="tab"
				class="seg__btn"
				class:active={activeInput === t.id}
				aria-selected={activeInput === t.id}
				onclick={() => (activeInput = t.id)}
			>{t.label}</button>
		{/each}
		<span
			class="seg__indicator"
			style:--seg-i={tabs.findIndex((t) => t.id === activeInput)}
			style:--seg-count={tabs.length}
		></span>
	</div>

	{#if activeInput === 'manual'}
		<form method="GET" action="/arvio" class="form" onsubmit={prefillRent}>
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
				<Field label="Hintatyyppi" required htmlFor="debtfree">
					{#snippet children({ id })}
						<select {id} name="debtfree" required>
							<option value="1" selected>Velaton hinta</option>
							<option value="0">Myyntihinta</option>
						</select>
					{/snippet}
				</Field>
				<Field label="Rakennusvuosi" optional htmlFor="yr">
					{#snippet children({ id })}
						<input {id} name="yr" inputmode="numeric" type="number" min="1800" max="2030" placeholder="1961" value={cachedValues.yr ?? ''} />
					{/snippet}
				</Field>
				<Field label="Arvioitu vuokra" optional helper="€/kk" htmlFor="rent">
					{#snippet children({ id })}
						<input {id} name="rent" inputmode="numeric" type="number" step="10" min="100" max="20000" placeholder="950" value={cachedValues.rent ?? ''} />
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
	{:else}
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
			onsubmit={cacheAndSubmit}
		>
			{#if activeInput === 'url'}
				<Field label="Ilmoituksen URL" htmlFor="url">
					{#snippet children({ id })}
						<input {id} type="url" name="url" placeholder={copy.landing.urlPlaceholder} autocomplete="off" />
					{/snippet}
				</Field>
			{:else}
				<Field label="Ilmoituksen teksti" htmlFor="text">
					{#snippet children({ id })}
						<textarea {id} name="text" rows="10" placeholder={copy.landing.textPlaceholder}></textarea>
					{/snippet}
				</Field>
			{/if}
			<div class="form__actions form__actions--row">
				<Button type="submit" size="lg" loading={pending}>{copy.landing.analyzeCta}</Button>
				<p class="form__hint">{copy.landing.supportedSources}</p>
			</div>
			{#if form?.error || form?.reportError}
				<p class="form__error" role="alert">{form?.error ?? form?.reportError}</p>
			{/if}
		</form>
	{/if}
</section>

<style>
	.hero {
		display: grid;
		grid-template-columns: 1.2fr 1fr;
		gap: var(--space-8);
		align-items: center;
		padding-top: var(--space-5);
		margin-bottom: var(--space-9);
	}

	.hero__copy {
		max-width: 36rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
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

	.hero__pills {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-top: 0.5rem;
	}

	.hero__viz {
		display: flex;
		justify-content: center;
	}

	.analyzer {
		background: var(--surface-tint);
		border: 1px solid var(--border);
		border-radius: var(--radius-xl);
		padding: 1.5rem 1.75rem 1.75rem;
		box-shadow: var(--shadow-md);
		display: flex;
		flex-direction: column;
		gap: 1.25rem;
	}

	/* Segmented control */
	.seg {
		position: relative;
		display: inline-flex;
		gap: 0;
		padding: 0.25rem;
		background: var(--bg);
		border-radius: var(--radius-full);
		width: fit-content;
		max-width: 100%;
		flex-wrap: wrap;
	}

	.seg__btn {
		font: inherit;
		font-size: var(--text-sm);
		font-weight: 500;
		color: var(--ink-2);
		background: transparent;
		border: none;
		padding: 0.55rem 1rem;
		cursor: pointer;
		border-radius: var(--radius-full);
		transition: color var(--dur-fast) var(--ease-standard);
		position: relative;
		z-index: 1;
		white-space: nowrap;
	}

	.seg__btn:hover { color: var(--ink); }

	.seg__btn.active { color: var(--ink); }

	.seg__indicator {
		position: absolute;
		top: 0.25rem;
		bottom: 0.25rem;
		left: 0.25rem;
		width: calc((100% - 0.5rem) / var(--seg-count));
		background: var(--surface);
		border-radius: var(--radius-full);
		box-shadow: var(--shadow-xs);
		transform: translateX(calc(var(--seg-i) * 100%));
		transition: transform var(--dur-base) var(--ease-emphasized);
		z-index: 0;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form__title {
		font-size: var(--text-md);
		font-weight: 600;
		margin: 0 0 0.25rem;
	}

	.form__grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.85rem 1rem;
	}

	.form__actions {
		display: flex;
	}

	.form__actions--row {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.form__hint {
		color: var(--ink-3);
		font-size: var(--text-xs);
		margin: 0;
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

	@media (max-width: 860px) {
		.hero { grid-template-columns: 1fr; gap: var(--space-6); }
		.form__grid { grid-template-columns: 1fr 1fr; }
		.analyzer { padding: 1.25rem 1.4rem 1.5rem; }
	}

	@media (max-width: 560px) {
		.form__grid { grid-template-columns: 1fr; }
		.form__actions--row { flex-direction: column; align-items: stretch; }
	}
</style>