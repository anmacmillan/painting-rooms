/* The plan of the level: the route on the excavated streets, the classes of street, and the places the level sets on them.
   Coordinates are metres from 40.7500 N, 14.4890 E (x east, z south), as tools/prep_pompeii.py writes them. Street lines are OpenStreetMap's.
   Where each house door stands along its street is taken from the house's mapped position, projected on to the street: good to about ten metres. */
export const BOX = [-262, -196, 186, 76];
export const classOf = n => n === "Via dell'Abbondanza" ? { f: 4.3, cw: 2.1 } : n === 'Via Stabiana' ? { f: 3.9, cw: 2.0 } : /^Via (Nola|della Fortuna|degli Augustali)/.test(n) ? { f: 3.5, cw: 1.9 } : { f: 2.5, cw: 1.35 };

export function makeRoute(map, clamp, mix) {
  const S = n => map.streets.filter(s => s.n === n).sort((a, b) => b.l.length - a.l.length)[0].l;
  const proj = (l, p) => { let best = 1e9, out = null; for (let i = 1; i < l.length; i++) { const a = l[i - 1], b = l[i], dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz), 0, 1), q = [a[0] + dx * t, a[1] + dz * t], d = Math.hypot(q[0] - p[0], q[1] - p[1]); if (d < best) { best = d; out = { i, t, q }; } } return out; };
  /* the stretch of a street between the points nearest A and B, in that order */
  const sub = (l, A, B) => { const a = proj(l, A), b = proj(l, B), fwd = a.i + a.t <= b.i + b.t, pts = [a.q]; if (fwd) for (let i = a.i; i < b.i; i++) pts.push(l[i]); else for (let i = a.i - 1; i >= b.i; i--) pts.push(l[i]); pts.push(b.q); return pts.filter((p, i) => !i || Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]) > 0.3); };
  const ABB = S("Via dell'Abbondanza"), STA = S('Via Stabiana'), BAL = S('Vicolo di Balbo'), TES = S('Vicolo di Tesmo');
  const HOME = PLACES.home.door, CROSS = [-76.1, 5.5], NEO = PLACES.neo.door, balW = BAL[0][0] < BAL[BAL.length - 1][0] ? BAL[0] : BAL[BAL.length - 1], balE = balW === BAL[0] ? BAL[BAL.length - 1] : BAL[0], tesS = [-18.9, -28.8];
  const out = [...sub(ABB, HOME, CROSS), ...sub(STA, CROSS, NEO).slice(1)];
  const back = [...sub(STA, NEO, balW).slice(1), ...sub(BAL, balW, balE).slice(0), ...sub(TES, balE, tesS).slice(1), ...sub(ABB, tesS, HOME).slice(1)];
  const pts = [...out, ...back].filter((p, i, a) => !i || Math.hypot(p[0] - a[i - 1][0], p[1] - a[i - 1][1]) > 0.3), cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  const LEN = cum[cum.length - 1], S_FAR = cum[out.length - 1];
  const at = s => { s = clamp(s, 0, LEN - 0.01); let i = 1; while (cum[i] < s) i++; const t = (s - cum[i - 1]) / (cum[i] - cum[i - 1]), a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]); return { x: mix(a[0], b[0], t), z: mix(a[1], b[1], t), dx: (b[0] - a[0]) / L, dz: (b[1] - a[1]) / L, i }; };
  /* the nearest point of the route. The way out and the way back share streets, so a hint (where she last was) is needed to tell them apart */
  const nearest = (x, z, hint) => { let best = 1e9, s = 0, bd = 1e9; for (let i = 1; i < pts.length; i++) { const a = pts[i - 1], b = pts[i], dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz), 0, 1), d = Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t), si = cum[i - 1] + t * (cum[i] - cum[i - 1]), cost = d + (hint == null ? 0 : 0.06 * Math.abs(si - hint)); if (cost < best) { best = cost; s = si; bd = d; } } return { s, d: bd }; };
  const half = s => { const p = at(s), on = (l, f) => proj(l, [p.x, p.z]) && Math.hypot(proj(l, [p.x, p.z]).q[0] - p.x, proj(l, [p.x, p.z]).q[1] - p.z) < 0.6 ? f : 0; return on(ABB, 4.3) || on(STA, 3.9) || 2.5; };
  const sOf = (p, hint) => nearest(p[0], p[1], hint).s;
  return { pts, cum, LEN, S_FAR, at, nearest, half, sOf, proj, ABB, STA, BAL, TES };
}

/* Places. 'door' is a point on the middle of the street opposite the door; 'side' is which side of the street the house stands on, as she walks the way OUT (+1 right, -1 left). */
export const PLACES = {
  home: { n: 'The house of the painters at work (IX 12, 9)', door: [76.0, -85.0] },
  dog: { n: 'House of Paquius Proculus (I 7, 1)', door: [50.6, -69.9] },
  neo: { n: 'House of Terentius Neo (VII 2, 6)', door: [-180.2, -112.1] },
};
