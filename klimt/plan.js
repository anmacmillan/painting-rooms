/* The plan of the level: the line of the walk and everything set on it, each with what it rests on. Metres from a point on Karlsplatz (48.2000 N, 16.3697 E);
   x east, z south (tools/prep_vienna.py, from OpenStreetMap). Sources: research/FINDINGS.md.
   The walk: from the steps of the Secession (Friedrichstrasse), east across Karlsplatz past Otto Wagner's two Stadtbahn pavilions, along the south side of the
   Kuenstlerhaus and the Musikverein, into the Lothringerstrasse, across the Schwarzenbergplatz and up to the ground where the Kunstschau of 1908 stood
   (today the Konzerthaus). */
export const PLAN = {
  /* the Secession: the middle of its street front (the south-east side of the OpenStreetMap footprint) and the way that front looks */
  secession: { front: [-279.2, -42.3], n: [0.683, 0.730] },
  /* the two pavilions: centres of today's footprints; they face each other. Both were taken down and put up again 2 m higher after the underground was built */
  pavilions: [{ c: [43, -31], n: [0.937, 0.349] }, { c: [86, -15], n: [-0.937, -0.349] }],
  karlskirche: { c: [155, 190], n: [-0.42, -0.91] },
  route: [[-269.6, -32], [-240, -26], [-200, -20], [-80, -20], [20, -14], [64, -13], [110, 6], [200, 24], [285, 31], [323, 30], [391, 4], [422, -7], [509, -40], [527, -66], [545, -72], [604, -72]],
  /* the Kunstschau: one room of it, on the empty building plot between the Lothringerstrasse and the Heumarkt. Its plan is the level's own */
  room: { x0: 552, x1: 612, z0: -84, z1: -60, door: [-75.2, -68.8], h: 8.6 },
  adele: { c: [574, -83.6], size: 6, y0: 0.5, eye: [574, -68], dir: [0, -1], kid: [0, 10.4], range: 3.1, cam: [[0, -1.5, 3.2], [0, 15.6, 3.0], 32], man: [-4.6, 13.4],
    title: 'Portrait of Adele Bloch-Bauer I', line: 'Gustav Klimt, 1907 · oil, gold and silver leaf on canvas · Neue Galerie, New York', img: 'images/adele.jpg' },
  kiss: { c: [611.6, -72], size: 7, y0: 0.5, eye: [595.6, -72], dir: [1, 0], kid: [0, 10.2], range: 3.4, marks: [-2.3, 2.3], cam: [[0, -2.4, 3.5], [0, 16, 3.3], 34], man: [-5.4, 13.6],
    title: 'The Kiss', line: 'Gustav Klimt, 1908 · oil, gold, silver and platinum leaf on canvas · Belvedere, Vienna', img: 'images/kiss.jpg' },
  /* where the tram lines cross the walk: today's rails (OpenStreetMap). That trams ran on just these lines in 1908 was not checked */
  trams: [[-72, -20], [386, 6]],
  market: [[-262, -22], [-225, -24]],
  cafe: [[232, 27], [300, 31]],
  hat: [440, -14],
  places: [{ n: 'The Secession', x: -272, z: -34 }, { n: 'The Stadtbahn pavilions', x: 64, z: -13 }, { n: 'The Musikverein', x: 226, z: 27 }, { n: 'Schwarzenbergplatz', x: 391, z: 4 }, { n: 'The Kunstschau', x: 548, z: -72 }],
  titleCam: [[-246, 5.5, -8], [-284, 9.5, -47]],
  /* every word spoken is the game's own (the end card says so) */
  words: {
    start: 'The wind has got Herr Klimt’s gold leaf, and his patterns too! All down the square! Catch them and run to the Kunstschau!',
    town: ['Grüß Gott!', 'Küss die Hand, Fräulein.', 'Is that real gold?', 'Mind the tramway, child!', 'To the Kunstschau? Straight on, by the Heumarkt.', 'Such a wind today!', 'They say Klimt has covered a lady in gold.', 'Servus!', 'Sixty years our Emperor has reigned.', 'A Krone for the Kunstschau? For pictures?', 'Have you seen the golden cabbage on the Secession?'],
    market: 'Achtung! My cabbages!', waiter: ['Vorsicht! Hot coffee!', 'Aber Fräulein! My Melange!'], hat: 'My hat! Catch it!', hatThanks: 'Danke, Fräulein! Küss die Hand!', tram: 'Bim! Bim!',
    klimtAdele: 'There you are! She is all drawing still. Run along her with the gold!', klimtAfterAdele: 'Gold all round her, and only her face is flesh. Now my lovers: they have nothing to wear!',
    klimtKiss: 'Give each of them the right pieces.', no: ['Nein, nein. It will not stay on.', 'Look what is drawn on the robe.'], yes: ['Ja!', 'So!', 'Schön!', 'Genau!'], done: 'Fertig. Now it is a picture.',
    goals: { run: 'Catch the gold leaf and the pattern pieces · run to the Kunstschau', adele: 'Run to and fro along the picture to lay the gold', kiss: 'Carry each piece to the figure it belongs to' },
  },
};
