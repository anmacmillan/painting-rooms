/* The ordinary town: every texture painted here by script (nothing is photographed), and the houses raised on today's footprints from OpenStreetMap,
   each street wall a narrow brick front under a stepped gable. The manner (brick with bands of white stone, cross windows with shutters to the lower lights,
   stepped gables turned to the street) is that of the houses of the sixteenth and early seventeenth century that still stand in Antwerp and of the old plans;
   no single front is a portrait of a house that stood there in 1612. See research/FINDINGS.md, "Buildings". */
export function makeTown({ THREE, scene }) {
  const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o);
  let seed = 7; const rn = () => (seed = (seed * 16807) % 2147483647) / 2147483647, R = (a, b) => a + (b - a) * rn();
  const canvasTex = (w, h, paint, rep = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const speck = (g, w, h, n, cols, s0, s1, a = 0.25) => { for (let i = 0; i < n; i++) { g.globalAlpha = a * rn(); g.fillStyle = cols[Math.floor(rn() * cols.length)]; const s = R(s0, s1); g.fillRect(rn() * w, rn() * h, s * R(1, 3), s); } g.globalAlpha = 1; };
  // brick: Flemish red and orange, laid in courses with pale joints. px per metre is given so that a brick is a brick
  const bricks = (g, x0, y0, w, h, ppm, base) => { const bh = 0.065 * ppm, bw = 0.2 * ppm; g.fillStyle = '#c9b79a'; g.fillRect(x0, y0, w, h); let r = 0;
    for (let y = y0; y < y0 + h; y += bh, r++) for (let x = x0 - (r % 2) * bw / 2; x < x0 + w; x += bw) { const k = rn(), c = base[Math.floor(k * base.length)]; g.fillStyle = c; g.globalAlpha = 0.86 + 0.14 * rn(); g.fillRect(Math.max(x0, x + 0.6), y + 0.6, Math.min(bw - 1.2, x0 + w - x - 0.6), bh - 1.2); } g.globalAlpha = 1; };
  const RED = ['#a8492f', '#b4543a', '#9c3f2a', '#bf6040', '#8e3a2a', '#b8573c'], DARKB = ['#7a3a2c', '#86402e', '#6e3226', '#8e4a34'], ORANGE = ['#c26a3e', '#cc7848', '#b45a34', '#d08454'];
  const tex = {
    brick: canvasTex(512, 512, (g, w, h) => { bricks(g, 0, 0, w, h, 160, RED); speck(g, w, h, 500, ['#3a2018', '#e0c0a0'], 2, 7, 0.18); }),
    stone: canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#dcd6c8'; g.fillRect(0, 0, w, h); let r = 0; for (let y = 0; y < h; y += 64, r++) for (let x = -(r % 2) * 80; x < w; x += 160) { g.fillStyle = ['#dfd9cb', '#d6cfc0', '#e6e1d4', '#cfc8b8', '#d9d2c2'][Math.floor(rn() * 5)]; g.fillRect(x + 1.5, y + 1.5, 157, 61); } speck(g, w, h, 900, ['#8a8272', '#f4eede', '#a59a84'], 2, 9, 0.2); g.strokeStyle = 'rgba(90,80,64,.5)'; g.lineWidth = 1.5; r = 0; for (let y = 0; y < h; y += 64, r++) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); for (let x = -(r % 2) * 80; x < w; x += 160) { g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + 64); g.stroke(); } } }),
    slate: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#4a525c'; g.fillRect(0, 0, w, h); let r = 0; for (let y = 0; y < h; y += 16, r++) for (let x = -(r % 2) * 12; x < w; x += 24) { g.fillStyle = ['#434b56', '#525a66', '#3c444e', '#4c5460', '#5a626c'][Math.floor(rn() * 5)]; g.fillRect(x + 0.5, y + 0.5, 23, 15); } g.fillStyle = 'rgba(0,0,0,.25)'; for (let y = 0; y < h; y += 16) g.fillRect(0, y + 14, w, 2); }),
    flags: canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#b9b1a0'; g.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 128) for (let x = 0; x < w; x += 128) { g.fillStyle = ((x + y) / 128) % 2 ? ['#c9c2b2', '#d2cbbb', '#c2baa8'][Math.floor(rn() * 3)] : ['#8f8a84', '#99948c', '#86817a'][Math.floor(rn() * 3)]; g.fillRect(x + 1, y + 1, 126, 126); } speck(g, w, h, 700, ['#6a655c', '#e8e2d2'], 2, 8, 0.16); }),
    // the street: rounded cobbles, wet in places, with a gutter's darker run
    cobble: canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#5c5548'; g.fillRect(0, 0, w, h); let r = 0; for (let y = 0; y < h; y += 26, r++) for (let x = -(r % 2) * 16; x < w; x += 32) { g.fillStyle = ['#8f8674', '#9c927e', '#857c6a', '#a39a88', '#7a7262', '#948a76', '#a89c84'][Math.floor(rn() * 7)]; g.beginPath(); g.ellipse(x + 16 + R(-2, 2), y + 13 + R(-2, 2), R(12, 15), R(9.5, 12), R(-0.3, 0.3), 0, 7); g.fill(); g.fillStyle = 'rgba(255,250,235,.16)'; g.beginPath(); g.ellipse(x + 13, y + 9, 6, 4, 0, 0, 7); g.fill(); } speck(g, w, h, 300, ['#3a352c', '#c9c0a8'], 3, 12, 0.14); }),
    earth: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#7d8a54'; g.fillRect(0, 0, w, h); speck(g, w, h, 2600, ['#5f7a40', '#8f9a5c', '#6a8448', '#a09a66', '#4f6a3a'], 2, 7, 0.5); }),
    plaster: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#e8e0cc'; g.fillRect(0, 0, w, h); speck(g, w, h, 900, ['#d0c6ae', '#f6f0e0', '#bfb49a'], 3, 12, 0.2); }),
  };
  /* one bay of a house front, about 5.6 m wide: a door and a shop window below under a pentice, then storeys of cross windows (stone mullion and transom, leaded
     lights above, wooden shutters to the lower lights), bands of white stone through the brick. kind: the wall's stuff */
  const FL = 3.1, PPM = 86;
  function facade(kind, floors) { const Wm = 5.6, H = floors * FL, w = Math.round(Wm * PPM), h = Math.round(H * PPM);
    return { floors, H, kind, t: canvasTex(w, h, (g) => { const Y = m => h - m * PPM, X = m => m * PPM;
      if (kind.brick) bricks(g, 0, 0, w, h, PPM, kind.brick); else if (kind.wood) { g.fillStyle = kind.wood; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 0.24 * PPM) { g.fillStyle = `rgba(${rn() < 0.5 ? '20,12,6' : '150,110,70'},${0.1 + 0.25 * rn()})`; g.fillRect(x, 0, 0.24 * PPM - 1.5, h); } g.fillStyle = 'rgba(20,12,6,.5)'; for (let f = 1; f < floors; f++) g.fillRect(0, Y(f * FL + 0.32), w, 0.2 * PPM); } else { g.fillStyle = kind.wash; g.fillRect(0, 0, w, h); speck(g, w, h, 500, ['#b8ae96', '#fff8e8', '#9a8f78'], 3, 14, 0.2); }
      g.fillStyle = kind.band || '#e2d9c2'; if (kind.brick) for (let f = 0; f < floors; f++) for (const dy of [0.02, 0.95, 1.55, 2.5]) g.fillRect(0, Y(f * FL + dy) - 0.11 * PPM, w, 0.11 * PPM);
      g.fillStyle = '#b9b0a0'; g.fillRect(0, Y(0.45), w, 0.45 * PPM);      // the stone plinth
      const win = (cx, y0, ww, hh, shut) => { g.fillStyle = kind.frame || '#e6dcc4'; g.fillRect(X(cx - ww / 2) - 5, Y(y0 + hh) - 5, X(ww) + 10, hh * PPM + 10); g.fillStyle = '#1e2a30'; g.fillRect(X(cx - ww / 2), Y(y0 + hh), X(ww), hh * PPM);
        g.strokeStyle = 'rgba(150,170,170,.5)'; g.lineWidth = 1; for (let i = 1; i < 6; i++) { g.beginPath(); g.moveTo(X(cx - ww / 2) + i * X(ww) / 6, Y(y0 + hh)); g.lineTo(X(cx - ww / 2) + i * X(ww) / 6, Y(y0 + hh * 0.42)); g.stroke(); } for (let i = 1; i < 5; i++) { g.beginPath(); g.moveTo(X(cx - ww / 2), Y(y0 + hh) + i * hh * 0.58 * PPM / 5); g.lineTo(X(cx + ww / 2), Y(y0 + hh) + i * hh * 0.58 * PPM / 5); g.stroke(); }
        g.fillStyle = shut; g.fillRect(X(cx - ww / 2), Y(y0 + hh * 0.42), X(ww), hh * 0.42 * PPM); g.fillStyle = 'rgba(0,0,0,.28)'; for (let i = 0; i < 4; i++) g.fillRect(X(cx - ww / 2) + i * X(ww) / 4, Y(y0 + hh * 0.42), 2, hh * 0.42 * PPM);
        g.fillStyle = kind.frame || '#e6dcc4'; g.fillRect(X(cx) - 4, Y(y0 + hh), 8, hh * PPM); g.fillRect(X(cx - ww / 2), Y(y0 + hh * 0.42) - 4, X(ww), 8); };
      const shut = kind.shut || '#3c5a44';
      // ground floor: the door with its fanlight, the shop window with its let-down board, the pentice over both
      g.fillStyle = '#e6dcc4'; g.fillRect(X(0.55) - 6, Y(2.55) - 6, X(1.15) + 12, 2.55 * PPM + 6); g.fillStyle = kind.door || '#4a2e1c'; g.fillRect(X(0.55), Y(2.1), X(1.15), 2.1 * PPM); g.fillStyle = '#1e2a30'; g.fillRect(X(0.55), Y(2.55), X(1.15), 0.4 * PPM); g.fillStyle = 'rgba(0,0,0,.3)'; for (let i = 1; i < 4; i++) g.fillRect(X(0.55) + i * X(1.15) / 4, Y(2.1), 2, 2.1 * PPM);
      win(3.65, 0.95, 2.5, 1.6, shut); g.fillStyle = '#6a4a2c'; g.fillRect(X(2.3), Y(0.98), X(2.7), 0.1 * PPM);
      g.fillStyle = '#5a4030'; g.fillRect(0, Y(2.92), w, 0.2 * PPM); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, Y(2.72), w, 0.22 * PPM);
      for (let f = 1; f < floors; f++) { const hh = f === floors - 1 ? 1.45 : 1.8; win(1.5, f * FL + 0.75, 1.5, hh, shut); win(4.1, f * FL + 0.75, 1.5, hh, shut); }
      // iron wall anchors, and the weather
      g.fillStyle = '#2a2420'; for (let f = 1; f < floors; f++) for (const x of [0.25, 2.8, 5.35]) g.fillRect(X(x) - 3, Y(f * FL + 0.25), 6, 0.4 * PPM);
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,240,210,.10)'); gr.addColorStop(0.75, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(30,20,10,.28)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, true) }; }
  const KINDS = [{ brick: RED }, { brick: ORANGE, shut: '#7a2e24' }, { brick: DARKB, shut: '#39506a' }, { wash: '#e9e0c8', frame: '#cfc4a8', shut: '#6a3a2a' }, { brick: RED, shut: '#2f4a5a', door: '#2f3c2c' }, { wash: '#d9c49a', frame: '#efe6d0', shut: '#44583c' }, { brick: ORANGE }, { brick: DARKB, band: '#d6ccb4', shut: '#6a2a22' }, { wood: '#5e4630', frame: '#3a2a1c', shut: '#4a3626', door: '#2e2014' }];
  const FRONT = KINDS.flatMap((k, i) => [facade(k, 3), ...(i % 2 ? [facade(k, 4)] : [])]).map((f, i) => ({ ...f, m: lam({ map: f.t }), gm: f.kind.wood ? lam({ color: '#5e4630' }) : f.kind.wash ? lam({ map: tex.plaster, color: f.kind.wash }) : lam({ map: tex.brick, color: f.kind.brick === DARKB ? '#c9a898' : f.kind.brick === ORANGE ? '#ffd9b8' : '#ffffff' }) }));
  const roofM = [lam({ map: tex.slate, color: '#ff9a66', side: THREE.DoubleSide }), lam({ map: tex.slate, color: '#e8855a', side: THREE.DoubleSide }), lam({ map: tex.slate, color: '#aab4c4', side: THREE.DoubleSide })], capM = lam({ color: '#e6dcc6' }), darkM = basic({ color: '#1a1410' });

  const batches = new Map(), put = (m, p, n, uv) => { let b = batches.get(m); if (!b) { b = { pos: [], nor: [], uv: [] }; batches.set(m, b); } b.pos.push(...p); b.nor.push(...n); b.uv.push(...uv); };
  const flush = () => { for (const [m, b] of batches) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); const mesh = new THREE.Mesh(g, m); mesh.matrixAutoUpdate = false; scene.add(mesh); } batches.clear(); };
  const inPoly = (p, x, z) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > z) !== (b[1] > z) && x < a[0] + (z - a[1]) / (b[1] - a[1]) * (b[0] - a[0])) c = !c; } return c; };
  // a quad in a wall's plane: a, c ground points, heights, with the normal n
  const quad = (m, ax, az, cx, cz, y0, y1, n, u0, u1, v0, v1) => put(m, [ax, y0, az, cx, y0, cz, cx, y1, cz, ax, y0, az, cx, y1, cz, ax, y1, az], [...n, ...n, ...n, ...n, ...n, ...n], [u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1]);
  /* a stepped gable over one bay: from (ax, az) to (cx, cz) at the eaves height H, n pointing to the street; and the roof behind it running back from the street */
  function gable(fr, ax, az, cx, cz, H, n, depth, k) { const L = Math.hypot(cx - ax, cz - az), ex = (cx - ax) / L, ez = (cz - az) / L, steps = L < 4.6 ? 4 : 5, GH = L * (0.72 + (k % 3) * 0.06), sh = GH / (steps + 0.6), sw = L / (2 * steps + 1), N3 = [n[0], 0, n[1]], T = 3.2;
    for (let s = 0; s <= steps; s++) { const u0 = s * sw, u1 = L - s * sw, y0 = H + s * sh, y1 = H + (s + 1) * sh + (s === steps ? sh * 0.25 : 0); quad(fr.gm, ax + ex * u0, az + ez * u0, ax + ex * u1, az + ez * u1, y0, y1, N3, u0 / T, u1 / T, y0 / T, y1 / T);
      for (const [a, b] of s === steps ? [[u0 - 0.06, u1 + 0.06]] : [[u0 - 0.06, u0 + sw + 0.04], [u1 - sw - 0.04, u1 + 0.06]]) quad(capM, ax + ex * a + n[0] * 0.05, az + ez * a + n[1] * 0.05, ax + ex * b + n[0] * 0.05, az + ez * b + n[1] * 0.05, y1 - 0.13, y1 + 0.05, N3, 0, 1, 0, 1); }
    // the loft door with its hoist beam, and a slit above it
    const mx = ax + ex * L / 2 + n[0] * 0.04, mz = az + ez * L / 2 + n[1] * 0.04; quad(darkM, mx - ex * 0.5, mz - ez * 0.5, mx + ex * 0.5, mz + ez * 0.5, H + 0.5, H + 1.9, N3, 0, 1, 0, 1); quad(darkM, mx - ex * 0.16, mz - ez * 0.16, mx + ex * 0.16, mz + ez * 0.16, H + GH * 0.6, H + GH * 0.6 + 0.6, N3, 0, 1, 0, 1); quad(capM, mx - ex * 0.62, mz - ez * 0.62, mx + ex * 0.62, mz + ez * 0.62, H + 1.9, H + 2.05, N3, 0, 1, 0, 1);
    // the roof: two slopes from the ridge (which runs back from the gable's point) down to the eaves on either side
    const rm = roofM[k % 3], py = H + GH * 0.93, bx = -n[0] * depth, bz = -n[1] * depth, mx0 = ax + ex * L / 2, mz0 = az + ez * L / 2;
    for (const [px, pz, sg] of [[ax, az, -1], [cx, cz, 1]]) { const nn = [sg * ex * 0.75, 0.66, sg * ez * 0.75]; put(rm, [px, H, pz, mx0, py, mz0, mx0 + bx, py, mz0 + bz, px, H, pz, mx0 + bx, py, mz0 + bz, px + bx, H, pz + bz], [...nn, ...nn, ...nn, ...nn, ...nn, ...nn], [0, 0, 0, 2, depth / 2.4, 2, 0, 0, depth / 2.4, 2, depth / 2.4, 0]); } }

  /* raise the houses. skip(b, i): true for footprints the level builds itself. Returns the blocks (for collision) */
  function houses(map, nearest, skip, far = 95) { const blocks = [];
    map.buildings.forEach((b, i) => { const p = b.p; if (p.length < 3 || (skip && skip(b, i))) return; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, near = 1e9; for (const q of p) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]); near = Math.min(near, nearest(q[0], q[1]).d); }
      if (near > far) return; blocks.push({ p, x0, x1, z0, z1, i }); });
    const inBlock = (x, z, not) => blocks.some(b => b !== not && x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && inPoly(b.p, x, z));
    for (const bl of blocks) { const p = bl.p, i = bl.i, h = Math.imul(i + 11, 2654435761) >>> 0, fr = FRONT[(h >>> 24) % FRONT.length], H = fr.H * (0.95 + ((h >>> 8) % 7) * 0.02);
      for (let k = 0; k < p.length; k++) { let a = p[k], c = p[(k + 1) % p.length]; const L = Math.hypot(c[0] - a[0], c[1] - a[1]); if (L < 0.3) continue;
        let nx = -(c[1] - a[1]) / L, nz = (c[0] - a[0]) / L; const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2; if (inPoly(p, mx + nx * 0.15, mz + nz * 0.15)) { nx = -nx; nz = -nz; }
        if (-(c[1] - a[1]) * nx + (c[0] - a[0]) * nz < 0) [a, c] = [c, a];
        const open = !inBlock(mx + nx * 1.6, mz + nz * 1.6, bl), n = Math.max(1, Math.round(L / 5.6)), N3 = [nx, 0, nz];
        if (!open) { if (L > 2) quad(fr.gm, a[0], a[1], c[0], c[1], 0, H, N3, 0, L / 3.2, 0, H / 3.2); continue; }
        if (L < 2.6) { quad(fr.gm, a[0], a[1], c[0], c[1], 0, H, N3, 0, L / 3.2, 0, H / 3.2); continue; }
        quad(fr.m, a[0], a[1], c[0], c[1], 0, H, N3, 0, n, 0, 1);
        if (nearest(mx, mz).d < 60) for (let q = 0; q < n; q++) { const t0 = q / n, t1 = (q + 1) / n; gable(fr, a[0] + (c[0] - a[0]) * t0, a[1] + (c[1] - a[1]) * t0, a[0] + (c[0] - a[0]) * t1, a[1] + (c[1] - a[1]) * t1, H, [nx, nz], Math.min(9, Math.max(4, Math.min(bl.x1 - bl.x0, bl.z1 - bl.z0) * 0.6)), i + k + q); } }
      const sh = new THREE.Shape(p.map(([x, z]) => new THREE.Vector2(x, -z))), g = new THREE.ShapeGeometry(sh), m = new THREE.Mesh(g, roofM[i % 3]); m.rotation.x = -Math.PI / 2; m.position.y = H + 0.02; m.matrixAutoUpdate = false; m.updateMatrix(); scene.add(m); }
    flush(); return { blocks, inBlock }; }
  return { tex, canvasTex, houses, inPoly, FRONT, quad, gable, flush, put, roofM, capM, bricks, RED, ORANGE, DARKB, speck };
}
