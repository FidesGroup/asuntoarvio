/**
 * Build paavo.seed.json: adult median income (hr_mtu) and dwelling count
 * (ra_asunn) per postal code from Statistics Finland's Paavo open data
 * (CC BY 4.0). Powers the price-to-income and liquidity map modes.
 *
 * One-shot generator, rerun when Paavo publishes a new vintage (annually):
 *   node --experimental-strip-types scripts/build-paavo-stats.mts
 *
 * Output: src/lib/server/paavo.seed.json
 *   { vuosi, cells: { [pc]: { mtu, asunnot } } }
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const WFS =
	'https://geo.stat.fi/geoserver/postialue/wfs' +
	'?service=WFS&version=2.0.0&request=GetFeature&typeName=postialue:pno_tilasto' +
	'&propertyName=postinumeroalue,vuosi,hr_mtu,ra_asunn' +
	'&outputFormat=application/json';

async function main() {
	const res = await fetch(WFS);
	if (!res.ok) throw new Error(`Paavo WFS: HTTP ${res.status}`);
	const fc = (await res.json()) as {
		features: {
			properties: {
				postinumeroalue: string;
				vuosi: number;
				hr_mtu: number | null;
				ra_asunn: number | null;
			};
		}[];
	};

	// Paavo encodes suppressed/missing values as -1.
	const clean = (v: number | null | undefined) => (v == null || v < 0 ? null : v);

	const cells: Record<string, { mtu: number | null; asunnot: number | null }> = {};
	let vuosi = 0;
	for (const f of fc.features) {
		const p = f.properties;
		if (!/^\d{5}$/.test(p.postinumeroalue)) continue;
		vuosi = Math.max(vuosi, p.vuosi ?? 0);
		cells[p.postinumeroalue] = { mtu: clean(p.hr_mtu), asunnot: clean(p.ra_asunn) };
	}
	const withIncome = Object.values(cells).filter((c) => c.mtu !== null).length;
	const withDwellings = Object.values(cells).filter((c) => c.asunnot !== null).length;
	console.log(
		`[paavo] vuosi=${vuosi} areas=${Object.keys(cells).length} income=${withIncome} dwellings=${withDwellings}`
	);

	writeFileSync(resolve(root, 'src/lib/server/paavo.seed.json'), JSON.stringify({ vuosi, cells }));
	console.log('[paavo] wrote src/lib/server/paavo.seed.json');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
