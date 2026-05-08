import { R, CX, CY, SVGW, SVGH } from './config.js';

// Create the root SVG element inside `containerId` and return { svg, g, defs }.
export function initSVG(containerId) {
  const svg  = d3.select('#' + containerId).append('svg').attr('viewBox', [0, 0, SVGW, SVGH]);
  const defs = svg.append('defs');
  const g    = svg.append('g');
  return { svg, g, defs };
}

// Draw all static background elements: glow, reference rings, wind-rose lines,
// compass direction labels, and center dot.
export function drawBackground(g, defs) {
  _drawWindRoseImage(g, defs);
  _drawGlow(g, defs);
  _drawRings(g);
  _drawWindRoseLines(g);
  _drawDirectionLabels(g);
  _drawCenterDot(g);
}

// ── Private helpers ──────────────────────────────────────────────────────────

function _drawWindRoseImage(g, defs) {
  const filter = defs.append('filter').attr('id', 'rose-tint');
  // feColorMatrix values: adjust RGB rows to change tint colour/intensity
  filter.append('feColorMatrix')
    .attr('type', 'matrix')
    .attr('values', '0.5 0 0 0 0.08  0 0.42 0 0 0.14  0 0 0.38 0 0.12  0 0 0 0.92 0');

  const roseR = R * 0.98;
  g.insert('image', ':first-child')
    .attr('href', '../assets/simple-wind-rose.svg')
    .attr('x', CX - roseR).attr('y', CY - roseR)
    .attr('width', roseR * 2).attr('height', roseR * 2)
    .attr('preserveAspectRatio', 'xMidYMid meet')
    .attr('filter', 'url(#rose-tint)');
}

function _drawGlow(g, defs) {
  const glow = defs.append('radialGradient').attr('id', 'glow');
  glow.append('stop').attr('offset', '0%').attr('stop-color', '#f4f5f7').attr('stop-opacity', 1);
  glow.append('stop').attr('offset', '60%').attr('stop-color', '#f4f5f7').attr('stop-opacity', 0.5);
  glow.append('stop').attr('offset', '100%').attr('stop-color', '#f4f5f7').attr('stop-opacity', 0);
  g.append('circle').attr('cx', CX).attr('cy', CY).attr('r', 420).attr('fill', 'url(#glow)');
}

function _drawRings(g) {
  const rings = [
    { r: R * 0.4, label: '',              op: 0.15, dash: ''    },
    { r: R * 0.7, label: '',              op: 0.20, dash: ''    },
    { r: R,       label: '2019 baseline', op: 0.55, dash: ''    },
    { r: R * 1.3, label: '',              op: 0.15, dash: '3,6' },
  ];
  rings.forEach(rd => {
    g.append('circle').attr('cx', CX).attr('cy', CY).attr('r', rd.r)
      .attr('fill', 'none')
      .attr('stroke', 'var(--ref-ring)')
      .attr('stroke-width', rd.r === R ? 1.2 : 0.5)
      .attr('stroke-dasharray', rd.dash)
      .attr('opacity', rd.op);
    if (rd.label) {
      g.append('text').attr('x', CX + rd.r + 6).attr('y', CY - 12)
        .attr('fill', '#9a8e7e')
        .style('font-family', 'var(--font-mono)')
        .style('font-size', '11px')
        .style('letter-spacing', '.04em')
        .text(rd.label);
    }
  });
}

function _drawWindRoseLines(g) {
  const tiers = [
    { step: 90, len: 1.10, sw: 1.2, op: 0.55, color: '#bcc4c0', offset: 0    },
    { step: 90, len: 0.95, sw: 0.8, op: 0.40, color: '#c8d0cc', offset: 45   },
    { step: 45, len: 0.80, sw: 0.5, op: 0.28, color: '#d4dcd8', offset: 22.5 },
  ];
  tiers.forEach(tier => {
    const n = Math.round(360 / tier.step);
    for (let i = 0; i < n; i++) {
      const b  = (tier.offset + i * tier.step) * Math.PI / 180;
      const bb = b > Math.PI ? b - 2 * Math.PI : b;
      g.append('line')
        .attr('x1', CX).attr('y1', CY)
        .attr('x2', CX + R * tier.len * Math.sin(bb))
        .attr('y2', CY - R * tier.len * Math.cos(bb))
        .attr('stroke', tier.color)
        .attr('stroke-width', tier.sw)
        .attr('opacity', tier.op);
    }
  });
}

function _drawDirectionLabels(g) {
  const roseR = R * 0.98;
  const dirs = [
    { b: 0,           label: 'N', dx:   0, dy: -18 },
    { b: Math.PI / 2, label: 'E', dx:  14, dy:   4 },
    { b: Math.PI,     label: 'S', dx:   0, dy:  18 },
    { b: -Math.PI/2,  label: 'W', dx: -14, dy:   4 },
  ];
  dirs.forEach(d => {
    g.append('text')
      .attr('x', CX + roseR * Math.sin(d.b) + d.dx)
      .attr('y', CY - roseR * Math.cos(d.b) + d.dy)
      .attr('text-anchor', 'middle')
      .attr('fill', '#b0a594')
      .style('font-family', 'var(--font-display)')
      .style('font-size', '16px')
      .style('letter-spacing', '.06em')
      .text(d.label);
  });
}

function _drawCenterDot(g) {
  g.append('circle').attr('cx', CX).attr('cy', CY).attr('r', 4)
    .attr('fill', '#5c5046').attr('opacity', 0.7);
  g.append('circle').attr('cx', CX).attr('cy', CY).attr('r', 1.5)
    .attr('fill', '#f4f5f7');
}
