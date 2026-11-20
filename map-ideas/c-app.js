import * as THREE from 'three';
import {
  LEVELS, loadScores, getStoredAt, setStoredAt,
  getGlobeStops, SIDE_ISLETS, llToVec3
} from './c-data.js';
import { makeGlobeTexture, buildIslandDiorama, buildTraveller3D } from './c-islands.js';

const R = 10.0;
const canvas = document.getElementById('globe');
const labelsEl = document.getElementById('labels');

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(34, window.innerWidth / window.innerHeight, 0.5, 120);

/* Warm daylight storybook lighting */
scene.add(new THREE.HemisphereLight('#fffaf0', '#6d94ab', 1.18));
const sun = new THREE.DirectionalLight('#fff5de', 1.05);
sun.position.set(14, 18, 22);
scene.add(sun);
const rimLight = new THREE.DirectionalLight('#b7dce8', 0.42);
rimLight.position.set(-16, -8, 12);
scene.add(rimLight);

/* Root rotating globe assembly */
const world = new THREE.Group();
scene.add(world);

/* 1. The painted storybook globe sphere */
const globeTex = makeGlobeTexture(THREE);
const globeMesh = new THREE.Mesh(
  new THREE.SphereGeometry(R, 64, 48),
  new THREE.MeshLambertMaterial({ map: globeTex })
);
world.add(globeMesh);

/* Soft translucent storybook sky-halo ring behind the sphere */
const haloCanvas = document.createElement('canvas');
haloCanvas.width = 256; haloCanvas.height = 256;
const hg = haloCanvas.getContext('2d');
const hgrad = hg.createRadialGradient(128, 128, 86, 128, 128, 128);
hgrad.addColorStop(0, 'rgba(255, 252, 240, 0)');
hgrad.addColorStop(0.55, 'rgba(180, 222, 232, 0.36)');
hgrad.addColorStop(1, 'rgba(180, 222, 232, 0)');
hg.fillStyle = hgrad; hg.fillRect(0, 0, 256, 256);
const haloSprite = new THREE.Sprite(new THREE.SpriteMaterial({
  map: new THREE.CanvasTexture(haloCanvas), depthWrite: false, transparent: true
}));
haloSprite.scale.set(27.5, 27.5, 1);
scene.add(haloSprite);

/* Gentle fluffy storybook paper-clouds orbiting slowly above the ocean */
const clouds = new THREE.Group();
const cloudMat = new THREE.MeshLambertMaterial({ color: '#fffcf4', transparent: true, opacity: 0.78 });
const cloudCoords = [[-85, 12], [-20, 56], [42, -40], [95, 28], [116, -18], [-112, 34], [176, -14], [2, -46]];
for (const [lo, la] of cloudCoords) {
  const cg = new THREE.Group();
  const [vx, vy, vz] = llToVec3(lo, la, R + 1.25);
  cg.position.set(vx, vy, vz);
  cg.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), new THREE.Vector3(vx, vy, vz).normalize());
  for (const [px, pz, pr] of [[-0.28, 0, 0.24], [0, 0.05, 0.32], [0.3, -0.02, 0.23]]) {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(pr, 8, 6), cloudMat);
    puff.scale.set(1.2, 0.65, 0.9);
    puff.position.set(px, 0, pz);
    cg.add(puff);
  }
  clouds.add(cg);
}
world.add(clouds);

/* 2. Build all stops (14 LEVELS + Kuniyoshi live + Hokusai coming soon) + 2 Side Room islets */
const scores = loadScores();
const mainStops = getGlobeStops();
const allStops = [...mainStops, ...SIDE_ISLETS];
const texLoader = new THREE.TextureLoader();

const nextUnplayedKey = (() => {
  const found = mainStops.find(s => !s.comingSoon && !(scores[s.key] && scores[s.key].runs));
  return found ? found.key : mainStops[0].key;
})();

const islandEntries = [];
const hitMeshes = [];
const UP = new THREE.Vector3(0, 1, 0);

