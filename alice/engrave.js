/* The engraved line: a post filter that redraws a rendered three.js scene as a black-line wood engraving on paper.
   No grey is ever printed: tone is made by one, two and then three directions of hatching, whose lines swell as the tone darkens;
   outlines come from the depth buffer (silhouettes, and creases where two surfaces meet); the paper has a little grain; the lines waver slightly, as cut by hand.
   The hatching is anchored to the surfaces in the world (not to the screen), so it stays put as the camera moves, runs along floors in perspective and rings round
   columns and trunks; its spacing on screen is kept even by stepping between octaves of line spacing with distance.

   Use (written for alice/street.html; nothing here knows about that level, so another level can import it as it stands):

     import { makeEngraving } from '../alice/engrave.js';
     const target = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType });
     target.depthTexture = new THREE.DepthTexture(w, h, THREE.FloatType);                  // the filter needs the depth buffer
     const E = makeEngraving(THREE, { scene: target.texture, depth: target.depthTexture });
     const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), E.material);               // drawn with any camera: the vertex shader ignores it
     each frame:  renderer.setRenderTarget(target); renderer.render(scene, camera); renderer.setRenderTarget(null);
                  E.update(camera, timeInSeconds, target.width, target.height); renderer.render(quadScene, anyCamera);

   The scene should be lit with contrast (a strong sun, a little ambient light, cast shadows if wanted) on a white background with white fog: what is white stays bare paper.
   Colours in the scene are ignored, only their lightness counts, with one exception: E.keepColour(material) marks a material whose pixels are left in colour
   (it writes alpha 0.5 into the target; so the target must keep an alpha channel, and the background must be cleared with alpha 1).
   Dark lines painted in a texture (lettering, the check of a coat) come through as ink.

   Options and uniforms (E.uniforms.<name>.value), all optional:
     paper, ink     colours (THREE.Color or hex)                 uGain    exposure before the tone is read (default 1)
     uSpacing       pixels between hatching lines (5)            uLine    half-width of the outline in whole pixels (1)
     uBoil          how much the line trembles in time, 0 to 1   uShade   0 to 1: added darkness over everything (a blackout is 1)
     uFade          0 to 1: fade the whole drawing to bare paper uLevels  tone at which the three hatchings begin (vec3)
     uFog           (near, far) of a white scene fog, so that outlines fade into the paper with it; leave alone if there is none
     uCrease        how sharp a fold must be to earn a line (1.1: the corner of a box does, the facets of a rounded form do not) */
