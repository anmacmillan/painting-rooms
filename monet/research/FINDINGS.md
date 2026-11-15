# La Grenouillère, 1869: what was checked, and against what

Checked 15 November 2026 for `monet/street.html`. Every statement in the brief is listed with its source and a status: verified (the source says it in terms), partly verified, or unverified. Texts are saved beside this file. Nothing rests on memory: where no fetched source says a thing, it is marked unverified.

## Sources saved here

| Short name | File | URL |
|---|---|---|
| Met entry | `other/met_437135_wayback.txt` (and `.html`) | https://www.metmuseum.org/art/collection/search/437135 as archived 31 Dec 2024: https://web.archive.org/web/20241231191427/https://www.metmuseum.org/art/collection/search/437135 (the live page returned HTTP 429). Holds the label and the long catalogue entry |
| Met API | `other/met_api_437135.json` | https://collectionapi.metmuseum.org/public/collection/v1/objects/437135 |
| NG | `other/ng_bathers.txt` (and `.html`) | https://www.nationalgallery.org.uk/paintings/claude-monet-bathers-at-la-grenouillere |
| Phillips | `other/phillips_boating.txt` (and `.html`) | https://www.phillipscollection.org/collection/luncheon-boating-party |
| Reinhart | `other/reinhart_bundessammlungen.txt` (and `.html`) | https://www.bundessammlungen.ch/de/collection/item/11214/ |
| Nationalmuseum text | `commons/File_La_Grenouill_re__Auguste_Renoir____Nationalmuseum___19486_tif.json` | https://commons.wikimedia.org/wiki/File:La_Grenouill%C3%A8re_(Auguste_Renoir)_-_Nationalmuseum_-_19486.tif (the museum's own text, carried in its Commons upload; the museum's site was not reached) |
| Grenouillère museum | `other/grenouillere_museum_site_histoire.txt`, `other/grenouillere_museum.txt` | https://www.grenouillere-museum.com/grenouillere/collections-2/la-grenouillere-son-site-et-son-histoire/ |
| Fournaise museum | `other/musee_fournaise.txt`, `other/musee_fournaise_hameau.txt`, `other/musee_fournaise_decouvrir.txt` | https://www.musee-fournaise.com/ |
| Maupassant | `other/wikisource_femme_de_paul_1891.txt` (and `.html`) | https://fr.wikisource.org/wiki/La_Maison_Tellier_(recueil,_Ollendorff_1891)/La_Femme_de_Paul |
| WP Monet picture | `wiki/en_La_Grenouill_re__Monet_.json`, `wiki/fr_La_Grenouill_re__Monet_.json` | https://en.wikipedia.org/wiki/La_Grenouill%C3%A8re_(Monet) |
| WP Renoir picture | `wiki/en_La_Grenouill_re__Renoir_.json`, `wiki/fr_La_Grenouill_re__Renoir_.json` | https://en.wikipedia.org/wiki/La_Grenouill%C3%A8re_(Renoir) |
| WP place | `wiki/fr_La_Grenouill_re__lieu_.json` | https://fr.wikipedia.org/wiki/La_Grenouill%C3%A8re_(lieu) |
| WP island | `wiki/fr__le_de_la_Chauss_e.json`, `wiki/fr__le_des_Impressionnistes.json` | https://fr.wikipedia.org/wiki/%C3%8Ele_de_la_Chauss%C3%A9e |
| WP Fournaise | `wiki/fr_Maison_Fournaise.json`, `wiki/en_Maison_Fournaise.json` | https://fr.wikipedia.org/wiki/Maison_Fournaise |
| WP lives | `wiki/fr_Claude_Monet.json`, `wiki/en_Claude_Monet.json`, `wiki/fr_Auguste_Renoir.json`, `wiki/fr_Louveciennes.json`, `wiki/fr_Bougival.json` | fr and en Wikipedia |
| WP railway | `wiki/fr_Ligne_de_Paris_Saint_Lazare___Saint_Germain_en_Laye.json`, `wiki/fr_Gare_de_Chatou___Croissy.json` | fr Wikipedia |
| WP river | `wiki/fr_Machine_de_Marly.json`, `wiki/fr_Mont_Val_rien.json`, `wiki/fr_P_rissoire.json`, `wiki/en_Bateaux_Mouches.json` | fr and en Wikipedia |
| WP portraits | `wiki/fr_Un_atelier_aux_Batignolles.json`, `wiki/en_A_Studio_at_Les_Batignolles.json`, `wiki/en_Bazille_s_Studio.json`, `wiki/fr_Pierre_Auguste_Renoir__Bazille_.json`, `wiki/fr_Claude_Monet__Renoir__Washington_.json`, `wiki/fr_Claude_Monet__Renoir__Paris_.json` | fr and en Wikipedia |
| Wikiquote | `wiki/enwikiquote_Claude_Monet.json`, `wiki/enwikiquote_Pierre_Auguste_Renoir.json` | https://en.wikiquote.org/wiki/Claude_Monet |
| Wikidata | `other/wikidata_entities.json` | Q941549, Q10908882, Q91932601, Q104233019, Q3632885, Q141239275, Q1640215, Q3209598 |
| OSM | `other/nominatim_*.json`, `other/overpass_grenouillere.json`, `other/overpass_site_surroundings.json` | nominatim.openstreetmap.org, overpass-api.de |
| CMA | `other/cma_bazille_renoir_2021_134.json` | https://openaccess-api.clevelandart.org/api/artworks/?accession_number=2021.134 |
| Commons records | `commons/File_*.json`, `commons/structured_data_depicts.json` | commons.wikimedia.org |

