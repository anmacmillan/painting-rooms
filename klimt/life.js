/* The life of the street, Vienna 1908: the market by the Secession, two tram crossings, a coffee-house terrace with its waiters, a hat on the wind, people walking.
   Attested (research/FINDINGS.md): electric trams (the last horse tram ran in 1903) and their nickname "Bim"; the market beside the Secession, with umbrellas over
   the stalls as in the photograph of about 1900; coffee houses and their waiters. The game's own: the upset cabbages, the waiters' collisions, the runaway hat,
   every word, the tram's colours (today's red and white: not checked for 1908) and exactly where each thing stands.
   makeLife(o) -> { update(dt, me, playing, time) -> { slow, slide }, walkers, trams } */
export function makeLife({ THREE, scene, FIG, T, at, side, nearest, LEN, SC, SND, say, rnd, PLAN, blocked }) {
  const lam = o => new THREE.MeshLambertMaterial(o), basic = o => new THREE.MeshBasicMaterial(o), W = PLAN.words;
  const box = (par, w, h, d, m, x, y, z) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); b.position.set(x, y, z); par.add(b); return b; };
  const cool = { tram: 0, waiter: 0, cab: 0 };

  /* ---- the market: stalls under big umbrellas, heaps of fruit and greens, market women ---- */
  const sM0 = nearest(...PLAN.market[0]).s, sM1 = nearest(...PLAN.market[1]).s, stalls = [], women = [];
  { const cols = ['#e8dcc0', '#d8b890', '#c9d2c0', '#e2c8a8', '#b8c4cc'], fruit = ['#d8442a', '#e89a2a', '#6a9a3a', '#e8d048', '#8a3a5a'], wood = lam({ color: '#8a6a44' }), pole = lam({ color: '#5a4a3a' });
    let i = 0; for (let s = sM0 - 4; s < sM1 + 22; s += 7.5) for (const sg of [-1, 1]) { const p = at(Math.max(1, s)), [x, z] = side(p, 0, sg * (5.6 + (i % 3) * 0.7)); if (blocked(x, z)) continue; const g = new THREE.Group(); box(g, 2.4, 0.12, 1.3, wood, 0, 0.85, 0); for (const [a, b] of [[-1.1, -0.55], [1.1, -0.55], [-1.1, 0.55], [1.1, 0.55]]) box(g, 0.08, 0.85, 0.08, wood, a, 0.42, b);
        for (let k = 0; k < 3; k++) { const heap = new THREE.Mesh(new THREE.SphereGeometry(0.38, 8, 6, 0, 6.3, 0, 1.6), lam({ color: fruit[(i + k) % fruit.length] })); heap.position.set(-0.75 + k * 0.75, 0.9, 0); heap.scale.y = 0.8; g.add(heap); }
        const pl = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.9, 6), pole); pl.position.set(0, 1.45, -0.5); g.add(pl); const um = new THREE.Mesh(new THREE.ConeGeometry(1.9, 0.75, 10, 1, true), lam({ color: cols[i % cols.length], side: THREE.DoubleSide })); um.position.set(0, 3.0, -0.5); g.add(um);
        g.position.set(x, 0, z); g.rotation.y = Math.atan2(p.dx, p.dz) + (sg > 0 ? Math.PI / 2 : -Math.PI / 2); scene.add(g); stalls.push({ x, z }); if (i % 3 === 0) { const w = FIG.spawn('market', { size: 1.1, adult: true }); const [wx, wz] = side(p, 1.6, sg * (6.6 + (i % 3) * 0.7)); w.position.set(wx, 0, wz); w.rotation.y = Math.atan2(p.x - wx, p.z - wz); FIG.pose(w, 0, 0); women.push(w); } i++; } }
  /* the cabbages: a barrow goes over as she comes by, and they roll across the way */
  const cab = { s: sM1 + 6, state: 'idle', balls: [] };
  { const p = at(cab.s), [bx, bz] = side(p, 0, -4.2), g = new THREE.Group(), wood = lam({ color: '#7a5a38' }); box(g, 0.8, 0.35, 1.3, wood, 0, 0.6, 0); const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.07, 12), wood); wh.rotation.z = Math.PI / 2; wh.position.set(0, 0.3, 0.8); g.add(wh); g.position.set(bx, 0, bz); g.rotation.y = Math.atan2(p.dx, p.dz); scene.add(g); cab.g = g; cab.p = p; cab.bx = bx; cab.bz = bz;
    const cm = [lam({ color: '#8ab860' }), lam({ color: '#a4cc74' }), lam({ color: '#7aa854' })]; for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.24, 10, 8), cm[i % 3]); b.position.set(bx, 0.95 + (i % 2) * 0.3, bz); scene.add(b); cab.balls.push({ m: b, t0: i * 0.28, u: (i - 3) * 0.9, v: -4.2, on: false }); } }

  /* ---- the tramway: a red and white motor car crossing the walk, its bell first ---- */
  const trams = PLAN.trams.map(([x, z], i) => { const s = nearest(x, z).s, p = at(s), g = new THREE.Group(), red = lam({ color: '#b8281e' }), cream = lam({ color: '#f0e8d2' }), dk = basic({ color: '#20242a' }), railM = lam({ color: '#3a3a40' });
    box(g, 2.3, 1.0, 9.6, red, 0, 0.95, 0); box(g, 2.3, 1.1, 9.6, cream, 0, 2.0, 0); box(g, 2.34, 0.75, 6.6, dk, 0, 2.05, 0); box(g, 2.5, 0.16, 10.2, lam({ color: '#8a8478' }), 0, 2.65, 0); box(g, 1.5, 0.3, 7.6, cream, 0, 2.86, 0);
    for (const e of [-1, 1]) { box(g, 2.1, 0.9, 0.1, dk, 0, 2.05, e * 4.82); const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 6), basic({ color: '#ffe9a0' })); lamp.position.set(0, 1.1, e * 4.85); g.add(lamp); box(g, 0.3, 0.5, 0.06, basic({ color: '#f6f0dc' }), 0, 2.95, e * 4.9); }
    for (const e of [-3, 3]) for (const f of [-1, 1]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.12, 12), dk); w.rotation.z = Math.PI / 2; w.position.set(f * 0.95, 0.4, e); g.add(w); }
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.03, 4, 12, Math.PI), dk); bow.position.set(0, 3.0, 0.4); bow.rotation.x = -0.5; g.add(bow);
    scene.add(g); const nx = -p.dz, nz = p.dx;      /* it runs across the walk */
    for (const e of [-0.72, 0.72]) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.04, 150), railM); r.position.set(p.x + p.dx * e, 0.03, p.z + p.dz * e); r.rotation.y = Math.atan2(nx, nz); scene.add(r); }
    return { g, s, p, nx, nz, u: -75 - i * 40, v: 7.5, dir: 1, rang: false, wait: 0 }; });

  /* ---- the coffee-house terrace: round tables, bentwood chairs, two waiters crossing the pavement with their trays ---- */
  const sC0 = nearest(...PLAN.cafe[0]).s, sC1 = nearest(...PLAN.cafe[1]).s, waiters = [];
  { const cloth = lam({ color: '#f4f0e6' }), chairM = lam({ color: '#4a2e1e' }), leg = lam({ color: '#2a2622' }); let i = 0;
    for (let s = sC0; s < sC1; s += 6.5, i++) { const p = at(s), [x, z] = side(p, 0, -6.2 - (i % 2) * 1.7); if (blocked(x, z)) continue; const g = new THREE.Group(); const top = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.04, 16), cloth); top.position.y = 0.74; g.add(top); const st = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.2, 0.74, 8), leg); st.position.y = 0.37; g.add(st);
      const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.04, 0.07, 8), lam({ color: '#ffffff' })); cup.position.set(0.12, 0.8, 0); g.add(cup);
      for (const a of [0.6, 3.6]) { const c = new THREE.Group(); box(c, 0.4, 0.04, 0.4, chairM, 0, 0.45, 0); box(c, 0.4, 0.5, 0.04, chairM, 0, 0.72, -0.2); for (const [u, v] of [[-0.17, -0.17], [0.17, -0.17], [-0.17, 0.17], [0.17, 0.17]]) box(c, 0.04, 0.45, 0.04, chairM, u, 0.22, v); c.position.set(Math.cos(a) * 0.8, 0, Math.sin(a) * 0.8); c.rotation.y = -a + Math.PI / 2; g.add(c); }
      g.position.set(x, 0, z); scene.add(g); }
    for (let k = 0; k < 2; k++) { const g = FIG.spawn('waiter', { size: 1.14, adult: true }), tray = new THREE.Group(), tm = lam({ color: '#c8c8d0' }); const d = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.02, 14), tm); tray.add(d); const cups = []; for (const [u, v] of [[-0.09, 0.05], [0.09, -0.04], [0, 0.1]]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.035, 0.07, 8), lam({ color: '#ffffff' })); c.position.set(u, 0.045, v); tray.add(c); cups.push(c); }
      scene.add(tray); waiters.push({ g, tray, cups, s: sC0 + 6 + k * (sC1 - sC0 - 12), ph: k * 2.4, v: 0, warned: false, spill: 0, fly: [] }); } }

  /* ---- a hat on the wind: a gentleman's boater bowls along the street; catch it for him ---- */
  const hat = { s: nearest(...PLAN.hat).s, state: 'idle', g: new THREE.Group(), u: 0, off: 0, v: 0, t: 0 };
  { const straw = lam({ color: '#e6d9a8' }); const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.025, 18), straw), crown = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.14, 16), straw), band = new THREE.Mesh(new THREE.CylinderGeometry(0.175, 0.175, 0.05, 16), lam({ color: '#26242a' })); crown.position.y = 0.08; band.position.y = 0.04; hat.g.add(brim, crown, band); hat.g.visible = false; scene.add(hat.g);
    hat.man = FIG.spawn('gent_black', { size: 1.16, adult: true }); const p = at(hat.s - 6), [x, z] = side(p, 0, 3.6); hat.man.position.set(x, 0, z); hat.man.rotation.y = Math.atan2(p.dx, p.dz); FIG.pose(hat.man, 0, 0); }

  /* ---- people walking: every third word they say is a greeting; all of it is invented ---- */
  const walkers = []; { const WHO = ['lady_white', 'gent_grey', 'lady_mauve', 'gent_black', 'lady_green', 'conductor', 'gent_grey', 'lady_white', 'market', 'gent_black', 'lady_mauve', 'gent_grey', 'lady_green', 'lady_white', 'gent_black', 'lady_mauve', 'gent_grey', 'lady_green', 'lady_white', 'gent_black', 'market', 'lady_mauve', 'gent_grey', 'lady_green', 'lady_white', 'gent_black', 'lady_mauve', 'gent_grey', 'lady_white', 'conductor', 'lady_green', 'gent_black', 'lady_mauve', 'gent_grey', 'lady_white', 'gent_black'];
    const SPAN = [[sM1 + 14, 150], [150, 300], [300, 430], [430, 560], [560, 700], [700, LEN - 80]];
    WHO.forEach((n, i) => { const [lo, hi] = SPAN[i % SPAN.length], g = FIG.spawn(n, { size: rnd(1.08, 1.18), adult: true, tint: i % 4 === 2 ? '#c8b8a8' : undefined }); walkers.push({ g, n, s: rnd(lo, hi), dir: i % 2 ? 1 : -1, off: (i % 2 ? 1 : -1) * rnd(2.2, 5.5), v: rnd(0.7, 1.15), ph: rnd(0, 6), lo, hi, said: 0 }); }); }

  function update(dt, me, playing, time, cam) { const out = { slow: false, slide: false }, ms = nearest(me.x, me.z).s; for (const k in cool) cool[k] -= dt;
    /* cabbages */
    if (cab.state === 'idle' && playing && ms > cab.s - 13 && ms < cab.s) { cab.state = 'roll'; cab.t = 0; say(women[0] || cab.g, W.market, 2.6); cab.g.rotation.z = 1.1; if (SND.puff) SND.puff(0.1); }
    if (cab.state === 'roll') { cab.t += dt; let live = false; for (const b of cab.balls) { const t = cab.t - b.t0; if (t < 0) { live = true; continue; } b.v = -4.2 + t * 3.4; const [x, z] = side(cab.p, b.u, b.v); b.m.position.set(x, 0.24 + Math.max(0, 0.7 - t * 2) , z); b.m.rotation.x += dt * 9; b.on = b.v < 7; if (b.on) live = true;
        if (b.on && playing && !me.air && cool.cab < 0 && Math.hypot(me.x - x, me.z - z) < 0.75) { cool.cab = 2.5; out.slide = true; SC.lose(5, 'Whoops! A cabbage!'); } } if (!live) cab.state = 'done'; }
    /* trams */
    for (const t of trams) { if (t.wait > 0) { t.wait -= dt; if (t.wait <= 0) { t.dir = -t.dir; t.rang = false; } } else { t.u += t.dir * t.v * dt; if (Math.abs(t.u) > 75) { t.u = 75 * Math.sign(t.u); t.wait = 5 + Math.random() * 3; } }
      const x = t.p.x + t.nx * t.u, z = t.p.z + t.nz * t.u; t.g.position.set(x, 0, z); t.g.rotation.y = Math.atan2(t.nx, t.nz); t.g.visible = Math.hypot(x - cam.x, z - cam.z) < 260;
      const near = Math.abs(ms - t.s) < 38; if (near && playing && !t.rang && t.wait <= 0 && Math.abs(t.u) < 46 && t.u * t.dir < 0) { t.rang = true; say(t.g, W.tram, 1.8); if (SND.bell) { SND.bell(12, 0.11); SND.bell(12, 0.11, 0.22); SND.bell(12, 0.09, 0.5); SND.bell(12, 0.09, 0.72); } }
      const dx = me.x - x, dz = me.z - z, along = dx * t.nx + dz * t.nz, across = dx * t.p.dx + dz * t.p.dz; if (playing && Math.abs(along) < 5.3 && Math.abs(across) < 1.75) { const sg = across >= 0 ? 1 : -1; me.x += t.p.dx * (sg * 1.85 - across); me.z += t.p.dz * (sg * 1.85 - across); out.slow = true; if (cool.tram < 0) { cool.tram = 3; SC.lose(10, 'Bim! Mind the tram!'); } } }
    /* waiters */
    for (const w of waiters) { const p = at(w.s), off = 4.6 * Math.sin(time * 0.55 + w.ph) - 1.2, [x, z] = side(p, 0, off), vx = Math.cos(time * 0.55 + w.ph); w.g.position.set(x, 0, z); w.g.rotation.y = Math.atan2(-p.dz * vx, p.dx * vx); w.g.visible = Math.hypot(x - cam.x, z - cam.z) < 140; FIG.pose(w.g, time * 5 + w.ph, 0.7); T(w.g, 'upperarmR', -150, 0, -30); T(w.g, 'forearmR', -60);
      const d = Math.hypot(me.x - x, me.z - z); if (w.spill > 0) w.spill -= dt; w.tray.visible = w.g.visible; w.tray.position.set(x + Math.sin(w.g.rotation.y + 1.2) * 0.32, 1.95 + (w.spill > 0 ? -0.3 : 0), z + Math.cos(w.g.rotation.y + 1.2) * 0.32); w.tray.rotation.z = w.spill > 0 ? 0.9 : 0;
      if (playing && d < 9 && !w.warned) { w.warned = true; say(w.g, W.waiter[0], 2.2); } if (d > 16) w.warned = false;
      if (playing && d < 0.85 && cool.waiter < 0 && !me.air) { cool.waiter = 4; w.spill = 2.5; out.slow = true; SC.lose(10, 'Crash! The coffee!'); say(w.g, W.waiter[1], 2.8); if (SND.puff) SND.puff(0.14); w.fly = w.cups.map(c => ({ c, vx: rnd(-2, 2), vy: rnd(3, 5), vz: rnd(-2, 2), t: 0 })); }
      for (const f of w.fly) { f.t += dt; f.c.position.x += f.vx * dt; f.c.position.z += f.vz * dt; f.c.position.y += (f.vy - 12 * f.t) * dt; f.c.rotation.x += dt * 10; } if (w.fly.length && w.spill <= 0) { w.fly = []; w.cups.forEach((c, i) => { c.position.set([-0.09, 0.09, 0][i], 0.045, [0.05, -0.04, 0.1][i]); c.rotation.x = 0; }); } }
    /* the hat */
    if (hat.state === 'idle' && playing && ms > hat.s - 12 && ms < hat.s + 4) { hat.state = 'roll'; hat.u = hat.s - 3; hat.v = 9.5; hat.t = 0; hat.g.visible = true; say(hat.man, W.hat, 2.6); T(hat.man, 'upperarmR', -150, 0, -20); if (SND.whoosh) SND.whoosh(0.08); }
    if (hat.state === 'roll') { hat.t += dt; hat.v = Math.max(3.2, hat.v - dt * 0.9); hat.u = Math.min(LEN - 70, hat.u + hat.v * dt); const p = at(hat.u), [x, z] = side(p, 0, 1.4 * Math.sin(hat.t * 1.3)); hat.g.position.set(x, 0.32 + 0.12 * Math.abs(Math.sin(hat.t * 6)), z); hat.g.rotation.z = Math.PI / 2; hat.g.rotation.y = Math.atan2(p.dx, p.dz) + Math.PI / 2; hat.g.rotation.x += dt * hat.v * 3;
      if (playing && Math.hypot(me.x - x, me.z - z) < 1.3) { hat.state = 'done'; hat.g.visible = false; SC.gain(30, 'Caught the hat!', 2); say(hat.man, W.hatThanks, 3); } else if (hat.t > 40 || hat.u >= LEN - 70) { hat.state = 'done'; hat.g.visible = false; } }
    /* walkers */
    for (const w of walkers) { w.s += w.dir * w.v * dt; if (w.s > w.hi) { w.s = w.hi; w.dir = -1; } if (w.s < w.lo) { w.s = w.lo; w.dir = 1; }
      const p = at(w.s); let [x, z] = side(p, 0, w.off); const dx = x - me.x, dz = z - me.z, d = Math.hypot(dx, dz); if (d < 1.6 && d > 0.01) { const k = (1.6 - d) * 0.7; x += dx / d * k; z += dz / d * k; }
      w.g.visible = Math.hypot(x - cam.x, z - cam.z) < 120; if (!w.g.visible) continue; w.g.position.set(x, 0, z); w.ph += dt * (2 + w.v * 2.6); FIG.pose(w.g, w.ph, w.v / 1.6); const heading = Math.atan2(p.dx * w.dir, p.dz * w.dir); let dy = heading - w.g.rotation.y; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); w.g.rotation.y += dy * Math.min(1, dt * 4);
      let look = 0; if (d < 8) { look = Math.atan2(me.x - x, me.z - z) - w.g.rotation.y; look = Math.max(-1.2, Math.min(1.2, Math.atan2(Math.sin(look), Math.cos(look)))); } const hd = w.g.userData.hd; hd.rotation.y += (look - hd.rotation.y) * Math.min(1, dt * 4);
      if (d < 3 && playing && time > w.said && say.free()) { w.said = time + 30; say(w.g, W.town[Math.floor(Math.random() * W.town.length)], 2.8); } }
    return out; }
  const reset = () => { cab.state = 'idle'; cab.g.rotation.z = 0; cab.balls.forEach((b, i) => { b.m.position.set(cab.bx, 0.95 + (i % 2) * 0.3, cab.bz); b.on = false; }); hat.state = 'idle'; hat.g.visible = false; trams.forEach((t, i) => { t.u = -75 - i * 40; t.dir = 1; t.wait = 0; t.rang = false; }); };
  return { update, reset, walkers, trams, waiters, hat, cab, stalls, S: { market: [sM0, sM1], cafe: [sC0, sC1], hat: hat.s, cab: cab.s, trams: trams.map(t => t.s) } };
}
