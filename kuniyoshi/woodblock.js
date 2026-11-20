/* Woodblock shaders, Edo woodblock-style character & pickup sprite generators, and procedural
   printmaker audio (cherrywood kento clack, baren paper rubbing, bonsho temple bell) for
   kuniyoshi/street.html. Zero external image or audio dependencies beyond kuniyoshi/layers/. */

export const PAPER_RGB = [0.898, 0.843, 0.741];
export const INK_RGB   = [0.088, 0.075, 0.065];

export const BLOCK_INFO = [
  {
    id: 'straw',
    index: 0,
    name: 'Straw & Ochre',
    jp: '黄土',
    swatch: '#c4ae73',
    hex: 0xc4ae73,
    u: 0.235,
    v: 0.825,
    jumpH: 0.0,
    cue: 'Block I — Straw & ochre: the torn blinds and the witch’s scroll',
    awake: 'The incantation scroll stirs in the dark.',
    regStart: [0.022, -0.017],
  },
  {
    id: 'blue',
    index: 1,
    name: 'Indigo & Blue',
    jp: '藍',
    swatch: '#4d768a',
    hex: 0x4d768a,
    u: 0.435,
    v: 0.855,
    jumpH: 0.0,
    cue: 'Block II — Indigo blue: Mitsukuni’s hakama and the cloth edging',
    awake: 'A cold draft shakes the torn bamboo blinds.',
    regStart: [-0.024, 0.016],
  },
  {
    id: 'red',
    index: 2,
    name: 'Vermilion Red',
    jp: '朱',
    swatch: '#cf542a',
    hex: 0xcf542a,
    u: 0.585,
    v: 0.815,
    jumpH: 0.36,
    cue: 'Block III — Vermilion red: Takiyasha’s robes, the scabbard and the name slips',
    awake: 'Something behind the blinds turns to watch you.',
    regStart: [0.025, 0.019],
  },
  {
    id: 'grey',
    index: 3,
    name: 'Smoke Grey',
    jp: '薄墨',
    swatch: '#9c927d',
    hex: 0x9c927d,
    u: 0.755,
    v: 0.845,
    jumpH: 0.0,
    cue: 'Block IV — Smoke grey: the skull’s hollows, the ribs and the worn planks',
    awake: 'The great skeleton leans forward through the blind.',
    regStart: [-0.021, -0.020],
  },
  {
    id: 'night',
    index: 4,
    name: 'Night Black',
    jp: '墨',
    swatch: '#2d2825',
    hex: 0x2d2825,
    u: 0.895,
    v: 0.835,
    jumpH: 0.28,
    cue: 'Block V — Night black: the midnight void behind the palace',
    awake: 'Every block is printed in register.',
    regStart: [0.023, -0.018],
  },
];

