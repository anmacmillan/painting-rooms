/* Horses, cattle and sheep for the procession, built here in three.js from turned and stretched solids (the people are Blender figures; the beasts are not).
   What they rest on (research/FINDINGS.md): the horses after those of the west and north frieze: small, short in the back, thick in the neck, the mane cropped and
   standing, the tail long; they prance with the forelegs lifted. The cattle and sheep after the south and north frieze. Their colours are this level's.
   A beast faces +Z, stands on y = 0, and is moved by turning its joints: legs[i] = { hip, knee } (0, 1 fore; 2, 3 hind), neck, head, tail, and body (which pitches to rear). */
export function makeBeasts({ THREE, scene }) {
  const lam = c => new THREE.MeshLambertMaterial({ color: c }), V3 = THREE.Vector3;
  const mesh = (g, m, x, y, z, sx = 1, sy = 1, sz = 1) => { const o = new THREE.Mesh(g, m); o.position.set(x, y, z); o.scale.set(sx, Math.abs(sy), sz); if (sy < 0) o.rotation.x = Math.PI; o.castShadow = true; return o; };
  const SPH = new THREE.SphereGeometry(1, 16, 12), CYL = new THREE.CylinderGeometry(1, 1, 1, 12), CONE = new THREE.CylinderGeometry(1, 0.6, 1, 10), BOX = new THREE.BoxGeometry(1, 1, 1);
  CYL.translate(0, -0.5, 0); CONE.translate(0, -0.5, 0);      // limbs hang from their joint
  const KIND = {
    horse: { len: 1.36, r: 0.29, h: 1.34, up: 0.46, low: 0.5, legR: 0.062, neck: 0.72, neckR: 0.19, neckA: -0.72, head: 0.5, headR: 0.125, tail: 0.85, coat: '#8a5a34', mane: '#2a1c14', hoof: '#2a2420' },
    ox: { len: 1.7, r: 0.4, h: 1.26, up: 0.38, low: 0.42, legR: 0.07, neck: 0.42, neckR: 0.27, neckA: -1.25, head: 0.48, headR: 0.17, tail: 0.9, coat: '#e9e0cc', mane: '#c9b89a', hoof: '#3a3028', horns: true },
    sheep: { len: 0.78, r: 0.25, h: 0.66, up: 0.2, low: 0.22, legR: 0.035, neck: 0.22, neckR: 0.13, neckA: -0.9, head: 0.24, headR: 0.085, tail: 0.14, coat: '#e6dcc6', mane: '#3a3028', hoof: '#2a2420', wool: true },
  };
  function make(kind, o = {}) {
    const K = { ...KIND[kind], ...o }, g = new THREE.Group(), body = new THREE.Group(), mats = { coat: lam(K.coat), mane: lam(K.mane), hoof: lam(K.hoof), pale: lam(o.pale || '#f1e9d8') }, hipY = K.up + K.low + 0.03;
    body.position.set(0, hipY, -K.len / 2); g.add(body);      // the body turns about the hind hips
    const by = K.h - hipY - K.r * 0.55, add = (m, to = body) => { to.add(m); return m; };
    add(mesh(SPH, mats.coat, 0, by, K.len / 2, K.r, K.r * 1.02, K.len / 2 + K.r * 0.2)); add(mesh(SPH, mats.coat, 0, by + 0.02, K.len * 0.86, K.r * 1.02, K.r * 1.1, K.r * 1.05)); add(mesh(SPH, mats.coat, 0, by + 0.03, K.len * 0.1, K.r * 1.04, K.r * 1.08, K.r * 1.1));
    if (K.wool) for (let i = 0; i < 9; i++) add(mesh(SPH, mats.coat, Math.cos(i * 2.4) * K.r * 0.55, by + 0.06 + Math.sin(i * 1.7) * K.r * 0.4, K.len * (0.1 + 0.1 * i), K.r * 0.62, K.r * 0.6, K.r * 0.62));
    const neck = new THREE.Group(); neck.position.set(0, by + K.r * 0.45, K.len * 0.92); neck.rotation.x = K.neckA; body.add(neck);
    { const n = mesh(CONE, mats.coat, 0, 0, 0, K.neckR, -K.neck, K.neckR * 1.25); neck.add(n);
      if (kind === 'horse') { const m = mesh(BOX, mats.mane, 0, K.neck * 0.5, -K.neckR * 1.05, 0.05, K.neck * 0.95, 0.1); neck.add(m); }      // the cropped mane, standing
      if (kind === 'ox') neck.add(mesh(SPH, mats.coat, 0, K.neck * 0.45, K.neckR * 0.9, 0.06, K.neck * 0.5, 0.2)); }                               // the dewlap
    const head = new THREE.Group(); head.position.set(0, K.neck, 0); head.rotation.x = kind === 'horse' ? 1.95 : 2.35; neck.add(head);
    head.add(mesh(CONE, mats.coat, 0, K.headR * 0.4, 0, K.headR * 1.25, -K.head, K.headR * 1.1)); head.add(mesh(SPH, mats.coat, 0, K.headR * 0.3, 0, K.headR * 1.2, K.headR * 1.2, K.headR * 1.25));
    for (const e of [-1, 1]) { head.add(mesh(CONE, mats.coat, e * K.headR * 0.7, 0.02, -K.headR * 0.9, 0.035, -(kind === 'horse' ? 0.13 : 0.1), 0.02));
      if (K.horns) { const h = mesh(CONE, mats.pale, e * K.headR * 0.95, 0.06, -K.headR * 0.5, 0.035, -0.26, 0.035); h.rotation.z = -e * 0.9; head.add(h); }
      head.add(mesh(SPH, mats.hoof, e * K.headR * 0.95, K.head * 0.3, -K.headR * 0.25, 0.022, 0.022, 0.022)); }
    const tail = new THREE.Group(); tail.position.set(0, by + K.r * 0.7, -K.r * 0.15); tail.rotation.x = -0.5; body.add(tail); tail.add(mesh(CONE, kind === 'horse' ? mats.mane : mats.coat, 0, 0, 0, kind === 'horse' ? 0.075 : 0.03, K.tail, kind === 'horse' ? 0.075 : 0.03));
    const legs = []; for (const [fz, to] of [[K.len * 0.86, body], [K.len * 0.86, body], [0.06, g], [0.06, g]]) { const e = legs.length % 2 ? -1 : 1, hip = new THREE.Group(), knee = new THREE.Group(), hind = to === g;
      hip.position.set(e * K.r * 0.55, hind ? hipY : 0, hind ? -K.len / 2 + fz : fz); to.add(hip); knee.position.y = -K.up; hip.add(knee);
      hip.add(mesh(CONE, mats.coat, 0, 0.06, 0, K.legR * (hind ? 2.1 : 1.6), K.up + 0.06, K.legR * (hind ? 2.4 : 1.7))); knee.add(mesh(CYL, mats.coat, 0, 0, 0, K.legR, K.low - 0.05, K.legR)); knee.add(mesh(CYL, mats.hoof, 0, -K.low + 0.06, 0, K.legR * 1.35, 0.09, K.legR * 1.45)); legs.push({ hip, knee, hind }); }
    g.userData = { kind, K, body, neck, head, tail, legs, mats, seatY: by + K.r * 0.92, seatZ: K.len * 0.42, neckA: K.neckA, ph: Math.random() * 6 };
    scene.add(g); return g;
  }
  /* ph: where it is in its stride; pace: 0 standing, about 1 walking, 2 and more cantering; rear: 0..1, up on the hind legs with the forelegs gathered (as the frieze's horses go) */
  function pose(g, ph, pace, rear = 0, toss = 0) { const u = g.userData, k = Math.min(1, pace), gal = Math.min(1, Math.max(0, pace - 1.2)), s = Math.sin(ph), amp = 0.42 * k + 0.25 * gal;
    const pitch = -rear * 0.5 - gal * 0.1 * Math.sin(ph + 0.6); u.body.rotation.x = pitch; u.body.position.y = u.K.up + u.K.low + 0.03 + Math.abs(Math.cos(ph)) * 0.03 * k + gal * 0.07 * Math.sin(ph + 1.2);
    u.legs.forEach((L, i) => { const off = gal > 0.5 ? (L.hind ? 0.5 + (i % 2) * 0.35 : Math.PI + (i % 2) * 0.35) : (i === 0 || i === 3 ? 0 : Math.PI), a = Math.sin(ph + off), lift = Math.max(0, Math.cos(ph + off));
      if (L.hind) { L.hip.rotation.x = -a * amp * 0.8 - rear * 0.2 + pitch * 0; L.knee.rotation.x = -lift * (0.5 * k + 0.5 * gal) - rear * 0.15; g.userData.hy = 0; }
      else { L.hip.rotation.x = -a * amp - rear * (1.0 + 0.25 * (i ? 1 : -1)) - pitch; L.knee.rotation.x = lift * (0.6 * k + 0.6 * gal) + rear * (1.15 + 0.3 * (i ? -1 : 1)); } });
    u.neck.rotation.x = u.neckA + 0.08 * s * k + rear * 0.25 - toss * 0.5; u.head.rotation.x = (u.kind === 'horse' ? 1.95 : 2.35) + rear * 0.3 + toss * 0.4; u.tail.rotation.x = -0.5 - 0.3 * gal + 0.12 * Math.sin(ph * 0.7); u.tail.rotation.z = 0.15 * Math.sin(ph * 0.5); }
  return { make, pose };
}
