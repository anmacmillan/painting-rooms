/* Vienna about 1908: every texture painted here by script (nothing is photographed). The ordinary houses stand on today's footprints from OpenStreetMap as
   plastered blocks of the Ringstrasse years (a rusticated ground floor, rows of tall windows under little pediments, a heavy cornice): the manner of the district,
   no single front a portrait. The named buildings are built from simple solids after the photographs kept in research/ref/ (Secession, Stadtbahn pavilion) and,
   for the Karlskirche and the Kunstschau, from descriptions only: see research/FINDINGS.md, "Buildings". */
export function makeTown({ THREE, scene }) {
  const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o);
  let seed = 11; const rn = () => (seed = (seed * 16807) % 2147483647) / 2147483647, R = (a, b) => a + (b - a) * rn();
  const canvasTex = (w, h, paint, rep = true) => { const c = document.createElement('canvas'); c.width = w; c.height = h; paint(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; };
  const speck = (g, w, h, n, cols, s0, s1, a = 0.25) => { for (let i = 0; i < n; i++) { g.globalAlpha = a * rn(); g.fillStyle = cols[Math.floor(rn() * cols.length)]; const s = R(s0, s1); g.fillRect(rn() * w, rn() * h, s * R(1, 3), s); } g.globalAlpha = 1; };
  const GOLD = '#e8b830', GOLD2 = '#b8861c';
  const tex = {
    /* granite setts laid in fans, as Vienna's streets were paved */
    setts: canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#6a665e'; g.fillRect(0, 0, w, h); let r = 0; for (let y = 0; y < h; y += 22, r++) for (let x = -(r % 2) * 13; x < w; x += 26) { g.fillStyle = ['#9a968c', '#a8a498', '#8e8a80', '#b0aca0', '#84807a', '#a09a8c'][Math.floor(rn() * 6)]; g.fillRect(x + 1.5, y + 1.5 + Math.sin((x + r * 13) / 82) * 3, 23, 19); } speck(g, w, h, 500, ['#4a4640', '#d0ccc0'], 2, 9, 0.14); }),
    gravel: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#cdbf9e'; g.fillRect(0, 0, w, h); speck(g, w, h, 3000, ['#b8a888', '#e2d6b8', '#a89878', '#d8caa8'], 1.5, 4, 0.6); }),
    grass: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#9db878'; g.fillRect(0, 0, w, h); speck(g, w, h, 2600, ['#88a866', '#b0c88a', '#94b070', '#bcd096', '#7e9c5e'], 2, 7, 0.5); }),
    plaster: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); speck(g, w, h, 900, ['#d8d2c4', '#ffffff', '#c8c0b0'], 3, 12, 0.16); }),
    zinc: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#6e7880'; g.fillRect(0, 0, w, h); for (let x = 0; x < w; x += 16) { g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x, 0, 2, h); } speck(g, w, h, 300, ['#58626a', '#8a949c'], 3, 10, 0.2); }),
    marble: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(150,150,160,.25)'; for (let i = 0; i < 26; i++) { g.lineWidth = R(0.5, 2); g.beginPath(); let x = R(0, w), y = R(0, h); g.moveTo(x, y); for (let k = 0; k < 5; k++) { x += R(-40, 40); y += R(-30, 30); g.lineTo(x, y); } g.stroke(); } }),
  };
  /* one bay of a Ringstrasse house, 4 m wide: PPM pixels to the metre */
  const PPM = 64, BAY = 4, G0 = 4.6, FL = 3.7;
  function facade(k, floors) { const H = G0 + floors * FL + 1.3, w = BAY * PPM, h = Math.round(H * PPM);
    return { H, k, t: canvasTex(w, h, g => { const Y = m => h - m * PPM, X = m => m * PPM;
      g.fillStyle = k.wall; g.fillRect(0, 0, w, h); speck(g, w, h, 400, ['#000000', '#ffffff'], 3, 14, 0.07);
      /* the rusticated ground floor: courses of cut stone, a shop window or a door under a round arch */
      g.fillStyle = k.base; g.fillRect(0, Y(G0), w, G0 * PPM); g.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0.5; y < G0; y += 0.55) g.fillRect(0, Y(y), w, 3); for (let x = 0; x < BAY; x += 1) g.fillRect(X(x), Y(G0), 2, G0 * PPM);
      g.fillStyle = '#1c2228'; g.beginPath(); g.moveTo(X(0.9), Y(0.5)); g.lineTo(X(0.9), Y(2.6)); g.arc(X(2), Y(2.6), X(1.1), Math.PI, 0); g.lineTo(X(3.1), Y(0.5)); g.fill();
      g.fillStyle = k.awn; g.fillRect(X(0.7), Y(3.0), X(2.6), 0.45 * PPM); g.fillStyle = 'rgba(255,255,255,.5)'; for (let x = 0.7; x < 3.3; x += 0.4) g.fillRect(X(x), Y(3.0), 0.2 * PPM, 0.45 * PPM);
      g.fillStyle = k.trim; g.fillRect(0, Y(G0) - 8, w, 14);
      for (let f = 0; f < floors; f++) { const y0 = G0 + f * FL + 0.85, hh = f === floors - 1 ? 1.75 : 2.15;
        for (const cx of [1, 3]) { g.fillStyle = k.trim; g.fillRect(X(cx - 0.62), Y(y0 + hh + 0.12), X(1.24), (hh + 0.24) * PPM); g.fillStyle = '#232a30'; g.fillRect(X(cx - 0.45), Y(y0 + hh), X(0.9), hh * PPM); g.fillStyle = 'rgba(190,205,210,.35)'; g.fillRect(X(cx - 0.45), Y(y0 + hh), X(0.9), hh * PPM * 0.3);
          g.fillStyle = k.trim; g.fillRect(X(cx) - 2, Y(y0 + hh), 4, hh * PPM); g.fillRect(X(cx - 0.45), Y(y0 + hh * 0.62), X(0.9), 3);
          if (f < 2) { g.beginPath(); if (f === 0) { g.moveTo(X(cx - 0.75), Y(y0 + hh + 0.2)); g.lineTo(X(cx), Y(y0 + hh + 0.62)); g.lineTo(X(cx + 0.75), Y(y0 + hh + 0.2)); } else g.arc(X(cx), Y(y0 + hh + 0.2), X(0.7), Math.PI, 0); g.fill(); }
          g.fillRect(X(cx - 0.7), Y(y0) - 2, X(1.4), 8); }
        g.fillStyle = 'rgba(0,0,0,.10)'; g.fillRect(0, Y(G0 + (f + 1) * FL), w, 4); }
      /* the cornice */
      g.fillStyle = k.trim; g.fillRect(0, 0, w, 1.1 * PPM); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(0, 1.1 * PPM - 10, w, 10); for (let x = 0; x < BAY; x += 0.5) g.fillRect(X(x + 0.1), 0.45 * PPM, 0.28 * PPM, 0.4 * PPM);
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,245,220,.08)'); gr.addColorStop(0.8, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(30,20,10,.2)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }, true) }; }
  const KINDS = [{ wall: '#e6dcc0', base: '#cfc6ac', trim: '#f4eedc', awn: '#a8442e' }, { wall: '#e8cf8a', base: '#d2bc82', trim: '#f6efd8', awn: '#3e6a4a' }, { wall: '#d2d0c8', base: '#b8b6ae', trim: '#ecebe4', awn: '#8a6a2a' }, { wall: '#e2c4b0', base: '#c8ae9c', trim: '#f4ece2', awn: '#34506e' }, { wall: '#dcd6b4', base: '#c2bc9e', trim: '#f2eed8', awn: '#a8442e' }];
  const FRONT = KINDS.flatMap(k => [facade(k, 4), facade(k, 3)]).map(f => ({ ...f, m: lam({ map: f.t }), gm: lam({ map: tex.plaster, color: f.k.wall }) }));
  const OWN = { musikverein: { ...facade({ wall: '#d8825a', base: '#c8b89a', trim: '#f2e6c8', awn: '#c8b89a' }, 3) }, kunstlerhaus: { ...facade({ wall: '#ead9a8', base: '#d2c296', trim: '#f8f0d8', awn: '#d2c296' }, 2) } };
  for (const k in OWN) { OWN[k].m = lam({ map: OWN[k].t }); OWN[k].gm = lam({ map: tex.plaster, color: OWN[k].k.wall }); }
  const roofM = lam({ map: tex.zinc });
  const batches = new Map(), put = (m, p, n, uv) => { let b = batches.get(m); if (!b) { b = { pos: [], nor: [], uv: [] }; batches.set(m, b); } b.pos.push(...p); b.nor.push(...n); b.uv.push(...uv); };
  const flush = () => { for (const [m, b] of batches) { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(b.pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(b.nor, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(b.uv, 2)); const mesh = new THREE.Mesh(g, m); mesh.matrixAutoUpdate = false; scene.add(mesh); } batches.clear(); };
  const inPoly = (p, x, z) => { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > z) !== (b[1] > z) && x < a[0] + (z - a[1]) / (b[1] - a[1]) * (b[0] - a[0])) c = !c; } return c; };
  const quad = (m, ax, az, cx, cz, y0, y1, n, u0, u1, v0, v1) => put(m, [ax, y0, az, cx, y0, cz, cx, y1, cz, ax, y0, az, cx, y1, cz, ax, y1, az], [...n, ...n, ...n, ...n, ...n, ...n], [u0, v0, u1, v0, u1, v1, u0, v0, u1, v1, u0, v1]);
  /* raise the houses. skip(b): true for footprints the level builds itself. Returns the blocks (for collision) */
  function houses(map, nearest, skip, far = 150) { const blocks = [];
    map.buildings.forEach((b, i) => { const p = b.p; if (p.length < 3 || (skip && skip(b, i))) return; let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9, near = 1e9; for (const q of p) { x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]); near = Math.min(near, nearest(q[0], q[1]).d); }
      if (near > far || (x1 - x0 < 7 && z1 - z0 < 7)) return; blocks.push({ p, x0, x1, z0, z1, i, k: b.k }); });
    const inBlock = (x, z, not) => blocks.some(b => b !== not && x > b.x0 && x < b.x1 && z > b.z0 && z < b.z1 && inPoly(b.p, x, z));
    for (const bl of blocks) { const p = bl.p, i = bl.i, h = Math.imul(i + 11, 2654435761) >>> 0, fr = OWN[bl.k] || FRONT[(h >>> 24) % FRONT.length], H = fr.H;
      for (let k = 0; k < p.length; k++) { let a = p[k], c = p[(k + 1) % p.length]; const L = Math.hypot(c[0] - a[0], c[1] - a[1]); if (L < 0.3) continue;
        let nx = -(c[1] - a[1]) / L, nz = (c[0] - a[0]) / L; const mx = (a[0] + c[0]) / 2, mz = (a[1] + c[1]) / 2; if (inPoly(p, mx + nx * 0.15, mz + nz * 0.15)) { nx = -nx; nz = -nz; }
        if (-(c[1] - a[1]) * nx + (c[0] - a[0]) * nz < 0) [a, c] = [c, a];
        const open = !inBlock(mx + nx * 1.6, mz + nz * 1.6, bl), n = Math.max(1, Math.round(L / BAY)), N3 = [nx, 0, nz];
        if (!open) continue;
        if (L < 2.6) { quad(fr.gm, a[0], a[1], c[0], c[1], 0, H, N3, 0, L / 3.2, 0, H / 3.2); continue; }
        quad(fr.m, a[0], a[1], c[0], c[1], 0, H, N3, 0, n, 0, 1); }
      const sh = new THREE.Shape(p.map(([x, z]) => new THREE.Vector2(x, -z))), g = new THREE.ShapeGeometry(sh), m = new THREE.Mesh(g, roofM); m.rotation.x = -Math.PI / 2; m.position.y = H; m.matrixAutoUpdate = false; m.updateMatrix(); scene.add(m); }
    flush(); return { blocks, inBlock }; }

  /* ---------- the named buildings ---------- */
  const white = lam({ map: tex.plaster, color: '#ffffff', emissive: '#34342f' }), goldM = basic({ color: GOLD }), goldL = lam({ color: '#f0c040', emissive: '#7a5a10' }), greenIron = lam({ color: '#5f8a66' }), dark = basic({ color: '#1c2026' });
  const box = (par, w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); par.add(b); return b; };
  const lettered = (lines, w, h, o = {}) => canvasTex(w, h, (g) => { if (o.bg) { g.fillStyle = o.bg; g.fillRect(0, 0, w, h); } g.fillStyle = o.ink || GOLD; g.textAlign = 'center'; g.textBaseline = 'middle'; lines.forEach((t, i) => { let px = o.px || Math.floor(h / (lines.length + 0.6)); g.font = `${o.weight || 600} ${px}px Georgia, "Times New Roman", serif`; while (g.measureText(t).width > w * 0.94 && px > 8) { px -= 1; g.font = `${o.weight || 600} ${px}px Georgia, serif`; } g.fillText(t, w / 2, h * (i + 0.5) / lines.length); }); }, false);
  /* a laurel in gold on white: the gilded foliage of the Secession's front */
  const laurelTex = (w, h, bg) => canvasTex(w, h, g => { if (bg) { g.fillStyle = bg; g.fillRect(0, 0, w, h); } g.strokeStyle = GOLD2; g.lineWidth = 3; g.beginPath(); g.moveTo(w / 2, h); g.lineTo(w / 2, h * 0.3); g.stroke(); for (let i = 0; i < 260; i++) { const a = rn() * 6.283, r = Math.sqrt(rn()) * w * 0.44, x = w / 2 + Math.cos(a) * r, y = h * 0.32 + Math.sin(a) * r * 0.62; g.fillStyle = rn() < 0.5 ? GOLD : '#f6d868'; g.save(); g.translate(x, y); g.rotate(rn() * 3.14); g.beginPath(); g.ellipse(0, 0, w * 0.035, w * 0.014, 0, 0, 7); g.fill(); g.restore(); } }, false);
  /* the Secession (Joseph Maria Olbrich, 1897-98): white windowless masses, and between four short pylons the open sphere of gilded iron leaves (laurel, by the usual account: the sources read say only foliage).
     Built in its own space (front to +z, x to the right as you face it from the street... mirrored by the rotation), then turned on to the footprint. */
  function secession(cx, cz, nx, nz) { const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = Math.atan2(nx, nz);
    box(g, 30, 9.5, 24, white, 0, 4.75, -6);                                             /* the hall behind */
    for (const e of [-1, 1]) { box(g, 9.2, 11, 7, white, e * 8.6, 5.5, 8.5); const l = new THREE.Mesh(new THREE.PlaneGeometry(5.5, 5.5), basic({ map: laurelTex(256, 256), transparent: true })); l.position.set(e * 8.6, 6.4, 12.03); g.add(l); box(g, 9.6, 0.5, 7.4, white, e * 8.6, 11.2, 8.5); }
    box(g, 8.2, 11, 5, white, 0, 5.5, 6.5); box(g, 3.2, 4.6, 0.3, dark, 0, 3.3, 9.05); box(g, 3.6, 0.35, 0.4, goldM, 0, 5.75, 9.1);
    const motto = new THREE.Mesh(new THREE.PlaneGeometry(7.9, 2.0), basic({ map: lettered(['DER ZEIT IHRE KUNST', 'DER KUNST IHRE FREIHEIT'], 512, 128, { weight: 700 }), transparent: true })); motto.position.set(0, 8.6, 9.03); g.add(motto);
    const ver = new THREE.Mesh(new THREE.PlaneGeometry(3.6, 0.7), basic({ map: lettered(['VER SACRUM'], 256, 50), transparent: true })); ver.position.set(-8.6, 3.0, 12.03); g.add(ver);
    for (let i = 0; i < 5; i++) box(g, 9 - i * 0.2, 0.2, 0.5, lam({ color: '#d8d2c4' }), 0, 0.1 + i * 0.2, 11.6 - i * 0.5);                                            /* the steps */
    for (const [x, z] of [[-3.7, 3.0], [3.7, 3.0], [-3.7, 9.4], [3.7, 9.4]]) { box(g, 2.5, 13.6, 2.5, white, x, 6.8, z); box(g, 2.9, 0.4, 2.9, white, x, 13.8, z); }
    const domeT = canvasTex(1024, 512, (c, w, h) => { c.clearRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { const x = rn() * w, y = rn() * h; c.fillStyle = ['#f2c838', '#e0a820', '#ffe070', '#c8921a', '#f6d450'][Math.floor(rn() * 5)]; c.save(); c.translate(x, y); c.rotate(rn() * 3.14); c.beginPath(); c.ellipse(0, 0, 17, 7, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(120,80,10,.7)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-17, 0); c.lineTo(17, 0); c.stroke(); c.restore(); } });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(4.9, 40, 24), basic({ map: domeT, alphaTest: 0.5, side: THREE.DoubleSide })); dome.position.set(0, 14.9, 6.2); g.add(dome);
    const inner = new THREE.Mesh(new THREE.SphereGeometry(4.6, 24, 16), basic({ color: '#8a6a14' })); inner.position.copy(dome.position); g.add(inner);
    scene.add(g); return { g, dome }; }
  /* one of Otto Wagner's two Stadtbahn pavilions (finished 1898, opened 1899): an iron frame painted green, slabs of white marble, gilded sunflowers, a curved roof
     over the middle. Front to +z. */
  function pavilion(cx, cz, nx, nz) { const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = Math.atan2(nx, nz);
    const panel = (w, h, n) => canvasTex(512, 256, (c, W, H) => { c.fillStyle = '#f4f1e8'; c.fillRect(0, 0, W, H); c.fillStyle = '#5f8a66'; for (let i = 0; i <= n; i++) c.fillRect(i * (W - 8) / n, 0, 8, H); c.fillRect(0, 0, W, 8); c.fillRect(0, H - 8, W, 8); c.fillRect(0, H * 0.26, W, 5);
      for (let i = 0; i < n * 2; i++) { const x = (i + 0.5) * W / (n * 2), y = H * 0.14; c.fillStyle = GOLD; for (let k = 0; k < 10; k++) { c.save(); c.translate(x, y); c.rotate(k * 0.628); c.beginPath(); c.ellipse(0, -H * 0.07, H * 0.022, H * 0.045, 0, 0, 7); c.fill(); c.restore(); } c.fillStyle = '#7a5a14'; c.beginPath(); c.arc(x, y, H * 0.03, 0, 7); c.fill(); }
      c.fillStyle = '#c8c2b4'; c.fillRect(0, H * 0.86, W, H * 0.14); }, false);
    const wm = lam({ map: panel(5, 4.2, 4) }), sm = lam({ map: panel(8, 4.2, 6) });
    for (const e of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(4.6, 4.2, 8), [sm, sm, greenIron, greenIron, wm, wm]); b.position.set(e * 5.3, 2.1, 0); g.add(b); box(g, 5.0, 0.25, 8.5, greenIron, e * 5.3, 4.3, 0); }
    const mid = new THREE.Mesh(new THREE.BoxGeometry(6, 5.2, 8.6), [sm, sm, greenIron, greenIron, lam({ map: panel(6, 5.2, 3) }), lam({ map: panel(6, 5.2, 3) })]); mid.position.set(0, 2.6, 0); g.add(mid);
    const archT = canvasTex(512, 256, (c, W, H) => { c.clearRect(0, 0, W, H); c.fillStyle = '#f4f1e8'; c.beginPath(); c.arc(W / 2, H, W / 2 - 4, Math.PI, 0); c.fill(); c.strokeStyle = GOLD; c.lineWidth = 18; c.beginPath(); c.arc(W / 2, H, W / 2 - 14, Math.PI, 0); c.stroke(); c.strokeStyle = '#5f8a66'; c.lineWidth = 6; c.beginPath(); c.arc(W / 2, H, W / 2 - 4, Math.PI, 0); c.stroke();
      for (let i = 0; i < 9; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 9, x = W / 2 + Math.cos(a) * W * 0.34, y = H + Math.sin(a) * W * 0.34; c.fillStyle = GOLD; for (let k = 0; k < 10; k++) { c.save(); c.translate(x, y); c.rotate(k * 0.628); c.beginPath(); c.ellipse(0, -15, 5, 10, 0, 0, 7); c.fill(); c.restore(); } c.fillStyle = '#7a5a14'; c.beginPath(); c.arc(x, y, 6, 0, 7); c.fill(); }
      c.fillStyle = '#1c2a22'; c.beginPath(); c.arc(W / 2, H, W * 0.2, Math.PI, 0); c.fill(); });
    for (const e of [-1, 1]) { const a = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 3.2), basic({ map: archT, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide })); a.position.set(0, 6.8, e * 4.32); g.add(a); }
    const roof = new THREE.Mesh(new THREE.CylinderGeometry(3.2, 3.2, 8.6, 20, 1, true, 0, Math.PI), lam({ color: '#6a9a74', side: THREE.DoubleSide })); roof.rotation.x = Math.PI / 2; roof.rotation.y = Math.PI / 2; roof.position.set(0, 5.2, 0); g.add(roof);
    const nameT = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 0.6), basic({ map: lettered(['KARLSPLATZ'], 256, 36, { ink: GOLD }), transparent: true })); nameT.position.set(0, 4.85, 4.34); g.add(nameT);
    box(g, 2.4, 3.0, 0.2, lam({ color: '#4a6e52' }), 0, 1.5, 4.36);
    scene.add(g); return g; }
  /* the Karlskirche across the square (Fischer von Erlach, begun 1716): a temple front, two giant columns, a green dome. Seen from 150 m and more: masses only. */
  function karlskirche(cx, cz, nx, nz) { const g = new THREE.Group(); g.position.set(cx, 0, cz); g.rotation.y = Math.atan2(nx, nz); const st = lam({ map: tex.plaster, color: '#ebe6d6' }), cu = lam({ color: '#7fb09a' });
    box(g, 34, 20, 30, st, 0, 10, -8); box(g, 22, 15, 8, st, 0, 7.5, 12);
    for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.95, 13, 12), st); c.position.set(-8.5 + i * 3.4, 6.5, 17.5); g.add(c); }
    const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 11.5, 5, 3, 1), st); ped.scale.z = 0.25; ped.rotation.y = Math.PI / 6 * 0; ped.position.set(0, 16.5, 17); box(g, 23, 1.2, 4, st, 0, 13.6, 17); const tri = new THREE.Mesh(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-11.5, 14.2, 18.9), new THREE.Vector3(11.5, 14.2, 18.9), new THREE.Vector3(0, 19.5, 18.9)]), st); tri.geometry.computeVertexNormals(); g.add(tri);
    for (const e of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 33, 20), st); c.position.set(e * 17, 16.5, 12); g.add(c); const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 2.9, 3, 12), st); cap.position.set(e * 17, 34.5, 12); g.add(cap); const l = new THREE.Mesh(new THREE.SphereGeometry(1.6, 12, 8), cu); l.position.set(e * 17, 37.4, 12); g.add(l); const bnd = new THREE.Mesh(new THREE.TorusGeometry(2.45, 0.18, 6, 20), lam({ color: '#c8c2b0' })); for (let k = 0; k < 7; k++) { const b2 = bnd.clone(); b2.rotation.x = Math.PI / 2 + 0.2; b2.position.set(e * 17, 4 + k * 4.2, 12); g.add(b2); }
      box(g, 11, 24, 11, st, e * 29, 12, 6); const r = new THREE.Mesh(new THREE.ConeGeometry(8.2, 6, 4), cu); r.rotation.y = Math.PI / 4; r.position.set(e * 29, 27, 6); g.add(r); }
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(11.5, 12, 16, 28), st); drum.scale.z = 0.82; drum.position.set(0, 28, -4); g.add(drum);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(12.2, 32, 18, 0, 6.2832, 0, Math.PI / 2), cu); dome.scale.set(1, 1.35, 0.82); dome.position.set(0, 35.5, -4); g.add(dome);
    const lan = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.6, 7, 12), st); lan.position.set(0, 55, -4); g.add(lan); const top = new THREE.Mesh(new THREE.SphereGeometry(2.6, 12, 10), cu); top.position.set(0, 59.5, -4); g.add(top); const cross = box(g, 0.4, 5, 0.4, goldM, 0, 64, -4); box(g, 2.4, 0.4, 0.4, goldM, 0, 64.6, -4);
    scene.add(g); return g; }
  return { tex, canvasTex, houses, inPoly, quad, flush, put, speck, lettered, box, secession, pavilion, karlskirche, white, goldM, goldL, GOLD, GOLD2, lam, basic };
}
