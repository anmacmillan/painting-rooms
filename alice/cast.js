/* The creatures of alice/street.html that are not human, built here rather than in Blender (tools/blender/figure.py makes Alice, the Hatter, the Queen and Alice's sister):
   the White Rabbit, the March Hare, the Dormouse, the Cheshire Cat, the card gardeners and soldiers, the flamingo and the hedgehog, with the Hatter's hat and the Queen's crown.
   Each is modelled as skins drawn over rings (a haunch, a skull running into a muzzle, a flat ear), not as balls, and its fur is DRAWN: every skin carries a texture of
   short strokes laid along the form, in every grey from near black to pale, and is marked ENG.drawn so that the engraving filter prints the dark strokes everywhere and the
   paler ones only in shade (alice/engrave.js). What each wears is read by eye from Tenniel's 1865 plates (alice/images/, alice/research/ref_*.jpg): see FINDINGS.md.
   Everything is white and grey. Every figure faces +z and stands on y = 0. */
export function makeCast(THREE, canvasTex, ENG) {
  const V3 = THREE.Vector3, lam = o => new THREE.MeshLambertMaterial(o), rnd = (a, b) => a + Math.random() * (b - a), INK = '#1c1a18';
  const drawn = m => (ENG && ENG.drawn ? ENG.drawn(m) : m), sph = new THREE.SphereGeometry(1, 16, 12);
  const ell = (m, rx, ry, rz, x = 0, y = 0, z = 0) => { const e = new THREE.Mesh(sph, m); e.scale.set(rx, ry, rz); e.position.set(x, y, z); e.castShadow = true; return e; };
  const rod = (m, r0, r1, len, seg = 8) => { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, len, seg), m); c.position.y = -len / 2; c.castShadow = true; g.add(c); return g; };
  const white = lam({ color: '#f8f6f0' }), pale = lam({ color: '#dedbd2' }), dark = lam({ color: '#1c1a18' }), mid = lam({ color: '#8a8782' });
  // a skin over rings set along a path: each point is [x, y, z, half-width, half-height]; 'up' says which way the half-height runs. u goes round, v along.
  function skin(pts, m, o = {}) {
    const n = o.n || 16, up = new V3(...(o.up || [0, 0, 1])), P = pts.map(p => new V3(p[0], p[1], p[2])), pos = [], uv = [], idx = [], M = P.length;
    for (let i = 0; i < M; i++) { const t = new V3().subVectors(P[Math.min(i + 1, M - 1)], P[Math.max(i - 1, 0)]).normalize(), b = up.clone().addScaledVector(t, -up.dot(t)).normalize(), a = new V3().crossVectors(b, t), ra = pts[i][3], rb = pts[i][4] ?? ra;
      for (let j = 0; j <= n; j++) { const th = j / n * Math.PI * 2, c = Math.cos(th), s = Math.sin(th); pos.push(P[i].x + a.x * ra * c + b.x * rb * s, P[i].y + a.y * ra * c + b.y * rb * s, P[i].z + a.z * ra * c + b.z * rb * s); uv.push(j / n, i / (M - 1)); } }
    for (let i = 0; i < M - 1; i++) for (let j = 0; j < n; j++) { const A = i * (n + 1) + j, B = A + 1, C = A + n + 1, D = C + 1; idx.push(A, B, C, B, D, C); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const mesh = new THREE.Mesh(g, m); mesh.castShadow = true; return mesh;
  }
  // fur: short strokes running along the form (down the canvas). p sets how many are dark enough to print in full light: 0.25 a white coat, 0.9 a brown one.
  const furTex = (p, n = 300, len = [26, 62]) => canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) { const x = rnd(0, w), y = rnd(-20, h), L = rnd(len[0], len[1]), v = Math.round(25 + 180 * Math.pow(Math.random(), p)); g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = rnd(4.5, 7.5); g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + rnd(-7, 7), y + L * 0.5, x + rnd(-10, 10), y + L); g.stroke(); } }, true);
  const crisp = t => { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; return t; };      // strokes must stay strokes when seen small, not blur into a grey that the filter would print as a blot
  const furM = (t, rx = 1, ry = 1, o = {}) => { const c = crisp(t.clone()); c.needsUpdate = true; c.repeat.set(rx, ry); return drawn(lam(Object.assign({ map: c }, o))); };
  const FUR_W = furTex(0.42, 340), FUR_B = furTex(1.5, 1500, [22, 50]), FUR_G = furTex(0.6, 600);
  // the Rabbit's jacket: a bold check, with the waistcoat and its buttons let into the front (the front of a standing skin is at u = 0.25)
  const check = (g, w, h) => { g.strokeStyle = INK; g.lineWidth = 6; for (let k = -w; k < w * 2; k += 44) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h * 0.55, h); g.moveTo(k + h * 0.55, 0); g.lineTo(k, h); g.stroke(); } };
  const coatT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); check(g, w, h);
    for (let i = 0; i < 260; i++) { const x = rnd(0, w), y = rnd(0, h), v = Math.round(rnd(135, 205)); g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = 2.6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 14, y + 20); g.stroke(); }
    g.fillStyle = '#ffffff'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(74, 0); g.lineTo(96, h); g.lineTo(160, h); g.lineTo(182, 0); g.closePath(); g.fill(); g.stroke(); g.fillStyle = INK; for (const y of [150, 250, 350]) { g.beginPath(); g.arc(128, y, 8, 0, 7); g.fill(); }
    g.lineWidth = 4; g.beginPath(); g.moveTo(104, 404); g.lineTo(150, 404); g.stroke(); });
  const coatM = drawn(lam({ map: coatT })), sleeveM = drawn(lam({ map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#ffffff'; g.fillRect(0, 0, w, h); check(g, w, h); }, true) }));
  const darkCoatM = furM(furTex(1.6, 700, [30, 70]), 1, 1);
  const eye = (head, x, y, z, r, wild) => { const e = new THREE.Group(); e.position.set(x, y, z); e.add(ell(white, r * 1.5, r * 1.25, r * 0.6), ell(dark, r * 0.62, r * 0.7, r * 0.4, 0, -r * 0.1, r * 0.42)); if (!wild) e.add(ell(dark, r * 1.6, r * 0.28, r * 0.7, 0, r * 0.62, r * 0.1)); e.rotation.y = Math.sign(x) * 0.95; head.add(e); return e; };

  // o: hare (brown fur, long wild ears, straw on the head, a dark coat and a bow; no watch or umbrella)
  function rabbit(o = {}) {
    const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig); const F = o.hare ? FUR_B : FUR_W, coat = o.hare ? darkCoatM : coatM, slv = o.hare ? darkCoatM : sleeveM;
    // belly and haunches in one form, the jacket over the chest with its skirt standing out a little
    rig.add(skin([[0, 0.12, -0.07, 0.02], [0, 0.15, -0.06, 0.12, 0.14], [0, 0.25, -0.04, 0.175, 0.205], [0, 0.36, -0.01, 0.175, 0.2], [0, 0.48, 0.01, 0.152, 0.17], [0, 0.6, 0.02, 0.13, 0.14], [0, 0.7, 0.03, 0.1, 0.1], [0, 0.76, 0.04, 0.055, 0.055], [0, 0.79, 0.045, 0.02]], furM(F, 1, 0.8), { up: [0, 0, 1] }));
    rig.add(skin([[0, 0.3, -0.02, 0.225, 0.245], [0, 0.32, -0.015, 0.2, 0.225], [0, 0.48, 0.01, 0.17, 0.19], [0, 0.6, 0.02, 0.146, 0.156], [0, 0.7, 0.03, 0.115, 0.114], [0, 0.755, 0.04, 0.07, 0.068]], coat, { up: [0, 0, 1], n: 20 }));
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.07, 12, 1, true), lam({ color: '#fbfaf5', side: THREE.DoubleSide })); col.position.set(0, 0.78, 0.045); rig.add(col);      // the wing collar
    if (o.hare) for (const s of [-1, 1]) rig.add(ell(white, 0.065, 0.04, 0.02, s * 0.06, 0.745, 0.11));                 // his bow
    const head = new THREE.Group(); head.position.set(0, 0.8, 0.05); rig.add(head);
    head.add(skin([[0, 0.06, -0.11, 0.015], [0, 0.065, -0.09, 0.06, 0.068], [0, 0.072, -0.03, 0.086, 0.098], [0, 0.064, 0.035, 0.08, 0.088], [0, 0.045, 0.085, 0.062, 0.066], [0, 0.03, 0.125, 0.048, 0.05], [0, 0.022, 0.15, 0.032, 0.034], [0, 0.02, 0.162, 0.008]], furM(F, 0.6, 0.5), { up: [0, 1, 0] }));
    head.add(ell(dark, 0.015, 0.012, 0.01, 0, 0.032, 0.16));
    for (const s of [-1, 1]) { eye(head, s * 0.07, 0.098, 0.04, o.hare ? 0.024 : 0.021, o.hare); head.add(ell(white, 0.032, 0.028, 0.03, s * 0.03, 0.012, 0.125));      // the puffed cheeks of the muzzle
      for (let k = 0; k < 3; k++) { const wsk = rod(dark, 0.0022, 0.0022, 0.12, 3); wsk.position.set(s * 0.045, 0.02 + k * 0.008, 0.125); wsk.rotation.set(0, 0, s * (1.35 + k * 0.22)); head.add(wsk); } }
    const earM = furM(F, 0.35, 0.8), L = o.hare ? 0.34 : 0.29;
    const ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.034, 0.13, -0.045); e.add(skin([[0, 0, 0, 0.012, 0.012], [0, L * 0.25, -0.004, 0.03, 0.014], [0, L * 0.6, -0.012, 0.036, 0.012], [0, L * 0.88, -0.02, 0.024, 0.009], [0, L, -0.024, 0.004]], earM, { up: [0, 0, 1], n: 10 }));
      e.add(skin([[0, L * 0.12, 0.01, 0.006, 0.004], [0, L * 0.5, 0.003, 0.016, 0.004], [0, L * 0.85, -0.012, 0.006, 0.003]], mid, { up: [0, 0, 1], n: 6 })); e.userData.rx = (s < 0 ? -0.5 : -0.16) - (o.hare ? 0.1 : 0); e.rotation.set(e.userData.rx, s * 1.3, -s * (o.hare ? 0.55 : 0.1)); head.add(e); return e; });
    if (o.hare) for (let i = 0; i < 11; i++) { const s = rod(dark, 0.0035, 0.0035, 0.2 + (i % 3) * 0.07, 4); s.position.set((i % 3 - 1) * 0.03, 0.15, -0.02); s.rotation.set(-0.7 + (i % 4) * 0.45, 0, (i - 5) * 0.3); head.add(s); }      // straw on his head
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.14, 0.69, 0.02); a.add(skin([[0, 0.02, 0, 0.02], [0, 0, 0, 0.048], [0, -0.1, 0, 0.044], [0, -0.19, 0, 0.038]], slv, { up: [0, 0, 1], n: 10 }));
      const fo = new THREE.Group(); fo.position.y = -0.185; fo.add(skin([[0, 0.01, 0, 0.038], [0, -0.08, 0, 0.036], [0, -0.135, 0, 0.033], [0, -0.14, 0, 0.012]], slv, { up: [0, 0, 1], n: 10 }), skin([[0, -0.132, 0, 0.036, 0.034], [0, -0.15, 0, 0.037, 0.034]], white, { up: [0, 0, 1], n: 10 }),
        skin([[0, -0.145, 0, 0.012], [0, -0.155, 0.004, 0.027, 0.022], [0, -0.19, 0.012, 0.03, 0.02], [0, -0.215, 0.018, 0.02, 0.014], [0, -0.225, 0.02, 0.004]], furM(F, 0.25, 0.25), { up: [0, 0, 1], n: 10 })); a.add(fo); a.userData.fore = fo; rig.add(a); return a; });
    // the long hind legs: a great thigh, a short shank, a long foot flat on the ground
    const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * 0.125, 0.28, -0.03);
      l.add(skin([[0, 0.1, -0.03, 0.02], [0, 0.06, -0.02, 0.065, 0.11], [0, -0.04, 0.02, 0.075, 0.14], [0, -0.12, 0.05, 0.055, 0.085], [0, -0.165, 0.055, 0.03, 0.04]], furM(F, 0.5, 0.4), { up: [0, 0, 1], n: 12 }),
        skin([[0, -0.15, 0.06, 0.03, 0.034], [0, -0.2, 0.02, 0.028, 0.03], [0, -0.245, -0.01, 0.03, 0.03]], furM(F, 0.25, 0.2), { up: [0, 0, 1], n: 10 }),
        skin([[0, -0.255, -0.045, 0.01], [0, -0.255, -0.025, 0.034, 0.024], [0, -0.258, 0.07, 0.04, 0.022], [0, -0.262, 0.16, 0.034, 0.017], [0, -0.265, 0.2, 0.012, 0.008]], furM(F, 0.3, 0.5), { up: [0, 1, 0], n: 10 })); rig.add(l); return l; });
    const scut = new THREE.Mesh(new THREE.IcosahedronGeometry(0.058, 1), furM(F, 0.3, 0.3)); scut.position.set(0, 0.22, -0.2); scut.castShadow = true; rig.add(scut);
    const u = g.userData = { rig, head, ears, arms, legs };
    if (!o.hare) {
      const um = new THREE.Group(); um.add(rod(dark, 0.007, 0.007, 0.7, 6)); const cl = rod(mid, 0.02, 0.008, 0.5, 8); cl.position.y = -0.1; um.add(cl); const hk = new THREE.Mesh(new THREE.TorusGeometry(0.03, 0.007, 5, 10, Math.PI), dark); hk.position.set(0, 0.03, 0); um.add(hk);
      um.position.set(0.18, 0.86, -0.24); um.rotation.set(-0.98, 0, -0.08); rig.add(um); u.umbrella = um;                               // under his near arm, the handle up behind the shoulder
      const dial = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.arc(64, 64, 56, 0, 7); c.stroke(); c.lineWidth = 5; for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; c.beginPath(); c.moveTo(64 + Math.cos(a) * 40, 64 + Math.sin(a) * 40); c.lineTo(64 + Math.cos(a) * 50, 64 + Math.sin(a) * 50); c.stroke(); } c.beginPath(); c.moveTo(64, 64); c.lineTo(64, 28); c.moveTo(64, 64); c.lineTo(88, 74); c.stroke(); });
      const watch = new THREE.Group(), wf = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.042, 0.012, 20), [white, lam({ map: dial }), white]); wf.rotation.z = Math.PI / 2; watch.add(wf);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.043, 0.006, 5, 20), dark); rim.rotation.y = Math.PI / 2; watch.add(rim); const bow = new THREE.Mesh(new THREE.TorusGeometry(0.012, 0.004, 4, 8), dark); bow.rotation.y = Math.PI / 2; bow.position.y = 0.055; watch.add(bow);
      watch.position.set(0, -0.235, 0.05); arms[0].userData.fore.add(watch); u.watch = watch; watch.visible = false;
      const chain = new THREE.Group(); for (let i = 0; i < 16; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.0028, 4, 6), dark); l.rotation.y = i % 2 ? 0 : Math.PI / 2; chain.add(l); } rig.add(chain); u.chain = chain; chain.visible = false;
    }
    const a = new V3(), b = new V3();
    // pace 0 standing, 1 running; ph the phase of the stride
    u.pose = (ph, pace) => { const s = Math.sin(ph), c = Math.cos(ph), k = Math.min(1.2, pace);
      rig.position.y = Math.abs(c) * 0.05 * k; rig.rotation.x = 0.1 + 0.25 * k;
      legs[0].rotation.x = -s * 0.9 * k; legs[1].rotation.x = s * 0.9 * k;
      arms[0].rotation.x = s * 0.8 * k - 0.25 * k; arms[1].rotation.x = -s * 0.8 * k - 0.25 * k; arms[0].rotation.z = arms[1].rotation.z = 0; arms[0].userData.fore.rotation.x = arms[1].userData.fore.rotation.x = -0.5 - 0.6 * k;
      ears.forEach((e, i) => { e.rotation.x = e.userData.rx - 0.7 * k + Math.sin(ph * 2 + i) * 0.08 * k; }); head.rotation.x = 0.12 - 0.2 * k; if (u.chain) u.chain.visible = false; };
    // the plate: the watch held up in the far paw before his face, his head bent to it, the chain hanging in a loop back to the waistcoat
    u.watching = k => { arms[0].rotation.x = -1.05 * k; arms[0].rotation.z = 0.12 * k; arms[0].userData.fore.rotation.x = -1.2 * k; head.rotation.x = 0.12 + 0.2 * k; if (k > 0) { arms[1].rotation.x = 0.25; arms[1].userData.fore.rotation.x = -1.25; arms[1].rotation.z = -0.1; }
      if (!u.watch) return; u.watch.visible = u.chain.visible = k > 0.3; if (k > 0.3) { g.updateMatrixWorld(true); u.watch.getWorldPosition(a); rig.worldToLocal(a); b.set(0.0, 0.5, 0.15); u.chain.children.forEach((l, i) => { const t = (i + 1) / 17; l.position.lerpVectors(a, b, t); l.position.y -= Math.sin(t * Math.PI) * 0.09; }); } };
    u.pose(0, 0); return g;
  }

  // asleep, slumped forward with his nose on the table
  function dormouse() {
    const g = new THREE.Group(), F = furM(FUR_B, 0.7, 0.6);
    g.add(skin([[0, 0.0, -0.16, 0.02], [0, 0.04, -0.13, 0.11, 0.09], [0, 0.1, -0.04, 0.15, 0.13], [0, 0.1, 0.06, 0.13, 0.11], [0, 0.08, 0.13, 0.08, 0.07]], F, { up: [0, 1, 0] }));
    const head = new THREE.Group(); head.position.set(0, 0.1, 0.15); g.add(head);
    head.add(skin([[0, 0.01, -0.06, 0.02], [0, 0.015, -0.03, 0.075, 0.07], [0, 0.01, 0.03, 0.08, 0.07], [0, -0.01, 0.09, 0.05, 0.042], [0, -0.025, 0.135, 0.022, 0.02], [0, -0.03, 0.15, 0.005]], furM(FUR_B, 0.5, 0.5), { up: [0, 1, 0] }), ell(dark, 0.012, 0.01, 0.01, 0, -0.03, 0.15));
    for (const s of [-1, 1]) { const e = skin([[0, 0, 0, 0.012, 0.01], [0, 0.03, 0, 0.036, 0.01], [0, 0.058, 0, 0.03, 0.008], [0, 0.07, 0, 0.004]], furM(FUR_G, 0.3, 0.3), { up: [0, 0, 1], n: 10 }); e.position.set(s * 0.062, 0.055, -0.005); e.rotation.z = -s * 0.5; head.add(e);
      const lid = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.0045, 4, 8, Math.PI), dark); lid.position.set(s * 0.046, 0.012, 0.072); lid.rotation.set(0, s * 0.7, Math.PI); head.add(lid);
      const paw = skin([[0, 0, 0, 0.01], [0, 0, 0.02, 0.03, 0.022], [0, 0, 0.07, 0.026, 0.018], [0, 0, 0.09, 0.004]], white, { up: [0, 1, 0], n: 8 }); paw.position.set(s * 0.11, 0.02, 0.1); g.add(paw); }
    g.userData = { head }; return g;
  }

  // the Hatter's hat: wider at the top than the band, with the price ticket stuck in the band on the side the plate shows
  function topHat() {
    const g = new THREE.Group(), felt = drawn(lam({ map: furTex(0.45, 420, [20, 60]) }));
    g.add(skin([[0, 0.0, 0, 0.118], [0, 0.06, 0, 0.122], [0, 0.2, 0, 0.15], [0, 0.29, 0, 0.168], [0, 0.295, 0, 0.16], [0, 0.297, 0, 0.004]], felt, { up: [0, 0, 1], n: 22 }));
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.215, 0.215, 0.014, 26), white); brim.position.y = 0.008; brim.castShadow = true; g.add(brim);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.126, 0.122, 0.05, 22), dark); band.position.y = 0.04; g.add(band);
    const tk = new THREE.Mesh(new THREE.PlaneGeometry(0.17, 0.2), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, map: canvasTex(192, 224, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 7; c.strokeRect(4, 4, w - 8, h - 8); c.fillStyle = INK; c.textAlign = 'center'; c.font = 'italic 42px Georgia'; c.fillText('In this', w / 2, 56); c.fillText('Style', w / 2, 102); c.font = 'bold 70px Georgia'; c.fillText('10/6', w / 2, 186); }) }));
    tk.position.set(-0.105, 0.185, 0.125); tk.rotation.set(-0.12, -0.72, 0.14); g.add(tk); g.userData.ticket = tk; return g;
  }
  function crown() { const g = new THREE.Group(), m = lam({ color: '#f4f2ec' }); const band = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.098, 0.05, 16, 1, true), lam({ color: '#f4f2ec', side: THREE.DoubleSide })); band.position.y = 0.025; g.add(band);
    for (let i = 0; i < 8; i++) { const p = new THREE.Mesh(new THREE.ConeGeometry(0.024, 0.08, 4), m); p.position.set(Math.cos(i * 0.785) * 0.1, 0.085, Math.sin(i * 0.785) * 0.1); g.add(p); g.add(ell(dark, 0.012, 0.012, 0.012, Math.cos(i * 0.785) * 0.104, 0.03, Math.sin(i * 0.785) * 0.104)); } return g; }

  // The Cheshire Cat lies along a bough (the bough runs along x; the head is at -x and looks out along +z). vanish(k): 0 all there, 1 only the grin, beyond 1.15 nothing.
  function cat() {
    const g = new THREE.Group();
    const band = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.lineCap = 'round';
      for (let y = 20; y < h; y += 58) for (let i = 0; i < 150; i++) { const x = rnd(0, w), yy = y + rnd(-11, 11) + Math.sin(x * 0.05) * 6, v = Math.round(rnd(20, 105)); c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = rnd(3, 5); c.beginPath(); c.moveTo(x, yy); c.lineTo(x + rnd(14, 30), yy + rnd(-4, 4)); c.stroke(); }      // the stripes, each made of short strokes laid round the body
      for (let i = 0; i < 500; i++) { const x = rnd(0, w), y = rnd(0, h), v = Math.round(rnd(140, 208)); c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd(10, 24), y + rnd(-4, 4)); c.stroke(); } }, true);
    const fur = (rx, ry) => furM(band, rx, ry);
    const body = skin([[-0.36, 0.2, 0, 0.02], [-0.3, 0.21, 0, 0.17, 0.17], [-0.12, 0.225, 0, 0.225, 0.215], [0.14, 0.24, 0, 0.255, 0.24], [0.4, 0.225, 0, 0.245, 0.215], [0.57, 0.19, 0, 0.17, 0.15], [0.65, 0.17, 0, 0.02]], fur(1, 1), { up: [0, 1, 0], n: 22 });
    const head = skin([[-0.38, 0.33, -0.15, 0.02], [-0.38, 0.33, -0.11, 0.165, 0.14], [-0.38, 0.335, -0.02, 0.225, 0.19], [-0.38, 0.33, 0.07, 0.215, 0.18], [-0.38, 0.32, 0.135, 0.15, 0.125], [-0.38, 0.315, 0.16, 0.02]], fur(1, 0.5), { up: [0, 1, 0], n: 22 });
    // the face is drawn flat and laid on the front of the head; the grin is the same shape again, by itself
    const capG = () => { const c = new THREE.SphereGeometry(1, 28, 10, 0, Math.PI * 2, 0, 1.15); c.rotateX(Math.PI / 2); const p = c.attributes.position, uv = c.attributes.uv, k = Math.sin(1.15); for (let i = 0; i < p.count; i++) uv.setXY(i, 0.5 + p.getX(i) * 0.5 / k, 0.5 + p.getY(i) * 0.5 / k); return c; };
    const mouth = (c, w, h) => { const X = w / 2, Y = h * 0.66; c.lineJoin = 'round'; c.fillStyle = '#ffffff'; c.strokeStyle = INK; c.lineWidth = 7; c.beginPath(); c.moveTo(X - 150, Y - 34); c.quadraticCurveTo(X, Y + 78, X + 150, Y - 34); c.quadraticCurveTo(X, Y + 18, X - 150, Y - 34); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = 3.5; for (let i = 1; i < 14; i++) { const t = i / 14, x = X - 150 + 300 * t, y0 = Y - 34 + 4 * t * (1 - t) * 52 * 0.5, y1 = Y - 34 + 4 * t * (1 - t) * 56; c.beginPath(); c.moveTo(x, y0 + 3); c.lineTo(x, y1 - 3); c.stroke(); }
      c.lineWidth = 5; for (const s of [-1, 1]) { c.beginPath(); c.moveTo(X + s * 150, Y - 34); c.quadraticCurveTo(X + s * 168, Y - 50, X + s * 160, Y - 68); c.stroke(); } };
    const faceT = canvasTex(512, 512, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); const X = w / 2; c.strokeStyle = c.fillStyle = INK; c.lineCap = 'round';
      for (let i = 0; i < 420; i++) { const a = rnd(0, 6.3), r = rnd(60, 250), x = X + Math.cos(a) * r, y = 256 + Math.sin(a) * r, v = Math.round(rnd(90, 205)); c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = 2.6; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * 16, y + Math.sin(a) * 16); c.stroke(); }      // fur, lying outward from the nose
      c.strokeStyle = INK; for (let i = -3; i <= 3; i++) { c.lineWidth = 7; c.beginPath(); c.moveTo(X + i * 22, 62); c.lineTo(X + i * 13, 128 - Math.abs(i) * 8); c.stroke(); }                         // the marks on the brow
      for (const s of [-1, 1]) { c.fillStyle = '#ffffff'; c.lineWidth = 6; c.beginPath(); c.ellipse(X + s * 78, 206, 44, 27, s * 0.3, 0, 7); c.fill(); c.stroke(); c.fillStyle = INK; c.beginPath(); c.ellipse(X + s * 72, 208, 11, 24, 0, 0, 7); c.fill();
        c.lineWidth = 9; c.beginPath(); c.moveTo(X + s * 30, 186); c.quadraticCurveTo(X + s * 80, 160, X + s * 128, 196); c.stroke();                                                      // the heavy brow over each eye
        for (let k = 0; k < 4; k++) { c.lineWidth = 3; c.beginPath(); c.moveTo(X + s * 64, 292 + k * 7); c.lineTo(X + s * 236, 250 + k * 30); c.stroke(); } for (let k = 0; k < 5; k++) { c.beginPath(); c.arc(X + s * (36 + (k % 3) * 14), 286 + Math.floor(k / 3) * 12, 3, 0, 7); c.fill(); } }
      c.beginPath(); c.moveTo(X - 17, 262); c.lineTo(X + 17, 262); c.lineTo(X, 284); c.closePath(); c.fill(); c.lineWidth = 4; c.beginPath(); c.moveTo(X, 284); c.lineTo(X, 304); c.stroke(); mouth(c, w, h); });
    const grinT = canvasTex(512, 512, (c, w, h) => { c.clearRect(0, 0, w, h); mouth(c, w, h); });
    const face = new THREE.Mesh(capG(), drawn(lam({ map: faceT }))); face.scale.set(0.225, 0.19, 0.105); face.position.set(-0.38, 0.33, 0.085); face.castShadow = true;
    const grin = new THREE.Mesh(capG(), new THREE.MeshLambertMaterial({ map: grinT, alphaTest: 0.5 })); grin.scale.set(0.228, 0.193, 0.108); grin.position.copy(face.position);
    const ears = [-1, 1].map(s => { const e = skin([[0, 0, 0, 0.07, 0.03], [0, 0.07, 0, 0.045, 0.02], [0, 0.13, 0, 0.004]], fur(0.3, 0.3), { up: [0, 0, 1], n: 8 }); e.position.set(-0.38 + s * 0.15, 0.47, 0.0); e.rotation.z = -s * 0.35; return e; });
    const paws = [-1, 1].map(s => { const p = skin([[0, 0, -0.06, 0.02], [0, 0.01, -0.02, 0.06, 0.05], [0, 0.0, 0.08, 0.062, 0.045], [0, -0.01, 0.15, 0.05, 0.036], [0, -0.012, 0.18, 0.006]], fur(0.3, 0.3), { up: [0, 1, 0], n: 10 }); p.position.set(-0.36 + s * 0.14, 0.06, 0.12); return p; });
    const tailP = new THREE.CatmullRomCurve3([new V3(0.56, 0.17, 0), new V3(0.7, 0.06, 0.04), new V3(0.76, -0.2, 0.08), new V3(0.7, -0.46, 0.07), new V3(0.6, -0.66, 0.02), new V3(0.66, -0.8, -0.02)]).getPoints(24);
    const tails = [0, 1, 2, 3].map(i => skin(tailP.slice(i * 6, i * 6 + 7).map((p, k) => [p.x, p.y, p.z, 0.055 - (i * 6 + k) * 0.001]), fur(0.4, 0.4), { up: [0, 0, 1], n: 10 }));
    g.add(body, head, face, grin, ...ears, ...paws, ...tails);
    const order = [...tails.slice().reverse().map(t => [t]), [body], paws, ears, [head, face]];                  // "beginning with the end of the tail, and ending with the grin"
    g.userData = { head, grin, vanish(k) { order.forEach((ms, i) => { const a = Math.max(0, Math.min(1, 1 - (k * order.length - i))); for (const m of ms) { m.visible = a > 0.5; } }); grin.visible = k < 1.15; } };
    return g;
  }

  // a card with a head, hands and feet: the gardeners (spades: Two, Five and Seven) and the soldiers (clubs). o: n pips, suit, pot, brush
  const pip = (c, x, y, r, suit) => { c.beginPath(); if (suit === 'club') { c.arc(x, y - r * 0.5, r * 0.42, 0, 7); c.arc(x - r * 0.45, y + r * 0.1, r * 0.42, 0, 7); c.arc(x + r * 0.45, y + r * 0.1, r * 0.42, 0, 7); c.fill(); c.beginPath(); c.moveTo(x, y); c.lineTo(x - r * 0.22, y + r * 0.9); c.lineTo(x + r * 0.22, y + r * 0.9); c.closePath(); c.fill(); }
    else { c.moveTo(x, y - r); c.bezierCurveTo(x + r * 0.2, y - r * 0.5, x + r * 0.95, y - r * 0.1, x + r * 0.95, y + r * 0.3); c.arc(x + r * 0.5, y + r * 0.3, r * 0.45, 0, Math.PI); c.arc(x - r * 0.5, y + r * 0.3, r * 0.45, 0, Math.PI); c.bezierCurveTo(x - r * 0.95, y - r * 0.1, x - r * 0.2, y - r * 0.5, x, y - r); c.fill(); c.beginPath(); c.moveTo(x, y + r * 0.2); c.lineTo(x - r * 0.28, y + r); c.lineTo(x + r * 0.28, y + r); c.closePath(); c.fill(); } };
  const LAY = { 2: [[0.5, 0.25], [0.5, 0.75]], 5: [[0.3, 0.25], [0.7, 0.25], [0.5, 0.5], [0.3, 0.75], [0.7, 0.75]], 7: [[0.3, 0.2], [0.7, 0.2], [0.5, 0.35], [0.3, 0.5], [0.7, 0.5], [0.3, 0.8], [0.7, 0.8]], 3: [[0.5, 0.2], [0.5, 0.5], [0.5, 0.8]], 4: [[0.3, 0.25], [0.7, 0.25], [0.3, 0.75], [0.7, 0.75]] };
  const cardT = (n, suit) => canvasTex(256, 368, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = c.fillStyle = INK; c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); for (const [u, v] of LAY[n]) pip(c, u * w, v * h, 30, suit); });
  const backT = canvasTex(128, 184, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 3; for (let k = -h; k < w + h; k += 13) { c.beginPath(); c.moveTo(k, 0); c.lineTo(k + h, h); c.moveTo(k + h, 0); c.lineTo(k, h); c.stroke(); } c.lineWidth = 8; c.strokeRect(4, 4, w - 8, h - 8); });
  const hoseT = canvasTex(64, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.fillStyle = INK; for (let y = 0; y < h; y += 16) c.fillRect(0, y, w, 6); }), hoodT = canvasTex(128, 128, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = INK; c.lineWidth = 3; for (let x = 4; x < w; x += 9) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); } });
  function card(o = {}) {
    const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig); const W = 0.5, H = 0.72, side = lam({ color: '#f4f2ec' });
    const body = new THREE.Mesh(new THREE.BoxGeometry(W, H, 0.03), [side, side, side, side, lam({ map: cardT(o.n || 5, o.suit || 'spade') }), lam({ map: backT })]); body.position.y = 0.43 + H / 2; body.castShadow = true; rig.add(body);
    const head = new THREE.Group(); head.position.set(0, 0.43 + H + 0.1, 0); rig.add(head);
    head.add(skin([[0, -0.1, 0, 0.03], [0, -0.07, 0.005, 0.07, 0.075], [0, 0, 0.01, 0.09, 0.098], [0, 0.07, 0.005, 0.078, 0.085], [0, 0.115, 0, 0.03]], white, { up: [0, 0, 1], n: 14 }));            // a round face
    head.add(skin([[0, -0.005, 0.085, 0.012], [0, -0.015, 0.105, 0.03, 0.026], [0, -0.03, 0.135, 0.028, 0.024], [0, -0.04, 0.15, 0.008]], white, { up: [0, 1, 0], n: 8 }));                      // and a great nose
    for (const s of [-1, 1]) head.add(ell(dark, 0.012, 0.014, 0.008, s * 0.038, 0.03, 0.092), ell(dark, 0.026, 0.006, 0.008, s * 0.04, 0.058, 0.09));
    head.add(ell(dark, 0.03, 0.006, 0.008, 0, -0.058, 0.082));
    head.add(skin([[0, -0.085, -0.03, 0.105, 0.1], [0, 0.0, -0.035, 0.108, 0.1], [0, 0.085, -0.03, 0.09, 0.085], [0, 0.15, -0.045, 0.045], [0, 0.2, -0.075, 0.006]], lam({ map: hoodT }), { up: [0, 0, 1], n: 14 }));      // the hood, coming to a point
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * (W / 2 - 0.02), 0.43 + H - 0.1, 0); a.add(skin([[0, 0.02, 0, 0.02], [0, 0, 0, 0.05], [0, -0.14, 0, 0.045], [0, -0.26, 0, 0.036]], white, { up: [0, 0, 1], n: 8 }), ell(white, 0.036, 0.042, 0.03, 0, -0.29, 0)); rig.add(a); return a; });
    const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * 0.13, 0.45, 0); l.add(skin([[0, 0, 0, 0.042], [0, -0.2, 0, 0.036], [0, -0.37, 0, 0.03]], lam({ map: hoseT }), { up: [0, 0, 1], n: 8 }), skin([[0, -0.4, -0.06, 0.01], [0, -0.4, -0.03, 0.042, 0.035], [0, -0.41, 0.07, 0.048, 0.03], [0, -0.42, 0.15, 0.03, 0.02], [0, -0.42, 0.17, 0.006]], mid, { up: [0, 1, 0], n: 8 })); rig.add(l); return l; });
    if (o.brush) { const b = new THREE.Group(); b.add(rod(dark, 0.008, 0.008, 0.16, 5)); const t = rod(mid, 0.03, 0.012, 0.07, 6); t.position.y = 0.07; b.add(t); b.position.set(0, -0.3, 0.02); b.rotation.x = Math.PI; arms[1].add(b); }
    if (o.pot) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.11, 12), pale); p.position.set(0, -0.4, 0); p.castShadow = true; arms[0].add(p); }
    g.userData = { rig, head, arms, legs, pose(ph, pace) { const s = Math.sin(ph), k = Math.min(1, pace); legs[0].rotation.x = -s * 0.7 * k; legs[1].rotation.x = s * 0.7 * k; rig.position.y = Math.abs(Math.cos(ph)) * 0.03 * k; },
      flat(a) { rig.rotation.x = a * Math.PI / 2; rig.position.y = a * 0.05; rig.position.z = a * 0.45; }, bow(b) { rig.rotation.x = b * 0.7; } };      // flat(1): thrown flat upon his face
    return g;
  }
  // a soldier doubled up to make a croquet arch, standing on his hands and feet
  function arch(n = 3) {
    const g = new THREE.Group(), R = 0.56, Wd = 0.5, seg = 14, pos = [], uv = [], idx = [];
    for (let i = 0; i <= seg; i++) { const a = Math.PI * i / seg; for (const s of [-1, 1]) { pos.push(Math.cos(a) * R, 0.2 + Math.sin(a) * R * 1.1, s * Wd / 2); uv.push(s > 0 ? 1 : 0, i / seg); } }
    for (let i = 0; i < seg; i++) { const A = i * 2; idx.push(A, A + 1, A + 2, A + 1, A + 3, A + 2); }
    const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); ge.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); ge.setIndex(idx); ge.computeVertexNormals();
    const m = new THREE.Mesh(ge, lam({ map: cardT(n, 'club'), side: THREE.DoubleSide })); m.castShadow = true; g.add(m);
    for (const s of [-1, 1]) for (const z of [-0.17, 0.17]) { const l = rod(lam({ map: hoseT }), 0.03, 0.028, 0.2, 6); l.position.set(s * R, 0.2, z); g.add(l); g.add(ell(s < 0 ? white : mid, 0.035, 0.022, 0.05, s * R, 0.02, z)); }
    g.add(ell(white, 0.08, 0.09, 0.085, -R - 0.02, 0.36, 0)); return g;
  }
  // a standard rose-tree: a thin stem, a head of leaves, roses white and (painted) dark
  function roseTree() {
    const g = new THREE.Group();
    const st = rod(dark, 0.022, 0.03, 1.6, 6); st.position.y = 1.6; g.add(st);
    const lfT = canvasTex(128, 64, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#ffffff'; c.strokeStyle = INK; c.lineWidth = 6; c.beginPath(); c.moveTo(4, 32); c.quadraticCurveTo(64, -14, 124, 32); c.quadraticCurveTo(64, 78, 4, 32); c.closePath(); c.fill(); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(4, 32); c.lineTo(124, 32); c.stroke(); });
    const lfM = new THREE.MeshBasicMaterial({ map: lfT, alphaTest: 0.5, side: THREE.DoubleSide }), lfG = new THREE.PlaneGeometry(0.2, 0.1), leaves = new THREE.InstancedMesh(lfG, lfM, 230), D = new THREE.Object3D();
    for (let i = 0; i < 230; i++) { const a = rnd(0, 6.3), e = rnd(-1.2, 1.5), r = Math.pow(Math.random(), 0.45); D.position.set(Math.cos(a) * Math.cos(e) * 0.82 * r, 2.02 + Math.sin(e) * 0.66 * r, Math.sin(a) * Math.cos(e) * 0.5 * r); D.rotation.set(rnd(-0.5, 0.5), rnd(0, 6.3), rnd(-1.2, 1.2)); D.scale.setScalar(rnd(0.7, 1.25)); D.updateMatrix(); leaves.setMatrixAt(i, D.matrix); }
    leaves.castShadow = true; leaves.frustumCulled = false; g.add(leaves);
    for (let i = 0; i < 9; i++) { const tw = rod(dark, 0.006, 0.012, rnd(0.45, 0.8), 4); tw.position.set(0, 1.55, 0); tw.rotation.set(Math.PI + rnd(-0.9, 0.9), 0, rnd(-1.1, 1.1)); g.add(tw); }
    const roseT = d => canvasTex(128, 128, (c, w, h) => { c.fillStyle = d ? '#3a3834' : '#ffffff'; c.fillRect(0, 0, w, h); c.strokeStyle = d ? '#ffffff' : INK; c.lineWidth = 4; for (let y = 10; y < h; y += 22) { c.beginPath(); for (let x = 0; x <= w; x += 8) c.lineTo(x, y + Math.sin(x * 0.2 + y) * 7); c.stroke(); } });
    const wm = lam({ map: roseT(false) }), dm = lam({ map: roseT(true) }), roses = [];
    for (const [x, y, z, d] of [[-0.62, 2.3, 0.28, 0], [0.24, 2.44, 0.26, 1], [0.6, 2.12, 0.1, 1], [-0.52, 1.8, 0.32, 1], [0.06, 1.92, 0.5, 0], [-0.16, 1.5, 0.38, 1], [0.66, 1.56, 0.3, 0]]) { const r = new THREE.Mesh(new THREE.SphereGeometry(0.125, 12, 8), d ? dm : wm); r.position.set(x, y, z); r.castShadow = true; g.add(r); roses.push(r); }
    g.userData = { roses, wm, dm }; return g;
  }
  // the flamingo she carries for a mallet: body under her arm, legs hanging, a long neck that will not stay straight. curl(k): 0 neck straight down to strike, 1 twisted up to look in her face
  function flamingo() {
    const g = new THREE.Group(), F = furM(furTex(0.35, 380, [10, 22]), 0.8, 0.8);
    g.add(skin([[0, 0, -0.26, 0.01], [0, 0.01, -0.2, 0.08, 0.075], [0, 0.02, -0.05, 0.12, 0.11], [0, 0.01, 0.1, 0.1, 0.09], [0, 0.0, 0.2, 0.05, 0.045]], F, { up: [0, 1, 0], n: 14 }));
    for (const s of [-1, 1]) { const l = rod(dark, 0.007, 0.007, 0.5, 4); l.position.set(s * 0.04, -0.06, -0.12); l.rotation.x = -0.2 - (s > 0 ? 0.12 : 0); g.add(l); l.add(ell(dark, 0.03, 0.006, 0.04, 0, -0.5, 0.02)); }
    const NR = 18, NS = 8, npos = new Float32Array((NR + 1) * (NS + 1) * 3), nidx = []; for (let i = 0; i < NR; i++) for (let j = 0; j < NS; j++) { const A = i * (NS + 1) + j, B = A + 1, C = A + NS + 1, D = C + 1; nidx.push(A, C, B, B, C, D); }
    const ng = new THREE.BufferGeometry(); ng.setAttribute('position', new THREE.BufferAttribute(npos, 3)); ng.setIndex(nidx); const neck = new THREE.Mesh(ng, drawn(lam({ color: '#ffffff', side: THREE.DoubleSide }))); neck.castShadow = true; neck.frustumCulled = false; g.add(neck);
    const head = new THREE.Group(); head.add(ell(white, 0.036, 0.04, 0.052), skin([[0, 0.005, 0.03, 0.024], [0, -0.005, 0.075, 0.022, 0.026], [0, -0.035, 0.115, 0.018, 0.02], [0, -0.08, 0.12, 0.012, 0.012], [0, -0.095, 0.105, 0.004]], dark, { up: [0, 1, 0], n: 6 })); for (const s of [-1, 1]) head.add(ell(dark, 0.007, 0.007, 0.006, s * 0.03, 0.014, 0.022)); g.add(head);
    const crv = pts => new THREE.CatmullRomCurve3(pts.map(p => new V3(0, p[0], p[1]))).getSpacedPoints(60), CA = crv([[0, 0.18], [-0.22, 0.34], [-0.48, 0.42], [-0.74, 0.44]]), CB = crv([[0, 0.18], [-0.16, 0.38], [-0.02, 0.56], [0.26, 0.58], [0.46, 0.48], [0.52, 0.36]]);
    const pt = (t, k, o) => { const i = Math.min(60, Math.round(t * 60)), a = CA[i], b = CB[i]; o[0] = a.y + (b.y - a.y) * k; o[1] = a.z + (b.z - a.z) * k; }, c0 = [0, 0], c1 = [0, 0];
    g.userData = { head, curl(k) { for (let i = 0; i <= NR; i++) { const t = i / NR; pt(t, k, c0); if (t < 0.97) pt(t + 0.03, k, c1); else { pt(t - 0.03, k, c1); c1[0] = 2 * c0[0] - c1[0]; c1[1] = 2 * c0[1] - c1[1]; } let ty = c1[0] - c0[0], tz = c1[1] - c0[1]; const L = Math.hypot(ty, tz) || 1; ty /= L; tz /= L; const r = 0.03 - 0.008 * t;
        for (let j = 0; j <= NS; j++) { const th = j / NS * Math.PI * 2, o = (i * (NS + 1) + j) * 3; npos[o] = Math.cos(th) * r; npos[o + 1] = c0[0] + Math.sin(th) * r * tz; npos[o + 2] = c0[1] - Math.sin(th) * r * ty; }
        if (i === NR) { head.position.set(0, c0[0], c0[1]); head.rotation.x = Math.atan2(-ty, tz) + 0.35; } } ng.attributes.position.needsUpdate = true; ng.computeVertexNormals(); } };
    g.userData.curl(1); return g;
  }
  // the hedgehog: rolled(true) a ball of spines for the mallet to strike, rolled(false) walking off on its feet
  function hedgehog() {
    const g = new THREE.Group(), spT = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#ffffff'; c.fillRect(0, 0, w, h); c.lineCap = 'round'; for (let i = 0; i < 700; i++) { const x = rnd(0, w), y = rnd(0, h), v = Math.round(25 + 170 * Math.pow(Math.random(), 1.3)); c.strokeStyle = `rgb(${v},${v},${v})`; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + rnd(-4, 4), y + rnd(9, 18)); c.stroke(); } }, true);
    const sm = drawn(lam({ map: spT })), ball = new THREE.Group(), walk = new THREE.Group(); g.add(ball, walk);
    const b = new THREE.Mesh(new THREE.IcosahedronGeometry(0.115, 2), sm); b.position.y = 0.115; b.castShadow = true; ball.add(b); for (let i = 0; i < 40; i++) { const s = rod(dark, 0.003, 0.003, 0.06, 3), a = rnd(0, 6.3), e = rnd(-0.3, 1.5); s.position.set(Math.cos(a) * Math.cos(e) * 0.105, 0.115 + Math.sin(e) * 0.105, Math.sin(a) * Math.cos(e) * 0.105); s.rotation.set(Math.sin(a) * (Math.PI / 2 - e) + Math.PI, 0, -Math.cos(a) * (Math.PI / 2 - e)); ball.add(s); }
    walk.add(skin([[0, 0.08, -0.2, 0.02], [0, 0.1, -0.15, 0.1, 0.085], [0, 0.12, 0, 0.125, 0.11], [0, 0.1, 0.12, 0.09, 0.075], [0, 0.07, 0.2, 0.04, 0.036], [0, 0.055, 0.26, 0.012]], sm, { up: [0, 1, 0], n: 12 }), ell(dark, 0.012, 0.012, 0.012, 0, 0.056, 0.265)); for (const s of [-1, 1]) for (const z of [-0.1, 0.1]) walk.add(ell(dark, 0.022, 0.02, 0.035, s * 0.07, 0.02, z)); for (const s of [-1, 1]) walk.add(ell(dark, 0.007, 0.007, 0.006, s * 0.03, 0.085, 0.21));
    g.userData = { ball, rolled(r) { ball.visible = r; walk.visible = !r; } }; g.userData.rolled(true); return g;
  }
  return { rabbit, dormouse, topHat, crown, cat, card, arch, roseTree, flamingo, hedgehog, skin, furM, furTex, ell, rod, lam, drawn, white, pale, dark, mid };
}
