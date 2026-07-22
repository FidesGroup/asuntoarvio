<script lang="ts">
	import '../app.css';
	import { setContext } from 'svelte';
	import { page } from '$app/state';
	import Header from '$lib/components/chrome/Header.svelte';
	import Footer from '$lib/components/chrome/Footer.svelte';
	import Toaster from '$lib/components/ui/Toaster.svelte';
	import ConsentBanner from '$lib/components/consent/ConsentBanner.svelte';
	import AnalyticsLoader from '$lib/components/consent/AnalyticsLoader.svelte';
	import { ConsentStore, CONSENT_CONTEXT_KEY } from '$lib/consent/state.svelte';
	import { copy } from '$lib/copy/fi';
	import { SITE_URL } from '$lib/site';

	let { children, data } = $props();

	// Fresh per component tree (per SSR request, then once on the client after
	// hydration) — never a module-level singleton, or one visitor's consent
	// choice would leak into another visitor's render.
	setContext(CONSENT_CONTEXT_KEY, new ConsentStore(data.consent));

	// Map surfaces get the full wide shell; everything else reads at app width.
	const wide = $derived(page.route.id === '/kartta');

	// These routes build their own canonical (query params on /arvio identify
	// the specific verdict shown; the dynamic content routes need their own
	// exact-slug URL) — each sets its own <link rel="canonical">.
	const OWN_CANONICAL_ROUTES = ['/arvio', '/kaupunki/[kunta]', '/postinumero/[pc]'];
	const hasOwnCanonical = $derived(OWN_CANONICAL_ROUTES.includes(page.route.id ?? ''));

	// Real registrant data from /tietosuoja's controller statement, not a
	// placeholder — kept in sync with copy.tietosuoja.controllerBody.
	const organizationLd = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: 'Fides Group',
		url: SITE_URL,
		email: 'arthakkarainen@gmail.com',
		taxID: '3637368-5',
		address: { '@type': 'PostalAddress', addressLocality: 'Espoo', addressCountry: 'FI' }
	};
	const websiteLd = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'RehtiArvio',
		url: SITE_URL
	};
</script>

<svelte:head>
	<title>RehtiArvio | Ilmainen markkinahinta-analyysi</title>
	{#if !hasOwnCanonical}
		<link rel="canonical" href={`${SITE_URL}${page.url.pathname}`} />
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(organizationLd)}<\/script>`}
	{@html `<script type="application/ld+json">${JSON.stringify(websiteLd)}<\/script>`}
</svelte:head>

<a class="skip-link" href="#main">{copy.nav.skipToContent}</a>

<div class="shell">
	<Header />
	<main id="main" class="main" class:main--wide={wide}>
		{@render children()}
	</main>
	<Footer areas={data.dataMeta.areas} />
</div>

<Toaster />
<AnalyticsLoader />
<ConsentBanner />

<style>
	.shell {
		max-width: var(--container-wide);
		margin: 0 auto;
		padding: 0 var(--space-5) var(--space-10);
		display: flex;
		flex-direction: column;
		gap: var(--space-9);
		min-height: 100vh;
	}

	.main {
		flex: 1;
		padding-top: var(--space-7);
		max-width: var(--container-app);
		width: 100%;
	}

	.main--wide {
		max-width: none;
	}

	@media (max-width: 720px) {
		.shell {
			padding: 0 var(--space-4) var(--space-9);
			gap: var(--space-7);
		}
		.main {
			padding-top: var(--space-5);
		}
	}
</style>