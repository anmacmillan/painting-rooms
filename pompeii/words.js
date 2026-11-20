/* Every word the level shows, and where things stand. Each fact is sourced in research/FINDINGS.md; what is marked "ours" there is the game's own.
   Pliny is quoted in J. B. Firth's translation of 1900 as given at attalus.org (research/texts/pliny_6_16_en.txt, pliny_6_20_en.txt); Vitruvius in M. H. Morgan's of 1914. */
const PLINY = 'Pliny the Younger, who watched from Misenum, across the bay';
export const W = {
  dryTime: 165,      /* seconds of play before this morning's plaster dries (ours: tuned to the shortened 360 m run) */
  room: { at: [66.2, -136.8], turn: 0, photoCam: { pos: [-2.75, 1.5, 2.45], look: [1.3, 1.05, -2.2], fov: 62 } },
  /* the two counter pickups on the way home (Red comes from Terentius Neo's door at s = 26 m, making 3 colours in all) */
  picks: [
    { id: 'blue', p: [-113.0, -54.0], side: -1, word: 'blue', shop: 'the Attii, colour makers', sign: 'ATTII', title: 'Blue: cooked in a furnace at Puteoli', emoji: '🔵', also: ['green', 'ochre', 'red'], fig: 'man_beard', line: 'Blue is cooked from sand, copper and soda at Puteoli — hurry, look at that cloud!' },
    { id: 'black', p: [57.0, -73.8], side: -1, word: 'black', shop: 'Asellina’s bar', sign: 'ASELLINA', title: 'Black: soot from the hearth', emoji: '⚫', also: ['ochre', 'white'], fig: 'woman', line: 'Soot from my hearth — that’s all three colours! Straight ahead to your door!' },
  ],
  stones: [[[-69, 1.2], true], [[-18.9, -28.8], true], [[36, -61], true]],
  fountains: [
    { p: [-155.8, -86.0], side: 1, n: 'the fountain on the Via Stabiana' },
    { p: [-66.0, -1.0], side: 1, n: 'the fountain at the crossroads' },
    { p: [31.1, -63.2], side: -1, n: 'the fountain by IX 11, 1' },
  ],
  cartRange: [205, 312], cartWarn: 'A mule cart in the ruts — up on the pavement!', cartHit: 'Mind the mule!', cartPass: 'Past the cart',
  bump: ['Mind where you run!', 'Careful, child!', 'Look out!'],
  cushionAt: 252, cushionCall: 'Child! Tie this cushion on your head!', cushionLine: 'Tie it on with the cloth. The pumice stones are light, but they do not stop.', cushionGot: 'A cushion tied against the stones', stoneHit: 'A pumice stone!', stoneSafe: 'The cushion took it',
  introSecs: 6.8,
  intro: [
    { t: 0.4, who: 'master', text: 'Fresh plaster for the middle picture! Colour only holds while it is wet — bring red, blue and black from town before it dries!', secs: 5.8 },
  ],
  guideLines: {
    start: 'This way! Terentius Neo has the red — right ahead!',
    afterNeo: 'Look at the mountain! Follow me down the Via Stabiana for the blue!',
    attii: 'Here are the Attii — grab the blue!',
    cross: 'Turn left here! Straight home down the Via dell’Abbondanza!',
    dog: 'Mind the guard dog — then Asellina’s bar for black!',
    asellina: 'Black soot at Asellina’s — grab it, then run home!',
    home: 'Our door is right here — hurry while the plaster is wet!',
  },
  dog: { title: 'The guard dog', line: 'Mosaic in the doorway of the House of Paquius Proculus (I 7, 1), Via dell’Abbondanza · still in place', quote: 'A picture set stone by stone', bark: 'Rrrowf! Rrrowf!' },
  neo: { title: 'Terentius Neo and his wife', line: 'Painted on a wall of his house, VII 2, 6, on the Via Stabiana · Naples, Museo Archeologico Nazionale, inv. 9058', quote: 'She holds wax tablets and a pen; he holds a scroll' },
  wall: { title: 'The room the painters left', line: 'House of the Painters at Work (IX 12, 9), Pompeii · the middle picture was never painted', quote: '“These colours, when they are carefully laid on stucco still wet, do not fade but are permanent.” Vitruvius 7.3',
    wetLine: 'Still wet! Good girl. The black first, for the outline.', dryLine: 'Too late: it has dried. Colour will not hold on dry plaster. It must be cut out and laid again.', quakeLine: 'The roof! Stones on the roof!', leaveLine: 'Put the pots down. Leave the wall. Out, all of us.' },
  /* The eruption sequence from Pliny 6.16 and 6.20 (Firth 1900). Beat 0 turns the view to the mountain; beats 1-3 appear live as she runs home so she never loses her bearings. */
  beats: [
    { e: 0, secs: 5.8, tilt: 28, fov: 72, title: 'About the seventh hour', line: PLINY, quote: '“In likeness and form it more closely resembled a pine-tree than anything else, for what corresponded to the trunk was of great length and height, and then spread out into a number of branches.”' },
    { e: 1.35, secs: 5.5, live: true, title: 'The cloud comes over the town', line: PLINY, quote: '“At times it looked white, and at other times dirty and spotted, according to the quantity of earth and cinders that were shot up.”' },
    { e: 2.05, secs: 5.5, live: true, title: 'Pumice', line: 'Pliny, of his uncle’s ships crossing the bay towards the mountain', quote: '“Ashes were beginning to fall … hotter and in thicker showers as they approached more nearly, with pumice-stones and black flints, charred and cracked by the heat of the flames.”' },
    { e: 2.85, secs: 5.5, live: true, title: 'Night at midday', line: 'Pliny, on the road out of Misenum the next morning', quote: '“The blackness of night overtook us, not that of a moonless or cloudy night, but the blackness of pent-up places which never see the light.”' },
  ],
  notices: [
    { t: 'CN·HELVIVM·SABINVM·AED|D·R·P·O·V·F  AEGLE ROGAT' }, { t: 'ASELLINAS ROGANT|NEC SINE ZMYRINA', black: true }, { t: 'HOLCONIVM·PRISCVM·II·VIR|FVLLONES VNIVERSI ROG' },
    { t: 'P·PAQVIVM·PROCVLVM|II·VIR·I·D  VICINI CVPIDI FACIVNT' }, { t: 'CN·HELVIVM·SABINVM·AED|MARIA ROGAT', black: true }, { t: 'HEDONE DICIT|ASSIBVS HIC BIBITVR' },
  ],
};
W.end = `
<p><b>What is known.</b> Vesuvius destroyed Pompeii in AD 79. Pliny the Younger, then in his eighteenth year, watched from Misenum, across the bay and about 21 kilometres from the mountain, and years later wrote two letters about it to the historian Tacitus (Letters 6.16 and 6.20): everything in quotation marks in this level is his, in J. B. Firth’s translation of 1900, and none of it was written in Pompeii. He says the cloud was seen “about the seventh hour”, about one in the afternoon. Volcanologists read the layers the same way he tells it: a column that rose 14, then 26, then 32 kilometres; the wind carrying it south-east, over Pompeii; pumice falling there at about 15 centimetres an hour, until roofs gave way within six hours; and the next morning burning clouds of gas and ash that ran down the mountain and killed everyone still in the town. In the two thirds of the town dug so far 1,044 bodies have been counted: 394 in the pumice, 650 in the ash of the morning (Giacomelli and others, 2003).</p>
<p>The house you ran home to is real: the House of the Painters at Work (IX 12, 9), behind the bakery of the Chaste Lovers. Its great room was being repainted that day. The walls were finished from the top down as far as the coloured fields; the picture in the middle is only an outline, and pots of colour and the remains of brushes lay where they were put down. The other two works are real too, and were found where you met them: the guard dog is still on the floor of Paquius Proculus’ doorway, and the portrait of Terentius Neo and his wife was cut from a wall of his house on the Via Stabiana and is in the museum at Naples. The Attii made and sold colours on the Via Stabiana (IX 2, 11–12). Vitruvius, an architect writing a century earlier, gives the rule the level turns on (“laid on stucco still wet”), says blue was made in a furnace at Puteoli, that black was soot, and that the costly colours were “furnished by the employer, not by the contractor”. The notices on the walls are real election notices from this street: “I beg you to make Gnaeus Helvius Sabinus aedile: Aegle asks it.”</p>
<p><b>What is argued.</b> The day. Pliny’s text as copied says 24 August; autumn fruit, heavier clothes and a charcoal note dated 17 October, found in 2018, point to about 24 October, and many archaeologists now prefer the autumn; nobody can say what day that note was written. What the mountain looked like before: the title picture, from a household shrine in Pompeii, shows the wine god beside a steep green mountain that may be Vesuvius. Whether Pompeian painters worked in a fresh patch of plaster each day, as later fresco painters did, is disputed (some see no day-joins in walls of this date): what is certain is that the picture in the middle of a wall was often plastered and painted separately. And who the couple are: the name Terentius Neo comes from a notice on the house; the picture was long given to Paquius Proculus by mistake.</p>
<p><b>The ground.</b> The streets, their crossings and their widths are OpenStreetMap’s survey of the excavation; the names are the excavators’, not the Pompeians’. The run begins on the Via Stabiana just south of Terentius Neo’s door and follows the Via Stabiana and Via dell’Abbondanza home to IX 12, 9: about 360 metres on the real street plan. Everything above the wall stumps is ours: upper floors, roofs, which bay is a shop, and the Fourth-Style fresco panels on the fronts (painted after the surviving interior walls of Pompeii so the street reads in the manner of Roman wall painting). The house is really entered from a side lane (IX 12, A) that the level does not build, so the room is shown from inside only. Doors are placed from their mapped houses, good to ten metres or so; Asellina’s bar by the order of the doors. The fountains at the crossroads, by IX 11, 1 and on the Via Stabiana are attested; the stepping stones are put where side streets come in.</p>
<p><b>What is ours.</b> The girl, the workshop boy who guides her, the painters and every word they say; the errand, and Terentius Neo keeping the owner’s account; black from Asellina’s hearth; the cart, the people in the street and the dog’s barking; the woman with the cushion (Pliny’s uncle’s party tied pillows on their heads, but that was at Stabiae). The clock: about six hours pass in two minutes, the plaster dries far faster than plaster does, and the pumice lies ankle-deep where by evening it lay to the waist. The mountain is drawn at its true distance (9.5 kilometres, north-west) and the cloud at its true height. Nobody knows who the painters were, how many, or whether they got out.</p>
<p class="small">Pictures, via Wikimedia Commons: the unfinished room, by “ho visto nina volare”, 2012, CC BY-SA 2.0; the guard-dog mosaic and the Bacchus painting (Naples, from the House of the Centenary), by Carole Raddato, CC BY-SA 2.0 (creativecommons.org/licenses/by-sa/2.0), all three reduced in size; Terentius Neo and his wife, by Jebulon, CC0. The two faces in the doorway are cut from that painting. Every other texture was painted by a script for this level. Plan © <a href="https://www.openstreetmap.org/copyright" style="color:inherit">OpenStreetMap</a> contributors. Heights: EU-DEM v1.1, European Union, Copernicus Land Monitoring Service. Sources for every statement: <a href="research/FINDINGS.md" style="color:inherit">research/FINDINGS.md</a>.</p>`;
