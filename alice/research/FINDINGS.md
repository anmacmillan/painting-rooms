# Alice after Tenniel: what was checked, and against what

Checked 15 Nov 2026 for `alice/street.html`. Texts saved in this folder: `gutenberg_11_alice.txt` (Project Gutenberg ebook 11, the full text),
and plain-text extracts of Wikipedia articles through its API, each headed with its revision number and date (`wp_*.txt`).
Wikipedia is a secondary source: where a claim rests on it alone, that is said. The British Library and Christ Church pages were not consulted
(beyond the British Library scans that Wikimedia Commons hosts).

Status words: **verified** (read in a saved source), **partly verified** (the source supports part, or only one secondary sentence supports it), **unverified** (not found; not used as fact in the level).

## The book and the pictures

| Claim | Source | Status |
|---|---|---|
| *Alice's Adventures in Wonderland* is an 1865 novel by Lewis Carroll | `wp_Alices_Adventures_in_Wonderland.txt`, lead | verified (Wikipedia) |
| Lewis Carroll was the pen name of Charles Lutwidge Dodgson, mathematician | `wp_Lewis_Carroll_summary.txt` | verified (Wikipedia) |
| He held the Christ Church Mathematical Lectureship from 1855 for 26 years and stayed at Christ Church until his death | `wp_Lewis_Carroll.txt` line 14 | verified (Wikipedia). The level does not say it |
| John Tenniel provided 42 wood-engraved illustrations for the 1865 edition | `wp_Alices_Adventures_in_Wonderland.txt` lines 3 and 99 | verified (Wikipedia). Used on the end card |
| The illustrations were cut in wood by the Brothers Dalziel | `wp_Brothers_Dalziel.txt`: "They cut the illustrations to … Lewis Carroll's Alice in Wonderland and Through the Looking-Glass" | verified (Wikipedia). Used on the plate captions and end card |
| The story was first told on 4 July 1862, on a rowing trip up the Isis (the Thames at Oxford) from Folly Bridge to Godstow, to Lorina, Alice and Edith Liddell; the Rev. Robinson Duckworth was also in the boat | `wp_Alices_Adventures_in_Wonderland.txt` lines 12 and 14 | verified (Wikipedia). Not used in the level |
| The first print run of 1865 (2,000 copies) was withdrawn because Tenniel objected to the printing; the book was reprinted by Richard Clay and issued in November 1865, a further edition carrying the date 1866 | same file, lines 99, 108, 110 | verified (Wikipedia). "1865" is the date of the pictures and of first publication; the level says "1865" |
| Tenniel died on 25 February 1914 | `wp_John_Tenniel.txt` line 79 | verified (Wikipedia) |
| Carroll died in 1898 | `wp_Lewis_Carroll_summary.txt` ("1832–1898") | verified (Wikipedia) for the year. The day was not found in the saved extract: unverified, not used |
| Text and pictures are in the public domain | Follows from the death dates; Commons marks every file used "Public domain" (`commons_imageinfo.json`, `commons_imageinfo2.json`); Gutenberg distributes the text | verified as far as those sources go; not a legal opinion |

## Alice's dress, hair and stockings