Not reached: the Met live page (429), nationalmuseum.se, nga.gov (403), musee-orsay.fr (403). The ColourLex page was fetched (`other/colourlex_monet_bathers.txt`) but not relied on. The exhibition catalogue the Met leans on (Schembri and Boring, Monet et Renoir côte à côte à la Grenouillère, Croissy 2012) was not seen.

## Images

All four files in `monet/images/` are 1400 px wide, reduced from Commons' 1920 px rendering. Licence and artist are as the Commons record states them. Only the first two are used by the level; the other two are kept for reference.

| File | Commons page | Record |
|---|---|---|
| `grenouillere.jpg` | https://commons.wikimedia.org/wiki/File:La_Grenouill%C3%A8re_MET_DT833.jpg | Claude Monet, La Grenouillère, 1869. Licence CC0, "Creative Commons Zero, Public Domain Dedication". Credit: "This file was donated to Wikimedia Commons as part of a project by the Metropolitan Museum of Art". Original 3811 × 2880. Record: `commons/File_La_Grenouill_re_MET_DT833_jpg.json`. Oddity: the Met API today returns `isPublicDomain: false` and no image for this object, against the CC0 donation recorded on Commons. Monet died in 1926, so the painting itself is out of copyright |
| `renoir_grenouillere.jpg` | https://commons.wikimedia.org/wiki/File:Auguste_Renoir_-_La_Grenouill%C3%A8re_-_Google_Art_Project.jpg | Pierre-Auguste Renoir, La Grenouillère, 1869. "Public domain". Source: Google Cultural Institute; the picture is the Nationalmuseum's, Stockholm. Original 3235 × 2609. Record: `commons/File_Auguste_Renoir___La_Grenouill_re___Google_Art_Project_jpg.json` |
| `boating_party.jpg` | https://commons.wikimedia.org/wiki/File:Pierre-Auguste_Renoir_-_Luncheon_of_the_Boating_Party_-_Google_Art_Project.jpg | Pierre-Auguste Renoir, Le déjeuner des canotiers, 1880 to 1881. "Public domain". The Phillips Collection's, Washington. Original 9025 × 6684. Record: `commons/File_Pierre_Auguste_Renoir___Luncheon_of_the_Boating_Party___Google_Ar.json` |
| `monet_bathers_ng.jpg` | https://commons.wikimedia.org/wiki/File:Monet_-_Bathers_at_La_Grenouill%C3%A8re.jpg | Claude Monet, Bathers at La Grenouillère, 1869. "Public domain". Source given: the National Gallery's page. Original 5319 × 4226. Record: `commons/File_Monet___Bathers_at_La_Grenouill_re_jpg.json` |

