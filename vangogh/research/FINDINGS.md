# Van Gogh's Arles, September 1888: findings

Written 15 Nov 2026 for `vangogh/street.html` ("The Stars over Arles"). Every claim the level makes has a source and a status: **V** verified (a source read says it), **P** partly verified (a secondary source only, or a source of another date, or the level goes a step beyond it), **U** unverified (nothing read supports it: a guess, marked as such on the end card), **I** invented for the game.

## Sources

| Key | What | Kept at |
|---|---|---|
| L676, L677, L678, L691, L693 | Vincent van Gogh, *The Letters* (Van Gogh Museum and Huygens ING), vangoghletters.org, letters 676 (to Theo, 8 Sept 1888), 677 (to Theo, 9 Sept 1888), 678 (to Willemien, 9 and about 14 Sept 1888), 691 (to Theo, on or about 29 Sept 1888), 693 (to Eugène Boch, 2 Oct 1888). The page text as rendered on 15 Nov 2026: the **original French** with the edition's letter number and date. The edition's English translation was not captured; the English lines in the game are translations from this French, agreeing with those quoted on en.wikipedia where the same sentence is quoted there | `research/letters/let*_fr.txt` |
| W | Wikipedia articles fetched 15 Nov 2026 by the MediaWiki API (`prop=extracts`), each file with its URL: `en_*` English, `fr_*` French | `research/wiki/*.json` |
| OSM | OpenStreetMap, API 0.6 map call, bbox 4.6225,43.6762,4.6340,43.6848, fetched 15 Nov 2026 | `research/arles_osm.xml` → `map.json` by `tools/prep_arles.py` |
| C | Wikimedia Commons: the five paintings, and reference pictures looked at for the fronts and the figures | `research/images.json` (file, page URL, original URL, licence), `research/commons_search.json`, `images/`, `research/ref/` |

Not consulted (so nothing rests on them): the Van Gogh Museum's and Musée d'Orsay's own catalogue pages, any plan of Arles of the 1880s, the cadastre, patrimoine.ville-arles.fr, Hulsker or the de la Faille catalogue. Starry Nightrider was not opened, fetched or read at any point.

## The brief's beliefs, checked

| Belief | Finding | Status |
|---|---|---|
| He lived in Arles from February 1888 to May 1889 | Arrived 21 February 1888 (W en_arles; en_vangogh "February 1888"); entered the asylum at Saint-Rémy 8 May 1889 (W en_vangogh) | V (secondary) |
| He rented the Yellow House at 2 Place Lamartine | Lease of four rooms signed 1 May 1888, the right wing of 2 Place Lamartine (W en_yellow_house, en_vangogh, fr_maison_jaune) | V (secondary) |
| The Yellow House / The Street, September 1888 | Sketch and description in L691, on or about 29 Sept 1888: "la maison et son entourage sous un soleil de souffre, sous un ciel de cobalt pur". A daylight picture. Van Gogh Museum, Amsterdam (W) | V |
| The building was damaged by bombing in 1944 and demolished | "severely damaged in a bombing raid by the Allies on June 25, 1944, and was later demolished" (W en_yellow_house; fr_maison_jaune the same) | V (secondary) |
| The Night Café shows the Café de la Gare at 30 Place Lamartine | So W en_night_cafe (run by Joseph-Michel and Marie Ginoux). L676 (8 Sept) describes the finished picture; L677 (9 Sept) the "endroit où l'on peut se ruiner, devenir fou, commettre des crimes"; L691: "Le café de nuit que j'ai peint n'est pas dans le tableau, il est à gauche du restaurant". The house number rests on Wikipedia alone | V (number: secondary) |
| Café Terrace at Night, September 1888, a café on the Place du Forum which still exists | L678 describes it ("l'extérieur d'un café le soir ... Une immense lanterne jaune"); L693 names "la Place du forum". Painted between 9 and 16 Sept (W fr_terrasse). Kröller-Müller Museum (W). The café stands, restored about 1990 and painted yellow then; "selon toute vraisemblance le café à cette époque n'était pas jaune, sauf la nuit à cause de l'éclairage" (W fr_terrasse). He set up at the north-east corner of the square looking south (W en_cafe_terrace) | V |
| Starry Night Over the Rhône, September 1888, Musée d'Orsay, on the bank a short walk from the Yellow House | L691 and L693 describe it. "only a one or two-minute walk from the Yellow House"; view to the south-west; Orsay (W en_rhone, fr_nuit_rhone) | V |
| He painted the postman Joseph Roulin and his family, including the schoolboy Camille, late in 1888 | The family portraits are of the winter of 1888; a letter of early December: "the family of the postman whose head I had done previously" (W en_roulin). Camille born 10 July 1877, so eleven in September 1888 (W en_roulin). L691: "Mon ami le facteur reste au fond de la rue à gauche entre les deux ponts du chemin de fer" | V (secondary for the dates) |
| The Starry Night (June 1889, MoMA) was painted at Saint-Rémy, not Arles | Painted by about 18 June 1889 at the asylum of Saint-Paul-de-Mausole, the view from his east-facing window with an imaginary village; MoMA (W en_starry_night) | V (secondary) |
| The candles-on-the-hat story is unsupported | No candle on a hat in L676, L677, L678, L691 or L693, nor in W en_vangogh. The one candle in these letters is in L678 and is a remark about colour ("une simple bougie déjà nous donne les jaunes, les orangés les plus riches"). L691 says how he did light the Rhône picture: "peint la nuit même, sous un bec de gaz". Where the story comes from was not traced | Not found; **not used** |

