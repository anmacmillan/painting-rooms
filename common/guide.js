/* Finding your way in a one-street world: street-name signs on the real streets, a round map, and the name of the street you are in.
   makeGuide({ THREE, scene, map, nearest, at, LEN, blocked, groundY, wet, places, style }) -> { update(me, target, show) }
     map.streets: [{ n: name, l: [[x, z], ...] }]      nearest(x, z) -> { d, s } against the route      at(s) -> { x, z, dx, dz }
     blocked(x, z): true where a sign cannot stand      groundY(x, z): height of the ground      wet(x, z): true over water (for the map)
     places: [{ n, x, z }]      style: { board, ink, post, font, land, water, street, route } */
export function makeGuide(o) {
  const { THREE, scene, map, nearest, at, LEN } = o, st = Object.assign({ board: '#efe7d2', ink: '#2a2420', post: '#4a3a2c', font: 'Georgia, serif', land: '#3a352c', water: '#3f5f78', street: '#d9cfb4', route: '#e8c060', house: '#5a5044' }, o.style || {});
  const blocked = o.blocked || (() => false), groundY = o.groundY || (() => 0), named = map.streets.filter(s => s.n && s.l.length > 1);

  // every stretch of named street near the route, for the signs, the map and the name at the top of the screen
  const segs = [];
  for (const s of named) for (let i = 0; i < s.l.length - 1; i++) { const a = s.l[i], b = s.l[i + 1], mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2, r = nearest(mx, mz); if (r.d < 130) segs.push({ n: s.n, a, b, mx, mz, d: r.d, s: r.s }); }
  const all = map.streets.filter(s => s.l.some(q => nearest(q[0], q[1]).d < 150));

  // signs: a post and a lettered board, facing along the route so it is read as you come up to it
  const tex = name => { const c = document.createElement('canvas'); c.width = 512; c.height = 112; const g = c.getContext('2d'); g.fillStyle = st.board; g.fillRect(0, 0, 512, 112); g.strokeStyle = st.ink; g.lineWidth = 6; g.strokeRect(6, 6, 500, 100);
    g.fillStyle = st.ink; g.textAlign = 'center'; g.textBaseline = 'middle'; let px = 64; g.font = `bold ${px}px ${st.font}`; while (g.measureText(name).width > 470 && px > 22) { px -= 2; g.font = `bold ${px}px ${st.font}`; } g.fillText(name, 256, 60);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const postM = new THREE.MeshLambertMaterial({ color: st.post }), placed = [];
  const byName = new Map(); for (const g of segs) { if (g.d > 30) continue; if (!byName.has(g.n)) byName.set(g.n, []); byName.get(g.n).push(g); }
  for (const [name, list] of byName) { list.sort((p, q) => p.d - q.d); let n = 0; const mine = [];
    for (const g of list) { if (n >= 3) break; if (mine.some(q => Math.hypot(q[0] - g.mx, q[1] - g.mz) < 42)) continue;
      const L = Math.hypot(g.b[0] - g.a[0], g.b[1] - g.a[1]) || 1, px = -(g.b[1] - g.a[1]) / L, pz = (g.b[0] - g.a[0]) / L; let spot = null;
      for (const off of [3.4, -3.4, 4.6, -4.6, 2.6, -2.6]) { const x = g.mx + px * off, z = g.mz + pz * off; if (!blocked(x, z) && nearest(x, z).d > 2.6 && !placed.some(q => Math.hypot(q[0] - x, q[1] - z) < 7)) { spot = [x, z]; break; } }
      if (!spot) continue; const [x, z] = spot, y = groundY(x, z), p = at(g.s), ry = Math.atan2(p.dx, p.dz), grp = new THREE.Group();
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.14, 3.3, 0.14), postM); post.position.y = 1.65; post.castShadow = true; grp.add(post);
      const m = new THREE.MeshLambertMaterial({ map: tex(name) }); for (const r of [0, Math.PI]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(3.3, 0.72), m); b.position.set(0, 2.95, r ? -0.08 : 0.08); b.rotation.y = r; grp.add(b); }
      const back = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.8, 0.14), postM); back.position.y = 2.95; grp.add(back);
      grp.position.set(x, y, z); grp.rotation.y = ry; scene.add(grp); placed.push(spot); mine.push([g.mx, g.mz]); n++; } }

  // the round map and the name of the street, in the page
  const hud = document.createElement('div'); hud.className = 'hud hidden'; hud.innerHTML = '<div id="pointer"><i>◆</i><span></span><b></b></div><canvas id="minimap" width="312" height="312"></canvas>'; document.body.appendChild(hud);
  const cv = hud.querySelector('canvas'), g = cv.getContext('2d'), nameEl = hud.querySelector('span'), nextEl = hud.querySelector('b'), R = 156, SC = 1.55;      // SC pixels to the metre: about 100 m to the rim
  const routePts = []; for (let s = 0; s <= LEN; s += 4) { const p = at(s); routePts.push([p.x, p.z]); }
  let wetCv = null; if (o.wet) { const b = o.bounds, n = 3, w = Math.ceil((b[2] - b[0]) / n), h = Math.ceil((b[3] - b[1]) / n); wetCv = document.createElement('canvas'); wetCv.width = w; wetCv.height = h; const wg = wetCv.getContext('2d'); wg.fillStyle = st.water; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (o.wet(b[0] + (i + 0.5) * n, b[1] + (j + 0.5) * n)) wg.fillRect(i, j, 1, 1); wetCv.n = n; }
  const houses = (map.buildings || []).filter(b => b.p && b.p.length > 2 && nearest(b.p[0][0], b.p[0][1]).d < 140).map(b => b.p);
  let tick = 0, lastName = '';
  function draw(me, target) {
    g.save(); g.clearRect(0, 0, 312, 312); g.beginPath(); g.arc(R, R, R, 0, 7); g.clip(); g.fillStyle = st.land; g.fillRect(0, 0, 312, 312); g.translate(R, R); g.scale(SC, SC); g.translate(-me.x, -me.z);
    if (wetCv) { g.imageSmoothingEnabled = true; g.drawImage(wetCv, o.bounds[0], o.bounds[1], wetCv.width * wetCv.n, wetCv.height * wetCv.n); }
    g.fillStyle = st.house; for (const p of houses) { if (Math.abs(p[0][0] - me.x) > 130 || Math.abs(p[0][1] - me.z) > 130) continue; g.beginPath(); g.moveTo(p[0][0], p[0][1]); for (let i = 1; i < p.length; i++) g.lineTo(p[i][0], p[i][1]); g.fill(); }
    g.lineCap = 'round'; g.lineJoin = 'round'; g.strokeStyle = st.street; g.lineWidth = 2.6; for (const s of all) { g.beginPath(); g.moveTo(s.l[0][0], s.l[0][1]); for (let i = 1; i < s.l.length; i++) g.lineTo(s.l[i][0], s.l[i][1]); g.stroke(); }
    g.strokeStyle = st.route; g.lineWidth = 2.2; g.setLineDash([5, 5]); g.beginPath(); routePts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.stroke(); g.setLineDash([]);
    for (const p of o.places || []) { g.fillStyle = st.route; g.beginPath(); g.arc(p.x, p.z, 3.4, 0, 7); g.fill(); g.strokeStyle = '#1c1a22'; g.lineWidth = 1; g.stroke(); }
    if (target) { g.fillStyle = '#fff'; g.beginPath(); g.arc(target.x, target.z, 3.6, 0, 7); g.fill(); g.strokeStyle = '#b8432b'; g.lineWidth = 1.6; g.stroke(); }
    g.translate(me.x, me.z); g.rotate(me.yaw); g.fillStyle = '#fff'; g.strokeStyle = '#1c1a22'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(0, -8); g.lineTo(5.5, 6); g.lineTo(0, 3); g.lineTo(-5.5, 6); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.fillStyle = 'rgba(241,233,216,.85)'; g.font = 'bold 20px Georgia, serif'; g.textAlign = 'center'; g.fillText('N', R, 26);
  }
  return {
    update(me, target, show) {
      hud.classList.toggle('hidden', !show); if (!show || tick++ % 5) return; draw(me, target);
      let best = null, bd = 30; for (const s of segs) { if (Math.abs(s.mx - me.x) > 90 || Math.abs(s.mz - me.z) > 90) continue; const dx = s.b[0] - s.a[0], dz = s.b[1] - s.a[1], t = Math.max(0, Math.min(1, ((me.x - s.a[0]) * dx + (me.z - s.a[1]) * dz) / (dx * dx + dz * dz || 1))), d = Math.hypot(me.x - s.a[0] - dx * t, me.z - s.a[1] - dz * t); if (d < bd) { bd = d; best = s; } }
      const name = best ? best.n : ''; if (name !== lastName) { lastName = name; nameEl.textContent = name || '…'; }
      const ms = nearest(me.x, me.z).s; let nx = null; for (const p of o.places || []) { if (p.s == null) p.s = nearest(p.x, p.z).s; if (p.s > ms + 6 && (!nx || p.s < nx.s)) nx = p; }
      nextEl.textContent = nx ? `${nx.n} · ${Math.round((nx.s - ms) / 5) * 5} m` : '';
    } };
}
