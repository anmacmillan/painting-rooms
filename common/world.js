/* The shared engine for the 3D painting worlds.
   A world file supplies the real street plan (from OpenStreetMap), the lie of the land, its painted textures, its people and its
   named places; this builds the town, lets the player walk it, and runs the places list, pointer, mini map and sketchbook.
   Units are metres: x east, z south, y up. See munch/index.html for a complete example of the config. */
import * as THREE from 'three';
export { THREE };
export const rnd = (a, b) => a + Math.random() * (b - a), clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
export const mix = (a, b, t) => a + (b - a) * t;
const $ = id => document.getElementById(id);
const el = (tag, attrs, html) => { const e = document.createElement(tag); Object.assign(e, attrs || {}); if (html != null) e.innerHTML = html; return e; };

export function canvasTex(w, h, draw, repeat) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.lineCap = 'round'; g.lineJoin = 'round';
  draw(g, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; return t;
}
// long wavy brushstrokes laid side by side
export function strokes(g, w, h, cols, n, wid, wave, vertical) {
  for (let i = 0; i < n; i++) {
    g.strokeStyle = cols[i % cols.length]; g.lineWidth = rnd(wid * 0.5, wid * 1.4); g.globalAlpha = rnd(0.55, 1);
    const y = rnd(0, h), ph = rnd(0, 6.28), len = rnd(w * 0.3, w * 1.1), x0 = rnd(-w * 0.2, w * 0.8);
    g.beginPath();
    for (let x = 0; x <= len; x += 12) { const yy = y + Math.sin(x * 0.012 + ph) * wave + Math.sin(x * 0.031 + ph * 2) * wave * 0.4; vertical ? g.lineTo(yy, x0 + x) : g.lineTo(x0 + x, yy); }
    g.stroke();
  }
  g.globalAlpha = 1;
}
function inPoly(p, x, z) { let c = false; for (let i = 0, j = p.length - 1; i < p.length; j = i++) { const a = p[i], b = p[j]; if ((a[1] > z) !== (b[1] > z) && x < (b[0] - a[0]) * (z - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function segDist(x, z, a, b) { const dx = b[0] - a[0], dz = b[1] - a[1], t = clamp(((x - a[0]) * dx + (z - a[1]) * dz) / (dx * dx + dz * dz || 1), 0, 1); return Math.hypot(x - a[0] - dx * t, z - a[1] - dz * t); }

// the painted figures cut from the paintings: <dir>/figures.json lists them, each a PNG with transparency
export async function loadFigures(dir) {
  const man = await (await fetch(dir + '/figures.json')).json(), L = new THREE.TextureLoader(), out = {};
  await Promise.all(Object.keys(man).map(async n => { const t = await L.loadAsync(`${dir}/${n}.png`); t.colorSpace = THREE.SRGBColorSpace; out[n] = { tex: t, wide: man[n].w / man[n].h }; }));
  return out;
}
export function createWorld(cfg) {
  const SND = window.Sound, B = cfg.bounds, uni = { uTime: { value: 0 }, uDread: { value: 0 } }, tinted = [];
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: $('cv'), antialias: true }); } catch (e) { $('err').style.display = 'flex'; throw e; }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x888888, 60, 600);
  const camera = new THREE.PerspectiveCamera(62, 1, 0.3, 4000);
  const mat = o => { const m = new THREE.MeshBasicMaterial(o); m.userData.base = o.color ? new THREE.Color(o.color) : new THREE.Color(1, 1, 1); tinted.push(m); return m; };
  const bend = (m, amount) => {          // everything solid can sway with the mood in the air (uDread); worlds that never raise it stay still
    if (!cfg.bend) return m;
    m.onBeforeCompile = s => {
      s.uniforms.uTime = uni.uTime; s.uniforms.uDread = uni.uDread;
      s.vertexShader = 'uniform float uTime; uniform float uDread;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        vec4 wp = modelMatrix * vec4(position, 1.0);
        transformed.x += sin(wp.z * 0.09 + uTime * 1.4) * uDread * ${(amount * cfg.bend).toFixed(2)};
        transformed.z += sin(wp.x * 0.07 + uTime * 1.1) * uDread * ${(amount * cfg.bend * 0.6).toFixed(2)};`);
    };
    return m;
  };

  /* ----- the ground, sampled once on a grid ----- */
  const MARGIN = cfg.margin ?? 160, G = [B[0] - MARGIN, B[1] - MARGIN, B[2] + MARGIN, B[3] + MARGIN];      // the land is built this far beyond where she can walk
  const CELL = cfg.cell || 4, gx = Math.ceil((G[2] - G[0]) / CELL), gz = Math.ceil((G[3] - G[1]) / CELL), H = new Float32Array((gx + 1) * (gz + 1));
  for (let j = 0; j <= gz; j++) for (let i = 0; i <= gx; i++) H[j * (gx + 1) + i] = cfg.height(G[0] + i * CELL, G[1] + j * CELL);
  function ground(x, z) {
    const fx = clamp((x - G[0]) / CELL, 0, gx - 0.001), fz = clamp((z - G[1]) / CELL, 0, gz - 0.001), i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j, k = j * (gx + 1) + i;
    return (H[k] * (1 - u) + H[k + 1] * u) * (1 - v) + (H[k + gx + 1] * (1 - u) + H[k + gx + 2] * u) * v;
  }
  {
    const pos = [], col = [], uv = [], idx = [], c = new THREE.Color();
    for (let j = 0; j <= gz; j++) for (let i = 0; i <= gx; i++) {
      const x = G[0] + i * CELL, z = G[1] + j * CELL, h = H[j * (gx + 1) + i];
      pos.push(x, h, z); uv.push(x / (cfg.groundScale || 34), z / (cfg.groundScale || 34)); c.set(cfg.groundColor(x, z, h)); col.push(c.r, c.g, c.b);
    }
    for (let j = 0; j < gz; j++) for (let i = 0; i < gx; i++) { const a = j * (gx + 1) + i, b = a + 1, d = a + gx + 1, e = d + 1; idx.push(a, b, d, b, e, d); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    scene.add(new THREE.Mesh(g, bend(mat({ map: cfg.groundTex, vertexColors: true, side: THREE.DoubleSide }), 1.3)));
  }
  let water = null;
  if (cfg.waterTex) {
    cfg.waterTex.repeat.set(60, 60); water = new THREE.Mesh(new THREE.PlaneGeometry(5000, 5000), mat({ map: cfg.waterTex }));
    water.rotation.x = -Math.PI / 2; water.position.set((B[0] + B[2]) / 2, cfg.waterLevel ?? -0.15, (B[1] + B[3]) / 2); scene.add(water);
  }
  function boxBetween(a, b, thick, m) {
    const d = new THREE.Vector3().subVectors(b, a), mesh = new THREE.Mesh(new THREE.BoxGeometry(thick, thick, d.length()), m);
    mesh.position.copy(a).addScaledVector(d, 0.5); mesh.lookAt(b); scene.add(mesh); return mesh;
  }

  /* ----- streets, draped on the ground ----- */
  const widthOf = cfg.streetWidth || (t => ({ primary: 9, secondary: 8, tertiary: 7, residential: 6, unclassified: 6, living_street: 6, pedestrian: 6, service: 3.5, footway: 2.2, path: 1.8, steps: 2, track: 3 }[t] || 3));
  function ribbon(line, w, lift, vscale) {
    const pos = [], uv = [], idx = []; let s = 0, n = 0;
    const pts = []; for (let i = 0; i < line.length - 1; i++) { const a = line[i], b = line[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), k = Math.max(1, Math.ceil(L / 5)); for (let q = 0; q < k; q++) pts.push([mix(a[0], b[0], q / k), mix(a[1], b[1], q / k)]); }
    pts.push(line[line.length - 1]);
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)]; let dx = b[0] - a[0], dz = b[1] - a[1]; const L = Math.hypot(dx, dz) || 1; dx /= L; dz /= L;
      if (i) s += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const y = ground(p[0], p[1]) + lift;
      for (const k of [-1, 1]) { const x = p[0] - dz * w / 2 * k, z = p[1] + dx * w / 2 * k; pos.push(x, Math.max(y, ground(x, z) + lift), z); uv.push(k > 0 ? 1 : 0, s / (vscale || 14)); }
      if (i < pts.length - 1) { idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); } n += 2;
    }
    return { pos, uv, idx };
  }
  function mergeMesh(parts, material) {
    const pos = [], uv = [], idx = [], col = []; let base = 0;
    for (const p of parts) { for (const v of p.pos) pos.push(v); for (const v of p.uv) uv.push(v); if (p.col) for (const v of p.col) col.push(v); for (const v of p.idx) idx.push(v + base); base += p.pos.length / 3; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    if (col.length) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx);
    const m = new THREE.Mesh(g, material); scene.add(m); return m;
  }
  const streets = (cfg.map.streets || []).filter(s => !cfg.skipStreet || !cfg.skipStreet(s));
  if (streets.length && cfg.streetTex) mergeMesh(streets.map(s => ribbon(s.l, widthOf(s.t), 0.07)), bend(mat({ map: cfg.streetTex, side: THREE.DoubleSide }), 1.3));

  /* ----- houses, raised from their real footprints ----- */
  const houses = [], grid = new Map(), GC = 24, key = (i, j) => i * 4096 + j;
  {
    const styles = cfg.houseStyles, walls = styles.map(() => []), roofs = [], c = new THREE.Color();
    (cfg.map.buildings || []).forEach((b, bi) => {
      if (cfg.skipBuilding && cfg.skipBuilding(b)) return;
      const p = b.p; if (p.length < 3) return;
      let cx = 0, cz = 0, lo = 1e9, hi = -1e9, x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9;
      for (const q of p) { cx += q[0]; cz += q[1]; const g = ground(q[0], q[1]); lo = Math.min(lo, g); hi = Math.max(hi, g); x0 = Math.min(x0, q[0]); x1 = Math.max(x1, q[0]); z0 = Math.min(z0, q[1]); z1 = Math.max(z1, q[1]); }
      cx /= p.length; cz /= p.length; if (lo < (cfg.waterLevel ?? -0.15) + 0.2) return;            // nothing stands in the water
      const hs = cfg.houseShape ? cfg.houseShape(b, bi, Math.max(x1 - x0, z1 - z0)) : { wall: 4 + (bi % 3), roof: 2.4, style: bi % styles.length };
      const si = hs.style % styles.length, y0 = lo - 0.6, y1 = hi + hs.wall, part = { pos: [], uv: [], idx: [] }; let s = 0;
      for (let i = 0; i < p.length; i++) {
        const a = p[i], d = p[(i + 1) % p.length], L = Math.hypot(d[0] - a[0], d[1] - a[1]), n = part.pos.length / 3, ts = styles[si].scale || 7;
        part.pos.push(a[0], y0, a[1], d[0], y0, d[1], a[0], y1, a[1], d[0], y1, d[1]); part.uv.push(s / ts, 0, (s + L) / ts, 0, s / ts, (y1 - y0) / ts, (s + L) / ts, (y1 - y0) / ts);
        part.idx.push(n, n + 1, n + 2, n + 1, n + 3, n + 2); s += L;
      }
      walls[si].push(part);
      const rp = { pos: [], uv: [], idx: [], col: [] }, ov = 0.5; c.set(hs.roofColor || styles[si].roof); const sh = 0.85 + ((bi * 37) % 30) / 100;
      for (let i = 0; i < p.length; i++) {            // a hipped roof: every wall leans in to the middle, with a small overhang
        const a = p[i], d = p[(i + 1) % p.length], n = rp.pos.length / 3, ax = a[0] + Math.sign(a[0] - cx) * ov, az = a[1] + Math.sign(a[1] - cz) * ov, dx = d[0] + Math.sign(d[0] - cx) * ov, dz = d[1] + Math.sign(d[1] - cz) * ov;
        rp.pos.push(ax, y1 - 0.15, az, dx, y1 - 0.15, dz, cx, y1 + hs.roof, cz); rp.uv.push(ax / 9, az / 9, dx / 9, dz / 9, cx / 9, cz / 9);
        const k = sh * (0.8 + 0.2 * ((i * 53) % 7) / 7); rp.col.push(c.r * k, c.g * k, c.b * k, c.r * k, c.g * k, c.b * k, c.r * k * 1.1, c.g * k * 1.1, c.b * k * 1.1); rp.idx.push(n, n + 1, n + 2);
      }
      roofs.push(rp);
      const h = { p, x0, x1, z0, z1, eave: y1, top: y1 + hs.roof, name: b.n }; houses.push(h);
      for (let i = Math.floor(x0 / GC); i <= Math.floor(x1 / GC); i++) for (let j = Math.floor(z0 / GC); j <= Math.floor(z1 / GC); j++) { const k = key(i + 2048, j + 2048); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(h); }
    });
    styles.forEach((st, i) => { if (walls[i].length) mergeMesh(walls[i], bend(mat({ map: st.wall, side: THREE.DoubleSide }), 1.0)); });
    if (roofs.length) mergeMesh(roofs, bend(mat({ map: cfg.roofTex || cfg.groundTex, vertexColors: true, side: THREE.DoubleSide }), 1.0));
  }
  const inHouse = (x, z) => { const l = grid.get(key(Math.floor(x / GC) + 2048, Math.floor(z / GC) + 2048)); if (l) for (const h of l) if (x >= h.x0 && x <= h.x1 && z >= h.z0 && z <= h.z1 && inPoly(h.p, x, z)) return h; return null; };

  /* ----- decks: piers and bridges she can walk on ----- */
  const decks = cfg.decks || [];
  for (const d of decks) {
    const a = new THREE.Vector3(d.a[0], d.y - 0.12, d.a[1]), b = new THREE.Vector3(d.b[0], d.y - 0.12, d.b[1]), L = a.distanceTo(b);
    const m = new THREE.Mesh(new THREE.BoxGeometry(d.w, 0.24, L), mat({ map: d.tex })); m.position.copy(a).lerp(b, 0.5); m.lookAt(b); scene.add(m);
    if (d.rails) {
      const rm = mat({ color: d.rails }), dir = new THREE.Vector3().subVectors(b, a).normalize(), side = new THREE.Vector3(-dir.z, 0, dir.x);
      for (const s of [-1, 1]) for (let t = 0; t < L; t += 4) {
        const p = a.clone().addScaledVector(dir, t).addScaledVector(side, s * d.w / 2).setY(d.y), q = a.clone().addScaledVector(dir, Math.min(L, t + 4)).addScaledVector(side, s * d.w / 2).setY(d.y);
        boxBetween(p, p.clone().setY(d.y + 1.05), 0.14, rm); boxBetween(p.clone().setY(d.y + 1.05), q.clone().setY(d.y + 1.05), 0.11, rm); boxBetween(p.clone().setY(d.y + 0.55), q.clone().setY(d.y + 0.55), 0.09, rm);
      }
    }
  }
  const walkable = cfg.walkable || ((x, z, h) => h > -0.3);
  function floorAt(x, z) {
    if (x < B[0] + 2 || x > B[2] - 2 || z < B[1] + 2 || z > B[3] - 2) { const f = cfg.floor && cfg.floor(x, z); return f ?? null; }
    for (const d of decks) if (segDist(x, z, d.a, d.b) < d.w / 2) return Math.max(ground(x, z), d.y);
    const f = cfg.floor && cfg.floor(x, z); if (f != null) return f;
    const g = ground(x, z); return walkable(x, z, g) ? g : null;
  }

  /* ----- people ----- */
  const sprites = [];
  const texOf = t => (t && t.tex) || t;
  function sprite(tex, x, z, h, wide) {
    if (tex && tex.tex) { wide = wide || tex.wide; tex = tex.tex; }
    const m = new THREE.SpriteMaterial({ map: tex, transparent: true, alphaTest: 0.3 }); m.userData.base = new THREE.Color(1, 1, 1); tinted.push(m);
    const s = new THREE.Sprite(m); s.center.set(0.5, 0); s.scale.set(h * (wide || 0.5), h, 1); s.position.set(x, floorAt(x, z) ?? ground(x, z), z); s.userData.w = h * (wide || 0.5); scene.add(s); sprites.push(s); return s;
  }
  const cast = (cfg.figures || []).slice();
  if (cfg.crowd) {
    const ways = streets.filter(s => s.n && s.l.length > 1 && s.l.every(q => q[0] > B[0] + 4 && q[0] < B[2] - 4 && q[1] > B[1] + 4 && q[1] < B[3] - 4)).map(s => { let L = 0; for (let i = 0; i < s.l.length - 1; i++) L += Math.hypot(s.l[i + 1][0] - s.l[i][0], s.l[i + 1][1] - s.l[i][1]); return { l: s.l, L }; }).filter(s => s.L > 35 && (!cfg.crowd.where || cfg.crowd.where(s.l)));
    const total = ways.reduce((a, s) => a + s.L, 0);
    for (let i = 0; i < cfg.crowd.n && ways.length; i++) {
      let r = Math.random() * total, w = ways[0]; for (const s of ways) { r -= s.L; if (r <= 0) { w = s; break; } }
      cast.push({ id: 'crowd' + i, tex: cfg.crowd.cast[i % cfg.crowd.cast.length], x: 0, z: 0, h: rnd(cfg.crowd.h[0], cfg.crowd.h[1]), path: Math.random() < 0.5 ? w.l : w.l.slice().reverse(), speed: rnd(0.7, 1.5), loop: false, off: rnd(1.0, 2.6) * (Math.random() < 0.5 ? -1 : 1), say: cfg.crowd.say && Math.random() < 0.25 ? [cfg.crowd.say[Math.floor(rnd(0, cfg.crowd.say.length))]] : null });
    }
  }
  const figs = cast.map(f => {
    const sp = sprite(f.frames ? f.frames[0] : f.tex, f.x, f.z, f.h || 2, f.wide);
    let len = 0; const segs = []; if (f.path) for (let i = 0; i < f.path.length - 1; i++) { const L = Math.hypot(f.path[i + 1][0] - f.path[i][0], f.path[i + 1][1] - f.path[i][1]); segs.push([len, L]); len += L; }
    return Object.assign({ sp, s: f.s0 != null ? f.s0 * len : rnd(0, len), len, segs, lineI: 0, quiet: 0, lift: f.lift || 0, sway: rnd(0, 6.28) }, f);
  });
  const bubble = el('div', { id: 'bubble' }); document.body.appendChild(bubble); let bubbleFig = null, bubbleT = 0;
  function say(fig, text, secs) { bubble.textContent = text; bubble.classList.add('show'); bubbleFig = fig; bubbleT = time + (secs || 4); }

  /* ----- places, cards and the sketchbook ----- */
  const places = cfg.places || [], found = new Set(); let target = null;
  const hud = el('div', { className: 'hud hidden' }); document.body.appendChild(hud);
  hud.innerHTML = `<div id="pointer"><i>↑</i><span></span><b></b></div><div id="places"></div><canvas id="minimap" width="312" height="312"></canvas>
    <button id="bBook" aria-label="Sketchbook">✎ <span>0</span> of ${places.filter(p => p.card).length}</button>
    <button id="bMute" aria-label="Sound"><svg viewBox="0 0 20 20" fill="currentColor"><path d="M3 7.5h3.2L11 3.5v13l-4.8-4H3z"/><path id="waves" d="M13.5 6.5c1.6 1.9 1.6 5.1 0 7M15.8 4.3c2.9 3.2 2.9 8.2 0 11.4" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg></button>
    <button id="bFly" aria-label="Fly" style="display:none"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20V5M5 11l7-7 7 7"/></svg></button>
    <div id="tip" class="hidden"></div>`;
  const card = el('div', { id: 'card' }), book = el('div', { id: 'book' }), stickEl = el('div', { id: 'stick' }, '<i></i>'); document.body.append(card, book, stickEl);
  let cardT = 0, cardAt = 0, muted = false;
  const cardHTML = c => `<img src="${c.img}" alt=""><h3>${c.title}</h3><p class="w">${[c.year, c.where].filter(Boolean).join(' · ')}</p>${c.note ? `<p>${c.note}</p>` : ''}`;
  function showCard(c) { card.innerHTML = cardHTML(c) + (c.line ? `<p class="line">${c.line}</p>` : '') + (c.room ? '<p class="w">tap to step back outside</p>' : ''); card.classList.toggle('room', !!c.room); card.classList.add('show'); cardT = time + (c.room ? 16 : 9); cardAt = time; }
  card.addEventListener('click', () => card.classList.remove('show'));
  function gallery(into, all) {
    into.innerHTML = places.filter(p => p.card && (all || found.has(p.id))).map(p => `<figure class="${found.has(p.id) ? '' : 'no'}"><img src="${p.card.img}" alt=""><figcaption><i>${found.has(p.id) ? p.card.title : '?'}</i>${found.has(p.id) ? [p.card.year, p.card.where].filter(Boolean).join(' · ') : 'not found yet: ' + p.name}</figcaption></figure>`).join('');
  }
  function openBook(on) {
    if (on) { book.innerHTML = `<h2>${cfg.bookTitle || 'Sketchbook'}</h2><div class="sub">${cfg.bookSub || 'the paintings this world is made from'} · tap to close</div><div class="cards"></div>`; gallery(book.querySelector('.cards'), true); }
    book.classList.toggle('show', on);
  }
  book.addEventListener('click', () => openBook(false)); $('bBook').addEventListener('click', () => openBook(true));
  if (cfg.player.fly) { const b = $('bFly'); b.style.display = ''; const on = e => { e.preventDefault(); held.fly = true; b.classList.add('down'); try { b.setPointerCapture(e.pointerId); } catch (_) {} }, off = () => { held.fly = false; b.classList.remove('down'); };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointercancel', off); b.addEventListener('contextmenu', e => e.preventDefault()); }
  $('bMute').addEventListener('click', () => { muted = !muted; $('waves').style.display = muted ? 'none' : ''; SND.setMuted(muted); });
  function find(p) {
    if (found.has(p.id)) return; found.add(p.id);
    if (p.card) { showCard(p.card); $('bBook').querySelector('span').textContent = [...found].filter(id => places.find(q => q.id === id && q.card)).length; }
    [2, 4, 5, 7, 9].forEach((n, k) => SND.bell(n, 0.07, k * 0.1));
    if (target === p) target = null; if (cfg.onFound) cfg.onFound(p, api); listPlaces(true);
  }
  let listT = 0;
  function listPlaces(force) {
    if (!force && time < listT) return; listT = time + 0.5;
    const open = places.filter(p => !found.has(p.id) && !(p.hidden && p.hidden(api))).map(p => ({ p, d: Math.hypot(p.x - me.x, p.z - me.z) })).sort((a, b) => a.d - b.d);
    if (!target || found.has(target.id)) target = open.length ? open[0].p : null;
    const box = $('places'); box.innerHTML = open.length ? '<div class="hd">PLACES</div>' : '';
    open.slice(0, 4).forEach(o => { const b = el('button', { className: o.p === target ? 'on' : '' }, `<span>${o.p.name}<small>${o.p.kind || ''}</small></span><em>${Math.round(o.d)} m</em>`); b.addEventListener('click', e => { e.stopPropagation(); target = o.p; listPlaces(true); }); box.appendChild(b); });
    listPlaces.open = open;
  }
  /* the mini map: the whole plan drawn once, then a round window of it turned so that ahead is up */
  const MS = cfg.mapScale || 1.4, plan = document.createElement('canvas'); plan.width = Math.ceil((B[2] - B[0]) * MS); plan.height = Math.ceil((B[3] - B[1]) * MS);
  {
    const g = plan.getContext('2d'), T = p => [(p[0] - B[0]) * MS, (p[1] - B[1]) * MS], mc = Object.assign({ land: '#3d4a3f', water: '#2c3f6e', street: '#b9a88a', house: '#d8cdb8' }, cfg.mapColors || {});
    g.fillStyle = mc.land; g.fillRect(0, 0, plan.width, plan.height); g.fillStyle = mc.water;
    for (let z = B[1]; z < B[3]; z += CELL) for (let x = B[0]; x < B[2]; x += CELL) if (ground(x + CELL / 2, z + CELL / 2) < (cfg.waterLevel ?? -0.15)) g.fillRect((x - B[0]) * MS, (z - B[1]) * MS, CELL * MS + 1, CELL * MS + 1);
    g.strokeStyle = mc.street; g.lineCap = 'round'; for (const s of streets) { g.lineWidth = Math.max(1.5, widthOf(s.t) * MS * 0.6); g.beginPath(); s.l.forEach((p, i) => { const q = T(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.stroke(); }
    for (const d of decks) { g.lineWidth = d.w * MS; g.beginPath(); g.moveTo(...T(d.a)); g.lineTo(...T(d.b)); g.stroke(); }
    g.fillStyle = mc.house; for (const h of houses) { g.beginPath(); h.p.forEach((p, i) => { const q = T(p); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); }); g.fill(); }
  }
  function drawMap() {
    const cv = $('minimap'), g = cv.getContext('2d'), R = cv.width / 2, zoom = 0.9; g.save(); g.clearRect(0, 0, cv.width, cv.height);
    g.beginPath(); g.arc(R, R, R, 0, 7); g.clip(); g.fillStyle = '#26324f'; g.fillRect(0, 0, cv.width, cv.height);
    g.translate(R, R); g.rotate(-me.yaw); g.scale(zoom, zoom); g.drawImage(plan, -(me.x - B[0]) * MS, -(me.z - B[1]) * MS);
    for (const p of places) { if (p.hidden && p.hidden(api) && !found.has(p.id)) continue; const x = (p.x - me.x) * MS, y = (p.z - me.z) * MS; g.beginPath(); g.arc(x, y, p === target ? 9 : 6, 0, 7); g.fillStyle = found.has(p.id) ? 'rgba(217,181,96,.45)' : '#f2cf6d'; g.fill(); if (p === target) { g.lineWidth = 3; g.strokeStyle = '#fff'; g.stroke(); } }
    g.restore(); g.fillStyle = '#c9352b'; g.strokeStyle = '#fff'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(R, R - 13); g.lineTo(R + 9, R + 10); g.lineTo(R, R + 5); g.lineTo(R - 9, R + 10); g.closePath(); g.fill(); g.stroke();
    g.save(); g.translate(R, R); g.rotate(-me.yaw); g.fillStyle = '#fff'; g.font = '700 20px Georgia'; g.textAlign = 'center'; g.fillText('N', 0, -R + 24); g.restore();
  }

  /* ----- the player ----- */
  let state = 'title', time = 0;
  const me = { x: 0, z: 0, y: 0, vy: 0, yaw: 0, air: false, step: 0, speed: 0, auto: null };
  const keys = new Set(), stick = { id: null, x0: 0, y0: 0, dx: 0, dy: 0 }, held = { fly: false }, P = cfg.player, WL = cfg.waterLevel ?? -0.15, meSp = sprite(P.frames[2], P.start.x, P.start.z, P.height || 1.85);
  function reset() { Object.assign(me, { x: P.start.x, z: P.start.z, yaw: P.start.yaw || 0, vy: 0, air: false, speed: 0, auto: null }); me.y = floorAt(me.x, me.z) ?? ground(me.x, me.z); camera.position.set(me.x - Math.sin(me.yaw) * 6, me.y + 3, me.z + Math.cos(me.yaw) * 6); }
  function begin() {
    SND.start(cfg.sound); SND.setMuted(muted); found.clear(); target = null; reset(); state = 'play'; $('bBook').querySelector('span').textContent = 0;
    $('title').classList.add('hidden'); $('end').classList.add('hidden'); hud.classList.remove('hidden'); card.classList.remove('show');
    const t = $('tip'); t.textContent = cfg.tip || (matchMedia('(pointer: coarse)').matches ? (cfg.player.fly ? 'drag to run and turn · hold the arrow to fly' : 'drag to walk and turn') : (cfg.player.fly ? 'arrow keys to run and turn · hold space to fly · tab for the next place · B for the sketchbook' : 'arrow keys to walk and turn · space to jump · tab for the next place · B for the sketchbook')); t.classList.remove('hidden'); setTimeout(() => t.classList.add('hidden'), 11000);
    if (cfg.onStart) cfg.onStart(api); listPlaces(true);
  }
  function end() { if (state === 'done') return; state = 'done'; hud.classList.add('hidden'); card.classList.remove('show'); bubble.classList.remove('show'); const g = $('gallery'); if (g) gallery(g, false); $('end').classList.remove('hidden'); }
  function update(dt) {
    time += dt; uni.uTime.value = time;
    if (state === 'title') { if (cfg.titleCamera) cfg.titleCamera(api); meSp.visible = false; if (cfg.update) cfg.update(api, dt); return; }
    meSp.visible = true;
    let turn = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') || keys.has('KeyQ') ? 1 : 0) + stick.dx;
    let go = (keys.has('ArrowUp') || keys.has('KeyW') || keys.has('KeyZ') ? 1 : 0) - (keys.has('ArrowDown') || keys.has('KeyS') ? 0.6 : 0) - stick.dy;
    turn = clamp(turn, -1, 1); go = clamp(go, -0.6, 1);
    if (me.auto) { turn = 0; go = me.auto.go; let d = me.auto.yaw - me.yaw; d = Math.atan2(Math.sin(d), Math.cos(d)); me.yaw += d * Math.min(1, dt * 1.5); }
    if (state === 'done') { turn = 0; go = 0; }
    me.yaw += turn * 2.1 * dt;
    const fx = Math.sin(me.yaw), fz = -Math.cos(me.yaw), slope = (ground(me.x, me.z) - ground(me.x + fx * 2, me.z + fz * 2)) / 2, top = ((P.speed || 10) + clamp(slope * 45, 0, P.downhill ?? 8)) * (me.air && P.fly ? 1.8 : 1);
    const flying = P.fly && state === 'play' && (keys.has('Space') || held.fly), wall = (x, z) => { const h = inHouse(x, z); return h && me.y < h.eave + 0.2; };
    me.speed += (go * top - me.speed) * Math.min(1, dt * 3.5);
    let nx = me.x + fx * me.speed * dt, nz = me.z + fz * me.speed * dt;
    if (cfg.carry) [nx, nz] = cfg.carry(api, nx, nz, dt);
    if (wall(nx, nz)) { if (!wall(nx, me.z)) nz = me.z; else if (!wall(me.x, nz)) nx = me.x; else { nx = me.x; nz = me.z; me.speed *= 0.4; } }
    let f = floorAt(nx, nz), wet = false; const roof = inHouse(nx, nz);
    if (roof) f = roof.eave + 0.45;                                       // above the eaves she can cross the roofs and land on them
    else if (f === null && me.air && P.fly && nx > G[0] + 20 && nx < G[2] - 20 && nz > G[1] + 20 && nz < G[3] - 20) { f = WL + 0.25; wet = true; }      // and fly out over the water
    if (f === null) { f = floorAt(nx, me.z); if (f !== null) nz = me.z; else { f = floorAt(me.x, nz); if (f !== null) nx = me.x; else { nx = me.x; nz = me.z; f = floorAt(nx, nz) ?? me.y; me.speed *= 0.5; } } }
    me.x = nx; me.z = nz;
    if (P.fly) {                                                         // hold to rise; let go and she drifts down
      if (flying) { if (!me.air) { me.air = true; me.vy = 4; SND.whoosh(0.05); } me.vy = Math.min(me.vy + 24 * dt, 9); }
      if (me.air) {
        if (!flying) me.vy = Math.max(me.vy - 13 * dt, -6.5);
        me.y += me.vy * dt; const lid = ground(me.x, me.z) + (P.ceiling || 48); if (me.y > lid) { me.y = lid; me.vy = Math.min(me.vy, 0); }
        if (me.y <= f) { if (wet) { me.y = f; me.vy = 5.5; SND.puff(0.06); } else { me.y = f; me.air = false; me.vy = 0; SND.puff(0.05); } }
      } else if (f < me.y - 1.2) me.air = true;                           // walked off a roof
      else me.y += (f - me.y) * Math.min(1, dt * 18);
    } else {
      if (keys.has('Space') && !me.air && state === 'play') { me.vy = 6.5; me.air = true; SND.puff(0.05); }
      if (me.air) { me.vy -= 18 * dt; me.y += me.vy * dt; if (me.y <= f) { me.y = f; me.air = false; SND.puff(0.05); } } else me.y += (f - me.y) * Math.min(1, dt * 18);
    }
    const moving = Math.abs(me.speed) > 0.6;
    if (moving && !me.air) { const before = Math.floor(me.step); me.step += dt * (2.2 + Math.abs(me.speed) * 0.22); if (Math.floor(me.step) !== before) SND.puff(0.022); }
    meSp.material.map = texOf(me.air ? P.frames[2] : moving ? P.frames[Math.floor(me.step) % 2] : P.frames[2]); meSp.material.rotation = me.air ? clamp(-turn * 0.22, -0.3, 0.3) + Math.sin(time * 2.2) * 0.04 : moving ? Math.sin(me.step * Math.PI) * 0.035 : 0; meSp.position.set(me.x, me.y, me.z);

    for (const f of figs) {                          // people keep to their paths, part round her, and speak when she comes close
      let x = f.x, z = f.z;
      if (f.path && f.len) {
        f.s += (f.speed || 1) * dt; if (f.loop === false) { if (f.s > f.len || f.s < 0) { f.speed = -(f.speed || 1); f.s = clamp(f.s, 0, f.len); } } else f.s = ((f.s % f.len) + f.len) % f.len;
        let i = 0; while (i < f.segs.length - 1 && f.s > f.segs[i][0] + f.segs[i][1]) i++;
        const t = clamp((f.s - f.segs[i][0]) / (f.segs[i][1] || 1), 0, 1), a = f.path[i], b = f.path[i + 1]; x = mix(a[0], b[0], t) + (f.off || 0); z = mix(a[1], b[1], t) + (f.off || 0) * 0.3;
      }
      if (f.place) [x, z] = f.place(api, f, dt, x, z);
      const dx = x - me.x, dz = z - me.z, d = Math.hypot(dx, dz);
      if (f.path && d < 2.6 && d > 0.01) { const push = (2.6 - d) * 0.8; x += dx / d * push; z += dz / d * push; }
      const near = d < (f.hear || 6);
      f.sp.position.set(x, (floorAt(x, z) ?? ground(x, z)) + f.lift + (f.path || near ? Math.abs(Math.sin(time * (near ? 5 : 3) + f.x)) * (near ? 0.12 : 0.04) : 0), z);
      if (f.frames) f.sp.material.map = texOf(f.frames[f.frame ? f.frame(api, f, near) : 0]);
      if (f.path) f.sp.material.rotation = Math.sin(time * 4.5 + f.sway) * 0.04;            // walkers sway as they go
      if (near && f.say && time > f.quiet && state === 'play') { say(f, f.say[f.lineI++ % f.say.length]); f.quiet = time + 14; if (f.onMeet) f.onMeet(api, f); }
    }
    if (bubbleFig) {
      if (time > bubbleT || Math.hypot(bubbleFig.sp.position.x - me.x, bubbleFig.sp.position.z - me.z) > 16) { bubble.classList.remove('show'); bubbleFig = null; }
      else { const v = bubbleFig.sp.position.clone(); v.y += bubbleFig.sp.scale.y + 0.3; v.project(camera); bubble.style.left = (v.x * 0.5 + 0.5) * innerWidth + 'px'; bubble.style.top = (-v.y * 0.5 + 0.5) * innerHeight + 'px'; if (v.z > 1) bubble.classList.remove('show'); }
    }
    if (state === 'play') for (const p of places) if (!found.has(p.id) && Math.hypot(p.x - me.x, p.z - me.z) < (p.r || 12) && !(p.hidden && p.hidden(api))) find(p);
    if (cardT && (time > cardT || (card.classList.contains('room') && time > cardAt + 2.5 && (Math.abs(go) > 0.3 || Math.abs(turn) > 0.3)))) { card.classList.remove('show'); cardT = 0; }      // a room closes when she walks on
    if (cfg.update) cfg.update(api, dt);

    // camera: behind her, pulled in if a house gets in the way
    const alt = Math.max(0, me.y - ground(me.x, me.z) - 0.5);
    let dist = (P.camDist || 5.4) + Math.abs(me.speed) * 0.16 + alt * 0.32, cx, cz; for (let k = 0; k < 4; k++) { cx = me.x - fx * dist; cz = me.z - fz * dist; const h = inHouse(cx, cz); if (!h || me.y + 2.9 + alt * 0.3 > h.top + 1) break; dist *= 0.55; }
    const cy = Math.max(me.y + 2.9 + alt * 0.3, ground(cx, cz) + 1.3), k = Math.min(1, dt * 5);
    camera.position.x += (cx - camera.position.x) * k; camera.position.z += (cz - camera.position.z) * k; camera.position.y += (cy - camera.position.y) * k;
    camera.lookAt(me.x + fx * (5 + alt * 0.4), me.y + 1.5 - alt * 0.12 + (api.lookUp || 0), me.z + fz * (5 + alt * 0.4)); camera.rotation.z += Math.sin(time * 1.3) * 0.03 * uni.uDread.value;
    camera.fov += (60 + Math.abs(me.speed) * 1.25 - camera.fov) * k; camera.updateProjectionMatrix();
    if (water) water.material.map.offset.x = time * 0.004;
    // pointer, list, map
    listPlaces(); const ptr = $('pointer');
    if (target && state === 'play') { const dx = target.x - me.x, dz = target.z - me.z, ang = Math.atan2(dx * Math.cos(me.yaw) + dz * Math.sin(me.yaw), dx * fx + dz * fz); ptr.style.display = ''; ptr.firstElementChild.style.transform = `rotate(${ang}rad)`; ptr.children[1].textContent = target.name; ptr.children[2].textContent = Math.round(Math.hypot(dx, dz)) + ' m'; }
    else ptr.style.display = 'none';
    drawMap();
  }
  const cT = new THREE.Color();
  function draw() {
    const w = innerWidth, h = innerHeight, pr = renderer.getPixelRatio();
    if (renderer.domElement.width !== Math.round(w * pr) || renderer.domElement.height !== Math.round(h * pr)) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
    const t = cfg.tint ? cfg.tint(api) : null;
    if (t) { cT.copy(t.color); for (const m of tinted) m.color.copy(m.userData.base).multiply(cT); scene.fog.color.copy(t.fog); scene.fog.near = t.near; scene.fog.far = t.far; }
    renderer.render(scene, camera);
  }
  let last = 0; function frame(ms) { const dt = Math.min(0.05, (ms - last) / 1000 || 0); last = ms; update(dt); draw(); requestAnimationFrame(frame); }

  /* ----- input ----- */
  addEventListener('keydown', e => {
    if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault(); keys.add(e.code);
    if (e.code === 'Enter' && (state === 'title' || state === 'done')) begin();
    if (e.code === 'Tab' && state === 'play' && listPlaces.open && listPlaces.open.length) { const o = listPlaces.open, i = o.findIndex(q => q.p === target); target = o[(i + 1) % o.length].p; listPlaces(true); }
    if (e.code === 'KeyB' && state === 'play') openBook(!book.classList.contains('show')); if (e.code === 'Escape') { openBook(false); card.classList.remove('show'); }
  });
  addEventListener('keyup', e => keys.delete(e.code)); addEventListener('blur', () => { keys.clear(); held.fly = false; stick.id = null; stick.dx = stick.dy = 0; });
  const cv = $('cv');
  cv.addEventListener('pointerdown', e => { if (state !== 'play' || stick.id !== null) return; stick.id = e.pointerId; stick.x0 = e.clientX; stick.y0 = e.clientY; stick.dx = stick.dy = 0; try { cv.setPointerCapture(e.pointerId); } catch (_) {}
    stickEl.style.display = 'block'; stickEl.style.left = e.clientX + 'px'; stickEl.style.top = e.clientY + 'px'; stickEl.firstElementChild.style.transform = ''; });
  cv.addEventListener('pointermove', e => { if (e.pointerId !== stick.id) return; let dx = (e.clientX - stick.x0) / 48, dy = (e.clientY - stick.y0) / 48; const m = Math.hypot(dx, dy); if (m > 1) { dx /= m; dy /= m; } stick.dx = dx; stick.dy = dy; stickEl.firstElementChild.style.transform = `translate(${dx * 34}px,${dy * 34}px)`; });
  const lift = e => { if (e.pointerId === stick.id) { stick.id = null; stick.dx = stick.dy = 0; stickEl.style.display = 'none'; } };
  cv.addEventListener('pointerup', lift); cv.addEventListener('pointercancel', lift);
  $('start').addEventListener('click', begin); $('again').addEventListener('click', begin); document.addEventListener('gesturestart', e => e.preventDefault());

  const api = { THREE, scene, camera, renderer, uni, tinted, mat, bend, ground, floorAt, inHouse, sprite, boxBetween, say, find, end, begin, me, figs, places, found, houses, lookUp: 0,
    get state() { return state; }, set state(v) { state = v; }, get time() { return time; }, get target() { return target; } };
  if (cfg.build) cfg.build(api);
  reset(); requestAnimationFrame(frame);
  return api;
}
