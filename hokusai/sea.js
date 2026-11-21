import * as THREE from 'three';

/* Authentic palette sampled directly from Met JP1847 (great_wave.jpg) */
export const PAL = {
  washiLight:   new THREE.Color(0xf6e8c8),
  washiWarm:    new THREE.Color(0xeedbb3),
  horizonSmoke: new THREE.Color(0x8c8b83),
  prussianDeep: new THREE.Color(0x16385e),
  prussianMid:  new THREE.Color(0x285682),
  prussianPale: new THREE.Color(0x7ca2b6),
  foamWhite:    new THREE.Color(0xeef1e8),
  boatOchre:    new THREE.Color(0xe0b28e),
  vermilion:    new THREE.Color(0xc44727),
};

export const RIDE_LENGTH = 435.0;

export function rideProgress(z) {
  return THREE.MathUtils.clamp(-z / RIDE_LENGTH, 0, 1);
}

/*
 * Swell amplitude across the ~90 s ride (z runs from 0 toward -435).
 * Starts lively enough to feel great in the first 5 seconds, then builds into
 * tall rolling troughs that swallow Mount Fuji before the Great Wave looms ahead.
 */
export function swellAmpAt(z) {
  const p = rideProgress(z);
  const ramp = THREE.MathUtils.smoothstep(p, 0.0, 0.85);
  return 0.68 + 1.22 * ramp;
}

/*
 * Sculptural diagonal ocean rollers rolling toward the boat:
 * broad climb, crisp crest lift & float, sweeping downhill face to carve.
 */
export function seaHeight(x, z, t) {
  const amp = swellAmpAt(z);
  /* Primary long ocean roller moving toward +z so the boat crests cleanly every ~3 s */
  const phase1 = z * 0.175 + x * 0.055 - t * 0.88;
  const w1 = Math.sin(phase1) + 0.18 * Math.sin(phase1 * 2.0 - 0.45);
  /* Cross-swell giving slalom shoulders to carve across */
  const phase2 = z * 0.25 - x * 0.145 - t * 1.15;
  const w2 = Math.sin(phase2) * 0.36;
  /* Broad low heave */
  const w3 = Math.cos(z * 0.08 + x * 0.075 - t * 0.52) * 0.28;
  return (w1 + w2 + w3) * amp;
}

export function seaSlope(x, z, t) {
  const e = 0.30;
  const hx = (seaHeight(x + e, z, t) - seaHeight(x - e, z, t)) / (2 * e);
  const hz = (seaHeight(x, z + e, t) - seaHeight(x, z - e, t)) / (2 * e);
  return { dx: hx, dz: hz };
}

