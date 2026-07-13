<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';
	import Header from '$lib/components/chrome/Header.svelte';
	import Footer from '$lib/components/chrome/Footer.svelte';
	import Toaster from '$lib/components/ui/Toaster.svelte';
	import { theme } from '$lib/styles/theme.svelte';
	import { copy } from '$lib/copy/fi';

	let { children } = $props();

	onMount(() => {
		theme.init();
	});
</script>

<svelte:head>
	<title>RehtiArvio — ilmainen markkinahinta-analyysi</title>
</svelte:head>

<a class="skip-link" href="#main">{copy.nav.skipToContent}</a>

<div class="shell">
	<Header />
	<main id="main" class="main">
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