## The brief's claims, tested

### 1. The summer of 1869 and the place

| Claim | Status | Source and quotation |
|---|---|---|
| Monet and Renoir worked side by side at La Grenouillère in summer 1869 | verified | Met entry: "In the summer of 1869, Claude Monet was working very closely with his friend Auguste Renoir. They set their easels up side by side at La Grenouillère (The Frog Pool)". NG: "During the summer of 1869, Monet and Renoir painted together at La Grenouillère". Reinhart: Renoir "hatte sich mit seiner Leinwand dazu unmittelbar neben Claude Monet positioniert" |
| "and early autumn" | partly verified | The only date is Monet's letter of 25 September 1869, which says Renoir "has just spent two months here". fr WP Croissy says "à la fin de l'été 1869". Nothing saved puts them there in October |
| A floating café and bathing place | verified | NG: "a floating restaurant ... and dance hall, as well as riverside tables", "boating, fishing and swimming". fr WP island: "deux péniches, l'une faisant office de café en journée et de salle de danse le soir ; l'autre de cabines de bains" |
| The name means "frog pond" | verified | NG: "La Grenouillère (literally, 'The Frog Pond')". Met: "(The Frog Pool)" |
| On the Île de Croissy, Croissy-sur-Seine, near Bougival | verified | Met entry: "located on the Seine at Croissy near Bougival". Maupassant: the raft "est relié à l'île charmante de Croissy" |
| Distance from Paris | verified | NG: "some 12 kilometres west of Paris" |
| Owner Seurin | verified, with two tellings | fr WP island: "En 1852, François et Félicité Seurin installent des tentes sur cette plage ... En 1857, les Seurin installent à demeure ... deux péniches". Grenouillère museum: "1858 Etablissement des deux barges flottantes". The two differ by a year |
| Napoleon III visited in 1869 | verified; the month is disputed | Met entry: "an unannounced visit from Napoleon III and Empress Eugénie in mid-July ... described at length in La Chronique illustrée on August 1, 1869". fr WP island says "en août 1869". The Met's mid-July is the better sourced. Not used in the level |
| Burned down | verified | Met entry: "burned down on October 20, 1889" |

### 2. The versions

The Met entry lists three by Monet and three by Renoir; NG agrees ("Between them, Monet and Renoir produced six paintings of La Grenouillère") and adds a small boat study.

| Picture | Status | Details and source |
|---|---|---|
| Monet, La Grenouillère, 1869, Metropolitan Museum of Art, New York | verified | Met API: accession 29.100.112; "29 3/8 x 39 1/4 in. (74.6 x 99.7 cm)"; oil on canvas; "H. O. Havemeyer Collection, Bequest of Mrs. H. O. Havemeyer, 1929". Wildenstein W134. Inscribed "(lower right) Claude Monet; (right) LOCATI[ON] CANOT[S]". The brief's title "Bain à la Grenouillère" is the name of one Commons file, not the museum's title: the Met calls it La Grenouillère, and the level does too |
| Monet, Bathers at La Grenouillère, 1869, National Gallery, London | verified | NG: inventory NG6456; 73 × 92 cm; signed and dated. W135 |
| Monet, La Grenouillère, 1869, formerly Arnhold collection, Berlin, lost | verified | Met entry: "W136 (fig. 3, destroyed; formerly Arnhold collection, Berlin)". NG: "destroyed during Second World War, known only from a photograph" |
| Monet, small study of two rowing boats | partly verified | NG: "a small study of two of the rowing boats (Kunsthalle, Berne)"; the Met's bibliography cites the Kunsthalle Bremen. Which is right was not settled |
| Renoir, La Grenouillère, 1869, Nationalmuseum, Stockholm | verified, save the number | Met entry caption: "66.5 x 81 cm (Nationalmuseum, Stockholm)". Inventory NM 2425 is from Wikidata only. Wikidata dates it 1875, which is wrong against every other source |
| Renoir, La Grenouillère, 1869, Sammlung Oskar Reinhart «Am Römerholz», Winterthur | verified | Reinhart: inventory SOR1931.4; "65 x 92 cm" |
| Renoir, La Grenouillère, 1869, Pushkin Museum, Moscow | partly verified | Met entry caption names it. 59 × 80 cm is from Wikidata only |
| A fourth Renoir | unverified | fr WP speaks of four; the Met counts three |
| Which two show the same scene from the same spot | verified: the Met Monet and the Stockholm Renoir | Met entry: "Renoir's picture (fig. 4) now in the Nationalmuseum, Stockholm, portrays the subject from the almost identical viewpoint seen in this composition" |
| How the Stockholm Renoir differs | verified | Met entry: "Renoir's more tightly focused view of the islet, his inclusion of a figure who leans down to reach a rowboat ... and his more decorous exclusion of female bathers" |

