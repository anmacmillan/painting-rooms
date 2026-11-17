# Gold for Herr Klimt: Vienna, 1908. Sources and what is not verified

Built 17 Nov 2026. Every statement in the level or on its end card rests on a file in this folder, read in that session. All the text sources are Wikipedia
articles (English and German), saved as plain-text extracts with their URLs in the first line: they are tertiary. The museums' own pages were tried and could
not be read (Belvedere collection page and Belvedere "Kiss" page: HTTP 403; Neue Galerie and secession.at: script-built pages with no usable text;
Wien Geschichte Wiki "Kunstschau 1908": no such page). So nothing here is better than "partly verified", and where the two Wikipedias disagree it is said.

## The teaching mechanic, and what it rests on

The level teaches one thing by making the player do it: in Klimt's golden pictures the faces and hands are painted naturally and everything else is flat
gold and pattern; and in The Kiss the man's pattern is rectangles, the woman's rounds.

| Claim | Status | Source |
|---|---|---|
| Klimt's father, Ernst Klimt the Elder, was a gold engraver | partly verified (two tertiary sources agree) | wp_en_klimt.txt ("a gold engraver from a peasant family in Bohemia"); wp_de_klimt.txt ("Goldgraveur") |
| Klimt saw the mosaics of San Vitale, Ravenna, in December 1903 with Maximilian Lenz, who wrote that they made "an immense decisive impression" | partly verified | wp_en_adele.txt; wp_en_kiss.txt (1903, San Vitale); wp_de_kuss.txt (Ravenna, San Vitale, no date) |
| Adele Bloch-Bauer I: finished 1907 (begun 1903), oil with gold and silver leaf, 138 x 138 cm; hair, face, decolletage and hands in oil, less than a twelfth of the work; Neue Galerie New York | partly verified | wp_en_adele.txt |
| Adele I was shown at the Kunstschau in 1908 | partly verified | wp_en_adele.txt |
| The Kiss: 180 x 180 cm, oil with gold leaf, silver and platinum; shown 1908 as "Liebespaar"; Belvedere | partly verified | wp_en_kiss.txt, wp_de_kuss.txt |
| The man wears geometric (rectangular) pattern, the woman floral and round pattern; Werner Hofmann read the contrast of rectangular and round patterns as carrying the picture's tension | partly verified | wp_en_kiss.txt ("geometric patterns... floral patterns"); wp_de_kuss.txt ("in dem Gegensatz rechteckiger und runder Muster") |
| The state (k.k. Ministerium fuer Kultus und Unterricht) bought The Kiss at the Kunstschau for 25,000 Kronen | partly verified | wp_de_kuss.txt, wp_de_kunstschau.txt |
| It was bought still unfinished; Klimt completed it in 1909 | partly verified | wp_en_kiss.txt ("purchased, still unfinished"); wp_de_kuss.txt ("vollendete es 1909") |
| Gold leaf is laid in small square leaves | UNVERIFIED (no source read). The level shows the gold arriving as square leaves; the end card does not assert it |
| That the pictures were gilded or "dressed" at the exhibition, that patterns come as pieces, the mound of flowers | the game's own |

The level's masks (klimt/tex/kiss_mask.png, adele_mask.png) decide which part of each picture counts as "his", "hers", "flesh" and "gold". They were drawn
by eye over a gridded print (tools/blender/tex_klimt.py holds the outlines). In The Kiss the spiral-covered golden mantle behind the woman is counted with
her rounds, and the flowered ground is shown from the start with the flesh: both are the level's reading, not a scholar's.

## Place and year

| Claim | Status | Source |
|---|---|---|
| Kunstschau: 1 June to 16 November 1908, for the Emperor's sixty years; on the ground of today's Konzerthaus (built 1913); a wooden building by Josef Hoffmann; 54 rooms, a cafe, courts, gardens | partly verified | wp_de_kunstschau.txt, wp_en_kunstschau.txt, wp_de_klimt.txt |
| What the Kunstschau looked like, which room held Klimt's pictures | UNVERIFIED: no plan or photograph was read. The level's white front, chequered door, open roof and single room are the game's own |
| Secession: built 1897-98 by Joseph Maria Olbrich; dome of gilded wrought-iron foliage ("Blaetterwerk": that the leaves are laurel is NOT in the sources read, so the end card says only "leaves"), nicknamed "Krauthappel"; motto "Der Zeit ihre Kunst, der Kunst ihre Freiheit"; "Ver Sacrum" by the door | partly verified | wp_de_secession.txt, wp_en_secession.txt; form checked against research/ref/secession_photo.jpg |
| Klimt had left the Secession before 1908 | partly verified, with a conflict: wp_en_klimt.txt says both "remained with the Secession until 1908" and that the split he led came in 1905. The end card says "the sources read here put the split in 1905" |
| Karlsplatz: made by roofing over the Wien (1894-1900), named 1899 | partly verified | wp_de_karlsplatz_wien.txt |
| Otto Wagner's two Stadtbahn pavilions: finished May 1898, opened 30 June 1899; steel frame, marble slabs; taken down and put back 2 m higher after the underground works | partly verified | wp_de_station_karlsplatz.txt, wp_en_karlsplatz_station.txt; form checked against research/ref/pavilion_photo.jpg, pavilion2.jpg. Their gilded sunflowers and green paint are from the photographs (today's state) |
| The market: moved from 1902 on to the roofed-over Wien beside the Secession; officially "Naschmarkt" 1905; masonry stalls from 1910 | partly verified | wp_de_naschmarkt.txt. Umbrellas over stalls: research/ref/naschmarkt_1900.jpg (the old market, c. 1900). Where stalls stood in 1908: the game's own |
| Electric trams from 1897; last horse tram 26 June 1903; "Bim" | partly verified | wp_de_strassenbahn.txt |
| Where tram lines crossed the walk in 1908, and the trams' red and white | UNVERIFIED: today's rails (OpenStreetMap) and today's colours |
| Fiacres | attested (wp_de_fiaker.txt) but NOT in the level: no horse was modelled |
| Cafe Museum (1899, Adolf Loos; Klimt among its guests) | partly verified (wp_en_cafe_museum.txt) but it lies 100 m north of the walk; the level's terrace is a nameless coffee house, the game's own |
| Musikverein (OpenStreetMap start_date 1870), Karlskirche (start_date 1716) stood | partly verified (OpenStreetMap tags only). Kuenstlerhaus: date not checked |
| Klimt's look: bald crown, beard, long smock | partly verified | research/ref/klimt_cat_1911.jpg (Moriz Naehr, May 1911, Commons), klimt_smock_schiele.jpg (Schiele, "Klimt im blauen Malerkittel", 1913). The smock's indigo follows Schiele's title; the photograph shows a paler cloth |
| The Krone (100 Heller), currency from 1892 | partly verified (wp_en_krone.txt). The coin's silver colour: UNVERIFIED (the article's coin table did not come through) |
| Street names (Friedrichstrasse, Karlsplatz, Lothringerstrasse) | today's; only "Karlsplatz" (1899) checked |

