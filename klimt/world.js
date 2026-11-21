/* The Klimt Ride World: a 1,040 m sweeping, banked golden ribbon through four acts:
   1. Tree of Life (Stoclet spirals) -> 2. Adele's Hall of Eyes ->
   3. The Dark Ground & Two Patterns -> 4. The Flowered Cliff & The Kiss. */

export const TRACK_LEN = 1040;
export const HALF_W = 8.4;

export function makeTrack() {
  /* Sweeping S-curves and gentle downhill glides — feels like skiing down living gold */
  function sample(s) {
    const t = Math.max(0, Math.min(1, s / TRACK_LEN));
    const x = Math.sin(s * 0.0115) * 24 + Math.sin(s * 0.0048 + 0.7) * 18;
    /* Smooth downhill descent (~38 m total drop) with gentle undulating waves, flattening on the cliff */
    const cliffFlat = t > 0.86 ? (t - 0.86) / 0.14 : 0;
    const y = (1 - t) * 38 + Math.sin(s * 0.022) * 1.45 * (1 - cliffFlat * 0.85);
    const z = -s;
    return { x, y, z };
  }

  function frame(s) {
    const eps = 0.6;
    const p = sample(s);
    const p1 = sample(Math.min(TRACK_LEN, s + eps));
    const p0 = sample(Math.max(0, s - eps));
    const tx = p1.x - p0.x, ty = p1.y - p0.y, tz = p1.z - p0.z;
    const tl = Math.hypot(tx, ty, tz) || 1;
    const fx = tx / tl, fy = ty / tl, fz = tz / tl;
    /* horizontal right vector (cross forward x up) */
    const rx0 = -fz, rz0 = fx;
    const rl = Math.hypot(rx0, rz0) || 1;
    const rx = rx0 / rl, rz = rz0 / rl;
    /* curvature for gentle ski-like banking into curves */
    const c2 = (sample(Math.min(TRACK_LEN, s + 6)).x - 2 * p.x + sample(Math.max(0, s - 6)).x) / 36;
    const bank = Math.max(-0.22, Math.min(0.22, -c2 * 14));
    const ry = Math.sin(bank);
    const rc = Math.cos(bank);
    /* surface normal */
    const ux = -rx * ry, uy = rc, uz = -rz * ry;
    return {
      x: p.x, y: p.y, z: p.z,
      fx, fy, fz,
      rx: rx * rc, ry, rz: rz * rc,
      ux, uy, uz,
      bank,
      yaw: Math.atan2(fx, -fz),
      at(u, h = 0) {
        return {
          x: p.x + rx * rc * u + ux * h,
          y: p.y + ry * u + uy * h,
          z: p.z + rz * rc * u + uz * h,
        };
      },
    };
  }
  return { sample, frame, len: TRACK_LEN, halfW: HALF_W };
}

/* Naturally painted Klimt face texture — soft warm oil skin, flushed cheeks,
   dark expressive brows and vivid lips contrasting against flat gold ornament */