### 3. The islet

| Claim | Status | Source and quotation |
|---|---|---|
| A small round islet with one tree | verified | Met entry: "the tiny round island at the center of the canvas, known as 'Le Camembert'". Maupassant: "un îlot minuscule planté d'un arbre" |
| Nicknamed the Camembert and the flowerpot | verified | fr WP island: "le « Pot à fleurs », le « Camembert »". Maupassant (1881): "surnommé le « Pot-à-Fleurs »". Nationalmuseum text: "the little artificial island known as Camembert or the flowerpot" |
| Joined by walkways to the island bank and to the floating café | verified | Met entry: "The 'Camembert,' at the center of Monet's canvas, was connected by wooden walkways to the Ile de Croissy on the left and the floating café on the right." fr WP: "des planches étroites et glissantes… qui provoquent chutes et baignades imprévues" |
| The kind of tree | unverified | No source names the species |
| Rowing boats moored in the foreground | verified | Met entry: "rowboats for rent in the foreground" |
| Bathers | verified | Met entry: "shirtless swimmers at left"; women in "long black bathing costumes" on the islet |
| Café on the right in both pictures | verified for the Monet; by inference for the Renoir | Met entry: "visitors to the floating restaurant at right"; the sign "LOCATION CANOTS" is cut off "at the side wall of the restaurant". The same wall and letters stand at the right of the Stockholm picture (seen in the image itself) |

### 4. Poverty and addresses

| Claim | Status | Source and quotation |
|---|---|---|
| Both were poor | verified | en WP Monet picture: "Monet and Renoir, both desperately poor". fr WP Renoir: "En 1869, dans une situation financière difficile" |
| Monet's own words on it | verified for a letter to Houssaye, not Bazille | Met entry, Monet to Arsène Houssaye, 2 June 1869: "this fatal refusal almost took all bread from [our] mouth[s]" |
| Renoir to Bazille on not eating every day | unverified | Not found in any fetched source. Not used |
| Monet lived at Saint-Michel near Bougival | verified | Met entry: "Monet and his young family had just moved to Saint-Michel, a hamlet outside Bougival, in late spring of 1869" |
| Renoir lived with his parents at Voisins, Louveciennes | verified | fr WP Renoir: "il doit vivre chez ses parents retirés dans le hameau de Voisins, non loin de Louveciennes" |

### 5. The letter of 25 September 1869

Monet to Frédéric Bazille. Four English versions were found; all are translations. The French was found only in fragments ("mauvaises pochades", "tableau").

| Wording | Where | Translation credited to |
|---|---|---|
| "I do have a dream, a painting, the baths of La Grenouillère, for which I have made some bad sketches, but it is only a dream. Renoir, who has just spent two months here, also wants to do this painting." | Met label (`met_437135_wayback.txt`, line 68) | not credited |
| "I do have a dream, a painting, the baths of La Grenouillère for which I've done a few bad rough sketches, but it is a dream. Renoir, who has just spent two months here, also wants to do this painting" | Met catalogue entry (same file, line 131) | "translated in Nochlin 1966" |
| "I indeed have a dream, a painting of bathing at La Grenouillère, for which I have made some bad sketches, but it's a dream. Renoir, who has been spending two months here, also wants to do this picture." | NG | not credited |
| "I have a dream a picture of the bathing spot at the Grenouillere, for which I've made a few poor sketches, but it is a dream. Renoir, who has just spent two months here, also wants to do this painting." | Wikiquote | Bonafoux 1986, as cited in Farrell 2003 |

