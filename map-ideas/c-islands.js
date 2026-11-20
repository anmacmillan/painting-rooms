import { ISLAND_DNA } from './c-data.js';

/* Load the pre-rendered Natural Earth 1:50m warped Earth globe skin (public domain coastlines). */
export function loadEarthTexture(THREE, texLoader) {
  const tex = texLoader.load('./globe_earth.png');
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  return tex;
}

/* Bespoke painter-manner pattern on the compact top disc of each diorama plinth. */
function makePedestalTopTex(THREE, dna) {
  const c = document.createElement('canvas');
  c.width = 128; c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = dna.top;
  g.fillRect(0, 0, 128, 128);
  const k = dna.kind;
  if (k === 'alice') {
    for (let y = 0; y < 8; y++) for (let x = 0; x < 8; x++) {
      g.fillStyle = (x + y) % 2 === 0 ? '#181614' : '#f7f4ec';
      g.fillRect(x * 16, y * 16, 16, 16);
    }
  } else if (k === 'delft') {
    for (let y = 0; y < 7; y++) for (let x = 0; x < 7; x++) {
      g.fillStyle = (x + y) % 2 === 0 ? '#24588e' : '#f2efe6';
      g.fillRect(x * 21, y * 21, 21, 21);
    }
  } else if (k === 'gold') {
    for (let i = 0; i < 42; i++) {
      g.fillStyle = i % 3 === 0 ? '#ffe788' : (i % 2 === 0 ? '#d9a42e' : '#b27c14');
      g.fillRect((i * 29) % 116, (i * 47) % 116, 12, 12);
    }
  } else if (k === 'starry') {
    g.strokeStyle = '#f7cf46'; g.lineWidth = 5;
    for (const [cx, cy, r] of [[42, 42, 22], [88, 76, 26], [64, 64, 46]]) {
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 1.45); g.stroke();
    }
  } else if (k === 'carceri') {
    g.strokeStyle = '#241e18'; g.lineWidth = 2;
    for (let i = -128; i < 256; i += 8) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 96, 128); g.stroke();
    }
  } else if (k === 'lilies' || k === 'parasol') {
    const cols = k === 'lilies' ? ['#7bc2be', '#f2a294', '#a8d6b8', '#f6e2b4'] : ['#7cb86c', '#e86852', '#f2d668', '#6898c8'];
    for (let i = 0; i < 56; i++) {
      g.fillStyle = cols[i % cols.length];
      g.beginPath(); g.ellipse((i * 37) % 120 + 4, (i * 53) % 120 + 4, k === 'lilies' ? 12 : 5, 4, 0, 0, Math.PI * 2); g.fill();
    }
  } else if (k === 'wave' || k === 'torii') {
    g.strokeStyle = k === 'torii' ? 'rgba(232,62,40,0.52)' : 'rgba(26,72,120,0.62)';
    g.lineWidth = 2.8;
    for (let y = 16; y <= 128; y += 22) for (let x = 0; x <= 128; x += 26) {
      g.beginPath(); g.arc(x, y, 12, Math.PI, 0); g.stroke();
    }
  } else if (k === 'fjord') {
    const bands = ['#cf4428', '#f29a3c', '#4c2c58', '#dc5630'];
    for (let i = 0; i < 6; i++) {
      g.strokeStyle = bands[i % bands.length]; g.lineWidth = 11;
      g.beginPath(); g.moveTo(0, 16 + i * 20); g.bezierCurveTo(42, 4 + i * 20, 86, 28 + i * 20, 128, 16 + i * 20); g.stroke();
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/* Build one compact-footprint, boldly sculptural 3D painter-manner diorama standing on the real Earth. */
export function buildIslandDiorama(THREE, stop, state, texLoader) {
  const dna = stop.dna || ISLAND_DNA[stop.key] || { base: '#8c7a5e', top: '#ede4cf', accent: '#d8a432', kind: 'ponte' };
  const done = !!state.done;
  const isNext = !!state.isNext;
  const soon = !!stop.comingSoon;
  const side = !!stop.sideRoom;
  const mutedEasel = !done && !isNext && !side && !soon;

  const g = new THREE.Group();
  /* Compact plinth footprint so real coastlines of Britain, Italy & Japan stay clearly visible! */
  const radius = side ? 0.40 : 0.54;

  const baseMat = new THREE.MeshLambertMaterial({ color: dna.base, transparent: soon, opacity: soon ? 0.88 : 1 });
  const topMat = new THREE.MeshLambertMaterial({ map: makePedestalTopTex(THREE, dna), transparent: soon, opacity: soon ? 0.90 : 1 });

  const plinth = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.72, 0.28, 20), baseMat);
  plinth.position.y = 0.14;
  g.add(plinth);

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.04, radius * 1.01, 0.07, 22), topMat);
  deck.position.y = 0.30;
  g.add(deck);

  /* Golden rim for won stops, pulsing vermilion beacon for NEXT */
  const rimCol = done ? '#f5ca52' : (isNext ? '#d64532' : (soon ? '#5b82a8' : '#706658'));
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.06, done || isNext ? 0.055 : 0.032, 8, 26),
    new THREE.MeshBasicMaterial({ color: rimCol })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.33;
  g.add(rim);

  /* Generous invisible tap target for effortless touch on iPad */
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.65, 10, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.78;
  hit.userData.stopKey = stop.key;
  g.add(hit);

  /* 2. BIG, BOLD 3D sculptural painter-manner centerpiece (readable from its silhouette alone!) */
  const props = new THREE.Group();
  props.position.y = 0.34;
  props.scale.setScalar(side ? 0.80 : 0.96);
  addPainterProps(THREE, props, dna);
  g.add(props);

  /* 3. Compact studio easel showing the real painting, tucked cleanly behind/beside the sculpture */
  const easel = new THREE.Group();
  easel.position.set(0, 0.36, -radius * 0.56);
  easel.rotation.x = -0.48;
  const frameW = side ? 0.54 : 0.74;
  const frameH = side ? 0.42 : 0.54;
  const frameMat = new THREE.MeshLambertMaterial({ color: done ? '#e8b944' : (isNext ? '#c83e2b' : '#585046') });
  const backing = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.08, frameH + 0.08, 0.06), frameMat);
  backing.position.y = frameH * 0.5 + 0.10;
  easel.add(backing);

  let picMat;
  if (stop.img) {
    const tex = texLoader.load('../' + stop.img);
    tex.colorSpace = THREE.SRGBColorSpace;
    picMat = new THREE.MeshBasicMaterial({
      map: tex,
      color: mutedEasel ? new THREE.Color('#c8bea8') : new THREE.Color('#ffffff'),
    });
  } else {
    picMat = new THREE.MeshBasicMaterial({ map: makeComingSoonCard(THREE) });
  }
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameH), picMat);
  pic.position.set(0, frameH * 0.5 + 0.10, 0.036);
  easel.add(pic);
  const picBack = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameH), picMat);
  picBack.rotation.y = Math.PI;
  picBack.position.set(0, frameH * 0.5 + 0.10, -0.036);
  easel.add(picBack);
  g.add(easel);

  /* 4. Won celebration: floating spinning golden star-crown above the sculpture */
  let crown = null;
  if (done) {
    crown = new THREE.Group();
    crown.position.y = 1.62;
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.17, 0), new THREE.MeshBasicMaterial({ color: '#ffd966' }));
    gem.scale.set(1, 1.35, 0.55);
    crown.add(gem);
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.026, 6, 18), new THREE.MeshBasicMaterial({ color: '#fff0a8' }));
    halo.rotation.x = Math.PI / 2;
    crown.add(halo);
    g.add(crown);
  }

  /* 5. Pulsing beacon ring for NEXT unplayed stop */
  let beacon = null;
  if (isNext && !done) {
    beacon = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.24, 0.044, 6, 26),
      new THREE.MeshBasicMaterial({ color: '#e64935', transparent: true, opacity: 0.88 })
    );
    beacon.rotation.x = Math.PI / 2;
    beacon.position.y = 0.34;
    g.add(beacon);
  }

  return { group: g, hit, crown, beacon, easel, rim };
}

