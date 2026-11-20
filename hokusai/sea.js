import * as THREE from 'three';

/* Authentic palette sampled directly from Met JP1847 (great_wave.jpg) */
export const PAL = {
  washiLight:  new THREE.Color(0xf6e8c8),
  washiWarm:   new THREE.Color(0xeedbb3),
  horizonSmoke:new THREE.Color(0x8c8b83),
  prussianDeep:new THREE.Color(0x16385e),
  prussianMid: new THREE.Color(0x285682),
  prussianPale:new THREE.Color(0x7ca2b6),
  foamWhite:   new THREE.Color(0xeef1e8),
  boatOchre:   new THREE.Color(0xe0b28e),
  vermilion:   new THREE.Color(0xc44727),
};

export const STAGE_INFO = [
  {
    id: 0,
    kanji: '凪',
    short: 'Bay',
    goal: '1 of 4 · Row towards your sister boat’s white wake',
    cue: 'Calm morning off Kanagawa. Mount Fuji stands tall on the far horizon.',
  },
  {
    id: 1,
    kanji: '波',
    short: 'Trough',
    goal: '2 of 4 · Drop into the swell and hold Hold Low (Space) to watch Fuji shrink',
    cue: 'Slide down into the blue trough — see how a near wave rises over a distant mountain.',
  },
  {
    id: 2,
    kanji: '潮',
    short: 'Cross',
    goal: '3 of 4 · Glide through the crossing Prussian-blue swells',
    cue: 'Two storm swells meet across Edo Bay. Steer smoothly with the lift and fall.',
  },
  {
    id: 3,
    kanji: '大',
    short: 'Wave',
    goal: '4 of 4 · Steer beneath the Great Wave and hold Hold Low (Space) to frame Fuji',
    cue: 'Tuck low with your crew! Drop your eye to the water to frame Fuji inside the wave.',
  },
];

/*
 * Shared analytical swell field for the open-bay voyage (z runs from +2 toward -150).
 * Gives the boat genuine rise, crest hang, downhill glide, and gentle cross-roll.
 */
export function swellAmpAt(z) {
  /* Calm at start (z > -45), builds across swells 2 & 3, peaks near z = -175, calms beyond */
  const build = THREE.MathUtils.smoothstep(-z, 20, 168);
  const calmAfter = 1.0 - 0.65 * THREE.MathUtils.smoothstep(-z, 190, 235);
  return (0.24 + 1.18 * build) * calmAfter;
}

export function seaHeight(x, z, t) {
  const amp = swellAmpAt(z);
  const w1 = Math.sin(z * 0.24 + t * 1.45 + Math.sin(x * 0.18) * 0.55);
  const w2 = Math.sin(z * 0.43 - x * 0.21 + t * 1.95) * 0.36;
  const w3 = Math.cos(z * 0.13 + x * 0.14 + t * 0.85) * 0.28;
  return (w1 + w2 + w3) * amp;
}

export function seaSlope(x, z, t) {
  const e = 0.25;
  const hx = (seaHeight(x + e, z, t) - seaHeight(x - e, z, t)) / (2 * e);
  const hz = (seaHeight(x, z + e, t) - seaHeight(x, z - e, t)) / (2 * e);
  return { dx: hx, dz: hz };
}

