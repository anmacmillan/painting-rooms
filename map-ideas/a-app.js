import {
  LEVELS, loadScores, getStops, getStoredAt, setStoredAt,
  styleOf, preloadThumbnails, SIDE_ROOMS
} from './shared.js';
import {
  makePaperPattern, drawEraBackdrop, drawTraveller, drawEurasiaInset,
  roundRectPath, hexAlpha
} from './a-art.js';

const canvas = document.getElementById('scroll');
const ctx = canvas.getContext('2d');

let include21 = false;
let stops = getStops(false);
let scores = loadScores();
let thumbs = preloadThumbnails(stops);
let landPath = null;
let paperPat = null;

/* Load Eurasia coastline for the quiet corner geographic locator. */
fetch('./eurasia.json').then(r => r.json()).then(d => {
  landPath = new Path2D(d.land);
}).catch(() => {});

/* Initial traveller stop: stored localStorage position, else first unplayed stop. */
function findNextUnplayed() {
  const idx = stops.findIndex(s => !s.preview && !(scores[s.key] && scores[s.key].runs));
  return idx >= 0 ? idx : 0;
}

const storedReal = getStoredAt();
let currentIdx = storedReal >= 0 && storedReal < stops.length ? storedReal : findNextUnplayed();
let targetIdx = currentIdx;
let walkerS = currentIdx;      /* continuous stop index along the scroll */
let walkerFacing = 1;
let walkPhase = 0;

let W = window.innerWidth, H = window.innerHeight, DPR = Math.min(2, window.devicePixelRatio || 1);
const MARGIN = 210;
let STEP = 275;

let camX = 0;
let freeCam = false;
let drag = null;
let goldSparks = [];

function stopX(i) { return MARGIN + i * STEP; }
function roadYAt(x) {
  const mid = H < 680 ? H * 0.56 : H * 0.57;
  const amp = Math.min(34, H * 0.048);
  return mid + Math.sin(x * 0.0046) * amp + Math.cos(x * 0.0021) * (amp * 0.35);
}

function clampCam(x) {
  const maxX = Math.max(0, stopX(stops.length - 1) + MARGIN - W);
  return Math.max(0, Math.min(maxX, x));
}

function resize() {
  W = window.innerWidth;
  H = window.innerHeight;
  DPR = Math.min(2, window.devicePixelRatio || 1);
  STEP = W < 820 ? 225 : 275;
  canvas.width = Math.round(W * DPR);
  canvas.height = Math.round(H * DPR);
  canvas.style.width = W + 'px';
  canvas.style.height = H + 'px';
  if (!freeCam) camX = clampCam(stopX(walkerS) - W * 0.5);
  else camX = clampCam(camX);
}
window.addEventListener('resize', resize);
resize();

/* Celebratory calm gold-leaf specks when arriving at a completed stop. */
function spawnGoldLeaf(wx, wy, count = 16) {
  for (let i = 0; i < count; i++) {
    const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
    const sp = 14 + Math.random() * 34;
    goldSparks.push({
      x: wx + (Math.random() - 0.5) * 32,
      y: wy - 40 + (Math.random() - 0.5) * 28,
      vx: Math.cos(a) * sp * 0.65,
      vy: -16 - Math.random() * 28,
      size: 2.5 + Math.random() * 3.5,
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 3,
      life: 1.4 + Math.random() * 0.9,
      maxLife: 2.1,
    });
  }
}

/* HUD + Dock + Ribbon UI updates */
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

