import { ISLAND_DNA } from './c-data.js';

/* Paint the friendly storybook globe skin (2048x1024 silky celadon sea + smooth storybook coastlines). */
export function makeGlobeTexture(THREE) {
  const W = 2048, H = 1024;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d');

  /* Warm sunlit ceramic-celadon ocean gradient */
  const sea = g.createLinearGradient(0, 0, 0, H);
  sea.addColorStop(0, '#5f94ae');
  sea.addColorStop(0.22, '#82b8ca');
  sea.addColorStop(0.5, '#99cad6');
  sea.addColorStop(0.78, '#80b5c7');
  sea.addColorStop(1, '#5d91ab');
  g.fillStyle = sea;
  g.fillRect(0, 0, W, H);

  /* Soft seigaiha woodblock wave arcs across the ocean */
  g.strokeStyle = 'rgba(255, 252, 240, 0.16)';
  g.lineWidth = 2;
  for (let row = 0; row < 24; row++) {
    const y = row * 44 + 22;
    const shift = (row % 2) * 32;
    for (let x = -32 + shift; x < W + 32; x += 64) {
      g.beginPath(); g.arc(x, y, 22, Math.PI, 0); g.stroke();
      g.beginPath(); g.arc(x, y, 12, Math.PI, 0); g.stroke();
    }
  }

  /* Delicate antique chart graticule */
  g.strokeStyle = 'rgba(38, 72, 94, 0.12)';
  g.lineWidth = 1.5;
  for (let i = 1; i < 6; i++) {
    const y = (i / 6) * H;
    g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke();
  }
  for (let i = 0; i < 12; i++) {
    const x = (i / 12) * W;
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke();
  }

  /* Match Three.js SphereGeometry UV: u = (lonDeg + 90) / 360 mod 1, v = (90 - latDeg) / 180. */
  const uv = (lon, lat) => {
    let u = ((lon + 90) / 360) % 1;
    if (u < 0) u += 1;
    const v = (90 - lat) / 180;
    return [u * W, v * H];
  };

  /* Smooth closed quadratic-spline coastline with shallow turquoise shoal ring + warm parchment land */
  function paintSmoothLand(pts, fill, rim) {
    const raw = pts.map(([lo, la]) => uv(lo, la));
    /* Unwrap seam crossings within one landmass */
    for (let i = 1; i < raw.length; i++) {
      if (raw[i][0] - raw[i - 1][0] > W * 0.5) raw[i][0] -= W;
      if (raw[i][0] - raw[i - 1][0] < -W * 0.5) raw[i][0] += W;
    }
    for (const dx of [-W, 0, W]) {
      g.save();
      g.beginPath();
      const n = raw.length;
      const mid = (a, b) => [(a[0] + b[0]) * 0.5 + dx, (a[1] + b[1]) * 0.5];
      const m0 = mid(raw[n - 1], raw[0]);
      g.moveTo(m0[0], m0[1]);
      for (let i = 0; i < n; i++) {
        const p = raw[i], q = raw[(i + 1) % n];
        const m = mid(p, q);
        g.quadraticCurveTo(p[0] + dx, p[1], m[0], m[1]);
      }
      g.closePath();
      /* Outer sunlit coastal shoal */
      g.strokeStyle = 'rgba(218, 242, 242, 0.55)';
      g.lineWidth = 28;
      g.lineJoin = 'round';
      g.stroke();
      /* Inner cream shoreline halo */
      g.strokeStyle = 'rgba(248, 244, 228, 0.72)';
      g.lineWidth = 12;
      g.stroke();
      g.fillStyle = fill;
      g.fill();
      g.strokeStyle = rim;
      g.lineWidth = 3.5;
      g.stroke();
      g.restore();
    }
  }

  /* Smooth friendly storybook continents aligned with STORYBOOK_POS */
  /* British Isles */
  paintSmoothLand([[-78, 24], [-74, 44], [-58, 55], [-40, 48], [-35, 28], [-48, 18], [-68, 17]], '#ebe3c6', '#8a7652');
  /* Western, Central & Southern Europe */
  paintSmoothLand([
    [-35, 18], [-24, 34], [-8, 47], [12, 42], [32, 36], [54, 32], [68, 12],
    [68, -20], [54, -36], [36, -28], [22, -33], [4, -32], [-16, -22], [-34, -4], [-42, 8]
  ], '#f2ead0', '#8a7652');
  /* Scandinavia (Norway / Åsgårdstrand) */
  paintSmoothLand([[6, 44], [14, 59], [34, 62], [44, 49], [30, 39], [14, 40]], '#eae2c7', '#8a7652');
  /* Silk Road landmass stepping east */
  paintSmoothLand([[74, 20], [94, 31], [116, 24], [120, -2], [98, -12], [78, 2]], '#ede3c6', '#947e58');
  /* Japanese Archipelago (Honshu crescent + southern island — magnified for Edo) */
  paintSmoothLand([[133, 2], [140, 14], [152, 26], [166, 36], [177, 29], [172, 14], [158, 2], [143, -5]], '#f2e8ce', '#8c6248');
  /* Distant Western Storybook Continent */
  paintSmoothLand([[-146, 26], [-122, 36], [-108, 12], [-120, -14], [-146, -6]], '#e8dfc4', '#948264');

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.anisotropy = 4;
  tex.needsUpdate = true;
  return tex;
}

