/* The painted frieze (bold manner, BRIEF4_bold.md): a single-pass post filter for phidias/street.html that redraws the entire three.js frame as a carved, painted Pentelic
   marble relief on a plain Egyptian blue ground — as bold and unmistakable in its visual language as alice/engrave.js is for wood engraving.
   Five rules enforced on every pixel:
     1. Plain ground: everything beyond the carved forms is one flat field of Egyptian blue (#1f4d8f), dressed with fine claw-chisel grain and a deep carved undercut shadow
        under the skyline. No clouds, no horizon gradient, no haze, no distance fading.
     2. Stone raised in relief: every world surface (alpha = 1) is pale Pentelic marble modelled strictly by one fixed upper-left raking light into crisp sculptural planes,
        with a bright chiselled marble arris on lit edges, firm dark contour/crease lines (inverse-depth k2, no distance fade), and a dark undercut shadow under raised edges.
     3. Flat mineral paint on stone: chromatic world surfaces snap strictly to the period mineral palette (Egyptian blue, madder/terracotta red, ochre/gold, Tyrian purple,
        Attic silver-olive, dark cypress, bronze), laid flat in two relief steps with bare pale marble showing through at edges, creases, and fold ridges.
     4. Living vs carved stone (REL.setLiving): like Alice in colour against Tenniel's line, the girl and the living procession carry alpha 0.5 and render in warm full-round
        colour with clean contours against the carved relief world.
     5. Three-step stagings: Step 1 = living (alpha 0.5, uRelief = 0); Step 2 = pressed into flat painted relief on blue (alpha 1.0, uRelief = 1, upper/lower frieze moulding);
        Step 3 = paint drains left-to-right into bare weathered Pentelic marble (uBare = 1) before the museum photograph. */
