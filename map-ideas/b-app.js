import {
  LEVELS, loadScores, getStops, getStoredAt, setStoredAt,
  styleOf, preloadThumbnails
} from './shared.js';
import { drawTraveller } from './a-art.js';
import {
  makeOceanPattern, drawCompassRose, drawChartLabels, layoutAtlasStops,
  legControlPoint, evalQuad, hexAlpha, EURASIA_W, EURASIA_H
} from './b-art.js';

const canvas = document.getElementById('atlas');
const ctx = canvas.getContext('2d');

let include21 = false;
let stops = getStops(false);
let scores = loadScores();
let thumbs = preloadThumbnails(stops);
let landPath = null;
let oceanPat = null;

fetch('./eurasia.json').then(r => r.json()).then(d => {
  landPath = new Path2D(d.land);
}).catch(() => {});

function findNextUnplayed() {
  const idx = stops.findIndex(s => !s.preview && !(scores[s.key] && scores[s.key].runs));
  return idx >= 0 ? idx : 0;
}

const storedReal = getStoredAt();
let targetIdx = storedReal >= 0 && storedReal < stops.length ? storedReal : findNextUnplayed();
let walkerS = targetIdx;
let walkerFacing = 1;
let walkPhase = 0;

let W = window.innerWidth, H = window.innerHeight, DPR = Math.min(2, window.devicePixelRatio || 1);
let viewMode = 'follow';       /* 'follow' | 'europe' | 'eurasia' | 'free' */
let cam = { x: 640, y: 540, scale: 1.15 };
let camGoal = { x: 640, y: 540, scale: 1.15 };
let drag = null;
let ripples = [];
let nodes = layoutAtlasStops(stops, cam.scale);
let lastLayoutScale = cam.scale;

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  recomputeCameraGoal(true);
}
window.addEventListener('resize', resize);

function worldToScreen(wx, wy) {
  return [(wx - cam.x) * cam.scale + W * 0.5, (wy - cam.y) * cam.scale + H * 0.46];
}
function screenToWorld(sx, sy) {
  return [(sx - W * 0.5) / cam.scale + cam.x, (sy - H * 0.46) / cam.scale + cam.y];
}

function setViewButtons() {
  document.getElementById('vFollow').classList.toggle('on', viewMode === 'follow');
  document.getElementById('vEurope').classList.toggle('on', viewMode === 'europe');
  document.getElementById('vEurasia').classList.toggle('on', viewMode === 'eurasia');
}

function recomputeCameraGoal(snap = false) {
  const fitAll = Math.min((W - 40) / EURASIA_W, (H - 170) / EURASIA_H);
  if (viewMode === 'eurasia') {
    camGoal = { x: EURASIA_W * 0.5, y: EURASIA_H * 0.50, scale: Math.max(0.32, fitAll) };
  } else if (viewMode === 'europe') {
    const euScale = Math.min(W / 1020, (H - 160) / 760);
    camGoal = { x: 670, y: 525, scale: Math.max(0.68, Math.min(1.55, euScale)) };
  } else if (viewMode === 'follow') {
    const n = nodes[targetIdx] || nodes[0];
    if (n) {
      /* Gently zoom closer in dense England/Low Countries/Rome clusters */
      const dense = n.ax < 920 && n.ay > 280 && n.ay < 760;
      const baseScale = W < 760 ? 0.96 : (dense ? 1.32 : 1.04);
      camGoal = { x: n.ax, y: n.ay + 22, scale: baseScale };
    }
  }
  if (snap) cam = { ...camGoal };
  setViewButtons();
}

function spawnRipple(wx, wy) {
  ripples.push({ x: wx, y: wy, r: 10, alpha: 0.9 });
}

