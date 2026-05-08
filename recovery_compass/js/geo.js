import { R, CX, CY, CENTER_LAT, CENTER_LON } from './config.js';

const cLat = CENTER_LAT * Math.PI / 180;
const cLon = CENTER_LON * Math.PI / 180;

// Great-circle bearing from the compass center to (lat, lon), in radians
// Returns 0 = North, π/2 = East, …
export function bearing(lat, lon) {
  const la = lat * Math.PI / 180;
  const lo = lon * Math.PI / 180;
  const cosC = Math.sin(cLat) * Math.sin(la) + Math.cos(cLat) * Math.cos(la) * Math.cos(lo - cLon);
  const cosCc = Math.max(-1, Math.min(1, cosC));
  const c = Math.acos(cosCc);
  const sinC = Math.sin(c);
  if (sinC < 1e-5) return 0;
  const cb = (Math.sin(la) - Math.sin(cLat) * cosC) / Math.cos(cLat) / sinC;
  let b = Math.acos(Math.max(-1, Math.min(1, cb)));
  if (Math.sin(lo - cLon) < 0) b = -b;
  return b;
}

// Map (bearing, recovery-rate %) → SVG [x, y]
// rate >= 100  → outside the ring (log scale)
// rate < 100   → inside the ring (linear)
export function polar(b, rate) {
  let r;
  if (rate >= 100) {
    r = R * (1 + Math.log2(rate / 100) * 0.6);
  } else if (rate < 5) {
    r = R * 0.06;
  } else {
    r = R * (1 - (100 - rate) / 100 * 0.78);
  }
  r = Math.max(3, Math.min(R * 1.3, r));
  return [CX + r * Math.sin(b), CY - r * Math.cos(b)];
}
