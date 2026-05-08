// Parse one CSV line, respecting double-quoted fields
export function csvLine(l) {
  const o = [], n = l.length;
  let c = '', q = 0;
  for (let i = 0; i < n; i++) {
    const ch = l[i];
    if (ch === '"') {
      if (q && l[i + 1] === '"') { c += '"'; i++; } else q = !q;
    } else if (ch === ',' && !q) {
      o.push(c); c = '';
    } else {
      c += ch;
    }
  }
  o.push(c);
  return o;
}

export async function loadCSV(path) {
  const r = await fetch(path);
  if (!r.ok) throw new Error(path + ' ' + r.status);
  const t = await r.text();
  const ln = t.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const hd = csvLine(ln.shift() || '');
  const rows = [];
  for (const l of ln) {
    if (!l) continue;
    const p = csvLine(l);
    if (p.length !== hd.length) continue;
    const o = {};
    for (let i = 0; i < hd.length; i++) o[hd[i]] = p[i];
    rows.push(o);
  }
  return rows;
}
