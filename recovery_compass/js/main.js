import { CENTROIDS, CX, CY }        from './config.js';
import { loadAllData }               from './data.js';
import { bubColor, makeRScale }      from './scales.js';
import { bearing, polar }            from './geo.js';
import { runForce }                  from './force.js';
import { initSVG, drawBackground }   from './compass.js';
import { preprocessShapes, renderShapes } from './shapes.js';
import { setupInteraction }          from './interaction.js';
import { buildLegend, updateMetrics } from './legend.js';
import { setupTimeline, setCaption } from './timeline.js';

(async function () {
  // ── Loader helpers ──
  const $loader = document.getElementById('loader');
  const $bar    = document.getElementById('loader-bar');
  const $msg    = document.getElementById('loader-msg');
  const $dash   = document.getElementById('dash');

  function prog(p, m) {
    $bar.style.setProperty('--p', p + '%');
    if (m) $msg.textContent = m;
  }

  // ── Load & aggregate data ──
  const { cty, yearlyTotals, worldData } = await loadAllData(prog);

  prog(75, 'Composing compass…');

  // ── Build items: one object per country ──
  const items = Object.values(cty).map(d => {
    const b        = bearing(...CENTROIDS[d.iso]);
    const [ax, ay] = polar(b, 100); // 2019 baseline = 100%
    return { ...d, rate: 100, bearing: b, ax, ay, px: ax, py: ay };
  });

  const rScale = makeRScale(items);

  // ── SVG scaffold ──
  const { svg, g, defs } = initSVG('compass-wrap');
  drawBackground(g, defs);

  // ── Spoke lines (center → bubble) ──
  const spokes = g.selectAll('.spoke').data(items).join('line')
    .attr('x1', CX).attr('y1', CY)
    .attr('x2', d => d.px).attr('y2', d => d.py)
    .attr('stroke', d => d.rate < 100 ? '#a8b8b8' : '#c8b0b0')
    .attr('stroke-width', 0.3)
    .attr('opacity', 0.45);

  // ── Country shapes (de-overlapped) ──
  const countryShapes = preprocessShapes(worldData, cty);
  runForce(items, rScale);
  const shapeGroups = renderShapes(g, items, countryShapes, rScale, bubColor);

  // Animate shapes in on load
  shapeGroups.transition().duration(800).delay((_, i) => i * 12)
    .ease(d3.easeBackOut.overshoot(1.8))
    .attr('transform', function(d) { return `translate(${d.px},${d.py}) scale(${this._scale})`; });

  // ── ISO labels ──
  const labels = g.selectAll('.lbl').data(items).join('text')
    .attr('x', d => d.px).attr('y', d => d.py)
    .attr('dy', '0.35em')
    .attr('text-anchor', 'middle')
    .attr('fill', 'rgba(255,255,255,0.95)')
    .style('font-family', 'var(--font-mono)')
    .style('font-weight', '500')
    .style('font-size', d => Math.max(7, Math.min(rScale(d.f24) * 0.52, 11)) + 'px')
    .style('letter-spacing', '0.06em')
    .style('pointer-events', 'none')
    .style('stroke', 'rgba(0,0,0,0.45)')
    .style('stroke-width', '2.5px')
    .style('stroke-linejoin', 'round')
    .style('paint-order', 'stroke fill')
    .text(d => d.iso);

  // ── Year state ──
  let currentYear = 2019;

  // ── Main update function (called by timeline on year change) ──
  function update(year) {
    currentYear = year;

    // Recompute polar positions for new year, then de-overlap
    items.forEach(d => {
      d.rate        = (d.years[year] || 0) / d.years[2019] * 100;
      const b       = bearing(...CENTROIDS[d.iso]);
      const [ax, ay] = polar(b, d.rate);
      d.ax = ax; d.ay = ay; d.bearing = b;
    });
    runForce(items, rScale);

    updateMetrics(year, yearlyTotals);

    spokes.transition().duration(400).ease(d3.easeCubicInOut)
      .attr('x2', d => d.px).attr('y2', d => d.py)
      .attr('stroke', d => d.rate < 100 ? '#a8b8b8' : '#c8b0b0');

    shapeGroups.transition().duration(400).ease(d3.easeCubicInOut)
      .attr('transform', function(d) { return `translate(${d.px},${d.py}) scale(${this._scale})`; })
      .each(function(d) {
        d3.select(this).select('path,circle')
          .transition().duration(400)
          .attr('fill', bubColor(d.rate));
      });

    labels.data(items).transition().duration(400).ease(d3.easeCubicInOut)
      .attr('x', d => d.px).attr('y', d => d.py);

    document.getElementById('year-disp').textContent = year;
    setCaption(year);
  }

  // ── Wire up controls ──
  const stopPlay = setupTimeline(update, 2019);
  setupInteraction(shapeGroups, labels, spokes, svg, () => currentYear, stopPlay);

  // ── Sidebar ──
  buildLegend(items, rScale, bubColor);

  // ── Initial render ──
  update(2019);

  prog(100, 'Ready.');
  $loader.classList.add('hidden');
  $dash.classList.add('ready');
})().catch(err => {
  console.error(err);
  document.getElementById('loader-msg').textContent = 'Error: ' + (err.message || String(err));
});
