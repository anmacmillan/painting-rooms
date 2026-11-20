import { styleOf, projEurasia, EURASIA_W, EURASIA_H } from './shared.js';

/* Procedural warm washi paper grain tile (cached once, zero external assets). */
export function makePaperPattern(ctx) {
  const c = document.createElement('canvas');
  c.width = 180;
  c.height = 180;
  const g = c.getContext('2d');
  g.fillStyle = '#f3ecdc';
  g.fillRect(0, 0, 180, 180);
  /* Subtle laid-paper horizontal lines */
  g.strokeStyle = 'rgba(120, 96, 62, 0.045)';
  g.lineWidth = 1;
  for (let y = 0; y < 180; y += 6) {
    g.beginPath();
    g.moveTo(0, y + 0.5);
    g.lineTo(180, y + 0.5);
    g.stroke();
  }
  /* Soft organic pulp fibres */
  let seed = 1337;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  for (let i = 0; i < 240; i++) {
    const x = rnd() * 180, y = rnd() * 180, len = 3 + rnd() * 10, ang = (rnd() - 0.5) * 0.6;
    g.strokeStyle = rnd() > 0.5 ? 'rgba(135,108,72,0.06)' : 'rgba(255,252,244,0.14)';
    g.beginPath();
    g.moveTo(x, y);
    g.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len);
    g.stroke();
  }
  return ctx.createPattern(c, 'repeat');
}

