/* The named fronts of the walk through Arles in September 1888. What each one rests on is set out in research/FINDINGS.md; in short:
     the café on the Place du Forum   on the west wall of its real block (OpenStreetMap), built from Café Terrace at Night itself and a photograph of 2015
                                      (Commons): the awning, the lantern on its iron bracket, the boarded terrace, the shuttered floors above. The wall is left
                                      pale: fr.wikipedia says the café was not yellow in 1888 except by its own gaslight (it was painted yellow about 1990).
     the Yellow House                 gone (bombed 25 June 1944, then pulled down). Its place is OpenStreetMap's marker for the site; its look is the painting:
                                      a pair of two-storey houses under low roofs, yellow, green shutters and door, the grocer's pink awning on the left half,
                                      a taller house behind. The line of the row is argued from the painting and the avenue's real bearing (see lamartine()).
     the restaurant and the Café de la Gare   "pink with green shutters" and "on the left of the restaurant", in his own words (letter 691); nothing else is known
                                      here of their fronts, so they are plain. The café's front stands open so that the room of The Night Café can be seen.
   A front is set out in its own measure: u metres along the wall from its left end as you face it, y up, w out from the wall. */
export function makeFronts({ THREE, scene, plasterTex, stoneTex }) {
  const batches = new Map(), lights = {}, blocks = [];
  const bat = m => { let b = batches.get(m); if (!b) batches.set(m, b = { pos: [], nor: [], uv: [] }); return b; };
  const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o);
  const glowing = (c, k = 0.2) => { const m = lam({ map: plasterTex, color: c }); m.emissive = new THREE.Color(c); m.emissiveMap = plasterTex; m.emissiveIntensity = k; return m; };      // a wall that keeps its own colour in the blue night
  const M = { yellow: glowing('#f2cf45', 0.3), yellowDeep: glowing('#e8b83a', 0.26), sulphur: glowing('#fff08a', 0.75), pale: glowing('#d9d2b4', 0.14), pink: glowing('#e39a8c', 0.22), cream: glowing('#e6dcae', 0.2), ochre: glowing('#c99a4a', 0.2),
    green: glowing('#3f8a56', 0.25), greenDark: lam({ color: '#2c5a44' }), blueWood: glowing('#3a5fae', 0.3), tile: glowing('#c9623a', 0.2), awning: glowing('#e89a2a', 0.5), awningPink: glowing('#e8a0a8', 0.3), deck: glowing('#e8943a', 0.45),
    stone: lam({ map: stoneTex, color: '#e6e0d0' }), glass: basic({ color: '#16203c' }), lit: basic({ color: '#ffd45e' }), litDeep: basic({ color: '#f0a030' }), dark: basic({ color: '#0c1024' }), iron: lam({ color: '#1c2030' }), wood: lam({ color: '#6a4a2c' }) };
  M.awning.side = M.awningPink.side = THREE.DoubleSide;
  function front(ax, az, cx, cz, g = 0) { const W = Math.hypot(cx - ax, cz - az), dx = (cx - ax) / W, dz = (cz - az) / W, nx = -dz, nz = dx;
    return { ax, az, dx, dz, nx, nz, W, g, P: (u, w) => [ax + dx * u + nx * w, az + dz * u + nz * w], local: (x, z) => [(x - ax) * dx + (z - az) * dz, (x - ax) * nx + (z - az) * nz] }; }
  const T = 3.2;
  function ext(mat, F, pts, w0, w1, o = {}) { const b = bat(mat); let A = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; A += p[0] * q[1] - q[0] * p[1]; } if (A < 0) pts = pts.slice().reverse();
    const y0 = F.g, V = (u, y, w) => [F.ax + F.dx * u + F.nx * w, y + y0, F.az + F.dz * u + F.nz * w];
    const tris = pts.slice(2).map((_, i) => [0, i + 1, i + 2]);
    for (const t of tris) for (const k of t) { b.pos.push(...V(pts[k][0], pts[k][1], w1)); b.nor.push(F.nx, 0, F.nz); b.uv.push(pts[k][0] / T, pts[k][1] / T); }
    if (o.face) return;
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], eu = q[0] - p[0], ey = q[1] - p[1], L = Math.hypot(eu, ey); if (L < 1e-4) continue; const mu = ey / L, my = -eu / L, n = [F.dx * mu, my, F.dz * mu];
      const a = V(p[0], p[1], w1), c = V(p[0], p[1], w0), d = V(q[0], q[1], w0), e = V(q[0], q[1], w1), s0 = (p[0] + p[1]) / T, s1 = s0 + L / T;
      b.pos.push(...a, ...c, ...d, ...a, ...d, ...e); for (let k = 0; k < 6; k++) b.nor.push(...n); b.uv.push(s0, w1 / T, s0, w0 / T, s1, w0 / T, s0, w1 / T, s1, w0 / T, s1, w1 / T); } }
  const box = (mat, F, u0, u1, y0, y1, w0, w1) => ext(mat, F, [[u0, y0], [u1, y0], [u1, y1], [u0, y1]], w0, w1);
  // a flat four-cornered sheet anywhere: an awning, a roof slope. Corners as [u, y, w]
  function sheet(mat, F, c) { const b = bat(mat), V = ([u, y, w]) => new THREE.Vector3(F.ax + F.dx * u + F.nx * w, y + F.g, F.az + F.dz * u + F.nz * w), p = c.map(V), n = new THREE.Vector3().subVectors(p[1], p[0]).cross(new THREE.Vector3().subVectors(p[3], p[0])).normalize(); if (n.y < 0) n.negate();
    for (const k of [0, 1, 2, 0, 2, 3]) { b.pos.push(p[k].x, p[k].y, p[k].z); b.nor.push(n.x, n.y, n.z); b.uv.push(c[k][0] / T, c[k][2] / T); } }
  const frame = (mat, F, u0, u1, y0, y1, t, w0, w1) => { box(mat, F, u0 - t, u0, y0, y1 + t, w0, w1); box(mat, F, u1, u1 + t, y0, y1 + t, w0, w1); box(mat, F, u0, u1, y1, y1 + t, w0, w1); };
  // a window with its two shutters folded back against the wall (or closed over it), and a stone sill
  function shuttered(F, u, y, hw, h, w, o = {}) { const sh = o.shut || M.green;
    if (o.closed) { box(sh, F, u - hw, u + hw, y, y + h, w, w + 0.06); box(M.greenDark, F, u - 0.02, u + 0.02, y, y + h, w + 0.06, w + 0.08); }
    else { box(o.lit ? (o.lit === 2 ? M.litDeep : M.lit) : M.glass, F, u - hw, u + hw, y, y + h, w, w + 0.03); box(o.bars || M.pale, F, u - 0.025, u + 0.025, y, y + h, w + 0.03, w + 0.05); box(o.bars || M.pale, F, u - hw, u + hw, y + h * 0.55, y + h * 0.55 + 0.04, w + 0.03, w + 0.05);
      for (const e of [-1, 1]) box(sh, F, u + e * (hw + 0.04) + (e < 0 ? -hw * 0.95 : 0), u + e * (hw + 0.04) + (e < 0 ? 0 : hw * 0.95), y, y + h, w, w + 0.06); }
    box(o.sill || M.pale, F, u - hw - 0.12, u + hw + 0.12, y - 0.12, y, w, w + 0.14); }
  const body = (mat, F, u0, u1, H, depth) => { box(mat, F, u0, u1, 0, H, -depth, 0); const a = F.P(u0, -depth), b = F.P(u1, 0); blocks.push({ F, u0, u1, depth }); };
  const inBlocks = (x, z) => blocks.some(b => { const [u, w] = b.F.local(x, z); return u > b.u0 - 0.2 && u < b.u1 + 0.2 && w < 0.25 && w > -b.depth - 0.2; });

  /* ---------- the café on the Place du Forum ---------- */
  function cafeTerrace() {
    const F = front(2.4, 9.3, 1.1, 31.8), W = F.W, w = 0.12, C0 = 6.0, C1 = W - 0.4;      // the café takes the southern two thirds of the wall; the terrace runs before it
    box(M.pale, F, 0, C0, 0, 11.4, 0, w); box(M.sulphur, F, C0, W, 0, 4.1, 0, w); box(M.yellowDeep, F, C0, W, 4.1, 11.4, 0, w);      // under the awning the wall burns sulphur yellow by gaslight; above it is plaster in shadow
    box(M.tile, F, -0.3, W + 0.3, 11.4, 11.7, 0, w + 0.5);
    // the near end of the wall, at the left edge of the picture: a shop front of blue woodwork with a lit window
    box(M.blueWood, F, 0.5, 5.4, 0, 3.6, w, w + 0.14); box(M.lit, F, 1.0, 3.2, 0.9, 3.0, w + 0.14, w + 0.17); box(M.dark, F, 3.8, 5.0, 0, 3.0, w + 0.14, w + 0.17); box(M.blueWood, F, 0.3, 5.6, 3.6, 3.9, w, w + 0.3);
    // the café's ground floor: a wide lit doorway and two lit windows
    for (const [u0, u1, y1] of [[C0 + 1.0, C0 + 2.6, 3.0], [C0 + 4.2, C0 + 6.4, 3.2], [C0 + 8.0, C0 + 9.6, 3.0], [C0 + 11.2, C0 + 13.0, 3.0]]) { box(M.lit, F, u0, u1, 0, y1, w, w + 0.03); frame(M.yellow, F, u0, u1, 0, y1, 0.14, w, w + 0.1); }
    // the floors above: shuttered windows, some open, and a balcony over the awning
    const ax = [1.4, 3.9, C0 + 1.6, C0 + 4.6, C0 + 7.6, C0 + 10.6, C0 + 13.6];
    ax.forEach((u, i) => { shuttered(F, u, 5.3, 0.55, 2.0, w, { closed: i % 3 === 1, lit: i === 4 ? 2 : 0 }); shuttered(F, u, 8.6, 0.5, 1.6, w, { closed: i % 2 === 0 }); });
    box(M.iron, F, C0 + 2.6, C0 + 11.6, 5.1, 5.2, w, w + 0.75); for (let u = C0 + 2.6; u <= C0 + 11.6; u += 0.3) box(M.iron, F, u - 0.02, u + 0.02, 5.2, 6.1, w + 0.7, w + 0.74); box(M.iron, F, C0 + 2.6, C0 + 11.6, 6.1, 6.16, w + 0.68, w + 0.76);
    // the awning: a long sheet sloping out over the terrace on iron rods, with a hanging edge
    const A0 = C0 + 0.3, A1 = C1, AW = 4.3; sheet(M.awning, F, [[A0, 4.0, w], [A1, 4.0, w], [A1, 3.05, AW], [A0, 3.05, AW]]); sheet(M.awning, F, [[A0, 3.05, AW], [A1, 3.05, AW], [A1, 2.62, AW + 0.03], [A0, 2.62, AW + 0.03]]);
    sheet(M.awning, F, [[A0, 4.0, w], [A0, 3.05, AW], [A0, 2.62, AW], [A0, 3.4, w]]);
    for (const u of [A0 + 0.1, (A0 + A1) / 2, A1 - 0.1]) box(M.iron, F, u - 0.025, u + 0.025, 3.0, 3.06, w, AW);
    // the boarded terrace, a step above the cobbles
    box(M.deck, F, C0 - 0.2, W + 0.2, 0, 0.16, w, AW + 0.5);
    // the great lantern, hung from an iron bracket on the wall at the near end of the awning
    const LU = C0 - 0.5, LW = 1.5, LY = 3.45; box(M.iron, F, LU - 0.03, LU + 0.03, LY + 0.5, LY + 0.56, w, LW + 0.1); box(M.iron, F, LU - 0.02, LU + 0.02, LY + 0.22, LY + 0.5, LW - 0.02, LW + 0.02);
    const [lx, lz] = F.P(LU, LW); lights.terrace = { x: lx, y: LY, z: lz, under: F.P((A0 + A1) / 2, 2.4) };
    F.deck = { u0: C0 - 0.2, u1: W + 0.2, w1: AW + 0.5 }; F.C0 = C0; F.AW = AW; return F;
  }

  /* ---------- Place Lamartine: the Yellow House, the restaurant and the Café de la Gare, in one row.
     The row runs north-west to south-east and looks south-west over the square. That is argued from the painting, not measured: in it the Avenue de Montmajour
     runs off to the right of the house to the railway bridges, and the avenue's real bearing (OpenStreetMap) then puts the house front at about this angle;
     the blocks that stand on the site today run the same way. t is metres along the row from the house's corner on the avenue. ---------- */
  function lamartine(CX = 384.4, CZ = -489) {
    const w = 0.1, out = {}, ex = 0.819, ez = 0.574, nx = -ez, nz = ex, row = (t0, t1, back = 0) => front(CX - ex * t1 - nx * back, CZ - ez * t1 - nz * back, CX - ex * t0 - nx * back, CZ - ez * t0 - nz * back);
    out.row = { CX, CZ, ex, ez, nx, nz, P: (t, off) => [CX - ex * t + nx * off, CZ - ez * t + nz * off] };
    // the house behind the Yellow House, taller, of four storeys (it is in the painting, over the roofs)
    { const F = row(0, 13.4, 9.5); body(M.cream, F, 0, F.W, 13.2, 9); box(M.tile, F, -0.3, F.W + 0.3, 13.2, 13.5, -9, 0.4);
      for (let k = 0; k < 4; k++) for (let j = 0; j < 2; j++) shuttered(F, 1.7 + k * 3.3, 7.4 + j * 2.9, 0.5, 1.7, 0, { closed: (k + j) % 2 === 0, shut: M.pale, lit: k === 2 && j === 0 ? 1 : 0 }); }
    // the Yellow House: the right half of a pair. Left half: the grocer's, with its pink awning. Right half: his. Each under its own low gable
    { const F = row(0, 15.4), H = 6.5, mid = 7.4, W = F.W; out.yellow = F;
      body(M.yellow, F, 0, W, H, 8.5);
      for (const [a, b] of [[0, mid], [mid, W]]) { ext(M.yellow, F, [[a, H], [b, H], [(a + b) / 2, H + 1.25]], -0.3, 0); sheet(M.tile, F, [[a - 0.3, H, 0.35], [(a + b) / 2, H + 1.4, 0.35], [(a + b) / 2, H + 1.4, -8.5], [a - 0.3, H, -8.5]]); sheet(M.tile, F, [[(a + b) / 2, H + 1.4, 0.35], [b + 0.3, H, 0.35], [b + 0.3, H, -8.5], [(a + b) / 2, H + 1.4, -8.5]]); }
      box(M.yellowDeep, F, mid - 0.12, mid + 0.12, 0, H, w - 0.1, w + 0.06); box(M.yellowDeep, F, 0, W, 3.3, 3.5, 0, w + 0.06);
      box(M.dark, F, 1.2, 2.5, 0, 2.6, 0, 0.03); box(M.glass, F, 3.3, 6.2, 0.8, 2.6, 0, 0.03); frame(M.green, F, 3.3, 6.2, 0.8, 2.6, 0.1, 0, 0.08);
      sheet(M.awningPink, F, [[0.6, 3.0, 0], [6.8, 3.0, 0], [6.8, 2.35, 1.9], [0.6, 2.35, 1.9]]);
      shuttered(F, 2.2, 4.1, 0.5, 1.6, 0, { closed: 1 }); shuttered(F, 5.2, 4.1, 0.5, 1.6, 0, {});
      const d0 = mid + 3.3; box(M.green, F, d0 - 0.55, d0 + 0.55, 0, 2.45, 0, 0.05); ext(M.glass, F, [[d0 - 0.55, 2.45], [d0 + 0.55, 2.45], [d0 + 0.55, 2.75], [d0, 3.0], [d0 - 0.55, 2.75]], 0, 0.04); frame(M.green, F, d0 - 0.55, d0 + 0.55, 0, 2.75, 0.09, 0, 0.09);
      shuttered(F, mid + 1.5, 0.95, 0.5, 1.6, 0, { lit: 1 }); shuttered(F, mid + 5.6, 0.95, 0.5, 1.6, 0, {});
      shuttered(F, mid + 1.8, 4.1, 0.5, 1.6, 0, { closed: 1 }); shuttered(F, mid + 5.3, 4.1, 0.5, 1.6, 0, { lit: 2 });
      box(M.yellowDeep, F, 0, W, 0, 0.5, 0, w + 0.03);
      // the side towards the Avenue de Montmajour
      const G = front(CX, CZ, CX - nx * 8.5, CZ - nz * 8.5); box(M.yellow, G, 0, G.W, 0, H, -0.02, 0.02); shuttered(G, 2.2, 0.95, 0.5, 1.6, 0.02, {}); shuttered(G, 6.0, 0.95, 0.5, 1.6, 0.02, { closed: 1 }); shuttered(G, 2.2, 4.1, 0.5, 1.6, 0.02, {}); shuttered(G, 6.0, 4.1, 0.5, 1.6, 0.02, { closed: 1 });
      const [lx, lz] = out.row.P(-2.4, 2.8); lights.yellow = { x: lx, y: 3.6, z: lz, post: true }; }
    // the restaurant where he dined: "rose à volets verts" (letter 691)
    { const F = row(20, 31), H = 7.2, W = F.W; out.restaurant = F; body(M.pink, F, 0, W, H, 8); box(M.tile, F, -0.3, W + 0.3, H, H + 0.3, -8, 0.45);
      box(M.green, F, 1.0, 2.2, 0, 2.5, 0, 0.05); box(M.lit, F, 3.4, 6.0, 0.9, 2.5, 0, 0.03); frame(M.green, F, 3.4, 6.0, 0.9, 2.5, 0.1, 0, 0.08); box(M.green, F, 7.6, 9.6, 0, 2.6, 0, 0.05);
      for (const [u, c] of [[1.8, 0], [5.4, 1], [9.0, 0]]) shuttered(F, u, 4.2, 0.5, 1.7, 0, { closed: c }); }
    // the Café de la Gare, "à gauche du restaurant": the whole ground floor of its front left open on the room
    { const F = row(32, 46.8), H = 8.2, W = F.W, O0 = 2.9, O1 = 11.9, OH = 4.3; out.cafe = F;
      box(M.ochre, F, 0, O0, 0, H, -0.3, 0); box(M.ochre, F, O1, W, 0, H, -0.3, 0); box(M.ochre, F, O0, O1, OH, H, -0.3, 0); box(M.tile, F, -0.3, W + 0.3, H, H + 0.3, -11.5, 0.45);
      box(M.ochre, F, 0, W, OH + 0.4, H, -11.5, -0.3);
      for (const [u, c] of [[2.0, 1], [5.7, 0], [9.1, 1], [12.8, 0]]) shuttered(F, u, 5.4, 0.5, 1.7, 0, { closed: c, lit: u === 5.7 ? 2 : 0 });
      blocks.push({ F, u0: 0, u1: O0, depth: 11.5 }, { F, u0: O1, u1: W, depth: 11.5 }, { F, u0: O0, u1: O1, depth: 11.5, back: 10.9 });
      F.O0 = O0; F.O1 = O1; F.OH = OH; F.mid = F.P((O0 + O1) / 2, 0); lights.cafe = { x: F.P(-1.6, 2.2)[0], y: 3.4, z: F.P(-1.6, 2.2)[1], post: true }; }
    return out;
  }
  // the room behind the open front may be walked into as far as its back wall
  const blocked = (x, z) => blocks.some(b => { const [u, w] = b.F.local(x, z); return u > b.u0 - 0.2 && u < b.u1 + 0.2 && (b.back ? w < -b.back && w > -b.depth - 0.2 : w < 0.25 && w > -b.depth - 0.2); });
  function flush() { for (const [m, b] of batches) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); const mesh = new THREE.Mesh(g, m); mesh.matrixAutoUpdate = false; scene.add(mesh); } batches.clear(); }
  return { M, front, ext, box, sheet, shuttered, flush, lights, blocked, inBlocks, cafeTerrace, lamartine };
}