export function makeEngraving(THREE, o = {}) {
  const uniforms = {
    tScene: { value: o.scene || null }, tDepth: { value: o.depth || null }, uPx: { value: new THREE.Vector2(1 / 1024, 1 / 768) }, uTime: { value: 0 },
    uInvProj: { value: new THREE.Matrix4() }, uInvView: { value: new THREE.Matrix4() }, uPxAngle: { value: 0.001 },
    uPaper: { value: new THREE.Color(o.paper ?? '#f4eedf').convertLinearToSRGB() }, uInk: { value: new THREE.Color(o.ink ?? '#17130f').convertLinearToSRGB() },      // kept as the colours the screen shows: the shader writes them straight out
    uGain: { value: o.gain ?? 1 }, uSpacing: { value: o.spacing ?? 5 }, uLine: { value: o.line ?? 1 }, uBoil: { value: o.boil ?? 0.5 }, uShade: { value: 0 }, uFade: { value: 0 },
    uLevels: { value: new THREE.Vector3(0.13, 0.42, 0.68) }, uCrease: { value: o.crease ?? 1.1 }, uFog: { value: new THREE.Vector2(1e6, 2e6) },
  };
  const material = new THREE.ShaderMaterial({ uniforms, depthTest: false, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `
    uniform sampler2D tScene, tDepth; uniform vec2 uPx; uniform float uTime, uPxAngle, uGain, uSpacing, uLine, uBoil, uShade, uFade, uCrease;
    uniform mat4 uInvProj, uInvView; uniform vec3 uPaper, uInk, uLevels; uniform vec2 uFog; varying vec2 vUv;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
    float noise3(vec3 p){ return mix(noise(p.xz + p.y * 1.7), noise(p.zx * 1.3 - p.y * 2.1 + 31.0), 0.5); }
    vec3 viewPos(vec2 uv){ float d = texture2D(tDepth, uv).x; vec4 v = uInvProj * vec4(uv * 2.0 - 1.0, d * 2.0 - 1.0, 1.0); return v.xyz / v.w; }
    // one direction of hatching: p is the world position, a the direction the lines are counted along, dk how dark this layer should be (0 to 1)
    float hatch(vec3 p, vec3 a, float dk, float wob){
      float w = mix(0.17, 0.56, dk), sp = mix(2.2, 1.0, sqrt(dk));                               // light tone: thin lines far apart; dark tone: stout lines close together
      float ph = dot(p, a), f = max(length(vec2(dFdx(ph), dFdy(ph))), 1e-6);                 // world distance along a covered by one pixel
      float l = log2(uSpacing * sp * f / 0.02), k = floor(l), fr = l - k, P = 0.02 * exp2(k);     // the octave of spacing that puts the lines about uSpacing pixels apart
      ph += wob * f * 1.6;                                                                    // the hand wavers by a pixel or two
      float d1 = 1.0 - abs(fract(ph / P) - 0.5) * 2.0, d2 = 1.0 - abs(fract(ph / (2.0 * P)) - 0.5) * 2.0;      // distance to the nearest line of the fine set, and of the set twice as wide
      float v = mix(d1, d2, fr);                                                        // every other fine line thins away as the next octave takes over
      float aa = 0.75 * (2.0 - fr) * f / P; return (1.0 - smoothstep(w - aa, w + aa, v)) * smoothstep(0.0, 0.05, dk);
    }
    void main(){
      float boil = mod(floor(uTime * 7.0), 16.0);
      vec2 res = 1.0 / uPx, uv = vUv + (vec2(noise(vUv * res / 34.0 + boil * 3.1), noise(vUv * res / 34.0 + 17.0 - boil * 2.3)) - 0.5) * uPx * 2.6 * uBoil;
      vec4 sc = texture2D(tScene, uv);
      uv = (floor(uv * res) + 0.5) * uPx;                                                     // whole pixels only from here: the depth buffer cannot be read between them, and the outline test needs its two neighbours evenly placed
      vec3 c = pow(max(sc.rgb * uGain, 0.0), vec3(1.0 / 2.2)); float lum = dot(c, vec3(0.299, 0.587, 0.114));
      float keep = step(sc.a, 0.75);                                                          // a material marked by keepColour
      float dc = texture2D(tDepth, uv).x, lw = max(1.0, floor(uLine + 0.5)); vec2 e = uPx * lw;
      vec3 pc = viewPos(uv), pl = viewPos(uv - vec2(e.x, 0.0)), pr = viewPos(uv + vec2(e.x, 0.0)), pd = viewPos(uv - vec2(0.0, e.y)), pu = viewPos(uv + vec2(0.0, e.y));
      // outlines: 1/z runs straight across any flat surface on the screen, so its second difference is nothing on a plane, small at a crease and large at a silhouette
      float wc = 1.0 / pc.z, k2 = (abs(1.0 / pl.z + 1.0 / pr.z - 2.0 * wc) + abs(1.0 / pd.z + 1.0 / pu.z - 2.0 * wc)) / abs(wc) / (uPxAngle * lw);
      float far = smoothstep(0.9999, 0.99999, dc), dist = -pc.z;
      float edge = max(smoothstep(uCrease, uCrease * 1.7, k2) * 0.9, smoothstep(3.0, 6.0, k2)) * (1.0 - smoothstep(140.0, 420.0, dist) * 0.8) * (1.0 - smoothstep(uFog.x, uFog.y, dist) * 0.95);
      // the surface: its world position and which way it faces, taken from the nearer neighbour on each axis so that edges do not smear it
      vec3 dx = abs(pr.z - pc.z) < abs(pc.z - pl.z) ? pr - pc : pc - pl, dy = abs(pu.z - pc.z) < abs(pc.z - pd.z) ? pu - pc : pc - pd;
      vec3 n = normalize(mat3(uInvView) * cross(dx, dy)), p = (uInvView * vec4(pc, 1.0)).xyz;
      float t = clamp(1.0 - lum + uShade * 1.2 + (noise3(p * 3.0) - 0.5) * 0.10, 0.0, 1.0);
      float wob = (noise3(p * 2.3 + boil * 0.37 * uBoil) - 0.5) * 2.0;
      vec3 a1, a2, a3;
      if (abs(n.y) > 0.72) { a1 = vec3(0.944, 0.0, 0.33); a2 = vec3(-0.33, 0.0, 0.944); a3 = vec3(0.707, 0.0, -0.707); }      // floors and tops: lines along the ground
      else { a1 = vec3(0.0, 1.0, 0.0); a2 = vec3(0.50, 0.62, 0.60); a3 = vec3(-0.60, 0.62, -0.50); }                          // walls and round things: rings, then two diagonals
      float ink = 0.0;
      ink = max(ink, hatch(p, a1, smoothstep(uLevels.x, uLevels.x + 0.50, t), wob));
      ink = max(ink, hatch(p, a2, smoothstep(uLevels.y, uLevels.y + 0.42, t) * 0.9, wob));
      ink = max(ink, hatch(p, a3, smoothstep(uLevels.z, uLevels.z + 0.30, t) * 0.9, -wob));
      ink = max(ink, smoothstep(0.30, 0.17, lum - uShade));                                   // what is painted dark is ink: lettering, a check, the deepest shadow
      ink *= 1.0 - far;                                                                        // the sky is bare paper
      ink = max(ink, edge);
      // paper: a warm ground with grain and a few fibres, a shade darker towards the corners
      vec2 px = vUv * res; float grain = (hash(floor(px)) - 0.5) * 0.045 + (noise(px * vec2(0.9, 0.06)) - 0.5) * 0.035 + (noise(px * 0.02) - 0.5) * 0.03;
      vec3 paper = uPaper * (1.0 + grain) * (1.0 - 0.10 * pow(length(vUv - 0.5) * 1.3, 3.0));
      vec3 inkc = uInk * (1.0 + (noise(px * 0.5) - 0.5) * 0.5);
      vec3 col = mix(paper, inkc, clamp(ink, 0.0, 1.0));
      // the one thing in colour: printed on the same paper, with only its outline drawn
      vec3 kc = c * (0.93 + grain) * (1.0 - clamp(uShade, 0.0, 1.0) * 0.85);
      col = mix(col, mix(kc, inkc, smoothstep(2.5, 5.0, k2) * 0.75), keep);
      gl_FragColor = vec4(mix(col, paper, uFade), 1.0);
    }` });
  material.extensions = { derivatives: true };
  const size = new THREE.Vector2();
  return {
    material, uniforms,
    // call once per frame, after rendering the scene into the target and before drawing the quad
    update(camera, time, widthPx, heightPx) {
      uniforms.uTime.value = time; uniforms.uPx.value.set(1 / widthPx, 1 / heightPx);
      uniforms.uInvProj.value.copy(camera.projectionMatrixInverse); uniforms.uInvView.value.copy(camera.matrixWorld);
      uniforms.uPxAngle.value = 2 * Math.tan(camera.fov * Math.PI / 360) / heightPx;       // the angle one pixel covers
      size.set(widthPx, heightPx);
    },
    // leave this material's pixels in colour (Alice in a drawn world). Works for the built-in opaque materials.
    keepColour(m) { const prev = m.onBeforeCompile; m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); sh.fragmentShader = sh.fragmentShader.replace('#include <dithering_fragment>', '#include <dithering_fragment>\n gl_FragColor.a = 0.5;'); }; m.customProgramCacheKey = () => 'keepColour'; m.needsUpdate = true; return m; },
  };
}