/* Bespoke painter-manner pattern on the top disc of each island pedestal. */
function makePedestalTopTex(THREE, dna, muted) {
  const c = document.createElement('canvas');
  c.width = 128;
  c.height = 128;
  const g = c.getContext('2d');
  g.fillStyle = muted ? '#e4dac4' : dna.top;
  g.fillRect(0, 0, 128, 128);

  const k = dna.kind;
  if (k === 'alice') {
    /* Bold Tenniel black-and-white chessboard */
    const sq = 16;
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        g.fillStyle = (x + y) % 2 === 0 ? '#1c1a18' : '#f6f2e8';
        g.fillRect(x * sq, y * sq, sq, sq);
      }
    }
  } else if (k === 'delft') {
    /* Vermeer Delft blue-and-cream diagonal floor tiles */
    const sq = 21;
    for (let y = 0; y < 7; y++) {
      for (let x = 0; x < 7; x++) {
        g.fillStyle = (x + y) % 2 === 0 ? (muted ? '#9ea7ad' : '#26588c') : '#f0ede4';
        g.fillRect(x * sq, y * sq, sq, sq);
      }
    }
  } else if (k === 'gold') {
    /* Klimt gold-leaf mosaic tiles & swirls */
    for (let i = 0; i < 42; i++) {
      g.fillStyle = i % 3 === 0 ? '#ffe582' : (i % 2 === 0 ? '#d8a432' : '#b57e18');
      g.fillRect((i * 29) % 116, (i * 47) % 116, 12, 12);
    }
  } else if (k === 'starry') {
    /* Van Gogh cobalt & gold swirling impasto rings */
    g.strokeStyle = muted ? '#7b8799' : '#f7cf46';
    g.lineWidth = 4;
    for (const [cx, cy, r] of [[42, 42, 22], [88, 76, 26], [64, 64, 46]]) {
      g.beginPath(); g.arc(cx, cy, r, 0, Math.PI * 1.45); g.stroke();
    }
  } else if (k === 'carceri') {
    /* Piranesi stark etched diagonal hatching */
    g.strokeStyle = '#2e261f';
    g.lineWidth = 1.6;
    for (let i = -128; i < 256; i += 8) {
      g.beginPath(); g.moveTo(i, 0); g.lineTo(i + 96, 128); g.stroke();
    }
  } else if (k === 'lilies' || k === 'parasol') {
    /* Monet / Seurat broken pastel paint dabs */
    const cols = k === 'lilies'
      ? ['#7bc2be', '#f2a294', '#a8d6b8', '#f6e2b4']
      : ['#7cb86c', '#e86852', '#f2d668', '#6898c8'];
    for (let i = 0; i < 60; i++) {
      g.fillStyle = muted ? '#b8b09c' : cols[i % cols.length];
      g.beginPath();
      g.ellipse((i * 37) % 120 + 4, (i * 53) % 120 + 4, k === 'lilies' ? 11 : 5, 4, 0, 0, Math.PI * 2);
      g.fill();
    }
  } else if (k === 'wave' || k === 'torii') {
    /* Ukiyo-e Prussian-blue seigaiha waves */
    g.strokeStyle = k === 'torii' ? 'rgba(230,60,40,0.45)' : 'rgba(28,72,118,0.55)';
    g.lineWidth = 2.5;
    for (let y = 16; y <= 128; y += 22) {
      for (let x = 0; x <= 128; x += 26) {
        g.beginPath(); g.arc(x, y, 12, Math.PI, 0); g.stroke();
      }
    }
  } else if (k === 'fjord') {
    /* Munch undulating crimson-orange sunset bands */
    const bands = ['#c9442a', '#ef9a3e', '#51315c', '#d85832'];
    for (let i = 0; i < 6; i++) {
      g.strokeStyle = muted ? '#9e8d7c' : bands[i % bands.length];
      g.lineWidth = 10;
      g.beginPath();
      g.moveTo(0, 16 + i * 20);
      g.bezierCurveTo(42, 4 + i * 20, 86, 28 + i * 20, 128, 16 + i * 20);
      g.stroke();
    }
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}
/* Build one bold, tactile 3D island diorama standing radially along +Y. */
export function buildIslandDiorama(THREE, stop, state, texLoader) {
  const dna = stop.dna || ISLAND_DNA[stop.key] || { base: '#8c7a5e', top: '#ede4cf', accent: '#d8a432', kind: 'ponte' };
  const done = !!state.done;
  const isNext = !!state.isNext;
  const soon = !!stop.comingSoon;
  const side = !!stop.sideRoom;
  const muted = !done && !isNext && !side && !soon;

  const g = new THREE.Group();
  const radius = side ? 0.78 : 1.12;

  /* 1. Sculpted storybook island pedestal — ALWAYS vivid in the painter's own manner!
        Done vs unplayed is shown cleanly via golden rim + full-colour easel + spinning gold star crown
        versus muted sepia sketch easel + calm slate rim (so every painter's style reads clearly on the globe). */
  const baseMat = new THREE.MeshLambertMaterial({ color: dna.base, transparent: soon, opacity: soon ? 0.88 : 1 });
  const topTex = makePedestalTopTex(THREE, dna, false);
  const topMat = new THREE.MeshLambertMaterial({ map: topTex, transparent: soon, opacity: soon ? 0.90 : 1 });

  const cliff = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius * 0.74, 0.36, 22), baseMat);
  cliff.position.y = 0.18;
  g.add(cliff);

  const deck = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.04, radius * 1.01, 0.09, 24), topMat);
  deck.position.y = 0.38;
  g.add(deck);

  /* Golden rim for won islands, pulsing vermilion beacon ring for NEXT */
  const rimCol = done ? '#f5ca52' : (isNext ? '#d64532' : (soon ? '#5b82a8' : '#7a7265'));
  const rim = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 1.05, done || isNext ? 0.065 : 0.036, 8, 28),
    new THREE.MeshBasicMaterial({ color: rimCol })
  );
  rim.rotation.x = Math.PI / 2;
  rim.position.y = 0.42;
  g.add(rim);

  /* Invisible generous hit-sphere for easy finger tapping on iPad */
  const hit = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.28, 10, 8),
    new THREE.MeshBasicMaterial({ visible: false })
  );
  hit.position.y = 0.82;
  hit.userData.stopKey = stop.key;
  g.add(hit);

  /* 2. Bold 3D miniature sculpture in the painter's own manner (always vivid!) */
  const props = new THREE.Group();
  props.position.y = 0.42;
  props.scale.setScalar(1.16);
  addPainterProps(THREE, props, dna, false);
  g.add(props);

  /* 3. Upright framed painting easel — tilted gently skyward (-34 deg) like a real studio easel
        so every painting reads crisply face-on toward the viewer on the globe! */
  const easel = new THREE.Group();
  easel.position.set(0, 0.44, -radius * 0.42);
  easel.rotation.x = -0.58;
  const frameW = side ? 0.78 : 1.04;
  const frameH = side ? 0.60 : 0.76;
  const frameCol = done ? '#e8b944' : (isNext ? '#c83e2b' : '#585046');
  const frameMat = new THREE.MeshLambertMaterial({ color: frameCol });
  const backing = new THREE.Mesh(new THREE.BoxGeometry(frameW + 0.11, frameH + 0.11, 0.08), frameMat);
  backing.position.y = frameH * 0.5 + 0.14;
  easel.add(backing);

  /* Easel posts */
  for (const sx of [-frameW * 0.34, frameW * 0.34]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.055, 0.24, 0.055), frameMat);
    leg.position.set(sx, 0.10, 0);
    easel.add(leg);
  }

  /* Painting face (vivid full colour when done/next/side, calm sepia sketch tint when unplayed) */
  let picMat;
  if (stop.img) {
    const tex = texLoader.load('../' + stop.img);
    tex.colorSpace = THREE.SRGBColorSpace;
    picMat = new THREE.MeshBasicMaterial({
      map: tex,
      color: muted ? new THREE.Color('#c6bda8') : new THREE.Color('#ffffff'),
    });
  } else {
    picMat = new THREE.MeshBasicMaterial({ map: makeComingSoonCard(THREE, stop) });
  }
  const pic = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameH), picMat);
  pic.position.set(0, frameH * 0.5 + 0.14, 0.045);
  easel.add(pic);
  const picBack = new THREE.Mesh(new THREE.PlaneGeometry(frameW, frameH), picMat);
  picBack.rotation.y = Math.PI;
  picBack.position.set(0, frameH * 0.5 + 0.14, -0.045);
  easel.add(picBack);
  g.add(easel);

  /* 4. Won celebration: floating spinning golden star-crown above the island */
  let crown = null;
  if (done) {
    crown = new THREE.Group();
    crown.position.y = 1.66;
    const starMat = new THREE.MeshBasicMaterial({ color: '#ffd966' });
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.22, 0), starMat);
    gem.scale.set(1, 1.35, 0.55);
    crown.add(gem);
    const halo = new THREE.Mesh(
      new THREE.TorusGeometry(0.35, 0.032, 6, 20),
      new THREE.MeshBasicMaterial({ color: '#fff0a8' })
    );
    halo.rotation.x = Math.PI / 2;
    crown.add(halo);
    g.add(crown);
  }

  /* 5. Pulsing beacon ring for NEXT unplayed stop */
  let beacon = null;
  if (isNext && !done) {
    beacon = new THREE.Mesh(
      new THREE.TorusGeometry(radius * 1.18, 0.048, 6, 28),
      new THREE.MeshBasicMaterial({ color: '#e64935', transparent: true, opacity: 0.88 })
    );
    beacon.rotation.x = Math.PI / 2;
    beacon.position.y = 0.42;
    g.add(beacon);
  }

  return { group: g, hit, crown, beacon, easel, rim };
}