/* Draw one era's painted backdrop band centred on sx (world X), height H. */
export function drawEraBackdrop(ctx, stop, sx, step, H, roadY, time) {
  const st = styleOf(stop);
  const horizonY = roadY - H * 0.04;

  ctx.save();
  /* Seamless feathered watercolour sky cloud (unclipped radial ellipse — zero seam) */
  ctx.save();
  ctx.translate(sx, horizonY - H * 0.21);
  ctx.scale(1.45, 0.85);
  const skyGrad = ctx.createRadialGradient(0, 0, step * 0.05, 0, 0, step * 0.62);
  skyGrad.addColorStop(0, hexAlpha(st.sky[0], 0.28));
  skyGrad.addColorStop(0.5, hexAlpha(st.sky[1], 0.16));
  skyGrad.addColorStop(1, hexAlpha(st.sky[1], 0));
  ctx.fillStyle = skyGrad;
  ctx.beginPath();
  ctx.arc(0, 0, step * 0.62, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Seamless soft ground pigment wash */
  ctx.save();
  ctx.translate(sx, roadY + 24);
  ctx.scale(1.5, 0.65);
  const gGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, step * 0.56);
  gGrad.addColorStop(0, hexAlpha(st.wash || st.ground, 0.26));
  gGrad.addColorStop(1, hexAlpha(st.wash || st.ground, 0));
  ctx.fillStyle = gGrad;
  ctx.beginPath();
  ctx.arc(0, 0, step * 0.56, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  /* Style-specific brushwork & calm architectural silhouette rising above the frame */
  drawEraMotif(ctx, st, sx, roadY - 120, step, time);
  ctx.restore();
}

export function hexAlpha(hex, a) {
  const h = (hex || '#888888').replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/* Signature artistic motif per era so the child visually reads each artistic style. */
function drawEraMotif(ctx, st, sx, hy, step, time) {
  ctx.save();
  ctx.translate(sx, hy);
  const ink = hexAlpha(st.ink, 0.28);
  const acc = hexAlpha(st.accent, 0.34);
  const land = st.land;

  if (land === 'parthenon') {
    /* Attic blue-marble pediment & Doric colonnade */
    ctx.fillStyle = 'rgba(46,110,166,0.16)';
    ctx.fillRect(-74, -68, 148, 56);
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-64, -52); ctx.lineTo(0, -76); ctx.lineTo(64, -52); ctx.closePath();
    ctx.stroke();
    for (let i = -54; i <= 54; i += 18) {
      ctx.beginPath(); ctx.moveTo(i, -52); ctx.lineTo(i, -12); ctx.stroke();
    }
    ctx.beginPath(); ctx.moveTo(-70, -12); ctx.lineTo(70, -12); ctx.stroke();
  } else if (land === 'vesuvius') {
    /* Smoking Vesuvius cone & Roman fresco arch */
    ctx.fillStyle = hexAlpha(st.ground, 0.22);
    ctx.beginPath();
    ctx.moveTo(-95, -4); ctx.lineTo(-18, -76); ctx.lineTo(6, -64); ctx.lineTo(24, -72); ctx.lineTo(96, -4);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(180,68,42,0.34)';
    ctx.lineWidth = 1.6;
    for (let k = 0; k < 3; k++) {
      const sway = Math.sin(time * 0.7 + k) * 6;
      ctx.beginPath();
      ctx.arc(4 + k * 14 + sway, -90 - k * 14, 10 + k * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
  } else if (land === 'ponte' || land === 'chapel' || land === 'dome') {
    /* Florentine Ponte Vecchio arches or Renaissance dome */
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.5;
    if (land === 'dome') {
      ctx.beginPath(); ctx.arc(0, -34, 42, Math.PI, 0); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, -76); ctx.lineTo(0, -90); ctx.stroke();
    } else {
      for (let i = -56; i <= 56; i += 38) {
        ctx.beginPath(); ctx.arc(i, -10, 18, Math.PI, 0); ctx.stroke();
      }
      ctx.strokeRect(-72, -46, 144, 18);
    }
    /* Gold tempera star flecks */
    ctx.fillStyle = acc;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath(); ctx.arc(k * 28, -82 - (k % 2) * 14, 2.2, 0, Math.PI * 2); ctx.fill();
    }
  } else if (land === 'lantern') {
    /* Caravaggio chiaroscuro diagonal beam of golden light */
    const beam = ctx.createLinearGradient(-70, -110, 45, 20);
    beam.addColorStop(0, 'rgba(246,195,95,0.28)');
    beam.addColorStop(1, 'rgba(246,195,95,0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(-78, -112); ctx.lineTo(-28, -112); ctx.lineTo(58, 12); ctx.lineTo(-14, 12);
    ctx.closePath(); ctx.fill();
  } else if (land === 'antwerp' || land === 'delft' || land === 'tudor') {
    /* Stepped gables & slender Gothic cathedral spire */
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(-58, -8); ctx.lineTo(-58, -36); ctx.lineTo(-42, -52); ctx.lineTo(-26, -36); ctx.lineTo(-26, -8);
    ctx.moveTo(-8, -8); ctx.lineTo(0, -88); ctx.lineTo(8, -8);
    ctx.moveTo(22, -8); ctx.lineTo(22, -42); ctx.lineTo(38, -56); ctx.lineTo(54, -42); ctx.lineTo(54, -8);
    ctx.stroke();
  } else {
    drawEraMotifPart2(ctx, st, land, ink, acc, time);
  }
  ctx.restore();
}

function drawEraMotifPart2(ctx, st, land, ink, acc, time) {
  if (land === 'carceri' || land === 'engraving') {
    /* Piranesi / Hogarth etched crosshatching & vaulted arches */
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1;
    for (let i = -72; i <= 72; i += 9) {
      ctx.beginPath(); ctx.moveTo(i - 18, -90); ctx.lineTo(i + 24, -10); ctx.stroke();
    }
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(0, -18, 48, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, -18, 30, Math.PI, 0); ctx.stroke();
  } else if (land === 'fuji_wave' || land === 'torii_night') {
    /* Ukiyo-e Prussian blue seigaiha waves + Mt Fuji or vermilion Torii gate */
    ctx.strokeStyle = 'rgba(34, 75, 120, 0.28)';
    ctx.lineWidth = 1.2;
    for (let wx = -78; wx <= 78; wx += 26) {
      for (let r = 6; r <= 14; r += 4) {
        ctx.beginPath(); ctx.arc(wx, -6, r, Math.PI, 0); ctx.stroke();
      }
    }
    if (land === 'fuji_wave') {
      ctx.fillStyle = 'rgba(34,75,120,0.22)';
      ctx.beginPath(); ctx.moveTo(-76, -14); ctx.quadraticCurveTo(-24, -40, -10, -78);
      ctx.lineTo(10, -78); ctx.quadraticCurveTo(24, -40, 76, -14); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(255,252,245,0.75)';
      ctx.beginPath(); ctx.moveTo(-19, -58); ctx.lineTo(-10, -78); ctx.lineTo(10, -78); ctx.lineTo(19, -58);
      ctx.lineTo(8, -64); ctx.lineTo(0, -56); ctx.lineTo(-8, -64); ctx.closePath(); ctx.fill();
    } else {
      ctx.strokeStyle = 'rgba(212,61,42,0.48)';
      ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(-46, -64); ctx.quadraticCurveTo(0, -56, 46, -64);
      ctx.moveTo(-36, -50); ctx.lineTo(36, -50);
      ctx.moveTo(-24, -60); ctx.lineTo(-28, -10);
      ctx.moveTo(24, -60); ctx.lineTo(28, -10);
      ctx.stroke();
    }
  } else if (land === 'viaduct') {
    /* Turner diagonal golden rain & Maidenhead viaduct */
    ctx.strokeStyle = 'rgba(218, 148, 52, 0.24)';
    ctx.lineWidth = 1.1;
    for (let i = -80; i <= 80; i += 14) {
      ctx.beginPath(); ctx.moveTo(i + 24, -102); ctx.lineTo(i - 16, -8); ctx.stroke();
    }
    ctx.strokeStyle = ink;
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(-78, -38); ctx.lineTo(78, -38); ctx.stroke();
    ctx.beginPath(); ctx.arc(-34, -10, 28, Math.PI, 0); ctx.stroke();
    ctx.beginPath(); ctx.arc(34, -10, 28, Math.PI, 0); ctx.stroke();
  } else if (land === 'wonderland') {
    /* Tenniel Victorian monochrome pen-and-ink crosshatch & chessboard horizon */
    ctx.strokeStyle = 'rgba(28,26,24,0.24)';
    ctx.lineWidth = 1;
    for (let i = -66; i <= 66; i += 12) {
      ctx.beginPath(); ctx.moveTo(i, -84); ctx.lineTo(i - 12, -52); ctx.stroke();
    }
    for (let r = 0; r < 2; r++) {
      for (let c = -3; c < 3; c++) {
        if ((r + c + 10) % 2 === 0) {
          ctx.fillStyle = 'rgba(28,26,24,0.12)';
          ctx.fillRect(c * 22, -26 + r * 10, 22, 10);
        }
      }
    }
  } else if (land === 'seine') {
    /* Monet broken horizontal Impressionist pastel dabs */
    const cols = ['rgba(130,184,217,0.34)', 'rgba(242,190,150,0.32)', 'rgba(92,147,140,0.30)', 'rgba(230,120,85,0.22)'];
    for (let k = 0; k < 22; k++) {
      const rx = ((k * 37) % 140) - 70;
      const ry = -16 - ((k * 23) % 68);
      ctx.fillStyle = cols[k % cols.length];
      ctx.beginPath();
      ctx.ellipse(rx + Math.sin(time * 0.8 + k) * 2, ry, 13, 3.2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (land === 'lanterns') {
    /* Sargent twilight glowing paper lanterns */
    const spots = [[-52, -52], [-18, -72], [22, -56], [56, -68], [0, -34]];
    for (let i = 0; i < spots.length; i++) {
      const [lx, ly] = spots[i];
      const pulse = 0.85 + 0.15 * Math.sin(time * 1.4 + i * 1.3);
      const rg = ctx.createRadialGradient(lx, ly, 1, lx, ly, 18 * pulse);
      rg.addColorStop(0, 'rgba(255, 198, 102, 0.55)');
      rg.addColorStop(1, 'rgba(247, 164, 64, 0)');
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(lx, ly, 18 * pulse, 0, Math.PI * 2); ctx.fill();
    }
  } else if (land === 'cypress') {
    /* Van Gogh swirling cobalt stars & flame cypress */
    ctx.strokeStyle = 'rgba(30, 74, 150, 0.28)';
    ctx.lineWidth = 1.6;
    for (const [cx, cy, r] of [[-46, -68, 16], [38, -74, 19], [2, -54, 12]]) {
      ctx.beginPath(); ctx.arc(cx, cy, r, time * 0.2, time * 0.2 + Math.PI * 1.5); ctx.stroke();
      ctx.fillStyle = 'rgba(244, 200, 66, 0.52)';
      ctx.beginPath(); ctx.arc(cx, cy, 4.2, 0, Math.PI * 2); ctx.fill();
    }
    ctx.fillStyle = 'rgba(28, 56, 48, 0.28)';
    ctx.beginPath();
    ctx.moveTo(-12, -8); ctx.quadraticCurveTo(-18, -44, -2, -84);
    ctx.quadraticCurveTo(14, -44, 8, -8); ctx.closePath(); ctx.fill();
  } else if (land === 'fjord') {
    /* Munch undulating crimson-orange sky ribbons */
    for (let k = 0; k < 4; k++) {
      ctx.strokeStyle = k % 2 ? 'rgba(201, 76, 46, 0.30)' : 'rgba(240, 166, 77, 0.30)';
      ctx.lineWidth = 4.2;
      ctx.beginPath();
      const y0 = -82 + k * 14;
      ctx.moveTo(-84, y0);
      ctx.bezierCurveTo(-30, y0 - 14, 28, y0 + 16, 84, y0 - 4);
      ctx.stroke();
    }
  } else if (land === 'secession') {
    /* Klimt gold-leaf mosaic rectangles & spiral flourishes */
    for (let k = 0; k < 14; k++) {
      const gx = ((k * 41) % 136) - 68;
      const gy = -22 - ((k * 29) % 66);
      ctx.fillStyle = k % 3 === 0 ? 'rgba(235, 195, 72, 0.34)' : 'rgba(195, 150, 48, 0.22)';
      ctx.fillRect(gx, gy, 10 + (k % 3) * 5, 10 + ((k + 1) % 3) * 5);
    }
    ctx.strokeStyle = 'rgba(176, 131, 40, 0.34)';
    ctx.lineWidth = 1.2;
    for (const [cx, cy] of [[-40, -64], [44, -58]]) {
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 3.5; a += 0.3) {
        const rr = 2 + a * 1.4;
        const px = cx + Math.cos(a) * rr, py = cy + Math.sin(a) * rr;
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }
  } else {
    /* Soft botanical / jungle arches fallback */
    ctx.fillStyle = 'rgba(42, 92, 70, 0.22)';
    for (let i = -3; i <= 3; i++) {
      ctx.beginPath();
      ctx.ellipse(i * 22, -26 - Math.abs(i) * 5, 10, 26, i * 0.25, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

/* Hand-drawn little cloak-and-straw-hat traveller walking along the scroll path. */
export function drawTraveller(ctx, x, y, facing, walkPhase, walking) {
  ctx.save();
  ctx.translate(x, y);
  const bob = walking ? Math.abs(Math.sin(walkPhase)) * 4.5 : Math.sin(walkPhase * 0.35) * 1.1;
  const stride = walking ? Math.sin(walkPhase) * 6 : 0;

  /* Soft ink ground shadow */
  ctx.fillStyle = 'rgba(38, 28, 18, 0.22)';
  ctx.beginPath(); ctx.ellipse(0, 3, 13, 4.5, 0, 0, Math.PI * 2); ctx.fill();

  ctx.translate(0, -bob);
  ctx.scale(facing < 0 ? -1 : 1, 1);

  /* Little boots */
  ctx.strokeStyle = '#2d2218';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-3, -6); ctx.lineTo(-3 - stride, 1);
  ctx.moveTo(3, -6); ctx.lineTo(3 + stride, 1);
  ctx.stroke();

  /* Crimson-terracotta traveller cloak */
  ctx.fillStyle = '#9e3326';
  ctx.strokeStyle = '#2c1d16';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(-10, -4);
  ctx.quadraticCurveTo(-11, -18, -4, -27);
  ctx.lineTo(5, -27);
  ctx.quadraticCurveTo(11, -18, 10, -4);
  ctx.closePath();
  ctx.fill(); ctx.stroke();

  /* Small wooden sketchbook satchel */
  ctx.fillStyle = '#d4a84f';
  ctx.fillRect(3, -16, 6, 7);
  ctx.strokeRect(3, -16, 6, 7);

  /* Head */
  ctx.fillStyle = '#f4d9be';
  ctx.beginPath(); ctx.arc(0.5, -31, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

  /* Straw sun-hat with indigo ribbon */
  ctx.fillStyle = '#e8c776';
  ctx.beginPath(); ctx.ellipse(0.5, -35.5, 11.5, 3.6, -0.08, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.arc(0.5, -36.5, 5.8, Math.PI, 0); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = '#2a4566';
  ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-5, -36); ctx.lineTo(6, -36); ctx.stroke();

  ctx.restore();
}

/* Quiet corner Eurasia locator (shows geographic place while walking through time). */
export function drawEurasiaInset(ctx, landPath, stops, activeIdx, x, y, w, h, time) {
  if (!landPath) return;
  ctx.save();
  ctx.translate(x, y);

  /* Framed parchment box */
  ctx.fillStyle = 'rgba(245, 239, 224, 0.90)';
  ctx.strokeStyle = 'rgba(72, 56, 36, 0.38)';
  ctx.lineWidth = 1.2;
  roundRectPath(ctx, 0, 0, w, h, 8);
  ctx.fill(); ctx.stroke();

  /* Soft sea tint */
  ctx.save();
  roundRectPath(ctx, 3, 3, w - 6, h - 6, 6);
  ctx.clip();
  ctx.fillStyle = '#dbe5e9';
  ctx.fillRect(3, 3, w - 6, h - 6);

  /* Transform eurasia.json coordinates into inset box */
  const sx = (w - 10) / EURASIA_W;
  const sy = (h - 14) / EURASIA_H;
  const sc = Math.min(sx, sy);
  const ox = (w - EURASIA_W * sc) * 0.5;
  const oy = (h - EURASIA_H * sc) * 0.5 + 3;

  ctx.save();
  ctx.translate(ox, oy);
  ctx.scale(sc, sc);
  ctx.fillStyle = '#e7ddc2';
  ctx.strokeStyle = 'rgba(62, 50, 36, 0.55)';
  ctx.lineWidth = 1 / sc;
  ctx.fill(landPath);
  ctx.stroke(landPath);

  /* Subtle dotted trail between stops */
  ctx.strokeStyle = 'rgba(166, 114, 42, 0.42)';
  ctx.lineWidth = 1.2 / sc;
  ctx.setLineDash([4 / sc, 4 / sc]);
  ctx.beginPath();
  stops.forEach((s, i) => {
    const [px, py] = projEurasia(s.at);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  });
  ctx.stroke();
  ctx.setLineDash([]);

  /* All stop dots */
  stops.forEach((s, i) => {
    const [px, py] = projEurasia(s.at);
    ctx.fillStyle = i === activeIdx ? '#c63b28' : 'rgba(56, 46, 36, 0.48)';
    ctx.beginPath();
    ctx.arc(px, py, (i === activeIdx ? 4.4 : 2.1) / sc, 0, Math.PI * 2);
    ctx.fill();
  });

  /* Pulsing compass ring on active stop */
  const cur = stops[activeIdx];
  if (cur) {
    const [ax, ay] = projEurasia(cur.at);
    const pulse = 6.5 + Math.sin(time * 2.8) * 2.2;
    ctx.strokeStyle = 'rgba(198, 59, 40, 0.72)';
    ctx.lineWidth = 1.5 / sc;
    ctx.beginPath();
    ctx.arc(ax, ay, pulse / sc, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.restore();
  ctx.restore();

  /* Tiny caption */
  ctx.fillStyle = 'rgba(48, 38, 28, 0.76)';
  ctx.font = 'italic 10px "Iowan Old Style", Palatino, Georgia, serif';
  ctx.textAlign = 'left';
  ctx.fillText(cur ? `${cur.place} · ${cur.year}` : 'Atlantic to Edo', 8, 13);
  ctx.restore();
}

export function roundRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

