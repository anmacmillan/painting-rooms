# Rubens' Antwerp, about 1612: findings

Written 15–16 Nov 2026 for `rubens/street.html` ("The Painter's Errand"). Status: **V** verified (a source read says it), **P** partly verified (secondary only, sources disagree, or the level goes a step beyond), **U** unverified (a guess, said so on the end card), **I** invented. Quotations are copied from the saved files. Nothing rests on memory.

## Sources

| Key | What | Kept at |
|---|---|---|
| W | Wikipedia (en, nl, de, fr), MediaWiki API extracts, each headed by its URL. Secondary at best | `research/wiki/` |
| INV | Inventaris Onroerend Erfgoed (Flemish heritage agency): street histories (`th_*`), building records (`er_*`). Best source read for names and dates | `research/inventaris/` |
| RH | rubenshuis.be | `research/web/rubenshuis_*.txt` |
| KAT | dekathedraal.be; flemishmastersinsitu.com | `research/web/kathedraal_*.txt`, `fmis_*.txt` |
| TOPA | topa.be (Antwerp church guides): a page on each triptych | `research/web/topa_38161.txt`, `topa_38163.txt` |
| BALAT | KIK-IRPA object 70879 (Gheringh's interior) | `research/web/balat_gheringh_70879.txt` |
| EB1911 | Britannica 1911, "Rubens" | `research/web/eb1911_rubens.txt` |
| NUM | numista.com, coinvarieties.com | `research/web/` |
| OSM | API 0.6, bbox 4.3930,51.2150,4.4125,51.2250, 15 Nov 2026 | `map.json` by `tools/prep_antwerp.py`; changes for 1612 in `research/plan1612.json` |
| PLAN1565 | Virgilius Bononiensis, 1565, cropped and looked at | not published |
| PLAN1649 | Blaeu, 1649, with legend | not published |
| IMG | The pictures, looked at | `images/`, `research/images.json` |

Not consulted: KMSKA; Corpus Rubenianum; the letters (the 1611 letter's text was not seen); the Arquebusiers' accounts (7 Sept 1611 and 12 Sept 1612 rest on TOPA and Wikipedia); FelixArchief and the city archaeology service (the excavated footprint of St Walburga's); the Guicciardini and Braun and Hogenberg plans (downloaded, not read). Nothing was found on sledges, brewers' drays, a slops cry, or apprentices' tasks.

## Three corrections to the brief

| Belief | What the sources say | Status |
|---|---|---|
| In 1612 Rubens lived on the Wapper | "Rubens trok met zijn bruid in bij haar vader in de Kloosterstraat en kocht in januari 1611 een groot pand ... aan de Wapper. Hij liet het grondig renoveren, waardoor het stel pas begin 1616 het nieuwe huis betrok" (W nl). "Rubens's first workshop, at his parents in law's in Kloosterstraat" (TOPA). Move: autumn 1615 (RH), early 1616 (W nl), 1617 (INV er_6304) | V not yet there; date P |
| St Walburga's went with the quay works | Closed 1798; "op 12 augustus 1816 ... voor afbraak verkocht en ... in 1817 gesloopt" (W nl_Sint-Walburgiskerk) | V (secondary) |
| The Descent was painted at the Rubens House | "Rubens did execute this commission in his workshop in Kloosterstraat" (TOPA 38163). The Raising was painted in the church, "door een scheepszeil" hidden | V (secondary) |

The level still starts on the Wapper, as a building site: the old house stands, the studio and screen are walls in scaffolding, the couple are visiting their garden.

## The brief's beliefs, checked

| Belief | Finding | Source | Status |
|---|---|---|---|
| Returned 1608 | "after his return to Antwerp in late 1608" | W en | V (secondary) |
| Court painter 1609 | "In September 1609 ... appointed as court painter" | W en | V (secondary) |
| Married 1609 | "on 3 October 1609" | W en, nl | V (secondary) |
| Bought the house 1610 | 1610 (RH, INV); "januari 1611" (W nl) | RH; INV er_6304 | V for 1610/11 |
| Rebuilt with studio, portico, garden | "1610-1621"; "Pas in 1620 ... zo goed als voltooid"; staircase 1617; no separate dates for studio, portico, pavilion | INV; RH | P; state in 1612 U |
| What he bought | "een eigendom met bestaande woning in traditionele bak- en zandsteenstijl"; "het 16de-eeuwse woonhuis" | INV er_6304 | V (secondary) |
| Raising 1610–11 for St Walburga's | "in 1610 en mogelijk begin 1611"; high altar | W; TOPA | V (secondary) |
| Now in the cathedral | North transept since 1816 | W nl; TOPA | V (secondary) |
| Descent for the Arquebusiers, still there | Commissioned 7 Sept 1611; "12 September 1612 ... the central panel was put in position"; wings two years later; "still in the Southern transept, at a few yards of its original position" | W; TOPA 38163 | V (secondary) |
| Honeysuckle Bower c.1609, Munich | "painted c. 1609"; "1609-1610" (RH) | W; RH | V (secondary) |
| Truce 1609–21, Scheldt closed | "9 April 1609 ... 9 April 1621"; "refused to allow free navigation on the Scheldt" | W en | V (secondary) |
| North tower; south never built | 1518 (FMIS) or 1521 (INV); 123 m; south stopped 1475, 65.30 m | KAT; INV er_4092; W nl | V; year P |
| Town hall | 1561–64, inaugurated 1565; burnt 1576; rebuilt from 1579 | INV er_4032 | V |
| Het Steen | Rebuilt c.1520; prison to 1823; "geheel ingebouwd" until the 1880s; north wing 1887–90 | INV er_4602 | V |
| Meir a covered canal, wide | Canal of 1489, "in 1541 gedeeltelijk overwelfd"; PLAN1565 shows a railed strip and basin | INV th_11207 | V; open water in 1612 U |
| Groenplaats a churchyard | "'Groot Kerkhof', later 'Groen Kerkhof'"; burials to 1784; houses between it and Schoenmarkt until c.1804 | INV th_922, th_983; plans | V |
| Quays straightened | 1877 to 26 July 1885; "zowat 700" houses; Burchtplein, Mattenstraat, Steenstraat gone | INV th_14749 | V |
| Large workshop | "ongeveer 20 leerlingen of assistenten"; exempt from registering pupils; nobody named for 1612 | W nl; EB1911 | V (secondary); names, tasks U |

## The route (1,574 m)

| Stretch | On the plaques | 1612? | Status |
|---|---|---|---|
| Garden, court, gate | (place) | See Buildings | I |
| Wapper, east bank | Vaartstraat | Rui of 1490, partly vaulted, last stretch 1819; houses on the vault (Geleyhuis 1545) until 1966–69; "the then-Vaartstraat" (W en); Blaeu "75. Vaert-straet" not located | line, canal V; open stretch U; name P |
| Meir | Meere | INV "Meere"; Blaeu "De Meer"; crucifix 1527 to late 18th c. opposite the Huidevettersstraat | V; open water U; crucifix's look I |
| Meirbrug | Meirbrug | Bridge and gate gone 1541, "De naam bleef behouden" | V |
| Schoenmarkt | Kerckhofstrate | "Kerckhofstrate"; Blaeu "62. Kerchof-straet" | line V; name P |
| Groenplaats | Groen Kerkhof | As above; unwalled until 1754; trees, crossing paths and a cross after PLAN1565; a row of houses added on the south side | V; positions I |
| Cathedral, south door to west door | none | South portal finished 1616, main portal 1619 | P |
| Handschoenmarkt | the same | Name "uit de eerste helft van de 17de eeuw"; earlier "Klein of Stenen Kerkhof"; the well on OSM's footprint | P |
| Maalderijstraat | the same | "Maelderij-" or "Maelerijstraat", undated | P |
| Grote Markt | the same | Blaeu "De Groote Merckt"; then more built up; no Brabo (1887) | V |
| Suikerrui | the same | Name 1530–43; vaulted 1661 and 1832; three bridges (not shown) | V; canal's line I |
| Quay past Het Steen | none | Today's quay; in 1612 the Werf, the Vismarkt, the Burcht's ring of houses | modern, said on the card |

## St Walburga's: where it stood

- "ter hoogte van de Zakstraat ongeveer 50m ten noorden van waar tegenwoordig het Steenplein ligt" (W nl, unsourced there).
- PLAN1565: "[TE]MP. S. WALBVRGIS" at the river's edge, north of a turreted tower taken to be Het Steen.
- PLAN1649: "F. T.S.Walburgis" inside a ring of houses behind "De Werff".
- Print of c.1630: "De Borch Kerck" north of "Het Vleeshuys".
- Choir foundations excavated from 1957 (INV th_14749).

Set with its west door at about 51.2232 N, 4.3977 E, nave running east to the foot of the Zakstraat: an inference, ±40 m (P/U). Inside after Gheringh (dated 1661, 1664 or 1641–60): round pillars, pointed vault, panelling, black and white floor, the choir "about three metres" up "no less than 19 steps" (TOPA). Gheringh shows a double flight; the level has one.

## Buildings

| Building | Rests on | Status |
|---|---|---|
| Cathedral outside | OSM footprint and axis; 123 m, 65.30 m, vault 27.5 m (W nl); bulb of 1535 (INV); photographs, PLAN1565; tower stages by eye; transept about 72 m against the 67 m given | P |
| Cathedral inside | Neefs for the manner; one height for all aisles, no chapels; nave vaults were in fact being rebuilt 1610–14 | P, simplified |
| Arquebusiers' altar | "in the vast transept", "a few yards" from today's place (TOPA); exact place and form the level's | P / I |
| Town hall | OSM front (62 m); photograph | P |
| Guild houses | Today's look; north side "vrij gereconstrueerd" c.1875–1925 (INV th_925) | for 1612 U |
| Het Steen | Photograph; shown free-standing, without the 1887–90 wing | P |
| House on the Wapper | INV for the old house's manner; Harrewijn 1684, 1692 for the arrangement; state in 1612, garden and bower the level's | P / I |
| Ordinary houses | Today's footprints; brick, plaster and timber fronts under stepped gables; none a portrait | I |

## Stagings

| Picture | How | Status |
|---|---|---|
| Honeysuckle Bower | In the new house's garden; dress from the image; the picture predates the purchase | place I |
| Descent | The painting itself, middle panel only, as on 12 Sept 1612 | V (secondary); place P |
| Raising | The painting itself over St Walburga's high altar | V; site P |

## The game's own

The girl and her errand; the box of colours; every spoken line; one day; "Pas op! Water!" (no cry attested); cart loads (carts and barrowmen attested: PLAN1565, INV th_998).

Coin: the **patagon**, silver, "in 1612 ... geïntroduceerd", 48 stuivers (W nl_Patagon): V (secondary). Albertin (gold, 1600–05): P. Ducaton: 1618.

## Coordinates

Cathedral crossing 51.2203, 4.4015. Rubenshuis 51.21722, 4.40944. Het Steen 51.22278, 4.39750. Stadhuis 51.22139, 4.39944. St Walburga's door as set: 51.2232, 4.3977 (inference).
