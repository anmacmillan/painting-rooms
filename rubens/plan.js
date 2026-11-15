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
    [-290, -128], [-268, -180], [-247, -222], [-244, -246], [-246, -276], [-262, -300], [-273, -313], [-270, -320],      // the quay, past Het Steen
    [WALB.door[0] + 1, WALB.door[1]], [WALB.door[0] + 12, WALB.door[1]], [WALB.door[0] + 31, WALB.door[1]]],             // in at the west door of St Walburga's
  ground: [
    ['grass', [[-12, 64], [40, 70], [44, 186], [-6, 180], [-14, 120]], 0.02],      // the churchyard south of the cathedral: green
    ['earth', [[8, 72], [12, 70], [40, 180], [36, 183]], 0.035], ['earth', [[38, 74], [41, 77], [0, 176], [-3, 173]], 0.035],      // paths crossing it, as the plan of 1565 shows
    ['earth', [[-9.5, 64], [-2.5, 64], [0.5, 178], [-6.5, 178]], 0.04],            // the path across it to the south door
  ],
  // ---- the three pictures. eye: where the painter stands; dir: which way he looks; r to his right, d away from him
  bower: { eye: [578, 365], dir: [0, -1], stop: [0, 0], he: [-0.4, 6.05], heY: 0.02, she: [0.42, 5.55], kid: [3.0, 1.2], man: [0, 0], look: [0, 6], cam: [[0.05, 2.4, 1.05], [0.02, 6.0, 0.92], 40],
    title: 'The Honeysuckle Bower', line: 'Peter Paul Rubens, about 1609 · the painter and Isabella Brant · Alte Pinakothek, Munich', img: 'images/honeysuckle.jpg', after: 'Come, child. Bring the colours: they wait for us in the cathedral.' },
  descent: { eye: [66, 26], dir: CA => [CA.ax, CA.az], stop: [1, 5], kid: [2.6, 6.2], man: [-2.4, 7.0], look: [0, 11.5], cam: [[0, 1.2, 1.6], [0, 11.4, 4.3], 36],
    title: 'The Descent from the Cross', line: 'Peter Paul Rubens, 1612 · painted for the Arquebusiers · Cathedral of Our Lady, Antwerp', img: 'images/descent.jpg', after: 'It hangs true. Now to the Burcht church, by the river.', after2: 'I want to see my other great picture by this light.' },
  raising: { eye: [WALB.door[0] + 14, WALB.door[1]], dir: [1, 0], reach: 4, kid: [2.4, 15.5], man: [-2.2, 17], look: [0, 30], cam: [[0, 12, 1.7], [0, 37, 7.2], 34],
    title: 'The Raising of the Cross', line: "Peter Paul Rubens, 1610–11 · for the high altar of St Walburga's · now in the Cathedral of Our Lady", img: 'images/raising.jpg',
    say1: 'There it stands. I painted it here, behind a sail.', say2: 'Up all those steps, so that the whole church must look.' },
  titleCam: [[-112, 3, -30], [-64, 60, -26]],
  lookUp: (s, sIn, sOut) => (s > sIn - 6 && s < sOut ? 1.6 : 0.5),
  gutters: [[400, 234.5], [133.9, 212.2], [-84, -62]], barrels: [[440, 240], [240, 206.5], [60, 204], [-140, -98], [-268, -180]], avoid: [],
  spans: ({ S_BOW, S_IN, S_OUT, LEN }) => [[S_BOW + 45, 260], [260, 420], [420, S_IN - 70], [S_IN - 60, S_IN - 12], [S_OUT + 12, S_OUT + 150], [S_OUT + 150, LEN - 60]],
  carts: ({ S_BOW, S_IN, S_OUT, LEN }) => [[S_BOW + 130, 330, 2.6, 'sacks'], [360, S_IN - 90, -3.4, 'casks'], [S_OUT + 270, LEN - 70, 2.2, 'sacks']],
  places: cW => [{ n: 'The new house on the Vaart', x: 560, z: 356 }, { n: 'Meirbrug', x: 203.6, z: 200.1 }, { n: 'Groen Kerkhof', x: 0, z: 120 }, { n: 'The cathedral', x: cW(71, 26)[0], z: cW(71, 26)[1] }, { n: 'Grote Markt', x: -125, z: -103 }, { n: 'Het Steen', x: -280, z: -255 }, { n: "St Walburga's", x: WALB.door[0] + 20, z: WALB.door[1] }],
  words: { start: 'The master is in the garden of the new house, with Mistress Isabella. Take him his box of colours!', cry: '“Pas op! Water!”',
    town: ['Dag, kind!', 'Good day, Master Rubens!', 'Mind the cart, girl.', 'Is that the painter who bought the house on the Vaart?', 'Herring! Fresh herring!', 'Run, or you will lose him.'], drunk: ['Hik!', 'The street will not stand still.', 'One more pot of beer!'] },
  /* ---- the named buildings ---- */
  build({ THREE, scene, FR }) {
    const out = {}, M = FR.M;
    // the house on the Wapper: its street front runs south from (534.5, 332), looking west over the Vaart
    out.house = FR.rubenshuis(FR.frame(534.5, 332, -1, 0), { garden: 50, beds: [[9, -36, 12, 9], [9, -52, 12, 12], [9, -67, 12, 9], [41.5, -40, 5, 14], [41.5, -60, 5, 14]], trees: [[3, -30], [3, -45], [3, -60], [42, -30], [42, -45], [42, -60], [16, -73], [29, -73]] });
    out.bower = FR.bower(FR.frame(578, 358.2, 0, 1));
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
    // St Walburga's
    out.walb = FR.church(FR.frame(WALB.door[0], WALB.door[1], WALB.out[0], WALB.out[1]), { steps: 19, rise: 3.0 });      // 'a platform of no less than 19 steps', the choir 'about three metres above street level' (TOPA) out.inside = out.walb.inside;
    return out;
  },
  /* ---- the pictures set out ---- */
  stage({ THREE, FR, T, staged, arms, F_BOW, F_DES, F_END, cW, BUILT }) {
    const TL = new THREE.TextureLoader(), load = f => { const t = TL.load(f); t.colorSpace = THREE.SRGBColorSpace; return t; };
    // 1. the bower: he sits a little higher on the turf seat, one leg over the other; she lower, on the ground at his left hand, her right hand on his
    const isabella = staged(F_BOW, 'isabella', ...PLAN.bower.she, -0.2, -1, { size: 1.1, y: -0.5 }); for (const S of 'LR') { T(isabella, 'thigh' + S, -14); T(isabella, 'shin' + S, 112); } T(isabella, 'spine', 2, 0, 5); T(isabella, 'head', 0, 0, -8); T(isabella, 'upperarmR', -52, 0, 34); T(isabella, 'forearmR', -30); T(isabella, 'upperarmL', 4, 0, -10); T(isabella, 'forearmL', -30);
    const poseHim = g => { for (const S of 'LR') { T(g, 'thigh' + S, S === 'R' ? -92 : -70, 0, S === 'R' ? 14 : -4); T(g, 'shin' + S, S === 'R' ? 70 : 84); } T(g, 'spine', 10, 0, -9); T(g, 'head', 0, 0, 6); T(g, 'upperarmL', -34, 0, -30); T(g, 'forearmL', -34); T(g, 'upperarmR', 2, 0, 16); T(g, 'forearmR', -86); g.position.y -= 0.37 * g.scale.y - 0.5; };
    const helper = staged({ P: (r, d) => [601 + r, 362 + d], ang: (r, d) => Math.atan2(r, d) }, 'assistant', 0, 0, 1, 1, { size: 1.12 }); arms(helper, 'R', -70, 0, -30);
    // 2. the Descent, new in its place: the middle panel alone (the wings came later), on the Arquebusiers' altar against the east wall of the south transept
    const AF = FR.frame(...cW(77.7, 26), -PLAN.cathedral.ax, -PLAN.cathedral.az), des = FR.altarpiece(AF, load('images/descent.jpg'), 3.1, 4.2, { steps: 3, lift: 1.9 });
    staged(F_DES, 'priest', -3.6, 9.2, 0.4, 1, {}); staged(F_DES, 'burgher_wife', 3.4, 8.6, -0.2, 1, { kneel: true }); staged(F_DES, 'burgher', 4.3, 7.6, -0.3, 1, { kneel: true });
    // 3. the Raising, where it was first set up: over the high altar of St Walburga's, at the head of the steps
    const W = BUILT.walb, rai = FR.altarpiece(W.altar, load('images/raising.jpg'), 6.33, 4.6, { steps: 3, lift: 1.5, y: W.rise });
    staged(F_END, 'woman_red', -3.2, 15, 0.1, 1, { kneel: true }); staged(F_END, 'man_brown', 3.4, 14, -0.1, 1, { kneel: true }); staged(F_END, 'priest', 2.6, 21, -0.5, 1, {});
    return { isabella, helper, poseHim, des, rai };
  },
};
