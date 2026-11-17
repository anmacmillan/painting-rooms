/* The set pieces: the painters' room with its unfinished wall, the colour sellers' counters, the dog in Paquius Proculus' doorway, the baker and his wife,
   and the things carried. The three stagings each end by giving way to a photograph of the real work. */
export function makeProps({ THREE }) {
  const lam = c => new THREE.MeshLambertMaterial({ color: c }), COL = { black: '#1c1a18', blue: '#2f6fc0', red: '#c0281e', ochre: '#d9a23a', green: '#5a8a5a', white: '#f1ede2' };
  const pot = (c, r = 0.07) => { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.62, r * 0.9, 12), lam('#b8734a')), p = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.86, r * 0.86, 0.012, 12), lam(COL[c] || c)); b.position.y = r * 0.45; p.position.y = r * 0.88; g.add(b, p); return g; };
  const loaf = () => { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.SphereGeometry(0.12, 14, 8), lam('#c8924a')); b.scale.y = 0.42; g.add(b); for (let i = 0; i < 4; i++) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.235, 0.012, 0.012), lam('#8a5a2a')); c.position.y = 0.047; c.rotation.y = i * Math.PI / 4; g.add(c); } return g; };      /* a round loaf scored into eight, as the loaves found at Pompeii are */
  function tray() { const g = new THREE.Group(), b = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.025, 0.28), lam('#7a5632')); g.add(b); g.userData.slots = [[-0.15, 0], [0, 0.02], [0.15, 0], [0, -0.07]]; g.userData.on = []; return g; }
  function setTray(g, ids) { for (const o of g.userData.on) g.remove(o); g.userData.on = []; ids.forEach((id, i) => { const o = id === 'bread' ? loaf() : pot(id); const [x, z] = g.userData.slots[i % 4]; o.position.set(x, 0.013, z); if (id === 'bread') o.scale.setScalar(0.8); g.add(o); g.userData.on.push(o); }); }
  const cushion = () => { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.SphereGeometry(0.2, 14, 10), lam('#a8483a')); c.scale.set(1.15, 0.45, 1); g.add(c); const band = new THREE.Mesh(new THREE.TorusGeometry(0.135, 0.016, 6, 18), lam('#e2d8c0')); band.rotation.y = Math.PI / 2; band.position.y = -0.1; band.scale.y = 1.25; g.add(band); return g; };
  return { pot, loaf, tray, setTray, cushion, COL, lam };
}

