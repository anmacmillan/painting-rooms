/* Horses, cattle and sheep for the procession, built as continuous lofted anatomical skins with carved relief textures (mane locks, neck folds, fleece curls, muscle contours)
   so they read as one piece with the carved Pentelic marble frieze.
   Sources (research/FINDINGS.md):
     - Horses after the west and north frieze (esp. West block II, British Museum): compact, deep in the chest, round in the croup, thick and high-arched in the neck,
       the mane hogged (cropped and standing in carved transverse locks along the crest), the tail long and flowing from the croup, bronze bridle attachments at the bit and temple.
     - Cattle after South blocks XLV-XLVI (British Museum): heavy withers, deep pleated dewlap under the throat, broad brow, outward ears, curved horns, long tufted tail.
     - Sheep after North block IV (Acropolis Museum): compact fleece carved in relief curls, arched nose, drooping ears, slender limbs.
   Every beast faces +Z, stands on y = 0, and exposes u = g.userData = { kind, K, body, neck, head, tail, legs, mats, seatY, seatZ, neckA, ph }. */
export function makeBeasts({ THREE, scene }) {
  const V3 = THREE.Vector3, lam = o => new THREE.MeshLambertMaterial(o);
  const cTex = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; fn(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t; };

  /* Carved relief textures: smooth dressed marble with subtle anatomical shading for horses and cattle; carved fleece curls for sheep; striated locks for manes */
  const horseTex = cTex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, '#cfc4b0'); gr.addColorStop(0.28, '#e8dfd0'); gr.addColorStop(0.5, '#f2ead8'); gr.addColorStop(0.75, '#dfd4c0'); gr.addColorStop(1, '#c8bca6');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    /* Subtle shoulder and haunch muscular relief depression (no rings or stripes) */
    for (const [cx, cy, rx, ry] of [[w * 0.25, h * 0.72, 34, 48], [w * 0.75, h * 0.72, 34, 48], [w * 0.25, h * 0.28, 38, 52], [w * 0.75, h * 0.28, 38, 52]]) {
      const rg = g.createRadialGradient(cx, cy, 4, cx, cy, ry);
      rg.addColorStop(0, 'rgba(80, 62, 45, 0.22)'); rg.addColorStop(0.6, 'rgba(250, 244, 232, 0.16)'); rg.addColorStop(1, 'rgba(230, 220, 204, 0)');
      g.fillStyle = rg; g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, 7); g.fill();
    }
  });
  const oxTex = cTex(256, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    gr.addColorStop(0, '#d4cab6'); gr.addColorStop(0.3, '#ece3d2'); gr.addColorStop(0.5, '#f5eee0'); gr.addColorStop(0.75, '#e2d8c6'); gr.addColorStop(1, '#cec2ae');
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    /* Soft vertical dewlap and neck skin creases near the front end only (y > h * 0.72) */
    for (let y = int(h * 0.74); y < h - 8; y += 14) {
      g.strokeStyle = 'rgba(85, 68, 50, 0.24)'; g.lineWidth = 3.5;
      g.beginPath(); g.moveTo(20, y); g.quadraticCurveTo(w * 0.5, y + 6, w - 20, y); g.stroke();
      g.strokeStyle = 'rgba(252, 246, 236, 0.32)'; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(20, y + 4); g.quadraticCurveTo(w * 0.5, y + 10, w - 20, y + 4); g.stroke();
    }
    function int(v) { return Math.floor(v); }
  });
  const woolTex = cTex(256, 256, (g, w, h) => {
    g.fillStyle = '#ded4be'; g.fillRect(0, 0, w, h);
    /* Chiselled classical fleece locks: rows of carved crescent/spiral tufts with undercut shadow and lit marble crest */
    for (let r = 0; r < 10; r++) {
      const y = r * 26 + 12, off = (r % 2) * 13;
      for (let x = -12; x < w + 12; x += 26) {
        const cx = x + off;
        g.fillStyle = 'rgba(72, 58, 44, 0.45)'; g.beginPath(); g.arc(cx, y + 3, 10, 0, 7); g.fill();
        g.fillStyle = '#dfd5c0'; g.beginPath(); g.arc(cx, y, 9, 0, 7); g.fill();
        g.strokeStyle = 'rgba(252, 246, 236, 0.65)'; g.lineWidth = 2.5; g.beginPath(); g.arc(cx - 1, y - 1, 6, 3.3, 6.1); g.stroke();
      }
    }
  });
  const maneTex = cTex(128, 128, (g, w, h) => {
    g.fillStyle = '#b8ac98'; g.fillRect(0, 0, w, h);
    for (let y = 4; y < h; y += 9) {
      g.fillStyle = 'rgba(40, 30, 22, 0.55)'; g.fillRect(0, y, w, 4);
      g.fillStyle = 'rgba(248, 242, 230, 0.55)'; g.fillRect(0, y + 4, w, 3);
    }
  });

  /* Merge static child meshes sharing the same material inside a bone group (cuts beast draw calls by ~3x with zero visual change) */
  function packGroup(grp) {
    const byMat = new Map(), kill = [];
    for (const ch of grp.children) {
      if (!ch.isMesh) continue;
      let arr = byMat.get(ch.material);
      if (!arr) byMat.set(ch.material, arr = []);
      arr.push(ch); kill.push(ch);
    }
    for (const [mat, list] of byMat) {
      if (list.length <= 1) continue;
      const pos = [], nor = [], uv = [], v = new V3(), n = new V3(), nm = new THREE.Matrix3();
      for (const m of list) {
        m.updateMatrix(); nm.getNormalMatrix(m.matrix);
        const g = m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
        const p = g.attributes.position, nr = g.attributes.normal, u = g.attributes.uv;
        for (let i = 0; i < p.count; i++) {
          v.set(p.getX(i), p.getY(i), p.getZ(i)).applyMatrix4(m.matrix); pos.push(v.x, v.y, v.z);
          n.set(nr.getX(i), nr.getY(i), nr.getZ(i)).applyMatrix3(nm).normalize(); nor.push(n.x, n.y, n.z);
          uv.push(u ? u.getX(i) : 0, u ? u.getY(i) : 0);
        }
        grp.remove(m); m.geometry.dispose();
      }
      const mg = new THREE.BufferGeometry();
      mg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      mg.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      mg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      grp.add(new THREE.Mesh(mg, mat));
    }
  }

  /* Loft a smooth skin over elliptical cross-section rings along a 3D spine path:
     pts: array of [x, y, z, rx, ry] where rx is half-width and ry is half-height along 'up'. */
  function skin(pts, mat, o = {}) {
    const n = o.n || 16, up = new V3(...(o.up || [0, 1, 0])), P = pts.map(p => new V3(p[0], p[1], p[2])), M = P.length;
    const pos = [], uv = [], idx = [];
    for (let i = 0; i < M; i++) {
      const t = new V3().subVectors(P[Math.min(i + 1, M - 1)], P[Math.max(i - 1, 0)]).normalize();
      let b = up.clone().addScaledVector(t, -up.dot(t));
      if (b.lengthSq() < 1e-4) b.set(0, 0, 1).addScaledVector(t, -t.z);
      b.normalize();
      const a = new V3().crossVectors(b, t).normalize(), rx = pts[i][3], ry = pts[i][4] ?? rx;
      for (let j = 0; j <= n; j++) {
        const th = (j / n) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
        pos.push(P[i].x + a.x * rx * c + b.x * ry * s, P[i].y + a.y * rx * c + b.y * ry * s, P[i].z + a.z * rx * c + b.z * ry * s);
        uv.push(j / n, i / (M - 1));
      }
    }
    for (let i = 0; i < M - 1; i++) for (let j = 0; j < n; j++) {
      const A = i * (n + 1) + j, B = A + 1, C = A + n + 1, D = C + 1;
      idx.push(A, B, C, B, D, C);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return new THREE.Mesh(g, mat);
  }

  const KIND = {
    horse: { len: 1.38, h: 1.36, up: 0.45, low: 0.48, neck: 0.72, neckA: -0.58, coat: '#9a683e', mane: '#38261a', hoof: '#2c241e', pale: '#d49b38' },
    ox:    { len: 1.76, h: 1.32, up: 0.40, low: 0.42, neck: 0.54, neckA: -0.95, coat: '#e8dfd0', mane: '#c4b498', hoof: '#382e26', pale: '#f2ead8', horns: true },
    sheep: { len: 0.86, h: 0.72, up: 0.22, low: 0.22, neck: 0.26, neckA: -0.68, coat: '#e4dac4', mane: '#c8bca4', hoof: '#342c24', pale: '#c8b89a', wool: true }
  };

  function make(kind, o = {}) {
    const K = { ...KIND[kind], ...o }, g = new THREE.Group(), body = new THREE.Group(), hipY = K.up + K.low + 0.03;
    const tBody = kind === 'sheep' ? woolTex : kind === 'ox' ? oxTex : horseTex;
    const mats = {
      coat: lam({ map: tBody, color: K.coat }),
      mane: lam({ map: maneTex, color: K.mane }),
      hoof: lam({ color: K.hoof }),
      pale: lam({ color: K.pale })
    };
    /* The body pivots about the hind hips at z = -K.len / 2 so rearing lifts the forequarters naturally */
    body.position.set(0, hipY, -K.len / 2);
    g.add(body);
    const by = K.h - hipY - 0.16, L = K.len;

    /* 1. Continuous sculpted torso: croup -> hindquarters -> flank -> deep ribcage -> muscular chest/pectorals */
    if (kind === 'horse') {
      body.add(skin([
        [0, by + 0.04, -0.10, 0.03, 0.03],
        [0, by + 0.05, -0.02, 0.19, 0.21],
        [0, by + 0.06, L * 0.16, 0.27, 0.30], /* rounded croup & haunch */
        [0, by + 0.03, L * 0.38, 0.25, 0.28], /* loin / waist */
        [0, by + 0.02, L * 0.64, 0.29, 0.33], /* deep ribcage */
        [0, by + 0.05, L * 0.86, 0.27, 0.32], /* muscular shoulder & withers */
        [0, by + 0.02, L * 1.01, 0.19, 0.22], /* breast */
        [0, by + 0.02, L * 1.06, 0.03, 0.03]
      ], mats.coat, { n: 18 }));
    } else if (kind === 'ox') {
      /* Classical Greek sacrificial heifer/bull (South frieze XLV-XLVI): laterally compressed deep torso,
         angular pelvic croup, tucked flank, sweeping deep ribcage & low brisket, and high muscular withers (NEVER a round barrel!) */
      body.add(skin([
        [0, by + 0.12, -0.06, 0.03, 0.04],
        [0, by + 0.12,  0.02, 0.18, 0.21], /* pin-bones / tailhead */
        [0, by + 0.09,  L * 0.16, 0.26, 0.33], /* angular hip & sculpted rump */
        [0, by + 0.08,  L * 0.34, 0.25, 0.29], /* tucked flank & waist */
        [0, by + 0.02,  L * 0.56, 0.28, 0.37], /* deep sweeping belly & ribcage */
        [0, by + 0.05,  L * 0.78, 0.26, 0.42], /* high muscular shoulder & withers */
        [0, by + 0.00,  L * 0.94, 0.22, 0.34], /* deep brisket / chest */
        [0, by - 0.02,  L * 1.03, 0.13, 0.21], /* front of brisket */
        [0, by - 0.02,  L * 1.07, 0.03, 0.04]
      ], mats.coat, { n: 18 }));
      /* Sculpted dorsal withers ridge & shoulder-blade relief masses + sculpted haunch cheeks */
      body.add(skin([
        [0, by + 0.30, L * 0.10, 0.12, 0.08],
        [0, by + 0.32, L * 0.32, 0.11, 0.07],
        [0, by + 0.36, L * 0.58, 0.13, 0.09],
        [0, by + 0.44, L * 0.78, 0.13, 0.11], /* prominent withers hump */
        [0, by + 0.38, L * 0.92, 0.11, 0.09]
      ], mats.coat, { n: 12 }));
      for (const e of [-1, 1]) {
        /* Muscular shoulder blade blending down into the foreleg */
        body.add(skin([
          [e * 0.15, by + 0.32, L * 0.76, 0.09, 0.12],
          [e * 0.18, by + 0.08, L * 0.80, 0.11, 0.16],
          [e * 0.16, by - 0.14, L * 0.83, 0.09, 0.12]
        ], mats.coat, { up: [0, 0, 1], n: 10 }));
        /* Muscular pelvic haunch blending into the hind thigh */
        body.add(skin([
          [e * 0.15, by + 0.22, L * 0.18, 0.10, 0.14],
          [e * 0.18, by + 0.00, L * 0.18, 0.12, 0.18],
          [e * 0.16, by - 0.18, L * 0.20, 0.09, 0.14]
        ], mats.coat, { up: [0, 0, 1], n: 10 }));
      }
    } else {
      /* Sheep: sculpted fleecy body with distinct brisket, tucked flank, and rounded rump */
      body.add(skin([
        [0, by + 0.04, -0.04, 0.03, 0.03],
        [0, by + 0.05,  0.04, 0.15, 0.17],
        [0, by + 0.06,  L * 0.24, 0.20, 0.24], /* fleecy haunch */
        [0, by + 0.05,  L * 0.48, 0.21, 0.23], /* waist / flank */
        [0, by + 0.03,  L * 0.74, 0.21, 0.26], /* deep woolly chest */
        [0, by + 0.05,  L * 0.92, 0.16, 0.21], /* shoulder */
        [0, by + 0.03,  L * 1.02, 0.09, 0.12],
        [0, by + 0.03,  L * 1.05, 0.03, 0.03]
      ], mats.coat, { n: 16 }));
    }

    /* 2. Sculpted neck and crest (in neck local space: +Y is UP, +Z is FORWARD, -Z is BACKWARD toward the croup) */
    const neck = new THREE.Group();
    neck.position.set(0, by + (kind === 'sheep' ? 0.11 : kind === 'ox' ? 0.14 : 0.18), L * (kind === 'ox' ? 0.86 : 0.88));
    body.add(neck);
    const head = new THREE.Group();
    if (kind === 'horse') {
      /* High-arched classical Parthenon neck curving up and forward to the poll */
      neck.add(skin([
        [0, -0.06, -0.04, 0.17, 0.22],
        [0, 0.10, 0.04, 0.15, 0.23],
        [0, 0.28, 0.14, 0.13, 0.21],
        [0, 0.45, 0.22, 0.11, 0.18],
        [0, 0.58, 0.27, 0.095, 0.14],
        [0, 0.64, 0.29, 0.04, 0.05]
      ], mats.coat, { up: [0, 0, 1], n: 16 }));
      /* Hogged standing Parthenon mane along the arched dorsal crest (-z side of the neck) */
      neck.add(skin([
        [0, 0.02, -0.18, 0.022, 0.04],
        [0, 0.16, -0.10, 0.028, 0.07],
        [0, 0.34, 0.00, 0.028, 0.075],
        [0, 0.50, 0.10, 0.026, 0.07],
        [0, 0.63, 0.20, 0.024, 0.06],
        [0, 0.68, 0.28, 0.020, 0.045]
      ], mats.mane, { up: [0, 0, 1], n: 12 }));
      head.position.set(0, 0.58, 0.30);
    } else if (kind === 'ox') {
      /* Strong bovine neck carried forward from the high withers, with a deep sweeping dewlap from chin down to brisket */
      neck.add(skin([
        [0,  0.02, -0.06, 0.21, 0.29],
        [0,  0.10,  0.10, 0.18, 0.26],
        [0,  0.18,  0.28, 0.15, 0.22],
        [0,  0.24,  0.44, 0.13, 0.18],
        [0,  0.27,  0.50, 0.05, 0.06]
      ], mats.coat, { up: [0, 1, 0], n: 16 }));
      /* Deep hanging dewlap curving cleanly from the brisket up to the throat */
      neck.add(skin([
        [0, -0.30,  0.02, 0.055, 0.14],
        [0, -0.22,  0.18, 0.048, 0.17],
        [0, -0.08,  0.34, 0.042, 0.15],
        [0,  0.06,  0.46, 0.032, 0.10],
        [0,  0.14,  0.52, 0.018, 0.05]
      ], mats.coat, { up: [0, 1, 0], n: 12 }));
      head.position.set(0, 0.25, 0.49);
    } else {
      /* Sheep fleecy neck carried forward */
      neck.add(skin([
        [0, -0.02, -0.02, 0.13, 0.15],
        [0,  0.09,  0.09, 0.12, 0.14],
        [0,  0.19,  0.18, 0.095, 0.11],
        [0,  0.23,  0.21, 0.04, 0.04]
      ], mats.coat, { up: [0, 0, 1], n: 14 }));
      head.position.set(0, 0.21, 0.20);
    }
    neck.add(head);

    /* 3. Sculpted head in head local space (at rest head.rotation.x = 0: forehead/poll at (0,0,0), nose/muzzle pointing forward +Z and down -Y!) */
    if (kind === 'horse') {
      /* Poll -> broad forehead & jowl -> straight classical nasal bridge -> tapered muzzle & chin */
      head.add(skin([
        [0, 0.06, -0.06, 0.03, 0.03],
        [0, 0.03, 0.00, 0.095, 0.115], /* poll & cranium */
        [0, -0.03, 0.10, 0.102, 0.130], /* broad cheek / ganache */
        [0, -0.10, 0.21, 0.070, 0.092], /* mid nasal bridge */
        [0, -0.17, 0.32, 0.056, 0.070], /* nostrils */
        [0, -0.22, 0.40, 0.044, 0.052], /* tapered muzzle & lips */
        [0, -0.24, 0.43, 0.018, 0.020]
      ], mats.coat, { up: [0, 1, 0], n: 16 }));
      for (const e of [-1, 1]) {
        /* Pointed alert ears at the poll */
        const ear = skin([
          [0, 0, 0, 0.022, 0.016],
          [0, 0.07, 0.01, 0.024, 0.015],
          [0, 0.13, 0.02, 0.013, 0.009],
          [0, 0.16, 0.025, 0.004, 0.004]
        ], mats.coat, { up: [0, 0, 1], n: 10 });
        ear.position.set(e * 0.065, 0.06, -0.01);
        ear.rotation.set(0.22, 0, -e * 0.20);
        head.add(ear);
        /* Sculpted brow and dark eye */
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 10, 8), mats.hoof);
        eye.position.set(e * 0.088, -0.01, 0.12);
        head.add(eye);
        /* Flared nostril hollow */
        const nos = new THREE.Mesh(new THREE.SphereGeometry(0.016, 8, 6), mats.hoof);
        nos.position.set(e * 0.040, -0.18, 0.36);
        head.add(nos);
        /* Bronze bridle bit ring (attested by drill holes on West II) */
        const bit = new THREE.Mesh(new THREE.TorusGeometry(0.022, 0.005, 6, 12), mats.pale);
        bit.position.set(e * 0.048, -0.21, 0.33);
        bit.rotation.y = Math.PI / 2;
        head.add(bit);
      }
    } else if (kind === 'ox') {
      /* Bovine head: broad forehead -> heavy orbital arches -> strong muzzle */
      head.add(skin([
        [0, 0.06, -0.05, 0.05, 0.05],
        [0, 0.03, 0.02, 0.145, 0.145],
        [0, -0.03, 0.14, 0.135, 0.135],
        [0, -0.10, 0.28, 0.105, 0.100],
        [0, -0.15, 0.38, 0.095, 0.082],
        [0, -0.17, 0.41, 0.04, 0.03]
      ], mats.coat, { up: [0, 1, 0], n: 16 }));
      for (const e of [-1, 1]) {
        /* Curved crescent horns rising outward and forward from the poll */
        head.add(skin([
          [e * 0.11, 0.05, 0.00, 0.038, 0.038],
          [e * 0.22, 0.10, 0.04, 0.030, 0.030],
          [e * 0.28, 0.18, 0.12, 0.020, 0.020],
          [e * 0.25, 0.26, 0.18, 0.007, 0.007]
        ], mats.pale, { up: [0, 1, 0], n: 10 }));
        /* Broad outward bovine ears below the horns */
        const ear = skin([
          [0, 0, 0, 0.025, 0.016],
          [e * 0.08, -0.01, -0.01, 0.034, 0.016],
          [e * 0.14, -0.02, -0.01, 0.016, 0.008]
        ], mats.coat, { up: [0, 1, 0], n: 10 });
        ear.position.set(e * 0.11, 0.00, 0.01);
        head.add(ear);
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 8), mats.hoof);
        eye.position.set(e * 0.125, -0.02, 0.14);
        head.add(eye);
      }
    } else {
      /* Sheep head with Roman nose, wool poll, drooping ears and curved ram horns */
      head.add(skin([
        [0, 0.03, -0.03, 0.03, 0.03],
        [0, 0.02, 0.02, 0.082, 0.085],
        [0, -0.02, 0.10, 0.072, 0.075],
        [0, -0.07, 0.18, 0.052, 0.054],
        [0, -0.10, 0.23, 0.038, 0.038]
      ], mats.mane, { up: [0, 1, 0], n: 14 }));
      for (const e of [-1, 1]) {
        /* Curved ram horns curling back and round the ear */
        head.add(skin([
          [e * 0.06, 0.04, 0.01, 0.024, 0.024],
          [e * 0.12, 0.05, -0.03, 0.020, 0.020],
          [e * 0.14, -0.01, -0.06, 0.015, 0.015],
          [e * 0.12, -0.06, -0.01, 0.008, 0.008]
        ], mats.pale, { up: [0, 1, 0], n: 8 }));
        const eye = new THREE.Mesh(new THREE.SphereGeometry(0.018, 8, 6), mats.hoof);
        eye.position.set(e * 0.068, -0.01, 0.09);
        head.add(eye);
      }
    }

    /* 4. Sculpted tail hanging and flowing BACKWARD (-Z) from the croup (never forward under the belly!) */
    const tail = new THREE.Group();
    tail.position.set(0, by + (kind === 'sheep' ? 0.08 : 0.16), -0.02);
    body.add(tail);
    if (kind === 'horse') {
      tail.add(skin([
        [0, 0.00, 0.00, 0.050, 0.050],
        [0, -0.10, -0.12, 0.068, 0.068],
        [0, -0.30, -0.22, 0.075, 0.070],
        [0, -0.54, -0.28, 0.068, 0.062],
        [0, -0.76, -0.34, 0.046, 0.042],
        [0, -0.90, -0.38, 0.016, 0.016]
      ], mats.mane, { up: [1, 0, 0], n: 12 }));
    } else if (kind === 'ox') {
      tail.add(skin([
        [0, 0.00, 0.00, 0.034, 0.034],
        [0, -0.24, -0.06, 0.026, 0.026],
        [0, -0.52, -0.09, 0.022, 0.022],
        [0, -0.72, -0.11, 0.044, 0.044],
        [0, -0.86, -0.13, 0.014, 0.014]
      ], mats.coat, { up: [1, 0, 0], n: 10 }));
    } else {
      tail.add(skin([
        [0, 0.00, 0.00, 0.040, 0.040],
        [0, -0.10, -0.05, 0.036, 0.036],
        [0, -0.20, -0.07, 0.020, 0.020]
      ], mats.coat, { up: [1, 0, 0], n: 10 }));
    }

    /* 5. Four articulated anatomical limbs:
       Forelegs (0, 1) attach to body at (latX, 0, L * 0.82); hind legs (2, 3) attach to g at (latX, hipY, -L / 2 + L * 0.20) under the haunch.
       Because body is at y = hipY = K.up + K.low + 0.03, both fore and hind hips sit at world y = hipY and their hooves rest cleanly on y = 0. */
    const legs = [];
    const rScale = kind === 'sheep' ? 0.56 : kind === 'ox' ? 1.12 : 1.0;
    for (const [fz, to] of [[L * 0.82, body], [L * 0.82, body], [L * 0.20, g], [L * 0.20, g]]) {
      const idx = legs.length, e = idx % 2 ? -1 : 1, hind = to === g;
      const hip = new THREE.Group(), knee = new THREE.Group();
      const latX = e * (kind === 'ox' ? 0.16 : kind === 'sheep' ? 0.10 : 0.13);
      hip.position.set(latX, hind ? hipY : 0, hind ? -L / 2 + fz : fz);
      to.add(hip);
      knee.position.y = -K.up;
      hip.add(knee);

      /* Upper segment: muscular thigh -> forward stifle -> backward-projecting hock (hind), or shoulder -> elbow -> forearm -> knee (fore) */
      if (hind) {
        const hockBack = kind === 'ox' ? -0.11 : kind === 'sheep' ? -0.07 : -0.06;
        hip.add(skin([
          [0, 0.24,  0.02, 0.100 * rScale, 0.155 * rScale],
          [0, 0.06,  0.05, 0.090 * rScale, 0.135 * rScale], /* forward stifle */
          [0, -K.up * 0.50, hockBack * 0.45, 0.068 * rScale, 0.095 * rScale], /* muscular gaskin */
          [0, -K.up, hockBack, 0.048 * rScale, 0.066 * rScale], /* pronounced backward-angled hock joint */
          [0, -K.up - 0.02, hockBack, 0.036 * rScale, 0.045 * rScale]
        ], mats.coat, { up: [0, 0, 1], n: 12 }));
      } else {
        const elbowBack = kind === 'ox' ? -0.05 : -0.03;
        hip.add(skin([
          [0, 0.24, -0.02, 0.092 * rScale, 0.125 * rScale],
          [0, 0.04, elbowBack, 0.078 * rScale, 0.105 * rScale], /* elbow */
          [0, -K.up * 0.52, 0.01, 0.056 * rScale, 0.070 * rScale], /* forearm */
          [0, -K.up, 0.02, 0.046 * rScale, 0.054 * rScale], /* prominent carpal knee joint */
          [0, -K.up - 0.02, 0.02, 0.035 * rScale, 0.042 * rScale]
        ], mats.coat, { up: [0, 0, 1], n: 12 }));
      }

      /* Lower segment: cannon bone -> fetlock -> forward-angled pastern -> sculpted hoof */
      const zTop = hind ? (kind === 'ox' ? -0.11 : kind === 'sheep' ? -0.07 : -0.06) : 0.02;
      const zFet = hind ? zTop * 0.35 : -0.01;
      knee.add(skin([
        [0, 0.02, zTop, 0.046 * rScale, 0.054 * rScale],
        [0, -K.low * 0.45, (zTop + zFet) * 0.5, 0.035 * rScale, 0.042 * rScale],
        [0, -K.low * 0.76, zFet, 0.040 * rScale, 0.046 * rScale], /* fetlock joint */
        [0, -K.low * 0.88, zFet + 0.035, 0.034 * rScale, 0.038 * rScale]  /* forward-sloping pastern */
      ], mats.coat, { up: [0, 0, 1], n: 12 }));
      knee.add(skin([
        [0, -K.low * 0.86, zFet + 0.035, 0.040 * rScale, 0.042 * rScale],
        [0, -K.low * 0.99, zFet + 0.055, 0.054 * rScale, 0.058 * rScale],
        [0, -K.low * 1.01, zFet + 0.055, 0.015 * rScale, 0.015 * rScale]
      ], mats.hoof, { up: [0, 0, 1], n: 12 }));

      legs.push({ hip, knee, hind });
    }

    for (const grp of [body, neck, head, tail]) packGroup(grp);
    g.userData = {
      kind, K, body, neck, head, tail, legs, mats,
      seatY: by + 0.14,
      seatZ: L * 0.48,
      neckA: 0,
      ph: Math.random() * 6
    };
    scene.add(g);
    return g;
  }

  /* ph: stride phase; pace: 0 standing, ~1 walking, 2+ cantering; rear: 0..1 rearing on hind legs with forelegs gathered asymmetrically as on the frieze; toss: head toss */
  function pose(g, ph, pace, rear = 0, toss = 0) {
    const u = g.userData, k = Math.min(1, pace), gal = Math.min(1, Math.max(0, pace - 1.2)), s = Math.sin(ph), amp = 0.40 * k + 0.24 * gal;
    const pitch = -rear * 0.54 - gal * 0.10 * Math.sin(ph + 0.6);
    u.body.rotation.x = pitch;
    u.body.position.y = u.K.up + u.K.low + 0.03 + Math.abs(Math.cos(ph)) * 0.03 * k + gal * 0.06 * Math.sin(ph + 1.2);
    u.legs.forEach((L, i) => {
      const off = gal > 0.5 ? (L.hind ? 0.5 + (i % 2) * 0.35 : Math.PI + (i % 2) * 0.35) : (i === 0 || i === 3 ? 0 : Math.PI);
      const a = Math.sin(ph + off), lift = Math.max(0, Math.cos(ph + off));
      if (L.hind) {
        /* Hind legs flex at the hip and hock to bear the rearing horse */
        L.hip.rotation.x = -a * amp * 0.75 + rear * (0.12 + (i % 2 ? 0.14 : -0.08));
        L.knee.rotation.x = -lift * (0.45 * k + 0.45 * gal) - rear * (0.22 + (i % 2 ? 0.12 : 0.0));
      } else {
        /* Forelegs gather asymmetrically when rearing (one foreleg extended higher and further forward, the other bent tighter at the knee, as on West block II) */
        const asym = i === 0 ? 1.18 : 0.78;
        const kneeAsym = i === 0 ? 0.85 : 1.35;
        L.hip.rotation.x = -a * amp - rear * (0.95 * asym) - pitch * 0.85;
        L.knee.rotation.x = lift * (0.58 * k + 0.58 * gal) + rear * (1.12 * kneeAsym);
      }
    });
    /* When rearing (pitch < 0), arch the neck forward (+X rotation) and tuck the head chin-down on the bit (+X rotation), unless tossing the head (-X rotation) */
    u.neck.rotation.x = 0.07 * s * k + rear * 0.34 - toss * 0.28;
    u.head.rotation.x = rear * 0.42 - toss * 0.36 + 0.05 * Math.cos(ph) * k;
    u.tail.rotation.x = 0.18 * gal + rear * 0.32 + 0.10 * Math.sin(ph * 0.7);
    u.tail.rotation.z = 0.12 * Math.sin(ph * 0.5);
  }
  return { make, pose };
}
