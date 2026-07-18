/**
 * Downloadable area table for /kartta: every published postal area with the
 * derived metrics, exactly as shown on the page (same marketstats source).
 * Finnish Excel conventions: semicolon separator, decimal comma, UTF-8 BOM.
 * StatFin attribution rides in the first line — CC BY 4.0 requires it to
 * travel with the data, not just sit on the page.
 */
import { areaRows, marketStats } from '$lib/server/marketstats';
import type { RequestHandler } from './$types';

const num = (v: number | null): string => (v === null ? '' : String(v).replace('.', ','));
const text = (s: string): string => (/[";\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s);

export const GET: RequestHandler = () => {
	const stats = marketStats();
	const lines = [
		`# RehtiArvio — markkina-analyysi ${stats.windowLabel}. Lähde: Tilastokeskus (13mt, asvu 13eb, Paavo), CC BY 4.0.`,
		[
			'postinumero',
			'alue',
			'eur_m2',
			'kauppoja_4nelj',
			'muutos_12kk_pct',
			'vuokratuotto_brutto_pct',
			'hinta_tulot_suhde',
			'kauppoja_per_1000_asuntoa',
			'mediaanitulot_eur',
			'asuntoja'
		].join(';')
	];
	for (const r of areaRows()) {
		lines.push(
			[
				r.pc,
				text(r.nimi),
				String(r.eur),
				String(r.n),
				num(r.chgPct),
				num(r.yieldPct),
				num(r.priceIncome),
				num(r.per1000),
				num(r.medianIncome),
				num(r.dwellings)
			].join(';')
		);
	}
	// The invisible leading char is U+FEFF (BOM) so Excel opens the file as UTF-8.
	return new Response('﻿' + lines.join('\r\n') + '\r\n', {
		headers: {
			'content-type': 'text/csv; charset=utf-8',
			'content-disposition': 'attachment; filename="rehtiarvio-markkina-analyysi.csv"',
			'cache-control': 'public, max-age=3600'
		}
	});
};