/* Crisp procedural woodblock foam droplet & ring textures */
export function makeSprayTexture() {
  const cv = document.createElement('canvas');
  cv.width = 64; cv.height = 64;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  g.fillStyle = '#f2f4ec';
  g.strokeStyle = '#244b73';
  g.lineWidth = 4;
  g.beginPath();
  g.arc(32, 32, 22, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

export function makeGateRingTexture() {
  const cv = document.createElement('canvas');
  cv.width = 256; cv.height = 256;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 256, 256);
  /* Outer Prussian-blue carved wave ring */
  g.strokeStyle = '#183a62';
  g.lineWidth = 10;
  g.beginPath();
  g.arc(128, 128, 104, 0, Math.PI * 2);
  g.stroke();
  /* Crisp white foam halo */
  g.strokeStyle = '#f5f4ea';
  g.lineWidth = 16;
  g.setLineDash([28, 14]);
  g.beginPath();
  g.arc(128, 128, 86, 0, Math.PI * 2);
  g.stroke();
  /* Inner warm ochre / vermilion beacon seal */
  g.setLineDash([]);
  g.strokeStyle = '#c44727';
  g.lineWidth = 6;
  g.beginPath();
  g.arc(128, 128, 56, 0, Math.PI * 2);
  g.stroke();
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

/* ================= Hokusai Woodblock Sea Ribbon Shader (flat Prussian-blue bands + claw foam + key line) ================= */
export function makeSeaRibbonMaterial(shared, depthBand, stripeSeed) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: true,
    side: THREE.DoubleSide,
    uniforms: {
      uTime: shared.uTime,
      uFade: shared.uBayFade,
      uDepthBand: { value: depthBand },
      uSeed: { value: stripeSeed },
      uWorldZ: { value: 0.0 },
      uSwellAmp: { value: 0.5 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uWorldZ;
      uniform float uSwellAmp;
      uniform float uSeed;
      varying vec2 vUv;
      varying float vWorldX;
      varying float vCrest;
      void main() {
        vUv = uv;
        vec3 p = position;
        float wx = p.x;
        float wz = uWorldZ;
        float w1 = sin(wz * 0.24 + uTime * 1.45 + sin(wx * 0.18) * 0.55);
        float w2 = sin(wz * 0.43 - wx * 0.21 + uTime * 1.95) * 0.36;
        float w3 = cos(wz * 0.13 + wx * 0.14 + uTime * 0.85) * 0.28;
        float h = (w1 + w2 + w3) * uSwellAmp;
        /* Scalloped Hokusai crest silhouette along top edge of ribbon */
        float curl = sin(wx * 1.35 + uSeed * 6.28 + uTime * 0.9) * 0.16
                   + sin(wx * 3.1 - uSeed * 4.1 + uTime * 1.3) * 0.065;
        float topFactor = smoothstep(0.35, 1.0, uv.y);
        p.y += h + curl * topFactor * (0.45 + 0.55 * uSwellAmp);
        /* Subtle forward lean at crest */
        p.x += sin(wz * 0.24 + uTime * 1.45) * 0.22 * topFactor;
        vWorldX = wx;
        vCrest = clamp(0.5 + 0.45 * w1, 0.0, 1.0);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uFade;
      uniform float uDepthBand;
      uniform float uSeed;
      uniform float uSwellAmp;
      varying vec2 vUv;
      varying float vWorldX;
      varying float vCrest;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
      }
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      void main() {
        if (uFade < 0.01) discard;
        /* Scalloped woodblock foam claw edge along top of the wave ribbon */
        float x = vWorldX;
        float claw = 0.036 * sin(x * 2.2 + uSeed * 11.0 + uTime * 0.55)
                   + 0.020 * sin(x * 5.6 - uSeed * 7.3)
                   + 0.011 * cos(x * 10.8 + uSeed * 3.1);
        float topEdge = 0.948 + claw * (0.52 + 0.48 * uSwellAmp);
        if (vUv.y > topEdge) discard;

        /* Crisp carved Prussian-blue key-block outline (Rijksmuseum: lijnblok in blauw) */
        float outline = 1.0 - smoothstep(0.0, 0.016, topEdge - vUv.y);

        /* Refined slimmer foam cap so rich Prussian-blue bands dominate Edo Bay */
        float foamDepth = (0.048 + 0.068 * vCrest) * (0.55 + 0.55 * uSwellAmp)
                        + 0.022 * sin(x * 3.1 + uSeed * 5.0)
                        + 0.014 * cos(x * 7.2 - uSeed * 9.0);
        foamDepth *= mix(1.0, 0.52, uDepthBand);
        float inFoam = smoothstep(topEdge - foamDepth - 0.012, topEdge - foamDepth + 0.008, vUv.y);
        float foamLine = (1.0 - smoothstep(0.0, 0.013, abs(vUv.y - (topEdge - foamDepth)))) * 0.76;

        /* Authentic flat graded Prussian-blue woodblock stripe bands (sampled from Met JP1847) */
        float waveCoord = vUv.y * 6.8 + 0.44 * sin(x * 0.58 + uSeed * 8.0) + 0.16 * sin(x * 1.45 - uTime * 0.4);
        float stripe = fract(waveCoord);
        vec3 deepBlue = vec3(0.075, 0.200, 0.352);
        vec3 midBlue  = vec3(0.155, 0.342, 0.518);
        vec3 paleBlue = vec3(0.495, 0.655, 0.742);
        vec3 foamCol  = vec3(0.930, 0.942, 0.908);
        vec3 keyBlue  = vec3(0.062, 0.155, 0.285);

        /* Hard woodblock colour steps with tiny anti-aliased ink transitions */
        vec3 body = deepBlue;
        body = mix(body, midBlue,  smoothstep(0.26, 0.31, stripe) * (1.0 - smoothstep(0.66, 0.71, stripe)));
        body = mix(body, paleBlue, smoothstep(0.68, 0.73, stripe) * (1.0 - smoothstep(0.84, 0.89, stripe)));
        /* Distance-based bokashi (woodblock colour gradation toward misty horizon) */
        vec3 mistBlue = mix(midBlue, vec3(0.56, 0.66, 0.72), 0.50);
        body = mix(body, mistBlue, clamp(uDepthBand * 0.58, 0.0, 0.58));
        /* Subtle dark stripe key-line inside the water bands */
        float bandInk = 1.0 - smoothstep(0.0, 0.045, abs(stripe - 0.71));
        body = mix(body, keyBlue, bandInk * 0.42);

        vec3 col = mix(body, foamCol, inFoam);
        col = mix(col, keyBlue, clamp(outline + foamLine, 0.0, 1.0));

        /* Warm handmade washi paper fibre grain across every woodblock colour */
        float grain = (noise(vec2(x * 5.0, vUv.y * 38.0)) - 0.5) * 0.055;
        col = clamp(col + vec3(grain * 1.05, grain * 0.95, grain * 0.78), 0.0, 1.0);
        gl_FragColor = vec4(col, uFade);
      }
    `,
  });
}

/* ================= Warm Washi Paper Sky Backdrop with Rising Ochre Clouds & Smoky Horizon ================= */
export function makeWashiSkyMaterial(shared) {
  return new THREE.ShaderMaterial({
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      uTime: shared.uTime,
      uStorm: shared.uStorm,
      uFade: shared.uBayFade,
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float uTime;
      uniform float uStorm;
      uniform float uFade;
      varying vec2 vUv;
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p); vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
      }
      void main() {
        vec3 paperTop   = vec3(0.961, 0.902, 0.761);
        vec3 cloudWarm  = vec3(0.976, 0.937, 0.847);
        vec3 ochreWash  = vec3(0.922, 0.843, 0.678);
        vec3 smokeLow   = vec3(0.545, 0.541, 0.510);
        vec3 seaMist    = vec3(0.675, 0.745, 0.765);

        /* Soft rising woodblock cumulus band matching Met JP1847 */
        float cShape = noise(vec2(vUv.x * 4.2 + uTime * 0.008, vUv.y * 3.1))
                     + 0.45 * noise(vec2(vUv.x * 9.0 - uTime * 0.012, vUv.y * 7.2));
        float cloudMask = smoothstep(0.68, 0.84, cShape) * smoothstep(0.32, 0.56, vUv.y) * (1.0 - smoothstep(0.84, 0.96, vUv.y));
        vec3 sky = mix(ochreWash, paperTop, smoothstep(0.38, 0.78, vUv.y));
        sky = mix(sky, cloudWarm, cloudMask * 0.78);

        /* Authentic bokashi smoky horizon band (thickens slightly as the Great Wave approaches) */
        float hor = exp(-pow((vUv.y - 0.35) / (0.095 + 0.04 * uStorm), 2.0));
        sky = mix(sky, smokeLow, hor * (0.42 + 0.36 * uStorm));
        /* Soft mist below horizon line */
        sky = mix(sky, seaMist, smoothstep(0.35, 0.25, vUv.y));

        /* Subtle mulberry washi fibres */
        float fib = (noise(vUv * vec2(180.0, 95.0)) - 0.5) * 0.035;
        sky = clamp(sky + vec3(fib, fib * 0.92, fib * 0.78), 0.0, 1.0);
        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  });
}

/* ================= Perspective-Locked Museum Print Plate Shader (8 layers of Met JP1847) ================= */
export function makePrintPlateMaterial(tex, plate, shared, PW, PH, CAM_D) {
  const animKind =
    plate.id === 'p3_great_wave' ? 1.0 :
    plate.id === 'p6_fore_wave'  ? 2.0 :
    plate.id === 'p2b_mid_boat'  ? 3.0 :
    plate.id === 'p5_hero_boat'  ? 4.0 :
    plate.id === 'p4_mid_trough' || plate.id === 'p2a_far_wave' ? 5.0 : 0.0;

  return new THREE.ShaderMaterial({
    transparent: plate.id !== 'p0_sky',
    depthWrite: plate.id === 'p0_sky',
    side: THREE.FrontSide,
    uniforms: {
      uMap:        { value: tex },
      uTime:       shared.uTime,
      uDepthScale: shared.uDepthScale,
      uMotion:     shared.uPrintMotion,
      uAlpha:      shared.uPrintFade,
      uLocalAlpha: { value: 1.0 },
      uPlateZ:     { value: plate.z },
      uCamD:       { value: CAM_D },
      uPW:         { value: PW },
      uPH:         { value: PH },
      uBoxUV:      { value: new THREE.Vector4(plate.u0, plate.v0, plate.u1, plate.v1) },
      uAnimKind:   { value: animKind },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uDepthScale;
      uniform float uMotion;
      uniform float uPlateZ;
      uniform float uCamD;
      uniform float uPW;
      uniform float uPH;
      uniform vec4  uBoxUV;
      uniform float uAnimKind;
      varying vec2 vUv;

      void main() {
        vUv = uv;
        /* Full-print normalised coords (0..1 left-to-right, top-to-bottom) */
        float u = mix(uBoxUV.x, uBoxUV.z, uv.x);
        float v = mix(uBoxUV.w, uBoxUV.y, uv.y);
        float x0 = (u - 0.5) * uPW;
        float y0 = (0.5 - v) * uPH;

        vec2 anim = vec2(0.0);
        float m = uMotion * uDepthScale;
        if (m > 0.001) {
          if (uAnimKind > 0.5 && uAnimKind < 1.5) {
            /* p3_great_wave: slow monumental swell + curling claw tips flexing forward */
            float topMask = smoothstep(0.68, 0.14, v);
            float clawMask = smoothstep(0.28, 0.52, u) * smoothstep(0.46, 0.16, v);
            anim.y = sin(uTime * 1.15 - u * 2.2) * 0.11 * topMask * m;
            anim.x = (sin(uTime * 1.15 + 0.6) * 0.07 * topMask
                    + sin(uTime * 2.3 + v * 12.0) * 0.045 * clawMask) * m;
          } else if (uAnimKind > 1.5 && uAnimKind < 2.5) {
            /* p6_fore_wave: foreground snow-echo wave heaving out of phase */
            float crest = smoothstep(0.98, 0.56, v);
            anim.y = sin(uTime * 1.35 + 1.9 + u * 2.8) * 0.10 * crest * m;
            anim.x = cos(uTime * 1.35 + 1.1) * 0.055 * crest * m;
          } else if (uAnimKind > 2.5 && uAnimKind < 3.5) {
            /* p2b_mid_boat: gentle pitch and bob on the far swell */
            float dy = sin(uTime * 1.45 + 0.8) * 0.055 * m;
            float ang = cos(uTime * 1.45 + 0.8) * 0.032 * m;
            float du = (u - 0.72) * uPW;
            anim.y = dy + du * ang;
            anim.x = sin(uTime * 0.9) * 0.025 * m;
          } else if (uAnimKind > 3.5 && uAnimKind < 4.5) {
            /* p5_hero_boat: gentle settle bob */
            float dy = sin(uTime * 1.5 + 2.2) * 0.045 * m;
            float ang = cos(uTime * 1.5 + 2.2) * 0.024 * m;
            float du = (u - 0.60) * uPW;
            anim.y = dy + du * ang;
          } else if (uAnimKind > 4.5) {
            /* p4_mid_trough & p2a_far_wave: rhythmic cross-swell */
            anim.y = sin(uTime * 1.25 + u * 3.1 + uPlateZ) * 0.07 * m;
            anim.x = cos(uTime * 1.05 + uPlateZ) * 0.035 * m;
          }
        }

        float zEff = uPlateZ * uDepthScale;
        /* Exact perspective-locked projective scaling so zEff -> 0 reproduces the print 1:1 */
        float s = (uCamD - zEff) / uCamD;
        vec3 worldPos = vec3((x0 + anim.x) * s, (y0 + anim.y) * s, zEff);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(worldPos, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D uMap;
      uniform float uAlpha;
      uniform float uLocalAlpha;
      varying vec2 vUv;
      void main() {
        vec4 c = texture2D(uMap, vUv);
        float a = c.a * uAlpha * uLocalAlpha;
        if (a < 0.015) discard;
        gl_FragColor = vec4(c.rgb, a);
      }
    `,
  });
}

/* ================= Woodblock-Inked Oshiokuri-bune Boat Rig (unlit flat colour + Prussian blue outline) ================= */
function woodMat(hex) {
  return new THREE.MeshBasicMaterial({ color: hex });
}

export function makePlayerBoat() {
  const root = new THREE.Group();
  const hullGroup = new THREE.Group();
  root.add(hullGroup);

  const mOchre = woodMat(0xe0b28e);
  const mOchreDark = woodMat(0xc5936d);
  const mInk = woodMat(0x143154);
  const mBlue = woodMat(0x1f4b78);
  const mSkin = woodMat(0xf0d6bc);
  const mBand = woodMat(0xf4f3eb);
  const mStraw = woodMat(0xd6c394);

  /* Slender curved oshiokuri-bune hull built from flat-shaded woodblock profile sections */
  const hullPts = [
    [0.00, 0.42, -1.95], [0.22, 0.22, -1.35], [0.38, 0.12, -0.55],
    [0.40, 0.11,  0.35], [0.32, 0.14,  1.15], [0.18, 0.22,  1.65]
  ];
  const makePlankShell = (scale, mat, yOff = 0) => {
    const pos = [];
    const idx = [];
    const n = hullPts.length;
    for (let i = 0; i < n; i++) {
      const [w, y, z] = hullPts[i];
      const sw = w * scale;
      const sy = y + yOff;
      /* Left gunwale, keel, right gunwale */
      pos.push(-sw, sy + 0.14, z);
      pos.push(0, sy - 0.16 * scale, z);
      pos.push(sw, sy + 0.14, z);
    }
    for (let i = 0; i < n - 1; i++) {
      const a = i * 3, b = (i + 1) * 3;
      /* Left outer side */
      idx.push(a, a + 1, b, b, a + 1, b + 1);
      /* Right outer side */
      idx.push(a + 1, a + 2, b + 1, b + 1, a + 2, b + 2);
      /* Deck top */
      idx.push(a, b, a + 2, b, b + 2, a + 2);
    }
    /* Solid capped stern transom so the boat never shows an open triangular gap from behind */
    const last = (n - 1) * 3;
    idx.push(last, last + 1, last + 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    const m = new THREE.Mesh(geo, mat);
    m.material.side = THREE.DoubleSide;
    return m;
  };

  /* Ink outline shell slightly larger behind ochre hull */
  hullGroup.add(makePlankShell(1.10, mInk, -0.025));
  hullGroup.add(makePlankShell(1.00, mOchre, 0.0));

  /* Dark curved wooden prow tip + stern sculling rudder + inner thwart boards */
  const prow = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.34, 0.42), mInk);
  prow.position.set(0, 0.48, -1.96);
  prow.rotation.x = -0.52;
  hullGroup.add(prow);

  const sternBoard = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.24, 0.07), mOchreDark);
  sternBoard.position.set(0, 0.26, 1.64);
  const sternTrim = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.09), mInk);
  sternTrim.position.set(0, 0.37, 1.64);
  hullGroup.add(sternBoard, sternTrim);

  for (let i = 0; i < 4; i++) {
    const z = -0.95 + i * 0.62;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.64, 0.04, 0.14), mOchreDark);
    seat.position.set(0, 0.25, z);
    hullGroup.add(seat);
  }
  /* Woven straw bow mat (visible on the front of Hokusai's boats) */
  const matBox = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.06, 0.68), mStraw);
  matBox.position.set(0, 0.28, -1.15);
  hullGroup.add(matBox);

  /* Crouched Edo crewmen in Prussian-blue coats (tuck lower when holding Hold Low!) */
  const crewGroup = new THREE.Group();
  hullGroup.add(crewGroup);
  const crewZ = [-0.42, 0.02, 0.46, 0.90];
  crewZ.forEach((z, ci) => {
    for (const side of [-1, 1]) {
      const man = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.24, 0.22), mBlue);
      body.position.y = 0.12;
      const bodyInk = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.27, 0.25), mInk);
      bodyInk.position.y = 0.12;
      bodyInk.scale.set(1.02, 1.02, 1.02);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.085, 8, 6), mSkin);
      head.position.set(0, 0.29, -0.04);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.018, 5, 10), mBand);
      band.position.set(0, 0.31, -0.04);
      band.rotation.x = Math.PI * 0.48;
      man.add(body, head, band);
      man.position.set(side * 0.16, 0.24, z + (ci % 2) * 0.04);
      crewGroup.add(man);
    }
  });

  /* 6 animated wooden sculling oars (3 per side) */
  const oars = [];
  for (let i = 0; i < 3; i++) {
    const z = -0.35 + i * 0.55;
    for (const side of [-1, 1]) {
      const piv = new THREE.Group();
      piv.position.set(side * 0.34, 0.26, z);
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.045, 0.07), mOchreDark);
      shaft.position.set(side * 0.50, -0.08, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.03, 0.13), mInk);
      blade.position.set(side * 0.96, -0.14, 0);
      piv.add(shaft, blade);
      hullGroup.add(piv);
      oars.push({ piv, side, phase: i * 0.45 });
    }
  }

  /* Crisp woodblock white-foam V-wake trailing behind the stern */
  const wakeMat = new THREE.MeshBasicMaterial({
    color: 0xf2f4ec, transparent: true, opacity: 0.78, side: THREE.DoubleSide, depthWrite: false,
  });
  const wakeL = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 2.8), wakeMat);
  wakeL.rotation.x = -Math.PI / 2;
  wakeL.rotation.z = 0.22;
  wakeL.position.set(-0.55, 0.03, 2.55);
  const wakeR = new THREE.Mesh(new THREE.PlaneGeometry(0.32, 2.8), wakeMat);
  wakeR.rotation.x = -Math.PI / 2;
  wakeR.rotation.z = -0.22;
  wakeR.position.set(0.55, 0.03, 2.55);
  root.add(wakeL, wakeR);

  return {
    root,
    hullGroup,
    crewGroup,
    oars,
    wakeMat,
    setMotion(oarCycle, rowPower, crouchAmt, speedNorm) {
      /* Crew tucks down neatly into hull when Hold Low is pressed */
      crewGroup.scale.y = 1.0 - 0.42 * crouchAmt;
      crewGroup.position.y = -0.09 * crouchAmt;
      for (const o of oars) {
        const s = Math.sin(oarCycle + o.phase);
        const c = Math.cos(oarCycle + o.phase);
        o.piv.rotation.y = o.side * s * (0.28 + 0.22 * rowPower) * (1.0 - 0.5 * crouchAmt);
        o.piv.rotation.z = -o.side * (0.14 + 0.18 * Math.max(0, c) * (0.4 + 0.6 * rowPower) + 0.22 * crouchAmt);
      }
      wakeMat.opacity = 0.25 + 0.62 * Math.min(1, speedNorm);
    },
  };
}

