/* The named buildings of the errand across Antwerp, about 1612. What each rests on, and how far, is set out in research/FINDINGS.md ("Buildings").
   Every one is built in its own measure and then set down on the real plan: x to the right, y up, z towards whoever faces it, in metres.
   Heights and proportions are read by eye off the photographs and prints in research/ref/ against the few figures the sources give; none is surveyed. */
import * as BGU from 'three/addons/utils/BufferGeometryUtils.js';
export function makeFronts({ THREE, scene, tex }) {
  const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o), DS = THREE.DoubleSide;
  const M = { stone: lam({ map: tex.stone, color: '#f1eee4' }), stoneIn: lam({ map: tex.stone, color: '#e6e0d0', side: DS }), stoneWarm: lam({ map: tex.stone, color: '#e2c79a' }), stoneGrey: lam({ map: tex.stone, color: '#a9a394' }), pier: lam({ color: '#efe9da' }), brick: lam({ map: tex.brick, color: '#ffffff' }), brickDark: lam({ map: tex.brick, color: '#b89a8a' }),
    slate: lam({ map: tex.slate, color: '#ffffff', side: DS }), tile: lam({ map: tex.slate, color: '#e08a5a', side: DS }), lead: lam({ color: '#7d8894', side: DS }), glass: basic({ color: '#1a222c', side: DS }), glassLit: basic({ color: '#fff3d2', side: DS }), glassCool: basic({ color: '#cfe2f2', side: DS }),
    wood: lam({ color: '#5a3c22' }), woodDark: lam({ color: '#2e1f14' }), oak: lam({ color: '#7a5a34' }), gold: lam({ color: '#e8b83a', emissive: '#8a6410', emissiveIntensity: 0.6 }), iron: lam({ color: '#22242a' }), white: lam({ color: '#f4efe2' }), marbleB: lam({ color: '#1e1c20' }), marbleR: lam({ color: '#8a3a2c' }),
    red: lam({ color: '#b02a22' }), green: lam({ color: '#3e6a3c' }), leaf: lam({ color: '#3f7a3a' }), leafDark: lam({ color: '#2c5a30' }), earth: lam({ color: '#8a6e4a' }), dark: basic({ color: '#0e0c0a', side: DS }), floor: lam({ map: tex.flags, color: '#ffffff' }), shaft: basic({ color: '#fff0c0', transparent: true, opacity: 0.04, depthWrite: false, side: DS, blending: THREE.AdditiveBlending, fog: false }) };
  const TS = 3.2;      // a texture tile is this many metres
  // things are gathered by material, in the building's own measure, and merged into one mesh each when it is set down
  function builder() {
    const parts = new Map(), tmp = new THREE.Object3D(), loose = [];
    const add = (mat, geo, x = 0, y = 0, z = 0, ry = 0, rx = 0, rz = 0) => { tmp.position.set(x, y, z); tmp.rotation.set(rx, ry, rz, 'YXZ'); tmp.updateMatrix(); const g = geo.index ? geo.toNonIndexed() : geo; g.applyMatrix4(tmp.matrix); for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k); let a = parts.get(mat); if (!a) parts.set(mat, a = []); a.push(g); };
    const B = { add,
      box: (mat, w, h, d, x, y, z, ry = 0) => add(mat, new THREE.BoxGeometry(w, h, d), x, y + h / 2, z, ry),                         // y is its foot
      cyl: (mat, rt, rb, h, x, y, z, seg = 12, ry = 0) => add(mat, new THREE.CylinderGeometry(rt, rb, h, seg), x, y + h / 2, z, ry),
      // a flat wall standing in the plane through (x, z) turned ry, with openings: outline and holes as [[u, y]...] lists
      wall: (mat, pts, holes, x, z, ry) => { const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], p[1]))); for (const h of holes || []) s.holes.push(new THREE.Path(h.map(p => new THREE.Vector2(p[0], p[1])))); add(mat, new THREE.ShapeGeometry(s), x, 0, z, ry); },
      // a lid: a flat shape lying at height y, outline as [[x, z]...]
      lid: (mat, pts, y) => { const s = new THREE.Shape(pts.map(p => new THREE.Vector2(p[0], -p[1]))); add(mat, new THREE.ShapeGeometry(s), 0, y, 0, 0, -Math.PI / 2); },
      // a sloping sheet through four corners [x, y, z]
      sheet: (mat, c) => { const g = new THREE.BufferGeometry(), p = []; for (const k of [0, 1, 2, 0, 2, 3]) p.push(...c[k]); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(new Array(12).fill(0), 2)); g.computeVertexNormals(); add(mat, g); },
      loose: m => { loose.push(m); return m; },
      done(px, pz, th, y = 0) { const grp = new THREE.Group(); for (const [mat, list] of parts) { const g = BGU.mergeGeometries(list, false); worldUV(g); const m = new THREE.Mesh(g, mat); m.matrixAutoUpdate = false; grp.add(m); } for (const m of loose) grp.add(m); grp.position.set(px, y, pz); grp.rotation.y = th; grp.updateMatrixWorld(true); scene.add(grp); return grp; } };
    return B;
  }
  function worldUV(g) { const p = g.attributes.position, n = g.attributes.normal, uv = new Float32Array(p.count * 2); for (let i = 0; i < p.count; i++) { const ax = Math.abs(n.getX(i)), ay = Math.abs(n.getY(i)), az = Math.abs(n.getZ(i)); let u, v; if (ay >= ax && ay >= az) { u = p.getX(i); v = p.getZ(i); } else if (ax > az) { u = p.getZ(i); v = p.getY(i); } else { u = p.getX(i); v = p.getY(i); } uv[i * 2] = u / TS; uv[i * 2 + 1] = v / TS; } g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); }
  // the outline of a pointed opening: foot at y0, springing at ys, point at yp, half-width hw, centred on c
  const pointed = (c, hw, y0, ys, yp, n = 6) => { const o = [[c - hw, y0], [c + hw, y0], [c + hw, ys]]; for (let i = 1; i < n; i++) { const t = i / n; o.push([c + hw * Math.cos(t * Math.PI / 2) ** 0.8, ys + (yp - ys) * Math.sin(t * Math.PI / 2)]); } o.push([c, yp]); for (let i = n - 1; i > 0; i--) { const t = i / n; o.push([c - hw * Math.cos(t * Math.PI / 2) ** 0.8, ys + (yp - ys) * Math.sin(t * Math.PI / 2)]); } o.push([c - hw, ys]); return o; };
  const round = (c, hw, y0, ys, n = 8) => { const o = [[c - hw, y0], [c + hw, y0]]; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI; o.push([c + hw * Math.cos(a), ys + hw * Math.sin(a)]); } return o; };
  // a frame: where a building stands. u to the right as you face it, w out towards you
  function frame(ox, oz, nx, nz) { const L = Math.hypot(nx, nz); nx /= L; nz /= L; const dx = nz, dz = -nx; return { ox, oz, nx, nz, dx, dz, th: Math.atan2(nx, nz), P: (u, w) => [ox + dx * u + nx * w, oz + dz * u + nz * w], local: (x, z) => [(x - ox) * dx + (z - oz) * dz, (x - ox) * nx + (z - oz) * nz] }; }
  const blockers = [], rounds = [];      // blockers: functions (x, z) -> true where one may not walk
  const blocked = (x, z) => blockers.some(f => f(x, z)) || rounds.some(r => Math.hypot(x - r.x, z - r.z) < r.r);

  /* ================= the cathedral of Our Lady =================
     Set on the real footprint's axis (OpenStreetMap): its own x runs from the west front eastwards down the nave, z to the south. The plan is squared up:
     a nave with three aisles on either side (seven in all), a transept, a choir with its ambulatory, two west towers of which only the northern was finished.
     Inside: piers, pointed arcades, and the light from the upper windows. See FINDINGS.md for what is measured and what is by eye. */
  function cathedral(ox, oz, ax, az, o = {}) {
    const th = Math.atan2(-az, ax), b = builder(), W = 30, TW = 14, XT0 = 64, XT1 = 78, XE = 106, HA = 18, HN = 28, NV = 6.5, AIS = [6.5, 14, 22], BAY = 50 / 7, BC = 7;
    const toW = (x, z) => [ox + ax * x - az * z, oz + az * x + ax * z], toL = (X, Z) => [(X - ox) * ax + (Z - oz) * az, -(X - ox) * az + (Z - oz) * ax];
    const bays = []; for (let x = TW + BAY / 2; x < XT0 - 1; x += BAY) bays.push(x); const cbays = []; for (let x = XT1 + BC / 2; x < XE; x += BC) cbays.push(x);
    const NS = [-1, 1];
    // ---- outer walls of the aisles, with their windows as real openings, and buttresses
    for (const s of NS) { const run = (x0, x1, cs) => { b.wall(M.stoneIn, [[x0, 0], [x1, 0], [x1, HA], [x0, HA]], cs.map(c => pointed(c, 1.5, 4.5, 12, 15.5)), 0, s * W, 0); for (const c of cs) { b.box(M.stone, 1.1, HA + 2.5, 2.2, c - BAY / 2, 0, s * (W + 1.1)); b.box(M.stone, 0.24, 11, 0.24, c, 4.5, s * W); b.box(M.lead, 3, 0.12, 0.1, c, 8, s * W); b.box(M.lead, 3, 0.12, 0.1, c, 11.5, s * W); } };
      run(TW, XT0, bays); run(XT1, XE - 12, cbays.filter(c => c < XE - 13)); }
    // ---- the transept: its two end walls with a great window each; the south one has the door to the Groenkerkhof
    for (const s of NS) { const zc = s * (W + 6), xm = (XT0 + XT1) / 2, holes = [pointed(xm, 3.4, 11, 21, 27)]; if (s > 0 || o.northDoor) holes.push(pointed(xm, 2.2, 0, 4.2, 6.6));
      b.wall(M.stoneIn, [[XT0, 0], [XT1, 0], [XT1, HN + 2], [xm, HN + 9], [XT0, HN + 2]], holes, 0, zc, 0); for (const u of [-1.2, 0, 1.2]) b.box(M.stone, 0.22, 15, 0.22, xm + u * 1.9, 11, zc); for (const y of [15, 19]) b.box(M.lead, 6.6, 0.12, 0.1, xm, y, zc);
      for (const x of [XT0, XT1]) { b.wall(M.stoneIn, [[W, 0], [W + 6, 0], [W + 6, HN + 2], [W, HN + 2]], [], x, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2); b.box(M.stone, 2, HN + 6, 2, x, 0, zc); } }
    // ---- the high walls of the nave, the transept and the choir: arcades below, the clear windows above
    const high = (x0, x1, cs, z) => b.wall(M.stoneIn, [[x0, 0], [x1, 0], [x1, HN + 2], [x0, HN + 2]], [...cs.map(c => pointed(c, BAY / 2 - 0.9, 0, 9.5, 14.5)), ...cs.map(c => pointed(c, 1.9, 19.2, 23.5, 26.6))], 0, z, 0);
    for (const s of NS) { high(TW, XT0, bays, s * NV); high(XT1, XE, cbays, s * NV);
      for (const x of [XT0, XT1]) { const zs = [10.25, 18, 26]; b.wall(M.stoneIn, [[NV, 0], [W + 6, 0], [W + 6, HN + 2], [NV, HN + 2]], [...zs.map(c => pointed(c, 2.85, 0, 9.5, 14.5)).filter((_, i) => !(x === XT1 && s > 0 && i === 2 && o.altarBay)), ...zs.map(c => pointed(c, 1.7, 19.2, 23.5, 26.6))], x, 0, s > 0 ? -Math.PI / 2 : Math.PI / 2); } }
    // ---- the lesser arcades between the aisles
    for (const s of NS) for (const zz of AIS.slice(1)) { const run = (x0, x1, cs) => b.wall(M.stoneIn, [[x0, 0], [x1, 0], [x1, HA], [x0, HA]], cs.map(c => pointed(c, BAY / 2 - 0.8, 0, 9.5, 14.5)), 0, s * zz, 0); run(TW, XT0, bays); run(XT1, XE - 12, cbays.filter(c => c < XE - 13)); }
    // ---- the piers
    const piers = []; const pier = (x, z, r) => { b.cyl(M.pier, r, r, HA - 3.5, x, 0, z, 12); b.cyl(M.stoneGrey, r * 1.18, r * 1.25, 1.0, x, 0, z, 8); piers.push([x, z, r + 0.35]); };
    for (const s of NS) for (const zz of AIS) { for (let x = TW; x <= XT0 + 0.1; x += BAY) pier(x, s * zz, zz === NV ? (x > XT0 - 1 ? 1.4 : 0.95) : 0.75); for (let x = XT1; x <= XE + 0.1; x += BC) if (zz === NV || x < XE - 12) pier(x, s * zz, zz === NV ? (x < XT1 + 1 ? 1.4 : 0.95) : 0.75); }
    for (const p of piers) if (Math.abs(p[1]) === NV) b.cyl(M.pier, 0.3, 0.3, HN - HA + 6, p[0], HA - 4, p[1] * 0.985, 6);
    // ---- vaults: the nave's and the transept's pointed, with ribs; the aisles' flat above their arches
    const vault = (x0, x1, z0, z1, alongX) => { const mid = alongX ? (z0 + z1) / 2 : (x0 + x1) / 2, yb = HN - 1.2, yt = HN + 2.4;
      if (alongX) { b.sheet(M.stoneIn, [[x0, yb, z0], [x1, yb, z0], [x1, yt, mid], [x0, yt, mid]]); b.sheet(M.stoneIn, [[x0, yb, z1], [x1, yb, z1], [x1, yt, mid], [x0, yt, mid]]); for (let x = x0; x <= x1 + 0.1; x += BAY) for (const [za, zb] of [[z0, mid], [z1, mid]]) { const L = Math.hypot(zb - za, yt - yb); b.add(M.stoneGrey, new THREE.BoxGeometry(0.3, 0.3, L), x, (yb + yt) / 2 - 0.2, (za + zb) / 2, 0, -Math.atan2(yt - yb, zb - za)); } b.box(M.stoneGrey, x1 - x0, 0.3, 0.3, (x0 + x1) / 2, yt - 0.45, mid); }
      else { b.sheet(M.stoneIn, [[x0, yb, z0], [x0, yb, z1], [mid, yt, z1], [mid, yt, z0]]); b.sheet(M.stoneIn, [[x1, yb, z0], [x1, yb, z1], [mid, yt, z1], [mid, yt, z0]]); b.box(M.stoneGrey, 0.3, 0.3, z1 - z0, mid, yt - 0.45, (z0 + z1) / 2); } };
    vault(TW, XT0, -NV, NV, true); vault(XT1, XE, -NV, NV, true); vault(XT0, XT1, -W - 6, -NV, false); vault(XT0, XT1, NV, W + 6, false); vault(XT0, XT1, -NV, NV, true);
    for (const s of NS) { b.lid(M.stoneIn, [[TW, s * NV], [XT0, s * NV], [XT0, s * W], [TW, s * W]], HA); b.lid(M.stoneIn, [[XT1, s * NV], [XE - 12, s * NV], [XE - 12, s * W], [XT1, s * W]], HA); }
    // ---- roofs outside: slate over the high vessel and the transept, lead-grey lean-tos over the aisles
    const roof = (x0, x1, z0, z1, alongX, yb, yt) => { if (alongX) { const m = (z0 + z1) / 2; b.sheet(M.slate, [[x0, yb, z0 - 0.6], [x1, yb, z0 - 0.6], [x1, yt, m], [x0, yt, m]]); b.sheet(M.slate, [[x0, yb, z1 + 0.6], [x1, yb, z1 + 0.6], [x1, yt, m], [x0, yt, m]]); } else { const m = (x0 + x1) / 2; b.sheet(M.slate, [[x0 - 0.6, yb, z0], [x0 - 0.6, yb, z1], [m, yt, z1], [m, yt, z0]]); b.sheet(M.slate, [[x1 + 0.6, yb, z0], [x1 + 0.6, yb, z1], [m, yt, z1], [m, yt, z0]]); } };
    roof(TW - 2, XE + 2, -NV, NV, true, HN + 2, HN + 10); roof(XT0, XT1, -W - 6, W + 6, false, HN + 2, HN + 9);
    for (const s of NS) { b.sheet(M.lead, [[TW, HA + 2.2, s * NV], [XT0, HA + 2.2, s * NV], [XT0, HA + 0.2, s * (W + 0.8)], [TW, HA + 0.2, s * (W + 0.8)]]); b.sheet(M.lead, [[XT1, HA + 2.2, s * NV], [XE - 12, HA + 2.2, s * NV], [XE - 12, HA + 0.2, s * (W + 0.8)], [XT1, HA + 0.2, s * (W + 0.8)]]); }
    // ---- the east end: the choir closes in a half round, the ambulatory and its chapels go round it lower down
    { const seg = 9, R = W, cx = XE - 12, pts = []; for (let i = 0; i <= seg; i++) { const a = -Math.PI / 2 + i / seg * Math.PI; pts.push([cx + Math.cos(a) * R * 0.92, Math.sin(a) * R]); }
      for (let i = 0; i < seg; i++) { const p = pts[i], q = pts[i + 1], L = Math.hypot(q[0] - p[0], q[1] - p[1]), ry = -Math.atan2(q[1] - p[1], q[0] - p[0]); b.wall(M.stoneIn, [[0, 0], [L, 0], [L, HA], [0, HA]], [pointed(L / 2, 1.5, 4.5, 12, 15.5)], p[0], p[1], ry); b.box(M.stone, 1.2, HA + 2.5, 2.4, p[0], 0, p[1], ry + Math.PI / 4); }
      b.lid(M.stoneIn, [[cx, -W], ...pts, [cx, W]], HA); b.lid(M.lead, [[cx, -W], ...pts, [cx, W]], HA + 0.3);
      const hp = []; for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + i / 6 * Math.PI; hp.push([XE + Math.cos(a) * NV, Math.sin(a) * NV]); }
      for (let i = 0; i < 6; i++) { const p = hp[i], q = hp[i + 1], L = Math.hypot(q[0] - p[0], q[1] - p[1]), ry = -Math.atan2(q[1] - p[1], q[0] - p[0]); b.wall(M.stoneIn, [[0, 0], [L, 0], [L, HN + 2], [0, HN + 2]], [pointed(L / 2, L / 2 - 0.5, 0, 9.5, 14), pointed(L / 2, 1.2, 18, 23.5, 26.6)], p[0], p[1], ry); }
      b.lid(M.stoneIn, hp, HN + 1); b.add(M.slate, new THREE.ConeGeometry(NV + 0.8, 8, 12, 1, true, 0, Math.PI), XE, HN + 6, 0, 0); }
    // ---- the crossing tower with its bulb, as the sixteenth century left it
    { const xm = (XT0 + XT1) / 2; b.cyl(M.stone, 5.2, 5.6, 7, xm, HN + 8, 0, 8); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8; b.box(M.glass, 1.7, 4.4, 0.1, xm + Math.sin(a) * 5.2, HN + 9.2, Math.cos(a) * 5.2, a); }
      const pr = [[5.4, 0], [5.9, 1.2], [5.2, 2.6], [3.6, 4.0], [2.1, 5.0], [1.3, 6.2], [1.5, 7.2], [0.9, 8.4], [0.2, 10.5], [0.01, 12]].map(p => new THREE.Vector2(p[0], p[1])); b.add(M.lead, new THREE.LatheGeometry(pr, 16), xm, HN + 15, 0); b.box(M.gold, 0.12, 1.8, 0.12, xm, HN + 27, 0); b.box(M.gold, 0.9, 0.12, 0.12, xm, HN + 27.9, 0); }
    // ---- the west front: the great door and window between the towers
    { b.wall(M.stoneIn, [[-TW - 1, 0], [TW + 1, 0], [TW + 1, HN + 6], [0, HN + 13], [-TW - 1, HN + 6]], [pointed(0, 3.0, 0, 6.2, 9.4), pointed(0, 4.4, 13, 24, 30)], 0.2, 0, -Math.PI / 2);
      for (const u of [-2.2, 0, 2.2]) b.box(M.stone, 0.26, 16.5, 0.26, 0.2, 13, u); for (const y of [17.5, 22]) b.box(M.lead, 0.1, 0.14, 8.6, 0.2, y, 0);
      // the porch: a deep pointed archway with a gable over it
      for (const s of NS) { b.box(M.stone, 2.6, 11, 1.5, -1.1, 0, s * 4.1); b.cyl(M.stone, 0.1, 0.55, 5, -1.6, 11, s * 4.1, 6); } b.wall(M.stone, [[-4.9, 0], [4.9, 0], [4.9, 9.4], [0, 15], [-4.9, 9.4]], [pointed(0, 3.2, -0.1, 6.3, 9.6)], -2.35, 0, -Math.PI / 2);
      for (const s of NS) { b.box(M.oak, 0.16, 6.2, 2.9, 1.0, 0, s * 4.2, s * 0.25); } }
    // ---- the towers. North: finished, a square shaft in four stages, an octagon, a lantern and a crown, 123 m. South: stopped at the third stage under a low cap
    const tower = (zc, full) => { const xc = TW / 2, st = [[0, 24, 14], [24, 45, 13.4], [45, 65, 12.8]];
      for (const [y0, y1, w] of st) { b.box(M.stone, w, y1 - y0, w, xc, y0, zc); b.box(M.stone, w + 0.9, 0.7, w + 0.9, xc, y1 - 0.7, zc);
        for (const [ex, ez] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) b.box(M.stone, 2.3, y1 - y0, 2.3, xc + ex * w / 2, y0, zc + ez * w / 2);
        for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2, fx = Math.sin(a), fz = Math.cos(a); for (const u of [-2.3, 2.3]) { const g = new THREE.ShapeGeometry(new THREE.Shape(pointed(0, 1.25, 0, (y1 - y0) * 0.56, (y1 - y0) * 0.7).map(p => new THREE.Vector2(p[0], p[1])))); b.add(y0 > 40 ? M.glass : M.stoneGrey, g, xc + fx * (w / 2 + 0.06) + fz * u, y0 + (y1 - y0) * 0.12, zc + fz * (w / 2 + 0.06) - fx * u, a); } } }
      if (!full) { b.add(M.slate, new THREE.ConeGeometry(9.6, 7, 4), xc, 68.5, zc, Math.PI / 4); b.box(M.gold, 0.1, 1.4, 0.1, xc, 72, zc); return; }
      // the fourth, open stage and the gallery
      b.box(M.stone, 11.6, 17, 11.6, xc, 65, zc); b.box(M.stone, 12.8, 0.8, 12.8, xc, 81.4, zc); for (let f = 0; f < 4; f++) { const a = f * Math.PI / 2, fx = Math.sin(a), fz = Math.cos(a); for (const u of [-2.6, 0, 2.6]) { const g = new THREE.ShapeGeometry(new THREE.Shape(pointed(0, 0.95, 0, 11, 14).map(p => new THREE.Vector2(p[0], p[1])))); b.add(M.glass, g, xc + fx * 5.86 + fz * u, 66.2, zc + fz * 5.86 - fx * u, a); } }
      for (const [ex, ez] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { b.box(M.stone, 2.0, 17, 2.0, xc + ex * 5.8, 65, zc + ez * 5.8); b.cyl(M.stone, 0.12, 0.85, 15, xc + ex * 5.9, 82, zc + ez * 5.9, 6); }
      // the octagon, its eight tall openings, pinnacles at the corners tied to it
      b.cyl(M.stone, 4.3, 4.8, 17, xc, 82, zc, 8, Math.PI / 8); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; const g = new THREE.ShapeGeometry(new THREE.Shape(pointed(0, 0.9, 0, 10, 13).map(p => new THREE.Vector2(p[0], p[1])))); b.add(M.glass, g, xc + Math.sin(a) * 4.3, 83.4, zc + Math.cos(a) * 4.3, a); const a2 = a + Math.PI / 8; b.cyl(M.stone, 0.08, 0.42, 9, xc + Math.sin(a2) * 4.9, 96, zc + Math.cos(a2) * 4.9, 5); }
      b.cyl(M.stone, 5.2, 5.2, 0.7, xc, 98.6, zc, 8, Math.PI / 8);
      // the lantern and the crown: openwork, so thin members and gaps
      b.cyl(M.stone, 2.5, 3.0, 11, xc, 99.3, zc, 8, Math.PI / 8); for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; b.box(M.glass, 1.0, 7.5, 0.1, xc + Math.sin(a) * 2.75, 100.6, zc + Math.cos(a) * 2.75, a); const a2 = a + Math.PI / 8; b.cyl(M.stone, 0.06, 0.3, 7.5, xc + Math.sin(a2) * 3.3, 106, zc + Math.cos(a2) * 3.3, 5); }
      b.cyl(M.stone, 3.3, 3.3, 0.5, xc, 110.3, zc, 8, Math.PI / 8); b.cyl(M.stone, 1.2, 1.9, 5, xc, 110.8, zc, 8); b.cyl(M.stone, 0.18, 1.25, 5.4, xc, 115.8, zc, 8); b.box(M.gold, 0.14, 2.2, 0.14, xc, 120.9, zc); b.box(M.gold, 1.1, 0.14, 0.14, xc, 122, zc); b.add(M.gold, new THREE.SphereGeometry(0.4, 8, 6), xc, 121, zc); };
    tower(-(W - TW / 2), true); tower(W - TW / 2, false);
    // ---- the floor, and the light: shafts falling from the south clerestory across the nave
    b.lid(M.floor, [[0, -W], [XE - 12, -W], [XE + NV, -NV], [XE + NV, NV], [XE - 12, W], [XT1, W], [XT1, W + 6], [XT0, W + 6], [XT0, W], [0, W]], 0.03);
    for (const c of [...bays, ...cbays]) b.sheet(M.shaft, [[c - 1.6, 26, NV], [c + 1.6, 26, NV], [c + 1.6 + 2.5, 0.1, -NV - 5], [c - 1.6 + 2.5, 0.1, -NV - 5]]);
    { const xm = (XT0 + XT1) / 2; b.sheet(M.shaft, [[xm - 3, 26, W + 6], [xm + 3, 26, W + 6], [xm + 5, 0.1, 8], [xm - 1, 0.1, 8]]); }
    const grp = b.done(ox, oz, th);
    // where one may walk: inside the shell, not in the towers' feet, not through a pier; in and out by the west door and the south transept door
    const inside = (x, z) => (x > 0.6 && x < XE + NV - 1 && Math.abs(z) < W - 0.8 && !(x < TW + 0.8 && Math.abs(z) > 3.4) && !(x > XE - 12 && Math.hypot((x - (XE - 12)) / 0.92, z) > W - 1)) || (x > XT0 + 0.8 && x < XT1 - 0.8 && Math.abs(z) < W + 5.2);
    const door = (x, z) => (x > -4 && x <= 0.8 && Math.abs(z) < 2.6) || (z >= W + 5 && z < W + 9 && Math.abs(x - (XT0 + XT1) / 2) < 1.9);
    const shell = (x, z) => x > -3 && x < XE + NV + 1 && Math.abs(z) < W + 8.5 && (Math.abs(z) < W + 2.2 || (x > XT0 - 1.5 && x < XT1 + 1.5));
    blockers.push((X, Z) => { const [x, z] = toL(X, Z); if (!shell(x, z)) return false; if (door(x, z)) return false; if (!inside(x, z)) return true; return piers.some(p => Math.hypot(x - p[0], z - p[1]) < p[2]); });
    return { grp, toW, toL, th, inside: (X, Z) => inside(...toL(X, Z)), shell: (X, Z) => shell(...toL(X, Z)), W, TW, XT0, XT1, XE, HA, HN, NV, BAY, b: builder };
  }

  /* an altarpiece set up over an altar: the picture itself (it is the real thing that hangs there), in a dark frame, on a table, up some steps.
     F: frame (w runs out from the wall the altar stands against); steps: how many; wings: open triptych or the middle panel alone */
  function altarpiece(F, t, w, h, o = {}) { const b = builder(), n = o.steps || 3, sd = o.tread || 0.42, sh = o.rise || 0.17, top = n * sh, tw = w + 2.4;
    for (let i = 0; i < n; i++) b.box(o.stepMat || M.stoneGrey, tw + 2 * (n - i) * sd, sh, 1.6 + (n - i) * sd, 0, i * sh, (1.6 + (n - i) * sd) / 2);
    b.box(M.white, Math.min(w, 3.4), 1.05, 0.95, 0, top, 0.9); b.box(M.red, Math.min(w, 3.4) + 0.06, 0.5, 0.97, 0, top + 0.56, 0.9); b.box(M.marbleB, w + 0.5, 1.5, 0.5, 0, top, 0.3);
    const y0 = top + (o.lift || 1.9), fm = o.frameMat || M.woodDark; b.box(fm, w + 0.5, 0.25, 0.3, 0, y0 - 0.25, 0.25); b.box(fm, w + 0.5, 0.25, 0.3, 0, y0 + h, 0.25); for (const e of [-1, 1]) b.box(fm, 0.25, h + 0.5, 0.3, e * (w / 2 + 0.125), y0 - 0.25, 0.25); b.box(M.gold, w + 0.9, 0.12, 0.4, 0, y0 + h + 0.25, 0.25);
    for (const e of [-1, 1]) { b.cyl(M.gold, 0.035, 0.05, 0.9, e * 1.2, top + 1.05, 0.9, 6); b.cyl(M.white, 0.022, 0.022, 0.4, e * 1.2, top + 1.95, 0.9, 5); }
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), basic({ map: t })); m.position.set(0, y0 + h / 2, 0.42); b.loose(m);
    const grp = b.done(F.ox, F.oz, F.th, o.y || 0); if (!o.y) blockers.push((X, Z) => { const [u, ww] = F.local(X, Z); return Math.abs(u) < tw / 2 + n * sd && ww > -0.5 && ww < 1.8 + n * sd; });
    return { grp, y: (o.y || 0) + y0 + h / 2, F, pic: m }; }

  const rect = (x0, x1, y0, y1) => [[x0, y0], [x1, y0], [x1, y1], [x0, y1]];
  const block = (F, u0, u1, depth, front = 0.4) => blockers.push((X, Z) => { const [u, w] = F.local(X, Z); return u > u0 - 0.3 && u < u1 + 0.3 && w < front && w > -depth - 0.3; });
  // a cross window's stonework over an opening: a mullion and a transom
  const cross = (b, m, cx, y0, w, h, z) => { b.box(m, 0.14, h, 0.14, cx, y0, z); b.box(m, w, 0.14, 0.14, cx, y0 + h * 0.62, z); };

  /* ================= the town hall on the Grote Markt (1561-65; burnt 1576, rebuilt by 1579) =================
     F: its front on the square, from its left end. A long front of four storeys: a rusticated arcade, two floors of cross windows between pilasters, an open
     gallery under the eaves; in the middle a frontispiece that climbs above the roof in tiers of arches and niches between obelisks. */
  function stadhuis(F, L, depth) { const b = builder(), n = Math.round(L / 3.35), bw = L / n, mid = L / 2, CW = bw * 3 + 1.2, c0 = mid - CW / 2, c1 = mid + CW / 2, Y1 = 5.6, Y2 = 10.9, Y3 = 15.6, YE = 18.4;
    b.box(M.stoneWarm, L, YE, depth, mid, 0, -depth / 2); b.box(M.dark, L, YE - 0.4, 0.1, mid, 0.2, 0.08);
    const holes = [], dec = []; for (let i = 0; i < n; i++) { const c = (i + 0.5) * bw; if (c > c0 && c < c1) continue;
      holes.push(round(c, bw * 0.34, 0, 3.0), rect(c - 0.78, c + 0.78, Y1 + 1.0, Y1 + 4.3), rect(c - 0.78, c + 0.78, Y2 + 0.9, Y2 + 3.9), rect(c - 1.05, c - 0.12, Y3 + 0.7, Y3 + 2.2), rect(c + 0.12, c + 1.05, Y3 + 0.7, Y3 + 2.2)); dec.push(c); }
    for (const [x0, x1] of [[0, c0], [c1, L]]) b.wall(M.stoneWarm, rect(x0, x1, 0, YE), holes.filter(h => h[0][0] > x0 - 0.01 && h[0][0] < x1), 0, 0.22, 0);
    for (const c of dec) { cross(b, M.stone, c, Y1 + 1.0, 1.56, 3.3, 0.24); cross(b, M.stone, c, Y2 + 0.9, 1.56, 3.0, 0.24); }
    for (let i = 0; i <= n; i++) { const x = i * bw; if (x > c0 + 0.1 && x < c1 - 0.1) continue; b.box(M.stoneGrey, 0.95, Y1, 0.34, x, 0, 0.3); b.box(M.stone, 0.5, Y2 - Y1 - 0.5, 0.2, x, Y1 + 0.3, 0.3); b.box(M.stone, 0.44, Y3 - Y2 - 0.5, 0.2, x, Y2 + 0.3, 0.3); b.box(M.stone, 0.3, YE - Y3 - 0.6, 0.18, x, Y3 + 0.3, 0.3); }
    for (const [y, t, o] of [[Y1, 0.34, 0.5], [Y2, 0.3, 0.42], [Y3, 0.3, 0.42], [YE, 0.5, 0.75]]) b.box(M.stone, L + 0.4, t, o, mid, y - t / 2, 0.22 + o / 2);
    for (let y = 0.5; y < Y1 - 0.6; y += 0.62) b.box(M.stoneGrey, L, 0.06, 0.05, mid, y, 0.26);      // the rustication of the ground floor
    // the roof: hipped, slate, with a row of dormers
    b.sheet(M.slate, [[-0.5, YE, 0.9], [L + 0.5, YE, 0.9], [L - 5, YE + 8.5, -depth / 2], [5, YE + 8.5, -depth / 2]]); b.sheet(M.slate, [[-0.5, YE, -depth - 0.5], [L + 0.5, YE, -depth - 0.5], [L - 5, YE + 8.5, -depth / 2], [5, YE + 8.5, -depth / 2]]); for (const [x, xr] of [[-0.5, 5], [L + 0.5, L - 5]]) b.sheet(M.slate, [[x, YE, 0.9], [x, YE, -depth - 0.5], [xr, YE + 8.5, -depth / 2], [xr, YE + 8.5, -depth / 2]]);
    for (const c of dec.filter((_, i) => i % 2 === 0)) { b.box(M.stone, 1.3, 1.9, 1.6, c, YE + 1.2, -0.6); b.add(M.slate, new THREE.ConeGeometry(1.15, 1.5, 4), c, YE + 3.85, -0.6, Math.PI / 4); b.box(M.glass, 0.7, 1.0, 0.05, c, YE + 1.6, 0.22); }
    // the frontispiece
    const Z = 1.5, T3 = YE + 6.2, T4 = T3 + 6.0; b.box(M.stoneWarm, CW, T3, 2.2, mid, 0, Z - 1.1); b.box(M.dark, CW - 0.4, T3 - 0.4, 0.1, mid, 0.2, Z + 0.06);
    { const hs = []; for (const k of [-1, 0, 1]) { const c = mid + k * bw * 1.02, hw = k ? 1.0 : 1.25; hs.push(round(c, hw, 0, 3.4), round(c, hw, Y1 + 0.9, Y1 + 3.2), round(c, hw, Y2 + 0.8, Y2 + 2.9), k ? round(c, 0.8, YE + 1.0, YE + 3.6) : rect(c - 1.3, c + 1.3, YE + 0.9, YE + 4.7)); if (k) hs.push(rect(c - 0.8, c + 0.8, Y3 + 0.7, Y3 + 2.2)); }
      b.wall(M.stoneWarm, rect(c0, c1, 0, T3), hs, 0, Z + 0.2, 0); }
    for (const x of [c0 + 0.35, mid - bw * 0.52, mid + bw * 0.52, c1 - 0.35]) for (const [y0, y1, m] of [[0.3, Y1 - 0.3, M.stoneGrey], [Y1 + 0.3, Y2 - 0.3, M.marbleR], [Y2 + 0.3, Y3 - 0.3, M.marbleR], [YE + 0.4, T3 - 0.5, M.stone]]) b.cyl(m, 0.2, 0.24, y1 - y0, x, y0, Z + 0.5, 8);
    for (const [y, t] of [[Y1, 0.36], [Y2, 0.32], [Y3, 0.3], [YE, 0.5], [T3, 0.5]]) b.box(M.stone, CW + 0.7, t, 0.9, mid, y - t / 2, Z + 0.4);
    for (const k of [-1, 1]) { b.cyl(M.white, 0.2, 0.26, 1.9, mid + k * bw * 1.02, YE + 1.1, Z + 0.1, 6); b.add(M.white, new THREE.SphereGeometry(0.22, 6, 5), mid + k * bw * 1.02, YE + 3.15, Z + 0.1); }      // Justice and Prudence in their niches
    b.box(M.gold, 1.5, 1.7, 0.1, mid, YE + 1.9, Z + 0.14); b.box(M.red, 0.9, 1.1, 0.1, mid, YE + 2.2, Z + 0.2);                                                                     // the arms between them
    b.box(M.stoneWarm, 5.2, T4 - T3, 1.9, mid, T3, Z - 1.0); b.box(M.dark, 1.5, 3.4, 0.1, mid, T3 + 1.2, Z + 0.0); b.cyl(M.white, 0.22, 0.3, 2.3, mid, T3 + 1.3, Z + 0.15, 6); b.add(M.white, new THREE.SphereGeometry(0.25, 6, 5), mid, T3 + 3.8, Z + 0.15); b.add(M.gold, new THREE.TorusGeometry(0.34, 0.05, 5, 12), mid, T3 + 3.95, Z + 0.1);      // the Virgin above
    for (const k of [-1, 1]) { b.cyl(M.stone, 0.18, 0.22, T4 - T3 - 0.6, mid + k * 1.9, T3 + 0.3, Z + 0.25, 8); b.cyl(M.stone, 0.05, 0.42, 4.6, mid + k * (CW / 2 - 0.7), T3 + 0.2, Z - 0.2, 4); b.cyl(M.stone, 0.04, 0.34, 3.6, mid + k * 3.2, T4, Z - 0.6, 4); b.sheet(M.stoneWarm, [[mid + k * 2.6, T3, Z - 0.1], [mid + k * (CW / 2 - 1.2), T3, Z - 0.1], [mid + k * 2.6, T3 + 3.6, Z - 0.1], [mid + k * 2.6, T3 + 3.6, Z - 0.1]]); }
    b.box(M.stone, 5.8, 0.45, 2.3, mid, T4, Z - 1.0); b.wall(M.stoneWarm, [[mid - 2.6, T4 + 0.45], [mid + 2.6, T4 + 0.45], [mid, T4 + 3.0]], [], 0, Z, 0); b.cyl(M.stone, 0.05, 0.3, 2.6, mid, T4 + 2.8, Z - 0.3, 4); b.add(M.gold, new THREE.SphereGeometry(0.4, 8, 6), mid, T4 + 5.6, Z - 0.3);
    block(F, -0.3, L + 0.3, depth, Z + 0.6); return { grp: b.done(F.ox, F.oz, F.th), F, L, mid, top: T4 + 6 }; }

  /* ================= a guild house: a tall narrow front that is more window than wall, under a stepped or a scrolled gable with a gilt figure on it ================= */
  function guild(b, x0, w, floors, o = {}) { const mat = o.mat || M.stoneWarm, fh = o.fh || 3.7, g0 = 4.6, H = g0 + (floors - 1) * fh, nb = o.bays || (w > 7 ? 4 : 3), pw = w / nb, hs = [], x1 = x0 + w, mid = x0 + w / 2, steps = o.steps || 5;
    b.box(mat, w, H, 9, mid, 0, -4.5); b.box(M.dark, w - 0.3, H + 5, 0.1, mid, 0.2, 0.06);
    for (let i = 0; i < nb; i++) { const c = x0 + (i + 0.5) * pw; hs.push(i === Math.floor(nb / 2) ? round(c, pw * 0.36, 0, 2.6) : rect(c - pw * 0.36, c + pw * 0.36, 1.0, 3.6)); for (let f = 1; f < floors; f++) hs.push(rect(c - pw * 0.38, c + pw * 0.38, g0 + (f - 1) * fh + 0.7, g0 + f * fh - 0.45)); }
    // the gable: steps (or a scrolled outline) up to a pedestal
    const GH = w * (o.scroll ? 0.95 : 1.05), out = [[x0, 0], [x1, 0], [x1, H]], sh = GH / steps, sw = w / (2 * steps + 1.2); for (let s = 1; s <= steps; s++) { out.push([x1 - s * sw, H + (s - 1) * sh + (o.scroll ? sh * 0.5 : 0)], [x1 - s * sw, H + s * sh]); } for (let s = steps; s >= 1; s--) { out.push([x0 + s * sw, H + s * sh], [x0 + s * sw, H + (s - 1) * sh + (o.scroll ? sh * 0.5 : 0)]); } out.push([x0, H]);
    for (let i = 0; i < Math.max(1, nb - 2); i++) { const c = mid + (i - (Math.max(1, nb - 2) - 1) / 2) * pw; hs.push(rect(c - pw * 0.34, c + pw * 0.34, H + 0.6, H + Math.min(3.2, GH * 0.45))); } hs.push(round(mid, 0.45, H + GH * 0.55, H + GH * 0.55 + 0.7));
    b.wall(mat, out, hs, 0, 0.2, 0);
    for (let i = 0; i <= nb; i++) b.box(M.stone, 0.3, H, 0.16, x0 + i * pw, 0, 0.26); for (let f = 0; f < floors; f++) b.box(M.stone, w + 0.2, 0.3, 0.3, mid, g0 + f * fh - 0.3, 0.3);
    for (let i = 0; i < nb; i++) for (let f = 1; f < floors; f++) cross(b, M.stone, x0 + (i + 0.5) * pw, g0 + (f - 1) * fh + 0.7, pw * 0.76, fh - 1.15, 0.22);
    for (let s = 1; s <= steps; s++) for (const e of [-1, 1]) { const x = mid + e * (w / 2 - (s - 0.5) * sw); b.box(M.stone, sw + 0.16, 0.16, 0.34, x, H + s * sh, 0.2); if (!o.scroll && s < steps) b.cyl(M.stone, 0.03, 0.14, 0.9, x + e * sw * 0.3, H + s * sh + 0.16, 0.2, 4); }
    b.box(M.stone, sw * 1.3, 0.7, 0.4, mid, H + GH, 0.2); b.cyl(M.gold, 0.1, 0.2, 1.5, mid, H + GH + 0.7, 0.2, 6); b.add(M.gold, new THREE.SphereGeometry(0.2, 6, 5), mid, H + GH + 2.35, 0.2); if (o.rider) b.box(M.gold, 0.3, 0.6, 1.5, mid, H + GH + 0.9, 0.2);
    // the roof behind the gable
    b.sheet(M.slate, [[x0, H, 0.1], [mid, H + GH * 0.92, 0.1], [mid, H + GH * 0.92, -9], [x0, H, -9]]); b.sheet(M.slate, [[x1, H, 0.1], [mid, H + GH * 0.92, 0.1], [mid, H + GH * 0.92, -9], [x1, H, -9]]);
    return H + GH; }
  // a row of them: list of [width, floors, options], laid from the left end of F
  function guildRow(F, list) { const b = builder(); let x = 0; const tops = []; for (const [w, fl, o] of list) { tops.push([x + w / 2, guild(b, x, w, fl, o || {})]); x += w; } block(F, 0, x, 9); return { grp: b.done(F.ox, F.oz, F.th), F, L: x, tops }; }

  /* ================= Het Steen: the gate of the old Burcht on the river =================
     F: its gate front, from the left end. Built from the photograph of the castle as it stands (the part rebuilt about 1520), without the wing of the 1890s:
     a curtain wall of pale stone, round towers under slate cones, the gateway, a house with a stepped gable inside the wall. */
  function steen(F, L = 36) { const b = builder(), H = 10.5; b.box(M.stone, L, H, 2.2, L / 2, 0, -1.1); for (let u = 0.6; u < L; u += 1.9) b.box(M.stone, 1.0, 1.1, 0.7, u, H, -0.35);
    b.box(M.stoneGrey, L + 1, 2.2, 3.2, L / 2, 0, -1.1);
    const tower = (u, r, h, cone) => { b.cyl(M.stone, r, r * 1.06, h, u, 0, 0.6, 18); b.cyl(M.stoneGrey, r * 1.12, r * 1.2, 2.6, u, 0, 0.6, 18); b.cyl(M.stone, r * 1.1, r * 1.1, 0.5, u, h - 2.2, 0.6, 18); for (const [a, y] of [[0.3, h * 0.45], [-0.5, h * 0.7], [0, h * 0.82]]) b.box(M.glass, 0.3, 1.1, 0.2, u + Math.sin(a) * r, y, 0.6 + Math.cos(a) * r, a);
      if (cone) { b.add(M.slate, new THREE.ConeGeometry(r * 1.16, cone, 18), u, h + cone / 2, 0.6); b.box(M.gold, 0.06, 1.2, 0.06, u, h + cone, 0.6); } else for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; b.box(M.stone, 0.9, 1.2, 0.5, u + Math.sin(a) * r * 1.02, h, 0.6 + Math.cos(a) * r * 1.02, a); } };
    tower(3.2, 3.1, 15.5, 5.5); tower(L * 0.6, 3.2, 17, 6.5); tower(L - 3.4, 3.4, 18, 0);
    // the gateway between the two right-hand towers, with the wall-walk on corbels above it
    { const g0 = L * 0.6 + 3.2, g1 = L - 6.8, gm = (g0 + g1) / 2; b.wall(M.stone, rect(g0 - 0.5, g1 + 0.5, 0, 13), [pointed(gm, 2.1, 0, 3.6, 5.6)], 0, 0.5, 0); b.box(M.dark, 4.4, 5.6, 0.1, gm, 0, 0.1); b.box(M.stone, g1 - g0 + 1, 0.5, 1.0, gm, 9.2, 0.9); for (let u = g0; u < g1; u += 1.2) { b.box(M.stone, 0.4, 0.8, 0.9, u + 0.3, 8.4, 0.9); b.box(M.stone, 0.7, 1.0, 0.4, u + 0.3, 13, 0.5); } }
    // the house inside the wall, its stepped gable to the front
    { const x0 = 6.5, w = 11, Hh = 15, o = [[x0, 0], [x0 + w, 0], [x0 + w, Hh]]; for (let s = 1; s <= 6; s++) o.push([x0 + w - s * w / 13, Hh + (s - 1) * 1.05], [x0 + w - s * w / 13, Hh + s * 1.05]); for (let s = 6; s >= 1; s--) o.push([x0 + s * w / 13, Hh + s * 1.05], [x0 + s * w / 13, Hh + (s - 1) * 1.05]); o.push([x0, Hh]);
      b.wall(M.stone, o, [rect(x0 + 2.2, x0 + 3.6, 11.4, 13.6), rect(x0 + 7.2, x0 + 8.6, 11.4, 13.6), rect(x0 + 4.8, x0 + 6.0, 15.6, 17.4)], 0, -2.3, 0); b.box(M.dark, w - 1, 8, 0.1, x0 + w / 2, 10.8, -2.5); b.box(M.stone, w, Hh, 14, x0 + w / 2, 0, -9.4);
      b.sheet(M.slate, [[x0, Hh, -2.4], [x0 + w / 2, Hh + 6.2, -2.4], [x0 + w / 2, Hh + 6.2, -16], [x0, Hh, -16]]); b.sheet(M.slate, [[x0 + w, Hh, -2.4], [x0 + w / 2, Hh + 6.2, -2.4], [x0 + w / 2, Hh + 6.2, -16], [x0 + w, Hh, -16]]);
      b.box(M.stone, L - 4, 12, 20, L / 2 + 2, 0, -14); b.sheet(M.slate, [[2, 12, -4], [L, 12, -4], [L, 17, -14], [2, 17, -14]]); b.sheet(M.slate, [[2, 12, -24], [L, 12, -24], [L, 17, -14], [2, 17, -14]]); }
    block(F, -3.5, L + 3.5, 26, 4); return { grp: b.done(F.ox, F.oz, F.th), F, L }; }

  /* ================= a Gothic parish church with a west tower and a tall spire, and a choir raised high above the nave =================
     Used for St Walburga's, the Burchtkerk. F: at its west door, facing out. Inside (after Gheringh's picture of 1661): a nave of round pillars, a pointed
     plaster vault, wooden panelling along the aisles, a black and white floor, and at the east end a flight of steps up to the high altar. */
  function church(F, o = {}) { const b = builder(), NW = o.nave || 5.2, AW = o.aisle || 10.4, Ln = o.len || 40, Lc = o.choir || 13, HA = 9.5, HN = 17, BAY = 5.6, RISE = o.rise || 2.9, NST = o.steps || 16, TR = 0.36, TWR = 4.6;
    const cs = []; for (let z = -TWR - BAY / 2; z > -Ln; z -= BAY) cs.push(z); const zE = -Ln, zS = zE + 1.5, zTop = zS - NST * TR, zEnd = zE - Lc;
    // outer walls of the aisles (windows open to the day), east wall, west wall with the door through the tower
    for (const e of [-1, 1]) { b.wall(M.stoneIn, rect(-Ln, 0, 0, HA), cs.map(c => pointed(c, 1.15, 3.4, 6.4, 8.3)), e * AW, 0, Math.PI / 2 * -1); for (const c of cs) { b.box(M.stone, 1.5, HA + 1, 0.8, e * (AW + 0.75), 0, c + BAY / 2); b.box(M.oak, 0.14, 2.3, BAY - 0.3, e * (AW - 0.1), 0, c); } b.sheet(M.slate, [[e * NW, HA + 2.6, 0], [e * NW, HA + 2.6, -Ln], [e * (AW + 0.5), HA, -Ln], [e * (AW + 0.5), HA, 0]]); b.lid(M.stoneIn, rect(Math.min(e * NW, e * AW), Math.max(e * NW, e * AW), -Ln, 0).map(p => [p[0], p[1]]), HA);
      b.wall(M.stoneIn, rect(NW, AW, 0, HA + 2.6), [], 0, 0, e > 0 ? 0 : Math.PI); b.wall(M.stoneIn, rect(NW, AW, 0, HA + 2.6), [pointed((NW + AW) / 2, 1.1, 3.4, 6.4, 8.3)], 0, zE, e > 0 ? 0 : Math.PI);
      // the arcade and the clear storey over it; round pillars with a figure on a bracket, as Gheringh shows them
      b.wall(M.stoneIn, rect(-Ln, 0, 0, HN), [...cs.map(c => pointed(c, BAY / 2 - 0.55, 0, 6.0, 8.6)), ...cs.map(c => pointed(c, 0.95, 11.2, 13.8, 15.6))], e * NW, 0, -Math.PI / 2);
      for (let z = -TWR; z >= -Ln + 0.1; z -= BAY) { b.cyl(M.white, 0.5, 0.5, 6.2, e * NW, 0, z, 12); b.cyl(M.marbleB, 0.62, 0.66, 0.9, e * NW, 0, z, 12); b.cyl(M.gold, 0.66, 0.52, 0.4, e * NW, 6.0, z, 12); b.cyl(M.white, 0.12, 0.2, 1.3, e * (NW - 0.62), 3.6, z, 6); b.box(M.gold, 0.4, 0.3, 0.4, e * (NW - 0.6), 3.3, z); pil.push([e * NW, z, 0.85]); } }
    // the vault: pointed, plastered, with ribs
    for (const e of [-1, 1]) b.sheet(M.white, [[e * NW, HN - 1.6, 0], [e * NW, HN - 1.6, zEnd], [0, HN + 2.2, zEnd], [0, HN + 2.2, 0]]); for (let z = -TWR; z >= zEnd; z -= BAY) for (const e of [-1, 1]) b.add(M.stoneGrey, new THREE.BoxGeometry(Math.hypot(NW, 3.8), 0.2, 0.2), e * NW / 2, HN + 0.2, z, 0, 0, -e * Math.atan2(3.8, NW));
    b.sheet(M.slate, [[-NW - 0.4, HN, 0], [-NW - 0.4, HN, zEnd], [0, HN + 7, zEnd], [0, HN + 7, 0]]); b.sheet(M.slate, [[NW + 0.4, HN, 0], [NW + 0.4, HN, zEnd], [0, HN + 7, zEnd], [0, HN + 7, 0]]);
    // the choir: narrower, raised; its side walls with windows, a flat east wall behind the altar
    for (const e of [-1, 1]) { b.wall(M.stoneIn, rect(zEnd, zE, 0, HN), [pointed(zE - Lc * 0.3, 1.0, RISE + 4.5, 11, 13.5), pointed(zE - Lc * 0.72, 1.0, RISE + 4.5, 11, 13.5)], e * NW, 0, -Math.PI / 2); } b.wall(M.stoneIn, [[-NW, 0], [NW, 0], [NW, HN], [0, HN + 7], [-NW, HN]], [], 0, zEnd, 0);
    for (let i = 0; i < NST; i++) b.box(M.stoneGrey, 2 * NW - 2.2, (i + 1) * RISE / NST, TR, 0, 0, zS - (i + 0.5) * TR); b.box(M.stoneGrey, 2 * NW - 0.1, RISE, zTop - zEnd, 0, 0, (zTop + zEnd) / 2);
    for (const e of [-1, 1]) { b.box(M.marbleB, 1.1, RISE + 1.0, zS - zTop + 0.3, e * (NW - 0.6), 0, (zS + zTop) / 2); for (let i = 0; i < 7; i++) b.cyl(M.marbleR, 0.07, 0.09, 0.9, e * (NW - 1.3 - i * 0.0), RISE + 0.0, zTop - 0.4 - i * 0.001, 6); b.box(M.oak, 2.4, 2.6, 0.5, e * (NW - 1.4), 0, zS + 0.6); }
    b.lid(M.floor, rect(-AW, AW, -Ln, 0), 0.03); b.lid(M.floor, rect(-NW, NW, zEnd, zTop), RISE + 0.02);
    for (const c of cs) b.sheet(M.shaft, [[NW, 15, c - 0.9], [NW, 15, c + 0.9], [-NW - 2, 0.1, c + 2.4], [-NW - 2, 0.1, c + 0.6]]);
    // a pulpit against a pillar on the right, as in the picture
    { const z = cs[Math.floor(cs.length * 0.6)] + BAY / 2; b.cyl(M.oak, 0.9, 0.5, 1.3, NW - 1.3, 1.5, z, 8); b.cyl(M.oak, 0.14, 0.2, 1.5, NW - 1.3, 0, z, 6); b.cyl(M.oak, 1.0, 1.0, 0.16, NW - 1.3, 4.6, z, 8); pil.push([NW - 1.3, z, 1.0]); }
    // the west tower and its spire
    b.wall(M.stoneIn, rect(-NW, NW, 0, HN), [pointed(0, 1.7, 0, 3.4, 5.2), pointed(0, 1.6, 8, 12.5, 15)], 0, 0, 0); b.wall(M.stone, rect(-TWR, TWR, 0, 30), [pointed(0, 1.9, 0, 3.6, 5.6), pointed(0, 1.5, 8.5, 13, 15.5), pointed(-1.7, 0.7, 21, 25, 26.6), pointed(1.7, 0.7, 21, 25, 26.6)], 0, 0.3, 0);
    for (const e of [-1, 1]) { b.box(M.stone, 1.3, 30, 9.2, e * (TWR + 0.3), 0, -4.3); b.box(M.stone, 1.9, 24, 1.9, e * (TWR + 0.2), 0, 0.6); } b.box(M.stone, 2 * TWR, 13, 1, 0, 17, -8.6); for (const y of [7.4, 16.5, 30]) b.box(M.stone, 2 * TWR + 2.4, 0.5, 10.4, 0, y, -4.3);
    b.add(M.slate, new THREE.ConeGeometry(TWR * 1.45, 34, 8), 0, 30.5 + 17, -4.3, Math.PI / 8); for (const [ex, ez] of [[-1, 0], [1, 0], [-1, -1], [1, -1]]) b.cyl(M.slate, 0.05, 0.7, 6, ex * (TWR + 0.2), 30.5, ez * 8.6, 6); b.box(M.gold, 0.1, 2.4, 0.1, 0, 64.4, -4.3); b.box(M.gold, 1.2, 0.1, 0.1, 0, 65.8, -4.3);
    const grp = b.done(F.ox, F.oz, F.th);
    const inside = (X, Z) => { const [u, w] = F.local(X, Z); return Math.abs(u) < AW - 0.5 && w < -0.4 && w > zS + 0.5; };
    blockers.push((X, Z) => { const [u, w] = F.local(X, Z); if (Math.abs(u) > AW + 1.6 || w > 1.2 || w < zEnd - 1) return false; if (Math.abs(u) < 1.5 && w > -1) return false; if (Math.abs(u) < AW - 0.5 && w <= -0.4 && w > zS + 0.5) return pil.some(p => Math.hypot(u - p[0], w - p[1]) < p[2]); return true; });
    // the altar's place, on the raised floor: a frame facing down the nave
    const [ax, az] = F.P(0, zEnd + 0.6); return { grp, F, inside, altar: frame(ax, az, F.nx, F.nz), rise: RISE, zS, zTop, zEnd, NW, AW, Ln }; }
  const pil = [];

  /* ================= the house on the Wapper as it may have stood about 1612 =================
     F: its street front, from the north end. The old Flemish house he bought in 1610 (brick banded with white stone, cross windows, a stepped gable), the gate in the
     street wall, the court, and beyond it the garden. The studio wing and the screen between court and garden, which the engravings of 1684 and 1692 show, were
     still to come or still building: they stand here as rising walls in scaffolding. */
  function rubenshuis(F, o = {}) { const b = builder(), HW = 13, CW = 17, SW = 15, D = 25, L = HW + CW + SW, H = 8.4;
    // the Flemish house: an L along the north of the court
    const band = (x0, x1, z, ry, h) => { for (let y = 1.2; y < h; y += 1.45) b.add(M.white, new THREE.BoxGeometry(x1 - x0, 0.16, 0.06), (x0 + x1) / 2, y, z, ry); };
    b.box(M.brick, HW, H, D, HW / 2, 0, -D / 2);
    { const o2 = [[0, 0], [HW, 0], [HW, H]]; for (let s = 1; s <= 6; s++) o2.push([HW - s * HW / 13, H + (s - 1) * 0.95], [HW - s * HW / 13, H + s * 0.95]); for (let s = 6; s >= 1; s--) o2.push([s * HW / 13, H + s * 0.95], [s * HW / 13, H + (s - 1) * 0.95]); o2.push([0, H]);
      const hs = []; for (const c of [2.6, 6.5, 10.4]) { hs.push(rect(c - 0.75, c + 0.75, 1.3, 3.5), rect(c - 0.75, c + 0.75, 4.9, 7.2)); } hs.push(rect(5.8, 7.2, H + 1.2, H + 3.0)); b.wall(M.brick, o2, hs, 0, 0.12, 0); b.box(M.dark, HW - 0.6, H + 4, 0.06, HW / 2, 0.3, 0.04); for (const c of [2.6, 6.5, 10.4]) { cross(b, M.white, c, 1.3, 1.5, 2.2, 0.14); cross(b, M.white, c, 4.9, 1.5, 2.3, 0.14); }
      for (let y = 1.2; y < H; y += 1.45) b.box(M.white, HW, 0.16, 0.06, HW / 2, y, 0.16); for (let s = 1; s <= 6; s++) for (const e of [-1, 1]) b.box(M.white, HW / 13 + 0.14, 0.14, 0.3, HW / 2 + e * (HW / 2 - (s - 0.5) * HW / 13), H + s * 0.95, 0.12);
      b.sheet(M.tile, [[0, H, 0], [HW / 2, H + 5.6, 0], [HW / 2, H + 5.6, -D], [0, H, -D]]); b.sheet(M.tile, [[HW, H, 0], [HW / 2, H + 5.6, 0], [HW / 2, H + 5.6, -D], [HW, H, -D]]);
      // its side on the court: windows and the door
      for (const z of [-4, -9, -14, -19, -23]) { b.box(M.dark, 0.06, 2.1, 1.4, HW + 0.03, 1.3, z); b.box(M.dark, 0.06, 2.1, 1.4, HW + 0.03, 4.9, z); b.box(M.white, 0.1, 2.1, 0.12, HW + 0.06, 1.3, z); b.box(M.white, 0.1, 0.12, 1.4, HW + 0.06, 2.6, z); b.box(M.white, 0.1, 2.1, 0.12, HW + 0.06, 4.9, z); } b.box(M.oak, 0.1, 2.3, 1.2, HW + 0.05, 0, -11.5); for (let y = 1.2; y < H; y += 1.45) b.box(M.white, 0.06, 0.16, D, HW + 0.04, y, -D / 2); }
    // the street wall and the gate
    { const g = HW + CW / 2; b.wall(M.brick, rect(HW, HW + CW, 0, 4.6), [round(g, 1.5, 0, 2.3)], 0, 0, 0); b.box(M.white, CW, 0.3, 0.6, g, 4.6, 0); b.box(M.white, 0.5, 4.2, 0.5, g - 1.9, 0, 0.1); b.box(M.white, 0.5, 4.2, 0.5, g + 1.9, 0, 0.1); for (const e of [-1, 1]) b.box(M.oak, 1.45, 3.6, 0.1, g + e * 2.3, 0, -0.5, e * 1.2); }
    // the new work: walls going up in scaffolding where the studio and the screen will be
    const pole = (x, z, h) => b.cyl(M.oak, 0.06, 0.08, h, x, 0, z, 5), plank = (x0, x1, y, z, ry = 0) => b.add(M.oak, new THREE.BoxGeometry(Math.abs(x1 - x0), 0.06, 0.5), (x0 + x1) / 2, y, z, ry);
    { const x0 = HW + CW, hs = [3.2, 4.6, 5.4, 4.0, 6.2, 5.0, 3.6]; for (let i = 0; i < 7; i++) { b.box(M.stoneWarm, SW / 7 + 0.02, hs[i], 0.6, x0 + (i + 0.5) * SW / 7, 0, -0.3); b.box(M.stoneWarm, 0.6, hs[(i + 3) % 7], D / 7 + 0.02, x0 + 0.3, 0, -(i + 0.5) * D / 7); b.box(M.brick, 0.6, hs[(i + 5) % 7] + 1, D / 7 + 0.02, x0 + SW - 0.3, 0, -(i + 0.5) * D / 7); }
      for (let i = 0; i <= 4; i++) { pole(x0 + i * SW / 4, 0.9, 8); pole(x0 - 0.9, -i * D / 4, 8); } for (const y of [2.6, 5.2, 7.6]) { plank(x0, x0 + SW, y, 0.9); b.add(M.oak, new THREE.BoxGeometry(D, 0.06, 0.5), x0 - 0.9, y, -D / 2, Math.PI / 2); }
      b.add(M.oak, new THREE.BoxGeometry(0.08, 9, 0.08), x0 + SW * 0.3, 4, 0.95, 0, 0, 0.9); b.box(M.stoneWarm, 1.6, 0.7, 1.0, x0 - 2.6, 0, -6); b.box(M.stoneWarm, 1.2, 0.5, 0.9, x0 - 2.9, 0.7, -6.1); b.box(M.stone, 1.4, 0.6, 0.8, x0 - 2.4, 0, -9);
      // the screen: three piers begun
      for (const x of [HW + 2.2, HW + CW / 2 - 2.2, HW + CW / 2 + 2.2, HW + CW - 2.2]) { b.box(M.stoneWarm, 1.3, x > HW + CW / 2 ? 2.2 : 3.4, 1.3, x, 0, -D); pole(x + 0.9, -D + 0.9, 6); } plank(HW + 1, HW + CW - 1, 3.6, -D + 0.9); }
    // the garden wall round, and the garden
    const GD = o.garden || 50, z0 = -D, z1 = -D - GD; for (const [x, zz, w, d] of [[0.2, (z0 + z1) / 2, 0.5, GD], [L - 0.2, (z0 + z1) / 2, 0.5, GD], [L / 2, z1, L, 0.5]]) b.box(M.brick, w, 3.2, d, x, 0, zz); b.box(M.brick, HW - 0.2, 3.2, 0.5, HW / 2, 0, z0 - 0.2); b.box(M.brick, SW, 3.2, 0.5, HW + CW + SW / 2, 0, z0 - 0.2);
    b.lid(M.earth, rect(0.4, L - 0.4, z1, z0 - 0.3).map(p => [p[0], p[1]]), 0.025); b.lid(M.floor, rect(HW, HW + CW, z0, 0), 0.03);
    // beds edged with box, and young trees along the wall
    const beds = []; for (const [bx, bz, w, d] of o.beds || []) { b.box(M.leafDark, w, 0.35, d, bx, 0, bz); b.box(M.leaf, w - 0.6, 0.42, d - 0.6, bx, 0, bz); for (let i = 0; i < 8; i++) b.add([M.red, M.gold, M.white][i % 3], new THREE.SphereGeometry(0.16, 5, 4), bx + (((i * 37) % 10) / 10 - 0.5) * (w - 1), 0.5, bz + (((i * 53) % 10) / 10 - 0.5) * (d - 1)); beds.push([bx, bz, w / 2 + 0.2, d / 2 + 0.2]); }
    for (const [tx, tz] of o.trees || []) { b.cyl(M.oak, 0.1, 0.16, 2.6, tx, 0, tz, 6); b.add(M.leaf, new THREE.IcosahedronGeometry(1.5, 1), tx, 3.6, tz); b.add(M.leafDark, new THREE.IcosahedronGeometry(1.1, 1), tx + 0.6, 4.3, tz - 0.4); }
    const grp = b.done(F.ox, F.oz, F.th); const g = HW + CW / 2;
    blockers.push((X, Z) => { const [u, w] = F.local(X, Z); if (u < -0.5 || u > L + 0.5 || w > 0.5 || w < z1 - 0.6) return false; if (w > z0 - 0.5) { if (u < HW + 0.4 || u > HW + CW - 1.4) return true; if (w > -0.6 && Math.abs(u - g) > 1.3) return true; if (w < z0 + 2.2 && w > z0 - 0.5 && !(Math.abs(u - g) < 1.5)) return true; return false; }
      if (u < 0.9 || u > L - 0.9 || w < z1 + 0.9) return true; return beds.some(q => Math.abs(u - q[0]) < q[2] && Math.abs(w - q[1]) < q[3]); });
    return { grp, F, HW, CW, SW, D, L, GD, gate: g }; }
  /* the honeysuckle bower: a trellis seat with the plant grown over it. F: facing whoever looks at it */
  function bower(F) { const b = builder(); for (const x of [-1.9, 1.9]) { b.cyl(M.oak, 0.05, 0.06, 3.0, x, 0, -0.9, 5); b.cyl(M.oak, 0.05, 0.06, 3.0, x, 0, 0.2, 5); } for (let y = 0.5; y < 3; y += 0.5) b.box(M.oak, 3.8, 0.04, 0.04, 0, y, -0.9); for (let x = -1.8; x <= 1.8; x += 0.45) b.box(M.oak, 0.04, 3.0, 0.04, x, 0, -0.92);
    b.box(M.earth, 3.4, 0.5, 0.8, 0, 0, -0.45); b.box(M.leaf, 3.4, 0.08, 0.8, 0, 0.5, -0.45);      // a turf seat
    let sd = 5; const rn = () => (sd = (sd * 16807) % 2147483647) / 2147483647; for (let i = 0; i < 70; i++) { const x = (rn() - 0.5) * 4.6, y = 0.3 + rn() * 3.3, z = -0.95 + (rn() - 0.5) * 0.5 + (y > 2.7 ? rn() * 1.0 : 0); b.add(i % 3 ? M.leafDark : M.leaf, new THREE.IcosahedronGeometry(0.22 + rn() * 0.3, 0), x, y, z); if (i % 2) b.add(i % 4 === 1 ? M.gold : M.white, new THREE.SphereGeometry(0.07, 5, 4), x + 0.1, y + 0.12, z + 0.26); }
    blockers.push((X, Z) => { const [u, w] = F.local(X, Z); return Math.abs(u) < 2.4 && w > -1.5 && w < 0.5; }); return b.done(F.ox, F.oz, F.th); }

  return { M, builder, frame, pointed, round, rect, cross, block, blocked, blockers, rounds, cathedral, altarpiece, stadhuis, guild, guildRow, steen, church, rubenshuis, bower, worldUV, TS };
}