function makeComingSoonCard(THREE) {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 120;
  const g = c.getContext('2d');
  g.fillStyle = '#e8dfc5'; g.fillRect(0, 0, 160, 120);
  g.fillStyle = '#1f4e82';
  g.beginPath(); g.moveTo(0, 120); g.quadraticCurveTo(44, 10, 96, 56);
  g.quadraticCurveTo(120, 82, 160, 68); g.lineTo(160, 120); g.closePath(); g.fill();
  g.fillStyle = '#f6f2e6';
  for (const [x, y, r] of [[68, 34, 11], [82, 42, 9], [54, 44, 8]]) {
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  g.fillStyle = '#193b63';
  g.beginPath(); g.moveTo(86, 106); g.lineTo(120, 56); g.lineTo(154, 106); g.closePath(); g.fill();
  g.fillStyle = '#ffffff';
  g.beginPath(); g.moveTo(108, 74); g.lineTo(120, 56); g.lineTo(132, 74); g.closePath(); g.fill();
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
/* Bigger, bolder 3D architectural & painterly sculptures so every artist's style reads from the silhouette alone! */
function addPainterProps(THREE, p, dna) {
  const lam = col => new THREE.MeshLambertMaterial({ color: col });
  const glow = col => new THREE.MeshBasicMaterial({ color: col });
  const k = dna.kind;

  if (k === 'parthenon') {
    /* Tall gleaming white marble Parthenon temple on Attic blue frieze plinth */
    const m = lam('#faf7f0');
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.12, 0.42), m);
    step.position.set(0, 0.06, 0.16);
    p.add(step);
    for (let i = -0.36; i <= 0.37; i += 0.18) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.64, 8), m);
      col.position.set(i, 0.42, 0.22);
      p.add(col);
    }
    const frieze = new THREE.Mesh(new THREE.BoxGeometry(0.90, 0.12, 0.34), lam('#2c6aa0'));
    frieze.position.set(0, 0.78, 0.20);
    p.add(frieze);
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.66, 0.28, 4), m);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.08, 1, 0.46);
    roof.position.set(0, 0.96, 0.20);
    p.add(roof);
  } else if (k === 'vesuvius') {
    /* Tall smoking terracotta Mt. Vesuvius + Pompeian fresco red arch */
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.84, 12), lam('#a63a22'));
    cone.position.set(0.18, 0.42, 0.14);
    p.add(cone);
    const lava = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), glow('#ff9838'));
    lava.position.set(0.18, 0.82, 0.14);
    p.add(lava);
    for (let i = 0; i < 4; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.12 + i * 0.04, 8, 6), glow('#f4dec2'));
      puff.position.set(0.18 + i * 0.09, 0.92 + i * 0.13, 0.14);
      p.add(puff);
    }
    const wall = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.44, 0.12), lam('#c8442a'));
    wall.position.set(-0.34, 0.22, 0.24);
    p.add(wall);
  } else if (k === 'ponte') {
    /* Warm gilded Ponte Vecchio bridge with colourful shops */
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.14, 0.28), lam('#d8b460'));
    deck.position.set(0, 0.28, 0.22);
    p.add(deck);
    for (const [sx, col, h] of [[-0.28, '#e8be58', 0.32], [0, '#d87a44', 0.38], [0.28, '#e8cf72', 0.30]]) {
      const shop = new THREE.Mesh(new THREE.BoxGeometry(0.24, h, 0.24), lam(col));
      shop.position.set(sx, 0.35 + h * 0.5, 0.22);
      p.add(shop);
    }
    const roof = new THREE.Mesh(new THREE.BoxGeometry(0.96, 0.09, 0.32), lam('#b84426'));
    roof.position.set(0, 0.76, 0.22);
    p.add(roof);
  } else if (k === 'lantern') {
    /* Caravaggio dramatic jet-black chiaroscuro archway + tall glowing golden spotlight cone */
    const dark = lam('#16100c');
    for (const sx of [-0.34, 0.34]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.88, 0.18), dark);
      pillar.position.set(sx, 0.44, 0.18);
      p.add(pillar);
    }
    const lintel = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.16, 0.20), dark);
    lintel.position.set(0, 0.90, 0.18);
    p.add(lintel);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), glow('#ffe070'));
    bulb.position.set(0, 0.78, 0.24);
    p.add(bulb);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.44, 0.80, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: '#ffd052', transparent: true, opacity: 0.34, side: THREE.DoubleSide })
    );
    cone.position.set(0, 0.40, 0.24);
    p.add(cone);
  } else if (k === 'spire') {
    /* Rubens soaring Antwerp cathedral spire + rich crimson baroque drapery */
    const spire = new THREE.Mesh(new THREE.ConeGeometry(0.20, 1.18, 6), lam('#d8a862'));
    spire.position.set(0.22, 0.59, 0.18);
    p.add(spire);
    const drape = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.30, 0.56, 8, 1, false, 0, Math.PI), lam('#b82a20'));
    drape.position.set(-0.22, 0.28, 0.22);
    p.add(drape);
  } else if (k === 'delft') {
    /* Vermeer classic Dutch stepped-gable red-brick house + blue roof */
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.62, 0.30), lam('#b8523a'));
    body.position.set(0.12, 0.31, 0.20);
    p.add(body);
    const gable = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.44, 4), lam('#24568c'));
    gable.rotation.y = Math.PI / 4;
    gable.position.set(0.12, 0.82, 0.20);
    p.add(gable);
    const win = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.04), glow('#f6ecc8'));
    win.position.set(0.12, 0.42, 0.36);
    p.add(win);
  } else if (k === 'carceri') {
    /* Piranesi towering monochrome vaulted stone arches & diagonal staircase */
    const st = lam('#625648'), dk = lam('#2c241d');
    const arch1 = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.09, 6, 16, Math.PI), st);
    arch1.position.set(0, 0.36, 0.20);
    p.add(arch1);
    for (const sx of [-0.42, 0.42]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.64, 0.20), dk);
      pier.position.set(sx, 0.32, 0.20);
      p.add(pier);
    }
    const stair = new THREE.Mesh(new THREE.BoxGeometry(0.76, 0.08, 0.14), lam('#d8ccb6'));
    stair.position.set(0, 0.44, 0.28);
    stair.rotation.z = 0.42;
    p.add(stair);
  } else if (k === 'wave') {
    /* Hokusai towering Prussian-blue curling Great Wave + snow-capped Mt. Fuji */
    const fuji = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.60, 12), lam('#1d4b80'));
    fuji.position.set(0.26, 0.30, 0.14);
    p.add(fuji);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.24, 12), glow('#ffffff'));
    cap.position.set(0.26, 0.48, 0.14);
    p.add(cap);
    const wave = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.12, 8, 16, Math.PI * 1.25), lam('#225c9c'));
    wave.position.set(-0.14, 0.42, 0.24);
    wave.rotation.z = 0.35;
    p.add(wave);
    for (const [fx, fy] of [[-0.02, 0.78], [0.10, 0.72], [-0.18, 0.80]]) {
      const foam = new THREE.Mesh(new THREE.SphereGeometry(0.085, 6, 5), glow('#ffffff'));
      foam.position.set(fx, fy, 0.26);
      p.add(foam);
    }
  } else if (k === 'viaduct') {
    /* Turner glowing amber mist + brick viaduct + dark steam locomotive */
    const span = new THREE.Mesh(new THREE.BoxGeometry(0.92, 0.16, 0.22), lam('#9c4422'));
    span.position.set(0, 0.36, 0.22);
    p.add(span);
    for (const sx of [-0.32, 0, 0.32]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.36, 0.20), lam('#82361c'));
      leg.position.set(sx, 0.18, 0.22);
      p.add(leg);
    }
    const loco = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.16, 0.14), lam('#1e1814'));
    loco.position.set(-0.18, 0.50, 0.22);
    p.add(loco);
    for (let i = 0; i < 4; i++) {
      const steam = new THREE.Mesh(new THREE.SphereGeometry(0.11 + i * 0.035, 8, 6), glow('#fff0bc'));
      steam.position.set(-0.14 + i * 0.16, 0.64 + i * 0.12, 0.22);
      p.add(steam);
    }
  } else if (k === 'torii') {
    /* Kuniyoshi towering bright vermilion Torii gate + huge pale-gold full moon */
    const red = lam('#e23822');
    for (const sx of [-0.30, 0.30]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.88, 8), red);
      col.position.set(sx, 0.44, 0.24);
      p.add(col);
    }
    const topBar = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.10, 0.11), red);
    topBar.position.set(0, 0.86, 0.24);
    p.add(topBar);
    const midBar = new THREE.Mesh(new THREE.BoxGeometry(0.74, 0.07, 0.08), red);
    midBar.position.set(0, 0.66, 0.24);
    p.add(midBar);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.26, 14, 12), glow('#fff2c2'));
    moon.position.set(0.32, 0.96, -0.02);
    p.add(moon);
  } else if (k === 'alice') {
    /* Tenniel bold stark black-and-white tree & archway + oversized gleaming golden key */
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.14, 0.68, 7), lam('#141210'));
    trunk.position.set(-0.26, 0.34, 0.20);
    p.add(trunk);
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.30, 0), lam('#faf7ef'));
    crown.position.set(-0.26, 0.78, 0.20);
    p.add(crown);
    const keyHead = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.045, 8, 16), glow('#f6cb42'));
    keyHead.position.set(0.28, 0.66, 0.26);
    p.add(keyHead);
    const keyShaft = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.36, 0.05), glow('#f6cb42'));
    keyShaft.position.set(0.28, 0.36, 0.26);
    p.add(keyShaft);
  } else if (k === 'lilies') {
    /* Monet suspended pastel Impressionist colour dabs + lily pads + little boat */
    const dabs = [[-0.30, 0.56, '#84c9c2'], [0.02, 0.70, '#f4a898'], [0.30, 0.58, '#a6d8b4'], [-0.14, 0.42, '#f8dc94'], [0.18, 0.44, '#92bcd8']];
    for (const [dx, dy, col] of dabs) {
      const dab = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.07, 0.14), glow(col));
      dab.position.set(dx, dy, 0.22);
      p.add(dab);
    }
    const boat = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.10, 0.18), lam('#8a5a32'));
    boat.position.set(0, 0.08, 0.28);
    p.add(boat);
  } else if (k === 'lanterns') {
    /* Sargent twilight dark hedge + tall glowing garland of 5 warm Chinese lanterns */
    const hedge = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.42, 0.20), lam('#28463a'));
    hedge.position.set(0, 0.21, 0.16);
    p.add(hedge);
    for (const [lx, ly] of [[-0.34, 0.56], [-0.16, 0.76], [0.04, 0.64], [0.22, 0.80], [0.36, 0.54]]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glow('#ffae3c'));
      l.position.set(lx, ly, 0.26);
      p.add(l);
    }
  } else if (k === 'starry') {
    /* Van Gogh tall writhing dark flame-cypress + glowing 3D swirling starry vortex */
    const cyp = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.06, 8), lam('#143430'));
    cyp.position.set(-0.28, 0.53, 0.20);
    p.add(cyp);
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 10), glow('#ffe258'));
    star.position.set(0.24, 0.82, 0.20);
    p.add(star);
    const swirl1 = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.042, 6, 18), glow('#70b2f8'));
    swirl1.position.set(0.24, 0.82, 0.20);
    p.add(swirl1);
    const swirl2 = new THREE.Mesh(new THREE.TorusGeometry(0.40, 0.028, 6, 18, Math.PI * 1.4), glow('#ffe258'));
    swirl2.position.set(0.24, 0.82, 0.18);
    p.add(swirl2);
  } else if (k === 'fjord') {
    /* Munch towering undulating crimson & burnt-orange sunset sky wall over dark pier */
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.08, 0.68), lam('#321e30'));
    pier.position.set(0, 0.06, 0.22);
    p.add(pier);
    for (const [rad, col, z] of [[0.56, '#d93c22', 0.10], [0.44, '#f29834', 0.14], [0.32, '#e2542a', 0.18]]) {
      const arc = new THREE.Mesh(new THREE.TorusGeometry(rad, 0.075, 6, 20, Math.PI), glow(col));
      arc.position.set(0, 0.24, z);
      p.add(arc);
    }
  } else if (k === 'gold') {
    /* Klimt gleaming burnished gold-leaf Secession dome + geometric gold monoliths */
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.42, 0.34), lam('#f6f0de'));
    base.position.set(0, 0.21, 0.20);
    p.add(base);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.30, 14, 12), glow('#fad44c'));
    dome.position.set(0, 0.58, 0.20);
    p.add(dome);
    for (const sx of [-0.38, 0.38]) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.72, 0.12), glow('#e0aa28'));
      slab.position.set(sx, 0.36, 0.22);
      p.add(slab);
    }
  } else if (k === 'jungle') {
    /* Rousseau tall emerald jungle fronds + crimson blossom */
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.66, 6), lam(i % 2 ? '#1e683e' : '#469e52'));
      frond.position.set(Math.cos(a) * 0.20, 0.33, 0.18 + Math.sin(a) * 0.14);
      frond.rotation.z = (i - 2.5) * 0.24;
      p.add(frond);
    }
    const bloom = new THREE.Mesh(new THREE.SphereGeometry(0.11, 8, 6), glow('#ef5838'));
    bloom.position.set(0, 0.62, 0.24);
    p.add(bloom);
  } else if (k === 'parasol') {
    /* Seurat vivid red-and-cream pointillist parasol */
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.66, 6), lam('#4a3828'));
    stick.position.set(0, 0.33, 0.20);
    p.add(stick);
    const dome = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.20, 12), lam('#e85642'));
    dome.position.set(0, 0.68, 0.20);
    p.add(dome);
  }
}

/* Friendly miniature 3D cloak-and-straw-hat traveller hopping across the Earth. */
export function buildTraveller3D(THREE) {
  const g = new THREE.Group();
  const cloak = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.48, 12), new THREE.MeshLambertMaterial({ color: '#b53828' }));
  cloak.position.y = 0.24;
  g.add(cloak);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 10), new THREE.MeshLambertMaterial({ color: '#f5dcc0' }));
  head.position.y = 0.55;
  g.add(head);
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.24, 0.036, 14), new THREE.MeshLambertMaterial({ color: '#ecc86e' }));
  brim.position.y = 0.64;
  g.add(brim);
  const hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.13, 0.11, 12), new THREE.MeshLambertMaterial({ color: '#ecc86e' }));
  hatTop.position.y = 0.70;
  g.add(hatTop);
  const ribbon = new THREE.Mesh(new THREE.CylinderGeometry(0.135, 0.135, 0.035, 12), new THREE.MeshLambertMaterial({ color: '#284568' }));
  ribbon.position.y = 0.67;
  g.add(ribbon);
  return g;
}

