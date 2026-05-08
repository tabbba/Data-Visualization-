import { CX, CY, COUNTRY_NAMES } from './config.js';

// Wire up hover tooltips and drag-to-reposition for all shape groups.
// `getYear`  — zero-arg function returning the currently displayed year
// `stopPlay` — callback to halt the autoplay timer when a drag starts
export function setupInteraction(shapeGroups, labels, spokes, svg, getYear, stopPlay) {
  _setupTooltips(shapeGroups, labels, spokes, getYear);
  _setupDrag(shapeGroups, labels, spokes, svg, stopPlay);
}

// ── Private helpers ──────────────────────────────────────────────────────────

function _setupTooltips(shapeGroups, labels, spokes, getYear) {
  const $tt   = document.getElementById('tt');
  const $wrap = document.getElementById('compass-wrap');
  let isDragging = false;

  shapeGroups.on('mouseenter', function(e, d) {
    shapeGroups.style('opacity', 0.18);
    labels.style('opacity', 0.12);
    spokes.style('opacity', 0.12);
    d3.select(this).style('opacity', 1).raise();
    d3.select(this).select('path,circle').attr('stroke-opacity', 0.9).attr('stroke', '#2d2418');
    labels.filter(l => l.iso === d.iso).style('opacity', 1).raise();

    const flag = d.iso.toUpperCase().replace(/./g, c =>
      String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65));
    const year = getYear();
    $tt.innerHTML = `
      <div class="tt-head">
        <div>
          <div class="tt-name">${COUNTRY_NAMES[d.iso] || d.iso}</div>
        </div>
        <span class="tt-flag">${flag}</span>
      </div>
      <div class="tt-row">Traffic recovery (${year}): <b>${d.rate.toFixed(1)}%</b></div>
      <div class="tt-row">2019 flights: <b>${d3.format(',')(d.f19)}</b></div>
      <div class="tt-row">${year} flights: <b>${d3.format(',')(d.years[year] || 0)}</b></div>`;
    $tt.classList.add('on');
  });

  shapeGroups.on('mousemove', function(e) {
    const r = $wrap.getBoundingClientRect();
    $tt.style.left = (e.clientX - r.left + 16) + 'px';
    $tt.style.top  = (e.clientY - r.top  - 55) + 'px';
  });

  shapeGroups.on('mouseleave', function() {
    if (isDragging) return;
    shapeGroups.style('opacity', 1);
    labels.style('opacity', 1);
    spokes.style('opacity', 0.45);
    d3.select(this).select('path,circle').attr('stroke-opacity', 0.5).attr('stroke', '#fff');
    $tt.classList.remove('on');
  });

  // Expose isDragging setter so the drag handler can update it
  shapeGroups._setDragging = v => { isDragging = v; };
}

function _setupDrag(shapeGroups, labels, spokes, svg, stopPlay) {
  const svgNode = svg.node();

  function toSVG(clientX, clientY) {
    const pt = svgNode.createSVGPoint();
    pt.x = clientX; pt.y = clientY;
    return pt.matrixTransform(svgNode.getScreenCTM().inverse());
  }

  shapeGroups.call(d3.drag()
    .on('start', function(event, d) {
      if (shapeGroups._setDragging) shapeGroups._setDragging(true);
      stopPlay();
      d3.select(this).raise();
      labels.filter(l => l.iso === d.iso).raise();
      document.getElementById('tt').classList.remove('on');
    })
    .on('drag', function(event, d) {
      const p = toSVG(event.sourceEvent.clientX, event.sourceEvent.clientY);
      // Keep radius fixed (= recovery rate); only angle follows the mouse
      const r     = Math.hypot(d.ax - CX, d.ay - CY);
      const angle = Math.atan2(p.x - CX, -(p.y - CY));
      d.px = CX + r * Math.sin(angle);
      d.py = CY - r * Math.cos(angle);
      d3.select(this).attr('transform', `translate(${d.px},${d.py}) scale(${this._scale})`);
      spokes.filter(s => s.iso === d.iso).attr('x2', d.px).attr('y2', d.py);
      labels.filter(l => l.iso === d.iso).attr('x', d.px).attr('y', d.py);
    })
    .on('end', function() {
      if (shapeGroups._setDragging) shapeGroups._setDragging(false);
    })
  );
}