Status: the letter, its date, its recipient and its sense are verified. The full French sentence is unverified. The level quotes the Met label's English on the end card and says it is a translation.

### 6. Ages and looks

| Claim | Status | Source |
|---|---|---|
| Monet born 14 November 1840; Renoir born 25 February 1841 | verified | fr and en WP. Both were 28 that summer |
| What they looked like about 1869 | partly verified, from two portraits of 1867 looked at by the builder (500 px renderings from Commons, not kept in the repo) | `File:Carolus-Duran - Portrait de Claude Monet - Musée Marmottan Monet.jpg` (dated on the canvas "Paris 67"): thick dark hair, a full brown beard and moustache, a dark blue-black jacket, a white collar. `File:Frédéric Bazille - Renoir.jpg` (1867, Musée d'Orsay): short dark hair, a moustache and a small chin beard, a dark jacket, grey-beige trousers, a blue cravat. Both are two years before La Grenouillère, and portraits, not photographs |
| What they wore to paint out of doors in 1869 | unverified | No source. fr WP has Renoir "coiffé d'un chapeau" in Fantin-Latour's studio picture of 1870. The figures' hats are imagined |

### 7. The Maison Fournaise and the distance

| Claim | Status | Source and figures |
|---|---|---|
| Luncheon of the Boating Party, 1880 to 1881, Phillips Collection | verified | Phillips: "between 1880 and 1881"; "51 1/4 x 69 1/8 in.; 130.2 x 175.6 cm"; "Acquired 1923" |
| Painted at the Maison Fournaise, Chatou | verified | Fournaise museum: "le balcon où Renoir a peint son célébrissime Déjeuner des canotiers" |
| Coordinates, Maison Fournaise | verified | 48.8896206 N, 2.1632155 E (OSM; Wikidata Q1640215 gives 48.8896, 2.1633) |
| Coordinates, site of La Grenouillère | partly verified | OSM has no marker on the island. The nearest are the reproduction boards on the Croissy bank facing it: Renoir's Stockholm picture at 48.877954 N, 2.1538635 E. The Grenouillère museum places the site "sur l'île en face du Château Chanorier". The true spot is on the island within about 150 to 250 m of the board |
| Distance | computed | 1,466 m in a straight line, bearing 208°; 1,451 m projected on OSM's centreline of the Seine. By water about 1.5 km, give or take 200 m for the uncertain site |
| Which is upstream | verified | The Maison Fournaise. Maupassant, of boats arriving at La Grenouillère: "les unes de Chatou, en amont ; les autres de Bougival, en aval" |
| The Maison Fournaise existed and hired boats in 1869 | verified | fr WP Fournaise: "En 1857, Alphonse Fournaise, maître de pont, rachète le tout pour y ouvrir un restaurant ... et une location de bateaux" |
| Renoir went there in 1869 | unverified | No fetched source dates his first visit |
| What the Maison Fournaise looked like in 1869 | unverified | The orange-and-white striped awning is in the Luncheon of the Boating Party of 1880 to 1881 (seen in `images/boating_party.jpg`); whether it hung there in 1869 is not known. The house in the level is a general impression |

### 8. Period detail

| Claim | Status | Source and note |
|---|---|---|
| Rowing boats for hire | verified for 1869 | Met entry: "rowboats for rent"; the painted sign "LOCATION CANOTS" |
| Sailing boats | verified for 1869 | NG: the lost Salon picture "included other details such as sailing boats". Nationalmuseum text on the Stockholm Renoir: "Some are in boats, rowing or sailing on the river". Two white sails stand at the left of Renoir's picture (seen in the image) |
| Yoles, skiffs, périssoires | verified for 1881, not 1869 | Maupassant: "Des flottes de yoles, de skifs, de périssoires, de podoscaphes, de gigs". Not used |
| Steam launches, tugs | unverified | Nothing fetched puts a steam vessel on this arm in 1869. Left out of the level |
| Bathing costume | verified | Met entry: "the long black bathing costumes in fashion in the 1860s on the women"; "shirtless swimmers" |
| Other dress | verified | Met entry: "top-hatted men in white pants and women in crinolined long skirts" |
| The railway | verified | fr WP: Chatou station opened October 1837; Rueil in 1844. No Bougival station on this line. Not used |

### 9. Which arm, which bank

| Claim | Status | Source and note |
|---|---|---|
| The café lay on the Rueil side of the island | partly verified; sources conflict | For: fr WP island, "sur la rive, côté Rueil"; Maupassant, "Là-bas, en face, l'inévitable Mont-Valérien". Against: the Grenouillère museum says the place was buried in 1928 by "l'élargissement du bras droit de la Seine", the Croissy arm |
| The far bank in Monet's picture | unverified | No fetched source names it |

## Corrections to the brief

1. The quotation of the letter of 25 September 1869 is the Met's English wording. It is a translation; the French original was not recovered.
2. "Summer and early autumn": the sources say summer. The last fixed date is 25 September.
3. Renoir's letter about not eating every day could not be found.
4. "Bain à la Grenouillère" is not the Met's title for its picture: the museum calls it La Grenouillère.
5. Renoir at the Maison Fournaise in 1869: unverified. The house was there and hiring boats from 1857.
6. Steam launches at La Grenouillère in 1869: unverified, and left out.
7. Maupassant's yoles and périssoires are of 1881; for 1869 the sources give only hired rowing boats and sailing boats.
8. The tree on the Camembert: no source names the species.
9. Which side of the island the café lay on is disputed between the sources.
10. Wikidata dates the Stockholm Renoir 1875. It is 1869.

## Choices made for play (not facts)

- The row is about 440 m. The real distance from the Maison Fournaise to La Grenouillère is about 1.5 km by water: the level shortens it to under a third. The start is called a boat-hirer's landing at Chatou; that it is the Fournaise's, and that a child could hire a boat there, is the level's supposition. Its house and striped awning are an impression (see 7).
- The river's width (68 m), its bends, its current, the trees on both banks, the rushes, and which bank is which are invented. The sources disagree about which arm of the Seine the café lay in (see 9), so the level does not say.
- The sun is placed for the look of the water (a little ahead of the boat going downstream, so that it glitters), not computed for a date and hour.
- The layout at La Grenouillère is taken by eye from the two pictures: the painters' standpoint, an islet about 8 m across some 21 m out, the café's lettered side about 13 m off to the right, the long gangplank coming in to the bank on the left, the short one to the café. No plan or measurement was found. The camera stands 2.3 m above the bank, higher than a man's eye, to get the pictures' downward view of the boats. Renoir's figures are drawn about a quarter larger than life in his tableau, because he painted them larger against the islet than Monet did.
- The letters hidden by the white cloth in Monet's picture are supplied as "ON DE" (LOCATION DE CANOTS). The Met reads the sign as LOCATI[ON] CANOT[S].
- The café's gangway to the bank, the landing stage where the boat ties up, the gold ring, the tables on the café's deck and everything out of the pictures' frames are invented.
- In Monet's picture a man in a tall hat stands on the short plank. While the child is walking he stands beside it, so that she can pass.
- The other boats, the bathers out in the stream and the sailing boat on the river are there to be steered round. Rowing boats, sailing boats and bathers are all attested for 1869 (see 8); their number and places are invented. No steam launch, since none could be supported.
- The islet tree's kind is not known; it is drawn as the pictures show it, a tall thin trunk with its leaves high.
- The child, and what she wears, are invented. The painters' hats and what they say ("Hush! Stand here, and look where we are looking.") are invented. The only words of 1869 the level uses are Monet's, from the letter of 25 September, in the Met's translation.
- The dress of the company is coloured by eye from the pictures; its cut is an impression. The rower's white singlet is after the Luncheon of the Boating Party, twelve years later.
- Scoring: a clean catch (a stroke taken as the oars come forward, in time with the last) pays 2 through the shared score; a touch against a boat or bather costs 5.