function placeOnGlobe(obj, lonDeg, latDeg, rad = R - 0.04) {
  const [x, y, z] = llToVec3(lonDeg, latDeg, rad);
  const normal = new THREE.Vector3(x, y, z).normalize();
  obj.position.set(x, y, z);
  /* Right-handed orthonormal basis EVERYWHERE on the sphere:
     X = east (UP x normal), Y = outward normal, Z = south (east x normal) -> det = +1! */
  const east = new THREE.Vector3().crossVectors(UP, normal);
  if (east.lengthSq() < 1e-4) east.set(1, 0, 0); else east.normalize();
  const south = new THREE.Vector3().crossVectors(east, normal).normalize();
  const m = new THREE.Matrix4().makeBasis(east, normal, south);
  obj.quaternion.setFromRotationMatrix(m);
  return normal;
}

allStops.forEach((stop, idx) => {
  const sc = !stop.comingSoon && !stop.sideRoom ? scores[stop.key] : null;
  const done = !!(sc && sc.runs);
  const isNext = stop.key === nextUnplayedKey;
  const built = buildIslandDiorama(THREE, stop, { done, isNext }, texLoader);
  const normal = placeOnGlobe(built.group, stop.globeLL[0], stop.globeLL[1], R - 0.04);
  world.add(built.group);
  hitMeshes.push(built.hit);

  /* Floating HTML label synced in screen space */
  const el = document.createElement('div');
  el.className = 'ilabel' + (done ? ' done' : '') + (isNext && !done ? ' next' : '');
  el.textContent = stop.sideRoom ? stop.place : `${stop.place} · ${stop.year}`;
  labelsEl.appendChild(el);

  islandEntries.push({
    idx, stop, done, isNext, normal,
    group: built.group, crown: built.crown, beacon: built.beacon,
    labelEl: el,
    pos3: new THREE.Vector3(...llToVec3(stop.globeLL[0], stop.globeLL[1], R + 0.36)),
  });
});

/* 3. Chronological storybook bead-trail road on the globe (gold pearls for won legs, soft ivory beads ahead) */
const beadGeo = new THREE.SphereGeometry(0.068, 7, 5);
const goldBeadMat = new THREE.MeshBasicMaterial({ color: '#f2c64d' });
const ivoryBeadMat = new THREE.MeshBasicMaterial({ color: '#faf4e2', transparent: true, opacity: 0.78 });

function addRoadArc(aNormal, bNormal, done) {
  const ang = aNormal.angleTo(bNormal);
  const count = Math.max(5, Math.min(22, Math.round(ang * 14)));
  const mat = done ? goldBeadMat : ivoryBeadMat;
  for (let i = 1; i < count; i++) {
    const t = i / count;
    const v = new THREE.Vector3().copy(aNormal).lerp(bNormal, t).normalize();
    const lift = R + 0.10 + Math.sin(t * Math.PI) * 0.12;
    const b = new THREE.Mesh(beadGeo, mat);
    b.position.copy(v).multiplyScalar(lift);
    if (!done) b.scale.setScalar(0.76);
    world.add(b);
  }
}

for (let i = 0; i < mainStops.length - 1; i++) {
  const a = islandEntries[i], b = islandEntries[i + 1];
  addRoadArc(a.normal, b.normal, a.done);
}

/* 4. The 3D hopping traveller + golden landing burst particles */
const traveller = buildTraveller3D(THREE);
world.add(traveller);

const sparks = [];
const sparkGeo = new THREE.OctahedronGeometry(0.09, 0);
const sparkMat = new THREE.MeshBasicMaterial({ color: '#ffe078' });
function spawnLandingBurst(normal) {
  const base = normal.clone().multiplyScalar(R + 0.42);
  const t1 = new THREE.Vector3().crossVectors(UP, normal).normalize();
  if (t1.lengthSq() < 0.01) t1.set(1, 0, 0);
  const t2 = new THREE.Vector3().crossVectors(normal, t1).normalize();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const m = new THREE.Mesh(sparkGeo, sparkMat);
    m.position.copy(base);
    world.add(m);
    const vel = t1.clone().multiplyScalar(Math.cos(a) * 1.8)
      .addScaledVector(t2, Math.sin(a) * 1.8)
      .addScaledVector(normal, 2.2 + Math.random() * 1.2);
    sparks.push({ mesh: m, vel, normal: normal.clone(), life: 0.75 });
  }
}
/* 5. Initial selection & globe orientation */
const storedReal = getStoredAt();
let initialIdx = mainStops.findIndex(s => s.realIdx === storedReal && storedReal >= 0);
if (initialIdx < 0) initialIdx = mainStops.findIndex(s => s.key === nextUnplayedKey);
if (initialIdx < 0) initialIdx = 0;

