# Pompeii, the day of the eruption, AD 79: what the level rests on

Level: `pompeii/street.html`, "While the Plaster Is Wet". Everything below was read on 17 November 2026 and saved under this folder; `sources.json` indexes
the saved files with their URLs and the exact words relied on. Status words: **verified** (read in a saved source), **disputed** (sources disagree; the level says so),
**unverified** (no source found; marked on the end card or left out), **ours** (the game's own invention).

Three sites could not be reached all session (pompeiisites.org, the Parco Archeologico's own pages; gutenberg.org; Perseus): nothing here rests on them.
Antonio Varone's own publications on the house (1995; Varone and Béarat 1996) were not obtained: what he found is taken at second hand from Grifa et al. 2025
and from pompeiiinpictures.com.

## 1. Why Pompeii and not Herculaneum

- **verified** OpenStreetMap (API map call, `pompeii_osm.xml`, 8.5 MB): Pompeii has about 4,400 walls mapped singly, 500 named houses and shops with their
  Regio.Insula.door numbers, and 90 named streets. Herculaneum (`herculaneum_osm.xml`) has 75 named features and about a dozen streets on 4.5 hectares:
  no run of 500 m is possible there.
- **verified** Pompeii has a house where painters were interrupted (IX 12, 9), with a freely licensed photograph of the unfinished room: that decides the mechanic.

## 2. The plan and the route

- **verified** Street lines, crossings and names: OpenStreetMap. The names (Via dell'Abbondanza, Via Stabiana, Vicolo di Balbo, Vicolo di Tesmo) are the
  excavators'; ancient names are unknown (**ours** to keep the modern ones on plaques).
- **verified** Street widths: `tools/prep_pompeii.py` measures house-front to centre-line from the mapped walls every 2 m: median 4.3 m on the Via
  dell'Abbondanza, 3.8 m on the Via Stabiana. The level uses class widths (4.3, 3.9, 2.5 m for a lane) rather than the metre-by-metre figures.
- Route, 668 m: from the mouth of the lane beside IX 12 west along the Via dell'Abbondanza to the crossroads with the Via Stabiana (the "Holconius crossing"),
  north up the Via Stabiana to the door of VII 2, 6; back down the Via Stabiana, east along the Vicolo di Balbo, south down the Vicolo di Tesmo, and east along
  the Via dell'Abbondanza again. Nothing is shortened.
- **verified** VII 2, 6 is "Strada Stabiana 32" (`web/pip_R7_02_06.html`); I 7, 1 is on the south side of the Via dell'Abbondanza; IX 2, 11-12 is "Strada
  Stabiana 64". Door positions in the level come from each house's OSM point or outline projected on to the street: good to about 10 m.
- **verified, and a correction to the brief** IX 12, 9 is "the secondary entrance of the house, to kitchen and latrine. The main entrance ... is on the western
  side of the insula and has been identified as IX.12.A" (`web/pip_R9_12_09.html`), on the unnamed lane between IX 11 and IX 12. OSM does not map that lane.
  The level starts and ends at its mouth on the Via dell'Abbondanza and shows the room from inside only; the end card says so.
- **unverified** Asellina's bar (IX 11, 2) is placed by the order of doors, about 20 m west of the lane: OSM has no point for it.
- **verified** Fountains: at the crossroads by I 4, 15; by IX 11, 1; on the Via Stabiana at VII 1, 32-33 (`web/pip_Fountain_*.html`). Their carved heads
  (a comedy mask, a dish, Venus with a dove) are not modelled: each is a plain basin with a spout. Placed from OSM `drinking_water` points near those doors.
- **unverified / ours** Stepping stones: pompeiiinpictures notes one at the mouth of the Vicolo di Tesmo and calls those mid-street "modernised"; none was found
  recorded on this stretch of the Via Stabiana. The level puts them where side streets come in.
- **verified** wagon ruts outside I 7, 1 (pompeiiinpictures). The ruts in the level are painted the whole length of every street (**ours**).
- Heights: a plane fitted by hand to ten EU-DEM 25 m readings at crossings (via api.opentopodata.org): about 3 in 100 up the Via Stabiana. Today's ground.
- **ours** Everything above the wall stumps: storeys, roofs, pent roofs over pavements, which bay is a shop, a door or blank wall, counters, door leaves.
  The red dado under white plaster and the masonry counters follow the look of the excavated street (photographs on the pompeiiinpictures pages saved here).

## 3. The eruption

- **verified** Pliny the Younger, Letters 6.16 and 6.20 (Latin: `texts/pliny_6_16_la.txt`, `pliny_6_20_la.txt`, from thelatinlibrary.com; English:
  J. B. Firth, 1900, as given at attalus.org, which says "a few words and phrases have been modified": `texts/pliny_6_16_en.txt`, `pliny_6_20_en.txt`).
  Every quotation in the level is Firth's wording, copied from those files.
- **verified, and important** None of it was seen from Pompeii. The pine cloud was seen "from Misenum at a distance of 21 km" (Giacomelli et al. 2003); the
  falling ash and pumice are his uncle's ships crossing the bay; the pillows tied on heads and the night "blacker and thicker than any ordinary night" are at
  Stabiae; the cloud "rolling up behind us" and the darkness of "pent-up places" are on the road out of Misenum next morning. Each plate in the level names
  where Pliny or his uncle was. He was "in my eighteenth year" (6.20).
- **verified** Hour: "hora fere septima", "about the seventh hour" (6.16.4). Giacomelli: "We must presume that the eruption began sometime earlier".
- **disputed** Date: the transmitted text reads "Nonum Kal. Septembres" (24 August). Against it: autumn fruit, braziers, heavier clothing, sealed wine jars,
  and a charcoal graffito found in 2018 dated the 16th day before the Kalends of November (17 October); for it, a coin argument (Abdy) dating the latest coin
  of the Golden Bracelet hoard before 1 September. "It is not known whether the ... graffito referred to that day" (`web/wikipedia_eruption_79.txt`, used as a
  pointer; the attalus footnote cites Earth-Science Reviews 2022: 104072, not obtained). The level gives no date on screen and states the dispute on the end card.
  The sun stands as for early afternoon; its height is **ours**.
- **verified** Sequence and figures (Giacomelli, Perrotta, Scandone, Scarpati, Episodes 26(3), 2003, `web/episodes_giacomelli2003.pdf`): column "from an height
  of 14 km to 26 km during the emission of white pumice and then to 32 km during the emission of grey pumice"; fallout "dispersed to the southeast"; "15 cm per
  hour in open areas to 25/30 cm per hour"; "Within six hours ... the roofs and part of the walls of the buildings had collapsed"; next morning pyroclastic
  density currents; "394 corpses were found in the pumice fall deposit and 650 in the pyroclastic density currents (PDCs) deposit. So a total of 1044 victims
  were recovered inside 2/3 of the city".
- **verified** Tremors beforehand: "for many days previous there had been slight shocks of earthquake, which were not particularly alarming, because they are
  common enough in Campania" (6.20.3).
- Distance and bearing of the mountain: 9.5 km on 326 degrees, computed from OpenStreetMap's point for the volcano (`web/nominatim_vesuvio.json`) and the
  level's origin. (Wikipedia gives 8 km to the town; today's crater is not necessarily the vent of 79.)
- **unverified** The mountain's height and shape before 79. The level draws one green cone 1,500 m high. The lararium painting from the House of the Centenary
  (title screen) shows Bacchus beside a single steep vine-covered mountain; Commons titles it "Mount Vesuvius(?)".
- **ours** The stages as the level times them (state e): 0 quiet with two small tremors; 0-1 the column rises to 14 km and spreads at the top; 1-2 it rises to
  26 km and the crown comes over the town, the sun goes; 2-3 pumice falls, the light browns, 32 km; 3-4 dark, lightning in the cloud, a glow at the vent.
  Lightning is in Pliny (6.20: "the black, fearsome cloud of fiery vapour burst into long, twisting, zigzag flames ... resembling lightning flashes, only they were of greater size", seen from Misenum; not quoted in the level). The glow at the vent is ours. About six hours are
  squeezed into four minutes; the pumice is shown ankle-deep (0.24 m) where six hours at 15 cm an hour gives 0.9 m.
- **ours** No surge is shown. The level ends in the afternoon; the end card says what came next morning and how many were found.

## 4. Wall painting: the mechanic

- **verified** Vitruvius 7.3.7 (Morgan 1914, `texts/vitruvius_7_en.txt`): "These colours, when they are carefully laid on stucco still wet, do not fade but are
  permanent." This is the rule the level is built on: the plaster meter, and the colours taking only if she is back while it is wet.
- **verified** Costly colours "are made exceptions in contracts, to be furnished by the employer, not by the contractor" (Vitruvius 7.5.8); Pliny NH 35.30
  lists them: "floridi sunt — quos dominus pingenti praestat — minium, Armenium, cinnabaris, chrysocolla, Indicum, purpurissum" (`web/lacus_plinyNH35_la.txt`;
  Latin only, no English saved). Hence the red comes from the owner's side, not the workshop.
- **verified** Blue: "Methods of making blue were first discovered in Alexandria, and afterwards Vestorius set up the making of it at Puzzuoli" (Vitruvius 7.11).
  The seller's "sand, copper and soda" is Vitruvius' recipe (sand, flowers of natron, copper filings) in the same chapter.
- **verified** Black from soot (Vitruvius 7.10). **ours**: that a bar's hearth supplied it.
- **verified** The Attii: IX 2, 11-12 "was defined as Tabernae Attiorum, in which the Attii brothers made colours and sold their products"; blocks of yellow,
  red, white and blue were found there in 1851 (`web/pip_9_02_11.html`).
- **disputed** Whether Pompeian painters worked a day's patch at a time. Cuní (Heritage Science 2016, `web/cuni2016_*.pdf`) says of Third and Fourth Style
  walls that "no giornate joints are visible" and doubts true fresco altogether; the view he attacks has large horizontal bands with the central pictures
  plastered and painted separately. Grifa et al. 2025 on this very house: "working from the top down in strips, some of the lower registers remain blank".
  So the level does NOT teach "a day's patch". It teaches wet plaster (Vitruvius), top-down working (the dado in the set is blank), and the middle picture
  done last and separately. The drying time of 250 seconds of play is **ours**.
- **ours** The master's remark that dried plaster must be cut out and laid again: standard for later fresco; no ancient source was read for it.

## 5. The House of the Painters at Work (IX 12, 9)

- **verified** `web/pip_R9_12_09_p2.html`: room "u", the oecus: "The unfinished north wall ... The central panel of the wall contains only a traced outline of a
  scene that has not yet been painted. Paint pots and the remains of brushes were also found abandoned here. This gave the house its name."
- **verified** Grifa et al., J. Archaeol. Sci. 177 (2025), `web/unibo_chimica_colori_pompei.pdf`: "several pigment pots in different rooms of the domus and an
  imprint of the basket used by the painters to transport the pots"; decoration "interrupted by the eruption in 79 CE (Varone, 1995)".
- **verified** IX 12, 6 next door (the Chaste Lovers) has a bakery (pompeiiinpictures keywords and captions).
- **unverified** How many painters, who they were, whether they escaped: nothing found. The three men and the girl are **ours**; so is what the outline shows
  (the level draws two figures; a caption for the room mentions "Cupids on chariots pulled by goats" on the centre panel, not clearly the same thing).
- The photograph (Commons "Pompei 2012 (8057186181)") is in Category "House of the Painters (Pompeii)" but its own description says only "Pompei 2012": that it
  is room "u" is a visual match to the pompeiiinpictures photographs, not stated on Commons.

## 6. The three works

| Work | Found | Now | Status |
|---|---|---|---|
| Guard-dog mosaic | entrance of I 7, 1, House of Paquius Proculus, Via dell'Abbondanza | in place (photographed 2018) | verified, pompeiiinpictures |
| Terentius Neo and his wife | VII 2, 6, "north wall of exedra/tablinum in centre of north side of atrium" | Naples, MANN inv. 9058 | verified, pompeiiinpictures |
| The unfinished room | IX 12, 9, room "u" | in place | verified, as above |

- **verified** The name Terentius Neo comes from an inscription on the house (CIL IV 871); the portrait "was sometimes erroneously called the portrait of
  Paquius Proculus" (Wikipedia, pointer). **unverified**: the year the portrait was found; that he was a baker (Wikipedia says the pair "are believed" to be
  bakers: not used). **ours**: that he kept the house-owner's account and paid out the red.
- Not staged, though checked: the Alexander Mosaic (VI 12, 2, now Naples), the Cave Canem of the Tragic Poet (VI 8, 5, in place), the Golden Bracelet garden
  room (VI 17, 42), the Mysteries frieze (400 m outside the walls): none is on a route that also reaches IX 12.

## 7. Words on the walls

- **verified** (texts and numbers as given on the saved pompeiiinpictures pages for this street): "Cn(aeum) Helvium Sabinum aed(ilem) d(ignum) r(ei) p(ublicae)
  o(ro) v(os) f(aciatis) Aegle rogat" CIL IV 7862; the same, "Maria rogat" 7866; "Asellinas rogant nec sine Zmyrina" 7863; "Holconium Priscum II vir(um)
  fullones universi rog(ant)" 7164; "P(ublium) Paquium Proculum [du]umvirum i(ure) d(icundo) vicini cupidi faciunt" (at I 7, 1); "(H)edone dicit assibus hic
  bibitur" CIL IV 1679 (that one is from a bar at VII 2, 44, not this street: the level uses it as a wall text all the same).
- **ours** Which wall each is painted on, and the lettering.

## 8. Street life, dress, coin

- **ours** The cart and mule, the walkers, their remarks, the dog's barking, the colour sellers' talk. Carts in general are attested by the ruts.
- **verified** Pillows: "They placed pillows on their heads and secured them with cloths, as a precaution against the falling bodies" (6.16.16, at Stabiae).
  **ours**: a woman of Pompeii handing one out.
- **unverified** Dress. No source on working dress was found. The cut follows the pictures shown: Terentius Neo's white toga over a tunic, his wife's
  red-brown mantle; short belted tunics for working people are an assumption. Colours are ours. The two doorway figures wear faces cut from the portrait.
- Coin: the as and the sestertius of four asses (Wikipedia, pointer); a drink for one as (CIL IV 1679). The pickups are called sesterces. No coin of
  Vespasian or Titus was sourced as an image: the coin is the shared gold disc of `common/score.js`.

## 9. Pictures used at run time (pompeii/images/)

| File | Commons file | Author | Licence |
|---|---|---|---|
| wall.jpg | Pompei 2012 (8057186181).jpg | "ho visto nina volare" (Flickr) | CC BY-SA 2.0 |
| dog.jpg | Cave Cavem mosaic floor from the House of Paquio Procolo, Pompeii (14585425031).jpg | Carole Raddato | CC BY-SA 2.0 |
| neo.jpg | MANNapoli 9058 couple painting.jpg | Jebulon | CC0 |
| bacchus.jpg | Fresco depicting Bacchus wearing a brunch of grapes and Mount Vesuvius(?), from the Lararium of the House of the Centenary, Pompeii, Naples Archaeological Museum (15045202512).jpg | Carole Raddato | CC BY-SA 2.0 |

All four are reduced in size (stated on the end card, as BY-SA requires changes to be indicated). API responses with the licence fields: `commons/*.json`.
Italian cultural-heritage notice: none of these four file pages carries the "Italy-MiBAC-disclaimer" template (checked in the saved wikitext/JSON). One
candidate that does (Gary Todd's Cave Canem photograph) was not used. The template's wording, for the record: "This image reproduces a property belonging to
the Italian cultural heritage as entrusted to the Italian government. ... A further authorization by the Italian Ministry of Heritage and Culture is required
for reproduction for any other purpose, and particularly for commercial use." The absence of the template is not a legal clearance: Italy's Codice dei beni
culturali applies to the objects whatever a Commons page says; this site is non-commercial.

Every texture is painted by `tools/blender/tex_pompeii.py`; the two portrait faces are crops of neo.jpg (CC0).
