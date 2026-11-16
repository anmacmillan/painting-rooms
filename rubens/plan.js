/* The plan of the errand: where everything is, and why. x east, z south, metres from the crossing of the cathedral (map.json, from OpenStreetMap by
   tools/prep_antwerp.py; what was changed for 1612 is listed with its reasons in research/plan1612.json). What is today's plan, what is 1612's and what is
   this level's own is set out in research/FINDINGS.md; the short of it stands beside each thing here. */
// St Walburga's, the Burchtkerk. nl.wikipedia puts it "ter hoogte van de Zakstraat, ongeveer 50 m ten noorden van waar tegenwoordig het Steenplein ligt". The west end
// of today's Zakstraat is at about (-212, -327). The church is set there with its door to the west, as churches lie; its true footprint and bearing are not known.
const WALB = { door: [-262, -320], out: [-1, 0] };
export const PLAN = {
  // the cathedral's own measure: its west door, and the line of the nave (east by a little south), read off OpenStreetMap's footprint
  cathedral: { ox: -71, oz: -4.5, ax: 0.9923, az: 0.124 },
  southDoor: [71, 37],
  own: ['cathedral', 'stadhuis', 'steen', 'rubenshuis'],      // footprints the level builds itself
  bounds: [-560, -480, 700, 480],
  route: cW => [
    [606, 366], [590, 366], [577, 365], [566, 356], [561, 353.6], [550, 353.5], [540, 353.5], [532.5, 353.5],     // the garden, the court, the gate
    [530, 345], [530, 262], [524, 250.5], [508, 249],                                               // up the street beside the Vaart
    [470, 243.5], [400, 234.5], [330, 226], [282, 216], [265.6, 211.1], [203.6, 200.1],             // the Meir, south of its water, to the Meirbrug
    [170, 205], [133.9, 212.2], [90, 207], [41.1, 201.2], [14, 197],                                // Schoenmarkt
    [1, 186], [0, 140], [-3, 100], [-6, 66], [-6.5, 50],                                            // across the Groenkerkhof to the south door
    cW(71, 37), cW(71, 28), cW(71, 10), cW(67, 2.5), cW(58, 0), cW(30, 0), cW(8, 0), cW(-3, 0),     // in by the transept, down the nave, out by the west door
    cW(-9, -6), cW(-10, -32), [-84, -62], [-92, -95],                                               // Handschoenmarkt, Maalderijstraat
    [-112, -105], [-140, -98], [-159, -71],                                                         // the Grote Markt, before the town hall
    [-165, -56], [-178.1, -52.2], [-294.9, -109.2],                                                   // the Suikerrui, north of its water
    [-290, -128], [-268, -180], [-247, -222], [-244, -246], [-245, -286], [-256, -300], [-268, -312], [-270, -320],      // the quay, past Het Steen
    [WALB.door[0] + 1, WALB.door[1]], [WALB.door[0] + 12, WALB.door[1]], [WALB.door[0] + 31, WALB.door[1]]],             // in at the west door of St Walburga's
  ground: [
    ['grass', [[-12, 64], [40, 70], [44, 186], [-6, 180], [-14, 120]], 0.02],      // the churchyard south of the cathedral: green
    ['earth', [[8, 72], [12, 70], [40, 180], [36, 183]], 0.035], ['earth', [[38, 74], [41, 77], [0, 176], [-3, 173]], 0.035],      // paths crossing it, as the plan of 1565 shows
    ['earth', [[-9.5, 64], [-2.5, 64], [0.5, 178], [-6.5, 178]], 0.04],            // the path across it to the south door
  ],
  // ---- the three pictures. eye: where the painter stands; dir: which way he looks; r to his right, d away from him
  bower: { eye: [578, 365], dir: [0, -1], stop: [0, 0], he: [-0.26, 6.12], heY: 0.02, she: [0.26, 5.85], kid: [3.0, 1.2], man: [0, 0], look: [0, 6], cam: [[0.14, 2.6, 0.9], [0.14, 6.0, 0.7], 33],
    title: 'The Honeysuckle Bower', line: 'Peter Paul Rubens, about 1609 · the painter and Isabella Brant · Alte Pinakothek, Munich', img: 'images/honeysuckle.jpg', after: 'Come, child. Bring the colours: they wait for us in the cathedral.' },
  descent: { eye: [66, 26], dir: CA => [CA.ax, CA.az], stop: [1, 5], kid: [2.6, 6.2], man: [-2.4, 7.0], look: [0, 11.5], cam: [[0, 1.2, 1.6], [0, 11.4, 4.3], 36],
    title: 'The Descent from the Cross', line: 'Peter Paul Rubens, 1612 · painted for the Arquebusiers · Cathedral of Our Lady, Antwerp', img: 'images/descent.jpg', after: 'It hangs true. Now to the Burcht church, by the river.', after2: 'I want to see my other great picture by this light.' },
  raising: { eye: [WALB.door[0] + 14, WALB.door[1]], dir: [1, 0], reach: 4, kid: [2.4, 15.5], man: [-2.2, 17], look: [0, 30], cam: [[0, 12, 1.7], [0, 37, 7.2], 34],
    title: 'The Raising of the Cross', line: "Peter Paul Rubens, 1610–11 · for the high altar of St Walburga's · now in the Cathedral of Our Lady", img: 'images/raising.jpg',
    say1: 'There it stands, up all those steps. I painted it here, behind a sail.', say2: 'Up all those steps, so that the whole church must look.' },
  // where the way is wider than 15 m to either side: [from, to, half-width]
  wide: [[[1, 186], [-6, 66], 30], [[-84, -62], [-159, -71], 38], [[-290, -128], [-262, -300], 24]],
  titleCam: [[-112, 3, -30], [-64, 60, -26]],
  lookUp: (s, sIn, sOut) => (s > sIn - 6 && s < sOut ? 1.6 : 0.5),
  gutters: [[470, 243.5], [300, 219.7], [133.9, 212.2], [-84, -62], [-215, -70], [-254, -206]], barrels: [[530, 310], [430, 238.5], [350, 228.5], [240, 206.5], [170, 205], [70, 205], [-78, -40], [-150, -85], [-245, -84.6], [-279, -155], [-246, -262]], avoid: [],
  bells: [7, -23],      // the north tower, in the cathedral's own measure
  spans: ({ S_BOW, S_IN, S_OUT, LEN }) => [[S_BOW + 45, 260], [260, 420], [420, S_IN - 70], [S_IN - 60, S_IN - 12], [S_OUT + 12, S_OUT + 150], [S_OUT + 150, LEN - 60]],
  carts: ({ S_BOW, S_IN, S_OUT, LEN }) => [[S_BOW + 70, 190, 2.2, 'barrow'], [200, 340, 2.8, 'sacks'], [350, 520, -3.2, 'casks'], [530, S_IN - 150, 2.6, 'barrow'], [S_IN - 130, S_IN - 20, 4.5, 'barrow'], [S_OUT + 20, S_OUT + 90, -2.6, 'sacks'], [S_OUT + 180, S_OUT + 300, -2.2, 'barrow'], [S_OUT + 310, LEN - 130, 3.0, 'casks'], [LEN - 250, LEN - 70, -3.6, 'sacks']],
  places: cW => [{ n: 'The new house on the Vaart', x: 560, z: 356 }, { n: 'Meirbrug', x: 203.6, z: 200.1 }, { n: 'Groen Kerkhof', x: 0, z: 120 }, { n: 'The cathedral', x: cW(71, 26)[0], z: cW(71, 26)[1] }, { n: 'Grote Markt', x: -125, z: -103 }, { n: 'Het Steen', x: -280, z: -255 }, { n: "St Walburga's", x: WALB.door[0] + 20, z: WALB.door[1] }],
  words: { start: 'The master is in the garden of the new house, with Mistress Isabella. Take him his box of colours!', cry: '“Pas op! Water!”',
    town: ['Dag, kind!', 'Good day, Master Rubens!', 'Mind the cart, girl.', 'Is that the painter who bought the house on the Vaart?', 'Herring! Fresh herring!', 'Run, or you will lose him.'], drunk: ['Hik!', 'The street will not stand still.', 'One more pot of beer!'] },
  /* ---- street life (life.js): where the standing figures and the mishaps are. All places are the level's ---- */
  life: cW => ({
    clergy: [[...cW(68.5, 45), 1.2, 'priest', { line: 'God zegene u, kind.' }], [...cW(73.5, 45.5), -1.9, 'priest'], [...cW(-7, 6), -1.6, 'priest', { line: 'Softly in the church, child.' }], [...cW(-12, -14), 2.4, 'burgher'], [...cW(-13, -15.2), -0.7, 'burgher_wife'], [-118, -128, 0.4, 'market_woman', { line: 'Apples! Sweet apples!' }]],
    porters: [[-300, -215, 1.0], [-312, -232, 2.0], [-296, -246, 0.4], [-345, -222, -1.2]],
    slops: [[530, 300], [150, 208], [60, 205], [-88, -78], [-232, -78.5], [-246, -268]],
    muck: [[385, 232.5], [-121, -103]], pig: [[105, 208.5]], geese: [[-1, 125]], fish: [[-272, -172]], tavern: [[-262, -93.5]],
    dogs: [[[282, 216], [203.6, 200.1]], [[-200, -63], [-270, -97]]],
    words: { slops: ['“Pas op! Water!”', '“Van onder!”', '“Opgepast daar beneden!”'], missed: ['Mis! Next time, kind.', 'Oh! Pardon, little one.'], muck: 'Mind the muck, juffrouw!', pigman: 'Stop that pig!', fish: 'Mijn vis! Mind your feet!', drunk: ['Hik!', 'The street will not stand still. Hik!'] } }),
  /* ---- the named buildings ---- */
  build({ THREE, scene, FR }) {
    const out = {}, M = FR.M;
    // the house on the Wapper: its street front runs south from (534.5, 332), looking west over the Vaart
    out.house = FR.rubenshuis(FR.frame(534.5, 332, -1, 0), { garden: 50, beds: [[9, -36, 12, 9], [9, -52, 12, 12], [9, -67, 12, 9], [41.5, -40, 5, 14], [41.5, -60, 5, 14]], trees: [[3, -30], [3, -45], [3, -60], [42, -30], [42, -45], [42, -60], [16, -73], [29, -73]] });
    out.bower = FR.bower(FR.frame(578, 359.0, 0, 1));
    // the great crucifix on the Meir, opposite the Huidevettersstraat (nl.wikipedia Meir: there from 1527 to the end of the eighteenth century). Its look is not known: a plain cross on steps
    { const b = FR.builder(); for (let i = 0; i < 3; i++) b.box(M.stoneGrey, 3.4 - i * 0.8, 0.3, 3.4 - i * 0.8, 0, i * 0.3, 0); b.box(M.oak, 0.3, 6.4, 0.3, 0, 0.9, 0); b.box(M.oak, 2.6, 0.3, 0.3, 0, 5.6, 0); b.box(M.white, 0.28, 1.5, 0.2, 0, 4.4, 0.2); b.box(M.white, 1.5, 0.16, 0.16, 0, 5.62, 0.2); b.sheet(M.slate, [[-1.6, 7.3, 0.5], [1.6, 7.3, 0.5], [0, 8.2, -0.1], [0, 8.2, -0.1]]); b.done(273, 204, 0); FR.rounds.push({ x: 273, z: 204, r: 2.2 }); }
    // the well on the Handschoenmarkt: a stone curb under a canopy of wrought iron (its ironwork is not copied: a plain frame stands for it)
    { const b = FR.builder(); b.cyl(M.stoneGrey, 1.25, 1.35, 0.9, 0, 0, 0, 10); b.cyl(M.dark, 0.95, 0.95, 0.05, 0, 0.9, 0, 10); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + 0.78; b.cyl(M.iron, 0.05, 0.06, 3.2, Math.sin(a) * 1.15, 0.9, Math.cos(a) * 1.15, 5); b.add(M.iron, new THREE.BoxGeometry(0.06, 0.06, 1.7), Math.sin(a) * 0.58, 4.6, Math.cos(a) * 0.58, a, -0.9); } b.cyl(M.gold, 0.08, 0.16, 0.7, 0, 5.1, 0, 5); b.done(-83.7, -32.8, 0); FR.rounds.push({ x: -83.7, z: -32.8, r: 1.8 }); }
    // the churchyard south of the cathedral: trees, as the plan of 1565 draws it (research/ref/plan1565_crop_cathedral_churchyard.jpg), and a wooden calvary. Where each stood is not known
    { const b = FR.builder(); for (const [x, z, h] of [[14, 84, 7], [30, 92, 8], [20, 112, 7.5], [36, 124, 8], [16, 140, 7], [31, 154, 8.5], [14, 168, 7], [38, 176, 7.5], [-10, 150, 7], [-11, 96, 7.5]]) { b.cyl(M.oak, 0.16, 0.26, h * 0.5, x, 0, z, 6); for (let i = 0; i < 5; i++) b.add(i % 2 ? M.leaf : M.leafDark, new THREE.IcosahedronGeometry(1.5 + (i % 3) * 0.5, 1), x + Math.cos(i * 2.3) * 1.3, h * 0.55 + (i % 3) * 1.0, z + Math.sin(i * 2.3) * 1.3); FR.rounds.push({ x, z, r: 0.5 }); }
      b.box(M.oak, 0.22, 4.2, 0.22, 22, 0, 128); b.box(M.oak, 1.8, 0.2, 0.2, 22, 3.3, 128); b.box(M.stoneGrey, 1.4, 0.5, 1.4, 22, 0, 128); FR.rounds.push({ x: 22, z: 128, r: 1.0 }); b.done(0, 0, 0); }
    // the town hall, on its real front (left end as you face it from the square: the south end)
    out.stadhuis = FR.stadhuis(FR.frame(-163, -80, 0.935, 0.355), 62, 26);
    // guild houses along the north side of the Grote Markt
    out.guilds = FR.guildRow(FR.frame(-137, -141.5, -0.27, 0.963), [[6.2, 5], [7.4, 6, { scroll: 1, rider: 1 }], [6.4, 5, { mat: M.stone }], [7.8, 6, { scroll: 1 }], [6.6, 5], [7.0, 6, { mat: M.stone, scroll: 1 }], [6.0, 5]]);
    // Het Steen: its gate front looks south
    out.steen = FR.steen(FR.frame(-300, -251, 0, 1), 36);
    // the market on the Grote Markt (the fairs and markets are attested; where each stall stood is not) and the fish market on the quay, where the Steenplein now is
    { const b = FR.builder(); out.sellers = [];
      [[-106, -119, 0.3, 'green'], [-118, -122, 0.2, 'green'], [-131, -117, -0.1, 'green'], [-124, -90, 3.3, 'green'], [-110, -91, 3.0, 'green'], [-147, -112, 1.2, 'green'], [-100, -106, 0.9, 'green'], [-136, -84, 2.6, 'green'],
       [-274, -200, 1.9, 'fish'], [-281, -214, 1.9, 'fish'], [-249, -188, -1.2, 'fish'], [-287, -228, 1.9, 'fish'], [-292, -160, 2.0, 'fish']].forEach(([x, z, ry, kind], k) => out.sellers.push([...FR.stall(b, x, z, ry, kind, k), ry]));
      // craft lying at the Werf, and its crane
      FR.ship(b, -399, -246, 1.25, 26, 2); FR.ship(b, -401, -214, 1.35, 20, 2); FR.ship(b, -372, -172, 1.1, 15, 1); FR.ship(b, -333, -306, 0.5, 17, 1); FR.crane(b, -366, -232, -1.9);
      // boats on the open water of the Suikerrui and the Vaart (that boats lay there is the level's supposition)
      for (const [x, z, ry] of [[-226, -69.5, 2.69], [-259, -85.6, 2.69], [519.8, 330, 1.57]]) { const h = new THREE.SphereGeometry(1, 10, 6, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2); h.scale(2.3, 0.7, 0.9); b.add(M.woodDark, h, x, 0.5, z, ry); b.box(M.oak, 0.3, 0.06, 1.5, x, 0.42, z, ry); }
      b.done(0, 0, 0); }
    // St Walburga's
    out.walb = FR.church(FR.frame(WALB.door[0], WALB.door[1], WALB.out[0], WALB.out[1]), { steps: 19, rise: 3.0 });      // 'a platform of no less than 19 steps', the choir 'about three metres above street level' (TOPA) out.inside = out.walb.inside;
    return out;
  },
  /* ---- the pictures set out ---- */
  stage({ THREE, scene, FR, FIG, T, staged, arms, F_BOW, F_DES, F_END, cW, BUILT }) {
    const TL = new THREE.TextureLoader(), load = f => { const t = TL.load(f); t.colorSpace = THREE.SRGBColorSpace; return t; };
    // 1. the bower, set out from the painting: he on the turf seat, higher, leaning to her, a leg thrown forward in its orange stocking, his left hand up on the hilt
    //    of his sword; she lower on the ground at his left, in the tall straw hat; their right hands joined in the middle of the picture. The two faces and the joined
    //    hands are his own painting of them, cut from the picture and laid on the figures (tex/pface_*.png, tex/phands.png)
    const decal = (f, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshLambertMaterial({ map: load(f), transparent: true, alphaTest: 0.35 })); return m; };
    // a painted face is laid on a shell that curves round the front of the head and takes the scene's light, so that it turns with the head and is not a flat card
    const faceOn = (g, f, yc, R = 0.142) => { const t = load(f), m = new THREE.Mesh(new THREE.SphereGeometry(R, 18, 14, Math.PI / 2 - 0.9, 1.8, 0.55, 1.65), new THREE.MeshLambertMaterial({ map: t, transparent: true, alphaTest: 0.2, emissive: '#ffffff', emissiveMap: t, emissiveIntensity: 0.22 })); m.scale.set(1, 1.2, 1); return FIG.onHead(g, m, 0, yc, 0.004); };
    const white = new THREE.MeshLambertMaterial({ color: '#f4f1e8' }), lace = new THREE.MeshLambertMaterial({ color: '#e9e6dc' });
    const isabella = staged(F_BOW, 'isabella', ...PLAN.bower.she, -0.35, -1, { size: 1.1, y: -0.66 }); faceOn(isabella, 'tex/pface_isabella.png', 1.468);
    { const ruff = new THREE.Group(), disc = new THREE.Mesh(new THREE.CylinderGeometry(0.205, 0.205, 0.045, 30), white), rim = new THREE.Mesh(new THREE.TorusGeometry(0.205, 0.026, 6, 30), lace); rim.rotation.x = Math.PI / 2; ruff.add(disc, rim); for (let i = 0; i < 30; i++) { const a = i / 30 * 6.283, pl = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.07, 0.11), lace); pl.position.set(Math.sin(a) * 0.16, 0, Math.cos(a) * 0.16); pl.rotation.y = a; ruff.add(pl); } ruff.rotation.x = 0.3; FIG.onHead(isabella, ruff, 0, 1.35, 0.02); }
    for (const S of 'LR') { T(isabella, 'thigh' + S, -82, 0, S === 'L' ? 14 : -14); T(isabella, 'shin' + S, 70); } T(isabella, 'spine', 4, 9, 0); T(isabella, 'head', -4, 9, 8); T(isabella, 'upperarmR', -44, 0, 26); T(isabella, 'forearmR', -36); T(isabella, 'upperarmL', 8, 0, -8); T(isabella, 'forearmL', -46);
    // her skirt spread wide on the ground about her: wine-red silk with a gold braid, the blue underskirt showing at the hem
    { const [x, z] = F_BOW.P(PLAN.bower.she[0] + 0.2, PLAN.bower.she[1] - 0.22), sk = new THREE.Group(), silk = new THREE.MeshLambertMaterial({ color: '#5c1626' }), dome = new THREE.Mesh(new THREE.SphereGeometry(1, 22, 10, 0, 6.283, 0, Math.PI / 2), silk); dome.scale.set(0.8, 0.4, 0.66); sk.add(dome);
      for (const [a, r] of [[0.5, 0.66], [1.3, 0.6], [2.2, 0.66]]) { const fold = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), new THREE.MeshLambertMaterial({ color: '#451020' })); fold.scale.set(1.1, 0.5, 0.7); fold.position.set(Math.cos(a) * r, 0.1, Math.sin(a) * r * 0.8); sk.add(fold); }
      const braid = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.02, 5, 30, 2.6), FR.M.gold); braid.rotation.x = Math.PI / 2; braid.rotation.z = -0.2; braid.scale.set(1, 0.82, 1); braid.position.y = 0.06; sk.add(braid);
      const blue = new THREE.Mesh(new THREE.SphereGeometry(0.34, 10, 6), new THREE.MeshLambertMaterial({ color: '#2c4c8c' })); blue.scale.set(1.2, 0.3, 0.8); blue.position.set(0.42, 0.04, 0.58); sk.add(blue);
      sk.position.set(x, 0, z); sk.rotation.y = F_BOW.ang(0, -1); scene.add(sk); }
    const dress = g => { faceOn(g, 'tex/pface_rubens.png', 1.45, 0.165); const col = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.05, 24), lace); col.rotation.x = 0.5; FIG.onHead(g, col, 0, 1.32, 0.035); };
    const poseHim = g => { g.rotation.y = F_BOW.ang(0.32, -1); T(g, 'thighR', -56, 0, -36); T(g, 'shinR', 30); T(g, 'thighL', -92, 0, 22); T(g, 'shinL', 108); T(g, 'spine', 8, -9, 0); T(g, 'head', -18, -8, 0); T(g, 'upperarmL', -60, 0, 0); T(g, 'forearmL', -120); T(g, 'upperarmR', -34, 0, 0); T(g, 'forearmR', -44); g.position.y -= 0.37 * g.scale.y + 0.06; };
    const props = new THREE.Group(); { const [hx, hz] = F_BOW.P(-0.03, 5.95), hands = decal('tex/phands.png', 0.25, 0.2); hands.position.set(hx, 0.74, hz); hands.rotation.y = F_BOW.ang(0, -1); props.add(hands);
      const sw = new THREE.Group(), steel = new THREE.MeshLambertMaterial({ color: '#3a3a40' }), gold = FR.M.gold; const blade = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.95, 0.02), steel); blade.position.y = -0.5; const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.16, 6), gold); grip.position.y = 0.06; const guard = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 5, 12), gold); guard.position.y = -0.02; const pom = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), gold); pom.position.y = 0.16; sw.add(blade, grip, guard, pom);
      const [sx, sz] = F_BOW.P(0.1, 6.05); sw.position.set(sx, 1.0, sz); sw.scale.setScalar(0.8); sw.rotation.z = 0.45; sw.rotation.y = F_BOW.ang(0, -1); props.add(sw); scene.add(props); }
    const helper = staged({ P: (r, d) => [601 + r, 362 + d], ang: (r, d) => Math.atan2(r, d) }, 'assistant', 0, 0, 1, 1, { size: 1.12 }); arms(helper, 'R', -70, 0, -30);
    // 2. the Descent, new in its place: the middle panel alone (the wings came later), on the Arquebusiers' altar against the east wall of the south transept
    const AF = FR.frame(...cW(77.7, 26), -PLAN.cathedral.ax, -PLAN.cathedral.az), des = FR.altarpiece(AF, load('images/descent.jpg'), 3.1, 4.2, { steps: 3, lift: 1.9, guild: true });
    staged(F_DES, 'priest', -3.6, 9.2, 0.4, 1, {}); staged(F_DES, 'burgher_wife', 3.4, 8.6, -0.2, 1, { kneel: true }); staged(F_DES, 'burgher', 4.3, 7.6, -0.3, 1, { kneel: true });
    // 3. the Raising, where it was first set up: over the high altar of St Walburga's, at the head of the steps
    const W = BUILT.walb, rai = FR.altarpiece(W.altar, load('images/raising.jpg'), 6.33, 4.6, { steps: 3, lift: 1.5, y: W.rise });
    staged(F_END, 'woman_red', -3.2, 15, 0.1, 1, { kneel: true }); staged(F_END, 'man_brown', 3.4, 14, -0.1, 1, { kneel: true }); staged(F_END, 'priest', 2.6, 21, -0.5, 1, {});
    for (const [x, z, ry] of BUILT.sellers) { const g = staged({ P: () => [x, z], ang: () => ry }, BUILT.sellers.indexOf(BUILT.sellers.find(q => q[0] === x)) % 3 === 2 ? 'woman_red' : 'market_woman', 0, 0, 0, 1, { size: 1.1 }); arms(g, 'R', -50, 0, -60); }
    return { isabella, helper, poseHim, dress, des, rai, update: (time, dt, o) => { props.visible = !o.seen.bower || (o.state === 'way' && o.wp && o.wp.key === 'bower'); } };
  },
};