let activeIdx = initialIdx;
let globeYaw = 0, globePitch = 0;
let goalYaw = 0, goalPitch = 0;
let manualSpin = false;
let velYaw = 0, velPitch = 0;

/* Parabolic hop state for the traveller */
let hop = {
  fromN: islandEntries[activeIdx].normal.clone(),
  toN: islandEntries[activeIdx].normal.clone(),
  t: 1,
  dur: 0.72,
  doneBurst: true,
};

function aimForStop(entry, snap = false) {
  const [lon, lat] = entry.stop.globeLL;
  /* Rotate world so [lon, lat] sits gracefully in the upper-centre 3/4 storybook profile */
  goalYaw = -(lon * Math.PI) / 180;
  goalPitch = Math.max(-1.02, Math.min(1.02, (lat * Math.PI) / 180 - 0.36));
  /* Shortest angular path around yaw */
  while (goalYaw - globeYaw > Math.PI) goalYaw -= Math.PI * 2;
  while (goalYaw - globeYaw < -Math.PI) goalYaw += Math.PI * 2;
  if (snap) { globeYaw = goalYaw; globePitch = goalPitch; }
}

function selectStop(idx, { hopTraveller = true, spinGlobe = true } = {}) {
  const clamped = Math.max(0, Math.min(islandEntries.length - 1, idx));
  const prev = islandEntries[activeIdx];
  const next = islandEntries[clamped];
  activeIdx = clamped;

  if (next.stop.realIdx >= 0) setStoredAt(next.stop.realIdx);
  if (spinGlobe) {
    manualSpin = false;
    velYaw = 0; velPitch = 0;
    aimForStop(next, false);
  }
  if (hopTraveller && prev !== next) {
    hop = {
      fromN: prev.normal.clone(),
      toN: next.normal.clone(),
      t: 0,
      dur: Math.min(1.05, 0.56 + prev.normal.angleTo(next.normal) * 0.32),
      doneBurst: false,
    };
  }
  updateDock();
  highlightTimeline(true);
}

