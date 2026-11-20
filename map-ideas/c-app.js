import * as THREE from 'three';
import {
  LEVELS, loadScores, getStoredAt, setStoredAt,
  loadWarp, getGlobeStops, llToVec3
} from './c-data.js';
import { loadEarthTexture, buildIslandDiorama, buildTraveller3D } from './c-islands.js';

const R = 10.0;
const canvas = document.getElementById('globe');
const labelsEl = document.getElementById('labels');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.5, 140);

/* Warm sunlit heirloom-globe lighting */
scene.add(new THREE.HemisphereLight('#fffaf0', '#6d94ab', 1.22));
const sun = new THREE.DirectionalLight('#fff5de', 1.02);
sun.position.set(14, 18, 22);
scene.add(sun);
const rimLight = new THREE.DirectionalLight('#b7dce8', 0.40);
rimLight.position.set(-16, -8, 12);
scene.add(rimLight);

const world = new THREE.Group();
scene.add(world);
const texLoader = new THREE.TextureLoader();

/* 1. The real Earth globe with Natural Earth 1:50m hand-tinted coastlines */
const earthTex = loadEarthTexture(THREE, texLoader);
const globeMesh = new THREE.Mesh(
  new THREE.SphereGeometry(R, 72, 54),
  new THREE.MeshLambertMaterial({ map: earthTex })
);
world.add(globeMesh);

/* Soft atmospheric halo sprite behind the Earth */
const haloCanvas = document.createElement('canvas');
haloCanvas.width = 256; haloCanvas.height = 256;
const hg = haloCanvas.getContext('2d');
const hgrad = hg.createRadialGradient(128, 128, 86, 128, 128, 128);
hgrad.addColorStop(0, 'rgba(255, 252, 240, 0)');
hgrad.addColorStop(0.55, 'rgba(180, 222, 232, 0.34)');
hgrad.addColorStop(1, 'rgba(180, 222, 232, 0)');
hg.fillStyle = hgrad; hg.fillRect(0, 0, 256, 256);
const haloSprite = new THREE.Sprite(new THREE.SpriteMaterial({
  map: new THREE.CanvasTexture(haloCanvas), depthWrite: false, transparent: true
}));
haloSprite.scale.set(27.5, 27.5, 1);
scene.add(haloSprite);

/* Gentle fluffy storybook clouds orbiting slowly above the ocean */
const clouds = new THREE.Group();
const cloudMat = new THREE.MeshLambertMaterial({ color: '#fffcf4', transparent: true, opacity: 0.72 });
const cloudCoords = [[-85, 12], [-58, 48], [62, -26], [92, 22], [116, -18], [-115, 32], [174, -14], [10, -40]];
for (const [lo, la] of cloudCoords) {
  const cg = new THREE.Group();
  const [vx, vy, vz] = llToVec3(lo, la, R + 1.25);
  cg.position.set(vx, vy, vz);
  cg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(vx, vy, vz).normalize());
  for (const [px, pz, pr] of [[-0.26, 0, 0.22], [0, 0.04, 0.28], [0.28, -0.02, 0.21]]) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 8, 6), cloudMat);
    puff.scale.set(1.2, 0.62, 0.88);
    puff.position.set(px, 0, pz);
    cg.add(puff);
  }
  clouds.add(cg);
}
world.add(clouds);

const UP = new THREE.Vector3(0, 1, 0);
function placeOnGlobe(obj, lonDeg, latDeg, rad = R - 0.03) {
  const [x, y, z] = llToVec3(lonDeg, latDeg, rad);
  const normal = new THREE.Vector3(x, y, z).normalize();
  obj.position.set(x, y, z);
  /* Guaranteed right-handed orthonormal basis (det = +1 everywhere on sphere) */
  const east = new THREE.Vector3().crossVectors(UP, normal);
  if (east.lengthSq() < 1e-4) east.set(1, 0, 0); else east.normalize();
  const south = new THREE.Vector3().crossVectors(east, normal).normalize();
  obj.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(east, normal, south));
  return normal;
}

