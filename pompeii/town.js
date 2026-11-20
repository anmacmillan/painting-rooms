/* Pompeii's streets, pavements and house fronts, raised from the surveyed plan (map.json, made by tools/prep_pompeii.py from OpenStreetMap).
   What is real: the lines of the streets, where they cross, and (as class widths taken from the surveyed walls) how wide they are.
   What is not: everything above the wall stumps. Upper floors, roofs, the pent roofs over the pavements, which bay is a shop and which a door are laid out by rule
   (a seeded hash), except the handful of named houses the level places itself. The look follows the excavated Via dell'Abbondanza: a dark red dado under white plaster,
   wide shop openings with masonry counters, lava paving with raised pavements and stepping stones. FINDINGS.md says what each of these rests on. */
export function makeTown({ THREE, scene, map, T, plane, box, classOf, noBay }) {
  const lam = o => new THREE.MeshLambertMaterial(o), h0 = (x, z) => plane.a * x + plane.b * z, KERB = 0.26;
  const rep = (t, n) => { const c = t.clone(); c.needsUpdate = true; c.wrapS = c.wrapT = THREE.RepeatWrapping; return c; };
  const M = { white: lam({ map: T.white }), red: lam({ map: T.red }), ochre: lam({ map: T.ochre }), rubble: lam({ map: T.rubble }), dark: lam({ color: '#1b1410' }), inner: lam({ color: '#4a3a2c' }), wood: lam({ map: T.wood }),
    tile: lam({ map: T.tile }), basalt: lam({ map: T.basalt }), walk: lam({ map: T.walk }), kerb: lam({ color: '#77757a' }), stone: lam({ color: '#8a888c' }), lava: lam({ color: '#5c5c62' }), counter: lam({ color: '#c9bfae' }), black: lam({ color: '#0d0a08' }), sill: lam({ color: '#b8ae9a' }) };
  /* ---- a batcher: every quad of one material goes into one mesh ---- */
  const bat = {}, meshes = {}; const B = k => bat[k] || (bat[k] = { p: [], u: [], n: [], i: [] });
  function quad(k, a, b, c, d, hint, us = 1, vs = 1, u0 = 0, v0 = 0) {      /* a b c d in order round the face; hint: a direction the face should look towards */
    const e1 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], e2 = [d[0] - a[0], d[1] - a[1], d[2] - a[2]]; let n = [e1[1] * e2[2] - e1[2] * e2[1], e1[2] * e2[0] - e1[0] * e2[2], e1[0] * e2[1] - e1[1] * e2[0]]; const l = Math.hypot(...n) || 1; n = n.map(v => v / l);
    const g = B(k), i = g.p.length / 3, flip = hint && n[0] * hint[0] + n[1] * hint[1] + n[2] * hint[2] < 0; if (flip) n = n.map(v => -v);
    g.p.push(...a, ...b, ...c, ...d); g.u.push(u0, v0, u0 + us, v0, u0 + us, v0 + vs, u0, v0 + vs); for (let q = 0; q < 4; q++) g.n.push(...n); if (flip) g.i.push(i, i + 2, i + 1, i, i + 3, i + 2); else g.i.push(i, i + 1, i + 2, i, i + 2, i + 3);
  }
  /* a frame standing on a house front: o its start, t along it, n out towards the street; P(u, y, w) is u metres along, y up, w out */
  const frame = (ox, oz, tx, tz, nx, nz, y0) => ({ o: [ox, oz], t: [tx, tz], n: [nx, nz], y0, P: (u, y, w = 0) => [ox + tx * u + nx * w, y0 + y, oz + tz * u + nz * w] });
  const TS = 2.6;      /* metres of wall to one repeat of a texture */
  function face(k, F, u0, u1, y0, y1, w = 0, out = 1) { if (u1 - u0 < 0.01 || y1 - y0 < 0.01) return; quad(k, F.P(u0, y0, w), F.P(u1, y0, w), F.P(u1, y1, w), F.P(u0, y1, w), [F.n[0] * out, 0, F.n[1] * out], (u1 - u0) / TS, (y1 - y0) / TS, u0 / TS, y0 / TS); }
  function side(k, F, u, y0, y1, w0, w1, dir) { quad(k, F.P(u, y0, w0), F.P(u, y0, w1), F.P(u, y1, w1), F.P(u, y1, w0), [F.t[0] * dir, 0, F.t[1] * dir], Math.abs(w1 - w0) / TS, (y1 - y0) / TS); }
  function flat(k, F, u0, u1, y, w0, w1, up = 1, us, vs) { quad(k, F.P(u0, y, w0), F.P(u1, y, w0), F.P(u1, y, w1), F.P(u0, y, w1), [0, up, 0], us ?? (u1 - u0) / TS, vs ?? Math.abs(w1 - w0) / TS); }
  function block(k, F, u0, u1, y0, y1, w0, w1, top = k) { face(k, F, u0, u1, y0, y1, w1, 1); face(k, F, u0, u1, y0, y1, w0, -1); side(k, F, u0, y0, y1, w0, w1, -1); side(k, F, u1, y0, y1, w0, w1, 1); flat(top, F, u0, u1, y1, w0, w1, 1); }
  function flush() { for (const k in bat) { const g = bat[k]; if (!g.p.length) continue; const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(g.p, 3)); geo.setAttribute('normal', new THREE.Float32BufferAttribute(g.n, 3)); geo.setAttribute('uv', new THREE.Float32BufferAttribute(g.u, 2)); geo.setIndex(g.i);
      const m = new THREE.Mesh(geo, M[k]); m.receiveShadow = true; m.castShadow = !['basalt', 'walk', 'dark', 'black', 'inner'].includes(k); scene.add(m); meshes[k] = m; delete bat[k]; } return meshes; }

  /* ---- the streets: each OpenStreetMap way inside the box, with a class width ---- */
  const inBox = p => p[0] > box[0] && p[0] < box[2] && p[1] > box[1] && p[1] < box[3];
  const streets = []; for (const s of map.streets) { const l = s.l.filter(inBox); if (l.length < 2) continue; const c = classOf(s.n); if (!c) continue; const cum = [0]; for (let i = 1; i < l.length; i++) cum.push(cum[i - 1] + Math.hypot(l[i][0] - l[i - 1][0], l[i][1] - l[i - 1][1])); streets.push({ n: s.n, l, cum, f: c.f, cw: c.cw, id: streets.length }); }
  /* where a mapped street stops a few metres short of the street it joins, carry it on to that street's middle, so that the two open into each other */
  for (const s of streets) for (const end of [0, 1]) { const p = end ? s.l[s.l.length - 1] : s.l[0]; let best = 4.6, q = null; for (const t of streets) { if (t === s) continue; for (let i = 1; i < t.l.length; i++) { const a = t.l[i - 1], b = t.l[i], dx = b[0] - a[0], dz = b[1] - a[1], k = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dz) / (dx * dx + dz * dz || 1))), c = [a[0] + dx * k, a[1] + dz * k], d = Math.hypot(c[0] - p[0], c[1] - p[1]); if (d < best) { best = d; q = c; } } }
    if (q && best > 0.2) { if (end) s.l.push(q); else s.l.unshift(q); s.cum = [0]; for (let i = 1; i < s.l.length; i++) s.cum.push(s.cum[i - 1] + Math.hypot(s.l[i][0] - s.l[i - 1][0], s.l[i][1] - s.l[i - 1][1])); } }
  const dSeg = (x, z, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1))); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); };
  const dStreet = (x, z, s) => { let d = 1e9; for (let i = 1; i < s.l.length; i++) { const a = s.l[i - 1], b = s.l[i]; if (Math.min(a[0], b[0]) - 12 > x || Math.max(a[0], b[0]) + 12 < x || Math.min(a[1], b[1]) - 12 > z || Math.max(a[1], b[1]) + 12 < z) continue; d = Math.min(d, dSeg(x, z, a, b)); } return d; };
  /* ---- a raster of the ground, a quarter of a metre to the cell: 0 house, 1 pavement, 2 carriageway, 3 stepping stone ---- */
  const CELL = 0.25, GW = Math.ceil((box[2] - box[0]) / CELL), GH = Math.ceil((box[3] - box[1]) / CELL), grid = new Uint8Array(GW * GH);
  for (const s of streets) for (let i = 1; i < s.l.length; i++) { const a = s.l[i - 1], b = s.l[i], x0 = Math.max(0, Math.floor((Math.min(a[0], b[0]) - s.f - box[0]) / CELL)), x1 = Math.min(GW - 1, Math.ceil((Math.max(a[0], b[0]) + s.f - box[0]) / CELL)), z0 = Math.max(0, Math.floor((Math.min(a[1], b[1]) - s.f - box[1]) / CELL)), z1 = Math.min(GH - 1, Math.ceil((Math.max(a[1], b[1]) + s.f - box[1]) / CELL));
    for (let gz = z0; gz <= z1; gz++) for (let gx = x0; gx <= x1; gx++) { const d = dSeg(box[0] + (gx + 0.5) * CELL, box[1] + (gz + 0.5) * CELL, a, b), k = gz * GW + gx; if (d < s.cw) grid[k] = 2; else if (d < s.f && grid[k] < 1) grid[k] = 1; } }
  const kind = (x, z) => { const gx = Math.floor((x - box[0]) / CELL), gz = Math.floor((z - box[1]) / CELL); return gx < 0 || gz < 0 || gx >= GW || gz >= GH ? 0 : grid[gz * GW + gx]; };
  const stamp = (x, z, r, v) => { for (let gz = Math.floor((z - r - box[1]) / CELL); gz <= (z + r - box[1]) / CELL; gz++) for (let gx = Math.floor((x - r - box[0]) / CELL); gx <= (x + r - box[0]) / CELL; gx++) if (gx >= 0 && gz >= 0 && gx < GW && gz < GH) grid[gz * GW + gx] = v; };
  const wall = (x, z) => !inBox([x, z]) || !streets.some(s => dStreet(x, z, s) < s.f - 0.04);
  const hAt = (x, z) => { const k = kind(x, z); return h0(x, z) + (k === 1 || k === 3 || k === 0 ? KERB : 0); };

  /* ---- paving: the carriageway of lava blocks, and the raised pavements with their kerbs, built in one-metre slices so that crossings come out open ---- */
  const others = (x, z, s, key) => { for (const t of streets) if (t !== s && dStreet(x, z, t) < t[key] - 0.02) return true; return false; };
  for (const s of streets) { const L = s.cum[s.cum.length - 1], yb = 0.004 * (s.id % 5);
    const at = d => { let i = 1; while (i < s.cum.length - 1 && s.cum[i] < d) i++; const a = s.l[i - 1], b = s.l[i], sl = s.cum[i] - s.cum[i - 1] || 1, f = (d - s.cum[i - 1]) / sl; return { x: a[0] + (b[0] - a[0]) * f, z: a[1] + (b[1] - a[1]) * f, dx: (b[0] - a[0]) / sl, dz: (b[1] - a[1]) / sl }; }; s.at = at; s.L = L;
    for (let d = 0; d < L; d += 2) { const p = at(d), q = at(Math.min(L, d + 2)), A = (r, w) => [r.x - r.dz * w, h0(r.x - r.dz * w, r.z + r.dx * w) + yb, r.z + r.dx * w]; quad('basalt', A(p, -s.cw), A(p, s.cw), A(q, s.cw), A(q, -s.cw), [0, 1, 0], 1, 2 / (s.cw * 2), 0, d / (s.cw * 2)); }
    for (const sg of [-1, 1]) for (let d = 0; d < L; d += 1) { const p = at(d + 0.5), mx = p.x - p.dz * sg * (s.cw + s.f) / 2, mz = p.z + p.dx * sg * (s.cw + s.f) / 2; if (others(mx, mz, s, 'cw') || kind(mx, mz) !== 1) continue; const a = at(d), b = at(Math.min(L, d + 1)), y = r => h0(r.x, r.z) + KERB + yb * 0.5;
        const A = (r, w, yy) => [r.x - r.dz * sg * w, yy, r.z + r.dx * sg * w]; quad('walk', A(a, s.cw, y(a)), A(b, s.cw, y(b)), A(b, s.f + 0.05, y(b)), A(a, s.f + 0.05, y(a)), [0, 1, 0], 1 / 2.2, (s.f - s.cw) / 2.2, d / 2.2, 0); quad('kerb', A(a, s.cw, y(a) - KERB - 0.05), A(b, s.cw, y(b) - KERB - 0.05), A(b, s.cw, y(b)), A(a, s.cw, y(a)), [p.dz * sg, 0, -p.dx * sg], 1, 1);
        for (const [r, e] of [[a, -0.5], [b, 0.5]]) { const t = at(Math.max(0, Math.min(L, d + 0.5 + e * 2.2))), ex = t.x - t.dz * sg * (s.cw + s.f) / 2, ez = t.z + t.dx * sg * (s.cw + s.f) / 2; if (others(ex, ez, s, 'cw')) quad('kerb', A(r, s.cw, y(r) - KERB - 0.05), A(r, s.f + 0.05, y(r) - KERB - 0.05), A(r, s.f + 0.05, y(r)), A(r, s.cw, y(r)), [p.dx * e, 0, p.dz * e], 1, 1); } } }

  /* ---- house fronts: along each side of each street, wherever no other street opens ---- */
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, pick = a => a[Math.floor(rnd() * a.length)];
  const bays = [], notices = [];
  function bay(F, w, o = {}) {
    const two = o.two ?? rnd() < 0.62, H = o.H || (two ? 6.4 + rnd() * 1.4 : 4.0 + rnd() * 0.7), kindB = o.kind || (rnd() < 0.52 ? 'shop' : rnd() < 0.5 ? 'door' : 'wall'), dado = o.dado || (rnd() < 0.72 ? 'red' : rnd() < 0.5 ? 'ochre' : 'rubble'), up = o.up || (rnd() < 0.86 ? 'white' : 'rubble'), dH = dado === 'rubble' ? 0 : 1.25 + (rnd() < 0.3 ? 0.5 : 0);
    const wall = (u0, u1, y0, y1) => { if (y0 < dH) face(dado, F, u0, u1, y0, Math.min(dH, y1)); if (y1 > dH) face(up, F, u0, u1, Math.max(dH, y0), y1); };
    let a = 0, b = 0, oh = 0, maxB = 10.5; if (F.s) for (const u of [0, w]) for (let d = 1.5; d < maxB; d += 0.5) { const q = F.P(u, 0, -d); if (others(q[0], q[2], F.s, 'f')) { maxB = d - 0.5; break; } }
    const D = Math.min(3.4, maxB), d1 = Math.min(5.5, maxB), d2 = Math.min(10.5, maxB);
    if (kindB === 'shop' && w > 3.2) { const ow = Math.min(w - 0.9, o.ow || 2.5 + rnd() * 1.1); a = (w - ow) / 2; b = a + ow; oh = 2.9; }
    else if (kindB === 'door' && w > 2.2) { const ow = o.ow || 1.35 + rnd() * 0.35; a = o.at != null ? o.at : 0.5 + rnd() * (w - ow - 1.0); b = a + ow; oh = o.oh || 2.6 + rnd() * 0.5; }
    if (oh) { wall(0, a, 0, H); wall(b, w, 0, H); wall(a, b, oh, H); side('white', F, a, 0, oh, 0, -0.45, 1); side('white', F, b, 0, oh, 0, -0.45, -1); flat('sill', F, a, b, oh, 0, -0.45, -1); flat('sill', F, a, b, 0.012, 0.06, -0.5, 1);
      if (kindB === 'shop' || o.open) { face('inner', F, a - 0.6, b + 0.6, 0, oh + 0.3, -D); side('inner', F, a - 0.6, 0, oh + 0.3, -0.45, -D, 1); side('inner', F, b + 0.6, 0, oh + 0.3, -0.45, -D, -1); flat('dark', F, a - 0.6, b + 0.6, oh + 0.02, -0.45, -D, -1); flat('walk', F, a - 0.6, b + 0.6, 0.01, -0.45, -D, 1); }
      else { const dm = pick(['wood', 'wood', 'red']); face(dm, F, a, b, 0, oh, -0.3); for (const x of [0.25, 0.5, 0.75]) face('black', F, a + (b - a) * x - 0.015, a + (b - a) * x + 0.015, 0, oh, -0.295); for (const [x, y] of [[0.36, 1.2], [0.64, 1.2]]) face('counter', F, a + (b - a) * x - 0.05, a + (b - a) * x + 0.05, y, y + 0.1, -0.28); }
      if (kindB === 'shop' && o.counter !== false && rnd() < 0.7) { const cl = (b - a) * (0.5 + rnd() * 0.2), left = rnd() < 0.5, c0 = left ? a + 0.05 : b - 0.05 - cl; block('counter', F, c0, c0 + cl, 0, 0.92, -0.75, -0.12, 'sill'); block('counter', F, left ? c0 : c0 + cl - 0.6, left ? c0 + 0.6 : c0 + cl, 0, 0.92, -Math.min(2.0, D), -0.75, 'sill'); for (let q = 0.4; q < cl - 0.3; q += 0.62) flat('black', F, c0 + q - 0.16, c0 + q + 0.16, 0.925, -0.6, -0.28, 1); F.counters = (F.counters || []).concat([[c0, c0 + cl]]); } }
    else wall(0, w, 0, H);
    if (two) for (let u = 0.9 + rnd() * 0.5; u < w - 0.9; u += 1.8 + rnd() * 1.2) { const y = 4.1 + rnd() * 0.3; face('black', F, u, u + 0.55, y, y + 0.8, 0.012); face('sill', F, u - 0.08, u + 0.63, y - 0.08, y, 0.03); }
    /* a pent roof over the pavement on many fronts, and the roof itself: tiles sloping up and back from the front wall */
    const pent = o.pent ?? (F.pentOK && rnd() < 0.55); if (pent) { const y = Math.min(H - 0.5, 3.35), pw = Math.min(1.25, F.pentW || 1.25); quad('tile', F.P(0, y - 0.38, pw), F.P(w, y - 0.38, pw), F.P(w, y, 0), F.P(0, y, 0), [0, 1, 0], w / 2.6, 0.5); quad('dark', F.P(0, y - 0.42, pw), F.P(w, y - 0.42, pw), F.P(w, y - 0.04, 0), F.P(0, y - 0.04, 0), [0, -1, 0]); for (let u = 0.15; u < w; u += 1.3) face('wood', F, u, u + 0.09, y - 0.42, y - 0.33, pw); }
    quad('tile', F.P(0, H - 0.05, 0.35), F.P(w, H - 0.05, 0.35), F.P(w, H + 1.5, -d1), F.P(0, H + 1.5, -d1), [0, 1, 0], w / 2.6, 2.2); quad('white', F.P(0, H, 0), F.P(0, H + 1.5, -d1), F.P(0, 0, -d1), F.P(0, 0, 0), [-F.t[0], 0, -F.t[1]], 2, 2.4); quad('white', F.P(w, H, 0), F.P(w, H + 1.5, -d1), F.P(w, 0, -d1), F.P(w, 0, 0), [F.t[0], 0, F.t[1]], 2, 2.4);
    if (d2 > d1 + 0.2) { quad('tile', F.P(0, H + 1.5, -d1), F.P(w, H + 1.5, -d1), F.P(w, H + 0.2, -d2), F.P(0, H + 0.2, -d2), [0, 1, 0], w / 2.6, 2.2); face('white', F, 0, w, 0, H + 0.2, -d2, -1); quad('white', F.P(0, H + 1.5, -d1), F.P(0, H + 0.2, -d2), F.P(0, 0, -d2), F.P(0, 0, -d1), [-F.t[0], 0, -F.t[1]], 2, 2.4); quad('white', F.P(w, H + 1.5, -d1), F.P(w, H + 0.2, -d2), F.P(w, 0, -d2), F.P(w, 0, -d1), [F.t[0], 0, F.t[1]], 2, 2.4); } else face('white', F, 0, w, 0, H + 1.5, -d1, -1);
    const rec = { F, w, H, a, b, oh, kind: oh ? kindB : 'wall', dH, mid: F.P(w / 2, 0, 0), free: [] }; if (a > 1.5) rec.free.push([0.15, a - 0.15]); if (w - b > 1.5 && oh) rec.free.push([b + 0.15, w - 0.15]); if (!oh) rec.free.push([0.2, w - 0.2]); bays.push(rec); return rec;
  }
  for (const s of streets) for (const sg of [-1, 1]) { let run = null; const runs = [], step = 0.5;
    for (let d = 0; d <= s.L + 0.01; d += step) { const p = s.at(Math.min(d, s.L - 0.01)), x = p.x - p.dz * sg * s.f, z = p.z + p.dx * sg * s.f, free = !others(x, z, s, 'f') && inBox([x, z]) && !(noBay && noBay(x, z)), seg = s.cum.findIndex(c => c > d);
      if (free && run && run.seg === seg) run.b = d; else { if (run && run.b - run.a > 1.2) runs.push(run); run = free ? { a: d, b: d, seg } : null; } }
    if (run && run.b - run.a > 1.2) runs.push(run);
    for (const r of runs) { const pa = s.at(r.a + 0.01), A = [pa.x - pa.dz * sg * s.f, pa.z + pa.dx * sg * s.f], len = r.b - r.a, tx = pa.dx, tz = pa.dz, nx = pa.dz * sg, nz = -pa.dx * sg; let u = 0;
      while (u < len - 0.05) { let w = 3.6 + rnd() * 3.6; if (len - u - w < 2.6) w = len - u; const ox = A[0] + tx * u, oz = A[1] + tz * u, F = frame(ox, oz, tx, tz, nx, nz, h0(ox + tx * w / 2, oz + tz * w / 2) + KERB - 0.02); F.pentOK = s.f - s.cw > 1.5; F.pentW = s.f - s.cw - 0.3; F.street = s.n; F.s = s; F.sg = sg; F.d = r.a + u; bay(F, w); u += w; } } }

  /* ---- things the level places: stepping stones, a fountain, a shop counter of its own ---- */
  function steppingStones(x, z, dx, dz, cw, n = 3) { const y = h0(x, z), F = frame(x, z, -dz, dx, dx, dz, y); for (let i = 0; i < n; i++) { const u = (i - (n - 1) / 2) * (cw * 2 / n); block('lava', F, u - 0.36, u + 0.36, -0.05, KERB + 0.02, -0.5, 0.5, 'stone'); stamp(x - dz * u, z + dx * u, 0.42, 3); } }
  const solids = [];      /* round things she cannot walk through: { x, z, r } */
  function fountain(x, z, ang) { const y = hAt(x, z), g = new THREE.Group(), slab = (w, h, d, px, py, pz) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), M.lava); m.position.set(px, py, pz); m.castShadow = m.receiveShadow = true; g.add(m); return m; };
    slab(1.7, 0.85, 0.16, 0, 0.42, 0.62); slab(1.7, 0.85, 0.16, 0, 0.42, -0.62); slab(0.16, 0.85, 1.4, 0.77, 0.42, 0); slab(0.16, 0.85, 1.4, -0.77, 0.42, 0); slab(0.5, 1.35, 0.3, 0, 0.67, -0.78);
    const water = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.04, 1.1), new THREE.MeshLambertMaterial({ color: '#4f8aa0', emissive: '#16303a' })); water.position.y = 0.68; g.add(water); const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.035, 0.5, 6), new THREE.MeshBasicMaterial({ color: '#bfe2ee' })); jet.position.set(0, 0.95, -0.5); jet.rotation.x = -0.5; g.add(jet);
    const headM = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), M.stone); headM.position.set(0, 1.15, -0.64); headM.scale.z = 0.6; g.add(headM); g.position.set(x, y, z); g.rotation.y = ang; scene.add(g); solids.push({ x, z, r: 1.05 }); return { g, water, jet }; }
  return { M, quad, frame, face, side, flat, block, bay, flush, streets, kind, wall, stamp, hAt, h0, KERB, bays, steppingStones, fountain, solids, dStreet, rnd: () => rnd() };
}
