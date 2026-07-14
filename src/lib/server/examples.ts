/**
 * Example valuations for the landing page: representative property
 * profiles priced from the real benchmark seed (StatFin 13mt) and rent
 * seed (asvu 13eb). These are area-level illustrations, never claims
 * about specific listings — the disclaimer in the UI must say so.
 */
import { lookupCell, type RoomsType } from './benchmark';
import { estimateRent } from './rents';

export interface ExampleCase {
	id: string;
	roomsType: RoomsType;
	m2: number;
	pc: string;
	areaName: string;
	/** area realized €/m² over 4 quarters */
	eurM2: number;
	/** transactions behind the number */
	n: number;
	/** area price level for this size, rounded to 1 000 € */
	priceLevelEur: number;
	/** statistical rent estimate, €/month (null when not published) */
	rentEurMonth: number | null;
	/** gross yield %, one decimal (null without rent) */
	grossYieldPct: number | null;
}

const PROFILES: { id: string; roomsType: RoomsType; m2: number; pc: string; areaName: string }[] = [
	{ id: 'yksio-helsinki', roomsType: 'yksiö', m2: 30, pc: '00530', areaName: 'Kallio, Helsinki' },
	{ id: 'kaksio-tampere', roomsType: 'kaksio', m2: 54, pc: '33100', areaName: 'Tampere keskus' },
	{ id: 'kolmio-turku', roomsType: 'kolmio+', m2: 78, pc: '20100', areaName: 'Turku keskus' },
	{ id: 'kaksio-oulu', roomsType: 'kaksio', m2: 55, pc: '90100', areaName: 'Oulu keskus' }
];

let cached: ExampleCase[] | null = null;

export function exampleCases(): ExampleCase[] {
	if (cached) return cached;
	cached = PROFILES.flatMap((p) => {
		const cell = lookupCell(p.pc, p.roomsType);
		if (!cell?.benchmark_eur_m2) return [];
		const priceLevelEur = Math.round((cell.benchmark_eur_m2 * p.m2) / 1000) * 1000;
		const rent = estimateRent(p.pc, p.roomsType, p.m2);
		const rentEurMonth = rent.monthlyRentEur;
		const grossYieldPct =
			rentEurMonth !== null && priceLevelEur > 0
				? Math.round(((rentEurMonth * 12) / priceLevelEur) * 1000) / 10
				: null;
		return [
			{
				...p,
				eurM2: cell.benchmark_eur_m2,
				n: cell.n_4q,
				priceLevelEur,
				rentEurMonth,
				grossYieldPct
			}
		];
	});
	return cached;
}