/* Boot once warp_lut.json is loaded so every stop sits at its exact Natural Earth coordinate */
async function init() {
  const warpFn = await loadWarp();
  const { main: mainStops, sides: sideStops } = getGlobeStops(warpFn);
  const allStops = [...mainStops, ...sideStops];
  const scores = loadScores();

  const nextUnplayedKey = (() => {
    const found = mainStops.find(s => !s.comingSoon && !(scores[s.key] && scores[s.key].runs));
    return found ? found.key : mainStops[0].key;
  })();

  const islandEntries = [];
  const hitMeshes = [];
  const pinGeo = new THREE.SphereGeometry(0.11, 10, 8);
  const stemMat = new THREE.MeshBasicMaterial({ color: '#9c7838' });

  allStops.forEach((stop, idx) => {
    const sc = !stop.comingSoon && !stop.sideRoom ? scores[stop.key] : null;
    const done = !!(sc && sc.runs);
    const isNext = stop.key === nextUnplayedKey;
    const built = buildIslandDiorama(THREE, stop, { done, isNext }, texLoader);
    const normal = placeOnGlobe(built.group, stop.globeLL[0], stop.globeLL[1], R - 0.03);
    world.add(built.group);
    hitMeshes.push(built.hit);

    /* Exact city anchor pin on the real coastline + delicate brass stem if fanned out */
    const pinVec = new THREE.Vector3(...llToVec3(stop.pinLL[0], stop.pinLL[1], R + 0.04));
    const pinNormal = pinVec.clone().normalize();
    const pinDot = new THREE.Mesh(
      pinGeo,
      new THREE.MeshBasicMaterial({ color: done ? '#f0bc42' : (isNext ? '#d6422c' : '#3a2e22') })
    );
    pinDot.position.copy(pinVec);
    world.add(pinDot);

    if (pinNormal.angleTo(normal) > 0.008) {
      const mid = pinNormal.clone().lerp(normal, 0.5).normalize().multiplyScalar(R + 0.16);
      const curve = new THREE.QuadraticBezierCurve3(
        pinNormal.clone().multiplyScalar(R + 0.06),
        mid,
        normal.clone().multiplyScalar(R + 0.12)
      );
      world.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 10, 0.032, 5, false), stemMat));
    }

    const el = document.createElement('div');
    el.className = 'ilabel' + (done ? ' done' : '') + (isNext && !done ? ' next' : '');
    el.textContent = stop.sideRoom ? stop.place : `${stop.place} · ${stop.year}`;
    labelsEl.appendChild(el);

    islandEntries.push({
      idx, stop, done, isNext, normal, pinNormal,
      group: built.group, crown: built.crown, beacon: built.beacon,
      labelEl: el,
      pos3: new THREE.Vector3(...llToVec3(stop.globeLL[0], stop.globeLL[1], R + 0.34)),
    });
  });

  /* Chronological pearl-and-gold bead trail connecting true city anchors */
  const beadGeo = new THREE.SphereGeometry(0.058, 7, 5);
  const goldBeadMat = new THREE.MeshBasicMaterial({ color: '#f2c64d' });
  const ivoryBeadMat = new THREE.MeshBasicMaterial({ color: '#faf4e2', transparent: true, opacity: 0.78 });
  for (let i = 0; i < mainStops.length - 1; i++) {
    const a = islandEntries[i], b = islandEntries[i + 1];
    const ang = a.pinNormal.angleTo(b.pinNormal);
    const count = Math.max(4, Math.min(24, Math.round(ang * 15)));
    const mat = a.done ? goldBeadMat : ivoryBeadMat;
    for (let k = 1; k < count; k++) {
      const t = k / count;
      const v = new THREE.Vector3().copy(a.pinNormal).lerp(b.pinNormal, t).normalize();
      const lift = R + 0.08 + Math.sin(t * Math.PI) * 0.12;
      const bead = new THREE.Mesh(beadGeo, mat);
      bead.position.copy(v).multiplyScalar(lift);
      if (!a.done) bead.scale.setScalar(0.72);
      world.add(bead);
    }
  }

  /* 4. Hopping 3D traveller & golden landing burst */
  const traveller = buildTraveller3D(THREE);
  world.add(traveller);
  const sparks = [];
  const sparkGeo = new THREE.OctahedronGeometry(0.08, 0);
  const sparkMat = new THREE.MeshBasicMaterial({ color: '#ffe078' });
  function spawnLandingBurst(normal) {
    const base = normal.clone().multiplyScalar(R + 0.36);
    const t1 = new THREE.Vector3().crossVectors(UP, normal).normalize();
    if (t1.lengthSq() < 0.01) t1.set(1, 0, 0);
    const t2 = new THREE.Vector3().crossVectors(normal, t1).normalize();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const m = new THREE.Mesh(sparkGeo, sparkMat);
      m.position.copy(base);
      world.add(m);
      const vel = t1.clone().multiplyScalar(Math.cos(a) * 1.6)
        .addScaledVector(t2, Math.sin(a) * 1.6)
        .addScaledVector(normal, 2.0 + Math.random() * 1.1);
      sparks.push({ mesh: m, vel, normal: normal.clone(), life: 0.72 });
    }
  }

  /* 5. Initial selection, smart cluster zoom & globe orientation */
  const storedReal = getStoredAt();
  let initialIdx = mainStops.findIndex(s => s.realIdx === storedReal && storedReal >= 0);
  if (initialIdx < 0) initialIdx = mainStops.findIndex(s => s.key === nextUnplayedKey);
  if (initialIdx < 0) initialIdx = 0;

  let activeIdx = initialIdx;
  let globeYaw = 0, globePitch = 0, goalYaw = 0, goalPitch = 0;
  let camDist = 26, goalDist = 26;
  let wholeEarth = false, manualSpin = false;
  let velYaw = 0, velPitch = 0;

  let hop = {
    fromN: islandEntries[activeIdx].normal.clone(),
    toN: islandEntries[activeIdx].normal.clone(),
    t: 1, dur: 0.7, doneBurst: true,
  };

  function desiredDistFor(entry) {
    const portrait = window.innerHeight > window.innerWidth;
    if (wholeEarth || manualSpin) return portrait ? 41.5 : 33.5;
    /* Zoom gently closer on dense European clusters & Edo so coastlines & stops shine in centre frame */
    const k = entry.stop.key;
    const tight = ['alice', 'turner', 'sargent', 'vermeer', 'rubens', 'monet', 'rousseau', 'seurat', 'caravaggio', 'piranesi', 'florence', 'pompeii', 'hokusai', 'kuniyoshi'].includes(k);
    if (portrait) return tight ? 29.0 : 33.0;
    return tight ? 25.4 : 28.6;
  }

  function aimForStop(entry, snap = false) {
    const [lon, lat] = entry.stop.globeLL;
    /* Place the active stop calmly in the unobstructed middle of the frame (never tucked under the top HUD!) */
    goalYaw = -(lon * Math.PI) / 180;
    goalPitch = Math.max(-1.05, Math.min(1.05, (lat * Math.PI) / 180 - 0.03));
    while (goalYaw - globeYaw > Math.PI) goalYaw -= Math.PI * 2;
    while (goalYaw - globeYaw < -Math.PI) goalYaw += Math.PI * 2;
    goalDist = desiredDistFor(entry);
    if (snap) { globeYaw = goalYaw; globePitch = goalPitch; camDist = goalDist; }
  }

  function selectStop(idx, { hopTraveller = true, spinGlobe = true } = {}) {
    const clamped = Math.max(0, Math.min(islandEntries.length - 1, idx));
    const prev = islandEntries[activeIdx];
    const next = islandEntries[clamped];
    activeIdx = clamped;
    if (next.stop.realIdx >= 0) setStoredAt(next.stop.realIdx);
    if (spinGlobe) {
      manualSpin = false;
      wholeEarth = false;
      document.getElementById('btnZoom').textContent = 'Whole Earth';
      velYaw = 0; velPitch = 0;
      aimForStop(next, false);
    }
    if (hopTraveller && prev !== next) {
      const ang = prev.normal.angleTo(next.normal);
      /* Pull back briefly mid-hop on long crossings (e.g. Europe <-> Japan) */
      if (ang > 0.7 && !wholeEarth) camDist = Math.max(camDist, 31.5);
      hop = {
        fromN: prev.normal.clone(),
        toN: next.normal.clone(),
        t: 0,
        dur: Math.min(1.0, 0.52 + ang * 0.28),
        doneBurst: false,
      };
    }
    updateDock();
    highlightTimeline(true);
  }

  /* HUD, Timeline Ribbon & Place Card */
  const timelineEl = document.getElementById('timeline');
  const chipEls = [];
  function updateHUD() {
    let totalPts = 0, gotPaint = 0, ofPaint = 0, agesDone = 0;
    const playable = mainStops.filter(s => !s.comingSoon);
    for (const s of playable) {
      const sc = scores[s.key];
      ofPaint += s.paintings || 0;
      if (sc) { totalPts += sc.best || 0; gotPaint += sc.paintings || 0; if (sc.runs) agesDone++; }
    }
    document.getElementById('hPts').textContent = totalPts;
    document.getElementById('hPaint').textContent = gotPaint;
    document.getElementById('hPaintOf').textContent = ofPaint;
    document.getElementById('hAges').textContent = agesDone;
    document.getElementById('hAgesOf').textContent = playable.length;
  }

  function buildTimeline() {
    timelineEl.textContent = '';
    chipEls.length = 0;
    islandEntries.forEach((entry, i) => {
      if (i === mainStops.length) {
        const sep = document.createElement('span'); sep.className = 't-sep'; timelineEl.appendChild(sep);
      }
      const s = entry.stop;
      const b = document.createElement('button');
      b.className = 't-chip' + (entry.done ? ' done' : '') + (s.comingSoon ? ' soon' : '');
      const sw = document.createElement('span'); sw.className = 'sw';
      sw.style.background = (s.dna && s.dna.swatch) || s.swatch || '#c9962e';
      const txt = document.createElement('span');
      txt.textContent = s.sideRoom ? `🌿 ${s.place}` : `${s.year} ${s.place}`;
      b.append(sw, txt);
      b.addEventListener('click', () => selectStop(i, { hopTraveller: true, spinGlobe: true }));
      timelineEl.appendChild(b);
      chipEls.push(b);
    });
  }

  function highlightTimeline(scrollIntoView) {
    chipEls.forEach((b, i) => b.classList.toggle('active', i === activeIdx));
    if (scrollIntoView && chipEls[activeIdx]) {
      chipEls[activeIdx].scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }
  }

  function updateDock() {
    const entry = islandEntries[activeIdx];
    if (!entry) return;
    const s = entry.stop;
    const sc = !s.comingSoon && !s.sideRoom ? scores[s.key] : null;
    const done = entry.done;
    const dna = s.dna || {};
    const th = document.getElementById('dThumb');
    th.className = 'thumb' + (done ? ' done' : '');
    if (s.img) {
      th.style.background = `#d8ceb8 url("../${s.img}") center/cover no-repeat`;
      th.style.filter = (done || s.sideRoom) ? 'none' : 'saturate(0.8) sepia(0.16)';
    } else {
      th.style.background = `linear-gradient(135deg, ${dna.base || '#1f4e82'}, ${dna.accent || '#d64532'})`;
      th.style.filter = 'none';
    }
    document.getElementById('dEra').textContent = (dna.era || s.era || 'Painting Room') + (s.japan ? ' · Japan' : '');
    document.getElementById('dTitle').textContent = s.sideRoom ? s.title : `${s.place}, ${s.year}`;
    document.getElementById('dSub').textContent = s.sideRoom ? `${s.place} · after ${s.by}` : `${s.title} · after ${s.by}`;
    const prog = document.getElementById('dProg');
    if (s.comingSoon) prog.textContent = `Being painted now · ${s.paintings} woodblock stages (${s.coin})`;
    else if (s.sideRoom) prog.textContent = 'Short painted garden room · explore freely';
    else if (done) {
      const got = sc.paintings || 0, of = s.paintings || 3;
      prog.innerHTML = `<span class="stars">${'★'.repeat(got) + '☆'.repeat(Math.max(0, of - got))}</span> ${got} of ${of} paintings · ${sc.best || 0} pts`;
    } else prog.textContent = `${s.paintings} paintings to find · ${s.coin}`;

    const go = document.getElementById('btnGo'), soon = document.getElementById('btnSoon');
    if (s.comingSoon) { go.style.display = 'none'; soon.style.display = 'inline-flex'; }
    else { go.style.display = 'inline-flex'; soon.style.display = 'none'; go.href = '../' + s.href; go.textContent = done ? 'Visit again ▶' : 'Step in ▶'; }
  }
  const tmpV = new THREE.Vector3();
  const projV = new THREE.Vector3();

  function syncRibbonFromGlobe() {
    let best = -1, bestZ = 0.65;
    for (const e of islandEntries) {
      tmpV.copy(e.normal).applyQuaternion(world.quaternion);
      if (tmpV.z > bestZ) { bestZ = tmpV.z; best = e.idx; }
    }
    if (best >= 0 && best !== activeIdx) {
      selectStop(best, { hopTraveller: true, spinGlobe: false });
    }
  }

  function resize() {
    const W = window.innerWidth, H = window.innerHeight;
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    goalDist = desiredDistFor(islandEntries[activeIdx]);
  }
  window.addEventListener('resize', resize);

  /* Finger spin, mouse wheel zoom & raycast tap-to-hop */
  const raycaster = new THREE.Raycaster();
  const ptr = new THREE.Vector2();
  let drag = null;

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    canvas.classList.add('dragging');
    drag = { id: e.pointerId, x0: e.clientX, y0: e.clientY, lx: e.clientX, ly: e.clientY, moved: false };
  });
  canvas.addEventListener('pointermove', e => {
    if (!drag || drag.id !== e.pointerId) return;
    const dx = e.clientX - drag.lx, dy = e.clientY - drag.ly;
    if (Math.hypot(e.clientX - drag.x0, e.clientY - drag.y0) > 6) {
      drag.moved = true;
      manualSpin = true;
      goalDist = desiredDistFor(islandEntries[activeIdx]);
    }
    if (drag.moved) {
      const sens = 0.0052 * (camDist / 30);
      globeYaw += dx * sens;
      globePitch = Math.max(-1.12, Math.min(1.12, globePitch + dy * sens));
      velYaw = dx * sens * 0.45;
      velPitch = dy * sens * 0.45;
    }
    drag.lx = e.clientX; drag.ly = e.clientY;
  });
  function endPointer(e) {
    if (!drag || drag.id !== e.pointerId) return;
    const wasTap = !drag.moved;
    drag = null;
    canvas.classList.remove('dragging');
    if (wasTap) {
      ptr.x = (e.clientX / window.innerWidth) * 2 - 1;
      ptr.y = -(e.clientY / window.innerHeight) * 2 + 1;
      raycaster.setFromCamera(ptr, camera);
      const hits = raycaster.intersectObjects(hitMeshes, false);
      if (hits.length) {
        const key = hits[0].object.userData.stopKey;
        const idx = islandEntries.findIndex(en => en.stop.key === key);
        if (idx >= 0) selectStop(idx, { hopTraveller: true, spinGlobe: true });
      }
    }
  }
  canvas.addEventListener('pointerup', endPointer);
  canvas.addEventListener('pointercancel', endPointer);
  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    goalDist = Math.max(17.5, Math.min(44, goalDist + e.deltaY * 0.02));
  }, { passive: false });

  window.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); selectStop((activeIdx + 1) % islandEntries.length); }
    else if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); selectStop((activeIdx - 1 + islandEntries.length) % islandEntries.length); }
    else if (e.key === 'Enter') {
      const s = islandEntries[activeIdx].stop;
      if (s && !s.comingSoon && s.href) window.location.href = '../' + s.href;
    }
  });
  document.getElementById('btnPrev').addEventListener('click', () => selectStop((activeIdx - 1 + islandEntries.length) % islandEntries.length));
  document.getElementById('btnNext').addEventListener('click', () => selectStop((activeIdx + 1) % islandEntries.length));
  document.getElementById('btnZoom').addEventListener('click', () => {
    wholeEarth = !wholeEarth;
    document.getElementById('btnZoom').textContent = wholeEarth ? 'Zoom in' : 'Whole Earth';
    goalDist = desiredDistFor(islandEntries[activeIdx]);
  });
  document.getElementById('btnEdo').addEventListener('click', () => {
    const edoIdx = islandEntries.findIndex(e => e.stop.key === 'kuniyoshi');
    if (edoIdx >= 0) selectStop(edoIdx);
  });
  let gardenToggle = 0;
  document.getElementById('btnGardens').addEventListener('click', () => {
    selectStop(mainStops.length + (gardenToggle++ % sideStops.length));
  });

  /* Guaranteed zero-overlap 2D label placement solver (active stop first, never overlaps HUD/dock or another label). */
  function placeLabelsCleanly(W, H) {
    const topGuard = W < 820 ? 118 : 88;
    const botGuard = H - 156;
    const candidates = [];

    for (const e of islandEntries) {
      tmpV.copy(e.normal).applyQuaternion(world.quaternion);
      const isAct = e.idx === activeIdx;
      const zMin = isAct ? 0.05 : 0.34;
      if (tmpV.z <= zMin) {
        e.labelEl.style.opacity = '0';
        e.labelEl.dataset.vis = '0';
        continue;
      }
      projV.copy(e.pos3).applyMatrix4(world.matrixWorld).project(camera);
      const sx = (projV.x * 0.5 + 0.5) * W;
      const sy = (-projV.y * 0.5 + 0.5) * H + 18;
      e.labelEl.classList.toggle('active', isAct);
      const lw = e.labelEl.offsetWidth || 100;
      const lh = e.labelEl.offsetHeight || 22;
      candidates.push({ e, isAct, z: tmpV.z, sx, sy, lw, lh });
    }

    /* Priority: active stop first, then front-most islands */
    candidates.sort((a, b) => (b.isAct ? 1 : 0) - (a.isAct ? 1 : 0) || b.z - a.z);

    const placed = [];
    const pad = 6;
    const overlaps = (ax, ay, aw, ah, bx, by, bw, bh) =>
      Math.abs(ax - bx) < (aw + bw) * 0.5 + pad && Math.abs(ay - by) < (ah + bh) * 0.5 + pad;

    for (const c of candidates) {
      /* Try exact anchor first, then polite radial offsets */
      const offsets = c.isAct
        ? [[0, 0], [0, -34], [0, 22]]
        : [[0, 0], [0, -30], [0, 24], [-42, -14], [42, -14], [-42, 18], [42, 18], [0, -52]];

      let chosen = null;
      for (const [ox, oy] of offsets) {
        const cx = Math.max(c.lw * 0.5 + 10, Math.min(W - c.lw * 0.5 - 10, c.sx + ox));
        const cy = c.sy + oy;
        if (cy - c.lh * 0.5 < topGuard || cy + c.lh * 0.5 > botGuard) continue;
        if (!placed.some(p => overlaps(cx, cy, c.lw, c.lh, p.cx, p.cy, p.lw, p.lh))) {
          chosen = { cx, cy };
          break;
        }
      }

      if (chosen) {
        placed.push({ cx: chosen.cx, cy: chosen.cy, lw: c.lw, lh: c.lh });
        c.e.labelEl.style.left = chosen.cx.toFixed(1) + 'px';
        c.e.labelEl.style.top = (chosen.cy - c.lh * 0.5).toFixed(1) + 'px';
        c.e.labelEl.style.opacity = c.isAct ? '1' : String(Math.min(0.95, (c.z - 0.30) * 2.4));
        c.e.labelEl.dataset.vis = '1';
      } else {
        c.e.labelEl.style.opacity = '0';
        c.e.labelEl.dataset.vis = '0';
      }
    }
  }

  /* 6. Main 60 fps animation loop */
  let lastNow = performance.now();
  function animate(now) {
    const dt = Math.min(0.05, (now - lastNow) / 1000);
    lastNow = now;
    const time = now * 0.001;

    if (manualSpin) {
      if (!drag) {
        globeYaw += velYaw;
        globePitch = Math.max(-1.12, Math.min(1.12, globePitch + velPitch));
        velYaw *= Math.pow(0.05, dt);
        velPitch *= Math.pow(0.05, dt);
      }
      syncRibbonFromGlobe();
    } else {
      const k = Math.min(1, dt * 7.2);
      globeYaw += (goalYaw - globeYaw) * k;
      globePitch += (goalPitch - globePitch) * k;
    }

    camDist += (goalDist - camDist) * Math.min(1, dt * 5.2);
    const portrait = window.innerHeight > window.innerWidth;
    camera.position.set(0, portrait ? -0.35 : -0.45, camDist);
    camera.lookAt(0, portrait ? -0.6 : -0.7, 0);

    world.rotation.order = 'XYZ';
    world.rotation.x = globePitch;
    world.rotation.y = globeYaw;
    clouds.rotation.y = time * 0.022;

    if (hop.t < 1) {
      hop.t = Math.min(1, hop.t + dt / hop.dur);
      if (hop.t >= 1 && !hop.doneBurst) { hop.doneBurst = true; spawnLandingBurst(hop.toN); }
    }
    const ease = hop.t < 0.5 ? 2 * hop.t * hop.t : 1 - Math.pow(-2 * hop.t + 2, 2) / 2;
    const omega = Math.acos(Math.max(-1, Math.min(1, hop.fromN.dot(hop.toN))));
    const curN = omega > 0.002
      ? new THREE.Vector3().addScaledVector(hop.fromN, Math.sin((1 - ease) * omega) / Math.sin(omega))
          .addScaledVector(hop.toN, Math.sin(ease * omega) / Math.sin(omega)).normalize()
      : hop.toN.clone();
    const arcH = Math.sin(hop.t * Math.PI) * 1.55;
    const idleBob = hop.t >= 1 ? Math.abs(Math.sin(time * 3.2)) * 0.07 : 0;
    const east = new THREE.Vector3().crossVectors(UP, curN);
    if (east.lengthSq() < 1e-4) east.set(1, 0, 0); else east.normalize();
    const south = new THREE.Vector3().crossVectors(east, curN).normalize();
    traveller.position.copy(curN).multiplyScalar(R + 0.34 + arcH + idleBob).addScaledVector(south, hop.t >= 1 ? 0.34 : 0.34 * ease);
    traveller.quaternion.setFromUnitVectors(UP, curN);

    for (let i = sparks.length - 1; i >= 0; i--) {
      const sp = sparks[i];
      sp.life -= dt;
      if (sp.life <= 0) { world.remove(sp.mesh); sparks.splice(i, 1); continue; }
      sp.vel.addScaledVector(sp.normal, -6.5 * dt);
      sp.mesh.position.addScaledVector(sp.vel, dt);
      sp.mesh.scale.setScalar(Math.max(0.01, sp.life / 0.72));
    }

    world.updateMatrixWorld(true);
    for (const e of islandEntries) {
      if (e.crown) { e.crown.rotation.y = time * 1.4 + e.idx; e.crown.position.y = 1.60 + Math.sin(time * 2.4 + e.idx) * 0.07; }
      if (e.beacon) { const s = 1 + 0.14 * Math.sin(time * 3.2); e.beacon.scale.set(s, s, 1); }
    }

    placeLabelsCleanly(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }

  /* Expose small test hook for automated label-overlap & stop-jump verification */
  window.__globeSelect = idx => selectStop(idx, { hopTraveller: false, spinGlobe: true });
  window.__globeSnap = idx => { selectStop(idx, { hopTraveller: false, spinGlobe: true }); aimForStop(islandEntries[idx], true); };
  window.__globeStopCount = islandEntries.length;

  resize();
  updateHUD();
  buildTimeline();
  aimForStop(islandEntries[activeIdx], true);
  updateDock();
  highlightTimeline(false);
  requestAnimationFrame(animate);
}
init();