/* Crisp woodblock foam droplet texture (white pearl with Prussian-blue key-line) */
export function makeSprayTexture() {
  const cv = document.createElement('canvas');
  cv.width = 64; cv.height = 64;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 64, 64);
  g.fillStyle = '#f3f4ec';
  g.strokeStyle = '#183a62';
  g.lineWidth = 4.5;
  g.beginPath();
  g.arc(32, 32, 22, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  /* Tiny inner pale-blue crescent */
  g.strokeStyle = '#7ca2b6';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(34, 34, 14, 0.3, 2.3);
  g.stroke();
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

/* Luminous woodblock spray-pearl orb texture for slalom lines (warm cream core + blue ring) */
export function makeChimeDropTexture() {
  const cv = document.createElement('canvas');
  cv.width = 96; cv.height = 96;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 96, 96);
  /* Soft pale foam halo */
  const rad = g.createRadialGradient(48, 48, 14, 48, 48, 44);
  rad.addColorStop(0, 'rgba(246, 232, 200, 0.95)');
  rad.addColorStop(0.55, 'rgba(238, 241, 232, 0.72)');
  rad.addColorStop(1, 'rgba(238, 241, 232, 0.0)');
  g.fillStyle = rad;
  g.beginPath();
  g.arc(48, 48, 44, 0, Math.PI * 2);
  g.fill();
  /* Crisp woodblock bead */
  g.fillStyle = '#faf5e6';
  g.strokeStyle = '#16385e';
  g.lineWidth = 4.5;
  g.beginPath();
  g.arc(48, 48, 23, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  /* Vermilion-gold accent dot inside so lines read effortlessly over white foam */
  g.fillStyle = '#d4854a';
  g.beginPath();
  g.arc(43, 43, 7, 0, Math.PI * 2);
  g.fill();
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  return tx;
}

/* Woodblock foam wake ribbon texture for the two sister boats' slipstreams */
export function makeWakeRibbonTexture() {
  const cv = document.createElement('canvas');
  cv.width = 128; cv.height = 256;
  const g = cv.getContext('2d');
  g.clearRect(0, 0, 128, 256);
  /* Pale cerulean slipstream lane */
  const grad = g.createLinearGradient(0, 0, 128, 0);
  grad.addColorStop(0.0, 'rgba(124, 162, 182, 0.0)');
  grad.addColorStop(0.22, 'rgba(238, 241, 232, 0.65)');
  grad.addColorStop(0.5, 'rgba(246, 232, 200, 0.85)');
  grad.addColorStop(0.78, 'rgba(238, 241, 232, 0.65)');
  grad.addColorStop(1.0, 'rgba(124, 162, 182, 0.0)');
  g.fillStyle = grad;
  g.fillRect(0, 0, 128, 256);
  /* Carved woodblock foam chevrons streaming backward */
  g.strokeStyle = '#1f4b78';
  g.lineWidth = 3.5;
  for (let y = 18; y < 256; y += 42) {
    g.beginPath();
    g.moveTo(22, y + 18);
    g.quadraticCurveTo(64, y - 6, 106, y + 18);
    g.stroke();
    g.strokeStyle = '#f5f4ea';
    g.lineWidth = 5;
    g.beginPath();
    g.moveTo(26, y + 11);
    g.quadraticCurveTo(64, y - 12, 102, y + 11);
    g.stroke();
    g.strokeStyle = '#1f4b78';
    g.lineWidth = 3.5;
  }
  const tx = new THREE.CanvasTexture(cv);
  tx.colorSpace = THREE.SRGBColorSpace;
  tx.wrapS = THREE.ClampToEdgeWrapping;
  tx.wrapT = THREE.RepeatWrapping;
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
      uWorldXOff: { value: 0.0 },
      uSwellAmp: { value: 0.7 },
    },
    vertexShader: `
      uniform float uTime;
      uniform float uWorldZ;
      uniform float uWorldXOff;
      uniform float uSwellAmp;
      uniform float uSeed;
      varying vec2 vUv;
      varying float vWorldX;
      varying float vCrest;
      void main() {
        vUv = uv;
        vec3 p = position;
        float wx = p.x + uWorldXOff;
        float wz = uWorldZ;
        float ph1 = wz * 0.175 + wx * 0.055 - uTime * 0.88;
        float w1 = sin(ph1) + 0.18 * sin(ph1 * 2.0 - 0.45);
        float w2 = sin(wz * 0.25 - wx * 0.145 - uTime * 1.15) * 0.36;
        float w3 = cos(wz * 0.08 + wx * 0.075 - uTime * 0.52) * 0.28;
        float h = (w1 + w2 + w3) * uSwellAmp;
        /* Scalloped Hokusai crest silhouette along top edge of ribbon */
        float curl = sin(wx * 1.2 + uSeed * 6.28 + uTime * 0.85) * 0.14
                   + sin(wx * 2.9 - uSeed * 4.1 + uTime * 1.25) * 0.06;
        float topFactor = smoothstep(0.38, 1.0, uv.y);
        p.y += h + curl * topFactor * (0.45 + 0.45 * uSwellAmp);
        p.x += sin(ph1) * 0.24 * topFactor;
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
        float x = vWorldX;
        float claw = 0.030 * sin(x * 2.0 + uSeed * 11.0 + uTime * 0.55)
                   + 0.017 * sin(x * 5.2 - uSeed * 7.3)
                   + 0.010 * cos(x * 10.2 + uSeed * 3.1);
        float topEdge = 0.952 + claw * (0.48 + 0.44 * uSwellAmp);
        if (vUv.y > topEdge) discard;

        /* Crisp carved Prussian-blue key-block outline (Rijksmuseum: lijnblok in blauw) */
        float outline = 1.0 - smoothstep(0.0, 0.015, topEdge - vUv.y);

        /* Scalloped white foam cap (richer on tall crests, slimmer in distance) */
        float foamDepth = (0.040 + 0.068 * vCrest) * (0.55 + 0.45 * uSwellAmp)
                        + 0.018 * sin(x * 2.8 + uSeed * 5.0)
                        + 0.012 * cos(x * 6.8 - uSeed * 9.0);
        foamDepth *= mix(1.0, 0.45, uDepthBand);
        float inFoam = smoothstep(topEdge - foamDepth - 0.012, topEdge - foamDepth + 0.008, vUv.y);
        float foamLine = (1.0 - smoothstep(0.0, 0.012, abs(vUv.y - (topEdge - foamDepth)))) * 0.78;

        /* Authentic flat graded Prussian-blue woodblock stripe bands (sampled from Met JP1847) */
        float waveCoord = vUv.y * 6.6 + 0.42 * sin(x * 0.48 + uSeed * 8.0) + 0.14 * sin(x * 1.25 - uTime * 0.35);
        float stripe = fract(waveCoord);
        vec3 deepBlue = vec3(0.075, 0.200, 0.352);
        vec3 midBlue  = vec3(0.155, 0.342, 0.518);
        vec3 paleBlue = vec3(0.495, 0.655, 0.742);
        vec3 foamCol  = vec3(0.935, 0.945, 0.910);
        vec3 keyBlue  = vec3(0.060, 0.150, 0.280);

        vec3 body = deepBlue;
        body = mix(body, midBlue,  smoothstep(0.25, 0.30, stripe) * (1.0 - smoothstep(0.66, 0.71, stripe)));
        body = mix(body, paleBlue, smoothstep(0.68, 0.73, stripe) * (1.0 - smoothstep(0.84, 0.89, stripe)));
        /* Subtle bokashi distance gradation toward smoky horizon */
        vec3 mistBlue = mix(midBlue, vec3(0.56, 0.66, 0.72), 0.48);
        body = mix(body, mistBlue, clamp(uDepthBand * 0.54, 0.0, 0.54));
        float bandInk = 1.0 - smoothstep(0.0, 0.042, abs(stripe - 0.71));
        body = mix(body, keyBlue, bandInk * 0.42);

        vec3 col = mix(body, foamCol, inFoam);
        col = mix(col, keyBlue, clamp(outline + foamLine, 0.0, 1.0));

        /* Warm handmade washi paper fibre grain */
        float grain = (noise(vec2(x * 4.5, vUv.y * 36.0)) - 0.5) * 0.052;
        col = clamp(col + vec3(grain * 1.05, grain * 0.95, grain * 0.78), 0.0, 1.0);
        gl_FragColor = vec4(col, uFade);
      }
    `,
  });
}

