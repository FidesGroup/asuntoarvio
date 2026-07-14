<script lang="ts">
	import { enhance } from '$app/forms';
	import Button from '$lib/components/ui/Button.svelte';
	import Field from '$lib/components/ui/Field.svelte';
	import Chip from '$lib/components/ui/Chip.svelte';
	import Faq from '$lib/components/ui/Faq.svelte';
	import { inview } from '$lib/styles/actions';
	import { copy } from '$lib/copy/fi';

	let {
		enabled,
		form
	}: {
		enabled: boolean;
		form: any;
	} = $props();
</script>

<section class="pricing" aria-label="Hinnoittelutasot" use:inview>
	<article class="tier">
		<header class="tier__head">
			<h3 class="tier__title">Ilmainen</h3>
			<p class="tier__price"><b>0 €</b><span class="tier__period">aina ilmainen</span></p>
		</header>
		<ul class="tier__features">
			<li class="ok">Ilmoituksen tarkistus</li>
			<li class="ok">Jaettava vertailuraportti</li>
			<li class="ok">Koko maan markkina-analyysi</li>
			<li class="ok">Kuntoarvio (suuntaa antava)</li>
			<li class="no">{copy.landing.result.asuntocardTitle.split(':')[0]}</li>
			<li class="no">Taloyhtiön muut myynnit</li>
		</ul>
		<Button href="/" variant="ghost" block>{copy.tilaa.cta.startFree}</Button>
	</article>

	<article class="tier tier--featured">
		<Chip size="sm" tone="brand" >{copy.tilaa.badge}</Chip>
		<header class="tier__head">
			<h3 class="tier__title">{copy.landing.result.asuntocardTitle.split(':')[0]}</h3>
			<p class="tier__price"><b>9,90 €</b><span class="tier__period">{copy.tilaa.billedOnce}</span></p>
		</header>
		<ul class="tier__features">
			<li class="ok">Kaikki ilmaisen ominaisuudet</li>
			<li class="ok">Remonttihistorian ristivarmistus</li>
			<li class="ok">Saman taloyhtiön muut myynnit</li>
			<li class="ok">Tontin ja isännöinnin varmistus</li>
			<li class="ok">Varoitusmerkit riskikohdista</li>
			<li class="ok">PDF-raportti lähteineen</li>
		</ul>
		{#if enabled}
			<form method="POST" class="tier__form" use:enhance>
				<input type="hidden" name="plan" value="single" />
				<Field label="Sähköposti" required htmlFor="plan-single">
					{#snippet children({ id })}
						<input {id} type="email" name="email" placeholder="sinä@esimerkki.fi" required autocomplete="email" />
					{/snippet}
				</Field>
				<Button type="submit" block>{copy.tilaa.cta.buy} · 9,90 €</Button>
				<p class="fine">{copy.tilaa.fineOnce}</p>
			</form>
			{#if form?.error}<p class="err">{form.error}</p>{/if}
		{:else}
			<Button href="/#raportti" block>{copy.tilaa.cta.waitlist}</Button>
		{/if}
	</article>

	<article class="tier">
		<header class="tier__head">
			<h3 class="tier__title">Sijoittaja Pro</h3>
			<p class="tier__price"><b>19,90 €</b><span class="tier__period">{copy.tilaa.billedMonth}</span></p>
		</header>
		<ul class="tier__features">
			<li class="ok">Kaikki Taloyhtiöraportin ominaisuudet</li>
			<li class="ok">Rajattomat Taloyhtiöraportit</li>
			<li class="ok">Hälytykset uusista ilmoituksista</li>
			<li class="ok">Seurantalista ja vertailutyökalu</li>
			<li class="ok">API & MCP-integraatio (beta)</li>
			<li class="ok">Peru milloin tahansa</li>
		</ul>
		{#if enabled}
			<form method="POST" class="tier__form" use:enhance>
				<input type="hidden" name="plan" value="pro" />
				<Field label="Sähköposti" required htmlFor="plan-pro">
					{#snippet children({ id })}
						<input {id} type="email" name="email" placeholder="sinä@esimerkki.fi" required autocomplete="email" />
					{/snippet}
				</Field>
				<Button type="submit" variant="secondary" block>{copy.tilaa.cta.startPro} · 19,90 €/kk</Button>
				<p class="fine">{copy.tilaa.finePro}</p>
			</form>
			{#if form?.error}<p class="err">{form.error}</p>{/if}
		{:else}
			<Button href="/#raportti" variant="secondary" block>{copy.tilaa.cta.waitlist}</Button>
		{/if}
	</article>
</section>

<section class="faq-section" aria-label={copy.tilaa.faqTitle} use:inview>
	<h2 class="faq__h2">{copy.tilaa.faqTitle}</h2>
	<Faq items={copy.tilaa.faq} />
</section>

<style>
	.pricing {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 1rem;
		margin-top: var(--space-7);
	}

	.tier {
		position: relative;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-lg);
		padding: 1.75rem 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		transition: transform var(--dur-fast) var(--ease-standard), box-shadow var(--dur-fast) var(--ease-standard);
		min-width: 0;
	}

	.tier:hover {
		transform: translateY(-2px);
		box-shadow: var(--shadow-md);
	}

	.tier--featured {
		border-color: var(--brand);
		background: var(--surface-tint);
		box-shadow: var(--shadow-md);
	}

	.tier--featured :global(.chip) {
		position: absolute;
		top: -0.65rem;
		left: 1.5rem;
	}

	.tier__head {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	.tier__title {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}

	.tier__price {
		margin: 0;
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.tier__price b {
		font-size: var(--text-3xl);
		font-weight: 600;
		letter-spacing: var(--ls-tight);
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		line-height: 1;
	}

	.tier__period {
		font-size: var(--text-sm);
		color: var(--ink-2);
		font-weight: 400;
	}

	.tier__features {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		flex: 1;
	}

	.tier__features li {
		font-size: var(--text-sm);
		line-height: var(--lh-list);
		color: var(--ink-2);
		padding-left: 1.5rem;
		position: relative;
	}

	.tier__features li::before {
		position: absolute;
		left: 0;
		top: 0.05em;
		font-weight: 700;
	}

	.tier__features li.ok::before { content: '✓'; color: var(--good); }
	.tier__features li.no { color: var(--ink-3); }
	.tier__features li.no::before { content: '−'; color: var(--ink-3); }

	.tier__form {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		margin-top: auto;
	}

	.fine {
		color: var(--ink-3);
		font-size: var(--text-xs);
		text-align: center;
		margin: 0;
	}

	.err {
		color: var(--danger-fg);
		font-size: var(--text-sm);
		margin: 0;
	}

	.faq-section {
		margin-top: var(--space-10);
		max-width: var(--container-prose);
	}

	.faq__h2 {
		font-size: var(--text-2xl);
		font-weight: 600;
		margin: 0 0 var(--space-5);
	}

	@media (max-width: 900px) {
		.pricing { grid-template-columns: 1fr; }
	}

	@media (prefers-reduced-motion: reduce) {
		.tier:hover { transform: none; }
	}
</style>