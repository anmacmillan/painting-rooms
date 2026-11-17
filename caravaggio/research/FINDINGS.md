# Caravaggio's Rome, about 1600: findings

Rewritten 15 Nov 2026 for `caravaggio/street.html` ("The Painter's Light"). Every claim the level makes has a source and a status: **V** verified (a source read says it), **P** partly verified (a source of another date, or a secondary one, or two that disagree), **U** unverified (nothing read supports it; built plain or left as today). Nothing here is from memory.

## Sources read, and where they are kept

| Key | What | Kept at |
|---|---|---|
| W | Wikipedia articles, fetched 15 Nov 2026 by the MediaWiki API (`prop=extracts`). `en2_`, `it2_`, `de2_`, `fr2_` are full texts with their URL inside; the unprefixed files are the first fetch | `research/wiki/*.json` |
| T | Antonio Tempesta, *Plan of the City of Rome*, plates of 1593, in the Metropolitan Museum's impression of the 1645 De Rossi reissue (acc. 1983.1027; public domain). Sheets 8 and 9 read. The plates were revised for 1645 (sheet 3 has "P. Mazarini"), so a label is evidence for 1593 only where nothing suggests a change | `sources/tempesta_met_sheet9_crop.jpg`, `tempesta_met_sheet8_crop.jpg`, `met_*.json` (object records, image URLs) |
| M | Giovanni Maggi, *Iconografia della città di Roma*, wood blocks made for the jubilee of 1625 ("a tempo di Paolo V" on its cartouche), printed by Carlo Losi in 1774 (it.W *Giovanni Maggi*). Commons `File:Pianta Maggio-Maupin-Losi.jpg` | `sources/maggi_1625_crop.jpg`, `maggi_1625_sant_agostino_zoom.jpg`, `maggi_1625_palazzo_madama_zoom.jpg`, `commons_maggi.json` |
| N | Giambattista Nolli, *Nuova Pianta di Roma*, 1748, sheet 5. Commons `File:Giovanni Battista Nolli-Nuova Pianta di Roma (1748) 05-12.JPG` | `sources/nolli_1748_sheet5_crop.jpg`, `nolli_1748_commons_crop_san_salvatore.jpg`, `commons_nolli_05.json` |
| NI | Nolli's index with dates, from the Interactive Nolli Map Website (Stanford / Oregon), `https://web.stanford.edu/group/spatialhistory/nolli/data/nolli_points_open.geojson`, cut to this quarter | `sources/nolli_index_quarter.json` |
| F1 | G. B. Falda, *Chiesa di San Luigi de Francesi et Hospedale della Natione*, 1667–69. Commons | `sources/falda_1667-69_san_luigi.jpg` |
| F2 | G. B. Falda, *Palazzo ... Giustiniani verso S. Luigi ... architettura di Gio. Fontana, la porta del Cav. Franc. Borromini*, in or after 1655 (Rijksmuseum RP-P-2016-709-56). Commons | `sources/falda_c1655_palazzo_giustiniani.jpg` |
| Ph | Photographs of the two church fronts as they stand: Commons `File:San Luigi dei Francesi - Facade.jpg`, `File:Sant Agostino Fassade.jpg` (looked at, not copied) | URLs only |
| RS | romasegreta.it street pages (a secondary, unreferenced site): short quotations | `sources/romasegreta_extracts.txt` |
| OSM | OpenStreetMap, the plan the level is built on | `rome_osm.xml` → `tools/prep_rome.py` → `map.json` |

Requests carried the User-Agent `painting-rooms-research/1.0 (educational browser game; generic client)`.

## The route, stretch by stretch

The whole line is on N (1748). T and M are bird's-eye views: they show the squares, the opening from Piazza Navona and the churches, but cannot fix a line to the metre. No stretch uses a cut of the 1930s, so nothing was re-laid; the end of the route was carried 9 m further, up Sant'Agostino's steps to its door.