| Claim | Source | Status |
|---|---|---|
| The 1865 plates are uncoloured | The plates themselves (`../images/*.jpg`): black line only | verified by looking |
| In *The Nursery "Alice"* (1889/90) twenty of the illustrations were enlarged and coloured by Tenniel himself; printed in colour by Edmund Evans | `wp_The_Nursery_Alice.txt`; `wp_Alice_Alices_Adventures_in_Wonderland.txt` line 22 | verified (Wikipedia) |
| There her dress is yellow, with blue stockings | Same line 22 ("her dress is yellow, with blue stockings"); and seen in `nursery_alice_drinkme_1890.jpg` (Commons "Alice drink me.jpg"): yellow dress, white pinafore edged in blue with a blue bow behind, blue stockings, a blue bow in fair hair | verified (Wikipedia, and by looking at the plate) |
| The blue dress came later: in 1911 Harry Theaker coloured sixteen plates for Macmillan, with a blue dress | `wp_Alices_Adventures_in_Wonderland.txt` line 103 | partly verified (one Wikipedia sentence; no primary source seen). The end card says only "The famous blue dress came later" |
| Tenniel changed her clothes for the sequel (1871): horizontal-striped stockings instead of plain ones, a more ornate pinafore with a bow | `wp_Alice_Alices_Adventures_in_Wonderland.txt` line 21 | verified (Wikipedia). So no striped stockings here |
| The pinafore was Tenniel's own detail; Carroll suggested long, light-coloured hair | same file, line 19 | verified (Wikipedia) |
| The hair band ("Alice band") | Wikipedia says the band is named after her as Tenniel drew her (line 27) without saying in which book. In the four 1865 plates staged here her hair is loose and swept back with no band visible | partly verified. The model has no band |

**What the level does.** Her cut follows the 1865 plates (short puffed sleeves, full skirt to the knee with two tucks, a bibbed pinafore with a pocket, dark shoes, long loose fair hair, no band).
Her colours follow the 1890 colouring by Tenniel: yellow dress, white pinafore with a blue edge, blue stockings. The blue hair-bow, the bow behind and the pleats of 1890 are left out, because they are not in the 1865 drawings. The end card says so in short.

## The words spoken and shown (all from `gutenberg_11_alice.txt`; chapter, then line in that file)

Words in double quotation marks on screen are Carroll's. Where the narrator's "said Alice" falls inside a speech it is left out and the two halves are joined; "…" marks a sentence begun or ended part way.
Sentences on screen without quotation marks are the game's own (the controls, "It is locked.", "There is an open cupboard lower down, on the right…").

| On screen | Chapter | Line |
|---|---|---|
| "Oh dear! Oh dear! I shall be late!" (Rabbit) | I | 75-76 |
| "…burning with curiosity, she ran across the field after it." | I | 82-83 |
| "In another moment down went Alice after it, never once considering how in the world she was to get out again." | I | 86-87 |
| "Either the well was very deep, or she fell very slowly…" | I | 94 |
| the sides of the well "filled with cupboards and book-shelves; here and there she saw maps and pictures hung upon pegs" (what the well is built from) | I | 98-100 |
| "…it was labelled 'ORANGE MARMALADE', but to her great disappointment it was empty: she did not like to drop the jar for fear of killing somebody underneath…" and "…so managed to put it into one of the cupboards as she fell past it." | I | 101-104 |
| "Well! after such a fall as this, I shall think nothing of tumbling down stairs!" (joined across "thought Alice to herself") | I | 106-107 |
| "Do cats eat bats? Do cats eat bats?" | I | 141 |
| "…thump! thump! down she came upon a heap of sticks and dry leaves, and the fall was over." | I | 147-148 |
| "Oh my ears and whiskers, how late it's getting!" (Rabbit); "…she turned the corner, but the Rabbit was no longer to be seen." | I | 153-156 |
| "a long, low hall, which was lit up by a row of lamps hanging from the roof"; "There were doors all round the hall, but they were all locked…" (the hall as built) | I | 157-160 |
| "…a little three-legged table, all made of solid glass; there was nothing on it except a tiny golden key." | I | 165-166 |
| "…a low curtain she had not noticed before, and behind it was a little door about fifteen inches high." | I | 170-171 |
| "…she knelt down and looked along the passage into the loveliest garden you ever saw." | I | 175-176 |
| "Oh, how I wish I could shut up like a telescope!" | I | 180-181 |
| "…this time she found a little bottle on it, ('which certainly was not here before,' said Alice)…"; the label DRINK ME | I | 189-192 |
| "What a curious feeling! I must be shutting up like a telescope." (joined across "said Alice;"); ten inches high | I | 218-221 |
| "…alas for poor Alice! when she got to the door, she found she had forgotten the little golden key…" | I | 232-233 |
| "…she could see it quite plainly through the glass…" and "Soon her eye fell on a little glass box that was lying under the table."; the cake marked EAT ME | I | 235, 251-253 |
| "Curiouser and curiouser! … now I'm opening out like the largest telescope that ever was! Good-bye, feet!" | II | 281-283 |
| "Just then her head struck against the roof of the hall: in fact she was now more than nine feet high…" and "…she at once took up the little golden key and hurried off to the garden door." | II | 302-304 |
| "…to get through was more hopeless than ever: she sat down and began to cry again." | II | 307-308 |
| the pool "about four inches deep and reaching half down the hall" (as built) | II | 313-314 |
| the Rabbit "with a pair of white kid gloves in one hand and a large fan in the other"; "Oh! the Duchess, the Duchess! Oh! won't she be savage if I've kept her waiting!"; "If you please, sir—"; "The Rabbit started violently, dropped the white kid gloves and the fan, and skurried away into the darkness as hard as he could go." | II | 317-325 |
| "…she soon found out that the cause of this was the fan she was holding…" | II | 380-381 |
| "I wish I hadn't cried so much!" | II | 403 |
| "Would you tell me, please, which way I ought to go from here?" / "That depends a good deal on where you want to get to." | VI | 1488-1490 |
| "In that direction lives a Hatter: and in that direction lives a March Hare. Visit either you like: they're both mad." | VI | 1503-1505 |
| "…we're all mad here. I'm mad. You're mad." | VI | 1510-1511 |
| "…it vanished quite slowly, beginning with the end of the tail, and ending with the grin, which remained some time after the rest of it had gone." | VI | 1563-1565 |
| the March Hare's house: "the chimneys were shaped like ears and the roof was thatched with fur" (as built) | VI | 1571-1572 |
| "a table set out under a tree in front of the house"; "the three were all crowded together at one corner of it"; "No room! No room!"; "There's plenty of room!"; "a large arm-chair at one end of the table" | VII | 1586-1596 |
| "Why is a raven like a writing-desk?" (Hatter) | VII | 1621 |
| "…she found herself at last in the beautiful garden, among the bright flower-beds and the cool fountains." | VII (end) | 1920-1922 |

