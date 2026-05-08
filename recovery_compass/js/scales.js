// Color: teal (#537D96) below 100%, red (#BF4646) above; grey for near-zero
export function bubColor(rate) {
  if (rate < 5)   return '#c4c0ba';
  if (rate < 100) return d3.interpolateRgb('#3a6070', '#c8b8a8')(rate / 100);
  return d3.interpolateRgb('#c88a82', '#8a2525')(Math.min((rate - 100) / 100, 1));
}

// Square-root size scale: area ∝ flight volume
export function makeRScale(items) {
  const maxF = d3.max(items, d => d.f24);
  return d3.scaleSqrt().domain([0, maxF]).range([10, 54]);
}
