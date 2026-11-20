/* The plan of the level: the shortened real route on Pompeii's excavated streets (360 m, one turn).
   Coordinates are metres from 40.7500 N, 14.4890 E (x east, z south), as tools/prep_pompeii.py writes them.
   Street lines are OpenStreetMap's; door positions are projected from each house's mapped footprint (good to ~10 m).
   Route: start 26 m south-east of Terentius Neo on the Via Stabiana (facing north-west toward his door and Vesuvius),
   run to Terentius Neo (VII 2, 6) for red, then turn south-east down the Via Stabiana past the Attii colour shop (IX 2, 11-12)
   for blue, turn left at the Holconius crossroads onto the Via dell'Abbondanza past Paquius Proculus' guard dog (I 7, 1)
   and Asellina's bar (IX 11, 2) for black, straight home to the House of the Painters at Work (IX 12, 9). */
export const BOX = [-262, -196, 186, 76];
export const classOf = n => n === "Via dell'Abbondanza" ? { f: 4.3, cw: 2.1 } : n === 'Via Stabiana' ? { f: 3.9, cw: 2.0 } : /^Via (Nola|della Fortuna|degli Augustali)/.test(n) ? { f: 3.5, cw: 1.9 } : { f: 2.5, cw: 1.35 };

export const PLACES = {
  start: { n: 'Via Stabiana', door: [-162.8, -92.8] },
  neo: { n: 'House of Terentius Neo (VII 2, 6)', door: [-180.2, -112.1] },
  attii: { n: 'The Attii, colour makers (IX 2, 11-12)', door: [-113.0, -54.0] },
  cross: { n: 'The Holconius crossroads', door: [-76.1, 5.5] },
  dog: { n: 'House of Paquius Proculus (I 7, 1)', door: [50.6, -69.9] },
  asellina: { n: 'Asellina’s bar (IX 11, 2)', door: [57.0, -73.8] },
  home: { n: 'The House of the Painters at Work (IX 12, 9)', door: [76.0, -85.0] },
};

export function makeRoute(map, clamp, mix) {
  const S = n => map.streets.filter(s => s.n === n).sort((a, b) => b.l.length - a.l.length)[0].l;
  const proj = (l, p) => {
    let best = 1e9, out = null;
    for (let i = 1; i < l.length; i++) {
      const a = l[i - 1], b = l[i], dx = b[0] - a[0], dz = b[1] - a[1];
      const t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1);
      const q = [a[0] + dx * t, a[1] + dz * t], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d < best) { best = d; out = { i, t, q }; }
    }
    return out;
  };
  const sub = (l, A, B) => {
    const a = proj(l, A), b = proj(l, B), fwd = a.i + a.t <= b.i + b.t, pts = [a.q];
    if (fwd) for (let i = a.i; i < b.i; i++) pts.push(l[i]);
    else for (let i = a.i - 1; i >= b.i; i--) pts.push(l[i]);
    pts.push(b.q);
    return pts.filter((p, i) => !i || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.3);
  };
  const ABB = S("Via dell'Abbondanza"), STA = S('Via Stabiana');
  const START = PLACES.start.door, NEO = PLACES.neo.door, CROSS = PLACES.cross.door, HOME = PLACES.home.door;
  const approach = sub(STA, START, NEO);
  const downSta = sub(STA, NEO, CROSS);
  const eastAbb = sub(ABB, CROSS, HOME);
  const pts = [...approach, ...downSta.slice(1), ...eastAbb.slice(1)]
    .filter((p, i, a) => !i || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 0.3);
  const cum = [0];
  for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const neoIdx = approach.length - 1;
  const crossIdx = neoIdx + downSta.length - 1;
  const LEN = cum[cum.length - 1], S_NEO = cum[neoIdx], S_CROSS = cum[crossIdx];
  const at = s => {
    s = clamp(s, 0, LEN - 0.01);
    let i = 1; while (i < cum.length - 1 && cum[i] < s) i++;
    const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1] || 1), a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    return { x: mix(a[0], b[0], t), z: mix(a[1], b[1], t), dx: (b[0] - a[0]) / L, dz: (b[1] - a[1]) / L, i };
  };
  /* afterNeo: false = search 0..S_NEO approach, true = search S_NEO..LEN run home, null/undefined = full route */
  const nearest = (x, z, hint, afterNeo) => {
    let best = 1e9, s = 0, bd = 1e9;
    const i0 = afterNeo === true ? neoIdx + 1 : 1;
    const i1 = afterNeo === false ? neoIdx : pts.length - 1;
    for (let i = i0; i <= i1; i++) {
      const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dz = b[1] - a[1];
      const t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1);
      const d = Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t);
      const si = cum[i - 1] + t * (cum[i] - cum[i - 1]);
      const cost = d + (hint == null ? 0 : 0.05 * Math.abs(si - hint));
      if (cost < best) { best = cost; s = si; bd = d; }
    }
    return { s, d: bd };
  };
  const half = s => (s < S_CROSS - 0.5 ? 3.9 : 4.3);
  const sOf = (p, afterNeo = true) => nearest(p[0], p[1], null, afterNeo).s;
  return { pts, cum, LEN, S_NEO, S_CROSS, S_FAR: S_NEO, neoIdx, crossIdx, at, nearest, half, sOf, proj, ABB, STA };
}