/* ================= Seamless Panoramic Great Wave Horizon Shader (NO cutout edge; same woodblock bands!) ================= */
export function makeGreatWaveHorizonMaterial(shared) {
  return new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    side: THREE.FrontSide,
    uniforms: {
      uTime: shared.uTime,
      uFade: shared.uBayFade,
      uGrow: shared.uWaveGrow,
      uSpanW: { value: 112.0 },
      uSpanH: { value: 28.0 },
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
      uniform float uFade;
      uniform float uGrow;
      uniform float uSpanW;
      uniform float uSpanH;
      varying vec2 vUv;

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
        /* World-scaled coordinates on the panoramic wave wall (x in -56..+56, y in 0..28) */
        float x = (vUv.x - 0.5) * uSpanW;
        float y = vUv.y * uSpanH;
        float g = clamp(uGrow, 0.0, 1.0);

        /* Continuous ocean horizon line across the whole width — zero left/right cutoff */
        float baseH = 6.2
          + (0.55 + 0.45 * g) * sin(x * 0.16 + uTime * 1.15)
          + 0.28 * cos(x * 0.34 - uTime * 0.85);

        /* Right companion swell echoing p2a_far_wave on the far right */
        float rightSwell = (1.2 + 4.4 * g) * exp(-pow((x - 24.0) / 14.0, 2.0));

        /* Single continuous breaking-wave manifold (sheared hill): topologically IMPOSSIBLE to detach! */
        float crestX = mix(-13.5, -9.2, g);
        float waveH = 1.6 + 15.2 * pow(g, 0.90);
        float curlStrength = smoothstep(0.12, 0.62, g);

        /* Smooth rightward overhang shear as height rises toward the crest (creates the curling hollow!) */
        float hNorm = clamp((y - baseH) / max(1.5, waveH), 0.0, 1.3);
        float shear = (2.8 + 8.6 * g) * pow(smoothstep(0.24, 0.98, hNorm), 1.55) * curlStrength;
        /* Gentle downward hook at the very tip of the breaking lip */
        float hookDrop = (1.6 + 2.6 * g) * smoothstep(0.76, 1.04, hNorm) * smoothstep(crestX + 1.0, crestX + 7.5, x - shear * 0.45) * curlStrength;
        float xWarp = x - shear;

        /* Continuous smooth wave hill across the full 112-unit width (zero left/right edge!) */
        float leftRise = smoothstep(-46.0, crestX, xWarp);
        float backCurve = pow(leftRise, 1.45);
        float rightWidth = mix(8.5, 11.2, g) * mix(1.0, 0.56, smoothstep(0.45, 0.98, hNorm) * curlStrength);
        float rightDrop = 1.0 - smoothstep(crestX, crestX + rightWidth, xWarp);
        float mainArch = waveH * backCurve * mix(1.0, rightDrop, step(crestX, xWarp));

        /* Subtle breathing heave of the monumental wave crest */
        float breathe = sin(uTime * 1.15 - xWarp * 0.08) * 0.36 * g * backCurve;
        float rawTop = baseH + rightSwell + mainArch + breathe - hookDrop;
        float shape = rawTop - y;

        /* Organic woodblock foam-claw scallops along the top & curling lip (never in open sky) */
        float nearTop = smoothstep(-2.4, 0.8, shape) * smoothstep(baseH + 0.3, baseH + 3.5, y);
        float lipZone = smoothstep(crestX - 4.0, crestX + 4.0, xWarp) * smoothstep(0.42, 0.92, hNorm) * curlStrength;
        float clawScallop = (0.34 * sin(x * 0.95 + y * 0.35 + uTime * 0.65)
                           + 0.22 * sin(x * 2.25 - y * 0.6 - 0.9)
                           + 0.14 * cos(x * 4.6 + y * 1.1)) * (0.35 + 0.65 * g + 0.85 * lipZone);
        shape += clawScallop * nearTop;

        if (shape < 0.0) discard;

        /* Crisp carved Prussian-blue outer key-block outline */
        float outline = 1.0 - smoothstep(0.0, 0.30, shape);

        /* Feathered Hokusai foam crest: crisp white cap along ridge, deep claw foam on curling overhang */
        float highMask = smoothstep(baseH + 1.0, baseH + 3.6 + 6.5 * g, y);
        float foamThick = 0.52 + 1.15 * highMask * g + 2.65 * lipZone
                        + 0.48 * sin(x * 1.55 + y * 0.95 + uTime * 0.45) * (highMask * g + lipZone);
        float inFoam = 1.0 - smoothstep(foamThick - 0.24, foamThick + 0.14, shape);
        float foamLine = (1.0 - smoothstep(0.0, 0.22, abs(shape - foamThick))) * 0.82;

        /* Curved Prussian-blue woodblock stripe bands flowing naturally along the sheared wave! */
        vec2 hollowC = vec2(crestX + 6.8 + 2.5 * g, baseH + waveH * 0.42);
        float hollowR = length(vec2((x - hollowC.x) / (4.5 + 4.5 * g), (y - hollowC.y) / max(2.0, waveH * 0.50)));
        float ang = atan(y - hollowC.y, x - hollowC.x);
        float radCoord = length(vec2((x - hollowC.x) * 0.58, y - hollowC.y)) * 0.52;
        float flatCoord = y * 0.56 + 0.65 * sin(x * 0.16 + 0.8);
        float archBlend = smoothstep(-28.0, crestX + 4.0, xWarp) * smoothstep(baseH - 0.8, baseH + 4.5, y) * g;
        float bandCoord = mix(flatCoord, radCoord + 0.26 * sin(ang * 3.0), archBlend);
        float stripe = fract(bandCoord);

        vec3 deepBlue = vec3(0.072, 0.195, 0.348);
        vec3 midBlue  = vec3(0.155, 0.342, 0.518);
        vec3 paleBlue = vec3(0.495, 0.655, 0.742);
        vec3 foamCol  = vec3(0.938, 0.946, 0.912);
        vec3 keyBlue  = vec3(0.058, 0.148, 0.275);

        vec3 body = deepBlue;
        body = mix(body, midBlue,  smoothstep(0.24, 0.29, stripe) * (1.0 - smoothstep(0.64, 0.69, stripe)));
        body = mix(body, paleBlue, smoothstep(0.67, 0.72, stripe) * (1.0 - smoothstep(0.84, 0.89, stripe)));
        float bellyDark = smoothstep(0.75, 1.25, hollowR) * (1.0 - smoothstep(1.25, 2.2, hollowR)) * archBlend;
        body = mix(body, deepBlue * 0.85, bellyDark * 0.55);

        /* Distance bokashi haze fades away as the wave draws close */
        vec3 mistBlue = mix(midBlue, vec3(0.58, 0.67, 0.72), 0.52);
        float distMist = mix(0.55, 0.10, g);
        body = mix(body, mistBlue, distMist);

        float bandInk = 1.0 - smoothstep(0.0, 0.045, abs(stripe - 0.70));
        body = mix(body, keyBlue, bandInk * 0.42);

        vec3 col = mix(body, foamCol, inFoam);
        col = mix(col, keyBlue, clamp(outline + foamLine, 0.0, 1.0));

        /* Warm washi paper grain */
        float grain = (noise(vec2(x * 1.4, y * 1.6)) - 0.5) * 0.048;
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
        vec3 paperTop  = vec3(0.961, 0.902, 0.761);
        vec3 cloudWarm = vec3(0.976, 0.937, 0.847);
        vec3 ochreWash = vec3(0.922, 0.843, 0.678);
        vec3 smokeLow  = vec3(0.545, 0.541, 0.510);
        vec3 seaMist   = vec3(0.675, 0.745, 0.765);

        /* Soft rising woodblock cumulus band matching Met JP1847 */
        float cShape = noise(vec2(vUv.x * 4.2 + uTime * 0.008, vUv.y * 3.1))
                     + 0.45 * noise(vec2(vUv.x * 9.0 - uTime * 0.012, vUv.y * 7.2));
        float cloudMask = smoothstep(0.68, 0.84, cShape) * smoothstep(0.32, 0.56, vUv.y) * (1.0 - smoothstep(0.84, 0.96, vUv.y));
        vec3 sky = mix(ochreWash, paperTop, smoothstep(0.38, 0.78, vUv.y));
        sky = mix(sky, cloudWarm, cloudMask * 0.78);

        /* Authentic bokashi smoky horizon band (thickens slightly as the Great Wave looms) */
        float hor = exp(-pow((vUv.y - 0.35) / (0.095 + 0.04 * uStorm), 2.0));
        sky = mix(sky, smokeLow, hor * (0.42 + 0.36 * uStorm));
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
        float u = mix(uBoxUV.x, uBoxUV.z, uv.x);
        float v = mix(uBoxUV.w, uBoxUV.y, uv.y);
        float x0 = (u - 0.5) * uPW;
        float y0 = (0.5 - v) * uPH;

        vec2 anim = vec2(0.0);
        float m = uMotion * uDepthScale;
        if (m > 0.001) {
          if (uAnimKind > 0.5 && uAnimKind < 1.5) {
            float topMask = smoothstep(0.68, 0.14, v);
            float clawMask = smoothstep(0.28, 0.52, u) * smoothstep(0.46, 0.16, v);
            anim.y = sin(uTime * 1.15 - u * 2.2) * 0.11 * topMask * m;
            anim.x = (sin(uTime * 1.15 + 0.6) * 0.07 * topMask
                    + sin(uTime * 2.3 + v * 12.0) * 0.045 * clawMask) * m;
          } else if (uAnimKind > 1.5 && uAnimKind < 2.5) {
            float crest = smoothstep(0.98, 0.56, v);
            anim.y = sin(uTime * 1.35 + 1.9 + u * 2.8) * 0.10 * crest * m;
            anim.x = cos(uTime * 1.35 + 1.1) * 0.055 * crest * m;
          } else if (uAnimKind > 2.5 && uAnimKind < 3.5) {
            float dy = sin(uTime * 1.45 + 0.8) * 0.055 * m;
            float ang = cos(uTime * 1.45 + 0.8) * 0.032 * m;
            float du = (u - 0.72) * uPW;
            anim.y = dy + du * ang;
            anim.x = sin(uTime * 0.9) * 0.025 * m;
          } else if (uAnimKind > 3.5 && uAnimKind < 4.5) {
            float dy = sin(uTime * 1.5 + 2.2) * 0.045 * m;
            float ang = cos(uTime * 1.5 + 2.2) * 0.024 * m;
            float du = (u - 0.60) * uPW;
            anim.y = dy + du * ang;
          } else if (uAnimKind > 4.5) {
            anim.y = sin(uTime * 1.25 + u * 3.1 + uPlateZ) * 0.07 * m;
            anim.x = cos(uTime * 1.05 + uPlateZ) * 0.035 * m;
          }
        }

        float zEff = uPlateZ * uDepthScale;
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

  const mOchre     = woodMat(0xe2b48e);
  const mOchreDark = woodMat(0xc49068);
  const mInk       = woodMat(0x132f52);
  const mBlue      = woodMat(0x1f4b78);
  const mSkin      = woodMat(0xf0d6bc);
  const mBand      = woodMat(0xf4f3eb);
  const mStraw     = woodMat(0xd9c596);
  const mTrimPale  = woodMat(0x7ca2b6);

  /* Sleek upturned oshiokuri-bune hull built from flat-shaded woodblock profile sections */
  const hullPts = [
    [0.00, 0.50, -2.10], [0.20, 0.25, -1.45], [0.38, 0.12, -0.60],
    [0.42, 0.10,  0.30], [0.34, 0.14,  1.12], [0.20, 0.24,  1.68]
  ];
  const makePlankShell = (scale, mat, yOff = 0) => {
    const pos = [];
    const idx = [];
    const n = hullPts.length;
    for (let i = 0; i < n; i++) {
      const [w, y, z] = hullPts[i];
      const sw = w * scale;
      const sy = y + yOff;
      pos.push(-sw, sy + 0.14, z);
      pos.push(0, sy - 0.16 * scale, z);
      pos.push(sw, sy + 0.14, z);
    }
    for (let i = 0; i < n - 1; i++) {
      const a = i * 3, b = (i + 1) * 3;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
      idx.push(a + 1, a + 2, b + 1, b + 1, a + 2, b + 2);
      idx.push(a, b, a + 2, b, b + 2, a + 2);
    }
    const last = (n - 1) * 3;
    idx.push(last, last + 1, last + 2);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx);
    const m = new THREE.Mesh(geo, mat);
    m.material.side = THREE.DoubleSide;
    return m;
  };

  hullGroup.add(makePlankShell(1.11, mInk, -0.025));
  hullGroup.add(makePlankShell(1.00, mOchre, 0.0));

  /* Upturned dark curved prow & stern trim */
  const prow = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.42, 0.46), mInk);
  prow.position.set(0, 0.56, -2.08);
  prow.rotation.x = -0.56;
  const prowTip = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.12), mOchreDark);
  prowTip.position.set(0, 0.66, -2.22);
  prowTip.rotation.x = -0.35;
  hullGroup.add(prow, prowTip);

  const sternBoard = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.24, 0.07), mOchreDark);
  sternBoard.position.set(0, 0.27, 1.66);
  const sternTrim = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.06, 0.09), mInk);
  sternTrim.position.set(0, 0.38, 1.66);
  hullGroup.add(sternBoard, sternTrim);

  for (let i = 0; i < 4; i++) {
    const z = -0.95 + i * 0.62;
    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.66, 0.04, 0.14), mOchreDark);
    seat.position.set(0, 0.25, z);
    hullGroup.add(seat);
  }
  const matBox = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.06, 0.72), mStraw);
  matBox.position.set(0, 0.28, -1.20);
  hullGroup.add(matBox);

  /* Crouched Edo crewmen in Prussian-blue coats leaning together as the boat carves */
  const crewGroup = new THREE.Group();
  hullGroup.add(crewGroup);
  const crewZ = [-0.42, 0.02, 0.46, 0.90];
  crewZ.forEach((z, ci) => {
    for (const side of [-1, 1]) {
      const man = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.20, 0.23, 0.22), mBlue);
      body.position.y = 0.11;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.082, 8, 6), mSkin);
      head.position.set(0, 0.28, -0.04);
      const band = new THREE.Mesh(new THREE.TorusGeometry(0.072, 0.017, 5, 10), mBand);
      band.position.set(0, 0.30, -0.04);
      band.rotation.x = Math.PI * 0.48;
      man.add(body, head, band);
      man.position.set(side * 0.16, 0.24, z + (ci % 2) * 0.04);
      crewGroup.add(man);
    }
  });

  /* 6 wooden sculling oars (feather upward gracefully during crest float!) */
  const oars = [];
  for (let i = 0; i < 3; i++) {
    const z = -0.35 + i * 0.55;
    for (const side of [-1, 1]) {
      const piv = new THREE.Group();
      piv.position.set(side * 0.36, 0.26, z);
      const shaft = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.045, 0.07), mOchreDark);
      shaft.position.set(side * 0.50, -0.08, 0);
      const blade = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.03, 0.13), mInk);
      blade.position.set(side * 0.96, -0.14, 0);
      piv.add(shaft, blade);
      hullGroup.add(piv);
      oars.push({ piv, side, phase: i * 0.45 });
    }
  }

  /* Tapered woodblock foam V-wake trailing behind the stern (feathered spray, zero sharp rectangles!) */
  const wcv = document.createElement('canvas');
  wcv.width = 128; wcv.height = 192;
  const wg = wcv.getContext('2d');
  wg.clearRect(0, 0, 128, 192);
  /* Two curved woodblock foam arcs tapering cleanly to transparent tail */
  for (const side of [-1, 1]) {
    const gr = wg.createLinearGradient(64, 10, 64 + side * 46, 185);
    gr.addColorStop(0.0, 'rgba(244, 245, 237, 0.85)');
    gr.addColorStop(0.55, 'rgba(238, 241, 232, 0.52)');
    gr.addColorStop(1.0, 'rgba(238, 241, 232, 0.0)');
    wg.strokeStyle = gr;
    wg.lineWidth = 14;
    wg.lineCap = 'round';
    wg.beginPath();
    wg.moveTo(64 + side * 12, 16);
    wg.quadraticCurveTo(64 + side * 34, 92, 64 + side * 52, 178);
    wg.stroke();
    wg.strokeStyle = 'rgba(24, 58, 98, 0.42)';
    wg.lineWidth = 2.5;
    wg.beginPath();
    wg.moveTo(64 + side * 16, 18);
    wg.quadraticCurveTo(64 + side * 40, 96, 64 + side * 56, 168);
    wg.stroke();
  }
  const boatWakeTex = new THREE.CanvasTexture(wcv);
  boatWakeTex.colorSpace = THREE.SRGBColorSpace;
  const wakeMat = new THREE.MeshBasicMaterial({
    map: boatWakeTex, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false,
  });
  const wakeMesh = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.6), wakeMat);
  wakeMesh.rotation.x = -Math.PI / 2;
  wakeMesh.position.set(0, 0.04, 2.75);
  root.add(wakeMesh);

  return {
    root,
    hullGroup,
    crewGroup,
    oars,
    wakeMat,
    setMotion(oarCycle, steerAmt, floatAmt, speedNorm) {
      /* Crew leans smoothly into every carve and tucks slightly when floating over a crest */
      crewGroup.rotation.z = -steerAmt * 0.22;
      crewGroup.scale.y = 1.0 - 0.18 * floatAmt;
      for (const o of oars) {
        const s = Math.sin(oarCycle + o.phase);
        const c = Math.cos(oarCycle + o.phase);
        o.piv.rotation.y = o.side * s * 0.34 * (1.0 - 0.65 * floatAmt);
        o.piv.rotation.z = -o.side * (0.14 + 0.18 * Math.max(0, c) + 0.28 * floatAmt);
      }
      wakeMat.opacity = 0.28 + 0.65 * Math.min(1, speedNorm) * (1.0 - 0.55 * floatAmt);
    },
  };
}

