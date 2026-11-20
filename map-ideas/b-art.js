import { styleOf, projEurasia, EURASIA_W, EURASIA_H } from './shared.js';
import { hexAlpha, roundRectPath } from './a-art.js';

/* Subtle woodblock-indigo ocean wave pattern (seigaiha) on warm vellum-blue sea. */
export function makeOceanPattern(ctx) {
  const c = document.createElement('canvas');
  c.width = 64;
  c.height = 36;
  const g = c.getContext('2d');
  g.fillStyle = '#d3dfe2';
  g.fillRect(0, 0, 64, 36);
  g.strokeStyle = 'rgba(42, 74, 102, 0.11)';
  g.lineWidth = 1;
  const centers = [[0, 18], [32, 18], [64, 18], [16, 36], [48, 36], [16, 0], [48, 0]];
  for (const [cx, cy] of centers) {
    for (const r of [6, 11, 16]) {
      g.beginPath();
      g.arc(cx, cy, r, Math.PI, 0);
      g.stroke();
    }
  }
  return ctx.createPattern(c, 'repeat');
}

/* Draw fine 16-wind portolan rhumb lines and a calm ornamental compass rose. */
export function drawCompassRose(ctx, cx, cy, r, rayLen) {
  ctx.save();
  ctx.translate(cx, cy);

  /* Delicate rhumb lines radiating across the sea */
  for (let i = 0; i < 16; i++) {
    const a = (i * Math.PI) / 8;
    const major = i % 4 === 0;
    const mid = i % 2 === 0;
    ctx.strokeStyle = major
      ? 'rgba(138, 62, 42, 0.18)'
      : mid ? 'rgba(44, 72, 98, 0.14)' : 'rgba(68, 86, 102, 0.08)';
    ctx.lineWidth = major ? 1.1 : 0.75;
    ctx.beginPath();
    ctx.moveTo(Math.cos(a) * (r * 0.4), Math.sin(a) * (r * 0.4));
    ctx.lineTo(Math.cos(a) * rayLen, Math.sin(a) * rayLen);
    ctx.stroke();
  }

  /* Outer filigree rings */
  ctx.strokeStyle = 'rgba(66, 52, 34, 0.45)';
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke();
  ctx.beginPath(); ctx.arc(0, 0, r * 0.84, 0, Math.PI * 2); ctx.stroke();

  /* 8-point shaded star */
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 - Math.PI / 2;
    const len = i % 2 === 0 ? r * 0.96 : r * 0.66;
    const hw = i % 2 === 0 ? r * 0.18 : r * 0.12;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.lineTo(hw, hw); ctx.closePath();
    ctx.fillStyle = i === 0 ? '#b23b28' : '#35485b';
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(len, 0); ctx.lineTo(hw, -hw); ctx.closePath();
    ctx.fillStyle = '#efe5ce';
    ctx.fill();
    ctx.strokeStyle = 'rgba(44, 34, 24, 0.45)';
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  }

  ctx.fillStyle = '#d4a33b';
  ctx.beginPath(); ctx.arc(0, 0, r * 0.14, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

/* Antique calligraphic ocean & region labels on the Eurasian sheet. */
export function drawChartLabels(ctx) {
  ctx.save();
  ctx.textAlign = 'center';
  const labels = [
    ['A T L A N T I C', 190, 620, 22, -0.06],
    ['N O R T H   S E A', 495, 290, 15, 0],
    ['M A R E   M E D I T E R R A N E U M', 785, 805, 16, 0.08],
    ['T H E   S I L K   R O A D', 1355, 675, 17, -0.04],
    ['S E A   O F   J A P A N', 1865, 595, 15, -0.22],
    ['P A C I F I C   O C E A N', 2020, 960, 18, -0.08],
  ];
  for (const [text, x, y, sz, rot] of labels) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.font = `italic 500 ${sz}px "Iowan Old Style", Palatino, Georgia, serif`;
    ctx.fillStyle = 'rgba(46, 68, 88, 0.34)';
    ctx.fillText(text, 0, 0);
    ctx.restore();
  }
  ctx.restore();
}

/* Declutter overlapping medallions cleanly with short radial leader-lines.
   Keeps true city anchor [ax, ay] exact on the map while fanning medallions out smoothly. */
export function layoutAtlasStops(stops, zoomScale) {
  const nodes = stops.map((s, i) => {
    const [ax, ay] = projEurasia(s.at);
    return { i, stop: s, ax, ay, mx: ax, my: ay };
  });

  /* Desired minimum separation in world coordinates (generous at full Eurasia zoom) */
  const minSep = Math.max(52, 92 / Math.max(0.55, zoomScale));

  /* Deterministic small initial spread for identical/very close cities (e.g. Rome 1600/1761, Edo) */
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const dx = nodes[j].mx - nodes[i].mx;
      const dy = nodes[j].my - nodes[i].my;
      if (Math.hypot(dx, dy) < 8) {
        const ang = (i * 2.1 + j * 1.3) % (Math.PI * 2);
        nodes[i].mx -= Math.cos(ang) * 14;
        nodes[i].my -= Math.sin(ang) * 14;
        nodes[j].mx += Math.cos(ang) * 14;
        nodes[j].my += Math.sin(ang) * 14;
      }
    }
  }

  /* Gentle relaxation passes: push overlapping medallions apart, lightly tether to true city */
  for (let iter = 0; iter < 22; iter++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.mx - a.mx, dy = b.my - a.my;
        const dist = Math.hypot(dx, dy) || 0.01;
        if (dist < minSep) {
          const push = (minSep - dist) * 0.42;
          const ux = dx / dist, uy = dy / dist;
          a.mx -= ux * push; a.my -= uy * push;
          b.mx += ux * push; b.my += uy * push;
        }
      }
    }
    /* Gentle spring back toward true city anchor so cities stay recognisably placed */
    for (const n of nodes) {
      n.mx += (n.ax - n.mx) * 0.09;
      n.my += (n.ay - n.my) * 0.09;
    }
  }
  return nodes;
}

/* Quadratic Bezier point along curved sea/land itinerary leg between two anchors. */
export function legControlPoint(a, b) {
  const mx = (a.ax + b.ax) * 0.5;
  const my = (a.ay + b.ay) * 0.5;
  const dx = b.ax - a.ax, dy = b.ay - a.ay;
  const dist = Math.hypot(dx, dy);
  const arch = Math.min(95, dist * 0.18);
  const nx = -dy / (dist || 1), ny = dx / (dist || 1);
  /* Arch slightly northward on long east-west crossings */
  const sign = ny < 0 ? 1 : -1;
  return [mx + nx * arch * sign * 0.65, my + ny * arch * sign * 0.65];
}

export function evalQuad(ax, ay, cx, cy, bx, by, t) {
  const u = 1 - t;
  return [
    u * u * ax + 2 * u * t * cx + t * t * bx,
    u * u * ay + 2 * u * t * cy + t * t * by,
  ];
}

export { hexAlpha, roundRectPath, EURASIA_W, EURASIA_H };