function buildRibbon() {
  const nav = document.getElementById('ribbon');
  nav.textContent = '';
  const nextUn = findNextUnplayed();
  stops.forEach((s, i) => {
    const b = document.createElement('button');
    const done = !s.preview && !!(scores[s.key] && scores[s.key].runs);
    b.className = 'dot-btn'
      + (done ? ' done' : '')
      + (i === nextUn && !done ? ' next' : '')
      + (i === targetIdx ? ' active' : '')
      + (s.preview ? ' preview' : '');
    b.title = `${s.place}, ${s.year} — ${s.title}`;
    b.addEventListener('click', () => walkTo(i));
    nav.appendChild(b);
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
    th.textContent = '';
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
    prog.innerHTML = `Forthcoming stop · ${s.paintings} paintings planned (${s.coin})`;
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
  buildRibbon();
}

export function walkTo(idx) {
  const clamped = Math.max(0, Math.min(stops.length - 1, idx));
  if (clamped !== targetIdx) {
    walkerFacing = clamped > walkerS ? 1 : -1;
  }
  targetIdx = clamped;
  freeCam = false;
  const s = stops[targetIdx];
  if (s && s.realIdx >= 0) setStoredAt(s.realIdx);
  updateDock();
}
/* Draw one painting stop medallion along the scroll. */
function drawStopNode(stop, i, wx, wy, nextUnplayed, time) {
  const sc = !stop.preview ? scores[stop.key] : null;
  const done = !!(sc && sc.runs);
  const isTarget = i === targetIdx;
  const isNext = i === nextUnplayed && !done;
  const st = styleOf(stop);

  /* Stem from road up to painting frame */
  const cardH = W < 820 ? 78 : 92;
  const cardW = W < 820 ? 96 : 114;
  const lift = W < 820 ? 94 : 112;
  const cx = wx;
  const cy = wy - lift;

  ctx.save();
  /* Vertical silk thread connecting node on road to framed vignette */
  ctx.strokeStyle = done ? 'rgba(184, 134, 34, 0.72)' : 'rgba(72, 56, 36, 0.34)';
  ctx.lineWidth = done ? 1.8 : 1.2;
  ctx.beginPath();
  ctx.moveTo(wx, wy - 7);
  ctx.lineTo(cx, cy + cardH * 0.5 + 4);
  ctx.stroke();

  /* Waypoint stone on the road */
  ctx.fillStyle = done ? '#e5b84b' : (isNext ? '#b83b29' : '#f3ecdc');
  ctx.strokeStyle = done ? '#7c5510' : '#3a2f24';
  ctx.lineWidth = isTarget ? 2.6 : 1.8;
  ctx.beginPath();
  ctx.arc(wx, wy, isTarget ? 8.5 : 6.5, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();

  if (isNext) {
    const pulse = 11 + Math.sin(time * 2.8) * 3.5;
    ctx.strokeStyle = 'rgba(184, 59, 41, 0.55)';
    ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.arc(wx, wy, pulse, 0, Math.PI * 2); ctx.stroke();
  }

  /* Subtle glow halo behind active or completed painting */
  if (done || isTarget) {
    const rg = ctx.createRadialGradient(cx, cy, 12, cx, cy, cardW * 0.85);
    rg.addColorStop(0, done ? 'rgba(240, 201, 102, 0.34)' : hexAlpha(st.accent, 0.24));
    rg.addColorStop(1, 'rgba(240, 201, 102, 0)');
    ctx.fillStyle = rg;
    ctx.beginPath(); ctx.arc(cx, cy, cardW * 0.85, 0, Math.PI * 2); ctx.fill();
  }

  /* Soft drop shadow under painting cartouche */
  const fx = cx - cardW * 0.5, fy = cy - cardH * 0.5;
  ctx.fillStyle = 'rgba(32, 24, 15, 0.16)';
  roundRectPath(ctx, fx + 2, fy + 4, cardW, cardH, 9);
  ctx.fill();

  /* Outer parchment/gold mat */
  ctx.fillStyle = done ? '#f8edd0' : '#efe7d5';
  ctx.strokeStyle = isTarget ? '#b83b29' : (done ? '#c28f28' : 'rgba(68, 54, 38, 0.48)');
  ctx.lineWidth = isTarget ? 2.6 : (done ? 2.2 : 1.4);
  if (stop.preview) ctx.setLineDash([5, 3]);
  roundRectPath(ctx, fx, fy, cardW, cardH, 9);
  ctx.fill(); ctx.stroke();
  ctx.setLineDash([]);

  /* Inner painting image (full colour when done or selected, soft sepia sketch when unvisited) */
  const pad = 5;
  ctx.save();
  roundRectPath(ctx, fx + pad, fy + pad, cardW - pad * 2, cardH - pad * 2, 6);
  ctx.clip();
  const im = thumbs.get(stop.key);
  if (im && im.complete && im.naturalWidth > 0) {
    const iw = im.naturalWidth, ih = im.naturalHeight;
    const bw = cardW - pad * 2, bh = cardH - pad * 2;
    const scFit = Math.max(bw / iw, bh / ih);
    const dw = iw * scFit, dh = ih * scFit;
    ctx.filter = done ? 'none' : (isTarget ? 'saturate(0.75) sepia(0.16)' : 'grayscale(0.82) sepia(0.32) brightness(1.02)');
    ctx.drawImage(im, fx + pad + (bw - dw) * 0.5, fy + pad + (bh - dh) * 0.5, dw, dh);
    ctx.filter = 'none';
  } else {
    /* Illustrated miniature woodblock / sketch plate for forthcoming stops */
    const bx = fx + pad, by = fy + pad, bw = cardW - pad * 2, bh = cardH - pad * 2;
    const g = ctx.createLinearGradient(bx, by, bx, by + bh);
    g.addColorStop(0, st.sky[0]); g.addColorStop(1, st.sky[1]);
    ctx.fillStyle = g;
    ctx.fillRect(bx, by, bw, bh);
    if (stop.key === 'hokusai') {
      /* Great Wave & Fuji miniature */
      ctx.fillStyle = '#204975';
      ctx.beginPath(); ctx.moveTo(bx, by + bh); ctx.quadraticCurveTo(bx + bw * 0.3, by + bh * 0.15, bx + bw * 0.65, by + bh * 0.45);
      ctx.lineTo(bx + bw, by + bh); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f6f0e2';
      ctx.beginPath(); ctx.arc(bx + bw * 0.56, by + bh * 0.34, 8, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#18375c';
      ctx.beginPath(); ctx.moveTo(bx + bw * 0.52, by + bh * 0.85); ctx.lineTo(bx + bw * 0.74, by + bh * 0.48); ctx.lineTo(bx + bw * 0.96, by + bh * 0.85); ctx.closePath(); ctx.fill();
    } else if (stop.key === 'kuniyoshi') {
      /* Full moon + vermilion Torii silhouette */
      ctx.fillStyle = 'rgba(248, 232, 188, 0.85)';
      ctx.beginPath(); ctx.arc(cx + 18, cy - 12, 13, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#d43d2a'; ctx.lineWidth = 3.2;
      ctx.beginPath();
      ctx.moveTo(cx - 26, cy - 4); ctx.quadraticCurveTo(cx, cy + 2, cx + 26, cy - 4);
      ctx.moveTo(cx - 20, cy + 6); ctx.lineTo(cx + 20, cy + 6);
      ctx.moveTo(cx - 13, cy - 2); ctx.lineTo(cx - 16, cy + 32);
      ctx.moveTo(cx + 13, cy - 2); ctx.lineTo(cx + 16, cy + 32);
      ctx.stroke();
    } else {
      ctx.fillStyle = 'rgba(255,248,232,0.88)';
      ctx.font = 'italic 12px "Iowan Old Style", Palatino, Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(stop.place, cx, cy + 4);
    }
  }
  ctx.restore();

  /* Vermilion studio hanko seal stamped on completed stops */
  if (done) {
    const sx = fx + cardW - 10, sy = fy + 10;
    ctx.fillStyle = '#b83b29';
    ctx.strokeStyle = '#f8ecd0';
    ctx.lineWidth = 1.6;
    roundRectPath(ctx, sx - 11, sy - 11, 22, 22, 5);
    ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fff5dc';
    ctx.font = '700 13px "Iowan Old Style", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('✓', sx, sy + 4.5);
  } else if (isNext) {
    ctx.fillStyle = '#b83b29';
    roundRectPath(ctx, fx + cardW - 38, fy - 9, 42, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#fff6e4';
    ctx.font = '600 10px "Iowan Old Style", Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('NEXT', fx + cardW - 17, fy + 3.5);
  }

  /* Place, year, and painting stars cleanly below the road */
  ctx.textAlign = 'center';
  ctx.fillStyle = isTarget ? '#201810' : 'rgba(38, 30, 22, 0.88)';
  ctx.font = (isTarget ? '600 15px' : '600 13.5px') + ' "Iowan Old Style", Palatino, Georgia, serif';
  ctx.fillText(stop.place, wx, wy + 25);

  ctx.fillStyle = isTarget ? '#9e3326' : 'rgba(92, 76, 56, 0.85)';
  ctx.font = 'italic 12px "Iowan Old Style", Palatino, Georgia, serif';
  ctx.fillText(stop.year, wx, wy + 40);

  if (done) {
    const got = sc.paintings || 0, of = stop.paintings || 3;
    ctx.fillStyle = '#c48e1c';
    ctx.font = '12px Georgia, serif';
    ctx.fillText('★'.repeat(got) + '☆'.repeat(Math.max(0, of - got)), wx, wy + 55);
  }
  ctx.restore();
}

/* Main animation & render loop */
let lastT = performance.now();
function render(now) {
  const dt = Math.min(0.05, (now - lastT) / 1000);
  lastT = now;
  const time = now * 0.001;

  /* Smooth walking along the scroll spline */
  const diff = targetIdx - walkerS;
  const walking = Math.abs(diff) > 0.008;
  if (walking) {
    const dir = Math.sign(diff);
    walkerFacing = dir;
    const speed = Math.min(3.8, 1.55 + Math.abs(diff) * 0.85);
    const stepMove = dir * speed * dt;
    if (Math.abs(stepMove) >= Math.abs(diff)) {
      walkerS = targetIdx;
      const arrived = stops[targetIdx];
      if (arrived && !arrived.preview && scores[arrived.key] && scores[arrived.key].runs) {
        spawnGoldLeaf(stopX(targetIdx), roadYAt(stopX(targetIdx)), 14);
      }
    } else {
      walkerS += stepMove;
    }
    walkPhase += dt * 11.5;
  } else {
    walkPhase += dt * 2.1;
  }

  /* Smooth camera follow unless user is freely panning */
  if (!freeCam) {
    const desired = clampCam(stopX(walkerS) - W * 0.5);
    camX += (desired - camX) * Math.min(1, dt * 6.5);
  }

  /* Update celebratory gold-leaf specks */
  for (let i = goldSparks.length - 1; i >= 0; i--) {
    const p = goldSparks[i];
    p.life -= dt;
    if (p.life <= 0) { goldSparks.splice(i, 1); continue; }
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 18 * dt;
    p.rot += p.vrot * dt;
  }

  ctx.save();
  ctx.scale(DPR, DPR);

  /* Paper background scrolling gently with world */
  if (!paperPat) paperPat = makePaperPattern(ctx);
  ctx.save();
  ctx.translate(-(camX % 180), 0);
  ctx.fillStyle = paperPat;
  ctx.fillRect(0, 0, W + 200, H);
  ctx.restore();

  /* World-space scroll content */
  ctx.save();
  ctx.translate(-camX, 0);

  /* 1. Era-morphing painted backdrops (only visible stops) */
  for (let i = 0; i < stops.length; i++) {
    const sx = stopX(i);
    if (sx + STEP * 1.2 < camX || sx - STEP * 1.2 > camX + W) continue;
    drawEraBackdrop(ctx, stops[i], sx, STEP, H, roadYAt(sx), time);
  }

  /* 2. Continuous winding itinerary path */
  const xStart = stopX(0) - 50, xEnd = stopX(stops.length - 1) + 50;
  /* Soft path glow */
  ctx.strokeStyle = 'rgba(255, 250, 238, 0.65)';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  for (let x = xStart; x <= xEnd; x += 14) {
    const y = roadYAt(x);
    if (x === xStart) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  /* Per-leg road styling: burnished gold for won segments, calm ink dashes ahead */
  for (let i = 0; i < stops.length - 1; i++) {
    const a = stopX(i), b = stopX(i + 1);
    if (b < camX - 40 || a > camX + W + 40) continue;
    const doneLeg = !stops[i].preview && scores[stops[i].key] && scores[stops[i].key].runs;
    ctx.strokeStyle = doneLeg ? '#c7932b' : 'rgba(78, 62, 44, 0.45)';
    ctx.lineWidth = doneLeg ? 3.2 : 2.1;
    ctx.setLineDash(doneLeg ? [] : [7, 7]);
    ctx.beginPath();
    for (let x = a; x <= b; x += 12) {
      const y = roadYAt(x);
      if (x === a) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.lineTo(b, roadYAt(b));
    ctx.stroke();
  }
  ctx.setLineDash([]);

  /* 3. Stop cartouches */
  const nextUn = findNextUnplayed();
  for (let i = 0; i < stops.length; i++) {
    const sx = stopX(i);
    if (sx + 130 < camX || sx - 130 > camX + W) continue;
    drawStopNode(stops[i], i, sx, roadYAt(sx), nextUn, time);
  }

  /* 4. The traveller walking along the path */
  const wx = stopX(walkerS);
  const wy = roadYAt(wx);
  drawTraveller(ctx, wx, wy, walkerFacing, walkPhase, walking);

  /* 5. Celebratory gold leaf */
  for (const p of goldSparks) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.globalAlpha = Math.max(0, Math.min(1, p.life / 0.8));
    ctx.fillStyle = '#e8ba48';
    ctx.fillRect(-p.size, -p.size * 0.55, p.size * 2, p.size * 1.1);
    ctx.restore();
  }

  ctx.restore(); /* end world space */

  /* 6. Quiet corner Eurasia geographic locator */
  const insetW = W < 620 ? 150 : 206;
  const insetH = W < 620 ? 86 : 114;
  const insetX = W < 820 ? W - insetW - 14 : 18;
  const insetY = W < 820 ? 132 : 84;
  drawEurasiaInset(ctx, landPath, stops, targetIdx, insetX, insetY, insetW, insetH, time);

  ctx.restore();
  requestAnimationFrame(render);
}

/* Pointer / Touch drag & tap-to-walk */
canvas.addEventListener('pointerdown', e => {
  canvas.setPointerCapture(e.pointerId);
  canvas.classList.add('dragging');
  drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, cam0: camX, moved: false };
});
canvas.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  const dx = e.clientX - drag.x0;
  if (Math.abs(dx) > 6) { drag.moved = true; freeCam = true; }
  if (drag.moved) camX = clampCam(drag.cam0 - dx);
});
function endDrag(e) {
  if (!drag || drag.id !== e.pointerId) return;
  const wasTap = !drag.moved;
  drag = null;
  canvas.classList.remove('dragging');
  if (wasTap) {
    const worldX = e.clientX + camX;
    let best = -1, bestD = 120;
    stops.forEach((s, i) => {
      const d = Math.abs(stopX(i) - worldX);
      if (d < bestD) { bestD = d; best = i; }
    });
    if (best >= 0) walkTo(best);
  }
}
canvas.addEventListener('pointerup', endDrag);
canvas.addEventListener('pointercancel', endDrag);

/* Mouse wheel / trackpad horizontal pan */
canvas.addEventListener('wheel', e => {
  e.preventDefault();
  freeCam = true;
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  camX = clampCam(camX + delta);
}, { passive: false });

/* Keyboard controls: Left/Right arrows walk; Enter steps in */
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

/* 21-stop preview toggle (shows Giotto, Vatican, Holbein, Hogarth, Hokusai, Kuniyoshi, Rousseau) */
const t21 = document.getElementById('toggle21');
t21.addEventListener('click', () => {
  const curKey = stops[targetIdx] ? stops[targetIdx].key : null;
  include21 = !include21;
  t21.classList.toggle('on', include21);
  t21.textContent = include21 ? '21 stops ✓' : '21 stops';
  stops = getStops(include21);
  thumbs = preloadThumbnails(stops);
  const found = stops.findIndex(s => s.key === curKey);
  targetIdx = found >= 0 ? found : 0;
  walkerS = targetIdx;
  freeCam = false;
  camX = clampCam(stopX(walkerS) - W * 0.5);
  updateDock();
});

updateHUD();
updateDock();
camX = clampCam(stopX(walkerS) - W * 0.5);
requestAnimationFrame(render);