export function makeHouse({ THREE, scene, TOWN, T, FIG, Tn, arms, onBone, PROPS, at, side, hAt, h0, OWN, pHome, pDog, pNeo, half, S_FAR, LEN, sDog, sOutF, W }) {
  const V3 = THREE.Vector3, lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o), D2R = Math.PI / 180, mix = (a, b, t) => a + (b - a) * t, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const ctex = (w, h, draw) => { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const on = (o, cast = true, recv = true) => { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = recv; } }); return o; };
  const KERB = TOWN.KERB;
  /* a front of the level's own: clears the rule-made bays round it and returns a frame on the house wall. sg: +1 right of the way, -1 left */
  function own(p, sg, hw, w) { const [x, z] = side(p, 0, sg * hw), tx = p.dx, tz = p.dz, nx = -sg * -p.dz, nz = -sg * p.dx; const ox = x - tx * w / 2, oz = z - tz * w / 2; return TOWN.frame(ox, oz, tx, tz, nx, nz, h0(x, z) + KERB - 0.02); }

  /* ================= 1. the sellers' counters: a shop front each, with the pots of colour on the counter ================= */
  const pickAt = {}, sellers = [];
  for (const pk of W.picks) { const s0 = sideS(pk.p), p = at(s0), hw = half(s0), F = own(p, pk.side, hw, 5.2); F.pentOK = false; TOWN.bay(F, 5.2, { kind: 'shop', ow: 3.4, two: true, H: 6.6, counter: false, pent: hw > 3, dado: 'red', up: 'white' });
    TOWN.block('counter', F, 1.2, 3.4, 0, 0.92, -0.7, -0.1, 'sill');
    const g = new THREE.Group(), [cx, cy, cz] = F.P(2.3, 0.93, -0.4); g.position.set(cx, cy, cz); g.rotation.y = Math.atan2(F.n[0], F.n[1]); scene.add(g);
    for (let i = 0; i < 5; i++) { const o = PROPS.pot(i % 2 ? pk.id : pk.also[i % pk.also.length], 0.085); o.position.set(-0.8 + i * 0.4, 0, (i % 2) * 0.12 - 0.05); g.add(o); } const heap = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.2, 12), PROPS.lam(PROPS.COL[pk.id])); heap.position.set(0, 0.1, -0.02); g.add(heap); on(g);
    const man = FIG.spawn(pk.fig || 'man_beard', { size: 1.1, adult: true }), [mx, my, mz] = F.P(2.4, 0, -1.3); man.position.set(mx, my, mz); man.rotation.y = Math.atan2(F.n[0], F.n[1]); FIG.pose(man, 0, 0);
    const [px, , pz] = F.P(2.3, 0, 1.0), mark = new THREE.Mesh(new THREE.TorusGeometry(0.5, 0.05, 8, 28), basic({ color: PROPS.COL[pk.id] === '#1c1a18' ? '#ffe9a0' : PROPS.COL[pk.id] })); mark.rotation.x = Math.PI / 2; mark.position.set(px, hAt(px, pz) + 0.08, pz); scene.add(mark);
    const float = PROPS.pot(pk.id, 0.16); float.position.set(px, hAt(px, pz) + 1.15, pz); scene.add(float);
    pickAt[pk.id] = { x: px, z: pz, g: man, mark, float, heap }; sellers.push({ man, pk, F });
    /* the shop's sign: painted over the opening */
    const sign = ctex(512, 96, (c, w, h) => { c.fillStyle = '#efe6d2'; c.fillRect(0, 0, w, h); c.fillStyle = '#8f1f16'; c.font = 'bold 60px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(pk.sign, w / 2, h / 2 + 4); });
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 0.48), lam({ map: sign })), [sx, sy, sz] = F.P(2.6, 3.25, 0.03); sg.position.set(sx, sy, sz); sg.rotation.y = Math.atan2(F.n[0], F.n[1]); scene.add(sg); }
  function sideS(pt) { return sOutF(pt); }
  const took = id => { const m = pickAt[id]; m.mark.visible = m.float.visible = false; };

  /* ================= 2. the dog in the doorway of Paquius Proculus (I 7, 1): the mosaic is still on the floor of that doorway ================= */
  const dogF = own(pDog, -1, half(sDog), 6.4); TOWN.bay(dogF, 6.4, { kind: 'door', ow: 2.0, at: 2.2, oh: 3.3, open: true, two: true, H: 7.2, dado: 'red', up: 'white', pent: false });
  const mosaic = ctex(512, 1024, (c, w, h) => { c.fillStyle = '#e9e4d8'; c.fillRect(0, 0, w, h); c.fillStyle = '#26262a'; c.fillRect(22, 22, w - 44, 14); c.fillRect(22, h - 36, w - 44, 14); c.fillRect(22, 22, 14, h - 44); c.fillRect(w - 36, 22, 14, h - 44);
    c.strokeStyle = 'rgba(60,60,64,.35)'; c.lineWidth = 1; for (let i = 0; i < w; i += 9) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i, h); c.stroke(); } for (let j = 0; j < h; j += 9) { c.beginPath(); c.moveTo(0, j); c.lineTo(w, j); c.stroke(); }
    /* the two leaves of a door, one ajar, set in black stones at the head of the floor, as in the mosaic */
    c.fillStyle = '#3a3a40'; c.fillRect(120, 60, 120, 250); c.fillRect(272, 60, 120, 250); c.fillStyle = '#e9e4d8'; for (const x of [134, 286]) for (const y of [76, 196]) c.fillRect(x, y, 92, 98); });
  { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 3.4), lam({ map: mosaic })), [x, y, z] = dogF.P(3.2, 0.02, -1.9); m.rotation.x = -Math.PI / 2; m.rotation.z = -Math.atan2(dogF.n[0], dogF.n[1]) + Math.PI; m.position.set(x, y, z); m.receiveShadow = true; scene.add(m); }
  const DOG = makeDog(); { const [x, y, z] = dogF.P(3.2, 0.03, -1.0); DOG.g.position.set(x, y, z); DOG.home = [x, y, z]; DOG.face = Math.atan2(dogF.n[0], dogF.n[1]); DOG.g.rotation.y = DOG.face; }
  function makeDog() {
    const g = new THREE.Group(), coat = lam({ color: '#2e2a28' }), light = lam({ color: '#5a4e44' }), red = lam({ color: '#b0281e' }), iron = lam({ color: '#6a6a70' });
    const cap = (m, r, l, x, y, z, rx = 0, rz = 0, par = g) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 12), m); o.position.set(x, y, z); o.rotation.set(rx, 0, rz); par.add(o); return o; };
    const body = new THREE.Group(); g.add(body); cap(coat, 0.15, 0.42, 0, 0.5, 0, Math.PI / 2, 0, body); const chest = new THREE.Mesh(new THREE.SphereGeometry(0.19, 14, 10), coat); chest.position.set(0, 0.52, 0.24); chest.scale.set(0.95, 1.05, 1.1); body.add(chest);
    const neck = new THREE.Group(); neck.position.set(0, 0.6, 0.36); body.add(neck); cap(coat, 0.085, 0.16, 0, 0.1, 0.06, 0.6, 0, neck); const head = new THREE.Group(); head.position.set(0, 0.24, 0.15); neck.add(head);
    const skull = new THREE.Mesh(new THREE.SphereGeometry(0.115, 14, 10), coat); skull.scale.set(0.95, 0.95, 1.1); head.add(skull); cap(coat, 0.055, 0.12, 0, -0.03, 0.15, Math.PI / 2, 0, head); const nose = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 6), lam({ color: '#0c0a0a' })); nose.position.set(0, -0.015, 0.265); head.add(nose);
    for (const e of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 8), coat); ear.position.set(e * 0.075, 0.12, -0.02); ear.rotation.z = -e * 0.25; head.add(ear); const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), basic({ color: '#e8d8a0' })); eye.position.set(e * 0.055, 0.03, 0.1); head.add(eye); }
    const jaw = cap(light, 0.035, 0.1, 0, -0.075, 0.13, Math.PI / 2, 0, head); const collar = new THREE.Mesh(new THREE.TorusGeometry(0.095, 0.022, 8, 18), red); collar.position.set(0, 0.07, 0.04); collar.rotation.x = Math.PI / 2 - 0.6; neck.add(collar);
    const tail = new THREE.Group(); tail.position.set(0, 0.6, -0.34); body.add(tail); cap(coat, 0.03, 0.3, 0, 0.13, -0.08, -0.6, 0, tail);
    const legs = []; for (const [x, z, fr] of [[-0.1, 0.27, 1], [0.1, 0.27, 1], [-0.1, -0.27, 0], [0.1, -0.27, 0]]) { const up = new THREE.Group(); up.position.set(x, 0.44, z); body.add(up); cap(coat, 0.05, 0.16, 0, -0.1, 0, 0, 0, up); const lo = new THREE.Group(); lo.position.set(0, -0.22, 0); up.add(lo); cap(coat, 0.035, 0.16, 0, -0.1, 0, 0, 0, lo); const paw = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), coat); paw.position.set(0, -0.2, 0.03); paw.scale.set(1, 0.6, 1.4); lo.add(paw); legs.push({ up, lo, fr }); }
    const chain = new THREE.Group(); g.add(chain); for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.01, 5, 10), iron); chain.add(l); }
    g.scale.setScalar(1.25); on(g); scene.add(g);
    /* pose: lie 0..1 (down on the floor, head up, as in the mosaic), bark 0..1, t time */
    function pose(lie, bark, t) { body.position.y = -0.3 * lie; body.rotation.x = 0; for (const L of legs) { L.up.rotation.x = L.fr ? -1.25 * lie : 1.0 * lie; L.lo.rotation.x = L.fr ? 0.2 * lie : -2.1 * lie; if (!lie) { L.up.rotation.x = 0.12 * Math.sin(t * 12 + (L.fr ? 0 : 2)) * bark; } }
      neck.rotation.x = -0.25 * lie - 0.3 * bark * Math.max(0, Math.sin(t * 9)); head.rotation.x = 0.25 * lie; jaw.rotation.x = Math.PI / 2 + 0.5 * bark * Math.max(0, Math.sin(t * 9)); tail.rotation.x = -0.4 + 0.3 * lie; tail.rotation.z = 0.5 * Math.sin(t * 10) * bark; body.position.z = 0.25 * bark * Math.max(0, Math.sin(t * 9));
      chain.children.forEach((l, i) => { const k = i / 8; l.position.set(0.3 * k, 0.72 - 0.3 * lie - 0.55 * Math.sin(k * Math.PI * 0.5) - 0.15 * Math.sin(k * Math.PI), 0.36 - 1.15 * k); l.rotation.set(i % 2 ? 0 : Math.PI / 2, 0.4, 0); }); }
    pose(0, 0, 0); return { g, pose, lie: 0 };
  }

  /* ================= 3. Terentius Neo the baker and his wife, at the door of VII 2, 6 on the Via Stabiana ================= */
  const neoF = own(pNeo, -1, half(S_FAR - 1), 6.4); TOWN.bay(neoF, 6.4, { kind: 'door', ow: 2.6, at: 1.9, oh: 3.2, open: true, two: true, H: 6.8, pent: false, dado: 'red', up: 'white' });
  const neoG = new THREE.Group(); { const [x, y, z] = neoF.P(3.2, 0, 0); neoG.position.set(x, y, z); neoG.rotation.y = Math.atan2(neoF.n[0], neoF.n[1]); scene.add(neoG); }
  
  const neo = FIG.spawn('neo', { size: 1.16, adult: true }), wife = FIG.spawn('wife', { size: 1.08, adult: true }); scene.remove(neo, wife); neoG.add(neo, wife);
  /* seen from the street she stands on the left and a little forward, he on the right, as in the painting */
  wife.position.set(-0.36, 0, -0.55); neo.position.set(0.16, 0, -0.85); wife.rotation.y = 0.1; neo.rotation.y = -0.12;
  const stylus = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.005, 0.2, 6), PROPS.lam('#3a2a1c')), tablet = new THREE.Group(), scroll = new THREE.Group();
  { for (const e of [-1, 1]) { const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.2, 0.012), PROPS.lam('#2a1c14')); leaf.position.x = e * 0.058; leaf.rotation.y = -e * 0.22; tablet.add(leaf); const wax = new THREE.Mesh(new THREE.PlaneGeometry(0.085, 0.17), PROPS.lam('#16100c')); wax.position.set(e * 0.058, 0, 0.008); wax.rotation.y = -e * 0.22; tablet.add(wax); }
    const roll = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.24, 12), PROPS.lam('#efe6d2')); scroll.add(roll); const tag = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.07, 0.03), PROPS.lam('#b0281e')); tag.position.set(0.035, 0.1, 0); scroll.add(tag); }
  wife.userData.aR.add(stylus); wife.userData.aL.add(tablet); neo.userData.aR.add(scroll); stylus.position.set(0, 0.06, 0.06); tablet.position.set(0, 0.02, 0.07); scroll.position.set(0, 0.07, 0.05);
  const loafGive = PROPS.loaf(); loafGive.visible = false; scene.add(loafGive);
  function posePair(k) {      /* k 0..1: from standing at ease to the pose of the portrait */
    FIG.pose(neo, 0, 0); FIG.pose(wife, 0, 0);
    Tn(wife, 'upperarmR', mix(-10, -34, k), mix(0, -6, k), 0); Tn(wife, 'forearmR', mix(-20, -140, k)); Tn(wife, 'upperarmL', mix(-10, -28, k), mix(0, 6, k), 0); Tn(wife, 'forearmL', mix(-20, -100, k)); Tn(wife, 'head', 0, 0, mix(0, -6, k));
    Tn(neo, 'upperarmR', mix(-10, -30, k), mix(0, -8, k), 0); Tn(neo, 'forearmR', mix(-20, -142, k)); Tn(neo, 'head', 0, 0, mix(0, 5, k)); }
  posePair(0);

  /* ================= 4. the room the painters were working in (IX 12, 9): a set, built where the house stands ================= */
  const R0 = W.room.at, RY = h0(R0[0], R0[1]) + KERB, room = new THREE.Group(); room.position.set(R0[0], RY, R0[1]); room.rotation.y = W.room.turn; scene.add(room);
  const RW = 6.4, RD = 5.2, RH = 3.5;
  /* the long wall (north): from the photograph of the room. Finished: the black, yellow and red fields with their slender painted architecture. Not begun: the dado.
     Laid this morning and still blank: the square in the middle of the red field, where the picture was to go. */
  const wallPaint = (c, w, h, o) => { const Y = v => h - v / RH * h, X = v => v / o.len * w; c.fillStyle = '#d8d0c0'; c.fillRect(0, 0, w, h);
    /* the upper zone: white, with thin painted columns and garlands */
    c.fillStyle = '#efe9da'; c.fillRect(0, 0, w, Y(2.55)); c.strokeStyle = '#c9a23a'; c.lineWidth = 5; for (let x = 0.35; x < o.len; x += 0.72) { c.beginPath(); c.moveTo(X(x), Y(RH)); c.lineTo(X(x), Y(2.62)); c.stroke(); } c.strokeStyle = '#7f9a8a'; c.lineWidth = 3; for (let x = 0.35; x < o.len - 0.7; x += 0.72) { c.beginPath(); c.moveTo(X(x), Y(3.3)); c.quadraticCurveTo(X(x + 0.36), Y(2.95), X(x + 0.72), Y(3.3)); c.stroke(); }
    c.fillStyle = '#8a6a3a'; c.fillRect(0, Y(2.62), w, 7);
    for (const f of o.fields) { c.fillStyle = f.c; c.fillRect(X(f.a), Y(2.55), X(f.b) - X(f.a), Y(0.95) - Y(2.55)); c.strokeStyle = f.line || 'rgba(255,255,255,.55)'; c.lineWidth = 3; c.strokeRect(X(f.a) + 12, Y(2.55) + 12, X(f.b) - X(f.a) - 24, Y(0.95) - Y(2.55) - 24);
      if (f.arch) { /* a doorway painted in the field, with thin gold columns: architecture that is not there */ const m = (f.a + f.b) / 2; c.fillStyle = '#efe6d6'; c.fillRect(X(m - 0.2), Y(2.45), X(0.4), Y(1.0) - Y(2.45)); c.fillStyle = '#d9b24a'; c.fillRect(X(m - 0.25), Y(2.5), 7, Y(1.0) - Y(2.5)); c.fillRect(X(m + 0.25) - 7, Y(2.5), 7, Y(1.0) - Y(2.5)); c.fillStyle = '#c9a23a'; c.fillRect(X(m - 0.13), Y(1.7), X(0.1), Y(1.0) - Y(1.7)); c.fillRect(X(m + 0.03), Y(1.7), X(0.1), Y(1.0) - Y(1.7)); c.fillStyle = '#b0706a'; c.fillRect(X(m - 0.035), Y(1.55), X(0.07), Y(1.05) - Y(1.55)); c.beginPath(); c.arc(X(m), Y(1.62), 9, 0, 7); c.fill(); }
      if (f.cols) { c.strokeStyle = '#f3ead2'; c.lineWidth = 4; for (const u of [0.3, 0.42, 0.58, 0.7]) { const x = X(f.a + (f.b - f.a) * u); c.beginPath(); c.moveTo(x, Y(2.4)); c.lineTo(x, Y(1.1)); c.stroke(); } } }
    /* the dado: bare plaster, not yet painted */
    c.fillStyle = '#cfc7b6'; c.fillRect(0, Y(0.95), w, h - Y(0.95)); for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(${90 + Math.random() * 60},${84 + Math.random() * 50},${70 + Math.random() * 40},.07)`; c.fillRect(Math.random() * w, Math.random() * h, 20 + Math.random() * 60, 3 + Math.random() * 8); } };
  const NW = { len: RW, fields: [{ a: 0, b: 0.55, c: '#1d1b1b' }, { a: 0.55, b: 1.75, c: '#d6a83c', cols: true }, { a: 1.75, b: 3.95, c: '#a8362a' }, { a: 3.95, b: 4.95, c: '#d9ae48' }, { a: 4.95, b: 5.25, c: '#d8d0c0', line: 'rgba(0,0,0,0)' }, { a: 5.25, b: RW, c: '#1d1b1b', arch: true }] };
  const EW = { len: RD, fields: [{ a: 0, b: 1.3, c: '#1d1b1b', arch: true }, { a: 1.3, b: 2.5, c: '#d6a83c', cols: true }, { a: 2.5, b: 4.4, c: '#a8362a' }, { a: 4.4, b: RD, c: '#d9ae48' }] };
  const mkWall = (o, len, tw) => new THREE.Mesh(new THREE.PlaneGeometry(len, RH), lam({ map: ctex(tw, 1024, (c, w, h) => wallPaint(c, w, h, o)) }));
  const wN = mkWall(NW, RW, 2048); wN.position.set(0, RH / 2, -RD / 2); room.add(wN);
  const wE = mkWall(EW, RD, 1536); wE.position.set(RW / 2, RH / 2, 0); wE.rotation.y = -Math.PI / 2; room.add(wE);
  const wW = mkWall({ len: RD, fields: [{ a: 0, b: 1.6, c: '#d9ae48' }, { a: 1.6, b: 3.6, c: '#a8362a' }, { a: 3.6, b: RD, c: '#1d1b1b' }] }, RD, 1024); wW.position.set(-RW / 2, RH / 2, 0); wW.rotation.y = Math.PI / 2; room.add(wW);
  const wS = new THREE.Mesh(new THREE.PlaneGeometry(RW, RH), lam({ color: '#d8d0c0' })); wS.position.set(0, RH / 2, RD / 2); wS.rotation.y = Math.PI; room.add(wS);
  const floorT = ctex(1024, 1024, (c, w, h) => { c.fillStyle = '#cfc6b0'; c.fillRect(0, 0, w, h); for (let i = 0; i < 5000; i++) { c.fillStyle = ['#e6e0d0', '#b8ae98', '#3a3a3e', '#d9d0bc'][Math.floor(Math.random() * 4)]; c.fillRect(Math.random() * w, Math.random() * h, 5, 5); }
    c.strokeStyle = '#2a2a2e'; c.lineWidth = 8; c.strokeRect(300, 330, 424, 364); c.strokeRect(330, 360, 364, 304); const cols = ['#b0483a', '#e6dcc0', '#5a6a5a', '#d6a83c', '#3a3a40']; for (let i = 0; i < 6; i++) for (let j = 0; j < 5; j++) { c.fillStyle = cols[(i + j * 2) % 5]; c.beginPath(); c.arc(360 + i * 61, 392 + j * 60, 24, 0, 7); c.fill(); } });
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(RW, RD), lam({ map: floorT })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.01; room.add(floor);
  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(RW + 1, RD + 1), lam({ color: '#b8ae9a', side: THREE.DoubleSide })); ceil.rotation.x = Math.PI / 2; ceil.position.y = RH; room.add(ceil);
  const roomL = new THREE.PointLight(new THREE.Color('#ffe6c0'), 9, 14, 1.2); roomL.position.set(-0.8, 2.6, 1.6); room.add(roomL);
  /* today's patch: the square in the red field. Its paint is drawn afresh as the master works */
  const PX = 2.85 - RW / 2, PY = 1.78, PS = 0.86, patchC = document.createElement('canvas'); patchC.width = patchC.height = 256; const pg = patchC.getContext('2d'), patchT = new THREE.CanvasTexture(patchC); patchT.colorSpace = THREE.SRGBColorSpace;
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(PS, PS), lam({ map: patchT })); patch.position.set(PX, PY, -RD / 2 + 0.012); room.add(patch);
  function drawPatch(wet, blue, red, black) {
    pg.fillStyle = `rgb(${mix(226, 196, wet)},${mix(220, 188, wet)},${mix(204, 170, wet)})`; pg.fillRect(0, 0, 256, 256);      /* wet plaster is darker than dry */
    if (blue > 0) { pg.fillStyle = '#6f9fd0'; pg.fillRect(0, 0, 256 * Math.min(1, blue * 1.4), 118); pg.fillStyle = '#8fb6dc'; pg.fillRect(0, 96, 256 * Math.min(1, blue * 1.4), 22); }
    if (red > 0) { pg.fillStyle = '#b8322a'; pg.beginPath(); pg.moveTo(84, 150); pg.lineTo(84 + 62 * red, 150); pg.lineTo(84 + 80 * red, 244); pg.lineTo(70, 244); pg.fill(); }
    /* the drawing under the paint: two figures marked out in yellow ochre */
    pg.strokeStyle = '#b8862a'; pg.lineWidth = 2.5; pg.lineCap = 'round'; const L = (...p) => { pg.beginPath(); pg.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) pg.lineTo(p[i], p[i + 1]); pg.stroke(); };
    const E2 = (x, y, rx, ry, r = 0) => { pg.beginPath(); pg.ellipse(x, y, rx, ry, r, 0, 7); pg.stroke(); }; E2(100, 70, 13, 16); E2(100, 122, 20, 36, 0.08); L(86, 150, 76, 200, 80, 244); L(112, 152, 122, 200, 116, 244); L(84, 100, 62, 130, 70, 160); L(116, 98, 146, 116, 166, 104); E2(178, 92, 12, 15); E2(180, 142, 18, 34, -0.1); L(168, 170, 160, 244); L(192, 170, 200, 244); L(196, 118, 216, 146, 210, 170); L(66, 160, 60, 60); L(0, 118, 60, 118); L(216, 118, 256, 118); pg.beginPath(); pg.moveTo(20, 244); pg.quadraticCurveTo(128, 232, 240, 244); pg.stroke();
    if (black > 0) { pg.strokeStyle = '#1c1a18'; pg.lineWidth = 3.5; pg.beginPath(); pg.ellipse(100, 70, 13, 16, 0, Math.PI * 0.6, Math.PI * (0.6 + 1.9 * black)); pg.stroke(); if (black > 0.5) { pg.beginPath(); pg.ellipse(100, 122, 20, 36, 0.08, 0, 6.3 * (black - 0.5) * 2); pg.stroke(); } }
    pg.strokeStyle = 'rgba(70,60,50,.8)'; pg.lineWidth = 3; pg.strokeRect(1.5, 1.5, 253, 253); patchT.needsUpdate = true; }
  drawPatch(1, 0, 0, 0);
  /* the painters' things, as they were found: pots and bowls of colour on the floor, a jar of lime, a pair of compasses; and their trestle */
  const kit = new THREE.Group(); room.add(kit);
  { const cols = ['ochre', 'red', 'green', 'white', 'ochre', 'black', 'blue', 'red', 'white', 'green', 'ochre']; cols.forEach((c, i) => { const o = PROPS.pot(c, 0.07 + (i % 3) * 0.015); o.position.set(0.5 + (i % 4) * 0.24 + (i % 2) * 0.05, 0.01, -1.55 + Math.floor(i / 4) * 0.25); kit.add(o); });
    const wood = PROPS.lam('#7a5632'); for (const x of [-1.2, 1.05]) for (const z of [-1.95, -1.45]) { const leg = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.62, 0.07), wood); leg.position.set(PX + x - 0.05, 0.31, z); kit.add(leg); } const plank = new THREE.Mesh(new THREE.BoxGeometry(2.7, 0.06, 0.62), wood); plank.position.set(PX - 0.1, 0.65, -1.7); kit.add(plank);
    const jar = new THREE.Mesh(new THREE.LatheGeometry([[0.0, 0], [0.16, 0.02], [0.24, 0.25], [0.2, 0.5], [0.1, 0.6], [0.12, 0.66]].map(p => new THREE.Vector2(p[0], p[1])), 14), PROPS.lam('#b8734a')); jar.position.set(2.5, 0, -1.9); kit.add(jar); const limeT = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.3, 0.3, 14), PROPS.lam('#8a7a66')); limeT.position.set(-2.4, 0.15, -1.6); kit.add(limeT); const lime = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.02, 14), PROPS.lam('#f4f1ea')); lime.position.set(-2.4, 0.3, -1.6); kit.add(lime);
    on(kit); }
  const master = FIG.spawn('pictor', { size: 1.14, adult: true }), mate = FIG.spawn('tector', { size: 1.12, adult: true }), lad = FIG.spawn('youth', { size: 1.0 }), girl2 = FIG.spawn('girl', { size: 0.9 }); for (const f of [master, mate, lad, girl2]) { scene.remove(f); room.add(f); f.userData.sh.visible = false; }
  const brush = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.3, 6), PROPS.lam('#5a3a1c')); master.userData.aR.add(brush); brush.position.set(0, 0.1, 0.05); const float = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.03, 0.12), PROPS.lam('#8a6a44')); mate.userData.aR.add(float); float.position.set(0, 0.06, 0.06);
  const tray2 = PROPS.tray(); onBone(girl2, 'spine', tray2, 0, 0.98, 0.3);
  const dust = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(new Float32Array(600).map(() => Math.random()), 3)), new THREE.PointsMaterial({ color: '#e6dccb', size: 0.025, transparent: true, opacity: 0 })); dust.scale.set(RW, RH, RD); dust.position.set(-RW / 2, 0, -RD / 2); room.add(dust);
  const W2 = (x, y, z) => new V3(x, y, z).applyMatrix4(room.matrixWorld); room.updateMatrixWorld(true);
  const stand = (f, x, z, ry, pace = 0, ph = 0) => { f.position.set(x, 0, z); f.rotation.y = ry; FIG.pose(f, ph, pace); };
  function roomIdle(t, work = 1) {
    stand(master, PX - 0.8, -1.72, Math.PI * 0.9, 0); master.position.y = 0.68; Tn(master, 'upperarmR', -96 - 10 * Math.sin(t * 2.2) * work, 20, 0); Tn(master, 'forearmR', -40 - 16 * Math.sin(t * 3.1) * work); Tn(master, 'head', -8);
    stand(mate, PX + 1.5, -1.9, Math.PI, 0); Tn(mate, 'upperarmR', -70 - 26 * Math.sin(t * 1.6) * work, 0, 0); Tn(mate, 'forearmR', -30); Tn(mate, 'spine', 14);
    stand(lad, 1.0, -0.75, 2.2, 0); lad.position.y = -0.42; for (const S of 'LR') { Tn(lad, 'thigh' + S, -80, S === 'L' ? 16 : -16, 0); Tn(lad, 'shin' + S, 120); } Tn(lad, 'spine', 22); Tn(lad, 'upperarmR', -40, 0, 0); Tn(lad, 'forearmR', -70 - 14 * Math.sin(t * 6) * work); }
  /* the opening: inside the room. The master shows the girl the wet square and sends her out */
  const introCam = t => t < 4.6 ? { pos: W2(2.7, 1.6, 2.3), look: W2(-0.7, 1.3, -2.2), fov: 56, cut: t < 0.1 } : t < 9.4 ? { pos: W2(PX + 1.0, 1.62, 0.5), look: W2(PX - 0.1, PY - 0.1, -2.6), fov: 42 } : { pos: W2(2.7, 1.7, 2.3), look: W2(-1.0, 1.2, -0.6), fov: 56 };
  const speaker = who => who === 'master' ? master : who === 'mate' ? mate : girl2;

  /* ================= the three stagings ================= */
  const camAt = (F, u, y, w) => new V3(...F.P(u, y, w));
  const stDog = { key: 'dog', title: W.dog.title, line: W.dog.line, quote: W.dog.quote, img: 'images/dog.jpg', tPlate: 2.6, tMelt: 3.4, tEnd: 11.5, holdAt: 3.2, barked: false,
    ready: (s, me) => s > sDog - 3.5 && s < sDog + 8, enter() { this.plated = false; }, reset() { this.plated = false; this.barked = false; DOG.lie = 0; tess.reset(); },
    update(t) { DOG.lie = sstep(0.2, 1.6, t); DOG.g.rotation.y = DOG.face + Math.PI / 2 * sstep(0.2, 1.4, t); DOG.pose(DOG.lie, 0, t); },
    cam: t => ({ pos: camAt(dogF, 3.2, 3.0, 2.2), look: camAt(dogF, 3.2, 0.2, -1.2), fov: 40 }),
    stones(t) { tess.run(t - 3.4, 2.8, 'images/dog.jpg'); }, exit() { } };
  const stNeo = { key: 'neo', title: W.neo.title, line: W.neo.line, quote: W.neo.quote, img: 'images/neo.jpg', tPlate: 2.8, tMelt: 4.0, tEnd: 11.0, holdAt: 3.6,
    ready: (s, me) => s > S_FAR - 4.5, enter() { this.plated = false; }, reset() { this.plated = false; posePair(0); loafGive.visible = false; },
    update(t) { posePair(sstep(0.3, 2.0, t)); },
    cam: t => { const D = 3.3, c = new V3(-0.1, 1.5, -0.7).applyMatrix4(neoG.matrixWorld), n = new V3(neoF.n[0], 0, neoF.n[1]); return { pos: c.clone().addScaledVector(n, D), look: c, fov: fitH(1.05, D), near: 0.6 }; }, exit() { posePair(0); } };
  const fitH = (H, D) => 2 * Math.atan(H / 2 / D) / D2R * Math.max(1, (innerHeight / innerWidth) * 0.92);
  let pIn = { wet: 1, got: [], t0: 0 };
  const stWall = { key: 'wall', title: W.wall.title, line: W.wall.line, quote: W.wall.quote, img: 'images/wall.jpg', tPlate: 14.5, tMelt: 16, tEnd: 24.5, holdAt: 14, hideMe: true,
    ready: (s, me, E) => E.on && s > LEN - 4.5, enter(me) { this.plated = false; this.said = {}; }, reset() { this.plated = false; this.said = {}; drawPatch(1, 0, 0, 0); dust.material.opacity = 0; kit.visible = true; for (const f of [master, mate, lad, girl2]) f.visible = true; },
    update(t, dt, me) { const c = this.ctx, wet = c.G.wet, got = [...c.G.got], say = (k, who, text, secs) => { if (!this.said[k]) { this.said[k] = true; c.say(speaker(who), text, secs); } };
      const leave = sstep(8.8, 11, t), gone = t > 11.2; roomIdle(c.time, t < 3 ? 1 : 0); if (t > 5 && t < 7) { Tn(master, 'upperarmR', -120, 30, 0); Tn(master, 'forearmR', -30); }
      /* she comes in with the tray */
      { const k = sstep(0, 2.2, t); stand(girl2, mix(-2.6, PX - 1.0, k) + leave * -2.4, mix(2.2, -0.9, k) + leave * 3.4, mix(Math.PI * 0.9, Math.PI * 0.8, k) + leave * 2.2, k < 1 || (leave > 0 && leave < 1) ? 0.7 : 0, c.time * 9); Tn(girl2, 'upperarmL', -52, 8, 0); Tn(girl2, 'forearmL', -62); Tn(girl2, 'upperarmR', -52, -8, 0); Tn(girl2, 'forearmR', -62); PROPS.setTrayOnce(tray2, got, t > 7.6); }
      if (t > 2.3) say('a', 'master', wet > 0 ? W.wall.wetLine : W.wall.dryLine, 4.2);
      drawPatch(Math.max(0.2, wet) * (1 - sstep(11.5, 16, t)), 0, 0, 0);      /* not one stroke goes on: the square is still only an outline today. It dries pale */
      if (t > 4.4 && !this.said.pts) { this.said.pts = true; c.paid(wet > 0 ? got.length : 0, got.length); }
      if (t > 7) { if (!this.said.q) { c.quake(2.6); } say('q', 'mate', W.wall.quakeLine, 2.2); dust.material.opacity = 0.7 * sstep(7, 7.4, t) * (1 - sstep(10, 14, t)); const a = dust.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * 0.12; if (y < 0) y = 1; a.setY(i, y); } a.needsUpdate = true; }
      if (t > 9.0) say('l', 'master', W.wall.leaveLine, 3.4);
      for (const [f, dx, dz] of [[master, -2.3, 3.6], [mate, -3.6, 3.4], [lad, -3.0, 2.6]]) if (leave > 0) { f.position.y = 0; f.position.x += dx * leave; f.position.z += dz * leave; f.rotation.y = 2.4; FIG.pose(f, c.time * 9, leave < 1 ? 0.8 : 0); f.visible = !gone; } girl2.visible = !gone; },
    cam: t => t < 4.4 ? { pos: W2(2.7, 1.6, 2.3), look: W2(-0.7, 1.3, -2.2), fov: 56, k: t < 0.1 ? 60 : 1.6 } : t < 7.2 ? { pos: W2(PX + 1.0, 1.62, 0.5), look: W2(PX - 0.1, PY - 0.1, -2.6), fov: 42, k: 1.4 } : t < 11.6 ? { pos: W2(2.7, 1.75, 2.3), look: W2(-0.9, 1.2, -0.8), fov: 58, k: 1.3 } : { pos: W2(...W.room.photoCam.pos), look: W2(...W.room.photoCam.look), fov: W.room.photoCam.fov, k: 0.9 }, exit() { } };
  PROPS.setTrayOnce = (tr, ids, down) => { const key = ids.join() + down; if (tr.userData.key === key) return; tr.userData.key = key; PROPS.setTray(tr, down ? [] : ids); if (down) ids.forEach((id, i) => { if (!kit.userData['d' + id]) { const o = id === 'bread' ? PROPS.loaf() : PROPS.pot(id, 0.085); o.position.set(PX - 0.9 + i * 0.22, 0.01, -0.75); kit.add(o); kit.userData['d' + id] = o; } }); };
  /* the mosaic gives way to the photograph stone by stone, since that is how it was made */
  const tess = (() => { const cv = document.getElementById('tess'), g = cv.getContext('2d'), im = new Image(); let order = null, done = 0, src = '', N = 0, cols = 0, rows = 0, ts = 14;
    function fit() { const W0 = innerWidth, H0 = innerHeight, a = im.naturalWidth / im.naturalHeight, h = Math.min(H0, W0 / a), w = h * a; cv.width = Math.round(w); cv.height = Math.round(h); cv.style.width = w + 'px'; cv.style.height = h + 'px'; ts = Math.max(9, Math.round(w / 78)); cols = Math.ceil(cv.width / ts); rows = Math.ceil(cv.height / ts); N = cols * rows; order = Array.from({ length: N }, (_, i) => i); for (let i = N - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; } done = 0; g.clearRect(0, 0, cv.width, cv.height); }
    return { reset() { cv.style.display = 'none'; order = null; }, run(t, secs, url) { if (t < 0) return; if (src !== url) { src = url; im.src = url; } if (!im.complete || !im.naturalWidth) return; if (!order) { fit(); cv.style.display = 'block'; document.body.classList.add('melting'); }
        const want = Math.min(N, Math.floor(N * Math.min(1, t / secs))), sx = im.naturalWidth / cv.width, gap = t > secs + 0.8 ? 0 : 1; if (t > secs + 0.8 && done !== -1) { g.drawImage(im, 0, 0, cv.width, cv.height); done = -1; }
        while (done >= 0 && done < want) { const i = order[done++], x = (i % cols) * ts, y = Math.floor(i / cols) * ts; g.drawImage(im, x * sx, y * sx, ts * sx, ts * sx, x, y, ts - gap, ts - gap); } } }; })();
  const stages = [stDog, stNeo, stWall];

  /* ================= notices painted on the walls ================= */
  function notices(bays, dist) { let k = 0; const texs = W.notices.map(n => ctex(1024, 256, (c, w, h) => { c.fillStyle = '#efe8d8'; c.fillRect(0, 0, w, h); c.fillStyle = n.black ? '#1a1614' : '#a81f16'; c.textAlign = 'center'; c.textBaseline = 'middle'; const lines = n.t.split('|'); lines.forEach((ln, i) => { let px = i ? 62 : 104; c.font = `${px}px "Times New Roman", Georgia, serif`; while (c.measureText(ln).width > w - 50 && px > 26) { px -= 3; c.font = `${px}px "Times New Roman", Georgia, serif`; } c.fillText(ln, w / 2, lines.length === 1 ? h / 2 : i ? h * 0.76 : h * 0.34); }); })).map(t => lam({ map: t }));
    for (const b of bays) { if (dist(b.mid[0], b.mid[2]) > 7.5) continue; for (const [a, c] of b.free) { if (c - a < 2.3 || k % 3 === 2) { k++; continue; } const wdt = Math.min(2.6, c - a - 0.2), u = (a + c) / 2, m = new THREE.Mesh(new THREE.PlaneGeometry(wdt, wdt * 0.25), texs[k % texs.length]), [x, y, z] = b.F.P(u, Math.max(1.75, b.dH + 0.45), 0.02); m.position.set(x, y, z); m.rotation.y = Math.atan2(b.F.n[0], b.F.n[1]); scene.add(m); k++; } } }

  function update(dt, c) { stWall.ctx = c;
    if (c.state === 'intro') { roomIdle(c.time, 1); const t = c.intro, k = sstep(0.5, 2.4, t); stand(girl2, mix(-2.6, PX - 1.0, k), mix(2.2, -0.9, k), Math.PI * 0.85, k < 1 ? 0.6 : 0, c.time * 8); PROPS.setTrayOnce(tray2, [], false); if (t > 6.5) { const k2 = sstep(6.5, 9, t); girl2.position.x += -1.8 * k2; girl2.position.z += 3.2 * k2; girl2.rotation.y = 0.3; FIG.pose(girl2, c.time * 9, k2 < 1 ? 0.8 : 0); } }
    /* the dog: up and barking while she is near and has not yet stopped for him */
    const dd = Math.hypot(DOG.home[0] - c.me.x, DOG.home[2] - c.me.z); if (c.state === 'play') { const near = dd < 11 && c.G.stage === 0, k = near ? 1 : 0; DOG.lie = c.G.stage > 0 ? 1 : 0; DOG.pose(DOG.lie, k, c.time); if (c.G.stage === 0) DOG.g.rotation.y = DOG.face; if (near && !stDog.barked) { stDog.barked = true; c.say(DOG.g, W.dog.bark, 2.5); } }
    for (const id in pickAt) { const m = pickAt[id]; m.float.rotation.y = c.time * 1.5; m.float.position.y = hAt(m.x, m.z) + 1.15 + 0.08 * Math.sin(c.time * 3); m.mark.scale.setScalar(1 + 0.12 * Math.sin(c.time * 4)); }
  }
  function reset() { for (const id in pickAt) pickAt[id].mark.visible = pickAt[id].float.visible = true; for (const k in kit.userData) if (k[0] === 'd') { kit.remove(kit.userData[k]); delete kit.userData[k]; } tray2.userData.key = null; }
  return { stages, pickAt, took, reset, update, introCam, speaker, notices, DOG, room, drawPatch, neoG, dogF, neoF, W2 };
}
