import { CX, CY } from './config.js';

// De-overlap bubbles using a D3 force simulation while preserving each bubble's
// radial distance (= recovery rate). Only the angular position may shift.
export function runForce(items, rScale) {
  // 2019 baseline: every country lands on the same ring. Force would cause
  // chaotic angle jumps among 40+ maximally-dense points, so skip it.
  const allBaseline = items.every(d => Math.abs(d.rate - 100) < 0.01);
  if (allBaseline) {
    items.forEach(d => { d.px = d.ax; d.py = d.ay; });
    return;
  }

  items.forEach(d => { d.x = d.ax; d.y = d.ay; });

  const sim = d3.forceSimulation(items)
    .force('cx',      d3.forceX(d => d.ax).strength(0.35))
    .force('cy',      d3.forceY(d => d.ay).strength(0.35))
    .force('collide', d3.forceCollide(d => rScale(d.f24) + 8).iterations(8))
    .stop();

  for (let i = 0; i < 300; i++) sim.tick();

  // Project each bubble back onto its correct radius so the radial encoding
  // (recovery %) is never distorted — only angle may deviate.
  items.forEach(d => {
    const targetR = Math.hypot(d.ax - CX, d.ay - CY);
    const dist    = Math.hypot(d.x  - CX, d.y  - CY);
    if (dist > 0.1) {
      const s = targetR / dist;
      d.px = CX + (d.x - CX) * s;
      d.py = CY + (d.y - CY) * s;
    } else {
      d.px = d.ax;
      d.py = d.ay;
    }
  });
}
