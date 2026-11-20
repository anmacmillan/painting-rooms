/* The buildings of the walk from the Agora to the Parthenon at the Great Panathenaia of about 438 BC. What each rests on is set out in research/FINDINGS.md; in short:
     the Parthenon        on its real footprint (OpenStreetMap), eight columns by seventeen, to its published measures; in its colour: blue triglyphs and tympana, red bands,
                          gilding. That it was painted is established; which member was which colour is the usual reconstruction, not known piece by piece. In 438 the
                          statue was dedicated and the building in use, but the pediment figures were still to come (accounts run to 432): the tympana stand empty and blue,
                          with a carvers' scaffold on the west one (the scaffold is this level's). The metopes and the frieze are drawn, not modelled.
     Athena Parthenos     lost. Built from Pausanias 1.24.5-7 and Pliny 36.18 and from the Varvakeion statuette (a Roman copy): gold dress, ivory flesh, the Nike on her right
                          hand, the shield and the snake at her left, the spear, the sphinx on the helmet. The column under her hand is in the copy; whether Phidias' had it is disputed.
     the Agora            the Altar of the Twelve Gods, the Royal Stoa, the Old Bouleuterion, the Tholos, the Aiakeion and the Southeast Fountain House stand on their
                          excavated footprints (OpenStreetMap); only their plans are known, so their upper parts are plain. The Painted Stoa is set where it was dug, north of the map's edge.
     everything else      the gate on the Acropolis (the Old Propylon), the houses, the altar of Athena, the wreck of the Old Temple, the bronze Athena: plain, and conjectural in form.
   A front is set out in its own measure: u metres along from its left end as you face it, y up, w out from the wall. */
