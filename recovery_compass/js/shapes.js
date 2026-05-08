import { ISO_NUM_TO_A2 } from './config.js';

// Build a map of iso2 → { d, diag, cx, cy } from the TopoJSON world atlas.
// Returns an empty object if worldData is null (shapes unavailable).
export function preprocessShapes(worldData, cty) {
  const countryShapes = {};
  if (!worldData) return countryShapes;

  const proj = d3.geoMercator().scale(140).translate([0, 0]);
  const path = d3.geoPath(proj);

  worldData.features.forEach(f => {
    const iso2 = ISO_NUM_TO_A2[f.id];
    if (!iso2 || !cty[iso2]) return;
    const d = path(f);
    if (!d) return;
    const b    = path.bounds(f);
    const diag = Math.hypot(b[1][0] - b[0][0], b[1][1] - b[0][1]);
    if (diag < 0.05) return;
    countryShapes[iso2] = {
      d,
      diag,
      cx: (b[0][0] + b[1][0]) / 2,
      cy: (b[0][1] + b[1][1]) / 2,
    };
  });
  return countryShapes;
}

// Render one <g> per country, containing either a country-outline <path>
// or a fallback <circle>. Stores the computed scale on el._scale.
// Returns the d3 selection of shape groups.
export function renderShapes(g, items, countryShapes, rScale, bubColor) {
  const shapeGroups = g.selectAll('.shape-g').data(items).join('g')
    .attr('class', 'shape-g')
    .attr('transform', d => `translate(${d.px},${d.py}) scale(0)`);

  shapeGroups.each(function(d) {
    const s = countryShapes[d.iso];
    if (s) {
      d3.select(this).append('path')
        .attr('d', s.d)
        .attr('transform', `translate(${-s.cx},${-s.cy})`)
        .attr('fill', bubColor(d.rate))
        .attr('fill-opacity', 0.82)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.5)
        .attr('vector-effect', 'non-scaling-stroke');
      this._scale = rScale(d.f24) / (s.diag / 2);
    } else {
      d3.select(this).append('circle')
        .attr('r', 8)
        .attr('fill', bubColor(d.rate))
        .attr('fill-opacity', 0.82)
        .attr('stroke', '#fff')
        .attr('stroke-width', 0.5)
        .attr('stroke-opacity', 0.5);
      this._scale = rScale(d.f24) / 8;
    }
  });

  return shapeGroups;
}