/* ================= Procedural Sea, Spray-Chime & Slipstream Audio (zero external assets) ================= */
const YO_SCALE = [587.33, 659.25, 783.99, 880.0, 987.77, 1174.66]; /* D5 E5 G5 A5 B5 D6 */

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
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.036 * w) / 1.036;
      d[i] = last * 2.6;
    }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    surfFilter = ctx.createBiquadFilter();
    surfFilter.type = 'lowpass';
    surfFilter.frequency.value = 360;
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
      if (surfGain && ctx) surfGain.gain.setTargetAtTime(m ? 0 : 0.045, ctx.currentTime, 0.15);
    },
    updateSurf(swellLevel, speedNorm, drafting) {
      if (!ctx || !surfGain || muted) return;
      const g = 0.025 + 0.052 * swellLevel + 0.030 * speedNorm + (drafting ? 0.022 : 0);
      surfGain.gain.setTargetAtTime(g, ctx.currentTime, 0.16);
      const cut = 260 + 480 * swellLevel + 260 * speedNorm + (drafting ? 220 : 0);
      surfFilter.frequency.setTargetAtTime(cut, ctx.currentTime, 0.16);
    },
    crestWhoosh() {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const now = c.currentTime;
      const buf = c.createBuffer(1, Math.floor(c.sampleRate * 0.35), c.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const env = Math.sin((i / d.length) * Math.PI);
        d[i] = (Math.random() * 2 - 1) * env * 0.45;
      }
      const src = c.createBufferSource();
      src.buffer = buf;
      const flt = c.createBiquadFilter();
      flt.type = 'bandpass';
      flt.frequency.setValueAtTime(950, now);
      flt.frequency.exponentialRampToValueAtTime(420, now + 0.34);
      const g = c.createGain();
      g.gain.setValueAtTime(0.055, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      src.connect(flt).connect(g).connect(c.destination);
      src.start(now);
    },
    sprayRing(stepIdx = 0) {
      if (muted) return;
      const c = ensure();
      if (!c) return;
      const freq = YO_SCALE[stepIdx % YO_SCALE.length];
      const now = c.currentTime;
      [1, 2.0].forEach((mul, idx) => {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = idx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq * mul, now + idx * 0.03);
        g.gain.setValueAtTime(0.052 / (idx + 1), now + idx * 0.03);
        g.gain.exponentialRampToValueAtTime(0.0007, now + 0.85);
        osc.connect(g).connect(c.destination);
        osc.start(now + idx * 0.03);
        osc.stop(now + 0.90);
      });
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
        g.gain.exponentialRampToValueAtTime(0.0008, now + 1.5);
        osc.connect(g).connect(c.destination);
        osc.start(now + idx * 0.06);
        osc.stop(now + 1.55);
      });
    },
  };
}
