/* The named fronts of the walk, built as architecture on their OpenStreetMap footprints. What each one rests on is set out in
   research/FINDINGS.md; in short:
     San Luigi dei Francesi   the front as it stands (Commons photograph) and as Falda engraved it in 1667-69, without the four statues (L'Estache, b. about 1688)
     Sant'Agostino            the front as it stands (Commons photograph), on a plain straight flight of steps (the present stair is after 1659)
     Palazzo Madama           conjecture after Tempesta (1593) and Maggi (1625): a plain, unequal front with one stone doorway and a shield over it
     Palazzo Giustiniani      Falda's elevation (in or after 1655) without Borromini's doorway and balcony
     San Salvatore in Thermis position from Nolli (1748); a doorway, a lunette and two barred windows, as an undated description has them
   A front is set out in its own measure: u metres along the wall from its left end as you face it, y up, w out from the wall. */
export function makeFronts({ THREE, scene }) {
  const batches = new Map(), heights = [], solids = [], lights = {};
  const bat = m => { let b = batches.get(m); if (!b) batches.set(m, b = { pos: [], nor: [], uv: [] }); return b; };

  // ---------- materials: travertine and Roman plaster, painted on a canvas so that nothing is borrowed from another city
  const canvasTex = (w, h, paint, rep) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const travertine = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#d9d1bd'; g.fillRect(0, 0, w, h);
    for (let j = 0; j < 8; j++) { const y = j * 64, off = (j % 2) * 70; g.fillStyle = `rgba(${150 + rnd() * 60 | 0},${140 + rnd() * 55 | 0},${118 + rnd() * 50 | 0},0.20)`; g.fillRect(0, y, w, 64);      // courses of ashlar
      g.fillStyle = 'rgba(70,60,48,0.26)'; g.fillRect(0, y, w, 2); for (let x = off; x < w; x += 150 + rnd() * 40) g.fillRect(x, y, 1.5, 64); }
    for (let i = 0; i < 900; i++) { g.fillStyle = `rgba(80,68,52,${0.10 + rnd() * 0.25})`; g.fillRect(rnd() * w, rnd() * h, 3 + rnd() * 16, 1 + rnd() * 2); }      // the pitted bedding of the stone
    for (let i = 0; i < 26; i++) { g.fillStyle = `rgba(60,52,44,${0.03 + rnd() * 0.04})`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 30 + rnd() * 60, 14 + rnd() * 30, 0, 0, 7); g.fill(); } }, true);      // weather stains
  const plasterTex = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); for (let i = 0; i < 500; i++) { const v = 150 + rnd() * 90 | 0; g.fillStyle = `rgba(${v},${v},${v},0.16)`; g.beginPath(); g.ellipse(rnd() * w, rnd() * h, 6 + rnd() * 30, 4 + rnd() * 18, rnd() * 3, 0, 7); g.fill(); }
    for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(90,80,70,0.07)'; g.fillRect(rnd() * w, 0, 3 + rnd() * 14, h); } }, true);
  const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o);
  const M = { trav: lam({ map: travertine, color: '#f6f0e4' }), field: lam({ map: travertine, color: '#c9c0ae' }), travDark: lam({ map: travertine, color: '#8f887a' }), ochre: lam({ map: plasterTex, color: '#c79a58' }), rose: lam({ map: plasterTex, color: '#bd7f66' }), pale: lam({ map: plasterTex, color: '#cfc2a4' }),
    brick: lam({ map: plasterTex, color: '#8f6a50' }), wood: lam({ color: '#33261a' }), woodLight: lam({ color: '#7a5a34' }), dark: basic({ color: '#040405' }), glass: basic({ color: '#0a0d14' }), iron: lam({ color: '#1c1a18' }), glow: basic({ color: '#7a4616' }), straw: lam({ color: '#c9a850' }) };

  // ---------- a front, and solids drawn out from it
  function front(ax, az, cx, cz, g = 0) { const W = Math.hypot(cx - ax, cz - az), dx = (cx - ax) / W, dz = (cz - az) / W, nx = -dz, nz = dx;
    return { ax, az, dx, dz, nx, nz, W, g, P: (u, w) => [ax + dx * u + nx * w, az + dz * u + nz * w], local: (x, z) => [(x - ax) * dx + (z - az) * dz, (x - ax) * nx + (z - az) * nz] }; }
  const T = 3.2;                                   // metres to one repeat of a painted surface
  // any flat outline (u, y), drawn out from w0 to w1: its face, and a strip round its edge
  function ext(mat, F, pts, w0, w1, o = {}) { const b = bat(mat); let A = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; A += p[0] * q[1] - q[0] * p[1]; } if (A < 0) pts = pts.slice().reverse();
    const y0 = F.g, V = (u, y, w) => [F.ax + F.dx * u + F.nx * w, y + y0, F.az + F.dz * u + F.nz * w];
    const tris = o.concave ? THREE.ShapeUtils.triangulateShape(pts.map(p => new THREE.Vector2(p[0], p[1])), []) : pts.slice(2).map((_, i) => [0, i + 1, i + 2]);
    for (const t of tris) for (const k of t) { b.pos.push(...V(pts[k][0], pts[k][1], w1)); b.nor.push(F.nx, 0, F.nz); b.uv.push(pts[k][0] / T, pts[k][1] / T); }
    if (o.face) return;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], eu = q[0] - p[0], ey = q[1] - p[1], L = Math.hypot(eu, ey); if (L < 1e-4) continue; const mu = ey / L, my = -eu / L, n = [F.dx * mu, my, F.dz * mu];
      const a = V(p[0], p[1], w1), c = V(p[0], p[1], w0), d = V(q[0], q[1], w0), e = V(q[0], q[1], w1), s0 = (p[0] + p[1]) / T, s1 = s0 + L / T;
      b.pos.push(...a, ...c, ...d, ...a, ...d, ...e); for (let k = 0; k < 6; k++) b.nor.push(...n); b.uv.push(s0, w1 / T, s0, w0 / T, s1, w0 / T, s0, w1 / T, s1, w0 / T, s1, w1 / T); } }
  const box = (mat, F, u0, u1, y0, y1, w0, w1) => ext(mat, F, [[u0, y0], [u1, y0], [u1, y1], [u0, y1]], w0, w1);
  const arc = (u, y, r, a0, a1, n = 18, ky = 1) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / n; return [u + r * Math.cos(a), y + r * ky * Math.sin(a)]; });
  const disc = (mat, F, u, y, r, w0, w1, ky = 1) => ext(mat, F, arc(u, y, r, 0, Math.PI * 2 * 23 / 24, 23, ky), w0, w1);
  const half = (mat, F, u, y, r, w0, w1) => ext(mat, F, arc(u, y, r, 0, Math.PI, 14), w0, w1);                                      // a lunette, flat side down
  const ringArc = (mat, F, u, y, r0, r1, a0, a1, w0, w1, n = 16) => { const I = arc(u, y, r0, a0, a1, n), O = arc(u, y, r1, a0, a1, n); for (let i = 0; i < n; i++) ext(mat, F, [I[i], O[i], O[i + 1], I[i + 1]], w0, w1); };
  const arched = (u, hw, y0, ys) => [[u - hw, y0], [u + hw, y0], ...arc(u, ys, hw, 0, Math.PI, 12)];                                   // a round-headed opening, springing at ys
  const segm = (mat, F, u, hw, y0, rise, w0, w1) => { const R = (hw * hw + rise * rise) / (2 * rise), a = Math.asin(hw / R); ext(mat, F, arc(u, y0 + rise - R, R, Math.PI / 2 - a, Math.PI / 2 + a, 10), w0, w1); };      // a segmental pediment
  const gable = (mat, F, u0, u1, y0, rise, w0, w1) => ext(mat, F, [[u0, y0], [u1, y0], [(u0 + u1) / 2, y0 + rise]], w0, w1);
  // a pediment: the wall of the tympanum, and the two raking cornices standing out from it
  function pediment(mat, F, u0, u1, y0, rise, w0, wT, wC, t = 0.5, tym) { const m = (u0 + u1) / 2; ext(tym || mat, F, [[u0, y0], [u1, y0], [m, y0 + rise]], w0, wT);
    ext(mat, F, [[u0 - 0.35, y0], [u0 + t * 2, y0], [m, y0 + rise - t], [m, y0 + rise + 0.3]], w0, wC); ext(mat, F, [[u1 - t * 2, y0], [u1 + 0.35, y0], [m, y0 + rise + 0.3], [m, y0 + rise - t]], w0, wC); }
  const frame = (mat, F, u0, u1, y0, y1, t, w0, w1) => { box(mat, F, u0 - t, u0, y0, y1 + t, w0, w1); box(mat, F, u1, u1 + t, y0, y1 + t, w0, w1); box(mat, F, u0, u1, y1, y1 + t, w0, w1); };      // jambs and lintel round an opening
  const panel = (mat, F, u0, u1, y0, y1, t, w0, w1) => { frame(mat, F, u0, u1, y0, y1 - t, t, w0, w1); box(mat, F, u0 - t, u1 + t, y0 - t, y0, w0, w1); };                                             // a sunk panel: only its raised border
  function pilaster(mat, F, u0, u1, y0, y1, w0, p = 0.28) { box(mat, F, u0 - 0.08, u1 + 0.08, y0, y0 + 0.55, w0, w0 + p + 0.1); box(mat, F, u0, u1, y0 + 0.55, y1 - 0.7, w0, w0 + p); box(mat, F, u0 - 0.1, u1 + 0.1, y1 - 0.7, y1, w0, w0 + p + 0.14); }
  function column(mat, F, u, w, y0, y1, r, n = 12) { const b = bat(mat), [cx, cz] = F.P(u, w); for (let i = 0; i < n; i++) { const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2, c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      const A = [cx + r * c0, y0 + F.g, cz + r * s0], B = [cx + r * c1, y0 + F.g, cz + r * s1], C = [cx + r * 0.86 * c1, y1 + F.g, cz + r * 0.86 * s1], D = [cx + r * 0.86 * c0, y1 + F.g, cz + r * 0.86 * s0];
      b.pos.push(...A, ...C, ...B, ...A, ...D, ...C); b.nor.push(c0, 0, s0, c1, 0, s1, c1, 0, s1, c0, 0, s0, c0, 0, s0, c1, 0, s1); b.uv.push(i / n, y0 / T, (i + 1) / n, y1 / T, (i + 1) / n, y0 / T, i / n, y0 / T, i / n, y1 / T, (i + 1) / n, y1 / T); }
    solids.push({ x: cx, z: cz, r: r + 0.25 }); }
  // a flight of steps before a front, n risers up to a landing at height H: built solid, and remembered so that feet can find it
  function stair(mat, F, u0, u1, H, n, tread, landing) { const g = F.g; F.g = 0; box(mat, F, u0, u1, 0, H, 0, landing); for (let i = 1; i < n; i++) box(mat, F, u0, u1, 0, H - i * H / n, landing + (i - 1) * tread, landing + i * tread); F.g = g; heights.push({ F, u0, u1, H, run: (n - 1) * tread, landing }); }
  const hAt = (x, z) => { let h = 0; for (const s of heights) { const [u, w] = s.F.local(x, z); if (u < s.u0 || u > s.u1 || w < -1 || w > s.landing + s.run) continue; h = Math.max(h, w <= s.landing ? s.H : s.H * (1 - (w - s.landing) / s.run)); } return h; };
  const cross = (F, u, y, w) => { box(M.iron, F, u - 0.07, u + 0.07, y, y + 1.7, w, w + 0.14); box(M.iron, F, u - 0.5, u + 0.5, y + 1.05, y + 1.19, w, w + 0.14); };
  const lettered = (text, w, h, ink = '#3a3228') => new THREE.MeshLambertMaterial({ map: canvasTex(2048, 64, (g, W, H) => { g.fillStyle = '#d6cdb8'; g.fillRect(0, 0, W, H); g.fillStyle = ink; g.font = '600 40px Georgia, serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 2, W - 30); }) });
  function strip(mat, F, u0, u1, y0, y1, w) { const b = bat(mat), V = (u, y) => [F.ax + F.dx * u + F.nx * w, y + F.g, F.az + F.dz * u + F.nz * w]; b.pos.push(...V(u0, y0), ...V(u1, y0), ...V(u1, y1), ...V(u0, y0), ...V(u1, y1), ...V(u0, y1)); for (let k = 0; k < 6; k++) b.nor.push(F.nx, 0, F.nz); b.uv.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1); }

  /* ---------- San Luigi dei Francesi: travertine, two storeys of one width, five bays, a pediment over the middle three ---------- */
  function sanLuigi() {
    const F = front(143.9, 20.3, 142.1, -14.1, 0.45), W = F.W, m = W / 2, S = M.trav, w = 0.3;      // the front stands on three low steps
    const Y1 = 12.1, E1 = 14.1, A2 = 15.5, Y2 = 26.1, E2 = 27.5, APEX = 32.2;
    stair(S, F, 0.3, W - 0.3, 0.45, 4, 0.42, 1.7);
    { const g = F.g; F.g = 0; box(M.field, F, 0, W, 0, E2 + g, 0, w); F.g = g; }
    const PIL = [[0.2, 1.25], [5.2, 6.25], [11.35, 12.15], [12.35, 13.15]]; const all = [...PIL, ...PIL.map(([a, b]) => [W - b, W - a])];
    for (const [a, b] of all) { pilaster(S, F, a, b, 0, Y1, w); pilaster(S, F, a, b, A2, Y2, w); }
    box(S, F, 0, W, Y1, E1 - 0.55, w, w + 0.36); box(S, F, -0.3, W + 0.3, E1 - 0.55, E1, w, w + 0.95);              // the lower entablature and its cornice
    box(S, F, 0, W, E1, A2, w, w + 0.2);                                                                              // the pedestal course of the upper order
    box(S, F, 0, W, Y2, E2 - 0.55, w, w + 0.36); box(S, F, -0.3, W + 0.3, E2 - 0.55, E2, w, w + 1.0);
    pediment(S, F, 5.0, W - 5.0, E2, APEX - E2, 0, w, w + 1.0, 0.6, M.field);
    disc(S, F, m, E2 + 1.9, 1.15, w, w + 0.3, 1.25); box(S, F, m - 0.55, m + 0.55, E2 + 3.3, E2 + 3.75, w, w + 0.3);    // the shield of arms in the tympanum, left plain
    box(S, F, m - 0.4, m + 0.4, APEX, APEX + 1.0, 0.1, 0.7); cross(F, m, APEX + 1.0, 0.33);
    // the great door: two columns, an entablature and a pediment
    box(M.wood, F, m - 1.45, m + 1.45, 0, 5.6, w, w + 0.05); frame(S, F, m - 1.45, m + 1.45, 0, 5.6, 0.42, w, w + 0.3);
    for (const e of [-1, 1]) { box(S, F, m + e * 2.4 - 0.5, m + e * 2.4 + 0.5, 0, 1.0, w, w + 1.35); column(S, F, m + e * 2.4, w + 0.85, 1.0, 6.2, 0.37); box(S, F, m + e * 2.4 - 0.48, m + e * 2.4 + 0.48, 6.2, 6.55, w, w + 1.3); }
    box(S, F, m - 3.0, m + 3.0, 6.55, 7.35, w, w + 1.3); pediment(S, F, m - 3.0, m + 3.0, 7.35, 1.6, w, w + 0.9, w + 1.45, 0.4);
    for (const e of [-1, 1]) {
      const c2 = m + e * 8.37, c1 = m + e * 14.0;
      // second and fourth bays: a lesser door under a segmental pediment, and a lunette above it
      box(M.wood, F, c2 - 1.0, c2 + 1.0, 0, 3.9, w, w + 0.05); frame(S, F, c2 - 1.0, c2 + 1.0, 0, 3.9, 0.34, w, w + 0.26); box(S, F, c2 - 1.6, c2 + 1.6, 4.5, 4.75, w, w + 0.5); segm(S, F, c2, 1.6, 4.75, 0.75, w, w + 0.5);
      box(S, F, c2 - 2.3, c2 + 2.3, 8.55, 8.85, w, w + 0.4); half(M.glass, F, c2, 8.85, 1.95, w, w + 0.04); ringArc(S, F, c2, 8.85, 1.95, 2.3, 0, Math.PI, w, w + 0.24, 14);
      // first and fifth: an empty niche (the statues are of the eighteenth century), a roundel under it and a panel over it
      ext(M.travDark, F, arched(c1, 0.8, 3.3, 6.2), w, w + 0.03); ringArc(S, F, c1, 6.2, 0.8, 1.05, 0, Math.PI, w, w + 0.2, 10); box(S, F, c1 - 1.05, c1 - 0.8, 3.3, 6.2, w, w + 0.2); box(S, F, c1 + 0.8, c1 + 1.05, 3.3, 6.2, w, w + 0.2); box(S, F, c1 - 1.25, c1 + 1.25, 3.0, 3.3, w, w + 0.45);
      disc(S, F, c1, 1.75, 0.85, w, w + 0.12); ringArc(S, F, c1, 1.75, 0.85, 1.0, 0, Math.PI * 2, w, w + 0.2, 20);
      panel(S, F, c1 - 0.8, c1 + 0.8, 9.0, 10.6, 0.16, w, w + 0.14);
      // upper storey: niches in the second and fourth bays, windows in the first and fifth
      ext(M.travDark, F, arched(c2, 0.7, 17.4, 19.9), w, w + 0.03); frame(S, F, c2 - 0.7, c2 + 0.7, 17.4, 20.6, 0.3, w, w + 0.26); box(S, F, c2 - 1.3, c2 + 1.3, 17.0, 17.4, w, w + 0.5); gable(S, F, c2 - 1.3, c2 + 1.3, 20.9, 0.8, w, w + 0.5);
      ringArc(S, F, c2, 20.3, 2.1, 2.4, 0, Math.PI, w, w + 0.2, 14); box(S, F, c2 - 2.4, c2 - 2.1, 16.4, 20.3, w, w + 0.2); box(S, F, c2 + 2.1, c2 + 2.4, 16.4, 20.3, w, w + 0.2);
      box(M.glass, F, c1 - 0.75, c1 + 0.75, 17.6, 20.3, w, w + 0.04); frame(S, F, c1 - 0.75, c1 + 0.75, 17.6, 20.3, 0.28, w, w + 0.24); box(S, F, c1 - 1.1, c1 + 1.1, 17.25, 17.6, w, w + 0.4);
      panel(S, F, c1 - 0.8, c1 + 0.8, 22.6, 23.7, 0.16, w, w + 0.14);
    }
    // the middle window and its balcony
    box(M.glass, F, m - 1.15, m + 1.15, 17.0, 21.4, w, w + 0.04); frame(S, F, m - 1.15, m + 1.15, 17.0, 21.4, 0.3, w, w + 0.26);
    for (const e of [-1, 1]) column(S, F, m + e * 1.85, w + 0.45, 17.0, 21.5, 0.22, 8);
    box(S, F, m - 2.3, m + 2.3, 21.5, 22.0, w, w + 0.8); segm(S, F, m, 2.3, 22.0, 0.9, w, w + 0.8);
    box(S, F, m - 2.5, m + 2.5, 15.9, 16.15, w, w + 1.0); for (let k = -5; k <= 5; k++) box(S, F, m + k * 0.45 - 0.09, m + k * 0.45 + 0.09, 16.15, 16.85, w + 0.78, w + 0.96); box(S, F, m - 2.5, m + 2.5, 16.85, 17.0, w + 0.74, w + 1.0);
    lights.luigi = [F.P(m - 8.5, 9.6), F.P(m + 3.5, 10.4)].map(([x, z]) => ({ x, z, y: 1.5 })); lights.luigi.c = F.P(m, 0);
    return F;
  }

  /* ---------- Sant'Agostino: travertine of 1483. A wide lower storey of three doors, a narrow upper one under a pediment, scrolls between ---------- */
  function santAgostino(H) {
    const F = front(81.0, -133.1, 110.2, -130.4, H), W = F.W, m = W / 2, S = M.trav, w = 0.3, L = 7.25, R = W - 7.25;
    stair(S, F, 0, W, H, 13, 0.4, 3.2);
    { const g = F.g; F.g = 0; box(M.field, F, 0, W, 0, 16.0 + g, 0, w); box(M.field, F, L, R, 16.0 + g, 27.3 + g, 0, w); F.g = g; }
    box(S, F, 0, W, 0, 0.9, w, w + 0.12);
    for (const [a, b] of [[1.15, 3.2], [5.4, L - 0.1], [8.2, m - 2.2], [m + 2.2, R - 0.95], [R + 0.1, W - 5.4], [W - 3.2, W - 1.15]]) box(S, F, a, b, 2.8, 3.05, w, w + 0.14);      // the string course at the height of the door heads
    for (const [a, b] of [[0, 1.05], [L - 0.05, L + 0.8], [R - 0.8, R + 0.05], [W - 1.05, W]]) pilaster(S, F, a, b, 0, 14.3, w, 0.2);
    box(S, F, 0, W, 14.3, 14.7, w, w + 0.22); box(S, F, 0, W, 14.7, 15.5, w, w + 0.16);
    strip(lettered('GVILLERMVS · DE · ESTOVTEVILLA · EPISC · OSTIEN · CARD · ROTHOMAGEN · S · R · E · CAMERARIVS · FECIT'), F, 0.6, W - 0.6, 14.74, 15.46, w + 0.17);
    strip(lettered('M · CCCC · LXXXIII'), F, m - 2.4, m + 2.4, 13.55, 14.15, w + 0.02);
    box(S, F, -0.25, W + 0.25, 15.5, 16.0, w, w + 0.65);
    // the half-gables over the aisles and the level cornice between them
    for (const e of [0, 1]) { const u0 = e ? W : 0, u1 = e ? R : L; ext(M.field, F, [[u0, 16.0], [u1, 16.0], [u1, 17.9]], 0, w); ext(S, F, [[u0 + (e ? 0.3 : -0.3), 16.0], [u1, 17.5], [u1, 18.0], [u0 + (e ? 0.3 : -0.3), 16.45]], w, w + 0.6); }
    box(S, F, L, R, 17.5, 18.0, w, w + 0.6);
    // the upper storey
    pilaster(S, F, L, L + 0.85, 18.0, 25.5, w, 0.2); pilaster(S, F, R - 0.85, R, 18.0, 25.5, w, 0.2);
    box(S, F, L, R, 25.5, 26.9, w, w + 0.2); box(S, F, L - 0.5, R + 0.5, 26.9, 27.3, w, w + 0.75); pediment(S, F, L - 0.5, R + 0.5, 27.3, 3.6, 0, w, w + 0.8, 0.55, M.field);
    disc(M.dark, F, m, 28.5, 0.32, w, w + 0.02); cross(F, m, 30.9, 0.2);
    disc(M.glass, F, m, 20.4, 2.0, w, w + 0.04); ringArc(S, F, m, 20.4, 2.0, 2.85, 0, Math.PI * 2, w, w + 0.28, 28); ringArc(M.iron, F, m, 20.4, 0.95, 1.05, 0, Math.PI * 2, w + 0.04, w + 0.08, 16);
    for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; ext(M.iron, F, [[m + 1.05 * Math.cos(a - 0.04), 20.4 + 1.05 * Math.sin(a - 0.04)], [m + 2.0 * Math.cos(a - 0.02), 20.4 + 2.0 * Math.sin(a - 0.02)], [m + 2.0 * Math.cos(a + 0.02), 20.4 + 2.0 * Math.sin(a + 0.02)], [m + 1.05 * Math.cos(a + 0.04), 20.4 + 1.05 * Math.sin(a + 0.04)]], w + 0.04, w + 0.08, { face: 1 }); }
    panel(S, F, m - 3.45, m + 3.45, 17.95 + 0.4, 24.3, 0.14, w, w + 0.1);
    // the scrolls at the shoulders. Three texts say Vanvitelli added them in 1746-50; Maggi's view of about 1625 draws a scroll here. Kept, and marked as disputed
    for (const e of [0, 1]) { const X = u => (e ? W - u : u), q = t => { const a = [0.45, 16.95], c = [6.1, 17.7], b = [L, 24.6], s = 1 - t; return [X(s * s * a[0] + 2 * s * t * c[0] + t * t * b[0]), s * s * a[1] + 2 * s * t * c[1] + t * t * b[1]]; };
      const curve = Array.from({ length: 15 }, (_, i) => q(i / 14)); ext(M.field, F, [[X(0.45), 16.1], [X(L), 17.9], ...curve.slice().reverse()], 0, w, { concave: 1 });
      for (let i = 0; i < 14; i++) { const p = curve[i], n = curve[i + 1]; ext(S, F, [p, n, [n[0], n[1] - 0.5], [p[0], p[1] - 0.5]], w, w + 0.28); }
      disc(S, F, X(1.25), 17.25, 0.95, w, w + 0.4); disc(S, F, X(6.65), 23.75, 0.62, w, w + 0.4); disc(M.travDark, F, X(1.25), 17.25, 0.4, w + 0.4, w + 0.46); disc(M.travDark, F, X(6.65), 23.75, 0.26, w + 0.4, w + 0.46); }
    // the middle door: a marble frame, a lettered frieze, a pediment. Its left leaf stands open for the last picture
    box(M.dark, F, m - 1.57, m, 0, 5.9, w, w + 0.02); box(M.wood, F, m, m + 1.57, 0, 5.9, w, w + 0.06); box(M.wood, F, m - 1.62, m - 1.5, 0, 5.9, w - 0.02, w + 0.1);
    frame(S, F, m - 1.57, m + 1.57, 0, 5.9, 0.42, w, w + 0.3); box(S, F, m - 2.2, m + 2.2, 6.32, 7.3, w, w + 0.34); box(S, F, m - 2.6, m + 2.6, 7.3, 7.6, w, w + 0.62); pediment(S, F, m - 2.6, m + 2.6, 7.6, 1.8, w, w + 0.3, w + 0.7, 0.36);
    box(S, F, m - 2.0, m + 2.0, 0, 0.2, w, w + 1.0);                                                                           // the door step
    panel(S, F, m - 6.1, m + 6.1, 9.9, 13.3, 0.14, w, w + 0.1);
    for (const e of [-1, 1]) { const c = m + e * 10.36;                                                                       // the side doors, the round windows over them and the sunk panels
      box(M.wood, F, c - 1.0, c + 1.0, 0, 3.6, w, w + 0.05); frame(S, F, c - 1.0, c + 1.0, 0, 3.6, 0.3, w, w + 0.24); box(S, F, c - 1.55, c + 1.55, 4.45, 4.75, w, w + 0.5);
      disc(M.glass, F, c, 10.0, 0.95, w, w + 0.04); ringArc(S, F, c, 10.0, 0.95, 1.3, 0, Math.PI * 2, w, w + 0.22, 20); panel(S, F, c - 1.45, c + 1.45, 8.55, 11.45, 0.12, w, w + 0.1);
      panel(S, F, c - 2.6, c + 2.6, 12.1, 13.4, 0.12, w, w + 0.1); panel(S, F, c - 2.6, c + 2.6, 5.3, 7.8, 0.12, w, w + 0.1); }
    lights.agostino = [F.P(m - 7.5, 10.2), F.P(m + 7.5, 10.2)].map(([x, z]) => ({ x, z, y: 1.5 })); lights.agostino.c = F.P(m, 0);
    return F;
  }

  // a row of plain windows in stone frames: one to each axis
  function windows(F, mat, axes, y, hw, h, w, o = {}) { for (const u of axes) { box(o.lit && o.lit.includes(u) ? M.glow : M.glass, F, u - hw, u + hw, y, y + h, w, w + 0.03); frame(mat, F, u - hw, u + hw, y, y + h, o.t || 0.16, w, w + (o.p || 0.12)); box(mat, F, u - hw - 0.3, u + hw + 0.3, y - 0.2, y, w, w + (o.sill || 0.22)); if (o.cap) box(mat, F, u - hw - 0.35, u + hw + 0.35, y + h + 0.42, y + h + 0.62, w, w + 0.42);
      if (o.bars) for (let k = -1; k <= 1; k++) box(M.iron, F, u + k * hw * 0.55 - 0.03, u + k * hw * 0.55 + 0.03, y, y + h, w + 0.1, w + 0.16); } }

  /* ---------- Palazzo Madama about 1600. Nothing of this front survives: Maruscelli's replaced it in 1642. Tempesta (1593) draws three storeys and a
     doorway with something over it; Maggi (1625) draws a long front in two unequal parts, the door in the longer; a modern text calls it asymmetrical.
     So: plaster, two parts of unequal height, plain windows, one stone doorway with a blank shield over it. No ornament is claimed. ---------- */
  function palazzoMadama() {
    const F = front(75.6, 26.6, 79.0, 71.9), W = F.W, w = 0.25, P = M.rose, S = M.trav, DOOR = 24.2, J = 17.0;
    box(M.pale, F, 0, J, 0, 14.6, 0, w); box(P, F, J, W, 0, 17.4, 0, w);
    box(S, F, 0, W, 0, 0.9, w, w + 0.1); box(S, F, J - 0.5, J + 0.5, 0, 17.4, w, w + 0.14); box(S, F, W - 0.9, W, 0, 17.4, w, w + 0.14); box(S, F, 0, 0.9, 0, 14.6, w, w + 0.14);
    box(M.wood, F, -0.4, J, 14.6, 14.95, 0, w + 0.9); box(M.wood, F, J - 0.4, W + 0.4, 17.4, 17.8, 0, w + 1.0);                 // the eaves
    box(S, F, J + 0.5, W - 0.9, 5.9, 6.15, w, w + 0.16);
    const north = [3.2, 8.5, 13.6], south = [20.0, 28.6, 32.6, 36.6, 40.4, 43.4];
    windows(F, S, north, 2.5, 0.5, 1.3, w, { bars: 1 }); windows(F, S, north, 6.4, 0.6, 2.0, w, { lit: [8.5] }); windows(F, S, north, 11.2, 0.5, 1.2, w);
    windows(F, S, [...south, 21.9 - 1.9 + 0.0].slice(0, 6), 2.7, 0.55, 1.5, w, { bars: 1 }); windows(F, S, [20.0, DOOR, ...south.slice(1)], 7.4, 0.65, 2.3, w, { cap: 1, lit: [32.6] }); windows(F, S, [20.0, DOOR, ...south.slice(1)], 13.4, 0.55, 1.3, w);
    // the doorway: both leaves standing open on the dark of the entry
    ext(M.dark, F, arched(DOOR, 1.45, 0, 3.3), w, w + 0.02); ringArc(S, F, DOOR, 3.3, 1.45, 2.0, 0, Math.PI, w, w + 0.3, 12); box(S, F, DOOR - 2.0, DOOR - 1.45, 0, 3.3, w, w + 0.3); box(S, F, DOOR + 1.45, DOOR + 2.0, 0, 3.3, w, w + 0.3);
    box(S, F, DOOR - 2.3, DOOR + 2.3, 5.3, 5.6, w, w + 0.5); disc(S, F, DOOR, 6.35, 0.55, w, w + 0.2, 1.25);
    for (const e of [-1, 1]) box(M.wood, F, DOOR + e * 1.5 - 0.06, DOOR + e * 1.5 + 0.06, 0, 3.3, w + 0.02, w + 1.25);         // the leaves, folded back
    lights.madama = [F.P(DOOR - 7.5, 5.2), F.P(DOOR + 9.5, 5.2)].map(([x, z]) => ({ x, z, y: 1.5 })); lights.madama.c = F.P(DOOR, 0);
    F.door = DOOR; F.w = w; return F;
  }

  /* ---------- Palazzo Giustiniani: Giovanni Fontana's front as Falda drew it, nine bays, without Borromini's doorway and balcony of about 1650 ---------- */
  function giustiniani() {
    const k = 39.29 / 38.1, ax = [3.56, 7.57, 11.64, 15.74, 19.72, 23.58, 27.32, 30.95, 34.96].map(v => v * k), S = M.trav;
    const run = (F, axes, door) => { const W = F.W, w = 0.25; box(M.ochre, F, 0, W, 0, 20.0, 0, w);
      box(S, F, 0, W, 7.2, 7.5, w, w + 0.2); box(S, F, 0, W, 13.55, 13.8, w, w + 0.2); box(S, F, -0.5, W + 0.3, 20.0, 20.8, 0, w + 1.1); box(S, F, 0, W, 0, 0.6, w, w + 0.1);
      windows(F, S, axes.filter(u => u !== door), 0.75, 0.6, 1.1, w, { bars: 1 }); windows(F, S, axes.filter(u => u !== door), 3.0, 0.8, 2.3, w, { cap: 1, bars: 1 });
      windows(F, S, axes, 8.3, 0.8, 2.3, w, { cap: 1, lit: [axes[2]] }); windows(F, S, axes, 14.2, 0.8, 1.9, w); windows(F, S, axes, 17.5, 0.8, 1.2, w);
      if (door) { ext(M.wood, F, arched(door, 1.4, 0, 3.6), w, w + 0.04); ringArc(S, F, door, 3.6, 1.4, 1.85, 0, Math.PI, w, w + 0.25, 12); box(S, F, door - 1.85, door - 1.4, 0, 3.6, w, w + 0.25); box(S, F, door + 1.4, door + 1.85, 0, 3.6, w, w + 0.25); } };
    const F = front(167.8, 24.5, 177.8, 62.5); run(F, ax, ax[5]);
    for (let i = 0; i < 20; i++) { box(S, F, 0, i % 2 ? 0.9 : 1.3, i, i + 0.92, 0.25, 0.42); box(S, F, F.W - (i % 2 ? 0.9 : 1.3), F.W, i, i + 0.92, 0.25, 0.42); }      // the rusticated corners
    const G = front(189.66, 22.07, 167.8, 24.5); run(G, [2.7, 6.8, 10.9, 15.0, 19.1], null);                                    // round the corner the same storeys are carried on: a guess
    for (let i = 0; i < 20; i++) box(S, G, G.W - (i % 2 ? 0.9 : 1.3), G.W, i, i + 0.92, 0.25, 0.42);
    lights.giustiniani = [F.P(3.5, 6.5), F.P(-4.5, 4.5)].map(([x, z]) => ({ x, z, y: 1.5 })); lights.giustiniani.c = F.P(0, 0);
    return F;
  }

  /* ---------- San Salvatore in Thermis ("San Salvatorello"): it stood on this side of the lane until 1905-07. Where, from Nolli (1748). Its outside is described
     (it.wikipedia, no date given) as a plain doorway under a lunette holding a bust of Christ, with a round-headed, barred window on either side: that much is built ---------- */
  function sanSalvatore() {
    const F = front(123.2, 25.75, 115.2, 25.9), W = F.W, w = 0.22, m = W / 2;
    box(M.pale, F, 0, W, 0, 7.4, 0, w); box(M.wood, F, -0.2, W + 0.2, 7.4, 7.65, 0, w + 0.6);
    box(M.wood, F, m - 0.85, m + 0.85, 0, 3.0, w, w + 0.04); frame(M.trav, F, m - 0.85, m + 0.85, 0, 3.0, 0.26, w, w + 0.2);
    ext(M.travDark, F, arc(m, 3.3, 0.85, 0, Math.PI, 12), w, w + 0.04); ringArc(M.trav, F, m, 3.3, 0.85, 1.1, 0, Math.PI, w, w + 0.2, 12); disc(M.trav, F, m, 3.68, 0.26, w + 0.04, w + 0.16, 1.2);      // the lunette and the bust in it
    for (const e of [-1, 1]) { const c = m + e * 2.5; ext(M.glass, F, arched(c, 0.45, 2.3, 3.5), w, w + 0.03); ringArc(M.trav, F, c, 3.5, 0.45, 0.6, 0, Math.PI, w, w + 0.14, 10); box(M.trav, F, c - 0.6, c - 0.45, 2.3, 3.5, w, w + 0.14); box(M.trav, F, c + 0.45, c + 0.6, 2.3, 3.5, w, w + 0.14); box(M.trav, F, c - 0.7, c + 0.7, 2.14, 2.3, w, w + 0.2);
      for (let k = -1; k <= 1; k++) box(M.iron, F, c + k * 0.24 - 0.025, c + k * 0.24 + 0.025, 2.3, 3.9, w + 0.08, w + 0.13); }
    F.lamp = F.P(m + 1.5, 0.45); return F;
  }

  function flush() { for (const [m, b] of batches) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); const mesh = new THREE.Mesh(g, m); mesh.receiveShadow = true; mesh.matrixAutoUpdate = false; scene.add(mesh); } batches.clear(); }
  return { M, front, ext, box, disc, ringArc, column, stair, hAt, flush, solids, lights, sanLuigi, santAgostino, palazzoMadama, giustiniani, sanSalvatore };
}
