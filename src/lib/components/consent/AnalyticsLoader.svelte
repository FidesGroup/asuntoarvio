<script lang="ts">
	import { getContext } from 'svelte';
	import { ConsentStore, CONSENT_CONTEXT_KEY } from '$lib/consent/state.svelte';
	import { initClientAnalytics } from '$lib/analytics/posthog-client';

	const consent = getContext<ConsentStore>(CONSENT_CONTEXT_KEY);

	$effect(() => {
		if (consent.analytics && consent.current) {
			initClientAnalytics(consent.current.cid);
		}
	});
</script>
