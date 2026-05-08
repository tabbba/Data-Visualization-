import { loadCSV } from './utils.js';
import { CENTROIDS } from './config.js';

// Load all CSV/GeoJSON sources, aggregate, and return structured data objects.
// `prog(percent, message)` is called with loader progress updates.
export async function loadAllData(prog) {
  prog(5, 'Loading carbon price…');
  const priceRows = await loadCSV('../data/clean/carbon_price_monthly_cleaned.csv');
  const priceYM = {};
  for (const r of priceRows) priceYM[r.YEAR + '-' + r.MONTH] = +r.EUA_PRICE_EUR;

  prog(14, 'Loading ECAC network…');
  const net = await loadCSV('../data/clean/emission_network_clean.csv');

  prog(38, 'Loading state emissions…');
  const st = await loadCSV('../data/clean/emission_state_clean.csv');

  prog(50, 'Loading country geometries…');
  let worldData = null;
  try {
    const res = await fetch('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json');
    if (res.ok) {
      const t = await res.json();
      worldData = topojson.feature(t, t.objects.countries);
    }
  } catch (_) {}

  prog(60, 'Aggregating…');

  // ── ECAC-wide monthly totals (cruise flights + CO₂) ──
  const ecac = {};
  for (const r of net) {
    const k = r.YEAR + '-' + r.MONTH;
    if (!ecac[k]) ecac[k] = { f: 0, c: 0, y: +r.YEAR, m: +r.MONTH };
    ecac[k].c += +r.CO2_KG || 0;
    if (r.FLIGHT_PHASE === 'cruise') ecac[k].f += +r.NB_FLIGHTS || 0;
  }

  // ── Per-country annual cruise-flight totals ──
  const stAgg = {}, stCO2 = {};
  for (const r of st) {
    if (r.FLIGHT_PHASE !== 'cruise') continue;
    const y = +r.YEAR;
    if (y < 2019 || y > 2024) continue;
    const a = r.AREA;
    if (!stAgg[a]) stAgg[a] = {};
    stAgg[a][y] = (stAgg[a][y] || 0) + (+r.NB_FLIGHTS || 0);
    if (!stCO2[a]) stCO2[a] = {};
    stCO2[a][y] = (stCO2[a][y] || 0) + (+r.CO2_KG || 0);
  }

  // Keep only countries with known centroids and meaningful 2019 volume
  const cty = {};
  for (const [a, ys] of Object.entries(stAgg)) {
    if (!CENTROIDS[a] || !ys[2019] || ys[2019] < 5000) continue;
    cty[a] = { iso: a, years: ys, f19: ys[2019], f24: ys[2024] || 0, co2: stCO2[a] || {} };
  }

  // ── ECAC-wide yearly totals for the metrics sidebar ──
  const yearlyTotals = {};
  for (let y = 2019; y <= 2024; y++) {
    yearlyTotals[y] = { f: 0, c: 0, bill: 0 };
    for (let m = 1; m <= 12; m++) {
      const k = y + '-' + m;
      const cur = ecac[k];
      if (!cur) continue;
      const ct = cur.c / 1000;
      const p  = priceYM[k] || 0;
      yearlyTotals[y].f    += cur.f;
      yearlyTotals[y].c    += cur.c;
      yearlyTotals[y].bill += ct * p;
    }
  }

  return { cty, yearlyTotals, worldData };
}