## The painter's words in the game

All five are his, from the French of the letters; the English is a plain translation.

| Line in the game | French | Letter |
|---|---|---|
| "I go outside at night to paint the stars." | "alors je vais la nuit dehors pour peindre les étoiles" | 691, to Theo, on or about 29 Sept 1888 |
| "The starry sky, painted at night itself, under a gas jet." | "le ciel étoilé peint la nuit même, sous un bec de gaz" | 691 |
| "There: a painting of night without black." | "Voila un tableau de nuit sans noir." | 678, to Willemien, 9 and about 14 Sept 1888 |
| "It amuses me enormously to paint the night on the spot." | "Cela m'amuse enormement de peindre la nuit sur place." | 678 |
| "A place where one can ruin oneself, go mad, commit crimes." | "un endroit où l'on peut se ruiner, devenir fou, commettre des crimes" | 677, to Theo, 9 Sept 1888 |

He says them in a different order and on one night; that is the game's (I). The postman's line and the townspeople's five lines are invented (I) and the end card says so.

## The route (913 m on the plan)

The brief asked for 400 to 600 m. The straight line from the Place du Forum to Place Lamartine is already about 550 m, and the walk by real streets to the river is about 910 m, so the level is longer than asked. Nothing was shortened.

| Stretch | On the plaques | 1888? | Status |
|---|---|---|---|
| Rue du Palais mouth, east side of the Place du Forum | Place du Forum | Named in L693 | V |
| Rue de la Place, Rue du Sauvage | the same | Today's lines and names (OSM). The names were not checked against a plan of the 1880s. The town revised its street names in February 1879 (W fr_histoire) | lines P, names U |
| Rue du 4 Septembre | the same | As above; the name commemorates 4 September 1870, so it is not older than that | lines P, name U |
| Place Voltaire, Rue Voltaire, Rue de la Cavalerie | the same | As above. This is the part of the Cavalerie quarter spared in 1944 as far as Place Voltaire; north of it "les reconstructions de l'après-guerre" (W fr_quartier_cavalerie) | lines P, names U |
| Porte de la Cavalerie | (a place on the mini map) | Thirteenth-century gate, rebuilt in the sixteenth, restored in the eighteenth; "ses deux tours rondes latérales furent partiellement endommagées lors de la Révolution française, et en 1877" (W fr_cavalerie). The towers and the wall stubs stand on OSM's footprints. Whether anything spanned the gap in 1888 is not known: shown open, as now | towers V, state in 1888 U |
| Place Lamartine | (place) | Named in every source for the Yellow House; in 1888 it had public gardens ("un jardin public tres joli", L678), now a roundabout (W fr_quartier_cavalerie). Today's roads and buildings north of the gate are removed (`cleared` in prep_arles.py). The posts and rails beside the way stand in for the garden railings | V that it was gardens; layout U |
| Avenue de Montmajour | the same | The avenue to the right of the Yellow House "runs down to the two railway bridges" (W en_yellow_house); OSM calls it Avenue de Stalingrad | V (secondary) |
| The bank of the Rhône | none | Stone quays built 1856 to 1868 after the floods (W fr_histoire). The bank is traced by hand along the quay walls and quay roads in OSM, because the river's own outline lies outside the extract. The landing at the end is this level's shape, cut to the foreground of the picture | quay V, bank line P, landing I |
| Railway | (an outline beyond the Yellow House) | Station and Avignon to Marseille line 1848; Lunel line and its Rhône bridge 1868 (W fr_gare, fr_histoire) | V |
| Gas | lamps | "1881 : éclairage des rues par une usine à gaz" (W fr_histoire); "le gaz" in L691 and L693. Where each lamp stood is not known: they are set every 24 m | V that there was gas; positions I |
| Pont de Trinquetaille | (an outline on the river) | Iron bridge opened April 1875, destroyed 15 August 1944, rebuilt 1950-51 (W fr_trinquetaille, fr_arles) | V; its look here is a bare line |

Street names blanked: every street off the walk (none was checked), and on principle those commemorating later people or dates (`MODERN` in prep_arles.py).

## Buildings

