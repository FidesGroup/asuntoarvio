<script lang="ts">
	/**
	 * Every fact deterministically parsed from the listing, with derived
	 * per-m² and share-of-price figures. Key fields show "ei ilmoitettu"
	 * when absent — a missing vastike or kunto is information too.
	 */
	import Card from '$lib/components/ui/Card.svelte';
	import { copy } from '$lib/copy/fi';

	let { extracted, facts }: { extracted: any; facts: any } = $props();

	const fmt = new Intl.NumberFormat('fi-FI');
	const L = copy.landing.report.facts;
	const m2 = $derived(facts.livingAreaM2 as number);
	const price = $derived(facts.priceEur as number);

	function perM2(eur: number): string {
		return `${(Math.round((eur / m2) * 10) / 10).toLocaleString('fi-FI')} €/m²`;
	}

	type Row = { label: string; value: string | null; sub?: string | null; missing?: boolean };
	const rows: Row[] = $derived.by(() => {
		const x = extracted;
		const out: Row[] = [];
		const push = (label: string, value: string | null, sub?: string | null, requireLabel = false) => {
			if (value !== null) out.push({ label, value, sub: sub ?? null });
			else if (requireLabel) out.push({ label, value: null, missing: true });
		};
		push(L.address, x.address);
		push(L.rooms, x.roomsRaw ?? (facts.roomsType ? `${facts.roomsType}` : null));
		push(L.area, `${m2.toLocaleString('fi-FI')} m²`);
		push(
			L.debtFreePrice,
			x.debtFreePriceEur ? `${fmt.format(x.debtFreePriceEur)} €` : null,
			x.debtFreePriceEur ? perM2(x.debtFreePriceEur) : null
		);
		push(
			L.askingPrice,
			x.askingPriceEur ? `${fmt.format(x.askingPriceEur)} €` : null
		);
		push(
			L.debtShare,
			x.debtShareEur != null ? `${fmt.format(x.debtShareEur)} €` : null,
			x.debtShareEur && price ? `${Math.round((x.debtShareEur / price) * 100)} % ${L.ofPrice}` : null
		);
		push(
			L.maintenanceCharge,
			x.maintenanceChargeEurMo != null ? `${fmt.format(x.maintenanceChargeEurMo)} €/kk` : null,
			x.maintenanceChargeEurMo != null ? perM2(x.maintenanceChargeEurMo) : null,
			true
		);
		push(
			L.capitalCharge,
			x.capitalChargeEurMo != null ? `${fmt.format(x.capitalChargeEurMo)} €/kk` : null
		);
		push(
			L.totalCharge,
			x.totalChargeEurMo != null ? `${fmt.format(x.totalChargeEurMo)} €/kk` : null,
			x.totalChargeEurMo != null ? perM2(x.totalChargeEurMo) : null
		);
		push(
			L.buildYear,
			x.buildYear ? `${x.buildYear}` : null,
			x.buildYear ? `${new Date().getFullYear() - x.buildYear} ${L.years}` : null
		);
		push(L.condition, x.condition, null, true);
		push(L.floor, x.floor);
		push(L.elevator, x.elevator === null ? null : x.elevator ? L.yes : L.no);
		push(L.landOwnership, x.landOwnership, null, true);
		push(L.tonttiArea, x.tonttiAreaM2 ? `${fmt.format(x.tonttiAreaM2)} m²` : null);
		push(L.energyClass, x.energyClass);
		push(L.housingCompany, x.housingCompany);
		push(L.apartmentCount, x.apartmentCount ? `${x.apartmentCount}` : null);
		push(
			L.mortgages,
			x.mortgagesEur != null ? `${fmt.format(x.mortgagesEur)} €` : null,
			x.mortgagesEur != null && x.apartmentCount
				? `~${fmt.format(Math.round(x.mortgagesEur / x.apartmentCount))} € ${L.perApartment}`
				: null
		);
		return out;
	});
</script>

<Card>
	{#snippet header()}<h2 class="h">{copy.landing.report.factsTitle}</h2>{/snippet}
	<dl class="facts num">
		{#each rows as r (r.label)}
			<div class="fact" class:fact--missing={r.missing}>
				<dt>{r.label}</dt>
				<dd>
					{#if r.missing}<span class="miss">{copy.landing.report.factsMissing}</span>
					{:else}{r.value}{#if r.sub}<span class="sub"> · {r.sub}</span>{/if}{/if}
				</dd>
			</div>
		{/each}
	</dl>
</Card>

<style>
	.h {
		font-size: var(--text-lg);
		font-weight: 600;
		margin: 0;
	}
	.facts {
		margin: 0;
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 0.45rem 2rem;
	}
	.fact {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding-bottom: 0.4rem;
		border-bottom: 1px solid var(--border);
		font-size: var(--text-sm);
		min-width: 0;
	}
	.fact dt {
		color: var(--ink-3);
		flex-shrink: 0;
	}
	.fact dd {
		margin: 0;
		text-align: right;
		font-weight: 500;
		color: var(--ink);
		font-variant-numeric: tabular-nums;
		overflow-wrap: anywhere;
	}
	.sub {
		color: var(--ink-2);
		font-weight: 400;
	}
	.miss {
		color: var(--ink-3);
		font-style: italic;
		font-weight: 400;
	}
	@media (max-width: 720px) {
		.facts {
			grid-template-columns: 1fr;
		}
	}
</style>