| "Alice was beginning to get very tired of sitting by her sister on the bank…" (her sister reading: "the book her sister was reading") | I | 60-62 |
| "Well, I'll eat it, and if it makes me grow larger, I can reach the key; and if it makes me grow smaller, I can creep under the door…" (joined across "said Alice") | I | 253-255 |
| "Alice took up the fan and gloves, and, as the hall was very hot, she kept fanning herself…" | II | 327-328 |
| "It's the stupidest tea-party I ever was at in all my life!"; "Just as she said this, she noticed that one of the trees had a door leading right into it."; "That's very curious! But everything's curious today. I think I may as well go in at once." (joined across "she thought") | VII | 1907-1913 |
| "A large rose-tree stood near the entrance of the garden: the roses growing on it were white, but there were three gardeners at it, busily painting them red." | VIII | 1930-1932 |
| "Look out now, Five! Don't go splashing paint over me like that!" (Two); "I couldn't help it, Seven jogged my elbow." (Five; joined across "said Five, in a sulky tone") | VIII | 1934-1938 |
| "Would you tell me, why you are painting those roses?" (joined across "said Alice, a little timidly"); "…this here ought to have been a red rose-tree, and we put a white one in by mistake…" (Two) | VIII | 1957-1961 |
| "The Queen! The Queen!" (Five); "…and the three gardeners instantly threw themselves flat upon their faces." | VIII | 1964-1966 |
| "What's your name, child?" / "My name is Alice, so please your Majesty." | VIII | 1996-1998 |
| "Off with her head! Off—" / "Nonsense!" (in the book this follows "And who are these?" and Alice's "How should I know? It's no business of mine."; the game leaves that exchange out) | VIII | 2003-2015 |
| "Can you play croquet?" / "Yes!" / "Come on, then!" | VIII | 2052-2060 |
| "…the balls were live hedgehogs, the mallets live flamingoes, and the soldiers had to double themselves up and to stand on their hands and feet, to make the arches."; the ground "all ridges and furrows" (as built) | VIII | 2087-2090 |
| "…it would twist itself round and look up in her face, with such a puzzled expression that she could not help bursting out laughing…"; "…it was very provoking to find that the hedgehog had unrolled itself, and was in the act of crawling away…"; "…the doubled-up soldiers were always getting up and walking off to other parts of the ground…"; "…Alice soon came to the conclusion that it was a very difficult game indeed." | VIII | 2092-2104 |
| "Off with his head!" / "Off with her head!" (the Queen, "about once in a minute") | VIII | 2109-2110 |
| "…she noticed a curious appearance in the air… she made it out to be a grin, and she said to herself 'It's the Cheshire Cat: now I shall have somebody to talk to.'"; "How are you getting on?" (the Cat) | VIII | 2118-2125 |

## Where the game departs from the book (said on the end card)

- In the book she takes the key at once, cannot get through, drinks, has left the key on the table, eats, takes the key, cries, and is shrunk by the fan; then the key is on the table again and she swims in the pool (Ch. II). She reaches the garden only at the end of Ch. VII. In the game she keeps the key in her hand when the fan shrinks her and goes straight through.
- The Cheshire Cat's tree (Ch. VI) and the tea-party (Ch. VII, before the March Hare's house) are not in the garden beyond the little door. The game puts them along one path beyond it.
- The Rabbit does not go through the little door in the book: he is simply gone when she turns the corner. In the game the curtain stirs as he vanishes.
- After the tea-party the game follows the book again: the tree with a door in it (Ch. VII), then the garden with the rose-tree, the gardeners, the Queen and the croquet-ground (Ch. VIII). The book goes by way of the hall once more; the game goes straight from the tree to the garden. The procession is cut down to the Queen and two soldiers (the book has ten soldiers, ten courtiers, the royal children, guests, the White Rabbit, the Knave and the King), and the gardeners are left lying where they threw themselves down (in the book Alice hides them in a flower-pot).
- Helping to paint the roses by leaping, the long low bench across the hall (small she goes under it, large she steps over it, at her own size she leaps it), the glint on the key, cake and fan, and the camera's glance at them when she stands still are the game's own.
- Alice's sister on the bank is from the text; no plate of 1865 shows her, so her figure and dress are an impression.
- The gold sovereigns, the shelves that bump her, falling slower by holding the leap key, and the mushrooms that bounce are the game's own. (The book's mushroom is the Caterpillar's, Ch. V.)
- The glass table is drawn at the height the DRINK ME plate gives it (the top at her waist); the key and the cake are drawn larger than "tiny" and "very small" so that they can be seen.
- Sizes: ten inches (0.2 of her height in the game) and "more than nine feet" (2.2 times) follow the book; her ordinary height is not given by the book.
- A sovereign is a British gold coin of one pound, struck since 1817 and then a circulating coin (`wp_Sovereign_British_coin_summary.txt`): verified (Wikipedia). Gold was chosen over the silver shilling so that the coins read as coloured in a black-and-white world.