| Building | What the level shows | Source and status |
|---|---|---|
| The café, Place du Forum | The west wall of its real block (OSM footprint; OSM's marker "Le Café la Nuit" is inside it). Awning on iron rods, the great lantern on a bracket, boarded terrace with round tables, shuttered floors and a balcony, a blue shop front at the near end | The painting; Commons photograph of 2015 (`ref/cafe_2015.jpg`). The wall is pale plaster turned sulphur by the lamp, after W fr_terrasse. Window count and the shop are read off the painting: P |
| Ordinary houses | Today's footprints (OSM), each wall a three-storey Provençal front with shutters | Fronts painted by `tools/blender/tex_vangogh.py`: generic, I. Footprints north of Place Voltaire are largely post-1944: P |
| Porte de la Cavalerie | Two round towers 9.4 m high and the walls beside them, in coursed stone | OSM footprints; Commons photographs (`ref/cavalerie_a.jpg`, `_b.jpg`). Heights by eye: P |
| The Yellow House | A pair of two-storey houses under low gables, yellow, green shutters and door, the grocer's pink awning on the left half, his lit window on the corner upstairs, a taller house behind | The painting; W en_yellow_house for which rooms were his. Its site is OSM's marker "La Maison Jaune de Van Gogh"; the line of the row (due east-west) and every dimension are guesses: look P, position U |
| The restaurant | Pink, green shutters, a tree before it | L691: "la maison à gauche est rose à volets verts, celle qui est ombragée par un arbre, c'est là le restaurant où je vais diner tous les jours" (en.wikipedia's translation says "yellow"; the French says pink). No. 28, the widow Venissac's (W). Its front otherwise I |
| Café de la Gare | A house left of the restaurant with its ground floor open on the room of the picture | Position from L691 ("à gauche du restaurant"). Front I. The room is the painting: red walls, green ceiling, yellow boards, billiard table and its shadow, four lamps (L676: "4 lampes jaune citron à rayonnement orangé et vert"), clock at a quarter past twelve (W fr_cafe_nuit), counter, bottles, nosegay, the landlord in white, sleepers and a couple. An open front is the game's device |
| Town skyline, far shore | Flat outlines; towers where OSM has Saint-Julien and Saint-Trophime | Schematic: I |

## Figures (tools/blender/figure.py, world 'vangogh')

| Figure | Dress | Source |
|---|---|---|
| The boy (Camille Roulin) | Blue smock, blue cap | The Schoolboy (Camille Roulin), 1888 (`ref/camille.jpg`): P. That he ran errands at night is I |
| The painter | Straw hat, blue working jacket and trousers, red beard, a canvas and folded easel on his back | The Painter on the Road to Tarascon, 1888, destroyed in the Second World War (W en_tarascon; `ref/painter_tarascon.jpg`), a daylight picture of July or August: P for what he wore at night in September |
| The postman | Dark blue uniform with gold buttons, cap, large beard | Portrait of the Postman Joseph Roulin (`ref/roulin.jpg`): P |
| The landlord | White | The Night Café; L676 "Les vêtements blancs du patron": V |
| The lovers | A man in blue with a straw hat, a woman in a shawl | L691 "Deux figurines colorées d'amoureux à l'avant plan"; their dress read off the painting: P |
| Townspeople, café-goers | Dark jackets and broad hats, blue smocks and caps, dark dresses with a white fichu, a shawl | General impression of the 1880s and of the figures in the paintings; no costume source read: U |

## The sky and the water

- The Great Bear is set over the river to the south-south-west because he painted it there. It cannot be seen in that direction (W en_rhone). Its seven stars are placed by eye from the painting.
- Colours follow L691: sky "bleu vert", water "bleu de roi", ground "mauve", town "bleue et violette", gas "jaune", its reflections "or roux ... jusqu'au bronze vert", the Bear "vert et rose".
- Haloes of dashes round the stars are closer to his manner of 1889 than of 1888, when he gave them petals (W en_rhone, fr_nuit_rhone); here they have both. This is the level's style, not a claim.

## Images

`research/images.json` lists each file with its Commons page and original URL. In `images/`: `terrace.jpg`, `nightcafe.jpg`, `rhone.jpg` (the level's card image), `yellowhouse.jpg`, `starrynight.jpg`, each 1400 px wide, public domain.

## Textures

All painted by `tools/blender/tex_vangogh.py` with PIL (clothes, four house fronts, cobbles, plaster, stone). The one borrowed file is `tex/drapery.jpg`, the folded cloth copied from `florence/tex/drapery.jpg` and used only as light and shade under the painted clothes. No Florence house front or paving is used. Faces and hair are the shared ones of the Munch level (`munch/tex`).

## Changes from the brief

1. The route is 913 m, not 400 to 600 m (above).
2. Four pictures, not three: The Yellow House is a short fourth stop between the gate and the Night Café. It is a daylight picture seen here at night, and the plate says "painted by day".
3. The Night Café was chosen for the staged interior on Place Lamartine; the Yellow House is built as a front.
4. The painter never calls out: when the boy falls behind he waits and beckons.
