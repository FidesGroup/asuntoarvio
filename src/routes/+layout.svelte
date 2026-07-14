<script lang="ts">
	import '../app.css';
	import { page } from '$app/state';
	import Header from '$lib/components/chrome/Header.svelte';
	import Footer from '$lib/components/chrome/Footer.svelte';
	import Toaster from '$lib/components/ui/Toaster.svelte';
	import { copy } from '$lib/copy/fi';

	let { children } = $props();

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
	<Footer />
</div>

<Toaster />

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