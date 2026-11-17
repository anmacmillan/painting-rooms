/* The life of the street, before and after. Before: people on the pavements, a mule cart in the ruts, shopkeepers. After: the same people running,
   the cart left standing, stones falling. What is attested and what is the game's own is set out in research/FINDINGS.md ("Street life"). Nothing here can stop
   her for good: a bump or a stone costs a few points and she runs on. */
export function makeLife({ THREE, scene, TOWN, FIG, Tn, arms, onBone, PROPS, at, side, hAt, h0, RT, S_FAR, LEN, W, rnd, clamp, sstep, mix, on, shadowM }) {
  const lam = c => new THREE.MeshLambertMaterial({ color: c }), basic = o => new THREE.MeshBasicMaterial(o);
  /* ---- people. Each keeps to a pavement of the route; 'leg' says whether they belong to the way out or the way back ---- */
  const NAMES = ['man', 'woman', 'man_beard', 'woman2', 'youth', 'citizen', 'man', 'woman'], TINTS = [null, null, '#c9a05a', null, '#8a9a6a', null, '#a86a4a', '#b0a0c0'];
  const folk = []; let fleeing = false;
  const add = (leg, s, sg, dir, o = {}) => { const k = folk.length, name = o.name || NAMES[k % NAMES.length], g = FIG.spawn(name, { size: (name === 'youth' ? 0.98 : 1.1) * (0.96 + (k % 5) * 0.02), adult: name !== 'youth', tint: TINTS[k % TINTS.length] || undefined }); folk.push({ g, leg, s, s0: s, sg, dir, ph: k * 1.7, v: 0, cool: 0, bundle: null, ...o }); return folk[k]; };
  for (let s = 14, k = 0; s < S_FAR - 12; s += 15.5 + (k % 3) * 4, k++) add(0, s, k % 2 ? 1 : -1, k % 3 ? 1 : -1, k % 4 === 3 ? { still: true } : {});
  for (let s = S_FAR + 16, k = 0; s < LEN - 10; s += 13 + (k % 4) * 3.5, k++) add(1, s, k % 2 ? 1 : -1, 1);
  for (const f of folk) if (f.leg === 1 && folk.indexOf(f) % 2 === 0) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 8), lam(['#b8a888', '#8a6a48', '#a8483a'][folk.indexOf(f) % 3])); b.scale.set(1.2, 0.8, 1); f.bundle = onBone(f.g, 'spine', b, 0, 1.2, 0.26); }
  /* the woman at her door who holds out a cushion: "they tied pillows on their heads" (Pliny 6.16.16; that was at Stabiae) */
  const cushionS = S_FAR + W.cushionAt, giver = (() => { const p = at(cushionS), [x, z] = side(p, 0, RT.half(cushionS) - 0.8), g = FIG.spawn('woman2', { size: 1.08, adult: true }); g.position.set(x, hAt(x, z), z); g.rotation.y = Math.atan2(-p.dz * -1, p.dx * -1) + Math.PI / 2 + Math.PI; const c = PROPS.cushion(); g.userData.aR.add(c); c.position.set(0, 0.1, 0.1); return { g, x, z, c }; })();
  /* ---- a mule and cart: its wheels run in the ruts and pass between the stepping stones ---- */
  function beast() { const g = new THREE.Group(), coat = lam('#7a6250'), dark = lam('#3a2e26'), pale = lam('#c9b8a0');
    const cap = (m, r, l, x, y, z, rx = 0, par = g) => { const o = new THREE.Mesh(new THREE.CapsuleGeometry(r, l, 6, 12), m); o.position.set(x, y, z); o.rotation.x = rx; par.add(o); return o; };
    cap(coat, 0.27, 0.75, 0, 1.05, 0, Math.PI / 2); const belly = new THREE.Mesh(new THREE.SphereGeometry(0.31, 14, 10), coat); belly.position.set(0, 0.98, -0.05); belly.scale.set(1, 0.95, 1.5); g.add(belly);
    const neck = new THREE.Group(); neck.position.set(0, 1.2, 0.55); g.add(neck); cap(coat, 0.13, 0.42, 0, 0.2, 0.14, 0.62, neck); const head = new THREE.Group(); head.position.set(0, 0.46, 0.3); neck.add(head); cap(coat, 0.1, 0.3, 0, -0.08, 0.14, 1.9, head); const muzzle = new THREE.Mesh(new THREE.SphereGeometry(0.085, 10, 8), pale); muzzle.position.set(0, -0.2, 0.3); head.add(muzzle);
    for (const e of [-1, 1]) { const ear = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.28, 8), coat); ear.position.set(e * 0.08, 0.2, -0.02); ear.rotation.z = -e * 0.2; head.add(ear); const eye = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), dark); eye.position.set(e * 0.085, 0.02, 0.1); head.add(eye); }
    const mane = cap(dark, 0.03, 0.4, 0, 0.3, 0.06, 0.62, neck), tail = cap(dark, 0.035, 0.5, 0, 0.95, -0.72, 0.25);
    const legs = []; for (const [x, z, fr] of [[-0.15, 0.42, 1], [0.15, 0.42, 1], [-0.15, -0.42, 0], [0.15, -0.42, 0]]) { const up = new THREE.Group(); up.position.set(x, 0.92, z); g.add(up); cap(coat, 0.075, 0.3, 0, -0.2, 0, 0, up); const lo = new THREE.Group(); lo.position.set(0, -0.44, 0); up.add(lo); cap(coat, 0.045, 0.34, 0, -0.2, 0, 0, lo); const hoof = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.08, 8), dark); hoof.position.y = -0.42; lo.add(hoof); legs.push({ up, lo, ph: (fr ? 0 : Math.PI) + (x < 0 ? 0 : Math.PI) }); }
    g.userData.walk = (t, k) => { for (const L of legs) { const s = Math.sin(t + L.ph); L.up.rotation.x = 0.42 * s * k; L.lo.rotation.x = 0.5 * Math.max(0, -Math.cos(t + L.ph)) * k; } neck.rotation.x = 0.06 * Math.sin(t * 2) * k; }; return on(g); }
  const cart = new THREE.Group(), mule = beast(); { const wood = lam('#7a5632'), wheelM = lam('#5a4028');
    for (const e of [-1, 1]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.09, 20), wheelM); wh.rotation.z = Math.PI / 2; wh.position.set(e * 0.7, 0.55, -1.9); cart.add(wh); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.16, 10), lam('#2a2018')); hub.rotation.z = Math.PI / 2; hub.position.set(e * 0.72, 0.55, -1.9); cart.add(hub); wh.userData.wheel = true; }
    const bed = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.1, 1.9), wood); bed.position.set(0, 0.72, -1.9); cart.add(bed); for (const e of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.4, 1.9), wood); rail.position.set(e * 0.6, 0.95, -1.9); cart.add(rail); const shaft = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 2.1), wood); shaft.position.set(e * 0.36, 0.86, -0.1); cart.add(shaft); }
    for (let i = 0; i < 6; i++) { const am = new THREE.Mesh(new THREE.LatheGeometry([[0.0, 0], [0.06, 0.05], [0.15, 0.35], [0.14, 0.6], [0.06, 0.72], [0.07, 0.86]].map(p => new THREE.Vector2(p[0], p[1])), 10), lam('#b8734a')); am.position.set(-0.3 + (i % 3) * 0.3, 0.76, -2.4 + Math.floor(i / 3) * 0.6); am.rotation.z = (i % 2 ? 0.1 : -0.1); cart.add(am); }
    cart.add(mule); on(cart); scene.add(cart); }
  const driver = FIG.spawn('man_beard', { size: 1.08, adult: true, tint: '#8a7a5a' });
  const C = { s: 0, v: 0, on: true, cool: 0 };
  /* ---- stones in the air ---- */
  const NS = 7, stones = []; for (let i = 0; i < NS; i++) { const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(0.11 + (i % 3) * 0.03, 0), lam(i % 3 ? '#d8d2c4' : '#4a4640')), sh = new THREE.Mesh(new THREE.CircleGeometry(0.5, 14), basic({ color: 0x000000, transparent: true, opacity: 0, depthWrite: false })); sh.rotation.x = -Math.PI / 2; rock.visible = false; scene.add(rock, sh); stones.push({ rock, sh, t: -1, x: 0, z: 0, wait: i * 0.7 }); }
  let lastHit = 0;
  const pentAt = (x, z) => { for (const b of TOWN.bays) { if (!b.pent) continue; } return false; };
  function reset() { fleeing = false; for (const f of folk) { f.s = f.s0; f.v = 0; f.cool = 0; f.g.visible = false; } C.s = W.cartS[0] * S_FAR; C.on = true; C.left = false; giver.c.visible = true; for (const st of stones) { st.t = -1; st.rock.visible = false; st.sh.material.opacity = 0; } }
  const startle = () => { for (const f of folk) f.look = 2.2; };
  const flee = () => { fleeing = true; };
  const blocked = (x, z) => { if (C.left && Math.hypot(x - cart.position.x, z - cart.position.z) < 1.5) return true; return false; };
  function update(dt, c) {
    const { me, progS, e, time } = c, play = c.state === 'play';
    /* people */
    for (const f of folk) { const act = f.leg === 0 ? !fleeing || progS < S_FAR + 30 : fleeing; const vis = act && Math.abs(f.s - progS) < 75; f.g.visible = vis; if (!vis) continue;
      const run = fleeing ? (f.leg === 0 ? 3.4 : 3.0 + (f.ph % 1)) : f.still ? 0 : 1.15; f.v += (run - f.v) * Math.min(1, dt * 2); const dir = fleeing ? (f.leg === 0 ? -1 : 1) : f.dir; f.s += f.v * dir * dt;
      if (f.leg === 0) { if (f.s < 6) { f.s = 6; f.dir = 1; } if (f.s > S_FAR - 8) { f.s = S_FAR - 8; f.dir = -1; } } else { if (f.s > LEN - 6) f.s = S_FAR + 12; }
      const p = at(f.s), hw = RT.half(f.s), lat = f.sg * (hw - 0.75 - (hw < 3 ? 0.1 : 0.25 * Math.sin(f.ph))), [x, z] = side(p, 0, lat); f.g.position.set(x, hAt(x, z) + (TOWN.kind(x, z) === 2 ? c.depth : c.depth * 0.5), z); f.g.rotation.y = Math.atan2(p.dx * dir, p.dz * dir); f.ph += dt * (2 + f.v * 2.4); FIG.pose(f.g, f.ph, f.v / (fleeing ? 3.2 : 1.7));
      if (f.still) { f.g.rotation.y = Math.atan2(-p.dz * f.sg * -1, p.dx * f.sg * -1) + Math.PI / 2 + Math.PI; Tn(f.g, 'upperarmR', -40 - 10 * Math.sin(time * 2 + f.ph), 0, 0); Tn(f.g, 'forearmR', -70); }
      if (f.look > 0) { f.look -= dt; Tn(f.g, 'head', -18, 0, 0); } if (fleeing && f.bundle == null && f.leg === 1) { Tn(f.g, 'upperarmL', -150, 20, 0); Tn(f.g, 'forearmL', -100); }      /* an arm over the head */
      f.cool -= dt; if (play && f.cool <= 0 && Math.hypot(x - me.x, z - me.z) < 0.7 && Math.abs(me.speed) > 3.5 && c.alt < 0.8) { f.cool = 4; c.SC.lose(5, W.bump[Math.floor(f.ph) % W.bump.length]); me.speed *= 0.3; } }
    /* the cart: it comes down the street towards her on the way out; after the mountain breaks it stands where its driver left it */
    { const vis = Math.abs(C.s - progS) < 90 && (progS < S_FAR + 40 || C.left); cart.visible = driver.visible = vis; if (!fleeing && play) { C.s -= 1.5 * dt; if (C.s < W.cartS[1] * S_FAR) C.s = W.cartS[0] * S_FAR; }
      if (fleeing && !C.left) { C.left = true; }
      const p = at(C.s), y = h0(p.x, p.z) + (C.left ? c.depth : 0); cart.position.set(p.x, y, p.z); cart.rotation.y = Math.atan2(-p.dx, -p.dz); mule.userData.walk(time * 5, C.left ? 0 : 1); cart.children.forEach(o => { if (o.userData.wheel) o.rotation.x = C.left ? 0 : -C.s * 1.8; });
      const [dx, dz] = side(p, C.left ? 3 : -1.2, C.left ? 2.6 : 1.1); driver.position.set(dx, hAt(dx, dz), dz); driver.rotation.y = Math.atan2(-p.dx, -p.dz); FIG.pose(driver, time * 5, C.left ? 0 : 0.55); if (C.left) driver.visible = false;
      C.cool -= dt; if (play && !C.left && C.cool <= 0 && vis) { const rel = [me.x - p.x, me.z - p.z], al = -(rel[0] * p.dx + rel[1] * p.dz), ac = Math.abs(rel[0] * -p.dz + rel[1] * p.dx); if (al > -1.2 && al < 3.2 && ac < 1.05 && c.alt < 1) { C.cool = 4; c.SC.lose(10, W.cartHit); me.speed *= 0.2; } else if (al > 3.2 && al < 16 && ac < 1.6 && !C.warned) { C.warned = true; c.warn(W.cartWarn, 2.2); } if (al < -3 && C.warned) { C.warned = false; if (C.cool <= 0) c.SC.gain(15, W.cartPass, 1); } } }
    /* the cushion */
    giver.g.visible = fleeing && Math.abs(cushionS - progS) < 70; FIG.pose(giver.g, 0, 0); Tn(giver.g, 'upperarmR', -80, 0, 0); Tn(giver.g, 'forearmR', -20);
    if (play && fleeing && !c.G.cushion && Math.hypot(giver.x - me.x, giver.z - me.z) < 2.6) { c.G.cushion = true; giver.c.visible = false; c.cushion.visible = true; c.SC.keep('cushion', { title: 'A cushion tied on her head', emoji: '🛏️' }); c.SC.gain(20, W.cushionGot, 1); c.say(giver.g, W.cushionLine, 4.5); }
    if (play && fleeing && !c.G.cushion && !giver.called && Math.abs(cushionS - progS) < 16) { giver.called = true; c.say(giver.g, W.cushionCall, 3.5); } if (!fleeing) giver.called = false;
    /* stones: each throws a growing shadow where it will land */
    const fall = sstep(1.7, 2.6, e); for (const st of stones) { if (st.t < 0) { st.wait -= dt; if (play && fall > 0 && st.wait <= 0) { const a = Math.random() * 6.28, r = Math.random() < 0.45 ? Math.random() * 1.2 : 2 + Math.random() * 6, fx = Math.sin(me.yaw), fz = -Math.cos(me.yaw); st.x = me.x + fx * me.speed * 1.1 + Math.cos(a) * r; st.z = me.z + fz * me.speed * 1.1 + Math.sin(a) * r; if (TOWN.kind(st.x, st.z) === 0) { st.wait = 0.2; continue; } st.t = 0; st.rock.visible = true; } continue; }
      st.t += dt; const T1 = 1.15, k = st.t / T1, gy = hAt(st.x, st.z) + c.depth; st.rock.position.set(st.x, gy + 14 * (1 - k) * (1 - k) + 0.1, st.z); st.rock.rotation.x += dt * 6; st.sh.position.set(st.x, gy + 0.03, st.z); st.sh.material.opacity = 0.42 * Math.min(1, k); st.sh.scale.setScalar(0.4 + 0.6 * k);
      if (st.t >= T1) { st.rock.visible = false; st.sh.material.opacity = 0; st.t = -1; st.wait = mix(2.2, 0.5, fall) * (0.5 + Math.random());
        if (play && Math.hypot(st.x - me.x, st.z - me.z) < 0.75 && time - lastHit > 1.5) { lastHit = time; if (c.G.cushion) c.SC.gain(5, W.stoneSafe, 0); else { c.SC.lose(5, W.stoneHit); c.G.hits++; me.speed *= 0.5; } } } }
  }
  return { blocked, reset, startle, flee, update, cushionS, folk, cart, C, giver };
}