/* HUD + Dock + Synchronised Bottom Timeline Ribbon */
function updateHUD() {
  let totalPts = 0, gotPaint = 0, ofPaint = 0, agesDone = 0;
  const playable = mainStops.filter(s => !s.comingSoon);
  for (const s of playable) {
    const sc = scores[s.key];
    ofPaint += s.paintings || 0;
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
  document.getElementById('hAgesOf').textContent = playable.length;
}

const timelineEl = document.getElementById('timeline');
const chipEls = [];
function buildTimeline() {
  timelineEl.textContent = '';
  chipEls.length = 0;
  islandEntries.forEach((entry, i) => {
    if (i === mainStops.length) {
      const sep = document.createElement('span');
      sep.className = 't-sep';
      timelineEl.appendChild(sep);
    }
    const s = entry.stop;
    const b = document.createElement('button');
    b.className = 't-chip' + (entry.done ? ' done' : '') + (s.comingSoon ? ' soon' : '');
    const sw = document.createElement('span');
    sw.className = 'sw';
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
  chipEls.forEach((b, i) => {
    b.classList.toggle('active', i === activeIdx);
  });
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
    th.style.backgroundImage = `url("../${s.img}")`;
    th.style.filter = (done || s.sideRoom) ? 'none' : 'saturate(0.8) sepia(0.16)';
  } else {
    th.style.backgroundImage = 'none';
    th.style.background = `linear-gradient(135deg, ${dna.base || '#1f4e82'}, ${dna.accent || '#d64532'})`;
    th.style.filter = 'none';
  }
  document.getElementById('dEra').textContent = (dna.era || s.era || 'Painting Room') + (s.japan ? ' · Japan' : '');
  document.getElementById('dTitle').textContent = s.sideRoom ? s.title : `${s.place}, ${s.year}`;
  document.getElementById('dSub').textContent = s.sideRoom ? `${s.place} · after ${s.by}` : `${s.title} · after ${s.by}`;

  const prog = document.getElementById('dProg');
  if (s.comingSoon) {
    prog.textContent = `Being painted now · ${s.paintings} woodblock stages (${s.coin})`;
  } else if (s.sideRoom) {
    prog.textContent = 'Short painted garden room · explore freely';
  } else if (done) {
    const got = sc.paintings || 0, of = s.paintings || 3;
    const stars = '★'.repeat(got) + '☆'.repeat(Math.max(0, of - got));
    prog.innerHTML = `<span class="stars">${stars}</span> ${got} of ${of} paintings · ${sc.best || 0} pts`;
  } else {
    prog.textContent = `${s.paintings} paintings to find · ${s.coin}`;
  }

  const go = document.getElementById('btnGo');
  const soon = document.getElementById('btnSoon');
  if (s.comingSoon) {
    go.style.display = 'none';
    soon.style.display = 'inline-flex';
  } else {
    go.style.display = 'inline-flex';
    soon.style.display = 'none';
    go.href = '../' + s.href;
    go.textContent = done ? 'Visit again ▶' : 'Step in ▶';
  }
}

/* Sync timeline when spinning globe manually: pick island closest to camera front (+Z). */
const tmpV = new THREE.Vector3();
function syncRibbonFromGlobe() {
  let best = -1, bestZ = 0.62;
  for (const e of islandEntries) {
    tmpV.copy(e.normal).applyQuaternion(world.quaternion);
    if (tmpV.z > bestZ) { bestZ = tmpV.z; best = e.idx; }
  }
  if (best >= 0 && best !== activeIdx) {
    selectStop(best, { hopTraveller: true, spinGlobe: false });
  }
}

/* Responsive sizing: keeps whole globe framed generously on desktop and iPad mini portrait/landscape */
function resize() {
  const W = window.innerWidth, H = window.innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  const minDim = Math.min(W, H);
  const portrait = H > W;
  camera.position.set(0, portrait ? -0.4 : -0.6, portrait ? 42.5 : (minDim < 720 ? 35.5 : 33.5));
  camera.lookAt(0, portrait ? -0.8 : -0.9, 0);
  camera.updateProjectionMatrix();
}
window.addEventListener('resize', resize);

/* Finger-spin + tap-to-hop raycasting */
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
  }
  if (drag.moved) {
    const sens = 0.0058;
    globeYaw += dx * sens;
    globePitch = Math.max(-1.05, Math.min(1.05, globePitch + dy * sens));
    velYaw = dx * sens * 0.5;
    velPitch = dy * sens * 0.5;
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

/* Keyboard & buttons */
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
document.getElementById('btnEdo').addEventListener('click', () => {
  const edoIdx = islandEntries.findIndex(e => e.stop.key === 'kuniyoshi');
  if (edoIdx >= 0) selectStop(edoIdx);
});
let gardenToggle = 0;
document.getElementById('btnGardens').addEventListener('click', () => {
  const target = mainStops.length + (gardenToggle++ % SIDE_ISLETS.length);
  selectStop(target);
});

/* Main 60 fps render & animation loop */
const projV = new THREE.Vector3();
let lastNow = performance.now();

function animate(now) {
  const dt = Math.min(0.05, (now - lastNow) / 1000);
  lastNow = now;
  const time = now * 0.001;

  /* Globe rotation (smooth target glide OR gentle finger inertia) */
  if (manualSpin) {
    if (!drag) {
      globeYaw += velYaw;
      globePitch = Math.max(-1.05, Math.min(1.05, globePitch + velPitch));
      velYaw *= Math.pow(0.05, dt);
      velPitch *= Math.pow(0.05, dt);
    }
    syncRibbonFromGlobe();
  } else {
    const k = Math.min(1, dt * 7.4);
    globeYaw += (goalYaw - globeYaw) * k;
    globePitch += (goalPitch - globePitch) * k;
  }
  world.rotation.order = 'XYZ';
  world.rotation.x = globePitch;
  world.rotation.y = globeYaw;
  clouds.rotation.y = time * 0.025;

  /* Parabolic hop animation for the traveller */
  if (hop.t < 1) {
    hop.t = Math.min(1, hop.t + dt / hop.dur);
    if (hop.t >= 1 && !hop.doneBurst) {
      hop.doneBurst = true;
      spawnLandingBurst(hop.toN);
    }
  }
  const ease = hop.t < 0.5 ? 2 * hop.t * hop.t : 1 - Math.pow(-2 * hop.t + 2, 2) / 2;
  /* Great-circle spherical interpolation so long hops hug the globe cleanly */
  const omega = Math.acos(Math.max(-1, Math.min(1, hop.fromN.dot(hop.toN))));
  let curN;
  if (omega > 0.002) {
    const sinO = Math.sin(omega);
    curN = new THREE.Vector3()
      .addScaledVector(hop.fromN, Math.sin((1 - ease) * omega) / sinO)
      .addScaledVector(hop.toN, Math.sin(ease * omega) / sinO)
      .normalize();
  } else {
    curN = hop.toN.clone();
  }
  const arcH = Math.sin(hop.t * Math.PI) * 1.85;
  const idleBob = hop.t >= 1 ? Math.abs(Math.sin(time * 3.2)) * 0.08 : 0;
  /* Stand neatly toward the front edge of the island when landed so she never blocks the painting */
  const east = new THREE.Vector3().crossVectors(UP, curN);
  if (east.lengthSq() < 1e-4) east.set(1, 0, 0); else east.normalize();
  const south = new THREE.Vector3().crossVectors(east, curN).normalize();
  const standOff = hop.t >= 1 ? 0.52 : 0.52 * ease;
  traveller.position.copy(curN).multiplyScalar(R + 0.42 + arcH + idleBob)
    .addScaledVector(south, standOff);
  traveller.quaternion.setFromUnitVectors(UP, curN);

  /* Update golden landing sparkles */
  for (let i = sparks.length - 1; i >= 0; i--) {
    const sp = sparks[i];
    sp.life -= dt;
    if (sp.life <= 0) { world.remove(sp.mesh); sparks.splice(i, 1); continue; }
    sp.vel.addScaledVector(sp.normal, -6.5 * dt);
    sp.mesh.position.addScaledVector(sp.vel, dt);
    sp.mesh.scale.setScalar(Math.max(0.01, sp.life / 0.75));
  }

  /* Animate completion crowns, NEXT pulse beacons, and projected front-facing labels */
  const W = window.innerWidth, H = window.innerHeight;
  world.updateMatrixWorld(true);
  for (const e of islandEntries) {
    if (e.crown) {
      e.crown.rotation.y = time * 1.4 + e.idx;
      e.crown.position.y = 1.46 + Math.sin(time * 2.4 + e.idx) * 0.08;
    }
    if (e.beacon) {
      const s = 1 + 0.14 * Math.sin(time * 3.2);
      e.beacon.scale.set(s, s, 1);
    }
    /* Screen-space floating label only when island faces the camera */
    tmpV.copy(e.normal).applyQuaternion(world.quaternion);
    const vis = tmpV.z > 0.24;
    if (!vis) {
      e.labelEl.style.opacity = '0';
    } else {
      projV.copy(e.pos3).applyMatrix4(world.matrixWorld).project(camera);
      const sx = (projV.x * 0.5 + 0.5) * W;
      const sy = (-projV.y * 0.5 + 0.5) * H + 14;
      e.labelEl.style.left = sx.toFixed(1) + 'px';
      e.labelEl.style.top = sy.toFixed(1) + 'px';
      e.labelEl.classList.toggle('active', e.idx === activeIdx);
      e.labelEl.style.opacity = e.idx === activeIdx ? '1' : String(Math.min(0.95, (tmpV.z - 0.24) * 2.2));
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

resize();
updateHUD();
buildTimeline();
aimForStop(islandEntries[activeIdx], true);
updateDock();
highlightTimeline(false);
requestAnimationFrame(animate);

