/* The mountain and its cloud, drawn at their true distance and size in a scene of their own behind the town (one unit is one metre in both).
   Vesuvius stands 9.5 km from the middle of Pompeii on a bearing of 326 degrees (north-west by north). Its height and shape before the eruption are not known:
   it is drawn as a single green cone about 1,500 m high, as the painting of Bacchus and the mountain from the House of the Centenary shows one (FINDINGS.md).
   The cloud follows Pliny (Letters 6.16 and 6.20) and the volcanologists' reconstruction: a column on a trunk, spreading at the top like an umbrella pine,
   to about 26 km and later 32 km, carried south-east over Pompeii by the wind. e is the state of the eruption:
     0 quiet · 0-1 the column goes up · 1-2 the top spreads and comes over the town · 2-3 the sky closes, pumice falls · 3-4 darkness, lightning in the cloud. */
export function makeVesuvius({ THREE }) {
  const V3 = THREE.Vector3, C = c => new THREE.Color(c), mix = (a, b, t) => a + (b - a) * t, clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v)), sstep = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
  const far = new THREE.Scene(), BEAR = 326 * Math.PI / 180, DIST = 9500, VX = Math.sin(BEAR) * DIST, VZ = -Math.cos(BEAR) * DIST, HM = 1500, WIND = new V3(-VX, 0, -VZ).normalize();      /* the wind blew the cloud towards Pompeii and Stabiae */
  const SUNP = new V3(-0.112, 0.766, 0.633).normalize();      /* where the sun stands: high in the south, a little after midday */
  const hemi = new THREE.HemisphereLight(C('#a8c8ff'), C('#8a7a5a'), 1.5), sun = new THREE.DirectionalLight(C('#fff2dc'), 3.0); sun.position.copy(SUNP).multiplyScalar(1000); far.add(hemi, sun);
  /* ---- the sky ---- */
  const skyU = { uSun: { value: SUNP }, uTop: { value: C('#2a62b8') }, uLow: { value: C('#cfe0f0') }, uSunK: { value: 1 }, uVes: { value: new V3(VX, 0, VZ).normalize() }, uGlow: { value: 0 }, uFlash: { value: 0 } };
  const sky = new THREE.Mesh(new THREE.SphereGeometry(90000, 32, 16), new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false, uniforms: skyU,
    vertexShader: 'varying vec3 vDir; void main(){ vDir = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uSun, uTop, uLow, uVes; uniform float uSunK, uGlow, uFlash; varying vec3 vDir; void main(){ vec3 d = normalize(vDir); float h = clamp(d.y, 0.0, 1.0), s = max(0.0, dot(d, uSun));
      vec3 col = mix(uLow, uTop, pow(h, 0.5)); col = mix(col, uLow * 0.9, smoothstep(0.0, -0.08, d.y)); col += vec3(1.0, 0.92, 0.75) * (pow(s, 300.0) * 1.6 + pow(s, 14.0) * 0.16) * uSunK;
      float v = max(0.0, dot(normalize(vec3(d.x, 0.0, d.z)), uVes)); col += vec3(0.9, 0.28, 0.06) * uGlow * pow(v, 6.0) * (1.0 - smoothstep(0.0, 0.5, d.y)); col += vec3(0.7, 0.75, 1.0) * uFlash * pow(v, 2.0) * 0.5;
      gl_FragColor = vec4(col, 1.0);
      #include <colorspace_fragment>
      }` }));
  sky.frustumCulled = false; sky.renderOrder = -10; far.add(sky);
  /* ---- the plain, and the hills that close it ---- */
  const land = new THREE.Mesh(new THREE.CircleGeometry(80000, 48), new THREE.MeshLambertMaterial({ color: '#7f8f5c' })); land.rotation.x = -Math.PI / 2; land.position.y = -12; far.add(land);
  const hillM = new THREE.MeshLambertMaterial({ color: '#6f8676' }), hills = [];
  for (const [bearing, dist, w, h, d] of [[150, 9000, 9000, 1150, 3500], [175, 10500, 8000, 1350, 3500], [205, 12500, 7000, 1100, 3000], [120, 14000, 9000, 900, 4000], [80, 16000, 12000, 1000, 5000], [45, 22000, 14000, 1300, 6000], [15, 26000, 12000, 900, 6000], [270, 30000, 16000, 500, 5000], [235, 24000, 9000, 700, 4000]]) {
    const a = bearing * Math.PI / 180, m = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), hillM); m.scale.set(w / 2, h, d / 2); m.position.set(Math.sin(a) * dist, -12, -Math.cos(a) * dist); m.rotation.y = -a; far.add(m); hills.push(m); }
  /* ---- the mountain: one cone, wooded and planted to near the top, its summit broken and stony ---- */
  const mtn = new THREE.Group(); mtn.position.set(VX, 0, VZ); far.add(mtn);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  { const NR = 26, NA = 72, R = 5600, pos = [], col = [], idx = [], cG = C('#5f8548'), cV = C('#7d9a4e'), cR = C('#8a7a66'), cT = C('#6f6a62'), c = new THREE.Color();
    for (let i = 0; i <= NR; i++) for (let j = 0; j <= NA; j++) { const r = i / NR, a = j / NA * Math.PI * 2, rr = r * R, gully = 0.5 + 0.5 * Math.sin(a * 17 + Math.sin(a * 5) * 2), prof = Math.pow(1 - r, 1.75) * (r < 0.045 ? 0.94 + r * 1.3 : 1), y = HM * prof * (1 - 0.06 * gully * r * (1 - r) * 4) + 40 * hash(i, j % NA) * (1 - r) - 12;
        pos.push(Math.cos(a) * rr * (1 + 0.05 * Math.sin(a * 3 + 1)), y, Math.sin(a) * rr * (1 + 0.05 * Math.cos(a * 2))); const t = y / HM; c.copy(cV).lerp(cG, 0.5 + 0.5 * Math.sin(a * 9 + r * 20)).lerp(cR, sstep(0.55, 0.85, t)).lerp(cT, sstep(0.85, 1, t)); c.multiplyScalar(0.88 + 0.2 * gully); col.push(c.r, c.g, c.b); }
    for (let i = 0; i < NR; i++) for (let j = 0; j < NA; j++) { const a = i * (NA + 1) + j, b = a + NA + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.setIndex(idx); g.computeVertexNormals(); mtn.add(new THREE.Mesh(g, new THREE.MeshLambertMaterial({ vertexColors: true }))); }
  /* ---- the cloud: some hundreds of lit, rounded masses. Those of the trunk climb; those of the crown drift outwards ---- */
  const NC = 230, NU = 520, puffG = new THREE.IcosahedronGeometry(1, 2), puffM = new THREE.MeshLambertMaterial({ color: '#ffffff' }), puffs = new THREE.InstancedMesh(puffG, puffM, NC + NU), d = new THREE.Object3D(), pc = new THREE.Color();
  puffs.frustumCulled = false; puffs.instanceMatrix.setUsage(THREE.DynamicDrawUsage); far.add(puffs); const R = []; for (let i = 0; i < NC + NU; i++) R.push([hash(i, 1), hash(i, 2), hash(i, 3), hash(i, 4), hash(i, 5)]);
  for (let i = 0; i < NC + NU; i++) puffs.setColorAt(i, pc.set('#ffffff'));
  /* the under side of the crown: one dark sheet, ragged at the rim, so that no blue shows between the masses when it is overhead */
  const sheetU = { uCol: { value: C('#8a8078') }, uT: { value: 0 } };
  const sheet = new THREE.Mesh(new THREE.CircleGeometry(1, 72), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: sheetU,
    vertexShader: 'varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 uCol; uniform float uT; varying vec2 vP; float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); } float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y); }
      void main(){ float r = length(vP), a = atan(vP.y, vP.x), f = n(vP * 5.0 + uT * 0.05) * 0.6 + n(vP * 13.0 - uT * 0.08) * 0.4, edge = 1.0 - smoothstep(0.62 + 0.3 * f, 0.9 + 0.1 * f, r); vec3 col = uCol * (0.62 + 0.5 * f); gl_FragColor = vec4(col, edge);
      #include <colorspace_fragment>
      }` }));
  sheet.rotation.x = -Math.PI / 2; sheet.frustumCulled = false; sheet.renderOrder = 2; const sheetG = new THREE.Group(); sheetG.rotation.y = -Math.atan2(WIND.z, WIND.x); sheetG.add(sheet); far.add(sheetG);      /* its long axis lies down the wind */
  const fire = new THREE.Mesh(new THREE.SphereGeometry(1, 16, 10), new THREE.MeshBasicMaterial({ color: '#ff7a2a', transparent: true, opacity: 0, depthWrite: false })); fire.position.set(VX, HM, VZ); far.add(fire);
  const cWhite = C('#f4f1ea'), cDirty = C('#8f8479'), cDark = C('#3c3632'), cBlack = C('#151312');
  const S = { e: 0, hTop: 0, Ru: 0, shade: 0, flash: 0, flashT: 0, t: 0 };
  function update(dt, e, time) {
    /* heights from the volcanologists (Giacomelli and others 2003, after Carey and Sigurdsson): 14 km at first, 26 km through the white pumice, 32 km in the grey */
    S.e = e; S.t = time; const up = sstep(0, 1, e), hTop = HM + (e <= 0 ? 0 : mix(500, 12500, Math.pow(sstep(0, 1.0, e), 0.7)) + 12000 * sstep(1, 2, e) + 6000 * sstep(2.2, 3.2, e)), Ru = e <= 0 ? 0 : mix(500, 7000, sstep(0.3, 1, e)) + 21000 * sstep(1, 2, e) + 26000 * sstep(2, 3.3, e), hU = Math.max(HM + 300, hTop * 0.84);
    S.hTop = hTop; S.Ru = Ru; const stretch = 1 + 0.9 * sstep(1, 2.5, e), drift = Ru * 0.62 * sstep(0.9, 2, e) * stretch, cx = VX + WIND.x * drift, cz = VZ + WIND.z * drift;
    /* the trunk */
    const colH = Math.max(1, hU - HM), speed = mix(0.2, 0.06, sstep(0, 2, e)), dark = sstep(1.7, 3.4, e), dirt = sstep(0.8, 1.9, e);
    for (let i = 0; i < NC; i++) { const r = R[i], ph0 = (r[0] + time * speed * (0.7 + 0.6 * r[3])) % 1, ph = ph0 * ph0 * 0.35 + ph0 * 0.65, y = HM - 200 + ph * colH, rad = (420 + 0.075 * (y - HM) + (900 + Ru * 0.35) * Math.pow(ph, 5)) * (0.55 + 0.45 * up), a = r[1] * 6.283 + time * 0.03 * (r[2] - 0.5), rho = Math.sqrt(r[2]) * 0.9, sz = e <= 0 ? 0 : rad * (0.62 + 0.5 * r[4]) * (0.55 + 0.45 * sstep(0, 0.1, ph)) * (0.8 + 0.2 * Math.sin(time * 0.4 + i));
      const lean = ph * ph * drift * 0.9; d.position.set(VX + Math.cos(a) * rad * rho + WIND.x * lean, y, VZ + Math.sin(a) * rad * rho + WIND.z * lean); d.scale.setScalar(Math.max(0.001, sz)); d.rotation.set(r[1] * 6, r[2] * 6 + time * 0.05, 0); d.updateMatrix(); puffs.setMatrixAt(i, d.matrix);
      pc.copy(cWhite).lerp(cDirty, clamp(r[4] * (0.25 + 0.75 * dirt) + (1 - ph) * 0.3 * (0.4 + 0.6 * dirt))).lerp(cDark, dark * (0.55 + 0.45 * (1 - ph))).lerp(cBlack, sstep(3, 4, e) * 0.6); puffs.setColorAt(i, pc); }
    /* the crown */
    for (let j = 0; j < NU; j++) { const i = NC + j, r = R[i], rho = Math.sqrt((r[0] + time * 0.004 * (0.5 + r[3])) % 1), a = r[1] * 6.283, lump = (0.5 + r[2]) * mix(650, 3000, sstep(0.6, 2.4, e)), ox = Math.cos(a) * rho * Ru, oz = Math.sin(a) * rho * Ru, along = ox * WIND.x + oz * WIND.z;
      d.position.set(cx + ox + WIND.x * along * (stretch - 1), hU + (r[4] - 0.3) * lump * 1.1 + (1 - rho) * Math.min(2600, Ru * 0.13), cz + oz + WIND.z * along * (stretch - 1)); const sz = e <= 0.25 ? 0 : lump * sstep(0.25, 0.7, e) * (1.05 - 0.45 * rho * rho); d.scale.set(Math.max(0.001, sz * 1.5), Math.max(0.001, sz * 0.62), Math.max(0.001, sz * 1.5)); d.rotation.set(0, r[3] * 6, 0); d.updateMatrix(); puffs.setMatrixAt(i, d.matrix);
      pc.copy(cWhite).lerp(cDirty, clamp(r[3] * (0.2 + 0.8 * dirt) + 0.08)).lerp(cDark, dark * (0.6 + 0.4 * r[2])).lerp(cBlack, sstep(3, 4, e) * 0.7); puffs.setColorAt(i, pc); }
    puffs.instanceMatrix.needsUpdate = true; puffs.instanceColor.needsUpdate = true;
    sheetG.visible = e > 0.95; sheetG.position.set(cx, hU - 350, cz); sheetG.scale.set(Ru * 1.1 * stretch, 1, Ru * 1.1); sheetU.uT.value = time; sheetU.uCol.value.copy(cDirty).lerp(cDark, sstep(1.4, 2.6, e)).lerp(cBlack, sstep(2.8, 3.8, e) * 0.85).multiplyScalar(0.6);
    /* is the sun behind the crown, seen from the town? */
    const t = hU / SUNP.y, px = SUNP.x * t - cx, pz = SUNP.z * t - cz, al = px * WIND.x + pz * WIND.z, ac = px * -WIND.z + pz * WIND.x, q = Math.hypot(al / stretch, ac) / Math.max(1, Ru); S.shade = e < 0.9 ? 0 : 1 - sstep(0.7, 1.0, q);
    const over = (() => { const ox = -cx, oz = -cz, a2 = ox * WIND.x + oz * WIND.z, c2 = ox * -WIND.z + oz * WIND.x; return 1 - sstep(0.75, 1.05, Math.hypot(a2 / stretch, c2) / Math.max(1, Ru)); })(); S.over = e < 0.9 ? 0 : over;
    /* light: day, then the brown dusk under the cloud, then night */
    const night = Math.max(S.shade * 0.55 + S.over * 0.25, sstep(2.2, 3.6, e)), haze = sstep(1.2, 2.6, e);
    skyU.uTop.value.set('#2a62b8').lerp(C('#6a6252'), haze).lerp(C('#0c0b0a'), sstep(2.6, 3.8, e)); skyU.uLow.value.set('#cfe0f0').lerp(C('#b8a888'), haze).lerp(C('#1a1512'), sstep(2.7, 3.9, e)); skyU.uSunK.value = (1 - S.shade) * (1 - sstep(2.2, 3, e));
    sun.intensity = 3.0 * (1 - 0.93 * sstep(1.2, 2.4, e)); hemi.intensity = mix(1.5, 0.22, sstep(1.5, 3.2, e)); land.material.color.set('#7f8f5c').lerp(C('#3a382e'), night); hillM.color.set('#6f8676').lerp(C('#2a2a26'), night);
    /* fire at the vent, and lightning in the cloud */
    const glow = sstep(2.4, 3.6, e); fire.material.opacity = 0.75 * glow; fire.scale.setScalar(700 + 300 * Math.sin(time * 3)); skyU.uGlow.value = glow * (0.5 + 0.2 * Math.sin(time * 2.3));
    S.flashT -= dt; if (e > 1.3 && S.flashT < 0) { S.flashT = mix(7, 1.6, sstep(1.3, 3.6, e)) * (0.5 + Math.random()); S.flash = 1; S.struck = true; } S.flash = Math.max(0, S.flash - dt * 5); skyU.uFlash.value = S.flash * (0.5 + 0.5 * sstep(2, 3.5, e)); hemi.intensity += S.flash * 2.5 * sstep(1.3, 2.5, e);
    S.night = night; S.haze = haze; return S;
  }
  update(0, 0, 0);
  return { far, update, S, SUNP, VX, VZ, HM, sky, dir: new V3(VX, 0, VZ).normalize() };
}