export function makeRelief(THREE, o = {}) {
  const uniforms = {
    tScene: { value: o.scene || null },
    tDepth: { value: o.depth || null },
    uPx: { value: new THREE.Vector2(1 / 1100, 1 / 700) },
    uTime: { value: 0 },
    uInvProj: { value: new THREE.Matrix4() },
    uInvView: { value: new THREE.Matrix4() },
    uPxAngle: { value: 0.0014 },
    uRelief: { value: 0 },
    uBare: { value: 0 }
  };

  const material = new THREE.ShaderMaterial({
    uniforms,
    depthTest: false,
    depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
    uniform sampler2D tScene, tDepth;
    uniform vec2 uPx;
    uniform float uTime, uPxAngle, uRelief, uBare;
    uniform mat4 uInvProj, uInvView;
    varying vec2 vUv;

    float hash(vec2 p){
      p = fract(p * vec2(123.34, 456.21));
      p += dot(p, p + 45.32);
      return fract(p.x * p.y);
    }
    float noise(vec2 p){
      vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
    }
    vec3 toSrgb(vec3 c){ return pow(max(c, vec3(0.0)), vec3(1.0 / 2.2)); }

    /* Snap chromatic world surfaces strictly to the period mineral palette (FINDINGS.md + Attic olive/cypress).
       Olive/cypress green is only matched when green genuinely dominates, so warm marble, poros, and skin can never bleed green. */
    vec3 snapPalette(vec3 c, float lum){
      vec3 P0 = vec3(0.118, 0.302, 0.568); /* Egyptian blue */
      vec3 P1 = vec3(0.720, 0.235, 0.165); /* Madder / terracotta red */
      vec3 P2 = vec3(0.840, 0.625, 0.215); /* Ochre / saffron / gold */
      vec3 P3 = vec3(0.430, 0.168, 0.335); /* Tyrian purple */
      vec3 P4 = vec3(0.475, 0.570, 0.405); /* Silver-green Attic olive */
      vec3 P5 = vec3(0.180, 0.305, 0.228); /* Dark Attic cypress */
      vec3 P6 = vec3(0.575, 0.395, 0.225); /* Chestnut / bronze / carved timber */
      if (c.g > c.r * 1.005 && c.g > c.b * 1.04) return (lum < 0.34 ? P5 : P4);
      float l = max(lum, 1e-3);
      vec3 n = c / l;
      vec3 best = P2; float bd = 1e9;
      float d0 = distance(n, P0 / dot(P0, vec3(0.299, 0.587, 0.114))); if (d0 < bd) { bd = d0; best = P0; }
      float d1 = distance(n, P1 / dot(P1, vec3(0.299, 0.587, 0.114))); if (d1 < bd) { bd = d1; best = P1; }
      float d2 = distance(n, P2 / dot(P2, vec3(0.299, 0.587, 0.114))); if (d2 < bd) { bd = d2; best = P2; }
      float d3 = distance(n, P3 / dot(P3, vec3(0.299, 0.587, 0.114))); if (d3 < bd) { bd = d3; best = P3; }
      float d6 = distance(n, P6 / dot(P6, vec3(0.299, 0.587, 0.114))) + 0.05; if (d6 < bd) { bd = d6; best = P6; }
      return best;
    }

    float linZ(float d, float p22, float p23, float p32, float p33){
      float ndc = d * 2.0 - 1.0;
      return max(-(p22 * ndc + p23) / (p32 * ndc + p33), 0.1);
    }

    void main(){
      vec2 res = 1.0 / uPx;
      float p22 = uInvProj[2][2], p23 = uInvProj[2][3], p32 = uInvProj[3][2], p33 = uInvProj[3][3];
      float dc = texture2D(tDepth, vUv).x;
      float far = smoothstep(0.99975, 0.99996, dc);
      float dist = linZ(dc, p22, p23, p32, p33);

      /* Cardinal depth neighbours for inverse-depth k2 contours, creases, and artifact-free relief normal */
      vec2 e1 = uPx * 1.15;
      float dL = linZ(texture2D(tDepth, vUv - vec2(e1.x, 0.0)).x, p22, p23, p32, p33);
      float dR = linZ(texture2D(tDepth, vUv + vec2(e1.x, 0.0)).x, p22, p23, p32, p33);
      float dD = linZ(texture2D(tDepth, vUv - vec2(0.0, e1.y)).x, p22, p23, p32, p33);
      float dU = linZ(texture2D(tDepth, vUv + vec2(0.0, e1.y)).x, p22, p23, p32, p33);

      float wc = 1.0 / dist, wl = 1.0 / dL, wr = 1.0 / dR, wd = 1.0 / dD, wu = 1.0 / dU;
      float k2 = (abs(wl + wr - 2.0 * wc) + abs(wd + wu - 2.0 * wc)) / wc / (uPxAngle * 1.15);

      /* Fixed upper-left raking light in screen space for carved undercut shadows and lit marble arrises */
      vec2 rakeDir = normalize(vec2(-0.74, 0.67));
      vec2 e2 = uPx * 2.35;
      float dLit = linZ(texture2D(tDepth, vUv + rakeDir * e2).x, p22, p23, p32, p33);
      float dShad = linZ(texture2D(tDepth, vUv - rakeDir * e2).x, p22, p23, p32, p33);

      /* Firm chiselled contour and crease lines at ALL distances (no distance fade!) */
      float silhouette = smoothstep(2.3, 5.0, k2);
      float crease = smoothstep(1.05, 2.5, k2) * (1.0 - far);

      /* Carved undercut shadow: background pixel immediately down-right of any raised foreground edge */
      float underRake = smoothstep(0.025, 0.14, (dist - dLit) / dist);
      float underNear = smoothstep(0.032, 0.15, (dist - min(min(dL, dR), min(dD, dU))) / dist);
      float undercut = clamp(underRake * 0.90 + underNear * 0.45, 0.0, 1.0);

      /* Bright chiselled marble arris on the lit upper-left edge of raised foreground forms */
      float fgRake = smoothstep(0.028, 0.15, (dLit - dist) / dist);
      float fgJump = smoothstep(0.035, 0.18, max(max((dL - dist) / dist, (dR - dist) / dist), max((dD - dist) / dist, (dU - dist) / dist)));
      float marbleArrisEdge = clamp(fgRake * 0.85 + fgJump * 0.35, 0.0, 1.0) * (1.0 - far);

      /* Artifact-free view-space normal using the nearer depth neighbour on each axis (never smears across silhouettes) */
      float pxW = dist * uPxAngle * 1.15;
      float dzx = abs(dR - dist) < abs(dist - dL) ? (dR - dist) : (dist - dL);
      float dzy = abs(dU - dist) < abs(dist - dD) ? (dU - dist) : (dist - dD);
      vec3 nv = normalize(vec3(dzx / max(pxW, 1e-4), dzy / max(pxW, 1e-4), 1.0));
      /* ONE fixed raking light direction from upper-left across the carved slab */
      float ndotl = dot(nv, normalize(vec3(-0.66, 0.50, 0.56)));

      /* Scene colour + alpha (alpha == 0.5 marks living figures via REL.setLiving; stays living until petrify flips alpha to 1.0) */
      vec4 raw = texture2D(tScene, vUv);
      float isLiving = step(abs(raw.a - 0.5), 0.12);
      vec3 sc = toSrgb(raw.rgb);
      vec3 scLit = sqrt(max(texture2D(tScene, vUv + rakeDir * e1).rgb, vec3(0.0)));
      vec3 scShad = sqrt(max(texture2D(tScene, vUv - rakeDir * e1).rgb, vec3(0.0)));

      float lum = dot(sc, vec3(0.299, 0.587, 0.114));
      float lumLit = dot(scLit, vec3(0.299, 0.587, 0.114));
      float lumShad = dot(scShad, vec3(0.299, 0.587, 0.114));

      /* Carved cut-lines from textures (drapery flutes, ashlar joints, roof cover-tiles, leaf tiers, hair locks) */
      float cutSlope = (lumLit - lumShad) * 2.5;
      float cutGroove = clamp(smoothstep(0.045, 0.22, -cutSlope) + smoothstep(0.36, 0.17, lum) * 0.68, 0.0, 1.0);
      float cutRidge = smoothstep(0.045, 0.22, cutSlope);

      /* Fine Pentelic marble crystal grain and diagonal claw-chisel tool marks across the slab */
      vec2 px = vUv * res;
      float gScreen = noise(px * 0.30) * 0.62 + (hash(floor(px * 0.5)) - 0.5) * 0.22;
      float chisel = sin(dot(px, vec2(0.82, 0.57)) * 1.35 + gScreen * 2.6) * 0.5 + 0.5;
      float chiselTex = (gScreen - 0.5) * 0.042 + (chisel - 0.5) * 0.018;

      /* Pentelic marble sculptural palette: bright arris, warm ivory face, calm mid-stone, cool shadow bevel, carved groove, deep chisel contour */
      vec3 mArris  = vec3(0.980, 0.955, 0.895);
      vec3 mFace   = vec3(0.942, 0.905, 0.825);
      vec3 mMid    = vec3(0.865, 0.816, 0.722);
      vec3 mBevel  = vec3(0.755, 0.695, 0.595);
      vec3 mGroove = vec3(0.455, 0.390, 0.312);
      vec3 mInk    = vec3(0.145, 0.115, 0.092);

      /* 1. CARVED PENTELIC MARBLE WORLD (flat sculptural planes, ZERO soft 3D gradients!) */
      float rTone = clamp(ndotl * 0.68 + 0.30 + cutSlope * 0.26, 0.0, 1.0);
      vec3 stoneCol = rTone > 0.76 ? mArris : rTone > 0.46 ? mFace : rTone > 0.24 ? mMid : mBevel;
      stoneCol = mix(stoneCol, mGroove, cutGroove * 0.72);
      stoneCol = mix(stoneCol, mArris, clamp(cutRidge * 0.58 + marbleArrisEdge * 0.85, 0.0, 0.92));

      /* Flat mineral pigment over the carved stone for chromatic surfaces (strict palette, bare marble at edges & ridges) */
      float maxC = max(sc.r, max(sc.g, sc.b)), minC = min(sc.r, min(sc.g, sc.b));
      float sat = (maxC - minC) / max(maxC, 1e-3);
      /* Warm painted flesh on carved marble relief stays warm ivory-ochre flesh, never snapping to gold or olive */
      float isWarmFlesh = step(sc.g, sc.r) * step(sc.b, sc.g) * smoothstep(0.36, 0.48, sc.b) * smoothstep(0.44, 0.26, sat) * smoothstep(0.18, 0.26, sat);
      float isGreen = step(sc.r * 1.005, sc.g) * step(sc.b * 1.04, sc.g);
      float hasPaint = max(smoothstep(0.24, 0.36, sat) * (1.0 - isWarmFlesh), isGreen * smoothstep(0.13, 0.24, sat));
      vec3 pig = snapPalette(sc, lum);
      /* Two flat relief planes for painted stone (lit flat field + turned bevel) */
      vec3 paintedCol = pig * (rTone > 0.42 ? 1.03 : 0.77);
      paintedCol = mix(paintedCol, pig * 0.46, cutGroove * 0.78);
      /* Bare Pentelic marble gleaming along chiselled edges, creases, and high fold ridges */
      float showMarble = clamp(marbleArrisEdge * 0.82 + crease * 0.46 + cutRidge * 0.54 + smoothstep(0.80, 0.96, gScreen) * 0.16, 0.0, 0.90);
      paintedCol = mix(paintedCol, mFace, showMarble);

      vec3 fleshStone = mix(mMid, vec3(0.915, 0.785, 0.635), 0.75) * (rTone > 0.42 ? 1.03 : 0.82);
      fleshStone = mix(fleshStone, mArris, clamp(marbleArrisEdge * 0.70 + cutRidge * 0.45, 0.0, 0.85));
      vec3 baseStone = mix(stoneCol, fleshStone, isWarmFlesh);

      vec3 worldCol = mix(baseStone, paintedCol, hasPaint * 0.92);
      /* Firm chiselled contour, architectural creases, and deep carved undercut shadows */
      float darkLine = clamp(silhouette * 0.88 + crease * 0.42 + undercut * 0.82, 0.0, 0.90);
      worldCol = mix(worldCol, mInk, darkLine);

      /* 2. LIVING FIGURES (isLiving = 1: the girl, the moving procession, Step 1 staging actors before petrification) */
      vec3 liveCol = sc * mix(0.82, 1.08, clamp(ndotl * 0.5 + 0.5, 0.0, 1.0));
      liveCol = mix(liveCol, mArris, marbleArrisEdge * 0.22);
      liveCol = mix(liveCol, mInk, clamp(silhouette * 0.82 + crease * 0.30, 0.0, 0.85));

      vec3 col = mix(worldCol, liveCol, isLiving);

      /* 3. PLAIN EGYPTIAN BLUE FRIEZE GROUND (sky: one flat field of blue, dressed with chisel marks + dark undercut shadow behind raised skyline) */
      vec3 blueGround = vec3(0.122, 0.302, 0.561) * (1.0 + chiselTex * 1.15);
      blueGround = mix(blueGround, mFace, smoothstep(0.84, 0.98, gScreen) * 0.08);
      blueGround = mix(blueGround, vec3(0.045, 0.115, 0.245), clamp(undercut * 0.90, 0.0, 0.90));
      col = mix(col, blueGround, far);

      /* Step 2 at each staging (uRelief > 0): upper and lower carved frieze moulding shadow framing the block */
      if (uRelief > 0.01) {
        float frameTop = smoothstep(0.042, 0.012, 1.0 - vUv.y);
        float frameBot = smoothstep(0.042, 0.012, vUv.y);
        col = mix(col, mBevel, (frameTop + frameBot) * 0.65 * uRelief);
        float frameLine = smoothstep(0.048, 0.040, 1.0 - vUv.y) * (1.0 - frameTop) + smoothstep(0.048, 0.040, vUv.y) * (1.0 - frameBot);
        col = mix(col, mInk, clamp(frameLine * 0.85, 0.0, 0.85) * uRelief);
      }

      /* Step 3 at each staging (uBare 0 -> 1): paint sweeps away left-to-right into bare weathered Pentelic marble */
      if (uBare > 0.001) {
        float wave = clamp((uBare * 1.32 - vUv.x * 0.32 + (gScreen - 0.5) * 0.08) / 0.68, 0.0, 1.0);
        float bareK = wave * wave * (3.0 - 2.0 * wave);
        vec3 bareStone = rTone > 0.74 ? mArris : rTone > 0.44 ? mFace : rTone > 0.22 ? mMid : mBevel;
        bareStone = mix(bareStone, mGroove, cutGroove * 0.78);
        bareStone = mix(bareStone, mArris, clamp(cutRidge * 0.65 + marbleArrisEdge * 0.85, 0.0, 0.92));
        /* Subtle warm honey iron-oxide patina in carved folds & hollows of the surviving blocks */
        float patina = clamp(cutGroove * 0.62 + crease * 0.38, 0.0, 1.0) * (0.45 + 0.55 * gScreen);
        bareStone = mix(bareStone, vec3(0.75, 0.57, 0.39), patina * 0.42);
        bareStone = mix(bareStone, mInk, clamp(silhouette * 0.84 + crease * 0.38 + undercut * 0.74, 0.0, 0.86));
        col = mix(col, bareStone, bareK);
      }

      col *= 1.0 + chiselTex;
      gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
    }`
  });
  material.extensions = { derivatives: true };

  return {
    material,
    uniforms,
    update(camera, time, widthPx, heightPx, relief = 0, bare = 0) {
      uniforms.uTime.value = time;
      uniforms.uPx.value.set(1 / widthPx, 1 / heightPx);
      uniforms.uInvProj.value.copy(camera.projectionMatrixInverse);
      uniforms.uInvView.value.copy(camera.matrixWorld);
      uniforms.uPxAngle.value = 2 * Math.tan(camera.fov * Math.PI / 360) / heightPx;
      uniforms.uRelief.value = relief;
      uniforms.uBare.value = bare;
    },
    setMatLiving(mat, yes = true) {
      if (!mat || mat.transparent) return;
      const a = yes ? '0.5' : '1.0', key = yes ? 'rel_live_1' : 'rel_live_0';
      if (mat.userData._relKey === key) return;
      mat.userData._relKey = key;
      mat.onBeforeCompile = sh => {
        sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', `#include <dithering_fragment>\n gl_FragColor.a = ${a};`);
      };
      mat.customProgramCacheKey = () => key;
      mat.needsUpdate = true;
    },
    /* Mark a mesh hierarchy as living (alpha = 0.5 in the render target, like E.keepColour in alice/engrave.js) or carved stone (alpha = 1.0) */
    setLiving(root, yes = true) {
      root.traverse(m => { if (m.isMesh && m.material) this.setMatLiving(m.material, yes); });
      return root;
    }
  };
}