function makeFaceTex(THREE, isMan) {
  const c = document.createElement('canvas'); c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = isMan ? '#ddb796' : '#f2d9c4';
  g.fillRect(0, 0, 256, 256);
  const gr = g.createRadialGradient(128, 126, 18, 128, 126, 118);
  gr.addColorStop(0, isMan ? '#e8c4a2' : '#fae4d2');
  gr.addColorStop(1, isMan ? '#b88e6d' : '#d6b29a');
  g.fillStyle = gr;
  g.fillRect(0, 0, 256, 256);
  /* rosy Klimt cheeks */
  g.fillStyle = isMan ? 'rgba(180,96,74,0.22)' : 'rgba(220,104,96,0.34)';
  g.beginPath(); g.arc(88, 142, 24, 0, Math.PI * 2); g.arc(168, 142, 24, 0, Math.PI * 2); g.fill();
  /* closed/serene eyes & delicate brows */
  g.strokeStyle = '#3a2418'; g.lineWidth = 4; g.lineCap = 'round';
  g.beginPath(); g.arc(92, 118, 15, 0.15, Math.PI - 0.15); g.stroke();
  g.beginPath(); g.arc(164, 118, 15, 0.15, Math.PI - 0.15); g.stroke();
  g.lineWidth = 3;
  g.beginPath(); g.moveTo(74, 102); g.quadraticCurveTo(92, 94, 110, 102); g.stroke();
  g.beginPath(); g.moveTo(146, 102); g.quadraticCurveTo(164, 94, 182, 102); g.stroke();
  /* vivid vermilion lips (Adele / Kiss) */
  g.fillStyle = isMan ? '#a85a4a' : '#d14338';
  g.beginPath(); g.ellipse(128, 168, isMan ? 15 : 17, 7, 0, 0, Math.PI * 2); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* Stylized Klimt figure: naturally painted face & hands emerging from a tall,
   sweeping ornamental robe whose canvas texture updates live as patterns gather. */
export function makeKlimtFigure(THREE, { isMan, robeTex, goldTex }) {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const skinCol = isMan ? '#deb896' : '#f4dac6';
  const skinMat = new THREE.MeshLambertMaterial({ color: skinCol });
  const faceMat = new THREE.MeshLambertMaterial({ map: makeFaceTex(THREE, isMan) });
  const robeMat = new THREE.MeshBasicMaterial({ map: robeTex });
  const mantleMat = new THREE.MeshBasicMaterial({ map: goldTex, side: THREE.DoubleSide });

  /* Sweeping ornamental cloak / gown (tall flat-lit Klimt silhouette — fully visible from behind!) */
  const cloakH = isMan ? 2.10 : 1.84;
  const cloakG = new THREE.CylinderGeometry(isMan ? 0.34 : 0.24, isMan ? 0.56 : 0.78, cloakH, 18, 1, false);
  const cloak = new THREE.Mesh(cloakG, robeMat);
  cloak.position.y = cloakH * 0.5 + 0.08;
  body.add(cloak);

  /* Delicate gilded collar & hem trim (no stiff plank cape hiding her patterns!) */
  const cape = null;
  if (!isMan) {
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.038, 8, 20), mantleMat);
    collar.rotation.x = Math.PI / 2;
    collar.position.y = cloakH + 0.05;
    body.add(collar);
    const hem = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.04, 8, 24), mantleMat);
    hem.rotation.x = Math.PI / 2;
    hem.position.y = 0.10;
    body.add(hem);
  }

  /* Naturally painted neck, shoulders, head & hands — the true Klimt flesh contrast */
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.22, 12), skinMat);
  neck.position.y = cloakH + 0.14;
  body.add(neck);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), faceMat);
  head.position.y = cloakH + 0.36;
  head.rotation.y = Math.PI;
  body.add(head);

  /* Hair & floral / ivy wreath from The Kiss */
  const hairCol = isMan ? '#231b14' : '#964222';
  const hair = new THREE.Mesh(new THREE.SphereGeometry(0.258, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.62), new THREE.MeshLambertMaterial({ color: hairCol }));
  hair.position.set(0, cloakH + 0.39, 0.03);
  body.add(hair);

  const crownG = new THREE.Group();
  crownG.position.set(0, cloakH + 0.44, 0.01);
  const crownCols = isMan ? ['#2e6c38', '#488e46', '#1e4e28'] : ['#3d7be0', '#e8523d', '#f4d04e', '#f8f2de'];
  for (let i = 0; i < 11; i++) {
    const a = (i / 11) * Math.PI * 2;
    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(isMan ? 0.055 : 0.048, 8, 6),
      new THREE.MeshBasicMaterial({ color: crownCols[i % crownCols.length] })
    );
    dot.position.set(Math.cos(a) * 0.255, Math.sin(a * 2) * 0.03, Math.sin(a) * 0.255);
    crownG.add(dot);
  }
  body.add(crownG);

  /* Slender pale arms & hands curving gracefully outward while gliding */
  const armL = new THREE.Group(), armR = new THREE.Group();
  armL.position.set(-0.32, cloakH - 0.12, 0);
  armR.position.set(0.32, cloakH - 0.12, 0);
  for (const [ag, s] of [[armL, -1], [armR, 1]]) {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.42, 10), robeMat);
    sleeve.position.set(s * 0.16, -0.14, -0.04);
    sleeve.rotation.z = s * 0.7;
    const forearm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.38, 10), skinMat);
    forearm.position.set(s * 0.42, -0.26, -0.12);
    forearm.rotation.z = s * 1.1;
    const handM = new THREE.Mesh(new THREE.SphereGeometry(0.068, 10, 8), skinMat);
    handM.position.set(s * 0.60, -0.32, -0.16);
    ag.add(sleeve, forearm, handM);
    body.add(ag);
  }

  /* Golden aura disc softly gliding underneath her feet */
  const aura = new THREE.Mesh(
    new THREE.RingGeometry(0.45, 0.92, 24),
    new THREE.MeshBasicMaterial({ color: '#ffd966', transparent: true, opacity: 0.52, side: THREE.DoubleSide, depthWrite: false })
  );
  aura.rotation.x = -Math.PI / 2;
  aura.position.y = 0.05;
  root.add(aura);

  return { root, body, cloak, cape, armL, armR, head, aura };
}

