/* The life of Pompeii's streets, before and after the eruption, plus the workshop boy who guides the player home.
   Every walker tests TOWN.wall(x, z) and avoids fountains (TOWN.solids) so nobody clips a wall or gets stuck at corners.
   Before pumice falls: purposeful walkers carrying loaves, amphorae and baskets, neighbours conversing in pairs,
   people at the three attested fountains, and a mule cart in the wagon ruts.
   When the pine cloud rises: townspeople pause to point up at Vesuvius, then hurry south-east and east away from the mountain. */
export function makeLife({ THREE, scene, TOWN, FIG, Tn, onBone, PROPS, at, side, hAt, h0, RT, S_NEO, S_CROSS, LEN, W, clamp, sstep, mix, on, VES }) {
  const lam = c => new THREE.MeshLambertMaterial({ color: c }), basic = o => new THREE.MeshBasicMaterial(o);
  const NAMES = ['man', 'woman', 'man_beard', 'woman2', 'youth', 'citizen', 'man', 'woman'];
  const TINTS = ['#c44c3a', '#d8a642', '#648292', '#8a9c64', '#b87648', '#d8cdb8', '#9c4e44', '#6c7c58'];
  const amphora = () => new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [0.04, 0.04], [0.11, 0.24], [0.1, 0.42], [0.04, 0.5], [0.05, 0.58]].map(p => new THREE.Vector2(p[0], p[1])), 9), lam('#bf6b42'));
  const basket = () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.1, 0.2, 10), lam('#c8a262')); return m; };

  /* Safe pavement coordinate: tries preferred lateral offset, steps inward if TOWN.wall or a fountain blocks it */
  function safePos(s, sg, baseOff) {
    const p = at(s), hw = RT.half(s);
    for (const k of [1, 0.72, 0.48, 0.25, 0]) {
      const lat = sg * Math.max(0, (hw - baseOff) * k);
      const [x, z] = side(p, 0, lat);
      if (TOWN.wall(x, z)) continue;
      if (TOWN.solids.some(o => Math.hypot(x - o.x, z - o.z) < o.r + 0.35)) continue;
      return [x, z, p];
    }
    return [p.x, p.z, p];
  }

  /* ---- 1. Street walkers (34 moving people across the 360 m route, varied lanes so nobody bunches up) ---- */
  const folk = [];
  for (let i = 0; i < 34; i++) {
    const s = 12 + (i / 34) * (LEN - 26), sg = i % 2 ? 1 : -1, dir = i % 3 === 0 ? -1 : 1;
    const name = NAMES[i % NAMES.length];
    const g = FIG.spawn(name, { size: (name === 'youth' ? 0.96 : 1.08) * (0.95 + (i % 5) * 0.02), adult: name !== 'youth', tint: TINTS[i % TINTS.length] });
    const f = { g, s, s0: s, sg, dir, baseOff: 0.58 + (i % 5) * 0.17, ph: i * 1.37, v: 1.25, speed0: 1.18 + (i % 4) * 0.18, cool: 0, look: 0, prop: null, kind: 'walk' };
    if (i % 4 === 0) f.prop = onBone(g, 'spine', amphora(), 0.22, 0.95, 0.14);
    else if (i % 4 === 1) f.prop = onBone(g, 'spine', basket(), -0.2, 0.92, 0.16);
    else if (i % 4 === 2) { const lo = PROPS.loaf(); lo.scale.setScalar(1.05); f.prop = onBone(g, 'spine', lo, 0, 0.96, 0.24); }
    folk.push(f);
  }
  /* 4 pairs of conversing neighbours beside doorways (facing each other; scatter and hurry home once pumice begins) */
  for (const [idx, sp] of [[0, 62], [1, 148], [2, 224], [3, 294]]) {
    const sg = idx % 2 ? 1 : -1;
    for (const [j, ds] of [[0, -0.55], [1, 0.55]]) {
      const name = NAMES[(idx * 2 + j + 1) % NAMES.length];
      const g = FIG.spawn(name, { size: 1.07, adult: true, tint: TINTS[(idx * 3 + j) % TINTS.length] });
      folk.push({ g, s: sp + ds, s0: sp + ds, sg, dir: 1, baseOff: 0.72, ph: idx * 2.1 + j * 1.5, v: 0, speed0: 0, cool: 0, look: 0, pairFace: j === 0 ? 1 : -1, kind: 'pair' });
    }
  }
  /* 3 people drawing water at the three attested fountains */
  W.fountains.forEach((ft, idx) => {
    const s = RT.sOf(ft.p, true), g = FIG.spawn(idx % 2 ? 'woman' : 'woman2', { size: 1.06, adult: true, tint: TINTS[(idx + 2) % TINTS.length] });
    onBone(g, 'spine', amphora(), 0.22, 0.94, 0.16);
    folk.push({ g, s: s - 1.5, s0: s - 1.5, sg: ft.side, dir: 1, baseOff: 1.35, ph: idx * 1.9, v: 0, speed0: 0, cool: 0, look: 0, kind: 'fountain' });
  });

  /* ---- 2. The workshop boy guide: runs ahead, carries a glowing terracotta oil-lamp & red ribbon, waves at every stop ---- */
  const guideG = FIG.spawn('youth', { size: 0.96, tint: '#e0a938' });
  const lampGroup = new THREE.Group();
  const lampPot = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 8), lam('#b85c34')); lampPot.scale.set(1.2, 0.65, 1.4); lampGroup.add(lampPot);
  const flame = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), basic({ color: '#ffe48a' })); flame.position.set(0, 0.08, 0.06); lampGroup.add(flame);
  const guideLight = new THREE.PointLight(new THREE.Color('#ffbe64'), 0, 14, 1.5); guideLight.position.set(0, 0.25, 0.06); lampGroup.add(guideLight);
  guideG.userData.aR.add(lampGroup); lampGroup.position.set(0, 0.08, 0.08);
  const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.55, 0.02), basic({ color: '#c83424' }));
  onBone(guideG, 'spine', ribbon, 0, 1.02, -0.18);
  const guideBoy = { g: guideG, s: 10, x: 0, z: 0, ph: 0, v: 0, said: {} };

  /* ---- 3. The cushion-giver (Pliny 6.16.16 — noted as Stabiae in words.js & FINDINGS.md) ---- */
  const cushionS = W.cushionAt;
  const giver = (() => {
    const [x, z, p] = safePos(cushionS, 1, 0.85), g = FIG.spawn('woman2', { size: 1.08, adult: true, tint: '#b6543e' });
    g.position.set(x, hAt(x, z), z); g.rotation.y = Math.atan2(-p.dz * -1, p.dx * -1) + Math.PI / 2;
    const c = PROPS.cushion(); g.userData.aR.add(c); c.position.set(0, 0.1, 0.1);
    return { g, x, z, c, called: false };
  })();

  /* ---- 4. Mule and cart in the Via dell'Abbondanza wagon ruts ---- */
  function beast() {
    const g = new THREE.Group(), coat = lam('#8a6d56'), dark = lam('#45352b'), pale = lam('#d6c6ae');
    const cap = (m, r, l, x, y, z, rx = 0, par = g) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 12), m); o.position.set(x, y, z); o.rotation.x = rx; par.add(o); return o; };
    cap(coat, 0.27, 0.75, 0, 1.05, 0, Math.PI / 2); const belly = new THREE.Mesh(new THREE.SphereGeometry(0.31, 14, 10), coat); belly.position.set(0, 0.98, -0.05); belly.scale.set(1, 0.95, 1.5); g.add(belly);
    const neck = new THREE.Group(); neck.position.set(0, 1.2, 0.55); g.add(neck); cap(coat, 0.13, 0.42, 0, 0.2, 0.14, 0.62, neck); const head = new THREE.Group(); head.position.set(0, 0.46, 0.3); neck.add(head); cap(coat, 0.1, 0.3, 0, -0.08, 0.14, 1.9, head); const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), pale); muzzle.position.set(0, -0.2, 0.3); head.add(muzzle);
    for (const e of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.28, 8), coat); ear.position.set(e * 0.08, 0.2, -0.02); ear.rotation.z = -e * 0.2; head.add(ear); }
    cap(dark, 0.03, 0.4, 0, 0.3, 0.06, 0.62, neck); cap(dark, 0.035, 0.5, 0, 0.95, -0.72, 0.25);
    const legs = []; for (const [x, z, fr] of [[-0.15, 0.42, 1], [0.15, 0.42, 1], [-0.15, -0.42, 0], [0.15, -0.42, 0]]) { const up = new THREE.Group(); up.position.set(x, 0.92, z); g.add(up); cap(coat, 0.075, 0.3, 0, -0.2, 0, 0, up); const lo = new THREE.Group(); lo.position.set(0, -0.44, 0); up.add(lo); cap(coat, 0.045, 0.34, 0, -0.2, 0, 0, lo); legs.push({ up, lo, ph: (fr ? 0 : Math.PI) + (x < 0 ? 0 : Math.PI) }); }
    g.userData.walk = (t, k) => { for (const L of legs) { const s = Math.sin(t + L.ph); L.up.rotation.x = 0.42 * s * k; L.lo.rotation.x = 0.5 * Math.max(0, -Math.cos(t + L.ph)) * k; } neck.rotation.x = 0.06 * Math.sin(t * 2) * k; };
    return on(g);
  }
  const cart = new THREE.Group(), mule = beast();
  { const wood = lam('#8a5e38'), wheelM = lam('#62442a');
    for (const e of [-1, 1]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.09, 18), wheelM); wh.rotation.z = Math.PI / 2; wh.position.set(e * 0.7, 0.55, -1.9); cart.add(wh); wh.userData.wheel = true; }
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.9), wood); bed.position.set(0, 0.72, -1.9); cart.add(bed);
    for (const e of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 1.9), wood); rail.position.set(e * 0.6, 0.95, -1.9); cart.add(rail); const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.1), wood); shaft.position.set(e * 0.36, 0.86, -0.1); cart.add(shaft); }
    for (let i = 0; i < 6; i++) { const am = amphora(); am.scale.setScalar(1.35); am.position.set(-0.3 + (i % 3) * 0.3, 0.76, -2.4 + Math.floor(i / 3) * 0.6); cart.add(am); }
    cart.add(mule); on(cart); scene.add(cart); }
  const driver = FIG.spawn('man_beard', { size: 1.08, adult: true, tint: '#9a7e56' });
  const C = { s: W.cartRange[1], cool: 0, warned: false, parked: false };

  /* ---- 5. Falling pumice stones with landing shadows ---- */
  const NS = 6, stones = [];
  for (let i = 0; i < NS; i++) {
    const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11 + (i % 3) * 0.025, 0), lam(i % 3 ? '#ded6c4' : '#564e46'));
    const sh = new THREE.Mesh(new THREE.CircleGeometry(0.52, 14), basic({ color: 0x2a1c14, transparent: true, opacity: 0, depthWrite: false }));
    sh.rotation.x = -Math.PI / 2; rock.visible = false; scene.add(rock, sh);
    stones.push({ rock, sh, t: -1, x: 0, z: 0, wait: i * 0.75 });
  }
  let fleeing = false, lastHit = 0;
  function reset() {
    fleeing = false; lastHit = 0;
    for (const f of folk) { f.s = f.s0; f.v = f.speed0; f.cool = 0; f.look = 0; f.g.visible = false; }
    C.s = W.cartRange[1]; C.cool = 0; C.warned = false; C.parked = false;
    giver.c.visible = true; giver.called = false;
    guideBoy.s = 12; guideBoy.v = 0; guideBoy.said = {}; guideG.visible = false;
    for (const st of stones) { st.t = -1; st.rock.visible = false; st.sh.material.opacity = 0; }
  }
  const startle = () => { for (const f of folk) f.look = 3.0; };
  const flee = () => { fleeing = true; startle(); };
  const blocked = (x, z) => (C.parked && Math.hypot(x - cart.position.x, z - cart.position.z) < 1.35);

  function update(dt, c) {
    const { me, progS, e, time } = c, play = c.state === 'play';
    const hurrying = fleeing && e > 0.75;
    /* ---- update workshop boy guide ---- */
    { const showGuide = play || c.state === 'look'; guideG.visible = showGuide;
      if (showGuide) {
        const capS = !c.E.on ? S_NEO - 2.2 : (!c.G.got.has('blue') ? c.sBlue : (!c.G.got.has('black') && progS > S_CROSS - 8 ? c.sBlack : LEN - 3.5));
        const wantS = clamp(Math.min(capS, progS + 11.5), c.E.on ? S_NEO + 2 : 6, LEN - 3.5);
        const diff = wantS - guideBoy.s;
        const spd = Math.abs(diff) > 1.2 ? Math.sign(diff) * Math.min(9.4, Math.abs(diff) * 2.4 + 2.5) : 0;
        guideBoy.s = clamp(guideBoy.s + spd * dt, 4, LEN - 3.5);
        guideBoy.v += (Math.abs(spd) - guideBoy.v) * Math.min(1, dt * 6);
        const p = at(guideBoy.s), lat = guideBoy.s < S_NEO ? -0.9 : (Math.abs(guideBoy.s - c.sBlue) < 6 || Math.abs(guideBoy.s - c.sBlack) < 6 ? -1.4 : 0.0);
        const [gx, gz] = side(p, 0, lat);
        guideBoy.x = gx; guideBoy.z = gz;
        guideG.position.set(gx, hAt(gx, gz) + (TOWN.kind(gx, gz) === 2 ? c.depth : c.depth * 0.5), gz);
        const waiting = guideBoy.v < 0.7;
        guideG.rotation.y = waiting ? Math.atan2(me.x - gx, me.z - gz) : Math.atan2(p.dx * (spd >= 0 ? 1 : -1), p.dz * (spd >= 0 ? 1 : -1));
        guideBoy.ph += dt * (2.5 + guideBoy.v * 1.4);
        FIG.pose(guideG, guideBoy.ph, guideBoy.v / 5.5);
        /* Hold oil-lamp forward; wave left arm high when waiting for her */
        Tn(guideG, 'upperarmR', -58, -10, 0); Tn(guideG, 'forearmR', -45);
        if (waiting) { Tn(guideG, 'upperarmL', -145 + 22 * Math.sin(time * 7), 18, 0); Tn(guideG, 'forearmL', -24); }
        ribbon.rotation.z = 0.25 * Math.sin(time * 8 + guideBoy.ph);
        guideLight.intensity = 10 + 32 * sstep(1.2, 3.0, e);
        /* Contextual short voice cues from the boy */
        const cue = (k, cond, text) => { if (play && cond && !guideBoy.said[k]) { guideBoy.said[k] = true; c.say(guideG, text, 4.2); } };
        cue('start', !c.E.on && progS < 14, W.guideLines.start);
        cue('afterNeo', c.E.on && progS > S_NEO + 1 && progS < S_NEO + 22, W.guideLines.afterNeo);
        cue('attii', c.E.on && !c.G.got.has('blue') && Math.abs(progS - c.sBlue) < 22, W.guideLines.attii);
        cue('cross', c.E.on && Math.abs(progS - S_CROSS) < 22, W.guideLines.cross);
        cue('asellina', c.E.on && !c.G.got.has('black') && progS > c.sDog + 1, W.guideLines.asellina);
        cue('home', c.E.on && c.G.got.has('black') && progS > LEN - 24, W.guideLines.home);
      } }

    /* ---- update townspeople (52 m culling for steady 60 fps + anti-bunching spacing) ---- */
    const vesAng = Math.atan2(VES.dir.x, VES.dir.z), visList = [];
    for (const f of folk) {
      if (e > 1.25) f.look = 0;
      const vis = Math.abs(f.s - progS) < 52 && Math.abs(f.s - S_NEO) > 4.5 && f.s < LEN - 4;
      f.g.visible = vis; if (!vis) continue;
      let wantV = f.kind === 'walk' ? f.speed0 : 0, dir = f.dir;
      if (hurrying) { wantV = 3.1 + (f.ph % 0.45); dir = 1; }
      else if (f.look > 0) { wantV = 0; f.look -= dt; }
      f.v += (wantV - f.v) * Math.min(1, dt * 3);
      f.s += f.v * dir * dt;
      if (f.s < S_NEO + 6) { f.s = S_NEO + 6; if (!hurrying) f.dir = 1; }
      if (f.s > LEN - 7) { f.s = hurrying ? Math.max(S_NEO + 12, progS - 44) : LEN - 7; if (!hurrying) f.dir = -1; }
      visList.push(f);
    }
    /* Keep hurrying/walking townspeople cleanly spaced so silhouettes never stack on top of each other */
    for (let i = 0; i < visList.length; i++) {
      const a = visList[i];
      if (a.kind === 'pair' && !hurrying) continue;
      for (let j = i + 1; j < visList.length; j++) {
        const b = visList[j];
        if (a.sg !== b.sg || (b.kind === 'pair' && !hurrying)) continue;
        const ds = b.s - a.s;
        if (Math.abs(ds) < 1.45) { const push = (1.45 - Math.abs(ds)) * 0.35 * (ds >= 0 ? 1 : -1); b.s += push; a.s -= push; }
      }
    }
    for (const f of visList) {
      const [x, z, p] = safePos(f.s, f.sg, f.baseOff);
      f.g.position.set(x, hAt(x, z) + (TOWN.kind(x, z) === 2 ? c.depth : c.depth * 0.5), z);
      f.ph += dt * (2.2 + f.v * 2.1);
      FIG.pose(f.g, f.ph, f.v / (hurrying ? 3.1 : 1.7));
      if (f.look > 0 && e < 1.25) {
        f.g.rotation.y = vesAng; Tn(f.g, 'head', -22, 0, 0); Tn(f.g, 'upperarmR', -128, -10, 0); Tn(f.g, 'forearmR', -18);
      } else if (f.v > 0.2) {
        f.g.rotation.y = Math.atan2(p.dx * (hurrying ? 1 : f.dir), p.dz * (hurrying ? 1 : f.dir));
        if (hurrying && !f.prop) { Tn(f.g, 'upperarmL', -148, 18, 0); Tn(f.g, 'forearmL', -95); }
      } else if (f.kind === 'pair') {
        f.g.rotation.y = Math.atan2(p.dx * f.pairFace, p.dz * f.pairFace);
        Tn(f.g, 'upperarmR', -42 - 12 * Math.sin(time * 2.6 + f.ph), 0, 0); Tn(f.g, 'forearmR', -65);
        Tn(f.g, 'head', 6 * Math.sin(time * 1.9 + f.ph), 0, 0);
      } else {
        f.g.rotation.y = Math.atan2(-p.dz * f.sg, p.dx * f.sg);
        Tn(f.g, 'upperarmR', -50 - 8 * Math.sin(time * 2 + f.ph), 0, 0); Tn(f.g, 'forearmR', -55);
      }
      f.cool -= dt;
      if (play && f.cool <= 0 && Math.hypot(x - me.x, z - me.z) < 0.68 && Math.abs(me.speed) > 4.0 && c.alt < 0.8) {
        f.cool = 4; c.SC.lose(5, W.bump[Math.floor(f.ph) % W.bump.length]); me.speed *= 0.4;
      }
    }

    /* ---- mule cart in the Via dell'Abbondanza ruts ---- */
    { const vis = Math.abs(C.s - progS) < 85 && progS > S_CROSS - 35; cart.visible = driver.visible = vis;
      if (vis) {
        if (e > 2.2) C.parked = true;
        if (play && !C.parked) { C.s -= 1.55 * dt; if (C.s < W.cartRange[0]) C.s = W.cartRange[1]; }
        const p = at(C.s), pull = C.parked ? -1.45 : 0, [cx, cz] = side(p, 0, pull);
        cart.position.set(cx, h0(cx, cz) + (C.parked ? c.depth : 0), cz);
        cart.rotation.y = Math.atan2(-p.dx, -p.dz);
        mule.userData.walk(time * 5, C.parked ? 0 : 1);
        cart.children.forEach(o => { if (o.userData.wheel) o.rotation.x = C.parked ? 0 : -C.s * 1.8; });
        const [dx, dz] = side(p, -1.0, pull + 1.15);
        driver.position.set(dx, hAt(dx, dz), dz); driver.rotation.y = Math.atan2(-p.dx, -p.dz);
        FIG.pose(driver, time * 5, C.parked ? 0 : 0.55);
        C.cool -= dt;
        if (play && !C.parked && C.cool <= 0) {
          const rel = [me.x - cx, me.z - cz], al = -(rel[0] * p.dx + rel[1] * p.dz), ac = Math.abs(rel[0] * -p.dz + rel[1] * p.dx);
          if (al > -1.2 && al < 3.0 && ac < 1.0 && c.alt < 1) { C.cool = 4; c.SC.lose(10, W.cartHit); me.speed *= 0.25; }
          else if (al > 3.0 && al < 16 && ac < 1.6 && !C.warned) { C.warned = true; c.warn(W.cartWarn, 2.2); }
          if (al < -3 && C.warned) { C.warned = false; if (C.cool <= 0) c.SC.gain(15, W.cartPass, 1); }
        }
      } }

    /* ---- cushion-giver ---- */
    giver.g.visible = fleeing && Math.abs(cushionS - progS) < 70;
    FIG.pose(giver.g, 0, 0); Tn(giver.g, 'upperarmR', -82, 0, 0); Tn(giver.g, 'forearmR', -20);
    if (play && fleeing && !c.G.cushion && Math.hypot(giver.x - me.x, giver.z - me.z) < 4.6) {
      c.G.cushion = true; giver.c.visible = false; c.cushion.visible = true;
      c.SC.keep('cushion', { title: 'A cushion tied on her head', emoji: '🛏️' });
      c.SC.gain(20, W.cushionGot, 1); c.say(giver.g, W.cushionLine, 4.2);
    }
    if (play && fleeing && !c.G.cushion && !giver.called && Math.abs(cushionS - progS) < 18) { giver.called = true; c.say(giver.g, W.cushionCall, 3.2); }

    /* ---- falling pumice stones ---- */
    const fall = sstep(1.85, 2.75, e);
    for (const st of stones) {
      if (st.t < 0) {
        st.wait -= dt;
        if (play && fall > 0 && st.wait <= 0) {
          const a = Math.random() * 6.28, r = Math.random() < 0.4 ? Math.random() * 1.4 : 2.2 + Math.random() * 6;
          st.x = me.x + Math.sin(me.yaw) * me.speed * 1.0 + Math.cos(a) * r; st.z = me.z - Math.cos(me.yaw) * me.speed * 1.0 + Math.sin(a) * r;
          if (TOWN.wall(st.x, st.z)) { st.wait = 0.2; continue; }
          st.t = 0; st.rock.visible = true;
        }
        continue;
      }
      st.t += dt; const T1 = 1.15, k = st.t / T1, gy = hAt(st.x, st.z) + c.depth;
      st.rock.position.set(st.x, gy + 14 * (1 - k) * (1 - k) + 0.1, st.z); st.rock.rotation.x += dt * 6;
      st.sh.position.set(st.x, gy + 0.03, st.z); st.sh.material.opacity = 0.4 * Math.min(1, k); st.sh.scale.setScalar(0.4 + 0.6 * k);
      if (st.t >= T1) {
        st.rock.visible = false; st.sh.material.opacity = 0; st.t = -1; st.wait = mix(2.2, 0.55, fall) * (0.5 + Math.random());
        if (play && Math.hypot(st.x - me.x, st.z - me.z) < 0.72 && time - lastHit > 1.5) {
          lastHit = time;
          if (c.G.cushion) c.SC.gain(5, W.stoneSafe, 0);
          else { c.SC.lose(5, W.stoneHit); c.G.hits++; me.speed *= 0.55; }
        }
      }
    }
  }
  return { blocked, reset, startle, flee, update, cushionS, folk, cart, C, giver, guideBoy };
}
