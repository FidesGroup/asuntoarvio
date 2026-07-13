<script lang="ts">
	let { items, open = $bindable<number | null>(null) }: {
		items: { q: string; a: string }[];
		open?: number | null;
	} = $props();

	function toggle(i: number) {
		open = open === i ? null : i;
	}
</script>

<ul class="faq">
	{#each items as item, i (item.q)}
		<li class="faq__item" class:open={open === i}>
			<button
				type="button"
				class="faq__q"
				aria-expanded={open === i}
				aria-controls="faq-a-{i}"
				onclick={() => toggle(i)}
			>
				<span>{item.q}</span>
				<span class="faq__icon" aria-hidden="true">
					<span class="faq__plus"></span>
				</span>
			</button>
			<div class="faq__a-wrap" id="faq-a-{i}" role="region">
				<div class="faq__a">{item.a}</div>
			</div>
		</li>
	{/each}
</ul>

<style>
	.faq {
		list-style: none;
		margin: 0;
		padding: 0;
		display: flex;
		flex-direction: column;
		gap: 0;
		border-top: 1px solid var(--border);
	}

	.faq__item {
		border-bottom: 1px solid var(--border);
	}

	.faq__q {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		width: 100%;
		text-align: left;
		font: inherit;
		font-size: var(--text-md);
		font-weight: 500;
		color: var(--ink);
		background: transparent;
		border: none;
		padding: 1.1rem 0;
		cursor: pointer;
		transition: color var(--dur-fast) var(--ease-standard);
	}

	.faq__q:hover {
		color: var(--brand);
	}

	.faq__icon {
		position: relative;
		width: 22px;
		height: 22px;
		flex-shrink: 0;
		border: 1px solid var(--border-2);
		border-radius: var(--radius-full);
		transition: border-color var(--dur-fast) var(--ease-standard);
	}

	.faq__plus {
		position: absolute;
		inset: 0;
		margin: auto;
		width: 9px;
		height: 1.5px;
		background: var(--ink-2);
		transition: background var(--dur-fast) var(--ease-standard);
	}

	.faq__plus::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 50%;
		width: 1.5px;
		height: 9px;
		background: var(--ink-2);
		transform: translate(-50%, -50%);
		transition: transform var(--dur-base) var(--ease-spring);
	}

	.faq__item.open .faq__plus::after {
		transform: translate(-50%, -50%) rotate(90deg);
	}

	.faq__item.open .faq__icon {
		border-color: var(--brand);
		background: var(--brand);
	}

	.faq__item.open .faq__plus,
	.faq__item.open .faq__plus::after {
		background: var(--brand-ink);
	}

	.faq__a-wrap {
		display: grid;
		grid-template-rows: 0fr;
		transition: grid-template-rows var(--dur-base) var(--ease-standard);
	}

	.faq__item.open .faq__a-wrap {
		grid-template-rows: 1fr;
	}

	.faq__a {
		overflow: hidden;
		color: var(--ink-2);
		font-size: var(--text-md);
		line-height: var(--lh-body);
		padding-right: 2.5rem;
	}

	.faq__item.open .faq__a {
		padding-bottom: 1.25rem;
	}

	@media (prefers-reduced-motion: reduce) {
		.faq__a-wrap { transition: none; }
		.faq__plus::after { transition: none; }
	}
</style>