/* ================= Procedural Sea & Oar Audio (calm, tactile, zero external audio) ================= */
export function makeSeaAudio() {
  let ctx = null;
  let surfGain = null;
  let surfFilter = null;
  let muted = false;

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    /* Soft looping filtered noise bed for Edo Bay swells */
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.035 * w) / 1.035;
      d[i] = last * 2.6;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    surfFilter = ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.value = 340;
    surfGain = ctx.createGain();
    surfGain.gain.value = 0.0;
    src.connect(surfFilter).connect(surfGain).connect(ctx.destination);
    src.start();
    return ctx;
  }

  return {
    unlock() {
      const c = ensure();
      if (c && c.state === 'suspended') c.resume();
    },
    setMuted(m) {
      muted = m;
      if (surfGain && ctx) surfGain.gain.setTargetAtTime(m ? 0 : 0.05, ctx.currentTime, 0.15);
    },
    updateSurf(swellLevel, speedNorm) {
      if (!ctx || !surfGain || muted) return;
      const g = 0.025 + 0.055 * swellLevel + 0.025 * speedNorm;
      surfGain.gain.setTargetAtTime(g, ctx.currentTime, 0.18);
      surfFilter.frequency.setTargetAtTime(260 + 460 * swellLevel + 180 * speedNorm, ctx.currentTime, 0.18);
    },
    oarDip() {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const now = c.currentTime;
      const osc = c.createOscillator();
      const g = c.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(165, now);
      osc.frequency.exponentialRampToValueAtTime(72, now + 0.12);
      g.gain.setValueAtTime(0.045, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(g).connect(c.destination);
      osc.start(now);
      osc.stop(now + 0.15);
    },
    chime(freq = 523.25) {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const now = c.currentTime;
      [1, 1.5, 2.0].forEach((mul, idx) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * mul, now + idx * 0.06);
        g.gain.setValueAtTime(0.055 / (idx + 1), now + idx * 0.06);
        g.gain.exponentialRampToValueAtTime(0.0008, now + 1.45);
        osc.connect(g).connect(c.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + 1.5);
      });
    },
  };
}
