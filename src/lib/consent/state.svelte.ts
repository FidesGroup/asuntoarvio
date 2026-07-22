import {
	isConsentCurrent,
	type ConsentAction,
	type ConsentState
} from './shared';

/**
 * Per-request/per-session consent store. Instantiated once in the root
 * layout and shared via Svelte context (`getContext('consent')`) — NOT a
 * module-level singleton, since module state in a `.svelte.ts` file is
 * shared across concurrent SSR requests and would leak one visitor's
 * consent choice into another visitor's page render.
 */
export class ConsentStore {
	current = $state<ConsentState | null>(null);

	constructor(initial: ConsentState | null) {
		this.current = initial;
	}

	get analytics(): boolean {
		return this.current?.analytics ?? false;
	}

	get marketing(): boolean {
		return this.current?.marketing ?? false;
	}

	/** True until the visitor has made (and stored) a current-version choice. */
	get needsPrompt(): boolean {
		return !isConsentCurrent(this.current);
	}

	private async send(
		action: ConsentAction,
		overrides?: { analytics?: boolean; marketing?: boolean }
	): Promise<void> {
		try {
			const res = await fetch('/api/consent', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({ action, ...overrides, path: window.location.pathname })
			});
			if (!res.ok) return;
			const body = await res.json();
			this.current = body.state;
		} catch {
			// consent can't be confirmed as saved — leave the banner open rather
			// than silently assuming a choice that wasn't recorded
		}
	}

	acceptAll(): Promise<void> {
		return this.send('accept_all');
	}

	rejectAll(): Promise<void> {
		return this.send('reject_all');
	}

	saveCustom(analytics: boolean, marketing: boolean): Promise<void> {
		return this.send('custom', { analytics, marketing });
	}

	/** Used by the /evasteet preference manager to turn everything back off. */
	withdraw(): Promise<void> {
		return this.send('withdraw', { analytics: false, marketing: false });
	}
}

export const CONSENT_CONTEXT_KEY = 'consent';