## The plates (downloaded 15 Nov 2026 from Wikimedia Commons, reduced to 1400 px on the long side)

All nine are scans from the German edition of 1869 (*Alice's Abenteuer im Wunderland*, translated by Antonie Zimmermann, "Illustrationen: John Tenniel"; Commons credits "pdf from gasl.org", dated 1869, public domain).
They were chosen over the Commons set "Alice par John Tenniel NN.png" (described there as from the 1865 edition) because that set is smaller than 1400 px.
That the German edition was printed from Tenniel's original blocks or from electrotypes of them is **unverified**; the drawings are plainly the same as the 1865 plates.

| File in `alice/images/` | Subject | Commons file (https://commons.wikimedia.org/wiki/File:…) | Original (px) | Used as |
|---|---|---|---|---|
| `rabbit.jpg` (976 × 1400) | The White Rabbit with his watch (Ch. I) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_02.jpg` | 1877 × 2692 | title, card image, tableau 1 |
| `curtain.jpg` (1400 × 1386) | Alice at the curtain and the little door (Ch. I) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_03.jpg` | 1962 × 1942 | reference only (not staged) |
| `drinkme.jpg` (1110 × 1400) | Alice with the bottle (Ch. I) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_04.jpg` | 1885 × 2377 | tableau 2 |
| `rabbit_fan.jpg` (1162 × 1400) | The Rabbit scurrying from the giant Alice (Ch. II) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_06.jpg` | 2669 × 3215 | reference only |
| `cheshire.jpg` (1039 × 1400) | The Cheshire Cat in the tree (Ch. VI) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_23.jpg` | 2808 × 3785 | tableau 3 |
| `teaparty.jpg` (1400 × 1083) | A Mad Tea-Party (Ch. VII) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_25.jpg` | 2646 × 2046 | tableau 4 |
| `gardeners.jpg` (1038 × 1400) | The gardeners painting the roses (Ch. VIII) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_28.jpg` | 1877 × 2531 | tableau 5 |
| `flamingo.jpg` (962 × 1400) | Alice with the flamingo and the hedgehog (Ch. VIII) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_30.jpg` | 2663 × 3875 | tableau 6, end card. This scan has a cream ground where the others are white: it was converted to grey and its levels stretched so that the paper prints white (no retouching) |
| `queen.jpg` (1199 × 1400) | The Queen of Hearts and Alice in the garden (Ch. VIII) | `De_Alice's_Abenteuer_im_Wunderland_Carroll_pic_29.jpg` | 2746 × 3208 | reference only (the Queen's robe) |

The three added on 16 Nov 2026 were fetched as Commons' 1280 px thumbnails of those files and reduced. Two more small references are kept in this folder, not shown in the game: `ref_hatter_330.jpg` (pic 26, the Hatter with his teacup) and `ref_hare_dormouse_330.jpg` (pic 27, the Hare and the Hatter putting the Dormouse into the teapot).

Colour references kept in this folder, not shown in the game: `nursery_alice_drinkme_1890.jpg` (Commons "Alice drink me.jpg", from *The Nursery "Alice"*, public domain) and
`nursery_alice_rabbit_1890.jpg` (Commons "The White Rabbit (Tenniel) - The Nursery Alice (1890) - BL.jpg", British Library, CC0).
Requests were made with the User-Agent "painting-rooms-research/1.0 (educational browser game; public-domain sources)".

## What the figures wear, and where that comes from

- The White Rabbit: checked jacket, waistcoat with buttons, wing collar, watch on a chain, umbrella under the arm: read by eye from `rabbit.jpg`. The text gives only the waistcoat-pocket and the watch (Ch. I), then the gloves and fan (Ch. II).
- The Hatter: tall hat with the ticket "In this Style 10/6", spotted bow tie, dark coat, check below: read by eye from `teaparty.jpg`. The March Hare's straw on its head and its bow, the Dormouse asleep between them, Alice in a large arm-chair: the same plate, and Ch. VII.
- The Cheshire Cat: striped, lying along a bough with its tail hanging: `cheshire.jpg`.
- The card gardeners (Two, Five and Seven, as the text names them; spades, hoods, striped hose, brushes and a paint-pot) and the standard rose-tree: `gardeners.jpg`. The soldiers are clubs because the text says they carried clubs; their pips are otherwise an impression. The Queen's robe and crown: read by eye from `queen.jpg`. The flamingo and the hedgehog, rolled up and walking: `flamingo.jpg`.
- Alice's face is painted after the plates (large eyes under heavy lids, a small unsmiling mouth); the Hatter's is drawn in line after `ref_hatter_330.jpg` and `teaparty.jpg`.
- Nothing here uses any film, later illustrator or modern edition.