| Stretch | Name on the signs | Was it there about 1600, and under what name? | Status |
|---|---|---|---|
| Piazza Navona | Piazza Navona | M: "PIAZZA NAVONA". T: "Platea Agonis". it.W *Fontana del Nettuno*: "all'epoca piazza in Agone" | V (name on a map of about 1625) |
| Corsia Agonale | Corsia Agonale (today's name) | T and M both show a gap in the east side of the piazza leading to the square before the Medici palace; N shows the lane. No period name found. N puts its east end some 8 m north of today's (my reading, give or take a few metres); not re-laid | P (lane), U (name) |
| Piazza Madama | Piazza Madama | T: "Platea Madame". M: "P. M." N 805: "Piazza Madama", about 16 m wide as today. Older name Piazza Lombarda (it.W *Palazzo Madama*, and *San Salvatore in Thermis* for 1478; RS); N 811 still uses "Piazza Lombarda" for the space to the north | V |
| Via del Salvatore | Via del Salvatore (today's name) | N: a lane between San Luigi (808) and San Salvatore in Thermis (807), on today's line. M writes "IL SALVAT." beside it. The church is recorded from 998 (it.W). The street's own name about 1600: not found | P (lane), U (name) |
| Piazza di San Luigi de' Francesi | as OSM, spelling tidied | N labels the square "S. Luigi"; M writes "S. LUIGI" at the church (consecrated 1589). Earlier Piazza Saponara (RS) | P |
| North from the square to Via di Sant'Agostino | Via della Scrofa | On N as a street. T: "La scrofa", M: "LA SCROFA", both written further north; NI 817 "Strada della Scrofa". "La Scrofa" named in documents of 1445 (RS). Whether this southern stretch bore the name about 1600: not found | P |
| Via di Sant'Agostino | Via di Sant'Agostino (today's name) | On N, from the Scrofa to the square. M writes "SANTO AGOSTIN" along a street at the church. Name about 1600: not found | P (street), U (name) |
| Piazza di Sant'Agostino | as OSM | N and M show the open space before the front with a flight of steps | P |
| Corso del Rinascimento | none (blanked) | Planned 1931, works opened 21 April 1936, replacing Via del Pino, del Pinacolo and della Sapienza (it.W; RS). It crosses Piazza Madama; north and south of the square N shows two narrow blocks where it now runs. They are not built: the gap is chained off | V (date); the gap U |
| Other names blanked (no sign) | | Via di Santa Giovanna d'Arco (N 813 "Strada del Pinaco"), Via della Dogana Vecchia (N 803 "Vicolo dell'Albergo de' Marchegiani"; "Dogana Vecchia" only from the early 1700s, RS), Via Giustiniani, Via dei Pianellari, Largo Toniolo, Via Zanardelli and the rest of `MODERN` in `tools/prep_rome.py` | V that they are unsupported |
| Via delle Coppelle (kept, off the route) | Via delle Coppelle | T: "S. Salvator dele copele" | P |

## The buildings

| Building | What the level shows | Source and status |
|---|---|---|
| San Luigi dei Francesi | Travertine front on the OSM footprint (34.4 m), two storeys of one width, five bays of pilasters, pediment with a blank shield over the middle three, great door with two columns and a pediment, two lesser doors under segmental pediments with lunettes over them, niches (empty) and roundels in the outer bays, upper middle window with a balcony, three low steps, a cross | Built 1518–89, front by Giacomo della Porta, carried out by Domenico Fontana, consecrated 8 Oct 1589; "a piece of decorative work entirely independent of the body" (en.W, it.W) **V**. Travertine, two orders, five bays, pediment with the arms of France, the doors, niches and window (RS; Ph; F1) **V** for the composition; heights scaled from F1 **P**. The four statues are by Pierre de L'Estache, born about 1688 (fr.W, en.W), so they are left out **V**. The roundels (salamanders) are on F1; their date is not stated **P**. The plain brick sides and the body's height are guesses **U** |
| Sant'Agostino | Travertine front on the OSM footprint (29.3 m): wide lower storey of four pilasters and three doors, round windows over the side doors, lettered frieze, half-gables, narrow upper storey with a round window and a pediment, scrolls at the shoulders, a straight flight of steps 2.04 m high across the whole front | Built 1479–83 by Jacopo da Pietrasanta and Sebastiano Fiorentino for Cardinal d'Estouteville; travertine said to be from the Colosseum; inscription with MCCCCLXXXIII (en.W, it.W, de.W, NI) **V**. Composition from Ph and de.W **V** as it stands today. The scrolls: it.W, fr.W and RS say Vanvitelli added them in 1746–50; de.W treats them as original; M (about 1625) draws an S-scroll at the shoulder of the front. Kept **P, disputed**. Steps: the church was "raised from the street by a fine flight" in 1479–83 (RS), M draws a flight, N a curved one; the square and stair were remodelled from 1659 (de.W). A flight existed **P**; its form and height here are guesses **U**. The fresco over the door is of the 18th century (RS) and is left out. The dome on its drum and the spired bell tower that M shows are not built |
| Palazzo Madama (the Medici palace) | A plain plastered front on the west face of the OSM footprint (45 m) in two unequal parts, three rows of plain windows, one round-headed stone doorway with a blank shield over it, wooden eaves | Caravaggio "living at the Palazzo Madama with his patron Cardinal Del Monte" on 28 Nov 1600 (en.W *Caravaggio*; it.W) **V**. The present front is Maruscelli's, finished 1642, replacing a "frontone asimmetrico" (it.W; NI gives 1635–42) **V**. T draws three storeys and a doorway with something over it; M draws a long front in two parts with the door in the longer and an oval over it. Everything else (heights, window count, colour, the door's place on the line of the Corsia Agonale) is conjecture **U**. The footprint is today's: the north wing along Via del Salvatore is of 1905 (RS) |
| San Salvatore in Thermis | A plain front 8 m wide on the south side of Via del Salvatore: a doorway, a lunette with a bust over it, a barred round-headed window either side | Recorded 998; enclosed in the palace 1642; closed and demolished 1905–07 (it.W, NI) **V**. Position from N 807 (give or take 5 m) **P**. "Un semplice portale sormontato da una lunetta con un busto raffigurante Gesù Cristo ... ai suoi lati, due finestre ad arco a tutto sesto chiuse con inferriate" (it.W, no date for that state) **P**. Width, height and eaves **U** |
| Palazzo Giustiniani | The west front (39.3 m) from F2: nine bays, basement lights, ground-floor and piano nobile windows with cornices, second floor, mezzanine, two string courses, cornice at 20.8 m, rusticated corners; a plain arched door in the sixth bay. Round the corner the same storeys are carried 22 m along Via Giustiniani | Built 1585–90 for Mons. Vento by Giovanni (and Domenico) Fontana, bought by Giuseppe Giustiniani 1590 (it.W, en.W, NI) **V**. F2 calls the front Fontana's and only the door Borromini's (about 1650), so the door and balcony are left out **P** (F2 is 55 years later, and the palace was altered through the first half of the 17th century). Where the door was before Borromini, and the whole north face, are guesses **U** |
| Piazza Navona | The east and west sides are ordinary houses. At the north end a lobed marble basin on two steps with an iron rail, no figures. In the middle a long stone trough | Basin: commissioned from della Porta 1574, made 1575–76, "vasca marmorea a pianta mistilinea poggiata su due gradini", railed soon after; figures added 1878 (it.W *Fontana del Nettuno*, en.W) **V**; its exact outline and size here **U**; its position is mirrored from the Fontana del Moro about the centre, since OSM has no outline for it **P**. Trough: drawn in the middle of the piazza by both T and M **P**. Four Rivers fountain and obelisk 1651, Sant'Agnese begun 1652, Palazzo Pamphilj 1644–50 (en.W, it.W): left out or raised as ordinary houses **V**. San Giacomo degli Spagnoli's front on the piazza (T, M; of 1500, RS) is over 80 m from the route and is not built |
| Collegio Germanico (south side of Via di Sant'Agostino) | Ordinary houses | A 15th-century building, the college there from 1573, rebuilt 1634 (RS, NI) **P**; appearance **U** |
| Arco di Sant'Agostino | Left out | The arch joined the college's building of 1634 to the Palazzo dell'Apollinare (RS); N 516 has it. **P** that it is later than 1600 |
| Convent of Sant'Agostino, Palazzo Patrizi, Palazzo di San Luigi, the house of the Calling | Plain walls or ordinary houses | Convent rebuilt by Vanvitelli 1746–50 (it.W); Patrizi enlarged 1605–11 (NI). Their state about 1600 **U** |

## The three paintings and their stagings

| Statement | Source | Status |
|---|---|---|
| The Calling of Saint Matthew, 1599–1600, Contarelli Chapel, San Luigi dei Francesi, where it remains; contract 23 July 1599, final payment July 1600; del Monte obtained the commission | en.W *The Calling of Saint Matthew*, *Contarelli Chapel* | V |
| Its staging in a ground-floor room of a house on the east side of the square | Invented; said on the end card | n/a |
| Madonna di Loreto, about 1604–06, Cavalletti Chapel, Sant'Agostino; the barefoot Virgin with her naked child in a doorway before two kneeling pilgrims | en.W, it.W *Madonna dei Pellegrini* | V |
| She leans on the jamb of a house door with her legs crossed and bends towards them; the first pilgrim is "scalzo li piedi, e le gambe" (Bellori) | it.W *Madonna dei Pellegrini* | V (so the kneeling man has breeches to the knee and bare calves and feet) |
| Its staging at the open door of Sant'Agostino | Invented; said on the end card | n/a |
| Medusa: painted on a shield of poplar; commissioned by del Monte as a gift for Ferdinando I de' Medici; a self-portrait; now in the Uffizi; "often dated 1597" | en.W *Medusa (Caravaggio)* | V |
| The cardinal took it to Florence himself; delivered 25 July 1598, as the Medici Guardaroba records | it.W *Scudo con testa di Medusa* | V (one source) |
| The packing at the palace door, the crate, the two servants, the servant's line | Invented; said on the end card, with the fact that 1598 is two years before the level's date | n/a |
| The painter "with a sword at his side and a servant following him" (a notice of 1604 about three years earlier); arrested 4 May 1598 for carrying a sword | en.W *Caravaggio*, *Medusa* | V |

## Still unverified, or known to be wrong for 1600

- The ordinary house fronts are the Florence level's pictures (Tuscan arcades and awnings). They are not Roman.
- Heights of every building other than the three fronts measured from prints or photographs.
- That a silver scudo was struck in Rome about 1600 (en.W *Roman scudo* gives no date).
- The line of the Corsia Agonale to the metre, and the two blocks that closed Piazza Madama to north and south on N.
- The Tempesta labels are read from the 1645 state of the plates.

## Images in the level (Wikimedia Commons, marked Public domain by the Commons API on 15 Nov 2026; `research/images.json`)

| File | Commons file |
|---|---|
| `images/medusa.jpg` | File:Caravaggio - Medusa - Google Art Project.jpg (the white ground outside the shield painted out) |
| `images/calling.jpg` | File:Caravaggio, Michelangelo Merisi da - The Calling of Saint Matthew - 1599-1600 (hi res).jpg |
| `images/loreto.jpg` | File:Michelangelo Merisi da Caravaggio - Madonna di Loreto - WGA04156.jpg (621 px wide) |

## How it is built

- `tools/prep_rome.py`: OSM → `map.json` (455 buildings; the arch and the obelisk footprints skipped; unsupported street names blanked).
- `caravaggio/fronts.js`: the named fronts, in travertine and plaster painted on a canvas; each front is set out in metres along its OSM wall.
- `tools/blender/figure.py` (world `caravaggio`): twelve figures; `child` and the pilgrim's breeches added in this pass. Clothes: `tools/blender/tex_caravaggio.py`.

## The teaching (added 17 Nov 2026): one light, high and from one side

What the level now makes her do: at each of the three pictures the scene stands unlit until the boy hangs his lantern. A stool low in front gives a flat, shadowless view and the painter's refusal; the tall pole at the side gives the one hard shaft, and only then does the scene melt into the painting. Sources fetched 17 Nov 2026 by the MediaWiki API (`prop=extracts`), kept in `research/teach/`.

| Statement | Source | Status |
|---|---|---|
| He made chiaroscuro "a dominant stylistic element, darkening the shadows and transfixing the subject in a blinding shaft of light"; the manner is called tenebrism, "the shift from light to dark with little intermediate value" | en.W *Caravaggio* (`teach/en_Caravaggio.json`), https://en.wikipedia.org/wiki/Caravaggio | V (secondary) |
| Tenebrism: "violent contrasts of light and dark, and where darkness becomes a dominating feature of the image" | en.W *Tenebrism* (`teach/en_Tenebrism.json`), https://en.wikipedia.org/wiki/Tenebrism | V (secondary) |
| "dark subjects dramatically lit by a shaft of light from a single constricted and often unseen source" as a device, with Caravaggio "crucial in developing the style of tenebrism" | en.W *Chiaroscuro* (`teach/en_Chiaroscuro.json`), https://en.wikipedia.org/wiki/Chiaroscuro | V (secondary) |
| In the Calling "l'unica fonte di illuminazione è una lama di luce che proviene dall'angolo in alto a destra, la cui origine si trova all'esterno del riquadro"; the picture is "la prima in cui Caravaggio fa un uso ragionato della luce" | it.W *Vocazione di san Matteo* (`teach/it_Vocazione_di_san_Matteo.json`), https://it.wikipedia.org/wiki/Vocazione_di_san_Matteo | V (secondary) |
| In the studio "Caravaggio posizionava lanterne in modo che i modelli fossero illuminati solo in parte e a luce radente" | it.W *Caravaggio* (`teach/it_Caravaggio.json`), https://it.wikipedia.org/wiki/Caravaggio | P: one unreferenced sentence in a secondary source. The end card says "he is said to". Bellori's own account of the high light in a closed room was looked for (it.wikisource, it.W, en.W searches) and not found in a readable text, so it is not quoted |
| A lamp low and in front gives a flat picture without cast shadows | The game's own demonstration (it is what the renderer shows); no source claims Caravaggio said so | the game's own |
| The pole with its pulley, the stool, hoisting a lantern in the street, the painter's words | Invented | the game's own |

Simplified: the lantern stands for whatever lit his studio; the shaft in each staging is placed where the level's first build put it (high left for Medusa and the Madonna, high right for the Calling, as in the painting), and the lantern on the pole is drawn near that place, not exactly at it. After the picture the boy takes the lantern down and the scene goes dark again.
