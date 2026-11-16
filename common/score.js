// Points, things to pick up along the road, ditches to leap, a clock, and the way on to the next level. Shared by every street.
// The paintings are the main score: each tableau she reaches is worth far more than anything on the ground.
import { getName, setName, postScore, topScores } from './board.js';
export const LEVELS = [
  { key: 'phidias', at: [23.73, 37.97], href: 'phidias/street.html', name: 'Athens, 438 BC', place: 'Athens', year: '438 BC', title: 'The Procession', by: 'Phidias', img: 'phidias/images/frieze.jpg', paintings: 4, coin: 'owls' },
  { key: 'florence', at: [11.25, 43.77], href: 'florence/street.html', name: 'Florence, about 1283', place: 'Florence', year: '1283', title: 'The New Life', by: 'Rossetti and Holiday', img: 'florence/images/holiday.jpg', paintings: 3, coin: 'florins' },
  { key: 'caravaggio', at: [12.47, 41.90], href: 'caravaggio/street.html', name: 'Rome, about 1600', place: 'Rome', year: '1600', title: "The Painter's Light", by: 'Caravaggio', img: 'caravaggio/images/calling.jpg', paintings: 3, coin: 'scudi' },
  { key: 'rubens', at: [4.4015, 51.2203], href: 'rubens/street.html', name: 'Antwerp, about 1612', place: 'Antwerp', year: '1612', title: "The Painter's Errand", by: 'Rubens', img: 'rubens/images/descent.jpg', paintings: 3, coin: 'patagons' },
  { key: 'vermeer', at: [4.36, 52.01], href: 'vermeer/street.html', name: 'Delft, about 1665', place: 'Delft', year: '1665', title: 'The Girl in Delft', by: 'Vermeer', img: 'vermeer/images/pearl.jpg', paintings: 3, coin: 'ducats' },
  { key: 'turner', at: [-0.70, 51.52], href: 'turner/street.html', name: 'Maidenhead, 1844', place: 'Maidenhead', year: '1844', title: 'Rain, Steam and Speed', by: 'Turner', img: 'turner/images/rain_steam_speed.jpg', paintings: 2, coin: 'shillings' },
  { key: 'alice', at: [-1.26, 51.75], href: 'alice/street.html', name: 'Oxford, 1865', place: 'Oxford', year: '1865', title: 'Down the Rabbit-Hole', by: 'Tenniel', img: 'alice/images/rabbit.jpg', paintings: 6, coin: 'sovereigns' },
  { key: 'monet', at: [2.15, 48.88], href: 'monet/street.html', name: 'the Seine, 1869', place: 'Croissy', year: '1869', title: 'La Grenouillère', by: 'Monet and Renoir', img: 'monet/images/grenouillere.jpg', paintings: 2, coin: 'francs' },
  { key: 'sargent', at: [-1.86, 52.04], href: 'sargent/street.html', name: 'Broadway, 1885', place: 'Broadway', year: '1885', title: 'Carnation, Lily, Lily, Rose', by: 'Sargent', img: 'sargent/images/carnation.jpg', paintings: 2, coin: 'shillings', two: true },
  { key: 'vangogh', at: [4.63, 43.68], href: 'vangogh/street.html', name: 'Arles, 1888', place: 'Arles', year: '1888', title: 'The Stars over Arles', by: 'Van Gogh', img: 'vangogh/images/rhone.jpg', paintings: 4, coin: 'francs' },
  { key: 'munch', at: [10.47, 59.35], href: 'munch/street.html', name: 'Åsgårdstrand, 1901', place: 'Åsgårdstrand', year: '1901', title: 'The Night Road', by: 'Munch', img: 'munch/paintings/girls_bridge.jpg', paintings: 2, coin: 'kroner' },
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
    #scHud { position:fixed; top:12px; right:66px; z-index:6; font:italic 600 clamp(14px,1.7vw,17px) "Iowan Old Style",Palatino,Georgia,serif; color:#f4efe2; background:rgba(30,28,34,.72); border:1px solid rgba(242,200,101,.55); border-radius:999px; padding:.3em 1em .3em .5em; pointer-events:none; letter-spacing:.02em; display:flex; align-items:center; gap:.55em; transform-origin:100% 50%; }
    #scHud .coin { width:1.7em; height:1.7em; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff3b8, #f0c13a 55%, #b8861c); box-shadow:0 0 10px rgba(242,200,101,.7); flex:none; }
    #scHud .n { font-size:clamp(24px,3.4vw,38px); line-height:1; font-style:normal; color:#f2c865; min-width:1.6em; text-align:right; font-variant-numeric:tabular-nums; }
    #scHud small { display:block; font-size:.86em; opacity:.85; line-height:1.25; }
    #scHud.hurt { animation:scHurt .4s ease-out; } @keyframes scHurt { 0%, 100% { transform:translateX(0); } 20% { transform:translateX(-7px); background:rgba(150,30,30,.85); } 60% { transform:translateX(6px); } }
    #scHud .x { color:#ffe9a0; font-weight:700; }
    #scHud.bump { animation:scBump .34s ease-out; } #scHud.bump .coin { animation:scSpin .34s linear; }
    @keyframes scBump { 0% { transform:scale(1); } 35% { transform:scale(1.22); } 100% { transform:scale(1); } } @keyframes scSpin { to { transform:rotateY(360deg); } }
    .scFly { position:fixed; z-index:7; font:700 clamp(34px,6vw,64px) "Iowan Old Style",Palatino,Georgia,serif; color:#ffe08a; -webkit-text-stroke:1.5px rgba(60,35,5,.85); text-shadow:0 3px 12px rgba(0,0,0,.75); pointer-events:none; animation:scFly 1.25s ease-out forwards; } .scFly.bad { color:#ff8f7a; -webkit-text-stroke:1.5px rgba(70,10,5,.85); }
    #scWho { display:block; font-size:.86em; line-height:1.25; color:#ffe9a0; pointer-events:auto; cursor:pointer; white-space:nowrap; }
    @keyframes scFly { 0% { opacity:0; transform:translate(-50%, 30px) scale(.5) rotate(-6deg); } 18% { opacity:1; transform:translate(-50%, 0) scale(1.25) rotate(3deg); } 34% { transform:translate(-50%, -6px) scale(1) rotate(0); } 75% { opacity:1; } 100% { opacity:0; transform:translate(-50%, -110px) scale(.9); } }
    
    #scToast { position:fixed; top:62px; left:50%; transform:translate(-50%,-8px); z-index:6; font:italic clamp(15px,2.2vw,20px) "Iowan Old Style",Palatino,Georgia,serif; color:#fff3c8; text-shadow:0 2px 8px rgba(0,0,0,.75); opacity:0; transition:opacity .25s, transform .25s; pointer-events:none; white-space:nowrap; }
    #scToast.show { opacity:1; transform:translate(-50%,0); }
    #scCard { font-size:clamp(14px,1.9vw,17px); line-height:1.5; margin:0; order:-1; } #scCard b { color:#f2c865; font-size:2.1em; font-weight:600; } #scCard i { opacity:.7; }
    a.go { display:inline-block; text-decoration:none; margin-top:.6em; font:inherit; font-size:clamp(17px,2.4vw,22px); color:var(--paper,#f4efe2); background:var(--go,#a8552e); border-radius:999px; padding:.6em 1.7em; box-shadow:0 6px 18px rgba(0,0,0,.4); }
    #end #again.second { background:transparent; box-shadow:none; border:1px solid rgba(244,239,226,.45); font-size:clamp(14px,1.8vw,17px); margin-top:.6em; }
    /* level complete: a banner that drops in, coins that rain, and three plain choices along the foot of the screen with the whole road beside them */
    #scWin { position:fixed; top:9%; left:50%; z-index:30; transform:translateX(-50%); text-align:center; pointer-events:none; font:700 clamp(30px,6vw,74px)/1.05 "Iowan Old Style",Palatino,Georgia,serif; color:#ffe08a; -webkit-text-stroke:2px rgba(60,35,5,.9); text-shadow:0 6px 22px rgba(0,0,0,.75); animation:scWin 4.2s cubic-bezier(.2,1.5,.4,1) forwards; white-space:nowrap; }
    #scWin small { display:block; font-size:.5em; letter-spacing:.2em; -webkit-text-stroke:1px rgba(60,35,5,.9); } #scWin small i { font-style:normal; opacity:.3; }
    @keyframes scWin { 0% { opacity:0; transform:translate(-50%,-120%) scale(.4) rotate(-8deg); } 14% { opacity:1; transform:translate(-50%,0) scale(1.12) rotate(2deg); } 22% { transform:translate(-50%,0) scale(1) rotate(0); } 84% { opacity:1; transform:translate(-50%,0) scale(1); } 100% { opacity:0; transform:translate(-50%,-30%) scale(.9); } }
    .scRain { position:fixed; top:-40px; z-index:29; width:26px; height:26px; border-radius:50%; background:radial-gradient(circle at 35% 30%, #fff3b8, #f0c13a 55%, #b8861c); box-shadow:0 0 8px rgba(242,200,101,.7); pointer-events:none; animation:scRain linear forwards; } @keyframes scRain { to { transform:translateY(112vh) rotateY(900deg); } }
    #scDone { position:fixed; left:0; right:0; bottom:0; z-index:31; display:flex; flex-wrap:wrap; gap:.5em .8em; align-items:center; justify-content:center; padding:.8em 1em calc(.8em + env(safe-area-inset-bottom)); background:linear-gradient(rgba(16,18,26,0), rgba(16,18,26,.94) 30%); font:600 clamp(15px,1.9vw,22px) "Iowan Old Style",Palatino,Georgia,serif; animation:scUp .5s .9s ease-out both; } @keyframes scUp { from { transform:translateY(100%); } }
    #scDone a, #scDone button { font:inherit; text-decoration:none; cursor:pointer; border:0; border-radius:999px; padding:.55em 1.3em; color:#f4efe2; background:rgba(255,255,255,.14); box-shadow:inset 0 0 0 1.5px rgba(244,239,226,.45); white-space:nowrap; }
    #scDone a.next { color:#23262c; background:linear-gradient(#ffe89a, #f2c14a); font-size:1.3em; box-shadow:0 8px 22px rgba(0,0,0,.5), inset 0 -3px 0 rgba(0,0,0,.16); animation:scBeat 1.5s ease-in-out infinite; } @keyframes scBeat { 50% { transform:scale(1.07); box-shadow:0 8px 28px rgba(255,209,102,.75); } }
    #scDone .road { flex:1 0 100%; display:flex; gap:6px; justify-content:center; flex-wrap:wrap; } #scDone .road a { position:relative; width:clamp(34px,4.4vw,58px); aspect-ratio:1; padding:0; border-radius:6px; background:#111 center/cover; box-shadow:inset 0 0 0 2px #8a8f98; filter:grayscale(1) brightness(.6); } #scDone .road a.done { filter:none; box-shadow:inset 0 0 0 2.5px #f2c865; } #scDone .road a.me { outline:3px solid #fff; outline-offset:1px; }
    #scDone .road a.done::after { content:"★"; position:absolute; top:-9px; right:-7px; color:#ffe08a; font-size:16px; text-shadow:0 1px 3px #000; } #scDone .road span { flex:1 0 100%; text-align:center; font-weight:400; font-style:italic; font-size:.78em; opacity:.85; }
    #end { padding-bottom:13em !important; }
    #scCard small { display:block; opacity:.75; font-size:.86em; }
    #scBoard { font-size:clamp(13px,1.7vw,16px); margin:.4em 0 0; min-height:1.2em; } #scBoard i { opacity:.7; } #scBoard ol { margin:.2em auto 0; padding:0; list-style:none; display:inline-block; text-align:left; } #scBoard li { display:flex; gap:1.2em; justify-content:space-between; } #scBoard li.me { color:#f2c865; }
    #scBoard input { font:inherit; padding:.3em .6em; border-radius:8px; border:0; width:9em; } #scBoard button { font:inherit; padding:.3em .9em; border-radius:999px; border:0; background:#f2c865; color:#2c2f36; cursor:pointer; }
    @media (max-width:620px) { #scHud { top:54px; right:14px; } #scToast { top:96px; } }`; document.head.appendChild(css);
  const hud = document.createElement('div'); hud.id = 'scHud'; hud.style.display = 'none'; document.body.appendChild(hud);
  const toast = document.createElement('div'); toast.id = 'scToast'; document.body.appendChild(toast);
  const say = (t) => { toast.textContent = t; toast.classList.add('show'); toastT = 1.9; };

  // --- what lies on the road
  const lam = c => new THREE.MeshLambertMaterial(c), glow = c => new THREE.MeshBasicMaterial({ color: c });
  // the coin of the place and time: Florence's gold florin, Rome's silver scudo, the Dutch gold ducat, the Norwegian silver krone
  const COINS = { florin: ['#f0c13a', '#b8861c'], scudo: ['#d4d8de', '#8a9098'], ducat: ['#f3cf4a', '#a8781a'], krone: ['#dfe3e8', '#7f8894'], shilling: ['#e6e9ee', '#8a929c'], franc: ['#f0d264', '#a8842a'], owl: ['#e3e6ea', '#868e98'], patagon: ['#dde1e6', '#80888f'], sovereign: ['#f3cf4a', '#a8781a'] };
  function thing() {
    const g = new THREE.Group(), [face, rim] = COINS[o.thing] || COINS.florin, mats = [new THREE.MeshBasicMaterial({ color: face, transparent: true }), new THREE.MeshBasicMaterial({ color: rim, transparent: true })];
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.21, 0.21, 0.04, 22), mats[0]); c.rotation.x = Math.PI / 2; g.add(c); const r = new THREE.Mesh(new THREE.TorusGeometry(0.21, 0.024, 6, 24), mats[1]); g.add(r);
    for (const z of [0.022, -0.022]) { const d = new THREE.Mesh(new THREE.CircleGeometry(0.11, 5), mats[1]); d.position.z = z; if (z < 0) d.rotation.y = Math.PI; g.add(d); }      // a stamped device on each face
    g.userData.mats = mats; return g;
  }
  const haloTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'), r = g.createRadialGradient(48, 48, 2, 48, 48, 48); r.addColorStop(0, 'rgba(255,236,170,.85)'); r.addColorStop(0.35, 'rgba(255,214,120,.35)'); r.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = r; g.fillRect(0, 0, 96, 96); return new THREE.CanvasTexture(c); })();
  const haloM = new THREE.SpriteMaterial({ map: haloTex, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true });
  const clear = s => !(o.avoid || []).some(a => Math.abs(a - s) < 16) && s > 14 && s < LEN - 16;
  const spot = (s, off) => { const p = at(s); return [p.x - p.dz * off, p.z + p.dx * off, p]; };
  const picks = [], ditches = [];
  const addPick = (x, z, y, i) => { const g = thing(), mats = g.userData.mats, h = new THREE.Sprite(haloM.clone()); h.scale.setScalar(1.5); g.add(h); mats.push(h.material); g.userData = { x, z, y, ph: i * 1.7, mats, pop: 0 }; g.position.set(x, y, z); scene.add(g); picks.push(g); };
  for (let s = 22, i = 0; s < LEN - 18; s += 19, i++) {
    if (!clear(s)) continue; const off = [-1.5, 0, 1.5, 0.8, -0.8][i % 5], [x, z] = spot(s, off); if (o.blocked(x, z)) continue;
    addPick(x, z, o.groundY(x, z) + (i % 4 === 3 ? 2.0 : 0.85), i);
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
    // three coins in an arc over it: the reward for leaping is in the air
    [[-1.9, 1.25], [0, 2.05], [1.9, 1.25]].forEach(([u, h], k) => { const q = at(s + u); if (!o.blocked(q.x, q.z)) addPick(q.x, q.z, o.groundY(q.x, q.z) + h, 100 + k); });
  }

  const hurdles = [], barrelM = lam({ color: o.barrelColor || '#7a5632' }), hoopM = lam({ color: '#2a2622' });
  (o.hurdles || [0.13, 0.36, 0.58, 0.85]).forEach((f, k) => { let s = f * LEN; for (let n = 0; n < 6 && (!clear(s) || ditches.some(d => Math.abs(d.s - s) < 10)); n++) s += 9; if (!clear(s)) return;
    const [x, z, p] = spot(s, k % 2 ? 1.0 : -1.0); if (o.blocked(x, z)) return; const g = new THREE.Group();
    for (const e of [-0.42, 0.42]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.31, 0.86, 14), barrelM); b.position.set(e, 0.43, 0); b.castShadow = true; g.add(b); for (const hy of [0.2, 0.66]) { const h = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.022, 5, 16), hoopM); h.rotation.x = Math.PI / 2; h.position.set(e, hy, 0); g.add(h); } }
    g.position.set(x, o.groundY(x, z), z); g.rotation.y = Math.atan2(p.dx, p.dz) + Math.PI / 2; scene.add(g); hurdles.push({ x, z, hit: false, over: false, vaulted: false }); });
  // ---- the life of the street: washing hung across the lane, slops emptied from a window, a drunk weaving out of a tavern ----
  const isHouse = o.isHouse || o.blocked, wallFrom = (p, sg, max = 9.5) => { for (let d = 1.6; d <= max; d += 0.25) { const x = p.x - p.dz * sg * d, z = p.z + p.dx * sg * d; if (isHouse(x, z)) return isHouse(x - p.dz * sg * 0.8, z + p.dx * sg * 0.8) ? [x, z, d] : null; } return null; };
  const free = s => clear(s) && !ditches.some(d => Math.abs(d.s - s) < 9);
  const lines = [], clothM = ['#f1ede2', '#e6dcc4', '#9fb4c8', '#b5543f', '#e9e4d6'].map(c => new THREE.MeshLambertMaterial({ color: c, side: THREE.DoubleSide })), ropeM = lam({ color: '#6a5a44' });
  if (o.washing !== false) for (const f of [0.1, 0.27, 0.41, 0.63, 0.78, 0.93]) { if (lines.length >= 4) break; const s = f * LEN; if (!free(s)) continue; const p = at(s), a = wallFrom(p, 1), b = wallFrom(p, -1); if (!a || !b) continue;
    const y0 = o.groundY(p.x, p.z) + 3.5, L = Math.hypot(a[0] - b[0], a[1] - b[1]), g = new THREE.Group(), rope = new THREE.Mesh(new THREE.BoxGeometry(L, 0.03, 0.03), ropeM); g.add(rope); const hung = [];
    for (let u = -L / 2 + 0.7, k = 0; u < L / 2 - 0.6; k++) { const w = 0.45 + ((k * 37) % 5) * 0.12, h = 0.6 + ((k * 53) % 4) * 0.16, c = new THREE.Mesh(new THREE.PlaneGeometry(w, h), clothM[(k + lines.length) % clothM.length]); c.geometry.translate(0, -h / 2, 0); c.position.set(u + w / 2, -0.02, 0); c.rotation.y = Math.PI / 2; g.add(c); hung.push(c); u += w + 0.14; }
    g.position.set((a[0] + b[0]) / 2, y0, (a[1] + b[1]) / 2); g.rotation.y = -Math.atan2(a[1] - b[1], a[0] - b[0]); scene.add(g); lines.push({ hung, ph: lines.length * 1.3 });
    addPick(p.x, p.z, y0 - 1.45, 200 + lines.length); }      // a coin hangs under the washing, a leap away
  const slops = [], slopM = lam({ color: '#5a4a2a' }), shadeM = new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.0, depthWrite: false });
  if (o.slops) for (const f of [0.2, 0.46, 0.7, 0.88]) { let s = f * LEN; for (let n = 0; n < 5 && (!free(s) || hurdles.some(h => Math.hypot(h.x - at(s).x, h.z - at(s).z) < 7)); n++) s += 8; if (!free(s)) continue;
    const p = at(s), sg = slops.length % 2 ? 1 : -1, w = wallFrom(p, sg) || wallFrom(p, -sg); if (!w) continue; const k = Math.max(0.15, 1 - 1.3 / w[2]), x = p.x + (w[0] - p.x) * (1 - k) * 0.5, z = p.z + (w[1] - p.z) * (1 - k) * 0.5, gy = o.groundY(x, z);
    const shade = new THREE.Mesh(new THREE.CircleGeometry(1.25, 20), shadeM.clone()); shade.rotation.x = -Math.PI / 2; shade.position.set(x, gy + 0.05, z); scene.add(shade);
    const blob = new THREE.Group(); for (let i = 0; i < 7; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.16 + (i % 3) * 0.06, 8, 6), slopM); b.position.set(Math.cos(i * 2.4) * 0.35, i * 0.22, Math.sin(i * 2.4) * 0.35); blob.add(b); } blob.visible = false; scene.add(blob);
    const pail = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.3, 10), lam({ color: '#6a4a30' })); pail.position.set(x + (w[0] - x) * 0.82, gy + 4.3, z + (w[1] - z) * 0.82); pail.visible = false; scene.add(pail);
    slops.push({ s, x, z, gy, shade, blob, pail, state: 'idle', t: 0, near: false }); }
  // a few of the townspeople have had too much: they weave right across the way, and walking into one costs you
  const drunks = (o.walkers || []).filter((w, i) => i % 9 === 4).slice(0, 4).map((w, i) => ({ w, base: w.off, ph: i * 2.1, cool: 0 }));
  // ---- two gifts on the road: wings on her heels (she runs much faster for a while) and a laurel crown (every gain is doubled) ----
  const powers = [], power = { wings: 0, laurel: 0 };
  if (o.powerups !== false) [['wings', 0.3], ['laurel', 0.62]].forEach(([kind, f]) => { let s = f * LEN; for (let n = 0; n < 6 && !free(s); n++) s += 8; if (!free(s)) return; const p = at(s); if (o.blocked(p.x, p.z)) return; const g = new THREE.Group();
    if (kind === 'wings') for (const e of [-1, 1]) { const w = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 3), glow('#f4f8ff')); w.scale.z = 0.25; w.rotation.z = e * 1.15; w.position.set(e * 0.3, 0.05, 0); g.add(w); }
    else { g.add(new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.06, 6, 20), glow('#4f9a4a'))); for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.05, 6, 5), glow('#f2c865')); b.position.set(Math.cos(i * 1.05) * 0.3, Math.sin(i * 1.05) * 0.3, 0.05); g.add(b); } }
    const h = new THREE.Sprite(new THREE.SpriteMaterial({ map: haloTex, color: kind === 'wings' ? 0xbfe0ff : 0xc8ffb0, blending: THREE.AdditiveBlending, depthWrite: false, transparent: true })); h.scale.setScalar(2.4); g.add(h);
    const y = o.groundY(p.x, p.z) + 1.05; g.position.set(p.x, y, p.z); scene.add(g); powers.push({ kind, g, x: p.x, z: p.z, y }); });
  const gm = () => Math.min(4, mult * (power.laurel > 0 ? 2 : 1));
  let pts = 0, got = 0, leaps = 0, seen = new Set(), clock = 0, running = false, toastT = 0, lastS = 0, streak = 0, lastGain = -9, mult = 1;
  const flow = n => { streak = clock - lastGain < 3.2 ? streak + n : n; lastGain = clock; const m = 1 + Math.min(3, Math.floor(streak / 4)); if (m > mult) say(`×${m}  keep it flowing!`); mult = m; };
  const lose = (n, msg) => { if (n > 0 && typeof fly === 'function') fly('−' + n, true); pts = Math.max(0, pts - n); streak = 0; mult = 1; say(msg); show(); hud.classList.remove('hurt'); void hud.offsetWidth; hud.classList.add('hurt'); if (SND && SND.puff) SND.puff(0.12); };
  hud.innerHTML = '<span class="coin"></span><span class="n">0</span><span><span id="scWho"></span><small class="p"></small><small class="c"></small></span>';
  // the place, the year and who is playing; a tap on it sets or changes the nickname
  const who = hud.querySelector('#scWho'), L = LEVELS[lvl], paintWho = () => { who.textContent = (L ? `${L.place}, ${L.year}` : '') + ' · ' + (getName() || 'who is playing?'); };
  who.addEventListener('click', () => { const n = window.prompt('A nickname for the family board', getName() || ''); if (n != null && n.trim()) { setName(n.trim()); paintWho(); } }); paintWho(); const hN = hud.querySelector('.n'), hP = hud.querySelector('.p'), hC = hud.querySelector('.c');
  const show = () => { hN.textContent = pts; hP.textContent = `${seen.size} of ${o.paintings} paintings`; hC.innerHTML = `${got} ${o.things || 'coins'}` + (gm() > 1 ? ` <span class="x">×${gm()}</span>` : '') + (power.wings > 0 ? ` <span class="x">🪽${Math.ceil(power.wings)}</span>` : '') + (power.laurel > 0 ? ` <span class="x">🌿${Math.ceil(power.laurel)}</span>` : ''); };
  const fly = (txt, bad) => { const f = document.createElement('div'); f.className = 'scFly' + (bad ? ' bad' : ''); f.textContent = txt; f.style.left = (50 + (Math.random() - 0.5) * 14) + '%'; f.style.top = (30 + (Math.random() - 0.5) * 6) + '%'; document.body.appendChild(f); setTimeout(() => f.remove(), 1300); };
  const bump = gain => { hud.classList.remove('bump'); void hud.offsetWidth; hud.classList.add('bump'); fly('+' + gain); };
  const chime = () => { if (!SND || !SND.bell) return; const k = Math.min(6, Math.floor(streak / 2)); SND.bell(5 + k, 0.075); SND.bell(7 + k, 0.07, 0.07); SND.bell(9 + k, 0.05, 0.15); };      // three quick rising notes, higher as the run of coins grows      // three quick rising notes: a coin taken
  function start() { clearWin(); pts = 0; got = 0; leaps = 0; seen = new Set(); clock = 0; running = true; lastS = 0; for (const g of picks) { g.visible = true; g.userData.pop = 0; g.scale.setScalar(1); for (const m of g.userData.mats) m.opacity = 1; } for (const d of ditches) d.wet = d.leapt = d.inside = false; for (const h of hurdles) h.hit = h.over = h.vaulted = false; power.wings = power.laurel = 0; for (const q of powers) q.g.visible = true; for (const q of slops) { q.state = 'idle'; q.blob.visible = false; q.pail.visible = false; q.shade.material.opacity = 0; } streak = 0; mult = 1; lastGain = -9; hud.style.display = ''; show(); const c = document.getElementById('scCard'); if (c) c.remove(); }
  function award(id, n, label) { if (!running || seen.has(id)) return; seen.add(id); pts += n ?? PTS.painting; say(`+${n ?? PTS.painting}  ${label || id}`); show(); bump(n ?? PTS.painting); if (SND && SND.bell) [4, 6, 8, 11].forEach((k, i) => SND.bell(k, 0.07, i * 0.09)); }
  // returns true on the frame she blunders into a ditch, so the game can check her speed
  function update(dt, me, playing, time = performance.now() / 1000) {
    if (toastT > 0 && (toastT -= dt) <= 0) toast.classList.remove('show');
    ditchTex.offset.x = time * 0.12;
    for (const g of picks) if (g.visible) { const u = g.userData;
      if (u.pop > 0) { u.pop -= dt; const k = 1 - Math.max(0, u.pop) / 0.45; g.rotation.y += dt * 18; g.position.y = u.y + k * 1.5; g.scale.setScalar(1 + k * 1.3); for (const m of u.mats) m.opacity = 1 - k * k; if (u.pop <= 0) g.visible = false; }
      else { g.rotation.y += dt * 2.2; g.position.y = u.y + Math.sin(time * 2.4 + u.ph) * 0.09; } }
    if (!running || !playing) return false; clock += dt; let stumble = false;
    for (const g of picks) if (g.visible && !g.userData.pop) { const u = g.userData; if (Math.abs(me.x - u.x) < 1.1 && Math.abs(me.z - u.z) < 1.1 && Math.abs(me.y + 0.9 - u.y) < 1.3) { u.pop = 0.45; got++; flow(1); const gain = PTS.pick * gm(); pts += gain; show(); bump(gain); chime(); } }
    const s = o.nearest(me.x, me.z).s;
    for (const d of ditches) { const inside = Math.abs(s - d.s) < d.w / 2 - 0.3 && Math.hypot(me.x - d.x, me.z - d.z) < half + 0.5;
      if (inside && !me.air && !d.wet) { d.wet = true; stumble = true; lose(15, `${o.wet === false ? 'Oof!' : 'Splash!'} −15. Leap the ${o.ditch || 'ditch'}!`); }
      if (d.inside && !inside && !d.wet && !d.leapt && s > d.s) { d.leapt = true; leaps++; flow(2); const gain = PTS.leap * gm(); pts += gain; say(`+${gain}  Leapt the ${o.ditch || 'ditch'}!`); show(); bump(gain); if (SND && SND.bell) { SND.bell(9, 0.07); SND.bell(12, 0.06, 0.1); } }
      if (!inside && d.wet && Math.abs(s - d.s) > 6) d.wet = false;      // she may come back and try it again, but the leap only pays once
      d.inside = inside; }
    const alt = me.y - o.groundY(me.x, me.z);
    for (const q of powers) { q.g.rotation.y += dt * 1.8; q.g.position.y = q.y + Math.sin(time * 2 + q.x) * 0.12; if (q.g.visible && Math.hypot(me.x - q.x, me.z - q.z) < 1.3 && alt < 2.2) { q.g.visible = false; power[q.kind] = q.kind === 'wings' ? 9 : 14; say(q.kind === 'wings' ? 'Wings on your heels! Run!' : 'A laurel crown! Everything counts double'); show(); if (SND && SND.bell) [5, 7, 9, 12].forEach((k, i) => SND.bell(k, 0.08, i * 0.08)); } }
    for (const k of ['wings', 'laurel']) if (power[k] > 0) { const was = Math.ceil(power[k]); power[k] -= dt; if (Math.ceil(power[k]) !== was) show(); }
    if (power.wings > 0 && me.speed > 1 && !me.air) { const ex = Math.sin(me.yaw) * me.speed * 0.7 * dt, ez = -Math.cos(me.yaw) * me.speed * 0.7 * dt; if (!o.blocked(me.x + ex, me.z + ez)) { me.x += ex; me.z += ez; } }      // the wings: she covers the ground much faster
    for (const h of hurdles) { const d = Math.hypot(me.x - h.x, me.z - h.z);
      if (d < 0.95) { if (alt < 0.7 && !h.hit) { h.hit = true; h.over = false; stumble = true; lose(10, 'Oof! −10. Leap the barrels!'); } else if (alt >= 0.7 && !h.hit) h.over = true; }
      else { if (h.over && !h.vaulted && d > 1.2) { h.vaulted = true; leaps++; flow(2); const gain = 20 * gm(); pts += gain; say(`+${gain}  Vaulted!`); show(); bump(gain); if (SND && SND.bell) { SND.bell(8, 0.07); SND.bell(11, 0.06, 0.1); } } if (d > 2.6) { h.hit = false; h.over = false; } } }
    if (mult > 1 && clock - lastGain > 3.2) { mult = 1; streak = 0; show(); }
    for (const q of slops) {
      const ds = q.s - s, d = Math.hypot(me.x - q.x, me.z - q.z);
      if (q.state === 'idle' && ds > 2.5 && ds < 12 && d < 14) { q.state = 'warn'; q.t = 0; q.near = false; q.pail.visible = true; say(o.cry || '“Mind below!”'); if (SND && SND.bell) SND.bell(2, 0.05); }
      else if (q.state === 'warn') { q.t += dt; q.shade.material.opacity = 0.42 * Math.min(1, q.t / 0.9); q.shade.scale.setScalar(0.4 + 0.6 * Math.min(1, q.t / 0.9)); q.pail.rotation.z = Math.min(1.9, q.t * 2.2); if (d < 2.2) q.near = true;
        if (q.t > 1.05) { q.state = 'fall'; q.t = 0; q.blob.visible = true; q.blob.position.set(q.x, q.gy + 4.0, q.z); q.blob.scale.setScalar(1); if (SND && SND.whoosh) SND.whoosh(0.07); } }
      else if (q.state === 'fall') { q.t += dt; q.blob.position.y = q.gy + 4.0 * Math.max(0, 1 - (q.t / 0.34) ** 2);
        if (q.t > 0.34) { q.state = 'splat'; q.t = 0; q.blob.scale.set(2.4, 0.18, 2.4); if (d < 1.3 && alt < 2.6) { stumble = true; lose(15, 'Ugh! −15. Slops from the window!'); } else if (q.near || d < 5) { flow(2); const gain = 15 * gm(); pts += gain; say(`+${gain}  Dodged the slops!`); show(); bump(gain); if (SND && SND.puff) SND.puff(0.1); } } }
      else if (q.state === 'splat') { q.t += dt; q.shade.material.opacity = 0.42 * Math.max(0, 1 - q.t / 2.5); if (q.t > 2.5) { q.blob.visible = false; q.pail.visible = false; q.pail.rotation.z = 0; q.state = 'spent'; } }
      else if (q.state === 'spent' && Math.abs(ds) > 26) q.state = 'idle';
    }
    for (const k of drunks) { const w = k.w; w.off = k.base * 0.3 + 2.3 * Math.sin(time * 1.15 + k.ph); w.g.rotation.z = 0.16 * Math.sin(time * 2.3 + k.ph); k.cool -= dt;
      const p = at(w.s), x = p.x - p.dz * w.off, z = p.z + p.dx * w.off; if (k.cool <= 0 && !me.air && Math.abs(me.speed) > 2 && Math.hypot(me.x - x, me.z - z) < 0.85) { k.cool = 4; stumble = true; lose(10, 'Oof! −10. Mind the drunk!'); } }
    for (const l of lines) l.hung.forEach((c, i) => { c.rotation.x = 0.1 * Math.sin(time * 1.4 + l.ph + i * 0.7); });
    lastS = s; return stumble;
  }
  function finish() {
    if (!running) return; running = false; hud.style.display = 'none';
    const secs = Math.round(clock), par = o.par || Math.round(LEN / 4.5 + 45), bonus = Math.max(0, Math.min(150, 5 * Math.round((150 - Math.max(0, secs - par)) / 5)));      // full marks inside a brisk time for this road, a point a second lost after it pts += PTS.finish + bonus;
    const all = loadScores(), was = all[o.key] || {}, best = Math.max(was.best || 0, pts); all[o.key] = { best, time: Math.min(was.time || 1e9, secs), paintings: Math.max(was.paintings || 0, seen.size), of: o.paintings, found: [...new Set([...(was.found || []), ...seen])], coins: Math.max(was.coins || 0, got), runs: (was.runs || 0) + 1, done: Date.now() }; saveScores(all);
    const total = LEVELS.reduce((t, l) => t + ((all[l.key] || {}).best || 0), 0), next = LEVELS[lvl + 1], mm = Math.floor(secs / 60), ss = String(secs % 60).padStart(2, '0');
    const end = document.getElementById('end'), again = document.getElementById('again'), card = document.createElement('p'); card.id = 'scCard';
    const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
    card.innerHTML = `<i>Level ${lvl + 1} of ${LEVELS.length}</i><br><b>${pts}</b> points${pts >= best && was.best ? ' · a new best!' : was.best ? ` · your best is ${best}` : ''}` +
      `<small>${seen.size} of ${o.paintings} paintings · ${got} ${o.things || 'found'} · ${plural(leaps, 'clean leap')} · ${mm}:${ss}` + (bonus ? ` · +${bonus} for speed` : '') + `</small>` +
      (total > pts ? `<small>All levels together: ${total}</small>` : '');
    end.insertBefore(card, end.firstChild); again.classList.add('second');
    let a = document.getElementById('scNext'); if (a) a.remove(); board(end, card, pts, secs);
    // level complete: the banner, the rain of coins, a rising peal; then the choices, which stay in view whatever the level's own card holds
    clearWin(); const win = document.createElement('div'); win.id = 'scWin'; win.innerHTML = `Level complete!<small>${'★'.repeat(seen.size)}<i>${'★'.repeat(Math.max(0, o.paintings - seen.size))}</i></small>`; document.body.appendChild(win);
    for (let k = 0; k < 36; k++) { const c = document.createElement('div'); c.className = 'scRain'; c.style.left = Math.random() * 100 + '%'; c.style.animationDuration = (1.6 + Math.random() * 1.8) + 's'; c.style.animationDelay = Math.random() * 1.4 + 's'; document.body.appendChild(c); setTimeout(() => c.remove(), 5200); }
    if (SND && SND.bell) [0, 4, 7, 12, 16].forEach((n, k) => SND.bell(n + 4, 0.09, k * 0.13));
    const bar = document.createElement('div'); bar.id = 'scDone'; const explored = LEVELS.filter(l => (all[l.key] || {}).runs).length, road = document.createElement('div'); road.className = 'road';
    for (const l of LEVELS) { const t = document.createElement('a'); t.href = '../' + l.href; t.title = `${l.place}, ${l.year}`; t.style.backgroundImage = `url(../${l.img})`; t.className = ((all[l.key] || {}).runs ? 'done' : '') + (l.key === o.key ? ' me' : ''); road.appendChild(t); }
    const note = document.createElement('span'); note.textContent = explored < LEVELS.length ? `${explored} of ${LEVELS.length} ages explored · the grey ones are still to find` : 'Every age explored!'; road.appendChild(note); bar.appendChild(road);
    const unseen = LEVELS.slice(lvl + 1).find(l => !(all[l.key] || {}).runs) || LEVELS.find(l => !(all[l.key] || {}).runs), go = next || unseen;
    if (go) { const n = document.createElement('a'); n.className = 'next'; n.href = '../' + go.href; n.textContent = `Next level: ${go.place}, ${go.year} ▶`; bar.appendChild(n); }
    const m = document.createElement('a'); m.href = '../index.html'; m.textContent = '🗺 Back to the map'; bar.appendChild(m);
    const ag = document.createElement('button'); ag.textContent = '↻ Play again'; ag.onclick = () => { clearWin(); again.click(); }; bar.appendChild(ag); document.body.appendChild(bar); again.addEventListener('click', clearWin, { once: true });
    try { localStorage.setItem('paintingRooms.at', String(Math.max(0, lvl))); } catch (e) { /* private window */ }      // on the map she stands where she has just been
  }
  const clearWin = () => { for (const id of ['scWin', 'scDone']) { const e = document.getElementById(id); if (e) e.remove(); } };
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
  // for a level's own events (a leap between carriages, a fall): the same score, streak, sound and display
  const gain = (n, label, steps = 1) => { if (!running) return; flow(steps); const g = n * gm(); pts += g; say(`+${g}  ${label}`); show(); bump(g); if (SND && SND.bell) { SND.bell(8, 0.07); SND.bell(11, 0.06, 0.1); } };
  const penalty = (n, label) => { if (running) lose(n, `${label} −${n}`); };
  const api = { start, award, update, finish, gain, lose: penalty, get points() { return pts; }, picks, ditches, hurdles, slops, lines, drunks, powers }; window.__sc = api; return api;
}
