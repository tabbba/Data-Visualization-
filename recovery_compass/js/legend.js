// Build the static colour + size legend in the sidebar.
export function buildLegend(items, rScale, bubColor) {
  const flights  = items.map(d => d.f24);
  const legVals  = [0, 50, 100, 150, 200];
  const gradStops = legVals.map(v => bubColor(v)).join(', ');
  const ticksHtml = legVals.map(v => `<span>${v}%</span>`).join('');

  const szVals = [d3.quantile(flights, .25), d3.median(flights), d3.quantile(flights, .75)];
  const maxR   = d3.max(szVals, s => rScale(s));
  const szHtml = szVals.map((s, i) => {
    const r       = rScale(s);
    const overlap = i === 0 ? 0 : -Math.round(r * 0.55);
    return `<div class="leg-size-row" style="margin-top:${overlap}px">
      <svg width="${maxR*2+2}" height="${r*2+2}" style="overflow:visible;flex-shrink:0">
        <circle cx="${maxR+1}" cy="${r+1}" r="${r}" fill="none" stroke="#b0a594" stroke-width="0.5"/>
      </svg>
      <span class="leg-size-label">${d3.format('.2s')(s)}</span>
    </div>`;
  }).join('');

  document.getElementById('legend').innerHTML = `
    <div class="leg-block">
      <div class="leg-title">Recovery</div>
      <div class="leg-bar" style="background:linear-gradient(90deg,${gradStops})"></div>
      <div class="leg-ticks">${ticksHtml}</div>
    </div>
    <div class="leg-block">
      <div class="leg-title">Traffic (2024)</div>
      <div style="display:flex;flex-direction:column;align-items:center;padding-left:28px">${szHtml}</div>
    </div>`;
}

// Re-render the three metric cards in the sidebar for `year`.
export function updateMetrics(year, yearlyTotals) {
  const yt   = yearlyTotals[year];
  const yt19 = yearlyTotals[2019];
  const tp   = yt.f / yt19.f * 100;
  const cp   = yt.c / yt19.c * 100;
  const fmt  = n => (n >= 100 ? n.toFixed(0) : n.toFixed(1)) + '%';

  document.getElementById('metrics').innerHTML =
    `<div class="metric">
       <div class="m-info">
         <div class="m-lbl">Traffic vs 2019</div>
         <div class="m-sub">ECAC cruise-phase flights</div>
       </div>
       <div class="m-val" style="color:${tp >= 100 ? 'var(--accent)' : 'var(--down)'}">
         ${fmt(tp)}
       </div>
     </div>` +
    `<div class="metric">
       <div class="m-info">
         <div class="m-lbl">CO₂ vs 2019</div>
         <div class="m-sub">${(cp >= 100 ? '+' : '') + (cp - 100).toFixed(0)} pp vs traffic</div>
       </div>
       <div class="m-val" style="color:${cp >= 100 ? 'var(--accent)' : 'var(--down)'}">
         ${fmt(cp)}
       </div>
     </div>` +
    `<div class="metric">
       <div class="m-info">
         <div class="m-lbl">Carbon Bill</div>
         <div class="m-sub">${(yt.bill / yt19.bill * 100).toFixed(0)}% of 2019</div>
       </div>
       <div class="m-val" style="color:var(--accent)">
         €${(yt.bill / 1e9).toFixed(1)}bn
       </div>
     </div>`;
}
