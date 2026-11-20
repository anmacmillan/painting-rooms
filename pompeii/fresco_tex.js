/* Procedural Roman Fourth-Style fresco textures for Pompeii's streets and house fronts.
   Palette and architectural motifs drawn directly from the reference photographs in research/ref/:
   - House of the Painters at Work (wall.jpg, painters_at_work_wall_detail.jpg): flat fields of cinnabar red,
     yellow ochre and lampblack framed with crisp cream fillets, slender golden columns, garlands on cream plaster.
   - Villa of the Mysteries (mysteries_frieze.jpg): warm cinnabar red panels with dark vertical dividers and meander band.
   - House of the Centenary (bacchus.jpg) & Bakery fresco (bread_sale_mann9071.jpg): warm lime-plaster ground,
     olive-green garlands with red ribbons, warm mineral stone paving. */
export function makeFrescoTextures(THREE) {
  let sd = 41;
  const rnd = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const mk = (w, h, draw, rep = true) => {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    draw(cv.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
    if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return t;
  };
  /* Subtle warm lime-plaster mottling and mineral brush sweeps */
  function plaster(c, w, h, alpha = 0.08) {
    for (let i = 0; i < 420; i++) {
      const k = rnd();
      c.fillStyle = k < 0.5 ? `rgba(244,234,212,${alpha * (0.5 + rnd())})` : `rgba(82,58,40,${alpha * 0.7 * (0.4 + rnd())})`;
      c.fillRect(rnd() * w, rnd() * h, 18 + rnd() * 70, 3 + rnd() * 14);
    }
    c.strokeStyle = `rgba(92,66,46,${alpha * 0.9})`; c.lineWidth = 1;
    for (let i = 0; i < 14; i++) {
      let x = rnd() * w, y = rnd() * h;
      c.beginPath(); c.moveTo(x, y);
      for (let j = 0; j < 4; j++) { x += (rnd() - 0.5) * 44; y += (rnd() - 0.5) * 44; c.lineTo(x, y); }
      c.stroke();
    }
  }
  /* A Pompeian framed panel texture (used for red, ochre and black main house zones) */
  function panelTex(bg, innerRule, accent, deco) {
    return mk(512, 512, (c, w, h) => {
      c.fillStyle = bg; c.fillRect(0, 0, w, h);
      plaster(c, w, h, 0.09);
      /* Warm dark vertical architectural pilaster dividers at edges */
      c.fillStyle = 'rgba(28,20,16,0.34)'; c.fillRect(0, 0, 22, h); c.fillRect(w - 22, 0, 22, h);
      /* Slender golden-ochre column shafts flanking each panel */
      c.fillStyle = '#d8ae4e'; c.fillRect(18, 0, 8, h); c.fillRect(w - 26, 0, 8, h);
      c.fillStyle = '#efe5cc'; c.fillRect(20, 0, 3, h); c.fillRect(w - 24, 0, 3, h);
      /* Outer cream fillet border and delicate inner painted rule */
      c.strokeStyle = '#efe5cc'; c.lineWidth = 5; c.strokeRect(42, 34, w - 84, h - 68);
      c.strokeStyle = innerRule; c.lineWidth = 2.5; c.strokeRect(58, 50, w - 116, h - 100);
      /* Painted corner rosettes / embroidery ticks */
      c.fillStyle = accent;
      for (const [cx, cy] of [[58, 50], [w - 58, 50], [58, h - 50], [w - 58, h - 50]]) {
        c.beginPath(); c.arc(cx, cy, 6, 0, 7); c.fill();
      }
      /* Decorative centre motif: garland festoon or slender painted candelabrum */
      if (deco === 'garland') {
        c.strokeStyle = '#5d7a52'; c.lineWidth = 9; c.lineCap = 'round';
        c.beginPath(); c.moveTo(86, 118); c.quadraticCurveTo(w / 2, 206, w - 86, 118); c.stroke();
        c.strokeStyle = '#8aa268'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(92, 116); c.quadraticCurveTo(w / 2, 196, w - 92, 116); c.stroke();
        /* Cinnabar berries and fluttering ribbons (after bacchus.jpg) */
        c.fillStyle = '#c4422e';
        for (let t = 0.18; t <= 0.82; t += 0.16) {
          const x = 86 + (w - 172) * t, y = 118 + 4 * t * (1 - t) * 86;
          c.beginPath(); c.arc(x, y, 5, 0, 7); c.fill();
        }
        c.strokeStyle = '#c4422e'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(86, 118); c.bezierCurveTo(68, 160, 102, 190, 82, 232); c.stroke();
        c.beginPath(); c.moveTo(w - 86, 118); c.bezierCurveTo(w - 68, 160, w - 102, 190, w - 82, 232); c.stroke();
      } else if (deco === 'candelabrum') {
        c.strokeStyle = '#dfba5c'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(w / 2, 100); c.lineTo(w / 2, h - 96); c.stroke();
        for (let y = 140; y <= h - 130; y += 64) {
          c.strokeStyle = '#8aa268'; c.lineWidth = 3;
          c.beginPath(); c.moveTo(w / 2, y); c.quadraticCurveTo(w / 2 - 28, y - 16, w / 2 - 44, y - 4); c.stroke();
          c.beginPath(); c.moveTo(w / 2, y); c.quadraticCurveTo(w / 2 + 28, y - 16, w / 2 + 44, y - 4); c.stroke();
        }
        c.fillStyle = '#efe5cc'; c.beginPath(); c.arc(w / 2, 98, 12, 0, 7); c.fill();
      } else {
        /* Subtle central medallion / floating villa vignette */
        c.strokeStyle = innerRule; c.lineWidth = 2.5;
        c.beginPath(); c.arc(w / 2, h / 2, 58, 0, 7); c.stroke();
        c.fillStyle = 'rgba(239,229,204,0.22)'; c.beginPath(); c.arc(w / 2, h / 2, 52, 0, 7); c.fill();
        c.strokeStyle = '#efe5cc'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(w / 2 - 30, h / 2 + 12); c.lineTo(w / 2, h / 2 - 22); c.lineTo(w / 2 + 30, h / 2 + 12); c.stroke();
      }
      /* Subtle top Greek-key / dentil cornice strip */
      c.fillStyle = 'rgba(239,229,204,0.42)'; c.fillRect(0, 0, w, 14);
      c.fillStyle = 'rgba(92,52,32,0.45)'; for (let x = 8; x < w; x += 28) c.fillRect(x, 3, 14, 8);
    });
  }
  /* Upper register: warm cream lime plaster with airy Fourth-Style golden columns, pediments and olive garlands */
  const wall_upper = mk(512, 512, (c, w, h) => {
    c.fillStyle = '#e6dac0'; c.fillRect(0, 0, w, h);
    plaster(c, w, h, 0.08);
    /* Horizontal cinnabar frieze bands */
    c.fillStyle = '#a83a2c'; c.fillRect(0, h - 22, w, 16); c.fillRect(0, 14, w, 10);
    c.fillStyle = '#d4a13c'; c.fillRect(0, h - 30, w, 6); c.fillRect(0, 26, w, 6);
    /* Slender Fourth-Style painted golden architecture columns and open pediment */
    for (const x of [64, 192, 320, 448]) {
      c.fillStyle = '#cfa03c'; c.fillRect(x - 5, 32, 10, h - 62);
      c.fillStyle = '#f4ecd8'; c.fillRect(x - 2, 32, 3, h - 62);
      c.fillStyle = '#a83a2c'; c.fillRect(x - 12, 36, 24, 8); c.fillRect(x - 10, h - 38, 20, 8);
    }
    /* Airy painted architrave & gable */
    c.strokeStyle = '#b98830'; c.lineWidth = 4;
    c.beginPath(); c.moveTo(64, 150); c.lineTo(192, 92); c.lineTo(320, 150); c.lineTo(448, 92); c.stroke();
    /* Hanging olive garlands with red berries between columns */
    for (const [a, b] of [[64, 192], [192, 320], [320, 448]]) {
      c.strokeStyle = '#627d55'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(a, 180); c.quadraticCurveTo((a + b) / 2, 268, b, 180); c.stroke();
      c.fillStyle = '#b83c2c'; c.beginPath(); c.arc((a + b) / 2, 224, 5, 0, 7); c.fill();
    }
  });
  /* Rich Pompeian red dado with crisp ochre & lime horizontal rules */
  const wall_dado = mk(512, 256, (c, w, h) => {
    c.fillStyle = '#8e2d22'; c.fillRect(0, 0, w, h);
    plaster(c, w, h, 0.1);
    c.fillStyle = '#e8dec6'; c.fillRect(0, 0, w, 10);
    c.fillStyle = '#d4a13c'; c.fillRect(0, 14, w, 6);
    c.strokeStyle = 'rgba(239,229,204,0.45)'; c.lineWidth = 3;
    c.strokeRect(20, 34, w / 2 - 34, h - 54); c.strokeRect(w / 2 + 14, 34, w / 2 - 34, h - 54);
    /* Subtle painted diamond lozenge inside dado bays */
    c.strokeStyle = 'rgba(214,163,62,0.55)'; c.lineWidth = 2;
    for (const cx of [w * 0.25, w * 0.75]) {
      c.beginPath(); c.moveTo(cx, 54); c.lineTo(cx + 58, h / 2 + 8); c.lineTo(cx, h - 38); c.lineTo(cx - 58, h / 2 + 8); c.closePath(); c.stroke();
    }
  });
  /* Warm mineral basalt paving (painted slate-umber flagstones with cream mortar joints) */
  const paving = mk(512, 512, (c, w, h) => {
    c.fillStyle = '#b8aa92'; c.fillRect(0, 0, w, h);
    const cols = ['#7f766c', '#746c63', '#8b8175', '#6c655e', '#92877a'];
    for (let row = 0; row < 6; row++) {
      const y0 = (row / 6) * h, bh = h / 6 - 5, ox = (row % 2) * 44;
      for (let col = -1; col < 6; col++) {
        const x0 = col * 92 + ox, bw = 84 + (rnd() - 0.5) * 14;
        c.fillStyle = cols[Math.floor(rnd() * cols.length)];
        c.beginPath(); c.roundRect(x0 + 3, y0 + 3, bw, bh, 12); c.fill();
        c.strokeStyle = 'rgba(56,44,36,0.35)'; c.lineWidth = 2; c.stroke();
      }
    }
    /* Soft wagon-rut lines */
    c.fillStyle = 'rgba(66,54,44,0.22)'; c.fillRect(w * 0.28, 0, 20, h); c.fillRect(w * 0.68, 0, 20, h);
    plaster(c, w, h, 0.06);
  });
  /* Warm travertine lime-plaster pavement */
  const walk = mk(256, 256, (c, w, h) => {
    c.fillStyle = '#d8cab0'; c.fillRect(0, 0, w, h);
    plaster(c, w, h, 0.09);
    c.strokeStyle = 'rgba(110,84,60,0.25)'; c.lineWidth = 2;
    for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    for (let x = 0; x < w; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, h); c.stroke(); }
  });
  /* Warm terracotta roof pantiles (sienna & ochre) */
  const tile = mk(256, 256, (c, w, h) => {
    c.fillStyle = '#b95a38'; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      c.fillStyle = x % 64 ? '#c96942' : '#a84d2e'; c.fillRect(x, 0, 28, h);
      c.fillStyle = '#dfb17a'; c.fillRect(x + 2, 0, 5, h);
      c.fillStyle = 'rgba(68,32,20,0.35)'; c.fillRect(x + 26, 0, 6, h);
    }
    for (let y = 0; y < h; y += 42) { c.fillStyle = 'rgba(68,32,20,0.25)'; c.fillRect(0, y, w, 4); }
    plaster(c, w, h, 0.06);
  });
  /* Warm painted cedar-ochre timber (doors & pent-roof soffits: eliminates black triangles!) */
  const wood = mk(256, 256, (c, w, h) => {
    c.fillStyle = '#8f5d38'; c.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 32) {
      c.fillStyle = x % 64 ? '#9e6a42' : '#805130'; c.fillRect(x, 0, 30, h);
      c.fillStyle = 'rgba(46,26,14,0.35)'; c.fillRect(x + 29, 0, 3, h);
    }
    plaster(c, w, h, 0.06);
  });
  /* Warm volcanic pumice blanket */
  const pumice = mk(256, 256, (c, w, h) => {
    c.fillStyle = '#c8bfb0'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) {
      c.fillStyle = rnd() < 0.7 ? '#ddd5c6' : '#8e8476';
      c.beginPath(); c.arc(rnd() * w, rnd() * h, 1.5 + rnd() * 3.2, 0, 7); c.fill();
    }
  });
  return {
    white: wall_upper,
    red: panelTex('#a8392b', '#e2b857', '#efe5cc', 'garland'),
    ochre: panelTex('#d4a03a', '#a8392b', '#efe5cc', 'medallion'),
    black_panel: panelTex('#272220', '#d8ae4e', '#c4422e', 'candelabrum'),
    dado: wall_dado,
    rubble: wall_upper,
    wood, tile, basalt: paving, walk, pumice
  };
}
