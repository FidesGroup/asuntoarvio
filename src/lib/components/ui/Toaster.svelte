<script lang="ts">
	import { toasts, type ToastTone } from '$lib/styles/toast.svelte';
</script>

<div class="toaster" role="region" aria-label="Ilmoitukset" aria-live="polite">
	{#each toasts.items as t (t.id)}
		<button
			type="button"
			class="toast toast--{t.tone}"
			onclick={() => toasts.dismiss(t.id)}
			aria-label="Sulje ilmoitus"
		>
			<span class="toast__dot" aria-hidden="true"></span>
			<span class="toast__text">{t.text}</span>
			<span class="toast__x" aria-hidden="true">×</span>
		</button>
	{/each}
</div>

<style>
	.toaster {
		position: fixed;
		bottom: 1rem;
		right: 1rem;
		z-index: var(--z-toast);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		max-width: 22rem;
		pointer-events: none;
	}

	@media (max-width: 560px) {
		.toaster {
			left: 1rem;
			right: 1rem;
			max-width: none;
			bottom: 0.5rem;
		}
	}

	.toast {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		padding: 0.65rem 0.85rem 0.65rem 0.95rem;
		background: var(--surface);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-md);
		font-size: var(--text-sm);
		color: var(--ink);
		pointer-events: auto;
		cursor: pointer;
		text-align: left;
		animation: toast-in 220ms var(--ease-spring);
		transition: transform var(--dur-fast) var(--ease-standard);
		min-width: 0;
	}

	.toast:hover {
		transform: translateY(-1px);
	}

	.toast__dot {
		width: 8px;
		height: 8px;
		border-radius: var(--radius-full);
		flex-shrink: 0;
		background: var(--ink-3);
	}

	.toast--success .toast__dot { background: var(--good); }
	.toast--error .toast__dot   { background: var(--danger-fg); }
	.toast--info .toast__dot    { background: var(--brand); }

	.toast__text {
		flex: 1;
		min-width: 0;
	}

	.toast__x {
		color: var(--ink-3);
		font-size: 1.1em;
		line-height: 1;
		padding-left: 0.25rem;
	}

	@keyframes toast-in {
		from { opacity: 0; transform: translateY(8px); }
		to   { opacity: 1; transform: translateY(0); }
	}

	@media (prefers-reduced-motion: reduce) {
		.toast { animation: none; }
	}
</style>