/* Build the continuous banked golden ribbon + Act 4 flowered meadow cliff + all 4 Klimt acts */
export function buildKlimtWorld(THREE, scene, track, PAT, adeleTex) {
  const anim = []; /* animated decorative elements updated each frame */
  const step = 4;
  const nSeg = Math.floor(TRACK_LEN / step);

  /* 1. Sweeping banked hammered-gold ribbon (s = 0..880) */
  const buildRibbon = (s0, s1, halfWFn, mat, uvScaleY = 0.08, yOff = 0) => {
    const pos = [], uv = [], idx = [];
    let row = 0;
    for (let s = s0; s <= s1 + 0.01; s += step) {
      const sc = Math.min(s1, s);
      const fr = track.frame(sc);
      const hw = halfWFn(sc);
      const L = fr.at(-hw, yOff), R = fr.at(hw, yOff);
      pos.push(L.x, L.y, L.z, R.x, R.y, R.z);
      uv.push(0, sc * uvScaleY, 1, sc * uvScaleY);
      if (row > 0) {
        const a = (row - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      row++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat);
    scene.add(m);
    return m;
  };

  const floorMat = new THREE.MeshBasicMaterial({ map: PAT.ribbonFloor, side: THREE.DoubleSide });
  buildRibbon(0, 888, () => HALF_W + 0.8, floorMat, 0.085, 0);

  /* Thick gilded underside skirt so the ribbon reads as a monumental golden slab */
  const skirtMat = new THREE.MeshBasicMaterial({ color: '#422e0c', side: THREE.DoubleSide });
  for (const sideS of [-1, 1]) {
    const pos = [], idx = [];
    let row = 0;
    for (let s = 0; s <= 888; s += 8) {
      const fr = track.frame(s);
      const top = fr.at(sideS * (HALF_W + 0.8), 0);
      const bot = fr.at(sideS * (HALF_W + 0.5), -2.4);
      pos.push(top.x, top.y, top.z, bot.x, bot.y, bot.z);
      if (row > 0) {
        const a = (row - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      row++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setIndex(idx);
    scene.add(new THREE.Mesh(g, skirtMat));
  }

  /* 2. Act 4 Flowered Meadow Precipice (s = 860..1040, finely tiled painterly meadow cliff!) */
  const meadowMat = new THREE.MeshBasicMaterial({ map: PAT.meadow, side: THREE.DoubleSide });
  {
    const pos = [], uv = [], idx = [];
    let row = 0;
    const sEnd = 1024;
    for (let s = 860; s <= sEnd + 0.01; s += step) {
      const sc = Math.min(sEnd, s);
      const fr = track.frame(sc);
      const k = Math.max(0, Math.min(1, (sc - 860) / 140));
      const hw = HALF_W + 0.8 + k * 7.5;
      const L = fr.at(-hw, 0.04), R = fr.at(hw, 0.04);
      pos.push(L.x, L.y, L.z, R.x, R.y, R.z);
      uv.push(0, sc * 0.17, hw * 0.26, sc * 0.17);
      if (row > 0) {
        const a = (row - 1) * 2;
        idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
      }
      row++;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    scene.add(new THREE.Mesh(g, meadowMat));
  }

  /* Hanging golden vines trailing down the right edge of the flowered cliff (as in The Kiss!) */
  const vineMat = new THREE.MeshBasicMaterial({ color: '#eec344', side: THREE.DoubleSide });
  for (let s = 885; s <= TRACK_LEN; s += 4.5) {
    const fr = track.frame(s);
    const k = Math.max(0, Math.min(1, (s - 860) / 140));
    const hw = HALF_W + 0.8 + k * 7.5;
    for (const sideS of [-1, 1]) {
      const p = fr.at(sideS * (hw - 0.2), 0);
      const len = 3.5 + ((s * 17) % 6);
      const vine = new THREE.Mesh(new THREE.PlaneGeometry(0.42, len), vineMat);
      vine.position.set(p.x, p.y - len * 0.48, p.z);
      vine.rotation.y = fr.yaw + (sideS > 0 ? 0.2 : -0.2);
      scene.add(vine);
    }
  }

  /* Helper: place flat bold Klimt panel facing slightly towards the glide line */
  const addPanel = (s, u, h, w, ht, mat, yawOff = 0, tilt = 0) => {
    const fr = track.frame(s);
    const p = fr.at(u, h);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, ht), mat);
    m.position.set(p.x, p.y, p.z);
    m.rotation.order = 'YXZ';
    m.rotation.y = fr.yaw + yawOff;
    m.rotation.z = tilt;
    scene.add(m);
    return m;
  };

  /* ================= ACT 1 (s = 12..255): TREE OF LIFE SPIRALS (Stoclet Frieze) ================= */
  const treeMat = new THREE.MeshBasicMaterial({ map: PAT.treeSpiral, transparent: true, alphaTest: 0.12, side: THREE.DoubleSide });
  const birdMat = new THREE.MeshBasicMaterial({ map: PAT.stocletBird, transparent: true, alphaTest: 0.12, side: THREE.DoubleSide });
  for (let s = 18; s <= 250; s += 26) {
    for (const sideS of [-1, 1]) {
      const sc = 1 + ((s * 13 + sideS) % 3) * 0.14;
      const bough = addPanel(s + (sideS > 0 ? 9 : 0), sideS * (HALF_W + 5.2), 7.4 * sc, 11.5 * sc, 17.5 * sc, treeMat, sideS * -0.42, sideS * -0.14);
      anim.push({ m: bough, baseZ: bough.rotation.z, kind: 'sway', ph: s * 0.2 + sideS });
    }
    /* Stoclet black stylised falcon perched high on alternating boughs */
    if (s % 52 === 18) {
      const sideS = ((s / 52) | 0) % 2 === 0 ? 1 : -1;
      addPanel(s + 4, sideS * (HALF_W + 2.8), 7.8, 2.3, 3.4, birdMat, sideS * -0.3);
    }
  }
  /* High flanking golden sun medallions framing the entry without blocking the view ahead */
  const haloMat = new THREE.MeshBasicMaterial({ map: PAT.adeleHalo, transparent: true, side: THREE.DoubleSide, depthWrite: false });
  for (const sideS of [-1, 1]) {
    const hs = addPanel(34, sideS * (HALF_W + 7.5), 11.0, 9.5, 9.5, haloMat, sideS * -0.45);
    anim.push({ m: hs, kind: 'spin', speed: sideS * 0.16 });
  }

  /* ================= ACT 2 (s = 260..495): ADELE'S HALL OF EYES & GOLD ================= */
  const eyesMat = new THREE.MeshBasicMaterial({ map: PAT.adeleEyes, side: THREE.DoubleSide });
  const goldBlockMat = new THREE.MeshBasicMaterial({ map: PAT.goldLeaf });
  for (let s = 266; s <= 490; s += 28) {
    if (Math.abs(s - 435) < 20) continue;
    for (const sideS of [-1, 1]) {
      const fr = track.frame(s);
      const p = fr.at(sideS * (HALF_W + 2.8), 6.2);
      const col = new THREE.Mesh(new THREE.BoxGeometry(2.6, 13.5, 2.6), eyesMat);
      col.position.set(p.x, p.y, p.z);
      col.rotation.y = fr.yaw;
      scene.add(col);
      /* floating rotating golden sun-halo discs between the pillars */
      if ((s / 28 | 0) % 2 === 0) {
        const disc = addPanel(s + 14, sideS * (HALF_W + 5.8), 8.2, 8.8, 8.8, haloMat, sideS * -0.5);
        anim.push({ m: disc, kind: 'spin', speed: sideS * 0.22 });
      }
    }
  }

  /* Grand Golden Archway of Adele Bloch-Bauer I at s = 435 (she glides smoothly underneath!) */
  const adFr = track.frame(435);
  const adGroup = new THREE.Group();
  adGroup.position.set(adFr.x, adFr.y, adFr.z);
  adGroup.rotation.y = adFr.yaw;
  scene.add(adGroup);
  /* Twin Egyptian-eye towers framing the golden arch */
  for (const sx of [-1, 1]) {
    const tower = new THREE.Mesh(new THREE.BoxGeometry(3.2, 16, 2.8), eyesMat);
    tower.position.set(sx * (HALF_W + 1.8), 8, 0);
    adGroup.add(tower);
  }
  const lintel = new THREE.Mesh(new THREE.BoxGeometry((HALF_W + 3.4) * 2, 2.0, 2.4), goldBlockMat);
  lintel.position.set(0, 15.6, 0);
  adGroup.add(lintel);
  /* Radiant spinning sun halo behind the real portrait of Adele Bloch-Bauer I */
  const adHalo = new THREE.Mesh(new THREE.PlaneGeometry(17, 17), haloMat);
  adHalo.position.set(0, 9.6, -0.5);
  adGroup.add(adHalo);
  anim.push({ m: adHalo, kind: 'spin', speed: 0.14 });
  /* Portrait of Adele Bloch-Bauer I set high in the arch so she glides cleanly beneath */
  const adFrame = new THREE.Mesh(new THREE.BoxGeometry(8.6, 8.6, 0.5), goldBlockMat);
  adFrame.position.set(0, 9.6, 0);
  adGroup.add(adFrame);
  const adArt = new THREE.Mesh(new THREE.PlaneGeometry(7.8, 7.8), new THREE.MeshBasicMaterial({ map: adeleTex, side: THREE.DoubleSide }));
  adArt.position.set(0, 9.6, 0.3);
  adGroup.add(adArt);
  const adArtB = adArt.clone(); adArtB.position.z = -0.3; adGroup.add(adArtB);

  /* ================= ACT 3 (s = 505..835): DARK GROUND, GILDED MOSAIC ARCHES & TWO PATTERNS ================= */
  const mosMat = new THREE.MeshBasicMaterial({ map: PAT.mosaic, side: THREE.DoubleSide });
  for (let s = 515; s <= 825; s += 42) {
    const fr = track.frame(s);
    const ag = new THREE.Group();
    ag.position.set(fr.x, fr.y, fr.z);
    ag.rotation.y = fr.yaw;
    /* Slender Secessionist gilded mosaic arch curving high over the dark bronze sky */
    const arch = new THREE.Mesh(new THREE.TorusGeometry(HALF_W + 3.0, 0.56, 8, 32, Math.PI), mosMat);
    arch.position.y = 1.6;
    ag.add(arch);
    /* Accent golden eye medallions flanking the arch */
    for (const sx of [-1, 1]) {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(6.2, 6.2), haloMat);
      m.position.set(sx * (HALF_W + 6.4), 6.4, 0);
      ag.add(m);
      anim.push({ m, kind: 'spin', speed: sx * 0.22 });
    }
    scene.add(ag);
  }

  /* ================= ACT 4 (s = 865..1038): FLOWERED CLIFF & MONUMENTAL SPIRAL WINGS ================= */
  /* Painterly crossed Klimt wildflower tuft cards across the emerald precipice */
  const tuftMat = new THREE.MeshBasicMaterial({ map: PAT.flowerTuft, transparent: true, alphaTest: 0.18, side: THREE.DoubleSide });
  const tuftGeo = new THREE.PlaneGeometry(1.75, 1.45);
  for (let i = 0; i < 150; i++) {
    const s = 868 + (i / 150) * 154;
    const fr = track.frame(s);
    const k = Math.max(0, Math.min(1, (s - 860) / 140));
    const hw = HALF_W + k * 7.2;
    const sideS = i % 2 === 0 ? 1 : -1;
    const u = s > 1002
      ? ((i * 73) % 100 / 100 - 0.5) * hw * 1.75
      : sideS * (3.8 + ((i * 41) % 100) / 100 * (hw - 4.2));
    if (s > 1006 && Math.abs(u) < 2.2) continue; /* keep immediate camera sightline to couple crystal-clear */
    const p = fr.at(u, 0.68);
    const sc = 0.72 + ((i * 29) % 10) * 0.065;
    const t1 = new THREE.Mesh(tuftGeo, tuftMat);
    t1.position.set(p.x, p.y, p.z);
    t1.scale.setScalar(sc);
    t1.rotation.y = fr.yaw + ((i * 37) % 10) * 0.31;
    const t2 = t1.clone();
    t2.rotation.y += Math.PI * 0.5;
    scene.add(t1, t2);
  }

  /* Golden spiral wings framing the final embrace at the cliff's edge (s = 1022) */
  for (const sideS of [-1, 1]) {
    const wing = addPanel(1024, sideS * 9.5, 8.6, 13.5, 20, treeMat, sideS * -0.35, sideS * -0.1);
    anim.push({ m: wing, baseZ: wing.rotation.z, kind: 'sway', ph: sideS });
  }
  const endHalo = addPanel(1030, 0, 7.6, 20, 20, haloMat, 0);
  anim.push({ m: endHalo, kind: 'spin', speed: 0.12 });

  return { anim, adGroup };
}

/* Floating Klimt ornament tokens arranged in graceful ski-slalom arcs */
export function makeOrnaments(THREE, scene, track, PAT) {
  const items = [];
  const mats = {};
  for (const k of ['gold', 'spiral', 'eye', 'circle', 'flower', 'rect']) {
    mats[k] = new THREE.MeshBasicMaterial({ map: PAT.sprites[k], transparent: true, side: THREE.DoubleSide, depthWrite: false });
  }
  const geo = new THREE.PlaneGeometry(1.75, 1.75);

  const add = (s, u, kind, h = 1.45) => {
    const fr = track.frame(s);
    const p = fr.at(u, h);
    const m = new THREE.Mesh(geo, mats[kind]);
    m.position.set(p.x, p.y, p.z);
    scene.add(m);
    items.push({ s, u, h, basePos: p, kind, mesh: m, got: false, pop: 0, ph: s * 0.25 + u });
  };

  /* Act 1 (s = 22..246): curving ribbons of gold leaf & curling spirals */
  for (let s = 22; s <= 246; s += 11) {
    const wave = Math.sin(s * 0.045) * 4.2;
    const k = ((s / 11 | 0) % 3 === 0) ? 'spiral' : 'gold';
    add(s, wave, k);
    /* gentle centreline companion leaf every other step so hands-off glides gather richly */
    if ((s / 11 | 0) % 2 === 0 && Math.abs(wave) > 1.8) add(s + 5, 0, 'gold');
  }

  /* Act 2 (s = 262..414): Egyptian eyes in triangles & gold leaf before Adele's arch */
  for (let s = 262; s <= 414; s += 13) {
    const wave = Math.cos(s * 0.042) * 4.4;
    add(s, wave, ((s / 13 | 0) % 2 === 0) ? 'eye' : 'gold');
    if ((s / 13 | 0) % 2 === 1) add(s + 6, 0, 'eye');
  }

  /* Act 3 (s = 468..850): The Two Streams — circles & flowers (her) + bold rectangles (him) */
  for (let s = 468; s <= 850; s += 12) {
    const idx = (s - 468) / 12 | 0;
    /* Her stream: circles & flowers weaving from centre-right across the ribbon */
    const uHer = 1.5 + Math.sin(s * 0.036) * 3.8;
    add(s, uHer, idx % 2 === 0 ? 'circle' : 'flower');
    /* His stream: bold upright rectangles weaving along the left lane */
    const uHim = -2.6 + Math.cos(s * 0.032) * 2.8;
    add(s + 4, uHim, 'rect', 1.6);
    /* Occasional centreline circle so a hands-off rider still blooms richly */
    if (idx % 3 === 0) add(s + 6, 0.2, idx % 6 === 0 ? 'flower' : 'circle');
  }

  /* Act 4 (s = 870..986): Final floral approach to the embrace */
  for (let s = 870; s <= 986; s += 12) {
    const wave = Math.sin(s * 0.05) * 3.2;
    add(s, wave, ((s / 12 | 0) % 2 === 0) ? 'flower' : 'circle');
    add(s + 5, -wave * 0.6, 'gold');
  }

  function reset() {
    for (const it of items) {
      it.got = false;
      it.pop = 0;
      it.mesh.visible = true;
      it.mesh.scale.setScalar(1);
      it.mesh.position.set(it.basePos.x, it.basePos.y, it.basePos.z);
    }
  }

  return { items, reset };
}

/* Luminous golden-pattern trail painted onto the floor right behind her as she carves */
export function makeTrail(THREE, scene, count = 48) {
  const pos = new Float32Array(count * 2 * 3);
  const col = new Float32Array(count * 2 * 3);
  const idx = [];
  for (let i = 0; i < count - 1; i++) {
    const a = i * 2;
    idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  const mat = new THREE.MeshBasicMaterial({
    vertexColors: true, transparent: true, opacity: 0.78,
    side: THREE.DoubleSide, depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  scene.add(mesh);

  const ring = [];
  const palette = [
    [1.0, 0.85, 0.30], [0.92, 0.34, 0.24], [0.30, 0.56, 0.90],
    [0.72, 0.34, 0.80], [0.98, 0.88, 0.42],
  ];
  let stepC = 0;

  function reset() {
    ring.length = 0;
    pos.fill(0);
    geo.attributes.position.needsUpdate = true;
  }

  function push(fr, u, colorful = false) {
    const pL = fr.at(u - 0.52, 0.08);
    const pR = fr.at(u + 0.52, 0.08);
    const c = colorful ? palette[stepC++ % palette.length] : [1.0, 0.86, 0.34];
    ring.push({ pL, pR, c });
    if (ring.length > count) ring.shift();
    const n = ring.length;
    for (let i = 0; i < count; i++) {
      const rec = ring[Math.min(i, n - 1)] || { pL: { x: 0, y: -99, z: 0 }, pR: { x: 0, y: -99, z: 0 }, c: [1, 0.85, 0.3] };
      const fade = n > 1 ? i / (n - 1) : 0;
      const k = i * 6;
      pos[k] = rec.pL.x; pos[k + 1] = rec.pL.y; pos[k + 2] = rec.pL.z;
      pos[k + 3] = rec.pR.x; pos[k + 4] = rec.pR.y; pos[k + 5] = rec.pR.z;
      col[k] = rec.c[0] * fade; col[k + 1] = rec.c[1] * fade; col[k + 2] = rec.c[2] * fade;
      col[k + 3] = rec.c[0] * fade; col[k + 4] = rec.c[1] * fade; col[k + 5] = rec.c[2] * fade;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.color.needsUpdate = true;
  }

  return { mesh, push, reset };
}

/* Sparkling gold-leaf bursts & graceful pattern-transfer comets to her partner's cloak */
export function makeSparks(THREE, scene) {
  const bursts = [];
  const comets = [];
  const leafGeo = new THREE.PlaneGeometry(0.28, 0.28);

  function burst(pos, kind) {
    const cols = kind === 'circle' || kind === 'flower'
      ? ['#f4d04a', '#e84d3a', '#447ce2', '#a852cc', '#f6f0dc']
      : kind === 'rect'
        ? ['#181614', '#f4efe2', '#f2ca4c', '#c8c6c0']
        : ['#ffe882', '#e8b836', '#fff5be'];
    for (let i = 0; i < 9; i++) {
      const m = new THREE.Mesh(leafGeo, new THREE.MeshBasicMaterial({
        color: cols[i % cols.length], transparent: true, opacity: 1, side: THREE.DoubleSide,
      }));
      m.position.set(pos.x, pos.y, pos.z);
      const a = (i / 9) * Math.PI * 2 + Math.random() * 0.4;
      const sp = 2.4 + Math.random() * 3.0;
      scene.add(m);
      bursts.push({ m, vx: Math.cos(a) * sp, vy: 1.8 + Math.random() * 2.8, vz: Math.sin(a) * sp, age: 0, life: 0.72 });
    }
  }

  function comet(from, toFn, col = '#f6d458') {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.62, 0.12), new THREE.MeshBasicMaterial({ color: col }));
    m.position.copy(from);
    scene.add(m);
    comets.push({ m, from: from.clone(), toFn, t: 0 });
  }

  function update(dt) {
    for (let i = bursts.length - 1; i >= 0; i--) {
      const b = bursts[i];
      b.age += dt;
      b.m.position.x += b.vx * dt;
      b.m.position.y += b.vy * dt;
      b.m.position.z += b.vz * dt;
      b.vy -= 4.2 * dt;
      b.m.rotation.x += dt * 6;
      b.m.rotation.y += dt * 7;
      const k = 1 - b.age / b.life;
      b.m.material.opacity = Math.max(0, k);
      b.m.scale.setScalar(Math.max(0.05, k));
      if (b.age >= b.life) {
        scene.remove(b.m);
        b.m.material.dispose();
        bursts.splice(i, 1);
      }
    }
    for (let i = comets.length - 1; i >= 0; i--) {
      const c = comets[i];
      c.t += dt * 2.1;
      const k = Math.min(1, c.t);
      const e = k * k * (3 - 2 * k);
      const dest = c.toFn();
      c.m.position.lerpVectors(c.from, dest, e);
      c.m.position.y += Math.sin(k * Math.PI) * 2.2;
      c.m.rotation.z += dt * 8;
      if (c.t >= 1) {
        scene.remove(c.m);
        c.m.material.dispose();
        comets.splice(i, 1);
      }
    }
  }

  function clear() {
    for (const b of bursts) { scene.remove(b.m); b.m.material.dispose(); }
    for (const c of comets) { scene.remove(c.m); c.m.material.dispose(); }
    bursts.length = 0; comets.length = 0;
  }

  return { burst, comet, update, clear };
}