## The route (908 m)

From the steps of the Secession east across Karlsplatz, south of Otto Wagner's two pavilions, along the south side of the Kuenstlerhaus and the Musikverein,
into the Lothringerstrasse, over the Schwarzenbergplatz, and in at the Kunstschau's door. It is longer than the 500 to 700 m asked: the Secession and the
Kunstschau's plot are that far apart. Plan: OpenStreetMap, API 0.6 map call, bbox 16.3615,48.1970,16.3800,48.2032, fetched 17 Nov 2026
(research/vienna_osm.xml; tools/prep_vienna.py; decisions in research/plan1908.json). Origin 48.2000 N, 16.3697 E.

What is changed from today's map, and why:
- Konzerthaus (1913) and Akademietheater taken out: the Kunstschau's ground.
- Wien Museum, the Kunsthalle's box, the "Kleines Haus der Kunst", and every footprint OpenStreetMap dates after 1908 near the walk taken out (list printed by the script).
- Everything standing on the open square between the Secession and the pavilions taken out (underground entrances, kiosks): what small structures stood there in 1908 was not established.
- NOT changed, and so possibly wrong for 1908: all other footprints (undated ones may be later buildings); the gardens (today's outlines); the pavilions' position (they were moved up 2 m and perhaps sideways); the width of the roadway (the level lays a 30 m ribbon of setts along the walk).
- Every house front is the same painted Ringstrasse block in five colours: an impression, no portraits. The Musikverein and Kuenstlerhaus are ordinary blocks in their own colours. The Karlskirche is masses only.

## Street life: attested, or the game's own

Attested: trams and "Bim"; the market and its umbrellas; coffee houses. The game's own: the upset cabbages, the waiters' collisions and the terrace itself,
the runaway boater, the gas lamps' places, barrels in the road, every spoken word (including Klimt's and the tram's), the wind, the girl.
The walker's line about "the golden cabbage on the Secession" echoes the attested nickname.

## Image files

| File in the level | Commons file page | Author | Licence |
|---|---|---|---|
| images/kiss.jpg (1600 px), tex/kiss_sketch.jpg | https://commons.wikimedia.org/wiki/File:The_Kiss_-_Gustav_Klimt_-_Google_Cultural_Institute.jpg | Gustav Klimt (d. 1918); photograph: Google Art Project | Public domain |
| images/adele.jpg (1400 px), tex/adele_sketch.jpg | https://commons.wikimedia.org/wiki/File:Gustav_Klimt_046.jpg | Gustav Klimt; reproduction: The Yorck Project (2002), 10.000 Meisterwerke der Malerei | Public domain |

Reference only, never loaded by the level (research/ref/, details in research/commons_files.json): secession_photo.jpg (C.Stadler/Bwag, CC BY-SA 4.0),
pavilion_photo.jpg (Thomas Ledl, CC BY-SA 4.0), pavilion2.jpg (Felix Koenig, CC BY 3.0), klimt_cat_1911.jpg (Moriz Naehr, public domain),
klimt_smock_schiele.jpg (Egon Schiele, public domain), naschmarkt_1900.jpg (unknown author, public domain), adele_alt.jpg (not used).
All other textures are painted by script (klimt/town.js, tools/blender/tex_klimt.py). Faces on the Blender figures are the shared painted faces of the project.

## Not done, not tested

- The stagings are the paintings themselves completed on a large canvas, not figures posed in space: the player stands before the picture, not inside it.
- No fiacres, no horses. Trams are a plain box car, not a 1908 type.
- Played only by script (keyboard events and emulated touch events in headless Chrome). Not played by hand; not on an iPad.
