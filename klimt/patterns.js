/* Procedural Klimt ornament textures — flat gold leaf, Tree of Life spirals,
   Egyptian eyes in triangles, Wiener Werkstaette checker trim, rectangles, circles & wildflowers. */

export function makePatterns(THREE) {
  const mk = (w, h, draw, repeat = false) => {
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const g = c.getContext('2d');
    draw(g, w, h);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    if (repeat) {
      t.wrapS = THREE.RepeatWrapping;
      t.wrapT = THREE.RepeatWrapping;
    }
    return { tex: t, canvas: c, ctx: g };
  };

  /* deterministic PRNG for rich reproducible Klimt patterning */
  const rng = (seed) => {
    let s = seed >>> 0;
    return () => {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  };

  /* 1. Hammered gold leaf ground with subtle square leaf joins and metallic mottling */
  const goldLeaf = mk(512, 512, (g, w, h) => {
    const r = rng(1907);
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#c8972c');
    grad.addColorStop(0.5, '#dfb243');
    grad.addColorStop(1, '#ba8822');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    const cell = 64;
    for (let y = 0; y < h; y += cell) {
      for (let x = 0; x < w; x += cell) {
        const v = (r() - 0.5) * 28;
        g.fillStyle = `rgb(${212 + v | 0}, ${166 + v * 0.85 | 0}, ${56 + v * 0.4 | 0})`;
        g.fillRect(x + 1, y + 1, cell - 2, cell - 2);
        g.strokeStyle = 'rgba(110, 74, 16, 0.28)';
        g.lineWidth = 1.2;
        g.strokeRect(x + 0.5, y + 0.5, cell - 1, cell - 1);
      }
    }
    for (let i = 0; i < 1600; i++) {
      const x = r() * w, y = r() * h, s = 1 + r() * 3.5;
      g.fillStyle = r() < 0.55 ? 'rgba(255, 234, 140, 0.26)' : 'rgba(104, 72, 18, 0.18)';
      g.fillRect(x, y, s, s);
    }
    /* isolated silver-platinum leaf squares as in Adele Bloch-Bauer I */
    for (let i = 0; i < 4; i++) {
      const x = Math.floor(r() * 8) * 64, y = Math.floor(r() * 8) * 64;
      g.fillStyle = 'rgba(222, 220, 210, 0.58)';
      g.fillRect(x + 2, y + 2, 60, 60);
    }
  }, true);

  /* 2. Glide ribbon floor: luminous hammered gold flanked by Wiener Werkstaette checker rails */
  const ribbonFloor = mk(512, 512, (g, w, h) => {
    const r = rng(1908);
    g.fillStyle = '#c8982e';
    g.fillRect(0, 0, w, h);
    /* gilded leaf tiles down the centre */
    for (let y = 0; y < h; y += 32) {
      for (let x = 36; x < w - 36; x += 32) {
        const d = (r() - 0.5) * 24;
        g.fillStyle = `rgb(${208 + d | 0}, ${162 + d * 0.82 | 0}, ${54 + d * 0.35 | 0})`;
        g.fillRect(x + 1, y + 1, 30, 30);
      }
    }
    /* golden mottled shimmer */
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() < 0.5 ? 'rgba(255,238,155,0.28)' : 'rgba(115,78,18,0.2)';
      g.fillRect(38 + r() * (w - 76), r() * h, 2 + r() * 4, 2 + r() * 4);
    }
    /* subtle twin inlaid spiral lanes */
    g.strokeStyle = 'rgba(118, 80, 16, 0.34)';
    g.lineWidth = 3;
    for (const cx of [148, 364]) {
      for (let y = 32; y < h; y += 64) {
        g.beginPath();
        for (let a = 0; a < 11.5; a += 0.25) {
          const rad = a * 2.1;
          const px = cx + Math.cos(a) * rad, py = y + Math.sin(a) * rad;
          if (a === 0) g.moveTo(px, py); else g.lineTo(px, py);
        }
        g.stroke();
      }
    }
    /* glowing centre gold stripe */
    const cg = g.createLinearGradient(w * 0.44, 0, w * 0.56, 0);
    cg.addColorStop(0, 'rgba(255,236,145,0)');
    cg.addColorStop(0.5, 'rgba(255,240,164,0.45)');
    cg.addColorStop(1, 'rgba(255,236,145,0)');
    g.fillStyle = cg;
    g.fillRect(w * 0.44, 0, w * 0.12, h);
    /* bold Wiener Werkstaette black-and-white checker edges (from Adele Bloch-Bauer I) */
    for (const ex of [0, w - 34]) {
      g.fillStyle = '#18140e';
      g.fillRect(ex, 0, 34, h);
      for (let y = 0; y < h; y += 16) {
        g.fillStyle = (y / 16) % 2 === 0 ? '#f3ecd8' : '#18140e';
        g.fillRect(ex + 5, y, 12, 16);
        g.fillStyle = (y / 16) % 2 === 0 ? '#18140e' : '#f3ecd8';
        g.fillRect(ex + 17, y, 12, 16);
      }
      g.fillStyle = '#f2c850';
      g.fillRect(ex === 0 ? 32 : w - 36, 0, 4, h);
    }
  }, true);

  /* 3. Dense wildflower meadow from The Kiss — finely scaled emerald grass, violet bells, blue dots & gold vines */
  const meadow = mk(512, 512, (g, w, h) => {
    const r = rng(1909);
    g.fillStyle = '#2d6338';
    g.fillRect(0, 0, w, h);
    /* fine impressionist-mosaic grass dabs */
    for (let i = 0; i < 3200; i++) {
      g.fillStyle = ['#3d7f46', '#24522e', '#569852', '#70a84e', '#1d4426', '#4a8e58'][Math.floor(r() * 6)];
      g.fillRect(r() * w, r() * h, 3 + r() * 6, 3 + r() * 8);
    }
    /* golden vine speckles woven through the grass */
    for (let i = 0; i < 900; i++) {
      g.fillStyle = r() < 0.6 ? '#e5b83b' : '#f7de7a';
      g.beginPath();
      g.arc(r() * w, r() * h, 1.2 + r() * 2.4, 0, Math.PI * 2);
      g.fill();
    }
    /* dense small violet bells, cerulean & ultramarine blossoms, buttercups, crimson buds */
    const cols = ['#8e58c4', '#b07ee0', '#487ce0', '#60b8e6', '#e6cf44', '#d85042', '#ede7d2', '#7a45b0'];
    for (let i = 0; i < 1400; i++) {
      const x = r() * w, y = r() * h, rad = 2.0 + r() * 4.5, c = cols[Math.floor(r() * cols.length)];
      g.fillStyle = c;
      g.beginPath();
      g.arc(x, y, rad, 0, Math.PI * 2);
      g.fill();
      if (rad > 3.6) {
        g.fillStyle = r() < 0.55 ? '#ffe370' : '#261b12';
        g.beginPath();
        g.arc(x, y, rad * 0.36, 0, Math.PI * 2);
        g.fill();
      }
    }
  }, true);

  /* 3b. Painted Klimt wildflower tuft sprite (violet bells, cerulean blooms, golden tendrils) */
  const flowerTuft = mk(256, 256, (g, w, h) => {
    const r = rng(19091);
    g.clearRect(0, 0, w, h);
    /* dark emerald & olive leafy stems */
    g.lineCap = 'round';
    for (let i = 0; i < 24; i++) {
      const bx = 46 + r() * 164, tx = bx + (r() - 0.5) * 60, ty = 54 + r() * 110;
      g.strokeStyle = i % 3 === 0 ? '#5c9648' : (i % 2 ? '#2c6436' : '#d8ad38');
      g.lineWidth = 4 + r() * 4;
      g.beginPath(); g.moveTo(bx, h - 4); g.quadraticCurveTo((bx + tx) * 0.5, (h + ty) * 0.5, tx, ty); g.stroke();
    }
    /* violet bellflowers, cerulean florets, golden stars */
    const cols = ['#8f58c8', '#b580e2', '#4680e2', '#5cc0e8', '#f2cf4a', '#de5246', '#f4eed8'];
    for (let i = 0; i < 42; i++) {
      const x = 36 + r() * 184, y = 44 + r() * 166, rad = 7 + r() * 11;
      g.fillStyle = cols[i % cols.length];
      g.beginPath(); g.arc(x, y, rad, 0, Math.PI * 2); g.fill();
      g.strokeStyle = 'rgba(28, 20, 12, 0.55)'; g.lineWidth = 1.6; g.stroke();
      g.fillStyle = i % 2 ? '#ffe57a' : '#261c12';
      g.beginPath(); g.arc(x, y, rad * 0.34, 0, Math.PI * 2); g.fill();
    }
  });

  /* helper to draw a bold Klimt spiral volute */
  const drawSpiral = (g, cx, cy, maxR, dir, lw, stroke, outline) => {
    const pts = [];
    const turns = 3.25;
    for (let t = 0; t <= 1; t += 0.014) {
      const a = t * Math.PI * 2 * turns * dir;
      const rad = maxR * (1 - t * 0.86);
      pts.push([cx + Math.cos(a) * rad, cy + Math.sin(a) * rad]);
    }
    g.lineCap = 'round';
    g.lineJoin = 'round';
    g.strokeStyle = outline || '#2c200d';
    g.lineWidth = lw + 7;
    g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.stroke();
    g.strokeStyle = stroke || '#e4b73e';
    g.lineWidth = lw;
    g.stroke();
    g.strokeStyle = 'rgba(255, 240, 165, 0.5)';
    g.lineWidth = Math.max(2, lw * 0.25);
    g.stroke();
  };

  /* 4. Tree of Life curling branch panel (Stoclet Frieze, MAK MAL 226) */
  const treeSpiral = mk(512, 768, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    /* central golden trunk rising up */
    const drawTrunk = (lw, col) => {
      g.strokeStyle = col;
      g.lineWidth = lw;
      g.lineCap = 'round';
      g.beginPath();
      g.moveTo(w * 0.5, h - 10);
      g.bezierCurveTo(w * 0.46, h * 0.65, w * 0.55, h * 0.38, w * 0.48, 70);
      g.stroke();
    };
    drawTrunk(46, '#2b1e0b');
    drawTrunk(36, '#d9ab36');
    /* sweeping spiral boughs curling left and right */
    const boughs = [
      [w * 0.23, h * 0.72, 108, 1, 20],
      [w * 0.78, h * 0.64, 114, -1, 20],
      [w * 0.21, h * 0.41, 116, 1, 22],
      [w * 0.78, h * 0.33, 110, -1, 20],
      [w * 0.30, h * 0.16, 86, 1, 17],
      [w * 0.72, h * 0.14, 82, -1, 16],
    ];
    for (const [cx, cy, rad, dir, lw] of boughs) {
      /* connecting arm from trunk */
      g.strokeStyle = '#2b1e0b'; g.lineWidth = lw + 7;
      g.beginPath(); g.moveTo(w * 0.5, cy + 55); g.quadraticCurveTo(cx, cy + rad + 18, cx + rad, cy); g.stroke();
      g.strokeStyle = '#e0b33a'; g.lineWidth = lw; g.stroke();
      drawSpiral(g, cx, cy, rad, dir, lw, '#e5b93f', '#2b1e0b');
    }
    /* Stoclet black-and-white oval eyes along the trunk */
    const eyes = [[w * 0.5, h * 0.82, 22], [w * 0.48, h * 0.62, 26], [w * 0.52, h * 0.45, 24], [w * 0.49, h * 0.27, 20]];
    for (const [ex, ey, er] of eyes) {
      g.fillStyle = '#181410';
      g.beginPath(); g.ellipse(ex, ey, er * 1.15, er * 0.82, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#f4edd8';
      g.beginPath(); g.ellipse(ex, ey, er * 0.82, er * 0.54, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#181410';
      g.beginPath(); g.arc(ex, ey, er * 0.26, 0, Math.PI * 2); g.fill();
    }
    /* Stoclet blue-and-gold domed eye shrines */
    for (const [dx, dy] of [[w * 0.23, h * 0.55], [w * 0.77, h * 0.49], [w * 0.52, h * 0.10]]) {
      g.fillStyle = '#27528c';
      g.beginPath(); g.arc(dx, dy, 28, Math.PI, 0); g.closePath(); g.fill();
      g.strokeStyle = '#181410'; g.lineWidth = 3; g.stroke();
      g.fillStyle = '#f2cc52';
      g.fillRect(dx - 26, dy - 16, 52, 7);
      g.fillStyle = '#f6f0dc';
      g.beginPath(); g.arc(dx, dy - 5, 7, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#181410';
      g.beginPath(); g.arc(dx, dy - 5, 3, 0, Math.PI * 2); g.fill();
    }
    /* green triangle fringes on branches */
    for (const [tx, ty] of [[w * 0.14, h * 0.84], [w * 0.70, h * 0.79], [w * 0.16, h * 0.29]]) {
      for (let k = 0; k < 4; k++) {
        g.fillStyle = k % 2 ? '#2e7d52' : '#4fa36b';
        g.strokeStyle = '#181410'; g.lineWidth = 2;
        g.beginPath();
        g.moveTo(tx + k * 20, ty);
        g.lineTo(tx + k * 20 + 18, ty);
        g.lineTo(tx + k * 20 + 9, ty + 18);
        g.closePath();
        g.fill(); g.stroke();
      }
    }
  });

  /* 5. Stoclet stylised black falcon perched on the Tree of Life */
  const stocletBird = mk(256, 384, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = '#181614';
    g.beginPath();
    g.moveTo(w * 0.5, 28);
    g.bezierCurveTo(w * 0.84, 34, w * 0.88, 175, w * 0.76, 338);
    g.lineTo(w * 0.26, 338);
    g.bezierCurveTo(w * 0.16, 175, w * 0.22, 34, w * 0.5, 28);
    g.fill();
    /* white tail scallops */
    g.fillStyle = '#f4edd8';
    for (let i = 0; i < 4; i++) {
      g.beginPath(); g.ellipse(w * (0.32 + i * 0.12), 342, 16, 26, 0, 0, Math.PI * 2); g.fill();
    }
    /* delicate white lace spirals on wings */
    g.strokeStyle = '#efe6ce'; g.lineWidth = 2.6;
    for (let y = 115; y < 305; y += 34) {
      for (let x = 78; x <= 178; x += 34) {
        g.beginPath(); g.arc(x, y, 10, 0, Math.PI * 2); g.stroke();
      }
    }
    /* scarlet eye and gold beak */
    g.fillStyle = '#e03e2d';
    g.beginPath(); g.arc(w * 0.42, 62, 11, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#181410';
    g.beginPath(); g.arc(w * 0.42, 62, 5, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e8bd40';
    g.beginPath(); g.moveTo(w * 0.28, 60); g.lineTo(w * 0.12, 74); g.lineTo(w * 0.28, 82); g.closePath(); g.fill();
  });

  /* 6. Adele Bloch-Bauer I Egyptian eyes inside golden triangles + cobalt bars */
  const adeleEyes = mk(512, 512, (g, w, h) => {
    const r = rng(19070);
    g.fillStyle = '#cf9e2e';
    g.fillRect(0, 0, w, h);
    /* warm gold wavy background */
    for (let y = 0; y < h; y += 8) {
      g.fillStyle = (y / 8) % 2 ? 'rgba(255,228,125,0.22)' : 'rgba(130,86,18,0.18)';
      g.fillRect(0, y, w, 4);
    }
    /* rows of golden triangles & Egyptian all-seeing eyes */
    for (let row = 0; row < 4; row++) {
      for (let col = 0; col < 4; col++) {
        const cx = col * 128 + 64 + ((row % 2) ? 32 : -12);
        const cy = row * 128 + 64;
        /* golden triangle */
        g.fillStyle = '#e9bd42';
        g.strokeStyle = '#38250b';
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(cx, cy - 44);
        g.lineTo(cx + 52, cy + 36);
        g.lineTo(cx - 52, cy + 36);
        g.closePath();
        g.fill(); g.stroke();
        /* almond eye inside triangle */
        g.fillStyle = '#f5eed8';
        g.beginPath();
        g.moveTo(cx - 32, cy + 8);
        g.quadraticCurveTo(cx, cy - 18, cx + 32, cy + 8);
        g.quadraticCurveTo(cx, cy + 30, cx - 32, cy + 8);
        g.fill();
        g.strokeStyle = '#1b1610'; g.lineWidth = 3.5; g.stroke();
        g.fillStyle = (row + col) % 2 ? '#1a3673' : '#181410';
        g.beginPath(); g.arc(cx, cy + 8, 10, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ffd966';
        g.beginPath(); g.arc(cx - 3, cy + 5, 3, 0, Math.PI * 2); g.fill();
      }
    }
    /* vertical cobalt & black accent bars and tiny triangles */
    for (let i = 0; i < 18; i++) {
      const bx = r() * w, by = r() * h;
      g.fillStyle = i % 3 === 0 ? '#1b3d8a' : (i % 3 === 1 ? '#181410' : '#dcd8cc');
      g.fillRect(bx, by, 10, 38);
      g.strokeStyle = '#f3cc54'; g.lineWidth = 1.5; g.strokeRect(bx, by, 10, 38);
    }
  }, true);

  /* 7. Ornate circular sun-halo from Adele Bloch-Bauer I */
  const adeleHalo = mk(512, 512, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const gr = g.createRadialGradient(cx, cy, 40, cx, cy, 246);
    gr.addColorStop(0, '#f8dc76');
    gr.addColorStop(0.65, '#d6a430');
    gr.addColorStop(1, 'rgba(190,136,28,0)');
    g.fillStyle = gr;
    g.beginPath(); g.arc(cx, cy, 246, 0, Math.PI * 2); g.fill();
    /* ring of spiral medallions & red-gold checker squares */
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const mx = cx + Math.cos(a) * 165, my = cy + Math.sin(a) * 165;
      if (i % 3 === 0) {
        g.fillStyle = '#c83d28';
        g.fillRect(mx - 24, my - 24, 48, 48);
        g.strokeStyle = '#f8df7c'; g.lineWidth = 4; g.strokeRect(mx - 24, my - 24, 48, 48);
        g.fillStyle = '#1a150f'; g.fillRect(mx - 10, my - 10, 20, 20);
      } else {
        g.fillStyle = i % 2 ? '#e8bd40' : '#d8d4c8';
        g.beginPath(); g.arc(mx, my, 28, 0, Math.PI * 2); g.fill();
        drawSpiral(g, mx, my, 24, i % 2 ? 1 : -1, 4, '#241b0f', '#f4d36a');
      }
    }
    /* inner ring of gold & black pearls */
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2;
      g.fillStyle = i % 2 ? '#1a150f' : '#fff0a8';
      g.beginPath(); g.arc(cx + Math.cos(a) * 108, cy + Math.sin(a) * 108, 7, 0, Math.PI * 2); g.fill();
    }
  });

  /* 8. Refined gilded Secessionist mosaic (antique gold + Death & Life deep jewel inlays) */
  const mosaic = mk(512, 512, (g, w, h) => {
    const r = rng(1911);
    g.fillStyle = '#c4962c';
    g.fillRect(0, 0, w, h);
    const cols = ['#d8aa38', '#b88824', '#1d1a15', '#27477a', '#9e342b', '#285e46', '#6b3c7d', '#e8dec6'];
    for (let y = 0; y < h; y += 32) {
      for (let x = 0; x < w; x += 32) {
        const pick = r() < 0.52 ? (r() < 0.6 ? '#d8aa38' : '#1d1a15') : cols[Math.floor(r() * cols.length)];
        g.fillStyle = pick;
        g.fillRect(x + 2, y + 2, 28, 28);
        g.strokeStyle = '#231a0c'; g.lineWidth = 2; g.strokeRect(x + 2, y + 2, 28, 28);
        if (r() < 0.45) {
          g.fillStyle = r() < 0.5 ? '#f0ca56' : '#e8dec6';
          g.beginPath(); g.arc(x + 16, y + 16, 6, 0, Math.PI * 2); g.fill();
        }
      }
    }
  }, true);

  /* 9. Live woman's cloak texture: cream -> hammered gold -> circles, flowers & gold spirals */
  function makeWomanRobe() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const g = c.getContext('2d');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const r = rng(2026);
    const clusters = [];
    const palettes = [
      ['#df4732', '#f3c742', '#7038a8', '#f5eedc'],
      ['#2d68d2', '#4db7d8', '#e6b836', '#f7f1de'],
      ['#c93d84', '#e85b3a', '#308a64', '#f7e07e'],
      ['#368250', '#9648c2', '#f2cf52', '#e44b3c'],
    ];
    for (let i = 0; i < 62; i++) {
      clusters.push({
        x: 24 + r() * 464, y: 36 + r() * 452,
        rad: 14 + r() * 22, pal: palettes[i % palettes.length],
      });
    }
    let lastG = -1, lastC = -1;
    function paint(goldAmt, circleAmt) {
      const gq = Math.round(goldAmt * 20), cq = Math.round(circleAmt * 24);
      if (gq === lastG && cq === lastC) return;
      lastG = gq; lastC = cq;
      /* base fabric shifts from warm ivory linen to lustrous flat gold leaf */
      const gm = Math.max(0, Math.min(1, goldAmt));
      const R = Math.round(238 + (226 - 238) * gm);
      const G = Math.round(229 + (179 - 229) * gm);
      const B = Math.round(206 + (54 - 206) * gm);
      g.fillStyle = `rgb(${R},${G},${B})`;
      g.fillRect(0, 0, 512, 512);
      if (gm > 0.05) {
        g.globalAlpha = gm * 0.8;
        const rr = rng(777);
        for (let y = 0; y < 512; y += 32) {
          for (let x = 0; x < 512; x += 32) {
            const v = (rr() - 0.5) * 26;
            g.fillStyle = `rgb(${216 + v | 0},${168 + v * 0.8 | 0},${52 + v * 0.4 | 0})`;
            g.fillRect(x + 1, y + 1, 30, 30);
          }
        }
        /* delicate embossed gold target spirals like the woman's golden mantle in The Kiss */
        g.strokeStyle = 'rgba(130, 90, 18, 0.35)';
        g.lineWidth = 2;
        for (let sy = 56; sy < 490; sy += 92) {
          for (let sx = 56; sx < 490; sx += 92) {
            for (let k = 1; k <= 3; k++) {
              g.beginPath(); g.arc(sx, sy, k * 12, 0, Math.PI * 2); g.stroke();
            }
          }
        }
        g.globalAlpha = 1;
      }
      /* progressive blooming of vibrant concentric circles & floral spots */
      const count = Math.round(Math.max(0, Math.min(1, circleAmt)) * clusters.length);
      for (let i = 0; i < count; i++) {
        const cl = clusters[i];
        g.fillStyle = cl.pal[0];
        g.beginPath(); g.arc(cl.x, cl.y, cl.rad, 0, Math.PI * 2); g.fill();
        g.strokeStyle = '#241a0d'; g.lineWidth = 2; g.stroke();
        g.fillStyle = cl.pal[1];
        g.beginPath(); g.arc(cl.x, cl.y, cl.rad * 0.68, 0, Math.PI * 2); g.fill();
        g.fillStyle = cl.pal[2];
        g.beginPath(); g.arc(cl.x, cl.y, cl.rad * 0.4, 0, Math.PI * 2); g.fill();
        g.fillStyle = cl.pal[3];
        g.beginPath(); g.arc(cl.x, cl.y, cl.rad * 0.16, 0, Math.PI * 2); g.fill();
      }
      t.needsUpdate = true;
    }
    paint(0, 0);
    return { tex: t, paint };
  }

  /* 10. Live man's robe texture: hammered gold -> crisp vertical black, white, silver & gold rectangles */
  function makeManRobe() {
    const c = document.createElement('canvas'); c.width = 512; c.height = 512;
    const g = c.getContext('2d');
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const r = rng(19081);
    const rects = [];
    const fills = ['#171513', '#f2ece0', '#c4c2be', '#171513', '#e5ba3e', '#f2ece0', '#1c1a17'];
    for (let i = 0; i < 86; i++) {
      const rw = 16 + Math.floor(r() * 30);
      const rh = 38 + Math.floor(r() * 88);
      rects.push({
        x: Math.floor(r() * (512 - rw)),
        y: Math.floor(r() * (512 - rh)),
        w: rw, h: rh, col: fills[i % fills.length],
        inner: r() < 0.48,
      });
    }
    let lastQ = -1;
    function paint(rectAmt) {
      const q = Math.round(Math.max(0, Math.min(1, rectAmt)) * 24);
      if (q === lastQ) return;
      lastQ = q;
      g.fillStyle = '#d4a635';
      g.fillRect(0, 0, 512, 512);
      /* delicate underlying gold spiral tendrils as in The Kiss */
      g.strokeStyle = 'rgba(118, 82, 16, 0.34)'; g.lineWidth = 2.5;
      for (let sy = 44; sy < 500; sy += 88) {
        for (let sx = 44; sx < 500; sx += 88) {
          g.beginPath(); g.arc(sx, sy, 22, 0, Math.PI * 1.7); g.stroke();
        }
      }
      const n = Math.round((q / 24) * rects.length);
      for (let i = 0; i < n; i++) {
        const b = rects[i];
        g.fillStyle = b.col;
        g.fillRect(b.x, b.y, b.w, b.h);
        g.strokeStyle = '#241b0c'; g.lineWidth = 2.2;
        g.strokeRect(b.x, b.y, b.w, b.h);
        if (b.inner) {
          g.fillStyle = b.col === '#171513' ? '#f0ca56' : '#171513';
          g.fillRect(b.x + 5, b.y + 8, Math.max(4, b.w - 10), Math.max(8, b.h * 0.36));
        }
      }
      t.needsUpdate = true;
    }
    paint(0.12);
    return { tex: t, paint };
  }

  /* 11. Floating Klimt ornament sprites (gold leaf, spiral, eye, circle, flower, rectangle) */
  function motifSprite(kind) {
    return mk(160, 160, (g, w, h) => {
      g.clearRect(0, 0, w, h);
      const cx = w / 2, cy = h / 2;
      /* soft warm glow behind every ornament */
      const gl = g.createRadialGradient(cx, cy, 8, cx, cy, 74);
      gl.addColorStop(0, kind === 'rect' ? 'rgba(255,244,205,0.65)' : 'rgba(255,220,96,0.75)');
      gl.addColorStop(1, 'rgba(255,210,80,0)');
      g.fillStyle = gl;
      g.beginPath(); g.arc(cx, cy, 74, 0, Math.PI * 2); g.fill();

      if (kind === 'gold') {
        g.save(); g.translate(cx, cy); g.rotate(0.18);
        const lg = g.createLinearGradient(-38, -38, 38, 38);
        lg.addColorStop(0, '#fff4b0'); lg.addColorStop(0.5, '#e8b738'); lg.addColorStop(1, '#c88c1e');
        g.fillStyle = lg; g.fillRect(-38, -38, 76, 76);
        g.strokeStyle = '#3c2708'; g.lineWidth = 4; g.strokeRect(-38, -38, 76, 76);
        g.strokeStyle = 'rgba(255,255,225,0.7)'; g.lineWidth = 2; g.strokeRect(-30, -30, 60, 60);
        g.restore();
      } else if (kind === 'spiral') {
        drawSpiral(g, cx, cy, 52, 1, 10, '#f3ca4d', '#241908');
      } else if (kind === 'eye') {
        g.fillStyle = '#f0c444'; g.strokeStyle = '#241908'; g.lineWidth = 4;
        g.beginPath(); g.moveTo(cx, 24); g.lineTo(132, 124); g.lineTo(28, 124); g.closePath(); g.fill(); g.stroke();
        g.fillStyle = '#f7f1df';
        g.beginPath(); g.moveTo(48, 92); g.quadraticCurveTo(cx, 62, 112, 92); g.quadraticCurveTo(cx, 118, 48, 92); g.fill(); g.stroke();
        g.fillStyle = '#1b3e82'; g.beginPath(); g.arc(cx, 91, 12, 0, Math.PI * 2); g.fill();
        g.fillStyle = '#ffe16e'; g.beginPath(); g.arc(cx - 3, 88, 4, 0, Math.PI * 2); g.fill();
      } else if (kind === 'circle') {
        const rings = [['#e34836', 48], ['#f3ca49', 36], ['#6c38a8', 25], ['#35a5c4', 15], ['#fff2b8', 7]];
        for (const [col, rad] of rings) {
          g.fillStyle = col; g.beginPath(); g.arc(cx, cy, rad, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#1e160c'; g.lineWidth = 2.5; g.stroke();
        }
      } else if (kind === 'flower') {
        const petals = ['#df4636', '#c83e88', '#3c74dc', '#924cc6', '#e86832', '#3aa27a'];
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2;
          g.fillStyle = petals[i];
          g.beginPath(); g.arc(cx + Math.cos(a) * 26, cy + Math.sin(a) * 26, 20, 0, Math.PI * 2); g.fill();
          g.strokeStyle = '#1f160c'; g.lineWidth = 2.5; g.stroke();
        }
        g.fillStyle = '#f6d250'; g.beginPath(); g.arc(cx, cy, 17, 0, Math.PI * 2); g.fill(); g.stroke();
        g.fillStyle = '#1f160c'; g.beginPath(); g.arc(cx, cy, 6, 0, Math.PI * 2); g.fill();
      } else {
        /* bold vertical Klimt rectangle block (black, white, silver, gold) */
        g.fillStyle = '#171512'; g.fillRect(cx - 28, cy - 52, 56, 104);
        g.strokeStyle = '#f4cb4e'; g.lineWidth = 4; g.strokeRect(cx - 28, cy - 52, 56, 104);
        g.fillStyle = '#f4efe2'; g.fillRect(cx - 19, cy - 40, 38, 28);
        g.fillStyle = '#e8bd3e'; g.fillRect(cx - 19, cy - 4, 38, 22);
        g.fillStyle = '#c4c2bc'; g.fillRect(cx - 19, cy + 24, 38, 18);
      }
    }).tex;
  }

  return {
    goldLeaf: goldLeaf.tex,
    ribbonFloor: ribbonFloor.tex,
    meadow: meadow.tex,
    flowerTuft: flowerTuft.tex,
    treeSpiral: treeSpiral.tex,
    stocletBird: stocletBird.tex,
    adeleEyes: adeleEyes.tex,
    adeleHalo: adeleHalo.tex,
    mosaic: mosaic.tex,
    makeWomanRobe,
    makeManRobe,
    sprites: {
      gold: motifSprite('gold'),
      spiral: motifSprite('spiral'),
      eye: motifSprite('eye'),
      circle: motifSprite('circle'),
      flower: motifSprite('flower'),
      rect: motifSprite('rect'),
    },
  };
}