function makeComingSoonCard(THREE, stop) {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 120;
  const g = c.getContext('2d');
  g.fillStyle = '#e8dfc5';
  g.fillRect(0, 0, 160, 120);
  /* Bold Hokusai Great Wave & Mt Fuji */
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
/* Bold, unmistakable 3D architectural / painterly sculptures standing on each island. */
function addPainterProps(THREE, p, dna, muted) {
  const lam = col => new THREE.MeshLambertMaterial({ color: muted ? '#b8ae99' : col });
  const glow = col => new THREE.MeshBasicMaterial({ color: muted ? '#dfd7c3' : col });
  const k = dna.kind;

  if (k === 'parthenon') {
    /* Gleaming marble Doric Parthenon facade */
    const m = lam('#f7f4ec');
    for (let i = -0.45; i <= 0.45; i += 0.3) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.56, 8), m);
      col.position.set(i, 0.28, 0.24);
      p.add(col);
    }
    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.68, 0.24, 4), m);
    roof.rotation.y = Math.PI / 4;
    roof.scale.set(1.15, 1, 0.42);
    roof.position.set(0, 0.66, 0.24);
    p.add(roof);
  } else if (k === 'vesuvius') {
    /* Smoking terracotta Mt. Vesuvius cone */
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.46, 0.68, 12), lam('#a6452c'));
    cone.position.set(0.32, 0.34, 0.16);
    p.add(cone);
    for (let i = 0; i < 3; i++) {
      const puff = new THREE.Mesh(new THREE.SphereGeometry(0.11 + i * 0.04, 8, 6), glow('#f2d6b6'));
      puff.position.set(0.32 + i * 0.1, 0.72 + i * 0.14, 0.16);
      p.add(puff);
    }
  } else if (k === 'ponte') {
    /* Gilded Florentine Ponte Vecchio arches */
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.86, 0.28, 0.24), lam('#e0b858'));
    b.position.set(0, 0.24, 0.28);
    p.add(b);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.08, 0.28), lam('#b84c2e'));
    roof.position.set(0, 0.40, 0.28);
    p.add(roof);
  } else if (k === 'lantern') {
    /* Caravaggio dramatic chiaroscuro golden lantern & light cone */
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.04, 0.76, 6), lam('#1d1510'));
    post.position.set(0.36, 0.38, 0.24);
    p.add(post);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glow('#ffd86e'));
    bulb.position.set(0.36, 0.76, 0.24);
    p.add(bulb);
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.42, 0.72, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: '#ffd058', transparent: true, opacity: 0.24, side: THREE.DoubleSide })
    );
    cone.position.set(0.24, 0.38, 0.24);
    cone.rotation.z = -0.22;
    p.add(cone);
  } else if (k === 'spire' || k === 'delft') {
    /* Soaring Antwerp cathedral spire or stepped Delft gable */
    const spire = new THREE.Mesh(
      new THREE.ConeGeometry(0.18, 0.92, 6),
      lam(k === 'spire' ? '#c99352' : '#2a5f96')
    );
    spire.position.set(0.38, 0.46, 0.22);
    p.add(spire);
    const house = new THREE.Mesh(
      new THREE.BoxGeometry(0.36, 0.36, 0.26),
      lam(k === 'spire' ? '#a63429' : '#ebe6da')
    );
    house.position.set(-0.32, 0.18, 0.26);
    p.add(house);
  } else if (k === 'carceri') {
    /* Piranesi monumental vaulted stone arch */
    const arch = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.08, 6, 14, Math.PI), lam('#6b5e4e'));
    arch.position.set(0, 0.16, 0.26);
    p.add(arch);
    for (const sx of [-0.38, 0.38]) {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.38, 0.18), lam('#52483c'));
      pier.position.set(sx, 0.18, 0.26);
      p.add(pier);
    }
  } else if (k === 'wave') {
    /* Hokusai Prussian-blue curling wave & snow-capped Mt Fuji */
    const fuji = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.56, 12), lam('#1f4e82'));
    fuji.position.set(0.32, 0.28, 0.18);
    p.add(fuji);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.22, 12), glow('#ffffff'));
    cap.position.set(0.32, 0.46, 0.18);
    p.add(cap);
    const wave = new THREE.Mesh(new THREE.TorusGeometry(0.30, 0.10, 8, 14, Math.PI * 1.15), lam('#245a96'));
    wave.position.set(-0.26, 0.24, 0.26);
    wave.rotation.z = 0.4;
    p.add(wave);
  } else if (k === 'viaduct') {
    /* Turner brick viaduct & rising golden steam plume */
    const span = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.18, 0.20), lam('#9c4c28'));
    span.position.set(0, 0.26, 0.28);
    p.add(span);
    for (let i = 0; i < 3; i++) {
      const steam = new THREE.Mesh(new THREE.SphereGeometry(0.10 + i * 0.03, 8, 6), glow('#fff0c2'));
      steam.position.set(-0.18 + i * 0.18, 0.44 + i * 0.11, 0.28);
      p.add(steam);
    }
  } else if (k === 'torii') {
    /* Kuniyoshi bold vermilion Torii gate & glowing full harvest moon */
    const red = lam('#d93824');
    for (const sx of [-0.28, 0.28]) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.68, 8), red);
      col.position.set(sx, 0.34, 0.28);
      p.add(col);
    }
    const bar1 = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.08, 0.09), red);
    bar1.position.set(0, 0.66, 0.28);
    p.add(bar1);
    const bar2 = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.06, 0.07), red);
    bar2.position.set(0, 0.50, 0.28);
    p.add(bar2);
    const moon = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 10), glow('#fff0bd'));
    moon.position.set(0.46, 0.86, -0.05);
    p.add(moon);
  } else if (k === 'alice') {
    /* Tenniel bold black-and-white tree & single gleaming golden key */
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.12, 0.54, 7), lam('#1c1a18'));
    trunk.position.set(-0.34, 0.27, 0.22);
    p.add(trunk);
    const crown = new THREE.Mesh(new THREE.DodecahedronGeometry(0.24, 0), lam('#f7f4ec'));
    crown.position.set(-0.34, 0.62, 0.22);
    p.add(crown);
    const keyRing = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.032, 6, 14), glow('#f2c444'));
    keyRing.position.set(0.36, 0.36, 0.28);
    p.add(keyRing);
  } else if (k === 'lilies' || k === 'parasol') {
    /* Monet waterlilies + boat, or Seurat sunny pointillist parasol */
    if (k === 'parasol') {
      const dome = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.16, 10), lam('#e85d4a'));
      dome.position.set(0.22, 0.52, 0.22);
      p.add(dome);
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.52, 6), lam('#4a3828'));
      stick.position.set(0.22, 0.26, 0.22);
      p.add(stick);
    } else {
      for (const [lx, lz] of [[-0.32, 0.26], [0.28, 0.30], [0.02, 0.38]]) {
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 10), lam('#4b9678'));
        pad.position.set(lx, 0.03, lz);
        p.add(pad);
        const flower = new THREE.Mesh(new THREE.SphereGeometry(0.055, 6, 5), glow('#f7b5b0'));
        flower.position.set(lx, 0.08, lz);
        p.add(flower);
      }
    }
  } else if (k === 'lanterns') {
    /* Sargent twilight glowing paper lanterns */
    for (const [lx, ly, lz] of [[-0.34, 0.52, 0.26], [0.04, 0.66, 0.30], [0.36, 0.48, 0.24]]) {
      const l = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 8), glow('#ffae42'));
      l.position.set(lx, ly, lz);
      p.add(l);
    }
  } else if (k === 'starry') {
    /* Van Gogh dark flame cypress & glowing golden swirling star */
    const cyp = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.78, 8), lam('#183834'));
    cyp.position.set(-0.34, 0.39, 0.22);
    p.add(cyp);
    const star = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), glow('#ffe058'));
    star.position.set(0.36, 0.74, 0.16);
    p.add(star);
    const swirl = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.03, 6, 16), glow('#70a8f0'));
    swirl.position.set(0.36, 0.74, 0.16);
    p.add(swirl);
  } else if (k === 'fjord') {
    /* Munch bold crimson-orange sky wave arching over a dark wooden pier */
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.08, 0.72), lam('#3b2838'));
    pier.position.set(0, 0.06, 0.24);
    p.add(pier);
    const skyArc = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.075, 6, 18, Math.PI), glow('#e6522e'));
    skyArc.position.set(0, 0.28, 0.04);
    p.add(skyArc);
  } else if (k === 'gold') {
    /* Klimt Vienna Secession golden laurel dome */
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.56, 0.34, 0.36), lam('#f4eedc'));
    base.position.set(0, 0.17, 0.24);
    p.add(base);
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 14, 10), glow('#f7cf48'));
    dome.position.set(0, 0.44, 0.24);
    p.add(dome);
  } else if (k === 'jungle') {
    /* Rousseau emerald layered tropical fronds */
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const frond = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.54, 6), lam(i % 2 ? '#246b42' : '#4a9956'));
      frond.position.set(Math.cos(a) * 0.22, 0.26, 0.22 + Math.sin(a) * 0.16);
      frond.rotation.z = (i - 2) * 0.22;
      p.add(frond);
    }
  }
}

