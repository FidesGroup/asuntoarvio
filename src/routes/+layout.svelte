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

	let { children, data } = $props();

	// Fresh per component tree (per SSR request, then once on the client after
	// hydration) — never a module-level singleton, or one visitor's consent
	// choice would leak into another visitor's render.
	setContext(CONSENT_CONTEXT_KEY, new ConsentStore(data.consent));

	// Map surfaces get the full wide shell; everything else reads at app width.
	const wide = $derived(page.route.id === '/kartta');
</script>

<svelte:head>
	<title>RehtiArvio | Ilmainen markkinahinta-analyysi</title>
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