function updateHUD() {
  scores = loadScores();
  let totalPts = 0, gotPaint = 0, ofPaint = 0, agesDone = 0;
  for (const l of LEVELS) {
    const sc = scores[l.key];
    ofPaint += l.paintings || 0;
    if (sc) {
      totalPts += sc.best || 0;
      gotPaint += sc.paintings || 0;
      if (sc.runs) agesDone++;
    }
  }
  document.getElementById('hPts').textContent = totalPts;
  document.getElementById('hPaint').textContent = gotPaint;
  document.getElementById('hPaintOf').textContent = ofPaint;
  document.getElementById('hAges').textContent = agesDone;
  document.getElementById('hAgesOf').textContent = LEVELS.length;
}

function buildEraBar() {
  const bar = document.getElementById('eraBar');
  bar.textContent = '';
  stops.forEach((s, i) => {
    const b = document.createElement('button');
    const done = !s.preview && !!(scores[s.key] && scores[s.key].runs);
    b.className = 'era-chip' + (done ? ' done' : '') + (i === targetIdx ? ' active' : '') + (s.preview ? ' preview' : '');
    b.textContent = `${s.year} ${s.place}`;
    b.addEventListener('click', () => walkTo(i));
    bar.appendChild(b);
    if (i === targetIdx) {
      requestAnimationFrame(() => b.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' }));
    }
  });
}

function updateDock() {
  const s = stops[targetIdx];
  if (!s) return;
  const sc = !s.preview ? scores[s.key] : null;
  const done = !!(sc && sc.runs);
  const st = styleOf(s);
  const th = document.getElementById('dThumb');
  th.className = 'thumb' + (done ? ' done' : '');
  if (s.img) {
    th.style.backgroundImage = `url("../${s.img}")`;
    th.style.filter = done ? 'none' : 'grayscale(55%) sepia(24%)';
  } else {
    th.style.backgroundImage = 'none';
    th.style.background = `linear-gradient(135deg, ${st.sky[0]}, ${st.accent})`;
    th.style.filter = 'none';
  }
  document.getElementById('dEra').textContent = `${st.era}${s.japan ? ' · Japan' : ''}`;
  document.getElementById('dTitle').textContent = `${s.place}, ${s.year}`;
  document.getElementById('dSub').textContent = `${s.title} · after ${s.by}`;

  const prog = document.getElementById('dProg');
  if (s.preview) {
    prog.textContent = `Forthcoming stop · ${s.paintings} paintings planned (${s.coin})`;
  } else if (done) {
    const got = sc.paintings || 0, of = s.paintings || 3;
    const stars = '★'.repeat(got) + '☆'.repeat(Math.max(0, of - got));
    prog.innerHTML = `<span class="stars">${stars}</span> ${got} of ${of} paintings · ${sc.best || 0} pts`;
  } else {
    prog.textContent = `${s.paintings} paintings to find · ${s.coin}`;
  }

  const go = document.getElementById('btnGo');
  const soon = document.getElementById('btnSoon');
  if (s.preview) {
    go.style.display = 'none';
    soon.style.display = 'inline-flex';
  } else {
    go.style.display = 'inline-flex';
    soon.style.display = 'none';
    go.href = '../' + s.href;
    go.textContent = done ? 'Visit again ▶' : 'Step in ▶';
  }
  buildEraBar();
}

function walkTo(idx) {
  const clamped = Math.max(0, Math.min(stops.length - 1, idx));
  const fromN = nodes[Math.round(walkerS)];
  const toN = nodes[clamped];
  if (fromN && toN && toN.ax !== fromN.ax) walkerFacing = toN.ax > fromN.ax ? 1 : -1;
  targetIdx = clamped;
  if (viewMode === 'free') viewMode = 'follow';
  const s = stops[targetIdx];
  if (s && s.realIdx >= 0) setStoredAt(s.realIdx);
  recomputeCameraGoal(false);
  updateDock();
}
/* Compute traveller world position along the chronological curved itinerary. */
function walkerWorldPos() {
  const maxI = nodes.length - 1;
  const clamped = Math.max(0, Math.min(maxI, walkerS));
  const i0 = Math.floor(clamped);
  const i1 = Math.min(maxI, i0 + 1);
  const frac = clamped - i0;
  const a = nodes[i0], b = nodes[i1];
  if (!a || !b || i0 === i1) return a ? [a.ax, a.ay] : [640, 540];
  const [cx, cy] = legControlPoint(a, b);
  return evalQuad(a.ax, a.ay, cx, cy, b.ax, b.ay, frac);
}

/* Draw one illuminated medallion at its decluttered position (mx, my) linked to city (ax, ay). */
function drawMedallion(n, nextUn, time) {
  const s = n.stop;
  const sc = !s.preview ? scores[s.key] : null;
  const done = !!(sc && sc.runs);
  const isTarget = n.i === targetIdx;
  const isNext = n.i === nextUn && !done;
  const st = styleOf(s);

  const [sx, sy] = worldToScreen(n.mx, n.my);
  const [ax, ay] = worldToScreen(n.ax, n.ay);
  if (sx < -90 || sx > W + 90 || sy < -90 || sy > H + 90) return;

  const r = isTarget ? 27 : (cam.scale < 0.65 ? 16 : 21);

  ctx.save();
  /* Leader line if medallion fanned out from true city coordinate */
  const leadDist = Math.hypot(sx - ax, sy - ay);
  if (leadDist > 6) {
    ctx.strokeStyle = isTarget ? 'rgba(178, 59, 40, 0.72)' : 'rgba(64, 52, 36, 0.44)';
    ctx.lineWidth = isTarget ? 1.8 : 1.2;
    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(sx, sy);
    ctx.stroke();

    /* Exact city dot on the coastline/land */
    ctx.fillStyle = done ? '#c89632' : (isTarget ? '#b23b28' : '#3a3025');
    ctx.beginPath(); ctx.arc(ax, ay, 3.6, 0, Math.PI * 2); ctx.fill();
  }

  /* Subtle warm aura on completed or selected stop */
  if (done || isTarget) {
    const rg = ctx.createRadialGradient(sx, sy, r * 0.5, sx, sy, r * 1.9);
    rg.addColorStop(0, done ? 'rgba(242, 204, 110, 0.42)' : hexAlpha(st.accent, 0.30));
    rg.addColorStop(1, 'rgba(242, 204, 110, 0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(sx, sy, r * 1.9, 0, Math.PI * 2); ctx.fill();
  }

  if (isNext) {
    const pulse = r + 5 + Math.sin(time * 2.8) * 3;
    ctx.strokeStyle = 'rgba(178, 59, 40, 0.58)';
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(sx, sy, pulse, 0, Math.PI * 2); ctx.stroke();
  }

  /* Shadow + outer gilded / sepia ring */
  ctx.fillStyle = 'rgba(22, 24, 30, 0.22)';
  ctx.beginPath(); ctx.arc(sx + 1.5, sy + 3, r + 2.5, 0, Math.PI * 2); ctx.fill();

  ctx.fillStyle = done ? '#f8ecd0' : '#efe6d2';
  ctx.strokeStyle = isTarget ? '#b23b28' : (done ? '#c28c24' : 'rgba(64, 52, 36, 0.58)');
  ctx.lineWidth = isTarget ? 2.8 : (done ? 2.4 : 1.5);
  if (s.preview) ctx.setLineDash([4, 3]);
  ctx.beginPath(); ctx.arc(sx, sy, r + 2.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);

  /* Circular painting vignette */
  ctx.save();
  ctx.beginPath(); ctx.arc(sx, sy, r - 1, 0, Math.PI * 2); ctx.clip();
  const im = thumbs.get(s.key);
  if (im && im.complete && im.naturalWidth > 0) {
    const scFit = Math.max((r * 2) / im.naturalWidth, (r * 2) / im.naturalHeight);
    const dw = im.naturalWidth * scFit, dh = im.naturalHeight * scFit;
    ctx.filter = done ? 'none' : (isTarget ? 'saturate(0.8) sepia(0.14)' : 'grayscale(0.84) sepia(0.32)');
    ctx.drawImage(im, sx - dw * 0.5, sy - dh * 0.5, dw, dh);
    ctx.filter = 'none';
  } else {
    const g = ctx.createLinearGradient(sx, sy - r, sx, sy + r);
    g.addColorStop(0, st.sky[0]); g.addColorStop(1, st.accent);
    ctx.fillStyle = g;
    ctx.fillRect(sx - r, sy - r, r * 2, r * 2);
    ctx.fillStyle = '#fff5df';
    ctx.font = 'italic 11px "Iowan Old Style", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(s.japan ? '江戸' : s.place.slice(0, 3), sx, sy + 4);
  }
  ctx.restore();

  /* Completion compass star / vermilion badge */
  if (done) {
    const bx = sx + r * 0.72, by = sy - r * 0.72;
    ctx.fillStyle = '#b23b28';
    ctx.strokeStyle = '#f8ecd0';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(bx, by, 8.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#ffe596';
    ctx.font = '700 10px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('★', bx, by + 3.5);
  }

  /* Crisp calligraphic place + year pill underneath (shown when zoomed in or selected) */
  if (cam.scale >= 0.72 || isTarget || s.japan) {
    const label = `${s.place} ${s.year}`;
    ctx.font = (isTarget ? '600 12px' : '600 10.5px') + ' "Iowan Old Style", Palatino, Georgia, serif';
    const tw = ctx.measureText(label).width;
    const ly = sy + r + 14;
    ctx.fillStyle = isTarget ? 'rgba(34, 46, 58, 0.90)' : 'rgba(246, 240, 226, 0.86)';
    ctx.beginPath();
    ctx.roundRect(sx - tw * 0.5 - 6, ly - 10, tw + 12, 15, 7);
    ctx.fill();
    ctx.fillStyle = isTarget ? '#fff4d8' : '#2a2219';
    ctx.textAlign = 'center';
    ctx.fillText(label, sx, ly + 1);
  }
  ctx.restore();
}

let lastT = performance.now();
function render(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  const time = now * 0.001;

  /* Smooth traveller motion along itinerary legs */
  const diff = targetIdx - walkerS;
  const walking = Math.abs(diff) > 0.008;
  if (walking) {
    const dir = Math.sign(diff);
    const speed = Math.min(3.5, 1.35 + Math.abs(diff) * 0.8);
    const step = dir * speed * dt;
    if (Math.abs(step) >= Math.abs(diff)) {
      walkerS = targetIdx;
      const n = nodes[targetIdx];
      if (n && !n.stop.preview && scores[n.stop.key] && scores[n.stop.key].runs) {
        spawnRipple(n.ax, n.ay);
      }
    } else {
      walkerS += step;
    }
    walkPhase += dt * 11;
  } else {
    walkPhase += dt * 2;
  }

  /* Smooth camera interpolation */
  if (viewMode === 'follow' && walking) {
    const [wx, wy] = walkerWorldPos();
    camGoal.x = wx;
    camGoal.y = wy + 18;
  }
  if (viewMode !== 'free') {
    const k = Math.min(1, dt * 5.5);
    cam.x += (camGoal.x - cam.x) * k;
    cam.y += (camGoal.y - cam.y) * k;
    cam.scale += (camGoal.scale - cam.scale) * k;
  }

  /* Recompute gentle declutter layout when zoom changes meaningfully */
  if (Math.abs(cam.scale - lastLayoutScale) > 0.06) {
    nodes = layoutAtlasStops(stops, cam.scale);
    lastLayoutScale = cam.scale;
  }

  /* Update golden completion ripples */
  for (let i = ripples.length - 1; i >= 0; i--) {
    ripples[i].r += 65 * dt;
    ripples[i].alpha -= 0.72 * dt;
    if (ripples[i].alpha <= 0) ripples.splice(i, 1);
  }

  ctx.save();
  ctx.scale(DPR, DPR);

  /* 1. Woodblock-wave ocean sea background */
  if (!oceanPat) oceanPat = makeOceanPattern(ctx);
  ctx.fillStyle = oceanPat;
  ctx.fillRect(0, 0, W, H);

  /* Subtle era ambient atmospheric wash at top of chart */
  const curStop = stops[targetIdx];
  if (curStop) {
    const st = styleOf(curStop);
    const ag = ctx.createRadialGradient(W * 0.5, H * 0.35, 30, W * 0.5, H * 0.4, Math.max(W, H) * 0.7);
    ag.addColorStop(0, hexAlpha(st.sky[1], 0.14));
    ag.addColorStop(1, 'rgba(211, 223, 226, 0)');
    ctx.fillStyle = ag;
    ctx.fillRect(0, 0, W, H);
  }

  /* 2. World-space chart (rhumb lines, coastlines, labels, route) */
  ctx.save();
  ctx.translate(W * 0.5, H * 0.46);
  ctx.scale(cam.scale, cam.scale);
  ctx.translate(-cam.x, -cam.y);

  /* Twin portolan compass roses (Mediterranean & Honshu) */
  drawCompassRose(ctx, 795, 812, 46, 1300);
  drawCompassRose(ctx, 1985, 885, 44, 1100);

  /* Eurasia landmass with soft coastal halo & warm vellum fill */
  if (landPath) {
    ctx.save();
    ctx.strokeStyle = 'rgba(72, 110, 132, 0.28)';
    ctx.lineWidth = 10 / cam.scale;
    ctx.lineJoin = 'round';
    ctx.stroke(landPath);
    ctx.fillStyle = '#efe6cf';
    ctx.fill(landPath);
    ctx.strokeStyle = 'rgba(66, 52, 34, 0.62)';
    ctx.lineWidth = 1.6 / cam.scale;
    ctx.stroke(landPath);
    ctx.restore();
  }

  /* Antique copperplate neatline framing the Eurasia chart sheet */
  ctx.strokeStyle = 'rgba(66, 52, 34, 0.42)';
  ctx.lineWidth = 2.4 / cam.scale;
  ctx.strokeRect(0, 0, EURASIA_W, EURASIA_H);

  drawChartLabels(ctx);

  /* Curved chronological itinerary legs */
  for (let i = 0; i < nodes.length - 1; i++) {
    const a = nodes[i], b = nodes[i + 1];
    const [cx, cy] = legControlPoint(a, b);
    const doneLeg = !a.stop.preview && scores[a.stop.key] && scores[a.stop.key].runs;
    ctx.save();
    ctx.strokeStyle = doneLeg ? 'rgba(196, 142, 36, 0.85)' : 'rgba(68, 56, 44, 0.38)';
    ctx.lineWidth = (doneLeg ? 2.6 : 1.7) / Math.sqrt(cam.scale);
    ctx.setLineDash(doneLeg ? [] : [7 / cam.scale, 6 / cam.scale]);
    ctx.beginPath();
    ctx.moveTo(a.ax, a.ay);
    ctx.quadraticCurveTo(cx, cy, b.ax, b.ay);
    ctx.stroke();
    ctx.restore();
  }

  /* Completion golden ripples */
  for (const rp of ripples) {
    ctx.strokeStyle = `rgba(214, 158, 42, ${rp.alpha})`;
    ctx.lineWidth = 2.4 / cam.scale;
    ctx.beginPath(); ctx.arc(rp.x, rp.y, rp.r, 0, Math.PI * 2); ctx.stroke();
  }

  ctx.restore(); /* end world space */

  /* 3. Medallions in crisp screen-space (non-target first, active stop on top) */
  const nextUn = findNextUnplayed();
  for (const n of nodes) {
    if (n.i !== targetIdx) drawMedallion(n, nextUn, time);
  }
  if (nodes[targetIdx]) drawMedallion(nodes[targetIdx], nextUn, time);

  /* 4. Traveller walking between cities (steps neatly beside the active portrait when arrived) */
  const [twx, twy] = walkerWorldPos();
  const [tsx, tsy] = worldToScreen(twx, twy);
  const standOffX = walking ? 0 : -34;
  const standOffY = walking ? 4 : 14;
  drawTraveller(ctx, tsx + standOffX, tsy + standOffY, walkerFacing, walkPhase, walking);

  ctx.restore();
  requestAnimationFrame(render);
}

/* Pointer pan & tap-to-walk */
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
  drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, cx0: cam.x, cy0: cam.y, moved: false };
});
canvas.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
  if (Math.hypot(dx, dy) > 6) { drag.moved = true; viewMode = 'free'; setViewButtons(); }
  if (drag.moved) {
    cam.x = Math.max(-100, Math.min(EURASIA_W + 100, drag.cx0 - dx / cam.scale));
    cam.y = Math.max(-100, Math.min(EURASIA_H + 100, drag.cy0 - dy / cam.scale));
  }
});
function endDrag(e) {
  if (!drag || drag.id !== e.pointerId) return;
  const wasTap = !drag.moved;
  drag = null;
  canvas.classList.remove('dragging');
  if (wasTap) {
    let best = -1, bestD = 38;
    for (const n of nodes) {
      const [sx, sy] = worldToScreen(n.mx, n.my);
      const d = Math.hypot(e.clientX - sx, e.clientY - sy);
      if (d < bestD) { bestD = d; best = n.i; }
    }
    if (best >= 0) walkTo(best);
  }
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

/* Smooth wheel zoom around cursor */
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  viewMode = 'free';
  setViewButtons();
  const [wx0, wy0] = screenToWorld(e.clientX, e.clientY);
  const factor = Math.exp(-e.deltaY * 0.0014);
  cam.scale = Math.max(0.32, Math.min(2.6, cam.scale * factor));
  const [wx1, wy1] = screenToWorld(e.clientX, e.clientY);
  cam.x += wx0 - wx1;
  cam.y += wy0 - wy1;
}, { passive: false });

