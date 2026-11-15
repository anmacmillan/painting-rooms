// Points, things to pick up along the road, ditches to leap, a clock, and the way on to the next level. Shared by every street.
// The paintings are the main score: each tableau she reaches is worth far more than anything on the ground.
import { getName, setName, postScore, topScores } from './board.js';
export const LEVELS = [
  { key: 'florence', href: 'florence/street.html', name: 'Florence, about 1283', title: 'The New Life' },
  { key: 'caravaggio', href: 'caravaggio/street.html', name: 'Rome, about 1600', title: "The Painter's Light" },
  { key: 'vermeer', href: 'vermeer/street.html', name: 'Delft, about 1665', title: 'The Girl in Delft' },
  { key: 'munch', href: 'munch/street.html', name: 'Åsgårdstrand, 1901', title: 'The Night Road' },
];
const STORE = 'paintingRooms.v1';
export function loadScores() { try { return JSON.parse(localStorage.getItem(STORE)) || {}; } catch (e) { return {}; } }
function saveScores(s) { try { localStorage.setItem(STORE, JSON.stringify(s)); } catch (e) { /* private window: the run still counts on screen */ } }
const PTS = { pick: 10, leap: 25, painting: 150, finish: 300 };

// o: THREE, scene, key, at(s), nearest(x, z), LEN, groundY(x, z), blocked(x, z), paintings (how many tableaux the level has),
//    thing ('strawberry' | 'tile' | 'florin'), ditch (its name here: 'ditch', 'gutter', 'drain'), avoid (route distances to keep clear: the stagings), half (half-width of the road)
export function makeScore(o) {
  const { THREE, scene, at, LEN } = o, SND = window.Sound, half = o.half || 3.2, lvl = LEVELS.findIndex(l => l.key === o.key);
  const css = document.createElement('style'); css.textContent = `
    #scHud { position:fixed; top:14px; right:66px; z-index:6; font:italic 600 clamp(15px,2vw,19px) "Iowan Old Style",Palatino,Georgia,serif; color:#f4efe2; background:rgba(30,28,34,.62); border-radius:999px; padding:.35em .95em; pointer-events:none; letter-spacing:.02em; }
    #scHud b { font-style:normal; color:#f2c865; }
    #scToast { position:fixed; top:62px; left:50%; transform:translate(-50%,-8px); z-index:6; font:italic clamp(15px,2.2vw,20px) "Iowan Old Style",Palatino,Georgia,serif; color:#fff3c8; text-shadow:0 2px 8px rgba(0,0,0,.75); opacity:0; transition:opacity .25s, transform .25s; pointer-events:none; white-space:nowrap; }
    #scToast.show { opacity:1; transform:translate(-50%,0); }
    #scCard { font-size:clamp(14px,1.9vw,17px); line-height:1.5; margin:0; order:-1; } #scCard b { color:#f2c865; font-size:2.1em; font-weight:600; } #scCard i { opacity:.7; }
    a.go { display:inline-block; text-decoration:none; margin-top:.6em; font:inherit; font-size:clamp(17px,2.4vw,22px); color:var(--paper,#f4efe2); background:var(--go,#a8552e); border-radius:999px; padding:.6em 1.7em; box-shadow:0 6px 18px rgba(0,0,0,.4); }
    #end #again.second { background:transparent; box-shadow:none; border:1px solid rgba(244,239,226,.45); font-size:clamp(14px,1.8vw,17px); margin-top:.6em; }
    #scCard small { display:block; opacity:.75; font-size:.86em; }
    #scBoard { font-size:clamp(13px,1.7vw,16px); margin:.4em 0 0; min-height:1.2em; } #scBoard i { opacity:.7; } #scBoard ol { margin:.2em auto 0; padding:0; list-style:none; display:inline-block; text-align:left; } #scBoard li { display:flex; gap:1.2em; justify-content:space-between; } #scBoard li.me { color:#f2c865; }
    #scBoard input { font:inherit; padding:.3em .6em; border-radius:8px; border:0; width:9em; } #scBoard button { font:inherit; padding:.3em .9em; border-radius:999px; border:0; background:#f2c865; color:#2c2f36; cursor:pointer; }
    @media (max-width:620px) { #scHud { top:54px; right:14px; } #scToast { top:96px; } }`; document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'scHud'; hud.style.display = 'none'; document.body.appendChild(hud);
  const toast = document.createElement('div'); toast.id = 'scToast'; document.body.appendChild(toast);
  const say = (t) => { toast.textContent = t; toast.classList.add('show'); toastT = 1.9; };

  // --- what lies on the road
  const lam = c => new THREE.MeshLambertMaterial(c), glow = c => new THREE.MeshBasicMaterial({ color: c });
  function thing() {
    const g = new THREE.Group();
    if (o.thing === 'florin') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 20), glow('#f0c13a')); c.rotation.x = Math.PI / 2; g.add(c); const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 6, 22), glow('#b8861c')); g.add(r); }
    else if (o.thing === 'scudo') { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.035, 20), glow('#d4d8de')); c.rotation.x = Math.PI / 2; g.add(c); const r = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.022, 6, 22), glow('#8a9098')); g.add(r); }
    else if (o.thing === 'tile') { const t = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.34, 0.04), glow('#f1efe6')); g.add(t); for (const z of [0.024, -0.024]) { const b = new THREE.Mesh(new THREE.CircleGeometry(0.1, 4), glow('#2b56a8')); b.position.z = z; if (z < 0) b.rotation.y = Math.PI; g.add(b); } }
    else { const b = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), glow('#e2332b')); b.scale.set(1, 1.2, 1); g.add(b); const l = new THREE.Mesh(new THREE.ConeGeometry(0.13, 0.09, 6), glow('#3f8a3a')); l.position.y = 0.2; g.add(l); }
    return g;
  }
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'), r = g.createRadialGradient(48, 48, 2, 48, 48, 48); r.addColorStop(0, 'rgba(255,236,170,.85)'); r.addColorStop(0.35, 'rgba(255,214,120,.35)'); r.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = r; g.fillRect(0, 0, 96, 96); return new THREE.CanvasTexture(c); })();
  const haloM = new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const clear = s => !(o.avoid || []).some(a => Math.abs(a - s) < 16) && s > 14 && s < LEN - 16;
  const spot = (s, off) => { const p = at(s); return [p.x - p.dz * off, p.z + p.dx * off, p]; };
  const picks = [], ditches = [];
  for (let s = 22, i = 0; s < LEN - 18; s += 19, i++) {
    if (!clear(s)) continue; const off = [-1.5, 0, 1.5, 0.8, -0.8][i % 5], [x, z] = spot(s, off); if (o.blocked(x, z)) continue;
    const high = i % 4 === 3, g = thing(); { const h = new THREE.Sprite(haloM); h.scale.setScalar(1.5); g.add(h); } g.userData = { x, z, y: o.groundY(x, z) + (high ? 2.0 : 0.85), ph: i * 1.7 }; g.position.set(x, g.userData.y, z); scene.add(g); picks.push(g);
  }
  const ditchTex = (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d'); g.fillStyle = o.ditchColor || '#16263c'; g.fillRect(0, 0, 256, 64);
    for (let k = 0; k < 60; k++) { g.strokeStyle = `rgba(${150 + Math.random() * 90},${190 + Math.random() * 50},255,${0.12 + Math.random() * 0.3})`; g.lineWidth = 1 + Math.random() * 2; const y = Math.random() * 64, x = Math.random() * 256; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 14, y - 3, x + 26, y + 3, x + 40 + Math.random() * 30, y); g.stroke(); } const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; return t; })();
  const ditchM = new THREE.MeshBasicMaterial({ map: ditchTex }), lipM = lam({ color: o.lipColor || '#6a5a48' }), darkM = new THREE.MeshBasicMaterial({ color: '#07090d' });
  for (const f of o.ditches || [0.22, 0.48, 0.7]) {
    let s = f * LEN; for (let k = 0; k < 6 && !clear(s); k++) s += 12; if (!clear(s)) continue;
    const [x, z, p] = spot(s, 0), y = o.groundY(x, z), g = new THREE.Group(), w = 1.7;
    const water = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.06, w), ditchM); g.add(water);
    for (const e of [-1, 1]) { const lip = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.26, 0.24), lipM); lip.position.set(0, 0.1, e * (w / 2 + 0.1)); g.add(lip); const sh = new THREE.Mesh(new THREE.BoxGeometry(half * 2, 0.07, 0.3), darkM); sh.position.set(0, 0.0, e * (w / 2 - 0.16)); g.add(sh); }
    g.position.set(x, y + 0.035, z); g.rotation.y = Math.atan2(p.dx, p.dz); scene.add(g); ditches.push({ s, w, x, z, wet: false, leapt: false, inside: false });
  }

  let pts = 0, got = 0, leaps = 0, seen = new Set(), clock = 0, running = false, toastT = 0, lastS = 0;
  const show = () => { hud.innerHTML = `<b>${pts}</b> · ${seen.size}/${o.paintings} paintings`; };
  function start() { pts = 0; got = 0; leaps = 0; seen = new Set(); clock = 0; running = true; lastS = 0; for (const g of picks) g.visible = true; for (const d of ditches) d.wet = d.leapt = d.inside = false; hud.style.display = ''; show(); const c = document.getElementById('scCard'); if (c) c.remove(); }
  function award(id, n, label) { if (!running || seen.has(id)) return; seen.add(id); pts += n ?? PTS.painting; say(`+${n ?? PTS.painting}  ${label || id}`); show(); }
  // returns true on the frame she blunders into a ditch, so the game can check her speed
  function update(dt, me, playing, time = performance.now() / 1000) {
    if (toastT > 0 && (toastT -= dt) <= 0) toast.classList.remove('show');
    ditchTex.offset.x = time * 0.12;
    for (const g of picks) if (g.visible) { g.rotation.y += dt * 2.2; g.position.y = g.userData.y + Math.sin(time * 2.4 + g.userData.ph) * 0.09; }
    if (!running || !playing) return false; clock += dt; let stumble = false;
    for (const g of picks) if (g.visible) { const u = g.userData; if (Math.abs(me.x - u.x) < 1.0 && Math.abs(me.z - u.z) < 1.0 && Math.abs(me.y + 0.9 - u.y) < 1.25) { g.visible = false; got++; pts += PTS.pick; show(); if (SND && SND.bell) SND.bell(4 + (got % 7), 0.05); } }
    const s = o.nearest(me.x, me.z).s;
    for (const d of ditches) { const inside = Math.abs(s - d.s) < d.w / 2 - 0.3 && Math.hypot(me.x - d.x, me.z - d.z) < half + 0.5;
      if (inside && !me.air && !d.wet) { d.wet = true; stumble = true; say(`${o.wet === false ? 'Oof!' : 'Splash!'} Leap the ${o.ditch || 'ditch'} next time`); if (SND && SND.puff) SND.puff(0.12); }
      if (d.inside && !inside && !d.wet && !d.leapt && s > d.s) { d.leapt = true; leaps++; pts += PTS.leap; say(`+${PTS.leap}  Leapt the ${o.ditch || 'ditch'}`); show(); if (SND && SND.bell) SND.bell(9, 0.06); }
      if (!inside && d.wet && Math.abs(s - d.s) > 6) d.wet = false;      // she may come back and try it again, but the leap only pays once
      d.inside = inside; }
    lastS = s; return stumble;
  }
  function finish() {
    if (!running) return; running = false; hud.style.display = 'none';
    const secs = Math.round(clock), bonus = Math.max(0, 5 * Math.round((300 - secs) / 5)); pts += PTS.finish + bonus;
    const all = loadScores(), was = all[o.key] || {}, best = Math.max(was.best || 0, pts); all[o.key] = { best, time: Math.min(was.time || 1e9, secs), paintings: Math.max(was.paintings || 0, seen.size), runs: (was.runs || 0) + 1 }; saveScores(all);
    const total = LEVELS.reduce((t, l) => t + ((all[l.key] || {}).best || 0), 0), next = LEVELS[lvl + 1], mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
    const end = document.getElementById('end'), again = document.getElementById('again'), card = document.createElement('p'); card.id = 'scCard';
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    card.innerHTML = `<i>Level ${lvl + 1} of ${LEVELS.length}</i><br><b>${pts}</b> points${pts >= best && was.best ? ' · a new best!' : was.best ? ` · your best is ${best}` : ''}` +
      `<small>${seen.size} of ${o.paintings} paintings · ${got} ${o.things || 'found'} · ${plural(leaps, 'leap')} · ${mm}:${ss}` + (bonus ? ` · +${bonus} for speed` : '') + `</small>` +
      (total > pts ? `<small>All levels together: ${total}</small>` : '');
    end.insertBefore(card, end.firstChild); again.classList.add('second');
    let a = document.getElementById('scNext'); if (a) a.remove();
    a = document.createElement('a'); a.id = 'scNext'; a.className = 'go'; a.href = next ? '../' + next.href : '../index.html'; a.textContent = next ? `Next: ${next.name}` : 'Back to the gallery'; end.insertBefore(a, card.nextSibling); board(end, a, pts, secs);
  }
  // the family board: her best for this level, and the top five
  function board(end, after, points, secs) {
    const old = document.getElementById('scBoard'); if (old) old.remove(); const bd = document.createElement('div'); bd.id = 'scBoard'; end.insertBefore(bd, after.nextSibling);
    const draw = async () => { try {
      if (getName()) await postScore(o.key, points, secs); const top = await topScores(o.key); bd.textContent = '';
      if (!getName()) { const f = document.createElement('form'); f.innerHTML = '<label>Put your score on the family board: <input maxlength="16" placeholder="a nickname" autocomplete="off"></label> <button>Add</button>'; const inp = f.querySelector('input'); inp.addEventListener('keydown', e => e.stopPropagation()); inp.addEventListener('keyup', e => e.stopPropagation());
        f.onsubmit = e => { e.preventDefault(); if (setName(inp.value)) draw(); }; bd.appendChild(f); }
      if (top.length) { const h = document.createElement('i'); h.textContent = 'Family board'; bd.appendChild(h); bd.appendChild(document.createElement('br')); const ol = document.createElement('ol');
        top.forEach((r, k) => { const li = document.createElement('li'), a = document.createElement('span'), b = document.createElement('span'); a.textContent = `${k + 1}. ${r.n}`; b.textContent = r.p; li.append(a, b); if (r.n === getName()) li.className = 'me'; ol.appendChild(li); }); bd.appendChild(ol); }
    } catch (e) { bd.textContent = ''; } };      // no network: the card simply has no board
    draw();
  }
  const api = { start, award, update, finish, get points() { return pts; }, picks, ditches }; window.__sc = api; return api;
}