export function makeFronts({ THREE, scene, T }) {
  const batches = new Map(), solids = [], rounds = [], inst = [];
  const bat = m => { let b = batches.get(m); if (!b) batches.set(m, b = { pos: [], nor: [], uv: [] }); return b; };
  const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o);
  const mk = (map, c) => lam({ map, color: c });
  const M = { marble: mk(T.marble, '#fbf7ec'), marbleWarm: mk(T.marble, '#f2ebd9'), poros: mk(T.plaster, '#eae1cc'), plaster: mk(T.plaster, '#f4ede0'), brick: mk(T.plaster, '#e5dbc6'), tile: mk(T.tile, '#b9442e'), rock: mk(T.rock, '#e2d9c6'),
    blue: lam({ color: '#1f4d8f' }), blueDeep: lam({ color: '#183d76' }), red: lam({ color: '#b53b2a' }), gold: lam({ color: '#daa232', emissive: '#4a3008' }), goldDeep: lam({ color: '#c48a22', emissive: '#3a2204' }), ivory: lam({ color: '#faf3e4', emissive: '#3c3020' }),
    bronze: lam({ color: '#8d6534', emissive: '#221606' }), dark: basic({ color: '#1a1511' }), wood: lam({ color: '#8f6942' }), woodDark: lam({ color: '#4c3826' }), door: lam({ color: '#7d442a' }), green: lam({ color: '#5c754d' }) };
  M.tile.side = THREE.DoubleSide;
  function front(ax, az, cx, cz, g = 0) { const W = Math.hypot(cx - ax, cz - az), dx = (cx - ax) / W, dz = (cz - az) / W, nx = -dz, nz = dx;
    return { ax, az, dx, dz, nx, nz, W, g, P: (u, w) => [ax + dx * u + nx * w, az + dz * u + nz * w], local: (x, z) => [(x - ax) * dx + (z - az) * dz, (x - ax) * nx + (z - az) * nz] }; }
  // a front from the middle of a wall: (x, z) its centre on the ground, ang the way it looks (the outward normal, measured like a heading: atan2(nx, nz)), W wide
  const frontAt = (x, z, ang, W, g = 0) => { const nx = Math.sin(ang), nz = Math.cos(ang), dx = nz, dz = -nx; return front(x - dx * W / 2, z - dz * W / 2, x + dx * W / 2, z + dz * W / 2, g); };
  const TS = 3.2;
  function ext(mat, F, pts, w0, w1, o = {}) { const b = bat(mat); let A = 0; for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length]; A += p[0] * q[1] - q[0] * p[1]; } if (A < 0) pts = pts.slice().reverse();
    const y0 = F.g, V = (u, y, w) => [F.ax + F.dx * u + F.nx * w, y + y0, F.az + F.dz * u + F.nz * w];
    for (const t of pts.slice(2).map((_, i) => [0, i + 1, i + 2])) for (const k of t) { b.pos.push(...V(pts[k][0], pts[k][1], w1)); b.nor.push(F.nx, 0, F.nz); b.uv.push(o.uv ? (pts[k][0] - o.uv[0]) / o.uv[2] : pts[k][0] / TS, o.uv ? (pts[k][1] - o.uv[1]) / o.uv[3] : pts[k][1] / TS); }
    if (o.face) return;
    for (const t of pts.slice(2).map((_, i) => [0, i + 2, i + 1])) for (const k of t) { b.pos.push(...V(pts[k][0], pts[k][1], w0)); b.nor.push(-F.nx, 0, -F.nz); b.uv.push(pts[k][0] / TS, pts[k][1] / TS); }
    for (let i = 0; i < pts.length; i++) { const p = pts[i], q = pts[(i + 1) % pts.length], eu = q[0] - p[0], ey = q[1] - p[1], L = Math.hypot(eu, ey); if (L < 1e-4) continue; const mu = ey / L, my = -eu / L, n = [F.dx * mu, my, F.dz * mu];
      const a = V(p[0], p[1], w1), c = V(p[0], p[1], w0), d = V(q[0], q[1], w0), e = V(q[0], q[1], w1), s0 = (p[0] + p[1]) / TS, s1 = s0 + L / TS;
      b.pos.push(...a, ...c, ...d, ...a, ...d, ...e); for (let k = 0; k < 6; k++) b.nor.push(...n); b.uv.push(s0, w1 / TS, s0, w0 / TS, s1, w0 / TS, s0, w1 / TS, s1, w0 / TS, s1, w1 / TS); } }
  const box = (mat, F, u0, u1, y0, y1, w0, w1, o) => ext(mat, F, [[u0, y0], [u1, y0], [u1, y1], [u0, y1]], w0, w1, o);
  // a flat four-cornered sheet anywhere: a roof slope. Corners as [u, y, w]
  function sheet(mat, F, c, uvs) { const b = bat(mat), V = ([u, y, w]) => new THREE.Vector3(F.ax + F.dx * u + F.nx * w, y + F.g, F.az + F.dz * u + F.nz * w), p = c.map(V), n = new THREE.Vector3().subVectors(p[1], p[0]).cross(new THREE.Vector3().subVectors(p[3], p[0])).normalize(); if (n.y < 0) n.negate();
    for (const k of [0, 1, 2, 0, 2, 3]) { b.pos.push(p[k].x, p[k].y, p[k].z); b.nor.push(n.x, n.y, n.z); b.uv.push(uvs ? uvs[k][0] : c[k][0] / TS, uvs ? uvs[k][1] : c[k][2] / TS); } }
  // a picture on a wall: its texture fills it once
  const panel = (mat, F, u0, u1, y0, y1, w) => box(mat, F, u0, u1, y0, y1, w - 0.02, w, { face: true, uv: [u0, y0, u1 - u0, y1 - y0] });
  // columns are set up by the hundred: a shaft of twenty flat faces (they read as flutes in a raking sun), a cushion and a slab
  const shaftG = new THREE.CylinderGeometry(0.78, 1, 1, 20, 1, true).toNonIndexed(); shaftG.computeVertexNormals(); const echG = new THREE.CylinderGeometry(1.12, 0.8, 1, 20), abaG = new THREE.BoxGeometry(2.3, 1, 2.3), cols = [];
  const column = (x, z, y, H, r, mat = M.marble) => { cols.push({ x, z, y, H, r, mat }); rounds.push({ x, z, r: r + 0.25 }); };
  function flush() {
    for (const [m, b] of batches) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); const mesh = new THREE.Mesh(g, m); mesh.matrixAutoUpdate = false; scene.add(mesh); } batches.clear();
    const by = new Map(); for (const c of cols) { if (!by.has(c.mat)) by.set(c.mat, []); by.get(c.mat).push(c); } cols.length = 0;
    for (const [mat, list] of by) { const fm = mat.clone(); fm.flatShading = true; const S = new THREE.InstancedMesh(shaftG, fm, list.length), E = new THREE.InstancedMesh(echG, mat, list.length), A = new THREE.InstancedMesh(abaG, mat, list.length), d = new THREE.Object3D();
      list.forEach((c, i) => { const hc = c.r * 0.72; d.rotation.set(0, 0, 0); d.position.set(c.x, c.y + (c.H - hc) / 2, c.z); d.scale.set(c.r, c.H - hc, c.r); d.updateMatrix(); S.setMatrixAt(i, d.matrix);
        d.position.set(c.x, c.y + c.H - hc * 0.78, c.z); d.scale.set(c.r, hc * 0.45, c.r); d.updateMatrix(); E.setMatrixAt(i, d.matrix); d.position.set(c.x, c.y + c.H - hc * 0.28, c.z); d.scale.set(c.r, hc * 0.56, c.r); d.updateMatrix(); A.setMatrixAt(i, d.matrix); });
      for (const im of [S, E, A]) { im.frustumCulled = false; scene.add(im); } } }
  const solid = (F, u0, u1, w0, w1) => solids.push({ F, u0, u1, w0, w1 });
  const blocked = (x, z) => solids.some(b => { const [u, w] = b.F.local(x, z); return u > b.u0 - 0.3 && u < b.u1 + 0.3 && w > b.w0 - 0.3 && w < b.w1 + 0.3; }) || rounds.some(h => (x - h.x) ** 2 + (z - h.z) ** 2 < h.r * h.r);
  const canvasTex = (w, h, paint) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  // the oriented box round a footprint: its long side sets the heading
  function obb(p) { let best = null; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 1) continue; const dx = (b[0] - a[0]) / L, dz = (b[1] - a[1]) / L; let u0 = 1e9, u1 = -1e9, w0 = 1e9, w1 = -1e9;
      for (const q of p) { const u = q[0] * dx + q[1] * dz, w = -q[0] * dz + q[1] * dx; u0 = Math.min(u0, u); u1 = Math.max(u1, u); w0 = Math.min(w0, w); w1 = Math.max(w1, w); } const A = (u1 - u0) * (w1 - w0); if (!best || A < best.A) best = { A, dx, dz, u0, u1, w0, w1 }; }
    const { dx, dz, u0, u1, w0, w1 } = best, pt = (u, w) => [u * dx - w * dz, u * dz + w * dx]; return { c: pt((u0 + u1) / 2, (w0 + w1) / 2), corners: [pt(u0, w0), pt(u1, w0), pt(u1, w1), pt(u0, w1)], L: u1 - u0, Wd: w1 - w0 }; }
  // the four fronts of a rectangle given by its corners in order round it; each looks outward
  const sides = (c, g) => { const mk = c => [0, 1, 2, 3].map(i => front(c[i][0], c[i][1], c[(i + 1) % 4][0], c[(i + 1) % 4][1], g)), cx = (c[0][0] + c[2][0]) / 2, cz = (c[0][1] + c[2][1]) / 2; let S = mk(c); const [mx, mz] = S[0].P(S[0].W / 2, 0); if ((cx - mx) * S[0].nx + (cz - mz) * S[0].nz > 0) S = mk(c.slice().reverse()); return S; };
  // the side of a rectangle that looks most nearly towards (x, z)
  const facing = (S, x, z) => S.map(F => { const [mx, mz] = F.P(F.W / 2, 0); return [F, (x - mx) * F.nx + (z - mz) * F.nz]; }).sort((a, b) => b[1] - a[1])[0][0];
  /* a pitched roof of tiles over a rectangle: F its long front, D deep, eaves at y, ridge r higher */
  const roof = (F, D, y, r, over = 0.5, mat = M.tile) => { sheet(mat, F, [[-over, y, over], [F.W + over, y, over], [F.W + over, y + r, -D / 2], [-over, y + r, -D / 2]]); sheet(mat, F, [[-over, y, -D - over], [F.W + over, y, -D - over], [F.W + over, y + r, -D / 2], [-over, y + r, -D / 2]]);
    for (const u of [0, F.W]) { const a = F.P(u, -D), b = F.P(u, 0); for (const f of [front(a[0], a[1], b[0], b[1], F.g), front(b[0], b[1], a[0], a[1], F.g)]) ext(M.plaster, f, [[0, y], [D, y], [D / 2, y + r]], 0, 0.001, { face: true }); } };

  /* ---------- a stoa: a back wall, two short side walls, a row of Doric columns along the open front, a tiled roof ---------- */
  function stoa(p, g, look, o = {}) { const B = obb(p), S = sides(B.corners, g), F = facing(S.filter(f => f.W >= Math.max(B.L, B.Wd) - 0.01), look[0], look[1]), D = Math.min(B.L, B.Wd), H = o.H || 4.6, n = o.cols || Math.max(4, Math.round(F.W / 2.4)), wall = o.wall || M.poros;
    box(M.marbleWarm, F, -0.4, F.W + 0.4, 0, 0.3, -D - 0.4, 0.5); box(wall, F, 0, F.W, 0.3, H, -D, -D + 0.5); for (const u of [0, F.W - 0.5]) box(wall, F, u, u + 0.5, 0.3, H, -D, -0.6);
    for (let i = 0; i < n; i++) { const [x, z] = F.P(0.6 + (F.W - 1.2) * i / (n - 1), -0.5); column(x, z, g + 0.3, H - 0.75, o.r || 0.36, o.col || M.marbleWarm); }
    box(o.col || M.marbleWarm, F, 0, F.W, H - 0.45, H, -1.0, 0); box(M.blue, F, 0, F.W, H, H + 0.42, -0.95, -0.02); box(M.red, F, 0, F.W, H + 0.42, H + 0.5, -1.0, 0.05); roof(F, D, H + 0.5, D * 0.2);
    if (o.pictures) for (let i = 0; i < 4; i++) panel(o.pictures[i % o.pictures.length], F, 1.5 + i * (F.W - 3) / 4, 1.5 + (i + 0.88) * (F.W - 3) / 4, 1.4, 3.6, -D + 0.56);
    solid(F, 0, F.W, -D, -D + 0.7); solid(F, 0, 0.6, -D, -0.4); solid(F, F.W - 0.6, F.W, -D, -0.4); return F; }
  /* ---------- a closed hall with a door, optionally fronted by a Doric colonnaded porch ---------- */
  function hall(p, g, look, o = {}) { const B = obb(p), S = sides(B.corners, g), F = facing(S, look[0], look[1]), H = o.H || 5, wall = o.wall || M.poros, long = S.find(f => f.W >= Math.max(B.L, B.Wd) - 0.01), D = Math.min(B.L, B.Wd);
    for (const f of S) { box(wall, f, 0, f.W, -2.5, H, -0.5, 0); box(M.rock, f, -0.05, f.W + 0.05, -2.5, 0.62, -0.52, 0.07); box(M.marbleWarm, f, -0.06, f.W + 0.06, H - 0.22, H, -0.52, 0.06); solid(f, 0, f.W, -0.6, 0.1); }
    const dw = o.door || 1.1, dh = o.doorH || 2.8, dm = F.W / 2;
    box(M.marbleWarm, F, dm - dw - 0.35, dm + dw + 0.35, -0.4, 0.18, -0.1, 0.28);
    box(M.marbleWarm, F, dm - dw - 0.22, dm - dw, 0.18, dh, 0, 0.14); box(M.marbleWarm, F, dm + dw, dm + dw + 0.22, 0.18, dh, 0, 0.14);
    box(o.doorM || M.door, F, dm - dw, dm + dw, 0.18, dh, 0, 0.06);
    box(M.marbleWarm, F, dm - dw - 0.32, dm + dw + 0.32, dh, dh + 0.32, 0, 0.18);
    if (o.porch) {
      const n = o.porch, pd = 3.0, pu0 = Math.max(0.8, F.W * 0.12), pu1 = Math.min(F.W - 0.8, F.W * 0.88);
      box(M.marbleWarm, F, pu0 - 0.6, pu1 + 0.6, -2.5, 0.35, 0, pd + 0.5);
      for (let i = 0; i < n; i++) { const [cx, cz] = F.P(pu0 + (pu1 - pu0) * i / (n - 1), pd); column(cx, cz, g + 0.35, H - 0.85, 0.38, M.marble); }
      box(M.marble, F, pu0 - 0.45, pu1 + 0.45, H - 0.5, H, 0, pd + 0.45);
      box(M.blue, F, pu0 - 0.4, pu1 + 0.4, H, H + 0.42, 0.05, pd + 0.42);
      box(M.red, F, pu0 - 0.45, pu1 + 0.45, H + 0.42, H + 0.54, 0, pd + 0.48);
      ext(M.marble, F, [[pu0 - 0.5, H + 0.54], [pu1 + 0.5, H + 0.54], [(pu0 + pu1) / 2, H + 1.9]], pd, pd + 0.45);
      ext(M.blue, F, [[pu0 + 0.4, H + 0.62], [pu1 - 0.4, H + 0.62], [(pu0 + pu1) / 2, H + 1.65]], pd + 0.42, pd + 0.46);
    }
    if (o.windows) for (const f of S) for (let u = 2; u < f.W - 1.5; u += 3.4) {
      box(M.marbleWarm, f, u - 0.08, u + 0.58, H - 1.38, H - 1.28, 0, 0.08); box(M.wood, f, u - 0.08, u + 0.58, H - 0.70, H - 0.60, 0, 0.08);
      box(M.dark, f, u, u + 0.5, H - 1.28, H - 0.70, 0, 0.03); box(M.wood, f, u + 0.22, u + 0.28, H - 1.28, H - 0.70, 0, 0.05); }
    roof(long, D, H, D * (o.pitch || 0.2)); return F; }
  /* ---------- a colonnaded Greek fountain house (Southeast Fountain House of the Agora) ---------- */
  function fountainHouse(p, g, look, o = {}) {
    const B = obb(p), S = sides(B.corners, g), F = facing(S.filter(f => f.W >= Math.max(B.L, B.Wd) - 0.01), look[0], look[1]), D = Math.min(B.L, B.Wd), H = o.H || 5.0, n = o.cols || 7;
    box(M.marbleWarm, F, -0.7, F.W + 0.7, -2.5, 0.32, -D - 0.6, 0.9);
    box(M.marble, F, -0.35, F.W + 0.35, 0.32, 0.62, -D - 0.25, 0.55);
    box(M.poros, F, 0, F.W, 0.62, H, -D, -D + 0.6);
    for (const u of [0, F.W - 0.6]) box(M.poros, F, u, u + 0.6, 0.62, H, -D, -1.6);
    /* Marble draw-basin parapet and blue water inside the shaded portico */
    box(M.marbleWarm, F, 1.0, F.W - 1.0, 0.62, 1.55, -D + 0.6, -2.1);
    box(M.blue, F, 1.3, F.W - 1.3, 1.55, 1.62, -D + 0.85, -2.35);
    /* Crisp Doric marble colonnade along the front */
    for (let i = 0; i < n; i++) { const [x, z] = F.P(0.8 + (F.W - 1.6) * i / (n - 1), -0.45); column(x, z, g + 0.62, H - 1.15, 0.38, M.marble); }
    box(M.marble, F, -0.1, F.W + 0.1, H - 0.55, H, -1.1, 0.08);
    box(M.blue, F, -0.05, F.W + 0.05, H, H + 0.46, -1.0, 0.05);
    box(M.red, F, -0.12, F.W + 0.12, H + 0.46, H + 0.58, -1.08, 0.12);
    roof(F, D, H + 0.58, D * 0.22);
    /* Terracotta water jars (hydriai) waiting by the marble steps */
    for (const u of [2.2, 3.1, F.W - 2.6]) {
      box(M.red, F, u - 0.22, u + 0.22, 0.62, 1.12, 0.12, 0.48);
      box(M.gold, F, u - 0.13, u + 0.13, 1.12, 1.26, 0.20, 0.40);
    }
    solid(F, 0, F.W, -D, -1.6); return F;
  }
  /* ---------- a small Doric temple (e.g. inside the Eleusinion sanctuary) ---------- */
  function templeSmall(p, g, look, o = {}) {
    const B = obb(p), S = sides(B.corners, g), F = facing(S.filter(f => f.W <= Math.min(B.L, B.Wd) + 0.05), look[0], look[1]), D = Math.max(B.L, B.Wd), H = o.H || 6.4, n = o.cols || 4;
    box(M.rock, F, -0.9, F.W + 0.9, -4.5, 0.35, -D - 0.9, 0.9);
    box(M.marble, F, -0.55, F.W + 0.55, 0.35, 0.72, -D - 0.55, 0.55);
    box(M.marble, F, -0.25, F.W + 0.25, 0.72, 1.08, -D - 0.25, 0.25);
    /* Cella behind the front porch */
    box(M.marbleWarm, F, 1.1, F.W - 1.1, 1.08, H, -D + 0.6, -3.0);
    box(M.door, F, F.W / 2 - 1.1, F.W / 2 + 1.1, 1.08, 4.4, -3.05, -2.92);
    for (let i = 0; i < n; i++) { const [x, z] = F.P(0.75 + (F.W - 1.5) * i / (n - 1), -0.75); column(x, z, g + 1.08, H - 1.65, 0.42, M.marble); }
    box(M.marble, F, -0.1, F.W + 0.1, H - 0.58, H, -D + 0.4, 0.05);
    box(M.blue, F, -0.05, F.W + 0.05, H, H + 0.52, -D + 0.45, 0.02);
    box(M.red, F, -0.15, F.W + 0.15, H + 0.52, H + 0.66, -D + 0.35, 0.12);
    const ph = F.W * 0.21;
    ext(M.marble, F, [[-0.25, H + 0.66], [F.W + 0.25, H + 0.66], [F.W / 2, H + 0.66 + ph]], -0.8, 0.15);
    ext(M.blue, F, [[0.7, H + 0.78], [F.W - 0.7, H + 0.78], [F.W / 2, H + 0.66 + ph - 0.35]], 0.12, 0.18);
    ext(M.marble, F, [[-0.25, H + 0.66], [F.W + 0.25, H + 0.66], [F.W / 2, H + 0.66 + ph]], -D + 0.3, -D + 0.9);
    const Lf = front(...F.P(F.W, -D), ...F.P(F.W, 0), g);
    roof(Lf, F.W, H + 0.66, ph, 0.35, M.tile);
    solid(F, 0, F.W, -D, 0); return F;
  }
  /* ---------- a walled enclosure open to the sky (the Aiakeion, a precinct) ---------- */
  function enclosure(p, g, o = {}) { const H = o.H || 3, gy = typeof g === 'function' ? g : () => g; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.5) continue; const n = Math.max(1, Math.round(L / 5));      // on a slope the wall steps down with the ground
      for (let k = 0; k < n; k++) { const q = t => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t], c = q(k / n), d = q((k + 1) / n), m = q((k + 0.5) / n), f = front(c[0], c[1], d[0], d[1], gy(m[0], m[1])); box(o.wall || M.poros, f, 0, f.W, -3, H, -0.25, 0.25); box(M.marbleWarm, f, -0.1, f.W + 0.1, H, H + 0.18, -0.33, 0.33); solid(f, 0, f.W, -0.4, 0.4); } } }
  /* ---------- the Tholos: a round classical house under a conical terracotta roof with marble base, pilasters, and painted frieze ring ---------- */
  function tholos(p, g) { let cx = 0, cz = 0; for (const q of p) { cx += q[0] / p.length; cz += q[1] / p.length; } const R = Math.hypot(p[0][0] - cx, p[0][1] - cz);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.55, R + 0.75, 1.2, 32), M.marbleWarm);
    const wall = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 6.2, 32), M.poros);
    const frz = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.12, R + 0.12, 0.55, 32), M.blue);
    const cor = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.32, R + 0.22, 0.28, 32), M.marble);
    const rf = new THREE.Mesh(new THREE.ConeGeometry(R + 0.7, 4.6, 32), M.tile);
    const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.32, 0.9, 12), M.gold);
    base.position.set(cx, g + 0.1, cz); wall.position.set(cx, g + 3.4, cz); frz.position.set(cx, g + 6.75, cz); cor.position.set(cx, g + 7.15, cz); rf.position.set(cx, g + 7.25 + 2.3, cz); fin.position.set(cx, g + 12.1, cz);
    for (const m of [base, wall, frz, cor, rf, fin]) scene.add(m);
    for (let i = 0; i < 12; i++) { const a = i * Math.PI * 2 / 12; column(cx + Math.cos(a) * (R + 0.15), cz + Math.sin(a) * (R + 0.15), g + 0.65, 5.9, 0.28, M.marbleWarm); }
    rounds.push({ x: cx, z: cz, r: R + 0.5 }); }
  /* ---------- a votive bronze or marble statue on a tall stepped Agora base ---------- */
  function votiveStatue(x, z, ang, y, bronze = true) {
    const F = frontAt(x, z, ang, 1.5, y);
    box(M.poros, F, -0.35, 1.85, -1.0, 0.28, -1.65, 0.35);
    box(M.marbleWarm, F, -0.12, 1.62, 0.28, 0.54, -1.42, 0.12);
    box(M.marble, F, 0.08, 1.42, 0.54, 1.95, -1.22, -0.08);
    box(M.marbleWarm, F, 0.0, 1.5, 1.95, 2.14, -1.30, 0.0);
    const [sx, sz] = F.P(0.75, -0.65), m = bronze ? M.bronze : M.marble;
    const g = new THREE.Group(), add = (geo, px, py, pz, rx = 0, rz = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.rotation.set(rx, 0, rz); g.add(o); };
    add(new THREE.CylinderGeometry(0.18, 0.24, 1.15, 10), 0, 2.75, 0);
    add(new THREE.CylinderGeometry(0.22, 0.19, 0.62, 10), 0, 3.60, 0);
    add(new THREE.SphereGeometry(0.17, 10, 8), 0, 4.10, 0);
    add(new THREE.CylinderGeometry(0.055, 0.05, 0.72, 8), 0.30, 3.85, 0.12, -0.45, -0.35);
    add(new THREE.CylinderGeometry(0.03, 0.03, 2.6, 6), 0.42, 3.55, 0.16);
    g.position.set(sx, y, sz); g.rotation.y = ang; scene.add(g);
    rounds.push({ x: sx, z: sz, r: 1.3 });
  }
  /* ---------- stepped timber viewing benches (ikria, attested by post-holes along the Way in FINDINGS.md) ---------- */
  function ikria(x, z, ang, W, y) {
    const F = frontAt(x, z, ang, W, y);
    for (let t = 0; t < 3; t++) {
      const y0 = 0.42 + t * 0.44, d0 = -0.55 - t * 0.62;
      box(M.wood, F, 0, W, y0, y0 + 0.10, d0 - 0.48, d0);
      for (let u = 0.4; u <= W - 0.3; u += 2.2) box(M.woodDark, F, u - 0.07, u + 0.07, -0.5, y0, d0 - 0.34, d0 - 0.14);
    }
    solid(F, 0, W, -2.5, -0.4);
  }
  /* ---------- a courtyard wall spur connecting adjacent houses into Athenian city blocks ---------- */
  function courtyardWall(ax, az, bx, bz, g, H = 2.4) {
    const F = front(ax, az, bx, bz, g);
    if (F.W < 0.8) return;
    box(M.plaster, F, 0, F.W, -2.2, H, -0.25, 0.25);
    box(M.tile, F, -0.08, F.W + 0.08, H, H + 0.22, -0.35, 0.35);
  }
  /* ---------- Themistoclean city wall and twin-towered gate (Thriasian Gate horizon cue on NW edge) ---------- */
  function cityGate(x, z, ang, y, W = 38) {
    const F = frontAt(x, z, ang, W, y), m = W / 2, pass = 4.6, H = 7.2, TH = 9.4;
    for (const [a, b] of [[0, m - pass - 4.2], [m + pass + 4.2, W]]) {
      box(M.poros, F, a, b, -3, H, -3.2, 0);
      box(M.rock, F, a, b, -3, 2.2, -3.3, 0.15);
      box(M.marbleWarm, F, a, b, H, H + 0.35, -3.35, 0.15);
      for (let u = a + 0.8; u < b - 0.8; u += 2.2) box(M.poros, F, u, u + 1.1, H + 0.35, H + 1.15, -0.5, 0.1);
    }
    for (const [a, b] of [[m - pass - 4.2, m - pass], [m + pass, m + pass + 4.2]]) {
      box(M.poros, F, a, b, -3, TH, -4.4, 1.2);
      box(M.rock, F, a - 0.1, b + 0.1, -3, 2.5, -4.5, 1.3);
      box(M.marbleWarm, F, a - 0.15, b + 0.15, TH, TH + 0.35, -4.55, 1.35);
      roof(front(...F.P(a, 1.2), ...F.P(b, 1.2), y), 5.6, TH + 0.35, 1.3, 0.3);
    }
    box(M.poros, F, m - pass, m + pass, 5.2, H + 0.2, -3.2, 0);
    box(M.marbleWarm, F, m - pass - 0.2, m + pass + 0.2, H + 0.2, H + 0.55, -3.3, 0.15);
  }
  /* ---------- an Athenian house: stone socle and string-course, plastered or ochre walls, cornice band and rafters, framed shuttered windows, recessed prothyron doorway, stone bench, shaded awning, and pithoi ---------- */
  function house(x, z, ang, W, D, g, k = 0) { const F = frontAt(x, z, ang, W, g), H = 3.5 + (k % 3) * 0.45, wall = [M.plaster, M.marbleWarm, M.poros, M.brick][k % 4], c = [F.P(0, 0), F.P(W, 0), F.P(W, -D), F.P(0, -D)];
    const bandM = k % 3 === 0 ? M.red : k % 3 === 1 ? M.blue : M.marbleWarm, shutM = k % 2 ? M.wood : M.woodDark;
    for (const f of sides(c, g)) {
      box(wall, f, 0, f.W, -3.8, H, -0.4, 0);
      /* Stone rubble footing and dressed string-course */
      box(M.rock, f, -0.04, f.W + 0.04, -3.8, 0.62, -0.42, 0.08);
      box(M.poros, f, -0.06, f.W + 0.06, 0.62, 0.74, -0.43, 0.10);
      /* Upper cornice band and projecting wooden rafter ends under the eaves */
      box(bandM, f, -0.04, f.W + 0.04, H - 0.22, H - 0.06, -0.42, 0.06);
      for (let ru = 0.6; ru < f.W - 0.4; ru += 1.6) box(M.woodDark, f, ru, ru + 0.14, H - 0.10, H + 0.02, 0, 0.26);
      /* Framed windows with stone sill, timber lintel, mullion, and open wooden shutters */
      const wy0 = H - 1.32, wy1 = H - 0.66;
      for (let u = 1.7; u < f.W - 1.4; u += 3.3) {
        if (f === F && u > W * 0.24 - 0.6 && u < W * 0.24 + 2.1) continue;
        box(M.poros, f, u - 0.10, u + 0.62, wy0 - 0.09, wy0, 0, 0.10);
        box(M.woodDark, f, u - 0.12, u + 0.64, wy1, wy1 + 0.10, 0, 0.10);
        box(M.wood, f, u - 0.07, u, wy0, wy1, 0, 0.07); box(M.wood, f, u + 0.52, u + 0.59, wy0, wy1, 0, 0.07);
        box(M.dark, f, u, u + 0.52, wy0, wy1, 0, 0.025);
        box(M.wood, f, u + 0.23, u + 0.29, wy0, wy1, 0, 0.055);
        box(shutM, f, u - 0.30, u - 0.07, wy0 + 0.02, wy1 - 0.02, 0, 0.065);
        box(shutM, f, u + 0.59, u + 0.82, wy0 + 0.02, wy1 - 0.02, 0, 0.065);
      }
      solid(f, 0, f.W, -0.5, 0.15);
    }
    /* Doorway (prothyron): stepped stone threshold, stone jambs, panelled double door leaves, lintel and timber hood */
    const du0 = W * 0.28, du1 = du0 + 1.24, dm = (du0 + du1) / 2, dh = 2.25;
    box(M.marbleWarm, F, du0 - 0.28, du1 + 0.28, -0.4, 0.16, -0.05, 0.28);
    box(M.poros, F, du0 - 0.18, du0, 0.16, dh, 0, 0.15); box(M.poros, F, du1, du1 + 0.18, 0.16, dh, 0, 0.15);
    box(M.door, F, du0, du1, 0.16, dh, 0, 0.07);
    box(M.woodDark, F, dm - 0.04, dm + 0.04, 0.16, dh, 0, 0.095);
    for (const ry of [0.45, 1.15, 1.85]) box(M.woodDark, F, du0 + 0.06, du1 - 0.06, ry, ry + 0.09, 0, 0.09);
    box(M.woodDark, F, du0 - 0.26, du1 + 0.26, dh, dh + 0.18, 0, 0.20);
    box(M.marbleWarm, F, du0 - 0.32, du1 + 0.32, dh + 0.18, dh + 0.30, 0, 0.34);
    /* Roadside stone bench, shaded cloth/tile awning on timber posts, and terracotta pithoi */
    if (k % 2 === 0 && du1 + 2.6 < W - 0.5) {
      box(M.poros, F, du1 + 0.55, du1 + 2.35, -0.3, 0.46, 0, 0.45);
      box(M.marbleWarm, F, du1 + 0.50, du1 + 2.40, 0.46, 0.55, 0, 0.50);
    }
    if (k % 3 !== 2 && W >= 11) {
      const aw0 = Math.min(du1 + 0.35, W - 4.1), aw1 = Math.min(W - 0.4, aw0 + 3.6);
      if (aw1 - aw0 > 2.2) {
        sheet(k % 2 ? M.red : M.gold, F, [[aw0, H - 0.48, 0.05], [aw1, H - 0.48, 0.05], [aw1, H - 0.88, 1.25], [aw0, H - 0.88, 1.25]]);
        for (const pu of [aw0 + 0.15, aw1 - 0.15]) box(M.woodDark, F, pu - 0.07, pu + 0.07, -0.3, H - 0.85, 1.12, 1.24);
      }
    }
    if (k % 2 === 1 && du0 > 1.5) {
      box(M.red, F, du0 - 0.92, du0 - 0.46, 0.0, 0.66, 0.06, 0.52);
      box(M.gold, F, du0 - 0.82, du0 - 0.56, 0.66, 0.84, 0.16, 0.42);
      box(M.red, F, du0 - 0.88, du0 - 0.50, 0.84, 0.92, 0.10, 0.48);
    }
    roof(F, D, H, D * 0.18, 0.42); }

  /* ---------- the Parthenon. c: its four corners on the ground (the lowest step), from OpenStreetMap, as [NW, NE, SE, SW]; g: the ground the steps stand on ---------- */
  function parthenon(c, g, pics) {
    const [NW, NE, SE, SW] = c, FN = front(NE[0], NE[1], NW[0], NW[1], g), FE = front(SE[0], SE[1], NE[0], NE[1], g), FS = front(SW[0], SW[1], SE[0], SE[1], g), FW = front(NW[0], NW[1], SW[0], SW[1], g), L = FN.W, Wd = FE.W;
    const ST = 0.55, TR = 0.7, Y0 = 3 * ST, CI = 3 * TR + 0.98, HC = 10.43, RC = 0.95, YA = Y0 + HC, AH = 1.35, FH = 1.35, YG = YA + AH + FH, GH = 0.62, PH = 4.2;      // steps, column axis inset, column, architrave, frieze course, cornice, pediment
    box(M.rock, FN, -1.5, L + 1.5, -14, 0, -Wd - 1.5, 1.5);                                                                    // the foundation: deep on the south, where the rock falls away
    for (let i = 0; i < 3; i++) box(M.marble, FN, i * TR, L - i * TR, i * ST, (i + 1) * ST, -Wd + i * TR, -i * TR);
    solid(FN, 0, L, -Wd, 0);
    const colAt = (F, n, i) => F.P(CI + (F.W - 2 * CI) * i / (n - 1), -CI);
    for (const [F, n] of [[FN, 17], [FS, 17], [FE, 8], [FW, 8]]) { for (let i = (n === 17 ? 0 : 1); i < (n === 17 ? n : n - 1); i++) { const [x, z] = colAt(F, n, i); column(x, z, g + Y0, HC, RC); }
      const W = F.W, a = CI - 1.05, b = W - CI + 1.05, sp = (W - 2 * CI) / (n - 1) / 2;
      box(M.marble, F, a, b, YA, YA + AH, -CI - 1.0, -CI + 1.0); box(M.red, F, a, b, YA + AH - 0.02, YA + AH + 0.1, -CI + 1.0, -CI + 1.07);                                  // architrave, and the red band along its top
      box(M.marble, F, a, b, YA + AH, YA + AH + FH, -CI - 1.0, -CI + 0.92);
      for (let k = 0; k <= 2 * (n - 1); k++) { const u = CI + k * sp; box(M.blueDeep, F, u - 0.42, u + 0.42, YA + AH + 0.1, YA + AH + FH, -CI + 0.92, -CI + 1.04); for (const e of [-0.14, 0.14]) box(M.dark, F, u + e - 0.03, u + e + 0.03, YA + AH + 0.16, YA + AH + FH - 0.1, -CI + 1.04, -CI + 1.045);      // triglyphs
        box(M.blue, F, u - 0.42, u + 0.42, YA + AH - 0.14, YA + AH - 0.02, -CI + 1.0, -CI + 1.06);                                                                           // the regula under each
        if (k < 2 * (n - 1)) panel(pics.metope[(k + (n === 8 ? 3 : 0)) % pics.metope.length], F, u + 0.44, u + sp - 0.44, YA + AH + 0.1, YA + AH + FH - 0.04, -CI + 0.96); }      // metopes
      box(M.marble, F, a - 0.75, b + 0.75, YG, YG + GH, -CI - 1.0, -CI + 1.75); box(M.blue, F, a - 0.7, b + 0.7, YG - 0.06, YG, -CI + 1.0, -CI + 1.7); box(M.red, F, a - 0.75, b + 0.75, YG + GH * 0.5, YG + GH * 0.62, -CI + 1.75, -CI + 1.78); }
    // the pediments: a blue field under a raking cornice. Empty in 438
    for (const F of [FE, FW]) { const u0 = CI - 1.8, u1 = F.W - CI + 1.8, um = F.W / 2, y = YG + GH; ext(M.blue, F, [[u0 + 0.8, y], [u1 - 0.8, y], [um, y + PH - 0.3]], -CI + 0.7, -CI + 0.75); ext(M.marble, F, [[u0, y], [u1, y], [um, y + PH]], -CI - 1.0, -CI + 0.7);
      ext(M.marble, F, [[u0 - 0.5, y], [um, y + PH], [um, y + PH + 0.62], [u0 - 0.5, y + 0.6]], -CI + 0.7, -CI + 1.8); ext(M.marble, F, [[u1 + 0.5, y], [u1 + 0.5, y + 0.6], [um, y + PH + 0.62], [um, y + PH]], -CI + 0.7, -CI + 1.8);
      ext(M.gold, F, [[um - 0.9, y + PH + 0.62], [um + 0.9, y + PH + 0.62], [um, y + PH + 2.6]], -CI + 1.1, -CI + 1.3); }                                                    // an ornament on the peak (its form here is a guess)
    { const y = YG + GH, r = PH + 0.5; sheet(M.marbleWarm, FN, [[CI - 2, y, -CI + 1.8], [L - CI + 2, y, -CI + 1.8], [L - CI + 2, y + r, -Wd / 2], [CI - 2, y + r, -Wd / 2]]); sheet(M.marbleWarm, FN, [[CI - 2, y, -Wd + CI - 1.8], [L - CI + 2, y, -Wd + CI - 1.8], [L - CI + 2, y + r, -Wd / 2], [CI - 2, y + r, -Wd / 2]]); }
    // the inner building: porches of six columns at each end, the walls, the frieze round the top of them, the great door to the east
    const PI = CI + 4.6, UE = PI + 5.0, UW = L - PI - 5.0, WI = CI + 4.3, WT = 1.15, YW = Y0 + 0.35, HP = 10.05, YF = YW + HP + 0.9;      // FN runs from the east end to the west: u of the east and west faces of the walls, their inset from the flank, wall thickness
    box(M.marble, FN, PI - 1.5, L - PI + 1.5, Y0, YW, -Wd + WI - 1.2, -WI + 1.2);
    for (const [F] of [[FE], [FW]]) for (let i = 0; i < 6; i++) { const [x, z] = F.P(WI + 0.85 + (F.W - 2 * WI - 1.7) * i / 5, -PI); column(x, z, g + YW, HP, 0.82); }
    box(M.marble, FN, UE, UW, YW, YF + 1.05, -WI - WT, -WI); box(M.marble, FN, UE, UW, YW, YF + 1.05, -Wd + WI, -Wd + WI + WT);                                          // north and south walls
    box(M.marble, FN, UW - WT, UW, YW, YF + 1.05, -Wd + WI, -WI); box(M.marble, FN, UW - 15.5, UW - 15.5 + WT, YW, YF + 1.05, -Wd + WI, -WI);                              // west wall, and the wall between the two rooms
    const DW = 2.45, DH = 9.7, mid = Wd / 2; box(M.marble, FN, UE, UE + WT, YW, YF + 1.05, -Wd + WI, -mid - DW); box(M.marble, FN, UE, UE + WT, YW, YF + 1.05, -mid + DW, -WI); box(M.marble, FN, UE, UE + WT, YW + DH, YF + 1.05, -mid - DW, -mid + DW);
    for (const e of [-1, 1]) { box(M.gold, FN, UE - 0.05, UE + 0.2, YW, YW + DH, -mid + e * DW - 0.12, -mid + e * DW + 0.12); const [hx, hz] = FN.P(UE - 0.1, -mid + e * (DW + 0.1)), leaf = front(hx, hz, ...FN.P(UE - 2.3, -mid + e * (DW + 0.9)), g); box(M.door, leaf, 0, leaf.W, YW, YW + DH, -0.09, 0.09); for (let k = 0; k < 4; k++) box(M.goldDeep, leaf, 0.2, leaf.W - 0.2, YW + 0.5 + k * 2.4, YW + 0.62 + k * 2.4, -0.12, 0.12); }      // the doors stand open
    box(M.dark, FN, UE, UW, YF + 1.05, YF + 1.1, -Wd + WI, -WI);                                                                                                         // a ceiling, so that the room is dark
    // the frieze: a metre high, round the top of the walls and over the porch columns
    for (const [u0, u1, w, k] of [[UE - 5.4, UW + 5.4, -WI + 0.02, 0], [UE - 5.4, UW + 5.4, -Wd + WI - 0.02, 1]]) { const F = k ? front(...FN.P(u1, w), ...FN.P(u0, w), g) : front(...FN.P(u0, w), ...FN.P(u1, w), g);
      for (let i = 0; i < 12; i++) { const a = F.W * i / 12, b = F.W * (i + 1) / 12; box(pics.frieze[i % pics.frieze.length], F, a, b, YF, YF + 1.0, 0, 0.05, { face: true, uv: [a, YF, b - a, 1.0] }); } }
    for (const F of [FE, FW]) { const f = F === FE ? front(...FN.P(PI - 0.85, -Wd + WI), ...FN.P(PI - 0.85, -WI), g) : front(...FN.P(L - PI + 0.85, -WI), ...FN.P(L - PI + 0.85, -Wd + WI), g);
      box(M.marble, f, -0.2, f.W + 0.2, YW + HP, YF, -1.7, 0); for (let i = 0; i < 4; i++) { const a = f.W * i / 4, b = f.W * (i + 1) / 4; box(pics.frieze[(i + 2) % pics.frieze.length], f, a, b, YF, YF + 1.0, -0.05, 0.02, { face: true, uv: [a, YF, b - a, 1.0] }); } box(M.marble, f, -0.2, f.W + 0.2, YF + 1.0, YF + 1.25, -1.7, 0.1);
      for (const u of [-0.2, f.W - 0.9]) box(M.marble, f, u, u + 1.1, YW + HP, YF + 1.25, -6.2, 0); }
    // a carvers' scaffold before the west pediment
    { const F = FW, y = YG + GH; for (let u = 6; u <= F.W - 6; u += 4.3) box(M.wood, F, u - 0.09, u + 0.09, 0, y + 2.6, 0.9, 1.08); for (const yy of [y - 0.2, y + 1.6]) box(M.wood, F, 5.5, F.W - 5.5, yy, yy + 0.12, -0.6, 1.3); for (let u = 6; u < F.W - 8; u += 8.6) ext(M.woodDark, F, [[u, 0.3], [u + 0.16, 0.3], [u + 4.46, y - 0.2], [u + 4.3, y - 0.2]], 1.0, 1.1); }
    return { FN, FE, FS, FW, L, Wd, Y0, YW, YF, door: FN.P(UE, -mid), inside: FN.P(UE + 21, -mid), UE, mid, cellaY: g + YW, eastMid: FE.P(Wd / 2, 0), top: g + YG + GH + PH };
  }
  /* ---------- Athena Parthenos, on her base, looking out of the east door. x, z: the middle of the base; ang: the way she looks; k: her size (1 = about 11.5 m with the base) ---------- */
  function parthenos(x, z, ang, y, k = 1) { const g = new THREE.Group(), add = (geo, m, px, py, pz, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.scale.set(sx, sy, sz); g.add(o); return o; };
    const cyl = (rt, rb, h, n = 18) => new THREE.CylinderGeometry(rt, rb, h, n), sph = new THREE.SphereGeometry(1, 20, 14), fold = M.gold.clone(); fold.flatShading = true;
    add(new THREE.BoxGeometry(8.0, 1.3, 4.0), M.marbleWarm, 0, 0.65, 0); add(new THREE.BoxGeometry(7.6, 0.75, 0.1), M.goldDeep, 0, 0.75, 2.02);                                // the base, with its gilded relief (the birth of Pandora, says Pliny)
    add(cyl(1.1, 1.5, 5.4, 16), fold, 0, 1.3 + 2.7, 0); add(cyl(1.15, 1.25, 1.5, 16), fold, 0, 1.3 + 5.4 + 0.5, 0); add(cyl(0.95, 1.2, 1.6, 16), M.gold, 0, 1.3 + 7.2, 0);                  // the dress, its overfold, the breast
    add(cyl(1.0, 1.25, 0.5, 16), M.goldDeep, 0, 1.3 + 8.0, 0.02); add(sph, M.ivory, 0, 1.3 + 7.75, 0.92, 0.26, 0.26, 0.1);                                                    // the aegis, and Medusa's head in ivory on it
    add(cyl(0.3, 0.36, 0.6), M.ivory, 0, 1.3 + 8.5, 0); add(sph, M.ivory, 0, 1.3 + 9.2, 0.03, 0.52, 0.62, 0.56);                                                              // neck and face
    add(new THREE.SphereGeometry(1, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), M.gold, 0, 1.3 + 9.28, -0.04, 0.62, 0.66, 0.66);                                             // the helmet
    for (const [cx, h] of [[0, 1.0], [-0.42, 0.7], [0.42, 0.7]]) { add(new THREE.BoxGeometry(0.1, h, 1.1), M.gold, cx, 1.3 + 9.9 + h / 2, -0.15); add(sph, M.goldDeep, cx, 1.3 + 9.95, 0.3, 0.13, 0.2, 0.22); }      // the sphinx in the middle, a creature at each side, and their crests
    // her right arm forward, the Nike standing on the hand, and the column that the copy sets under it
    const arm = add(cyl(0.2, 0.26, 1.9), M.ivory, -1.25, 1.3 + 7.0, 0.25); arm.rotation.z = -0.12; const fore = add(cyl(0.16, 0.2, 1.7), M.ivory, -1.55, 1.3 + 6.05, 1.0); fore.rotation.x = 1.25;
    add(cyl(0.3, 0.34, 4.7), M.marbleWarm, -1.6, 1.3 + 2.35 + 1.3, 1.75); add(cyl(0.14, 0.2, 1.3, 10), M.gold, -1.6, 1.3 + 6.95, 1.75); add(sph, M.ivory, -1.6, 1.3 + 7.75, 1.75, 0.13, 0.15, 0.13);
    for (const e of [-1, 1]) { const w = add(new THREE.BoxGeometry(0.75, 0.3, 0.05), M.gold, -1.6 + e * 0.42, 1.3 + 7.45, 1.65); w.rotation.z = e * 0.7; }
    // at her left: the shield on its rim, the snake inside it, the spear
    const sh = add(cyl(2.3, 2.3, 0.16, 36), M.gold, 1.95, 1.3 + 2.3, 0.75); sh.rotation.x = Math.PI / 2; sh.rotation.z = 0.0; sh.rotation.y = -0.35; const boss = add(sph, M.goldDeep, 1.92, 1.3 + 2.3, 0.95, 0.5, 0.5, 0.16); boss.rotation.y = -0.35;
    add(cyl(0.16, 0.24, 1.9), M.ivory, 1.3, 1.3 + 6.6, 0.2).rotation.z = 0.18; for (let i = 0; i < 4; i++) { const t = add(new THREE.TorusGeometry(0.75 - i * 0.14, 0.17, 8, 18), M.goldDeep, 1.2, 1.3 + 0.2 + i * 0.36, 0.2); t.rotation.x = Math.PI / 2; } add(sph, M.goldDeep, 1.2, 1.3 + 1.9, 0.45, 0.2, 0.26, 0.32);
    const sp = add(cyl(0.05, 0.06, 11.2, 8), M.gold, 2.65, 1.3 + 5.5, -0.2); sp.rotation.z = -0.06;
    g.position.set(x, y, z); g.rotation.y = ang; g.scale.setScalar(k); scene.add(g); return g; }
  /* ---------- the great bronze Athena of Phidias, in the open: armed, on a tall base. Its pose is not known: this one stands plainly ---------- */
  function bronzeAthena(x, z, ang, y) { const g = new THREE.Group(), add = (geo, m, px, py, pz) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.castShadow = o.receiveShadow = true; g.add(o); return o; }, cyl = (rt, rb, h, n = 16) => new THREE.CylinderGeometry(rt, rb, h, n);
    add(new THREE.BoxGeometry(6.4, 1.95, 6.4), M.poros, 0, -0.825, 0); add(new THREE.BoxGeometry(5.8, 0.32, 5.8), M.marbleWarm, 0, 0.31, 0); add(new THREE.BoxGeometry(5.2, 0.32, 5.2), M.marbleWarm, 0, 0.63, 0);
    add(new THREE.BoxGeometry(4.8, 0.22, 4.8), M.marble, 0, 0.9, 0); add(new THREE.BoxGeometry(4.4, 1.15, 4.4), M.marbleWarm, 0, 1.585, 0); add(new THREE.BoxGeometry(4.9, 0.24, 4.9), M.marble, 0, 2.28, 0);
    const b0 = 2.4, b = M.bronze.clone(); b.flatShading = true; add(cyl(0.72, 1.0, 4.2), b, 0, b0 + 2.1, 0); add(cyl(0.6, 0.78, 1.7), M.bronze, 0, b0 + 5.0, 0); add(new THREE.SphereGeometry(0.38, 14, 10), M.bronze, 0, b0 + 6.35, 0);
    add(new THREE.BoxGeometry(0.08, 0.7, 0.8), M.bronze, 0, b0 + 6.95, -0.05); const sh = add(cyl(1.15, 1.15, 0.1, 24), M.bronze, 0.95, b0 + 3.9, 0.3); sh.rotation.x = Math.PI / 2; sh.rotation.y = -0.4; add(cyl(0.035, 0.04, 8.6, 6), M.bronze, -0.95, b0 + 4.3, 0.3); add(new THREE.ConeGeometry(0.1, 0.5, 6), M.gold, -0.95, b0 + 8.85, 0.3);
    g.position.set(x, y, z); g.rotation.y = ang; scene.add(g); rounds.push({ x, z, r: 3.9 }); return g; }
  /* ---------- an altar: a long block on steps ---------- */
  function altar(x, z, ang, y, W = 9, D = 3.4, H = 1.5) { const F = frontAt(x, z, ang, W, y); for (let i = 0; i < 2; i++) box(M.poros, F, -0.6 * (2 - i), W + 0.6 * (2 - i), -2, 0.25 * (i + 1), -D - 0.6 * (2 - i), 0.6 * (2 - i)); box(M.marbleWarm, F, 0, W, 0.5, 0.5 + H, -D, 0); box(M.marbleWarm, F, -0.15, W + 0.15, 0.5 + H, 0.5 + H + 0.2, -D - 0.15, 0.15); solid(F, -1.2, W + 1.2, -D - 1.2, 1.2); return F; }
  /* ---------- a herm: a square marble pillar on a stepped base, with side bosses and a bearded head ---------- */
  function herm(x, z, ang, y) { const F = frontAt(x, z, ang, 0.36, y); box(M.poros, F, -0.18, 0.54, -0.6, 0.16, -0.48, 0.18); box(M.marbleWarm, F, -0.08, 0.44, 0.16, 0.30, -0.38, 0.08);
    box(M.marbleWarm, F, 0, 0.36, 0.30, 1.62, -0.32, 0); box(M.marble, F, -0.09, 0.45, 1.24, 1.38, -0.22, -0.10);
    const [hx, hz] = F.P(0.18, -0.16), h = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), M.marbleWarm), bd = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 8), M.marble);
    h.position.set(hx, y + 1.78, hz); bd.position.set(hx + F.nx * 0.07, y + 1.64, hz + F.nz * 0.07); bd.rotation.x = Math.PI; h.castShadow = bd.castShadow = true; scene.add(h, bd); rounds.push({ x, z, r: 0.55 }); }
  /* ---------- a stele: an upright marble slab on steps, crowned with a small pediment and painted band ---------- */
  function stele(x, z, ang, y, k = 0) { const W = 0.64 + (k % 3) * 0.1, H = 1.85 + (k % 3) * 0.28, F = frontAt(x, z, ang, W, y), cM = k % 2 ? M.red : M.blue;
    box(M.poros, F, -0.22, W + 0.22, -0.7, 0.18, -0.46, 0.22); box(M.marbleWarm, F, -0.1, W + 0.1, 0.18, 0.34, -0.34, 0.1);
    box(M.marble, F, 0, W, 0.34, 0.34 + H, -0.22, 0); box(cM, F, 0.05, W - 0.05, 0.34 + H - 0.22, 0.34 + H - 0.08, -0.23, 0.015);
    ext(M.marbleWarm, F, [[-0.06, 0.34 + H], [W + 0.06, 0.34 + H], [W / 2, 0.34 + H + 0.28]], -0.26, 0.04); rounds.push({ x, z, r: 0.6 }); }
  /* ---------- a boundary stone (horos) of the Agora ---------- */
  function horos(x, z, ang, y) { const F = frontAt(x, z, ang, 0.42, y); box(M.poros, F, -0.1, 0.52, -0.5, 0.12, -0.34, 0.1); box(M.marbleWarm, F, 0, 0.42, 0.12, 1.08, -0.22, 0); box(M.red, F, 0.04, 0.38, 0.88, 0.94, -0.23, 0.01); rounds.push({ x, z, r: 0.45 }); }
  /* ---------- two bronze men on one base, striding: the Tyrant-slayers (their attitudes are roughly those of the Roman copies; their place here is approximate) ---------- */
  function tyrannicides(x, z, ang, y) { const g = new THREE.Group(), add = (geo, px, py, pz, rx = 0, rz = 0, m = M.bronze) => { const o = new THREE.Mesh(geo, m); o.position.set(px, py, pz); o.rotation.set(rx, 0, rz); o.castShadow = true; g.add(o); return o; };
    add(new THREE.BoxGeometry(2.6, 1.3, 1.5), 0, 0.65, 0, 0, 0, M.marbleWarm);
    for (const e of [-1, 1]) { const x0 = e * 0.6; add(new THREE.CylinderGeometry(0.17, 0.15, 0.75, 10), x0, 1.3 + 1.25, 0); add(new THREE.SphereGeometry(0.13, 10, 8), x0, 1.3 + 1.78, 0.02); for (const s of [-1, 1]) add(new THREE.CylinderGeometry(0.075, 0.06, 0.92, 8), x0 + s * 0.09, 1.3 + 0.46, s * 0.24, s * 0.5);
      add(new THREE.CylinderGeometry(0.05, 0.045, 0.7, 8), x0 - 0.2, 1.3 + (e < 0 ? 1.85 : 1.45), 0.2 * e, e < 0 ? 0.5 : -1.3); add(new THREE.CylinderGeometry(0.05, 0.045, 0.7, 8), x0 + 0.2, 1.3 + 1.3, -0.25, 0.9); add(new THREE.BoxGeometry(0.03, 0.03, 0.6), x0 - 0.2, 1.3 + (e < 0 ? 2.25 : 1.5), e < 0 ? 0.55 : 0.65); }
    g.position.set(x, y, z); g.rotation.y = ang; scene.add(g); rounds.push({ x, z, r: 1.7 }); }
  /* ---------- the gate of the Acropolis before the Propylaia (the Old Propylon). Of the real one little is left and its plan is argued over: this is a plain gatehouse,
       a passage between two solid wings behind four columns, under a low roof. F: a front across the way, looking down the ramp; the passage is at its middle ---------- */
  function gate(x, z, ang, y, W = 17, pass = 3.2) { const F = frontAt(x, z, ang, W, y), D = 5.2, H = 7.4, m = W / 2;
    box(M.marbleWarm, F, -0.5, W + 0.5, -4, 0.3, -D - 0.5, 1.6); for (const [a, b] of [[0, m - pass], [m + pass, W]]) { box(M.poros, F, a, b, 0.3, H, -D, -1.4); solid(F, a, b, -D, -1.4); }
    for (const u of [m - pass - 2.6, m - pass + 0.1, m + pass - 0.1, m + pass + 2.6]) { const [cx, cz] = F.P(u, -0.5); column(cx, cz, y + 0.3, H - 0.3, 0.44, M.marbleWarm); }
    box(M.marbleWarm, F, 0, W, H, H + 0.6, -D, 0); box(M.blue, F, 0, W, H + 0.6, H + 1.0, -D + 0.05, -0.05); box(M.red, F, -0.1, W + 0.1, H + 1.0, H + 1.1, -D - 0.1, 0.1);
    ext(M.marbleWarm, F, [[0, H + 1.1], [W, H + 1.1], [m, H + 2.9]], -0.5, -0.1); ext(M.blue, F, [[1.2, H + 1.2], [W - 1.2, H + 1.2], [m, H + 2.6]], -0.1, -0.05); roof(F, D, H + 1.1, 1.8, 0.4); return F; }
  /* ---------- the citadel wall along a line of points: built retaining walls crowning sheer stepped carved limestone Acropolis cliffs ---------- */
  function wall(p, top, foot, skip, mat = M.poros, cliff = false) { for (let i = 0; i < p.length - 1; i++) { const a = p[i], b = p[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); if (L < 0.4 || skip((a[0] + b[0]) / 2, (a[1] + b[1]) / 2)) continue; const F = front(a[0], a[1], b[0], b[1], 0), t = Math.max(top(a[0], a[1]), top(b[0], b[1])) + 1.2, f = Math.min(foot(a[0], a[1]), foot(b[0], b[1])) - 1.5;
      box(mat, F, -0.35, L + 0.35, f, t, -0.85, 0.85); box(M.marble, F, -0.45, L + 0.45, t, t + 0.35, -0.98, 0.98);
      if (cliff) {
        /* Massive sheer stepped limestone precipice plunging straight down from the retaining wall (reads unmistakably as the Acropolis rock from the Agora!) */
        const cf = f - 36 - (i % 3) * 5.0, ct = Math.min(t - 1.4, f + 5.0 + (i % 2) * 1.8), wOut = 4.5 + (i % 4) * 1.4;
        box(M.rock, F, -0.9, L + 0.9, cf, ct, -0.6, wOut);
        if (L > 2.2) {
          box(M.rock, F, L * 0.06, L * 0.94, cf - 8, (cf + ct) * 0.56, 0.5, wOut + 4.4);
          box(M.poros, F, L * 0.12, L * 0.88, ct - 4.5, t - 0.6, -0.4, wOut * 0.42);
        }
        /* Embedded marble column drums of the Older Parthenon in the north citadel wall (FINDINGS.md Section E) */
        if (a[1] < 405 && b[1] < 405 && a[0] > 270 && a[0] < 380 && L > 3.5) {
          for (let u = 1.2; u < L - 1.0; u += 2.8) box(M.marble, F, u - 0.62, u + 0.62, t - 2.6, t - 1.0, 0.65, 1.15);
        }
      } } }
  return { M, front, frontAt, ext, box, sheet, panel, column, flush, blocked, solids, rounds, obb, sides, canvasTex, stoa, hall, fountainHouse, templeSmall, enclosure, tholos, house, parthenon, parthenos, bronzeAthena, altar, herm, stele, horos, tyrannicides, votiveStatue, ikria, courtyardWall, cityGate, gate, wall };
}