/* Friendly miniature 3D cloak-and-straw-hat traveller standing & hopping across the globe. */
export function buildTraveller3D(THREE) {
  const g = new THREE.Group();
  const cloak = new THREE.Mesh(
    new THREE.ConeGeometry(0.22, 0.56, 12),
    new THREE.MeshLambertMaterial({ color: '#b53828' })
  );
  cloak.position.y = 0.28;
  g.add(cloak);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(0.14, 12, 10),
    new THREE.MeshLambertMaterial({ color: '#f5dcc0' })
  );
  head.position.y = 0.64;
  g.add(head);

  const brim = new THREE.Mesh(
    new THREE.CylinderGeometry(0.27, 0.27, 0.04, 14),
    new THREE.MeshLambertMaterial({ color: '#ecc86e' })
  );
  brim.position.y = 0.74;
  g.add(brim);

  const hatTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.15, 0.12, 12),
    new THREE.MeshLambertMaterial({ color: '#ecc86e' })
  );
  hatTop.position.y = 0.81;
  g.add(hatTop);

  const ribbon = new THREE.Mesh(
    new THREE.CylinderGeometry(0.155, 0.155, 0.04, 12),
    new THREE.MeshLambertMaterial({ color: '#284568' })
  );
  ribbon.position.y = 0.77;
  g.add(ribbon);

  return g;
}


