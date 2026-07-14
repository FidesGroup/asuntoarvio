<script lang="ts">
	import PageHero from '$lib/components/sections/PageHero.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { copy } from '$lib/copy/fi';

	let { data } = $props();

	const isActiveState = $derived(data.state === 'activated' || data.state === 'active');
	const isTerminal = $derived(data.state === 'canceled' || data.state === 'anonymous');
	const isProblem = $derived(data.state === 'past_due' || data.state === 'session-failed');

	const heading = $derived(
		data.state === 'activated' ? copy.tili.activated :
		data.state === 'active' ? copy.tili.active :
		data.state === 'past_due' ? copy.tili.pastDue :
		data.state === 'canceled' ? copy.tili.canceled :
		data.state === 'session-failed' ? copy.tili.sessionFailed :
		copy.tili.none
	);

	const lede = $derived(
		data.state === 'activated' ? `${copy.tili.activatedLede} (${data.email})` :
		data.state === 'active' ? `${data.email}. ${copy.tili.activeLede}` :
		data.state === 'past_due' ? `${copy.tili.pastDueLede} (${data.email})` :
		data.state === 'canceled' ? copy.tili.canceled :
		data.state === 'session-failed' ? copy.tili.sessionFailedLede :
		copy.tili.noneLede
	);
</script>

<svelte:head>
	<title>Tili | RehtiArvio</title>
</svelte:head>

<PageHero eyebrow="Tili" h1={heading} lede={lede} compact />

<Card>
	{#if isActiveState}
		<Button href="/">{copy.tili.ctaAnalyze}</Button>
	{:else if isTerminal}
		<Button href="/tilaa">{copy.tili.ctaResubscribe}</Button>
	{:else if isProblem}
		<Button href="/tilaa">{copy.tili.ctaResubscribe}</Button>
	{:else}
		<p class="muted">Päivitä maksutapa saamasi sähköpostilinkin kautta.</p>
	{/if}
</Card>

<style>
	.muted { color: var(--ink-3); margin: 0; font-size: var(--text-sm); }
</style>