/* Keyboard + button controls */
window.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); walkTo(targetIdx + 1); }
  else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); walkTo(targetIdx - 1); }
  else if (e.key === 'Enter') {
    const s = stops[targetIdx];
    if (s && !s.preview && s.href) window.location.href = '../' + s.href;
  }
});
document.getElementById('btnPrev').addEventListener('click', () => walkTo(targetIdx - 1));
document.getElementById('btnNext').addEventListener('click', () => walkTo(targetIdx + 1));
document.getElementById('vFollow').addEventListener('click', () => { viewMode = 'follow'; recomputeCameraGoal(false); });
document.getElementById('vEurope').addEventListener('click', () => { viewMode = 'europe'; recomputeCameraGoal(false); });
document.getElementById('vEurasia').addEventListener('click', () => { viewMode = 'eurasia'; recomputeCameraGoal(false); });

const t21 = document.getElementById('toggle21');
t21.addEventListener('click', () => {
  const curKey = stops[targetIdx] ? stops[targetIdx].key : null;
  include21 = !include21;
  t21.classList.toggle('on', include21);
  t21.textContent = include21 ? '21 stops ✓' : '21 stops';
  stops = getStops(include21);
  thumbs = preloadThumbnails(stops);
  nodes = layoutAtlasStops(stops, cam.scale);
  const found = stops.findIndex(s => s.key === curKey);
  targetIdx = found >= 0 ? found : 0;
  walkerS = targetIdx;
  if (include21) viewMode = 'eurasia';
  recomputeCameraGoal(false);
  updateDock();
});

resize();
updateHUD();
updateDock();
nodes = layoutAtlasStops(stops, cam.scale);
recomputeCameraGoal(true);
requestAnimationFrame(render);

