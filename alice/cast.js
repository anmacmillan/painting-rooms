/* The creatures of alice/street.html that are not human, built here from simple solids rather than in Blender (tools/blender/figure.py makes Alice and the Hatter):
   the White Rabbit, the March Hare, the Dormouse and the Cheshire Cat, with the Hatter's hat. All of it is grey and white: the level's engraving filter draws it in line.
   What each wears is read by eye from Tenniel's 1865 plates (alice/images/): the Rabbit's checked jacket, waistcoat, wing collar, watch on a chain and umbrella under the arm;
   the Hare's straw on its head; the Cat's stripes and grin; the Hatter's hat with its ticket "In this Style 10/6". Every figure faces +z. */
export function makeCast(THREE, canvasTex) {
  const lam = o => new THREE.MeshLambertMaterial(o), sph = new THREE.SphereGeometry(1, 20, 14);
  const ell = (m, rx, ry, rz, x = 0, y = 0, z = 0) => { const e = new THREE.Mesh(sph, m); e.scale.set(rx, ry, rz); e.position.set(x, y, z); e.castShadow = true; return e; };
  const rod = (m, r0, r1, len, seg = 8) => { const g = new THREE.Group(), c = new THREE.Mesh(new THREE.CylinderGeometry(r0, r1, len, seg), m); c.position.y = -len / 2; c.castShadow = true; g.add(c); return g; };
  const white = lam({ color: '#f6f4ee' }), pale = lam({ color: '#dedbd2' }), dark = lam({ color: '#1c1a18' }), mid = lam({ color: '#8a8782' });
  const check = canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#d9d6cd'; g.fillRect(0, 0, w, h); g.strokeStyle = '#1c1a18'; g.lineWidth = 8; for (let k = -w; k < w * 2; k += 42) { g.beginPath(); g.moveTo(k, 0); g.lineTo(k + h * 0.5, h); g.moveTo(k + h * 0.5, 0); g.lineTo(k, h); g.stroke(); } }, true); check.repeat.set(5, 2.5);
  const checkM = lam({ map: check }), vestM = lam({ map: canvasTex(128, 128, (g, w, h) => { g.fillStyle = '#f2efe6'; g.fillRect(0, 0, w, h); g.fillStyle = '#1c1a18'; for (const y of [34, 64, 94]) { g.beginPath(); g.arc(64, y, 5, 0, 7); g.fill(); } }) });
  const furM = lam({ map: canvasTex(256, 256, (g, w, h) => { g.fillStyle = '#f4f2ec'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(40,36,30,.5)'; g.lineWidth = 2; for (let i = 0; i < 260; i++) { const x = Math.random() * w, y = Math.random() * h; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 3, y + 10 + Math.random() * 8); g.stroke(); } }, true) });

  // o: hare (straw on the head, no watch or umbrella, a darker coat), bow (a spotted bow tie)
  function rabbit(o = {}) {
    const g = new THREE.Group(), rig = new THREE.Group(); g.add(rig); const coat = o.hare ? lam({ color: '#6a6864' }) : checkM, fur = o.hare ? lam({ color: '#b9b5ac', map: furM.map }) : furM;
    rig.add(ell(fur, 0.13, 0.18, 0.165, 0, 0.34, -0.03));                                            // haunches and belly
    rig.add(ell(coat, 0.15, 0.2, 0.158, 0, 0.56, 0.0)); rig.add(ell(vestM, 0.1, 0.15, 0.115, 0, 0.52, 0.07));      // jacket, and the waistcoat in front
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.085, 0.075, 12, 1, true), lam({ color: '#f6f4ee', side: THREE.DoubleSide })); col.position.set(0, 0.75, 0.02); rig.add(col);      // the wing collar
    const head = new THREE.Group(); head.position.set(0, 0.8, 0.03); rig.add(head);
    head.add(ell(fur, 0.085, 0.09, 0.11, 0, 0.06, 0.0), ell(fur, 0.055, 0.058, 0.085, 0, 0.035, 0.105), ell(dark, 0.016, 0.012, 0.012, 0, 0.05, 0.188));
    for (const s of [-1, 1]) { head.add(ell(dark, 0.02, 0.022, 0.012, s * 0.074, 0.088, 0.05)); head.add(ell(white, 0.034, 0.038, 0.02, s * 0.064, 0.088, 0.045)); }      // the eyes, dark in a pale socket
    const ears = [-1, 1].map(s => { const e = new THREE.Group(); e.position.set(s * 0.032, 0.13, -0.03); const a = ell(fur, 0.021, 0.2, 0.036, 0, 0.2, 0), b = ell(mid, 0.009, 0.15, 0.02, 0, 0.2, 0.022); e.add(a, b); e.userData.rx = s < 0 ? -0.42 : -0.08; e.rotation.set(e.userData.rx, 0, -s * (o.hare ? 0.5 : 0.1)); head.add(e); return e; });
    if (o.hare) for (let i = 0; i < 9; i++) { const s = rod(dark, 0.004, 0.004, 0.2 + (i % 3) * 0.06, 4); s.position.set((i % 3 - 1) * 0.03, 0.15, -0.01); s.rotation.set(-0.6 + (i % 4) * 0.4, 0, (i - 4) * 0.32); head.add(s); }      // straw
    if (o.bow) for (const s of [-1, 1]) { const b = ell(pale, 0.07, 0.045, 0.02, s * 0.065, 0.73, 0.1); rig.add(b); }
    const arms = [-1, 1].map(s => { const a = new THREE.Group(); a.position.set(s * 0.15, 0.67, 0.0); const up = rod(coat, 0.045, 0.038, 0.19), fo = new THREE.Group(); fo.position.y = -0.19; const f = rod(coat, 0.037, 0.031, 0.14), paw = ell(fur, 0.03, 0.042, 0.03, 0, -0.17, 0); fo.add(f, paw); a.add(up, fo); a.userData.fore = fo; rig.add(a); return a; });
    const legs = [-1, 1].map(s => { const l = new THREE.Group(); l.position.set(s * 0.085, 0.27, 0.0); l.add(ell(fur, 0.07, 0.15, 0.115, 0, -0.07, 0.01)); const foot = ell(fur, 0.04, 0.03, 0.14, 0, -0.238, 0.085); l.add(foot); rig.add(l); return l; });
    rig.add(ell(fur, 0.06, 0.06, 0.06, 0, 0.24, -0.2));                                               // the scut
    const u = g.userData = { rig, head, ears, arms, legs };
    if (!o.hare) {
      const um = new THREE.Group(); um.add(rod(dark, 0.012, 0.016, 0.62, 6)); const hk = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.008, 5, 10, Math.PI), dark); hk.position.set(0, 0.03, 0); um.add(hk);
      um.position.set(0.17, 0.8, -0.2); um.rotation.set(-0.95, 0, -0.1); rig.add(um); u.umbrella = um;                               // under the left arm, handle up behind the shoulder
      const watch = new THREE.Group(); const face = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.012, 18), white); face.rotation.x = Math.PI / 2; const rim = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.007, 5, 18), dark); watch.add(face, rim);
      for (let i = 0; i < 6; i++) { const l = new THREE.Mesh(new THREE.TorusGeometry(0.008, 0.003, 4, 6), dark); l.position.set(0, -0.045 - i * 0.02, 0); watch.add(l); }
      watch.position.set(0, -0.2, 0.03); arms[0].userData.fore.add(watch); u.watch = watch; watch.visible = false;
    }
    // pace 0 standing, 1 running; ph the phase of the stride
    u.pose = (ph, pace) => { const s = Math.sin(ph), c = Math.cos(ph), k = Math.min(1.2, pace);
      rig.position.y = Math.abs(c) * 0.05 * k; rig.rotation.x = 0.1 + 0.25 * k;
      legs[0].rotation.x = -s * 0.9 * k; legs[1].rotation.x = s * 0.9 * k;
      arms[0].rotation.x = s * 0.8 * k - 0.25 * k; arms[1].rotation.x = -s * 0.8 * k - 0.25 * k; arms[0].userData.fore.rotation.x = arms[1].userData.fore.rotation.x = -0.5 - 0.6 * k;
      ears.forEach((e, i) => { e.rotation.x = e.userData.rx - 0.7 * k + Math.sin(ph * 2 + i) * 0.08 * k; }); head.rotation.x = -0.1 * k; };
    // the plate: the watch held up in the right paw before his face, his head bent to it
    u.watching = k => { arms[0].rotation.x = -1.35 * k; arms[0].rotation.z = 0.25 * k; arms[0].userData.fore.rotation.x = -1.25 * k; head.rotation.x = 0.28 * k; if (u.watch) u.watch.visible = k > 0.3; if (k > 0) { arms[1].rotation.x = 0.1; arms[1].userData.fore.rotation.x = -0.9; } };
    u.pose(0, 0); return g;
  }

  function dormouse() {
    const g = new THREE.Group(), fur = lam({ color: '#a9a59c', map: furM.map });
    g.add(ell(fur, 0.15, 0.13, 0.13, 0, 0.1, 0)); const head = new THREE.Group(); head.position.set(0, 0.16, 0.12); g.add(head);
    head.add(ell(fur, 0.085, 0.075, 0.095, 0, 0, 0), ell(dark, 0.012, 0.01, 0.01, 0, -0.01, 0.094));
    for (const s of [-1, 1]) { head.add(ell(fur, 0.04, 0.04, 0.012, s * 0.065, 0.06, -0.01)); const lid = new THREE.Mesh(new THREE.TorusGeometry(0.018, 0.004, 4, 8, Math.PI), dark); lid.position.set(s * 0.04, 0.012, 0.082); lid.rotation.z = Math.PI; head.add(lid); }      // ears, and eyes shut
    g.userData = { head }; return g;
  }

  // the Hatter's hat: wider at the top than the band, with the price ticket stuck in it
  function topHat() {
    const g = new THREE.Group(), felt = lam({ color: '#e9e6dd' });
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.165, 0.118, 0.27, 22), felt); crown.position.y = 0.15; crown.castShadow = true; g.add(crown);
    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.016, 24), felt); brim.position.y = 0.012; brim.castShadow = true; g.add(brim);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.123, 0.12, 0.05, 22), dark); band.position.y = 0.045; g.add(band);
    const tk = new THREE.Mesh(new THREE.PlaneGeometry(0.15, 0.17), new THREE.MeshLambertMaterial({ side: THREE.DoubleSide, map: canvasTex(192, 216, (c, w, h) => { c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1c1a18'; c.lineWidth = 6; c.strokeRect(3, 3, w - 6, h - 6); c.fillStyle = '#1c1a18'; c.textAlign = 'center'; c.font = 'italic 40px Georgia'; c.fillText('In this', w / 2, 54); c.fillText('Style', w / 2, 98); c.font = 'bold 64px Georgia'; c.fillText('10/6', w / 2, 176); }) }));
    tk.position.set(-0.148, 0.2, 0.02); tk.rotation.set(0, -Math.PI / 2 + 0.25, 0.14); g.add(tk); return g;
  }

  // The Cheshire Cat lies along a bough (the bough runs along x; the head is at -x and looks out along +z). vanish(k): 0 all there, 1 only the grin, beyond 1.15 nothing.
  function cat() {
    const g = new THREE.Group();
    const stripe = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#cfcbc2'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1c1a18'; for (let y = 10; y < h; y += 26) { c.lineWidth = 7 + (y % 3) * 2; c.beginPath(); for (let x = 0; x <= w; x += 16) c.lineTo(x, y + Math.sin(x * 0.08 + y) * 5); c.stroke(); } }, true);
    const fur = () => lam({ map: stripe, transparent: true });
    const bodyG = new THREE.SphereGeometry(1, 22, 16); bodyG.rotateZ(Math.PI / 2);                         // the stripes ring the body
    const body = new THREE.Mesh(bodyG, fur()); body.scale.set(0.46, 0.25, 0.27); body.position.set(0.12, 0.2, 0); body.castShadow = true;
    const faceT = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#d9d6cd'; c.fillRect(0, 0, w, h); const X = w / 2, Y = h / 2; c.strokeStyle = c.fillStyle = '#1c1a18'; c.lineWidth = 5;
      for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(X + i * 14, 8); c.lineTo(X + i * 9, 46 - Math.abs(i) * 6); c.stroke(); }                       // the marks on the brow
      for (const s of [-1, 1]) { c.fillStyle = '#fbfaf5'; c.beginPath(); c.ellipse(X + s * 44, Y - 26, 24, 15, s * 0.25, 0, 7); c.fill(); c.stroke(); c.fillStyle = '#1c1a18'; c.beginPath(); c.ellipse(X + s * 42, Y - 25, 6, 13, 0, 0, 7); c.fill();
        for (let k = 0; k < 3; k++) { c.lineWidth = 2.5; c.beginPath(); c.moveTo(X + s * 40, Y + 22 + k * 4); c.lineTo(X + s * 125, Y + 2 + k * 16); c.stroke(); } c.lineWidth = 5; }      // eyes, whiskers
      c.beginPath(); c.moveTo(X - 9, Y - 2); c.lineTo(X + 9, Y - 2); c.lineTo(X, Y + 9); c.closePath(); c.fill(); }, false);
    const headG = new THREE.SphereGeometry(1, 24, 18); headG.rotateY(-Math.PI / 2);
    const head = new THREE.Mesh(headG, lam({ map: faceT, transparent: true })); head.scale.set(0.235, 0.2, 0.2); head.position.set(-0.36, 0.3, 0.1); head.castShadow = true;
    const ears = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.13, 4), fur()); e.position.set(-0.36 + s * 0.15, 0.49, 0.08); e.rotation.z = -s * 0.3; return e; });
    const paws = [-1, 1].map(s => ell(fur(), 0.075, 0.05, 0.11, -0.3 + s * 0.14, 0.06, 0.2));
    const tailC = new THREE.CatmullRomCurve3([new THREE.Vector3(0.52, 0.16, 0), new THREE.Vector3(0.66, 0.02, 0.04), new THREE.Vector3(0.7, -0.26, 0.08), new THREE.Vector3(0.62, -0.5, 0.06), new THREE.Vector3(0.66, -0.66, 0.02)]);
    const tails = [0, 1, 2, 3].map(i => { const sub = new THREE.CatmullRomCurve3(tailC.getPoints(24).slice(i * 6, i * 6 + 7)), t = new THREE.Mesh(new THREE.TubeGeometry(sub, 6, 0.05, 8), fur()); t.material.map = stripe; t.castShadow = true; return t; });
    // the grin by itself: a strip round the front of the head, cut out to the shape of the mouth
    const grinT = canvasTex(512, 128, (c, w, h) => { c.clearRect(0, 0, w, h); c.fillStyle = '#fbfaf5'; c.strokeStyle = '#1c1a18'; c.lineWidth = 7; c.beginPath(); c.moveTo(40, 30); c.quadraticCurveTo(w / 2, 150, w - 40, 30); c.quadraticCurveTo(w / 2, 86, 40, 30); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = 4; for (let i = 1; i < 12; i++) { const x = 40 + i * (w - 80) / 12, t = (x - 40) / (w - 80), y0 = 30 + 4 * t * (1 - t) * 56 * 0.52, y1 = 30 + 4 * t * (1 - t) * 60; c.beginPath(); c.moveTo(x, y0 + 2); c.lineTo(x, y1 - 2); c.stroke(); } });
    const grinG = new THREE.SphereGeometry(1, 24, 6, Math.PI * 0.5 - 1.0, 2.0, Math.PI * 0.5 + 0.12, 0.62); grinG.rotateY(-Math.PI / 2 + Math.PI * 0.5);
    const grin = new THREE.Mesh(grinG, new THREE.MeshLambertMaterial({ map: grinT, alphaTest: 0.5, side: THREE.DoubleSide })); grin.scale.set(0.24, 0.205, 0.206); grin.position.copy(head.position);
    g.add(body, head, grin, ...ears, ...paws, ...tails);
    const order = [...tails.slice().reverse().map(t => [t]), [body], paws, ears, [head]];                  // "beginning with the end of the tail, and ending with the grin"
    g.userData = { head, grin, vanish(k) { order.forEach((ms, i) => { const a = Math.max(0, Math.min(1, 1 - (k * order.length - i))); for (const m of ms) { m.visible = a > 0.02; m.material.opacity = a; m.castShadow = a > 0.5; } }); grin.visible = k < 1.15; } };
    return g;
  }
  return { rabbit, dormouse, topHat, cat, ell, rod, lam, white, pale, dark, mid };
}