/* ================= Perspective-locked woodblock plate shader ================= */
export function makePlateMaterial(THREE, opts) {
  const {
    tColor, tMask1, tMask2,
    uBounds,            /* vec4(u0, v0, u1, v1) */
    zBase,              /* base z depth for this plate */
    isFloor = false,
    isOpaque = false,
    motionMode = 0,     /* 0:none, 1:takiyasha+scroll, 2:warriors, 3:blindLeft, 4:blindRight, 5:skelBody, 6:skull */
    camD = 5.4,
    pw = 8.0,
    ph = 3.9765625,
    sharedUniforms,
  } = opts;

  const uniforms = {
    tColor:      { value: tColor },
    tMask1:      { value: tMask1 },
    tMask2:      { value: tMask2 },
    uBounds:     { value: new THREE.Vector4(...uBounds) },
    uZBase:      { value: zBase },
    uIsFloor:    { value: isFloor ? 1.0 : 0.0 },
    uOpaque:     { value: isOpaque ? 1.0 : 0.0 },
    uMotionMode: { value: motionMode },
    uCamD:       { value: camD },
    uPW:         { value: pw },
    uPH:         { value: ph },
    /* Shared state across all 8 plates so every block prints in unison */
    uTime:       sharedUniforms.uTime,
    uDepthScale: sharedUniforms.uDepthScale,
    uMotionAmp:  sharedUniforms.uMotionAmp,
    uBlocks:     sharedUniforms.uBlocks,       /* float[5] printed progress 0..1 */
    uSweep:      sharedUniforms.uSweep,        /* float[5] baren wave frontier -0.25..1.35 */
    uAlignIdx:   sharedUniforms.uAlignIdx,     /* -1 if none, else 0..4 */
    uRegOffset:  sharedUniforms.uRegOffset,    /* vec2 in global UV space */
    uSkullTrack: sharedUniforms.uSkullTrack,   /* vec2 target yaw/pitch */
    uScrollWake: sharedUniforms.uScrollWake,   /* 0..1 after Straw printed */
    uBlindWake:  sharedUniforms.uBlindWake,    /* 0..1 after Blue printed */
    uSkelWake:   sharedUniforms.uSkelWake,     /* 0..1 after Red/Grey printed */
  };

  const vertexShader = `
    uniform vec4 uBounds;
    uniform float uZBase, uIsFloor, uMotionMode, uCamD, uPW, uPH;
    uniform float uTime, uDepthScale, uMotionAmp, uScrollWake, uBlindWake, uSkelWake;
    uniform vec2 uSkullTrack;
    varying vec2 vLocalUv;
    varying vec2 vGlobalUv;

    void main() {
      /* PlaneGeometry uv has y=1 at top, y=0 at bottom; image v has 0 at top, 1 at bottom */
      vLocalUv = uv;
      float gu = mix(uBounds.x, uBounds.z, uv.x);
      float gv = mix(uBounds.w, uBounds.y, uv.y);
      vGlobalUv = vec2(gu, gv);

      float x0 = (gu - 0.5) * uPW;
      float y0 = (0.5 - gv) * uPH;

      float zPlate = uZBase;
      if (uIsFloor > 0.5) {
        /* Continuous perspective floorboard slope: back wall at v=0.70, near lip at v=0.99 */
        float ft = smoothstep(0.70, 0.99, gv);
        zPlate = mix(-0.18, 0.56, ft);
      }

      /* Live woodblock animation (scales smoothly to 0 when flattening into the final print) */
      float mAmp = uMotionAmp * uDepthScale;
      vec3 anim = vec3(0.0);

      if (uMotionMode > 0.5 && uMotionMode < 1.5) {
        /* Princess Takiyasha: gentle breathing + incantation scroll fluttering */
        float breath = sin(uTime * 1.45) * 0.008 * mAmp * (0.35 + 0.65 * uScrollWake);
        anim.y += breath * smoothstep(0.74, 0.26, gv);
        float scrollMask = smoothstep(0.04, 0.08, gu) * smoothstep(0.175, 0.135, gu)
                         * smoothstep(0.31, 0.35, gv) * smoothstep(0.50, 0.45, gv);
        float wave = sin(uTime * 3.4 - gu * 46.0 + gv * 12.0) * 0.032 * uScrollWake * mAmp;
        anim.z += wave * scrollMask;
        anim.y += cos(uTime * 2.6 - gu * 30.0) * 0.012 * uScrollWake * mAmp * scrollMask;
      } else if (uMotionMode > 1.5 && uMotionMode < 2.5) {
        /* Mitsukuni & companion: taut breathing brace */
        float br = sin(uTime * 1.9 + gu * 5.0) * 0.006 * mAmp;
        anim.y += br * smoothstep(0.92, 0.54, gv);
      } else if (uMotionMode > 2.5 && uMotionMode < 3.5) {
        /* Left hanging torn bamboo blind: sways from ceiling anchor down to tattered tips */
        float hang = smoothstep(0.03, 0.78, gv);
        float sway = (0.25 + 0.95 * uBlindWake) * mAmp;
        float gust = sin(uTime * 1.35 + gv * 5.2) * 0.045 + sin(uTime * 2.9 + gu * 22.0 + gv * 8.0) * 0.018;
        anim.x += gust * hang * hang * sway;
        anim.z += cos(uTime * 1.55 + gv * 4.5) * 0.040 * hang * sway;
      } else if (uMotionMode > 3.5 && uMotionMode < 4.5) {
        /* Right lower torn blind: shudders along torn upper edge as skeleton looms behind */
        float edge = smoothstep(0.96, 0.74, gv);
        float sh = (0.20 + 0.90 * uBlindWake) * mAmp;
        anim.y += sin(uTime * 1.9 + gu * 18.0) * 0.018 * edge * sh;
        anim.z += cos(uTime * 1.4 + gu * 14.0) * 0.025 * edge * sh;
      } else if (uMotionMode > 4.5 && uMotionMode < 5.5) {
        /* Giant Skeleton body & ribcage: deep eerie breathing & leaning forward */
        float wake = 0.25 + 0.75 * uSkelWake;
        float br = sin(uTime * 0.85) * 0.028 * wake * mAmp;
        float ribExpand = smoothstep(0.50, 0.96, gu);
        anim.y += br * smoothstep(0.84, 0.12, gv);
        anim.z += (0.14 * uSkelWake + sin(uTime * 0.85 - 0.5) * 0.055 * wake) * mAmp * (0.4 + 0.6 * ribExpand);
        /* Reaching bony claw on left reaches slightly further forward as player nears */
        float claw = smoothstep(0.45, 0.34, gu) * smoothstep(0.58, 0.34, gv);
        anim.z += claw * (0.12 * uSkelWake + sin(uTime * 1.7) * 0.025) * mAmp;
      } else if (uMotionMode > 5.5) {
        /* Articulated Giant Skull: pivots around neck/atlas (gu=0.508, gv=0.305) to follow player! */
        vec2 piv = vec2((0.508 - 0.5) * uPW, (0.5 - 0.305) * uPH);
        vec2 rel = vec2(x0, y0) - piv;
        float wake = 0.20 + 0.80 * uSkelWake;
        float ang = (-uSkullTrack.x * 0.095 + sin(uTime * 0.85) * 0.018) * wake * mAmp;
        float c = cos(ang), s = sin(ang);
        vec2 rot = vec2(rel.x * c - rel.y * s, rel.x * s + rel.y * c);
        anim.xy += (rot - rel);
        /* Subtle 3D turn & forward loom towards the player */
        float yaw = uSkullTrack.x * 0.16 * wake * mAmp;
        anim.z += (-rel.x * sin(yaw) + 0.18 * uSkelWake * mAmp + sin(uTime * 0.85 - 0.4) * 0.05 * wake * mAmp);
        anim.y += (uSkullTrack.y * 0.045 + sin(uTime * 0.85) * 0.022) * wake * mAmp;
      }

      float zEff = zPlate * uDepthScale + anim.z;
      float sProj = (uCamD - zEff) / uCamD;
      vec3 pos = vec3((x0 + anim.x) * sProj, (y0 + anim.y) * sProj, zEff);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D tColor, tMask1, tMask2;
    uniform vec4 uBounds;
    uniform float uOpaque, uTime, uAlignIdx;
    uniform float uBlocks[5];
    uniform float uSweep[5];
    uniform vec2 uRegOffset;
    varying vec2 vLocalUv;
    varying vec2 vGlobalUv;

    float hash21(vec2 p) {
      p = fract(p * vec2(127.1, 311.7));
      p += dot(p, p + 34.53);
      return fract(p.x * p.y);
    }

    float vnoise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
        mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
        f.y
      );
    }

    /* Handmade kozo washi paper fibre grain */
    float washiGrain(vec2 guv) {
      vec2 p = guv * vec2(2048.0, 1018.0);
      float fine   = (hash21(floor(p * 0.85)) - 0.5) * 0.032;
      float fibreH = (vnoise(p * vec2(0.015, 0.24)) - 0.5) * 0.030;
      float fibreV = (vnoise(p * vec2(0.18, 0.022) + 17.3) - 0.5) * 0.022;
      float cloud  = (vnoise(p * 0.008 + 5.1) - 0.5) * 0.028;
      return fine + fibreH + fibreV + cloud;
    }

    /* Baren circular hand-rubbing wave mask across the triptych */
    float barenWave(float sweep, vec2 guv) {
      if (sweep <= -0.20) return 0.0;
      if (sweep >= 1.28) return 1.0;
      float swirl = (vnoise(guv * vec2(18.0, 9.0)) - 0.5) * 0.14
                  + sin(guv.y * 22.0 + guv.x * 11.0) * 0.025;
      float coord = guv.x * 0.86 + guv.y * 0.14 + swirl;
      return 1.0 - smoothstep(sweep - 0.16, sweep + 0.05, coord);
    }

    void main() {
      vec4 colS = texture2D(tColor, vLocalUv);
      float a = uOpaque > 0.5 ? 1.0 : colS.a;
      if (a < 0.02) discard;

      vec3 m1 = texture2D(tMask1, vLocalUv).rgb;   /* straw, blue, red */
      vec3 m2 = texture2D(tMask2, vLocalUv).rgb;   /* key, grey, night */

      float grain = washiGrain(vGlobalUv);
      vec3 paper = vec3(${PAPER_RGB[0]}, ${PAPER_RGB[1]}, ${PAPER_RGB[2]}) * (1.0 + grain);
      vec3 keyInk = vec3(${INK_RGB[0]}, ${INK_RGB[1]}, ${INK_RGB[2]}) * (1.0 + grain * 0.6);

      /* Pure key block (sumizuri-e) on bare washi paper (crisp carved sumi linework) */
      float keyLine = clamp(pow(max(m2.r, 0.0001), 0.85) * 1.12, 0.0, 1.0);
      vec3 keyCol = mix(paper, keyInk, keyLine);

      /* Printed colour blocks (each modulated by its baren rubbing wave) */
      float p0 = uBlocks[0] * barenWave(uSweep[0], vGlobalUv);
      float p1 = uBlocks[1] * barenWave(uSweep[1], vGlobalUv);
      float p2 = uBlocks[2] * barenWave(uSweep[2], vGlobalUv);
      float p3 = uBlocks[3] * barenWave(uSweep[3], vGlobalUv);
      float p4 = uBlocks[4] * barenWave(uSweep[4], vGlobalUv);

      float inkMix = clamp(m1.r * p0 + m1.g * p1 + m1.b * p2 + m2.g * p3 + m2.b * p4, 0.0, 1.0);

      /* Keep the authentic triptych black sheet gutters crisp once Night prints, and warm dark rule before */
      vec3 printed = mix(keyCol, colS.rgb * (1.0 + grain * 0.25), inkMix);

      /* LIVE OUT-OF-REGISTER COLOUR BLOCK PREVIEW during kento alignment! */
      if (uAlignIdx >= -0.5) {
        vec2 span = vec2(uBounds.z - uBounds.x, uBounds.w - uBounds.y);
        /* vLocalUv.y increases upward, global v increases downward */
        vec2 shiftLocal = vLocalUv + vec2(-uRegOffset.x / span.x, uRegOffset.y / span.y);
        float inBox = step(0.002, shiftLocal.x) * step(shiftLocal.x, 0.998)
                    * step(0.002, shiftLocal.y) * step(shiftLocal.y, 0.998);
        if (inBox > 0.5) {
          vec4 shCol = texture2D(tColor, shiftLocal);
          float shA = uOpaque > 0.5 ? 1.0 : shCol.a;
          vec3 sm1 = texture2D(tMask1, shiftLocal).rgb;
          vec3 sm2 = texture2D(tMask2, shiftLocal).rgb;
          float sw = 0.0;
          if (uAlignIdx < 0.5) sw = sm1.r;
          else if (uAlignIdx < 1.5) sw = sm1.g;
          else if (uAlignIdx < 2.5) sw = sm1.b;
          else if (uAlignIdx < 3.5) sw = sm2.g;
          else sw = sm2.b;
          float previewAmt = clamp(sw * shA * 0.82, 0.0, 0.85);
          /* Subtractive-style translucent proof overlay so black key lines remain readable underneath */
          vec3 proofCol = mix(printed, shCol.rgb, previewAmt);
          /* Keep black key-block lines crisp over the floating wet proof */
          proofCol = mix(proofCol, keyInk, m2.r * 0.62 * previewAmt);
          printed = proofCol;
        }
      }

      gl_FragColor = vec4(printed, a);
    }
  `;

  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: !isOpaque,
    depthWrite: isOpaque,
    depthTest: true,
    side: THREE.FrontSide,
  });
}

/* ================= Edo Woodblock-Style Player Character Sprite Sheet =================
   Drawn in flat Kuniyoshi woodblock colour & crisp sumi key-block linework.
   Uses 2 canvases (Key Block ink + Colour/Block-ID map) so the player herself starts as
   black line on bare washi paper and gains Straw, Blue, Red, Grey, and Night Black ink
   in lockstep with the whole triptych! */
export function makeWoodblockPlayer(THREE, sharedUniforms) {
  const FW = 256, FH = 320, FRAMES = 6; /* 0..3 walk cycle, 4 idle, 5 leap */
  const cCol = document.createElement('canvas'); cCol.width = FW * FRAMES; cCol.height = FH;
  const cM1  = document.createElement('canvas'); cM1.width  = FW * FRAMES; cM1.height = FH;
  const cM2  = document.createElement('canvas'); cM2.width  = FW * FRAMES; cM2.height = FH;
  const gCol = cCol.getContext('2d'), gM1 = cM1.getContext('2d'), gM2 = cM2.getContext('2d');

  /* Palette sampled directly from Kuniyoshi's takiyasha.jpg */
  const COL = {
    paper:  '#e4d6bc',
    skin:   '#eadcc4',
    straw:  '#cdb477',
    blue:   '#4b758c',
    blueDk: '#315469',
    red:    '#d45429',
    redDk:  '#a83c1c',
    grey:   '#9f9682',
    night:  '#24201e',
    ink:    '#181412',
  };
  /* Mask colours: M1 = (R=straw, G=blue, B=red), M2 = (R=key, G=grey, B=night) */
  const M1 = { straw: '#ff0000', blue: '#00ff00', red: '#0000ff', none: '#000000' };
  const M2 = { key: '#ff0000', grey: '#00ff00', night: '#0000ff', none: '#000000' };

  function drawFrame(idx) {
    const ox = idx * FW;
    const isWalk = idx < 4;
    const isLeap = idx === 5;
    const ph = isWalk ? (idx / 4) * Math.PI * 2 : 0;
    const step = isWalk ? Math.sin(ph) : (isLeap ? 0.9 : 0);
    const bob  = isWalk ? Math.abs(Math.cos(ph)) * -6 : (isLeap ? -14 : 0);
    const sway = isWalk ? Math.cos(ph) * 5 : (isLeap ? 10 : 0);

    function paintShape(drawFn, colFill, m1Fill, m2Fill, strokeW = 4.2) {
      /* 1. Colour + alpha */
      gCol.save(); gCol.translate(ox, 0);
      drawFn(gCol);
      if (colFill) { gCol.fillStyle = colFill; gCol.fill(); }
      if (strokeW > 0) { gCol.strokeStyle = COL.ink; gCol.lineWidth = strokeW; gCol.lineJoin = 'round'; gCol.lineCap = 'round'; gCol.stroke(); }
      gCol.restore();

      /* 2. Mask 1 (straw/blue/red) */
      gM1.save(); gM1.translate(ox, 0);
      drawFn(gM1);
      gM1.fillStyle = m1Fill || M1.none; gM1.fill();
      if (strokeW > 0) { gM1.strokeStyle = '#000000'; gM1.lineWidth = strokeW; gM1.lineJoin = 'round'; gM1.lineCap = 'round'; gM1.stroke(); }
      gM1.restore();

      /* 3. Mask 2 (key/grey/night) */
      gM2.save(); gM2.translate(ox, 0);
      drawFn(gM2);
      gM2.fillStyle = m2Fill || M2.none; gM2.fill();
      if (strokeW > 0) { gM2.strokeStyle = M2.key; gM2.lineWidth = strokeW + 0.6; gM2.lineJoin = 'round'; gM2.lineCap = 'round'; gM2.stroke(); }
      gM2.restore();
    }

    const cx = 128, by = 286 + bob;

    /* Back hair flow (Night Black block) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 18, by - 196);
      g.quadraticCurveTo(cx - 48 - sway * 0.7, by - 154, cx - 42 - sway, by - 110);
      g.quadraticCurveTo(cx - 22, by - 118, cx - 8, by - 150);
      g.closePath();
    }, COL.night, M1.none, M2.night, 4.0);

    /* Back foot & straw zori sandal (Straw block) */
    const bxFoot = cx - 18 - step * 18, byFoot = 294 + (isLeap ? -16 : Math.max(0, step) * -8);
    paintShape(g => {
      g.beginPath(); g.ellipse(bxFoot, byFoot, 18, 7, -0.05, 0, Math.PI * 2);
    }, COL.straw, M1.straw, M2.none, 3.4);

    /* Back flowing kimono sleeve (Indigo Blue block) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 10, by - 154);
      g.quadraticCurveTo(cx - 56 - sway, by - 134, cx - 50 - sway * 1.1, by - 88);
      g.lineTo(cx - 16 - sway * 0.4, by - 94);
      g.closePath();
    }, COL.blueDk, M1.blue, M2.none, 4.2);

    /* Under-kimono hem / juban (Vermilion Red block — echoes Takiyasha!) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 28, by - 40);
      g.lineTo(cx + 30 + step * 8, by - 40);
      g.lineTo(cx + 38 + step * 11, by - 4);
      g.quadraticCurveTo(cx, by + 6, cx - 38 - step * 6, by - 6);
      g.closePath();
    }, COL.red, M1.red, M2.none, 4.0);

    /* Main kimono skirt & bodice (Indigo Blue block + paper highlights) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 22, by - 164);
      g.lineTo(cx + 22, by - 164);
      g.quadraticCurveTo(cx + 36, by - 96, cx + 44 + step * 9, by - 16);
      g.quadraticCurveTo(cx + 4, by - 6, cx - 34 - step * 8, by - 18);
      g.quadraticCurveTo(cx - 28, by - 96, cx - 22, by - 164);
      g.closePath();
    }, COL.blue, M1.blue, M2.none, 4.5);

    /* Traditional cream woodblock collar (Bare paper / grey shading) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 14, by - 168);
      g.lineTo(cx + 6, by - 134);
      g.lineTo(cx + 20, by - 164);
      g.lineTo(cx + 12, by - 170);
      g.lineTo(cx + 4, by - 146);
      g.lineTo(cx - 6, by - 170);
      g.closePath();
    }, COL.paper, M1.none, M2.grey, 3.5);

    /* Woodblock kimono wave/stripe lines (Key block only) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 12, by - 110); g.quadraticCurveTo(cx - 6, by - 62, cx - 14 - step * 4, by - 18);
      g.moveTo(cx + 14, by - 108); g.quadraticCurveTo(cx + 22, by - 62, cx + 22 + step * 5, by - 16);
    }, null, M1.none, M2.none, 2.8);

    /* Broad Vermilion Red Obi sash + back bow */
    paintShape(g => {
      g.beginPath();
      g.roundRect(cx - 28, by - 122, 56, 30, 5);
    }, COL.red, M1.red, M2.none, 4.2);
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 26, by - 118);
      g.quadraticCurveTo(cx - 54, by - 124, cx - 48, by - 94);
      g.lineTo(cx - 24, by - 96);
      g.closePath();
    }, COL.redDk, M1.red, M2.none, 4.0);

    /* Straw obijime cord + little round bamboo baren pad carried at her hip! */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 28, by - 107); g.lineTo(cx + 28, by - 107);
    }, null, M1.straw, M2.none, 4.2);
    paintShape(g => {
      g.beginPath(); g.arc(cx - 12, by - 98, 12, 0, Math.PI * 2);
    }, COL.straw, M1.straw, M2.none, 3.2);

    /* Front foot & straw zori sandal (Straw block) */
    const fxFoot = cx + 16 + step * 18, fyFoot = 296 + (isLeap ? -20 : Math.max(0, -step) * -9);
    paintShape(g => {
      g.beginPath(); g.ellipse(fxFoot, fyFoot, 19, 7, 0.06, 0, Math.PI * 2);
    }, COL.straw, M1.straw, M2.none, 3.4);

    /* Front flowing kimono sleeve (Blue + grey fold shadow) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx + 4, by - 156);
      g.quadraticCurveTo(cx + 38, by - 138, cx + 34 + sway * 0.7, by - 96);
      g.quadraticCurveTo(cx + 8, by - 88, cx - 6 + sway * 0.4, by - 106);
      g.closePath();
    }, COL.blue, M1.blue, M2.none, 4.2);

    /* Extended hand holding a tiny brush/charm */
    paintShape(g => {
      g.beginPath(); g.arc(cx + 26 + sway * 0.5, by - 124, 7.5, 0, Math.PI * 2);
    }, COL.skin, M1.none, M2.grey, 3.2);

    /* Neck & Edo ukiyo-e face (3/4 profile facing right, warm ivory paper skin) */
    paintShape(g => {
      g.beginPath();
      g.ellipse(cx + 4, by - 196, 22, 27, 0.08, 0, Math.PI * 2);
    }, COL.skin, M1.none, M2.grey, 4.0);

    /* Classical ukiyo-e eyes, brow, nose & tiny red lip */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx + 6, by - 203); g.quadraticCurveTo(cx + 13, by - 206, cx + 19, by - 202);
      g.moveTo(cx + 7, by - 196); g.lineTo(cx + 17, by - 195);
      g.moveTo(cx + 17, by - 194); g.lineTo(cx + 20, by - 187); g.lineTo(cx + 16, by - 186);
    }, null, M1.none, M2.none, 2.5);
    paintShape(g => {
      g.beginPath(); g.ellipse(cx + 15, by - 179, 4, 2.2, 0, 0, Math.PI * 2);
    }, COL.red, M1.red, M2.none, 1.8);

    /* Edo topknot hair (shimada style, Night Black block) */
    paintShape(g => {
      g.beginPath();
      g.moveTo(cx - 18, by - 194);
      g.quadraticCurveTo(cx - 26, by - 224, cx + 2, by - 230);
      g.quadraticCurveTo(cx + 28, by - 224, cx + 24, by - 206);
      g.quadraticCurveTo(cx + 14, by - 216, cx - 2, by - 212);
      g.quadraticCurveTo(cx - 12, by - 202, cx - 10, by - 184);
      g.closePath();
    }, COL.night, M1.none, M2.night, 4.0);
    /* Hair bun */
    paintShape(g => {
      g.beginPath(); g.ellipse(cx - 16, by - 228, 16, 12, -0.35, 0, Math.PI * 2);
    }, COL.night, M1.none, M2.night, 3.8);
    /* Straw kanzashi hairpin + red blossom */
    paintShape(g => {
      g.beginPath(); g.moveTo(cx - 34, by - 238); g.lineTo(cx + 8, by - 216);
    }, null, M1.straw, M2.none, 4.2);
    paintShape(g => {
      g.beginPath(); g.arc(cx - 26, by - 234, 6.5, 0, Math.PI * 2);
    }, COL.red, M1.red, M2.none, 2.6);
  }

  for (let i = 0; i < FRAMES; i++) drawFrame(i);

  const mkTex = (cv, srgb) => {
    const t = new THREE.CanvasTexture(cv);
    t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
    t.minFilter = THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    return t;
  };
  const tCol = mkTex(cCol, true), tM1 = mkTex(cM1, false), tM2 = mkTex(cM2, false);

  const uniforms = {
    tCol: { value: tCol }, tM1: { value: tM1 }, tM2: { value: tM2 },
    uFrame: { value: 4.0 }, uFrames: { value: FRAMES }, uFlip: { value: 1.0 },
    uBlocks: sharedUniforms.uBlocks,
    uSweep: sharedUniforms.uSweep,
    uPlayerU: { value: 0.08 },
    uOpacity: { value: 1.0 },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tCol, tM1, tM2;
      uniform float uFrame, uFrames, uFlip, uPlayerU, uOpacity;
      uniform float uBlocks[5], uSweep[5];
      varying vec2 vUv;
      void main() {
        float lx = uFlip > 0.0 ? vUv.x : (1.0 - vUv.x);
        vec2 uv = vec2((floor(uFrame) + lx) / uFrames, vUv.y);
        vec4 c = texture2D(tCol, uv);
        if (c.a < 0.05) discard;
        vec3 m1 = texture2D(tM1, uv).rgb;
        vec3 m2 = texture2D(tM2, uv).rgb;
        vec3 paper = vec3(${PAPER_RGB[0]}, ${PAPER_RGB[1]}, ${PAPER_RGB[2]});
        vec3 ink   = vec3(${INK_RGB[0]}, ${INK_RGB[1]}, ${INK_RGB[2]});
        vec3 keyCol = mix(paper, ink, smoothstep(0.18, 0.72, m2.r));
        float p0 = uBlocks[0] * step(uPlayerU - 0.15, uSweep[0]);
        float p1 = uBlocks[1] * step(uPlayerU - 0.15, uSweep[1]);
        float p2 = uBlocks[2] * step(uPlayerU - 0.15, uSweep[2]);
        float p3 = uBlocks[3] * step(uPlayerU - 0.15, uSweep[3]);
        float p4 = uBlocks[4] * step(uPlayerU - 0.15, uSweep[4]);
        float inkMix = clamp(m1.r * p0 + m1.g * p1 + m1.b * p2 + m2.g * p3 + m2.b * p4, 0.0, 1.0);
        vec3 outCol = mix(keyCol, c.rgb, inkMix);
        /* Crisp key lines stay dark over flat colour */
        outCol = mix(outCol, ink, smoothstep(0.45, 0.85, m2.r) * 0.9);
        gl_FragColor = vec4(outCol, c.a * uOpacity);
      }
    `,
  });

  const group = new THREE.Group();
  const sprite = new THREE.Mesh(new THREE.PlaneGeometry(0.64, 0.80), mat);
  sprite.position.y = 0.39;
  group.add(sprite);

  /* Soft ink-wash ground shadow directly beneath her sandals */
  const shCv = document.createElement('canvas'); shCv.width = 128; shCv.height = 64;
  const sg = shCv.getContext('2d');
  const gr = sg.createRadialGradient(64, 32, 6, 64, 32, 56);
  gr.addColorStop(0, 'rgba(24,20,18,0.48)');
  gr.addColorStop(0.65, 'rgba(24,20,18,0.18)');
  gr.addColorStop(1, 'rgba(24,20,18,0)');
  sg.fillStyle = gr; sg.fillRect(0, 0, 128, 64);
  const shMat = new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(shCv), transparent: true, depthWrite: false });
  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(0.44, 0.14), shMat);
  shadow.rotation.x = -Math.PI * 0.42;
  shadow.position.y = 0.01;
  group.add(shadow);

  return { group, sprite, shadow, uniforms, shMat };
}

/* ================= Carved Cherrywood Colour Block Pickup (in woodblock style) ================= */
export function makeWoodblockPickup(THREE, info) {
  const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256;
  const g = cv.getContext('2d');

  /* Warm luminous paper aura behind the carved block so it reads clearly against both bare paper & colour */
  const aura = g.createRadialGradient(128, 128, 22, 128, 128, 118);
  aura.addColorStop(0, 'rgba(244,234,210,0.88)');
  aura.addColorStop(0.55, 'rgba(244,234,210,0.34)');
  aura.addColorStop(1, 'rgba(244,234,210,0)');
  g.fillStyle = aura; g.fillRect(0, 0, 256, 256);

  /* Carved cherrywood block slab in isometric woodcut drawing */
  g.save();
  g.translate(128, 134);
  g.rotate(-0.12);

  /* Wood edge thickness */
  g.fillStyle = '#9c7850';
  g.strokeStyle = '#1a1512';
  g.lineWidth = 5;
  g.lineJoin = 'round';
  g.beginPath();
  g.moveTo(-66, -42); g.lineTo(66, -42); g.lineTo(74, -26); g.lineTo(74, 52);
  g.lineTo(-58, 52); g.lineTo(-66, 36); g.closePath();
  g.fill(); g.stroke();

  /* Top carved face stained with this block's pigment! */
  g.fillStyle = '#dfc89e';
  g.beginPath();
  g.roundRect(-66, -54, 132, 92, 6);
  g.fill(); g.stroke();

  /* Fine cherrywood grain lines */
  g.strokeStyle = 'rgba(70,48,26,0.28)'; g.lineWidth = 2;
  for (let y = -44; y <= 28; y += 11) {
    g.beginPath(); g.moveTo(-58, y); g.bezierCurveTo(-18, y - 3, 22, y + 3, 58, y); g.stroke();
  }

  /* Raised inked relief swatch in the centre of the block */
  g.fillStyle = info.swatch;
  g.strokeStyle = '#1a1512';
  g.lineWidth = 4;
  g.beginPath();
  g.roundRect(-48, -38, 96, 60, 4);
  g.fill(); g.stroke();

  /* Traditional kento L-notch & bar carved on the lower edge of the woodblock! */
  g.strokeStyle = '#1a1512'; g.lineWidth = 4.5;
  g.beginPath();
  g.moveTo(42, 30); g.lineTo(58, 30); g.lineTo(58, 16);
  g.moveTo(-46, 30); g.lineTo(-26, 30);
  g.stroke();

  /* Kanji ink stamp in crisp paper/ivory inside the pigment */
  g.fillStyle = info.id === 'straw' ? '#1c1714' : '#f3ead6';
  g.font = 'bold 34px "Hiragino Mincho ProN", "Yu Mincho", Georgia, serif';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(info.jp, 0, -7);

  g.restore();

  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.52), mat);
  return { mesh, mat };
}

/* ================= Printmaker Procedural Web Audio (Zero Assets) ================= */
export function makePrintAudio() {
  let ac = null, muted = false;
  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) ac = new AC();
    }
    if (ac && ac.state === 'suspended') ac.resume();
    return ac;
  }

  /* Dry cherrywood clack (hyoshigi / kento registration snap) */
  function woodClack(pitch = 1.0) {
    if (muted) return;
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    for (const [freq, amp, dec] of [[780 * pitch, 0.22, 0.065], [1480 * pitch, 0.14, 0.042], [2360 * pitch, 0.07, 0.025]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 0.88, t + dec);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.003);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dec + 0.02);
    }
  }

  /* Circular bamboo-wrapped baren rubbing across damp washi paper */
  function barenRub(dur = 1.35) {
    if (muted) return;
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const len = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let lp = 0;
    for (let i = 0; i < len; i++) {
      const u = i / len;
      const env = Math.sin(u * Math.PI) * (0.65 + 0.35 * Math.sin(u * Math.PI * 6.0));
      lp = lp * 0.72 + (Math.random() * 2 - 1) * 0.28;
      d[i] = lp * env;
    }
    const src = ctx.createBufferSource(); src.buffer = buf;
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.frequency.setValueAtTime(1150, t);
    bp.frequency.linearRampToValueAtTime(1750, t + dur * 0.5);
    bp.frequency.linearRampToValueAtTime(980, t + dur);
    bp.Q.value = 1.1;
    const g = ctx.createGain(); g.gain.value = 0.24;
    src.connect(bp); bp.connect(g); g.connect(ctx.destination);
    src.start(t);
  }

  /* Deep bronze temple bell (bonsho) for the final print reveal */
  function templeBell() {
    if (muted) return;
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const base = 110.0;
    for (const [r, amp, dec] of [[1.0, 0.20, 4.8], [2.01, 0.11, 3.6], [2.98, 0.06, 2.5], [4.16, 0.03, 1.6]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(base * r, t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(amp, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dec);
      o.connect(g); g.connect(ctx.destination);
      o.start(t); o.stop(t + dec + 0.1);
    }
  }

  /* Soft wooden floorboard creak when stepping */
  function stepTap() {
    if (muted) return;
    const ctx = ensure(); if (!ctx) return;
    const t = ctx.currentTime;
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(155 + Math.random() * 35, t);
    o.frequency.exponentialRampToValueAtTime(72, t + 0.045);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.045, t + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05);
    o.connect(g); g.connect(ctx.destination);
    o.start(t); o.stop(t + 0.06);
  }

  return {
    ensure,
    woodClack,
    barenRub,
    templeBell,
    stepTap,
    setMuted(m) { muted = m; },
  };
}
